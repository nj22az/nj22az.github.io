import test from 'node:test';import assert from 'node:assert/strict';
import {frameAt,FPS,DURATION,BEATS} from '../films/vy-classroom/timeline.mjs';
import {classroomComic} from '../classroom-comic.mjs';
import {recipeFor} from '../../johansson-town/src/avatars/cast.js';
import {normalizeScene} from '../scene-model.mjs';
import {waveMotion} from '../../johansson-town/src/avatars/motion.js';
const project={panelScenes:classroomComic(recipeFor)},motions={run:waveMotion(),protest:waveMotion()};
test('film seeks without mutating its four comic sources; beat boundaries are exact',()=>{
 const original=JSON.stringify(project),first=frameAt(project,11,motions);frameAt(project,19,motions);frameAt(project,1,motions);
 assert.deepEqual(frameAt(project,11,motions),first);assert.equal(JSON.stringify(project),original);
 for(let i=0;i<4;i++)assert.equal(frameAt(project,BEATS[i],motions).beat,i);
 assert.equal(DURATION*FPS,600);
});
test('body clips and prop support survive Studio scene round trips',()=>{
 const {scene}=frameAt(project,10.1,motions),out=normalizeScene(scene);
 assert.deepEqual(out.actors[0].bodyMotion.times,scene.actors[0].bodyMotion.times);for(const [name,values] of Object.entries(out.actors[0].bodyMotion.joints))values.forEach((v,i)=>assert.ok(Math.abs(v-scene.actors[0].bodyMotion.joints[name][i])<1e-12));assert.deepEqual(out.actors[0].propTouch,{prop:'desk',side:'L'});
 assert.equal(out.furniture.desk.supportY,0);assert.throws(()=>normalizeScene({...scene,actors:[{...scene.actors[0],bodyMotion:{}}]}));
});
