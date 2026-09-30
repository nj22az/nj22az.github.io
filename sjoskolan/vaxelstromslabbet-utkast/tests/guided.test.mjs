import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const root=new URL('../../../',import.meta.url).pathname.replace(/\/$/,'');
const window=new Window({url:'https://nj22az.github.io/sjoskolan/vaxelstromslabbet-utkast/?lage=guidad'});
for(const key of ['window','document','localStorage','history','location','URL','Blob','ResizeObserver','matchMedia','requestAnimationFrame','cancelAnimationFrame','HTMLElement','Event'])globalThis[key]=typeof window[key]==='function'&&['matchMedia','requestAnimationFrame','cancelAnimationFrame'].includes(key)?window[key].bind(window):window[key];
document.write(fs.readFileSync(root+'/sjoskolan/vaxelstromslabbet-utkast/index.html','utf8').replace(/<script[\s\S]*?<\/script>/g,''));
const {mountGuide}=await import(root+'/sjoskolan/vaxelstromslabbet-utkast/guided.mjs');
const {GUIDE_TASKS,guideValues,personligUppgift,elevtal}=await import(root+'/sjoskolan/vaxelstromslabbet-utkast/guided-lessons.mjs');
mountGuide(document.getElementById('guided-workspace'));
// Inget namn behövs: D slumpas en gång på enheten och labben börjar direkt.
assert.ok(document.getElementById('guide-predict'),'starts without name');
const D=Number(localStorage.getItem('sj-elev-d'));assert.ok(Number.isInteger(D)&&D>=1&&D<=31);
assert.match(document.getElementById('guide-protocol').textContent,new RegExp('D = '+D));
const TASKS=GUIDE_TASKS.map(t=>personligUppgift(t,D));
// Första förutsägelsen sparas även när eleven ändrar sin beräkning.
{const task=TASKS[2];const lesson=document.getElementById('guide-lesson');lesson.value=task.lesson;lesson.dispatchEvent(new window.Event('change'));const sel=document.getElementById('guide-task');sel.value=task.id;sel.dispatchEvent(new window.Event('change'));
 let f=document.getElementById('guide-predict');f.elements.peak.value='1';f.dispatchEvent(new window.Event('submit',{cancelable:true,bubbles:true}));
 document.getElementById('guide-revise').click();f=document.getElementById('guide-predict');f.elements.peak.value=guideValues(task).peak.toFixed(2).replace('.',',');f.dispatchEvent(new window.Event('submit',{cancelable:true,bubbles:true}));
 const r=JSON.parse(localStorage.getItem('sjoskolan-ac-grund-utkast')).rows[task.id];assert.equal(r.first.peak,1);assert.equal(r.attempts,2);assert.ok(r.firstAt&&r.readAt);
 assert.match(document.getElementById('guide-records').textContent,/Första förutsägelse: 1,00 V/);assert.match(document.getElementById('guide-records').textContent,/första förutsägelsen skilde sig/);}
for(const task of TASKS){
 const lesson=document.getElementById('guide-lesson');lesson.value=task.lesson;lesson.dispatchEvent(new window.Event('change'));
 const select=document.getElementById('guide-task');select.value=task.id;select.dispatchEvent(new window.Event('change'));
 const form=document.getElementById('guide-predict');
 if(form){for(const [key]of task.fields)form.elements[key].value=guideValues(task)[key].toFixed(2).replace('.',',');
 form.dispatchEvent(new window.Event('submit',{cancelable:true,bubbles:true}));assert.ok(document.getElementById('guide-explain'),task.id+' measure');
 document.getElementById('guide-explain').click();}else assert.equal(task.id,TASKS[2].id,task.id+' predict');const explain=document.getElementById('guide-explanation');explain.elements.explanation.value='Min egen förklaring med tal och enheter.';explain.dispatchEvent(new window.Event('submit',{cancelable:true,bubbles:true}));assert.match(document.getElementById('guide-saved').textContent,/sparad/);
}
const saved=JSON.parse(localStorage.getItem('sjoskolan-ac-grund-utkast'));assert.equal(saved.D,D);assert.equal(Object.keys(saved.rows).length,8);assert.ok(saved.rows.kalibrator.predicted.avg===10);assert.ok(saved.rows.kalibrator.predicted.trms===10);
mountGuide(document.getElementById('guided-workspace'));
assert.ok(document.getElementById('guide-explanation'),'reload resumes the saved explanation phase');
assert.equal(document.getElementById('guide-explanation').elements.explanation.value,'Min egen förklaring med tal och enheter.');
assert.equal(Number(localStorage.getItem('sj-elev-d')),D,'D stays the same after reload');
localStorage.setItem('sj-elevnamn','Anna Svensson');mountGuide(document.getElementById('guided-workspace'));assert.match(document.getElementById('guide-records').textContent,/Anna Svensson/);
// Tydligare flöde: stegrubrik, avläsning bredvid egen siffra, fältfel utan webbläsarbubbla, en huvudåtgärd per läge.
{const KEY='sjoskolan-ac-grund-utkast',n=v=>v.toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2});
 const submit=f=>f.dispatchEvent(new window.Event('submit',{cancelable:true,bubbles:true}));
 const pick=id=>{const t=TASKS.find(x=>x.id===id);const l=document.getElementById('guide-lesson');l.value=t.lesson;l.dispatchEvent(new window.Event('change'));const s=document.getElementById('guide-task');s.value=id;s.dispatchEvent(new window.Event('change'));return t;};
 localStorage.removeItem(KEY);const u=new URL(location.href);u.searchParams.set('steg','kalibrator');history.replaceState(null,'',u);
 mountGuide(document.getElementById('guided-workspace'));
 assert.match(document.getElementById('guide-steg').textContent,/Steg 1 av 3/);
 const task=TASKS.find(t=>t.id==='kalibrator');let f=document.getElementById('guide-predict');
 assert.equal(f.getAttribute('novalidate'),'');
 for(const [k]of task.fields){const pair=f.elements[k].closest('.guide-pair');assert.ok(pair,k+' pair');assert.match(pair.querySelector('.guide-reading').textContent,/\?/);assert.ok(!f.elements[k].required);}
 submit(f);assert.match(document.getElementById('guide-error').textContent,/Skriv din förutsägelse/);assert.equal(JSON.parse(localStorage.getItem(KEY)||'{"rows":{}}').rows.kalibrator,undefined,'no row on empty submit');assert.equal(f.elements.trms.getAttribute('aria-invalid'),'true');
 f.elements.trms.value='10';f.elements.avg.value='x';submit(f);assert.match(document.getElementById('guide-error').textContent,/^Sinuskalibrerad mätare: Skriv ett positivt tal/);assert.equal(f.elements.avg.getAttribute('aria-invalid'),'true');
 for(const [k]of task.fields)f.elements[k].value=n(guideValues(task)[k]);submit(f);
 assert.match(document.getElementById('guide-steg').textContent,/Steg 2 av 3/);
 const lcd=[...document.querySelectorAll('.guide-measurements .guide-lcd')].map(e=>e.textContent);task.fields.forEach(([k],i)=>assert.ok(lcd[i].startsWith(n(guideValues(task)[k])),k+' reading'));
 assert.match(document.querySelector('.guide-progress').textContent,/klart/);
 document.getElementById('guide-explain').click();const e=document.getElementById('guide-explanation');e.elements.explanation.value='Båda visar RMS för sinus.';submit(e);
 const next=document.getElementById('guide-next');assert.ok(next.classList.contains('primary'));assert.equal(next.hidden,false);assert.match(next.textContent,/^Nästa (uppgift|del)|Visa hela/);
 assert.ok(!document.getElementById('guide-save').classList.contains('primary'));assert.equal(document.getElementById('guide-save').hidden,true,'Spara ändringen visas först när texten ändras');
 // Dubbeltryck: ett fingertryck direkt efter stegbytet ignoreras (tangentbordet, detail 0, påverkas inte).
 {const nx=document.getElementById('guide-next'),before=document.getElementById('guide-steg').textContent;nx.dispatchEvent(new window.MouseEvent('click',{bubbles:true,cancelable:true,detail:1}));assert.equal(document.getElementById('guide-steg').textContent,before,'double tap ignored');}
assert.match(document.getElementById('guide-save').textContent,/Spara ändringen/);
 assert.match(document.getElementById('guide-task').selectedOptions[0].textContent,/· Förklarad$/);
 // Sista uppgiften i del 1 leder till del 2.
 const topp=pick('grund-topp');f=document.getElementById('guide-predict');f.elements.peak.value=n(guideValues(topp).peak);submit(f);document.getElementById('guide-explain').click();const e2=document.getElementById('guide-explanation');e2.elements.explanation.value='Toppen är roten ur två gånger RMS.';submit(e2);
 assert.match(document.getElementById('guide-next').textContent,/^Nästa del: 3\./);
 // Ett utkast med bara blanksteg räknas inte som förklarat.
 const per=pick('grund-period');f=document.getElementById('guide-predict');f.elements.T.value=n(guideValues(per).T);submit(f);document.getElementById('guide-explain').click();
 const box=document.getElementById('guide-explanation').elements.explanation;box.value='   ';box.dispatchEvent(new window.Event('input',{bubbles:true}));pick('grund-period');
 assert.doesNotMatch(document.getElementById('guide-task').selectedOptions[0].textContent,/Förklarad/);assert.match(document.getElementById('guide-task').selectedOptions[0].textContent,/· Avläst$/);
 assert.match(document.querySelector('#guide-protocol summary').textContent,/2 av 8/);
}
console.log('PASS: random D without name, personal values, first prediction kept, all 8 guided tasks, both calibration readings, explanations and persistence.');
await window.happyDOM.close();
