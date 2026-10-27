# Hotels & Parking banner: Tetsuo at the wheel — 27 October 2026

The owner: "Use the in game graphics of Tetsuo in his car move the camera freely and compose a great image and try
the different shaders and make a banner for the hotel website make a pdf that I can review with suggestions", then,
on the Cartoon cab shot: "Yeah it looks awesome build the banner pls with python".

**State: built for review, not on the page.** Nothing in `blog/hotels/index.html` changed. The review PDF and the
banner files were delivered from the session scratch; the page waits for the owner's choice (see the PDF's last page).

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
