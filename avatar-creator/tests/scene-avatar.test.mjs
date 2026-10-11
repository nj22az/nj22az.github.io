import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../johansson-town/vendor/three.module.js';
import {installDOM} from '../../johansson-town/tests/fixtures.mjs';
import {buildAvatar} from '../../johansson-town/src/avatars/build.js';
import {CAST_RECIPES,ORIGINAL_THUAN_RECIPE} from '../../johansson-town/src/avatars/cast.js';
import {poseSceneAvatar,placeSceneAvatar} from '../scene-avatar.js';
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
// The bottom as World's seat support measures it (seat-support.js): the lowest drawn point carried only by the hips and thighs.
function bottomOf(avatar){
 const v=new THREE.Vector3();let lowest=Infinity;
 avatar.root.traverse(o=>{if(!o.isSkinnedMesh||o.name.includes('outline'))return;const {skinIndex:I,skinWeight:W}=o.geometry.attributes;
  for(let i=0;i<I.count;i++){let own=true;for(let k=0;k<4;k++)if(W.getComponent(i,k)>.001&&!['hips','thighL','thighR'].includes(o.skeleton.bones[I.getComponent(i,k)].name)){own=false;break;}
   if(own){o.getVertexPosition(i,v);v.applyMatrix4(o.matrixWorld);if(v.y<lowest)lowest=v.y;}}});
 return lowest;
}
// As scene.js places a character: the root at the origin and scaled, posed, then put on its spot.
function placed(recipe,{pose,seat,size,floor}){
 const avatar=buildAvatar(recipe,{shadows:false,faceSize:64});
 avatar.root.scale.setScalar(size);poseSceneAvatar(avatar,{pose,expression:'smile',turn:20,seatHeight:seat/size});placeSceneAvatar(avatar,{x:2,y:floor,z:-1},size);
 const v=new THREE.Vector3(),feet=Math.min(avatar.bones.footL.getWorldPosition(v).y,avatar.bones.footR.getWorldPosition(v).y);
 return {avatar,box:new THREE.Box3().setFromObject(avatar.root),bottom:bottomOf(avatar),feet,done(){avatar.body.skeleton.dispose();avatar.dispose();}};
}
const SEATING=[['Idle',0],['Wave',0],['Sit',0],['Sit',.45],['SitToast',.45]];
test('placed in a scene, a seated body sits on its seat or the floor and a standing one stands on the floor, at any size',()=>{
 const floor=.1;
 for(const recipe of [CAST_RECIPES.Johansson,ORIGINAL_THUAN_RECIPE])for(const size of [1,.75,1.3])for(const [pose,seat] of SEATING){
  const p=placed(recipe,{pose,seat,size,floor}),label=`${recipe.name} ${pose} on ${seat?seat+' m seat':'the floor'} at size ${size}`;
  try{
   assert.equal(p.avatar.root.position.x,2);assert.equal(p.avatar.root.position.z,-1);
   assert.ok(p.feet>floor-.01,label+': feet not in the floor');
   if(!seat&&pose!=='Sit')assert.ok(Math.abs(p.box.min.y-floor)<.03,label+': standing on the floor ('+(p.box.min.y-floor).toFixed(3)+')');
   if(seat||pose==='Sit')assert.ok(Math.abs(p.bottom-(floor+seat))<.015,label+': the bottom on the '+(seat?'seat':'floor')+' ('+(p.bottom-floor).toFixed(3)+' m up), not floating or sinking');
   if(recipe===CAST_RECIPES.Johansson)assert.ok(p.box.min.y>floor-.03,label+': nothing below the floor');
  }finally{p.done();}
 }
});
test('Thuận\'s pleated skirt stays above the floor in a floor sit',{todo:'World: the skirt\'s spring bones dip about 6 cm into the floor (animate.js, being fixed with the floor sit)'},()=>{
 const p=placed(ORIGINAL_THUAN_RECIPE,{pose:'Sit',seat:0,size:1,floor:0});try{assert.ok(p.box.min.y>-.02,'lowest point '+p.box.min.y.toFixed(3));}finally{p.done();}
});
