import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {registerDetail} from './detail-stream.js';
import {NIGHT_LANE,DINING_COLLIDERS} from './dining-layout.js';
import {closeDiningBacks} from './building-backs.js';
let source=null,pending=null;
export function preloadDiningStreet(){
 if(source)return Promise.resolve(true);if(pending)return pending;
 pending=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
  try{const response=await fetch(assetURL('models/dining-street/night-lane.glb'),{signal:controller.signal});if(!response.ok)throw Error(response.status);
   const loaded=await new GLTFLoader().parseAsync(await response.arrayBuffer(),'');if(!loaded.scene.children.length)throw Error('Empty dining street');closeDiningBacks(loaded.scene);source=loaded.scene;return true;
  }catch(error){console.warn('Dining street unavailable; will retry',error);return false;}finally{clearTimeout(timer);}
 })();pending.finally(()=>{pending=null;});return pending;
}
export function buildDiningStreet(world,options={}){
 const group=new THREE.Group();group.name='Supplied night dining lane';group.position.set(NIGHT_LANE.x,NIGHT_LANE.y,NIGHT_LANE.z);group.rotation.y=NIGHT_LANE.angle;world.group.add(group);
 world.colliders.push(...DINING_COLLIDERS.map(c=>({...c})));
 const glow=[],lights=[];let mounted=false,lastDay=1;
 function mount(){
  if(mounted)return true;if(!source)return false;const model=source.clone(true),materials=new Map();
  model.traverse(o=>{if(!o.isMesh)return;o.castShadow=!!options.shadows;o.receiveShadow=true;o.userData.sharedAsset=true;
   if(!materials.has(o.material)){const m=o.material.clone();materials.set(o.material,m);m.envMapIntensity=.35;m.dithering=true;for(const t of [m.map,m.normalMap,m.roughnessMap,m.aoMap])if(t)t.anisotropy=Math.min(options.maxAnisotropy||1,options.mobile?4:8);if(m.emissiveMap)glow.push({material:m,strength:Math.min(3,m.emissiveIntensity)});}
   o.material=materials.get(o.material);
  });group.add(model);mounted=true;world.updateDiningStreet(lastDay);return true;
 }
 for(const x of [12.5,18.2]){const light=new THREE.PointLight(0xffc58a,0,7,2);light.position.set(x,2.65,NIGHT_LANE.z);light.castShadow=false;world.group.add(light);lights.push(light);}
 world.updateDiningStreet=day=>{lastDay=day;const night=1-THREE.MathUtils.clamp(day,0,1);for(const {material,strength} of glow)material.emissiveIntensity=strength*(.08+.72*night);for(const light of lights)light.intensity=mounted?night*14:0;};
 if(!mount())registerDetail(world,{id:'dining-street',priority:0,x:15,z:NIGHT_LANE.z,radius:72,timeoutMs:27000,load:async()=>await preloadDiningStreet()&&mount()});
 world.diningStreet={group,lights,get ready(){return mounted;}};return group;
}
