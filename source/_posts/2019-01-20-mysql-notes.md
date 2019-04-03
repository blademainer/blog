title: MySQL笔记
tags:
  - mysql
  - note
date: 2019-01-20 19:00:00
---
这里收藏工作中用到的脚本，也为了防止做重复的搜索工作，同时分享给大家。

<!--more-->


## 查看当前表的自增序列
```mysql
SELECT `AUTO_INCREMENT` FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'DatabaseName' AND TABLE_NAME = 'TableName'; 
```

## 修改自增序列
```mysql
alter table tablename auto_increment=NUMBER;
```

## 查看binlog
```mysql
show binary logs;
```

## 查看binlog位置
```mysql
show binlog events in '${BINLOG}' limit 10;
```

## 批量更新指定schema的`increment`
```shell
#!/bin/bash

INCREMENT="34614952180"
echo "select CONCAT(TABLE_SCHEMA, '.', TABLE_NAME)  FROM INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA in ('schema1','schema2','schema3') or TABLE_SCHEMA like 'schema_prefix_%';" | mysql -h ${HOST} -u${USER} -p${PASS} -s > tables.tmp
cat tables.tmp | while read table; do
  echo "alter table $table AUTO_INCREMENT=$INCREMENT" | mysql -h ${HOST} -u${USER} -p${PASS};
done
```

## 批量导出数据库（除了系统库）
```shell
echo "show databases" | mysql | grep -Ev "^(Database|mysql|performance_schema|information_schema)$" > databases
cat databases | while read db; do mysqldump --complete-insert --single-transaction --skip-opt --extended-insert --disable-keys --create-options --default-character-set=utf8 --quick --set-gtid-purged=OFF --databases $db >> payproxy.sql; done
rm databases
```
