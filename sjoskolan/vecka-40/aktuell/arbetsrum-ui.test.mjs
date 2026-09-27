import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Window} from '../../vaxelstromslabbet/node_modules/happy-dom/lib/index.js';
const w=new Window({url:'https://nj22az.github.io/sjoskolan/vecka-40/aktuell/Genomgang.html?del=sinus&uppgift=v40_01-q1'});
for(const k of ['window','document','localStorage','history','location','Event'])globalThis[k]=w[k];
globalThis.addEventListener=w.addEventListener.bind(w);
const observers=[];
globalThis.IntersectionObserver=class{
  targets=[];disconnected=false;
  constructor(callback){this.callback=callback;observers.push(this);}
  observe(target){this.targets.push(target);}
  disconnect(){this.disconnected=true;}
  see(targets=this.targets){this.callback(targets.map(target=>({target,isIntersecting:true})));}
};
document.write(fs.readFileSync(new URL('./Genomgang.html',import.meta.url),'utf8').replace(/<script[\s\S]*?<\/script>/g,''));
await import('./genomgang.mjs');
const $=id=>document.getElementById(id);
const jump=id=>{const a=document.querySelector(`[data-step="${id}"]`);assert.ok(a,id);a.click();};
const fill=(values,text)=>{values.forEach((v,i)=>{$(`answer-${i}`).value=v;$(`answer-${i}`).dispatchEvent(new w.Event('input',{bubbles:true}));});if(text!==undefined){$('reasoning').value=text;$('reasoning').dispatchEvent(new w.Event('input',{bubbles:true}));}};
const submit=()=>$('answer-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));

test('workspace: attempts, staged solutions, draft persistence and navigation',()=>{
  assert.match($('exercise-purpose').textContent,/förutsäga hur lång en period/);
  assert.match($('current-action').textContent,/Skriv resultatet i varje fält/);
  assert.ok($('show-solution').disabled);submit();assert.match($('feedback').textContent,/Fyll i/);
  fill(['1','1']);submit();assert.ok($('show-solution').disabled);assert.match($('hints').textContent,/Ledtråd/);
  submit();assert.ok($('show-solution').disabled);assert.match($('feedback').textContent,/redan sparat/);
  fill(['2','2']);submit();assert.equal($('show-solution').disabled,false);
  $('show-solution').click();assert.equal($('solution').hidden,false);assert.match($('exercise-status').textContent,/Lösning genomgången/);
  jump('EL-000063');fill(['17']);submit();assert.equal($('exercise-status').textContent,'Rätt svar');
  assert.match($('next-instruction').textContent,/beskriva hur du räknade/);
  assert.match($('session-boundary').textContent,/hemma med övning 4–10/);
  assert.match($('next').textContent,/Hemma: övning 4/);
  fill(['999']);assert.notEqual($('exercise-status').textContent,'Rätt svar');assert.equal($('feedback').textContent,'');assert.ok($('show-solution').disabled);
  jump('EL-000064');assert.equal($('solution').hidden,true);assert.ok($('show-solution').disabled);
  jump('EL-000063');assert.equal($('answer-0').value,'999');assert.notEqual($('exercise-status').textContent,'Rätt svar');
});
test('reading requires all content blocks; navigation alone does not tick a section',()=>{
  jump('period');const observer=observers.at(-1);
  assert.match($('current-action').textContent,/sekunder eller millisekunder/);
  assert.match($('next').textContent,/Prova själv/);
  assert.notEqual($('read-status').textContent,'✓ Genomgånget');
  observer.see(observer.targets.slice(-1));assert.notEqual($('read-status').textContent,'✓ Genomgånget');
  observer.see(observer.targets.slice(0,-1));assert.equal($('read-status').textContent,'✓ Genomgånget');
  jump('rms');assert.notEqual($('read-status').textContent,'✓ Genomgånget');
  jump('period');assert.equal($('read-status').textContent,'✓ Genomgånget');
});
test('worked example reveals calculation steps, retains seen blocks and completes only at the end',()=>{
  jump('exempel');assert.equal(document.querySelectorAll('.study-example li').length,1);
  for(let i=1;i<=6;i++){
    observers.at(-1).see();
    if(i<6){assert.notEqual($('read-status').textContent,'✓ Genomgånget');$('example-next').click();}
  }
  assert.equal($('example-next'),null);assert.equal($('read-status').textContent,'✓ Genomgånget');
});
test('Monday cards and figure are embedded; open text is never marked correct',()=>{
  $('lesson').value='franskiljning';$('lesson').dispatchEvent(new w.Event('change'));
  jump('EL-000630');assert.match(document.querySelector('#slide img').src,/04_tva_matningar/);
  fill([],'Jag behöver ett aktuellt schema för båda matningsvägarna.');submit();assert.match($('exercise-status').textContent,/läraren bedömer/);
  jump('EL-000631');assert.match($('slide').textContent,/Instrumentkort M1/);assert.match($('slide').textContent,/Instrumentkort M2/);
  assert.match($('session-boundary').textContent,/måndagens första pass/);
  $('need-help').click();assert.equal($('exercise-status').textContent,'Behöver hjälp');
});
test('the lesson introduction explains the task and finishing with gaps offers a way back',()=>{
  jump('mal');assert.match($('slide').textContent,/När är jag färdig/);
  assert.match($('lesson-goal').textContent,/säker mätning/);
  jump('EL-000633');$('next').click();
  assert.equal($('finish').hidden,false);assert.equal($('review-lesson').hidden,false);
  assert.match($('review-lesson').href,/avsnitt=mal/);
  assert.match($('finish-goal').textContent,/eget försök/);
});
test.after(async()=>{await w.happyDOM.close();});
