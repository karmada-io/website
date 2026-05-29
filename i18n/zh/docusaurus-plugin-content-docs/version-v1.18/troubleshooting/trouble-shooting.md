---
title: 故障定位
---

## 我在安装 Karmada 时无法访问一些资源

- 从K8s镜像仓库（registry.k8s.io）拉取镜像。

  你可以运行以下命令来改变中国大陆的镜像仓库。

  ```shell
  sed -i'' -e "s#registry.k8s.io#registry.aliyuncs.com/google_containers#g" artifacts/deploy/karmada-etcd.yaml
  sed -i'' -e "s#registry.k8s.io#registry.aliyuncs.com/google_containers#g" artifacts/deploy/karmada-apiserver.yaml
  sed -i'' -e "s#registry.k8s.io#registry.aliyuncs.com/google_containers#g" artifacts/deploy/kube-controller-manager.yaml
  ```

- 在中国大陆下载 Golang 软件包，并在安装前运行以下命令。

  ```shell
  export GOPROXY=https://goproxy.cn
  ```

## 成员集群健康检查不工作
如果你的环境与下面类似。
>
> 用推送模式将成员集群注册到 karmada 后，使用 `kubectl get cluster`，发现集群状态已经就绪。
> 然后，通过打开成员集群和 karmada 之间的防火墙，等待了很长时间后，集群状态也是就绪，没有变为失败。

问题的原因是，防火墙没有关闭成员集群和 karmada 之间已经存在的 TCP 连接。

- 登录到成员集群 apiserver 所在的节点上
- 使用`tcpkill`命令来关闭 TCP 连接。

```
# ens192 是成员集群用来与 karmada 通信的网卡的名字 
tcpkill -9 -i ens192 src host ${KARMADA_APISERVER_IP} and dst port ${MEMBER_CLUTER_APISERVER_IP}。
```

## x509：使用`karmadactl init`时报`certificate signed by unknown authority`

使用`karmadactl init`命令安装Karmada时，在init安装日志中发现以下报错信息：
```log
deploy.go:55] Post "https://192.168.24.211:32443/api/v1/namespaces": x509: certificate signed by unknown authority (possibly because of "crypto/rsa: verification error" while trying to verify candidate authority certificate "karmada")
```

问题原因：之前在集群上安装过Karmada，karmada-etcd使用`hostpath`方式挂载本地存储，卸载时数据有残留，需要清理默认路径`/var/lib/karmada-etcd`下的文件。如果使用了karmadactl [--etcd-data](https://github.com/karmada-io/karmada/blob/master/pkg/karmadactl/cmdinit/cmdinit.go#L119)参数，请删除相应的目录。

相关Issue：[#1467](https://github.com/karmada-io/karmada/issues/1467)，[#2504](https://github.com/karmada-io/karmada/issues/2504)。

## karmada-webhook因为"too many open files"错误一直崩溃

当使用`hack/local-up-karmada`安装Karmada时, karmada-webhook一直崩溃，查看组件的日志时发现以下错误日志：

```log
I1121 06:33:46.144605       1 webhook.go:83] karmada-webhook version: version.Info{GitVersion:"v1.3.0-425-gf7cac365", GitCommit:"f7cac365d743e5e40493f9ad90352f30123f7f1d", GitTreeState:"dirty", BuildDate:"2022-11-21T06:25:19Z", GoVersion:"go1.19.3", Compiler:"gc", Platform:"linux/amd64"}
I1121 06:33:46.167045       1 webhook.go:113] registering webhooks to the webhook server
I1121 06:33:46.169425       1 internal.go:362] "Starting server" path="/metrics" kind="metrics" addr="[::]:8080"
I1121 06:33:46.169569       1 internal.go:362] "Starting server" kind="health probe" addr="[::]:8000"
I1121 06:33:46.169670       1 shared_informer.go:285] caches populated
I1121 06:33:46.169828       1 internal.go:567] "Stopping and waiting for non leader election runnables"
I1121 06:33:46.169848       1 internal.go:571] "Stopping and waiting for leader election runnables"
I1121 06:33:46.169856       1 internal.go:577] "Stopping and waiting for caches"
I1121 06:33:46.169883       1 internal.go:581] "Stopping and waiting for webhooks"
I1121 06:33:46.169899       1 internal.go:585] "Wait completed, proceeding to shutdown the manager"
E1121 06:33:46.169909       1 webhook.go:132] webhook server exits unexpectedly: too many open files
E1121 06:33:46.169926       1 run.go:74] "command failed" err="too many open files"
```

这是一个资源耗尽问题。 你可以通过以下命令修复：

```
sysctl fs.inotify.max_user_watches=16384
sysctl -w fs.inotify.max_user_watches=100000
sysctl -w fs.inotify.max_user_instances=100000
```

相关Issue：https://github.com/kubernetes-sigs/kind/issues/2928

## 部署在 Karmada 控制面上的 ServiceAccount 无法生成 token Secret

Kubernetes 社区为了提高 token 使用的安全性和可扩展性，提出了[KEP-1205](https://github.com/kubernetes/enhancements/tree/master/keps/sig-auth/1205-bound-service-account-tokens)，该提案旨在引入一种新的机制来使用 ServiceAccount token，而不是直接将 ServiceAccount 生成的 Secret 挂载到 Pod 中，具体方式见[ServiceAccount automation](https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/#service-account-automation)。这个特性名为`BoundServiceAccountTokenVolume`，在 Kubernetes 1.22 版本中已经 GA。

随着`BoundServiceAccountTokenVolume`特性的GA，Kubernetes 社区认为已经没必要为 ServiceAccount 自动生成 token 了，因为这样并不安全，于是又提出了[KEP-2799](https://github.com/kubernetes/enhancements/tree/master/keps/sig-auth/2799-reduction-of-secret-based-service-account-token)，这个 KEP 的一个目的是不再为 ServiceAccount 自动生成 token Secret，另外一个目的是要清除未被使用的 ServiceAccount 产生的 token Secret。

对于第一个目的，社区提供了`LegacyServiceAccountTokenNoAutoGeneration`特性开关，该特性开关在 Kubernetes 1.24 版本中已进入 Beta 阶段，这也正是 Karmada 控制面无法生成 token Secret 的原因。当然了，如果用户仍想使用之前的方式，为 ServiceAccount 生成 Secret，可以参考[此处](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#manually-create-an-api-token-for-a-serviceaccount)进行操作。

## 因 "cluster(s) did not have the API resource" 调度失败

**Karmada 的 detector 组件对于资源模板只关注 karmada-apiserver 首选版本。**

假设 karmada-apiserver 是 v1.25 版本，则其 HPA 资源同时具有 `autoscaling/v1` 和 `autoscaling/v2` 版本。
但是，由于 HPA 的首选版本是 `autoscaling/v2`，因此 detector 只会 list/watch `autoscaling/v2` 版本的 HPA。
如果用户创建的是 `autoscaling/v1` 版本的 HPA 资源模板，kubernetes 会产生这两个版本 HPA 的创建事件，
但 detector 只监听和处理 `autoscaling/v2` 版本 HPA 的创建事件。

在此背景下，您需要注意以下两点：

* **在编写 PropagationPolicy 时，其 `resourceSelector` 字段仅支持筛选该资源的首选版本。**
* **成员集群 apiserver 也应支持该资源的首选版本。**


更详细地说，还是以 HPA 为例，您被推荐在资源模板和 PropagationPolicy 中都使用 HPA 首选版本，即 `autoscaling/v2`，例如：

<details>
<summary>propagate autoscaling/v2 by select autoscaling/v2</summary>

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: test-hpa
  namespace: default
spec:
  behavior:
    scaleUp:
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 4
          periodSeconds: 15
      selectPolicy: Max
      stabilizationWindowSeconds: 0
  maxReplicas: 10
  minReplicas: 1
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: d1
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: tetst-hpa-pp
spec:
  placement:
    clusterAffinity:
      clusterNames:
        - member1
  resourceSelectors:
    - apiVersion: autoscaling/v2
      kind: HorizontalPodAutoscaler
      name: test-hpa
      namespace: default
```
</details>

然而，如果您坚持要使用 `autoscaling/v1` 版本的 HPA 资源模板，通过在 PropagationPolicy 中的 `resourceSelector` 字段声明
筛选版本为 `autoscaling/v2` 的 HPA 资源，也能实现成功分发，例如：

<details>
<summary>propagate autoscaling/v1 by select autoscaling/v2</summary>

```yaml
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: test-hpa
spec:
  maxReplicas: 5
  minReplicas: 1
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx
  targetCPUUtilizationPercentage: 10
---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: test-hpa-pp
spec:
  placement:
    clusterAffinity:
      clusterNames:
        - member1
  resourceSelectors:
    - apiVersion: autoscaling/v2
      kind: HorizontalPodAutoscaler
      name: test-hpa
      namespace: default
```
</details>

最终，Karmada 会将 `autoscaling/v2` 版本的 HPA 下发到成员集群 ，如果您的成员集群不支持 `autoscaling/v2` 版本的 HPA，
您会得到例如 "cluster(s) did not have the API resource" 的调度失败报错事件。
