# Experience improvement implementation

This is the sequential continuation of the experience audit initiated on 18 October 2026. Keep one substantial task active. Existing accepted game behaviour, occupied homes, compact Minato and iPhone resource safeguards remain authoritative.

## A01 - truthful saves and safe player changes

Implemented on `codex/experience-save-reliability`, starting from main `1e792f781b54f9b0bd5cbc06141117d145304ea0`.

The original reproduction rejected storage writes after changing the live balance from 1,200 to 8,123 yen. `Save now` displayed `Saved` while the old balance remained on disk. The failed write also advanced the displayed successful-save time. Switching/new-player actions reloaded without checking whether the current progress had saved.

Changes:

- `activities.js::save` updates the successful-save timestamp only after the current state has actually been written. Preparation errors use the same failure status.
- Manual save and navigation use `saveBeforeLeaving`. A failed write keeps the live session and offers retry, export or continued play. Export can capture unsaved progress when local writes remain unavailable.
- Switching and creating players require the current save to succeed, then check the roster write before reloading. Leaving for Johansson Studio uses the same guard.
- `src/save.js::addPlayer` reports failed creation. Imported progress is stored before selecting its new slot; failed roster activation removes that newly created inactive save where storage permits. Existing players are not selected on import failure.
- In-game and title imports share the same activation path and reject array-shaped save states. A failed title import clears the input so the same file can be retried.
- Existing save keys, old-save migration, previous-copy recovery, rescue copies and export format remain supported. No new save system or schema is introduced.

Validation: 48 focused checks pass across `save-feedback`, `save-safety`, `town-clock`, `title-preview-save`, `pocket-album-save`, `year-loop`, `resident-life-enhancements` and `runtime-package`. The production runtime build passes. Fourteen new checks exercise player-visible behaviour and write failures, including title import retry and exporting a live unsaved state. This is logic/DOM-fixture validation, not physical-device acceptance.

## Next active task - A02/A03 interior and resident acceptance

Review PR #229 and its exact accepted commit before integrating; it was still receiving verification updates during A01. Its successful WebKit workflow is run `39170288260`.

The recorded result shows cleared room children and zero portal-cache bytes after exit, stable post-warm-up geometry counts and an indoor town clock advancing from minute 145 to 148 while a shore resident reaches home. Source review confirms that the fix retains the actual window outlook and live storefront occupants. Captures of the Sakura outlook and izakaya interior were inspected.

Do not describe this as complete memory or physical Safari acceptance: the report's izakaya-exit texture counts are 471, 472, 473 and 474 across its four cycles. PR head `48c7a135` identifies this as a cloned mascot skeleton bone-texture leak and adds disposal plus a strict post-warm-up texture assertion. Its new workflow must pass before that correction is accepted. The report's render-call/triangle values are accumulated diagnostics, not measured frames per second. Physical iPhone crash reproduction and sustained play remain unverified.

The audit's four legacy neighbourhood-access failures must also be reconciled with the intended compact-town routes before A03 closes. Do not remove assertions simply to make the suite green.

## Later order

A04: reconcile the actual published Linux binary with accepted web fixes (PR #230 has since merged into the Linux branch; do not assume its package contains later work). A05: foliage and houseboat visual/camera defects. A06: complete the existing Sakura office T02 acceptance. A07: controls/readability. A08: one complete short visit using existing favours and memory. A09: domestic pilot, then one retained household per change. A10: individual stories and atmosphere refinements.

Do not begin T03 home decoration before T02's remaining acceptance gate closes. Do not add festivals, combat, districts or speculative empty dwellings as part of this programme.

## Handover discipline

For each stage record base/commit/PR, exact scope, code owners, reproductions, checks and results, inspected views, remaining limitations and the next action. Rebuild the runtime for source changes, retain dependencies of the last published manifest, and verify the actual published build. A successful build or a merged PR is not full play acceptance.
