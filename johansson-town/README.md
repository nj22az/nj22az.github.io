# Johansson Town

A first-person browser town set on 14 September 1988. This branch upgrades the existing game in place and is a **draft development slice**, not the completed visual specification. The live GitHub Pages deployment is separate from this branch.

## What this revision contains

- One module entry point in `src/boot.js`, local Three.js r170 and matching loaders. Runtime imports and assets stay inside this directory.
- A fixed 1/60-second movement/physics step with a 0.1-second frame cap, first-person default, correct A/D strafing, jumping, and height-aware camera sweeps.
- The existing street, quay and outer pier, connected western/eastern lanes, a second jetty, a school route and a raised shrine approach. The residential circuit adapts two Tomonoura OSM ways; connecting streets and the harbour are fictional. This is not a historical survey or a complete 1:1 reconstruction.
- Shared PBR shading and local 1K albedo, normal and packed ARM maps, catenary cable geometry, shutters with opening hours, lit evening windows and a paper map using the same route coordinates as movement.
- Twenty named resident profiles, eight visible at once, town-minute schedules, collision-aware raster A* and local slide avoidance. Five locally vendored Quaternius body bases provide compatible walk/idle/run/wave clips. Procedural bodies remain the failure fallback. Kenji now has a separate Blender-authored, textured anatomical model with six original clips. The remaining bases are interim stylised adults, not twenty bespoke Japanese identities or age-specific exports.
- The eight inherited room layouts plus a ramen room; nearby furniture and documents remain interactive. Rooms still share a shell. Bathhouse, apartment and bus-hut exteriors are not yet enterable.
- Local original synthesised Foley and instrumental WAV files, positional ambience/radio, material footsteps, can purchase/holding/drinking and seated camera height. Sound unlocks on ENTER TOWN.
- Tama, yen, fishing, Star Port, notebooks and existing transactions preserved. Website portals have become in-world paper records. Version 5 saves import valid v4/v3 data without deleting the old save.

## Controls

Desktop: exploration is always first person. Click the canvas for mouse look; WASD/arrows move; Shift jogs; Space jumps; E interacts or stands; R drinks the held can; Q opens the directory; B opens the notebook; N cycles time. Escape closes panels or releases the mouse.

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

Kenji’s editable Blender source, actual model renders and reproducible export instructions are in `art/characters/kenji/README.md`. This establishes the anatomical character pipeline; it does not make the rest of the cast or city finished.

Sakura Shōten now has Yui, an adult Blender-authored clerk, eight selectable goods, a hinged cooler, till, radio and service bell. A disabled Shopify Storefront adapter supports future approved product mappings and explicit real-money checkout. See `docs/SAKURA_STORE.md`. No live Shopify store or payment flow has been activated.

The Sakura visual revision clears the daytime fog, revises Yuri’s face and outfit, and rebuilds her shop frontage and stocked interior. See `docs/SAKURA_VISUAL_REVIEW.md` for actual geometry renders and remaining visual limits. This is not a completed whole-town AAA upgrade.


### Outdoor sections and startup recovery

The outdoor renderer selects nearby 24-metre cells in the Shopping, Port,
Residential and Park districts. Large merged meshes and instance batches submit
nearby cells/instances only. Visibility and buffers are restored after each render,
so the Konbini window view keeps its own clipping and selection.

The opening gate requests only the shared street kit and the starting vending
machine: 2.20 MB of GLBs, compared with 38.29 MB across 17 GLBs previously (94%
less required model data). These figures exclude JavaScript, surface textures,
external character textures and audio; they are not measured Safari load times.
The gate allows three seconds before using the existing fallback street.

After the first frame, a nearby-detail queue loads one model at a time. It loads
individual resident rigs, the tea house, ramen facade, izakaya exterior, park,
plants, warehouse and sea cave on approach. Existing placeholders, door positions
and colliders are established first; detail upgrades do not move the entrances or
collision geometry. The izakaya interior now loads at its door, like the other
supplied interiors. Sound files load when needed, and repeated district surface
materials share textures. Already-loaded models remain cached for return visits;
this is demand loading rather than a complete district memory eviction system.

Validation includes cold model-request counts and byte budget, loading all deferred
facades without changing colliders/doors, upgrading Yuri without duplicate actors,
serial/nearby queue behaviour, timeout recovery, route clearance, CPU game boot and
interior transitions, Konbini window rendering, and Vite build. Actual Safari frame
rate and time to first playable frame require a physical-device check.


### Published runtime

The live page starts from `runtime/` bundles, rather than importing the raw source
module graph. Run `npm run build:runtime` after changing game code; this updates the
hashed boot/audio references in `index.html`. Commit the generated runtime files
with the source changes. Older hashed files are retained on subsequent builds so
cached pages can still load their matching code. The title screen preloads the
compiled boot graph without executing it.

The opening position is a cedar street bench on the east sidewalk, seated and
looking across at Sakura Konbini. Press E to stand. Startup measurements are available in
`window.__JOHANSSON_STARTUP__`: code download/evaluation, the model gate, and elapsed
time to the first rendered frame. These are diagnostic timings, not an assertion
of a particular Safari loading time. The three-second model timeout is only the
asset gate; it does not bound JavaScript compilation or GPU rendering.

## September 11 entrance and streaming corrections

Late street-kit, home, vending and bench models now replace their temporary shells
without changing collision or doorway positions. Nearby residents are prioritised;
failed requests retry at most three times with a delay. A completed slow request
can still replace its placeholder after the queue timeout. Rendering follows the
player continuously with a forward margin instead of jumping at 24 m boundaries.

The warehouse street entrance is on the northern frontage, clear of the loading
props. It opens a dedicated fishing-gear storeroom at all hours and exits through
the same quay door. The ice cabinet and folio stand are clear of this approach.
Front-Row Books has framed joinery, a handle, threshold and book display.
The dining junction has one direction sign, one wall delivery shelf and an arcade
cabinet away from the crossing. Minato moves 6 m closer and Sato Ramen 2 m closer;
entrances, service-lane collision, map positions and resident destinations agree.

`npm run build:runtime` also records a source fingerprint. The runtime-package
check rejects a source change shipped with an older compiled game.
Validation includes the CPU game flow, model recovery, all room transitions and
route checks. WebGL is disabled in the available browser; Safari frame pacing and
GPU rendering still require a device check.


## Direct character appearances and bookshop frontage

Ordinary residents now use the five local, palette-coloured Quaternius low-poly bodies. Each body is one skinned mesh with no texture downloads; residents retain independent clothing colours and animation. Yuri keeps the supplied Meshy rig, Aya keeps her authored model, and Reiko keeps the supplied Nozomi model. No VRoid model or VRoid texture is requested by the active character pipeline.

The opening gate starts Yuri’s download alongside the street assets without increasing the three-second gate. Residents mount only their selected appearance. Until that appearance is ready, the logical character retains its schedule but has no visible substitute, interaction target or player collision. Shared models download once; successful late loads mount promptly, and failed requests remain eligible for bounded retries. The low-poly rigs retain their native walk, run and greeting clips and have seated, eating and drinking clips fitted to their own skeletons.

Front-Row Books has one visible timber doorway; the redundant source-model sliding panel is enclosed by a plaster wall. The bookshop bicycle is parked beside the frontage, clear of the entrance. Bicycles now have a complete frame, spokes, fork, pedals, mudguards, basket and rear carrier, merged into one render mesh. The oversized triple rack is replaced by a single modest stand.

Character delay/recovery, model selection, independent animation, seating, entry clearance and the real CPU game scene are checked. CPU geometry previews were inspected. The available browser has WebGL disabled, so Safari rendering and frame timing remain unmeasured.
