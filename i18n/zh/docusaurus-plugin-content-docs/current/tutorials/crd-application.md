---
title: 通过 Karmada 分发 CRD
---
在本节中，我们将引导您完成以下内容：

- 安装 Karmada 控制平面。
- 将 CRD 分发到多个集群。
- 在特定集群中自定义 CRD。

## 启动 Karmada 集群

想要启动 Karmada，您可以参考 [here](../installation/installation.md).

如果您只想尝试 Karmada，请使用 ```hack/local-up-karmada.sh``` 构建开发环境.

```sh
git clone https://github.com/karmada-io/karmada
cd karmada
hack/local-up-karmada.sh
```

## 分发 CRD

下面的步骤指导您如何分发 CRD [Guestbook](https://book.kubebuilder.io/quick-start.html#create-a-project)。

假设您在 Karmada 仓库的 guestbook 目录下。

```bash
cd samples/guestbook
```

使用 Karmada 配置设置 KUBECONFIG 环境变量。

```bash
export KUBECONFIG=${HOME}/.kube/karmada.config
```

1. 在 Karmada 的控制平面上创建 Guestbook CRD

```bash
kubectl apply -f guestbooks-crd.yaml 
```

此 CRD 应该被应用到 `karmada-apiserver`。

2. 创建 ClusterPropagationPolicy，将 Guestbook CRD 分发到 member1

```bash
kubectl apply -f guestbooks-clusterpropagationpolicy.yaml
```

```yaml
# guestbooks-clusterpropagationpolicy.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: ClusterPropagationPolicy
metadata:
  name: example-policy
spec:
  resourceSelectors:
    - apiVersion: apiextensions.k8s.io/v1
      kind: CustomResourceDefinition
      name: guestbooks.webapp.my.domain
  placement:
    clusterAffinity:
      clusterNames:
        - member1
```

根据 ClusterPropagationPolicy 中定义的规则，此 CRD 将分发到成员集群。

> 注意：在这里我们只能使用 ClusterPropagationPolicy 而不是 PropagationPolicy。
> 更多详细信息，请参考 FAQ [PropagationPolicy and ClusterPropagationPolicy](https://github.com/karmada-io/karmada/blob/master/docs/frequently-asked-questions.md#what-is-the-difference-between-propagationpolicy-and-clusterpropagationpolicy)

3. 在 Karmada 控制平面上创建名为 `guestbook-sample` 的 Guestbook CR

```bash
kubectl apply -f guestbook.yaml
```

4. 创建 PropagationPolicy，将 `guestbook-sample` 分发到 member1

```bash
kubectl apply -f guestbooks-propagationpolicy.yaml
```

```yaml
# guestbooks-propagationpolicy.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: example-policy
spec:
  resourceSelectors:
    - apiVersion: webapp.my.domain/v1
      kind: Guestbook
  placement:
    clusterAffinity:
      clusterNames:
        - member1
```

5. 检查 Karmada 中 `guestbook-sample` 的状态

```bash
kubectl get guestbook -oyaml
```

输出类似于以下内容：

```yaml
apiVersion: webapp.my.domain/v1
kind: Guestbook
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"webapp.my.domain/v1","kind":"Guestbook","metadata":{"annotations":{},"name":"guestbook-sample","namespace":"default"},"spec":{"alias":"Name","configMapName":"test","size":2}}
  creationTimestamp: "2022-11-18T06:56:24Z"
  generation: 1
  labels:
    propagationpolicy.karmada.io/name: example-policy
    propagationpolicy.karmada.io/namespace: default
  name: guestbook-sample
  namespace: default
  resourceVersion: "682895"
  uid: 2f8eda5f-35ab-4ac3-bcd4-affcf36a9341
spec:
  alias: Name
  configMapName: test
  size: 2
```

## 自定义 CRD

1. 创建 OverridePolicy，将覆盖 member1 中 guestbook-sample 的 size 字段。

```bash
kubectl apply -f guestbooks-overridepolicy.yaml
```

```yaml
# guestbooks-overridepolicy.yaml
apiVersion: policy.karmada.io/v1alpha1
kind: OverridePolicy
metadata:
  name: guestbook-sample
spec: 
  resourceSelectors: 
  - apiVersion: webapp.my.domain/v1 
    kind: Guestbook
  overrideRules: 
  - targetCluster: 
      clusterNames:
      - member1
    overriders:
      plaintext:
      - path: /spec/size
        operator: replace
        value: 4
      - path: /metadata/annotations
        operator: add
        value: {"OverridePolicy":"test"}
```

2. 检查来自成员集群的 `guestbook-sample` 的 size 字段

```bash
kubectl --kubeconfig=${HOME}/.kube/members.config config use-context member1
kubectl --kubeconfig=${HOME}/.kube/members.config get guestbooks -o yaml
```

如果按预期工作，则 `.spec.size` 将被覆盖为 `4`:

```yaml
apiVersion: webapp.my.domain/v1
kind: Guestbook
metadata:
  annotations:
    OverridePolicy: test
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"webapp.my.domain/v1","kind":"Guestbook","metadata":{"annotations":{},"name":"guestbook-sample","namespace":"default"},"spec":{"alias":"Name","configMapName":"test","size":2}}
    resourcebinding.karmada.io/name: guestbook-sample-guestbook
    resourcebinding.karmada.io/namespace: default
    resourcetemplate.karmada.io/uid: 2f8eda5f-35ab-4ac3-bcd4-affcf36a9341
  creationTimestamp: "2022-11-18T06:56:37Z"
  generation: 2
  labels:
    propagationpolicy.karmada.io/name: example-policy
    propagationpolicy.karmada.io/namespace: default
    resourcebinding.karmada.io/key: 6849fdbd59
    work.karmada.io/name: guestbook-sample-6849fdbd59
    work.karmada.io/namespace: karmada-es-member1
  name: guestbook-sample
  namespace: default
  resourceVersion: "430024"
  uid: 8818e33d-10bf-4270-b3b9-585977425bc9
spec:
  alias: Name
  configMapName: test
  size: 4
```
