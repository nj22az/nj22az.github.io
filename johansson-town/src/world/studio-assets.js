/**
 * Assets made in Johansson Studio, placed in World by id: the catalogue Studio publishes into
 * assets/catalog/<id>/ (model.glb, asset.json, hero.png; listed in assets/catalog/index.json; the format is
 * jojo/town-studio/assets/README.md).
 *
 * A card says everything a room needs: the asset's colliders, seats, standing spots and named anchors in its own frame
 * (metres, y up, floor 0, front +z), and what each part is for (its role: seat, lamp, motor, coin-slot, cord …). This
 * module turns them into a room's frame for a placement {x, z, yaw} (three.js rotation.y), and gives the model
 * parts the behaviour their role promises:
 *   lamp    a glowing part gets an emissive material, so a room's electrics can light it and put it out
 *   motor   the part is found by role, so a room can move it while the asset runs
 *   cord    hidden when the room wires the asset itself (it draws its own cord from the `cord` anchor)
 *
 * Loading is asynchronous, rooms are built synchronously: a room that uses an asset preloads it before it is built
 * (game.js enterRoom, as the izakaya does), then places it like anything made in code.
 *
 * Off unless asked for, so the live town is unchanged until the creator chooses: ?studio-assets in the address, or
 * localStorage 'johansson-studio-assets' = 'on'.
 */
import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';

export const STUDIO_ASSETS_KEY='johansson-studio-assets';

/** True when the town should use Studio's assets where a room has one (the switch above). */
export function studioAssetsEnabled(where=globalThis.location,storage=globalThis.localStorage){
 try{if(new URLSearchParams(where?.search||'').has('studio-assets'))return true;}catch{}
 try{return storage?.getItem?.(STUDIO_ASSETS_KEY)==='on';}catch{return false;}
}

/** A point [x, y, z] in the asset's frame, in the room's frame for a placement {x, z, yaw}. */
export function toRoom([x,y,z],{x:X=0,z:Z=0,yaw=0}={}){
 const c=Math.cos(yaw),s=Math.sin(yaw),r=v=>+v.toFixed(4);
 return [r(X+x*c+z*s),r(y),r(Z-x*s+z*c)];
}

/** The card's collider boxes in the room: World's {name, x, z, w, d, minY, height} (and yaw when not square to the room). */
export function roomColliders(card,placement){
 const Q=Math.PI/2;
 return (card.colliders||[]).map(c=>{
  const [x,,z]=toRoom([c.x||0,0,c.z||0],placement),turn=(c.yaw||0)+(placement?.yaw||0),quarter=Math.round(turn/Q);
  const square=Math.abs(turn-quarter*Q)<1e-3,swap=square&&Math.abs(quarter)%2===1;
  const box={name:c.name,x,z,w:swap?c.d:c.w,d:swap?c.w:c.d,minY:c.minY||0,height:c.height};
  if(!square)box.yaw=+turn.toFixed(4);// a box turned off the room's axes keeps its turn
  return box;
 });
}

/**
 * How far a moving part may travel along a box (the card's anchor box for it), keeping `margin` inside both ends:
 * {centre, amplitude} on y, for a part whose own half height is `half` (its meshes' bounding box).
 */
export function travelAlong(box,half,margin=.01){
 const lo=box.min[1],hi=box.max[1];
 return {centre:(lo+hi)/2,amplitude:Math.max(0,(hi-lo)/2-half-margin)};
}

/** three's GLTFLoader makes names safe for animation paths (spaces to _, a _1 for repeats) and keeps the original in
 * userData.name: World finds parts by Studio's own names, so they go back. */
export function restoreNames(scene){scene.traverse(o=>{if(typeof o.userData?.name==='string')o.name=o.userData.name;});return scene;}

/** The card's seats in the room: position and stand moved, yaw turned; everything else as the card says. */
export function roomSeats(card,placement){
 const yaw=placement?.yaw||0;
 return (card.seats||[]).map(s=>({...s,position:toRoom(s.position,placement),stand:toRoom(s.stand||s.position,placement),yaw:+((s.yaw||0)+yaw).toFixed(4)}));
}

/** The card's standing spots in the room. */
export function roomSpots(card,placement){
 const yaw=placement?.yaw||0;
 return (card.spots||[]).map(s=>({...s,position:toRoom(s.position,placement),yaw:+((s.yaw||0)+yaw).toFixed(4)}));
}

/** The card's named anchors in the room ([x, y, z] points; {min, max} boxes become their corners moved). */
export function roomAnchors(card,placement){
 const out={};
 for(const [k,v] of Object.entries(card.anchors||{}))out[k]=Array.isArray(v)?toRoom(v,placement):{min:toRoom(v.min,placement),max:toRoom(v.max,placement)};
 return out;
}

/** Part names by role: {seat: ['Massage chair seat'], lamp: [...], …}. */
export function partsByRole(card){
 const out={};
 for(const p of card.parts||[])(out[p.role||'body']??=[]).push(p.name);
 return out;
}

const loaded=new Map();// id -> Promise<{card, scene}>
const ready=new Map();// id -> {card, scene}

/** Fetches and parses an asset once; resolves to true when it can be placed, false when it cannot (logged). */
export function preloadStudioAsset(id){
 if(!loaded.has(id))loaded.set(id,(async()=>{
  const base=`catalog/${id}/`;
  const card=await fetch(assetURL(base+'asset.json')).then(r=>{if(!r.ok)throw Error(`${id}: asset.json HTTP ${r.status}`);return r.json();});
  const data=await fetch(assetURL(base+String(card.model||'model.glb').replace(/\.js$/,'.glb'))).then(r=>{if(!r.ok)throw Error(`${id}: model HTTP ${r.status}`);return r.arrayBuffer();});
  const {scene}=await new GLTFLoader().parseAsync(data,assetURL(base));
  restoreNames(scene);
  const asset={card,scene};ready.set(id,asset);return asset;
 })());
 return loaded.get(id).then(()=>true,e=>{console.warn('Studio asset unavailable:',e.message);loaded.delete(id);return false;});
}

/** The asset, if it is loaded (rooms call this while they are built). */
export const studioAsset=id=>ready.get(id)||null;

/**
 * Places a loaded asset in `parent` and returns what the room needs, all in the room's frame:
 * {object, card, placement, colliders, seats, spots, anchors, parts(role) → [Object3D], part(name) → Object3D}.
 * placement defaults to the card's `replaces.placement`. roomDraws: roles the room draws itself (their parts are hidden).
 * Null when the asset is not loaded.
 */
export function placeStudioAsset(id,parent,placement=null,{roomDraws=[],shadows=true,squareOnly=false}={}){
 const asset=studioAsset(id);if(!asset)return null;
 const {card}=asset,at=placement||card.replaces?.placement||{x:0,z:0,yaw:0};
 const colliders=roomColliders(card,at);
 // A room whose colliders are axis-aligned boxes cannot take a turned one: it builds its own instead of a wrong box.
 if(squareOnly&&colliders.some(c=>c.yaw!==undefined)){console.warn(`Studio asset ${id}: a collider is turned off the room's axes; this room cannot use it.`);return null;}
 const object=asset.scene.clone(true);object.name=card.name;object.position.set(at.x||0,0,at.z||0);object.rotation.y=at.yaw||0;
 object.userData.studioAsset={id,version:card.version};
 const roleOf=new Map((card.parts||[]).map(p=>[p.name,p.role||'body']));
 const byName=new Map();
 // A part is a group with the part's name, and its meshes inside. World's code finds a part by name and expects the
 // mesh (its material, its geometry), as with anything built in code: the group is renamed "<part> (part)" and the
 // part's meshes answer to the part's name (Studio's export names extra meshes by finish: "Massage chair lamp (glow)").
 object.traverse(o=>{
  if(o!==object&&!o.isMesh&&roleOf.has(o.name)&&!byName.has(o.name)){byName.set(o.name,o);o.userData.studioPart=o.name;o.name+=' (part)';}
 });
 object.traverse(o=>{
  if(!o.isMesh)return;
  let partName=null;for(let p=o.parent;p&&p!==object;p=p.parent)if(p.userData.studioPart){partName=p.userData.studioPart;break;}
  const finish=/^(.*) \((?:matte|metal|gloss|glow)\)$/.exec(o.name);if(finish&&roleOf.has(finish[1]))o.name=finish[1];
  // Each placement owns its geometry and materials (leaving a room frees them); textures stay the loaded asset's.
  o.geometry=o.geometry.clone();
  o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();
  for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.map)m.map.userData.sharedAsset=true;
  const role=partName?roleOf.get(partName):'body';
  o.castShadow=shadows;o.receiveShadow=true;o.userData.staticProp=role!=='motor';o.userData.studioPart=partName;
  // lamp: lit from inside, switchable (an unlit GLB "glow" material has no emissive to turn down).
  if(role==='lamp'&&!o.material.emissive){
   // its colour: Studio paints per vertex (the material itself is white), so the lamp glows in its vertices' colour
   const col=o.geometry.getAttribute?.('color'),c=col?new THREE.Color(col.getX(0),col.getY(0),col.getZ(0)):(o.material.color?.clone()||new THREE.Color(0xff4a2a));
   o.material.dispose();o.material=new THREE.MeshStandardMaterial({color:c.clone().multiplyScalar(.35),emissive:c,emissiveIntensity:2,roughness:.3});o.castShadow=false;
  }
 });
 for(const role of roomDraws)for(const [name,r] of roleOf)if(r===role){const o=byName.get(name);if(o)o.visible=false;}
 parent.add(object);
 const parts=role=>[...roleOf].filter(([,r])=>r===role).map(([name])=>byName.get(name)).filter(Boolean);
 return {object,card,placement:at,colliders,seats:roomSeats(card,at),spots:roomSpots(card,at),anchors:roomAnchors(card,at),
  parts,part:name=>byName.get(name)||null};
}

/** Uses an asset already in memory (tests; a tool that built one): {card, scene}. */
export function registerStudioAsset(id,asset){loaded.set(id,Promise.resolve(asset));ready.set(id,asset);}

/** Forgets loaded assets (tests). */
export function resetStudioAssets(){loaded.clear();ready.clear();}
