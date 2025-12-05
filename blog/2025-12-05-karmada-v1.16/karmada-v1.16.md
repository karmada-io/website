# Karmada v1.16 Released! Multi-Component Workload Scheduling Support!

Karmada is an open multi-cloud and multi-cluster container orchestration engine designed to help users deploy and operate business applications in a multi-cloud environment. With its compatibility with the native Kubernetes API, Karmada can smoothly migrate single-cluster workloads while still maintaining coordination with the surrounding Kubernetes ecosystem tools.

[Karmada v1.16](https://github.com/karmada-io/karmada/blob/master/docs/CHANGELOG/CHANGELOG-1.16.md) has been released, this version includes the following new features:

- Multi-component workload scheduling support
- Enhanced replica assignment with Webster algorithm
- Eviction queue rate limiting
- Continuous performance optimization

These features make Karmada more mature and reliable in handling large-scale, complex multi-cluster scenarios. We encourage you to upgrade to v1.16.0 to experience the value these new features bring.

## Overview of New Features

### Multi-Component Workload Scheduling Support

Many AI/big data applications today consist of multiple components that work together to complete complex computing tasks. For example:

- FlinkDeployment contains JobManager and TaskManager,
- SparkApplication contains Driver and Executor,
- RayCluster contains Head and Worker nodes.

In Karmada v1.16.0, we introduce **multi-component scheduling**, a new capability that enables the complete and unified placement of multi-component workloads — those composed of multiple interrelated components — into a single member cluster with sufficient resources.

This feature builds upon the [precise resource awareness for multi-template workloads](https://karmada.io/blog/2025/09/05/karmada-v1.15/karmada-v1.15#precise-resource-awareness-for-multi-template-workloads) introduced in v1.15, which allows Karmada to accurately understand the resource topology of complex workloads. In v1.16, the scheduler leverages this insight to:

- Estimate how many complete multi-component workloads a member cluster can accommodate based on **ResourceQuota** limits;
- Predict workload schedulability using **actual node resource availability** in member clusters.

The current version ships with built-in resource interpreters for the following multi-component workload types:

- FlinkDeployment (flink.apache.org/v1beta1)
- SparkApplication (sparkoperator.k8s.io/v1beta2)
- Job (batch.volcano.sh/v1alpha1)
- MPIJob (kubeflow.org/v2beta1)
- RayCluster (ray.io/v1)
- RayJob (ray.io/v1)
- TFJob (kubeflow.org/v1)
- PyTorchJob (kubeflow.org/v1)

If you are using custom multi-component workloads, you can extend Karmada's resource interpreter to support them as well.

Let's take a simple example. Suppose you have a FlinkDeployment with the following resource configuration:

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

With multi-component scheduling enabled, Karmada will:

1. Accurately parse the resource requirements of JobManager and TaskManager through the resource interpreter;
2. Evaluate whether each member cluster has sufficient resources to accommodate the complete FlinkDeployment (1 JobManager + 2 TaskManagers);
3. Schedule the entire FlinkDeployment to a single cluster that meets the requirements.

The release of this feature marks a significant step for Karmada in supporting AI/big data applications—combining accurate resource interpretation, quota-aware accounting, and cross-cluster scheduling in a single, cohesive framework.

### Enhanced Replica Assignment with Webster Algorithm

Karmada supports multiple replica scheduling strategies such as DynamicWeight, Aggregated, and StaticWeight to distribute workload replicas across member clusters. At the core of these strategies is the algorithm that maps cluster weights to actual replica counts.

In previous versions, the replica assignment algorithm had certain limitations.

- Non-monotonicity: When the total number of replicas increased, some clusters could unexpectedly receive fewer replicas,
- Lack of strong idempotency: The same input could produce different outputs,
- Unfair remainder distribution: There was a lack of a reasonable priority strategy when allocating remaining replicas among clusters with equal weights.

In this release, we introduce the **Webster method** (also known as the **Sainte-Laguë method**) to improve replica assignment during cross-cluster scheduling. By adopting the Webster algorithm, Karmada now achieves:

- **Monotonic replica assignment**: Increasing the total number of replicas will never cause any cluster to lose replicas, ensuring consistent and intuitive behavior.
- **Fair handling of remaining replicas**: When distributing replicas among clusters with equal weights, priority is given to clusters with fewer current replicas. This "smaller-first" approach helps promote balanced deployments and better meets high availability (HA) requirements.

This update enhances the stability, fairness, and predictability of cross-cluster workload distribution, making replica scheduling more robust in multi-cluster environments.

### Eviction Queue Rate Limiting

In multi-cluster environments, when a cluster fails, resources need to be evicted from the failed cluster and rescheduled to healthy clusters. If multiple clusters fail simultaneously or in quick succession, a large number of eviction and rescheduling operations can overwhelm healthy clusters and the control plane, potentially leading to cascading failures.

This release introduces an eviction queue with rate limiting capabilities for the Karmada taint manager. The eviction queue controls the resource eviction rate through a configurable fixed-rate parameter, thereby enhancing the failover mechanism. The implementation also provides metrics for monitoring the eviction process, improving overall system observability.

This feature is particularly useful in the following scenarios:

- You need to prevent cascading failures during large-scale failures, ensuring the system is not overwhelmed by excessive eviction operations.
- You want to configure eviction behavior based on the characteristics of different environments. For example, using a lower eviction rate in production environments and a higher rate in development or test environments.
- You need to monitor the performance of the eviction queue, including the number of pending evictions, processing latency, and success/failure rates, to adjust configurations and respond to operational issues.

Key features of the eviction queue include:

- **Configurable fixed-rate limiting**: Configure the eviction rate per second via the `--eviction-rate` command-line parameter. Example: To set a maximum of 1 resource eviction every 2 seconds: `--eviction-rate=0.5`.
- **Comprehensive metrics support**: Provides metrics such as queue depth, resource types, processing latency, and success/failure rates for convenient monitoring and troubleshooting.

By introducing the rate limiting mechanism, administrators can better control the resource scheduling rate during cluster failover, enhancing both service stability and resource scheduling flexibility and efficiency.

For detailed usage of this feature, please refer to the [User Guide: Configuring Eviction Rate Limiting](https://karmada.io/docs/next/userguide/failover/cluster-failover/#configuring-eviction-rate-limiting).

### Continuous Performance Optimization

In this release, the performance optimization team has continued to enhance Karmada's performance, with significant improvements to the controllers.

In v1.15, we introduced [controller-runtime priority queue](https://github.com/kubernetes-sigs/controller-runtime/issues/2374), which allows controllers built on controller-runtime to prioritize processing the latest changes after a restart or leader transition, significantly reducing downtime during service restarts and failovers.

In v1.16, we extended this capability. For controllers not built on controller-runtime (such as the detector controller), we enabled priority queue functionality for all controllers using async workers, allowing them to benefit from this optimization as well.

The test environment included 5,000 Deployments and their PropagationPolicies, with the ControllerPriorityQueue feature gate enabled in the karmada-controller-manager component. After restarting the karmada-controller-manager component with a large number of pending events still in the work queue, manually modifying a Deployment showed that its update event could still be quickly processed by the controller and synchronized to member clusters.

These test results demonstrate that the performance of Karmada controllers has been greatly improved in v1.16. In the future, we will continue to conduct systematic performance optimizations for controllers and schedulers.

For detailed progress and test reports, please refer to PR: [[Performance] enable asyncPriorityWorker in all controllers](https://github.com/karmada-io/karmada/pull/6965).

# Acknowledging Our Contributors

The Karmada v1.16 release includes 263 code commits from 30 contributors. We would like to extend our sincere gratitude to all the contributors:

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
