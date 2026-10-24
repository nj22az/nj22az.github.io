# Vehicle collision repair — 24 October 2026

## Owner report
The phone screenshot shows overlapping bodies in Tetsuo’s green kei truck outside Sakura, with a Talk to Tetsuo prompt.

## Cause and correction
Departing vehicles moved their pedestrian collider off-map until parking again. The shared road placement now synchronises the same oriented collider for parked, driving, held, reversing, waiting and ferry-carried vehicles. Vertical bounds follow wheel height instead of blocking the ground underneath a raised car. The collision grid queries the small dynamic set at its current pose without rebuilding all static cells. Driving residents are excluded from proximity prompts, direct clicks and queued click arrivals; vehicle inspection and ordinary walking conversations remain available.

## Evidence
Nine new regression checks cover all four sides, rotations, forward/reverse/held states, old-bay clearance, visibility, elevated deck bounds, live spatial cells, Tetsuo’s real departure and driver prompt/click gating. The full World guard and the production-runtime check passed. Actual compiled-game acceptance walks the player into each side of the held truck, checks the moving boundary and old-overlap recovery, and captures desktop and phone-width views. See [QA evidence](../docs/qa/vehicle-collision-2026-10-24/report.json), focused.txt and guard.txt in that folder.

## Publication state — published and verified
Implementation `e12ab3b4042a14e74bad463f6fca4b0c25007425` was fast-forwarded to main after reviewing the compiled-game evidence. The complete World guard passed **409/409 checks across 77 files**; the focused suite plus runtime packaging passed **28/28**. All nine new regression checks failed against the original source before the repair. The compiled-game acceptance passes all four walking approaches, a moving vehicle, driver prompt exclusion and safe recovery from an existing overlap; no page errors. Third-person desktop and phone-width photographs were recaptured without changing any production source or runtime file.

[Publication evidence](../docs/qa/vehicle-collision-2026-10-24/publication.json) verifies the public HTML, service worker, manifest, source fingerprint and changed compiled entry/chunks byte-for-byte against the tested implementation. [Game report](../docs/qa/vehicle-collision-2026-10-24/report.json). Original build/guard workflow: 40098829273. Publication verification workflow: 40099838159.

## Limits and next action
No physical iPhone/Safari or packaged Linux test was performed. Existing web tabs must reload; saves are preserved. The shared source is repaired, but no new Linux installer was released. The temporary development transport/workflow files are removed after successful sign-off; the prototype branch is not merged. No implementation work remains for this defect.
