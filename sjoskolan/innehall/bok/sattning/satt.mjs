// Sätter bokens PDF (7 × 10 tum) ur EPUB-arbetskopian: bok/.bok/epub -> bok/.bok/bok.pdf.
//
// Sidorna bryts av paged.js i Chromium. Sidnummer i innehållsförteckningen, hänvisningarna mellan uppgift och lösning
// (”→ Lösning 5.3 · s. 41”) och sakregistrets sidor räknas fram i ett första pass med platshållare av samma bredd och
// skrivs in i ett andra pass; passen upprepas tills sidorna står still. Sidhuvud och sidfot läggs in efter brytningen.
// Klartexten och resultatet ligger i bok/.bok/ (i .gitignore) och checkas aldrig in.
//
//   cd sjoskolan/innehall/bok/sattning && npm ci && node satt.mjs [--ut ../.bok/bok.pdf]
import { readFileSync, writeFileSync, existsSync, createReadStream, statSync } from 'node:fs';
import { dirname, join, resolve, relative, extname } from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const HAR = dirname(fileURLToPath(import.meta.url));
const EPUB = resolve(HAR, '../.bok/epub/EPUB');
const args = process.argv.slice(2);
const UT = resolve(args.includes('--ut') ? args[args.indexOf('--ut') + 1] : join(HAR, '../.bok/bok.pdf'));
const BYGG = resolve(HAR, '../.bok/sattning.html');
if (!existsSync(EPUB)) throw new Error('EPUB-arbetskopian saknas: kör BOKLOSEN=… python3 sjoskolan/innehall/bok/bok.py packa-upp');
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }

// paged.js läser stilmallarna med XHR, vilket inte går från file://. Filerna serveras därför lokalt (bara 127.0.0.1).
const ROT = resolve(HAR, '..');
const TYPER = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = createServer((req, res) => {
  const f = resolve(ROT, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(ROT) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPER[extname(f)] || 'application/octet-stream' });
  createReadStream(f).pipe(res);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const BAS = `http://127.0.0.1:${server.address().port}`;
const url = (f) => `${BAS}/${relative(ROT, f).split('\\').join('/')}`;

const BOKTITEL = 'Elteknik och ellära för sjöfart och industri';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const text = (h) => h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// ------------------------------------------------------------ EPUB -> ett HTML-dokument
const opf = readFileSync(join(EPUB, 'content.opf'), 'utf-8');
const manifest = Object.fromEntries([...opf.matchAll(/<item [^>]*id="([^"]+)"[^>]*href="([^"]+)"/g)].map((m) => [m[1], m[2]]));
const spine = [...opf.matchAll(/<itemref idref="([^"]+)"/g)].map((m) => manifest[m[1]]).filter((h) => h.startsWith('text/ch'));

function kropp(fil) {
  const x = readFileSync(join(EPUB, fil), 'utf-8');
  let b = x.slice(x.indexOf('>', x.indexOf('<body')) + 1, x.lastIndexOf('</body>'));
  b = b.replace(/href="ch\d+\.xhtml#/g, 'href="#').replace(/(src|xlink:href)="\.\.\/media\//g, `$1="${url(join(EPUB, 'media'))}/`);
  return b;
}

function dokument(nummer) {
  // nummer: { id -> sidnummer } från förra passet, register: { term -> [sidor] }. Tomt i första passet.
  const sida = (id) => (nummer.sidor?.[id] ?? '000');
  const delar = [], toc = [];
  let losningar = [];
  for (const fil of spine) {
    let b = kropp(fil);
    const sek = b.match(/<section id="([^"]+)" class="([^"]+)"/);
    const [id, klass] = sek ? [sek[1], sek[2]] : ['', ''];
    const h1 = b.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    const rubrik = h1 ? text(h1[1]) : '';
    if (/\blosningar\b/.test(klass)) { losningar.push(b); continue; }
    if (losningar.length) delar.push(losningsdel(losningar)), losningar = [];
    if (/\bkapitel\b/.test(klass)) {
      const nr = text(b.match(/<span class="nr">([\s\S]*?)<\/span>/)[1]), titel = text(b.match(/<span class="titel">([\s\S]*?)<\/span>/)[1]);
      b = b.replace(`<section id="${id}" class="${klass}"`, `<section id="${id}" class="${klass}" data-kapnr="${nr}" data-titel="${esc(titel)}"`);
      toc.push(`<li><span class="nr">${nr}</span><a href="#${id}" data-sida="${sida(id)}">${esc(titel)}</a></li>`);
    } else if (/\bdel\b/.test(klass)) {
      const nr = text(b.match(/<span class="nr">([\s\S]*?)<\/span>/)[1]);
      toc.push(`<li class="del"><span class="nr">${nr}</span><a href="#${id}" data-sida="${sida(id)}">${esc(rubrik.replace(/^\d+\s*/, ''))}</a></li>`);
    } else if (!/titelsida|kolofon/.test(klass)) {
      const extra = /formelkort/.test(klass) ? '' : /register/.test(klass) ? '' : fil.endsWith('ch058.xhtml') ? ' kallor' : '';
      b = b.replace(`<section id="${id}" class="${klass}"`, `<section id="${id}" class="${klass}${extra}" data-rubrik="${esc(rubrik)}"`);
      if (/register/.test(klass)) toc.push(`<li class="utan-nr"><a href="#losningar" data-sida="${sida('losningar')}">Lösningar till övningarna</a></li>`);
      toc.push(`<li class="utan-nr"><a href="#${id}" data-sida="${sida(id)}">${esc(rubrik)}</a></li>`);
    }
    delar.push(b);
  }
  // Lösningarna står före källorna; flytta deras rad i innehållet dit.
  const ti = toc.findIndex((t) => t.includes('#losningar')), ki = toc.findIndex((t) => t.includes('Källor'));
  if (ti > ki && ki >= 0) toc.splice(ki, 0, toc.splice(ti, 1)[0]);
  const innehall = `<nav class="innehall" data-rubrik="Innehåll"><h1>Innehåll</h1><ol>${toc.join('')}</ol></nav>`;
  let html = delar.join('\n');
  // Innehållet efter kolofonen, före ”Så använder du boken”.
  html = html.replace(/(<section id="kolofon"[\s\S]*?<\/section>)/, `$1\n${innehall}`);
  // Sidhänvisningar mellan uppgift och lösning. Platshållaren 000 har samma bredd som ett tresiffrigt sidnummer.
  html = html.replace(/<a href="#([^"]+)" class="(tosol|toq)">([\s\S]*?)<\/a>/g, (_, id, k, t) => `<a href="#${id}" class="${k}">${t}</a><span class="sref"> · s. ${sida(id)}</span>`);
  // Sakregistret: kapitelhänvisningar blir sidor.
  html = html.replace(/<div class="register-lista">([\s\S]*?)<\/div>/, (_, lista) => `<div class="register-lista">${lista.replace(/([^<>]+?)\s*<span class="kapref">([\s\S]*?)<\/span>/g, (m, term, kap) => {
    const t = term.replace(/^\s*(<br \/>)?\s*/, '').trim();
    const kaps = [...kap.matchAll(/>(\d+)</g)].map((x) => x[1]);
    const s = nummer.register?.[t];
    return `${m.slice(0, m.indexOf(term) + term.length)} <span class="sidor" data-term="${esc(t)}" data-kap="${kaps.join(',')}">${s ? s.join(', ') : kaps.map(() => '000').join(', ')}</span>`;
  })}</div>`);
  const omslag = `<div class="omslag"><img src="${url(join(EPUB, 'media/file159.jpg'))}" alt=""></div>`;
  const font = (p) => url(join(HAR, 'node_modules/@fontsource', p));
  return `<!doctype html><html lang="sv"><head><meta charset="utf-8"><title>${BOKTITEL}</title>
<link rel="stylesheet" href="${font('source-sans-3/400.css')}"><link rel="stylesheet" href="${font('source-sans-3/600.css')}"><link rel="stylesheet" href="${font('source-sans-3/700.css')}">
<link rel="stylesheet" href="${font('source-sans-3/400-italic.css')}"><link rel="stylesheet" href="${font('source-serif-4/400.css')}"><link rel="stylesheet" href="${font('source-serif-4/400-italic.css')}">
<link rel="stylesheet" href="${font('source-serif-4/700-italic.css')}"><link rel="stylesheet" href="${font('source-serif-4/700.css')}">
<link rel="stylesheet" href="${url(join(EPUB, 'styles/stylesheet1.css'))}">
<link rel="stylesheet" href="${url(join(HAR, 'print.css'))}">
<script>window.PagedConfig = { auto: true, after: () => { window.__klar = true; } };</script>
<script src="${url(join(HAR, 'node_modules/pagedjs/dist/paged.polyfill.js'))}"></script>
</head><body>${omslag}\n${html}</body></html>`;
}

function losningsdel(sektioner) {
  return `<div class="losningar-alla" id="losningar" data-rubrik="Lösningar"><h1>Lösningar till övningarna</h1><div class="spalter">${sektioner.join('\n')}</div></div>`;
}

// ------------------------------------------------------------ i webbläsaren efter brytningen
function matSidor() {
  const sidor = [...document.querySelectorAll('.pagedjs_page')];
  const nr = (i) => i; // omslaget räknas inte: fysisk sida 2 är sida 1
  const idSida = {}, kapSidor = {};
  sidor.forEach((s, i) => {
    for (const el of s.querySelectorAll('[id]')) if (!(el.id in idSida) && !el.id.startsWith('pagedjs')) idSida[el.id] = nr(i);
    for (const el of s.querySelectorAll('section[data-kapnr]')) (kapSidor[el.dataset.kapnr] ||= []).push(nr(i));
  });
  const sidtext = sidor.map((s) => {
    const c = s.querySelector('.pagedjs_page_content');
    return c && c.querySelector('section[data-kapnr]') ? c.innerText.toLowerCase() : '';
  });
  // Sakregistret: sidor i de angivna kapitlen där termen förekommer (teori, exempel, övningar; inte lösningar och formelkort).
  const register = {};
  for (const el of document.querySelectorAll('.sidor[data-term]')) {
    if (el.dataset.term in register) continue;
    const t = el.dataset.term, kaps = el.dataset.kap.split(',');
    const nyckel = t.toLowerCase().replace(/\s*\(.*?\)\s*/g, ' ').split(',')[0].trim();
    const ord = [nyckel, nyckel.split(/\s+/)[0]].map((k) => k.replace(/(en|et|er|ar|or|na|n|t)$/,'')).filter((k) => k.length >= 3);
    const ut = new Set();
    for (const k of kaps) {
      const ps = [...new Set(kapSidor[k] || [])];
      for (const p of ps) if (ord.some((o) => sidtext[p] && sidtext[p].includes(o))) ut.add(p);
      if (!ps.some((p) => ut.has(p)) && ps.length) ut.add(ps[0]);
    }
    register[t] = [...ut].sort((a, b) => a - b).slice(0, 10);
  }
  return { sidor: idSida, register };
}

function sidhuvuden(boktitel) {
  const sidor = [...document.querySelectorAll('.pagedjs_page')];
  let kap = null, avsnitt = '', rubrik = '';
  sidor.forEach((s, i) => {
    const c = s.querySelector('.pagedjs_page_content'), area = s.querySelector('.pagedjs_area');
    if (!c || !area) return;
    const sek = c.querySelector('section[data-kapnr]');
    const lsek = c.querySelector('section.losningar');
    const front = c.querySelector('[data-rubrik]');
    const tom = s.classList.contains('pagedjs_blank_page') || !c.textContent.trim();
    if (sek) { if (!kap || kap.nr !== sek.dataset.kapnr) avsnitt = ''; kap = { nr: sek.dataset.kapnr, titel: sek.dataset.titel }; rubrik = ''; }
    else if (lsek) { const k = lsek.querySelector('.kapnr'); kap = { nr: k ? k.textContent : '', titel: 'Lösningar' }; avsnitt = 'Lösningar'; rubrik = ''; }
    else if (front) { kap = null; rubrik = front.dataset.rubrik; }
    const borjar = c.querySelector('h1.kapitel');
    const h2 = [...c.querySelectorAll('section.kapitel h2')];
    const visat = borjar ? kap?.titel : (avsnitt || kap?.titel);
    if (h2.length) avsnitt = h2.at(-1).textContent.trim();
    if (tom || c.querySelector('.omslag, section.titelsida, section.kolofon, section.del')) return;
    area.style.position = 'relative';
    const vanster = s.classList.contains('pagedjs_left_page');
    const huvud = document.createElement('div'); huvud.className = 'huvud';
    if (kap) {
      const box = `<span class="kapnr">${kap.nr}</span>`, t = `<span>${vanster ? kap.titel : visat}</span>`;
      huvud.innerHTML = vanster ? box + t : t + box;
    } else huvud.innerHTML = `<span>${rubrik}</span>`;
    const fot = document.createElement('div'); fot.className = 'fot';
    const n = `<span class="sidnr">${i}</span>`, t = `<span class="titel">${boktitel}</span>`;
    fot.innerHTML = vanster ? n + t : t + n;
    area.append(huvud, fot);
  });
}

// ------------------------------------------------------------ passen
const webblasare = await playwright.chromium.launch();
async function pass(nummer) {
  writeFileSync(BYGG, dokument(nummer));
  const sida = await webblasare.newPage();
  const fel = [];
  sida.on('pageerror', (e) => fel.push(e.message));
  await sida.goto(url(BYGG), { waitUntil: 'load', timeout: 0 });
  await sida.waitForFunction(() => window.__klar === true, null, { timeout: 30 * 60000, polling: 1000 });
  if (fel.length) console.log('fel i sidan:', fel.slice(0, 3).join(' | '));
  const antal = await sida.evaluate(() => document.querySelectorAll('.pagedjs_page').length);
  return { sida, antal, matt: await sida.evaluate(matSidor) };
}

let nummer = {}, resultat;
for (let varv = 1; varv <= 4; varv++) {
  resultat = await pass(nummer);
  const lika = JSON.stringify(resultat.matt.sidor) === JSON.stringify(nummer.sidor);
  console.log(`pass ${varv}: ${resultat.antal} sidor${lika ? ', sidorna står still' : ''}`);
  if (lika && JSON.stringify(resultat.matt.register) === JSON.stringify(nummer.register)) break;
  nummer = resultat.matt;
  if (varv < 4) await resultat.sida.close();
}
await resultat.sida.evaluate(sidhuvuden, BOKTITEL);
await resultat.sida.pdf({ path: UT, preferCSSPageSize: true, printBackground: true });
await webblasare.close();
server.close();
console.log(`skrev ${UT}`);
