title: Docker notes
date: 2019-01-29 17:55:44
category: docker
tags:
  - docker
  - notes
  
---
# 重写docker镜像内的EntryPoint
```shell
docker run --entrypoint "/bin/ls -al /root" debian

```

