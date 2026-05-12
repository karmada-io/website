---
title: 故障迁移概述
---

故障迁移（Failover）是 Karmada 的核心高可用能力。当集群或应用出现故障时，Karmada 会自动将工作负载迁移到健康的集群，确保服务持续可用。

## 故障迁移类型

Karmada 支持两种级别的故障迁移，以应对不同的故障场景：

| 维度 | 集群故障迁移 | 应用故障迁移 |
|------|-------------|-------------|
| **触发条件** | 整个集群不健康（不可达或未就绪） | 单个应用在集群上不健康，而集群本身可能仍然健康 |
| **典型场景** | 集群宕机、网络分区、基础设施升级 | 资源抢占、竞价实例回收、应用层错误 |
| **核心机制** | 集群 `NoExecute` 污点 → 工作负载驱逐 → 重新调度 | `interpretHealth` 检查失败 → 应用驱逐 → 重新调度 |
| **配置字段** | PropagationPolicy 的 `.spec.failover.cluster` | PropagationPolicy 的 `.spec.failover.application` |
| **所需特性开关** | `Failover`（Beta，默认关闭） | `GracefulEviction`（Beta，默认开启） |

## 集群故障迁移工作原理

下图展示了集群故障迁移的端到端流程：

```
集群状态变化
       │
       ▼
cluster-controller 检测到集群不健康
       │
       ▼
自动添加 NoSchedule 污点
（NoExecute 污点通过 ClusterTaintPolicy 或手动方式添加）
       │
       ▼
taint-manager 检测到 NoExecute 污点
       │
       ▼
工作负载被驱逐（加入优雅驱逐任务队列）
       │
       ▼
karmada-scheduler 将工作负载重新调度到健康集群
       │
       ▼
gracefulEviction 控制器在新集群就绪后
（或超时后）删除被驱逐集群上的工作负载
```

## 特性开关参考

| 特性开关 | 阶段 | 默认值 | 说明 |
|---------|------|--------|------|
| `Failover` | Beta | **关闭** | 集群故障迁移所需。启用基于污点的工作负载驱逐和重新调度。 |
| `GracefulEviction` | Beta | 开启 | 集群和应用故障迁移的优雅驱逐所需。延迟删除旧工作负载，直到新集群就绪。 |
| `PropagateDeps` | Beta | 开启 | 应用故障迁移所需。确保应用依赖项随应用一同迁移。 |
| `StatefulFailoverInjection` | Alpha | **关闭** | 有状态应用故障迁移所需。启用通过 JSONPath 规则注入状态数据的能力。 |

## 下一步

- [集群健康监控](./cluster-status-maintenance.md) — 了解 Karmada 如何监控集群健康状态，以及如何判断集群不健康。
- [集群污点管理](./cluster-taint-management.md) — 了解集群污点的管理方式，以及如何配置 `ClusterTaintPolicy` 实现污点规则自动化。
- [集群故障迁移](./cluster-failover.md) — 配置集群级故障迁移行为，包括驱逐模式、状态保留和驱逐速率限制。
- [集群故障迁移机制详解](./cluster-failover-internals.md) — 深入了解 `Duplicated` 和 `Divided` 调度类型的重调度逻辑以及优雅驱逐机制。
- [应用故障迁移](./application-failover.md) — 配置应用级故障迁移，处理集群健康但特定应用不健康的场景。
