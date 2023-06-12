---
title: 故障迁移过程解析
---

让我们对Karmada集群故障迁移的过程进行一个简单的解析。

## 添加集群污点

当[集群被判定为不健康](./determine-cluster-failures.md)之后，集群将会被添加上`Effect`值为`NoSchedule`的污点，具体情况为：

- 当集群`Ready`状态为`False`时，将被添加如下污点：

```yaml
key: cluster.karmada.io/not-ready
effect: NoSchedule
```

- 当集群`Ready`状态为`Unknown`时，将被添加如下污点：

```yaml
key: cluster.karmada.io/unreachable
effect: NoSchedule
```

如果集群的不健康状态持续一段时间（该时间可以通过`--failover-eviction-timeout`标签进行配置，默认值为5分钟）仍未恢复，集群将会被添加上`Effect`值为`NoExecute`的污点，具体情况为：

- 当集群`Ready`状态为`False`时，将被添加如下污点：

```yaml
key: cluster.karmada.io/not-ready
effect: NoExecute
```

- 当集群`Ready`状态为`Unknown`时，将被添加如下污点：

```yaml
key: cluster.karmada.io/unreachable
effect: NoExecute
```

## 容忍集群污点

当用户创建`PropagationPolicy/ClusterPropagationPolicy`资源后，Karmada会通过webhook为它们自动增加如下集群污点容忍：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
  namespace: default
spec:
  placement:
    clusterTolerations:
    - effect: NoExecute
      key: cluster.karmada.io/not-ready
      operator: Exists
      tolerationSeconds: 300
    - effect: NoExecute
      key: cluster.karmada.io/unreachable
      operator: Exists
      tolerationSeconds: 300
  ...
```

其中，容忍的`tolerationSeconds`值可以通过`--default-not-ready-toleration-seconds`与`default-unreachable-toleration-seconds`标签进行配置，这两个标签的默认值均为300。

## 故障迁移

当Karmada检测到故障群集不再被`PropagationPolicy/ClusterPropagationPolicy`分发策略容忍时，该集群将被从资源调度结果中删除，随后，Karmada调度器将重新调度相关工作负载。

重调度的过程有以下几个限制：
- 对于每个重调度的工作负载，其仍然需要满足`PropagationPolicy/ClusterPropagationPolicy`的约束，如ClusterAffinity或SpreadConstraints。
- 应用初始调度结果中健康的集群在重调度过程中仍将被保留。

### Duplicated调度类型

对于`Duplicated`调度类型，当满足分发策略限制的候选集群数量不小于故障集群数量时，将根据故障集群数量将工作负载重新调度到候选集群；否则，不进行重调度。

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

假设有4个成员集群，初始调度结果在member1和member2集群中。当member2集群发生故障，将触发调度器重调度。

需要注意的是，重调度不会删除原本状态为Ready的集群member1上的工作负载。在其余3个集群中，只有member3和member5匹配`clusterAffinity`策略。

由于传播约束的限制，最后应用调度的结果将会是[member1, member3]或[member1, member5]。

### Divided调度类型

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

Karmada调度器将根据权重表`weightPreference`来划分应用副本。初始调度结果中，member1集群上有1个副本，member2集群上有2个副本。

当member1集群故障之后，将触发重调度，最后的调度结果将会是member2集群上有3个副本。

## 优雅故障迁移

为了防止集群故障迁移过程中服务发生中断，Karmada需要确保故障集群中应用副本的删除动作延迟到应用副本在新集群上可用之后才执行。

`ResourceBinding/ClusterResourceBinding`中增加了[GracefulEvictionTasks](https://github.com/karmada-io/karmada/blob/12e8f01d01571932e6fe45cb7f0d1bffd2e40fd9/pkg/apis/work/v1alpha2/binding_types.go#L75-L89)字段来表示优雅驱逐任务队列。

当故障集群被taint-manager从资源调度结果中删除时，它将被添加到优雅驱逐任务队列中。

`gracefulEvction`控制器负责处理优雅驱逐任务队列中的任务。在处理过程中，`gracefulEvction`控制器逐个评估优雅驱逐任务队列中的任务是否可以从队列中移除。判断条件如下：
- 检查当前资源调度结果中资源的健康状态。如果资源健康状态为健康，则满足条件。
- 检查当前任务的等待时长是否超过超时时间，超时时间可以通过`graceful-evction-timeout`标志配置（默认为10分钟）。如果超过，则满足条件。
