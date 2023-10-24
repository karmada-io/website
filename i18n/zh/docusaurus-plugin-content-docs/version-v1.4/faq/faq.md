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
有关推荐的控制器，请参阅[推荐的控制器](../administrator/configuration/configure-controllers.md#recommended-controllers)。


## 我可以在 Kubernetes 集群中安装 Karmada 并将 kube-apiserver 重用为 Karmada apiserver 吗？

答案是 `yes`。在这种情况下，你可以在部署
[karmada-apiserver](https://github.com/karmada-io/karmada/blob/master/artifacts/deploy/karmada-apiserver.yaml)
时节省不少时间，只需在 Kubernetes 和 Karmada 之间共享 APIServer 即可。
此外，这样可以无缝继承原集群的高可用能力。我们确实有一些用户以这种方式使用 Karmada。

不过在此之前你需要注意以下几点：

- 这种方法尚未经过 Karmada 社区的全面测试，也没有相关测试计划。
- 这种方法会增加 Karmada 系统的计算成本。
  以 `Deployment` 为例采用 `resource template` 后，`kube-controller` 会为 Deployment 创建 `Pods` 并持续更新状态，Karmada 系统也会协调这些变化，所以可能会发生冲突。

待办事项：一旦有相关使用案例，我们将添加相应链接。
