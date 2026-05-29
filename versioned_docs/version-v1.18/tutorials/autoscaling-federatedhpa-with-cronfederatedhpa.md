---
title: Autoscaling FederatedHPA with CronFederatedHPA
---

In Karmada, a CronFederatedHPA scales workload's replicas (any kinds of workload with scale subresource, e.g. Deployment) or FederatedHPA's minReplicas/maxReplicas, with the aim of scaling the business in advance to meet a sharp load peak.

CronFederatedHPA is designed to scale resources at a specific time. When a workload is only scaled directly by CronFederatedHPA, its replicas will remain unchanged until the specified time is reached. This means that it loses the ability to handle more requests until then.  

So, to ensure that the workload can be scaled up in advance to meet peak loads and real-time business demands later on, we recommend using CronFederatedHPA to scale FederatedHPA firstly. Then, FederatedHPA can scale the workloads based on their metrics.

This document walk you through an example of enabling CronFederatedHPA to a FederatedHPA.

## Prerequisites

### Karmada has been installed

We can install Karmada by referring to [Quick Start](https://github.com/karmada-io/karmada#quick-start), or directly run `hack/local-up-karmada.sh` script which is also used to run our E2E cases.

## Deploy workload in `member1` and `member2` cluster

We need to deploy deployment(2 replica) in member1 and member2:
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

After deploying, you can check the created pods:
```sh
$ karmadactl get pods
NAME                     CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-777bc7b6d7-cmt6k   member1   1/1     Running   0          27m
nginx-777bc7b6d7-8lmcg   member2   1/1     Running   0          27m
```

## Deploy FederatedHPA in Karmada control plane

Let's create a FederatedHPA in the Karmada control plane to manage the cross-cluster nginx deployment:
```yaml
apiVersion: autoscaling.karmada.io/v1alpha1
kind: FederatedHPA
metadata:
  name: nginx-fhpa
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
          averageUtilization: 80
```
The FederatedHPA will scale up the workload's replicas when the average CPU utilization exceeds 80%. Conversely, if the average CPU utilization falls below 80%, the workload's replicas will be scaled down.

## Deploy CronFederatedHPA in Karmada control plane

To autoscale the minReplicas of FederatedHPA, let's create CronFederatedHPA in the Karmada control plane:
```yaml
apiVersion: autoscaling.karmada.io/v1alpha1
kind: CronFederatedHPA
metadata:
  name: nginx-cronfhpa
  namespace: default
spec:
   scaleTargetRef:
      apiVersion: autoscaling.karmada.io/v1alpha1
      kind: FederatedHPA
      name: nginx-fhpa
   rules:
   - name: "scale-up"
     schedule: "*/1 * * * *"
     targetMinReplicas: 5
```

The `spec.schedule` follows the following format:
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
The expression `*/1 * * * *` means that the FederatedHPA's minReplicas should be updated to 5 every minute. This ensures that the workload's replicas will be scaled up to at least 5 in order to handle sudden load peaks.

## Test scaling up

After one minute, the minReplicas of FederatedHPA is updated to 5 by CronFederatedHPA. This triggers the scaling up of replicas for the nginx deployment to 5. Let's now check the number of pods to verify if the scaling has been done as expected:
```sh
$ karmadactl get po
NAME                     CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-777bc7b6d7-7vl2r   member1   1/1     Running   0          59s
nginx-777bc7b6d7-cmt6k   member1   1/1     Running   0          27m
nginx-777bc7b6d7-pc5dk   member1   1/1     Running   0          59s
nginx-777bc7b6d7-8lmcg   member2   1/1     Running   0          27m
nginx-777bc7b6d7-pghl7   member2   1/1     Running   0          59s
```

And if the business demand is needs more replicas, FederatedHPA will scale the replicas up based on the metrics (.e.g. cpu utilization).  

And checking the CronFederatedHPA's status field, you can see the scaling history:
```yaml
$ kubectl --kubeconfig $HOME/.kube/karmada.config --context karmada-apiserver get cronfhpa/nginx-cronfhpa -oyaml
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
    targetMinReplicas: 5
  scaleTargetRef:
    apiVersion: autoscaling.karmada.io/v1alpha1
    kind: FederatedHPA
    name: nginx-fhpa
status:
  executionHistories:
  - nextExecutionTime: "2023-07-29T07:53:00Z"   # The next expected scaling time
    ruleName: scale-up
    successfulExecutions:
    - appliedMinReplicas: 5                     # CronFederatedHPA updates the minReplicas to 5
      executionTime: "2023-07-29T07:52:00Z"     # The actual scaling time
      scheduleTime: "2023-07-29T07:52:00Z"      # The last expected scaling time
```
The scaling history includes information about both successful and failed scaling operations.