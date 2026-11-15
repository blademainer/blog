# Blademainer

Astro 构建的独立软件品牌站。首页目前主推 MacScreenCapture，博客保留在独立入口，原文章地址继续有效。

## 开发

需要 Node.js 24 或更新版本。

```bash
npm ci
npm run dev
```

默认预览地址为 `http://localhost:4321/`。`npm run build` 输出到 `dist/`；`npm run preview` 可预览构建后的静态站。

```bash
npm test        # Markdown、旧网址、评论、公式、图表、下载版本选择的回归测试
npm run check   # 测试、静态构建、站内链接与资源检查
```

## 页面与软件

- `/`：品牌首页与主推软件。
- `/apps/`：软件目录。
- `/apps/mac-screen-capture/`：产品详情、下载、安装与常见问题。
- `/blog/`：搜索、分类筛选和分页。
- `/archives/`、`/categories/`、`/tags/`：保留的博客入口。
- `/about/`：作者介绍。

产品资料在 `src/data/products.mjs` 管理。新增软件时增加资料和对应的产品页；主推项通过 `featured` 指定。具体产品的功能展示可独立设计，品牌导航、目录、页脚和基础样式复用。MacScreenCapture 下载优先检查 GitHub 正式版，只有预发布版时明确标记测试状态；API 不可用时仍保留已验证的下载链接，不阻塞静态页面。

## 博客维护

原文保留在 `source/_posts/`，支持 Hexo 旧格式及标准 YAML frontmatter。草稿目录 `source/_drafts/` 不参与构建。

新增一篇 `source/_posts/my-new-post.md`：

```markdown
---
title: 新文章
date: 2026-11-15
tags: [go]
categories: [开发记录]
---

正文。
```

新文章按填写的日期生成 `/2026/11/15/my-new-post/`，无需修改历史迁移清单。旧文章继续使用 `data/legacy-posts.json` 中已经发布过的网址，而不是重新计算日期。

`data/legacy-compat.json` 保留旧标题锚点和标签页的实际成员，避免 Hexo 与新渲染器的 slug 差异造成空页面。旧评论通过原 GitHub issue 入口继续访问，不复制旧评论组件中的 OAuth 凭据。原公式使用 KaTeX，原 PlantUML 图已保存为本地 PNG；新 PlantUML 内容没有预生成图片时展示源代码，不在普通构建时向外部服务发送文章。

迁移数据重新导入工具需要旁边存在旧部署仓库 `../blademainer.github.com`，正常写文章、开发和 CI 构建不需要它：

```bash
node scripts/import-legacy.mjs --offline
node scripts/import-legacy-routes.mjs
node scripts/import-legacy-compat.mjs
```

只有显式去掉 `--offline` 重新导入图表时，才会向公共 PlantUML 服务请求已公开文章中的图表。新内容包含私密信息时不要这样做。

## 资源与发布

原图片和验证文件继续从 `source/` 复制；新产品资源位于 `site-assets/`。`public/` 和 `dist/` 为自动生成目录，不手工修改。静态输出保留 `CNAME` 与 `.nojekyll`，仍使用 `xiongyingqi.com`。

既有 `/game/` 为独立构建的项目，不并入 Astro 源码或重新编译。CI 从现有部署仓库读取该目录，原样保留在产物中；本地若存在相邻的部署仓库也会自动保留。`/about/gallup.html` 等历史页面入口继续有效。

`.github/workflows/build.yml` 运行完整检查并提供站点构建产物，不会自动覆盖线上网站。原 Travis 仅保留构建检查，移除了旧 Hexo、七牛和自动推送操作。

首次上线需在预览确认后，把 `dist/` 发布到原 `blademainer/blademainer.github.com` 仓库，或将 `deployment/github-pages.yml` 安装到该仓库并启用 GitHub Pages 的 Actions 发布方式。后者直接读取此源码仓库，避免跨仓库写入 token；源码推送与域名切换必须在确认预览后执行。不要运行旧 Hexo 部署脚本。
