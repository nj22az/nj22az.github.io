import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { encrypt, decrypt, wrapper } from './las.mjs';

test('kryptering går fram och tillbaka, fel lösenord avvisas', async () => {
  const html = '<h1>Facit: 12,35 V</h1>';
  const d = await encrypt(html, 'rätt-lösen');
  assert.equal(await decrypt(d, 'rätt-lösen'), html);
  await assert.rejects(decrypt(d, 'fel'));
  assert.ok(!wrapper(d, 'T').includes('12,35'));
});
test('de skyddade sidorna i repositoryt är krypterade', () => {
  for (const f of ['../../vecka-40/aktuell/Lararstod.html', '../../vecka-41/aktuell/Simulerade_stationer_larare.html', '../../gemensamt/Riggar.html']) {
    const s = readFileSync(new URL(f, import.meta.url), 'utf8');
    assert.match(s, /id="lock-data"/, f);
    assert.ok(!/Kontrollvärden|Förväntade värden|Tre lektioner/.test(s), f);
  }
});
