cmd="$1"
[[ -z "$cmd" ]] && echo "cmd is null!" && exit 1
docker run --rm -it -w /app -e LANG="zh_CN.UTF-8" -v `pwd`:/app blademainer/hexo:v1.0.2 npm --registry=https://registry.npm.taobao.org $cmd
