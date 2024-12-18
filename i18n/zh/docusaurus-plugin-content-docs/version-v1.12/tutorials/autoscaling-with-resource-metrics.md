---
title: 使用资源指标跨集群弹性扩缩容
---
在 Karmada 中，为了自动扩展工作负载以满足需求，FederatedHPA 会跨多个集群扩/缩容工作负载。

当负载增加时，如果 Pod 数量低于配置的最大值，FederatedHPA 会扩容工作负载（Deployment、StatefulSet 或其他类似资源）的副本。当负载减少时，如果 Pod 数量高于配置的最小值，FederatedHPA 会缩容工作负载的副本。

本文档将引导您完成这样一个案例：启用 FederatedHPA 来自动扩缩容跨集群部署的 nginx。

演示案例将执行以下操作：

![federatedhpa-demo](../resources/tutorials/federatedhpa-demo.png)

* `member1` 集群中存在一个 Deployment 的 Pod。
* Service 部署在 `member1` 和 `member2` 集群。
* 请求多集群 Service 来提高 Pod 的 CPU 使用率。
* Pod 副本将在 `member1` 和 `member2` 集群中扩容。

## 前提条件

### Karmada 已安装

您可以参考[快速入门](https://github.com/karmada-io/karmada#quick-start)安装 Karmada，或直接运行 `hack/local-up-karmada.sh` 脚本，该脚本也用于运行 E2E 测试。

### 成员集群网络

确保至少已有两个集群加入 Karmada，并且成员集群之间的容器网络已连通。

- 如果您使用 `hack/local-up-karmada.sh` 脚本部署 Karmada，Karmada 中会有 3 个成员集群，并且集群 `member1` 和 `member2` 间的容器网络已连通。
- 您可以使用 `Submariner` 或其他相关开源项目来连接成员集群之间的网络。

> 注意：为了防止路由冲突，集群中 Pod 和 Service 的 CIDR 必须互不重叠。

### ServiceExport 和 ServiceImport 自定义资源已安装

我们需要在成员集群中安装 `ServiceExport` 和 `ServiceImport` 以启用多集群 Service。

在 **Karmada 控制平面** 上安装了 `ServiceExport` 和 `ServiceImport` 后，我们就可以创建 `ClusterPropagationPolicy`，将以下两个 CRD 分发到成员集群。

```yaml
# propagate ServiceExport CRD
apiVersion: policy.karmada.io/v1alpha1
kind: ClusterPropagationPolicy
metadata:
  name: serviceexport-policy
spec:
  resourceSelectors:
    - apiVersion: apiextensions.k8s.io/v1
      kind: CustomResourceDefinition
      name: serviceexports.multicluster.x-k8s.io
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
---        
# propagate ServiceImport CRD
apiVersion: policy.karmada.io/v1alpha1
kind: ClusterPropagationPolicy
metadata:
  name: serviceimport-policy
spec:
  resourceSelectors:
    - apiVersion: apiextensions.k8s.io/v1
      kind: CustomResourceDefinition
      name: serviceimports.multicluster.x-k8s.io
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
```

### 成员集群中已安装 metrics-server

我们需要为成员集群安装 `metrics-server` 以提供 metrics API，通过运行以下命令来安装：
```sh
hack/deploy-k8s-metrics-server.sh ${member_cluster_kubeconfig} ${member_cluster_context_name} 
```

如果您使用 `hack/local-up-karmada.sh` 脚本部署 Karmada，则可以运行以下命令在三个成员集群中部署 `metrics-server`：
```sh
hack/deploy-k8s-metrics-server.sh $HOME/.kube/members.config member1
hack/deploy-k8s-metrics-server.sh $HOME/.kube/members.config member2
hack/deploy-k8s-metrics-server.sh $HOME/.kube/members.config member3
```

### Karmada 控制平面已安装 karmada-metrics-adapter

我们需要在 Karmada 控制平面中安装 `karmada-metrics-adapter` 以提供 metrics API，通过运行以下命令来安装：
```sh
hack/deploy-metrics-adapter.sh ${host_cluster_kubeconfig} ${host_cluster_context} ${karmada_apiserver_kubeconfig} ${karmada_apiserver_context_name}
```

如果您使用 `hack/local-up-karmada.sh` 脚本部署 Karmada，将默认安装 `karmada-metrics-adapter`。

## 在 `member1` 和 `member2` 集群中部署 Deployment

我们需要在 `member1` 和 `member2` 集群中部署 Deployment（1 个副本）和 Service。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  replicas: 1
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
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: nginx
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
    - apiVersion: v1
      kind: Service
      name: nginx-service
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

部署完成后，您可以检查 Pod 和 Service 的分发情况：
```sh
$ karmadactl get pods --operation-scope members
NAME                     CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-777bc7b6d7-mbdn8   member1   1/1     Running   0          9h
$ karmadactl get svc --operation-scope members
NAME                    CLUSTER   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE   ADOPTION
nginx-service           member1   ClusterIP   10.11.216.215   <none>        80/TCP    9h    Y
nginx-service           member2   ClusterIP   10.13.46.61     <none>        80/TCP    9h    Y

```

## 在 Karmada 控制平面部署 FederatedHPA

接下来让我们在 Karmada 控制平面中部署 FederatedHPA。

```yaml
apiVersion: autoscaling.karmada.io/v1alpha1
kind: FederatedHPA
metadata:
  name: nginx
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
          averageUtilization: 10
```

部署完成后，您可以检查 FederatedHPA：
```sh
$ kubectl --kubeconfig $HOME/.kube/karmada.config --context karmada-apiserver get fhpa
NAME    REFERENCE-KIND   REFERENCE-NAME   MINPODS   MAXPODS   REPLICAS   AGE
nginx   Deployment       nginx            1         10        1          9h
```

## 将 Service 导出到 `member1` 集群

正如前文所提到的，我们需要一个多集群 Service 来将请求转发到 `member1` 和 `member2` 集群中的 Pod，因此让我们创建这个多集群 Service。
* 在 Karmada 控制平面创建一个 `ServiceExport` 对象，然后创建一个 `PropagationPolicy` 将 `ServiceExport` 对象分发到 `member1` 和 `member2` 集群。
  ```yaml
  apiVersion: multicluster.x-k8s.io/v1alpha1
  kind: ServiceExport
  metadata:
    name: nginx-service
  ---
  apiVersion: policy.karmada.io/v1alpha1
  kind: PropagationPolicy
  metadata:
    name: serve-export-policy
  spec:
    resourceSelectors:
      - apiVersion: multicluster.x-k8s.io/v1alpha1
        kind: ServiceExport
        name: nginx-service
    placement:
      clusterAffinity:
        clusterNames:
          - member1
          - member2
  ```
* 在 Karmada 控制平面创建一个 `ServiceImport` 对象，然后创建一个 `PropagationPolicy` 将 `ServiceImport` 对象分发到 `member1` 集群。
  ```yaml
  apiVersion: multicluster.x-k8s.io/v1alpha1
  kind: ServiceImport
  metadata:
    name: nginx-service
  spec:
    type: ClusterSetIP
    ports:
    - port: 80
      protocol: TCP
  ---
  apiVersion: policy.karmada.io/v1alpha1
  kind: PropagationPolicy
  metadata:
    name: serve-import-policy
  spec:
    resourceSelectors:
      - apiVersion: multicluster.x-k8s.io/v1alpha1
        kind: ServiceImport
        name: nginx-service
    placement:
      clusterAffinity:
        clusterNames:
          - member1
  ```

部署完成后，您可以检查多集群 Service：
```sh
$ karmadactl get svc --operation-scope members
NAME                    CLUSTER   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE   ADOPTION
derived-nginx-service   member1   ClusterIP   10.11.59.213    <none>        80/TCP    9h    Y
```

## 在 member1 集群中安装 hey http 负载测试工具

为了发送 http 请求，这里我们使用 `hey`。
* 下载 `hey` 并复制到 kind 集群容器中。
```sh
wget https://hey-release.s3.us-east-2.amazonaws.com/hey_linux_amd64
chmod +x hey_linux_amd64
docker cp hey_linux_amd64 member1-control-plane:/usr/local/bin/hey
```

## 测试扩容

* 首先检查 Pod 的分发情况。
  ```sh
  $ karmadactl get pods --operation-scope members
  NAME                     CLUSTER   READY   STATUS      RESTARTS   AGE
  nginx-777bc7b6d7-mbdn8   member1   1/1     Running     0          61m
  ```
* 检查多集群 Service ip。
  ```sh
  $ karmadactl get svc --operation-scope members
  NAME                    CLUSTER   TYPE        CLUSTER-IP        EXTERNAL-IP   PORT(S)   AGE   ADOPTION
  derived-nginx-service   member1   ClusterIP   10.11.59.213      <none>        80/TCP    20m   Y
  ```

* 使用 hey 请求多集群 Service，以提高 nginx Pod 的 CPU 使用率。
  ```sh
  docker exec member1-control-plane hey -c 1000 -z 1m http://10.11.59.213
  ```

* 等待 15 秒，副本将扩容，然后您可以再次检查 Pod 分发状态。
  ```sh
  $ karmadactl get pods --operation-scope members -l app=nginx
  NAME                     CLUSTER   READY   STATUS      RESTARTS   AGE
  nginx-777bc7b6d7-c2cfv   member1   1/1     Running     0          22s
  nginx-777bc7b6d7-mbdn8   member1   1/1     Running     0          62m
  nginx-777bc7b6d7-pk2s4   member1   1/1     Running     0          37s
  nginx-777bc7b6d7-tbb4k   member1   1/1     Running     0          37s
  nginx-777bc7b6d7-znlj9   member1   1/1     Running     0          22s
  nginx-777bc7b6d7-6n7d9   member2   1/1     Running     0          22s
  nginx-777bc7b6d7-dfbnw   member2   1/1     Running     0          22s
  nginx-777bc7b6d7-fsdg2   member2   1/1     Running     0          37s
  nginx-777bc7b6d7-kddhn   member2   1/1     Running     0          22s
  nginx-777bc7b6d7-lwn52   member2   1/1     Running     0          37s
  
  ```

## 测试缩容

1 分钟后，负载测试工具将停止运行，然后您可以看到工作负载在多个集群中缩容。
```sh
$ karmadactl get pods --operation-scope members -l app=nginx
NAME                     CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-777bc7b6d7-mbdn8   member1   1/1     Running   0          64m
```
