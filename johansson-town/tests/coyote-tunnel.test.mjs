import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildCoyoteTunnel,TUNNEL} from '../src/world/coyote-tunnel.js';
import {circleHitsRect} from '../physics.js';

test('the rock is a headland with the painting under its brow, not a slab with a hole',()=>{
 installDOM();
 const parent=new THREE.Group(),colliders=[];
 const {face,paint}=buildCoyoteTunnel({parent,colliders});
 parent.updateMatrixWorld(true);

 // A skyline: the rock stands highest over the road and falls away to either side.
 const ray=new THREE.Raycaster(),crown=[];
 for(const x of [TUNNEL.x,TUNNEL.x-6,TUNNEL.x-9.5,TUNNEL.x+6,TUNNEL.x+9.5]){
  ray.set(new THREE.Vector3(x,40,TUNNEL.z+TUNNEL.depth/2),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(face,false)[0];
  assert.ok(hit,'No rock at x='+x);crown.push(hit.point.y);
 }
 const [middle,west,farWest,east,farEast]=crown;
 assert.ok(middle>west&&west>farWest,'The rock does not fall away to the west');
 assert.ok(middle>east&&east>farEast,'The rock does not fall away to the east');
 assert.ok(Math.abs(west-east)<.01,'The crown is not centred on the road');
 assert.ok(middle>TUNNEL.height-.6,'The crown is lower than the face it replaces');
 // and the painting fits under it, with the rock's own brow above the arch.
 const top=paint.position.y+TUNNEL.archHeight/2;
 assert.ok(top<middle-1,'The painting runs into the skyline');

 // The paint is a picture on the rock, not a panel: outside the arch the canvas is
 // left alone, so the plane's own rectangle never shows against the cliff. (The DOM
 // used here has no pixels to read back, so this is as far as it can be checked
 // without a browser.)
 assert.equal(paint.material.transparent,true);
 assert.ok(paint.material.map,'The painting has no texture');

 // and the whole face stops you, arch and all.
 const wall=colliders.find(c=>c.id==='painted-tunnel');
 assert.ok(wall,'Nothing stops you at the tunnel');
 for(const x of [TUNNEL.x,TUNNEL.x-8,TUNNEL.x+8])assert.ok(circleHitsRect(x,TUNNEL.z+TUNNEL.depth/2,.36,wall),'You can walk into the painting at x='+x);
});
