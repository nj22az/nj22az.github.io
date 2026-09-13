import * as THREE from '../../vendor/three.module.js';

const UP=new THREE.Vector3(0,1,0);
const smooth=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
export function biteAmount(seconds){const t=seconds%3;return t<.7?smooth(t/.7):t<1.3?1:t<2.1?1-smooth((t-1.3)/.8):0;}

// An additive arm layer shared by the Meshy and Quaternius skeletons. Targets
// are in metres; only bone rotations change, so elbows keep their real lengths.
export function createMealMotion(model,entity,height){
 const merged=!!model.getObjectByName('RightHand_End'),head=model.getObjectByName('Head');
 if(!head)return null;
 model.updateWorldMatrix(true,true);
 const mouthLocal=head.worldToLocal(entity.localToWorld(entity.worldToLocal(head.getWorldPosition(new THREE.Vector3())).add(new THREE.Vector3(0,height*(merged?.037:.023),-height*.061))));
 const arms={};
 for(const [side,sign] of [['R',1],['L',-1]]){
  const word=side==='R'?'Right':'Left',upper=model.getObjectByName(merged?word+'Arm':'UpperArm'+side),lower=model.getObjectByName(merged?word+'ForeArm':'LowerArm'+side),hand=model.getObjectByName(merged?word+'Hand':'Wrist'+side);
  if(!upper||!lower||!hand)continue;
  const grip=new THREE.Vector3(merged?-sign*.011:0,merged?.062:.103,merged?0:-sign*.018),normal=new THREE.Vector3(merged?-sign:0,0,merged?0:-sign);
  // Local Y follows the fingers. Fit the palm plane to each rig's hand axes.
  const localBasis=new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(UP,normal),UP,normal);
  arms[side]={upper,lower,hand,grip,sign,localBasis:new THREE.Quaternion().setFromRotationMatrix(localBasis),contact:new THREE.Vector3()};
 }
 if(!arms.R||!arms.L)return null;
 const fingers=[];model.traverse(bone=>{if(bone.isBone&&(/^(Index|Middle|Ring|Pinky)[23][LR]$/.test(bone.name)||/Hand(Index|Middle|Ring|Pinky|Thumb)[123]$/.test(bone.name)))fingers.push(bone);});
 const bones=[...new Set([...Object.values(arms).flatMap(a=>[a.upper,a.lower,a.hand]),...fingers])],saved=new Map();
 const propOffset=new THREE.Vector3();
 let amount=0,elapsed=0,lastMode='',lastKind='',mode='',kind=null,lift=0,orientation=new THREE.Quaternion();
 const mouth=new THREE.Vector3(),reachTarget=new THREE.Vector3();
 function restore(){for(const [bone,q] of saved)bone.quaternion.copy(q);saved.clear();}
 function worldPoint(point){return entity.localToWorld(point);}
 function aim(bone,child,target){
  const start=bone.getWorldPosition(new THREE.Vector3()),from=child.getWorldPosition(new THREE.Vector3()).sub(start).normalize(),to=target.clone().sub(start).normalize();
  const desired=new THREE.Quaternion().setFromUnitVectors(from,to).multiply(bone.getWorldQuaternion(new THREE.Quaternion()));
  bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(desired));bone.updateWorldMatrix(false,true);
 }
 function solve(arm,target,fingers,palmNormal){
  const {upper,lower,hand,grip,sign}=arm;
  // Orient the palm first, then subtract its measured offset to solve the wrist.
  const y=fingers.clone().normalize(),z=palmNormal.clone().addScaledVector(y,-palmNormal.dot(y)).normalize(),x=new THREE.Vector3().crossVectors(y,z);
  const rotation=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z)).multiply(arm.localBasis.clone().invert());
  const scale=hand.getWorldScale(new THREE.Vector3()),wrist=target.clone().sub(grip.clone().multiply(scale).applyQuaternion(rotation));
  const shoulder=upper.getWorldPosition(new THREE.Vector3()),elbow=lower.getWorldPosition(new THREE.Vector3()),current=hand.getWorldPosition(new THREE.Vector3());
  const a=shoulder.distanceTo(elbow),b=elbow.distanceTo(current),direction=wrist.clone().sub(shoulder),distance=THREE.MathUtils.clamp(direction.length(),Math.abs(a-b)+.005,a+b-.005);direction.normalize();
  // Keep the elbow below and slightly outside the hand, away from the torso.
  const pole=new THREE.Vector3(sign*.45,-1,.1).transformDirection(entity.matrixWorld);pole.addScaledVector(direction,-pole.dot(direction)).normalize();
  const along=(a*a-b*b+distance*distance)/(2*distance),bend=Math.sqrt(Math.max(0,a*a-along*along));
  const targetElbow=shoulder.clone().addScaledVector(direction,along).addScaledVector(pole,bend),targetWrist=shoulder.clone().addScaledVector(direction,distance);
  aim(upper,lower,targetElbow);aim(lower,hand,targetWrist);
  hand.quaternion.copy(hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(rotation));hand.updateWorldMatrix(false,true);
  arm.contact.copy(grip).applyMatrix4(hand.matrixWorld);
 }
 function update(dt,data){
  const active=data.shopReach?'reach':data.shopGoods?'hold':data.carrying?'carry':/^(Eat|Drink)(Standing)?$/.test(data.socialPose||'')&&data.heldItem?'meal':'';
  const nextKind=data.heldItem||null;if(data.shopReach)reachTarget.set(...data.shopReach);
  if(active!==lastMode||nextKind!==lastKind){elapsed=0;lastMode=active;lastKind=nextKind;}
  else elapsed+=dt;
  amount=THREE.MathUtils.clamp(amount+(active?dt:-dt)/.24,0,1);
  if(active){mode=active;kind=nextKind;}
  if(!amount){mode='';return;}
  for(const bone of bones)saved.set(bone,bone.quaternion.clone());
  entity.updateWorldMatrix(true,true);head.localToWorld(mouth.copy(mouthLocal));
  const headPoint=entity.worldToLocal(head.getWorldPosition(new THREE.Vector3())),mouthPoint=entity.worldToLocal(mouth.clone());
  const facing=new THREE.Vector3(0,0,-1).transformDirection(entity.matrixWorld),up=UP.clone().transformDirection(entity.matrixWorld);
  propOffset.set(0,0,0);orientation.copy(entity.getWorldQuaternion(new THREE.Quaternion()));lift=mode==='meal'?biteAmount(elapsed):0;
  if(mode==='reach'){
   solve(arms.R,reachTarget,facing,up);
  }else if(mode==='hold'){
   solve(arms.R,worldPoint(new THREE.Vector3(headPoint.x+.16,headPoint.y-height*.28,headPoint.z-.28)),facing,up);
  }else if(mode==='carry'){
   const centre=new THREE.Vector3(headPoint.x,headPoint.y-height*.27,headPoint.z-.30);
   for(const [side,sign] of [['R',1],['L',-1]])solve(arms[side],worldPoint(centre.clone().add(new THREE.Vector3(sign*.10,-.018,0))),facing,up);
  }else{
   const drink=['tea','beer','cup','can'].includes(kind),bowl=['ramen','fish','yakitori'].includes(kind);
   if(drink)orientation.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),.65*lift));
   const rest=new THREE.Vector3(headPoint.x+.14,headPoint.y-height*.22,headPoint.z-(bowl?.40:.28));
   // At the top of the motion the nearest edge/rim meets the mouth.
   const top=bowl?.018:drink?(kind==='beer'?.145:.10):kind==='rice'?.09:.062;
   const rim=new THREE.Vector3(0,top,bowl?.155:drink?.037:.047).applyQuaternion(orientation.clone().premultiply(entity.getWorldQuaternion(new THREE.Quaternion()).invert()));
   const bite=mouthPoint.clone().sub(rim).add(new THREE.Vector3(.012,0,-.005));
   const right=rest.clone().lerp(bite,lift);
   if(drink){propOffset.set(-.037,-.045,0).applyQuaternion(orientation);right.sub(propOffset.clone().applyQuaternion(entity.getWorldQuaternion(new THREE.Quaternion()).invert()));}
   const tiltAxis=new THREE.Vector3(1,0,0).transformDirection(entity.matrixWorld);
   solve(arms.R,worldPoint(right),drink?up.clone().applyAxisAngle(tiltAxis,.65*lift):facing,drink?new THREE.Vector3(-1,0,0).transformDirection(entity.matrixWorld):up);
   if(bowl){
    solve(arms.L,worldPoint(new THREE.Vector3(headPoint.x-.10,headPoint.y-height*.20,headPoint.z-.28)),facing,up);
   }
  }
  if(mode==='meal'&&['tea','beer','cup','can'].includes(kind)){
   const inward=new THREE.Vector3(-1,0,0).transformDirection(entity.matrixWorld);
   for(const bone of fingers.filter(b=>/R$|RightHand/.test(b.name))){const child=bone.children.find(b=>b.isBone);if(!child)continue;const start=bone.getWorldPosition(new THREE.Vector3()),direction=child.getWorldPosition(new THREE.Vector3()).sub(start).normalize();aim(bone,child,start.clone().add(direction.multiplyScalar(.45).addScaledVector(inward,.65).normalize()));}
  }
  // Blend against the authored pose, including on release. Restore these inputs
  // before the next mixer step so static tracks never accumulate the IK offset.
  for(const [bone,q] of saved){const solved=bone.quaternion.clone();bone.quaternion.copy(q).slerp(solved,amount);}
  model.updateWorldMatrix(true,true);
  for(const arm of Object.values(arms))arm.contact.copy(arm.grip).applyMatrix4(arm.hand.matrixWorld);
  if(mode==='carry'&&data.carriedTray){
   const tray=data.carriedTray,position=arms.R.contact.clone().add(arms.L.contact).multiplyScalar(.5).addScaledVector(up,.018);
   tray.position.copy(tray.parent.worldToLocal(position));tray.quaternion.copy(tray.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(entity.getWorldQuaternion(new THREE.Quaternion())));
  }
 }
 return {restore,update,arms,mouth,propOffset,get active(){return amount>0&&['meal','hold','reach'].includes(mode);},get bowl(){return ['ramen','fish','yakitori'].includes(kind);},get orientation(){return orientation;},get lift(){return lift;}};
}
