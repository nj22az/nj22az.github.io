import test from 'node:test';
import assert from 'node:assert/strict';
import {createPerformance} from '../../johansson-town/src/avatars/performance.js';
test('expression transitions settle and strength stays bounded',()=>{
 const p=createPerformance();p.configure({strength:2});assert.equal(p.state.strength,1);
 const first=p.update(.1,'happy');assert.ok(first.expressionBlend>0&&first.expressionBlend<1);
 p.update(.1,'happy');assert.equal(p.update(.1,'happy').expressionBlend,1);
 p.configure({strength:-2});assert.equal(p.state.strength,0);
 p.configure({strength:NaN});assert.equal(p.state.strength,0);
});
test('freezing holds the speaking phase; resuming advances it',()=>{
 const p=createPerformance();p.configure({speaking:true});p.update(.03,'shy');
 p.configure({frozen:true});const a=p.update(.1,'shy'),b=p.update(.1,'shy');
 assert.equal(a.talk,b.talk);assert.equal(a.expressionBlend,1);
 p.configure({frozen:false});assert.notEqual(p.update(.03,'shy').talk,b.talk);
});
