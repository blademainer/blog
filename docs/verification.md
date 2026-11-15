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

## Blue Theme

- Replaced the default green branding with blue `#2563eb`, a darker hover state, white surfaces, and neutral grays. Buttons, navigation, search focus, article links, quotes, and the favicon share the new palette. Installation warnings retain an amber accent; application screenshots are unchanged.
- Added three theme regression tests, including WCAG AA normal-text contrast checks for the primary button and selected text pairs. All 23 tests passed; the static build and local-link checks still verified 253 HTML files and 47 articles. The existing duplicate `/404` route warning remains nonfatal.
- Built-in browser checks: 1280-pixel desktop homepage, 390-pixel mobile homepage, 320-pixel homepage and product page; no horizontal overflow. Blog search returned two payment articles; active navigation and search focus were blue. Mobile navigation opened and closed with Escape; product images loaded and the prerelease DMG fallback remained intact.
- This changes the default light palette, not a new dark-mode or theme-switching feature. Historical routes, blog content, and the independent game are unchanged.

## Publication

- Source commit `c2854e1` passed [GitHub CI](https://github.com/blademainer/blog/actions/runs/43714692680).
- The existing deployment repository received workflow commit `9c2c78f`. [Initial Pages deployment](https://github.com/blademainer/blademainer.github.com/actions/runs/43714756897) succeeded, retaining `xiongyingqi.com` and enforced HTTPS. No DNS records changed.
- The public homepage now displays MacScreenCapture. The built-in browser verified the live blog search (two payment articles), an original article and its issue #21 discussion, and the historical `energy-equation` tag page.
- Real-time GitHub version lookup was unavailable in this browser; the explicit prerelease label and already-verified DMG fallback remained functional. This is an observed fallback, not proof of a successful live API lookup.

## Dependency Audit

`npm audit fix --omit=dev` applied the nonbreaking fix available for `debug`. The remaining report is 7 findings (4 low, 3 moderate; no high or critical). These involve the build-time math and stylesheet toolchain. No `--force` overrides or unreviewed major-version substitutions were applied. The site serves static output; this audit is not a claim that every existing independent game dependency has been remediated.
