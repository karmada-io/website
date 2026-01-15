# Karmada version 1.13 released! Adds application priority scheduling capability.

Karmada is an open multi-cloud, multi-cluster container orchestration engine designed to help users deploy and operate business applications in multi-cloud environments. With its compatibility with native Kubernetes APIs, Karmada can smoothly migrate single-cluster workloads while maintaining interoperability with the surrounding Kubernetes ecosystem toolchain.

![karmada](./img/karmada.png)

[Karmada version 1.13](https://github.com/karmada-io/karmada/releases/tag/v1.13.0) has been released. This version includes the following new features:

- The newly added application priority scheduling function can be used to ensure the timeliness of critical operations.
- The newly added application scheduling pause and resume function can be used to build multi-cluster queue systems.
- Karmada Operator functionality continues to evolve
- Karmada controller performance optimization
- Karmada Dashboard's first version released! Ushering in a new chapter of multi-cloud orchestration visualization.

## Overview of New Features

### Application priority scheduling

Currently, the Karmada scheduler follows a FIFO (First-In, First-Out) strategy when scheduling workloads, dispatching them sequentially according to the order they enter the scheduling queue. However, in some scenarios, such as AI training job platforms, users prefer workloads to be scheduled based on priority. This allows high-priority, urgent tasks to "jump the queue," ensuring the timeliness and quality of service for critical business operations.

Starting with version 1.13.0, users can specify scheduling priority (the **.spec.SchedulePriority** field) when distributing workloads using a PropagationPolicy. **SchedulePriority** points to a priority class configured by the user. Karmada parses this priority class and retrieves the corresponding priority value; the higher the value, the higher the scheduling priority.

For example, you might need to deploy two applications, A and B, in an environment. Application A handles real-time-critical tasks such as online transactions, while application B handles non-urgent and time-insensitive tasks such as periodic log cleanup. To ensure that application A is prioritized during resource-constrained periods, you can configure it with a higher priority class.

Application A's priority class and PropagationPolicy configuration:

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
   name: high-priority
value: 1000000

---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-a
spec:
   schedulePriority:
      priorityClassSource: KubePriorityClass
      priorityClassName: high-priority
   placement:
      clusterAffinity:
         clusterNames:
            - member1
   resourceSelectors:
      - apiVersion: apps/v1
        kind: Deployment
        name: application-a
```

Application B's priority class and PropagationPolicy configuration: 

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
   name: low-priority
value: 1

---
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: propagation-b
spec:
   schedulePriority:
      priorityClassSource: KubePriorityClass
      priorityClassName: low-priority
   placement:
      clusterAffinity:
         clusterNames:
            - member1
   resourceSelectors:
      - apiVersion: apps/v1
        kind: Deployment
        name: application-b
```

With the above configuration, when the scheduling queue contains workloads from both application A and application B, application A will be scheduled first, even if application B enters the queue first.

For more information on application priority scheduling, please refer to: [Application Priority Scheduling](https://github.com/karmada-io/karmada/tree/master/docs/proposals/scheduling/binding-priority-preemption)

### Application scheduling pause and resume

The distribution of applications from the Karmada control plane to the member cluster can be roughly divided into two stages:

- **Application scheduling:** The Karmada scheduler selects the appropriate cluster for the application based on the distribution strategy.
- **Application distribution:** The Karmada controller distributes applications to the specified clusters according to the scheduling results.

Karmada now supports start and stop control of application scheduling and distribution processes, which provides users with flexible scheduling management methods. Based on this, users can build customized advanced scheduling strategies according to actual business needs. For example, it can be combined with the business release process to realize the rolling upgrade of federated applications across clusters; it can also be combined with workload priority to achieve priority scheduling of queues and workloads. The pause and resume of the application distribution process is a feature introduced in version v1.11.0. For details, please refer to: [Application Distribution Pause and Resume](https://karmada.io/docs/next/userguide/scheduling/resource-propagating/#suspend-and-resume-of-resource-propagation) . In version v1.13.0, Karmada officially introduced the pause and resume of the application scheduling process.

The community has added a new field **Scheduling** to **ResourceBinding.Spec.Suspension** to control the pausing and resuming of application scheduling. When **Suspension.Scheduling** `<value>` **true**, application scheduling is paused. When **Suspension.Scheduling** `<value>` **false**, application scheduling resumes. This feature can be integrated with third-party systems, allowing precise control over the application scheduling process by manipulating the **Suspension.Scheduling** field of a `ResourceBinding`. For example, when creating a `ResourceBinding`, **Suspension.Scheduling** can be set to **true** via a webhook to pause scheduling. Subsequently, operations such as priority sorting and capacity planning can be performed on the application. After these operations are completed, **Suspension.Scheduling** can be set to **false** to resume scheduling, ultimately enabling advanced capabilities such as ordered scheduling and resource quota management.


For more information on application scheduling pause and resume, please refer to: [Application Scheduling Pause and Resume Capabilities](https://github.com/karmada-io/karmada/tree/master/docs/proposals/scheduling-suspension)

### Karmada Operator functionality continues to evolve

This version continues to enhance Karmada Operator, adding the following features:

- Support for configuring API Server sidecar containers: Users can use this function to configure sidecar containers for the Karmada API Server, thereby integrating auxiliary services. For example,  the [KMS plugin](https://kubernetes.io/docs/tasks/administer-cluster/kms-provider/) can be integrated to achieve static data encryption.  

    For more information on configuring API Server sidecar containers, please refer to: [Support for configuring API Server sidecar containers](https://github.com/karmada-io/karmada/tree/master/docs/proposals/karmada-operator/api-server-sidecard-containers)
- Supports configuring component priority classes: Users can specify priority classes for control plane components by customizing the Karmada CR, ensuring that critical components are scheduled with appropriate priorities, thereby improving the reliability and stability of the Karmada system.

    For more information on configuring component priority classes, please refer to: [How to configure priority classes for Karmada control plane components](https://karmada.io/docs/administrator/configuration/priority-class-configuration/#how-to-configure-priority-classes-for-karmada-control-plane-components)

These new features further enhance the configurability of Karmada Operator, meeting diverse user needs.

### Karmada controller performance optimization

As Karmada gains widespread adoption in the industry and its deployment scale continues to increase, performance optimization has become a key focus for Karmada. The community has established a performance optimization team dedicated to analyzing and optimizing the performance of key Karmada components, and significant progress has been made.

In version v1.13.0, Karmada's performance optimizations primarily focused on the controller, reducing the performance overhead of controller restarts in large-scale data deployment scenarios. To verify the effectiveness of these optimizations, the community prepared a physical machine with 12 CPU cores and 28GB of RAM, and deployed 1000 Deployments and 1000 Configmaps, generating a total of 2000 ResourceBindings. After restarting the karmada-controller-manager component, workqueue metrics were collected, with the following results:

- **For the Detector controller** : queue reconcile time was reduced by 60%.
- **For the binding-controller** : queue reconcile time was reduced by 25%.

These metrics demonstrate a significant performance improvement in the re-orchestration of existing resources for the Detector and binding-controller in restart scenarios in version v1.13.0.

### Karmada Dashboard First Version Released

Thanks to the continuous efforts of several enthusiastic developers, Karmada Dashboard has finally ushered in its first milestone version (v0.1.0)! This version marks an important step forward for Karmada in the field of visual management.

Karmada Dashboard is a graphical user interface tool designed specifically for Karmada users, aiming to simplify the operation process of multi-cluster management and improve the user experience. Through the Dashboard, users can intuitively view cluster status, resource distribution, and task execution, while also easily performing configuration adjustments and policy deployments.

Karmada Dashboard v0.1.0's main features include:

Cluster Management: Provides cluster access and status overview, including key indicators such as health status and number of nodes.
Resource Management: Management of business resource configuration, including namespaces, workloads, services, etc.
Strategy Management: Karmada strategy management includes distribution strategies, differentiation strategies, etc.
For more information about the Karmada Dashboard, please refer to: [Karmada Dashboard](https://github.com/karmada-io/dashboard)

## Acknowledging Our Contributors

Karmada version 1.13 includes 205 code commits from 41 contributors. Sincere thanks to all contributors:

| ^-^                 | ^-^                 | ^-^                |
|---------------------|---------------------|--------------------|
| @adwait-godbole     | @anujagrawal699     | @axif0             |
| @carlory            | @chaosi-zju         | @CharlesQQ         |
| @chouchongYHMing    | @devadapter         | @dongjiang1989     |
| @gabrielsrs         | @guozheng-shen      | @Heylosky          |
| @iawia002           | @jabellard          | @jhnine            |
| @JimDevil           | @LavredisG          | @LeonZh0u          |
| @LiZhenCheng9527    | @ls-2018            | @mohamedawnallah   |
| @Monokaix           | @mszacillo          | @RainbowMango      |
| @sachinparihar      | @samzong            | @seanlaii          |
| @shauvet            | @SkySingh04         | @tiansuo114        |
| @Vacant2333         | @vibgreon           | @warjiang          |
| @whitewindmills     | @XiShanYongYe-Chang | @y1hao             |
| @yashpandey06       | @zach593            | @zhouqunjie-cs     |
| @zhzhuang-zju       | @ZwangaMukwevho     |                    |

![karmada v1.13 contributors](./img/contributors.png)
