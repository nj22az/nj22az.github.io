import {mountGuide} from './guided.mjs?v=20260925-ac2';
const p=new URLSearchParams(location.search);
let mode=['guidad','fri','station'].includes(p.get('lage'))?p.get('lage'):(p.has('flik')||p.has('uppgift')?'fri':location.hash==='#labbprotokoll'?'station':'guidad');
let freeReady=false,guide=null;
async function choose(next){mode=next;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));document.getElementById('guided-workspace').hidden=mode!=='guidad';document.getElementById('free-workspace').hidden=mode==='guidad';document.getElementById('station-workspace').hidden=mode!=='station';document.getElementById('free-intro').hidden=mode!=='fri';document.body.dataset.printMode=mode==='station'?'station':'guide';
 const url=new URL(location.href);url.searchParams.set('lage',mode);history.replaceState(null,'',url);
 if(mode==='guidad'){if(!guide)guide=mountGuide(document.getElementById('guided-workspace'));else guide.refresh();}
 else if(!freeReady){await import('./app.mjs?v=20260925-ac2');freeReady=true;}
}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.mode)));choose(mode);
