# Maintenance planner — guided risk assessment

Date: 2 November 2026 (Stockholm). Runtime release `2026.11.02.5`. Base: main `314a014c7c1860bdd730dee1efb3289e49344c5f`. The owner asked for a clearer risk matrix and an app usable without introductory training. Previous classification/evidence work and production verification: [classification handover](HANDOVER-CLASSIFICATION-2026-11-02.md).

## Delivered behaviour

- Replaced the unexplained matrix and numeric inputs with a four-part guided assessment: hazard/exposure; explained ratings; serious-risk decision and measures; assessor/review.
- New ratings start unanswered. Missing information is shown explicitly as Needs assessment. Earlier records keep their original fields and ratings and are flagged for missing new review details, without invented answers.
- Plain-language 1–5 choices, selected-rating definitions, live multiplication, row/column headers, selected-cell outline, a worked example and on-demand source guidance. Colour is supplementary. Planning bands remain 1–5 / 6–14 / 15–25, with no “safe” result.
- Serious-risk decisions and credible serious harm (consequence 3–5) trigger priority review independently of the product score. This is a conservative programme prompt, not a statutory threshold.
- A separate serious-risk decision and reasoning are recorded. Planned measures require action, responsible person and deadline and create/update a linked corrective action. Already completed measures require an effectiveness check for a complete assessment record. No-further-measure decisions require reasoning. Other incomplete records can be saved as drafts.
- Editing a risk never closes a corrective action. Unchanged closed measures stay closed; a changed measure creates a new action and preserves the earlier record. Only the existing corrective-action resolution workflow closes findings.
- A visible pressure-use question opens additional evidence prompts. AFS pressure classification, statutory control dates, holds and maintenance intervals are unchanged. Backup JSON includes the new optional fields through existing portable records.
- Existing English/translate=yes and protected technical notation retained. Action fields appear according to the decision. All assessment data remain local to the browser.

## Source basis checked this turn

Authoritative consolidated Arbetsmiljöverket pages checked on 2 November 2026:

- [AFS 2023:1](https://www.av.se/arbetsmiljoarbete-och-inspektioner/publikationer/foreskrifter/afs-20231/), 11 §: written risks and whether they are serious; 13 §: necessary measures immediately/as soon as practically possible, deferred action owner/deadline and checking implemented measures. The 5 × 5 screening matrix is a programme convention, not an AFS-prescribed formula.
- [AFS 2023:11](https://www.av.se/arbetsmiljoarbete-och-inspektioner/publikationer/foreskrifter/afs-202311/), 9 kap. 6–10 §§: use experience, remaining life, repairs/changes, accidents/incidents, deviations/control findings, placement and access, nearby activities and consequences, temperature and ongoing supervision/routine/life-journal assessment.
- AFS 2023:5 product classification remains separate from workplace risk assessment and operational A/B classification. No compliance certification or real-equipment acceptance is inferred from a score or a saved form. Clear interface guidance does not replace equipment competence or required worker participation.

## Verification and release state

`node --test maintenance-demo/tests/*.test.mjs`: **301/301 passed**. New checks cover every score cell, unknown ratings, serious harm at a low score, incomplete/legacy assessments, planned-action validation and deduplication, retaining closed-action history and unchanged statutory/maintenance records. New modules pass `node --check`.

REA 6.7.0 was invoked on the two new modules. It inventoried the source but could not complete parsing because this executor's `ps` reports `fatal library error, lookup self`; REA returned `capability_unavailable` / `process-ownership`. This is not a passed REA audit. Ordinary Node checks and behavioural tests passed.

Local visual review could not start: Playwright's browser binary is absent and its browser download returned an invalid archive. The available cloud browser cannot access the local port. Public production interaction, deployment and served-byte verification follow the bounded main publication. Do not describe responsive screenshots or physical Safari as passed until actually checked. No claim of first-time-user usability validation is made before a real user tries it.

Only the maintenance files and the root handover pointer are delivered; do not merge the full development branch. This follows the owner's existing explicit instruction to publish the maintenance work to main. Runtime publication identifier and actual browser observations will be appended after verification.


## Production review and readability correction

Initial runtime `d552ab59931372359f1689bde9e2e22afbdae347` published to main. Hosted tests [41406221377](https://github.com/nj22az/nj22az.github.io/actions/runs/41406221377) and [Pages 41406220384](https://github.com/nj22az/nj22az.github.io/actions/runs/41406220384) passed. Actual published Chrome interactions confirmed unanswered new ratings, rare/fatal arithmetic and warning, saving an incomplete draft, pressure-use prompt expansion, missing-owner/deadline prevention, and successful linked-action creation after supplying them. All test records were explicitly marked QA/fictional in the isolated cloud browser, not seeded into source.

The visual review found two readability improvements and they are included in release .5: Priority review now leads the score heading whenever the serious-harm override applies, rather than displaying a lower-priority heading above a warning. The optional matrix retains a 520px minimum table width and scrolls within its own wrapper on phones, keeping labels legible rather than compressing six columns into 290px. A regression assertion covers the rare/fatal result heading. Final local suite: 301/301 passed. Initial document/dialog width checks: 390/390 and 349/349 at phone width; 768/768 and 663/663 at tablet width. Final .5 deployment, narrow-table scrolling and desktop checks follow the correction publication. Physical Safari and first-time-user acceptance remain unverified.
