import * as THREE from '../../vendor/three.module.js';

/** Keep the actual shoe/foot surface on its support, including changed outfits. */
export function createFootGrounder(avatar){
 const inverse=new THREE.Matrix4(),matrix=new THREE.Matrix4(),point=new THREE.Vector3();
 let signature='',supports=[];
 function refresh(){
  const meshes=avatar.root.children.filter(o=>o.isSkinnedMesh&&o.visible),key=meshes.map(o=>o.uuid).join('/');
  if(key===signature)return;signature=key;supports=[];
  const seen=new Set();
  for(const mesh of meshes){
   const g=mesh.geometry;if(seen.has(g))continue;seen.add(g);
   const {position,skinIndex,skinWeight}=g.attributes;if(!skinIndex||!skinWeight)continue;
   for(const name of ['footL','footR']){
    const bone=avatar.bones[name],index=mesh.skeleton.bones.indexOf(bone),samples=[],unique=new Set();
    for(let i=0;i<position.count;i++){
     // Shoe geometry is rigidly attached to the foot; blended leg vertices
     // do not describe the contact surface.
     if(skinIndex.getX(i)!==index||skinWeight.getX(i)<.999)continue;
     point.fromBufferAttribute(position,i).applyMatrix4(mesh.bindMatrix).applyMatrix4(mesh.skeleton.boneInverses[index]);
     const id=point.toArray().map(v=>v.toFixed(6)).join('/');if(unique.has(id))continue;unique.add(id);samples.push(point.clone());
    }
    if(samples.length)supports.push({bone,samples});
   }
  }
 }
 return (floor=0,{airborne=false}={})=>{
  refresh();if(!supports.length)return;
  avatar.root.updateWorldMatrix(true,false);inverse.copy(avatar.root.matrixWorld).invert();
  let lowest=Infinity;
  for(const {bone,samples} of supports){
   bone.updateWorldMatrix(true,false);matrix.multiplyMatrices(inverse,bone.matrixWorld);
   for(const sample of samples)lowest=Math.min(lowest,point.copy(sample).applyMatrix4(matrix).y);
  }
  const correction=floor-avatar.root.position.y-lowest;
  // Deliberate jumps keep their lift, but landing/preparation never crosses
  // the floor. Other poses retain a planted supporting foot.
  avatar.root.position.y+=airborne?Math.max(0,correction):correction;
 };
}
