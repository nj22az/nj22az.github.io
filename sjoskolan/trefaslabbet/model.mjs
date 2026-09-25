// Trefaslabbet · beräkningsmodell (symmetrisk källa, stationär sinus, ideala komponenter)
const SQ3 = Math.sqrt(3);
const RAD = Math.PI / 180;

// Komplexa tal som [re, im]
export const C = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
  mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
  div: (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; },
  abs: (a) => Math.hypot(a[0], a[1]),
  arg: (a) => Math.atan2(a[1], a[0]) / RAD,
  polar: (r, deg) => [r * Math.cos(deg * RAD), r * Math.sin(deg * RAD)],
};

/** Fasvinklar för L1, L2, L3 (grader). L1 som referens. */
export const PHASE = [0, -120, 120];

export function lineFromPhase(UF) { return UF * SQ3; }
export function phaseFromLine(UL) { return UL / SQ3; }

/**
 * Fasströmmar med belopp I (A) och fasförskjutning phi (grader, positiv = strömmen släpar).
 * Returnerar visarna och neutralströmmen IN = I1 + I2 + I3 (belopp och vinkel).
 */
export function neutralCurrent(currents) {
  const ph = currents.map(({ I, phi = 0 }, k) => C.polar(I, PHASE[k] - phi));
  const sum = ph.reduce(C.add, [0, 0]);
  return { phasors: ph, IN: C.abs(sum), angle: C.arg(sum) };
}

/**
 * Tre resistiva fas–neutral-laster (Ω, Infinity = frånkopplad) på en symmetrisk källa med linjespänning UL.
 * Med hel neutralledare får varje last Uꜰ. Med bruten neutral flyttar lastens stjärnpunkt (Millmans sats).
 */
export function starLoads({ UL, R, neutral = true }) {
  const UF = UL / SQ3;
  const E = PHASE.map((a) => C.polar(UF, a));
  const G = R.map((r) => (Number.isFinite(r) && r > 0 ? 1 / r : 0));
  let VN = [0, 0];
  if (!neutral) {
    const gs = G.reduce((a, b) => a + b, 0);
    VN = gs > 0 ? E.reduce((acc, e, k) => C.add(acc, [e[0] * G[k], e[1] * G[k]]), [0, 0]).map((v) => v / gs) : [0, 0];
  }
  const U = E.map((e) => C.sub(e, VN));
  const I = U.map((u, k) => [u[0] * G[k], u[1] * G[k]]);
  const IN = neutral ? C.abs(I.reduce(C.add, [0, 0])) : 0;
  return {
    UF, E, VN, shift: C.abs(VN), U, I,
    Uabs: U.map(C.abs), Iabs: I.map(C.abs), IN,
    P: I.reduce((s, i, k) => s + C.abs(i) ** 2 * (G[k] > 0 ? 1 / G[k] : 0), 0),
  };
}

/** Symmetrisk last i Y eller Δ med grenimpedans |Z| (Ω) och effektfaktor pf. */
export function symmetricLoad({ UL, Z, pf = 1, conn = 'Y' }) {
  const Ugren = conn === 'Y' ? UL / SQ3 : UL;
  const Igren = Ugren / Z;
  const IL = conn === 'Y' ? Igren : SQ3 * Igren;
  const S = SQ3 * UL * IL;
  const P = S * pf;
  const Q = S * Math.sin(Math.acos(Math.min(1, Math.max(0, pf))));
  return { Ugren, Igren, IL, S, P, Q };
}

/**
 * Motorns märkning Δ/Y Ulow/Uhigh mot nätets linjespänning.
 * Returnerar rätt koppling, eller null om ingen koppling passar (±10 %).
 */
export function motorConnection({ Ulow, Uhigh, UL }) {
  const ok = (a) => Math.abs(UL - a) <= a * 0.1;
  if (ok(Uhigh)) return 'Y';
  if (ok(Ulow)) return 'Δ';
  return null;
}
/** Lindningsspänning (relativt lindningens märkspänning Ulow) för vald koppling. */
export function windingRatio({ Ulow, UL, conn }) {
  return (conn === 'Δ' ? UL : UL / SQ3) / Ulow;
}

export function fmt(value, digits = 3) {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  if (!Number.isFinite(value)) return '∞';
  const abs = Math.abs(value);
  let decimals = abs === 0 ? 0 : Math.max(0, Math.min(4, digits - 1 - Math.floor(Math.log10(abs))));
  let v = Number(value.toFixed(decimals));
  if (decimals > 0 && Math.abs(v) >= 10 ** (digits - decimals)) { decimals -= 1; v = Number(value.toFixed(decimals)); }
  return v.toLocaleString('sv-SE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
export function parseAnswer(text) {
  if (typeof text !== 'string') return NaN;
  const cleaned = text.trim().replace(/\s| | /g, '').replace(/[−–]/g, '-').replace(',', '.');
  if (!/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(cleaned)) return NaN;
  return Number(cleaned);
}
export function isClose(answer, expected, { rel = 0.02, abs = 0 } = {}) {
  if (!Number.isFinite(answer)) return false;
  return Math.abs(answer - expected) <= Math.max(abs, Math.abs(expected) * rel);
}
