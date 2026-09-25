// Hållkretslabbet · beräkningsmodell för en hållkrets i likspänning.
// Noder: P (+U), a (efter S0), b (spolens matningssida), c (spolens retursida), N (0 V).
// Kontakterna är ideala brytare. Spolen är kretsens enda resistans.

export const NODES = ['P', 'a', 'b', 'c', 'N'];
export const FAULTS = ['ingen', 's0', 'hall', 'spole', 'retur'];

/** Slutna förbindelser för ett visst K1-läge. */
function links(s, k1) {
  const L = [];
  if (s.supply !== false) L.push(['P', 'src']);                       // matningen ansluten till P
  if (!s.s0 && s.fault !== 's0') L.push(['P', 'a']);                  // S0 STOPP, NC
  if (s.s1) L.push(['a', 'b']);                                       // S1 START, NO
  if (k1 && s.fault !== 'hall') L.push(['a', 'b']);                   // K1 hjälpkontakt, NO
  if (s.fault !== 'retur') L.push(['c', 'N']);                        // returledare
  return L;
}
function groups(L) {
  const parent = {}; const f = (x) => (parent[x] ??= x) === x ? x : (parent[x] = f(parent[x]));
  for (const n of [...NODES, 'src']) f(n);
  for (const [x, y] of L) parent[f(x)] = f(y);
  return f;
}
/** Potentialer (V) för ett K1-läge. NaN betyder flytande nod (inget definierat värde). */
export function potentials(s, k1) {
  const U = s.U ?? 24; const f = groups(links(s, k1));
  const V = {}; for (const n of NODES) V[n] = f(n) === f('src') ? U : f(n) === f('N') ? 0 : NaN;
  let I = 0;
  if (s.fault !== 'spole') {
    // spolen är en resistans mellan b och c: utan ström får en flytande sida samma potential som den andra
    if (Number.isFinite(V.b) && Number.isFinite(V.c)) I = (V.b - V.c) / (s.R ?? 480);
    else if (Number.isFinite(V.b)) V.c = V.b; else if (Number.isFinite(V.c)) V.b = V.c;
    // noder i samma grupp följer med
    for (const n of NODES) { if (!Number.isFinite(V[n])) { if (f(n) === f('b')) V[n] = V.b; else if (f(n) === f('c')) V[n] = V.c; } }
  }
  return { V, I };
}
/** Stabilt läge: K1 drar när spolen får ström och släpper utan ström. prevK1 ger hållningen. */
export function solve(s, prevK1 = false) {
  let k1 = prevK1;
  for (let i = 0; i < 4; i++) {
    const { I } = potentials(s, k1); const energized = I > 1e-9;
    if (energized === k1) break; k1 = energized;
  }
  const { V, I } = potentials(s, k1);
  return { V, I, k1 };
}
/** Voltmeter mellan röd och svart mätsond. NaN om någon punkt flyter. */
export const meter = (V, red, black) => V[red] - V[black];

export function fmt(value, digits = 3) {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  const abs = Math.abs(value); if (abs < 1e-9) return '0';
  let decimals = Math.max(0, Math.min(4, digits - 1 - Math.floor(Math.log10(abs))));
  let v = Number(value.toFixed(decimals));
  if (decimals > 0 && Math.abs(v) >= 10 ** (digits - decimals)) { decimals -= 1; v = Number(value.toFixed(decimals)); }
  return v.toLocaleString('sv-SE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
export function parseAnswer(text) {
  if (typeof text !== 'string') return NaN;
  const cleaned = text.trim().replace(/\s| | /g, '').replace(/[−–]/g, '-').replace(',', '.');
  if (!/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(cleaned)) return NaN;
  return Number(cleaned);
}
export function isClose(answer, expected, { rel = 0.02, abs = 0.05 } = {}) {
  if (!Number.isFinite(answer)) return false;
  return Math.abs(answer - expected) <= Math.max(abs, Math.abs(expected) * rel);
}
