import * as THREE from '../../vendor/three.module.js';

// A corrective morph for this supplied dress. Its automatic skin weights rotate
// the rear hem down through a chair. Bake the contact correction in the seated
// pose, then let the GPU blend it with the same weight transfer as the skeleton.
// The original asset, skin weights, standing silhouette and other actors stay shared.
// Pelvis and thigh joints on the Meshy rig and on her MakeHuman rebuild.
const HIPS=/^(Hips|LeftUpLeg|RightUpLeg)$/,ARMS=/arm|wrist|finger|metacarpal|clavicle|shoulder/;
export function createThuanSeatDrape(model,entity,seatHeight){
 const mh=!!model.getObjectByName('upperleg01R'),meshes=[],point=new THREE.Vector3(),local=new THREE.Vector3(),delta=new THREE.Vector3(),skinMatrix=new THREE.Matrix4(),boneMatrix=new THREE.Matrix4();
 entity.updateWorldMatrix(true,true);
 model.traverse(mesh=>{
  if(!mesh.isSkinnedMesh)return;mesh.skeleton.update();
  const geometry=mesh.geometry,positions=geometry.attributes.position,weights=geometry.attributes.skinWeight,indices=geometry.attributes.skinIndex,offsets=new Float32Array(positions.count*3);
  const toEntity=new THREE.Matrix4().copy(entity.matrixWorld).invert().multiply(mesh.matrixWorld),fromEntity=new THREE.Matrix3().setFromMatrix4(toEntity).invert();
  for(let i=0;i<positions.count;i++){
   local.fromBufferAttribute(positions,i);
   // The back and sides of the skirt, above the bare knees. Arm vertices are
   // excluded by their skin weights, even when a hand happens to cross the hem.
   if(local.y<.50||local.y>1.02||local.z>.065)continue;
   // On the MakeHuman suit the skirt also follows the lower spine, so there count everything but the arms.
   let garmentWeight=0;for(let k=0;k<4;k++){const bone=mesh.skeleton.bones[indices.array[i*4+k]].name;if(mh?!ARMS.test(bone):HIPS.test(bone))garmentWeight+=weights.array[i*4+k];}
   if(garmentWeight<.90)continue;
   mesh.getVertexPosition(i,point).applyMatrix4(toEntity);
   if(Math.abs(point.x)>.31||point.z<-.25||point.z>.27||point.y>=seatHeight+.016)continue;
   delta.set(0,seatHeight+.016-point.y,0).applyMatrix3(fromEntity);
   skinMatrix.elements.fill(0);
   for(let k=0;k<4;k++){
    const weight=weights.array[i*4+k];if(!weight)continue;boneMatrix.fromArray(mesh.skeleton.boneMatrices,indices.array[i*4+k]*16);
    for(let n=0;n<16;n++)skinMatrix.elements[n]+=boneMatrix.elements[n]*weight;
   }
   skinMatrix.premultiply(mesh.bindMatrixInverse).multiply(mesh.bindMatrix);
   delta.applyMatrix3(new THREE.Matrix3().setFromMatrix4(skinMatrix).invert());offsets.set(delta.toArray(),i*3);
  }
  if(!offsets.some(Boolean))return;
  // Add the correction after any face shapes the mesh already carries (both are relative).
  const existing=geometry.morphAttributes.position||[];if(existing.length&&!geometry.morphTargetsRelative)return;
  mesh.geometry=geometry.clone();mesh.geometry.morphAttributes.position=[...existing,new THREE.BufferAttribute(offsets,3)];
  if(geometry.morphAttributes.normal)mesh.geometry.morphAttributes.normal=[...geometry.morphAttributes.normal,new THREE.BufferAttribute(new Float32Array(offsets.length),3)];
  mesh.geometry.morphTargetsRelative=true;
  const influences=mesh.morphTargetInfluences?.slice(),dictionary=mesh.morphTargetDictionary&&{...mesh.morphTargetDictionary};
  mesh.updateMorphTargets();
  if(influences)influences.forEach((v,j)=>{mesh.morphTargetInfluences[j]=v;});
  if(dictionary){mesh.morphTargetDictionary=dictionary;dictionary.seatDrape=existing.length;}
  meshes.push([mesh,existing.length]);
 });
 return {update(amount){for(const [mesh,index] of meshes)mesh.morphTargetInfluences[index]=amount;}};
}
