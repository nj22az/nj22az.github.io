import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {CAST} from '../src/people/cast.js';
import {ISLAND_HOUSEHOLDS,homeForResident,CORE_HOUSEHOLDS,SUPPORTING_QUARTERS,householdAtHome} from '../src/people/island-households.js';
import {residentHome} from '../src/people/home-directory.js';
import {HOUSEHOLDS as ROSTER_HOUSEHOLDS,identityOf} from '../src/people/roster.js';
import {residentPlan} from '../src/people/social.js';
import {RESIDENTS} from '../src/people/residents.js';
import {buildResidentHome} from '../src/world/interiors/resident-home.js';
import {KITAHAMA,KITAHAMA_HEIGHTS,plotGate} from '../src/world/kitahama-layout.js';
import {createBusinesses} from '../src/world/businesses.js';
import {createTown} from '../src/world/town.js';
import {buildFamilyHome} from '../src/world/interiors/family-home.js';
import {buildUpperHome} from '../src/world/interiors/upper-home.js';
import {buildSakuraOfficeRoom} from '../src/world/interiors/sakura-office-room.js';
import {createRoomWalk} from '../src/people/room-walk.js';
import {standingHitsRect,townBoundsBlocked} from '../physics.js';
import {groundHeight} from '../src/world/layout.js';
import {canonicalDay} from '../src/people/canonical-day.js';
import {migrateHousing} from '../src/save.js';

installDOM();globalThis.self=globalThis;
const sites=createBusinesses(),world=createTown({scene:new THREE.Scene(),sites,mobile:true,shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});

test('31 villagers have 21 occupied Minato primary homes and one shared tropical home; the five supporting crew have quarters, not households',()=>{
 assert.equal(CAST.length,36);assert.equal(CAST.filter(p=>!p.supporting).length,31);
 // 24 primary home ids: 21 standing on Minato, the Kitano house, and the two retired flats of the Heights that Mr Higa Jr and
 // Grandmother Sakurai still name until phase 4 (resolved to the roster's fallback, no household).
 const core=CAST.filter(p=>!p.supporting),primaries=new Set(core.map(p=>p.home));assert.equal(primaries.size,24);
 assert.equal([...primaries].filter(id=>{const h=ISLAND_HOUSEHOLDS.find(h=>h.id===id);return h.island==='minato'&&!h.retired;}).length,21);
 assert.deepEqual(CAST.filter(p=>p.home==='kitano-1').map(p=>p.name),['Johansson','Thuan']);
 assert.deepEqual(CAST.filter(p=>p.home==='kitahama-3').map(p=>p.name),['Nhung','Kōji','Riku'],'Nhung’s family is one household');
 assert.deepEqual(CAST.filter(p=>p.home==='kitahama-1').map(p=>p.name),['Thao','Chin','Vy']);assert.deepEqual(CAST.find(p=>p.name==='Thuan').alsoAt,[],'no weekday room');
 assert.equal(ISLAND_HOUSEHOLDS.filter(h=>h.island==='minato'&&h.toLet).length,0);
 for(const [name,id] of [['Grandmother Sakurai','kitahama-flat-2'],['Mr Higa Jr','kitahama-flat-1']]){const h=homeForResident(name);assert.equal(h.home,id);assert.equal(h.retired,true,name+'’s flat went with the upper storey');assert.equal(h.fallback,'mayor-office');assert.deepEqual(h.residents,[]);}
 // The roster's 14 households are in the registry member for member (brief §13); the other occupied homes are the retired
 // identities' houses, which stand until phase 4 removes them.
 const live=new Map(CORE_HOUSEHOLDS.map(h=>[h.home,h.residents.map(n=>identityOf(n).id).sort()]));
 assert.equal(ROSTER_HOUSEHOLDS.length,14);
 for(const h of ROSTER_HOUSEHOLDS)assert.deepEqual(live.get(h.home),[...h.members].sort(),h.home);
 const extra=CORE_HOUSEHOLDS.filter(h=>!ROSTER_HOUSEHOLDS.some(r=>r.home===h.home));
 for(const h of extra)assert.ok(h.residents.every(n=>identityOf(n)?.category==='retired'),h.home+' is a retired identity’s house until phase 4: '+h.residents.join(', '));
 // Quarters (island-households.js SUPPORTING_QUARTERS; roster.js QUARTERS): the two cabins aboard and the Shiroma house.
 assert.deepEqual(SUPPORTING_QUARTERS.map(h=>h.home).sort(),['ferry-crew-cabin','ferry-officer-cabin','kitano-2']);
 assert.deepEqual(SUPPORTING_QUARTERS.flatMap(h=>h.residents).sort(),['Aya','Jun','Kai','Ren','Ryo']);
 assert.ok(CORE_HOUSEHOLDS.every(h=>!h.quarters&&!h.aboard),'no cabin is counted as a household');
 for(const p of CAST.filter(p=>p.supporting))assert.ok(!CORE_HOUSEHOLDS.some(h=>h.residents.includes(p.name)),p.name+' is in no household');
});

test('all retained household targets are registered doors on land, clear at their real foot height',()=>{
 for(const id of new Set(CAST.map(p=>p.home))){
  // Johansson's house is the island's own; the crew's cabins are aboard the ship (their directions point at the terminal);
  // a retired flat's target is the public fallback, tested with the save migration.
  if(id==='kitano-1'||ISLAND_HOUSEHOLDS.find(h=>h.id===id).aboard||ISLAND_HOUSEHOLDS.find(h=>h.id===id).retired)continue;
  const resident=CAST.find(p=>p.home===id),home=residentHome(resident.name,{sites,landmarks:world.landmarks}),d=home.target;
  assert.ok(sites.some(s=>s.id===d.id)||id==='fujita-houseboat'&&world.landmarks.some(s=>s.id===d.id),id+' has a registered entrance or open walkable dwelling');
  assert.equal(townBoundsBlocked(d.x,d.z,.28),false,id+' approach is on land');
  const y=groundHeight(d.x,d.z);
  const hit=world.colliders.find(c=>standingHitsRect(d.x,d.z,.28,y,c));
  assert.equal(hit,undefined,id+' doorway is blocked by '+JSON.stringify(hit));
 }
});

test('each authored family room has a distinct sleeping place and actual clear routes from door to bed and table',()=>{
 for(const site of sites.filter(s=>s.familyHome?.members.length)){
  const room=new THREE.Group(),colliders=[];
  const layout=(site.upperHome?buildUpperHome:buildFamilyHome)({room,site,household:site.familyHome,residents:site.residents,kind:site.houseKind,title:site.title,reg(){},action(){},collider:(x,z,w,d,height,minY=0)=>colliders.push({x,z,w,d,height,minY})});
  const unique=new Set();
  for(const name of site.residents){
   const own=layout.homeLayouts?.[name];assert.ok(own,site.id+' has a sleeping layout for '+name);unique.add(own.bed.join(','));
   const y=own.door[1],b=layout.bounds,blocked=(x,z,r=.3)=>x<b.minX+r||x>b.maxX-r||z<b.minZ+r||z>b.maxZ-r||colliders.some(c=>standingHitsRect(x,z,r,y,c));
   const walker=createRoomWalk(blocked,{bounds:b}),g=new THREE.Group(),p={g,profile:{name,age:40}};g.position.set(...own.door);
   for(const target of [own.bedside,own.tableStand||own.table,own.door]){
    let reached=false;for(let i=0;i<60*55;i++)if(walker.move(p,target,1/60)){reached=true;break;}
    assert.ok(reached,site.id+' '+name+' can walk to '+target);
   }
  }
  assert.equal(unique.size,site.residents.length,site.id+' has enough separate bedding');
 }
});

test('canonical shore schedules resolve home, school and work destinations through clock wrap',()=>{
 for(const person of CAST.filter(p=>!['Johansson','Thuan','Mr Fujita'].includes(p.name)))for(let m=-15;m<1450;m+=15){
  const plan=canonicalDay(person.name,m);assert.ok(plan?.target?.every(Number.isFinite),person.name+' at '+m);
 }
});

test('Sakura office has reachable business fittings and no bedding',()=>{
 const room=new THREE.Group(),colliders=[],prompts=[];
 const layout=buildSakuraOfficeRoom({room,reg:(o,label)=>prompts.push({o,label}),action(){},exit(){},collider:(x,z,w,d,height)=>colliders.push({x,z,w,d,height})});
 const names=[];room.traverse(o=>names.push(o.name));assert.ok(!names.some(n=>/futon|bunk|bedroom/i.test(n)));
 for(const n of ['Kitchenette sink','Electric kettle','Office fridge','1997 desk telephone','Supplier ledger','Main accounts desk'])assert.ok(names.includes(n),n);
 const b=layout.bounds,blocked=(x,z,r=.3)=>x<b.minX+r||x>b.maxX-r||z<b.minZ+r||z>b.maxZ-r||colliders.some(c=>standingHitsRect(x,z,r,0,c));
 for(const label of ['Read Sakura’s supplier ledger','Make office tea','Look over the town','Look over the harbour']){
  const target=prompts.find(p=>p.label===label).o.position.toArray();target[1]=0;
  const g=new THREE.Group();g.position.set(...layout.spawn);const walker=createRoomWalk(blocked,{bounds:b}),visitor={g,profile:{name:'visitor',age:40}};let ok=false;
  for(let i=0;i<60*50;i++)if(walker.move(visitor,target,1/60)){ok=true;break;}
  assert.ok(ok,label+' is reachable');
 }
});

test('housing migration is idempotent and preserves shops, inventory, relationships and tropical home data',()=>{
 const saved={residentLocations:{'Grandmother Sakurai':{position:[0,0]},Thuan:{position:[24,57]}},visited:['market'],inventory:['tea'],friendship:{Thuan:9},'johansson-house':{doors:{a:true}},homeTarget:'home-market'};
 migrateHousing(saved);assert.equal(saved.homeTarget,'home-kitahama-flat-2');assert.equal(saved.residentLocations['Grandmother Sakurai'],undefined);assert.ok(saved.residentLocations.Thuan);assert.deepEqual(saved.visited,['market']);
 const before=JSON.stringify(saved);migrateHousing(saved);assert.equal(JSON.stringify(saved),before);
});

test('3 Kitahama is Nhung, Kōji and Riku’s: three sleeping places, a walk to each, and the family home, eats, rests and sleeps there',()=>{
 const site=sites.find(s=>s.id==='home-kitahama-3');assert.ok(site);
 assert.deepEqual(site.homeOwners,['Nhung','Kōji','Riku']);assert.equal(site.homeEntry,'kitahama-3');assert.deepEqual(site.residents,site.homeOwners);
 const gate=plotGate(KITAHAMA.plots.find(p=>p.id==='kitahama-3')).door;assert.deepEqual([site.x,site.z],gate);
 const room=new THREE.Group(),colliders=[];
 const layout=buildResidentHome({site,profile:{name:'Nhung'},room,reg(){},action(){},exit(){},collider:(x,z,w,d,height,minY=0)=>colliders.push({x,z,w,d,height,minY})});
 const beds=new Set();
 for(const name of site.homeOwners){
  const own=layout.homeLayouts[name];assert.ok(own,name+' has a place in the house');beds.add(own.bed.join(','));assert.ok(room.getObjectByName('Futon '+name),name+' has a futon');
  const y=own.door[1],b=layout.bounds,blocked=(x,z,r=.3)=>x<b.minX+r||x>b.maxX-r||z<b.minZ+r||z>b.maxZ-r||colliders.some(c=>standingHitsRect(x,z,r,y,c));
  const walker=createRoomWalk(blocked,{bounds:b}),g=new THREE.Group(),p={g,profile:{name,age:40}};g.position.set(...own.door);
  for(const target of [own.bedside,own.tableStand||own.table,own.door]){let reached=false;for(let i=0;i<60*55;i++)if(walker.move(p,target,1/60)){reached=true;break;}assert.ok(reached,name+' can walk to '+target);}
 }
 assert.equal(beds.size,3,'three separate beds');
 // Nhung, the walking resident, goes home to 3 Kitahama's gate to eat and sleep; Kōji and Riku's canonical day ends there too.
 const nhung=RESIDENTS.find(p=>p.name==='Nhung');assert.deepEqual([...nhung.home],gate);assert.equal(nhung.homeAddress,'3 Kitahama');
 // Day 15 is a Thursday (town-clock.js: day 0 is Wednesday 1 January 1997) in the bosun's week on, so Kōji is fishing, not
 // relieving her (ferry-crew.js rotaWeek); at the weekend Nhung keeps Sakura instead of the bookshop.
 for(const m of [15*1440+60,15*1440+1380]){const plan=residentPlan(nhung,m,false,{});assert.equal(plan.place,'home',m+'');assert.deepEqual(plan.target,gate);assert.match(plan.activity,/home|sleep|bed|breakfast/);}
 assert.equal(residentPlan(nhung,15*1440+720,false,{}).place,'work','and keeps the bookshop by day');
 for(const name of ['Kōji','Riku']){
  const night=canonicalDay(name,15*1440+1380),breakfast=canonicalDay(name,15*1440+(name==='Riku'?440:240));
  assert.equal(night.place,'home');assert.deepEqual(night.target,gate);assert.equal(night.rest,'sleep');
  assert.equal(breakfast.place,'home');assert.equal(breakfast.rest,'breakfast',name+' eats at home');
 }
});

test('the Heights’ two residents walk continuously from their own front doors to the terminal and back; no upper floor is left',async()=>{
 const {createNeighbours}=await import('../src/people/neighbours.js');
 const {createColliderGrid}=await import('../src/world/collider-grid.js');
 const {createWalkSurface}=await import('../src/world/walk-surface.js');
 const {planHeight,setWalkSurface}=await import('../src/world/layout.js');
 const surface=createWalkSurface({minX:-45,maxX:50,minZ:-72,maxZ:95,base:planHeight});surface.add(world.group);setWalkSurface(surface);
 const grid=createColliderGrid(world.colliders),blocked=(x,z,r=.3)=>townBoundsBlocked(x,z,r)||grid.some(x,z,r,c=>standingHitsRect(x,z,r,groundHeight(x,z),c));
 const neighbours=createNeighbours({parent:world.group,blocked,register(o){o.userData.hit={inside:false};}});
 try{
  neighbours.update(0,0);const names=['Mac','Ms Ganaha'];
  for(const clock of [600,23*60]){
   const targets=new Map(names.map(name=>[name,canonicalDay(name,clock).target]));
   let arrived=false;
   for(let frame=0;frame<60*330;frame++){
    const before=new Map(names.map(name=>{const g=neighbours.people.find(p=>p.spec.name===name).g;return [name,g.position.clone()];}));
    neighbours.update(1/60,clock);
    arrived=names.every(name=>{const p=neighbours.people.find(p=>p.spec.name===name),from=before.get(name),to=p.g.position,target=targets.get(name);
     assert.ok(Math.hypot(to.x-from.x,to.z-from.z)<.018,name+' continuous horizontal movement');
     assert.ok(Math.abs(to.y-from.y)<=.181,name+' ordinary stair riser');
     assert.equal(blocked(to.x,to.z,.3),false,name+' stays clear of actual colliders');
     return Math.hypot(to.x-target[0],to.z-target[1])<.35;
    });
    if(arrived)break;
   }
   assert.ok(arrived,'both residents complete the '+(clock===600?'outward':'homeward')+' walk');
  }
  // Their homes are the two ground-level front doors (kitahama-layout.js KITAHAMA_HEIGHTS), nothing above them.
  for(const [name,id] of [['Mac','kitahama-flat-3'],['Ms Ganaha','kitahama-flat-4']]){
   const house=KITAHAMA_HEIGHTS.houses.find(h=>h.id===id),home=canonicalDay(name,23*60);
   assert.deepEqual(home.target,[house.approachPosition[0],house.approachPosition[2]]);assert.equal(house.door[1],KITAHAMA.y+.02,'a door at ground level');
   assert.ok(!world.colliders.some(c=>standingHitsRect(house.door[0],house.door[2],.28,groundHeight(house.door[0],house.door[2]),c)),id+' front door is clear');
  }
  assert.equal(KITAHAMA_HEIGHTS.houses.length,2);assert.ok(!world.colliders.some(c=>/flats-(stair|landing|corridor)/.test(c.id)),'no stair, landing or corridor collider remains');
  for(const id of ['kitahama-flat-1','kitahama-flat-2'])assert.equal(householdAtHome(id).status,'retired');
 }finally{setWalkSurface(null);}
});

test('private residential stairs carry a visitor from the street landing to the actual room floor and back',()=>{
 for(const site of sites.filter(s=>s.upperHome)){
  const room=new THREE.Group(),colliders=[],layout=buildUpperHome({room,household:site.familyHome,residents:site.residents,reg(){},action(){},collider:(x,z,w,d,height,minY=0)=>colliders.push({x,z,w,d,height,minY})});
  for(const route of [layout.entranceRoute,[...layout.entranceRoute].reverse()]){
   let at=[...route[0]];
   for(const target of route.slice(1)){
    const distance=Math.hypot(target[0]-at[0],target[2]-at[2]),n=Math.max(1,Math.ceil(distance/.04)),start=[...at];
    for(let i=1;i<=n;i++){
     const x=start[0]+(target[0]-start[0])*i/n,z=start[2]+(target[2]-start[2])*i/n;
     const moved=layout.walk.move(at[0],at[1],at[2],x,z,.3,(px,py,pz)=>colliders.some(c=>standingHitsRect(px,pz,.05,py,c)));
     assert.ok(moved.ok,site.id+' stair supports the walking footprint at '+[x,z]);at=[x,moved.y,z];
    }
   }
   assert.ok(Math.abs(at[1]-route.at(-1)[1])<.01,site.id+' reaches the finished floor');
  }
 }
});

test('nine surplus dwellings leave no active doors, private obstructions or plot circuits',async()=>{
 const {TOWN_WALK_PLOTS}=await import('../src/world/architecture-plan.js');
 const {canonicalHomeId}=await import('../src/people/households.js');
 const removed=[['kitahama-7',-15,52.5],['kitahama-9',11,52.5],['kitahama-10',-28,66.5],['kitahama-11',-15,66.5],['kitahama-12',-2,66.5],['nakasone',-15,82.5],['miyagi',-2,82.5],['arakaki',9.55,16],['yonamine',-11.95,12.7]];
 for(const [id,x,z] of removed){
  assert.equal(ISLAND_HOUSEHOLDS.find(h=>h.id===id).status,'retired');
  assert.ok(!sites.some(s=>s.homeId===id));assert.ok(!TOWN_WALK_PLOTS.some(p=>p.id===id));
  assert.equal(world.colliders.find(c=>standingHitsRect(x,z,.35,groundHeight(x,z),c)),undefined,id+' plot is physically clear');
  assert.equal(canonicalHomeId('home-'+id),'mayor-office');
 }
});

test('both office outlooks map the seated desk to the same physical upper floor, facing harbour and town',async()=>{
 const {mapShopCamera}=await import('../src/render/shop-street-view.js');
 const site=sites.find(s=>s.id==='sakura-office');assert.equal(site.officePortals.length,2);
 const source=new THREE.PerspectiveCamera();source.position.set(4.1,1.12,3.2);
 const mapped=site.officePortals.map(portal=>{const camera=new THREE.PerspectiveCamera();const plane=mapShopCamera(source,camera,portal);return {camera,plane};});
 assert.ok(mapped[0].camera.position.distanceTo(mapped[1].camera.position)<1e-8,'changing outlook cannot jump the observer');
 assert.ok(Math.abs(mapped[0].camera.position.y-5.13)<1e-8,'seated eye is above the 4.01 m office floor');
 assert.deepEqual(mapped.map(v=>v.plane.normal.toArray().map(n=>Math.round(n))),[[1,0,0],[0,0,-1]],'east faces town; south faces harbour');
});

test('the postman retains his moving postal round between home and work transitions',async()=>{
 const {createNeighbours}=await import('../src/people/neighbours.js');
 const neighbours=createNeighbours({parent:new THREE.Group()});neighbours.update(0,540);
 const postman=neighbours.people.find(p=>p.spec.name==='Postman Tōma'),from=postman.g.position.clone();
 for(let i=0;i<60*12;i++)neighbours.update(1/60,540);
 assert.ok(postman.g.position.distanceTo(from)>5,'the round progresses, rather than holding at a generic street target');
 assert.match(postman.g.userData.activity,/round/);
});
