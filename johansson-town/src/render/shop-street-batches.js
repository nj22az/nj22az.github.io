import * as THREE from '../../vendor/three.module.js';

// A city exported as one large mesh cannot be culled building by building.
// Share its existing vertex/texture buffers, but submit only indices belonging
// to spatial cells that intersect the window view. Never modify the street mesh.
export function createWindowBatch(mesh,{cellSize=8,minIndices=3000}={}){
 const source=mesh.geometry,position=source?.attributes.position,index=source?.index;
 if(!mesh.isMesh||mesh.isSkinnedMesh||mesh.isInstancedMesh||Array.isArray(mesh.material)||source.groups.length>1||!position)return null;
 const count=index?.count??position.count;
 if(count<minIndices)return null;
 const cells=new Map(),points=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
 const start=source.drawRange.start,end=Math.min(count,start+source.drawRange.count);
 for(let i=start;i+2<end;i+=3){
  const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);
  points.forEach((p,j)=>p.fromBufferAttribute(position,ids[j]).applyMatrix4(mesh.matrixWorld));
  const x=(points[0].x+points[1].x+points[2].x)/3,z=(points[0].z+points[1].z+points[2].z)/3;
  const key=Math.floor(x/cellSize)+','+Math.floor(z/cellSize);
  if(!cells.has(key))cells.set(key,{indices:[],bounds:new THREE.Box3()});
  const cell=cells.get(key);cell.indices.push(...ids);points.forEach(p=>cell.bounds.expandByPoint(p));
 }
 if(cells.size<2)return null;
 const geometry=new THREE.BufferGeometry();
 for(const [name,attribute] of Object.entries(source.attributes))geometry.setAttribute(name,attribute);
 geometry.boundingBox=source.boundingBox;geometry.boundingSphere=source.boundingSphere;
 const output=new Uint32Array(count),attribute=new THREE.BufferAttribute(output,1).setUsage(THREE.DynamicDrawUsage);geometry.setIndex(attribute);
 const partitions=[...cells.values()].map(c=>({...c,indices:new Uint32Array(c.indices)}));let signature='',visibleCount=0;
 return {source,geometry,totalTriangles:(end-start)/3,get triangles(){return visibleCount/3;},select(intersects){
  const selected=partitions.map((cell,i)=>intersects(cell.bounds)?i:-1).filter(i=>i>=0),key=selected.join(',');
  if(key!==signature||!geometry.userData.ready){
   signature=key;visibleCount=0;
   for(const i of selected){const indices=partitions[i].indices;output.set(indices,visibleCount);visibleCount+=indices.length;}
   attribute.clearUpdateRanges();if(visibleCount)attribute.addUpdateRange(0,visibleCount);attribute.needsUpdate=true;
   geometry.setDrawRange(0,visibleCount);geometry.userData.ready=true;
  }
  return visibleCount>0;
 }};
}
