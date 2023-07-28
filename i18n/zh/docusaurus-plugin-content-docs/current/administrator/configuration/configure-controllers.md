---
title: 配置控制器
---

Karmada 维护了一系列包含控制循环的控制器，它们监视系统状态，然后在需要时进行更改或请求更改。
每个控制器都尝试将当前状态转换为更接近期望状态。有关更多详细信息，请参考 [Kubernetes 控制器概念][1]。

## Karmada 控制器

这些控制器嵌入在 `karmada-controller-manager` 或 `karmada-agent` 的组件中，并且将随这些组件一起启动。
一些控制器可能由 `karmada-controller-manager` 和 `karmada-agent` 共享。

| 控制器                                 | 在 karmada-controller-manager 中	 | 在 karmada-agent 中      |
|----------------------------------------|----------------------------------|--------------------------|
| cluster                                | 是                               | 否                       |
| clusterStatus                          | 是                               | 是                       |
| binding                                | 是                               | 否                       |
| execution                              | 是                               | 是                       |
| workStatus                             | 是                               | 是                       |
| namespace                              | 是                               | 否                       |
| serviceExport                          | 是                               | 是                       |
| endpointSlice                          | 是                               | 否                       |
| serviceImport                          | 是                               | 否                       |
| unifiedAuth                            | 是                               | 否                       |
| federatedResourceQuotaSync             | 是                               | 否                       |
| federatedResourceQuotaStatus           | 是                               | 否                       |
| gracefulEviction                       | 是                               | 否                       |
| certRotation                           | 否                               | 是（默认禁用）            |
| applicationFailover                    | 是                               | 否                       |
| federatedHorizontalPodAutoscaler       | 是                               | 否                       |
| cronFederatedHorizontalPodAutoscaler   | 是                               | 否                       |

### 配置 Karmada 控制器

您可以使用 `--controllers` 标志为 `karmada-controller-manager` 和 `karmada-agent` 指定启用的控制器列表，或者在默认列表中禁用其中一些。

例如: 指定控制器列表：
```bash
--controllers=cluster,clusterStatus,binding,xxx
```

例如：禁用某些控制器（如果要保留默认列表中的其余控制器，请记得保留 `*`）：
```bash
--controllers=-hpa,-unifiedAuth,*
```
使用  `-foo` 禁用名为 `foo` 的控制器。

> 注意：默认的控制器列表可能会在将来的版本中更改。
> 上一个版本中启用的控制器可能会被禁用或弃用，同时也可能会引入新的控制器。
> 使用此标志的用户应该在系统升级之前查看发布说明。

## Kubernetes 控制器

除了由 Karmada 社区维护的控制器之外，Karmada 还需要来自 Kubernetes 的一些控制器。
这些控制器作为 `kube-controller-manager` 的一部分运行，并由 Kubernetes 社区维护。

建议用户将 `kube-controller-manager` 与 Karmada 组件一起部署。
[installation guide][2] 中的安装方法将帮助您部署它以及 Karmada 组件。

### 必需的控制器

并非 `kube-controller-manager` 中的所有控制器都对 Karmada 是必需的。如果您使用其他工具部署 Karmada，则可能需要像我们在
[example of kube-controller-manager deployment][3]中所做的那样通过 `--controllers` 标志来配置控制器。

以下控制器已由 Karmada 进行测试并推荐使用。

#### namespace

`namespace` 控制器作为 `kube-controller-manager` 的一部分运行。它监视 `Namespace` 删除并删除给定命名空间中的所有资源。

对于 Karmada 控制平面，我们继承了此行为以保持一致的用户体验。
除此之外，我们还依赖此功能来实现 Karmada 控制器，例如，在取消注册集群时，Karmada 将删除存储在 `execution namespace` 中（命名为 `karmada-es-<cluster name>`）的所有资源，
以确保所有资源都可以从 Karmada 控制平面和目标集群中清除。

有关 `namespace` 控制器的更多详细信息，请参考
[namespace controller sync logic](https://github.com/kubernetes/kubernetes/blob/v1.23.4/pkg/controller/namespace/deletion/namespaced_resources_deleter.go#L82-L94).

#### garbagecollector

`garbagecollector` 控制器作为 `kube-controller-manager` 的一部分运行。
它用于清理无用资源。
它管理 [owner reference](https://kubernetes.io/docs/concepts/overview/working-with-objects/owners-dependents/) 并删除资源，直到全部所有者都不存在。

对于 Karmada 控制平面，我们也使用 `owner reference` 将对象彼此关联起来。
例如，每个 `ResourceBinding` 都有一个所有者引用，链接到 `resource template`。
一旦删除了 `resource template`，`garbagecollector` 控制器将自动删除 `ResourceBinding`。

有关垃圾回收机制的更多详细信息，请参考
[Garbage Collection](https://kubernetes.io/docs/concepts/architecture/garbage-collection/).

#### serviceaccount-token

`serviceaccount-token` 控制器作为 `kube-controller-manager` 的一部分运行。
它监听 `ServiceAccount` 的创建，并创建相应的 `ServiceAccount Token Secret`，以允许 API 访问。

对于 Karmada 控制平面，在管理员创建 `ServiceAccount` 对象之后，
我们还需要 `serviceaccount-token` 控制器来生成 ServiceAccount token `Secret`，这将减轻管理员的负担，因为他/她不需要手动创建令牌。

有关详细信息，请参考：
- [service account token controller](https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/#token-controller)
- [service account tokens](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#service-account-tokens)

### 可选控制器

#### ttl-after-finished

`ttl-after-finished` 控制器作为 `kube-controller-manager` 的一部分运行。
它监听 `Job` 更新并限制已完成 `Job` 的生存期。
TTL 计时器在 Job 完成时启动，并且在 TTL 到期后将清理已完成的 Job。

对于 Karmada 控制平面，我们还提供了通过指定 `Job` 的 `.spec.ttlSecondsAfterFinished` 字段自动清除已完成 `Jobs` 的功能，这将为控制平面带来便利。

有关详细信息，请参考：
- [更新已完成 Job 的 TTL](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/ttlafterfinished/#updating-ttl-for-finished-jobs)
- [自动清理完成的 Job](https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/job/#clean-up-finished-jobs-automatically)

#### bootstrapsigner

`bootstrapsigner` 控制器作为 `kube-controller-manager` 的一部分运行。

这些令牌还用于为“发现”过程中使用的特定 ConfigMap 创建签名，该过程通过 `bootstrapsigner` 控制器完成。

对于 Karmada 控制平面，我们还在 `kube-public` 命名空间中提供了 `cluster-info` ConfigMap。
这是在客户端信任 API 服务器之前，在集群引导过程的早期阶段使用的。
可以通过共享令牌对签名后的 ConfigMap 进行身份验证。

> 注意：此控制器目前用于由 `karmadactl register` 注册成员集群的 PULL 模式。

有关详细信息，请参考：
- [启动引导令牌概述](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/bootstrap-tokens/#bootstrap-tokens-overview)
- [configmap 签名](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/bootstrap-tokens/#configmap-signing)

#### tokencleaner

`tokencleaner` 控制器作为 `kube-controller-manager` 的一部分运行。

通过在 Controller Manager 上启用 `tokencleaner` 控制器可以自动删除过期的令牌。


> 注意：此控制器目前用于由 `karmadactl register` 注册成员集群的 PULL 模式。

有关详细信息，请参考：
- [bootstrap tokens overview](https://kubernetes.io/docs/reference/access-authn-authz/bootstrap-tokens/#bootstrap-tokens-overview)
- [enabling bootstrap token authentication](https://kubernetes.io/docs/reference/access-authn-authz/bootstrap-tokens/#enabling-bootstrap-token-authentication)

#### csrapproving, csrcleaner, csrsigning

这些控制器作为 `kube-controller-manager` 的一部分运行。

`csrapproving` 控制器使用 [SubjectAccessReview API](https://kubernetes.io/docs/reference/access-authn-authz/authorization/#checking-api-access) 确定给定用户是否被授权请求 CSR，并根据授权结果批准。

`csrcleaner` 控制器定期清除过期的 csr。

`csrsigning` 控制器使用 Karmada 根证书签署证书。

> 注意：此控制器目前用于由 `karmadactl register` 注册成员集群的 PULL 模式。

有关详细信息，请参考：
- [csr approval](https://kubernetes.io/docs/reference/access-authn-authz/kubelet-tls-bootstrapping/#approval)
- [certificate signing request spec](https://kubernetes.io/docs/reference/kubernetes-api/authentication-resources/certificate-signing-request-v1/#CertificateSigningRequestSpec)
- [certificate signing requests](https://kubernetes.io/docs/reference/access-authn-authz/certificate-signing-requests/)

[1]: https://kubernetes.io/docs/concepts/architecture/controller/
[2]: ../../installation/installation.md
[3]: https://github.com/karmada-io/karmada/blob/master/artifacts/deploy/kube-controller-manager.yaml
