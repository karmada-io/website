---
title: Aggregated Kubernetes API Endpoint
---

The newly introduced [karmada-aggregated-apiserver](https://github.com/karmada-io/karmada/blob/master/cmd/aggregated-apiserver/main.go) component aggregates all registered clusters and allows users to access member clusters through Karmada by the proxy endpoint.

For detailed discussion topic, see [here](https://github.com/karmada-io/karmada/discussions/1077).

Here's a quick start.

## Quick start

To quickly experience this feature, we experimented with karmada-apiserver certificate.

### Step1: Obtain the karmada-apiserver Certificate

For Karmada deployed using `hack/local-up-karmada.sh`, you can directly copy it from the `/root/.kube/` directory.

```shell
cp /root/.kube/karmada.config karmada-apiserver.config
```

### Step2: Grant permission to user `system:admin`

`system:admin` is the user for karmada-apiserver certificate. We need to grant the `clusters/proxy` permission to it explicitly.

Apply the following yaml file:

cluster-proxy-rbac.yaml:

<details>

<summary>unfold me to see the yaml</summary>

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cluster-proxy-clusterrole
rules:
- apiGroups:
  - 'cluster.karmada.io'
  resources:
  - clusters/proxy
  resourceNames:
  - member1
  - member2
  - member3
  verbs:
  - '*'
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: cluster-proxy-clusterrolebinding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-proxy-clusterrole
subjects:
  - kind: User
    name: "system:admin"
```

</details>

```shell
kubectl --kubeconfig /root/.kube/karmada.config --context karmada-apiserver apply -f cluster-proxy-rbac.yaml
```

### Step3: Access member clusters

Run the below command (replace `{clustername}` with your actual cluster name):

```shell
kubectl --kubeconfig karmada-apiserver.config get --raw /apis/cluster.karmada.io/v1alpha1/clusters/{clustername}/proxy/api/v1/nodes
```

Or append `/apis/cluster.karmada.io/v1alpha1/clusters/{clustername}/proxy` to the server address of karmada-apiserver.config, and then you can directly use:

```shell
kubectl --kubeconfig karmada-apiserver.config get node
```

> Note: For a member cluster that joins Karmada in pull mode and allows only cluster-to-karmada access, we can [deploy apiserver-network-proxy (ANP)](../clustermanager/working-with-anp.md) to access it.
