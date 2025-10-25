---
title: 整合 Velero 来备份和恢复 Karmada 资源
---

[Velero](https://github.com/vmware-tanzu/velero) 为你提供了备份和恢复 Kubernetes 集群资源和持久化卷的工具。
你可以在公共云平台运行 Velero，也可以在私有云上运行 Velero。

Velero 让你：

- 对你的集群进行备份，并在丢失的情况下进行恢复。
- 将集群资源迁移到其他集群。
- 在开发和测试集群制作生产集群的副本。

本文举例说明如何使用 Velero 来备份和恢复 Kubernetes 集群资源和持久化卷。
下面的例子备份了集群 `member1` 中的资源，然后将这些资源恢复到集群 `member2` 中。

## 启动 Karmada 集群

你只需要克隆 Karmada repo，并在 Karmada 目录下运行以下脚本。

```shell
hack/local-up-karmada.sh
```

然后运行下面的命令，切换到成员集群 `member1`。

```shell
export KUBECONFIG=/root/.kube/members.config
kubectl config use-context member1
```

## 安装 MinIO

Velero 使用来自不同云提供商的对象存储服务来支持备份和快照操作。
为了简单起见，这里以在 k8s 集群上本地运行的一个对象存储为例。

从官方网站下载二进制文件。

```shell
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
```

运行下面的命令来设置 `MinIO' 的用户名和密码。

```shell
export MINIO_ROOT_USER=minio
export MINIO_ROOT_PASSWORD=minio123
```

运行此命令启动 `MinIO`:

```shell
./minio server /data --console-address="0.0.0.0:20001" --address="0.0.0.0:9000"
```

用你希望 "MinIO" 存储数据的驱动器或目录的路径替换 `/data` 现在我们可以访问 `http://{SERVER_EXTERNAL_IP}/20001` 在浏览器中访问 `MinIO` 控制台用户界面。
而 `Velero` 可以使用 `http://{SERVER_EXTERNAL_IP}/9000` 来连接 `MinIO`。
这两个配置将使我们的后续工作更容易和更方便。

请访问 `MinIO` 控制台，创建区域 `minio` 和桶 `velero`，这些将由 `Velero` 使用。

关于如何安装 `MinIO` 的更多细节，请运行 `minio server --help` 获得帮助，或者你可以访问 [MinIO Github Repo](https://github.com/minio/minio)。

## 安装 Velero

Velero 由两个部分组成。

- ### 一个在本地运行的命令行客户端

  1. 为你的客户端平台下载 [release](https://github.com/vmware-tanzu/velero/releases)tarball。

  ```shell
  wget https://github.com/vmware-tanzu/velero/releases/download/v1.7.0/velero-v1.7.0-linux-amd64.tar.gz
  ```
  
  2. 提取 tarball:

  ```shell
  tar -zxvf velero-v1.7.0-linux-amd64.tar.gz
  ```
  
  3. 将解压后的 velero 二进制文件移到 $PATH 中的某处（对大多数用户来说是 /usr/local/bin）。

  ```shell
  cp velero-v1.7.0-linux-amd64/velero /usr/local/bin/
  ```

- ### 一个在你的集群上运行的服务器

  我们将使用 `velero install` 来设置服务器组件。

  关于如何使用 `MinIO` 和 `Velero` 来备份资源的更多细节，请参考：[https://velero.io/docs/v1.7/contributions/minio/](https://velero.io/docs/v1.7/contributions/minio/)

  1. 在你的本地目录中创建一个 Velero 专用的证书文件（credentials-velero）:

   ```shell
   [default]
   aws_access_key_id = minio
   aws_secret_access_key = minio123
   ```

  这两个值应该与我们在安装 "MinIO " 时设置的 "MinIO " 用户名和密码保持一致。
  
   2. 启动服务器。

  我们需要在 "member1 " 和 "member2 " 中安装 "Velero"，所以我们应该在 shell 中为这两个集群运行以下命令。
  这将启动 Velero 服务器。请运行 `kubectl config use-context member1` 和 `kubectl config use-context member2` 来切换到不同的成员集群。
  来切换到不同的成员集群 `member1` 或 `member2`。

   ```shell
   velero install \
   --provider aws \
   --plugins velero/velero-plugin-for-aws:v1.2.1 \
   --bucket velero \
   --secret-file ./credentials-velero \
   --use-volume-snapshots=false \
   --backup-location-config region=minio,s3ForcePathStyle="true",s3Url=http://{SERVER_EXTERNAL_IP}:9000
   ```

  用你自己的服务器外部 IP 替换 `{SERVER_EXTERNAL_IP}`。

   3. 将 nginx 应用程序部署到集群 `member1':

  在 Karmada 目录下运行以下命令。
  
   ```shell
   kubectl apply -f samples/nginx/deployment.yaml
   ```
  
   然后你将发现 nginx 应用部署成功。

   ```shell
   $ kubectl get deployment.apps
   NAME    READY   UP-TO-DATE   AVAILABLE   AGE
   nginx   2/2     2            2           17s
   ```

### 独立备份和恢复 kubernetes 资源

在 `member1` 创建一个备份：

```shell
velero backup create nginx-backup --selector app=nginx
```

恢复 `member2` 中的备份

运行此命令切换到 `member2'

```shell
export KUBECONFIG=/root/.kube/members.config
kubectl config use-context member2
```

在 `member2` 中，我们也可以得到我们在 `member1` 中创建的备份：

```shell
$ velero restore get
NAME           STATUS      ERRORS   WARNINGS   CREATED                         EXPIRES   STORAGE LOCATION   SELECTOR
nginx-backup   Completed   0        0          2021-12-10 15:16:46 +0800 CST   29d       default            app=nginx
```

将 `member1` 的资源恢复到 `member2`：

```shell
$ velero restore create --from-backup nginx-backup
Restore request "nginx-backup-20211210151807" submitted successfully.
```

然后你就可以发现部署 nginx 将被成功恢复。

```shell
$ velero restore get
NAME                          BACKUP         STATUS      STARTED                         COMPLETED                       ERRORS   WARNINGS   CREATED                         SELECTOR
nginx-backup-20211210151807   nginx-backup   Completed   2021-12-10 15:18:07 +0800 CST   2021-12-10 15:18:07 +0800 CST   0        0          2021-12-10 15:18:07 +0800 CST   <none>
```

然后你就可以发现部署 nginx 会被成功恢复。

```shell
$ kubectl get deployment.apps/nginx
NAME    READY   UP-TO-DATE   AVAILABLE   AGE
nginx   2/2     2            2           21s
```

### 通过 Velero 与 karmada 相结合备份和恢复 kubernetes 资源

在 Karmada 控制平面中，我们需要安装 velero crds，但不需要控制器来协调它们。它们被视为资源模板，而不是具体的资源实例。基于这里的工作 API，它们将被封装为一个工作对象交付给成员集群，最后由成员集群中的 velero 控制器进行调节。

在 Karmada 控制平面中创建 velero crds。
远程 velero crd 目录：`https://github.com/vmware-tanzu/helm-charts/tree/main/charts/velero/crds/`。

在 `karmada-apiserver` 中创建一个备份，并通过 PropagationPolicy 分发到 `member1` 集群。

```shell
# 创建备份策略
cat <<EOF | kubectl apply -f -
apiVersion: velero.io/v1
kind: Backup
metadata:
  name:  member1-default-backup
  namespace: velero
spec:
  defaultVolumesToRestic: false
  includedNamespaces:
  - default
  storageLocation: default
EOF

# 创建 PropagationPolicy
cat <<EOF | kubectl apply -f -
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: member1-backup
  namespace: velero
spec:
  resourceSelectors:
    - apiVersion: velero.io/v1
      kind: Backup
  placement:
    clusterAffinity:
      clusterNames:
        - member1
EOF
```

在 "karmada-apiserver " 中创建一个恢复，并通过分发策略分发到 "member2 " 集群中。

```shell
# 创建恢复策略
cat <<EOF | kubectl apply -f -
apiVersion: velero.io/v1
kind: Restore
metadata:
  name: member1-default-restore
  namespace: velero
spec:
  backupName: member1-default-backup
  excludedResources:
  - nodes
  - events
  - events.events.k8s.io
  - backups.velero.io
  - restores.velero.io
  - resticrepositories.velero.io
  hooks: {}
  includedNamespaces:
  - 'default'
EOF

# 创建 PropagationPolicy
cat <<EOF | kubectl apply -f -
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: member2-default-restore-policy
  namespace: velero
spec:
  resourceSelectors:
    - apiVersion: velero.io/v1
      kind: Restore
  placement:
    clusterAffinity:
      clusterNames:
        - member2
EOF

```

然后你可以发现部署的 nginx 将被成功恢复到 member2 上。

```shell
$ kubectl get deployment.apps/nginx
NAME    READY   UP-TO-DATE   AVAILABLE   AGE
nginx   2/2     2            2           10s
```

## 参考资料

以上关于 "Velero " 和 "MinIO " 的介绍只是来自官方网站和仓库的摘要，更多细节请参考：

- Velero: [https://velero.io/](https://velero.io/)
- MinIO: [https://min.io/](https://min.io/)
