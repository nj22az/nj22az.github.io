# Independent classifier review

Reviewed: 2 November 2026. Scope: product calculations in `classifier-core.mjs`, use calculations in `operational-classifier.mjs`, and their principal compatibility with the pressure-evidence engine. This review does not certify an installation, document or organisation.

## Method and primary sources

Downloaded the official PDFs independently, rendered the original pages with Poppler, and inspected the actual chart boundaries and merged table cells. Expected acceptance coordinates were transcribed from those sources, rather than generated from the implementation's conditions.

| Source | Pages inspected | Download SHA-256 |
| --- | --- | --- |
| [AFS 2023:5, official product PDF](https://www.av.se/globalassets/filer/publikationer/foreskrifter/produkter-tryckbarande-anordningar-afs2023-5.pdf) | Printed 52–60: all nine Annex 2 diagrams; relevant §§1–2, 6–10 and notes | `42abe3422b3ad64d76d8db5ff8a7b5f6c983acc4dfd63f31b1ba03d33ffa1148` |
| [AFS 2023:11, official consolidated PDF through AFS 2024:4](https://www.av.se/globalassets/filer/publikationer/foreskrifter/konsoliderade-foreskrifter/arbetsutrustning-och-personlig-skyddsutrustning-saker-anvandning-afs2023-11-konsoliderad.pdf) | Printed 85–94: fluid/phase definitions, §28 limit hierarchy, §§29–35 and tables 2–6 | `08839babb31b702d2ffcb2aef68412243fb62872f947cc53667476608d26a798` |

The product fluid groups 1/2 and use fluid groups 1a/2a remain independent, documented reviewer inputs. The tool does not interpret a safety data sheet or determine its CLP categories automatically. In particular, the operational list is broader than the product list; an H314 code alone does not establish the required Skin Corr. 1A subcategory.

## Material findings and resolution

- Confirmed the original merged cells: liquid vessels group 1a, V >1 L and p >10 bar use B for 200 < pV ≤2000 and A above 2000. At p ≤10 bar, pV >200 remains B without an A upper band.
- Confirmed gas-pipe thresholds: group 1a with 25 < DN ≤100 changes from B to A above pDN 1000; group 2a with 100 < DN ≤250 enters B only above pDN 3500. A group 2a pipe in this diameter range does not become A from pressure alone; the >350°C exception is separate.
- Confirmed cistern group 2a: B requires temperature >65°C and volume >50000 L; this branch never gives A. Vacuum-vessel limits are different.
- Reported malformed numeric dimension coercion that could produce a false SEP result; the product author replaced permissive conversion with bounded decimal validation and exact boundary comparison.
- Reported the missing affirmative protected-equipment condition for safety accessories; the product author added the guard.
- Reported multiple-case and portable-container gaps; the product author added explicit review guards rather than silently assigning a low scalar category outside the supported branch.
- Reported null/non-object operational inputs; the operational author added a safe review outcome.
- Added compatibility checks for pressure-cooker design-procedure minimum III without falsely raising the actual product category. A lower product category can no longer pass module A when the documented special minimum is III.
- Preserved sourced negative PS below the product threshold, without replacing it with zero or treating it as a positive-pressure product. Separate operational scope still requires assessment.

## Executed acceptance checks

`node --test maintenance-demo/tests/classifier-source-acceptance.test.mjs`

**180/180 passed:** fixed examples spanning all nine product diagrams, all operational table branches, boiler/water-heater/cistern/vacuum limits, equality and just-above cases, and selected statutory exceptions and unresolved system cases.

`node --test maintenance-demo/tests/pressure-core.test.mjs`

**38/38 passed**, including the new procedure-minimum and negative-PS compatibility checks. Both files were also rerun together successfully after the final core changes.

## Remaining limits and handover

- The accepted results cover declared supported scalar cases. Eligibility, correct equipment definition, legal exclusions, phase/group assessment, original data, multiple fluids/chambers and document authenticity require responsible review. Assemblies and unresolved special cases remain review items.
- Cistern and vacuum classification tables do not use pressure in their volume rules. Their classifier accepts a declared type with its documented limit basis when p is omitted; supplied p is checked against the legal equipment definition. The guided interface should request the relevant pressure where the type cannot otherwise be established.
- These checks test pure calculations and evidence logic. They do not establish that the browser workflow, live publication, physical-device layout or real plant records have passed acceptance.
- Preserve historical assessment snapshots when rule versions change. A future validator should treat older snapshots as stale and require renewed review, rather than reject an entire otherwise valid workspace backup. Current-version altered calculation results must remain rejected. This integration now preserves older snapshots as stale, flags the affected dossier, and rejects tampered calculations under the current version. Bump ASSESSMENT_VERSION whenever classification rules change.
