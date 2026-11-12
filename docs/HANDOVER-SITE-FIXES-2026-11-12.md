# Site fixes — sitemap, redirects, heading, README — 12 November 2026

Small behaviour-preserving fixes on branch `cursor/site-audit-fixes-247f`, commit `d198937`. Pull request: https://github.com/nj22az/nj22az.github.io/pull/427. Not merged. Not pushed to `main`. Nothing under `ferry/` was edited.

## What changed

1. **`sitemap.xml`.** Redirect stubs `/world/` and `/sakura/` are replaced by `/johansson-world/` and `/johansson-world/sakura/`. Added the public pages the office already links: `/johansson-world/sakura/play/`, `/maintenance-demo/`, the blog catalogue (hotel stays, The Torn Poster, Vietnam, the two reflections) and the Swedish electrical articles plus `/blog/elteknik/sv/`. `/stepbuddy/` is not listed. Course labs, the teacher login and unfinished or `noindex` pages are not listed.
2. **`linux-port/index.html`.** Canonical, meta refresh and the script now go to `https://nj22az.github.io/johansson-world/`. The refresh uses `#linux`. The script keeps a hash already on the URL, otherwise `#linux`.
3. **Pocket Camera.** The Game Room title is an `h2`. The rules that drew it as an `h1` now name the `h2`, and those stylesheets' cache keys are `20261112heading`. `camera/tests/brand.browser.mjs` expects the `h2`.
4. **Project explorer.** No card uses `preview: 'sakura'`. That branch, its mascot key and the `.px-sakura` rules are removed. The image it asked for does exist on the World site at `/johansson-world/sakura/images/hero-serving-800.webp`, and nothing on this homepage requests it.
5. **Homepage.** The unused `shopify-book-price.js` tag is gone. It remains on the book page and the Swedish electrical articles, which do have a price element. Social `aria-label`s are GitHub, LinkedIn and Shop.
6. **`mizuhama-1988/index.html`.** `<html lang="en">`.
7. **`README.md`.** Describes the locked Clarity homepage, the project explorer, the current sections and the data files. The random-theme homepage, the 120px hero seal and the bento cards are no longer described as the live homepage.

## lastmod

Dates are the last commit that changed the page in this repository. Pages whose only commit is the 7 November 2026 publication snapshot use `2026-11-07`. The homepage and the ferry use `2026-11-12`. Pocket Camera uses `2026-11-12` because this change edits it (its previous content commit is 10 November). `/johansson-world/` and Sakura's pages use 6 November 2026 from `nj22az/johansson-world` (`site/index.html`, `site/sakura/index.html`, and the demo publish). `/johansson-town/` uses 10 November 2026 from `nj22az/johansson-town` `index.html`. Those two repositories are not in this tree.

## Checks actually run

Local server `python3 -m http.server 8765` on this branch. Headless Chrome at 1440×900, light appearance.

- Homepage: one `h1`, seven project cards, no `shopify-book-price` script, no `[data-shopify-book-price]`, social labels GitHub / LinkedIn / Shop.
- Pocket Camera title screen and Game Room: the Game Room heading is an `h2` reading "Game Room". Computed style matches the previous `h1` (LINE Seed JP, 48px, weight 800, letter-spacing −0.96px, line-height 48px, colour rgb(39, 72, 68), margin 8px 0, box 326×48). In dark the colour is rgb(255, 255, 255).
- Pixel compare of the desktop screenshots: the camera title screen and the Game Room are identical (0 changed pixels). The homepage differs only inside the harbour picture (the arrival is moving); the rest of the 1440×900 frame matches.
- Pages that returned 200 with no new page errors: `/`, `/blog/`, `/blog/the-torn-poster/`, `/blog/vietnam/`, `/blog/scandic-laajavuori-jyvaskyla/`, `/hotels/`, `/maintenance-demo/`, `/camera/`, `/linux-port/install/`.
- `/linux-port/` with no hash landed on `https://nj22az.github.io/johansson-world/#linux`. With `#downloads` it landed on `https://nj22az.github.io/johansson-world/#downloads`. No console error on that navigation.
- `node --check` on `assets/js/project-explorer.js` and `camera/tests/brand.browser.mjs`. Sitemap XML parses as 34 URLs.
- After the first CI run, `node tools/build-camera-offline.mjs` regenerated `camera/offline.json` and the pin in `camera/sw.js`. `node camera/tests/offline.test.mjs` passed. The new entries are only the four Game Room stylesheets and `camera/index.html`.

## Limits

`johansson-town/` is not checked out in the published tree (it is a separate repository). Because of that, these 404s were already true before this change and are still true: the homepage's town portrait, Pocket Camera's `looks.js` and `face.js`, and `/mizuhama-1988/`'s redirect to `/johansson-town/`. `/maintenance-demo/` logs a missing `/favicon.ico`, which this change did not add. The Pocket Camera browser suite was not run locally; the brand test's heading assertion was updated and the heading was checked in Chrome as above. Not tried on a phone.

The Pocket Camera MCP job compares `camera/app.js` import keys with `johansson-town/tools/camera/session.mjs`. This branch does not change `camera/app.js`. On `main` those keys are already `looks-gl.js?v=20261110green1` and `frames.js?v=20261110green1`, while the Town adapter still imports `looks-gl.js?v=20261103face1` and `frames.js?v=20261029f`. The job fails with “Adapter cache key differs: looks-gl” because any change under `camera/` runs it. Updating the adapter belongs in the Town repository.

## Follow-up on the same pull request

The header shortcut in `assets/js/office-calendar.js` now goes to `/johansson-world/`. The homepage no-script list goes to `/johansson-world/#downloads` and `/johansson-world/sakura/`. The Linux install guide’s two links keep their hashes: `/johansson-world/#demo-guide` and `/johansson-world/#demo-limits`. The `/world/` redirect page is still there. `theme-bootstrap.js` still recognises that page so a visit to the stub keeps its palette. The frozen homepage baseline under `tools/office-home/baseline-0f13c23b/` was not changed.

Checked in headless Chrome on the local server. The header link’s address is `/johansson-world/`; clicking it lands on `/johansson-world/` and the page does not request `/world/`. The install page’s header and the two guide links are the canonical addresses, and that page raises no console error. The homepage’s one console error is the missing town portrait, already true because `johansson-town/` is not checked out. Live, `https://nj22az.github.io/johansson-world/` and `/johansson-world/sakura/` answer 200, and the World page has `downloads`, `linux`, `demo-guide` and `demo-limits`.

## Left as they were

Nothing under `ferry/` was edited.
