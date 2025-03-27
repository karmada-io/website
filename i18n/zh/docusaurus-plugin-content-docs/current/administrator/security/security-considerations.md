---
title: 安全考虑
---

## 安全考虑

Karmada 安全考虑文档旨在帮助用户确保他们在使用 Karmada 时的安全性。本文档提供了一系列的最佳实践和建议，以帮助用户保护他们的 Karmada 集群和相关资源免受潜在的安全风险。文档涵盖了各个方面的安全问题，包括验证发布组件和组件配置等。通过遵循本指南中的建议，用户可以加强他们的 Karmada 环境的安全性，并减少潜在的安全漏洞和攻击面。请注意，本文档仅供参考，用户应根据自己的具体情况和需求进行适当的调整和实施。

### 验证发布组件：

Karmada 从 v1.7.0 版本开始引入 cosign 对发布的组件进行验证。详细信息请参考[验证发布组件](verify-artifacts)。

### 组件配置：

#### TLS 配置

Karmada 各组件通过启动参数`--tls-min-version`和`--cipher-suites`来设置客户端到服务端通讯的 tls 配置选项。

为避免通讯过程中使用到了不安全算法，如 3Des，Karmada 相关组件安装时，对 tls 配置进行了设置。具体如下:

- karmada-apiserver: `--tls-min-version=VersionTLS13`

- karmada-aggregated-apiserver: `--tls-min-version=VersionTLS13`

- karmada-search: `--tls-min-version=VersionTLS13`

- karmada-metrics-adapter: `--tls-min-version=VersionTLS13`

- etcd: `--cipher-suites=TLS_RSA_WITH_AES_128_CBC_SHA,TLS_RSA_WITH_AES_256_CBC_SHA,TLS_RSA_WITH_AES_128_GCM_SHA256,TLS_RSA_WITH_AES_256_GCM_SHA384,TLS_AES_128_GCM_SHA256,TLS_AES_256_GCM_SHA384,TLS_CHACHA20_POLY1305_SHA256,TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA,TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA,TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA,TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA,TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256,TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256,TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305` 

其中，将 Golang 的`secure cipher suites`设置为 etcd 的`cipher suites`。与 k8s 默认`cipher suites`的首选值一致。

#### 绑定地址配置

Karmada 各组件为用户配置监听地址和端口提供了可配置的参数。当用户部署 Karmada 组件时，若未配置监听相关参数时，Karmada 组件会使用默认的监听地址和端口。Karmada 组件默认监听地址为 `0.0.0.0` ，这意味着该组件将监听服务器上的所有网络接口（对于容器来说，这是一个虚拟网络接口，由容器运行时管理，如 Docker）。

以下是 Karmada 组件提供的可配置参数：

- karmada-controller-manager
    - `--metrics-bind-address`：默认值为 `:8080`。
    - `--health-probe-bind-address`：默认值为 `:10357`。
- karmada-scheduler
    - `--metrics-bind-address`：默认值为 `:8080`。
    - `--health-probe-bind-address`：默认值为 `:10351`。
- karmada-scheduler-estimator
    - `--metrics-bind-address`：默认值为 `:8080`。
    - `--health-probe-bind-address`：默认值为 `:10351`。
- karmada-descheduler
    - `--metrics-bind-address`：默认值为 `:8080`。
    - `--health-probe-bind-address`：默认值为 `:10358`。
- karmada-aggregated-apiserver
    - `--bind-address`：默认值为 `0.0.0.0`。
    - `--secure-port`：默认值为 `443`。
- karmada-metrics-adapter
    - `--metrics-bind-address`：默认值为 `:8080`。
    - `--bind-address`：默认值为 `0.0.0.0`。
    - `--secure-port`：默认值为 `443`。
- karmada-webhook
    - `--metrics-bind-address`：默认值为 `:8080`。
    - `--health-probe-bind-address`：默认值为 `:8000`。
    - `--bind-address`：默认值为 `0.0.0.0`。
    - `--secure-port`：默认值为 `8443`。
- karmada-search
    - `--bind-address`：默认值为 `0.0.0.0`。
    - `--secure-port`：默认值为 `443`。
- karmada-agent
    - `--metrics-bind-address`：默认值为 `:8080`。
    - `--health-probe-bind-address`：默认值为 `:10357`。

用户可以将监听地址配置为 Pod IP 值。 例如，您可以按照以下方式配置 `karmada-controller-manager` 组件的 `metrics` 接口：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: karmada-controller-manager
  namespace: karmada-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: karmada-controller-manager
  template:
    metadata:
      labels:
        app: karmada-controller-manager
    spec:
      containers:
      - name: my-container
        env:
        - name: POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        command:
        - /bin/karmada-controller-manager
        - --metrics-bind-address=${POD_IP}:8080
```
