---
title: 新增 API
---

本文是一个检查列表，当您在 Karmada 仓库中新增一个 API 时，您需要检查以下检查项是否需要同步更新。

修改以下任一检查项或等待所有修改项修改完成后，请执行 `make update` 命令来自动生成文件，然后将这些文件一并提交到 Karmada 仓库中。

## 更新 codegen

codegen 包含许多代码自动生成工具，包括：`deepcopy-gen`，`register-gen`，`conversion-gen`，`client-gen`，`lister-gen`，`informer-gen`，`openapi-gen`。您可以在文件 `hack/update-codegen.sh` 中为新增的 API 配置代码生成器。

## 更新 crdgen

使用 controller-gen 为新增的 API 生成 CRD Yaml 文件，您可以在文件 `hack/update-crdgen.sh` 中配置。

## 更新 import 别名

为了统一导入 API 包名时的格式，Karmada 在文件 `.import-aliases` 中定义了不同 API 包的导入别名，您可以检查下是否需要修改。

## CRD 安装

为确保正确安装新增的 API，您可以修改以下文件的配置：

- charts/karmada/_crds/kustomization.yaml

## Helm 安装

If the new API is located in a new group, please modify the following files and add corresponding configurations for the new API to ensure that helm is installed correctly:

如果新增的 API 位于新的 group 中，您可以修改以下文件并为新的 API 添加相应的配置，以确保正确安装 helm：

- charts/karmada/templates/post-delete-job.yaml
- charts/karmada/templates/post-install-job.yaml
- charts/karmada/templates/pre-install-job.yaml

## 更新 Karmada schema

为了在客户端调用时正确发现新增的 API，您可以检查下是否需要修改以下文件的配置：

- pkg/util/gclient/gclient.go

## 更新 swagger json

为了在 [Karmada's API](https://karmada.io/docs/category/karmada-api) 中找到新增的 API，您需要修改 `hack/tools/swagger/generateswagger.go` 文件，以便在 `api/openapi-spec/swagger.json` 文件中生成新的 API。

## 更新 SkippedResourceConfig

In the process of resource propagation, Karmada will filter out Karmada's own CRD resources. The code logic is here:

在资源分发的过程中，Karmada 会过滤掉 Karmada 自身的 CRD 资源，相关代码逻辑：

https://github.com/karmada-io/karmada/blob/9ccc8be46c135005289367b8867f4b2c82ca44c0/pkg/util/apigroup.go#L59-L66

你可以检查下是否需要更新代码。
