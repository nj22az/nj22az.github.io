import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {ISLAND_OUTFITS,ISLAND_COSTUMES} from '../src/avatars/outfits.js';
import {normalizeRecipe,encodeRecipe,decodeRecipe} from '../src/avatars/recipe.js';
import {buildAvatar} from '../src/avatars/build.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
import {buildCityRestaurant} from '../src/world/interiors/city-restaurant.js';
import {buildBlueCoralShop} from '../src/world/blue-coral-shop.js';
import {circleHitsRect} from '../physics.js';
installDOM();
test('all original sets preserve identity and build finite animated clothing for both silhouettes',()=>{
 for(const set of [...ISLAND_OUTFITS,...ISLAND_COSTUMES])for(const silhouette of ['feminine','masculine']){
  const recipe=normalizeRecipe({name:'Dress rehearsal',body:{silhouette},hair:{style:'braids'},outfit:{...set.outfit,hat:'paperboat'}});
  assert.deepEqual(decodeRecipe(encodeRecipe(recipe)),recipe);
  const a=buildAvatar(recipe,{shadows:false});const motion=createAvatarAnimator(a);motion.play('Wave');
  for(let i=0;i<30;i++)motion.update(1/30,{seated:i>15,seatHeight:.48});
  assert.ok([...a.body.geometry.attributes.position.array].every(Number.isFinite),set.name);
  assert.equal(a.recipe.hair.style,'braids');assert.equal(a.recipe.outfit.hat,'paperboat');a.dispose();
 }
});
test('Thuan greets served food, presents her own plate and releases it before eating',()=>{
 const room=new THREE.Group(),r=buildCityRestaurant({room,reg(){},action(){}});
 r.dinner.serve({dish:'course'});assert.equal(r.dinner.state.presentation,'SitEnjoyFood');
 for(let i=0;i<110;i++)r.tick(.1);
 assert.equal(r.dinner.state.presentation,'SitPresentFood');const plate=room.getObjectByName('Thuan presents her actual dinner');assert.ok(plate);
 assert.ok(Number.isFinite(plate.position.y));
 assert.equal(r.dinner.eat(),true);assert.equal(r.dinner.state.presentation,null);assert.equal(plate.parent,null);
 for(let i=0;i<10;i++)r.tick(.1);
 assert.equal(r.dinner.state.eaten,1);
});
test('Blue Coral has an accessible counter and purchases use actual advertised prices',()=>{
 const world={colliders:[]},group=new THREE.Group(),anchors=[],actions=[];
 const shop=buildBlueCoralShop({world,group,register:(object,label,fn)=>anchors.push({object,label,fn}),onAction:(...args)=>actions.push(args)});
 for(const x of [96,96.5,97,98,99])assert.ok(!world.colliders.some(c=>circleHitsRect(x,121,.32,c)),'Entrance blocked at '+x);
 anchors.find(a=>a.label==='Buy an island scoop at Blue Coral').fn();assert.equal(actions.at(-1)[2].cost,150);
 anchors.find(a=>a.label==='Talk to the Blue Coral attendant').fn();shop.update();assert.equal(actions.at(-1)[0],'read');
});
