---
title: Installation by Binary
---

Step-by-step installation of binary high-availability `karmada` cluster.

## Prerequisites

### Server

3 servers required. E.g.

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

> Public IP is not required. It is used to download some `karmada` dependent components from the public network and connect to `karmada` ApiServer through the public network

### DNS Resolution

Execute operations at `karmada-01` `karmada-02` `karmada-03`.

```bash
$ vi /etc/hosts
172.31.209.245	karmada-01
172.31.209.246	karmada-02
172.31.209.247	karmada-03
```

Alternatively, you can use "Linux Virtual Server" for load balancing, and don't change /etc/hosts file.

### Environment

`karmada-01`  requires the following environment.

**Golang**:  Compile the karmada binary
**GCC**: Compile nginx (ignore if using cloud load balancing)

## Compile and Download Binaries

Execute operations at `karmada-01`.

### Kubernetes Binaries

Download the `kubernetes` binary package.

Refer to this page to download binaries of different versions and architectures: [https://kubernetes.io/releases/download/#binaries](https://kubernetes.io/releases/download/#binaries)

```bash
wget https://dl.k8s.io/v1.23.3/kubernetes-server-linux-amd64.tar.gz
tar -zxvf kubernetes-server-linux-amd64.tar.gz --no-same-owner
cd kubernetes/server/bin
mv kube-apiserver kube-controller-manager kubectl /usr/local/sbin/
```

### etcd Binaries

Download the `etcd` binary package.

You may want to use a newer version of etcd, please refer to this page: [https://etcd.io/docs/latest/install/](https://etcd.io/docs/latest/install/)

```bash
wget https://github.com/etcd-io/etcd/releases/download/v3.5.1/etcd-v3.5.1-linux-amd64.tar.gz
tar -zxvf etcd-v3.5.1-linux-amd64.tar.gz --no-same-owner
cd etcd-v3.5.1-linux-amd64/
mv etcdctl etcd /usr/local/sbin/
```

### Karmada Binaries

Compile the `karmada` binaries from source.

```bash
git clone https://github.com/karmada-io/karmada
cd karmada
make karmada-aggregated-apiserver karmada-controller-manager karmada-scheduler karmada-webhook karmadactl kubectl-karmada
mv _output/bin/linux/amd64/* /usr/local/sbin/
```

### Nginx Binaries

Compile the `nginx` binary from source.

```bash
wget http://nginx.org/download/nginx-1.21.6.tar.gz
tar -zxvf nginx-1.21.6.tar.gz
cd nginx-1.21.6
./configure --with-stream --without-http --prefix=/usr/local/karmada-nginx --without-http_uwsgi_module --without-http_scgi_module --without-http_fastcgi_module
make && make install
mv /usr/local/karmada-nginx/sbin/nginx /usr/local/karmada-nginx/sbin/karmada-nginx
```

### Distribute Binaries

Upload the binary file to the `karmada-02`  `karmada-03 ` server.

## Generate Certificates

### Step 1: Create Bash Scripts and Configuration Files

The scripts will generate certificates using the `openssl` command. Download [this directory](https://github.com/karmada-io/website/tree/main/docs/resources/installation/install-binary/generate_cert).

We separate CA & leaf certificates generation scripts, so when you need to change Subject Alternative Name of leaf certificates (aka Load Balancer IP), you can reuse CA certificates, and run generate_leaf.sh to generate only leaf certificates.



There are 3 CAs: front-proxy-ca, server-ca, etcd/ca. Why we need 3 CAs please see: [PKI certificates and requirements](https://kubernetes.io/docs/setup/best-practices/certificates/), [CA Reusage and Conflicts](https://kubernetes.io/docs/tasks/extend-kubernetes/configure-aggregation-layer/#ca-reusage-and-conflicts).

If you use etcd provided by others, you can ignore `generate_etcd.sh` and `csr_config/etcd`.

### Step 2: Change `<SERVER_IP>`

You need to change `<SERVER_IP>` in `csr_config/**/*.conf` file to your "Load Balancer IP" and "Server IP". If you only use Load Balancer to access your servers, you only need to fill in "Load Balancer IP".

You normally don't need to change `*.sh` files.


### Step 3: Run Shell Scripts

```bash
./generate_ca.sh
./generate_leaf.sh ca_cert/
./generate_etcd.sh
```


### Step 4: Check the Certificates

You can view the configuration of the certificate, take `karmada.crt ` as an example.

```bash
openssl x509 -noout -text -in karmada.crt
```

### Step 5: Create the Karmada Configuration Directory

Copy the certificates to the `/etc/karmada/pki` directory.

```bash
mkdir -p /etc/karmada/pki

cd ca_cert
cp -r * /etc/karmada/pki

cd ../cert
cp -r * /etc/karmada/pki
```


## Create the Karmada kubeconfig Files and etcd Encryption Key

Execute operations at `karmada-01`.

### Create kubeconfig Files

**Step 1: Download bash script**

Download [this file](https://github.com/karmada-io/website/tree/main/docs/resources/installation/install-binary/other_scripts/create_kubeconfig_file.sh).

**Step 2: execute bash script**

`172.31.209.245:5443` is the address of the `nginx` proxy for `karmada-apiserver`, we'll set it up later. You should replace it with your Load Balancer provided "host:port".

```bash
./create_kubeconfig_file.sh "https://172.31.209.245:5443"
```

### Create etcd Encryption Key

If you don't need to encrypt contents in etcd, ignore this section and corresponding kube-apiserver start parameter.

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

### Distribute Files

Package the `karmada` configuration files and copy them to other nodes.

```bash
cd /etc
tar -cvf karmada.tar karmada
scp karmada.tar  karmada-02:/etc/
scp karmada.tar  karmada-03:/etc/
```

`karmada-02`  `karmada-03 `  need to decompress archives.

```bash
cd /etc
tar -xvf karmada.tar
```

## Health Check Script

(1) You can use the following `check_status.sh` to check if all components are healthy.

Download [this file](https://github.com/karmada-io/website/tree/main/docs/resources/installation/install-binary/other_scripts/check_status.sh).

Note: If you are using CentOS 7, you need to run `yum update -y nss curl` to update curl version, then curl may support tls 1.3. If curl still does not support tls 1.3, you need to update OS version which includes newer curl, or simply use a go program to do a health check.



(2) Usage: `./check_status.sh`

## Install etcd cluster

Execute operations at `karmada-01` `karmada-02` `karmada-03`.  Take `karmada-01` as an example.

### Create Systemd Service

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

Notice:

>The parameters that `karmada-02` `karmada-03` need to change are:
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
>You can use `EnvironmentFile` to separate mutable configs from immutable configs.

### Start etcd cluster

3 servers have to execute.

create etcd storage directory

```bash
mkdir /var/lib/etcd/
chmod 700 /var/lib/etcd
```

start etcd

```bash
systemctl daemon-reload
systemctl enable etcd.service
systemctl start etcd.service
systemctl status etcd.service
```

### Verify

```bash
$ etcdctl --cacert /etc/karmada/pki/etcd/ca.crt \
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

## Install kube-apiserver

### Configure Nginx

Execute operations at `karmada-01`.

configure load balancing for `karmada apiserver`



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

start `karmada nginx`

```bash
systemctl daemon-reload
systemctl enable karmada-nginx.service
systemctl start karmada-nginx.service
systemctl status karmada-nginx.service
```

### Create kube-apiserver Systemd Service

Execute operations at `karmada-01` `karmada-02` `karmada-03`.  Take `karmada-01` as an example.



/usr/lib/systemd/system/kube-apiserver.service

```bash
[Unit]
Description=Kubernetes API Server
Documentation=https://kubernetes.io/docs/home/
After=network.target

[Service]
# If you don't need to encrypt etcd, remove --encryption-provider-config
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

### Start kube-apiserver

3 servers have to execute.

``` bash
systemctl daemon-reload
systemctl enable kube-apiserver.service
systemctl start kube-apiserver.service
systemctl status kube-apiserver.service
```

### Verify

```bash
$ ./check_status.sh
###### Start check kube-apiserver
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

###### kube-apiserver check success
```

## Install karmada-aggregated-apiserver

Create  `namespace` and bind the `cluster admin role`. Execute operations at `karmada-01`.

```bash
kubectl create ns karmada-system
kubectl create clusterrolebinding cluster-admin:karmada --clusterrole=cluster-admin --user system:karmada
```

Then, like `karmada-webhook`, use `nginx` for high availability.

modify the `nginx` configuration and add the following configuration,Execute operations at `karmada-01`.

```bash
$ cat /usr/local/karmada-nginx/conf/nginx.conf
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

Reload `nginx` configuration

```bash
systemctl restart karmada-nginx
```

### Create Systemd Service

Execute operations at `karmada-01` `karmada-02` `karmada-03`.  Take `karmada-01` as an example.

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

### Start karmada-aggregated-apiserver

```bash
systemctl daemon-reload
systemctl enable karmada-aggregated-apiserver.service
systemctl start karmada-aggregated-apiserver.service
systemctl status karmada-aggregated-apiserver.service
```

### Create `APIService`

`externalName` is the host name of the node where `nginx` is located (`karmada-01`).



(1) create file: `karmada-aggregated-apiserver-apiservice.yaml`

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

### Verify

```bash
$ ./check_status.sh
###### Start check karmada-aggregated-apiserver
[+]ping ok
[+]log ok
[+]etcd ok
[+]poststarthook/generic-apiserver-start-informers ok
[+]poststarthook/max-in-flight-filter ok
[+]poststarthook/start-aggregated-server-informers ok
livez check passed

###### karmada-aggregated-apiserver check success
```

## Prepare Karmada CRDs Resources

Execute operations at `karmada-01`.

```bash
git clone https://github.com/karmada-io/karmada
cd karmada/charts/karmada/_crds/bases

kubectl apply -f .

cd ../patches/
ca_string=$(cat /etc/karmada/pki/server-ca.crt | base64 | tr "\n" " "|sed s/[[:space:]]//g)
sed -i "s/{{caBundle}}/${ca_string}/g" webhook_in_resourcebindings.yaml
sed -i "s/{{caBundle}}/${ca_string}/g"  webhook_in_clusterresourcebindings.yaml
# You need to change 172.31.209.245:4443 to your Load Balancer host:port.
sed -i 's/karmada-webhook.karmada-system.svc:443/172.31.209.245:4443/g' webhook_in_resourcebindings.yaml
sed -i 's/karmada-webhook.karmada-system.svc:443/172.31.209.245:4443/g' webhook_in_clusterresourcebindings.yaml

kubectl patch CustomResourceDefinition resourcebindings.work.karmada.io --patch-file webhook_in_resourcebindings.yaml
kubectl patch CustomResourceDefinition clusterresourcebindings.work.karmada.io --patch-file webhook_in_clusterresourcebindings.yaml
cd ../../../../..
```

## Install kube-controller-manager

Execute operations at `karmada-01` `karmada-02` `karmada-03`.  Take `karmada-01` as an example.

### Create Systemd Service

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

### Start kube-controller-manager

```bash
systemctl daemon-reload
systemctl enable kube-controller-manager.service
systemctl start kube-controller-manager.service
systemctl status kube-controller-manager.service
```

### Verify

```bash
$ ./check_status.sh
###### Start check kube-controller-manager
[+]leaderElection ok
healthz check passed

###### kube-controller-manager check success
```

## Install karmada-controller-manager

### Create Systemd Service

Execute operations at `karmada-01` `karmada-02` `karmada-03`.  Take `karmada-01` as an example.

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

### Start karmada-controller-manager

```bash
systemctl daemon-reload
systemctl enable karmada-controller-manager.service
systemctl start karmada-controller-manager.service
systemctl status karmada-controller-manager.service
```

### Verify

```bash
$ ./check_status.sh
###### Start check karmada-controller-manager
[+]ping ok
healthz check passed

###### karmada-controller-manager check success
```

## Install karmada-scheduler

### Create Systemd Service

Execute operations at `karmada-01` `karmada-02` `karmada-03`.  Take `karmada-01` as an example.

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

### Start karmada-scheduler

```bash
systemctl daemon-reload
systemctl enable karmada-scheduler.service
systemctl start karmada-scheduler.service
systemctl status karmada-scheduler.service
```

### Verify

```bash
$ ./check_status.sh
###### Start check karmada-scheduler
ok
###### karmada-scheduler check success
```

## Install karmada-webhook

`karmada-webhook` is different from `scheduler` and `controller-manager`, and its high availability needs to be implemented with `nginx.`

modify the `nginx` configuration and add the following configuration,Execute operations at `karmada-01`.

```bash
$ cat /usr/local/karmada-nginx/conf/nginx.conf
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

Reload `nginx` configuration

```bash
systemctl restart karmada-nginx
```

### Create Systemd Service

Execute operations at `karmada-01` `karmada-02` `karmada-03`.  Take `karmada-01` as an example.

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

### Start karmada-webook

```bash
systemctl daemon-reload
systemctl enable karmada-webhook.service
systemctl start karmada-webhook.service
systemctl status karmada-webhook.service
```

### Configure karmada-webhook

Download the `webhook-configuration.yaml` file: [https://github.com/karmada-io/karmada/blob/master/artifacts/deploy/webhook-configuration.yaml](https://github.com/karmada-io/karmada/blob/master/artifacts/deploy/webhook-configuration.yaml)

```bash
ca_string=$(cat /etc/karmada/pki/server-ca.crt | base64 | tr "\n" " "|sed s/[[:space:]]//g)
sed -i "s/{{caBundle}}/${ca_string}/g"  webhook-configuration.yaml
# You need to change 172.31.209.245:4443 to your Load Balancer host:port.
sed -i 's/karmada-webhook.karmada-system.svc:443/172.31.209.245:4443/g'  webhook-configuration.yaml

kubectl create -f  webhook-configuration.yaml
```

### Verify

```bash
$ ./check_status.sh
###### Start check karmada-webhook
ok
###### karmada-webhook check success
```

## Initialize Karmada

Now, all the required components have been installed, and the member clusters could join Karmada control plane.
If you want to use `karmadactl` to query, please run following command:
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
    name: admin  # The name should be the user of client certificate
  # The token generated by the serviceaccount can parse the group information. Therefore, you need to specify the group information below.
  - kind: Group
    name: "system:masters" # The name should be the gourp of client certificate
EOF
```

## Install karmada-scheduler-estimator (Optional)

`karmada-scheduler` uses gRPC to access karmada-scheduler-estimator. You can use "Linux Virtual Server" as the Load Balancer.

You need to deploy above components and join member cluster into Karmada Control Plane first. See: [Install Karmada on your own cluster](./installation.md#install-karmada-on-your-own-cluster)

### Create Systemd Service

In the example below, "/etc/karmada/physical-machine-karmada-member-1.kubeconfig" is kubeconfig file of the joined member cluster.



Execute operations at `karmada-01` `karmada-02` `karmada-03`.  Take `karmada-01` as an example.

/usr/lib/systemd/system/karmada-scheduler-estimator.service

```bash
[Unit]
Description=Karmada Scheduler Estimator
Documentation=https://github.com/karmada-io/karmada

[Service]
# You need to change `--cluster-name` `--kubeconfig`
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

### Start karmada-scheduler-estimator

```bash
systemctl daemon-reload
systemctl enable karmada-scheduler-estimator.service
systemctl start karmada-scheduler-estimator.service
systemctl status karmada-scheduler-estimator.service
```

### Create Service

(1) Create `karmada-scheduler-estimator.yaml `

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



(2) Create Service

```bash
kubectl create --kubeconfig "/etc/karmada/admin.kubeconfig" -f karmada-scheduler-estimator.yaml
```

### Verify

```bash
$ ./check_status.sh
###### Start check karmada-scheduler-estimator
ok
###### karmada-scheduler-estimator check success
```

### Trouble Shooting

1\. `karmada-scheduler` takes some time to find the new `karmada-scheduler-estimator`. If you can't wait, you can just restart karmada-scheduler.

```bash
systemctl restart karmada-scheduler.service
```

## Install karmada-search (Optional)

### Create Systemd Service

Execute operations at `karmada-01` `karmada-02` `karmada-03`.  Take `karmada-01` as an example.

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

### Start karmada-search

```bash
systemctl daemon-reload
systemctl enable karmada-search.service
systemctl start karmada-search.service
systemctl status karmada-search.service
```

### Verify

```bash
$ ./check_status.sh
###### Start check karmada-search
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

###### karmada-search check success
```

### Configure

[Proxy Global Resources](../userguide/globalview/proxy-global-resource.md)

