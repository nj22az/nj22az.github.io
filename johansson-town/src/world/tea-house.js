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
 const site={id:'tea-house',title:'Corner Tea House',jp:'角の茶屋',sub:'TEA & SMALL PLEASURES',x:28,z:43,color:0xe7d2ae,accent:'#668878',line:'A little tea, a sunny table and time to linger · 09:00–19:00',door:[28,0,48]};
 options.sites.push(site);
 let building=exterior?exterior.clone(true):new THREE.Mesh(new THREE.BoxGeometry(7,4,6),new THREE.MeshStandardMaterial({color:0xd6b88e}));
 building.name='Corner Tea House exterior';building.userData.sharedAsset=true;building.position.set(28,exterior?0:2,43);building.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});world.group.add(building);
 if(!exterior)registerDetail(world,{id:'tea-house',x:28,z:43,radius:30,load:async()=>{
  if(!await preloadTeaHouse())return false;
  const model=exterior.clone(true);model.name=building.name;model.userData.sharedAsset=true;model.position.set(28,0,43);
  model.traverse(o=>{if(o.isMesh){o.castShadow=!!options.shadows;o.receiveShadow=true;}});
  world.group.add(model);world.group.remove(building);building.geometry.dispose();building.material.dispose();building=model;return true;
 }});
 const entrance=new THREE.Object3D();entrance.position.set(28,1,48);world.group.add(entrance);options.register(entrance,'Come into Corner Tea House',()=>options.enter(site));
 world.colliders.push({x:28,z:39.8,w:7,d:.3,height:4.5},{x:24.6,z:43,w:.3,d:6.4,height:4.5},{x:31.4,z:43,w:.3,d:6.4,height:4.5},{x:25.7,z:46.2,w:2.2,d:.3,height:4},{x:30.3,z:46.2,w:2.2,d:.3,height:4});
 return site;
}
