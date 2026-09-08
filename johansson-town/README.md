# Johansson Town

A first-person browser town set on 14 September 1988. This branch upgrades the existing game in place and is a **draft development slice**, not the completed visual specification. The live GitHub Pages deployment is separate from this branch.

## What this revision contains

- One module entry point in `src/boot.js`, local Three.js r170 and matching loaders. Runtime imports and assets stay inside this directory.
- A fixed 1/60-second movement/physics step with a 0.1-second frame cap, first-person default, correct A/D strafing, jumping, and height-aware camera sweeps.
- The existing street, quay and outer pier, connected western/eastern lanes, a second jetty, a school route and a raised shrine approach. The residential circuit adapts two Tomonoura OSM ways; connecting streets and the harbour are fictional. This is not a historical survey or a complete 1:1 reconstruction.
- Shared PBR shading and local 1K albedo, normal and packed ARM maps, catenary cable geometry, shutters with opening hours, lit evening windows and a paper map using the same route coordinates as movement.
- Twenty named resident profiles, eight visible at once, town-minute schedules, collision-aware raster A* and local slide avoidance. Five locally vendored Quaternius body bases provide compatible walk/idle/run/wave clips. Procedural bodies remain the failure fallback. These are interim stylised adults, not twenty bespoke Japanese identities or age-specific exports.
- The eight inherited room layouts plus a ramen room; nearby furniture and documents remain interactive. Rooms still share a shell. Bathhouse, apartment and bus-hut exteriors are not yet enterable.
- Local original synthesised Foley and instrumental WAV files, positional ambience/radio, material footsteps, can purchase/holding/drinking and seated camera height. Sound unlocks on ENTER TOWN.
- Tama, yen, fishing, Star Port, notebooks and existing transactions preserved. Website portals have become in-world paper records. Version 5 saves import valid v4/v3 data without deleting the old save.

## Controls

Desktop: click the canvas for mouse look; WASD/arrows move; Shift jogs; Space jumps; E interacts or stands; R drinks the held can; Q opens the directory; B opens the notebook; V changes camera; N cycles time. Escape closes panels or releases the mouse.

Touch: left stick, right-side look, JUMP, ACTION and DRINK. The notebook can select a drink from the bag. Sound preference, inventory, money and quest state save on this device.

## Development and deployment

The raw directory remains a static GitHub Pages application; it requires no build step to deploy in its existing location. For local development:

```sh
npm ci
npm run dev -- --host 0.0.0.0
npm test
npm run build
```

Vite's optional `dist/` output preserves the local asset tree. `node_modules/` and `dist/` are not committed. No runtime package CDN, Google Maps API or geolocation is used.

## Verification and remaining work

`npm test` runs the complete retained/migrated regression suite, a CPU-only full-game boot/interior smoke, navigation and save tests, and actual GLB parsing/animation checks. The CPU boot test substitutes the renderer and DOM: it cannot prove shader compilation, frame rate, pointer lock, audible quality or mobile rendering.

The available test browser reports its WebGL renderer as disabled. Visual acceptance and desktop/iPad performance therefore remain blocked. Do not treat this branch as ready for release. `AUDIT.md` records each acceptance criterion and outstanding scope, including unique interiors, richer age/wardrobe identity, in-world fishing/CRT play, the additional quests and frame budgets.

Before Phase D density work, complete the requested stranger play-through from shrine to outer pier and review façade variety. Asset licences and exact provenance are in `assets/ATTRIBUTION.md`.

## Art direction pass

The latest draft improves character normal seams without adding triangles, applies resident garment palettes, smooths turns and matches walk playback to movement speed. Merchant fronts now have curved-gable, hipped, shallow-tin and parapet roof forms with varied sign proportions and timber framing. A verified local CC0 HDR environment provides shared lighting/reflections. Static factory props are batched in spatial cells while interaction anchors and moving trolleys remain separate.

This is still **not a finished Shenmue/Yakuza-like slice**: the character faces, silhouettes, clothing and room layouts remain interim, and the street requires a rendered visual review. See `docs/ART_DIRECTION.md` and the measured limits in `docs/art-pass-measurements.json`.
