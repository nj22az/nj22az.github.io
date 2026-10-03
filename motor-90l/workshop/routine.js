// Tetsuo's routine on the bilge pump motor, as a timeline of beats.
// A beat: d (s), say, pose {at:[x,z], face, lean, R, L, look, twist, mood}, tool {R, L},
// set {numeric state reached at the end of the beat}, now {state from the start of the beat}, cam (shot name).
// Hand targets are point names from scene.js, or {sweep:[a, b], n} to brush back and forth.
import { phaseResistance, summary } from '../calc.mjs';

const S = summary();
const R20 = phaseResistance(20);
const ohm = k => (R20 * k).toFixed(2) + ' Ω';
const fmt = (v, d = 1) => Number(v).toFixed(d);

const BENCH = [0.04, -0.54], LEFT = [-0.26, -0.54], RIGHT = [0.4, -0.54], ISO = [-0.84, -0.86];
const at = (p, extra = {}) => ({ at: p, face: 0, ...extra });

export const SHOTS = {
  wide: [[1.3, 1.6, 1.75], [-0.2, 0.85, -0.5]],
  isolator: [[-1.72, 1.36, -0.22], [-0.92, 0.95, -1.18]],
  boxTop: [[0.4, 1.3, 0.42], [0.03, 0.85, -0.2]],
  nameplate: [[-0.1, 0.8, 0.62], [-0.02, 0.68, -0.06]],
  prove: [[0.95, 1.1, 0.45], [0.55, 0.6, -0.12]],
  shaft: [[-0.78, 0.98, 0.38], [-0.28, 0.67, -0.2]],
  cut: [[-0.5, 0.95, 0.66], [-0.08, 0.66, -0.2]],
  fins: [[0.62, 1.2, 0.8], [0.0, 0.76, -0.25]],
  grille: [[0.95, 0.98, 0.32], [0.3, 0.67, -0.2]],
  meter: [[-0.45, 1.28, 0.42], [-0.08, 0.84, -0.2]],
  cable: [[0.6, 1.05, 0.9], [-0.05, 0.7, -0.05]],
  face: [[0.38, 1.4, 0.8], [0.02, 1.15, -0.52]],
};

export const CHAPTERS = [
  {
    id: 'isolate', title: 'Isolate and lock off',
    learn: `<p><strong>Stopping is not isolating.</strong> The stop button only opens a contactor: a control fault, an automatic float switch or a colleague can close it again. The isolator makes a visible break in all three lines, and your own padlock keeps it there.</p>
<p>The rule is three words: <strong>isolate, secure, prove dead</strong>. One lock per person, and the key stays in your pocket.</p>
<p class="aug">On the model: the cable runs from the gland to the starter on the wall. That cable is what you are making safe.</p>`,
    beats: [
      { d: 4.5, cam: 'wide', say: 'This is the bilge pump motor from the pump room. Before we touch it, we take the power away. Not off. Away.', pose: at(BENCH, { look: 'cam', mood: 'neutral' }) },
      { d: 3, cam: 'wide', pose: { at: ISO, face: Math.PI, walk: true, look: 'isolator' } },
      { d: 3, cam: 'isolator', say: 'Stop first, then the isolator to OFF.', pose: { at: ISO, face: Math.PI, R: 'isolator', look: 'isolator' }, set: { iso: 1 } },
      { d: 3.5, cam: 'isolator', say: 'My lock, my tag. The key stays in my pocket until I am finished.', pose: { at: ISO, face: Math.PI, R: 'hasp', L: 'hasp', look: 'hasp' }, set: { lock: 1 } },
      { d: 3, cam: 'isolator', say: 'Try the start button. Nothing. Good — but that only tells us the starter is off.', pose: { at: ISO, face: Math.PI, R: 'start', look: 'start' } },
      { d: 3, cam: 'wide', pose: { at: BENCH, face: 0, walk: true, look: 'box' } },
    ],
  },
  {
    id: 'prove', title: 'Prove it dead',
    learn: `<p>Use a <strong>two-pole voltage tester</strong> (EN 61243-3), not a multimeter: it cannot sit on the wrong range or the current jacks, and it needs no battery to show danger.</p>
<p><strong>Test – test – test:</strong> prove the tester on a known source, test the circuit, prove the tester again. A tester that died in between would otherwise look like a dead circuit.</p>
<p>Every combination: L1–L2, L2–L3, L3–L1, and each line to PE. Then the PTC pair, which can be fed from somewhere else.</p>`,
    beats: [
      { d: 3.5, cam: 'prove', say: 'First the tester on the proving unit. It must show a voltage, or the tester is lying.', tool: { R: 'tester', L: 'testerL' }, pose: at(RIGHT, { R: 'proveA', L: 'proveB', lean: 0.1, look: 'proveA' }), now: { tester: '230 V', led: 1 } },
      { d: 3.5, cam: 'boxTop', say: 'Lid off. Four M5 screws, 8 mm.', tool: { R: 'wrench' }, pose: at(BENCH, { R: 'lidScrewA', L: 'lid', lean: 0.12, look: 'lid' }), now: { tester: '', led: 0 }, set: { lid: 1 } },
      { d: 2, cam: 'boxTop', say: 'Line to line: U1–V1…', tool: { R: 'tester', L: 'testerL' }, pose: at(BENCH, { R: 'U1', L: 'V1', lean: 0.14, look: 'V1' }), now: { tester: '0 V' } },
      { d: 1.6, cam: 'boxTop', say: '…V1–W1…', pose: at(BENCH, { R: 'V1', L: 'W1', lean: 0.14, look: 'V1' }), now: { tester: '0 V' } },
      { d: 1.6, cam: 'boxTop', say: '…W1–U1.', pose: at(BENCH, { R: 'W1', L: 'U1', lean: 0.14, look: 'V1' }), now: { tester: '0 V' } },
      { d: 1.6, cam: 'boxTop', say: 'Each line to earth. U1–PE…', pose: at(BENCH, { R: 'U1', L: 'PE', lean: 0.14, look: 'PE' }), now: { tester: '0 V' } },
      { d: 1.4, cam: 'boxTop', say: '…V1–PE…', pose: at(BENCH, { R: 'V1', L: 'PE', lean: 0.14, look: 'PE' }), now: { tester: '0 V' } },
      { d: 1.4, cam: 'boxTop', say: '…W1–PE.', pose: at(BENCH, { R: 'W1', L: 'PE', lean: 0.14, look: 'PE' }), now: { tester: '0 V' } },
      { d: 2.4, cam: 'boxTop', say: 'And the thermistor pair. That can come from a different supply.', pose: at(BENCH, { R: 'TP1', L: 'TP2', lean: 0.14, look: 'TP1' }), now: { tester: '0 V' } },
      { d: 3.5, cam: 'prove', say: 'Back to the proving unit. Still works. Now it is dead, and I know it.', pose: at(RIGHT, { R: 'proveA', L: 'proveB', lean: 0.1, look: 'proveA', mood: 'content' }), now: { tester: '230 V', led: 1 } },
    ],
  },
  {
    id: 'yd', title: 'Star or delta?',
    learn: `<p>The plate says <strong>230 Δ / 400 Y</strong>. Each winding is built for about 230 V.</p>
<p><strong>Star (Y)</strong> on 400 V: U<sub>phase</sub> = U<sub>L</sub> / √3 = 400 / 1.73 = <strong>231 V</strong> per winding, and I<sub>L</sub> = I<sub>phase</sub> = ${fmt(S.Istar)} A.</p>
<p><strong>Delta (Δ)</strong> on 230 V: U<sub>phase</sub> = U<sub>L</sub> = <strong>230 V</strong> per winding, and I<sub>L</sub> = √3 · I<sub>phase</sub> = ${fmt(S.Idelta)} A.</p>
<p>Same voltage on each winding, same power: P = √3 · U<sub>L</sub> · I<sub>L</sub> · cos φ · η = 1.5 kW either way. Wrong links on 400 V (Δ) puts 400 V on 230 V windings: about three times the magnetising current, and the winding burns.</p>
<p class="aug">On the model: the winding turns into its phase colours (U brown, V black, W grey) while Tetsuo moves the links.</p>`,
    beats: [
      { d: 4.5, cam: 'nameplate', say: 'Read the plate first. 230 delta, 400 star. Our ship is 400 volts.', tool: {}, pose: at(BENCH, { look: 'nameplate', lean: 0.06 }), now: { phases: 1 } },
      { d: 4.5, cam: 'boxTop', say: 'Star: W2, U2 and V2 joined together. Each winding sees 400 over root three. 231 volts.', pose: at(BENCH, { R: 'links', lean: 0.14, look: 'links' }) },
      { d: 4.5, cam: 'boxTop', say: 'On a 230 volt ship you would fit delta: U1 to W2, V1 to U2, W1 to V2. Still 230 per winding.', tool: { R: 'wrench' }, pose: at(BENCH, { R: 'links', L: 'box', lean: 0.14, look: 'links' }), set: { links: 1 } },
      { d: 4, cam: 'boxTop', say: 'We are on 400. Back to star. Nuts at 2.5 newton-metres — gently, the studs are brass.', pose: at(BENCH, { R: 'links', L: 'box', lean: 0.14, look: 'links' }), set: { links: 0 } },
    ],
  },
  {
    id: 'measure', title: 'Measure the windings',
    learn: `<p><strong>Resistance</strong> (low-ohm range, links off): each winding on its own. R = ρ · L / A: about ${300} turns of Ø1.0 mm copper gives ≈ ${fmt(R20, 2)} Ω at 20 °C. The three must agree within 2 %; one low reading means shorted turns, one open means a broken coil.</p>
<p>Copper's resistance rises with temperature: R<sub>T</sub> = R<sub>20</sub> · (235 + T) / 255. Warm from running at 75 °C it reads ${fmt(phaseResistance(75), 2)} Ω — not a fault.</p>
<p><strong>Insulation</strong> is a different question: 500 V DC between copper and frame, reading megaohms. Above 100 MΩ the leakage is under 5 µA (I = U / R = 500 V / 100 MΩ).</p>`,
    beats: [
      { d: 3.5, cam: 'boxTop', say: 'Links off, so each winding stands on its own.', tool: { R: 'wrench' }, pose: at(BENCH, { R: 'links', L: 'box', lean: 0.14, look: 'links' }), set: { linksOff: 1 }, now: { phases: 0 } },
      { d: 2.4, cam: 'meter', say: 'Low ohms. U1 to U2…', tool: { R: 'meterR', L: 'meterL' }, pose: at(BENCH, { R: 'U1', L: 'U2', lean: 0.14, look: 'U1' }), now: { meter: ohm(1.0) } },
      { d: 2, cam: 'meter', say: '…V1 to V2…', pose: at(BENCH, { R: 'V1', L: 'V2', lean: 0.14, look: 'V1' }), now: { meter: ohm(1.004) } },
      { d: 2, cam: 'meter', say: '…W1 to W2.', pose: at(BENCH, { R: 'W1', L: 'W2', lean: 0.14, look: 'W1' }), now: { meter: ohm(0.997) } },
      { d: 3.5, cam: 'meter', say: 'All three within half a percent. No shorted turns.', pose: at(BENCH, { look: 'meter', mood: 'content' }) },
      { d: 2.4, cam: 'meter', say: 'Now 500 volts DC, winding to frame. U1…', pose: at(BENCH, { R: 'U1', L: 'PE', lean: 0.14, look: 'U1' }), now: { meter: '>550MΩ' } },
      { d: 2, cam: 'meter', say: '…V1…', pose: at(BENCH, { R: 'V1', L: 'PE', lean: 0.14, look: 'V1' }), now: { meter: '>550MΩ' } },
      { d: 2, cam: 'meter', say: '…W1. Dry and healthy.', pose: at(BENCH, { R: 'W1', L: 'PE', lean: 0.14, look: 'W1' }), now: { meter: '>550MΩ' } },
      { d: 4, cam: 'boxTop', say: 'Links back to star, nuts snug, lid on.', tool: { R: 'wrench' }, pose: at(BENCH, { R: 'lidScrewC', L: 'lid', lean: 0.12, look: 'lid' }), now: { meter: '' }, set: { linksOff: 0, lid: 0 } },
    ],
  },
  {
    id: 'bearings', title: 'Bearings and shaft',
    learn: `<p>The rotor runs on two ball bearings. The <strong>drive end 6205</strong> is held in the shield and takes the pump's axial push; the <strong>non-drive end 6204</strong> floats on a wave spring, so the shaft can grow with heat.</p>
<p>By hand you feel three things: smooth or notchy (damaged races), tight (misaligned shield or bent shaft), and play when you lift the shaft (worn bearing). A healthy one turns smooth with only the seals' drag.</p>
<p><strong>Runout</strong> is how far the shaft tip wobbles as it turns. IEC 60072-1 allows 0.040 mm for a Ø24 shaft.</p>
<p class="aug">On the model: the cutaway shows the balls rolling between the rings as Tetsuo turns the shaft.</p>`,
    beats: [
      { d: 4.5, cam: 'shaft', say: 'Turn it by hand. Slowly. Listen with your fingers.', tool: {}, pose: at(LEFT, { R: 'shaftTip', lean: 0.1, look: 'shaftTip' }), set: { shaft: 1 } },
      { d: 4.5, cam: 'cut', say: 'Inside, the balls roll between the rings. Smooth, quiet, a little drag from the seals. Good.', pose: at(LEFT, { R: 'shaftTip', lean: 0.1, look: 'shaftTip' }), now: { cut: 1 }, set: { shaft: 2 } },
      { d: 3.5, cam: 'shaft', say: 'Lift the shaft. No knock, no play.', pose: at(LEFT, { R: 'shaftTop', L: 'shaftTip', lean: 0.1, look: 'shaftTip' }), now: { cut: 0 } },
      { d: 5, cam: 'shaft', say: 'The clock on the tip, and turn. Two hundredths. The standard allows four.', pose: at(LEFT, { R: 'shaftTip', lean: 0.1, look: 'dti' }), now: { dti: 1 }, set: { shaft: 3 } },
      { d: 3.5, cam: 'shaft', say: 'Key firm, keyway edges sharp. No burrs to fight the coupling.', pose: at(LEFT, { R: 'key', lean: 0.1, look: 'key' }), now: { dti: 0 } },
    ],
  },
  {
    id: 'clean', title: 'Clean and inspect',
    learn: `<p>The motor turns ${fmt(1500 / 0.835 - 1500, 0)} W of losses into heat (P<sub>in</sub> − P<sub>out</sub> = 1500 / 0.835 − 1500). The fan blows it along the fins. Dust and salt are a blanket on those fins.</p>
<p>A useful rule: every <strong>10 K hotter halves the life of the insulation</strong>. A clogged bilge-pump motor often shows up first as PTC trips.</p>
<p>Inspect while you clean: gland tight on the outer sheath, feet bolts tight, no cracks at the feet, drain plugs in place.</p>
<p class="aug">On the model: the dust on the fins and the grille disappears where Tetsuo brushes.</p>`,
    beats: [
      { d: 4.5, cam: 'fins', say: 'Dust on the fins is a blanket. The motor runs hot, the thermistors trip, and someone blames the motor.', tool: { R: 'brush' }, pose: at(BENCH, { R: { sweep: ['finsA', 'finsB'], n: 3 }, lean: 0.12, look: 'finsB' }), set: { fins: 0.5 } },
      { d: 4, cam: 'fins', pose: at(BENCH, { R: { sweep: ['finsA', 'finsB'], n: 3 }, lean: 0.12, look: 'finsA' }), set: { fins: 0 } },
      { d: 4.5, cam: 'grille', say: 'The cowl grille. Block this and there is no cooling at all.', pose: at(RIGHT, { R: { sweep: ['grille', 'grilleB'], n: 3 }, lean: 0.1, look: 'grille' }), set: { grille: 0 } },
      { d: 3.5, cam: 'cable', say: 'Gland tight on the sheath, not on the cores.', tool: {}, pose: at(BENCH, { R: 'gland', lean: 0.12, look: 'gland' }) },
      { d: 3.5, cam: 'wide', say: 'Feet bolts tight. No cracks. Drains open.', pose: at(LEFT, { R: 'foot', lean: 0.062, look: 'foot' }) },
    ],
  },
  {
    id: 'run', title: 'Test run',
    learn: `<p>Three-phase current in three windings 120° apart makes a <strong>rotating magnetic field</strong>. With 4 poles at 50 Hz it turns at n<sub>s</sub> = 120 · f / p = 120 · 50 / 4 = <strong>1500 min⁻¹</strong>.</p>
<p>The cage rotor chases the field but never catches it: the difference, the <strong>slip</strong>, is what induces current in the bars. At full load s = (1500 − 1440) / 1500 = ${fmt(S.s * 100, 1)} %.</p>
<p>Swap any two phases and the field turns the other way. That is how you correct the direction.</p>
<p>At no load the motor draws mostly magnetising current, about ${fmt(S.Istar * 0.58, 1)} A here, equal in all three lines. Clamp one core at a time: round the whole cable the three currents add up to zero.</p>
<p class="aug">On the model: the red and blue arcs are the N and S poles of the field. The rotor turns a little slower than the field (the slip is exaggerated so you can see it).</p>`,
    beats: [
      { d: 3, cam: 'wide', say: 'Everyone clear. My lock, so I take it off.', tool: {}, pose: { at: ISO, face: Math.PI, walk: true, look: 'isolator' } },
      { d: 3.5, cam: 'isolator', say: 'Lock off, isolator on.', pose: { at: ISO, face: Math.PI, R: 'hasp', look: 'hasp' }, set: { lock: 0, iso: 0 } },
      { d: 3, cam: 'isolator', say: 'Start.', pose: { at: ISO, face: Math.PI, R: 'start', look: 'start' }, now: { run: 1 } },
      { d: 5, cam: 'isolator', say: 'Not round the whole cable: three currents in one clamp add up to zero. One core at a time, in the starter.', tool: { R: 'clamp' }, pose: { at: ISO, face: Math.PI, R: 'cores', look: 'cores' }, now: { clamp: '1.9 A' } },
      { d: 3, cam: 'isolator', say: '1.9, 1.9, 2.0 amps. Balanced.', pose: { at: ISO, face: Math.PI, R: 'cores', look: 'cores' }, now: { clamp: '2.0 A' } },
      { d: 3, cam: 'wide', tool: {}, pose: { at: BENCH, face: 0, walk: true, look: 'shaftTip' }, now: { clamp: '' } },
      { d: 5.5, cam: 'cut', say: 'Inside, the field turns at 1500. The rotor chases it and never quite catches up. That gap is the slip, and the slip is the torque.', pose: at(BENCH, { look: 'box', mood: 'content' }), now: { cut: 1, field: 1, phases: 1 } },
      { d: 4.5, cam: 'face', say: 'Quiet, balanced, cool. That one goes back to the pump room.', pose: at(BENCH, { look: 'cam', mood: 'smile' }), now: { cut: 0, field: 0, phases: 0 } },
    ],
  },
];

// Defaults for the world state the beats change.
export const START = { iso: 0, lock: 0, lid: 0, links: 0, linksOff: 0, shaft: 0, fins: 1, grille: 1, cut: 0, field: 0, phases: 0, run: 0, dti: 0, led: 0, tester: '', meter: '', clamp: '' };
