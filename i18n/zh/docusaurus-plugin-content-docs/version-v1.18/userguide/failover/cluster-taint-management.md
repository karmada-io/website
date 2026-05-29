---
title: 集群污点管理
---

集群中的污点，具体体现在 `Cluster` 对象的 `.spec.taints` 字段中，对应用程序的调度和执行有重大影响。例如，如果一个集群有 `NoSchedule` 污点，
它可以阻止新的应用程序被调度到该集群上。污点对应用程序的影响取决于污点的 `Effect` 值。

Karmada 根据 `Effect` 值支持不同类型的污点：
- `NoSchedule`：阻止新应用程序调度到集群，除非应用程序明确容忍该污点。
- `NoExecute`：阻止新应用程序调度到集群，并将 **现有应用程序从集群中驱逐**，除非应用程序明确容忍该污点。

请注意，`NoExecute` 的驱逐功能默认是禁用的，要启用它，您需要在 `karmada-controller-manager` 组件中设置 `--enable-no-execute-taint-eviction=true`
参数，并且还需要显式启用 `Failover` 特性门控。

本文档介绍了 Karmada 如何管理集群上的污点，包括：
- 基于集群条件的自定义污点管理。
- 由 Karmada 系统管理的污点。
- 配置应用容忍度以忽略污点影响。

## 自定义污点管理

`ClusterTaintPolicy` API 允许管理员自定义基于特定条件为指定目标集群添加或移除污点的规则，这对于实施高级调度策略或故障迁移策略特别有用。

集群条件不仅可以由 Karmada 系统确定，还可以由任何第三方系统确定。这为管理员在定义集群健康标准方面提供了极大的灵活性。例如，Karmada 系统
根据其内置的健康检查设置 `Ready` 条件。第三方系统也可以引入额外的条件，如 `SchedulerDown`，以表明集群调度器无法正常工作。与 `ClusterTaintPolicy`
结合使用时，这些自定义条件可用于防止新应用程序被调度到受影响的集群上，从而对应用程序的放置提供更精细的控制，并提高整体系统的可靠性。

![](../../resources/userguide/failover/clustertaintpolicy.png)

`ClusterTaintPolicy` 是一个集群范围的资源，其 apiVersion 为 `policy.karmada.io/v1alpha1`。

以下是一个 `ClusterTaintPolicy` 的示例，该策略用于向目标集群添加或移除污点：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: ClusterTaintPolicy
metadata:
  name: foo
spec:
  targetClusters:
    clusterNames:
    - member1
    - member2
  addOnConditions:
  - conditionType: KubeComponentsHealthy
    operator: NotIn
    statusValues:
    - "True"
  removeOnConditions:
  - conditionType: KubeComponentsHealthy
    operator: In
    statusValues:
    - "True"
  taints:
  - key: kube-components-unhealthy
    effect: NoSchedule
```

上述 YAML 定义了一个名为 `foo` 的 `ClusterTaintPolicy`，该策略管理 `member1` 和 `member2` 集群上的污点。当集群状态中的 `KubeComponentsHealthy`
条件不为 `True` 时，它会为集群添加一个键为 `kube-component-unhealthy` 的 `NoSchedule` 污点，当集群状态 `KubeComponentsHealthy`
条件为 `True` 时则从集群中移除该污点。

这确保了应用程序不会被调度到 Kubernetes 组件出现故障的集群中，通过自动重调度到健康的集群来提高多集群的可靠性。

### 选择一组目标集群

`TargetClusters` 字段指定了 `ClusterTaintPolicy` 需要关注的集群。它使用 `PropagationPolicy` API 中的`ClusterAffinity` 结构来选
择目标集群，其用法完全相同，因此你可以直接参考[其文档](../scheduling/propagation-policy#cluster-affinity) 获取用户指南。

> 注意：如果您修改 `TargetClusters` 字段或更改集群的标签，使集群不再符合 `ClusterTaintPolicy` 的标准，此前由该 `ClusterTaintPolicy`
添加的现有污点将不会自动移除。

### AddOnConditions 匹配后添加污点

`AddOnConditions` 字段定义了触发系统在集群对象上添加污点的匹配条件。匹配条件采用 “与” 关系。如果 `AddOnConditions` 为空，则不会添加
任何污点。

可以配置如下：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: ClusterTaintPolicy
metadata:
  name: foo
spec:
  #...
  addOnConditions:
  - conditionType: Ready
    operator: NotIn
    statusValues:
    - "True"
  - conditionType: NetworkAvailable
    operator: NotIn
    statusValues:
    - "True"
  #...
```

上述示例指定，当集群的状态条件满足以下情况时：
- `Ready` 条件值**不为** "True" **且**
- `NetworkAvailable` 条件值**不为** "True"，

该策略将为 `TargetClusters` 字段中定义的目标集群添加污点。

### RemoveOnConditions 匹配后移除污点

`RemoveOnConditions` 字段定义了触发系统从集群对象中移除污点的匹配条件。匹配条件采用 “与” 关系。如果 `RemoveOnConditions` 为空，则不
会移除任何污点。

可以配置如下：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: ClusterTaintPolicy
metadata:
  name: foo
spec:
  #...
  removeOnConditions:
  - conditionType: Ready
    operator: In
    statusValues:
    - "True"
  - conditionType: NetworkAvailable
    operator: In
    statusValues:
    - "True"
  #...
```

上述示例指定，当集群的状态条件满足以下条件时：
- `Ready` 条件值为 **"True"** **且**
- `NetworkAvailable` 条件值为 **"True"**，

该策略将从目标集群中移除污点。

> 注意：当控制器调协 ClusterTaintPolicy 时，它首先评估 `AddOnConditions` 以确定应将哪些污点添加到目标集群，然后评估 `RemoveOnConditions`
> 以识别要移除的污点，并在单个操作中以原子方式应用所有更改。此顺序意味着，如果一个污点既通过 `AddOnConditions` 预期要添加，又通过 `RemoveOnConditions`
> 要移除，则在最终状态中移除操作优先。为避免预期的污点无法应用的情况，请确保添加和移除同一污点的条件相互排斥，因为重叠的配置可能会在协调过
> 程中导致意外行为。

### 污点配置

`Taints` 字段指定了需要在与 `TargetClusters` 匹配的集群对象上添加或删除的污点。

可以配置如下：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: ClusterTaintPolicy
metadata:
  name: foo
spec:
  #...
  taints:
  - key: not-ready
    effect: NoSchedule
  - key: not-ready
    effect: NoExecute
  #...
```

- 当集群的状态条件同时满足 `AddOnConditions` 时，该策略将向目标集群添加污点。
- 当集群的状态条件同时满足 `RemoveOnConditions` 时，该策略将从目标集群移除污点。

> 注意：修改 ClusterTaintPolicy 中的 `Taints` 字段（例如，删除污点定义）不会自动清除该策略已应用的现有污点。控制器仅根据更新后的配置管理污点。

> 注意：删除 ClusterTaintPolicy 不会自动清除该策略已应用的现有污点。

### 允许 NoExecute Effect 污点

鉴于 `NoExecute` 污点的重大影响，它会将所有无法容忍该污点的应用程序从整个集群中驱逐，因此默认情况下，使用 `ClusterTaintPolicy` 配置
`NoExecute` 污点是禁用的。这一预防措施可防止意外的大规模中断。要启用此功能，您必须显式配置 `karmada-webhook` 组件以允许 `NoExecute`
污点配置：

- karmada-webhook
  ```
  --allow-no-execute-taint-policy bool: Allows configuring taints with NoExecute effect in ClusterTaintPolicy. Given the impact of NoExecute, applying such a taint to a cluster may trigger the eviction of workloads that do not explicitly tolerate it, potentially causing unexpected service disruptions.
    This parameter is designed to remain disabled by default and requires careful evaluation by administrators before being enabled.
  ```

为了使 `NoExecute` 生效，在 `karmada-webhook` 组件中配置 `--allow-no-execute-taint-policy=true` 参数后，您还需要在 `karmada-controller-manager`
组件中配置以下参数：

- karmada-controller-manager:
  ```
  --enable-no-execute-taint-eviction bool: Enables controller response to NoExecute taints on clusters, which triggers eviction of workloads without explicit tolerations. Given the impact of eviction caused by NoExecute Taint.
  This parameter is designed to remain disabled by default and requires careful evaluation by administrators before being enabled.
  ```

### Failover FeatureGate

集群污点管理功能需要启用 **Failover FeatureGate**。**Failover FeatureGate** 目前处于 **Beta** 阶段，默认是关闭的。如果您想通过
`ClusterTaintPolicy` 为集群启用自动污点管理，可以在 `karmada-controller-manager` 中按如下方式进行配置：

```
--feature-gates=Failover=true
```

## Karmada 系统管理的污点

在当前 Karmada 系统中，由 `cluster-controller` 自动处理的具有 **NoSchedule** 效果的污点如下：

| 污点键                            | 何时添加                  | 何时删除                         |
|--------------------------------|-----------------------|------------------------------|
| cluster.karmada.io/unreachable | 当集群 Ready 条件为 Unknown | 当集群 Ready 条件为 True 或 False   |
| cluster.karmada.io/not-ready   | 当集群 Ready 条件为 False   | 当集群 Ready 条件为 True 或 Unknown |

在 1.14 版本之前，Karmada 会根据集群状态条件的变化自动添加或移除污点。从 1.14 版本开始，Karmada 不再自动添加或移除 `NoExecute` 污点。

## 配置应用容忍

集群对象上的污点可以被应用程序容忍，这在[PropagationPolicy/ClusterPropagationPolicy 的 `.spec.placement.clusterTolerations` 字段](../scheduling/propagation-policy#cluster-tolerations)中进行了定义。

当应用程序容忍 **NoSchedule** 污点时，即使集群上存在 **NoSchedule** 污点，该应用程序也能够调度到集群中。

当应用程序容忍 **NoExecute** 污点时，即使集群上存在 **NoExecute** 污点，该应用程序仍能够在集群上运行。
