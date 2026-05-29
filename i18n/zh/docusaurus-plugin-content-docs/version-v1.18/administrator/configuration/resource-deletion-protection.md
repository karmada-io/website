---
title: 资源删除保护
---

Karmada 提供了对资源的删除保护功能，并且它是**默认启用**的。

资源删除保护可以对**任意资源类型**生效，包括但不限于Kubernetes原生资源和CRD等。

当某个资源被标记为保护时，对于它的**所有删除操作都将被拒绝**。

## 保护某个资源

Karmada 通过Label的形式来保护资源，如果你想要对某个资源进行保护，可以给资源打上`resourcetemplate.karmada.io/deletion-protected=Always`Label。

**仅当**Value是`Always`的时候保护才会生效。

保护一个名为`minio`的Namespace：
```
kubectl label namespaces minio resourcetemplate.karmada.io/deletion-protected=Always
```

当你尝试删除被保护的`minio`Namespace，你将看到如下输出：
```
[root@cluster1]# kubectl delete namespaces minio
Error from server (Forbidden): admission webhook "resourcedeletionprotection.karmada.io" denied the request: This resource is protected, please make sure to remove the label: resourcetemplate.karmada.io/deletion-protected
```

## 取消保护某个资源

如果你想取消Karmada 对某个资源的保护，你只需要**删除**`resourcetemplate.karmada.io/deletion-protected`Label。
```
kubectl label namespaces minio resourcetemplate.karmada.io/deletion-protected-
```

或者你也可以直接将它的值修改为除`Always`以外的值，比如`Never`。
```
kubectl label namespaces minio resourcetemplate.karmada.io/deletion-protected=Never --overwrite
```

## 特殊情况

### 删除一个包含被保护资源的Namespace

如果一个Namespace没有被保护，但是该Namespace包含了被保护的资源，删除该Namespace的操作将**不会成功**。

### 强制删除(--force)

即使使用`--force`来删除一个被保护的资源，它也**不会被删除掉**。

```
[root@cluster1]# kubectl delete namespace minio --force
Warning: Immediate deletion does not wait for confirmation that the running resource has been terminated. The resource may continue to run on the cluster indefinitely.
Error from server (Forbidden): admission webhook "resourcedeletionprotection.karmada.io" denied the request: This resource is protected, please make sure to remove the label: resourcetemplate.karmada.io/deletion-protected
```
