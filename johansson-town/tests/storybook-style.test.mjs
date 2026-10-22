import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {installDOM} from './fixtures.mjs';
import {buildAvatar,BONES,measure} from '../src/avatars/build.js';
import {normalizeRecipe,encodeRecipe,decodeRecipe,seeded,randomRecipe} from '../src/avatars/recipe.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
import {poseAvatarConsumption,fitAvatarHeldProp} from '../src/avatars/consume.js';
import {faceLayout} from '../src/avatars/face.js';
import {shapeHeadPoint} from '../src/avatars/head-profile.js';
import {seatContactHeight} from './seating-contact.mjs';
import * as T from '../vendor/three.module.js';
installDOM();
const baseline=JSON.parse(readFileSync(new URL('../../avatar-creator/docs/qa/identity-v1/baseline-recipes.json',import.meta.url)));
const digest=a=>{const h=createHash('sha256');for(const mesh of [a.body,a.face.head])for(const key of ['position','normal','skinIndex','skinWeight']){const v=mesh.geometry.attributes[key];if(v)h.update(new Uint8Array(v.array.buffer,v.array.byteOffset,v.array.byteLength));}return h.digest('hex');};
for(const row of baseline){
 test(row.name+': default geometry and measurements match frozen main',()=>{
  const a=buildAvatar(row.recipe,{shadows:false});assert.deepEqual(a.measure,row.measure);assert.equal(digest(a),row.geometrySHA256);a.dispose();
 });
 for(const style of ['island-storybook-v1','island-storybook-v2'])test(row.name+': '+style+': opt-in study preserves recipe, skeleton contracts and finite motion',()=>{
  const recipe=normalizeRecipe(row.recipe),saved=JSON.stringify(recipe),a=buildAvatar(recipe,{shadows:false,renderStyle:style});
  assert.equal(JSON.stringify(recipe),saved);assert.deepEqual(a.recipe,recipe);assert.deepEqual(decodeRecipe(encodeRecipe(a.recipe)),recipe);
  assert.deepEqual(a.body.skeleton.bones.map(b=>b.name),BONES);assert.equal(a.measure.H,row.measure.H);assert.equal(a.measure.hand,row.measure.hand);
  if(style==='island-storybook-v1')assert.equal(a.measure.Rh,row.measure.Rh);else assert.ok(a.measure.Rh<row.measure.Rh);assert.ok(a.measure.neck>row.measure.neck);assert.notEqual(digest(a),row.geometrySHA256);
  const classic=buildAvatar(recipe,{shadows:false});for(const name of BONES)assert.equal(a.bones[name].parent?.name,classic.bones[name].parent?.name);classic.dispose();
  const group=new T.Group();group.add(a.root);a.root.rotation.y=0;const anim=createAvatarAnimator(a,{random:seeded('qa'),initialTime:0});
  for(const state of [{speed:.7},{seated:true,seatHeight:.45,seatFront:.19}])for(let f=0;f<60;f++){
   anim.update(1/30,state);a.root.updateMatrixWorld(true);assert.ok(a.root.position.toArray().every(Number.isFinite));for(const b of Object.values(a.bones))assert.ok(b.matrixWorld.elements.every(Number.isFinite));
  }
  assert.ok(Math.abs(seatContactHeight(a)-.45)<1e-5,'Seated support remains on the seat surface');
  // Both the existing reach solver and the held prop consume the new head/shoulder measurements.
  const tea=new T.Group();tea.userData={grip:{radius:.034,height:.04},rimHeight:.075,portion:1};a.bones.handR.add(tea);
  for(const lift of [0,.25,.5,.75,1]){poseAvatarConsumption(a,lift,false,tea);fitAvatarHeldProp(a,tea,lift);a.root.updateMatrixWorld(true);assert.ok(tea.matrixWorld.elements.every(Number.isFinite));}
  const m=a.measure,L=faceLayout(recipe),theta=Math.PI*.28+L.mouthY/256*Math.PI*.58,phi=Math.PI/2-.95+L.mouthX/256*1.9;
  const v=shapeHeadPoint(new T.Vector3(-Math.cos(phi)*Math.sin(theta),Math.cos(theta),Math.sin(phi)*Math.sin(theta)),m.profile);
  const lips=a.bones.head.localToWorld(new T.Vector3(v.x*m.Rh*m.headSX,m.headCentre-m.headY+v.y*m.Rh*m.headSY,v.z*m.Rh*.98+.025*m.k));
  assert.ok(tea.localToWorld(new T.Vector3(0,.075,0)).distanceTo(lips)<.015,'Tea rim reaches the measured lips');
  a.dispose();
 });
}
test('unknown styles fail explicitly; old recipes do not opt in',()=>{
 assert.throws(()=>measure({}, {renderStyle:'unknown'}),RangeError);
 assert.deepEqual(measure({renderStyle:'island-storybook-v2'}),measure({}));
});

test('original island eye choices survive recipe save/open without changing existing eye names',()=>{
 for(const style of ['islandbead','islandlid','islandbright']){
  const r=normalizeRecipe({...baseline[0].recipe,eyes:{...baseline[0].recipe.eyes,style}});
  assert.equal(r.eyes.style,style);assert.deepEqual(decodeRecipe(encodeRecipe(r)),r);
 }
});

test("appending authored eye parts does not change existing seeded people",()=>{
 const frozen=[["island-1","32d46bf4bb5201352438d6423f4af19b8139b831405f7fec9065241a4b825870"],["island-2","bb5850f5a3deaa07e033981d388102905e955c2e72197789f5ce38de203d7551"],["young-islander","982c137acfee6c9ecd7b3f4141aa35442611be721c89dea7d23ad31ae01187eb"],["elder-study","fbb689802cef009b1c31a251ee9fd95c1151396955920df9be7986b1702d3547"],["existing-save","d21cf1cec061ae595c2dfb2a7efa5713e6f5b34be8668f932d6070ec8b23fedb"]];
 for(const [seed,sha] of frozen)assert.equal(createHash("sha256").update(JSON.stringify(randomRecipe(seed))).digest("hex"),sha);
});
