---
title: 从源代码安装
---

本文说明如何使用 `hack/remote-up-karmada.sh` 脚本通过代码库将 Karmada 安装到你的集群。

## 选择一种暴露 karmada-apiserver 的方式

`hack/remote-up-karmada.sh` 将安装 `karmada-apiserver` 并提供两种暴露 karmada-apiserver 服务器的方式：

### 1. 通过 `HostNetwork` 类型

默认情况下，`hack/remote-up-karmada.sh` 将通过 `HostNetwork` 暴露 `karmada-apiserver`。

这种方式无需额外的操作。

### 2. 通过 `LoadBalancer` 类型的服务

如果你不想使用 `HostNetwork`，可以让 `hack/remote-up-karmada.sh` 脚本通过 `LoadBalancer` 类型的服务暴露 `karmada-apiserver`，
这种方式 **要求你的集群已部署 `Load Balancer`**。你需要做得是设置一个环境变量：
```bash
export LOAD_BALANCER=true
```

## 安装
从 `karmada` 仓库的 `root` 目录，执行以下命令安装 Karmada：
```bash
hack/remote-up-karmada.sh <kubeconfig> <context_name>
```
- `kubeconfig` 是你要安装的目标集群的 kubeconfig
- `context_name` 是 'kubeconfig' 中上下文的名称

例如：
```bash
hack/remote-up-karmada.sh $HOME/.kube/config mycluster
```

如果一切正常，脚本输出结束后，你将看到类似以下的消息：
```
------------------------------------------------------------------------------------------------------
█████   ████   █████████   ███████████   ██████   ██████   █████████   ██████████     █████████
░░███   ███░   ███░░░░░███ ░░███░░░░░███ ░░██████ ██████   ███░░░░░███ ░░███░░░░███   ███░░░░░███
░███  ███    ░███    ░███  ░███    ░███  ░███░█████░███  ░███    ░███  ░███   ░░███ ░███    ░███
░███████     ░███████████  ░██████████   ░███░░███ ░███  ░███████████  ░███    ░███ ░███████████
░███░░███    ░███░░░░░███  ░███░░░░░███  ░███ ░░░  ░███  ░███░░░░░███  ░███    ░███ ░███░░░░░███
░███ ░░███   ░███    ░███  ░███    ░███  ░███      ░███  ░███    ░███  ░███    ███  ░███    ░███
█████ ░░████ █████   █████ █████   █████ █████     █████ █████   █████ ██████████   █████   █████
░░░░░   ░░░░ ░░░░░   ░░░░░ ░░░░░   ░░░░░ ░░░░░     ░░░░░ ░░░░░   ░░░░░ ░░░░░░░░░░   ░░░░░   ░░░░░
------------------------------------------------------------------------------------------------------
Karmada is installed successfully.

Kubeconfig for karmada in file: /root/.kube/karmada.config, so you can run:
  export KUBECONFIG="/root/.kube/karmada.config"
Or use kubectl with --kubeconfig=/root/.kube/karmada.config
Please use 'kubectl config use-context karmada-apiserver' to switch the cluster of karmada control plane
And use 'kubectl config use-context your-host' for debugging karmada installation
```
