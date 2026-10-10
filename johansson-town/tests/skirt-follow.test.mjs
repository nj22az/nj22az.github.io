import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildAvatar} from '../src/avatars/build.js';
import {ORIGINAL_THUAN_RECIPE} from '../src/avatars/cast.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
installDOM();

test('original Thuận has no earrings or necklace',()=>{
 assert.equal(ORIGINAL_THUAN_RECIPE.accessories.earrings,'none');assert.equal(ORIGINAL_THUAN_RECIPE.accessories.neckwear,'none');
});
test('skirt front follows the thighs while the rear remains attached to the hips',()=>{
 const a=buildAvatar(ORIGINAL_THUAN_RECIPE,{shadows:false}),m=a.measure,g=a.body.geometry;
 const {position:P,skinIndex:I,skinWeight:W,towelFit:F}=g.attributes,waist=m.hipY+m.torso*.13,len=m.thigh*.9,front=[],rear=[];
 for(let i=0;i<P.count;i++){
  if(F.getX(i)!==2||P.getY(i)>waist-len*.85)continue;
  let legs=0;for(let k=0;k<4;k++)if(['thighL','thighR'].includes(a.body.skeleton.bones[I.array[i*4+k]].name))legs+=W.array[i*4+k];
  if(P.getZ(i)>m.depth*.3)front.push(legs);if(P.getZ(i)<-m.depth*.3)rear.push(legs);
 }
 assert.ok(front.length>10&&rear.length>10);assert.ok(front.every(w=>w>.8));assert.ok(rear.every(w=>w<.15));a.dispose();
});
test('seated front hem is supported continuously across the lap and stays finite',()=>{
 const a=buildAvatar(ORIGINAL_THUAN_RECIPE,{shadows:false}),anim=createAvatarAnimator(a),g=a.body.geometry,m=a.measure;
 for(let frame=0;frame<90;frame++)anim.update(1/60,{seated:true,seatHeight:.45});
 a.root.updateMatrixWorld(true);const fit=a.body.towelFit;fit.refresh();
 const P=g.attributes.position,F=g.attributes.towelFit,p=new THREE.Vector3(),rest=new THREE.Vector3();let checked=0;
 for(let i=0;i<P.count;i++){
  if(F.getX(i)!==2||P.getZ(i)<m.depth*.3||P.getY(i)>m.hipY+m.torso*.13-m.thigh*.9*.8)continue;
  rest.fromBufferAttribute(P,i);a.body.getVertexPosition(i,p);fit.fitPoint(p,2,rest);
  assert.ok(p.toArray().every(Number.isFinite));assert.ok(p.y>fit.uniforms.uSeat.value+m.legR*.9,'front cloth lies above, not under the thighs');checked++;
 }
 assert.ok(checked>10);a.dispose();
});
