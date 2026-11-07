import test from 'node:test';
import assert from 'node:assert/strict';
import {nearbyPlacement,cameraRecord} from '../scene-flight.js';
import {normalizeScene,emptyScene} from '../scene-model.mjs';
import * as THREE from '../../johansson-town/vendor/three.module.js';

test('a free-camera view at actual town coordinates survives project reopening',()=>{
 const camera=new THREE.PerspectiveCamera(55);camera.position.set(45,3,65);camera.rotation.set(-.2,.7,0,'YXZ');
 const record=cameraRecord(camera),scene=normalizeScene({...emptyScene(),camera:record});
 assert.deepEqual(scene.camera.position,[45,3,65]);assert.deepEqual(scene.camera.target,record.target);
 const restored=new THREE.PerspectiveCamera();restored.position.fromArray(scene.camera.position);restored.lookAt(...scene.camera.target);
 assert.ok(restored.getWorldDirection(new THREE.Vector3()).distanceTo(camera.getWorldDirection(new THREE.Vector3()))<1e-10);
 assert.equal(normalizeScene({...emptyScene(),camera:{...record,position:[NaN,3,65]}}).camera.position,undefined);
});
test('new cast goes in front of the current lens, avoiding occupied, hidden and out-of-stage floor',()=>{
 const context={position:{x:40,z:60},direction:{x:0,z:-1},origin:[40,0,60],free:()=>true};
 assert.deepEqual(nearbyPlacement(context),{x:40,z:57.5});
 assert.notEqual(nearbyPlacement({...context,free:(x,z)=>x!==40}).x,40);
 assert.equal(nearbyPlacement({...context,seen:()=>false}),null);
 assert.equal(nearbyPlacement({...context,free:()=>false}),null);
 assert.equal(nearbyPlacement({...context,position:{x:100,z:100}}),null);
});
