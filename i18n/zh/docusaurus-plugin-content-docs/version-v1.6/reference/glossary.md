---
title: 词汇表
---

此术语表旨在提供 Karmada 术语的完整、标准列表。其中包含特定于 Karmada 的技术术语以及能够构造有用的语境的一般性术语。

* Aggregated API

聚合API，由 `karmada-aggregated-apiserver` 提供。它能够聚合所有注册的集群，并允许用户通过 Karmada 的 `cluster/proxy` 端点统一访问不同的成员集群。

* ClusterAffinity

类似于 K8s，ClusterAffinity 是指一组规则，它们为调度器提供在哪个集群部署应用的提示信息。

* GracefulEviction

优雅驱逐，指工作负载在集群间迁移时，驱逐将被推迟到工作负载在新集群上启动或是达到最大宽限期之后才被执行。
优雅驱逐可以帮助应用在多集群故障迁移时服务不断服，实例不跌零。

* OverridePolicy

跨集群可重用的差异化配置策略。

* Overrider

Overrider 是指 Karmada 提供的一系列差异化配置规则，如 ImageOverrider 差异化配置工作负载的镜像。

* Propagate Dependencies(PropagateDeps)

依赖跟随分发，是指应用在下发至某个集群时，Karmada能自动将它的依赖同时分发至同一个集群。依赖不经过调度流程，而是复用主体应用的调度结果。
复杂应用的依赖解析，可以通过资源解释器的 `InterpretDependency` 操作进行解析。

* PropagationPolicy

可重用的应用多集群调度策略。

* Pull Mode

Karmada 管理集群的一种模式，Karmada 控制面将不会直接访问成员集群，而是将职责委托给部署于成员集群的 `karmada-agent`。

* Push Mode

Karmada 管理集群的一种模式，Karmada 控制面将直接访问成员集群的 `kube-apiserver` 来获取集群状态和部署应用。

* ResourceBinding

Karmada 的通用类型，驱动内部流程，包含应用的模板信息和调度策略信息，是 Karmada 调度器在调度应用时的处理对象。

* Resource Interpreter

在将资源从 `karmada-apiserver` 分发到成员集群的过程中，Karmada 需要了解资源的定义结构，例如在 Deployment 的拆分调度时， Karmada 需要解析 Deployment 资源的 replicas 字段。
资源解释器专为解释资源结构而设计，它包括两类解释器，内置解释器用于解释常见的 Kubernetes 原生资源或一些知名的扩展资源，由社区实现并维护，而自定义解释器用于解释自定义资源或覆盖内置解释器，由用户实现和维护。

* Resource Model

资源模型，是成员集群的资源状态在 Karmada 控制面的抽象，在根据集群余量进行实例的调度过程中，Karmada 调度器会基于集群的资源模型做出决策。

* Resource Template

资源模板，指包含 CRD 在内的 K8s 原生 API 定义，泛指多集群应用的模板。

* SpreadConstraint

分发约束，指基于集群拓扑的调度约束，可根据集群所在的region、provider、zone等信息进行调度。

* Work

成员集群最终资源在联邦层的映射，不同成员集群通过命名空间隔离。