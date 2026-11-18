# Animation Studio section · 18 November 2026

The homepage put Chisum and Johansson World in the same grid as utilities and teaching material. Sakura Shōten appeared as a secondary World action. The live `/world/` and `/sakura/` entries are redirects to destinations in the separate World repository.

The new `/animation-studio/` landing page groups all three projects. It uses the approved vector sailor logo and existing project imagery. The homepage gives it a top navigation link and a dedicated introduction before Tools and learning. The project game URLs and old aliases keep their existing behavior. The sitemap now points directly to the canonical World and Sakura pages.

The changes were designed on `main` at `5285a7a4f5936c90380d8b5599f472057ecf6d76`. The owner approved publishing the scoped change to `main` on 18 November. The `development` parent `f7a2d5551a8633ef2f22ebd50958545dd99b020c` has independent ferry, camera and dock preview work and is not a release candidate as a whole.

Live HTTP checks returned 200 for Chisum, World, the Town game, Sakura and the Sakura browser demo. The World page contains the `downloads` anchor. The office review now verifies the studio route from the homepage, the three cards, six destination links, image loading, viewport fit and minimum target heights. The [development browser review](https://github.com/nj22az/nj22az.github.io/actions/runs/44246606310) passed all six profiles and its desktop and small phone studio screenshots were inspected. The [development harbour review](https://github.com/nj22az/nj22az.github.io/actions/runs/44246606437) passed. No physical-device test was performed.

The reviewed development commit is `f7141c55ae72f66099549b4072aa737fe0ef0684`. The release was prepared from `main` with that change scoped to the studio and homepage. See the [release verification](https://github.com/nj22az/nj22az.github.io/blob/development/docs/HANDOVER-ANIMATION-STUDIO-2026-11-18.md) for the production commit and live verification.

## Project status

The owner asked for a dedicated Project status page in the Studio and authorised publishing it. The landing page links to `/animation-studio/project-status/`. The checklist for *The Fog Never Gave Him Back* shows verified totals for the whole film and each group. The browser requests `film-status.json` every minute while the page is visible and immediately when it becomes visible again. Status changes preserve expanded sections.

The site update is scoped to `main` from `949e3dfa5d839560e60cfd875b6f1566ee7345f8`. The checklist begins at five of nineteen verified items. Update the JSON and the Stockholm timestamp when production evidence changes. Reserve “Verified” for a passed check. The page publishes progress text only.

Chromium verified the landing-page link, shared navigation, progress values, and viewport fit at 1280 × 900 and 390 × 844. A simulated status update advanced the bar without reloading and preserved a collapsed section. No physical-device check was performed.

GitHub Pages built the first project status publication from `5db7316624ecf68d1946c0192eb797cd46485a8c`. The landing link and status route returned HTTP 200, and the served JSON matched the committed file byte for byte. The first live data update records the stage-footing audit coverage and the new sole’s ground measurement. It leaves both items open.

The homepage and Animation Studio headers now show “Status” next to “Studio” in the shortcut row. The project status page marks the link as current. The first header placement in `7edb1e18af8c7a8038dc4b2adaa60570bfb1c7e0` competed with the homepage calendar on phones. The revised row was checked visually at 390 pixels. Chromium followed the link from both headers at widths of 320, 390 and 1,280 pixels. Both layouts stayed in the viewport and the link met the 44-pixel minimum target size in both dimensions.
