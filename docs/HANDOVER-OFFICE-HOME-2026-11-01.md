# Office homepage redesign — 1 November 2026

Owner approved implementing the [Japanese design/REA assessment](HANDOVER-JAPANESE-DESIGN-2026-11-01.md).

## Scope

Homepage only: fixed cream/ink/teal office presentation, compact equally prominent World and Camera cards, all six original projects, Explore/Create/Learn filtering, integrated Tetsuo Camera guide and Johansson private-classroom entrance. Original project actions, Linux downloads, examples, details, day/night art and maintenance preview remain. Existing harbour films and opt-in 3D viewer are retained.

The homepage explicitly uses the existing clarity theme lock and its own scoped tokens. This stops visit-to-visit random changes on the homepage without changing saved appearance preferences or other-page theme behaviour. No shared theme engine, application or course styling changed.

Source base: main 0f13c23b6700b4d0ab28e1808d801f5d51e4e111. The candidate comprises four homepage files: index.html, css/office-home.css, css/project-explorer.css and assets/js/project-explorer.js. The hosted review overlays exactly these files onto that published source, so unrelated development World prototypes are excluded.

## Acceptance and status

Local supported preview: desktop composition reviewed; three-path filtering works. Source syntax check passed. The local browser cannot render WebGL; the existing hosted harbour review covers the retained viewer.

Hosted Office homepage design review is pending: baseline comparison, six retained projects, pathway counts 1/3/2, saved-theme isolation, night/day switch, sample maintenance task, keyboard disclosure, private classroom, lazy application loading, image readiness, 44 px controls, responsive desktop/iPad/390 px/320 px layouts and 200% zoom. Captures and exact measured heights will be recorded after that run.

No main publication yet. Next: inspect captures and results, correct any failures, publish only the homepage candidate and record deployment/public-file verification. Physical iPad Safari remains unverified.
