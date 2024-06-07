---
title: Workload Rebalance
---

In general case, after replicas of workloads is scheduled, it will keep the scheduling result inert
and the replicas distribution will not change. Even if reschedule is triggered by modifying replicas or placement,
it will maintain the exist replicas distribution as closely as possible, only making minimal adjustments when necessary,
which minimizes disruptions and preserves the balance across clusters.

However, in some scenarios, users hope to have approach to actively trigger a fresh rescheduling, which disregards the
previous assignment entirely and seeks to establish an entirely new replica distribution across clusters.

## Applicable Scenarios

### Scenario 1

In cluster failover scenario, replicas are distributed in member1 + member2 two clusters, however they would all migrate to
member2 cluster if member1 cluster fails.

As a cluster administrator, I hope the replicas redistribute to two clusters when member1 cluster recovered, so that
the resources of the member1 cluster will be re-utilized, also for the sake of high availability.

### Scenario 2

In application-level failover, low-priority applications may be preempted, resulting in shrinking from multi clusters
to single cluster due to cluster resources are in short supply
(refer to [Application-level Failover](https://karmada.io/docs/next/userguide/failover/application-failover#why-application-level-failover-is-required)).

As a user, I hope the replicas of low-priority applications can be redistributed to multi clusters when
cluster resources are sufficient to ensure the high availability of application.

### Scenario 3

In `Aggregated` schedule type, replicas may still distribute across multiple clusters due to resource constraints.

As a user, I hope the replicas to be redistributed in an aggregated strategy when any cluster has
sufficient resource to accommodate all replicas, so that the application better meets actual business requirements.


### Scenario 4

In disaster-recovery scenario, replicas migrated from primary cluster to backup cluster when primary cluster failure.

As a cluster administrator, I hope that replicas can migrate back when cluster restored, so that:

1. restore to the disaster-recovery mode to ensure the reliability and stability of the cluster federation.
2. save the cost of the backup cluster.

## Feature of WorkloadRebalancer

### Reschedule a workload

Assuming here is deployment named `demo-deploy`, and you want to trigger the rescheduling of it. You can just apply
following WorkloadRebalancer.

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

Then, scheduler will do a rescheduling to this deployment, which disregards the previous assignment entirely and seeks 
to establish an entirely new replica distribution across clusters.

* If it succeeds, you will get following result:

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

* If the resource binding of `deployments/demo-deploy` not exist, you will get following result:

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

* If an exception fails during processing, such as a network problem or a throttling problem, the rebalancer will keep retrying,
and you will get following result:

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

you can get result like this:

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

The rebalancer can also support update, the guideline is:

* a new workload added to spec list, just add it into status list too and do the rebalance.
* a workload deleted from previous spec list, keep it in status list if already success, and remove it if not.
* a workload is modified, just regard it as deleted an old one and inserted a new one.

Assuming the current WorkloadRebalancer is as follows:

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

Now, if I edit target workloads from `demo-deploy-1` + `demo-deploy-2` to only `demo-deploy-3`, result will be:

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

* `demo-deploy-1` is not specified in latest `spec`, but it is already succeed, so it keep exists in `status`.
* `demo-deploy-2` is not specified in latest `spec` and it once failed, so it is removed from `status`.
* `demo-deploy-3` is newly add in latest `spec`, so it is added to `status`.

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

For detail demo of workload rebalancer you can refer to the tutorial [Workload Rebalancer](../../tutorials/workload-rebalancer.md)
