import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {newRoom,editRoom,validateRoom,readRoom,encodeGLB,roomHistory,roomSummary} from '../../johansson-town/src/studio/room-project.js';
const glb=encodeGLB(new Uint8Array(await readFile(new URL('../../johansson-town/assets/catalog/johansson-trucker-display/model.glb',import.meta.url))));
const filled=()=>editRoom(newRoom(),[{op:'asset.add',id:'hat',name:'Hat',glb},{op:'object.add',id:'first',asset:'hat',position:[1,0,2]}]);
test('room commands are atomic and preserve original documents and stable identities',()=>{
 const p=filled(),before=JSON.stringify(p);
 assert.throws(()=>editRoom(p,[{op:'object.delete',id:'first'},{op:'object.add',asset:'missing'}]),/missing asset/);
 assert.equal(JSON.stringify(p),before);assert.throws(()=>editRoom(p,[{op:'title',title:'x'}],{expectedRevision:0}),/Revision conflict/);
 const next=editRoom(p,[{op:'object.update',id:'first',set:{name:'Display',position:[3,0,4]}}]);assert.equal(next.objects[0].id,'first');assert.deepEqual(p.objects[0].position,[1,0,2]);
});
test('replacement preserves placement, shared updates report usages, and referenced assets cannot be removed',()=>{
 let p=filled();p=editRoom(p,[{op:'object.duplicate',id:'first',newId:'second'}]);
 assert.deepEqual(roomSummary(p).assets[0].usedBy,['first','second']);
 assert.throws(()=>editRoom(p,[{op:'asset.remove',id:'hat'}]),/still used/);
 const next=editRoom(p,[{op:'asset.add',id:'replacement',name:'Replacement',glb},{op:'object.replace',id:'first',asset:'replacement'}]);
 assert.deepEqual(next.objects[0].position,p.objects[0].position);assert.equal(next.objects[1].asset,'hat');
 const shared=editRoom(p,[{op:'asset.update',id:'hat',name:'New revision',glb}]);assert.equal(shared.assets.hat.version,2);assert.equal(p.assets.hat.version,1);
});
test('undo and redo preserve asset contents and increase the save revision',()=>{
 const h=roomHistory(filled()),v=h.current.revision;h.apply([{op:'object.delete',id:'first'}]);assert.equal(h.current.objects.length,0);
 h.undo();assert.equal(h.current.objects[0].id,'first');assert.equal(h.current.revision,v+2);h.redo();assert.equal(h.current.objects.length,0);assert.equal(h.current.revision,v+3);
 h.undo();h.apply([{op:'title',title:'Changed'}]);assert.equal(h.canRedo,false);
});
test('portable room round trip retains editable models, transforms and schema checks',()=>{
 const p=filled(),q=readRoom(JSON.stringify(p));assert.deepEqual(q,p);
 assert.throws(()=>validateRoom({...p,objects:[p.objects[0],p.objects[0]]}),/Duplicate/);
 assert.throws(()=>editRoom(p,[{op:'object.update',id:'first',set:{position:[Infinity,0,0]}}]),/transform/);
 assert.throws(()=>editRoom(p,[{op:'object.update',id:'first',set:{asset:'bad'}}]),/Cannot edit/);
 assert.throws(()=>editRoom(p,[{op:'asset.add',id:'__proto__',name:'bad',glb}]),/identifier/);
});
test('room grid and connector commands use the shared model snapping rules',()=>{
 let p=editRoom(filled(),[{op:'object.update',id:'first',set:{position:[.123,0,.27]}},{op:'object.snap',id:'first',mode:'grid',step:.05}]);assert.deepEqual(p.objects[0].position,[.1,0,.25]);
 p=editRoom(p,[{op:'object.snap',id:'first',mode:'connector',source:{point:[0,0,0],normal:[0,-1,0]},target:{point:[1,2,3],normal:[0,1,0]}}]);assert.deepEqual(p.objects[0].position,[1,2,3]);
});
