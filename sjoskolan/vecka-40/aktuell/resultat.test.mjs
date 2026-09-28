// Resultatkodens datakontrakt. Inga presenter-, sorterings- eller gränssnittstester.
// Kör: node --test sjoskolan/vecka-40/aktuell/resultat.test.mjs
import test, {beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {deflateRawSync, inflateRawSync} from 'node:zlib';
import {GUIDE_TASKS} from '../../vaxelstromslabbet/guided-lessons.mjs';
import {DNYCKEL} from '../../gemensamt/elevtal.mjs';
import {STUDY} from './arbetsrum.gen.mjs';
import {STUDY_KEY} from './studieprogress.mjs';
import {
  koda, avkoda, lank, samla, tal, sparaSvar,
  SVARNYCKEL, LABBNYCKEL, OVNINGSNYCKEL, LARARSIDA,
} from './resultat.mjs';

const BAS = 'https://nj22az.github.io';
const NOW = Date.UTC(2026, 8, 28, 8, 0);
let saved;
function override(t, key, value) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, key, {configurable: true, writable: true, value});
  t.after(() => descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key]);
}
beforeEach((t) => {
  saved = new Map([[DNYCKEL, '7']]);
  override(t, 'localStorage', {
    getItem: (key) => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, String(value)),
  });
  // Varje tidsstämpel och QR-längd ska vara reproducerbar.
  t.mock.method(Date, 'now', () => NOW);
});
const put = (key, value) => saved.set(key, JSON.stringify(value));
const lab = (rows, D = 7) => put(LABBNYCKEL, {D, rows});
const fixture = () => ({
  v: 1, w: 40, n: 'Åsa Nguyễn 山田 🧭', d: 7, t: NOW / 60000,
  s: {u1_top: 23.456, u2_I: 0.125, u2_fi: -30.25}, o: [513, 2, 0],
  g: [[2, [20], 1, 'Spänningen ökar – Δφ ≈ 30°; 測定 🧭 e\u0301.'], 0], gd: 13,
});
// Oberoende kodning/avkodning låser formatet, inte bara två funktioner som kan dela samma fel.
function wire(obj, format) {
  const raw = Buffer.from(JSON.stringify(obj));
  return format + (format === 'z' ? deflateRawSync(raw) : raw).toString('base64url');
}
function unwire(code) {
  const raw = Buffer.from(code.slice(1), 'base64url');
  return JSON.parse((code[0] === 'z' ? inflateRawSync(raw) : raw).toString('utf8'));
}

for (const format of ['z', 'j']) {
  test(`${format}: rundtur bevarar tal, Unicode, labbrader och separat gd`, async (t) => {
    if (format === 'j') override(t, 'CompressionStream', undefined);
    const obj = fixture(), before = structuredClone(obj);
    const code = await koda(obj);
    assert.equal(code[0], format);
    assert.match(code.slice(1), /^[A-Za-z0-9_-]+$/);
    assert.deepEqual(unwire(code), before);
    assert.deepEqual(await avkoda(code), before);
    assert.deepEqual(await avkoda(wire(before, format)), before);
    assert.deepEqual(obj, before, 'kodning ändrar inte originalet');
  });
  test(`${format}: fel version och vecka avvisas`, async () => {
    for (const change of [{v: 2}, {v: '1'}, {v: null}, {w: 39}, {w: 41}, {w: '40'}]) {
      await assert.rejects(avkoda(wire({...fixture(), ...change}, format)), /fel version eller vecka/);
    }
    for (const obj of [null, {}, {v: 1}, {w: 40}]) {
      await assert.rejects(avkoda(wire(obj, format)), /fel version eller vecka/);
    }
  });
  test(`${format}: saknade labbdata förblir saknade vid avkodning`, async () => {
    const obj = {v: 1, w: 40, d: 7, n: 'Åsa Öberg'};
    assert.deepEqual(await avkoda(wire(obj, format)), obj);
    obj.g = [0, [0, [null], 0, '']];
    assert.deepEqual(await avkoda(wire(obj, format)), obj);
  });
}

test('j: fungerar även utan DecompressionStream', async (t) => {
  override(t, 'CompressionStream', undefined);
  override(t, 'DecompressionStream', undefined);
  assert.deepEqual(await avkoda(await koda(fixture())), fixture());
});
test('z: saknat dekomprimeringsstöd ger ett begripligt fel', async (t) => {
  override(t, 'DecompressionStream', undefined);
  await assert.rejects(avkoda(wire(fixture(), 'z')), /saknar stöd för komprimerade resultatkoder/);
});
test('ett dekomprimeringsfel utan meddelande får en förklaring', async (t) => {
  override(t, 'DecompressionStream', class {
    constructor() { throw new Error(); }
  });
  await assert.rejects(avkoda(wire(fixture(), 'z')), /skadad eller ofullständig/);
});
test('komprimerings-API utan deflate-raw faller tillbaka till j', async (t) => {
  override(t, 'CompressionStream', class {
    constructor() { throw new TypeError('deflate-raw stöds inte'); }
  });
  const code = await koda(fixture());
  assert.equal(code[0], 'j');
  assert.deepEqual(await avkoda(code), fixture());
});
test('fel i komprimeringsströmmen faller tillbaka till j', async (t) => {
  override(t, 'CompressionStream', class {
    constructor() { return new TransformStream({transform() { throw new Error('strömfel'); }}); }
  });
  const code = await koda(fixture());
  assert.equal(code[0], 'j');
  assert.deepEqual(await avkoda(code), fixture());
});
test('felaktig base64, tom kod, okänt format och trasigt innehåll avvisas', async () => {
  for (const code of ['', ' ', 'j', 'z', 'j%', 'z%', 'jA', 'zA', 'j====', 'z====',
    'jSGV=sbG8', 'zSGV=sbG8', 'x' + wire(fixture(), 'j').slice(1),
    'j' + Buffer.from('{').toString('base64url'), 'z' + Buffer.from('inte deflate').toString('base64url')]) {
    await assert.rejects(avkoda(code), undefined, `ska avvisa ${code}`);
  }
});
test('en hel kod tål yttre blanksteg; skadad komprimerad kod avvisas', async () => {
  const code = wire(fixture(), 'z');
  assert.deepEqual(await avkoda(` \n${code}\t `), fixture());
  await assert.rejects(avkoda(code.slice(0, Math.floor(code.length / 2))));
});

for (const format of ['z', 'j']) {
  test(`${format}: svenska decimalsvar sparas, avrundas och följer med`, async (t) => {
    if (format === 'j') override(t, 'CompressionStream', undefined);
    sparaSvar({u1_top: tal(' 23,456789 '), u2_I: tal('0,125'), u2_fi: tal('−30,25'),
      u3_S: tal('1\u00a0234,5'), u3_Q: tal('1\u202f234.5'), u3_QC: tal('0'),
      u2_Z: tal('12 V'), unknown: 123});
    const {obj, url} = await lank('  Åsa\n Nguyễn 山田 🧭  ', BAS);
    assert.deepEqual(obj.s, {u1_top: 23.457, u2_I: 0.125, u2_fi: -30.25,
      u3_S: 1234.5, u3_Q: 1234.5, u3_QC: 0});
    assert.equal(obj.n, 'Åsa Nguyễn 山田 🧭');
    assert.equal(obj.t, NOW / 60000);
    assert.equal(new URL(url).hash[3], format);
    assert.deepEqual(await avkoda(new URLSearchParams(new URL(url).hash.slice(1)).get('r')), obj);
  });
}
test('ogiltiga decimalsvar blir inte noll eller ett delvis tolkat tal', () => {
  for (const input of ['', ' ', null, '12 V', '1,2,3', 'NaN', 'Infinity', '1e3', '12/2']) {
    assert.ok(Number.isNaN(tal(input)), String(input));
  }
});
test('manuella avbockningar räknas inte som kontrollerade övningar', async () => {
  put(OVNINGSNYCKEL, {'v40_01-q1': true, 'v40_01-q10': true, 'v40_02-q2': true,
    'v40_03-q1': false, 'v40_01-q11': true, unrelated: true});
  assert.deepEqual(samla('Åsa Öberg').o, [0, 0, 0]);
});
test('kontrollerade övningar behåller del och bitposition', async () => {
  const ids=['EL-000061','EL-000070','EL-000072'];
  put(STUDY_KEY,{version:1,exercises:Object.fromEntries(ids.map(id=>[id,{revision:STUDY.tasks[id].revision,correct:true,independent:true}]))});
  assert.deepEqual((await avkoda(await koda(samla('Åsa Öberg')))).o, [513, 2, 0]);
});
test('saknad, trasig eller tom lagring ger ett ärligt tomt resultat', async () => {
  for (const value of [undefined, 'null', '{', '{}', '{"rows":null}', '{"rows":"fel"}']) {
    if (value === undefined) saved.delete(LABBNYCKEL); else saved.set(LABBNYCKEL, value);
    saved.set(SVARNYCKEL, '{');
    saved.set(OVNINGSNYCKEL, '{');
    const obj = await avkoda(await koda(samla('Åsa Öberg')));
    assert.deepEqual(obj.g, Array(GUIDE_TASKS.length).fill(0));
    assert.deepEqual(obj.s, {});
    assert.deepEqual(obj.o, [0, 0, 0]);
    assert.ok(!Object.hasOwn(obj, 'gd'));
  }
});
test('partiella labbrader behåller första försöket, null och fältordning', async () => {
  const [a, b, c] = GUIDE_TASKS;
  const values = Object.fromEntries(a.fields.map(([key], i) => [key, i === 0 ? 0 : 12.345678]));
  lab({[a.id]: {attempts: 3, first: values, predicted: {[a.fields[0][0]]: 999},
    measured: true, explanation: '  Ökad\n ström\t– Δφ 🧭  '},
  [b.id]: {}, [c.id]: {predicted: {[c.fields[0][0]]: 4.567891}}, unknown: {measured: true}});
  const obj = await avkoda(await koda(samla('Åsa Öberg')));
  assert.deepEqual(obj.g[0], [3, a.fields.map((_, i) => i === 0 ? 0 : 12.346), 1, 'Ökad ström – Δφ 🧭']);
  assert.deepEqual(obj.g[1], [0, b.fields.map(() => null), 0, '']);
  assert.deepEqual(obj.g[2], [0, c.fields.map((_, i) => i === 0 ? 4.5679 : null), 0, '']);
  assert.deepEqual(obj.g.slice(3), Array(GUIDE_TASKS.length - 3).fill(0));
});
test('gd bevarar labbens D när elevens D har ändrats', async () => {
  for (const D of [7, 13, undefined, '13']) {
    put(LABBNYCKEL, {D, rows: {[GUIDE_TASKS[0].id]: {measured: true}}});
    const obj = await avkoda(await koda(samla('Åsa Öberg')));
    assert.equal(obj.d, 7);
    assert.equal(obj.gd, D === 13 ? 13 : undefined);
    assert.equal(Object.hasOwn(obj, 'gd'), D === 13);
    assert.equal(obj.g[0][2], 1);
  }
});

for (const max of [400, 240, 160, 110, 70, 40, 0]) {
  test(`förklaringar håller max ${max} utan att ändra labblagringen`, async () => {
    const id = GUIDE_TASKS[0].id;
    for (const length of [Math.max(0, max - 1), max, max + 1]) {
      const explanation = 'å'.repeat(length);
      lab({[id]: {explanation}});
      const before = saved.get(LABBNYCKEL);
      const text = (await avkoda(await koda(samla('Åsa Öberg', max)))).g[0][3];
      assert.equal(text, length <= max ? explanation : max === 0 ? '' : 'å'.repeat(max - 1) + '…');
      assert.ok(text.length <= max);
      assert.equal(saved.get(LABBNYCKEL), before);
    }
  });
}
test('trunkering delar inte Unicode-surrogatpar', async () => {
  lab({[GUIDE_TASKS[0].id]: {explanation: 'A🧭BC'}});
  const obj = samla('Åsa Öberg', 3);
  assert.equal(obj.g[0][3], 'A…');
  assert.deepEqual(await avkoda(await koda(obj)), obj);
});
test('en ursprunglig ellips räknas inte som trunkering', async () => {
  lab({[GUIDE_TASKS[0].id]: {explanation: 'Min förklaring fortsätter…'}});
  assert.equal((await lank('Åsa Öberg', BAS)).kortat, false);
});

for (const format of ['z', 'j']) {
  test(`${format}: QR-längdens gräns och nästa kortningssteg`, async (t) => {
    if (format === 'j') override(t, 'CompressionStream', undefined);
    // Deterministisk text som inte komprimeras till några få byte.
    const explanation = Array.from({length: 120}, (_, i) => `${i.toString(36)}=Ω${(i * 7919).toString(36)}`).join(' ');
    lab(Object.fromEntries(GUIDE_TASKS.map(({id}) => [id, {explanation, attempts: 2, measured: true}])));
    sparaSvar({u2_I: 0.125});
    const before = saved.get(LABBNYCKEL), namn = 'Åsa Nguyễn';
    const limits = [400, 240, 160, 110, 70, 40, 0], candidates = [];
    for (const max of limits) {
      const obj = samla(namn, max), code = await koda(obj);
      candidates.push({obj, url: `${BAS}${LARARSIDA}#r=${code}`});
    }
    for (let i = 0; i < candidates.length; i++) {
      const expected = candidates[i], exact = await lank(namn, BAS, expected.url.length);
      assert.equal(exact.url, expected.url, `max ${limits[i]} ryms precis`);
      assert.ok(exact.kortat, 'även sista steget berättar att text har kortats');
      assert.deepEqual(await avkoda(new URLSearchParams(new URL(exact.url).hash.slice(1)).get('r')), exact.obj);
      if (i + 1 < candidates.length) {
        assert.ok(expected.url.length > candidates[i + 1].url.length, 'fixturen skiljer kortningsstegen');
        const next = await lank(namn, BAS, expected.url.length - 1);
        assert.equal(next.url, candidates[i + 1].url);
      }
    }
    // Gränsen är ett mål för skärmläsbar QR. Om metadata inte ryms behålls ändå en kopierbar länk,
    // elevens namn, mätvärden och första försök; inget av detta får kapas för att nå längdmålet.
    const last = candidates.at(-1), exhausted = await lank(namn, BAS, last.url.length - 1);
    assert.equal(exhausted.url, last.url);
    assert.equal(exhausted.kortat, true);
    assert.deepEqual(exhausted.obj.s, {u2_I: 0.125});
    assert.equal(exhausted.obj.n, namn);
    assert.equal(saved.get(LABBNYCKEL), before);
  });
  test(`${format}: lärarlänkens #r-kontrakt bevarar resultat utan frågesträng`, async (t) => {
    if (format === 'j') override(t, 'CompressionStream', undefined);
    lab({[GUIDE_TASKS[0].id]: {explanation: 'Ökad ström 🧭', measured: true}}, 13);
    const result = await lank('Åsa Nguyễn', BAS);
    const url = new URL(result.url), params = new URLSearchParams(url.hash.slice(1));
    assert.equal(url.origin, BAS);
    assert.equal(url.pathname, LARARSIDA);
    assert.equal(url.search, '', 'namn och svar får inte skickas i HTTP-frågan');
    assert.deepEqual([...params.keys()], ['r']);
    assert.deepEqual(await avkoda(params.get('r')), result.obj);
    assert.equal(result.obj.gd, 13);
    assert.equal(result.kortat, false);
    url.search = '?vy=presentera';
    assert.deepEqual(await avkoda(new URLSearchParams(url.hash.slice(1)).get('r')), result.obj);
  });
}
