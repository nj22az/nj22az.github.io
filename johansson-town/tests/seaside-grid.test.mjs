import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js';
import {createContentItems} from '../content-items.js';
import {assignWorkplaces} from '../src/people/workplaces.js';
import {createNavigation} from '../src/people/navmesh.js';
import {circleHitsRect,townBoundsBlocked,sweepFraction} from '../physics.js';
import {ROUTES,MAP_BOUNDS,groundHeight} from '../src/world/layout.js';
import {COASTLINE,buildPeninsula} from '../src/world/peninsula.js';
import {SHOP_ADDRESSES,TOWN_DESTINATIONS} from '../src/world/town-grid.js';

function make(){
 installDOM();const sites=['office','frontrow','form3d','stepwise','journal','electronics','market','career'].map((id,i)=>({id,title:id,jp:id,side:i%2?1:-1,z:[38,30,18,8,-4,-16,-28,-39][i],color:0x777766,accent:'#49675d',line:id}));
 const world=createTown({scene:new THREE.Scene(),sites,mobile:true,shadows:false,register(){},onAction(){},enter(){}});
 createContentItems({group:world.group,colliders:world.colliders,register(){},onInspect(){},onRead(){}});assignWorkplaces(world,sites);
 const blocked=(x,z,r=.32)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c));
 return {world,sites,blocked,nav:createNavigation(blocked)};
}

test('three short shop blocks connect all interiors, homes and port landmarks',async()=>{
 const {world,sites,blocked,nav}=make(),origin={x:0,z:-20};
 for(const [id,address] of Object.entries(SHOP_ADDRESSES)){const site=sites.find(s=>s.id===id);assert.equal(site.z,address.z,id);assert.equal(site.side,address.side,id);}
 for(const site of [...sites,...world.landmarks]){
  const door=site.door||[site.side*4,0,site.z+2.5];
  assert.equal(blocked(door[0],door[2]),false,site.id+' door');
  const path=nav.path(origin,{x:door[0],z:door[2]});assert.ok(path.length,site.id+' reachable');
  for(let i=1;i<path.length;i++)assert.equal(sweepFraction({x:path[i-1][0],z:path[i-1][1]},{x:path[i][0],z:path[i][1]},blocked),1,site.id+' route clearance');
 }
 for(const person of world.people){
  const profile=person.profile,path=nav.path({x:profile.home[0],z:profile.home[1]},{x:profile.work[0],z:profile.work[1]});
  assert.ok(path.length,profile.name+' can walk between home and work');
 }
 for(const [id,target] of Object.entries(TOWN_DESTINATIONS))assert.ok(nav.path(origin,{x:target[0],z:target[1]}).length,id+' connected');
 const seat=world.park.seat;assert.ok(nav.path(origin,{x:seat.stand[0],z:seat.stand[2]}).length,'park bench connected');
 if(process.env.TOWN_GRID_REVIEW)await writeFile(process.env.TOWN_GRID_REVIEW,JSON.stringify({sites,colliders:world.colliders,routes:ROUTES,shore:COASTLINE,bounds:MAP_BOUNDS,park:world.park.group.position.toArray()},null,2));
});

test('the closed shore exposes sea on all four sides and old empty outskirts cannot be walked',()=>{
 const group=new THREE.Group(),ground=buildPeninsula(group);group.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(),land=(x,z)=>{ray.set(new THREE.Vector3(x,20,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(ground).length>0;};
 for(const p of [[-43,0],[48,0],[0,55],[0,-53]])assert.equal(land(...p),false,'surrounding sea '+p);
 for(const p of [[0,100],[0,46],[0,-76],[4.2,-62],[-45,-30],[46,36]])assert.equal(townBoundsBlocked(...p,.32),true,'retired area is blocked '+p);
 for(const p of [[0,0],[-36,10],[38,12],[0,-44]])assert.equal(land(...p),true,'street stays on land '+p);
 assert.equal(townBoundsBlocked(0,-62,.32),false,'working pier remains accessible');
 const area=(MAP_BOUNDS.maxX-MAP_BOUNDS.minX)*(MAP_BOUNDS.maxZ-MAP_BOUNDS.minZ);assert.ok(area<120*156*.65,'at least 35% smaller map envelope');
 const spine=ROUTES.find(r=>r.id==='shotengai');assert.ok(Math.abs(spine.points[0][1]-spine.points[1][1])<75,'short main street');
});

test('both park approaches have continuous height and all cross-streets stay level',()=>{
 for(const id of ['park-approach','park-walk']){
  const route=ROUTES.find(r=>r.id===id);
  for(let i=1;i<route.points.length;i++){
   const a=route.points[i-1],b=route.points[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*10);let previous=groundHeight(...a);
   for(let j=1;j<=n;j++){const h=groundHeight(a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n);assert.ok(Number.isFinite(h)&&Math.abs(h-previous)<.08,id+' continuous surface');previous=h;}
  }
 }
 for(let x=0;x<38;x+=.25)assert.equal(groundHeight(x,31),0,'north street stays below the shrine');
});
