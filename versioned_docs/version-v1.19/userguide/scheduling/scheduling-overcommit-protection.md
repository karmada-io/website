---
title: Scheduling Overcommit Protection
---

## Overview

The Karmada scheduler processes scheduling tasks sequentially, but it relies on the
`karmada-scheduler-estimator` to determine available cluster capacity. Because the estimator
computes capacity based on Pods already bound to nodes, there is an inherent timing gap: after the
scheduler assigns workloads to a cluster, it takes time for those workloads to be distributed,
created, and bound to nodes. If new scheduling requests arrive during this window, the estimator
operates on a stale snapshot and may over-commit the same cluster's resources across multiple
consecutive scheduling decisions.

This feature introduces **Scheduling Overcommit Protection** to close this gap with an
"assume and deduct" mechanism between the scheduler and the estimator.

This eliminates resource over-commitment in high-throughput scheduling scenarios, ensuring
workloads are accurately distributed to clusters with genuine available capacity rather than
silently Pending due to resource exhaustion.

For a detailed description of this feature, see the original
[proposal](https://github.com/karmada-io/karmada/blob/master/docs/proposals/scheduling/estimator-reservation/README.md).

## Prerequisites

- This feature only applies to workloads using `ReplicaSchedulingType: Divided` with a
  capacity-aware division preference (`Aggregated` or `DynamicWeight`). Static-weight division
  (`Weighted` with static weight preferences) assigns replicas purely based on configured weights
  without consulting cluster resource availability, and is therefore unaffected. Workloads in
  `Duplicated` mode are also unaffected.

## Enabling the Feature

`SchedulingOvercommitProtection` is an Alpha feature gate (disabled by default). It must be
enabled on **both** `karmada-scheduler` and `karmada-scheduler-estimator`. Enabling it on only
one side has no effect.

### karmada-scheduler

Add the feature gate to the component startup flags:

```shell
--feature-gates=SchedulingOvercommitProtection=true
```

### karmada-scheduler-estimator

Add the feature gate to the component startup flags:

```shell
--feature-gates=SchedulingOvercommitProtection=true
```

## Limitations and Constraints

- If `karmada-scheduler` restarts, all cached assumptions are lost and will not be rebuilt
  automatically. During the window between a restart and the actual resource consumption becoming
  visible in cluster status, over-commitment is still possible.
- Assumption records are released when the resource interpreter reports the workload as healthy
  (via `InterpretHealthy`). However, this healthy signal may arrive well after the workload's
  Pods have already been bound to nodes and their resource consumption is visible to the estimator.
  During this window, both the actual Pod resource usage and the assumption record are deducted
  simultaneously, causing the estimator to underestimate available cluster capacity
  (double deduction). A TTL of 5 minutes serves as a fallback to clean up stale assumption
  records, but this value is not currently user-configurable.
- For CRD workloads, proactive release of assumption records requires an `InterpretHealthy` hook
  to be configured in the resource interpreter. Without it, the scheduler cannot determine when
  the workload becomes healthy, and assumption records will only be cleaned up when the TTL
  expires.
