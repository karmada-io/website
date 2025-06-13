---
title: Determine cluster failures
---

Karmada supports both `Push` and `Pull` modes to manage member clusters. More details about cluster registration please refer to [Cluster Registration](../clustermanager/cluster-registration.md).

For clusters there are two forms of heartbeats:
- updates to the `.status` of a Cluster(include both `Push` and `Pull` mode).
- `Lease` objects within the `karmada-cluster` namespace in karmada control plane. Each `Pull` mode cluster has an associated `Lease` object.

## Collect cluster status

For `Push` mode clusters, the `clusterStatus` controller in karmada control plane will continually collect cluster's status for a configured interval.
For `Pull` mode clusters, the `karmada-agent` is responsible for creating and updating the `.status` of clusters with configured interval.

The interval for `.status` updates to `Cluster` can be configured via `--cluster-status-update-frequency` flag(default is 10 seconds).

Cluster's `Ready` condition might be set to the `False` with following conditions:
- cluster is unreachable for a period of configured interval.
- cluster's health endpoint responded without ok persists for a period of configured interval.

> The above two intervals can be configured via `--cluster-failure-threshold` flag(default is 30 seconds).

## Update cluster Lease object

Karmada will create a `Lease` object and a lease controller for each `Pull` mode cluster when clusters are joined.

Each lease controller is responsible for updating the related Leases. The lease renewing time can be configured via `--cluster-lease-duration` and `--cluster-lease-renew-interval-fraction` flags(default is 10 seconds).

Lease’s updating process is independent with cluster’s status updating process, since cluster’s `.status` field is maintained by `clusterStatus` controller.

The `cluster` controller in Karmada control plane would check the state of each pull mode cluster every `--cluster-monitor-period` period(default is 5 seconds).

The cluster's `Ready` condition would be changed to `Unknown` when `cluster` controller has not heard from the cluster in the last `--cluster-monitor-grace-period`(default is 40 seconds).

## Check cluster status
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
