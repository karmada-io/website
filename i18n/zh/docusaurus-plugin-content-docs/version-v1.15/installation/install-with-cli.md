---
title: 使用 CLI 安装
---

## 前提条件
## 使用初始化标志安装

## 使用初始化配置安装

`karmadactl init` 命令允许您通过指定配置文件来安装 Karmada，该文件提供了一种结构化方式，可在 YAML 文件中定义所有设置。

### 配置文件示例
以下是 Karmada 部署的配置文件示例：
```yaml
apiVersion: config.karmada.io/v1alpha1
kind: KarmadaInitConfig
spec:
  karmadaCRDs: "https://github.com/karmada-io/karmada/releases/download/v1.15.9/crds.tar.gz"
  etcd:
    local:
      repository: "registry.k8s.io/etcd"
      tag: "3.5.16-0"
      initImage:
        repository: "docker.io/alpine"
        tag: "3.21.3"
  components:
    karmadaAPIServer:
      repository: "registry.k8s.io/kube-apiserver"
      tag: "v1.31.3"
    karmadaAggregatedAPIServer:
      repository: "docker.io/karmada/karmada-aggregated-apiserver"
      tag: "v1.15.9"
    kubeControllerManager:
      repository: "registry.k8s.io/kube-controller-manager"
      tag: "v1.31.3"
    karmadaControllerManager:
      repository: "docker.io/karmada/karmada-controller-manager"
      tag: "v1.15.9"
    karmadaScheduler:
      repository: "docker.io/karmada/karmada-scheduler"
      tag: "v1.15.9"
    karmadaWebhook:
      repository: "docker.io/karmada/karmada-webhook"
      tag: "v1.15.9"
```

### 使用配置文件部署 Karmada

1. 将上述示例配置保存到文件（例如 `karmada-init-config.yaml`）。

2. 使用以下命令通过配置文件部署 Karmada：

  ```bash
  sudo karmadactl init --config /path/to/your/karmada-init-config.yaml
  ```

:::note

由于 `karmadactl` 需要在 `/etc/karmada/` 目录下创建 `karmada-apiserver.config` 文件，因此需使用 `sudo` 提升权限。

:::

3. 该配置文件可用于定义以下关键参数：

- certificates：定义证书路径和有效期。
- etcd：配置 Etcd 相关设置，包括本地或外部 Etcd 选项。
- hostCluster：指定宿主集群的 API 端点和 kubeconfig。
- images：配置各组件的镜像设置。
- components：设置 API 服务器及其他核心组件的副本数。
- karmadaDataPath：定义 Karmada 的数据存储路径。
- ......

如需了解配置文件的更多详细信息，请参考 [karmadactl init API 参考](../reference/karmadactl/karmadactl-config.v1alpha1.md)。
