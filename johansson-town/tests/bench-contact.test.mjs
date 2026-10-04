import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {installDOM} from './fixtures.mjs';
import {createAvatarJohansson,createAvatarActor,updateAvatarActor} from '../src/avatars/actors.js';
import {CAST_RECIPES} from '../src/avatars/cast.js';
import {sakuraBenchSeat,SAKURA_BENCH_PLACE,buildSakuraBench} from '../src/world/sakura-bench.js';
import {createPropFactory} from '../prop-factory.js';
import {createTownActivities} from '../src/people/town-activities.js';

installDOM();
test('authored sit point touches a seat slat at the declared height',async()=>{
 const old={self:globalThis.self,bitmap:globalThis.createImageBitmap};globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:512,height:512,close(){}});
 try{
  const bytes=await readFile(new URL('../assets/models/street/sakura-bench.glb',import.meta.url));
  const model=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;
  const root=new THREE.Group();root.position.set(SAKURA_BENCH_PLACE.x,0,SAKURA_BENCH_PLACE.z);root.rotation.y=SAKURA_BENCH_PLACE.yaw;root.add(model);root.updateMatrixWorld(true);
  const s=sakuraBenchSeat(),ray=new THREE.Raycaster(new THREE.Vector3(s.position[0],1.1,s.position[2]),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(root,true).find(h=>h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.75);
  assert.ok(hit);assert.ok(Math.abs(hit.point.y-s.surfaceY)<.0001);
 }finally{globalThis.self=old.self;globalThis.createImageBitmap=old.bitmap;}
});
test('fallback and streamed bench share the same surface height',()=>{
 const world={group:new THREE.Group(),colliders:[],details:[]};
 const b=buildSakuraBench(world,{factory:createPropFactory({shadows:false})});world.group.updateMatrixWorld(true);
 const s=b.seat,ray=new THREE.Raycaster(new THREE.Vector3(s.position[0],1.1,s.position[2]),new THREE.Vector3(0,-1,0));
 const hit=ray.intersectObject(b.object,true).find(h=>h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.75);
 assert.ok(Math.abs(hit.point.y-s.surfaceY)<.0001);
});
test('every cast recipe keeps its seated support point on the bench',()=>{
 const scene=new THREE.Scene(),seat=sakuraBenchSeat();
 for(const recipe of Object.values(CAST_RECIPES)){
  const p=createAvatarJohansson({scene,recipe});p.root.position.set(seat.position[0],seat.surfaceY-p.sitHip,seat.position[2]);
  for(let i=0;i<90;i++)p.update(1/30,{seated:true,visible:true});
  const m=p.avatar.measure;
  assert.ok(Math.abs(p.root.position.y+p.avatar.root.position.y+m.hipY-m.seatDrop-seat.surfaceY)<.00001,recipe.name);
  assert.equal(p.root.position.x,seat.position[0]);assert.equal(p.root.position.z,seat.position[2]);
  p.avatar.dispose();p.root.removeFromParent();
 }
});
test('residents use the real surface on ground and raised benches and release the seat',()=>{
 for(const floor of [0,.8]){
  const root=new THREE.Group(),g=new THREE.Group();root.add(g);g.position.set(0,floor,0);
  const person={g,profile:{name:'Kenji'}},marker=new THREE.Object3D();marker.position.set(0,floor+1,0);root.add(marker);
  marker.userData.hit={label:'Sit on bench',inside:false};marker.userData.seat={position:[0,floor,0],stand:[0,floor,-1],eyeY:floor+1.16,surfaceY:floor+.46856,yaw:0};
  const service=createTownActivities({getTargets:()=>[marker],collides:()=>false}),base={place:'park',target:[0,-1]};
  service.plan(person,base,0,false,.1);service.plan(person,base,20,false,.1);g.position.set(0,floor,-1);service.plan(person,base,20.1,false,.1);
  assert.equal(g.userData.socialPose,'Sit');assert.ok(Math.abs(g.userData.seatHeight-.46856)<1e-8);
  const actor=createAvatarActor(g,'Kenji');for(let i=0;i<90;i++)updateAvatarActor(actor,1/30,0);
  const m=actor.avatar.measure;assert.ok(Math.abs(g.position.y+actor.avatar.root.position.y+m.hipY-m.seatDrop-marker.userData.seat.surfaceY)<.001);
  service.release(person,21);assert.equal(marker.userData.reservedBy,undefined);assert.equal(g.userData.seatHeight,undefined);actor.avatar.dispose();
 }
});
