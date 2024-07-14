---
title: Resource Propagating
---

The [PropagationPolicy](https://github.com/karmada-io/karmada/blob/master/pkg/apis/policy/v1alpha1/propagation_types.go#L13) and [ClusterPropagationPolicy](https://github.com/karmada-io/karmada/blob/master/pkg/apis/policy/v1alpha1/propagation_types.go#L292) APIs are provided to propagate resources. For the differences between the two APIs, please see [here](../../faq/faq.md#what-is-the-difference-between-propagationpolicy-and-clusterpropagationpolicy).

Here, we use PropagationPolicy as an example to describe how to propagate resources.

## Before you start

[Install Karmada](../../installation/installation.md) and prepare the [karmadactl command-line](../../installation/install-cli-tools.md) tool.

> Note: We need to point kubectl to `<karmada-apiserver.config>` instead of the member cluster in advance. 

## Deploy a simplest multi-cluster Deployment

### Create a PropagationPolicy object

You can propagate a Deployment by creating a PropagationPolicy object defined in a YAML file. For example, this YAML
 file describes a Deployment object named nginx under default namespace need to be propagated to member1 cluster:

```yaml
# propagationpolicy.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: example-policy # The default namespace is `default`.
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx # If no namespace is specified, the namespace is inherited from the parent object scope.
  placement:
    clusterAffinity:
      clusterNames:
        - member1
```

1. Create a propagationPolicy base on the YAML file:
```shell
kubectl apply -f propagationpolicy.yaml
```
2. Create a Deployment nginx resource:
```shell
kubectl create deployment nginx --image nginx
```
> Note: The resource exists only as a template in karmada. After being propagated to a member cluster, the behavior of the resource is the same as that of a single kubernetes cluster.

> Note: Resources and PropagationPolicy are created in no sequence.
3. Display information of the deployment:
```shell
karmadactl get deployment
```
The output is similar to this:
```shell
NAME    CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
nginx   member1   1/1     1            1           52s   Y
```
4. List the pods created by the deployment:
```shell
karmadactl get pod -l app=nginx
```
The output is similar to this:
```shell
NAME                     CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-6799fc88d8-s7vv9   member1   1/1     Running   0          52s
```

### Update PropagationPolicy

You can update the propagationPolicy by applying a new YAML file. This YAML file propagates the Deployment to the member2 cluster.

```yaml
# propagationpolicy-update.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: example-policy
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  placement:
    clusterAffinity:
      clusterNames: # Modify the selected cluster to propagate the Deployment.
        - member2
```

1. Apply the new YAML file:
```shell
kubectl apply -f propagationpolicy-update.yaml
```
2. Display information of the deployment (the output is similar to this):
```shell
NAME    CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
nginx   member2   1/1     1            1           5s    Y
```
3. List the pods of the deployment (the output is similar to this):
```shell
NAME                     CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-6799fc88d8-8t8cc   member2   1/1     Running   0          17s
```

### Update Deployment

You can update the deployment template. The changes will be automatically synchronized to the member clusters.

1. Update deployment replicas to 2
2. Display information of the deployment (the output is similar to this):
```shell
NAME    CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE     ADOPTION
nginx   member2   2/2     2            2           7m59s   Y
```
3. List the pods of the deployment (the output is similar to this):
```shell
NAME                     CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-6799fc88d8-8t8cc   member2   1/1     Running   0          8m12s
nginx-6799fc88d8-zpl4j   member2   1/1     Running   0          17s
```

### Delete a propagationPolicy

Delete the propagationPolicy by name:
```shell
kubectl delete propagationpolicy example-policy
```
Deleting a propagationPolicy does not delete deployments propagated to member clusters. You need to delete deployments in the karmada control-plane:
```shell
kubectl delete deployment nginx
```

## Deploy deployment into a specified set of target clusters

`.spec.placement.clusterAffinity` field of PropagationPolicy represents scheduling restrictions on a certain set of clusters, without which any cluster can be scheduling candidates.

It has four fields to set:
- LabelSelector
- FieldSelector
- ClusterNames
- ExcludeClusters

### LabelSelector

LabelSelector is a filter to select member clusters by labels. It uses `*metav1.LabelSelector` type. If it is non-nil and non-empty, only the clusters match this filter will be selected.

PropagationPolicy can be configured as follows:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: test-propagation
spec:
  #...
  placement:
    clusterAffinity:
      labelSelector:
        matchLabels:
          location: us
    #...
```

PropagationPolicy can also be configured as follows:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: test-propagation
spec:
  #...
  placement:
    clusterAffinity:
      labelSelector:
        matchExpressions:
        - key: location
          operator: In
          values:
          - us
    #...
```

For a description of `matchLabels` and `matchExpressions`, you can refer to [Resources that support set-based requirements](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#resources-that-support-set-based-requirements).

### FieldSelector

FieldSelector is a filter to select member clusters by fields. If it is non-nil and non-empty, only the clusters match this filter will be selected.

PropagationPolicy can be configured as follows:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  #...
  placement:
    clusterAffinity:
      fieldSelector:
        matchExpressions:
        - key: provider
          operator: In
          values:
          - huaweicloud
        - key: region
          operator: NotIn
          values:
          - cn-south-1
    #...
```

If multiple `matchExpressions` are specified in the `fieldSelector`, the cluster must match all `matchExpressions`.

The `key` in `matchExpressions` now supports three values: `provider`, `region`, and `zone`, which correspond to the `.spec.provider`, `.spec.region`, and `.spec.zone` fields of the Cluster object, respectively.

The `operator` in `matchExpressions` now supports `In` and `NotIn`.

### ClusterNames

Users can set the `ClusterNames` field to specify the selected clusters.

PropagationPolicy can be configured as follows:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  #...
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
    #...
```

### ExcludeClusters

Users can set the `ExcludeClusters` fields to specify the clusters to be ignored.

PropagationPolicy can be configured as follows:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
 name: nginx-propagation
spec:
 #...
 placement:
  clusterAffinity:
   exclude:
    - member1
    - member3
  #...
```

## Multiple cluster affinity groups

Users can set the ClusterAffinities field and declare multiple cluster groups in PropagationPolicy. The scheduler will evaluate these groups one by one in the order they appear in the spec, the group that does not satisfy scheduling restrictions will be ignored which means all clusters in this group will not be selected unless it also belongs to the next group(a cluster cloud belong to multiple groups).

If none of the groups satisfy the scheduling restrictions, the scheduling fails, which means no cluster will be selected.

Note:

1. ClusterAffinities can not co-exist with ClusterAffinity.
2. If both ClusterAffinity and ClusterAffinities are not set, any cluster can be scheduling candidates.

Potential use case 1:
The private clusters in the local data center could be the main group, and the managed clusters provided by cluster providers could be the secondary group. So that the Karmada scheduler would prefer to schedule workloads to the main group and the second group will only be considered in case of the main group does not satisfy restrictions(like, lack of resources).

PropagationPolicy can be configured as follows:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
 name: test-propagation
spec:
 #...
 placement:
  clusterAffinities:
   - affinityName: local-clusters
     clusterNames:
      - local-member1
      - local-member2
   - affinityName: cloud-clusters
     clusterNames:
      - public-cloud-member1
      - public-cloud-member2
  #...
```

Potential use case 2: For the disaster recovery scenario, the clusters could be organized to primary and backup groups, the workloads would be scheduled to primary clusters firstly, and when primary cluster fails(like data center power off), Karmada scheduler could migrate workloads to the backup clusters.

PropagationPolicy can be configured as follows:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
 name: test-propagation
spec:
 #...
 placement:
  clusterAffinities:
   - affinityName: primary-clusters
     clusterNames:
      - member1
   - affinityName: backup-clusters
     clusterNames:
      - member1
      - member2
  #...
```

For more detailed design information, please refer to [Multiple scheduling group](https://github.com/karmada-io/karmada/tree/master/docs/proposals/scheduling/multi-scheduling-group).

## Schedule based on Taints and Tolerations

`.spec.placement.clusterTolerations` field of PropagationPolicy represents the tolerations. Like kubernetes, tolerations need to be used in conjunction with taints on the clusters.
After setting one or more taints on the cluster, workloads cannot be scheduled or run on these clusters unless the policy explicitly states that these taints are tolerated.
Karmada currently supports taints whose effects are `NoSchedule` and `NoExecute`.

You can `karmadactl taint` to taint a cluster:

```shell
# Update cluster 'foo' with a taint with key 'dedicated' and value 'special-user' and effect 'NoSchedule'
# If a taint with that key and effect already exists, its value is replaced as specified
karmadactl taint clusters foo dedicated=special-user:NoSchedule
```

In order to schedule to the above cluster, you need to declare the following in the Policy:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  #...
  placement:
    clusterTolerations:
    - key: dedicated
      value: special-user
      Effect: NoSchedule 
```

`NoExecute` taints are also used in `Multi-cluster Failover`. See details [here](../failover/failover-analysis.md).

## Multi region HA support

By leveraging the spread-by-region constraint, users are able to deploy workloads aross regions, e.g. people may want their workloads always running on different regions for HA purposes.

To enable multi region deployment, you should use the command below to customize the region of clusters.

```shell
$ kubectl --kubeconfig ~/.kube/karmada.config --context karmada-apiserver edit cluster/member1

...
spec:
  apiEndpoint: https://172.18.0.4:6443
  id: 257b5c81-dfae-4ae5-bc7c-6eaed9ed6a39
  impersonatorSecretRef:
    name: member1-impersonator
    namespace: karmada-cluster
  region: test
...
```

Then you need to restrict the maximum and minimum number of cluster groups to be selected. Assume there are two regions, you may want to deploy the workload in one cluster per region. You can refer to:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  #...
  placement:
    replicaScheduling:
     replicaSchedulingType: Duplicated  
    spreadConstraints:
      - spreadByField: region
        maxGroups: 2
        minGroups: 2
      - spreadByField: cluster
        maxGroups: 1
        minGroups: 1
```

:::note

If the replica division preference is `StaticWeightList`, the declaration specified by spread constraints will be ignored.
If one of spread constraints are using `SpreadByField`, the `SpreadByFieldCluster` must be included.
For example, when using `SpreadByFieldRegion` to specify region groups, at the meantime, you must use
`SpreadByFieldCluster` to specify how many clusters should be selected.

:::

## Multiple strategies of replica Scheduling

`.spec.placement.replicaScheduling` represents the scheduling policy on dealing with the number of replicas when propagating resources that have replicas in spec (e.g. deployments, statefulsets and CRDs which can be interpreted by [Customizing Resource Interpreter](../globalview/customizing-resource-interpreter.md)) to member clusters.

It has two replicaSchedulingTypes which determines how the replicas is scheduled when Karmada propagating a resource:

* `Duplicated`: duplicate the same replicas to each candidate member cluster from resources.
* `Divided`: divide replicas into parts according to numbers of valid candidate member clusters, and exact replicas for each cluster are determined by `ReplicaDivisionPreference`.

`ReplicaDivisionPreference` determines the replicas is divided when ReplicaSchedulingType is `Divided`.

* `Aggregated`: divide replicas into clusters as few as possible, while respecting clusters' resource availabilities during the division. See details in [Schedule based on Cluster Resource Modeling](./cluster-resources.md).
* `Weighted`: divide replicas by weight according to `WeightPreference`. There are two kinds of `WeightPreference` to set. `StaticWeightList` statically allocates replicas to target clusters based on weight. Target clusters can be selected by `ClusterAffinity`. `DynamicWeight` specifies the factor to generate the dynamic weight list. If specified, `StaticWeightList` will be ignored. Karmada currently supports the factor `AvailableReplicas`.

The following gives two simple examples:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  #...
  placement:
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

It means replicas will be evenly propagated to member1 and member2.

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  #...
  placement:
    replicaScheduling:
      replicaDivisionPreference: Weighted
      replicaSchedulingType: Divided
      weightPreference:
        dynamicWeight: AvailableReplicas 
```

It means replicas will be propagated based on available replicas in member clusters. For example, the scheduler selected 3 cluster(A/B/C) and should divide 12 replicas to them.
Based on cluster resource modeling, we get that the max available replica of A, B, C is 6, 12, 18. 
Therefore, the weight of cluster A:B:C will be 6:12:18 (equal to 1:2:3). At last, the assignment would be "A: 2, B: 4, C: 6".

:::note

If `ReplicaDivisionPreference` is set to `Weighted` and `WeightPreference` is not set, the default strategy is to weight all clusters averagely.

:::

## Configure PropagationPolicy/ClusterPropagationPolicy priority
If a PropagationPolicy and a ClusterPropagationPolicy match the workload, Karmada will select the PropagationPolicy.
If multiple PropagationPolicies match the workload, Karmada will select the one with the highest priority. A PropagationPolicy supports implicit and explicit priorities.
The same goes for ClusterPropagationPolicy.

The following takes PropagationPolicy as an example.

### Configure explicit priority
The `spec.priority` in a PropagationPolicy represents the explicit priority. A greater value means a higher priority. 
> Note: If not specified, defaults to 0.  

Assume there are multiple policies:  
```yaml
# highexplicitpriority.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-high-explicit-priority
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      labelSelector:
        matchLabels:
          app: nginx
  priority: 2
  placement:
    clusterAffinity:
      clusterNames:
        - member1
---
# lowexplicitpriority.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-low-explicit-priority
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      labelSelector:
        matchLabels:
          app: nginx
  priority: 1
  placement:
    clusterAffinity:
      clusterNames:
        - member2
---
# defaultexplicitpriority.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-low-explicit-priority
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      labelSelector:
        matchLabels:
          app: nginx
  placement:
    clusterAffinity:
      clusterNames:
        - member3
```
The `nginx` deployment in `default` namespace will be propagated to cluster `member1`.

### Configure implicit priority
The `spec.resourceSelectors` in a PropagationPolicy represents the implicit priority. The priority order (from low to high) is as follows:
* The PropagationPolicy resourceSelector whose name and labelSelector are empty matches the workload.
* The labelSelector of PropagationPolicy resourceSelector matches the workload.
* The name of PropagationPolicy resourceSelector matches the workload. 

Assume there are multiple policies:  
```yaml
# emptymatch.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-emptymatch
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
  placement:
    clusterAffinity:
      clusterNames:
        - member1
---
# labelselectormatch.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-labelselectormatch
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      labelSelector:
        matchLabels:
          app: nginx
  placement:
    clusterAffinity:
      clusterNames:
        - member2
---
# namematch.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-namematch
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  placement:
    clusterAffinity:
      clusterNames:
        - member3
```
The `nginx` deployment in `default` namespace will be propagated to cluster `member3`.

### Choose from same-priority PropagationPolicies
If multiple PropagationPolicies with the same explicit priority match the workload, the one with the highest implicit priority will be selected.  

Assume there are multiple policies:  
```yaml
# explicit-labelselectormatch.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-explicit-labelselectormatch
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      labelSelector:
        matchLabels:
          app: nginx
  priority: 3
  placement:
    clusterAffinity:
      clusterNames:
        - member1
---
# explicit-namematch.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-explicit-namematch
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  priority: 3
  placement:
    clusterAffinity:
      clusterNames:
        - member3
```
The `nginx` deployment in `default` namespace will be propagated to cluster `member3`.

If both explicit and implicit priorities are the same, Karmada applies the PropagationPolicy in an ascending alphabetical order, for example, choosing xxx-a-xxx instead of xxx-b-xxx.  

Assume there are multiple policies:  
```yaml
# higher-alphabetical.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-b-higher-alphabetical
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  priority: 3
  placement:
    clusterAffinity:
      clusterNames:
        - member1
---
# lower-alphabetical.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-a-lower-alphabetical
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  priority: 3
  placement:
    clusterAffinity:
      clusterNames:
        - member2
```
The `nginx` deployment in `default` namespace will be propagated to cluster `member2`.

