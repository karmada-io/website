---
title: 平滑迁移及回滚
---

## 目标

假设用户安装了一个 Kubernetes 单集群，该集群已经部署了很多资源。用户希望通过 Karmada 将单集群扩展成多集群，并将已部署的资源从原集群迁移到 Karmada。

在此背景下，本节将引导您完成：

- 将应用从单集群迁移到 Karmada。
- 回滚应用的迁移。

## 前提条件

### Karmada 及多个子集群已安装

#### 步骤一: 运行命令

```shell
git clone https://github.com/karmada-io/karmada
cd karmada
hack/local-up-karmada.sh
export KUBECONFIG=~/.kube/karmada.config:~/.kube/members.config
```

> **说明：**
>
> 在开始之前，我们应该至少安装三个kubernetes集群，一个用于安装 Karmada 控制平面，另外两个作为成员集群。
> 为了方便，我们直接使用 [hack/local-up-karmada.sh](https://karmada.io/docs/installation/#install-karmada-for-development-environment) 脚本快速准备上述集群。
>
> 执行上述命令后，您将看到Karmada控制面和多个成员集群已安装完成。

### 在成员集群中预置资源

为了模拟成员集群中已经存在现有资源，我们将简单的 Deployment 部署到 `member1` 集群。

#### 步骤二: 编写代码

创建新文件 `/tmp/deployments.yaml` 并写入以下文本：

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
```

#### 步骤三: 运行命令

```shell
$ kubectl --context member1 apply -f /tmp/deployments.yaml
deployment.apps/nginx-deploy created

$ karmadactl --karmada-context karmada-apiserver get deploy --operation-scope=all
NAME           CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
nginx-deploy   member1   2/2     2            2           15m   N
```

您将看到当前 `nginx-deploy` 部署在 member1 集群，`ADOPTION=N` 表示它此时不是由 Karmada 管理

## 指导

### 将应用迁移到 Karmada

为了使教程更简单易懂，假设应用仅由上述一个简单的 Deployment 构成。

#### 步骤一: 运行命令

```shell
$ kubectl --context karmada-apiserver apply -f /tmp/deployments.yaml
deployment.apps/nginx-deploy created

$ karmadactl --karmada-context karmada-apiserver get deploy --operation-scope=all
NAME           CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
nginx-deploy   Karmada   0/2     0            0           7s    -
nginx-deploy   member1   2/2     2            2           16m   N
```

您将看到该 Deployment 被部署到 Karmada 控制面，作为 [ResourceTemplate](https://karmada.io/docs/core-concepts/concepts#resource-template)，
此时尚无匹配的 PropagationPolicy 对其分发。

#### 步骤二: 编写代码

创建新文件 `/tmp/pp-for-migrating-deployments.yaml` 并写入以下文本：

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
  resourceSelectors:
  - apiVersion: apps/v1
    kind: Deployment
    name: nginx-deploy
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
$ kubectl --context karmada-apiserver apply -f /tmp/pp-for-migrating-deployments.yaml
propagationpolicy.policy.karmada.io/migrate-pp created
```

#### 步骤四: 验证

```shell
$ karmadactl --karmada-context karmada-apiserver get deploy --operation-scope=all
NAME           CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
nginx-deploy   Karmada   2/2     2            2           34s   -
nginx-deploy   member1   2/2     2            2           16m   Y

$ karmadactl --karmada-context karmada-apiserver get pods --operation-scope=all
NAME                            CLUSTER   READY   STATUS    RESTARTS   AGE
nginx-deploy-54b9c68f67-4qjrz   member1   1/1     Running   0          16m
nginx-deploy-54b9c68f67-f4qpm   member1   1/1     Running   0          16m
```

您将看到所有 Deployment 已就绪，并且 member1 集群的 `nginx-deploy` 成功被 Karmada 接管：

* `AGE=16m` 说明该资源是被接管而不是重新创建，相应的 pods 不会发生重启。
* `ADOPTION=Y` 表示该资源现在由 Karmada 管理。

至此，您已经完成了迁移。

### 迁移回滚

#### 步骤五: 对 PropagationPolicy 设置 preserveResourcesOnDeletion

执行下述命令修改 `PropagationPolicy/migrate-pp`，设置 `spec.preserveResourcesOnDeletion=true`

```shell
$ kubectl --context karmada-apiserver patch pp migrate-pp --type='json' -p '[{"op": "replace", "path": "/spec/preserveResourcesOnDeletion", "value": true}]'
propagationpolicy.policy.karmada.io/nginx-pp patched
```

#### 步骤六：从控制面删除资源模板

执行下述命令：

```shell
$ kubectl --context karmada-apiserver delete -f /tmp/deployments.yaml
deployment.apps "nginx-deploy" deleted
```

#### 步骤七：验证

执行下述命令：

```shell
$ karmadactl --karmada-context karmada-apiserver get deploy --operation-scope=all
NAME           CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
nginx-deploy   member1   2/2     2            2           17m   N
```

您将看到，控制面的资源模板已删除，并且成员集群中的资源依然可以保留，`ADOPTION=N` 表示该资源当前不是由 Karmada 管理。

至此，您已经完成了迁移回滚。
