---
title: Karmadactl Usage Conventions
---

Recommended usage conventions for `karmadactl`.

## karmadactl interpret

### Preparation for YAML file

<details>
<summary>observed-deploy-nginx.yaml</summary>

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  replicas: 3
  paused: true
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - image: nginx
        name: nginx
status:
  availableReplicas: 2
  observedGeneration: 1
  readyReplicas: 2
  replicas: 2
  updatedReplicas: 2
```
</details>

<details>
<summary>desired-deploy-nginx.yaml</summary>

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  replicas: 3
  paused: false
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - image: nginx
        name: nginx
      serviceAccountName: test-sa
```
</details>

<details>
<summary>resourceinterpretercustomization.yaml</summary>

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
        function GetReplicas(obj)
          replica = obj.spec.replicas
          requirement = {}
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

<details>
<summary>status-file.yaml</summary>

```yaml
applied: true
clusterName: member1
health: Healthy
status:
  availableReplicas: 1
  readyReplicas: 1
  replicas: 1
  updatedReplicas: 1
---
applied: true
clusterName: member2
health: Healthy
status:
  availableReplicas: 1
  readyReplicas: 1
  replicas: 1
  updatedReplicas: 1
```
</details>

## Validate the ResourceInterpreterCustomization configuration

```shell
karmadactl interpret -f resourceinterpretercustomization.yaml --check
```

## Execute the ResourceInterpreterCustomization with operation

### Execute the InterpretReplica rule

```shell
karmadactl interpret -f resourceinterpretercustomization.yaml --observed-file observed-deploy-nginx.yaml --operation=InterpretReplica
```

### Execute the Retain rule

```shell
karmadactl interpret -f resourceinterpretercustomization.yaml --desired-file desired-deploy-nginx.yaml --observed-file observed-deploy-nginx.yaml --operation Retain
```

### Execute the ReviseReplica rule

```shell
karmadactl interpret -f resourceinterpretercustomization.yaml --desired-replica 3 --observed-file observed-deploy-nginx.yaml --operation ReviseReplica
```

### Execute the InterpretStatus rule

```shell
karmadactl interpret -f resourceinterpretercustomization.yaml --observed-file observed-deploy-nginx.yaml --operation InterpretStatus
```

### Execute the InterpretHealth rule

```shell
karmadactl interpret -f resourceinterpretercustomization.yaml --observed-file observed-deploy-nginx.yaml --operation InterpretHealth
```

### Execute the InterpretDependency rule

```shell
karmadactl interpret -f resourceinterpretercustomization.yaml --desired-file desired-deploy-nginx.yaml --operation InterpretDependency
```

### Execute the AggregateStatus rule

```shell
karmadactl interpret -f resourceinterpretercustomization.yaml --desired-file desired-deploy-nginx.yaml --operation AggregateStatus --status-file status-file.yaml
```
