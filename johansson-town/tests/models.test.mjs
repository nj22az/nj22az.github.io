import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {preloadModels,createLocalCharacters,characterSource} from '../src/people/models.js?snappy=1';
import {installDOM} from './fixtures.mjs';
import {PROFILES} from '../src/people/profiles.js';

test('every resident, including Aya and Nozomi, uses low-poly geometry with independent motion and seating',async()=>{
 installDOM();const previous={fetch:globalThis.fetch,bitmap:globalThis.createImageBitmap,self:globalThis.self},requests=[];
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 globalThis.fetch=async input=>{
  const url=String(input.url||input);if(url.startsWith('blob:'))return previous.fetch(input);
  assert.ok(url.startsWith('https://nj22az.github.io/johansson-town/assets/characters/'));requests.push(url);
  return new Response(await readFile(new URL('../assets/characters/'+new URL(url).pathname.split('/characters/')[1],import.meta.url)));
 };
 try{
  assert.deepEqual(await preloadModels(),{ready:5,total:5});assert.equal(requests.length,5);
  assert.ok(requests.every(url=>!url.includes('/realistic/')&&!url.includes('vroid')),'No superseded character or VRoid textures requested');
  assert.equal(characterSource('Yuri'),'female_casual');assert.equal(characterSource('Aya'),'female_casual');assert.equal(characterSource('Reiko'),'female_formal');assert.equal(characterSource('Nozomi'),'female_formal');
  const models=createLocalCharacters(),scene=new THREE.Scene(),actors=[];
  const player=new THREE.Group();assert.equal(models.attach(player,'Johansson'),null);assert.equal(player.children.length,0);
  for(const name of [...PROFILES.map(p=>p.name),'Yui','Yuri']){
   const entity=new THREE.Group();entity.userData.name=name;scene.add(entity);
   const actor=models.attach(entity,name,name==='Yuri'?1.64:undefined);assert.ok(actor,name);actors.push(actor);
   assert.equal(entity.userData.visualReady,true);const skins=[];actor.model.traverse(o=>{if(o.isSkinnedMesh)skins.push(o);});
   for(const clip of ['Idle_Neutral','Walk','Run','Wave','Sit','Sleep'])assert.ok(actor.actions.has(clip),name+' '+clip);
   assert.equal(actor.isAya,name==='Aya');assert.equal(actor.isYuri,name==='Yuri');assert.equal(actor.isNozomi,name==='Reiko');
   {
    assert.equal(actor.lowPoly,true);assert.equal(skins.length,1,'One body draw per low-poly resident');assert.match(entity.userData.visualSource,/PSX low-poly/);
    const skin=skins[0];assert.equal(skin.geometry.groups.length,0);assert.equal(skin.material.map,null);assert.equal(skin.material.flatShading,true);
    assert.ok(skin.geometry.attributes.position.count<14000);assert.ok(actor.seatSupport);assert.ok(actor.cup);
    for(const clip of ['Eat','Drink'])assert.ok(actor.actions.has(clip));
   }
   scene.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(actor.model,true);
   assert.ok(Math.abs(bounds.max.y-actor.height)<.055,name+' retains their height');assert.ok(Math.abs(bounds.min.y)<.02,name+' is grounded');
  }
  const byName=name=>actors.find(a=>a.entity.userData.name===name),kenji=byName('Kenji'),tetsuo=byName('Tetsuo'),yuri=byName('Yuri'),mrsSato=byName('Mrs Sato');
  const skin=actor=>{let mesh;actor.model.traverse(o=>{if(o.isSkinnedMesh)mesh=o;});return mesh;};
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
  for(const actor of actors.filter(a=>a.lowPoly)){
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
