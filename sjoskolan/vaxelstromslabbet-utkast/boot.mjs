import {mountGuide} from './guided.mjs?v=utkast5';
const p=new URLSearchParams(location.search);
let mode=['guidad','fri','station'].includes(p.get('lage'))?p.get('lage'):(p.has('flik')||p.has('uppgift')?'fri':location.hash==='#labbprotokoll'?'station':'guidad');
let freeModule=null,guide=null;
async function choose(next){mode=next;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));document.getElementById('guided-workspace').hidden=mode!=='guidad';document.getElementById('free-workspace').hidden=mode==='guidad';document.getElementById('station-workspace').hidden=mode!=='station';document.getElementById('free-intro').hidden=mode!=='fri';document.body.dataset.printMode=mode==='station'?'station':'guide';
 // Station B: stationens uppgift och protokoll först, sedan bänken och reglagen (DESIGN.md: uppgiften först).
 const st=document.getElementById('station-workspace'),ws=document.querySelector('.ac-workspace'),fw=document.getElementById('free-workspace');if(mode==='station'){if(st.nextElementSibling!==ws)ws.before(st);}else if(fw.nextElementSibling!==st)fw.after(st);
 const url=new URL(location.href);url.searchParams.set('lage',mode);history.replaceState(null,'',url);
 if(mode==='guidad'){if(!guide)guide=mountGuide(document.getElementById('guided-workspace'));else guide.refresh();}
 else {if(!freeModule)freeModule=await import('./app.mjs?v=20260928-ux2');if(mode===next)freeModule.refreshEquipment();else if(mode==='guidad')guide?.refresh();}
}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.mode)));choose(mode);

import('./equipment.js?v=utkast5').then(({mountEquipment})=>mountEquipment(document.getElementById('equipment-bench'))).catch(()=>{document.getElementById('equipment-bench').innerHTML='<p>Instrumentvyn kunde inte laddas. Uppgifterna och deras avläsningar fungerar fortfarande.</p>';});
