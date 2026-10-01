import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createDrinkProp,setPropPortion,updatePropPortion,disposeServing,createBeerService,IZAKAYA_PLAYER_SEATS} from '../src/people/izakaya-beer.js';
import {createHands} from '../src/interact/hands.js';

test('draught and bottle foam follows the surface without flattening; fizz stays below it',()=>{
 for(const kind of ['draft','bottle'])for(const held of [false,true]){
  const prop=createDrinkProp(kind,{held}),u=prop.userData;
  for(const portion of [1,.5,.1,0]){
   setPropPortion(prop,portion,{immediate:true});updatePropPortion(prop,1/60);
   const bottom=u.liquid.position.y-u.liquid.geometry.parameters.height*u.liquid.scale.y/2;
   assert.ok(Math.abs(bottom-u.liquidBase)<.0001);
   const surface=u.liquidBase+u.liquidHeight*portion;
   assert.ok(Math.abs(u.foam.position.y-surface-u.foam.geometry.parameters.height/2)<.0001);
   if(portion>=.5)assert.equal(u.foam.scale.y,1);
   const a=u.fizz.geometry.attributes.position;
   for(let i=0;i<a.count;i++)assert.ok(a.getY(i)>=u.liquidBase-.0001&&a.getY(i)<=surface+.0001);
   assert.equal(u.level.visible,portion>0);assert.equal(u.fizz.visible,portion>.02);
  }
  let disposed=false;u.fizz.geometry.addEventListener('dispose',()=>disposed=true);disposeServing(prop);assert.ok(disposed);
 }
});
test('table mug returns after the sip and the empty glass remains for replacement',()=>{
 const room=new THREE.Group(),s=createBeerService({room,getNao:()=>null,blocked:()=>false});
 s.place('draft',IZAKAYA_PLAYER_SEATS.table);const prop=room.children[0];
 for(let i=0;i<6;i++){
  const r=s.sip({duration:2.2});assert.equal(r.left,5-i);assert.equal(prop.visible,false);
  s.update(1);assert.equal(prop.visible,false);s.update(1.3);assert.equal(prop.visible,true);
 }
 assert.equal(s.sip(),null);assert.equal(room.children.length,1);assert.equal(prop.userData.level.visible,false);
 s.place('oolong',IZAKAYA_PLAYER_SEATS.table);assert.equal(room.children.length,1);s.clear();assert.equal(room.children.length,0);
});
test('first person lifts, pauses to sip, lowers and disposes without changing camera',()=>{
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),hands=createHands({scene,camera,say(){},consume:()=>false});
 camera.position.set(2,3,4);const original=camera.position.clone();
 assert.equal(hands.sip('draft',1,.8),true);assert.equal(hands.sip('draft'),false);
 const view=camera.children[0],prop=view.children.at(-1);
 hands.update(.7);const raised=prop.position.y;assert.ok(raised>-.2);
 hands.update(.4);assert.equal(prop.position.y,raised);assert.ok(prop.userData.portion<1);
 hands.update(.7);assert.ok(prop.position.y<raised);hands.update(.5);assert.equal(prop.parent,null);
 assert.deepEqual(camera.position,original);assert.equal(hands.sip('oolong'),true);
});
