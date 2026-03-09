---
title: 使用 CLI 高可用安装
---

本文档旨在为您提供一篇详尽的指南，帮助您使用 `karmadactl` 命令行工具部署高可用（HA）Karmada。

## 前提条件

- 包含多个工作节点的 Kubernetes 集群（建议至少有三个工作节点）。
- 一份有效的 `kube-config` 文件，用于访问 Kubernetes 集群。
- 已安装 `karmadactl` 命令行工具或 `kubectl-karmada` 插件。

  :::note

  安装 `karmadactl` 命令行工具请参阅 [CLI 工具安装](/docs/next/installation/install-cli-tools#one-click-installation)指南。

  :::

## 安装

高可用部署 Karmada 有两种方式。第一种是使用内置 etcd 集群，第二种则是采用外置 etcd 集群。您可以参阅[高可用安装概述](/docs/next/installation/ha-installation)以了解更多。

### 使用内置 etcd 安装

1. 使用以下命令基于内置 etcd 安装高可用 Karmada：

  ```bash
  sudo karmadactl init --karmada-apiserver-replicas 3 --etcd-replicas 3 --etcd-storage-mode PVC --storage-classes-name <storage-classes-name> --kubeconfig <path-to-kube-config>
  ```

  :::note

  您需要使用 sudo 来提升权限，因为 `karmadactl` 会在 `/etc/karmada/karmada-apiserver.config` 目录下创建一份 `karmada-config` 文件。

  :::

2. 指定 `kube-config` 文件路径以连接至您的 Kubernetes 集群。通常情况下，`kube-config` 文件位于 `~/.kube/config` 目录下。或者，您也可以设置 `KUBECONFIG` 环境变量来指定文件的位置。

3. 按需调整安装参数：
    - `--karmada-apiserver-replicas 3`: 此参数设置三个 Karmada API 服务器副本。每个 Karmada API 服务器副本都需要一个单独的节点。
    - `--etcd-replicas 3`: 此参数确保三个 etcd 成员可用于支持三个 Karmada API 服务器。
    - `--etcd-storage-mode PVC`: 此参数表示使用 PVC 作为 etcd 存储。
    - `--storage-classes-name <StorageClassesName>`: 此参数指定 etcd 存储类的名称。

      :::note

      确保至少有三个 Kubernetes 工作节点可用，以便成功安装三个 Karmada API 服务器和 etcd 副本。否则，安装将无法进行。

      :::

### 使用外置 etcd 安装

1. 使用以下命令基于外置 etcd 安装高可用 Karmada：

 ```bash
  sudo karmadactl init --karmada-apiserver-replicas 3 --external-etcd-ca-cert-path <ca-cert-path> --external-etcd-client-cert-path <client-cert-path> --external-etcd-client-key-path <client-key-path> --external-etcd-servers <url-of-etcd-servers> --external-etcd-key-prefix <etcd-key-prefix> --kubeconfig <path-to-kube-config>
  ```

2. 按需调整安装参数：
    - `--karmada-apiserver-replicas 3`: 此参数设置三个 Karmada API 服务器副本。每个 Karmada API 服务器副本都需要一个单独的节点。
    - `--external-etcd-ca-cert-path`，`--external-etcd-client-cert-path`，`--external-etcd-client-key-path` 和 `--external-etcd-servers` 是与外部 etcd 集群进行身份验证所需的参数。
    - 您也可以使用 `--external-etcd-key-prefix` 参数指定 etcd 键前缀。

## 验证

Karmada 集群安装完成后，您可以使用以下命令验证 Pod 跨多个节点的分发情况：

```bash
kubectl get pod -o=custom-columns=NAME:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName -n karmada-system
```

这会显示 `karmada-system` 命名空间下 Pod 的状态与节点分配情况。