# AGENTS.md - Kaggle Studio VSCode Extension

This document provides guidelines for AI agents working on the Kaggle Studio VSCode extension.

## Project Overview

Kaggle Studio is a VSCode extension that enables running Jupyter notebooks and Python scripts on Kaggle's cloud infrastructure. It uses the Kaggle CLI for communication with Kaggle's API and provides tree views for managing notebooks, datasets, competitions, and runs.

## Build, Lint, and Test Commands

### Core Commands

```bash
npm run compile         # Compile TypeScript (tsc -p ./)
npm run watch          # Watch mode compilation
npm run lint           # Lint src/**/*.ts with ESLint
npm run lint:fix       # Lint and auto-fix issues
npm run format         # Format code with Prettier
npm run format:check   # Check formatting without modifying
npm test              # Run test suite (requires compile + lint first)
npm run pretest        # Compile and lint before tests
```

### Single Test Execution

```bash
# Run a specific test file
npm run compile && node ./out/test/suite/kaggleCli.test.js

# Run a specific test (modify the test file to isolate)
```

### Build and Release

```bash
npm run clean           # Remove out/ and *.vsix
npm run prebuild        # Clean, compile, lint, and test
npm run build           # Package VSIX (npx @vscode/vsce package)
npm run release         # Full release (prebuild + build)
npm run publish:marketplace  # Publish to VSCode Marketplace
```

## Code Style Guidelines

### TypeScript Configuration

- **Target**: ES2020
- **Module**: CommonJS
- **Strict mode**: Enabled (`strict: true` in tsconfig.json)
- **Root dir**: `src/`
- **Output dir**: `out/`

### Imports

- Use named imports from core modules: `import * as vscode from 'vscode';`
- Group imports by source (standard library, external, local)
- Sort imports alphabetically within groups
- Use relative imports for local files: `import { OUTPUT } from './utils';`

Example:

```typescript
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { OUTPUT, getWorkspaceFolder, ensureFolder } from './utils';
import { runKaggleCLI, getKaggleCreds } from './kaggleCli';
```

### Formatting (Prettier)

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

### ESLint Rules

Enabled rules in `eslint.config.mjs`:

- `@typescript-eslint/no-unused-vars`: Error (allow `_` prefix)
- `@typescript-eslint/no-explicit-any`: Warning
- `@typescript-eslint/explicit-function-return-type`: Off
- `@typescript-eslint/no-non-null-assertion`: Warning
- `prefer-const`: Error
- `no-var`: Error

### Naming Conventions

- **Files**: kebab-case for general files, PascalCase for components/providers
- **Interfaces**: PascalCase (e.g., `KaggleYml`, `KaggleCredentials`)
- **Functions**: camelCase, descriptive verbs (e.g., `storeApiTokenFromFile`, `getKaggleCreds`)
- **Constants**: UPPER_SNAKE_CASE for runtime constants, camelCase for module-level
- **Commands**: lowercase with dots (e.g., `kaggle.signIn`, `kaggle.runCurrentNotebook`)

### Error Handling

- Use `try/catch` for async operations
- Throw descriptive `Error` objects with context
- Use `showError()` utility for VSCode notifications
- Handle promise rejections explicitly
- Catch non-fatal errors and log them (don't break execution for warnings)

Example:

```typescript
try {
  await getKaggleCreds(context);
  await vscode.commands.executeCommand('setContext', 'kaggle.isSignedIn', true);
} catch {
  await vscode.commands.executeCommand('setContext', 'kaggle.isSignedIn', false);
}
```

### VSCode Extension Patterns

- **Activation**: `export async function activate(context: vscode.ExtensionContext)`
- **Commands**: Register via `vscode.commands.registerCommand`
- **Tree Views**: Implement `TreeDataProvider<T>` interface
- **Secrets**: Use `context.secrets` for API tokens
- **Output**: Use the `OUTPUT` channel from utils.ts
- **Subscriptions**: Push disposables to `context.subscriptions`

### Testing

- Framework: Mocha + Chai
- Location: `src/test/suite/**/*.ts`
- Pattern: Use `suite()` and `test()` with async/await
- Setup: `suiteSetup` for initialization
- Run: `npm test` compiles and runs tests

Example:

```typescript
suite('Extension Test Suite', () => {
  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('kaggle.signIn'));
  });
});
```

### File Structure

```
src/
├── extension.ts        # Main activation and command registration
├── kaggleCli.ts        # CLI interactions and credential management
├── scaffold.ts         # Project initialization
├── utils.ts            # Shared utilities
├── commands/           # Command implementations
├── tree/               # Tree view providers (runs, notebooks, datasets, competitions)
└── test/suite/         # Test files
```

### Git Hooks (Husky + Lint-Staged)

- Pre-commit hooks run `eslint --fix` and `prettier --write` on staged `src/**/*.ts` files
