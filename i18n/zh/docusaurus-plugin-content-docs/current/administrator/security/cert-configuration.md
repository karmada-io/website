---
title: Certificate Configuration
---

## Certificate Configuration

Karmada 组件通过使用数字证书来验证对方身份，以避免恶意第三方伪造身份窃取信息或者对系统进行攻击。在两个组件进行双向人证书时，会涉及到下面相关文件：

- 业务证书（客户端/服务器端）：用于证明自身身份的证书
- 私钥： 业务证书包含的公钥所对应的私钥
- CA根证书： 签发业务证书的 CA根证书

业务证书与CA根证书均有有效期，因此当业务证书或者CA根证书即将过期或已经过期时，需要替换新的证书，来保证组件能正常运行。

### Prerequisites

You need to install the following tools:

- `openssl` ([Installation Guide](https://github.com/openssl/openssl#download))
- `cfssl` ([Installation Guide](github.com/cloudflare/cfssl/cmd))
- `cfssljson` ([Installation Guide](github.com/cloudflare/cfssl/cmd))



> NOTE: 以下案例均基于从[Installation from Source](https://karmada.io/docs/installation/fromsource/#install)的安装方式进行讲述，采用其他安装方式时需进行相应的适配

### Karmada 证书

Karmada 证书存储路径： 默认为${HOME}/.karmada

当前 karmada 所使用的证书共有：

```shell
$ tree
.
├── apiserver.crt
├── apiserver.key
├── ca-config.json
├── ca.crt
├── ca.key
├── etcd-ca-config.json
├── etcd-ca.crt
├── etcd-ca.key
├── etcd-client.crt
├── etcd-client.key
├── etcd-server.crt
├── etcd-server.key
├── front-proxy-ca-config.json
├── front-proxy-ca.crt
├── front-proxy-ca.key
├── front-proxy-client.crt
├── front-proxy-client.key
├── karmada.crt
└── karmada.key
```
#### Karmada 证书简介

依据证书所签发的 CA可以分为三套证书：

- 由ca签发

  证书 apiserver和karmada均由CA ca证书签发，证书的关键属性如下：

  | 证书      | common name(CN)   | organization(og) | hosts                                                        |
  | --------- | ----------------- | ---------------- | ------------------------------------------------------------ |
  | apiserver | karmada-apiserver | /                | "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1" "${api server's ip from kubecomfig by context karmada host}" |
  | karmada   | system:admin      | system:masters   | kubernetes.default.svc "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1" "${interpreter_webhook_example_service_external_ip_address}" |

  其中${api server's ip from kubecomfig by context karmada host}可以通过执行

  ```shell
  #!/usr/bin/env bash
  context_name=$1
  cluster_name=$(kubectl config view --template='{{ range $_, $value := .contexts }}{{if eq $value.name '"\"${context_name}\""'}}{{$value.context.cluster}}{{end}}{{end}}')
  apiserver_url=$(kubectl config view --template='{{range $_, $value := .clusters }}{{if eq $value.name '"\"${cluster_name}\""'}}{{$value.cluster.server}}{{end}}{{end}}')
  echo "${apiserver_url}" | awk -F/ '{print $3}' | sed 's/:.*//'
  ```

  得到。
PS:  kubeconfig file中的karmada api server config所使用的证书是karmada证书

- 由etcd-ca签发

  证书etcd-client和etcd-server均由CA etcd-ca证书签发，证书的关键属性如下：

  | 证书        | common name(CN) | organization(og) | hosts                                                        |
  | ----------- | --------------- | ---------------- | ------------------------------------------------------------ |
  | etcd-server | etcd-server     | /                | kubernetes.default.svc "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1" |
  | etcd-client | etcd-client     | /                | "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1" |

- 由front-proxy-ca签发

  证书 front-proxy-client由CA front-proxy-ca证书签发，证书的关键属性如下：

  | 证书               | common name(CN)    | organization(og) | hosts                                                        |
  | ------------------ | ------------------ | ---------------- | ------------------------------------------------------------ |
  | front-proxy-client | front-proxy-client | /                | kubernetes.default.svc "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1" |

#### Karmada 组件如何使用证书
karmada通过secret来store证书。当前Karmada用于store证书的secret有：

- [karmada-cert-secret](https://github.com/karmada-io/karmada/blob/master/artifacts/deploy/karmada-cert-secret.yaml)
- [kubeconfig](https://github.com/karmada-io/karmada/blob/master/artifacts/deploy/secret.yaml)

- [karmada-webhook-cert-secret](https://github.com/karmada-io/karmada/blob/master/artifacts/deploy/karmada-webhook-cert-secret.yaml)

可从[cert-secret-generation](https://github.com/karmada-io/karmada/blob/19d1146c3510942809f48d399fc2079ce3a79a66/hack/deploy-karmada.sh#L102-L124) 查找各secret所对应的证书。

Karmada 组件通过挂载 secret来获取所需证书，各组件的证书使用详情如下：

- etcd

  挂载的secret： karmada-cert-secret

  证书使用场景：

  ```yaml
              - --cert-file=/etc/karmada/pki/etcd-server.crt
              - --key-file=/etc/karmada/pki/etcd-server.key
              - --trusted-ca-file=/etc/karmada/pki/etcd-ca.crt
  ```

- karmada apiserver

  挂载的secret: karmada-cert-secret

  证书使用场景：

  ```yaml
              - --client-ca-file=/etc/karmada/pki/ca.crt
              - --etcd-cafile=/etc/karmada/pki/etcd-ca.crt
              - --etcd-certfile=/etc/karmada/pki/etcd-client.crt
              - --etcd-keyfile=/etc/karmada/pki/etcd-client.key
              - --kubelet-client-certificate=/etc/karmada/pki/karmada.crt
              - --kubelet-client-key=/etc/karmada/pki/karmada.key
              - --service-account-key-file=/etc/karmada/pki/karmada.key
              - --service-account-signing-key-file=/etc/karmada/pki/karmada.key
              - --proxy-client-cert-file=/etc/karmada/pki/front-proxy-client.crt
              - --proxy-client-key-file=/etc/karmada/pki/front-proxy-client.key
              - --requestheader-client-ca-file=/etc/karmada/pki/front-proxy-ca.crt
              - --tls-cert-file=/etc/karmada/pki/apiserver.crt
              - --tls-private-key-file=/etc/karmada/pki/apiserver.key
  ```

- karmada controller manager

  挂载的secret: kubeconfig

  证书的使用场景：

  ```yaml
              - --kubeconfig=/etc/kubeconfig
  ```

- karmada aggregated apiserver

  挂载的secret: karmada-cert-secret 和 kubeconfig

  证书的使用场景：

  ```yaml
              - --kubeconfig=/etc/kubeconfig
              - --authentication-kubeconfig=/etc/kubeconfig
              - --authorization-kubeconfig=/etc/kubeconfig
              - --etcd-cafile=/etc/karmada/pki/etcd-ca.crt
              - --etcd-certfile=/etc/karmada/pki/etcd-client.crt
              - --etcd-keyfile=/etc/karmada/pki/etcd-client.key
              - --tls-cert-file=/etc/karmada/pki/karmada.crt
              - --tls-private-key-file=/etc/karmada/pki/karmada.key
  ```

- karmada-scheduler-estimator

  挂载的secret: karmada-cert-secret

  证书的使用场景：

  ```yaml
              - --grpc-auth-cert-file=/etc/karmada/pki/karmada.crt
              - --grpc-auth-key-file=/etc/karmada/pki/karmada.key
              - --grpc-client-ca-file=/etc/karmada/pki/ca.crt
  ```

- karmada-scheduler

  挂载的secret: karmada-cert-secret 和 kubeconfig

  证书的使用场景：

  ```yaml
              - --kubeconfig=/etc/kubeconfig
              - --scheduler-estimator-ca-file=/etc/karmada/pki/ca.crt
              - --scheduler-estimator-cert-file=/etc/karmada/pki/karmada.crt
              - --scheduler-estimator-key-file=/etc/karmada/pki/karmada.key
  ```

- karmada-descheduler
  挂载的secret: karmada-cert-secret 和 kubeconfig

  证书的使用场景：

  ```yaml
              - --kubeconfig=/etc/kubeconfig
              - --scheduler-estimator-ca-file=/etc/karmada/pki/ca.crt
              - --scheduler-estimator-cert-file=/etc/karmada/pki/karmada.crt
              - --scheduler-estimator-key-file=/etc/karmada/pki/karmada.key
  ```

- karmada-metrics-adapter

  挂载的secret：karmada-cert-secret 和 kubeconfig

  证书的使用场景：

  ```yaml
              - --kubeconfig=/etc/kubeconfig
              - --authentication-kubeconfig=/etc/kubeconfig
              - --authorization-kubeconfig=/etc/kubeconfig
              - --client-ca-file=/etc/karmada/pki/ca.crt
              - --tls-cert-file=/etc/karmada/pki/karmada.crt
              - --tls-private-key-file=/etc/karmada/pki/karmada.key
  ```

- karmada-search

  挂载的secret：karmada-cert-secret 和 kubeconfig

  证书的使用场景：

  ```yaml
              - --kubeconfig=/etc/kubeconfig
              - --authentication-kubeconfig=/etc/kubeconfig
              - --authorization-kubeconfig=/etc/kubeconfig
              - --etcd-cafile=/etc/karmada/pki/etcd-ca.crt
              - --etcd-certfile=/etc/karmada/pki/etcd-client.crt
              - --etcd-keyfile=/etc/karmada/pki/etcd-client.key
              - --tls-cert-file=/etc/karmada/pki/karmada.crt
              - --tls-private-key-file=/etc/karmada/pki/karmada.key
  ```

- karmada-webhook

  挂载的secret：webhook-cert 和 kubeconfig

  证书的使用场景：

  ```yaml
              - --kubeconfig=/etc/kubeconfig
              - --cert-dir=/var/serving-cert
  ```

#### 查看证书有效期

通过命令`openssl x509 -noout -dates -in path/to/cert`可以解析出证书的before和after dates.

```bash
$ openssl x509 -noout -dates -in path/to/cert
notBefore=Aug 24 16:00:00 2024 GMT
notAfter=Aug 29 16:00:00 2024 GMT
```

以上输出结果表明，此证书在2024年8月24号16点生效，到2024年8月29号16点失效。


### 业务证书的更换

当业务证书过期或即将过期时，可以手动替换新证书来获得更久的使用期限。

#### 生成新的证书

1. 确定过期证书的签发CA

   [Karmada 证书简介](#Karmada 证书简介)介绍了业务证书和CA的对应关系，据此可以确定过期证书的签发CA

2. 获取过期证书的CN等信息

   业务证书的CN、host等信息可能会与环境有关，比如apiserver证书的hosts值。因此为了保证证书替换前后的功能完全一致，建议直接查看已过期的业务证书来获取证书的CN等信息。

   ```shell
   $ openssl x509 -noout -text -in path/to/cert
   Certificate:
       Data:
           ... ...
           Subject: O = system:masters, CN = system:admin
   		... ...
               X509v3 Subject Alternative Name:
                   DNS:kubernetes.default.svc, DNS:*.etcd.karmada-system.svc.cluster.local, DNS:*.karmada-system.svc.cluster.local, DNS:*.karmada-system.svc, DNS:localhost, IP Address:127.0.0.1
   ... ...
   ```

   过期证书的CN=system:admin, O = system:masters, hosts=kubernetes.default.svc "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1"

3. 利用CA和证书信息签发新的证书

   ```bash
   #!/usr/bin/env bash
   # signCert.sh
   dest_dir=$1
   ca=$2
   ca_dir=$3
   cert_name=$4
   cn=${5:-$4}
   og=$6
   hosts=""
   SEP=""
   shift 6
   while [[ -n "${1:-}" ]]; do
       hosts+="${SEP}\"$1\""
       SEP=","
       shift 1
   done
   ${sudo} /usr/bin/env bash -e <<EOF
   echo '{"CN":"${cn}","hosts":[${hosts}],"names":[{"O":"${og}"}],"key":{"algo":"rsa","size":3072}}' | cfssl gencert -ca="${ca_dir}/${ca}.crt" -ca-key="${ca_dir}/${ca}.key" -config="${ca_dir}/${ca}-config.json" - | cfssljson -bare ${cert_name}
   mv "${cert_name}-key.pem" "${cert_name}.key"
   mv "${cert_name}.pem" "${cert_name}.crt"
   rm -f "${cert_name}.csr"
   EOF
   ```

   signCert.sh的输入参数及含义如下：

   - dest_dir: 新证书的目录，建议与原业务证书的目录不一致，避免覆盖
   - ca: CA证书名
   - ca_dir： CA证书目录
   - cn: 业务证书的CN
   - og: 业务证书的 organization
   - hosts： 业务证书的Hosts

示例： karmada证书过期，其CA为ca，CN=system:admin, O = system:masters, hosts=kubernetes.default.svc "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1"

那么通过执行`./signCert.sh . "ca" "${HOME}/.karmada" "karmada" "system:admin" "system:masters" kubernetes.default.svc "*.etcd.karmada-system.svc.cluster.local" "*.karmada-system.svc.cluster.local" "*.karmada-system.svc" "localhost" "127.0.0.1"`即可在当前目录生成新的karmada证书。

#### 证书替换

由于karmada 组件通过挂载secret来获取证书，当secret更新时，会自动同步到组件的挂载路径，因此只需要组件重启，便可加载到新证书。推荐先更新服务端证书。这是因为服务端证书的更新可能会影响到所有依赖于该服务的客户端，而客户端证书的更新则更为分散，影响范围较小。

1. 更新secret

   以karmada证书为例

   base64编码新证书

   ```shell
   KARMADACRT=$(cat karmada.crt|base64 -w 0)
   KARMADAKEY=$(cat karmada.key|base64 -w 0)
   ```

   通过kubectl更新证书相关联的secret

   ```shell
   # update secret karmada-cert-secret
   kubectl --kubeconfig $HOME/.kube/karmada.config --context karmada-host patch secret karmada-cert-secret -nkarmada-system --type='json' -p='[{"op": "replace", "path": "/data/karmada.crt", "value":'"${KARMADACRT}"'},{"op": "replace", "path": "/data/karmada.key", "value":'"${KARMADAKEY}"'}]'
   # update secret webhook-cert
   kubectl --kubeconfig $HOME/.kube/karmada.config --context karmada-host patch secret webhook-cert -nkarmada-system --type='json' -p='[{"op": "replace", "path": "/data/tls.crt", "value":'"${KARMADACRT}"'},{"op": "replace", "path": "/data/tls.key", "value":'"${KARMADAKEY}"'}]'
   # update secret kubeconfig
   kubectl --kubeconfig $HOME/.kube/karmada.config --context karmada-host edit secret webhook-cert -nkarmada-system -oyaml
   ```

   需要注意的是，kubeconfig file的karmada-apiserver config的client-certificate-data和client-key-data的值也需要替换为新的karmada.crt和karmada.key

2. 各组件重新加载证书

   通过step1将新的证书都同步更新到secret，为了各组件能加载新证书，需要重启各组件。

   首先需要确定证书更新的影响范围，也即需要重启的组件。

   按批次按需重启karmada组件。

   依据组件间的依赖关系，推荐的重启次序如下：

   etcd作为karmada-apiserver的服务端，优先重启etcd

   karmada-apiserver作为其他karmada组件的服务端，在etcd加载新证书后重启

   其次是组件karmada-aggregated-apiserver，在karmada-apiserver加载新证书后重启

   剩余的组件可以同一批次重启

到此，便完成了过期证书的更新。
