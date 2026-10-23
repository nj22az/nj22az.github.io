# Fujita television comic — Studio integration, 23 October 2026

## Studio integration — latest owner instruction

The owner requested opening the comic in Studio, trying shaders, changing angles and poses, and updating the current published version if needed. This supersedes the earlier local-production-only scope below.

- Added a built-in **Open Fujita’s TV comic** action and direct route `/avatar-creator/?comic=fujita-tv`. It builds all three panels from editable scenes using shared cast recipes. Existing captured panels are preserved: opening the example refuses until they are removed or saved elsewhere.
- Every panel has **Edit scene**, existing camera turn/height/distance controls, pose/expression/position controls, and a new per-panel **Shader look** selector using the same 14 look shaders as World. Natural bypasses postprocessing. Speech and captions remain crisp above the shader.
- **Update panel** is beside the camera controls during editing. Download/open project round-trips camera, pose, shader, dialogue, character recipes, seats and beer props. The example factory is shared with the offline reproduction helper.
- Retained the real shed, measured footstool support, bar beers and bent-arm resolve pose. Reset camera for the shed now uses the reviewed final camera.
- Incorporated latest main through `dcbb63f3` (including current oil shader) and rebuilt the shared runtime. Browser entry points are versioned for cache refresh.
- Local source branch: `codex/fujita-tv-comic-2026-10-23`; integration commit `c75fc5f9`. Publishing branch: `codex/fujita-tv-studio-editor-2026-10-23`.

Validation: local headless WebGL Studio opened the three scenes through the real URL/UI; all 14 looks compiled without shader errors. A UI test changed panel 2 to Wave, camera orbit 14 and Manga, updated it without adding a fourth panel, downloaded the project, reopened it, and confirmed those settings. Desktop and phone screenshots inspected. Two blocked external font requests were the only browser errors. Scene tests: 14 passes, one pre-existing Thuận skirt-floor TODO. Model/project and runtime package checks: 9 passes. Full World guard first run: 358/360 passed; English inventory lacked Rollup before build dependencies were installed (subsequent English test passed); no-z-fighting exceeded the default 2 GB heap. A 4 GB retry was killed by environment memory pressure; no geometry failure was reported. Further isolated check/release results will be appended below. Physical iPad/Safari remains unverified.

Release: [PR #375](https://github.com/nj22az/nj22az.github.io/pull/375) merged as `fffc491bf4dcfbd212e93542ffa485530fdb1ddf`, from publishing commit `56fc05b891b734fd92959587dd03f71870c54959`. The concurrent owner-priority changes on main were preserved. The final runtime build passed, with all nine model/runtime checks green. The isolated no-z-fighting run with `node --max-old-space-size=4096 --test tests/no-z-fighting.test.mjs` passed all 13 checks after freeing temporary browser downloads. Thus both initially failed guard files passed on rerun. GitHub guard/Linux checks were still in progress at sign-off; no completed CI result or physical-device acceptance is claimed. Pages publication remains to be verified. Direct route: https://nj22az.github.io/avatar-creator/?comic=fujita-tv . Earlier paragraphs saying no authorisation or deployment describe prior revisions only.

Owner review requested: correct clipping feet, make panel 2 a dramatic low-angle fist pump, and put panel 3 in Fujita’s shed drinking beer while watching television. The existing requirement to use Johansson Studio stands.

Branch: `codex/fujita-tv-comic-2026-10-23`, based on main `85065dca5f6d574f1d64d71c2ed83d25da3a683a`; earlier production commit `f50a9e5`. This revision is local only, not a PR, merge, runtime release or deployment.

## Latest owner revision: English, bar conversation and improved second panel

- Panel 1 now uses the actual Minato Izakaya room. Johansson and Fujita sit opposite each other in its booth, both holding open Umineko beer bottles. Johansson speaks while Fujita takes a sip.
- All three panels use English dialogue. Final television caption: “...and after the break, our samurai marathon continues!”
- Panel 2 remains in the bar for continuity. A Studio-only `ResolveFist` pose keeps the right fist outside the cheek silhouette with a bent elbow, head directed towards the camera, and feet grounded. The camera is 80 cm above the floor, three-quarter view, with a 50-degree lens. This replaces the stiff overhead arm and extreme view up the chin.
- Studio-only `SitBeer` lets Johansson hold his bottle while speaking. Both poses use the existing shared avatar rig, without changing resident recipes or World animation behaviour.
- Panel 3 retains the measured seated drinking pose and real shed from the previous revision.
- Reproduction helper sets the page base to `/johansson-town/` so Minato’s existing GLB loads locally.
- Outputs now use `output/fujita-tv-v3/`. The new poses, shed and held-beer field remain local Studio source changes, not a public deployment. Branch is unchanged; no merge or PR authorised.

Latest checks: 14 passes, zero ordinary failures, one existing Thuan skirt-floor TODO across scene-model, scene-avatar and scene-catalogue tests. The new elbow/face-clearance check and existing shed-foot support check both pass. All three final panels and the English lettering were visually inspected; project inspection confirms two Minato scenes followed by the shed. `git diff --check` passes. Physical-device and public deployment remain unverified.

## Earlier revision delivered

- Studio’s existing `renderScene` / `renderComic` render three square editable panels with the canonical Johansson and Mr Fujita recipes and Swedish text.
- All three scenes now use the real World port-shed builder. A Studio stage re-centres it, freezes its existing samurai-drama channel, hides its simulation actor and supplies a measured armchair seat. The existing footstool is slightly deeper for full shoe support.
- Panel 1: Johansson addresses Fujita in his chair. Panel 2: actual `FistPump` pose, camera 28 cm above the floor. Panel 3: Fujita sits with an open Umineko beer bottle at his lips, watching the CRT. The crate and period-drama picture remain visible.
- Studio now passes seat-front data to the existing avatar animator and preserves its horizontal seat offset through placement and cached renders. The discarded offset caused the previous feet/seat overlap.
- Scene normalization retains the staged beer prop. No resident designs, live duties or schedules change.

## Verification

- Real local headless Studio renders visually inspected through final individual panels and composed strip.
- Focused foot geometry regression passes for both Sit and SitDrink: no foot vertices within the chair seat, no vertices beneath the footstool top, and lowest shoe point within 0.5 mm of the 18.8 cm support height.
- Five scene-model tests pass. The broader scene-avatar/model run passed its eight prior non-todo tests; its first new geometry check used an undefined cast lookup and was corrected to `recipeFor('Mr Fujita')`, then passed independently. Existing Thuan skirt-floor TODO remains unrelated. No full World guard, runtime rebuild or physical Safari/iPad acceptance claimed.
- `git diff --check` passes. Production render may log an unrelated favicon 404.

## Reproduction and delivery

From repository root, with Playwright available:

```sh
TOWN_CHROMIUM_PATH=/path/to/chrome-headless-shell node avatar-creator/render-fujita.mjs
```

Latest outputs are in `output/fujita-tv-v3/` (the superseded shed-only version is in `output/fujita-tv-v2/`). The delivered production archive contains the revised image/project and the required source files. The new `fujita-shed` location and beer field exist in this local source only: the revised project needs these changes to reopen faithfully; the public Studio has not been updated.

Next: owner visual review. If these Studio capabilities are to be published, integrate this source with fresh main, run the required shared-runtime checks and publish through review. No permission to merge is inferred from this comic revision.

## Earlier version

The first delivery staged the story at Umi-no-yu, because the shed was not available in Studio. The owner rejected its foot overlap and specified the shed, beer and low camera. This revision supersedes that artwork.
