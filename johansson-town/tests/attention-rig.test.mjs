import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {buildAvatar} from '../src/avatars/build.js';
import {recipeFor} from '../src/avatars/cast.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
import {attentionRigOn,createAttentionRig,ATTENTION_LIMITS as L} from '../src/avatars/attention-rig.js';
import {createFacing} from '../src/people/facing.js';
import {createNeighbourChats} from '../src/people/neighbour-chats.js';
import {PROFILES} from '../src/people/profiles.js';
import {installDOM} from './fixtures.mjs';

function rig(name='Thuan',parent=null){
 installDOM();const avatar=buildAvatar(recipeFor(name),{shadows:false});parent?.add(avatar.root);
 const attention=createAttentionRig(avatar);
 const reset=()=>{for(const j of ['chest','neck','head'])avatar.bones[j].rotation.set(0,0,0);};
 const target=(yaw=.8,pitch=0,d=2)=>avatar.root.localToWorld(new THREE.Vector3(Math.sin(yaw)*d,avatar.measure.headCentre-Math.tan(pitch)*d,Math.cos(yaw)*d));
 const step=(dt,point,options)=>{reset();return attention.update(dt,point,options);};
 return {avatar,attention,step,target};
}

test('attention remains an explicit URL prototype and accepts an explicit animator option',()=>{
 for(const search of ['','?eyes3d=1','?attention-rig=0'])assert.equal(attentionRigOn(search),false);
 for(const search of ['?attention-rig','?attention-rig=1&eyes3d=0'])assert.equal(attentionRigOn(search),true);
 const r=rig(),anim=createAvatarAnimator(r.avatar,{attentionRig:true,random:()=>.5,initialTime:0});
 for(let i=0;i<90;i++)anim.update(1/60,{gaze:r.target()});
 assert.ok(r.avatar.bones.neck.rotation.y>.1,'the existing neck bone participates');r.avatar.dispose();
});

test('eyes acknowledge first, the neck follows, and the chest joins a large turn last',()=>{
 const r=rig(),p=r.target(1.1),s=r.attention.state;
 for(let i=0;i<5;i++)r.step(1/60,p);
 assert.ok(s.look[0]>.1,'eyes have already moved');assert.equal(s.neckYaw,0);assert.equal(s.headYaw,0);assert.equal(s.chestYaw,0);
 for(let i=0;i<7;i++)r.step(1/60,p);
 assert.ok(s.neckYaw>.02);assert.ok(s.headYaw>.02);assert.equal(s.chestYaw,0);
 for(let i=0;i<18;i++)r.step(1/60,p);
 assert.ok(s.chestYaw>.01);
 r.step(1/60,p,{chest:false});assert.equal(s.chestYaw,0,'a newly occupied torso takes ownership immediately');assert.ok(s.neckYaw>.01,'the head may still acknowledge the partner');
 r.avatar.dispose();
});

test('the principal cast keeps attention within the specified joint and eye bounds',()=>{
 for(const name of ['Thuan','Johansson','Thao','Vy','Fujita']){
  const r=rig(name),s=r.attention.state;
  for(const sign of [-1,1]){
   const p=r.target(sign*1.5,sign*1.1);
   for(let i=0;i<150;i++){
    r.step(1/60,p);
    assert.ok(Math.abs(s.neckYaw)<=L.neckYaw+1e-9,name);
    assert.ok(Math.abs(s.headYaw)<=L.headYaw+1e-9,name);
    assert.ok(Math.abs(s.chestYaw)<=L.chestYaw+1e-9,name);
    assert.ok(s.neckPitch+s.headPitch>=-L.up-1e-9&&s.neckPitch+s.headPitch<=L.down+1e-9,name);
    assert.ok(s.look.every(n=>Number.isFinite(n)&&Math.abs(n)<=1),name);
   }
  }r.avatar.dispose();
 }
});

test('behind, distant and malformed targets cannot twist or poison a character',()=>{
 for(const point of [[0,1,-2],[0,1,20],[NaN,0,1],[0,Infinity,1],[1,2],null]){
  const r=rig();const p=point&&point.length===3&&point.every(Number.isFinite)?r.avatar.root.localToWorld(new THREE.Vector3(...point)):point;
  for(let i=0;i<120;i++)r.step(1/60,p);
  const s=r.attention.state;
  assert.equal(s.active,false,String(point));
  for(const j of ['chest','neck','head'])assert.ok(r.avatar.bones[j].rotation.toArray().slice(0,3).every(Number.isFinite));
  r.avatar.dispose();
 }
 const r=rig();const near=r.target(.6,0,.1);
 for(let i=0;i<120;i++)r.step(1/60,near);
 assert.equal(r.attention.state.active,false,'a point ten centimetres from the head is too close');r.avatar.dispose();
});

test('the same local target works under translated, rotated and scaled parents',()=>{
 const parent=new THREE.Group();parent.position.set(14,3,-8);parent.rotation.set(0,1.23,0);parent.scale.setScalar(1.2);
 const a=rig(),b=rig('Thuan',parent),pa=a.target(.55,-.12),pb=b.target(.55,-.12);
 for(let i=0;i<180;i++){a.step(1/60,pa);b.step(1/60,pb);}
 for(const key of ['neckYaw','headYaw','chestYaw','neckPitch','headPitch'])assert.ok(Math.abs(a.attention.state[key]-b.attention.state[key])<1e-8,key);
 a.avatar.dispose();b.avatar.dispose();
});

test('release returns to neutral; a task takes immediate ownership without a stored turn',()=>{
 const r=rig(),p=r.target(),s=r.attention.state;
 for(let i=0;i<100;i++)r.step(1/60,p);
 const turned=s.neckYaw;r.step(1/60,null);assert.ok(s.neckYaw>0&&s.neckYaw<turned,'release eases');
 for(let i=0;i<180;i++)r.step(1/60,null);
 assert.ok(Math.abs(s.neckYaw)+Math.abs(s.headYaw)+Math.abs(s.chestYaw)<1e-5);
 for(let i=0;i<100;i++)r.step(1/60,p);
 assert.equal(r.step(1/60,p,{locked:true}),null);assert.equal(s.neckYaw+s.headYaw+s.chestYaw,0);
 assert.equal(r.step(1/60,null),null);r.avatar.dispose();
});

test('frame-rate variation keeps the settled result and per-step angular speed bounded',()=>{
 const results=[];
 for(const dt of [1/30,1/60,1/120]){
  const r=rig(),p=r.target(1.1,-.2),s=r.attention.state;
  for(let i=0;i<Math.round(2/dt);i++){const previous=s.neckYaw;r.step(dt,p);assert.ok(Math.abs(s.neckYaw-previous)<=95*Math.PI/180*dt+1e-9);}
  results.push([s.neckYaw,s.headYaw,s.chestYaw]);r.avatar.dispose();
 }
 for(const row of results)for(let i=0;i<3;i++)assert.ok(Math.abs(row[i]-results[0][i])<.002);
});

test('seated attention uses the actual head position, and occupied torsos stay still',()=>{
 const r=rig(),anim=createAvatarAnimator(r.avatar,{attentionRig:true,random:()=>.5,initialTime:0});
 for(let i=0;i<120;i++)anim.update(1/60,{seated:true,seatHeight:.6,pose:'Sit'});
 const head=r.avatar.bones.head.localToWorld(new THREE.Vector3(0,r.avatar.measure.headCentre-r.avatar.measure.headY,0));
 const p=r.avatar.root.localToWorld(new THREE.Vector3(1,r.avatar.measure.headCentre,2));p.y=head.y;
 for(let i=0;i<120;i++)anim.update(1/60,{seated:true,seatHeight:.6,pose:'Sit',gaze:p});
 const pitch=r.avatar.bones.neck.rotation.x+r.avatar.bones.head.rotation.x;
 assert.ok(Math.abs(pitch)<.12,'a level seated partner does not require looking upward');
 assert.ok(Math.abs(r.avatar.bones.chest.rotation.y)<.001,'the seat retains the torso');r.avatar.dispose();
});

test('performance poses, sleep and an explicit face direction retain priority',()=>{
 for(const pose of ['Read','Drink','Type','Sleep']){
  const a=rig(),b=rig(),aa=createAvatarAnimator(a.avatar,{attentionRig:true,random:()=>.5,initialTime:0}),bb=createAvatarAnimator(b.avatar,{attentionRig:false,random:()=>.5,initialTime:0});
  for(let i=0;i<45;i++){aa.update(1/60,{pose,sleeping:pose==='Sleep',gaze:a.target(1)});bb.update(1/60,{pose,sleeping:pose==='Sleep'});}
  for(const key of ['neck','head','chest'])assert.ok(a.avatar.bones[key].quaternion.angleTo(b.avatar.bones[key].quaternion)<1e-7,pose+' '+key);
  a.avatar.dispose();b.avatar.dispose();
 }
 const r=rig(),anim=createAvatarAnimator(r.avatar,{attentionRig:true,random:()=>.5,initialTime:0});
 for(let i=0;i<60;i++)anim.update(1/60,{gaze:r.target(),look:[-.2,.3]});
 assert.deepEqual(r.avatar.faceState.look,[-.2,.3]);r.avatar.dispose();
});

test('whole-body facing waits for the look, then turns; an occupied body remains fixed',()=>{
 const g=new THREE.Group();g.userData.playerConversation=true;
 const pass=createFacing({world:{people:[{g}]},getPlayerPosition:()=>new THREE.Vector3(-2,0,-2),attentionRig:true});
 for(let i=0;i<12;i++)pass.update(1/60);
 assert.equal(g.rotation.y,0);assert.ok(g.userData.lookTarget);
 for(let i=0;i<20;i++)pass.update(1/60);
 assert.ok(g.rotation.y>.1);g.userData.restocking=true;const held=g.rotation.y;
 for(let i=0;i<60;i++)pass.update(1/60);
 assert.equal(g.rotation.y,held);
});

test('ending a street-neighbour conversation releases its facing target',()=>{
 const g=new THREE.Group();g.userData.playerConversation=true;
 const pass=createFacing({world:{neighbours:[g]},getPlayerPosition:()=>new THREE.Vector3(0,0,-2),attentionRig:true});
 pass.update(.1);assert.ok(g.userData.lookTarget);delete g.userData.playerConversation;
 pass.update(.1);assert.equal(g.userData.lookTarget,undefined);assert.equal(g.userData.lookSource,undefined);
});

test('ambient conversations also wait for the look and use the seated partner actual head',()=>{
 const a=rig('Chin'),b=rig('Tetsuo'),scene=new THREE.Scene();
 const people=[a,b].map((r,i)=>{
  const g=new THREE.Group();g.position.set(i*1.5,0,-4);g.add(r.avatar.root);scene.add(g);g.userData.character={avatar:r.avatar};
  return {g,profile:{...PROFILES.find(p=>p.name===(i?'Tetsuo':'Chin')),height:3}};
 });
 const seated=createAvatarAnimator(b.avatar,{attentionRig:true,random:()=>.5,initialTime:0});
 for(let i=0;i<90;i++)seated.update(1/60,{seated:true,seatHeight:.6,pose:'Sit'});
 people[1].g.userData.seatHeight=.6;globalThis.location.search='?attention-rig';
 try{
  const chats=createNeighbourChats({world:{people},observer:()=>new THREE.Vector3(),random:()=>.5});
  chats.update(2,1002);assert.ok(chats.current);chats.update(.1,1002);
  assert.equal(people[0].g.rotation.y,0,'the standing partner waits for the eyes and neck');
  const expected=b.avatar.bones.head.localToWorld(new THREE.Vector3(0,b.avatar.measure.headCentre-b.avatar.measure.headY,0));
  assert.ok(new THREE.Vector3(...people[0].g.userData.lookTarget).distanceTo(expected)<1e-9,'the actual seated rig wins over an approximate profile height');
  chats.update(.2,1002);assert.ok(Math.abs(people[0].g.rotation.y)>.1);assert.equal(people[1].g.rotation.y,0,'the seated partner keeps the seat direction');
  chats.cancel();assert.equal(people[0].g.userData.lookTarget,undefined);
 }finally{delete globalThis.location.search;a.avatar.dispose();b.avatar.dispose();}
});

test('ordinary URLs keep the previous animator behaviour',()=>{
 const a=rig(),b=rig(),options={random:()=>.5,initialTime:0};
 const aa=createAvatarAnimator(a.avatar,options),bb=createAvatarAnimator(b.avatar,{...options,attentionRig:false}),point=a.target(.6,-.1);
 for(let i=0;i<60;i++){aa.update(1/60,{gaze:point});bb.update(1/60,{gaze:point});}
 for(const key of ['neck','head','chest'])assert.ok(a.avatar.bones[key].quaternion.angleTo(b.avatar.bones[key].quaternion)<1e-7,key);
 a.avatar.dispose();b.avatar.dispose();
});
