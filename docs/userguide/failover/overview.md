---
title: Failover Overview
---

Failover is a core high-availability capability of Karmada. It ensures that when a cluster or an application becomes unhealthy, workloads are automatically migrated to healthy clusters, keeping services continuously available.

## Failover Types

Karmada supports two levels of failover to handle different failure scenarios:

| Dimension | Cluster Failover | Application Failover |
|-----------|-----------------|----------------------|
| **Trigger** | The entire cluster is unhealthy (unreachable or not-ready) | An individual application is unhealthy on a cluster while the cluster itself may still be healthy |
| **Typical Scenarios** | Cluster outage, network partition, infrastructure upgrade | Resource preemption, spot instance reclamation, application-level errors |
| **Mechanism** | `NoExecute` taint on cluster → workload eviction → rescheduling | `interpretHealth` check fails → application eviction → rescheduling |
| **Configuration Field** | `.spec.failover.cluster` in PropagationPolicy | `.spec.failover.application` in PropagationPolicy |
| **Required Feature Gates** | `Failover` (Beta, off by default) | `GracefulEviction` (Beta, on by default) |

## How Cluster Failover Works

The following diagram illustrates the end-to-end cluster failover flow:

```
Cluster Status Change
        │
        ▼
cluster-controller detects unhealthy cluster
        │
        ▼
NoSchedule taint added automatically
(NoExecute taint added via ClusterTaintPolicy or manually)
        │
        ▼
taint-manager detects NoExecute taint
        │
        ▼
Workloads evicted from cluster (added to graceful eviction queue)
        │
        ▼
karmada-scheduler reschedules workloads to healthy clusters
        │
        ▼
gracefulEviction controller removes evicted workloads
after new cluster is healthy (or timeout is reached)
```

## Feature Gates Reference

| Feature Gate | Stage | Default | Description |
|-------------|-------|---------|-------------|
| `Failover` | Beta | **Off** | Required for cluster failover. Enables taint-based workload eviction and rescheduling. |
| `GracefulEviction` | Beta | On | Required for graceful eviction during both cluster and application failover. Delays removal of old workloads until new cluster is ready. |
| `PropagateDeps` | Beta | On | Required for application failover. Ensures application dependencies are migrated together. |
| `StatefulFailoverInjection` | Alpha | **Off** | Required for stateful application failover. Enables state data injection via JSONPath rules. |

## Next Steps

- [Cluster Health Monitoring](./cluster-status-maintenance.md) — Understand how Karmada monitors cluster health and determines when a cluster is unhealthy.
- [Cluster Taint Management](./cluster-taint-management.md) — Learn how taints are managed on clusters, and how to configure `ClusterTaintPolicy` to automate taint rules.
- [Cluster Failover](./cluster-failover.md) — Configure cluster-level failover behavior, including purge mode, state preservation, and eviction rate limiting.
- [Cluster Failover Internals](./cluster-failover-internals.md) — Deep-dive into the rescheduling logic for `Duplicated` and `Divided` scheduling types and the graceful eviction mechanism.
- [Application Failover](./application-failover.md) — Configure application-level failover to handle scenarios where a cluster is healthy but a specific application is not.
