title: k8s优雅关闭
author: blademainer
tags:
  - k8s
  - go
  - gracefully
  - terminate
categories:
  - cloud
date: 2020-03-25
updated: 2020-04-03
---

![](/images/gracefully.jpeg)

k8s如何保障服务健壮性 之 实现优雅关闭
<!-- more -->


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

```bash
CMD myapp
```

相当于：

```bash
/bin/sh -c myapp
```

以上的写法，容器接收到信号的进程是`/bin/sh`而不是`myapp`，这种写法会依赖于真正使用的shell，有些shell是不会传递信号给子进程的。比如基础镜像使用的是Alpine Linux下的基础shell就不会，但是bash就可以。

#### 使用EXEC的方式

```yaml
CMD ["myapp"]
```

上面的方式将会直接执行`myapp`，但是这种就不能把环境变量当做参数传递了？？？

#### base方式

```yaml
CMD ["/bin/bash", "-c", "myapp --arg=$ENV_VAR"]
```

解决以上问题。

### k8s支持的几种方式

#### 1、yaml中修改

```yaml
terminationGracePeriodSeconds: 60
```

#### 2、delete命令

```bash
kubectl delete pod-name --grace-peroid=60
```

#### 3、preStop Hook

```yaml
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

#### grpc

```go
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	_ "net/http/pprof"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/blademainer/commons/pkg/logger"

	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc"
	pb "google.golang.org/grpc/examples/helloworld/helloworld"
	"google.golang.org/grpc/health"
	healthpb "google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/grpc/keepalive"
)

const serviceName = "myserviced"

var (
	version = "no version"

	debugPort  = flag.Int("debugPort", 16161, "debug port")
	httpPort   = flag.Int("httpPort", 8888, "http port")
	grpcPort   = flag.Int("grpcPort", 9200, "grpc port")
	healthPort = flag.Int("healthPort", 6666, "grpc health port")
)

type server struct {
}

func (s *server) SayHello(ctx context.Context, in *pb.HelloRequest) (*pb.HelloReply, error) {
	log.Printf("Received: %v", in.GetName())
	return &pb.HelloReply{Message: "Hello " + in.GetName()}, nil
}

func main() {
	flag.Parse()

	logger.Infof("Starting app, version: %v", version)

	// shutdown functions
	shutdownFunctions := make([]func(context.Context), 0)


	ctx, cancel := context.WithCancel(context.Background())
	shutdownFunctions = append(shutdownFunctions, func(ctx context.Context) {
		cancel()
	})
	defer cancel()

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(interrupt)

	g, ctx := errgroup.WithContext(ctx)

	g.Go(func() error {
		//profiles := pprof.Profiles()

		httpServer := &http.Server{
			Addr:         fmt.Sprintf(":%d", *debugPort),
			ReadTimeout:  10 * time.Second,
			WriteTimeout: 10 * time.Second,
			Handler:      nil,
		}
		shutdownFunctions = append(shutdownFunctions, func(ctx context.Context) {
			err := httpServer.Shutdown(ctx)
			if err != nil {
				logger.Errorf("failed to shutdown pprof server! error: %v", err.Error())
			}
		})

		logger.Infof("pprof server serving at :%d", *debugPort)

		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Errorf("failed to listen: %v", err.Error())
			return err
		}
		return nil
	})

	// web server metrics
	g.Go(func() error {
		httpServer := &http.Server{
			Addr:         fmt.Sprintf(":%d", *httpPort),
			ReadTimeout:  10 * time.Second,
			WriteTimeout: 10 * time.Second,
		}
		shutdownFunctions = append(shutdownFunctions, func(ctx context.Context) {
			err := httpServer.Shutdown(ctx)
			if err != nil {
				logger.Errorf("failed to shutdown pprof server! error: %v", err.Error())
			}
		})
		logger.Infof("HTTP Metrics server serving at :%d", *httpPort)

		if err := httpServer.ListenAndServe(); err != http.ErrServerClosed {
			return err
		}

		return nil
	})

	// gRPC Health Server
	healthServer := health.NewServer()
	g.Go(func() error {
		grpcHealthServer := grpc.NewServer()

		shutdownFunctions = append(shutdownFunctions, func(ctx context.Context) {
			healthServer.SetServingStatus(fmt.Sprintf("grpc.health.v1.%s", serviceName), healthpb.HealthCheckResponse_NOT_SERVING)
			grpcHealthServer.GracefulStop()
		})

		healthpb.RegisterHealthServer(grpcHealthServer, healthServer)

		haddr := fmt.Sprintf(":%d", *healthPort)
		hln, err := net.Listen("tcp", haddr)
		if err != nil {
			logger.Errorf("gRPC Health server: failed to listen, error: %v", err)
			os.Exit(2)
		}
		logger.Infof("gRPC health server serving at %s", haddr)
		return grpcHealthServer.Serve(hln)
	})

	// gRPC server
	g.Go(func() error {
		addr := fmt.Sprintf(":%d", *grpcPort)
		ln, err := net.Listen("tcp", addr)
		if err != nil {
			logger.Errorf("gRPC server: failed to listen, error: %v", err)
			os.Exit(2)
		}

		server := &server{
		}
		grpcServer := grpc.NewServer(
			// MaxConnectionAge is just to avoid long connection, to facilitate load balancing
			// MaxConnectionAgeGrace will torn them, default to infinity
			grpc.KeepaliveParams(keepalive.ServerParameters{MaxConnectionAge: 2 * time.Minute}),
		)
		pb.RegisterGreeterServer(grpcServer, server)
		shutdownFunctions = append(shutdownFunctions, func(ctx context.Context) {
			healthServer.SetServingStatus(fmt.Sprintf("grpc.health.v1.%s", serviceName), healthpb.HealthCheckResponse_NOT_SERVING)
			grpcServer.GracefulStop()
		})

		logger.Infof("gRPC server serving at %s", addr)

		healthServer.SetServingStatus(fmt.Sprintf("grpc.health.v1.%s", serviceName), healthpb.HealthCheckResponse_SERVING)

		return grpcServer.Serve(ln)
	})

	select {
	case <-interrupt:
		break
	case <-ctx.Done():
		break
	}

	logger.Warnf("received shutdown signal")

	// 创建一个新的Context，等待各个服务释放资源
	timeout, cancelFunc := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelFunc()
	for _, shutdown := range shutdownFunctions {
		shutdown(timeout)
	}

	err := g.Wait()
	if err != nil {
		logger.Errorf("server returning an error, error: %v", err)
		os.Exit(2)
	}
}

```

#### tcp

```go
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
