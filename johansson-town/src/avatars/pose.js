import * as THREE from '../../vendor/three.module.js';

// Local offsets for the existing rig. No bones, skin weights or recipes change.
export const POSE_CONTROLS=Object.freeze([
 ['headTilt','Head tilt','Head','head','z',-25,25,1],
 ['headTurn','Head turn','Head','head','y',-45,45,1],
 ['headNod','Head nod','Head','head','x',-30,30,1],
 ['torsoTurn','Torso turn','Torso','chest','y',-25,25,1],
 ['torsoLean','Torso lean','Torso','chest','x',-20,20,1],
 ...['L','R'].flatMap(side=>{
  const label=side==='L'?'Left':'Right';
  return [[side+'Lift',label+' arm lift',label+' arm','shoulder'+side,'z',-30,90,side==='L'?1:-1],
   [side+'Bend',label+' elbow bend',label+' arm','elbow'+side,'x',-60,60,-1],
   [side+'Wrist',label+' wrist bend',label+' arm','hand'+side,'x',-45,45,1],
   [side+'WristTurn',label+' wrist turn',label+' arm','hand'+side,'y',-60,60,side==='L'?1:-1],
   [side+'WristTilt',label+' wrist tilt',label+' arm','hand'+side,'z',-35,35,side==='L'?1:-1]];
 })
]);
const names=['root','hips','spine','chest','neck','head','shoulderL','elbowL','handL','shoulderR','elbowR','handR','thighL','kneeL','footL','thighR','kneeR','footR','hairA','hairB','braidL1','braidL2','braidR1','braidR2','skirtF','skirtB','skirtL','skirtR'];
const vector=(v,n)=>Array.isArray(v)&&v.length===n&&v.every(Number.isFinite);
export function normalizePose(raw){
 if(!raw||raw.format!=='johansson-pose'||raw.version!==1||!raw.bones||!Number.isFinite(raw.rootHeight)||Math.abs(raw.rootHeight)>2)throw Error('Choose a Johansson pose file (version 1).');
 const bones={};
 for(const name of names){
  const b=raw.bones[name];if(!b)continue;
  if(!vector(b.rotation,4)||!vector(b.scale,3)||b.scale.some(n=>n<.1||n>3))throw Error('Invalid pose joint: '+name);
  const q=new THREE.Quaternion().fromArray(b.rotation),length=q.length();
  if(length<.001||!Number.isFinite(length))throw Error('Invalid pose rotation.');
  bones[name]={rotation:q.normalize().toArray(),scale:[...b.scale]};
 }
 if(!bones.hips||!bones.head)throw Error('The pose must contain body joints.');
 const adjustments={};
 for(const [id,,,,,lo,hi] of POSE_CONTROLS){const v=raw.adjustments?.[id]??0;if(!Number.isFinite(v))throw Error('Invalid pose adjustment.');adjustments[id]=Math.max(lo,Math.min(hi,v));}
 return {format:'johansson-pose',version:1,basePose:String(raw.basePose||'idle').slice(0,40),rootHeight:raw.rootHeight,bones,adjustments};
}
export function capturePose(avatar,basePose='idle'){
 const bones={};for(const name of names){const b=avatar.bones[name];if(b)bones[name]={rotation:b.quaternion.toArray(),scale:b.scale.toArray()};}
 return normalizePose({format:'johansson-pose',version:1,basePose,rootHeight:avatar.root.position.y/avatar.measure.H,bones});
}
const delta=new THREE.Quaternion(),euler=new THREE.Euler();
/** Restore the base before offsets: no accumulation, including on frozen frames. */
export function applyPose(avatar,pose){
 for(const [name,transform] of Object.entries(pose.bones)){
  const bone=avatar.bones[name];if(!bone)continue;
  bone.quaternion.fromArray(transform.rotation);bone.scale.fromArray(transform.scale);
 }
 avatar.root.position.y=pose.rootHeight*avatar.measure.H;
 const offsets={};
 for(const [id,,,bone,axis,,,sign] of POSE_CONTROLS){const value=pose.adjustments[id]||0;if(!value)continue;(offsets[bone]??={x:0,y:0,z:0})[axis]+=value*sign*Math.PI/180;}
 for(const [name,o] of Object.entries(offsets)){const bone=avatar.bones[name];if(bone)bone.quaternion.multiply(delta.setFromEuler(euler.set(o.x,o.y,o.z)));}
}

/** Independent pose undo history; never enters the appearance recipe history. */
export function createPoseHistory(){
 let value=null;const undo=[],redo=[];
 const copy=v=>v&&structuredClone(v);
 return {
  get current(){return value;},get value(){return copy(value);},get canUndo(){return undo.length>0;},get canRedo(){return redo.length>0;},
  set(next,{record=true}={}){const clean=next?normalizePose(next):null;if(JSON.stringify(clean)===JSON.stringify(value))return;if(record){undo.push(copy(value));if(undo.length>50)undo.shift();redo.length=0;}value=clean;},
  undo(){if(!undo.length)return;redo.push(copy(value));value=undo.pop();},
  redo(){if(!redo.length)return;undo.push(copy(value));value=redo.pop();}
 };
}
