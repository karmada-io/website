---
title: 聚合层 APIServer
---

新引入的 [karmada-aggregated-apiserver](https://github.com/karmada-io/karmada/blob/master/cmd/aggregated-apiserver/main.go) ，允许用户通过 proxy 端点从 Karmada 控制面统一访问成员集群。

有关详细的讨论主题，请参见[这里](https://github.com/karmada-io/karmada/discussions/1077)。

以下是一个快速开始。

## 快速开始

为了快速体验这个功能，我们尝试通过使用 karmada-apiserver 证书来进行访问。

### 步骤 1：获取 karmada-apiserver 证书

对于使用 `hack/local-up-karmada.sh` 部署的 Karmada，您可以直接从 `$HOME/.kube/` 目录中复制它。

```shell
cp $HOME/.kube/karmada.config karmada-apiserver.config
```

### 步骤 2：授予用户 `system:admin` 权限

`system:admin` 是 karmada-apiserver 证书的用户。我们需要显式地授予它 `clusters/proxy` 权限。

执行以下 YAML 文件：

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
kubectl --kubeconfig $HOME/.kube/karmada.config --context karmada-apiserver apply -f cluster-proxy-rbac.yaml
```

### 步骤 3：访问成员集群

运行以下命令（用您的实际集群名称替换 `{clustername}`）：

```shell
kubectl --kubeconfig karmada-apiserver.config get --raw /apis/cluster.karmada.io/v1alpha1/clusters/{clustername}/proxy/api/v1/nodes
```

或者将 `/apis/cluster.karmada.io/v1alpha1/clusters/{clustername}/proxy` 追加到 karmada-apiserver.config 的服务器地址，您可以直接使用以下命令：

```shell
kubectl --kubeconfig karmada-apiserver.config get node
```

> 注意：对于以拉取模式接入 Karmada 且仅允许从集群对 Karmada 进行访问的成员集群，我们可以 [Deploy apiserver-network-proxy (ANP) For Pull mode](../clustermanager/working-with-anp.md) 来访问它。