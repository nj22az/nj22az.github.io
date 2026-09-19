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

/** Head emissive matches harbour.js lantern globes. */
export const LAMP_EMISSIVE=0xf0a65c;
export const LAMP_BASE_GLOW=0.12;
export const LAMP_GLOW_SCALE=0.85;
export const POLE_HEIGHT=4.2;

/**
 * West footway ~pavementWest+0.2, east footway just past the east kerb.
 * Arms reach toward the carriageway. zs skip SHOP_CROSSING_Z, the south
 * crossing at -18, and utility poles at z=-32,11,17.
 */
export const STREET_LAMP_PLACEMENTS=Object.freeze([
 // Shopping street — 8 arm lamps
 {x:-7.35,z:-26,side:'west'},
 {x:0.6,z:-26,side:'east'},
 {x:-7.35,z:-12,side:'west'},
 {x:0.6,z:-12,side:'east'},
 {x:-7.35,z:2,side:'west'},
 {x:0.6,z:2,side:'east'},
 {x:-7.35,z:15,side:'west'},
 {x:0.6,z:15,side:'east'},
 // Quay approach — 4, clear of harbour lanterns at [-17.1,-48]/[16.3,-47.2]
 {x:-7.2,z:-40,side:'west'},
 {x:0.8,z:-40,side:'east'},
 {x:-7.2,z:-46,side:'west'},
 {x:0.8,z:-46,side:'east'},
]);

const UTILITY_POLE_Z=new Set([-32,11,17]);

/** Sanity: placements stay off junctions and existing utility poles. */
export function placementsClearOfInfrastructure(placements=STREET_LAMP_PLACEMENTS){
 for(const p of placements){
  if(UTILITY_POLE_Z.has(p.z))return false;
  if(Math.abs(p.z-SHOP_CROSSING_Z)<1.2)return false;
  if(Math.abs(p.z+18)<1.2)return false;
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
