---
title: karmadactl explain
---

Get documentation for a resource

### Synopsis

Describe fields and structure of various resources in Karmada control plane or a member cluster.

 This command describes the fields associated with each supported API resource. Fields are identified via a simple JSONPath identifier:

        <type>.<fieldName>[.<fieldName>]
        
 Information about each field is retrieved from the server in OpenAPI format.%!(EXTRA string=karmadactl)

```
karmadactl explain TYPE [--recursive=FALSE|TRUE] [--api-version=api-version-group] [--output=plaintext|plaintext-openapiv2] 
```

### Examples

```
  # Get the documentation of the resource and its fields in Karmada control plane
  karmadactl explain propagationpolicies
  
  # Get all the fields in the resource in member cluster member1
  karmadactl explain pods --recursive --operation-scope=members --cluster=member1
  
  # Get the explanation for resourcebindings in supported api versions in Karmada control plane
  karmadactl explain resourcebindings --api-version=work.karmada.io/v1alpha1
  
  # Get the documentation of a specific field of a resource in member cluster member1
  karmadactl explain pods.spec.containers --operation-scope=members --cluster=member1
  
  # Get the documentation of resources in different format in Karmada control plane
  karmadactl explain clusterpropagationpolicies --output=plaintext-openapiv2
```

### Options

```
      --api-version string               Use given api-version (group/version) of the resource.
      --cluster string                   Used to specify a target member cluster and only takes effect when the command's operation scope is member clusters, for example: --operation-scope=all --cluster=member1
  -h, --help                             help for explain
      --karmada-context string           The name of the kubeconfig context to use
      --kubeconfig string                Path to the kubeconfig file to use for CLI requests.
  -n, --namespace string                 If present, the namespace scope for this CLI request.
  -s, --operation-scope operationScope   Used to control the operation scope of the command. The optional values are karmada and members. Defaults to karmada. (default karmada)
      --output string                    Format in which to render the schema. Valid values are: (plaintext, plaintext-openapiv2). (default "plaintext")
      --recursive                        When true, print the name of all the fields recursively. Otherwise, print the available fields with their description.
```

### Options inherited from parent commands

```
      --add-dir-header                   If true, adds the file directory to the header of the log messages
      --alsologtostderr                  log to standard error as well as files (no effect when -logtostderr=true)
      --log-backtrace-at traceLocation   when logging hits line file:N, emit a stack trace (default :0)
      --log-dir string                   If non-empty, write log files in this directory (no effect when -logtostderr=true)
      --log-file string                  If non-empty, use this log file (no effect when -logtostderr=true)
      --log-file-max-size uint           Defines the maximum size a log file can grow to (no effect when -logtostderr=true). Unit is megabytes. If the value is 0, the maximum file size is unlimited. (default 1800)
      --logtostderr                      log to standard error instead of files (default true)
      --one-output                       If true, only write logs to their native severity level (vs also writing to each lower severity level; no effect when -logtostderr=true)
      --skip-headers                     If true, avoid header prefixes in the log messages
      --skip-log-headers                 If true, avoid headers when opening log files (no effect when -logtostderr=true)
      --stderrthreshold severity         logs at or above this threshold go to stderr when writing to files and stderr (no effect when -logtostderr=true or -alsologtostderr=true) (default 2)
  -v, --v Level                          number for the log level verbosity
      --vmodule moduleSpec               comma-separated list of pattern=N settings for file-filtered logging
```

### SEE ALSO

* [karmadactl](karmadactl.md)	 - karmadactl controls a Kubernetes Cluster Federation.

#### Go Back to [Karmadactl Commands](karmadactl_index.md) Homepage.


###### Auto generated by [spf13/cobra script in Karmada](https://github.com/karmada-io/karmada/tree/master/hack/tools/genkarmadactldocs).