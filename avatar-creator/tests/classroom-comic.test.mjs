import test from 'node:test';
import assert from 'node:assert/strict';
import {classroomComic} from '../classroom-comic.mjs';
import {normalizeScene,removeCharacter,restoreCharacter} from '../scene-model.mjs';
import {recipeFor} from '../../johansson-town/src/avatars/cast.js';
test('all four story beats round-trip as editable scenes, including flipped props and partner identity',()=>{
 const scenes=classroomComic(recipeFor).map(s=>normalizeScene(s));assert.equal(scenes.length,4);
 for(const scene of scenes){assert.deepEqual(normalizeScene(JSON.parse(JSON.stringify(scene))),scene);assert.equal(scene.location,'classroom');assert.ok(scene.camera.position);}
 assert.equal(scenes[0].actors[0].seat,'classroom-desk');assert.equal(scenes[2].effect,'dash');assert.ok(Math.abs(scenes[2].furniture.desk.rotation[2])>Math.PI/2);assert.equal(scenes[2].actors[0].pose,'SchoolRun');
 assert.equal(scenes[3].actors[0].liftedBy,scenes[3].actors[1].id);assert.equal(scenes[3].actors[0].expression,'embarrassed');assert.equal(scenes[3].actors[1].name,'Mrs Kubo');assert.ok(scenes[3].actors[1].size>scenes[3].actors[0].size);assert.ok(scenes[3].actors[1].recipe.body.build>scenes[3].actors[0].recipe.body.build);
});
test('missing, duplicate and cyclic carrying links cannot survive an import',()=>{
 const source=classroomComic(recipeFor)[3];source.actors[1].liftedBy='vy';let s=normalizeScene(source);assert.ok(!s.actors[0].liftedBy||!s.actors[1].liftedBy);
 source.actors[1].liftedBy='';source.actors[0].liftedBy='absent';s=normalizeScene(source);assert.equal(s.actors[0].liftedBy,'');
 source.actors[0].liftedBy='teacher';source.actors.push({...source.actors[0],id:'other'});s=normalizeScene(source);assert.equal(s.actors.filter(a=>a.liftedBy).length,1);
});
test('camera, height and furniture imports reject invalid vectors and stay bounded',()=>{
 const s=classroomComic(recipeFor)[2];s.actors[0].y=200;s.camera.position=[NaN,2,3];s.furniture.desk.position=[100,0,0];s.furniture.chair.rotation=[Infinity,0,0];const n=normalizeScene(s);assert.equal(n.actors[0].y,1.5);assert.equal(n.camera.position,undefined);assert.equal(n.furniture.desk.position[0],4);assert.equal(n.furniture.chair.rotation,undefined);
});
