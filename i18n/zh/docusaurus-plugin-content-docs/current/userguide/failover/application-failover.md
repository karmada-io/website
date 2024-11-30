---
title: 应用故障迁移
---

在多集群场景下，用户的工作负载可能会部署在多个集群中，以提高服务的高可用性。当检测到集群故障时，Karmada 已经支持应用在多集群的故障转移。
这是从集群的视角出发的。但是，有些集群的故障只会影响特定的应用，如果从集群的角度来看，我们需要区分受影响和未受影响的应用程序。
此外，当集群的控制平面处于健康状态时，应用程序可能仍然处于不可用的状态。因此，Karmada 需要从应用的角度提供一种故障迁移的手段。

## 为什么需要应用级故障迁移

以下介绍一些应用故障迁移的场景：

* 管理员通过抢占式调度在多个集群中部署应用程序。当集群资源紧缺时，原本正常运行的低优先级应用被抢占，长时间无法正常运行。此时，应用程序无法在单集群内进行自我修复。用户希望尝试将其调度到另一个集群，以确保持续提供服务。
* 管理员使用云供应商的竞价实例来部署无状态的计算任务。用户使用竞价型实例部署应用时，可能会因为资源被回收而导致应用运行失败。
在这种情况下，调度器感知到的资源量是资源配额的大小，而不是实际可用的资源。这时候，用户希望将之前失败的应用调度到另一个可用的集群。
* ....

## 如何启用该功能

当应用程序从一个集群迁移到另一个集群时，应用需要确保它的依赖项同步迁移。
因此，您需要确保启用了 `PropagateDeps` 特性开关并且在 PropagationPolicy 中设置了 `propagateDeps: true`。
自 Karmada v1.4 以来，`PropagateDeps` 特性开关已经处于 Beta 阶段，并且默认启用。

另外，应用是否需要迁移取决于应用的健康状态。Karmada 的“资源解释器框架”是为解释资源结构而设计的，
它为用户提供解释器操作来告诉 Karmada 如何确定特定对象的健康状态。如何解析资源的健康状态由用户决定。
在使用应用的故障迁移之前，您需要确保已配置应用程序的 interpretHealth 规则。

应用故障迁移受 `Failover` 特性开关控制。自 Karmada v1.4 以来，`Failover` 特性开关已经处于 Beta 阶段，并且默认启用。
此外，如果您使用优雅驱逐的清除模式，则需要启用 `GracefulEviction` 特性开关。自 Karmada v1.4 以来，`GracefulEviction` 特性开关也已处于 Beta 阶段，并且默认启用。

## 配置应用故障迁移

PropagationPolicy 的 `.spec.failover.application` 字段可以来表示应用故障迁移的规则。

它有以下字段可以设置：
* DecisionConditions
* PurgeMode
* GracePeriodSeconds

### 配置决定条件

`DecisionConditions` 代表执行故障迁移的决定条件。只有当其中的所有条件都满足了应用的故障迁移才会执行。
目前，它包括对应用不健康状态的容忍时间，默认为 300s。

PropagationPolicy 可以配置如下：
```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: test-propagation
spec:
  #...
  failover:
    application:
      decisionConditions:
        tolerationSeconds: 300
      #...  
```

### 配置驱逐模式

`PurgeMode` 代表如何从一个故障的集群迁移到另一个集群的方式。
Karmada 支持三种不同的驱逐模式：

* `Immediately` 表示 Karmada 将立即驱逐遗留的应用。
* `Graciously` 表示 Karmada 将等待应用在新集群上恢复健康，或者在达到超时后才驱逐应用。
你同时需要配置 `GracePeriodSeconds`。如果新集群上的应用无法达到 Healthy 状态，Karmada 将在达到 GracePeriodSeconds 后删除该应用。默认为 600 秒。
* `Never` 表示 Karmada 不会驱逐应用，用户手动确认如何清理冗余副本。

PropagationPolicy 可以配置为如下：
```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: test-propagation
spec:
  #...
  failover:
    application:
      decisionConditions:
        tolerationSeconds: 300
      gracePeriodSeconds: 600
      purgeMode: Graciously
      #...  
```

或者：
```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: test-propagation
spec:
  #...
  failover:
    application:
      decisionConditions:
        tolerationSeconds: 300
      purgeMode: Never
      #...  
```

## 示例

假设你已经配置了一个 PropagationPolicy：
```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  failover:
    application:
      decisionConditions:
        tolerationSeconds: 120
      purgeMode: Never
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
    spreadConstraints:
      - maxGroups: 1
        minGroups: 1
        spreadByField: cluster
---
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
```

现在应用被调度到 member2 中，这两个副本正常运行。此时给 member2 中的所有节点标记为不可调度并驱逐所有副本以构建应用的异常状态。

```shell
# mark node "member2-control-plane" as unschedulable in cluster member2
kubectl --context member2 cordon member2-control-plane
# delete the pod in cluster member2
kubectl --context member2 delete pod -l app=nginx
```

你可以立即从 ResourceBinding 中发现应用变成不健康的状态。

```yaml
#...
status:
  aggregatedStatus:
    - applied: true
      clusterName: member2
      health: Unhealthy
      status:
        availableReplicas: 0
        readyReplicas: 0 
        replicas: 2
```

达到 tolerationSeconds 后，会发现 member2 中的 Deployment 已经被驱逐，重新调度到 member1 中。

```yaml
#...
spec:
  clusters:
    - name: member1
      replicas: 2
  gracefulEvictionTasks:
    - creationTimestamp: "2023-05-08T09:29:02Z"
      fromCluster: member2
      producer: resource-binding-application-failover-controller
      reason: ApplicationFailure
      suppressDeletion: true
```

您可以在 gracefulEvictionTasks 中将 suppressDeletion 修改为 false，确认故障后驱逐故障集群中的应用。

## 无状态应用 Failover 支持

Starting from v1.12, the application-level failover feature adds support for stateful application failover, it provides a generalized way for users to define application state preservation in the context of cluster-to-cluster failovers.

In releases prior to v1.12, Karmada’s scheduling logic runs on the assumption that resources that are scheduled and rescheduled are stateless. In some cases, users may desire to conserve a certain state so that applications can resume from where they left off in the previous cluster.

For CRDs dealing with data-processing (such as Flink or Spark), it can be particularly useful to restart applications from a previous checkpoint. That way applications can seamlessly resume processing data while avoiding double processing.

从 v1.12 开始，应用故障转移特性增加了对有状态应用故障转移的支持，它为用户提供了一种通用的方式来定义在集群间故障转移情境下的应用状态保留。

在 v1.12 之前的版本中，Karmada 的调度逻辑基于这样的假设运行：被调度和重新调度的资源是无状态的。在某些情况下，用户可能希望保留某种状态，以便应用可以从之前集群中停止的地方恢复。对于处理数据加工的 CRD（例如 Flink 或 Spark），从之前的检查点重新启动应用可能特别有用。这样应用可以无缝地恢复数据处理，同时避免重复处理。

### 定义 StatePreservation

`StatePreservation` 是 `.spec.failover.application` 下的一个字段, 它定义了在有状态应用的故障转移事件期间保留和恢复状态数据的策略。当应用从一个集群故障转移到另一个集群时，此策略使得能够从原始资源配置中提取关键数据。

它包含了一系列 `StatePreservationRule` 配置。每条规则指定了一个 JSONPath 表达式，针对特定的状态数据片段，在故障转移事件中需要保留。每条规则都关联了一个 `AliasLabelName`，当保留的数据传递到新集群时，它作为标签键使用。你可以定义状态保留策略：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: example-propagation
spec:
  #...
  failover:
    application:
      decisionConditions:
        tolerationSeconds: 60
      purgeMode: Immediately
      statePreservation:
        rules:
          - aliasLabelName: pre-updated-replicas
            jsonPath: "{ .updatedReplicas }"
```

The above configuration will parse the `updatedReplicas` field from the application `.status` before migration. Upon successful migration, the extracted data is then re-injected into the new resource, ensuring that the application can resume operation with its previous state intact.

This capability requires enabling the `StatefulFailoverInjection` feature gate. `StatefulFailoverInjection` is currently in `Alpha` and is turned off by default.

上述配置将在迁移前解析应用 `.status` 中的 `updatedReplicas` 字段。成功迁移后，提取的数据将重新注入到新资源中，确保应用程序能够以其之前的状态恢复操作。

此功能需要启用 `StatefulFailoverInjection` 特性门控。`StatefulFailoverInjection` 目前处于 `Alpha` 阶段，默认情况下是关闭的。

> 目前该功能的使用尚有些限制，使用时请注意：
> 1. 仅考虑应用程序在一个集群中部署并迁移到另一个集群的场景。
> 2. 如果发生连续故障转移，例如，应用程序从 clusterA 迁移到 clusterB，然后再到 clusterC，最后一次故障转移前的 PreservedLabelState 用于注入。如果 PreservedLabelState 为空，则跳过注入。
> 3. 仅当 PurgeMode 设置为 Immediately 时，才执行注入操作。

:::note

应用故障迁移的开发仍在进行中。我们正在收集用户案例。如果您对此功能感兴趣，请随时开启一个 Enhancement Issue 让我们知道。

:::
