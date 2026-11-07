# Pocket Camera album backup, face stickers, Halloween and Pop — 2 November 2026

The owner (2 November 2026), after the [professional-editor audit](AUDIT-PRO-EDITOR-2026-11-02.md): "Yes start with
backup plus brows, eyes and Halloween, implement if you make new things back into Johansson World, make parts in
blender". Earlier the same day: "I also want fun effects like Manga eyes, evil eyebrows, Halloween cute stickers etc
(maybe things can be brought from the avatar creator and Johansson World?)" and "Imagine using stickers for the
eyebrows from the avatar creator". Later: "how about actual photo enhancements to make a photo 'pop' better".

## State

**Published and verified on 3 November 2026.** [PR #426](https://github.com/nj22az/nj22az.github.io/pull/426) merged
into main as [`a102d196`](https://github.com/nj22az/nj22az.github.io/commit/a102d196090e009d793cb079f166240ddbc8e265);
Pages deployed it (success). **20/20 public files match main byte for byte** (SHA-256, cache-busted): Camera
`index.html`, `app.js`, `face-stamps.js`, `backup.js`, `zip.js`, `looks-gl.js`, `sw.js`, `offline.json`,
`stickers/halloween.json`, its README and `cat-ears.thumb.webp`; World `index.html`, `sw.js`, `runtime/source.json`,
the active `boot-Bx-5Tpxf.js` and `halloween-BDkaNQJF.js`, `src/avatars/face.js`, `src/world/halloween.js`, the
paper bat's `model.glb`, and a retained older chunk (`actors-D56Aqw3r.js`). The live Camera page (headless Chromium,
390 × 844) loads with no errors and has the backup sheet, Face stickers and Pop. Visible version `v2026.11.02.1`,
release key `20261102fun1`. Branch `claude/laughing-brahmagupta-ybyndm`. Commits: `40976c06` backup and face stickers,
`93933e45` World cat ears and pail fix, `54afa8cb` README, `9d8dc294` seven sticker tabs, `3bcd38eb` Halloween in
Blender (Camera sheet, World bats and sweets), `20878747` Pop, `b2501158` Makeup and Face stickers sharing one Adjust
row (Pop's row had pushed the adjustment slider off a 320 × 560 phone; the photo also gains 45 px at 390 × 664). The
owner asked for main ("can you push to main ?"): [PR #426](https://github.com/nj22az/nj22az.github.io/pull/426), with
main merged in twice (`d74deebf`, then `d3e357b9` for the navigation feeder), CI fixes `cf52892e` (sticker tabs under
CI's DejaVu Sans) and `d6a6d174` (resident-guide portraits: `face.js` is in their provenance hash; regenerated with the
real renderer, 22 of 23 byte-identical, Mr Fujita's was stale since #415), and `1539cff5`. Physical iPhone/iPad Safari
is untested.

**World runtime chunks: keep main's.** `npm run build:runtime` keeps only this build's and the previous build's chunks,
but main's navigation-feeder release deliberately retains every previously published chunk (172, byte for byte, in its
release evidence) for pages still holding an older `index.html`. The rebuild after merging main pruned 137 of them;
`1539cff5` restored them from main, so this release only adds its 14 new chunks. After any rebuild on a branch, restore
main's chunks (`git diff --no-renames --diff-filter=D --name-only origin/main -- johansson-town/runtime | grep -v .vite |
xargs git checkout origin/main --`) and check the PR deletes nothing there.

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
  at face.js's full turn the long brows stood on end. Shine is never rimmed and sits under drawn eyes.
- Drawn on: drawn into the edit source after the makeup pass (makeup is not recomputed when only stickers change), so
  the Looks restyle them (Manga inks them). Sticker: an overlay canvas in the editor (`.stamps-art`) and `finishPhoto`
  prints them after the frame, with a white die-cut rim and a soft shadow.
- `recipe.stamps` is normalised in `looks-gl.js normalRecipe` (kept with every photo, re-edit restores it).

### Halloween, made in Blender
- **Camera**: `camera/stickers/halloween.json` + `halloween/` (8 stickers, the **Season** tab), rendered by
  `tools/blender/render-halloween-stickers.py` (Blender 5.2 as a Python module, Cycles, Freestyle line in World's face
  ink, the residents' thin rim). World's pumpkin lantern, jack-o'-lantern, obake, witch hat and pumpkin stem; new cat
  ears, paper bat and wrapped sweets. The three headpieces carry measured `hat` crown/width, used by Face stickers' Hat.
  Kind `season`: never a Memory deck or a greeting. The tab is Season (not Halloween) so seven tabs fit a 390-point
  phone; the shared tab padding/type shrink slightly (11.9 px there). Later season sheets go under the same tab.
- **World catalogue** (Johansson Studio's pipeline, all 12 Studio checks passed, published v1):
  `halloween-paper-bat` (0.238 × 0.099 × 0.031 m, 752 triangles, anchor `hang`) and `halloween-sweets` (41 sweets,
  0.25 × 0.057 × 0.256 m, 2,952 triangles, one draw call). Builders in `assets/catalog/<id>/source/build-*.py`.
  **Studio's input cards could not be pushed to `nj22az/jojo`** (the session's permission check refused push access);
  they are kept as `assets/catalog/<id>/source/studio-asset.json`. To restore them in Studio: copy that file to
  `jojo/town-studio/assets/<id>/asset.json` and `source/model.glb` to `.../<id>/model.glb` (byte-identical to Studio's).
- **World placement** (`src/world/halloween.js`): six bats on cotton threads from the lantern string, every other gap
  (fixed thread lengths and turns; each thread added only with its bat's model); the sweets on the lid of the two-high
  crate stack, between the pails, at a child's reach. Models load the first time the season shows. Not on the shutter:
  Sakura's shutter is up in shop hours (9:00–20:30), lantern-time included.
- **Cat ears** costume: `storyProps(avatar).give('catEars')`, band fitted to the head's own shape (`shapeHeadPoint`),
  ears sized from the head; rendered on Tetsuo, a child and Officer Mori (no gap at the temples).
- **Fixed floating**: the jack-o'-lantern builder floated every pail 3–4 cm and its stem 3.6 cm above the pumpkin; two
  frontage pails stood over the wrong crate stacks (one 26 cm up). Now the builder stands on its origin, the stem sits
  in the top, `SAKURA_CRATES`/`crateTops()` are shared by the crates and the staging, and tests hold pails and stem.
  Studio's registry height for the pail is updated (0.247 → 0.203 m).
- Pre-existing, **not changed**: the four cardboard obake are on the shutter's plane; with the shutter up they stand
  about 20 cm in front of the open glass. Needs an owner decision.

### Pop (Camera)
`looks-gl.js popped()` and an Adjust row beside Enhance (switch, 0–100%, 50% first). In the first pass after Enhance,
from the photo's own pixels: midtone clarity against a soft mipmap blur about a 48th of the crop across (so preview,
thumbnails and a tiled save agree), a little shadow opening only where there is detail, held highlights, a gentle
S-curve, and vibrance; skin is spared most clarity and vibrance. First version lifted a moody portrait's background
and texture; tuned after looking (`/tmp` renders not kept). `recipe.pop` in `normalRecipe`; off is byte-exact.

## Verification

Run locally in this cloud session (headless Chromium 153 with SwiftShader; not a phone, not Safari):
- Camera units: zip **7/7**, face-stamps **6/6**, looks-gl, modules, offline inventory; MCP policy **16/16**.
- Camera browser on the Halloween commit `3bcd38eb`: main camera **56/56**, face stickers **11/11** (hats included),
  offline **13/13**, backup **7/7**, Enhance **22/22**, retouch **40/40**, UI **82/82**, crop **33/33**,
  save/share/layout **14/14**, paper **5/5**, integration **8/8** (its prior-engine comparisons need CI's baseline
  files), sticker contours **4/4**, Smart **14/14**, screens **5/5**; **real MCP/Camera acceptance 20/20**.
- After Pop and the shared heading row (`b2501158`): Pop **5/5**, Enhance **22/22**, UI **82/82**, retouch **40/40**,
  face stickers **11/11**, offline **13/13**; integration **8/8** after Pop. (The first Pop run caught both layout
  failures: the slider off a 320 × 560 screen, and the UI suite's sticker-tab count; fixed, not relaxed.)
- World: halloween-street **12/12**, catalogue **7/7** (`build-catalog --check` current), runtime-package **4/4** after
  `npm run build:runtime`, fujitas-back-moves **18/18**, asset-modeller **6/6**, wardrobe-catalogue **8/8**,
  resident-guide-catalogue **6/6**. `onsen-seats` fails 1/2 **identically on the starting main `4f545da`** (Nhung's
  seated body outside the massage chair's keep-clear); not in the guard, not touched.
- After merging main's navigation feeder (`d3e357b9`), locally: runtime-package **4/4**, halloween-street **12/12**,
  catalogue **7/7**, ferry-bridge **2/2**, -lantern **6/6**, -wipers **5/5**, resident-guide **2/2**,
  resident-guide-catalogue **6/6**, wardrobe-catalogue **8/8**, camera offline and modules.
- Hosted CI on `d3e357b9`, and again on the merged head `d9154c77` (chunks restored): World **guard** passed, **iphone-startup** and all three **ferry-exploration** profiles
  (desktop, iPad portrait, iPad landscape) passed; Camera **camera**, **camera-ui**, **camera-retouch**,
  **camera-smart**, **camera-offline**, **camera-audit**, **camera-face-backup** and **mcp** passed. **linux** 57/59: the
  same two failures recorded on main in `camera/HANDOVER-RETOUCH-2026-10-31.md` (`controller-game` spawn `[0.3,-72.7]`
  vs `[-1.5,-72.7]`; `housing-consolidation` Minato Maru paint/metal on post-office-lot); this PR touches neither.
- Not run: physical devices.

## Next

1. Owner review: face stickers on their own photos, the Season sheet, Pop, and World's bats/sweets/cat ears.
2. Commit the Studio cards into `jojo` from a session with push access (see above).
3. Physical iPhone: backup Save to Files and restore, Home Screen vs Safari albums, face stickers and Pop speed.
4. Audit's remaining items: EXIF capture date, undo/redo, Face pack (landmarks), Hide my brows; the obake decision.
