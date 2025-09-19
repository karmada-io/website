---
title: 面向二次调度的集群精确调度器估算器
---

用户可以根据各成员集群的可用资源，将某个工作负载的多个副本拆分给不同的成员集群。当某些成员集群资源不足时，调度器会通过调用 `karmada-scheduler-estimator`，避免将过多副本分配到这些成员集群。

## 前提条件

### 已安装 Karmada

可以参考 [quick-start](https://github.com/karmada-io/karmada#quick-start) 安装 Karmada，或直接运行 `hack/local-up-karmada.sh` 脚本（该脚本同样用于运行我们的 E2E 用例）。

### 成员集群组件已就绪

确保所有成员集群都已被接入，并且所有成员集群的对应 `karmada-scheduler-estimator` 已安装到 `karmada-host` 上。

你可以通过以下命令进行检查：

```bash
# 检查成员集群是否已被接入
$ kubectl get cluster
NAME       VERSION   MODE   READY   AGE
member1    v1.19.1   Push   True    11m
member2    v1.19.1   Push   True    11m
member3    v1.19.1   Pull   True    5m12s

# 检查某成员集群对应的 karmada-scheduler-estimator 是否运行正常
$ kubectl --context karmada-host get pod -n karmada-system | grep estimator
karmada-scheduler-estimator-member1-696b54fd56-xt789   1/1     Running   0          77s
karmada-scheduler-estimator-member2-774fb84c5d-md4wt   1/1     Running   0          75s
karmada-scheduler-estimator-member3-5c7d87f4b4-76gv9   1/1     Running   0          72s
```

- 如果你在物理机上部署 Karmada，请参阅[通过二进制文件安装](../../installation/install-binary.md#install-karmada-scheduler-estimator)。
- 如果你在宿主 Kubernetes 集群中部署 Karmada：
  - 如果成员集群尚未接入，可以使用 `hack/deploy-agent-and-estimator.sh` 同时部署 `karmada-agent` 和 `karmada-scheduler-estimator`。
  - 如果成员集群已接入，可以使用 `hack/deploy-scheduler-estimator.sh` 仅部署 `karmada-scheduler-estimator`。

### 调度器选项 '--enable-scheduler-estimator'

在所有成员集群完成加入且估算器均已就绪后，请通过选项 `--enable-scheduler-estimator=true` 启用调度器估算器。

```bash
# 编辑 karmada-scheduler 的 Deployment
kubectl --context karmada-host edit -n karmada-system deployments.apps karmada-scheduler
```

随后将 `--enable-scheduler-estimator=true` 选项添加到 `karmada-scheduler` 容器的启动命令中。

## 示例

现在可以将副本划分到不同的成员集群。需要注意：`propagationPolicy.spec.replicaScheduling.replicaSchedulingType` 必须为 `Divided`，且 `propagationPolicy.spec.replicaScheduling.replicaDivisionPreference` 必须为 `Aggregated`。调度器将依据成员集群的可用资源总量，尽可能以聚合的方式划分副本。

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: aggregated-policy
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
        - member3
    replicaScheduling:
      replicaSchedulingType: Divided
      replicaDivisionPreference: Aggregated
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  replicas: 5
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
        ports:
        - containerPort: 80
          name: web-1
        resources:
          requests:
            cpu: "1"
            memory: 2Gi
```

可以看到，所有副本都被分配到了尽可能少的集群中。

```
$ kubectl get deployments.apps          
NAME    READY   UP-TO-DATE   AVAILABLE   AGE
nginx   5/5     5            5           2m16s
$ kubectl get rb nginx-deployment -o=custom-columns=NAME:.metadata.name,CLUSTER:.spec.clusters  
NAME               CLUSTER
nginx-deployment   [map[name:member1 replicas:5] map[name:member2] map[name:member3]]
```

随后，将该 Deployment 的资源请求调大，再次尝试。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  replicas: 5
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
        ports:
        - containerPort: 80
          name: web-1
        resources:
          requests:
            cpu: "100"
            memory: 200Gi
```

由于任一成员集群的节点都无法满足如此大的 CPU 与内存请求，工作负载将无法完成调度。

```bash
$ kubectl get deployments.apps 
NAME    READY   UP-TO-DATE   AVAILABLE   AGE
nginx   0/5     0            0           2m20s
$ kubectl get rb nginx-deployment -o=custom-columns=NAME:.metadata.name,CLUSTER:.spec.clusters  
NAME               CLUSTER
nginx-deployment   <none>
```
