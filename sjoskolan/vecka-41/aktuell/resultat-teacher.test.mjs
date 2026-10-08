// Verify the published encrypted instructions and their real result-import code.
// Decrypted text and the teacher password stay in memory, outside Git.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script, createContext} from 'node:vm';
import {decrypt} from '../../verktyg/larare/las.mjs';
import {lank, SVARNYCKEL} from './resultat.mjs';

const ROOT = new URL('../../../', import.meta.url);
const password = process.env.LARARLOSEN;
const skip = password ? false : 'LARARLOSEN krävs för skyddad läraracceptans';
const read = (path) => readFileSync(new URL(path, ROOT), 'utf8');
async function unlocked(path) {
  const source = read(path);
  const data = source.match(/<script id="lock-data" type="application\/json">([^<]*)<\/script>/);
  assert.ok(data, `${path} remains encrypted`);
  return decrypt(JSON.parse(data[1]), password);
}
const section = (source, heading, end) => source.split(heading)[1]?.split(end)[0];
function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key)};
}

test('fredagens körplan har samma tider för lärare och elever', {skip}, async () => {
  const student = section(read('sjoskolan/vecka-41/aktuell/Labbet.html'), '<h2 id="korplan">', '<h2>Före labbet');
  const teacher = section(await unlocked('sjoskolan/labbhandbok/vecka-41.html'), '<h2 id="korplan">', '<p>40 minuter per station');
  assert.ok(student && teacher);
  assert.equal(teacher.trim(), student.trim());
  const slots = [...student.matchAll(/<tr><td>(\d{2})\.(\d{2})–(\d{2})\.(\d{2})<\/td><td>(.*?)<\/td>/g)]
    .map((m) => ({start: +m[1] * 60 + +m[2], end: +m[3] * 60 + +m[4], task: m[5]}));
  assert.equal(slots[0].start, 660);
  assert.equal(slots.at(-1).end, 960);
  for (let i = 1; i < slots.length; i++) assert.equal(slots[i].start, slots[i - 1].end);
  assert.equal(slots.filter((s) => !s.task.startsWith('Lunch')).reduce((sum, s) => sum + s.end - s.start, 0), 240);
  assert.deepEqual(slots.filter((s) => s.task.startsWith('Rotation')).map((s) => s.end - s.start), [40, 40, 40]);
  assert.deepEqual(slots.filter((s) => s.task === 'Felsökning vid motor M').map((s) => s.end - s.start), [15, 15, 15]);
});

test('lärarens tre felsökningspass använder samma reproducerbara fel', {skip}, async () => {
  const teacher = await unlocked('sjoskolan/labbhandbok/vecka-41.html');
  const fault = section(teacher, '<h2 id="f">', '<h2>Protokoll</h2>');
  assert.ok(fault);
  for (const group of ['A', 'B', 'C']) assert.match(fault, new RegExp(`<tr><td>${group}</td><td>[^<]*U1–W2`));
  assert.match(fault, /14\.50–14\.55/);
  assert.match(fault, /15\.10–15\.15/);
  assert.doesNotMatch(fault, /<td>Lossa en mutter|<td>Lägg blecken för Y/);
});

test('lärarguiderna skiljer fredag M/S/T från frivilliga A/B/C', {skip}, async () => {
  const guide = await unlocked('sjoskolan/larare/vecka-41.html');
  assert.match(guide, /tre 40-minutersrotationer M\/S\/T/);
  assert.match(guide, /tre 15-minuterspass/);
  assert.match(guide, /självstudier senast torsdag 8 oktober/);
  assert.doesNotMatch(guide, /Fysisk träff: Station A|andra felmodulen är eget arbete/);
  const stations = await unlocked('sjoskolan/vecka-41/aktuell/Simulerade_stationer_larare.html');
  assert.match(stations, /A, B och C på den här sidan är frivillig extra träning/);
  assert.match(stations, /ersätter inte bilagan/);
  const marking = await unlocked('sjoskolan/gemensamt/Lararguide.html');
  const row = marking.match(/<tr data-ovning="EL-000816">[\s\S]*?<\/tr>/)?.[0];
  assert.match(row, /skiljande kontroll/);
  assert.match(row, /separat protokollbilaga/);
});

test('verklig QR-import visar A/B/C som frivilliga och kräver separat inlämning 3', {skip}, async (t) => {
  const html = await unlocked('sjoskolan/larare/resultat-v41.html');
  let source = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  const imports = [];
  for (const match of source.matchAll(/^import \{([^}]+)\} from '([^']+)';$/gm)) {
    imports.push(await import(new URL(match[2].slice(1), ROOT)));
  }
  let i = 0;
  source = source.replace(/^import \{([^}]+)\} from '([^']+)';$/gm,
    (_, names) => `const {${names.replace(/\bas\b/g, ':')}} = __imports[${i++}];`);
  source += '\nglobalThis.__api = {taEmot, rapport};';
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {configurable: true, value: storage({
    [SVARNYCKEL]: JSON.stringify({y_Ugren: 230.94}),
    'sjoskolan-protokoll-stationA': JSON.stringify({rows: [{uppm: '4 V'}]}),
    'sj-motorlabbet-protokoll': JSON.stringify({m1u: '6 Ω', f1: 'motor fault'}),
  })});
  t.after(() => original ? Object.defineProperty(globalThis, 'localStorage', original) : delete globalThis.localStorage);
  const result = await lank('Test Elev', 'https://nj22az.github.io');
  const nodes = new Map();
  const node = (id) => {
    if (!nodes.has(id)) nodes.set(id, {innerHTML: '', textContent: '', className: '',
      addEventListener() {}, scrollIntoView() {}});
    return nodes.get(id);
  };
  const saved = storage();
  const context = createContext({__imports: imports, URLSearchParams,
    location: new URL('https://nj22az.github.io/sjoskolan/larare/resultat-v41.html'),
    localStorage: saved, sessionStorage: storage(),
    document: {getElementById: node, addEventListener() {}}, window: {addEventListener() {}},
    fetch() {throw new Error('Result import must not require network');}});
  new Script(source).runInContext(context);
  await context.__api.taEmot(result.url);
  assert.deepEqual(JSON.parse(saved.getItem('sj-larare-resultat-v41'))['test elev'], result.obj);
  const report = node('rapport').innerHTML;
  assert.match(report, /Frivilliga stationer A, B och C/);
  assert.match(report, /Station A .*1 av 1 mätningar/);
  assert.match(report, /Inlämning 3: M\/S\/T-protokollet eller Motorlabbets protokoll/);
  assert.match(report, /PDF eller tydliga foton/);
  assert.match(report, /Kontrollera bilagan manuellt/);
  assert.doesNotMatch(report, /Stationerna \(inlämning 3\)/);
  assert.doesNotMatch(JSON.stringify(result.obj), /motor fault/);
});
