title: 运维笔记：一次kubernetes内偶发超时的问题
tags:
  - curl
  - timeout
  - kubernetes
  - go
  - dns
  - kube-dns
  - coredns
  - httpclient
  - awaiting headers
categories:
  - kubernetes
  - 运维笔记
  - ''
author: blademainer
date: 2019-03-10 01:57:00
---
![upload successful](/images/pasted-5.png)
> 一次kubernetes内的pod（go程序）连接外网域名偶发超时问题。
<!-- more -->

# 问题

最近线上有个机房突然出现超时预警，原因是零星的报微信、支付宝连接超时。刚开始以为是机房的网络故障，就没有深究。

过去一天，现象还是继续。没办法，大概率不是机房问题，需要深入解决。


# 修复
先看了下日志，是go报`net/http: request canceled (Client.Timeout exceeded while awaiting headers)"`错误，证明是连接阶段超时，而不是等待响应阶段超时，错误应当是在建立连接阶段时出现的。于是，可以缩小问题范围：
1. 可能是解析dns超时
2. 可能是连接某个ip超时

直接修改go代码来看定位是哪个问题比较麻烦，于是直接使用curl来确认问题。首先创建一个带`curl`功能的busybox pod:
```bash
kubectl run --rm -it busybox --image sequenceiq/busybox --restart=Never
```
然后执行curl调试:
```bash
tee curl-format.txt <<- 'EOF'
time_namelookup: %{time_namelookup}\n
time_connect: %{time_connect}\n
time_appconnect: %{time_appconnect}\n
time_redirect: %{time_redirect}\n
time_pretransfer: %{time_pretransfer}\n
time_starttransfer: %{time_starttransfer}\n
----------\n
time_total: %{time_total}\n\n
EOF

DOMAIN="api2.mch.weixin.qq.com"
curl -w '@curl-format.txt' $DOMAIN
```
发现curl也会偶尔连接超时
![upload successful](/images/pasted-1.png)

于是可以确认是dns解析的问题，给应用pod配上host之后问题也得到改善。

我们的k8s集群是使用的kube-dns作为dns解析，于是看下[CoreDNS](https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/)的日志：
```bash
kubectl -n kube-system logs -l k8s-app=kube-dns
```
存在有比较多的异常，都是连接相同一个IP：`xx.xx.xx.6`连接超时
![upload successful](/images/pasted-3.png)
咨询过运维之后发现，该IP：`xx.xx.xx.6`是一个错误配置，该IP实际是不存在的。

# 修复
待运维修改CoreDNS的configmap之后，问题得到解决。

# 总结
1. go是没有dns缓存的，比较依赖主机/环境的dns解析缓存。如果要做到可靠的话建议自己加缓存。
2. kubernetes基础组件的配置变更要细致，且做好监控。

# 参考
- [go-http-issues](https://github.com/golang/go/issues/16094)
- [proposal-go-dns-cache](https://github.com/golang/go/issues/24796)
- [go-dns-cache](https://stackoverflow.com/questions/40251727/does-go-cache-dns-lookups)
- [CoreDNS](https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/)
- [kube-dns](https://kubernetes.io/zh/docs/tasks/administer-cluster/dns-custom-nameservers/)
- [use-curl-to-analyze-request](http://cizixs.com/2017/04/11/use-curl-to-analyze-request/)