import { access, cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "public");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const excluded = new Set([
  "_posts",
  "_drafts",
  "about",
  "categories",
  "tags",
  "404",
  "404.html",
  "Staticfile",
]);
for (const entry of await readdir(path.join(root, "source"))) {
  if (excluded.has(entry) || entry.startsWith(".")) continue;
  await cp(path.join(root, "source", entry), path.join(output, entry), {
    recursive: true,
  });
}
await rm(path.join(output, "assets"), { recursive: true, force: true });
await cp(path.join(root, "site-assets"), path.join(output, "assets"), {
  recursive: true,
});
// The existing independently-built game stays byte-for-byte intact when publishing.
for (const legacy of [
  process.env.LEGACY_ASSETS_ROOT,
  path.join(root, ".legacy/site"),
  path.join(root, "../blademainer.github.com"),
].filter(Boolean)) {
  try {
    await access(path.join(legacy, "game/index.html"));
  } catch {
    continue;
  }
  await cp(path.join(legacy, "game"), path.join(output, "game"), {
    recursive: true,
  });
  break;
}
await writeFile(path.join(output, ".nojekyll"), "");
