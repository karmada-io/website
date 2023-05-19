---
title: 与 ErieCanal 集成支持跨集群的服务发现和故障转移
---

这篇文档将演示如何使用 [ErieCanal](https://github.com/flomesh-io/ErieCanal) 完成 Karmada 多集群的互联互通，实现应用粒度的跨集群 Failover。

ErieCanal 是一个 MCS（多集群服务 [Multi-Cluster Service](https://github.com/kubernetes-sigs/mcs-api)）实现，为 Kubernetes 集群提供 MCS、Ingress、Egress、GatewayAPI。

## 总体架构

在本示例中，我们借助 Karmada 实现资源的跨集群调度；借助 ErieCanal 实现服务的跨集群的注册发现。

- 服务注册：通过创建 [`ServiceExport`](https://github.com/flomesh-io/ErieCanal/blob/7fc7e33315347ec69dc60ff19fdeb1cd1552ef34/apis/serviceexport/v1alpha1/serviceexport_types.go#L125) 资源来将 Service 声明为多集群服务，注册到 ErieCanal 的控制面，同时为该服务创建入口（Ingress）规则。
- 服务发现：ErieCanal 的控制面，使用服务的信息及所在集群的信息创建 [`ServiceImport`](https://github.com/flomesh-io/ErieCanal/blob/7fc7e33315347ec69dc60ff19fdeb1cd1552ef34/apis/serviceimport/v1alpha1/serviceimport_types.go#L160) 资源，并将其同步到所有的成员集群。

ErieCanal 会运行在控制面集群和成员集群上，接受集群注册的成为 ErieCanal 的控制面集群。ErieCanal 是独立的组件，无需运行在 Karmada 控制面上。前者负责多集群服务的注册发现，后者负责多集群的资源调度。

![](../../resource/userguide/service/eriecanal/karmada-working-with-eriecanal-overview.png)

完成服务的跨集群注册发现之后，在处理应用的访问（curl -> httpbin）时要完成流量的自动调度，这里有两种方案：

- 集成服务网格 [osm-edge](https://flomesh.io/osm-edge/) 根据策略实现流量的调度，除了从 Kubernetes Service 获取服务的访问信息外，还会同多集群资源的 ServiceImport 中获取服务信息。
- 使用 ErieCanal 中的组件 ErieCanalNet（该特性即将发布），通过 eBPF+sidecar（Node level）来实现流量的跨集群管理。

下面是演示的全部流程，大家也可以使用我们提供的 [脚本 flomesh.sh](../../resource/userguide/service/eriecanal/flomesh.sh) 完成自动化地演示。使用脚本的前提，**系统需要已经安装 Docker 和 kubectl，并至少 8G 内存**。脚本的使用方式：

- `flomesh.sh` - 不提供任何参数，脚本会创建 4 个集群、完成环境搭建（安装 Karmada、ErieCanal、osm-edge），并运行示例。
- `flomesh.sh -h` - 查看参数的说明
- `flomesh.sh -i` - 创建集群和完成搭建环境
- `flomesh.sh -d` - 运行示例
- `flomesh.sh -r` - 删除示例所在的命名空间
- `flomesh.sh -u` - 销毁集群

以下是分步指南，与 flomesh.sh 脚本的执行步骤一致。

## 前提条件

- 4 个集群：control-plane、clutser-1、cluster-2、cluster-3
- Docker
- k3d
- helm
- kubectl

## 环境设置

### 1. 安装 Karmada 控制面

参考 [Karmada文档](https://karmada.io/zh/docs/installation/)，安装 Karmada 的控制面。Karmada 初始化完成后，将 **三个成员集群** clutser-1、cluster-2、cluster-3 注册到 Karmada 控制面，可 [参考 Karmada 的集群注册指引](https://karmada.io/zh/docs/userguide/clustermanager/cluster-registration/)。

这里使用 push 模式，集群注册参考下面的命令（在控制面集群 control-plane 上执行 ）：

```shell
karmadactl --kubeconfig PATH_TO_KARMADA_CONFIG join CLUSTER_NAME --cluster-kubeconfig=PATH_CLSUTER_KUBECONFIG
```

接来下，需要向 Karmada 控制面注册 ErieCanal 的多集群 CRD。

```shell
kubectl --kubeconfig PATH_TO_KARMADA_CONFIG apply -f https://raw.githubusercontent.com/flomesh-io/ErieCanal/main/charts/erie-canal/apis/flomesh.io_clusters.yaml
kubectl --kubeconfig PATH_TO_KARMADA_CONFIG apply -f https://raw.githubusercontent.com/flomesh-io/ErieCanal/main/charts/erie-canal/apis/flomesh.io_mcs-api.yaml
```

在控制面集群 control-plane 使用 Karmada apiserver 的 config 可查看集群的注册信息。

```shell
kubectl --kubeconfig PATH_TO_KARMADA_CONFIG get cluster
NAME        VERSION        MODE   READY   AGE
cluster-1   v1.23.8+k3s2   Push   True    154m
cluster-2   v1.23.8+k3s2   Push   True    154m
cluster-3   v1.23.8+k3s2   Push   True    154m
```

### 2. 安装 ErieCanal

接下来，需要在 **所有集群上** 安装 ErieCanal。这里推荐使用 Helm 的方式来安装，可以参考 [ErieCanal 的安装文档](https://github.com/flomesh-io/ErieCanal#install)。

```shell
helm repo add ec https://ec.flomesh.io --force-update
helm repo update

EC_NAMESPACE=erie-canal
EC_VERSION=0.1.3

helm upgrade -i --namespace ${EC_NAMESPACE} --create-namespace --version=${EC_VERSION} --set ec.logLevel=5 ec ec/erie-canal
```

安装完成后，将 **三个成员集群** 注册到 ErieCanal 的控制面。命令（在控制面集群 control-plane 上执行）如下，其中

- `CLUSTER_NAME`：成员集群名
- `HOST_IP`：成员集群的入口 IP 地址
- `PORT`：成员集群的入口端口
- `KUBECONFIG`：成员集群的 KUBECONFIG 内容

```shell
kubectl apply -f - <<EOF
apiVersion: flomesh.io/v1alpha1
kind: Cluster
metadata:
  name: ${CLUSTER_NAME}
spec:
  gatewayHost: ${HOST_IP}
  gatewayPort: ${PORT}
  kubeconfig: |+
  ${KUBECONFIG}
EOF
```

注册完成后，可在控制面集群 control-plane 查看成员集群的注册信息：

```shell
kubectl get cluster
NAME        REGION    ZONE      GROUP     GATEWAY HOST   GATEWAY PORT   MANAGED   MANAGED AGE   AGE
local       default   default   default                  80                                     159m
cluster-1   default   default   default   10.0.2.4       80             True      159m          159m
cluster-2   default   default   default   10.0.2.5       80             True      159m          159m
cluster-3   default   default   default   10.0.2.6       80             True      159m          159m
```

### 3. 安装 osm-edge

这里我们选择集成服务网格来完成流量的跨集群调度，接下来就是在 **三个成员集群** 上安装服务网格 osm-edge。osm-edge 提供了 [CLI 和 Helm 两种方式安装](https://osm-edge-docs.flomesh.io/docs/guides/operating/install/)，这里我们选择 CLI 的方式。

先下载 osm-edge 的 CLI。

```shell
system=$(uname -s | tr [:upper:] [:lower:])
arch=$(dpkg --print-architecture)
release=v1.3.4
curl -L https://github.com/flomesh-io/osm-edge/releases/download/${release}/osm-edge-${release}-${system}-${arch}.tar.gz | tar -vxzf -
./${system}-${arch}/osm version
sudo cp ./${system}-${arch}/osm /usr/local/bin/
```

然后就是安装 osm-edge。在支持多集群时，osm-edge 需要开启本地 DNS 代理，安装是需要提供集群 DNS 的地址。

```shell
DNS_SVC_IP="$(kubectl get svc -n kube-system -l k8s-app=kube-dns -o jsonpath='{.items[0].spec.clusterIP}')"

osm install \
--set=osm.localDNSProxy.enable=true \
--set=osm.localDNSProxy.primaryUpstreamDNSServerIPAddr="${DNS_SVC_IP}" \
--timeout 120s
```

执行命令可常看集群中安装的服务网格版本等信息。

```shell
osm version
CLI Version: version.Info{Version:"v1.3.5", GitCommit:"0b6243a58f65eefd481c8989dd949c4f5461bab6", BuildDate:"2023-05-10-12:21"}

MESH NAME   MESH NAMESPACE   VERSION   GIT COMMIT                                 BUILD DATE
osm         osm-system       v1.3.5    0b6243a58f65eefd481c8989dd949c4f5461bab6   2023-05-10-12:20
```

## 部署示例应用

应用的部署调度，通过 Karmada 控制面来完成，执行 `kubectl` 命令时需要显示地指定 Karmada 控制面 apiserver 的配置。

```shell
alias kmd="kubectl --kubeconfig /etc/karmada/karmada-apiserver.config"
```

#### 服务端

创建命名空间 `httpbin`。为了纳入服务网格的管理，创建时，我们增加了 label `openservicemesh.io/monitored-by: osm` 以及 annotation `openservicemesh.io/monitored-by: osm`。

```shell
kmd apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: httpbin
  labels:
    openservicemesh.io/monitored-by: osm
  annotations:
    openservicemesh.io/sidecar-injection: enabled
EOF
```

创建 httpbin Deployment 和 Service。

```shell
kmd apply -n httpbin -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin
  labels:
    app: pipy
spec:
  replicas: 2
  selector:
    matchLabels:
      app: pipy
  template:
    metadata:
      labels:
        app: pipy
    spec:
      containers:
        - name: pipy
          image: flomesh/pipy:latest
          ports:
            - containerPort: 8080
          command:
            - pipy
            - -e
            - |
              pipy()
              .listen(8080)
              .serveHTTP(() => new Message(os.env['HOSTNAME'] +'\n'))
---
apiVersion: v1
kind: Service
metadata:
  name: httpbin
spec:
  ports:
    - port: 8080
      targetPort: 8080
      protocol: TCP
  selector:
    app: pipy
EOF
```

在 Karmada 控制面创建资源后，还需要创建 `PropagationPolicy` 策略来对资源进行分发，我们将 `Deployment` 和 `Service` 分发到成员集群 `cluster-1` 和 `cluster-3`。

```shell
$kmd apply -n httpbin -f - <<EOF
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: httpbin
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: httpbin
    - apiVersion: v1
      kind: Service
      name: httpbin
  placement:
    clusterAffinity:
      clusterNames:
        - cluster-1
        - cluster-3
    replicaScheduling:
      replicaDivisionPreference: Weighted
      replicaSchedulingType: Divided
      weightPreference:
        staticWeightList:
          - targetCluster:
              clusterNames:
                - cluster-1
            weight: 20
          - targetCluster:
              clusterNames:
                - cluster-3
            weight: 20
EOF
```

应用部署完之后，还需要完成服务的多集群注册。如开头所说，我们要为服务创建 `ServiceExport` 资源来完成服务的注册。同样地，在 Karmada 控制面创建资源时，也需要为其创建分发策略。

```shell
kmd apply -n httpbin -f - <<EOF
apiVersion: flomesh.io/v1alpha1
kind: ServiceExport
metadata:
  name: httpbin
spec:
  serviceAccountName: "*"
  rules:
    - portNumber: 8080
      path: "/httpbin"
      pathType: Prefix
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: httpbin
spec:
  resourceSelectors:
    - apiVersion: flomesh.io/v1alpha1
      kind: ServiceExport
      name: httpbin
  placement:
    clusterAffinity:
      clusterNames:
        - cluster-1
        - cluster-2
        - cluster-3
EOF
```

#### 客户端

接下来就是客户端，也是同样操作，先创建命名空间 `curl`。

```shell
kmd apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: curl
  labels:
    openservicemesh.io/monitored-by: osm
  annotations:
    openservicemesh.io/sidecar-injection: enabled
EOF
```

部署应用 curl。

```shell
kmd apply -n curl -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: curl
  name: curl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: curl
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: curl
    spec:
      containers:
      - image: curlimages/curl
        name: curl
        command:
          - sleep
          - 365d
---
apiVersion: v1
kind: Service
metadata:
  name: curl
  labels:
    app: curl
    service: curl
spec:
  ports:
    - name: http
      port: 80
  selector:
    app: curl
EOF
```

同样需要为应用创建分发策略，我们通过策略将其调度到成员集群 `cluster-2` 上。

```shell
kmd apply -n curl -f - <<EOF
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: curl
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: curl
    - apiVersion: v1
      kind: Service
      name: curl
  placement:
    clusterAffinity:
      clusterNames:
        - cluster-2
    replicaScheduling:
      replicaDivisionPreference: Weighted
      replicaSchedulingType: Divided
      weightPreference:
        staticWeightList:
          - targetCluster:
              clusterNames:
                - cluster-2
            weight: 10
EOF
```

## 测试

我们在成员集群 `cluster-2` 上进行测试。

```shell
curl_client=`kubectl get po -n curl -l app=curl -o jsonpath='{.items[0].metadata.name}'`
kubectl exec $curl_client -n curl -c curl  -- curl -s http://httpbin.httpbin:8080
```

此时我们会看到返回 `Not found`，这是因为默认情况下不会使用其他群里的服务来响应请求。创建资源 `GlobalTrafficPolicy` 来对调度策略进行配置。同样地，也需要为其创建分发策略。

```shell
kmd apply -n httpbin -f - <<EOF
apiVersion: flomesh.io/v1alpha1
kind: GlobalTrafficPolicy
metadata:
  name: httpbin
spec:
  lbType: ActiveActive
  targets:
    - clusterKey: default/default/default/cluster-1
    - clusterKey: default/default/default/cluster-3
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: httpbin
spec:
  resourceSelectors:
    - apiVersion: flomesh.io/v1alpha1
      kind: GlobalTrafficPolicy
      name: httpbin
  placement:
    clusterAffinity:
      clusterNames:
        - cluster-2
EOF
```

此时再发送测试请求，就可以收到其他集群 httpbin 的响应了。

```shell
kubectl -n curl -c curl -- curl -s http://httpbin.httpbin:8080/
httpbin-c45b78fd-4v2vq
kubectl  -n curl -c curl -- curl -s http://httpbin.httpbin:8080/
httpbin-c45b78fd-6822z
```