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

