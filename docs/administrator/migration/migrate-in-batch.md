---
title: Migrate In Batch and Rollback
---

## Scenario

Assuming the user has a single kubernetes cluster which already has many native resource installed.

The user want to install Karmada for multi-cluster management, and hope to migrate the resource that already exist from original cluster to Karmada.
It is required that the pods already exist not be affected during the process of migration, which means the relevant container not be restarted.

So, how to migrate the existing resource?

![](../../resources/administrator/migrate-in-batch-1.jpg)

## Recommended migration strategy

If you only want to migrate individual resources, you can just refer to [promote-legacy-workload](./promote-legacy-workload) to do it one by one.

If you want to migrate resources in batch, such as the following two scenarios:

* Migrate all resources of a certain type at the resource level.
* Migrate all types of resources related to a specific application at the application level.

Then, you need to configure PropagationPolicy to take over the corresponding resources, which can be done as follows:

![](../../resources/administrator/migrate-in-batch-2.jpg)

### Step one

Since the existing resources will be token over by Karmada, there is no longer need to apply the related YAML config to member cluster.
That means, you can stop the corresponding operation or pipeline.

### Step two

Apply all the YAML config of resources to Karmada control plane, as the [ResourceTemplate](https://karmada.io/docs/core-concepts/concepts#resource-template) of Karmada.

### Step three

Edit a [PropagationPolicy](https://karmada.io/docs/core-concepts/concepts#propagation-policy), and apply it to Karmada control plane. You should pay attention to two fields：

* `spec.conflictResolution: Overwrite`：**the value must be [Overwrite](https://github.com/karmada-io/karmada/blob/master/docs/proposals/migration/design-of-seamless-cluster-migration-scheme.md#proposal).**
* `spec.resourceSelectors`：defining which resources are selected to migrate

here we provide three examples：

#### Eg1. migrate all resources of the Deployment type.

If you want to migrate all deployments from `member1` cluster to Karmada, you shall apply:

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

#### Eg2. migrate all resources of the Service type.

If you want to migrate all services from `member1` cluster to Karmada, you shall apply:

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

#### Eg3. migrate all resources related to a specific application.

Assuming a specific application consists of `deployment/nginx` and `service/nginx-svc`, 
and you want to migrate the resources related to this application from the `member1` cluster to Karmada, 
you need to apply the following configuration:

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

### Step four

The rest migration operations will be finished by Karmada automatically.

## How to Roll Back Migration Operations

After resources are migrated to Karmada, if the user deletes the resource template, by default, 
the resources in the member clusters will also be deleted. However, in certain scenarios, 
users may wish to preserve the resources in the member clusters even after the resource template is deleted.

For example, as an administrator, you may encounter unexpected situations during workload migration 
(such as the cloud platform failing to deploy the application or Pod anomalies), necessitating a rollback mechanism to 
quickly restore to the state prior to migration in order to minimize losses.

To meet the above scenarios, Karmada provides the `spec.preserveResourcesOnDeletion` field in the PropagationPolicy
to control whether resources should be preserved on the member clusters when the resource template is deleted.
If set to true, resources will be preserved on the member clusters. 
Default is false, which means resources will be deleted along with the resource template.

> When using this field, please note:
>
> * This setting applies uniformly across all member clusters and will not selectively control preservation on only some clusters.
> * This setting does not apply to the deletion of the policy itself. When the policy is deleted, 
    the resource templates and their corresponding propagated resources in member clusters will remain unchanged unless explicitly deleted.

Taking the `PropagationPolicy` from `Example 3` as an example, 
the user should modify the `PropagationPolicy` as follows before deleting the resource template:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-pp
spec:
  conflictResolution: Overwrite
  preserveResourcesOnDeletion: true  # preserve member clusters' resources when resource template is deleted.
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

This concludes the introduction to migration in batch and rollback,
for detailed demos, you can refer to the tutorial: [Seamless Migration and Rollback](../../tutorials/resource-migration.md).
