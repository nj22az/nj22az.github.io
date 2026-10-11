// Veckosidan som dagar (gemensamt/dagsvy.mjs): dagens läge, läxornas läge och formulärens text.
import test from 'node:test';
import assert from 'node:assert/strict';
import { idagLage, laxLage, formularText, kvarText, datumText, lmSumma, lektionText } from './dagsvy.mjs';

const lektioner = [
  { id: 'v42_01', datum: '2026-10-12', start: '09:00', slut: '11:00' },
  { id: 'v42_02', datum: '2026-10-13', start: '15:00', slut: '17:00' },
  { id: 'v42_03', datum: '2026-10-16', start: '09:00', slut: '11:00' },
];
const lage = (iso) => idagLage(lektioner, '2026-10-16', new Date(iso));  // allt lämnas in senast fredag

test('dagens läge följer datum och klockslag', () => {
  assert.deepEqual([lage('2026-10-11T18:00').typ, lage('2026-10-11T18:00').nasta.id], ['före-veckan', 'v42_01']);
  assert.deepEqual([lage('2026-10-12T08:30').typ, lage('2026-10-12T08:30').fas], ['lektion', 'före']);
  assert.equal(lage('2026-10-12T09:30').fas, 'pågår');
  const efter = lage('2026-10-12T13:00');
  assert.deepEqual([efter.fas, efter.lektion.id, efter.nasta.id], ['efter', 'v42_01', 'v42_02']);
  const onsdag = lage('2026-10-14T12:00');
  assert.deepEqual([onsdag.typ, onsdag.nasta.id], ['ingen', 'v42_03']);
  const torsdag = lage('2026-10-15T20:00');
  assert.deepEqual([torsdag.typ, torsdag.nasta.id], ['ingen', 'v42_03']);
  assert.equal(lage('2026-10-17T10:00').typ, 'slut', 'inget lämnas in efter fredag');
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

test('kursplanens punkter: inlämningens och quizets svar läggs ihop, sidans totaler utan sparad plan', () => {
  const data = { falt_lm: { inlamning: { 'LM-2': 5, 'LM-3': 8 }, quiz: { 'LM-2': 30, 'LM-7': 20 } } };
  assert.deepEqual(lmSumma(data, null, null), { 'LM-2': { ratt: 0, totalt: 35 }, 'LM-3': { ratt: 0, totalt: 8 }, 'LM-7': { ratt: 0, totalt: 20 } });
  const quiz = { dokument: [{ ratt: 4, totalt: 10 }], lm: { 'LM-2': { ratt: 4, totalt: 30 }, 'LM-7': { ratt: 2, totalt: 20 } } };
  const inl = { uppgifter: [{ ratt: 3, totalt: 4 }], lm: { 'LM-2': { ratt: 3, totalt: 5 }, 'LM-3': { ratt: 1, totalt: 8 } } };
  assert.deepEqual(lmSumma(data, inl, quiz), { 'LM-2': { ratt: 7, totalt: 35 }, 'LM-3': { ratt: 1, totalt: 8 }, 'LM-7': { ratt: 2, totalt: 20 } });
});

test('delsidans lektionsläge: om några dagar, i morgon, i dag, pågår och har varit', () => {
  const l = { datum: '2026-10-13', start: '15:00', slut: '17:00', tid: '15.00–17.00' };
  assert.equal(lektionText(l, new Date('2026-10-11T18:00')), 'Om 2 dagar');
  assert.equal(lektionText(l, new Date('2026-10-12T18:00')), 'I morgon 15.00–17.00');
  assert.equal(lektionText(l, new Date('2026-10-13T14:00')), 'I dag 15.00–17.00');
  assert.equal(lektionText(l, new Date('2026-10-13T15:30')), 'Pågår nu');
  assert.equal(lektionText(l, new Date('2026-10-13T18:00')), 'Lektionen har varit i dag');
  assert.equal(lektionText(l, new Date('2026-10-14T09:00')), 'Lektionen har varit');
});

test('två lektioner samma dag: den som pågår eller kommer härnäst, och resten av dagen', () => {
  const vecka44 = [
    { id: 'v44_01', datum: '2026-10-26', start: '09:00', slut: '10:00', tid: '09.00–10.00' },
    { id: 'v44_02', datum: '2026-10-26', start: '10:00', slut: '11:00', tid: '10.00–11.00' },
    { id: 'v44_03', datum: '2026-10-27', start: '15:00', slut: '16:00', tid: '15.00–16.00' },
  ];
  const l = (iso) => idagLage(vecka44, '2026-10-30', new Date(iso));
  assert.deepEqual([l('2026-10-26T08:30').fas, l('2026-10-26T08:30').lektion.id, l('2026-10-26T08:30').senare.map((x) => x.id)], ['före', 'v44_01', ['v44_02']]);
  assert.deepEqual([l('2026-10-26T10:15').fas, l('2026-10-26T10:15').lektion.id, l('2026-10-26T10:15').senare.length], ['pågår', 'v44_02', 0]);
  assert.deepEqual([l('2026-10-26T12:00').fas, l('2026-10-26T12:00').lektion.id, l('2026-10-26T12:00').nasta.id], ['efter', 'v44_02', 'v44_03']);
});

test('utan läst-knapp på delsidan är läs-läxan en Klart-ruta', () => {
  const k = { lasning: { 'del-1': '2026-10-19T12:00:00Z' }, ovningar: {}, steg: { 'v43_01-del-1': true } };
  assert.deepEqual(laxLage({ id: 'v43_01', lasknapp: false }, 'del-1', k), { klar: true, text: '' });
  assert.equal(laxLage({ id: 'v43_02', lasknapp: false }, 'del-2', k).klar, false);
});
