# Karmada v1.15 Released! Enhanced Resource Awareness for Multi-Template Workloads!

Karmada is an open multi-cloud and multi-cluster container orchestration engine designed to help users deploy and operate business applications in a multi-cloud environment. With its compatibility with the native Kubernetes API, Karmada can smoothly migrate single-cluster workloads while still maintaining coordination with the surrounding Kubernetes ecosystem tools.

[Karmada v1.15](https://github.com/karmada-io/karmada/releases/tag/v1.15.0) has been released, this version includes the following new features:

- Precise resource awareness for multi-template workloads
- Enhanced cluster-level failover functionality
- Structured logging
- Significant performance improvements for Karmada controllers and schedulers

## Overview of New Features

### Precise Resource Awareness for Multi-Template Workloads

Karmada utilizes a resource interpreter to retrieve the replica count and resource requests of workloads. Based on this data, it calculates the total resource requirements of the workloads, thereby enabling advanced capabilities such as resource-aware scheduling and federated quota management. This mechanism works well for traditional single-template workloads. However, workloads for many AI and big data applications (e.g., FlinkDeployments, PyTorchJobs, and RayJobs) consist of multiple Pod templates or components, each with unique resource demands. Since the resource interpreter can only process resource requests from a single template and fails to accurately reflect differences between multiple templates, the resource calculation for multi-template workloads is not precise enough.

In this version, Karmada has strengthened its resource awareness for multi-template workloads. By extending the resource interpreter, Karmada can now obtain the replica count and resource requests of different templates within the same workload, ensuring data accuracy. This improvement also provides more reliable and granular data support for federated quota management of multi-template workloads.

Suppose you deploy a FlinkDeployment with the following resource-related configuration:

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

Through ResourceBinding, you can view the replica count and resource requests of each template in the FlinkDeployment parsed by the resource interpreter.

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

At this point, the resource usage of the FlinkDeployment calculated by FederatedResourceQuota is as follows:

```yaml
 status:
    overallUsed:
      cpu: "3"
      memory: 3072m
```

Note: This feature is currently in the Alpha stage and requires enabling the MultiplePodTemplatesScheduling feature gate to use.

As multi-template workloads are widely adopted in cloud-native environments, Karmada is committed to providing stronger support for them. In upcoming versions, we will further enhance scheduling support for multi-template workloads based on this feature and offer more granular resource-aware scheduling—stay tuned for more updates!


For more information about this feature, please refer to: [Multi-Pod Template Support](https://github.com/karmada-io/karmada/tree/master/docs/proposals/scheduling/multi-podtemplate-support).

### Enhanced Cluster-Level Failover Functionality

In previous versions, Karmada provided basic cluster-level failover capabilities, allowing cluster-level application migration to be triggered through custom failure conditions. To meet the requirement of preserving the running state of stateful applications during cluster failover, Karmada v1.15 supports an application state preservation policy for cluster failover. For big data processing applications (e.g., Flink), this capability enables restarting from the pre-failure checkpoint and seamlessly resuming data processing to the state before the restart, thus avoiding duplicate data processing.

The community has introduced a new `StatePreservation` field under `.spec.failover.cluster` in the PropagationPolicy/ClusterPropagationPolicy API. This field is used to define policies for preserving and restoring state data of stateful applications during failover. Combined with this policy, when an application is migrated from a failed cluster to another cluster, key data can be extracted from the original resource configuration.

The state preservation policy `StatePreservation` includes a series of `StatePreservationRule` configurations. It uses `JSONPath` to specify the segments of state data that need to be preserved and leverages the associated `AliasLabelName` to pass the data to the migrated cluster.

Taking a Flink application as an example: in a Flink application, `jobID` is a unique identifier used to distinguish and manage different Flink jobs. When a cluster fails, the Flink application can use `jobID` to restore the state of the job before the failure and continue execution from the failure point. The specific configuration and steps are as follows:

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

1. Before migration, the Karmada controller extracts the job ID according to the path configured by the user.

2. During migration, the Karmada controller injects the extracted job ID into the Flink application configuration in the form of a label, such as `application.karmada.io/cluster-failover-jobid: <jobID>`.

3. Kyverno running in the member cluster intercepts the Flink application creation request, obtains the checkpoint data storage path of the job based on the `jobID` (e.g., `/<shared-path>/<job-namespace>/<jobId>/checkpoints/xxx`), and then configures `initialSavepointPath` to indicate starting from the savepoint.

4. The Flink application starts based on the checkpoint data under `initialSavepointPath`, thereby inheriting the final state saved before migration.


This capability is widely applicable to stateful applications that can start from a specific savepoint. These applications can follow the above process to implement state persistence and restoration for cluster-level failover.

Note: This feature is currently in the Alpha stage and requires enabling the StatefulFailoverInjection feature gate to use.

**Function Constraints**:

1. The application must be restricted to run in a single cluster.

2. The migration cleanup policy (PurgeMode) is limited to `Directly`—this means ensuring that the failed application is deleted from the old cluster before being restored in the new cluster to guarantee data consistency.

### Structured Logging

Logs are critical tools for recording events, states, and behaviors during system operation, and are widely used for troubleshooting, performance monitoring, and security auditing. Karmada components provide rich runtime logs to help users quickly locate issues and trace execution scenarios. In previous versions, Karmada only supported unstructured text logs, which were difficult to parse and query efficiently, limiting its integration capabilities in modern observability systems.

Karmada v1.15 introduces support for structured logging, which can be configured to output in JSON format using the `--logging-format=json` startup flag. An example of structured logging is as follows:

```json
{
  "ts":"log timestamp",
  "logger":"cluster_status_controller",
  "level": "info",
  "msg":"Syncing cluster status",
  "clusterName":"member1"
}
```

The introduction of structured logging significantly improves the usability and observability of logs:

- **Efficient Integration**: Seamless integration with mainstream logging systems such as Elastic, Loki, and Splunk, without relying on complex regular expressions or log parsers.

- **Efficient Query**: Structured fields support fast retrieval and analysis, significantly improving troubleshooting efficiency.

- **Enhanced Observability**: Key context information (e.g., cluster name, log level) is presented as structured fields, facilitating cross-component and cross-time event correlation for accurate issue localization.

- **Maintainability**: Structured logging makes it easier for developers and operators to maintain, parse, and evolve log formats as the system changes.

### Significant Performance Improvements for Karmada Controllers and Schedulers

In this version, the Karmada performance optimization team has continued to focus on improving the performance of Karmada's key components, achieving significant progress in both controllers and schedulers.

**In terms of the controller**, by introducing [controller-runtime priority queue](https://github.com/kubernetes-sigs/controller-runtime/issues/2374), the controller can give priority to responding to user-triggered resource changes after a restart or leader transition, thereby significantly reducing the downtime during service restart and failover processes.

The test environment included 5,000 Deployments, 2,500 Policies, and 5,000 ResourceBindings. The Deployment and Policy were updated when the controller restarted with a large number of pending events still in the work queue. Test results showed that **the controller could immediately respond to and prioritize processing these update events, verifying the effectiveness of this optimization**.

Note: This feature is currently in the Alpha stage and requires enabling the ControllerPriorityQueue feature gate to use.

**In terms of the scheduler**, by reducing redundant computations in the scheduling process and decreasing the number of remote call requests, the scheduling efficiency of the Karmada scheduler has been significantly improved.

Tests were conducted to record the time taken to schedule 5,000 ResourceBindings with the precise scheduling component karmada-scheduler-estimator enabled. The results are as follows:

- The scheduler throughput QPS increased from approximately 15 to about 22, representing a 46% performance improvement.
- The number of gRPC requests decreased from approximately 10,000 to around 5,000, a reduction of 50%.

These tests confirm that the performance of Karmada controllers and schedulers has been greatly improved in version 1.15. In the future, we will continue to conduct systematic performance optimizations for controllers and schedulers.

For the detailed test report, please refer to [[Performance] Overview of performance improvements for v1.15](https://github.com/karmada-io/karmada/issues/6516).

## Acknowledging Our Contributors

The Karmada v1.15 release includes 269 code commits from 39 contributors. We would like to extend our sincere gratitude to all the contributors:

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
