# Pocket Camera colourful action icons — 1 November 2026

## Review state

Requested by Mr. Johansson: implement the approved `Pocket-Camera-Action-Icons.png`, preserving the dark interface,
current Look families/screen settings, saved recipes, album and complete offline operation. The reference was retrieved
and inspected at full resolution. The vector artwork is original; no Nintendo assets, characters or logos are used.

Branch: `codex/pocket-camera-colour-actions`, based on main `ab35ac3e9cc7d6dadac8c05178a04da42cef50da`.
Main already contains PR #423 / `v2026.11.01.3`. This candidate is **v2026.11.01.4**, cache key `20261101icons1`.
**Review only; not merged or published.** Exact PR, source and hosted verification will be recorded below.

## Control mapping

| Reference category | Existing control / symbol |
| --- | --- |
| Camera | Start camera (`#startCamera`, `i-camera`) |
| Looks | Editor Looks tab (`#tabLooks`, `i-look`) |
| Adjust | Editor Adjust tab; Makeup and viewer Edit (`i-edit`) |
| Erase | Editor Erase tab; Find spots (`i-erase`) |
| Timer | Camera settings Self-timer (`#timer`, `i-timer`) |
| Delete | Viewer Delete (`#deletePhoto`, `i-trash`) |
| Print | Camera settings Print when sharing (`#printSetting`, `i-printer`) |
| Colour | Adjust Colour (`.adjuster[data-key="colour"]`, `i-colour`) |
| Games | Album Memory entry / empty album Play Memory (`i-game`) |
| Sound | Camera settings Sound, with explicit muted variant (`i-sound`, `i-sound-off`) |
| Undo | Eraser Undo and Surprise Undo (`#eraseUndo`, `.undo-shuffle`, `i-undo`) |
| Pattern | Adjust Pattern (`.adjuster[data-key="pattern"]`, `i-pattern`) |

## Implementation

Twelve inline SVG symbols plus the muted Sound variant use a 32 × 32 viewBox, saturated flat fills, dark 2.5-unit
contours, a pale outer keyline and crisp highlights. No fonts, raster icon atlas, network dependency or runtime
icon loader. Each symbol is defined once in the existing sprite. The visible instance is decorative and keeps its
control's accessible name. Actions use `svg.action-icon`; `lookIcon`, `groupIcon`, `look-icons.js`, photographic
thumbnails and the existing navigation hierarchy are retained. Share remains Share, not Print.

Default action size is 24 px; main action tabs and Camera settings use 32 px within existing touch controls.
The tool row has a stable 64 px minimum height. Selection retains its visible label and ARIA state, plus a 2 px
accent outline. Disabled Undo uses the real disabled control and a desaturated, dimmed icon; it remains readable.
The 24/32 px artwork and light/dark keyline were independently rasterised and inspected without clipping.

Renderer changes are limited to the release-key import. Shader logic, recipe normalisation, storage schemas and keys,
offline update guards and album code are unchanged. Matching app/CSS/renderer/MCP import keys are required by existing
module policy. The verified offline manifest remains 325 assets / 22,698,743 bytes before any further runtime changes.
No new runtime file is required. Offline tests and the worker digest pin are regenerated together.

## Checks and remaining limits

- Unchanged baseline: all 16 existing Camera unit suites passed.
- Candidate: syntax, whitespace, single-module addresses and exact offline inventory/hash/worker pin passed.
- Local Chromium was unavailable. The standard installer returned an invalid archive. No local browser pass is claimed.
- Hosted UI, screen settings, core, retouch, Smart and offline acceptance, plus actual before/after captures, are pending.
- Physical iPhone/iPad Safari, hardware camera, native Photos/Share and installed Home Screen appearance remain untested.
- The owner's previously reported missing earlier photos remains unresolved; this presentation change does not diagnose it.

Next: run the established GitHub review workflows, inspect actual phone/tablet captures and 24/32 px icon states,
correct observed defects, then update this note with exact results before marking the PR ready. Main publication
requires the owner's instruction.
