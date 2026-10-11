// Gemensamma tester för en vecka med självrättande inlämning (vecka 43 och framåt; vecka 42 har egna i
// vecka-42/aktuell/inlamning.test.mjs). Sidan, nyckeln, posterna, delsidorna och facit.py ska höra ihop, och inga svar står i
// klartext. Med INLAMNING_FACIT_DIR=/utanför/repot (facit-vNN.json) prövas också lärarens klartext mot nyckeln.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { ratta, avkodaLista, MAX_FORSOK } from '../../gemensamt/sjalvrattning.mjs';

const SJO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FACIT = join(SJO, 'verktyg', 'inlamning', 'facit.py');
const PY = readFileSync(join(SJO, 'verktyg', 'inlamning', 'sjalvrattning.py'), 'utf8');
const VERSION = PY.match(/^VERSION = '(\d{8})'/m)[1];
const FRO = PY.match(/ORDNINGSFRO = '([^']+)'/)[1];
const snabbhash = (salt, falt, kanon) => createHash('sha256').update(`${salt}|${falt}|${kanon}`).digest('hex').slice(0, 16);
const post = (id) => JSON.parse(readFileSync(join(SJO, 'innehall', 'ovningar', `${id}.json`), 'utf8'));
const python = !spawnSync('python3', ['--version']).error;
const MANAD = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];

/** Fälten i sidan: {id: {typ, ovning, alternativ: [id i visningsordning], radio, lista, pekare}}. */
export function sidansFalt(sida) {
  const ut = {};
  for (const sek of sida.matchAll(/<div class="ri-svar" data-ovning="(EL-\d{6})"([\s\S]*?)<div class="ri-knappar">/g)) {
    for (const m of sek[2].matchAll(/<(div|fieldset) class="ri-falt[^"]*" data-falt="([^"]+)" data-typ="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g)) {
      ut[m[2]] = { typ: m[3], ovning: sek[1], alternativ: [...m[5].matchAll(/value="([^"]+)"/g)].map((x) => x[1]),
        radio: m[5].includes('type="radio"'), lista: m[5].includes('<select'),
        pekare: (m[5].match(/<p class="ri-pekare" hidden>([\s\S]*?)<\/p>/) || [])[1] || '' };
    }
  }
  return ut;
}

/**
 * Registrerar testerna för en vecka. vecka: veckonumret. uppgifter: posternas id i sidans ordning. rattas: antal fält som
 * rättas. delar: [[delnummer, adress från sidan]] i rutan Låsta frågor. sista: 'fredag 23 oktober'.
 */
export function provaVecka({ vecka, uppgifter, rattas, delar, sista }) {
  const HAR = join(SJO, `vecka-${vecka}`, 'aktuell');
  const SIDA = readFileSync(join(HAR, 'Inlamning.html'), 'utf8');
  const nyckelFil = join(HAR, 'inlamning-nyckel.mjs');
  const FALT = sidansFalt(SIDA);
  const RATTAS = Object.keys(FALT).filter((i) => FALT[i].typ === 'tal' || FALT[i].typ === 'val').sort();
  const laddaNyckel = async () => (await import(pathToFileURL(nyckelFil).href)).NYCKEL;

  test(`vecka ${vecka}: nyckeln innehåller bara saltade hashar och har samma ${rattas} fält som sidan`, async () => {
    const N = await laddaNyckel();
    assert.equal(N.version, 1);
    assert.equal(N.vecka, vecka);
    assert.match(N.salt, /^[0-9a-f]{16,64}$/);
    for (const [id, f] of Object.entries(N.falt)) {
      assert.deepEqual(Object.keys(f).filter((k) => !['typ', 'dec', 'h'].includes(k)), [], id);
      assert.ok(f.h.length > 0 && f.h.every((h) => /^[0-9a-f]{16}$/.test(h)), id);
    }
    assert.equal(RATTAS.length, rattas);
    assert.deepEqual(Object.keys(N.falt).sort(), RATTAS, `kör facit.py ${vecka} och innehall.py bygg inlamning`);
    for (const id of RATTAS) assert.equal(N.falt[id].typ, FALT[id].typ, id);
  });

  test(`vecka ${vecka}: uppgifterna står i ordning och nyckeln är skriven för posternas nuvarande revision`, async () => {
    const N = await laddaNyckel();
    assert.deepEqual([...SIDA.matchAll(/<div class="ri-svar" data-ovning="(EL-\d{6})"/g)].map((m) => m[1]), uppgifter);
    assert.deepEqual(Object.keys(N.poster).sort(), [...uppgifter].sort());
    for (const [id, rev] of Object.entries(N.poster)) {
      assert.equal(post(id).revision, rev, `${id} har revision ${post(id).revision}, men nyckeln är skriven för revision ${rev}. Kontrollera svaren, `
        + `kör verktyg/inlamning/facit.py ${vecka} med klartexten och innehall.py bygg inlamning.`);
    }
  });

  test(`vecka ${vecka}: varje val har fyra alternativ, minst ett men inte alla godkända, och radioknapparna är blandade`, async () => {
    const N = await laddaNyckel();
    for (const id of RATTAS.filter((i) => FALT[i].typ === 'val')) {
      assert.equal(FALT[id].alternativ.length, 4, `${id}: fyra alternativ, så att tre försök inte räcker för att pröva sig fram`);
      const godkanda = FALT[id].alternativ.filter((v) => ratta(N, id, v) === 'ratt').length;
      assert.ok(godkanda >= 1 && godkanda < 4, `${id}: ${godkanda} godkända`);
      assert.equal(N.falt[id].h.length, godkanda, id);
      if (!FALT[id].radio) continue;
      const h = (x) => createHash('sha256').update(`${FRO}|${id}|${x}`).digest('hex');
      assert.deepEqual(FALT[id].alternativ, [...FALT[id].alternativ].sort((a, b) => (h(a) < h(b) ? -1 : 1)), `${id}: fast blandad ordning`);
    }
  });

  test(`vecka ${vecka}: varje tal godkänns i ett sammanhängande intervall på ±2 %`, async () => {
    const N = await laddaNyckel();
    for (const id of RATTAS.filter((i) => FALT[i].typ === 'tal')) {
      const { dec, h } = N.falt[id], kvar = new Set(h), hittade = [];
      for (let k = 0; kvar.size && k < 5e6; k++) if (kvar.delete(snabbhash(N.salt, id, `t${dec}:${k}`))) hittade.push(k);
      assert.equal(kvar.size, 0, `${id}: alla hashar hör till tal mellan 0 och 5 000 000 steg`);
      const lo = hittade[0], hi = hittade.at(-1), mitt = (lo + hi) / 2;
      assert.equal(hi - lo + 1, h.length, `${id}: intervallet har inga hål`);
      assert.ok(Math.abs((hi - lo) / 2 / mitt - 0.02) < 2 / mitt, `${id}: halva bredden ska vara 2 % av värdet`);
      assert.ok(h.length >= 5, `${id}: decimalerna ger flera godkända värden (${h.length})`);
      assert.equal(ratta(N, id, String((lo - 1) / 10 ** dec)), 'fel', id);
      assert.equal(ratta(N, id, String((hi + 1) / 10 ** dec)), 'fel', id);
    }
  });

  test(`vecka ${vecka}: hänvisningarna leder till ett avsnitt med rätt rubrik, också i en annan veckas mapp`, () => {
    for (const [id, f] of Object.entries(FALT)) {
      if (!f.pekare) continue;
      for (const m of f.pekare.matchAll(/<a href="([^"#]+)#teori-(\d+)">del (\d+), avsnitt \d+: ([^<]+)<\/a>/g)) {
        const fil = join(HAR, m[1]);
        assert.ok(existsSync(fil), `${id}: ${m[1]} finns`);
        const s = readFileSync(fil, 'utf8');
        assert.match(s, new RegExp(`<p class="course-kicker">Vecka ${vecka} · Del ${m[3]} av \\d+</p>`), `${id}: ${m[1]} är del ${m[3]} i vecka ${vecka}`);
        const t = s.match(new RegExp(`id="teori-${m[2]}"[^>]*><summary><span class="kort-nr">\\d+</span><span class="kort-text"><span class="kort-titel">([^<]+)<`));
        assert.ok(t && t[1] === m[4], `${id}: avsnitt ${m[2]} i ${m[1]} heter ${m[4]}`);
      }
      assert.ok(!/<a href="[^"]+">\d/.test(f.pekare), `${id}: hänvisningen är ett avsnitt, aldrig ett svar`);
    }
  });

  test(`vecka ${vecka}: checklistorna är dolda, visas efter sina frågor och ger inte deras svar`, async () => {
    const N = await laddaNyckel();
    const utan = SIDA.replace(/data-lista="[^"]+"/g, '');
    for (const m of SIDA.matchAll(/<div class="ri-las" data-lista="([^"]+)" data-lista-efter="([^"]*)" data-las-text="([^"]+)">/g)) {
      const lista = avkodaLista(m[1]);
      assert.ok(lista.length >= 4, 'checklistan har punkter');
      for (const p of lista) {
        assert.ok(p.text.length > 15 && /^Läs <a href="[^"]+#teori-\d+">/.test(p.las), p.text);
        assert.ok(!utan.includes(p.text), `checklistans text syns i sidan: ${p.text}`);
      }
      // Ord som bara finns i det godkända alternativet (ur nyckeln, inte ur källkoden) får inte stå i listan.
      for (const id of m[2].split(' ').filter(Boolean)) {
        assert.ok(FALT[id]?.typ === 'val', `${id}: listan väntar på ett val`);
        const text = Object.fromEntries([...SIDA.matchAll(new RegExp(`name="ri-${id}" value="([^"]+)"><span>([^<]+)</span>`, 'g'))].map((x) => [x[1], x[2]]));
        const godkanda = Object.keys(text).filter((v) => ratta(N, id, v) === 'ratt');
        const ord = (t) => t.toLowerCase().match(/\p{L}{10,}/gu) || [];
        const ovriga = new Set(Object.keys(text).filter((v) => !godkanda.includes(v)).flatMap((v) => ord(text[v])));
        const egna = godkanda.flatMap((v) => ord(text[v]).filter((w) => !ovriga.has(w)));
        for (const p of lista) for (const w of egna) assert.ok(!p.text.toLowerCase().includes(w), `checklistan ger svaret på ${id} (”${w}”): ${p.text}`);
      }
    }
  });

  test(`vecka ${vecka}: rutan Låsta frågor har alla delar, och varje delsida bekräftar rätt vecka och del`, () => {
    const ruta = SIDA.match(/<section class="sj-panel warn ri-lasom" id="ri-lasom" data-ri-delar="([^"]+)" hidden>([\s\S]*?)<\/section>/);
    assert.ok(ruta, 'rutan finns och är dold tills en fråga är låst');
    assert.equal(ruta[1], delar.map(([n]) => `del-${n}`).join(' '));
    assert.deepEqual([...ruta[2].matchAll(/<li><a href="([^"]+)">/g)].map((m) => m[1]), delar.map(([, h]) => h));
    for (const [n, href] of delar) {
      const del = readFileSync(join(HAR, href), 'utf8');
      const inl = href.startsWith('../') ? `../../vecka-${vecka}/aktuell/Inlamning.html` : 'Inlamning.html';
      assert.equal((del.match(/data-ri-las-del="/g) || []).length, 1, href);
      assert.ok(del.includes(`data-ri-las-vecka="${vecka}" data-ri-las-del="del-${n}" data-ri-las-inlamning="${inl}"`), `${href}: sj-last:vecka-${vecka} del-${n}`);
      assert.ok(del.includes(`Jag har läst del ${n}</button>`));
    }
  });

  test(`vecka ${vecka}: inlämningen är en PDF i Classroom senast ${sista}, aldrig söndag`, () => {
    assert.equal(MAX_FORSOK, 3);
    assert.match(SIDA, new RegExp(`data-ri-vecka="${vecka}" data-ri-lagring="sj-v${vecka}-inlamning"`));
    assert.match(SIDA, /data-ri-max="3"/);
    assert.ok(SIDA.includes(`Lämna in senast ${sista} i Google Classroom.`), sista);
    assert.ok(SIDA.includes(`Lämna in PDF-filen i Google Classroom under Vecka ${vecka}.`));
    assert.ok(!/söndag/i.test(SIDA), 'inget lämnas in på söndag');
    assert.equal((SIDA.match(/class="sj-btn primary/g) || []).length, 1, 'en huvudknapp: Lämna in');
    assert.ok(!SIDA.includes('&body='), 'ingen lång mejltext');
    assert.ok(MANAD.some((m) => sista.endsWith(m)));
  });

  test(`vecka ${vecka}: sidan laddar översättningsskyddet, modulen och nyckeln med aktuell version`, () => {
    assert.ok(SIDA.includes('/sjoskolan/gemensamt/oversattning.js'));
    assert.ok(SIDA.includes(`/sjoskolan/gemensamt/sjalvrattning-sida.mjs?v=${VERSION}`));
    assert.ok(SIDA.includes(`/sjoskolan/gemensamt/sjalvrattning.css?v=${VERSION}`));
    const v = createHash('sha256').update(readFileSync(nyckelFil)).digest('hex').slice(0, 10);
    assert.ok(SIDA.includes(`./inlamning-nyckel.mjs?v=${v}`), 'kör innehall.py bygg inlamning efter facit.py (regel 13)');
  });

  test(`vecka ${vecka}: facit.py hashar likadant som sidan`, async (t) => {
    if (!python) { t.skip('python3 saknas'); return; }
    const dir = mkdtempSync(join(tmpdir(), `facit${vecka}-`));
    try {
      // Påhittade svar (inte lärarens): första alternativet och talet 100.
      const svar = Object.fromEntries(RATTAS.map((id) => [id, FALT[id].typ === 'val' ? FALT[id].alternativ[0] : '100']));
      writeFileSync(join(dir, 'prov.json'), JSON.stringify({ falt: svar }));
      const ut = join(dir, 'nyckel.mjs');
      const r = spawnSync('python3', [FACIT, String(vecka), '--svar', join(dir, 'prov.json'), '--ut', ut, '--salt', 'abcdef0123456789'], { encoding: 'utf8' });
      assert.equal(r.status, 0, r.stderr);
      const { NYCKEL: N } = await import(pathToFileURL(ut).href);
      for (const id of RATTAS) {
        if (FALT[id].typ === 'val') {
          assert.equal(ratta(N, id, FALT[id].alternativ[0]), 'ratt', id);
          assert.equal(ratta(N, id, FALT[id].alternativ[1]), 'fel', id);
        } else {
          for (const v of ['100', '98', '102', '100,04']) assert.equal(ratta(N, id, v), 'ratt', `${id} ${v}`);
          for (const v of ['96', '104']) assert.equal(ratta(N, id, v), 'fel', `${id} ${v}`);
        }
      }
      const { [RATTAS[0]]: _bort, ...ofullstandig } = svar;
      writeFileSync(join(dir, 'fel.json'), JSON.stringify({ falt: ofullstandig }));
      assert.notEqual(spawnSync('python3', [FACIT, String(vecka), '--svar', join(dir, 'fel.json'), '--ut', ut]).status, 0, 'ett fält utan svar stoppar');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  test(`vecka ${vecka}: lärarens klartext ger Rätt! (bara med INLAMNING_FACIT_DIR)`, async (t) => {
    const mapp = process.env.INLAMNING_FACIT_DIR;
    if (!mapp) { t.skip('INLAMNING_FACIT_DIR är inte satt'); return; }
    const N = await laddaNyckel();
    const svar = JSON.parse(readFileSync(join(mapp, `facit-v${vecka}.json`), 'utf8')).falt;
    assert.deepEqual(Object.keys(svar).sort(), RATTAS);
    for (const id of RATTAS) {
      if (FALT[id].typ === 'val') {
        const godkanda = [svar[id]].flat().map(String);
        for (const v of FALT[id].alternativ) assert.equal(ratta(N, id, v), godkanda.includes(v) ? 'ratt' : 'fel', `${id} ${v}`);
      } else {
        const [a, b = '1'] = String(svar[id]).replace(',', '.').split('/');
        const v = Number(a) / Number(b);
        assert.equal(ratta(N, id, String(v)), 'ratt', `${id} ${v}`);
        assert.equal(ratta(N, id, String(v * 1.03)), 'fel', `${id} +3 %`);
      }
    }
  });
}
