import * as THREE from '../../vendor/three.module.js';
import {sampleCycle,advanceCycle,CYCLE_DURATION,SIP_FLOW_START,ease} from '../drinking/cycle.js';
import {requiredTilt,volumeAtPlane} from '../drinking/liquid.js';
import {createLiquid} from '../drinking/vessel.js';
import {drinkGrip,reach} from './consume.js';
import {faceLayout} from './face.js';
import {shapeHeadPoint} from './head-profile.js';

const Y=new THREE.Vector3(0,1,0),X=new THREE.Vector3(1,0,0),HALF_TURN=new THREE.Quaternion().setFromAxisAngle(Y,Math.PI);
const mix=(a,b,t)=>a+(b-a)*t;
const point=(a,b,t,arc=0)=>a.clone().lerp(b,t).addScaledVector(Y,arc*4*t*(1-t));

/** The rendered mouth, in the actual head's frame, shared across all cast recipes. */
export function avatarMouth(avatar){
 const own=avatar.pixar?.mouthPoint?.();if(own)return own;   // (a Pixar body's own lips, pixar.js)
 const m=avatar.measure,L=faceLayout(avatar.recipe),theta=Math.PI*.28+L.mouthY/256*Math.PI*.58,phi=Math.PI/2-.95+L.mouthX/256*1.9;
 const p=shapeHeadPoint(new THREE.Vector3(-Math.cos(phi)*Math.sin(theta),Math.cos(theta),Math.sin(phi)*Math.sin(theta)),m.profile);
 return avatar.bones.head.localToWorld(new THREE.Vector3(p.x*m.Rh*m.headSX,m.headCentre-m.headY+p.y*m.Rh*m.headSY,p.z*m.Rh*.98+.025*m.k));
}

/** A single loose vessel may move; bottle-and-cup arrangements need separate meshes. */
export const TABLE_DRINK_KINDS=Object.freeze(['draft','can','awamori','oolong']);

function fluidFor(prop){
 if(prop.userData.tableDrinkFluid)return prop.userData.tableDrinkFluid;
 const surface=prop.userData.drinkSurface,source=surface?.liquid,kind=prop.userData.drinkKind;
 const h=prop.userData.rimHeight||.15,r=source?.geometry?.parameters?.radiusTop||prop.userData.grip?.radius||.039;
 const base=source?source.position.y-source.geometry.parameters.height/2:.006,top=h-.0008,n=48;
 const capacity=n*Math.sin(2*Math.PI/n)/2*r*r*(top-base)*1e6;
 const starting=source?n*Math.sin(2*Math.PI/n)/2*r*r*source.geometry.parameters.height*1e6:capacity*.9;
 const profile={id:kind,segments:n,innerRadiusBottom:r*.96,innerRadiusTop:r,interiorBottom:base,interiorTop:top,
  capacityMl:capacity*(.96*.96+.96+1)/3,liquidRimContact:[-r,top,0],height:h,
  liquidColor:source?.material?.color?.getHex()||0xc18c36,liquidOpacity:kind==='awamori'?.38:.92,
  hasFoam:!!surface?.head,foamHeight:.006,hasIce:['awamori','oolong'].includes(kind),startingVolumeMl:starting};
 const liquid=source?createLiquid(profile):null;
 if(liquid)prop.add(liquid.root);
 const api={profile,liquid,startingVolumeMl:Math.min(starting,profile.capacityMl),update(fraction){
  if(!liquid)return;
  prop.updateWorldMatrix(true,false);
  const normal=Y.clone().applyQuaternion(prop.getWorldQuaternion(new THREE.Quaternion()).invert());
  liquid.update(api.startingVolumeMl*Math.max(0,Math.min(1,fraction)),normal);
 }};
 prop.userData.tableDrinkFluid=api;
 if(prop.userData.level)prop.userData.level.visible=false;
 if(prop.userData.pour?.bubbles)prop.userData.pour.bubbles.visible=false;
 api.update(prop.userData.portion??1);return api;
}

function setWorld(object,position,quaternion){
 const world=new THREE.Matrix4().compose(position,quaternion,new THREE.Vector3(1,1,1));
 if(object.parent){object.parent.updateWorldMatrix(true,false);world.premultiply(object.parent.matrixWorld.clone().invert());}
 world.decompose(object.position,object.quaternion,object.scale);object.matrixAutoUpdate=true;object.updateWorldMatrix(false,true);
}

/** A solid mitten clasps the handle without entering the hollow mug body. Its
 * authored palm is an ellipsoid (0.9 hand radii wide); the opposing thumb is a
 * sphere 0.55 radii inwards and 0.42 radii forwards. Fit both to the actual shell,
 * leaving 1 mm clear of the body while keeping the handle inside the clasp.
 */
function tableGrip(prop,m,profile){
 const grip=drinkGrip(prop,m);
 if(prop.userData.grip?.handle==null)return grip;
 const shell=prop.getObjectByName('Hollow '+prop.userData.drinkKind+' glass');
 shell?.geometry?.computeBoundingBox();
 const bounds=shell?.geometry?.boundingBox;
 // The handle lies in the XY plane, so the shell's Z extent measures the body.
 const radius=bounds?Math.max(Math.abs(bounds.min.z),Math.abs(bounds.max.z))*shell.scale.z:profile.innerRadiusTop+.006;
 const h=m.hand,clearRadius=radius+.001,thumbRadius=h*.42;
 const palmClearance=clearRadius+h*.9;
 const thumbClearance=h*.55+Math.sqrt((clearRadius+thumbRadius)**2-thumbRadius**2);
 grip.x=Math.max(grip.x,palmClearance,thumbClearance);
 return grip;
}

/**
 * The existing cast adapter for the same sober timeline as the side-view simulator.
 * The table vessel keeps its parent: there is no second prop or attachment switch.
 * Call after the base seated pose and seat support have updated the world matrices.
 */
export function createAvatarTableDrink(avatar,lease,{onComplete=()=>{},onCancel=()=>{}}={}){
 const prop=lease.prop,body=avatar.root,b=avatar.bones,m=avatar.measure;
 body.updateWorldMatrix(true,true);prop.updateWorldMatrix(true,true);
 const originalParent=prop.parent,restP=prop.getWorldPosition(new THREE.Vector3()),restQ=prop.getWorldQuaternion(new THREE.Quaternion());
 const restHand=b.handR.getWorldPosition(new THREE.Vector3()),restHandQ=b.handR.getWorldQuaternion(new THREE.Quaternion());
 const restingHand=b.handL.getWorldPosition(new THREE.Vector3()),restingHandQ=b.handL.getWorldQuaternion(new THREE.Quaternion());
 const fluid=fluidFor(prop),profile=fluid.profile,rim=new THREE.Vector3(0,prop.userData.rimHeight,profile.innerRadiusTop+.002);
 const forward=new THREE.Vector3(0,0,1).transformDirection(body.matrixWorld),liftP=restP.clone().addScaledVector(Y,.065).addScaledVector(forward,-.014);
 const gripOffset=new THREE.Vector3(0,-m.hand*.55,0).add(tableGrip(prop,m,profile));
 let elapsed=0,active=true,last=null,maxWristError=0,lastFlow=0;
 const restHead=b.head.rotation.x,restSpine=b.spine.rotation.x,restChest=b.chest.rotation.x;
 const restShoulder=b.shoulderR.position.clone();
 const contact=(mouth,tilt,away=0)=>{
  const q=restQ.clone().multiply(new THREE.Quaternion().setFromAxisAngle(X,tilt));
  return {q,p:mouth.clone().addScaledVector(forward,away).sub(rim.clone().applyQuaternion(q))};
 };
 const wrist=(p,q)=>{const handQ=q.clone().multiply(HALF_TURN);return {p:p.clone().sub(gripOffset.clone().applyQuaternion(handQ)),q:handQ};};
 const tableHand=wrist(restP,restQ);
 let reachLean=.26;
 // Fit the same reach to each existing cast recipe. The pelvis stays on its seat;
 // shorter arms use a little more torso reach, never a longer forearm.
 for(;reachLean<.42;reachLean+=.01){
  b.spine.rotation.x=restSpine+reachLean*.62;b.chest.rotation.x=restChest+reachLean*.38;body.updateWorldMatrix(true,true);
  if(b.shoulderR.getWorldPosition(new THREE.Vector3()).distanceTo(tableHand.p)<(m.upper+m.fore)*.985)break;
 }
 b.spine.rotation.x=restSpine;b.chest.rotation.x=restChest;body.updateWorldMatrix(true,true);

 function renderAt(t,{allowConsumption=false}={}){
  const phase=sampleCycle(t),u=phase.progress,s=phase.eased;
  const volume=fluid.startingVolumeMl*(prop.userData.portion??lease.startFraction);
  // Raise only as far as the currently available liquid needs. During the flow part,
  // the target follows the same requested remaining volume as the lab controller.
  const desiredFraction=mix(lease.startFraction,lease.endFraction,phase.flowProgress);
  const flowTilt=requiredTilt(profile,Math.max(.0001,fluid.startingVolumeMl*desiredFraction));
  const tip=phase.id==='SIP'?mix(.12,flowTilt,ease(u/SIP_FLOW_START)):flowTilt;
  const near=['CONTACT','SIP','SWALLOW'].includes(phase.id),headWeight=phase.id==='SIP'?ease(u/SIP_FLOW_START):phase.id==='SWALLOW'?1-s:0;
  // The game animator supplies a fresh base pose every rendered frame. These offsets
  // are reapplied from that pose, so paused frames and subdivision do not accumulate.
  let reachWeight=0;
  if(phase.id==='PREPARE')reachWeight=.15*s;
  if(phase.id==='REACH')reachWeight=.15+.85*s;
  if(phase.id==='GRASP')reachWeight=1;
  if(phase.id==='LIFT')reachWeight=1;
  if(phase.id==='APPROACH')reachWeight=1-.8*s;
  if(near)reachWeight=.2;
  if(phase.id==='RECOVER')reachWeight=.2+.8*s;
  if(phase.id==='SET_DOWN')reachWeight=1;
  if(phase.id==='RELEASE')reachWeight=1;
  if(phase.id==='RETURN')reachWeight=1-s;
  b.spine.rotation.x=restSpine+reachLean*.62*reachWeight;
  b.chest.rotation.x=restChest+reachLean*.38*reachWeight;
  b.head.rotation.x=restHead-.08*headWeight;
  b.shoulderR.position.copy(restShoulder);b.shoulderR.position.y+=.016*headWeight;
  body.updateWorldMatrix(true,true);
  const mouth=avatarMouth(avatar),pre=contact(mouth,.12,.027),at=contact(mouth,.12),hold=contact(mouth,tip);
  let glassP=restP.clone(),glassQ=restQ.clone(),handP=restHand.clone(),handQ=restHandQ.clone(),controller='TABLE';
  const liftQ=restQ.clone();
  switch(phase.id){
   case 'PREPARE':break;
   case 'REACH':handP=point(restHand,tableHand.p,s,.035);handQ.slerp(tableHand.q,s);break;
   case 'GRASP':handP.copy(tableHand.p);handQ.copy(tableHand.q);break;
   case 'LIFT':glassP.lerp(liftP,s);controller='TRAJECTORY';break;
   case 'APPROACH':glassP=point(liftP,pre.p,s,.045);glassQ.copy(liftQ).slerp(pre.q,s);controller='TRAJECTORY';break;
   case 'CONTACT':{const k=contact(mouth,.12,.027*(1-s));glassP=k.p;glassQ=k.q;controller='MOUTH';break;}
   case 'SIP':glassP=hold.p;glassQ=hold.q;controller='MOUTH';break;
   case 'SWALLOW':{const k=contact(mouth,mix(requiredTilt(profile,Math.max(.0001,volume)),.12,s));glassP=k.p;glassQ=k.q;controller='MOUTH';break;}
   case 'RECOVER':glassP=point(at.p,liftP,s,.025);glassQ.copy(at.q).slerp(liftQ,s);controller='TRAJECTORY';break;
   case 'SET_DOWN':glassP=point(liftP,restP,s);glassQ.copy(liftQ).slerp(restQ,s);controller='TRAJECTORY';break;
   case 'RELEASE':handP.copy(tableHand.p);handQ.copy(tableHand.q);break;
   case 'RETURN':handP=point(tableHand.p,restHand,s,.035);handQ.copy(tableHand.q).slerp(restHandQ,s);break;
  }
  if(phase.index>=4&&phase.index<=10){const h=wrist(glassP,glassQ);handP=h.p;handQ=h.q;}
  setWorld(prop,glassP,glassQ);
  reach(avatar,handP,'R');
  b.handR.quaternion.copy(b.handR.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(handQ));
  b.handR.updateWorldMatrix(false,true);
  reach(avatar,restingHand,'L');b.handL.quaternion.copy(b.handL.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(restingHandQ));b.handL.updateWorldMatrix(false,true);
  const wristError=b.handR.getWorldPosition(new THREE.Vector3()).distanceTo(handP);maxWristError=Math.max(maxWristError,wristError);
  const actualRim=prop.localToWorld(rim.clone()),rimError=actualRim.distanceTo(mouth);
  const normal=Y.clone().applyQuaternion(glassQ.clone().invert());
  const liquidEdge=new THREE.Vector3(0,profile.interiorTop,profile.innerRadiusTop);
  const edgeVolume=volumeAtPlane(profile,normal,normal.dot(liquidEdge));
  const reachesEdge=volume+.02>=edgeVolume;
  const valid=phase.id==='SIP'&&rimError<.002&&wristError<.003&&reachesEdge;
  if(allowConsumption&&valid&&phase.flowProgress>lastFlow){lastFlow=phase.flowProgress;lease.consume(lastFlow);}
  fluid.update(prop.userData.portion??lease.startFraction);
  if(phase.id==='SWALLOW')avatar.paintFace({expression:'neutral',talk:Math.sin(Math.PI*u)*.08,blink:0});
  last={...phase,controller,rimError,wristError,maxWristError,valid,tilt:phase.id==='SIP'?tip:0,consumedPortion:lease.consumedPortion,
   glassPosition:glassP.toArray(),wristPosition:handP.toArray(),mouth:mouth.toArray()};
  return last;
 }
 function finish(cancelled=false){
  if(!active)return;active=false;
  b.shoulderR.position.copy(restShoulder);
  if(prop.parent===originalParent){setWorld(prop,restP,restQ);fluid.update(prop.userData.portion??lease.startFraction);}
  const result={...(cancelled?lease.cancel():lease.finish()),volumeConsumedMl:Math.max(0,lease.startFraction-(prop.userData.portion??lease.startFraction))*fluid.startingVolumeMl};
  (cancelled?onCancel:onComplete)(result);return result;
 }
 return {
  prop,get active(){return active;},get elapsed(){return elapsed;},get diagnostics(){return last;},
  renderAt,
  update(dt){
   if(!active)return last;if(!lease.active||prop.parent!==originalParent){finish(true);return last;}
   if(dt>0)elapsed=advanceCycle(elapsed,dt,t=>renderAt(t,{allowConsumption:true}));
   else renderAt(elapsed);
   if(elapsed>=CYCLE_DURATION)finish();return last;
  },
  cancel(){return finish(true);},
 };
}

/** Share skin attributes with the existing rig; only a small index buffer is new. */
export function createFirstPersonDrinkingArm(avatar){
 const root=new THREE.Group();root.name='Drinking arm, first person';avatar.root.add(root);
 const originals=[],copies=[];
 avatar.root.traverse(o=>{if((o.isMesh||o.isSprite)&&!o.userData.firstPersonDrinkingArm)originals.push([o,o.visible]);});
 for(const [source] of originals){
  if(!source.isSkinnedMesh)continue;
  const g=source.geometry,si=g.attributes.skinIndex,sw=g.attributes.skinWeight;if(!si||!sw)continue;
  const ids=new Set(source.skeleton.bones.map((bone,i)=>['shoulderR','elbowR','handR'].includes(bone.name)?i:-1));ids.delete(-1);
  const count=g.index?.count||g.attributes.position.count,index=[],groups=[];
  const armAt=i=>{let w=0;for(let k=0;k<4;k++)if(ids.has(si.getComponent(i,k)))w+=sw.getComponent(i,k);return w>.95;};
  for(let i=0;i<count;i+=3){const a=g.index?g.index.getX(i):i,c=g.index?g.index.getX(i+1):i+1,d=g.index?g.index.getX(i+2):i+2;
   if(!armAt(a)||!armAt(c)||!armAt(d))continue;
   const materialIndex=g.groups.find(group=>i>=group.start&&i<group.start+group.count)?.materialIndex||0,last=groups.at(-1);
   if(last?.materialIndex===materialIndex)last.count+=3;else groups.push({start:index.length,count:3,materialIndex});
   index.push(a,c,d);
  }
  if(!index.length)continue;
  const geometry=new THREE.BufferGeometry();for(const [name,attribute] of Object.entries(g.attributes))geometry.setAttribute(name,attribute);
  for(const [name,attributes] of Object.entries(g.morphAttributes))geometry.morphAttributes[name]=attributes;
  geometry.morphTargetsRelative=g.morphTargetsRelative;geometry.setIndex(index);geometry.groups=groups;
  const mesh=new THREE.SkinnedMesh(geometry,source.material);mesh.userData.firstPersonDrinkingArm=true;mesh.name=source.name+' drinking arm';
  mesh.bind(source.skeleton,source.bindMatrix);mesh.bindMode=source.bindMode;mesh.castShadow=source.castShadow;mesh.receiveShadow=source.receiveShadow;mesh.frustumCulled=false;
  root.add(mesh);copies.push({source,mesh});
 }
 let active=false;
 return {
  root,setVisible(show){
   if(show!==active){active=show;for(const [o,visible] of originals)o.visible=show?false:visible;}
   root.visible=show;
   if(show){avatar.root.updateWorldMatrix(true,true);const inv=avatar.root.matrixWorld.clone().invert();for(const {source,mesh} of copies){mesh.matrixAutoUpdate=false;mesh.matrix.copy(inv).multiply(source.matrixWorld);mesh.matrixWorldNeedsUpdate=true;mesh.morphTargetInfluences=source.morphTargetInfluences;}}
  },
  dispose(){for(const [o,visible] of originals)o.visible=visible;root.removeFromParent();for(const {mesh} of copies){
   // Attributes belong to the source mesh. Dispose only after detaching them so a
   // first-person inspection cannot evict the full avatar's GPU buffers.
   for(const name of Object.keys(mesh.geometry.attributes))mesh.geometry.deleteAttribute(name);mesh.geometry.morphAttributes={};mesh.geometry.dispose();
  }},
 };
}
