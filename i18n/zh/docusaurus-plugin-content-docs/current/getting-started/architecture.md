---
title: 系统架构
---

Karmada 的总体架构如下所示：

![架构]（../resources//Architecture.png）

Karmada 控制平面包含以下组件：

- Karmada API Server
- Karmada Controller Manager
- Karmada Scheduler

ETCD 存储 Karmada API 对象，API Server 是与所有其他组件通信的 REST 端点，Karmada Controller Manager 根据 API 服务器创建的 API 对象执行操作。

Karmada Controller Manager 负责运行各种控制器来监测 Karmada 对象，然后与底层集群的 API 服务器进行通信，以创建常规的 Kubernetes 资源。

1. Cluster Controller：该控制器将 Kubernetes 集群接入到 Karmada，通过创建集群对象来管理集群的生命周期。

2. Policy Controller：该控制器监测 PropagationPolicy 对象。添加 PropagationPolicy 对象时，它会选择一组与 resourceSelector 匹配的资源，并用每个单独的资源对象创建 ResourceBinding。

3. Binding Controller：该控制器监测 ResourceBinding 对象，按照一个资源清单（manifest）创建每个集群对应的一个 Work 对象。

4. Execution Controller：该控制器监测 Work 对象。创建 Work 对象时，它会将这些资源分发给成员集群。

## 下一步
