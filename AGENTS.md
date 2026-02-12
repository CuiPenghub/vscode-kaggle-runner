# AGENTS.md - Guidelines for AI Coding Agents

This document provides guidelines for AI agents working on the Kaggle Runner VSCode extension.

## Project Overview

Kaggle Runner is a VS Code extension that enables running Jupyter notebooks and Python scripts directly on Kaggle cloud. It integrates with Kaggle CLI and provides UI features like tree views, status bar integration, and command palette commands.

## Build, Lint, and Test Commands

### Core Commands

```bash
# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Run tests (local only, requires GUI)
npm test

# Full build (clean + compile + lint + test + package)
npm run build

# Package extension only
npm run build

# Publish to VS Code Marketplace (requires VSCE_TOKEN)
npm run publish:marketplace
```

### Development Workflow

```bash
# Install dependencies
npm install

# Watch mode with hot reload
npm run watch
```

### Running Specific Tests

Tests are located in `src/test/` and run using Mocha. To run a single test file, modify the test command or run directly:

```bash
# Run specific test file (modify npm test script in package.json)
node ./out/test/runTest.js
```

Note: Tests require a GUI environment and will fail in headless CI environments without xvfb-run.

## Code Style Guidelines

### TypeScript Configuration

The project uses `tsconfig.json` with strict mode enabled:

- Target: ES2020
- Module: CommonJS
- Strict mode: enabled
- Source maps: enabled

### ESLint Rules

Key rules from `eslint.config.mjs`:

- `@typescript-eslint/no-explicit-any`: **warn** - Avoid `any` type, use specific types
- `@typescript-eslint/no-unused-vars`: **error** - Prefix unused params with `_`
- `@typescript-eslint/no-non-null-assertion`: **warn** - Avoid `!` assertions when possible
- `prefer-const`: **error** - Use `const` instead of `let` when immutable
- `no-var`: **error** - No legacy `var` declarations

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Naming Conventions

| Element   | Convention           | Example           |
| --------- | -------------------- | ----------------- |
| Files     | kebab-case           | `kaggle-cli.ts`   |
| Classes   | PascalCase           | `KaggleCli`       |
| Functions | camelCase            | `getNotebooks()`  |
| Variables | camelCase            | `isSignedIn`      |
| Constants | SCREAMING_SNAKE_CASE | `DEFAULT_TIMEOUT` |
| Commands  | kebab-case           | `kaggle.signIn`   |
| Views     | camelCase            | `kaggleRunsView`  |

### Imports

```typescript
// Standard library
import { readFile } from 'fs/promises';

// Third-party
import * as vscode from 'vscode';
import { window, commands, workspace } from 'vscode';

// Relative imports
import { KaggleCli } from './kaggleCli';
```

### Error Handling

```typescript
// Use try-catch with proper error messages
try {
  await kaggleCli.runNotebook(uri);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  window.showErrorMessage(`Failed to run notebook: ${message}`);
}

// For async operations, handle rejections
someAsyncFunction().catch(err => {
  console.error('Operation failed:', err);
});
```

### VSCode Extension Patterns

```typescript
// Activate extension
export function activate(context: vscode.ExtensionContext): void {
  const disposable = commands.registerCommand('kaggle.signIn', () => {
    // Command implementation
  });
  context.subscriptions.push(disposable);
}

// Tree view provider
export class KaggleRunsView implements vscode.TreeDataProvider<TreeItem> {
  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }
  getChildren(element?: TreeItem): Thenable<TreeItem[]> {
    // Implementation
  }
}

// Status bar item
const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
statusBar.text = '$(rocket) Kaggle';
statusBar.command = 'kaggle.runCurrentNotebook';
statusBar.show();
```

### File Organization

```
src/
├── extension.ts          # Main extension entry point
├── kaggleCli.ts         # Kaggle CLI wrapper
├── scaffold.ts          # Project scaffolding
├── utils.ts             # Utility functions
├── commands/            # Command implementations
│   └── *.ts
├── tree/                # Tree view providers
│   ├── competitionsProvider.ts
│   ├── datasetsProvider.ts
│   ├── notebooksProvider.ts
│   └── runsProvider.ts
└── test/                # Test files
    └── runTest.ts
```

### Pre-commit Hooks

The project uses Husky with lint-staged:

```json
{
  "lint-staged": {
    "src/**/*.ts": ["eslint --fix", "prettier --write"]
  }
}
```

Before committing, ensure all linting and formatting issues are fixed.

## Git Workflow

1. Create feature branch from `main`
2. Make changes and test locally
3. Commit with descriptive message
4. Push and create Pull Request
5. After merge, create a git tag for release:
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```
6. Create GitHub Release to trigger automated publishing

## Publishing to VS Code Marketplace

Publishing is automated via GitHub Actions (`.github/workflows/publish.yml`):

1. Push a git tag (e.g., `v1.1.0`)
2. Create a GitHub Release with the same tag
3. GitHub Actions will:
   - Build the extension
   - Publish to VS Code Marketplace
   - Upload VSIX as release asset

Requires `VSCE_TOKEN` secret in GitHub repository settings.
