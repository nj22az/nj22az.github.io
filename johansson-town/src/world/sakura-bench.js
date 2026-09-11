import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';

// Cedar bench on the east sidewalk, looking across the street at Sakura Shōten.
export const SAKURA_SHOP=Object.freeze({x:-7.55,z:-28});
export const SAKURA_BENCH_PLACE=Object.freeze({
  x:4.42,
  z:-20.35,
  yaw:Math.atan2(4.42-SAKURA_SHOP.x,-20.35-SAKURA_SHOP.z),
  pitch:-.08,
  eyeY:1.16,
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
    new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Bench asset timeout')),8000);})
  ]).then(gltf=>{
    source=gltf.scene;source.updateMatrixWorld(true);return true;
  }).catch(error=>{console.warn('Sakura bench unavailable; using a local stand-in.',error.message);return false;})
    .finally(()=>clearTimeout(timer));
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
    yaw:SAKURA_BENCH_PLACE.yaw,
    pitch:SAKURA_BENCH_PLACE.pitch
  };
}

function fallbackBench(factory){
  const {x,z,yaw}=SAKURA_BENCH_PLACE;
  const built=factory.bench(x,z,yaw);
  built.object.name='sakura-viewing-bench';
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
  }
  // Axis-aligned footprint, not the rotated mesh AABB, so the stand-up point stays clear.
  world.colliders.push({x,z,w:1.6,d:1.0,height:.95,minY:0});
  const seat=sakuraBenchSeat();
  const marker=new THREE.Object3D();marker.name='sakura-bench-seat';
  marker.position.set(seat.position[0],1,seat.position[2]);marker.userData.seat=seat;
  world.group.add(marker);
  register?.(marker,'Sit and look at Sakura',()=>onAction?.('seat','Sakura viewing bench','A cedar bench across the street from Sakura Shōten.'));
  world.sakuraBench={object,marker,seat,source:source?'blender':'procedural'};
  return world.sakuraBench;
}
