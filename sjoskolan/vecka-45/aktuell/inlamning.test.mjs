// Vecka 45 har ingen inlämning som betygsätts: övningstentan är frivillig, och felsökningsrapporten och analysen av mätdata
// lämnas in med vecka 43 och 44. Sidan behåller ankarna (#uppgift-1, #uppgift-3), så att gamla länkar leder till hänvisningen.
// Kör: node --test sjoskolan/vecka-45/aktuell/inlamning.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
const SIDA = readFileSync(join(HAR, 'Inlamning.html'), 'utf8');

test('vecka 45: inga svarsrutor och ingen sista dag, övningstentan är frivillig', () => {
  assert.ok(!SIDA.includes('ri-svar') && !SIDA.includes('ri-lamna') && !SIDA.includes('sjalvrattning-sida.mjs'));
  assert.ok(SIDA.includes('Övningstentan gör du inför tentamen. Den är frivillig och betygsätts inte.'));
  assert.ok(!/söndag/i.test(SIDA), 'inget lämnas in på söndag');
  assert.ok(!SIDA.includes('Skriv mejlet till läraren'), 'ingen mejlknapp för en frivillig uppgift');
  assert.match(SIDA, /<section class="task sj-panel" id="uppgift-2" data-ovning="EL-000827">/);
});

test('vecka 45: felsökningsrapporten och analysen hänvisar till veckan de lämnas in med', () => {
  for (const [ankare, ovning, vecka] of [['uppgift-1', 'EL-000826', 44], ['uppgift-3', 'EL-000828', 43]]) {
    const sek = SIDA.match(new RegExp(`<section class="task sj-panel task-flyttad" id="${ankare}" data-ovning="${ovning}">([\\s\\S]*?)</section>`));
    assert.ok(sek, `${ankare} finns kvar med en hänvisning`);
    assert.ok(sek[1].includes(`Lämnas in med vecka ${vecka}.`));
    assert.ok(sek[1].includes(`href="../../vecka-${vecka}/aktuell/Inlamning.html#uppgift-4"`));
    const dit = readFileSync(join(HAR, '..', '..', `vecka-${vecka}`, 'aktuell', 'Inlamning.html'), 'utf8');
    assert.match(dit, new RegExp(`<section class="task sj-panel" id="uppgift-4" data-ovning="${ovning}">`), `vecka ${vecka} har uppgiften som inlämning 4`);
  }
  assert.ok(SIDA.includes('Felsökningsrapporten lämnar du med vecka 43, senast fredag 23 oktober'));
  assert.ok(SIDA.includes('analysen av mätdata med vecka 44, senast fredag 30 oktober'));
});
