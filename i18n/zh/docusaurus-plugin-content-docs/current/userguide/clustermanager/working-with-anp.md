---
title: 为拉取模式部署 apiserver-network-proxy（ANP）
---

## 目的

对于以拉取模式加入 Karmada 的成员集群，您需要提供 Karmada 控制平面与该成员集群之间的网络连接方案，确保 Karmada 聚合 API 服务器（karmada-aggregated-apiserver）能够访问该成员集群。

部署 ANP（apiserver-network-proxy）是实现该网络连接的方案之一。本文档将介绍如何为 Karmada 部署 ANP。

## 环境

Karmada 可通过 kind 工具部署，您可直接使用 `hack/local-up-karmada.sh` 脚本完成 Karmada 部署。

## 操作步骤

### 步骤 1：下载代码

为方便演示，以下代码基于 ANP v0.0.24 版本修改，支持通过 HTTP 访问前端服务器。代码仓库地址如下：https://github.com/mrlihanbo/apiserver-network-proxy/tree/v0.0.24/dev

执行以下命令下载代码并进入仓库目录：

```shell
git clone -b v0.0.24/dev https://github.com/mrlihanbo/apiserver-network-proxy.git
cd apiserver-network-proxy/
```

### 步骤 2：构建镜像

构建 proxy-server 和 proxy-agent 镜像，执行以下命令：

```shell
docker build . --build-arg ARCH=amd64 -f artifacts/images/agent-build.Dockerfile -t swr.ap-southeast-1.myhuaweicloud.com/karmada/proxy-agent:0.0.24

docker build . --build-arg ARCH=amd64 -f artifacts/images/server-build.Dockerfile -t swr.ap-southeast-1.myhuaweicloud.com/karmada/proxy-server:0.0.24
```

### 步骤 3：生成证书

执行以下命令检查 karmada-host 的 IP 地址：

```shell
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' karmada-host-control-plane
```

执行 `make certs` 命令生成证书，并将 `PROXY_SERVER_IP` 指定为上一步获取的 IP 地址（将 x.x.x.x 替换为实际 IP）：

```shell
make certs PROXY_SERVER_IP=x.x.x.x
```

生成的证书将存储在 `certs` 文件夹中。

### 步骤 4：部署 proxy-server

在 ANP 代码仓库的根目录下，创建并保存 `proxy-server.yaml` 文件。

<details>
<summary>展开查看 yaml 文件</summary>

```yaml
# proxy-server.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: proxy-server
  namespace: karmada-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: proxy-server
  template:
    metadata:
      labels:
        app: proxy-server
    spec:
      containers:
      - command:
        - /proxy-server
        args:
          - --health-port=8092
          - --cluster-ca-cert=/var/certs/server/cluster-ca-cert.crt
          - --cluster-cert=/var/certs/server/cluster-cert.crt 
          - --cluster-key=/var/certs/server/cluster-key.key
          - --mode=http-connect 
          - --proxy-strategies=destHost 
          - --server-ca-cert=/var/certs/server/server-ca-cert.crt
          - --server-cert=/var/certs/server/server-cert.crt 
          - --server-key=/var/certs/server/server-key.key
        image: swr.ap-southeast-1.myhuaweicloud.com/karmada/proxy-server:0.0.24
        imagePullPolicy: IfNotPresent
        livenessProbe:
          failureThreshold: 3
          httpGet:
            path: /healthz
            port: 8092
            scheme: HTTP
          initialDelaySeconds: 10
          periodSeconds: 10
          successThreshold: 1
          timeoutSeconds: 60
        name: proxy-server
        volumeMounts:
        - mountPath: /var/certs/server
          name: cert
      restartPolicy: Always
      hostNetwork: true
      volumes:
      - name: cert
        secret:
          secretName: proxy-server-cert
---
apiVersion: v1
kind: Secret
metadata:
  name: proxy-server-cert
  namespace: karmada-system
type: Opaque
data:
  server-ca-cert.crt: |
    {{server_ca_cert}}
  server-cert.crt: |
    {{server_cert}}
  server-key.key: |
    {{server_key}}
  cluster-ca-cert.crt: |
    {{cluster_ca_cert}}
  cluster-cert.crt: |
    {{cluster_cert}}
  cluster-key.key: |
    {{cluster_key}}
```

</details>

在 ANP 代码仓库的根目录下，创建并保存 `replace-proxy-server.sh` 脚本文件。

<details>
<summary>展开查看 shell 脚本</summary>

```shell
#!/bin/bash

cert_yaml=proxy-server.yaml

SERVER_CA_CERT=$(cat certs/frontend/issued/ca.crt | base64 | tr "\n" " "|sed s/[[:space:]]//g)
sed -i'' -e "s/{{server_ca_cert}}/${SERVER_CA_CERT}/g" ${cert_yaml}

SERVER_CERT=$(cat certs/frontend/issued/proxy-frontend.crt | base64 | tr "\n" " "|sed s/[[:space:]]//g)
sed -i'' -e "s/{{server_cert}}/${SERVER_CERT}/g" ${cert_yaml}

SERVER_KEY=$(cat certs/frontend/private/proxy-frontend.key | base64 | tr "\n" " "|sed s/[[:space:]]//g)
sed -i'' -e "s/{{server_key}}/${SERVER_KEY}/g" ${cert_yaml}

CLUSTER_CA_CERT=$(cat certs/agent/issued/ca.crt | base64 | tr "\n" " "|sed s/[[:space:]]//g)
sed -i'' -e "s/{{cluster_ca_cert}}/${CLUSTER_CA_CERT}/g" ${cert_yaml}

CLUSTER_CERT=$(cat certs/agent/issued/proxy-frontend.crt | base64 | tr "\n" " "|sed s/[[:space:]]//g)
sed -i'' -e "s/{{cluster_cert}}/${CLUSTER_CERT}/g" ${cert_yaml}


CLUSTER_KEY=$(cat certs/agent/private/proxy-frontend.key | base64 | tr "\n" " "|sed s/[[:space:]]//g)
sed -i'' -e "s/{{cluster_key}}/${CLUSTER_KEY}/g" ${cert_yaml}
```

</details>

执行以下命令运行脚本:

```shell
chmod +x replace-proxy-server.sh
bash replace-proxy-server.sh
```

在 karmada-host 集群上部署 proxy-server：

```shell
kind load docker-image swr.ap-southeast-1.myhuaweicloud.com/karmada/proxy-server:0.0.24 --name karmada-host
export KUBECONFIG=/root/.kube/karmada.config
kubectl --context=karmada-host apply -f proxy-server.yaml
```

### 步骤 5：部署 proxy-agent

在 ANP 代码仓库的根目录下，创建并保存 `proxy-agent.yaml` 文件。

<details>
<summary>展开查看 yaml 文件</summary>

```yaml
# proxy-agent.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: proxy-agent
  name: proxy-agent
  namespace: karmada-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: proxy-agent
  template:
    metadata:
      labels:
        app: proxy-agent
    spec:
      containers:
        - command:
            - /proxy-agent
          args:
            - '--ca-cert=/var/certs/agent/ca.crt'
            - '--agent-cert=/var/certs/agent/proxy-agent.crt'
            - '--agent-key=/var/certs/agent/proxy-agent.key'
            - '--proxy-server-host={{proxy_server_addr}}'
            - '--proxy-server-port=8091'
            - '--agent-identifiers=host={{identifiers}}'
          image: swr.ap-southeast-1.myhuaweicloud.com/karmada/proxy-agent:0.0.24
          imagePullPolicy: IfNotPresent
          name: proxy-agent
          livenessProbe:
            httpGet:
              scheme: HTTP
              port: 8093
              path: /healthz
            initialDelaySeconds: 15
            timeoutSeconds: 60
          volumeMounts:
            - mountPath: /var/certs/agent
              name: cert
      volumes:
        - name: cert
          secret:
            secretName: proxy-agent-cert
---
apiVersion: v1
kind: Secret
metadata:
  name: proxy-agent-cert
  namespace: karmada-system
type: Opaque
data:
  ca.crt: |
    {{proxy_agent_ca_crt}}
  proxy-agent.crt: |
    {{proxy_agent_crt}}
  proxy-agent.key: |
    {{proxy_agent_key}}
```

</details>

在 ANP 代码仓库的根目录下，创建并保存 `replace-proxy-agent.sh` 脚本文件。

<details>
<summary>展开查看 shell 脚本</summary>

```shell
#!/bin/bash

cert_yaml=proxy-agent.yaml

karmada_control_plane_addr=$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' karmada-host-control-plane)
member3_cluster_addr=$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' member3-control-plane)
sed -i'' -e "s/{{proxy_server_addr}}/${karmada_control_plane_addr}/g" ${cert_yaml}
sed -i'' -e "s/{{identifiers}}/${member3_cluster_addr}/g" ${cert_yaml}

PROXY_AGENT_CA_CRT=$(cat certs/agent/issued/ca.crt | base64 | tr "\n" " "|sed s/[[:space:]]//g)
sed -i'' -e "s/{{proxy_agent_ca_crt}}/${PROXY_AGENT_CA_CRT}/g" ${cert_yaml}

PROXY_AGENT_CRT=$(cat certs/agent/issued/proxy-agent.crt | base64 | tr "\n" " "|sed s/[[:space:]]//g)
sed -i'' -e "s/{{proxy_agent_crt}}/${PROXY_AGENT_CRT}/g" ${cert_yaml}

PROXY_AGENT_KEY=$(cat certs/agent/private/proxy-agent.key | base64 | tr "\n" " "|sed s/[[:space:]]//g)
sed -i'' -e "s/{{proxy_agent_key}}/${PROXY_AGENT_KEY}/g" ${cert_yaml}
```

</details>

执行以下命令运行脚本:

```shell
chmod +x replace-proxy-agent.sh
bash replace-proxy-agent.sh
```

以拉取模式为成员集群部署 proxy-agent（本文以 `member3` 集群为例，该集群已配置为拉取模式）：

```shell
kind load docker-image swr.ap-southeast-1.myhuaweicloud.com/karmada/proxy-agent:0.0.24 --name member3
kubectl --kubeconfig=/root/.kube/members.config --context=member3 apply -f proxy-agent.yaml
```

**至此，ANP 部署完成。**

### 步骤 6：为 karmada-agent 部署添加命令参数

ANP 部署完成后，需为 `member3` 集群中的 `karmada-agent` 部署添加额外的命令参数 `--cluster-api-endpoint` 和 `--proxy-server-address`，具体说明如下：

- `--cluster-api-endpoint`：成员集群的 API 端点，可从 `member3` 集群的 KubeConfig 文件中获取。

- `--proxy-server-address`：用于代理该集群的 `proxy-server` 地址，本文中需设置为 `http://<karmada_control_plane_addr>:8088`（将 `<karmada_control_plane_addr>` 替换为实际 IP）。
执行以下命令获取 `karmada_control_plane_addr` 的地址：

```shell
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' karmada-host-control-plane
```

端口 `8088` 可通过修改 ANP 中的代码进行设置: https://github.com/mrlihanbo/apiserver-network-proxy/blob/v0.0.24/dev/cmd/server/app/server.go#L267。 您也可以将其修改为其他端口值。 
