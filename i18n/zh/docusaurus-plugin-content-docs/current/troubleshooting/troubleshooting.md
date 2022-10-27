---
title: 故障定位
---

## 我在安装 Karmada 时无法访问一些资源

- 从谷歌容器仓库（k8s.gcr.io）拉取镜像。

  你可以运行以下命令来改变中国大陆的镜像仓库。

  ```shell
  sed -i'' -e "s#k8s.gcr.io#registry.aliyuncs.com/google_containers#g" artifacts/deploy/karmada-etcd.yaml
  sed -i'' -e "s#k8s.gcr.io#registry.aliyuncs.com/google_containers#g" artifacts/deploy/karmada-apiserver.yaml
  sed -i'' -e "s#k8s.gcr.io#registry.aliyuncs.com/google_containers#g" artifacts/deploy/kube-controller-manager.yaml
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