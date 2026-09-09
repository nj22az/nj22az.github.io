import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {preloadModels,createLocalCharacters} from '../src/people/models.js';
import {installDOM} from './fixtures.mjs';
import {PROFILES} from '../src/people/profiles.js';
import {vroidLook} from '../src/people/vroid.js';

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
  assert.deepEqual(await preloadModels(),{ready:8,total:8});
  const models=createLocalCharacters(),scene=new THREE.Scene(),actors=[];
  const player=new THREE.Group();player.userData.name='Johansson';scene.add(player);assert.equal(models.attach(player,'Johansson'),null);assert.equal(player.children.length,0);
  for(const name of [...PROFILES.map(p=>p.name),'Yui','Yuri']){
   const entity=new THREE.Group();entity.userData.name=name;scene.add(entity);
   const actor=models.attach(entity,name,name==='Yuri'?1.88:undefined);assert.ok(actor,name+' needs a skinned model');actors.push(actor);
   let skins=0;actor.model.traverse(o=>{if(o.isSkinnedMesh){skins++;assert.equal(Array.isArray(o.material),false);assert.equal(o.geometry.groups.length,0);assert.ok(o.skeleton.bones.length>=11);}});if(name==='Yuri'){assert.equal(skins,1);assert.equal(actor.actions.size,4);assert.ok(Math.abs(new THREE.Box3().setFromObject(actor.model).getSize(new THREE.Vector3()).y-1.88)<.001);assert.match(entity.userData.visualSource,/Meshy/);for(const clip of ['Idle_Neutral','Walk','Run','Wave'])assert.ok(actor.actions.has(clip));continue;}if(name==='Yui')assert.ok(skins>=6);else {assert.ok(skins>=4&&skins<=5);assert.match(entity.userData.visualSource,/VRoid/);assert.ok(actor.faces.length);assert.ok(actor.neighbour);assert.ok(actor.cup);for(const clip of ['Sit','Eat','Drink'])assert.ok(actor.actions.has(clip));}
   for(const clip of ['Idle_Neutral','Walk','Run','Wave'])assert.ok(actor.actions.has(clip));
   if(actor.neighbour){
    scene.updateMatrixWorld(true);const p=PROFILES.find(p=>p.name===name),b=new THREE.Box3().setFromObject(actor.model,true);assert.ok(Math.abs(b.max.y-p.height)<.035,name+' retains their height');assert.ok(Math.abs(b.min.y)<.005);
    actor.model.traverse(mesh=>{
     if(!mesh.isSkinnedMesh)return;
     const material=mesh.material,lit=['Aiko','Kenji'].includes(name);
     assert.equal(!!material.isMeshLambertMaterial,lit,'Only the trial residents receive scene lighting');
     assert.equal(material.toneMapped,lit);
     assert.ok(material.map,'Illustrated atlas survives lighting conversion');
     assert.equal(material.alphaTest,.18,'Hair and eyelash cutouts survive');
     assert.equal(material.transparent,false);
    });
   }
  }
  for(let tick=0;tick<60;tick++){actors[1].entity.position.z-=.02;models.update(1/60);scene.updateMatrixWorld(true);}
  assert.equal(actors[1].current,'Walk');models.gesture(actors[0].entity);models.update(1/60);assert.equal(actors[0].current,'Wave');
  for(const actor of actors){const bounds=new THREE.Box3().setFromObject(actor.model);assert.ok(bounds.max.y-bounds.min.y>1.3);actor.model.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite)));}
  // Exercise the actual exported vertex skinning at several times in every new clip.
  const point=new THREE.Vector3();
  for(const kenji of [actors[0],actors[1],actors.find(a=>a.entity.userData.name==='Yui'),actors.find(a=>a.isYuri)])for(const action of kenji.actions.values()){
   kenji.mixer.stopAllAction();action.reset().play();
   for(const fraction of [0,.25,.5,.75,1]){
    kenji.mixer.setTime(action.getClip().duration*fraction);scene.updateMatrixWorld(true);
    kenji.model.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;mesh.skeleton.update();
     for(let vertex=0;vertex<mesh.geometry.attributes.position.count;vertex+=17){mesh.getVertexPosition(vertex,point);assert.ok(point.toArray().every(Number.isFinite),'Finite deformed vertices');assert.ok(point.length()<4,'No exploded limbs');}
    });
   }
  }
  const yuri=actors.find(a=>a.isYuri);
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
  const bobA=actors.find(a=>a.entity.userData.name==='Mrs Sato'),bobB=actors.find(a=>a.entity.userData.name==='Hana');
  assert.notEqual(skin(bobA).skeleton,skin(bobB).skeleton,'Shared bases keep independent animation skeletons');
  assert.equal(skin(bobA).geometry,skin(bobB).geometry,'Instances reuse downloaded geometry');
  assert.notEqual(skin(bobA).material,skin(bobB).material,'Individual colours never tint another resident');
  assert.notEqual(skin(bobA).material.color.getHex(),skin(bobB).material.color.getHex(),'Grey and chestnut hair stay distinct');
  assert.equal(new Set(PROFILES.map(p=>vroidLook(p).base)).size,5);
  for(const actor of actors.filter(a=>a.neighbour)){
   actor.entity.userData.socialPose='Drink';models.update(.4);scene.updateMatrixWorld(true);
   assert.equal(actor.current,'Drink');assert.equal(actor.cup.visible,true);
   assert.ok(actor.cup.getWorldQuaternion(new THREE.Quaternion()).angleTo(new THREE.Quaternion())<.001,'Cup stays upright');
   actor.entity.userData.socialPose=undefined;actor.gestureTime=0;models.update(.4);assert.equal(actor.cup.visible,false);
   const period=3.7+(actor.look.index%5)*.41;actor.expressionTime=period-.01;models.update(.10);
   assert.ok(actor.faces[0].morphTargetInfluences[0]>.95,'A full blink uses the VRoid eyelid morph');
   models.update(.2);assert.equal(actor.faces[0].morphTargetInfluences[0],0);
   const profile=PROFILES.find(p=>p.name===actor.entity.userData.name);
   assert.equal(!!actor.model.getObjectByName('Town spectacles'),vroidLook(profile).glasses);
   const frames=actor.model.getObjectByName('Town spectacles');if(frames){frames.geometry.computeBoundingBox();assert.ok(frames.geometry.boundingBox.getSize(new THREE.Vector3()).x>.09,'Glasses fit the visible eyes, not the internal rotation pivots');}
  }
 }finally{globalThis.fetch=originalFetch;globalThis.createImageBitmap=originalBitmap;globalThis.self=originalSelf;}
});
