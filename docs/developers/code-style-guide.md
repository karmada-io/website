---
title: Karmada Code Style Guide
---

Karmada is primarily developed in Go and follows the standard Go community coding conventions. Automated style checks are 
enforced via [golangci-lint](https://github.com/karmada-io/karmada/blob/e2c4b596a5da442fc0dbeab9f9063d8db8669208/.github/workflows/ci.yml#L18-L35).
However, the resulting code can still look and feel very differently among different developers. To ensure consistency 
across the codebase, this guide defines additional rules beyond linter defaults.

Adhering to this guide helps new contributors onboard quickly, reduces PR review iterations, shortens maintainer review 
cycles, and ultimately speeds up merge velocity.

## Code Documentation and Commenting

- All exported functions, methods, structs, and interfaces **must** be documented with clear and concise comments describing their purpose and behavior.

WRONG
```go
func GetAnnotationValue(annotations map[string]string, annotationKey string) string {
	if annotations == nil {
		return ""
	}
	return annotations[annotationKey]
}
```

RIGHT
```go
// GetAnnotationValue retrieves the value via 'annotationKey' (if it exists), otherwise an empty string is returned.
func GetAnnotationValue(annotations map[string]string, annotationKey string) string {
	if annotations == nil {
		return ""
	}
	return annotations[annotationKey]
}
```

- Comments in the body of the code are highly encouraged, but they should explain the intention of the code as opposed to just calling out the obvious.

WRONG
```go
// continue if the cluster is deleting
if !c.Cluster().DeletionTimestamp.IsZero() {
	klog.V(4).Infof("Cluster %q is deleting, skip it", c.Cluster().Name)
	continue
```

RIGHT
```go
// When cluster is deleting, we will clean up the scheduled results in the cluster.
// So we should not schedule resource to the deleting cluster.
if !c.Cluster().DeletionTimestamp.IsZero() {
	klog.V(4).Infof("Cluster %q is deleting, skip it", c.Cluster().Name)
	continue
```

## Interface Compliance

- Any struct that explicitly implements an interface must include a compile-time interface compliance check using the following pattern:
```go
var _ InterfaceName = &StructName{}
```
This assertion should be placed in the same file as the struct definition (typically near the type declaration or at the top of the file) to ensure:
1. Compilation fails immediately if the struct does not fully implement the interface;
2. The interface contract is explicitly declared, improving readability and maintainability.

RIGHT
```go
// Check if our workloadInterpreter implements necessary interface
var _ interpreter.Handler = &workloadInterpreter{}

// workloadInterpreter explore resource with request operation.
type workloadInterpreter struct {
	decoder *interpreter.Decoder
}
```

## Function Definitions
- When a function has many parameters, consider encapsulating them into a struct to improve readability and maintainability.
- Function signatures should preferably be written on a single line, including the parameter list and return types.

WRONG
```go 
func Foo(
	bar string, 
	baz int) error
```

RIGHT
```go
func Foo(bar string, baz int) error
```

- If a function accepts a `context.Context` parameter, it must be the first argument.

## Secure Coding Specifications

- It is prohibited to have authentication credentials that cannot be modified (e.g., hard-coded passwords in process binaries).
- If implemented using interpreted languages (such as Shell/Python/Perl scripts, JSP, HTML, etc.), for functions that need to be cleaned up, they must be completely deleted. It is strictly prohibited to use forms such as comment lines to merely disable the functions.
- It is prohibited to use private cryptographic algorithms for encryption and decryption, including:
    - Cryptographic algorithms designed independently without being evaluated by professional institutions;
    - Self-defined data conversion algorithms executed through methods such as deformation/character shifting/replacement;
    - Pseudo-encryption implementations that use encoding methods (such as Base64 encoding) to achieve the purpose of data encryption.
      Note: In scenarios other than encryption and decryption, the use of encoding methods such as Base64 or algorithms such as deformation/shifting/replacement for legitimate business purposes does not violate this provision.
- The random numbers used in cryptographic algorithms must be secure random numbers in the cryptographic sense.
- It is prohibited to print authentication credentials (passwords/private keys/pre-shared keys) in plain text in system-stored logs, debugging information, and error prompts.

## Directory-Specific Style Guides

In addition to the general rules above, certain directories have specific style requirements due to their unique responsibilities. This section documents those directory-specific conventions.

### CHANGELOG

#### Location
The `CHANGELOG` files are located under `docs/CHANGELOG/` in the Karmada repository.

#### Responsibilities
Records release notes for each version, including new features, bug fixes, deprecations, and other significant changes.

#### Code Style
- Release notes for the same version should be grouped by category (e.g., Features, Bug Fixes, Deprecations).
- Each release note follows one of two formats, depending on whether it relates to a specific component:
```markdown
- `Component`: Description ([#pr_ID](pr_link), @author)
- Description ([#pr_ID](pr_link), @author)
```
> Note: If the author is `dependabot`, the `, @author` part should be omitted.

RIGHT
```markdown
- `karmada-controller-manager`: Fixed the issue that a workload propagated with `duplicated mode` can bypass quota checks during scale up. ([#6474](https://github.com/karmada-io/karmada/pull/6474), @zhzhuang-zju)
```

- Component names must be wrapped in backticks (e.g., `karmada-controller-manager`).
- Within each category, release notes should be grouped by component to improve readability.

WRONG
```markdown
- `karmada-controller-manager`: Fixed the issue that reporting repeat EndpointSlice resources leads to duplicate backend IPs. ([#6693](https://github.com/karmada-io/karmada/pull/6693), @XiShanYongYe-Chang)
- `karmada-interpreter-webhook-example`: Fixed write response error for broken HTTP connection issue. ([#6680](https://github.com/karmada-io/karmada/pull/6680), @tdn21)
- `karmada-controller-manager`: Fixed the issue that the relevant fields in rb and pp are inconsistent. ([#6714](https://github.com/karmada-io/karmada/pull/6714), @zhzhuang-zju)
```

RIGHT
```markdown
- `karmada-controller-manager`: Fixed the issue that reporting repeat EndpointSlice resources leads to duplicate backend IPs. ([#6693](https://github.com/karmada-io/karmada/pull/6693), @XiShanYongYe-Chang)
- `karmada-controller-manager`: Fixed the issue that the relevant fields in rb and pp are inconsistent. ([#6714](https://github.com/karmada-io/karmada/pull/6714), @zhzhuang-zju)
- `karmada-interpreter-webhook-example`: Fixed write response error for broken HTTP connection issue. ([#6680](https://github.com/karmada-io/karmada/pull/6680), @tdn21)
```

- Tense usage
  - `Deprecations`: Use present perfect tense (e.g., “has been deprecated”).
  - All other categories (features, fixes, etc.): Use simple past tense (e.g., “Fixed…”, “Added…”, “Removed…”).
  - Only when describing a newly introduced capability or behavioral changes, you may use present tense constructions like `now support` or `no longer relies`.

WRONG
```markdown
- `karmada-controller-manager`: Fix the bug that xxx. ([#prID](pr_link), @author)
```

RIGHT
```markdown
- `karmada-controller-manager`: Fixed the bug that xxx. ([#prID](pr_link), @author)
```
