---
title: 常见问题
---

## PropagationPolicy 与 ClusterPropagationPolicy 有什么区别？

`PropagationPolicy` 是一种作用于命名空间的资源类型，意味着这种类型的对象必须处于一个命名空间中。
而 `ClusterPropagationPolicy` 是作用于集群的资源类型，意味着这种类型的对象没有命名空间。

二者都用于保留分发声明，但其权能有所不同：
- PropagationPolicy：只能表示同一命名空间中资源的分发策略。
- ClusterPropagationPolicy：可以表示所有资源的分发策略，包括作用于命名空间和作用于集群的资源。

## 集群的 'Push' 和 'Pull' 模式有何区别？

请参阅 [Push 和 Pull 概述](../userguide/clustermanager/cluster-registration.md#overview-of-cluster-mode)。

## 为什么 Karmada 需要 `kube-controller-manager`？

`kube-controller-manager` 由许多控制器组成，Karmada 从其继承了一些控制器以保持一致的用户体验和行为。

值得注意的是，Karmada 并不需要所有控制器。
有关推荐的控制器，请参阅[Kubernetes 控制器](../administrator/configuration/configure-controllers.md#kubernetes-控制器)。


## 我可以在 Kubernetes 集群中安装 Karmada 并将 kube-apiserver 重用为 Karmada apiserver 吗？

技术上来说，答案是 `yes`。你可以在现有 Kubernetes 集群中安装 Karmada，并复用
`kube-apiserver` 作为 Karmada apiserver，而不是部署独立的
[karmada-apiserver](https://github.com/karmada-io/karmada/blob/master/artifacts/deploy/karmada-apiserver.yaml)。
在这种模式下，Karmada 也可以受益于现有 Kubernetes 控制平面的高可用能力。

不过，通常不建议将这种部署模式作为默认选择。如果你仍决定使用，请仔细评估以下事项：

- 这种方法尚未经过 Karmada 社区的全面测试，目前也没有计划将其作为推荐的部署模式。
- 复用 Kubernetes `kube-apiserver` 可能会增加 Karmada 系统的计算开销和调谐压力。
  例如，在你应用 `resource template`（如 `Deployment`）后，`kube-controller-manager` 可能会为该 `Deployment` 创建 `Pods` 并持续更新其状态。
  Karmada 控制器也可能会调谐这些变更，从而导致非预期的交互或冲突。
- Kubernetes 控制平面和 Karmada 控制平面将共享同一个 API server，因此其中一个系统中的运维问题、配置变更或资源压力可能会影响另一个系统。

一般来说，部署专用的 `karmada-apiserver` 更有利于实现清晰的隔离和更可预测的行为。
只有在你充分理解相关权衡并能够接受潜在风险时，才应考虑复用现有的 `kube-apiserver`。

## 为什么 Cluster API 没有 CRD YAML 文件?

Kubernetes 提供了两种方式来扩展 API：**定制资源**、**Kubernetes API 聚合层**。更多详细信息，您可以参考[扩展 Kubernetes API](https://kubernetes.io/docs/concepts/extend-kubernetes/)。

Karmada 使用了这两种扩展方式，例如，`PropagationPolicy` 和 `ResourceBinding` 使用**定制资源**，`Cluster` 资源使用**Kubernetes API 聚合层**。

因此，`Cluster` 资源没有 CRD YAML 文件，当执行 `kubectl get crd` 命令时也无法获取 `Cluster` 资源。

那么，为什么我们要使用**Kubernetes API 聚合层**来扩展 `Cluster` 资源，而不是使用**定制资源**呢？

这是因为我们需要为 `Cluster` 资源设置 `Proxy` 子资源，通过使用 `Proxy`，您可以访问成员集群中的资源，具体内容可以参考[聚合层 APIServer](https://karmada.io/zh/docs/next/userguide/globalview/aggregated-api-endpoint)。目前，**定制资源**还不支持设置 `Proxy` 子资源，这也是我们没有选择它的原因。

## 如何防止 Namespace 自动分发到所有成员集群？

Karmada 会默认将用户创建的 Namespace 资源分发到成员成员集群中，这个功能是由 `Karmada-controller-manager` 组件中的 `namespace` 控制器负责的，可以通过参考[配置 Karmada 控制器](../administrator/configuration/configure-controllers.md#配置-karmada-控制器)来进行配置。

当禁用掉 `namespace` 控制器之后，用户可以通过 `ClusterPropagationPolicy` 资源将 `Namespace` 资源分发到指定的集群中。