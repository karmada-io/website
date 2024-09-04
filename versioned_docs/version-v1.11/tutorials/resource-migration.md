---
title: Resource Migration
---

## Objectives

Assuming you have a single kubernetes cluster which already has many native resource installed, furthermore, 
you want to migrate the existing resource to Karmada and then achieve multi-cluster management. 

So, this section will guide you to cover:

- Migrate all the existing resource from original cluster to Karmada based on resource granularity.
- Apply higher priority `PropagationPolicy` to meet more propagate demands based on application granularity.

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

### Enable PropagationPolicyPreemption in karmada-controller-manager

#### Step 2: Run the command

```shell
kubectl --context karmada-host get deploy karmada-controller-manager -n karmada-system -o yaml | sed '/- --failover-eviction-timeout=30s/{n;s/- --v=4/- --feature-gates=PropagationPolicyPreemption=true\n        &/g}' | kubectl --context karmada-host replace -f -
```

> **Note:**
>
> The feature `PropagationPolicy Priority and Preemption` was introduced in v1.7, and it is controlled by the feature gate `PropagationPolicyPreemption` which is disabled by default.
>
> You can just execute the above one command to enable this feature gate. Or, if you want to use a more cautious approach, you can do like this:
>
> 1. execute `kubectl --context karmada-host edit deploy karmada-controller-manager -n karmada-system` 
> 2. check if feature gate `--feature-gates=PropagationPolicyPreemption=true` is existed in `spec.template.spec.containers[0].command` field.
> 3. If not, you shall add `--feature-gates=PropagationPolicyPreemption=true` into that field.

### Preset resource in a member cluster

To simulate resources already exist in member cluster, we deploy some simple Deployments and Services to `member1` cluster.

#### Step 3: Write the code

Create new file `/tmp/deployments-and-services.yaml` and copy text below to it:

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

#### Step 4: Run the command

```shell
$ kubectl --context member1 apply -f /tmp/deployments-and-services.yaml
deployment.apps/nginx-deploy created
service/nginx-svc created
deployment.apps/hello-deploy created
service/hello-svc created
```

Thus, we can use `member1` as the cluster with existing resources, while `member2` as a bare cluster.

## Tutorials

### Migrate all the resources to Karmada

#### Step 1: Run the command

```shell
$ kubectl --context karmada-apiserver apply -f /tmp/deployments-and-services.yaml
deployment.apps/nginx-deploy created
service/nginx-svc created
deployment.apps/hello-deploy created
service/hello-svc created
```

> **Note：**
>
> Same Deployments and Services should be deployed to Karmada control plane as [ResourceTemplate](https://karmada.io/docs/core-concepts/concepts#resource-template).

#### Step 2: Write the code

Create new file `/tmp/pp-for-migrating-deployments-and-services.yaml` and copy text below to it:

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

>  **Note:**
>
> You should pay attention to two fields： 
>
> * `spec.conflictResolution: Overwrite`：the value must be [Overwrite](https://github.com/karmada-io/karmada/blob/master/docs/proposals/migration/design-of-seamless-cluster-migration-scheme.md#proposal).
> * `spec.resourceSelectors`：selecting resources to migrate, you can define your custom [ResourceSelector](https://karmada.io/docs/userguide/scheduling/override-policy/#resource-selector).

#### Step 3: Run the command

Apply this PropagationPolicy to Karmada control plane. 

```shell
$ kubectl --context karmada-apiserver apply -f /tmp/pp-for-migrating-deployments-and-services.yaml
propagationpolicy.policy.karmada.io/migrate-pp created
```

#### Step 4: Verification

```shell
$ kubectl --context karmada-apiserver get deploy
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deploy   2/2     2            2           38s
$ kubectl --context karmada-apiserver get rb
NAME                      SCHEDULED   FULLYAPPLIED   AGE
nginx-deploy-deployment   True        True           13s
nginx-svc-service         True        True           13s
```

You shall see the Deployments in Karmada are all ready and the `aggregatedStatus` of `ResourceBinding` is applied, 
which means the existing resources in `member1` cluster has been taken over by Karmada. 

So far, you have finished the migration, isn't it so easy?

### Apply higher priority PropagationPolicy

#### Step 5: Write the code

Create new file `/tmp/pp-for-nginx-app.yaml` and copy text below to it:

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

#### Step 6: Run the command

Apply this higher priority PropagationPolicy to Karmada control plane. 

```shell
$ kubectl --context karmada-apiserver apply -f /tmp/pp-for-nginx-app.yaml
propagationpolicy.policy.karmada.io/nginx-pp created
```

#### Step 7: Verification

```shell
$ kubectl --context member2 get deploy -o wide 
NAME           READY   UP-TO-DATE   AVAILABLE   AGE     CONTAINERS   IMAGES         SELECTOR
nginx-deploy   2/2     2            2           5m24s   nginx        nginx:latest   app=nginx
$ kubectl --context member2 get svc -o wide   
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE   SELECTOR
nginx-svc    NodePort    10.13.161.255   <none>        80:30000/TCP   54s   app=nginx
...
```

As you see, you shall find `nginx` application related resource are all propagated to `member2` cluster, 
which means the higher priority `PropagationPolicy` does work.