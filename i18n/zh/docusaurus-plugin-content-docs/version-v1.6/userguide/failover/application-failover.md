---
title: 应用故障迁移
---

在多集群场景下，用户的工作负载可能会部署在多个集群中，以提高服务的高可用性。当检测到集群故障时，Karmada 已经支持应用在多集群的故障转移。
这是从集群的视角出发的。但是，有些集群的故障只会影响特定的应用，如果从集群的角度来看，我们需要区分受影响和未受影响的应用程序。
此外，当集群的控制平面处于健康状态时，应用程序可能仍然处于不可用的状态。因此，Karmada 需要从应用的角度提供一种故障迁移的手段。

## 为什么需要应用级故障迁移

以下介绍一些应用级故障转移的场景:

* 管理员通过抢占式调度在多个集群中部署应用程序。当集群资源紧缺时，原本正常运行的低优先级应用被抢占，长时间无法正常运行。此时，应用程序无法在单集群内进行自我修复。用户希望尝试将其调度到另一个集群，以确保持续提供服务。
* 管理员使用云供应商的竞价实例来部署无状态的计算任务。用户使用竞价型实例部署应用时，可能会因为资源被回收而导致应用运行失败。
在这种情况下，调度器感知到的资源量是资源配额的大小，而不是实际可用的资源。这时候，用户希望将之前失败的应用调度到另一个可用的集群。
* ....

## 如何启用该功能

当应用程序从一个集群迁移到另一个集群时，应用需要确保它的依赖项同步迁移。
因此，您需要确保启用了 `PropagateDeps` 特性开关并且在PropagationPolicy中设置了 `propagateDeps: true`。自 Karmada v1.4 以来，`PropagateDeps` 特性开关已经处于 Beta 阶段，并且默认启用。

另外，应用是否需要迁移取决于应用的健康状态。Karmada 的“资源解释器框架”是为解释资源结构而设计的，它为用户提供解释器操作来告诉 Karmada 如何确定特定对象的健康状态。如何解析资源的健康状态由用户决定。在使用应用的故障迁移之前，您需要确保已配置应用程序的 interpretHealth 规则。

应用故障迁移受 `Failover` 特性开关控制。自 Karmada v1.4 以来，`Failover` 特性开关已经处于 Beta 阶段，并且默认启用。
此外，如果您使用优雅驱逐的清除模式，则需要启用 `GracefulEviction` 特性开关。自 Karmada v1.4 以来，`GracefulEviction` 特性开关也已处于 Beta 阶段，并且默认启用。

## 配置应用故障迁移

PropagationPolicy的 `.spec.failover.application` 字段可以来表示应用故障迁移的规则。

它有以下字段可以设置:
* DecisionConditions
* PurgeMode
* GracePeriodSeconds

### 配置决定条件

`DecisionConditions` 代表执行故障迁移的决定条件。只有当其中的所有条件都满足了应用的故障迁移才会执行。
目前，它包括对应用不健康状态的容忍时间，默认为300s。

PropagationPolicy可以配置如下:
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
Karmada 支持三种不同的驱逐模式:

* `Immediately` 表示 Karmada 将立即驱逐遗留的应用。
* `Graciously` 表示 Karmada 将等待应用在新集群上恢复健康，或者在达到超时后才驱逐应用。
你同时需要配置 `GracePeriodSeconds`。如果新集群上的应用无法达到 Healthy 状态，Karmada 将在达到 GracePeriodSeconds 后删除该应用。默认为 600 秒。
* `Never` 表示 Karmada 不会驱逐应用，用户手动确认如何清理冗余副本。

PropagationPolicy 可以配置为如下:
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

或者
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

假设你已经配置了一个 propagationPolicy:
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

现在应用被调度到 member2 中，这两个副本正常运行。 此时给 member2 中的所有节点标记为不可调度并驱逐所有副本以构建应用的异常状态。

```shell
# mark node "member2-control-plane" as unschedulable in cluster member2
$ kubectl --context member2 cordon member2-control-plane
# delete the pod in cluster member2
$ kubectl --context member2 delete pod -l app=nginx
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

达到 tolerationSeconds 后，会发现 member2 中的 deployment 已经被驱逐，重新调度到 member1 中。

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

:::note

应用故障转移的开发仍在进行中。我们正在收集用户案例。如果您对此功能感兴趣，请随时开启一个 enhancement issue 让我们知道。

:::

