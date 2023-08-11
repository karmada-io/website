---
title: Customizing Resource Interpreter
---

## Resource Interpreter Framework

In the progress of propagating a resource from `karmada-apiserver` to member clusters, Karmada needs to know the 
resource definition. Take `Propagating Deployment` as an example, at the phase of building `ResourceBinding`, the 
`karmada-controller-manager` will parse the `replicas` from the deployment object.

For Kubernetes native resources, Karmada knows how to parse them, but for custom resources defined by `CRD`(or extended
by something like `aggregated-apiserver`), as lack of the knowledge of the resource structure, they can only be treated 
as normal resources. Therefore, the advanced scheduling algorithms cannot be used for them.

The [Resource Interpreter Framework][1] is designed for interpreting resource structure. It consists of `built-in` and 
`customized` interpreters:
- `built-in` interpreter: used for common Kubernetes native or well-known extended resources.
- `customized` interpreter: interprets custom resources or overrides the built-in interpreters.

> Note: The major difference between `built-in` and `customized` interpreters is that the `built-in` interpreter is 
> implemented and maintained by Karmada community and will be built into Karmada components, such as 
> `karmada-controller-manager`. On the contrary, the `customized` interpreter is implemented and maintained by users.
> It should be registered to Karmada as an `Interpreter Webhook` or `declarative configuration` (see [Customized Interpreter](#customized-interpreter) for more details).

### Interpreter Operations

When interpreting resources, we often get multiple pieces of information extracted. The `Interpreter Operations`
defines the interpreter request type, and the `Resource Interpreter Framework` provides services for each operation 
type. 

For all operations designed by `Resource Interpreter Framework`, please refer to [Interpreter Operations][2].

> Note: Not all the designed operations are supported (see below for supported operations).

> Note: At most one interpreter will be consulted to when interpreting a resource with specific `interpreter operation`
> and the `customized` interpreter has higher priority than `built-in` interpreter if they are both interpreting the same 
> resource. 
> For example, the `built-in` interpreter serves `InterpretReplica` for `Deployment` with version `apps/v1`. If there 
> is a customized interpreter registered to Karmada for interpreting the same resource, the `customized` interpreter wins and the 
> `built-in` interpreter will be ignored.

## Built-in Interpreter

For the common Kubernetes native or well-known extended resources, the interpreter operations are built-in, which means
the users usually don't need to implement customized interpreters. If you want more resources to be built-in,
please feel free to [file an issue][3] to let us know your user case.

The built-in interpreter now supports following interpreter operations:

### InterpretReplica

Supported resources:
- Deployment(apps/v1)
- StatefulSet(apps/v1)
- Job(batch/v1)

### ReviseReplica

Supported resources:
- Deployment(apps/v1)
- StatefulSet(apps/v1)
- Job(batch/v1)

### Retain

Supported resources:
- Pod(v1)
- Service(v1)
- ServiceAccount(v1)
- PersistentVolumeClaim(v1)
- PersistentVolume(V1)
- Job(batch/v1)

### AggregateStatus

Supported resources:
- Deployment(apps/v1)
- Service(v1)
- Ingress(networking.k8s.io/v1)
- Job(batch/v1)
- CronJob(batch/v1)
- DaemonSet(apps/v1)
- StatefulSet(apps/v1)
- Pod(v1)
- PersistentVolume(V1)
- PersistentVolumeClaim(v1)
- PodDisruptionBudget(policy/v1)

### InterpretStatus

Supported resources:
- Deployment(apps/v1)
- Service(v1)
- Ingress(networking.k8s.io/v1)
- Job(batch/v1)
- DaemonSet(apps/v1)
- StatefulSet(apps/v1)
- PodDisruptionBudget(policy/v1)

### InterpretDependency

Supported resources:
- Deployment(apps/v1)
- Job(batch/v1)
- CronJob(batch/v1)
- Pod(v1)
- DaemonSet(apps/v1)
- StatefulSet(apps/v1)
- Ingress(networking.k8s.io/v1)

### InterpretHealth

Supported resources:
- Deployment(apps/v1)
- StatefulSet(apps/v1)
- ReplicaSet(apps/v1)
- DaemonSet(apps/v1)
- Service(v1)
- Ingress(networking.k8s.io/v1)
- PersistentVolumeClaim(v1)
- PodDisruptionBudget(policy/v1)
- Pod(v1)

## Customized Interpreter

The customized interpreter is implemented and maintained by users, it can be extended in two ways, either by defining declarative configuration files or by running as webhook at runtime.

> Note: Decalrative configuration has a higher priority than webhook.

### Built-in Resource Declarative Configuration

Karmada bundles some popular and open-sourced resources so that users can save the effort to customize them. The configurable interpreter now supports following interpreter operations:

#### InterpretReplica

Supported resources:
- BroadcastJob(apps.kruise.io/v1alpha1)
- CloneSet(apps.kruise.io/v1alpha1)
- AdvancedStatefulSet(apps.kruise.io/v1beta1)
- Workflow(argoproj.io/v1alpha1)

#### ReviseReplica

Supported resources:
- BroadcastJob(apps.kruise.io/v1alpha1)
- CloneSet(apps.kruise.io/v1alpha1)
- AdvancedStatefulSet(apps.kruise.io/v1beta1)
- Workflow(argoproj.io/v1alpha1)

#### Retain

Supported resources:
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

Supported resources:
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

Supported resources:
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

Supported resources:
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

Supported resources:
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

### Declarative Configuration

#### What are interpreter declarative configuration?

Users can quickly customize resource interpreters for both Kubernetes resources and CR resources by the rules declaraed in the [ResourceInterpreterCustomization][4] API specification.

#### Write with configuration

You can configure resource interpretation rules by creating or updating [ResourceInterpreterCustomization][4] resource, the newest version supports the definition of lua scripts in the `ResourceInterpreterCustomization`. You can learn how to define the lua script in the API definition, take [retention][5] as an example.

Below we provide a yaml writing example of the ResourceInterpreterCustomization resource:

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
          if desiredObj.spec.template.spec.serviceAccountName ~= '' and desiredObj.spec.template.spec.serviceAccountName ~= 'default' then
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

#### Verify the configuration

Users can use the `karmadactl interpret` command to verify the `ResourceInterpreterCustomization` configuration before applying them to the system. Some examples are provided to help users better understand how this interpreter can be used, please refer to [examples][8].

### Webhook

#### What are interpreter webhooks?

Interpreter webhooks are HTTP callbacks that receive interpret requests and do something with them.

#### Write an interpreter webhook server

Please refer to the implementation of the [Example of Customize Interpreter][6] that is validated 
in Karmada E2E test. The webhook handles the `ResourceInterpreterRequest` request sent by the 
Karmada components (such as `karmada-controller-manager`), and sends back its decision as an 
`ResourceInterpreterResponse`.

#### Deploy the admission webhook service

The [Example of Customize Interpreter][6] is deployed in the host cluster for E2E and exposed by 
a service as the front-end of the webhook server.

You may also deploy your webhooks outside the cluster. You will need to update your webhook 
configurations accordingly.

#### Configure webhook on the fly

You can configure what resources and supported operations are subject to what interpreter webhook 
via [ResourceInterpreterWebhookConfiguration][7]. 

The following is an example `ResourceInterpreterWebhookConfiguration`:
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

You can config more than one webhook in a `ResourceInterpreterWebhookConfiguration`, each webhook
serves at least one operation.

### Write the ResourceInterpreterCustomization

You can learn how to write the `ResourceInterpreterCustomization` to customize your resource.

First, we introduce the kube library functions. Then, we introduce how to write `ResourceInterpreterCustomization` using `kyverno.io/v1/ClusterPolicy` as an [example][9].

#### build-in functions of luavm

The rules declared in the [ResourceInterpreterCustomization][4] API specification define `interpreter operations`. These operations are written by lua and called via luavm. Users can use luavm's built-in functions when writing `interpreter operations`.

In [kubeLibrary][10], there are two functions that are useful for writing interpreter operations. `accuratePodRequirements` is useful to write `ReplicaResource` operation and `getPodDependencies`is useful to write `DependencyInterpretation` operation.

The `accuratePodRequirements` function accurates total resource requirements for pod. Its argument is `PodTemplateSpec` and its return value is `ReplicaRequirements`. `PodTemplateSpec` describes the data a pod should have when created from a template, and `ReplicaRequirements` represents the requirements required by each replica.

The `getPodDependencies` function gets total dependencies from podTemplate and namespace. Its arguments are `PodTemplateSpec` and `namespace`. Its return value is `dependencies`. `PodTemplateSpec` describes the data a pod should have when created from a template. `namespace` is the namespace of customized resource. And `dependencies` are the resources on which the customized resources depend.

#### ReplicaResource

[ReplicaResource][11] describes the rules for Karmada to discover the resource's replica as well as resource requirements. It would be useful for those CRD resources that declare workload types like Deployment.

A Kyverno `ClusterPolicy` is a collection of rules, which doesn't have fields like `.spec.replicas` or `.spec.template.spec.nodeSelector`. So there is no need to implement `ReplicaResource` for `ClusterPolicy`.

#### ReplicaRevision

[ReplicaRevision][12] describes the rules for Karmada to revise the resource's replica. It would be useful for those CRD resources that declare workload types like Deployment.

A Kyverno `ClusterPolicy` is a collection of rules, which doesn't have field like `.spec.replicas`. So there is no need to implement `ReplicaRevision` for `ClusterPolicy`.

#### Retention

[Retention][13] describes the desired behavior that Karmada should react on the changes made by member cluster components. This avoids system running into a meaningless loop that Karmada resource controller and the member cluster component continually applying opposite values of a field.

A Kyverno `ClusterPolicy` is a collection of rules, which is usually not changed by member cluster components. So there is no need to implement `Retention` for `ClusterPolicy`.

#### StatusAggregation

[StatusAggregation][14] describes the rules for Karmada to aggregate status collected from member clusters to resource template.

A Kyverno `ClusterPolicy` is a collection of rules. Here we define the status aggregation rules for `ClusterPolicy`.

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

[StatusReflection][15] describes the rules for Karmada to pick the resource's status.

A Kyverno `ClusterPolicy` is a collection of rules, whose `.status` contains policy runtime data. `StatusReflection` determines which fields Karmada collect from the member clusters. Here we pick some fields from resouce in member cluster.

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

[HealthInterpretation][16] describes the health assessment rules by which Karmada can assess the health state of the resource type.

A Kyverno `ClusterPolicy` is a collection of rules. We determine whether the `ClusterPolicy` in member cluster is healthy by defining the health assessment rules.

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

[DependencyInterpretation][17] describes the rules for Karmada to analyze the dependent resources.

A Kyverno `ClusterPolicy` is a collection of rules, which doesn't depend on other resources. So there is no need to implement `DependencyInterpretation` for `ClusterPolicy`.

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
