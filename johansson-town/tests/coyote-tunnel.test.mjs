import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildCoyoteTunnel,TUNNEL,hillHeight} from '../src/world/coyote-tunnel.js';
import {FOREST_EDGE} from '../src/world/forest-edge.js';
import {BUS_STATION} from '../src/world/bus-station.js';
import {circleHitsRect} from '../physics.js';

test('the tunnel is a real one: a portal in a headland, with a bore you can see down',()=>{
 installDOM();
 const parent=new THREE.Group(),colliders=[];
 const {hill,portal,bore}=buildCoyoteTunnel({parent,colliders});
 parent.updateMatrixWorld(true);

 // A headland: highest over the bore and falling away to either side.
 const ray=new THREE.Raycaster(),crown=[];
 for(const x of [TUNNEL.x,TUNNEL.x-12,TUNNEL.x-22,TUNNEL.x+12,TUNNEL.x+22]){
  ray.set(new THREE.Vector3(x,60,TUNNEL.z+18),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(hill,false)[0];
  assert.ok(hit,'No hill at x='+x);crown.push(hit.point.y);
 }
 const [middle,west,farWest,east,farEast]=crown;
 // A drawn hill, not a measured one: it has a shoulder to the west, so only the ends
 // are pinned -- they are lower than anywhere near the crown.
 assert.ok(farWest<Math.min(middle,west)-2,'The hill does not fall away to the west');
 assert.ok(farEast<Math.min(middle,east)-2,'The hill does not fall away to the east');
 assert.ok(middle>TUNNEL.height,'The hill is lower than the tunnel it holds');
 assert.ok(hillHeight(TUNNEL.x,TUNNEL.z+70)<0,'The hill ends in mid-air rather than running into the sea');

 // From the road you see into the hill: down the middle, nothing stops a sightline for
 // twenty metres, and what it meets at last is the tunnel itself -- not a wall, not paint.
 const solids=[hill,portal.headwall,portal.archRing,portal.name];
 ray.set(new THREE.Vector3(TUNNEL.x,1.6,TUNNEL.z-12),new THREE.Vector3(0,0,1));ray.far=60;
 assert.equal(ray.intersectObjects(solids,false).length,0,'Something closes off the mouth of the tunnel');
 const inside=ray.intersectObject(bore,false)[0]||null;
 ray.set(new THREE.Vector3(TUNNEL.x,3,TUNNEL.z-12),new THREE.Vector3(0,.12,1).normalize());
 const roof=ray.intersectObject(bore,false)[0];
 assert.ok(roof&&roof.point.z>TUNNEL.z+15,'The tunnel roof is not there to see down');
 assert.equal(inside,null,'Something stands in the tunnel road');
 // The headwall stands over the arch with the hill running on up behind it.
 const top=portal.headwall.geometry.boundingBox??(portal.headwall.geometry.computeBoundingBox(),portal.headwall.geometry.boundingBox);
 assert.ok(top.max.y>TUNNEL.bore.spring+TUNNEL.bore.half+1,'The headwall does not stand over the arch');
 assert.ok(hillHeight(TUNNEL.x,TUNNEL.z+6)>top.max.y,'The hill does not rise over the portal');

 // and the portal stops you: you can walk to the mouth and look in, not walk in.
 const wall=colliders.find(c=>c.id==='tunnel-portal');
 assert.ok(wall,'Nothing stops you at the tunnel');
 for(const x of [TUNNEL.x,TUNNEL.x-2,TUNNEL.x+2])assert.ok(circleHitsRect(x,TUNNEL.z+1,.36,wall),'You can walk into the tunnel at x='+x);
 assert.ok(!circleHitsRect(TUNNEL.x,TUNNEL.z-TUNNEL.portal-1.2,.36,wall),'You cannot reach the mouth');
});

test('the portal knows when it has been walked into',()=>{
 installDOM();
 const {splat}=buildCoyoteTunnel({parent:new THREE.Group(),colliders:[]});
 assert.equal(splat(TUNNEL.x,TUNNEL.z-TUNNEL.portal-.3),true,'Walking into the mouth is not reaching it');
 assert.equal(splat(TUNNEL.x,TUNNEL.z-4),false,'The road in front of it counts as the portal');
 assert.equal(splat(TUNNEL.x-TUNNEL.width,TUNNEL.z+TUNNEL.depth/2),false,'Open ground beside the hill counts as the portal');
});

test('NPC away/exit waypoint stays clear of the tunnel mouth',()=>{
 assert.ok(BUS_STATION.exit[1]<FOREST_EDGE.roadStartZ,'exit must not enter the forest bus road');
 assert.ok(BUS_STATION.exit[1]<TUNNEL.z-1.2,'exit must stay south of the bus mouth');
 assert.deepEqual(BUS_STATION.exit,BUS_STATION.platform,'away staging is the platform, not the arch');
});