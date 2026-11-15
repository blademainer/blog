import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");
const tokens = Object.fromEntries(
  [...css.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)].map((match) => [match[1], match[2]]),
);

function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("the default theme uses shared blue accents without legacy green tokens", () => {
  assert.equal(tokens.accent, "#2563eb");
  assert.equal(tokens["accent-hover"], "#1d4ed8");
  assert.ok(!css.includes("--green"));
  assert.match(css, /\.button-primary\s*\{[^}]*background:\s*var\(--accent\)/);
  assert.match(css, /\.blog-pagination button\[aria-current="page"\]\s*\{[^}]*background:\s*var\(--accent\)/);
});

test("blue theme text pairs meet WCAG AA normal-text contrast", () => {
  for (const [foreground, background] of [
    ["#ffffff", tokens.accent],
    ["#ffffff", tokens["accent-hover"]],
    [tokens.accent, "#ffffff"],
    [tokens["accent-hover"], tokens["accent-soft"]],
    [tokens.ink, "#ffffff"],
    [tokens.muted, tokens.soft],
  ]) {
    assert.ok(foreground && background, "theme color must be defined");
    assert.ok(contrast(foreground, background) >= 4.5, `${foreground} on ${background}`);
  }
});

test("the favicon matches the blue brand with a white monogram", async () => {
  const favicon = await readFile(new URL("../site-assets/favicon.svg", import.meta.url), "utf8");
  assert.match(favicon, /fill="#2563eb"/);
  assert.match(favicon, /fill="#ffffff"/);
});
