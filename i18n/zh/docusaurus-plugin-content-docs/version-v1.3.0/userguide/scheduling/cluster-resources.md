---
title: Schedule based on Cluster Resource Modeling
---
## Overview

When scheduling an application to a specific cluster, the resource status of the destination cluster is a factor that cannot be ignored.
When cluster resources are insufficient to run a given replica, we want the scheduler to avoid this scheduling behavior as much as possible.
This article will focus on how Karmada performs scheduling based on the cluster resource modeling.

## Cluster Resource Modeling

### General Cluster Modeling

### Customized Cluster Modeling

#### Background

In the scheduling progress, the `karmada-scheduler` now makes decisions as per a bunch of factors, one of the factors is the resource details of the cluster.

For the purpose above, we introduced `ResourceSummary` to the [Cluster API](https://github.com/karmada-io/karmada/blob/master/pkg/apis/cluster/types.go).

For example:

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

However, the `ResourceSummary` is not precise enough, it mechanically counts the resources on all nodes, but ignores the fragment resources. For example, a cluster with 2000 nodes, 1 core CPU left on each node.
From the `ResourceSummary`, we get that there are 2000 core CPU left for the cluster, but actually, this cluster cannot run any pod that requires CPU greater than 1 core.

Therefore, we introduce a `resource models` for each cluster that records the resource portrait of each node. Karmada will collect node and pod information for each cluster. After calculation, this node will be divided into the appropriate resource model configured by the users.

#### Start to use cluster resource models

Now `cluster resource model` is in alpha state. To start this feature, you need to turn on the `CustomizedClusterResourceModeling` feature gate in `karmada-scheduler`, `karmada-aggregated-server` and `karmada-controller-manager`.

For example, you can use the command below to turn on the feature gate in the `karmada-controller-manager`.

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

After that, when a cluster is registered to the Karmada control plane, Karmada will automatically sets up a generic model for the cluster. You can see it in `cluster.spec`.

By default, a `resource model` is like:

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

#### Customize your cluster resource models

In some cases, the default cluster resource model may not match your cluster. You can adjust the granularity of the cluster resource model to better deliver resources to the cluster.

For example, you can use the command below to customize the cluster resource models of member1.

```shell
kubectl --kubeconfig ~/.kube/karmada.config --context karmada-apiserver edit cluster/member1
```

A Customized resource model should meet the following requirements:

* The grade of each models should not be the same.
* The number of resource types in each model should be the same.
* Now only support cpu, memory, storage, ephemeral-storage.
* The max value of each resource must be greater than the min value.
* The min value of each resource in the first model should be 0.
* The max value of each resource in the last model should be MaxInt64.
* The resource types of each models should be the same.
* Model intervals for resources must be contiguous and non-overlapping.

For example: there is a cluster resource model below:

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

It means that there are three models in the cluster resource models. if there is a node with 0.5C and 2Gi, it will be divided into Grade 0. If there is a node with 1.5C and 10Gi, it will be divided into Grade 1.

#### Schedule based on Cluster Resource Models

`Cluster resource model` divides nodes into levels of different intervals. And when a Pod needs to be scheduled to a specific cluster, they will compare the number of nodes in the model that satisfies the resource request of the Pod in different clusters, and schedule the Pod to the cluster with more node numbers.

Assume that there is a Pod which want to schedule it to one of the clusters managed by Karmada with the same cluster resource models.

Member1 is like:

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

Member2 is like:

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

Member3 is like:

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

Assume that the Pod's request is 3C 20Gi. All nodes that meet Grade 2 and above meet this requirement. Considering the amount of available resources, the scheduler prefers to schedule the Pod to member3.


| Cluster           | member1   | member2   | member3                    |
| ------------------- | ----------- | ----------- | ---------------------------- |
| AvailableReplicas | 1 + 6 = 7 | 4 + 4 = 8 | 1 * min(32/3, 256/20) = 10 |

Assume that the Pod's request is 3C 60Gi. Nodes from Grade2 does not satisfy all resource requests. Considering the amount of available resources above Grade 2, the scheduler prefers to schedule the Pod to member1.


| Cluster           | member1   | member2   | member3                   |
| ------------------- | ----------- | ----------- | --------------------------- |
| AvailableReplicas | 6 * 1 = 6 | 4 * 1 = 4 | 1 * min(32/3, 256/60) = 4 |

## Disable Cluster Resource Modeling
