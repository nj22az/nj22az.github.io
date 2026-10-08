// Resultatkoden för vecka 41. D räknas ur elevens namn (gemensamt/elevtal.mjs), samma som på inlämningssidan.
// Koden är en länk till lärarsidan larare/resultat-v41.html; resultaten ligger komprimerade efter #. Inget facit här:
// lärarsidan räknar facit ur namnets D. Formatet: gemensamt/resultatkod.mjs.
import {elevtal} from '../../gemensamt/elevtal.mjs?v=20260930';
import {koda, las, tal, avrunda} from '../../gemensamt/resultatkod.mjs?v=20260929';

export {tal};
export const VECKA = 41;
export const SVARNYCKEL = 'sj-v41-svar';
export const OVNINGSNYCKEL = 'sj-ovningar:/sjoskolan/vecka-41/aktuell/Formelstod_och_ovningar.html';
export const KONTROLLNYCKEL = 'sj-kontroll:vecka-41';
export const DELAR = ['v41_01', 'v41_02', 'v41_03'];
export const OVNINGAR_PER_DEL = 10;
export const KONTROLLFRAGOR = DELAR.flatMap((d) => [1, 2, 3].map((k) => `${d}-k${k}`));
// Stationernas protokoll (gemensamt/labbprotokoll.mjs sparar under sjoskolan-protokoll-<nyckel>) och Trefaslabbet.
export const STATIONER = [['A', 'stationA', 'DC-delare'], ['B', 'stationB-3f', 'trefas'], ['C', 'stationC', 'hållkrets']];
export const TREFASNYCKEL = 'sjoskolan-trefas-v1';
export const LARARSIDA = '/sjoskolan/larare/resultat-v41.html';

// Inlämningens svarsfält: [nyckel, storhet, enhet]. uppgift = sidans ankare (uppgift-N), nr = numret eleven ser.
// Inlämning 3 (M/S/T eller Motorlabbet) bifogas separat. QR innehåller bara frivilliga A/B/C-sammanfattningar.
export const SVAR = [
  { uppgift: 1, nr: 1, titel: 'Samma värmare i Y och Δ', falt: [
    ['y_Ugren', 'Y: U_{gren}', 'V'], ['y_I', 'Y: I_{gren} = I_{L}', 'A'], ['y_P', 'Y: P', 'kW'],
    ['d_Igren', 'Δ: I_{gren}', 'A'], ['d_IL', 'Δ: I_{L}', 'A'], ['d_P', 'Δ: P', 'kW']] },
  { uppgift: 2, nr: 2, titel: 'Neutralström med egna laster', falt: [
    ['n_I3', 'I_{3}', 'A'], ['n_INf', 'I_{N}, förutsagd', 'A'], ['n_INl', 'I_{N}, avläst i labbet', 'A']] },
];

export const lasSvar = () => las(SVARNYCKEL, {});
export function sparaSvar(svar) { try { localStorage.setItem(SVARNYCKEL, JSON.stringify(svar)); } catch { /* privat läge */ } }

const ifyllt = (v) => String(v ?? '').trim() !== '';
function protokoll(nyckel) {
  const d = las(`sjoskolan-protokoll-${nyckel}`, null);
  if (!d) return null;
  const rader = Array.isArray(d.rows) ? d.rows : [], fel = Array.isArray(d.faults) ? d.faults : [];
  return [rader.filter((r) => ifyllt(r?.uppm)).length, rader.length, rader.filter((r) => r?.bed === 'Utanför tolerans').length,
    fel.filter((f) => ifyllt(f?.slutsats)).length];
}
function ovningar() {
  const klara = las(OVNINGSNYCKEL, {}) || {};
  return DELAR.map((d) => Array.from({ length: OVNINGAR_PER_DEL }, (_, i) => (klara[`${d}-q${i + 1}`] ? 1 : 0) << i).reduce((a, b) => a | b, 0));
}
function kontroll() {
  const k = las(KONTROLLNYCKEL, {}) || {};
  return KONTROLLFRAGOR.map((id) => (Number.isInteger(k[id]) ? k[id] : -1));
}
const trefas = () => { const s = las(TREFASNYCKEL, []); return Array.isArray(s) ? s.length : 0; };
const bitar = (mask) => Array.from({ length: OVNINGAR_PER_DEL }, (_, i) => (mask >> i) & 1).reduce((a, b) => a + b, 0);

/** Vad som finns sparat på enheten, för sammanfattningen på elevsidan. */
export function lage(namn) {
  const svar = lasSvar();
  return {
    D: elevtal(namn),
    svar: SVAR.map((u) => ({ ...u, ifyllda: u.falt.filter(([k]) => Number.isFinite(svar[k])).length })),
    ovningar: ovningar().map(bitar),
    kontroll: kontroll().filter((x) => x >= 0).length,
    stationer: STATIONER.map(([bokstav, nyckel]) => ({ bokstav, p: protokoll(nyckel) })),
    trefas: trefas(),
  };
}

/** Resultaten som ett kompakt objekt. */
export function samla(namn) {
  const svar = lasSvar(), s = {};
  for (const u of SVAR) for (const [k] of u.falt) if (Number.isFinite(svar[k])) s[k] = avrunda(svar[k]);
  const n = String(namn || '').trim().replace(/\s+/g, ' ');
  return { v: 1, w: VECKA, n, d: elevtal(n), t: Math.round(Date.now() / 60000), s, o: ovningar(), k: kontroll(),
    p: STATIONER.map(([, nyckel]) => protokoll(nyckel)), tl: trefas() };
}

/** Länken i QR-koden. */
export async function lank(namn, bas = location.origin) {
  const obj = samla(namn);
  return { url: `${bas}${LARARSIDA}#r=${await koda(obj)}`, obj };
}
