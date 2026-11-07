// The Johansson SC-90 chip (chip.js): pitch, waveforms, noise and clean edges.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLOCK, DUTIES, FS, Lfsr, TRI_STEPS, chipHz, envAt, idealHz, output, render } from '../chip.js';

const cents = (a, b) => 1200 * Math.log2(a / b);
const tone = (voice, score, extra = {}) => render({ bpm: 60, meter: 4, bars: 1, swing: 0.5, voices: { v: { voice, score, gate: 1, env: { a: 0.002, d: 1, s: 1, r: 0.05 }, ...extra } } }, { tail: 0.2 });
const mag = (x, f, a, len) => { let re = 0, im = 0; for (let i = 0; i < len; i++) { const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / len); re += w * x[a + i] * Math.cos((2 * Math.PI * f * i) / FS); im += w * x[a + i] * Math.sin((2 * Math.PI * f * i) / FS); } return Math.hypot(re, im) / (len / 4); };

test('pitch: a 4 MHz clock divided down, within 3 cents of equal temperament from C2 to C6', () => {
  assert.equal(CLOCK, 4e6);
  for (let m = 36; m <= 84; m++) assert.ok(Math.abs(cents(chipHz(idealHz(m)), idealHz(m))) < 3, `note ${m}: ${cents(chipHz(idealHz(m)), idealHz(m)).toFixed(2)} cents`);
  assert.ok(Math.abs(cents(chipHz(idealHz(96)), idealHz(96))) < 8, 'C7 within 8 cents');
});

test('a pulse plays its note, at the duty asked for', () => {
  for (const duty of DUTIES) {
    const x = tone('pulse1', 'A4:4 |', { duty });
    let up = 0, n = 0, rises = 0;
    for (let i = FS; i < 3 * FS; i++) { n++; if (x[i] > 0) up++; if (x[i - 1] <= 0 && x[i] > 0) rises++; }
    assert.ok(Math.abs(rises / 2 - chipHz(440)) < 0.6, `${duty}: ${rises / 2} Hz`);
    assert.ok(Math.abs(up / n - duty) < 0.02, `duty ${duty}: high ${(up / n).toFixed(3)} of the time`);
  }
});

test('band-limited edges: a high pulse has no aliases between its harmonics', () => {
  const x = tone('pulse1', 'C7:4 |', { duty: 0.25 }), f = chipHz(idealHz(96));
  const h1 = mag(x, f, FS, 16384);
  let worst = 0;
  for (let k = 1; k * f < 20000; k++) worst = Math.max(worst, mag(x, (k + 0.5) * f, FS, 16384)); // halfway between harmonics
  assert.ok(20 * Math.log10(worst / h1) < -40, `alias ${(20 * Math.log10(worst / h1)).toFixed(1)} dB under the fundamental`);
});

test('the triangle is 4-bit: 32 steps, 16 levels, and plays its note', () => {
  assert.equal(TRI_STEPS.length, 32);
  assert.deepEqual([Math.min(...TRI_STEPS), Math.max(...TRI_STEPS), new Set(TRI_STEPS).size], [0, 15, 16]);
  const x = tone('triangle', 'C3:4 |'), f = chipHz(idealHz(48));
  assert.ok(mag(x, f, FS, 16384) > 20 * mag(x, 2 * f, FS, 16384), 'odd harmonics only: no second harmonic');
  assert.ok(mag(x, f, FS, 16384) > 0.5, 'loud fundamental');
});

test('noise: the 15-bit register runs 32 767 steps before it repeats', () => {
  const r = new Lfsr(), start = r.s;
  let n = 0;
  do { r.step(); n++; } while (r.s !== start && n < 40000);
  assert.equal(n, 32767);
});

test('envelopes start and stop without a step', () => {
  const e = { a: 0.003, d: 0.3, s: 0.5, r: 0.1 };
  assert.equal(envAt(0, 1, e), 0);
  assert.ok(Math.abs(envAt(1 + 1e-6, 1, e) - envAt(1 - 1e-6, 1, e)) < 1e-4, 'release starts where the note was');
  const x = output(tone('pulse1', 'E5:1 G5 C6 E5 |', { duty: 0.5 }));
  let step = 0; for (let i = 1; i < x.length; i++) step = Math.max(step, Math.abs(x[i] - x[i - 1]));
  assert.ok(step < 1.2, `largest sample step ${step.toFixed(3)} (a full-scale square edge, band-limited, is about 1)`);
});
