---
title: Schedule based on Cluster Resource Modeling
---
## Overview

When scheduling an application to a specific cluster, the resource status of the destination cluster is a factor that cannot be ignored.
When cluster resources are insufficient to run a given replica, we want the scheduler to avoid this scheduling behavior as much as possible.
This article will focus on how Karmada performs scheduling based on the cluster resource modeling.

## Cluster Resource Modeling

During the scheduling process, `karmada-scheduler` makes decisions based on a number of factors, one of which is the state of the cluster's resources. Karmada currently has two different ways of scheduling based on cluster resources, one of which is a generic cluster modeling and the other is a customized cluster modeling.

### General Cluster Modeling

#### Start to use General Cluster Resource Models

For that purpose, we introduced `ResourceSummary` to the [Cluster API](https://github.com/karmada-io/karmada/blob/master/pkg/apis/cluster/types.go).

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

From the example above, we can know the allocatable and allocated resources of the cluster.

#### Schedule based on General Cluster Resource Models

Assume that there is a Pod which will be scheduled to one of the member clusters managed by Karmada.

Member1:

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

Member2:

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

Member3:

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

Assume that the Pod's request is 500m CPU. Member1 and Member2 have sufficient resources to run this replica but Member3 has no quota for Pods.
Considering the amount of available resources, the scheduler prefers to schedule the Pod to member1.

| Cluster           | member1   | member2   | member3                    |
| ------------------- | ----------- | ----------- | ---------------------------- |
| AvailableReplicas | (4 - 0.95) / 0.5 = 6.1 | (4 - 2) / 0.5 = 4 | 0 |

### Customized Cluster Modeling

#### Background

`ResourceSummary` describes the overall available resources of the cluster.
However, the `ResourceSummary` is not precise enough, it mechanically counts the resources on all nodes, but ignores the fragmented resources of these nodes. For example, a cluster with 2000 nodes has only 1 core CPU left on each node.
From the `ResourceSummary`, we get that there are 2000 cores CPU left for the cluster, but actually, this cluster cannot run any pod that requires more than 1 core CPU.

Therefore, we introduce a `CustomizedClusterResourceModeling` for each cluster that records the resource profile of each node.
Karmada collects node and pod information from each cluster and computes the appropriate `user configured` resource model to categorize the node into.

#### Start to use Customized Cluster Resource Models

`CustomizedClusterResourceModeling` feature gate has evolved to Beta sine Karmada v1.4 and is enabled by default. 
If you use Karmada v1.3, you need to enable this feature gate in `karmada-scheduler`, `karmada-aggregated-server` and `karmada-controller-manager`.

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
        - --feature-gates=CustomizedClusterResourceModeling=true
        - --v=4

```

After that, when a cluster is registered to the Karmada control plane, Karmada will automatically sets up a generic model for the cluster. You can see it in `cluster.spec`.

By default, a `resource model` is as follows:

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

In some cases, the default cluster resource model may not match your cluster. You can adjust the granularity of the cluster resource model to better distribute resources to your cluster.

For example, you can use the command below to customize the cluster resource models of member1.

```shell
kubectl --kubeconfig ~/.kube/karmada.config --context karmada-apiserver edit cluster/member1
```

A Customized resource model should meet the following requirements:

* The grade of each model should not be the same.
* The number of resource types in each model should be the same.
* Currently only four resource types are supported cpu, memory, storage, ephemeral-storage.
* The max value of each resource must be greater than the min value.
* The min value of each resource in the first model should be 0.
* The max value of each resource in the last model should be MaxInt64.
* The resource types of each model should be the same.
* Model intervals for resources must be contiguous and non-overlapping from low-grade to high-grade models.

For example, a customized cluster resource model is given below:

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

The above is a cluster resource model with three grades, each grade defines the resource ranges for two resources, CPU and memory. At this point if a node has remaining available resources of 0.5 cores CPU and 2Gi memory, it will be classified as a grade 0 resource model, while if it has 1.5 cores CPU and 10Gi memory, it will be classified as grade 1.

#### Schedule based on Customized Cluster Resource Models

`Cluster Resource Model` classifies a cluster's nodes into different grades based on their available resources. This classification helps the scheduler determine the number of replicas that can fit into each cluster. By categorizing nodes based on their available resources, the Cluster Resource Model enables the scheduler to make decisions about where to propagate the application replicas using various scheduling policies.

Assume that there is a Pod to be scheduled to one of the member clusters managed by Karmada with the same cluster resource models. The remaining available resources of these member clusters are as follows:

Member1:

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

Member2:

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

Member3:

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

Suppose the Pod's resource request is for a 3-core CPU and 20Gi of memory. All nodes that are classified as grade 3 and above fulfill this request, since we need grade's resource `min` value to be at least as big as the requested value. For example, nodes in grade 2 with less than 3C and 20Gi don't fulfill our requirements, so we eliminate the entire grade due to that. Cluster resource model then proceeds to calculate how many replicas can fit in each cluster based on that information:


| Cluster           | member1   | member2   | member3                    |
| ------------------- | ----------- | ----------- | ---------------------------- |
| AvailableReplicas | 1 * min(2/3, 16/20) + 6 * min(4/3, 32/20) = 6 | 4 * min(2/3, 16/20) + 4 * min(4/3, 32/20) = 4 | 1 * min(32/3, 256/20) = 10 |


Suppose now that the Pod requires 5C and 60Gi. In this case, not even grade 3 nodes satisfy the resource request (some may do, but since we can't know for sure, the entire grade has to be eliminated) since 5C > 4C and 60Gi > 32Gi. The amount of replicas able to fit in each cluster is calculated below:


| Cluster           | member1   | member2   | member3                   |
| ------------------- | ----------- | ----------- | --------------------------- |
| AvailableReplicas |  0 | 0 | 1 * min(32/5, 256/60) = 4 |

## Disable Cluster Resource Modeling

The resource modeling is always used by the scheduler to make scheduling decisions in scenarios of dynamic replica assignment based on cluster free resources.
In the process of resource modeling, it will collect node and pod information from all clusters managed by Karmada.
This imposes a considerable performance burden in large-scale scenarios.

You can disable cluster resource modeling by setting `--enable-cluster-resource-modeling` to false in `karmada-controller-manager` and `karmada-agent`.
