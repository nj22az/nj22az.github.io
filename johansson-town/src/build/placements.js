import * as THREE from '../../vendor/three.module.js';
import {catalogueEntry} from './catalogue.js';

/**
 * Things the creator placed with the builder, kept in data/world-placements.json and published with the town:
 *   {version:1, placements:[{id, kind, x, z, yaw, note}]}
 * A placement must stand on walkable ground, clear of everything already there and of every doorway, and say why it
 * is there (note). The same rules run in the builder before a placement is made and when the file is loaded, so a
 * file edited by hand cannot put a bench inside a wall.
 */
export const PLACEMENTS_FILE='data/world-placements.json';
export const DOOR_CLEARANCE=1.6;   // metres square kept free in front of every door
export const LEVEL=.04;            // the most the ground may rise under one piece (a kerb is 0.12–0.15 m)

/** The four corners of a footprint, in town coordinates (yaw as three.js rotation.y). */
export function footprint({x,z,w,d,yaw=0}){
 const c=Math.cos(yaw),s=Math.sin(yaw);
 return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>[x+u*c+v*s,z-u*s+v*c]);
}

/** Do two footprints overlap (separating axis test on the four edge directions)? */
export function footprintsOverlap(a,b){
 const A=footprint(a),B=footprint(b);
 for(const poly of [A,B])for(let i=0;i<2;i++){
  const [x1,z1]=poly[i],[x2,z2]=poly[i+1],nx=z2-z1,nz=-(x2-x1);
  const pa=A.map(([x,z])=>x*nx+z*nz),pb=B.map(([x,z])=>x*nx+z*nz);
  if(Math.max(...pa)<=Math.min(...pb)+1e-9||Math.max(...pb)<=Math.min(...pa)+1e-9)return false;
 }
 return true;
}

/**
 * What is wrong with a placement, as sentences (an empty list means it can go there).
 * world: {colliders:[{x,z,w,d,yaw}], doors:[[x,z]], walkable(x,z), heightAt(x,z)?}; size: the prop's footprint {w,d}. Overhead colliders
 * (awnings, signs: starting above 2 m) and parked ones (far away) do not count.
 */
export function placementProblems(p,size,world){
 const out=[],entry=(world.lookup||catalogueEntry)(p.kind);
 if(!entry)return [`There is no "${p.kind}" in the catalogue.`];
 if(![p.x,p.z,p.yaw??0].every(Number.isFinite))return [`The ${entry.name.toLowerCase()} has no proper position.`];
 if(world.needWhy!==false&&!String(p.note||'').trim())out.push(`Say why the ${entry.name.toLowerCase()} is here (who uses it, and why this spot).`);
 const box={x:p.x,z:p.z,w:size.w,d:size.d,yaw:p.yaw||0},points=[[p.x,p.z],...footprint(box)];
 if(!points.every(([x,z])=>world.walkable(x,z)))out.push(world.offGround||'Part of it is off the ground people walk on (the road, a wall or the water).');
 else if(world.heightAt){const h=points.map(([x,z])=>world.heightAt(x,z));if(Math.max(...h)-Math.min(...h)>LEVEL)out.push('It would stand across a step or a kerb; move it onto level ground.');}
 // A rug may lie under a table or a cushion, never under a wardrobe or a counter standing on it.
 if(world.colliders.some(c=>!c.moving&&(!entry.flat||(c.height??2)>.6)&&!(p.id&&c.placementId===p.id)&&(c.minY||0)<2&&Math.abs(c.x)<1e5&&footprintsOverlap(box,{x:c.x,z:c.z,w:c.w,d:c.d,yaw:c.yaw||0})))out.push('It overlaps something that is already there.');
 if(!entry.flat&&world.doors.some(([x,z,size=DOOR_CLEARANCE])=>footprintsOverlap(box,{x,z,w:size,d:size})))out.push('It blocks a doorway or the way to something you use.');
 return out;
}

/** A file's placements, checked for shape only (the world rules run when they are placed). */
export function readPlacementsFile(json){
 const data=typeof json==='string'?JSON.parse(json):json;
 if(!data||data.version!==1||!Array.isArray(data.placements))throw new Error('Not a placements file (version 1).');
 const ids=new Set();
 return data.placements.map(p=>{
  if(!p||typeof p.id!=='string'||ids.has(p.id))throw new Error('Every placement needs its own id.');
  ids.add(p.id);
  const e={id:p.id,kind:String(p.kind),x:+p.x,z:+p.z,yaw:+(p.yaw||0),note:String(p.note||'')};
  // A broken number is kept exactly as written, so saving never turns it into 0 (a spot nobody chose).
  if(![e.x,e.z,e.yaw].every(Number.isFinite))Object.defineProperty(e,'written',{value:{...p}});
  return e;
 });
}

export const placementsFile=list=>JSON.stringify({version:1,placements:list.map(e=>e.written||{id:e.id,kind:e.kind,x:+e.x.toFixed(3),z:+e.z.toFixed(3),yaw:+e.yaw.toFixed(4),note:e.note})},null,1)+'\n';

/**
 * The live builder for the town outdoors. group/colliders are the world's own (colliders are picked up by the collider
 * grid on its next refresh); factory is the prop factory; walkable and doors describe the ground.
 */
export function createPlacements({group,colliders,factory,walkable,heightAt=null,doors=[],lookup=catalogueEntry,needWhy=true,offGround=null,onChange=()=>{}}){
 const placed=new Map(),held=new Map();let next=1;   // held: entries from the file that cannot stand where they are
 const world={colliders,doors,walkable,heightAt,lookup,needWhy,offGround};
 function build(p){
  const entry=lookup(p.kind),made=factory[entry.make](p.x,p.z,p.yaw);
  made.object.position.y=heightAt?heightAt(p.x,p.z):0;   // on the ground, not floating over it or sunk into it
  made.object.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(made.object);
  const collider=made.collider&&{...made.collider,x:p.x,z:p.z,yaw:p.yaw,height:box.max.y-box.min.y,minY:box.min.y,placementId:p.id};
  made.object.name=`placed:${p.kind}:${p.id}`;made.object.userData.placement=p.id;
  return {object:made.object,collider};
 }
 const sizeOf=kind=>{const e=lookup(kind);if(!e)return {w:0,d:0};if(e.size)return {w:e.size[0],d:e.size[1]};const c=factory[e.make](0,0,0).collider;return {w:c.w,d:c.d};};
 const sizes=new Map();
 const size=kind=>{if(!sizes.has(kind))sizes.set(kind,sizeOf(kind));return sizes.get(kind);};
 function check(p){return placementProblems(p,size(p.kind),world);}
 function place(p){
  const entry={id:p.id||`p${next++}`,kind:p.kind,x:+p.x,z:+p.z,yaw:+(p.yaw||0),note:String(p.note||'')};
  while(placed.has(entry.id)||held.has(entry.id))entry.id=`p${next++}`;
  const problems=check(entry);if(problems.length)return {ok:false,problems};
  const made=build(entry);group.add(made.object);if(made.collider)colliders.push(made.collider);
  placed.set(entry.id,{entry,...made});onChange();return {ok:true,id:entry.id};
 }
 function remove(id){
  if(held.delete(id)){onChange();return true;}
  const p=placed.get(id);if(!p)return false;
  p.object.removeFromParent();const i=colliders.indexOf(p.collider);if(i>=0)colliders.splice(i,1);
  placed.delete(id);onChange();return true;
 }
 function move(id,changes){
  const p=placed.get(id)||(held.has(id)&&{entry:held.get(id)});if(!p)return {ok:false,problems:[`Nothing placed as ${id}.`]};
  const entry={...p.entry,...changes,id};
  const problems=check(entry);if(problems.length)return {ok:false,problems};
  remove(id);return place(entry);   // a held entry moved to a good spot is built
 }
 function load(list){
  // Ids continue after every id in the file, built or not, so a new piece never takes a held one's id.
  for(const p of list){const n=+String(p.id).replace(/^p/,'');if(Number.isInteger(n)&&n>=next)next=n+1;}
  const skipped=[];
  for(const p of list){const r=place(p);if(!r.ok){const kept={...p};if(p.written)Object.defineProperty(kept,'written',{value:p.written});held.set(p.id,kept);skipped.push({id:p.id,problems:r.problems});}}
  return skipped;
 }
 return {
  check:p=>check({...p,yaw:+(p.yaw||0)}),place,move,remove,load,
  list:()=>[...placed.values()].map(p=>({...p.entry})),
  /** Entries from the file that could not be built where they are; kept in the file until moved or removed. */
  held:()=>[...held.values()].map(e=>({...e,problems:check(e)})),
  file:()=>placementsFile([...[...placed.values()].map(p=>p.entry),...held.values()].sort((a,b)=>String(a.id).localeCompare(String(b.id),undefined,{numeric:true}))),
  size,
 };
}
