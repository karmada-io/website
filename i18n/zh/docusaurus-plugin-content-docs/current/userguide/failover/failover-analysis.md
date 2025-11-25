---
title: 集群故障迁移过程解析
---

让我们对 Karmada 集群故障迁移的过程进行一个简单的解析。

## 添加集群污点

当[集群状态变得不健康](./cluster-status-maintenance.md)之后，集群将会被添加上 `taint{effect: NoSchedule}`，具体情况为：

- 当集群的 `Ready` Condition 为 `False` 时，Karmada 控制器将为集群对象添加如下污点：

```yaml
key: cluster.karmada.io/not-ready
effect: NoSchedule
```

- 当集群的 `Ready` Condition 为 `Unknown` 时，Karmada 控制器将为集群对象添加如下污点：

```yaml
key: cluster.karmada.io/unreachable
effect: NoSchedule
```

此外，Karmada 控制器将不会为集群对象主动添加 `NoExecute` 污点，用户可以通过[集群污点管理](./cluster-taint-management.md)功能对集群对象上的污点，包括 `NoExecute` 污点，进行主动管理。

## 故障迁移

当 Karmada 发现集群被打上了 `NoExecute` 污点且该污点不能被 `PropagationPolicy/ClusterPropagationPolicy` 中的容忍策略所容忍后，Karmada 控制器将会将该集群从资源调度结果中删除，随后，Karmada 调度器将重新调度目标工作负载。

重调度的过程有以下几个限制：
- 对于每个重调度的工作负载，其仍然需要满足 `PropagationPolicy/ClusterPropagationPolicy` 的约束，如 ClusterAffinity 或 SpreadConstraints。
- 应用初始调度结果中健康的集群在重调度过程中仍将被保留。

### Duplicated 调度类型

对于 `Duplicated` 调度类型，当集群故障之后进行重新调度，满足分发策略限制的候选集群数量大于等于故障集群数量时，调度将继续执行，否则不执行。其中候选集群是指在本次调度过程中，区别与已调度的集群，新计算出的集群调度结果。

以`Deployment`资源为例：

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

假设有 5 个成员集群，初始调度结果在 member1 和 member2 集群中。当 member2 集群发生故障，将触发调度器重调度。

需要注意的是，重调度不会删除原本状态为 Ready 的集群 member1 上的工作负载。在其余 3 个集群中，只有 member3 和 member5 匹配 `clusterAffinity` 策略。

由于分发约束的限制，最后应用调度的结果将会是 [member1, member3] 或 [member1, member5]。

### Divided 调度类型

对于`Divided`调度类型，Karmada调度器将尝试将应用副本迁移到其他健康的集群中去。

以`Deployment`资源为例：

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

Karmada 调度器将根据权重表 `weightPreference` 来划分应用副本。初始调度结果中，member1 集群上有 1 个副本，member2 集群上有 2 个副本。

当 member1 集群故障之后，将触发重调度，最后的调度结果将会是 member2 集群上有 3 个副本。

## 优雅故障迁移

为了防止集群故障迁移过程中服务发生中断，Karmada 需要确保故障集群中应用副本的删除动作延迟到应用副本在新集群上可用之后才执行。

`ResourceBinding/ClusterResourceBinding` 中增加了 [GracefulEvictionTasks](https://github.com/karmada-io/karmada/blob/12e8f01d01571932e6fe45cb7f0d1bffd2e40fd9/pkg/apis/work/v1alpha2/binding_types.go#L75-L89) 字段来表示优雅驱逐任务队列。

当故障集群被 taint-manager 从资源调度结果中删除时，它将被添加到优雅驱逐任务队列中。

`gracefulEvction` 控制器负责处理优雅驱逐任务队列中的任务。在处理过程中，`gracefulEvction` 控制器逐个评估优雅驱逐任务队列中的任务是否可以从队列中移除。判断条件如下：
- 检查当前资源调度结果中资源的健康状态。如果资源健康状态为健康，则满足条件。
- 检查当前任务的等待时长是否超过超时时间，超时时间可以通过 `graceful-evction-timeout` 标志配置（默认为10分钟）。如果超过，则满足条件。
