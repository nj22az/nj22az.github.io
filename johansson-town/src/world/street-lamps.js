/**
 * Late-Shōwa street-lamp poles for the shopping street and quay approach.
 *
 * Emissive-first: milk-glass heads glow from lanternGlow. No new PointLights —
 * MeshToonMaterial muddies with extra lights, and docs/DUSK.md forbids joining
 * the harbour globes with more of them. Poles share geometry/materials; heads
 * stay out of static batching so emissive can update each hour.
 */
import * as THREE from '../../vendor/three.module.js';
import {applyCelShading} from '../render/cel.js';
import {MAIN_ROAD,SHOP_CROSSING_Z} from './main-road.js';
import {BOOKSHOP_WORKSHOP_PLOT} from './bookshop-workshop-layout.js';

/** Head emissive matches harbour.js lantern globes. */
export const LAMP_EMISSIVE=0xf0a65c;
export const LAMP_BASE_GLOW=0.12;
export const LAMP_GLOW_SCALE=0.85;
export const POLE_HEIGHT=4.2;

/**
 * Poles tuck into building corners on the west footway (next to the facade,
 * not mid-block or in doorways). Arms still reach the carriageway.
 */
export const STREET_LAMP_PLACEMENTS=Object.freeze([
 // CityArchitect 3-pole plan: west facade corners only (emissive heads, no PointLights).
 {x:-7.70,z:-34.0,side:'west'}, // Sakura south corner
 {x:-7.70,z:-21.0,side:'west'}, // Sakura north corner (clear of south crossing ≈[-19.5,-16.5])
 {x:-7.70,z:-3.05,side:'west'}, // Front-Row south gable (off Bookshop–Minato passage at -4.6)
]);

const UTILITY_POLE_Z=new Set([-32,11,17]);

/**
 * Footway rectangles that must stay free of lamp poles (center x/z, full w/d metres).
 * West-pavement doors only — east kerb lamps sit past MAIN_ROAD.east and miss these.
 */
export const DOOR_KEEP_CLEAR=Object.freeze([
 // Narrow door-leaf bands — corners must stay legal; market uses live Sakura door.
 {id:'frontrow',x:MAIN_ROAD.pavementWest+0.65,z:BOOKSHOP_WORKSHOP_PLOT.z,w:1.6,d:1.6},
 {id:'market',x:-5.5,z:-26.8,w:1.6,d:1.6}, // live Sakura door ≈ (-5.5, -26.8)
 {id:'izakaya',x:MAIN_ROAD.pavementWest+0.5,z:-10.43,w:1.6,d:1.6},
]);

/** Sanity: placements stay off junctions and existing utility poles. */
export function placementsClearOfInfrastructure(placements=STREET_LAMP_PLACEMENTS){
 for(const p of placements){
  if(UTILITY_POLE_Z.has(p.z))return false;
  if(Math.abs(p.z-SHOP_CROSSING_Z)<1.2)return false;
  if(Math.abs(p.z+18)<1.2)return false;
 }
 return placementsClearOfShopDoors(placements);
}

/** Fail if any lamp sits inside a shop doorway / sidewalk-entrance keep-clear. */
export function placementsClearOfShopDoors(placements=STREET_LAMP_PLACEMENTS,zones=DOOR_KEEP_CLEAR){
 for(const p of placements){
  for(const zone of zones){
   if(Math.abs(p.x-zone.x)<=zone.w/2&&Math.abs(p.z-zone.z)<=zone.d/2)return false;
  }
 }
 return true;
}

function sharedGeometries(){
 return {
  pole:new THREE.CylinderGeometry(0.09,0.11,POLE_HEIGHT,10),
  base:new THREE.CylinderGeometry(0.18,0.22,0.14,10),
  collar:new THREE.CylinderGeometry(0.12,0.12,0.08,8),
  arm:new THREE.CylinderGeometry(0.045,0.055,1.35,8),
  brace:new THREE.CylinderGeometry(0.03,0.03,0.55,6),
  cowl:new THREE.CylinderGeometry(0.22,0.28,0.12,12),
  head:new THREE.SphereGeometry(0.2,12,10),
 };
}

function sharedMaterials(){
 const pole=new THREE.MeshStandardMaterial({color:0x4b5655,roughness:0.88,metalness:0.12,dithering:true});
 const steel=new THREE.MeshStandardMaterial({color:0x574f49,roughness:0.82,metalness:0.18,dithering:true});
 // Pale milk-glass so cel soft-ramp keeps the shadow side light.
 const glass=new THREE.MeshStandardMaterial({
  color:0xe8d4b8,roughness:0.55,metalness:0.02,
  emissive:LAMP_EMISSIVE,emissiveIntensity:LAMP_BASE_GLOW,dithering:true,
 });
 return {pole,steel,glass};
}

/**
 * @param {{parent:THREE.Object3D,colliders?:Array,shadows?:boolean,mobile?:boolean,placements?:typeof STREET_LAMP_PLACEMENTS}} options
 * @returns {{group:THREE.Group,heads:THREE.Mesh[],placements:ReadonlyArray,count:number,pointLights:number,update:(lanternGlow:number)=>void}}
 */
export function buildStreetLamps({parent,colliders=[],shadows=false,mobile=false,placements=STREET_LAMP_PLACEMENTS}={}){
 const group=new THREE.Group();group.name='street-glow-poles';
 const geos=sharedGeometries();
 const mats=sharedMaterials();
 const heads=[];
 const pointLights=0; // emissive-only — no new PointLights

 for(const spot of placements){
  const toward=spot.side==='west'?1:-1; // arm toward carriageway
  const lamp=new THREE.Group();
  lamp.name=`street-lamp:${spot.side}:${spot.z}`;
  lamp.position.set(spot.x,0,spot.z);
  lamp.userData.streetLamp=true;
  lamp.userData.placement={...spot};

  const pole=new THREE.Mesh(geos.pole,mats.pole);
  pole.position.y=POLE_HEIGHT/2;
  pole.castShadow=!!shadows;pole.receiveShadow=!!shadows;
  pole.userData.staticProp=true;
  lamp.add(pole);

  const base=new THREE.Mesh(geos.base,mats.steel);
  base.position.y=0.07;base.castShadow=!!shadows;base.userData.staticProp=true;lamp.add(base);

  const collar=new THREE.Mesh(geos.collar,mats.steel);
  collar.position.y=POLE_HEIGHT-0.15;collar.userData.staticProp=true;lamp.add(collar);

  // Curved arm: reach over the footway toward the street, slight droop.
  const arm=new THREE.Mesh(geos.arm,mats.steel);
  arm.position.set(toward*0.55,POLE_HEIGHT-0.05,0);
  arm.rotation.z=toward*(-Math.PI/2+0.28);
  arm.castShadow=!!shadows;arm.userData.staticProp=true;lamp.add(arm);

  const brace=new THREE.Mesh(geos.brace,mats.steel);
  brace.position.set(toward*0.28,POLE_HEIGHT-0.35,0);
  brace.rotation.z=toward*(-Math.PI/2+0.95);
  brace.userData.staticProp=true;lamp.add(brace);

  const tipX=toward*1.15;
  const tipY=POLE_HEIGHT-0.35;

  const cowl=new THREE.Mesh(geos.cowl,mats.steel);
  cowl.position.set(tipX,tipY+0.08,0);
  cowl.userData.staticProp=true;lamp.add(cowl);

  // Own material instance so a future per-lamp flicker is possible; shared tint.
  const headMat=mats.glass.clone();
  const head=new THREE.Mesh(geos.head,headMat);
  head.name='street-lamp-head';
  head.position.set(tipX,tipY-0.12,0);
  head.scale.set(1,0.95,1);
  head.castShadow=false;head.receiveShadow=false;
  // Clock-driven: must not freeze into a static-prop batch.
  head.userData.dynamicProp=true;
  head.userData.streetLampHead=true;
  lamp.add(head);
  heads.push(head);

  void mobile; // reserved: optional cheap PointLights stay at zero for this PR

  if(colliders)colliders.push({x:spot.x,z:spot.z,w:0.36,d:0.36});
  group.add(lamp);
 }

 parent?.add(group);
 applyCelShading(group);

 function update(lanternGlow=0){
  const glow=LAMP_BASE_GLOW+Math.max(0,Math.min(1,lanternGlow))*LAMP_GLOW_SCALE;
  for(const head of heads){
   head.material.emissive.setHex(LAMP_EMISSIVE);
   head.material.emissiveIntensity=glow;
  }
 }
 update(0);

 return {
  group,
  heads,
  placements:placements.slice(),
  count:placements.length,
  pointLights,
  update,
  road:MAIN_ROAD,
 };
}
