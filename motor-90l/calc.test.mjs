// node --test motor-90l/calc.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { summary, windingFactors, hipot, slotArea, lineCurrent, IEC } from './calc.mjs';

const S = summary();
const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test('rated currents and torque match the specification', () => {
  near(S.Istar, 3.3, 0.05);
  near(S.Idelta, 5.7, 0.05);
  near(S.T, 9.95, 0.05);
  near(lineCurrent(1500, 400, 0.835, 0.79) * Math.sqrt(3), S.Idelta, 0.05); // Δ at 230 ≈ Y at 400 × √3
});

test('36 slots, 4 poles, pitch 1–8', () => {
  assert.equal(S.q, 3);
  near(windingFactors(36, 4, 7).kw, 0.902, 0.001);
  near(windingFactors(36, 4, 9).kp, 1, 1e-9); // full pitch
});

test('38 turns per coil does not fit; ≈ 24 is right', () => {
  assert.ok(S.winding.BgWithSpec < 0.5);
  assert.ok(S.fillSpec.copperFill > 0.6);
  near(S.winding.turnsPerCoil, 24, 1);
  assert.ok(S.fillFix.copperFill < 0.45);
});

test('modelled slot and iron loading are plausible', () => {
  near(slotArea(), 94, 1);
  assert.ok(S.iron.Byoke < 1.6 && S.iron.Btooth < 1.8);
  assert.ok(S.esson > 80 && S.esson < 130);
});

test('test voltages and standard dimensions', () => {
  assert.equal(hipot(400), 1800);
  assert.equal(hipot(230), 1500);
  assert.equal(S.flangeBelowFeet, 10);
  assert.equal(IEC.GA - IEC.D / 2, 15);
});
