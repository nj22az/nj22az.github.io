import test from 'node:test';
import assert from 'node:assert/strict';
import {installDOM} from '../../johansson-town/tests/fixtures.mjs';
import {buildAvatar} from '../../johansson-town/src/avatars/build.js';
import {recipeFor} from '../../johansson-town/src/avatars/cast.js';
import {poseSceneAvatar} from '../scene-avatar.js';
import {normalizeScene} from '../scene-model.mjs';
installDOM();
const sample=(a,time)=>{a.root.position.set(0,0,0);poseSceneAvatar(a,{pose:'Run',time});return [...a.bones.thighL.quaternion.toArray(),...a.bones.thighR.quaternion.toArray(),a.root.position.y];};
test('run changes stride, rewinds deterministically and restores the held root height',()=>{
 const a=buildAvatar(recipeFor('Vy'),{faceSize:64});try{
  const first=sample(a,0),later=sample(a,.18);assert.ok(first.some((n,i)=>Math.abs(n-later[i])>.1));
  const rewind=sample(a,0);first.forEach((n,i)=>assert.ok(Math.abs(n-rewind[i])<1e-10));
  assert.deepEqual(sample(a,0),rewind);
 }finally{a.body.skeleton.dispose();a.dispose();}
});
test('scene snapshots keep the chosen motion time and lettering with bounded imports',()=>{
 const s=normalizeScene({version:2,time:.18,backdrop:'paper',actors:[{id:'vy',recipe:recipeFor('Vy'),pose:'Run',speech:'AH!',speechStyle:'shout'}]});
 assert.equal(s.time,.18);assert.equal(s.actors[0].pose,'Run');assert.equal(s.actors[0].speechStyle,'shout');assert.deepEqual(normalizeScene(s),s);
 assert.equal(normalizeScene({...s,time:Infinity}).time,0);assert.equal(normalizeScene({...s,time:999}).time,60);
});
