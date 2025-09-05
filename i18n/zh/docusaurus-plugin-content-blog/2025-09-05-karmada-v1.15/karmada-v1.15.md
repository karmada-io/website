# Karmada v1.15 版本发布！多模板工作负载资源感知能力增强！

Karmada 是开放的多云多集群容器编排引擎，旨在帮助用户在多云环境下部署和运维业务应用。凭借兼容 Kubernetes 原生 API 的能力，Karmada 可以
平滑迁移单集群工作负载，并且仍可保持与 Kubernetes 周边生态工具链协同。

[Karmada v1.15](https://github.com/karmada-io/karmada/releases/tag/v1.15.0) 版本现已发布，本版本包含下列新增特性：

- 多模板工作负载的资源精确感知
- 集群级故障迁移功能增强
- 结构化日志
- Karmada 控制器和调度器性能显著提升

## 新特性概览

### 多模板工作负载的资源精确感知

Karmada 利用资源解释器获取工作负载的副本数和资源请求，并据此计算工作负载所需资源总量，从而实现资源感知调度，联邦配额管理等高阶能力。这种机制在传统的单模板工作负载中表现良好。然而，许多AI大数据应用的工作负载 CRD（如 FlinkDeployments，PyTorchJob 和 RayJob 等）包含多个 Pod 模板或组件，每个组件都有独特的资源需求。由于资源解释器仅能处理单个模板的资源请求，无法准确反映不同模板间的差异，导致多模板工作负载的资源计算不够精确。

在这个版本中，Karmada 强化了对多模板工作负载的资源感知能力，通过扩展资源解释器，Karmada 现在可以获取同一工作负载不同模板的副本数和资源请求，确保数据的精确性。这一改进也为多模板工作负载的联邦配额管理提供了更加可靠和精细的数据支持。

假设你部署了一个 FlinkDeployment，其资源相关配置如下：

```yaml
spec:
  jobManager:
    replicas: 1
    resource:
      cpu: 1
      memory: 1024m
  taskManager:
    replicas: 1
    resource:
      cpu: 2
      memory: 2048m
```

通过 ResourceBinding，你可以查看资源解释器解析出的 FlinkDeployment 各个模板的副本数以及资源请求。

```yaml
spec:
  components:
  - name: jobmanager
    replicaRequirements:
      resourceRequest:
        cpu: "1"
        memory: "1.024"
    replicas: 1
  - name: taskmanager
    replicaRequirements:
      resourceRequest:
        cpu: "2"
        memory: "2.048"
    replicas: 1
```

此时，FederatedResourceQuota 计算的 FlinkDeployment 占用的资源量为：

```yaml
 status:
    overallUsed:
      cpu: "3"
      memory: 3072m
```

注意：该特性​​目前处于 Alpha 阶段，需要启用 MultiplePodTemplatesScheduling 特性开关​​才能使用。

随着多模板工作负载在云原生环境中的广泛应用，Karmada 致力于对其提供更强有力的支持。在接下来的版本中，我们将基于此功能进一步加强对多模板工作负载的调度支持，提供更加细粒度的资源感知调度——敬请期待更多更新！


更多有关此功能的资料请参考：[多Pod模板支持](https://github.com/karmada-io/karmada/tree/master/docs/proposals/scheduling/multi-podtemplate-support)。

### 集群级故障迁移功能增强

在之前的版本中，Karmada 提供了基本的集群级故障迁移能力，能够通过自定义的故障条件触发集群级别的应用迁移。为了满足有状态应用在集群故障迁移过程中保留其运行状态的需求，Karmada 在 v1.15 版本支持了集群故障迁移的应用状态中继机制。对于大数据处理应用（例如 Flink），利用此能力可以从故障前的 checkpoint 重新启动，无缝恢复到重启前的数据处理状态，从而避免数据重复处理。

社区在 PropagationPolicy/ClusterPropagationPolicy API 中的 `.spec.failover.cluster` 下引入了一个新的 `StatePreservation` 字段， 用于定义有状态应用在故障迁移期间保留和恢复状态数据的策略。结合此策略，当应用从一个故障集群迁移到另一个集群时，能够从原始资源配置中提取关键数据。

状态保留策略 `StatePreservation` 包含了一系列 `StatePreservationRule` 配置，通过 `JSONPath` 来指定需要保留的状态数据片段，并利用关联的 `AliasLabelName` 将数据传递到迁移后的集群。

以 Flink 应用为例，在 Flink 应用中，`jobID` 是一个唯一的标识符，用于区分和管理不同的 Flink 作业（jobs）。当集群发生故障时，Flink 应用可以利用 `jobID` 来恢复故障前作业的状态，从故障点处继续执行。具体的配置和步骤如下：


```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: foo
spec:
  #...
  failover:
    cluster:
      purgeMode: Directly
      statePreservation:
        rules:
          - aliasLabelName: application.karmada.io/cluster-failover-jobid
            jsonPath: "{ .jobStatus.jobID }"
```

1. 迁移前，Karmada 控制器将按照用户配置的路径提取 job ID。

2. 迁移时，Karmada 控制器将提取的 job ID 以 label 的形式注入到 Flink 应用配置中，比如 `application.karmada.io/cluster-failover-jobid: <jobID>`。

3. 运行在成员集群的 Kyverno 拦截 Flink 应用创建请求，并根据 `jobID` 获取该 job 的 checkpoint 数据存储路径，比如 `/<shared-path>/<job-namespace>/<jobId>/checkpoints/xxx`，然后配置 `initialSavepointPath` 指示从 save point 启动。

4. Flink 应用根据 `initialSavepointPath` 下的 checkpoint 数据启动，从而继承迁移前保存的最终状态。


该能力广泛适用于能够基于某个 save point 启动的有状态应用程序，这些应用均可参考上述流程实现集群级故障迁移的状态中继。

注意：该特性​​目前处于 Alpha 阶段，需要启用 StatefulFailoverInjection 特性开关​​才能使用。

**功能约束**：

1. 应用必须限定在单个集群中运行；

2. 迁移清理策略（PurgeMode）限定为 `Directly`，即需要确保故障应用在旧集群上删除之后再在新集群中恢复应用，确保数据一致性。

### 结构化日志

日志是系统运行过程中记录事件、状态和行为的关键工具，广泛用于故障排查、性能监控和安全审计。Karmada 组件提供丰富的运行日志，帮助用户快速定位问题并回溯执行场景。在先前版本中，Karmada 仅支持非结构化的文本日志，难以被高效解析与查询，限制了其在现代化观测体系中的集成能力。

Karmada 在 1.15 版本引入了结构化日志支持，可通过 `--logging-format=json` 启动参数配置 JSON 格式输出。结构化日志示例如下：

```json
{
  "ts":"日志时间戳",
  "logger":"cluster_status_controller",
  "level": "info",
  "msg":"Syncing cluster status",
  "clusterName":"member1"
}
```

结构化日志的引入显著提升了日志的可用性与可观测性：

- **高效集成**：可无缝对接 Elastic、Loki、Splunk 等主流日志系统，无需依赖复杂的正则表达式或日志解析器。

- **高效查询**：结构化字段支持快速检索与分析，显著提升故障排查效率。

- **可观察性增强**：关键上下文信息（如集群名、日志级别）以结构化字段呈现，便于跨组件、跨时间关联事件，实现精准问题定位。

- **可维护性提升**：结构化日志使开发者和运维人员在系统演进过程中更易于维护、解析和调整日志格式，保障日志体系的长期稳定与一致性。

### Karmada 控制器和调度器性能显著提升

在本次版本中，Karmada 性能优化团队继续致力于提升 Karmada 关键组件的性能，在控制器和调度器方面取得了显著进展。

**控制器方面**，通过引入优先级队列，控制器能够在重启或切主后优先响应用户触发的资源变更，从而显著缩短服务重启和故障切换过程中的停机时间。

测试环境包含 5,000 个 Deployment、2,500 个 Policy 以及 5,000 个 ResourceBinding。在控制器重启且工作队列中仍有大量待处理事件的情况下，更新 Deployment 和 Policy。测试结果显示，**控制器能够立即响应并优先处理这些更新事件，验证了该优化的有效性**。

注意：该特性​​目前处于 Alpha 阶段，需要启用 ControllerPriorityQueue 特性开关才能使用。

**调度器方面**，通过减少调度过程中的冗余计算，降低远程调用请求次数，Karmada 调度器的调度效率得到了显著提升。

测试记录了在开启精确调度组件 karmada-scheduler-estimator 情况下，调度 5,000 个 ResourceBinding 所用的时间，结果如下：

- 调度器吞吐量 QPS 从约 15 提升至约 22，性能提升达 46%；
- gRPC 请求次数从约 10,000 次减少至约 5,000 次，降幅达 50%。

这些测试证明，在 1.15 版本中，Karmada 控制器和调度器的性能得到了极大提升。未来，我们将继续对控制器和调度器进行系统性的性能优化。

相关的详细测试报告，请参考 [[Performance] Overview of performance improvements for v1.15](https://github.com/karmada-io/karmada/issues/6516)。

# 致谢贡献者

Karmada v1.15 版本包含了来自 39 位贡献者的 269 次代码提交，在此对各位贡献者表示由衷的感谢：

| ^-^                 | ^-^            | ^-^                |
|---------------------|----------------|--------------------|
| @abhi0324           | @abhinav-1305  | @Arhell            |
| @Bhaumik10          | @CaesarTY      | @cbaenziger        |
| @deefreak           | @dekaihu       | @devarsh10         |
| @greenmoon55        | @iawia002      | @jabellard         |
| @jennryaz           | @liaolecheng   | @linyao22          |
| @LivingCcj          | @liwang0513    | @mohamedawnallah   |
| @mohit-nagaraj      | @mszacillo     | @RainbowMango      |
| @ritzdevp           | @ryanwuer      | @samzong           |
| @seanlaii           | @SunsetB612    | @tessapham         |
| @wangbowen1401      | @warjiang      | @wenhuwang         |
| @whitewindmills     | @whosefriendA  | @XiShanYongYe-Chang|
| @zach593            | @zclyne        | @zhangsquared      |
| @zhuyulicfc49       | @zhzhuang-zju  | @zzklachlan        |


![karmada v1.15 contributors](./img/contributors.png)
