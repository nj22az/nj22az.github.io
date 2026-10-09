import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {CAST_RECIPES,recipeFor} from '../src/avatars/cast.js';
import {createAvatarJohansson} from '../src/avatars/actors.js';
import {ONSEN_SEATS} from '../src/world/interiors/onsen.js';
import {MASSAGE_CHAIR} from '../src/world/interiors/onsen-electrics.js';
installDOM();

// The creator: "Fujita's legs blended together with the onsen ... correct collision". A sitter faces -x; the lower legs
// hang below the knees and must stay in front of the seat's front face, never inside the seat block.
test('Umi-no-yu massage chair: every sitter\'s lower legs hang in front of the seat, not inside it',()=>{
 const actor=createAvatarJohansson({scene:new THREE.Scene()}),S=ONSEN_SEATS.massage;
 const people={...CAST_RECIPES,'Mr Fujita':recipeFor('Mr Fujita'),child:{...CAST_RECIPES.Johansson,age:'child'}};
 for(const [name,recipe] of Object.entries(people)){
  actor.setRecipe(recipe);actor.seat('Sit');actor.root.position.set(...S.position);actor.root.rotation.y=S.yaw;
  for(let i=0;i<90;i++)actor.update(1/60,{seated:true,seatHeight:S.surfaceY,visible:true});
  actor.root.updateMatrixWorld(true);
  const foot=actor.avatar.bones.footL.getWorldPosition(new THREE.Vector3()),legR=actor.avatar.measure.legR;
  assert.ok(foot.x+legR<MASSAGE_CHAIR.front-.01,`${name}: calves at ${(foot.x+legR).toFixed(3)} reach the seat front ${MASSAGE_CHAIR.front}`);
 }
 actor.avatar.dispose();
});
