import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {BUS_STATION,BUS_STATION_ROUTES,buildBusStation} from '../src/world/bus-station.js';
import {activeRoutes,routeAt} from '../src/world/layout.js';
import {MAIN_ROAD,SHOP_CROSSING_Z} from '../src/world/main-road.js';
import {FOREST_EDGE} from '../src/world/forest-edge.js';
import {configureTownMode} from '../src/world/town-mode.js';
import {COMMUTER_SHIFTS,commuterPhase,shiftActive} from '../src/people/commuter-schedule.js';
import {RESIDENTS} from '../src/people/residents.js';
import {residentPlan} from '../src/people/social.js';
import {createTown} from '../src/world/town.js?snappy=1';
import {DINING_COLLIDERS} from '../src/world/dining-layout.js';
import {createNavigation} from '../src/people/navmesh.js';
import {circleHitsRect,townBoundsBlocked,sweepFraction} from '../physics.js';
import {installDOM} from './fixtures.mjs';

const state={townMode:'shopping-district',inventory:[]};
const profile=name=>RESIDENTS.find(p=>p.name===name);

test('shopping district has a northern bus terminus and no residential route dependency',()=>{
 configureTownMode('shopping-district');
 try{
  assert.equal(BUS_STATION_ROUTES.length,2);
  assert.ok(routeAt(...BUS_STATION.queue,.28));
  assert.ok(!routeAt(-14,18,.28),'The retired housing frontage is not a playable route');
 }finally{configureTownMode('legacy');}
});

test('commuters arrive, work late, and leave through the Harbour Line',()=>{
 assert.deepEqual(COMMUTER_SHIFTS.Thuan,{arrival:510,start:540,finish:1200,departure:1260});
 assert.equal(commuterPhase(profile('Thuan'),515),'arriving');
 assert.equal(commuterPhase(profile('Thuan'),550),'town');
 assert.equal(shiftActive(profile('Thuan'),1000),true);
 assert.equal(commuterPhase(profile('Thuan'),1200),'departing');
 assert.equal(commuterPhase(profile('Thuan'),1260),'away');
 assert.equal(residentPlan(profile('Reiko'),1300,false,state).place,'work');
 assert.equal(residentPlan(profile('Tetsuo'),1300,false,state).place,'work');
 assert.equal(residentPlan(profile('Nao'),1000,false,state).place,'izakaya');
 assert.equal(residentPlan(profile('Officer Mori'),1500,false,state).place,'patrol');
 assert.equal(residentPlan(profile('Mrs Sato'),1230,false,state).place,'ramen');
 assert.equal(residentPlan(profile('Harbour master'),0,false,state).place,'work');
 assert.equal(residentPlan(profile('Bus driver'),0,false,state).place,'station');
 assert.equal(residentPlan(profile('Thuan'),1250,false,state).target[0],BUS_STATION.queue[0]);
});

test('bus station exposes a boarding queue, timetable interactions, and departures',()=>{
 const parent=new THREE.Group(),colliders=[],anchors=[];
 const station=buildBusStation({parent,colliders,register:(o,label,fn)=>anchors.push({o,label,fn}),onAction(){},label(){}});
 assert.equal(station.place.id,'bus-station');
 assert.deepEqual(station.queue,BUS_STATION.queue);
 assert.ok(colliders.some(c=>c.id==='bus-station-shelter'));
 assert.ok(anchors.some(a=>a.label==='Read Harbour Line timetable'));
 station.board('Aya',1170);
 assert.deepEqual(station.departures,[{name:'Aya',minutes:1170}]);
});

test('published town mode builds shops and port without homes or the sea cave',()=>{
 configureTownMode('legacy');
 try{
  installDOM();
  const sites=[
   {id:'frontrow',title:'Front-Row Books & Press',jp:'前列書房・印刷',side:1,z:4,color:0x735849,line:'Books'},
   {id:'form3d',title:'Kenji & Tetsuo Repairs',jp:'立体・電気工房',side:1,z:4,color:0x566b73,line:'Repairs'},
   {id:'office',title:'Johansson Harbour Office',jp:'港務・技術事務所',side:1,z:-42,color:0x62776e,line:'Office'},
   {id:'market',title:'Sakura Shōten',jp:'桜商店',side:-1,z:-28,color:0x9d7c7e,line:'Market'},
  ];
  const world=createTown({scene:new THREE.Scene(),sites,townMode:'shopping-district',mobile:true,shadows:false,register(){},onAction(){},enter(){},getPlayerPosition:()=>new THREE.Vector3()});
  assert.equal(world.quality.shoppingDistrict,true);
  const storefronts=[];world.group.traverse(o=>{if(o.name==='Sakura glass storefront')storefronts.push(o);});
  assert.equal(storefronts.length,1,'Only one konbini exterior, including decorative copies');
  assert.deepEqual(storefronts[0].scale.toArray(),[1,1,1],'Original full-size konbini');
  assert.equal(sites.filter(s=>s.id==='market').length,1);
  const blocked=(x,z,r=.32)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c));
  const nav=createNavigation(blocked),origin={x:MAIN_ROAD.x,z:-20};
  for(const site of sites){
   const [x,,z]=site.door;
   assert.equal(blocked(x,z),false,site.id+' doorway remains clear');
   const path=nav.path(origin,{x,z});assert.ok(path.length,site.id+' reachable');
   assert.deepEqual(path.at(-1),[x,z],site.id+' route reaches actual door');
  }
  for(const z of [SHOP_CROSSING_Z,-18])assert.equal(sweepFraction({x:MAIN_ROAD.pavementWest+.35,z},{x:MAIN_ROAD.pavementEast-.35,z},blocked),1,'Grid crossing stays clear');
  for(const c of DINING_COLLIDERS.filter(c=>/^dining-street:[A-H]$/.test(c.id))){
   assert.ok(c.x+c.w/2<MAIN_ROAD.west||c.x-c.w/2>MAIN_ROAD.east,'Shop block stays outside road');
  }
  assert.ok(sites.find(s=>s.id==='frontrow').x<MAIN_ROAD.west);
  assert.ok(sites.find(s=>s.id==='form3d').x>MAIN_ROAD.east);

  assert.equal(world.homes?.size||0,0);
  assert.equal(world.seaCave,undefined);
  assert.equal(world.quality.residentialArea,false);
  assert.ok(!sites.some(place=>place.id==='crystal-room'));
  assert.ok(world.group.getObjectByName('Sato Ramen restaurant'));
  assert.equal(world.group.getObjectByName('Inakaya restaurant and neighbour'),undefined);
  assert.ok(world.group.getObjectByName('Harbour Line bus station'));
  assert.ok(world.group.getObjectByName('Forest wall and bus-only road'));
  assert.ok(world.colliders.some(c=>c.id==='forest-wall'));
  assert.ok(!activeRoutes().some(route=>route.id==='crystal-door'));
  assert.equal(world.forestEdge.busRoute.points[0][1],MAIN_ROAD.maxZ);
  assert.equal(world.forestEdge.busRoute.points.at(-1)[1],FOREST_EDGE.roadEndZ);
  assert.ok(world.colliders.some(c=>c.id==='forest-wall'&&c.z===FOREST_EDGE.wallZ));
  assert.ok(world.landmarks.some(place=>place.id==='bus-station'));
  assert.equal(world.isOpen({id:'office'},0),true);
  assert.equal(world.isOpen({id:'warehouse'},0),true);
  assert.equal(world.isOpen({id:'bus-station'},0),true);
 }finally{configureTownMode('legacy');}
});
