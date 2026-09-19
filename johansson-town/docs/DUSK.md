# Cel-safe dusk pass

A Gion-shaped hour for Johansson Town: apricot then violet, then night. Paper lanterns
lead, occupied windows follow, Sakura’s fluorescent stays cold white. No extra lights.

## What it is

`src/render/dusk.js` is a THREE-free clock. `setTime()` samples it once per tick and
writes the existing two-light anime setup (sun + hemisphere), sky tint, and grade
warmth. Windows, nameplates and Minato’s akachochin are emissive meshes, not new
`PointLight`s.

MeshToonMaterial ignores `scene.environment`. Time of day is these knobs. Extra lights
add extra ramp bands and turn anime cel into muddy low-poly.

## Clock

| Minutes | Period | Daylight | Dusk amount |
| --- | --- | --- | --- |
| 07:00–17:00 | AFTERNOON | 1 | 0 |
| 17:00–18:30 | DUSK | 1 → 0.5 | 0 → 1 |
| 18:30–20:00 | EVENING | 0.5 → 0 | 1 |
| 20:00–20:30 | NIGHT | 0 | 1 → 0 |
| 20:30–05:00 | NIGHT | 0 | 0 |
| 05:00–07:00 | EARLY MORNING | 0 → 1 | 0 |

- **Windows** ease on from 17:00, full from 18:00, fade 05:00–07:00. They no longer
  snap at minute 1080.
- **Paper lanterns** (Minato, harbour globes) lead the windows: on from 17:00, full
  by 17:30.
- **Sakura fluorescent** is `PALETTE.sakuraTube` (`0xfff1ce`) at 1.0 while the shop
  is open (09:00–20:00), then 0.35 night-security. It never warms toward lantern orange.
- **Grade warmth** is `0.05 + duskAmount * 0.07`. Ink thickness, shadow tint and
  flatten stay on their cel defaults.
- Sky, sun and hemisphere colours fade from dusk to night during 20:00–20:30,
  including the exact 20:30 boundary.

## Cel hard rules

Do not:

- add `PointLight`s (Sakura’s existing street strip and harbour globes stay; they are
  not joined by new ones)
- cel Thuan (skinned, `keepPhysical`) or Sakura stock (`keepPhysical` vertex colour)
- change ink thickness, `uShadowTint` (`0x6c5f8c`) or photographic flatten (`0.65`)
- put a dusk fog on the harbour — `clock().fog` is always `null`
- warm Sakura’s tubes toward `PALETTE.lanternPaper`

Do:

- send new architectural meshes through `applyCelShading`
- use the soft ramp for pale paper lanterns
- drive emissive intensity from `windowGlow` / `lanternGlow` / `fluorescent`

## Wiring

- `game.js` `setTime()` — sun colour/intensity, hemisphere fill/ground, bounce,
  sky tint, atmosphere, grade `uWarmth`, period label
- `atmosphere.js` — optional fourth argument `minutes` hands sky/ambient/exposure to
  the clock; the three-stop `(day)` path stays for callers that only have daylight
- `sky.js` — optional `tint`; rain is already baked into the clock’s sky, so a tinted
  sky is not multiplied by the wet grey again
- `town.js` `updateHours` — occupied windows
- `homes.js` `updateHomes` — nameplates
- `izakaya.js` hourly + `minato-facade.js` `lit(open, day, lantern)` — akachochin
- `harbour.js` — existing globe emissives and (already present) night PointLights
- `sakura-shop.js` hourly + `sakura-interior.js` — existing strip lights, room fill
  and supplied fluorescent meshes; tubes get their own materials so stock does not glow
- Clock-driven meshes use their current materials after cel conversion. Minato's
  three lanterns stay out of static batching so the displayed material can change.

## Live site

Pages serves hashed `runtime/`. This integration includes the rebuilt runtime,
manifest, source receipt and updated entry-point links. Future source changes still
require `npm run build:runtime` before publication; verify with
`node --test tests/runtime-package.test.mjs`.

The integration preserves main's pier dimensions, garden build/tick hooks, staff
bench geometry and Thuan's turn-before-walking behaviour. Regression coverage checks
the actual garden clock, visible cel materials, Sakura's opening/closing lights,
shop service, bench return route and forward-facing movement.
