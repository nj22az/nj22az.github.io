# Maintenance planner — complete equipment dossiers and retained reports

2 November 2026, release `2026.11.02.10`. Owner request: “I want all information available, even test results, and absolutely everything”. Base: main `61d4c7789915c245d5e4dc9d0bf10bded649b9a0`. Prior work: [Blender object library](HANDOVER-BLENDER-OBJECTS-2026-11-02.md), [guided risk assessment](HANDOVER-RISK-USABILITY-2026-11-02.md).

## Delivered behaviour

**Full record** is available on every asset tile, through the existing asset details and from registered-item links below each object model. It joins current programme/asset specifications and all retained test/measurement records, document copies and references, scheduled maintenance and completions, risks/actions, product/use classification input/result snapshots and histories, pressure requirement reviews/evidence, statutory control decisions, supervision/remaining-life/change journals, linked equipment and preparation, notes and additional sourced properties. Expandable entries retain all fields without truncating observations. The final raw-data section and item JSON export expose the complete assembled item data.

New test records retain type, title, date/person, report/procedure reference, method, configuration/conditions, instruments/calibration references, declared outcome, reviewer/date, conclusion and up to 100 structured reading rows (value, unit, lower/upper limits, uncertainty and remarks/source). Comparisons are inclusive numeric checks against the entered limits, separately from the declared outcome; unknown values/units/limits do not become passes. Fail/Conditional or an outside-limit reading opens a corrective action. Retests/corrections append history, link the earlier record and require a reason; no test form clears a statutory decision, inspection window, maintenance interval or existing action/hold. No real test results are invented or seeded.

Documents can retain a file copy and/or controlled HTTPS location, with reference/revision, category, issuer/language, date/validity, custody/source/notes and named review. A reviewed document needs a reviewer/date and recorded checks, not just a checkbox. Copies may link an existing pressure-evidence reference for the same equipment, without modifying its legal review or control outcome. Additional properties and notes accommodate spares, materials, suppliers, warranty and any other item-specific information.

## File integrity and portable backups

Retained copies use SHA-256 IDs in IndexedDB `maintenance-retained-files-v1`. Workspace metadata stays under the original localStorage key. Limits: 10 MB per file, 50 MB total referenced files; larger files can use controlled HTTPS references. This remains device-local storage, not a server or authenticated archive. Hashes detect changed bytes, not genuine certificates. Controlled originals must be retained independently.

Complete programme backups and per-item exports include referenced file bytes. Missing/corrupt files stop export instead of being silently omitted. Restore validates metadata, sizes, encoding and hashes, then commits immutable file copies before workspace metadata. A failed validation/file transaction leaves the workspace intact. Failed metadata persistence leaves the previous workspace intact and may leave an unreferenced blob, never a partial metadata replacement. Full programme archives use outer version 2 and restore the original version-1 workspace schema; earlier version-1 backups remain supported, while older app versions reject new archives rather than ignoring the file vault. Item exports are review packages, not whole-programme restore files.

## Validation actually run before publication

`node --test maintenance-demo/tests/*.test.mjs`: **321/321 pass**. Includes all earlier AFS boundary/evidence/lifecycle checks plus numerical/unknown comparisons, correction cycles/cross-asset links, document review requirements, complete bundle preservation and ownership, file-byte round trips, missing/corrupt file refusal, failed transactions and metadata saves, legacy and version-2 backup restoration, failed-test follow-up and unchanged inspection/maintenance records. New JS modules pass `node --check`; `git diff --check` passes.

The documented synthetic UI fixture `tests/record-review.html` supports phone/tablet/desktop inspection and a clearly marked synthetic report attachment. Its verification action reads the actual retained IndexedDB bytes, checks SHA-256 and exercises the complete archive round trip without replacing workspace metadata. Actual production-browser and deployment results follow below. No physical Safari or real equipment certification is claimed.

Implementation: [record guide](docs/COMPLETE-RECORDS.md), record-core.mjs, record-files.mjs, record-ui.mjs, records.css. No external libraries or model files added. Existing browser-local data are normalised in place without changing the original key. Only maintenance files and this handover index row are published; other project areas remain outside this change.


## Initial production checks and data-preservation refinement

Initial source `2a219513a0edb6017418fc941b2fd46f8108e7ba` published to main. Hosted [319-test acceptance 41433870370](https://github.com/nj22az/nj22az.github.io/actions/runs/41433870370) and [Pages 41433870150](https://github.com/nj22az/nj22az.github.io/actions/runs/41433870150) passed. Actual published Chrome retained a synthetic QA text report through the document form. Its file bytes and SHA-256 passed the archive round-trip check both before and after reloading the page. This fixture did not replace workspace metadata. A recorded test with two readings (6 outside 1–5, 5 exactly at the upper boundary) preserved the declared Pass, displayed the outside/within comparisons and opened a High/Open corrective action. All QA content was labelled synthetic, not actual equipment evidence.

Release .10 leads a conflicting result with Review required rather than leading with the declared Pass. The declared result and original measurements are still retained. Engineering field labels now include the known PS/TS/volume/operating-hour units. Retained file metadata also captures the available original File modification timestamp for new uploads.

A snapshot guard now blocks an older open workspace/form from overwriting newer localStorage data. A storage-change notice offers reload and export of the current view, retaining unsaved form text for copying; it does not automatically discard a stale view. New record, pressure-record, restore and ordinary save paths share this check, and submit capture prevents stale form handlers from running. This is a browser-local stale-write guard, not authenticated multi-user collaboration. Regression tests confirm that a newer tab's saved metadata survives a stale result submission, and that the conflict warning does not rewrite the declared outcome. Final local suite: 321/321 passed. Final deployment and browser observations are appended after publication.


## Final published verification

Runtime source: main `6c43060d59ad6cfa0ebe3855fbe256d0e77ecba5`, release `2026.11.02.10`. Hosted [acceptance run 41436142859](https://github.com/nj22az/nj22az.github.io/actions/runs/41436142859) and [Pages deployment 41436141539](https://github.com/nj22az/nj22az.github.io/actions/runs/41436141539) both completed successfully. Public index, object-library module, all three record modules, stylesheet and review fixture matched the local source byte for byte.

Actual published Chrome checks: the appended retest retained the original result as superseded history, including both readings and the original declared outcome. The original High/Open corrective action remained open. On release .10 the retained report again passed original-byte, SHA-256 and complete archive round-trip verification. All saved QA records explicitly identify synthetic software checks and are confined to this QA browser workspace; they are not seeded production evidence.

Responsive note form: at 390 / 768 / 1280 px, page client and scroll widths were equal (390 / 768 / 1280); dialog widths were 349 / 678 / 678 with equal scroll widths. No horizontal overflow. A live two-tab check saved a synthetic note in the newer view, then attempted submission of the older form. The older view displayed the conflict notice and blocking alert, retained its unsaved title/text, and did not replace the newer saved note. Explicit reload showed the newer note.

No real equipment reports or measurements were provided. No actual inspection, pressure test, equipment acceptance, or physical Safari run was performed. Numerical comparisons and software validation are not statutory verification. Files remain local and require complete backups for transfer or recovery.
