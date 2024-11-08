---
title: 负载重平衡
---

一般情况下，工作负载类资源一旦被调度，其调度结果通常会保持惰性，不会轻易改变副本分布状态。即使通过修改资源模板中的副本数或
PropagationPolicy 的 Placement 来触发重新调度，系统也只会在必要时进行最小化的调整，以最大程度地减少对系统的影响。

然而，在某些情况下，用户可能希望能够主动触发全新的重调度，完全忽略过去的分配结果，并在集群之间建立全新的副本分布状态。

## 适用场景

### 场景 1

在集群故障迁移的情况下，副本分布在 member1 和 member2 两个集群中，但如果 member1 集群故障，副本将全部迁移到 member2 集群。

作为集群管理员，我希望在 member1 集群恢复时，副本重新分配到两个集群，一方面重新利用 member1 集群的资源，另一方面也为了保证集群高可用性。

### 场景 2

在应用级别故障迁移场景，因为集群资源稀缺，低优先级的应用程序可能会被抢占，导致其从多个集群缩减到单个集群。
(参考 [Application-level Failover](https://karmada.io/zh/docs/next/userguide/failover/application-failover/)).

作为用户，我希望当集群资源充足时，低优先级应用程序的副本可以重新分布到多个集群，以确保应用程序的高可用性。

### 场景 3

对于“聚合”调度类型，由于资源约束，副本仍然可能分布到多个集群中。

作为用户，我希望当任何集群具有足够的资源来容纳所有副本时，副本能以聚合策略重新分配，从而使应用程序更好地满足实际业务需求。

### 场景 4

在灾备场景中，当主集群故障时，副本会从主集群迁移到备集群。作为集群管理员，我希望在主集群恢复时，副本可以迁回主集群，以实现以下目的：

* 恢复到灾备模式，确保集群联邦的高可用和稳定性。
* 备集群往往成本更高，节省备集群的成本

## WorkloadRebalancer 特性

### 单个资源的重调度

假设这里有一个名为 `demo-deploy` 的 Deployment，您想触发它的重调度，您只需应用下述 WorkloadRebalancer：

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

然后，调度器将对该 Deployment 进行重调度，完全忽略先前的分配结果，并在集群之间建立全新的副本分布状态。

1）如果成功，您会看到以下结果:

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

2）如果 `deployments/demo-deploy` 的 ResourceBinding 不存在，您将得到以下结果：

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

3）如果在处理过程中出现异常失败，例如网络问题或限流问题，WorkloadRebalancer 将继续重试，您将得到以下结果：

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

> 提示：在这种情况下，由于仍在重试中，`status` 字段中不会有 `finishTime`，每个 `observedWorkloads` 中也不会有 `result/reason` 字段。

### 批量资源的重调度

在实际场景中，您可能需要以应用粒度触发重调度，也就是说，您需要触发一批资源的重调度。
假设资源包括 `deployment/demo-deploy`、`configmap/demo-config` 和 `clusterrole/demo-role`， 您可以这样定义 WorkloadRebalancer：

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

您会得到如下结果:

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

> 提示：observedWorkloads 是依次按照 apiVersion、kind、namespace 和 name 的字典顺序排列的。

### WorkloadRebalancer 的修改

WorkloadRebalancer 也支持修改，其准则是：

* 如果 `spec` 中新增一个 workload，则对其履行重调度并将其添加到 `status` 列表中
* 如果从 `spec` 中删除一个 workload，若该 workload 已成功，则保留在 `status` 列表中，若未成功则移除
* 如果一个 `spec` 中的 workload 被修改，等价于先删除一个旧的 workload 再插入一个新的 workload

假设当前的 WorkloadRebalancer 如下：

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

接着，如果我编辑目标工作负载，由原有的 `demo-deploy-1` 和 `demo-deploy-2` 修改为 `demo-deploy-3`，结果将是：

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

在 `status.observedWorkloads` 中您可以看到:

* `demo-deploy-1` 未在最新的 `spec` 中指定，但它已经成功，所以它在 `status` 中保持存在
* `demo-deploy-2` 未在最新的 `spec` 中指定，并且它之前是失败的，所以它被从 `status` 中移除
* `demo-deploy-3` 是在最新的 `spec` 中新增的，所以它被添加到 `status` 中

### 自动清理 WorkloadRebalancer

您可以使用 `spec.ttlSecondsAfterFinished` 来指定 WorkloadRebalancer 资源执行完成后将在何时执行自动清理
（执行完成是指每个目标工作负载都以 `Successful` 或 `Failed` 的结果完成运行）。

执行自动清理的准则是：

* 如果设置了此字段，在 WorkloadRebalancer 完成后的 `ttlSecondsAfterFinished` 秒，它将被自动删除
* 如果未设置此字段，则 WorkloadRebalancer 不会被自动删除
* 如果将此字段设置为零，则 WorkloadRebalancer 将在完成后立即被删除

下面是一个例子：

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

那么，在 WorkloadRebalancer 执行完成后的 60 秒后它将被删除。

## 下一步

更详细的 WorkloadRebalancer 的使用示例，请参考教程 [Workload Rebalancer](../../tutorials/workload-rebalancer.md)
