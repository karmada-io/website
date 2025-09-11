---
api_metadata:
  apiVersion: "policy.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"
  kind: "PropagationPolicy"
content_type: "api_reference"
description: "PropagationPolicy represents the policy that propagates a group of resources to one or more clusters."
title: "PropagationPolicy v1alpha1"
weight: 4
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: policy.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"`

## PropagationPolicy 

PropagationPolicy represents the policy that propagates a group of resources to one or more clusters.

<hr/>

- **apiVersion**: policy.karmada.io/v1alpha1

- **kind**: PropagationPolicy

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** (PropagationSpec), required

  Spec represents the desired behavior of PropagationPolicy.

  <a name="PropagationSpec"></a>

  *PropagationSpec represents the desired behavior of PropagationPolicy.*

  - **spec.resourceSelectors** ([]ResourceSelector), required

    ResourceSelectors used to select resources. Nil or empty selector is not allowed and doesn't mean match all kinds of resources for security concerns that sensitive resources(like Secret) might be accidentally propagated.

    <a name="ResourceSelector"></a>

    *ResourceSelector the resources will be selected.*

    - **spec.resourceSelectors.apiVersion** (string), required

      APIVersion represents the API version of the target resources.

    - **spec.resourceSelectors.kind** (string), required

      Kind represents the Kind of the target resources.

    - **spec.resourceSelectors.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

      A label query over a set of resources. If name is not empty, labelSelector will be ignored.

    - **spec.resourceSelectors.name** (string)

      Name of the target resource. Default is empty, which means selecting all resources.

    - **spec.resourceSelectors.namespace** (string)

      Namespace of the target resource. Default is empty, which means inherit from the parent object scope.

  - **spec.activationPreference** (string)

    ActivationPreference indicates how the referencing resource template will be propagated, in case of policy changes.
    
    If empty, the resource template will respond to policy changes immediately, in other words, any policy changes will drive the resource template to be propagated immediately as per the current propagation rules.
    
    If the value is 'Lazy' means the policy changes will not take effect for now but defer to the resource template changes, in other words, the resource template will not be propagated as per the current propagation rules until there is an update on it. This is an experimental feature that might help in a scenario where a policy manages huge amount of resource templates, changes to a policy typically affect numerous applications simultaneously. A minor misconfiguration could lead to widespread failures. With this feature, the change can be gradually rolled out through iterative modifications of resource templates.

  - **spec.association** (boolean)

    Association tells if relevant resources should be selected automatically. e.g. a ConfigMap referred by a Deployment. default false. Deprecated: in favor of PropagateDeps.

  - **spec.conflictResolution** (string)

    ConflictResolution declares how potential conflict should be handled when a resource that is being propagated already exists in the target cluster.
    
    It defaults to "Abort" which means stop propagating to avoid unexpected overwrites. The "Overwrite" might be useful when migrating legacy cluster resources to Karmada, in which case conflict is predictable and can be instructed to Karmada take over the resource by overwriting.

  - **spec.dependentOverrides** ([]string)

    DependentOverrides represents the list of overrides(OverridePolicy) which must present before the current PropagationPolicy takes effect.
    
    It used to explicitly specify overrides which current PropagationPolicy rely on. A typical scenario is the users create OverridePolicy(ies) and resources at the same time, they want to ensure the new-created policies would be adopted.
    
    Note: For the overrides, OverridePolicy(ies) in current namespace and ClusterOverridePolicy(ies), which not present in this list will still be applied if they matches the resources.

  - **spec.failover** (FailoverBehavior)

    Failover indicates how Karmada migrates applications in case of failures. If this value is nil, failover is disabled.

    <a name="FailoverBehavior"></a>

    *FailoverBehavior indicates failover behaviors in case of an application or cluster failure.*

    - **spec.failover.application** (ApplicationFailoverBehavior)

      Application indicates failover behaviors in case of application failure. If this value is nil, failover is disabled. If set, the PropagateDeps should be true so that the dependencies could be migrated along with the application.

      <a name="ApplicationFailoverBehavior"></a>

      *ApplicationFailoverBehavior indicates application failover behaviors.*

      - **spec.failover.application.decisionConditions** (DecisionConditions), required

        DecisionConditions indicates the decision conditions of performing the failover process. Only when all conditions are met can the failover process be performed. Currently, DecisionConditions includes several conditions: - TolerationSeconds (optional)

        <a name="DecisionConditions"></a>

        *DecisionConditions represents the decision conditions of performing the failover process.*

        - **spec.failover.application.decisionConditions.tolerationSeconds** (int32)

          TolerationSeconds represents the period of time Karmada should wait after reaching the desired state before performing failover process. If not specified, Karmada will immediately perform failover process. Defaults to 300s.

      - **spec.failover.application.gracePeriodSeconds** (int32)

        GracePeriodSeconds is the maximum waiting duration in seconds before application on the migrated cluster should be deleted. Required only when PurgeMode is "Graciously" and defaults to 600s. If the application on the new cluster cannot reach a Healthy state, Karmada will delete the application after GracePeriodSeconds is reached. Value must be positive integer.

      - **spec.failover.application.purgeMode** (string)

        PurgeMode represents how to deal with the legacy applications on the cluster from which the application is migrated. Valid options are "Immediately", "Graciously" and "Never". Defaults to "Graciously".

      - **spec.failover.application.statePreservation** (StatePreservation)

        StatePreservation defines the policy for preserving and restoring state data during failover events for stateful applications.
        
        When an application fails over from one cluster to another, this policy enables the extraction of critical data from the original resource configuration. Upon successful migration, the extracted data is then re-injected into the new resource, ensuring that the application can resume operation with its previous state intact. This is particularly useful for stateful applications where maintaining data consistency across failover events is crucial. If not specified, means no state data will be preserved.
        
        Note: This requires the StatefulFailoverInjection feature gate to be enabled, which is alpha.

        <a name="StatePreservation"></a>

        *StatePreservation defines the policy for preserving state during failover events.*

        - **spec.failover.application.statePreservation.rules** ([]StatePreservationRule), required

          Rules contains a list of StatePreservationRule configurations. Each rule specifies a JSONPath expression targeting specific pieces of state data to be preserved during failover events. An AliasLabelName is associated with each rule, serving as a label key when the preserved data is passed to the new cluster.

          <a name="StatePreservationRule"></a>

          *StatePreservationRule defines a single rule for state preservation. It includes a JSONPath expression and an alias name that will be used as a label key when passing state information to the new cluster.*

          - **spec.failover.application.statePreservation.rules.aliasLabelName** (string), required

            AliasLabelName is the name that will be used as a label key when the preserved data is passed to the new cluster. This facilitates the injection of the preserved state back into the application resources during recovery.

          - **spec.failover.application.statePreservation.rules.jsonPath** (string), required

            JSONPath is the JSONPath template used to identify the state data to be preserved from the original resource configuration. The JSONPath syntax follows the Kubernetes specification: https://kubernetes.io/docs/reference/kubectl/jsonpath/
            
            Note: The JSONPath expression will start searching from the "status" field of the API resource object by default. For example, to extract the "availableReplicas" from a Deployment, the JSONPath expression should be "[.availableReplicas]", not "[.status.availableReplicas]".

  - **spec.placement** (Placement)

    Placement represents the rule for select clusters to propagate resources.

    <a name="Placement"></a>

    *Placement represents the rule for select clusters.*

    - **spec.placement.clusterAffinities** ([]ClusterAffinityTerm)

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

      - **spec.placement.clusterAffinities.affinityName** (string), required

        AffinityName is the name of the cluster group.

      - **spec.placement.clusterAffinities.clusterNames** ([]string)

        ClusterNames is the list of clusters to be selected.

      - **spec.placement.clusterAffinities.exclude** ([]string)

        ExcludedClusters is the list of clusters to be ignored.

      - **spec.placement.clusterAffinities.fieldSelector** (FieldSelector)

        FieldSelector is a filter to select member clusters by fields. The key(field) of the match expression should be 'provider', 'region', or 'zone', and the operator of the match expression should be 'In' or 'NotIn'. If non-nil and non-empty, only the clusters match this filter will be selected.

        <a name="FieldSelector"></a>

        *FieldSelector is a field filter.*

        - **spec.placement.clusterAffinities.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

          A list of field selector requirements.

      - **spec.placement.clusterAffinities.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

        LabelSelector is a filter to select member clusters by labels. If non-nil and non-empty, only the clusters match this filter will be selected.

    - **spec.placement.clusterAffinity** (ClusterAffinity)

      ClusterAffinity represents scheduling restrictions to a certain set of clusters. Note:
        1. ClusterAffinity can not co-exist with ClusterAffinities.
        2. If both ClusterAffinity and ClusterAffinities are not set, any cluster
           can be scheduling candidates.

      <a name="ClusterAffinity"></a>

      *ClusterAffinity represents the filter to select clusters.*

      - **spec.placement.clusterAffinity.clusterNames** ([]string)

        ClusterNames is the list of clusters to be selected.

      - **spec.placement.clusterAffinity.exclude** ([]string)

        ExcludedClusters is the list of clusters to be ignored.

      - **spec.placement.clusterAffinity.fieldSelector** (FieldSelector)

        FieldSelector is a filter to select member clusters by fields. The key(field) of the match expression should be 'provider', 'region', or 'zone', and the operator of the match expression should be 'In' or 'NotIn'. If non-nil and non-empty, only the clusters match this filter will be selected.

        <a name="FieldSelector"></a>

        *FieldSelector is a field filter.*

        - **spec.placement.clusterAffinity.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

          A list of field selector requirements.

      - **spec.placement.clusterAffinity.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

        LabelSelector is a filter to select member clusters by labels. If non-nil and non-empty, only the clusters match this filter will be selected.

    - **spec.placement.clusterTolerations** ([]Toleration)

      ClusterTolerations represents the tolerations.

      <a name="Toleration"></a>

      *The pod this Toleration is attached to tolerates any taint that matches the triple &lt;key,value,effect&gt; using the matching operator &lt;operator&gt;.*

      - **spec.placement.clusterTolerations.effect** (string)

        Effect indicates the taint effect to match. Empty means match all taint effects. When specified, allowed values are NoSchedule, PreferNoSchedule and NoExecute.
        
        Possible enum values:
         - `"NoExecute"` Evict any already-running pods that do not tolerate the taint. Currently enforced by NodeController.
         - `"NoSchedule"` Do not allow new pods to schedule onto the node unless they tolerate the taint, but allow all pods submitted to Kubelet without going through the scheduler to start, and allow all already-running pods to continue running. Enforced by the scheduler.
         - `"PreferNoSchedule"` Like TaintEffectNoSchedule, but the scheduler tries not to schedule new pods onto the node, rather than prohibiting new pods from scheduling onto the node entirely. Enforced by the scheduler.

      - **spec.placement.clusterTolerations.key** (string)

        Key is the taint key that the toleration applies to. Empty means match all taint keys. If the key is empty, operator must be Exists; this combination means to match all values and all keys.

      - **spec.placement.clusterTolerations.operator** (string)

        Operator represents a key's relationship to the value. Valid operators are Exists and Equal. Defaults to Equal. Exists is equivalent to wildcard for value, so that a pod can tolerate all taints of a particular category.
        
        Possible enum values:
         - `"Equal"`
         - `"Exists"`

      - **spec.placement.clusterTolerations.tolerationSeconds** (int64)

        TolerationSeconds represents the period of time the toleration (which must be of effect NoExecute, otherwise this field is ignored) tolerates the taint. By default, it is not set, which means tolerate the taint forever (do not evict). Zero and negative values will be treated as 0 (evict immediately) by the system.

      - **spec.placement.clusterTolerations.value** (string)

        Value is the taint value the toleration matches to. If the operator is Exists, the value should be empty, otherwise just a regular string.

    - **spec.placement.replicaScheduling** (ReplicaSchedulingStrategy)

      ReplicaScheduling represents the scheduling policy on dealing with the number of replicas when propagating resources that have replicas in spec (e.g. deployments, statefulsets) to member clusters.

      <a name="ReplicaSchedulingStrategy"></a>

      *ReplicaSchedulingStrategy represents the assignment strategy of replicas.*

      - **spec.placement.replicaScheduling.replicaDivisionPreference** (string)

        ReplicaDivisionPreference determines how the replicas is divided when ReplicaSchedulingType is "Divided". Valid options are Aggregated and Weighted. "Aggregated" divides replicas into clusters as few as possible, while respecting clusters' resource availabilities during the division. "Weighted" divides replicas by weight according to WeightPreference.

      - **spec.placement.replicaScheduling.replicaSchedulingType** (string)

        ReplicaSchedulingType determines how the replicas is scheduled when karmada propagating a resource. Valid options are Duplicated and Divided. "Duplicated" duplicates the same replicas to each candidate member cluster from resource. "Divided" divides replicas into parts according to number of valid candidate member clusters, and exact replicas for each cluster are determined by ReplicaDivisionPreference.

      - **spec.placement.replicaScheduling.weightPreference** (ClusterPreferences)

        WeightPreference describes weight for each cluster or for each group of cluster If ReplicaDivisionPreference is set to "Weighted", and WeightPreference is not set, scheduler will weight all clusters the same.

        <a name="ClusterPreferences"></a>

        *ClusterPreferences describes weight for each cluster or for each group of cluster.*

        - **spec.placement.replicaScheduling.weightPreference.dynamicWeight** (string)

          DynamicWeight specifies the factor to generates dynamic weight list. If specified, StaticWeightList will be ignored.

        - **spec.placement.replicaScheduling.weightPreference.staticWeightList** ([]StaticClusterWeight)

          StaticWeightList defines the static cluster weight.

          <a name="StaticClusterWeight"></a>

          *StaticClusterWeight defines the static cluster weight.*

          - **spec.placement.replicaScheduling.weightPreference.staticWeightList.targetCluster** (ClusterAffinity), required

            TargetCluster describes the filter to select clusters.

            <a name="ClusterAffinity"></a>

            *ClusterAffinity represents the filter to select clusters.*

            - **spec.placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.clusterNames** ([]string)

              ClusterNames is the list of clusters to be selected.

            - **spec.placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.exclude** ([]string)

              ExcludedClusters is the list of clusters to be ignored.

            - **spec.placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.fieldSelector** (FieldSelector)

              FieldSelector is a filter to select member clusters by fields. The key(field) of the match expression should be 'provider', 'region', or 'zone', and the operator of the match expression should be 'In' or 'NotIn'. If non-nil and non-empty, only the clusters match this filter will be selected.

              <a name="FieldSelector"></a>

              *FieldSelector is a field filter.*

              - **spec.placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

                A list of field selector requirements.

            - **spec.placement.replicaScheduling.weightPreference.staticWeightList.targetCluster.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

              LabelSelector is a filter to select member clusters by labels. If non-nil and non-empty, only the clusters match this filter will be selected.

          - **spec.placement.replicaScheduling.weightPreference.staticWeightList.weight** (int64), required

            Weight expressing the preference to the cluster(s) specified by 'TargetCluster'.

    - **spec.placement.spreadConstraints** ([]SpreadConstraint)

      SpreadConstraints represents a list of the scheduling constraints.

      <a name="SpreadConstraint"></a>

      *SpreadConstraint represents the spread constraints on resources.*

      - **spec.placement.spreadConstraints.maxGroups** (int32)

        MaxGroups restricts the maximum number of cluster groups to be selected.

      - **spec.placement.spreadConstraints.minGroups** (int32)

        MinGroups restricts the minimum number of cluster groups to be selected. Defaults to 1.

      - **spec.placement.spreadConstraints.spreadByField** (string)

        SpreadByField represents the fields on Karmada cluster API used for dynamically grouping member clusters into different groups. Resources will be spread among different cluster groups. Available fields for spreading are: cluster, region, zone, and provider. SpreadByField should not co-exist with SpreadByLabel. If both SpreadByField and SpreadByLabel are empty, SpreadByField will be set to "cluster" by system.

      - **spec.placement.spreadConstraints.spreadByLabel** (string)

        SpreadByLabel represents the label key used for grouping member clusters into different groups. Resources will be spread among different cluster groups. SpreadByLabel should not co-exist with SpreadByField.

  - **spec.preemption** (string)

    Preemption declares the behaviors for preempting. Valid options are "Always" and "Never".
    
    
    Possible enum values:
     - `"Always"` means that preemption is allowed. If it is applied to a PropagationPolicy, it can preempt any resource as per Priority, regardless of whether it has been claimed by a PropagationPolicy or a ClusterPropagationPolicy, as long as it can match the rules defined in ResourceSelector. In addition, if a resource has already been claimed by a ClusterPropagationPolicy, the PropagationPolicy can still preempt it without considering Priority. If it is applied to a ClusterPropagationPolicy, it can only preempt from ClusterPropagationPolicy, and from PropagationPolicy is not allowed.
     - `"Never"` means that a PropagationPolicy(ClusterPropagationPolicy) never preempts resources.

  - **spec.preserveResourcesOnDeletion** (boolean)

    PreserveResourcesOnDeletion controls whether resources should be preserved on the member clusters when the resource template is deleted. If set to true, resources will be preserved on the member clusters. Default is false, which means resources will be deleted along with the resource template.
    
    This setting is particularly useful during workload migration scenarios to ensure that rollback can occur quickly without affecting the workloads running on the member clusters.
    
    Additionally, this setting applies uniformly across all member clusters and will not selectively control preservation on only some clusters.
    
    Note: This setting does not apply to the deletion of the policy itself. When the policy is deleted, the resource templates and their corresponding propagated resources in member clusters will remain unchanged unless explicitly deleted.

  - **spec.priority** (int32)

    Priority indicates the importance of a policy(PropagationPolicy or ClusterPropagationPolicy). A policy will be applied for the matched resource templates if there is no other policies with higher priority at the point of the resource template be processed. Once a resource template has been claimed by a policy, by default it will not be preempted by following policies even with a higher priority. See Preemption for more details.
    
    In case of two policies have the same priority, the one with a more precise matching rules in ResourceSelectors wins: - matching by name(resourceSelector.name) has higher priority than
      by selector(resourceSelector.labelSelector)
    - matching by selector(resourceSelector.labelSelector) has higher priority
      than by APIVersion(resourceSelector.apiVersion) and Kind(resourceSelector.kind).
    If there is still no winner at this point, the one with the lower alphabetic order wins, e.g. policy 'bar' has higher priority than 'foo'.
    
    The higher the value, the higher the priority. Defaults to zero.

  - **spec.propagateDeps** (boolean)

    PropagateDeps tells if relevant resources should be propagated automatically. Take 'Deployment' which referencing 'ConfigMap' and 'Secret' as an example, when 'propagateDeps' is 'true', the referencing resources could be omitted(for saving config effort) from 'resourceSelectors' as they will be propagated along with the Deployment. In addition to the propagating process, the referencing resources will be migrated along with the Deployment in the fail-over scenario.
    
    Defaults to false.

  - **spec.schedulerName** (string)

    SchedulerName represents which scheduler to proceed the scheduling. If specified, the policy will be dispatched by specified scheduler. If not specified, the policy will be dispatched by default scheduler.

  - **spec.suspension** (Suspension)

    Suspension declares the policy for suspending different aspects of propagation. nil means no suspension. no default values.

    <a name="Suspension"></a>

    *Suspension defines the policy for suspending different aspects of propagation.*

    - **spec.suspension.dispatching** (boolean)

      Dispatching controls whether dispatching should be suspended. nil means not suspend, no default value, only accepts 'true'. Note: true means stop propagating to all clusters. Can not co-exist with DispatchingOnClusters which is used to suspend particular clusters.

    - **spec.suspension.dispatchingOnClusters** (SuspendClusters)

      DispatchingOnClusters declares a list of clusters to which the dispatching should be suspended. Note: Can not co-exist with Dispatching which is used to suspend all.

      <a name="SuspendClusters"></a>

      *SuspendClusters represents a group of clusters that should be suspended from propagating. Note: No plan to introduce the label selector or field selector to select clusters yet, as it would make the system unpredictable.*

      - **spec.suspension.dispatchingOnClusters.clusterNames** ([]string)

        ClusterNames is the list of clusters to be selected.

## PropagationPolicyList 

PropagationPolicyList contains a list of PropagationPolicy.

<hr/>

- **apiVersion**: policy.karmada.io/v1alpha1

- **kind**: PropagationPolicyList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)), required

## Operations 

<hr/>

### `get` read the specified PropagationPolicy

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/propagationpolicies/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the PropagationPolicy

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): OK

### `get` read status of the specified PropagationPolicy

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/propagationpolicies/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the PropagationPolicy

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): OK

### `list` list or watch objects of kind PropagationPolicy

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/propagationpolicies

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

200 ([PropagationPolicyList](../policy-resources/propagation-policy-v1alpha1#propagationpolicylist)): OK

### `list` list or watch objects of kind PropagationPolicy

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/propagationpolicies

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

200 ([PropagationPolicyList](../policy-resources/propagation-policy-v1alpha1#propagationpolicylist)): OK

### `create` create a PropagationPolicy

#### HTTP Request

POST /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/propagationpolicies

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): OK

201 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): Created

202 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): Accepted

### `update` replace the specified PropagationPolicy

#### HTTP Request

PUT /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/propagationpolicies/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the PropagationPolicy

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): OK

201 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): Created

### `update` replace status of the specified PropagationPolicy

#### HTTP Request

PUT /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/propagationpolicies/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the PropagationPolicy

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): OK

201 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): Created

### `patch` partially update the specified PropagationPolicy

#### HTTP Request

PATCH /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/propagationpolicies/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the PropagationPolicy

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

200 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): OK

201 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): Created

### `patch` partially update status of the specified PropagationPolicy

#### HTTP Request

PATCH /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/propagationpolicies/`{name}`/status

#### Parameters

- **name** (*in path*): string, required

  name of the PropagationPolicy

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

200 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): OK

201 ([PropagationPolicy](../policy-resources/propagation-policy-v1alpha1#propagationpolicy)): Created

### `delete` delete a PropagationPolicy

#### HTTP Request

DELETE /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/propagationpolicies/`{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the PropagationPolicy

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **gracePeriodSeconds** (*in query*): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (*in query*): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

#### Response

200 ([Status](../common-definitions/status#status)): OK

202 ([Status](../common-definitions/status#status)): Accepted

### `deletecollection` delete collection of PropagationPolicy

#### HTTP Request

DELETE /apis/policy.karmada.io/v1alpha1/namespaces/`{namespace}`/propagationpolicies

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

