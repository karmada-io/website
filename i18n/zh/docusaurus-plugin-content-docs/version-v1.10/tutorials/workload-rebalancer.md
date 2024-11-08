---
title: 负载重平衡
---

## 目标

一般情况下，工作负载类资源被调度后，会保持调度结果不变，其副本分布不会轻易发生变化。
现在，假设某些特殊情况下，您想主动触发一次重调度，可以通过使用 WorkloadRebalancer 来实现。

因此，本节将指导您如何使用 WorkloadRebalancer 来触发重调度。

## 前提条件

### Karmada 及多个子集群已安装

运行安装命令：

```shell
git clone https://github.com/karmada-io/karmada
cd karmada
hack/local-up-karmada.sh
export KUBECONFIG=~/.kube/karmada.config:~/.kube/members.config
```

> **说明：**
>
> 在开始之前，我们应该至少安装三个 kubernetes 集群，一个用于安装 Karmada 控制平面，另外两个作为成员集群。
> 为了方便，我们直接使用 [hack/local-up-karmada.sh](https://karmada.io/docs/installation/#install-karmada-for-development-environment) 脚本快速准备上述集群。
>
> 执行上述命令后，您将看到 Karmada 控制平面和多个成员集群已安装完成。

## 教程

### 第一步：创建一个 Deployment

首先准备一个名为 `foo` 的 Deployment，您可以创建一个新文件 `deployment.yaml`，内容如下：

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

然后，运行下述命令来创建这些资源：

```bash
kubectl --context karmada-apiserver apply -f deployment.yaml
```

您可以通过下述方式来检查该步骤是否成功：

```bash
$ karmadactl --karmada-context karmada-apiserver get deploy foo
NAME   CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
foo    member1   2/2     2            2           20s   Y
foo    member2   1/1     1            1           20s   Y
```

可以看到，2 个副本分发到 member1 集群，1 个副本分发到 member2 集群。

### 第二步：在 member1 集群添加 `NoExecute` 污点以模拟集群故障

1）运行以下命令将 `NoExecute` 污点添加到 member1 集群：

```bash
$ karmadactl --karmada-context=karmada-apiserver taint clusters member1 workload-rebalancer-test:NoExecute
cluster/member1 tainted
```

然后，由于集群故障转移，将触发重调度，并且所有副本将被分发到 member2 集群，您可以看到：

```bash
$ karmadactl --karmada-context karmada-apiserver get deploy foo
NAME   CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
foo    member2   3/3     3            3           57s   Y
```

2）运行以下命令从 member1 集群中移除上述 `NoExecute` 污点：

```bash
$ karmadactl --karmada-context=karmada-apiserver taint clusters member1 workload-rebalancer-test:NoExecute-
cluster/member1 untainted
```

移除污点不会导致副本传播变化，因为调度结果是惰性的，所有副本将保持在 member2 集群中不变。

### 第三步：创建一个 WorkloadRebalancer 来触发重调度

为了触发上述资源的重调度，您可以创建一个新文件 `workload-rebalancer.yaml`，内容如下：

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

然后运行以下命令来创建该资源：

```bash
kubectl --context karmada-apiserver apply -f workload-rebalancer.yaml
```

您将得到 `workloadrebalancer.apps.karmada.io/demo created` 的结果，这意味着该资源创建成功。

### 第四步：检查 WorkloadRebalancer 的状态

运行以下命令：

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

因此，您可以在 `workloadrebalancer/demo` 的 `status.observedWorkloads` 字段中观察重调度的结果。
如上述结果所示，`deployment/foo` 已成功重新调度。

### 第五步：观察 WorkloadRebalancer 的实际效果。

您可以观察 `deployment/foo` 的副本实际分发状态：

```bash
$ karmadactl --karmada-context karmada-apiserver get deploy foo
NAME   CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE     ADOPTION
foo    member1   2/2     2            2           3m14s   Y
foo    member2   1/1     1            1           4m37s   Y
```

您可以看到重调度已完成，有2个副本迁移回到 member1 集群，而 member2 集群中原有的1个副本保持不变。

此外，您可以观察到由 `default-scheduler` 发出的调度事件，例如：

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

### 第六步：更新并自动清理 WorkloadRebalancer

假设您希望 WorkloadRebalancer 能在将来自动清理，您只需编辑资源声明并将 `spec.ttlSecondsAfterFinished` 字段设置为 300，例如：

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

在您应用了这个修改后，这个 WorkloadRebalancer 资源将在 300 秒后自动删除。
