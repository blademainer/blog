cmd="$1"
[[ -z "$cmd" ]] && echo "cmd is null!" && exit 1
docker run --rm -it -e LANG="zh_CN.UTF-8" -w /app -v ~/.ssh:/root/.ssh -v `pwd`:/app blademainer/hexo:v1.0.2 $cmd
