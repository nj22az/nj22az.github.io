import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildAvatar} from '../src/avatars/build.js';
import {normalizeRecipe} from '../src/avatars/recipe.js';
import {recipeFor} from '../src/avatars/cast.js';
import {skirtSpec} from '../src/avatars/skirt-shape.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
installDOM();
const meshFor=a=>a.skirt||a.body;
function pose(a,l,r,spread=0){a.bones.thighL.rotation.set(l,0,spread);a.bones.thighR.rotation.set(r,0,-spread);a.root.updateMatrixWorld(true);a.body.skeleton.update();return meshFor(a).towelFit.refresh();}
function fitted(a,rest){const mesh=meshFor(a),p=rest.clone().applyMatrix4(mesh.towelFit.uniforms.uHipsInv.value);return mesh.towelFit.fitPoint(p,2,rest).applyMatrix4(mesh.towelFit.uniforms.uHips.value);}

test('alternating legs move the corresponding sides of the actual shared skirt instead of cancelling to a stationary hoop',()=>{
 const a=buildAvatar(normalizeRecipe({outfit:{bottom:'pleatedskirt'}}),{faceSize:64,shadows:false}),s=skirtSpec(a.measure,'pleatedskirt');
 const L=new THREE.Vector3(s.hemR*.95,s.waist-s.length,0),R=L.clone();R.x*=-1;
 const neutralL=fitted(a,L),neutralR=fitted(a,R),u=pose(a,.45,-.45),delta=u.uLegB.value[0].z-u.uLegA.value[0].z;
 const left=fitted(a,L).z-neutralL.z,right=fitted(a,R).z-neutralR.z;
 assert.ok(left*delta>0&&right*delta<0,'each side follows its own leg');
 assert.ok(Math.abs(left/delta)>.55,'cloth follows more than half the leading thigh excursion; the former averaged surface fails this');
 assert.ok(Math.abs(left/right)>0.8&&Math.abs(left/right)<1.25,'opposite strides remain balanced');
 pose(a,-.45,.45);assert.ok((fitted(a,L).z-neutralL.z)*left<0,'opposite stride reverses the cloth continuously');a.dispose();
});

test('the waistband stays attached to the hips through strides and a body turn, for every shared skirt construction',()=>{
 for(const [bottom,skirtCut] of [['skirt','classic'],['skirt','panel'],['pleatedskirt','classic'],['pleatedskirt','pressed'],['longskirt','classic']]){
  const a=buildAvatar(normalizeRecipe({outfit:{bottom,skirtCut}}),{faceSize:64,shadows:false}),s=skirtSpec(a.measure,bottom),rest=new THREE.Vector3(s.waistR*1.03,s.waist,0);
  pose(a,0,0);const before=fitted(a,rest);
  a.bones.hips.rotation.y=.6;pose(a,.5,-.5,.12);const after=fitted(a,rest);
  assert.ok(before.distanceTo(after)<1e-5,`${bottom}/${skirtCut}: waist moves in the hips' own frame`);a.dispose();
 }
});

test('short, panel, pleated, pressed and long skirts retain finite continuous fitted edges through a moving stride across wearers',()=>{
 const p=new THREE.Vector3(),r=new THREE.Vector3();
 for(const age of ['child','adult','elder'])for(const proportion of ['classic','studio'])for(const [bottom,skirtCut] of [['skirt','classic'],['skirt','panel'],['pleatedskirt','classic'],['pleatedskirt','pressed'],['longskirt','classic']]){
  const a=buildAvatar(normalizeRecipe({age,body:{proportion,build:age==='elder'?1:.3},outfit:{bottom,skirtCut}}),{faceSize:32,shadows:false}),mesh=meshFor(a),g=mesh.geometry,P=g.attributes.position,F=g.attributes.towelFit;
  const samples=[];for(let i=0;i<P.count;i++)if(F?.getX(i)===2&&(samples.length===0||i-samples.at(-1)>50))samples.push(i);
  assert.ok(samples.length>12);let previous=null;
  for(let frame=0;frame<=24;frame++){
   const t=frame/24*Math.PI*2;pose(a,Math.sin(t)*.5,-Math.sin(t)*.5,Math.sin(t)*.07);const positions=[];
   for(const i of samples){r.fromBufferAttribute(P,i);mesh.getVertexPosition(i,p);mesh.towelFit.fitPoint(p,2,r);assert.ok(p.toArray().every(Number.isFinite));positions.push(p.clone());}
   if(previous)for(let i=0;i<positions.length;i++)assert.ok(positions[i].distanceTo(previous[i])<a.measure.H*.11,`${age}/${proportion}/${bottom}: one-frame pop`);
   previous=positions;
  }a.dispose();
 }
});

test('temporary sailor and shopping skirts use their own dimensions, continuous cloth fit, fitted ink and shadow',()=>{
 for(const name of ['Thuan','Vy','Johansson']){
  const a=buildAvatar(recipeFor(name),{shadows:false,faceSize:64});
  for(const outfit of ['sailor','nozomi','sailor']){
   a.wear(outfit);const mesh=a.root.children.find(o=>o.isSkinnedMesh&&o.visible&&o!==a.body&&!o.userData.outline&&o.towelFit);
   assert.ok(mesh,`${name}/${outfit}: missing continuous skirt fit`);assert.ok(mesh.customDepthMaterial);const P=mesh.geometry.attributes.position,F=mesh.geometry.attributes.towelFit;
   let top=-Infinity,cloth=0;for(let i=0;i<P.count;i++)if(F.getX(i)===2){top=Math.max(top,P.getY(i));cloth++;}
   assert.ok(cloth>100);assert.ok(Math.abs(top-mesh.towelFit.uniforms.uSkirt.value.x)<.006*a.measure.k,'fit waist matches the actual uniform, not the previous panel skirt');
   const anim=createAvatarAnimator(a);for(let i=0;i<30;i++)anim.update(1/60,{speed:1.3});a.root.updateMatrixWorld(true);mesh.towelFit.refresh();
  }a.dispose();
 }
});
