// PDF-skrivaren för elevens inlämning: teckenmappning, radbrytning, filens struktur och att filen går att öppna
// (pdfinfo och pdftotext ur poppler-utils när de finns). Kör: node --test sjoskolan/gemensamt/pdf.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { winAnsi, bredd, radbryt, layout, skapaPdf, A4 } from './pdf.mjs';
import { pdfBlock, nyttLage, registrera, lasForstaVersion } from './sjalvrattning.mjs';

const poppler = !spawnSync('pdftotext', ['-v']).error && !spawnSync('pdfinfo', ['-v']).error;
const latin1 = (s) => Buffer.from(s, 'latin1');

/** Kontrollerar filens uppbyggnad: huvud, objekt, xref-tabellens byteadresser, strömmarnas längd och trailern. */
function struktur(pdf) {
  const s = Buffer.from(pdf).toString('latin1');
  assert.ok(s.startsWith('%PDF-1.4\n'));
  assert.ok(s.endsWith('%%EOF\n'));
  assert.ok([...pdf].every((b) => b < 128), 'hela filen är ASCII');
  const xref = Number(s.match(/startxref\n(\d+)\n%%EOF\n$/)[1]);
  assert.equal(s.slice(xref, xref + 4), 'xref');
  const [, forsta, antal] = s.slice(xref).match(/^xref\n(\d+) (\d+)\n/).map(Number);
  assert.equal(forsta, 0);
  const rader = s.slice(xref).split('\n').slice(2, 2 + antal);
  assert.equal(rader[0], '0000000000 65535 f ');
  rader.slice(1).forEach((r, i) => {
    assert.match(r, /^\d{10} 00000 n $/);
    const adr = Number(r.slice(0, 10));
    assert.equal(s.slice(adr, adr + `${i + 1} 0 obj`.length), `${i + 1} 0 obj`, `objekt ${i + 1}`);
  });
  assert.match(s, new RegExp(`trailer\\n<< /Size ${antal} /Root 1 0 R /Info 5 0 R >>`));
  for (const m of s.matchAll(/<< \/Length (\d+) >>\nstream\n/g)) {
    const start = m.index + m[0].length;
    assert.equal(s.slice(start + Number(m[1]), start + Number(m[1]) + 10), '\nendstream', 'strömmens längd stämmer');
  }
  const sidor = Number(s.match(/\/Type \/Pages \/Kids \[[^\]]*\] \/Count (\d+)/)[1]);
  assert.equal((s.match(/\/Type \/Page \//g) || []).length, sidor);
  return { s, sidor };
}

function oppna(pdf) {
  const dir = mkdtempSync(join(tmpdir(), 'pdf-'));
  try {
    const fil = join(dir, 'prov.pdf');
    writeFileSync(fil, pdf);
    const info = execFileSync('pdfinfo', [fil], { encoding: 'utf8' });
    const text = execFileSync('pdftotext', ['-enc', 'UTF-8', '-layout', fil, '-'], { encoding: 'utf8' });
    return { info, text };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('tecken utanför WinAnsi blir läsbar text, svenska tecken behålls', () => {
  assert.equal(winAnsi('Åsa Öberg, ärlig'), 'Åsa Öberg, ärlig');
  assert.equal(winAnsi('2 200 Ω'), '2 200 ohm');
  assert.equal(winAnsi('a → b ≤ c ≥ d ≈ e − f'), 'a -> b <= c >= d ~ e - f');
  assert.equal(winAnsi('U_{beröring} och x^{2}'), 'U_beröring och x^2');
  assert.equal(winAnsi('H₂O och 10⁻³ och x²'), 'H2O och 10^-3 och x²');
  assert.equal(winAnsi('✔ klart'), 'OK klart');
  assert.equal(winAnsi('“citat” – …'), latin1(Buffer.from([0x93])).toString('latin1') + 'citat' + String.fromCharCode(0x94, 0x20, 0x96, 0x20, 0x85));
  assert.equal(winAnsi('ŝ'), 's', 'diakriter utan egen kod faller tillbaka på grundbokstaven');
  assert.equal(winAnsi('漢'), '?');
  assert.ok([...winAnsi('Allt ✓ Ω → 𝒳 ½ € µ')].every((c) => c.charCodeAt(0) <= 255));
});

test('bredder och radbrytning följer Helveticas mått', () => {
  assert.equal(bredd('W', false, 10), 9.44);
  assert.equal(bredd('a', true, 10), 5.56);
  assert.ok(bredd('Åsa', false, 10) > bredd('Asa', false, 10) - 0.001);
  const rader = radbryt(winAnsi('Kroppens resistans ändras mycket med fukt, kontaktyta och spänning. '.repeat(6)), false, 10, 200);
  assert.ok(rader.length > 3);
  for (const r of rader) assert.ok(bredd(r, false, 10) <= 200, r);
  const lang = radbryt('x'.repeat(300), false, 10, 100);
  assert.ok(lang.length > 1 && lang.every((r) => bredd(r, false, 10) <= 100), 'ett för långt ord delas');
  assert.deepEqual(radbryt('rad ett\nrad två', false, 10, 400), ['rad ett', 'rad två']);
});

test('sidbrytning: många rader blir flera A4-sidor, och ingen rad hamnar utanför marginalerna', () => {
  const block = [{ typ: 'rubrik', text: 'Rubrik' }, ...Array.from({ length: 150 }, (_, i) => ({ typ: 'text', text: `Rad ${i}` }))];
  const sidor = layout(block);
  assert.ok(sidor.length >= 3);
  for (const sida of sidor) for (const r of sida) assert.ok(r.y > 56 && r.y < A4[1] - 50 && r.x >= 56, JSON.stringify(r));
  assert.equal(sidor.flat().length, 151);
});

test('filen har rätt struktur och går att öppna (pdfinfo, pdftotext)', (t) => {
  const block = [{ typ: 'rubrik', text: 'Sjöskolan · Elteknik och ellära · Inlämning vecka 42' }, { typ: 'text', text: 'Namn: Åsa Öberg' },
    { typ: 'underrubrik', text: 'Resultat: 18 av 20 rätt' }, { typ: 'text', text: 'R = 2 200 Ω, I ≤ 30 mA → farligt. Parentes (a) och snedstreck \\.' },
    ...Array.from({ length: 90 }, (_, i) => ({ typ: 'text', text: `Rad ${i}: fara, händelse och konsekvens.`, indrag: i % 2 }))];
  const pdf = skapaPdf(block, { titel: 'Inlämning vecka 42: Åsa Öberg', forfattare: 'Åsa Öberg', sidfot: 'Sjöskolan · Åsa Öberg', skapad: new Date('2026-10-12T17:00:00Z') });
  const { sidor } = struktur(pdf);
  assert.ok(sidor >= 2);
  if (!poppler) { t.skip('pdfinfo/pdftotext saknas (poppler-utils)'); return; }
  const { info, text } = oppna(pdf);
  assert.match(info, /Title:\s+Inlämning vecka 42: Åsa Öberg/);
  assert.match(info, new RegExp(`Pages:\\s+${sidor}\\b`));
  assert.match(info, /Page size:\s+595.28 x 841.89 pts \(A4\)/);
  for (const bit of ['Sjöskolan · Elteknik och ellära · Inlämning vecka 42', 'Namn: Åsa Öberg', 'Resultat: 18 av 20 rätt',
    'R = 2 200 ohm, I <= 30 mA -> farligt. Parentes (a) och snedstreck \\.', 'Rad 89: fara, händelse och konsekvens.', `Sida ${sidor} av ${sidor}`]) {
    assert.ok(text.includes(bit), `pdftotext saknar: ${bit}`);
  }
});

test('elevens PDF ur pdfBlock går att öppna och innehåller resultatet', (t) => {
  const plan = { vecka: '42', titel: 'Elektriska risker och skydd', uppgifter: [{ nr: '2', ovning: 'EL-X', titel: 'Provuppgift', lm: ['LM-2'], checklista: null,
    falt: [{ id: 'x', typ: 'tal', kort: 'a', enhet: 'mA', etikett: 'a) Ström I (mA)' }, { id: 'y', typ: 'lastext', kort: 'a fara', etikett: 'Fara' }] }] };
  let l = nyttLage();
  l.falt.x = registrera(undefined, '12', 'fel', 't1:120', '2026-10-12T08:00:00Z');
  l.falt.y = { nu: 'Spänning (230 V) i höljet. Mer text.' };
  l = lasForstaVersion(l, 'EL-X', { y: 'Spänning (230 V) i höljet.' }, '2026-10-12T08:01:00Z');
  const pdf = skapaPdf(pdfBlock(plan, l, { namn: 'Åsa Öberg', tid: '2026-10-12T09:00:00Z', lmText: { 'LM-2': 'Du kan förklara hur el kan skada.' } }),
    { titel: 'Inlämning vecka 42: Åsa Öberg', sidfot: 'Sjöskolan · Inlämning vecka 42 · Åsa Öberg' });
  struktur(pdf);
  if (!poppler) { t.skip('pdfinfo/pdftotext saknas (poppler-utils)'); return; }
  const { text } = oppna(pdf);
  for (const bit of ['Inlämning vecka 42', 'Namn: Åsa Öberg', 'Resultat: 0 av 1 rätt', 'a) Ström I (mA)', 'Inte rätt. 1 försök, omgång 1.',
    'Fara: Spänning (230 V) i höljet. [tillägg: Mer text.]', 'Kursplanens mål', 'LM-2: 0 av 1 rätt.', 'Kontrollkod']) {
    assert.ok(text.replace(/\s+/g, ' ').includes(bit), `pdftotext saknar: ${bit}\n${text}`);
  }
});
