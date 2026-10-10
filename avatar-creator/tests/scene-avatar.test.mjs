import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../johansson-town/vendor/three.module.js';
import {installDOM} from '../../johansson-town/tests/fixtures.mjs';
import {buildAvatar} from '../../johansson-town/src/avatars/build.js';
import {CAST_RECIPES,ORIGINAL_THUAN_RECIPE} from '../../johansson-town/src/avatars/cast.js';
import {poseSceneAvatar} from '../scene-avatar.js';
import {POSES} from '../scene-model.mjs';
installDOM();
test('Johansson and Thuận scene poses face the camera and fit the export frame',()=>{
 for(const recipe of [CAST_RECIPES.Johansson,ORIGINAL_THUAN_RECIPE])for(const pose of POSES){
  const avatar=buildAvatar(recipe,{shadows:false,faceSize:128});
  try{const camera=poseSceneAvatar(avatar,{pose,expression:'happy',turn:0});assert.equal(avatar.root.rotation.y,0);
   avatar.root.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite),recipe.name+' '+pose));
   const box=new THREE.Box3().setFromObject(avatar.root);
   for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new THREE.Vector3(x,y,z).project(camera);assert.ok(Math.abs(p.x)<=1.001&&Math.abs(p.y)<=1.001,pose+' fits the export frame');}
  }finally{avatar.body.skeleton.dispose();avatar.dispose();}
 }
});
