import * as THREE from '../../vendor/three.module.js';
import {createWindowBatch} from './shop-street-batches.js';

// The room uses its own coordinates. Map its front glazing onto the real shop
// frontage and render the street first; opaque room surfaces mask that view.
export function mapShopCamera(source,target,frontage){
 const rotation=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),frontage.yaw);
 target.copy(source);target.position.copy(source.position).sub(new THREE.Vector3(0,0,6.3)).applyQuaternion(rotation).add(new THREE.Vector3(...frontage.position));
 target.quaternion.copy(rotation).multiply(source.quaternion);target.updateMatrixWorld(true);
 const outward=new THREE.Vector3(0,0,1).applyQuaternion(rotation);
 return new THREE.Plane().setFromNormalAndCoplanarPoint(outward,new THREE.Vector3(...frontage.position));
}

// Side planes through the actual opening exclude geometry that the full camera
// frustum would otherwise draw behind opaque interior walls.
export function shopWindowPlanes(camera,frontage){
 const rotation=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),frontage.yaw),origin=new THREE.Vector3(...frontage.position);
 const corners=[[-6.65,.05,0],[6.65,.05,0],[6.65,3.1,0],[-6.65,3.1,0]].map(p=>new THREE.Vector3(...p).applyQuaternion(rotation).add(origin));
 const centre=origin.clone().add(new THREE.Vector3(0,1.5,1).applyQuaternion(rotation));
 return corners.map((p,i)=>{const plane=new THREE.Plane().setFromCoplanarPoints(camera.position,p,corners[(i+1)%4]);if(plane.distanceToPoint(centre)<0)plane.negate();return plane;});
}
export function boxThroughWindow(bounds,planes,frustum){
 return frustum.intersectsBox(bounds)&&planes.every(plane=>{
  const n=plane.normal;
  return plane.distanceToPoint(new THREE.Vector3(n.x>=0?bounds.max.x:bounds.min.x,n.y>=0?bounds.max.y:bounds.min.y,n.z>=0?bounds.max.z:bounds.min.z))>=0;
 });
}
export function createShopStreetView(){
 const exteriorCamera=new THREE.PerspectiveCamera(),frustum=new THREE.Frustum(),matrix=new THREE.Matrix4();
 const glazing=new THREE.Box3(new THREE.Vector3(-6.65,.05,6.25),new THREE.Vector3(6.65,3.1,6.35));
 let cachedTown=null,entries=[];const batches=new WeakMap();
 const stats={total:0,visible:0,culled:0,passes:0,batchTriangles:0,submittedBatchTriangles:0};
 function cache(town){
  town.updateWorldMatrix(true,true);entries=[];
  town.traverse(o=>{
   if(!o.isMesh&&!o.isLine&&!o.isPoints)return;
   // Preserve complete instances; their spatial batches already have bounds.
   if(o.isInstancedMesh){if(!o.boundingBox)o.computeBoundingBox();}
   else if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
   const bounds=(o.isInstancedMesh?o.boundingBox:o.geometry.boundingBox).clone().applyMatrix4(o.matrixWorld);
   let dynamic=o.isSkinnedMesh;for(let p=o.parent;p&&p!==town;p=p.parent)if(p.userData.name||p.userData.character)dynamic=true;
   if(!dynamic&&!batches.has(o))batches.set(o,createWindowBatch(o));
   entries.push({object:o,bounds,dynamic,batch:batches.get(o)});
  });cachedTown=town;stats.total=entries.length;
 }
 return {stats,invalidate(){cachedTown=null;},render({renderer,scene,camera,town,room,frontage}){
  camera.updateMatrixWorld(true);frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
  if(!frontage||!frustum.intersectsBox(glazing)){stats.visible=0;stats.culled=stats.total;stats.passes=0;renderer.render(scene,camera);return;}
  const plane=mapShopCamera(camera,exteriorCamera,frontage);
  if(cachedTown!==town)cache(town);
  frustum.setFromProjectionMatrix(matrix.multiplyMatrices(exteriorCamera.projectionMatrix,exteriorCamera.matrixWorldInverse));
  const planes=[plane,...shopWindowPlanes(exteriorCamera,frontage)],hidden=[],swapped=[];
  stats.visible=0;stats.passes=1;stats.batchTriangles=0;stats.submittedBatchTriangles=0;
  const saved={background:scene.background,autoClear:renderer.autoClear,clipping:renderer.clippingPlanes,shadows:renderer.shadowMap?.enabled,matrixAuto:scene.matrixWorldAutoUpdate,children:scene.children.map(o=>[o,o.visible])};
  try{
   // Hide hands, interior guests and the room during the exterior pass. The
   // clipping plane removes the shop shell behind its actual front glazing.
   for(const o of scene.children)if(o!==town&&!o.isLight)o.visible=false;
   for(const entry of entries){
    const o=entry.object;if(!o.visible)continue;
    if(entry.batch)stats.batchTriangles+=entry.batch.totalTriangles;
    if(entry.dynamic){o.updateWorldMatrix(true,false);entry.bounds.setFromObject(o);}
    let visible=boxThroughWindow(entry.bounds,planes,frustum);
    if(visible&&entry.batch){
     visible=entry.batch.select(bounds=>boxThroughWindow(bounds,planes,frustum));
     if(visible){swapped.push([o,o.geometry]);o.geometry=entry.batch.geometry;stats.submittedBatchTriangles+=entry.batch.triangles;}
    }
    if(!visible){hidden.push(o);o.visible=false;}else stats.visible++;
   }
   stats.culled=stats.total-stats.visible;
   town.visible=true;renderer.clippingPlanes=planes;renderer.autoClear=true;
   // Cached static transforms and no second town shadow-map render. Geometry
   // and textures remain shared with the street; no additional GLBs are fetched.
   scene.matrixWorldAutoUpdate=false;if(renderer.shadowMap)renderer.shadowMap.enabled=false;
   renderer.render(scene,exteriorCamera);
   for(const [o,geometry] of swapped)o.geometry=geometry;
   scene.matrixWorldAutoUpdate=saved.matrixAuto;if(renderer.shadowMap)renderer.shadowMap.enabled=saved.shadows;
   for(const o of hidden)o.visible=true;
   for(const [o,visible] of saved.children)o.visible=visible;
   town.visible=false;room.visible=true;renderer.clippingPlanes=saved.clipping;
   scene.background=null;renderer.autoClear=false;renderer.clearDepth();renderer.render(scene,camera);
  }finally{
   for(const [o,geometry] of swapped)o.geometry=geometry;
   for(const o of hidden)o.visible=true;
   scene.matrixWorldAutoUpdate=saved.matrixAuto;if(renderer.shadowMap)renderer.shadowMap.enabled=saved.shadows;
   scene.background=saved.background;renderer.autoClear=saved.autoClear;renderer.clippingPlanes=saved.clipping;
   for(const [o,visible] of saved.children)o.visible=visible;
  }
 }};
}
