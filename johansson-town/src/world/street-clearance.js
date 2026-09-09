// Geometry and collision cleanup are applied together before the world is active.
// The manifest contains whole connected components from the exact source GLB.
export function applyStreetClearance(scene,navigation,manifest){
 const meshes=[];scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
 if(manifest.version!==1||manifest.sourceColliders!==navigation.colliders.length||meshes.length!==manifest.meshes.length)throw Error('Street clearance does not match the town');
 const plans=manifest.meshes.map((entry,i)=>{
  const mesh=meshes[i],index=mesh.geometry.index;
  if(!index||index.count!==entry.indexCount||mesh.name!==entry.name)throw Error('Street clearance mesh mismatch');
  let end=0;for(const [start,count] of entry.remove){if(!Number.isInteger(start)||!Number.isInteger(count)||count<=0||start<end||3*(start+count)>index.count)throw Error('Invalid street clearance range');end=start+count;}
  const removed=entry.remove.reduce((sum,[,count])=>sum+count,0),kept=new index.array.constructor(index.count-removed*3);
  let from=0,to=0;for(const [start,count] of entry.remove){const stop=start*3;kept.set(index.array.subarray(from,stop),to);to+=stop-from;from=(start+count)*3;}kept.set(index.array.subarray(from),to);
  return {mesh,index,kept,removed};
 });
 const remove=new Set(manifest.removedColliders);
 if(remove.size!==manifest.removedColliders.length||[...remove].some(i=>!Number.isInteger(i)||i<0||i>=navigation.colliders.length))throw Error('Invalid street collider removal');
 // Commit only after every entry has validated. No partial visual/physics edits.
 for(const {mesh,index,kept} of plans)mesh.geometry.setIndex(new index.constructor(kept,1));
 return {colliders:navigation.colliders.filter((_,i)=>!remove.has(i)),removedColliders:remove.size,removedTriangles:plans.reduce((sum,p)=>sum+p.removed,0)};
}
