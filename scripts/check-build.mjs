import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { load } from "cheerio";
import { getPosts } from "../src/lib/posts.mjs";

const root = path.resolve("dist");
async function filesIn(directory) {
  return (
    await Promise.all(
      (await readdir(directory, { withFileTypes: true })).map((entry) => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? filesIn(file) : file;
      }),
    )
  ).flat();
}
const files = await filesIn(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const errors = new Set();
const targetExists = async (target) => {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
};
for (const file of htmlFiles) {
  const $ = load(await readFile(file, "utf8"));
  const pagePath = "/" + path.relative(root, file).replace(/index\.html$/, "");
  for (const element of $(
    'a[href],img[src],link[rel="stylesheet"],script[src]',
  ).toArray()) {
    const reference = $(element).attr("href") || $(element).attr("src");
    if (!reference || /^(#|mailto:|tel:|data:|javascript:)/.test(reference))
      continue;
    let url;
    try {
      url = new URL(reference, `https://xiongyingqi.com${pagePath}`);
    } catch {
      errors.add(`Invalid URL in ${pagePath}`);
      continue;
    }
    if (url.hostname !== "xiongyingqi.com") continue;
    const local = path.resolve(root, "." + decodeURIComponent(url.pathname));
    if (!local.startsWith(root + path.sep) && local !== root) {
      errors.add(`Unsafe path in ${pagePath}`);
      continue;
    }
    const fileTarget = path.extname(local)
      ? local
      : path.join(local, "index.html");
    if (
      !(await targetExists(fileTarget)) &&
      !(await targetExists(path.join(local, "index.html")))
    )
      errors.add(`${pagePath} -> ${url.pathname}`);
  }
}
const posts = await getPosts();
for (const post of posts)
  for (const url of [post.url, ...post.legacyPaths]) {
    const output = path.join(
      root,
      decodeURIComponent(url),
      url.endsWith(".html") ? "" : "index.html",
    );
    if (!(await targetExists(output)))
      errors.add(`Missing historical article: ${url}`);
  }
assert.equal(
  files.some((file) => file.includes("_drafts")),
  false,
  "Drafts must not be published",
);
for (const file of [
  "index.html",
  "apps/index.html",
  "apps/mac-screen-capture/index.html",
  "blog/index.html",
  "about/index.html",
  "404.html",
  "atom.xml",
  "sitemap.xml",
  "robots.txt",
  "CNAME",
  ".nojekyll",
]) {
  if (!(await targetExists(path.join(root, file))))
    errors.add(`Missing output: ${file}`);
}
if (errors.size) {
  console.error([...errors].join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Verified ${htmlFiles.length} HTML files, ${posts.length} articles and every local link/asset target.`,
  );
