# Hotels & Parking banner: Tetsuo at the wheel — 27 October 2026

The owner: "Use the in game graphics of Tetsuo in his car move the camera freely and compose a great image and try
the different shaders and make a banner for the hotel website make a pdf that I can review with suggestions", then,
on the Cartoon cab shot: "Yeah it looks awesome build the banner pls with python".

**State: Rubber stamp is on the page** (the owner chose it: "Rubber stamp"); see "On the page" below.

- **Shooting:** `johansson-town/tools/tetsuo-banner-shoot.mjs <out> --shots … --looks … --time 17:40 --size WxH`.
  Boots the compiled World, puts the real Tetsuo at the wheel of his own kei truck on `main-south` outside Sakura
  Shōten, holds traffic, hides other vehicles within 30 m and moves Johansson behind the camera, then renders free
  camera setups defined in the truck's own frame (aimed at the truck's world bounding box) in each Look.
  Software Chromium needs about 6 minutes to boot; after about 12 new Looks in one boot the browser can crash, so
  render large Look sets in two runs.
- **Chosen frame:** setup `cab` (f 3.2, s −2.2, y 1.35 m; look at the cab), Look `flat` (Cartoon), 17:40.
  Runners-up in the PDF: Oil painting and Natural. All 19 Looks were rendered for `cab` and `profileB`.
- **Layout:** `tools/build-hotel-banner.py <frame.png> [--out dir] [--truck-x 0.47]` (Pillow): `banner-desktop`
  2400×800 (title on the left third, kept clear of the cab), `banner-phone` 1200×900 (title in the sky), and `art-*`
  without text for a page that keeps the title as HTML. PNG and WebP.
- Built from a 3600×1200 render of the same frame (the phone crop now comes from 1600 px, not 1067). WebP sizes:
  desktop art 230 KB, phone art 121 KB.

Recommended for the page (PDF): the art without baked-in text, title and short line as HTML over it, `<picture>`
with the 4:3 crop at ≤ 600 px, scope line under the banner, alt text naming Tetsuo and Sakura Shōten.
Not done: wiring into the page, physical-device check.

## The owner's picks: Rubber stamp and Risograph

The owner: "I do love rubber stamp can you use that or Risograph". Both rendered at 3600×1200 (cab, 17:40) and
built with `--style stamp` / `--style riso`: the title as printed matter (a stamped burgundy label with a double
border, or a teal-and-coral two-plate riso tag slightly out of register) on the frame's own paper, sized to end
before the truck. Print Looks save WebP at quality 75: Rubber stamp 334 KB desktop / 259 KB phone, Risograph
873 KB / 497 KB (halftone dots barely compress). Mocked on the page with the label baked into the art and the page
title kept visually hidden. Recommendation in the refreshed PDF: Rubber stamp for the page, Risograph for
posters or social images. The owner chose Rubber stamp.

## On the page

- `python3 tools/build-hotel-banner.py <cab--stamp.png> --style stamp --site --out blog/hotels/banner` writes the
  site files: `banner-desktop` (2400×800) and `banner-phone` (1200×900), each as WebP (q75) and a progressive JPEG
  fallback (q84). Desktop 334 KB WebP / 504 KB JPEG; phone 259 KB / 361 KB. Source: a 3600×1200 render of `cab` in
  Rubber stamp at 17:40 (session scratch, not committed; reshoot with `tetsuo-banner-shoot.mjs`).
- `tools/build-hotels.py` header: the `<h1>` stays real text but is visually hidden (`hotel-sr`), because the label
  is baked into the art; a `<picture>` serves the 4:3 crop at ≤ 600 px and the 3:1 frame above that, with
  `width`/`height`, `fetchpriority="high"` and alt text naming Tetsuo, his kei truck and Sakura Shōten. The count
  line sits under it. `og:image` and `twitter:card summary_large_image` now use the desktop JPEG.
- `css/hotels.css` (`?v=10`): `.hotel-banner` (rounded, cream fallback, fixed aspect ratio so nothing shifts while it
  loads); the page header loses its 760 px cap so the banner spans the content width (1232 px at 1440, 786 at 834,
  350 at 390; no horizontal overflow).
- Cost on phones: the first hotel post moves from about 832 px to 1,139 px down the page (the banner is 263 px tall).
  The feed harness's phone threshold is raised from 1,000 to 1,200 px for it.
- Checks: `build-hotels.py --check` PASS (136); `build-hotels.test.py` OK; `hotel-theme.test.cjs` PASS; `flags.cjs`
  19/19. `feed.cjs` with OSRM blocked: 42/46 + the raised threshold. The three remaining failures need road routing
  (road total, stop times, numbered picks); OSRM's `table` endpoint reset every connection from this sandbox at the
  time (curl too), while its `route` endpoint answered 200. Not a page change: no script was touched.
