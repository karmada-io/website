---
title: 通过二进制方式安装
---

分步安装二进制高可用 `karmada` 集群。

## 前提条件

### 服务器

需要 3 个服务器，例如：

```shell
+---------------+-----------------+-----------------+
|   HostName    |      Host IP    |    Public IP    |
+---------------+-----------------+-----------------+
|  karmada-01   |  172.31.209.245 |  47.242.88.82   |
+---------------+-----------------+-----------------+
|  karmada-02   |  172.31.209.246 |                 |
+---------------+-----------------+-----------------+
|  karmada-03   |  172.31.209.247 |                 |
+---------------+-----------------+-----------------+
```

> 公共 IP 不是必需的。这个 IP 用于从公网下载某些 `karmada` 依赖组件，并通过公网连接到 `karmada` ApiServer。

### DNS 解析

对 `karmada-01`、`karmada-02`、`karmada-03` 执行操作。

```bash
vi /etc/hosts
172.31.209.245	karmada-01
172.31.209.246	karmada-02
172.31.209.247	karmada-03
```

你也可以使用 "Linux 虚拟服务器"进行负载均衡，不更改 /etc/hosts 文件。

### 环境

`karmada-01` 需要以下环境。

**Golang**：编译 karmada 二进制文件
**GCC**：编译 nginx（使用云负载均衡时忽略此项）

## 编译并下载二进制文件

对 `karmada-01` 执行操作。

### Kubernetes 二进制文件

下载 `kubernetes` 二进制文件包。

参阅本页下载不同版本和不同架构的二进制文件：https://kubernetes.io/releases/download/#binaries

```bash
wget https://dl.k8s.io/v1.23.3/kubernetes-server-linux-amd64.tar.gz
tar -zxvf kubernetes-server-linux-amd64.tar.gz --no-same-owner
cd kubernetes/server/bin
mv kube-apiserver kube-controller-manager kubectl /usr/local/sbin/
```

### etcd 二进制文件

下载 `etcd` 二进制文件包。

若要使用较新版本的 etcd，请参阅：https://etcd.io/docs/latest/install/

```bash
wget https://github.com/etcd-io/etcd/releases/download/v3.5.1/etcd-v3.5.1-linux-amd64.tar.gz
tar -zxvf etcd-v3.5.1-linux-amd64.tar.gz --no-same-owner
cd etcd-v3.5.1-linux-amd64/
mv etcdctl etcd /usr/local/sbin/
```

### Karmada 二进制文件

从源代码编译 `karmada` 二进制文件。

```bash
git clone https://github.com/karmada-io/karmada
cd karmada
make karmada-aggregated-apiserver karmada-controller-manager karmada-scheduler karmada-webhook karmadactl kubectl-karmada
mv _output/bin/linux/amd64/* /usr/local/sbin/
```

### Nginx 二进制文件

从源代码编译 `nginx` 二进制文件。

```bash
wget http://nginx.org/download/nginx-1.21.6.tar.gz
tar -zxvf nginx-1.21.6.tar.gz
cd nginx-1.21.6
./configure --with-stream --without-http --prefix=/usr/local/karmada-nginx --without-http_uwsgi_module --without-http_scgi_module --without-http_fastcgi_module
make && make install
mv /usr/local/karmada-nginx/sbin/nginx /usr/local/karmada-nginx/sbin/karmada-nginx
```

### 分发二进制文件

上传二进制文件到 `karmada-02`、`karmada-03` 服务器。

## 生成证书

### 步骤 1：创建 Bash 脚本和配置文件

此脚本将使用 `openssl` 命令生成证书。
下载[此目录](https://github.com/karmada-io/website/tree/main/docs/resources/installation/install-binary/generate_cert)。

我们分开了 CA 和叶证书生成脚本，若你需要更改叶证书的主体备用名称（又名负载均衡器 IP），你可以重用 CA 证书，并运行 generate_leaf.sh 以仅生成叶证书。



有 3 个 CA：front-proxy-ca、server-ca、etcd/ca。
为什么我们需要 3 个 CA，请参见 [PKI 证书和要求](https://kubernetes.io/zh-cn/docs/setup/best-practices/certificates/)、[CA 重用和冲突](https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/configure-aggregation-layer/#ca-reusage-and-conflicts)。

如果你使用他人提供的 etcd，可以忽略 `generate_etcd.sh` 和 `csr_config/etcd`。

### 步骤 2：更改 `<SERVER_IP>`

你需要将 `csr_config/**/*.conf` 文件中的 `<SERVER_IP>` 更改为"负载均衡器 IP" 和"服务器 IP"。
如果你仅使用负载均衡器访问服务器，你只需要填写"负载均衡器 IP"。

你正常不需要更改 `*.sh` 文件。


### 步骤 3：运行 Shell 脚本

```bash
$ ./generate_ca.sh
$ ./generate_leaf.sh ca_cert/
$ ./generate_etcd.sh
```



### 步骤 4：检查证书

你可以查看证书的配置，以 `karmada.crt` 为例。

```bash
openssl x509 -noout -text -in karmada.crt
```

### 步骤 5：创建 Karmada 配置目录

复制证书到 `/etc/karmada/pki` 目录。

```bash
mkdir -p /etc/karmada/pki

cd ca_cert
cp -r * /etc/karmada/pki

cd ../cert
cp -r * /etc/karmada/pki
```



## 创建 Karmada kubeconfig 文件和 etcd 加密密钥

对 `karmada-01` 执行操作。

### 创建 kubeconfig 文件

**步骤 1：下载 bash 脚本**

下载[此文件](https://github.com/karmada-io/website/tree/main/docs/resources/installation/install-binary/other_scripts/create_kubeconfig_file.sh)。

**步骤 2：执行 bash 脚本**

`172.31.209.245:5443` 是针对 `karmada-apiserver` 的 `nginx` 代理的地址，我们将在后续设置。
你应将其替换为负载均衡器提供的 "host:port"。

```bash
./create_kubeconfig_file.sh "https://172.31.209.245:5443"
```

### 创建 etcd 加密密钥

如果你不需要加密 etcd 中的内容，请忽略本节和对应的 kube-apiserver 启动参数。

```bash
export ENCRYPTION_KEY=$(head -c 32 /dev/urandom | base64)
cat > /etc/karmada/encryption-config.yaml <<EOF
kind: EncryptionConfig
apiVersion: v1
resources:
  - resources:
      - secrets
    providers:
      - aescbc:
          keys:
            - name: key1
              secret: ${ENCRYPTION_KEY}
      - identity: {}
EOF
```

### 分发文件

打包 `karmada` 配置文件并将其复制到其他节点。

```bash
cd /etc
tar -cvf karmada.tar karmada
scp karmada.tar  karmada-02:/etc/
scp karmada.tar  karmada-03:/etc/
```

`karmada-02` 和 `karmada-03` 需要解压缩归档文件。

```bash
cd /etc
tar -xvf karmada.tar
```

## 健康检查脚本

(1) 你可以使用以下 `check_status.sh` 检查所有组件是否健康。

下载[此文件](https://github.com/karmada-io/website/tree/main/docs/resources/installation/install-binary/other_scripts/check_status.sh)。

注：如果你使用的是 CentOS 7，则需要运行 `yum update -y nss curl` 来更新 curl 版本，这样 curl 才可能支持 tls 1.3。
如果 curl 仍然不支持 tls 1.3，你需要更新为包含较新 curl 的操作系统版本，或者直接使用 go 程序进行健康检查。



(2) 使用：`./check_status.sh`

## 安装 etcd 集群

对 `karmada-01`、`karmada-02`、`karmada-03` 执行操作。以 `karmada-01` 为例。

### 创建 Systemd 服务

/usr/lib/systemd/system/etcd.service

```bash
[Unit]
Description=Etcd Server
After=network.target
After=network-online.target
Wants=network-online.target
Documentation=https://github.com/coreos

[Service]
Type=notify
WorkingDirectory=/var/lib/etcd/
ExecStart=/usr/local/sbin/etcd \
  --advertise-client-urls https://172.31.209.245:2379 \
  --cert-file /etc/karmada/pki/etcd/server.crt \
  --client-cert-auth=true \
  --data-dir /var/lib/etcd \
  --initial-advertise-peer-urls https://172.31.209.245:2380 \
  --initial-cluster "karmada-01=https://172.31.209.245:2380,karmada-02=https://172.31.209.246:2380,karmada-03=https://172.31.209.247:2380" \
  --initial-cluster-state new \
  --initial-cluster-token etcd-cluster \
  --key-file /etc/karmada/pki/etcd/server.key \
  --listen-client-urls "https://172.31.209.245:2379,https://127.0.0.1:2379" \
  --listen-peer-urls "https://172.31.209.245:2380" \
  --name karmada-01 \
  --peer-cert-file /etc/karmada/pki/etcd/peer.crt \
  --peer-client-cert-auth=true \
  --peer-key-file /etc/karmada/pki/etcd/peer.key \
  --peer-trusted-ca-file /etc/karmada/pki/etcd/ca.crt \
  --snapshot-count 10000 \
  --trusted-ca-file /etc/karmada/pki/etcd/ca.crt \

Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

注：

>`karmada-02` 和 `karmada-03` 需要更改的参数为：
>
>--name
>
>--initial-advertise-peer-urls
>
>--listen-peer-urls
>
>--listen-client-urls
>
>--advertise-client-urls
>
>
>
>你可以使用 `EnvironmentFile` 将可变配置与不可变配置分开。

### 启动 etcd 集群

3 个服务器必须执行以下命令创建 etcd 存储目录。

```bash
mkdir /var/lib/etcd/
chmod 700 /var/lib/etcd
```

启动 etcd：

```bash
systemctl daemon-reload
systemctl enable etcd.service
systemctl start etcd.service
systemctl status etcd.service
```

### 验证

```bash
etcdctl --cacert /etc/karmada/pki/etcd/ca.crt \
	--cert /etc/karmada/pki/etcd/healthcheck-client.crt \
	--key /etc/karmada/pki/etcd/healthcheck-client.key \
	--endpoints "172.31.209.245:2379,172.31.209.246:2379,172.31.209.247:2379" \
	endpoint status --write-out="table"

+---------------------+------------------+---------+---------+-----------+------------+-----------+------------+--------------------+--------+
|      ENDPOINT       |        ID        | VERSION | DB SIZE | IS LEADER | IS LEARNER | RAFT TERM | RAFT INDEX | RAFT APPLIED INDEX | ERRORS |
+---------------------+------------------+---------+---------+-----------+------------+-----------+------------+--------------------+--------+
| 172.31.209.245:2379 | 689151f8cbf4ee95 |   3.5.1 |   20 kB |     false |      false |         2 |          9 |                  9 |        |
| 172.31.209.246:2379 | 5db4dfb6ecc14de7 |   3.5.1 |   20 kB |      true |      false |         2 |          9 |                  9 |        |
| 172.31.209.247:2379 | 7e59eef3c816aa57 |   3.5.1 |   20 kB |     false |      false |         2 |          9 |                  9 |        |
+---------------------+------------------+---------+---------+-----------+------------+-----------+------------+--------------------+--------+
```

## 安装 kube-apiserver

### 配置 Nginx

对 `karmada-01` 执行操作。

为 `karmada apiserver` 配置负载均衡。



/usr/local/karmada-nginx/conf/nginx.conf

```bash
worker_processes 2;

events {
    worker_connections  1024;
}

stream {
    upstream backend {
        hash consistent;
        server 172.31.209.245:6443        max_fails=3 fail_timeout=30s;
        server 172.31.209.246:6443        max_fails=3 fail_timeout=30s;
        server 172.31.209.247:6443        max_fails=3 fail_timeout=30s;
    }

    server {
        listen 172.31.209.245:5443;
        proxy_connect_timeout 1s;
        proxy_pass backend;
    }
}
```

/lib/systemd/system/karmada-nginx.service

```bash
[Unit]
Description=The karmada karmada-apiserver nginx proxy server
After=syslog.target network-online.target remote-fs.target nss-lookup.target
Wants=network-online.target

[Service]
Type=forking
ExecStartPre=/usr/local/karmada-nginx/sbin/karmada-nginx -t
ExecStart=/usr/local/karmada-nginx/sbin/karmada-nginx
ExecReload=/usr/local/karmada-nginx/sbin/karmada-nginx -s reload
ExecStop=/bin/kill -s QUIT $MAINPID
PrivateTmp=true
Restart=always
RestartSec=5
StartLimitInterval=0
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

启动 `karmada nginx`。

```bash
systemctl daemon-reload
systemctl enable karmada-nginx.service
systemctl start karmada-nginx.service
systemctl status karmada-nginx.service
```

### 创建 kube-apiserver Systemd 服务

对 `karmada-01`、`karmada-02`、`karmada-03` 执行操作。以 `karmada-01` 为例。



/usr/lib/systemd/system/kube-apiserver.service

```bash
[Unit]
Description=Kubernetes API Server
Documentation=https://kubernetes.io/docs/home/
After=network.target

[Service]
# 如果你不需要加密 etcd，移除 --encryption-provider-config
ExecStart=/usr/local/sbin/kube-apiserver \
  --allow-privileged=true \
  --anonymous-auth=false \
  --audit-webhook-batch-buffer-size 30000 \
  --audit-webhook-batch-max-size 800 \
  --authorization-mode "Node,RBAC" \
  --bind-address 0.0.0.0 \
  --client-ca-file /etc/karmada/pki/server-ca.crt \
  --default-watch-cache-size 200 \
  --delete-collection-workers 2 \
  --disable-admission-plugins "StorageObjectInUseProtection,ServiceAccount" \
  --enable-admission-plugins "NodeRestriction" \
  --enable-bootstrap-token-auth \
  --encryption-provider-config "/etc/karmada/encryption-config.yaml" \
  --etcd-cafile /etc/karmada/pki/etcd/ca.crt \
  --etcd-certfile /etc/karmada/pki/etcd/apiserver-etcd-client.crt \
  --etcd-keyfile /etc/karmada/pki/etcd/apiserver-etcd-client.key \
  --etcd-servers "https://172.31.209.245:2379,https://172.31.209.246:2379,https://172.31.209.247:2379" \
  --insecure-port 0 \
  --logtostderr=true \
  --max-mutating-requests-inflight 2000 \
  --max-requests-inflight 4000 \
  --proxy-client-cert-file /etc/karmada/pki/front-proxy-client.crt \
  --proxy-client-key-file /etc/karmada/pki/front-proxy-client.key \
  --requestheader-allowed-names "front-proxy-client" \
  --requestheader-client-ca-file /etc/karmada/pki/front-proxy-ca.crt \
  --requestheader-extra-headers-prefix "X-Remote-Extra-" \
  --requestheader-group-headers "X-Remote-Group" \
  --requestheader-username-headers "X-Remote-User" \
  --runtime-config "api/all=true" \
  --secure-port 6443 \
  --service-account-issuer "https://kubernetes.default.svc.cluster.local" \
  --service-account-key-file /etc/karmada/pki/sa.pub \
  --service-account-signing-key-file /etc/karmada/pki/sa.key \
  --service-cluster-ip-range "10.254.0.0/16" \
  --tls-cert-file /etc/karmada/pki/kube-apiserver.crt \
  --tls-private-key-file /etc/karmada/pki/kube-apiserver.key \

Restart=on-failure
RestartSec=5
Type=notify
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### 启动 kube-apiserver

3 个服务器必须执行以下命令：

``` bash
systemctl daemon-reload
systemctl enable kube-apiserver.service
systemctl start kube-apiserver.service
systemctl status kube-apiserver.service
```

### 验证

```bash
$ ./check_status.sh
###### 开始检查 kube-apiserver
[+]ping ok
[+]log ok
[+]etcd ok
[+]poststarthook/start-kube-apiserver-admission-initializer ok
[+]poststarthook/generic-apiserver-start-informers ok
[+]poststarthook/priority-and-fairness-config-consumer ok
[+]poststarthook/priority-and-fairness-filter ok
[+]poststarthook/start-apiextensions-informers ok
[+]poststarthook/start-apiextensions-controllers ok
[+]poststarthook/crd-informer-synced ok
[+]poststarthook/bootstrap-controller ok
[+]poststarthook/rbac/bootstrap-roles ok
[+]poststarthook/scheduling/bootstrap-system-priority-classes ok
[+]poststarthook/priority-and-fairness-config-producer ok
[+]poststarthook/start-cluster-authentication-info-controller ok
[+]poststarthook/aggregator-reload-proxy-client-cert ok
[+]poststarthook/start-kube-aggregator-informers ok
[+]poststarthook/apiservice-registration-controller ok
[+]poststarthook/apiservice-status-available-controller ok
[+]poststarthook/kube-apiserver-autoregistration ok
[+]autoregister-completion ok
[+]poststarthook/apiservice-openapi-controller ok
livez check passed

###### kube-apiserver 检查成功
```

## 安装 karmada-aggregated-apiserver

首先，创建 `namespace` 并绑定 `cluster admin role`。对 `karmada-01` 执行操作。

```bash
kubectl create ns karmada-system
kubectl create clusterrolebinding cluster-admin:karmada --clusterrole=cluster-admin --user system:karmada
```

然后，类似 `karmada-webhook`，为高可用使用 `nginx`。

修改 `nginx` 配置并添加以下配置。对 `karmada-01` 执行以下操作。

```bash
cat /usr/local/karmada-nginx/conf/nginx.conf
worker_processes 2;

events {
    worker_connections  1024;
}

stream {
    upstream backend {
        hash  consistent;
        server 172.31.209.245:6443        max_fails=3 fail_timeout=30s;
        server 172.31.209.246:6443        max_fails=3 fail_timeout=30s;
        server 172.31.209.247:6443        max_fails=3 fail_timeout=30s;
    }

    upstream webhook {
        hash  consistent;
        server 172.31.209.245:8443        max_fails=3 fail_timeout=30s;
        server 172.31.209.246:8443        max_fails=3 fail_timeout=30s;
        server 172.31.209.247:8443        max_fails=3 fail_timeout=30s;
    }

    upstream aa {
        hash  consistent;
        server 172.31.209.245:7443        max_fails=3 fail_timeout=30s;
        server 172.31.209.246:7443        max_fails=3 fail_timeout=30s;
        server 172.31.209.247:7443        max_fails=3 fail_timeout=30s;
    }

    server {
        listen 172.31.209.245:5443;
        proxy_connect_timeout 1s;
        proxy_pass backend;
    }

    server {
        listen 172.31.209.245:4443;
        proxy_connect_timeout 1s;
        proxy_pass webhook;
    }

    server {
        listen 172.31.209.245:443;
        proxy_connect_timeout 1s;
        proxy_pass aa;
    }
}
```

重新加载 `nginx` 配置。

```bash
systemctl restart karmada-nginx
```

### 创建 Systemd 服务

对 `karmada-01`、`karmada-02`、`karmada-03` 执行操作。以 `karmada-01` 为例。

/usr/lib/systemd/system/karmada-aggregated-apiserver.service

```bash
[Unit]
Description=Karmada Aggregated ApiServer
Documentation=https://github.com/karmada-io/karmada

[Service]
ExecStart=/usr/local/sbin/karmada-aggregated-apiserver \
  --audit-log-maxage 0  \
  --audit-log-maxbackup 0 \
  --audit-log-path -  \
  --authentication-kubeconfig /etc/karmada/karmada.kubeconfig  \
  --authorization-kubeconfig /etc/karmada/karmada.kubeconfig  \
  --etcd-cafile /etc/karmada/pki/etcd/ca.crt \
  --etcd-certfile /etc/karmada/pki/etcd/apiserver-etcd-client.crt \
  --etcd-keyfile /etc/karmada/pki/etcd/apiserver-etcd-client.key \
  --etcd-servers "https://172.31.209.245:2379,https://172.31.209.246:2379,https://172.31.209.247:2379" \
  --feature-gates "APIPriorityAndFairness=false"  \
  --kubeconfig /etc/karmada/karmada.kubeconfig \
  --logtostderr=true \
  --secure-port 7443 \
  --tls-cert-file /etc/karmada/pki/karmada.crt \
  --tls-private-key-file /etc/karmada/pki/karmada.key \

Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### 启动 karmada-aggregated-apiserver

```bash
systemctl daemon-reload
systemctl enable karmada-aggregated-apiserver.service
systemctl start karmada-aggregated-apiserver.service
systemctl status karmada-aggregated-apiserver.service
```

### 创建 `APIService`

`externalName` 是 `nginx` 所在的主机名 (`karmada-01`)。



(1) 创建文件：`karmada-aggregated-apiserver-apiservice.yaml`

```yaml
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  name: v1alpha1.cluster.karmada.io
  labels:
    app: karmada-aggregated-apiserver
    apiserver: "true"
spec:
  insecureSkipTLSVerify: true
  group: cluster.karmada.io
  groupPriorityMinimum: 2000
  service:
    name: karmada-aggregated-apiserver
    namespace: karmada-system
    port: 443
  version: v1alpha1
  versionPriority: 10
---
apiVersion: v1
kind: Service
metadata:
  name: karmada-aggregated-apiserver
  namespace: karmada-system
spec:
  type: ExternalName
  externalName: karmada-01
```

(2) `kubectl create -f karmada-aggregated-apiserver-apiservice.yaml`

### 验证

```bash
$ ./check_status.sh
###### 开始检查 karmada-aggregated-apiserver
[+]ping ok
[+]log ok
[+]etcd ok
[+]poststarthook/generic-apiserver-start-informers ok
[+]poststarthook/max-in-flight-filter ok
[+]poststarthook/start-aggregated-server-informers ok
livez check passed

###### karmada-aggregated-apiserver 检查成功
```

## 安装 kube-controller-manager

对 `karmada-01`、`karmada-02`、`karmada-03` 执行操作。以 `karmada-01` 为例。

### 创建 Systemd 服务

/usr/lib/systemd/system/kube-controller-manager.service

```bash
[Unit]
Description=Kubernetes Controller Manager
Documentation=https://kubernetes.io/docs/home/
After=network.target

[Service]
ExecStart=/usr/local/sbin/kube-controller-manager \
  --authentication-kubeconfig /etc/karmada/kube-controller-manager.kubeconfig \
  --authorization-kubeconfig /etc/karmada/kube-controller-manager.kubeconfig \
  --bind-address "0.0.0.0" \
  --client-ca-file /etc/karmada/pki/server-ca.crt \
  --cluster-name karmada \
  --cluster-signing-cert-file /etc/karmada/pki/server-ca.crt \
  --cluster-signing-key-file /etc/karmada/pki/server-ca.key \
  --concurrent-deployment-syncs 10 \
  --concurrent-gc-syncs 30 \
  --concurrent-service-syncs 1 \
  --controllers "namespace,garbagecollector,serviceaccount-token" \
  --feature-gates "RotateKubeletServerCertificate=true" \
  --horizontal-pod-autoscaler-sync-period 10s \
  --kube-api-burst 2000 \
  --kube-api-qps 1000 \
  --kubeconfig /etc/karmada/kube-controller-manager.kubeconfig \
  --leader-elect \
  --logtostderr=true \
  --node-cidr-mask-size 24 \
  --pod-eviction-timeout 5m \
  --requestheader-allowed-names "front-proxy-client" \
  --requestheader-client-ca-file /etc/karmada/pki/front-proxy-ca.crt \
  --requestheader-extra-headers-prefix "X-Remote-Extra-" \
  --requestheader-group-headers "X-Remote-Group" \
  --requestheader-username-headers "X-Remote-User" \
  --root-ca-file /etc/karmada/pki/server-ca.crt \
  --service-account-private-key-file /etc/karmada/pki/sa.key \
  --service-cluster-ip-range "10.254.0.0/16" \
  --terminated-pod-gc-threshold 10000 \
  --tls-cert-file /etc/karmada/pki/kube-controller-manager.crt \
  --tls-private-key-file /etc/karmada/pki/kube-controller-manager.key \
  --use-service-account-credentials \
  --v 4 \

Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### 启动 kube-controller-manager

```bash
systemctl daemon-reload
systemctl enable kube-controller-manager.service
systemctl start kube-controller-manager.service
systemctl status kube-controller-manager.service
```

### 验证

```bash
$ ./check_status.sh
###### 开始检查 kube-controller-manager
[+]leaderElection ok
healthz check passed

###### kube-controller-manager 检查成功
```

## 安装 karmada-controller-manager

### 创建 Systemd 服务

对 `karmada-01`、`karmada-02`、`karmada-03` 执行操作。以 `karmada-01` 为例。

/usr/lib/systemd/system/karmada-controller-manager.service

```bash
[Unit]
Description=Karmada Controller Manager
Documentation=https://github.com/karmada-io/karmada

[Service]
ExecStart=/usr/local/sbin/karmada-controller-manager \
  --bind-address 0.0.0.0 \
  --cluster-status-update-frequency 10s \
  --kubeconfig /etc/karmada/karmada.kubeconfig \
  --logtostderr=true \
  --metrics-bind-address ":10358" \
  --secure-port 10357 \
  --v=4 \

Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### 启动 karmada-controller-manager

```bash
systemctl daemon-reload
systemctl enable karmada-controller-manager.service
systemctl start karmada-controller-manager.service
systemctl status karmada-controller-manager.service
```

### 验证

```bash
$ ./check_status.sh
###### 开始检查 karmada-controller-manager
[+]ping ok
healthz check passed

###### karmada-controller-manager 检查成功
```

## 安装 karmada-scheduler

### 创建 Systemd Service

对 `karmada-01`、`karmada-02`、`karmada-03` 执行操作。以 `karmada-01` 为例。

/usr/lib/systemd/system/karmada-scheduler.service

```bash
[Unit]
Description=Karmada Scheduler
Documentation=https://github.com/karmada-io/karmada

[Service]
ExecStart=/usr/local/sbin/karmada-scheduler \
  --bind-address 0.0.0.0 \
  --enable-scheduler-estimator=true \
  --kubeconfig /etc/karmada/karmada.kubeconfig \
  --logtostderr=true \
  --scheduler-estimator-port 10352 \
  --secure-port 10511 \
  --v=4 \

Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### 启动 karmada-scheduler

```bash
systemctl daemon-reload
systemctl enable karmada-scheduler.service
systemctl start karmada-scheduler.service
systemctl status karmada-scheduler.service
```

### 验证

```bash
$ ./check_status.sh
###### 开始检查 karmada-scheduler
ok
###### karmada-scheduler 检查成功
```

## 安装 karmada-webhook

`karmada-webhook` 不同于 `scheduler` 和 `controller-manager`，其高可用需要用 `nginx` 实现。

修改 `nginx` 配置并添加以下配置。对 `karmada-01` 执行以下操作。

```bash
cat /usr/local/karmada-nginx/conf/nginx.conf
worker_processes 2;

events {
    worker_connections  1024;
}

stream {
    upstream backend {
        hash  consistent;
        server 172.31.209.245:6443        max_fails=3 fail_timeout=30s;
        server 172.31.209.246:6443        max_fails=3 fail_timeout=30s;
        server 172.31.209.247:6443        max_fails=3 fail_timeout=30s;
    }

    upstream webhook {
        hash  consistent;
        server 172.31.209.245:8443        max_fails=3 fail_timeout=30s;
        server 172.31.209.246:8443        max_fails=3 fail_timeout=30s;
        server 172.31.209.247:8443        max_fails=3 fail_timeout=30s;
    }

    server {
        listen 172.31.209.245:5443;
        proxy_connect_timeout 1s;
        proxy_pass backend;
    }

    server {
        listen 172.31.209.245:4443;
        proxy_connect_timeout 1s;
        proxy_pass webhook;
    }
}
```

重新加载 `nginx` 配置。

```bash
systemctl restart karmada-nginx
```

### 创建 Systemd 服务

对 `karmada-01`、`karmada-02`、`karmada-03` 执行操作。以 `karmada-01` 为例。

/usr/lib/systemd/system/karmada-webhook.service

```bash
[Unit]
Description=Karmada Webhook
Documentation=https://github.com/karmada-io/karmada

[Service]
ExecStart=/usr/local/sbin/karmada-webhook \
  --bind-address 0.0.0.0 \
  --cert-dir /etc/karmada/pki \
  --health-probe-bind-address ":8444" \
  --kubeconfig /etc/karmada/karmada.kubeconfig \
  --logtostderr=true \
  --metrics-bind-address ":8445" \
  --secure-port 8443 \
  --tls-cert-file-name "karmada.crt" \
  --tls-private-key-file-name "karmada.key" \
  --v=4 \

Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### 启动 karmada-webook

```bash
systemctl daemon-reload
systemctl enable karmada-webhook.service
systemctl start karmada-webhook.service
systemctl status karmada-webhook.service
```

### 配置 karmada-webhook

下载 `webhook-configuration.yaml` 文件：https://github.com/karmada-io/karmada/blob/master/artifacts/deploy/webhook-configuration.yaml

```bash
ca_string=$(cat /etc/karmada/pki/server-ca.crt | base64 | tr "\n" " "|sed s/[[:space:]]//g)
sed -i "s/{{caBundle}}/${ca_string}/g"  webhook-configuration.yaml
# 你需要将 172.31.209.245:4443 更改为你的负载均衡器 host:port。
sed -i 's/karmada-webhook.karmada-system.svc:443/172.31.209.245:4443/g'  webhook-configuration.yaml

kubectl create -f  webhook-configuration.yaml
```

### 验证

```bash
$ ./check_status.sh
###### 开始检查 karmada-webhook
ok
###### karmada-webhook 检查成功
```

## 初始化 Karmada

对 `karmada-01` 执行以下操作。

```bash
git clone https://github.com/karmada-io/karmada
cd karmada/charts/karmada/_crds/bases

kubectl apply -f .

cd ../patches/
ca_string=$(cat /etc/karmada/pki/server-ca.crt | base64 | tr "\n" " "|sed s/[[:space:]]//g)
sed -i "s/{{caBundle}}/${ca_string}/g" webhook_in_resourcebindings.yaml
sed -i "s/{{caBundle}}/${ca_string}/g"  webhook_in_clusterresourcebindings.yaml
# 你需要将 172.31.209.245:4443 更改为你的负载均衡器 host:port。
sed -i 's/karmada-webhook.karmada-system.svc:443/172.31.209.245:4443/g' webhook_in_resourcebindings.yaml
sed -i 's/karmada-webhook.karmada-system.svc:443/172.31.209.245:4443/g' webhook_in_clusterresourcebindings.yaml

kubectl patch CustomResourceDefinition resourcebindings.work.karmada.io --patch-file webhook_in_resourcebindings.yaml
kubectl patch CustomResourceDefinition clusterresourcebindings.work.karmada.io --patch-file webhook_in_clusterresourcebindings.yaml
```

此时，Karmada基础组件已经安装完毕，此时，你可以接入集群；如果想使用karmadactl聚合查询，需要运行如下命令：
```sh
cat <<EOF | kubectl --kubeconfig=/etc/karmada/admin.kubeconfig  apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cluster-proxy-clusterrole
rules:
- apiGroups:
  - 'cluster.karmada.io'
  resources:
  - clusters/proxy
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
    name: admin  #这里为证书的用户名，此安装默认为此用户
  # The token generated by the serviceaccount can parse the group information. Therefore, you need to specify the group information below.
  - kind: Group
    name: "system:masters" #这里为证书的group信息
EOF
```

## 安装 karmada-scheduler-estimator（选装）

`karmada-scheduler` 使用 gRPC 访问 karmada-scheduler-estimator。你可以将 "Linux 虚拟服务器"用作负载均衡器。

你需要先部署上述组件并将成员集群接入到 Karmada 控制面。请参见[安装 Karmada 到你自己的集群](./installation.md#install-karmada-on-your-own-cluster)。

### 创建 Systemd 服务

在以下示例中，"/etc/karmada/physical-machine-karmada-member-1.kubeconfig" 是已接入成员集群的 kubeconfig 文件。



对 `karmada-01`、`karmada-02`、`karmada-03` 执行操作。以 `karmada-01` 为例。

/usr/lib/systemd/system/karmada-scheduler-estimator.service

```bash
[Unit]
Description=Karmada Scheduler Estimator
Documentation=https://github.com/karmada-io/karmada

[Service]
# 你需要更改 `--cluster-name` `--kubeconfig`
ExecStart=/usr/local/sbin/karmada-scheduler-estimator \
  --cluster-name "physical-machine-karmada-member-1" \
  --kubeconfig "/etc/karmada/physical-machine-karmada-member-1.kubeconfig" \
  --logtostderr=true \
  --server-port 10352 \

Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### 启动 karmada-scheduler-estimator

```bash
systemctl daemon-reload
systemctl enable karmada-scheduler-estimator.service
systemctl start karmada-scheduler-estimator.service
systemctl status karmada-scheduler-estimator.service
```

### 创建服务

(1) 创建 `karmada-scheduler-estimator.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: karmada-scheduler-estimator-{{MEMBER_CLUSTER_NAME}}
  namespace: karmada-system
  labels:
    cluster: {{MEMBER_CLUSTER_NAME}}
spec:
  ports:
    - protocol: TCP
      port: {{PORT}}
      targetPort: {{TARGET_PORT}}
  type: ExternalName
  externalName: {{EXTERNAL_NAME}}
```

`{{PORT}}`: "--scheduler-estimator-port" parameter of "karmada-scheduler".

`{{TARGET_PORT}}`: LoadBalancer IP.

`{{EXTERNAL_NAME}}`: LoadBalancer Host.

`{{MEMBER_CLUSTER_NAME}}`: Member Cluster Name



(2) 创建服务

```bash
kubectl create --kubeconfig "/etc/karmada/admin.kubeconfig" -f karmada-scheduler-estimator.yaml 
```

### 验证

```bash
$ ./check_status.sh
###### 开始检查 karmada-scheduler-estimator
ok
###### karmada-scheduler-estimator 检查成功
```

### 故障排查

1. `karmada-scheduler` 需要一些时间才能找到新的 `karmada-scheduler-estimator`。如果你不想等，可以直接重启 karmada-scheduler。

```bash
systemctl restart karmada-scheduler.service
```

## 安装 karmada-search（选装）

### 创建 Systemd 服务

对 `karmada-01`、`karmada-02`、`karmada-03` 执行操作。以 `karmada-01` 为例。

/usr/lib/systemd/system/karmada-search.service

```bash
[Unit]
Description=Karmada Search
Documentation=https://github.com/karmada-io/karmada

[Service]
ExecStart=/usr/local/sbin/karmada-search \
  --audit-log-maxage 0  \
  --audit-log-maxbackup 0 \
  --audit-log-path -  \
  --authentication-kubeconfig /etc/karmada/karmada.kubeconfig  \
  --authorization-kubeconfig /etc/karmada/karmada.kubeconfig  \
  --etcd-cafile /etc/karmada/pki/etcd/ca.crt \
  --etcd-certfile /etc/karmada/pki/etcd/apiserver-etcd-client.crt \
  --etcd-keyfile /etc/karmada/pki/etcd/apiserver-etcd-client.key \
  --etcd-servers "https://172.31.209.245:2379,https://172.31.209.246:2379,https://172.31.209.247:2379" \
  --feature-gates "APIPriorityAndFairness=false"  \
  --kubeconfig /etc/karmada/karmada.kubeconfig \
  --logtostderr=true \
  --secure-port 9443 \
  --tls-cert-file /etc/karmada/pki/karmada.crt \
  --tls-private-key-file /etc/karmada/pki/karmada.key \

Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### 启动 karmada-search

```bash
systemctl daemon-reload
systemctl enable karmada-search.service
systemctl start karmada-search.service
systemctl status karmada-search.service
```

### 验证

```bash
$ ./check_status.sh
###### 开始检查 karmada-search
[+]ping ok
[+]log ok
[+]etcd ok
[+]poststarthook/generic-apiserver-start-informers ok
[+]poststarthook/max-in-flight-filter ok
[+]poststarthook/start-karmada-search-informers ok
[+]poststarthook/start-karmada-informers ok
[+]poststarthook/start-karmada-search-controller ok
[+]poststarthook/start-karmada-proxy-controller ok
livez check passed

###### karmada-search 检查成功
```

### 配置

[代理全局资源](../userguide/globalview/proxy-global-resource.md)
