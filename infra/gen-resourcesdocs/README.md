# Karmada API resources documentation generator

This tool extracts information from the OpenAPI specification file of the [Karmada API](https://github.com/karmada-io/karmada/blob/master/api/openapi-spec/swagger.json) and creates documentation in Markdown format, suitable for the [Karmada website](https://karmada.io/docs/category/karmada-api).

## Outline

The documentation is split into *parts*. Each part can contain any number of *chapters*. A chapter describes:

- a main Karmada resource,
- any resources and definitions associated with the main resource,
- any *Operations* operating on the resources documented in the chapter.

The parts and chapters are defined in the `config/current/toc.yaml` file.

```yaml
parts:
  - name: App Resources
    chapters:
      - name: WorkloadRebalancer
        group: "apps.karmada.io"
        version: v1alpha1
  - name: AutoScaling Resources
    chapters:
      - name: FederatedHPA
        group: "autoscaling.karmada.io"
        version: v1alpha1
      - name: CronFederatedHPA
        group: "autoscaling.karmada.io"
        version: v1alpha1
```

In this example, the first part contains ont chapters and the second part two chapter.

The first chapter describes the main `WorkloadRebalancer` resource (from the `apps.karmada.io` group and the `v1alpha1` version) and its associated resources and definitions. By default, if no `otherDefinitions` are defined, the associated resources are the `List` resource and the `Spec` and `Status` definitions, if appropriate. In this case, `WorkloadRebalancer`, `WorkloadRebalancerList`, `WorkloadRebalancerSpec` and `WorkloadRebalancerStatus` are documented.

## Definition Documentation

For each definition (including resources, which are definitions attached to a Group/Version), the fields are listed, with their type and documentation.

## How to use

### Script

1. update the `config/current/toc.yaml` file according to the latest Karmada API resources.
2. generate the Karmada latest API resources documentation by running the following script:
```shell
$ hack/reference-api.sh
```
