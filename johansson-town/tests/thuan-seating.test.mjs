import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../vendor/three.module.js';
import {createCharacters,preloadCharacter} from '../src/people/characters.js';
import {createStoreService} from '../src/people/store-service.js';
import {STORE_SEATS,STORE_CLERK_POSITION} from '../src/world/interiors/store-layout.js';
import {buildConvenienceStore} from '../src/world/interiors/convenience.js';
import {installDOM} from './fixtures.mjs';
import {createPropFactory} from '../prop-factory.js';
import {buildStaffBench,STAFF_BENCH} from '../src/world/staff-bench.js';
import {createStaffBenchRoutine} from '../src/people/staff-bench-routine.js';

async function setup(run){
 installDOM();const previous={fetch,bitmap:globalThis.createImageBitmap,self:globalThis.self};globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 globalThis.fetch=async input=>String(input).startsWith('blob:')?previous.fetch(input):new Response(await readFile(new URL('../assets/'+new URL(input).pathname.split('/assets/')[1],import.meta.url)));
 try{await preloadCharacter('Thuan');await run();}finally{globalThis.fetch=previous.fetch;globalThis.self=previous.self;globalThis.createImageBitmap=previous.bitmap;}
}
function roomFixture(){
 const room=new T.Group(),clerk=new T.Group();clerk.userData.name='Thuan';clerk.userData.inMarket=true;room.add(clerk);
 buildConvenienceStore({room,clerk,box:(size,pos,color,parent)=>{const mesh=new T.Mesh(new T.BoxGeometry(...size),new T.MeshStandardMaterial({color}));mesh.position.set(...pos);parent.add(mesh);return mesh;},reg(){},collider(){},action(){}});
 const characters=createCharacters(),actor=characters.attach(clerk,'Thuan'),seat=STORE_SEATS[1],solids=[];
 room.updateMatrixWorld(true);
 // Read the rendered cushion and back, including their instance transforms.
 room.traverse(mesh=>{if(!mesh.isInstancedMesh)return;mesh.geometry.computeBoundingBox();for(let i=0;i<mesh.count;i++){
  const matrix=new T.Matrix4();mesh.getMatrixAt(i,matrix);matrix.premultiply(mesh.matrixWorld);const p=new T.Vector3().setFromMatrixPosition(matrix);
  if(Math.abs(p.x-seat.position[0])<.001&&Math.abs(p.z-seat.position[2])<.4&&(Math.abs(p.y-.45)<.001||Math.abs(p.y-.77)<.001)){const bounds=mesh.geometry.boundingBox.clone().applyMatrix4(matrix);bounds.expandByScalar(-.012);solids.push(bounds);}
 }});
 assert.equal(solids.length,2);return {room,clerk,characters,actor,seat,solids};
}

test('Thuan sits and stands against the rendered chair with planted feet, clear limbs and continuous movement',()=>setup(()=>{
 const {room,clerk,characters,actor,seat,solids}=roomFixture();
 const service=createStoreService({clerk,room,getSeat:()=>null,getMinutes:()=>1002,getBalance:()=>1000,pay:()=>true,say(){}});
 const phases=new Set(),feet=['LeftFoot','RightFoot'].map(n=>actor.model.getObjectByName(n)),bones=['Hips','Head','LeftHand','RightHand'].map(n=>actor.model.getObjectByName(n)),last=new Map(),anchors=new Map();
 let mesh;actor.model.traverse(o=>{if(o.isSkinnedMesh)mesh=o;});let previousPhase='',maxJointStep=0,jumpDetail='',largestSeatedLean=0;const p=new T.Vector3();
 for(let frame=1;frame<=55*60;frame++){
  const before=clerk.position.clone(),yaw=clerk.rotation.y;service.update(1/60);characters.update(1/60);room.updateMatrixWorld(true);phases.add(service.phase);
  const transition=['sit-down','stand'].includes(service.phase),seated=service.phase==='sit';
  const turn=Math.abs(Math.atan2(Math.sin(clerk.rotation.y-yaw),Math.cos(clerk.rotation.y-yaw)));
  assert.ok(turn<=2.6/60+.001,'No instantaneous body turns');
  const travel=clerk.position.clone().sub(before);if(travel.length()>.003&&!transition&&previousPhase!=='stand'){
   const direction=new T.Vector3(-Math.sin(clerk.rotation.y),0,-Math.cos(clerk.rotation.y));assert.ok(travel.normalize().dot(direction)>.93,'Face the walking direction instead of sliding sideways');
  }
  if(transition){
   if(previousPhase!==service.phase)anchors.clear();
   for(const foot of feet){const point=foot.getWorldPosition(new T.Vector3());if(!anchors.has(foot))anchors.set(foot,point.clone());assert.ok(point.distanceTo(anchors.get(foot))<.008,'Both feet remain planted during '+service.phase);}
  }
  for(const bone of bones){const point=bone.getWorldPosition(new T.Vector3());if(last.has(bone)&&['sit','sit-down','stand'].includes(previousPhase)){const step=point.distanceTo(last.get(bone));if(step>maxJointStep){maxJointStep=step;jumpDetail=bone.name+' at '+frame/60+' '+previousPhase+' to '+service.phase;}}last.set(bone,point);}
  if(seated){
   assert.ok(Math.abs(clerk.rotation.y-seat.yaw)<.001);const head=actor.model.getObjectByName('Head').getWorldPosition(new T.Vector3()),hip=actor.model.getObjectByName('Hips').getWorldPosition(new T.Vector3());largestSeatedLean=Math.max(largestSeatedLean,Math.hypot(head.x-hip.x,head.z-hip.z));
  }
  if((transition||seated||service.phase==='break-turn')&&frame%12===0){
   mesh.skeleton.update();let lowest=Infinity;
   for(let i=0;i<mesh.geometry.attributes.position.count;i++){
    mesh.getVertexPosition(i,p).applyMatrix4(mesh.matrixWorld);lowest=Math.min(lowest,p.y);
    assert.ok(!solids.some(box=>box.containsPoint(p)),`Body penetrates the rendered chair during ${service.phase} at ${frame/60}: ${p.toArray()}`);
   }
   if(transition||seated)assert.ok(lowest>.063&&lowest<.095,'Shoe soles meet the raised shop tiles during '+service.phase+' at '+frame/60+': '+lowest);
  }
  previousPhase=service.phase;
 }
 assert.ok(phases.has('sit-down')&&phases.has('sit')&&phases.has('stand')&&phases.has('return'),'Exercise the complete chair sequence');
 assert.ok(maxJointStep<.045,'No pose snap at the chair transition: '+maxJointStep+' '+jumpDetail);assert.ok(largestSeatedLean<.08,'Quiet upright idle throughout the loop');service.dispose();assert.equal(clerk.userData.chairBlend,undefined);assert.equal(clerk.userData.floorHeight,undefined);
}));

test('an earlier greeting cannot turn a seated Thuan backwards or drag her away from the chair',()=>setup(()=>{
 const {room,clerk,characters,seat}=roomFixture(),player=new T.Group();player.position.set(4,0,-2);room.add(player);characters.attach(player,'player');
 clerk.position.set(...STORE_CLERK_POSITION);characters.gesture(clerk);
 clerk.position.set(...seat.position);clerk.rotation.y=seat.yaw;clerk.userData.socialPose='Sit';clerk.userData.seatHeight=seat.height;
 characters.update(1/60);assert.deepEqual(clerk.position.toArray(),seat.position);assert.equal(clerk.rotation.y,seat.yaw);
 player.position.set(2,0,4);characters.update(1/60);assert.deepEqual(clerk.position.toArray(),seat.position);assert.equal(clerk.rotation.y,seat.yaw);
}));

test('the actual Thuan rig rests on the outdoor bench with grounded feet and no body penetration',()=>setup(()=>{
 const room=new T.Group(),clerk=new T.Group();clerk.userData.name='Thuan';room.add(clerk);
 clerk.position.set(STAFF_BENCH.stand[0],0,STAFF_BENCH.stand[1]);
 const built=buildStaffBench({parent:room,factory:createPropFactory({shadows:false})}),solids=[];
 room.updateMatrixWorld(true);built.group.traverse(mesh=>{if(mesh.isMesh){mesh.geometry.computeBoundingBox();solids.push(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld).expandByScalar(-.012));}});
 const characters=createCharacters(),actor=characters.attach(clerk,'Thuan'),routine=createStaffBenchRoutine({entity:clerk,seat:built.seat}),anchors=new Map();
 let mesh;actor.model.traverse(o=>{if(o.isSkinnedMesh)mesh=o;});const p=new T.Vector3();let previous='idle';const phases=new Set();
 for(let frame=0;frame<30*60;frame++){
  routine.update(1/60,frame<20*60);characters.update(1/60);room.updateMatrixWorld(true);const phase=routine.phase;phases.add(phase);
  if(['sit','stand'].includes(phase)){
   if(previous!==phase)anchors.clear();
   for(const name of ['LeftFoot','RightFoot']){const foot=actor.model.getObjectByName(name).getWorldPosition(new T.Vector3());if(!anchors.has(name))anchors.set(name,foot.clone());assert.ok(foot.distanceTo(anchors.get(name))<.009,'Planted feet during '+phase+' frame '+frame+' drift '+foot.distanceTo(anchors.get(name))+' '+foot.toArray()+' anchor '+anchors.get(name).toArray());}
  }
  if(['sit','rest','sleep','wake','stand'].includes(phase)&&frame%12===0){
   mesh.skeleton.update();let lowest=Infinity;
   for(let i=0;i<mesh.geometry.attributes.position.count;i++){
    mesh.getVertexPosition(i,p).applyMatrix4(mesh.matrixWorld);lowest=Math.min(lowest,p.y);
    assert.ok(!solids.some(box=>box.containsPoint(p)),`Body penetrates staff bench during ${phase}: ${p.toArray()}`);
   }
   assert.ok(lowest>.023&&lowest<.058,`Shoes touch the .04m paving during ${phase}: ${lowest}`);
  }
  previous=phase;
 }
 for(const phase of ['sit','rest','sleep','wake','stand','leave'])assert.ok(phases.has(phase),phase);
}));
