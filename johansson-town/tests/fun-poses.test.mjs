import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildAvatar,bodyVolume} from '../src/avatars/build.js';
import {recipeFor} from '../src/avatars/cast.js';
import {normalizeRecipe} from '../src/avatars/recipe.js';
import {createAvatarAnimator,GESTURES,STORY_POSES,FUN_POSES,STILL_AT} from '../src/avatars/animate.js';
import {EXPRESSION_NAMES} from '../src/avatars/face.js';
import {POSES} from '../src/photo/layout.js';
import {surface} from './body-contact.mjs';
installDOM();

/**
 * The funny poses (fun-poses.js; the creator, 2026-10-11: "And add more poses and funny expressions"): each on the body's
 * list of moves with what it is for and the face that goes with it, offered by World's photo studio (and so by Johansson
 * Studio, which reads World's list); and on every body, child to elder, slim to round, played as a move: smooth, the same
 * every time, the feet on the floor (or off it, jumping, and back), the mittens where the pose puts them and in nothing (the
 * head, the hair, the body, the legs).
 */
const base=recipeFor('Thuan'),BODIES=[];
for(const age of ['child','teen','adult','elder'])for(const build of [0,1])for(const proportion of ['classic','rounded'])
 BODIES.push([`${age}, build ${build}, ${proportion}`,normalizeRecipe({...base,name:`Poser ${age} ${build} ${proportion}`,age,body:{...base.body,build,proportion,height:build}}),'clothes']);
for(const [who,outfit] of [['Mr Fujita','clothes'],['Mrs Higa','clothes'],['Nhung','clothes'],['Tetsuo','afterbath']])BODIES.push([`${who} (${outfit})`,recipeFor(who),outfit]);
const NAMES=Object.keys(FUN_POSES),JUMPS=new Set(['JumpForJoy','StartledJump']);
/** The poses that leave the floor (fun-poses.js `airborne`): the two jumps, and up the pole. */
const AIRBORNE=new Set(NAMES.filter(name=>FUN_POSES[name].airborne));
/** When the still is taken: as World's photo studio and Johansson Studio take it. */
const stillAt=name=>Number.isFinite(GESTURES[name])?GESTURES[name]*STILL_AT:.7;

function seeded(seed=7){let s=seed;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};}
function body(recipe,outfit){
 const avatar=buildAvatar(recipe,{shadows:false});avatar.wear(outfit);const holder=new THREE.Group();holder.add(avatar.root);
 const rand=seeded(),own=fn=>{const o=Math.random;Math.random=rand;try{return fn();}finally{Math.random=o;}};
 const animator=own(()=>createAvatarAnimator(avatar,{random:rand}));
 const step=(n=1)=>{for(let i=0;i<n;i++){own(()=>animator.update(1/60,{}));avatar.springs?.update(1/60);}holder.updateMatrixWorld(true);};
 return {avatar,animator,step,m:avatar.measure};
}
/** How the mittens and forearms sit against their own body: the deepest any point of them goes into the drawn head (from
 *  the head's middle out through the point to the head's own mesh; metres, negative inside), how deep a mitten goes into the
 *  torso (as bodyVolume has it, where the hips and the chest have taken it) and into the legs (round limbs of the legs'
 *  thickness): metres, negative inside. And how near each mitten comes to the head (its own mesh, the hair, the ears). */
function selfContact(b){
 const {avatar,m}=b,vol=bodyVolume(avatar.recipe,m),bones=avatar.bones;avatar.root.updateMatrixWorld(true);
 const frames=[['hips',m.hipY],['chest',m.chestY]].map(([n,y])=>[bones[n].matrixWorld.clone().invert(),y]);
 const torso=p=>Math.min(...frames.map(([inv,y])=>{const v=p.clone().applyMatrix4(inv);v.y+=y;return vol.sdf(v);}));
 const legs=['L','R'].flatMap(s=>[[bones['thigh'+s],bones['knee'+s],m.legR],[bones['knee'+s],bones['foot'+s],m.legR*.9]]).map(([a,c,r])=>[new THREE.Line3(a.getWorldPosition(new THREE.Vector3()),c.getWorldPosition(new THREE.Vector3())),r]);
 const mesh=avatar.face.head,centre=bones.head.localToWorld(new THREE.Vector3(0,m.headCentre-m.headY,0)),ray=new THREE.Raycaster(),q=new THREE.Vector3();
 mesh.material.side=THREE.DoubleSide;
 const hair=surface(avatar,{only:n=>n==='head'}).map(a=>a.p);
 let head=Infinity,body=Infinity,leg=Infinity;const near={L:Infinity,R:Infinity};
 for(const {p,bone} of surface(avatar,{only:n=>/^(hand|elbow)[LR]$/.test(n)})){
  const d=p.clone().sub(centre),r=d.length();
  let gap=Infinity;if(r<m.Rh*1.6){ray.set(centre,d.normalize());const hit=ray.intersectObject(mesh,false)[0];if(hit){gap=r-hit.distance;head=Math.min(head,gap);}}
  if(bone.startsWith('hand')){body=Math.min(body,torso(p));for(const [l,lr] of legs)leg=Math.min(leg,l.closestPointToPoint(p,true,q).distanceTo(p)-lr);
   // how near the mitten is to the head: to its drawn surface straight out from its middle, or to the hair and the ears
   const s=bone.at(-1);near[s]=Math.min(near[s],gap);if(r<m.Rh*2)for(const h of hair)near[s]=Math.min(near[s],h.distanceTo(p));}
 }
 return {head,body,leg,near};
}
/** A body's mittens against its torso in the town's own poses that lay them by it (standing easy, hands on the hips). */
function reference(recipe,outfit){
 let body=Infinity;
 for(const name of ['Idle','HandsOnHips']){const b=pose(recipe,outfit,name==='Idle'?null:name);body=Math.min(body,selfContact(b).body);b.avatar.dispose();}
 return body;
}
/** A body on its mark, in `name` at the still (or standing). */
function pose(recipe,outfit,name){const b=body(recipe,outfit);b.step(20);if(name){b.animator.play(name);b.step(Math.round(stillAt(name)*60));}return b;}

test('every funny pose is on the body’s list with what it is for and its face, and World’s photo studio offers it',()=>{
 assert.ok(NAMES.length>=12,'a dozen of them: '+NAMES.length);
 for(const [name,p] of Object.entries(FUN_POSES)){
  assert.equal(GESTURES[name],p.d,name+' plays as a move');assert.ok(!STORY_POSES.has(name),name+' is not a story’s held pose');
  assert.ok(p.label?.length>2&&p.label.length<20,name+' has a short label');assert.ok(p.use?.length>40,name+' says when to use it');
  assert.ok(EXPRESSION_NAMES.includes(p.face),name+'’s face is one the face painter knows: '+p.face);
  assert.ok(POSES.includes(name),name+' is in the photo studio');
 }
});

test('on every body, at the still: in nothing (the head, the body, the legs), on the floor or jumping off it',()=>{
 const wrong=[];
 for(const [who,recipe,outfit] of BODIES){const ref=reference(recipe,outfit);
  for(const name of NAMES){
   const b=pose(recipe,outfit,name),c=selfContact(b),tag=`${name}, ${who}`;
   if(c.head<-.003)wrong.push(`${tag}: an arm ${(-c.head*1000).toFixed(0)} mm into the head`);
   if(c.body<Math.min(ref,0)-.004)wrong.push(`${tag}: a mitten ${(-c.body*1000).toFixed(0)} mm into the body (standing easy: ${(-ref*1000).toFixed(0)})`);
   if(c.leg<-.004)wrong.push(`${tag}: a mitten ${(-c.leg*1000).toFixed(0)} mm into a leg`);
   const low=Math.min(...surface(b.avatar,{only:n=>/^foot/.test(n)}).map(a=>a.p.y),...surface(b.avatar,{stride:3}).map(a=>a.p.y));
   if(AIRBORNE.has(name)?low<.02:Math.abs(low)>.004)wrong.push(`${tag}: ${AIRBORNE.has(name)?'not in the air':'off the floor'} (${(low*1000).toFixed(0)} mm)`);
   b.avatar.dispose();
  }
 }
 assert.deepEqual(wrong,[]);
});

test('the hands go where the pose says: on the cheeks, over the eyes, on the head, before the lips, at the brow',()=>{
 const HEAD={JawDrop:['L','R'],Facepalm:['R'],OhNo:['L','R'],HideFace:['L','R'],Shush:['R'],Salute:['R'],Swoon:['R']},wrong=[],gaps=[];
 // (a big round head on short arms reaches as near as it can: tested above for being in nothing)
 for(const [who,recipe,outfit] of BODIES.filter(([n])=>!n.includes('rounded')))for(const [name,sides] of Object.entries(HEAD)){
  const b=pose(recipe,outfit,name),c=selfContact(b);
  // within a mitten's thickness of the head everywhere, and on average closer
  for(const s of sides){if(c.near[s]>.05)wrong.push(`${name}, ${who}: the ${s} mitten ${(c.near[s]*1000).toFixed(0)} mm off the head`);gaps.push(c.near[s]);}
  b.avatar.dispose();
 }
 assert.deepEqual(wrong,[]);
 const mean=gaps.reduce((a,b)=>a+b,0)/gaps.length;assert.ok(mean<.03,'on average '+(mean*1000).toFixed(0)+' mm off the head');
});

test('each plays and lets go smoothly, the same every time, and the body is itself again after',()=>{
 const JOINTS=['hips','spine','chest','neck','head','shoulderL','elbowL','handL','shoulderR','elbowR','handR','thighL','kneeL','footL','thighR','kneeR','footR'],wrong=[];
 /** A move played on a body: the fastest any joint turns in a frame, the most the root moves in one, every frame, and how
  *  far from the body without the move the joints are a moment after it. */
 const play=(recipe,outfit,name)=>{const b=body(recipe,outfit),still=body(recipe,outfit);b.step(20);still.step(20);b.animator.play(name,Number.isFinite(GESTURES[name])?undefined:2.4);
  let prev=JOINTS.map(j=>b.avatar.bones[j].quaternion.clone()),prevY=b.avatar.root.position.y,fastest=0,jump=0;const frames=[];
  for(let f=0;f<Math.round((Math.min(GESTURES[name],2.4)+1.2)*60);f++){b.step();still.step();const now=JOINTS.map(j=>b.avatar.bones[j].quaternion.clone());
   now.forEach((q,i)=>fastest=Math.max(fastest,q.angleTo(prev[i])));jump=Math.max(jump,Math.abs(b.avatar.root.position.y-prevY));prev=now;prevY=b.avatar.root.position.y;frames.push(now.flatMap(q=>q.toArray()));}
  const off=Math.max(...JOINTS.map(j=>b.avatar.bones[j].quaternion.angleTo(still.avatar.bones[j].quaternion)));
  b.avatar.dispose();still.avatar.dispose();return {fastest,jump,off,frames};};
 for(const [who,recipe,outfit] of [BODIES[4],BODIES[11],BODIES.at(-4)]){
  // (a body's own way of standing comes undone as any move begins and comes back after: Fujita's hands behind his back. The
  // town's own photo pose with the hands at the cheeks says how fast that is on this body.)
  const ref=play(recipe,outfit,'DoubleCheek').fastest;
  for(const name of NAMES){const a=play(recipe,outfit,name),limit=JUMPS.has(name)||name==='FistPump'?.22:Math.max(.15,ref+.005);
   if(a.fastest>limit)wrong.push(`${name}, ${who}: a joint turns ${a.fastest.toFixed(3)} rad in a frame (up to ${limit.toFixed(3)})`);
   if(a.jump>.04)wrong.push(`${name}, ${who}: the body jumps ${a.jump.toFixed(3)} m in a frame`);
   if(a.off>.04)wrong.push(`${name}, ${who}: ${a.off.toFixed(3)} rad from where it would be without the pose`);
   assert.deepEqual(play(recipe,outfit,name).frames,a.frames,`${name}, ${who}: the same every time`);}
 }
 assert.deepEqual(wrong,[]);
});
