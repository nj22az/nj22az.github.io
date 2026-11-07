// Quizen vecka 42 (Quiz.html): sidan, posterna, placeringarna, nyckeln och facit.py hör ihop, alternativen
// står med bokstäver i postens ordning, och inga svar står i klartext. Kör: node --test sjoskolan/vecka-42/aktuell/quiz.test.mjs
// Med QUIZ_FACIT=/utanför/repot/quiz-v42.json prövas också lärarens klartext mot nyckeln (finns inte i CI).
// Motorn med påhittade texter: verktyg/inlamning/test_quiz.py och gemensamt/sjalvrattning.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { NYCKEL } from './quiz-nyckel.mjs';
import { ratta, lmResultat } from '../../gemensamt/sjalvrattning.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const SJO = join(HAR, '..', '..');
const FACIT = join(SJO, 'verktyg', 'inlamning', 'facit.py');
const SIDA = readFileSync(join(HAR, 'Quiz.html'), 'utf8');
const post = (id) => JSON.parse(readFileSync(join(SJO, 'innehall', 'ovningar', `${id}.json`), 'utf8'));
const VERSION = readFileSync(join(SJO, 'verktyg', 'inlamning', 'sjalvrattning.py'), 'utf8').match(/^VERSION = '(\d{8})'/m)[1];
const python = !spawnSync('python3', ['--version']).error;

const PLATS = 'vecka-42/aktuell/Quiz.html';
const PLACERINGAR = JSON.parse(readFileSync(join(SJO, 'innehall', 'placeringar', 'quiz.json'), 'utf8')).placeringar
  .filter((p) => p.plats === PLATS).sort((a, b) => a.ordning - b.ordning);
const POSTER = PLACERINGAR.map((p) => post(p.ovning));

/** Fälten i sidan: {id: {typ, ovning, alternativ: [bokstav …], texter: […], heltal}}. */
function sidansFalt() {
  const ut = {};
  for (const sek of SIDA.matchAll(/<div class="ri-svar" data-ovning="(EL-\d{6})"([\s\S]*?)<div class="ri-knappar">/g)) {
    for (const m of sek[2].matchAll(/<(div|fieldset) class="ri-falt[^"]*" data-falt="([^"]+)" data-typ="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g)) {
      const heltal = m[4].match(/data-heltal="(\d+)-(\d+)"/);
      ut[m[2]] = { typ: m[3], ovning: sek[1], heltal: heltal ? [Number(heltal[1]), Number(heltal[2])] : null,
        alternativ: [...m[5].matchAll(/value="([^"]+)"><span class="ri-bokstav">([A-E])<\/span><span>([\s\S]*?)<\/span>/g)].map((x) => {
          assert.equal(x[1], x[2], `${m[2]}: bokstaven på sidan är alternativets id`);
          return x[1];
        }),
        texter: [...m[5].matchAll(/<span class="ri-bokstav">[A-E]<\/span><span>([\s\S]*?)<\/span>/g)].map((x) => x[1]),
        pekare: (m[5].match(/<p class="ri-pekare" hidden>([\s\S]*?)<\/p>/) || [])[1] };
    }
  }
  return ut;
}
const FALT = sidansFalt();
const RATTAS = Object.keys(FALT);
const html = (t) => t.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

test('sidan har texterna i placeringarnas ordning och nyckeln har samma fält', () => {
  assert.ok(PLACERINGAR.length >= 1);
  assert.deepEqual([...SIDA.matchAll(/<section class="task sj-panel ri-dok" id="([^"]+)" data-ovning="(EL-\d{6})">/g)].map((m) => m[2]),
    PLACERINGAR.map((p) => p.ovning));
  PLACERINGAR.forEach((p, i) => assert.equal(p.nummer, `Text ${i + 1}`, `${p.ovning}: numret följer ordningen (numrering.py --skriv)`));
  assert.deepEqual(Object.keys(NYCKEL.falt), RATTAS, 'kör facit.py 42 --sida quiz och innehall.py bygg quiz');
  for (const id of RATTAS) assert.equal(NYCKEL.falt[id].typ, FALT[id].typ, id);
});

test('nyckeln innehåller bara saltade hashar och är skriven för posternas nuvarande revision', () => {
  assert.equal(NYCKEL.version, 1);
  assert.equal(NYCKEL.vecka, 42);
  assert.match(NYCKEL.salt, /^[0-9a-f]{16,64}$/);
  for (const [id, f] of Object.entries(NYCKEL.falt)) {
    assert.deepEqual(Object.keys(f).filter((k) => !['typ', 'dec', 'h'].includes(k)), [], id);
    assert.ok(f.h.length > 0 && f.h.every((h) => /^[0-9a-f]{16}$/.test(h)), id);
  }
  assert.deepEqual(Object.keys(NYCKEL.poster), PLACERINGAR.map((p) => p.ovning));
  for (const [id, rev] of Object.entries(NYCKEL.poster)) {
    assert.equal(post(id).revision, rev, `${id} har revision ${post(id).revision}, men nyckeln är skriven för revision ${rev}. Kontrollera `
      + 'facit (bokstäverna följer alternativens ordning i posten), kör facit.py 42 --sida quiz och innehall.py bygg quiz.');
  }
});

test('alternativen står med bokstäver A–E i postens ordning, och minst ett men inte alla är godkända', () => {
  for (const p of POSTER) {
    for (const d of p.uppgift.delfragor) {
      const f = FALT[`${p.id.slice(-3)}${d.id}`];
      assert.ok(f, `${p.id} ${d.id} finns på sidan`);
      if (!d.alternativ) { assert.equal(f.typ, 'tal'); assert.ok(f.heltal, 'en fråga utan alternativ är ett heltal'); continue; }
      assert.ok(d.alternativ.length >= 4 && d.alternativ.length <= 5, `${p.id} ${d.id}: 4–5 alternativ`);
      assert.deepEqual(f.alternativ, [...'ABCDE'].slice(0, d.alternativ.length), 'ingen blandning');
      assert.deepEqual(f.texter.map((x) => x.replace(/<\/?su[bp]>/g, '')), d.alternativ.map((a) => html(a.replace(/[_^]\{([^{}]*)\}/g, '$1'))),
        `${p.id} ${d.id}: alternativen i postens ordning`);
      const godkanda = f.alternativ.filter((v) => ratta(NYCKEL, f && `${p.id.slice(-3)}${d.id}`, v) === 'ratt').length;
      assert.ok(godkanda >= 1 && godkanda < f.alternativ.length, `${p.id} ${d.id}: ${godkanda} godkända`);
      assert.equal(NYCKEL.falt[`${p.id.slice(-3)}${d.id}`].h.length, godkanda);
      assert.equal(ratta(NYCKEL, `${p.id.slice(-3)}${d.id}`, '1'), 'fel', 'siffror är inga bokstäver');
    }
  }
});

test('posterna följer formatet: läsanvisning, frågor med ledtrad, PDF och källa, inga svar', () => {
  for (const p of POSTER) {
    assert.ok(p.uppgift.fraga.length > 20, `${p.id}: läsanvisningen`);
    assert.ok(SIDA.includes(html(p.uppgift.fraga)), `${p.id}: läsanvisningen står på sidan`);
    assert.ok(p.uppgift.delfragor.length >= 1);
    const r = p.referenser.resurser[0];
    assert.match(r.url, /^vecka-42\/aktuell\/[^/]+\.pdf$/);
    assert.ok(existsSync(join(SJO, r.url)) && readFileSync(join(SJO, r.url)).subarray(0, 5).toString() === '%PDF-', `${p.id}: PDF:en finns`);
    assert.ok(p.referenser.rattigheter, `${p.id}: källan`);
    assert.ok(SIDA.includes(`Källa: ${html(p.referenser.rattigheter)}`));
    const kort = r.kortnamn || r.titel.replace(/\s*\(PDF\)\s*$/, '');
    const fil = r.url.split('/').pop();
    for (const d of p.uppgift.delfragor) {
      for (const k of ['ratt', 'svar', 'forklaring']) assert.ok(!(k in d), `${p.id} ${d.id}: ${k} hör inte hemma i posten`);
      assert.ok(d.ledtrad && !/^\d/.test(d.ledtrad), `${p.id} ${d.id}: läshänvisning till ett avsnitt`);
      assert.equal(FALT[`${p.id.slice(-3)}${d.id}`].pekare, `Läs <a href="${fil}">${html(d.ledtrad)}</a> i ${html(kort)}.`, 'hänvisningen är avsnittet, aldrig svaret');
    }
  }
});

test('rutan Låsta frågor har en rad per text med Öppna och Jag har läst om texten, men inga delsidor', () => {
  const ruta = SIDA.match(/<section class="sj-panel warn ri-lasom" id="ri-lasom" hidden>([\s\S]*?)<\/section>/);
  assert.ok(ruta, 'rutan finns och är dold tills en fråga är låst');
  assert.deepEqual([...ruta[1].matchAll(/<li data-ri-dok="(EL-\d{6})" hidden>/g)].map((m) => m[1]), PLACERINGAR.map((p) => p.ovning));
  assert.deepEqual([...ruta[1].matchAll(/data-ri-omlast="(EL-\d{6})">Jag har läst om texten</g)].map((m) => m[1]), PLACERINGAR.map((p) => p.ovning));
  for (const p of POSTER) assert.ok(ruta[1].includes(`>Öppna ${html(p.referenser.resurser[0].titel)}</a>`), p.id);
  assert.ok(!/Del_\d\.html|data-ri-delar|data-ri-last=/.test(ruta[1]), 'inga del 1–3 på den här sidan');
});

test('Lämna in: egen lagring, namn, PDF och Classroom senast torsdag; en huvudknapp', () => {
  assert.match(SIDA, /<section class="sj-panel ri-lamna" id="lamna-in" data-ri-quiz data-ri-vecka="42" data-ri-lagring="sj-v42-quiz"/);
  assert.match(SIDA, /data-ri-max="3"/);
  assert.ok(SIDA.includes('data-ri-classroom="Lämna in PDF-filen i Google Classroom under Vecka 42 – Quiz senast torsdag 15 oktober."'));
  assert.ok(SIDA.includes('<label for="ri-namn">Förnamn och efternamn</label>'));
  assert.equal((SIDA.match(/class="sj-btn primary/g) || []).length, 1, 'en huvudknapp: Lämna in');
  assert.ok(SIDA.includes('svara på alla frågor senast <strong>torsdag 15 oktober</strong>'));
});

test('sidan laddar översättningsskyddet, modulen och nyckeln med aktuell version, och modulerna har samma version', () => {
  assert.ok(SIDA.includes('/sjoskolan/gemensamt/oversattning.js'));
  assert.ok(SIDA.includes(`/sjoskolan/gemensamt/quiz-sida.mjs?v=${VERSION}`));
  assert.ok(SIDA.includes(`/sjoskolan/gemensamt/sjalvrattning.css?v=${VERSION}`));
  const v = createHash('sha256').update(readFileSync(join(HAR, 'quiz-nyckel.mjs'))).digest('hex').slice(0, 10);
  assert.ok(SIDA.includes(`./quiz-nyckel.mjs?v=${v}`), 'kör innehall.py bygg quiz efter facit.py (regel 13)');
  // Regel 13: modulerna importerar varandra med samma version som sidorna (sjalvrattning.py VERSION).
  const gem = join(SJO, 'gemensamt');
  for (const f of readdirSync(gem).filter((x) => /^(sjalvrattning|quiz|lasbekraftelse|pdf).*\.mjs$/.test(x) && !x.includes('.test.'))) {
    for (const m of readFileSync(join(gem, f), 'utf8').matchAll(/from '\.\/(sjalvrattning|pdf)\.mjs\?v=([^']+)'/g)) assert.equal(m[2], VERSION, `${f}: ${m[1]}.mjs`);
  }
});

test('byggets plan och fälten per kursplanspunkt (sjalvrattning.py) stämmer med sidan', (t) => {
  if (!python) { t.skip('python3 saknas'); return; }
  const r = spawnSync('python3', ['-c', `import sys, json; sys.path.insert(0, ${JSON.stringify(join(SJO, 'verktyg', 'inlamning'))}); import sjalvrattning as S
print(json.dumps({'plan': S.quiz_plan(42), 'las': S.falt_per_lm(42, 'quiz'), 'inl': S.falt_per_lm(42, 'inlamning')}))`], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const { plan, las, inl } = JSON.parse(r.stdout);
  assert.deepEqual(plan.uppgifter.map((u) => [u.nr, u.ovning, u.falt]),
    PLACERINGAR.map((p, i) => [String(i + 1), p.ovning, RATTAS.filter((id) => FALT[id].ovning === p.ovning)]));
  const lm = lmResultat(plan.uppgifter.map((u) => ({ lm: u.lm, ratt: 0, totalt: u.falt.length })));
  assert.deepEqual(Object.fromEntries(Object.entries(lm).map(([m, v]) => [m, v.totalt])), las);
  const inlamning = readFileSync(join(HAR, 'Inlamning.html'), 'utf8');
  const perUppgift = [...inlamning.matchAll(/<div class="ri-svar" data-ovning="(EL-\d{6})"[^>]*data-lm="([^"]*)">([\s\S]*?)<div class="ri-knappar">/g)]
    .map((m) => ({ lm: m[2].split(' ').filter(Boolean), ratt: 0, totalt: (m[3].match(/data-typ="(tal|val)"/g) || []).length }));
  assert.deepEqual(Object.fromEntries(Object.entries(lmResultat(perUppgift)).map(([m, v]) => [m, v.totalt])), inl);
});

test('facit.py: bokstäver per text, listor, och klartext i repot vägras', async (t) => {
  if (!python) { t.skip('python3 saknas'); return; }
  const dir = mkdtempSync(join(tmpdir(), 'lasfacit-'));
  try {
    // Påhittade svar (inte lärarens): sista bokstaven, gemener i en fråga och två bokstäver i en annan.
    const svar = {}, vantat = {};
    for (const p of POSTER) {
      svar[p.id] = {};
      p.uppgift.delfragor.forEach((d, i) => {
        const id = `${p.id.slice(-3)}${d.id}`;
        if (!d.alternativ) { svar[p.id][d.id] = String(FALT[id].heltal[0]); vantat[id] = [String(FALT[id].heltal[0])]; return; }
        const sista = 'ABCDE'[d.alternativ.length - 1];
        svar[p.id][d.id] = i === 0 ? ['A', 'B'] : i === 1 ? sista.toLowerCase() : sista;
        vantat[id] = i === 0 ? ['A', 'B'] : [sista];
      });
    }
    writeFileSync(join(dir, 'prov.json'), JSON.stringify({ kommentar: 'påhittat', ...svar }));
    const ut = join(dir, 'nyckel.mjs');
    const r = spawnSync('python3', [FACIT, '42', '--sida', 'quiz', '--svar', join(dir, 'prov.json'), '--ut', ut, '--salt', 'abcdef0123456789'], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const { NYCKEL: N } = await import(pathToFileURL(ut).href);
    assert.deepEqual(Object.keys(N.falt), RATTAS);
    for (const id of RATTAS) {
      if (FALT[id].typ === 'tal') { assert.equal(ratta(N, id, vantat[id][0], '', FALT[id].heltal), 'ratt', id); continue; }
      for (const v of FALT[id].alternativ) assert.equal(ratta(N, id, v), vantat[id].includes(v) ? 'ratt' : 'fel', `${id} ${v}`);
    }
    const [forsta] = POSTER;
    const fel = (namn, data) => {
      writeFileSync(join(dir, namn), JSON.stringify(data));
      return spawnSync('python3', [FACIT, '42', '--sida', 'quiz', '--svar', join(dir, namn), '--ut', ut], { encoding: 'utf8' });
    };
    assert.notEqual(fel('saknas.json', { ...svar, [forsta.id]: {} }).status, 0, 'en text utan svar stoppar');
    assert.notEqual(fel('okand.json', { ...svar, 'EL-999999': { a: 'A' } }).status, 0, 'en text som inte står på sidan stoppar');
    const valfraga = forsta.uppgift.delfragor.find((d) => d.alternativ);
    assert.notEqual(fel('siffra.json', { ...svar, [forsta.id]: { ...svar[forsta.id], [valfraga.id]: '2' } }).status, 0, 'siffror är inga bokstäver');
    assert.notEqual(fel('alla.json', { ...svar, [forsta.id]: { ...svar[forsta.id], [valfraga.id]: [...'ABCDE'].slice(0, valfraga.alternativ.length) } }).status, 0,
      'alla alternativ godkända stoppar');
    const irepot = spawnSync('python3', [FACIT, '42', '--sida', 'quiz', '--svar', join(SJO, 'README.md'), '--ut', ut], { encoding: 'utf8' });
    assert.notEqual(irepot.status, 0);
    assert.match(irepot.stderr, /ligger i repot/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('lärarens klartext ger Rätt! (bara med QUIZ_FACIT)', (t) => {
  const fil = process.env.QUIZ_FACIT;
  if (!fil) { t.skip('QUIZ_FACIT är inte satt'); return; }
  const svar = JSON.parse(readFileSync(fil, 'utf8'));
  assert.deepEqual(Object.keys(svar).filter((k) => /^EL-\d{6}$/.test(k)).sort(), PLACERINGAR.map((p) => p.ovning).sort());
  for (const p of POSTER) {
    for (const d of p.uppgift.delfragor) {
      const id = `${p.id.slice(-3)}${d.id}`, godkanda = [svar[p.id][d.id]].flat().map((x) => String(x).toUpperCase());
      if (FALT[id].typ === 'tal') { assert.equal(ratta(NYCKEL, id, godkanda[0], '', FALT[id].heltal), 'ratt', id); continue; }
      for (const v of FALT[id].alternativ) assert.equal(ratta(NYCKEL, id, v), godkanda.includes(v) ? 'ratt' : 'fel', `${id} ${v}`);
    }
  }
});
