# Nishi seawall photo overlook - 25 October 2026

## Owner decision and delivered state

Owner chose CAD option A and requested Blender construction, implementation, screenshots and self-audit.
Implementation commit: [`ebc6f797795bec9fe406bed89998bb1d9499182a`](https://github.com/nj22az/nj22az.github.io/commit/ebc6f797795bec9fe406bed89998bb1d9499182a), parent `d3b8050baa8788c8b1c8895e63a0bbc2646db98e`.
Branch: `development`. Opt in with `/johansson-town/?seawall-photo`. This handover accompanies publication to development; no main merge, Pages deployment or Linux package is claimed.

## What is built

- Original, editable Blender overlook: [metric .blend](../docs/seawall-photo/Nishi_Photo_Overlook.blend), [portable GLB](../assets/models/harbour/nishi-photo-overlook.glb), and reproducible [Blender builder](../tools/blender/build-seawall-photo.py).
- [Corrected CAD revision C](../docs/seawall-photo/design.json), [readable plan](../docs/seawall-photo/cad-rev-c.svg), [self-audit](../docs/seawall-photo/AUDIT.md) and [usage/build instructions](../docs/seawall-photo/README.md).
- 6 m portrait rail bay on Nishi's west seawall; a 16 m seaward, 2.4 m wide pile-supported public lookout; 16.35 m deck including the landward root. Existing garden and promenade retained. Working ferry and cargo berths unchanged.
- Actual evaluated Blender meshes supply supports, rails, apron and fittings: 5,594 triangles, six materials. The standard ground builder draws the sole walkable deck at +40 mm. Old wall/colliders and complete tetrapod envelopes are cut only where replaced.
- Photo Studio > Places > **Nishi seawall portrait**, or the **Take a seawall portrait** prompt in the verge at X -35.30 / Z -6.65. Square 34-degree camera preset, existing cast/pose controls, clean PNG capture and normal return to the original player position.

## Self-audit corrections

1. Actual Blender camera revealed the concept PDF's incorrect right-axis projection. Revision C puts the pier south of the bay so the west-facing photo shows it on the right; the camera and garden remain where approved.
2. Corrected nominal zero to the actual +40 mm walk; extended the root 350 mm inland to close the physical/navigation gap.
3. Added a local 2 mm / 0.02 m2 coplanar scan. It found two-sided plinth end caps against retained wall ends. Front-side materials fix the cause; the new region test passes and remains in the guard.

## Verification actually completed

- Full World guard: **448/448 checks, 88 files**, using `NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs --test-concurrency=2`. [Complete log](../docs/seawall-photo/full-guard.txt).
- Focused new-geometry, click-to-walk, real collider, garden, CAD, normal, default-world and coplanar checks plus runtime packaging: **10/10**. [Log](../docs/seawall-photo/focused-checks.txt).
- Runtime rebuilt; source fingerprint and compiled graph verified. Published baseline chunks retained for cached pages. `git diff --check` clean.
- [Six compiled-game captures](../docs/seawall-photo/game-review/) cover overview, entrance, bay, Thuận portrait, controls and tablet-size entrance. [Browser report](../docs/seawall-photo/game-review/report.json): zero page errors. The final material correction is covered by the [fresh clean-export report](../docs/seawall-photo/game-review/portrait-export-report.json), also zero errors; actual saved [1200 x 1200 PNG](../docs/seawall-photo/game-review/04-thuan-square-portrait.png), no editor selection ring; capture and return verified.
- The full figure and shoes are inside the square frame. The post clears the face and hands, pier sits on the right, entrance is open and level, and the camera stays outside Gran Higa's garden. Nearby utility pole remains outside the portrait crop.
- Initial parallel scans exceeded environment memory. An isolated scan passed, then the complete final guard passed with the allowance/concurrency above. No suppressed failure or baseline exception was added.

## Limits and next action

Physical iPad/Steam Deck and measured frame-rate acceptance remain open; browser tablet dimensions are not a physical device. No Linux package was rebuilt. New reference dress, shawl and straw hat are outside this location build; screenshot Thuận wears her existing shared outfit. Pile termination depth is a modelling assumption, not structural engineering.

Review the saved captures on development. Any main promotion follows the owner's established branch workflow; retain the ordinary main World until separately approved.
