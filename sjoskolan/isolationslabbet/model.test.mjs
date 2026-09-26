import test from 'node:test';
import assert from 'node:assert/strict';
import { itNet, insulationTest, isClose } from './model.mjs';
import { CHALLENGES, DEFAULTS, expected } from './lessons.mjs';

const net = (p) => itNet({ ...DEFAULTS, ...p });

test('friskt symmetriskt nät: skrovet i stjärnpunkten', () => {
  const r = net({ R: [5e6, 5e6, 5e6], C: 1e-6 });
  for (const u of r.Uhull) assert.ok(isClose(u, 440 / Math.sqrt(3)));
  assert.ok(isClose(r.Riso, 5e6 / 3)); assert.equal(r.alarm, false); assert.equal(r.second, null);
});
test('fullständigt jordfel på L1: friska faser får huvudspänning mot skrovet', () => {
  const r = net({ R: [0, 10e6, 10e6], C: 1e-6 });
  assert.ok(r.Uhull[0] < 1); assert.ok(isClose(r.Uhull[1], 440)); assert.ok(isClose(r.Uhull[2], 440));
  assert.equal(r.alarm, true); assert.equal(r.faultPhase, 0);
});
test('första felets ström = 3ωC·UF', () => {
  const r = net({ R: [0, 1e12, 1e12], C: 1e-6, f: 50 });
  assert.ok(isClose(r.Ifault, 3 * 2 * Math.PI * 50 * 1e-6 * 440 / Math.sqrt(3), { rel: 0.005 }));
});
test('utan kapacitans och med högohmiga friska faser blir första felets ström liten', () => {
  const r = net({ R: [0, 10e6, 10e6], C: 0 });
  assert.ok(r.Ifault < 1e-4);
});
test('andra jordfelet ger kortslutning via skrovet', () => {
  const r = net({ R: [0, 0, 10e6], Rloop: 0.08 });
  assert.deepEqual(r.second.phases, [0, 1]); assert.ok(isClose(r.second.I, 440 / 0.08, { rel: 0.001 }));
});
test('larmgräns', () => {
  assert.equal(net({ R: [120e3, 10e6, 10e6], larm: 100e3 }).alarm, false);
  assert.equal(net({ R: [80e3, 10e6, 10e6], larm: 100e3 }).alarm, true);
});
test('isolationsprovning kräver frånskilt objekt och ger R = U/I', () => {
  assert.ok(insulationTest({ obj: 'motor-fukt', par: 'L1-PE', Uprov: 500, frans: false }).error);
  const t = insulationTest({ obj: 'motor-fukt', par: 'L1-PE', Uprov: 500, frans: true });
  assert.ok(isClose(t.I, 0.4e-3)); assert.ok(isClose(t.R, 1.25e6));
});
test('uppgifternas facit', () => {
  const want = { riso: 0.75, larm: 117.6, symmetri: 254, forsta: 440, kapstrom: 239.4, andra: 5.5, prov: 1.25, kabel: 10 };
  for (const c of CHALLENGES) assert.ok(isClose(expected(c), want[c.id], { rel: 0.01 }), `${c.id}: ${expected(c)}`);
  for (const c of CHALLENGES) for (const m of c.mistakes) assert.ok(!isClose(m.v, expected(c), { rel: 0.02 }), `${c.id} misstag ${m.v} är rätt svar`);
});
