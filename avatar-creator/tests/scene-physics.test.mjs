import test from 'node:test';
import assert from 'node:assert/strict';
import {hitsSolid,walkTo} from '../scene-physics.mjs';
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
