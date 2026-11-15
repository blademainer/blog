import test from "node:test";
import assert from "node:assert/strict";
import { selectRelease, releaseAsset } from "../src/lib/releases.mjs";

const asset = {
  name: "App.dmg",
  browser_download_url:
    "https://github.com/blademainer/screen-capture/releases/download/v1/App.dmg",
};
const version = (tag_name, prerelease, published_at) => ({
  tag_name,
  prerelease,
  published_at,
  assets: [asset],
});

test("stable releases take priority over newer prereleases", () => {
  assert.equal(
    selectRelease([
      version("v2-rc", true, "2026-11-15"),
      version("v1", false, "2026-10-01"),
    ]).tag_name,
    "v1",
  );
});
test("prerelease-only repositories expose the latest test version honestly", () => {
  assert.equal(
    selectRelease([
      version("v1-ci.1", true, "2026-11-01"),
      version("v1-ci.2", true, "2026-11-15"),
    ]).tag_name,
    "v1-ci.2",
  );
});
test("draft, missing assets and unsafe download URLs never replace the fallback", () => {
  assert.equal(
    selectRelease([
      { ...version("draft", false), draft: true },
      { tag_name: "empty", assets: [] },
    ]),
    null,
  );
  assert.equal(
    releaseAsset(
      {
        assets: [
          { ...asset, browser_download_url: "https://evil.example/App.dmg" },
        ],
      },
      ".dmg",
    ),
    undefined,
  );
  assert.equal(selectRelease({ message: "API rate limit exceeded" }), null);
});
