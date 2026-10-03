# Audit: IEC 90L-4, 1.5 kW pump motor

The specification was read and the motor built from it as a 3D model (`index.html`). The design was then checked from three seats:
the **design engineer** (electromagnetics, mechanics, standards), the **marine electrician** (connection, protection, testing)
and the **manufacturer** (drawings, fits, processes). Every number here is worked out in `calc.mjs` and covered by
`calc.test.mjs`.

**Verdict:** the motor concept, frame, ratings and IEC interface dimensions are sound. Fix three items in the specification before
it goes to a winding shop or a machine shop: the turns per coil, the bearing seat diameter and the missing earth terminal.

| | Count |
|---|---|
| Critical (fix before manufacture) | 3 |
| Major (fix before the first batch) | 6 |
| Minor (wording, labels, tighter choices) | 10 |
| Checked and correct | 3 |

## Critical

### 1. Turns per coil do not fit the core (engineer)
38 turns per coil in a double-layer winding is 12 coils × 38 = **456 series turns per phase**. With the specified core
(bore 90 mm, stack 110 mm, kw1 = 0.902) that gives an air-gap flux density of only **0.48 T** at 400 V Y, against the 0.72–0.78 T
in the specification. The copper does not fit either: 2 × 38 turns × 2 strands = 152 wires of Ø0.71 mm per slot, **64 % copper
fill** even in a generous 94 mm² slot. Machine-wound random windings stop at about 40–45 %.

For Bg ≈ 0.75 T the phase needs ≈ **289 series turns**, so ≈ **24–25 turns per coil**. 25 turns of 1 × Ø1.00 mm (or 2 × 0.71 mm) gives
42 % copper fill in a 94 mm² slot, and 4.1 A/mm² at 3.3 A. The model's punching has that 94 mm² slot (yoke 11.9 mm at 1.49 T,
tooth 3.6 mm at 1.71 T). The final turns are confirmed on the first prototype by no-load current.

### 2. Bearing seat diameter (manufacturer)
The shaft table says the shoulder steps up to a Ø28 or Ø30 bearing seat. A 6205 has a 25 mm bore. The DE bearing seat is
**Ø25 k5**; Ø30–31 is the abutment shoulder behind the bearing. The seal land (25 × 42 × 7 seal) is also Ø25.
Shaft as modelled: Ø24 k6 × 50 → Ø25 seal land and bearing seat → Ø31 shoulder → Ø34 rotor seat → Ø26 shoulder → Ø20 NDE seat →
Ø18 fan seat with a circlip groove.

### 3. No protective earth terminal (electrician)
The terminal box specification lists six studs, links, a gland and PTCs, but no PE terminal. IEC 60034-1 requires an earthing
terminal; on a ship add an external earth point on the frame too. Both are in the model (`Earth terminals (PE)`).

## Major

4. **Sealed bearings heated to 110 °C (manufacturer).** Bearings with contact seals and a grease fill should not be heated above
   80 °C. Heat to 80 °C, or press cold through the inner ring with a fitting sleeve.
5. **Trickle or VPI (manufacturer).** “Trickling resin via VPI” mixes two processes. For salt-spray duty specify VPI with a class H
   epoxy or polyester resin, and keep the 4 h / 150 °C cure.
6. **Locating bearing not specified (engineer).** The impeller pushes the shaft axially. Make the DE bearing the locating
   bearing (inner cover or circlip on the outer ring) and let the NDE bearing float on the wave spring.
7. **B35 flange is below the feet (engineer).** FF165 has P = Ø200, so the flange reaches 100 mm below the axis while the feet are at
   H = 90 mm: 10 mm below the foot plane. In IM B35 the feet need ≥ 12 mm pads (shown in the model), or use an FT face flange.
8. **Core interference in an aluminium frame (manufacturer).** Aluminium expands about twice as fast as steel. With the frame
   60 K and the core 80 K above ambient, the Ø150 joint loses ≈ 0.063 mm of interference, more than the 0.03–0.05 mm specified.
   Use ≈ 0.08–0.12 mm for an aluminium frame; 0.03–0.05 mm is right for cast iron.
9. **The ship's supply (electrician).** 230 Δ / 400 Y suits a 400 V 50 Hz network. Many ships run 440 V 60 Hz: order the motor rated
   for that supply (≈ 1740 min⁻¹; the pump's head rises with speed²). This winding cannot be star-delta started on 400 V; that
   needs 400 Δ / 690 Y. At 1.5 kW, direct-on-line start is normal.

## Minor

10. **Shaft runout.** IEC 60072-1 allows 0.040 mm (normal) and 0.021 mm (reduced class) for Ø24. The 0.015 / 0.008 mm in the
    specification is tighter than either. Keep it as a customer requirement if wanted, but do not call it the IEC class.
11. **E tolerance.** ±0.5 mm is labelled JS14, but JS14 for 50 mm is ±0.31 mm. Use one or the other.
12. **Key and keyway fits.** F (8 mm) is the key width, h9. The keyway in the shaft is N9. For 8 mm both are 0 / −0.036 mm, so the
    numbers are right; the label is not.
13. **Vibration.** 1.1 mm/s is not an IEC 60034-14 grade. For H = 90: grade A 1.6 mm/s, grade B 0.7 mm/s.
14. **What the 7/9 pitch does.** Pitch factors: 5th 0.174, 7th 0.766. The short pitch removes most of the 5th; the 7th is reduced
    mainly by distribution (kw7 = 0.136). The choice is right; the wording overstates it.
15. **Coil group polarity.** Phase U groups 1–3, 10–12, 19–21, 28–30 are one pole pitch apart, so 10–12 and 28–30 are connected
    in reverse. Put that on the winding diagram.
16. **Efficiency class.** η = 83.5 % meets IE3 (82.8 % for 1.5 kW 4-pole), and IE3 is the minimum in the EU for 0.75–1000 kW
    (Regulation (EU) 2019/1781). Specify IE3, not “IE2/IE3”.
17. **Seal material code.** “2RS1” is an NBR seal. FKM (Viton) seals need a different suffix from the bearing maker.
18. **Air gap.** 0.35 mm is on the high side for this size (0.25–0.30 mm is usual). It costs magnetising current and some cos φ;
    check that 0.79 holds on test.
19. **Flange datum (model assumption).** The model puts the shaft shoulder in the flange mounting-face plane, with the Ø130 spigot
    standing 3.5 mm proud. Confirm against the pump adapter drawing.

## Checked and correct

- **Ratings agree.** 3.28 A at 400 V Y, 5.71 A at 230 V Δ, 9.95 Nm at 1440 min⁻¹ (4.0 % slip). Hi-pot 1800 V AC = 1000 V + 2 × 400 V
  (IEC 60034-1). IR ≥ 100 MΩ at 500 V DC is a sound factory limit.
- **The core is the right size.** Output coefficient 102 kJ/m³ for D²L = 0.09² × 0.11 m³; current density 4.1 A/mm²; 36/28 slots
  with one slot-pitch skew is a proven pair.
- **IEC dimensions.** D 24 k6, E 50, F 8, GA 27, DS M8, H 90, A 140, B 125, C 56, K 10 and FF165 (P 200, N 130 j6, M 165, S 12,
  T 3.5) match IEC 60072-1. The model is built to these numbers; switch on *Dimensions* to see them.

## For the electrician on board

- Connection: **Y for 400 V** (links W2–U2–V2), **Δ for 230 V** (links U1–W2, V1–U2, W1–V2). Set the overload to the nameplate
  current for that connection (3.3 A in Y).
- Direction: U1-V1-W1 on L1-L2-L3 turns the shaft clockwise seen from the drive end (IEC 60034-8). Check against the pump's arrow
  before coupling.
- PTC: TP1–TP2 to a thermistor relay only. Never megger or hi-pot through them; short and earth TP1–TP2 during insulation tests.
- Earth: connect PE first, disconnect it last; frame to PE < 0.1 Ω.

## What the model shows

All 31 parts are separate objects with their own build step, explode direction and notes: frame and feet, laminated stator core
with 36 semi-closed slots, slot liners and wedges, the double-layer winding (36 coils, each end winding traced coil by coil and
coloured by phase on demand), three PTCs, the skewed cage rotor, shaft with keyway and M8 centre, key, both bearings with balls and
seals, wave spring, lip seal, B3 shield or FF165 flange, screws, fan, circlip, cowl with grille, terminal box with porcelain
board, studs, Y or Δ links, leads, PE, PTC block, gland, lid and rating plate.
