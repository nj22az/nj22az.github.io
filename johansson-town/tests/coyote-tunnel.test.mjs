import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildCoyoteTunnel,TUNNEL,tunnelEndZ} from '../src/world/coyote-tunnel.js';
import {circleHitsRect} from '../physics.js';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {routeAt} from '../src/world/layout.js?snappy=1';

test('the rock is a headland with an opening under its brow, not a slab with a hole painted on it',()=>{
 installDOM();
 const parent=new THREE.Group(),colliders=[];
 const {face,paint,coyote}=buildCoyoteTunnel({parent,colliders});
 parent.updateMatrixWorld(true);

 // A skyline: the rock stands highest over the road and falls away to either side.
 const ray=new THREE.Raycaster(),crown=[];
 for(const x of [TUNNEL.x,TUNNEL.x-9,TUNNEL.x-14,TUNNEL.x+9,TUNNEL.x+14]){
  ray.set(new THREE.Vector3(x,40,TUNNEL.z+TUNNEL.depth/2),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(face,false)[0];
  assert.ok(hit,'No rock at x='+x);crown.push(hit.point.y);
 }
 const [middle,west,farWest,east,farEast]=crown;
 assert.ok(middle>west&&west>farWest,'The rock does not fall away to the west');
 assert.ok(middle>east&&east>farEast,'The rock does not fall away to the east');
 assert.ok(middle>TUNNEL.height-.8,'The crown is lower than the hill it stands for');
 assert.ok(farWest>TUNNEL.shoulder*.4&&farEast>TUNNEL.shoulder*.4,'The hill ends in mid-air rather than running into the ground');
 const top=paint.position.y+TUNNEL.archHeight/2;
 assert.ok(top<middle-1,'The painting runs into the skyline');
 assert.equal(paint.material.transparent,true);
 assert.ok(paint.material.map,'The mouth has no rim');

 // The opening is a hole: a ray down the road at chest height does not hit the hill.
 ray.set(new THREE.Vector3(TUNNEL.x,1.5,TUNNEL.z-2),new THREE.Vector3(0,0,1));
 assert.equal(ray.intersectObject(face,false).length,0,'The arch is still a wall');

 // The cheeks stop you. The road through the arch does not.
 const left=colliders.find(c=>c.id==='tunnel-left'),right=colliders.find(c=>c.id==='tunnel-right');
 assert.ok(left&&right,'Nothing stops you beside the tunnel');
 assert.ok(circleHitsRect(TUNNEL.x-TUNNEL.archWidth/2-1,TUNNEL.z+TUNNEL.depth/2,.36,left),'You can walk into the west cheek');
 assert.ok(circleHitsRect(TUNNEL.x+TUNNEL.archWidth/2+1,TUNNEL.z+TUNNEL.depth/2,.36,right),'You can walk into the east cheek');
 for(const z of [TUNNEL.z+.4,TUNNEL.z+TUNNEL.depth/2,TUNNEL.z+TUNNEL.depth- .4]){
  assert.ok(!colliders.some(c=>circleHitsRect(TUNNEL.x,z,.36,c)),'The arch is blocked at z='+z);
 }
 assert.ok(coyote,'The coyote did not come');
});

test('the rock knows when a cheek has been run into, and not when you take the road',()=>{
 installDOM();
 const {splat}=buildCoyoteTunnel({parent:new THREE.Group(),colliders:[]});
 assert.equal(splat(TUNNEL.x-TUNNEL.archWidth/2-1,TUNNEL.z+TUNNEL.depth/2),true,'Running at the west cheek is not a collision with it');
 assert.equal(splat(TUNNEL.x,TUNNEL.z+TUNNEL.depth/2),false,'The road through the arch counts as the rock');
 assert.equal(splat(TUNNEL.x,TUNNEL.z-4),false,'The road in front of it counts as the rock');
 assert.equal(splat(TUNNEL.x-TUNNEL.width,TUNNEL.z+TUNNEL.depth/2),false,'Open ground beside the hill counts as the rock');
});

test('the coyote follows once you walk far enough, including through the arch',()=>{
 installDOM();
 const parent=new THREE.Group();
 const {coyote,update}=buildCoyoteTunnel({parent,colliders:[]});
 const start=coyote.position.clone();
 update(.2,{x:TUNNEL.x,z:TUNNEL.z-20});
 assert.ok(coyote.position.distanceTo(start)<.05,'The coyote follows from the far end of the bus road');
 update(0,{x:TUNNEL.x+1,z:TUNNEL.z-3});
 for(let i=0;i<40;i++)update(.2,{x:TUNNEL.x,z:TUNNEL.z+TUNNEL.depth/2});
 assert.ok(Math.abs(coyote.position.x-TUNNEL.x)<2.4,'The coyote will not come onto the road');
 assert.ok(coyote.position.z>TUNNEL.z,'The coyote stops at the mouth');
});

test('the peninsula road is walkable through the tunnel to the lookout',()=>{
 configureTownMode(TOWN_MODES.PENINSULA);
 try{
  for(const z of [TUNNEL.z-1,TUNNEL.z+1,TUNNEL.z+TUNNEL.depth/2,tunnelEndZ()-.5]){
   assert.ok(routeAt(TUNNEL.x,z,.32),'No ground through the tunnel at z='+z);
  }
  assert.ok(!routeAt(TUNNEL.x,tunnelEndZ()+2,.32),'The lookout runs on into the sea');
 }finally{configureTownMode(TOWN_MODES.LEGACY);}
});
