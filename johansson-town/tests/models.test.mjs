import {RAMEN_GUEST_SEATS} from '../src/world/interiors/ramen-layout.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {preloadModels,createLocalCharacters} from '../src/people/models.js?snappy=1';
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
  assert.deepEqual(await preloadModels(),{ready:10,total:10});
  const models=createLocalCharacters(),scene=new THREE.Scene(),actors=[];
  const player=new THREE.Group();player.userData.name='Johansson';scene.add(player);assert.equal(models.attach(player,'Johansson'),null);assert.equal(player.children.length,0);
  for(const name of [...PROFILES.map(p=>p.name),'Yui','Yuri']){
   const entity=new THREE.Group();entity.userData.name=name;scene.add(entity);
   const actor=models.attach(entity,name,name==='Yuri'?1.88:undefined);assert.ok(actor,name+' needs a skinned model');actors.push(actor);
   let skins=0;actor.model.traverse(o=>{if(o.isSkinnedMesh){skins++;assert.equal(Array.isArray(o.material),false);assert.equal(o.geometry.groups.length,0);assert.ok(o.skeleton.bones.length>=11);}});if(name==='Aya'){assert.ok(actor.isAya);assert.match(entity.userData.visualSource,/Studio likeness/);assert.ok(skins>=1);assert.ok(Math.abs(new THREE.Box3().setFromObject(actor.model).getSize(new THREE.Vector3()).y-1.62)<.05);for(const clip of ['Idle_Neutral','Walk','Run','Wave','Sit'])assert.ok(actor.actions.has(clip));continue;}if(name==='Yuri'){assert.equal(skins,1);assert.equal(actor.actions.size,7);assert.ok(Math.abs(new THREE.Box3().setFromObject(actor.model).getSize(new THREE.Vector3()).y-1.88)<.001);assert.match(entity.userData.visualSource,/Meshy/);for(const clip of ['Idle_Neutral','Walk','Run','Wave','Sit','CarryIdle','CarryWalk'])assert.ok(actor.actions.has(clip));continue;}if(name==='Reiko'){assert.equal(skins,4);assert.ok(actor.isNozomi);assert.match(entity.userData.visualSource,/Nozomi/);for(const clip of ['Idle_Neutral','Walk','Run','Wave','Sit','Eat','Drink'])assert.ok(actor.actions.has(clip));continue;}if(name==='Yui')assert.ok(skins>=6);else {assert.ok(skins>=4&&skins<=5);assert.match(entity.userData.visualSource,/VRoid/);assert.ok(actor.faces.length);assert.ok(actor.neighbour);assert.ok(actor.cup);for(const clip of ['Sit','Eat','Drink'])assert.ok(actor.actions.has(clip));}
   for(const clip of ['Idle_Neutral','Walk','Run','Wave'])assert.ok(actor.actions.has(clip));
   if(actor.neighbour){
    scene.updateMatrixWorld(true);const p=PROFILES.find(p=>p.name===name),b=new THREE.Box3().setFromObject(actor.model,true);assert.ok(Math.abs(b.max.y-p.height)<.035,name+' retains their height');assert.ok(Math.abs(b.min.y)<.005);
    actor.model.traverse(mesh=>{
     if(!mesh.isSkinnedMesh)return;
     const material=mesh.material,lit=['Aya','Kenji'].includes(name);
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
  // A streamed-out walker must not resume stale footsteps or a stale greeting
  // when its parent room becomes visible again, or after an instant relocation.
  const kenji=actors.find(a=>a.entity.userData.name==='Kenji');
  kenji.entity.userData.socialPose=undefined;kenji.gestureTime=0;
  for(let i=0;i<40;i++){kenji.entity.position.z-=.02;models.update(1/60);}
  assert.equal(kenji.current,'Walk');
  const hiddenTown=new THREE.Group();scene.add(hiddenTown);hiddenTown.add(kenji.entity);hiddenTown.visible=false;
  const hiddenTime=kenji.mixer.time;models.update(.1);
  assert.equal(kenji.mixer.time,hiddenTime,'Hidden ancestors suspend body animation');
  hiddenTown.visible=true;models.update(1/60);
  assert.equal(kenji.current,'Idle_Neutral','No stale walking on reappearance');
  assert.equal(kenji.speed,0);
  for(let i=0;i<40;i++){kenji.entity.position.z-=.02;models.update(1/60);}
  kenji.entity.position.z+=20;models.update(1/60);
  assert.equal(kenji.current,'Idle_Neutral','Teleport is not locomotion');
  assert.equal(kenji.actions.get('Walk').isRunning(),false,'Teleport clears the previous action instead of blending a walking pose');
  models.gesture(kenji.entity);models.update(.1);kenji.entity.visible=false;models.update(.1);
  kenji.entity.visible=true;models.update(1/60);assert.equal(kenji.current,'Idle_Neutral','Interrupted greetings do not reappear later');
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
  for(const actor of actors.filter(a=>['Aya','Kenji','Yuri'].includes(a.entity.userData.name))){
   actor.mixer.stopAllAction();actor.current=null;actor.speed=0;actor.moving=false;actor.gestureTime=0;
   actor.entity.userData.socialPose=undefined;models.update(0);
   const standing=models.conversationTarget(actor.entity),base=actor.entity.getWorldPosition(new THREE.Vector3());
   assert.ok(standing.y-base.y>actor.height*.75&&standing.y-base.y<actor.height,actor.entity.userData.name+' conversation height '+(standing.y-base.y)+' / '+actor.height);
   if(actor.neighbour){
    actor.entity.userData.socialPose='Sit';models.update(.4);
    const seated=models.conversationTarget(actor.entity);
    assert.ok(seated.y<standing.y-.2,'Conversation target follows the seated head');
    actor.entity.userData.socialPose=undefined;
   }
  }
  const speaker=actors.find(a=>a.entity.userData.name==='Kenji'),listener=actors.find(a=>a.entity.userData.name==='Tetsuo');
  speaker.entity.userData.chat={speaking:true,time:4,partner:listener.entity,greeting:false};
  listener.entity.userData.chat={speaking:false,time:4,partner:speaker.entity,greeting:false};
  models.update(.1);
  for(const face of speaker.faces)assert.ok(face.morphTargetInfluences[face.morphTargetDictionary.MouthOpen]>.07,'Ambient speaker has bounded mouth motion');
  for(const face of listener.faces)assert.equal(face.morphTargetInfluences[face.morphTargetDictionary.MouthOpen],0,'Listener does not speak over their neighbour');
  delete speaker.entity.userData.chat;delete listener.entity.userData.chat;models.update(.1);
  for(const face of speaker.faces)assert.equal(face.morphTargetInfluences[face.morphTargetDictionary.MouthOpen],0,'Cancellation clears mouth motion');
  // Seat contact is measured on each actual skinned body, not inferred from height.
  for(const actor of actors.filter(a=>a.neighbour)){
   actor.entity.visible=true;actor.entity.parent.visible=true;
   for(const seatHeight of [.71,.565,RAMEN_GUEST_SEATS[0].height])for(const pose of ['Sit','Eat','Drink']){
    actor.entity.userData.seatHeight=seatHeight;actor.entity.userData.socialPose=pose;
    models.update(.4);scene.updateMatrixWorld(true);
    const hip=actor.entity.worldToLocal(actor.model.getObjectByName('J_Bip_C_Hips').getWorldPosition(new THREE.Vector3()));let bottom=Infinity;
    actor.model.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;mesh.skeleton.update();
     for(let i=0;i<mesh.geometry.attributes.position.count;i++){
      mesh.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld);actor.entity.worldToLocal(point);
      if(Math.hypot(point.x,point.z)<.25&&point.y>hip.y-.24&&point.y<hip.y)bottom=Math.min(bottom,point.y);
     }
    });
    assert.ok(Math.abs(bottom-seatHeight)<.012,actor.entity.userData.name+' '+pose+' seat contact '+bottom+' / '+seatHeight);
   }
   delete actor.entity.userData.seatHeight;delete actor.entity.userData.socialPose;models.update(.4);
   assert.equal(actor.model.position.y,actor.floorOffset,'Leaving a seat restores outdoor grounding');
  }
  yuri.entity.visible=true;yuri.entity.userData.seatHeight=.51;yuri.entity.userData.socialPose='Sit';models.update(.4);scene.updateMatrixWorld(true);
  assert.equal(yuri.current,'Sit');
  for(const name of ['LeftFoot','RightFoot']){
   const foot=yuri.entity.worldToLocal(yuri.model.getObjectByName(name).getWorldPosition(new THREE.Vector3()));
   assert.ok(foot.y>.06&&foot.y<.14,'Seated Yuri keeps her soles at floor level: '+foot.y);
   assert.ok(foot.z<-.35,'Feet extend forward underneath the table');
  }
  delete yuri.entity.userData.seatHeight;delete yuri.entity.userData.socialPose;yuri.entity.userData.carrying=true;models.update(.4);
  assert.equal(yuri.current,'CarryIdle');assert.equal(yuri.model.position.y,yuri.floorOffset);
  delete yuri.entity.userData.carrying;models.update(.4);assert.equal(yuri.current,'Idle_Neutral');
 }finally{globalThis.fetch=originalFetch;globalThis.createImageBitmap=originalBitmap;globalThis.self=originalSelf;}
});
