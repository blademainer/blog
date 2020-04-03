title: 在docker内运行docker命令
date: 2017-03-23 17:09:19
updated: 2017-03-23 17:09:19
category: docker
tags: 
 - docker in docker
 - docker
 - jenkins
---
我们的项目里面经常需要使用jenkins来编译docker，然后jenkins本身就是docker运行起来的，因此编译docker镜像就无法进行。通过调查发现：可以通过映射宿主机器的docker来达到运行的目的。
命令如下：
```bash
docker run -it --rm \
    --privileged=true \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /var/run/docker:/var/run/docker \
    -v /usr/bin/docker:/usr/bin/docker \
    --group-add=$(stat -c %g /var/run/docker.sock) \
    -v /etc/localtime:/etc/localtime:ro \
    jenkins docker ps
```
CentOS7
```bash
docker run --rm \
    -it \
    -u root \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v $(which docker):/usr/bin/docker:ro \
    -v /usr/lib64/libsystemd-journal.so.0:/usr/lib/x86_64-linux-gnu/libsystemd-journal.so.0 \
    -v /usr/lib64/libsystemd-id128.so.0:/usr/lib/x86_64-linux-gnu/libsystemd-id128.so.0 \
    -v /usr/lib64/libdevmapper.so.1.02:/usr/lib/x86_64-linux-gnu/libdevmapper.so.1.02 \
    -v /usr/lib64/libgcrypt.so.11:/usr/lib/x86_64-linux-gnu/libgcrypt.so.11 \
    -v /usr/lib64/libdw.so.1:/usr/lib/x86_64-linux-gnu/libdw.so.1 \
    -v /usr/lib64/libltdl.so.7:/usr/lib/x86_64-linux-gnu/libltdl.so.7 \
    jenkins docker ps
```
