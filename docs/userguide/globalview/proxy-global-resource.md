---
title: Proxy Global Resources
---

## Introduce

The newly introduced [proxy](https://github.com/karmada-io/karmada/blob/master/docs/proposals/resource-aggregation-proxy/README.md) feature allows users to access all the resources both in karmada control plane and member clusters. With it, users can:

- create, update, patch, get, list, watch and delete resources in karmada control plane, such as deployments and jobs. All the request behaviors are supported, just like using `karmada-apiserver`.
- update, patch, get, list, watch and delete resources in member clusters, such as pods, nodes, and customer resources.
- access subresources, such as pods' `log` and `exec`.

## Quick start

To quickly experience this feature, we experimented with karmada-apiserver certificate.

```shell
cp $HOME/.kube/karmada.config $HOME/karmada-proxy.config
```

### Step1: Define Resource To be Proxied

Define which member cluster resource you want to be proxied with [`ResourceRegistry`](https://github.com/karmada-io/karmada/tree/master/docs/proposals/caching#define-the-scope-of-the-cached-resource) by applying the following Yaml file in the karmada-apiserver:

```yaml
apiVersion: search.karmada.io/v1alpha1
kind: ResourceRegistry
metadata:
  name: proxy-sample
spec:
  targetCluster:
    clusterNames:
  resourceSelectors:
    - apiVersion: v1
      kind: Pod
    - apiVersion: v1
      kind: Node
```

```shell
kubectl --context karmada-apiserver apply -f resourceregistry.yaml
```

Based on the ResourceRegistry above, you can access pods and nodes with proxy function.

### Step2: Obtain the karmada-apiserver Certificate

For Karmada deployed using `hack/local-up-karmada.sh`, you can directly copy it from the `$HOME/.kube/` directory.

### Step3: Access by proxy

Append `/apis/search.karmada.io/v1alpha1/proxying/karmada/proxy` to the server address of `karmada-proxy.config`. Then set this file as default config:

```shell
export KUBECONFIG=$HOME/karmada-proxy.config
```

After processing the above steps, you can access pods and nodes with kubectl.

Taking getting the pod log as an example, you can use the following command:

```shell
kubectl  logs <pod-name> -n <namespace-name>
```

Specifying `--raw` as following has the same effect:

```shell
kubectl get --raw /apis/search.karmada.io/v1alpha1/proxying/karmada/proxy/api/v1/namespaces/<ns>/pods/<pod-name>/log
```

Enjoy it!

> Note: Use the current ability to rely on the Cluster's impersonator Secret. Please ensure that the correct `impersonatorSecretRef` is set in the Cluster object.

## FAQ

### Is creating supported?

For resources not defined in ResourceRegistry, creating requests are redirected to karmada controller panel. So Resources are created in controller panel.
For resources defined in ResourceRegistry, proxy doesn't know which cluster to create, and responses `MethodNotSupported` error.

### Can I read resources by selectors?

Label selectors are fully supported. While field selectors are limited to `metadata.name` and `metadata.namespace`

### When I get pods with kubectl, only NAME and AGE columns are displayed

Yes, `kubectl` use `application/json;as=Table;g=meta.k8s.io;v=v1 ` as `content-type`, while proxy only implement [`defaultTableConvertor`](https://github.com/karmada-io/karmada/blob/614e28508336d6c03a938ce1bf0678dafef034f0/vendor/k8s.io/apiserver/pkg/registry/rest/table.go#L38-L40) as TableConvertor.

```
NAME                    AGE
nginx-65c54cc984-2jjw6  10s
```

But it doesn't affect usaging of `client-go`, which use `application/json` as `content-type`.

### What will happen when I access resource with same name across clusters.

In this stage, proxy cannot discern the resources with same name across clusters. So get/update/patch/delete and subresources requests will return a conflict error. When list resources, the resources with same name will be returned in item list.

Users shall design to avoid or tolerate this error.

### How to access resources in pull mode cluster

we can [deploy apiserver-network-proxy (ANP)](../clustermanager/working-with-anp.md) to access it.
