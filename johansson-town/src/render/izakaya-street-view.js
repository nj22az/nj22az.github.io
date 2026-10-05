import * as THREE from '../../vendor/three.module.js';

/** A small, infrequently refreshed view of the actual street beyond Minato. */
export function createIzakayaStreetView({renderer,scene,town,room,site,viewCamera,now=()=>performance.now()}){
 const target=new THREE.WebGLRenderTarget(512,256,{depthBuffer:true,stencilBuffer:false});
 target.texture.name='Actual Minato street through the window';target.texture.userData.sharedAsset=true;
 const camera=new THREE.PerspectiveCamera(55,2,.1,90),yaw=site.entryFacing||0;
 const outward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
 const door=new THREE.Vector3(...site.door);door.y=1.72;
 camera.position.copy(door).addScaledVector(right,-1.2).addScaledVector(outward,.3);
 camera.lookAt(camera.position.clone().addScaledVector(outward,10));camera.updateMatrixWorld(true);
 const plane=new THREE.Plane().setFromNormalAndCoplanarPoint(outward,door.clone().addScaledVector(outward,.12));
 const frustum=new THREE.Frustum(),matrix=new THREE.Matrix4(),windowBounds=new THREE.Box3(new THREE.Vector3(-5.02,.065,6.24),new THREE.Vector3(1.82,2.28,6.3));
 let disposed=false,next=0;
 return {texture:target.texture,update(){
  if(disposed||!room.visible||(typeof document!=='undefined'&&document.hidden)||renderer.getContext?.()?.isContextLost?.()||now()<next)return;
  if(next&&viewCamera){viewCamera.updateMatrixWorld(true);frustum.setFromProjectionMatrix(matrix.multiplyMatrices(viewCamera.projectionMatrix,viewCamera.matrixWorldInverse));if(!frustum.intersectsBox(windowBounds))return;}
  next=now()+2500;
  const saved={target:renderer.getRenderTarget(),autoClear:renderer.autoClear,clipping:renderer.clippingPlanes,shadows:renderer.shadowMap?.enabled,children:scene.children.map(o=>[o,o.visible])};
  try{
   // Interior actors, hands and the local room never leak into the street capture.
   for(const o of scene.children)if(o!==town&&!o.isLight)o.visible=false;
   town.visible=true;renderer.clippingPlanes=[plane];renderer.autoClear=true;
   if(renderer.shadowMap)renderer.shadowMap.enabled=false;
   renderer.setRenderTarget(target);renderer.render(scene,camera);
  }finally{
   renderer.setRenderTarget(saved.target);renderer.autoClear=saved.autoClear;renderer.clippingPlanes=saved.clipping;
   if(renderer.shadowMap)renderer.shadowMap.enabled=saved.shadows;
   for(const [o,visible] of saved.children)o.visible=visible;
  }
 },dispose(){if(disposed)return;disposed=true;target.dispose();}};
}
