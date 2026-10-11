import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyScene,normalizeScene,addCharacter,removeCharacter,restoreCharacter,moveCharacter,panelOrder,LOCATIONS} from '../scene-model.mjs';
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
test('a removed character comes back with Undo, in its place, with everything it had',()=>{
 const s=emptyScene();const [a,b,c]=['A','B','C'].map(n=>addCharacter(s,{name:n},n));b.pose='Heart';b.speech='Hi';b.seat='seat-2';
 const removed=removeCharacter(s,b.id);assert.deepEqual(s.actors.map(x=>x.name),['A','C']);assert.equal(removed.index,1);assert.equal(removeCharacter(s,'nobody'),null);
 assert.equal(restoreCharacter(s,removed),b);assert.deepEqual(s.actors.map(x=>x.name),['A','B','C']);assert.deepEqual([b.pose,b.speech,b.seat],['Heart','Hi','seat-2']);
 assert.equal(restoreCharacter(s,removed),null,'not twice');
 const again=removeCharacter(s,b.id);c.seat='seat-2';restoreCharacter(s,again);assert.equal(b.seat,'','a seat taken meanwhile is not shared');assert.equal(b.pose,'Heart');
 const full=emptyScene();for(let i=0;i<6;i++)addCharacter(full,{});const gone=removeCharacter(full,full.actors[0].id);addCharacter(full,{});assert.equal(restoreCharacter(full,gone),null,'a full scene has no room');
});
