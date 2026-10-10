import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyScene,normalizeScene,addCharacter,moveCharacter,panelOrder,LOCATIONS} from '../scene-model.mjs';
test('scene round trip preserves independent recipes, poses, text and placement',()=>{
 const s=emptyScene(),recipe={name:'Thuận',outfit:{top:'sailor'}};const a=addCharacter(s,recipe);recipe.outfit.top='tee';a.pose='Heart';a.speech='Hello';a.turn=35;moveCharacter(a,.7,.8);
 const saved=normalizeScene(JSON.parse(JSON.stringify(s)));assert.equal(saved.actors[0].recipe.outfit.top,'sailor');assert.equal(saved.actors[0].pose,'Heart');assert.equal(saved.actors[0].speech,'Hello');assert.equal(saved.actors[0].turn,35);assert.equal(saved.actors[0].x,.7);
});
test('untrusted projects are bounded and unknown locations never become image URLs',()=>{
 const raw={version:2,location:'https://example.com/track',actors:Array.from({length:10},()=>({recipe:{},size:99,x:-20,z:Infinity,turn:'bad',pose:'unknown',speech:'a'.repeat(999)}))};
 const s=normalizeScene(raw);assert.equal(s.location,'harbour');assert.equal(s.actors.length,6);assert.equal(s.actors[0].size,1.4);assert.equal(s.actors[0].x,-8);assert.equal(s.actors[0].z,0);assert.equal(s.actors[0].pose,'Idle');assert.equal(s.actors[0].speech.length,120);
});
test('actor cap, frame boundaries and panel ordering',()=>{
 const s=emptyScene();for(let i=0;i<6;i++)assert.ok(addCharacter(s,{}));assert.equal(addCharacter(s,{}),null);moveCharacter(s.actors[0],-20,20);assert.equal(s.actors[0].x,-8);assert.equal(s.actors[0].z,8);
 const panels=['first','second','third'];panelOrder(panels,2,-1);assert.deepEqual(panels,['first','third','second']);panelOrder(panels,0,-1);assert.deepEqual(panels,['first','third','second']);assert.equal(new Set(LOCATIONS.map(x=>x[0])).size,LOCATIONS.length);
});
