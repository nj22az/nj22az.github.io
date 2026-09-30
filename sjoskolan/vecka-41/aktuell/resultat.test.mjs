// Resultatkoden vecka 41: datakontrakt och kodning. Kör: node --test sjoskolan/vecka-41/aktuell/resultat.test.mjs
import test, {beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {elevtal} from '../../gemensamt/elevtal.mjs';
import {avkoda} from '../../gemensamt/resultatkod.mjs';
import {KONTROLLFRAGOR as KF} from './kontrollfragor.gen.mjs';
import {samla, lank, lage, tal, sparaSvar, SVAR, SVARNYCKEL, OVNINGSNYCKEL, KONTROLLNYCKEL, KONTROLLFRAGOR, TREFASNYCKEL, LARARSIDA, VECKA} from './resultat.mjs';

const NOW = Date.UTC(2026, 9, 5, 8, 0);
let saved;
beforeEach((t) => {
  saved = new Map();
  const d = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {configurable: true, writable: true, value: {
    getItem: (k) => saved.get(k) ?? null, setItem: (k, v) => saved.set(k, String(v)), removeItem: (k) => saved.delete(k)}});
  t.after(() => (d ? Object.defineProperty(globalThis, 'localStorage', d) : delete globalThis.localStorage));
  t.mock.method(Date, 'now', () => NOW);
});

test('tom enhet ger en giltig kod med namnets D och veckan', async () => {
  const r = samla('  Test   Elev ');
  assert.equal(r.w, VECKA);
  assert.equal(r.n, 'Test Elev');
  assert.equal(r.d, elevtal('Test Elev'));
  assert.deepEqual(r.s, {});
  assert.deepEqual(r.o, [0, 0, 0]);
  assert.deepEqual(r.k, Array(9).fill(-1));
  assert.deepEqual(r.p, [null, null, null]);
  assert.equal(r.tl, 0);
});

test('svar, övningar, kontrollfrågor, protokoll och labb följer med', async () => {
  sparaSvar({y_Ugren: 230.94, d_P: 12.97123456, okand: 5});
  saved.set(OVNINGSNYCKEL, JSON.stringify({'v41_01-q1': true, 'v41_01-q3': true, 'v41_03-q10': true}));
  saved.set(KONTROLLNYCKEL, JSON.stringify({'v41_01-k1': 1, 'v41_03-k3': 0}));
  saved.set('sjoskolan-protokoll-stationA', JSON.stringify({rows: [{uppm: '4,0 V', bed: 'Inom tolerans'}, {uppm: '8,1', bed: 'Utanför tolerans'}, {uppm: ' '}], faults: [{slutsats: 'x'}, {}]}));
  saved.set(TREFASNYCKEL, JSON.stringify(['a', 'b', 'c']));
  const r = samla('Test Elev');
  assert.deepEqual(r.s, {y_Ugren: 230.94, d_P: 12.971}, 'bara kända fält, fem värdesiffror');
  assert.deepEqual(r.o, [0b101, 0, 1 << 9]);
  assert.equal(r.k[0], 1); assert.equal(r.k[8], 0); assert.equal(r.k.filter((x) => x >= 0).length, 2);
  assert.deepEqual(r.p[0], [2, 3, 1, 1]);
  assert.equal(r.tl, 3);
  const L = lage('Test Elev');
  assert.equal(L.kontroll, 2); assert.deepEqual(L.ovningar, [2, 0, 1]);
});

test('länken går till vecka 41:s lärarsida och avkodas tillbaka', async () => {
  sparaSvar({n_I3: 8.4});
  const {url, obj} = await lank('Test Elev', 'https://nj22az.github.io');
  assert.ok(url.startsWith(`https://nj22az.github.io${LARARSIDA}#r=`));
  const tillbaka = await avkoda(url.split('#r=')[1], 41);
  assert.deepEqual(tillbaka, obj);
  await assert.rejects(avkoda(url.split('#r=')[1], 40), /vecka 41/);
});

test('kontrollfrågorna i koden har samma ordning som den genererade listan', () => {
  assert.deepEqual(KONTROLLFRAGOR, KF.map((q) => q.id));
  for (const q of KF) assert.ok(q.ratt >= 0 && q.ratt < q.alternativ.length, q.id);
});

test('svarsfälten har unika nycklar och tal tolkas med komma', () => {
  const k = SVAR.flatMap((u) => u.falt.map(([x]) => x));
  assert.equal(new Set(k).size, k.length);
  assert.equal(tal('1 234,5'), 1234.5); assert.ok(Number.isNaN(tal('12 V')));
  assert.equal(SVARNYCKEL, 'sj-v41-svar');
});
