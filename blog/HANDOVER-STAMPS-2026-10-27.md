# Blog: rubber-stamp pictures of Minato — 27 October 2026

The owner: "Make the rubber stamp images from Minato for the blog" (after the site audit proposed one picture per
article, shot in Johansson World on the real places, printed in the Rubber stamp Look).

**State: built on branch `claude/peaceful-clarke-fprqk3`, not on main; review sheet sent, waiting for the owner's word.**

## What each page gets

| Page | Picture (Minato) |
| --- | --- |
| `/blog/` | header: the harbour pier at dusk; and a small print beside each article that has one |
| The Torn Poster | Sakura Shōten's front, **list only** (the page has its film poster, comic and cover) |
| The navigation light (EN, SV) | the Minato Maru at dusk, her lights on |
| Three-phase power (EN, SV) | the main switchboard's generator panels and the engine console |
| Before you open the switchboard (EN, SV) | the engine control room: switchboard and console |
| The insulation alarm (EN, SV) | the synchronising and feeder panels with the three earth lamps |
| The pump that will not start (EN, SV) | the fire pumps in the engine room |
| Captain Bligh | the bridge |
| The Discipline of Building Something That Lasts | the electrical workbench |

Not given a picture: Vietnam (nothing in Minato fits it) and the hotel stay posts (they have the owner's photos or
the Hotels banner). Each article picture also becomes its link preview (`og:image`, 1200 × 600 JPEG).

## How it is made

1. **Shoot:** `node johansson-town/tools/minato-stamp-shoot.mjs <out> --looks stamp,none [--only a,b]` boots World,
   parks the ferry alongside in town, and photographs each shot in `johansson-town/tools/minato-stamps.json`
   (a storyteller camera from `views.json`, a point in the ship's own frame, near the ferry, or world coordinates).
   People within `clear` metres of the lens (default 2.2) are hidden, so no head blocks the camera; people further
   off stay. The audit camera ignores `fov`; a `crop` in the shot list frames tighter in the builder instead.
2. **Build and place:** `python3 tools/build-blog-stamps.py --from <dir of <name>--stamp.png>`; `--check` fails if a
   page is out of date. It flattens the Look's paper (its vignette), keeps the ink as transparency and writes
   `assets/images/blog/stamps/<name>.webp` (1400 × 700), `<name>-thumb.webp` (480 × 240, the list) and
   `<name>.jpg` (the preview). The page shows it as a CSS mask over its theme accent darkened towards black
   (`css/blog-stamps.css`), so the print takes each visit's colour and pale themes stay readable.
   Raise `CSS_VERSION` in the builder with every change to the stylesheet.
3. Renders kept in the session scratch only; reshoot with step 1. Shots tried and dropped are in the shot list
   (`blog-harbour-ferry`: the camera stood over a roof).

## Checks (27 October 2026)

- Three rounds of shooting, every frame judged: heads at the lens hidden (three shots), the pump reframed and cropped,
  the switchboard lowered under the cable trays, the roof-blocked header dropped.
- `build-blog-stamps.py --check` PASS; rerun is idempotent (one picture per page). `blog-feed.test.cjs` PASS.
- Chromium, 1440 and 390 px, all 10 pages: the right picture loads, no horizontal overflow, no errors; Swedish pages
  in their text column; Cobalt, Mossy, Cute, Crimson and others checked by eye. List thumbnails 20–40 KB each.
- Found, not fixed site-wide: the **Mossy theme sets `word-break: break-all` on every page** (`css/themes.css:176`),
  which splits English words anywhere. `css/blog-stamps.css` sets normal breaking on the blog pages it styles; the
  rest of the site still has it in Mossy.
