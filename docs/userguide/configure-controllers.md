<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Configure Controllers](#configure-controllers)
  - [Controllers Overview](#controllers-overview)
  - [Configure Controllers](#configure-controllers-1)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Configure Controllers

Karmada maintains a bunch of controllers which are control loops that watch the state of your system and then make or
request changes where needed. Each controller tries to move the current state closer to the desired state.
See [Kubernetes Controller Concepts][1] for more details.

## Controllers Overview

The controllers are embedded into a component such as `karmada-controller-manager` or `karmada-agent` and will be launched
when such a component starts up. Some controllers may be shared by `karmada-controller-manager` and `karmada-agent`.

| Controller       | In karmada-controller-manager | In karmada-agent |
|------------------|-------------------------------|-----------------|
| cluster          | Y                            | N               |
| clusterStatus    | Y                            | Y               |
| binding          | Y                            | N               |
| execution        | Y                            | Y               |
| workStatus       | Y                            | Y               |
| namespace        | Y                            | N               |
| serviceExport    | Y                            | Y               |
| endpointSlice    | Y                            | N               |
| serviceImport    | Y                            | N               |
| unifiedAuth      | Y                            | N               |
| hpa              | Y                            | N               |

## Configuration Instructions

You can use `--controllers` flag to specify the enabled controller list for `karmada-controller-manager` and 
`karmada-agent`, or disable some of them in addition to the default list.

For example, specify a controller list:
```bash
--controllers=cluster,clusterStatus,binding,xxx
```

For example, disable some controllers:
```bash
--controllers=-hpa,-unifiedAuth
```

Use `-foo` to disable the controller named `foo`.

> Note: The list of default controllers might be changed in a future release. The controllers enabled by the last release
> might be disabled or deprecated and new controllers might be added too. Users who are using this flag should 
> check the release notes before system upgrade.

[1]: https://kubernetes.io/docs/concepts/architecture/controller/