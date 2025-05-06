---
title: Karmadactl 初始化配置 v1alpha1 文档
---

# Karmadactl 配置文档 (v1alpha1)

## 概述

`karmadactl init` 命令支持从 YAML 文件加载配置参数，以简化 Karmada 控制平面的部署过程。此功能允许用户在配置文件中定义所有必要的设置，减少管理大量命令行标志的复杂性，并提高不同环境之间的一致性。

本文档解释了与 `karmadactl init --config` 一起使用的 YAML 配置文件的结构，基于配置模式的 `v1alpha1` 版本。

## YAML 配置结构

配置文件分为以下关键部分：

## `apiVersion`

指定配置文件的 API 版本。对于 Karmada 初始化，它应始终为 `config.karmada.io/v1alpha1`。

```yaml
apiVersion: config.karmada.io/v1alpha1
```

## `kind`
定义配置的类型。对于 Karmada 初始化，此值应始终为 `InitConfiguration`。

```yaml
kind: KarmadaInitConfig
```

## `spec`

包含用于初始化 Karmada 的主要配置规范。

#### `certificates`

配置 Karmada 组件所需的证书信息。

- **`caCertFile`**: 根 CA 证书文件的路径。如果未指定，将生成新的自签名 CA 证书。
- **`caKeyFile`**: 根 CA 密钥文件的路径。如果未指定，将生成新的自签名 CA 密钥。
- **`externalDNS`**: 要包含在证书主题备用名称 (SANs) 中的外部 DNS 名称列表。
- **`externalIP`**: 要包含在证书 SANs 中的外部 IP 地址列表。
- **`validityPeriod`**: 证书的有效期，以 Go duration 格式指定（例如，一年为 `"8760h0m0s"`）。

```yaml
spec:
 certificates:
   caCertFile: "/etc/karmada/pki/ca.crt"
   caKeyFile: "/etc/karmada/pki/ca.key"
   externalDNS:
     - "localhost"
     - "example.com"
   externalIP:
     - "192.168.1.2"
     - "172.16.1.2"
   validityPeriod: "8760h0m0s"
```

#### `etcd`

配置 Karmada 使用的 Etcd 集群。您可以选择本地 Etcd 集群 (`local`) 或外部 Etcd 集群 (`external`)。

##### `local`

定义在 Karmada 控制平面中部署本地 Etcd 集群的设置。

- **`repository`**: Etcd 镜像的 Docker 镜像仓库。
- **`tag`**: Etcd 的镜像标签（版本）。
- **`dataPath`**: Etcd 在主机上存储其数据的文件系统路径。
- **`initImage`**: 用于 Etcd init 容器的镜像，通常是轻量级镜像，如 Alpine Linux。
- **`nodeSelectorLabels`**: 用于选择将调度 Etcd Pod 的节点的标签。
- **`pvcSize`**: 当 `storageMode` 设置为 `PVC` 时，Etcd 使用的 PersistentVolumeClaim 的大小。
- **`replicas`**: 要部署的 Etcd 副本数。为了实现高可用性，建议使用奇数个副本（例如，3、5）。
- **`storageMode`**: Etcd 数据的存储模式。选项为 `emptyDir`、`hostPath` 或 `PVC`。

```yaml
spec:
  etcd:
    local:
      repository: "registry.k8s.io/etcd"
      tag: "latest"
      dataPath: "/var/lib/karmada-etcd"
      initImage:
        repository: "alpine"
        tag: "3.19.1"
      nodeSelectorLabels:
        karmada.io/etcd: "true"
      pvcSize: "5Gi"
      replicas: 3
      storageMode: "PVC"
```

##### `external`

配置外部 Etcd 集群的连接设置。

- **`endpoints`**: 指向外部 Etcd 服务器的 URL 列表。
- **`caFile`**: 外部 Etcd 集群的 CA 证书文件路径。
- **`certFile`**: 用于身份验证的客户端证书文件路径。
- **`keyFile`**: 用于身份验证的客户端密钥文件路径。
- **`keyPrefix`**: 在外部 Etcd 集群中用于分隔数据的键前缀。

```yaml
spec:
  etcd:
    external:
      endpoints:
        - "https://example.com:8443"
      caFile: "/path/to/your/ca.crt"
      certFile: "/path/to/your/cert.crt"
      keyFile: "/path/to/your/key.key"
      keyPrefix: "ext-"
```

#### `hostCluster`

指定将安装 Karmada 的主机 Kubernetes 集群的信息。

- **`apiEndpoint`**: 主机集群的 API 服务器端点。
- **`kubeconfig`**: 用于访问主机集群的 kubeconfig 文件路径。
- **`context`**: kubeconfig 文件中要使用的上下文名称。
- **`domain`**: 主机集群的 DNS 域（例如，`cluster.local`）。

```yaml
spec:
  hostCluster:
    apiEndpoint: "https://kubernetes.example.com"
    kubeconfig: "/root/.kube/config"
    context: "karmada-host"
    domain: "cluster.local"
```

#### `images`

配置 Karmada 和 Kubernetes 组件的镜像相关设置。

- **`imagePullPolicy`**: 镜像拉取策略。选项为 `Always`、`IfNotPresent` 或 `Never`。
- **`imagePullSecrets`**: 用于向私有镜像仓库进行身份验证的 Kubernetes Secret 列表。
- **`kubeImageMirrorCountry`**: 用于选择 Kubernetes 镜像镜像站的国家代码（例如，`cn` 表示中国）。
- **`kubeImageRegistry`**: 用于拉取 Kubernetes 镜像的自定义 Docker Registry。
- **`kubeImageTag`**: 要使用的 Kubernetes 镜像的标签（版本）。
- **`privateRegistry`**:
    - **`registry`**: 私有镜像仓库的地址。如果指定，所有镜像将从此仓库拉取。

```yaml
spec:
  images:
    imagePullPolicy: "IfNotPresent"
    imagePullSecrets:
      - "PullSecret1"
      - "PullSecret2"
    kubeImageMirrorCountry: "cn"
    kubeImageRegistry: "registry.cn-hangzhou.aliyuncs.com/google_containers"
    kubeImageTag: "v1.29.6"
    privateRegistry:
      registry: "my.private.registry"
```

#### `components`

定义各个 Karmada 组件的配置。

##### `karmadaAPIServer`

- **`repository`**: Karmada API 服务器的 Docker 镜像仓库。
- **`tag`**: Karmada API 服务器的镜像标签。
- **`replicas`**: API 服务器部署的副本数。
- **`advertiseAddress`**: API 服务器将向客户端广播的 IP 地址。
- **`networking`**:
    - **`namespace`**: 将部署 API 服务器的 Kubernetes 命名空间。
    - **`port`**: API 服务器将监听的端口号。

```yaml
spec:
  components:
    karmadaAPIServer:
      repository: "karmada/kube-apiserver"
      tag: "v1.29.6"
      replicas: 1
      advertiseAddress: "192.168.1.100"
      networking:
        namespace: "karmada-system"
        port: 32443
```

##### `karmadaAggregatedAPIServer`

- **`repository`**: 聚合 API 服务器的 Docker 镜像仓库。
- **`tag`**: 聚合 API 服务器的镜像标签。
- **`replicas`**: 副本数。

```yaml
spec:
  components:
    karmadaAggregatedAPIServer:
      repository: "karmada/karmada-aggregated-apiserver"
      tag: "v0.0.0-master"
      replicas: 1
```

##### `kubeControllerManager`

- **`repository`**: Kube Controller Manager 的 Docker 镜像仓库。
- **`tag`**: Kube Controller Manager 的镜像标签。
- **`replicas`**: 副本数。

```yaml
spec:
  components:
    kubeControllerManager:
      repository: "karmada/kube-controller-manager"
      tag: "v1.29.6"
      replicas: 1
```

##### `karmadaControllerManager`

- **`repository`**: Karmada Controller Manager 的 Docker 镜像仓库。
- **`tag`**: Karmada Controller Manager 的镜像标签。
- **`replicas`**: 副本数。

```yaml
spec:
  components:
    karmadaControllerManager:
      repository: "karmada/karmada-controller-manager"
      tag: "v0.0.0-master"
      replicas: 1
```

##### `karmadaScheduler`

- **`repository`**: Karmada Scheduler 的 Docker 镜像仓库。
- **`tag`**: Karmada Scheduler 的镜像标签。
- **`replicas`**: 副本数。

```yaml
spec:
  components:
    karmadaScheduler:
      repository: "karmada/karmada-scheduler"
      tag: "v0.0.0-master"
      replicas: 1
```

##### `karmadaWebhook`

- **`repository`**: Karmada Webhook 的 Docker 镜像仓库。
- **`tag`**: Karmada Webhook 的镜像标签。
- **`replicas`**: 副本数。

```yaml
spec:
  components:
    karmadaWebhook:
      repository: "karmada/karmada-webhook"
      tag: "v0.0.0-master"
      replicas: 1
```

#### `karmadaDataPath`

指定 Karmada 在主机上存储其数据的目录，包括 kubeconfig 文件、证书和 CRD。

```yaml
spec:
  karmadaDataPath: "/etc/karmada"
```

#### `karmadaPKIPath`

指定 Karmada 在主机上存储其 PKI（公钥基础设施）文件的目录，例如证书和密钥。

```yaml
spec:
  karmadaPKIPath: "/etc/karmada/pki"
```

#### `karmadaCRDs`

指定包含要安装的 Karmada 自定义资源定义 (CRDs) 的 tarball 的 URL 或路径。

```yaml
spec:
  karmadaCRDs: "https://github.com/karmada-io/karmada/releases/download/test/crds.tar.gz"
```

#### `waitComponentReadyTimeout`

指定等待 Karmada 组件就绪的超时时间（秒）。值为 `0` 表示无限期等待。

```yaml
spec:
  waitComponentReadyTimeout: 120
```

## 完整配置示例文件

以下是 `karmada-init.yaml` 文件结构的完整示例，

```yaml
apiVersion: config.karmada.io/v1alpha1
kind: KarmadaInitConfig
spec:
  certificates:
    caCertFile: "/path/to/your/ca.crt"
    caKeyFile: "/path/to/your/ca.key"
    externalDNS:
      - "localhost"
      - "example.com"
    externalIP:
      - "192.168.1.2"
      - "172.16.1.2"
    validityPeriod: "8760h0m0s"
  etcd:
    local:
      repository: "registry.k8s.io/etcd"
      tag: "latest"
      dataPath: "/var/lib/karmada-etcd"
      initImage:
        repository: "alpine"
        tag: "3.19.1"
      nodeSelectorLabels:
        karmada.io/etcd: "true"
      pvcSize: "5Gi"
      replicas: 3
      storageMode: "PVC"
#    external:
#      endpoints:
#        - "https://example.com:8443"
#      caFile: "/path/to/your/ca.crt"
#      certFile: "/path/to/your/cert.crt"
#      keyFile: "/path/to/your/key.key"
#      keyPrefix: "ext-"
  hostCluster:
    apiEndpoint: "https://kubernetes.example.com"
    kubeconfig: "/root/.kube/config"
    context: "karmada-host"
    domain: "cluster.local"
  images:
    imagePullPolicy: "IfNotPresent"
    imagePullSecrets:
      - "PullSecret1"
      - "PullSecret2"
    kubeImageMirrorCountry: "cn"
    kubeImageRegistry: "registry.cn-hangzhou.aliyuncs.com/google_containers"
    kubeImageTag: "v1.29.6"
    privateRegistry:
      registry: "my.private.registry"
  components:
    karmadaAPIServer:
      repository: "registry.k8s.io/kube-apiserver"
      tag: "v1.30.0"
      replicas: 1
      advertiseAddress: "192.168.1.100"
      networking:
        namespace: "karmada-system"
        port: 32443
    karmadaAggregatedAPIServer:
      repository: "docker.io/karmada/karmada-aggregated-apiserver"
      tag: "v1.10.3"
      replica: 1
    kubeControllerManager:
      repository: "registry.k8s.io/kube-controller-manager"
      tag: "v1.30.0"
      replica: 1
    karmadaControllerManager:
      repository: "docker.io/karmada/karmada-controller-manager"
      tag: "v1.10.3"
      replica: 1
    karmadaScheduler:
      repository: "docker.io/karmada/karmada-scheduler"
      tag: "v1.10.3"
      replica: 1
    karmadaWebhook:
      repository: "docker.io/karmada/karmada-webhook"
      tag: "v1.10.3"
      replica: 1
  karmadaDataPath: "/etc/karmada"
  karmadaPKIPath: "/etc/karmada/pki"
  karmadaCRDs: "https://github.com/karmada-io/karmada/releases/download/test/crds.tar.gz"
  waitComponentReadyTimeout: 120
```

## 使用配置文件

要将此配置文件与 `karmadactl init` 一起使用，只需将 YAML 文件的路径作为参数传递给 `--config` 标志：

```bash
karmadactl init --config /path/to/karmada-init.yaml
```

### 覆盖配置文件值

如有必要，命令行标志仍可与配置文件结合使用。通过命令行指定的参数将覆盖配置文件中的参数。例如，要覆盖 API 服务器副本的数量，可以使用：

```bash
karmadactl init --config /path/to/karmada-init.yaml --karmada-apiserver-replicas 5
```
