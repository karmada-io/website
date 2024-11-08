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