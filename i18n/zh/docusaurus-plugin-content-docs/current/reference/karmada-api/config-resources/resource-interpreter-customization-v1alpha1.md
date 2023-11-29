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

ResourceInterpreterCustomization 描述特定资源的配置，方便 Karmada 获取结构。它的优先级高于默认解释器和 webhook 解释器。

<hr/>

- **apiVersion**: config.karmada.io/v1alpha1

- **kind**: ResourceInterpreterCustomization

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([ResourceInterpreterCustomizationSpec](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomizationspec))，必选

  Spec 是配置的详情。

## ResourceInterpreterCustomizationSpec

ResourceInterpreterCustomizationSpec 是配置的详情。

<hr/>

- **customizations** (CustomizationRules)，必选

  Customizations 是对解释规则的描述。

  <a name="CustomizationRules"></a>

  *CustomizationRules 是对解释规则的描述。*

    - **customizations.dependencyInterpretation** (DependencyInterpretation)

      DependencyInterpretation 描述了 Karmada 分析依赖资源的规则。Karmada 为几种标准的 Kubernetes 类型提供了内置规则。如果设置了 DependencyInterpretation，内置规则将被忽略。更多信息，请浏览：https://karmada.io/docs/userguide/globalview/customizing-resource-interpreter/#interpretdependency

      <a name="DependencyInterpretation"></a>

      *DependencyInterpretation 是用于解释特定资源的依赖资源的规则。*

        - **customizations.dependencyInterpretation.luaScript** (string)，必选

          LuaScript 是用于解释特定资源的依赖关系的 Lua 脚本。该脚本应实现以下功能：
      ```yaml
            luaScript: &gt;
                function GetDependencies(desiredObj)
                    dependencies = []
                    if desiredObj.spec.serviceAccountName ~= nil and desiredObj.spec.serviceAccountName ~= "default" then
                        dependency = []
                        dependency.apiVersion = "v1"
                        dependency.kind = "ServiceAccount"
                        dependency.name = desiredObj.spec.serviceAccountName
                        dependency.namespace = desiredObj.namespace
                        dependencies[1] = []
                        dependencies[1] = dependency
                    end
                    return dependencies
                end
      ```

      LuaScript 的内容是一个完整的函数，包括声明和定义。

      以下参数将由系统提供：
      - desiredObj：将应用于成员集群的配置。

      返回值由 DependentObjectReference 的列表表示。

- **customizations.healthInterpretation** (HealthInterpretation)

  HealthInterpretation 描述了健康评估规则，Karmada 可以通过这些规则评估各类资源的健康状态。

  <a name="HealthInterpretation"></a>

  *HealthInterpretation 是解释特定资源健康状态的规则。*

    - **customizations.healthInterpretation.luaScript** (string)，必选

      LuaScript 是评估特定资源的健康状态的 Lua 脚本。该脚本应实现以下功能：
    ```yaml
      luaScript: &gt;
        function InterpretHealth(observedObj)
          if observedObj.status.readyReplicas == observedObj.spec.replicas then
            return true
          end
        end
    ```

      LuaScript 的内容是一个完整的函数，包括声明和定义。

      以下参数将由系统提供：
        - observedObj：从特定成员集群观测到的配置。

      返回的 boolean 值表示健康状态。

- **customizations.replicaResource** (ReplicaResourceRequirement)

  ReplicaResource 描述了 Karmada 发现资源副本及资源需求的规则。对于声明式工作负载类型（如 Deployment）的 CRD 资源，可能会有用。由于 Karmada 知晓发现 Kubernetes 本机资源信息的方式，因此 Kubernetes 本机资源（Deployment、Job）通常不需要该字段。但如果已设置该字段，内置的发现规则将被忽略。

  <a name="ReplicaResourceRequirement"></a>

  *ReplicaResourceRequirement 保存了获取所需副本及每个副本资源要求的脚本。*

    - **customizations.replicaResource.luaScript** (string)，必选

      LuaScript 是发现资源所用的副本以及资源需求的 Lua 脚本。

      该脚本应实现以下功能：
    ```yaml
      luaScript: &gt;
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

      LuaScript 的内容是一个完整的函数，包括声明和定义。

      以下参数将由系统提供：
        - desiredObj：待应用于成员集群的配置。

      该函数有两个返回值：
        - replica：声明的副本编号。
        - requirement：每个副本所需的资源，使用 ResourceBindingSpec.ReplicaRequirements 表示。
             
      返回值将被 ResourceBinding 或 ClusterResourceBinding 使用。

- **customizations.replicaRevision** (ReplicaRevision)

  ReplicaRevision 描述了 Karmada 修改资源副本的规则。对于声明式工作负载类型（如 Deployment）的 CRD 资源，可能会有用。由于 Karmada 知晓修改 Kubernetes 本机资源副本的方式，因此 Kubernetes 本机资源（Deployment、Job）通常不需要该字段。但如果已设置该字段，内置的修改规则将被忽略。

  <a name="ReplicaRevision"></a>

  *ReplicaRevision 保存了用于修改所需副本的脚本。*

    - **customizations.replicaRevision.luaScript** (string)，必选

      LuaScript 是修改所需规范中的副本的 Lua 脚本。该脚本应实现以下功能：
    ```yaml
      luaScript: &gt;
        function ReviseReplica(desiredObj, desiredReplica)
          desiredObj.spec.replicas = desiredReplica
          return desiredObj
        end
    ```

      LuaScript 的内容是一个完整的函数，包括声明和定义。

      以下参数将由系统提供：
        - desiredObj：待应用于成员集群的配置。

        - desiredReplica：待应用于成员集群的期望副本数。

      返回的是修订后的配置，最终将应用于成员集群。

  - **customizations.retention** (LocalValueRetention)

    Retention 描述了 Karmada 对成员集群组件变化的预期反应。这样可以避免系统进入无意义循环，即 Karmada 资源控制器和成员集群组件，对同一个字段采用不同的值。例如，成员群集的 HPA 控制器可能会更改 Deployment 的 replicas。在这种情况下，Karmada 会保留 replicas，而不会去更改它。

    <a name="LocalValueRetention"></a>

    *LocalValueRetention 保存了要保留的脚本。当前只支持 Lua 脚本。*

      - **customizations.retention.luaScript** (string)，必选

        LuaScript 是将运行时值保留到所需规范的 Lua 脚本。

        该脚本应实现以下功能：
        ```yaml
        luaScript: &gt;
          function Retain(desiredObj, observedObj)
            desiredObj.spec.fieldFoo = observedObj.spec.fieldFoo
            return desiredObj
          end
        ```

        LuaScript 的内容是一个完整的函数，包括声明和定义。

        以下参数将由系统提供：
          - desiredObj：待应用于成员集群的配置。

          - observedObj：从特定成员集群观测到的配置。

      返回的是保留的配置，最终将应用于成员集群。

- **customizations.statusAggregation** (StatusAggregation)

  StatusAggregation 描述了 Karmada 从成员集群收集的状态汇总到资源模板的规则。Karmada 为几种标准的 Kubernetes 类型提供了内置规则。如果设置了 StatusAggregation，内置规则将被忽略。更多信息，请浏览：https://karmada.io/docs/userguide/globalview/customizing-resource-interpreter/#aggregatestatus

  <a name="StatusAggregation"></a>

  *StatusAggregation 保存了用于聚合多个分散状态的脚本。*

    - **customizations.statusAggregation.luaScript** (string)，必选

      LuaScript 是将分散状态聚合到所需规范的 Lua 脚本。该脚本应实现以下功能：
    ```yaml
      luaScript: &gt;
       function AggregateStatus(desiredObj, statusItems)
        for i = 1, #statusItems do
         desiredObj.status.readyReplicas = desiredObj.status.readyReplicas + items[i].readyReplicas
        end
        return desiredObj
       end
    ```

      LuaScript 的内容是一个完整的函数，包括声明和定义。

      以下参数将由系统提供：
        - desiredObj：资源模板。
        - statusItems：用 AggregatedStatusItem 表示的状态列表。

      返回的是状态聚合成的完整对象。

  - **customizations.statusReflection** (StatusReflection)

    StatusReflection 描述了 Karmada 挑选资源状态的规则。Karmada 为几种标准的 Kubernetes 类型提供了内置规则。如果设置了 StatusReflection，内置规则将被忽略。更多信息，请浏览：https://karmada.io/docs/userguide/globalview/customizing-resource-interpreter/#interpretstatus

    <a name="StatusReflection"></a>

    *StatusReflection 保存了用于获取状态的脚本。*

      - **customizations.statusReflection.luaScript** (string)，必选

        LuaScript 是从观测到的规范中获取状态的 Lua 脚本。该脚本应实现以下功能：
        ```yaml
        luaScript: &gt;
          function ReflectStatus(observedObj)
            status = []
            status.readyReplicas = observedObj.status.observedObj
            return status
          end
        ```

        LuaScript 的内容是一个完整的函数，包括声明和定义。

        以下参数将由系统提供：
          - observedObj：从特定成员集群观测到的配置。

      返回的是整个状态，也可以是状态的一部分，并会被 Work 和 ResourceBinding(ClusterResourceBinding) 使用。

- **target** (CustomizationTarget)，必选

  CustomizationTarget 表示自定义的资源类型。

  <a name="CustomizationTarget"></a>

  *CustomizationTarget 表示自定义的资源类型。*

    - **target.apiVersion**（string），必选

      APIVersion 表示目标资源的 API 版本。

    - **target.kind**（string），必选

      Kind 表示目标资源的类别。

## ResourceInterpreterCustomizationList

ResourceInterpreterCustomizationList 包含 ResourceInterpreterCustomization 的列表。

<hr/>

- **apiVersion**: config.karmada.io/v1alpha1

- **kind**: ResourceInterpreterCustomizationList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization))，必选

## 操作

<hr/>

### `get`：查询指定的 ResourceInterpreterCustomization

#### HTTP 请求

`GET /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceInterpreterCustomization 的名称

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): OK

### `get`：查询指定 ResourceInterpreterCustomization 的状态

#### HTTP 请求

`GET /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations/{name}/status`

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceInterpreterCustomization 名称

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): OK

### `list`：查询所有 ResourceInterpreterCustomization

#### HTTP 请求

GET /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations

#### 参数

- **allowWatchBookmarks**（*查询参数*）：boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue**（*查询参数*）：string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector**（*查询参数*）：string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector**（*查询参数*）：string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit**（*查询参数*）：integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion**（*查询参数*）：string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch**（*查询参数*）：string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents**（*查询参数*）：boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds**（*查询参数*）：integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch**（*查询参数*）：boolean

  [watch](../common-parameter/common-parameters#watch)

#### 响应

200 ([ResourceInterpreterCustomizationList](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomizationlist)): OK

### `create`：创建一个 ResourceInterpreterCustomization

#### HTTP 请求

POST /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations

#### 参数

- **body**: [ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): OK

201 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): Created

202 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): Accepted

### `update`：更新指定的 ResourceInterpreterCustomization

#### HTTP 请求

`PUT /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceInterpreterCustomization 名称

- **body**: [ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): OK

201 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): Created

### `update`：更新指定 ResourceInterpreterCustomization 的状态

#### HTTP 请求

`PUT /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations/{name}/status`

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceInterpreterCustomization 的名称

- **body**: [ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): OK

201 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): Created

### `patch`：更新指定 ResourceInterpreterCustomization 的部分信息

#### HTTP 请求

`PATCH /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceInterpreterCustomization 的名称

- **body**: [Patch](../common-definitions/patch#patch)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force**（*查询参数*）：boolean

  [force](../common-parameter/common-parameters#force)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): OK

201 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): Created

### `patch`：更新指定 ResourceInterpreterCustomization 状态的部分信息

#### HTTP 请求

`PATCH /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations/{name}/status`

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceInterpreterCustomization 的名称

- **body**: [Patch](../common-definitions/patch#patch)，必选


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager**（*查询参数*）：string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation**（*查询参数*）：string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force**（*查询参数*）：boolean

  [force](../common-parameter/common-parameters#force)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): OK

201 ([ResourceInterpreterCustomization](../config-resources/resource-interpreter-customization-v1alpha1#resourceinterpretercustomization)): Created

### `delete`：删除一个 ResourceInterpreterCustomization

#### HTTP 请求

`DELETE /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations/{name}`

#### 参数

- **name**（*路径参数*）：string，必选

  ResourceInterpreterCustomization 名称

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)


- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **gracePeriodSeconds**（*查询参数*）：integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy**（*查询参数*）：string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

#### 响应

200 ([Status](../common-definitions/status#status)): OK

202 ([Status](../common-definitions/status#status)): Accepted

### `deletecollection`：删除所有 ResourceInterpreterCustomization

#### HTTP 请求

DELETE /apis/config.karmada.io/v1alpha1/resourceinterpretercustomizations

#### 参数

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)


- **continue**（*查询参数*）：string

  [continue](../common-parameter/common-parameters#continue)

- **dryRun**（*查询参数*）：string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldSelector**（*查询参数*）：string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **gracePeriodSeconds**（*查询参数*）：integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **labelSelector**（*查询参数*）：string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit**（*查询参数*）：integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty**（*查询参数*）：string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy**（*查询参数*）：string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

- **resourceVersion**（*查询参数*）：string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch**（*查询参数*）：string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents**（*查询参数*）：boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds**（*查询参数*）：integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

#### 响应

200 ([Status](../common-definitions/status#status)): OK
