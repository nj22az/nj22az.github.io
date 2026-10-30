# Handover: item artwork as a virtual magazine - 30 October 2026

The owner asked for interior adverts for Sakura's upper office, hall and storage, using Artlist, then: "I want to improve the look at item function in the game I want to be able to take a look and enjoy zoom in, download etc like a virtual magazine".

## State

Prepared on `codex/item-magazine-viewer` from production `main`, fast-forwarded to `1d355885` (verified Kissa Higa/fish-market publication notes). Not merged or published; the owner has not authorised publication. A draft PR will carry the completed candidate.

## What changed

- `src/ui/print-viewer.js`: one original image or a multipage collection. Fit page, 1-8x zoom, cursor/pinch-centred zoom, bounded drag panning, explicit touch double-tap, desktop double-click, keyboard controls, page buttons and fit-size swipes. Images retain their source aspect ratio. Downloads use the same-origin original image or a full-resolution PNG of an authored canvas page, without the World Look, lighting or wall atlas.
- `src/ui/reader-history.js`: temporary browser-history entries shared by prints and the woodland diorama. Back closes the current reader; rapid close/reopen and replacement between the two kinds wait for the preceding asynchronous Back. Replacements clean up images, captures, listeners and export Blob URLs. Activities retains its focus return and Escape/Tab handling.
- Sakura's magazine rack uses this reader while retaining its issue calendar, Japanese right-to-left page order, free reading and existing purchase callback. Drawn pages are rendered at 1200 x 1680 instead of the old 600 x 840. Raster pages use their native source.
- The existing flyer collection screen has a Look closer button. The harbour notice board's existing 3D Look action is preserved.
- The 3D product viewer retains Turn over, Put back, Ask Thuan and Into basket, and gains explicit zoom buttons, Fit item and Read label. Read label waits for the original painted/designed front label, with a held-item guard against late completion, then shows front/back pages with zoom, pan and PNG download. Escape returns to the product; Tab remains in the visible controls.
- Flat readers hold the hidden World renderer and simulation while open; the 3D product renderer also holds while its flat labels are open.

## Art and physical placement

The existing nine fictional campaigns remain canonical. Seven reviewed Artlist pictures replace their existing stair/hall atlas cells: UMINEKO Draft, Black, gift sets; KITANO 12; NAMI SOUR; ASAGAO rouge and UV milk. Full 1728 x 2304 WebP images are loaded only for inspection (8,218,414 bytes total); seven 360 x 480 previews total 132,432 bytes for wall decoration. B2 wall cells contain the 3:4 picture with narrow cream margins, preserving every letter without stretching or cropping. Existing poster meshes, push pins, positions and colliders stay unchanged.

Room loading awaits the small previews. If a preview fails or misses its 12-second deadline, the complete existing canvas design is retained and a late response cannot swap the artwork in front of the player.

Two generated proofs are excluded: SHIMAKAZE contains extra/duplicated Japanese glyphs; MINATO-TSURU duplicates a kana in the footer. Their correct existing canvas artwork remains visible and downloadable. No extra Artlist generation or credit spend was authorised. Provenance: `assets/graphics/sakura-trade/README.md`.

Each existing hall poster has an individual Look prompt opening the nine-campaign supplier collection. The office/storage allocation in the artwork brief is a proposal, not a claim of physical decoration: office - KITANO, UMINEKO gift, ASAGAO rouge; hall - Draft, Black, SHIMAKAZE; storage - sake, NAMI SOUR, ASAGAO UV. The upper decorations store and archive remain closed, non-enterable rooms. This work does not invent their interiors, alter their doors or install new office/storage wall slots.

## Verification

Final runtime build completed (655 modules); `tests/runtime-package.test.mjs` passed 4/4. Generated runtime files were restored from current main before this one final build, retaining main's cached entry points as the previous build. The final 94-file guard passed **500/500** in 502 seconds with a 6 GB heap and two-file concurrency. Evidence: `docs/qa/item-viewer/guard.txt` and `verification.json`. All 35 runtime entry files referenced by current main remain present for cached pages.

Checks completed during implementation: 39 focused interaction/print/woodland tests; 27 Sakura room/stair/trade tests; 20 final history/touch/woodland tests. The first 92-file guard attempt passed 474/476: one runtime-source hash was stale after a final title edit; the no-Z-fighting worker terminated without assertion output while an 8 GB heap ran alongside other tests. The geometry scan then passed 13/13 alone at 6 GB in 126 seconds, and the rebuilt runtime passed 4/4. No assertion is weakened or finding added to a baseline.

Cloud browser visual review used the actual components and activity CSS on an uncommitted local normal-button test page. Verified: desktop poster zoom to 150%, poster WebP download, both product label pages and a label PNG download, magazine page 2/8 with browser Back to the rack, poster-gallery browser Back, and the 390 x 844 nested layout. A phone-height overflow found in that review was corrected: the card's client/scroll height is now 790/790 with scrollTop 0 after 150% zoom, with title, Close, zoom/download toolbar and page navigation visible. The nested frame checks CSS layout, not touch hardware or a physical phone. The cloud browser disables WebGL, so whole-World entry, wall appearance and the 3D product overlay cannot be visually verified there. Physical iPhone/iPad Safari, Steam Deck and packaged Linux remain unverified; no Linux release is prepared.

## Next

Review the draft PR, verify the 3D product view and actual room art on a WebGL-capable browser, then publish only on the owner's word. Correct the two excluded Artlist proofs only after any additional credit cost is authorised. A separate measured placement pass is needed if the owner wants additional physical office/storage poster slots.
