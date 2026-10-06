import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {CAST_RECIPES,NEIGHBOUR_RECIPES,recipeFor} from '../src/avatars/cast.js';
import {PROFILES} from '../src/people/profiles.js';
import {STREET_CAST_NAMES} from '../src/people/residents.js';
import {buildAvatar} from '../src/avatars/build.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
import {createAvatarActor,updateAvatarActor} from '../src/avatars/actors.js';
import {fitAvatarHeldProp} from '../src/avatars/consume.js';
import {createDrinkProp,disposeServing} from '../src/people/izakaya-beer.js';
import {faceLayout} from '../src/avatars/face.js';
import {shapeHeadPoint} from '../src/avatars/head-profile.js';
installDOM();
const names=[...new Set([...Object.keys(CAST_RECIPES),...Object.keys(NEIGHBOUR_RECIPES),...PROFILES.map(p=>p.name),...STREET_CAST_NAMES])];
const drinks=['draft','bottle','can','coffee','sake','oolong','mugicha','awamori'];
function renderedHand(a){
 const m=a.measure,b=a.body,g=b.geometry,index=b.skeleton.bones.indexOf(a.bones.handR),hand=[],thumb=[];
 for(let i=0;i<g.attributes.position.count;i++){
  if(g.attributes.skinIndex.getX(i)!==index||g.attributes.skinWeight.getX(i)<.999)continue;
  hand.push(i);
  if(g.attributes.position.getX(i)>-m.shoulderX-.015+m.hand*.35&&g.attributes.position.getZ(i)>m.hand*.25)thumb.push(i);
 }
 assert.ok(hand.length&&thumb.length,'actual hand and thumb vertices exist');
 return ()=>{a.root.updateMatrixWorld(true);const bounds=new THREE.Box3(),tip=new THREE.Vector3();
  for(const i of hand)bounds.expandByPoint(b.localToWorld(b.getVertexPosition(i,new THREE.Vector3())));
  for(const i of thumb)tip.add(b.localToWorld(b.getVertexPosition(i,new THREE.Vector3())));
  return {bounds,tip:tip.multiplyScalar(1/thumb.length)};
 };
}
function lips(a){const m=a.measure,L=faceLayout(a.recipe),theta=Math.PI*.28+L.mouthY/256*Math.PI*.58,phi=Math.PI/2-.95+L.mouthX/256*1.9;
 const v=shapeHeadPoint(new THREE.Vector3(-Math.cos(phi)*Math.sin(theta),Math.cos(theta),Math.sin(phi)*Math.sin(theta)),m.profile);
 return a.bones.head.localToWorld(new THREE.Vector3(v.x*m.Rh*m.headSX,m.headCentre-m.headY+v.y*m.Rh*m.headSY,v.z*m.Rh*.98+.025*m.k));
}
function check(a,prop,skin,label,sip){
 const {bounds,tip}=skin(),g=prop.userData.grip;
 const contact=prop.localToWorld(new THREE.Vector3(g.handle??g.radius,g.height,0));
 assert.ok(bounds.expandByScalar(.003).containsPoint(contact),label+' vessel grip contacts the rendered hand');
 const thumb=prop.worldToLocal(tip),palm=prop.worldToLocal(a.bones.handR.localToWorld(new THREE.Vector3(0,-a.measure.hand*.55,0)));
 assert.ok(thumb.x<palm.x-a.measure.hand*.1,label+' thumb wraps towards the vessel');
 if(sip)assert.ok(prop.localToWorld(new THREE.Vector3(0,prop.userData.rimHeight,0)).distanceTo(lips(a))<.015,label+' rim reaches lips');
}
test('every named character grips every drink with the visible hand throughout seated and standing sips',()=>{
 for(const name of names){
  const a=buildAvatar(recipeFor(name)),anim=createAvatarAnimator(a),skin=renderedHand(a);
  for(const kind of drinks){const prop=createDrinkProp(kind,{held:true});a.bones.handR.add(prop);
   for(const seated of [false,true])for(const phase of [0,.45,1.2,1.9,2.4]){
    for(let i=0;i<12;i++)anim.update(1/60,{seated,seatHeight:.42,pose:seated?'Drink':'DrinkStanding',heldProp:prop,consumeElapsed:phase});
    fitAvatarHeldProp(a,prop,anim.consumption.lift);check(a,prop,skin,`${name}/${kind}/${seated}/${phase}`,phase===1.2);
   }
   disposeServing(prop);
  }
  a.dispose();
 }
});
test('Fujita and every actor receive the correct vessel on the first frame and keep gripping during idle holds',()=>{
 for(const name of names){const entity=new THREE.Group(),actor=createAvatarActor(entity,name);
  Object.assign(entity.userData,{seatHeight:.42,socialPose:'Drink',heldItem:'beer',heldPortion:.6,consumeElapsed:1.2});
  updateAvatarActor(actor,1/60,1000);
  assert.equal(actor.heldProp.userData.rimHeight,.15);
  check(actor.avatar,actor.heldProp,renderedHand(actor.avatar),name+' first frame',true);
  entity.userData.socialPose='Sit';delete entity.userData.consumeElapsed;
  updateAvatarActor(actor,1/60,1017);check(actor.avatar,actor.heldProp,renderedHand(actor.avatar),name+' resting hold',false);
  disposeServing(actor.heldProp);actor.avatar.dispose();
 }
});
test('creator proportions keep the grip at minimum and maximum sizes',()=>{
 for(const age of ['child','teen','adult','elder'])for(const height of [0,1])for(const proportion of ['classic','rounded']){
  const recipe={...CAST_RECIPES.Johansson,age,body:{...CAST_RECIPES.Johansson.body,height,proportion},head:{...CAST_RECIPES.Johansson.head,size:1,form:'round'}};
  const a=buildAvatar(recipe),anim=createAvatarAnimator(a),skin=renderedHand(a),headRest=a.bones.head.position.clone();
  for(const kind of drinks){const prop=createDrinkProp(kind,{held:true});a.bones.handR.add(prop);
   for(let i=0;i<20;i++)anim.update(1/60,{seated:true,seatHeight:.42,pose:'Drink',heldProp:prop,consumeElapsed:1.2});
   fitAvatarHeldProp(a,prop,1);check(a,prop,skin,`${age}/${height}/${proportion}/${kind}`,true);
   anim.update(1/60,{seated:true,seatHeight:.42,pose:'Sit'});assert.ok(a.bones.head.position.distanceTo(headRest)<1e-8,'head returns to rest after sipping');
   disposeServing(prop);
  }a.dispose();
 }
});
