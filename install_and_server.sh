docker run --rm -i -w /app -v `pwd`:/app blademainer/hexo:v1.0.3 "npm install"
docker run --rm -p 4000:4000 -p 3000:3000 -i -w /app -v `pwd`:/app blademainer/hexo:v1.0.3 "hexo server"
