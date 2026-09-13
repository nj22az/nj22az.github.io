import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createShopAttention} from '../src/people/shop-attention.js';
import {createLocalCharacters,preloadCharacter} from '../src/people/models.js';

test('Thuan notices nearby customers, gives the till priority, and does not watch through furniture',()=>{
 const clerk=new T.Group(),guest=new T.Group(),world={people:[{profile:{name:'Thuan'},g:clerk},{profile:{name:'Reiko',height:1.65},g:guest}]};clerk.userData.inMarket=true;guest.userData.inMarket=true;guest.position.set(.4,0,-2);let inside=true;const player=new T.Vector3(-.3,0,-1.4),retail={customers:new Map()},colliders=[];
 const attention=createShopAttention({clerk,world,retail,colliders,isInside:()=>inside,getPlayerPosition:()=>player});attention.update(.2);assert.equal(clerk.userData.lookCustomer,'player');
 retail.customers.set(world.people[1],{phase:'queue',atCounter:true});attention.update(.2);assert.equal(clerk.userData.lookCustomer,'Reiko');
 colliders.push({x:.2,z:-1,w:.25,d:.1,height:2});attention.update(.2);assert.equal(clerk.userData.lookCustomer,'player');
 inside=false;attention.update(.2);assert.equal(clerk.userData.lookTarget,undefined);
 colliders.length=0;guest.position.set(0,0,1);attention.update(.2);assert.equal(clerk.userData.lookTarget,undefined,'No backwards head turn');
 guest.position.set(0,0,-1);clerk.userData.carrying=true;attention.update(.2);assert.equal(clerk.userData.lookTarget,undefined,'Restocking takes precedence');
});

test('the actual Meshy rig turns its head smoothly, keeps its body still and returns to its authored pose',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});const previous=fetch;
 globalThis.fetch=async input=>String(input).startsWith('blob:')?previous(input):new Response(await readFile(new URL('../assets/'+new URL(input).pathname.split('/assets/')[1],import.meta.url)));
 try{
  await preloadCharacter('Thuan');const scene=new T.Group(),entity=new T.Group();scene.position.set(7,0,-3);scene.rotation.y=.65;scene.add(entity);entity.rotation.y=.4;entity.userData.inMarket=true;
  const controller=createLocalCharacters(),actor=controller.attach(entity,'Thuan'),head=actor.model.getObjectByName('Head'),body=entity.quaternion.clone(),position=entity.position.clone();controller.update(.01);
  const point=entity.localToWorld(new T.Vector3(-1.5,1.65,-1.8));entity.userData.lookTarget=point.toArray();let last=0;
  for(let i=0;i<90;i++){controller.update(1/60);assert.ok(Math.abs(actor.customerGaze.yaw-last)<=1.2/60+.0001);last=actor.customerGaze.yaw;}
  assert.ok(actor.customerGaze.yaw>.5&&actor.customerGaze.yaw<=.65);assert.ok(entity.quaternion.equals(body)&&entity.position.equals(position));assert.ok(head.quaternion.toArray().every(Number.isFinite));
  entity.userData.lookTarget=entity.localToWorld(new T.Vector3(0,1.6,2)).toArray();for(let i=0;i<120;i++)controller.update(1/60);assert.ok(Math.abs(actor.customerGaze.yaw)<.001,'The gaze relaxes for someone behind her');
  const idleFrames=Math.round(actor.actions.get('Idle_Neutral').getClip().duration*60);
  delete entity.userData.lookTarget;for(let i=0;i<idleFrames;i++)controller.update(1/60);const rest=head.quaternion.clone();for(let i=0;i<idleFrames*2;i++)controller.update(1/60);assert.ok(head.quaternion.angleTo(rest)<.001,'No accumulated head rotation across complete idle loops');
 }finally{globalThis.fetch=previous;}
});
