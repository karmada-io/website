---
title: Application-level failover
---

In the multi-cluster scenario, user workloads may be deployed in multiple clusters to improve service high availability. Karmada already supports multi-cluster failover when detecting a cluster fault. 
It's a consideration from a cluster perspective. However, some failures of clusters will only affect specific applications. From the perspective of the cluster, it may be necessary to distinguish between affected and unaffected applications.
Also, the application may still be unavailable when the control plane of the cluster is in a healthy state. Therefore, Karmada needs to provide a means of fault migration from an application perspective.

## Why Application-level Failover is Required

The following describes some scenarios of application-level failover:

* The administrator deploys an application in multiple clusters with preemptive scheduling. When cluster resources are in short supply, low-priority applications that were running normally are preempted and cannot run normally for a long time. At this time, applications cannot self-heal within a cluster. Users wants to try to schedule it to another cluster to ensure that the service is continuously served.
* The administrator use the cloud vendor's spot instance to deploy the application. When users use spot instances to deploy applications, the application may fail to run due to resources being recycled.
In this scenario, the amount of resource perceived by the scheduler is the size of the resource quota, not the actual available resources. At this time, users want to schedule the application other than the one that failed previously.
* ....

## How Do I Enable the Feature?

When an application migrates from one cluster to another, it needs to ensure that its dependencies are migrated synchronously.
Therefore, you need to ensure that `PropagateDeps` feature gate is enabled and `propagateDeps: true` is set in the propagation policy. `PropagateDeps` feature gate has evolved to Beta since Karmada v1.4 and is enabled by default.

Also, whether the application needs to be migrated depends on the health status of the application. Karmada's `Resource Interpreter Framework` is designed for interpreting resource structure. It provides users with
a interpreter operation to tell Karmada how to figure out the health status of a specific object. It's up to users to decide when to reschedule. Before you use the feature, you need to ensure that the `interpretHealth` rules for the application is configured.

The application-level failover is controlled by the `Failover` feature gate. `Failover` feature gate has evolved to Beta since Karmada v1.4 and is enabled by default.
In addition, if you use the purge mode with graceful eviction, `GracefulEviction` feature gate should be enabled. `GracefulEviction` feature gate has also evolved to Beta since Karmada v1.4 and is enabled by default.

## Configure Application Failover

`.spec.failover.application` field of PropagationPolicy represents the rules of application failover.

It has three fields to set:
* DecisionConditions
* PurgeMode
* GracePeriodSeconds

### Configure Decision Conditions

`DecisionConditions` indicates the decision conditions of performing the failover process. Only when all conditions are met can the failover process be performed.
Currently, it includes tolerance time for the application's unhealthy state. It's 300s by default.

PropagationPolicy can be configured as follows:
```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: test-propagation
spec:
  #...
  failover:
    application:
      decisionConditions:
        tolerationSeconds: 300
      #...  
```

### Configure PurgeMode

`PurgeMode` represents represents how to deal with the legacy applications on the cluster from which the application is migrated.
Karmada supports three different purgeMode for eviction:

* `Immediately` represents that Karmada will immediately evict the legacy application.
* `Graciously` represents that Karmada will wait for the application to come back to healthy on the new cluster or after a timeout is reached before evicting the application. 
You need to configure `GracePeriodSeconds` meanwhile. If the application on the new cluster cannot reach a Healthy state, Karmada will delete the application after `GracePeriodSeconds` is reached. It's 600s by default.
* `Never` represents that Karmada will not evict the application and users manually confirms how to clean up redundant copies.

PropagationPolicy can be configured as follows:
```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: test-propagation
spec:
  #...
  failover:
    application:
      decisionConditions:
        tolerationSeconds: 300
      gracePeriodSeconds: 600
      purgeMode: Graciously
      #...  
```

Or
```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: test-propagation
spec:
  #...
  failover:
    application:
      decisionConditions:
        tolerationSeconds: 300
      purgeMode: Never
      #...  
```

## Example

Assume that you have configured a propagationPolicy:
```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-propagation
spec:
  failover:
    application:
      decisionConditions:
        tolerationSeconds: 120
      purgeMode: Never
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: nginx
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
        - member3
    spreadConstraints:
      - maxGroups: 1
        minGroups: 1
        spreadByField: cluster
---
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
```

Now the application is scheduled into member2 and these two replicas run normally. Now you taint all nodes in member2 and evict the replica to construct the abnormal state of the application.

```shell
# mark node "member2-control-plane" as unschedulable in cluster member2
kubectl --context member2 cordon member2-control-plane
# delete the pod in cluster member2
kubectl --context member2 delete pod -l app=nginx
```

You can immediately find that the deployment is unhealthy now from the ResourceBinding.

```yaml
#...
status:
  aggregatedStatus:
    - applied: true
      clusterName: member2
      health: Unhealthy
      status:
        availableReplicas: 0
        readyReplicas: 0 
        replicas: 2
```

After tolerationSeconds is reached, you will find that the deployment in member2 has been evicted and it's re-scheduled to member1.

```yaml
#...
spec:
  clusters:
    - name: member1
      replicas: 2
  gracefulEvictionTasks:
    - creationTimestamp: "2023-05-08T09:29:02Z"
      fromCluster: member2
      producer: resource-binding-application-failover-controller
      reason: ApplicationFailure
      suppressDeletion: true
```

You can edit `suppressDeletion` to false in `gracefulEvictionTasks` to evict the application in the failed cluster after you confirm the failure.

:::note

Application failover is still a work in progress. We are in the progress of gathering use cases. If you are interested in this feature, please feel free to start an enhancement issue to let us know.

:::

