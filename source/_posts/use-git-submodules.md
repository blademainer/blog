title: hexo使用git子模块来管理theme
date: 2019-02-01 12:09:19
category: git
tags:
 - hexo
 - git
 - blog
 - submodule
---
我们的博客可能面临评论系统不可用、分享插件不可用、主题升级的问题。

如果你是直接把代码copy到你的博客目录里面，那么你想修复这些问题，就会代码灾难性的后果。

使用git submodule能很好解决这个问题。
<!-- more -->

我们需要对主题进行单独的管理，使其成为博客的一个独立部件，而这就是使用 git submodule 的最佳场景。步骤如下：

    1. Fork 一份主题到自己的 Github 上。
    > Fork 的目的在于，我们可以对主题进行各种个性化的定制以及修改，并对这些定制进行版本控制。同时，我们还能随时与原主题的更新进行合并。
    2. 创建一个 submodule。
    ```shell
    $ cd blog-hexo // 切换到hexo目录
    $ git submodule add https://github.com/pinggod/hexo-theme-apollo themes/apollo
    ```
    3. 更新 _config.yml 使用修改过的主题。
    ```shell
    theme: apollo
    ```
    4. 这时，我们就拥有了两个独立的仓库，一个是 hexo 博客，另外一个是主题。
    ```shell
    $ cd blog-hexo
    $ git submodule
    # 6c40f5ec27e1889c5a0a0a999e847634a33aef1c themes/apollo (heads/master)
    ```
    并且，在 github 上也可以看到它指向了正确的地址。

使用 submodule 配置好之后，在不同电脑间进行同步就非常简单了：

```shell
$ cd blog-hexo
$ git pull
$ git submodule update
```

就算是一台全新的电脑，也可以很轻松地进行配置：

```shell
$ git clone https://github.com/buginux/swiftyper-blog.git
$ cd swiftyper-blog
$ npm install
$ git submodule update --init
```
使用几行代码就能配置一个博客，是不是感觉相当酷炫。而这其中的便利都是拜 Git 及 Github 所赐，这也是我为何如此喜欢它们的原因。

当然，使用这种方法也有缺点，那就是当原主题更新的时候，我们需要进行手动拉取对方的最新代码，并合并到自己的代码中，而且由于我们修改过主题，所以合并的过程中可能会出现冲突，这就需要我们进行手动解决了。不过总体来说，如果我们选择的是一个比较稳定的主题，出现这种情况的机率还是比较小的，相对于 submodule 的便利，这点付出还是值得的。

# 参考
- [www.swiftyper.com](http://www.swiftyper.com/2017/07/25/managing-hexo-theme-using-submodule/)
- [Git-Tools-Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)