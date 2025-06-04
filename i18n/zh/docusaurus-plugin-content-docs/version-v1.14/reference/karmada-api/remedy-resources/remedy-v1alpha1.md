---
api_metadata:
  apiVersion: "remedy.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/remedy/v1alpha1"
  kind: "Remedy"
content_type: "api_reference"
description: "Remedy represents the cluster-level management strategies based on cluster conditions."
title: "Remedy v1alpha1"
weight: 1
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: remedy.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/remedy/v1alpha1"`

## Remedy 

Remedy 表示基于集群状况的集群级管理策略。

<hr/>

- **apiVersion**: remedy.karmada.io/v1alpha1

- **kind**: Remedy

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **spec** ([RemedySpec](../remedy-resources/remedy-v1alpha1#remedyspec)), required

  Spec 定义了 Remedy 的期望行为。

## RemedySpec 

RemedySpec 定义了 Remedy 的期望行为。

<hr/>

- **actions** ([]string)

  Actions 指定 remedy 系统需要执行的操作。如果为空，则不执行任何操作。

- **clusterAffinity** (ClusterAffinity)

  ClusterAffinity 指定 Remedy 需要关注的集群。对于满足 DecisionConditions（决策条件）的集群，将执行相应的操作。如果为空，则会选择所有集群。

  <a name="ClusterAffinity"></a>

  *ClusterAffinity 用于筛选集群。*

  - **clusterAffinity.clusterNames** ([]string)

    ClusterNames 是要选择的集群列表。

- **decisionMatches** ([]DecisionMatch)

  DecisionMatches 表示触发 remedy 系统执行操作的决策匹配。只要有一个决策匹配项匹配，就会执行行动。如果为空，则会立即执行。

  <a name="DecisionMatch"></a>

  *DecisionMatch 代表激活 remedy 系统的决策条件。*

  - **decisionMatches.clusterConditionMatch** (ClusterConditionRequirement)

    ClusterConditionMatch 描述了集群状况要求。

    <a name="ClusterConditionRequirement"></a>

    *ClusterConditionRequirement 描述了集群状况要求。*

    - **decisionMatches.clusterConditionMatch.conditionStatus** (string), 必选

      ConditionStatus 指定了集群的状况状态。

    - **decisionMatches.clusterConditionMatch.conditionType** (string), 必选

      ConditionType 指定了集群的状况类型。

    - **decisionMatches.clusterConditionMatch.operator** (string), 必选

      Operator 表示 conditionType 与 conditionStatus 的关系。有效的操作符有 Equal（相等）、NotEqual（不相等）。

## RemedyList 

RemedyList 是 Remedy 的集合。

<hr/>

- **apiVersion**: remedy.karmada.io/v1alpha1

- **kind**: RemedyList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][Remedy](../remedy-resources/remedy-v1alpha1#remedy)), 必选

## 操作 

<hr/>

### `get` 查询指定的 Remedy

#### HTTP 请求

GET /apis/remedy.karmada.io/v1alpha1/remedies/{name}

#### 参数

- **name** (**路径参数**): string, 必选

  Remedy 的名称

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): OK

### `get` 查询指定 Remedy 的状态

#### HTTP 请求

GET /apis/remedy.karmada.io/v1alpha1/remedies/{name}/status

#### 参数

- **name** (**路径参数**): string, 必选

  Remedy 的名称

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): OK

### `list` 查询所有 Remedy

#### HTTP 请求

GET /apis/remedy.karmada.io/v1alpha1/remedies

#### 参数

- **allowWatchBookmarks** (**查询参数**): boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue** (**查询参数**): string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector** (**查询参数**): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector** (**查询参数**): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (**查询参数**): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion** (**查询参数**): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (**查询参数**): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (**查询参数**): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (**查询参数**): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch** (**查询参数**): boolean

  [watch](../common-parameter/common-parameters#watch)

#### 响应

200 ([RemedyList](../remedy-resources/remedy-v1alpha1#remedylist)): OK

### `create` 创建一个 Remedy

#### HTTP 请求

POST /apis/remedy.karmada.io/v1alpha1/remedies

#### 参数

- **body**: [Remedy](../remedy-resources/remedy-v1alpha1#remedy), 必选

  

- **dryRun** (**查询参数**): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (**查询参数**): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (**查询参数**): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): OK

201 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): Created

202 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): Accepted

### `update` 更新指定的 Remedy

#### HTTP 请求

PUT /apis/remedy.karmada.io/v1alpha1/remedies/{name}

#### 参数

- **name** (**路径参数**): string, 必选

  Remedy 的名称

- **body**: [Remedy](../remedy-resources/remedy-v1alpha1#remedy), 必选

  

- **dryRun** (**查询参数**): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (**查询参数**): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (**查询参数**): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): OK

201 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): Created

### `update` 更新指定 Remedy 的状态

#### HTTP 请求

PUT /apis/remedy.karmada.io/v1alpha1/remedies/{name}/status

#### 参数

- **name** (**路径参数**): string, 必选

  Remedy 的名称

- **body**: [Remedy](../remedy-resources/remedy-v1alpha1#remedy), 必选

  

- **dryRun** (**查询参数**): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (**查询参数**): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (**查询参数**): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): OK

201 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): Created

### `patch` 更新指定 Remedy 的部分信息

#### HTTP 请求

PATCH /apis/remedy.karmada.io/v1alpha1/remedies/{name}

#### 参数

- **name** (**路径参数**): string, 必选

  Remedy 的名称

- **body**: [Patch](../common-definitions/patch#patch), 必选

  

- **dryRun** (**查询参数**): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (**查询参数**): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (**查询参数**): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force** (**查询参数**): boolean

  [force](../common-parameter/common-parameters#force)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): OK

201 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): Created

### `patch` 更新指定 Remedy 状态的部分信息

#### HTTP 请求

PATCH /apis/remedy.karmada.io/v1alpha1/remedies/{name}/status

#### 参数

- **name** (**路径参数**): string, 必选

  Remedy 的名称

- **body**: [Patch](../common-definitions/patch#patch), 必选

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (**查询参数**): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (**查询参数**): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force** (**查询参数**): boolean

  [force](../common-parameter/common-parameters#force)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

#### 响应

200 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): OK

201 ([Remedy](../remedy-resources/remedy-v1alpha1#remedy)): Created

### `delete` 删除一个 Remedy

#### HTTP 请求

DELETE /apis/remedy.karmada.io/v1alpha1/remedies/{name}

#### 参数

- **name** (**路径参数**): string, 必选

  Remedy 的名称

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **dryRun** (**查询参数**): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **gracePeriodSeconds** (**查询参数**): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (**查询参数**): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

#### 响应

200 ([Status](../common-definitions/status#status)): OK

202 ([Status](../common-definitions/status#status)): Accepted

### `deletecollection` 删除所有 Remedy

#### HTTP 请求

DELETE /apis/remedy.karmada.io/v1alpha1/remedies

#### 参数

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **continue** (**查询参数**): string

  [continue](../common-parameter/common-parameters#continue)

- **dryRun** (**查询参数**): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldSelector** (**查询参数**): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **gracePeriodSeconds** (**查询参数**): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **labelSelector** (**查询参数**): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (**查询参数**): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (**查询参数**): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (**查询参数**): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

- **resourceVersion** (**查询参数**): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (**查询参数**): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (**查询参数**): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (**查询参数**): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

#### 响应

200 ([Status](../common-definitions/status#status)): OK

