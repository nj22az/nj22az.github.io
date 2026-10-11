// Självrättande inlämning (vecka 42 och framåt): rättning, försök och låsning, läsbekräftelser, resultat, veckostatus
// och innehållet i elevens PDF. Ingen DOM här, så att allt kan provas i node (sjalvrattning.test.mjs).
// Sidan: sjalvrattning-sida.mjs. Delsidorna: lasbekraftelse.mjs. PDF-filen: pdf.mjs. Fälten: verktyg/inlamning/sjalvrattning.py.
//
// Rätta svar finns bara som saltade SHA-256-hashar i vecka-XX/aktuell/inlamning-nyckel.mjs (verktyg/inlamning/facit.py).
// Ett tal avrundas till fältets decimaler och godkänns om hashen finns i nyckeln; nyckeln har varje tal inom 2 % från
// rätt värde (regel 6). Det håller svaren borta från den som läser källkoden, men det är inget säkert skydd: den som
// vill kan pröva alla alternativ och alla tal. Därför har varje fråga tre försök, och läraren ser elevens första svar,
// antal försök och omgång (regel 25).
//
// Lagring (localStorage, allt i try/catch; sidan fungerar utan):
//   sj-v<vecka>-inlamning  elevens svar: {v, falt, las, bock, inlamnad, namn, plan}   (lagringsnyckel)
//   sj-last:vecka-<vecka>  läsbekräftelser: {"del-1": ISO, "del-2": ISO, "del-3": ISO, "text": ISO}   (lasningsnyckel)
//   sj-elevnamn            namnet (gemensamt/elevtal.mjs), används när inlämningen saknar namn

export const TOLERANS_PROCENT = 2;
export const MAX_FORSOK = 3;
export const LASDELAR = ['del-1', 'del-2', 'del-3', 'text'];
export const LASTID_MS = 3 * 60 * 1000;
export const lagringsnyckel = (vecka) => `sj-v${vecka}-inlamning`;
export const lasningsnyckel = (vecka) => `sj-last:vecka-${vecka}`;

// ------------------------------------------------------------------ SHA-256 (FIPS 180-4), utan crypto.subtle
// Egen implementation: crypto.subtle finns bara på https och är asynkron. Testet jämför med node:crypto.
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
const rotr = (x, n) => (x >>> n) | (x << (32 - n));

export function sha256Hex(text) {
  const data = new TextEncoder().encode(String(text));
  const block = new Uint8Array(Math.ceil((data.length + 9) / 64) * 64);
  block.set(data);
  block[data.length] = 0x80;
  const dv = new DataView(block.buffer);
  const bitar = data.length * 8;
  dv.setUint32(block.length - 8, Math.floor(bitar / 2 ** 32));
  dv.setUint32(block.length - 4, bitar >>> 0);
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const W = new Uint32Array(64);
  for (let o = 0; o < block.length; o += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + 4 * i);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = W[i - 16] + s0 + W[i - 7] + s1;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
  }
  return Array.from(H, (x) => x.toString(16).padStart(8, '0')).join('');
}

/** Samma hash som facit.py: de första 16 hextecknen av sha256("salt|fält|svar"). */
export const hashSvar = (salt, falt, kanonisk) => sha256Hex(`${salt}|${falt}|${kanonisk}`).slice(0, 16);

// ------------------------------------------------------------------ tal och rättning
/** Ett tal som eleven skriver: komma eller punkt, mellanslag i tusental, minustecken. Fältets enhet får stå efter
 * talet (37 mA). Annan text ger NaN. */
export function tolkaTal(text, enhet = '') {
  let t = String(text ?? '').trim().replace(/[\s  ]+/g, '');
  const e = String(enhet).replace(/\s+/g, '');
  if (e && t.toLowerCase().endsWith(e.toLowerCase()) && t.length > e.length) t = t.slice(0, -e.length);
  t = t.replace('−', '-').replace(',', '.');
  return /^-?(\d+(\.\d*)?|\.\d+)$/.test(t) ? Number(t) : NaN;
}

/** Svaret i den form som hashas: "v:<id>" för ett val, "t<dec>:<k>" för ett tal (k = talet · 10^dec avrundat). */
export function kanon(typ, varde, dec = 0, enhet = '') {
  if (typ === 'val') { const v = String(varde ?? '').trim(); return v ? `v:${v}` : null; }
  if (typ === 'tal') { const x = tolkaTal(varde, enhet); return Number.isFinite(x) ? `t${dec}:${Math.round(x * 10 ** dec)}` : null; }
  return null;
}

/** Rättar ett svar mot nyckeln: 'ratt', 'fel', 'tom' (inget svar), 'ogiltig' (inget tal, eller inget heltal i
 * intervallet för ett heltalsfält) eller 'saknas' (fältet finns inte i nyckeln). heltal = [min, max] eller null. */
export function ratta(nyckel, faltId, varde, enhet = '', heltal = null) {
  const n = nyckel?.falt?.[faltId];
  if (!n) return 'saknas';
  if (String(varde ?? '').trim() === '') return 'tom';
  if (heltal) {
    const x = tolkaTal(varde, enhet);
    if (!Number.isInteger(x) || x < heltal[0] || x > heltal[1]) return 'ogiltig';
  }
  const k = kanon(n.typ, varde, n.dec, enhet);
  if (k === null) return 'ogiltig';
  return n.h.includes(hashSvar(nyckel.salt, faltId, k)) ? 'ratt' : 'fel';
}

// ------------------------------------------------------------------ elevens svar, försök, låsning och omgångar
export const nyttLage = () => ({ v: 1, falt: {}, las: {}, bock: {}, inlamnad: [] });

/** Läser sparade svar. ok = false när webbläsaren inte sparar (privat läge, blockerad lagring). */
export function lasLage(nyckel) {
  try {
    const d = JSON.parse(localStorage.getItem(nyckel) || 'null');
    return { lage: d && d.v === 1 ? { ...nyttLage(), ...d } : nyttLage(), ok: true };
  } catch { return { lage: nyttLage(), ok: false }; }
}
export function sparaLage(nyckel, lage) {
  try { localStorage.setItem(nyckel, JSON.stringify(lage)); return true; } catch { return false; }
}

/** Ett rättat svar läggs till fältets historik. Regel 25: första svaret och dess tid skrivs aldrig över. Ett tomt,
 * ogiltigt eller oförändrat svar räknas inte som ett försök. Ett rätt svar är klart och ändras inte mer. Efter max fel
 * i samma omgång låses fältet (last, lastTid); en ny omgång ges av nyOmgang när eleven har läst om veckan. */
export function registrera(post, varde, utfall, kanonisk, tid, max = MAX_FORSOK) {
  const gammal = post || {};
  if (gammal.last || gammal.klar) return gammal;
  const p = { ...gammal, nu: String(varde ?? '').trim(), status: utfall, ratt: utfall === 'ratt' };
  if (utfall !== 'ratt' && utfall !== 'fel') return p;
  if (p.senast === kanonisk) return p;
  p.omgang = p.omgang || 1;
  p.forsok = (p.forsok || 0) + 1;
  p.forsokOmgang = (p.forsokOmgang || 0) + 1;
  if (p.forsta === undefined) { p.forsta = p.nu; p.forstaTid = tid; p.forstaRatt = p.ratt; }
  p.senast = kanonisk;
  if (p.ratt) { p.klar = true; p.klarTid = tid; } else if (p.forsokOmgang >= max) {
    p.last = true; p.lastTid = tid; p.lastTider = [...(p.lastTider || []), tid];
  }
  return p;
}

/** Försök kvar i fältets omgång (0 när fältet är klart eller låst). */
export const forsokKvar = (post, max = MAX_FORSOK) => (post?.klar || post?.last ? 0 : Math.max(0, max - (post?.forsokOmgang || 0)));

const tidVarde = (iso) => { const t = Date.parse(iso); return Number.isNaN(t) ? -Infinity : t; };

/** Sant när ett låst fält får en ny omgång: varje läsdel är bekräftad efter låsningen. */
export function kanLasasUpp(post, lasning, delar = LASDELAR) {
  return !!post?.last && delar.every((k) => tidVarde(lasning?.[k]) > tidVarde(post.lastTid));
}

/** Ny omgång med max nya försök. Omgångens nummer, tidigare låsningar och första svaret finns kvar. */
export function nyOmgang(post, tid) {
  if (!post?.last) return post;
  return { ...post, last: false, omgang: (post.omgang || 1) + 1, forsokOmgang: 0, status: undefined, upplastTider: [...(post.upplastTider || []), tid] };
}

/** Fri text (frivillig förklaring): första icke-tomma versionen vid rättning sparas. */
export function registreraText(post, text, tid) {
  const p = { ...(post || {}), nu: String(text ?? '') };
  if (p.nu.trim() && p.forsta === undefined) { p.forsta = p.nu.trim(); p.forstaTid = tid; }
  return p;
}

/** Låser första versionen av en skriven uppgift. En låst version skrivs aldrig över. */
export function lasForstaVersion(lage, uppgift, texter, tid) {
  if (lage.las?.[uppgift]) return lage;
  return { ...lage, las: { ...(lage.las || {}), [uppgift]: { tid, texter: { ...texter } } } };
}

/** Checklistan (base64-kodad JSON i sidan, se sjalvrattning.py: base64 är inget skydd, bara dold tills låsningen). */
export function avkodaLista(b64) {
  try {
    const bin = atob(String(b64 || ''));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
  } catch { return []; }
}

// ------------------------------------------------------------------ läsbekräftelser (delsidorna och texten)
/** Läsbekräftelserna för veckan: {"del-1": ISO|null, …}. Saknad eller trasig lagring ger null överallt. */
export function lasLasning(vecka) {
  let d = {};
  try { d = JSON.parse(localStorage.getItem(lasningsnyckel(vecka)) || '{}') || {}; } catch { d = {}; }
  const ut = Object.fromEntries(LASDELAR.map((k) => [k, typeof d[k] === 'string' ? d[k] : null]));
  for (const [k, v] of Object.entries(d)) if (!(k in ut) && typeof v === 'string') ut[k] = v;
  return ut;
}

/** Bekräftar att en del är läst. Den senaste tiden per del behålls. Returnerar alla bekräftelser. */
export function bekraftaLasning(vecka, del, tid = new Date().toISOString()) {
  let d = {};
  try { d = JSON.parse(localStorage.getItem(lasningsnyckel(vecka)) || '{}') || {}; } catch { d = {}; }
  if (!d[del] || tidVarde(tid) > tidVarde(d[del])) d[del] = tid;
  try { localStorage.setItem(lasningsnyckel(vecka), JSON.stringify(d)); } catch { /* privat läge */ }
  return lasLasning(vecka);
}

/** Synlig tid på en sida: summan av tiderna då sidan var synlig (document.visibilityState). nu() ger millisekunder. */
export function lasklocka(nu = () => Date.now()) {
  let summa = 0, start = null;
  return {
    synlig(arSynlig) {
      const t = nu();
      if (arSynlig && start === null) start = t;
      else if (!arSynlig && start !== null) { summa += t - start; start = null; }
    },
    ms: () => summa + (start === null ? 0 : nu() - start),
  };
}

// ------------------------------------------------------------------ resultat och veckostatus
const rattas = (f) => f.typ === 'tal' || f.typ === 'val';

/** Checklistan visas när första versionen är låst och frågan före den (checklistaEfter) är rätt eller låst. */
export function listanVisas(u, lage) {
  if (!lage.las?.[u.ovning]) return false;
  const efter = u.checklistaEfter ? lage.falt?.[u.checklistaEfter] : null;
  return !u.checklistaEfter || !!(efter?.klar || efter?.last);
}

/** Antal rätt per uppgift och totalt. plan.uppgifter: [{nr, ovning, falt: [{id, typ}], checklista}]. */
export function resultat(plan, lage) {
  const uppgifter = plan.uppgifter.map((u) => {
    const r = u.falt.filter(rattas);
    const bock = lage.bock?.[u.ovning] || {};
    return {
      nr: u.nr, ovning: u.ovning, titel: u.titel, lm: u.lm || [], antal: r.length,
      ratt: r.filter((f) => lage.falt?.[f.id]?.ratt).length,
      tomma: r.filter((f) => !String(lage.falt?.[f.id]?.nu ?? '').trim()).length,
      lasta: r.filter((f) => lage.falt?.[f.id]?.last).length,
      lista: u.checklista?.length ? { med: u.checklista.filter((_, i) => bock[i + 1]).length, antal: u.checklista.length, last: !!lage.las?.[u.ovning],
        visad: listanVisas(u, lage) } : null,
    };
  });
  return { ratt: uppgifter.reduce((s, u) => s + u.ratt, 0), antal: uppgifter.reduce((s, u) => s + u.antal, 0), uppgifter };
}

/** Rätt per punkt i kursplanen: varje uppgift räknas under alla sina punkter (postens larande.mal). */
export function lmResultat(uppgifter) {
  const lm = {};
  for (const u of uppgifter) {
    for (const m of u.lm || []) {
      lm[m] ??= { ratt: 0, totalt: 0 };
      lm[m].ratt += u.ratt;
      lm[m].totalt += u.totalt ?? u.antal;
    }
  }
  return Object.fromEntries(Object.entries(lm).sort(([a], [b]) => Number(a.split('-')[1]) - Number(b.split('-')[1])));
}

/** Planen som sparas med svaren, så att veckoStatus kan räkna utan sidan: uppgifter med fälten som rättas. */
export const sparadPlan = (plan) => ({ vecka: plan.vecka, titel: plan.titel, uppgifter: plan.uppgifter.map((u) => (
  { nr: u.nr, titel: u.titel, ovning: u.ovning, lm: u.lm || [], falt: u.falt.filter(rattas).map((f) => f.id) })) });

/** Veckans läge för veckosidan (ren funktion, läser bara localStorage och tål att lagringen saknas):
 * {namn, inlamnad, uppgifter: [{nr, titel, ratt, totalt, last}], lm: {'LM-2': {ratt, totalt}, …}, last, lasning}. */
export function veckoStatus(vecka) {
  const { lage } = lasLage(lagringsnyckel(vecka));
  const uppgifter = (lage.plan?.uppgifter || []).map((u) => {
    const falt = Array.isArray(u.falt) ? u.falt : [];
    return { nr: String(u.nr), titel: u.titel || '', ratt: falt.filter((id) => lage.falt?.[id]?.ratt).length, totalt: falt.length,
      last: falt.some((id) => lage.falt?.[id]?.last), lm: Array.isArray(u.lm) ? u.lm : [] };
  });
  let namn = typeof lage.namn === 'string' ? lage.namn : '';
  if (!namn) { try { namn = localStorage.getItem('sj-elevnamn') || ''; } catch { namn = ''; } }
  const inlamnad = Array.isArray(lage.inlamnad) && lage.inlamnad.length ? lage.inlamnad[lage.inlamnad.length - 1] : null;
  return { namn, inlamnad, uppgifter: uppgifter.map(({ lm, ...u }) => u), lm: lmResultat(uppgifter), last: uppgifter.some((u) => u.last),
    lasning: lasLasning(vecka) };
}

// ------------------------------------------------------------------ visning, PDF:ens innehåll och filnamn
const pad = (n) => String(n).padStart(2, '0');
/** Tid som 2026-10-14 19:32 (enhetens lokala tid). */
export function tidText(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Fältets korta namn: 2a, 3a huvudtavla kategori, 3 motivering. */
export const faltNamn = (nr, f) => (/^[a-z](\s|$)/.test(f.kort || '') ? `${nr}${f.kort}` : `${nr} ${f.kort || f.id}`.trim());

/** Ett svar som text: tal med enhet, val som alternativets text. */
export function visaSvar(f, varde) {
  const v = String(varde ?? '').trim();
  if (!v) return '';
  if (f.typ === 'tal') {
    const e = f.enhet || '';
    return e && !v.toLowerCase().replace(/\s+/g, '').endsWith(e.toLowerCase()) ? `${v} ${e}` : v;
  }
  if (f.typ === 'val') return (f.alternativ || []).find((x) => x.id === v)?.text ?? v;
  return v;
}

export const BESKED = { ratt: 'Rätt!', fel: 'Skiljer sig', last: 'Låst – läs om veckan' };

/** Fältets läge i PDF:en: Rätt, Låst, Inte rätt, Inget svar eller Inte rättat. */
export function lageText(p) {
  if (p?.ratt) return 'Rätt';
  if (p?.last) return 'Låst';
  if (!String(p?.nu ?? '').trim()) return 'Inget svar';
  return p?.status === 'saknas' ? 'Inte rättat' : 'Inte rätt';
}

/** En text med första version och senare tillägg: "första [tillägg: …]" eller "första [ändrad: …]". */
export function medTillagg(forsta, nu) {
  const a = String(forsta ?? '').trim(), b = String(nu ?? '').trim();
  if (!a) return b;
  if (!b || a === b) return a;
  return b.startsWith(a) ? `${a} [tillägg: ${b.slice(a.length).trim()}]` : `${a} [ändrad: ${b}]`;
}

/** Avslutar en mening med punkt om den inte redan slutar med . ! eller ?. */
const punkt = (t) => (/[.!?]$/.test(String(t).trim()) ? String(t).trim() : `${String(t).trim()}.`);

/** Kort kontrollkod (8 hextecken, ABCD-1234) ur namn, tid och alla svar: visar att PDF:en inte är ändrad i efterhand. */
export function kontrollkod(namn, tid, lage) {
  const svar = Object.keys(lage.falt || {}).sort().map((id) => `${id}=${String(lage.falt[id]?.nu ?? '').trim()}`).join('|');
  const h = sha256Hex(`${namn}|${tid}|${svar}`).slice(0, 8).toUpperCase();
  return `${h.slice(0, 4)}-${h.slice(4)}`;
}

const TRANSLITTERERA = { ø: 'o', Ø: 'O', æ: 'ae', Æ: 'AE', ß: 'ss', đ: 'd', Đ: 'D', ł: 'l', Ł: 'L', þ: 'th', Þ: 'Th', ð: 'd', Ð: 'D' };
/** Filnamnet: Vecka42_Inlamning_Fornamn_Efternamn.pdf (bara A–Z, a–z, 0–9 och _). */
export function pdfFilnamn(vecka, namn) {
  const ascii = String(namn ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[øØæÆßđĐłŁþÞðÐ]/g, (c) => TRANSLITTERERA[c]);
  const del = ascii.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Elev';
  return `Vecka${vecka}_Inlamning_${del}.pdf`;
}

/** Innehållet i elevens PDF som block för pdf.mjs: rubrik, resultat, varje fält med läge, försök, omgång, första och
 * sista svar, de skrivna svaren med tillägg och checklistan, kursplanens mål, läsning och kontrollkod. */
export function pdfBlock(plan, lage, { namn, tid, lmText = {}, kod = kontrollkod(namn, tid, lage), lasning = null }) {
  const res = resultat(plan, lage), b = [];
  const rubrik = (text) => b.push({ typ: 'underrubrik', text });
  const rad = (text, ext = {}) => b.push({ typ: 'text', text, ...ext });
  b.push({ typ: 'rubrik', text: `Sjöskolan · Elteknik och ellära · Inlämning vecka ${plan.vecka}` });
  rad(plan.titel, { fet: true });
  rad(`Namn: ${namn}`);
  rad(`Datum och tid: ${tidText(tid)}`);
  rad(`Kontrollkod: ${kod}`);
  rubrik(`Resultat: ${res.ratt} av ${res.antal} rätt`);
  for (const u of res.uppgifter) rad(`Inlämning ${u.nr}. ${u.titel}: ${u.ratt} av ${u.antal} rätt${u.lasta ? `, ${u.lasta} låst` : ''}.`);
  for (const u of plan.uppgifter) {
    const r = res.uppgifter.find((x) => x.ovning === u.ovning);
    rubrik(`Inlämning ${u.nr}. ${u.titel} – ${r.ratt} av ${r.antal} rätt`);
    for (const f of u.falt.filter(rattas)) {
      const p = lage.falt?.[f.id] || {};
      rad(f.etikett || faltNamn(u.nr, f), { fet: true });
      const tid = p.forstaTid ? ` (${tidText(p.forstaTid)})` : '';
      const forsta = visaSvar(f, p.forsta), sista = visaSvar(f, p.nu);
      const svar = p.forsta === undefined ? `Sista svar: ${punkt(sista || '–')}`
        : forsta === sista ? `Första och sista svar: ${punkt(`${forsta}${tid}`)}` : `Första svar: ${punkt(`${forsta}${tid}`)} Sista svar: ${punkt(sista || '–')}`;
      rad(`${lageText(p)}. ${p.forsok || 0} försök, omgång ${p.omgang || 1}. ${svar}`, { indrag: 1 });
    }
    const skrivna = u.falt.filter((f) => f.typ === 'lastext');
    if (skrivna.length) {
      const l = lage.las?.[u.ovning];
      rad(l ? `Skrivna svar. Första versionen sparades ${tidText(l.tid)}; senare tillägg står inom [ ].` : 'Skrivna svar (inte låsta som första version):', { fet: true, luft: 6 });
      for (const f of skrivna) {
        const nu = lage.falt?.[f.id]?.nu;
        rad(`${f.etikett}: ${(l ? medTillagg(l.texter?.[f.id], nu) : String(nu ?? '').trim()) || '–'}`, { indrag: 1 });
      }
    }
    for (const f of u.falt.filter((x) => x.typ === 'text')) {
      const p = lage.falt?.[f.id];
      if (p && (String(p.nu ?? '').trim() || p.forsta)) rad(`${f.etikett}: ${medTillagg(p.forsta, p.nu)}`, { indrag: 1 });
    }
    if (u.checklista?.length) {
      const bock = lage.bock?.[u.ovning] || {};
      if (listanVisas(u, lage)) {
        rad(`Checklista: ${u.checklista.filter((_, i) => bock[i + 1]).length} av ${u.checklista.length} finns med i svaret.`, { fet: true, luft: 6 });
        u.checklista.forEach((x, i) => rad(`${bock[i + 1] ? 'Med' : 'Inte med'}: ${x.text}`, { indrag: 1 }));
      } else {
        const efter = u.falt.find((f) => f.id === u.checklistaEfter);
        rad(`Checklistan visades inte: texten är inte låst som första version${efter ? `, eller fråga ${faltNamn(u.nr, efter)} är inte rätt eller låst` : ''}.`, { luft: 6 });
      }
    }
  }
  const lm = lmResultat(res.uppgifter.map((u) => ({ ...u, totalt: u.antal })));
  if (Object.keys(lm).length) {
    rubrik('Kursplanens mål');
    for (const [m, v] of Object.entries(lm)) rad(`${m}: ${v.ratt} av ${v.totalt} rätt.${lmText[m] ? ` ${lmText[m]}` : ''}`);
  }
  if (lasning && Object.values(lasning).some(Boolean)) {
    rubrik('Läst om veckan');
    rad(Object.entries(lasning).map(([k, v]) => `${k === 'text' ? 'texten' : k.replace('del-', 'del ')}: ${v ? tidText(v) : 'inte bekräftad'}`).join(' · '));
  }
  b.push({ typ: 'text', text: `Kontrollkoden ${kod} räknas ur namnet, tiden och alla svar.`, storlek: 9, luft: 10 });
  return b;
}

/** mailto-länk med bara ämnesrad (eleven bifogar PDF:en själv). */
export const mailtoAmne = (epost, amne) => `mailto:${epost}?subject=${encodeURIComponent(amne)}`;
