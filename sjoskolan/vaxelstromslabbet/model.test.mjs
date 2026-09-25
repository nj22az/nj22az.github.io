import test from 'node:test';
import assert from 'node:assert/strict';
import { waveform, instant, phaseFromDelay, seriesCircuit, loadPower, resonance, instantPower, fmt, parseAnswer, isClose, shapeValue } from './model.mjs';
import { CHALLENGES, DEFAULTS, readouts, expected } from './lessons.mjs';

const near = (a, b, tol = 1e-3) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);

test('sinus: 230 V RMS ger 325 V topp och 20 ms period vid 50 Hz', () => {
  const w = waveform({ urms: 230, f: 50 });
  near(w.peak, 325.27, 0.01); near(w.pp, 650.54, 0.02); near(w.T, 0.02, 1e-9);
});

test('presentationsexempel: 30 V topp-topp och 10 ms', () => {
  const peak = 15; const w = waveform({ urms: peak / Math.SQRT2, f: 100 });
  near(w.rms, 10.61, 0.01); near(w.T, 0.01, 1e-9);
});

test('fyrkant och triangel har olika RMS-faktor', () => {
  near(waveform({ urms: 12, f: 50, shape: 'fyrkant' }).peak, 12);
  near(waveform({ urms: 12, f: 50, shape: 'triangel' }).peak, 12 * Math.sqrt(3));
  near(shapeValue('triangel', Math.PI / 2), 1); near(shapeValue('triangel', 3 * Math.PI / 2), -1);
});

test('momentanvärde: u(t) = 10 sin(2π·25t) vid 10 ms är 10 V', () => {
  near(instant({ urms: 10 / Math.SQRT2, f: 25 }, 0.01), 10, 1e-9);
  near(instant({ urms: 17 / Math.SQRT2, f: 50 }, 0.015), -17, 1e-9);
});

test('fasvinkel från tidsförskjutning', () => {
  near(phaseFromDelay(0.005, 50), 90); near(phaseFromDelay(0.002, 50), 36); near(phaseFromDelay(-0.005, 50), -90);
  near(phaseFromDelay(0.02, 50), 0);
});

test('RL-exempel: R 12 Ω, Xᴸ 16 Ω, 60 V ger 20 Ω och 3 A', () => {
  const L = 16 / (2 * Math.PI * 50);
  const r = seriesCircuit({ kind: 'RL', U: 60, f: 50, R: 12, L, C: 0 });
  near(r.Z, 20); near(r.I, 3); near(r.UR, 36); near(r.UL, 48); near(r.phi, 53.13, 0.01);
  assert.equal(r.character, 'induktiv');
});

test('RC-exempel: negativ fasvinkel −53,1°', () => {
  const C = 1 / (2 * Math.PI * 50 * 16);
  const r = seriesCircuit({ kind: 'RC', U: 60, f: 50, R: 12, L: 1, C });
  near(r.XL, 0); near(r.I, 3); near(r.phi, -53.13, 0.01); assert.equal(r.character, 'kapacitiv');
});

test('reaktanser: 0,10 H och 100 µF vid 50 Hz', () => {
  const r = seriesCircuit({ kind: 'RLC', U: 100, f: 50, R: 30, L: 0.1, C: 100e-6 });
  near(r.XL, 31.42, 0.01); near(r.XC, 31.83, 0.01);
});

test('resonans: Xᴸ = Xᶜ och I = U/R', () => {
  const L = 0.1, C = 100e-6; const f0 = resonance(L, C);
  near(f0, 50.33, 0.01);
  const r = seriesCircuit({ kind: 'RLC', U: 100, f: f0, R: 20, L, C });
  near(r.X, 0, 1e-9); near(r.I, 5); assert.equal(r.character, 'resistiv');
});

test('effekttriangel: 900 W och 1 200 var ger 1 500 VA och PF 0,60', () => {
  const r = loadPower({ U: 230, P: 900, pf: 0.6, character: 'induktiv' });
  near(r.S, 1500); near(r.Q, 1200); near(r.phi, 53.13, 0.01);
});

test('kompensering: PF 0,50 → 1,00 halverar strömmen och kvarterar förlusten', () => {
  const base = loadPower({ U: 240, P: 1200, pf: 0.5, Rcable: 1 });
  const full = loadPower({ U: 240, P: 1200, pf: 0.5, Rcable: 1, Qc: base.QcFull });
  near(base.I, 10); near(full.after.I, 5); near(full.after.PF, 1); near(full.after.loss / base.loss, 0.25);
});

test('kapacitiv last har negativ Q', () => {
  const r = loadPower({ U: 230, P: 1000, pf: 0.8, character: 'kapacitiv' });
  near(r.Q, -750); near(r.phi, -36.87, 0.01);
});

test('momentan effekt: ren reaktans har medeleffekt noll', () => {
  let sum = 0; const n = 2000;
  for (let k = 0; k < n; k++) sum += instantPower({ U: 230, I: 4, f: 50, phiDeg: 90 }, k / n / 50).p;
  near(sum / n, 0, 1e-6);
  let sumR = 0;
  for (let k = 0; k < n; k++) sumR += instantPower({ U: 230, I: 4, f: 50, phiDeg: 0 }, k / n / 50).p;
  near(sumR / n, 920, 1e-6);
});

test('svensk formatering och tolkning av svar', () => {
  assert.equal(fmt(325.269), '325');
  assert.equal(fmt(16.6667), '16,7');
  assert.equal(fmt(0.02), '0,0200');
  assert.equal(fmt(1840), '1 840');
  near(parseAnswer(' 16,7 '), 16.7); near(parseAnswer('−53,1'), -53.1); near(parseAnswer('1 840'), 1840);
  assert.ok(Number.isNaN(parseAnswer('abc'))); assert.ok(Number.isNaN(parseAnswer('')));
  assert.ok(isClose(16.7, 16.667, { rel: 0.01 })); assert.ok(!isClose(17.5, 16.667, { rel: 0.01 }));
});

test('alla uppgifter har rimliga facit och masker', () => {
  const want = {
    period: 16.667, topp: 33.94, moment: 10.0, fas: 45, xl: 49.95, strom: 2.0, rc: -53.1, resonans: 50.33,
    skenbar: 1840, reaktiv: 1217, matstrom: 20, kompensering: 1500,
  };
  assert.equal(CHALLENGES.length, Object.keys(want).length);
  for (const c of CHALLENGES) {
    const e = expected(c);
    assert.ok(Math.abs(e - want[c.id]) <= Math.abs(want[c.id]) * 0.01 + 0.05, `${c.id}: ${e}`);
    assert.ok(c.mask.includes(c.ask.key), `${c.id} döljer inte svaret`);
    for (const k of Object.keys(DEFAULTS[c.tab])) assert.ok(k in c.setup, `${c.id} saknar ${k}`);
    assert.ok(isClose(e, e, c.ask));
  }
});

test('avläsningar för standardlägen är ändliga', () => {
  for (const tab of Object.keys(DEFAULTS)) {
    for (const [k, v] of Object.entries(readouts(tab, DEFAULTS[tab]))) {
      if (typeof v === 'number') assert.ok(Number.isFinite(v), `${tab}.${k}`);
    }
  }
});
