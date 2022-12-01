---
title: 故障迁移特性概览
---

在多云多集群场景中，为了提高业务的高可用性，用户工作负载可能会被部署在多个不同的集群中。在Karmada中，当集群发生故障或是用户不希望在某个集群上继续运行工作负载时，集群状态将被标记为不可用，并被添加上一些污点。

taint-manager检测到集群故障之后，会从这些故障集群中驱逐工作负载，被驱逐的工作负载将被调度至其他最适合的集群，从而达成故障迁移的目的，保证了用户业务的可用性与连续性。

## 为何需要故障迁移

下面来介绍一些多集群故障迁移的场景：

- 管理员在Karmada控制面部署了一个离线业务，并将业务Pod实例分发到了多个集群。突然某个集群发生故障，管理员希望Karmada能够把故障集群上的Pod实例迁移到其他条件适合的集群中去。
- 普通用户通过Karmada控制面在某一个集群上部署了一个在线业务，业务包括数据库实例、服务器实例、配置文件等，服务通过控制面上的ELB对外暴露，此时某一集群发生故障，用户希望把整个业务能迁移到另一个情况较适合的集群上，业务迁移期间需要保证服务不断服。
- 管理员将某个集群进行升级，作为基础设施的容器网络、存储等发生了改变，管理员希望在集群升级之前把当前集群上的应用迁移到其他适合的集群中去，业务迁移期间需要保证服务不断服。
- ......

## 怎样进行故障迁移

![](../../resources/userguide/failover/failover-overview.png)

用户在Karmada中加入了三个集群，分别为：`member1`、`member2`和`member3`。然后在karmada控制面部署了一个名为`foo`，且副本数为2的Deployment，并通过PropagationPolicy将其分发到了集群`member1`和`member2`上。

当集群`member1`发生故障之后，其上的Pod实例将被驱逐，然后被迁移到集群`member2`或是集群`member3`中，这个不同的迁移行为可以通过`PropagationPolicy/ClusterPropagationPolicy`的副本调度策略`ReplicaSchedulingStrategy`来控制。

## 用户如何开启特性

用户可以通过启用`karmada-controller`的`Failover`特性开关来开启故障迁移特性。`Failover`特性开关从Karmada v1.4后处于Beta阶段，并且默认开启。用户如果使用Karmada v1.3或是更早的版本，需要手动开启`Failover`特性开关：

```
--feature-gates=Failover=true
```

此外，如果用户启用了GracefulEvction特性，故障迁移过程将变得十分平滑且优雅，也就是说，工作负载的驱逐将被推迟到工作负载在新群集上启动或达到最大宽限期之后才被执行。`GracefulEviction`特性开关从Karmada v1.4后处于Beta阶段，并且默认开启。用户如果使用Karmada v1.3，需要通过启用`karmada-controller`的如下特性开关：

```
--feature-gates=Failover=true,GracefulEviction=true
```
