---
title: 批量迁移及回滚
---

## 场景

假设用户安装了一个 Kubernetes 单集群，该集群已经部署了很多资源。

用户希望通过 Karmada 将单集群扩展成多集群，并将已部署的资源从原集群迁移到 Karmada。 用户要求已经存在的 Pod 在迁移过程中不受影响，或者说相关容器不会重新启动。

那么，如何实现资源的平滑迁移呢？


![](../../resources/administrator/migrate-in-batch-1.jpg)

## 推荐的迁移方式

如果用户只需迁移个别资源，参考 [promote-legacy-workload](./promote-legacy-workload) 逐个资源迁移即可。

如果用户想批量迁移资源，例如以下两种场景：

* 以资源为粒度，迁移某种类型的全部资源
* 以应用为粒度，迁移某个应用涉及的所有类型的资源

那么，您需要通过配置 `PropagationPolicy` 来接管相应资源，可以按如下操作：

![](../../resources/administrator/migrate-in-batch-2.jpg)

### 步骤一

由于现有资源将由 Karmada 接管，因此不再需要将相关的YAML配置应用于成员集群。 也就是说，您可以停止相应的操作或流水线。

### 步骤二

将所有资源的 YAML 配置应用到 Karmada 控制面, 作为 Karmada 的 [ResourceTemplate](https://karmada.io/docs/core-concepts/concepts#resource-template)。

### 步骤三

编写 [PropagationPolicy](https://karmada.io/docs/core-concepts/concepts#propagation-policy), 并将其应用到 Karmada 控制面。 您需要注意以下两个字段：

* `spec.conflictResolution: Overwrite`：**该字段的值必须是 [Overwrite](https://github.com/karmada-io/karmada/blob/master/docs/proposals/migration/design-of-seamless-cluster-migration-scheme.md#proposal)。**
* `spec.resourceSelectors`：指定哪些资源需要被迁移。

这里提供三个例子：

#### 示例 1. 迁移 Deployment 类型的全部资源

如果您希望把所有的 Deployment 从 `member1` 集群迁移到 Karmada，你需要应用以下配置:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: deployments-pp
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
  schedulerName: default-scheduler
```

#### 示例 2. 迁移 Service 类型的全部资源

如果您希望把所有的 Service 从 `member1` 集群迁移到 Karmada，你需要应用以下配置:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: services-pp
spec:
  conflictResolution: Overwrite
  placement:
    clusterAffinity:
      clusterNames:
      - member1
  priority: 0
  resourceSelectors:
  - apiVersion: v1
    kind: Service
  schedulerName: default-scheduler
```

#### 示例 3. 迁移某个应用涉及的所有资源

假设某个应用由 `deployment/nginx` 和 `service/nginx-svc` 组成，
您希望把该应用涉及的资源从 `member1` 集群一起迁移到 Karmada，你需要应用以下配置:

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
  resourceSelectors:
  - apiVersion: apps/v1
    kind: Deployment
    name: nginx
  - apiVersion: v1
    kind: Service
    name: nginx-svc
```

### 步骤四

余下的迁移操作将由Karmada自动完成。

## 迁移操作如何回滚

资源被迁移到 Karmada 后，若用户删除资源模板，默认情况下成员集群的资源也会随之删除。然而在某些场景下，用户希望资源模板删除后，
成员集群资源依然保留。

例如，作为管理员，在工作负载迁移过程中可能遇到意外情况（如云平台无法发布应用程序或 Pod 异常），
需要回滚机制立刻恢复到迁移之前的状态，以便快速止损。

为了满足以上场景，Karmada 在 PropagationPolicy 中提供了 `spec.preserveResourcesOnDeletion` 字段来控制删除资源模板时，
成员集群上的资源是否应被保留。如果设置为 true，资源将在成员集群上被保留。默认值为 false，即资源将与资源模板一起被删除。

> 使用该字段请注意以下两点：
>
> * 该配置对所有成员集群中统一生效，不会仅针对某些集群进行选择性控制。
> * 该配置不适用于 Policy 本身的删除，当 Policy 被删除时，资源模板及已分发的成员集群资源将保持不变，除非被显式删除。

以 `示例 3` 的 PropagationPolicy 为例，用户删除资源模板前需将 PropagationPolicy 修改成如下所示：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-pp
spec:
  conflictResolution: Overwrite
  preserveResourcesOnDeletion: true  # 资源模板删除后，成员集群资源依然保留
  placement:
    clusterAffinity:
      clusterNames:
      - member1
  resourceSelectors:
  - apiVersion: apps/v1
    kind: Deployment
    name: nginx
  - apiVersion: v1
    kind: Service
    name: nginx-svc
```

以上就是批量迁移及回滚的介绍，详细的 Demo 可以参考教程：[平滑迁移及回滚](../../tutorials/resource-migration.md)。
