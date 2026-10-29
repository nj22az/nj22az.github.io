# Handover: the costume gallery's outfits in World's wardrobe (29 October 2026)

The owner: "https://ai-costume-gallery.pages.dev/ Bring the suitable outfits to Johansson world".

**State: on the branch `claude/wizardly-mendel-ajetak` (this repository), not on `main`.** Publishing waits for the owner's
look at the pictures (`docs/qa/wardrobe-gallery/`) and their word.

## What the gallery is, and the rule we kept

COSTUME-DB-01 (衣装集, by ギア): 1,407 AI-generated pictures of outfits with no person in them, in spring, summer, autumn,
winter, lingerie, party, swimwear and "sexy" categories. Its terms allow use, editing and reference in a work, and
**forbid redistributing the image data**; they also ask that it not be used to depict real people or minors. So no
picture of it is in the repository, the game, Studio or the site; the looks were studied in a scratch folder (deleted
with the session) and rebuilt from World's own garments and the island palette. Every set made from it is written for
grown-ups. Full record, the selection rules and every id: [docs/research/costume-gallery.md](../docs/research/costume-gallery.md).

## What changed

- **Two new pieces**, appended so no saved look or share code moves, never dealt by the dice (`DICE.patterns` keeps the
  old prints, so a look made from a seed is unchanged):
  - the **tiered skirt** (`tieredskirt`, `src/avatars/tiered-skirt.js`; `skirt-shape.js` `skirtSpec(m,'tieredskirt')`,
    `build.js`): a smooth yoke and two gathered tiers on the long skirt's line and length, each tier a hem's step (12 mm
    at adult scale) fuller than its seam; fitted cloth like the other skirts (towel-fit kind 2, the hem springs), and an
    apron over it lies on it (`tieredReachAt`). In the maker under Bottoms → Skirts, with four colourways.
  - **gingham** (`PATTERNS` `gingham`, `garment.js`): paper-white bands both ways at half strength over the top's cloth
    and its sleeves; not on a tank top or overalls, and on a sundress only below the bodice's edge. A top print only: a
    skirt's print is per-vertex and comes out jagged (the plaid), so a gingham dress is a gingham bodice over plain cloth.
- **Thirteen sets, 35 colourways, from 46 gallery looks** (`src/avatars/outfits.js`, after `vy-monochrome`, each with
  `reference`: the gallery ids): `tiered-sunday` (Miss Higa), `cherry-bench` (Ms Ganaha under the harbour cherry in
  February), `shirt-dress` (Ms Uezu, Nhung), `linen-trousers` (summer visitors, Ms Uezu), `laundry-round` (Ms Ganaha's
  coin-laundry round), `late-bowl` (Ren after half past ten), `pier-watch` (Kai between calls), `gingham-holidays`
  (Miss Higa), `haarii-day` (the Haarii crowd), `january-classroom` (Miss Higa), `verandah-january` (Grandmother Higa),
  `trading-round` (Kōji on Sakura Trading's round), `celebration-dress` (wedding and sixtieth-birthday guests). They are in
  World's maker, World's photo studio and Johansson Studio's Edit character (`/avatar-creator/`, which shares the code),
  with search and the "Worn by … · why" line.
- **Left out on purpose:** lingerie, "sexy", swimwear (bikinis; World's swimwear is its own modest system), the party
  category's satin gowns (four chiffon midi dresses kept), the fur, coats, boots and sheer tights of autumn and winter
  (knitted layers kept), and across all categories sheer legwear, corsets, crop tops and mini skirts with over-knee socks.
- `tools/wardrobe-sheet.html`: a review sheet, one body in each set or trial outfit, front, back or walking.
- Records: `RESOURCE_SOURCES.md`, `docs/qa/wardrobe-gallery/` (World's own renders and a Studio screenshot).
- Tests: `tests/wardrobe-gallery.test.mjs` (7 tests, in the CI guard); the tiered skirt added to the bodies of
  `seated-pose.test.mjs` and `floor-sit.test.mjs`; `wardrobe-batch2.test.mjs`'s pinned lists extended by the two appended
  ids. The published runtime rebuilt (`npm run build:runtime`).

## Checks run (29 October 2026, this cloud session)

- `tests/wardrobe-gallery.test.mjs`: 7/7 (appended, never dealt, in the maker; the skirt a watertight outward shell with
  its steps, gathers and reach on 16 bodies; fitted cloth on child, adult and elder; gingham's marks and no extra
  vertices; each set's palette, three cloth colours, first colourway, ids in the research note, grown-ups only, found by
  search; two draws and the vertex budgets; every move without popping on Thuan and a child).
- `seated-pose`, `floor-sit`, `wardrobe-batch2`, `avatar-wardrobe-sets` and the other wardrobe and skirt suites: all pass.
- CI guard (`node tools/ci-guard.mjs`, 91 files with the new one): 457/459 before the final runtime rebuild. The two
  failures: the runtime check (source changed after the build; rebuilt again last, see the commit) and
  `no-z-fighting.test.mjs`, which runs out of memory at node's default 2 GB heap **on untouched `main` too** in this
  container; with `NODE_OPTIONS=--max-old-space-size=8192` it passes 13/13 on both. After the final rebuild
  `runtime-package.test.mjs` passes 4/4 (published as `23a8f59`).
- Full suite (`tests/*.test.mjs`, 454 files, 6 GB heap): 2,248 of 2,262 tests pass, 6 fail in 5 files, and **each of
  the 6 fails the same way on untouched `main`** (`3e4a432`, run in a separate worktree): `architect-masterplan` (a
  building's circuit to Main Street), `izakaya-lived-in` (props on furniture), `onsen-seats`, `pole-hug` (2) and
  `resident-guide` (published photo articles). None reads the wardrobe; they are not in the CI guard.
- Pictures: every set rendered front, back and walking on Ms Ganaha and looked at; Johansson Studio opened in Chromium,
  the sets found by search ("gingham", "tiered", "cherry", "Ganaha") and Cherry bench put on, with no page errors.
- Not done: a physical phone or the Linux edition; the live game's own maker on a device.

## Found, not new, and not changed here (for the owner to decide)

1. **Hands at rest lie in every long skirt.** Standing or walking, a feminine body's mittens hang 4–6 cm inside the
   skirt's hip line (measured on the long skirt and the tiered skirt alike, within 2 mm of each other): the rest pose
   puts the arms inside the hips' width. Seated is already handled. A fix is the rest pose holding the arms out by what
   is worn at the hips (`animate.js`), which moves every skirt wearer in every film, so it is not in this change.
2. **Getting down to the floor, long skirts jump.** In the landing frame of the floor sit, cloth lying on a thigh's
   axis is pushed out of the other side of that thigh (`towel-fit.js` capsule push, shared by all skirts): the long
   skirt jumps 5–6 cm further in one frame than the bare body on every grown-up (the tailored skirt 2–3 cm). The tiered
   skirt matches the long skirt (within 3 mm); its test holds it to the long skirt in that one move, with this note as
   the reason. The mend is in the shared fit: choose the side to push to from the cloth's place (on the lap: up) rather
   than from the axis, in the GLSL and its JavaScript twin, then rerun the seat tests.
3. A pale cap shows the hair cut flat under it at the back (the style guide's batch 4, "hair eased in under a hat"); the
   gallery sets use dark caps.
4. The Pixar bodies (Thuan, Johansson, Thao, Chin, Tetsuo, Mr Fujita) wear their own clothes only, so none of the
   wardrobe shows on them (`pixar.js`), and the Studio maker's pictures show the Pixar body when one of them is chosen.
   That is why no set is written for them.
5. The storyteller (`src/feed/`) does not read outfits, so the sets are for the maker, the photo studio and Studio, as
   the earlier wardrobe batches are; residents do not change into them in the street.

## Next

1. The owner looks at `docs/qa/wardrobe-gallery/sets-front.jpg` (and back, walk, the Studio screenshot) and says yes or
   gives notes; then merge to `main` and verify Pages.
2. Studio in the studio repo (`nj22az/jojo` `town-studio/`) gets the wardrobe on its next `remotion/tools/sync-town.sh`.
3. If wanted: mend items 1 and 2 above (they help every long-skirt wearer); let the storyteller dress a story's cast
   for its occasion (the Haarii races, a wedding, January) from these sets.
