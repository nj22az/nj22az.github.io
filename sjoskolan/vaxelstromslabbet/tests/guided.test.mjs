import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const root=new URL('../../../',import.meta.url).pathname.replace(/\/$/,'');
const window=new Window({url:'https://nj22az.github.io/sjoskolan/vaxelstromslabbet/?lage=guidad'});
for(const key of ['window','document','localStorage','history','location','URL','Blob','ResizeObserver','matchMedia','requestAnimationFrame','cancelAnimationFrame','HTMLElement','Event'])globalThis[key]=typeof window[key]==='function'&&['matchMedia','requestAnimationFrame','cancelAnimationFrame'].includes(key)?window[key].bind(window):window[key];
document.write(fs.readFileSync(root+'/sjoskolan/vaxelstromslabbet/index.html','utf8').replace(/<script[\s\S]*?<\/script>/g,''));
const {mountGuide}=await import(root+'/sjoskolan/vaxelstromslabbet/guided.mjs');
const {GUIDE_TASKS,guideValues}=await import(root+'/sjoskolan/vaxelstromslabbet/guided-lessons.mjs');
mountGuide(document.getElementById('guided-workspace'));
for(const task of GUIDE_TASKS){
 const lesson=document.getElementById('guide-lesson');lesson.value=task.lesson;lesson.dispatchEvent(new window.Event('change'));
 const select=document.getElementById('guide-task');select.value=task.id;select.dispatchEvent(new window.Event('change'));
 const form=document.getElementById('guide-predict');assert.ok(form,task.id+' predict');
 for(const [key]of task.fields)form.elements[key].value=guideValues(task)[key].toFixed(2).replace('.',',');
 form.dispatchEvent(new window.Event('submit',{cancelable:true,bubbles:true}));assert.ok(document.getElementById('guide-explain'),task.id+' measure');
 document.getElementById('guide-explain').click();const explain=document.getElementById('guide-explanation');explain.elements.explanation.value='Min egen förklaring med tal och enheter.';explain.dispatchEvent(new window.Event('submit',{cancelable:true,bubbles:true}));assert.match(document.getElementById('guide-saved').textContent,/sparad/);
}
const saved=JSON.parse(localStorage.getItem('sjoskolan-ac-grund-v2'));assert.equal(Object.keys(saved.rows).length,8);assert.ok(saved.rows.kalibrator.predicted.avg===10);assert.ok(saved.rows.kalibrator.predicted.trms===10);
console.log('PASS: all 8 guided tasks, both calibration readings, explanations and persistence.');
await window.happyDOM.close();
