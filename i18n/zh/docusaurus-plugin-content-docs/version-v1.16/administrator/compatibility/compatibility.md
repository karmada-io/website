---
title: Kubernetes 兼容性
---

本文档全面阐述了 Karmada 与 Kubernetes 版本的兼容性，主要从两个维度进行说明：
- Karmada 控制平面 API 支持：支持哪些 API？
- Kubernetes 版本支持：支持哪些 Kubernetes 版本？

本文档帮助管理员理解 Karmada 如何管理混合 Kubernetes 版本集群间的资源。通过遵循各集群的 API 能力确保安全分发，并提供在升级或迁移过程中维护
兼容性的指导原则。

## Karmada 控制平面 API 支持

Karmada 支持其使用的 kube-apiserver 版本中所有可用的 Kubernetes API。例如，如 Karmada APIServer 使用 kube-apiserver@v1.32，
则继承支持 Kubernetes v1.32 中所有 API（如 Deployment、Service、Ingress）及 API 版本（如 apps/v1、networking.k8s.io/v1）。

除原生 Kubernetes API 外，Karmada 可通过以下与 Kubernetes 相同的扩展机制增强能力：
- **CRD 扩展**：大多数 Karmada 特有 API（如 PropagationPolicy、OverridePolicy）通过 CRD 实现。用户也可在 Karmada 中定义自定义 CRD，并像原生 Kubernetes API 一样分发到成员集群。
- **聚合 APIServer**：Karmada 的 Cluster API 通过 karmada-aggregated-apiserver 扩展，用户可直接通过 Karmada 统一 API 端点查询成员集群资源（如 Nodes、Pods）。
  用户可以通过与扩展 Kubernetes 相同的方式扩展 Karmada 的 API 能力，无论是自定义资源还是第三方集成。

要查看所有支持的 API，请对 Karmada 执行 `karmadactl api-resources` 命令，该命令会列出包括 Kubernetes API 和扩展 API 在内的所有支持API，输出示例如下：
```
# karmadactl api-resources 
NAME                                       SHORTNAMES   APIVERSION                        NAMESPACED   KIND
pods                                       po           v1                                true         Pod
deployments                                deploy       apps/v1                           true         Deployment
clusters                                                cluster.karmada.io/v1alpha1       false        Cluster
overridepolicies                           op           policy.karmada.io/v1alpha1        true         OverridePolicy
propagationpolicies                        pp           policy.karmada.io/v1alpha1        true         PropagationPolicy
...
```

## Kubernetes 版本支持

Karmada 使用最小化的稳定 API 和端点管理 Kubernetes 集群，确保广泛的 Kubernetes 版本兼容性。每个 Karmada 版本集成最新的 Kubernetes 客户端，
并测试最近 10 个 Kubernetes 版本的兼容性。例如，Karmada v1.14 使用 Kubernetes 客户端 v1.32，会集成验证 Kubernetes v1.23 至 v1.32 版本。

资源仅在 Karmada 和目标集群均支持其 API 时才能被分发：
- 若 Karmada 无法识别 API（如不支持的 CRD 或已弃用的 API），则无法在 Karmada 中创建资源
- 若成员集群缺少 API（如旧版本集群缺少 networking.k8s.io/v1/Ingress），Karmada 将跳过对该集群的分发

## 常见问题解答

### 如何选择 Karmada APIServer 版本？

Karmada 项目会在其安装工具（如 Karmada Operator）中自动更新默认的 kube-apiserver 版本以支持最新 Kubernetes API。大多数情况下用户无需修改，即使升级 Karmada 时也无需调整。

您可能需要升级 Karmada APIServer 的情况包括：
- 采用新 Kubernetes API：需要利用新版 Kubernetes 特性
- 修复 CVE 漏洞：解决旧版本存在的安全隐患

注意升级需谨慎操作：
- 检查 API 弃用情况：确保工作负载使用的资源类型在目标 Kubernetes 版本中未被弃用
- 逐步升级：始终逐个次版本升级（如 kube-apiserver@v1.32 → v1.33），避免跨版本升级（如 v1.32 → v1.34）。Kubernetes 依赖渐进式 API 弃用和自动转换机制来安全迁移弃用 API。

### 如何处理版本跨度大的成员集群？

当成员集群存在 API 版本不兼容时（如部分支持 networking.k8s.io/v1，部分仅支持 v1beta1），目前 Karmada 不会根据成员集群能力自动转换 API 版本。
建议将过时集群升级至新 Kubernetes 版本。
