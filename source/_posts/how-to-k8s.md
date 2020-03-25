title: k8s入门指引
author: blademainer
tags:
  - k8s
  - go
  - gracefully
  - terminate
categories:
  - cloud
date: 2020-03-25 23:16:00
---

## 如何开始(准备/前提)?

> [<i class="fa fa-external-link fa-lg"></i> 学前班][lnk-kube-basic] 
> 前期准备
> 前期知识: 容器(如: docker)?


## 如何抢先体验K8S？

[<i class="fa fa-external-link fa-lg"></i> **kubernetes.io/docs/tutorials**][lnk-kube-online]

可以尝试运行以下命令：

```shell

$ kubectl get pods
$ kubectl get ns

```

## 如何搭建自己的 MiniKube？

> **TODO**
> [color=red]

## 如何管理配置？
- 环境相关配置，放到configmap。多个deploy同时引用同个configmap即可。
- 业务相关配置，管理端写etcd/redis，服务端监听etcd/redis的配置变更。
- ToC端应用，**务必不要**每次都读取etcd/redis的配置，而应当读取本地内存；只有在应用`启动`或接收到`配置变更事件`之后才缓存到本地内存。
- > 更新configmap之后，deploy需要重启才能使配置生效（除非程序自动读取配置进行刷新）

## 如何处理日志？
> 打日志
> 运用日志

- 日志在容器内，务必输出到终端(**stdout**)，然后使用统一机制(**xlog**)，收集到ES(联系运维)；
- 管理端的日志属于：运营、产品、商户、代理商的操作日志
    - 产生日志相对较少(一般而言);
    - 具备审计和安全日志的意义，**备监管部门审查**;
    - 须保留半年、一年(甚至更久);
- 服务端的日志属于：用户端的访问日志，是应用内部状态的日志，
    - 产生日志较多，甚至海量;
    - 具备系统分析意义，用于：问题排查(性能、错误等)、生成统计/分析;
    - 仅保留一周；
- 若因实际情况，需在容器内临时落盘，请映射日志路径到[emptydir][lnk-emptydir]。如此，可避免程序受限与所在node主机存储限制。

## 如何保障服务健壮性？
- 给pod加上健康检查(liveness、readiness、startup)：
  - liveness: 用于提供给k8s判断pod应当存活
    - 生命周期决策: 若不存活，将被集群移除，并(按照预设分数)重新拉起；
  - readiness: 用于提供给k8s判断该pod是否就绪
    - 接入流量决策: 若未就绪，不会有流量到达该pod;
    - (能有效防止，在上线/重启过程，发生504错误)
  - startup: 用于启动*时间较长*的pod
    - liveness可以使用探测端口是否可达或者判断程序是否存活的形式。保证启动的过程中不会被k8s快速杀掉。例如：`[ -z "\`ps -p 1 | awk 'NR>1 {print $0}'\`" ] && exit 1`
    - 使用readiness来确保服务启动之后才导入流量。比如，curl业务接口，确保只有服务准备好之后才能有流量进来
  - 具体可选方法:
    - httpGet.{path, port}: HTTP协议，提供待测路径、端口;
    - tcpSocket.port: 提供，待检测端口
    - exec.command: 提供可执行工具, 可发起自定义检测
  - 参考：[liveness-readiness-startup-probes][lnk-liveness]
- ==Pod关闭==前保证服务流量正确处理：
  - 参考：[实现优雅关闭][lnk-shutdown-gracefully] <i class="fa fa-arrow-left fa-lg"></i>
- ToC业务务必加上[hpa][lnk-hpa]以应对流量爆发或运营活动。
- 资源策略：cpu、内存的request/limit，记为`[cpu_req, cpu_lim)`、`[mem_req, mem_lim)`。参考: [manage-compute-resources-container][lnk-resource-quota]
    - HPA依赖服务的cpu和内存指标进行扩/缩容；
    - 配置request/limit有利于k8s的合理、高效调度；
    - 高IO型应用，应当把内存比cpu比例设置在4:1\~8:1；计算密集型应用应当设置在2:1\~4:1
    - `cpu=10` 和 `cpu=10m` 的区别！内存：Mi、Gi
    - 例如，网关服务配置: cpu_req=1000m, cpu_lim=2000m。我们配置hpa: targetCPUUtilizationPercentage=60，那么当pod的cpu从1000m上升到1600m时，k8s会调大pod份数直到：每个pod的cpu<=1600m或者该deploy的总副本数达到maxReplicas

> liveness如果使用的shell来判断进程是否存活，务必使用在command最开始加上'sh -c'。例如：`command: ["sh", "-c", "sleep 120; /app/main --stop"]`

## 如何对集群进行调优？
> **TODO**
> 列举：手段、涵盖事项
> (点到即止，若需展开，另起问题)
> [color=red]

## 如何搭有状态集群？
- 优先使用现有helm内提供的模板来搭建类似 etcd/zk/kafka 集群：
- 阿里云集群可以使用自动创建云盘的策略[有状态服务-动态云盘使用最佳实践][lnk-aliyun-disk]

[lnk-shutdown-gracefully]: gracefully-terminate "优雅关闭"
[lnk-liveness]: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/ "liveness-readiness-startup-probes"
[lnk-hpa]: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/ "hpa"
[lnk-resource-quota]: https://kubernetes.io/zh/docs/concepts/configuration/manage-compute-resources-container/ "resource-quota"
[lnk-affinity]: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/#an-example-of-a-pod-that-uses-pod-affinity "affinity"
[lnk-emptydir]: https://kubernetes.io/zh/docs/concepts/storage/volumes/#emptydir "emptydir"
[lnk-kube-basic]: https://kubernetes.io/docs/tutorials/kubernetes-basics/ "基础知识"
[lnk-kube-online]: https://kubernetes.io/docs/tutorials/kubernetes-basics/create-cluster/cluster-interactive/ "K8S在线互动"

[lnk-aliyun-disk]: https://help.aliyun.com/document_detail/100457.html