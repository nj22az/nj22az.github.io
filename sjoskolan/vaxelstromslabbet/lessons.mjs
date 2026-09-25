// Växelströmslabbet · avläsningar och förutsägelseuppgifter
import { waveform, instant, phaseFromDelay, seriesCircuit, loadPower } from './model.mjs';

export const DEFAULTS = {
  // Startvärden som inte sammanfaller med presentationernas övningar
  sinus: { shape: 'sinus', urms: 15, f: 60, t: 3, showB: false, dt: 3, window: 'auto' },
  impedans: { kind: 'RL', U: 120, f: 60, R: 25, L: 80, C: 150 },
  effekt: { U: 230, f: 60, P: 1500, pf: 0.7, character: 'induktiv', Qc: 0, Rcable: 0.2 },
};

/** Alla avläsningar för en flik. Tider i ms, L i mH, C i µF i tillståndet. */
export function readouts(tab, s) {
  if (tab === 'sinus') {
    const w = waveform({ urms: s.urms, f: s.f, shape: s.shape });
    const t = s.t / 1000;
    return {
      peak: w.peak, pp: w.pp, rms: w.rms, mean: 0, T: w.T * 1000, f: s.f,
      ut: instant(s, t),
      phi: s.showB ? phaseFromDelay(s.dt / 1000, s.f) : null,
    };
  }
  if (tab === 'impedans') {
    return seriesCircuit({ kind: s.kind, U: s.U, f: s.f, R: s.R, L: s.L / 1000, C: s.C / 1e6 });
  }
  const r = loadPower(s);
  return {
    S: r.S, Q: r.Q, I: r.I, phi: r.phi, loss: r.loss,
    Q2: r.after.Q, S2: r.after.S, I2: r.after.I, PF2: r.after.PF, loss2: r.after.loss,
    character2: r.after.character, QcFull: r.QcFull,
  };
}

// Talen skiljer sig från presentationernas övningar, så att inlämningsuppgifterna förblir elevens egna.
export const CHALLENGES = [
  {
    id: 'period', tab: 'sinus', title: 'Period vid 400 Hz', deck: 'v40_01 · bild 7 och övning 1',
    setup: { shape: 'sinus', urms: 115, f: 400, t: 0.5, showB: false, dt: 0.5, window: 'auto' },
    task: 'Vissa fartyg har ett separat 400 Hz-nät för elektronik. Beräkna perioden T i millisekunder.',
    ask: { key: 'T', label: 'T', unit: 'ms', rel: 0.01 },
    mask: ['T', 'ticks'],
    hint: 'T = 1/f. Svaret i sekunder multipliceras med 1 000 för att få ms.',
    mistakes: () => [{ v: 400 / 1000, msg: 'Du har räknat f/1 000. Perioden är 1/f.' }],
  },
  {
    id: 'topp', tab: 'sinus', title: 'Toppvärde från effektivvärde', deck: 'v40_01 · bild 8 och övning 3',
    setup: { shape: 'sinus', urms: 24, f: 50, t: 5, showB: false, dt: 3, window: 'auto' },
    task: 'En sinusspänning har effektivvärdet 24 V. Beräkna toppvärdet û.',
    ask: { key: 'peak', label: 'û', unit: 'V', rel: 0.01 },
    mask: ['peak', 'pp', 'ut', 'scale'],
    hint: 'û = √2 · U. Toppvärdet ska bli större än effektivvärdet.',
    mistakes: () => [{ v: 48, msg: 'Du har räknat topp till topp (2 · û). Toppvärdet är √2 · U.' }],
  },
  {
    id: 'moment', tab: 'sinus', title: 'Momentanvärde', deck: 'v40_01 · övning 6–7',
    setup: { shape: 'sinus', urms: 10, f: 50, t: 3, showB: false, dt: 3, window: 'auto' },
    task: 'U = 10 V RMS, f = 50 Hz. Beräkna u vid t = 3,0 ms. Räknaren i RAD.',
    ask: { key: 'ut', label: 'u(3,0 ms)', unit: 'V', rel: 0.02, abs: 0.05 },
    mask: ['ut', 'peak', 'pp', 'scale'],
    hint: 'Beräkna först û = √2 · U. Sedan u = û · sin(2π · 50 · 0,003).',
    mistakes: () => [
      { v: 10 * Math.sin(2 * Math.PI * 50 * 0.003), msg: 'Du har använt effektivvärdet 10 V som amplitud. Amplituden är û = √2 · U.' },
      { v: 10, msg: 'Det är effektivvärdet. Momentanvärdet beror på tiden: u = û · sin(2πft).' },
      { v: 10 * Math.SQRT2, msg: 'Det är toppvärdet û. Multiplicera med sin(2πft) för tiden 3,0 ms.' },
      { v: 10 * Math.SQRT2 * Math.sin((2 * Math.PI * 50 * 0.003 * Math.PI) / 180), msg: 'Räknaren står i DEG. Vinkeln 2πft är i radianer, ställ räknaren i RAD.' },
    ],
  },
  {
    id: 'fas', tab: 'sinus', title: 'Fas från tidsavstånd', deck: 'v40_01 · bild 22 och övning 8',
    setup: { shape: 'sinus', urms: 12, f: 50, t: 5, showB: true, dt: 2.5, window: 'auto' },
    task: 'Två 50 Hz-signaler är förskjutna 2,5 ms. Beräkna fasvinkelns belopp i grader.',
    ask: { key: 'phi', label: '|φ|', unit: '°', abs: 0.6, absolute: true },
    mask: ['phi'],
    hint: 'φ = 360° · Δt / T och T = 20 ms vid 50 Hz.',
    mistakes: () => [{ v: 2 * Math.PI * 0.0025 * 50, msg: 'Svaret är i radianer. Frågan gäller grader: φ = 360° · Δt/T.' }],
  },
  {
    id: 'xl', tab: 'impedans', title: 'Spolens reaktans', deck: 'v40_02 · bild 6 och övning 1',
    setup: { kind: 'RL', U: 100, f: 50, R: 30, L: 159, C: 150 },
    task: 'L = 159 mH och f = 50 Hz. Beräkna Xᴸ.',
    ask: { key: 'XL', label: 'Xᴸ', unit: 'Ω', rel: 0.02 },
    mask: ['XL', 'X', 'Z', 'I', 'phi', 'UR', 'UL'],
    hint: 'Xᴸ = 2πfL. Omvandla först mH till H.',
    mistakes: () => [{ v: 50 * 0.159, msg: 'Du har glömt 2π. Xᴸ = 2πfL.' }],
  },
  {
    id: 'strom', tab: 'impedans', title: 'Ström i RL-krets', deck: 'v40_02 · övning 3–4',
    setup: { kind: 'RL', U: 100, f: 50, R: 40, L: 95.5, C: 150 },
    task: 'U = 100 V RMS, R = 40 Ω och Xᴸ ≈ 30 Ω i serie. Beräkna strömmen I.',
    ask: { key: 'I', label: 'I', unit: 'A', rel: 0.02 },
    mask: ['Z', 'I', 'UR', 'UL', 'phasorValues'],
    hint: '|Z| = √(R² + Xᴸ²). Därefter I = U/|Z|. Addera inte R och Xᴸ direkt.',
    mistakes: () => [
      { v: 100 / 70, msg: 'Du har adderat R och Xᴸ direkt. De ligger 90° isär: |Z| = √(R² + Xᴸ²).' },
      { v: 100 / 40, msg: 'Du har bara räknat med R. Spolens reaktans begränsar också strömmen.' },
    ],
  },
  {
    id: 'rc', tab: 'impedans', title: 'Fasvinkel i RC-krets', deck: 'v40_02 · bild 21 och övning 7',
    setup: { kind: 'RC', U: 100, f: 50, R: 40, L: 80, C: 106.1 },
    task: 'R = 40 Ω och Xᶜ ≈ 30 Ω i serie. Beräkna fasvinkeln φ med tecken.',
    ask: { key: 'phi', label: 'φ', unit: '°', abs: 0.8 },
    mask: ['phi', 'phasorValues', 'character'],
    hint: 'X = −Xᶜ för kapacitiv reaktans. φ = arctan(X/R), räknaren i DEG.',
    mistakes: () => [
      { v: -Math.atan(30 / 40), msg: 'Svaret är i radianer. Ställ räknaren i DEG.' },
      { v: -Math.atan(40 / 30) * 180 / Math.PI, msg: 'Du har räknat arctan(R/X). Fasvinkeln är arctan(X/R).' },
    ],
  },
  {
    id: 'resonans', tab: 'impedans', title: 'Resonansfrekvens', deck: 'v40_02 · bild 23 och övning 10',
    setup: { kind: 'RLC', U: 100, f: 40, R: 20, L: 50, C: 150 },
    task: 'L = 50 mH och C = 150 µF. Vid vilken frekvens blir Xᴸ = Xᶜ?',
    ask: { key: 'f0', label: 'f₀', unit: 'Hz', rel: 0.02 },
    mask: ['f0', 'freqTicks'],
    hint: 'f₀ = 1/(2π√(LC)). Omvandla mH till H och µF till F först.',
    mistakes: () => [{ v: 1 / Math.sqrt(0.05 * 150e-6), msg: 'Du har glömt 2π. Svaret är vinkelfrekvensen ω₀ i rad/s, inte f₀ i Hz.' }],
    after: 'Dra nu i f-reglaget och se att strömmen blir störst vid f₀.',
  },
  {
    id: 'skenbar', tab: 'effekt', title: 'Skenbar effekt', deck: 'v40_03 · bild 6 och övning 3',
    setup: { U: 230, f: 60, P: 1200, pf: 0.75, character: 'induktiv', Qc: 0, Rcable: 0.2 },
    task: 'En pump tar P = 1 200 W vid PF = 0,75. Beräkna den skenbara effekten S.',
    ask: { key: 'S', label: 'S', unit: 'VA', rel: 0.01 },
    mask: ['S', 'I', 'Q', 'S2', 'I2', 'Q2', 'QcFull', 'triangleValues'],
    hint: 'S = P/PF.',
    mistakes: () => [{ v: 1200 * 0.75, msg: 'Du har multiplicerat med PF. S är större än P: S = P/PF.' }],
  },
  {
    id: 'reaktiv', tab: 'effekt', title: 'Reaktiv effekt', deck: 'v40_03 · bild 7 och övning 4',
    setup: { U: 230, f: 60, P: 1200, pf: 0.75, character: 'induktiv', Qc: 0, Rcable: 0.2 },
    task: 'Samma pump: P = 1 200 W och PF = 0,75. Beräkna den reaktiva effekten Q.',
    ask: { key: 'Q', label: 'Q', unit: 'var', rel: 0.01 },
    mask: ['Q', 'Q2', 'QcFull', 'triangleValues'],
    hint: 'Q = √(S² − P²) eller Q = P · tan φ.',
    mistakes: () => [{ v: 1600 - 1200, msg: 'Du har räknat S − P. Effekterna adderas som visare: Q = √(S² − P²).' }],
  },
  {
    id: 'matstrom', tab: 'effekt', title: 'Matningsström', deck: 'v40_03 · övning 6',
    setup: { U: 230, f: 60, P: 2300, pf: 0.5, character: 'induktiv', Qc: 0, Rcable: 0.2 },
    task: 'En last i byssan tar P = 2 300 W vid 230 V och PF = 0,50. Beräkna strömmen.',
    ask: { key: 'I', label: 'I', unit: 'A', rel: 0.01 },
    mask: ['I', 'I2', 'S', 'S2', 'loss', 'loss2', 'triangleValues'],
    hint: 'I = P/(U · PF).',
    mistakes: () => [{ v: 10, msg: 'Du har räknat P/U utan effektfaktorn. Strömmen bestäms av S: I = P/(U · PF).' }],
  },
  {
    id: 'kompensering', tab: 'effekt', title: 'Full kompensation', deck: 'v40_03 · bild 22 och övning 7',
    setup: { U: 230, f: 60, P: 2000, pf: 0.8, character: 'induktiv', Qc: 0, Rcable: 0.2 },
    task: 'P = 2 000 W, PF = 0,80 induktivt. Hur stor kapacitiv reaktiv effekt Qᶜ ger PF = 1? Ange beloppet.',
    ask: { key: 'QcFull', label: '|Qᶜ|', unit: 'var', rel: 0.01, absolute: true },
    mask: ['QcFull', 'Q', 'Q2', 'S', 'S2', 'triangleValues'],
    hint: 'Kompensationen ska ta ut lastens induktiva Q. Q = P · tan(arccos 0,80).',
    mistakes: () => [{ v: 2500, msg: 'Det är S, inte Q. Q = √(S² − P²).' }],
    after: 'Dra nu Qᶜ-reglaget till ditt svar och se PF och strömmen efter kompensering.',
  },
];

export function expected(challenge) {
  const v = readouts(challenge.tab, challenge.setup)[challenge.ask.key];
  return challenge.ask.absolute ? Math.abs(v) : v;
}
