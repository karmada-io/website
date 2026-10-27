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
        - --metrics-bind-address=$(POD_IP):8080
```

### Certificate 配置

作为保障安全的重要手段，Karmada 使用证书来实现组件间的身份验证和加密通信。在安装部署 Karmada 时，Karmada 提供了丰富的配置来满足用户的不同需求。用户可以根据自己的安全策略和需求，选择合适的证书配置选项。以下是不同安装方式下，证书相关的默认行为和配置选项：

#### Helm

##### 默认行为

通过 Helm 安装时，pre-install job 会自动生成所需的证书。其中：
- CA 证书的默认有效期是 10 年（3650 天）。
- 各组件身份证书的默认有效期是 5 年（43800h）。
- 证书 RSA 密钥长度默认为 3072 位。

##### 自定义

用户可以通过修改 Helm chart 中的 `values.yaml` 文件，来自定义证书的相关配置选项，例如：
- `certs.auto.rootCAExpiryDays`: CA 证书的有效期，单位为天。
- `certs.auto.expiry`: 身份证书的有效期，格式为时间段字符串（例如，`43800h` 表示 5 年）。
- `certs.auto.rsaSize`: 证书 RSA 密钥的长度。

除此之外，如果用户已有自己的证书，也可以配置 Helm chart 跳过自动生成步骤，直接使用用户提供的证书。配置选项如下：
- `certs.mode`: 证书模式。设置为 `custom` 时，将使用自定义证书。默认值为 `auto`。
- `certs.custom`: 当 `certs.mode` 为 `custom` 时，此部分用于配置用户自定义证书的相关字段，例如 `caCrt`、`caKey`、`frontProxyCaCrt` 等。

#### karmadactl init

##### 默认行为

通过 `karmadactl init` 安装时，karmadactl 会自动生成所需的证书。其中：
- CA 证书的有效期是 10 年（3650 天）。在自动生成时，此值固定，不支持调整。
- 身份证书的默认有效期是 1 年（8760h）。
- 证书 RSA 密钥长度默认为 3072 位。在自动生成时，此值固定，不支持调整。

##### 自定义

用户可以通过在执行 `karmadactl init` 命令时，传入相关参数来自定义证书的配置选项。

若希望调整**身份证书**的有效期，可以使用：
- `--cert-validity-period`: 身份证书的有效期，格式为时间段字符串（例如，`8760h` 表示 1 年）。

若希望使用**自定义的 CA**，可以指定 CA 文件路径，此时将不会执行自动生成 CA 的步骤：
- `--ca-cert-file`: 自定义的 root CA 证书文件路径。
- `--ca-key-file`: 自定义的 root CA 私钥文件路径。需要和 `--ca-cert-file` 一起使用。

除此之外，也可以通过 `--config` 参数传入一个配置文件，来指定证书的相关配置选项。配置文件示例如下：
```yaml
apiVersion: config.karmada.io/v1alpha1
kind: KarmadaInitConfig
spec:
  certificates:
    caCertFile: "path/to/ca.crt"
    caKeyFile: "path/to/ca.key"
    validityPeriod: "43800h" # 5 years
```

#### Operator

##### 默认行为

通过 Operator 安装时，karmada-operator 会自动生成所需的证书。其中：
- CA 证书的有效期是 10 年（3650 天）。在自动生成时，此值固定，不支持调整。
- 身份证书的默认有效期是 1 年 (8760h)。
- 证书 RSA 密钥长度默认为 3072 位。在自动生成时，此值固定，不支持调整。

##### 自定义

用户可以通过修改 `Karmada` CR 来自定义证书的相关配置选项。

- `spec.customCertificate.leafCertValidityDays`: **身份证书**的有效期，单位为天。
- `spec.customCertificate.apiServerCACert`: 用于指定包含自定义 CA 证书和私钥的 Secret。如果设置了此字段，Operator 将跳过自动生成 CA 的过程，直接使用该 Secret 中的凭证。
