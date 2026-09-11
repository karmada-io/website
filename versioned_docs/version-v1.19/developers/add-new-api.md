---
title: Add new API
---

This article is a checklist. When you add an API, you need to check whether the following items are updated simultaneously.

After modifying any of the following check items, or waiting for all modification items to be modified, you can execute the `make update` command to automatically generate the files, then submit these files to the [Karmada repo](https://github.com/karmada-io/karmada).

## Update codegen

Codegen contains many automatic code generation tools, including `deepcopy-gen`, `register-gen`, `conversion-gen`, `client-gen`, `lister-gen`, `informer-gen`, `openapi-gen`. You can set the above code generation configuration for the newly added API in the file `hack/update-codegen.sh`.

## Update crdgen

To generate CRD Yaml files for the added APIs using the controller-gen, set the configuration in the file `hack/update-crdgen.sh`.

## Update import aliases

To unify the format when importing APIs package name, Karmada defines the import aliases of different API packages in file `.import-aliases`. You can check whether you need to modify it.

## CRD install

To ensure that the new API can be installed correctly, you can modify the configuration of the following files:

- charts/karmada/_crds/kustomization.yaml

## Helm install

If the new API is located in a new group, you can modify the following files and add corresponding configurations for the new API to ensure that helm is installed correctly:

- charts/karmada/templates/post-delete-job.yaml
- charts/karmada/templates/post-install-job.yaml
- charts/karmada/templates/pre-install-job.yaml

## Update Karmada schema

To correctly discover the new API during the client call, you can check whether you need to modify the configuration of the following files:

- pkg/util/gclient/gclient.go

## Update swagger json

To include the new API in [Karmada's API](https://karmada.io/docs/category/karmada-api), you need to modify the `hack/tools/swagger/generateswagger.go` file so that the new API can be generated in the `api/openapi-spec/swagger.json` file.

## Update SkippedResourceConfig

In the process of resource propagation, Karmada will filter out Karmada's own CRD resources. The code logic is here:

https://github.com/karmada-io/karmada/blob/9ccc8be46c135005289367b8867f4b2c82ca44c0/pkg/util/apigroup.go#L59-L66

You can check if the code needs to be updated.
