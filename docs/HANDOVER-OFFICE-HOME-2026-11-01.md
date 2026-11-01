# Office homepage redesign — 1 November 2026

Owner approved implementing the [Japanese design/REA assessment](https://github.com/nj22az/nj22az.github.io/blob/c722904ec2233516695c554db5f200eea9f2b5fc/docs/HANDOVER-JAPANESE-DESIGN-2026-11-01.md).

## Scope

Homepage only: fixed cream/ink/teal office presentation, compact equally prominent World and Camera cards, all six original projects, Explore/Create/Learn filtering, integrated Tetsuo Camera guide and Johansson private-classroom entrance. Original project actions, Linux downloads, examples, details, day/night art and maintenance preview remain. Existing harbour films and opt-in 3D viewer are retained.

The homepage explicitly uses the existing clarity theme lock and its own scoped tokens. This stops visit-to-visit random changes on the homepage without changing saved appearance preferences or other-page theme behaviour. No shared theme engine, application or course styling changed.

Source base: main 0f13c23b6700b4d0ab28e1808d801f5d51e4e111. The candidate comprises four homepage files: index.html, css/office-home.css, css/project-explorer.css and assets/js/project-explorer.js. The hosted review overlays exactly these files onto that published source, so unrelated development World prototypes are excluded.

## Acceptance and status

Local supported preview: desktop composition reviewed; three-path filtering works. Source syntax check passed. The local browser cannot render WebGL; the existing hosted harbour review covers the retained viewer.

Hosted [final Office homepage design review 41348687399](https://github.com/nj22az/nj22az.github.io/actions/runs/41348687399) passed all six profiles: baseline comparison, six retained projects, pathway counts 1/3/2, saved-theme isolation, night/day switch, sample maintenance task, keyboard disclosure, private classroom, lazy application loading, image readiness, 44 px controls, responsive desktop/iPad/390 px/320 px layouts and 200% zoom. Desktop, iPad portrait/landscape, 390 px phone, 320 px phone and a 200% desktop-zoom-equivalent viewport passed. The enlarged profile uses a half-sized CSS viewport and doubled device pixel density, so responsive media queries participate. The raw CSS-zoom probe was replaced by this more representative check.\n\nMeasured desktop grid: 3,075.61 px before; 1,960.42 px after, **36.3% shorter**, with the six original projects. The World card is 627.48 px tall, compared with roughly 1,006 px in the earlier live audit. Screenshot review corrected split small-phone filter labels and an artwork/control overlap. Header background is now opaque.\n\n[Harbour regression 41348206453](https://github.com/nj22az/nj22az.github.io/actions/runs/41348206453) passed all four retained viewer profiles. Node syntax/static integration and the video-controller fixture passed. The hotel-theme fixture passes against the inspected main bootstrap; an initial run accidentally targeted the older local development bootstrap and failed, without any candidate theme-engine change. Main text/supporting text/white-on-teal/dark-on-yellow contrast ratios are 13.41, 6.31, 7.34 and 10.93 respectively; this is not a whole-site accessibility certification.

Accepted development source: `94b4946477ceb92acd09002a3d7c74eca54c8cd5` (product CSS unchanged since `b2346454`; subsequent change improves the zoom test). This delivery selectively promotes the four homepage files plus their dedicated review workflow/test. Main hosted review, Pages deployment and public-file verification will be recorded after publication. Physical iPad Safari remains unverified.
