# Fish-market board — 25 October 2026

Owner request: replace the floating fish-market price panels with the same kind of board as the harbour noticeboard.

Baseline: main `7c048393daaf614e242956cf3ee7b3f9bdc0f626`; existing noticeboard design and implementation handover read.
This is a small correction to the cartoon World, not the development/Pixar room replacement.

## Implemented

- Removed the separate, unsupported 1600 × 1000 backing and 1100 × 1500 price sign in the east-quay auction shed.
- Reused `buildHarbourNoticeboard` through an optional drawing specification/header texture. Its default harbour
  geometry, woodland poster, flyer and viewer remain unchanged.
- `src/world/auction-board.js` places the same green aluminium cabinet, glazed doors, hood, hardware and two 80 mm
  posts at X 28.9, Z -43.7, facing west. Both post grades equal the auction floor (apron + 100 mm), with 5 mm embedment.
- Prices remain Maguro ¥2,800, Gurukun ¥900, Irabuchā ¥1,200, Sēika ¥1,500. Right-hand notice states the existing
  auction description's hours. Both sheets occupy cut-outs in the backing, inside the glazing.
- Added a rotated 1550 × 260 mm walking/camera collider, height 2180 mm. Geometry assertions verify clearance from
  the catch and containment on the shed floor, both supports, sheet fit and no coplanar overlaps.
- Rebuilt the shipped runtime, manifest, HTML entry points and service-worker version.

## Validation and limits

- Focused noticeboard suite: 11/11 passed, including the new auction geometry check and retained harbour viewer tests.
- Runtime build completed successfully.
- Full World guard: 422/422 passed across 81 files (146 seconds), including no-z-fighting.
- Separate runtime-package suite: 4/4 passed; `git diff --check` passed.
- Screenshot check unavailable: no installed Chromium; Playwright's browser download failed with a truncated/invalid
  archive. No screenshot or physical iPad/Steam Deck acceptance is claimed.

## Delivery

Implementation commit: `2d4a8006` (“Ground fish-market prices in the shared noticeboard cabinet”).
All source/runtime checks passed. The initial push was held by automatic review; the owner explicitly authorised
publication on 25 October: “@GitHub push to main”. This supersedes the earlier approval block.
The local fix is a fast-forward of verified remote main `7c048393`; publication uses a normal push, without force.
Pages deployment is checked after pushing. The Linux 0.2.20 package is immutable and does not contain this change;
include the shared World fix in a future release after normal package acceptance.
