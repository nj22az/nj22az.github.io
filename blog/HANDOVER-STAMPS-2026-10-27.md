# Blog: rubber-stamp pictures of Minato — 27 October 2026

The owner: "Make the rubber stamp images from Minato for the blog" (after the site audit proposed one picture per
article, shot in Johansson World on the real places, printed in the Rubber stamp Look).

**State: published to main on the owner's word ("Yes publish and fix Mossy everywhere"); see the end of this note.**

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
- **Mossy theme fixed everywhere:** it set `word-break: break-all` on every page (`css/themes.css`), which split
  English words anywhere ("Thu ận"). Now `word-break: normal` (Japanese still breaks between characters on its own);
  `styles.css` imports `themes.css?v=mossy-words-1`, and the blog-only workaround in `css/blog-stamps.css` is removed
  (`CSS_VERSION` 5). Checked in Mossy at 390 px: home, blog, an article, World: whole words, no overflow.

## Published

On the owner's word ("Yes publish and fix Mossy everywhere") as
[`d4b3b5a4`](https://github.com/nj22az/nj22az.github.io/commit/d4b3b5a47feaebe8115d20054a2dec718eba224a) (main merged in
first: World work only, no conflicts). Live: the 14 changed pages and scripts and all 27 stamp images match the commit
byte for byte; every article shows its picture with no errors and no overflow at 1440 and 390 px; Mossy breaks between
words on the home page, the blog, an article and World.

## Vietnam: Pixar Thuan (27 October 2026, later)

The owner: "Make a stamp for the Vietnam post too, you can do it with Thuan, she is Vietnamese", then "and remember to
use Pixar Thuan". Not a World shot: Pixar Thuan's hero render from Johansson Studio (`nj22az/jojo`, branch `pixar`,
`3d/cast/renders/thuan-hero.jpg`, her plain studio backdrop), printed by `tools/stamp-filter.py` (new: a rubber-stamp
print of any colour render, solid grainy darks, a speckle in the mid-tones, inked outlines) with
`--crop 0.12,0.12,0.88,0.50`, then placed by `build-blog-stamps.py` like the others (shot `vietnam`, its `source`
recorded in the shot list). Tried and dropped: the PORT 88 coffee render in Sakura's cold-cabinet corner (the busy,
blurred shelves printed as heavy blobs; weighting ink by focus made the whole print pale). A World shoot of the
game's Thuan was started and stopped when the owner asked for Pixar Thuan. **Published on the owner's "Yes" as `9cbb9761`; live files match and the stamp shows on the post and in the blog list.**

## Hotel stay posts (27 October 2026, later)

The owner: "Make a stamp for the hotel stay posts too, and use the rubber stamp shader it looks good". Minato has no
hotel, so each post has the Minato place that matches its story, shot in World's Rubber stamp Look:

| Post | Shot | Why |
| --- | --- | --- |
| Hotel Marina | `stay-marina`: Harbour Park, `park/wide` | the hotel by the sea |
| Best Western Plus Odense | `stay-odense`: the main street, `onsen/push` camera outdoors | the long walk from the parking |
| Scandic Rosendahl | `stay-rosendahl`: inside Sakura, `market` room, `sakura/push` | paying at the counter, one bill |
| Scandic Laajavuori | `stay-laajavuori`: Umi-no-yu's front desk, `onsen` room, `onsen/wide` | the free spa |

The shoot tool can now enter an interior first (`"room"`, as `render-feed-backdrops.mjs` does; without it an interior
camera photographs the street outside) and keeps Johansson `"back"` metres behind the lens, with his hands hidden.
Tried and dropped: the empty pier (`pier/wide`, `pier/low`), the sea from Fumoto square, Rainflower Lane. Each post's
link preview is now its stamp (Laajavuori's was its entrance photo; the photos stay in the post). **On the branch;
awaiting the owner's word.**
