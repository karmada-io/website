---
title: 安装概述
---

## 前提条件

### Karmada kubectl 插件
`kubectl-karmada` 是允许你控制 Karmada 控制面的 Karmada 命令行工具，该工具表现为一个 [kubectl 插件][1]。
有关安装说明，请参见[安装 kubectl-karmada](./install-cli-tools.md#安装-kubectl-karmada)。

### Karmadactl
`karmadactl` 也是允许你控制 Karmada 控制面的 Karmada 命令行工具。
与 kubectl-karmada 相比，`karmadactl` 是一个完全专用于 Karmada 的 CLI 工具。
有关安装说明，请参见[安装 karmadactl](./install-cli-tools.md#安装-karmadactl)。

:::note

尽管以上两个工具的名字不同，但其关联的命令和选项完全相同。
这里以 kubectl-karmada 为例。如果替换为 karmadactl，也能工作得很好。

在实际使用中，你可以根据自己的需求选择一个 CLI 工具。

:::

## 通过 Karmada 命令行工具安装 Karmada

### 在你自己的集群上安装 Karmada

假设你已将集群的 `kubeconfig` 文件放到了 `$HOME/.kube/config` 或用 `KUBECONFIG` 环境变量指定了该路径。
否则，你应将 `--kubeconfig` 标志设置为以下命令来指定该配置文件。

> 注：从 v1.0 开始可以使用 `init` 命令。运行 `init` 命令需要升级权限才能将多个用户的公共配置（证书、crds）存储在默认位置 /etc/karmada 下，您可以通过选项 `--karmada-data` 和 `--karmada-pki` 覆盖此位置。有关详细信息请参照命令行使用说明。

运行以下命令进行安装：
```bash
kubectl karmada init
```
安装过程需要大约 5 分钟。如果一切正常，你将看到类似的输出：
```
I1121 19:33:10.270959 2127786 tlsbootstrap.go:61] [bootstrap-token] configured RBAC rules to allow certificate rotation for all agent client certificates in the member cluster
I1121 19:33:10.275041 2127786 deploy.go:127] Initialize karmada bootstrap token
I1121 19:33:10.281426 2127786 deploy.go:397] create karmada kube controller manager Deployment
I1121 19:33:10.288232 2127786 idempotency.go:276] Service karmada-system/kube-controller-manager has been created or updated.
...
...
------------------------------------------------------------------------------------------------------
 █████   ████   █████████   ███████████   ██████   ██████   █████████   ██████████     █████████
░░███   ███░   ███░░░░░███ ░░███░░░░░███ ░░██████ ██████   ███░░░░░███ ░░███░░░░███   ███░░░░░███
 ░███  ███    ░███    ░███  ░███    ░███  ░███░█████░███  ░███    ░███  ░███   ░░███ ░███    ░███
 ░███████     ░███████████  ░██████████   ░███░░███ ░███  ░███████████  ░███    ░███ ░███████████
 ░███░░███    ░███░░░░░███  ░███░░░░░███  ░███ ░░░  ░███  ░███░░░░░███  ░███    ░███ ░███░░░░░███
 ░███ ░░███   ░███    ░███  ░███    ░███  ░███      ░███  ░███    ░███  ░███    ███  ░███    ░███
 █████ ░░████ █████   █████ █████   █████ █████     █████ █████   █████ ██████████   █████   █████
░░░░░   ░░░░ ░░░░░   ░░░░░ ░░░░░   ░░░░░ ░░░░░     ░░░░░ ░░░░░   ░░░░░ ░░░░░░░░░░   ░░░░░   ░░░░░
------------------------------------------------------------------------------------------------------
Karmada is installed successfully.
Register Kubernetes cluster to Karmada control plane.
Register cluster with 'Push' mode
Step 1: Use "kubectl karmada join" command to register the cluster to Karmada control plane. --cluster-kubeconfig is kubeconfig of the member cluster.
(In karmada)~# MEMBER_CLUSTER_NAME=$(cat ~/.kube/config  | grep current-context | sed 's/: /\n/g'| sed '1d')
(In karmada)~# kubectl karmada --kubeconfig /etc/karmada/karmada-apiserver.config  join ${MEMBER_CLUSTER_NAME} --cluster-kubeconfig=$HOME/.kube/config
Step 2: Show members of karmada
(In karmada)~# kubectl --kubeconfig /etc/karmada/karmada-apiserver.config get clusters
Register cluster with 'Pull' mode
Step 1: Use "kubectl karmada register" command to register the cluster to Karmada control plane. "--cluster-name" is set to cluster of current-context by default.
(In member cluster)~# kubectl karmada register 172.18.0.3:32443 --token lm6cdu.lcm4wafod2jmjvty --discovery-token-ca-cert-hash sha256:9bf5aa53d2716fd9b5568c85db9461de6429ba50ef7ade217f55275d89e955e4
Step 2: Show members of karmada
(In karmada)~# kubectl --kubeconfig /etc/karmada/karmada-apiserver.config get clusters

```

Karmada 的组件默认安装在 `karmada-system` 命名空间中，你可以通过以下命令查看：
```bash
kubectl get deployments -n karmada-system
NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
karmada-aggregated-apiserver   1/1     1            1           102s
karmada-apiserver              1/1     1            1           2m34s
karmada-controller-manager     1/1     1            1           116s
karmada-scheduler              1/1     1            1           119s
karmada-webhook                1/1     1            1           113s
kube-controller-manager        1/1     1            1           2m3s
```
`karmada-etcd` 被安装为 `StatefulSet`，通过以下命令查看：
```bash
kubectl get statefulsets -n karmada-system
NAME   READY   AGE
etcd   1/1     28m
```

Karmada 的配置文件默认创建到 `/etc/karmada/karmada-apiserver.config`。

#### 离线安装

安装 Karmada 时，`kubectl karmada init` 默认将从 Karmada 官网 release 页面（例如 `https://github.com/karmada-io/karmada/releases/tag/v0.10.1`）下载 API(CRD)，并从官方镜像仓库加载镜像。

如果你要离线安装 Karmada，你可能必须指定 API tar 文件和镜像。

使用 `--crds` 标志指定 CRD 文件，例如：
```bash
kubectl karmada init --crds /$HOME/crds.tar.gz
```

你可以指定 Karmada 组件的镜像，以 `karmada-controller-manager` 为例：
```bash
kubectl karmada init --karmada-controller-manager-image=example.registry.com/library/karmada-controller-manager:1.0 
```

#### 高可用部署
使用 `--karmada-apiserver-replicas` 和 `--etcd-replicas` 标志指定副本数（默认为 `1`）。
```bash
kubectl karmada init --karmada-apiserver-replicas 3 --etcd-replicas 3
```

### 在 Kind 集群中安装 Karmada

> kind 是一个使用 Docker 容器“节点”运行本地 Kubernetes 集群的工具。
> 它主要设计用于测试 Kubernetes 本身，并非用于生产。

通过 `hack/create-cluster.sh` 创建名为 `host` 的一个集群：
```bash
hack/create-cluster.sh host $HOME/.kube/host.config
```

通过命令 `kubectl karmada init` 安装 Karmada v1.2.0：
```bash
kubectl karmada init --crds https://github.com/karmada-io/karmada/releases/download/v1.2.0/crds.tar.gz --kubeconfig=$HOME/.kube/host.config
```

检查已安装的组件：
```bash
kubectl get pods -n karmada-system --kubeconfig=$HOME/.kube/host.config
NAME                                           READY   STATUS    RESTARTS   AGE
etcd-0                                         1/1     Running   0          2m55s
karmada-aggregated-apiserver-84b45bf9b-n5gnk   1/1     Running   0          109s
karmada-apiserver-6dc4cf6964-cz4jh             1/1     Running   0          2m40s
karmada-controller-manager-556cf896bc-79sxz    1/1     Running   0          2m3s
karmada-scheduler-7b9d8b5764-6n48j             1/1     Running   0          2m6s
karmada-webhook-7cf7986866-m75jw               1/1     Running   0          2m
kube-controller-manager-85c789dcfc-k89f8       1/1     Running   0          2m10s
```

## 通过 Helm Chart Deployment 安装 Karmada

请参阅[通过 Helm 安装](https://github.com/karmada-io/karmada/tree/master/charts/karmada)。

## 通过 Karmada Operator 安装 Karmada

请参阅[通过 Karmada Operator 安装](https://github.com/karmada-io/karmada/blob/master/operator/README.md)。

## 通过二进制安装 Karmada

请参阅[通过二进制安装](./install-binary.md)。

## 从源代码安装 Karmada

请参阅[从源代码安装](./fromsource.md)。

[1]: https://kubernetes.io/zh-cn/docs/tasks/extend-kubectl/kubectl-plugins/

## 为开发环境安装 Karmada

如果你要试用 Karmada，我们推荐用 `hack/local-up-karmada.sh` 构建一个开发环境，该脚本将为你执行以下任务：
- 通过 [kind](https://kind.sigs.k8s.io/) 启动一个 Kubernetes 集群以运行 Karmada 控制面（也称为 `host cluster`）。
- 基于当前代码库构建 Karmada 控制面组件。
- 在 `host cluster` 上部署 Karmada 控制面组件。
- 创建成员集群并接入 Karmada。

**1. 克隆 Karmada 仓库到你的机器：**
```
git clone https://github.com/karmada-io/karmada
```
或替换你的 `GitHub ID` 来使用你的 fork 仓库：
```
git clone https://github.com/<GitHub ID>/karmada
```

**2. 更改为 karmada 目录：**
```
cd karmada
```

**3. 部署并运行 Karmada 控制面：**

运行以下脚本：

```
hack/local-up-karmada.sh
```
该脚本将为你执行以下任务：
- 启动一个 Kubernetes 集群以运行 Karmada 控制面（也称为 `host cluster`）。
- 基于当前代码库构建 Karmada 控制面组件。
- 在 `host cluster` 上部署 Karmada 控制面组件。
- 创建成员集群并接入 Karmada。

如果一切良好，在脚本输出结束时，你将看到类似以下的消息：
```
Local Karmada is running.

To start using your Karmada environment, run:
  export KUBECONFIG="$HOME/.kube/karmada.config"
Please use 'kubectl config use-context karmada-host/karmada-apiserver' to switch the host and control plane cluster.

To manage your member clusters, run:
  export KUBECONFIG="$HOME/.kube/members.config"
Please use 'kubectl config use-context member1/member2/member3' to switch to the different member cluster.
```

**4. 检查注册的集群**

```
kubectl get clusters --kubeconfig=/$HOME/.kube/karmada.config
```

你将看到类似以下的输出：
```
NAME      VERSION   MODE   READY   AGE
member1   v1.23.4   Push   True    7m38s
member2   v1.23.4   Push   True    7m35s
member3   v1.23.4   Pull   True    7m27s
```

有 3 个名为 `member1`、`member2` 和 `member3` 的集群已使用 `Push` 或 `Pull` 模式进行了注册。
