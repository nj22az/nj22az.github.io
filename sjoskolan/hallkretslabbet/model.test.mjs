import test from 'node:test';
import assert from 'node:assert/strict';
import { solve, meter, isClose } from './model.mjs';
import { CHALLENGES, DEFAULTS, run, expected } from './lessons.mjs';

test('hållning: START drar, K1 håller efter släpp, STOPP släpper', () => {
  const { r: a } = run([{}]); assert.equal(a.k1, false);
  const { r: b } = run([{}, { s1: true }]); assert.equal(b.k1, true); assert.ok(isClose(b.I, 0.05));
  const { r: c } = run([{}, { s1: true }, { s1: false }]); assert.equal(c.k1, true);
  const { r: d } = run([{}, { s1: true }, { s1: false }, { s0: true }]); assert.equal(d.k1, false);
  const { r: e } = run([{}, { s1: true }, { s1: false }, { s0: true }, { s0: false }]); assert.equal(e.k1, false);
});
test('spänningsbortfall: K1 släpper och startar inte själv', () => {
  const { r } = run([{}, { s1: true }, { s1: false }, { supply: false }, { supply: true }]); assert.equal(r.k1, false);
});
test('fel: hjälpkontakt, spole och retur', () => {
  assert.equal(run([{ fault: 'hall' }, { s1: true }, { s1: false }]).r.k1, false);
  assert.equal(run([{ fault: 'spole' }, { s1: true }]).r.k1, false);
  const { r } = run([{ fault: 'retur' }, { s1: true }]); assert.equal(r.k1, false); assert.equal(r.V.c, 24);
  const s0 = run([{ fault: 's0' }, { s1: true }]).r; assert.equal(s0.k1, false); assert.equal(s0.V.a, 0);
});
test('flytande punkter ger inget värde', () => {
  const r = solve({ ...DEFAULTS, fault: 'retur', s0: true }, false); assert.ok(Number.isNaN(meter(r.V, 'b', 'N')));
});
test('uppgifter: facit, masker och typfel', () => {
  const want = { vila: 24, start: 24, strom: 50, stopp: 24, hall: 24, retur: 24, hallning: 0, avbrott: 0 };
  assert.equal(CHALLENGES.length, Object.keys(want).length);
  for (const c of CHALLENGES) {
    const e = expected(c); assert.ok(isClose(e, want[c.id]), `${c.id}: ${e}`);
    assert.ok(c.mask.includes('meter') && c.solution, c.id);
    for (const m of c.mistakes()) assert.ok(!isClose(m.v, e, c.ask), `${c.id}: felsvar ${m.v} godkänns`);
  }
});
