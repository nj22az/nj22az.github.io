import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {GROUND_CLASSES} from './ground-standard.js';
import {registerDetail} from './detail-stream.js';
import {WORLD,BUILDING,FIXTURES,OUTSIDE,OPENINGS,SHOP,HOURS} from './okinawa/kitahama-shop.js';

/**
 * Johansson Mart, Kitahama, on the island: the two Blender models (tools/blender/build-kitahama-shop.py, from
 * okinawa/kitahama-shop.js) placed unrotated at their corner, on the concrete of the north block's shop apron
 * (lots.js 'shop-apron', ground-plan-quarters.js KITAHAMA_PADS).
 *
 * Batch 1 of bringing it in (the owner, 27 October 2026: "So bring the new shop to the island?"): the building stands, the
 * inside shows through the glass, and it is solid. Walking in is batch 2, Grandmother Higa behind the till batch 3
 * (briefs/HANDOFF-KITAHAMA-SHOP-2026-10-27.md); until then the door is shut and says when it opens.
 *
 * Streamed in near the player like the other model buildings (detail-stream.js); until it has loaded, a cream stand-in
 * the size of the walls holds the corner, so nothing is ever seen standing in a hole.
 */
export const SHOP_PAD_TOP=GROUND_CLASSES['coral-sand'].raisedTop;
const [OU,OV]=BUILDING.outside;
/** Local (u, v) on the island. */
const at=(u,v)=>[WORLD[0]+u,WORLD[1]+v];
const centre=(f,pad=0)=>{const [x,z]=at((f.min[0]+f.max[0])/2,(f.min[1]+f.max[1])/2);
 return {x,z,w:f.max[0]-f.min[0]+pad,d:f.max[1]-f.min[1]+pad,height:f.max[2]};};

/** What is solid outside: the walls (the shop is shut until batch 2), the machines, the bins, the A-board, the condensers. */
export function kitahamaShopColliders(){
 const [x,z]=at(OU/2,OV/2);
 const out=[{x,z,w:OU,d:OV,height:BUILDING.parapetTop,kitahamaShop:'walls'}];
 for(const id of ['X1','X2','X7','X3']){const f=OUTSIDE.find(o=>o.id===id);out.push({...centre(f),kitahamaShop:id});}
 return out;
}

const cache=new Map();let loading=null;
async function loadModels(){
 if(cache.size===2)return true;
 loading??=(async()=>{
  const loader=new GLTFLoader();
  for(const part of ['exterior','interior']){
   const response=await fetch(assetURL('models/kitahama-shop/kitahama-shop-'+part+'.glb'));
   if(!response.ok)throw Error('kitahama-shop-'+part+'.glb: '+response.status);
   const scene=(await loader.parseAsync(await response.arrayBuffer(),'')).scene;
   scene.traverse(o=>{
    if(!o.isMesh)return;
    const glass=/glass/i.test(o.material?.name||'');
    // Glass is seen through, both ways, and writes no depth, so the shop behind it is not cut away.
    if(glass){o.material.transparent=true;o.material.depthWrite=false;o.material.side=THREE.DoubleSide;o.renderOrder=2;o.castShadow=false;o.receiveShadow=false;o.userData.clearWindow=true;}
    else{o.castShadow=true;o.receiveShadow=true;}
   });
   cache.set(part,scene);
  }
  return true;
 })().catch(e=>{console.warn('Johansson Mart models unavailable',e);loading=null;return false;});
 return loading;
}

export function buildKitahamaShop({world,group=world.group,register,onAction,shadows=false}){
 const root=new THREE.Group();root.name='Johansson Mart, Kitahama';
 root.position.set(WORLD[0],SHOP_PAD_TOP,WORLD[1]);root.userData.placeId='kitahama-shop';group.add(root);
 // The stand-in: the walls' size, in the render's cream, until the models are in.
 const standIn=new THREE.Mesh(new THREE.BoxGeometry(OU,BUILDING.parapetTop,OV),new THREE.MeshStandardMaterial({color:0xefe6d2,roughness:.9}));
 standIn.name='Johansson Mart stand-in';standIn.position.set(OU/2,BUILDING.parapetTop/2,OV/2);standIn.castShadow=shadows;root.add(standIn);
 (world.colliders??=[]).push(...kitahamaShopColliders());
 let built=false;
 const place=()=>{
  if(built||cache.size<2)return built;
  for(const part of ['exterior','interior']){const m=cache.get(part).clone(true);m.name='Johansson Mart '+part;m.userData.sharedAsset=true;root.add(m);}
  standIn.removeFromParent();standIn.geometry.dispose();standIn.material.dispose();built=true;return true;
 };
 registerDetail(world,{id:'kitahama-shop',priority:1,x:WORLD[0]+OU/2,z:WORLD[1]+OV/2,radius:60,load:async()=>(await loadModels())&&place()});
 // What can be read from the street: the hours on the door, and the machines.
 const anchor=(u,v,h,label,fn)=>{const a=new THREE.Object3D();const [x,z]=at(u,v);a.position.set(x,SHOP_PAD_TOP+h,z);a.userData.placeId='kitahama-shop';group.add(a);register?.(a,label,fn);};
 const door=OPENINGS.find(o=>o.id==='D1');
 anchor((door.from+door.to)/2,-.5,1.3,'Read the hours on the door',()=>onAction?.('read',SHOP.name+' · '+SHOP.branchEnglish,
  HOURS.sign+'\n'+HOURS.signEnglish+'\n\nThe door is shut for now. Grandmother Higa, who kept Higa Liquor on Main Street for fifty years, is to keep the till here when Sakura is shut: on weekday evenings and Saturdays.'));
 const vm=OUTSIDE.find(o=>o.id==='X1');
 anchor((vm.min[0]+vm.max[0])/2,vm.min[1]-.4,1.1,'Look at the drinks machines',()=>onAction?.('read','Minato Drinks · Kitahama',
  'Two machines against the shop’s front wall: tea, water, milk coffee and sports drinks, cold all night. Minato Drinks rents the corner, as it rents Sakura’s wall.'));
 return {root,isBuilt:()=>built,load:async()=>(await loadModels())&&place()};
}

/** The fittings' boxes on the island, for later batches (walking in, the keeper at the till). */
export const KITAHAMA_SHOP_FIXTURES=Object.freeze(FIXTURES.map(f=>Object.freeze({id:f.id,what:f.what,...centre(f)})));
