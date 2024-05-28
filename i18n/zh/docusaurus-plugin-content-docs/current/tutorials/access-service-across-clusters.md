---
title: 通过原生 Service 跨集群访问服务
---

在 Karmada 中，MultiClusterService 可以让用户通过原生 Service 域名（例如 `foo.svc`）跨集群访问服务，目的是让用户获得如在单个集群中访问服务般访问跨集群服务的流畅体验。

本文档提供了这样一个案例：启用 MultiClusterService 来通过原生 Service 跨集群访问服务。

## 前提条件

### Karmada 已安装

您可以参考[快速入门](https://github.com/karmada-io/karmada#quick-start)安装 Karmada，或直接运行 `hack/local-up-karmada.sh` 脚本，该脚本也用于运行 E2E 测试。

### 成员集群网络

确保至少已有两个集群加入 Karmada，并且成员集群之间的容器网络已连通。

* 如果您使用 `hack/local-up-karmada.sh` 脚本部署 Karmada，Karmada 中会有 3 个成员集群，并且集群 `member1` 和 `member2` 间的容器网络已连通。
* 您可以使用 `Submariner` 或其他相关开源项目来连接成员集群之间的网络。

:::note 注意
为了防止路由冲突，集群中 Pod 和 Service 的 CIDR 必须互不重叠。
:::

### 在 karmada-controller-manager 中启用 MultiClusterService

要在 karmada-controller-manager 中启用 MultiClusterService 功能，请运行以下命令：

```shell
kubectl --context karmada-host get deploy karmada-controller-manager -n karmada-system -o yaml | sed '/- --v=4/i \        - --feature-gates=MultiClusterService=true' | kubectl --context karmada-host replace -f -
```

请注意，MultiClusterService 功能默认是禁用的，可以通过 `--feature-gates=MultiClusterService=true` 参数开启。

如果您倾向于更谨慎的方法，请按照以下步骤操作：

1. 运行 `kubectl --context karmada-host edit deploy karmada-controller-manager -n karmada-system`。
2. 检查 `spec.template.spec.containers[0].command` 字段中是否存在 `--feature-gates=MultiClusterService=true`。
3. 如果没有，添加 `--feature-gates=MultiClusterService=true` 来开启功能。

## 在 `member1` 集群中部署 Deployment

我们需要在 `member1` 集群中部署 Deployment：
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
```

部署完成后，您可以检查创建的 Pod：
```sh
$ karmadactl get po
NAME                     CLUSTER   READY   STATUS              RESTARTS   AGE
nginx-5c54b4855f-6sq9s   member1   1/1     Running             0          28s
nginx-5c54b4855f-vp948   member1   1/1     Running             0          28s
```

## 在 `member2` 集群中部署 curl Pod

让我们在 `member2` 集群中部署一个 curl Pod：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: curl
  labels:
    app: curl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: curl
  template:
    metadata:
      labels:
        app: curl
    spec:
      containers:
      - image: curlimages/curl:latest
        command: ["sleep", "infinity"]
        name: curl
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
  name: curl-propagation
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: curl
  placement:
    clusterAffinity:
      clusterNames:
        - member2
```

部署完成后，您可以检查创建的 Pod：
```sh
$ karmadactl get po -C member2
NAME                    CLUSTER   READY   STATUS    RESTARTS   AGE
curl-6894f46595-c75rc   member2   1/1     Running   0          15s
```

稍后，我们将在此 Pod 中执行 curl 命令。

## 在 Karmada 中部署 MultiClusterService 与 Service

现在，我们不使用 PropagationPolicy/ClusterPropagationPolicy，而是利用 MultiClusterService 来分发 Service。

要在 Karmada 中启用 MultiClusterService，请部署以下 yaml：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: nginx
---
apiVersion: networking.karmada.io/v1alpha1
kind: MultiClusterService
metadata:
   name: nginx
spec:
  types:
    - CrossCluster
  consumerClusters:
    - name: member2
  providerClusters:
    - name: member1
```

## 从 `member2` 集群访问后端 Pod

要从 `member2` 集群访问 `member1` 集群中的后端 Pod，请执行以下命令：
```sh
$ karmadactl exec -C member2 curl-6894f46595-c75rc -it -- sh
~ $ curl http://nginx.default
Hello, world!
Version: 1.0.0
Hostname: nginx-0
```

在此案例中，Pod 仅位于 `member1` 集群。但是，使用 MultiClusterService，就可以通过原生 Service 域名从 `member2` 集群实现跨集群访问。
