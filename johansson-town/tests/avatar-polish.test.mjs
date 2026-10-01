import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildAvatar} from '../src/avatars/build.js';
import {CAST_RECIPES} from '../src/avatars/cast.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
import {createAvatarActor,updateAvatarActor} from '../src/avatars/actors.js';
import {faceLayout} from '../src/avatars/face.js';
import {shapeHeadPoint} from '../src/avatars/head-profile.js';
import {fitAvatarHeldProp,consumptionPhase} from '../src/avatars/consume.js';
import {createDrinkProp,createDishProp,setPropPortion,updatePropPortion,disposeServing} from '../src/people/izakaya-beer.js';
installDOM();

test('face UVs never interpolate a second face across the rear seam',()=>{
 for(const name of ['Thuan','Johansson'])for(const form of ['oval','round','square','narrow','heart']){
  const a=buildAvatar({...CAST_RECIPES[name],head:{...CAST_RECIPES[name].head,form}});
  const {position:P,uv:U}=a.face.head.geometry.attributes;let rear=0;
  for(let i=0;i<P.count;i+=3){
   const us=[U.getX(i),U.getX(i+1),U.getX(i+2)];
   assert.ok(Math.max(...us)-Math.min(...us)<.5,'no face-wide UV seam triangle');
   if([0,1,2].every(j=>P.getZ(i+j)<=0)){rear++;for(let j=0;j<3;j++)assert.ok(U.getX(i+j)<.003&&U.getY(i+j)<.003);}
  }
  assert.ok(rear>100);a.dispose();
 }
});

test('shirt collar panels and buttons are on the same +z front as the face',()=>{
 for(const top of ['kariyushi','polo','blouse','jacket','smock']){
  const a=buildAvatar({...CAST_RECIPES.Thuan,outfit:{...CAST_RECIPES.Thuan.outfit,top,pattern:'none'}});
  const {position:P,normal:N}=a.body.geometry.attributes,m=a.measure;let panels=0;
  for(let i=0;i<P.count;i+=3){
   const y=(P.getY(i)+P.getY(i+1)+P.getY(i+2))/3;
   if(y>m.neckY-.12*m.k&&y<m.neckY-.02*m.k&&[0,1,2].every(j=>Math.abs(P.getX(i+j))<.09*m.k&&P.getZ(i+j)>m.depth*.25&&N.getZ(i+j)>.8))panels++;
  }
  assert.ok(panels>=2,top+' has outward-facing front collar panels');a.dispose();
 }
});

test('glasses stay clear of the hand and their rim meets the measured mouth at every height',()=>{
 for(const name of ['Johansson','Thuan'])for(const height of [0,.5,1])for(const kind of ['draft','bottle']){
  const a=buildAvatar({...CAST_RECIPES[name],body:{...CAST_RECIPES[name].body,height}});
  const prop=createDrinkProp(kind,{held:true}),anim=createAvatarAnimator(a);a.bones.handR.add(prop);
  anim.play('SitDrink');for(let i=0;i<36;i++)anim.update(1/30,{seated:true,heldProp:prop});
  fitAvatarHeldProp(a,prop,anim.consumption.lift);a.root.updateMatrixWorld(true);
  const m=a.measure,L=faceLayout(a.recipe),theta=Math.PI*.28+L.mouthY/256*Math.PI*.58,phi=Math.PI/2-.95+L.mouthX/256*1.9;
  const v=shapeHeadPoint(new THREE.Vector3(-Math.cos(phi)*Math.sin(theta),Math.cos(theta),Math.sin(phi)*Math.sin(theta)),m.profile);
  const mouth=a.bones.head.localToWorld(new THREE.Vector3(v.x*m.Rh*m.headSX,m.headCentre-m.headY+v.y*m.Rh*m.headSY,v.z*m.Rh*.98+.025*m.k));
  const rim=prop.localToWorld(new THREE.Vector3(0,prop.userData.rimHeight,0));
  assert.ok(rim.distanceTo(mouth)<.015,name+' '+height+' '+kind+' reaches lips');
  const hand=a.bones.handR.getWorldPosition(new THREE.Vector3()),local=prop.worldToLocal(hand.clone());
  assert.ok(local.x>.09*m.k,'hand beside cup handle rather than inside cup');
  disposeServing(prop);a.dispose();
 }
 assert.equal(consumptionPhase(0).lift,0);assert.equal(consumptionPhase(1.2).lift,1);assert.equal(consumptionPhase(2.4).lift,0);
});

test('liquid drains smoothly and food pieces disappear without flattening the whole dish',()=>{
 const glass=createDrinkProp('bottle'),dish=createDishProp('sashimi');
 setPropPortion(glass,.5);updatePropPortion(glass,1/60);
 assert.ok(glass.userData.portion<1&&glass.userData.portion>.5);
 for(let i=0;i<100;i++)updatePropPortion(glass,1/60);
 assert.ok(Math.abs(glass.userData.portion-.5)<.002);
 setPropPortion(dish,.5,{immediate:true});
 const pieces=dish.userData.level.children;assert.ok(pieces.some(o=>!o.visible));assert.ok(pieces.some(o=>o.visible&&o.scale.y===1));
 setPropPortion(glass,0,{immediate:true});assert.equal(glass.userData.level.visible,false);
 disposeServing(glass);disposeServing(dish);
});

test('resident props and portions work for named residents and a generic visitor',()=>{
 for(const name of ['Thuan','Johansson','Mrs Nakamura','Visiting engineer']){
  const entity=new THREE.Group();entity.userData.name=name;
  const actor=createAvatarActor(entity,name);entity.userData.socialPose='Drink';entity.userData.seatHeight=.45;entity.userData.heldItem='beer';entity.userData.heldPortion=.5;
  for(let i=0;i<40;i++)updateAvatarActor(actor,1/30);
  assert.ok(actor.heldProp);assert.equal(actor.heldProp.parent,actor.avatar.bones.handR);assert.ok(Math.abs(actor.heldProp.userData.portion-.5)<.002);
  entity.userData.socialPose='Eat';entity.userData.heldItem='ramen';entity.userData.foodPortion=.4;
  for(let i=0;i<40;i++)updateAvatarActor(actor,1/30);
  assert.ok(actor.dishProp);assert.equal(actor.dishProp.parent,actor.avatar.bones.handL);assert.ok(Math.abs(actor.dishProp.userData.portion-.4)<.002);
  delete entity.userData.heldItem;entity.userData.socialPose='Sit';updateAvatarActor(actor,1/30);assert.equal(actor.heldProp,null);assert.equal(actor.dishProp,null);actor.avatar.dispose();
 }
});

test('a beer keeps its head as it empties, bubbles stay in the beer, and the last sip tips further',async()=>{
 const {drinkTilt}=await import('../src/avatars/consume.js');
 const glass=createDrinkProp('draft'),u=glass.userData,p=u.pour;
 assert.ok(p,'a poured beer has a liquid, a head and bubbles');
 for(const left of [1,.6,.2]){
  setPropPortion(glass,left,{immediate:true});for(let i=0;i<30;i++)updatePropPortion(glass,1/30);
  const top=p.bottom+p.height*left,headBase=p.head.position.y-p.headHeight*p.head.scale.y/2;
  assert.ok(Math.abs(headBase-top)<1e-6,'the foam sits on the beer at '+left);
  assert.ok(p.head.visible,'there is still a head at '+left);
  const pos=p.bubbles.geometry.attributes.position;for(let i=0;i<pos.count;i++)assert.ok(pos.getY(i)<=top+1e-6,'a bubble above the beer at '+left);
 }
 setPropPortion(glass,0,{immediate:true});assert.equal(glass.userData.level.visible,false,'an empty glass shows no beer and no foam');
 const full=createDrinkProp('draft'),last=createDrinkProp('draft');setPropPortion(last,.05,{immediate:true});
 assert.ok(drinkTilt(last,1)<drinkTilt(full,1),'the last mouthful is tipped further than the first');
 assert.equal(drinkTilt(full,1,true),0,'food stays level');
});
