# Japanese design gallery and REA review — 1 November 2026

## Outcome and scope

Research and proposed design specification for The Office of Nils Johansson. No homepage, navigation, project application or course presentation has been changed by this audit.

Recommendation: keep a consistent, quiet office identity across the portal; use the gallery's MUJI reference for restraint, Nintendo for clear visual project discovery, note for reading, and Hoshino Resorts for managing distinct projects under one recognisable parent site. Keep Johansson World's characters, maritime setting, existing harbour arrivals and opt-in 3D viewer.

The gallery is a third-party reconstruction and token collection. Its previews are not the official brands' live sites, and sample product/news copy is not factual evidence. Treat its typography, layout and interaction patterns as references; implement original components and use the existing assets.

## Evidence and actual method

- Published source inspected: main `0f13c23b6700b4d0ab28e1808d801f5d51e4e111`.
- Gallery source inspected: `kzhrknt/awesome-design-md-jp`, commit `22301516890616a0f8f61e012c365f4d0eb6d478`.
- REA pinned to the repository's `rea-agents@6.7.0`.
- [Hosted REA run 41347239254](https://github.com/nj22az/nj22az.github.io/actions/runs/41347239254) succeeded.
- Four website scripts parsed: `theme-bootstrap.js`, `assets/js/project-explorer.js`, `assets/js/office-diorama.js`, `shared.js`. 3,721 AST nodes visited; zero parse failures. Source-selected coverage excludes fourteen inventoried files; this is not a whole-site execution, accessibility, performance or security audit.
- Gallery inline script parsed separately: 215 AST nodes visited; zero parse failures. The original filter and modal functions were inspected as inert source. No third-party target scripts were executed by REA.
- Website evidence ID: `ev_96575b0d083e5fefd189babadc74b342a945fdd3d53c3519af1a7bf7b776c636`.
- Gallery evidence ID: `ev_72da5b1868b4a6bb61e01e207b2b26c444bc8fa29fbba442b134e6c69bd7ff48`.
- [Compact REA summary](../release-evidence/japanese-design-2026-11-01/rea-summary.json), [source provenance](../release-evidence/japanese-design-2026-11-01/provenance.json) and [live DOM measurements](../release-evidence/japanese-design-2026-11-01/measurements.json).
- Full canonical JSON is retained in the hosted run's `japanese-design-rea-evidence` artifact, subject to GitHub retention.
- Independent visual inspection: production homepage and project collection, plus the MUJI and Nintendo gallery previews, through the supported browser. Source/token documents also reviewed for note and Hoshino Resorts.
- Local REA initially refused child-process startup because this environment's `ps` cannot resolve its own process. An attempted distribution-package download also failed. No process checks were spoofed or disabled; hosted Linux completed the analysis normally.

REA establishes source locations and relationships, not visual quality. The design judgements below combine that source evidence with separate live observations.

## Priorities

| Priority | Observation | Recommended change | Relevant files |
|---|---|---|---|
| 1 | Eleven themes are randomly selected on homepage visits, but the opening and navigation use fixed cream/ink/yellow colours. The inspected visit showed pink project headings beneath the cream hero. | Choose one stable office palette and type system for the full portal. Retain alternative themes as an explicit optional choice if wanted. | `theme-bootstrap.js`, `shared.js`, `css/tokens.css`, `css/office-home.css` |
| 2 | The desktop project grid was about 3,076 px tall for six projects; the World card was about 1,006 px tall, with details closed. The remaining paired cards were about 761–781 px tall. | Control thumbnail aspect ratios, reduce repeated metadata, make card bodies more compact and use one clear primary action per card. | `css/project-explorer.css`, `assets/js/project-explorer.js`, `css/office-mascots.css` |
| 3 | World already appears in the hero, a dominant full-width project card and navigation; Camera has a separate promotion band and its own card. | Organise discovery around three clear intentions: Explore, Create/use tools, Learn. Give World and Camera strong but balanced coverage, with engineering tools and learning equally easy to find. | `index.html`, `config.js`, `assets/js/project-explorer.js` |
| 4 | Typography mixes theme-dependent families with fixed system-font project cards; the hero font and wraps can change between visits. Some preview metadata is 9–11 px in source. | Use a small shared type scale. Main card summaries at 16 px; functional labels generally 13–14 px. Reserve very small type for nonessential decoration. | `css/tokens.css`, `css/project-explorer.css`, `css/office-home.css` |
| 5 | Character promotions occupy separate 116 px and 100 px bands in the inspected layout. The owner explicitly requested those guides. | Keep the characters and destinations, but integrate the Camera guide with its project feature and the private-course guide with learning. Use the same illustration treatment and spacing. | `index.html`, `css/office-camera-psst.css`, `css/office-private-course.css` |
| 6 | The gallery demonstrates clear reading hierarchies and distinct product identities under one parent site. | Apply consistent article measures and a recognisable shared site shell, while keeping Pocket Camera's black UI, World's cartoon style and Sjöskolan's established course system. | Blog styles and shared portal components; do not apply portal CSS inside the apps/course |

### Source anchors and interpretation

REA recovered `getPageTheme` at `theme-bootstrap.js:55–67`, `chooseDifferentTheme` at lines 48–53 and `randomIndex` at lines 26–35. Direct source inspection establishes the eleven eligible IDs and the homepage rerandomisation. `shared.js:121–135` applies the selected theme. Existing `data-theme-lock` support offers a bounded way to prototype a stable portal style; do not remove theme controls or change the default until implementing that approved design direction.

`css/office-home.css` fixes the hero to `#f8f7f2` / `#202b36`, while project section headings use theme variables. This explains the observed mismatch.

The World card's image is a portrait asset, declared 540 × 960, inside an auto-sized grid row. Its observed image panel is approximately 565 × 1,004 px, almost exactly the portrait ratio. Combined with `height:100%` in the indefinite row, intrinsic image sizing is a strong explanation for the oversized card. This is an implementation inference, not a completed fix. Test an explicitly sized/aspect-controlled media frame with an absolutely fitted image, then verify both themes and breakpoints.

The gallery's original `openModal` and `closeModal` functions are recovered at `inline-0.js:15–25`. It provides filters, deferred iframe preview assignment, Escape and backdrop closing. The inspected handler does not implement focus trapping/restoration; its HTML uses a plain div modal. Do not transplant it as a finished accessible dialog. The current site already has filters and lazy app loading; retain those capabilities rather than rebuilding them because a reference has them.

## Proposed visual specification

These are original proposed values adapted to the existing website, not a copy of any brand's identity.

| Role | Proposed treatment |
|---|---|
| Main surfaces | Existing paper `#f8f7f2` and card `#fffef9` |
| Primary text | Existing ink `#202b36` |
| Supporting text | Existing `#53616c`; verify contrast on each final surface |
| Maritime accent | Restrained teal, proposed `#245e64`, used consistently for links/section cues |
| Primary action | Existing yellow `#ffe032` with dark text |
| Typography | One stable heading family and one body stack. Prefer the existing friendly heading character with a highly readable system sans body; load only the fonts actually used. |
| Body and cards | 16 px / 1.6–1.7; article body 18 px / about 1.7, with a reading measure around 60–70 characters |
| Heading scale | Hero about 40–46 px desktop; section headings 32–40 px; cards 22–26 px; fluid mobile sizes |
| Functional labels | Usually 13–14 px; touch targets at least 44 × 44 px |
| Spacing | Shared 8, 16, 24, 32, 48, 64 px steps; remove duplicated vertical promotion space before reducing all whitespace |
| Corners and depth | A small, consistent radius scale; flat surfaces and subtle dividers; shadows only when they explain layering |
| Motion | Purposeful transitions, respect reduced motion, keep real-time 3D on request |
| English/Swedish type | Normal word breaking. Do not import Japanese `break-all`, punctuation compression or 2.0 body leading indiscriminately. |

Suggested portal sequence:

1. Compact existing header, with explicit project, writing and professional-information routes.
2. Introduction and Minato harbour, retaining the finished still/film default and Explore harbour.
3. A compact choice of Explore, Create/use tools and Learn.
4. Balanced World and Pocket Camera features, followed by compact practical-tool and learning entries.
5. Latest writing, with subject/date and one clear reading action.
6. Brief professional introduction, contact/social links and concise Sweden/Vietnam location links. Maps may remain available on demand; the current embeds are already lazy and are not asserted to delay initial loading.

The Hoshino-style lesson is organisational: one parent identity can introduce different experiences. It does not require making every product look like the homepage. The Nintendo-style lesson is visual discovery, clear actions and useful previews. The MUJI-style lesson is restraint and consistency. The note-style lesson is readable editorial content.

## Reference links

- [Gallery](https://kzhrknt.github.io/awesome-design-md-jp/gallery.html)
- [MUJI reference](https://kzhrknt.github.io/awesome-design-md-jp/design-md/muji/preview.html)
- [Nintendo reference](https://kzhrknt.github.io/awesome-design-md-jp/design-md/nintendo/preview.html)
- [note reference](https://kzhrknt.github.io/awesome-design-md-jp/design-md/note/preview.html)
- [Hoshino Resorts reference](https://kzhrknt.github.io/awesome-design-md-jp/design-md/hoshinoresorts/preview.html)
- [REA](https://github.com/morluto/rea)

## Implementation acceptance criteria and next action

No implementation or post-change browser pass is claimed. The hosted REA job is a completed static analysis, not a design test.

First implementation should address priorities 1–3 together in a bounded homepage prototype. Keep all six projects, existing URLs, the private-course destination, the character guides and the harbour viewer. Verify desktop, 768 px/1,024 px iPad-sized and 390 px phone layouts, 200% text zoom, keyboard operation, focus, contrast, normal English/Swedish wrapping and no horizontal overflow. Compare the same content before/after and record grid height; target a substantially shorter desktop collection without hiding useful actions or shrinking readable text. Check World preview crop and card height directly.

Physical iPad Safari remains a separate test. No app redesign, new framework, upstream asset copying or branding substitution is required for this first pass.
