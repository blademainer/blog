import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { load } from "cheerio";
const repo = new URL("../../blademainer.github.com/", import.meta.url).pathname;
const git = (...args) =>
  execFileSync("git", ["-C", repo, ...args], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
const tree = new Set(
  git("ls-tree", "-r", "--name-only", "-z", "HEAD").split("\0").filter(Boolean),
);
const records = JSON.parse(
  await readFile(new URL("../data/legacy-posts.json", import.meta.url), "utf8"),
);
const paths = JSON.parse(
  await readFile(
    new URL("../data/legacy-routes.json", import.meta.url),
    "utf8",
  ),
);
const headings = {},
  taxonomies = {};
const slugByPath = new Map();
for (const record of records) {
  const found = new Map();
  for (const route of [record.url, ...record.legacyPaths]) {
    slugByPath.set(route.replace(/index\.html$/, ""), record.slug);
    if (route.endsWith(".html")) continue;
    const file = route.slice(1) + "index.html";
    if (!tree.has(file)) continue;
    const $ = load(git("show", `HEAD:${file}`));
    $(
      ".post-body h1[id],.post-body h2[id],.post-body h3[id],.post-body h4[id],.post-body h5[id],.post-body h6[id]",
    ).each((_, node) => {
      const id = $(node).attr("id");
      if (!found.has(id))
        found.set(id, {
          id,
          text: $(node).text().trim(),
          depth: Number(node.tagName.slice(1)),
        });
    });
  }
  headings[record.slug] = [...found.values()];
}
for (const route of paths.filter((route) =>
  /^\/(tags|categories)\/[^/]/.test(route),
)) {
  const file = route.slice(1) + "index.html";
  if (!tree.has(file)) continue;
  const $ = load(git("show", `HEAD:${file}`));
  const slugs = new Set();
  $(".post-title-link").each((_, node) => {
    const pathname = decodeURI(
      new URL($(node).attr("href"), "https://xiongyingqi.com").pathname,
    );
    const slug = slugByPath.get(pathname);
    if (slug) slugs.add(slug);
  });
  taxonomies[route] = [...slugs];
}
await writeFile(
  new URL("../data/legacy-compat.json", import.meta.url),
  JSON.stringify({ headings, taxonomies }, null, 2) + "\n",
);
console.log(
  `Captured ${Object.values(headings).flat().length} heading anchors and ${Object.keys(taxonomies).length} taxonomy memberships.`,
);
