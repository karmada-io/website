---
title: 调度过量保护
---

## 概述

Karmada 调度器按顺序处理调度任务，并依赖 `karmada-scheduler-estimator` 来确定集群的可用容量。
由于 estimator 基于已绑定到节点的 Pod 计算容量，因此存在固有的时序窗口：调度器将工作负载分配给集群后，
这些工作负载需要一段时间才能完成分发、创建并绑定到节点。如果新的调度请求在此窗口期内到达，
estimator 将基于陈旧快照进行计算，可能在多个连续调度决策中对同一集群资源进行过量分配。

本特性引入**调度过量保护**，通过调度器与 estimator 之间的"假定与扣减"机制消除这一时序窗口，
确保工作负载被准确分配到具有真实可用容量的集群，而不会因资源耗尽而陷入静默 Pending 状态。

有关本特性的详细设计，请参阅原始
[提案](https://github.com/karmada-io/karmada/blob/master/docs/proposals/scheduling/estimator-reservation/README.md)。

## 前提条件

- 本特性仅适用于使用 `ReplicaSchedulingType: Divided` 且采用容量感知分配偏好（`Aggregated` 或
  `DynamicWeight`）的工作负载。静态权重分配（`Weighted` 配合静态权重配置）完全基于预配置的权重
  分配副本，不参考集群资源可用量，因此不受影响。`Duplicated` 模式的工作负载同样不受影响。

## 启用特性

`SchedulingOvercommitProtection` 是一个 Alpha 阶段的 feature gate（默认关闭）。需要在
`karmada-scheduler` 和 `karmada-scheduler-estimator` **两个组件上同时启用**，
仅在一侧启用不会生效。

### karmada-scheduler

在组件启动参数中添加 feature gate：

```shell
--feature-gates=SchedulingOvercommitProtection=true
```

### karmada-scheduler-estimator

在组件启动参数中添加 feature gate：

```shell
--feature-gates=SchedulingOvercommitProtection=true
```

## 限制与约束

- 若 `karmada-scheduler` 重启，所有假定记录将丢失且不会自动重建。
  在重启到工作负载实际资源消耗反映至集群状态的这段时间内，仍可能发生过量分配。
- 假定记录在资源解释器通过 `InterpretHealthy` 将工作负载判定为健康后释放。然而，该健康信号
  的到达时间可能远落后于工作负载的 Pod 已绑定到节点的时间（例如启动耗时较长的 FlinkDeployment）。
  在此窗口期内，estimator 会同时扣减 Pod 的实际资源占用和假定记录，造成双重扣减，导致集群可用
  容量被低估。TTL（5 分钟）作为兜底机制负责清理过期的假定记录，但该值目前不支持用户自定义配置。
- 对于 CRD 工作负载，假定记录的主动释放依赖资源解释器中配置的 `InterpretHealthy` 钩子。
  若未配置该钩子，调度器无法感知工作负载何时变为健康状态，假定记录将只能等待 TTL 到期后才被清理。
