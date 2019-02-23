docker run --rm -it -w /app -v `pwd`:/app blademainer/hexo:v1.0.0 bash -c "npm install"
docker run --rm -p 4000:4000 -p 3000:3000 -it -w /app -v `pwd`:/app blademainer/hexo:v1.0.0 bash -c "hexo server"
