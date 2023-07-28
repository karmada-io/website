---
title: Autoscaling Deployment across clusters with CronFederatedHPA
---

In Karmada, the CronFederatedHPA is responsible for scaling replicas of workloads (such as Deployments) or the minReplicas/maxReplicas of FederatedHPAs. Its purpose is to proactively scale the business in order to handle sudden spikes in load.

This document provides an example of how to enable CronFederatedHPA for a cross-cluster nginx deployment.

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
nginx-777bc7b6d7-rmmzv   member1   1/1     Running   0          104s
nginx-777bc7b6d7-9gf7g   member2   1/1     Running   0          104s
```

## Deploy CronFederatedHPA in Karmada control plane

Then let's deploy CronFederatedHPA in Karmada control plane to scale up the Deployment:
```yaml
apiVersion: autoscaling.karmada.io/v1alpha1
kind: CronFederatedHPA
metadata:
  name: nginx-cronfhpa
  namespace: default
spec:
   scaleTargetRef:
      apiVersion: apps/v1
      kind: Deployment
      name: nginx
   rules:
   - name: "scale-up"
     schedule: "*/1 * * * *"
     targetReplicas: 5
     suspend: false
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
The expression `*/1 * * * *` means that the nginx deployment's replicas should be updated to 5 every minute. This ensures that the workload's replicas will be scaled up to 5 in order to handle sudden load peaks.

## Testing scaling up

After one minute, the replicas of nginx deployment is scaled to 5 by CronFederatedHPA. Let's now check the number of pods to verify if the scaling has been done as expected:
```sh
$ karmadactl get pods
NAME                     CLUSTER   READY   STATUS              RESTARTS   AGE
nginx-777bc7b6d7-8v9b4   member2   1/1     Running             0          18s
nginx-777bc7b6d7-9gf7g   member2   1/1     Running             0          8m2s
nginx-777bc7b6d7-5snhz   member1   1/1     Running             0          18s
nginx-777bc7b6d7-rmmzv   member1   1/1     Running             0          8m2s
nginx-777bc7b6d7-z9kwg   member1   1/1     Running             0          18s
```

By checking the status field of CronFederatedHPA, you can access the scaling history:
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
    targetReplicas: 5
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx
status:
  executionHistories:
  - nextExecutionTime: "2023-07-29T03:27:00Z"  # The next expected scaling time
    ruleName: scale-up
    successfulExecutions:
    - appliedReplicas: 5                       # CronFederatedHPA updates the nginx deployment's replicas to 5
      executionTime: "2023-07-29T03:26:00Z"    # The actual scaling time
      scheduleTime: "2023-07-29T03:26:00Z"     # The last expected scaling time
```
The scaling history includes information about both successful and failed scaling operations.