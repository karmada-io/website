---
title: karmadactl create clusterrole
---

Create a cluster role

### Synopsis

Create a cluster role.

```
karmadactl create clusterrole NAME --verb=verb --resource=resource.group [--resource-name=resourcename] [--dry-run=server|client|none]
```

### Examples

```
  # Create a cluster role named "pod-reader" that allows user to perform "get", "watch" and "list" on pods
  kubectl create clusterrole pod-reader --verb=get,list,watch --resource=pods
  
  # Create a cluster role named "pod-reader" with ResourceName specified
  kubectl create clusterrole pod-reader --verb=get --resource=pods --resource-name=readablepod --resource-name=anotherpod
  
  # Create a cluster role named "foo" with API Group specified
  kubectl create clusterrole foo --verb=get,list,watch --resource=rs.apps
  
  # Create a cluster role named "foo" with SubResource specified
  kubectl create clusterrole foo --verb=get,list,watch --resource=pods,pods/status
  
  # Create a cluster role name "foo" with NonResourceURL specified
  kubectl create clusterrole "foo" --verb=get --non-resource-url=/logs/*
  
  # Create a cluster role name "monitoring" with AggregationRule specified
  kubectl create clusterrole monitoring --aggregation-rule="rbac.example.com/aggregate-to-monitoring=true"
```

### Options

```
      --aggregation-rule mapStringString   An aggregation label selector for combining ClusterRoles.
      --allow-missing-template-keys        If true, ignore any errors in templates when a field or map key is missing in the template. Only applies to golang and jsonpath output formats. (default true)
      --dry-run string[="unchanged"]       Must be "none", "server", or "client". If client strategy, only print the object that would be sent, without sending it. If server strategy, submit server-side request without persisting the resource. (default "none")
      --field-manager string               Name of the manager used to track field ownership. (default "kubectl-create")
  -h, --help                               help for clusterrole
      --non-resource-url strings           A partial url that user should have access to.
  -o, --output string                      Output format. One of: (json, yaml, name, go-template, go-template-file, template, templatefile, jsonpath, jsonpath-as-json, jsonpath-file).
      --resource strings                   Resource that the rule applies to
      --resource-name stringArray          Resource in the white list that the rule applies to, repeat this flag for multiple items
      --save-config                        If true, the configuration of current object will be saved in its annotation. Otherwise, the annotation will be unchanged. This flag is useful when you want to perform kubectl apply on this object in the future.
      --show-managed-fields                If true, keep the managedFields when printing objects in JSON or YAML format.
      --template string                    Template string or path to template file to use when -o=go-template, -o=go-template-file. The template format is golang templates [http://golang.org/pkg/text/template/#pkg-overview].
      --validate string[="strict"]         Must be one of: strict (or true), warn, ignore (or false).
                                           		"true" or "strict" will use a schema to validate the input and fail the request if invalid. It will perform server side validation if ServerSideFieldValidation is enabled on the api-server, but will fall back to less reliable client-side validation if not.
                                           		"warn" will warn about unknown or duplicate fields without blocking the request if server-side field validation is enabled on the API server, and behave as "ignore" otherwise.
                                           		"false" or "ignore" will not perform any schema validation, silently dropping any unknown or duplicate fields. (default "strict")
      --verb strings                       Verb that applies to the resources contained in the rule
```

### Options inherited from parent commands

```
      --add-dir-header                   If true, adds the file directory to the header of the log messages
      --alsologtostderr                  log to standard error as well as files (no effect when -logtostderr=true)
      --karmada-context string           The name of the kubeconfig context to use
      --kubeconfig string                Path to the kubeconfig file to use for CLI requests.
      --log-backtrace-at traceLocation   when logging hits line file:N, emit a stack trace (default :0)
      --log-dir string                   If non-empty, write log files in this directory (no effect when -logtostderr=true)
      --log-file string                  If non-empty, use this log file (no effect when -logtostderr=true)
      --log-file-max-size uint           Defines the maximum size a log file can grow to (no effect when -logtostderr=true). Unit is megabytes. If the value is 0, the maximum file size is unlimited. (default 1800)
      --logtostderr                      log to standard error instead of files (default true)
  -n, --namespace string                 If present, the namespace scope for this CLI request.
      --one-output                       If true, only write logs to their native severity level (vs also writing to each lower severity level; no effect when -logtostderr=true)
      --skip-headers                     If true, avoid header prefixes in the log messages
      --skip-log-headers                 If true, avoid headers when opening log files (no effect when -logtostderr=true)
      --stderrthreshold severity         logs at or above this threshold go to stderr when writing to files and stderr (no effect when -logtostderr=true or -alsologtostderr=true) (default 2)
  -v, --v Level                          number for the log level verbosity
      --vmodule moduleSpec               comma-separated list of pattern=N settings for file-filtered logging
```

### SEE ALSO

* [karmadactl create](karmadactl_create.md)	 - Create a resource from a file or from stdin

#### Go Back to [Karmadactl Commands](karmadactl_index.md) Homepage.


###### Auto generated by [spf13/cobra script in Karmada](https://github.com/karmada-io/karmada/tree/master/hack/tools/genkarmadactldocs).