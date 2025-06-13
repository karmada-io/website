---
title: 集群注册
---

## 集群模式概述

Karmada 支持通过 `Push` 和 `Pull` 两种模式来管理成员集群。 二者的核心区别在于 Karmada 控制面访问成员集群的方式，包括部署资源、
获取资源状态和集群健康状态等操作。两种模式适用于不同的网络环境和运维需求，在简单性、扩展性和灵活性之间实现平衡。

### Push 模式
在 Push 模式下，Karmada 控制面通过直接连接成员集群的 kube-apiserver 以进行推送资源至成员集群、监控成员集群状态、获取资源状态等。
此模式适用于 Karmada 控制面可直接访问成员集群（或通过代理间接访问）且网络延迟较低的场景，例如同一数据中心内的集群管理。

### Pull 模式
在 Pull 模式下，成员集群通过部署的 [karmada-agent](https://karmada.io/docs/core-concepts/components#karmada-agent) 组件
从 Karmada 控制面拉取清单，并向控制面报告清单状态和集群状态。

每个 `karmada-agent` 对应一个集群，其职责包括：
- 向 Karmada 控制面注册集群（创建 Cluster 对象）
- 维护集群状态并上报给 Karmada 控制面（更新 Cluster 对象状态）
- 监控 Karmada 执行空间（命名空间 karmada-es-<集群名称>）中的清单，并将这些资源部署到其所服务的集群。
此模式需要为每个成员集群部署一个 `karmada-agent` 组件（部署位置需能同时访问成员集群和 Karmada 控制面）。相比 Push 模式，Pull 模式
引入了额外的运维开销，但因为 `karmada-agent` 分担了控制面的压力，性能更优。它特别适用于特殊的网络环境，比如成员集群位于 NAT 或网关后方，
Karmada 控制面无法直接访问，或者需要管理超大规模集群。

需要说明的是，该模式大多数情况下，Karmada 无需直接访问成员集群。但某些高级功能，比如 [Aggregated Kubernetes API Endpoint](https://karmada.io/docs/userguide/globalview/aggregated-api-endpoint/)
和 [Proxy Global Resources](https://karmada.io/docs/userguide/globalview/proxy-global-resource/)，仍需要控制面直接访问
成员集群。此时，用户需要通过 `karmada-agent` 在注册集群时提供成员集群的访问入口，否则这些功能将受限。

## 使用 'Push' 模式注册集群

您可以使用 [karmadactl](../../installation/install-cli-tools.md) 命令行工具来实现集群的 `join`（注册）和 `unjoin`（注销）操作。

### 通过命令行工具注册集群

使用以下命令将名为 `member1` 的集群注册到 Karmada 中。
```bash
karmadactl join member1 --kubeconfig=<karmada kubeconfig> --cluster-kubeconfig=<member1 kubeconfig>
```
重复此步骤以注册任何其他集群。

`--kubeconfig` 参数用于指定 Karmada 的 `kubeconfig` 文件，命令行工具可以从 `kubeconfig` 的 `current-context` 字段中推断出 `karmada-apiserver` 的上下文。如果 `kubeconfig` 文件中配置了多个上下文，建议通过 `--karmada-context` 参数明确指定上下文。例如：
```bash
karmadactl join member1 --kubeconfig=<karmada kubeconfig> --karmada-context=karmada --cluster-kubeconfig=<member1 kubeconfig>
```

`--cluster-kubeconfig` 参数用于指定成员集群的 `kubeconfig` 文件，命令行工具可以根据集群名称推断出成员集群的上下文。如果 `kubeconfig` 文件中配置了多个上下文，或者您不想使用上下文名称进行注册时，建议通过 `--cluster-context` 参数明确指定上下文。例如：
```bash
karmadactl join member1 --kubeconfig=<karmada kubeconfig> --karmada-context=<karmada context> \
--cluster-kubeconfig=<member1 kubeconfig> --cluster-context=member1
```
> 注意: 指定 `--cluster-context` 时，注册的集群名称可以与上下文名称不同。

### 检查集群状态

使用以下命令检查已注册的集群状态。
```shell
$ kubectl get clusters

NAME      VERSION   MODE   READY   AGE
member1   v1.20.7   Push   True    66s
```

### 通过命令行工具注销集群

您可以使用以下命令注销集群。
```bash
karmadactl unjoin member1 --kubeconfig=<karmada kubeconfig> --cluster-kubeconfig=<member1 kubeconfig>
```
在注销过程中，Karmada 分发到 `member1` 的资源会被清理。
并且，`--cluster-kubeconfig` 参数用于清理在 `join` 阶段创建的密钥。

重复此步骤以注销任何其他集群。

## 使用 'Pull' 模式注册集群

### 通过命令行工具注册集群

`karmadactl register` 命令用于以 PULL 模式将成员集群注册到 Karmada 控制面。
与采用 `Push` 模式注册集群的 `karmadactl join` 命令不同，`karmadactl register` 以 `Pull` 模式将集群注册到 Karmada 控制面。

> 注意: 使用此功能需要在 Karmada 控制面部署 ConfigMap `kube-public/cluster-info` 来暴露成员集群可访问的 Karmada Apiserver Server 以及根 CA。

#### 在 Karmada 控制面中创建引导令牌

在 Karmada 控制面中，我们可以使用 `karmadactl token create` 命令来创建引导令牌（bootstrap tokens），这些令牌的默认有效期（TTL）为24小时。

```bash
karmadactl token create --print-register-command --kubeconfig /etc/karmada/karmada-apiserver.config
```

```bash
# 输出的示例如下
karmadactl register 10.10.x.x:32443 --token t2jgtm.9nybj0526mjw1jbf --discovery-token-ca-cert-hash sha256:f5a5a43869bb44577dba582e794c3e3750f2050d62f1b1dc80fd3d6a371b6ed4
```

有关 `bootstrap token` 的更多细节请参考：
- [authenticating with bootstrap tokens](https://kubernetes.io/docs/reference/access-authn-authz/bootstrap-tokens/)

#### 在成员集群中执行 `karmadactl register`

在成员集群的 Kubernetes 控制面中，我们同样需要成员集群的 `kubeconfig` 文件。紧接着，我们需要执行上述提供的 `karmadactl register` 命令的输出内容。

```bash
karmadactl register 10.10.x.x:32443 --token t2jgtm.9nybj0526mjw1jbf --discovery-token-ca-cert-hash sha256:f5a5a43869bb44577dba582e794c3e3750f2050d62f1b1dc80fd3d6a371b6ed4
```

```shell
# 输出的示例如下
[preflight] Running pre-flight checks
[prefligt] All pre-flight checks were passed
[karmada-agent-start] Waiting to perform the TLS Bootstrap
[karmada-agent-start] Waiting to construct karmada-agent kubeconfig
[karmada-agent-start] Waiting the necessary secret and RBAC
[karmada-agent-start] Waiting karmada-agent Deployment
W0825 11:03:12.167027   29336 check.go:52] pod: karmada-agent-5d659b4746-wn754 not ready. status: ContainerCreating
......
I0825 11:04:06.174110   29336 check.go:49] pod: karmada-agent-5d659b4746-wn754 is ready. status: Running

cluster(member3) is joined successfully
```

> 注意: 如果您不设置 `--cluster-name` 选项，它将默认使用 `kubeconfig` 文件中当前上下文所指的集群。

在 `karmada-agent` 部署完成后，它将在启动阶段自动注册集群。

### 检查集群状态

使用上述相同的命令检查已注册集群的状态。
```shell
$ kubectl get clusters
NAME      VERSION   MODE   READY   AGE
member3   v1.20.7   Pull   True    66s
```

### 注销集群

您可以使用以下命令注销集群。
```bash
karmadactl unregister member3 --cluster-kubeconfig=<member3 kubeconfig> --cluster-context=<member3 context> --karmada-config=<karmada kubeconfig> --karmada-context=<karmada context>
```

## 集群标识符

在 Karmada 中注册的每个集群都将表示为一个 `Cluster` 对象，其名称（`.metadata.name`）即为注册时所用的名字。此名称将在分发过程中被广泛使用，例如在 `PropagationPolicy` 中指定资源应分发的位置。

此外，在注册过程中，每个集群都会被分配一个 `unique identifier`（唯一标识符），标记在 `Cluster` 对象的 `.spec.id` 中。目前，这个 `unique identifier` 被用于从技术层面区分各个集群，以避免使用不同注册名多次注册同一集群的情况发生。该 `unique identifier` 是从注册集群的 `kube-system` ID（`.metadata.uid`）采集得到的。
