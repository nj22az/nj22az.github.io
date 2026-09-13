import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../vendor/three.module.js';
import {preloadCharacter,createLocalCharacters} from '../src/people/models.js';
import {createSteamedBunGeometry} from '../src/world/interiors/steamed-bun.js';
import {createResidentProp} from '../src/people/resident-props.js';
import {installDOM} from './fixtures.mjs';

test('the same palm-sized pleated bao is used on shelves, trays and in hands',()=>{
 const bun=createSteamedBunGeometry(),held=createResidentProp('bun');bun.computeBoundingBox();held.geometry.computeBoundingBox();
 assert.ok(bun.boundingBox.getSize(new T.Vector3()).x<.112);assert.ok(bun.boundingBox.getSize(new T.Vector3()).y<.075);
 assert.deepEqual(bun.boundingBox,held.geometry.boundingBox);assert.ok(held.geometry.attributes.position.count>500,'Folded crown, rather than a round placeholder');
});
test('different rigs bring food to the mouth, lower it and carry a plate on their palms under room transforms',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 const previous=fetch;globalThis.fetch=async input=>String(input).startsWith('blob:')?previous(input):new Response(await readFile(new URL('../assets/'+new URL(input).pathname.split('/assets/')[1],import.meta.url)));
 try{for(const name of ['Thuan','Kenji','Mrs Sato','Harbour master','Aya']){
  await preloadCharacter(name);const controller=createLocalCharacters(),scene=new T.Scene(),room=new T.Group(),entity=new T.Group();room.position.set(7,0,-4);room.rotation.y=.7;scene.add(room);room.add(entity);entity.rotation.y=1.3;
  const actor=controller.attach(entity,name),motion=actor.mealMotion;assert.ok(motion);
  const step=seconds=>{for(let i=0;i<Math.round(seconds*60);i++)controller.update(1/60);scene.updateMatrixWorld(true);};
  const lengths=()=>Object.values(motion.arms).flatMap(a=>[a.upper.getWorldPosition(new T.Vector3()).distanceTo(a.lower.getWorldPosition(new T.Vector3())),a.lower.getWorldPosition(new T.Vector3()).distanceTo(a.hand.getWorldPosition(new T.Vector3()))]);
  scene.updateMatrixWorld(true);const initial=lengths();entity.userData.seatHeight=.51;
  for(const [item,pose,rim] of [['bun','Eat',[0,.062,.047]],['tea','Drink',[0,.10,.037]],['rice','Eat',[0,.09,.047]]]){
   entity.userData.socialPose=pose;entity.userData.heldItem=item;step(1);
   const bite=actor.cup.localToWorld(new T.Vector3(...rim));assert.ok(bite.distanceTo(motion.mouth)<.05,name+' '+item+' reaches the mouth: '+bite.distanceTo(motion.mouth));
   const atMouth=actor.cup.getWorldPosition(new T.Vector3());step(1.7);const lowered=actor.cup.getWorldPosition(new T.Vector3());assert.ok(lowered.y<atMouth.y-.18,name+' visibly lowers the food');
   const now=lengths();now.forEach((n,i)=>assert.ok(Math.abs(n-initial[i])<.018,name+' keeps its arm length'));
  }
  entity.userData.heldItem='ramen';entity.userData.socialPose='Eat';step(1);assert.equal(actor.cup.parent,motion.arms.L.hand);assert.equal(actor.hands.utensils.visible,true);
  const tip=actor.hands.utensils.localToWorld(new T.Vector3(0,.025,.155));assert.ok(tip.distanceTo(motion.mouth)<.055,name+' chopsticks reach mouth');
  delete entity.userData.heldItem;delete entity.userData.socialPose;delete entity.userData.seatHeight;step(.5);assert.equal(actor.cup.visible,false);assert.equal(actor.hands.utensils.visible,false);
  if(name==='Thuan'){
   const tray=new T.Group();room.add(tray);entity.userData.carrying=true;entity.userData.carriedTray=tray;step(.5);
   const middle=motion.arms.R.contact.clone().add(motion.arms.L.contact).multiplyScalar(.5);assert.ok(tray.getWorldPosition(new T.Vector3()).distanceTo(middle)<.021);
   entity.position.x+=.35;entity.rotation.y+=.8;step(.1);assert.ok(tray.getWorldPosition(new T.Vector3()).distanceTo(motion.arms.R.contact)<.13);assert.equal(actor.current,'CarryWalk');
   delete entity.userData.carrying;delete entity.userData.carriedTray;step(1);
  }
  const rest=motion.arms.R.hand.getWorldPosition(new T.Vector3());step(12);assert.ok(motion.arms.R.hand.getWorldPosition(new T.Vector3()).distanceTo(rest)<.035,name+' does not accumulate pose offsets');
 }}finally{globalThis.fetch=previous;}
});
