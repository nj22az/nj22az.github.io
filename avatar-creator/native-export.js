import * as THREE from '../johansson-town/vendor/three.module.js';
import {buildAvatar,BONES} from '../johansson-town/src/avatars/build.js';

/** Johansson Studio -> native runtime. Exact builder geometry, skin weights, rest
 * skeleton, painted face, garment texture and separate accessories. No replacement
 * character construction, mesh decimation or silhouette changes are performed. */
export function exportNativeFighter(recipe){
 const avatar=buildAvatar(recipe,{shadows:false,faceSize:512});
 try{
  avatar.root.rotation.set(0,0,0);avatar.root.updateMatrixWorld(true);avatar.body.skeleton.update();
  avatar.paintFace({expression:'neutral',blink:0,talk:0,look:[0,0]});
  const atlas=document.createElement('canvas');atlas.width=512;atlas.height=1024;
  const ctx=atlas.getContext('2d');ctx.clearRect(0,0,512,1024);
  ctx.drawImage(avatar.face.canvas,0,0,512,512);
  ctx.drawImage(avatar.garment.canvas,0,512,512,352);
  const bones=BONES.map(name=>avatar.bones[name]);
  const records=[],opaque=[],transparent=[];
  const v=new THREE.Vector3(),n=new THREE.Vector3(),normalMatrix=new THREE.Matrix3();
  const srgb=c=>c<=.0031308?c*12.92:1.055*Math.pow(c,1/2.4)-.055;
  avatar.root.traverseVisible(mesh=>{
   if(!mesh.isMesh||mesh.userData.outline)return;
   if(Array.isArray(mesh.material))throw Error('Multi-material mesh is unsupported; export stopped.');
   const g=mesh.geometry,mat=mesh.material,P=g.attributes.position,N=g.attributes.normal,C=g.attributes.color,U=g.attributes.uv;
   const weights=g.attributes.skinWeight,ids=g.attributes.skinIndex;
   let rigid=mesh.parent;while(rigid&&!rigid.isBone)rigid=rigid.parent;
   const bone=rigid?BONES.indexOf(rigid.name):0;
   normalMatrix.getNormalMatrix(mesh.matrixWorld);
   const isFace=mat.map===avatar.face.texture,isGarment=mat.map===avatar.garment.texture;
   if(mat.map&&!isFace&&!isGarment)throw Error('Unrecognised texture: '+mesh.name);
   const target=mat.transparent&&mat.opacity<1?transparent:opaque;
   const end=Math.min(g.index?.count??P.count,g.drawRange.start+g.drawRange.count);
   for(let i=g.drawRange.start;i<end;i++){
    const k=g.index?g.index.getX(i):i;
    v.fromBufferAttribute(P,k).applyMatrix4(mesh.matrixWorld);n.fromBufferAttribute(N,k).applyMatrix3(normalMatrix).normalize();
    const colour=mat.color.clone();if(C)colour.multiply(new THREE.Color(C.getX(k),C.getY(k),C.getZ(k)));
    const record=[v.x,v.y,v.z,n.x,n.y,n.z,srgb(colour.r),srgb(colour.g),srgb(colour.b),mat.opacity,
      U?U.getX(k):0,isFace?(1-U.getY(k))*.5:isGarment?.5+(1-U.getY(k))*352/1024:0,isFace?2:isGarment?1:0,
      ids?ids.getX(k):bone,ids?ids.getY(k):0,ids?ids.getZ(k):0,ids?ids.getW(k):0,
      weights?weights.getX(k):1,weights?weights.getY(k):0,weights?weights.getZ(k):0,weights?weights.getW(k):0];
    if(record.some(x=>!Number.isFinite(x)))throw Error('Non-finite vertex in '+mesh.name);
    const outline=new THREE.Vector3();
    if(mesh===avatar.body)outline.fromBufferAttribute(N,k).applyMatrix3(normalMatrix).multiplyScalar(g.attributes.ink?.getX(k)??1);
    else if(mesh===avatar.face.head)outline.fromBufferAttribute(P,k).normalize().transformDirection(mesh.matrixWorld);
    record.push(outline.x,outline.y,outline.z);target.push(record);
   }
  });
  records.push(...opaque,...transparent);
  const headerBytes=28,boneBytes=112,vertexBytes=96,texture=ctx.getImageData(0,0,512,1024).data;
  const bytes=new ArrayBuffer(headerBytes+bones.length*boneBytes+records.length*vertexBytes+texture.length),view=new DataView(bytes);let at=0;
  const u32=x=>{view.setUint32(at,x,true);at+=4;},f32=x=>{view.setFloat32(at,x,true);at+=4;};
  u32(0x3346574a);u32(records.length);u32(bones.length);u32(512);u32(1024);u32(opaque.length);f32(avatar.height);
  const encoder=new TextEncoder();
  for(let i=0;i<bones.length;i++){
   new Uint8Array(bytes,at,32).set(encoder.encode(BONES[i]).slice(0,31));at+=32;
   view.setInt32(at,bones.indexOf(bones[i].parent),true);at+=4;
   f32(bones[i].position.x);f32(bones[i].position.y);f32(bones[i].position.z);
   avatar.body.skeleton.boneInverses[i].elements.forEach(f32);
  }
  for(const record of records)record.forEach(f32);
  new Uint8Array(bytes,at).set(texture);
  return {bytes,recipe:avatar.recipe,vertices:records.length,opaqueVertices:opaque.length,bones:BONES.length,height:avatar.height,
    format:'Johansson Studio native fighter',version:3,texture:{width:512,height:1024},source:'buildAvatar + recipeFor (World and Studio shared)'};
 }finally{avatar.dispose();}
}
