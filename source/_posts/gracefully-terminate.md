title: k8s优雅关闭
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

# 如何保障服务健壮性 之 实现优雅关闭

## 必要性

1. 没有graceful的关闭将导致请求连接异常；
2. 数据统计短时间内出现大量错误；

## 实现

### 两类信号

`SIGTERM`：通知进程进行graceful信号；

`SIGKILL`：硬终止信息；

### k8s中关闭pod时的流程

https://kubernetes.io/docs/concepts/workloads/pods/pod/#termination-of-pods

简而言之就是：

1. 先把pod标记为Terminating，此时service就会把该pod去除了；
2. 发送SIGTERM给pod内的所有容器；
3. pod等待grace period结束或者pod提前处理完SIGTERM；
4. pod发送SIGKILL给所有容器；

### 确保信号正确传递到进程

#### CMD的坑

```
CMD myapp
```

相当于：

```
/bin/sh -c myapp
```

以上的写法，容器接收到信号的进程是`/bin/sh`而不是`myapp`，这种写法会依赖于真正使用的shell，有些shell是不会传递信号给子进程的。比如基础镜像使用的是Alpine Linux下的基础shell就不会，但是bash就可以。

#### 使用EXEC的方式

```
CMD ["myapp"]
```

上面的方式将会直接执行`myapp`，但是这种就不能把环境变量当做参数传递了？？？

#### base方式

```
CMD ["/bin/bash", "-c", "myapp --arg=$ENV_VAR"]
```

解决以上问题。

### k8s支持的几种方式

#### 1、yaml中修改

```
terminationGracePeriodSeconds: 60
```

#### 2、delete命令

```
kubectl delete pod-name --grace-peroid=60
```

#### 3、preStop Hook

```
lifecycle:
  preStop:
    exec:
      # SIGTERM triggers a quick exit; gracefully terminate instead
      command: ["/usr/sbin/nginx","-s","quit"]
```

#### 4、validating webhook

指到资源清理完成才返回true，否则返回false，这样pod就能保证清理完才推出，而不会因为grace peroid被强制清除。

### 程序支持（最重要）

#### 思路

1. 首先关闭所有的监听，如果有使用服务注册之类的话，应该也把该服务从注册中去除；
2. 然后关闭所有的空闲连接；
3. 然后无限期等待连接处理完毕转为空闲，并关闭；
4. 如果提供了带有超时的Context，将在服务关闭前返回Context的超时错误；

#### http

go http的server.Shutdown

> 如果你的服务是被其他服务调用的，那么关闭会比较复杂，

1. 约定调用者的keep-alive timeout 时间，默认为30秒 
2. 服务关闭时，先设置 keep-alive 为 false
3. 服务关闭时，再等待30秒
4. 再调用server.Shutdown



#### tcp

```
	cmdAddr, _ := net.ResolveTCPAddr("tcp", n.cfg.Addr)
	lcmd, err := net.ListenTCP("tcp", cmdAddr)
	if err != nil {
		log.Fatalln(err)
	}
	defer lcmd.Close()
	quitChan := make(chan os.Signal, 1)
	signal.Notify(quitChan, os.Interrupt, os.Kill, syscall.SIGTERM)
	wg := sync.WaitGroup{}
	for {
		select {
		case <-quitChan:
			lcmd.Close()
			wg.Wait()
			return
		default:
		}
		lcmd.SetDeadline(time.Now().Add(1e9))
		conn, err := lcmd.AcceptTCP()
		if opErr, ok := err.(*net.OpError); ok && opErr.Timeout() {
			continue
		}
		if err != nil {
			log.WithError(err).Errorln("Listener accept")
			continue
		}
		wg.Add(1)
		go func(){
			wg.Done()
			n.handleRequest(conn)
		}
		
  }
```