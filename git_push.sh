#!/bin/bash
git config user.email "blademainer@gmail.com"
git config user.name "blademainer"
git status && git add ./ -A && git commit -m "deploy by hexo-admin" && git pull && git push
