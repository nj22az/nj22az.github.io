// Isolationslabbet · beräkningsmodell.
// Del 1: isolerat trefasnät (IT) ombord. Varje fas har en isolationsresistans R och en nätkapacitans C mot skrovet.
// Skrovets potential räknas med Millmans sats. Isolationsövervakningen mäter med likspänning och ser därför bara R.
// Del 2: isolationsprovning av ett frånskilt objekt med provspänning (R = Uprov / Iläck).

const c = (re, im = 0) => ({ re, im });
const add = (a, b) => c(a.re + b.re, a.im + b.im);
const sub = (a, b) => c(a.re - b.re, a.im - b.im);
const mul = (a, b) => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const div = (a, b) => { const d = b.re * b.re + b.im * b.im; return c((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
export const abs = (a) => Math.hypot(a.re, a.im);
const polar = (m, deg) => c(m * Math.cos(deg * Math.PI / 180), m * Math.sin(deg * Math.PI / 180));

export const R_SOLID = 0.01; // "fullständigt jordfel" räknas som 0,01 Ω så att divisionen går
export const SOLID_LIMIT = 10; // Ω. Så låg resistans räknas som fullständigt jordfel i modellen
export const PHASES = ['L1', 'L2', 'L3'];

/** IT-nät: s = { UL, f, R: [R1, R2, R3] i Ω, C: kapacitans per fas i F, larm: larmgräns i Ω, Rloop: slingresistans vid dubbelfel i Ω } */
export function itNet(s) {
  const UF = s.UL / Math.sqrt(3), w = 2 * Math.PI * s.f;
  const V = [polar(UF, 0), polar(UF, -120), polar(UF, 120)];
  const R = s.R.map((r) => Math.max(r, R_SOLID));
  const Y = R.map((r) => c(1 / r, w * s.C));
  let num = c(0), den = c(0);
  for (let i = 0; i < 3; i++) { num = add(num, mul(Y[i], V[i])); den = add(den, Y[i]); }
  const Vh = div(num, den); // skrovets potential relativt källans stjärnpunkt
  const U = V.map((v) => sub(v, Vh)); // fas mot skrov
  const Ures = U.map((u, i) => abs(u) / R[i]); // ström genom varje isolationsresistans
  const Iphase = U.map((u, i) => abs(mul(u, Y[i]))); // total läckström per fas (resistiv + kapacitiv)
  const Riso = 1 / R.reduce((sum, r) => sum + 1 / r, 0); // det isolationsövervakningen mäter (DC)
  const worst = R.indexOf(Math.min(...R));
  const solid = R.map((r, i) => (r <= SOLID_LIMIT ? i : -1)).filter((i) => i >= 0);
  const second = solid.length >= 2 ? { phases: solid.slice(0, 2), I: s.UL / (s.R[solid[0]] + s.R[solid[1]] + (s.Rloop ?? 0.08)) } : null;
  return {
    UF, Uhull: U.map(abs), Vstar: abs(Vh), Riso, alarm: Riso < s.larm,
    Ifault: Ures[worst], faultPhase: worst, Iphase, second,
  };
}

/** Objekt för isolationsprovning. Värdena är isolationsresistans i Ω mellan ledare och PE, och mellan faserna. */
export const OBJECTS = {
  'motor-m3': { name: 'Motor M3 med kabel (stationens objekt)', R: { 'L1-PE': 45e6, 'L2-PE': 38e6, 'L3-PE': 0.6e6, 'L1-L2': 120e6, 'L2-L3': 2.5e6, 'L3-L1': 2.8e6 } },
  'motor-torr': { name: 'Motor, torr och hel', R: { 'L1-PE': 200e6, 'L2-PE': 180e6, 'L3-PE': 220e6, 'L1-L2': 500e6, 'L2-L3': 480e6, 'L3-L1': 510e6 } },
  'motor-fukt': { name: 'Motor som stått i fukt', R: { 'L1-PE': 1.25e6, 'L2-PE': 1.1e6, 'L3-PE': 1.3e6, 'L1-L2': 6e6, 'L2-L3': 5.5e6, 'L3-L1': 6.2e6 } },
  'kabel-skadad': { name: 'Kabel med skadad mantel', R: { 'L1-PE': 150e6, 'L2-PE': 0.05e6, 'L3-PE': 140e6, 'L1-L2': 300e6, 'L2-L3': 0.4e6, 'L3-L1': 290e6 } },
};
export const PAIRS = ['L1-PE', 'L2-PE', 'L3-PE', 'L1-L2', 'L2-L3', 'L3-L1'];
export const METER_MAX = 999e6; // instrumentets största visning

/** Isolationsprovning. s = { obj, par, Uprov, frans } */
export function insulationTest(s) {
  if (!s.frans) return { error: 'Provningen startar inte. Objektet ska vara frånskilt, låst och kontrollerat spänningslöst först. Provspänningen kan annars skada utrustning och ge fel resultat.' };
  const R = OBJECTS[s.obj].R[s.par];
  const I = s.Uprov / R;
  return { R, I, over: R > METER_MAX };
}

export function fmt(value, digits = 3) {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  const a = Math.abs(value); if (a < 1e-12) return '0';
  let d = Math.max(0, Math.min(4, digits - 1 - Math.floor(Math.log10(a))));
  let v = Number(value.toFixed(d));
  if (d > 0 && Math.abs(v) >= 10 ** (digits - d)) { d -= 1; v = Number(value.toFixed(d)); }
  return v.toLocaleString('sv-SE', { minimumFractionDigits: d, maximumFractionDigits: d });
}
/** Resistans med lämpligt prefix: 1,25 MΩ, 117 kΩ, 0,01 Ω. */
export function fmtR(r) {
  if (r <= R_SOLID) return '0 Ω';
  if (r >= 1e6) return `${fmt(r / 1e6)} MΩ`;
  if (r >= 1e3) return `${fmt(r / 1e3)} kΩ`;
  return `${fmt(r)} Ω`;
}
export function fmtI(i) {
  if (i >= 1) return `${fmt(i)} A`;
  if (i >= 1e-3) return `${fmt(i * 1e3)} mA`;
  return `${fmt(i * 1e6)} µA`;
}
export function parseAnswer(text) {
  if (typeof text !== 'string') return NaN;
  const t = text.trim().replace(/\s| | /g, '').replace(/[−–]/g, '-').replace(',', '.');
  if (!/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(t)) return NaN;
  return Number(t);
}
export function isClose(answer, expected, { rel = 0.02, abs: a = 0.01 } = {}) {
  return Number.isFinite(answer) && Math.abs(answer - expected) <= Math.max(a, Math.abs(expected) * rel);
}
