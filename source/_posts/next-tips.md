title: next主题的一些配置 
date: 2019-02-14 15:40:00
updated: 2019-02-14 15:40:00
category: hexo
tags:
 - hexo
 - next
 - theme
 - tips
---
> 在使用next主题过程中遇到一些问题，供大家参考。

<!-- more -->
# 中文问题
## 原因
站点内将language设置为`zh-Hans`，但是博客的语言并没有被改变为中文，原因是next主题使用`zh-CN.yml`配置跟`site`的配置不一致。
## 解决办法
创建一个软链即可
```shell
cd $THEME_FOLDER/languages
ln -s zh-CN.yml zh-Hans.yml
```
# 版权申明
现在是需要配置`creative_commons`节点：
```yaml
# Creative Commons 4.0 International License.
# https://creativecommons.org/share-your-work/licensing-types-examples
# Available values: by | by-nc | by-nc-nd | by-nc-sa | by-nd | by-sa | zero
creative_commons:
  license: by-nc-sa
  sidebar: true # 显示在sidebar里面，可选
  post: true # 显示在post底部
```

