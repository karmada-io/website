---
title: 提升传统工作负载
---

假设存在一个成员集群，其中部署了（如 Deployment）工作负载，但未由 Karmada 管理，我们可以使用 `karmadactl promote` 命令直接让 Karmada 接管此负载，并且不会导致其 Pod 重新启动。

## 示例

### 对于`Push`模式的成员集群
在成员集群 `cluster1` 中，存在属于命名空间 `default` 的 `nginx` 无状态工作负载。

```
[root@master1]# kubectl get cluster
NAME       VERSION   MODE   READY   AGE
cluster1   v1.22.3   Push   True    24d
```

```
[root@cluster1]# kubectl get deploy nginx
NAME    READY   UP-TO-DATE   AVAILABLE   AGE
nginx   1/1     1            1           66s

[root@cluster1]# kubectl get pod
NAME                       READY   STATUS      RESTARTS   AGE
nginx-6799fc88d8-sqjj4     1/1     Running     0          2m12s
```

我们可以通过在 Karmada 控制平面上执行以下命令将其提升到 Karmada：

```
[root@master1]# karmadactl promote deployment nginx -n default -c member1
Resource "apps/v1, Resource=deployments"(default/nginx) is promoted successfully
```

Nginx 无状态工作负载已被 Karmada 接管。

```
[root@master1]# kubectl get deploy
NAME    READY   UP-TO-DATE   AVAILABLE   AGE
nginx   1/1     1            1           7m25s
```

在成员集群中由 nginx 无状态工作负载创建的 Pod 未重新启动。

```
[root@cluster1]# kubectl get pod
NAME                       READY   STATUS      RESTARTS   AGE
nginx-6799fc88d8-sqjj4     1/1     Running     0          15m
```

### 对于`Pull`模式的成员集群
大多数步骤与`Push`模式的集群相同。只有 `karmadactl promote` 命令的标志不同。

```
karmadactl promote deployment nginx -n default -c cluster1 --cluster-kubeconfig=<CLUSTER_KUBECONFIG_PATH>
```

有关该命令的更多选项和示例，请使用 `karmadactl promote --help`。

> 注意：由于 Kubernetes 中资源的版本升级正在进行中，因此 Karmada 控制平面的 apiserver 可能与成员集群不同。为避免兼容性问题，您可以指定资源的 GVK，例如将 `deployment` 替换为 `deployment.v1.apps`。