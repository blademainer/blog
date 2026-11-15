import { execFileSync } from "node:child_process";
import { readFile, readdir, mkdir, writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import plantumlEncoder from "plantuml-encoder";
import {
  parseLegacyPost,
  extractDiagrams,
  diagramHash,
  dateString,
} from "../src/lib/posts.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const md5 = (value) => createHash("md5").update(value).digest("hex");
const normalizeTitle = (title) =>
  title
    .replace(/\s*\|\s*blademainer\s*$/i, "")
    .replace(/\s+/g, "")
    .toLowerCase();
const articlePath = (value) => {
  const path = decodeURI(new URL(value, "https://xiongyingqi.com").pathname);
  return path.replace(/index\.html$/, "").replace(/\/?$/, "/");
};
const git = (repo, ...args) =>
  execFileSync("git", ["-C", repo, ...args], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
const readJson = async (path, fallback) => {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
};
const writeJson = async (name, value) =>
  writeFile(resolve(root, "data", name), `${JSON.stringify(value, null, 2)}\n`);

export function matchDiscussions(post, issues) {
  const paths = [post.url, ...post.legacyPaths];
  const hashes = new Set(
    paths.flatMap((path) => [md5(path), md5(`${path}index.html`)]),
  );
  return issues
    .filter((issue) => {
      const labels = issue.labels.map((label) =>
        typeof label === "string" ? label : label.name,
      );
      return (
        labels.some((label) => hashes.has(label)) ||
        normalizeTitle(issue.title) === normalizeTitle(post.title)
      );
    })
    .sort(
      (a, b) =>
        b.comments - a.comments ||
        Number(
          b.labels.some((label) => (label.name ?? label) === md5(post.url)),
        ) -
          Number(
            a.labels.some((label) => (label.name ?? label) === md5(post.url)),
          ) ||
        a.number - b.number,
    );
}

export function plantumlDocument(source) {
  if (/^@start\w+/m.test(source)) return source;
  const kind = /^\[[^\n]+\][^\n]*\blasts\s+\d+\s+days/im.test(source)
    ? "gantt"
    : "uml";
  return `@start${kind}\n${source}\n@end${kind}`;
}

async function captureDiagram(source, publishedUrl, previous, offline) {
  const sha256 = diagramHash(source);
  if (previous?.sha256 === sha256 && previous.src) {
    try {
      await access(
        resolve(root, "site-assets", previous.src.replace(/^\/assets\//, "")),
      );
      return previous;
    } catch {
      /* A missing local asset must be recaptured, not silently referenced. */
    }
  }
  // Modern PlantUML requires the explicit Gantt envelope that old Hexo omitted.
  const encoded = plantumlEncoder.encode(plantumlDocument(source));
  const candidates = [
    ...new Set(
      [
        publishedUrl?.replace(/^http:/, "https:").replace("/svg/", "/png/"),
        `https://www.plantuml.com/plantuml/png/${encoded}`,
      ].filter(Boolean),
    ),
  ];
  const record = {
    sha256,
    sourceUrl: publishedUrl?.replace(/^http:/, "https:") ?? candidates[0],
    src: null,
    status: "source-fallback",
  };
  if (offline) return record;
  for (const url of candidates) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!response.ok || response.headers.get("x-plantuml-diagram-error"))
        continue;
      const bytes = Buffer.from(await response.arrayBuffer());
      if (
        !bytes
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      )
        continue;
      const filename = `${sha256.slice(0, 24)}.png`;
      await writeFile(resolve(root, "site-assets/diagrams", filename), bytes);
      return {
        ...record,
        src: `/assets/diagrams/${filename}`,
        status: "captured",
        renderedUrl: url,
      };
    } catch {
      /* Offline or invalid upstream diagrams keep the original source readable. */
    }
  }
  return record;
}

export async function importLegacy({
  deployedRepo = resolve(root, "../blademainer.github.com"),
  discussionsFile = "/tmp/blademainer-blog-discussions.json",
  offline = false,
} = {}) {
  await mkdir(resolve(root, "data"), { recursive: true });
  await mkdir(resolve(root, "site-assets/diagrams"), { recursive: true });
  // Read Git objects, not checkout paths: macOS can collapse case-distinct files.
  const tree = git(deployedRepo, "ls-tree", "-r", "-z", "--name-only", "HEAD")
    .split("\0")
    .filter(Boolean);
  const sitemapPaths = [];
  for (const filename of [
    "post-sitemap.xml",
    "sitemap.xml",
    "baidusitemap.xml",
  ]) {
    if (!tree.includes(filename)) continue;
    const $ = load(git(deployedRepo, "show", `HEAD:${filename}`), {
      xmlMode: true,
    });
    $("url > loc").each((_, element) =>
      sitemapPaths.push(articlePath($(element).text())),
    );
  }
  const issues = await readJson(
    discussionsFile,
    await readJson(resolve(root, "data/legacy-discussions.json"), []),
  );
  const previousDiagrams = await readJson(
    resolve(root, "data/legacy-diagrams.json"),
    {},
  );
  const files = (await readdir(resolve(root, "source/_posts")))
    .filter((file) => /\.md$/i.test(file))
    .sort();
  const sources = await Promise.all(
    files.map(async (filename) => ({
      filename,
      ...parseLegacyPost(
        await readFile(resolve(root, "source/_posts", filename), "utf8"),
      ),
    })),
  );
  const posts = [];
  const diagrams = {};
  const jobs = [];
  const discussionRecords = [];
  for (const { filename, metadata, body } of sources) {
    const slug = filename.replace(/\.md$/i, "");
    const paths = tree.filter(
      (path) =>
        /^\d{4}\/\d{2}\/\d{2}\//.test(path) &&
        path.endsWith(`/${slug}/index.html`),
    );
    if (!paths.length) throw new Error(`No deployed article found for ${slug}`);
    const pages = paths.map((path) => {
      const $ = load(git(deployedRepo, "show", `HEAD:${path}`));
      return {
        path: `/${path.replace(/index\.html$/, "")}`,
        canonical: articlePath(
          $('link[rel="canonical"]').attr("href") ?? `/${path}`,
        ),
        diagrams: $("img")
          .toArray()
          .map((img) => $(img).attr("src"))
          .filter((src) =>
            /plantuml\.com\/plantuml\/(svg|png)\//.test(src ?? ""),
          ),
      };
    });
    const url =
      sitemapPaths.find((path) => path.endsWith(`/${slug}/`)) ??
      pages[0].canonical;
    const aliases = new Set([
      ...pages.flatMap((page) => [page.path, page.canonical]),
      ...sitemapPaths.filter((path) => path.endsWith(`/${slug}/`)),
    ]);
    aliases.add(`/${dateString(metadata.date).replaceAll("-", "/")}/${slug}/`);
    const shortSlug = slug.replace(/^\d{4}-\d{2}-\d{2}-/, "");
    for (const path of tree) {
      if (
        /\d{4}\/\d{2}\/\d{2}\//.test(path) &&
        path.endsWith(`/${shortSlug}.html`)
      )
        aliases.add(`/${path}`);
    }
    // Preserve dated links embedded in the original articles, including old timezone routes.
    for (const source of sources) {
      for (const match of source.body.matchAll(
        /\]\((\/(?:\d{4}\/\d{2}\/\d{2}\/)[^\s)#]+)\/?(?:#[^\s)]*)?\)/g,
      )) {
        const path = articlePath(match[1]);
        if (path.endsWith(`/${slug}/`)) aliases.add(path);
      }
    }
    aliases.delete(url);
    const post = {
      slug,
      url,
      title: String(metadata.title).trim(),
      legacyPaths: [...aliases].sort(),
    };
    const matches = matchDiscussions(post, issues);
    post.discussionUrl = matches[0]?.html_url ?? null;
    posts.push(post);
    discussionRecords.push(...matches);
    const published = pages.find((page) => page.path === url) ?? pages[0];
    diagrams[slug] = [];
    for (const [index, source] of extractDiagrams(body).entries()) {
      jobs.push(async () => {
        diagrams[slug][index] = await captureDiagram(
          source,
          published.diagrams[index],
          previousDiagrams[slug]?.[index],
          offline,
        );
      });
    }
  }
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(4, jobs.length) }, async () => {
      while (cursor < jobs.length) await jobs[cursor++]();
    }),
  );
  // Store only public issue metadata; never copy deployed script/configuration contents.
  const publicIssues = [
    ...new Map(
      discussionRecords.map((issue) => [issue.number, issue]),
    ).values(),
  ]
    .sort((a, b) => a.number - b.number)
    .map(({ number, title, html_url, labels, comments }) => ({
      number,
      title,
      html_url,
      labels,
      comments,
    }));
  await writeJson("legacy-posts.json", posts);
  await writeJson("legacy-diagrams.json", diagrams);
  await writeJson("legacy-discussions.json", publicIssues);
  const captured = Object.values(diagrams)
    .flat()
    .filter((item) => item.src).length;
  return {
    posts: posts.length,
    aliases: posts.reduce((sum, post) => sum + post.legacyPaths.length, 0),
    discussions: posts.filter((post) => post.discussionUrl).length,
    diagrams: jobs.length,
    captured,
    fallbacks: jobs.length - captured,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const args = process.argv.slice(2);
  const repo = args.indexOf("--deployed-repo");
  const discussions = args.indexOf("--discussions");
  console.log(
    JSON.stringify(
      await importLegacy({
        ...(repo >= 0 ? { deployedRepo: resolve(args[repo + 1]) } : {}),
        ...(discussions >= 0
          ? { discussionsFile: resolve(args[discussions + 1]) }
          : {}),
        offline: args.includes("--offline"),
      }),
      null,
      2,
    ),
  );
}
