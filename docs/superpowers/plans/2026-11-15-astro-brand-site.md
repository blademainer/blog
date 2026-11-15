# Blademainer Astro Implementation Plan

**Goal:** Replace the blog-first Hexo website with an extensible Astro software brand site while preserving published content and URLs.

**Architecture:** Static Astro pages share a lightweight design system. Product data is independent of templates. Legacy Markdown is parsed at build time with an explicit URL manifest derived from the deployed repository.

**Tech Stack:** Astro, Node 24, YAML, unified Markdown pipeline, Lucide icons, Playwright, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-15-astro-brand-site-design.md`

## Global Constraints

- Brand: Blademainer; featured product: MacScreenCapture; domain: `https://xiongyingqi.com`.
- Preserve historic URLs, public articles, assets and discussion entry points; never publish drafts or former secrets.
- Downloads must distinguish the CI prerelease from a stable release and state macOS 15 plus unsigned/unnotarized limitations.
- Keep production unchanged until the local preview is reviewed.

## Tasks

- [x] Create Astro build setup, asset preparation and shared layout; remove Hexo runtime dependencies from the active package.
- [x] Import legacy URL/discussion metadata and render existing articles, formulas and diagrams with regression tests.
- [x] Build homepage, product directory, product page, about, blog, archive, taxonomy pages, feed and sitemap.
- [x] Add a GitHub Actions build check and document the deployment handoff to the existing Pages repository.
- [x] Run unit/build/link checks, desktop/mobile browser tests and visual inspection; obtain an independent review and resolve important findings.
- [ ] After the user's publication approval, commit and push the source and Pages workflow, deploy to the existing domain, and verify the live website in the built-in browser.

## Review Focus

- Timezone-shifted article URLs and aliases must resolve.
- Search/filter combinations and empty results must be usable with keyboard and mobile controls.
- Long code, formulas, Chinese titles and navigation must not overflow.
- Prerelease-only and failed GitHub API states must not masquerade as stable releases.
- Blog Markdown migration must not execute old scripts or expose OAuth credentials.
