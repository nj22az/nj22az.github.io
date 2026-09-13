import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {registerDetail} from './detail-stream.js';
import {MAIN_STREET_SECTIONS} from './main-street-sections.js';
import {FRONTAGE_COLLIDERS} from './main-street-colliders.js';
import {frontageMaterial} from '../render/frontage-material.js';
const sources=new Map(),pending=new Map();
async function preloadSection(section){
 if(sources.has(section.id))return true;if(pending.has(section.id))return pending.get(section.id);
 const task=(async()=>{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try{
   const response=await fetch(assetURL('models/main-street/'+section.file),{signal:controller.signal});if(!response.ok)throw Error(response.status);
   const {scene}=await new GLTFLoader().parseAsync(await response.arrayBuffer(),'');
   const meshes=[];scene.traverse(o=>{if(o.isMesh)meshes.push(o);});if(!meshes.length)throw Error('Empty frontage');
   await Promise.all(meshes.map(async mesh=>{mesh.material=await frontageMaterial(mesh.material.userData.frontageAtlas);mesh.userData.sharedAsset=true;}));
   sources.set(section.id,scene);return true;
  }catch(error){console.warn('Main Street '+section.id+' unavailable; will retry',error);return false;}
  finally{clearTimeout(timer);}
 })();pending.set(section.id,task);task.finally(()=>pending.delete(section.id));return task;
}
export async function preloadResidentialStreet(){return (await Promise.all(MAIN_STREET_SECTIONS.map(preloadSection))).every(Boolean);}
export function buildResidentialStreet(world,options={}){
 const group=new THREE.Group();group.name='Main Street homes';world.group.add(group);
 const pavement=new THREE.Mesh(new THREE.BoxGeometry(6.35,.12,49.852),new THREE.MeshStandardMaterial({color:0xb9b4a6,roughness:.96}));
 pavement.position.set(-10.175,-.04,5.574);pavement.name='Continuous Main Street pavement';pavement.receiveShadow=true;group.add(pavement);
 const masonry=new THREE.MeshStandardMaterial({color:0x969a90,roughness:1});
 // Close the rear and the cropped party walls behind the existing façades.
 for(const [size,position] of [[[.14,10.1,49.85],[-28.66,5.05,5.574]],[[15.6,18.36,.12],[-20.55,9.18,30.44]],[[15.6,12.5,.12],[-20.55,6.25,-19.29]]]){
  const wall=new THREE.Mesh(new THREE.BoxGeometry(...size),masonry);wall.position.set(...position);wall.name='Main Street party wall';wall.receiveShadow=true;group.add(wall);
 }
 world.colliders.push({id:'main-street-core',x:-21.1,z:5.574,w:15.8,d:49.85,height:18.42,residential:true},...FRONTAGE_COLLIDERS.map(c=>({...c,residential:true})));
 const mounted=new Set();
 for(const section of MAIN_STREET_SECTIONS){
  const mount=()=>{if(mounted.has(section.id))return true;const source=sources.get(section.id);if(!source)return false;
   const scene=source.clone(true);scene.name='Main Street '+section.id;scene.traverse(o=>{if(!o.isMesh)return;o.castShadow=!!options.shadows;o.receiveShadow=true;o.material.map.anisotropy=Math.min(options.maxAnisotropy||1,options.mobile?4:8);});group.add(scene);mounted.add(section.id);return true;
  };
  if(!mount())registerDetail(world,{id:'residential-'+section.id,x:-14,z:(section.min[2]+section.max[2])/2,priority:0,radius:65,timeoutMs:32000,load:async()=>await preloadSection(section)&&mount()});
 }
 world.residential={group,get ready(){return mounted.size===MAIN_STREET_SECTIONS.length;},source:'Street 2 by Pasha'};return group;
}
