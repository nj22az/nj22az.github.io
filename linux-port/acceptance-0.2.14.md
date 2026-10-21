# Linux 0.2.14 console acceptance

21 October 2026. Correction: [PR #334](https://github.com/nj22az/nj22az.github.io/pull/334).

## Verified causes

The original [extended run](https://github.com/nj22az/nj22az.github.io/actions/runs/39658423367) required the caption's right edge to be left of the action rail. The original full-world harness reproduced that failure locally. At 1280×800, the caption ended at y=688 and the rail began at y=705: they were separated vertically, so the assertion was incorrect.

A rendered fixture using the packaged styles also exposed genuine overlap in smaller windows. The shared quiet HUD supplied `left:50%` and `transform:translateX(-50%)`; the Linux rule set `right:24px` without clearing those centre anchors. The rail therefore remained centred despite the separate right column reserved by caption sizing.

Both stylesheet blob IDs match between the 0.2.12 and 0.2.13 release tags: console.css `2808c5ddf780104c76377ec3963a79c51e5a24e7`; quiet-hud.css `90755a78d38decbb416afa887ae1a1f354e2eea4`. The small-window overlap was pre-existing, rather than a new 0.2.13 stylesheet change.

The fix clears only those two Linux anchors (`left:auto!important; transform:none!important`). Shared web styles, typography, button appearance and controller code are unchanged. Acceptance now checks rectangle non-intersection on either axis, with regression cases rejecting real overlap and containment. Full-label checks remain; both rectangles must also have positive dimensions and stay in the viewport. Measurements and screenshots are saved before assertions, including on failure.

## Layout measurements

| Viewport | Original packaged styles | Corrected full-world capture |
| --- | --- | --- |
| 1280×800 | No intersection; horizontal-only assertion rejected it | 142.4 px horizontal separation |
| 1280×720 | No intersection; horizontal-only assertion rejected it | 142.4 px horizontal separation |
| 960×540 | 0.5 px vertical overlap and intersecting x ranges | 24.0 px horizontal separation |
| 800×600 | 18 px vertical overlap and intersecting x ranges | 24.0 px horizontal separation |

All corrected captures show the complete ferry action description and mapped A prompt. The 800×600 action uses four lines. Neither caption nor action rail is clipped.

## Newly reached resident checks

The continuation exposed two further obsolete test assumptions. B offers Exit near the actual doorway; it does not teleport a resident from beside the bed. The fixture now locates the room's recorded leave interaction, places the player beside it and waits for the Exit control before pressing B. The actual owned-bed waking and B exit both passed locally.

Mac deliberately retains the drawing authored as “Mr Nakandakari”, as the approved roster and existing retired-recipe tests specify. All 26 residents were selected locally; each selected model is now checked against the roster's exact authored-avatar mapping, rather than requiring the model's historical name to match the current display name. No game/controller changes were needed for either fixture correction.

The hosted continuation then exposed a third fixture issue: recipe-only selections (`started:false`) were sampled while still in Mai’s bedroom. Each subsequent selection recorded the active room into the preceding identity’s test checkpoint. The fixture now leaves the room and asserts outdoor context before that loop, so conversation setup does not inherit artificial home checkpoints.

A later run exposed a screenshot-readiness race: the old image filter used the whole viewport, including lazy portraits behind the fixed footer and outside the scrolling content. Its one-shot `decode()` call rejected a source while every actually visible portrait rendered intact in the failure capture. Acceptance now waits, with a timeout, for current visible portrait containers within the content rectangle to have complete images and positive natural widths. Missing or corrupt visible images still fail. The revised wait also passed a local cold-cache People-page check.

## Screenshots

These are local software-rendered captures of the downloaded 0.2.13 candidate with the exact corrected 0.2.14 console stylesheet. Hosted acceptance rebuilds the 0.2.14 package from source. The images are lossless WebP conversions of the PNG originals.

- [1280×800](../assets/linux-port/0.2.14/night-actions-1280x800.webp)
- [1280×720](../assets/linux-port/0.2.14/night-actions-1280x720.webp)
- [960×540](../assets/linux-port/0.2.14/night-actions-960x540.webp)
- [800×600](../assets/linux-port/0.2.14/night-actions-800x600.webp)

## Validation

35 desktop regression tests and the three existing retired-recipe/canonical-mapping tests pass locally. All four corrected full-world caption/action layouts and the menu layouts passed locally; their screenshots were inspected. The targeted continuation also passed conversation warnings, quarrel pause/no rewards, saved controller remapping, reload into Thuan’s saved nighttime bed and separate web-only isolation, with zero page errors or missing files. The captured 26-model selection list was independently checked against the canonical avatar mapping. The [complete hosted run](https://github.com/nj22az/nj22az.github.io/actions/runs/39672894193) and native acceptance remain in progress.

## Hardware limit

No physical Steam Deck or real controller was available. Steam Input translation, device GPU performance, physical buttons, suspend/resume and on-device installation remain unverified. Native Linux startup under a virtual display and SwiftShader does not establish those hardware results.

The correction uses version 0.2.14 because published release 0.2.13 is immutable. Existing save locations and formats are preserved.
