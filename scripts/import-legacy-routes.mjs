import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
const deployed = new URL("../../blademainer.github.com/", import.meta.url);
const files = execFileSync(
  "git",
  ["-C", deployed.pathname, "ls-tree", "-r", "--name-only", "-z", "HEAD"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
const routes = files
  .filter(
    (file) =>
      /^(tags|categories|archives)\//.test(file) &&
      file.endsWith("/index.html"),
  )
  .map((file) => `/${file.slice(0, -"index.html".length)}`);
await writeFile(
  new URL("../data/legacy-routes.json", import.meta.url),
  JSON.stringify(routes, null, 2) + "\n",
);
console.log(`Captured ${routes.length} historic archive/category/tag routes.`);
