import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {blankFabric,normalizeFabric,fillFabric,strokeFabric,fabricColour} from '../src/avatars/fabric.js';
import {normalizeRecipe,encodeRecipe,decodeRecipe} from '../src/avatars/recipe.js';
import {pressedSkirtGeometry} from '../src/avatars/pressed-skirt.js';
import {measure,buildAvatar,bodyVolume} from '../src/avatars/build.js';
import {recipeFor} from '../src/avatars/cast.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
import {installDOM} from './fixtures.mjs';
import {putOnSet} from '../src/avatars/wardrobe-catalogue.js';
import {ISLAND_OUTFITS} from '../src/avatars/outfits.js';
installDOM();

test('untrusted fabric data is bounded and portable, while old looks remain opt-out',()=>{
 assert.equal(normalizeRecipe({}).outfit.topFabric,null);
 for(const value of [{},{palette:['red'],pixels:'.'.repeat(256)},{palette:['#ffffff'],pixels:'1'.repeat(256)},{palette:['#ffffff'],pixels:'0'.repeat(257)}, {palette:Array(17).fill('#ffffff'),pixels:'0'.repeat(256)}])assert.equal(normalizeFabric(value),null);
 const tile=blankFabric();tile.pixels=strokeFabric(tile.pixels,0,255,'2');
 const r=normalizeRecipe({...recipeFor('Thuan'),outfit:{top:'blouse',topFabric:tile,bottom:'pleatedskirt',skirtCut:'pressed',skirtFabric:tile}});
 assert.deepEqual(decodeRecipe(encodeRecipe(r)),r);assert.ok(encodeRecipe(r).length<7000);
 assert.equal(normalizeFabric({...tile,repeat:Infinity}).repeat,4);
 assert.equal(normalizeFabric({...tile,repeat:1000}).repeat,8);
});

test('flood fills stay inside their region; fast strokes are continuous and transparent cells follow the garment colour',()=>{
 const wall=Array.from({length:256},(_,i)=>i%16===8?'1':'.').join('');
 const fill=fillFabric(wall,0,'2');assert.equal(fill[7],'2');assert.equal(fill[8],'1');assert.equal(fill[9],'.');assert.equal(fill[255],'.');
 assert.equal(fillFabric('.'.repeat(256),0,'2'),'2'.repeat(256));
 const line=strokeFabric('.'.repeat(256),0,255,'2');for(let i=0;i<16;i++)assert.equal(line[i*17],'2');
 const tile=blankFabric();assert.equal(fabricColour(tile,-.2,1.2,'#abcdef'),'#abcdef');tile.pixels='2'.repeat(256);assert.equal(fabricColour(tile,0,0,'#abcdef'),tile.palette[2]);
});

test('pressed pleats preserve open waist/hem, distinct front and seat shaping, finite UVs and a bounded mesh',()=>{
 const r=normalizeRecipe({...recipeFor('Thuan'),outfit:{...recipeFor('Thuan').outfit,bottom:'pleatedskirt',skirtCut:'pressed'}}),m=measure(r),g=pressedSkirtGeometry(m),P=g.attributes.position,N=g.attributes.normal,UV=g.attributes.uv;
 assert.ok(g.index.count/3<2600);assert.equal(P.count,13*97);
 for(let i=0;i<P.count;i++){assert.ok([P.getX(i),P.getY(i),P.getZ(i),N.getX(i),N.getY(i),N.getZ(i),UV.getX(i),UV.getY(i)].every(Number.isFinite));assert.ok(Math.hypot(P.getX(i),P.getZ(i))>m.hips*.25);}
 // At the front exterior, normals face outwards, rather than inside the skirt.
 assert.ok(N.getZ(5*97)>.5);
 for(let j=0;j<13;j++){const a=j*97,b=a+96;assert.ok(Math.abs(P.getX(a)-P.getX(b))<1e-6);assert.ok(Math.abs(N.getZ(a)-N.getZ(b))<1e-6);}
 const front=P.getZ(6*97),back=-P.getZ(6*97+48);assert.ok(back>front);g.dispose();
});

test('pressed garment fits actual upper bodies and uses existing shared rig, cloth fit and outfit switching',()=>{
 const p=new THREE.Vector3(),rest=new THREE.Vector3();
 for(const age of ['child','adult','elder'])for(const proportion of ['classic','studio'])for(const build of [0,1]){
  const r=normalizeRecipe({age,body:{proportion,build},outfit:{top:'tee',bottom:'pleatedskirt',skirtCut:'pressed',skirtFabric:{...blankFabric(),pixels:'2'.repeat(256)}}}),m=measure(r),vol=bodyVolume(r,m),geo=pressedSkirtGeometry(m);
  for(let i=2*97;i<6*97;i++){p.fromBufferAttribute(geo.attributes.position,i);assert.ok(vol.sdf(p)>-.004*m.k,`${age}/${proportion}/${build}: fitted upper skirt penetrates at ${i}: ${vol.sdf(p)}`);}geo.dispose();
  const a=buildAvatar(r,{faceSize:64,shadows:false}),mesh=a.skirt;assert.ok(mesh?.isSkinnedMesh);assert.equal(mesh.skeleton,a.body.skeleton);assert.ok(mesh.material.map?.isDataTexture);
  const weights=mesh.geometry.attributes.skinWeight;for(let i=0;i<weights.count;i++)assert.ok(Math.abs(weights.getX(i)+weights.getY(i)+weights.getZ(i)+weights.getW(i)-1)<1e-5);
  const anim=createAvatarAnimator(a);
  for(const pose of ['Walk','Run','Sit']){anim.play(pose);for(let frame=0;frame<45;frame++){anim.update(1/60,{speed:pose==='Walk'?1.1:pose==='Run'?3.8:0,running:pose==='Run',seated:pose==='Sit',seatHeight:.3,seatFront:.18});a.root.updateMatrixWorld(true);mesh.towelFit.refresh();for(let i=0;i<mesh.geometry.attributes.position.count;i+=73){mesh.getVertexPosition(i,p);mesh.towelFit.fitPoint(p,2,rest.fromBufferAttribute(mesh.geometry.attributes.position,i));assert.ok(p.toArray().every(Number.isFinite));}}}
  a.wear('swim');assert.equal(mesh.visible,false);a.wear('clothes');assert.equal(mesh.visible,true);a.dispose();
 }
});

test('complete outfit sets and temporary uniforms do not inherit the old garments fabric',()=>{
 const tile={...blankFabric(),pixels:'2'.repeat(256)},r=normalizeRecipe({...recipeFor('Thuan'),outfit:{top:'blouse',bottom:'pleatedskirt',skirtCut:'pressed',topFabric:tile,skirtFabric:tile}});
 const next=putOnSet(r.outfit,ISLAND_OUTFITS.find(s=>s.id==='harbour-polo'));assert.equal(next.topFabric,null);assert.equal(next.skirtFabric,null);
 const partial=putOnSet(r.outfit,{outfit:{hat:'cap'}});assert.deepEqual(partial.topFabric,tile);
 const a=buildAvatar(r,{shadows:false,faceSize:64});a.wear('sailor');const uniform=a.root.getObjectByName('Thuan · harbour academy sailor');assert.ok(!uniform.material.userData.garment.marks.includes('custom-fabric'));a.wear('afterbath');const bath=a.root.children.find(o=>o.userData?.afterbath);assert.ok(bath&&!bath.material.userData.garment.marks.includes('custom-fabric'));a.dispose();
});
