import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getPosts } from "../src/lib/posts.mjs";
import { getPageRoutes } from "../src/lib/routes.mjs";

test("all dated article routes and historic taxonomy paths survive migration", async () => {
  const posts = await getPosts();
  const routes = await getPageRoutes(posts);
  const paths = new Set(routes.map((route) => "/" + route.params.path + "/"));
  for (const post of posts)
    for (const url of [post.url, ...post.legacyPaths])
      if (!url.endsWith(".html")) assert.ok(paths.has(decodeURI(url)), url);
  const historical = JSON.parse(
    await readFile("data/legacy-routes.json", "utf8"),
  );
  for (const url of historical) assert.ok(paths.has(decodeURI(url)), url);
  assert.ok(paths.has("/blog/"));
  assert.ok(paths.has("/page/2/"));
  assert.ok(paths.has("/tags/"));
  assert.ok(paths.has("/categories/"));
});

test("legacy hyphenated tag URLs retain their actual article membership", async () => {
  const routes = await getPageRoutes(await getPosts());
  const energy = routes.find(
    (route) => route.params.path === "tags/energy-equation",
  );
  assert.ok(
    energy.props.posts.some(
      (post) => post.slug === "einstein-mass-energy-equation",
    ),
  );
});

test("all historically populated taxonomy pages retain their original articles", async () => {
  const { taxonomies } = JSON.parse(
    await readFile("data/legacy-compat.json", "utf8"),
  );
  const routes = await getPageRoutes(await getPosts());
  for (const [url, slugs] of Object.entries(taxonomies)) {
    const route = routes.find(
      (route) => "/" + route.params.path + "/" === decodeURI(url),
    );
    assert.ok(route, url);
    for (const slug of slugs)
      assert.ok(
        route.props.posts.some((post) => post.slug === slug),
        `${url}: ${slug}`,
      );
  }
});

test("page-one navigation normalizes numbered archive paths to persistent URLs", async () => {
  const { paginationUrl } = await import("../src/lib/pagination.mjs").catch(
    () => ({}),
  );
  assert.equal(typeof paginationUrl, "function");
  for (const path of ["/blog/page/2/", "/page/2/"]) {
    const url = paginationUrl(`https://xiongyingqi.com${path}`, 1, "", "");
    assert.equal(url.pathname, "/blog/");
    assert.equal(url.search, "");
  }
  assert.equal(
    paginationUrl("https://xiongyingqi.com/archives/page/3/", 1, "go", "")
      .pathname,
    "/archives/",
  );
});
