title: 在docker内运行java的问题
date: 2017-04-06 17:09:19
tags: 
 - docker
 - java
---
> 众所周知，当我们执行没有任何调优参数（如`java -jar myapplication.jar`）的 Java 应用程序时，JVM 会自动调整几个参数，以便在执行环境中具有最佳性能。但是许多开发者发现，如果让 JVM ergonomics (即JVM人体工程学，用于自动选择和行为调整)对垃圾收集器、堆大小和运行编译器使用默认设置值，运行在Linux容器（docker,rkt,runC,lxcfs 等）中的 Java 进程会与我们的预期表现严重不符。

本篇文章采用简单的方法来向开发人员展示在 Linux 容器中打包 Java 应用程序时应该知道什么。

<!--more-->

# 存在的问题
我们往往把容器当虚拟机，让它定义一些虚拟 CPU 和虚拟内存。其实容器更像是一种隔离机制：它可以让一个进程中的资源（CPU，内存，文件系统，网络等）与另一个进程中的资源完全隔离。Linux 内核中的 cgroups 功能用于实现这种隔离。
然而，一些从执行环境收集信息的应用程序已经在 cgroups 存在之前就被执行了。“top”，“free”，“ps”，甚至 JVM 等工具都没有针对在容器内执行高度受限的 Linux 进程进行优化。
## 场景还原
实验采用的是本人编写的测试代码。代码很简单，就是不断的创建byte数组并保存到list里面。代码所在项目：
[blademainer/java-memory-demo](https://github.com/blademainer/java-memory-demo)
运行步骤：
1. 首先使用docker运行java的测试镜像，并限制其最大可用的内存为`64M`
```bash
docker run --name java-memory-demo --memory-swap=0 --memory-swappiness=0 -m 64m -e JAVA_OPTIONS="-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/jvmdump/" -v `pwd`/jvmdump:/jvmdump -d blademainer/java-memory-demo
```
> JAVA_OPTIONS="-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/jvmdump/" 的作用是：在JVM报oom时dump出堆信息。

2. 另起一个终端，监听镜像的事件:
```bash
docker events -f image=blademainer/java-memory-demo
```

运行一段时间后，java容器会被杀死，运行日志如下：
```bash
------------------------------------------
MaxMemory: 3.46G
FreeMemory: 197.48M
TotalMemory: 240.0M
Usable: 3.42G
------------------------------------------
Name: Code Cache
PeakUsage: init = 2555904(2.44M) used = 1242176(1.18M) committed = 2555904(2.44M) max = 251658240(240.0M)
------------------------------------------
Name: Metaspace
PeakUsage: init = 0(0) used = 3276728(3.12M) committed = 4980736(4.75M) max = -1(-1)
------------------------------------------
Name: Compressed Class Space
PeakUsage: init = 0(0) used = 345832(337.73K) committed = 524288(512.0K) max = 1073741824(1.0G)
------------------------------------------
Name: PS Eden Space
CollectionUsage: init = 66060288(63.0M) used = 0(0) committed = 0(0) max = 1371537408(1.28G)
CollectionUsageThreshold: 0
CollectionUsageThresholdCount: 0
PeakUsage: init = 66060288(63.0M) used = 44585544(42.52M) committed = 66060288(63.0M) max = 1371537408(1.28G)
------------------------------------------
Name: PS Survivor Space
CollectionUsage: init = 10485760(10.0M) used = 0(0) committed = 0(0) max = 10485760(10.0M)
CollectionUsageThreshold: 0
CollectionUsageThresholdCount: 0
PeakUsage: init = 10485760(10.0M) used = 0(0) committed = 10485760(10.0M) max = 10485760(10.0M)
------------------------------------------
Name: PS Old Gen
CollectionUsage: init = 175112192(167.0M) used = 0(0) committed = 0(0) max = 2785017856(2.59G)
CollectionUsageThreshold: 0
CollectionUsageThresholdCount: 0
PeakUsage: init = 175112192(167.0M) used = 0(0) committed = 175112192(167.0M) max = 2785017856(2.59G)
------------------------------------------
PS Scavenge
CollectionCount: 0
CollectionTime: 0ms
------------------------------------------
PS MarkSweep
CollectionCount: 0
CollectionTime: 0ms
Allocating memory: 10485760
Killed
```
# 原因分析
## 事件分析
第二步`docker events -f image=blademainer/java-memory-demo`事件监听输出如下：
```bash
2017-04-29T23:01:24.753731857+08:00 container create 92f98a1773549572cf8c3435350a6d1a885196884e957b35b5e1fa572e617a3b (image=blademainer/java-memory-demo, name=java-memory-demo)
2017-04-29T23:01:24.948240973+08:00 container start 92f98a1773549572cf8c3435350a6d1a885196884e957b35b5e1fa572e617a3b (image=blademainer/java-memory-demo, name=java-memory-demo)
2017-04-29T23:01:25.015361538+08:00 container oom 92f98a1773549572cf8c3435350a6d1a885196884e957b35b5e1fa572e617a3b (image=blademainer/java-memory-demo, name=java-memory-demo)
2017-04-29T23:01:25.092596145+08:00 container die 92f98a1773549572cf8c3435350a6d1a885196884e957b35b5e1fa572e617a3b (exitCode=137, image=blademainer/java-memory-demo, name=java-memory-demo)
```
输出内容的第四行有个致命的报错`container oom`导致java程序直接退出。或者使用`docker inspect java-memory-demo`也能看到错误信息以及状态:
```json
"State": {
            "Status": "exited",
            "Running": false,
            "Paused": false,
            "Restarting": false,
            "OOMKilled": true,
            "Dead": false,
            "Pid": 0,
            "ExitCode": 137,
            "Error": "",
            "StartedAt": "2017-04-29T15:01:24.940805854Z",
            "FinishedAt": "2017-04-29T15:01:25.092588915Z"
        }
```
docker直接杀掉了java容器，此时的退出前的java程序不会报任何错误信息也不会打印错误堆栈、调用shutdownHook等。`jvmdump`也不会有dump的文件输出：
{% qnimg post/run-java-in-docker-1.png }

## 原因分析
按道理JVM会自动根据当前系统的可用内存来自动分配JVM的内存大小，那么JVM分配的内存应该不大于`64M`，然而我们的java程序输出日志如下：
```
MaxMemory: 3.46G
FreeMemory: 207.48M
TotalMemory: 240.0M
Usable: 3.43G
```
`MaxMemory: 3.46G`代表最大可用内存为`3.46G`，明显不是我们期望的结果。JVM之所以`不知道`他所在的环境是被限制了内存大小的，是因为docker采用[cgroup](http://www.infoq.com/cn/articles/docker-kernel-knowledge-cgroups-resource-isolation)技术来限制资源的，而JVM无法感知该限制，导致JVM根据宿主机器的最大内存来分配可用内存。

# 解决方案
## 使用启动参数来限制容器内JVM的内存
```bash
docker run --name java-memory-demo --memory-swap=0 --memory-swappiness=0 -m 256m -e JAVA_OPTIONS="-Xmx128m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/jvmdump/" -v `pwd`/jvmdump:/jvmdump -d blademainer/java-memory-demo
```
> `JAVA_OPTIONS`增加了`-Xmx128m`

JVM正确的打印了异常日志日志、调用了ShutdownHook以及正确的输出了HeapDumpPath
{% qnimg post/run-java-in-docker-2.png }

## 使用可以识别`cgroup`限制的`JVM`
- [jdk9](http://hg.openjdk.java.net/jdk9/jdk9/hotspot/rev/5f1d1df0ea49)
- [fabric8/java-jboss-openjdk8-jdk](https://hub.docker.com/r/fabric8/java-jboss-openjdk8-jdk/)

# Tomcat容器的运行
运行时使用`JAVA_OPTS`环境变量：
```bash
docker run --memory-swap=0 --memory-swappiness=0 -m 256m -e JAVA_OPTS="-Xmx128m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/jvmdump/" -v `pwd`/jvmdump:/jvmdump tomcat
```


# 参考
- [java-inside-docker](https://developers.redhat.com/blog/2017/03/14/java-inside-docker/)
- [gc-ergonomics](http://docs.oracle.com/javase/1.5.0/docs/guide/vm/gc-ergonomics.html)
