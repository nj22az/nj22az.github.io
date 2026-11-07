// Personliga värden i den guidade labben: inget svar får ligga inom 2 % av ett exempel (tal med enhet) i
// genomgången (lektioner.mjs) eller i uppgifternas metod och ledtrådar. Se ANDRINGSLOGG.md, regel 1, 22 och 23.
import test from 'node:test';
import assert from 'node:assert/strict';
import {GUIDE_TASKS, guideValues, personligUppgift, elevtal} from '../guided-lessons.mjs';
import {LESSONS} from '../../vecka-40/aktuell/lektioner.mjs';

// Ett exempel "räknar fram" en storhet: symbol = … = tal enhet (eller symbol ≈ tal). Givna värden (R = 50 Ω) räknas inte.
const RAKNAT = /(?<![\wÅÄÖåäö|/])(\|?[A-Za-zûΔφ](?:_\{[^{}]*\})?\|?)\s*(?:=\s*[^=≈.;]*?\s*)?(?:=|≈)\s*[^=≈.;]*?(?:=|≈)\s*(\d[\d\u00a0\u202f ]*(?:,\d+)?)\s?(ms|V|A|Ω|W)(?![\wÅÄÖåäö])|(?<![\wÅÄÖåäö|/])(\|?[A-Za-zûΔφ](?:_\{[^{}]*\})?\|?)\s*≈\s*(\d[\d\u00a0\u202f ]*(?:,\d+)?)\s?(ms|V|A|Ω|W)(?![\wÅÄÖåäö])/g;
const SYMBOL = {T: ['T'], peak: ['û'], XL: ['X_{L}', 'X'], Z: ['|Z|', 'Z'], I: ['I', 'I_{1}', 'I_{2}']};
const tal = (s) => Number(s.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.'));
function exempel(uppgifter) {
  const texter = [];
  for (const l of LESSONS) for (const s of l.slides) texter.push(...s.body, s.formula || '');
  for (const t of uppgifter) texter.push(t.method || '', t.hint || '');
  const ut = [];
  for (const t of texter) for (const m of t.matchAll(RAKNAT)) ut.push(m[1] ? [m[1], tal(m[2]), m[3], t] : [m[4], tal(m[5]), m[6], t]);
  return ut;
}

test('elevtal: samma D för samma namn oavsett skrivsätt, 1–31', () => {
  assert.equal(elevtal('Nils Johansson'), elevtal('  nils   JOHANSSON '));
  assert.equal(elevtal(''), null);
  for (const n of ['A B', 'Åsa Öberg', 'Anna Svensson', 'Erik Lind']) { const D = elevtal(n); assert.ok(D >= 1 && D <= 31); }
});

test('personliga svar ligger inte nära ett exempel i genomgången eller ledtrådarna', () => {
  const fel = [];
  for (let D = 1; D <= 31; D++) {
    const ex = exempel(GUIDE_TASKS.map((t) => personligUppgift(t, D)));
    for (const t of GUIDE_TASKS) {
      if (t.id === 'kalibrator') continue; // begreppsuppgift, samma för alla
      const u = personligUppgift(t, D), v = guideValues(u);
      for (const [k, , enhet] of u.fields) {
        for (const [sym, x, e, text] of ex) {
          if (e === enhet && SYMBOL[k]?.includes(sym) && Math.abs(x - v[k]) <= 0.02 * Math.abs(v[k])) fel.push(`D=${D} ${t.id}: ${v[k].toFixed(3)} ${enhet} ≈ ${x} ${e} i "${text.slice(0, 60)}"`);
        }
      }
    }
  }
  assert.deepEqual(fel, []);
  assert.ok(exempel(GUIDE_TASKS).length > 20, 'testet hittar exemplen');
});

test('personliga uppgifter skiljer sig mellan elever', () => {
  const svar = (D) => GUIDE_TASKS.map((t) => { const u = personligUppgift(t, D); return u.fields.map(([k]) => guideValues(u)[k].toFixed(3)).join(); }).join('|');
  assert.notEqual(svar(1), svar(2));
  assert.notEqual(svar(7), svar(20));
});

test('lärarguidens facit (Python) ger samma värden som labbet för alla D', async () => {
  const {execFileSync} = await import('node:child_process');
  const lib = new URL('../../innehall/lib/', import.meta.url).pathname;
  const py = execFileSync('python3', ['-c', `import sys,json; sys.path.insert(0, ${JSON.stringify(lib)}); import berakningar as B; print(json.dumps({D: B.LARARFACIT['inlamning.40-4'](D) for D in range(1, 32)}))`]).toString();
  const facit = JSON.parse(py);
  const f2 = (v) => v.toLocaleString('sv-SE', {minimumFractionDigits: 2, maximumFractionDigits: 2}).replace(/ /g, ' ');
  for (let D = 1; D <= 31; D++) {
    const text = facit[D].replace(/ /g, ' ');
    for (const t of GUIDE_TASKS) {
      if (t.id === 'kalibrator' || t.id === 'grund-period') continue;
      const u = personligUppgift(t, D), v = guideValues(u);
      for (const [k] of u.fields) assert.ok(text.includes(f2(v[k])), `D=${D} ${t.id}: ${f2(v[k])} saknas i "${text}"`);
    }
  }
});
