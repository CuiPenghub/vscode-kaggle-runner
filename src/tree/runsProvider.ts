import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { execFile } from 'child_process';
import { getKaggleCreds } from '../kaggleCli';

interface RunItem {
  label: string;
  url?: string;
  status?: 'complete' | 'running' | 'queued' | 'pending' | 'unknown';
  isLatest?: boolean;
  kernelId?: string;
}

export class RunsProvider implements vscode.TreeDataProvider<RunItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private refreshInterval: ReturnType<typeof setInterval> | undefined;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.startAutoRefresh();
  }

  dispose() {
    this.stopAutoRefresh();
  }

  private startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      this._onDidChangeTreeData.fire();
    }, 10000);
    this.context.subscriptions.push({ dispose: () => this.stopAutoRefresh() });
  }

  private stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: RunItem): vscode.TreeItem {
    const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
    if (element.url) {
      item.command = {
        command: 'vscode.open',
        title: 'Open',
        arguments: [vscode.Uri.parse(element.url)],
      };
      item.contextValue = 'run';
      item.tooltip = element.url;
    }
    if (element.isLatest) {
      switch (element.status) {
        case 'complete':
          item.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
          item.description = 'outputs ready';
          item.tooltip = (item.tooltip ? item.tooltip + ' • ' : '') + 'Run completed';
          break;
        case 'running':
          item.iconPath = new vscode.ThemeIcon('sync~spin', new vscode.ThemeColor('charts.blue'));
          item.description = 'running';
          item.tooltip = (item.tooltip ? item.tooltip + ' • ' : '') + 'Run in progress';
          break;
        case 'queued':
          item.iconPath = new vscode.ThemeIcon('clock', new vscode.ThemeColor('charts.yellow'));
          item.description = 'queued';
          item.tooltip = (item.tooltip ? item.tooltip + ' • ' : '') + 'Waiting in queue';
          break;
        case 'pending':
        default:
          item.iconPath = new vscode.ThemeIcon('clock', new vscode.ThemeColor('charts.yellow'));
          item.description = 'waiting';
          item.tooltip = (item.tooltip ? item.tooltip + ' • ' : '') + 'Waiting for outputs';
          break;
      }
    }
    return item;
  }

  getChildren(): Thenable<RunItem[]> {
    const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!root) return Promise.resolve([]);
    const logFile = path.join(root, '.kaggle-run.log');
    return new Promise(async resolve => {
      try {
        const txt = await fs.promises.readFile(logFile, 'utf8');
        const lines = txt.trim().split(/\r?\n/).slice(-50);
        const items: RunItem[] = lines.map(l => {
          const [ts, url] = l.split(/\s+\|\s+/);
          const kernelId = extractKernelId(url);
          return { label: ts, url, kernelId };
        });

        if (items.length > 0) {
          const latest = items[items.length - 1];
          latest.isLatest = true;
          latest.status = await this.getKernelStatus(latest.kernelId);
        }

        resolve(items);
      } catch {
        resolve([]);
      }
    });
  }

  private async getKernelStatus(kernelId?: string): Promise<RunItem['status']> {
    if (!kernelId) {
      return 'unknown';
    }

    try {
      const config = vscode.workspace.getConfiguration('kaggle');
      const cliPath = config.get<string>('cliPath', 'kaggle');

      let env = { ...process.env };
      try {
        const creds = await getKaggleCreds(this.context);
        env = { ...env, KAGGLE_USERNAME: creds.username, KAGGLE_KEY: creds.key };
      } catch {
        // 没有凭证，尝试使用已配置的凭证
      }

      const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        execFile(cliPath, ['kernels', 'status', kernelId], { env }, (error, stdout, stderr) => {
          if (error && !stdout) reject(error);
          resolve({ stdout, stderr });
        });
      });

      const output = result.stdout.toLowerCase();
      if (output.includes('complete') || output.includes('finished')) {
        return 'complete';
      } else if (output.includes('running') || output.includes('processing')) {
        return 'running';
      } else if (output.includes('queued') || output.includes('waiting')) {
        return 'queued';
      } else if (output.includes('error') || output.includes('failed')) {
        return 'unknown';
      }
    } catch {
      // 无法查询状态，尝试基于输出目录判断
    }

    // 回退：检查输出目录
    const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (root) {
      try {
        const ymlPath = path.join(root, 'kaggle.yml');
        const ymlRaw = await fs.promises.readFile(ymlPath, 'utf8').catch(() => '');
        const yml = (ymlRaw ? (yaml.load(ymlRaw) as Record<string, unknown>) : {}) || {};
        const outDir = path.join(
          root,
          ((yml.outputs as Record<string, unknown>)?.download_to as string) || '.kaggle-outputs'
        );
        const has = await hasAnyRecentFile(outDir, 0);
        if (has) return 'complete';
      } catch {
        /* ignore */
      }
    }

    return 'pending';
  }
}

function extractKernelId(url?: string): string | undefined {
  if (!url) return undefined;
  const match = url.match(/kaggle\.com\/(?:kernels\/)?([^/]+\/[^/]+)/);
  return match ? match[1] : undefined;
}

async function hasAnyRecentFile(dir: string, sinceMs: number): Promise<boolean> {
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (await hasAnyRecentFile(p, sinceMs)) return true;
      } else if (e.isFile()) {
        const st = await fs.promises.stat(p);
        if (st.mtimeMs >= sinceMs) return true;
      }
    }
  } catch {
    /* missing dir: treat as no files */
  }
  return false;
}
