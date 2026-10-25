import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {withThuanSwimsuit,adoptResidentAppearance,saveResidentRecipe,WARDROBE_KEY} from '../src/avatars/wardrobe.js';
import {playerRecipe,PLAYER_RECIPE_KEY} from '../src/avatars/actors.js';
import {normalizeRecipe,encodeRecipe,decodeRecipe} from '../src/avatars/recipe.js';
import {buildAvatar,swimwearStyle,wearsSwimTop} from '../src/avatars/build.js';
import {recipeFor,RESIDENT_NAMES} from '../src/avatars/cast.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
installDOM();
const swimOf=a=>a.root.getObjectByName('Shimanchu swimwear');

test('automatic swimwear gives male bodies trunks and female bodies a swimsuit regardless of hair or facial features',()=>{
 for(const hair of ['bald','braids','long','buzz'])for(const beard of ['none','beard'])for(const silhouette of ['masculine','feminine']){
  const r=normalizeRecipe({body:{silhouette},hair:{style:hair},facial:{beard},mouth:{colour:'#cc3d52'}});
  assert.equal(wearsSwimTop(r),silhouette==='feminine');assert.equal(swimwearStyle(r),silhouette==='feminine'?'onepiece':'trunks');
 }
 for(const name of RESIDENT_NAMES){const r=recipeFor(name);assert.equal(wearsSwimTop(r),r.body.silhouette==='feminine',name);}
 assert.equal(swimwearStyle(normalizeRecipe({})),'trunks');
});

test('swimwear choice and colour survive designs/share codes, with an automatic default for old saves',()=>{
 assert.equal(normalizeRecipe({swim:{colour:'#cc3344'}}).swim.style,'auto');assert.equal(normalizeRecipe({swim:{style:'invalid'}}).swim.style,'auto');
 for(const style of ['auto','trunks','onepiece','skirted']){
  const r=normalizeRecipe({body:{silhouette:'feminine'},swim:{style,colour:'#cc3344'}});assert.deepEqual(decodeRecipe(encodeRecipe(r)),r);
  if(style!=='auto')assert.equal(swimwearStyle(r),style);
 }
});

test('every resident has the correct visible swimming garment, chest coverage and bare lower legs',()=>{
 for(const name of RESIDENT_NAMES){
  const r=recipeFor(name),a=buildAvatar(r,{faceSize:32,shadows:false});a.wear('swim');const mesh=swimOf(a),m=a.measure,P=mesh.geometry.attributes.position,C=mesh.geometry.attributes.color;
  assert.equal(mesh.userData.swim.style,swimwearStyle(r));assert.ok(mesh.visible&&!a.body.visible);assert.ok(!a.skirt?.visible);assert.equal(a.recipe.outfit.top,r.outfit.top);
  const target=new THREE.Color(wearsSwimTop(r)?r.swim.colour:r.body.skin),v=new THREE.Color();let chest=0;
  for(let i=0;i<P.count;i++)if(P.getY(i)>m.hipY+m.torso*.30&&P.getY(i)<m.hipY+m.torso*.55&&Math.abs(P.getX(i))<m.width*.4&&P.getZ(i)>m.depth*.20){
   v.fromBufferAttribute(C,i);assert.ok(Math.abs(v.r-target.r)+Math.abs(v.g-target.g)+Math.abs(v.b-target.b)<1e-5,`${name}: wrong chest garment`);chest++;
  }
  assert.ok(chest>10,name+' chest sampled');
  const skin=new THREE.Color(r.body.skin);let lower=0;
  for(let i=0;i<P.count;i++)if(P.getY(i)<m.hipY-m.thigh*.7&&P.getY(i)>m.hipY-m.thigh*.85){v.fromBufferAttribute(C,i);assert.ok(Math.abs(v.r-skin.r)+Math.abs(v.g-skin.g)+Math.abs(v.b-skin.b)<1e-5,`${name}: cloth below the swimming hem`);lower++;}
  assert.ok(lower>10,name+' lower legs sampled');
  const anim=createAvatarAnimator(a),p=new THREE.Vector3(),rest=new THREE.Vector3();
  for(const state of [{speed:1.3},{seated:true,seatHeight:.22,seatFront:.15}]){
   for(let frame=0;frame<30;frame++)anim.update(1/60,state);a.root.updateMatrixWorld(true);mesh.skeleton.update();mesh.towelFit?.refresh();
   for(let i=0;i<P.count;i+=43){mesh.getVertexPosition(i,p);if(mesh.geometry.attributes.towelFit?.getX(i)>.5)mesh.towelFit.fitPoint(p,1,rest.fromBufferAttribute(P,i));assert.ok(p.toArray().every(Number.isFinite));}
  }
  const count=a.root.children.length;for(let n=0;n<3;n++){a.wear('clothes');a.wear('swim');}assert.equal(a.root.children.length,count);a.wear('clothes');assert.ok(a.body.visible&&!mesh.visible);a.dispose();
 }
});

test('all swimwear cuts fit body extremes without non-finite geometry or an unbounded mesh',()=>{
 for(const age of ['child','teen','adult','elder'])for(const proportion of ['classic','studio'])for(const build of [0,1])for(const style of ['trunks','onepiece','skirted']){
  const a=buildAvatar(normalizeRecipe({age,body:{proportion,build},swim:{style}}),{faceSize:16,shadows:false});a.wear('swim');const g=swimOf(a).geometry,P=g.attributes.position;
  assert.ok(P.count<70000);for(let i=0;i<P.count;i+=19)assert.ok([P.getX(i),P.getY(i),P.getZ(i)].every(Number.isFinite));a.dispose();
 }
});

test('Thuan explicitly wears a one-piece; old resident/player looks retain their identity during the swimwear-only upgrade',()=>{
 assert.equal(recipeFor('Thuan').swim.style,'onepiece');
 const old=normalizeRecipe({...recipeFor('Thuan'),body:{...recipeFor('Thuan').body,build:.72},swim:{style:'trunks',colour:'#cc3344'},profile:{catchphrase:'My own phrase'}});
 const expected=withThuanSwimsuit(old);assert.equal(expected.swim.style,'onepiece');assert.deepEqual(expected.body,old.body);assert.deepEqual(expected.profile,old.profile);assert.deepEqual(expected.outfit,old.outfit);
 const store=new Map([[WARDROBE_KEY,JSON.stringify({Thuan:encodeRecipe(old)})],[PLAYER_RECIPE_KEY,encodeRecipe(old)]]),storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))};
 assert.deepEqual(adoptResidentAppearance('Thuan',recipeFor('Thuan'),storage),expected);assert.deepEqual(playerRecipe(storage),expected);
 const later={...expected,swim:{...expected.swim,colour:'#3388bb'}};saveResidentRecipe('Thuan',later,storage);assert.equal(adoptResidentAppearance('Thuan',recipeFor('Thuan'),storage).swim.colour,'#3388bb');assert.equal(adoptResidentAppearance('Thuan',recipeFor('Thuan'),storage).swim.style,'onepiece');
});
