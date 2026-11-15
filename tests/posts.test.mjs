import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { load } from "cheerio";
import {
  getPosts,
  parseLegacyPost,
  renderMarkdown,
  extractDiagrams,
} from "../src/lib/posts.mjs";
import {
  matchDiscussions,
  plantumlDocument,
} from "../scripts/import-legacy.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const posts = await getPosts();
const bySlug = (slug) => {
  const post = posts.find((post) => post.slug === slug);
  assert.ok(post, slug);
  return post;
};

test("all public source posts are imported exactly once while retaining the 47-post migration baseline", async () => {
  const filenames = (await readdir(resolve(root, "source/_posts"))).filter(
    (name) => name.endsWith(".md"),
  );
  const baseline = JSON.parse(
    await readFile(resolve(root, "data/legacy-posts.json"), "utf8"),
  );
  assert.equal(baseline.length, 47);
  assert.equal(posts.length, filenames.length);
  for (const record of baseline) assert.ok(bySlug(record.slug));
  assert.deepEqual(
    posts.map((post) => post.slug).sort(),
    filenames.map((name) => name.slice(0, -3)).sort(),
  );
  assert.equal(new Set(posts.map((post) => post.slug)).size, posts.length);
  assert.equal(new Set(posts.map((post) => post.url)).size, posts.length);
  for (const post of posts) {
    assert.match(post.url, /^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/$/);
    assert.match(post.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(post.updated, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Array.isArray(post.tags) && Array.isArray(post.categories));
    assert.ok(post.description && post.title && post.html && post.minutes >= 1);
    assert.ok(!post.legacyPaths.includes(post.url));
    const $ = load(post.html);
    for (const heading of post.headings) {
      assert.ok(
        heading.id && heading.text && heading.depth >= 1 && heading.depth <= 6,
      );
      assert.equal(
        $("[id]")
          .toArray()
          .filter((node) => $(node).attr("id") === heading.id).length,
        1,
      );
    }
  }
});

test("singular Hexo tag metadata retains taxonomy membership", () => {
  assert.ok(bySlug("java-multiple-segment-lock").tags.length > 0);
  assert.ok(bySlug("2014-06-30-spring-mvc-jackson-enhance").tags.length > 0);
});

test("previously valid heading anchors remain usable after rendering", () => {
  const $ = load(bySlug("ali-java-specification").html);
  assert.equal(
    $("[id]")
      .toArray()
      .filter((node) => $(node).attr("id") === "一-命名规约").length,
    1,
  );
});

test("all 304 published heading anchors survive the migration", async () => {
  const compatibility = JSON.parse(
    await readFile(resolve(root, "data/legacy-compat.json"), "utf8"),
  );
  let checked = 0;
  for (const post of posts) {
    const $ = load(post.html);
    const ids = new Set(
      $("[id]")
        .toArray()
        .map((node) => $(node).attr("id")),
    );
    for (const heading of compatibility.headings[post.slug] || []) {
      assert.ok(ids.has(heading.id), `${post.slug}#${heading.id}`);
      checked++;
    }
  }
  assert.equal(checked, 304);
});

test("new articles can derive a URL without an entry in the migration snapshot", async () => {
  const { resolvePostRecord } = await import("../src/lib/posts.mjs");
  assert.equal(typeof resolvePostRecord, "function");
  const record = resolvePostRecord(
    "my-new-post",
    { date: "2026-11-15", title: "New article" },
    [],
  );
  assert.equal(record.url, "/2026/11/15/my-new-post/");
  assert.deepEqual(record.legacyPaths, []);
  assert.equal(record.discussionUrl, null);
});

test("published timezone paths win over source dates and every dated deployment alias survives", async () => {
  const post = bySlug("2013-11-14-mac-wget");
  assert.equal(post.date, "2013-11-14");
  assert.equal(post.url, "/2013/11/13/2013-11-14-mac-wget/");
  assert.ok(post.legacyPaths.includes("/2013/11/14/2013-11-14-mac-wget/"));
  const spring = bySlug("2014-06-30-spring-mvc-jackson-enhance");
  assert.equal(
    spring.url,
    "/2015/10/13/2014-06-30-spring-mvc-jackson-enhance/",
  );
  assert.ok(
    spring.legacyPaths.includes(
      "/2015/10/14/2014-06-30-spring-mvc-jackson-enhance/",
    ),
  );
  assert.ok(
    spring.legacyPaths.includes(
      "/java/2014/06/30/spring-mvc-jackson-enhance.html",
    ),
  );
  assert.equal(bySlug("gracefully-terminate").updated, "2020-04-03");
  assert.ok(
    bySlug("einstein-law-of-motion").legacyPaths.includes(
      "/2019/02/24/einstein-law-of-motion/",
    ),
  );
});

test("both Hexo frontmatter formats retain metadata and complete body", () => {
  for (const prefix of ["", "---\n"]) {
    const parsed = parseLegacyPost(
      `${prefix}title: Example\ndate: 2019-01-01\ntags: [go, shell]\n---\n# Body\n\ntext`,
    );
    assert.equal(parsed.metadata.title, "Example");
    assert.deepEqual(parsed.metadata.tags, ["go", "shell"]);
    assert.equal(parsed.body, "# Body\n\ntext");
  }
});

test("real Einstein articles preserve inline and block mathematics as KaTeX and MathML", () => {
  for (const slug of [
    "einstein-mass-energy-equation",
    "einstein-mass-velocity-equation",
    "einstein-law-of-motion",
  ]) {
    const $ = load(bySlug(slug).html);
    assert.ok($(".katex").length > 5, slug);
    assert.ok($(".katex-display").length > 0, slug);
    assert.ok($("math").length > 5, slug);
    assert.equal($(".katex-error").length, 0, slug);
    assert.ok(
      $('annotation[encoding="application/x-tex"]').text().includes("c"),
    );
  }
});

test("real code, local images, legacy image suffixes, and excerpts are preserved", () => {
  assert.ok(load(bySlug("shell-notes").html)("pre code").text().includes("$$"));
  const go = load(bySlug("go-hit-the-bit").html);
  assert.equal(
    go('img[src="https://dave.cheney.net/wp-content/uploads/2014/11/dfc.jpg"]')
      .length,
    1,
  );
  assert.ok(
    load(bySlug("pay-design-architecture").html)(
      'img[src="/images/pasted-8.png"]',
    ).length,
  );
  assert.ok(
    load(bySlug("java-multiple-segment-lock").html)("pre code")
      .text()
      .includes("class"),
  );
  for (const post of posts) {
    assert.doesNotMatch(post.html, /\{%\s*(?:end)?plantuml|<!--\s*more\s*-->/i);
  }
});

test("article HTML is sanitized without destroying code or trusted math output", async () => {
  const html = await renderMarkdown(
    '# Safe\n\n<script>alert(1)</script><style>body{display:none}</style><img src="/images/a.png" onerror="alert(1)"><a href="javascript:alert(1)">bad</a><iframe src="https://example.com"></iframe>\n\n$E=mc^2$\n\n```html\n<script>literal</script>\n```',
  );
  const $ = load(html);
  assert.equal($("script,style,iframe").length, 0);
  assert.ok(!$.root().text().includes("body{display:none}"));
  assert.equal($('[onerror],[onclick],a[href^="javascript:"]').length, 0);
  assert.ok($(".katex").length);
  assert.ok($("pre code").text().includes("<script>literal</script>"));
  for (const post of posts)
    assert.equal(
      load(post.html)("script,iframe,style,[onerror],[onclick]").length,
      0,
      post.slug,
    );
});

test("every original PlantUML diagram is captured or has a readable source fallback", async () => {
  const manifest = JSON.parse(
    await readFile(resolve(root, "data/legacy-diagrams.json"), "utf8"),
  );
  let count = 0;
  for (const slug of ["plant-uml-demo", "x-sync"]) {
    const { body } = parseLegacyPost(
      await readFile(resolve(root, "source/_posts", `${slug}.md`), "utf8"),
    );
    const sources = extractDiagrams(body);
    assert.equal(manifest[slug].length, sources.length);
    count += sources.length;
    const $ = load(bySlug(slug).html);
    assert.equal(
      $('img[src^="/assets/diagrams/"]').length +
        $("code.language-plantuml").length,
      sources.length,
    );
    for (const diagram of manifest[slug]) {
      assert.match(
        diagram.sourceUrl,
        /^https:\/\/www\.plantuml\.com\/plantuml\//,
      );
      if (diagram.src) {
        const bytes = await readFile(
          resolve(root, "site-assets", diagram.src.replace("/assets/", "")),
        );
        assert.deepEqual(
          [...bytes.subarray(0, 8)],
          [137, 80, 78, 71, 13, 10, 26, 10],
        );
      }
    }
  }
  assert.equal(count, 39);
  const fallback = await renderMarkdown(
    "{% plantuml %}\nAlice -> Bob: hello\n{% endplantuml %}",
  );
  assert.ok(
    load(fallback)("code.language-plantuml").text().includes("Alice -> Bob"),
  );
});

test("real legacy Gantt examples receive the required modern envelope without changing their source", async () => {
  const { body } = parseLegacyPost(
    await readFile(resolve(root, "source/_posts/plant-uml-demo.md"), "utf8"),
  );
  const diagrams = extractDiagrams(body);
  for (const source of diagrams.slice(15, 28)) {
    assert.equal(plantumlDocument(source), `@startgantt\n${source}\n@endgantt`);
  }
  assert.equal(
    plantumlDocument(diagrams[1]),
    `@startuml\n${diagrams[1]}\n@enduml`,
  );
  assert.equal(
    plantumlDocument("@startuml\nAlice -> Bob\n@enduml"),
    "@startuml\nAlice -> Bob\n@enduml",
  );
});

test("historic discussion links retain active threads and all matched issue metadata", async () => {
  assert.equal(
    bySlug("pay-summary").discussionUrl,
    "https://github.com/blademainer/blademainer.github.com/issues/21",
  );
  assert.equal(
    bySlug("go-hit-the-bit").discussionUrl,
    "https://github.com/blademainer/blademainer.github.com/issues/62",
  );
  assert.equal(
    bySlug("plant-uml-demo").discussionUrl,
    "https://github.com/blademainer/blademainer.github.com/issues/9",
  );
  const issues = JSON.parse(
    await readFile(resolve(root, "data/legacy-discussions.json"), "utf8"),
  );
  const matches = matchDiscussions(bySlug("go-hit-the-bit"), issues);
  assert.deepEqual(
    new Set(matches.map((issue) => issue.number)),
    new Set([62, 71]),
  );
  for (const post of posts)
    assert.match(
      post.discussionUrl ?? "",
      /^https:\/\/github\.com\/blademainer\/blademainer\.github\.com\/issues\/\d+$/,
    );
  assert.doesNotMatch(
    JSON.stringify(issues),
    /clientSecret|access_token|authorization|ghp_/i,
  );
});
