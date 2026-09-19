import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {preloadModels,preloadModel,createLocalCharacters,characterSource} from '../src/people/models.js?snappy=1';
import {installDOM} from './fixtures.mjs';
import {PROFILES} from '../src/people/profiles.js';

test('residents retain independent motion and seating with Thuan on her supplied Meshy rig',async()=>{
 installDOM();const previous={fetch:globalThis.fetch,bitmap:globalThis.createImageBitmap,self:globalThis.self},requests=[];
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 globalThis.fetch=async input=>{
  const url=String(input.url||input);if(url.startsWith('blob:'))return previous.fetch(input);
  assert.ok(url.startsWith('https://nj22az.github.io/johansson-town/assets/characters/'));requests.push(url);
  return new Response(await readFile(new URL('../assets/characters/'+new URL(url).pathname.split('/characters/')[1],import.meta.url)));
 };
 try{
  assert.deepEqual(await preloadModels(),{ready:6,total:6});assert.equal(requests.length,6);
  assert.ok(requests.every(url=>!url.includes('/realistic/')&&!url.includes('vroid')),'No superseded character or VRoid textures requested');
  assert.equal(characterSource('Thuan'),'yuri-merged');assert.equal(characterSource('Aya'),'female_casual');assert.equal(characterSource('Reiko'),'female_formal');assert.equal(characterSource('Nozomi'),'female_formal');
  const models=createLocalCharacters(),scene=new THREE.Scene(),actors=[];
  const player=new THREE.Group();assert.equal(models.attach(player,'Johansson'),null);assert.equal(player.children.length,0);
  for(const name of [...PROFILES.map(p=>p.name),'Yui','Thuan']){
   const entity=new THREE.Group();entity.userData.name=name;scene.add(entity);
   const actor=models.attach(entity,name,name==='Thuan'?1.64:undefined);assert.ok(actor,name);actors.push(actor);
   assert.equal(entity.userData.visualReady,true);const skins=[];actor.model.traverse(o=>{if(o.isSkinnedMesh)skins.push(o);});
   for(const clip of ['Idle_Neutral','Walk','Run','Wave','Sit','Sleep'])assert.ok(actor.actions.has(clip),name+' '+clip);
   assert.equal(actor.isAya,name==='Aya');assert.equal(actor.isThuan,name==='Thuan');assert.equal(actor.isNozomi,name==='Reiko');
   {
    assert.equal(actor.lowPoly,name!=='Thuan');assert.equal(skins.length,1,'Each resident has one body');
    const skin=skins[0];assert.equal(skin.geometry.groups.length,0);
    if(name==='Thuan'){assert.match(entity.userData.visualSource,/Meshy merged/);assert.ok(skin.material.map);assert.equal(actor.face,null);assert.equal(skin.geometry.attributes.position.count,98333);}
    else{assert.match(entity.userData.visualSource,/PSX low-poly/);assert.equal(skin.material.map,null);assert.equal(skin.material.flatShading,true);assert.ok(skin.geometry.attributes.position.count<14000);}
    assert.ok(actor.seatSupport);assert.ok(actor.cup);
    for(const clip of ['Eat','Drink'])assert.ok(actor.actions.has(clip));
   }
   scene.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(actor.model,true);
   assert.ok(Math.abs(bounds.max.y-actor.height)<.055,name+' retains their height');assert.ok(Math.abs(bounds.min.y)<.02,name+' is grounded');
  }
  const byName=name=>actors.find(a=>a.entity.userData.name===name),kenji=byName('Kenji'),tetsuo=byName('Tetsuo'),yuri=byName('Thuan'),mrsSato=byName('Mrs Sato');
  const skin=actor=>{let mesh;actor.model.traverse(o=>{if(o.isSkinnedMesh&&!o.userData.facialFeatures)mesh=o;});return mesh;};
  assert.notEqual(skin(kenji).skeleton,skin(tetsuo).skeleton);assert.equal(skin(byName('Harbour master')).geometry.attributes.position,skin(byName('Bus driver')).geometry.attributes.position);
  assert.notEqual(skin(kenji).geometry.attributes.color,skin(tetsuo).geometry.attributes.color,'Wardrobe colours remain independent');
  mrsSato.entity.userData.sleeping=true;mrsSato.entity.userData.roomTransition=true;models.update(.1);assert.equal(mrsSato.sleepEyes,null,'Eyes stay open while walking to bed');delete mrsSato.entity.userData.roomTransition;
  mrsSato.entity.userData.sleepBlend=1;mrsSato.entity.userData.socialPose='Sleep';models.update(.4);
  assert.equal(mrsSato.current,'Sleep');assert.equal(mrsSato.sleepEyes.visible,true,'Painted open eyes are covered');assert.equal(mrsSato.model.getObjectByName('resident-glasses').visible,false,'Spectacles come off in bed');
  delete mrsSato.entity.userData.sleeping;delete mrsSato.entity.userData.sleepBlend;delete mrsSato.entity.userData.socialPose;models.update(.4);
  assert.equal(mrsSato.sleepEyes,null);assert.equal(mrsSato.model.getObjectByName('resident-glasses').visible,true);
  for(let i=0;i<50;i++){kenji.entity.position.z-=.02;models.update(1/60);}assert.equal(kenji.current,'Walk');
  const hidden=new THREE.Group();scene.add(hidden);hidden.add(kenji.entity);hidden.visible=false;const time=kenji.mixer.time;models.update(.1);assert.equal(kenji.mixer.time,time);
  hidden.visible=true;models.update(1/60);assert.equal(kenji.current,'Idle_Neutral');assert.equal(kenji.speed,0);
  for(let i=0;i<30;i++){kenji.entity.position.z-=.02;models.update(1/60);}kenji.entity.position.z+=20;models.update(1/60);assert.equal(kenji.current,'Idle_Neutral');assert.equal(kenji.actions.get('Walk').isRunning(),false);
  models.gesture(yuri.entity);models.update(1/60);assert.equal(yuri.current,'Wave');assert.equal(yuri.actions.get('Wave').loop,THREE.LoopOnce);
  const remaining=yuri.gestureTime;models.gesture(yuri.entity);assert.equal(yuri.gestureTime,remaining);for(let i=0;i<Math.ceil((remaining+1)*60);i++)models.update(1/60);assert.equal(yuri.current,'Idle_Neutral');
  const point=new THREE.Vector3();
  for(const actor of actors){
   actor.entity.visible=true;actor.entity.parent.visible=true;actor.gestureTime=0;actor.speed=0;actor.moving=false;
   const standing=models.conversationTarget(actor.entity);
   for(const height of [.71,.565])for(const pose of ['Sit','Eat','Drink','Type']){
    actor.entity.userData.seatHeight=height;actor.entity.userData.socialPose=pose;models.update(.4);scene.updateMatrixWorld(true);
    assert.equal(actor.current,pose);assert.equal(actor.cup.visible,pose==='Drink');if(height===.565)assert.ok(models.conversationTarget(actor.entity).y<standing.y-.025,actor.entity.userData.name+' conversation target follows the seated head');
    if(pose==='Drink')assert.ok(actor.cup.getWorldQuaternion(new THREE.Quaternion()).angleTo(new THREE.Quaternion())<.001);
    const hip=actor.entity.worldToLocal(actor.model.getObjectByName('Hips').getWorldPosition(new THREE.Vector3()));let bottom=Infinity;
    const mesh=skin(actor);mesh.skeleton.update();
    for(let i=0;i<mesh.geometry.attributes.position.count;i++){
     mesh.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld);actor.entity.worldToLocal(point);
     assert.ok(point.toArray().every(Number.isFinite));assert.ok(point.length()<4,'Seated limbs remain bounded');
     if(Math.hypot(point.x,point.z)<.25&&point.y>hip.y-.24&&point.y<hip.y)bottom=Math.min(bottom,point.y);
    }
    assert.ok(Math.abs(bottom-height)<.015,actor.entity.userData.name+' seat contact '+bottom+' / '+height);
   }
   delete actor.entity.userData.seatHeight;delete actor.entity.userData.socialPose;models.update(.4);assert.equal(actor.model.position.y,actor.floorOffset);
  }
  for(const actor of [kenji,byName('Aya'),yuri,byName('Reiko')])for(const action of actor.actions.values()){
   actor.mixer.stopAllAction();action.reset().play();
   for(const fraction of [0,.25,.5,.75,1]){
    actor.mixer.setTime(action.getClip().duration*fraction);scene.updateMatrixWorld(true);
    actor.model.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;mesh.skeleton.update();for(let i=0;i<mesh.geometry.attributes.position.count;i+=17){mesh.getVertexPosition(i,point);assert.ok(point.toArray().every(Number.isFinite));assert.ok(point.length()<4,'No exploded limbs');}});
   }
  }
  yuri.mixer.stopAllAction();yuri.current=null;yuri.entity.userData.carrying=true;models.update(.4);assert.equal(yuri.current,'CarryIdle');
 }finally{globalThis.fetch=previous.fetch;globalThis.createImageBitmap=previous.bitmap;globalThis.self=previous.self;}
});

test('Thuan changes how she stands instead of looping one take all day',async()=>{
 const previous={fetch:globalThis.fetch,bitmap:globalThis.createImageBitmap,self:globalThis.self};
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 globalThis.fetch=async input=>{const url=String(input.url||input);if(url.startsWith('blob:'))return previous.fetch(input);
  return new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));};
 try{
  await preloadModel('yuri-merged');
  const models=createLocalCharacters(),scene=new THREE.Scene();
  const entity=new THREE.Group();entity.userData.name='Thuan';scene.add(entity);
  const actor=models.attach(entity,'Thuan',1.64);
  assert.ok(actor,'Thuan did not attach');

  // The alternate takes have to exist, and be different takes rather than copies.
  for(const family of ['Idle_Neutral','CounterIdle']){
   const takes=['','.1','.2'].map(s=>family+s);
   for(const name of takes)assert.ok(actor.actions.has(name),'Missing idle take '+name);
   const lengths=new Set(takes.map(n=>actor.actions.get(n).getClip().duration));
   assert.equal(lengths.size,takes.length,family+' takes share a cadence, so they will loop in step');
  }

  // Standing at the counter for a couple of minutes, she should use more than one.
  entity.userData.socialPose='CounterIdle';
  const used=new Set();
  for(let i=0;i<120*60;i++){models.update(1/60);if(actor.current)used.add(actor.current);}
  assert.ok(used.size>1,'She held one take for two minutes: '+[...used]);
  for(const name of used)assert.ok(name.startsWith('CounterIdle'),'Idle variation reached outside the family: '+name);

  // And it must be a settle, not a snap: the hands may not step between takes.
  const hand=actor.model.getObjectByName('LeftHand');
  let last=null,worst=0;
  for(let i=0;i<90*60;i++){
   models.update(1/60);entity.updateWorldMatrix(true,true);
   const here=entity.worldToLocal(hand.getWorldPosition(new THREE.Vector3()));
   if(last)worst=Math.max(worst,here.distanceTo(last));
   last=here;
  }
  assert.ok(worst<.02,'A hand jumped '+(worst*100).toFixed(1)+'cm in one frame between takes');

  // Her weight moves; her feet do not. The legs hang off the pelvis, so tilting it
  // swings everything below and drags the toes across the floor unless the same
  // rotation is taken back out of the thighs.
  for(const family of ['Idle_Neutral','CounterIdle']){
   const planted={};
   for(const suffix of ['','.1','.2']){
    const action=actor.actions.get(family+suffix),clip=action.getClip();
    actor.mixer.stopAllAction();action.reset().play();
    for(const fraction of [0,.34,.67]){
     actor.mixer.setTime(clip.duration*fraction);
     entity.updateWorldMatrix(true,true);actor.model.updateMatrixWorld(true);
     for(const foot of ['LeftToeBase','RightToeBase']){
      const bone=actor.model.getObjectByName(foot);if(!bone)continue;
      const here=entity.worldToLocal(bone.getWorldPosition(new THREE.Vector3()));
      (planted[foot]||=[]).push(here);
     }
    }
   }
   for(const [foot,points] of Object.entries(planted)){
    let spread=0;
    for(const a of points)for(const b of points)spread=Math.max(spread,a.distanceTo(b));
    assert.ok(spread<.015,family+' drags the '+foot+' '+(spread*100).toFixed(1)+'cm between takes');
   }
  }
  actor.mixer.stopAllAction();actor.current=null;

  // The low-poly cast gets takes of its own, baked the same way and with the same two
  // things to get wrong: a body that sinks, and feet that slide.
  await preloadModel('female_casual');
  const other=new THREE.Group();other.userData.name='Aya';scene.add(other);
  const aya=models.attach(other,'Aya');
  for(const suffix of ['.1','.2'])assert.ok(aya.actions.has('Idle_Neutral'+suffix),'Aya has no '+suffix+' take');
  for(const suffix of ['','.1','.2']){
   const action=aya.actions.get('Idle_Neutral'+suffix),clip=action.getClip();
   aya.mixer.stopAllAction();action.reset().play();
   const head=aya.model.getObjectByName('Head'),foot=aya.model.getObjectByName('FootL');
   const heights=[],toes=[];
   for(const fraction of [0,.25,.5,.75,1]){
    aya.mixer.setTime(clip.duration*fraction);
    other.updateWorldMatrix(true,true);aya.model.updateMatrixWorld(true);
    heights.push(other.worldToLocal(head.getWorldPosition(new THREE.Vector3())).y);
    toes.push(other.worldToLocal(foot.getWorldPosition(new THREE.Vector3())));
   }
   // Nothing the source idle leaves alone may accumulate across the loop.
   const sink=Math.max(...heights)-Math.min(...heights);
   assert.ok(sink<.03,'Idle_Neutral'+suffix+' sinks '+(sink*100).toFixed(1)+'cm over one loop');
   let slide=0;for(const a of toes)for(const b of toes)slide=Math.max(slide,a.distanceTo(b));
   assert.ok(slide<.02,'Idle_Neutral'+suffix+' slides a foot '+(slide*100).toFixed(1)+'cm');
  }
  aya.mixer.stopAllAction();

  // Somebody who is walking is not idling, and must not be given an idle take.
  entity.userData.socialPose=undefined;delete entity.userData.socialPose;
  for(let i=0;i<60;i++){entity.position.x+=1.25/60;models.update(1/60);}
  assert.ok(['Walk','Stroll'].includes(actor.current),'Walking picked '+actor.current);
 }finally{globalThis.fetch=previous.fetch;globalThis.createImageBitmap=previous.bitmap;globalThis.self=previous.self;}
});
