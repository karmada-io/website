---
title: Cluster Failover
---

In the multi-cluster scenario, user workloads may be deployed in multiple clusters to improve service high availability. In Karmada, when a cluster fails or the user does not want to continue running workloads on a cluster, users can [manage cluster taints](./cluster-taint-management.md) to evict workloads from the cluster or prevent new workloads from being scheduled to the target cluster.

The evicted workloads will be scheduled to other best-fit clusters, thus achieving cluster failover and ensuring the availability and continuity of user services.

## How to Enable

The cluster failover feature is controlled by the `Failover` feature gate. `Failover` feature gate is currently in the `Beta` stage and is turned off by default, which should be explicitly enabled to avoid unexpected incidents. You can enable it in the `karmada-controller-manager`:

```
--feature-gates=Failover=true
```

## Configure Cluster Failover

When a cluster is tainted with `NoExecute`, it will trigger the migration of workloads from that cluster. For detailed migration mechanics, please refer to [Cluster Failover Internals](cluster-failover-internals.md). In addition, users can configure the behavior of cluster failover through the `.spec.failover.cluster` field of the PropagationPolicy API, enabling fine-grained control over application-level cluster failover behavior.

`ClusterFailoverBehavior` provides the following configurable fields:

- PurgeMode
- StatePreservation

### Configure PurgeMode

`PurgeMode` represents how to deal with the legacy applications on the cluster from which the application is migrated. Currently, the supported values are `Directly` and `Gracefully`, with the default being `Gracefully`. The explanations for each type are as follows:

- `Directly` represents that Karmada will directly evict the legacy application. This is useful in scenarios where an application cannot tolerate two instances running simultaneously. For example, the Flink application supports exactly-once state consistency, which means it requires that no two instances of the application are running at the same time. During a failover, it is crucial to ensure that the old application is removed before creating a new one to avoid duplicate processing and maintaining state consistency.
- `Gracefully` represents that Karmada will wait for the application to become healthy on the new cluster or after a timeout is reached before evicting the application.

PropagationPolicy can be configured as follows:

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

### Application State Preservation

Starting from version v1.15, the cluster failover feature has added support for stateful applications, providing users with a general way to define application state preservation in the context of cluster failover.

:::note Prerequisites

This feature requires enabling the `StatefulFailoverInjection` feature gate. `StatefulFailoverInjection` is currently in the `Alpha` stage and is disabled by default.

There are also some limitations when using this feature:
1. Only the scenario where the application is deployed in one cluster and migrated to another cluster is considered.
2. If consecutive failovers occur (e.g., clusterA → clusterB → clusterC), the `PreservedLabelState` before the last failover is used for injection. If empty, injection is skipped.
3. The injection operation is performed only when `PurgeMode` is set to `Directly`.

:::

`StatePreservation` is a field under `.spec.failover.cluster`. It defines the policy for preserving and restoring state data during failover events for stateful applications. When an application fails over from one cluster to another, this policy enables the extraction of critical data from the original resource configuration.

It contains a list of `StatePreservationRule` configurations. Each rule specifies:
- **`jsonPath`**: A JSONPath expression targeting specific pieces of state data to be preserved.
- **`aliasLabelName`**: A label key used when the preserved data is passed to the new cluster.

> **Note**: JSONPath expressions by default start searching from the `status` field of the API resource object. For example, to extract `availableReplicas` from a Deployment, use `{.availableReplicas}` instead of `{.status.availableReplicas}`. JSONPath syntax follows the [Kubernetes specification](https://kubernetes.io/docs/reference/kubectl/jsonpath/).

#### How State Preservation Works

1. **Before migration**: The Karmada controller retrieves state data from the resource's `status` according to the `jsonPath` configured by the user.
2. **During migration**: The Karmada controller injects the extracted data as labels into the application configuration on the new cluster.
3. **Target cluster processing**: A tool such as Kyverno running on the member cluster intercepts the resource creation request, reads the injected labels, and configures the application accordingly (e.g., setting a restore checkpoint path).
4. **Resuming execution**: The application starts from the preserved state, inheriting the state saved before migration.

#### Example: Flink Job State Preservation

Taking Flink as an example, `jobID` uniquely identifies a Flink job. When a cluster failure occurs, the Flink application can use the `jobID` to obtain the checkpoint data storage, restore the job state before the cluster failure, and continue execution from the failure point in the new cluster:

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

### Configuring Eviction Rate Limiting

In scenarios involving large-scale failures across multiple clusters, simultaneously evicting a large number of workloads can put immense pressure on the Karmada control plane and the remaining healthy clusters. To improve the stability and controllability of the failover process, Karmada introduces a rate limiting mechanism, allowing the eviction rate to be adjusted as needed via command-line parameters.

You can fine-tune the eviction behavior by configuring the following command-line parameters on the `karmada-controller-manager` component:
* `--resource-eviction-rate`:
  Number of evictions per second. Default: **0.5**. When the value is 0, the acceleration speed will be set to run at a rate of 30 minutes per cycle.

Examples:
- If 12 workloads must be evicted and `--resource-eviction-rate=0.5`, Karmada evicts roughly one workload every 2 seconds and completes in about 24 seconds.
- If set to `--resource-eviction-rate=2`, about 2 resources will be evicted per second, completing in roughly 6 seconds.

:::note

Cluster failover is still in continuous iteration. We are in the progress of gathering use cases. If you are interested in this feature, please feel free to start an enhancement issue to let us know.

:::

