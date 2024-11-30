---
api_metadata:
  apiVersion: "policy.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"
  kind: "OverridePolicy"
content_type: "api_reference"
description: "OverridePolicy represents the policy that overrides a group of resources to one or more clusters."
title: "OverridePolicy v1alpha1"
weight: 2
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: policy.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/policy/v1alpha1"`

## OverridePolicy 

OverridePolicy represents the policy that overrides a group of resources to one or more clusters.

<hr/>

- **apiVersion**: policy.karmada.io/v1alpha1

- **kind**: OverridePolicy

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** (OverrideSpec), required

  Spec represents the desired behavior of OverridePolicy.

  <a name="OverrideSpec"></a>

  *OverrideSpec defines the desired behavior of OverridePolicy.*

  - **spec.overrideRules** ([]RuleWithCluster)

    OverrideRules defines a collection of override rules on target clusters.

    <a name="RuleWithCluster"></a>

    *RuleWithCluster defines the override rules on clusters.*

    - **spec.overrideRules.overriders** (Overriders), required

      Overriders represents the override rules that would apply on resources

      <a name="Overriders"></a>

      *Overriders offers various alternatives to represent the override rules.
      
      If more than one alternative exists, they will be applied with following order: - ImageOverrider - CommandOverrider - ArgsOverrider - LabelsOverrider - AnnotationsOverrider - FieldOverrider - Plaintext*

      - **spec.overrideRules.overriders.annotationsOverrider** ([]LabelAnnotationOverrider)

        AnnotationsOverrider represents the rules dedicated to handling workload annotations

        <a name="LabelAnnotationOverrider"></a>

        *LabelAnnotationOverrider represents the rules dedicated to handling workload labels/annotations*

        - **spec.overrideRules.overriders.annotationsOverrider.operator** (string), required

          Operator represents the operator which will apply on the workload.

        - **spec.overrideRules.overriders.annotationsOverrider.value** (map[string]string), required

          Value to be applied to annotations/labels of workload. Items in Value which will be appended after annotations/labels when Operator is 'add'. Items in Value which match in annotations/labels will be deleted when Operator is 'remove'. Items in Value which match in annotations/labels will be replaced when Operator is 'replace'.

      - **spec.overrideRules.overriders.argsOverrider** ([]CommandArgsOverrider)

        ArgsOverrider represents the rules dedicated to handling container args

        <a name="CommandArgsOverrider"></a>

        *CommandArgsOverrider represents the rules dedicated to handling command/args overrides.*

        - **spec.overrideRules.overriders.argsOverrider.containerName** (string), required

          The name of container

        - **spec.overrideRules.overriders.argsOverrider.operator** (string), required

          Operator represents the operator which will apply on the command/args.

        - **spec.overrideRules.overriders.argsOverrider.value** ([]string)

          Value to be applied to command/args. Items in Value which will be appended after command/args when Operator is 'add'. Items in Value which match in command/args will be deleted when Operator is 'remove'. If Value is empty, then the command/args will remain the same.

      - **spec.overrideRules.overriders.commandOverrider** ([]CommandArgsOverrider)

        CommandOverrider represents the rules dedicated to handling container command

        <a name="CommandArgsOverrider"></a>

        *CommandArgsOverrider represents the rules dedicated to handling command/args overrides.*

        - **spec.overrideRules.overriders.commandOverrider.containerName** (string), required

          The name of container

        - **spec.overrideRules.overriders.commandOverrider.operator** (string), required

          Operator represents the operator which will apply on the command/args.

        - **spec.overrideRules.overriders.commandOverrider.value** ([]string)

          Value to be applied to command/args. Items in Value which will be appended after command/args when Operator is 'add'. Items in Value which match in command/args will be deleted when Operator is 'remove'. If Value is empty, then the command/args will remain the same.

      - **spec.overrideRules.overriders.fieldOverrider** ([]FieldOverrider)

        FieldOverrider represents the rules dedicated to modifying a specific field in any Kubernetes resource. This allows changing a single field within the resource with multiple operations. It is designed to handle structured field values such as those found in ConfigMaps or Secrets. The current implementation supports JSON and YAML formats, but can easily be extended to support XML in the future.

        <a name="FieldOverrider"></a>

        *FieldOverrider represents the rules dedicated to modifying a specific field in any Kubernetes resource. This allows changing a single field within the resource with multiple operations. It is designed to handle structured field values such as those found in ConfigMaps or Secrets. The current implementation supports JSON and YAML formats, but can easily be extended to support XML in the future. Note: In any given instance, FieldOverrider processes either JSON or YAML fields, but not both simultaneously.*

        - **spec.overrideRules.overriders.fieldOverrider.fieldPath** (string), required

          FieldPath specifies the initial location in the instance document where the operation should take place. The path uses RFC 6901 for navigating into nested structures. For example, the path "/data/db-config.yaml" specifies the configuration data key named "db-config.yaml" in a ConfigMap: "/data/db-config.yaml".

        - **spec.overrideRules.overriders.fieldOverrider.json** ([]JSONPatchOperation)

          JSON represents the operations performed on the JSON document specified by the FieldPath.

          <a name="JSONPatchOperation"></a>

          *JSONPatchOperation represents a single field modification operation for JSON format.*

          - **spec.overrideRules.overriders.fieldOverrider.json.operator** (string), required

            Operator indicates the operation on target field. Available operators are: "add", "remove", and "replace".

          - **spec.overrideRules.overriders.fieldOverrider.json.subPath** (string), required

            SubPath specifies the relative location within the initial FieldPath where the operation should take place. The path uses RFC 6901 for navigating into nested structures.

          - **spec.overrideRules.overriders.fieldOverrider.json.value** (JSON)

            Value is the new value to set for the specified field if the operation is "add" or "replace". For "remove" operation, this field is ignored.

            <a name="JSON"></a>

            *JSON represents any valid JSON value. These types are supported: bool, int64, float64, string, []interface[], map[string]interface[] and nil.*

        - **spec.overrideRules.overriders.fieldOverrider.yaml** ([]YAMLPatchOperation)

          YAML represents the operations performed on the YAML document specified by the FieldPath.

          <a name="YAMLPatchOperation"></a>

          *YAMLPatchOperation represents a single field modification operation for YAML format.*

          - **spec.overrideRules.overriders.fieldOverrider.yaml.operator** (string), required

            Operator indicates the operation on target field. Available operators are: "add", "remove", and "replace".

          - **spec.overrideRules.overriders.fieldOverrider.yaml.subPath** (string), required

            SubPath specifies the relative location within the initial FieldPath where the operation should take place. The path uses RFC 6901 for navigating into nested structures.

          - **spec.overrideRules.overriders.fieldOverrider.yaml.value** (JSON)

            Value is the new value to set for the specified field if the operation is "add" or "replace". For "remove" operation, this field is ignored.

            <a name="JSON"></a>

            *JSON represents any valid JSON value. These types are supported: bool, int64, float64, string, []interface[], map[string]interface[] and nil.*

      - **spec.overrideRules.overriders.imageOverrider** ([]ImageOverrider)

        ImageOverrider represents the rules dedicated to handling image overrides.

        <a name="ImageOverrider"></a>

        *ImageOverrider represents the rules dedicated to handling image overrides.*

        - **spec.overrideRules.overriders.imageOverrider.component** (string), required

          Component is part of image name. Basically we presume an image can be made of '[registry/]repository[:tag]'. The registry could be: - registry.k8s.io - fictional.registry.example:10443 The repository could be: - kube-apiserver - fictional/nginx The tag cloud be: - latest - v1.19.1 - @sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c

        - **spec.overrideRules.overriders.imageOverrider.operator** (string), required

          Operator represents the operator which will apply on the image.

        - **spec.overrideRules.overriders.imageOverrider.predicate** (ImagePredicate)

          Predicate filters images before applying the rule.
          
          Defaults to nil, in that case, the system will automatically detect image fields if the resource type is Pod, ReplicaSet, Deployment, StatefulSet, DaemonSet or Job by following rule:
            - Pod: /spec/containers/&lt;N&gt;/image
            - ReplicaSet: /spec/template/spec/containers/&lt;N&gt;/image
            - Deployment: /spec/template/spec/containers/&lt;N&gt;/image
            - DaemonSet: /spec/template/spec/containers/&lt;N&gt;/image
            - StatefulSet: /spec/template/spec/containers/&lt;N&gt;/image
            - Job: /spec/template/spec/containers/&lt;N&gt;/image
          In addition, all images will be processed if the resource object has more than one container.
          
          If not nil, only images matches the filters will be processed.

          <a name="ImagePredicate"></a>

          *ImagePredicate describes images filter.*

          - **spec.overrideRules.overriders.imageOverrider.predicate.path** (string), required

            Path indicates the path of target field

        - **spec.overrideRules.overriders.imageOverrider.value** (string)

          Value to be applied to image. Must not be empty when operator is 'add' or 'replace'. Defaults to empty and ignored when operator is 'remove'.

      - **spec.overrideRules.overriders.labelsOverrider** ([]LabelAnnotationOverrider)

        LabelsOverrider represents the rules dedicated to handling workload labels

        <a name="LabelAnnotationOverrider"></a>

        *LabelAnnotationOverrider represents the rules dedicated to handling workload labels/annotations*

        - **spec.overrideRules.overriders.labelsOverrider.operator** (string), required

          Operator represents the operator which will apply on the workload.

        - **spec.overrideRules.overriders.labelsOverrider.value** (map[string]string), required

          Value to be applied to annotations/labels of workload. Items in Value which will be appended after annotations/labels when Operator is 'add'. Items in Value which match in annotations/labels will be deleted when Operator is 'remove'. Items in Value which match in annotations/labels will be replaced when Operator is 'replace'.

      - **spec.overrideRules.overriders.plaintext** ([]PlaintextOverrider)

        Plaintext represents override rules defined with plaintext overriders.

        <a name="PlaintextOverrider"></a>

        *PlaintextOverrider is a simple overrider that overrides target fields according to path, operator and value.*

        - **spec.overrideRules.overriders.plaintext.operator** (string), required

          Operator indicates the operation on target field. Available operators are: add, replace and remove.

        - **spec.overrideRules.overriders.plaintext.path** (string), required

          Path indicates the path of target field

        - **spec.overrideRules.overriders.plaintext.value** (JSON)

          Value to be applied to target field. Must be empty when operator is Remove.

          <a name="JSON"></a>

          *JSON represents any valid JSON value. These types are supported: bool, int64, float64, string, []interface[], map[string]interface[] and nil.*

    - **spec.overrideRules.targetCluster** (ClusterAffinity)

      TargetCluster defines restrictions on this override policy that only applies to resources propagated to the matching clusters. nil means matching all clusters.

      <a name="ClusterAffinity"></a>

      *ClusterAffinity represents the filter to select clusters.*

      - **spec.overrideRules.targetCluster.clusterNames** ([]string)

        ClusterNames is the list of clusters to be selected.

      - **spec.overrideRules.targetCluster.exclude** ([]string)

        ExcludedClusters is the list of clusters to be ignored.

      - **spec.overrideRules.targetCluster.fieldSelector** (FieldSelector)

        FieldSelector is a filter to select member clusters by fields. The key(field) of the match expression should be 'provider', 'region', or 'zone', and the operator of the match expression should be 'In' or 'NotIn'. If non-nil and non-empty, only the clusters match this filter will be selected.

        <a name="FieldSelector"></a>

        *FieldSelector is a field filter.*

        - **spec.overrideRules.targetCluster.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

          A list of field selector requirements.

      - **spec.overrideRules.targetCluster.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

        LabelSelector is a filter to select member clusters by labels. If non-nil and non-empty, only the clusters match this filter will be selected.

  - **spec.overriders** (Overriders)

    Overriders represents the override rules that would apply on resources
    
    Deprecated: This filed is deprecated in v1.0 and please use the OverrideRules instead.

    <a name="Overriders"></a>

    *Overriders offers various alternatives to represent the override rules.
    
    If more than one alternative exists, they will be applied with following order: - ImageOverrider - CommandOverrider - ArgsOverrider - LabelsOverrider - AnnotationsOverrider - FieldOverrider - Plaintext*

    - **spec.overriders.annotationsOverrider** ([]LabelAnnotationOverrider)

      AnnotationsOverrider represents the rules dedicated to handling workload annotations

      <a name="LabelAnnotationOverrider"></a>

      *LabelAnnotationOverrider represents the rules dedicated to handling workload labels/annotations*

      - **spec.overriders.annotationsOverrider.operator** (string), required

        Operator represents the operator which will apply on the workload.

      - **spec.overriders.annotationsOverrider.value** (map[string]string), required

        Value to be applied to annotations/labels of workload. Items in Value which will be appended after annotations/labels when Operator is 'add'. Items in Value which match in annotations/labels will be deleted when Operator is 'remove'. Items in Value which match in annotations/labels will be replaced when Operator is 'replace'.

    - **spec.overriders.argsOverrider** ([]CommandArgsOverrider)

      ArgsOverrider represents the rules dedicated to handling container args

      <a name="CommandArgsOverrider"></a>

      *CommandArgsOverrider represents the rules dedicated to handling command/args overrides.*

      - **spec.overriders.argsOverrider.containerName** (string), required

        The name of container

      - **spec.overriders.argsOverrider.operator** (string), required

        Operator represents the operator which will apply on the command/args.

      - **spec.overriders.argsOverrider.value** ([]string)

        Value to be applied to command/args. Items in Value which will be appended after command/args when Operator is 'add'. Items in Value which match in command/args will be deleted when Operator is 'remove'. If Value is empty, then the command/args will remain the same.

    - **spec.overriders.commandOverrider** ([]CommandArgsOverrider)

      CommandOverrider represents the rules dedicated to handling container command

      <a name="CommandArgsOverrider"></a>

      *CommandArgsOverrider represents the rules dedicated to handling command/args overrides.*

      - **spec.overriders.commandOverrider.containerName** (string), required

        The name of container

      - **spec.overriders.commandOverrider.operator** (string), required

        Operator represents the operator which will apply on the command/args.

      - **spec.overriders.commandOverrider.value** ([]string)

        Value to be applied to command/args. Items in Value which will be appended after command/args when Operator is 'add'. Items in Value which match in command/args will be deleted when Operator is 'remove'. If Value is empty, then the command/args will remain the same.

    - **spec.overriders.fieldOverrider** ([]FieldOverrider)

      FieldOverrider represents the rules dedicated to modifying a specific field in any Kubernetes resource. This allows changing a single field within the resource with multiple operations. It is designed to handle structured field values such as those found in ConfigMaps or Secrets. The current implementation supports JSON and YAML formats, but can easily be extended to support XML in the future.

      <a name="FieldOverrider"></a>

      *FieldOverrider represents the rules dedicated to modifying a specific field in any Kubernetes resource. This allows changing a single field within the resource with multiple operations. It is designed to handle structured field values such as those found in ConfigMaps or Secrets. The current implementation supports JSON and YAML formats, but can easily be extended to support XML in the future. Note: In any given instance, FieldOverrider processes either JSON or YAML fields, but not both simultaneously.*

      - **spec.overriders.fieldOverrider.fieldPath** (string), required

        FieldPath specifies the initial location in the instance document where the operation should take place. The path uses RFC 6901 for navigating into nested structures. For example, the path "/data/db-config.yaml" specifies the configuration data key named "db-config.yaml" in a ConfigMap: "/data/db-config.yaml".

      - **spec.overriders.fieldOverrider.json** ([]JSONPatchOperation)

        JSON represents the operations performed on the JSON document specified by the FieldPath.

        <a name="JSONPatchOperation"></a>

        *JSONPatchOperation represents a single field modification operation for JSON format.*

        - **spec.overriders.fieldOverrider.json.operator** (string), required

          Operator indicates the operation on target field. Available operators are: "add", "remove", and "replace".

        - **spec.overriders.fieldOverrider.json.subPath** (string), required

          SubPath specifies the relative location within the initial FieldPath where the operation should take place. The path uses RFC 6901 for navigating into nested structures.

        - **spec.overriders.fieldOverrider.json.value** (JSON)

          Value is the new value to set for the specified field if the operation is "add" or "replace". For "remove" operation, this field is ignored.

          <a name="JSON"></a>

          *JSON represents any valid JSON value. These types are supported: bool, int64, float64, string, []interface[], map[string]interface[] and nil.*

      - **spec.overriders.fieldOverrider.yaml** ([]YAMLPatchOperation)

        YAML represents the operations performed on the YAML document specified by the FieldPath.

        <a name="YAMLPatchOperation"></a>

        *YAMLPatchOperation represents a single field modification operation for YAML format.*

        - **spec.overriders.fieldOverrider.yaml.operator** (string), required

          Operator indicates the operation on target field. Available operators are: "add", "remove", and "replace".

        - **spec.overriders.fieldOverrider.yaml.subPath** (string), required

          SubPath specifies the relative location within the initial FieldPath where the operation should take place. The path uses RFC 6901 for navigating into nested structures.

        - **spec.overriders.fieldOverrider.yaml.value** (JSON)

          Value is the new value to set for the specified field if the operation is "add" or "replace". For "remove" operation, this field is ignored.

          <a name="JSON"></a>

          *JSON represents any valid JSON value. These types are supported: bool, int64, float64, string, []interface[], map[string]interface[] and nil.*

    - **spec.overriders.imageOverrider** ([]ImageOverrider)

      ImageOverrider represents the rules dedicated to handling image overrides.

      <a name="ImageOverrider"></a>

      *ImageOverrider represents the rules dedicated to handling image overrides.*

      - **spec.overriders.imageOverrider.component** (string), required

        Component is part of image name. Basically we presume an image can be made of '[registry/]repository[:tag]'. The registry could be: - registry.k8s.io - fictional.registry.example:10443 The repository could be: - kube-apiserver - fictional/nginx The tag cloud be: - latest - v1.19.1 - @sha256:dbcc1c35ac38df41fd2f5e4130b32ffdb93ebae8b3dbe638c23575912276fc9c

      - **spec.overriders.imageOverrider.operator** (string), required

        Operator represents the operator which will apply on the image.

      - **spec.overriders.imageOverrider.predicate** (ImagePredicate)

        Predicate filters images before applying the rule.
        
        Defaults to nil, in that case, the system will automatically detect image fields if the resource type is Pod, ReplicaSet, Deployment, StatefulSet, DaemonSet or Job by following rule:
          - Pod: /spec/containers/&lt;N&gt;/image
          - ReplicaSet: /spec/template/spec/containers/&lt;N&gt;/image
          - Deployment: /spec/template/spec/containers/&lt;N&gt;/image
          - DaemonSet: /spec/template/spec/containers/&lt;N&gt;/image
          - StatefulSet: /spec/template/spec/containers/&lt;N&gt;/image
          - Job: /spec/template/spec/containers/&lt;N&gt;/image
        In addition, all images will be processed if the resource object has more than one container.
        
        If not nil, only images matches the filters will be processed.

        <a name="ImagePredicate"></a>

        *ImagePredicate describes images filter.*

        - **spec.overriders.imageOverrider.predicate.path** (string), required

          Path indicates the path of target field

      - **spec.overriders.imageOverrider.value** (string)

        Value to be applied to image. Must not be empty when operator is 'add' or 'replace'. Defaults to empty and ignored when operator is 'remove'.

    - **spec.overriders.labelsOverrider** ([]LabelAnnotationOverrider)

      LabelsOverrider represents the rules dedicated to handling workload labels

      <a name="LabelAnnotationOverrider"></a>

      *LabelAnnotationOverrider represents the rules dedicated to handling workload labels/annotations*

      - **spec.overriders.labelsOverrider.operator** (string), required

        Operator represents the operator which will apply on the workload.

      - **spec.overriders.labelsOverrider.value** (map[string]string), required

        Value to be applied to annotations/labels of workload. Items in Value which will be appended after annotations/labels when Operator is 'add'. Items in Value which match in annotations/labels will be deleted when Operator is 'remove'. Items in Value which match in annotations/labels will be replaced when Operator is 'replace'.

    - **spec.overriders.plaintext** ([]PlaintextOverrider)

      Plaintext represents override rules defined with plaintext overriders.

      <a name="PlaintextOverrider"></a>

      *PlaintextOverrider is a simple overrider that overrides target fields according to path, operator and value.*

      - **spec.overriders.plaintext.operator** (string), required

        Operator indicates the operation on target field. Available operators are: add, replace and remove.

      - **spec.overriders.plaintext.path** (string), required

        Path indicates the path of target field

      - **spec.overriders.plaintext.value** (JSON)

        Value to be applied to target field. Must be empty when operator is Remove.

        <a name="JSON"></a>

        *JSON represents any valid JSON value. These types are supported: bool, int64, float64, string, []interface[], map[string]interface[] and nil.*

  - **spec.resourceSelectors** ([]ResourceSelector)

    ResourceSelectors restricts resource types that this override policy applies to. nil means matching all resources.

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

  - **spec.targetCluster** (ClusterAffinity)

    TargetCluster defines restrictions on this override policy that only applies to resources propagated to the matching clusters. nil means matching all clusters.
    
    Deprecated: This filed is deprecated in v1.0 and please use the OverrideRules instead.

    <a name="ClusterAffinity"></a>

    *ClusterAffinity represents the filter to select clusters.*

    - **spec.targetCluster.clusterNames** ([]string)

      ClusterNames is the list of clusters to be selected.

    - **spec.targetCluster.exclude** ([]string)

      ExcludedClusters is the list of clusters to be ignored.

    - **spec.targetCluster.fieldSelector** (FieldSelector)

      FieldSelector is a filter to select member clusters by fields. The key(field) of the match expression should be 'provider', 'region', or 'zone', and the operator of the match expression should be 'In' or 'NotIn'. If non-nil and non-empty, only the clusters match this filter will be selected.

      <a name="FieldSelector"></a>

      *FieldSelector is a field filter.*

      - **spec.targetCluster.fieldSelector.matchExpressions** ([][NodeSelectorRequirement](../common-definitions/node-selector-requirement#nodeselectorrequirement))

        A list of field selector requirements.

    - **spec.targetCluster.labelSelector** ([LabelSelector](../common-definitions/label-selector#labelselector))

      LabelSelector is a filter to select member clusters by labels. If non-nil and non-empty, only the clusters match this filter will be selected.

## OverridePolicyList 

OverridePolicyList is a collection of OverridePolicy.

<hr/>

- **apiVersion**: policy.karmada.io/v1alpha1

- **kind**: OverridePolicyList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)), required

  Items holds a list of OverridePolicy.

## Operations 

<hr/>

### `get` read the specified OverridePolicy

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/overridepolicies/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the OverridePolicy

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)): OK

### `get` read status of the specified OverridePolicy

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/overridepolicies/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the OverridePolicy

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)): OK

### `list` list or watch objects of kind OverridePolicy

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/overridepolicies

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

200 ([OverridePolicyList](../policy-resources/override-policy-v1alpha1#overridepolicylist)): OK

### `list` list or watch objects of kind OverridePolicy

#### HTTP Request

GET /apis/policy.karmada.io/v1alpha1/overridepolicies

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

200 ([OverridePolicyList](../policy-resources/override-policy-v1alpha1#overridepolicylist)): OK

### `create` create an OverridePolicy

#### HTTP Request

POST /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/overridepolicies

#### Parameters

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)): OK

201 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)): Created

202 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)): Accepted

### `update` replace the specified OverridePolicy

#### HTTP Request

PUT /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/overridepolicies/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the OverridePolicy

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)): OK

201 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)): Created

### `update` replace status of the specified OverridePolicy

#### HTTP Request

PUT /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/overridepolicies/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the OverridePolicy

- **namespace** (*in path*): string, required

  [namespace](../common-parameter/common-parameters#namespace)

- **body**: [OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)): OK

201 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)): Created

### `patch` partially update the specified OverridePolicy

#### HTTP Request

PATCH /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/overridepolicies/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the OverridePolicy

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

200 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)): OK

201 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)): Created

### `patch` partially update status of the specified OverridePolicy

#### HTTP Request

PATCH /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/overridepolicies/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the OverridePolicy

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

200 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)): OK

201 ([OverridePolicy](../policy-resources/override-policy-v1alpha1#overridepolicy)): Created

### `delete` delete an OverridePolicy

#### HTTP Request

DELETE /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/overridepolicies/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the OverridePolicy

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

### `deletecollection` delete collection of OverridePolicy

#### HTTP Request

DELETE /apis/policy.karmada.io/v1alpha1/namespaces/{namespace}/overridepolicies

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

