---
api_metadata:
  apiVersion: "config.karmada.io/v1alpha1"
  import: "github.com/karmada-io/karmada/pkg/apis/config/v1alpha1"
  kind: "ResourceInterpreterWebhookConfiguration"
content_type: "api_reference"
description: "ResourceInterpreterWebhookConfiguration describes the configuration of webhooks which take the responsibility to tell karmada the details of the resource object, especially for custom resources."
title: "ResourceInterpreterWebhookConfiguration v1alpha1"
weight: 2
auto_generated: true
---

[//]: # (The file is auto-generated from the Go source code of the component using a generic generator,)
[//]: # (which is forked from [reference-docs](https://github.com/kubernetes-sigs/reference-docs.)
[//]: # (To update the reference content, please follow the `reference-api.sh`.)

`apiVersion: config.karmada.io/v1alpha1`

`import "github.com/karmada-io/karmada/pkg/apis/config/v1alpha1"`

## ResourceInterpreterWebhookConfiguration 

ResourceInterpreterWebhookConfiguration describes the configuration of webhooks which take the responsibility to tell karmada the details of the resource object, especially for custom resources.

<hr/>

- **apiVersion**: config.karmada.io/v1alpha1

- **kind**: ResourceInterpreterWebhookConfiguration

- **metadata** ([ObjectMeta](../common-definitions/object-meta#objectmeta))

- **webhooks** ([]ResourceInterpreterWebhook), required

  Webhooks is a list of webhooks and the affected resources and operations.

  <a name="ResourceInterpreterWebhook"></a>

  *ResourceInterpreterWebhook describes the webhook as well as the resources and operations it applies to.*

  - **webhooks.clientConfig** (WebhookClientConfig), required

    ClientConfig defines how to communicate with the hook.

    <a name="WebhookClientConfig"></a>

    *WebhookClientConfig contains the information to make a TLS connection with the webhook*

    - **webhooks.clientConfig.caBundle** ([]byte)

      `caBundle` is a PEM encoded CA bundle which will be used to validate the webhook's server certificate. If unspecified, system trust roots on the apiserver are used.

    - **webhooks.clientConfig.service** (ServiceReference)

      `service` is a reference to the service for this webhook. Either `service` or `url` must be specified.
      
      If the webhook is running within the cluster, then you should use `service`.

      <a name="ServiceReference"></a>

      *ServiceReference holds a reference to Service.legacy.k8s.io*

      - **webhooks.clientConfig.service.name** (string), required

        `name` is the name of the service. Required

      - **webhooks.clientConfig.service.namespace** (string), required

        `namespace` is the namespace of the service. Required

      - **webhooks.clientConfig.service.path** (string)

        `path` is an optional URL path which will be sent in any request to this service.

      - **webhooks.clientConfig.service.port** (int32)

        If specified, the port on the service that hosting webhook. Default to 443 for backward compatibility. `port` should be a valid port number (1-65535, inclusive).

    - **webhooks.clientConfig.url** (string)

      `url` gives the location of the webhook, in standard URL form (`scheme://host:port/path`). Exactly one of `url` or `service` must be specified.
      
      The `host` should not refer to a service running in the cluster; use the `service` field instead. The host might be resolved via external DNS in some apiservers (e.g., `kube-apiserver` cannot resolve in-cluster DNS as that would be a layering violation). `host` may also be an IP address.
      
      Please note that using `localhost` or `127.0.0.1` as a `host` is risky unless you take great care to run this webhook on all hosts which run an apiserver which might need to make calls to this webhook. Such installs are likely to be non-portable, i.e., not easy to turn up in a new cluster.
      
      The scheme must be "https"; the URL must begin with "https://".
      
      A path is optional, and if present may be any string permissible in a URL. You may use the path to pass an arbitrary string to the webhook, for example, a cluster identifier.
      
      Attempting to use a user or basic auth e.g. "user:password@" is not allowed. Fragments ("#...") and query parameters ("?...") are not allowed, either.

  - **webhooks.interpreterContextVersions** ([]string), required

    InterpreterContextVersions is an ordered list of preferred `ResourceInterpreterContext` versions the Webhook expects. Karmada will try to use first version in the list which it supports. If none of the versions specified in this list supported by Karmada, validation will fail for this object. If a persisted webhook configuration specifies allowed versions and does not include any versions known to the Karmada, calls to the webhook will fail and be subject to the failure policy.

  - **webhooks.name** (string), required

    Name is the full-qualified name of the webhook.

  - **webhooks.rules** ([]RuleWithOperations)

    Rules describes what operations on what resources the webhook cares about. The webhook cares about an operation if it matches any Rule.

    <a name="RuleWithOperations"></a>

    *RuleWithOperations is a tuple of Operations and Resources. It is recommended to make sure that all the tuple expansions are valid.*

    - **webhooks.rules.apiGroups** ([]string), required

      APIGroups is the API groups the resources belong to. '*' is all groups. If '*' is present, the length of the slice must be one. For example:
       ["apps", "batch", "example.io"] means matches 3 groups.
       ["*"] means matches all group
      
      Note: The group cloud be empty, e.g the 'core' group of kubernetes, in that case use [""].

    - **webhooks.rules.apiVersions** ([]string), required

      APIVersions is the API versions the resources belong to. '*' is all versions. If '*' is present, the length of the slice must be one. For example:
       ["v1alpha1", "v1beta1"] means matches 2 versions.
       ["*"] means matches all versions.

    - **webhooks.rules.kinds** ([]string), required

      Kinds is a list of resources this rule applies to. If '*' is present, the length of the slice must be one. For example:
       ["Deployment", "Pod"] means matches Deployment and Pod.
       ["*"] means apply to all resources.

    - **webhooks.rules.operations** ([]string), required

      Operations is the operations the hook cares about. If '*' is present, the length of the slice must be one.

  - **webhooks.timeoutSeconds** (int32)

    TimeoutSeconds specifies the timeout for this webhook. After the timeout passes, the webhook call will be ignored or the API call will fail based on the failure policy. The timeout value must be between 1 and 30 seconds. Default to 10 seconds.

## ResourceInterpreterWebhookConfigurationList 

ResourceInterpreterWebhookConfigurationList contains a list of ResourceInterpreterWebhookConfiguration.

<hr/>

- **apiVersion**: config.karmada.io/v1alpha1

- **kind**: ResourceInterpreterWebhookConfigurationList

- **metadata** ([ListMeta](../common-definitions/list-meta#listmeta))

- **items** ([][ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)), required

  Items holds a list of ResourceInterpreterWebhookConfiguration.

## Operations 

<hr/>

### `get` read the specified ResourceInterpreterWebhookConfiguration

#### HTTP Request

`GET /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations/{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceInterpreterWebhookConfiguration

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): OK

### `get` read status of the specified ResourceInterpreterWebhookConfiguration

#### HTTP Request

`GET /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations/{name}/status`

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceInterpreterWebhookConfiguration

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): OK

### `list` list or watch objects of kind ResourceInterpreterWebhookConfiguration

#### HTTP Request

`GET /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations`

#### Parameters

- **allowWatchBookmarks** (*in query*): boolean

  [allowWatchBookmarks](../common-parameter/common-parameters#allowwatchbookmarks)

- **continue** (*in query*): string

  [continue](../common-parameter/common-parameters#continue)

- **fieldSelector** (*in query*): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **labelSelector** (*in query*): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (*in query*): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **resourceVersion** (*in query*): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (*in query*): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (*in query*): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (*in query*): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

- **watch** (*in query*): boolean

  [watch](../common-parameter/common-parameters#watch)

#### Response

200 ([ResourceInterpreterWebhookConfigurationList](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfigurationlist)): OK

### `create` create a ResourceInterpreterWebhookConfiguration

#### HTTP Request

`POST /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations`

#### Parameters

- **body**: [ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): OK

201 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): Created

202 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): Accepted

### `update` replace the specified ResourceInterpreterWebhookConfiguration

#### HTTP Request

`PUT /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations/{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceInterpreterWebhookConfiguration

- **body**: [ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): OK

201 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): Created

### `update` replace status of the specified ResourceInterpreterWebhookConfiguration

#### HTTP Request

`PUT /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations/{name}/status`

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceInterpreterWebhookConfiguration

- **body**: [ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): OK

201 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): Created

### `patch` partially update the specified ResourceInterpreterWebhookConfiguration

#### HTTP Request

`PATCH /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations/{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceInterpreterWebhookConfiguration

- **body**: [Patch](../common-definitions/patch#patch), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force** (*in query*): boolean

  [force](../common-parameter/common-parameters#force)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): OK

201 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): Created

### `patch` partially update status of the specified ResourceInterpreterWebhookConfiguration

#### HTTP Request

`PATCH /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations/{name}/status`

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceInterpreterWebhookConfiguration

- **body**: [Patch](../common-definitions/patch#patch), required

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldManager** (*in query*): string

  [fieldManager](../common-parameter/common-parameters#fieldmanager)

- **fieldValidation** (*in query*): string

  [fieldValidation](../common-parameter/common-parameters#fieldvalidation)

- **force** (*in query*): boolean

  [force](../common-parameter/common-parameters#force)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

#### Response

200 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): OK

201 ([ResourceInterpreterWebhookConfiguration](../config-resources/resource-interpreter-webhook-configuration-v1alpha1#resourceinterpreterwebhookconfiguration)): Created

### `delete` delete a ResourceInterpreterWebhookConfiguration

#### HTTP Request

`DELETE /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations/{name}`

#### Parameters

- **name** (*in path*): string, required

  name of the ResourceInterpreterWebhookConfiguration

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **gracePeriodSeconds** (*in query*): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (*in query*): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

#### Response

200 ([Status](../common-definitions/status#status)): OK

202 ([Status](../common-definitions/status#status)): Accepted

### `deletecollection` delete collection of ResourceInterpreterWebhookConfiguration

#### HTTP Request

`DELETE /apis/config.karmada.io/v1alpha1/resourceinterpreterwebhookconfigurations`

#### Parameters

- **body**: [DeleteOptions](../common-definitions/delete-options#deleteoptions)

  

- **continue** (*in query*): string

  [continue](../common-parameter/common-parameters#continue)

- **dryRun** (*in query*): string

  [dryRun](../common-parameter/common-parameters#dryrun)

- **fieldSelector** (*in query*): string

  [fieldSelector](../common-parameter/common-parameters#fieldselector)

- **gracePeriodSeconds** (*in query*): integer

  [gracePeriodSeconds](../common-parameter/common-parameters#graceperiodseconds)

- **labelSelector** (*in query*): string

  [labelSelector](../common-parameter/common-parameters#labelselector)

- **limit** (*in query*): integer

  [limit](../common-parameter/common-parameters#limit)

- **pretty** (*in query*): string

  [pretty](../common-parameter/common-parameters#pretty)

- **propagationPolicy** (*in query*): string

  [propagationPolicy](../common-parameter/common-parameters#propagationpolicy)

- **resourceVersion** (*in query*): string

  [resourceVersion](../common-parameter/common-parameters#resourceversion)

- **resourceVersionMatch** (*in query*): string

  [resourceVersionMatch](../common-parameter/common-parameters#resourceversionmatch)

- **sendInitialEvents** (*in query*): boolean

  [sendInitialEvents](../common-parameter/common-parameters#sendinitialevents)

- **timeoutSeconds** (*in query*): integer

  [timeoutSeconds](../common-parameter/common-parameters#timeoutseconds)

#### Response

200 ([Status](../common-definitions/status#status)): OK

