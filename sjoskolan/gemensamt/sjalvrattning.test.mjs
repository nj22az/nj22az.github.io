// Självrättande inlämning: tal, tolerans, hashning, tre försök och låsning, ny omgång efter läsning, lagring,
// veckostatus och PDF:ens innehåll. Kör: node --test sjoskolan/gemensamt/sjalvrattning.test.mjs
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { sha256Hex, hashSvar, tolkaTal, kanon, ratta, registrera, registreraText, lasForstaVersion, lasLage, sparaLage, nyttLage,
  resultat, avkodaLista, medTillagg, visaSvar, faltNamn, tidText, TOLERANS_PROCENT, MAX_FORSOK, forsokKvar, kanLasasUpp, nyOmgang,
  lasLasning, bekraftaLasning, lasningsnyckel, lagringsnyckel, lasklocka, veckoStatus, sparadPlan, listanVisas, lmResultat,
  pdfBlock, pdfFilnamn, kontrollkod, lageText, mailtoAmne, LASDELAR } from './sjalvrattning.mjs';

const SALT = '0123456789abcdef0123456789abcdef';
/** En nyckel byggd som facit.py gör: alla k = x · 10^dec inom tolerans % från värdet. Påhittade värden. */
function talnyckel(id, varde, dec, tol = TOLERANS_PROCENT) {
  const skala = 10 ** dec, lo = Math.ceil(varde * skala * (100 - tol) / 100 - 1e-9), hi = Math.floor(varde * skala * (100 + tol) / 100 + 1e-9);
  const h = [];
  for (let k = lo; k <= hi; k++) h.push(hashSvar(SALT, id, `t${dec}:${k}`));
  return { typ: 'tal', dec, h };
}
const NYCKEL = { version: 1, vecka: 99, salt: SALT, falt: {
  ta: talnyckel('ta', 440, 1), tb: talnyckel('tb', 100, 1), tc: talnyckel('tc', 2.5, 2), th: talnyckel('th', 3, 0, 0),
  va: { typ: 'val', h: [hashSvar(SALT, 'va', 'v:2')] } } };

let saved;
beforeEach((t) => {
  saved = new Map();
  const d = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, writable: true, value: {
    getItem: (k) => saved.get(k) ?? null, setItem: (k, v) => saved.set(k, String(v)), removeItem: (k) => saved.delete(k) } });
  t.after(() => (d ? Object.defineProperty(globalThis, 'localStorage', d) : delete globalThis.localStorage));
});

test('SHA-256 ger samma hash som node:crypto, också för svenska tecken och flera block', () => {
  const prov = ['', 'a', 'abc', 'Rätt!', 'ÅÄÖ åäö Ω µ − ·', 'x'.repeat(55), 'x'.repeat(56), 'x'.repeat(63), 'x'.repeat(64), 'x'.repeat(65), 'å'.repeat(200)];
  for (let i = 0; i < 300; i++) prov.push(Array.from({ length: i }, (_, j) => String.fromCharCode(32 + ((i * 31 + j * 7) % 900))).join(''));
  for (const t of prov) assert.equal(sha256Hex(t), createHash('sha256').update(t, 'utf8').digest('hex'), JSON.stringify(t).slice(0, 40));
  assert.equal(hashSvar('s', 'f', 'v:1'), createHash('sha256').update('s|f|v:1').digest('hex').slice(0, 16));
});

test('tal med decimalkomma, punkt, mellanslag och fältets enhet', () => {
  assert.equal(tolkaTal('37,4'), 37.4);
  assert.equal(tolkaTal('37.4'), 37.4);
  assert.equal(tolkaTal(' 4 400 '), 4400);
  assert.equal(tolkaTal('4\u00a0400,5'), 4400.5);
  assert.equal(tolkaTal('−0,5'), -0.5);
  assert.equal(tolkaTal(',5'), 0.5);
  assert.equal(tolkaTal('37 mA', 'mA'), 37);
  assert.equal(tolkaTal('37MA', 'mA'), 37, 'enheten jämförs utan skiftläge');
  assert.equal(tolkaTal('24V', 'V'), 24);
  assert.ok(Number.isNaN(tolkaTal('0,2 A', 'mA')), 'fel enhet är inget tal');
  assert.ok(Number.isNaN(tolkaTal('12 V')), 'enhet utan fältets enhet');
  for (const fel of ['', 'abc', '1,2,3', '1.2.3', '2e3', 'mA', '--5']) assert.ok(Number.isNaN(tolkaTal(fel, 'mA')), fel);
});

test('kanonisk form: tal avrundas till fältets decimaler, val är alternativets id', () => {
  assert.equal(kanon('tal', '37,36', 1), 't1:374');
  assert.equal(kanon('tal', '37,34', 1), 't1:373');
  assert.equal(kanon('tal', '2,5', 2), 't2:250');
  assert.equal(kanon('tal', '0,37 mA', 1, 'mA'), 't1:4');
  assert.equal(kanon('tal', 'x', 1), null);
  assert.equal(kanon('val', ' 2 '), 'v:2');
  assert.equal(kanon('val', ''), null);
  assert.equal(kanon('text', 'x'), null);
});

test('±2 % tolerans: gränserna godkänns, utanför skiljer sig', () => {
  // Påhittade värden. 440 V: 431,2–448,8 V. 100: 98–102. 2,50: 2,45–2,55.
  for (const v of ['440', '440,0', '440 V', '431,2', '448,8', '435', '448,79']) assert.equal(ratta(NYCKEL, 'ta', v, 'V'), 'ratt', v);
  for (const v of ['431,1', '448,9', '400', '0,44', '44']) assert.equal(ratta(NYCKEL, 'ta', v, 'V'), 'fel', v);
  for (const v of ['98', '98,0', '102', '101,96', '100,4']) assert.equal(ratta(NYCKEL, 'tb', v), 'ratt', v);
  for (const v of ['97,9', '102,1', '97,94']) assert.equal(ratta(NYCKEL, 'tb', v), 'fel', v);
  for (const v of ['2,45', '2,55', '2,5', '2.50']) assert.equal(ratta(NYCKEL, 'tc', v), 'ratt', v);
  for (const v of ['2,44', '2,56']) assert.equal(ratta(NYCKEL, 'tc', v), 'fel', v);
});

test('heltalsfält: bara ett heltal i intervallet är ett svar, och bara exakt rätt tal är rätt', () => {
  const H = [1, 5];
  assert.equal(ratta(NYCKEL, 'th', '3', '', H), 'ratt');
  assert.equal(ratta(NYCKEL, 'th', '3,0', '', H), 'ratt');
  for (const v of ['2', '4', '1', '5']) assert.equal(ratta(NYCKEL, 'th', v, '', H), 'fel', v);
  for (const v of ['3,4', '2,6', '0', '6', 'tre']) assert.equal(ratta(NYCKEL, 'th', v, '', H), 'ogiltig', v);
});

test('rättning: val, tomt, ogiltigt och okänt fält', () => {
  assert.equal(ratta(NYCKEL, 'va', '2'), 'ratt');
  assert.equal(ratta(NYCKEL, 'va', '1'), 'fel');
  assert.equal(ratta(NYCKEL, 'va', ''), 'tom');
  assert.equal(ratta(NYCKEL, 'ta', '   ', 'V'), 'tom');
  assert.equal(ratta(NYCKEL, 'ta', 'tvåhundra', 'V'), 'ogiltig');
  assert.equal(ratta(NYCKEL, 'okänt', '1'), 'saknas');
  assert.equal(ratta(null, 'ta', '440'), 'saknas', 'utan nyckel kan inget rättas');
  assert.notEqual(hashSvar(SALT, 'va', 'v:2'), hashSvar('ffff', 'va', 'v:2'));
  assert.notEqual(hashSvar(SALT, 'va', 'v:2'), hashSvar(SALT, 'vb', 'v:2'), 'fältets id ingår i hashen');
});

const steg = (p, v, tid, id = 'tb') => registrera(p, v, ratta(NYCKEL, id, v), kanon('tal', v, NYCKEL.falt[id].dec), tid);

test('försök: första svaret behålls, tomma, ogiltiga och upprepade svar räknas inte', () => {
  let p = steg(undefined, '', 't0');
  assert.equal(p.forsok, undefined, 'tomt svar är inget försök');
  p = steg(p, 'hundra', 't1');
  assert.equal(p.forsok, undefined, 'ogiltigt svar är inget försök');
  p = steg(p, '120', 't2');
  assert.deepEqual([p.forsok, p.forsokOmgang, p.omgang, p.forsta, p.forstaTid, p.forstaRatt], [1, 1, 1, '120', 't2', false]);
  p = steg(p, '120', 't3');
  p = steg(p, '120,0', 't4');
  assert.equal(p.forsok, 1, 'samma tal igen, också skrivet på annat sätt, är inget nytt försök');
  assert.equal(forsokKvar(p), 2);
  const t = registreraText(registreraText(undefined, '  ', 'a'), 'Min förklaring', 'b');
  assert.deepEqual([t.forsta, t.forstaTid], ['Min förklaring', 'b']);
  assert.equal(registreraText(t, 'Ny text', 'c').forsta, 'Min förklaring');
});

test('tre försök: efter tredje felet låses fältet, ett rätt svar stannar rätt', () => {
  assert.equal(MAX_FORSOK, 3);
  let p = steg(undefined, '120', 't1');
  p = steg(p, '90', 't2');
  assert.equal(forsokKvar(p), 1);
  assert.equal(p.last, undefined);
  p = steg(p, '80', 't3');
  assert.deepEqual([p.last, p.lastTid, p.forsok, forsokKvar(p)], [true, 't3', 3, 0]);
  const efter = steg(p, '100', 't4');
  assert.equal(efter, p, 'ett låst fält ändras inte, inte heller av ett rätt svar');
  let r = steg(undefined, '120', 't1');
  r = steg(r, '100', 't2');
  assert.deepEqual([r.klar, r.ratt, r.forsok, r.klarTid], [true, true, 2, 't2']);
  assert.equal(steg(r, '50', 't3'), r, 'rätt stannar rätt');
  assert.equal(registrera(r, '', 'tom', null, 't4'), r);
  assert.equal(lageText(p), 'Låst');
  assert.equal(lageText(r), 'Rätt');
  assert.equal(lageText({ nu: '5', status: 'fel' }), 'Inte rätt');
  assert.equal(lageText({}), 'Inget svar');
});

test('ny omgång: låsta fält får tre nya försök först när alla delar och texten är lästa efter låsningen', () => {
  let p = steg(steg(steg(undefined, '1', '2026-10-12T10:00:00Z'), '2', '2026-10-12T10:01:00Z'), '3', '2026-10-12T10:02:00Z');
  assert.equal(p.last, true);
  const fore = '2026-10-12T09:00:00Z', efter = '2026-10-12T11:00:00Z';
  assert.equal(kanLasasUpp(p, { 'del-1': efter, 'del-2': efter, 'del-3': efter, text: null }), false, 'texten saknas');
  assert.equal(kanLasasUpp(p, { 'del-1': efter, 'del-2': fore, 'del-3': efter, text: efter }), false, 'del 2 lästes före låsningen');
  assert.equal(kanLasasUpp(p, { 'del-1': efter, 'del-2': efter, 'del-3': efter, text: efter }), true);
  assert.equal(kanLasasUpp({ ...p, last: false }, { 'del-1': efter, 'del-2': efter, 'del-3': efter, text: efter }), false);
  const ny = nyOmgang(p, efter);
  assert.deepEqual([ny.last, ny.omgang, ny.forsokOmgang, ny.forsok, ny.forsta, ny.lastTider.length, ny.upplastTider], [false, 2, 0, 3, '1', 1, [efter]]);
  assert.equal(forsokKvar(ny), 3);
  let q = steg(ny, '4', '2026-10-12T12:00:00Z');
  q = steg(q, '5', '2026-10-12T12:01:00Z');
  q = steg(q, '6', '2026-10-12T12:02:00Z');
  assert.deepEqual([q.last, q.omgang, q.forsok, q.lastTid, q.lastTider.length], [true, 2, 6, '2026-10-12T12:02:00Z', 2]);
  assert.equal(kanLasasUpp(q, { 'del-1': efter, 'del-2': efter, 'del-3': efter, text: efter }), false, 'nya låsningen kräver ny läsning');
});

test('läsbekräftelser: formatet sj-last:vecka-42 och den senaste tiden per del', () => {
  assert.equal(lasningsnyckel(42), 'sj-last:vecka-42');
  assert.equal(lagringsnyckel(42), 'sj-v42-inlamning');
  assert.deepEqual(lasLasning(42), { 'del-1': null, 'del-2': null, 'del-3': null, text: null });
  bekraftaLasning(42, 'del-1', '2026-10-12T10:00:00.000Z');
  bekraftaLasning(42, 'del-1', '2026-10-12T09:00:00.000Z');
  bekraftaLasning(42, 'text', '2026-10-12T11:00:00.000Z');
  assert.deepEqual(JSON.parse(saved.get('sj-last:vecka-42')), { 'del-1': '2026-10-12T10:00:00.000Z', text: '2026-10-12T11:00:00.000Z' });
  assert.deepEqual(lasLasning(42), { 'del-1': '2026-10-12T10:00:00.000Z', 'del-2': null, 'del-3': null, text: '2026-10-12T11:00:00.000Z' });
  assert.deepEqual(LASDELAR, ['del-1', 'del-2', 'del-3', 'text']);
  saved.set('sj-last:vecka-42', 'trasig');
  assert.deepEqual(lasLasning(42), { 'del-1': null, 'del-2': null, 'del-3': null, text: null });
});

test('synlig tid räknas bara när sidan är synlig', () => {
  let nu = 0;
  const k = lasklocka(() => nu);
  k.synlig(true); nu = 60000;
  k.synlig(false); nu = 500000;
  assert.equal(k.ms(), 60000, 'dold tid räknas inte');
  k.synlig(true); nu = 620000;
  assert.equal(k.ms(), 180000);
});

test('första versionen av en skriven uppgift låses och skrivs aldrig över', () => {
  let l = nyttLage();
  l = lasForstaVersion(l, 'EL-1', { a: 'första' }, 't1');
  l = lasForstaVersion(l, 'EL-1', { a: 'andra' }, 't2');
  assert.deepEqual(l.las['EL-1'], { tid: 't1', texter: { a: 'första' } });
  assert.equal(medTillagg('Bryt gruppen.', 'Bryt gruppen. Lås.'), 'Bryt gruppen. [tillägg: Lås.]');
  assert.equal(medTillagg('Bryt gruppen.', 'Lås gruppen.'), 'Bryt gruppen. [ändrad: Lås gruppen.]');
  assert.equal(medTillagg('Samma', 'Samma'), 'Samma');
});

test('lagring: sparas och läses, och sidan fungerar när webbläsaren inte sparar', () => {
  const l = { ...nyttLage(), falt: { tb: { nu: '100' } } };
  assert.equal(sparaLage('k', l), true);
  assert.deepEqual(lasLage('k'), { lage: l, ok: true });
  assert.deepEqual(lasLage('saknas').lage, nyttLage());
  saved.set('trasig', '{inte json');
  assert.deepEqual(lasLage('trasig'), { lage: nyttLage(), ok: false });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blockerad'); } });
  assert.deepEqual(lasLage('k'), { lage: nyttLage(), ok: false });
  assert.equal(sparaLage('k', l), false);
  assert.deepEqual(lasLasning(42), { 'del-1': null, 'del-2': null, 'del-3': null, text: null });
  assert.equal(veckoStatus(42).inlamnad, null, 'veckoStatus tål blockerad lagring');
});

// En liten plan som sidan bygger ur DOM:en (påhittade uppgifter).
const PLAN = { vecka: '99', titel: 'Provvecka', epost: 'larare@example.se', uppgifter: [
  { nr: '1', ovning: 'EL-1', titel: 'Riskbedömning', lm: ['LM-2', 'LM-7'], checklistaEfter: 'va',
    checklista: [{ text: 'Punkt A', las: '' }, { text: 'Punkt B', las: '' }, { text: 'Punkt C', las: '' }], falt: [
      { id: 'la', typ: 'lastext', kort: 'a fara', etikett: 'Fara' }, { id: 'lb', typ: 'lastext', kort: 'b metod', etikett: 'Arbetsmetod' },
      { id: 'va', typ: 'val', kort: 'd', etikett: 'd) Fråga', alternativ: [{ id: '1', text: 'Ett', nr: 1 }, { id: '2', text: 'Två', nr: 2 }] }] },
  { nr: '2', ovning: 'EL-2', titel: 'Beräkning', lm: ['LM-2', 'LM-4'], checklista: null, falt: [
    { id: 'ta', typ: 'tal', kort: 'a', enhet: 'V', etikett: 'a) U_beröring (V)' }, { id: 'tb', typ: 'tal', kort: 'b', enhet: 'mA', etikett: 'b) I (mA)' },
    { id: 'fx', typ: 'text', kort: 'motivering', etikett: 'Motivera' }] }] };

function ifyllt() {
  let l = nyttLage();
  const r = (id, typ, v, tid) => { l.falt[id] = registrera(l.falt[id], v, ratta(NYCKEL, id, v), kanon(typ, v, NYCKEL.falt[id]?.dec), tid); };
  r('va', 'val', '1', '2026-10-12T08:00:00Z'); r('va', 'val', '2', '2026-10-12T08:05:00Z');
  r('ta', 'tal', '440', '2026-10-12T08:01:00Z');
  for (const [v, t] of [['1', '08:02'], ['2', '08:03'], ['3', '08:04']]) r('tb', 'tal', v, `2026-10-12T${t}:00Z`);
  l.falt.fx = registreraText(undefined, 'Kort motivering.', '2026-10-12T08:03:00Z');
  l.falt.la = { nu: 'Spänning i armaturen. Tillägg.' };
  l.falt.lb = { nu: 'Arbete utan spänning' };
  l = lasForstaVersion(l, 'EL-1', { la: 'Spänning i armaturen.', lb: 'Arbete utan spänning' }, '2026-10-12T08:04:00Z');
  l.bock = { 'EL-1': { 1: true, 3: true } };
  return l;
}

test('resultat per uppgift, låsta frågor och kursplanens punkter', () => {
  const r = resultat(PLAN, ifyllt());
  assert.equal(r.ratt, 2);
  assert.equal(r.antal, 3);
  assert.deepEqual(r.uppgifter.map((u) => [u.nr, u.ratt, u.antal, u.tomma, u.lasta]), [['1', 1, 1, 0, 0], ['2', 1, 2, 0, 1]]);
  assert.deepEqual(r.uppgifter[0].lista, { med: 2, antal: 3, last: true, visad: true });
  assert.deepEqual(lmResultat(r.uppgifter.map((u) => ({ ...u, totalt: u.antal }))), { 'LM-2': { ratt: 2, totalt: 3 }, 'LM-4': { ratt: 1, totalt: 2 }, 'LM-7': { ratt: 1, totalt: 1 } });
});

test('checklistan visas efter låst text och rätt eller låst fråga före den', () => {
  const u = PLAN.uppgifter[0], l = ifyllt();
  assert.equal(listanVisas(u, l), true);
  assert.equal(listanVisas(u, { ...l, falt: { ...l.falt, va: { nu: '1', ratt: false } } }), false, 'fråga d inte klar');
  assert.equal(listanVisas(u, { ...l, falt: { ...l.falt, va: { nu: '1', last: true } } }), true, 'fråga d låst');
  assert.equal(listanVisas(u, { ...l, las: {} }), false, 'texten inte låst');
});

test('veckoStatus läser lagringen och ger formatet för veckosidan', () => {
  const l = { ...ifyllt(), namn: 'Test Elev', inlamnad: ['2026-10-12T09:00:00.000Z', '2026-10-12T10:00:00.000Z'], plan: sparadPlan(PLAN) };
  saved.set('sj-v99-inlamning', JSON.stringify(l));
  bekraftaLasning(99, 'del-2', '2026-10-12T07:00:00.000Z');
  const s = veckoStatus(99);
  assert.deepEqual(s, {
    namn: 'Test Elev', inlamnad: '2026-10-12T10:00:00.000Z',
    uppgifter: [{ nr: '1', titel: 'Riskbedömning', ratt: 1, totalt: 1, last: false }, { nr: '2', titel: 'Beräkning', ratt: 1, totalt: 2, last: true }],
    lm: { 'LM-2': { ratt: 2, totalt: 3 }, 'LM-4': { ratt: 1, totalt: 2 }, 'LM-7': { ratt: 1, totalt: 1 } },
    last: true, lasning: { 'del-1': null, 'del-2': '2026-10-12T07:00:00.000Z', 'del-3': null, text: null } });
  saved.clear();
  saved.set('sj-elevnamn', 'Namn Från Elevtal');
  assert.deepEqual(veckoStatus(99), { namn: 'Namn Från Elevtal', inlamnad: null, uppgifter: [], lm: {}, last: false,
    lasning: { 'del-1': null, 'del-2': null, 'del-3': null, text: null } });
});

test('PDF:ens innehåll: rubrik, resultat, fält med läge, försök, omgång, svar, texter, checklista och mål', () => {
  const l = ifyllt();
  const b = pdfBlock(PLAN, l, { namn: 'Åsa Öberg', tid: '2026-10-12T09:00:00Z', lmText: { 'LM-2': 'El kan skada.' },
    lasning: { 'del-1': '2026-10-12T07:00:00Z', 'del-2': null, 'del-3': null, text: null } });
  const t = b.map((x) => x.text).join('\n');
  for (const rad of ['Sjöskolan · Elteknik och ellära · Inlämning vecka 99', 'Namn: Åsa Öberg', 'Resultat: 2 av 3 rätt',
    'Inlämning 2. Beräkning: 1 av 2 rätt, 1 låst.', 'Låst. 3 försök, omgång 1. Första svar: 1 mA', 'Sista svar: 3 mA.',
    'Rätt. 2 försök, omgång 1. Första svar: Ett', 'Sista svar: Två.', 'Första och sista svar: 440 V',
    'Fara: Spänning i armaturen. [tillägg: Tillägg.]', 'Checklista: 2 av 3 finns med i svaret.', 'Med: Punkt A', 'Inte med: Punkt B',
    'Motivera: Kort motivering.', 'Kursplanens mål', 'LM-2: 2 av 3 rätt. El kan skada.', 'del 1: ', 'Kontrollkod: ']) {
    assert.ok(t.includes(rad), `saknar: ${rad}\n${t}`);
  }
  assert.ok(!/undefined|NaN|\[object|\.\./.test(t), t);
  assert.match(kontrollkod('A B', 't', l), /^[0-9A-F]{4}-[0-9A-F]{4}$/);
  assert.notEqual(kontrollkod('A B', 't', l), kontrollkod('A B', 't', { ...l, falt: { ...l.falt, ta: { nu: '441' } } }), 'koden följer svaren');
  const utan = pdfBlock(PLAN, { ...l, falt: { ...l.falt, va: { nu: '1', ratt: false } } }, { namn: 'X Y', tid: 't' }).map((x) => x.text).join('\n');
  assert.ok(utan.includes('Checklistan visades inte') && !utan.includes('Punkt A'), 'ingen checklista innan fråga d är klar');
});

test('filnamn, mailto och visning', () => {
  assert.equal(pdfFilnamn(42, 'Åsa Öberg'), 'Vecka42_Inlamning_Asa_Oberg.pdf');
  assert.equal(pdfFilnamn(42, '  Ørjan  Ægir-Åström '), 'Vecka42_Inlamning_Orjan_AEgir_Astrom.pdf');
  assert.equal(pdfFilnamn(42, ''), 'Vecka42_Inlamning_Elev.pdf');
  assert.equal(mailtoAmne('nils@sjoskolan.se', 'Inlämning vecka 42: Åsa Öberg'), 'mailto:nils@sjoskolan.se?subject=Inl%C3%A4mning%20vecka%2042%3A%20%C3%85sa%20%C3%96berg');
  assert.equal(faltNamn('3', { kort: 'a huvudtavla kategori' }), '3a huvudtavla kategori');
  assert.equal(faltNamn('3', { kort: 'motivering' }), '3 motivering');
  assert.equal(visaSvar({ typ: 'tal', enhet: 'mA' }, '37 mA'), '37 mA');
  assert.equal(visaSvar({ typ: 'tal', enhet: 'mA' }, '37'), '37 mA');
  assert.equal(visaSvar(PLAN.uppgifter[0].falt[2], '2'), 'Två');
  assert.match(tidText('2026-10-12T09:00:00Z'), /^2026-10-12 \d\d:\d\d$/);
  assert.equal(tidText('inte en tid'), '');
});

test('checklistan avkodas ur base64 med svenska tecken', () => {
  const data = [{ text: 'Alla energikällor är bortkopplade – före arbetet.', las: 'Läs <a href="Del_2.html#teori-7">del 2</a>.' }];
  const b64 = Buffer.from(JSON.stringify(data), 'utf8').toString('base64');
  assert.deepEqual(avkodaLista(b64), data);
  assert.deepEqual(avkodaLista('!!!'), []);
});
