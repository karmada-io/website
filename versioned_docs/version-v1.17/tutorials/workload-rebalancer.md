---
title: Workload Rebalancer
---

## Objectives

In general, once workload replicas are scheduled, the scheduling result remains fixed, and the replica propagation does not change. Now, assuming
that you want to actively trigger a fresh rescheduling in a special case, you can achieve it by `WorkloadRebalancer`.

This guide will cover how to trigger a rescheduling using `WorkloadRebalancer`.

## Prerequisites

### Multi-cluster Karmada has been installed

Run the commands:

```shell
git clone https://github.com/karmada-io/karmada
cd karmada
hack/local-up-karmada.sh
export KUBECONFIG=~/.kube/karmada.config:~/.kube/members.config
```

> **Note:**
>
> Before following this guide, you should have created at least three kubernetes clusters, one will be used to host Karmada control plane, and the rest will be member clusters.
> For convenience, we use [hack/local-up-karmada.sh](https://karmada.io/docs/installation/#install-karmada-for-development-environment) script to quickly prepare the clusters mentioned.
>
> Once the script is executed, you will see Karmada control plane installed with multi member clusters.

## Tutorial

### Step 1: Create a Deployment

First, create a Deployment named `foo`, filling a new file `deployment.yaml` with the following content:

<details>
<summary>deployment.yaml</summary>

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo
  labels:
    app: test
spec:
  replicas: 3
  selector:
    matchLabels:
      app: foo
  template:
    metadata:
      labels:
        app: foo
    spec:
      terminationGracePeriodSeconds: 0
      containers:
        - image: nginx
          name: foo
          resources:
            limits:
              cpu: 10m
              memory: 10Mi
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: default-pp
spec:
  placement:
    clusterTolerations:
      - effect: NoExecute
        key: workload-rebalancer-test
        operator: Exists
        tolerationSeconds: 0
    clusterAffinity:
      clusterNames:
        - member1
        - member2
    replicaScheduling:
      replicaDivisionPreference: Weighted
      replicaSchedulingType: Divided
      weightPreference:
        dynamicWeight: AvailableReplicas
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: foo
      namespace: default
```

</details>

Then run the following command to create those resources:

```bash
kubectl --context karmada-apiserver apply -f deployment.yaml
```

You can check whether this step succeeded like this:

```bash
$ karmadactl --karmada-context karmada-apiserver get deploy foo
NAME   CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
foo    member1   2/2     2            2           20s   Y
foo    member2   1/1     1            1           20s   Y
```

Thus, 2 replicas were propagated to member1 cluster and 1 replica was propagated to member2 cluster.

### Step 2: Add `NoExecute` taint to member1 cluster to mock cluster failover

* Run the following command to add `NoExecute` taint to member1 cluster:

```bash
$ karmadactl --karmada-context=karmada-apiserver taint clusters member1 workload-rebalancer-test:NoExecute
cluster/member1 tainted
```

Then, rescheduling will be triggered due to cluster failover, and all replicas will be propagated to member2 cluster,
as you can see:

```bash
$ karmadactl --karmada-context karmada-apiserver get deploy foo
NAME   CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
foo    member2   3/3     3            3           57s   Y
```

* Run the following command to remove the previous `NoExecute` taint from member1 cluster:

```bash
$ karmadactl --karmada-context=karmada-apiserver taint clusters member1 workload-rebalancer-test:NoExecute-
cluster/member1 untainted
```

Removing the taint will not cause replicas to repropagate, because the scheduling result stays fixed, so all
replicas will keep being in member2 cluster.

### Step 3. Apply a WorkloadRebalancer to trigger rescheduling

In order to trigger the rescheduling of the above resources, you can create a new file `workload-rebalancer.yaml`
with the following content:

```yaml
apiVersion: apps.karmada.io/v1alpha1
kind: WorkloadRebalancer
metadata:
  name: demo
spec:
  workloads:
    - apiVersion: apps/v1
      kind: Deployment
      name: foo
      namespace: default
```

Then run the following command to apply it:

```bash
kubectl --context karmada-apiserver apply -f workload-rebalancer.yaml
```

You will get a `workloadrebalancer.apps.karmada.io/demo created` result, which means the API was created successfully.

### Step 4: Check the status of WorkloadRebalancer.

Run the following command:

```bash
$ kubectl --context karmada-apiserver get workloadrebalancer demo -o yaml
apiVersion: apps.karmada.io/v1alpha1
kind: WorkloadRebalancer
metadata:
  creationTimestamp: "2024-05-25T09:49:51Z"
  generation: 1
  name: demo
spec:
  workloads:
  - apiVersion: apps/v1
    kind: Deployment
    name: foo
    namespace: default
status:
  finishTime: "2024-05-25T09:49:51Z"
  observedGeneration: 1
  observedWorkloads:
  - result: Successful
    workload:
      apiVersion: apps/v1
      kind: Deployment
      name: foo
      namespace: default
```

Thus, you can observe the rescheduling result at `status.observedWorkloads` field of `workloadrebalancer/demo`.
As you can see, `deployment/foo` was rescheduled successfully.

### Step 5: Observe the real effect of WorkloadRebalancer

You can observe the propagation status of `deployment/foo` replicas:

```bash
$ karmadactl --karmada-context karmada-apiserver get deploy foo
NAME   CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE     ADOPTION
foo    member1   2/2     2            2           3m14s   Y
foo    member2   1/1     1            1           4m37s   Y
```

As you see, rescheduling was triggered and 2 replicas migrated back to member1 cluster, while 1 replica in member2 cluster remains unchanged.

Besides, you can observe that a schedule event was emitted by `default-scheduler`:

```bash
$ kubectl --context karmada-apiserver describe deployment foo
...
Events:
  Type    Reason                  Age                From                                Message
  ----    ------                  ----               ----                                -------
  ...
  Normal   ScheduleBindingSucceed           3m34s (x2 over 4m57s)   default-scheduler                              Binding has been scheduled successfully. Result: {member1:2, member2:1}
  Normal   AggregateStatusSucceed           3m20s (x20 over 4m57s)  resource-binding-status-controller             Update resourceBinding(default/foo-deployment) with AggregatedStatus successfully.
  ...
```

### Step 6: Update and auto-clean WorkloadRebalancer

Assuming you want the WorkloadRebalancer resource to be auto cleaned in the future, you can just edit it and set
`spec.ttlSecondsAfterFinished` field to `300`, just like:

```yaml
apiVersion: apps.karmada.io/v1alpha1
kind: WorkloadRebalancer
metadata:
  name: demo
spec:
  ttlSecondsAfterFinished: 300
  workloads:
    - apiVersion: apps/v1
      kind: Deployment
      name: foo
      namespace: default
```

Once this modification has been applied, this WorkloadRebalancer resource will be auto deleted after 300 seconds.
