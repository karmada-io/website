---
api_metadata:
  apiVersion: ""
  import: "k8s.io/apimachinery/pkg/api/resource"
  kind: "Quantity"
content_type: "api_reference"
description: "Quantity is a fixed-point representation of a number."
title: "Quantity"
weight: 7
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`import "k8s.io/apimachinery/pkg/api/resource"`

Quantity 是数字的定点表示。除了 String() 和 AsInt64() 的访问接口之外，此字段还在 JSON 和 YAML 中提供了方便的序列化（marshaling）和反序列化（unmarshalling）。

序列化格式如下：

``` 
<quantity>        ::= \<signedNumber>\<suffix>

	(注意 \<suffix> 可能为空，例如 \<decimalSI> 的 "" 情形。)

<digit>           ::= 0 | 1 | ... | 9 
<digits>          ::= \<digit> | \<digit>\<digits> 
<number>          ::= \<digits> | \<digits>.\<digits> | \<digits>. | .\<digits> 
<sign>            ::= "+" | "-" 
<signedNumber>    ::= \<number> | \<sign>\<number> 
<suffix>          ::= \<binarySI> | \<decimalExponent> | \<decimalSI> 
<binarySI>        ::= Ki | Mi | Gi | Ti | Pi | Ei

	（国际单位制度，请浏览： http://physics.nist.gov/cuu/Units/binary.html）

<decimalSI>       ::= m | "" | k | M | G | T | P | E

	（注意，1024 = 1Ki，1000 = 1k）

<decimalExponent> ::= "e" \<signedNumber> | "E" \<signedNumber> 
```

无论使用三种指数形式中的哪一种，任何数量都不可能是大于 2^63-1 的数字，小数位也不能超过 3 位。如果有较大的数字，则会取最大值（即 2^63-1），如果有更精确的数字，则会向上取整 （例如：0.1m 将四舍五入为 1m）。如果需要更大或更小的数量，可以后续进行扩展。

从字符串解析 Quantity 时，字符串的后缀类型会被记住，并在序列化时再次使用相同的类型。

在序列化之前，Quantity 将以“规范形式”呈现。这意味着指数或后缀将向上或向下调整（尾数相应增加或减少），以便：

- 无精确度丢失。
- 无小数数字。
- 指数（或后缀）尽可能大。

除非数量为负数，否则正负号将被省略。

示例：

- 1.5 将被序列化成 “1500m”。
- 1.5Gi 将被序列化成 “1536Mi”。

注意，数量在内部永远不会由浮点数表示。这是本设计的重中之重。

只要非规范值格式正确，仍会被解析，但将以其规范形式重新发出 （所以一定要使用规范形式，不要执行 diff 比较）。

采用这种格式，就很难在不编写某种特殊处理的代码的情况下使用这些数字，进而希望实现者也使用定点实现。

<hr/>
