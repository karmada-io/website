---
title: 证书框架
---

# Karmada 证书框架

本文档详细描述了 Karmada 系统中的证书框架体系，包括所有证书资源的组织结构、用途及其配置建议。Karmada 证书框架定义了组件间安全通信所需的证书体系，清晰地阐明了各组件如何使用证书进行身份验证和通信加密。本文档将帮助管理员了解 Karmada 的证书体系架构，正确配置和管理组件所需的证书，确保整个系统的安全性。

注意：当前，通过社区维护的 [hack/deploy-karmada.sh](https://github.com/karmada-io/karmada/blob/master/hack/deploy-karmada.sh) 脚本安装 Karmada 时，会按照本文档所述的证书框架生成证书。其他[安装方式](../../installation/installation.md)（包括 `karmadactl init`、`karmada-operator` 和 Helm）将在后续版本中逐步统一采用本标准。更多信息请参考[issue: Karmada Self-Signed Certificate Content Standardization](https://github.com/karmada-io/karmada/issues/6091).。

## Karmada 根证书

Karmada 根证书作为证书链的最顶端，是所有后续证书的签发者。系统中的各种组件（如 API Server、聚合 API Server、Webhook、ETCD 等）生成的证书都是由该根证书签署并建立信任链的。

## Karmada API Server

### 服务端证书

Karmada API Server 服务端证书用于加密和验证 `karmada-apiserver` 与客户端之间的通信。该证书确保了 `karmada-apiserver` 能够安全地提供其服务接口，同时允许客户端验证api服务器的真实性，防止中间人攻击。

**命令行标志**

通过 `--tls-cert-file` 标志传入证书文件

**推荐CN和SAN值**

```
Subject: CN=system:karmada:karmada-apiserver
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:karmada-apiserver.karmada-system.svc.cluster.local,
                DNS:karmada-apiserver.karmada-system.svc, DNS:localhost,
                IP Address:127.0.0.1, IP Address:${apiserver_service_ip_address}
```

### ETCD客户端证书

Karmada API Server ETCD 客户端证书用于 `karmada-apiserver` 访问 ETCD 数据存储时的身份验证。它确保只有授权的 API Server 实例能够读写 ETCD 中的数据。

**命令行标志**

通过 `--etcd-certfile` 标志传入证书文件

**推荐CN和SAN值**

```
Subject: O=system:masters, CN=system:karmada:karmada-apiserver-etcd-client
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
```

### Front Proxy 客户端证书

Front Proxy 客户端证书用于前端代理与`karmada-apiserver`之间的通信认证。在 Karmada 的 API 聚合架构中，前端代理处理来自聚合 API Server 的请求转发。该证书确保了请求转发过程的安全性和可信度。

**命令行标志** 

通过`--proxy-client-cert-file`标志传入证书文件

**推荐CN和SAN值**

```
Subject: CN=front-proxy-client
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
```

## Karmada Aggregated API Server

### 服务端证书

Karmada Aggregated API Server 证书用于 Karmada 的 API 聚合层，允许动态地将 API 扩展添加到核心 API Server 中。该证书确保了聚合 API Server 的身份验证，并保护与其他组件间的通信安全。通过`karmada-aggregated-apiserver`，Karmada 能够以安全的方式扩展其 API 功能。

**命令行标志**

通过 `--tls-cert-file` 标志传入证书文件

**推荐CN和SAN值**

```
Subject: CN=system:karmada:karmada-aggregated-apiserver
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:karmada-aggregated-apiserver.karmada-system.svc.cluster.local, 
                DNS:karmada-aggregated-apiserver.karmada-system.svc, DNS:localhost, 
                IP Address:127.0.0.1
```

### 客户端证书

Karmada Aggregated API Server  客户端证书用于 `karmada-aggregated-apiserver`组件作为客户端与 `karmada-apiserver` 通信时的身份验证。它允许 Karmada Aggregated API Server 组件安全地访问 API 服务并执行必要的操作。该证书确保了 Karmada Aggregated API Server 的请求能被正确识别和授权。

**命令行标志**

通过 `--kubeconfig` 标志传入含有证书的kubeconfig

**推荐CN和SAN值**

```
Subject: O=system:masters, CN=system:karmada:karmada-aggregated-apiserver
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
```

### ETCD客户端证书

Karmada Aggregated API Server ETCD 客户端证书用于`karmada-aggregated-apiserver`访问 ETCD 数据存储时的身份验证。它确保`karmada-aggregated-apiserver`能够安全地存储和检索其扩展 API 资源的状态信息，同时维护适当的访问控制。

**命令行标志**

通过 `--etcd-certfile` 标志传入证书文件

**推荐CN和SAN值**

```
Subject: O=system:masters, CN=system:karmada:karmada-aggregated-apiserver-etcd-client
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
```

## Karmada Webhook

### 服务端证书

Karmada Webhook 服务端证书用于加密和验证 `karmada-webhook`与 `karmada-apiserver` 之间的通信。`karmada-webhook`在 Karmada 中负责资源验证和准入控制，确保所有对资源的操作符合预定义的规则。

**命令行标志**

通过 `--cert-dir` 标志传入证书文件目录，从目录中自动读取

**推荐CN和SAN值**

```
Subject: CN=system:karmada:karmada-webhook
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:karmada-webhook.karmada-system.svc.cluster.local, 
                DNS:karmada-webhook.karmada-system.svc, DNS:localhost, 
                IP Address:127.0.0.1
```

### 客户端证书

Karmada Webhook 客户端证书用于 `karmada-webhook`组件作为客户端与 `karmada-apiserver` 通信时的身份验证。它允许 Webhook 组件安全地访问 API 服务并执行必要的操作。该证书确保了 Webhook 的请求能被正确识别和授权。

**命令行标志**

通过 `--kubeconfig` 标志传入含有证书的kubeconfig

**推荐CN和SAN值**

```
Subject: O=system:masters, CN=system:karmada:karmada-webhook
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
```

## Karmada Search

### 服务端证书

Karmada Search 服务端证书用于加密和验证 `karmada-search`与客户端之间的通信。`karmada-search`提供跨集群资源搜索功能，使管理员能够快速检索和查询分布在多个集群中的资源。

**命令行标志**
通过 `--tls-cert-file` 标志传入证书文件

**推荐CN和SAN值**

```
Subject: CN=system:karmada:karmada-search
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:karmada-search.karmada-system.svc.cluster.local, 
                DNS:karmada-search.karmada-system.svc, DNS:localhost, 
                IP Address:127.0.0.1
```

### 客户端证书

Karmada Search 客户端证书用于`karmada-search`与`karmada-apiserver`之间的通信认证。它允许搜索服务安全地查询和检索跨集群资源信息。该证书确保了搜索请求的安全性和数据访问权限的正确控制。

**命令行标志**

通过 `--kubeconfig` 标志传入含有证书的kubeconfig

**推荐CN和SAN值**

```
Subject: O=system:masters, CN=system:karmada:karmada-search
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
```

### ETCD客户端证书

Karmada Search ETCD 客户端证书用于`karmada-search`访问 ETCD 数据存储时的身份验证。它允许`karmada-search`安全地从 ETCD 检索资源信息，同时确保数据访问权限的正确控制。

**命令行标志**
通过 `--etcd-certfile` 标志传入证书文件

**推荐CN和SAN值**

```
Subject: O=system:masters, CN=system:karmada:karmada-search-etcd-client
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
```

## Karmada Metrics Adapter

### 服务端证书

Karmada Metrics Adapter 服务端证书用于加密和验证 `karmada-metrics-adapter`与 `karmada-apiserver` 之间的通信。 `karmada-metrics-adapter` 提供自定义指标 API 支持，使 Karmada 能够基于自定义指标进行资源调度和自动伸缩。

**命令行标志**
通过 `--tls-cert-file` 标志传入证书文件

**推荐CN和SAN值**

```
Subject: CN=system:karmada:karmada-metrics-adapter
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:karmada-metrics-adapter.karmada-system.svc.cluster.local, 
                DNS:karmada-metrics-adapter.karmada-system.svc, DNS:localhost, 
                IP Address:127.0.0.1
```

### 客户端证书

Karmada Metrics Adapter 客户端证书用于`karmada-metrics-adapter`与 `karmada-apiserver` 之间的通信认证。它允许指标适配器安全地访问和提供自定义指标 API。该证书确保了指标数据的安全查询和权限控制。

**命令行标志**
通过 `--kubeconfig` 标志传入含有证书的kubeconfig

**推荐CN和SAN值**

```
Subject: O=system:masters, CN=system:karmada:karmada-metrics-adapter
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
```

## Karmada Scheduler Estimator

### 服务端证书

Karmada Scheduler Estimator 服务端证书用于加密和验证`karmada-scheduler-estimator`与`karmada-scheduler`和`karmada-descheduler`之间的通信。`karmada-scheduler-estimator`为调度决策提供集群负载评估，帮助 Karmada 做出更优的资源分配决策。

**命令行标志**
通过 `--grpc-auth-cert-file` 标志传入证书文件

**推荐CN和SAN值**

```
Subject: CN=system:karmada:karmada-scheduler-estimator
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:*.karmada-system.svc.cluster.local, DNS:*.karmada-system.svc, 
                DNS:localhost, 
                IP Address:127.0.0.1
```

## ETCD

### 服务端证书

ETCD 服务端证书用于加密和验证 ETCD 服务端与客户端之间的通信。ETCD 是 Karmada 的核心数据存储，保存了所有的集群状态信息。该证书对于保护这些敏感数据的存储和访问至关重要，确保只有授权组件能够读写 ETCD 中的数据。

**命令行标志**

通过 `--key-file=` 标志传入证书文件

**推荐CN和SAN值**

```
Subject: CN=system:karmada:etcd-server
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:etcd.karmada-system.svc.cluster.local, DNS:etcd.karmada-system.svc, 
                DNS:etcd-client.karmada-system.svc.cluster.local, 
                DNS:etcd-client.karmada-system.svc, DNS:localhost, 
                IP Address:127.0.0.1
```

### ETCD客户端证书

ETCD ETCD 客户端证书是 Karmada ETCD 服务的自我健康检查和内部通信的关键安全凭证，它确保了 ETCD 服务的安全性和可用性。

**命令行标志**

在构建etcd容器时,使用如下命令在容器中使用

```bash
etcdctl get /registry --prefix --keys-only  --endpoints https://127.0.0.1:2379  --cacert /etc/karmada/pki/etcd-client/ca.crt --cert /etc/karmada/pki/etcd-client/tls.crt --key /etc/karmada/pki/etcd-client/tls.key
```

**推荐CN和SAN值**

```
Subject: CN=system:karmada:etcd-etcd-client
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
```

## Karmada Controller Manager

### 客户端证书

Karmada Controller Manager 客户端证书用于`karmada-controller-manager`与 `karmada-apiserver` 之间的通信认证。控制器管理器包含多个控制循环，负责维护集群的期望状态。该证书确保了控制器能够安全地与 `karmada-apiserver`  交互，获取和更新资源状态。

**命令行标志**

通过 `--kubeconfig` 标志传入含有证书的kubeconfig

**推荐CN和SAN值**

```
Subject: O=system:masters, CN=system:karmada:karmada-controller-manager
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
```

## Karmada Scheduler

### 客户端证书

Karmada Scheduler 客户端证书用于`karmada-scheduler`与 `karmada-apiserver` 之间的通信认证。调度器负责决定资源应该分配到哪些成员集群，是 Karmada 多集群管理的核心组件。

**命令行标志**

通过 `--kubeconfig` 标志传入含有证书的kubeconfig

**推荐CN和SAN值**

```
Subject: O=system:masters, CN=system:karmada:karmada-scheduler
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
```

### GRPC证书


Karmada Scheduler GRPC 证书用于加密和验证`karmada-scheduler`与`karmada-scheduler-estimator`之间的 gRPC 通信。`karmada-scheduler`使用此通道获取集群负载评估信息以做出调度决策。该证书确保了这些关键性能数据的安全传输。

**命令行标志**

通过 `--scheduler-estimator-cert-file` 标志传入证书文件

**推荐CN和SAN值**

```
Subject: O=system:masters, CN=system:karmada:karmada-scheduler-grpc
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
```

## Karmada Descheduler

### 客户端证书

Karmada Descheduler 客户端证书用于`karmada-descheduler`与 `karmada-apiserver` 之间的通信认证。反调度器负责优化已有的资源分配，通过重新调度来提高整体集群效率。该证书确保了反调度操作的安全性和权限控制。

**命令行标志**

通过 `--kubeconfig` 标志传入含有证书的kubeconfig

**推荐CN和SAN值**

```
Subject: O=system:masters, CN=system:karmada:karmada-descheduler
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
```

### GRPC证书

Karmada Descheduler GRPC 证书用于加密和验证`karmada-descheduler`与`karmada-scheduler-estimator`之间的 gRPC 通信。`karmada-descheduler`使用此通道获取集群负载评估信息以做出调度决策。该证书确保了这些关键性能数据的安全传输。

**命令行标志**

通过 `--scheduler-estimator-cert-file` 标志传入证书文件

**推荐CN和SAN值**

```
Subject: O=system:masters, CN=system:karmada:karmada-descheduler-grpc
Subject Public Key Info:
        X509v3 extensions:
            X509v3 Subject Alternative Name:
```
