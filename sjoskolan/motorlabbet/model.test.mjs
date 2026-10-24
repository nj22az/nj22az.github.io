import test from 'node:test';
import assert from 'node:assert/strict';
import { resistans, lindningar, avlasning, Y, DELTA, OL, startareResistans, tang, FEL, felFor, helDelta } from './model.mjs';

const R = { U: 4, V: 4, W: 4 };
const nara = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} ≈ ${b}`);

test('utan bleck: en lindning mellan sina ändar, överområde mellan olika lindningar', () => {
  nara(resistans('U1', 'U2', R), 4);
  nara(resistans('V2', 'V1', R), 4);
  assert.equal(resistans('U1', 'V1', R), OL);
  assert.equal(resistans('U1', 'PE', R), OL);
});

test('Y ger 2R och Δ ger (2/3)R mellan alla par, kvoten 3', () => {
  for (const [a, b] of [['U1', 'V1'], ['V1', 'W1'], ['W1', 'U1']]) {
    nara(resistans(a, b, R, Y), 8);
    nara(resistans(a, b, R, DELTA), 8 / 3);
  }
  nara(resistans('U1', 'V1', R, Y) / resistans('U1', 'V1', R, DELTA), 3);
});

test('saknat bleck U1–W2 i Δ: R, R och 2R', () => {
  const f = FEL.find((x) => x.id === 'saknas');
  nara(resistans('U1', 'V1', R, f.bleck, f.losa), 4);
  nara(resistans('V1', 'W1', R, f.bleck, f.losa), 4);
  nara(resistans('W1', 'U1', R, f.bleck, f.losa), 8);
});

test('lös mutter ger samma mönster som ett saknat bleck', () => {
  const f = FEL.find((x) => x.id === 'los');
  const v = [['U1', 'V1'], ['V1', 'W1'], ['W1', 'U1']].map(([a, b]) => resistans(a, b, R, f.bleck, f.losa));
  assert.deepEqual(v.map((x) => Math.round(x * 10) / 10).sort(), [4, 4, 8]);
  assert.equal(helDelta(f.bleck, f.losa), false);
  assert.equal(helDelta(DELTA, []), true);
});

test('olika lindningar ger rätt parallellkoppling i Δ', () => {
  const r = { U: 3, V: 4, W: 5 };
  // U1–V1 i Δ: lindningen U parallellt med V + W
  nara(resistans('U1', 'V1', r, DELTA), (3 * 9) / 12);
});

test('lindningar ur D: 3–6 Ω och olika för olika D', () => {
  for (let d = 1; d <= 31; d++) for (const x of Object.values(lindningar(d))) assert.ok(x >= 2.9 && x <= 6.2, `${d}: ${x}`);
  assert.notDeepEqual(lindningar(3), lindningar(4));
});

test('multimeterns visning med sladdar och OL', () => {
  assert.equal(avlasning(4), '4,3');
  assert.equal(avlasning(OL), 'OL');
  assert.equal(avlasning(0), '0,3');
});

test('startaren spänningslöst: 13–14 öppen, 95–96 sluten tills reläet löser ut', () => {
  assert.equal(startareResistans('13', '14'), OL);
  nara(startareResistans('95', '96'), 0.1);
  assert.equal(startareResistans('95', '96', true), OL);
  nara(startareResistans('97', '98', true), 0.1);
  assert.equal(startareResistans('1', '2'), OL);
  assert.ok(startareResistans('A1', 'A2') > 100);
});

test('tången: ett varv, två varv, hårnål och nollställning', () => {
  assert.equal(tang('en', 2, true, true), '2,00');
  assert.equal(tang('tva', 2, true, true), '4,00');
  assert.equal(tang('harnal', 2, true, true), '0,00');
  assert.equal(tang('ute', 2, true, false), '0,04');
  assert.equal(tang('en', 2, false, true), '0,00');
});

test('felet väljs ur D och alla tre förekommer', () => {
  const ids = new Set(Array.from({ length: 31 }, (_, i) => felFor(i + 1).id));
  assert.equal(ids.size, 3);
});
