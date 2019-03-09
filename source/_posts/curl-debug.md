title: curl网络耗时调试
category: linux
tags:
  - linux
  - curl
  - debug
  - timeout
  - pay
  - time
  - '-w'
categories:
  - linux
author: blademainer
date: 2019-03-06 19:12:00
---
> 线上环境各种蛋疼问题，通过日志无法定位出是我们服务器的问题（服务器问题又包括：dns服务器问题、内部网络问题等）还是第三方服务器的问题，通过一个简单的脚本即可直观调试出来。

<!-- more -->

```bash
tee curl-format.txt <<- 'EOF'
time_namelookup: %{time_namelookup}\n
time_connect: %{time_connect}\n
time_appconnect: %{time_appconnect}\n
time_redirect: %{time_redirect}\n
time_pretransfer: %{time_pretransfer}\n
time_starttransfer: %{time_starttransfer}\n
----------\n
time_total: %{time_total}\n\n
EOF

DOMAIN="api2.mch.weixin.qq.com"
curl -w '@curl-format.txt' $DOMAIN
```
释义：
- time_namelookup：DNS 域名解析的时候，就是把 https://zhihu.com 转换成 ip 地址的过程
- time_connect：TCP 连接建立的时间，就是三次握手的时间
- time_appconnect：SSL/SSH 等上层协议建立连接的时间，比如 connect/handshake 的时间
- time_redirect：从开始到最后一个请求事务的时间
- time_pretransfer：从请求开始到响应开始传输的时间
- time_starttransfer：从请求开始到第一个字节将要传输的时间
- time_total：这次请求花费的全部时间