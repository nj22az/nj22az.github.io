# Handover: the Office homepage as a painting · 13 November 2026

**State: on branch `claude/zealous-bell-teears`, not on `main`, not published. The owner has not yet seen or approved it.**

The owner asked for an audit of the site and for the Office of Nils Johansson to "look like an interactive painting really
with clear sections", populated with good assets from Johansson World, more modular, **without changing any Sjöskolan
link**, and changing only the Office's layout. During the work they added that Pocket Camera's shaders could be used.

## What changed (homepage only)

- **The opening is one painting.** `assets/world/sakura-current.webp` (the harbour road outside Sakura Shōten), drawn
  through Pocket Camera's own Looks by `tools/office-painting/build.py` into `assets/office-painting/street-<look>-<800|1600>.webp`
  (watercolour, print, sketchbook, manga, cyanotype, natural). Watercolour is the default and the only one loaded at first.
- **Brushes** ("Paint it as") swap the Look; the rest load on request. With a mouse, the pointer is a window through the
  paint to the game's own picture.
- **Section labels on the painting** (Explore, Create, Learn, Read) are the page's index: Explore goes to `#harbour`,
  Create and Learn open `#projects` on that filter, Read goes to `#blog`. On narrow screens they are a 2×2 grid under it.
- **The heading is the painting's wall label** (low right on desktop; first on phones). Its words and links are unchanged.
- **The port arrival moved** out of the opening into its own section, `#harbour` ("Someone is always arriving."), with the
  same `#office-port` markup, films and 3D harbour.
- Blog and About open with the same small label as the other sections.
- Modules: `css/office-painting.css`, `assets/js/office-painting.js`. No project card, link, filter or Sjöskolan URL changed.

## Checked

- `tools/office-home/review.browser.mjs` (now also clicks a brush and a section label, and measures their 44 px targets)
  and `tools/office-port/diorama.browser.mjs`: both pass locally, all profiles, with `nj22az/johansson-town` cloned as
  `johansson-town/`. Not run on GitHub: the workflows run on `development` and `main` only.
- Looked at in Chromium at 1280×800, 1440×900 dark and 390×844. Not looked at in Safari or on a real phone.

## Audit findings left alone (for the owner to decide)

1. The homepage journal shows the three newest posts, at present three hotel-parking notes in a row.
2. Locations is two Google Maps iframes: third-party, heavy, and the one part that is not in the house style.
3. `styles.css` chains 13 `@import`s and two Google Fonts requests of nine families; the Office uses three.
4. Section headers, About and Locations stay invisible until an IntersectionObserver fires (`.reveal`).
5. No Meshy model is in this repository; the only GLBs are in `maintenance-demo/models`, `polivoks/3d` and `ferry/blender/assets`.

## Next, if the owner likes the direction

Give each section its own painted header from the same builder (Chisum for Explore, a café photo for Create), and paint
the Locations as two small maps in place of the iframes.
