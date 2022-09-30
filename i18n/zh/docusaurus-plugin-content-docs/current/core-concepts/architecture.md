---
title: 产品架构
---

Karmada 的整体架构如下图所示：

![产品架构](../resources//architecture.png)

Karmada 控制平面包含以下组件：

- Karmada API 服务器组件
- Karmada 控制器管理组件
- Karmada 调度组件

ETCD 存储着 karmada API 对象，API 服务器组件是所有组件通信的 REST 端点， Karmada 控制器管理组件根据用户通过 API 服务器组件创建的 API 对象执行操作。

Karmada 控制器管理组件负责运行各种控制器，控制器负责监视 karmada 对象，然后与底层集群的 API 服务器通信以创建常规的 Kubernetes 资源。

1. 集群控制器：将 kubernetes 集群链接到 Karmada，通过创建集群对象来管理集群的生命周期。
2. 策略控制器：控制器监视 PropagationPolicy 对象。在添加 PropagationPolicy 对象时，它会选择与 resourceSelector 匹配的一组资源，并为每个资源对象创建 ResourceBinding。
3. 绑定控制器：控制器监视 ResourceBinding 对象并创建与单个资源清单对应的每个集群的 Work 对象。
4. 执行控制器：控制器监视 Work 对象。当 Work 对象创建时，它将资源分配给成员集群。
