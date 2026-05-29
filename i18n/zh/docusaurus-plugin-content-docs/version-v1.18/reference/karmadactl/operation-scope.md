---
title: 集群视角切换

---

# Karmadactl 集群视角切换

Karmadactl 引入了 `operation-scope` 参数来指定命令的集群操作范围。`operation-scope` 参数的取值为枚举类型，每个枚举值及其含义如下：

- karmada: karmadactl 命令的操作范围是 Karmada 控制面。
- members: karmadactl 命令的操作范围是成员集群。
- all: karmadactl 命令的操作范围包括 Karmada 控制面和成员集群。

> *请注意，不同命令所支持的枚举值是不同的，详情请参考karmadactl [command] --help。*

`operation-scope`的引入为 Karmadactl 集群视角的切换提供了一种灵活的方式。与Kubectl相比，Karmadactl无需切换上下文即可管理不同的目标集群。此外，借助Karmada的多集群资源视图，
Karmadactl 能够同时访问多个目标集群的资源信息，这极大地简化了多集群场景下的日常运维工作。

![command-context](../../resources/reference/karmadactl/command-context.png)

## 如何使用参数 operation-scope

本节阐述了`operation-scope` 参数在各种 Karmadactl 命令中的应用，并以`karmadactl get`为例，展示了如何通过切换集群视角来查看资源在不同集群间的分布情况。

### get

命令`karmadactl get`可用于查看控制面或成员集群的资源。结合参数 `operation-scope` 与 `clusters`，`karmadactl get`能够展示一个或多个集群的资源信息。

- `operation-scope`：支持枚举值`karmada`、`members`和`all`，默认为`karmada`。
- `clusters`：用于指定目标成员集群，仅在命令的操作范围为`members`或`all`时生效。

![operation-scope](../../resources/reference/karmadactl/operation-scope.png)

假设 Karmada 控制面管理着三个成员集群：`member1`、`member2` 和 `member3`，并且 Karmada 控制面的 Deployment 资源 `nginx` 已分发至这三个成员集群。那么，我们可以进行如下操作：

- 查看 Karmada 控制面和所有成员集群资源的分布情况

  ```bash
  $ karmadactl get deployment nginx --operation-scope all      
  NAME    CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
  nginx   Karmada   0/2     6            0           18h   -
  nginx   member1   0/2     2            0           37s   Y
  nginx   member2   0/2     2            0           36s   Y
  nginx   member3   0/2     2            0           37s   Y
  ```

  > *CLUSTER 列表示资源所在的集群，而 ADOPTION 列则表示该资源是否已被 Karmada 控制面接管。*

- 查看 Karmada 控制面和部分成员集群资源的分布情况

  ```bash
  $ karmadactl get deployment nginx --operation-scope all --clusters member1,member2
  NAME    CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE     ADOPTION
  nginx   Karmada   4/2     6            4           18h     -
  nginx   member1   2/2     2            2           2m37s   Y
  nginx   member2   0/2     2            0           2m36s   Y
  ```

  当设置 `--clusters` 为 `member1,member2` 时，成员集群的视角将被限制为 `member1` 和 `member2`。

- 查看 Karmada 控制面资源的分布情况

  ```bash
  $ karmadactl get deployment nginx 
  NAME    CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
  nginx   Karmada   6/2     6            6           18h   -
  $ karmadactl get deployment nginx --operation-scope karmada 
  NAME    CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE   ADOPTION
  nginx   Karmada   6/2     6            6           18h   -
  ```

- 查看所有成员集群资源的分布情况

  ```bash
  $ karmadactl get deployment nginx --operation-scope members
  NAME    CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE     ADOPTION
  nginx   member2   2/2     2            2           8m10s   Y
  nginx   member1   2/2     2            2           8m11s   Y
  nginx   member3   2/2     2            2           8m10s   Y
  ```

- 查看部分成员集群资源的分布情况

  ```bash
  $ karmadactl get deployment nginx --operation-scope members --clusters member1,member2
  NAME    CLUSTER   READY   UP-TO-DATE   AVAILABLE   AGE    ADOPTION
  nginx   member1   2/2     2            2           9m7s   Y
  nginx   member2   2/2     2            2           9m6s   Y
  ```

### describes

结合参数 `operation-scope` 和 `cluster`，`karmadactl describe` 命令可用于显示 Karmada 控制面或成员集群中资源的详细信息。

- `operation-scope`：支持枚举值`karmada`和`members`，默认为`karmada`。
- `cluster`：用于指定目标成员集群，仅在命令的操作范围为`members`时生效。

### attach

结合参数 `operation-scope` 和 `cluster`，`karmadactl attach` 命令可以连接到 Karmada 控制面或成员集群中正在运行的容器。

- `operation-scope`：支持枚举值`karmada`和`members`，默认为`karmada`。
- `cluster`：用于指定目标成员集群，仅在命令的操作范围为`members`时生效。

### explain

结合参数 `operation-scope` 和 `cluster`，`karmadactl explain` 命令可以获取 Karmada 控制面或成员集群中 API 对象字段的描述。这对于查看通过 `OverridePolicy` 进行成员集群差异化配置后的资源尤为方便。

- `operation-scope`：支持枚举值`karmada`和`members`，默认为`karmada`。
- `cluster`：用于指定目标成员集群，仅在命令的操作范围为`members`时生效。

### exec

结合参数 `operation-scope` 和 `cluster`，`karmadactl exec` 命令可以在 Karmada 控制面或成员集群的容器中执行命令。

- `operation-scope`：支持枚举值`karmada`和`members`，默认为`karmada`。
- `cluster`：用于指定目标成员集群，仅在命令的操作范围为`members`时生效。

### api-resources

结合参数 `operation-scope` 和 `cluster`，`karmadactl api-resources` 命令可以输出 Karmada 控制面或成员集群支持的 API 资源。

- `operation-scope`：支持枚举值`karmada`和`members`，默认为`karmada`。
- `cluster`：用于指定目标成员集群，仅在命令的操作范围为`members`时生效。

### api-versions

结合参数 `operation-scope` 和 `cluster`，`karmadactl api-versions` 命令可以输出 Karmada 控制面或成员集群支持的 API 版本。

- `operation-scope`：支持枚举值`karmada`和`members`，默认为`karmada`。
- `cluster`：用于指定目标成员集群，仅在命令的操作范围为`members`时生效。
