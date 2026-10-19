import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {standingHitsRect} from '../physics.js';

/**
 * The back of Sakura Shōten (the creator, 2026-10-19: "Remove the outdoor stairs to Sakura's office, add windows on the
 * back and a fire escape"): okinawa/old-town.js SAKURA_BACK, thuan-flat.js SAKURA_OFFICE_BACK.
 */
let built;
async function island(){
 if(built)return built;
 installDOM();globalThis.self=globalThis;
 const {createTown}=await import('../src/world/town.js?sakura-back');
 const {createBusinesses}=await import('../src/world/businesses.js');
 const scene=new THREE.Scene(),prompts=[],sites=createBusinesses();
 const world=createTown({scene,sites,mobile:false,shadows:false,register(o,label){prompts.push(label);},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
 scene.updateMatrixWorld(true);
 const levels=[];world.group.traverse(o=>levels.push(...(o.userData.walkLevels||[])));
 return built={scene,world,sites,prompts,levels};
}
const {SAKURA_BACK,SAKURA_BOX,SAKURA_VENDING}=await import('../src/world/okinawa/old-town.js');
const down=(scene,x,z,{from=8,keep=()=>true}={})=>{const meshes=[];scene.traverse(o=>{if(o.isMesh&&keep(o))meshes.push(o);});
 return new THREE.Raycaster(new THREE.Vector3(x,from,z),new THREE.Vector3(0,-1,0),0,from+1).intersectObjects(meshes,false);};

test('no outside stair to the office: no stair, landing, walking level, collider or way in up the back',async()=>{
 const {scene,world,sites,prompts,levels}=await island();
 assert.deepEqual(levels.filter(l=>/sakura/.test(l.id)).map(l=>l.id),[],'nothing at the back is walkable above the ground');
 assert.deepEqual(world.colliders.filter(c=>/sakura-(stair|landing)/.test(c.id||'')).map(c=>c.id),[]);
 assert.ok(!prompts.includes('Enter Sakura main office'),'the office has no door of its own outside');
 const office=sites.find(s=>s.id==='sakura-office'),shop=sites.find(s=>s.id==='market');
 assert.deepEqual(office.door,shop.door,'the office is entered through the shop');
 // Where the flight and its landing stood (x -20.03..-18.6, z -34.13..-25.91), above head height outside the fire
 // escape's own footprint, there is only sky.
 for(let z=-34;z<=-25.5;z+=.25)for(const x of [-19.9,-19.65]){
  const hit=down(scene,x,z,{from:4.6}).find(h=>h.point.y>1.2);
  assert.equal(hit,undefined,`something at ${x},${hit?.point.y.toFixed(2)},${z}: ${hit?.object.name}`);
 }
});

test('the fire escape is solid to anyone below, and no route or walking level uses it',async()=>{
 const {world,levels}=await island();
 const {activeRoutes,nearestOnSegment}=await import('../src/world/layout.js');
 const E=SAKURA_BACK.fireEscape,ladder=world.colliders.find(c=>c.id==='sakura-fire-escape-ladder'),landing=world.colliders.find(c=>c.id==='sakura-fire-escape-landing');
 assert.ok(ladder&&landing,'the ladder and the landing are colliders');
 assert.ok(standingHitsRect(E.ladder.rungX,E.ladder.z,.3,0,ladder),'nobody walks through the ladder');
 assert.ok(standingHitsRect((E.ladder.cageX+SAKURA_BACK.wall)/2,E.ladder.z,.3,0,ladder),'or under its cage');
 assert.ok(landing.minY>=SAKURA_BOX.roof-.2&&!standingHitsRect(-19,-26.6,.3,0,landing),'the landing blocks at its own height, not on the ground');
 const foot={minX:E.ladder.cageX,maxX:SAKURA_BACK.wall,minZ:E.ladder.z-.4,maxZ:E.platform.maxZ>E.ladder.z+.4?E.platform.maxZ:E.ladder.z+.4};
 for(const r of activeRoutes())for(let i=1;i<(r.points?.length||0);i++)for(const [x,z] of [[foot.minX,(foot.minZ+foot.maxZ)/2],[(foot.minX+foot.maxX)/2,E.ladder.z]]){
  const n=nearestOnSegment(x,z,r.points[i-1],r.points[i]);
  assert.ok(Math.hypot(n.x-x,n.z-z)>(r.width||0)/2,`route ${r.id} runs over the fire escape`);
 }
 assert.ok(!levels.some(l=>l.maxX>E.platform.minX&&l.minX<SAKURA_BACK.wall&&l.maxZ>E.ladder.z-.4&&l.minZ<E.platform.minZ&&l.y>.5),'no walking level on the escape');
 // It stands on the service apron, not on the circuit's paving or by the freight board.
 for(const c of [ladder,landing]){assert.ok(c.x-c.w/2>=-21.6&&c.x+c.w/2<=SAKURA_BOX.minX,'within the apron: '+c.id);assert.ok(c.z-c.d/2>SAKURA_BOX.minZ&&c.z+c.d/2<SAKURA_BOX.maxZ);}
});

test('the apron behind the shop meets the paving flush, without lying on it, and covers the old lawn strip',async()=>{
 const {scene}=await island();
 const {lanePatches}=await import('../src/world/lane-surfaces.js');
 const patches=lanePatches().map(p=>p.polygon);
 const inside=(x,z)=>patches.some(poly=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,zi]=poly[i],[xj,zj]=poly[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c;}return c;});
 const R=SAKURA_BACK.strip;
 for(const [x0,x1,z0,z1] of R.rects)for(let x=x0+.05;x<x1;x+=.2)for(let z=z0+.05;z<z1;z+=.25)assert.ok(!inside(x,z),`the apron lies on the paving at ${x.toFixed(2)},${z.toFixed(2)}`);
 // Flush with the paving all round: just past each edge that is not the wall, the paving begins.
 const edges=[...Array.from({length:40},(_,i)=>[-21.65,-34.8+i*.26]),...Array.from({length:8},(_,i)=>[-21.5+i*.22,-34.98]),...Array.from({length:4},(_,i)=>[-19.6+i*.25,-34.7]),
  ...Array.from({length:16},(_,i)=>[-20.05,-24.2+i*.26]),...Array.from({length:6},(_,i)=>[-19.9+i*.24,-19.95])];
 for(const [x,z] of edges)assert.ok(inside(x,z),`a gap between the apron and the paving at ${x.toFixed(2)},${z.toFixed(2)}`);
 // From above, the ground behind the shop is the apron, at the lane layer, not lawn.
 for(const [x0,x1,z0,z1] of R.rects)for(let x=x0+.1;x<x1;x+=.6)for(let z=z0+.1;z<z1;z+=.9){
  const ground=down(scene,x,z,{from:.5}).find(h=>h.point.y<R.top+.005);   // under the pallet and the plinth too
  assert.ok(ground&&!/lawn/.test(ground.object.name)&&Math.abs(ground.point.y-R.top)<1e-3,`lawn or a step at ${x.toFixed(2)},${z.toFixed(2)}: ${ground?.object.name}@${ground?.point.y}`);
 }
});

test('Sakura’s drinks machine stands on the footway, not sunk into it',async()=>{
 const {scene}=await island();
 const V=SAKURA_VENDING;let machine;
 scene.traverse(o=>{if(o.name==='Vending machine body'){const p=o.getWorldPosition(new THREE.Vector3());if(Math.hypot(p.x-V.x,p.z-V.z)<.05)machine=o.parent;}});
 assert.ok(machine,'the machine at its place');
 const footway=down(scene,V.x,V.z,{from:.5,keep:o=>{for(let p=o;p;p=p.parent)if(p===machine)return false;return true;}}).find(h=>h.object.name==='Main Street footway');
 assert.ok(footway,'the footway under it');
 assert.ok(Math.abs(V.y-footway.point.y)<1e-3,`its foot at ${V.y}, the footway at ${footway.point.y.toFixed(3)}`);
 assert.ok(new THREE.Box3().setFromObject(machine).min.y>footway.point.y-1e-3,'nothing of it below the paving');
});
