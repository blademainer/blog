# Astro Migration Verification

## Local Checks

- `npm run check`: 20 tests passed; Astro built 249 routes; 253 HTML outputs and all local link/asset targets verified.
- Baseline retained: 47 public articles, 39 local PlantUML images, 47 GitHub discussion entry points, 304 original heading anchors, and 140 historical archive/category/tag routes.
- Independent review identified five P2 compatibility bugs. Singular `tag` metadata, legacy taxonomy membership, heading anchors, new-post authoring, and persistent page-one URLs now have regression tests. Each original failure was reproduced before the fixes.
- The newly merged upstream background/blogroll fix (`cae7d21`) is retained; original Markdown is unchanged.
- Existing game files are copied from the deployment repository without recompilation; legacy personal-page and 404 entry points remain reachable.

## Built-in Browser

No native-app automation was used after the user's instruction to use the built-in browser only.

- Desktop: 1280 x 720 and 1440 x 900, no page overflow, images loaded, product and blog navigation functional.
- Mobile: 320 x 640 and 390 x 844; longest product title fits, mobile menu opens and closes with Escape and after navigation.
- Blog: empty search, reset, category filtering, pagination, persistent page-one URL after refresh, and the old `/tags/energy-equation/` route checked interactively.
- Article: KaTeX formulas rendered, migrated diagrams loaded, original GitHub issue link retained, and no article scripts injected.
- Product: directory navigation, FAQ expansion, installation links, explicit prerelease label and verified DMG link checked.

Browser-only screenshots are kept locally in the ignored `artifacts/qa/` directory. Publication and live-domain checks are recorded after deployment.
