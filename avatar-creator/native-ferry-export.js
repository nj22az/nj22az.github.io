import * as THREE from '../johansson-town/vendor/three.module.js';
import {buildFerryModel,FERRY_CASINGS,FERRY_HULL} from '../johansson-town/src/world/ferry-model.js';

/** Export World's actual ferry geometry for the forward car-deck arena. Retained
 * triangles keep their positions, normals, vertex colours and source UVs. Hidden
 * aft/below-deck triangles are omitted; no ship geometry is reconstructed. */
export function exportNativeFerry(){
 const ferry=buildFerryModel({shadows:false});ferry.updateMatrixWorld(true);
 const deckY=ferry.userData.deckY,originZ=24-FERRY_HULL.length/2,meshes=[],maps=new Map();let sourceVertices=0;
 const p=new THREE.Vector3();
 ferry.traverseVisible(mesh=>{
  if(!mesh.isMesh)return;
  const g=mesh.geometry,P=g.attributes.position,I=g.index,indices=[];
  for(let i=g.drawRange.start;i<Math.min(I?.count??P.count,g.drawRange.start+g.drawRange.count);i+=3){
   sourceVertices+=3;let ymax=-Infinity,zmax=-Infinity;
   for(let j=0;j<3;j++){p.fromBufferAttribute(P,I?I.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld);ymax=Math.max(ymax,p.y);zmax=Math.max(zmax,p.z);}
   if(ymax>=deckY-.12&&(zmax>=FERRY_CASINGS.fore-.15||!mesh.material.map))for(let j=0;j<3;j++)indices.push(I?I.getX(i+j):i+j);
  }
  if(!indices.length)return;
  if(Array.isArray(mesh.material))throw Error('Ferry multi-material mesh needs explicit grouping.');
  meshes.push({mesh,indices});const t=mesh.material.map;
  if(t&&!maps.has(t.uuid))maps.set(t.uuid,{texture:t,w:t.image.width,h:t.image.height});
 });
 const size=2048,atlas=document.createElement('canvas');atlas.width=atlas.height=size;
 const ctx=atlas.getContext('2d');let x=2,y=2,row=0;
 for(const map of [...maps.values()].sort((a,b)=>b.h-a.h)){
  if(x+map.w+2>size){x=2;y+=row+4;row=0;}
  if(y+map.h+2>size)throw Error('Ferry texture atlas exceeds GLES2 atlas budget.');
  map.x=x;map.y=y;ctx.drawImage(map.texture.image,x,y);
  // Duplicate the edge texels into the padding to avoid filtering seams.
  ctx.drawImage(map.texture.image,0,0,1,map.h,x-1,y,1,map.h);ctx.drawImage(map.texture.image,map.w-1,0,1,map.h,x+map.w,y,1,map.h);
  ctx.drawImage(map.texture.image,0,0,map.w,1,x,y-1,map.w,1);ctx.drawImage(map.texture.image,0,map.h-1,map.w,1,x,y+map.h,map.w,1);
  x+=map.w+4;row=Math.max(row,map.h);
 }
 const opaque=[],transparent=[],n=new THREE.Vector3(),nm=new THREE.Matrix3(),uv=new THREE.Vector2();
 const srgb=c=>c<=.0031308?c*12.92:1.055*Math.pow(c,1/2.4)-.055;
 for(const {mesh,indices} of meshes){
  const g=mesh.geometry,P=g.attributes.position,N=g.attributes.normal,C=g.attributes.color,U=g.attributes.uv,m=mesh.material;
  const target=m.transparent?transparent:opaque,map=m.map?maps.get(m.map.uuid):null;
  nm.getNormalMatrix(mesh.matrixWorld);m.map?.updateMatrix();
  for(const k of indices){
   p.fromBufferAttribute(P,k).applyMatrix4(mesh.matrixWorld);n.fromBufferAttribute(N,k).applyMatrix3(nm).normalize();
   const c=m.color.clone();if(C)c.multiply(new THREE.Color(C.getX(k),C.getY(k),C.getZ(k)));
   let u=0,v=0;if(map){uv.fromBufferAttribute(U,k).applyMatrix3(m.map.matrix);u=(map.x+THREE.MathUtils.clamp(uv.x,0,1)*map.w)/size;v=(map.y+(1-THREE.MathUtils.clamp(uv.y,0,1))*map.h)/size;}
   target.push([p.x,p.y-deckY,p.z-originZ,n.x,n.y,n.z,srgb(c.r),srgb(c.g),srgb(c.b),m.opacity,u,v,map?2:0,0,0,0,0,1,0,0,0,0,0,0]);
  }
 }
 const records=opaque.concat(transparent),pixels=ctx.getImageData(0,0,size,size).data;
 const bytes=new ArrayBuffer(28+112+records.length*96+pixels.length),view=new DataView(bytes);let at=0;
 const u32=v=>{view.setUint32(at,v,true);at+=4;},f32=v=>{view.setFloat32(at,v,true);at+=4;};
 u32(0x3346574a);u32(records.length);u32(1);u32(size);u32(size);u32(opaque.length);f32(1);
 new Uint8Array(bytes,at,32).set(new TextEncoder().encode('ferry-static'));at+=32;view.setInt32(at,-1,true);at+=4;
 for(let k=0;k<3;k++)f32(0);for(let k=0;k<16;k++)f32(k%5===0?1:0);
 for(const r of records)r.forEach(f32);new Uint8Array(bytes,at).set(pixels);
 return {bytes,vertices:records.length,opaqueVertices:opaque.length,sourceVertices,sourceMeshes:meshes.length,textures:maps.size,
  format:'Johansson Studio native ferry arena',version:3,source:'buildFerryModel',ship:'Minato Maru',origin:{station:24,sourceDeckY:deckY,sourceZ:originZ},
  selection:{structuralGeometry:'All above-deck untextured source triangles retained',minTriangleMaxY:deckY-.12,minTriangleMaxZ:FERRY_CASINGS.fore-.15},atlas:{width:size,height:size},geometry:'Original source triangles; only a coordinate-origin translation is applied'};
}
