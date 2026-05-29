---
title: 安装 CLI 工具
---
## 安装 Karmadactl

你可以用以下任一种方式安装 `karmadactl`：

- 一键安装。
- 从源代码构建。

### 一键安装

Karmada 从 v1.2.0 起提供了 `karmadactl` 下载服务。
你可以从 [karmada release](https://github.com/karmada-io/karmada/releases) 页面选择适合操作系统的正确版本。

若要安装最新版本，请运行：

```shell
curl -s https://raw.githubusercontent.com/karmada-io/karmada/master/hack/install-cli.sh | sudo bash
```

该安装脚本将执行以下操作：

- 尝试检测你的操作系统
- 将 tar 版本文件下载并解压到一个临时目录
- 将 karmadactl 可执行文件复制到 /usr/local/bin
- 移除该临时目录

你也可以导出 `INSTALL_CLI_VERSION` 环境变量选择要安装的版本。

例如，使用以下命令安装 1.3.0 karmadactl：

```shell
curl -s https://raw.githubusercontent.com/karmada-io/karmada/master/hack/install-cli.sh | sudo INSTALL_CLI_VERSION=1.3.0 bash
```

:::note

install-cli.sh 仅支持 1.2.0 之后的 CLI 工具。

:::

### 从源代码构建

从代码仓库克隆 Karmada 仓库并运行 `make` 命令：

```bash
make karmadactl
```

然后将项目根目录中 `_output` 文件夹下的 `karmadactl` 可执行文件移到 `PATH` 路径。

## 安装 kubectl-karmada

你可以用以下任一种方式安装 `kubectl-karmada` 插件：

- 一键安装。
- 使用 Krew 安装。
- 从源代码构建。

### 前提条件

#### kubectl

`kubectl` 是允许你控制  Kubernetes 集群的 Kubernetes 命令行工具。
有关安装说明，请参阅[安装 kubectl](https://kubernetes.io/zh-cn/docs/tasks/tools/#kubectl)。

### 一键安装

Karmada 从 v0.9.0 起提供了 `kubectl-karmada` 插件下载服务。
你可以从 [karmada release](https://github.com/karmada-io/karmada/releases) 页面选择适合操作系统的正确插件版本。

安装过程与安装 karmadactl 相同，你只需要添加一个 `kubectl-karmada` 参数。

要安装最新版本，请运行：

```shell
curl -s https://raw.githubusercontent.com/karmada-io/karmada/master/hack/install-cli.sh | sudo bash -s kubectl-karmada
```

### 使用 Krew 安装

Krew 是针对 `kubectl` 命令行工具的插件管理器。

在你的机器上[安装并设置](https://krew.sigs.k8s.io/docs/user-guide/setup/install/) Krew。

然后安装 `kubectl-karmada` 插件：

```bash
kubectl krew install karmada
```

有关更多信息请参阅 [Krew 快速入门](https://krew.sigs.k8s.io/docs/user-guide/quickstart/)。

### 从源代码构建

从代码仓库克隆 Karmada 仓库并运行 `make` 命令：

```bash
make kubectl-karmada
```

然后将项目根目录中 `_output` 文件夹下的 `kubectl-karmada` 可执行文件移到 `PATH` 路径。
