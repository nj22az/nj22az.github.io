import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {showStudentDC} from './dc-student-lab.mjs';
import {newDMMState,operateDMM} from './dmm-actions.mjs';
import {nextHandgrip,DC_EXERCISES} from './dc-student-guide.mjs';
import {circuitStatus} from './dc-learning.mjs';
const require=createRequire(new URL('../../multimetersimulator/package.json',import.meta.url)),{JSDOM}=require('jsdom');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function setup(data={labLog:[]}){
 const dom=new JSDOM('<!doctype html><body></body>',{url:'https://example.test/'});globalThis.document=dom.window.document;
 const errors=[],ctx={state:()=>data,save(){},esc:escape,t:(_en,sv)=>sv,toast:s=>errors.push(s),shell:h=>document.body.innerHTML=h,download(){},benchAdapter:async()=>({update(){},selectProbe(){},setConcealed(){},highlight(){},dispose(){}})};
 const cleanup=await showStudentDC(ctx),$=s=>document.querySelector(s),click=s=>{assert.ok($(s),s);$(s).click();},select=(key,value)=>{const e=$(`[data-setting="${key}"]`);e.value=String(value);e.dispatchEvent(new dom.window.Event('change',{bubbles:true}));};
 return {data,errors,$,click,select,dom,close(){cleanup();dom.window.close();delete globalThis.document;}};
}
test('all six introductions complete using persistent visible actions without inspecting hidden state',async()=>{
 const h=await setup(),{$,click,data}=h;
 for(const [i,e]of DC_EXERCISES.entries()){
  assert.ok($('[data-setting="exercise"]').value==i);
  assert.equal($('[data-action="next-exercise"]'),null,'no premature next button');
  for(let n=0;$('[data-action="guided-step"]');n++){
   assert.ok(n<20,'guide must converge');const b=$('[data-action="guided-step"]');assert.ok(b.textContent.trim());click('[data-action="guided-step"]');assert.ok($('#dc-guidance').textContent.trim(),'guidance persists after every action');
  }
  click('[data-action="go-measure"]');assert.equal(document.activeElement.id,'dc-prediction');
  $('#dc-prediction').value=e.expected+' '+e.unit;$('#dc-reason').value='Jag jämför kretsens tillstånd och de valda mätpunkterna.';
  $('#dc-measure-form').dispatchEvent(new h.dom.window.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(data.labLog.at(-1).practicePassed,true,e.id);assert.ok($('#dc-result').textContent.includes('Kontrollerat'));
  if(i<5)click('[data-action="next-exercise"]');else assert.ok($('#dc-continue').textContent.includes('Övning 6'));
 }
 assert.equal(data.labLog.length,6);assert.deepEqual(h.errors,[]);h.close();
});
test('probe lists work without selecting a separate colour and keep selections/focus',async()=>{
 const h=await setup();h.select('probe-red','loadPlus');h.select('probe-black','loadMinus');
 assert.deepEqual(h.data.dcWorkbench.state.probeTargets,{red:'loadPlus',black:'loadMinus'});
 assert.equal(h.$('[data-setting="probe-red"]').value,'loadPlus');h.select('probe-red','');assert.equal(h.data.dcWorkbench.state.probeTargets.red,null);h.close();
});
test('a tripped instrument recovers one explicit action at a time without losing failed attempts',async()=>{
 let s=newDMMState();for(const [a,args]of [['set_jack',{jack:'a'}],['connect',{probe:'red',terminal:'sourcePlus'}],['connect',{probe:'black',terminal:'sourceMinus'}],['power',{on:true}]])s=operateDMM(s,a,args).state;
 assert.equal(s.protection,true);const h=await setup({labLog:[{station:'dc',prediction:'999 A',reason:'Tidigare försök',display:'FUSE',pointLabel:'Valda mätpunkter',at:new Date().toISOString()}],dcWorkbench:{mode:'intro',exercise:0,state:s}});
 h.click('[data-action="restart-exercise"]');assert.equal(h.data.dcWorkbench.state.protection,true,'restart must not clear a fuse');
 assert.ok(h.$('[data-action="guided-step"]').textContent.includes('Lossa båda'));h.click('[data-action="guided-step"]');assert.ok(h.$('[data-action="guided-step"]').textContent.includes('Återställ'));h.click('[data-action="guided-step"]');assert.equal(h.data.dcWorkbench.state.protection,false);assert.equal(h.data.dcWorkbench.state.meter.fuseA,false);assert.equal(h.data.labLog[0].prediction,'999 A');h.close();
});
test('ordinary switch operation avoids redundant power cycles while rewiring still requires supply off',()=>{
 let s={...newDMMState(),power:true,meter:{...newDMMState().meter,mode:'dc'},probeTargets:{red:'loadPlus',black:'loadMinus'}};
 assert.equal(nextHandgrip(s,DC_EXERCISES[1]).action,'switch');s.closed=false;assert.equal(nextHandgrip(s,DC_EXERCISES[2]).action,'power');assert.equal(nextHandgrip(s,DC_EXERCISES[4]).action,'power');assert.equal(nextHandgrip(s,DC_EXERCISES[5]).action,'power');
});
test('circuit status distinguishes supply off, isolated source and each open path without revealing challenge faults',()=>{
 const s=newDMMState();assert.match(circuitStatus(s),/Matningen är från/);s.isolated=true;assert.match(circuitStatus(s),/frånskild/);s.isolated=false;s.power=true;s.closed=false;assert.match(circuitStatus(s),/brytaren är öppen/);s.closed=true;s.fault='open-return';assert.match(circuitStatus(s),/returen är bruten/);assert.doesNotMatch(circuitStatus(s,true),/bruten|öppen/);s.fault='none';s.seriesOpen=true;assert.match(circuitStatus(s),/mellan Källa/);
});
