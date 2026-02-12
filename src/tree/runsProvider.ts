import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

interface RunItem {
  label: string;
  url?: string;
  status?: 'complete' | 'running' | 'queued' | 'pending' | 'error';
  isLatest?: boolean;
}

export class RunsProvider implements vscode.TreeDataProvider<RunItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private refreshInterval: ReturnType<typeof setInterval> | undefined;
  private context: vscode.ExtensionContext;
  private needsPolling = false;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.startSmartRefresh();
  }

  dispose() {
    this.stopRefresh();
  }

  private startSmartRefresh() {
    if (this.refreshInterval) return;
    this.refreshInterval = setInterval(() => {
      this._onDidChangeTreeData.fire();
    }, 10000);
    this.context.subscriptions.push({ dispose: () => this.stopRefresh() });
  }

  stopRefresh() {
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
          this.needsPolling = false;
          break;
        case 'running':
          item.iconPath = new vscode.ThemeIcon('sync~spin', new vscode.ThemeColor('charts.blue'));
          item.description = 'running';
          item.tooltip = (item.tooltip ? item.tooltip + ' • ' : '') + 'Run in progress';
          this.needsPolling = true;
          break;
        case 'queued':
          item.iconPath = new vscode.ThemeIcon('clock', new vscode.ThemeColor('charts.yellow'));
          item.description = 'queued';
          item.tooltip = (item.tooltip ? item.tooltip + ' • ' : '') + 'Waiting in queue';
          this.needsPolling = true;
          break;
        case 'pending':
          item.iconPath = new vscode.ThemeIcon('clock', new vscode.ThemeColor('charts.yellow'));
          item.description = 'waiting';
          item.tooltip = (item.tooltip ? item.tooltip + ' • ' : '') + 'Waiting for outputs';
          this.needsPolling = false;
          break;
        case 'error':
          item.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('charts.red'));
          item.description = 'error';
          item.tooltip =
            (item.tooltip ? item.tooltip + ' • ' : '') + 'Run failed - Check RUN_ERROR.log';
          this.needsPolling = false;
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
          return { label: ts, url };
        });

        if (items.length > 0) {
          const latest = items[items.length - 1];
          latest.isLatest = true;
          latest.status = await this.detectRunStatus(root, latest.label);
        }

        resolve(items);
      } catch {
        resolve([]);
      }
    });
  }

  private async detectRunStatus(root: string, runTime: string): Promise<RunItem['status']> {
    const runTimestamp = new Date(runTime).getTime();
    const now = Date.now();
    const timeDiffMinutes = (now - runTimestamp) / (1000 * 60);

    try {
      const ymlPath = path.join(root, 'kaggle.yml');
      const ymlRaw = await fs.promises.readFile(ymlPath, 'utf8').catch(() => '');
      const yml = (ymlRaw ? (yaml.load(ymlPath) as Record<string, unknown>) : {}) || {};
      const outDir = path.join(
        root,
        ((yml.outputs as Record<string, unknown>)?.download_to as string) || '.kaggle-outputs'
      );

      const errorLogPath = path.join(root, 'RUN_ERROR.log');
      if (await exists(errorLogPath)) {
        const errorStat = await fs.promises.stat(errorLogPath);
        if (errorStat.mtimeMs >= runTimestamp) {
          return 'error';
        }
      }

      const hasOutputs = await hasRecentOutputs(outDir, runTimestamp);

      if (hasOutputs) {
        return 'complete';
      }

      if (timeDiffMinutes < 2) {
        return 'running';
      } else if (timeDiffMinutes < 10) {
        return 'queued';
      } else {
        return 'pending';
      }
    } catch {
      if (timeDiffMinutes < 2) {
        return 'running';
      }
      return 'pending';
    }
  }
}

async function hasRecentOutputs(dir: string, sinceMs: number): Promise<boolean> {
  try {
    if (!(await exists(dir))) return false;

    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const e of entries) {
      const p = path.join(dir, e.name);

      if (e.name === '.gitkeep' || e.name.startsWith('.')) continue;

      if (e.isDirectory()) {
        if (await hasRecentOutputs(p, sinceMs)) return true;
      } else if (e.isFile()) {
        const st = await fs.promises.stat(p);
        if (st.mtimeMs >= sinceMs && st.size > 0) return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.promises.access(p);
    return true;
  } catch {
    return false;
  }
}
