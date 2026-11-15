import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://xiongyingqi.com",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  devToolbar: { enabled: false },
});
