# Maintenance planner — guided equipment classification and assessment

Date: 2 November 2026. Release: `2026.11.02.2`. Production source base: main `e00b7167a768469d21b99946f3d4cb60cd252411`. Development review base: `dc0e637`.

## Scope and resulting behaviour

The owner requested a tool to classify equipment or assess individual inventory items. The planner now has an **Assess** queue, an Assess action on each inventory tile and a guided item form. A separate result is produced for product category and operational use class. Missing answers never become assumed classifications.

- Product calculations implement the nine ordinary AFS 2023:5 Annex 2 diagrams with exact decimal product comparisons, upper-boundary treatment, accessory V/DN precedence and relevant special conditions. Safety accessories require a protected-equipment scope confirmation. Pressure-cooker design-procedure minimum is preserved separately from its actual category.
- Operational calculations implement AFS 2023:11 9 kap. 23–35 §§ for ordinary vessels, piping, boilers, water heaters, qualifying heated vessels, cisterns and vacuum vessels. Operational limit source and fluid/phase evidence must be recorded independently from manufacturer PS/TS and PED groups.
- Validated exceptions include unstable gas, high-temperature group-2 piping, air/nitrogen and refrigeration table-B vessel exceptions, water-pumping air pressure, boiler coil limits and low-temperature group-2a liquids. Multi-fluid, multi-compartment, inherited branch-pipe, ambiguous accessory, historical and other complex cases require a documented specialist assessment.
- Each result shows its data, arithmetic, source paragraph/table/diagram and missing information. The tool supports an explicit draft or a named, dated, confirmed reviewed decision. Applying a reviewed result increases the pressure-profile revision and retains the input/result snapshot.
- The document checklist requires identity, issuer, scope, language and validity checks plus a controlled reference before recording a document as reviewed. Missing or expired evidence remains an open finding. The tool neither authenticates documents nor issues declarations or inspection certificates.
- The inventory queue reports reviewed/draft/stale assessments and remaining document reviews. Direct item links, dossier/work-pack links, export, print, backup validation and demonstration cleanup include the assessment extension.
- Historical assessment snapshots remain importable as stale when the rule version changes. Current-version forged calculation results are rejected. An affected current dossier is flagged for reassessment. **Bump ASSESSMENT_VERSION whenever rules/source constants change.**

## Previously authorised dossier work retained

The prior turn's unpublished dossier work was unavailable in the transient checkout when this turn resumed. Its core, operational records, UI and tests were reconstructed from session history before the classifier was added. No claim is made that the old local commits `5e4bb67` / `cc943ef` or old patch are present in this checkout. The combined source here is the current review package and was freshly tested.

The combined planner retains separate pressure scope, economic role, technical limits, legacy/§7/§40 routes, procedure checks, named evidence reviews, statutory controls and permitted calendar windows, supervision, annual routine review, remaining-life journal, change/repair review and explicit holds. Generic servicing cannot clear a stop or statutory control. Defect completion no longer advances the maintenance due point. The original `johansson-maintenance-public-demo-v1` key and existing inventory are retained.

## Authoritative sources and independent verification

- [Classification source and rule matrix](docs/CLASSIFICATION-SOURCES.md): primary URLs, printed pages, required input evidence, exclusions and all supported operational boundaries.
- [Independent classifier review](docs/CLASSIFIER-REVIEW.md): diagrams and merged table cells inspected in the actual rendered official PDFs, rather than inferred from flattened web text.

Important verified operational boundaries: group-1a liquid vessels with p>10/V>1 enter A above pV=2000; group-1a gas piping uses pDN=1000; group-2a gas piping uses pDN=3500 and then5000 at the applicable DN ranges; group-2a cisterns above65°C and50000L are B only. These values are guarded by source-coordinate regression tests.

This is a deterministic calculation and records workflow. CLP hazard grouping, phase assessment, scope selection, equipment definition and the source data remain declared by the reviewer. The software does not perform design approval, physical inspection, document authentication or legal certification. No blanket “100% compliant” status is produced.

## Verification actually run

`node --test maintenance-demo/tests/*.test.mjs`: **289/289 pass**. This includes 180 independent source acceptance cases, product and operational boundary suites, dossier/lifecycle tests, assessment/document/backup tests and five actual inline-app integration checks. All application modules pass `node --check`.

Actual Chrome interaction verified:

1. Missing data produces unresolved results and disables applying a classification; a named draft saves without modifying the dossier classification.
2. A fictional, explicitly scoped 10 bar/270L group-2 gas test case produces product category III and use class A independently. This is a QA fixture, not a decision about the sample compressor's actual real-world product legislation.
3. A document can be recorded as reviewed only with its reference and all five checks. Applying the reviewed test assessment records both classes and the signer, while eleven other document reviews remain visible. The pressure dossier remains **Review required**, with4/20 evidence topics recorded.
4. Input/result layouts have no document overflow at390px,768px and1280px CSS viewports (375/375,753/753,1265/1265 document/scroll widths after scrollbars). Screens visually inspected. These are Chromium layout checks, not physical Safari tests.

The browser's fictional QA data is local to the isolated preview and is not seeded into source or the published planner. The path-limited workflow `.github/workflows/maintenance-pressure.yml` runs the same tests on relevant pushes and PRs.

## Publication and next action

Production publication remains unauthorised: the preceding turn's attempt to push main was rejected by automatic approval review because the exact default-branch publication needed explicit owner approval. This turn does not retry or bypass that main publication.

The complete bounded change is prepared on the existing **development** branch for review, preserving that branch's other work. Publication to main must transfer only this maintenance commit; **do not merge the entire development branch**, which also contains World prototypes. After explicit main publication approval, re-read remote main, apply only the bounded maintenance change, run its tests, publish and verify Pages plus served module versions.

The final review commit and remote write status are recorded in the follow-up entry below. Existing production remains unchanged until main publication is approved.

## Remaining limits

Physical iPad/iPhone Safari and actual industrial equipment records are unverified. All records remain browser-local and user-editable, with user-entered reviewer names and references to externally retained documents. This is not an authenticated signature or independent archival service. Advanced multi-room/fluid/assembly and inherited-pipe classifications remain specialist branches. The tool does not choose fluid groups from friendly substance names or invent an inspection interval from a product category.

## Native browser translation

English source language and explicit translate=yes enable native browser language recognition. Visible UI text remains translatable; narrow translate=no spans protect AFS identifiers, PS/TS/DN notation, numerical engineering units, asset tags, input contents and recorded technical values. Rendered routes/dialogs are marked synchronously, without observing or overwriting the browser's translated DOM. Select option labels remain translatable while their explicit values and stored JSON remain unchanged. Safari controls availability and language/region support; no JavaScript API can force its built-in Translate menu. Actual Safari translation has not been tested. In Safari on iPad, open Page Menu then Translate when offered.

## Confirmed development review publication

Review implementation `a71b7cc0a32f1fdb8bf792b2fa0fb912562b61f6` was saved to the existing development branch through the connected GitHub tools after the terminal push lacked authentication. This is a review-branch update; main was not changed. The final combined suite including native-translation guards passes 292/292 tests. English/translate=yes and protected technical spans were observed in Chrome; Safari native translation itself remains untested. Transfer only the bounded maintenance change after explicit main-publication approval; do not merge the full development branch.

## Main publication authorised

The owner explicitly authorised publication on 2 November 2026: “Push to main”. The bounded maintenance directory and its dedicated acceptance workflow are being transferred from development `ec675a411ea416812e4935e558a0bbbe7da97631` onto main `e00b7167a768469d21b99946f3d4cb60cd252411`. Other development changes are excluded. The unchanged runtime was retested: 292/292 pass. Production deployment and public-byte verification are checked after the publication commit; actual Safari translation and real equipment verification remain outstanding.
