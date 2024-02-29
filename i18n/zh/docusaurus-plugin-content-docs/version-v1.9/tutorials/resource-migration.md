---
title: 平滑迁移
---

## 目标

假设用户安装了一个 Kubernetes 单集群，该集群已经部署了很多资源。用户希望通过 Karmada 将单集群扩展成多集群，并将已部署的资源从原集群迁移到 Karmada。

在此背景下，本节将引导您完成：

- 以资源为粒度将所有已部署资源从原集群迁移到 Karmada。
- 应用更高优先级的 `PropagationPolicy`，以满足以应用为粒度的更多分发需求。

## 前提条件

### Karmada 及多个子集群已安装

#### 步骤一: 运行命令

```shell
$ git clone https://github.com/karmada-io/karmada
$ cd karmada
$ hack/local-up-karmada.sh
$ export KUBECONFIG=~/.kube/karmada.config:~/.kube/members.config
```

> **说明：**
>
> 在开始之前，我们应该至少安装三个kubernetes集群，一个用于安装 Karmada 控制平面，另外两个作为成员集群。
> 为了方便，我们直接使用 [hack/local-up-karmada.sh](https://karmada.io/docs/installation/#install-karmada-for-development-environment) 脚本快速准备上述集群。
>
> 执行上述命令后，您将看到Karmada控制面和多个成员集群已安装完成。

### 在 karmada-controller-manager 开启 PropagationPolicyPreemption 特性开关

#### 步骤二: 运行命令

```shell
$ kubectl --context karmada-host get deploy karmada-controller-manager -n karmada-system -o yaml | sed '/- --failover-eviction-timeout=30s/{n;s/- --v=4/- --feature-gates=PropagationPolicyPreemption=true\n        &/g}' | kubectl --context karmada-host replace -f -
```

> **说明：**
>
> `PropagationPolicy Priority and Preemption` 特性是在 v1.7 版本中引入的，它由特性开关 `PropagationPolicyPreemption` 控制，默认是关闭的。
>
> 您只需执行上面的一条命令即可启用此特性开关。或者，如果您想使用更谨慎的方法，您可以这样做：
>
> 1. 执行 `kubectl --context karmada-host edit deploy karmada-controller-manager -n karmada-system`。
> 2. 检查 `spec.template.spec.containers[0].command` 字段是否有 `--feature-gates=PropagationPolicyPreemption=true` 这一行。
> 3. 如果没有，您需要添加 `--feature-gates=PropagationPolicyPreemption=true` 到上述字段中。

### 在成员集群中预置资源

为了模拟成员集群中已经存在现有资源，我们将一些简单的 Deployment 和 Service 部署到 `member1` 集群。

#### 步骤三: 编写代码

创建新文件 `/tmp/deployments-and-services.yaml` 并写入以下文本：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deploy
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 2
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-svc
spec:
  selector:
    app: nginx
  type: NodePort
  ports:
  - port: 80
    nodePort: 30000
    targetPort: 80
```

#### 步骤四: 运行命令

```shell
$ kubectl --context member1 apply -f /tmp/deployments-and-services.yaml
deployment.apps/nginx-deploy created
service/nginx-svc created
deployment.apps/hello-deploy created
service/hello-svc created
```

因此，我们可以使用 `member1` 作为已部署现有资源的集群。

## 指导

### 将所有资源迁移到 Karmada

#### 步骤一: 运行命令

```shell
$ kubectl --context karmada-apiserver apply -f /tmp/deployments-and-services.yaml
deployment.apps/nginx-deploy created
service/nginx-svc created
deployment.apps/hello-deploy created
service/hello-svc created
```

> **说明：**
>
> 相同的 Deployments 和 Services 应被部署到 Karmada 控制面，作为 [ResourceTemplate](https://karmada.io/docs/core-concepts/concepts#resource-template)。

#### 步骤二: 编写代码

创建新文件 `/tmp/pp-for-migrating-deployments-and-services.yaml` 并写入以下文本：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: migrate-pp
spec:
  conflictResolution: Overwrite
  placement:
    clusterAffinity:
      clusterNames:
      - member1
  priority: 0
  resourceSelectors:
  - apiVersion: apps/v1
    kind: Deployment
  - apiVersion: v1
    kind: Service
  schedulerName: default-scheduler
```

>  **说明：**
>
> 请注意以下两个字段： 
>
> * `spec.conflictResolution: Overwrite`：该字段的值必须是 [Overwrite](https://github.com/karmada-io/karmada/blob/master/docs/proposals/migration/design-of-seamless-cluster-migration-scheme.md#proposal)。
> * `spec.resourceSelectors`：筛选要迁移的资源, 你可以自定义 [ResourceSelector](https://karmada.io/docs/userguide/scheduling/override-policy/#resource-selector)。

#### 步骤三: 运行命令

应用上述 `PropagationPolicy` 到 Karmada 控制面：

```shell
$ kubectl --context karmada-apiserver apply -f /tmp/pp-for-migrating-deployments-and-services.yaml
propagationpolicy.policy.karmada.io/migrate-pp created
```

#### 步骤四: 验证

```shell
$ kubectl --context karmada-apiserver get deploy
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deploy   2/2     2            2           38s
$ kubectl --context karmada-apiserver get rb
NAME                      SCHEDULED   FULLYAPPLIED   AGE
nginx-deploy-deployment   True        True           13s
nginx-svc-service         True        True           13s
```

您将看到 Karmada 中的 Deployment 已全部就绪，并且 `ResourceBinding` 的 `FULLYAPPLIED` 为 True，这表示 `member1` 集群中的现有资源已被 Karmada 接管。

至此，您已经完成了迁移，是不是很简单？

### 应用更高优先级的 PropagationPolicy

#### 步骤五: 编写代码

创建新文件 `/tmp/pp-for-nginx-app.yaml` 并写入以下文本：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-pp
spec:
  conflictResolution: Overwrite
  placement:
    clusterAffinity:
      clusterNames:
      - member1
      - member2                   ## propagate to more clusters other than member1
  priority: 10                    ## priority greater than above PropagationPolicy (10 > 0)
  preemption: Always              ## preemption should equal to Always
  resourceSelectors:
  - apiVersion: apps/v1
    kind: Deployment
    name: nginx-deploy
  - apiVersion: v1
    kind: Service
    name: nginx-svc
  schedulerName: default-scheduler
```

#### 步骤六: 运行命令

应用上述 `PropagationPolicy` 到 Karmada 控制面：

```shell
$ kubectl --context karmada-apiserver apply -f /tmp/pp-for-nginx-app.yaml
propagationpolicy.policy.karmada.io/nginx-pp created
```

#### 步骤七: 验证

```shell
$ kubectl --context member2 get deploy -o wide 
NAME           READY   UP-TO-DATE   AVAILABLE   AGE     CONTAINERS   IMAGES         SELECTOR
nginx-deploy   2/2     2            2           5m24s   nginx        nginx:latest   app=nginx
$ kubectl --context member2 get svc -o wide   
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE   SELECTOR
nginx-svc    NodePort    10.13.161.255   <none>        80:30000/TCP   54s   app=nginx
...
```

您将看到 `nginx` 应用相关的资源被分发到 `member2` 集群，这表示更高优先级的 `PropagationPolicy` 生效了。