import {drawFace} from '../johansson-town/src/avatars/face.js';
import {createPerformancePainter} from '../johansson-town/src/avatars/performance-face.js';

/** Pose-specific comic acting, painted on the existing face. Resident recipes remain intact. */
export function createSceneFacePainter(avatar,recipe,pose){
 const paint=createPerformancePainter(avatar,recipe);let wasCustom=false;
 return state=>{
  const active=typeof pose==='function'?pose():pose;
  const scream=active==='SchoolProtest'&&['raging','scared','gobsmacked'].includes(state.expression);
  const custom=scream||(active==='SchoolRest'&&['dry','drowsy'].includes(state.expression));
  // A take can leave the comic pose without changing expression: repaint its normal face then, too.
  if(wasCustom&&!custom)avatar.faceKey='';
  const changed=paint(state);wasCustom=custom;if(!custom)return changed;
  const r=scream?{...recipe,mouth:{...recipe.mouth,size:2.5,width:1,height:.55,colour:'#b8544a'}}:recipe;
  drawFace(avatar.face.ctx,r,{...avatar.faceState,size:avatar.face.canvas.width,objects:true,
   expression:scream?'raging':'dry',blinkLeft:scream?1:0,blinkRight:1});
  avatar.face.texture.needsUpdate=true;return true;
 };
}
