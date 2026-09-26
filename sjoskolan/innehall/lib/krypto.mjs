#!/usr/bin/env node
// Sjöskolan · kryptering av skyddat innehåll (lärar- och bokfält).
// Samma format som bokens filer: "NJENC1" + salt(16) + iv(12) + AES-256-GCM-chiffertext, nyckel via PBKDF2-SHA-256 (600 000 varv).
// Python saknar fungerande kryptobibliotek i miljön, så lib/krypto.py anropar det här skriptet.
//
//   LOSEN=… node krypto.mjs dekryptera <fil.enc>            klartext till stdout
//   LOSEN=… node krypto.mjs kryptera <klartext> <fil.enc>   behåller filen om klartexten är oförändrad
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const { subtle } = globalThis.crypto;
const MAGIC = 'NJENC1', ITER = 600000;

async function nyckel(losen, salt) {
  const bas = await subtle.importKey('raw', new TextEncoder().encode(losen), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, bas, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function dekryptera(buf, losen) {
  const b = new Uint8Array(buf);
  if (new TextDecoder().decode(b.slice(0, 6)) !== MAGIC) throw new Error('inte NJENC1-format');
  const salt = b.slice(6, 22), iv = b.slice(22, 34);
  return new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv }, await nyckel(losen, salt), b.slice(34)));
}
export async function kryptera(data, losen) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, await nyckel(losen, salt), data));
  return Buffer.concat([Buffer.from(MAGIC), salt, iv, ct]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const losen = process.env.LOSEN;
  if (!losen) { console.error('Ange lösenordet i miljövariabeln LOSEN.'); process.exit(2); }
  const [cmd, a, b] = process.argv.slice(2);
  try {
    if (cmd === 'dekryptera') process.stdout.write(Buffer.from(await dekryptera(readFileSync(a), losen)));
    else if (cmd === 'kryptera') {
      const ny = readFileSync(a);
      // Oförändrad klartext ger oförändrad fil, så att bygget går att upprepa utan nya diffar.
      if (existsSync(b)) { try { if (Buffer.from(await dekryptera(readFileSync(b), losen)).equals(ny)) { console.log('oförändrad'); process.exit(0); } } catch {} }
      writeFileSync(b, await kryptera(ny, losen)); console.log('krypterad');
    } else { console.error('okänt kommando'); process.exit(2); }
  } catch (e) { console.error(`Kunde inte ${cmd}: ${e.message}`); process.exit(1); }
}
