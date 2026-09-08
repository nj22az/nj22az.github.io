import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {preloadModels,createLocalCharacters} from '../src/people/models.js';
import {installDOM} from './fixtures.mjs';

test('five local skinned bodies parse, animate and clone independently',async()=>{
 installDOM();const originalFetch=globalThis.fetch;
 globalThis.fetch=async url=>{
  assert.ok(String(url).startsWith('https://nj22az.github.io/johansson-town/assets/characters/residents/'),'Only the local model tree may load');
  const name=new URL(url).pathname.split('/').at(-1);
  return new Response(await readFile(new URL('../assets/characters/residents/'+name,import.meta.url)));
 };
 try{
  assert.deepEqual(await preloadModels(),{ready:5,total:5});
  const models=createLocalCharacters(),scene=new THREE.Scene(),actors=[];
  for(const name of ['Johansson','Aiko','Kenji','Mrs Sato','Hana','Kenta']){
   const entity=new THREE.Group();entity.userData.name=name;scene.add(entity);
   const actor=models.attach(entity,name);assert.ok(actor,name+' needs a skinned model');actors.push(actor);
   let skins=0;actor.model.traverse(o=>{if(o.isSkinnedMesh){skins++;assert.equal(Array.isArray(o.material),false);assert.equal(o.geometry.groups.length,0);assert.ok(o.skeleton.bones.length>20);}});assert.equal(skins,1);
   for(const clip of ['Idle_Neutral','Walk','Run','Wave'])assert.ok(actor.actions.has(clip));
  }
  for(let tick=0;tick<60;tick++){actors[2].entity.position.z-=.02;models.update(1/60);scene.updateMatrixWorld(true);}
  assert.equal(actors[2].current,'Walk');models.gesture(actors[0].entity);models.update(1/60);assert.equal(actors[0].current,'Wave');
  for(const actor of actors){const bounds=new THREE.Box3().setFromObject(actor.model);assert.ok(bounds.max.y-bounds.min.y>1.3);actor.model.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite)));}
  const skin=actor=>{let result;actor.model.traverse(o=>{if(o.isSkinnedMesh)result=o;});return result;};
  assert.notEqual(skin(actors[1]).skeleton,skin(actors[4]).skeleton,'Two women keep independent animation skeletons');
 }finally{globalThis.fetch=originalFetch;}
});
