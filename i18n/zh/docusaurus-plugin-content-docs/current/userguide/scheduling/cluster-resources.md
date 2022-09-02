---
title: 基于集群资源模型的调度
---
## 概览

在将应用程序调度到特定集群时，目标集群的资源状态是一个不容忽视的因素。 例如，当集群资源不足以运行给定的实例时，我们希望调度器尽可能避免这种调度行为。
本文将重点介绍 Karmada 如何基于集群资源模型进行实例的调度。

## 集群资源模型

在调度过程中，`karmada-scheduler` 现在根据一系列因素做出决策，其中一个因素是集群的资源状态。
现在 Karmada 有两种不同的基于集群资源的调度方式，其中一种是通用的集群模型，另一种是自定义的集群模型。

### 通用集群资源模型

#### 使用通用集群资源模型

出于上述目的，Karmada在[Cluster API](https://github.com/karmada-io/karmada/blob/master/pkg/apis/cluster/types.go) 引入了`ResourceSummary`的概念。

以下给出了一个`ResourceSummary`的例子:

```
resourceSummary:
    allocatable:
      cpu: "4"
      ephemeral-storage: 206291924Ki
      hugepages-1Gi: "0"
      hugepages-2Mi: "0"
      memory: 16265856Ki
      pods: "110"
    allocated:
      cpu: 950m
      memory: 290Mi
      pods: "11"
```

从上面的例子中，我们可以知道集群的可分配资源和已分配资源。

#### 基于通用集群资源模型的调度

假设在Karmada控制面上注册了三个成员集群，这时过来一个Pod的调度请求。

Member1：

```
resourceSummary:
    allocatable:
      cpu: "4"
      ephemeral-storage: 206291924Ki
      hugepages-1Gi: "0"
      hugepages-2Mi: "0"
      memory: 16265856Ki
      pods: "110"
    allocated:
      cpu: 950m
      memory: 290Mi
      pods: "11"
```

Member2：

```
resourceSummary:
    allocatable:
      cpu: "4"
      ephemeral-storage: 206291924Ki
      hugepages-1Gi: "0"
      hugepages-2Mi: "0"
      memory: 16265856Ki
      pods: "110"
    allocated:
      cpu: "2"
      memory: 290Mi
      pods: "11"
```

Member3：

```
resourceSummary:
    allocatable:
      cpu: "4"
      ephemeral-storage: 206291924Ki
      hugepages-1Gi: "0"
      hugepages-2Mi: "0"
      memory: 16265856Ki
      pods: "110"
    allocated:
      cpu: "2"
      memory: 290Mi
      pods: "110"
```

假设这个Pod的资源请求是500m CPU。 显然，Member1和Member2有足够的资源来运行这个副本，但Member3没有Pod的配额。
考虑到可用资源的数量，调度器更倾向于将Pod调度到member1。

| Cluster           | member1   | member2   | member3                    |
| ------------------- | ----------- | ----------- | ---------------------------- |
| AvailableReplicas | (4 - 0.95) / 0.5 = 6.1 | (4 - 2) / 0.5 = 4 | 0 |

### 自定义集群资源模型

#### 背景

`ResourceSummary` 描述了集群的整体可用资源。
但是，`ResourceSummary`不够精确，它机械地统计所有节点上的资源，而忽略了节点上的碎片资源。例如，一个有 2000 个节点的集群，每个节点上只剩下1核CPU。
从 `ResourceSummary` 中我们获知集群还有 2000核CPU，但事实上，这个集群甚至无法运行任何需要1核CPU以上的Pod实例。

因此，我们为每个集群引入了“自定义资源模型”的概念，来记录每个节点的资源画像。 Karmada将收集每个集群的节点和pod信息，并经过计算将这个节点被划分为对应等级的合适的资源模型。

#### 启用自定义资源模型

现在“自定义集群资源模型”处于alpha阶段。要启动此功能，你需要在 `karmada-scheduler`、`karmada-aggregated-server` 和 `karmada-controller-manager` 中开启 `CustomizedClusterResourceModeling` 特性开关。

例如，你可以使用以下命令打开 `karmada-controller-manager` 中的特性开关。

```shell
kubectl --kubeconfig ~/.kube/karmada.config --context karmada-host edit deploy/karmada-controller-manager -nkarmada-system
```

```
- command:
        - /bin/karmada-controller-manager
        - --kubeconfig=/etc/kubeconfig
        - --bind-address=0.0.0.0
        - --cluster-status-update-frequency=10s
        - --secure-port=10357
        - --feature-gates=PropagateDeps=true,Failover=true,GracefulEviction=true,CustomizedClusterResourceModeling=true
        - --v=4

```

在开启特性开关后，当集群注册到 Karmada 控制面时，Karmada会自动为集群设置一个通用的资源模型。你可以在 `cluster.spec` 中看到它。

默认的资源模型如下:

```
resourceModels:
  - grade: 0
    ranges:
    - max: "1"
      min: "0"
      name: cpu
    - max: 4Gi
      min: "0"
      name: memory
  - grade: 1
    ranges:
    - max: "2"
      min: "1"
      name: cpu
    - max: 16Gi
      min: 4Gi
      name: memory
  - grade: 2
    ranges:
    - max: "4"
      min: "2"
      name: cpu
    - max: 32Gi
      min: 16Gi
      name: memory
  - grade: 3
    ranges:
    - max: "8"
      min: "4"
      name: cpu
    - max: 64Gi
      min: 32Gi
      name: memory
  - grade: 4
    ranges:
    - max: "16"
      min: "8"
      name: cpu
    - max: 128Gi
      min: 64Gi
      name: memory
  - grade: 5
    ranges:
    - max: "32"
      min: "16"
      name: cpu
    - max: 256Gi
      min: 128Gi
      name: memory
  - grade: 6
    ranges:
    - max: "64"
      min: "32"
      name: cpu
    - max: 512Gi
      min: 256Gi
      name: memory
  - grade: 7
    ranges:
    - max: "128"
      min: "64"
      name: cpu
    - max: 1Ti
      min: 512Gi
      name: memory
  - grade: 8
    ranges:
    - max: "9223372036854775807"
      min: "128"
      name: cpu
    - max: "9223372036854775807"
      min: 1Ti
      name: memory
```

#### 自定义你的集群资源模型

在某些情况下，默认的集群资源模型可能与你的集群不相匹配。你可以调整集群资源模型的细粒度，以便更好地向集群下发资源。
例如，你可以使用以下命令编辑 member1 的集群资源模型。

```shell
kubectl --kubeconfig ~/.kube/karmada.config --context karmada-apiserver edit cluster/member1
```

自定义资源模型应满足以下要求:

* 每个模型的等级不应该是相同的。
* 每个模型中资源类型的数量应该相同。
* 目前只支持 cpu, memory, storage, ephemeral-storage四种资源类型。
* 每个资源的最大值必须大于最小值。
* 第一个模型中每个资源的最小值应为 0。
* 最后一个模型中每个资源的最大值应为 MaxInt64。
* 每个模型的资源类型应该相同。
* 从低等级到高等级的模型，资源的范围必须连续且不重叠。

例如：以下给出了一个自定义的集群资源模型:

```
resourceModels:
  - grade: 0
    ranges:
    - max: "1"
      min: "0"
      name: cpu
    - max: 4Gi
      min: "0"
      name: memory
  - grade: 1
    ranges:
    - max: "2"
      min: "1"
      name: cpu
    - max: 16Gi
      min: 4Gi
      name: memory
  - grade: 2
    ranges:
    - max: "9223372036854775807"
      min: "2"
      name: cpu
    - max: "9223372036854775807"
      min: 16Gi
      name: memory
```

上述是一个有三个等级的集群资源模型，每个等级分别定义了CPU和内存这两种资源的资源范围。这时如果一个节点的剩余可用资源为0.5核CPU和2Gi内存，则会被划分为0级的资源模型。如果这个节点的剩余可用资源为1.5核CPU和10Gi内存，则会被划分为1级。

#### 基于自定义集群资源模型的调度

`自定义集群资源模型`将节点划分为不同区间的等级，并且当一个Pod实例需要调度到特定集群时，`karmada-scheduler`根据将要调度的实例资源请求比较不同集群中满足要求的节点数，并将实例调度到满足要求的节点数更多的集群。
假设有三个注册在Karmada控制面的成员集群，采用默认设置的集群资源模型，这些集群的剩余可用资源情况如下。

成员集群1:

```
spec:
...
  - grade: 2
    ranges:
    - max: "4"
      min: "2"
      name: cpu
    - max: 32Gi
      min: 16Gi
      name: memory
  - grade: 3
    ranges:
    - max: "8"
      min: "4"
      name: cpu
    - max: 64Gi
      min: 32Gi
      name: memory
...
...
status:
  - count: 1
    grade: 2
  - count: 6
    grade: 3   
```

成员集群2:

```
spec:
...
  - grade: 2
    ranges:
    - max: "4"
      min: "2"
      name: cpu
    - max: 32Gi
      min: 16Gi
      name: memory
  - grade: 3
    ranges:
    - max: "8"
      min: "4"
      name: cpu
    - max: 64Gi
      min: 32Gi
      name: memory
...
...
status:
  - count: 4
    grade: 2
  - count: 4
    grade: 3   
```

成员集群3:

```
spec:
...
  - grade: 6
    ranges:
    - max: "64"
      min: "32"
      name: cpu
    - max: 512Gi
      min: 256Gi
      name: memory
...
...
status:
  - count: 1
    grade: 6   
```

假设这时过来一个Pod的调度请求，Pod的资源请求是3核CPU和20Gi内存。那么，Karmada认为所有满足等级2及以上的节点满足此要求。考虑到不同集群可用节点的数量，调度器更倾向于Pod调度到成员集群3。

| Cluster           | member1   | member2   | member3                    |
| ------------------- | ----------- | ----------- | ---------------------------- |
| AvailableReplicas | 1 + 6 = 7 | 4 + 4 = 8 | 1 * min(32/3, 256/20) = 10 |

假设这时过来一个Pod的调度请求，Pod的资源请求是3核CPU和60Gi内存。那么，这时等级2的节点已经无法满足Pod所需所有资源的要求。考虑到不同集群可用节点的数量，调度器更倾向于Pod调度到成员集群1。

| Cluster           | member1   | member2   | member3                   |
| ------------------- | ----------- | ----------- | --------------------------- |
| AvailableReplicas | 6 * 1 = 6 | 4 * 1 = 4 | 1 * min(32/3, 256/60) = 4 |

## 禁用集群资源模型

在基于集群可用资源的动态副本分配场景中，调度器总是会参考资源模型来做出调度决策。
在资源建模的过程中，不论是通用集群资源建模还是自定义集群资源建模，Karmada都会从管理的所有集群中收集节点和Pod信息。
这在大规模场景中带来了不小的性能负担。

你可以通过在 `karmada-controller-manager` 和 `karmada-agent` 中将 `--enable-cluster-resource-modeling` 设置为 false 来禁用集群资源模型。