import {TEA_HOUSE} from './town-grid.js';
import {registerDetail} from './detail-stream.js';
import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
let exterior;
export async function preloadTeaHouse(){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch(assetURL('models/tea-house/tea-house-exterior.glb'),{signal:controller.signal});if(!response.ok)throw Error(response.status);exterior=(await new GLTFLoader().parseAsync(await response.arrayBuffer(),'')).scene;return true;}
 catch(error){console.warn('Tea house asset unavailable',error);return false;}finally{clearTimeout(timeout);}
}
export function buildTeaHouse(world,options){
 const site={id:'tea-house',title:'Corner Tea House',jp:'角の茶屋',sub:'TEA & SMALL PLEASURES',x:TEA_HOUSE.x,z:TEA_HOUSE.z,color:0xe7d2ae,accent:'#668878',line:'A little tea, a sunny table and time to linger · 09:00–19:00',door:[...TEA_HOUSE.door]};
 options.sites.push(site);
 let building=exterior?exterior.clone(true):new THREE.Mesh(new THREE.BoxGeometry(7,4,6),new THREE.MeshStandardMaterial({color:0xd6b88e}));
 building.name='Corner Tea House exterior';building.userData.sharedAsset=true;building.position.set(TEA_HOUSE.x,exterior?0:2,TEA_HOUSE.z);building.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});world.group.add(building);
 if(!exterior)registerDetail(world,{id:'tea-house',x:TEA_HOUSE.x,z:TEA_HOUSE.z,radius:30,load:async()=>{
  if(!await preloadTeaHouse())return false;
  const model=exterior.clone(true);model.name=building.name;model.userData.sharedAsset=true;model.position.set(TEA_HOUSE.x,0,TEA_HOUSE.z);
  model.traverse(o=>{if(o.isMesh){o.castShadow=!!options.shadows;o.receiveShadow=true;}});
  world.group.add(model);world.group.remove(building);building.geometry.dispose();building.material.dispose();building=model;return true;
 }});
 const entrance=new THREE.Object3D();entrance.position.set(TEA_HOUSE.door[0],1,TEA_HOUSE.door[2]);world.group.add(entrance);options.register(entrance,'Come into Corner Tea House',()=>options.enter(site));
 world.colliders.push({x:28,z:TEA_HOUSE.z-3.2,w:7,d:.3,height:4.5},{x:24.6,z:TEA_HOUSE.z,w:.3,d:6.4,height:4.5},{x:31.4,z:TEA_HOUSE.z,w:.3,d:6.4,height:4.5},{x:25.7,z:TEA_HOUSE.z+3.2,w:2.2,d:.3,height:4},{x:30.3,z:TEA_HOUSE.z+3.2,w:2.2,d:.3,height:4});
 return site;
}
