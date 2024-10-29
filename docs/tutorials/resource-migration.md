---
title: Resource Migration and Rollback
---

## Objectives

Assuming you have a single kubernetes cluster which already has many native resource installed, furthermore, 
you want to migrate the existing resource to Karmada and then achieve multi-cluster management. 

So, this section will guide you to cover:

- Migrate application from Kubernetes to Karmada.
- Rollback application migration.

## Prerequisites

### Karmada with multi cluster has been installed

#### Step 1: Run the command

```shell
git clone https://github.com/karmada-io/karmada
cd karmada
hack/local-up-karmada.sh
export KUBECONFIG=~/.kube/karmada.config:~/.kube/members.config
```

> **Note:**
>
> Before guide started, we should install at least three kubernetes clusters, one is for Karmada control plane, the other two for member clusters.
> For convenience, we use [hack/local-up-karmada.sh](https://karmada.io/docs/installation/#install-karmada-for-development-environment) script to quickly prepare the above clusters.
>
> After the above command executed, you will see Karmada control plane installed with multi member clusters.

### Preset resource in a member cluster

To simulate resources already exist in member cluster, we deploy simple Deployment to `member1` cluster.

#### Step 2: Write the code

Create new file `/tmp/deployments.yaml` and copy text below to it:

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

### Step 3: Run the command

```shell
$ kubectl --context member1 apply -f /tmp/deployments.yaml
deployment.apps/nginx-deploy created

$ karmadactl --karmada-context karmada-apiserver get deploy --operation-scope=all
NAME           CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
nginx-deploy   member1   2/2     2            2           15m   N
```

You will see the current `nginx-deploy` deployment in the member1 cluster, 
with `ADOPTION=N` indicating it is not currently managed by Karmada.

## Tutorials

### Migrate application to Karmada

To make the tutorial simpler and easier to understand, 
here we assume the application example contains only a single simple deployment.

#### Step 1: Run the command

```shell
$ kubectl --context karmada-apiserver apply -f /tmp/deployments.yaml
deployment.apps/nginx-deploy created

$ karmadactl --karmada-context karmada-apiserver get deploy --operation-scope=all
NAME           CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
nginx-deploy   Karmada   0/2     0            0           7s    -
nginx-deploy   member1   2/2     2            2           16m   N
```

You will see that the Deployment has been deployed to the Karmada control plane as a [ResourceTemplate](https://karmada.io/docs/core-concepts/concepts#resource-template), 
but there is currently no matching PropagationPolicy to propagate it.

#### Step 2: Write the code

Create new file `/tmp/pp-for-migrating-deployments.yaml` and copy text below to it:

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

>  **Note:**
>
> You should pay attention to two fields：
>
> * `spec.conflictResolution: Overwrite`：the value must be [Overwrite](https://github.com/karmada-io/karmada/blob/master/docs/proposals/migration/design-of-seamless-cluster-migration-scheme.md#proposal).
> * `spec.resourceSelectors`：selecting resources to migrate, you can define your custom [ResourceSelector](https://karmada.io/docs/userguide/scheduling/override-policy/#resource-selector).

#### Step 3: Run the Command

Apply the above PropagationPolicy to the Karmada control plane:

```shell
$ kubectl --context karmada-apiserver apply -f /tmp/pp-for-migrating-deployments.yaml
propagationpolicy.policy.karmada.io/migrate-pp created
```

#### Step 4: Verification

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

You will see that all Deployments are ready, 
which means `nginx-deploy` in the member1 cluster is successfully taken over by Karmada:

* `AGE=16m` indicates the resource is taken over rather than recreated, with corresponding pods no need to be restarted.
* `ADOPTION=Y` indicates that the resource is now managed by Karmada.

You have now completed the migration.

### Rollback Migration

#### Step 5: Set preserveResourcesOnDeletion for PropagationPolicy

Run the following command to modify `PropagationPolicy/migrate-pp`, setting `spec.preserveResourcesOnDeletion=true`:

```shell
$ kubectl --context karmada-apiserver patch pp migrate-pp --type='json' -p '[{"op": "replace", "path": "/spec/preserveResourcesOnDeletion", "value": true}]'
propagationpolicy.policy.karmada.io/nginx-pp patched
```

#### Step 6: Delete the Resource Template from the Control Plane

Run the following command:

```shell
$ kubectl --context karmada-apiserver delete -f /tmp/deployments.yaml
deployment.apps "nginx-deploy" deleted
```

#### Step 7: Verification

Run the following command:

```shell
$ karmadactl --karmada-context karmada-apiserver get deploy --operation-scope=all
NAME           CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
nginx-deploy   member1   2/2     2            2           17m   N
...
```

You will see that the resource template in the control plane has been deleted, 
and the resources in the member clusters remain intact, 
with `ADOPTION=N` indicating that the resource is not managed by Karmada.

You have now completed the migration rollback.
