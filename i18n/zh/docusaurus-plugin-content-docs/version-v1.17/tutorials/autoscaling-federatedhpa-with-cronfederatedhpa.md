---
title: 使用CronFederatedHPA自动伸缩FederatedHPA
---

在Karmada中，CronFederatedHPA用于伸缩工作负载的副本数（任何具有scale子资源的工作负载，如Deployment）或FederatedHPA的 minReplicas/maxReplicas，目的是提前伸缩业务以满足突发的负载峰值。

CronFederatedHPA旨在在特定时间内扩展资源。当工作负载仅由CronFederatedHPA直接进行扩展时，在到达指定的时间为止，其副本将保持不变。这意味着直到指定时间之前，它失去了处理更多请求的能力。  
因此，为了确保工作负载可以提前扩容以满足后续高峰负载和后续实时业务需求，我们建议首先使用CronFederatedHPA来伸缩FederatedHPA。然后，FederatedHPA可以根据其度量标准来伸缩工作负载的规模。

本文档将为您提供一个示例，演示如何将 CronFederatedHPA 应用于 FederatedHPA。

## 前提条件

### Karmada 已安装

您可以参考 [快速入门](https://github.com/karmada-io/karmada#quick-start) 安装 Karmada，或直接运行 `hack/local-up-karmada.sh` 脚本，该脚本也用于运行 E2E 测试。

## 在 `member1` 和 `member2` 集群中部署 Deployment

我们需要在 member1 和 member2 集群中部署 Deployment（2 个副本）：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  replicas: 2
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
        resources:
          requests:
            cpu: 25m
            memory: 64Mi
          limits:
            cpu: 25m
            memory: 64Mi
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
    replicaScheduling:
      replicaDivisionPreference: Weighted
      replicaSchedulingType: Divided
      weightPreference:
        staticWeightList:
          - targetCluster:
              clusterNames:
                - member1
            weight: 1
          - targetCluster:
              clusterNames:
                - member2
            weight: 1
```

部署完成后，您可以检查已创建的 pods：
```sh
$ karmadactl get pods
NAME                     CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-777bc7b6d7-cmt6k   member1   1/1     Running   0          27m
nginx-777bc7b6d7-8lmcg   member2   1/1     Running   0          27m
```

## 在 Karmada 控制平面中部署 FederatedHPA

让我们在Karmada控制平面中创建一个FederatedHPA，用来管理跨集群的nginx deployment：
```yaml
apiVersion: autoscaling.karmada.io/v1alpha1
kind: FederatedHPA
metadata:
  name: nginx-fhpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx
  minReplicas: 1
  maxReplicas: 10
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 10
    scaleUp:
      stabilizationWindowSeconds: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 80
```
FederatedHPA会在平均CPU利用率超过80%时扩容工作负载的副本。相反，如果平均CPU利用率低于80%，则会缩容工作负载的副本数量。

## 在 Karmada 控制平面中部署CronFederatedHPA

为了自动伸缩FederatedHPA的minReplicas，让我们在Karmada控制平面中创建CronFederatedHPA：

```yaml
apiVersion: autoscaling.karmada.io/v1alpha1
kind: CronFederatedHPA
metadata:
  name: nginx-cronfhpa
  namespace: default
spec:
   scaleTargetRef:
      apiVersion: autoscaling.karmada.io/v1alpha1
      kind: FederatedHPA
      name: nginx-fhpa
   rules:
   - name: "scale-up"
     schedule: "*/1 * * * *"
     targetMinReplicas: 5
```

`spec.schedule` 遵循以下格式：
```
# ┌───────────── minute (0 - 59)
# │ ┌───────────── hour (0 - 23)
# │ │ ┌───────────── day of the month (1 - 31)
# │ │ │ ┌───────────── month (1 - 12)
# │ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday;
# │ │ │ │ │                                   7 is also Sunday on some systems)
# │ │ │ │ │                                   OR sun, mon, tue, wed, thu, fri, sat
# │ │ │ │ │
# * * * * *
```
表达式 `*/1 * * * *` 表示每分钟将FederatedHPA的minReplicas更新为5。此操作能确保工作负载会被扩容到至少5个副本，以处理突发流量洪峰。

## 测试扩容功能

等待一分钟后，FederatedHPA的minReplicas会被CronFederatedHPA更新为5，此操作会触发 nginx deployment 的副本数被扩容为5。检查Pod的数量，看副本是否已扩容：
```sh
$ karmadactl get po
NAME                     CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-777bc7b6d7-7vl2r   member1   1/1     Running   0          59s
nginx-777bc7b6d7-cmt6k   member1   1/1     Running   0          27m
nginx-777bc7b6d7-pc5dk   member1   1/1     Running   0          59s
nginx-777bc7b6d7-8lmcg   member2   1/1     Running   0          27m
nginx-777bc7b6d7-pghl7   member2   1/1     Running   0          59s
```

如果业务需求需要更多副本，FederatedHPA将根据指标（例如CPU利用率）自动伸缩副本数。

通过检查CronFederatedHPA的状态字段，您可以查看伸缩历史记录：
```yaml
apiVersion: autoscaling.karmada.io/v1alpha1
kind: CronFederatedHPA
metadata:
  name: nginx-cronfhpa
  namespace: default
spec:
  rules:
  - failedHistoryLimit: 3
    name: scale-up
    schedule: '*/1 * * * *'
    successfulHistoryLimit: 3
    suspend: false
    targetMinReplicas: 5
  scaleTargetRef:
    apiVersion: autoscaling.karmada.io/v1alpha1
    kind: FederatedHPA
    name: nginx-fhpa
status:
  executionHistories:
  - nextExecutionTime: "2023-07-29T07:53:00Z"  # 下一次执行时间
    ruleName: scale-up
    successfulExecutions:
    - appliedMinReplicas: 5                    # CronFederatedHPA将 minReplicas 更新为5
      executionTime: "2023-07-29T07:52:00Z"    # 上一次实际执行时间
      scheduleTime: "2023-07-29T07:52:00Z"     # 上一次期待执行时间
```
伸缩历史包括成功和失败操作的信息。
