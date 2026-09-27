// Kör den verkliga, krypterade lärarsidans importkod utan kamera, nätverk eller UI-/sorteringskontroller.
// LARARLOSEN hämtas från miljön; ingen klartext eller lösenord skrivs till repositoryt.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script, createContext} from 'node:vm';
import {decrypt} from '../../verktyg/larare/las.mjs';
import {koda, lank, LABBNYCKEL, SVARNYCKEL} from './resultat.mjs';
import {GUIDE_TASKS, guideValues, personligUppgift} from '../../vaxelstromslabbet/guided-lessons.mjs';

const BAS = 'https://nj22az.github.io';
const PAGE = '/sjoskolan/larare/resultat.html';
const ROOT = new URL('../../../', import.meta.url);
const password = process.env.LARARLOSEN;
const skip = password ? false : 'LARARLOSEN krävs för att testa den krypterade lärarsidan';

function storage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k)};
}

test('lärarsidans resultatimport', {skip}, async (t) => {
  const locked = readFileSync(new URL(PAGE.slice(1), ROOT), 'utf8');
  const envelope = locked.match(/<script id="lock-data" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(envelope, 'lärarsidan är fortfarande krypterad');
  const html = await decrypt(JSON.parse(envelope[1]), password);
  const modules = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
  assert.equal(modules.length, 1);
  let source = modules[0][1];
  // Bind sidans egna importer till samma filer lokalt, inklusive deras cacheversioner.
  const imports = [];
  for (const match of source.matchAll(/^import \{([^}]+)\} from '([^']+)';$/gm)) {
    imports.push(await import(new URL(match[2].slice(1), ROOT)));
  }
  assert.ok(imports.length >= 3, 'alla sidans beroenden hittas');
  let i = 0;
  source = source.replace(/^import \{([^}]+)\} from '([^']+)';$/gm,
    (_, names) => `const {${names.replace(/\bas\b/g, ':')}} = __imports[${i++}];`);
  // Gör sidans befintliga asynkrona start möjlig att invänta, utan en kopia av parsern.
  assert.ok(source.includes('taEmot(location.hash).then('));
  source = source.replace('taEmot(location.hash).then(', '__startup = taEmot(location.hash).then(');
  source += '\nglobalThis.__api = {taEmot, bedom};';

  async function open(hash = '') {
    const nodes = new Map(), localStorage = storage(), replaced = [];
    const node = (id) => {
      if (!nodes.has(id)) nodes.set(id, {innerHTML: '', textContent: '', className: '',
        addEventListener() {}, scrollIntoView() {}});
      return nodes.get(id);
    };
    // DOM-anrop är endast sänkor. Här kontrolleras data, mottagning och historik, inte presentationen.
    const context = createContext({__imports: imports, __startup: null, URLSearchParams,
      location: new URL(BAS + PAGE + hash), localStorage, sessionStorage: storage(),
      document: {getElementById: node, addEventListener() {}}, window: {addEventListener() {}},
      history: {replaceState: (...args) => replaced.push(args)},
      fetch() { throw new Error('Resultatimporten får inte använda nätverket'); },
    });
    new Script(source, {filename: 'teacher-resultat-module.mjs'}).runInContext(context);
    await context.__startup;
    return {api: context.__api, replaced, node,
      records: () => JSON.parse(localStorage.getItem('sj-larare-resultat-v40') || '{}')};
  }

  for (const format of ['z', 'j']) {
    await t.test(`${format}: genererad #r-länk läses vid sidstart och sparas oförändrad`, async (t) => {
      if (format === 'j') t.mock.method(globalThis, 'CompressionStream', undefinedCompression);
      const task = GUIDE_TASKS[2], D = 13, first = guideValues(personligUppgift(task, D));
      const student = storage({'sj-elev-d': '7',
        [SVARNYCKEL]: JSON.stringify({u2_I: 1.25}),
        [LABBNYCKEL]: JSON.stringify({D, rows: {[task.id]: {first, attempts: 2,
          measured: true, explanation: 'Ökad ström – Δφ 🧭 測定.'}}}),
      });
      const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
      Object.defineProperty(globalThis, 'localStorage', {configurable: true, value: student});
      t.after(() => descriptor ? Object.defineProperty(globalThis, 'localStorage', descriptor) : delete globalThis.localStorage);
      const result = await lank('Åsa Nguyễn 山田', BAS);
      assert.equal(new URL(result.url).hash[3], format);
      const page = await open(new URL(result.url).hash);
      assert.deepEqual(Object.values(page.records()), [result.obj]);
      assert.equal(page.replaced.length, 1, 'resultatet sparas innan hash tas bort');
      assert.equal(page.replaced[0][2], PAGE);
      const assessment = page.api.bedom(result.obj);
      assert.equal(assessment.besvarade, 1);
      assert.equal(assessment.labbGjorda, 1);
      assert.equal(assessment.labbRatt, 1, 'labben bedöms mot gd=13, inte d=7');
      assert.equal(assessment.forsok, 2);
      for (const text of [result.url, new URL(result.url).hash, new URL(result.url).hash.slice(3)]) {
        assert.deepEqual(await page.api.taEmot(text), result.obj);
      }
    });
    await t.test(`${format}: saknat och partiellt labbprotokoll kan tas emot`, async (t) => {
      if (format === 'j') t.mock.method(globalThis, 'CompressionStream', undefinedCompression);
      for (const g of [undefined, [], [0, [0, [null], 0, '']]]) {
        const obj = {v: 1, w: 40, d: 7, n: 'Åsa Öberg', t: 100, ...(g ? {g} : {})};
        const page = await open('#r=' + await koda(obj));
        assert.deepEqual(Object.values(page.records()), [obj]);
        assert.equal(page.api.bedom(obj).labbGjorda, 0);
        assert.equal(page.api.bedom(obj).besvarade, 0);
      }
    });
  }
  await t.test('felaktiga koder sparas inte och hash rensas inte vid fel', async () => {
    for (const code of ['j%', 'jA', 'zAAAA', await koda({v: 2, w: 40}), await koda({v: 1, w: 41}),
      await koda({v: 1, w: 40, d: 7}), await koda({v: 1, w: 40, n: 'Åsa Öberg'})]) {
      const page = await open('#r=' + code);
      assert.deepEqual(page.records(), {});
      assert.equal(page.replaced.length, 0);
      assert.equal(page.node('meddelande').className, 'fel');
      assert.ok(page.node('meddelande').textContent);
    }
  });
});

// En webbläsare vars CompressionStream inte stöder formatet ska använda samma j-reservväg.
function undefinedCompression() { throw new TypeError('deflate-raw stöds inte'); }
