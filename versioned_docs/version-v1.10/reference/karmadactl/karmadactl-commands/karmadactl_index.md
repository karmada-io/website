---
title: Karmadactl Commands
---


## Basic Commands

* [karmadactl get](karmadactl_get.md)	 - Display one or many resources in member clusters.

 Prints a table of the most important information about the specified resources. You can filter the list using a label selector and the --selector flag. If the desired resource type is namespaced you will only see results in your current namespace unless you pass --all-namespaces.

 By specifying the output as 'template' and providing a Go template as the value of the --template flag, you can filter the attributes of the fetched resources.

## Cluster Registration Commands

* [karmadactl addons](karmadactl_addons.md)	 - Enable or disable a Karmada addon.

 These addons are currently supported:

  1.  karmada-descheduler
  2.  karmada-metrics-adapter
  3.  karmada-scheduler-estimator
  4.  karmada-search
* [karmadactl deinit](karmadactl_deinit.md)	 - Remove the Karmada control plane from the Kubernetes cluster.
* [karmadactl init](karmadactl_init.md)	 - Install the Karmada control plane in a Kubernetes cluster.

 By default, the images and CRD tarball are downloaded remotely. For offline installation, you can set '--private-image-registry' and '--crds'.
* [karmadactl join](karmadactl_join.md)	 - Register a cluster to Karmada control plane with Push mode.
* [karmadactl register](karmadactl_register.md)	 - Register a cluster to Karmada control plane with Pull mode.
* [karmadactl token](karmadactl_token.md)	 - This command manages bootstrap tokens. It is optional and needed only for advanced use cases.

 In short, bootstrap tokens are used for establishing bidirectional trust between a client and a server. A bootstrap token can be used when a client (for example a member cluster that is about to join control plane) needs to trust the server it is talking to. Then a bootstrap token with the "signing" usage can be used. bootstrap tokens can also function as a way to allow short-lived authentication to the API Server (the token serves as a way for the API Server to trust the client), for example for doing the TLS Bootstrap.

 What is a bootstrap token more exactly? - It is a Secret in the kube-system namespace of type "bootstrap.kubernetes.io/token". - A bootstrap token must be of the form "[a-z0-9]{6}.[a-z0-9]{16}". The former part is the public token ID, while the latter is the Token Secret and it must be kept private at all circumstances! - The name of the Secret must be named "bootstrap-token-(token-id)".

 This command is same as 'kubeadm token', but it will create tokens that are used by member clusters.
* [karmadactl unjoin](karmadactl_unjoin.md)	 - Remove a cluster from Karmada control plane.

## Cluster Management Commands

* [karmadactl cordon](karmadactl_cordon.md)	 - Mark cluster as unschedulable.
* [karmadactl taint](karmadactl_taint.md)	 - Update the taints on one or more clusters.

  *  A taint consists of a key, value, and effect. As an argument here, it is expressed as key=value:effect.
  *  The key must begin with a letter or number, and may contain letters, numbers, hyphens, dots, and underscores, up to 253 characters.
  *  Optionally, the key can begin with a DNS subdomain prefix and a single '/', like example.com/my-app.
  *  The value is optional. If given, it must begin with a letter or number, and may contain letters, numbers, hyphens, dots, and underscores, up to  63 characters.
  *  The effect must be NoSchedule, PreferNoSchedule or NoExecute.
  *  Currently taint can only apply to cluster.
* [karmadactl uncordon](karmadactl_uncordon.md)	 - Mark cluster as schedulable.

## Troubleshooting and Debugging Commands

* [karmadactl describe](karmadactl_describe.md)	 - Show details of a specific resource or group of resources in a member cluster.

 Print a detailed description of the selected resources, including related resources such as events or controllers. You may select a single object by name, all objects of that type, provide a name prefix, or label selector. For example:

 $ karmadactl describe TYPE NAME_PREFIX

 will first check for an exact match on TYPE and NAME_PREFIX. If no such resource exists, it will output details for every resource that has a name prefixed with NAME_PREFIX.
* [karmadactl exec](karmadactl_exec.md)	 - Execute a command in a container in a cluster.
* [karmadactl interpret](karmadactl_interpret.md)	 - Validate, test and edit interpreter customization before applying it to the control plane.
        
        1. Validate the ResourceInterpreterCustomization configuration as per API schema
        and try to load the scripts for syntax check.
        
        2. Run the rules locally and test if the result is expected. Similar to the dry run.
        
  1.  Edit customization. Similar to the kubectl edit.
* [karmadactl logs](karmadactl_logs.md)	 - Print the logs for a container in a pod in a member cluster or specified resource. If the pod has only one container, the container name is optional.

## Advanced Commands

* [karmadactl apply](karmadactl_apply.md)	 - Apply a configuration to a resource by file name or stdin and propagate them into member clusters. The resource name must be specified. This resource will be created if it doesn't exist yet. To use 'apply', always create the resource initially with either 'apply' or 'create --save-config'.

 JSON and YAML formats are accepted.

 Alpha Disclaimer: the --prune functionality is not yet complete. Do not use unless you are aware of what the current state is. See https://issues.k8s.io/34274.

 Note: It implements the function of 'kubectl apply' by default. If you want to propagate them into member clusters, please use %[1]s apply --all-clusters'.
* [karmadactl promote](karmadactl_promote.md)	 - Promote resources from legacy clusters to Karmada control plane. Requires the cluster has been joined or registered.

 If the resource already exists in Karmada control plane, please edit PropagationPolicy and OverridePolicy to propagate it.

###### Auto generated by [script in Karmada](https://github.com/karmada-io/karmada/tree/master/hack/tools/genkarmadactldocs).