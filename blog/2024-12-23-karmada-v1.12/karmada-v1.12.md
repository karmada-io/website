# Karmada v1.12 Released! Enhanced Maintainability for Single-Cluster Application Migration

Karmada is an open multi-cloud, multi-cluster container orchestration engine designed to help users deploy and operate business applications in multi-cloud environments. With its compatibility with native Kubernetes APIs, Karmada can smoothly migrate single-cluster workloads while maintaining interoperability with the surrounding Kubernetes ecosystem toolchain.

![karmada](./img/karmada.png)

[Karmada v1.12](https://github.com/karmada-io/karmada/releases/tag/v1.12.0) has been released, this version includes the following new features:

- Enhanced application-level fault migration capabilities (addition of a state relay mechanism, suitable for high-availability scenarios in big data processing programs, such as Flink).
- Enhanced single-cluster application migration capabilities (applicable to migrating existing single-cluster applications)
- Karmada Operator supports high availability deployment capabilities
- OverridePolicy supports partial modification of structured field values.

## Overview of New Features

### Enhanced application-level fault migration capabilities

In previous versions, Karmada provided basic application-level fault migration capabilities, enabling application migration to be triggered based on application health status or custom fault conditions. To meet the need for stateful applications to retain their runtime state during fault migration, Karmada added an application state relay mechanism in version 1.12. For big data processing applications (such as Flink), this capability allows for restarting from a pre-failure checkpoint, seamlessly restoring to the data processing state before the restart, thus avoiding data duplication.

The community has introduced a new field in the PropagationPolicy/ClusterPropagationPolicy API to define strategies for stateful applications to retain and recover state data during failover. This strategy enables applications to extract critical data from the original resource configuration when migrating from one failed cluster to another via `.spec.failover.application.statePreservation`.

The state retention strategy **StatePreservation** includes a series of **StatePreservationRule** configurations that specify the state data fragments to be retained via JSONPath and use the associated **AliasLabelName** to transfer the data to the migrated cluster.

Taking a Flink application as an example, a **jobID** is a unique identifier used to distinguish and manage different Flink jobs. Each Flink job is assigned a **jobID** when it is submitted to the Flink cluster. When a job fails, the Flink application can use the **jobID** to recover the job's state from before the failure and continue execution from the point of failure. The specific configuration and steps are as follows:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: foo
spec:
  # ...
  failover:
    application:
      decisionConditions:
        tolerationSeconds: 60
      purgeMode: Immediately
      statePreservation:
        rules:
          - aliasLabelName: application.karmada.io/failover-jobid
            jsonPath: "{ .jobStatus.jobID }"
```

1. Before the migration, the Karmada controller will extract the job ID according to the path configured by the user.
2. During migration, the Karmada controller injects the extracted job ID into the Flink application configuration as a label, for example: `application.karmada.io/failover-jobid: <jobID>`.
3. Kyverno, running on the member cluster, intercepts Flink application creation requests and, based on the **jobID** and the checkpoint data storage path of the job (e.g., `/<shared-path>/<job-namespace>/<jobId>/checkpoints/xxx`), then configures **initialSavepointPath** with an instruction to start from the savepoint.
4. Flink applications start based on the **initialSavepointPath**, using the checkpoint data to inherit the final state saved before the migration.

This capability is built on FlinkDeployment, but it is widely applicable to stateful applications that can be started based on a certain save point. These applications can refer to the above process to implement state relay for fault migration.

This feature requires the StatefulFailoverInjection feature to be enabled. StatefulFailoverInjection is currently in Alpha and is disabled by default.

**Functional constraints:**
1. The application must be restricted to running in a single cluster;
2. The migration cleanup strategy (PurgeMode) is limited to **Immediately**, which triggers the immediate deletion of faulty applications before a new application is created to ensure data consistency.

### Enhanced single-cluster application migration capabilities

When users migrate their services from a single cluster to multiple clusters, if resources have already been migrated to the Karmada control plane, then when a resource template in the control plane is deleted, the resources in the member clusters will also be deleted. However, in some scenarios, users may want to retain resources in the member clusters. For example, as an administrator, unexpected situations may arise during workload migration (such as the cloud platform being unable to deploy the application or Pod malfunctions), requiring a rollback mechanism to immediately restore the system to its state before migration for rapid loss mitigation.


In version 1.12, the community `PropagationPolicy/ClusterPropagationPolicy` API introduced **PreserveResourcesOnDeletion**, a field to define the retention behavior of resources on member clusters when a resource template in the control plane is deleted. If this is set to **true**, the resources on the member cluster will be retained. Combined with this field, if users discover an anomaly during the migration process, a rollback operation can be quickly performed while preserving the original resources in the member cluster, making the entire migration rollback process safer and more controllable.

**Please note the following two points when using this field:**
- This configuration applies uniformly to all member clusters and does not selectively control only certain clusters.
- When a policy is deleted, the resource template and distributed member cluster resources will remain unchanged unless explicitly deleted.

For example, when deleting a Karmada control plane resource template, a user can configure the following PropagationPolicy to preserve the resources of the member cluster:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-pp
spec:
  conflictResolution: Overwrite
  preserveResourcesOnDeletion: true # After deleting the resource template, member cluster resources will be retained
  placement:
    clusterAffinity:
      clusterNames:
        - member1
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
    - apiVersion: v1
      kind: Service
      name: nginx-svc
```
For more information on safe rollback migration, please refer to: [How to roll back migration operations](https://karmada.io/docs/next/administrator/migration/migrate-in-batch/#how-to-roll-back-migration-operations).

### Karmada Operator supports high availability deployment capabilities
As a community-maintained installation tool, karmada-operator can be used to deploy and manage multiple Karmada instances. To better support high-availability deployments, this version of karmada-operator has implemented a series of targeted improvements and optimizations, including:

- Support for custom CA certificates has been introduced;
- Supports connecting to external etcd;
- The credentials for external etcd clients can be specified via the Secret;
- You can specify volumes and volume mounts for Karmada components;
- The APIServer service is exposed externally for service discovery.

These enhancements enable the karmada-operator to deploy a highly available Karmada control plane across multiple management clusters, spanning different data centers, thus meeting fault recovery requirements.

![architecture](./img/architecture.png)

The diagram above shows a production-grade high-availability architecture built using Karmada-operator. In this architecture, Karmada-operator deploys multiple Karmada control planes across data centers in different geographical locations and connects them to the same external etcd cluster. This setup not only ensures data consistency across data centers but also simplifies data management and maintenance.

Furthermore, leveraging the APIServer service exposure capabilities provided by Karmada-operator, combined with Ingress, a unified service access is offered externally. Simultaneously, a configurable CA certificate mechanism ensures the security of communication between the Karmada instance and external services.

This architecture significantly enhances the system's resilience to single data center failures, minimizes the risk of service interruptions due to data center failures, ensures business continuity and user experience stability, and meets stringent disaster recovery standards.

### OverridePolicy supports partial modification of structured field values.
To address this issue and improve the usability of OverridePolicy in such scenarios, Karmada introduced **FieldOverrider**, a feature that supports partial modification of structured field values in JSON and YAML formats—adding, replacing, or deleting only the required fields. This simplifies the configuration process, improves efficiency, reduces the possibility of errors, and makes resource management more intuitive and convenient. **FieldOverrider** users can then perform more granular processing of structured field values to adapt to changing application environment requirements.

To address this issue and improve the usability of OverridePolicy in such scenarios, Karmada introduced **FieldOverrider** a feature **FieldOverrider** that supports partial modification of structured field values ​​in JSON and YAML formats—adding, replacing, or deleting only the required fields. This simplifies the configuration process, improves efficiency, reduces the possibility of errors, and makes resource management more intuitive and convenient. **FieldOverrider** Users can then perform more granular processing of structured field values ​​to adapt to changing application environment requirements.

The following example uses a ConfigMap to show how users can achieve differentiated configurations across clusters by using **FieldOverrider** to partially override fields within the **.data** attribute.

```yaml
# example-configmap
apiVersion: v1
kind: ConfigMap
metadata:
  name: example-configmap
data:
  config.yaml: |
    app:
      database:
        port: 5432
        ip: 127.0.0.1
        name: example
        zone: zone1
```

```yaml

# example-overridepolicy
apiVersion: policy.karmada.io/v1alpha1
kind: OverridePolicy
metadata:
  name: example
spec:
  resourceSelectors:
    - apiVersion: v1
      kind: ConfigMap
      name: example-configmap
  overrideRules:
    - overriders:
        fieldOverrider:
          - fieldPath: /data/config.yaml
            yaml:
              - subPath: /app/database/port
                operator: replace # Supports add, remove, and replace operations
                value: "3306"
      targetCluster:
        clusterNames:
          - member1
```

After the above configuration, the ConfigMap in cluster member1 will be updated to:

```yaml
# example-configmap in member1
apiVersion: v1
kind: ConfigMap
metadata:
  name: myconfigmap
data:
  config.yaml: |
    app:
      database:
        port: 3306 # port updated
        ip: 127.0.0.1
        name: example
        zone: zone1
```
For more **FieldOverrider** usage examples, please refer to: [FieldOverrider User Guide](https://karmada.io/docs/userguide/scheduling/override-policy/#fieldoverrider)

# Acknowledging Our Contributors

Karmada version 1.12 includes 253 code commits from 33 contributors. Sincere thanks to all contributors:

| ^-^           | ^-^                 | ^-^                |
|---------------|---------------------|--------------------|
| @a7i          | @ahorine            | @anujagrawal699    |
| @B1f030       | @chaosi-zju         | @CharlesQQ         |
| @chaunceyjiang| @husnialhamdani     | @iawia002          |
| @ipsum-0320   | @jabellard          | @jklaw90           |
| @KhalilSantana| @LavredisG          | @liangyuanpeng     |
| @LivingCcj    | @MAVRICK-1          | @mohamedawnallah   |
| @mszacillo    | @RainbowMango       | @SataQiu           |
| @seanlaii     | @sophiefeifeifeiya  | @tiansuo114        |
| @wangxf1987   | @whitewindmills     | @wulemao           |
| @XiShanYongYe-Chang | @xovoxy        | @yanfeng1992       |
| @yelshall     | @zach593            | @zhzhuang-zju      |

![karmada v1.12 contributors](./img/contributors.png)
