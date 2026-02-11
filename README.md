# Kaggle Runner VSCode Extension

Run Jupyter notebooks and Python scripts directly on Kaggle cloud from VSCode.

[📦 Install Extension](https://marketplace.visualstudio.com/)
[🚀 Quick Start](#-quick-start)
[📖 Features](#-features)

---

## ✨ What's New

| Feature                     | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| 🖥️ **Real-time Status Bar** | Live status: Queued → Running → Completed                |
| 🔄 **Smart Polling**        | Auto-check run status, continue monitoring after timeout |
| 🏠 **New Home View**        | Sidebar quick access to all features                     |
| 🔐 **Credential Auto-save** | Login once, credentials saved automatically              |
| 🐛 **Bug Fixes**            | Windows compatibility, kernel metadata, status detection |

---

## 🚀 Quick Start

### 1. Install Extension

Search "Kaggle Runner" in [VSCode Marketplace](https://marketplace.visualstudio.com/) and install

### 2. Sign In to Kaggle

- Open VSCode
- Press `Ctrl+Shift+P` → Type `Kaggle: Sign In`
- Enter your Kaggle Username and API Key

### 3. Initialize Project (Optional)

- Click the Kaggle icon in the sidebar
- Click **📦 Init Project** in Home view
- Or use command: `Kaggle: Init Project`

### 4. Run Notebook

- Open `.ipynb` file
- Click the 🚀 rocket icon in the top-right
- Watch the status bar for progress

---

## 🎯 Features

### Core Functions ☁️

| Function                 | Description                                 |
| ------------------------ | ------------------------------------------- |
| ☁️ Cloud Run             | One-click push notebook/script to Kaggle    |
| ⚡ GPU/TPU               | Configure hardware accelerator              |
| 📊 Real-time Status      | Status bar shows run progress               |
| 📥 Auto Download         | Auto-download output files after completion |
| 🔐 Credential Management | Securely store Kaggle API keys              |

### Smart Optimizations 🚀

| Function                    | Description                               |
| --------------------------- | ----------------------------------------- |
| 🖥️ Real-time Status Bar     | Live feedback on run status               |
| 🔄 Smart Background Polling | Auto-check status, continue after timeout |
| 🏠 Home View                | Quick sidebar access                      |
| 🔐 Auto Credential Save     | Login once, auto-use thereafter           |

### Productivity Tools 🛠️

| Function               | Description                             |
| ---------------------- | --------------------------------------- |
| 📦 Project Init        | Quickly create Kaggle project structure |
| 📓 Notebook Management | Browse and pull notebooks               |
| 📊 Dataset Browsing    | Explore Kaggle datasets                 |
| 🏆 Competition List    | View available competitions             |
| 📋 Run History         | View historical runs                    |

---

## 🔧 Configuration

### VSCode Settings

Search "Kaggle" in settings:

| Setting                         | Default           | Description                |
| ------------------------------- | ----------------- | -------------------------- |
| `kaggle.defaultAccelerator`     | `none`            | Default accelerator        |
| `kaggle.defaultInternet`        | `false`           | Enable internet by default |
| `kaggle.outputsFolder`          | `.kaggle-outputs` | Output directory           |
| `kaggle.autoDownloadOnComplete` | `true`            | Auto-download outputs      |
| `kaggle.pollIntervalSeconds`    | `10`              | Polling interval (seconds) |
| `kaggle.pollTimeoutSeconds`     | `600`             | Timeout (seconds)          |
| `kaggle.cliPath`                | `kaggle`          | Kaggle CLI path            |

### Command List

| Command                     | Description           |
| --------------------------- | --------------------- |
| `kaggle.signIn`             | Sign in to Kaggle     |
| `kaggle.signOut`            | Sign out              |
| `kaggle.initProject`        | Initialize project    |
| `kaggle.runCurrentNotebook` | Run current notebook  |
| `kaggle.pushRun`            | Push and run          |
| `kaggle.downloadOutputs`    | Download output files |

---

## 📊 From Original to Optimized

### Original Problems vs Our Solutions

| Problem                                | Solution                                      |
| -------------------------------------- | --------------------------------------------- |
| ❌ Windows command args parsing failed | `exec()` → `execFile()`, cross-platform       |
| ❌ Notebook missing kernel metadata    | Auto-detect and add kernelspec                |
| ❌ Runs status not updating            | Smart status detection based on time & output |
| ❌ Polling without status feedback     | Real-time status bar + notifications          |
| ❌ Repeated username input             | Auto-read from saved credentials              |
| ❌ Stop monitoring after timeout       | Continue checking every 30s                   |
| ❌ Credentials not persisted           | VSCode Secrets API encryption                 |

### Core Workflow Optimization

```
Original:
Push → ❌ No feedback → ❌ Status not updating → Manual check

Optimized:
Push → 📊 Status bar → 🔄 Background polling → ✅ Auto completion notification
```

---

## 🔧 Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                    VSCode                                │
├─────────────────────────────────────────────────────┤
│  Kaggle Runner Extension                                │
│  ├── 🏠 Home View (NEW)                               │
│  ├── 🏃 Runs View                                      │
│  ├── 📓 My Notebooks View                              │
│  ├── 📊 Datasets View                                  │
│  ├── 🏆 Competitions View                              │
│  ├── 🖥️ Status Bar Integration (NEW)                  │
│  └── ⚙️ Smart Configuration                           │
├─────────────────────────────────────────────────────┤
│                   Kaggle CLI                             │
│  ├── kernels push    Push & run                        │
│  ├── kernels status  Query status ← Smart polling     │
│  ├── kernels output  Download output                   │
│  ├── datasets list   Dataset list                      │
│  ├── competitions   Competition list                   │
│  └── notebooks list  Notebook list                     │
├─────────────────────────────────────────────────────┤
│                  Kaggle API                              │
│               https://www.kaggle.com/api               │
└─────────────────────────────────────────────────────┘
```

### Core Workflow

```
User Action           System Response
────────────────────────────────────
Click Run        →    Status bar: 📤 Pushing
               →    Notification: Uploading
               →    Status bar: 🕐 Queued
               →    Background polling
               →    Status bar: 🔄 Running
               →    Completion notification
               →    Auto-download outputs
```

---

## ❓ FAQ

### Q: How to get Kaggle API Key?

1. Sign in to [Kaggle.com](https://www.kaggle.com)
2. Click avatar → Settings → API
3. Click "Create New Token"

### Q: Is credential storage secure?

Yes, using VSCode Secrets API encryption, local-only access.

### Q: Does it support Windows?

Yes, full support for Windows/macOS/Linux.

### Q: Can I run Python scripts?

Yes, supports both `.ipynb` and `.py` files.

### Q: Status bar not updating?

Make sure:

1. Signed in to Kaggle correctly
2. Network connection normal
3. Kaggle CLI installed (`kaggle --version`)

---

## 🤝 Contributing

Welcome contributions!

### Development

```bash
git clone https://github.com/CuiPenghub/vscode-kaggle-runner.git
cd vscode-kaggle-runner
npm install
npm run watch
```

### Testing

```bash
npm test
```

### Build

```bash
npm run build
```

### Release

```bash
npm run release
```

### Before PR

- [ ] All tests pass
- [ ] ESLint checks pass
- [ ] Documentation updated

---

## 📧 Contact

**Author**: Peng Cui

**Email**: 1466246366@qq.com

**GitHub**: [@CuiPenghub](https://github.com/CuiPenghub)

**Issues**: [GitHub Issues](https://github.com/CuiPenghub/vscode-kaggle-runner/issues)

---

## 🙏 Acknowledgments

This project is based on [DataQuanta/vscode-kaggle-extension](https://github.com/data-quanta/vscode-kaggle-extension).

Thanks to original author Amin Vakhshouri for the contribution. This project builds upon it with deep optimizations and bug fixes.

---

**Like this extension?**

⭐ Star us on [GitHub](https://github.com/CuiPenghub/vscode-kaggle-runner)

⭐ Rate us on [VSCode Marketplace](https://marketplace.visualstudio.com/)

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file
