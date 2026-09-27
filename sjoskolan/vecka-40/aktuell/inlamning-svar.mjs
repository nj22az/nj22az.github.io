// Inlämningen vecka 40: visar elevens D (slumpat på enheten) och lägger svarsrutor under uppgift 1–3.
// Svaren sparas i webbläsaren och följer med i QR-koden på sidan Skicka resultat. Inget facit finns här.
import {mittD, sattMittD} from '../../gemensamt/elevtal.mjs?v=20260930';
import {markHtml as m} from '../../gemensamt/markering.mjs?v=20260928';
import {SVAR, lasSvar, sparaSvar, tal} from './resultat.mjs?v=20260930';

const n = (v) => v.toLocaleString('sv-SE', {maximumFractionDigits: 4});
const esc = (s) => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

function visaD() {
  document.getElementById('elevtal').innerHTML = `Ditt tal är <strong>D = ${mittD()}</strong>. Använd det i uppgifterna nedan.`;
}
visaD();
document.getElementById('annatD-ok')?.addEventListener('click', () => {
  const inp = document.getElementById('annatD'), not = document.getElementById('annatD-not');
  if (!sattMittD(inp.value.trim())) { not.textContent = 'D ska vara ett heltal från 1 till 31.'; return; }
  not.textContent = 'Klart. Räkna om uppgifterna med det nya D.';
  visaD();
});

const stil = document.createElement('style');
stil.textContent = '.mina-svar{margin-top:14px;padding:14px 16px;background:var(--sj-soft,#edf4f9);border-radius:8px}.mina-svar h3{margin:0 0 8px;font-size:18px}.mina-svar .rad{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px 16px}.mina-svar label{display:block;font-size:15px;font-weight:700}.mina-svar input{display:block;width:100%;min-height:44px;font:inherit;padding:4px 10px;border:1px solid var(--sj-field,#5d7282);border-radius:8px;margin-top:4px}.mina-svar input[aria-invalid=true]{border-color:#9a330f;border-width:2px}.mina-svar .status{font-size:15px;color:var(--sj-muted,#4d6579);margin:8px 0 0}@media print{.mina-svar input{border:0;border-bottom:1px solid #999;border-radius:0}}';
document.head.append(stil);

const svar = lasSvar();
for (const u of SVAR) {
  const sek = document.getElementById(`uppgift-${u.uppgift}`);
  if (!sek) continue;
  const box = document.createElement('form');
  box.className = 'mina-svar';
  box.setAttribute('onsubmit', 'return false');
  box.innerHTML = `<h3>Mina svar, uppgift ${u.uppgift}</h3><div class="rad">${u.falt.map(([k, l, e]) => `<label>${m(l)} (${e})<input name="${k}" inputmode="decimal" autocomplete="off" value="${Number.isFinite(svar[k]) ? esc(n(svar[k])) : ''}"></label>`).join('')}</div><p class="status" aria-live="polite"></p>`;
  sek.append(box);
  const status = box.querySelector('.status');
  const rakna = () => { const k = u.falt.filter(([f]) => Number.isFinite(svar[f])).length; status.textContent = `${k} av ${u.falt.length} svar sparade. De skickas med QR-koden.`; };
  rakna();
  box.addEventListener('input', (e) => {
    const inp = e.target, v = tal(inp.value);
    if (inp.value.trim() === '') { delete svar[inp.name]; inp.removeAttribute('aria-invalid'); }
    else if (Number.isFinite(v)) { svar[inp.name] = v; inp.removeAttribute('aria-invalid'); }
    else { inp.setAttribute('aria-invalid', 'true'); status.textContent = 'Skriv bara talet, utan enhet. Komma eller punkt går bra.'; return; }
    sparaSvar(svar);
    rakna();
  });
}
