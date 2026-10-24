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

## Workshop: tool kit and strip-down procedure

The tool list and the eight-step strip-down were checked against this motor and are now the *Workshop* tab: each step moves
its parts on the model, lists its tools and checks, and runs backwards as the rebuild. A step 0 (isolate, prove dead, as-found
tests, unbolt from the pump, match-mark) comes first; seven tools were added. The model was changed to match the list: four
M8 tie-rods (13 mm, 18–22 Nm) clamp both shields, put in from the NDE and screwed into tapped lugs in the DE flange (from the DE
side the Ø200 flange is in the way), and the box lid has M5 hex screws (8 mm).

**Major**

- **No isolation step.** Add lock-out and a two-pole tester; prove dead at the studs *and* at TP1–TP2, which may be fed separately.
- **Key before coupling, and the key does not slide.** The coupling sits on the key, so it comes off first. The keyway is closed at
  both ends; tapping the key toward the shoulder jams it. Rock it out by one end.
- **Rotor “magnetic attraction” and the film.** An unpowered cage rotor has no magnetic pull; the load is its weight on the bore once
  the NDE shield is off. 0.5 mm film will not enter a 0.35 mm radial gap: use 0.1–0.2 mm, fed in as the rotor moves.
- **Heater at 110 °C.** Sealed 2RS bearings: 80 °C maximum.
- **Micrometer range.** 25–50 mm cannot measure the Ø20 NDE seat or the Ø18 fan seat; add 0–25 mm.
- **Internal circlip pliers.** Step 8 removes the DIN 472 ring that locates the 6205 in the flange bore; the kit has only external pliers.
- **Copper anti-seize on aluminium at sea** drives galvanic corrosion of the shields. Use nickel anti-seize.

**Minor**

- M5 terminal nuts are 8 mm, not 10 mm (step 2); this motor has no M6 hardware.
- Terminal nuts (2.5 Nm) are below a 5–50 Nm wrench: add a 1–6 Nm torque screwdriver.
- Add a bore gauge for the Ø52 and Ø47 H7 shield bores (fretting from a turning outer ring).
- Prop the NDE shaft stub before the NDE shield comes off, or the rotor drops onto the bore.
- Runout acceptance: IEC 60072-1, 0.040 mm (0.021 mm reduced class), unless the customer asks for less.
- The fan circlip is DIN 471 – 18: pliers for 10–25 mm, not 20–25 mm.
- Feeler gauges cannot reach the gap of an assembled TEFC motor; judge it from rub marks and runout.
- The shields are aluminium, not cast iron: they dent and go oval rather than crack. Pad the mallet.
- Match-mark with paint on outside faces; a punch burr on a register stops the joint from seating.

**Checked:** the order cowl → fan → tie-rods → NDE shield → DE flange with rotor → bearings works with the DE bearing locating in
the flange, and the 13 mm, 16/17 mm and 8 mm sizes and the 18–22 Nm tie-rod torque fit the motor as modelled.

## For the electrician on board

- Connection: **Y for 400 V** (links W2–U2–V2), **Δ for 230 V** (links U1–W2, V1–U2, W1–V2). Set the overload to the nameplate
  current for that connection (3.3 A in Y).
- Direction: U1-V1-W1 on L1-L2-L3 turns the shaft clockwise seen from the drive end (IEC 60034-8). Check against the pump's arrow
  before coupling.
- PTC: TP1–TP2 to a thermistor relay only. Never megger or hi-pot through them; short and earth TP1–TP2 during insulation tests.
- Earth: connect PE first, disconnect it last; frame to PE < 0.1 Ω.

## What the model shows

All 30 parts are separate objects with their own build step, explode direction and notes: frame and feet, laminated stator core
with 36 semi-closed slots, slot liners and wedges, the double-layer winding (36 coils, each end winding traced coil by coil and
coloured by phase on demand), three PTCs, the skewed cage rotor, shaft with keyway and M8 centre, key, both bearings with balls and
seals, wave spring, lip seal, B3 shield or FF165 flange, tie-rods, fan, circlip, cowl with grille, terminal box with porcelain
board, studs, Y or Δ links, leads, PE, PTC block, gland, lid and rating plate.
