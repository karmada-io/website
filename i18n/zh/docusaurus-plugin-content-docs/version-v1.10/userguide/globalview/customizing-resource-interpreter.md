---
title: 自定义资源解释器
---

## 资源解释器框架

在将资源从 `karmada-apiserver` 分发到成员集群的过程中，Karmada 可能需要了解资源的定义结构。以 `Propagating Deployment` 为例，在构建 `ResourceBinding` 的阶段，`karmada-controller-manager` 组件需要解析 deployment 资源的 `replicas` 字段。

对于 Kubernetes 原生资源来说，Karmada 知道如何解析它们，但是对于由 CRD 定义的资源（或是由聚合层方式注册）来说，由于缺乏对该资源结构信息的了解，它们将仅被当作普通资源来对待，因此，高级调度算法将不能应用于这些资源。

[Resource Interpreter Framework][1] 专为解释资源结构而设计，它包括两类解释器：
- `内置`解释器：用于解释常见的 Kubernetes 原生资源或一些知名的扩展资源；
- `自定义`解释器: 用于解释自定义资源或覆盖`内置`解释器。

> 注意：上述两类解释器之间的主要区别在于，`内置`解释器由 Karmada 社区实现并维护，并将其内置到 Karmada 组件中，例如 `karmada-controller-manager`。 相反，`自定义`解释器是由用户实现和维护的，它应该作为 `Interpreter Webhook` 或`声明式配置`注册到 Karmada（更多详细信息，请参考 [Customized Interpreter](#自定义解释器)）。

### 解释器操作

在解释资源时，我们经常会提取多条信息。Karmada 中定义了多种`解释器操作`，`资源解释器框架`为每个操作类型提供服务。

关于`资源解释器框架`定义的各种操作类型的具体含义，可以参考 [Interpreter Operations][2] 。

> 注意： 并非所有设计的操作类型均受支持（有关支持的操作，请参见下文）：

> 注意：在使用特定的`解释器操作`解释资源时，最多只会咨询一个解释器；对于同一个资源，`自定义`解释器比`内置`解释器具有更高的优先级。
> 例如，`内置`解释器为 `apps/v1` version 的 `Deployment` 提供 `InterpretReplica` 服务，如果有一个自定义解释器注册到 Karmada 来解释该资源，则`自定义`解释器获胜，`内置`解释器将被忽略。

## 内置解释器

对于常见的 Kubernetes 原生资源或一些知名的扩展资源来说，`解释器操作`是内置的，这意味着用户通常不需要实现自定义解释器。 如果你希望内置更多资源，请随时[提交问题][3] 让我们了解您的用户案例。

内置解释器现在支持以下`解释器操作`：

### InterpretReplica

支持资源：
- Deployment(apps/v1)
- StatefulSet(apps/v1)
- Job(batch/v1)
- Pod(v1)

### ReviseReplica

支持资源：
- Deployment(apps/v1)
- StatefulSet(apps/v1)
- Job(batch/v1)

### Retain

支持资源：
- Pod(v1)
- Service(v1)
- ServiceAccount(v1)
- PersistentVolumeClaim(v1)
- PersistentVolume(V1)
- Job(batch/v1)

### AggregateStatus

支持资源：
- Deployment(apps/v1)
- Service(v1)
- Ingress(networking.k8s.io/v1)
- CronJob(batch/v1)
- Job(batch/v1)
- DaemonSet(apps/v1)
- StatefulSet(apps/v1)
- Pod(v1)
- PersistentVolume(V1)
- PersistentVolumeClaim(v1)
- PodDisruptionBudget(policy/v1)

### InterpretStatus

支持资源：
- Deployment(apps/v1)
- Service(v1)
- Ingress(networking.k8s.io/v1)
- Job(batch/v1)
- DaemonSet(apps/v1)
- StatefulSet(apps/v1)
- PodDisruptionBudget(policy/v1)

### InterpretDependency

支持资源：
- Deployment(apps/v1)
- Job(batch/v1)
- CronJob(batch/v1)
- Pod(v1)
- DaemonSet(apps/v1)
- StatefulSet(apps/v1)
- Ingress(networking.k8s.io/v1)

### InterpretHealth

支持资源：
- Deployment(apps/v1)
- StatefulSet(apps/v1)
- ReplicaSet(apps/v1)
- DaemonSet(apps/v1)
- Service(v1)
- Ingress(networking.k8s.io/v1)
- PersistentVolumeClaim(v1)
- PodDisruptionBudget(policy/v1)
- Pod(v1)

## 自定义解释器

自定义解释器由用户实现和维护，它可以通过两种方式扩展，通过定义声明式配置文件或在运行时作为 webhook 运行。

> 注意：声明式配置比 webhook 有更高的优先级，即用户如果同时注册了这两种解释方式，将优先应用相应资源的声明式配置

### 内置资源声明性配置

Karmada捆绑了一些流行、开源的资源，以便用户可以直接使用。声明式配置的解释器现在支持以下`解释器操作`：

#### InterpretReplica

支持资源：
- BroadcastJob(apps.kruise.io/v1alpha1)
- CloneSet(apps.kruise.io/v1alpha1)
- AdvancedStatefulSet(apps.kruise.io/v1beta1)
- Workflow(argoproj.io/v1alpha1)

#### ReviseReplica

支持资源：
- BroadcastJob(apps.kruise.io/v1alpha1)
- CloneSet(apps.kruise.io/v1alpha1)
- AdvancedStatefulSet(apps.kruise.io/v1beta1)
- Workflow(argoproj.io/v1alpha1)

#### Retain

支持资源：
- BroadcastJob(apps.kruise.io/v1alpha1)
- Workflow(argoproj.io/v1alpha1)
- HelmRelease(helm.toolkit.fluxcd.io/v2beta1)
- Kustomization(kustomize.toolkit.fluxcd.io/v1)
- GitRepository(source.toolkit.fluxcd.io/v1)
- Bucket(source.toolkit.fluxcd.io/v1beta2)
- HelmChart(source.toolkit.fluxcd.io/v1beta2)
- HelmRepository(source.toolkit.fluxcd.io/v1beta2)
- OCIRepository(source.toolkit.fluxcd.io/v1beta2)

#### AggregateStatus

支持资源：
- AdvancedCronJob(apps.kruise.io/v1alpha1)
- AdvancedDaemonSet(apps.kruise.io/v1alpha1)
- BroadcastJob(apps.kruise.io/v1alpha1)
- CloneSet(apps.kruise.io/v1alpha1)
- AdvancedStatefulSet(apps.kruise.io/v1beta1)
- HelmRelease(helm.toolkit.fluxcd.io/v2beta1)
- Kustomization(kustomize.toolkit.fluxcd.io/v1)
- ClusterPolicy(kyverno.io/v1)
- Policy(kyverno.io/v1)
- GitRepository(source.toolkit.fluxcd.io/v1)
- Bucket(source.toolkit.fluxcd.io/v1beta2)
- HelmChart(source.toolkit.fluxcd.io/v1beta2)
- HelmRepository(source.toolkit.fluxcd.io/v1beta2)
- OCIRepository(source.toolkit.fluxcd.io/v1beta2)

#### InterpretStatus

支持资源：
- AdvancedDaemonSet(apps.kruise.io/v1alpha1)
- BroadcastJob(apps.kruise.io/v1alpha1)
- CloneSet(apps.kruise.io/v1alpha1)
- AdvancedStatefulSet(apps.kruise.io/v1beta1)
- HelmRelease(helm.toolkit.fluxcd.io/v2beta1)
- Kustomization(kustomize.toolkit.fluxcd.io/v1)
- ClusterPolicy(kyverno.io/v1)
- Policy(kyverno.io/v1)
- GitRepository(source.toolkit.fluxcd.io/v1)
- Bucket(source.toolkit.fluxcd.io/v1beta2)
- HelmChart(source.toolkit.fluxcd.io/v1beta2)
- HelmRepository(source.toolkit.fluxcd.io/v1beta2)
- OCIRepository(source.toolkit.fluxcd.io/v1beta2)

#### InterpretDependency

支持资源：
- AdvancedCronJob(apps.kruise.io/v1alpha1)
- AdvancedDaemonSet(apps.kruise.io/v1alpha1)
- BroadcastJob(apps.kruise.io/v1alpha1)
- CloneSet(apps.kruise.io/v1alpha1)
- AdvancedStatefulSet(apps.kruise.io/v1beta1)
- Workflow(argoproj.io/v1alpha1)
- HelmRelease(helm.toolkit.fluxcd.io/v2beta1)
- Kustomization(kustomize.toolkit.fluxcd.io/v1)
- GitRepository(source.toolkit.fluxcd.io/v1)
- Bucket(source.toolkit.fluxcd.io/v1beta2)
- HelmChart(source.toolkit.fluxcd.io/v1beta2)
- HelmRepository(source.toolkit.fluxcd.io/v1beta2)
- OCIRepository(source.toolkit.fluxcd.io/v1beta2)

#### InterpretHealth

支持资源：
- AdvancedCronJob(apps.kruise.io/v1alpha1)
- AdvancedDaemonSet(apps.kruise.io/v1alpha1)
- BroadcastJob(apps.kruise.io/v1alpha1)
- CloneSet(apps.kruise.io/v1alpha1)
- AdvancedStatefulSet(apps.kruise.io/v1beta1)
- Workflow(argoproj.io/v1alpha1)
- HelmRelease(helm.toolkit.fluxcd.io/v2beta1)
- Kustomization(kustomize.toolkit.fluxcd.io/v1)
- ClusterPolicy(kyverno.io/v1)
- Policy(kyverno.io/v1)
- GitRepository(source.toolkit.fluxcd.io/v1)
- Bucket(source.toolkit.fluxcd.io/v1beta2)
- HelmChart(source.toolkit.fluxcd.io/v1beta2)
- HelmRepository(source.toolkit.fluxcd.io/v1beta2)
- OCIRepository(source.toolkit.fluxcd.io/v1beta2)

### 声明式配置

#### 什么是解释器声明式配置？

用户可以通过 [ResourceInterpreterCustomization][4] API 规范中声明的规则，快速为 Kubernetes 原生资源和 CR 资源自定义资源解释器。

#### 配置编写

你可以通过创建或更新 [ResourceInterpreterCustomization][4] 资源来配置资源解释规则，当前支持在 ResourceInterpreterCustomization 中定义 lua 脚本。 你可以在 API 定义中学习如何定义 lua 脚本，以 [retention][5] 为例。

下面我们提供一个ResourceInterpreterCustomization资源的yaml编写示例：

<details>
<summary>resource-interpreter-customization.yaml</summary>

```yaml
apiVersion: config.karmada.io/v1alpha1
kind: ResourceInterpreterCustomization
metadata:
  name: declarative-configuration-example
spec:
  target:
    apiVersion: apps/v1
    kind: Deployment
  customizations:
    replicaResource:
      luaScript: >
        local kube = require("kube")
        function GetReplicas(obj)
          replica = obj.spec.replicas
          requirement = kube.accuratePodRequirements(obj.spec.template)
          return replica, requirement
        end
    replicaRevision:
      luaScript: >
        function ReviseReplica(obj, desiredReplica)
          obj.spec.replicas = desiredReplica
          return obj
        end
    retention:
      luaScript: >
        function Retain(desiredObj, observedObj)
          desiredObj.spec.paused = observedObj.spec.paused
          return desiredObj
        end
    statusAggregation:
      luaScript: >
        function AggregateStatus(desiredObj, statusItems)
          if statusItems == nil then
            return desiredObj
          end
          if desiredObj.status == nil then
            desiredObj.status = {}
          end
          replicas = 0
          for i = 1, #statusItems do
            if statusItems[i].status ~= nil and statusItems[i].status.replicas ~= nil then
              replicas = replicas + statusItems[i].status.replicas
            end
          end
          desiredObj.status.replicas = replicas
          return desiredObj
        end
    statusReflection:
      luaScript: >
        function ReflectStatus (observedObj)
          return observedObj.status
        end
    healthInterpretation:
      luaScript: >
        function InterpretHealth(observedObj)
          return observedObj.status.readyReplicas == observedObj.spec.replicas
        end
    dependencyInterpretation:
      luaScript: >
        function GetDependencies(desiredObj)
          dependentSas = {}
          refs = {}
          if desiredObj.spec.template.spec.serviceAccountName ~= nil and desiredObj.spec.template.spec.serviceAccountName ~= 'default' then
            dependentSas[desiredObj.spec.template.spec.serviceAccountName] = true
          end
          local idx = 1
          for key, value in pairs(dependentSas) do
            dependObj = {}
            dependObj.apiVersion = 'v1'
            dependObj.kind = 'ServiceAccount'
            dependObj.name = key
            dependObj.namespace = desiredObj.metadata.namespace
            refs[idx] = dependObj
            idx = idx + 1
          end
          return refs
        end
```
</details>

#### 配置验证

你可以使用 `karmadactl interpret` 命令在将 `ResourceInterpreterCustomization` 配置应用到系统之前来验证该配置的正确性。我们提供了一些示例来帮助用户更好的理解如何使用该验证工具，请参考 [examples][8] 。

### Webhook

#### 什么是解释器 webhook？

解释器 webhook 是一种 HTTP 回调，它接收解释请求并对其进行处理。

#### 编写一个解释器 webhook 服务器

请参考 [Example of Customize Interpreter][6] 的实现，我们在 Karmada E2E 测试中使用该方式进行了验证。webhook 将处理 Karmada 组件（例如 karmada-controller-manager）发送的 ResourceInterpreterRequest 请求，处理完成后将处理结果以 ResourceInterpreterResponse 为形式返回。

#### 部署 admission webhook 服务

在 E2E 测试环境中， [Customize Interpreter示例][6] 部署在 host 集群上，由 service 暴露为 webhook 服务器前端。

你也可以在集群外部署你的 webhooks，并记得更新你的 webhook 配置。

#### 即时配置 webhook

你可以通过 [ResourceInterpreterWebhookConfiguration][7] 来配置哪些资源和`解释器操作`受 webhook 的约束。

下面提供了一个 `ResourceInterpreterWebhookConfiguration` 的配置示例：

```yaml
apiVersion: config.karmada.io/v1alpha1
kind: ResourceInterpreterWebhookConfiguration
metadata:
  name: examples
webhooks:
  - name: workloads.example.com
    rules:
      - operations: [ "InterpretReplica","ReviseReplica","Retain","AggregateStatus" ]
        apiGroups: [ "workload.example.io" ]
        apiVersions: [ "v1alpha1" ]
        kinds: [ "Workload" ]
    clientConfig:
      url: https://karmada-interpreter-webhook-example.karmada-system.svc:443/interpreter-workload
      caBundle: {{caBundle}}
    interpreterContextVersions: [ "v1alpha1" ]
    timeoutSeconds: 3
```

你可以在 ResourceInterpreterWebhookConfiguration 中配置多个 webhook，每个 webhook 至少服务于一个`解释器操作`。

### 编写 ResourceInterpreterCustomization

你可以学习如何编写 [ResourceInterpreterCustomization][4] 来定制你的资源。

首先，我们介绍kube库函数。然后，我们以 `kyverno.io/v1/ClusterPolicy` 为[例][9]，介绍如何编写 `ResourceInterpreterCustomization`。

#### luavm 的内置函数

[ResourceInterpreterCustomization][4] API 规范中声明的规则定义了`解释器操作`。这些操作由 lua 编写，并通过 luavm 调用。用户在编写`解释器操作`时，可以使用 luavm 的内置函数。

在 [kubeLibrary][9] 中，有两个函数可用于编写解释器操作：`accuratePodRequirements` 和 `getPodDependencies`。`accuratePodRequirements`有助于编写`ReplicaResource`操作，`getPodDependencies`有助于编写`DependencyInterpretation`操作。

`accuratePodRequirements` 函数功能是获取 pod 的总资源需求。它的参数是`PodTemplateSpec`，返回值是 `ReplicaRequirements`。`PodTemplateSpec`描述了一个pod在从模板创建时应该有的数据，`ReplicaRequirements` 表示每个副本的需求。

`getPodDependencies`函数功能是从podTemplate和namespace中获取所有依赖。它的参数是`PodTemplateSpec`和`namespace`。它的返回值是`dependencies`。`PodTemplateSpec`描述了一个pod在从模板创建时应该有的数据。`namespace`是定制资源的命名空间。而`dependencies`是定制资源所依赖的资源。

#### ReplicaResource

[ReplicaResource][11] 描述了Karmada发现资源的副本以及资源需求的规则。它用于那些声明式工作负载类型（如 Deployment）的CRD资源。

Kyverno的`ClusterPolicy`是一个规则的集合，它没有`.spec.replicas`或`.spec.template.spec.nodeSelector`这样的字段。因此这里不需要为`ClusterPolicy`实现`ReplicaResource`操作。

#### ReplicaRevision

[ReplicaRevision][12] 描述了Karmada修改资源副本的规则。它用于那些声明式工作负载类型（如 Deployment）的CRD资源。

Kyverno的`ClusterPolicy`是一个规则的集合，它没有`.spec.replicas`这样的字段。因此这里不需要为`ClusterPolicy`实现`ReplicaRevision`操作。

#### Retention

[Retention][13] 描述了Karmada对成员集群组件的变化做出反应的所希望的行为。这可以避免系统进入一个无意义的循环，即Karmada资源控制器和成员集群组件，用不同的值不断应用于资源的同一个字段。

Kyverno的`ClusterPolicy`是一个规则的集合，通常不会被成员集群中的组件改变。因此这里不需要为`ClusterPolicy`实现`Retention`操作。

#### StatusAggregation

[StatusAggregation][14]描述了Karmada将从成员集群收集的状态汇总到资源模板的规则。

Kyverno的`ClusterPolicy`是一个规则的集合。这里我们定义了`ClusterPolicy`的状态聚合规则。

<details>
<summary>StatusAggregation-Defined-In-ResourceInterpreterCustomization</summary>

```yaml
statusAggregation:
  luaScript: >
    function AggregateStatus(desiredObj, statusItems)
      if statusItems == nil then
        return desiredObj
      end
      desiredObj.status = {}
      desiredObj.status.conditions = {}
      rulecount = {}
      rulecount.validate = 0
      rulecount.generate = 0
      rulecount.mutate = 0
      rulecount.verifyimages = 0
      conditions = {}
      local conditionsIndex = 1
      for i = 1, #statusItems do
        if statusItems[i].status ~= nil and statusItems[i].status.autogen ~= nil then
          desiredObj.status.autogen = statusItems[i].status.autogen
        end
        if statusItems[i].status ~= nil and statusItems[i].status.ready ~= nil then
          desiredObj.status.ready = statusItems[i].status.ready
        end                        
        if statusItems[i].status ~= nil and statusItems[i].status.rulecount ~= nil then
          rulecount.validate = rulecount.validate + statusItems[i].status.rulecount.validate
          rulecount.generate = rulecount.generate + statusItems[i].status.rulecount.generate
          rulecount.mutate = rulecount.mutate + statusItems[i].status.rulecount.mutate
          rulecount.verifyimages = rulecount.verifyimages + statusItems[i].status.rulecount.verifyimages
        end
        if statusItems[i].status ~= nil and statusItems[i].status.conditions ~= nil then
          for conditionIndex = 1, #statusItems[i].status.conditions do
            statusItems[i].status.conditions[conditionIndex].message = statusItems[i].clusterName..'='..statusItems[i].status.conditions[conditionIndex].message
            hasCondition = false
            for index = 1, #conditions do
              if conditions[index].type == statusItems[i].status.conditions[conditionIndex].type and conditions[index].status == statusItems[i].status.conditions[conditionIndex].status and conditions[index].reason == statusItems[i].status.conditions[conditionIndex].reason then
                conditions[index].message = conditions[index].message..', '..statusItems[i].status.conditions[conditionIndex].message
                hasCondition = true
                break
              end
            end
            if not hasCondition then
              conditions[conditionsIndex] = statusItems[i].status.conditions[conditionIndex]
              conditionsIndex = conditionsIndex + 1                  
            end
          end
        end
      end
      desiredObj.status.rulecount = rulecount
      desiredObj.status.conditions = conditions
      return desiredObj
    end
```

</details>

#### StatusReflection

[StatusReflection][15] 描述了Karmada挑选资源状态的规则。

Kyverno的`ClusterPolicy`是一个规则的集合，其`.status`包含运行时数据。`StatusReflection`决定了Karmada从成员集群中收集哪些字段。这里我们从成员集群的资源中挑选了一些字段。

<details>
<summary>StatusReflection-Defined-In-ResourceInterpreterCustomization</summary>

```yaml
statusReflection:
  luaScript: >
    function ReflectStatus (observedObj)
      status = {}
      if observedObj == nil or observedObj.status == nil then 
        return status
      end
      status.ready = observedObj.status.ready
      status.conditions = observedObj.status.conditions
      status.autogen = observedObj.status.autogen
      status.rulecount = observedObj.status.rulecount
      return status
    end
```

</details>

#### HealthInterpretation

[HealthInterpretation][16] 描述了健康评估规则，Karmada可以通过这些规则评估资源类型的健康状态。

Kyverno的`ClusterPolicy`是一个规则的集合。我们通过定义健康评估规则来确定成员集群中的`ClusterPolicy`是否健康。

<details>
<summary>HealthInterpretation-Defined-In-ResourceInterpreterCustomization</summary>

```yaml
healthInterpretation:
  luaScript: >
    function InterpretHealth(observedObj)
      if observedObj.status ~= nil and observedObj.status.ready ~= nil then
        return observedObj.status.ready
      end
      if observedObj.status ~= nil and observedObj.status.conditions ~= nil then
        for conditionIndex = 1, #observedObj.status.conditions do
          if observedObj.status.conditions[conditionIndex].type == 'Ready' and observedObj.status.conditions[conditionIndex].status == 'True' and observedObj.status.conditions[conditionIndex].reason == 'Succeeded' then
            return true
          end
        end
      end
      return false
    end
```

</details>

#### DependencyInterpretation

[DependencyInterpretation][17] 描述了Karmada分析依赖资源的规则。

Kyverno的`ClusterPolicy`是一个规则的集合，它不依赖于其他资源。因此这里不需要为`ClusterPolicy`实现`DependencyInterpretation`操作。

[1]: https://github.com/karmada-io/karmada/tree/master/docs/proposals/resource-interpreter-webhook
[2]: https://github.com/karmada-io/karmada/blob/84b971a501ba82c53a5ad455c2fe84d842cd7d4e/pkg/apis/config/v1alpha1/resourceinterpreterwebhook_types.go#L85-L119
[3]: https://github.com/karmada-io/karmada/issues/new?assignees=&labels=kind%2Ffeature&template=enhancement.md
[4]: https://github.com/karmada-io/karmada/blob/84b971a501ba82c53a5ad455c2fe84d842cd7d4e/pkg/apis/config/v1alpha1/resourceinterpretercustomization_types.go#L17
[5]: https://github.com/karmada-io/karmada/blob/84b971a501ba82c53a5ad455c2fe84d842cd7d4e/pkg/apis/config/v1alpha1/resourceinterpretercustomization_types.go#L108-L134
[6]: https://github.com/karmada-io/karmada/tree/master/examples/customresourceinterpreter
[7]: https://github.com/karmada-io/karmada/blob/master/pkg/apis/config/v1alpha1/resourceinterpreterwebhook_types.go#L16
[8]: ../../reference/karmadactl/karmadactl-usage-conventions.md#karmadactl-interpret
[9]: https://github.com/karmada-io/karmada/blob/master/pkg/resourceinterpreter/default/thirdparty/resourcecustomizations/kyverno.io/v1/ClusterPolicy/customizations.yaml
[10]: https://github.com/karmada-io/karmada/blob/master/pkg/resourceinterpreter/customized/declarative/luavm/kube.go#L16-L33
[11]: https://github.com/karmada-io/karmada/blob/master/pkg/apis/config/v1alpha1/resourceinterpretercustomization_types.go#L60-L68
[12]: https://github.com/karmada-io/karmada/blob/master/pkg/apis/config/v1alpha1/resourceinterpretercustomization_types.go#L70-L77
[13]: https://github.com/karmada-io/karmada/blob/master/pkg/apis/config/v1alpha1/resourceinterpretercustomization_types.go#L50-L58
[14]: https://github.com/karmada-io/karmada/blob/master/pkg/apis/config/v1alpha1/resourceinterpretercustomization_types.go#L86-L92
[15]: https://github.com/karmada-io/karmada/blob/master/pkg/apis/config/v1alpha1/resourceinterpretercustomization_types.go#L79-L84
[16]: https://github.com/karmada-io/karmada/blob/master/pkg/apis/config/v1alpha1/resourceinterpretercustomization_types.go#L94-L97
[17]: https://github.com/karmada-io/karmada/blob/master/pkg/apis/config/v1alpha1/resourceinterpretercustomization_types.go#L99-L105

## 注意事项

### 使用 Retain 解释器解决控制面与成员集群的控制权冲突

问题：Retain是在Karmada控制面与成员集群同时具备对成员集群资源控制权时，用户可自定义的用于解决控制权冲突的解释器。
一个典型的场景是当成员集群 Deployment 的副本数同时被控制面资源模版和成员集群 HPA 控制时，
两者无限次来回修改成员集群 Deployment 的副本数，导致成员集群的 Deployment 状态会出现异常。

解决措施：
* 针对您的工作负载类资源实现相应的 Retain 解释器，决策什么场景下该响应控制面资源模版的修改，什么场景下该响应成员集群 HPA 的修改。
  目前 Karmada 只针对 Deployment 资源实现了相应的 Retain 解释器，具体实现方式为：如果资源模板有 `resourcetemplate.karmada.io/retain-replicas` 的 label，
  就由成员集群 HPA 控制，否则就由控制面资源模板控制（在显式开启 `hpaReplicasSyncer` 控制器情况下，Karmada 可以自动为启用 HPA 的 Deployment 标记该 label）。
  如果您需要针对其他资源或自定义的 CRD 资源解决该冲突问题，可参考 Deployment 的 Retain 方案。 
* 如果您期望更优雅并彻底地解决上述问题，我们更推荐您将 HPA 更换为 [FederatedHPA](../../userguide/autoscaling/federatedhpa.md)。
