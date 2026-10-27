---
title: 集群故障迁移
---

在多云多集群场景中，为了提高业务的高可用性，用户工作负载可能会被部署在多个不同的集群中。在 Karmada 中，当集群发生故障或是用户不希望在某个集群上继续运行工作负载时，用户可以通过[管理集群污点](./cluster-taint-management.md)来将工作负载从该集群驱逐，或阻止新的工作负载调度到目标集群。

被驱逐的工作负载将会被调度到其他最合适的集群，从而实现集群故障迁移，保障用户服务的可用性和连续性。

## 如何启用

用户可以通过启用 `Failover` 特性开关来开启故障迁移特性。`Failover` feature gate 目前处于 `Beta` 阶段，默认关闭，用户应明确启用以避免意外事件。您可以按照如下配置在 `karmada-controller-manager` 组件中启用 `Failover` 特性开关：

```
--feature-gates=Failover=true
```

## 配置集群故障迁移

当集群被打上 `NoExecute` 污点时，会触发该集群上工作负载的迁移。关于详细的迁移机制，请参考[集群故障迁移机制详解](cluster-failover-internals.md)。此外，用户还可以通过 PropagationPolicy API 的 `.spec.failover.cluster` 字段配置集群故障迁移的行为，实现对应用级集群故障迁移的精细化控制。

`ClusterFailoverBehavior` 提供了以下可配置字段：

- PurgeMode
- StatePreservation

### 配置 PurgeMode

`PurgeMode` 用于指定在应用从某个集群迁移时，如何处理原集群上的遗留应用。目前支持的取值有 `Directly` 和 `Gracefully`，默认值为 `Gracefully`。具体说明如下：

- `Directly` 表示 Karmada 会直接驱逐原集群上的应用。适用于应用无法容忍同一时间运行两个实例的场景。例如，Flink 应用支持精确一次（exactly-once）状态一致性，要求同一时间只能有一个实例运行。在故障迁移时，必须先删除旧应用，再创建新应用，以避免重复处理并保证状态一致性。
- `Gracefully` 表示 Karmada 会等待应用在新集群恢复健康或超时后，再驱逐原集群上的应用。

PropagationPolicy 可按需配置上述行为。

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  failover:
    cluster:
      purgeMode: Directly
  #...
```

### 应用状态保留

自 v1.15 版本起，集群故障迁移特性新增了对有状态应用的支持，为用户在集群故障迁移场景下定义应用状态保留提供了通用方式。

:::note 前提条件

该功能需要开启 `StatefulFailoverInjection` 特性开关。`StatefulFailoverInjection` 目前处于 Alpha 阶段，默认关闭。

使用该功能时还有如下限制：
1. 仅考虑应用部署在一个集群并迁移到另一个集群的场景。
2. 若发生连续故障迁移（如 clusterA → clusterB → clusterC），则仅注入上一次故障迁移前的 `PreservedLabelState`。如果 `PreservedLabelState` 为空，则跳过注入。
3. 仅当 `PurgeMode` 设置为 `Directly` 时才会进行注入操作。

:::

`StatePreservation` 是 `.spec.failover.cluster` 下的一个字段，用于定义有状态应用在故障迁移事件中状态数据的保留与恢复策略。当应用从一个集群迁移到另一个集群时，该策略支持从原资源配置中提取关键数据。

该字段包含多个 `StatePreservationRule` 配置。每条规则需指定：
- **`jsonPath`**：用于从资源配置中提取状态数据的 JSONPath 表达式。
- **`aliasLabelName`**：保留数据传递到新集群时使用的标签键名。

> **注意**：JSONPath 表达式默认从 API 资源对象的 `status` 字段开始查找。例如，若要提取 Deployment 的 `availableReplicas`，应使用 `{.availableReplicas}`，而不是 `{.status.availableReplicas}`。JSONPath 语法遵循 [Kubernetes 规范](https://kubernetes.io/docs/reference/kubectl/jsonpath/)。

#### 状态保留工作流程

1. **迁移前**：Karmada 控制器根据用户配置的 `jsonPath`，从资源的 `status` 中提取状态数据。
2. **迁移过程中**：Karmada 控制器将提取到的数据以标签的形式注入到新集群上的应用配置中。
3. **目标集群处理**：成员集群中运行的工具（如 Kyverno）拦截资源创建请求，读取注入的标签，并据此配置应用（如设置恢复 checkpoint 路径）。
4. **恢复执行**：应用从保留的状态启动，继承迁移前保存的最终状态。

#### 示例：Flink 作业状态保留

以 Flink 为例，`jobID` 是用于区分和管理不同 Flink 作业的唯一标识符。当集群发生故障时，Flink 应用可以利用 `jobID` 获取作业的 checkpoint 数据存储，恢复集群故障前的作业状态，然后在新集群中从故障点继续执行：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: flink-propagation
spec:
  resourceSelectors:
    - apiVersion: flink.apache.org/v1beta1
      kind: FlinkDeployment
      name: flink-app
  failover:
    cluster:
      purgeMode: Directly
      statePreservation:
        rules:
          - aliasLabelName: application.karmada.io/cluster-failover-jobid
            jsonPath: "{ .jobStatus.jobID }"
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
    spreadConstraints:
      - maxGroups: 1
        minGroups: 1
        spreadByField: cluster
```

### 配置驱逐速率限制

在集群故障的场景下，短时间内连续驱逐大量工作负载可能会对 Karmada 控制面以及剩余的健康集群造成巨大压力。为了提升故障迁移过程的稳定性和可控性，Karmada 引入了速率限制机制，可以根据需要通过命令行参数调整驱逐速率。

用户可以通过在 `karmada-controller-manager` 组件上配置以下命令行参数，来精细化控制驱逐行为：

* `--resource-eviction-rate`:
  每秒驱逐的数量。默认值为 **0.5**。设置为 0 时驱逐速率会以 30 分钟一个的速度进行。

示例：
- 假设需要驱逐 12 个工作负载，设置 `--resource-eviction-rate=0.5` 时，大约每 2 秒驱逐 1 个，约 24 秒完成全部驱逐。
- 若设置为 `--resource-eviction-rate=2`，则大约每秒驱逐 2 个，约 6 秒完成。

:::note

集群故障迁移特性仍在持续迭代中，欢迎大家反馈实际使用场景。如果您对该特性感兴趣，欢迎提交增强 issue 与我们交流。

:::


下面来介绍一些多集群故障迁移的场景：

- 管理员在 Karmada 控制面部署了一个离线业务，并将业务 Pod 实例分发到了多个集群。突然某个集群发生故障，管理员希望 Karmada 能够把故障集群上的 Pod 实例迁移到其他条件适合的集群中去。
- 普通用户通过 Karmada 控制面在某一个集群上部署了一个在线业务，业务包括数据库实例、服务器实例、配置文件等，服务通过控制面上的ELB对外暴露，此时某一集群发生故障，用户希望把整个业务能迁移到另一个情况较适合的集群上，业务迁移期间需要保证服务不断服。
- 管理员将某个集群进行升级，作为基础设施的容器网络、存储等发生了改变，管理员希望在集群升级之前把当前集群上的应用迁移到其他适合的集群中去，业务迁移期间需要保证服务不断服。
- ......

