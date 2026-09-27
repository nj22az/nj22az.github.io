import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const root=new URL('../../../',import.meta.url).pathname.replace(/\/$/,'');
const window=new Window({url:'https://nj22az.github.io/sjoskolan/vaxelstromslabbet/?lage=guidad'});
for(const key of ['window','document','localStorage','history','location','URL','Blob','ResizeObserver','matchMedia','requestAnimationFrame','cancelAnimationFrame','HTMLElement','Event'])globalThis[key]=typeof window[key]==='function'&&['matchMedia','requestAnimationFrame','cancelAnimationFrame'].includes(key)?window[key].bind(window):window[key];
document.write(fs.readFileSync(root+'/sjoskolan/vaxelstromslabbet/index.html','utf8').replace(/<script[\s\S]*?<\/script>/g,''));
const {mountGuide}=await import(root+'/sjoskolan/vaxelstromslabbet/guided.mjs');
const {GUIDE_TASKS,guideValues,personligUppgift,elevtal}=await import(root+'/sjoskolan/vaxelstromslabbet/guided-lessons.mjs');
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
 const r=JSON.parse(localStorage.getItem('sjoskolan-ac-grund-v3')).rows[task.id];assert.equal(r.first.peak,1);assert.equal(r.attempts,2);assert.ok(r.firstAt&&r.readAt);
 assert.match(document.getElementById('guide-records').textContent,/Första förutsägelse: 1,00 V/);assert.match(document.getElementById('guide-records').textContent,/första förutsägelsen skilde sig/);}
for(const task of TASKS){
 const lesson=document.getElementById('guide-lesson');lesson.value=task.lesson;lesson.dispatchEvent(new window.Event('change'));
 const select=document.getElementById('guide-task');select.value=task.id;select.dispatchEvent(new window.Event('change'));
 const form=document.getElementById('guide-predict');
 if(form){for(const [key]of task.fields)form.elements[key].value=guideValues(task)[key].toFixed(2).replace('.',',');
 form.dispatchEvent(new window.Event('submit',{cancelable:true,bubbles:true}));assert.ok(document.getElementById('guide-explain'),task.id+' measure');
 document.getElementById('guide-explain').click();}else assert.equal(task.id,TASKS[2].id,task.id+' predict');const explain=document.getElementById('guide-explanation');explain.elements.explanation.value='Min egen förklaring med tal och enheter.';explain.dispatchEvent(new window.Event('submit',{cancelable:true,bubbles:true}));assert.match(document.getElementById('guide-saved').textContent,/sparad/);
}
const saved=JSON.parse(localStorage.getItem('sjoskolan-ac-grund-v3'));assert.equal(saved.D,D);assert.equal(Object.keys(saved.rows).length,8);assert.ok(saved.rows.kalibrator.predicted.avg===10);assert.ok(saved.rows.kalibrator.predicted.trms===10);
mountGuide(document.getElementById('guided-workspace'));
assert.ok(document.getElementById('guide-explanation'),'reload resumes the saved explanation phase');
assert.equal(document.getElementById('guide-explanation').elements.explanation.value,'Min egen förklaring med tal och enheter.');
assert.equal(Number(localStorage.getItem('sj-elev-d')),D,'D stays the same after reload');
localStorage.setItem('sj-elevnamn','Anna Svensson');mountGuide(document.getElementById('guided-workspace'));assert.match(document.getElementById('guide-records').textContent,/Anna Svensson/);
console.log('PASS: random D without name, personal values, first prediction kept, all 8 guided tasks, both calibration readings, explanations and persistence.');
await window.happyDOM.close();
