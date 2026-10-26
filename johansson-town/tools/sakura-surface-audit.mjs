// Sakura's surfaces as the game builds them (drawings SK-ZF rev A, docs/qa/sakura-surfaces/): every pair of faces that
// share a plane (tools/z-fighting.mjs) on the shop floor, in the back rooms and in the upstairs office, and every floor
// finish with its level. Usage: node tools/sakura-surface-audit.mjs [out.json]
import {writeFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from '../tests/fixtures.mjs';

installDOM();globalThis.self=globalThis;globalThis.__KIT_TRACE__=true;
const {buildSakuraInterior}=await import('../src/world/interiors/sakura-interior.js');
const {buildSakuraOfficeRoom}=await import('../src/world/interiors/sakura-office-room.js');
const {coplanarOverlaps}=await import('./z-fighting.mjs');
delete globalThis.__KIT_TRACE__;

/** The standard (tests/no-z-fighting.test.mjs): 2 mm, what a 24-bit depth buffer still separates at about 70 m. */
export const SURFACE_RULES=Object.freeze({
 tolerance:.002,minArea:.0004,
 // Floors are seen at a grazing angle across the whole room, where layers fight first: what is laid on the floor (within
 // 15 mm of it: sheen, mats, stickers, inset tiles) keeps 10 mm from any other floor layer, unless it is a decal.
 floorTolerance:.01,floorMinArea:.01,floorTop:.015,
});
const round=v=>+v.toFixed(4);
const pair=f=>({a:f.a,b:f.b,area:round(f.area),gapMm:+(f.gap*1000).toFixed(2),at:f.centre,normal:f.normal});
function scan(root){
 const surfaces=coplanarOverlaps(root,{tolerance:SURFACE_RULES.tolerance,minArea:SURFACE_RULES.minArea,offsetPairs:true}).map(pair);
 const floors=coplanarOverlaps(root,{regions:[{minX:-50,maxX:50,minZ:-50,maxZ:50,minY:-.01,maxY:SURFACE_RULES.floorTop}],tolerance:SURFACE_RULES.floorTolerance,
  minArea:SURFACE_RULES.floorMinArea,offsetPairs:true}).filter(f=>f.normal[1]>.99).map(pair);
 return {surfaces,floors};
}
/** Every floor-level face in the room: what it is, its level and its extent in plan (x, z), and how it is drawn. */
function floorFinishes(root){
 root.updateMatrixWorld(true);
 const out=new Map(),v=new THREE.Vector3();
 root.traverse(o=>{
  if(!o.isMesh||o.isInstancedMesh||!o.visible)return;
  const p=o.geometry.attributes.position,mats=Array.isArray(o.material)?o.material:[o.material],mat=mats[0];
  const box=new THREE.Box3();for(let i=0;i<p.count;i++)box.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));
  // Only what is laid on the floor: flat, at floor level.
  if(box.max.y>=SURFACE_RULES.floorTop||box.max.y-box.min.y>.002||box.max.x-box.min.x<.05||box.max.z-box.min.z<.05)return;
  const name=o.name||o.parent?.name||'mesh',key=name+'|'+box.min.y.toFixed(4);
  const row=out.get(key)??out.set(key,{name,level:round(box.min.y),x:[Infinity,-Infinity],z:[Infinity,-Infinity],
   drawn:mat.transparent&&mat.depthWrite===false?'glaze (no depth)':mat.polygonOffset?`decal (offset ${mat.polygonOffsetFactor}/${mat.polygonOffsetUnits})`:'solid'}).get(key);
  row.x=[Math.min(row.x[0],round(box.min.x)),Math.max(row.x[1],round(box.max.x))];row.z=[Math.min(row.z[0],round(box.min.z)),Math.max(row.z[1],round(box.max.z))];
 });
 return [...out.values()].sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name));
}

export async function auditSakuraSurfaces(){
 const shop=new THREE.Group(),display=buildSakuraInterior({room:shop,reg(){},action(){},exit(){}});await display.ready?.();
 const office=new THREE.Group();buildSakuraOfficeRoom({room:office,reg(){},action(){}});
 return {rules:SURFACE_RULES,shop:{...scan(shop),finishes:floorFinishes(shop)},office:{...scan(office),finishes:floorFinishes(office)}};
}

if(import.meta.url===`file://${process.argv[1]}`){
 const report=await auditSakuraSurfaces();
 const json=JSON.stringify(report,null,1)+'\n';
 if(process.argv[2])await writeFile(process.argv[2],json);else process.stdout.write(json);
 const n=r=>r.surfaces.length+r.floors.length;
 console.error(`shop ${n(report.shop)} pairs, office ${n(report.office)} pairs`);
 process.exit(0);
}
