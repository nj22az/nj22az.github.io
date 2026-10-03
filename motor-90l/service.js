// Workshop: tool kit, strip-down and rebuild for the IEC 90L-4 pump motor.
// Strip-down follows Nils's eight-step procedure, with a preparation step 0 and the corrections in WORKSHOP_AUDIT.
// Each step moves parts to a bench offset (mm, same frame as motor.js); the rebuild runs the same steps backwards.

export const TOOLS = [
  // safety
  { id: 'loto', group: 'Safety', name: 'Lock-out kit', size: 'padlock, hasp, tag', use: 'Lock the starter or breaker off before work.', added: true },
  { id: 'tester', group: 'Safety', name: 'Two-pole voltage tester', size: 'EN 61243-3', use: 'Prove dead at U1 V1 W1, PE and TP1–TP2 before touching the terminals.', added: true },
  { id: 'marker', group: 'Safety', name: 'Paint marker', size: '', use: 'Match-mark the DE flange, frame, NDE shield and terminal box.' },
  // hand tools
  { id: 's8', group: 'Hand tools', name: '8 mm socket and spanner', size: 'M5', use: 'Box lid screws, terminal nuts (M5), cowl screws.' },
  { id: 's10', group: 'Hand tools', name: '10 mm socket', size: 'M6', use: 'Not needed on this motor: there is no M6 hardware. Keep it for couplings and guards.' },
  { id: 's13', group: 'Hand tools', name: '13 mm socket', size: 'M8', use: 'The four tie-rods.' },
  { id: 's16', group: 'Hand tools', name: '16 or 17 mm socket', size: 'M10', use: 'B5 flange bolts to the pump (16 mm ISO 4017, 17 mm DIN 931).' },
  { id: 'hex', group: 'Hand tools', name: 'Hex keys 4, 5, 6 mm', size: '', use: 'Coupling set-screws, gland and earth clamps.' },
  { id: 'mallet', group: 'Hand tools', name: 'Dead-blow or copper mallet', size: '', use: 'Free the shield registers from the frame without marking them.' },
  { id: 'drift', group: 'Hand tools', name: 'Brass drift', size: '', use: 'Tap shield tabs and rock the key out of its keyway.' },
  { id: 'wood', group: 'Hand tools', name: 'Hardwood blocks', size: '', use: 'Lever the fan evenly; pad the mallet on painted aluminium.' },
  { id: 'extpliers', group: 'Hand tools', name: 'External circlip pliers', size: 'for Ø10–25 mm', use: 'Fan circlip DIN 471 – 18 on the Ø18 fan seat.' },
  { id: 'intpliers', group: 'Hand tools', name: 'Internal circlip pliers', size: 'for Ø40–60 mm', use: 'DIN 472 – 52 ring that locates the 6205 in the flange.', added: true },
  // pulling
  { id: 'puller', group: 'Pulling', name: 'Three-arm puller', size: '≥ 120 mm spread, 100–150 mm reach', use: 'Coupling or impeller off the DE; the fan hub only if it is tight.' },
  { id: 'separator', group: 'Pulling', name: 'Knife-edge bearing separator', size: 'for Ø20–30 mm shafts', use: 'Grips behind the inner ring of the 6205 and 6204.' },
  { id: 'slide', group: 'Pulling', name: 'Slide hammer with blind-bearing collets', size: '', use: 'Only if a bearing outer ring stays in a shield bore.' },
  // fitting
  { id: 'heater', group: 'Fitting', name: 'Induction bearing heater', size: 'with probe, auto-demagnetise', use: 'Set 80 °C for the sealed 2RS bearings (not 110 °C).' },
  { id: 'fitkit', group: 'Fitting', name: 'Bearing fitting tool kit', size: 'impact rings 20/47 and 25/52', use: 'Cold fitting when no heater is at hand; force through the ring being fitted.' },
  { id: 'tq50', group: 'Fitting', name: 'Torque wrench 5–50 Nm', size: '', use: 'Tie-rods 18–22 Nm, flange bolts.' },
  { id: 'tq6', group: 'Fitting', name: 'Torque screwdriver 1–6 Nm', size: '', use: 'Terminal nuts 2.5 Nm and lid screws: below the range of the 5–50 Nm wrench.', added: true },
  { id: 'film', group: 'Fitting', name: 'Rotor slide film', size: '0.1–0.2 mm polyester', use: 'Protects the bore and windings while the rotor goes in and out.' },
  { id: 'sleeve', group: 'Fitting', name: 'Seal fitting sleeve', size: 'Ø24 / Ø25', use: 'Carries the new lip seal over the keyway without cutting it.', added: true },
  // measuring
  { id: 'caliper', group: 'Measuring', name: 'Vernier caliper', size: '150 mm', use: 'General dimensions, key and keyway.' },
  { id: 'mic0', group: 'Measuring', name: 'Outside micrometer 0–25 mm', size: '0.001 mm', use: 'The Ø20 NDE seat and the Ø18 fan seat.', added: true },
  { id: 'mic25', group: 'Measuring', name: 'Outside micrometer 25–50 mm', size: '0.001 mm', use: 'The Ø25 DE seat and the Ø25 seal land.' },
  { id: 'bore', group: 'Measuring', name: 'Bore gauge', size: '35–60 mm', use: 'Shield bearing bores Ø52 H7 and Ø47 H7: worn or fretted bores let the outer ring turn.', added: true },
  { id: 'dti', group: 'Measuring', name: 'Dial test indicator and magnetic base', size: '0.01 mm', use: 'Shaft runout and flange spigot and face runout.' },
  { id: 'vblocks', group: 'Measuring', name: 'V-blocks (pair)', size: '', use: 'Hold the rotor on its bearing journals for runout checks.', added: true },
  { id: 'feeler', group: 'Measuring', name: 'Feeler gauges', size: '0.05–1 mm', use: 'Of little use here: the gap is enclosed once the shields are on.' },
  // electrical
  { id: 'megger', group: 'Electrical', name: 'Insulation tester', size: '500 V DC', use: 'Each phase to frame and phase to phase, links off, PTC shorted and earthed.' },
  { id: 'mohm', group: 'Electrical', name: 'Milliohmmeter, 4-wire', size: '', use: 'U1–U2, V1–V2, W1–W2 within 2 % of each other.' },
  { id: 'rot', group: 'Electrical', name: 'Phase and motor rotation indicator', size: '', use: 'Supply sequence, then motor direction before the pump is coupled.' },
  { id: 'clamp', group: 'Electrical', name: 'Clamp meter', size: 'AC, 0.1 A resolution', use: 'No-load current in each line: balanced within about 5 %.', added: true },
  // consumables
  { id: 'loctite', group: 'Consumables', name: 'Medium threadlocker (243)', size: '', use: 'Tie-rods and flange bolts.' },
  { id: 'antiseize', group: 'Consumables', name: 'Nickel anti-seize', size: '', use: 'Shaft extension, keyway and spigot registers. Not copper paste on aluminium at sea.' },
  { id: 'grease', group: 'Consumables', name: 'Lip-seal grease', size: '', use: 'Smear on the new lip before it goes over the shaft.', added: true },
  { id: 'wave', group: 'Consumables', name: 'Wave spring for a 47 mm bore', size: '', use: 'Replace with the bearings.' },
  { id: 'seal', group: 'Consumables', name: 'Lip seal 25 × 42 × 7 FKM', size: '', use: 'Replace every time the flange is off.' },
  { id: 'bearings', group: 'Consumables', name: '6205-2RS/C3 and 6204-2RS/C3', size: '', use: 'Bearings that have been pulled are scrap; always fit new.', added: true },
  { id: 'cleaner', group: 'Consumables', name: 'Contact cleaner and lint-free wipes', size: '', use: 'Seats, registers and winding heads.' },
];

const ROTOR = ['rotor', 'shaft', 'bearingDE', 'bearingNDE'];
const DE_END = ['flangeDE', 'shieldDE', 'seal'];
const move = (ids, v) => Object.fromEntries(ids.map(id => [id, v]));

// Strip-down. Each step: what moves where (mm), tools, the work, the check, and its rebuild counterpart.
export const STEPS = [
  {
    title: 'Prepare and match-mark', min: 15, moves: {},
    tools: ['loto', 'tester', 'megger', 'mohm', 's16', 'marker'],
    work: [
      'Isolate at the starter, lock and tag it. Prove dead at U1 V1 W1 to each other and to PE, and at TP1–TP2.',
      'As-found tests before anything is moved: insulation resistance at 500 V DC and the three winding resistances. Write them down.',
      'Unbolt the B5 flange from the pump (4 × M10) and lift the motor to the bench (≈ 18 kg).',
      'Match-mark the DE flange, frame, NDE shield and terminal box with a paint marker on the outside faces — never punch a register or a spigot.',
    ],
    check: 'Motor on the bench, isolation locked, as-found readings recorded, marks across every joint.',
    re: {
      title: 'Commission', min: 15, tools: ['rot', 'clamp', 's16', 'loctite'],
      work: [
        'Run uncoupled first if you can: bump-start and check the direction with the rotation indicator against the pump arrow.',
        'Mount to the pump on the match marks, flange bolts with threadlocker, cross-tightened to the pump maker\'s torque.',
        'Remove the locks. Run: line currents balanced within ≈ 5 % on the clamp meter, no rumble, no rub, no hot spots after 30 min.',
      ],
      check: 'Direction right, currents balanced, bearings quiet, report signed.',
    },
  },
  {
    title: 'Remove the drive components', min: 2, moves: { key: [-40, 45, 0] },
    tools: ['puller', 'drift'],
    work: [
      'If a coupling hub or impeller is still on the shaft, it comes off first: centre the puller screw in the M8 centre hole and draw it off evenly.',
      'Then the key. Its keyway is closed at both ends, so it cannot slide out axially: rock it out by pressing down on one rounded end with the drift and lifting the other.',
    ],
    check: 'The Ø24 journal is bare, with no burrs or scoring; the keyway edges are sharp, not peened.',
    re: {
      title: 'Refit key and coupling', min: 5, tools: ['antiseize', 'puller'],
      work: [
        'Key in, a firm push fit. Thin film of nickel anti-seize on the journal.',
        'Coupling on with heat or a pressing screw into the M8 centre hole — never hammer it on, the shock goes straight into the 6205.',
      ],
      check: 'Key seated full depth: 27 mm (GA) from the far side of the shaft to the top of the key, coupling home on the shoulder.',
    },
  },
  {
    title: 'Disconnect the terminal leads', min: 3, moves: { lid: [0, 110, 0], links: [0, 75, 0] },
    tools: ['s8', 'tester', 'marker'],
    work: [
      'Lid off: 4 × M5 screws, 8 mm socket. Prove dead again at the studs before touching them.',
      'Note Y or Δ. Label U1 V1 W1, U2 V2 W2 and the PTC pair.',
      'Brass nuts and links off with an 8 mm spanner (M5 studs), holding the lower nut so the stud does not turn.',
    ],
    check: 'No external wiring left on the motor; the six winding leads hang free without strain.',
    re: {
      title: 'Test and terminate', min: 15, tools: ['megger', 'mohm', 'tq6', 's8'],
      work: [
        'Insulation at 500 V DC, links off, PTC shorted and earthed: each phase to frame and phase to phase, ≥ 100 MΩ for a rewound or dried winding.',
        'Winding resistance U1–U2, V1–V2, W1–W2 within 2 %. PTC loop with a meter of ≤ 2.5 V only (≈ 300 Ω cold).',
        'Links for the supply (Y for 400 V, Δ for 230 V), nuts 2.5 Nm, PE first. Lid gasket intact, lid screws even.',
      ],
      check: 'Readings in the report next to the as-found values.',
    },
  },
  {
    title: 'Remove the cowl and the fan', min: 5, moves: { cowl: [300, 0, 0], circlip: [225, 0, 0], fan: [190, 0, 0] },
    tools: ['s8', 'extpliers', 'wood', 'puller'],
    work: [
      'Cowl screws out (8 mm) and the cowl straight back.',
      'Circlip off the Ø18 fan seat with external pliers.',
      'Lever the fan off with two wooden blocks from opposite sides. Use the puller on the hub only if it is tight — never on the blades or the rim.',
    ],
    check: 'NDE stub and circlip groove bare; no cracked blades on the fan.',
    re: {
      title: 'Fit the fan and cowl', min: 5, tools: ['extpliers', 's8'],
      work: ['Fan onto its seat, a new circlip fully in the groove.', 'Cowl on, screws in, spin the shaft by hand: the fan must not touch.'],
      check: 'Fan clear of the cowl all the way round.',
    },
  },
  {
    title: 'Unseat the tie-rods', min: 5, moves: { tieRods: [150, 160, 0] },
    tools: ['s13'],
    work: [
      'Four M8 tie-rods out from the NDE end with a 13 mm socket. They screw into tapped lugs in the DE flange.',
      'Before the NDE shield comes off, support the NDE shaft stub: once the shield is gone the rotor rests on the stator bore.',
    ],
    check: 'All four rods out; the joints move slightly under hand pressure.',
    re: {
      title: 'Draw up with the tie-rods', min: 10, tools: ['s13', 'tq50', 'loctite', 'dti', 'vblocks'],
      work: [
        'Rods in by hand, then a cross pattern: 10 Nm, then 18–22 Nm. Turn the shaft between stages.',
        'Shaft runout at the tip with the DTI: IEC 60072-1 allows 0.040 mm for Ø24 (0.021 mm in the reduced class).',
      ],
      check: 'Shaft turns freely with a light, even drag from the seals; runout within limit.',
    },
  },
  {
    title: 'Free the NDE end shield', min: 5, moves: { shieldNDE: [110, 0, 0], wave: [130, -60, 0] },
    tools: ['mallet', 'drift', 'wood'],
    work: [
      'Wood block on the cast tabs, tap round in a cross pattern to crack the paint and free the register.',
      'Ease the shield straight back off the 6204 outer ring.',
      'Take the wave spring out of the bearing bore before it drops.',
    ],
    check: 'Shield off clean; wave spring on the bench.',
    re: {
      title: 'Fit the NDE shield', min: 5, tools: ['mallet', 'wave', 'grease', 'bore'],
      work: [
        'New wave spring into the Ø47 bore with a dab of grease to hold it.',
        'Shield over the 6204 and onto the register on its match mark; tap round evenly until home.',
      ],
      check: 'No gap at the register; marks aligned.',
    },
  },
  {
    title: 'Unseat the DE flange', min: 8, moves: move([...ROTOR, ...DE_END], [-25, 0, 0]),
    tools: ['mallet', 'drift', 'wood'],
    work: [
      'Support the frame. Tap round the flange rim with the mallet and drift until the Ø130 register releases from the frame.',
      'The 6205 is the locating bearing, held in the flange by its circlip, so the flange comes away with the shaft.',
    ],
    check: 'Flange and rotor have moved together; a gap shows into the stator.',
    re: {
      title: 'Seat the DE flange', min: 5, tools: ['mallet', 'antiseize'],
      work: ['Light film of nickel anti-seize on the register. Tap the flange home on its match mark, evenly round the rim.'],
      check: 'Flange fully on the register, no step at the joint.',
    },
  },
  {
    title: 'Extract the rotor', min: 10, moves: move([...ROTOR, ...DE_END], [-230, 0, 0]),
    tools: ['film', 'vblocks'],
    work: [
      'Slide 0.1–0.2 mm film into the lower air gap as the rotor starts to move. The radial gap is only 0.35 mm, so 0.5 mm stock will not go in.',
      'One person on the DE shaft, one on the NDE stub; draw the rotor and flange out straight toward the drive end.',
      'The pull you feel is the rotor\'s weight on the bore, not magnetism: an unpowered cage rotor has no magnets.',
      'Rest it on V-blocks under the bearing journals, never on the rotor core.',
    ],
    check: 'Rotor out; end windings and bore free of scrapes and insulation tears.',
    re: {
      title: 'Insert the rotor', min: 10, tools: ['film'],
      work: ['Film in the lower gap, two people, slide the rotor and flange in level without touching the end windings. Pull the film out before the flange seats.'],
      check: 'No contact marks on the windings or the bore.',
    },
  },
  {
    title: 'Pull the bearings', min: 10, moves: { flangeDE: [-330, 0, 0], shieldDE: [-330, 0, 0], seal: [-345, 0, 0], bearingDE: [-270, 0, 0], bearingNDE: [-190, 0, 0] },
    tools: ['intpliers', 'separator', 'puller', 'slide', 'mic0', 'mic25', 'bore'],
    work: [
      'Lip seal out of the flange. Internal circlip (DIN 472) out of the flange bore, then press the flange off the 6205.',
      'Separator behind the 6205 inner ring, puller on the separator, draw it off. The same for the 6204.',
      'Measure: Ø25 k5 and Ø20 k5 seats (+0.002 … +0.011 mm), the Ø25 seal land, and the Ø52 and Ø47 H7 bores for fretting.',
    ],
    check: 'Journals clean and in tolerance. The old bearings are scrap — they were loaded through the balls.',
    re: {
      title: 'Fit new bearings and seal', min: 20, tools: ['heater', 'fitkit', 'bearings', 'intpliers', 'seal', 'sleeve', 'grease'],
      work: [
        'Heat the new 6205 and 6204 to 80 °C (sealed bearings: not 110 °C), push to the shoulder and hold until they grip. Or fit cold with the fitting kit, force through the inner ring.',
        'Flange onto the 6205 outer ring, internal circlip in.',
        'New FKM lip seal: grease the lip, slide it over the keyway on the sleeve, press square into the flange.',
      ],
      check: 'Bearings hard on their shoulders, cool and turning smoothly; seal square.',
    },
  },
];

// state after strip-down step k (0-based): latest move of every part from steps 0..k
export function movesAfter(k) {
  const out = {};
  for (let i = 0; i <= k && i < STEPS.length; i++) Object.assign(out, STEPS[i].moves);
  return out;
}

// [severity, role, title, text, tool or step]
export const WORKSHOP_AUDIT = [
  ['major', 'Electrician', 'No isolation or prove-dead step',
    'The procedure starts at the key. Add lock-out and a two-pole tester, and prove dead at the studs and at TP1–TP2: the PTC circuit can be fed from a different supply.', 'step:0'],
  ['major', 'Mechanic', 'Key before coupling, and the key does not slide',
    'The coupling sits on the key, so it must come off first. The keyway is end-milled and closed at both ends: tapping the key toward the shoulder jams it. Rock it out by one end.', 'step:1'],
  ['major', 'Mechanic', 'Rotor attraction and film thickness',
    'An unpowered cage rotor has no magnetic pull; what you feel is its weight on the bore once the NDE shield is off. And 0.5 mm film will not go into a 0.35 mm radial gap: use 0.1–0.2 mm, fed in as the rotor moves.', 'step:7'],
  ['major', 'Manufacturer', 'Bearing heater set to 110 °C',
    'Sealed 2RS bearings: 80 °C maximum, or the seals and grease are damaged. Set the heater to 80 °C.', 'heater'],
  ['major', 'Mechanic', 'Micrometer range',
    'A 25–50 mm micrometer cannot measure the Ø20 NDE seat or the Ø18 fan seat. Add a 0–25 mm micrometer.', 'mic0'],
  ['major', 'Mechanic', 'Internal circlip pliers missing',
    'Step 8 removes the ring that holds the 6205 in the flange. That is an internal ring (DIN 472) in a bore; the kit only has external pliers.', 'intpliers'],
  ['major', 'Marine', 'Copper anti-seize on aluminium',
    'Copper paste between aluminium shields and steel in salt air drives galvanic corrosion of the aluminium. Use nickel-based anti-seize.', 'antiseize'],
  ['minor', 'Electrician', 'Terminal nut spanner size',
    'M5 terminal nuts are 8 mm, not 10 mm (step 2). M4 nuts would be 7 mm. This motor has no M6 hardware.', 'step:2'],
  ['minor', 'Mechanic', 'Torque below the wrench\'s range',
    'Terminal nuts are 2.5 Nm, below a 5–50 Nm wrench. Add a 1–6 Nm torque screwdriver.', 'tq6'],
  ['minor', 'Mechanic', 'Shield bores need measuring',
    'A turning outer ring polishes the Ø52 and Ø47 H7 bores. Add a bore gauge; a worn bore means a new shield or a sleeve.', 'bore'],
  ['minor', 'Mechanic', 'Support the rotor before the NDE shield comes off',
    'Without the shield the NDE end of the rotor drops 0.35 mm onto the stator bore. Prop the NDE stub before step 5.', 'step:4'],
  ['minor', 'Mechanic', 'Runout limit',
    'The 0.015 mm in the kit list is tighter than IEC 60072-1 (0.040 mm normal, 0.021 mm reduced class, Ø24). Use the IEC value unless the customer asks for less.', 'dti'],
  ['minor', 'Mechanic', 'Circlip plier range',
    'The fan seat is Ø18 (DIN 471 – 18). Pliers rated 20–25 mm do not cover it; use 10–25 mm pliers.', 'extpliers'],
  ['minor', 'Mechanic', 'Feeler gauges and the air gap',
    'On a TEFC frame the gap is enclosed once the shields are on, and with them off the rotor rests on the bore. Judge the gap from rub marks and runout instead.', 'feeler'],
  ['minor', 'Mechanic', 'End shields are aluminium',
    'The cast-iron warning does not apply to this motor: its shields are aluminium, which dents and goes oval rather than cracking. Pad the mallet with wood.', 'mallet'],
  ['minor', 'Mechanic', 'Match marks',
    'Use a paint marker on outside faces; a centre punch raises a burr, and on a register or spigot that stops the joint from seating.', 'marker'],
  ['ok', 'Mechanic', 'Order and sizes agree with the model',
    'Cowl → fan → tie-rods → NDE shield → DE flange with rotor → bearings works with the DE bearing locating in the flange. 13 mm tie-rods at 18–22 Nm, 16/17 mm flange bolts and 8 mm M5 hardware all match the model.', 'step:4'],
];
