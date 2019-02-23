POST="$1"
[[ -z "$POST" ]] && echo "post is null!" && exit 1
docker run --rm -it -w /app -v `pwd`:/app blademainer/hexo:v1.0.0 bash -c "hexo new post \"$1\""
