import test from 'node:test';
import assert from 'node:assert/strict';
import {installDOM} from '../../johansson-town/tests/fixtures.mjs';
import {buildAvatar} from '../../johansson-town/src/avatars/build.js';
import {recipeFor} from '../../johansson-town/src/avatars/cast.js';
import {poseSceneAvatar} from '../scene-avatar.js';
import {createSoleFinder} from '../../johansson-town/src/avatars/foot-ground.js';
import {createSceneFacePainter} from '../scene-face.js';
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

test('school run plants one sole and holds the same frame without accumulating lean',()=>{
 const a=buildAvatar(recipeFor('Vy'),{faceSize:64});try{
  const pose=()=>{a.root.position.set(0,0,0);poseSceneAvatar(a,{pose:'SchoolRun',time:.3,turn:120});return [...a.bones.chest.quaternion.toArray(),a.root.position.y];};
  const first=pose(),soles=createSoleFinder(a)(),heights=[soles.L.y,soles.R.y].map(y=>y+a.root.position.y);
  assert.ok(Math.abs(Math.min(...heights))<1e-8);assert.ok(Math.max(...heights)>.04);for(let i=0;i<5;i++)pose().forEach((n,j)=>assert.ok(Math.abs(n-first[j])<1e-10));
 }finally{a.body.skeleton.dispose();a.dispose();}
});

test('comic face acting preserves the recipe and repaints when a take leaves the comic pose',()=>{
 const recipe=recipeFor('Vy'),before=JSON.stringify(recipe),a=buildAvatar(recipe,{faceSize:64});let pose='SchoolProtest';
 try{const paint=createSceneFacePainter(a,recipe,()=>pose);assert.equal(paint({expression:'raging'}),true);pose='Idle';assert.equal(paint({expression:'raging'}),true);assert.equal(JSON.stringify(recipe),before);}finally{a.body.skeleton.dispose();a.dispose();}
});

test('a take leaving the slump restores ordinary head proportions',()=>{
 const a=buildAvatar(recipeFor('Vy'),{faceSize:64});try{poseSceneAvatar(a,{pose:'SchoolRest'});assert.ok(a.bones.head.scale.y<1);poseSceneAvatar(a,{pose:'Run'});assert.deepEqual(a.bones.head.scale.toArray(),[1,1,1]);}finally{a.body.skeleton.dispose();a.dispose();}
});
