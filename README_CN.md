# Kaggle Runner VSCode 扩展

在 VSCode 中直接运行 Jupyter notebooks 和 Python 脚本到 Kaggle 云端。

[📦 安装扩展](https://marketplace.visualstudio.com/)
[🚀 快速开始](#-快速开始)
[📖 功能特性](#-功能特性)

---

## ✨ 新版本特性

| 特性                  | 描述                                           |
| --------------------- | ---------------------------------------------- |
| 🖥️ **状态栏实时显示** | 推送后状态栏实时显示：等待队列 → 运行中 → 完成 |
| 🔄 **智能轮询机制**   | 后台自动检查运行状态，超时后继续监控           |
| 🏠 **全新 Home 视图** | 侧边栏快速入口，所有功能一触即达               |
| 🔐 **凭证自动保存**   | 登录一次，凭证自动保存，下次无需重复输入       |
| 🐛 **全面 Bug 修复**  | Windows 兼容、内核元数据、状态检测等           |

---

## 🚀 快速开始

### 1. 安装扩展

从 [VSCode Marketplace](https://marketplace.visualstudio.com/) 搜索 "Kaggle Runner" 安装

### 2. 登录 Kaggle

- 打开 VSCode
- 按 `Ctrl+Shift+P` → 输入 `Kaggle: Sign In`
- 输入 Kaggle Username 和 API Key

### 3. 初始化项目 (可选)

- 点击侧边栏 Kaggle 图标
- 点击 Home 视图中的 **📦 Init Project**
- 或使用命令: `Kaggle: Init Project`

### 4. 运行 Notebook

- 打开 `.ipynb` 文件
- 点击右上角 🚀 火箭图标
- 观察状态栏查看进度

---

## 🎯 功能特性

### 核心功能 ☁️

| 功能            | 描述                                    |
| --------------- | --------------------------------------- |
| ☁️ 云端运行     | 一键推送 notebook/script 到 Kaggle 执行 |
| ⚡ GPU/TPU 加速 | 配置硬件加速器                          |
| 📊 实时状态     | 状态栏显示运行进度                      |
| 📥 自动下载     | 运行完成后自动下载输出文件              |
| 🔐 凭证管理     | 安全存储 Kaggle API 密钥                |

### 智能优化 🚀

| 功能              | 描述                             |
| ----------------- | -------------------------------- |
| 🖥️ 状态栏实时显示 | 状态栏实时反馈运行状态           |
| 🔄 智能后台轮询   | 自动检查运行状态，超时后继续监控 |
| 🏠 Home 视图      | 侧边栏快速入口                   |
| 🔐 自动凭证保存   | 登录一次，后续自动使用           |

### 效率工具 🛠️

| 功能          | 描述                     |
| ------------- | ------------------------ |
| 📦 项目初始化 | 快速创建 Kaggle 项目结构 |
| 📓 笔记本管理 | 浏览和拉取 notebooks     |
| 📊 数据集浏览 | 探索 Kaggle 数据集       |
| 🏆 竞赛列表   | 查看可用竞赛             |
| 📋 运行历史   | 查看历史运行记录         |

---

## 🔧 配置说明

### VSCode 设置

在设置中搜索 "Kaggle"：

| 设置                            | 默认值            | 说明            |
| ------------------------------- | ----------------- | --------------- |
| `kaggle.defaultAccelerator`     | `none`            | 默认加速器      |
| `kaggle.defaultInternet`        | `false`           | 默认启用互联网  |
| `kaggle.outputsFolder`          | `.kaggle-outputs` | 输出目录        |
| `kaggle.autoDownloadOnComplete` | `true`            | 自动下载输出    |
| `kaggle.pollIntervalSeconds`    | `10`              | 轮询间隔(秒)    |
| `kaggle.pollTimeoutSeconds`     | `600`             | 超时时间(秒)    |
| `kaggle.cliPath`                | `kaggle`          | Kaggle CLI 路径 |

### 命令列表

| 命令                        | 描述              |
| --------------------------- | ----------------- |
| `kaggle.signIn`             | 登录 Kaggle       |
| `kaggle.signOut`            | 退出登录          |
| `kaggle.initProject`        | 初始化项目        |
| `kaggle.runCurrentNotebook` | 运行当前 notebook |
| `kaggle.pushRun`            | 推送并运行        |
| `kaggle.downloadOutputs`    | 下载输出文件      |

---

## 📊 从原生到优化

### 原生问题 vs 我们的优化

| 问题                                   | 优化方案                            |
| -------------------------------------- | ----------------------------------- |
| ❌ Windows 命令行参数解析失败          | `exec()` → `execFile()`，跨平台兼容 |
| ❌ Notebook 缺少 kernel 元数据运行失败 | 自动检测并添加 kernelspec 元数据    |
| ❌ Runs 状态不更新                     | 基于时间和输出文件的智能状态检测    |
| ❌ 轮询无状态反馈                      | 状态栏实时显示 + 进度通知           |
| ❌ 重复输入 username                   | 自动从已保存凭证读取并填充          |
| ❌ 超时后停止监控                      | 超时后继续每30秒后台检查            |
| ❌ 凭证无法跨会话保存                  | 使用 VSCode Secrets API 持久化存储  |

### 核心流程优化

```
原生版本:
推送 → ❌ 无反馈 → ❌ 状态不更新 → 手动检查

优化版本:
推送 → 📊 状态栏显示 → 🔄 后台轮询 → ✅ 自动完成通知
```

---

## 🔧 技术架构

### 架构层级

| 层级           | 组件                                                         |
| -------------- | ------------------------------------------------------------ |
| **VSCode IDE** | Kaggle Runner 扩展 (首页/运行/notebook/数据集/竞赛视图、状态栏、智能配置) |
| **Kaggle CLI** | kernels push/status/output，数据集/竞赛浏览                  |
| **Kaggle API** | https://www.kaggle.com/api                                   |

### 组件详情

| 层级       | 组件                                   | 描述         |
| ---------- | -------------------------------------- | ------------ |
| **UI 层**  | 首页、运行、notebook、数据集、竞赛视图 | 可视化界面   |
|            | 状态栏                                 | 实时运行状态 |
|            | 智能配置                               | 用户设置     |
| **CLI 层** | kernels push/status/output             | 核心操作     |
|            | 数据集/竞赛列表                        | 浏览资源     |
| **API 层** | Kaggle REST API                        | 后端服务     |

### 核心工作流

```
用户操作           系统响应
────────────────────────────────────
点击运行     →    状态栏: 📤 推送中
               →    通知: 正在上传
               →    状态栏: 🕐 等待队列
               →    后台轮询
               →    状态栏: 🔄 运行中
               →    完成通知
               →    自动下载输出
```

---

## ❓ 常见问题

### Q: 如何获取 Kaggle API Key?

1. 登录 [Kaggle.com](https://www.kaggle.com)
2. 点击头像 → Settings → API
3. 点击 "Create New Token"

### Q: 凭证存储安全吗?

是的，使用 VSCode Secrets API 加密存储，仅本地访问。

### Q: 支持 Windows 吗?

是的，完全支持 Windows/macOS/Linux。

### Q: 可以运行 Python 脚本吗?

是的，支持 `.ipynb` 和 `.py` 文件。

### Q: 状态栏不更新怎么办?

请确保：

1. 已正确登录 Kaggle
2. 网络连接正常
3. Kaggle CLI 已安装 (`kaggle --version`)

---

## 🤝 贡献指南

欢迎贡献代码！

### 开发环境

```bash
git clone https://github.com/CuiPenghub/vscode-kaggle-runner.git
cd vscode-kaggle-runner
npm install
npm run watch
```

### 测试

```bash
npm test
```

### 构建

```bash
npm run build
```

### 发布

```bash
npm run release
```

### 提交 PR 前

- [ ] 通过所有测试
- [ ] 通过 ESLint 检查
- [ ] 更新文档

---

## 📧 联系方式

**作者**: Peng Cui

**邮箱**: 1466246366@qq.com

**GitHub**: [@CuiPenghub](https://github.com/CuiPenghub)

**问题反馈**: [Git://github.com/CuiPenghub/vHub Issues](httpsscode-kaggle-runner/issues)

---

## 致谢

本项目基于 [DataQuanta/vscode-kaggle-extension](https://github.com/data-quanta/vscode-kaggle-extension) 开源项目开发。

感谢原作者 Amin Vakhshouri 的贡献，本项目在此基础上进行了深度优化和增强，并修改了存在的 bug。

---

**喜欢这个扩展吗?**

⭐ 在 [GitHub](https://github.com/CuiPenghub/vscode-kaggle-runner) 点个星

⭐ 在 [VSCode Marketplace](https://marketplace.visualstudio.com/) 给个好评

---

## 📄 许可证

MIT License - 见 [LICENSE](LICENSE) 文件
