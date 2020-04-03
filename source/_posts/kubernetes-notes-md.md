title: kubernetes-notes
date: 2019-01-26
updated: 2019-01-26
category: kuberbetes
tags:
  - kubernetes
  - notes
---
Kubernetes笔记

<!--more-->

# 导出现有的资源
```bash
for n in $(kubectl get -o=name pvc,configmap,serviceaccount,secret,ingress,service,deployment,statefulset,hpa,job,cronjob)
do
    mkdir -p $(dirname $n)
    kubectl get -o=yaml --export $n > $n.yaml
done
```
# 热更新deploy
有时候我们修改了ConfigMap，但是代码不支持，肯定不能让程序停止，因此必须支持热更新。命令如下：
```bash
kubectl patch deployment [deploy] --patch '{"spec": {"template": {"metadata": {"annotations": {"version/config": "'`date +%Y%m%d%H%M%S`'" }}}}}'
```

# 拷贝secrets到其他namespace
```bash
kubectl get secret gitlab-registry --namespace=revsys-com --export -o yaml |\
   kubectl apply --namespace=devspectrum-dev -f -
```
# 临时运行一个pod
- `--restart=Never` 代表起一个pod
- `--rm` 在终端退出时删除pod
- `-l` 给pod打label

```bash
kubectl run --rm -it busybox --image sequenceiq/busybox --restart=Never
kubectl run --rm -it mysql-client --image=mysql -l "net=grant-db" --restart=Never bash
```



# 获取pod信息
```bash
      env:
        - name: MY_NODE_NAME
          valueFrom:
            fieldRef:
              fieldPath: spec.nodeName
        - name: MY_POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: MY_POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: MY_POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        - name: MY_POD_SERVICE_ACCOUNT
          valueFrom:
            fieldRef:
              fieldPath: spec.serviceAccountName
```

# Scratch Debugger

This is a tool to make debugging containers based on scratch easier. The script
works by bringing up a pod with a statically-linked busybox image on the same
node as the debug target, mounting the node's root filesystem, and calling
docker directly to copy busybox into the target container. Once the "install" is
complete, the target can be debugged through a standard kubectl exec.

## Usage

```bash
curl https://raw.githubusercontent.com/kubernetes/contrib/master/scratch-debugger/debug.sh | sh -s -- POD_NAME [-n POD_NAMESPACE -c CONTAINER_NAME]
```

- `POD_NAME` - The name of the pod to debug.
- `POD_NAMESPACE` - The namespace of the target pod (defaults to `default`).
- `CONTAINER_NAME` - The name of the container in the pod to debug (defaults to the first container).

Additionally, the following environment variables can be set:

- `TMP_SUBDIR` - The subdirectory under `/tmp` to install busybox into (defaults to `debug-tools`).
- `KUBECONTEXT` - The kubectl context to use (defaults to current context).
- `DEBUGGER_NAME` - The name to use for the debug pod (defaults to `debugger`).
- `ARCH` - The architecture Kubernetes is running on (defaults to `amd64`).
- `DOCKER_DOWNLOAD_URL` - URL for downloading the docker release `.tgz` file
  (see `debug.sh` for the default value).

## Example

Create a simple `pause` pod, which is based off a scratch image and does nothing.
```bash
$ kubectl create -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name:   pause
spec:
  containers:
    - name:    pause
      image: k8s.gcr.io/pause
EOF

pod "pause" created
```

Note that we cannot simply exec into the pod, since there isn't a shell or any
other interactive tools available:
```bash
$ kubectl exec -i -t pause -- sh
rpc error: code = 2 desc = "oci runtime error: exec failed: exec: \"sh\": executable file not found in $PATH"
```

So we use the `debug.sh` script to copy busybox (which includes many common
tools) into the container:
```bash
$ scratch-debugger/debug.sh pause
Debug Target Container:
  Pod:          pause
  Namespace:    default
  Node:         e2e-test-stclair-minion-group-phj6
  Container:    pause
  Container ID: 80b134ab6550d34684cdb31e4300ff128f9f43f67fdb3d271372f9417e546737
  Runtime:      docker

Installing busybox to /tmp/debug-tools ...
pod "debugger" created
waiting for debugger pod to become ready...
Installation complete.
To debug pause, run:
    kubectl exec -i -t pause -- /tmp/debug-tools/sh -c 'PATH=$PATH:/tmp/debug-tools sh'
Dumping you into the pod container now.

/ # ls
dev    etc    pause  proc   sys    tmp    var
/ # echo Hello world!
Hello world!
/ # exit
pod "debugger" deleted
```

The script automatically execs into the pod and starts a shell (`ash`) with the
`PATH` variable set to include the debug tools. After exiting, the tools are
still present in the pod, and we can simply exec back in using the command the
script gave us:

```bash
$ kubectl exec -i -t pause -- /tmp/debug-tools/sh -c 'PATH=$PATH:/tmp/debug-tools sh'
/ # which sh
/tmp/debug-tools/sh
/ # exit
```

Alternatively, we can just call the `debug.sh` script again:
```bash
$ scratch-debugger/debug.sh pause
Debug tools already installed. Dumping you into the pod container now.
/ # exit
```

Once we've finished debugging, it's a good practice to delete the "tainted"
pod. If that is undesirable for some reason, you can simply delete the tools
from the container:
```bash
$ kubectl exec pause -- /tmp/debug-tools/rm -r /tmp/debug-tools
```

# mysql-operator
简化在kubernetes内创建mysql集群(支持MySQL Group Replication)
[github](https://github.com/oracle/mysql-operator/blob/master/docs/tutorial.md)

