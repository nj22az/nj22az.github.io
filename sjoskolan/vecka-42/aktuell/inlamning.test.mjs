// Inlämningen vecka 42 rättar sig själv: nyckeln, sidan, posterna, delsidorna och facit.py hör ihop, och inga svar står
// i klartext. Kör: node --test sjoskolan/vecka-42/aktuell/inlamning.test.mjs
// Med INLAMNING_FACIT=/utanför/repot/facit-v42.json prövas också lärarens klartext mot nyckeln (finns inte i CI).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { NYCKEL } from './inlamning-nyckel.mjs';
import { ratta, hashSvar, avkodaLista, MAX_FORSOK } from '../../gemensamt/sjalvrattning.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const SJO = join(HAR, '..', '..');
const FACIT = join(SJO, 'verktyg', 'inlamning', 'facit.py');
const SIDA = readFileSync(join(HAR, 'Inlamning.html'), 'utf8');
const snabbhash = (salt, falt, kanon) => createHash('sha256').update(`${salt}|${falt}|${kanon}`).digest('hex').slice(0, 16);
const post = (id) => JSON.parse(readFileSync(join(SJO, 'innehall', 'ovningar', `${id}.json`), 'utf8'));

/** Fälten i sidan: {id: {typ, alternativ: [id …] i visningsordning, heltal, radio}}. */
function sidansFalt() {
  const ut = {};
  for (const m of SIDA.matchAll(/<(div|fieldset) class="ri-falt[^"]*" data-falt="([^"]+)" data-typ="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g)) {
    const heltal = m[4].match(/data-heltal="(\d+)-(\d+)"/);
    ut[m[2]] = { typ: m[3], alternativ: [...m[5].matchAll(/value="([^"]+)"/g)].map((x) => x[1]), radio: m[5].includes('type="radio"'),
      heltal: heltal ? [Number(heltal[1]), Number(heltal[2])] : null };
  }
  return ut;
}
const FALT = sidansFalt();
const RATTAS = Object.keys(FALT).filter((i) => FALT[i].typ === 'tal' || FALT[i].typ === 'val').sort();
const LISTA = avkodaLista(SIDA.match(/data-lista="([^"]+)"/)[1]);

test('nyckeln innehåller bara saltade hashar, inga svar i klartext', () => {
  assert.equal(NYCKEL.version, 1);
  assert.equal(NYCKEL.vecka, 42);
  assert.match(NYCKEL.salt, /^[0-9a-f]{16,64}$/);
  for (const [id, f] of Object.entries(NYCKEL.falt)) {
    assert.deepEqual(Object.keys(f).filter((k) => !['typ', 'dec', 'h'].includes(k)), [], id);
    assert.ok(f.typ === 'val' || (f.typ === 'tal' && Number.isInteger(f.dec)), id);
    assert.ok(f.h.length > 0 && f.h.every((h) => /^[0-9a-f]{16}$/.test(h)), id);
  }
});

test('nyckeln och sidan har samma 12 fält som rättas', () => {
  assert.equal(RATTAS.length, 12);
  assert.deepEqual(Object.keys(NYCKEL.falt).sort(), RATTAS);
  for (const id of RATTAS) assert.equal(NYCKEL.falt[id].typ, FALT[id].typ, id);
});

test('nyckeln är skriven för posternas nuvarande revision', () => {
  const pasidan = [...SIDA.matchAll(/<div class="ri-svar" data-ovning="(EL-\d{6})"/g)].map((m) => m[1]).sort();
  assert.deepEqual(pasidan, ['EL-000817', 'EL-000818', 'EL-000819'], 'quizen (EL-000887) har en egen sida');
  assert.deepEqual(Object.keys(NYCKEL.poster).sort(), pasidan);
  for (const [id, rev] of Object.entries(NYCKEL.poster)) {
    assert.equal(post(id).revision, rev, `${id} har revision ${post(id).revision}, men nyckeln är skriven för revision ${rev}. Kontrollera svaren, kör `
      + 'verktyg/inlamning/facit.py 42 med klartexten och innehall.py bygg inlamning.');
  }
});

test('varje flervalsfråga har fyra alternativ och minst ett men inte alla godkända', () => {
  for (const id of RATTAS.filter((i) => FALT[i].typ === 'val')) {
    assert.equal(FALT[id].alternativ.length, 4, `${id}: fyra alternativ, så att tre försök inte räcker för att pröva sig fram`);
    // Läraren kan godkänna flera alternativ (facit.py: en lista med id), men aldrig alla.
    const godkanda = FALT[id].alternativ.filter((v) => ratta(NYCKEL, id, v) === 'ratt').length;
    assert.ok(godkanda >= 1 && godkanda < FALT[id].alternativ.length, `${id}: ${godkanda} godkända`);
    assert.equal(NYCKEL.falt[id].h.length, godkanda, `${id}: nyckeln har bara hashar för alternativ som finns`);
  }
});

test('radioknapparnas ordning är fast och blandad som i sjalvrattning.py', () => {
  const fro = readFileSync(join(SJO, 'verktyg', 'inlamning', 'sjalvrattning.py'), 'utf8').match(/ORDNINGSFRO = '([^']+)'/)[1];
  const radio = RATTAS.filter((i) => FALT[i].radio);
  assert.equal(radio.length, 4);
  for (const id of radio) {
    const vantad = [...FALT[id].alternativ].sort((a, b) => {
      const ha = createHash('sha256').update(`${fro}|${id}|${a}`).digest('hex'), hb = createHash('sha256').update(`${fro}|${id}|${b}`).digest('hex');
      return ha < hb ? -1 : 1;
    });
    assert.deepEqual(FALT[id].alternativ, vantad, id);
  }
  assert.ok(radio.some((id) => FALT[id].alternativ.join('') !== [...FALT[id].alternativ].sort().join('')), 'ordningen är blandad');
});

test('varje tal godkänns i ett sammanhängande intervall: ±2 %, eller exakt för heltalsfältet', () => {
  for (const id of RATTAS.filter((i) => FALT[i].typ === 'tal')) {
    const { dec, h } = NYCKEL.falt[id], kvar = new Set(h), hittade = [];
    for (let k = 0; kvar.size && k < 5e6; k++) if (kvar.delete(snabbhash(NYCKEL.salt, id, `t${dec}:${k}`))) hittade.push(k);
    assert.equal(kvar.size, 0, `${id}: alla hashar ska höra till tal mellan 0 och 500 000`);
    const lo = hittade[0], hi = hittade.at(-1), mitt = (lo + hi) / 2;
    assert.equal(hi - lo + 1, h.length, `${id}: intervallet har inga hål`);
    if (FALT[id].heltal) {
      assert.equal(h.length, 1, `${id}: bara exakt rätt heltal`);
      assert.ok(lo >= FALT[id].heltal[0] && lo <= FALT[id].heltal[1]);
      assert.equal(ratta(NYCKEL, id, `${lo},5`, '', FALT[id].heltal), 'ogiltig', 'decimaltal är inget svar på heltalsfältet');
      continue;
    }
    assert.ok(Math.abs((hi - lo) / 2 / mitt - 0.02) < 2 / mitt, `${id}: halva bredden ska vara 2 % av värdet`);
    assert.equal(ratta(NYCKEL, id, String(mitt / 10 ** dec).replace('.', ',')), 'ratt', id);
    assert.equal(ratta(NYCKEL, id, String((lo - 1) / 10 ** dec)), 'fel', id);
    assert.equal(ratta(NYCKEL, id, String((hi + 1) / 10 ** dec)), 'fel', id);
  }
});

test('checklistan är dold i sidan, nämner inte svaret på fråga d och visas efter fråga d', () => {
  assert.equal(LISTA.length, 7);
  assert.match(SIDA, /data-lista-efter="817d"/);
  const utan = SIDA.replace(/data-lista="[^"]+"/, '');
  // Det godkända alternativet på fråga d tas fram ur nyckeln, så att testet inte själv står med svaret. Ingen punkt får
  // innehålla en bit (7 bokstäver) av ett ord som bara finns i det godkända alternativet.
  const val = Object.fromEntries([...SIDA.matchAll(/name="ri-817d" value="([^"]+)"><span>([^<]+)<\/span>/g)].map((m) => [m[1], m[2]]));
  const godkanda = Object.keys(val).filter((v) => ratta(NYCKEL, '817d', v) === 'ratt');
  const ord = (t) => t.toLowerCase().match(/\p{L}{7,}/gu) || [];
  const ovriga = new Set(Object.keys(val).filter((v) => !godkanda.includes(v)).flatMap((v) => ord(val[v])));
  const bitar = godkanda.flatMap((v) => ord(val[v]).filter((w) => !ovriga.has(w)))
    .flatMap((w) => Array.from({ length: w.length - 6 }, (_, i) => w.slice(i, i + 7)));
  assert.equal(Object.keys(val).length, 4);
  assert.ok(godkanda.length >= 1 && bitar.length > 0, 'fråga d har ett godkänt alternativ med egna ord');
  for (const p of LISTA) {
    assert.ok(p.text.length > 20 && /^Läs <a href="Del_\d\.html#teori-\d+">/.test(p.las), p.text);
    assert.ok(!utan.includes(p.text), `checklistans text syns i sidan: ${p.text}`);
    const bit = bitar.find((b) => p.text.toLowerCase().includes(b));
    assert.ok(!bit, `checklistan ger svaret på fråga d (”${bit}”): ${p.text}`);
  }
  assert.ok(LISTA.some((p) => p.text.includes('energikällor som kan finnas kvar när gruppen är bortkopplad')));
});

test('rutan Låsta frågor har del 1–3, och delsidorna har bekräftelsen sist', () => {
  const ruta = SIDA.match(/<section class="sj-panel warn ri-lasom" id="ri-lasom" data-ri-delar="([^"]+)" hidden>([\s\S]*?)<\/section>/);
  assert.ok(ruta, 'rutan finns och är dold tills en fråga är låst');
  assert.equal(ruta[1], 'del-1 del-2 del-3');
  assert.match(ruta[2], /Läs om vecka 42: del 1, del 2 och del 3\. Sedan får du tre nya försök på de låsta frågorna\./);
  for (const h of ['Del_1.html', 'Del_2.html', 'Del_3.html']) assert.ok(ruta[2].includes(`href="${h}"`), h);
  assert.ok(!SIDA.includes('Transportstyrelsen_riktlinjer') && !SIDA.includes('data-ri-last="text"'), 'texten läses på quizsidan');
  for (const n of [1, 2, 3]) {
    const del = readFileSync(join(HAR, `Del_${n}.html`), 'utf8');
    assert.equal((del.match(/data-ri-las-del="/g) || []).length, 1, `Del_${n}.html`);
    assert.ok(del.includes(`data-ri-las-vecka="42" data-ri-las-del="del-${n}"`));
    assert.ok(del.includes(`Har du läst hela del ${n}?`) && del.includes(`Jag har läst del ${n}</button>`));
    assert.ok(del.includes('Knappen öppnas när du har läst hela sidan (minst 3 minuter).'));
    assert.ok(del.indexOf('ri-lasdel') > del.indexOf('id="labb"'), 'rutan står sist på sidan');
  }
  assert.ok(!readFileSync(join(SJO, 'vecka-41', 'aktuell', 'Del_1.html'), 'utf8').includes('ri-lasdel'), 'bara veckor som rättar sig själva');
});

test('inlämningen är en PDF i Classroom: ingen lång mejltext, tre försök på sidan', () => {
  assert.equal(MAX_FORSOK, 3);
  assert.match(SIDA, /data-ri-max="3"/);
  assert.ok(SIDA.includes('Lämna in PDF-filen i Google Classroom under Vecka 42.'));
  assert.ok(!SIDA.includes('Kopiera mejltexten') && !SIDA.includes('&body='), 'den långa mejltexten är borta');
  assert.equal((SIDA.match(/class="sj-btn primary/g) || []).length, 1, 'en huvudknapp: Lämna in');
});

test('sidan laddar översättningsskyddet, modulen och nyckeln med aktuell version', () => {
  assert.ok(SIDA.includes('/sjoskolan/gemensamt/oversattning.js'));
  assert.match(SIDA, /\/sjoskolan\/gemensamt\/sjalvrattning-sida\.mjs\?v=\d{8}/);
  assert.match(SIDA, /\/sjoskolan\/gemensamt\/sjalvrattning\.css\?v=\d{8}/);
  const v = createHash('sha256').update(readFileSync(join(HAR, 'inlamning-nyckel.mjs'))).digest('hex').slice(0, 10);
  assert.ok(SIDA.includes(`./inlamning-nyckel.mjs?v=${v}`), 'kör innehall.py bygg inlamning efter facit.py (regel 13)');
});

test('facit.py hashar likadant som sidan och vägrar läsa klartext i repot', async (t) => {
  if (spawnSync('python3', ['--version']).error) { t.skip('python3 saknas'); return; }
  const dir = mkdtempSync(join(tmpdir(), 'facit-'));
  try {
    // Påhittade svar (inte inlämningens): första alternativet, talet 100 och heltalet 3.
    const svar = Object.fromEntries(RATTAS.map((id) => [id, FALT[id].typ === 'val' ? FALT[id].alternativ[0] : FALT[id].heltal ? '3' : '100']));
    // Ett val kan ha flera godkända alternativ: en lista med id.
    const flera = RATTAS.find((id) => FALT[id].typ === 'val');
    svar[flera] = [FALT[flera].alternativ[0], FALT[flera].alternativ[2]];
    writeFileSync(join(dir, 'prov.json'), JSON.stringify({ falt: svar }));
    const ut = join(dir, 'nyckel.mjs');
    const r = spawnSync('python3', [FACIT, '42', '--svar', join(dir, 'prov.json'), '--ut', ut, '--salt', 'abcdef0123456789'], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const { NYCKEL: N } = await import(pathToFileURL(ut).href);
    for (const id of RATTAS) {
      if (FALT[id].typ === 'val') {
        assert.equal(ratta(N, id, FALT[id].alternativ[0]), 'ratt', id);
        assert.equal(ratta(N, id, FALT[id].alternativ[1]), 'fel', id);
        assert.equal(ratta(N, id, FALT[id].alternativ[2]), id === flera ? 'ratt' : 'fel', id);
        assert.equal(N.falt[id].h.length, id === flera ? 2 : 1, id);
      } else if (FALT[id].heltal) {
        assert.equal(ratta(N, id, '3', '', FALT[id].heltal), 'ratt', id);
        for (const v of ['2', '4']) assert.equal(ratta(N, id, v, '', FALT[id].heltal), 'fel', `${id} ${v}`);
      } else {
        for (const v of ['100', '98', '102', '100,04', '98,0']) assert.equal(ratta(N, id, v), 'ratt', `${id} ${v}`);
        for (const v of ['97,9', '102,1', '1', '1000']) assert.equal(ratta(N, id, v), 'fel', `${id} ${v}`);
      }
    }
    assert.equal(hashSvar('abcdef0123456789', RATTAS[0], 'v:1'), snabbhash('abcdef0123456789', RATTAS[0], 'v:1'));
    const { [RATTAS[0]]: _bort, ...ofullstandig } = svar;
    writeFileSync(join(dir, 'fel.json'), JSON.stringify({ falt: ofullstandig }));
    assert.notEqual(spawnSync('python3', [FACIT, '42', '--svar', join(dir, 'fel.json'), '--ut', ut]).status, 0, 'ett fält utan svar stoppar');
    writeFileSync(join(dir, 'okant-falt.json'), JSON.stringify({ falt: { ...svar, '887f': '4' } }));
    assert.notEqual(spawnSync('python3', [FACIT, '42', '--svar', join(dir, 'okant-falt.json'), '--ut', ut]).status, 0, 'ett fält som inte finns på sidan stoppar');
    writeFileSync(join(dir, 'alla.json'), JSON.stringify({ falt: { ...svar, [flera]: FALT[flera].alternativ } }));
    assert.notEqual(spawnSync('python3', [FACIT, '42', '--svar', join(dir, 'alla.json'), '--ut', ut]).status, 0, 'alla alternativ godkända stoppar');
    writeFileSync(join(dir, 'okant.json'), JSON.stringify({ falt: { ...svar, [flera]: [FALT[flera].alternativ[0], '9'] } }));
    assert.notEqual(spawnSync('python3', [FACIT, '42', '--svar', join(dir, 'okant.json'), '--ut', ut]).status, 0, 'okänt alternativ stoppar');
    const irepot = spawnSync('python3', [FACIT, '42', '--svar', join(SJO, 'README.md'), '--ut', ut], { encoding: 'utf8' });
    assert.notEqual(irepot.status, 0);
    assert.match(irepot.stderr, /ligger i repot/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('lärarens klartext ger Rätt! (bara med INLAMNING_FACIT)', (t) => {
  const fil = process.env.INLAMNING_FACIT;
  if (!fil) { t.skip('INLAMNING_FACIT är inte satt'); return; }
  const svar = JSON.parse(readFileSync(fil, 'utf8')).falt;
  assert.deepEqual(Object.keys(svar).sort(), RATTAS);
  const platser = [];
  for (const id of RATTAS) {
    if (FALT[id].typ === 'val') {
      const godkanda = [svar[id]].flat().map(String);
      for (const v of godkanda) assert.equal(ratta(NYCKEL, id, v), 'ratt', `${id} ${v}`);
      for (const v of FALT[id].alternativ.filter((x) => !godkanda.includes(x))) assert.equal(ratta(NYCKEL, id, v), 'fel', `${id} ${v}`);
      if (FALT[id].radio) platser.push(FALT[id].alternativ.indexOf(godkanda[0]) + 1);
    } else if (FALT[id].heltal) {
      assert.equal(ratta(NYCKEL, id, svar[id], '', FALT[id].heltal), 'ratt', id);
      for (let k = FALT[id].heltal[0]; k <= FALT[id].heltal[1]; k++) if (String(k) !== svar[id]) assert.equal(ratta(NYCKEL, id, String(k), '', FALT[id].heltal), 'fel', `${id} ${k}`);
    } else {
      const [a, b = '1'] = String(svar[id]).replace(',', '.').split('/');
      const v = Number(a) / Number(b);
      assert.equal(ratta(NYCKEL, id, v.toFixed(3).replace('.', ',')), 'ratt', id);
      assert.equal(ratta(NYCKEL, id, (v * 1.019).toFixed(2)), 'ratt', `${id} +1,9 %`);
      assert.equal(ratta(NYCKEL, id, (v * 0.981).toFixed(2)), 'ratt', `${id} −1,9 %`);
      assert.equal(ratta(NYCKEL, id, (v * 1.025).toFixed(2)), 'fel', `${id} +2,5 %`);
      assert.equal(ratta(NYCKEL, id, (v * 0.975).toFixed(2)), 'fel', `${id} −2,5 %`);
    }
  }
  assert.ok(new Set(platser).size >= 3, `rätt alternativ står på olika platser: ${platser}`);
});
