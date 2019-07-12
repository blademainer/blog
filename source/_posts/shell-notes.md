title: shell脚本命令备忘
date: 2016-09-12 17:09:19
category: shell
tags: 
 - shell
 - vim
---
这里收藏工作中用到的脚本，也为了防止做重复的搜索工作，同时分享给大家。
<!--more-->
# 数组  
- 初始化数组
```shell
name = (value1 value2 ... valuen)
$ A=(a b c d)
$ echo ${A[@]} # 输出所有元素
```


- 数组去重
```shell
$ array=($(awk -vRS=' ' '!a[$1]++' <<< ${array[@]}))
```

- 取得数组元素的个数
```shell
$ echo ${#A[@]}
```

- 取下标
```shell
$ echo ${A[1]} # 从1开始
```

- 清除元素
```shell
$ unset A
$ echo ${A[@]}
```

- 循环取元素
```shell
$ for a in ${A[@]}; do 
$   echo "$a"
$ done
```

- 替换
```shell
$ ${A[@]/3/100}
```

# date

- 获取当前日期并格式化成指定格式
```shell
$ NOW=$(date +'%Y-%m-%d_%H%M%S') # 2016-09-07_184914
```

- 获取一个小时前的日期
```shell
date --date="1 hours ago" +"%Y-%m-%d"
```

- 字符串转日期
```shell
date -d '2019-05-20'
date -d '2019-05-20' +%s #转成时间戳
```

- 计算当前时间的时间戳
```shell
$ STAMP=$(($(date +%s -d "$(date +'%Y-%m-%d %H:%M:%S')"))) # 1473245414
```
- 计算N天之前的时间
```shell
# 十天之前的日期
$ TEN_DAYS_AGO=$(($(date -d '-10 day' "+%Y%m%d%H%M%S"))) #20160828185138
```

- 计算指定日期的前一天
```shel
date -d "2019-05-20 -1 day" +"%Y%m%d"
```

- 获取指定日期的季度
```shell
SEASON=`echo "${today}" | awk -F "-" '{print $2}'| awk '{season_least=$1%3} {season=$1/3} {if(season_least>0) season+=1} {printf("%d\n",season)}'`
YEAR=`echo "${today}" | awk -F "-" '{print $1}'`
YEAR_SEASON="${YEAR}Q${SEASON}"
echo "YEAR_SEASON=${YEAR_SEASON}"
```

- 获取xxxx年xx月的天数
```shell
# 获取 2016-10 的天数
$ cal 10 2016 | awk 'NF{out=$NF;}END{print out}'
```
输出
```
31
```


# vim
- vi/vim修改只读(readonly)文件，使用sudo修改
```shell
:w !sudo tee % > /dev/null
```

# awk
- 过滤数字
```shell
$ echo "123" |awk '{if($0 ~ /^[0-9]+$/) print $0;}'
```

- 数字求和
```shell
$ cat ${FILE} | awk '{sum += $1};END {printf ("%d\n", sum)}'
```

- 截取字符串
```shell
$ echo "123456" | awk '{print substr($1,1,4)}' #1234
```

- 获取月份所在季度
```shell
$ for q in `seq 1 12`; echo $q | awk '{season_least=$1%3} {season=$1/3} {if(season_least>0) season+=1} {printf("%d\n",season)}'
```
输出
```shell
1
1
1
2
2
2
3
3
3
4
4
4
```

- 删除所有空格
```shell
$ echo "1 2  3 4" | sed -e 's/[[:space:]]//g '
```
输出
```shell
1234
```

- 替换所有的.为/
```shell
$ echo "com.xiongyingqi.Test" | awk '{gsub(/\./,"/"); print $0}'
```
输出
```shell
com/xiongyingqi/Test
```


# sed
- 去除首尾空格
```shell
$ FOO_NO_EXTERNAL_SPACE="$(echo -e "${FOO}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
```

- 删除空行
```shell
$ sed '/^$/d' sources.list
```


# uniq
- 统计重复数
```shell
$ cat file | uniq -c
```

# 文件
- 寻找有指定内容的文件
```shell
$ FOUND="test" # 需要查找的内容
$ find . | while read file; do if [ -f $file ]; then content=`cat ${file} | grep "${FOUND}"`; if [ -n "$content" ]; then echo ${file} ; fi; fi; done
```

- 列举文件并用管道打包
```shell
$ find . -name "*.class" | xargs tar cvf classes.tar
```

# 变量
我们先写一个简单的脚本，执行以后再解释各个变量的意义
 
```shell
$ touch variable
$ vi variable
```
 
脚本内容如下：

```shell
#!/bin/sh
echo "number:$#"
echo "scname:$0"
echo "first :$1"
echo "second:$2"
echo "argume:$@"
echo "show parm list:$*"
echo "show process id:$$"
echo "show precomm stat: $?"
```

保存退出
 
赋予脚本执行权限

```shell
$ chmod +x variable
```
 
执行脚本
```shell
$ ./variable aa bb
```
输出
```shell
number:2
scname:./variable
first:aa
second:bb
argume:aa bb
show parm list:aa bb
show process id:24544
show precomm stat:0
```
 
通过显示结果可以看到：
- $# 是传给脚本的参数个数
- $0 是脚本本身的名字
- $1 是传递给该shell脚本的第一个参数
- $2 是传递给该shell脚本的第二个参数
- $@ 是传给脚本的所有参数的列表
- $* 是以一个单字符串显示所有向脚本传递的参数，与位置变量不同，参数可超过9个
- $$ 是脚本运行的当前进程ID号
- $? 是显示最后命令的退出状态，0表示没有错误，其他表示有错误

# 例子
- *amount.txt 下所有文件的第8列数字之和
> iconv -fgbk 为转换文件为 gbk

```shell
ls *amount.txt | while read file; do cat ${file}; done | iconv -fgbk | awk -F "\t" '{print $8}' | awk '{if($0 ~ /^[0-9]+$/) print $0;}' | awk '{sum += $1};END {printf ("%d\n", sum)}'
```

- 将目录下的jar文件转换为maven格式的依赖

```shell

#!/bin/bash
find . -name "*.jar" | while read jar; do
    artifact=`echo ${jar} | awk '{print substr($jar,1,length($jar)-4);}'`
    version=`echo "$artifact" | awk -F '-' ' { print $NF } '`
    if [ $version == $artifact ]; then
        version="1.0"
    else
        artifact=`echo "$artifact" | awk -v version="$version" '{print substr($1,1,index($1,version)-2)}'`
    fi

    # find group
    groupDirectory=`jar -tf $jar | grep ".class" | head -n 1`
    last=`echo "$groupDirectory" | awk -F '/' ' { print $NF } '`
    group=`echo "$groupDirectory" | awk -v last="$last" '{print substr($1,1,index($1,last)-2)}'`
    # replace / to .
    group=`echo $group | awk '{gsub(/\//,"."); print $0}'`


    echo "
        <dependency>
            <groupId>${group}</groupId>
            <artifactId>${artifact}</artifactId>
            <version>${version}</version>
            <scope>system</scope>
            <systemPath>\${project.basedir}/lib/${jar}</systemPath>
        </dependency>" #>> "dependencies.tmp"
done
```

- 查找java类所在当前目录内的jar包

```shell
$ FOUND="com.xiongyingqi.Test" && ls *.jar | while read jar; do jar tf $jar | grep `echo "${FOUND}" | awk '{gsub(/\./,"/"); print $0}'` | awk -v jar="$jar" '{if (length($1) > 0) print jar}'; done
```

- 将目录内的文件转换为classpath需要的参数
```shell
ls lib/*.jar | xargs | awk -v d="${delete}" '{
        str="";
        is_in=0;
        for(i=1;i<=NF;i++){
            if($i!=d){
                if(is_in == 1){
                    str=str":"$i;
                }else{
                    str=str""$i;
                    is_in=1;
                }
            }
        }
        print str
    }'
```

- 查找某个目录下所有的jar包里面有哪些class是冲突的shell脚本

```shell
#!bin/bash
echo "Find out conflict class in the given path";
if [ $# != 1 ] ; then
 echo "Usage: sh findconflictclass.sh $1 ,first param means the path you want to find,eg: sh findconflictclass.sh lib";
exit 1;
fifindconflictclass.sh
echo "Please wait ...";
jarpath=$1;
function unjarclass(){
 for i in `find $jarpath -name *.jar`; do
 jar -tvf "$i" |grep .class$ | awk '{print $8}' ; 
 # if [[ $? == 0 ]]; then echo $i; fi; 
 done
}
unjarclass 1>temp.txt;
echo 'unjar class in the given path has done';
sleep 10s
function findclassinjar(){
echo -e "\033[47;31m 'The class $1 exists in multi-place below:' \033[0m" ;
 for i in `find $2 -name *.jar`; do
 jar -tvf "$i" | grep --color -i "$1" ;
 if [[ $? == 0 ]]; then echo -e "\033[33m 'The jar path is: $i' \033[0m" ; fi;
 done
}
sort temp.txt | uniq -d | cat | while read line; do a=$line; findclassinjar $a $jarpath;done
rm -rf temp.txt
```

- 替换字符串

```shell
$ data="a" && newdata="c" && echo "aaabbba"|awk -v var=${1} -v var1=${data} -v var2=${newdata} '$0 ~ var {gsub(var1,var2); print}'
```

输出

```shell
cccbbbc
```

- 文件内容替换
替换`当前目录下的所有文件`内容中的`hello`为`helloworld`

```shell
find . -type f | while read file; do sed -i 's/hello/helloworld/g' $file;done
```


- 测试curl

```shell
$ size=1000;i=0; while [ $i -lt $size ];do i=$((i+1)); curl "http://baidu.com" & done
```

- 获取从开始日期到结束日期所经历过的季度

```shell
FROM_DATE="$1"
TO_DATE="$2"

FROM_SEASON=`echo "${FROM_DATE}" | awk -F "-" '{print $2}'| awk '{season_least=$1%3} {season=$1/3} {if(season_least>0) season+=1} {printf("%d\n",season)}'`
TO_SEASON=`echo "${TO_DATE}" | awk -F "-" '{print $2}'| awk '{season_least=$1%3} {season=$1/3} {if(season_least>0) season+=1} {printf("%d\n",season)}'`
echo "FROM_SEASON: ${FROM_SEASON}"
echo "TO_SEASON: ${TO_SEASON}"

FROM_YEAR=`echo "${FROM_DATE}" | awk -F "-" '{print $1}'`
TO_YEAR=`echo "${TO_DATE}" | awk -F "-" '{print $1}'`

year_season_file="year_season.tmp"
if [ -f ${year_season_file} ];then
    echo "delete file: ${year_season_file}"
    rm -f ${year_season_file}
fi

if [ ${FROM_YEAR} -eq ${TO_YEAR} ]; then
    for season in `seq ${FROM_SEASON} ${TO_SEASON}`; do
        echo "${FROM_YEAR}Q${season}" >> ${year_season_file}
    done
else
    for season in `seq ${FROM_SEASON} 4`; do
        echo "${FROM_YEAR}Q${season}" >> ${year_season_file}
    done

    #FROM_YEAR
    if [ $((TO_YEAR-FROM_YEAR)) -ge 2 ]; then
        for year in `seq $((FROM_YEAR+1)) $((TO_YEAR-1))`; do
            for season in `seq 1 4`; do
                echo "${year}Q${season}" >> ${year_season_file}
            done
        done
    fi

    for season in `seq 1 ${TO_SEASON}`; do
        echo "${TO_YEAR}Q${season}" >> ${year_season_file}
    done

fi

cat ${year_season_file}
```

- 多线程访问

```shell
for ((i=0;i<10;)); do 
	for j in `seq 1 100`; do 
    	curl "http://baidu.com" & 
    done; 
    wait; 
    i=$((i+1)); 
done
```

- 按列合并

```shell
cat filtsoort | awk '{sum[$1]+=$2}END{for (i in sum) print i" "sum[i]}'
```

- 转换编码

```shell
find . -name "*.java" | while read file; do iconv -f gbk -t utf-8 $file > ${file}.bak; mv -f ${file}.bak $file; done
```


- word转换为markdown
需要先安装`w2m`: [benbalter/word-to-markdown](https://github.com/benbalter/word-to-markdown)
```shell
find doc -name "*.doc" | while read file; do 
    folder_tmp="markdown/$file";
    folder=${folder_tmp%/*};
    target_file="${folder_tmp%%.*}".md
    mkdir -p $folder;
    w2m $file > $target_file; 
done
```

- 移除base64图像
```shell
sed -i 's-\!\[\](data:image\/\*;base64,.*)--g' $file
```

- 判断是否为asccii字符串（英文字符）
```shell
echo "呵呵" | awk '{ print (length($0)>NF)}' #1
```

- 输出带颜色的字符
shell脚本中echo显示内容带颜色显示,echo显示带颜色，需要使用参数-e 
格式如下：

```shell
echo -e "\033[字背景颜色；文字颜色m字符串\033[0m" 
```

例如： 

```shell
echo -e "\033[41;36m something here \033[0m" 
```

其中41的位置代表底色， 36的位置是代表字的颜色 
> 注： 
>1、字背景颜色和文字颜色之间是英文的"" 
>2、文字颜色后面有个m 
>3、字符串前后可以没有空格，如果有的话，输出也是同样有空格 

下面是相应的字和背景颜色，可以自己来尝试找出不同颜色搭配 
例 

```shell
echo -e "\033[31m 红色字 \033[0m"
echo -e "\033[34m 黄色字 \033[0m"
echo -e "\033[41;33m 红底黄字 \033[0m"
echo -e "\033[41;37m 红底白字 \033[0m"
```

字颜色：30—–37 

```shell
echo -e "\033[30m 黑色字 \033[0m"
echo -e "\033[31m 红色字 \033[0m"
echo -e "\033[32m 绿色字 \033[0m"
echo -e "\033[33m 黄色字 \033[0m"
echo -e "\033[34m 蓝色字 \033[0m"
echo -e "\033[35m 紫色字 \033[0m"
echo -e "\033[36m 天蓝字 \033[0m"
echo -e "\033[37m 白色字 \033[0m"
```

字背景颜色范围：40—–47 

```shell
echo -e "\033[40;37m 黑底白字 \033[0m"
echo -e "\033[41;37m 红底白字 \033[0m"
echo -e "\033[42;37m 绿底白字 \033[0m"
echo -e "\033[43;37m 黄底白字 \033[0m"
echo -e "\033[44;37m 蓝底白字 \033[0m"
echo -e "\033[45;37m 紫底白字 \033[0m"
echo -e "\033[46;37m 天蓝底白字 \033[0m"
echo -e "\033[47;30m 白底黑字 \033[0m"
```

最后面控制选项说明 
  - \33[0m 关闭所有属性 
  - \33[1m 设置高亮度 
  - \33[4m 下划线 
  - \33[5m 闪烁 
  - \33[7m 反显 
  - \33[8m 消隐 
  - \33[30m — \33[37m 设置前景色 
  - \33[40m — \33[47m 设置背景色 
  - \33[nA 光标上移n行 
  - \33[nB 光标下移n行 
  - \33[nC 光标右移n行 
  - \33[nD 光标左移n行 
  - \33[y;xH设置光标位置 
  - \33[2J 清屏 
  - \33[K 清除从光标到行尾的内容 
  - \33[s 保存光标位置 
  - \33[u 恢复光标位置 
  - \33[?25l 隐藏光标 
  - \33[?25h 显示光标 

```shell
function echoGreen(){
    echo -e "\033[32m$1\033[0m"
}

function echoRed(){
    echo -e "\033[31m$1\033[0m"
}

function echoYellow(){
    echo -e "\033[33m$1\033[0m"
}
```

- 从第二行开始显示
```shell
cat file | awk 'NR>2{print p}{p=$0}'
```

# 批量导出db数据
```shell
for y in `seq 2015 2025`; do
  for m in `seq 1 12`; do
    db=`echo gateway$y``printf "%02d" $m`;
    mysqldump -uroot -ppass -hhost -d $db --lock-tables=false  >> gateway.sql;
  done
done
```

# 获取被执行脚本所在路径
```shell
cur_script_dir="`cd $(dirname $0) && pwd`"
echo $cur_script_dir
```

# awk获取第1列之后的列值
```shell
awk '{ $1=""; print $0 }' ur_file
```
另外， 如果我要打印某列以后的所有列的，  可以使用循环把， 把前N列都赋值为空：
```shell
awk '{ for(i=1; i<=2; i++){ $i="" }; print $0 }' urfile
```
