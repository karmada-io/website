---
title: FederatedHPA 基于自定义指标扩缩容
---
在 Karmada 中，为了自动扩展工作负载以满足需求，FederatedHPA 会跨多个集群扩/缩容工作负载。

FederatedHPA 不仅支持 CPU 和内存等资源指标，还支持自定义指标，这有助于扩展 FederatedHPA 的使用场景。

本文档将引导您完成这样一个案例：启用 FederatedHPA 利用自定义指标来自动扩缩容跨集群应用。

演示案例将执行以下操作：

![federatedhpa-custom-metrics-demo](../resources/tutorials/custom_metrics.png)

* `member1` 集群中存在一个示例 Deployment 的 Pod。
* Service 部署在 `member1` 和 `member2` 集群。
* 请求多集群 Service 并触发 Pod 的自定义指标（http_requests_total）增长。
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

### 成员集群中已安装 prometheus 和 prometheus-adapter

我们需要为成员集群安装 `prometheus` 和 `prometheus-adapter` 以提供自定义 metrics API。
可以通过在成员集群中运行以下命令来安装：
```sh
git clone https://github.com/prometheus-operator/kube-prometheus.git
cd kube-prometheus
kubectl apply --server-side -f manifests/setup
kubectl wait \
	--for condition=Established \
	--all CustomResourceDefinition \
	--namespace=monitoring
kubectl apply -f manifests/
```

我们可以通过下面的命令验证安装：
```sh
$ kubectl --kubeconfig=/root/.kube/members.config --context=member1 get po -nmonitoring
NAME                                   READY   STATUS    RESTARTS   AGE
alertmanager-main-0                    2/2     Running   0          30h
alertmanager-main-1                    2/2     Running   0          30h
alertmanager-main-2                    2/2     Running   0          30h
blackbox-exporter-6bc47b9578-zcbb7     3/3     Running   0          30h
grafana-6b68cd6b-vmw74                 1/1     Running   0          30h
kube-state-metrics-597db7f85d-2hpfs    3/3     Running   0          30h
node-exporter-q8hdx                    2/2     Running   0          30h
prometheus-adapter-57d9587488-86ckj    1/1     Running   0          29h
prometheus-adapter-57d9587488-zrt29    1/1     Running   0          29h
prometheus-k8s-0                       2/2     Running   0          30h
prometheus-k8s-1                       2/2     Running   0          30h
prometheus-operator-7d4b94944f-kkwkk   2/2     Running   0          30h
```

### Karmada 控制平面已安装 karmada-metrics-adapter

我们需要在 Karmada 控制平面中安装 `karmada-metrics-adapter` 以提供 metrics API，通过运行以下命令来安装：
```sh
hack/deploy-metrics-adapter.sh ${host_cluster_kubeconfig} ${host_cluster_context} ${karmada_apiserver_kubeconfig} ${karmada_apiserver_context_name}
```

如果您使用 `hack/local-up-karmada.sh` 脚本部署 Karmada，将默认安装 `karmada-metrics-adapter`。

## 在 `member1` 和 `member2` 集群中部署 Deployment

我们需要在 `member1` 和 `member2` 集群中部署示例 Deployment（1 个副本）和 Service。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-app
  labels:
    app: sample-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sample-app
  template:
    metadata:
      labels:
        app: sample-app
    spec:
      containers:
      - image: luxas/autoscale-demo:v0.1.2
        name: metrics-provider
        ports:
        - name: http
          containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: sample-app
  name: sample-app
spec:
  ports:
  - name: http
    port: 80
    protocol: TCP
    targetPort: 8080
  selector:
    app: sample-app
  type: ClusterIP
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: app-propagation
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: sample-app
    - apiVersion: v1
      kind: Service
      name: sample-app
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
$ karmadactl get pods
NAME                                  CLUSTER   READY   STATUS    RESTARTS   AGE
sample-app-9b7d8c9f5-xrnfx            member1   1/1     Running   0          111s
$ karmadactl get svc
NAME                 CLUSTER   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE     ADOPTION
sample-app           member1   ClusterIP   10.11.29.250    <none>        80/TCP    3m53s   Y
```

## 在 `member1` 和 `member2` 集群中监控您的应用

为了监控您的应用，您需要配置一个指向该应用的 ServiceMonitor。假设您已配置 Prometheus 实例来使用带有 app:sample-app 标签的 ServiceMonitor，那么请创建一个 ServiceMonitor 以通过 Service 监控应用的指标：

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sample-app
  labels:
    app: sample-app
spec:
  selector:
    matchLabels:
      app: sample-app
  endpoints:
  - port: http
```

```sh
kubectl create -f sample-app.monitor.yaml
```

现在，您应该可以看到自定义指标 (http_requests_total) 出现在 Prometheus 实例中。通过仪表盘找到指标，并确保其含有 Namespace 和 Pod 标签。如果没有，请检查 ServiceMonitor 中的标签与 Prometheus CRD 中的标签是否匹配。

## 在 `member1` 和 `member2` 集群中启动您的适配器

部署了 `prometheus-adapter` 之后，为了暴露自定义指标，您需要更新适配器配置。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: adapter-config
  namespace: monitoring
data:
  config.yaml: |-
    "rules":
    - "seriesQuery": |
         {namespace!="",__name__!~"^container_.*"}
      "resources":
        "template": "<<.Resource>>"
      "name":
        "matches": "^(.*)_total"
        "as": ""
      "metricsQuery": |
        sum by (<<.GroupBy>>) (
          irate (
            <<.Series>>{<<.LabelMatchers>>}[1m]
          )
        )
```

```sh
kubectl apply -f prom-adapter.config.yaml
# Restart prom-adapter pods
kubectl rollout restart deployment prometheus-adapter -n monitoring
```

## 在 `member1` 和 `member2` 集群中注册 metrics API

您还需要向 API 聚合器（主 Kubernetes API 服务器的一部分）注册自定义指标 API。为此，您需要创建一个 APIService 资源。

```yaml
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  name: v1beta2.custom.metrics.k8s.io
spec:
  group: custom.metrics.k8s.io
  groupPriorityMinimum: 100
  insecureSkipTLSVerify: true
  service:
    name: prometheus-adapter
    namespace: monitoring
  version: v1beta2
  versionPriority: 100
```

```sh
kubectl create -f api-service.yaml
```

该 API 已注册为 `custom.metrics.k8s.io/v1beta2`，您可以使用以下命令进行验证：

```sh
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta2/namespaces/default/pods/*/http_requests?selector=app%3Dsample-app"
```

输出结果类似于：

```json
{
  "kind": "MetricValueList", 
  "apiVersion": "custom.metrics.k8s.io/v1beta2", 
  "metadata": {}, 
  "items": [
    {
      "describedObject": {
        "kind": "Pod", 
        "namespace": "default", 
        "name": "sample-app-9b7d8c9f5-9lw6b", 
        "apiVersion": "/v1"
      }, 
      "metric": {
        "name": "http_requests", 
        "selector": null
      }, 
      "timestamp": "2023-06-14T09:09:54Z", 
      "value": "66m"
    }
  ]
}
```

如果 `karmada-metrics-adapter` 安装成功，您也可以在 Karmada 控制平面中使用上述命令进行验证。

## 在 Karmada 控制平面部署 FederatedHPA

接下来让我们在 Karmada 控制平面中部署 FederatedHPA。

```yaml
apiVersion: autoscaling.karmada.io/v1alpha1
kind: FederatedHPA
metadata:
  name: sample-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sample-app
  minReplicas: 1
  maxReplicas: 10
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 10
    scaleUp:
      stabilizationWindowSeconds: 10
  metrics:
    - type: Pods
      pods:
        metric:
          name: http_requests
        target:
          averageValue: 700m
          type: Value
```

部署完成后，您可以检查 FederatedHPA：
```sh
NAME          REFERENCE-KIND   REFERENCE-NAME   MINPODS   MAXPODS   REPLICAS   AGE
sample-app    Deployment       sample-app       1         10        1          15d
```

## 将 Service 导出到 `member1` 集群

正如前文所提到的，我们需要一个多集群 Service 来将请求转发到 `member1` 和 `member2` 集群中的 Pod，因此让我们创建这个多集群 Service。
* 在 Karmada 控制平面创建一个 `ServiceExport` 对象，然后创建一个 `PropagationPolicy` 将 `ServiceExport` 对象分发到 `member1` 和 `member2` 集群。  
  ```yaml
  apiVersion: multicluster.x-k8s.io/v1alpha1
  kind: ServiceExport
  metadata:
    name: sample-app
  ---
  apiVersion: policy.karmada.io/v1alpha1
  kind: PropagationPolicy
  metadata:
    name: serve-export-policy
  spec:
    resourceSelectors:
      - apiVersion: multicluster.x-k8s.io/v1alpha1
        kind: ServiceExport
        name: sample-app
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
    name: sample-app
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
        name: sample-app
    placement:
      clusterAffinity:
        clusterNames:
          - member1
  ```

部署完成后，您可以检查多集群 Service：
```sh
$ karmadactl get svc
NAME                    CLUSTER   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE   ADOPTION
derived-sample-app      member1   ClusterIP   10.11.59.213    <none>        80/TCP    9h    Y
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
  $ karmadactl get pods
  NAME                                  CLUSTER   READY   STATUS    RESTARTS   AGE
  sample-app-9b7d8c9f5-xrnfx            member1   1/1     Running   0          111s
  ```

* 检查多集群 Service ip。
  ```sh
  $ karmadactl get svc
  NAME                    CLUSTER   TYPE        CLUSTER-IP        EXTERNAL-IP   PORT(S)   AGE   ADOPTION
  derived-sample-app      member1   ClusterIP   10.11.59.213      <none>        80/TCP    20m   Y
  ```

* 使用 hey 请求多集群 Service，以提高 nginx Pod 的自定义指标（http_requests_total）。
  ```sh
  docker exec member1-control-plane hey -c 1000 -z 1m http://10.11.59.213/metrics
  ```

* 等待 15 秒，副本将扩容，然后您可以再次检查 Pod 分发状态。
  ```sh
  $ karmadactl get po -l app=sample-app
  NAME                         CLUSTER   READY   STATUS    RESTARTS   AGE
  sample-app-9b7d8c9f5-454vz   member2   1/1     Running   0          84s
  sample-app-9b7d8c9f5-7fjhn   member2   1/1     Running   0          69s
  sample-app-9b7d8c9f5-ddf4s   member2   1/1     Running   0          69s
  sample-app-9b7d8c9f5-mxqmh   member2   1/1     Running   0          84s
  sample-app-9b7d8c9f5-qbc2j   member2   1/1     Running   0          69s
  sample-app-9b7d8c9f5-2tgxt   member1   1/1     Running   0          69s
  sample-app-9b7d8c9f5-66n9s   member1   1/1     Running   0          69s
  sample-app-9b7d8c9f5-fbzps   member1   1/1     Running   0          84s
  sample-app-9b7d8c9f5-ldmhz   member1   1/1     Running   0          84s
  sample-app-9b7d8c9f5-xrnfx   member1   1/1     Running   0          87m
  ```

## 测试缩容

1 分钟后，负载测试工具将停止运行，然后您可以看到工作负载在多个集群中缩容。
```sh
$ karmadactl get pods -l app=sample-app
NAME                         CLUSTER   READY   STATUS    RESTARTS   AGE
sample-app-9b7d8c9f5-xrnfx   member1   1/1     Running   0          91m
```
