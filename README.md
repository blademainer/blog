[![Build Status](https://travis-ci.org/blademainer/blog.svg)](https://travis-ci.org/blademainer/blog)

# 快速启动
./server.sh

# 使用镜像启动hexo
```shell
docker run --rm -p 4000:4000 -p 3000:3000 -it -w /app -v `pwd`:/app blademainer/hexo:v1.0.2 hexo server
```


# 安装hexo
利用 npm 命令即可安装。（在任意位置点击鼠标右键，选择Git bash）
>npm install -g hexo

# 初始化hexo（如果是第一次）
>hexo init

# 安装依赖包
>hexo install 

# 本地查看
现在我们已经搭建起本地的hexo博客了，执行以下命令(在H:\hexo)，然后到浏览器输入localhost:4000看看。
>hexo generate
>hexo server

# 部署
>hexo d -g

# 优化
## 安装插件 [源地址](https://github.com/FlashSoft/hexo-console-optimize)
>npm install -s hexo-console-optimize
##优化资源：HTML、CSS、JS、Image
>hexo optimize
##别名
>hexo o
## 优化并部署
>hexo o -d


# 其他
删除老文件
>hexo clean


