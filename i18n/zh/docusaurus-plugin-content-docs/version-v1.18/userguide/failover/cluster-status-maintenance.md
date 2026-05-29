---
title: 集群状态维护
---

Karmada 支持 `Push` 和 `Pull` 两种模式来管理成员集群，有关集群注册的更多详细信息，
请参考 [Cluster Registration](../clustermanager/cluster-registration.md)。

在 Karmada 中，对集群的心跳探测有两种方式：

- 集群状态收集，更新集群的 `.status` 字段（包括 `Push` 和 `Pull` 两种模式）；
- Karmada 控制面中 `karmada-cluster` 命名空间内的 `Lease` 对象，每个 `Pull` 模式集群都有一个关联的 `Lease` 对象。

## 集群状态收集

对于 `Push` 模式集群，Karmada 控制面中的 `clusterStatus` 控制器将定期执行执行集群状态的收集任务；
对于 `Pull` 模式集群，集群中部署的 `karmada-agent` 组件负责创建并定期更新集群的 `.status` 字段。

上述集群状态的定期更新任务可以通过 `--cluster-status-update-frequency` 标签进行配置（默认值为 10 秒）。

集群的 `Ready` 条件在满足以下条件时将会被设置为 `False`：

- 集群持续一段时间无法访问；
- 集群健康检查响应持续一段时间不正常。

> 上述持续时间间隔可以通过 `--cluster-failure-threshold` 标签进行配置（默认值为 30 秒）。

## 集群租约对象更新

每当有集群加入时，Karmada 将为每个 `Pull` 模式集群创建一个租约对象和一个租赁控制器。

每个租约控制器负责更新对应的租约对象，续租时间可以通过 `--cluster-lease-duration`
和 `--cluster-lease-renew-interval-fraction` 标签进行配置（默认值为 10 秒）。

由于集群的状态更新由 `clusterStatus` 控制器负责维护，因此租约对象的更新过程与集群状态的更新过程相互独立。

Karmada 控制面中的 `cluster` 控制器将每隔 `--cluster-monitor-period` 中配置的时间（默认值为 5 秒）检查 `Pull` 模式集群的状态，
当 `cluster` 控制器在最后一个 `--cluster-monitor-grace-period` 中配置的时间段（默认值为 40 秒）内没有收到来自集群的消息时，
集群的 `Ready` 条件将被更改为 `Unknown`。

## 检查集群状态

你可以使用 `kubectl` 来检查集群的状态细节：
```
kubectl describe cluster <cluster-name>
```

以下实例描述了一个状态不健康的集群：

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
