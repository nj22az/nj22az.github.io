#!/usr/bin/env node
// Sjöskolan · lösenordsskydd för lärarsidor.
// Sidan krypteras med AES-GCM och en nyckel som härleds ur lösenordet (PBKDF2-SHA-256, 600 000 varv).
// Den publicerade filen innehåller bara chiffertext och ett lösenordsformulär. Klartexten ska inte ligga i repositoryt.
//
//   LARARLOSEN=… node las.mjs lock   <klartext.html> <sida.html>   kryptera en sida
//   LARARLOSEN=… node las.mjs unlock <sida.html> <klartext.html>   dekryptera för redigering (spara utanför repositoryt)
//   LARARLOSEN_GAMMALT=… LARARLOSEN=… node las.mjs rekey <sida.html> [fler.html]   byt lösenord
import { readFileSync, writeFileSync } from 'node:fs';
const { subtle } = globalThis.crypto;
const ITER = 600000;
const b64 = (u8) => Buffer.from(u8).toString('base64');
const unb64 = (s) => new Uint8Array(Buffer.from(s, 'base64'));

async function key(password, salt, iter = ITER) {
  const base = await subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function encrypt(html, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, await key(password, salt), new TextEncoder().encode(html)));
  return { v: 1, it: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
}
export async function decrypt(data, password) {
  const pt = await subtle.decrypt({ name: 'AES-GCM', iv: unb64(data.iv) }, await key(password, unb64(data.salt), data.it), unb64(data.ct));
  return new TextDecoder().decode(pt);
}
const title = (html) => (html.match(/<title>([^<]*)<\/title>/) || [, 'Lärarstöd · Sjöskolan'])[1];
export function wrapper(data, pageTitle) {
  return `<!doctype html>
<html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${pageTitle}</title><link rel="icon" href="/assets/images/apple-touch-icon.png">
<style>
:root{--bg:#f4f4eb;--ink:#163145;--muted:#5d7282;--line:#b8c8cd;--accent:#064f91;--warn:#9a4a12}
@media (prefers-color-scheme:dark){:root{--bg:#10202c;--ink:#e6eef3;--muted:#9fb3c1;--line:#35505f;--accent:#7cb8ef;--warn:#f0a868}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:18px/1.6 system-ui,-apple-system,sans-serif}
main{max-width:520px;margin:12vh auto;padding:0 20px}.kicker{font-size:13px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:var(--muted)}
h1{font-size:2rem;margin:6px 0 12px}label{display:block;font-weight:600;margin:18px 0 6px}
input{font:inherit;width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:transparent;color:inherit}
button{font:inherit;font-weight:700;margin-top:12px;padding:10px 20px;border:0;border-radius:8px;background:var(--accent);color:#fff;cursor:pointer}
button:disabled{opacity:.6}:focus-visible{outline:3px solid var(--accent);outline-offset:3px}#msg{min-height:1.6em;color:var(--warn)}a{color:inherit}
</style></head><body><main>
<p class="kicker">Sjöskolan · lärarstöd</p><h1>${pageTitle.replace(/ · Sjöskolan$/, '')}</h1>
<p>Sidan är till för lärare och är skyddad med lösenord.</p>
<form id="f"><label for="pw">Lösenord</label><input id="pw" type="password" autocomplete="current-password" required><button id="go">Öppna</button><p id="msg" role="status" aria-live="polite"></p></form>
<p><a href="/sjoskolan/">Till Sjöskolan</a></p>
</main>
<script id="lock-data" type="application/json">${JSON.stringify(data)}</script>
<script>
(() => {
  const d = JSON.parse(document.getElementById('lock-data').textContent), K = 'sjoskolan-lararlosen';
  const bytes = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function open(pw) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
    const k = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: bytes(d.salt), iterations: d.it }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const html = new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(d.iv) }, k, bytes(d.ct)));
    try { sessionStorage.setItem(K, pw); } catch {}
    document.open(); document.write(html); document.close();
  }
  const f = document.getElementById('f'), msg = document.getElementById('msg'), go = document.getElementById('go');
  if (!window.crypto || !crypto.subtle) { msg.textContent = 'Webbläsaren saknar stöd för dekryptering. Öppna sidan via https i en aktuell webbläsare.'; go.disabled = true; return; }
  f.addEventListener('submit', async (e) => {
    e.preventDefault(); go.disabled = true; msg.textContent = 'Öppnar …';
    try { await open(document.getElementById('pw').value); } catch { msg.textContent = 'Fel lösenord.'; go.disabled = false; }
  });
  let saved = null; try { saved = sessionStorage.getItem(K); } catch {}
  if (saved) open(saved).catch(() => { try { sessionStorage.removeItem(K); } catch {} });
})();
</script></body></html>
`;
}
const readData = (file) => JSON.parse(readFileSync(file, 'utf8').match(/<script id="lock-data" type="application\/json">([^<]*)<\/script>/)[1]);
const need = (name) => { const v = process.env[name]; if (!v) { console.error(`Ange lösenordet i miljövariabeln ${name}.`); process.exit(1); } return v; };

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, a, b, ...rest] = process.argv.slice(2);
  if (cmd === 'lock') { const html = readFileSync(a, 'utf8'); writeFileSync(b, wrapper(await encrypt(html, need('LARARLOSEN')), title(html))); console.log(`låst: ${b}`); }
  else if (cmd === 'unlock') { writeFileSync(b, await decrypt(readData(a), need('LARARLOSEN'))); console.log(`klartext: ${b}  (lägg den inte i repositoryt)`); }
  else if (cmd === 'rekey') {
    for (const f of [a, b, ...rest].filter(Boolean)) { const html = await decrypt(readData(f), need('LARARLOSEN_GAMMALT')); writeFileSync(f, wrapper(await encrypt(html, need('LARARLOSEN')), title(html))); console.log(`nytt lösenord: ${f}`); }
  } else { console.error('Användning: las.mjs lock|unlock|rekey …'); process.exit(1); }
}
