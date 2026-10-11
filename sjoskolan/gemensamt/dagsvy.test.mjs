// Veckosidan som dagar (gemensamt/dagsvy.mjs): dagens läge, läxornas läge och formulärens text.
import test from 'node:test';
import assert from 'node:assert/strict';
import { idagLage, laxLage, formularText, kvarText, datumText } from './dagsvy.mjs';

const lektioner = [
  { id: 'v42_01', datum: '2026-10-12', start: '09:00', slut: '11:00' },
  { id: 'v42_02', datum: '2026-10-13', start: '15:00', slut: '17:00' },
  { id: 'v42_03', datum: '2026-10-16', start: '09:00', slut: '11:00' },
];
const lage = (iso) => idagLage(lektioner, '2026-10-18', new Date(iso));

test('dagens läge följer datum och klockslag', () => {
  assert.deepEqual([lage('2026-10-11T18:00').typ, lage('2026-10-11T18:00').nasta.id], ['före-veckan', 'v42_01']);
  assert.deepEqual([lage('2026-10-12T08:30').typ, lage('2026-10-12T08:30').fas], ['lektion', 'före']);
  assert.equal(lage('2026-10-12T09:30').fas, 'pågår');
  const efter = lage('2026-10-12T13:00');
  assert.deepEqual([efter.fas, efter.lektion.id, efter.nasta.id], ['efter', 'v42_01', 'v42_02']);
  const onsdag = lage('2026-10-14T12:00');
  assert.deepEqual([onsdag.typ, onsdag.nasta.id], ['ingen', 'v42_03']);
  const lordag = lage('2026-10-17T10:00');
  assert.deepEqual([lordag.typ, lordag.nasta], ['ingen', null]);
  assert.equal(lage('2026-10-19T10:00').typ, 'slut');
});

test('läxornas läge: läst del, övning 6–10 och Klart-rutan', () => {
  const k = {
    lasning: { 'del-1': '2026-10-12T12:00:00Z' },
    ovningar: { 'v42_01-q6': true, 'v42_01-q7': true, 'v42_01-q1': true, 'v42_02-q6': true },
    steg: { 'v42_01-film': true },
  };
  const l = lektioner[0];
  assert.deepEqual(laxLage(l, 'del-1', k), { klar: true, text: '✓ Läst' });
  assert.deepEqual(laxLage(lektioner[1], 'del-2', k), { klar: false, text: 'Inte läst än' });
  assert.deepEqual(laxLage(l, 'ovn-1', k), { klar: false, text: '2 av 5 klara' }, 'övning 1.1 räknas inte, den görs på lektionen');
  assert.equal(laxLage(l, 'film', k).klar, true);
  assert.equal(laxLage(lektioner[2], 'labb', k).klar, false);
});

test('formulärens text: inte påbörjad, x av y rätt, låst och inlämnad', () => {
  assert.equal(formularText(null).text, 'Inte påbörjad');
  assert.equal(formularText({ uppgifter: [] }).text, 'Inte påbörjad', 'planen sparas först när formuläret öppnas');
  const s = { inlamnad: null, last: false, uppgifter: [{ ratt: 2, totalt: 4 }, { ratt: 1, totalt: 3 }] };
  assert.equal(formularText(s).text, '3 av 7 rätt');
  assert.match(formularText({ ...s, last: true }).text, /läs om texten/);
  assert.deepEqual([formularText({ ...s, inlamnad: '2026-10-15T18:00:00Z' }).text, formularText({ ...s, inlamnad: 'x' }).klar], ['✓ Inlämnad · 3 av 7 rätt', true]);
});

test('kvar till sista dagen och datum i text', () => {
  assert.deepEqual(kvarText('2026-10-15', new Date('2026-10-12T10:00')), { text: '3 dagar kvar', bradskande: false });
  assert.deepEqual(kvarText('2026-10-15', new Date('2026-10-14T10:00')), { text: 'i morgon', bradskande: true });
  assert.equal(kvarText('2026-10-15', new Date('2026-10-16T10:00')).text, 'passerad');
  assert.equal(datumText(new Date('2026-10-15T12:00')), 'torsdag 15 oktober');
});
