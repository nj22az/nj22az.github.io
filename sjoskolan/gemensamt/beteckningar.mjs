// Förkortningar och beteckningar: hittar dem i en text och ritar en kort ordlista.
// Uppgifterna kommer ur innehållsdatabasen (innehall/beteckningar.json) via beteckningar.gen.mjs.
// Samma regler som innehall/export/rendera.py (beteckningar_i), så att sidor och genomgång visar samma sak.
import { BETECKNINGAR } from './beteckningar.gen.mjs?v=20260928';
import { markHtml, markText } from './markering.mjs?v=20260928';

const GRANS = '(?<![\\p{L}\\p{N}_{}])', SLUT = '(?![\\p{L}\\p{N}_{}])';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Beteckningarna som förekommer i texterna, i den ordning de först dyker upp. formler: samband där ensamma bokstäver räknas. */
export function hitta(texter, formler = []) {
  const lop = texter.filter(Boolean).map(markText).join(' \n ');
  const form = formler.filter(Boolean).map(markText).join(' \n ');
  const ut = [];
  for (const b of BETECKNINGAR) {
    let pos = Infinity;
    for (const f of [...b.former].sort((a, c) => c.length - a.length)) {
      const rx = new RegExp(GRANS + esc(f) + SLUT, 'gu');
      if (b.formel) {
        for (const m of form.matchAll(rx)) pos = Math.min(pos, m.index);
        for (const m of lop.matchAll(new RegExp(GRANS + esc(f) + '(?=\\s*[=·/²]|\\)|\\s*\\()', 'gu'))) pos = Math.min(pos, m.index + lop.length);
      } else {
        for (const m of lop.matchAll(rx)) pos = Math.min(pos, m.index);
        for (const m of form.matchAll(rx)) pos = Math.min(pos, m.index + lop.length);
      }
    }
    for (const f of b.efter_tal || []) {  // bara direkt efter ett tal: 1 150 var, 0,94 rad, 0,1 H
      const rx = new RegExp('(?<=\\d)\\s?' + esc(f) + SLUT, 'gu');
      for (const m of lop.matchAll(rx)) pos = Math.min(pos, m.index);
      for (const m of form.matchAll(rx)) pos = Math.min(pos, m.index + lop.length);
    }
    if (pos < Infinity) ut.push([pos, b]);
  }
  return ut.sort((a, c) => a[0] - c[0]).map((x) => x[1]);
}

export function ordlista(lista, rubrik = 'Beteckningar', oppen = false) {
  if (!lista.length) return '';
  const rad = (b) => `<div class="bet-rad"><dt>${markHtml(b.visa)}</dt><dd><strong>${markHtml(b.namn)}</strong>${b.utlasning ? ` <span class="bet-utl">(${markHtml(b.utlasning)})</span>` : ''}. ${markHtml(b.forklaring)}${b.enhet ? ` <span class="bet-enhet">Enhet: ${markHtml(b.enhet)}.</span>` : ''}${b.exempel ? ` ${markHtml(b.exempel)}` : ''}${b.obs ? ` <strong>Obs:</strong> ${markHtml(b.obs)}` : ''}</dd></div>`;
  return `<details class="beteckningar"${oppen ? ' open' : ''}><summary>${markHtml(rubrik)} (${lista.length})</summary><dl class="bet-lista">${lista.map(rad).join('')}</dl></details>`;
}
