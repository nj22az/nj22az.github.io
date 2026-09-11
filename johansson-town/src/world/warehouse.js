import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';

// Replaces the western fishing-gear shed. Source frontage is -Z; rotate it
// towards the main street (+X), with its roof clear of the west service lane.
export const WAREHOUSE=Object.freeze({x:-13.6,z:-56.4,scale:.55,yaw:-Math.PI/2,groundY:.095,sourceMinY:-.022709667682647705});
export const WAREHOUSE_PLACE=Object.freeze({
 id:'warehouse',title:'Harbour Warehouse',jp:'港の倉庫',sub:'WESTERN QUAY',
 x:WAREHOUSE.x,z:WAREHOUSE.z,color:0x9a9588,accent:'#314d51',
 line:'Fishing gear, ice and quay stores · open at all hours.',
 door:Object.freeze([-6.8,0,-55.7]),exitPosition:Object.freeze([-6.8,0,-55.7]),entryFacing:Math.PI/2,
 directions:'Walk past Sakura Konbini towards the water. At the end of the main street, look left for the white timber building marked HARBOUR WAREHOUSE.',
});
export function warehouseColliders(){
 // Stable before and after streaming. Leave the main street, quay approach
 // and western service lane clear; match the loose source props separately.
 return [
  {x:-13.64,z:-56.44,w:6.14,d:11.03,height:5.9},
  {x:-8.30,z:-56.4,w:1.24,d:1.05,height:2.3}, // ladder
  {x:-9.28,z:-58.05,w:2.2,d:2.2,height:1.9}, // timber stack
  {x:-9.9,z:-55.0,w:.82,d:1.14,height:.68}, // cylinders
  ...[-59.04,-53.58].map(z=>({x:-8.82,z,w:.16,d:.16,height:2.3})),
 ].map(c=>({...c,warehouse:true}));
}
export function placeWarehouse(model){
 const holder=new THREE.Group();holder.name='Old Warehouse supplied exterior';
 holder.position.set(WAREHOUSE.x,WAREHOUSE.groundY-WAREHOUSE.sourceMinY*WAREHOUSE.scale,WAREHOUSE.z);
 holder.rotation.y=WAREHOUSE.yaw;holder.scale.setScalar(WAREHOUSE.scale);holder.add(model);holder.updateMatrixWorld(true);return holder;
}
export async function fetchWarehouse(){
 const controller=new AbortController();let timer;
 try{
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Warehouse loading timed out'));},15000);});
  return await Promise.race([(async()=>{
   const response=await fetch(assetURL('models/warehouse/old-warehouse.glb'),{signal:controller.signal});
   if(!response.ok)throw Error('Warehouse HTTP '+response.status);
   return (await new GLTFLoader().parseAsync(await response.arrayBuffer(),'')).scene;
  })(),deadline]);
 }finally{clearTimeout(timer);}
}
function addStreetDoor(group){
 const door=new THREE.Group();door.name='warehouse-street-door';
 door.position.set(-10.48,0,-55.7);door.rotation.y=Math.PI/2;
 const timber=new THREE.MeshStandardMaterial({color:0x6e5844,roughness:.9});
 const leafMat=new THREE.MeshStandardMaterial({color:0x8a6e4e,roughness:.86});
 const iron=new THREE.MeshStandardMaterial({color:0x3a4144,roughness:.45,metalness:.35});
 const pad=new THREE.MeshStandardMaterial({color:0x8e8c84,roughness:.95});
 const post=(x)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.12,2.28,.14),timber);m.position.set(x,1.2,0);door.add(m);};
 post(-.52);post(.52);
 const lintel=new THREE.Mesh(new THREE.BoxGeometry(1.16,.12,.16),timber);lintel.position.set(0,2.34,0);door.add(lintel);
 const leaf=new THREE.Mesh(new THREE.BoxGeometry(.96,2.12,.06),leafMat);leaf.position.set(-.06,1.14,.04);leaf.rotation.y=-.22;door.add(leaf);
 const handle=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.16,8),iron);handle.rotation.z=Math.PI/2;handle.position.set(.28,1.05,.1);door.add(handle);
 const step=new THREE.Mesh(new THREE.BoxGeometry(1.2,.08,.42),pad);step.position.set(0,.04,.18);door.add(step);
 group.add(door);return door;
}
export function buildWarehouse(world,options={}){
 const group=new THREE.Group();group.name='Harbour Warehouse';world.group.add(group);
 world.colliders.push(...warehouseColliders());
 const footing=new THREE.Mesh(new THREE.BoxGeometry(6.4,.6,11.35),new THREE.MeshStandardMaterial({color:0x999b94,roughness:.95}));
 footing.name='Warehouse concrete footing';footing.position.set(WAREHOUSE.x,-.19,WAREHOUSE.z);footing.receiveShadow=true;group.add(footing);
 const fallback=new THREE.Group();fallback.name='Warehouse loading fallback';group.add(fallback);
 const wallMat=new THREE.MeshStandardMaterial({color:0xbfbdb1,roughness:.94}),roofMat=new THREE.MeshStandardMaterial({color:0x65594c,roughness:.9});
 const wall=new THREE.Mesh(new THREE.BoxGeometry(6.08,4.1,10.97),wallMat);wall.position.set(WAREHOUSE.x,2.15,WAREHOUSE.z);fallback.add(wall);
 const roof=new THREE.Mesh(new THREE.BoxGeometry(6.3,.24,11.5),roofMat);roof.position.set(WAREHOUSE.x,4.32,WAREHOUSE.z);fallback.add(roof);
 options.label?.('港の倉庫','HARBOUR WAREHOUSE',[-10.48,2.2,-60.35],2.75,.88,Math.PI/2,'#e0dac2','#314d51');
 addStreetDoor(group);
 const marker=new THREE.Object3D();marker.name='warehouse-entrance';marker.position.set(-9.2,1.25,-55.7);group.add(marker);
 options.register?.(marker,'Enter Harbour Warehouse',()=>options.enter?.(WAREHOUSE_PLACE));
 let pending;
 const state={group,place:WAREHOUSE_PLACE,loaded:false,status:'idle',load(loader=fetchWarehouse){
  if(pending)return pending;state.status='loading';
  pending=Promise.resolve().then(loader).then(model=>{
   const placed=placeWarehouse(model);
   placed.traverse(o=>{if(!o.isMesh)return;o.castShadow=!!options.shadows;o.receiveShadow=true;
    for(const material of (Array.isArray(o.material)?o.material:[o.material])){
     material.dithering=true;
     for(const key of ['map','normalMap','roughnessMap','metalnessMap'])if(material[key])material[key].anisotropy=Math.min(options.maxAnisotropy||1,4);
    }
   });
   group.add(placed);fallback.removeFromParent();wall.geometry.dispose();roof.geometry.dispose();wallMat.dispose();roofMat.dispose();
   state.loaded=true;state.status='ready';return true;
  }).catch(error=>{state.status='fallback';console.warn('Warehouse unavailable; signed fallback retained',error);return false;});
  return pending;
 }};
 world.warehouse=state;return state;
}
