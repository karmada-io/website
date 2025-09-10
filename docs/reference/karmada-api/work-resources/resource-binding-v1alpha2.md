---
api_metadata:
  apiVersion: "work.karmada.io/v1alpha2"
  import: "github.com/karmada-io/karmada/pkg/apis/work/v1alpha2"
  kind: "ResourceBinding"
content_type: "api_reference"
description: "ResourceBinding represents a binding of a kubernetes resource with a propagation policy."
title: "ResourceBinding v1alpha2"
weight: 2
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: work.karmada.io/v1alpha2`

`import "github.com/karmada-io/karmada/pkg/apis/work/v1alpha2"`

## ResourceBinding 

ResourceBinding represents a binding of a kubernetes resource with a propagation policy.

<hr/>

- **apiVersion**: work.karmada.io/v1alpha2

- **kind**: ResourceBinding

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([ResourceBindingSpec](../work-resources/resource-binding-v1alpha2#resourcebindingspec)), required

  Spec represents the desired behavior.

- **status** ([ResourceBindingStatus](../work-resources/resource-binding-v1alpha2#resourcebindingstatus))

  Status represents the most recently observed status of the ResourceBinding.

## ResourceBindingSpec 

ResourceBindingSpec represents the expectation of ResourceBinding.

<hr/>

- **resource** (ObjectReference), required

  Resource represents the Kubernetes resource to be propagated.

  <a name="ObjectReference"></a>

  *ObjectReference contains enough information to locate the referenced object inside current cluster.*

  - **resource.apiVersion** (string), required

    APIVersion represents the API version of the referent.

  - **resource.kind** (string), required

    Kind represents the Kind of the referent.

  - **resource.name** (string), required

    Name represents the name of the referent.

  - **resource.namespace** (string)

    Namespace represents the namespace for the referent. For non-namespace scoped resources(e.g. 'ClusterRole')，do not need specify Namespace, and for namespace scoped resources, Namespace is required. If Namespace is not specified, means the resource is non-namespace scoped.

  - **resource.resourceVersion** (string)

    ResourceVersion represents the internal version of the referenced object, that can be used by clients to determine when object has changed.

  - **resource.uid** (string)

    UID of the referent.

- **clusters** ([]TargetCluster)

  Clusters represents target member clusters where the resource to be deployed.

  <a name="TargetCluster"></a>

  *TargetCluster represents the identifier of a member cluster.*

  - **clusters.name** (string), required

    Name of target cluster.

  - **clusters.replicas** (int32)

    Replicas in target cluster

- **components** ([]Component)

  Components represents the requirements of multiple pod templates of the referencing resource. It is designed to support workloads that consist of multiple pod templates, such as distributed training jobs (e.g., PyTorch, TensorFlow) and big data workloads (e.g., FlinkDeployment), where each workload is composed of more than one pod template. It is also capable of representing single-component workloads, such as Deployment.
  
  Note: This field is intended to replace the legacy ReplicaRequirements and Replicas fields above. It is only populated when the MultiplePodTemplatesScheduling feature gate is enabled.

  <a name="Component"></a>

  *Component represents the requirements for a specific component.*

  - **components.name** (string), required

    Name of this component. It is required when the resource contains multiple components to ensure proper identification, and must also be unique within the same resource.

  - **components.replicas** (int32), required

    Replicas represents the replica number of the resource's component.

  - **components.replicaRequirements** (ComponentReplicaRequirements)

    ReplicaRequirements represents the requirements required by each replica for this component.

    <a name="ComponentReplicaRequirements"></a>

    *ComponentReplicaRequirements represents the requirements required by each replica.*

    - **components.replicaRequirements.nodeClaim** (NodeClaim)

      NodeClaim represents the node claim HardNodeAffinity, NodeSelector and Tolerations required by each replica.

      <a name="NodeClaim"></a>

      *NodeClaim represents the node claim HardNodeAffinity, NodeSelector and Tolerations required by each replica.*

      - **components.replicaRequirements.nodeClaim.hardNodeAffinity** (NodeSelector)

        A node selector represents the union of the results of one or more label queries over a set of nodes; that is, it represents the OR of the selectors represented by the node selector terms. Note that only PodSpec.Affinity.NodeAffinity.RequiredDuringSchedulingIgnoredDuringExecution is included here because it has a hard limit on pod scheduling.

        <a name="NodeSelector"></a>

        *A node selector represents the union of the results of one or more label queries over a set of nodes; that is, it represents the OR of the selectors represented by the node selector terms.*

        - **components.replicaRequirements.nodeClaim.hardNodeAffinity.nodeSelectorTerms** ([]NodeSelectorTerm), required

          *Atomic: will be replaced during a merge*
          
          Required. A list of node selector terms. The terms are ORed.

          <a name="NodeSelectorTerm"></a>

          *A null or empty node selector term matches no objects. The requirements of them are ANDed. The TopologySelectorTerm type implements a subset of the NodeSelectorTerm.*

          - **components.replicaRequirements.nodeClaim.hardNodeAffinity.nodeSelectorTerms.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

            *Atomic: will be replaced during a merge*
            
            A list of node selector requirements by node's labels.

          - **components.replicaRequirements.nodeClaim.hardNodeAffinity.nodeSelectorTerms.matchFields** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

            *Atomic: will be replaced during a merge*
            
            A list of node selector requirements by node's fields.

      - **components.replicaRequirements.nodeClaim.nodeSelector** (map[string]string)

        NodeSelector is a selector which must be true for the pod to fit on a node. Selector which must match a node's labels for the pod to be scheduled on that node.

      - **components.replicaRequirements.nodeClaim.tolerations** ([]Toleration)

        If specified, the pod's tolerations.

        <a name="Toleration"></a>

        *The pod this Toleration is attached to tolerates any taint that matches the triple &lt;key,value,effect&gt; using the matching operator &lt;operator&gt;.*

        - **components.replicaRequirements.nodeClaim.tolerations.effect** (string)

          Effect indicates the taint effect to match. Empty means match all taint effects. When specified, allowed values are NoSchedule, PreferNoSchedule and NoExecute.
          
          Possible enum values:
           - `"NoExecute"` Evict any already-running pods that do not tolerate the taint. Currently enforced by NodeController.
           - `"NoSchedule"` Do not allow new pods to schedule onto the node unless they tolerate the taint, but allow all pods submitted to Kubelet without going through the scheduler to start, and allow all already-running pods to continue running. Enforced by the scheduler.
           - `"PreferNoSchedule"` Like TaintEffectNoSchedule, but the scheduler tries not to schedule new pods onto the node, rather than prohibiting new pods from scheduling onto the node entirely. Enforced by the scheduler.

        - **components.replicaRequirements.nodeClaim.tolerations.key** (string)

          Key is the taint key that the toleration applies to. Empty means match all taint keys. If the key is empty, operator must be Exists; this combination means to match all values and all keys.

        - **components.replicaRequirements.nodeClaim.tolerations.operator** (string)

          Operator represents a key's relationship to the value. Valid operators are Exists and Equal. Defaults to Equal. Exists is equivalent to wildcard for value, so that a pod can tolerate all taints of a particular category.
          
          Possible enum values:
           - `"Equal"`
           - `"Exists"`

        - **components.replicaRequirements.nodeClaim.tolerations.tolerationSeconds** (int64)

          TolerationSeconds represents the period of time the toleration (which must be of effect NoExecute, otherwise this field is ignored) tolerates the taint. By default, it is not set, which means tolerate the taint forever (do not evict). Zero and negative values will be treated as 0 (evict immediately) by the system.

        - **components.replicaRequirements.nodeClaim.tolerations.value** (string)

          Value is the taint value the toleration matches to. If the operator is Exists, the value should be empty, otherwise just a regular string.

    - **components.replicaRequirements.priorityClassName** (string)

      PriorityClassName represents the resources priorityClassName

    - **components.replicaRequirements.resourceRequest** (map[string][Quantity](../common-definitions/quantity#quantity))

      ResourceRequest represents the resources required by each replica.

- **conflictResolution** (string)

  ConflictResolution declares how potential conflict should be handled when a resource that is being propagated already exists in the target cluster.
  
  It defaults to "Abort" which means stop propagating to avoid unexpected overwrites. The "Overwrite" might be useful when migrating legacy cluster resources to Karmada, in which case conflict is predictable and can be instructed to Karmada take over the resource by overwriting.

- **failover** (FailoverBehavior)

  Failover indicates how Karmada migrates applications in case of failures. It inherits directly from the associated PropagationPolicy(or ClusterPropagationPolicy).

  <a name="FailoverBehavior"></a>

  *FailoverBehavior indicates failover behaviors in case of an application or cluster failure.*

  - **failover.application** (ApplicationFailoverBehavior)

    Application indicates failover behaviors in case of application failure. If this value is nil, failover is disabled. If set, the PropagateDeps should be true so that the dependencies could be migrated along with the application.

    <a name="ApplicationFailoverBehavior"></a>

    *ApplicationFailoverBehavior indicates application failover behaviors.*

    - **failover.application.decisionConditions** (DecisionConditions), required

      DecisionConditions indicates the decision conditions of performing the failover process. Only when all conditions are met can the failover process be performed. Currently, DecisionConditions includes several conditions: - TolerationSeconds (optional)

      <a name="DecisionConditions"></a>

      *DecisionConditions represents the decision conditions of performing the failover process.*

      - **failover.application.decisionConditions.tolerationSeconds** (int32)

        TolerationSeconds represents the period of time Karmada should wait after reaching the desired state before performing failover process. If not specified, Karmada will immediately perform failover process. Defaults to 300s.

    - **failover.application.gracePeriodSeconds** (int32)

      GracePeriodSeconds is the maximum waiting duration in seconds before application on the migrated cluster should be deleted. Required only when PurgeMode is "Graciously" and defaults to 600s. If the application on the new cluster cannot reach a Healthy state, Karmada will delete the application after GracePeriodSeconds is reached. Value must be positive integer.

    - **failover.application.purgeMode** (string)

      PurgeMode represents how to deal with the legacy applications on the cluster from which the application is migrated. Valid options are "Directly", "Gracefully", "Never", "Immediately"(deprecated), and "Graciously"(deprecated). Defaults to "Gracefully".

    - **failover.application.statePreservation** (StatePreservation)

      StatePreservation defines the policy for preserving and restoring state data during failover events for stateful applications.
      
      When an application fails over from one cluster to another, this policy enables the extraction of critical data from the original resource configuration. Upon successful migration, the extracted data is then re-injected into the new resource, ensuring that the application can resume operation with its previous state intact. This is particularly useful for stateful applications where maintaining data consistency across failover events is crucial. If not specified, means no state data will be preserved.
      
      Note: This requires the StatefulFailoverInjection feature gate to be enabled, which is alpha.

      <a name="StatePreservation"></a>

      *StatePreservation defines the policy for preserving state during failover events.*

      - **failover.application.statePreservation.rules** ([]StatePreservationRule), required

        Rules contains a list of StatePreservationRule configurations. Each rule specifies a JSONPath expression targeting specific pieces of state data to be preserved during failover events. An AliasLabelName is associated with each rule, serving as a label key when the preserved data is passed to the new cluster.

        <a name="StatePreservationRule"></a>

        *StatePreservationRule defines a single rule for state preservation. It includes a JSONPath expression and an alias name that will be used as a label key when passing state information to the new cluster.*

        - **failover.application.statePreservation.rules.aliasLabelName** (string), required

          AliasLabelName is the name that will be used as a label key when the preserved data is passed to the new cluster. This facilitates the injection of the preserved state back into the application resources during recovery.

        - **failover.application.statePreservation.rules.jsonPath** (string), required

          JSONPath is the JSONPath template used to identify the state data to be preserved from the original resource configuration. The JSONPath syntax follows the Kubernetes specification: https://kubernetes.io/docs/reference/kubectl/jsonpath/
          
          Note: The JSONPath expression will start searching from the "status" field of the API resource object by default. For example, to extract the "availableReplicas" from a Deployment, the JSONPath expression should be "[.availableReplicas]", not "[.status.availableReplicas]".

  - **failover.cluster** (ClusterFailoverBehavior)

    Cluster indicates failover behaviors in case of cluster failure. If this value is nil, the failover behavior in case of cluster failure will be controlled by the controller's no-execute-taint-eviction-purge-mode parameter. If set, the failover behavior in case of cluster failure will be defined by this value.

    <a name="ClusterFailoverBehavior"></a>

    *ClusterFailoverBehavior indicates cluster failover behaviors.*

    - **failover.cluster.purgeMode** (string)

      PurgeMode represents how to deal with the legacy applications on the cluster from which the application is migrated. Valid options are "Directly", "Gracefully". Defaults to "Gracefully".

    - **failover.cluster.statePreservation** (StatePreservation)

      StatePreservation defines the policy for preserving and restoring state data during failover events for stateful applications.
      
      When an application fails over from one cluster to another, this policy enables the extraction of critical data from the original resource configuration. Upon successful migration, the extracted data is then re-injected into the new resource, ensuring that the application can resume operation with its previous state intact. This is particularly useful for stateful applications where maintaining data consistency across failover events is crucial. If not specified, means no state data will be preserved.
      
      Note: This requires the StatefulFailoverInjection feature gate to be enabled, which is alpha.

      <a name="StatePreservation"></a>

      *StatePreservation defines the policy for preserving state during failover events.*

      - **failover.cluster.statePreservation.rules** ([]StatePreservationRule), required

        Rules contains a list of StatePreservationRule configurations. Each rule specifies a JSONPath expression targeting specific pieces of state data to be preserved during failover events. An AliasLabelName is associated with each rule, serving as a label key when the preserved data is passed to the new cluster.

        <a name="StatePreservationRule"></a>

        *StatePreservationRule defines a single rule for state preservation. It includes a JSONPath expression and an alias name that will be used as a label key when passing state information to the new cluster.*

        - **failover.cluster.statePreservation.rules.aliasLabelName** (string), required

          AliasLabelName is the name that will be used as a label key when the preserved data is passed to the new cluster. This facilitates the injection of the preserved state back into the application resources during recovery.

        - **failover.cluster.statePreservation.rules.jsonPath** (string), required

          JSONPath is the JSONPath template used to identify the state data to be preserved from the original resource configuration. The JSONPath syntax follows the Kubernetes specification: https://kubernetes.io/docs/reference/kubectl/jsonpath/
          
          Note: The JSONPath expression will start searching from the "status" field of the API resource object by default. For example, to extract the "availableReplicas" from a Deployment, the JSONPath expression should be "[.availableReplicas]", not "[.status.availableReplicas]".

- **gracefulEvictionTasks** ([]GracefulEvictionTask)

  GracefulEvictionTasks holds the eviction tasks that are expected to perform the eviction in a graceful way. The intended workflow is: 1. Once the controller(such as 'taint-manager') decided to evict the resource that
     is referenced by current ResourceBinding or ClusterResourceBinding from a target
     cluster, it removes(or scale down the replicas) the target from Clusters(.spec.Clusters)
     and builds a graceful eviction task.
  2. The scheduler may perform a re-scheduler and probably select a substitute cluster
     to take over the evicting workload(resource).
  3. The graceful eviction controller takes care of the graceful eviction tasks and
     performs the final removal after the workload(resource) is available on the substitute
     cluster or exceed the grace termination period(defaults to 10 minutes).

  <a name="GracefulEvictionTask"></a>

  *GracefulEvictionTask represents a graceful eviction task.*

  - **gracefulEvictionTasks.fromCluster** (string), required

    FromCluster which cluster the eviction perform from.

  - **gracefulEvictionTasks.producer** (string), required

    Producer indicates the controller who triggered the eviction.

  - **gracefulEvictionTasks.reason** (string), required

    Reason contains a programmatic identifier indicating the reason for the eviction. Producers may define expected values and meanings for this field, and whether the values are considered a guaranteed API. The value should be a CamelCase string. This field may not be empty.

  - **gracefulEvictionTasks.clustersBeforeFailover** ([]string)

    ClustersBeforeFailover records the clusters where running the application before failover.

  - **gracefulEvictionTasks.creationTimestamp** (Time)

    CreationTimestamp is a timestamp representing the server time when this object was created. Clients should not set this value to avoid the time inconsistency issue. It is represented in RFC3339 form(like '2021-04-25T10:02:10Z') and is in UTC.
    
    Populated by the system. Read-only.

    <a name="Time"></a>

    *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

  - **gracefulEvictionTasks.gracePeriodSeconds** (int32)

    GracePeriodSeconds is the maximum waiting duration in seconds before the item should be deleted. If the application on the new cluster cannot reach a Healthy state, Karmada will delete the item after GracePeriodSeconds is reached. Value must be positive integer. It can not co-exist with SuppressDeletion.

  - **gracefulEvictionTasks.message** (string)

    Message is a human-readable message indicating details about the eviction. This may be an empty string.

  - **gracefulEvictionTasks.preservedLabelState** (map[string]string)

    PreservedLabelState represents the application state information collected from the original cluster, and it will be injected into the new cluster in form of application labels.

  - **gracefulEvictionTasks.purgeMode** (string)

    PurgeMode represents how to deal with the legacy applications on the cluster from which the application is migrated. Valid options are "Immediately", "Directly", "Graciously", "Gracefully" and "Never".

  - **gracefulEvictionTasks.replicas** (int32)

    Replicas indicates the number of replicas should be evicted. Should be ignored for resource type that doesn't have replica.

  - **gracefulEvictionTasks.suppressDeletion** (boolean)

    SuppressDeletion represents the grace period will be persistent until the tools or human intervention stops it. It can not co-exist with GracePeriodSeconds.

- **placement** (Placement)

  Placement represents the rule for select clusters to propagate resources.

  <a name="Placement"></a>

  *Placement represents the rule for select clusters.*

  - **placement.clusterAffinities** ([]ClusterAffinityTerm)

    ClusterAffinities represents scheduling restrictions to multiple cluster groups that indicated by ClusterAffinityTerm.
    
    The scheduler will evaluate these groups one by one in the order they appear in the spec, the group that does not satisfy scheduling restrictions will be ignored which means all clusters in this group will not be selected unless it also belongs to the next group(a cluster could belong to multiple groups).
    
    If none of the groups satisfy the scheduling restrictions, then scheduling fails, which means no cluster will be selected.
    
    Note:
      1. ClusterAffinities can not co-exist with ClusterAffinity.
      2. If both ClusterAffinity and ClusterAffinities are not set, any cluster
         can be scheduling candidates.
    
    Potential use case 1: The private clusters in the local data center could be the main group, and the managed clusters provided by cluster providers could be the secondary group. So that the Karmada scheduler would prefer to schedule workloads to the main group and the second group will only be considered in case of the main group does not satisfy restrictions(like, lack of resources).
    
    Potential use case 2: For the disaster recovery scenario, the clusters could be organized to primary and backup groups, the workloads would be scheduled to primary clusters firstly, and when primary cluster fails(like data center power off), Karmada scheduler could migrate workloads to the backup clusters.

    <a name="ClusterAffinityTerm"></a>

    *ClusterAffinityTerm selects a set of cluster.*

    - **placement.clusterAffinities.affinityName** (string), required

      AffinityName is the name of the cluster group.

    - **placement.clusterAffinities.clusterNames** ([]string)

      ClusterNames is the list of clusters to be selected.

    - **placement.clusterAffinities.exclude** ([]string)

      ExcludedClusters is the list of clusters to be ignored.

    - **placement.clusterAffinities.fieldSelector** (FieldSelector)

      FieldSelector is a filter to select member clusters by fields. The key(field) of the match expression should be 'provider', 'region', or 'zone', and the operator of the match expression should be 'In' or 'NotIn'. If non-nil and non-empty, only the clusters match this filter will be selected.

      <a name="FieldSelector"></a>

      *FieldSelector is a field filter.*

      - **placement.clusterAffinities.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

        A list of field selector requirements.

    - **placement.clusterAffinities.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

      LabelSelector is a filter to select member clusters by labels. If non-nil and non-empty, only the clusters match this filter will be selected.

  - **placement.clusterAffinity** (ClusterAffinity)

    ClusterAffinity represents scheduling restrictions to a certain set of clusters. Note:
      1. ClusterAffinity can not co-exist with ClusterAffinities.
      2. If both ClusterAffinity and ClusterAffinities are not set, any cluster
         can be scheduling candidates.

    <a name="ClusterAffinity"></a>

    *ClusterAffinity represents the filter to select clusters.*

    - **placement.clusterAffinity.clusterNames** ([]string)

      ClusterNames is the list of clusters to be selected.

    - **placement.clusterAffinity.exclude** ([]string)

      ExcludedClusters is the list of clusters to be ignored.

    - **placement.clusterAffinity.fieldSelector** (FieldSelector)

      FieldSelector is a filter to select member clusters by fields. The key(field) of the match expression should be 'provider', 'region', or 'zone', and the operator of the match expression should be 'In' or 'NotIn'. If non-nil and non-empty, only the clusters match this filter will be selected.

      <a name="FieldSelector"></a>

      *FieldSelector is a field filter.*

      - **placement.clusterAffinity.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

        A list of field selector requirements.

    - **placement.clusterAffinity.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

      LabelSelector is a filter to select member clusters by labels. If non-nil and non-empty, only the clusters match this filter will be selected.

  - **placement.clusterTolerations** ([]Toleration)

    ClusterTolerations represents the tolerations.

    <a name="Toleration"></a>

    *The pod this Toleration is attached to tolerates any taint that matches the triple &lt;key,value,effect&gt; using the matching operator &lt;operator&gt;.*

    - **placement.clusterTolerations.effect** (string)

      Effect indicates the taint effect to match. Empty means match all taint effects. When specified, allowed values are NoSchedule, PreferNoSchedule and NoExecute.
      
      Possible enum values:
       - `"NoExecute"` Evict any already-running pods that do not tolerate the taint. Currently enforced by NodeController.
       - `"NoSchedule"` Do not allow new pods to schedule onto the node unless they tolerate the taint, but allow all pods submitted to Kubelet without going through the scheduler to start, and allow all already-running pods to continue running. Enforced by the scheduler.
       - `"PreferNoSchedule"` Like TaintEffectNoSchedule, but the scheduler tries not to schedule new pods onto the node, rather than prohibiting new pods from scheduling onto the node entirely. Enforced by the scheduler.

    - **placement.clusterTolerations.key** (string)

      Key is the taint key that the toleration applies to. Empty means match all taint keys. If the key is empty, operator must be Exists; this combination means to match all values and all keys.

    - **placement.clusterTolerations.operator** (string)

      Operator represents a key's relationship to the value. Valid operators are Exists and Equal. Defaults to Equal. Exists is equivalent to wildcard for value, so that a pod can tolerate all taints of a particular category.
      
      Possible enum values:
       - `"Equal"`
       - `"Exists"`

    - **placement.clusterTolerations.tolerationSeconds** (int64)

      TolerationSeconds represents the period of time the toleration (which must be of effect NoExecute, otherwise this field is ignored) tolerates the taint. By default, it is not set, which means tolerate the taint forever (do not evict). Zero and negative values will be treated as 0 (evict immediately) by the system.

    - **placement.clusterTolerations.value** (string)

      Value is the taint value the toleration matches to. If the operator is Exists, the value should be empty, otherwise just a regular string.

  - **placement.replicaScheduling** (ReplicaSchedulingStrategy)

    ReplicaScheduling represents the scheduling policy on dealing with the number of replicas when propagating resources that have replicas in spec (e.g. deployments, statefulsets) to member clusters.

    <a name="ReplicaSchedulingStrategy"></a>

    *ReplicaSchedulingStrategy represents the assignment strategy of replicas.*

    - **placement.replicaScheduling.replicaDivisionPreference** (string)

      ReplicaDivisionPreference determines how the replicas is divided when ReplicaSchedulingType is "Divided". Valid options are Aggregated and Weighted. "Aggregated" divides replicas into clusters as few as possible, while respecting clusters' resource availabilities during the division. "Weighted" divides replicas by weight according to WeightPreference.

    - **placement.replicaScheduling.replicaSchedulingType** (string)

      ReplicaSchedulingType determines how the replicas is scheduled when karmada propagating a resource. Valid options are Duplicated and Divided. "Duplicated" duplicates the same replicas to each candidate member cluster from resource. "Divided" divides replicas into parts according to number of valid candidate member clusters, and exact replicas for each cluster are determined by ReplicaDivisionPreference.

    - **placement.replicaScheduling.weightPreference** (ClusterPreferences)

      WeightPreference describes weight for each cluster or for each group of cluster If ReplicaDivisionPreference is set to "Weighted", and WeightPreference is not set, scheduler will weight all clusters the same.

      <a name="ClusterPreferences"></a>

      *ClusterPreferences describes weight for each cluster or for each group of cluster.*

      - **placement.replicaScheduling.weightPreference.dynamicWeight** (string)

        DynamicWeight specifies the factor to generates dynamic weight list. If specified, StaticWeightList will be ignored.

      - **placement.replicaScheduling.weightPreference.staticWeightList** ([]StaticClusterWeight)

        StaticWeightList defines the static cluster weight.

        <a name="StaticClusterWeight"></a>

        *StaticClusterWeight defines the static cluster weight.*

        - **placement.replicaScheduling.weightPreference.staticWeightList.targetCluster** (ClusterAffinity), required

          TargetCluster describes the filter to select clusters.

          <a name="ClusterAffinity"></a>

          *ClusterAffinity represents the filter to select clusters.*

          - **placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.clusterNames** ([]string)

            ClusterNames is the list of clusters to be selected.

          - **placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.exclude** ([]string)

            ExcludedClusters is the list of clusters to be ignored.

          - **placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.fieldSelector** (FieldSelector)

            FieldSelector is a filter to select member clusters by fields. The key(field) of the match expression should be 'provider', 'region', or 'zone', and the operator of the match expression should be 'In' or 'NotIn'. If non-nil and non-empty, only the clusters match this filter will be selected.

            <a name="FieldSelector"></a>

            *FieldSelector is a field filter.*

            - **placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

              A list of field selector requirements.

          - **placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

            LabelSelector is a filter to select member clusters by labels. If non-nil and non-empty, only the clusters match this filter will be selected.

        - **placement.replicaScheduling.weightPreference.staticWeightList.weight** (int64), required

          Weight expressing the preference to the cluster(s) specified by 'TargetCluster'.

  - **placement.spreadConstraints** ([]SpreadConstraint)

    SpreadConstraints represents a list of the scheduling constraints.

    <a name="SpreadConstraint"></a>

    *SpreadConstraint represents the spread constraints on resources.*

    - **placement.spreadConstraints.maxGroups** (int32)

      MaxGroups restricts the maximum number of cluster groups to be selected.

    - **placement.spreadConstraints.minGroups** (int32)

      MinGroups restricts the minimum number of cluster groups to be selected. Defaults to 1.

    - **placement.spreadConstraints.spreadByField** (string)

      SpreadByField represents the fields on Karmada cluster API used for dynamically grouping member clusters into different groups. Resources will be spread among different cluster groups. Available fields for spreading are: cluster, region, zone, and provider. SpreadByField should not co-exist with SpreadByLabel. If both SpreadByField and SpreadByLabel are empty, SpreadByField will be set to "cluster" by system.

    - **placement.spreadConstraints.spreadByLabel** (string)

      SpreadByLabel represents the label key used for grouping member clusters into different groups. Resources will be spread among different cluster groups. SpreadByLabel should not co-exist with SpreadByField.

- **preserveResourcesOnDeletion** (boolean)

  PreserveResourcesOnDeletion controls whether resources should be preserved on the member clusters when the binding object is deleted. If set to true, resources will be preserved on the member clusters. Default is false, which means resources will be deleted along with the binding object. This setting applies to all Work objects created under this binding object.

- **propagateDeps** (boolean)

  PropagateDeps tells if relevant resources should be propagated automatically. It is inherited from PropagationPolicy or ClusterPropagationPolicy. default false.

- **replicaRequirements** (ReplicaRequirements)

  ReplicaRequirements represents the requirements required by each replica.

  <a name="ReplicaRequirements"></a>

  *ReplicaRequirements represents the requirements required by each replica.*

  - **replicaRequirements.namespace** (string)

    Namespace represents the resources namespaces

  - **replicaRequirements.nodeClaim** (NodeClaim)

    NodeClaim represents the node claim HardNodeAffinity, NodeSelector and Tolerations required by each replica.

    <a name="NodeClaim"></a>

    *NodeClaim represents the node claim HardNodeAffinity, NodeSelector and Tolerations required by each replica.*

    - **replicaRequirements.nodeClaim.hardNodeAffinity** (NodeSelector)

      A node selector represents the union of the results of one or more label queries over a set of nodes; that is, it represents the OR of the selectors represented by the node selector terms. Note that only PodSpec.Affinity.NodeAffinity.RequiredDuringSchedulingIgnoredDuringExecution is included here because it has a hard limit on pod scheduling.

      <a name="NodeSelector"></a>

      *A node selector represents the union of the results of one or more label queries over a set of nodes; that is, it represents the OR of the selectors represented by the node selector terms.*

      - **replicaRequirements.nodeClaim.hardNodeAffinity.nodeSelectorTerms** ([]NodeSelectorTerm), required

        *Atomic: will be replaced during a merge*
        
        Required. A list of node selector terms. The terms are ORed.

        <a name="NodeSelectorTerm"></a>

        *A null or empty node selector term matches no objects. The requirements of them are ANDed. The TopologySelectorTerm type implements a subset of the NodeSelectorTerm.*

        - **replicaRequirements.nodeClaim.hardNodeAffinity.nodeSelectorTerms.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

          *Atomic: will be replaced during a merge*
          
          A list of node selector requirements by node's labels.

        - **replicaRequirements.nodeClaim.hardNodeAffinity.nodeSelectorTerms.matchFields** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

          *Atomic: will be replaced during a merge*
          
          A list of node selector requirements by node's fields.

    - **replicaRequirements.nodeClaim.nodeSelector** (map[string]string)

      NodeSelector is a selector which must be true for the pod to fit on a node. Selector which must match a node's labels for the pod to be scheduled on that node.

    - **replicaRequirements.nodeClaim.tolerations** ([]Toleration)

      If specified, the pod's tolerations.

      <a name="Toleration"></a>

      *The pod this Toleration is attached to tolerates any taint that matches the triple &lt;key,value,effect&gt; using the matching operator &lt;operator&gt;.*

      - **replicaRequirements.nodeClaim.tolerations.effect** (string)

        Effect indicates the taint effect to match. Empty means match all taint effects. When specified, allowed values are NoSchedule, PreferNoSchedule and NoExecute.
        
        Possible enum values:
         - `"NoExecute"` Evict any already-running pods that do not tolerate the taint. Currently enforced by NodeController.
         - `"NoSchedule"` Do not allow new pods to schedule onto the node unless they tolerate the taint, but allow all pods submitted to Kubelet without going through the scheduler to start, and allow all already-running pods to continue running. Enforced by the scheduler.
         - `"PreferNoSchedule"` Like TaintEffectNoSchedule, but the scheduler tries not to schedule new pods onto the node, rather than prohibiting new pods from scheduling onto the node entirely. Enforced by the scheduler.

      - **replicaRequirements.nodeClaim.tolerations.key** (string)

        Key is the taint key that the toleration applies to. Empty means match all taint keys. If the key is empty, operator must be Exists; this combination means to match all values and all keys.

      - **replicaRequirements.nodeClaim.tolerations.operator** (string)

        Operator represents a key's relationship to the value. Valid operators are Exists and Equal. Defaults to Equal. Exists is equivalent to wildcard for value, so that a pod can tolerate all taints of a particular category.
        
        Possible enum values:
         - `"Equal"`
         - `"Exists"`

      - **replicaRequirements.nodeClaim.tolerations.tolerationSeconds** (int64)

        TolerationSeconds represents the period of time the toleration (which must be of effect NoExecute, otherwise this field is ignored) tolerates the taint. By default, it is not set, which means tolerate the taint forever (do not evict). Zero and negative values will be treated as 0 (evict immediately) by the system.

      - **replicaRequirements.nodeClaim.tolerations.value** (string)

        Value is the taint value the toleration matches to. If the operator is Exists, the value should be empty, otherwise just a regular string.

  - **replicaRequirements.priorityClassName** (string)

    PriorityClassName represents the resources priorityClassName

  - **replicaRequirements.resourceRequest** (map[string][Quantity](../common-definitions/quantity#quantity))

    ResourceRequest represents the resources required by each replica.

- **replicas** (int32)

  Replicas represents the replica number of the referencing resource.

- **requiredBy** ([]BindingSnapshot)

  RequiredBy represents the list of Bindings that depend on the referencing resource.

  <a name="BindingSnapshot"></a>

  *BindingSnapshot is a snapshot of a ResourceBinding or ClusterResourceBinding.*

  - **requiredBy.name** (string), required

    Name represents the name of the Binding.

  - **requiredBy.clusters** ([]TargetCluster)

    Clusters represents the scheduled result.

    <a name="TargetCluster"></a>

    *TargetCluster represents the identifier of a member cluster.*

    - **requiredBy.clusters.name** (string), required

      Name of target cluster.

    - **requiredBy.clusters.replicas** (int32)

      Replicas in target cluster

  - **requiredBy.namespace** (string)

    Namespace represents the namespace of the Binding. It is required for ResourceBinding. If Namespace is not specified, means the referencing is ClusterResourceBinding.

- **rescheduleTriggeredAt** (Time)

  RescheduleTriggeredAt is a timestamp representing when the referenced resource is triggered rescheduling. When this field is updated, it means a rescheduling is manually triggered by user, and the expected behavior of this action is to do a complete recalculation without referring to last scheduling results. It works with the status.lastScheduledTime field, and only when this timestamp is later than timestamp in status.lastScheduledTime will the rescheduling actually execute, otherwise, ignored.
  
  It is represented in RFC3339 form (like '2006-01-02T15:04:05Z') and is in UTC.

  <a name="Time"></a>

  *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

- **schedulePriority** (SchedulePriority)

  SchedulePriority represents the scheduling priority assigned to workloads.

  <a name="SchedulePriority"></a>

  *SchedulePriority represents the scheduling priority assigned to workloads.*

  - **schedulePriority.priority** (int32)

    Priority specifies the scheduling priority for the binding. Higher values indicate a higher priority. If not explicitly set, the default value is 0.

- **schedulerName** (string)

  SchedulerName represents which scheduler to proceed the scheduling. It inherits directly from the associated PropagationPolicy(or ClusterPropagationPolicy).

- **suspension** (Suspension)

  Suspension declares the policy for suspending different aspects of propagation. nil means no suspension. no default values.

  <a name="Suspension"></a>

  *Suspension defines the policy for suspending dispatching and scheduling.*

  - **suspension.dispatching** (boolean)

    Dispatching controls whether dispatching should be suspended. nil means not suspend, no default value, only accepts 'true'. Note: true means stop propagating to all clusters. Can not co-exist with DispatchingOnClusters which is used to suspend particular clusters.

  - **suspension.dispatchingOnClusters** (SuspendClusters)

    DispatchingOnClusters declares a list of clusters to which the dispatching should be suspended. Note: Can not co-exist with Dispatching which is used to suspend all.

    <a name="SuspendClusters"></a>

    *SuspendClusters represents a group of clusters that should be suspended from propagating. Note: No plan to introduce the label selector or field selector to select clusters yet, as it would make the system unpredictable.*

    - **suspension.dispatchingOnClusters.clusterNames** ([]string)

      ClusterNames is the list of clusters to be selected.

  - **suspension.scheduling** (boolean)

    Scheduling controls whether scheduling should be suspended, the scheduler will pause scheduling and not process resource binding when the value is true and resume scheduling when it's false or nil. This is designed for third-party systems to temporarily pause the scheduling of applications, which enabling manage resource allocation, prioritize critical workloads, etc. It is expected that third-party systems use an admission webhook to suspend scheduling at the time of ResourceBinding creation. Once a ResourceBinding has been scheduled, it cannot be paused afterward, as it may lead to ineffective suspension.

## ResourceBindingStatus 

ResourceBindingStatus represents the overall status of the strategy as well as the referenced resources.

<hr/>

- **aggregatedStatus** ([]AggregatedStatusItem)

  AggregatedStatus represents status list of the resource running in each member cluster.

  <a name="AggregatedStatusItem"></a>

  *AggregatedStatusItem represents status of the resource running in a member cluster.*

  - **aggregatedStatus.clusterName** (string), required

    ClusterName represents the member cluster name which the resource deployed on.

  - **aggregatedStatus.applied** (boolean)

    Applied represents if the resource referencing by ResourceBinding or ClusterResourceBinding is successfully applied on the cluster.

  - **aggregatedStatus.appliedMessage** (string)

    AppliedMessage is a human readable message indicating details about the applied status. This is usually holds the error message in case of apply failed.

  - **aggregatedStatus.health** (string)

    Health represents the healthy state of the current resource. There maybe different rules for different resources to achieve health status.

  - **aggregatedStatus.status** (RawExtension)

    Status reflects running status of current manifest.

    <a name="RawExtension"></a>

    *RawExtension is used to hold extensions in external versions.
    
    To use this, make a field which has RawExtension as its type in your external, versioned struct, and Object in your internal struct. You also need to register your various plugin types.
    
    // Internal package:
    
    	type MyAPIObject struct [
    		runtime.TypeMeta `json:",inline"`
    		MyPlugin runtime.Object `json:"myPlugin"`
    	]
    
    	type PluginA struct [
    		AOption string `json:"aOption"`
    	]
    
    // External package:
    
    	type MyAPIObject struct [
    		runtime.TypeMeta `json:",inline"`
    		MyPlugin runtime.RawExtension `json:"myPlugin"`
    	]
    
    	type PluginA struct [
    		AOption string `json:"aOption"`
    	]
    
    // On the wire, the JSON will look something like this:
    
    	[
    		"kind":"MyAPIObject",
    		"apiVersion":"v1",
    		"myPlugin": [
    			"kind":"PluginA",
    			"aOption":"foo",
    		],
    	]
    
    So what happens? Decode first uses json or yaml to unmarshal the serialized data into your external MyAPIObject. That causes the raw JSON to be stored, but not unpacked. The next step is to copy (using pkg/conversion) into the internal struct. The runtime package's DefaultScheme has conversion functions installed which will unpack the JSON stored in RawExtension, turning it into the correct object type, and storing it in the Object. (TODO: In the case where the object is of an unknown type, a runtime.Unknown object will be created and stored.)*

- **conditions** ([]Condition)

  Conditions contain the different condition statuses.

  <a name="Condition"></a>

  *Condition contains details for one aspect of the current state of this API Resource.*

  - **conditions.lastTransitionTime** (Time), required

    lastTransitionTime is the last time the condition transitioned from one status to another. This should be when the underlying condition changed.  If that is not known, then using the time when the API field changed is acceptable.

    <a name="Time"></a>

    *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

  - **conditions.message** (string), required

    message is a human readable message indicating details about the transition. This may be an empty string.

  - **conditions.reason** (string), required

    reason contains a programmatic identifier indicating the reason for the condition's last transition. Producers of specific condition types may define expected values and meanings for this field, and whether the values are considered a guaranteed API. The value should be a CamelCase string. This field may not be empty.

  - **conditions.status** (string), required

    status of the condition, one of True, False, Unknown.

  - **conditions.type** (string), required

    type of condition in CamelCase or in foo.example.com/CamelCase.

  - **conditions.observedGeneration** (int64)

    observedGeneration represents the .metadata.generation that the condition was set based upon. For instance, if .metadata.generation is currently 12, but the .status.conditions[x].observedGeneration is 9, the condition is out of date with respect to the current state of the instance.

- **lastScheduledTime** (Time)

  LastScheduledTime representing the latest timestamp when scheduler successfully finished a scheduling. It is represented in RFC3339 form (like '2006-01-02T15:04:05Z') and is in UTC.

  <a name="Time"></a>

  *Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.*

- **schedulerObservedGeneration** (int64)

  SchedulerObservedGeneration is the generation(.metadata.generation) observed by the scheduler. If SchedulerObservedGeneration is less than the generation in metadata means the scheduler hasn't confirmed the scheduling result or hasn't done the schedule yet.

- **schedulerObservingAffinityName** (string)

  SchedulerObservedAffinityName is the name of affinity term that is the basis of current scheduling.

## ResourceBindingList 

ResourceBindingList contains a list of ResourceBinding.

<hr/>

- **apiVersion**: work.karmada.io/v1alpha2

- **kind**: ResourceBindingList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)), required

  Items is the list of ResourceBinding.

## Operations 

<hr/>

### `get` read the specified ResourceBinding

#### HTTP Request

GET /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceBinding

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): OK

### `get` read status of the specified ResourceBinding

#### HTTP Request

GET /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceBinding

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): OK

### `list` list or watch objects of kind ResourceBinding

#### HTTP Request

GET /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **allowWatchBookmarks** (*in query*): boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue** (*in query*): string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector** (*in query*): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector** (*in query*): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (*in query*): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion** (*in query*): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (*in query*): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (*in query*): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (*in query*): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch** (*in query*): boolean

  [watch](../common-parameter/common-parameters#watch)

#### Response

200 ([ResourceBindingList](../work-resources/resource-binding-v1alpha2#resourcebindinglist)): OK

### `list` list or watch objects of kind ResourceBinding

#### HTTP Request

GET /apis/work.karmada.io/v1alpha2/resourcebindings

#### Parameters

- **allowWatchBookmarks** (*in query*): boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue** (*in query*): string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector** (*in query*): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector** (*in query*): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (*in query*): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion** (*in query*): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (*in query*): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (*in query*): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (*in query*): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch** (*in query*): boolean

  [watch](../common-parameter/common-parameters#watch)

#### Response

200 ([ResourceBindingList](../work-resources/resource-binding-v1alpha2#resourcebindinglist)): OK

### `create` create a ResourceBinding

#### HTTP Request

POST /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): OK

201 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): Created

202 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): Accepted

### `update` replace the specified ResourceBinding

#### HTTP Request

PUT /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceBinding

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): OK

201 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): Created

### `update` replace status of the specified ResourceBinding

#### HTTP Request

PUT /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceBinding

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): OK

201 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): Created

### `patch` partially update the specified ResourceBinding

#### HTTP Request

PATCH /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceBinding

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Patch](../common-definitions/patch#patch), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force** (*in query*): boolean

  [force](../common-parameter/common-parameters#force)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): OK

201 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): Created

### `patch` partially update status of the specified ResourceBinding

#### HTTP Request

PATCH /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceBinding

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [Patch](../common-definitions/patch#patch), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force** (*in query*): boolean

  [force](../common-parameter/common-parameters#force)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): OK

201 ([ResourceBinding](../work-resources/resource-binding-v1alpha2#resourcebinding)): Created

### `delete` delete a ResourceBinding

#### HTTP Request

DELETE /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceBinding

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **gracePeriodSeconds** (*in query*): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **ignoreStoreReadErrorWithClusterBreakingPotential** (*in query*): boolean

  [ignoreStoreReadErrorWithClusterBreakingPotential](../common-parameter/common-parameters#ignorestorereaderrorwithclusterbreakingpotential)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (*in query*): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

#### Response

200 ([Status](../common-definitions/status#status)): OK

202 ([Status](../common-definitions/status#status)): Accepted

### `deletecollection` delete collection of ResourceBinding

#### HTTP Request

DELETE /apis/work.karmada.io/v1alpha2/namespaces/{namespace}/resourcebindings

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **continue** (*in query*): string

  [continue](../common-parameter/common-parameters#continue)

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldSelector** (*in query*): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **gracePeriodSeconds** (*in query*): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **ignoreStoreReadErrorWithClusterBreakingPotential** (*in query*): boolean

  [ignoreStoreReadErrorWithClusterBreakingPotential](../common-parameter/common-parameters#ignorestorereaderrorwithclusterbreakingpotential)

- **labelSelector** (*in query*): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (*in query*): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (*in query*): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

- **resourceVersion** (*in query*): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (*in query*): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (*in query*): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (*in query*): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

#### Response

200 ([Status](../common-definitions/status#status)): OK

