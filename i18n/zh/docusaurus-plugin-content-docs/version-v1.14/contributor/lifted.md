---
title: 如何管理 Lift 代码
---

本文讲解如何管理 Lift 代码。
此任务的常见用户场景是开发者将代码从其他代码仓库 Lift 到 `pkg/util/lifted` 目录。

- [Lift 代码的步骤](#lift-代码的步骤)
- [如何编写 Lift 注释](#如何编写-lift-注释)
- [示例](#示例)

## Lift 代码的步骤
- 从另一个代码仓库拷贝代码并将其保存到 `pkg/util/lifted` 的一个 Go 文件中。
- 可选择更改 Lift 代码。
- [参照指南](#如何编写-lift-注释)为代码添加 Lift 注释。
- 运行 `hack/update-lifted.sh` 以更新 Lift 文档 `pkg/util/lifted/doc.go`。

## 如何编写 Lift 注释
Lift 注释应放在 Lift 代码（可以是函数、类型、变量或常量）前面。
在 Lift 注释和 Lift 代码之间只允许空行和注释。

Lift 注释由一行或多行注释组成，每行的格式为 `+lifted:KEY[=VALUE]`。
对某些键而言，值是可选的。

有效的键如下：

- source:

  `source` 键是必需的。其值表明 Lift 代码的来源。

- changed:

  `changed` 键是可选的。它表明代码是否被更改。
  值是可选的（`true` 或 `false`，默认为 `true`）。
  不添加此键或将其设为 `false` 意味着不变更代码。

## 示例
### Lift 函数

将 `IsQuotaHugePageResourceName` 函数 Lift 到 `corehelpers.go`：

```go
// +lifted:source=https://github.com/kubernetes/kubernetes/blob/release-1.23/pkg/apis/core/helper/helpers.go#L57-L61

// IsQuotaHugePageResourceName returns true if the resource name has the quota
// related huge page resource prefix.
func IsQuotaHugePageResourceName(name corev1.ResourceName) bool {
	return strings.HasPrefix(string(name), corev1.ResourceHugePagesPrefix) || strings.HasPrefix(string(name), corev1.ResourceRequestsHugePagesPrefix)
}
```

添加到 `doc.go` 中：

```markdown
| Lift 的文件              | 源文件                                                                                                                   | 常量/变量/类型/函数                     | 是否变更 |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|---------|
| corehelpers.go           | https://github.com/kubernetes/kubernetes/blob/release-1.23/pkg/apis/core/helper/helpers.go#L57-L61                            | func IsQuotaHugePageResourceName        | N       |
```

### 变更 Lift 函数

将 `GetNewReplicaSet` 函数 Lift 并变更为 `deployment.go`：

```go
// +lifted:source=https://github.com/kubernetes/kubernetes/blob/release-1.22/pkg/controller/deployment/util/deployment_util.go#L536-L544
// +lifted:changed

// GetNewReplicaSet returns a replica set that matches the intent of the given deployment; get ReplicaSetList from client interface.
// Returns nil if the new replica set doesn't exist yet.
func GetNewReplicaSet(deployment *appsv1.Deployment, f ReplicaSetListFunc) (*appsv1.ReplicaSet, error) {
	rsList, err := ListReplicaSetsByDeployment(deployment, f)
	if err != nil {
		return nil, err
	}
	return FindNewReplicaSet(deployment, rsList), nil
}
```

添加到 `doc.go` 中：

```markdown
| Lift 的文件              | 源文件                                                                                                                   | 常量/变量/类型/函数                     | 是否变更 |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|---------|
| deployment.go            | https://github.com/kubernetes/kubernetes/blob/release-1.22/pkg/controller/deployment/util/deployment_util.go#L536-L544        | func GetNewReplicaSet                   | Y       |
```

### Lift 常量

将 `isNegativeErrorMsg` 常量 Lift 到 `corevalidation.go`：

```go
// +lifted:source=https://github.com/kubernetes/kubernetes/blob/release-1.22/pkg/apis/core/validation/validation.go#L59
const isNegativeErrorMsg string = apimachineryvalidation.IsNegativeErrorMsg
```

添加到 `doc.go` 中：

```markdown
| Lift 的文件             | 源文件                                                                                                                  | 常量/变量/类型/函数                    | 是否变更 |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|---------|
| corevalidation.go        | https://github.com/kubernetes/kubernetes/blob/release-1.22/pkg/apis/core/validation/validation.go#L59                         | const isNegativeErrorMsg                | N       |
```

### Lift 类型

将 `Visitor` 类型 Lift 到 `visitpod.go`：

```go
// +lifted:source=https://github.com/kubernetes/kubernetes/blob/release-1.23/pkg/api/v1/pod/util.go#L82-L83

// Visitor 随每个对象名称被调用，如果应继续 visiting，则返回 true
type Visitor func(name string) (shouldContinue bool)
```

添加到 `doc.go` 中：

```markdown
| Lift 的文件             | 源文件                                                                                                                  | 常量/变量/类型/函数                    | 是否变更 |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|---------|
| visitpod.go              | https://github.com/kubernetes/kubernetes/blob/release-1.23/pkg/api/v1/pod/util.go#L82-L83                                     | type Visitor                            | N       |
```
