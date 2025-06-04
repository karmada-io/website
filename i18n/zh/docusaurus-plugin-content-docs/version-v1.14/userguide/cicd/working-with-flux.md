---
title: Use Flux to support Helm chart propagation
---

[Flux](https://fluxcd.io/) is most useful when used as a deployment tool at the end of a Continuous Delivery Pipeline. Flux will make sure that your new container images and config changes are propagated to the cluster. With Flux, Karmada can easily realize the ability to distribute applications packaged by Helm across clusters. Not only that, with Karmada's OverridePolicy, users can customize applications for specific clusters and manage cross-cluster applications on the unified Karmada Control Plane.

## Start up Karmada clusters

To start up Karmada, you can refer to [here](../../installation/installation.md).
If you just want to try Karmada, we recommend building a development environment by ```hack/local-up-karmada.sh```.

```sh
git clone https://github.com/karmada-io/karmada
cd karmada
hack/local-up-karmada.sh
```

After that, you will start a Kubernetes cluster by kind to run the Karmada Control Plane and create member clusters managed by Karmada.

```sh
kubectl get clusters --kubeconfig ~/.kube/karmada.config
```

You can use the command above to check registered clusters, and you will get similar output as follows:

```
NAME      VERSION   MODE   READY   AGE
member1   v1.23.4   Push   True    7m38s
member2   v1.23.4   Push   True    7m35s
member3   v1.23.4   Pull   True    7m27s
```

## Start up Flux 

In the Karmada Control Plane, you need to install Flux CRDs but do not need controllers to reconcile them. They are treated as resource templates, not specific resource instances.
Based on the work API [here](https://github.com/kubernetes-sigs/work-api), they will be encapsulated as a work object delivered to member clusters and reconciled by Flux controllers in member clusters, finally.

```sh
kubectl --kubeconfig ~/.kube/karmada.config --context karmada-apiserver apply -k https://github.com/fluxcd/flux2/manifests/crds?ref=v2.4.0 
```

For testing purposes, we'll install Flux on member clusters without storing its manifests in a Git repository:

```sh
kubectl --kubeconfig ~/.kube/members.config --context member1 apply -f https://github.com/fluxcd/flux2/releases/download/v2.4.0/install.yaml
kubectl --kubeconfig ~/.kube/members.config --context member2 apply -f https://github.com/fluxcd/flux2/releases/download/v2.4.0/install.yaml
```

Tips:

 1. If you want to manage Helm releases across your fleet of clusters, Flux must be installed on each cluster.

 2. If the Flux toolkit controllers are successfully installed, you should see the following Pods:

```
$ kubectl --kubeconfig ~/.kube/members.config --context member1 get pods -n flux-system 
NAME                                          READY   STATUS    RESTARTS   AGE
helm-controller-79bb868f5d-7cxnx              1/1     Running   0          13m
image-automation-controller-cb5ff5bf9-5vbhg   1/1     Running   0          13m
image-reflector-controller-568fc784cb-t99r7   1/1     Running   0          13m
kustomize-controller-866fbd5855-zrn85         1/1     Running   0          13m
notification-controller-75846575bf-c42m9      1/1     Running   0          13m
source-controller-cc7bd674d-mntb6             1/1     Running   0          13m
```

## Helm release propagation

If you want to propagate Helm releases for your apps to member clusters, you can refer to the guide below.

1. Define a Flux `HelmRepository` and a `HelmRelease` manifest in the Karmada Control Plane. They will serve as resource templates.

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: HelmRepository
metadata:
  name: podinfo
spec:
  interval: 1m
  url: https://stefanprodan.github.io/podinfo  
---
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: podinfo
spec:
  interval: 5m
  chart:
    spec:
      chart: podinfo
      version: 5.0.3
      sourceRef:
        kind: HelmRepository
        name: podinfo
```

2. Define a Karmada `PropagationPolicy` that will propagate them to member clusters:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: helm-repo
spec:
  resourceSelectors:
    - apiVersion: source.toolkit.fluxcd.io/v1
      kind: HelmRepository
      name: podinfo
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: helm-release
spec:
  resourceSelectors:
    - apiVersion: helm.toolkit.fluxcd.io/v2
      kind: HelmRelease
      name: podinfo
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
```

The above configuration is for propagating the Flux objects to member1 and member2 clusters.

3. Apply those manifests to the Karmada-apiserver:

```sh
kubectl --kubeconfig ~/.kube/karmada.config --context karmada-apiserver apply -f <file-contains-configuration-above> 
```

The output is similar to:

```
helmrepository.source.toolkit.fluxcd.io/podinfo created
helmrelease.helm.toolkit.fluxcd.io/podinfo created
propagationpolicy.policy.karmada.io/helm-repo created
propagationpolicy.policy.karmada.io/helm-release created
```

4. Switch to the distributed cluster and verify:

```sh
helm --kubeconfig ~/.kube/members.config --kube-context member1 list
```

The output is similar to:

```
NAME   	NAMESPACE	REVISION	UPDATED                              	STATUS  	CHART        	APP VERSION
podinfo	default  	1       	2024-12-11 09:38:55.3331234 +0000 UTC	deployed	podinfo-5.0.3	5.0.3
```

Based on Karmada's propagation policy, you can schedule Helm releases to your desired cluster flexibly, just like Kubernetes schedules Pods to the desired node.

## Customize the Helm release for specific clusters

The example above shows how to propagate the same Helm release to multiple clusters in Karmada. Besides, you can use Karmada's OverridePolicy to customize applications for specific clusters.
For example, if you just want to change replicas in member1, you can refer to the overridePolicy below.

1. Define a Karmada `OverridePolicy`:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: OverridePolicy
metadata:
  name: example-override
  namespace: default
spec:
  resourceSelectors:
    - apiVersion: helm.toolkit.fluxcd.io/v2
      kind: HelmRelease
      name: podinfo
  overrideRules:
    - targetCluster:
        clusterNames:
          - member1
      overriders:
        plaintext:
          - path: "/spec/values"
            operator: add
            value:
              replicaCount: 2
```

2. Apply the manifest to the Karmada-apiserver:

```sh
kubectl --kubeconfig ~/.kube/karmada.config --context karmada-apiserver apply -f <file-contains-configuration-above>
```

The output is similar to:

```
overridepolicy.policy.karmada.io/example-override created
```

3. After applying the above policy in the Karmada Control Plane, you will find that replicas in member1 have changed to 2, but those in member2 keep the same.

```sh
kubectl --kubeconfig ~/.kube/members.config --context member1 get pods
```

The output is similar to:

```
NAME                       READY   STATUS    RESTARTS   AGE
podinfo-77b795cc54-hk9pg   1/1     Running   0          5m39s
podinfo-77b795cc54-mk75j   1/1     Running   0          16s
```

## Kustomize propagation

Kustomize propagation is basically the same as helm chart propagation above. You can refer to the guide below.

1. Define a Flux `GitRepository` and a `Kustomization` manifest in the Karmada Control Plane:

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: podinfo
spec:
  interval: 1m
  url: https://github.com/stefanprodan/podinfo
  ref:
    branch: master
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: podinfo-dev
spec:
  interval: 5m
  path: "./deploy/overlays/dev/"
  prune: true
  sourceRef:
    kind: GitRepository
    name: podinfo
  timeout: 80s
```

2. Define a Karmada `PropagationPolicy` that will propagate them to member clusters:

```yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: kust-release
spec:
  resourceSelectors:
    - apiVersion: kustomize.toolkit.fluxcd.io/v1
      kind: Kustomization
      name: podinfo-dev
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: kust-git
spec:
  resourceSelectors:
    - apiVersion: source.toolkit.fluxcd.io/v1
      kind: GitRepository
      name: podinfo
  placement:
    clusterAffinity:
      clusterNames:
        - member1
        - member2
```

3. Apply those YAMLs to the karmada-apiserver:

```sh
kubectl --kubeconfig ~/.kube/karmada.config --context karmada-apiserver apply -f <file-contains-configuration-above>
```

The output is similar to:

```
gitrepository.source.toolkit.fluxcd.io/podinfo created
kustomization.kustomize.toolkit.fluxcd.io/podinfo-dev created
propagationpolicy.policy.karmada.io/kust-release created
propagationpolicy.policy.karmada.io/kust-git created
```

4. Switch to the distributed cluster and verify:

```sh
kubectl --kubeconfig ~/.kube/members.config --context member1 get pods -n dev 
```

The output is similar to:

```
NAME                        READY   STATUS    RESTARTS   AGE
backend-69c7655cb-rbtrq     1/1     Running   0          15s
cache-bdff5c8dc-mmnbm       1/1     Running   0          15s
frontend-7f98bf6f85-dw4vq   1/1     Running   0          15s
```

## Reference
- https://fluxcd.io
- https://github.com/fluxcd