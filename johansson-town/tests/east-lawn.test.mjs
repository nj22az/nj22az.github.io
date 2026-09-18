import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {EAST_LAWN,buildEastLawn} from '../src/world/east-lawn.js';
import {PARK} from '../src/world/park-layout.js';
import {MAIN_ROAD} from '../src/world/main-road.js';
import {circleHitsRect} from '../physics.js';

/** The peninsula land sits at this height, and the surrounding sea at this one. */
const LAND=-.4,WATER=-.56;

test('the east of the town is one green from the kerb to the seawall',async()=>{
 configureTownMode(TOWN_MODES.PENINSULA);
 const {routeAt,groundHeight}=await import('../src/world/layout.js?east-lawn');
 // Everything between the pavement and the wall is walkable at pavement level, which
 // is what it was not: the park was an island and the rest was scenery below the kerb.
 const off=[],onPark=(x,z)=>Math.abs(x-PARK.x)<=PARK.half+.45&&Math.abs(z-PARK.z)<=PARK.half+.45;
 for(let x=MAIN_ROAD.pavementEast+.6;x<EAST_LAWN.maxX-.6;x+=.8)for(let z=EAST_LAWN.minZ+.6;z<EAST_LAWN.maxZ-.6;z+=1.2){
  const route=routeAt(x,z,.4);
  // The mound and its ramp are the park's, not the lawn's.
  if(onPark(x,z))continue;
  if(!route)off.push(x.toFixed(1)+','+z.toFixed(1));
  else if(route.id===EAST_LAWN.id&&groundHeight(x,z)!==0)off.push('stepped at '+x.toFixed(1)+','+z.toFixed(1));
 }
 assert.deepEqual(off.slice(0,6),[],'Ground east of the road you still cannot stand on');
 assert.equal(routeAt(28,4).surface,'grass');
 // The park is asked first, so the lawn is the ground around its mound, not a lid.
 assert.equal(routeAt(PARK.x,PARK.z).id,PARK.id);
 assert.ok(groundHeight(PARK.x,PARK.z)>1,'The park keeps its mound');
 // and the lawn stops where the town does.
 assert.ok(!routeAt(EAST_LAWN.maxX+1.5,0),'The lawn runs past the seawall');
 configureTownMode(TOWN_MODES.LEGACY);
 assert.ok(!routeAt(28,4),'Only the peninsula has an east side to stand on');
 configureTownMode(TOWN_MODES.PENINSULA);
});

test('the seawall stops you, and the sand below it stays above the ground it lies on',()=>{
 installDOM();
 const parent=new THREE.Group(),colliders=[];
 const {shore}=buildEastLawn({parent,colliders});
 const wall=colliders.filter(c=>c.id==='east-seawall');
 assert.equal(wall.length,2,'The wall returns along the south side to close the corner');
 for(const z of [-30,-10,10,20])assert.ok(wall.some(c=>circleHitsRect(EAST_LAWN.wall.x,z,.36,c)),'You can walk through the seawall at z='+z);
 assert.ok(colliders.some(c=>c.id==='east-lawn-trees'),'The north end is left open onto unbuilt land');

 // Dry sand has to draw above the peninsula's own ground or the land shows through it,
 // and it has to reach below the water or the beach ends in a step.
 const [first]=EAST_LAWN.beach.profile,last=EAST_LAWN.beach.profile.at(-1);
 assert.ok(first[1]>LAND,'The beach starts below the ground it lies on');
 assert.ok(last[1]<WATER,'The beach never reaches the water');
 let previous=Infinity;
 for(const [x,y] of EAST_LAWN.beach.profile){
  assert.ok(y<previous,'The beach rises again at x='+x);previous=y;
  if(y>WATER)assert.ok(y>LAND,'Dry sand at x='+x+' is under the land at y='+y);
 }
 parent.updateMatrixWorld(true);
 const ray=new THREE.Raycaster();
 ray.set(new THREE.Vector3((EAST_LAWN.beach.profile[1][0]+EAST_LAWN.beach.profile[2][0])/2,6,0),new THREE.Vector3(0,-1,0));
 assert.equal(ray.intersectObject(shore).length,1,'No sand above the beach');
});
