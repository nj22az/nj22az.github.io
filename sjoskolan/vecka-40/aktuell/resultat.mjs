// Resultatkoden för vecka 40. Eleven arbetar utan namn (D slumpas på enheten), skriver namnet på sidan Skicka resultat
// och får en QR-kod. Koden är en länk till lärarens larare/resultat.html; resultaten ligger komprimerade efter # och
// skickas aldrig till någon server. Här finns bara fälten och kodningen, inget facit: facit räknas i lärarsidan.
import {GUIDE_TASKS} from '../../vaxelstromslabbet/guided-lessons.mjs?v=20260930';
import {mittD} from '../../gemensamt/elevtal.mjs?v=20260930';
import {STUDY} from './arbetsrum.gen.mjs?v=20260927b';
import {STUDY_KEY, normalise, verifiedExercises} from './studieprogress.mjs?v=20260927b';

export const VECKA = 40;
export const SVARNYCKEL = 'sj-v40-svar';
export const LABBNYCKEL = 'sjoskolan-ac-grund-v3';
export const OVNINGSNYCKEL = 'sj-ovningar:/sjoskolan/vecka-40/aktuell/Formelstod_och_ovningar.html';
export const DELAR = ['v40_01', 'v40_02', 'v40_03'];
export const OVNINGAR_PER_DEL = 10;
export const LARARSIDA = '/sjoskolan/larare/resultat.html';

// Inlämningens svarsfält: [nyckel, storhet, enhet]. Samma ordning i lärarsidan. uppgift = sidans ankare (uppgift-N),
// nr = numret eleven ser (vecka 40: inlämning 4–6, efter frånskiljningens 1–3, se innehall/numrering.py).
export const SVAR = [
  { uppgift: 1, nr: 4, titel: 'Egen sinusspänning', falt: [
    ['u1_top', 'û, beräknat', 'V'], ['u1_upp', 'U_{pp}, beräknat', 'V'], ['u1_T', 'T, beräknad', 'ms'],
    ['u1_topL', 'û, avläst på oscilloskopet', 'V'], ['u1_TL', 'T, avläst på oscilloskopet', 'ms']] },
  { uppgift: 2, nr: 5, titel: 'Egen RL-last', falt: [
    ['u2_XL', 'X_{L}', 'Ω'], ['u2_Z', '|Z|', 'Ω'], ['u2_I', 'I', 'A'], ['u2_fi', 'φ', '°'], ['u2_I100', 'I vid 100 Hz', 'A']] },
  { uppgift: 3, nr: 6, titel: 'Effekt och kompensering', falt: [
    ['u3_S', 'S', 'kVA'], ['u3_Q', 'Q', 'kvar'], ['u3_I', 'I', 'A'], ['u3_QC', 'Q_{C} för cos φ = 0,95', 'kvar'],
    ['u3_Iny', 'I efter kompenseringen', 'A'], ['u3_forl', 'Ny kabelförlust i % av den tidigare', '%']] },
];

const las = (k, def) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? def; } catch { return def; } };
const kontrollerade = () => verifiedExercises(STUDY.tasks, normalise(las(STUDY_KEY, null)));
export const lasSvar = () => las(SVARNYCKEL, {});
export function sparaSvar(svar) { try { localStorage.setItem(SVARNYCKEL, JSON.stringify(svar)); } catch { /* privat läge */ } }

/** Tal som eleven skriver: komma eller punkt, mellanslag som tusentalsavgränsare. */
export function tal(s) {
  const t = String(s ?? '').trim().replace(/\s/g, '').replace(',', '.').replace('−', '-');
  if (!/^-?\d+(\.\d+)?$|^-?\.\d+$/.test(t)) return NaN;
  return Number(t);
}
const avrunda = (v) => Number(Number(v).toPrecision(5));
// Gränsen räknas i UTF-16-enheter, men ett Unicode-tecken får inte delas mitt i ett surrogatpar.
function korta(text, max) {
  if (text.length <= max) return text;
  if (max <= 0) return '';
  return text.slice(0, max - 1).replace(/[\uD800-\uDBFF]$/, '') + '…';
}

/** Vad som finns sparat på enheten, för sammanfattningen på elevsidan. */
export function lage() {
  const svar = lasSvar(), klara = kontrollerade(), labb = las(LABBNYCKEL, null);
  const rader = labb?.rows && typeof labb.rows === 'object' ? labb.rows : {};
  return {
    D: mittD(),
    svar: SVAR.map((u) => ({ ...u, ifyllda: u.falt.filter(([k]) => Number.isFinite(svar[k])).length })),
    ovningar: DELAR.map((d) => Array.from({ length: OVNINGAR_PER_DEL }, (_, i) => !!klara[`${d}-q${i + 1}`]).filter(Boolean).length),
    labb: { gjorda: GUIDE_TASKS.filter((t) => rader[t.id]?.measured).length, forklarade: GUIDE_TASKS.filter((t) => rader[t.id]?.explanation?.trim()).length, antal: GUIDE_TASKS.length, D: labb?.D ?? null },
  };
}

/** Resultaten som ett kompakt objekt. Förklaringarna kortas till max tecken var. */
export function samla(namn, max = 400) {
  const svar = lasSvar(), klara = kontrollerade(), labb = las(LABBNYCKEL, null);
  const s = {};
  for (const u of SVAR) for (const [k] of u.falt) if (Number.isFinite(svar[k])) s[k] = avrunda(svar[k]);
  const o = DELAR.map((d) => Array.from({ length: OVNINGAR_PER_DEL }, (_, i) => (klara[`${d}-q${i + 1}`] ? 1 : 0) << i).reduce((a, b) => a | b, 0));
  const rader = labb?.rows && typeof labb.rows === 'object' ? labb.rows : {};
  const g = GUIDE_TASKS.map((t) => {
    const r = rader[t.id];
    if (!r) return 0;
    const forsta = r.first || r.predicted || {};
    const text = String(r.explanation || '').trim().replace(/\s+/g, ' ');
    return [r.attempts || 0, t.fields.map(([k]) => (Number.isFinite(forsta[k]) ? avrunda(forsta[k]) : null)), r.measured ? 1 : 0, korta(text, max)];
  });
  const ut = { v: 1, w: VECKA, n: String(namn || '').trim().replace(/\s+/g, ' '), d: mittD(), t: Math.round(Date.now() / 60000), s, o, g };
  if (Number.isInteger(labb?.D) && labb.D !== ut.d) ut.gd = labb.D;
  return ut;
}

// base64url utan utfyllnad
const b64 = (u8) => { let s = ''; for (const b of u8) s += String.fromCharCode(b); return btoa(s).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''); };
const unb64 = (s) => { s = s.replaceAll('-', '+').replaceAll('_', '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); };
async function stream(u8, T) { return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new T('deflate-raw'))).arrayBuffer()); }

/** Kodar objektet till text för länken: z + komprimerat, eller j + okomprimerat om webbläsaren saknar komprimering. */
export async function koda(obj) {
  const u8 = new TextEncoder().encode(JSON.stringify(obj));
  if (typeof CompressionStream === 'function') {
    try { return 'z' + b64(await stream(u8, CompressionStream)); }
    catch { /* API kan finnas utan stöd för deflate-raw. Behåll då JSON-formatet. */ }
  }
  return 'j' + b64(u8);
}
export async function avkoda(text) {
  const t = String(text || '').trim();
  if (t[0] !== 'z' && t[0] !== 'j') throw new Error('okänt format');
  if (t[0] === 'z' && typeof DecompressionStream !== 'function') throw new Error('Webbläsaren saknar stöd för komprimerade resultatkoder.');
  let obj;
  try {
    const u8 = unb64(t.slice(1));
    const raw = t[0] === 'z' ? await stream(u8, DecompressionStream) : u8;
    obj = JSON.parse(new TextDecoder().decode(raw));
  } catch { throw new Error('Resultatkoden är skadad eller ofullständig.'); }
  if (obj?.v !== 1 || obj.w !== VECKA) throw new Error('fel version eller vecka');
  return obj;
}

/** Länken i QR-koden. Förklaringarna kortas tills länken ryms i en QR-kod som går att läsa från en skärm. */
export async function lank(namn, bas = location.origin, grans = 1250) {
  const full = samla(namn, Infinity);
  let obj, kod;
  for (const max of [400, 240, 160, 110, 70, 40, 0]) {
    obj = {...full, g: full.g.map((row) => row && [...row.slice(0, 3), korta(row[3], max)])};
    kod = await koda(obj);
    if (kod.length + bas.length + LARARSIDA.length + 3 <= grans) break;
  }
  const kortat = obj.g.some((x, i) => x && x[3] !== full.g[i][3]);
  return { url: `${bas}${LARARSIDA}#r=${kod}`, obj, kortat };
}
