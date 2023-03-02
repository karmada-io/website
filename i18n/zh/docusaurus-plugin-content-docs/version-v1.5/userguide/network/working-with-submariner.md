---
title: 使用 Submariner 实现 Karmada 成员集群彼此联网
---

本文演示了如何使用 `Submariner` 将成员集群彼此联网。

[Submariner](https://github.com/submariner-io/submariner) 将相连集群之间的网络扁平化，并实现 Pod 和服务之间的 IP 可达性。

## 安装 Karmada

### 安装 Karmada 控制面

遵循快速入门中的步骤[安装 Karmada 控制面](../../installation/installation.md)后，您就可以用 Karmada 管控集群。

### 接入成员集群

在下面的步骤中，我们将创建一个成员集群，然后将该集群接入 Karmada 控制面。

1. 创建成员集群

我们将创建一个名为 `cluster1` 的集群，想要将 KUBECONFIG 文件放到 $HOME/.kube/cluster.config 中。运行以下命令：

```shell
hack/create-cluster.sh cluster1 $HOME/.kube/cluster1.config
```

这将按 kind 的设置创建集群。

2. 将成员集群接入 Karmada 控制面

导出 `KUBECONFIG` 并切换到 `karmada apiserver`：

```shell
export KUBECONFIG=$HOME/.kube/karmada.config

kubectl config use-context karmada-apiserver 
```

然后安装 `karmadactl` 指令集并接入成员集群：

```shell
go install github.com/karmada-io/karmada/cmd/karmadactl

karmadactl join cluster1 --cluster-kubeconfig=$HOME/.kube/cluster1.config
```

除原始成员集群外，确保至少有两个成员集群接入 Karmada。

在本例中，我们将两个成员集群接入了 Karmada：

```console
# kubectl get clusters
NAME      VERSION   MODE   READY   AGE
cluster1   v1.21.1   Push   True    16s
cluster2   v1.21.1   Push   True    5s
...
```

## 部署 Submariner
我们将使用 `subctl` CLI 在 `host cluster` 和 `member clusters` 上部署 `Submariner` 组件。
按照[Submariner 官方文档](https://github.com/submariner-io/submariner/tree/b4625514061c1d85c10432a78ca0ad46e679367a#installation)，这是推荐的部署方法。

`Submariner` 使用一个中央 Broker 组件来简化所有相关集群中所部署的 Gateway Engines 之间的元数据信息交换。
Broker 必须部署在单个 Kubernetes 集群上。该集群的 API server必须能够到达 Submariner 连接的所有 Kubernetes 集群，因此我们将其部署在 karmada-host 集群上。

### 安装 subctl

请参阅 [SUBCTL 安装](https://submariner.io/operations/deployment/subctl/)。

### 使用 karmada-host 用作 Broker

```shell
subctl deploy-broker --kubeconfig /root/.kube/karmada.config --kubecontext karmada-host
```

### 集群 1 和集群 2 接入到 Broker

```shell
subctl join --kubeconfig /root/.kube/cluster1.config broker-info.subm --natt=false
```

```shell
subctl join --kubeconfig /root/.kube/cluster2.config broker-info.subm --natt=false
```

## 连通性测试

请参阅[多集群服务发现](../service/multi-cluster-service.md)。
