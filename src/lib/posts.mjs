import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { parse } from "yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { load } from "cheerio";

const root = process.cwd();

export function parseLegacyPost(input) {
  const text = input.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const start = text.startsWith("---\n") ? 4 : 0;
  const end = /^---\s*$/m.exec(text.slice(start));
  if (!end) throw new Error("Missing Hexo frontmatter terminator");
  const metadata = parse(text.slice(start, start + end.index)) ?? {};
  return {
    metadata,
    body: text.slice(start + end.index + end[0].length).trim(),
  };
}

export const diagramHash = (source) =>
  createHash("sha256").update(source.trim()).digest("hex");

// Work only outside fenced code so shell snippets and literal Markdown stay intact.
function transformProse(markdown, transform) {
  const result = [];
  let prose = [];
  let fence;
  for (const line of markdown.split("\n")) {
    const marker = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (!fence && marker) {
      result.push(transform(prose.join("\n")));
      prose = [];
      fence = marker;
      result.push(line);
    } else if (fence) {
      result.push(line);
      if (
        marker?.[0] === fence[0] &&
        marker.length >= fence.length &&
        /^\s*(`+|~+)\s*$/.test(line)
      )
        fence = undefined;
    } else prose.push(line);
  }
  result.push(transform(prose.join("\n")));
  return result.join("\n");
}

export function extractDiagrams(markdown) {
  const diagrams = [];
  transformProse(markdown, (part) => {
    for (const match of part.matchAll(
      /\{%\s*plantuml(?:\s+[^%]*?)?\s*%\}([\s\S]*?)\{%\s*endplantuml\s*%\}/g,
    )) {
      diagrams.push(match[1].trim());
    }
    return part;
  });
  return diagrams;
}

const schema = {
  ...defaultSchema,
  strip: [...(defaultSchema.strip ?? []), "style", "iframe", "object", "embed"],
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes.code ?? []),
      ["className", /^language-./, "math-inline", "math-display"],
    ],
    span: [["className", "green", "purple", "yellow"]],
    img: [
      ...(defaultSchema.attributes.img ?? []),
      "width",
      "height",
      "loading",
    ],
  },
};

export async function renderMarkdown(markdown, { diagrams = [] } = {}) {
  const prepared = transformProse(markdown, (part) =>
    part
      .replace(/<!--\s*more\s*-->/gi, "")
      .replace(/(!\[[^\]\n]*\]\([^\n]*?)\s+=\d*x\d*\s*\)/g, "$1)")
      .replace(
        /\{%\s*plantuml(?:\s+[^%]*?)?\s*%\}([\s\S]*?)\{%\s*endplantuml\s*%\}/g,
        (_, source) => {
          const diagram = diagrams.find(
            (item) => item.sha256 === diagramHash(source),
          );
          if (diagram?.src)
            return `\n\n![PlantUML diagram](${diagram.src})\n\n`;
          const fence = "`".repeat(
            Math.max(
              3,
              ...[...source.matchAll(/`+/g)].map((m) => m[0].length + 1),
            ),
          );
          return `\n\n${fence}plantuml\n${source.trim()}\n${fence}\n\n`;
        },
      ),
  );
  // Sanitize untrusted article HTML before trusted KaTeX/highlighting generate markup.
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, schema)
    .use(rehypeKatex, { strict: "ignore", trust: false, throwOnError: false })
    .use(rehypeHighlight, { detect: false, ignoreMissing: true })
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(prepared);
  return String(result);
}

function strings(value) {
  return (
    Array.isArray(value) ? value.flat(Infinity) : value == null ? [] : [value]
  )
    .map(String)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function dateString(value, fallback) {
  const date = String(value ?? fallback ?? "").match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (!date || Number.isNaN(Date.parse(`${date}T00:00:00Z`)))
    throw new Error(`Invalid post date: ${value}`);
  return date;
}

export function resolvePostRecord(slug, metadata, records) {
  return (
    records.find((record) => record.slug === slug) ?? {
      slug,
      url: `/${dateString(metadata.date).replaceAll("-", "/")}/${encodeURIComponent(slug)}/`,
      legacyPaths: [],
      discussionUrl: null,
    }
  );
}

function preserveHeadingAnchors(html, legacyHeadings) {
  if (!legacyHeadings.length) return html;
  const $ = load(html, {}, false);
  const normalize = (value) =>
    value
      .normalize("NFKC")
      .replace(/[\s\p{P}\p{S}]/gu, "")
      .toLocaleLowerCase();
  const headings = $("h1,h2,h3,h4,h5,h6").toArray();
  const used = new Set();
  const ids = new Set(
    $("[id]")
      .toArray()
      .map((node) => $(node).attr("id")),
  );
  for (const old of legacyHeadings) {
    const matching = headings.filter(
      (node) =>
        !used.has(node) && normalize($(node).text()) === normalize(old.text),
    );
    const target =
      matching.find((node) => Number(node.tagName.slice(1)) === old.depth) ??
      matching[0];
    if (!target) continue;
    used.add(target);
    if (ids.has(old.id)) continue;
    $(target).prepend(
      $("<span></span>").attr({
        id: old.id,
        class: "legacy-anchor",
        "aria-hidden": "true",
      }),
    );
    ids.add(old.id);
  }
  return $.html();
}

export async function getPosts() {
  const records = JSON.parse(
    await readFile(resolve(root, "data/legacy-posts.json"), "utf8"),
  );
  const diagramData = JSON.parse(
    await readFile(resolve(root, "data/legacy-diagrams.json"), "utf8"),
  );
  const compatibility = JSON.parse(
    await readFile(resolve(root, "data/legacy-compat.json"), "utf8"),
  );
  const files = (await readdir(resolve(root, "source/_posts")))
    .filter((name) => /\.md$/i.test(name))
    .sort();
  const bySlug = new Map(records.map((post) => [post.slug, post]));
  if (
    bySlug.size !== records.length ||
    records.some((record) => !files.includes(`${record.slug}.md`))
  )
    throw new Error(
      "A migrated article is missing or duplicated in the legacy manifest",
    );
  const posts = await Promise.all(
    files.map(async (filename) => {
      const slug = filename.replace(/\.md$/i, "");
      const { metadata, body } = parseLegacyPost(
        await readFile(resolve(root, "source/_posts", filename), "utf8"),
      );
      const record = resolvePostRecord(slug, metadata, records);
      const html = preserveHeadingAnchors(
        await renderMarkdown(body, { diagrams: diagramData[slug] ?? [] }),
        compatibility.headings[slug] ?? [],
      );
      const $ = load(html);
      const headings = $("h1,h2,h3,h4,h5,h6")
        .toArray()
        .map((heading) => ({
          id: $(heading).attr("id"),
          text: $(heading).text(),
          depth: Number(heading.tagName.slice(1)),
        }));
      const plain = $.root().text().replace(/\s+/g, " ").trim();
      const summary = load(html);
      summary("pre, .katex, img").remove();
      const description =
        String(
          metadata.description ?? summary("p,blockquote").first().text() ?? "",
        )
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 180) || String(metadata.title);
      const chinese = (plain.match(/[\u3400-\u9fff]/g) ?? []).length;
      const words = (plain.replace(/[\u3400-\u9fff]/g, " ").match(/\S+/g) ?? [])
        .length;
      return {
        slug,
        url: record.url,
        title: String(metadata.title).trim(),
        date: dateString(metadata.date),
        updated: dateString(metadata.updated, metadata.date),
        tags: strings(metadata.tags ?? metadata.tag),
        categories: strings(metadata.categories ?? metadata.category),
        description,
        minutes: Math.max(1, Math.ceil(chinese / 400 + words / 220)),
        html,
        headings,
        discussionUrl: record.discussionUrl ?? null,
        legacyPaths: record.legacyPaths,
      };
    }),
  );
  return posts.sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  );
}
