import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {registerDetail} from './detail-stream.js';

// Cedar bench at Harbour Park's quiet western edge, looking across at Sakura Shōten.
export const SAKURA_SHOP=Object.freeze({x:-7.45,z:-26.8});
export const SAKURA_BENCH_PLACE=Object.freeze({
  x:6.6,
  z:-32,
  yaw:Math.atan2(6.6-SAKURA_SHOP.x,-32-SAKURA_SHOP.z),
  pitch:-.08,
  eyeY:1.16,
  surfaceY:.4675,
  sitLocal:[0,0,-.08],
  standLocal:[0,0,-1.45]
});

let source=null,pending=null;

export function preloadSakuraBench(){
  if(source)return Promise.resolve(true);
  if(pending)return pending;
  const controller=new AbortController();let timer;
  pending=Promise.race([
    fetch(assetURL('models/street/sakura-bench.glb?bench-1'),{signal:controller.signal})
      .then(response=>{if(!response.ok)throw Error('Bench HTTP '+response.status);return response.arrayBuffer();})
      .then(data=>new GLTFLoader().parseAsync(data,'')),
    new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Bench asset timeout'));},8000);})
  ]).then(gltf=>{
    source=gltf.scene;source.updateMatrixWorld(true);return true;
  }).catch(error=>{console.warn('Sakura bench unavailable; using a local stand-in.',error.message);return false;})
    .finally(()=>{clearTimeout(timer);pending=null;});
  return pending;
}

function rotateLocal(local){
  const {x,z,yaw}=SAKURA_BENCH_PLACE,[lx,,lz]=local,c=Math.cos(yaw),s=Math.sin(yaw);
  return [x+lx*c+lz*s,0,z-lx*s+lz*c];
}

export function sakuraBenchSeat(){
  const position=rotateLocal(SAKURA_BENCH_PLACE.sitLocal);
  const stand=rotateLocal(SAKURA_BENCH_PLACE.standLocal);
  return {
    position,
    stand,
    eyeY:SAKURA_BENCH_PLACE.eyeY,
    surfaceY:SAKURA_BENCH_PLACE.surfaceY,
    yaw:SAKURA_BENCH_PLACE.yaw,
    pitch:SAKURA_BENCH_PLACE.pitch
  };
}

function fallbackBench(factory){
  const {x,z,yaw}=SAKURA_BENCH_PLACE;
  const built=factory.bench(x,z,yaw);
  built.object.name='sakura-viewing-bench';
  built.object.scale.y=SAKURA_BENCH_PLACE.surfaceY/.62;
  return built;
}

export function buildSakuraBench(world,{shadows=false,register,onAction,factory}={}){
  const {x,z,yaw}=SAKURA_BENCH_PLACE;
  let object;
  if(source){
    const group=new THREE.Group();group.name='sakura-viewing-bench';
    group.position.set(x,0,z);group.rotation.y=yaw;
    const model=source.clone(true);
    model.traverse(mesh=>{if(mesh.isMesh){mesh.castShadow=shadows;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.userData.staticProp=true;}});
    group.add(model);world.group.add(group);object=group;
  }else{
    const built=fallbackBench(factory);world.group.add(built.object);object=built.object;
    // Keep a temporary bench out of static batches so a late model can replace it.
    object.traverse(mesh=>{if(mesh.isMesh)mesh.userData.staticProp=false;});
    registerDetail(world,{id:'sakura-bench',requiredNearby:true,x,z,radius:28,load:async()=>{
      if(!await preloadSakuraBench())return false;
      const group=new THREE.Group();group.name='sakura-viewing-bench';group.position.set(x,0,z);group.rotation.y=yaw;
      const model=source.clone(true);model.traverse(mesh=>{if(mesh.isMesh){mesh.castShadow=shadows;mesh.receiveShadow=true;}});group.add(model);world.group.add(group);object.removeFromParent();world.sakuraBench.object=group;world.sakuraBench.source='blender';return true;
    }});
  }
  // The collider turns with the visible cedar bench. The 64 cm depth contains
  // both the authored frame and its temporary local fallback, within 7 cm.
  const offset=-.025;
  world.colliders.push({id:'sakura-bench',x:x+Math.sin(yaw)*offset,z:z+Math.cos(yaw)*offset,w:1.78,d:.64,yaw,height:.91,minY:0});
  const seat=sakuraBenchSeat();
  const marker=new THREE.Object3D();marker.name='sakura-bench-seat';
  marker.position.set(seat.position[0],1,seat.position[2]);marker.userData.seat=seat;
  world.group.add(marker);
  register?.(marker,'Sit and look at Sakura',()=>onAction?.('seat','Sakura viewing bench','A cedar bench across the street from Sakura Shōten.'));
  world.sakuraBench={object,marker,seat,source:source?'blender':'procedural'};
  return world.sakuraBench;
}
