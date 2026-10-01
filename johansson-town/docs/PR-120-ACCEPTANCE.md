# Avatar face dragging acceptance

Validated on 1 October 2026 against main `302d97b36af05d8333ccc250334a159b5d4ae821`.

The direct-drag implementation is reapplied to current creator source. The overlapping render-loop change retains `previewFacing`, preserving the later front/back selector. No dining, combat, Photo Studio, warehouse, shop or schedule source was replaced.

The browser runner now selects the mobile category by its combobox role. It projects UV positions through the rendered head and camera, including the existing idle animation, rather than projecting a separate unanimated avatar. This resolves the demonstrated selector failure and intermittent missed test gestures. Camera settling waits for rendered frames.

Validation:

- 27 avatar, placement, dining/combat and runtime-package Node checks pass.
- 27 Photo Studio, drinking, dungeon, ramen, warehouse and stock-restock checks pass.
- `creator-drag.browser.mjs` passes real Chromium/WebGL at 1280×800, 390×844, 320×568 and 844×390. Phone and landscape inputs use CDP touch events.
- Each selected eye/brow side, nose and mouth changes only its two placement fields; sliders follow; one undo restores the whole gesture without extra history. Mouse and touch cancellation restore the snapshot. Stationary taps leave no undo entry. Keyboard sliders remain usable; no overflow or page errors occur.
- During every active gesture the head geometry identity remains unchanged and the preview retains at most three draw calls. Physical-device frame rates are not measured by this software-rendered Chromium check.
- Existing `creator.browser.mjs` passes at 320×568, 390×844, 844×390, 1280×800 and 320×360, covering front/back preview, categories, controls, undo, sharing, save, focus and layout.
- Runtime rebuilt from current source; source fingerprint, compiled graph and stylesheet hashes pass. Only freshly generated runtime entries are added; the immediately preceding main runtime is retained for cached pages.

Run both browser runners with a local server in the same network namespace, `CODEX_PRIMARY_RUNTIME_NODE_MODULES` set to the runtime modules and `CREATOR_CHROME` set to the Chromium executable.
