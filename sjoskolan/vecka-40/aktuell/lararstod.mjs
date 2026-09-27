import {GUIDE_TASKS,guideValues,personligUppgift,elevtal} from '../../vaxelstromslabbet/guided-lessons.mjs?v=20260929b';
import {markHtml as m} from '../../gemensamt/markering.mjs?v=20260928';
// Grundlabbens facit för en viss elev: läraren skriver namnet som det står i protokollet, och värdena räknas ur
// namnet på samma sätt som i labben.
const n=v=>v.toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const box=document.getElementById('guide-answers');
let namn='';try{namn=sessionStorage.getItem('sj-larare-elev')||'';}catch{}
box.insertAdjacentHTML('beforebegin',`<p><label>Elevens namn, som i protokollet <input id="larare-elev" type="text" autocomplete="off" placeholder="Förnamn Efternamn" value="${esc(namn)}" style="min-height:44px;font:inherit;padding:4px 8px;width:18em;max-width:100%"></label> <span id="larare-elev-not"></span></p>`);
const inp=document.getElementById('larare-elev');
function visa(){
 const D=elevtal(inp.value);try{sessionStorage.setItem('sj-larare-elev',inp.value);}catch{}
 document.getElementById('larare-elev-not').textContent=D?`Elevens tal: ${D}. Facit nedan gäller den eleven.`:'Skriv elevens namn för att se elevens värden.';
 if(!D){box.innerHTML='';return;}
 box.innerHTML=GUIDE_TASKS.map(g=>{const t=personligUppgift(g,D),v=guideValues(t);return `<section><h3>${m(t.title)}</h3><p class="muted">${m(t.source)}</p><p>${t.fields.map(([k,l,u])=>`${m(l)}: <strong>${n(v[k])} ${u}</strong>`).join('. ')}</p><p>${m(t.method)}</p><p>Följdfråga: ${m(t.explain)}</p></section>`;}).join('');
}
inp.addEventListener('input',visa);visa();
