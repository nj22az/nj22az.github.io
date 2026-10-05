import * as THREE from '../../vendor/three.module.js';

/** Fit the rendered pelvis/upper thighs to the seat, including shorts and skirts. */
export function createSeatSupport(avatar){
 const point=new THREE.Vector3(),inverse=new THREE.Matrix4(),matrix=new THREE.Matrix4();
 let signature='',supports=[];
 function refresh(){
  const meshes=avatar.root.children.filter(o=>o.isSkinnedMesh&&o.visible&&!o.name.includes('outline'));
  const key=meshes.map(o=>o.uuid).join('/');if(key===signature)return;
  signature=key;supports=[];
  const m=avatar.measure;
  for(const mesh of meshes){
   const {position,skinIndex,skinWeight}=mesh.geometry.attributes;if(!skinIndex||!skinWeight)continue;
   const indices=[],unique=new Set();
   for(let i=0;i<position.count;i++){
    const y=position.getY(i);
    if(y<m.hipY-m.thigh*.5||y>m.hipY+m.legR*.5)continue;
    const bones=[skinIndex.getX(i),skinIndex.getY(i),skinIndex.getZ(i),skinIndex.getW(i)];
    const weights=[skinWeight.getX(i),skinWeight.getY(i),skinWeight.getZ(i),skinWeight.getW(i)];
    if(!bones.every((b,j)=>weights[j]<.001||['hips','thighL','thighR'].includes(mesh.skeleton.bones[b]?.name)))continue;
    const id=[position.getX(i),y,position.getZ(i),...bones,...weights].join('/');
    if(unique.has(id))continue;unique.add(id);indices.push(i);
   }
   if(indices.length)supports.push({mesh,indices});
  }
 }
 return (height)=>{
  refresh();if(!supports.length)return;
  avatar.root.updateWorldMatrix(true,true);inverse.copy(avatar.root.matrixWorld).invert();
  let lowest=Infinity;
  for(const {mesh,indices} of supports){
   matrix.multiplyMatrices(inverse,mesh.matrixWorld);
   for(const i of indices){mesh.getVertexPosition(i,point);lowest=Math.min(lowest,point.applyMatrix4(matrix).y);}
  }
  avatar.root.position.y+=height-avatar.root.position.y-lowest;
 };
}
