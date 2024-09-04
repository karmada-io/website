---
api_metadata:
  apiVersion: "config.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/config/v1alpha1"
  kind: "ResourceInterpreterCustomization"
content_type: "api_reference"
description: "ResourceInterpreterCustomization describes the configuration of a specific resource for Karmada to get the structure."
title: "ResourceInterpreterCustomization v1alpha1"
weight: 1
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: config.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/config/v1alpha1"`

## ResourceInterpreterCustomization 

ResourceInterpreterCustomization describes the configuration of a specific resource for Karmada to get the structure. It has higher precedence than the default interpreter and the interpreter webhook.

<hr/>

- **apiVersion**: config.karmada.io/v1alpha1

- **kind**: ResourceInterpreterCustomization

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([ResourceInterpreterCustomizationSpec](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomizationspec)), required

  Spec describes the configuration in detail.

## ResourceInterpreterCustomizationSpec 

ResourceInterpreterCustomizationSpec describes the configuration in detail.

<hr/>

- **customizations** (CustomizationRules), required

  Customizations describe the interpretation rules.

  <a name="CustomizationRules"></a>

  *CustomizationRules describes the interpretation rules.*

  - **customizations.dependencyInterpretation** (DependencyInterpretation)

    DependencyInterpretation describes the rules for Karmada to analyze the dependent resources. Karmada provides built-in rules for several standard Kubernetes types, see: https://karmada.io/docs/userguide/globalview/customizing-resource-interpreter/#interpretdependency If DependencyInterpretation is set, the built-in rules will be ignored.

    <a name="DependencyInterpretation"></a>

    *DependencyInterpretation holds the rules for interpreting the dependent resources of a specific resources.*

    - **customizations.dependencyInterpretation.luaScript** (string), required

      LuaScript holds the Lua script that is used to interpret the dependencies of a specific resource. The script should implement a function as follows:
      
      ```
        luaScript: >
            function GetDependencies(desiredObj)
                dependencies = []
                serviceAccountName = desiredObj.spec.template.spec.serviceAccountName
                if serviceAccountName ~= nil and serviceAccountName ~= "default" then
                    dependency = []
                    dependency.apiVersion = "v1"
                    dependency.kind = "ServiceAccount"
                    dependency.name = serviceAccountName
                    dependency.namespace = desiredObj.metadata.namespace
                    dependencies[1] = dependency
                end
                return dependencies
            end
      ```
      
      The content of the LuaScript needs to be a whole function including both declaration and implementation.
      
      The parameters will be supplied by the system:
        - desiredObj: the object represents the configuration to be applied
            to the member cluster.
      
      The returned value should be expressed by a slice of DependentObjectReference.

  - **customizations.healthInterpretation** (HealthInterpretation)

    HealthInterpretation describes the health assessment rules by which Karmada can assess the health state of the resource type.

    <a name="HealthInterpretation"></a>

    *HealthInterpretation holds the rules for interpreting the health state of a specific resource.*

    - **customizations.healthInterpretation.luaScript** (string), required

      LuaScript holds the Lua script that is used to assess the health state of a specific resource. The script should implement a function as follows:
      
      ```
        luaScript: >
            function InterpretHealth(observedObj)
                if observedObj.status.readyReplicas == observedObj.spec.replicas then
                    return true
                end
            end
      ```
      
      The content of the LuaScript needs to be a whole function including both declaration and implementation.
      
      The parameters will be supplied by the system:
        - observedObj: the object represents the configuration that is observed
            from a specific member cluster.
      
      The returned boolean value indicates the health status.

  - **customizations.replicaResource** (ReplicaResourceRequirement)

    ReplicaResource describes the rules for Karmada to discover the resource's replica as well as resource requirements. It would be useful for those CRD resources that declare workload types like Deployment. It is usually not needed for Kubernetes native resources(Deployment, Job) as Karmada knows how to discover info from them. But if it is set, the built-in discovery rules will be ignored.

    <a name="ReplicaResourceRequirement"></a>

    *ReplicaResourceRequirement holds the scripts for getting the desired replicas as well as the resource requirement of each replica.*

    - **customizations.replicaResource.luaScript** (string), required

      LuaScript holds the Lua script that is used to discover the resource's replica as well as resource requirements
      
      The script should implement a function as follows:
      
      ```
        luaScript: >
            function GetReplicas(desiredObj)
                replica = desiredObj.spec.replicas
                requirement = []
                requirement.nodeClaim = []
                requirement.nodeClaim.nodeSelector = desiredObj.spec.template.spec.nodeSelector
                requirement.nodeClaim.tolerations = desiredObj.spec.template.spec.tolerations
                requirement.resourceRequest = desiredObj.spec.template.spec.containers[1].resources.limits
                return replica, requirement
            end
      ```
      
      The content of the LuaScript needs to be a whole function including both declaration and implementation.
      
      The parameters will be supplied by the system:
        - desiredObj: the object represents the configuration to be applied
            to the member cluster.
      
      The function expects two return values:
        - replica: the declared replica number
        - requirement: the resource required by each replica expressed with a
            ResourceBindingSpec.ReplicaRequirements.
      The returned values will be set into a ResourceBinding or ClusterResourceBinding.

  - **customizations.replicaRevision** (ReplicaRevision)

    ReplicaRevision describes the rules for Karmada to revise the resource's replica. It would be useful for those CRD resources that declare workload types like Deployment. It is usually not needed for Kubernetes native resources(Deployment, Job) as Karmada knows how to revise replicas for them. But if it is set, the built-in revision rules will be ignored.

    <a name="ReplicaRevision"></a>

    *ReplicaRevision holds the scripts for revising the desired replicas.*

    - **customizations.replicaRevision.luaScript** (string), required

      LuaScript holds the Lua script that is used to revise replicas in the desired specification. The script should implement a function as follows:
      
      ```
        luaScript: >
            function ReviseReplica(desiredObj, desiredReplica)
                desiredObj.spec.replicas = desiredReplica
                return desiredObj
            end
      ```
      
      The content of the LuaScript needs to be a whole function including both declaration and implementation.
      
      The parameters will be supplied by the system:
        - desiredObj: the object represents the configuration to be applied
            to the member cluster.
        - desiredReplica: the replica number should be applied with.
      
      The returned object should be a revised configuration which will be applied to member cluster eventually.

  - **customizations.retention** (LocalValueRetention)

    Retention describes the desired behavior that Karmada should react on the changes made by member cluster components. This avoids system running into a meaningless loop that Karmada resource controller and the member cluster component continually applying opposite values of a field. For example, the "replicas" of Deployment might be changed by the HPA controller on member cluster. In this case, Karmada should retain the "replicas" and not try to change it.

    <a name="LocalValueRetention"></a>

    *LocalValueRetention holds the scripts for retention. Now only supports Lua.*

    - **customizations.retention.luaScript** (string), required

      LuaScript holds the Lua script that is used to retain runtime values to the desired specification.
      
      The script should implement a function as follows:
      
      ```
        luaScript: >
            function Retain(desiredObj, observedObj)
                desiredObj.spec.fieldFoo = observedObj.spec.fieldFoo
                return desiredObj
            end
      ```
      
      The content of the LuaScript needs to be a whole function including both declaration and implementation.
      
      The parameters will be supplied by the system:
        - desiredObj: the object represents the configuration to be applied
            to the member cluster.
        - observedObj: the object represents the configuration that is observed
            from a specific member cluster.
      
      The returned object should be a retained configuration which will be applied to member cluster eventually.

  - **customizations.statusAggregation** (StatusAggregation)

    StatusAggregation describes the rules for Karmada to aggregate status collected from member clusters to resource template. Karmada provides built-in rules for several standard Kubernetes types, see: https://karmada.io/docs/userguide/globalview/customizing-resource-interpreter/#aggregatestatus If StatusAggregation is set, the built-in rules will be ignored.

    <a name="StatusAggregation"></a>

    *StatusAggregation holds the scripts for aggregating several decentralized statuses.*

    - **customizations.statusAggregation.luaScript** (string), required

      LuaScript holds the Lua script that is used to aggregate decentralized statuses to the desired specification. The script should implement a function as follows:
      
      ```
        luaScript: >
            function AggregateStatus(desiredObj, statusItems)
                for i = 1, #statusItems do
                    desiredObj.status.readyReplicas = desiredObj.status.readyReplicas + items[i].readyReplicas
                end
                return desiredObj
            end
      ```
      
      The content of the LuaScript needs to be a whole function including both declaration and implementation.
      
      The parameters will be supplied by the system:
        - desiredObj: the object represents a resource template.
        - statusItems: the slice of status expressed with AggregatedStatusItem.
      
      The returned object should be a whole object with status aggregated.

  - **customizations.statusReflection** (StatusReflection)

    StatusReflection describes the rules for Karmada to pick the resource's status. Karmada provides built-in rules for several standard Kubernetes types, see: https://karmada.io/docs/userguide/globalview/customizing-resource-interpreter/#interpretstatus If StatusReflection is set, the built-in rules will be ignored.

    <a name="StatusReflection"></a>

    *StatusReflection holds the scripts for getting the status.*

    - **customizations.statusReflection.luaScript** (string), required

      LuaScript holds the Lua script that is used to get the status from the observed specification. The script should implement a function as follows:
      
      ```
        luaScript: >
            function ReflectStatus(observedObj)
                status = []
                status.readyReplicas = observedObj.status.observedObj
                return status
            end
      ```
      
      The content of the LuaScript needs to be a whole function including both declaration and implementation.
      
      The parameters will be supplied by the system:
        - observedObj: the object represents the configuration that is observed
            from a specific member cluster.
      
      The returned status could be the whole status or part of it and will be set into both Work and ResourceBinding(ClusterResourceBinding).

- **target** (CustomizationTarget), required

  CustomizationTarget represents the resource type that the customization applies to.

  <a name="CustomizationTarget"></a>

  *CustomizationTarget represents the resource type that the customization applies to.*

  - **target.apiVersion** (string), required

    APIVersion represents the API version of the target resource.

  - **target.kind** (string), required

    Kind represents the Kind of target resources.

## ResourceInterpreterCustomizationList 

ResourceInterpreterCustomizationList contains a list of ResourceInterpreterCustomization.

<hr/>

- **apiVersion**: config.karmada.io/v1alpha1

- **kind**: ResourceInterpreterCustomizationList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)), required

## Operations 

<hr/>

### `get` read the specified ResourceInterpreterCustomization

#### HTTP Request

GET /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceInterpreterCustomization

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): OK

### `get` read status of the specified ResourceInterpreterCustomization

#### HTTP Request

GET /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceInterpreterCustomization

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): OK

### `list` list or watch objects of kind ResourceInterpreterCustomization

#### HTTP Request

GET /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations

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

200 ([ResourceInterpreterCustomizationList](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomizationlist)): OK

### `create` create a ResourceInterpreterCustomization

#### HTTP Request

POST /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations

#### Parameters

- **body**: [ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): OK

201 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): Created

202 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): Accepted

### `update` replace the specified ResourceInterpreterCustomization

#### HTTP Request

PUT /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceInterpreterCustomization

- **body**: [ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): OK

201 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): Created

### `update` replace status of the specified ResourceInterpreterCustomization

#### HTTP Request

PUT /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceInterpreterCustomization

- **body**: [ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): OK

201 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): Created

### `patch` partially update the specified ResourceInterpreterCustomization

#### HTTP Request

PATCH /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceInterpreterCustomization

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

200 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): OK

201 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): Created

### `patch` partially update status of the specified ResourceInterpreterCustomization

#### HTTP Request

PATCH /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations/{name}/status

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceInterpreterCustomization

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

200 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): OK

201 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): Created

### `delete` delete a ResourceInterpreterCustomization

#### HTTP Request

DELETE /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations/{name}

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceInterpreterCustomization

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

### `deletecollection` delete collection of ResourceInterpreterCustomization

#### HTTP Request

DELETE /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations

#### Parameters

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

