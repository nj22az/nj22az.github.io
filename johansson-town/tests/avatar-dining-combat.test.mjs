import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildAvatar} from '../src/avatars/build.js';
import {CAST_RECIPES} from '../src/avatars/cast.js';
import {createAvatarAnimator,GESTURES} from '../src/avatars/animate.js';
import {buildDungeon} from '../src/dungeon/dungeon.js';
installDOM();

test('combat gestures supersede dining without the mouth IK overriding the fists',()=>{
 for(const name of ['Fist','Jab','JabL','Swipe','Hurt']){
  const a=buildAvatar(CAST_RECIPES.Johansson),anim=createAvatarAnimator(a);
  anim.play('SitDrink');anim.update(1.2,{seated:true});assert.ok(anim.consumption);
  assert.ok(anim.play(name),name+' remains registered');anim.update(GESTURES[name]/3);
  assert.equal(anim.gesture,name);assert.equal(anim.consumption,null);
  assert.ok(Math.abs(a.bones.shoulderR.rotation.x)>.1,name+' moves the arm');
  a.root.updateMatrixWorld(true);assert.ok(a.bones.handR.matrixWorld.elements.every(Number.isFinite));
  anim.update(GESTURES[name]);assert.equal(anim.gesture,null);a.dispose();
 }
});

test('dungeon costumed avatars use Swipe for wind-up and Hurt for a surviving hit',()=>{
 const room=new THREE.Group(),run={hp:5,maxHp:5,loot:0,items:[],floor:2,seed:6};
 const {dungeon:d}=buildDungeon({room,run});
 assert.ok(d.creatures.every(c=>c.animator),'No fallback bodies');
 const c=d.creatures[0];d.update(1/60,{x:c.x+.3,z:c.z});
 assert.equal(c.animator.gesture,'Swipe');assert.equal(run.hp,5);
 d.strike(c);assert.ok(c.alive);assert.equal(c.animator.gesture,'Hurt');
});
