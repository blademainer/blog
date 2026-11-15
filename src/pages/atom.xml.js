import { getPosts } from "../lib/posts.mjs";
const escape = (text) =>
  String(text).replace(
    /[<>&"']/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[character],
  );
export async function GET() {
  const posts = await getPosts();
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Blademainer 博客</title><id>https://xiongyingqi.com/blog/</id><link href="https://xiongyingqi.com/atom.xml" rel="self"/><link href="https://xiongyingqi.com/blog/"/><updated>${posts[0].updated}T00:00:00Z</updated>${posts.map((post) => `<entry><title>${escape(post.title)}</title><id>https://xiongyingqi.com${escape(post.url)}</id><link href="https://xiongyingqi.com${escape(post.url)}"/><published>${post.date}T00:00:00Z</published><updated>${post.updated}T00:00:00Z</updated><summary>${escape(post.description)}</summary></entry>`).join("")}</feed>`,
    { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } },
  );
}
