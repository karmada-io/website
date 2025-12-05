# Karmada v1.16 版本发布！支持多模板工作负载调度

Karmada 是开放的多云多集群容器编排引擎，旨在帮助用户在多云环境下部署和运维业务应用。凭借兼容 Kubernetes 原生 API 的能力，Karmada 可以平滑迁移单集群工作负载，并且仍可保持与 Kubernetes 周边生态工具链协同。

[Karmada v1.16](https://github.com/karmada-io/karmada/blob/master/docs/CHANGELOG/CHANGELOG-1.16.md) 版本现已发布，本版本包含下列新增特性：

- 支持多模板工作负载调度
- 使用 Webster 算法增强副本分配
- 驱逐队列速率限制
- 持续的性能优化

这些特性使 Karmada 在处理大规模、复杂的多集群场景时更加成熟和可靠。我们鼓励您升级到 v1.16.0，体验这些新功能带来的价值。

## 新特性概览

### 支持多模板工作负载调度

当前许多AI/大数据应用由多个组件构成，这些组件之间相互协作以完成复杂的计算任务。例如：

- FlinkDeployment 包含 JobManager 和 TaskManager，
- SparkApplication 包含 Driver 和 Executor，
- RayCluster 包含 Head 和 Worker 节点。

在 Karmada v1.16.0 中，我们引入了**多模板调度**，这是一项全新的能力，使得 Karmada 能够将由多个相互关联组件组成的多模板工作负载完整且统一地调度到具有充足资源的单个成员集群中。

此功能建立在 v1.15 版本引入的[多模板工作负载资源精确感知](https://karmada.io/blog/2025/09/05/karmada-v1.15/karmada-v1.15#precise-resource-awareness-for-multi-template-workloads)功能之上，该支持使 Karmada 能够
准确理解复杂工作负载的资源拓扑。在 v1.16 中，调度器利用这些信息来：

- 基于 ResourceQuota 限制来估算成员集群可以容纳的完整的多模板工作负载数；
- 利用成员集群中实际节点的可用资源来预测工作负载的可调度性。

当前版本为以下多模板工作负载类型提供了内置的资源解释器：

- FlinkDeployment (flink.apache.org/v1beta1)
- SparkApplication (sparkoperator.k8s.io/v1beta2)
- Job (batch.volcano.sh/v1alpha1)
- MPIJob (kubeflow.org/v2beta1)
- RayCluster (ray.io/v1)
- RayJob (ray.io/v1)
- TFJob (kubeflow.org/v1)
- PyTorchJob (kubeflow.org/v1)

如果您使用的是其他的自定义多模板工作负载，也可以通过扩展 Karmada 的资源解释器来支持它们。

让我们举个简单的例子，假设您有一个 FlinkDeployment，其资源配置如下：

```yaml
apiVersion: flink.apache.org/v1beta1
kind: FlinkDeployment
metadata:
  name: flink-example
spec:
  jobManager:
    replicas: 1
    resource:
      cpu: 1
      memory: "1024m"
  taskManager:
    replicas: 2
    resource:
      cpu: 2
      memory: "2048m"
```

启用多模板调度功能后，Karmada 会：

1. 通过资源解释器准确解析出 JobManager 和 TaskManager 的资源需求；
2. 评估每个成员集群是否有足够资源容纳完整的 FlinkDeployment（1 个 JobManager + 2 个 TaskManager）；
3. 将整个 FlinkDeployment 调度到单个满足条件的集群。

此功能的发布标志着 Karmada 在支持AI/大数据应用方面迈出了重要一步——将精准的资源解释、配额感知计算和跨集群调度融合在一个统一的框架中。

### 使用 Webster 算法增强副本分配

Karmada 支持多种副本调度策略，如 DynamicWeight、Aggregated 和 StaticWeight，用于在成员集群之间分配工作负载的副本。这些策略的核心在于将集群权重转化为实际副本数量的算法。

在之前的版本中，副本分配算法存在一定的局限性：

- 非单调性：当总副本数增加时，某些集群可能意外地获得更少的副本.
- 缺乏强幂等性：相同的输入可能产生不同的输出.
- 不公平的余数分配：在具有相同权重的集群之间分配剩余副本时缺乏合理的优先级策略。

在当前版本中，我们引入了 Webster 方法（也称为 Sainte-Laguë 方法）来改进跨集群调度期间的副本分配。通过采用 Webster 算法，Karmada 现在实现了：

- 单调副本分配：增加总副本数绝不会导致任何集群丢失副本，确保行为一致且直观。
- 剩余副本的公平处理：在权重相等的集群间分配副本时，优先考虑当前副本数较少的集群。这种“小优先”方式有助于促进均衡部署，更好地满足高可用性（HA）需求。

此次更新增强了跨集群工作负载分配的稳定性、公平性和可预测性，使多集群环境中的副本调度更加稳健。

### 驱逐队列速率限制

在多集群环境中，当集群发生故障时，资源需要从故障集群中驱逐并重新调度到健康的集群。如果多个集群同时或在短时间内相继发生故障，大量的驱逐和重新调度操作可能会使健康集群和控制平面不堪重负，进而导致级联故障。

此版本引入了具有速率限制功能的驱逐队列，用于 Karmada 污点管理器。驱逐队列通过可配置的固定速率参数来控制资源驱逐速率，从而增强故障迁移机制。该实现还提供了用于监控驱逐过程的指标，提高了整体系统的可观测性。

这个特性在以下场景特别有用：

- 您需要在大规模故障期间防止级联故障，确保系统不会因为过多的驱逐操作而不堪重负。
- 您希望根据不同环境的特性配置驱逐行为。例如，在生产环境中使用较低的驱逐速率，在开发或测试环境中使用较高的速率。
- 您需要监控驱逐队列的性能，包括待处理驱逐的数量、处理延迟以及成功/失败率，以便调整配置和响应运维问题。

驱逐队列的核心特性包括：

- 可配置的固定速率限制：通过 --eviction-rate 命令行参数配置每秒驱逐速率。示例：设置每 2 秒最多驱逐 1 个资源：--eviction-rate=0.5。
- 完善的指标支持：提供队列深度、资源类型、处理延迟、成功/失败率等指标，便于监控和故障排查。
通过引入速率限制机制，管理员可以更好地控制集群故障迁移期间的资源调度速率，在保障服务稳定性的同时，提升资源调度的灵活性和效率。

有关此功能的详细使用方法，请参阅[用户指南：配置驱逐速率限制](https://karmada.io/docs/next/userguide/failover/cluster-failover/#configuring-eviction-rate-limiting)。 

### 持续的性能优化

在此版本中，性能优化团队继续增强 Karmada 的性能，对控制器进行了重大改进。

在 v1.15 中，我们引入了 [controller-runtime 优先级队列](https://github.com/kubernetes-sigs/controller-runtime/issues/2374)，它允许基于 controller-runtime 构建的控制器在重启或主从切换后优先处理最新的变更，从而显著减少服务重启和故障转移期间的停机时间。

在 v1.16 中，我们扩展了这一能力。对于不是基于 controller-runtime 构建的控制器（如 detector controller），我们通过为所有使用异步 worker 的控制器启用优先级队列功能，使它们也能享受到这一优化。

测试环境包括 5,000 个 Deployments 及其 PropagationPolicy，并在 karmada-controller-manager 组件中启用了 ControllerPriorityQueue 特性开关。在 karmada-controller-manager 组件重启后、工作队列中仍有大量待处理事件的情况下，手动修改一个 Deployment，其更新事件仍能被控制器快速处理并被同步到成员集群。

这些测试结果证明，Karmada 控制器的性能在 v1.16 中得到了很大的提升。未来，我们将继续对控制器和调度器进行系统性的性能优化。

有关详细的进展和测试报告，请参阅 PR: [[Performance] enable asyncPriorityWorker in all controllers](https://github.com/karmada-io/karmada/pull/6965)。

# 致谢贡献者

Karmada v1.16 版本包含了来自 30 位贡献者的 263 次代码提交，在此对各位贡献者表示由衷的感谢：

| ^-^                 | ^-^            | ^-^                |
|---------------------|----------------|--------------------|
| @7h3-3mp7y-m4n      | @baiyutang     | @dekaihu           |
| @devarsh10          | @ikaven1024    | @jabellard         |
| @karmada-bot        | @kasanatte     | @Kexin2000         |
| @liaolecheng        | @LivingCcj     | @luyb177           |
| @mszacillo          | @owenowenisme  | @pokerfaceSad      |
| @RainbowMango       | @rayo1uo       | @rohan-019         |
| @ryanwuer           | @satvik2131    | @seanlaii          |
| @ssenecal-modular   | @SunsetB612    | @vie-serendipity   |
| @vsha96             | @warjiang      | @whosefriendA      |
| @XiShanYongYe-Chang | @zach593       | @zhzhuang-zju      |

![karmada v1.16 contributors](./img/contributors.png)
