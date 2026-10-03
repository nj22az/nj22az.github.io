// What each part is, what it is made of, and how it is serviced.
// Plain text so the same strings can go to the Johansson Town workshop later.
import { summary, IE_LIMITS_1500_4P, RUNOUT_18_30, VIB_GRADES, IT14_30_50 } from './calc.mjs';

const S = summary();
const f = (v, d = 2) => Number(v).toFixed(d);

export const PART_INFO = {
  frame: {
    what: 'Cast aluminium (ADC12) housing with longitudinal cooling fins. Holds the stator core by interference fit and carries the end shields, feet and terminal box.',
    spec: 'IEC frame 90L · shaft height H = 90 mm · 34 fins on a rounded-square envelope · 4 shield bosses at 45°.',
    service: 'Keep the fins clean: dust and paint build-up raise winding temperature. Check that the drain holes at the lowest point are open (or plugged for IP66).',
  },
  feet: {
    what: 'Mounting feet for IM B3 (foot) and IM B35 (foot and flange).',
    spec: 'A = 140 mm, B = 125 mm, C = 56 mm, K = Ø10 mm, H = 90 mm (IEC 60072-1).',
    service: 'Check for soft foot before final alignment: no foot may move more than 0.05 mm when its bolt is slackened.',
  },
  pads: {
    what: 'Steel spacer pads under the feet, shown only in IM B35.',
    spec: `The FF165 flange is Ø200 mm, so it reaches ${f(S.flangeBelowFeet, 0)} mm below the foot plane (P/2 − H). The feet need ≥ 12 mm pads.`,
    service: 'Use full-size machined pads, not stacks of loose shims.',
  },
  core: {
    what: 'Stator core of 220 laminations of non-oriented electrical steel, welded into a stack and shrunk into the frame.',
    spec: `M400-50A, 0.50 mm, C-5 coated · OD 150 / bore 90 / stack 110 mm · 36 semi-closed slots · yoke ${f(S.iron.yoke, 1)} mm (${f(S.iron.Byoke)} T), tooth ${f(S.iron.tooth, 1)} mm (${f(S.iron.Btooth)} T).`,
    service: 'Never file or grind the bore: shorted laminations make hot spots. A core loss test (loop test) finds damaged iron after a burn-out.',
  },
  slotins: {
    what: 'Slot liners keep copper off the iron; wedges close each slot and hold the coil sides in.',
    spec: 'NMN (Nomex-Mylar-Nomex) 0.25 mm, class H · G11 epoxy-glass wedges.',
    service: 'Liners should stand 2–3 mm out of the slot at each end. Cracked or missing liner corners are the classic place for an earth fault.',
  },
  winding: {
    what: 'Three-phase, four-pole, double-layer lap winding. Toggle “Phase colours” to see the U, V and W coil groups.',
    spec: `36 slots, q = ${S.q}, coil pitch 1–8 (7/9) · kw1 = ${f(S.w1.kw, 3)}, kw5 = ${f(Math.abs(S.w5.kw), 3)}, kw7 = ${f(Math.abs(S.w7.kw), 3)} · ${Math.round(S.winding.turnsPerCoil)} turns per coil for Bg ≈ 0.75 T at 400 V Y.`,
    service: 'Measure U1–U2, V1–V2, W1–W2 with the links off: the three resistances should agree within 2 %. Insulation resistance at 500 V DC to frame, PTC circuit shorted and earthed.',
  },
  ptc: {
    what: 'Three PTC thermistors, one in each phase’s end-winding crown, wired in series to TP1–TP2.',
    spec: 'Trip 150 °C (class F, DIN 44081/44082). Cold resistance ≈ 3 × 100 Ω ≤ 750 Ω total.',
    service: 'Connect to a thermistor relay only. Test with an ohmmeter of ≤ 2.5 V — a megger destroys them.',
  },
  tpblock: {
    what: 'Two-pole terminal block for the PTC circuit, separate from the power studs.',
    spec: 'TP1–TP2, max 2.5 V measuring voltage.',
    service: 'Run the PTC pair in its own cable or a screened pair in the power cable, to the thermistor relay in the starter.',
  },
  rotor: {
    what: 'Squirrel-cage rotor: laminated core with 28 die-cast aluminium bars and end rings. The rings carry small fan blades that stir the internal air.',
    spec: '28 closed slots, skewed one stator slot pitch (10°) · Ø89.3 mm (air gap 0.35 mm radial) · balanced to ISO 1940 G2.5, half-key convention.',
    service: 'Look for blue or cracked bars and end rings after a stall. Never drop the rotor onto the stator when withdrawing it — support the shaft at both ends.',
  },
  shaft: {
    what: 'Ground shaft: Ø24 k6 drive end with a keyway and an M8 centre hole; bearing seats Ø25 (DE) and Ø20 (NDE).',
    spec: 'D = 24 k6 (+0.015/+0.002), E = 50 mm, F = 8, GA = 27, DS = M8 × 19 · 42CrMo4 (or 431 stainless for wet ends).',
    service: 'Check runout at the tip with a dial indicator. Use the M8 centre hole with a puller or a pressing screw — never hammer couplings on.',
  },
  key: {
    what: 'Feather key that carries the torque into the pump coupling.',
    spec: 'DIN 6885 form A, 8 × 7 × 40, h9 width, round ends. Keyway in the shaft N9, 4.0 (+0.2) deep.',
    service: 'The key should be a firm push fit. A rocking key wears the keyway into a step.',
  },
  bearingDE: {
    what: 'Drive-end deep-groove ball bearing, sealed and greased for life. Locates the shaft axially (fixed bearing).',
    spec: '6205-2RS/C3 · 25 × 52 × 15 mm · 9 balls Ø7.94 mm · shaft seat k5, housing H7.',
    service: 'Listen with a stethoscope for rumble. Replace both bearings together. Sealed bearings: heat to no more than 80 °C, or press cold on the inner ring.',
  },
  bearingNDE: {
    what: 'Non-drive-end bearing, free to float axially, preloaded by the wave spring.',
    spec: '6204-2RS/C3 · 20 × 47 × 14 mm · 8 balls Ø7.94 mm.',
    service: 'Same as the DE bearing. A bearing that only fails at the NDE often points to shaft currents or a missing wave spring.',
  },
  wave: {
    what: 'Wave spring washer in the NDE bearing housing. Gives the bearings a light axial preload so the balls roll and do not skid.',
    spec: 'About 100–200 N preload (5–10 N per mm of bearing bore).',
    service: 'Always refit it. A noisy motor at no load is often a missing wave spring.',
  },
  seal: {
    what: 'Radial lip seal on the drive end, keeping pump-room water out of the bearing.',
    spec: '25 × 42 × 7 FKM, running on the Ø25 seal land (Ra ≤ 0.4 µm, plunge ground).',
    service: 'Grease the lip before fitting, slide it over the keyway with a sleeve, and replace it every time the shield is off.',
  },
  shieldDE: {
    what: 'Drive-end shield for foot mounting (IM B3). Carries the DE bearing and seal.',
    spec: 'Cast aluminium, bearing bore Ø52 H7, spigot into the frame.',
    service: 'Tap off evenly with a soft mallet; never lever in the spigot joint.',
  },
  flangeDE: {
    what: 'Drive-end flange shield for direct mounting to the pump (IM B5).',
    spec: 'FF165: P = Ø200, N = Ø130 j6 spigot (T = 3.5), M = Ø165 PCD, 4 × Ø12 for M10, LA = 12 mm. Spigot concentric to the shaft within 0.08 mm, face square within 0.10 mm.',
    service: 'Clean the spigot and face before mounting; a burr here bends the pump shaft line.',
  },
  boltsDE: { what: 'Four screws holding the DE shield to the frame bosses.', spec: 'M6 × 25, 8.8, zinc plated.', service: 'Tighten in a cross pattern, 9 Nm.' },
  shieldNDE: { what: 'Non-drive-end shield with the NDE bearing housing, wave spring seat and cowl lugs.', spec: 'Cast aluminium, bearing bore Ø47 H7.', service: 'Check the bearing bore for fretting (polished or rusty patches): the outer ring has been turning.' },
  boltsNDE: { what: 'Four screws holding the NDE shield.', spec: 'M6 × 25, 8.8, zinc plated.', service: 'Cross pattern, 9 Nm. Turn the shaft by hand after tightening: it must turn freely.' },
  fan: {
    what: 'External cooling fan with straight radial blades, so it cools equally in both directions of rotation.',
    spec: 'Polypropylene, Ø178 mm, keyed and held by a circlip.',
    service: 'A cracked blade unbalances the motor. Check the fan whenever vibration rises.',
  },
  circlip: { what: 'Retaining ring holding the fan on the shaft.', spec: 'DIN 471, 18 × 1.2.', service: 'Use circlip pliers and fit a new ring if it has been opened past its limit.' },
  cowl: {
    what: 'Pressed steel fan cover. Guides the air from the grille over the fins toward the drive end.',
    spec: 'Steel 1.0 mm, powder coated, fixed by 3 screws · grille finger-safe to IP20.',
    service: 'Keep the grille clear. A blocked grille is a common cause of PTC trips on bilge pumps.',
  },
  tbox: { what: 'Terminal box with two M20 cable entries, sealed to IP66.', spec: 'Cast aluminium, gasket to the frame and the lid.', service: 'Replace the lid gasket if it is flattened or torn. Turn the box so the entries face down where possible.' },
  tboard: {
    what: 'Six-stud terminal board. Winding ends U1 V1 W1 / W2 U2 V2.',
    spec: 'Glazed porcelain (or DMC), M5 brass studs.',
    service: 'Tighten nuts to 2.5 Nm. Discoloured studs mean a loose joint.',
  },
  links: {
    what: 'Brass links that set the winding to star (Y) or delta (Δ). Use the toggle to swap them.',
    spec: 'Y for a 400 V supply: W2–U2–V2 joined. Δ for a 230 V supply: U1–W2, V1–U2, W1–V2.',
    service: 'This motor (230 Δ / 400 Y) cannot be star-delta started on 400 V; that needs a 400 Δ / 690 Y winding.',
  },
  leads: { what: 'Flexible winding leads from the NDE end winding to the studs, with ring lugs.', spec: 'Class F/H silicone or EPR insulated, sleeved where they pass the frame.', service: 'Check for chafing where the leads pass from the frame into the box.' },
  earth: {
    what: 'Protective earth (PE) terminal inside the box and an external earth point on the frame.',
    spec: 'Required by IEC 60034-1 (earthing). Green/yellow marking.',
    service: 'Connect PE first and disconnect it last. Check frame-to-PE resistance < 0.1 Ω.',
  },
  gland: { what: 'IP68 nickel-plated brass cable gland and a blanking plug in the spare entry.', spec: 'M20 × 1.5 for a 4 × 1.5 mm² cable (Ø 9–13 mm).', service: 'The seal must grip the outer sheath, not the cores.' },
  lid: { what: 'Terminal box lid with a gasket and a warning label.', spec: 'Four captive screws.', service: 'Isolate and lock off before opening; the PTC terminals may be live from a separate supply.' },
  nameplate: {
    what: 'Rating plate.',
    spec: '1.5 kW S1 · 230 Δ / 400 Y V · 5.7 / 3.3 A · 1440 min⁻¹ · cos φ 0.79 · IE3 83.5 % · IP66 · IC411 · class F.',
    service: 'Set the motor overload relay to the nameplate current for the connection used: 3.3 A in Y on 400 V.',
  },
};

// Build-order captions, following the manufacturing procedure.
export const STEPS = [
  null,
  { title: 'Core into frame', text: 'Stack 220 laminations under a press to 110 mm, weld, heat the frame to 180–200 °C and drop the core in.' },
  { title: 'Insulate and wind', text: 'Line the 36 slots with NMN, insert the coils phase by phase, wedge, fit phase paper and the PTCs in the crowns, lace the end windings.' },
  { title: 'Impregnate', text: 'Pre-heat to 105 °C, VPI in class H resin, cure 4 h at 150 °C. Then hi-pot 1800 V and IR ≥ 100 MΩ at 500 V DC.' },
  { title: 'Rotor and shaft', text: 'Shrink the rotor onto the shaft, skim the OD to Ø89.3 (0.35 mm air gap), balance to G2.5 with a half key.' },
  { title: 'Bearings', text: 'Fit the 6205 and 6204 (sealed bearings ≤ 80 °C), insert the wave spring in the NDE housing.' },
  { title: 'End shields', text: 'Slide the rotor into the stator, fit the NDE shield, then the DE shield or flange with its seal. Cross-tighten; check runout and that the shaft turns freely.' },
  { title: 'Fan and cowl', text: 'Fit the fan and circlip, then the cowl.' },
  { title: 'Terminal box', text: 'Terminate the six leads and the PTCs, fit links for the ordered voltage, PE, gland, lid and rating plate. Final test run.' },
];

// Audit findings: [severity, role, title, detail, part]
export const AUDIT = [
  ['critical', 'Engineer', 'Turns per coil do not fit the core',
    `38 turns per coil in a double-layer winding gives ${S.winding.NphSpec} series turns per phase and an air-gap flux density of only ${f(S.winding.BgWithSpec)} T at 400 V Y. With 2 × 0.71 mm that is ${S.fillSpec.wires} wires per slot and ${f(S.fillSpec.copperFill * 100, 0)} % copper fill — it cannot be wound. For Bg ≈ 0.75 T you need ≈ ${Math.round(S.winding.turnsPerCoil)} turns per coil (≈ ${Math.round(S.winding.Nph)} turns per phase), e.g. 25 turns of 1 × Ø1.00 mm (2 × 0.71 is equivalent): ${f(S.fillFix.copperFill * 100, 0)} % copper fill in a ${f(S.fillFix.gross, 0)} mm² slot.`, 'winding'],
  ['critical', 'Manufacturer', 'Bearing seat diameter',
    'The shaft table says the shoulder steps up to a Ø28 or Ø30 bearing seat, but a 6205 has a 25 mm bore. The DE seat must be Ø25 k5; Ø30–31 is the abutment shoulder behind the bearing. The seal land is also Ø25.', 'shaft'],
  ['critical', 'Electrician', 'No protective earth terminal',
    'The terminal box specification has no PE terminal. IEC 60034-1 requires an earthing terminal; for marine use add an external earth point on the frame as well. Both are in the model.', 'earth'],
  ['major', 'Manufacturer', 'Sealed bearings heated to 110 °C',
    'Bearings with seals (2RS) and grease fill should not be heated above 80 °C. Heat to 80 °C or press cold on the inner ring.', 'bearingDE'],
  ['major', 'Manufacturer', 'Trickle or VPI — pick one',
    '“Trickling resin via VPI” mixes two processes. For salt-spray duty specify VPI with a class H epoxy or polyester resin, and keep the 150 °C cure.', 'winding'],
  ['major', 'Engineer', 'Locating bearing not specified',
    'A pump impeller pushes the shaft axially. Make the DE bearing the locating bearing (cover or circlip on the outer ring) and let the NDE bearing float on the wave spring.', 'bearingDE'],
  ['major', 'Engineer', 'B35 flange is below the feet',
    `With FF165 on frame 90 the flange radius (100 mm) is ${f(S.flangeBelowFeet, 0)} mm more than the shaft height (90 mm). In IM B35 the feet need pads ≥ 12 mm, or choose an FT face flange.`, 'pads'],
  ['major', 'Manufacturer', 'Core interference in an aluminium frame',
    `Aluminium grows almost twice as fast as steel. With the frame 60 K and the core 80 K above ambient, the Ø150 joint loses ≈ ${f(S.shrinkLoss, 3)} mm of interference, more than the 0.03–0.05 mm specified. Use ≈ 0.08–0.12 mm for an aluminium frame (0.03–0.05 mm is right for cast iron).`, 'core'],
  ['major', 'Electrician', 'Check the ship’s supply before ordering',
    '230 Δ / 400 Y suits 400 V 50 Hz. Many ships run 440 V 60 Hz: order the motor rated for it (speed ≈ 1740 min⁻¹, the pump head rises with speed²). Star-delta starting on 400 V is not possible with this winding.', 'links'],
  ['minor', 'Manufacturer', 'Shaft runout values',
    `IEC 60072-1 allows ${RUNOUT_18_30.normal} mm (normal) and ${RUNOUT_18_30.reduced} mm (reduced class) for Ø24. The 0.015/0.008 mm in the spec is tighter than either; keep it as a customer requirement but do not call it the IEC class.`, 'shaft'],
  ['minor', 'Manufacturer', 'E tolerance',
    `±0.5 mm is labelled JS14, but JS14 for 50 mm is ±${f(IT14_30_50 / 2)} mm. Use one or the other.`, 'shaft'],
  ['minor', 'Manufacturer', 'Key and keyway fits',
    'F (8 mm) is the key width, h9. The keyway in the shaft is N9 (0 / −0.036 mm for 8 mm). The numbers happen to match; the label should not.', 'key'],
  ['minor', 'Engineer', 'Vibration limit',
    `1.1 mm/s is not an IEC 60034-14 grade. For H = 90: grade A ${VIB_GRADES.A} mm/s, grade B ${VIB_GRADES.B} mm/s.`, 'rotor'],
  ['minor', 'Engineer', 'What the 7/9 pitch does',
    `Pitch factors: 5th ${f(Math.abs(S.w5.kp), 3)}, 7th ${f(Math.abs(S.w7.kp), 3)}. The short pitch kills most of the 5th; the 7th is mainly reduced by distribution (total kw7 = ${f(Math.abs(S.w7.kw), 3)}). The choice is right; the wording overstates it.`, 'winding'],
  ['minor', 'Electrician', 'Coil group polarity',
    'Phase U groups 1–3, 10–12, 19–21, 28–30 are a pole pitch apart, so groups 10–12 and 28–30 must be connected in reverse. Write that on the winding diagram.', 'winding'],
  ['minor', 'Engineer', 'Efficiency class',
    `η = 83.5 % meets IE3 (${IE_LIMITS_1500_4P.IE3} %), and IE3 is the minimum in the EU for 0.75–1000 kW (Regulation 2019/1781). Specify IE3, not “IE2/IE3”.`, 'nameplate'],
  ['minor', 'Manufacturer', 'Seal material code',
    '“2RS1” is an NBR seal. FKM (Viton) seals need a different suffix from the bearing maker; confirm the part number.', 'bearingDE'],
  ['minor', 'Engineer', 'Air gap',
    '0.35 mm is on the high side for a 1.5 kW 4-pole motor (0.25–0.30 mm is usual). It costs magnetising current and a little cos φ; check the 0.79 still holds on test.', 'rotor'],
  ['minor', 'Engineer', 'Flange datum',
    'The model puts the shaft shoulder in the flange mounting-face plane with the Ø130 spigot standing 3.5 mm proud. Confirm this against the pump adapter drawing.', 'flangeDE'],
  ['ok', 'Electrician', 'Ratings agree',
    `I = ${f(S.Istar)} A at 400 V Y and ${f(S.Idelta)} A at 230 V Δ; T = ${f(S.T)} Nm at 1440 min⁻¹ (slip ${f(S.s * 100, 1)} %). Hi-pot ${S.hipot} V AC = 1000 V + 2 × 400 V. IR ≥ 100 MΩ at 500 V DC is a sound factory limit.`, 'nameplate'],
  ['ok', 'Engineer', 'Core size is right for 1.5 kW',
    `Output coefficient ${f(S.esson, 0)} kJ/m³ (D²L = 0.09² × 0.11 m³), current density ${f(S.J, 1)} A/mm², yoke ${f(S.iron.Byoke)} T, teeth ${f(S.iron.Btooth)} T. 36/28 slots with one slot-pitch skew is a proven combination.`, 'core'],
  ['ok', 'Manufacturer', 'IEC dimensions',
    'D 24 k6, E 50, F 8, GA 27, DS M8, H 90, A 140, B 125, C 56, K 10 and FF165 (P 200, N 130 j6, M 165, S 12, T 3.5) all match IEC 60072-1, and the model is built to them.', 'shaft'],
];
