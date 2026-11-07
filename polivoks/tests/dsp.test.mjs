// Measurements of the circuit model against what the schematic implies.
// Run: cd polivoks && npm test   (Node 20+, no dependencies)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PolivoksFilter, PolivoksSynth, makeUnit, halfband, voltsPerOctave, PARTS, OPEN,
} from '../dsp/polivoks-dsp.js';

const FS = 192000;
const BASE = { frq: 0.8, att: 0.5, lvl: 1, res: 0, mix: 0, open: 0, cv1: 0, cv2: 0, vplus: 12, tempC: 25, hiss: 1, steps: 16 };
const ideal = () => makeUnit(1, 'ideal');

function control(c, unit = ideal()) { const f = new PolivoksFilter(FS, unit); f.control({ ...BASE, ...c }); return f; }
function run(c, input, secs, unit = ideal()) {
  const f = new PolivoksFilter(FS, unit);
  const n = Math.round(secs * FS), bp = new Float64Array(n), lp = new Float64Array(n), x = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    if (i % 16 === 0) f.control({ ...BASE, ...c });
    f.tick(input(i / FS)); bp[i] = f.bpo; lp[i] = f.lpo; x[i] = f.x;
  }
  return { f, bp, lp, x };
}
const rms = (a, from = 0) => { let s = 0; for (let i = from; i < a.length; i++) s += a[i] * a[i]; return Math.sqrt(s / (a.length - from)); };
const crossings = (a, from) => { let c = 0; for (let i = from + 1; i < a.length; i++) if (a[i - 1] < 0 && a[i] >= 0) c++; return c / ((a.length - from) / FS); };
const lpGainDb = (c, hz, A = 0.05) => {
  const r = run(c, (t) => A * Math.sin(2 * Math.PI * hz * t), 0.25);
  return 20 * Math.log10(rms(r.lp, FS * 0.1) / (A / Math.SQRT2) / (PARTS.R19 / PARTS.R17));
};

test('exponential converter: CV2 moves the cutoff one octave per Vt·ln2/R8 · R3 (≈0.594 V at 25 °C)', () => {
  const vpo = voltsPerOctave(PARTS, 25);
  assert.ok(Math.abs(vpo - 0.594) < 0.003, `volts per octave ${vpo}`);
  const a = control({ frq: 0.5 }).w0, b = control({ frq: 0.5, cv2: vpo }).w0;
  assert.ok(Math.abs(Math.log2(b / a) - 1) < 0.01, `octaves per vpo: ${Math.log2(b / a)}`);
});

test('FRQ knob alone spans the audio range: a few hertz to about ten kilohertz', () => {
  const lo = control({ frq: 0 }).w0 / (2 * Math.PI), hi = control({ frq: 1 }).w0 / (2 * Math.PI);
  assert.ok(lo > 1 && lo < 10, `FRQ 0: ${lo} Hz`);
  assert.ok(hi > 5000 && hi < 20000, `FRQ 1: ${hi} Hz`);
});

test('no temperature compensation: +10 °C raises the cutoff by more than an octave', () => {
  const a = control({ frq: 0.5, tempC: 25 }).w0, b = control({ frq: 0.5, tempC: 35 }).w0;
  const oct = Math.log2(b / a);
  assert.ok(oct > 1.1 && oct < 1.5, `drift ${oct} octaves per 10 °C`);
});

test('small-signal low-pass: unity DC gain, resonant peak at the predicted cutoff, 12 dB/octave', () => {
  const c = { res: 0.5 };
  const f = control(c), f0 = f.w0 / (2 * Math.PI);
  assert.ok(Math.abs(lpGainDb(c, f0 / 13)) < 0.3, 'DC gain through R4/R10 is unity before the ×1.33 buffer');
  const peak = lpGainDb(c, f0);
  assert.ok(Math.abs(peak - 20 * Math.log10(f.q)) < 1.5, `peak ${peak} dB vs Q ${f.q}`);
  const slope = lpGainDb(c, 8 * f0) - lpGainDb(c, 4 * f0);
  assert.ok(slope < -10 && slope > -14.5, `slope ${slope} dB/octave`);
});

test('resonance: Q rises from about 1 to oscillation at the end of the travel', () => {
  assert.ok(Math.abs(control({ res: 0 }).q - 1.04) < 0.05);
  assert.ok(control({ res: 0.9 }).q > 10);
  assert.equal(control({ res: 1 }).q, Infinity);
  assert.ok(control({ res: 1 }).knet < 0, "the op-amps' second pole gives negative damping at full resonance");
});

test('self-oscillation from the 776 hiss alone, pitch pulled down by slew limiting', () => {
  const quiet = run({ res: 0.95 }, () => 0, 0.6);
  assert.ok(rms(quiet.bp, FS * 0.4) < 0.05, `res 0.95 stays quiet: ${rms(quiet.bp, FS * 0.4)} V`);
  const loud = run({ res: 1 }, () => 0, 1.0);
  const f0 = loud.f.w0 / (2 * Math.PI), osc = crossings(loud.bp, FS * 0.8);
  assert.ok(rms(loud.bp, FS * 0.8) > 3, `oscillates: ${rms(loud.bp, FS * 0.8)} V rms`);
  assert.ok(osc < f0 && osc > 0.3 * f0, `oscillation ${osc} Hz below the small-signal ${f0} Hz`);
});

test('rails: extreme drive never passes the 776 swing and never produces NaN', () => {
  const r = run({ res: 1, frq: 1, cv2: 5 }, (t) => 12 * Math.sign(Math.sin(2 * Math.PI * 55 * t)), 0.3);
  const u = r.f.u.u2;
  for (let i = 0; i < r.x.length; i++) {
    assert.ok(Number.isFinite(r.bp[i]) && Number.isFinite(r.lp[i]));
    assert.ok(r.x[i] <= u.vpos + 1e-9 && r.x[i] >= u.vneg - 1e-9);
  }
});

test('mixer: RV5 at one end passes LP only, at the other BP only, ≈ equal power in the middle', () => {
  const lpEnd = control({ mix: 0 }), bpEnd = control({ mix: 1 }), mid = control({ mix: 0.5 });
  assert.ok(lpEnd.mk1 < 1e-9 && bpEnd.mk2 < 1e-9, 'the wiper end shorts the other signal');
  const gEnd = lpEnd.mk2 * lpEnd.mixInv, gMid = mid.mk2 * mid.mixInv;
  assert.ok(Math.abs(gEnd - 1.05) < 0.02, `end gain ${gEnd}`);
  assert.ok(Math.abs(2 * gMid * gMid - 1.1) < 0.1, `mid power ${2 * gMid * gMid}`);
});

test('a lifted wiper: FRQ open drops the cutoff, RESONANCE open makes it oscillate', () => {
  const base = control({ frq: 0.8, res: 0.5 });
  const frqOpen = control({ frq: 0.8, res: 0.5, open: OPEN.frq }), resOpen = control({ frq: 0.8, res: 0.5, open: OPEN.res });
  assert.ok(frqOpen.w0 < base.w0 / 4);
  assert.ok(resOpen.knet < 0);
});

test('units: reproducible by serial, distinct between serials, inside their tolerance', () => {
  assert.deepEqual(makeUnit(42, 'modern'), makeUnit(42, 'modern'));
  assert.notEqual(makeUnit(42, 'modern').q1.Is, makeUnit(43, 'modern').q1.Is);
  const u = makeUnit(7, 'modern');
  for (const k of Object.keys(PARTS)) if (/^R\d/.test(k)) assert.ok(Math.abs(u.R[k] / PARTS[k] - 1) <= 0.01 + 1e-12, k);
  const id = makeUnit(7, 'ideal');
  for (const k of Object.keys(PARTS)) assert.equal(id.R[k], PARTS[k]);
  assert.ok(id.u2.vos === 0 && id.warmRise === 0);
});

test('half-band decimators: flat to 20 kHz, below −80 dB from 27 kHz (96 → 48 kHz stage)', () => {
  const h = halfband(47, 8);
  const db = (f, rate) => { let re = 0, im = 0; for (let k = 0; k < h.length; k++) { re += h[k] * Math.cos((2 * Math.PI * f * k) / rate); im -= h[k] * Math.sin((2 * Math.PI * f * k) / rate); } return 20 * Math.log10(Math.hypot(re, im)); };
  for (const f of [100, 5000, 15000, 20000]) assert.ok(Math.abs(db(f, 96000)) < 0.05, `passband ${f}`);
  for (const f of [27000, 30000, 40000, 47000]) assert.ok(db(f, 96000) < -80, `stopband ${f}`);
});

function play(params, events, secs, fs = 48000, os = 4) {
  const s = new PolivoksSynth(fs, os, params);
  const N = 128, L = new Float32Array(N), P = new Float32Array(N), out = new Float32Array(Math.ceil((fs * secs) / N) * N);
  const ev = [...events].sort((a, b) => a[0] - b[0]);
  let e = 0;
  for (let b = 0; b * N < out.length; b++) {
    while (e < ev.length && ev[e][0] <= (b * N) / fs) s.message(ev[e++][1]);
    s.render(N, L, null, P, null); out.set(L, b * N);
  }
  return { s, out };
}

test('synth: a note sounds, stays within full scale, and is gone after the release', () => {
  const { out } = play({ 'imp.grade': 'ideal' }, [[0.05, { t: 'on', n: 45 }], [0.6, { t: 'off', n: 45 }]], 2.5);
  let pk = 0;
  for (const v of out) { assert.ok(Number.isFinite(v)); pk = Math.max(pk, Math.abs(v)); }
  assert.ok(pk > 0.1 && pk <= 1, `peak ${pk}`);
  const tail = out.subarray(out.length - 4800);
  assert.ok(rms(tail) < 1e-3, `after release ${rms(tail)}`);
});

test('synth: duo mode gives VCO 1 the lowest and VCO 2 the highest held note', () => {
  const { s } = play({ 'glob.mode': 'duo' }, [[0, { t: 'on', n: 60 }], [0.01, { t: 'on', n: 48 }], [0.02, { t: 'on', n: 67 }]], 0.05);
  assert.equal(s.vco[0].target, 0); assert.ok(Math.abs(s.vco[1].target - 19 / 12) < 1e-12);
});

test('synth: two unison saws start in step, so a held note keeps its own pitch (no cancelled fundamental)', () => {
  const sw = { 'imp.grade': 'ideal', 'vco1.wave': 'saw', 'vco2.wave': 'saw', 'vco2.detune': 0.5, 'mix.vco1': 0.8, 'mix.vco2': 0.8, 'flt.frq': 1, 'flt.res': 0, 'eg1.a': 0, 'eg1.s': 1, 'eg2.a': 0, 'eg2.s': 1 };
  const { out } = play(sw, [[0, { t: 'on', n: 60 }]], 0.4);
  const f = 261.6256, a = 4800, n = 9600;
  const h = (k) => { let re = 0, im = 0; for (let i = 0; i < n; i++) { const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / n); re += w * out[a + i] * Math.cos((2 * Math.PI * k * f * i) / 48000); im += w * out[a + i] * Math.sin((2 * Math.PI * k * f * i) / 48000); } return Math.hypot(re, im); };
  assert.ok(h(1) > 1.5 * h(2), `C4 fundamental ${h(1).toFixed(1)} against its octave ${h(2).toFixed(1)}`);
});

test('synth: worn pots crackle when turned, ideal pots never do', () => {
  const turn = (grade) => {
    const s = new PolivoksSynth(48000, 4, { 'imp.grade': grade, 'imp.wear': 1 });
    let opens = 0;
    for (let k = 0; k < 40; k++) { s.message({ t: 'p', k: 'flt.frq', v: k % 2 ? 0.3 : 0.7 }); if (s.openT[0] > 0) opens++; s.openT[0] = 0; }
    return opens;
  };
  assert.ok(turn('vintage') > 5); assert.equal(turn('ideal'), 0);
});

test('synth: line input reaches the filter at unity gain through the interpolators', () => {
  const s = new PolivoksSynth(48000, 4, { src: 'line', 'vca.mode': 'open', 'flt.frq': 1, 'flt.lvl': 1, 'flt.res': 0, 'imp.grade': 'ideal' });
  const N = 128, L = new Float32Array(N), line = new Float32Array(N), out = [];
  for (let b = 0; b < 300; b++) {
    for (let i = 0; i < N; i++) line[i] = 0.2 * Math.sin((2 * Math.PI * 440 * (b * N + i)) / 48000);
    s.render(N, L, null, null, line); if (b > 200) out.push(...L);
  }
  // 0.2 FS → 1 V at AUDIO IN → LP ×1.333 → 0.12/V at volume 0.7² → 0.0784 peak
  const r = rms(Float64Array.from(out)), want = (0.2 * 5 * (PARTS.R19 / PARTS.R17) * 0.12 * 0.49) / Math.SQRT2;
  assert.ok(Math.abs(r / want - 1) < 0.05, `line through: ${r} vs ${want}`);
});

test('budget: the full voice renders at least twice as fast as real time at 4× oversampling', () => {
  const t0 = performance.now();
  play({}, [[0, { t: 'on', n: 40 }]], 4);
  const ratio = 4000 / (performance.now() - t0);
  assert.ok(ratio > 2, `${ratio.toFixed(1)}× real time`);
});
