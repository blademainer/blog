title: curl网络耗时调试
date: 2019-03-06 19:12:46
category: linux
tags:
  - curl
  - debug
  - timeout
  - linux
  - pay
  - time
  - "-w"
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
time_total: %{time_total}\n
EOF

DOMAIN="api2.mch.weixin.qq.com"
curl -w '@curl-format.txt' $DOMAIN
```

