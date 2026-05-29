---
title: Resource Deletion Protection
---

Karmada provides deletion protection for resources, and it is **enabled by default**.

Resource deletion protection can be applied to **any resource type**, including but not limited to Kubernetes native resources, CRDs, and more.

When a resource is marked as protected, **all delete operations on it will be denied**.

## Protecting a Resource

Karmada uses Labels to protect resources. If you want to protect a resource, you can label it with `resourcetemplate.karmada.io/deletion-protected=Always`.

Protection will be effective when the Value is `Always` **only**.

To protect a Namespace named `minio`:
```
kubectl label namespaces minio resourcetemplate.karmada.io/deletion-protected=Always
```

When you attempt to delete the protected `minio` Namespace, you will see the following output:
```
[root@cluster1]# kubectl delete namespaces minio
Error from server (Forbidden): admission webhook "resourcedeletionprotection.karmada.io" denied the request: This resource is protected, please make sure to remove the label: resourcetemplate.karmada.io/deletion-protected
```

## Unprotecting a Resource

If you want to remove Karmada's protection from a resource, you only need to **remove** the `resourcetemplate.karmada.io/deletion-protected` Label.
```
kubectl label namespaces minio resourcetemplate.karmada.io/deletion-protected-
```

Alternatively, you can directly change its value to a value other than `Always`, such as `Never`.
```
kubectl label namespaces minio resourcetemplate.karmada.io/deletion-protected=Never --overwrite
```

## Special Cases

### Deleting a Namespace Containing Protected Resources

If a Namespace is not protected but contains protected resources, the deletion of that Namespace will **not be successful**.

### Force Deletion (--force)

Even when using `--force` to delete a protected resource, it will **not be deleted**.

```
[root@cluster1]# kubectl delete namespace minio --force
Warning: Immediate deletion does not wait for confirmation that the running resource has been terminated. The resource may continue to run on the cluster indefinitely.
Error from server (Forbidden): admission webhook "resourcedeletionprotection.karmada.io" denied the request: This resource is protected, please make sure to remove the label: resourcetemplate.karmada.io/deletion-protected
```
