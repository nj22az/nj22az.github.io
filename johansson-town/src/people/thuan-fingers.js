import * as THREE from '../../vendor/three.module.js';

const NAMES=['Thumb','Index','Middle','Ring','Pinky'];
const UP=new THREE.Vector3(0,1,0);

function repairDressWeights(mesh){
 // In this export the skirt and bare hands are separate surfaces: below .79m
 // the skirt ends inside |x|=.275, while the hands begin outside that gap.
 // Automatic weights nevertheless assigned part of the hem to the wrists.
 // Repair it before fitting fingers, or those folds become false fingertips.
 const {position,skinIndex:joints,skinWeight:weights}=mesh.geometry.attributes;
 const bones=mesh.skeleton.bones,garment=[],affected=[],point=new THREE.Vector3();
 for(let i=0;i<position.count;i++){
  point.fromBufferAttribute(position,i).applyMatrix4(mesh.matrixWorld);
  if(point.y<.59||point.y>.79||Math.abs(point.x)>.275)continue;
  let arm=0,body=0;
  for(let k=0;k<4;k++){
   const name=bones[joints.getComponent(i,k)].name,weight=weights.getComponent(i,k);
   if(/Arm|Hand/.test(name))arm+=weight;
   if(/^(Hips|LeftUpLeg|RightUpLeg)$/.test(name))body+=weight;
  }
  if(arm>.00001)affected.push({index:i,point:point.clone()});
  else if(body>.999)garment.push({index:i,point:point.clone()});
 }
 for(const vertex of affected){
  let closest=null,distance=Infinity;
  for(const guide of garment){const d=vertex.point.distanceToSquared(guide.point);if(d<distance){distance=d;closest=guide;}}
  if(!closest)continue;
  for(let k=0;k<4;k++){
   joints.setComponent(vertex.index,k,joints.getComponent(closest.index,k));
   weights.setComponent(vertex.index,k,weights.getComponent(closest.index,k));
  }
 }
 joints.needsUpdate=true;weights.needsUpdate=true;
}

function collectHand(mesh,side){
 const bones=mesh.skeleton.bones,hand=bones.find(b=>b.name===side+'Hand'),end=bones.find(b=>b.name===side+'Hand_End');
 if(!hand||!end)return null;
 const hi=bones.indexOf(hand),ei=bones.indexOf(end);
 const pos=mesh.geometry.attributes.position,joints=mesh.geometry.attributes.skinIndex,weights=mesh.geometry.attributes.skinWeight;
 const local=new THREE.Vector3(),world=new THREE.Vector3(),points=[];
 for(let i=0;i<pos.count;i++){
  const js=[joints.getX(i),joints.getY(i),joints.getZ(i),joints.getW(i)],ws=[weights.getX(i),weights.getY(i),weights.getZ(i),weights.getW(i)];
  let palm=0,tip=0;for(let k=0;k<4;k++){if(js[k]===hi)palm+=ws[k];if(js[k]===ei)tip+=ws[k];}
  if(palm+tip<.35)continue;
  world.fromBufferAttribute(pos,i).applyMatrix4(mesh.matrixWorld);local.copy(world);hand.worldToLocal(local);
  points.push({index:i,palm,tip,local:local.clone(),world:world.clone(),along:local.y,spread:local.x,pad:local.z});
 }
 return {hand,end,hi,ei,points};
}

function clusterFingers(points){
 const distal=points.filter(p=>p.along>.07);if(distal.length<40)return [];
 const spread=distal.map(p=>p.spread+p.pad*.55),min=Math.min(...spread),max=Math.max(...spread);
 let centres=NAMES.map((_,i)=>min+(i+.5)/5*(max-min));
 for(let pass=0;pass<8;pass++){
  const buckets=NAMES.map(()=>[]);
  for(const p of distal){
   const s=p.spread+p.pad*.55;let best=0,bestD=Infinity;
   for(let i=0;i<5;i++){const d=Math.abs(s-centres[i]);if(d<bestD){bestD=d;best=i;}}
   buckets[best].push(p);
  }
  centres=buckets.map((bucket,i)=>bucket.length?bucket.reduce((n,p)=>n+p.spread+p.pad*.55,0)/bucket.length:centres[i]);
 }
 const chains=centres.map((centre,i)=>{
  const members=points.filter(p=>{
   const s=p.spread+p.pad*.55;let best=0,bestD=Infinity;
   for(let k=0;k<5;k++){const d=Math.abs(s-centres[k]);if(d<bestD){bestD=d;best=k;}}
   return best===i&&p.along>-.01;
  });
  if(members.length<8)return null;
  const tip=members.reduce((a,b)=>a.along>b.along?a:b);
  const knuckleAlong=Math.max(.028,members.reduce((n,p)=>n+p.along,0)/members.length*.22);
  const at=along=>{
   const near=members.filter(p=>Math.abs(p.along-along)<.018);const use=near.length?near:members;
   const point=new THREE.Vector3();for(const p of use)point.add(p.local);point.multiplyScalar(1/use.length);point.y=along;return point;
  };
  return {centre,members,tip:tip.local.clone(),root:at(knuckleAlong),mid:at((knuckleAlong+tip.along)*.52),end:at(tip.along*.94),meanAlong:members.reduce((n,p)=>n+p.along,0)/members.length};
 }).filter(Boolean);
 if(chains.length<3)return [];
 chains.sort((a,b)=>a.centre-b.centre);
 const thumb=chains.reduce((a,b)=>a.meanAlong<b.meanAlong?a:b);
 const others=chains.filter(c=>c!==thumb);others.sort((a,b)=>a.centre-b.centre);
 while(others.length<4)others.push(others[others.length-1]);
 return [thumb,...others.slice(0,4)];
}

function addChain(hand,side,name,chain){
 const joints=[];
 const points=[chain.root,chain.mid,chain.end];
 let parent=hand;
 for(let i=0;i<3;i++){
  const bone=new THREE.Bone();bone.name=side+'Hand'+name+(i+1);
  const start=points[i].clone(),end=(points[i+1]||start.clone().add(start.clone().sub(points[i-1]||start).setLength(.018)));
  const parentInverse=parent.matrixWorld.clone().invert();
  const localStart=start.clone().applyMatrix4(hand.matrixWorld).applyMatrix4(parentInverse);
  const localEnd=end.clone().applyMatrix4(hand.matrixWorld).applyMatrix4(parentInverse);
  const dir=localEnd.clone().sub(localStart);const length=Math.max(.012,dir.length());dir.normalize();
  bone.position.copy(localStart);
  bone.quaternion.setFromUnitVectors(UP,dir);
  parent.add(bone);parent.updateWorldMatrix(false,true);
  bone.userData.finger={side,name,segment:i,length};
  joints.push(bone);parent=bone;
 }
 return joints;
}

function pickCurlAxis(bone){
 const child=bone.children.find(o=>o.isBone);if(!child)return new THREE.Vector3(1,0,0);
 const hand=bone;let node=bone;while(node&&!/Hand$/.test(node.name))node=node.parent;
 const palm=node||bone.parent;
 const rest=child.getWorldPosition(new THREE.Vector3());
 const toward=palm.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.02,0).applyQuaternion(palm.getWorldQuaternion(new THREE.Quaternion())));
 let best=new THREE.Vector3(1,0,0),bestScore=Infinity;
 for(const axis of [new THREE.Vector3(1,0,0),new THREE.Vector3(-1,0,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,-1)]){
  bone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(axis,.35));bone.updateWorldMatrix(false,true);
  const score=child.getWorldPosition(new THREE.Vector3()).distanceTo(toward);
  bone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(axis,-.35));bone.updateWorldMatrix(false,true);
  if(score<bestScore){bestScore=score;best=axis.clone();}
 }
 child.getWorldPosition(rest);
 return best;
}

function paintWeights(mesh,chains){
 const pos=mesh.geometry.attributes.position,joints=mesh.geometry.attributes.skinIndex,weights=mesh.geometry.attributes.skinWeight;
 const bones=mesh.skeleton.bones,indexOf=bone=>bones.indexOf(bone);
 const world=new THREE.Vector3();
 for(const {side,hi,ei,points,fingers} of chains){
  const hand=bones.find(b=>b.name===side+'Hand');
  for(const point of points){
   world.copy(point.world);
   const contributions=[];
   if(point.along<.034)contributions.push({index:hi,weight:1});
   else{
    let nearest=fingers[0],nearestD=Infinity;
    for(const finger of fingers){
     const d=finger.joints.reduce((n,bone)=>n+bone.getWorldPosition(new THREE.Vector3()).distanceTo(world),0);
     if(d<nearestD){nearestD=d;nearest=finger;}
    }
    const palmKeep=THREE.MathUtils.clamp(1-point.along/.05,0,.55);
    contributions.push({index:hi,weight:palmKeep});
    nearest.joints.forEach((bone,segment)=>{
     const start=bone.getWorldPosition(new THREE.Vector3());
     const child=bone.children.find(o=>o.isBone);
     const end=child?child.getWorldPosition(new THREE.Vector3()):start.clone().add(new THREE.Vector3(0,bone.userData.finger.length,0).applyQuaternion(bone.getWorldQuaternion(new THREE.Quaternion())));
     const span=end.clone().sub(start),length=span.length()||.001,t=THREE.MathUtils.clamp(world.clone().sub(start).dot(span)/length/length,0,1);
     const closest=start.clone().addScaledVector(span,t),dist=world.distanceTo(closest);
     contributions.push({index:indexOf(bone),weight:Math.pow(Math.max(.0008,dist),-1.8)*(segment===2&&point.along>.11?1.35:1)});
    });
   }
   const total=contributions.reduce((n,c)=>n+c.weight,0)||1;
   const ranked=contributions.map(c=>({...c,weight:c.weight/total})).sort((a,b)=>b.weight-a.weight).slice(0,4);
   const norm=ranked.reduce((n,c)=>n+c.weight,0)||1;
   const idx=[0,0,0,0],w=[0,0,0,0];
   ranked.forEach((c,k)=>{idx[k]=c.index;w[k]=c.weight/norm;});
   joints.setXYZW(point.index,...idx);weights.setXYZW(point.index,...w);
  }
 }
 joints.needsUpdate=true;weights.needsUpdate=true;
}

export const FINGER_CURL={
 Thumb:[.18,.28,.16],
 Index:[.32,.42,.22],
 Middle:[.38,.48,.26],
 Ring:[.44,.54,.3],
 Pinky:[.5,.6,.34]
};

export function curlFingers(root,amount=1,style=FINGER_CURL){
 root.updateWorldMatrix(true,true);
 for(const side of ['Left','Right'])for(const name of NAMES){
  const curl=style[name]||FINGER_CURL.Index;
  for(let i=0;i<3;i++){
   const bone=root.getObjectByName(side+'Hand'+name+(i+1));if(!bone)continue;
   const axis=new THREE.Vector3().fromArray(bone.userData.curlAxis||[1,0,0]);
   bone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(axis,curl[i]*amount*(name==='Thumb'&&i===0?(side==='Left'?1:-1)*.35+1:1)));
   bone.updateWorldMatrix(false,true);
  }
 }
}

export function rigThuanFingers(asset){
 const scene=asset.scene;scene.updateMatrixWorld(true);
 if(scene.getObjectByName('LeftHandIndex1'))return scene;
 let mesh;scene.traverse(o=>{if(o.isSkinnedMesh)mesh=o;});if(!mesh)return scene;
 repairDressWeights(mesh);
 const skeleton=mesh.skeleton,added=[],painted=[];
 for(const side of ['Left','Right']){
  const collected=collectHand(mesh,side);if(!collected)continue;
  const chains=clusterFingers(collected.points);if(chains.length<5)continue;
  const fingers=chains.map((chain,i)=>{
   const name=NAMES[i];
   const joints=addChain(collected.hand,side,name,chain);
   added.push(...joints);
   return {name,joints};
  });
  painted.push({side,hi:collected.hi,ei:collected.ei,points:collected.points,fingers});
 }
 if(!added.length)return scene;
 scene.updateMatrixWorld(true);
 const bones=[...skeleton.bones,...added];
 const inverses=bones.map(bone=>bone.matrixWorld.clone().invert());
 mesh.bind(new THREE.Skeleton(bones,inverses),mesh.bindMatrix);
 paintWeights(mesh,painted);
 for(const bone of added){
  bone.userData.curlAxis=pickCurlAxis(bone).toArray();
  bone.userData.rest=bone.quaternion.toArray();
 }
 curlFingers(scene,.85);
 for(const bone of added)bone.userData.relaxed=bone.quaternion.toArray();
 return scene;
}

export function fingerTracks(root,times,amountAt){
 const tracks=[];
 for(const side of ['Left','Right'])for(const name of NAMES)for(let i=0;i<3;i++){
  const bone=root.getObjectByName(side+'Hand'+name+(i+1));if(!bone||!bone.userData.rest)continue;
  const values=[];
  for(const t of times){
   const amount=amountAt(t,side,name,i);
   const q=new THREE.Quaternion().fromArray(bone.userData.rest).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3().fromArray(bone.userData.curlAxis||[1,0,0]),(FINGER_CURL[name]||FINGER_CURL.Index)[i]*amount));
   values.push(...q.toArray());
  }
  tracks.push(new THREE.QuaternionKeyframeTrack(bone.name+'.quaternion',times,values));
 }
 return tracks;
}
