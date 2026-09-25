import test from 'node:test';
import assert from 'node:assert/strict';
import {equipmentState,subscribeEquipment,publishEquipment,setEquipmentControl,adjustEquipment} from '../equipment-state.mjs';
import {DEFAULTS} from '../lessons.mjs';
test('instrumenten döljer avläsningar och blockerar reglage före förutsägelsen',()=>{
 const s=equipmentState({tab:'sinus',values:DEFAULTS.sinus,locked:true,editable:true});
 assert.equal(s.instruments.find(i=>i.id==='trms').rows[0][0],'?');assert.equal(s.instruments.find(i=>i.id==='scope').rows[0][0],'?');assert.equal(s.traces.length,0);assert.equal(s.editable,false);
});
test('fyrkant håller RMS konstant men ändrar den sinuskalibrerade mätaren',()=>{
 const s=equipmentState({tab:'sinus',values:{...DEFAULTS.sinus,shape:'fyrkant',urms:12,f:100}});
 assert.equal(s.instruments.find(i=>i.id==='trms').rows[0][0],'12,00 V');assert.equal(s.instruments.find(i=>i.id==='avg').rows[0][0],'13,33 V');assert.equal(s.instruments.find(i=>i.id==='scope').rows[0][0],'10,00 ms');assert.equal(s.instruments.find(i=>i.id==='scope').rows[1][0],'12,00 V');
});
test('RL-bänken visar strömmen och strömmens eftersläpning',()=>{
 const s=equipmentState({tab:'impedans',values:DEFAULTS.impedans});assert.equal(s.instruments.find(i=>i.id==='trms').rows[0][0],'0,24 A');assert.ok(s.traces[0][1]<0);assert.ok(s.phase>0);assert.match(s.instruments.find(i=>i.id==='load').rows[4][1],/beräknat/);
});
test('halverad effektfaktor ger dubbel ström vid konstant P och U',()=>{
 const before=equipmentState({tab:'effekt',values:{...DEFAULTS.effekt,pf:1}}),after=equipmentState({tab:'effekt',values:{...DEFAULTS.effekt,pf:.5}});
 assert.equal(before.instruments.find(i=>i.id==='power').rows[0][0],'5,00 A');assert.equal(after.instruments.find(i=>i.id==='power').rows[0][0],'10,00 A');assert.equal(after.instruments.find(i=>i.id==='power').rows[1][0],before.instruments.find(i=>i.id==='power').rows[1][0]);
});
test('sen instrumentladdning får aktuell uppgift och inställningar tillåts bara fritt',()=>{
 let changed=0;setEquipmentControl(()=>changed++);publishEquipment({tab:'sinus',values:DEFAULTS.sinus,locked:true});let state;const dispose=subscribeEquipment(s=>state=s);assert.equal(state.locked,true);adjustEquipment('f',100);assert.equal(changed,0);publishEquipment({tab:'sinus',values:DEFAULTS.sinus,editable:true});adjustEquipment('f',100);assert.equal(changed,1);dispose();
});
