import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRecipe,encodeRecipe,decodeRecipe,PARTS} from '../src/avatars/recipe.js';
import {faceLayout} from '../src/avatars/face.js';
import {buildAvatar,buildHatProp,measure} from '../src/avatars/build.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
import {CAST_RECIPES} from '../src/avatars/cast.js';
import {installDOM} from './fixtures.mjs';
installDOM();
test('old recipes gain neutral controls; new facial settings and accessories survive sharing',()=>{
 const old=normalizeRecipe({v:1,eyes:{size:.7},outfit:{hat:'captain'}});
 assert.equal(old.eyes.width,.5);assert.equal(old.nose.x,.5);assert.equal(old.accessories.earrings,'none');assert.equal(old.outfit.hat,'captain');
 const r=normalizeRecipe({eyes:{width:1,spacing:.8,height:.2},nose:{x:.3},mouth:{width:.9,x:.8},accessories:{earrings:'hoops',neckwear:'scarf',pin:true,colour:'#d8342c'},outfit:{hat:'beanie'}});
 assert.deepEqual(decodeRecipe(encodeRecipe(r)),r);
 assert.equal(normalizeRecipe({eyes:{width:9},accessories:{earrings:'invalid'}}).eyes.width,1);
});
test('features move independently and larger wider eyes leave head proportions unchanged',()=>{
 const r=normalizeRecipe(),base=faceLayout(r),eyes=faceLayout(normalizeRecipe({...r,eyes:{...r.eyes,height:1,width:1,size:1}}));
 assert.ok(eyes.eyeY<base.eyeY);assert.ok(eyes.eyeS>base.eyeS);assert.ok(eyes.eyeW>base.eyeW);
 assert.equal(eyes.noseY,base.noseY);assert.equal(eyes.mouthY,base.mouthY);assert.equal(eyes.browY,base.browY);
 const mouth=faceLayout(normalizeRecipe({...r,mouth:{...r.mouth,x:1,height:0}}));assert.ok(mouth.mouthX>base.mouthX);assert.ok(mouth.mouthY>base.mouthY);assert.equal(mouth.eyeY,base.eyeY);
 assert.equal(measure(r).Rh,measure({...r,eyes:{width:1,size:1}}).Rh);
});
test('all hats and accessories remain in the two-draw skinned avatar through poses and swimwear',()=>{
 for(const hat of PARTS.hat)for(const earrings of PARTS.earrings){
  const a=buildAvatar({...CAST_RECIPES.Thuan,outfit:{...CAST_RECIPES.Thuan.outfit,hat},accessories:{earrings,neckwear:hat==='none'?'pendant':'scarf',pin:true}},{shadows:false});
  const anim=createAvatarAnimator(a);anim.play('Wave');anim.update(.1,{speed:1});a.root.updateMatrixWorld(true);
  let draws=0;a.root.traverse(o=>{if(o.isMesh&&o.visible)draws++;});assert.equal(draws,2);
  for(const v of a.body.geometry.attributes.position.array)assert.ok(Number.isFinite(v));
  a.wear('swim');assert.equal(a.body.visible,false);a.wear('clothes');assert.equal(a.body.visible,true);a.dispose();
 }
});
test('a hat comes off without a third draw call, and the copy on the peg is the same hat',()=>{
 const recipe=CAST_RECIPES['Officer Mori'],a=buildAvatar(recipe,{shadows:false});
 assert.ok(a.hasHat&&a.hatOn);const whole=a.body.geometry.attributes.position.count;
 a.setHat(false);assert.equal(a.hatOn,false);assert.ok(a.body.geometry.drawRange.count<whole,'the hat is no longer drawn');
 let draws=0;a.root.traverse(o=>{if(o.isMesh&&o.visible)draws++;});assert.equal(draws,2);
 a.setHat(true);assert.equal(a.hatOn,true);
 const prop=buildHatProp(recipe);assert.ok(prop?.isMesh&&!prop.isSkinnedMesh);
 assert.equal(prop.geometry.attributes.position.count,whole-a.body.geometry.drawRange.start-(a.setHat(false),a.body.geometry.drawRange.count),'the peg holds the hat that came off');
 assert.equal(buildHatProp(CAST_RECIPES.Reiko),null,'no hat, nothing to hang up');a.dispose();
});
