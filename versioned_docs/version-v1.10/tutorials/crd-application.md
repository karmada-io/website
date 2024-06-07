---
title: Propagate a CRD application with Karmada
---
This section guides you to cover:

- Install Karmada control plane.
- Propagate a CRD application to multiple clusters.
- Customize the application within a specific cluster.

## Start up Karmada clusters

To start up Karmada, you can refer to [here](../installation/installation.md).
If you just want to try Karmada, we recommend building a development environment by ```hack/local-up-karmada.sh```.

```sh
git clone https://github.com/karmada-io/karmada
cd karmada
hack/local-up-karmada.sh
```

## Propagate CRD application

The following steps walk you through how to propagate a [Guestbook](https://book.kubebuilder.io/quick-start.html#create-a-project) defined by a CRD.

Assume you are under the guestbook directory of the Karmada repo.

```bash
cd samples/guestbook
```

Set the KUBECONFIG environment with Karmada configuration.

```bash
export KUBECONFIG=${HOME}/.kube/karmada.config
```

1. Create Guestbook CRD in Karmada control plane

```bash
kubectl apply -f guestbooks-crd.yaml 
```

The CRD should be applied to `karmada-apiserver`.

2. Create ClusterPropagationPolicy that will propagate Guestbook CRD to member1

```bash
kubectl apply -f guestbooks-clusterpropagationpolicy.yaml
```

```yaml
# guestbooks-clusterpropagationpolicy.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: ClusterPropagationPolicy
metadata:
  name: example-policy
spec:
  resourceSelectors:
    - apiVersion: apiextensions.k8s.io/v1
      kind: CustomResourceDefinition
      name: guestbooks.webapp.my.domain
  placement:
    clusterAffinity:
      clusterNames:
        - member1
```

The CRD will be propagated to member clusters according to the rules defined in ClusterPropagationPolicy.

> Note: We can only use ClusterPropagationPolicy not PropagationPolicy here.
> Please refer to FAQ Difference between [PropagationPolicy and ClusterPropagationPolicy](../faq/faq.md#what-is-the-difference-between-propagationpolicy-and-clusterpropagationpolicy)
> for more details.

3. Create a Guestbook CR named `guestbook-sample` in Karmada control plane

```bash
kubectl apply -f guestbook.yaml
```

4. Create PropagationPolicy that will propagate `guestbook-sample` to member1

```bash
kubectl apply -f guestbooks-propagationpolicy.yaml
```

```yaml
# guestbooks-propagationpolicy.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: example-policy
spec:
  resourceSelectors:
    - apiVersion: webapp.my.domain/v1
      kind: Guestbook
  placement:
    clusterAffinity:
      clusterNames:
        - member1
```

5. Check the `guestbook-sample` status from Karmada

```bash
kubectl get guestbook -oyaml
```

The output is similar to:

```yaml
apiVersion: webapp.my.domain/v1
kind: Guestbook
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"webapp.my.domain/v1","kind":"Guestbook","metadata":{"annotations":{},"name":"guestbook-sample","namespace":"default"},"spec":{"alias":"Name","configMapName":"test","size":2}}
  creationTimestamp: "2022-11-18T06:56:24Z"
  generation: 1
  labels:
    propagationpolicy.karmada.io/name: example-policy
    propagationpolicy.karmada.io/namespace: default
  name: guestbook-sample
  namespace: default
  resourceVersion: "682895"
  uid: 2f8eda5f-35ab-4ac3-bcd4-affcf36a9341
spec:
  alias: Name
  configMapName: test
  size: 2
```

## Customize CRD application

1. Create OverridePolicy that will override the size field of guestbook-sample in member1

```bash
kubectl apply -f guestbooks-overridepolicy.yaml
```

```yaml
# guestbooks-overridepolicy.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: OverridePolicy
metadata:
  name: guestbook-sample
spec: 
  resourceSelectors: 
  - apiVersion: webapp.my.domain/v1 
    kind: Guestbook
  overrideRules: 
  - targetCluster: 
      clusterNames:
      - member1
    overriders:
      plaintext:
      - path: /spec/size
        operator: replace
        value: 4
      - path: /metadata/annotations
        operator: add
        value: {"OverridePolicy":"test"}
```

2. Check the size field of `guestbook-sample` from member cluster

```bash
kubectl --kubeconfig=${HOME}/.kube/members.config config use-context member1
kubectl --kubeconfig=${HOME}/.kube/members.config get guestbooks -o yaml
```

If it works as expected, the `.spec.size` will be overwritten to `4`:

```yaml
apiVersion: webapp.my.domain/v1
kind: Guestbook
metadata:
  annotations:
    OverridePolicy: test
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"webapp.my.domain/v1","kind":"Guestbook","metadata":{"annotations":{},"name":"guestbook-sample","namespace":"default"},"spec":{"alias":"Name","configMapName":"test","size":2}}
    resourcebinding.karmada.io/name: guestbook-sample-guestbook
    resourcebinding.karmada.io/namespace: default
    resourcetemplate.karmada.io/uid: 2f8eda5f-35ab-4ac3-bcd4-affcf36a9341
  creationTimestamp: "2022-11-18T06:56:37Z"
  generation: 2
  labels:
    propagationpolicy.karmada.io/name: example-policy
    propagationpolicy.karmada.io/namespace: default
    resourcebinding.karmada.io/key: 6849fdbd59
    work.karmada.io/name: guestbook-sample-6849fdbd59
    work.karmada.io/namespace: karmada-es-member1
  name: guestbook-sample
  namespace: default
  resourceVersion: "430024"
  uid: 8818e33d-10bf-4270-b3b9-585977425bc9
spec:
  alias: Name
  configMapName: test
  size: 4
```
