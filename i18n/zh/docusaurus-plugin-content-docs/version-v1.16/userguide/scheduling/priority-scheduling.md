---
title: 优先级调度
---

Karmada 基于优先级的调度使您可以在资源争用期间控制工作负载绑定的调度顺序。

该功能允许您通过在您的 [`PropagationPolicy`](../../reference/karmada-api/policy-resources/propagation-policy-v1alpha1.md) 或 [`ClusterPropagationPolicy`](../../reference/karmada-api/policy-resources/cluster-propagation-policy-v1alpha1.md) 中添加 `schedulePriority` 字段，为关键工作负载分配优先级。

## 优先级调度工作原理
PropagationPolicy 通过 `PriorityClass` 引用来确定绑定的优先级，该引用定义了数值型优先级。数值越大表示在调度队列中的优先级越高（参见 [`ResourceBinding`](../../reference/karmada-api/work-resources/resource-binding-v1alpha2.md)）。

调度器严格按照优先级顺序处理绑定，根据分配的优先级数值进行排序。当多个绑定具有相同数值时，调度器将回退到标准的先进先出（FIFO）处理方式，保持原有队列顺序。

每个绑定的优先级均来源于其关联的传播策略中的 PriorityClass 引用，这直接决定了其在调度序列中的位置，但不影响集群选择逻辑。

## 重要说明

- 优先级仅影响调度顺序，不影响 `placement` 决策。
- 如果找不到 `PriorityClass`，则绑定创建 **失败**。
- 若未指定 PriorityClass，默认优先级为 **0**。
- 基于优先级的调度自 v1.13 版本引入，目前尚不支持抢占（未来计划支持）。
- 要使用该功能，请确保 [`karmada-scheduler`](../../reference/components/karmada-scheduler) 与 [`karmada-controller-manager`](../../reference/components/karmada-controller-manager) 均启用了 PriorityBasedScheduling 功能。
- 此功能处于 **alpha** 阶段，未来版本可能会有所变动。

## 配置调度优先级示例

假设您已有一个 Kubernetes PriorityClass 资源（apiVersion `scheduling.k8s.io/v1`），例如，名为 **high-priority-example**。

### 在 PropagationPolicy 中引用 PriorityClass
在您的 PropagationPolicy 或 ClusterPropagationPolicy 中，通过设置 `schedulePriority` 字段来引用 PriorityClass。该字段包含两个子字段：`priorityClassSource` 和 `priorityClassName`。对于 Karmada v1.13，唯一支持的来源为 `KubePriorityClass`，这告诉 Karmada 在其集群中按名称查找 Kubernetes PriorityClass。`priorityClassName` 应与您创建的 PriorityClass 名称保持一致。例如，要为 PropagationPolicy 分配 **high-priority-example** PriorityClass：

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: critical-app-policy
  namespace: default
spec:
  resourceSelectors:
    - apiVersion: apps/v1
      kind: Deployment
      name: critical-nginx                  # 待传播工作负载的名称
  schedulePriority:
    priorityClassSource: KubePriorityClass
    priorityClassName: high-priority-example      # 上述定义的 PriorityClass 引用
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
```

接下来，创建 propagationPolicy 和 deployment：

1. 根据 YAML 文件创建 propagationPolicy：
```shell
  kubectl apply -f propagationpolicy.yaml
```
2. 创建 Deployment nginx 资源：
```shell
  kubectl create deployment critical-nginx --image nginx
```

### 验证配置
检查 ResourceBinding 的优先级：
```shell
kubectl --kubeconfig=<karmada-config> get resourcebinding -n default critical-nginx-deployment \
  -o jsonpath='{.spec.schedulePriority.priority}'
```

在上述示例中，我们将一个名为 "critical-nginx" 的 Deployment 传播到两个成员集群。`schedulePriority` 部分通过引用 **high-priority-example** 类为其赋予优先级。

## 结论

Karmada v1.13 中的优先级调度提供了一种基于重要性控制多集群工作负载调度顺序的机制。未来版本可能引入抢占式调度功能。

有关设计和路线图的更多详细信息，请参见 [绑定优先级与抢占提案](https://github.com/karmada-io/karmada/tree/master/docs/proposals/scheduling/binding-priority-preemption).