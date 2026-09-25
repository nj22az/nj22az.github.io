import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNum, deviation, deviationMatches, missing, emptyData, protocolCSV } from './labbprotokoll.mjs';

test('läser tal med decimalkomma och enhet', () => {
  assert.equal(parseNum('11,94 V'), 11.94);
  assert.equal(parseNum('−0,06'), -0.06);
  assert.equal(parseNum('2 010 Ω'), 2010);
  assert.ok(Number.isNaN(parseNum('OL')));
});
test('avvikelse är uppmätt minus förväntat', () => {
  const d = deviation('12', '11,94 V');
  assert.ok(Math.abs(d.abs + 0.06) < 1e-9);
  assert.ok(Math.abs(d.rel + 0.5) < 1e-9);
  assert.equal(deviation('', '3'), null);
});
test('kontrollerar elevens egen avvikelse, även tecknet', () => {
  assert.equal(deviationMatches('-0,06', '12', '11,94'), true);
  assert.equal(deviationMatches('0,06', '12', '11,94'), false);
  assert.equal(deviationMatches('', '12', '11,94'), null);
});
test('listar vad som saknas och godkänner ett komplett protokoll', () => {
  const def = { checks: [{ k: 'a', text: 'A' }], rows: [{}, { optional: true }], faults: 1, questions: [{ k: 'q', label: 'Slutsats', minWords: 3 }] };
  const d = emptyData(def);
  assert.equal(missing(def, d).length, 5);
  assert.deepEqual(emptyData({ rows: [{ storhet: 'U', forv: 'räkna' }] }).rows[0], { storhet: 'U' });
  Object.assign(d, { head: { namn: 'Kim' }, checks: { a: true }, answers: { q: 'Värdet ligger inom toleransen.' } });
  d.rows[0] = { forv: '4', uppm: '3,98', bed: 'Inom tolerans' };
  d.faults[0] = { obs: 'x', hyp: 'y', kontroll: 'z', resultat: 'w' };
  assert.deepEqual(missing(def, d), []);
});
test('CSV skyddar mot formler', () => {
  const def = { title: 'T', rows: [{}] }; const d = emptyData(def); d.rows[0] = { komm: '=SUM(A1)' };
  assert.ok(protocolCSV(def, d).includes(`"'=SUM(A1)"`));
});
