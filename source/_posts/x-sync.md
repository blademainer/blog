title: 星客云盘
author: blademainer
tags:
  - sync
  - pan
  - edge
  - devices
categories:
  - cloud
  - app
date: 2019-03-11 23:16:00
updated: 2019-03-11 23:16:00
---
# SyncCloud 星客云盘

> 打造一个开源、简单、分布式的私人云盘。

![](/images/pasted-10.png)


<!-- more -->

{% plantuml %}

node pc1
node pc2

package raft {
    node vps1
    node vps2
    node "Edge devices" as e
    node router
}

vps1 <..> vps2: raft
'vps1 <..> e: raft
vps2 <..> router: raft
'vps1 <..> router: raft
vps2 <..> e: raft
'router <..> e: raft
pc1 --> router
pc2 --> router

{% endplantuml %}