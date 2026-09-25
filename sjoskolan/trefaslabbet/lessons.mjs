// Trefaslabbet · avläsningar och förutsägelseuppgifter
import { neutralCurrent, starLoads, symmetricLoad, phaseFromLine, motorConnection, windingRatio } from './model.mjs';

export const PLATES = { ingen: null, '230/400': [230, 400], '400/690': [400, 690], '440/760': [440, 760] };

// Startvärden som inte sammanfaller med presentationernas övningar eller exempel
export const DEFAULTS = {
  visare: { UL: 400, f: 50, I1: 12, I2: 9, I3: 6, phi: 0 },
  neutral: { UL: 400, R1: 46, R2: 23, R3: 92, on1: true, on2: true, on3: true, neutral: true },
  ydelta: { UL: 440, Z: 22, pf: 0.85, conn: 'Δ', plate: '440/760' },
};

export function readouts(tab, s) {
  if (tab === 'visare') {
    const n = neutralCurrent([{ I: s.I1, phi: s.phi }, { I: s.I2, phi: s.phi }, { I: s.I3, phi: s.phi }]);
    return { UL: s.UL, UF: phaseFromLine(s.UL), dt: 1000 / s.f / 3, IN: n.IN, INangle: n.angle, phasors: n.phasors };
  }
  if (tab === 'neutral') {
    const R = [s.R1, s.R2, s.R3].map((r, k) => (s[`on${k + 1}`] === false ? Infinity : r));
    const r = starLoads({ UL: s.UL, R, neutral: s.neutral });
    return { UF: r.UF, U1: r.Uabs[0], U2: r.Uabs[1], U3: r.Uabs[2], I1: r.Iabs[0], I2: r.Iabs[1], I3: r.Iabs[2], IN: r.IN, shift: r.shift, P: r.P, raw: r };
  }
  const r = symmetricLoad({ UL: s.UL, Z: s.Z, pf: s.pf, conn: s.conn });
  if (!PLATES[s.plate]) return { ...r, PkW: r.P / 1000, right: null, ratio: null };
  const [Ulow, Uhigh] = PLATES[s.plate];
  const right = motorConnection({ Ulow, Uhigh, UL: s.UL });
  return { ...r, PkW: r.P / 1000, right, ratio: windingRatio({ Ulow, UL: s.UL, conn: s.conn }) };
}

export const CHALLENGES = [
  {
    id: 'uf', tab: 'visare', title: 'Fasspänning vid 690 V', deck: 'v41_01 · bild 7 och övning 3',
    setup: { UL: 690, f: 60, I1: 12, I2: 9, I3: 6, phi: 0 },
    task: 'Ett 690 V-nät ombord är symmetriskt. Beräkna fasspänningen Uꜰ, det vill säga spänningen över en generatorlindning i Y.',
    ask: { key: 'UF', label: 'Uꜰ', unit: 'V', rel: 0.01 }, mask: ['UF'],
    solution: 'Uꜰ = Uᴸ/√3 = 690/1,732 ≈ 398 V.',
    hint: 'Uꜰ = Uᴸ/√3.',
    mistakes: () => [{ v: 690 * Math.sqrt(3), msg: 'Du har multiplicerat med √3. Fasspänningen är mindre än linjespänningen.' }, { v: 345, msg: 'Du har delat med 2. Faktorn är √3, inte 2.' }],
  },
  {
    id: 'in2', tab: 'visare', title: 'Två lika faslaster', deck: 'v41_01 · bild 24 och övning 8',
    setup: { UL: 400, f: 50, I1: 12, I2: 12, I3: 0, phi: 0 },
    task: 'I₁ = I₂ = 12 A med 120° emellan. I₃ = 0. Beräkna neutralströmmens belopp.',
    ask: { key: 'IN', label: '|Iɴ|', unit: 'A', rel: 0.01 }, mask: ['IN', 'sumValues'],
    solution: 'Iɴ = √(12² + 12² + 2·12·12·(−0,5)) = √144 = 12 A. Två lika strömmar 120° isär ger en summa lika stor som var och en.',
    hint: 'Iɴ = √(I₁² + I₂² + 2I₁I₂ cos 120°) och cos 120° = −0,5.',
    mistakes: () => [{ v: 24, msg: 'Du har adderat beloppen. Strömmarna är visare med 120° mellan sig.' }, { v: 0, msg: 'Neutralströmmen blir noll bara när alla tre faser är lika belastade.' }],
  },
  {
    id: 'in3', tab: 'visare', title: 'Osymmetrisk last', deck: 'v41_01 · bild 22 och övning 6–8',
    setup: { UL: 400, f: 50, I1: 12, I2: 8, I3: 8, phi: 0 },
    task: 'I₁ = 12 A, I₂ = I₃ = 8 A, alla resistiva. Beräkna neutralströmmens belopp.',
    ask: { key: 'IN', label: '|Iɴ|', unit: 'A', rel: 0.01 }, mask: ['IN', 'sumValues'],
    solution: '8 A i alla tre faser tar ut varandra. Kvar blir 12 − 8 = 4 A i L1, alltså Iɴ = 4 A.',
    hint: 'Den symmetriska delen (8 A i varje fas) ger noll. Det som blir kvar är överskottet i L1.',
    mistakes: () => [{ v: 28, msg: 'Du har adderat beloppen. Summan måste göras med visare.' }],
  },
  {
    id: 'bruten', tab: 'neutral', title: 'Bruten neutralledare', deck: 'v41_01 · bild 22 och övning 10',
    setup: { UL: 400, R1: 23, R2: 46, R3: 92, on1: true, on2: true, on3: false, neutral: false },
    task: 'Två laster, 23 Ω på L1 och 46 Ω på L2, har gemensam stjärnpunkt. L3 är obelastad och neutralledaren är bruten. Beräkna spänningen över lasten på L2.',
    ask: { key: 'U2', label: 'U över 46 Ω', unit: 'V', rel: 0.01 }, mask: ['U1', 'U2', 'U3', 'I1', 'I2', 'shift', 'phasorValues'],
    solution: 'Lasterna ligger i serie över Uᴸ = 400 V. I = 400/(23 + 46) ≈ 5,80 A. U över 46 Ω = 5,80 · 46 ≈ 267 V, mer än Uꜰ = 231 V.',
    hint: 'Utan neutralledare ligger de två lasterna i serie mellan L1 och L2, alltså över 400 V. Dela spänningen i förhållande till resistanserna.',
    mistakes: () => [{ v: 400 / Math.sqrt(3), msg: 'Det gäller bara med hel neutralledare. Nu ligger lasterna i serie över linjespänningen.' }, { v: 400 * 23 / 69, msg: 'Det är spänningen över 23 Ω-lasten. Frågan gäller lasten på 46 Ω.' }],
  },
  {
    id: 'inr', tab: 'neutral', title: 'Neutralström med två laster', deck: 'v41_01 · bild 21–22',
    setup: { UL: 400, R1: 23, R2: 46, R3: 92, on1: true, on2: true, on3: false, neutral: true },
    task: 'Samma två laster, nu med hel neutralledare. Beräkna neutralströmmen.',
    ask: { key: 'IN', label: 'Iɴ', unit: 'A', rel: 0.02 }, mask: ['IN', 'I1', 'I2', 'phasorValues'],
    solution: 'I₁ = 231/23 ≈ 10,0 A och I₂ = 231/46 ≈ 5,02 A. Iɴ = √(10,0² + 5,02² + 2·10,0·5,02·(−0,5)) ≈ 8,69 A.',
    hint: 'Varje last får Uꜰ ≈ 231 V. Räkna I₁ och I₂ och summera dem som visare med 120° emellan.',
    mistakes: () => { const i1 = 400 / Math.sqrt(3) / 23, i2 = i1 / 2; return [{ v: i1 + i2, msg: 'Du har adderat beloppen. Strömmarna ligger 120° isär.' }, { v: i1 - i2, msg: 'Nästan: men vinkeln mellan strömmarna är 120°, inte 180°.' }]; },
  },
  {
    id: 'ystrom', tab: 'ydelta', title: 'Linjeström i Y', deck: 'v41_02 · övning 1–2',
    setup: { UL: 690, Z: 30, pf: 1, conn: 'Y', plate: 'ingen' },
    task: 'Tre lika resistorer på 30 Ω kopplas i Y till 690 V linjespänning. Beräkna linjeströmmen.',
    ask: { key: 'IL', label: 'Iᴸ', unit: 'A', rel: 0.01 }, mask: ['IL', 'Igren', 'Ugren', 'S', 'P', 'Q', 'PkW'],
    solution: 'Ugren = 690/√3 ≈ 398 V. Iᴸ = Igren = 398/30 ≈ 13,3 A.',
    hint: 'Ugren = Uᴸ/√3. I Y är linjeströmmen lika med grenströmmen.',
    mistakes: () => [{ v: 690 / 30, msg: 'Du har lagt hela linjespänningen över en gren. I Y får grenen Uᴸ/√3.' }],
  },
  {
    id: 'dstrom', tab: 'ydelta', title: 'Linjeström i Δ', deck: 'v41_02 · bild 7 och övning 3',
    setup: { UL: 690, Z: 46, pf: 1, conn: 'Δ', plate: 'ingen' },
    task: 'Tre lika resistorer på 46 Ω kopplas i Δ till 690 V. Beräkna linjeströmmen.',
    ask: { key: 'IL', label: 'Iᴸ', unit: 'A', rel: 0.01 }, mask: ['IL', 'Igren', 'S', 'P', 'Q', 'PkW'],
    solution: 'Ugren = Uᴸ = 690 V. Igren = 690/46 = 15 A. Iᴸ = √3 · 15 ≈ 26,0 A.',
    hint: 'I Δ ligger hela Uᴸ över grenen. Linjeströmmen är √3 gånger grenströmmen.',
    mistakes: () => [{ v: 15, msg: 'Det är grenströmmen. Linjeströmmen i Δ är √3 gånger större.' }, { v: 15 * 3, msg: 'Faktorn är √3, inte 3.' }],
  },
  {
    id: 'p3', tab: 'ydelta', title: 'Trefaseffekt', deck: 'v41_02 · bild 8 och övning 4',
    setup: { UL: 440, Z: 30.48, pf: 0.85, conn: 'Δ', plate: '440/760' },
    task: 'En symmetrisk last ombord: Uᴸ = 440 V, Iᴸ = 25 A och cos φ = 0,85. Beräkna aktiv effekt i kW.',
    ask: { key: 'PkW', label: 'P', unit: 'kW', rel: 0.02 }, mask: ['S', 'P', 'Q', 'PkW'],
    solution: 'P = √3 · 440 · 25 · 0,85 ≈ 16 190 W ≈ 16,2 kW.',
    hint: 'P = √3 · Uᴸ · Iᴸ · cos φ. Dela med 1 000 för kW.',
    mistakes: () => [{ v: 440 * 25 * 0.85 / 1000, msg: 'Faktorn √3 saknas. Den behövs när linjevärden används.' }, { v: 3 * 440 * 25 * 0.85 / 1000, msg: 'Med linjespänning används √3, inte 3. Faktorn 3 gäller fasvärden.' }],
  },
];

export function expected(c) {
  const v = readouts(c.tab, c.setup)[c.ask.key];
  return c.ask.absolute ? Math.abs(v) : v;
}
