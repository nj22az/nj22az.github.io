// Veckoöversiktens räkning (gemensamt/veckopanel.mjs): steg, lästa delar, övningar och kursplanens punkter.
import test from 'node:test';
import assert from 'node:assert/strict';
import { rakna, dagarKvar } from './veckopanel.mjs';

const data = {
  vecka: 42, sista: '2026-10-18', steg: ['steg-1', 'steg-2', 'steg-3'], delar: [1, 2, 3],
  ovningar: [['vecka-42', ['v42_01-q1', 'v42_01-q2', 'v42_02-q1']]],
  mal: [
    { id: 'LM-2', ovningar: [['vecka-42', ['v42_01-q1', 'v42_01-q2']]], annat: 'Inlämningen' },
    { id: 'LM-4', ovningar: [], annat: 'Inlämningen' },
  ],
};
const lagring = varden => nyckel => varden[nyckel] ?? {};

test('tom webbläsare: nollor och rätt totaler', () => {
  const r = rakna(data, lagring({}));
  assert.deepEqual(r.steg, [0, 3]);
  assert.deepEqual(r.delar, [0, 3]);
  assert.deepEqual(r.ovningar, [0, 3]);
  assert.equal(r.inlamning, null);
  assert.deepEqual(r.mal.map(m => [m.id, m.gjort, m.totalt]), [['LM-2', 0, 2], ['LM-4', 0, 0]]);
});

test('bockade steg, lästa delar och övningar räknas; okända nycklar räknas inte', () => {
  const r = rakna(data, lagring({
    'sj-steg:vecka-42': { 'steg-1': true, 'steg-3': true, 'steg-9': true },
    'sj-last:vecka-42': { 'del-1': '2026-10-12T10:00:00Z', 'del-3': null },
    'sj-ovningar:/sjoskolan/vecka-42/aktuell/Formelstod_och_ovningar.html': { 'v42_01-q1': true, 'v42_02-q1': true, 'v42_09-q1': true, 'v42_01-q2': false },
  }));
  assert.deepEqual(r.steg, [2, 3]);
  assert.deepEqual(r.delar, [1, 3]);
  assert.deepEqual(r.ovningar, [2, 3]);
  assert.deepEqual(r.mal[0].gjort, 1);
});

test('inlämningens status per punkt läggs till övningarna', () => {
  const status = {
    inlamnad: null, last: false, lasning: { 'del-2': '2026-10-13T16:00:00Z' },
    uppgifter: [{ nr: 2, ratt: 2, totalt: 4 }, { nr: 3, ratt: 1, totalt: 3 }],
    lm: { 'LM-2': { ratt: 2, totalt: 4 }, 'LM-4': { ratt: 1, totalt: 2 } },
  };
  const r = rakna(data, lagring({}), status);
  assert.deepEqual(r.delar, [1, 3], 'läsningen kommer från inlämningens status');
  assert.deepEqual(r.mal.map(m => [m.id, m.gjort, m.totalt]), [['LM-2', 2, 6], ['LM-4', 1, 2]]);
  assert.equal(r.inlamning.text, '3 av 7 rätt');
  assert.equal(r.inlamning.not, 'Fortsätt i formuläret');
  assert.equal(rakna(data, lagring({}), { ...status, last: true }).inlamning.not, 'Läs om veckan för nya försök');
  assert.equal(rakna(data, lagring({}), { ...status, inlamnad: '2026-10-17T20:00:00Z' }).inlamning.text, 'Inlämnad');
});

test('formuläret inte öppnat: rutan står kvar, punkterna räknar inlämningens fält från sidan', () => {
  const medFalt = { ...data, mal: [{ ...data.mal[0], inlamning: 13 }, data.mal[1]] };
  const tom = { namn: '', inlamnad: null, uppgifter: [], lm: {}, last: false, lasning: { 'del-1': null, 'del-2': null, 'del-3': null, text: null } };
  const r = rakna(medFalt, lagring({}), tom);
  assert.equal(r.inlamning, null, 'ingen ”0 av 0 rätt”');
  assert.deepEqual(r.mal.map(m => [m.id, m.gjort, m.totalt]), [['LM-2', 0, 15], ['LM-4', 0, 0]]);
});

test('dagar kvar räknas i kalenderdagar till sista dagen', () => {
  assert.equal(dagarKvar('2026-10-18', new Date(2026, 9, 11, 23, 30)), 7);
  assert.equal(dagarKvar('2026-10-18', new Date(2026, 9, 17, 8, 0)), 1);
  assert.equal(dagarKvar('2026-10-18', new Date(2026, 9, 18, 22, 0)), 0);
  assert.equal(dagarKvar('2026-10-18', new Date(2026, 9, 19, 7, 0)), -1);
});
