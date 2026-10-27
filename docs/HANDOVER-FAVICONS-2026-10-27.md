# Favicons redrawn as pixel icons — 27 October 2026

The owner: "Can you redraw the favicon for the office of Nils Johansson and make a special
one for the Hotel and the Johansson World? Draw in python, use simple Lucid or pixel icons."

**Source of truth: `tools/draw-favicons.py`.** Each icon is a 16×16 pixel grid in the
script; it writes the SVG (one rect per pixel run, `crispEdges`) and the PNG sizes the
pages need. Edit the grid, run `python3 tools/draw-favicons.py --preview out.png`, and
commit the outputs. Never edit the SVGs or PNGs by hand.

| Icon | Picture | Files | Used by |
| --- | --- | --- | --- |
| Office | white pixel **NJ** on the seal's teal `#3ea88c` | `assets/images/favicon.svg`, `assets/images/apple-touch-icon.png` (180, rounded) | every page that linked them before (home, blog, articles…), unchanged links |
| Hotels & Parking | white pixel bed on free-parking green `#15803d` | `assets/images/favicon-hotels.svg`, `assets/images/apple-touch-icon-hotels.png` | `blog/hotels/` (linked from `tools/build-hotels.py`) |
| Johansson World | red-roofed house, sun and sea on the island's navy `#294b60` | `johansson-town/assets/icons/town.svg`, `town-192.png`, `town-512.png` (full-bleed, since the manifest marks them maskable) | the World app (`johansson-town/index.html`, `manifest.webmanifest`, `sw.js`), `world/index.html` (now linked), `avatar-creator/` |

On branch `claude/peaceful-clarke-fprqk3`, not yet on main. Checks: the hotel page
rebuilt and its 18 unit tests pass; icon links on `/`, `/blog/hotels/` and `/world/`
verified on a local server; the preview sheet at 16, 32, 64 and 180 px reviewed. Not run:
`johansson-town/tools/check-installable-app.mjs` (it only fetches the icons, no byte
check). Installed copies of the World app keep the old icon in their cache until the next
service-worker version; the browser tab picks the new one up on reload.
