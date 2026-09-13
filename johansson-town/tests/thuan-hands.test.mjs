import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {rigThuanFingers} from '../src/people/thuan-fingers.js';
import {createLocalCharacters,preloadCharacter} from '../src/people/models.js';
import {installDOM} from './fixtures.mjs';

async function setup(run){
 installDOM();const previous={fetch,self:globalThis.self,bitmap:globalThis.createImageBitmap};
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 globalThis.fetch=async input=>String(input).startsWith('blob:')?previous.fetch(input):new Response(await readFile(new URL('../assets/'+new URL(input).pathname.split('/assets/')[1],import.meta.url)));
 try{await run();}finally{globalThis.fetch=previous.fetch;globalThis.self=previous.self;globalThis.createImageBitmap=previous.bitmap;}
}

test('moving Thuan’s wrists and fingers cannot pull the skirt out of shape',()=>setup(async()=>{
 const b=await readFile(new URL('../assets/characters/yuri/yuri-merged.glb',import.meta.url));
 const asset=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 let mesh;asset.scene.traverse(o=>{if(o.isSkinnedMesh)mesh=o;});
 const positions=mesh.geometry.attributes.position,original=positions.array.slice(),skirt=[];
 // Sample both visible sides of the hem in the supplied, unposed mesh.
 for(let i=0;i<positions.count;i++)if(positions.getY(i)>.62&&positions.getY(i)<.74&&Math.abs(positions.getX(i))>.12&&Math.abs(positions.getX(i))<.24)skirt.push(i);
 assert.ok(skirt.length>500);
 rigThuanFingers(asset);asset.scene.updateMatrixWorld(true);mesh.skeleton.update();
 const before=skirt.map(i=>mesh.getVertexPosition(i,new T.Vector3()));
 for(const side of ['Left','Right']){
  asset.scene.getObjectByName(side+'Hand').rotateX(.8);
  asset.scene.getObjectByName(side+'Hand').rotateZ(.6);
  asset.scene.getObjectByName(side+'HandPinky1').rotateZ(.5);
 }
 asset.scene.updateMatrixWorld(true);mesh.skeleton.update();
 for(let j=0;j<skirt.length;j++)assert.ok(mesh.getVertexPosition(skirt[j],new T.Vector3()).distanceTo(before[j])<.00001,'The dress must follow the body, not the hand');
 assert.deepEqual(positions.array,original,'Skinning repair preserves the supplied surface');
}));

function handSurfaceCheck(mesh,label){
 mesh.updateWorldMatrix(true,false);mesh.skeleton.update();
 const {position,skinIndex,skinWeight}=mesh.geometry.attributes,points=[],body=[],hands=[];
 for(let i=0;i<position.count;i++){
  let torso=0,hand=0;
  for(let k=0;k<4;k++){
   const name=mesh.skeleton.bones[skinIndex.getComponent(i,k)].name,w=skinWeight.getComponent(i,k);
   if(/^(Hips|Spine\d*|LeftUpLeg|RightUpLeg)$/.test(name))torso+=w;
   if(/Hand/.test(name))hand+=w;
  }
  body[i]=torso>.6;
  if(body[i]||hand>.5)points[i]=mesh.getVertexPosition(i,new T.Vector3());
  if(hand>.5)hands.push(points[i]);
 }
 const indices=mesh.geometry.index.array,triangles=[];
 for(let i=0;i<indices.length;i+=3){
  const [a,b,c]=[indices[i],indices[i+1],indices[i+2]];if(!body[a]||!body[b]||!body[c])continue;
  const triangle=new T.Triangle(points[a],points[b],points[c]),bounds=new T.Box3().setFromPoints([triangle.a,triangle.b,triangle.c]);
  const u=triangle.b.clone().sub(triangle.a),v=triangle.c.clone().sub(triangle.a),det=u.y*v.z-u.z*v.y;
  triangles.push({triangle,bounds,u,v,det});
 }
 const closest=new T.Vector3();
 for(const p of hands){
  let left=Infinity,right=-Infinity;
  for(const {triangle,bounds,u,v,det} of triangles){
   if(bounds.distanceToPoint(p)<.015){triangle.closestPointToPoint(p,closest);assert.ok(closest.distanceTo(p)>.012,label+': a hand touches the dress');}
   // Find the outer dress span along this horizontal line. Use both sides:
   // the scanned fabric has overlapping folds and is not a watertight solid.
   if(Math.abs(det)<1e-9||p.y<bounds.min.y||p.y>bounds.max.y||p.z<bounds.min.z||p.z>bounds.max.z)continue;
   const y=p.y-triangle.a.y,z=p.z-triangle.a.z,s=(y*v.z-z*v.y)/det,t=(u.y*z-u.z*y)/det;
   if(s<0||t<0||s+t>1)continue;
   const x=triangle.a.x+s*u.x+t*v.x;left=Math.min(left,x);right=Math.max(right,x);
  }
  assert.ok(p.x<left||p.x>right,label+': a hand is inside the dress');
 }
}

test('Thuan’s hands clear her dress through idle loops and release smoothly after work',()=>setup(async()=>{
 await preloadCharacter('Thuan');const controller=createLocalCharacters(),room=new T.Group(),entity=new T.Group();
 room.position.set(6,0,-4);room.rotation.y=.7;room.add(entity);entity.rotation.y=1.1;
 const actor=controller.attach(entity,'Thuan'),arms=Object.values(actor.mealMotion.arms);
 let mesh;actor.model.traverse(o=>{if(o.isSkinnedMesh)mesh=o;});
 const lengths=()=>arms.flatMap(a=>[a.upper.getWorldPosition(new T.Vector3()).distanceTo(a.lower.getWorldPosition(new T.Vector3())),a.lower.getWorldPosition(new T.Vector3()).distanceTo(a.hand.getWorldPosition(new T.Vector3()))]);
 const originalLengths=lengths();let last=[];
 const step=(seconds,walking=false)=>{for(let i=0;i<Math.round(seconds*60);i++){
  if(walking)entity.position.x+=1.25/60;
  controller.update(1/60);room.updateMatrixWorld(true);
  const hands=arms.map(a=>entity.worldToLocal(a.hand.getWorldPosition(new T.Vector3())));
  if(last.length)hands.forEach((p,j)=>assert.ok(p.distanceTo(last[j])<.055,'No snap during '+actor.current+': '+p.distanceTo(last[j])));
  last=hands;lengths().forEach((length,j)=>assert.ok(Math.abs(length-originalLengths[j])<.00001,'Arm bones retain their length'));
 }};
 for(const pose of ['Idle_Neutral','CounterIdle']){
  entity.userData.socialPose=pose;step(.5);
  for(let i=0;i<4;i++){step(1.5);handSurfaceCheck(mesh,pose+' '+i);}
 }
 delete entity.userData.socialPose;step(1,true);assert.equal(actor.current,'Walk');step(1);handSurfaceCheck(mesh,'after walking');
 entity.userData.carrying=true;step(.6);handSurfaceCheck(mesh,'carrying');
 delete entity.userData.carrying;step(.6);handSurfaceCheck(mesh,'after carrying');
 entity.userData.shopGoods=true;entity.userData.heldItem='shop-milk';step(.6);handSurfaceCheck(mesh,'holding goods');
 delete entity.userData.shopGoods;delete entity.userData.heldItem;step(.6);handSurfaceCheck(mesh,'after serving');
}));
