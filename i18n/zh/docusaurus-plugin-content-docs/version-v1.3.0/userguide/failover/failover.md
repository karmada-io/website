---
title: Failover Overview
---

## Monitor the cluster health status

Karmada supports both `Push` and `Pull` modes to manage member clusters.

More details about cluster registration please refer to [Cluster Registration](../clustermanager/cluster-registration.md#cluster-registration).

### Determine cluster failures

For clusters there are two forms of heartbeats:
- updates to the `.status` of a Cluster(include both `Push` and `Pull` mode).
- `Lease` objects within the `karmada-cluster` namespace in karmada control plane. Each `Pull` mode cluster has an associated `Lease` object.

#### Collect cluster status

For `Push` mode clusters, the `clusterStatus` controller in karmada control plane will continually collect cluster's status for a configured interval.
For `Pull` mode clusters, the `karmada-agent` is responsible for creating and updating the `.status` of clusters with configured interval.

The interval for `.status` updates to `Cluster` can be configured via `--cluster-status-update-frequency` flag(default is 10 seconds).

Cluster's `Ready` condition might be set to the `False` with following conditions:
- cluster is unreachable for a period of configured interval.
- cluster's health endpoint responded without ok persists for a period of configured interval.

> The above two intervals can be configured via `--cluster-failure-threshold` flag(default is 30 seconds).

#### Update cluster Lease object

Karmada will create a `Lease` object and a lease controller for each `Pull` mode cluster when clusters are joined.

Each lease controller is responsible for updating the related Leases. The lease renewing time can be configured via `--cluster-lease-duration` and `--cluster-lease-renew-interval-fraction` flags(default is 10 seconds).

Lease’s updating process is independent with cluster’s status updating process, since cluster’s `.status` field is maintained by `clusterStatus` controller.

The `cluster` controller in Karmada control plane would check the state of each pull mode cluster every `--cluster-monitor-period` period(default is 5 seconds).

The cluster's `Ready` condition would be changed to `Unknown` when `cluster` controller has not heard from the cluster in the last `--cluster-monitor-grace-period`(default is 40 seconds).

### Check cluster status
You can use `kubectl` to check a Cluster's status and other details:
```
kubectl describe cluster <cluster-name>
```

The `Ready` condition in `Status` field indicates the cluster is healthy and ready to accept workloads.
It will be set to `False` if the cluster is not healthy and is not accepting workloads, and `Unknown` if the cluster controller has not heard from the cluster in the last `cluster-monitor-grace-period`.

The following example describes an unhealthy cluster:

<details>
<summary>unfold me to see the yaml</summary>

```
kubectl describe cluster member1
 
Name:         member1
Namespace:    
Labels:       <none>
Annotations:  <none>
API Version:  cluster.karmada.io/v1alpha1
Kind:         Cluster
Metadata:
  Creation Timestamp:  2021-12-29T08:49:35Z
  Finalizers:
    karmada.io/cluster-controller
  Resource Version:  152047
  UID:               53c133ab-264e-4e8e-ab63-a21611f7fae8
Spec:
  API Endpoint:  https://172.23.0.7:6443
  Impersonator Secret Ref:
    Name:       member1-impersonator
    Namespace:  karmada-cluster
  Secret Ref:
    Name:       member1
    Namespace:  karmada-cluster
  Sync Mode:    Push
Status:
  Conditions:
    Last Transition Time:  2021-12-31T03:36:08Z
    Message:               cluster is not reachable
    Reason:                ClusterNotReachable
    Status:                False
    Type:                  Ready
Events:                    <none>
```
</details>

## Failover feature

The failover feature is controlled by the `Failover` feature gate, users need to enable the `Failover` feature gate of `karmada-controller`:
```
--feature-gates=Failover=true
```

### Add taints on fault cluster

After the cluster is determined to be unhealthy, a taint with `Effect` set to `NoSchedule` will be added to the cluster as follows:

when cluster's `Ready` condition is `False`, add the following taint:

```yaml
key: cluster.karmada.io/not-ready
effect: NoSchedule
```

when cluster's `Ready` condition is `Unknown`, add the following taint:

```yaml
key: cluster.karmada.io/unreachable
effect: NoSchedule
```

If an unhealthy cluster is not recovered for a period of time, which can be configured via `--failover-eviction-timeout` flag(default is 5 minutes), a new taint with `Effect` set to `NoExecute` will be added to the cluster as follows:

when cluster's `Ready` condition is `False`, add the following taint:

```yaml
key: cluster.karmada.io/not-ready
effect: NoExecute
```

when cluster's `Ready` condition is `Unknown`, add the following taint:

```yaml
key: cluster.karmada.io/unreachable
effect: NoExecute
```

### Tolerate cluster taints

After users creates a `PropagationPolicy/ClusterPropagationPolicy`, Karmada will automatically add the following toleration through webhook:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
  namespace: default
spec:
    clusterTolerations:
    - effect: NoExecute
      key: cluster.karmada.io/not-ready
      operator: Exists
      tolerationSeconds: 600
    - effect: NoExecute
      key: cluster.karmada.io/unreachable
      operator: Exists
      tolerationSeconds: 600
  resourceSelectors:
  - apiVersion: apps/v1
    kind: Deployment
    name: nginx
    namespace: default
```

The `tolerationSeconds` can be configured via `--default-not-ready-toleration-seconds` flag(default is 600) and `default-unreachable-toleration-seconds` flag(default is 600).

### Failover

When karmada detects that the faulty cluster is no longer tolerated by `PropagationPolicy/ClusterPropagationPolicy`, the cluster will be removed from the resource scheduling result and the karmada scheduler will reschedule the reference application.

There are several constraints:
- For each rescheduled application, it still needs to meet the restrictions of `PropagationPolicy/ClusterPropagationPolicy`, such as ClusterAffinity or SpreadConstraints.
- The application distributed on the ready clusters after the initial scheduling will remain when failover schedule.

#### Duplicated schedule type
For `Duplicated` schedule policy, when the number of candidate clusters that meet the PropagationPolicy restriction is not less than the number of failed clusters,
it will be rescheduled to candidate clusters according to the number of failed clusters. Otherwise, no rescheduling.

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

#### Divided schedule type
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

The graceful eviction feature is controlled by the `Failover` and `GracefulEviction` feature gates, users need to enable the `Failover` and `GracefulEviction` feature gates of `karmada-controller`:
```
--feature-gates=Failover=true,GracefulEviction=true
```

In order to prevent service interruption during cluster failover, Karmada need to ensure the removal of evicted workloads will be delayed until the workloads are available on new clusters.

The [GracefulEvictionTasks](https://github.com/karmada-io/karmada/blob/12e8f01d01571932e6fe45cb7f0d1bffd2e40fd9/pkg/apis/work/v1alpha2/binding_types.go#L75-L89) field is added to `ResourceBinding/ClusterResourceBinding` to indicate the eviction task queue.

When the faulty cluster is removed from the resource scheduling result by `taint-manager`, it will be added to the eviction task queue.

The `gracefulEviction` controller is responsible for processing tasks in the eviction task queue. During the procession, the The `gracefulEviction` controller evaluates whether the current task can be removed form the eviction task queue one by one. The judgement conditions are as follows:
- Check the health status of the current resource scheduling result. If the resource health status is healthy, the condition is met.
- Check whether the waiting duration of the current task exceeds the timeout interval, which can be configured via `graceful-eviction-timeout` flag(default is 10 minutes). If exceeds, and meets the condition.
