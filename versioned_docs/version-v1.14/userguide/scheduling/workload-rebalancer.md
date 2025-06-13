---
title: Workload Rebalance
---

In general, once workload replicas are scheduled, the scheduling result remains fixed, and the replica propagation does not change. Even if rescheduling is triggered by modifying replicas or placement configuration, the system will try to maintain the existing replica propagation as closely as possible, making only minimal adjustments when necessary. This approach minimizes disruptions and preserves balance across clusters.

However, in some scenarios, users may wish to actively trigger a fresh rescheduling, disregarding the previous propagation entirely to establish a new replica propagation across clusters.

## Applicable Scenarios

### Scenario 1

In a cluster failover scenario, replicas are propagated across two clusters, member1 and member2. If the member1 cluster fails, all replicas would migrate to the member2 cluster.

As a cluster administrator, I would like the replicas to be repropagated across both clusters when member1 recovers, allowing the resources of the member1 cluster to be re-utilized and enhancing high availability.

### Scenario 2

In application-level failover, low-priority applications may be preempted, resulting in shrinking from multi clusters
to single cluster due to limited cluster resources
(refer to [Application-level Failover](https://karmada.io/docs/next/userguide/failover/application-failover#why-application-level-failover-is-required)).

As a user, I would like the replicas of low-priority applications to be repropagated across multiple clusters when resources are sufficient, ensuring high availability for the application.

### Scenario 3

In the `Aggregated` scheduling type, replicas may still be propagated across multiple clusters due to resource constraints.

As a user, I would like the replicas to be propagated in an aggregated strategy when any cluster has
sufficient resource to accommodate all replicas, so that the application better meets actual business requirements.

### Scenario 4

In a disaster-recovery scenario, replicas migrate from a primary cluster to a backup cluster in the event of a primary cluster failure.

As a cluster administrator, I would like replicas to migrate back once the primary cluster is restored, so that:

1. disaster-recovery mode is reestablished, to ensure the reliability and stability of the cluster federation.
2. backup cluster costs are reduced.

## Feature of WorkloadRebalancer

### Reschedule a workload

Assume that you want to trigger the rescheduling of a deployment named `demo-deploy`. You can just apply the following
WorkloadRebalancer.

```yaml
apiVersion: apps.karmada.io/v1alpha1
kind: WorkloadRebalancer
metadata:
  name: demo
spec:
  workloads:
    - apiVersion: apps/v1
      kind: Deployment
      name: demo-deploy
      namespace: default
```

Then, scheduler will reschedule this deployment, which disregards the previous propagation entirely and seeks 
to establish an entirely new replica propagation across clusters.

* If it succeeds, you will get the following result:

```yaml
apiVersion: apps.karmada.io/v1alpha1
kind: WorkloadRebalancer
metadata:
  name: demo
  generation: 1
  creationTimestamp: "2024-05-22T11:16:10Z"
spec:
  ...
status:
  finishTime: "2024-05-22T11:16:10Z"
  observedGeneration: 1
  observedWorkloads:
    - result: Successful
      workload:
        apiVersion: apps/v1
        kind: Deployment
        name: demo-deploy
        namespace: default
```

* If the resource binding of `deployments/demo-deploy` does not exist, you will get the following result:

```yaml
apiVersion: apps.karmada.io/v1alpha1
kind: WorkloadRebalancer
metadata:
  name: demo
  generation: 1
  creationTimestamp: "2024-05-22T11:16:10Z"
spec:
  ...
status:
  finishTime: "2024-05-22T11:16:10Z"
  observedGeneration: 1
  observedWorkloads:
    - reason: ReferencedBindingNotFound
      result: Failed
      workload:
        apiVersion: apps/v1
        kind: Deployment
        name: demo-deploy
        namespace: default
```

* If an abnormal failure occurs during processing, such as a network problem or a throttling issue, the WorkloadRebalancer will continue to retry and you will get the following result:

```yaml
apiVersion: apps.karmada.io/v1alpha1
kind: WorkloadRebalancer
metadata:
  name: demo
  generation: 1
  creationTimestamp: "2024-05-22T11:26:10Z"
spec:
  ...
status:
  observedGeneration: 1
  observedWorkloads:
    - workload:
        apiVersion: apps/v1
        kind: Deployment
        name: demo-deploy
        namespace: default
```

> tip: there will be no `finishTime` in status field, nor `result/reason` field in each observed workload in this case 
> since it still retrying.

### Reschedule a batch of resources

In actual scenarios, you need to trigger rescheduling in the application dimension, that is, you need to trigger 
rescheduling of a batch of resources. Assuming the resources are `deployment/demo-deploy`, `configmap/demo-config` and
`clusterrole/demo-role`, you can define the WorkloadRebalancer like this:

```yaml
apiVersion: apps.karmada.io/v1alpha1
kind: WorkloadRebalancer
metadata:
  name: demo
spec:
  workloads:
    - apiVersion: apps/v1
      kind: Deployment
      name: demo-deploy
      namespace: default
    - apiVersion: v1
      kind: ConfigMap
      name: demo-config
      namespace: default
    - apiVersion: rbac.authorization.k8s.io/v1
      kind: ClusterRole
      name: demo-role
```

You will get the following result:

```yaml
apiVersion: apps.karmada.io/v1alpha1
kind: WorkloadRebalancer
metadata:
  name: demo
  generation: 1
  creationTimestamp: "2024-05-22T11:36:10Z"
spec:
  ...
status:
  finishTime: "2024-05-22T11:36:10Z"
  observedGeneration: 1
  observedWorkloads:
    - result: Successful
      workload:
        apiVersion: apps/v1
        kind: Deployment
        name: demo-deploy
        namespace: default
    - result: Successful
      workload:
        apiVersion: rbac.authorization.k8s.io/v1
        kind: ClusterRole
        name: demo-role
    - result: Successful
      workload:
        apiVersion: v1
        kind: ConfigMap
        name: demo-config
        namespace: default
```

> tip: the observedWorkloads is ordered according to the dictionary order of apiVersion, kind, namespace, and name.

### Modify WorkloadRebalancer

The rebalancer also supports updates, the guideline is:

* if a new workload is added to spec list, just add it into the status list too and do the rebalance.
* if a workload is deleted from the previous spec list, keep it in status list if it had already succeeded, and remove it if not.
* if a workload is modified, just regard it as a deletion of the old one and an insertion of a new one.

Assume the current WorkloadRebalancer is as follows:

```yaml
apiVersion: apps.karmada.io/v1alpha1
kind: WorkloadRebalancer
metadata:
  name: demo
  generation: 1
  creationTimestamp: "2024-05-22T11:36:10Z"
spec:
  workloads:
    - apiVersion: apps/v1
      kind: Deployment
      name: demo-deploy-1
      namespace: default
    - apiVersion: apps/v1
      kind: Deployment
      name: demo-deploy-2
      namespace: default
status:
  finishTime: "2024-05-22T11:36:10Z"
  observedGeneration: 1
  observedWorkloads:
    - result: Successful
      workload:
        apiVersion: apps/v1
        kind: Deployment
        name: demo-deploy-1
        namespace: default
    - reason: ReferencedBindingNotFound
      result: Failed
      workload:
        apiVersion: apps/v1
        kind: Deployment
        name: demo-deploy-2
        namespace: default
```

Now, if I edit target workloads from `demo-deploy-1` + `demo-deploy-2` to only `demo-deploy-3`, the result will be:

```yaml
apiVersion: apps.karmada.io/v1alpha1
kind: WorkloadRebalancer
metadata:
  name: demo
  generation: 2
  creationTimestamp: "2024-05-22T11:36:10Z"
spec:
  workloads:
    - apiVersion: apps/v1
      kind: Deployment
      name: demo-deploy-3
      namespace: default
status:
  finishTime: "2024-05-22T11:40:10Z"
  observedGeneration: 2
  observedWorkloads:
    - result: Successful
      workload:
        apiVersion: apps/v1
        kind: Deployment
        name: demo-deploy-1
        namespace: default
    - result: Successful
      workload:
        apiVersion: apps/v1
        kind: Deployment
        name: demo-deploy-3
        namespace: default
```

You can see in `status.observedWorkloads`:

* `demo-deploy-1` is not specified in latest `spec`, but it had already succeeded, so it keep existing in `status`.
* `demo-deploy-2` is not specified in latest `spec` and it once failed, so it is removed from `status`.
* `demo-deploy-3` is newly added in latest `spec`, so it is added to `status`.

### Auto clean WorkloadRebalancer

You can use `spec.ttlSecondsAfterFinished` to specify when the object will be automatically deleted after it
finished execution (finished execution means each target workload is finished with result of `Successful` or `Failed`).

The guideline is:

* If this field is set, `ttlSecondsAfterFinished` seconds after the WorkloadRebalancer finishes, it will be automatically deleted.
* If this field is unset, the WorkloadRebalancer won't be automatically deleted.
* If this field is set to zero, the WorkloadRebalancer will be deleted immediately right after it finishes.

Here is an example:

```yaml
apiVersion: apps.karmada.io/v1alpha1
kind: WorkloadRebalancer
metadata:
  name: demo
spec:
  ttlSecondsAfterFinished: 60
  workloads:
    - apiVersion: apps/v1
      kind: Deployment
      name: demo-deploy
      namespace: default
```

Then, it will be deleted 60 seconds after the WorkloadRebalancer finished execution.

## What's next

For a detailed demo of the workload rebalancer you can refer to the tutorial [Workload Rebalancer](../../tutorials/workload-rebalancer.md)
