// Motorlabbet: räknemodellen bakom den simulerade labbstationen vecka 41 (motorn, startaren och strömtången).
// Motorn och startaren är övningsobjekt som aldrig ansluts. Multimetern mäter resistans med egen mätström,
// tången mäter likström från ett strömbegränsat DC-aggregat (skyddsklenspänning).
// Inga egna värden för den fysiska motorn: lindningsresistansen räknas fram ur elevens D, så att varje elev får egna tal.

export const PLINT = ['W2', 'U2', 'V2', 'U1', 'V1', 'W1'];          // övre rad, sedan undre rad (som i plinten)
export const TERMINALER = [...PLINT, 'PE'];
export const LINDNINGAR = { U: ['U1', 'U2'], V: ['V1', 'V2'], W: ['W1', 'W2'] };
// Möjliga bleck: två längs övre raden (Y) och tre lodräta (Δ).
export const BLECK = ['W2-U2', 'U2-V2', 'U1-W2', 'V1-U2', 'W1-V2'];
export const Y = ['W2-U2', 'U2-V2'];
export const DELTA = ['U1-W2', 'V1-U2', 'W1-V2'];
export const SLADDAR = 0.3;                                          // mätsladdarnas resistans, Ω
export const OL = Infinity;

/** Lindningarnas resistans ur D (1–31): 3,0–6,0 Ω, med små skillnader mellan lindningarna som i en verklig motor. */
export function lindningar(D) {
  const d = Number.isInteger(D) && D >= 1 && D <= 31 ? D : 16;
  const bas = 3.0 + ((d * 7) % 31) * 0.1;
  const avv = [((d % 5) - 2) * 0.006, ((d % 3) - 1) * 0.008, ((d % 7) - 3) * 0.004];
  const r = (x) => Math.round(x * 100) / 100;
  return { U: r(bas * (1 + avv[0])), V: r(bas * (1 + avv[1])), W: r(bas * (1 + avv[2])) };
}

/**
 * Resistansen mellan två plintar.
 * bleck: de bleck som ligger i plinten. lösa: bleck som ligger där men saknar kontakt (lös mutter).
 * Returnerar OL (Infinity) när det inte finns någon väg. PE är skild från lindningarna (isolationen).
 */
export function resistans(a, b, R, bleck = [], losa = []) {
  if (a === b) return 0;
  if (a === 'PE' || b === 'PE') return OL;
  // Slå ihop plintar som förbinds av bleck med kontakt.
  const rot = Object.fromEntries(PLINT.map((t) => [t, t]));
  const hitta = (t) => (rot[t] === t ? t : (rot[t] = hitta(rot[t])));
  for (const x of bleck) {
    if (losa.includes(x)) continue;
    const [p, q] = x.split('-'); rot[hitta(p)] = hitta(q);
  }
  const noder = [...new Set(PLINT.map(hitta))];
  const idx = Object.fromEntries(noder.map((n, i) => [n, i]));
  const n = noder.length;
  const G = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const [namn, [p, q]] of Object.entries(LINDNINGAR)) {
    const i = idx[hitta(p)], j = idx[hitta(q)];
    if (i === j) continue;                                            // kortsluten lindning
    const g = 1 / R[namn];
    G[i][i] += g; G[j][j] += g; G[i][j] -= g; G[j][i] -= g;
  }
  const A = idx[hitta(a)], B = idx[hitta(b)];
  if (A === B) return 0;
  // Noder som inte hänger ihop med B tas bort; når A inte B finns ingen väg.
  const nar = new Set([B]); let andrad = true;
  while (andrad) {
    andrad = false;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
      if (G[i][j] !== 0 && nar.has(i) && !nar.has(j)) { nar.add(j); andrad = true; }
  }
  if (!nar.has(A)) return OL;
  const hall = [...nar].filter((i) => i !== B);                      // B är jord
  const M = hall.map((i) => hall.map((j) => G[i][j]));
  const I = hall.map((i) => (i === A ? 1 : 0));
  const x = los(M, I);
  return x[hall.indexOf(A)];
}

function los(M, v) {
  const n = v.length, a = M.map((r, i) => [...r, v[i]]);
  for (let k = 0; k < n; k++) {
    let p = k; for (let i = k + 1; i < n; i++) if (Math.abs(a[i][k]) > Math.abs(a[p][k])) p = i;
    [a[k], a[p]] = [a[p], a[k]];
    for (let i = k + 1; i < n; i++) { const f = a[i][k] / a[k][k]; for (let j = k; j <= n; j++) a[i][j] -= f * a[k][j]; }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = a[i][n]; for (let j = i + 1; j < n; j++) s -= a[i][j] * x[j]; x[i] = s / a[i][i]; }
  return x;
}

/** Vad multimetern visar: resistansen plus sladdarna, avrundad till 0,1 Ω (200 Ω-området). OL vid ingen väg. */
export function avlasning(r, sladdar = SLADDAR) {
  if (!Number.isFinite(r)) return 'OL';
  return (Math.round((r + sladdar) * 10) / 10).toFixed(1).replace('.', ',');
}

// Startaren (spänningslös). Kontaktorn är opåverkad. Överlastreläet kan lösas ut med testknappen.
export const STARTARE = ['A1', 'A2', '1', '2', '3', '4', '5', '6', '13', '14', '95', '96', '97', '98'];
export const SPOLE = 870;                                            // spolens resistans i simuleringen, Ω
const PAR = { 'A1-A2': 'spole', '1-2': 'NO', '3-4': 'NO', '5-6': 'NO', '13-14': 'NO', '95-96': 'NC', '97-98': 'NO-larm' };
export function startareResistans(a, b, utlost = false) {
  if (a === b) return 0;
  const k = PAR[`${a}-${b}`] ?? PAR[`${b}-${a}`];
  if (!k) return OL;
  if (k === 'spole') return SPOLE;
  if (k === 'NC') return utlost ? OL : 0.1;
  if (k === 'NO-larm') return utlost ? 0.1 : OL;
  return OL;                                                          // NO och huvudkontakter: öppna när kontaktorn är opåverkad
}

// Tångstationen: aggregatet i strömbegränsning driver I genom en labbsladd.
export const TANG_LAGEN = { ute: 0, en: 1, tva: 2, harnal: 0 };
export const NOLLFEL = 0.04;                                          // tångens nollpunktsfel innan den nollställs, A
export function tang(lage, I = 2.0, pa = true, nollstalld = false) {
  const genom = pa ? TANG_LAGEN[lage] * I : 0;
  const v = genom + (nollstalld ? 0 : NOLLFEL);
  return (Math.round(v * 100) / 100).toFixed(2).replace('.', ',');
}

// Felsökningen: ett fel per elev, valt ur D. Motorn ska vara Δ-kopplad.
export const FEL = [
  { id: 'saknas', bleck: ['V1-U2', 'W1-V2'], losa: [], text: 'Ett bleck saknas: U1–W2.' },
  { id: 'y', bleck: [...Y], losa: [], text: 'Blecken ligger för Y fast motorn ska vara Δ-kopplad.' },
  { id: 'los', bleck: [...DELTA], losa: ['V1-U2'], text: 'Muttern på blecket V1–U2 sitter löst: blecket syns men har ingen kontakt.' },
];
export const felFor = (D) => FEL[((Number.isInteger(D) ? D : 1) - 1) % FEL.length];
/** Är plinten en hel Δ-koppling med kontakt i alla tre bleck och inga andra? */
export function helDelta(bleck, losa) {
  return DELTA.every((x) => bleck.includes(x) && !losa.includes(x)) && bleck.every((x) => DELTA.includes(x));
}
