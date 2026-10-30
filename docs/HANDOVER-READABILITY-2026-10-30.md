# Homepage readability audit and fixes — 30 October 2026

The owner asked whether the `nextlevelbuilder/ui-ux-pro-max-skill` skill (already in `.claude/skills/ui-ux-pro-max`) could improve the site, then: "Yes do it". It was used as an **audit checklist only** (priority 1–2 rules: text contrast 4.5:1, large text 3:1, labels ≥ 12px, touch targets ≥ 44px, descriptive link names). Its style and palette generator was **not** used: the site keeps its own design and its eleven themes.

## What was checked

The homepage (`/`), served locally, in Chromium (Playwright), **every theme** (`cobalt mossy cute colorgrid crimson inkcraft clarity horizon swift botanical popwave`, forced with `data-theme-lock`), at **1440×900** and at **390×844 with touch**. axe-core 4 (WCAG 2 A/AA + best practice), after the scroll-reveal animation had finished (checking during the fade gives false contrast failures). Google fonts, map embeds and Shopify were blocked in the test, so the map cards were blank there.

| | Before | After |
| --- | --- | --- |
| axe violations, 22 runs (11 themes × 2 sizes) | 5–56 per run, all `color-contrast` | **0 in all 22** |
| Small touch targets on the phone (cobalt) | 16 | 6 (nav brand 175×31; short footer links 28–41 px wide but 44 px tall) |
| Text under 12px on the phone (cobalt) | 63 elements | 29, all deliberate (see below) |
| Horizontal scroll | none | none |

The worst themes were **cute** (56), **colorgrid** (44) and **popwave** (35). Five mock-up labels in the Maintenance Desk preview failed in every theme.

## What changed

- **`css/readability.css`** (new, imported last from `styles.css`, `?v=3`): darker shades of each theme's *own* accent where it is used as small text (location labels, "Browse all articles", section subtitles and label bars, cute's section headings at 3:1); popwave's pink darkened to `#d80d6c` behind white text (About band, footer) and `#d00c6a` for pink text on white; white small print on the crimson and popwave footers; a 12px floor for captions and labels; 44px targets on touch screens (footer links, "Browse all articles", Back to top, the Day/Night switch). Each colour was computed as only as dark as AA needs.
- **Popwave bug found on the way:** the seal in the About card was white on the white card (invisible). Now `#d00c6a`.
- **`css/tokens.css`:** `--ink-faint` (and cute's `--ink`/`--ink-light`, colorgrid's `--ink-light`) darkened in mossy, cute, colorgrid, crimson, clarity, horizon and swift. These tokens are text colours site-wide, so **subpages get the same improvement**; the one non-text use is a border in `shop/css/products.css`, now slightly darker.
- **`css/project-explorer.css`:** three mock-up greys (`#67786d`, `#7d867f`, `#748077`) to `#627368`, `#6d756f`, `#6a756d`.
- **`assets/js/blog-feed.js`:** each "Read article →" / "Read part N →" link gets an accessible name with the article title (it keeps its visible words first, WCAG 2.5.3). `tools/blog-feed.test.cjs` passes.
- **Cache versions:** `index.html` (`styles.css`, `project-explorer.css`, `blog-feed.js?v=3`), `blog/index.html` (`blog-feed.js?v=3`).

Deliberately left alone: the hero eyebrow stays 10px on phones (at 12px it puts one word on a second line); the phone tab-bar labels (10px, the iOS convention); text inside the miniature mock-ups (Maintenance Desk, StepWise, book cover); the SVG seal's lettering; both "Psst…" asides (the owner's choice; see below).

## Checks actually run

- axe-core across 22 theme/size runs: 0 violations; no horizontal scroll.
- Screenshots compared before/after: phone hero unchanged; popwave, cute and botanical lower page keep their character.
- `/` and `/blog/`: no page errors; the new link names render.
- `node tools/blog-feed.test.cjs`: PASS.
- Note: on plain `http://localhost` the feed's `safeUrl()` returns `''` for every link (it only accepts https). That is expected locally and not a bug on Pages.

**Not checked:** real iPhone/Safari, other pages besides `/` and `/blog/` after the token change, the live site after publishing.

## Suggestions not implemented (owner's decision)

- Two "Psst…" asides (Pocket Camera above the projects, the private course below them) compete with the hero's two buttons. One per page, or the course link moved into the Sjöskolan card, would sharpen the opening.
- The homepage is about 10,300 px tall on a phone; the six project cards are each 830–1,020 px. A collapsed "What can I do here?" already exists; shorter card previews on phones would cut it most.

## State

Branch `claude/homepage-readability`, PR to `main`, **not merged: publishing waits for the owner's word.**
