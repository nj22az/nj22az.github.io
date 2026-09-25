import test from 'node:test';
import assert from 'node:assert/strict';
import { neutralCurrent, starLoads, symmetricLoad, motorConnection, windingRatio, phaseFromLine, lineFromPhase, isClose, fmt } from './model.mjs';
import { CHALLENGES, DEFAULTS, readouts, expected } from './lessons.mjs';
const near = (a, b, tol = 1e-3) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);

test('√3 mellan fas- och linjespänning', () => { near(phaseFromLine(400), 230.94, 0.01); near(lineFromPhase(100), 173.2, 0.01); });

test('neutralström: symmetri ger noll, en fas ger fasströmmen, två lika ger samma belopp', () => {
  near(neutralCurrent([{ I: 8 }, { I: 8 }, { I: 8 }]).IN, 0, 1e-9);
  near(neutralCurrent([{ I: 5 }, { I: 0 }, { I: 0 }]).IN, 5);
  near(neutralCurrent([{ I: 6 }, { I: 6 }, { I: 0 }]).IN, 6);
  near(neutralCurrent([{ I: 10 }, { I: 10 }, { I: 4 }]).IN, 6);
});

test('bruten neutral: två laster i serie över linjespänningen', () => {
  const r = starLoads({ UL: 400, R: [23, 46, Infinity], neutral: false });
  near(r.Uabs[0], 400 * 23 / 69, 0.01); near(r.Uabs[1], 400 * 46 / 69, 0.01); near(r.Iabs[0], r.Iabs[1], 1e-9);
  const ok = starLoads({ UL: 400, R: [23, 46, Infinity], neutral: true });
  near(ok.Uabs[0], 230.94, 0.01); near(ok.Uabs[1], 230.94, 0.01);
});

test('bruten neutral med symmetrisk last påverkar inte', () => {
  const r = starLoads({ UL: 400, R: [20, 20, 20], neutral: false });
  near(r.shift, 0, 1e-9); r.Uabs.forEach((u) => near(u, 230.94, 0.01));
});

test('Y och Δ: presentationens exempel 20 Ω vid 200 V', () => {
  near(symmetricLoad({ UL: 200, Z: 20, conn: 'Y' }).IL, 5.774, 0.001);
  near(symmetricLoad({ UL: 200, Z: 20, conn: 'Δ' }).IL, 17.32, 0.01);
  const p = symmetricLoad({ UL: 400, Z: 400 / Math.sqrt(3) / 10, pf: 0.8, conn: 'Y' });
  near(p.IL, 10); near(p.S, 6928.2, 0.1); near(p.P, 5542.6, 0.1);
});

test('motorns koppling ur märkningen', () => {
  assert.equal(motorConnection({ Ulow: 230, Uhigh: 400, UL: 400 }), 'Y');
  assert.equal(motorConnection({ Ulow: 400, Uhigh: 690, UL: 400 }), 'Δ');
  assert.equal(motorConnection({ Ulow: 230, Uhigh: 400, UL: 690 }), null);
  near(windingRatio({ Ulow: 230, UL: 400, conn: 'Δ' }), 400 / 230);
});

test('alla uppgifter: facit, masker och att typfel inte godkänns', () => {
  const want = { uf: 398.4, in2: 12, in3: 4, bruten: 266.7, inr: 8.69, ystrom: 13.28, dstrom: 25.98, p3: 16.19 };
  assert.equal(CHALLENGES.length, Object.keys(want).length);
  for (const c of CHALLENGES) {
    const e = expected(c);
    assert.ok(Math.abs(e - want[c.id]) <= Math.abs(want[c.id]) * 0.01, `${c.id}: ${e}`);
    assert.ok(c.mask.includes(c.ask.key), `${c.id} döljer inte svaret`);
    for (const k of Object.keys(DEFAULTS[c.tab])) assert.ok(k in c.setup, `${c.id} saknar ${k}`);
    assert.ok(c.solution, `${c.id} saknar lösning`);
    for (const m of c.mistakes()) assert.ok(!isClose(m.v, e, c.ask), `${c.id}: felsvar ${m.v} godkänns`);
  }
});

test('standardlägen ger ändliga avläsningar', () => {
  for (const tab of Object.keys(DEFAULTS)) for (const [k, v] of Object.entries(readouts(tab, DEFAULTS[tab]))) if (typeof v === 'number') assert.ok(Number.isFinite(v), `${tab}.${k}`);
  assert.equal(fmt(398.37), '398');
});
