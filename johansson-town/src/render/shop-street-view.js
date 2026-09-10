import * as THREE from '../../vendor/three.module.js';

// The room uses its own coordinates. Map its front glazing onto the real shop
// frontage and render the street first; opaque room surfaces mask that view.
export function mapShopCamera(source,target,frontage){
 const rotation=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),frontage.yaw);
 target.copy(source);target.position.copy(source.position).sub(new THREE.Vector3(0,0,6.3)).applyQuaternion(rotation).add(new THREE.Vector3(...frontage.position));
 target.quaternion.copy(rotation).multiply(source.quaternion);target.updateMatrixWorld(true);
 const outward=new THREE.Vector3(0,0,1).applyQuaternion(rotation);
 return new THREE.Plane().setFromNormalAndCoplanarPoint(outward,new THREE.Vector3(...frontage.position));
}
export function createShopStreetView(){
 const exteriorCamera=new THREE.PerspectiveCamera(),frustum=new THREE.Frustum(),matrix=new THREE.Matrix4();
 const glazing=new THREE.Box3(new THREE.Vector3(-6.65,.05,6.25),new THREE.Vector3(6.65,3.1,6.35));
 return {render({renderer,scene,camera,town,room,frontage}){
  camera.updateMatrixWorld(true);frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
  if(!frontage||!frustum.intersectsBox(glazing)){renderer.render(scene,camera);return;}
  const plane=mapShopCamera(camera,exteriorCamera,frontage);
  const saved={background:scene.background,autoClear:renderer.autoClear,clipping:renderer.clippingPlanes,children:scene.children.map(o=>[o,o.visible])};
  try{
   // Hide hands, interior guests and the room during the exterior pass. The
   // clipping plane removes the shop shell behind its actual front glazing.
   for(const o of scene.children)if(o!==town&&!o.isLight)o.visible=false;
   town.visible=true;renderer.clippingPlanes=[plane];renderer.autoClear=true;
   renderer.render(scene,exteriorCamera);
   for(const [o,visible] of saved.children)o.visible=visible;
   town.visible=false;room.visible=true;renderer.clippingPlanes=saved.clipping;
   scene.background=null;renderer.autoClear=false;renderer.clearDepth();renderer.render(scene,camera);
  }finally{
   scene.background=saved.background;renderer.autoClear=saved.autoClear;renderer.clippingPlanes=saved.clipping;
   for(const [o,visible] of saved.children)o.visible=visible;
  }
 }};
}
