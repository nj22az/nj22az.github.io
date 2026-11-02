# Pocket Camera album backup, face stickers and Halloween — 2 November 2026

The owner (2 November 2026), after the [professional-editor audit](AUDIT-PRO-EDITOR-2026-11-02.md): "Yes start with
backup plus brows, eyes and Halloween, implement if you make new things back into Johansson World, make parts in
blender". Earlier the same day: "I also want fun effects like Manga eyes, evil eyebrows, Halloween cute stickers etc
(maybe things can be brought from the avatar creator and Johansson World?)" and "Imagine using stickers for the
eyebrows from the avatar creator".

## State

Branch `claude/laughing-brahmagupta-ybyndm`, not merged, not published. The visible version is `v2026.11.02.1` and the
release key `20261102fun1`. Main publication needs the owner's explicit word, then Pages and public-byte verification.
Results of every check run are under Verification below; physical iPhone/iPad Safari is untested.

## What was built

### Album backup (Camera)
`camera/backup.js`, `camera/zip.js`, an **Album backup** row in the album and its sheet. One stored ZIP holds the
manifest (`pocket-camera-backup.json`: every record's fields and which file holds each picture), every photo's
untouched original, finished photo and thumbnail byte for byte (a picture shared by two fields once), the recipes and
the own stickers. Two taps on purpose: **Back up album** packs, **Save backup** shares from a fresh tap (iPhone Save to
Files) or downloads. **Restore from a backup** adds by id after checking each picture's CRC-32; it never replaces or
deletes a record (a photo edited since keeps its newer self). The sheet shows where the album lives (Home Screen app vs
browser: on iPhone they are separate albums), photos, own stickers, space used (`storage.estimate`) and whether the
browser promised to keep it (`storage.persisted`). The row remembers the last saved day. `album.js` gained `listMeta`
and `restoreRecord` (add-if-absent in one transaction); its key moved to `20261102fun1` everywhere it is imported
(tests and the MCP session too). Not done: the EXIF capture date for imports (audit P1) and general undo/redo.

### Face stickers (Camera, using World's avatar painter)
`camera/face-stamps.js` and Adjust → **Face stickers** (Find face / Align face / Reset shared with Makeup's guide;
Brows · Eyes · Shine · Hat; Drawn on / Sticker). See the README section "Face stickers".
- World change: `johansson-town/src/avatars/face.js` now **exports `drawBrow` and `drawEye`** (unchanged bodies). The
  camera imports them (never copies), with `faceLayout` for the default face. The offline worker, the bundle builder and
  the MCP preview allowlist now include exactly that file.
- The residents' 256-unit face is laid on the photo by its two eyes (similarity transform from the guide's eye points).
  Brows are 1.8× a resident's and the mood turns them 0.55× as far (evil ≈ 30°): visually checked on the real portrait;
  at face.js's full turn the long brows stood on end.
- Drawn on: drawn into the edit source after the makeup pass (makeup is not recomputed when only stickers change), so
  the Looks restyle them (Manga inks them). Sticker: an overlay canvas in the editor (`.stamps-art`) and `finishPhoto`
  prints them after the frame, with a white die-cut rim and a soft shadow.
- `recipe.stamps` is normalised in `looks-gl.js normalRecipe` (kept with every photo, re-edit restores it).

### Halloween (Blender parts, Camera sheet, World)
See "Blender and Studio" below for what the helper produced and published.

### World (johansson-town)
- **Cat ears**: a new Halloween costume, `storyProps(avatar).give('catEars')` (`buildCostume`), with who/why/where in
  `STORY_PROPS`. The band follows the head's own shape (`shapeHeadPoint`, as the catalogue's hats are fitted) 6 mm off
  the scalp; the ears are sized from the head. Rendered on Tetsuo, a child and Officer Mori: no gap at the temples.
- **Paper bats** (catalogue `halloween-paper-bat`): six hung on cotton threads from the lantern string, every other gap
  between the lanterns, fixed thread lengths and turns. Not on the shutter: the shutter is rolled up while Sakura is open
  (9:00–20:30), lantern-time included. Each thread is added only with its bat's model.
- **Wrapped sweets** (catalogue `halloween-sweets`): on the lid of the two-high crate stack, between the pails, 58 cm up.
- Both models are fetched the first time the season shows, never the rest of the year.
- **Fixed: floating pails.** `buildJackOLantern` put the lobes' bottoms a quarter of r above its origin, so every pail
  floated 3–4 cm (the ring round the machine, the pole's foot, the bin); two frontage pails were also placed over the
  wrong crate stacks (one 26 cm in the air). The builder now stands on its origin (same size for Studio's registry), and
  the pails stand on the real surfaces: `SAKURA_CRATES` and `crateTops()` are now exported from `old-town.js` and used by
  both the crates and the staging. A test checks every pail rests within 3 mm.
- Pre-existing, **not changed**: the four cardboard obake are "taped to the shutter" 2 cm in front of its plane, so while
  the shutter is up (shop hours, lantern-time included) they stand about 20 cm in front of the open glass. Needs an owner
  decision (tape them to the glass when open, or show them only after closing).

## Verification

Commits so far: `40976c06` (Camera backup and face stickers), `93933e45` (World cat ears, pail fix, runtime rebuilt).
Run locally in this cloud session (Chromium 153 headless, SwiftShader; not a phone):
- Camera units: zip **7/7**, face-stamps **6/6**, modules, offline inventory; MCP policy **16/16**.
- Camera browser: backup **7/7**, face-stamps **10/10** (hats pending the sheet), retouch **40/40**, UI **82/82**,
  crop **33/33**, save/share/layout **14/14**, paper **5/5**, integration **8/8** (its prior-engine comparisons need
  CI's baseline files), sticker contours **4/4**, Smart **14/14**, screens **5/5**.
- The main camera suite and Enhance failed only on console 404s for `stickers/halloween.json`, which the Blender helper
  had not yet written; they are to be rerun once the sheet exists.
- World: halloween-street **11/11** (with the pails test), runtime-package **4/4** after `npm run build:runtime`,
  fujitas-back-moves **18/18**, asset-modeller **6/6**, wardrobe-catalogue **8/8**, resident-guide-catalogue **6/6**.
- Not run: the full World guard, MCP real acceptance, offline browser suite, physical devices.

In progress (uncommitted at this point): the bats and sweets placement in `halloween.js` and its test (need the
catalogue cards Studio publishes), the Blender sheet and catalogue assets. `jojo` push access was refused by the
session's permission check, so the Studio cards (`town-studio/assets/halloween-*`) cannot be pushed from here.

## Next

1. Owner review of the stickers and the World bats/sweets/cat ears; then publication on the owner's word.
2. Physical iPhone: backup Save to Files and restore, Home Screen vs Safari albums, face stickers' performance.
3. The audit's remaining Phase 0/1 items: EXIF capture date, undo/redo, Face pack (landmarks), Hide my brows.
