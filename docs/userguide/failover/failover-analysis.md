---
title: Cluster Failover Process Analysis
---

Let's briefly analyze the Karmada failover feature.

## Add taints on fault cluster

After the [cluster status becomes unhealthy](./cluster-status-maintenance.md), a `taint{effect: NoSchedule}` will be added to the cluster as follows:

- when cluster's `Ready` condition is `False`, Karmada controller will add the following taint to the cluster object:

```yaml
key: cluster.karmada.io/not-ready
effect: NoSchedule
```

- when cluster's `Ready` condition is `Unknown`, Karmada controller will add the following taint to the cluster object:

```yaml
key: cluster.karmada.io/unreachable
effect: NoSchedule
```

In addition, Karmada controller will not actively add `NoExecute` taints to cluster objects. Users can actively manage taints on cluster objects, including `NoExecute` taints, through the [cluster taint management](./cluster-taint-management.md) feature.

## Failover

When Karmada detects that a cluster has been tainted with `NoExecute` and the taint cannot be tolerated by the toleration strategy in `PropagationPolicy/ClusterPropagationPolicy`, Karmada controller will remove the cluster from the resource scheduling result, and then Karmada scheduler will reschedule the target workload.

There are several constraints:
- For each rescheduled application, it still needs to meet the restrictions of `PropagationPolicy/ClusterPropagationPolicy`, such as ClusterAffinity or SpreadConstraints.
- The application distributed on the ready clusters after the initial scheduling will remain when failover schedule.

### Duplicated schedule type

For `Duplicated` schedule policy, when the number of candidate clusters that meet the PropagationPolicy restriction is not less than the number of failed clusters,
it will be rescheduled to candidate clusters according to the number of failed clusters. Otherwise, no rescheduling. The candidate cluster refers to the newly calculated cluster scheduling result in this scheduling process, which is different from the scheduled cluster in the last scheduling result.

Take `Deployment` as example:

<details>
<summary>unfold me to see the yaml</summary>

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - image: nginx
        name: nginx
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
        - member3
        - member5
    spreadConstraints:
      - maxGroups: 2
        minGroups: 2
    replicaScheduling:
      replicaSchedulingType: Duplicated
```
</details>

Suppose there are 5 member clusters, and the initial scheduling result is in member1 and member2. When member2 fails, it triggers rescheduling.

It should be noted that rescheduling will not delete the application on the ready cluster member1. In the remaining 3 clusters, only member3 and member5 match the `clusterAffinity` policy.

Due to the limitations of spreadConstraints, the final result can be [member1, member3] or [member1, member5].

### Divided schedule type
For `Divided` schedule policy, karmada scheduler will try to migrate replicas to the other health clusters.

Take `Deployment` as example:

<details>
<summary>unfold me to see the yaml</summary>

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - image: nginx
        name: nginx
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
    replicaScheduling:
      replicaDivisionPreference: Weighted
      replicaSchedulingType: Divided
      weightPreference:
        staticWeightList:
          - targetCluster:
              clusterNames:
                - member1
            weight: 1
          - targetCluster:
              clusterNames:
                - member2
            weight: 2
```
</details>

Karmada scheduler will divide the replicas according the `weightPreference`. The initial schedule result is member1 with 1 replica and member2 with 2 replicas.

When member1 fails, it triggers rescheduling. Karmada scheduler will try to migrate replicas to the other health clusters. The final result will be member2 with 3 replicas.

## Graceful eviction feature

In order to prevent service interruption during cluster failover, Karmada need to ensure the removal of evicted workloads will be delayed until the workloads are available on new clusters.

The [GracefulEvictionTasks](https://github.com/karmada-io/karmada/blob/12e8f01d01571932e6fe45cb7f0d1bffd2e40fd9/pkg/apis/work/v1alpha2/binding_types.go#L75-L89) field is added to `ResourceBinding/ClusterResourceBinding` to indicate the eviction task queue.

When the faulty cluster is removed from the resource scheduling result by `taint-manager`, it will be added to the eviction task queue.

The `gracefulEviction` controller is responsible for processing tasks in the eviction task queue. During the procession, the The `gracefulEviction` controller evaluates whether the current task can be removed form the eviction task queue one by one. The judgement conditions are as follows:
- Check the health status of the current resource scheduling result. If the resource health status is healthy, the condition is met.
- Check whether the waiting duration of the current task exceeds the timeout interval, which can be configured via `graceful-eviction-timeout` flag(default is 10 minutes). If exceeds, and meets the condition.
