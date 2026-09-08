import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {preloadModels,createLocalCharacters} from '../src/people/models.js';
import {installDOM} from './fixtures.mjs';

test('resident cast and Yuri load with bounded animation while the FPV player has no mesh',async()=>{
 installDOM();const originalFetch=globalThis.fetch,originalBitmap=globalThis.createImageBitmap,originalSelf=globalThis.self;
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 globalThis.fetch=async url=>{
  if(String(url).startsWith('blob:'))return originalFetch(url);
  assert.ok(String(url).startsWith('https://nj22az.github.io/johansson-town/assets/characters/'),'Only the local model tree may load');
  const name=new URL(url).pathname.split('/characters/')[1];
  return new Response(await readFile(new URL('../assets/characters/'+name,import.meta.url)));
 };
 try{
  assert.deepEqual(await preloadModels(),{ready:24,total:24});
  const models=createLocalCharacters(),scene=new THREE.Scene(),actors=[];
  const player=new THREE.Group();player.userData.name='Johansson';scene.add(player);assert.equal(models.attach(player,'Johansson'),null);assert.equal(player.children.length,0);
  for(const name of ['Aiko','Kenji','Mrs Sato','Hana','Kenta','Yui','Yuri']){
   const entity=new THREE.Group();entity.userData.name=name;scene.add(entity);
   const actor=models.attach(entity,name,name==='Yuri'?1.88:undefined);assert.ok(actor,name+' needs a skinned model');actors.push(actor);
   let skins=0;actor.model.traverse(o=>{if(o.isSkinnedMesh){skins++;assert.equal(Array.isArray(o.material),false);assert.equal(o.geometry.groups.length,0);assert.ok(o.skeleton.bones.length>=11);}});if(name==='Yuri'){assert.equal(skins,1);assert.equal(actor.actions.size,4);assert.ok(Math.abs(new THREE.Box3().setFromObject(actor.model).getSize(new THREE.Vector3()).y-1.88)<.001);assert.match(entity.userData.visualSource,/Meshy/);for(const clip of ['Idle_Neutral','Walk','Run','Wave'])assert.ok(actor.actions.has(clip));continue;}if(name==='Yui')assert.ok(skins>=6);else assert.equal(skins,1);
   for(const clip of ['Idle_Neutral','Walk','Run','Wave'])assert.ok(actor.actions.has(clip));
  }
  for(let tick=0;tick<60;tick++){actors[1].entity.position.z-=.02;models.update(1/60);scene.updateMatrixWorld(true);}
  assert.equal(actors[1].current,'Walk');models.gesture(actors[0].entity);models.update(1/60);assert.equal(actors[0].current,'Wave');
  for(const actor of actors){const bounds=new THREE.Box3().setFromObject(actor.model);assert.ok(bounds.max.y-bounds.min.y>1.3);actor.model.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite)));}
  // Exercise the actual exported vertex skinning at several times in every new clip.
  const point=new THREE.Vector3();
  for(const kenji of [actors[0],actors[1],actors[5],actors[6]])for(const action of kenji.actions.values()){
   kenji.mixer.stopAllAction();action.reset().play();
   for(const fraction of [0,.25,.5,.75,1]){
    kenji.mixer.setTime(action.getClip().duration*fraction);scene.updateMatrixWorld(true);
    kenji.model.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;mesh.skeleton.update();if(kenji===actors[1])assert.ok(mesh.material.vertexColors,'Keep authored Blender palette');
     for(let vertex=0;vertex<mesh.geometry.attributes.position.count;vertex+=17){mesh.getVertexPosition(vertex,point);assert.ok(point.toArray().every(Number.isFinite),'Finite deformed vertices');assert.ok(point.length()<4,'No exploded limbs');}
    });
   }
  }
  const yuri=actors[6];
  yuri.mixer.stopAllAction();yuri.current=null;yuri.speed=0;models.update(1/60);scene.updateMatrixWorld(true);
  assert.equal(yuri.current,'Idle_Neutral');
  assert.ok(new THREE.Box3().setFromObject(yuri.model,true).getSize(new THREE.Vector3()).x<1,'Idle arms must be lowered, not a T-pose');
  models.gesture(yuri.entity);models.update(1/60);assert.equal(yuri.current,'Wave');
  assert.equal(yuri.actions.get('Wave').loop,THREE.LoopOnce);
  const greetingRemaining=yuri.gestureTime;models.gesture(yuri.entity);assert.equal(yuri.gestureTime,greetingRemaining,'Repeated interaction must not extend or restart the greeting');
  for(let i=0;i<100;i++)models.update(1/60);assert.equal(yuri.current,'Idle_Neutral');
  for(const name of ['Walk','Run']){
   const track=yuri.actions.get(name).getClip().tracks.find(t=>t.name==='Hips.position');
   for(let i=0;i<track.values.length;i+=3){assert.equal(track.values[i],track.values[0]);assert.equal(track.values[i+2],track.values[2]);}
  }
  const skin=actor=>{let result;actor.model.traverse(o=>{if(o.isSkinnedMesh)result=o;});return result;};
  assert.notEqual(skin(actors[0]).skeleton,skin(actors[3]).skeleton,'Two women keep independent animation skeletons');
 }finally{globalThis.fetch=originalFetch;globalThis.createImageBitmap=originalBitmap;globalThis.self=originalSelf;}
});
