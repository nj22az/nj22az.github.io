# MS-CE-001 — Method Statement & Installation Documents
## Chief Engineer's Suite: Outfitting, Electrical and Plumbing Installation

| Item | Value |
|---|---|
| Document No. | MS-CE-001 Rev A (Issued for review) |
| Related drawing | CE-SUITE-GA-001 Rev A (GA, electrical, plumbing/HVAC, section A-A) |
| 3D model | CE_Suite.blend / .glb / .fbx |
| Vessel (assumed) | Generic 190 m cargo vessel (bulk carrier/tanker type), accommodation deck "C", STBD, Fr120–Fr131 |
| Status | **Preliminary. Not for construction until the yard design office, the Owner and the Classification Society have approved it.** |

> ⚠ **SAFETY-CRITICAL ITEMS** are marked **[SC]**. A competent marine electrical or piping engineer must verify them against the applicable class rules and the approved ship drawings before work starts.

---

## 1. Assumptions (please confirm or correct)

| # | Assumption |
|---|---|
| A1 | New-build or major refit in a steel accommodation block. Deck height 2 850 mm; clear ceiling height 2 300 mm. |
| A2 | Suite clear size 7 200 × 5 000 mm (≈ 36 m² gross, 32.4 m² net). Layout: day room/office, bedroom, en-suite wet unit and store. |
| A3 | Ship's mains 440 V 3~ 60 Hz. Accommodation lighting/power 230 V 1~ 60 Hz, insulated (IT) system with insulation monitoring at the main switchboard. Emergency lighting 24 V DC. |
| A4 | Fresh water: hydrophore system 3–5 bar. Calorifier HW at 60 °C with a circulation loop (≥ 50 °C return). |
| A5 | Grey water drains by gravity to the grey water tank. Black water drains by gravity to the sewage treatment plant (STP). If the ship uses a vacuum toilet system, replace the WC and the DN100 soil line with the vendor's vacuum set (DN50). |
| A6 | Fire class: accommodation bulkheads B-15. Corridor bulkhead B-15 (method IC, SOLAS II-2/9). Decks A-60 where they are boundaries to service spaces. |
| A7 | Classification: DNV. Flag: SOLAS/MLC signatory. |

## 2. Applicable Standards & Rules
- **SOLAS** Ch. II-1 (electrical) and Ch. II-2 (fire protection, Reg. 5, 9 and 13). **FTP Code** 2010, Parts 3, 5 and 7.
- **MLC 2006**, Regulation 3.1 and Standard A3.1 (accommodation: size, lighting, sanitary, ventilation, noise).
- **IMO MSC.337(91)**: Code on Noise Levels on Board Ships. Cabins ≤ 55 dB(A); for ships ≥ 10 000 GT the hospital/cabin limits apply.
- **DNV-RU-SHIP** Pt.4 Ch.8 (electrical installations), Pt.4 Ch.6 (piping systems) and Pt.3 Ch.12 (openings and closing appliances/windows).
- **IEC 60092** series: -101, -201 (system design), -352 (choice of cables), -350/-353 (power cables), -401 (installation and test), -507 (small vessels / accommodation guidance).
- **IEC 60332-3-22** (flame spread, bunched cables), **IEC 60754 / 61034** (halogen-free, low smoke).
- **IEC 61558-2-5** (shaver supply units) and **IEC 60529** (IP ratings).
- **ISO 15748-1/-2** (potable water supply on ships), **ISO 15749-1…-5** (drainage systems), **ISO 3903** (ship windows).
- **WHO** Guide to Ship Sanitation (3rd ed.), and **MARPOL** Annex IV (sewage).

## 3. Scope of Work
1. Install the joiner bulkheads, ceilings and floating floor, including wet unit preparation.
2. Fit the doors, windows/lining, furniture and sanitary fixtures.
3. Install the electrical system: local distribution board DB-CE, lighting, sockets, shaver unit, safety systems (fire detection, general alarm, PA), telephone and the Engineer Alarm Panel (EAP, UMS extension).
4. Install the plumbing: CW/HW supply and HW return, grey and black water drains, and deck penetrations.
5. Install the HVAC fan coil unit, supply air diffusers and bathroom exhaust.
6. Inspect, test and commission (see ITP, section 10).

## 4. Equipment, Materials & Tools

### 4.1 Main materials
| Item | Specification |
|---|---|
| Joiner panels | 50 mm B-15 mineral-wool sandwich panels, type-approved (FTP Code Part 3). |
| Fire door D1 | B-15, 800 × 2 000 mm, self-closing, no hold-back hook, type-approved. |
| Floating floor | 60 mm, vibration-isolated, with vinyl finish. Wet area finished as a sloped tile/epoxy tray. |
| Windows | 3 No. 1 200 × 900 mm rectangular windows to ISO 3903, toughened glass. |
| Cables | LSZH, flame retardant (IEC 60092-353/-350), e.g. 0.6/1 kV RFOU. Lighting circuits 3×1.5 mm², socket circuits 3×2.5 mm². |
| DB-CE | 6-way IP20 panel. MCBs and RCBOs (30 mA on socket and bathroom circuits). |
| Bathroom fittings | IP44 or better in zones 1–2. No socket in zones 0–2 except an IEC 61558-2-5 shaver unit. |
| CW/HW pipe | Cu-DHP DN15 (15×1.0) with compression or press fittings, or class-approved PP-R/PEX. HW insulated with 25 mm closed-cell insulation. |
| Drains | Grey water DN40/DN50, black water DN100. Galvanised steel, or class-approved HDPE/PP with fire-rated collars. |
| Penetrations | Type-approved A-60/B-15 cable transits and pipe sleeves (e.g. Roxtec/MCT). |

### 4.2 Tools & equipment
- Insulation tester (500 V DC), multifunction tester (loop/RCD), earth-continuity meter.
- Hydrostatic test pump with a calibrated gauge.
- Pipe press/bending tools, laser level and torque wrench.
- Portable LEV/extraction for hot work, fire extinguishers, and 110 V or battery tools.

## 5. Cable Schedule
| Circuit | From | To | Cable | Protection | Notes |
|---|---|---|---|---|---|
| F-CE | ACC-DB-03 | DB-CE | 3×2.5 mm² LSZH | 20 A MCB 2-pole | Feeder. Volt drop ≤ 6 % total (IEC 60092-201). |
| L1 | DB-CE | Day-room LEDs (3) and switch | 3×1.5 | 10 A MCB | Ceiling void, on the tray. |
| L2 | DB-CE | Bedroom, bath and store LEDs (4) and switches | 3×1.5 | 10 A RCBO 30 mA | Bath fittings IP44/IP65 above the shower. |
| S1 | DB-CE | Day-room sockets (4), fridge | 3×2.5 | 16 A RCBO 30 mA | Skirting trunking. |
| S2 | DB-CE | Bedroom sockets (3) | 3×2.5 | 16 A RCBO 30 mA | |
| SH | L2 junction | Shaver unit | 3×1.5 | Via L2 RCBO | IEC 61558-2-5 isolating transformer. |
| FCU | DB-CE | Fan coil unit | 3×1.5 | 6 A MCB | Or supplied from the HVAC panel (confirm). |
| EM | EM-DB (24 V DC) | EM light ×2 | 2×1.5 | 6 A fuse | **[SC]** SOLAS II-1/42-43 emergency lighting. |
| FD | FDS loop | Smoke detectors ×2 | 2×1.5 screened FR | Loop | **[SC]** Fire-resistant cable (IEC 60331) where required. |
| GA/PA | GA/PA amplifier | Bell, speakers ×2 | 2×1.5 FR | n/a | **[SC]** Audible ≥ 75 dB(A) / 10 dB above ambient, LSA Code 7.2. |
| EAP | ECR alarm system | Engineer Alarm Panel | Per vendor (bus) | n/a | **[SC]** UMS engineer call: DNV Pt.6 Ch.3 (E0). |
| TEL | Auto-tel exchange | Phone | 2×2×0.75 screened | n/a | Segregate from power cables (≥ 100 mm). |

## 6. Pipe Schedule
| Line | Size / material | Design P | Test | Slope / notes |
|---|---|---|---|---|
| CW riser and branches | DN15 Cu | 10 bar | 1.5 × DP = 15 bar for 30 min (or class requirement) | Isolation ball valve in the pipe duct. |
| HW supply | DN15 Cu, 25 mm insulation | 10 bar, 70 °C | 15 bar | Isolation valve. **[SC]** Legionella control: ≥ 60 °C at the calorifier, ≥ 50 °C return. |
| HW return | DN15 Cu | 10 bar | 15 bar | Balancing valve. |
| GW shower / basin / gully | DN50 / DN40 / DN50 | Gravity | Water-fill test (to the overflow level), 15 min, no leaks | ≥ 1:50 fall. Water-seal traps ≥ 50 mm. |
| FCU condensate | DN20 | Gravity | Flow test | Trap. Discharges to the floor gully. |
| BW WC soil | DN100 | Gravity | Water-fill test | ≥ 1:40 fall. Vented. |
| Deck penetrations | Type-approved sleeves | n/a | Visual inspection plus class inspection | **[SC]** Must keep the A-60 integrity of the deck. |

## 7. Installation Sequence (Method)

**Step 0: Preparation and permits**
- Hold a toolbox talk and issue a Permit to Work (PTW).
- Hot work permit for welding of studs, sleeves and coamings. Fire watch during the work and for ≥ 1 h afterwards; gas-free certificate if adjacent to tanks.
- Electrical isolation and lock-out/tag-out (LOTO) of ACC-DB-03 before connecting the feeder **[SC]**.

**Step 1: Steel outfitting (before panels)**
- Weld the panel fixing studs and angle profiles at the ceiling, floor and shell.
- Weld the pipe and cable penetration sleeves through the deck (A-60) and install the coamings. Place them at the coordinates on drawing sheet 3 (pipe duct Fr130, 0–0.5 m off the corridor bulkhead).
- Blast and paint the touch-up areas.
- Apply the shell insulation (75 mm mineral wool, with a vapour barrier).

**Step 2: First fix (services in the open structure)**
- Cable tray: 200 mm, galvanised, in the ceiling void at +2.44 m, with supports at ≤ 400 mm (IEC 60092-401).
- Pull the feeder and circuits. Keep a segregation of ≥ 100 mm between power and IT/IS cables. Seal the transits.
- Plumbing: install the risers in the pipe duct, the branches at +0.60 m (CW) and +0.68 m (HW), and the drains at floor level with the specified falls. Support every 1.5 m (Cu) / 1.0 m (plastic), with anti-vibration clips.
- HVAC: hang the fan coil unit, ducts D160/D125 at +2.41 m (under the deck beams), and the bathroom extract D100.
- **HOLD POINT H1:** pressure test of CW/HW and water-fill test of the drains, witnessed by Class/Owner, *before* the services are enclosed.

**Step 3: Floating floor and wet unit**
- Lay the resilient underlay and the 60 mm floating floor.
- Apply the wet-area membrane and a sloped screed to floor gully FG-1 and the shower trap.
- Run a flood test of the wet unit for 24 h (**HOLD POINT H2**).

**Step 4: Joiner bulkheads and ceilings**
- Erect the B-15 panels in this order: corridor, then the internal partitions, then the shell lining.
- Openings for doors D1–D4 and windows. Fit back boxes for sockets/switches at +0.30 m / +1.20 m.
- Fire-stop all service penetrations through the B-15 panels with approved systems **[SC]**.
- Ceiling panels go in only after **H3**: an above-ceiling inspection of trays, labels and seals.

**Step 5: Doors, windows and furniture**
- Install the fire door D1 with its closer. Check that it closes and latches from 90° **[SC]**.
- Fit the internal doors. The bath door gets a 0.02 m² vent grille or undercut.
- Secure all furniture to the deck or bulkheads for ship motion (design for ±30° roll / 0.5 g accelerations). Bed with sea rail. Drawers and doors with positive catches.

**Step 6: Second fix**
- Install the luminaires, sockets, switches, shaver unit, detectors, PA, bell, phone, EAP and DB-CE. Label all circuits.
- Install the sanitary fixtures: shower mixer (thermostatic, ≤ 43 °C outlet anti-scald), WC, basin and mixers.
- Install the diffusers and the extract valve.

**Step 7: Testing and commissioning** (see section 10)
- Disinfect the potable water system: chlorinate at 50 mg/l for 1 h, or per WHO/ISO 15748. Flush, then take samples.
- Balance the HVAC: SA ≥ 6 ACH (≈ 100 m³/h), bath extract 50 m³/h, cabin slightly negative to the corridor.
- Measure the noise (MSC.337(91)) during the sea trial.

## 8. Lifting / Handling
- Panels (≤ 40 kg) are handled manually by two people.
- Fridge, bed frame and wardrobe modules go in through the stair/AC trunk or via the provision crane using an approved sling and tag line. SWL must exceed the load, and the lifting gear must be certified (ILO 152 / LOLER-equivalent).
- No lifting over personnel. Hatch and landing areas barricaded.
- WC/shower modules: check the doorway clearance of 800 mm before ordering.

## 9. Environmental / Operational Limits
- Work alongside or in dock.
- If any work is done at sea or in harbour with motion, suspend lifting at roll > 3°. Suspend hot work when the gas detector reads > 1 % LEL or under port restrictions.
- Ambient conditions for the wet unit membrane and sealants: +5 °C to +35 °C, RH < 85 %.

## 10. Inspection & Test Plan (ITP)
Key: **H** = hold point, **W** = witness, **R** = review.

| # | Activity | Acceptance | Yard | Owner | Class |
|---|---|---|---|---|---|
| 1 | Penetration sleeves welded, A-60 | Approved drawing, NDT/visual | H | W | **H** |
| 2 | Pressure test CW/HW | 1.5 × DP, no drop in 30 min | H | W | W |
| 3 | Drain water-fill test | No leaks, falls OK | H | W | R |
| 4 | Wet unit flood test | 24 h, no leakage | H | W | R |
| 5 | Above-ceiling inspection | Trays, segregation, seals, labels | H | W | W |
| 6 | Insulation resistance | ≥ 1 MΩ at 500 V DC per circuit (IEC 60092-401 / class) | H | W | W |
| 7 | Earth continuity / bonding of metallic pipes and fixtures | < 0.1 Ω on the bonding conductors | H | W | W |
| 8 | RCD trip test | ≤ 30 ms at 5 × IΔn, ≤ 300 ms at IΔn | H | W | R |
| 9 | Function test: lighting, EM light 30 min / 3 h duration per SOLAS | All operating | W | W | **H** |
| 10 | Fire detection, GA, PA and EAP function | Alarm received at the bridge/ECR; audibility ≥ 75 dB(A) | W | W | **H** |
| 11 | Fire door D1 self-closing | Closes and latches from any angle | W | W | **H** |
| 12 | Water disinfection and samples | Lab result: no E. coli, low HPC | H | W | R |
| 13 | HVAC balancing and noise | Air volumes OK; ≤ 55 dB(A) | W | W | R |

## 11. Risk Assessment (Summary)
| Hazard | Risk | Controls | Residual |
|---|---|---|---|
| Electrocution during connection **[SC]** | High | LOTO of ACC-DB-03; prove dead with a tested voltage detector; competent electrician only. IT-system earth fault monitoring checked. | Low |
| Fire from hot work in the accommodation | High | Hot work permit; remove combustibles; fire watch ≥ 1 h; extinguisher at hand; detectors isolated only under permit and restored. | Low |
| Damage to fire integrity (unsealed penetrations) **[SC]** | High | Type-approved transits; penetration register with photos; Class hold point. | Low |
| Water leak or flooding into the cable tray / below deck | Med | Test before enclosure; drip trays; electrical equipment kept out of bathroom zones 0–1. | Low |
| Legionella / potable water contamination **[SC]** | Med | HW ≥ 60/50 °C; no dead legs > 2 × DN; disinfection and sampling. | Low |
| Manual handling (panels, furniture) | Med | Two-person lifts; trolleys; certified lifting gear. | Low |
| Dust / mineral wool fibres | Med | RPE FFP3, gloves, LEV, housekeeping. | Low |
| Scalding at the shower | Med | Thermostatic mixer with a 43 °C limit stop. | Low |
| Unsecured furniture in a seaway | Med | Fixed or secured to structure; catches on drawers and doors. | Low |

## 12. Handover Documentation
- As-built drawings: DWG/DXF.
- Cable and circuit lists.
- Test certificates (IR, RCD, pressure, flood, water quality).
- Penetration register.
- Type approval certificates (panels, doors, transits, cables).
- O&M manuals (FCU, EAP, shower mixer).
- Spare parts list.

## 13. Deliverables Index
| File | Content |
|---|---|
| CE-SUITE-GA-001.pdf / .svg / .dxf | A1 sheet at 1:25. GA plan, electrical layout, plumbing/HVAC layout, section A-A, legend, notes, title block. DXF layers: STR, FUR, ELEC, EM, CW, HW, GW, BW, VENT, DIM, TXT. |
| CE_Suite.blend | 3D model in metres. Origin at the aft/corridor corner at FFL; X fwd, Y towards the STBD shell, Z up. Nine collections (Structure, Joinery, Doors/Windows, Furniture, Sanitary, Electrical, Plumbing, HVAC, Lighting) under the root empty `CE_Suite_ROOT`. Door leaves are parented to `*_HINGE` empties, with an open/close animation over frames 1–48–96. |
| CE_Suite.glb / .fbx | Exports of the model for simulators/game engines, with animation included. |
| scripts/ga.py, scripts/build_blend.py | Generator scripts that regenerate the outputs after a dimension change. |
