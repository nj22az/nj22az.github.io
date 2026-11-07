# Minato Maru engine-room exploration — 1 November 2026

Published game source: **`6c6cc98207d2cb08ba5d7477064ba4535185b899`**, tree `5789ba8913c5e1ac1dbe4c6f9c6d87aaa50e659f`. The owner authorised implementation of free-look navigation and continuation of the existing instruction to push the engine-room work to main. [Navigation handover](../../johansson-town/briefs/HANDOFF-FERRY-EXPLORATION-2026-11-01.md). [Live game](https://nj22az.github.io/johansson-town/).

Free-looking walking is the default, at 1 m/s or 0.35 m/s precision speed. The ship-relative lens has no head bob or automatic cuts. Tap visible machinery to orbit/zoom; Explore/Escape returns to walking. The collapsible measured plan guides to the actual ladder, with eight old views available only by explicit selection. The enclosed-room draw excludes hidden town scenery while retaining full graphics.

## Verification

- **580/580** guard checks, 111 files, 282 seconds ([summary](guard-summary.log)).
- **24/24** final focused package/vehicle/navigation checks, including eleven new camera/navigation/UI cases ([log](panel-focused.log)).
- **126/126** public files match their SHA-256 hashes, including the unchanged GLB and prior runtime chunks ([files](public-files.json)). Pages deployment succeeded.
- Native rendered verification: [workflow run 41280684803](https://github.com/nj22az/nj22az.github.io/actions/runs/41280684803).

The rendered checks drive real keyboard, pointer/touch and control-panel inputs in the actual game. They verify the two-mesh/80,376-triangle Blender asset, free walking/looking, standing lens stability, precision speed, visible-surface selection, orbit/zoom/return, ladder guidance, all eight optional views, five room placements, normal lens restoration and no page errors. Phone startup, reload and shop/office room-entry checks remain in place. Fresh tablet contexts retain their real portrait/landscape viewport and screen sizes.

All five native jobs passed on the pinned final source. Actual captures from each profile were reviewed:

| Context | Result | Report | Capture |
| --- | --- | --- | --- |
| Phone | Passed, including startup/reload/room entries | [Phone](phone-report.json) | [Inspection](ferry-inspect-phone.png) |
| Fresh iPad portrait, 744 × 1133 | Passed | [Portrait](ipad-portrait-report.json) | [Ladder guide](ferry-map-ipad-portrait.png) |
| Fresh iPad landscape, 1133 × 744 | Passed | [Landscape](ipad-landscape-report.json) | [Ladder guide](ferry-map-ipad-landscape.png) |
| Desktop, 1280 × 800 | Passed, including mouse panel/tap/orbit | [Desktop](desktop-report.json) | [Inspection](ferry-inspect-desktop.png) |

Standing ship-relative lens drift was below 0.01 m in every profile; normal walking covered about 0.497 m in 0.6 s and precision walking about 0.174 m. The inspection-return and panel-opening assertions passed without removing or relaxing those checks. Videos remain in the native artifacts; archive sizes and SHA-256 digests are recorded in [publication.json](publication.json). Archives are downloaded, hash checked and CRC checked before extracting captures.

## Corrections found during rendered testing

The initial implementation `8bdf28c6073775fb4f87115ba2aff37b3be13ca7` was published with metadata as `c437d439c8f1e4ac49199d15289c029b150b3d46`. Its hosted guard passed 578 tests, but phone/tablet inspection return exposed 35 mm of residual walking when a mode changed between simulation frames ([phone](initial-phone-failure.json), [tablet](initial-tablet-failure.json)). `b21b86af1f88db64ac8910f5e5a849886cfe7c64` immediately clears walking easing and touch auto-run on every engine-room mode change. A regression exercises opening and closing inspection between updates. The original return-position assertion remains.

`fb8a82eff7e254bbd775e6f022cba58540383e0d` split fresh iPad portrait, landscape and desktop checks into independent jobs. Phone and both iPad orientations passed on that source, along with 579 guard tests. Desktop's first attempt entered Town but exceeded the automation's 30-second Enter click limit ([report](initial-desktop-startup-timeout.json)); its retry reached the engine room and passed walking/free look/stability, then failed to open the details panel by mouse ([report](initial-desktop-panel-failure.json)).

The final source `6c6cc98` gives the summary an explicit single-click toggle and preserves the DOM when the live label is unchanged. Ladder guidance computes one final label before assigning it. The added regression opens the panel, updates it repeatedly, operates precision, closes it and checks stable guide labels. Startup automation allows 120 seconds for Enter under software rendering; the controls assertions remain. The runtime was rebuilt and all prior production chunks retained byte-for-byte.

## Geometry and limits

The measured CAD, Blender source, 2,400 mm working headroom and GLB are unchanged. The control-booth chair blocks the aft pocket for a standing 560 mm footprint; the route finder refuses to walk through it. Inspection views the controls around it. No furniture or collision footprint was shrunk. A future furniture change requires an updated measured arrangement and Blender export.

The cloud interactive browser could not create a WebGL context; native WebKit/Mesa software rendering supplies the graphics evidence. Standard ink, grade, HDR and MSAA remain enabled. Software frame intervals are observations, not device benchmarks. **No physical iPhone/iPad/Steam Deck acceptance or hardware frame-rate claim is made.**
