import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const taxonomyUrl = (kind, name) =>
  `/${kind}/${encodeURIComponent(name)}/`;
export function taxonomyGroups(posts, key) {
  const groups = new Map();
  for (const post of posts)
    for (const term of post[key]) {
      const current = groups.get(term) || [];
      if (!current.includes(post)) current.push(post);
      groups.set(term, current);
    }
  return [...groups].sort(([a], [b]) => a.localeCompare(b, "zh-CN"));
}

export async function getPageRoutes(posts) {
  const routes = new Map();
  const add = (url, props) => {
    const path = decodeURI(url).replace(/^\/+|\/+$/g, "");
    if (!path) return;
    if (!routes.has(path)) routes.set(path, { params: { path }, props });
  };
  for (const post of posts)
    for (const url of [post.url, ...post.legacyPaths]) {
      // Historical .html aliases are copied from source by prepare-assets.
      if (!url.endsWith(".html")) add(url, { kind: "post", post });
    }
  add("/blog/", { kind: "listing", posts, title: "开发与思考。" });
  add("/404/", { kind: "not-found" });
  add("/archives/", {
    kind: "listing",
    posts,
    title: "所有记录。",
    eyebrow: "THE ARCHIVE",
    description: "按时间回看，一步一步积累的开发记录。",
  });
  for (let page = 2; page <= Math.ceil(posts.length / 10); page++) {
    add(`/page/${page}/`, {
      kind: "listing",
      posts,
      title: "开发与思考。",
      page,
    });
    add(`/blog/page/${page}/`, {
      kind: "listing",
      posts,
      title: "开发与思考。",
      page,
    });
    add(`/archives/page/${page}/`, {
      kind: "listing",
      posts,
      title: "所有记录。",
      page,
    });
  }
  for (const [key, label] of [
    ["tags", "标签"],
    ["categories", "分类"],
  ]) {
    const groups = taxonomyGroups(posts, key);
    add(`/${key}/`, { kind: "taxonomy", groups, key, label });
    for (const [term, matches] of groups)
      add(taxonomyUrl(key, term), {
        kind: "listing",
        posts: matches,
        title: term,
        eyebrow: label,
        description: `${matches.length} 篇相关记录。`,
      });
  }
  const historical = JSON.parse(
    await readFile(resolve(process.cwd(), "data/legacy-routes.json"), "utf8"),
  );
  const compatibility = JSON.parse(
    await readFile(resolve(process.cwd(), "data/legacy-compat.json"), "utf8"),
  );
  for (const url of historical) {
    const parts = decodeURI(url).split("/").filter(Boolean);
    if (parts[0] === "tags" || parts[0] === "categories") {
      const key = parts[0],
        term = parts[1];
      const membership = compatibility.taxonomies[url];
      const matches = membership
        ? posts.filter((post) => membership.includes(post.slug))
        : posts.filter((post) =>
            post[key].some(
              (value) =>
                value.toLocaleLowerCase() === term?.toLocaleLowerCase(),
            ),
          );
      add(url, {
        kind: "listing",
        posts: matches,
        title: term || (key === "tags" ? "标签" : "分类"),
        eyebrow: "历史文章分类",
        description: "保留的博客分类入口。",
      });
    } else if (parts[0] === "archives" && parts.length > 1) {
      const prefix = parts
        .slice(1)
        .filter((part) => /^\d{2,4}$/.test(part))
        .slice(0, 2)
        .join("-");
      add(url, {
        kind: "listing",
        posts: posts.filter((post) => post.date.startsWith(prefix)),
        title: prefix || "所有记录。",
        eyebrow: "THE ARCHIVE",
      });
    }
  }
  return [...routes.values()];
}
