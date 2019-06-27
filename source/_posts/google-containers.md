title: gcr.io镜像：解决kubernetes镜像无法访问的问题
date: 2019-01-29 19:12:46
category: docker
tags:
  - docker
  - image
  - google
  - containers
  - kubernetes
  - k8s
  - forbid
  - shell
  - gcr
  - io
  - mirror
---

# kubernetes镜像（gcr.io）无法访问的问题
> 经常会遇到`gcr.io/google_containers`被墙的问题，可以使用：https://hub.docker.com/u/googlecontainer

<!-- more -->
# 使用方法
将`gcr.io/google_containers/$repo`替换为`googlecontainer/$repo`，例如需要使用`gcr.io/google_containers/kubernetes-dashboard-amd64`镜像，则使用`googlecontainer/kubernetes-dashboard-amd64`即可。
> docker pull googlecontainer/kubernetes-dashboard-amd64 # for docker
> kubeadm init --image-repository googlecontainer # for kubernetes

# 原理
travis-ci安装[gcloud](https://cloud.google.com/solutions/continuous-delivery-with-travis-ci)并授权，然后利用travis-ci的网络来拉取google_containers镜像，并将镜像push到docker仓库。每天定时出发travis来拉取google_containers的更新。

1. 使用`gcloud`命令列列举`gcr.io/google_containers`下的所有镜像repo
2. 遍历第1步的repo，获取该repo的所有`tag`，然后对比[gcr-complete-tasks](https://github.com/blademainer/google_containers_mirror_completed_list/blob/master/gcr-complete-tasks)，如果该tag已经被同步，则跳过
3. 拉取`gcr.io/google_containers/$repo:$tag`的镜像：`image`。如果`$image`已经在[gcr-complete-images](https://github.com/blademainer/google_containers_mirror_completed_list/blob/master/gcr-complete-images)内存在，则跳过。
4. 修改`$image`的repo和tag，打docker tag为`googlecontainer/$repo:$tag`，并push到`googlecontainer$repo:$tag`
5. 重复2-4步，直到所有`$repo`都已经同步

# 优点
- 不需要自己vps
- 不需要搭梯子
- 理论镜像的延迟时间是24H，比较实时
- 全自动检测新镜像，不需要人为参与

# 缺点
- ~~比较依赖git来存储进度，造成git的commit log非常大~~（已经解决，通过使用travis-ci的cache解决）
- 有被travis封禁的风险（每次限制存储量和任务量）
- ~~新增owner（目前owner=google_containers）时无法检测~~（已经解决，使用[owners](https://github.com/blademainer/google_containers_mirror/blob/master/owners)文件来新增owner。如需增加，请留言或者提交Pull request。）

# 代码
https://github.com/blademainer/google_containers_mirror

