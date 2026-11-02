# Classification sources and executable-rule specification

Reviewed 2 November 2026. This document describes the source basis and boundaries for the maintenance planner's classification assistant. A calculated result is a proposal from recorded facts. It does not certify a product, establish safe operation, authenticate a document or replace the employer's and control body's decisions.

## Official sources and versions

| Source | Version and relevant printed pages |
| --- | --- |
| [AFS 2023:11, consolidated PDF](https://www.av.se/globalassets/filer/publikationer/foreskrifter/konsoliderade-foreskrifter/arbetsutrustning-och-personlig-skyddsutrustning-saker-anvandning-afs2023-11-konsoliderad.pdf) | Through AFS 2024:4. Chapter 9: scope pp. 71–73; definitions pp. 73–77; classification principles pp. 85–88; boiler p. 88–89; water heater/heated vessel p. 89; gas-vessel table p. 90; liquid-vessel table p. 91; piping tables pp. 92–93; cistern/vacuum pp. 93–94. Printed page numbers equal PDF page indexes plus one in this consolidated file. |
| [AFS 2023:11, official HTML](https://www.av.se/arbetsmiljoarbete-och-inspektioner/publikationer/foreskrifter/afs-202311/) | Chapter 9 §§1–4, 23–35 are the principal operational-classification sources. |
| [AFS 2023:11, version history](https://www.av.se/arbetsmiljoarbete-och-inspektioner/publikationer/foreskrifter/afs-202311/forfattningshistorik-afs-202311/) | Latest listed amendment is AFS 2024:4. |
| [AFS 2024:4 amendment PDF](https://www.av.se/globalassets/filer/publikationer/foreskrifter/andringsforeskrift/arbetsutrustning-och-personlig-skyddsutrustning-saker-anvandning-andring-i-afs2023-11-afs2024-4.pdf) | Independently confirms the amended liquid-vessel table and water-heater wording. |
| [AFS 2023:5, official PDF](https://www.av.se/globalassets/filer/publikationer/foreskrifter/produkter-tryckbarande-anordningar-afs2023-5.pdf) | Product scope §§1–3, technical thresholds §§6–8, fluid/category rules §9, modules §§10–11, Annex 2 diagrams pp. 51–60. |
| [AFS 2023:5, official HTML](https://www.av.se/arbetsmiljoarbete-och-inspektioner/publikationer/foreskrifter/afs-20235/) | Product category I–IV and §8 good engineering practice are separate from operational A/B classification. |
| [AFS 2023:5, version history](https://www.av.se/arbetsmiljoarbete-och-inspektioner/publikationer/foreskrifter/afs-20235/forfattningshistorik-afs-20235/) | Only the original regulation was listed at review; effective 1 January 2025. |
| [Arbetsmiljöverket control guidance](https://www.av.se/produktion-industri-och-logistik/anvandning-av-trycksatta-anordningar/kontroll-av-trycksatta-anordningar/) | Explains why type, table footnotes and boundary equality matter. Guidance supplements the regulation. |

The authority states that the printed version prevails if a digital version differs. Merged table cells must be checked in the PDF; flattened HTML alone is insufficient. Tables 4 and 5 have been verified against the actual consolidated PDF layout, including merged cells. In particular, liquid group 1a at p > 10 bar becomes A above 2,000 barlitres; gas-pipe group 1a with DN ≤100 becomes A above p×DN = 1,000, while group 2a piping first reaches B above 3,500.

## Scope decisions come before calculations

AFS 2023:5 is product legislation. Its general entry condition is PS > 0.5 bar and no applicable §2 exclusion. Simple pressure vessels under 2014/29/EU, and ships/equipment specially intended aboard or for propulsion, have separate product-law routes. An exclusion from AFS 2023:5 is not an exemption from all operating rules. Do not copy a product exclusion into the operational assessment.

AFS 2023:11 chapter 9 §1 has its own exclusions, including specified nuclear equipment, rockets/aircraft/mobile offshore equipment, military equipment, flexible casings, listed metallurgical equipment, heating-system radiators/piping, ventilation/flue ducts, specified water systems, qualifying beverage containers, pressure-insignificant machine casings, specified vehicle equipment **other than simple pressure vessels**, and electrical generation/distribution equipment. The scope choice needs an exact paragraph, supporting facts and a named reviewer. A generic “air compressor” or “shipboard” name is insufficient to decide the relevant law.

Chapter 9 §3 treats dangerous-goods transport, transport equipment, refillable cylinders, portable extinguishers and breathing-apparatus cylinders separately. These should use a specialist/manual branch rather than ordinary A/B vessel tables. §4 contains limited exceptions from the repair/change provisions; it does not remove the whole chapter. Chapter 10 also has its own control exceptions. Classification and inspection applicability must remain separate decisions.

An operational “outside A/B” result means neither class A nor class B under the stated table. It does not mean “unregulated” or “safe to operate”; risk assessment and ongoing supervision can still apply.

## Input evidence and definitions

Every calculation should retain its input snapshot, source version, rule/table reference, intermediate p×V or p×DN, exceptions applied and reviewer confirmation. Unknown values must produce “more information required” rather than defaulting to group 2a or outside A/B. Display units explicitly and do not round before boundary comparisons.

| Input | Required meaning and evidence |
| --- | --- |
| Operational type | Vessel, piping, boiler, water heater, heated non-boiler vessel, cistern or vacuum vessel, using chapter 9 §2 definitions. A commercial equipment name is not the type decision. |
| p | Pressure relative to atmospheric pressure, in bar gauge. Positive is overpressure and negative is vacuum; §2. It is not automatically the manufacturer's PS or normal running pressure. |
| t | Classification temperature, °C, from the same §28 decision hierarchy as p. |
| Limit source | §28 priority: limits assessed by a control body under chapter 10 §7; otherwise the pressure/temperature at which safety equipment activates; if no safety equipment, manufacturer marking/manual limits. Retain the certificate, setting document or manual reference. |
| V | Volume in litres, with the relevant chamber/volume basis identified. |
| DN | Nominal pipe size in mm. §33 uses the largest diameter for varying sizes; if DN is unavailable, internal diameter or the diameter of a same-area circle for a non-circular section. Smaller branches inherit their main's class through the first isolation valve, inclusive. |
| Rated power | kW for boilers. Use control-body marking if applicable; otherwise manufacturer marking, §29. |
| Coil volume | Litres, only for a documented flow-through boiler. |
| Fluid group | Operational 1a/2a under §25, supported by the current SDS/CLP classification and process temperature; not simply the PED 1/2 field. |
| Phase | Table phase under §24, supported by the fluid's CLP physical state, atmospheric boiling point and, if relevant, vapour-pressure data at maximum classification temperature. |
| Exceptions | Explicit facts for air/N₂, refrigeration/heat-pump service, unstable gas, water-pressurised air, flow-through coil and relevant scope exceptions. Blank is not “no”. |

Type precision: a water heater is an **electric tap-water heater**, >65°C and ≤110°C. A boiler is another vessel in which energy from fuel, electricity or another source is transferred to fluid for use outside the vessel. The heated non-boiler branch is for the distinct §31 conditions. Cisterns have headspace gas pressure from −0.0065 to +0.5 bar relative to atmosphere; vacuum vessels are designed for pressure more than 0.0065 bar below atmosphere. Therefore a universal operational p >0.5 gate would incorrectly discard cistern/vacuum classifications.

## Phase helper: chapter 9 §24

1. Is the fluid a liquid under the CLP definition? If not, use the gas tables; condensed gas, dissolved gas and vapour also count as gas.
2. For a CLP liquid, is maximum classification t more than 10°C above its boiling point at 1.013 bar atmospheric pressure? If not, use liquid tables.
3. If yes, use gas tables unless evidence shows vapour pressure at maximum classification t is no more than 0.5 bar **above atmospheric pressure**. Where that exception is evidenced, use liquid tables.

These questions use operational t under §28. The PED phase criterion is separate: AFS 2023:5 §6 treats liquids with vapour pressure more than 0.5 bar above normal atmospheric pressure at maximum allowable temperature in its gas/vapour branches. Do not silently reuse the same phase decision for both laws.

## Fluid-group helper: chapter 9 §25

An SDS hazard code can support a group decision but must retain the hazard class/category. For example H314 also occurs with skin-corrosion categories other than 1A; H314 alone must not automatically trigger the §25 skin-corrosion criterion.

Operational group 1a includes the following CLP classes/categories:

| CLP class/category | Hazard statements in §25 |
| --- | --- |
| Unstable explosives or explosive divisions 1.1–1.5 | H200–H205 |
| Flammable gases, categories 1–2 | H220, H221 |
| Oxidising gases, category 1 | H270 |
| Flammable liquids, categories 1–2 | H224, H225 |
| Flammable solids, categories 1–2 | H228 |
| Self-reactive substances/mixtures, types A–F; organic peroxides, types A–F | H240, H241, H242 |
| Pyrophoric liquids/solids, category 1 | H250 |
| Substances/mixtures emitting flammable gas on contact with water, categories 1–3 | H260, H261 |
| Oxidising liquids/solids, categories 1–3 | H271, H272 |
| Acute oral toxicity, categories 1–2 | H300 |
| Acute dermal toxicity, categories 1–2 | H310 |
| Acute inhalation toxicity, categories 1–3 | H330, H331 |
| Specific target-organ toxicity, single exposure, category 1 | H370 |
| Specific target-organ toxicity, repeated exposure, category 1 | H372 |
| Skin corrosion/irritation, category **1A** | H314, with category evidence |
| Germ-cell mutagenicity, categories 1A–1B | H340 |
| Carcinogenicity, categories 1A–1B | H350 |
| Reproductive toxicity, categories 1A–1B | H360 |

Also group 1a: oil used above 110°C; any substance/mixture whose flash point is below classification t; and the supplementary statements EUH001, EUH018, EUH019 or EUH044. EUH014 is not the listed statement here. Group 2a comprises the remaining fluids only after these conditions have been assessed. Empty SDS input cannot demonstrate group 2a.

The PED group 1 list in AFS 2023:5 §9 is different. Operational additions such as H372, skin-corrosion 1A, H340/H350/H360, hot oil and the listed EUH statements must not automatically be presented as PED group 1 triggers.

## Exact operational rules

All threshold comparisons below are strict at their lower bound. Equality belongs to the lower class or outside A/B: §23. “Outside” means outside A/B under this branch, with the scope and general obligations still assessed separately.

### Boiler and heated equipment: §§29–31

| Branch | A | B | Other boundary/condition |
| --- | --- | --- | --- |
| Boiler, §29 | t >110°C and rated power >5 kW | 65°C <t ≤110°C and rated power >100 kW | Documented flow-through boiler with coil V ≤25 L is outside A/B. |
| Electric tap-water heater, §30 | V >2,000 L | 500 L <V ≤2,000 L | Requires 65°C <t ≤110°C. |
| Heated non-boiler, §31/table 2, p ≤32 bar | p×V >200 barL | 50 <p×V ≤200 barL | Must have V >2 L, p >0.5 bar, overheat-risk heating and production of steam/water above 110°C. |
| Same heated branch, p >32 bar | p×V >64 barL | None in this row | p×V ≤64 remains outside A/B in this branch. |

If a selected type contradicts its definition, return a type-review requirement instead of quietly routing it to an unrelated vessel table. A low-power boiler is not automatically an ordinary §32 vessel merely because it misses §29 thresholds.

### Other gas vessels: §32/table 3, p >0.5 bar

| Group and volume | Pressure condition | A | B |
| --- | --- | --- | --- |
| 1a, V >1 L | p >0.5 | p×V >200 | 50 <p×V ≤200 |
| 1a, 0.1 L <V ≤1 L | p >200 | A, regardless of p×V cell | None |
| 2a, V >1 L | p >0.5 | p×V >1,000 | 200 <p×V ≤1,000 |
| 2a, 0.1 L <V ≤1 L | p >1,000 | A, regardless of p×V cell | None |

Table-specific rules, applied to the result:

- An unstable group 1a gas promotes a table-B vessel to A.
- A table-B vessel is outside A/B if intended for air/N₂, or if it contains group 2a gas in a refrigeration/heat-pump installation. A table-A vessel remains A.
- If air is pressurised by pumping water into an initially unpressurised vessel, set classification p =1 bar before applying the table. This is not permission to substitute p =1 for a bladder accumulator or precharged vessel without those facts.
- Conditions not met, including V ≤0.1 L, do not produce A/B through this table alone.

### Other liquid vessels: §32/table 4, p >0.5 bar

| Group and volume | Pressure condition | A | B |
| --- | --- | --- | --- |
| 1a, V >1 L | p >10 | p×V >2,000 | 200 <p×V ≤2,000 |
| 1a, V >1 L | 0.5 <p ≤10 | None | p×V >200 |
| 1a, 0.1 L <V ≤1 L | p >500 | None | B, regardless of p×V cell |
| 2a, V >10 L | p >500 | None | p×V >10,000 |

Group 2a liquid at t ≤65°C is outside A/B under this table even if its other numerical conditions are met. The liquid group-1a A threshold above is **2,000**, not 10,000: the A cell spans both last columns in the printed table.

### Gas piping: §33/table 5, p >0.5 bar

| Group and DN | A | B |
| --- | --- | --- |
| 1a, 25 <DN ≤100 | p×DN >1,000 | p×DN ≤1,000; the branch already guarantees p×DN >12.5 |
| 1a, DN >100 | A | None |
| 2a, 100 <DN ≤250 | None | p×DN >3,500 |
| 2a, DN >250 | p×DN >5,000 | 3,500 <p×DN ≤5,000 |

Promote a table-B pipe to A for unstable group 1a gas or group 2a gas at t >350°C. At 350°C exactly, the latter promotion does not apply. Air/N₂ vessel demotion is not a piping exemption. Apply the §33 diameter and branch inheritance rules before issuing a final calculated class.

### Liquid piping: §33/table 6, p >0.5 bar

| Group and DN | Pressure condition | Result |
| --- | --- | --- |
| 1a, DN >25 | p ≤10 and p×DN >2,000 | B |
| 1a, DN >25 | p >10 and p×DN >2,000 | A |
| 2a, DN >200 | p >10 and p×DN >5,000 | B |

Group 2a liquid at t ≤65°C is outside A/B under this table. p×DN =2,000 or 5,000 does not cross the corresponding lower bound.

### Cisterns and vacuum vessels: §§34–35

| Type and group | A | B | Temperature condition |
| --- | --- | --- | --- |
| Cistern, 1a | V >10,000 L | 5,000 <V ≤10,000 L | No extra temperature threshold in §34. |
| Cistern, 2a | **No A threshold** | V >50,000 L | t >65°C. |
| Vacuum vessel, 1a | V >5,000 L | 1,000 <V ≤5,000 L | No extra temperature threshold in §35. |
| Vacuum vessel, 2a | V >500,000 L | 50,000 <V ≤500,000 L | t >65°C. |

Do not apply a universal p >0.5 condition to these two types. Their definitions, operating envelope and evidence still require review.

## Complex cases and manual branches

§26 treats a multiple-fluid device as completely filled with the fluid imposing the most extensive requirements. §27 uses the most demanding chamber for a device with multiple spaces. A heated pressurised jacket around a charge space uses the combined jacket and charge-space volume for §§31–32. A first release should request a specialist decision for multiple fluids, multiple spaces and jackets unless it explicitly implements and records all constituent assessments.

Smaller branch piping through the first isolation valve requires its main-pipe class. Unknown geometry, inconsistent type, transport service, unresolved scope and incomplete fluid evidence must produce a review result rather than a guessed numeric class.

## Boundary examples for regression tests

| Facts, assuming reviewed scope/type/group/phase | Expected operational proposal |
| --- | --- |
| Gas vessel, group 2a, V=100 L, p=8 bar, ordinary gas | B, pV=800. |
| Same vessel intended for air or N₂ | Outside A/B by the table-B exception. |
| Air vessel, V=200 L, p=8 bar | A, pV=1,600; the B exception does not erase A. |
| Gas vessel, group 1a, V=10 L, p=20 bar | B at pV=200; p=20.001 gives A. |
| Liquid vessel, group 1a, V=100 L, p=20 bar | B at pV=2,000; p=20.001 gives A. |
| Liquid vessel, group 2a, V=20 L, p=600 bar, t=70°C | B at pV=12,000; at t=65°C outside A/B. |
| Gas pipe, group 1a, DN=100, p=10 bar | B at pDN=1,000; p=10.001 gives A. |
| Gas pipe, group 2a, DN=200, p=17.5 bar | Outside A/B at pDN=3,500; p=17.501 gives B. |
| Gas pipe, group 2a, DN=300, p=16.666666666666668 bar | Numerical precision needs explicit handling around pDN=5,000; test exact rational boundaries without arbitrary rounding. |
| Gas pipe, group 2a, DN=500, p=10 bar | B at pDN=5,000; p=10.001 gives A. |
| Electric tap-water heater, V=2,000 L, t=90°C | B; V=2,000.001 gives A. |
| Cistern, group 2a, V=200,000 L, t=70°C | B, not A. |
| Vacuum vessel, group 2a, V=500,000 L, t=70°C | B; V=500,000.001 gives A. |
| Boiler, t=120°C, power=6 kW, documented flow-through coil=25 L | Outside A/B by the coil exception; unknown coil information must remain unknown. |

Decimal calculations should preserve entered decimal intent at boundaries; either compare scaled integer decimals/rationals or apply an explicit, documented numeric policy. A display-rounded value must never determine a different classification.

## Product-law catalogue retained separately

The pre-existing evidence workflow uses a grouped catalogue of all AFS 2023:5 §§1–40 and Annexes 1–4. Its essential groupings are scope/definitions §§1–4; market/technical branches §§5–8; fluid/category/module/declaration/standards §§9–13; manufacturer §§14–20; representative §21; importer §§22–27; distributor §§28–33; role reassessment §34; tracing §35; CE §§36–37; material approvals §§38–39; user-inspection-body route §40; transitional provisions; technical requirements Annex 1; category diagrams Annex 2; module procedures Annex 3; declaration Annex 4. This operational calculator does not replace that catalogue or prove technical conformity.

PED diagrams require their own exact category boundaries and special cases. Product accessories, safety accessories, assemblies, multi-chamber products, legacy documents, the §7 second-paragraph hot-water assembly and §40 user-body route must not be forced through an ordinary single-vessel formula. A proposed product classification should be retained alongside, rather than substituted for, manufacturer documentation and separate operational p/t decisions.
