---
title: 代码风格指南
---

Karmada 主要使用 Go 语言开发，遵循 Go 社区通用代码风格，并通过 [golangci-lint](https://github.com/karmada-io/karmada/blob/e2c4b596a5da442fc0dbeab9f9063d8db8669208/.github/workflows/ci.yml#L18-L35)
工具进行自动化检查。然而，不同开发者编写的代码的风格可能最终大相径庭。我们旨在补充若干代码规范，以统一 Karmada 代码的风格，从而帮助提高整体可读性。

遵循本指南有助于新贡献者快速融入项目，减少 PR 的反复修改，并缩短维护者的审核周期，从而加速合入流程。

> 注意：本指南并非 Go 语言官方风格指南的替代品，而是对其的补充。所有不在本指南中提及的内容均应遵循 Go 语言官方风格指南和最佳实践。
> 此外，Karmada 代码库中现有的代码可能未完全符合本指南。我们鼓励在编写新代码或修改现有代码时遵循本指南，以逐步提升代码质量和一致性。

## 代码注释

- 所有导出的函数、方法、结构体和接口都必须有注释，注释应简洁明了地描述其功能和用途。

错误示例
```go
func GetAnnotationValue(annotations map[string]string, annotationKey string) string {
	if annotations == nil {
		return ""
	}
	return annotations[annotationKey]
}
```

正确示例
```go
// GetAnnotationValue retrieves the value via 'annotationKey' (if it exists), otherwise an empty string is returned.
func GetAnnotationValue(annotations map[string]string, annotationKey string) string {
	if annotations == nil {
		return ""
	}
	return annotations[annotationKey]
}
```

- 鼓励在代码内部添加注释，但应解释设计意图或复杂逻辑，而非解释显而易见的操作。

错误示例
```go
// continue if the cluster is deleting
if !c.Cluster().DeletionTimestamp.IsZero() {
	klog.V(4).Infof("Cluster %q is deleting, skip it", c.Cluster().Name)
	continue
```

正确示例
```go
// When cluster is deleting, we will clean up the scheduled results in the cluster.
// So we should not schedule resource to the deleting cluster.
if !c.Cluster().DeletionTimestamp.IsZero() {
	klog.V(4).Infof("Cluster %q is deleting, skip it", c.Cluster().Name)
	continue
```

## 接口合规性

- 所有显式实现接口的结构体，必须在代码中添加编译时接口合规性检查，以确保完整实现接口契约。

使用以下模式：
```go
var _ InterfaceName = &StructName{}
```
此断言应置于结构体定义所在的文件中（通常靠近类型声明或文件顶部），确保：

1.若结构体未完整实现接口，编译阶段即报错；

2.显式表达该结构体的接口契约，提升代码可读性与可维护性。

正确示例
```go
// Check if our workloadInterpreter implements necessary interface
var _ interpreter.Handler = &workloadInterpreter{}

// workloadInterpreter explores resource with request operation.
type workloadInterpreter struct {
	decoder *interpreter.Decoder
}
```

## 函数定义

- 函数参数过多时，建议使用结构体封装参数，以提高代码可读性和可维护性。

函数参数过多时，会破坏代码的可读性。通常，函数参数不应超过 5 个。如果超过此数量，请考虑重构函数或封装参数。

- 函数签名应优先写在单行，包括参数列表和返回值。

错误示例
```go 
func Foo(
	bar string, 
	baz int) error
```

正确示例
```go
func Foo(bar string, baz int) error
```

## 安全编码规范

- 禁止存在无法修改的认证凭据（如：进程二进制中硬编码口令）。
- 如果采用解释性语言（如 Shell/Python/Perl 脚本、JSP、HTML等）实现，对于需要清理的功能，必须彻底删除，严禁使用注释行等形式仅使功能失效。
- 禁止使用私有密码算法实现加解密，包括：

  - 未经过专业机构评估的、自行设计的密码算法；
  - 自行定义的通过变形/字符移位/替换等方式执行的数据转换算法；
  - 用编码的方式（如 Base64 编码）实现数据加密的目的的伪加密实现。 说明：在非加解密场景，出于正常业务目的使用 Base64 等编码方式或变形/移位/替换等算法不违反此条。

- 密码算法中使用到的随机数必须是密码学意义上的安全随机数。
- 禁止在系统中存储的日志、调试信息、错误提示中明文打印认证凭据（口令/私钥/预共享密钥）。

## CHANGELOG (release notes)

### 文件路径
`CHANGELOG` 文件位于 Karmada 仓库的 `docs/CHANGELOG` 目录下。

### 职责
用于记录每个版本的发布说明（release notes），包括新增功能、问题修复和其他重要变更。

### 格式规范

- 同版本的 release notes 按照类别组合。
- 每条 release note 可按是否涉及具体组件而分为两种格式：

```markdown
- `组件名`: 内容 ([#PR编号](PR链接), @PR作者)
- 内容 ([#PR编号](PR链接), @PR作者)
```

正确示例
```markdown
- `karmada-controller-manager`: Fixed the issue that a workload propagated with `duplicated mode` can bypass quota checks during scale up. ([#6474](https://github.com/karmada-io/karmada/pull/6474), @zhzhuang-zju)
```

- 组件名使用反引号标记，例如 `karmada-controller-manager`。
- 同一类别的 release notes 按照组件归类，提高可读性。

错误示例
```markdown
- `karmada-controller-manager`: Fixed the bug that XXXXX. ([#6446](https://github.com/karmada-io/karmada/pull/6446), @XiShanYongYe-Chang)
- `helm`:  Fixed the issue where `helm upgrade` failed to update Karmada's static resources properly. ([#6395](https://github.com/karmada-io/karmada/pull/6395), @deefreak)
- `karmada-controller-manager`: Fixed the issue that `taint-manager` didn't honour`--no-execute-taint-eviction-purge-mode` when evicting `ClusterResourceBinding`. ([#6491](https://github.com/karmada-io/karmada/pull/6491), @XiShanYongYe-Chang)
```

正确示例
```markdown
- `karmada-controller-manager`: Fixed the bug that cluster can not be unjoined in case of the `--enable-taint-manager=false` or the feature gate `Failover` is disabled. ([#6446](https://github.com/karmada-io/karmada/pull/6446), @XiShanYongYe-Chang)
- `karmada-controller-manager`: Fixed the issue that `taint-manager` didn't honour`--no-execute-taint-eviction-purge-mode` when evicting `ClusterResourceBinding`. ([#6491](https://github.com/karmada-io/karmada/pull/6491), @XiShanYongYe-Chang)
- `helm`:  Fixed the issue where `helm upgrade` failed to update Karmada's static resources properly. ([#6395](https://github.com/karmada-io/karmada/pull/6395), @deefreak)
```

- 注意时态使用
    
  - 废弃（Deprecation）类 release note 使用现在完成时态，表示某个功能已经被废弃。
  - 依赖（Dependencies）类 release note 可使用现在完成时态或过去时态，表示某个依赖已经被升级。比如 “has been upgraded to…” 或 “Upgraded to…”。
  - 其它类别统一使用一般过去时，表示某个功能已经被添加或修复。
  - 仅当描述“从当前版本起引入的新能力或行为变更”时，可使用 `now supports`、`no longer relies` 等一般现在时结构。

错误示例
```markdown
- `karmada-controller-manager`: Fix the bug that xxx. ([#PR编号](PR链接), @PR作者)
```

正确示例
```markdown
- `karmada-controller-manager`: Fixed the bug that xxx. ([#PR编号](PR链接), @PR作者)
```
