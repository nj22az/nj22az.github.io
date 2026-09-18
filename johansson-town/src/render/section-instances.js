import * as THREE from '../../vendor/three.module.js';

// Select nearby instances without drawing a town-wide batch in every section.
export function createSectionInstances(mesh){
 if(!mesh.isInstancedMesh||mesh.count<2||mesh.morphTexture)return null;
 if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
 const transform=new THREE.Matrix4(),world=new THREE.Matrix4(),items=[];
 for(let i=0;i<mesh.count;i++){
  mesh.getMatrixAt(i,transform);world.multiplyMatrices(mesh.matrixWorld,transform);
  items.push({index:i,bounds:mesh.geometry.boundingBox.clone().applyMatrix4(world)});
 }
 const matrix=new THREE.InstancedBufferAttribute(new Float32Array(mesh.count*16),16).setUsage(THREE.DynamicDrawUsage);
 const color=mesh.instanceColor?new THREE.InstancedBufferAttribute(new Float32Array(mesh.count*3),3).setUsage(THREE.DynamicDrawUsage):null;
 let signature=null,count=0;
 return {select(intersects){
  const selected=items.filter(item=>intersects(item.bounds)),key=selected.map(item=>item.index).join(',');
  if(signature!==key){
   signature=key;count=selected.length;
   selected.forEach(({index},i)=>{
    matrix.array.set(mesh.instanceMatrix.array.subarray(index*16,index*16+16),i*16);
    // Asked of the mesh each time rather than trusting the decision made when this
    // was built: a mesh can lose its per-instance colours long after that — the east
    // lawn drops its greens the moment the park's own leaf texture arrives — and the
    // stale answer here dereferenced a null every frame, threw out of the render, and
    // took the ink and the grade down with it for the rest of the session.
    if(color&&mesh.instanceColor)color.array.set(mesh.instanceColor.array.subarray(index*3,index*3+3),i*3);
   });
   matrix.needsUpdate=true;if(color)color.needsUpdate=true;
  }
  return {matrix,color,count};
 }};
}
