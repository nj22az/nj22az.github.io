// Remove the bush centred on the western approach and the detached blossom card.
// The original supplied asset remains intact; only the cached scene is adapted.
export const REMOVED_PARK_BUSH={minX:-11.71,maxX:-9.04,minZ:-1.09,maxZ:1.89};
export function prepareParkScenery(source){
 const model=source.clone(true);model.getObjectByName('mtParkTreePlane00t_mat')?.removeFromParent();
 const bush=model.getObjectByName('mtParkBush00t_mat');
 if(bush){const geometry=bush.geometry.clone(),positions=geometry.attributes.position,indices=geometry.index?.array||Array.from({length:positions.count},(_,i)=>i),kept=[];let removed=0;
  const b=REMOVED_PARK_BUSH,inside=i=>positions.getX(i)>=b.minX&&positions.getX(i)<=b.maxX&&positions.getZ(i)>=b.minZ&&positions.getZ(i)<=b.maxZ;
  for(let i=0;i<indices.length;i+=3){const triangle=[indices[i],indices[i+1],indices[i+2]];if(triangle.every(inside))removed++;else kept.push(...triangle);}
  geometry.setIndex(kept);geometry.computeBoundingBox();geometry.computeBoundingSphere();bush.geometry=geometry;bush.userData.removedApproachTriangles=removed;
 }
 return model;
}
