import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {recipeFor} from '../src/avatars/cast.js';
import {normalizeRecipe,encodeRecipe,decodeRecipe,PARTS} from '../src/avatars/recipe.js';
import {buildAvatar,measure,bodyVolume} from '../src/avatars/build.js';
import {ribbonBodicePieces,ribbonSkirtGeometry} from '../src/avatars/ribbon-dress.js';
import {SIDEPART_WAVES} from '../src/avatars/sidepart-waves-data.js';
import {ISLAND_OUTFITS} from '../src/avatars/outfits.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
installDOM();
test('Thao wears the shared Blender dress, long waves and no earrings; share codes preserve them',()=>{
 const r=recipeFor('Thao');assert.equal(r.hair.style,'sidepartwaves');assert.equal(r.outfit.top,'ribbondress');assert.equal(r.outfit.bottom,'skirt');assert.equal(r.accessories.earrings,'none');
 assert.deepEqual(decodeRecipe(encodeRecipe(r)),r);assert.ok(PARTS.hair.includes('sidepartwaves'));assert.ok(PARTS.top.includes('ribbondress'));
 assert.ok(ISLAND_OUTFITS.some(o=>o.id==='thao-ribbon-dress'&&o.outfit.top==='ribbondress'));
});
test('Blender bodice/straps fit a range of actual torso volumes and leave skin above the neckline',()=>{
 for(const age of ['child','adult','elder'])for(const proportion of ['classic','studio'])for(const build of [0,1])for(const silhouette of ['feminine','masculine','neutral']){
  const r=normalizeRecipe({...recipeFor('Thao'),age,body:{build,proportion,silhouette}}),m=measure(r),v=bodyVolume(r,m),parts=ribbonBodicePieces(m,v);
  let min=Infinity;for(const part of parts){const P=part.geometry.attributes.position;
   for(let i=0;i<P.count;i++){const p=new THREE.Vector3().fromBufferAttribute(P,i);assert.ok(p.toArray().every(Number.isFinite));if(part.name.startsWith('Shoulder'))min=Math.min(min,v.sdf(p));}
   part.geometry.dispose();
  }
  assert.ok(min>-.00005,`${age}/${proportion}/${build}: strap clearance ${min}`);
 }
});
test('matching skirt has open waist/hem, bounded topology and outward surface normals',()=>{
 const m=measure(recipeFor('Thao')),g=ribbonSkirtGeometry(m),P=g.attributes.position,N=g.attributes.normal;
 assert.ok(g.index.count/3<1800);assert.ok(N.getZ(P.count-64)>.3,'Outside skirt faces outward');
 for(let i=0;i<P.count;i++){assert.ok(Math.hypot(P.getX(i),P.getZ(i))>m.width*.35);assert.ok([P.getY(i),N.getX(i),N.getY(i),N.getZ(i)].every(Number.isFinite));}g.dispose();
});
test('shared rig weights and clothing changes remain finite during walking and sitting',()=>{
 for(const name of ['Thao','Thuan','Johansson']){
  const r=normalizeRecipe({...recipeFor(name),hair:{style:'sidepartwaves'},outfit:ISLAND_OUTFITS.find(o=>o.id==='thao-ribbon-dress').outfit}),a=buildAvatar(r,{shadows:false}),anim=createAvatarAnimator(a),p=new THREE.Vector3();
  const w=a.body.geometry.attributes.skinWeight;for(let i=0;i<w.count;i++)assert.ok(Math.abs(w.getX(i)+w.getY(i)+w.getZ(i)+w.getW(i)-1)<1e-5);
  for(const state of [{speed:1.4},{speed:0,seated:true,seatHeight:.45}]){
   for(let i=0;i<30;i++)anim.update(1/30,state);a.root.updateMatrixWorld(true);a.body.skeleton.update();
   for(let i=0;i<a.body.geometry.attributes.position.count;i+=31){a.body.getVertexPosition(i,p);assert.ok(p.toArray().every(Number.isFinite));}
  }
  for(const outfit of ['swim','afterbath','clothes']){a.wear(outfit);assert.equal(a.outfit,outfit);}a.dispose();
 }
 const triangles=SIDEPART_WAVES.reduce((n,p)=>n+p.indices.length/3,0);assert.ok(triangles<9000);assert.ok(SIDEPART_WAVES.some(p=>p.kind==='tail'));
});
