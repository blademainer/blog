import { getPosts } from "../lib/posts.mjs";
import { products } from "../data/products.mjs";
import { taxonomyGroups, taxonomyUrl } from "../lib/routes.mjs";
export async function GET() {
  const posts = await getPosts();
  const paths = [
    "/",
    "/apps/",
    "/blog/",
    "/about/",
    "/archives/",
    "/tags/",
    "/categories/",
    ...products.map((product) => `/apps/${product.slug}/`),
    ...posts.map((post) => post.url),
    ...["tags", "categories"].flatMap((key) =>
      taxonomyGroups(posts, key).map(([term]) => taxonomyUrl(key, term)),
    ),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>https://xiongyingqi.com${path.replace(/&/g, "&amp;")}</loc></url>`).join("")}</urlset>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
