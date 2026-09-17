import test from 'node:test';
import assert from 'node:assert/strict';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';

configureTownMode(TOWN_MODES.SHOPPING);
const {routeAt,groundHeight,ROUTES}=await import('../src/world/layout.js');
const {PARK,parkApproachHeight}=await import('../src/world/park-layout.js');

const RADIUS=.34;
const walkable=(x,z)=>!!routeAt(x,z,RADIUS);

test('the lawn can be walked the length of, not reached through one slot',()=>{
 const edge=PARK.x-PARK.half;
 let reachable=0,total=0;
 for(let z=PARK.z-PARK.half+1;z<=PARK.z+PARK.half-1;z+=.5){
  total++;
  // Somewhere in the two metres of ground immediately west of the park.
  for(let x=edge-2;x<edge;x+=.25)if(walkable(x,z)){reachable++;break;}
 }
 assert.ok(reachable/total>.9,
  'The ground beside the lawn is walkable along it, not blocked except at one approach: '
  +reachable+' of '+total+' places');
});

test('the apron joins the street rather than floating beside the park',()=>{
 // Walk west from the park edge at a few depths and expect to meet the main street
 // without crossing blocked ground.
 for(const z of [PARK.z-6,PARK.z-3,PARK.z,PARK.z+3,PARK.z+6]){
  let x=PARK.x-PARK.half-1,steps=0;
  assert.ok(walkable(x,z),'The apron exists at z='+z.toFixed(1));
  while(x>-4&&walkable(x-.25,z)){x-=.25;steps++;}
  assert.ok(x<=0,'From the park edge at z='+z.toFixed(1)+
   ' the ground runs west to the street, but it stops at x='+x.toFixed(2));
 }
});

test('no walkable ground hides a step the player would be popped up',()=>{
 // The park sits on a plinth of up to 1.2m and only its approach ramps onto it. A
 // walkable strip that crosses the plinth anywhere else would lift the player up the
 // side of it, which is worse than the wall it replaced.
 const worst={rise:0,at:null};
 for(let z=PARK.z-PARK.half-3;z<=PARK.z+PARK.half+3;z+=.25){
  for(let x=PARK.x-PARK.half-5;x<=PARK.x+PARK.half+1;x+=.25){
   if(!walkable(x,z))continue;
   const here=groundHeight(x,z);
   for(const [dx,dz] of [[.25,0],[0,.25]]){
    if(!walkable(x+dx,z+dz))continue;
    const rise=Math.abs(groundHeight(x+dx,z+dz)-here);
    if(rise>worst.rise){worst.rise=rise;worst.at=[+x.toFixed(2),+z.toFixed(2)];}
   }
  }
 }
 assert.ok(worst.rise<.25,
  'Ground rises '+worst.rise.toFixed(2)+'m over a quarter metre at '+JSON.stringify(worst.at));
});

test('the approach ramp is at least as wide as the route that uses it',()=>{
 const approach=ROUTES.find(r=>r.id==='park-approach');
 const half=approach.width/2;
 // Every walkable point on the approach is ramped, all the way to its edges.
 for(const z of [PARK.z-half+.1,PARK.z,PARK.z+half-.1]){
  const x=PARK.x-PARK.half-.4;
  if(!walkable(x,z))continue;
  assert.notEqual(parkApproachHeight(x,z),null,
   'The approach is walkable at z='+z.toFixed(2)+' but not ramped there');
 }
});
