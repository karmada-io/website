---
title: karmadactl init
---

在 Kubernetes 集群中安装 Karmada 控制平面

### 简介

在 Kubernetes 集群中安装 Karmada 控制平面

默认情况下，镜像和 CRD 压缩包是从远程下载的。对于离线安装，您可以设置 '--private-image-registry' 和 '--crds'。

```
karmadactl init
```

### 示例

```
  # 在 Kubernetes 集群中安装 Karmada  
  # 默认情况下，karmada-apiserver 绑定主节点的 IP
  karmadactl init
  
  # 可以通过使用 kube-image-mirror-country 指定中国大陆的注册镜像
  karmadactl init --kube-image-mirror-country=cn
  
  # 可以通过使用 kube-image-registry 指定 Kube 注册中心
  karmadactl init --kube-image-registry=registry.cn-hangzhou.aliyuncs.com/google_containers
  
  # 指定下载 CRD 压缩包的 URL
  karmadactl init --crds https://github.com/karmada-io/karmada/releases/download/v0.0.0-master/crds.tar.gz
  
  # 指定本地 CRD 压缩包
  karmadactl init --crds /root/crds.tar.gz
  
  # 使用 PVC 来持久化存储 etcd 数据
  karmadactl init --etcd-storage-mode PVC --storage-classes-name {StorageClassesName}
  
  # 使用 hostPath 来持久化存储 etcd 数据。为了数据安全，hostPath 模式下只能运行一个 etcd pod
  karmadactl init --etcd-storage-mode hostPath  --etcd-replicas 1
  
  # 使用 hostPath 来持久化存储 etcd 数据，但通过标签选择节点
  karmadactl init --etcd-storage-mode hostPath --etcd-node-selector-labels karmada.io/etcd=true
  
  # 可以为所有镜像指定私有注册中心
  karmadactl init --etcd-image local.registry.com/library/etcd:3.5.16-0
  
  # 指定 Karmada API Serve 的 IP 地址。如果未设置，将使用主节点上的地址
  karmadactl init --karmada-apiserver-advertise-address 192.168.1.2
  
  # 部署高可用（HA）Karmada
  karmadactl init --karmada-apiserver-replicas 3 --etcd-replicas 3 --etcd-storage-mode PVC --storage-classes-name {StorageClassesName}
  
  # 指定用于签署证书的外部 IP（负载均衡器或 HA IP）
  karmadactl init --cert-external-ip 10.235.1.2 --cert-external-dns www.karmada.io
  
  # 使用配置文件安装 Karmada
  karmadactl init --config /path/to/your/config/file.yaml
    
  # 传递额外参数给本地 Etcd（参数用逗号分隔）
  karmadactl init --etcd-extra-args="--snapshot-count=5000,--heartbeat-interval=100"
  # 或者分开写
  karmadactl init --etcd-extra-args="--snapshot-count=5000" --etcd-extra-args="--heartbeat-interval=100"
  
  # 传递额外参数给 Karmada API Server（参数用逗号分隔）
  karmadactl init --karmada-apiserver-extra-args="--tls-min-version=VersionTLS12,--audit-log-path=-"
  # 或者分开写
  karmadactl init --karmada-apiserver-extra-args="--tls-min-version=VersionTLS12" --karmada-apiserver-extra-args="--audit-log-path=-"
  
  # 传递额外参数给 Karmada Scheduler（参数用逗号分隔）
  karmadactl init --karmada-scheduler-extra-args="--scheduler-name=test-scheduler,--enable-pprof"
  # 或者分开写
  karmadactl init --karmada-scheduler-extra-args="--scheduler-name=test-scheduler" --karmada-scheduler-extra-args="--enable-pprof"
  
  # 传递额外参数给 Kube Controller Manager（参数用逗号分隔）
  karmadactl init --kube-controller-manager-extra-args="--node-monitor-grace-period=50s,--node-monitor-period=5s"
  # 或者分开写
  karmadactl init --kube-controller-manager-extra-args="--node-monitor-grace-period=50s" --kube-controller-manager-extra-args="--node-monitor-period=5s"
  
  # 传递额外参数给 Karmada Controller Manager（参数用逗号分隔）
  karmadactl init --karmada-controller-manager-extra-args="--v=2,--enable-pprof"
  # 或者分开写
  karmadactl init --karmada-controller-manager-extra-args="--v=2" --karmada-controller-manager-extra-args="--enable-pprof"
  
  # 传递额外参数给 Karmada Webhook（参数用逗号分隔）
  karmadactl init --karmada-webhook-extra-args="--v=2,--enable-pprof"
  # 或者分开写
  karmadactl init --karmada-webhook-extra-args="--v=2" --karmada-webhook-extra-args="--enable-pprof"
  
  # 传递额外参数给 Karmada Aggregated API Server（参数用逗号分隔）
  karmadactl init --karmada-aggregated-apiserver-extra-args="--v=4,--enable-pprof"
  # 或者分开写
  karmadactl init --karmada-aggregated-apiserver-extra-args="--v=4" --karmada-aggregated-apiserver-extra-args="--enable-pprof"
```

### 选项

```
      --ca-cert-file string                                     将用于为 Karmada 组件颁发新证书的根 CA 证书文件。如果未设置，将生成一个新的自签名根 CA 证书。此文件必须与 --ca-key-file 一起使用
      --ca-key-file string                                      将用于为 Karmada 组件颁发新证书的根 CA 私钥文件。如果未设置，将生成一个新的自签名根 CA 密钥。此文件必须与 --ca-cert-file 一起使用
      --cert-external-dns string                                Karmada 证书的外部 DNS（例如 localhost, localhost.com）
      --cert-external-ip string                                 Karmada 证书的外部 IP（例如 192.168.1.2, 172.16.1.2）
      --cert-validity-period duration                           Karmada 证书的有效期（例如 8760h0m0s，即 365 天）（默认值为 8760h0m0s）
      --config string                                           Karmada init 文件路径
      --context string                                          要使用的 kubeconfig 上下文名称
      --crds string                                             Karmada CRDs 资源（本地文件，例如 --crds /root/crds.tar.gz）（默认值为 "https://github.com/karmada-io/karmada/releases/download/v0.0.0-master/crds.tar.gz"）
      --etcd-data string                                        etcd 数据路径，仅在 hostPath 模式下有效（默认值为 "/var/lib/karmada-etcd"）
      --etcd-extra-args strings                                 etcd 的额外参数
      --etcd-image string                                       etcd 镜像
      --etcd-init-image string                                  etcd 初始化容器镜像（默认值为 "docker.io/alpine:3.21.3"）
      --etcd-node-selector-labels string                        用于 etcd pod 选择节点的标签，仅在 hostPath 模式下有效，每个标签用逗号分隔（例如 --etcd-node-selector-labels karmada.io/etcd=true,kubernetes.io/os=linux）
      --etcd-priority-class string                              组件 etcd 的优先级类名称（默认值为 "system-node-critical"）
      --etcd-pvc-size string                                    etcd 数据路径，仅在 PVC 模式下有效（默认值为 "5Gi"）
      --etcd-replicas int32                                     etcd 副本集，集群数量 3、5...单个（默认值为 1）
      --etcd-storage-mode string                                etcd 数据存储模式（emptyDir、hostPath、PVC）。值为 PVC 时，请指定 --storage-classes-name（默认值为 "hostPath"）
      --external-etcd-ca-cert-path string                       外部etcd集群的CA证书路径，格式为 pem
      --external-etcd-client-cert-path string                   客户端证书的路径，用于连接外部 etcd 集群，格式为 pem
      --external-etcd-client-key-path string                    客户端私钥的路径，指向外部 etcd 集群，格式为 pem
      --external-etcd-key-prefix string                         通过 --etcd-prefix 配置到 kube-apiserver 的键前缀
      --external-etcd-servers string                            外部 etcd 集群的服务器 URL，通过 --etcd-servers 供 kube-apiserver 使用
  -h, --help                                                    init 帮助文档
      --host-cluster-domain string                              Karmada 主集群的集群域名（例如 --host-cluster-domain=host.karmada）（默认值为 "cluster.local"）
      --image-pull-policy string                                所有 Karmada 组件容器的镜像拉取策略。可选值为 Always、Never、IfNotPresent。默认值为 IfNotPresent
      --image-pull-secrets strings                              镜像拉取秘密用于从私有注册表拉取镜像，可以是用逗号分隔的秘密列表（例如 '--image-pull-secrets PullSecret1,PullSecret2'，这些秘密应在 '--namespace' 声明的命名空间中预先设置）
      --karmada-aggregated-apiserver-extra-args strings         karmada-aggregated-apiserver 的额外参数
      --karmada-aggregated-apiserver-image string               Karmada aggregated apiserver 镜像（默认值 "docker.io/karmada/karmada-aggregated-apiserver:v0.0.0-master"）
      --karmada-aggregated-apiserver-priority-class string      组件 karmada-aggregated-apiserver 的优先级类名称。（默认值 "system-node-critical"）
      --karmada-aggregated-apiserver-replicas int32             Karmada aggregated apiserver 副本集（默认值 1）
      --karmada-apiserver-advertise-address string              Karmada API 服务器将通告其监听的 IP 地址。如果未设置，将使用主节点上的地址
      --karmada-apiserver-extra-args strings                    karmada-apiserver 的额外参数
      --karmada-apiserver-image string                          Kubernetes apiserver 镜像
      --karmada-apiserver-priority-class string                 组件 karmada-apiserver 的优先级类名称。（默认值 "system-node-critical"）
      --karmada-apiserver-replicas int32                        Karmada apiserver 副本集（默认值 1）
      --karmada-controller-manager-extra-args strings           karmada-controller-manager 的额外参数
      --karmada-controller-manager-image string                 Karmada controller manager 镜像（默认值 "docker.io/karmada/karmada-controller-manager:v0.0.0-master"）
      --karmada-controller-manager-priority-class string        组件 karmada-controller-manager 的优先级类名称。（默认值 "system-node-critical"）
      --karmada-controller-manager-replicas int32               Karmada controller manager 副本集（默认值 1）
  -d, --karmada-data string                                     Karmada 数据路径。kubeconfig 证书和 crds 文件（默认值 "/etc/karmada"）
      --karmada-kube-controller-manager-image string            Kubernetes controller manager 镜像
      --karmada-kube-controller-manager-priority-class string   组件 karmada-kube-controller-manager 的优先级类名称。（默认值 "system-node-critical"）
      --karmada-kube-controller-manager-replicas int32          Karmada kube controller manager 副本集（默认值 1）
      --karmada-pki string                                      Karmada pki 路径。Karmada 证书文件（默认值 "/etc/karmada/pki"）
      --karmada-scheduler-extra-args strings                    karmada-scheduler 的额外参数
      --karmada-scheduler-image string                          Karmada scheduler 镜像（默认值 "docker.io/karmada/karmada-scheduler:v0.0.0-master"）
      --karmada-scheduler-priority-class string                 组件 karmada-scheduler 的优先级类名称。（默认值 "system-node-critical"）
      --karmada-scheduler-replicas int32                        Karmada scheduler 副本集（默认值 1）
      --karmada-webhook-extra-args strings                      karmada-webhook 的额外参数
      --karmada-webhook-image string                            Karmada webhook 镜像（默认值 "docker.io/karmada/karmada-webhook:v0.0.0-master"）
      --karmada-webhook-priority-class string                   组件 karmada-webhook 的优先级类名称。（默认值 "system-node-critical"）
      --karmada-webhook-replicas int32                          Karmada webhook 副本集（默认值 1）
      --kube-controller-manager-extra-args strings              kube-controller-manager 的额外参数
      --kube-image-mirror-country string                        要使用的 kube 镜像注册表的国家代码。对于中国大陆用户，请设置为 cn
      --kube-image-registry string                              Kube 镜像注册表。对于中国大陆用户，您可以使用本地 gcr.io 镜像，例如 registry.cn-hangzhou.aliyuncs.com/google_containers，来覆盖默认的 kube 镜像注册表
      --kube-image-tag string                                   为控制平面选择特定的 Kubernetes 版本。（默认值 "v1.31.3"）
      --kubeconfig string                                       kubeconfig 文件的绝对路径
  -n, --namespace string                                        Kubernetes 命名空间（默认值 "karmada-system"）
  -p, --port int32                                              Karmada apiserver service 节点端口（默认值 32443）
      --private-image-registry string                           拉取镜像的私有镜像注册表。如果设置，所有所需的镜像将从中下载，这在离线安装场景中非常有用。此外，您仍然可以使用 --kube-image-registry 指定 Kubernetes 镜像的注册表。
      --storage-classes-name string                             Kubernetes StorageClasses 名称
      --wait-component-ready-timeout int                        等待 Karmada 组件就绪的超时时间。0 表示永远等待（默认值 120）
```

### 从父命令继承的选项

```
      --add-dir-header                   如果为真，将文件目录添加到日志消息的头部
      --alsologtostderr                  同时记录到 standard error 和文件（当 -logtostderr=true 时无效）
      --log-backtrace-at traceLocation   当日志记录到达行文件:N 时，输出堆栈跟踪（默认值：0）
      --log-dir string                   如果非空，在此目录中写入日志文件（当 -logtostderr=true 时无效）
      --log-file string                  如果非空，使用此日志文件（当 -logtostderr=true 时无效）
      --log-file-max-size uint           定义日志文件可以增长到的最大大小（当 -logtostderr=true 时无效）。单位为兆字节。如果值为 0，则最大文件大小无限制。（默认值 1800）
      --logtostderr                      记录到 standard error 而不是文件（默认值为真）
      --one-output                       如果为真，仅将日志写入其原生严重性级别（而不是也写入每个较低的严重性级别；当 -logtostderr=true 时无效）
      --skip-headers                     如果为真，避免在日志消息中使用头部前缀
      --skip-log-headers                 如果为真，打开日志文件时避免使用头部（当 -logtostderr=true 时无效）
      --stderrthreshold severity         记录在此阈值或以上的日志在写入文件和标准错误时转到 stderr（当 -logtostderr=true 或 -alsologtostderr=true 时无效）（默认值 2）
  -v, --v Level                          日志级别详细程度的数字
      --vmodule moduleSpec               用逗号分隔的 pattern=N 设置列表，用于文件过滤日志
```

### 参见

* [karmadactl](karmadactl.md)	 - karmadactl 控制 Kubernetes 集群联合。

#### 返回 [Karmadactl Commands](karmadactl_index.md) 首页.


###### 由 [spf13/cobra script in Karmada](https://github.com/karmada-io/karmada/tree/master/hack/tools/genkarmadactldocs) 自动生成