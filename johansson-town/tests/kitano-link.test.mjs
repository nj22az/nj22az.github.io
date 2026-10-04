import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {circleHitsRect} from '../physics.js';
import {KITANO_ROAD,KITANO_ROAD_LENGTH,KITANO_ROAD_LANDS,KITANO_SHORE,NAVIGATION_CLEARANCE,roadPoint,roadHeight,leftOf} from '../src/world/kitano-link-plan.js';
import {pathPose} from '../src/world/road-network.js';
import {FERRY,FERRY_BERTH} from '../src/world/ferry.js';

installDOM();globalThis.self=globalThis;
const {createTown}=await import('../src/world/town.js?kitano-link');
const {createBusinesses}=await import('../src/world/businesses.js');
const {routeAt,groundHeight}=await import('../src/world/layout.js');
let player=new THREE.Vector3(-30,0,30);
const world=createTown({scene:new THREE.Scene(),sites:createBusinesses(),townMode:'peninsula',mobile:false,shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>player});
const traffic=world.traffic;
const fixed=world.colliders.filter(c=>c.id!=='parked-vehicle');

test('Kitano Road keeps to the standard: gradient, bends and the navigation clearance',()=>{
 let steepest=0;for(let s=0;s<KITANO_ROAD_LENGTH-1;s+=.5)steepest=Math.max(steepest,Math.abs(roadHeight(s+.5)-roadHeight(s))/.5);
 assert.ok(steepest<=.08,`steepest gradient ${(steepest*100).toFixed(1)} %`);
 // 30 km/h design speed: no bend on the through road tighter than 30 m.
 for(let s=1;s<KITANO_ROAD_LENGTH-1;s+=.5){const [ax,az,ahx,ahz]=roadPoint(s-1),[,,bhx,bhz]=roadPoint(s+1);const turn=Math.acos(Math.min(1,ahx*bhx+ahz*bhz));if(turn>1e-4)assert.ok(2/turn>=30,`bend at s=${s} has radius ${(2/turn).toFixed(1)} m`);}
 assert.ok(NAVIGATION_CLEARANCE>=2.5,'clearance '+NAVIGATION_CLEARANCE);
 assert.ok(KITANO_SHORE.beachFoot<KITANO_ROAD.profile.crestFrom&&KITANO_ROAD.profile.crestTo<KITANO_SHORE.district,'the crest is over water');
});

test('you can walk the whole way from Main Street to the airport district on Kitano Road',()=>{
 const S=KITANO_ROAD.section;
 for(let s=.5;s<KITANO_ROAD_LANDS+3;s+=.5){
  const [x,z,hx,hz]=roadPoint(s),[lx,lz]=leftOf(hx,hz);
  for(const o of s>6?[S.footway-.6,0,-1.2]:[0,-1.2]){
   const px=x+lx*o,pz=z+lz*o,route=routeAt(px,pz,.3);
   assert.ok(route,`no ground at s=${s.toFixed(1)} offset ${o}`);
   assert.ok(!fixed.some(c=>circleHitsRect(px,pz,.3,c)&&c.height>groundHeight(px,pz)+.3),`something stands on the road at s=${s.toFixed(1)} o=${o}: `+fixed.filter(c=>circleHitsRect(px,pz,.3,c)).map(c=>c.id).join());
  }
  // Each step along the deck is one a person can take.
  const a=groundHeight(...roadPoint(s).slice(0,2)),b=groundHeight(...roadPoint(s+.5).slice(0,2));
  assert.ok(Math.abs(a-b)<.12,`a step of ${(b-a).toFixed(2)} m at s=${s.toFixed(1)}`);
 }
 // Off the side of the bridge is the sea, not somewhere to stand.
 const [x,z,hx,hz]=roadPoint(70),[lx,lz]=leftOf(hx,hz);
 assert.equal(routeAt(x+lx*(S.footway+1.2),z+lz*(S.footway+1.2)),null);
});

test('every lane is on drivable ground and clear of anything solid',async()=>{
 const {ferryLanes}=await import('../src/world/town-traffic.js?kitano-link');
 const moored=new THREE.Group();moored.position.set(FERRY_BERTH.x,0,FERRY_BERTH.z);moored.userData.deckY=FERRY.freeboard+.06;
 const ferry=[0,1].flatMap(i=>{const l=ferryLanes(moored,i);return [l.on,l.off];});
 for(const lane of [...traffic.network.lanes.values(),...ferry]){
  for(const p of lane.pts){
   assert.ok(!fixed.some(c=>circleHitsRect(p.x,p.z,.6,c)&&!/road-sign/.test(c.id||'')),`lane ${lane.id} runs into ${fixed.filter(c=>circleHitsRect(p.x,p.z,.6,c)).map(c=>c.id).join()} at ${p.x.toFixed(1)},${p.z.toFixed(1)}`);
   if(/ferry/.test(lane.id)&&p.z<-47.85)continue;
   assert.ok(routeAt(p.x,p.z),`lane ${lane.id} leaves the ground at ${p.x.toFixed(1)},${p.z.toFixed(1)}`);
   assert.ok(Math.abs(p.y-groundHeight(p.x,p.z))<.2,`lane ${lane.id} floats or sinks at ${p.x.toFixed(1)},${p.z.toFixed(1)}: ${p.y.toFixed(2)} vs ${groundHeight(p.x,p.z).toFixed(2)}`);
  }
 }
});

test('a day of owned traffic keeps drivers aboard, parking clear and trips purposeful',()=>{
 const all=[...traffic.fleet,...traffic.islanders];
 const corners=v=>{const {x,z}=v.g.position,y=v.g.rotation.y,c=Math.cos(y),s=Math.sin(y),hw=v.width/2,hl=v.length/2;return [[-hw,-hl],[hw,-hl],[hw,hl],[-hw,hl]].map(([a,b])=>[x+a*c+b*s,z-a*s+b*c]);};
 const overlap=(A,B)=>{for(const P of [A,B])for(let i=0;i<4;i++){const [ax,az]=P[i],[bx,bz]=P[(i+1)%4],nx=bz-az,nz=ax-bx;const pa=A.map(([x,z])=>x*nx+z*nz),pb=B.map(([x,z])=>x*nx+z*nz);if(Math.max(...pa)<Math.min(...pb)+.05||Math.max(...pb)<Math.min(...pa)+.05)return false;}return true;};
 const stuck=new Map(),airportVisits=new Set();let minutes=5*60,trips=0;const was=new Map();
 const dt=.1;
 for(let i=0;i<24*60*10;i++){
  minutes+=dt;// 60x: a town minute a second
  for(const p of world.people)if(!p.g.userData.inVehicle){p.g.position.set(-30,0,30);for(const key of ['indoors','inHome','inWorkplace','inBookshop','inMarket','inIzakaya','inRamen'])delete p.g.userData[key];}
  world.ferry.update(dt,minutes,i*dt);traffic.update(dt,minutes);
  for(const v of all){
   if(v.where!==was.get(v)){if(v.where==='airport'){airportVisits.add(v);trips++;}was.set(v,v.where);}
   if(v.trip)assert.ok(traffic.drivers.has(v),'Every trip has its real resident at the wheel');
   if(v.trip&&v.speed<.05&&!v.blocker&&!v.hold){stuck.set(v,(stuck.get(v)||0)+dt);assert.ok(stuck.get(v)<40,`${v.kind} stuck at ${v.g.position.x.toFixed(1)},${v.g.position.z.toFixed(1)} (blocked by ${v.blocker?.kind||v.blocker})`);}
   else stuck.set(v,0);
  }
  const shown=all.filter(v=>v.g.visible&&v.where!=='aboard');
  for(let a=0;a<shown.length;a++)for(let b=a+1;b<shown.length;b++)assert.ok(!overlap(corners(shown[a]),corners(shown[b])),`${shown[a].kind} (${shown[a].where} ${shown[a].slot} ${shown[a].trip?.path.length.toFixed(0)}) and ${shown[b].kind} (${shown[b].where} ${shown[b].slot}) overlap at minute ${minutes.toFixed(1)} ${world.ferry.phase} ${world.ferry.alongsideFor} at ${shown[a].g.position.x.toFixed(1)},${shown[a].g.position.z.toFixed(1)}`);
 }
 assert.ok(trips>=1&&trips<=8,'Purposeful daily appointments, rather than repeating laps: '+trips);
 for(const v of all)assert.ok(v.owner&&v.driver&&v.purpose);
});

test('a car waits for you standing in the road, then drives on',()=>{
 const v=traffic.islanders[1];
 for(const other of traffic.traffic.vehicles)if(other!==v){other.g.visible=false;other.trip=null;}v.hold=false;
 const path=traffic.network.path(['main-north','kitano-east-town']);
 v.where='driving';traffic.traffic.drive(v,path,{onArrive(){}});
 const ahead=pathPose(path,30);player=new THREE.Vector3(ahead.x,0,ahead.z);
 for(let i=0;i<300;i++)traffic.traffic.update(.1);
 assert.ok(v.blocker==='player','waiting on '+(v.blocker?.kind||v.blocker));assert.ok(v.speed<.05);
 const gap=Math.hypot(v.g.position.x-player.x,v.g.position.z-player.z);
 assert.ok(gap>v.length/2+.4,'stopped '+gap.toFixed(2)+' m from you');
 player=new THREE.Vector3(-30,0,30);
 for(let i=0;i<300;i++)traffic.traffic.update(.1);
 assert.ok(!v.trip,'it carried on to the end of its trip');
});

test('the bridge stands in the water: piers in the sea, nothing of the breakwaters under it',async()=>{
 const {airportSurface}=await import('../src/world/airport-ground.js');
 const {beachHeight}=await import('../src/world/beach-layout.js');
 const {breakwaterPlacements}=await import('../src/world/breakwaters.js');
 const {roadStation}=await import('../src/world/kitano-link-plan.js');
 const piers=world.kitanoLink.piers.slice(1,-1);
 assert.ok(piers.length>=5);
 for(const s of piers){const [x,z]=roadPoint(s);assert.equal(beachHeight(x,z),null,'a pier on the beach at s='+s);assert.equal(airportSurface(x,z),null,'a pier on the district at s='+s);}
 // The navigation span is the longest, and it is the crest.
 const spans=world.kitanoLink.piers.slice(1).map((s,i)=>[world.kitanoLink.piers[i],s]);
 const longest=spans.reduce((a,b)=>b[1]-b[0]>a[1]-a[0]?b:a);
 assert.ok(longest[0]<=KITANO_ROAD.profile.crestFrom+1&&longest[1]>=KITANO_ROAD.profile.crestTo-1,'navigation span '+longest);
 const S=KITANO_ROAD.section;
 for(const [x,,z] of breakwaterPlacements()){const {s,o}=roadStation(x,z);if(s<=0||s>=KITANO_ROAD_LENGTH)continue;assert.ok(o<S.north-S.parapet-2||o>S.footway+S.parapet+2,`a tetrapod under the bridge at ${x.toFixed(1)},${z.toFixed(1)}`);}
});
