---
title: 多集群服务发现
---

用户能够通过[多集群服务API](https://github.com/kubernetes-sigs/mcs-api)在集群之间导出和导入服务。

> 注意：使用该特性需要满足成员集群的kubernetes版本在v1.21以上（包含v1.21）。
## 准备开始

### 安装Karmada

我们可以通过参考[快速开始](https://github.com/karmada-io/karmada#quick-start)来安装Karmada，或者直接运行 `hack/local-up-karmada.sh` 脚本，我们的E2E测试执行正是使用了该脚本。


### 成员集群网络

确保至少有两个集群被添加到 Karmada，并且成员集群之间的容器网络可相互连接。

- 如果你使用 `hack/local-up-karmada.sh` 脚本来部署 Karmada，Karmada 将有三个成员集群，`member1` 和 `member2` 的容器网络将被连接。
- 你可以使用 `Submariner` 或其他相关的开源项目来连接成员集群之间的网络。
> 注意：为了防止路由冲突，集群之间的Pod和Service CIDR需要满足不重叠。

### 安装 ServiceExport 和 ServiceImport CRD

我们需要在成员集群中安装ServiceExport和ServiceImport。

在**karmada控制平面**上安装完 ServiceExport 和 ServiceImport 之后，我们可以创建 `ClusterPropagationPolicy` 来分发这两个 CRD 到成员集群。

```yaml
# propagate ServiceExport CRD
apiVersion: policy.karmada.io/v1alpha1
kind: ClusterPropagationPolicy
metadata:
  name: serviceexport-policy
spec:
  resourceSelectors:
    - apiVersion: apiextensions.k8s.io/v1
      kind: CustomResourceDefinition
      name: serviceexports.multicluster.x-k8s.io
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
---        
# propagate ServiceImport CRD
apiVersion: policy.karmada.io/v1alpha1
kind: ClusterPropagationPolicy
metadata:
  name: serviceimport-policy
spec:
  resourceSelectors:
    - apiVersion: apiextensions.k8s.io/v1
      kind: CustomResourceDefinition
      name: serviceimports.multicluster.x-k8s.io
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
```
## 示例

### 第1步：在`member1`集群上部署服务

我们需要在 `member1` 集群上部署服务以便发现。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: serve
spec:
  replicas: 1
  selector:
    matchLabels:
      app: serve
  template:
    metadata:
      labels:
        app: serve
    spec:
      containers:
      - name: serve
        image: jeremyot/serve:0a40de8
        args:
        - "--message='hello from cluster member1 (Node: {{env \"NODE_NAME\"}} Pod: {{env \"POD_NAME\"}} Address: {{addr}})'"
        env:
          - name: NODE_NAME
            valueFrom:
              fieldRef:
                fieldPath: spec.nodeName
          - name: POD_NAME
            valueFrom:
              fieldRef:
                fieldPath: metadata.name
---      
apiVersion: v1
kind: Service
metadata:
  name: serve
spec:
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: serve
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: mcs-workload
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: serve
    - apiVersion: v1
      kind: Service
      name: serve
  placement:
    clusterAffinity:
      clusterNames:
        - member1
```

### 第2步：导出服务到 `member2` 集群

- 在**karmada控制平面**上创建一个 `ServiceExport` 对象，然后创建一个 `PropagationPolicy` ，将 ` ServiceExport` 对象分发到 ` member1` 集群。

```yaml
apiVersion: multicluster.x-k8s.io/v1alpha1
kind: ServiceExport
metadata:
  name: serve
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: serve-export-policy
spec:
  resourceSelectors:
    - apiVersion: multicluster.x-k8s.io/v1alpha1
      kind: ServiceExport
      name: serve
  placement:
    clusterAffinity:
      clusterNames:
        - member1
```

- 在**karmada控制平面**上创建一个 `ServiceImport` 对象，然后创建一个 `PropagationPlicy ` 来分发 `ServiceImport ` 对象到 `member2 `集群。

```yaml
apiVersion: multicluster.x-k8s.io/v1alpha1
kind: ServiceImport
metadata:
  name: serve
spec:
  type: ClusterSetIP
  ports:
  - port: 80
    protocol: TCP
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: serve-import-policy
spec:
  resourceSelectors:
    - apiVersion: multicluster.x-k8s.io/v1alpha1
      kind: ServiceImport
      name: serve
  placement:
    clusterAffinity:
      clusterNames:
        - member2
```

### 第3步：从 `member2` 集群获取服务

经过上述步骤，我们可以在 `member2` 集群上找到前缀为 `derived-` 的**派生服务**。然后，我们可以访问**派生服务**来访问`member1`集群上的服务。

在 `member2` 集群上启动一个Pod `request`来访问**派生服务**的ClusterIP。

```shell
# 我们可以在member2集群中找到对应的派生服务。
$ kubectl --kubeconfig ~/.kube/members.config --context member2 get svc
NAME            TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)   AGE
derived-serve   ClusterIP   10.13.205.2   <none>        80/TCP    81s
kubernetes      ClusterIP   10.13.0.1     <none>        443/TCP   15m
```

```shell
kubectl --kubeconfig ~/.kube/members.config --context member2 run -i --rm --restart=Never --image=jeremyot/request:0a40de8 request -- --duration={duration-time} --address={ClusterIP of derived service}
```

例如，如果我们使用ClusterIP地址`10.13.205.2`持续访问该服务3s，将会得到如下输出:

```shell
# 访问派生服务, 这时候member1的工作负载能正常返回一个响应。
$ kubectl --kubeconfig ~/.kube/members.config --context member2 run -i --rm --restart=Never --image=jeremyot/request:0a40de8 request -- --duration=3s --address=10.13.205.2
If you don't see a command prompt, try pressing enter.
2022/07/24 15:13:08 'hello from cluster member1 (Node: member1-control-plane Pod: serve-9b5b94f65-cp87p Address: 10.10.0.5)'
2022/07/24 15:13:09 'hello from cluster member1 (Node: member1-control-plane Pod: serve-9b5b94f65-cp87p Address: 10.10.0.5)'
pod "request" deleted
```