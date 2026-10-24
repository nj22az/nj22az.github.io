import test from 'node:test';
import assert from 'node:assert/strict';
import {hitsSolid,walkTo,slideTo} from '../scene-physics.mjs';
import {normalizeScene} from '../scene-model.mjs';
test('drag and slider movement cannot tunnel through a narrow wall',()=>{
 const solids=[{x:1,z:0,w:.1,d:3,height:2}];
 const p=walkTo({x:0,z:0},{x:4,z:0},(x,z)=>hitsSolid(x,z,.23,solids));
 assert.ok(p.x<.73);assert.ok(p.x>.5);
});
test('floor slabs do not block feet and overhead fittings do not block walking',()=>{
 assert.equal(hitsSolid(0,0,.23,[{x:0,z:0,w:3,d:3,height:.04}],.04),false);
 assert.equal(hitsSolid(0,0,.23,[{x:0,z:0,w:3,d:3,height:3,minY:2.5}],0),false);
 assert.equal(hitsSolid(0,0,.23,[{x:0,z:0,w:1,d:1,height:.9}],0),true);
});
test('old flat projects preserve characters while migrating placement into metres',()=>{
 const s=normalizeScene({version:1,actors:[{recipe:{name:'A'},x:.8,y:.9,size:.46,pose:'Wave',speech:'Hello'}]});
 assert.equal(s.version,2);assert.equal(s.actors[0].size,1);assert.equal(s.actors[0].x,0);assert.equal(s.actors[0].z,0);assert.equal(s.actors[0].speech,'Hello');assert.equal(s.actors[0].pose,'Wave');
});
test('a turned box collides where it stands (yaw as World\'s circleHitsRect), not where an unturned one would',()=>{
 const wall={x:0,z:0,w:2,d:.2,height:2,yaw:Math.PI/4};
 assert.equal(hitsSolid(.566,-.566,.05,[wall]),true,'inside the turned box (its local x 0.8)');
 assert.equal(hitsSolid(.9,.09,.05,[wall]),false,'the unturned box\'s corner is open floor');
 assert.equal(hitsSolid(.9,.09,.05,[{...wall,yaw:0}]),true);
});
test('dragged at 30° into a wall, a character slides along it instead of stopping dead',()=>{
 const solids=[{x:1,z:0,w:.1,d:10,height:2}],blocked=(x,z)=>hitsSolid(x,z,.23,solids),target={x:3*Math.sin(Math.PI/6),z:3*Math.cos(Math.PI/6)};
 const stopped=walkTo({x:0,z:0},target,blocked);assert.ok(stopped.z<1.3,'a plain walk stops at the wall');
 const slid=slideTo({x:0,z:0},target,blocked);assert.ok(slid.x<.73&&slid.x>.6,'still this side of the wall');assert.ok(slid.z>2.5,'slid along it: '+slid.z.toFixed(2));
 assert.deepEqual(slideTo({x:0,z:0},{x:.3,z:.4},blocked),{x:.3,z:.4},'nothing in the way: straight there');
});
