---
title: 使用CronFederatedHPA自动伸缩跨集群Deployment
---

在Karmada中，CronFederatedHPA 负责扩展工作负载（如Deployments）的副本或 FederatedHPA 的 minReplicas/maxReplicas。其目的是为了主动扩展业务，以处理突发的负载峰值。

本文提供了一个示例，说明如何为跨集群部署 nginx deployment 启用CronFederatedHPA。

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
nginx-777bc7b6d7-rmmzv   member1   1/1     Running   0          104s
nginx-777bc7b6d7-9gf7g   member2   1/1     Running   0          104s
```

## 在 Karmada 控制平面部署 CronFederatedHPA

然后，在 Karmada 控制平面中部署 CronFederatedHPA，以扩容 Deployment：
```yaml
apiVersion: autoscaling.karmada.io/v1alpha1
kind: CronFederatedHPA
metadata:
  name: nginx-cronfhpa
  namespace: default
spec:
   scaleTargetRef:
      apiVersion: apps/v1
      kind: Deployment
      name: nginx
   rules:
   - name: "scale-up"
     schedule: "*/1 * * * *"
     targetReplicas: 5
     suspend: false
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
表达式`*/1 * * * *`的意思是nginx deployment的副本应该每分钟更新为5个，确保了处理接下来的流量突发流量洪峰。

## 测试伸缩功能

一分钟后，通过CronFederatedHPA将nginx部署的副本扩展到5个。现在让我们检查Pod的数量，以验证是否按预期进行了扩展：
```sh
$ karmadactl get pods
NAME                     CLUSTER   READY   STATUS              RESTARTS   AGE
nginx-777bc7b6d7-8v9b4   member2   1/1     Running             0          18s
nginx-777bc7b6d7-9gf7g   member2   1/1     Running             0          8m2s
nginx-777bc7b6d7-5snhz   member1   1/1     Running             0          18s
nginx-777bc7b6d7-rmmzv   member1   1/1     Running             0          8m2s
nginx-777bc7b6d7-z9kwg   member1   1/1     Running             0          18s
```

通过检查 CronFederatedHPA 的状态字段，您可以访问扩展历史记录：
```yaml
$ kubectl --kubeconfig $HOME/.kube/karmada.config --context karmada-apiserver get cronfhpa -oyaml
-> # kubectl --kubeconfig $HOME/.kube/karmada.config --context karmada-apiserver get cronfhpa/nginx-cronfhpa -oyaml
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
    targetReplicas: 5
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx
status:
  executionHistories:
  - nextExecutionTime: "2023-07-29T03:27:00Z"  # 下一次执行时间
    ruleName: scale-up
    successfulExecutions:
    - appliedReplicas: 5                       # CronFederatedHPA将replicas更新为5
      executionTime: "2023-07-29T03:26:00Z"    # 上一次实际执行时间
      scheduleTime: "2023-07-29T03:26:00Z"     # 上一次期待执行时间
```
伸缩历史包括成功和失败操作的信息。
