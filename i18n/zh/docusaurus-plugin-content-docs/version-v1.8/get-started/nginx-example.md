---
title: 通过 Karmada 分发 Deployment
---

本指南涵盖了：
- 在名为 `host cluster` 的 Kubernetes 集群中安装 `karmada` 控制面组件。
- 将一个成员集群接入到 `karmada` 控制面。
- 通过使用 `karmada` 分发应用程序。

### 前提条件
- [Go](https://golang.org/) v1.18+
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) v1.19+
- [kind](https://kind.sigs.k8s.io/) v0.14.0+

### 安装 Karmada 控制面

#### 1. 克隆此代码仓库到你的机器
```
git clone https://github.com/karmada-io/karmada
```

#### 2. 更改到 karmada 目录
```
cd karmada
```

#### 3. 部署并运行 Karmada 控制面

运行以下脚本：

```
# hack/local-up-karmada.sh
```
该脚本将为你执行以下任务：
- 启动一个 Kubernetes 集群来运行 Karmada 控制面，即 `host cluster`。
- 根据当前代码库构建 Karmada 控制面组件。
- 在 `host cluster` 上部署 Karmada 控制面组件。
- 创建成员集群并接入 Karmada。

如果一切良好，在脚本输出结束时你将看到以下类似消息：
```
Local Karmada is running.

To start using your Karmada environment, run:
  export KUBECONFIG="$HOME/.kube/karmada.config"
Please use 'kubectl config use-context karmada-host/karmada-apiserver' to switch the host and control plane cluster.

To manage your member clusters, run:
  export KUBECONFIG="$HOME/.kube/members.config"
Please use 'kubectl config use-context member1/member2/member3' to switch to the different member cluster.
```

Karmada 中有两个上下文环境：
- karmada-apiserver `kubectl config use-context karmada-apiserver`
- karmada-host `kubectl config use-context karmada-host`

`karmada-apiserver` 是与 Karmada 控制面交互时要使用的 **主要 kubeconfig**，
而 `karmada-host` 仅用于调试 Karmada 对 `host cluster` 的安装。
你可以通过运行 `kubectl config view` 随时查看所有集群。
要切换集群上下文，请运行 `kubectl config use-context [CONTEXT_NAME]`


### Demo

![Demo](../resources/general/sample-nginx.svg)

### 分发应用程序
在以下步骤中，我们将通过 Karmada 分发一个 Deployment。

#### 1. 在 Karmada 中创建 nginx deployment
首先创建名为 `nginx` 的 [deployment](https://github.com/karmada-io/karmada/blob/master/samples/nginx/deployment.yaml)：
```
kubectl create -f samples/nginx/deployment.yaml
```

#### 2. 创建将 nginx 分发到成员集群的 PropagationPolicy
随后我们需要创建一个策略将 Deployment 分发到成员集群。
```
kubectl create -f samples/nginx/propagationpolicy.yaml
```

#### 3. 从 Karmada 查看 Deployment 状态
你可以从 Karmada 查看 Deployment 状态，无需访问成员集群：
```
$ kubectl get deployment
NAME    READY   UP-TO-DATE   AVAILABLE   AGE
nginx   2/2     2            2           20s
```