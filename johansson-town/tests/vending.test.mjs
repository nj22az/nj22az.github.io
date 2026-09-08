import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {prepareVendingModel,createVendingMachine} from '../src/world/vending.js';
import {installDOM} from './fixtures.mjs';

test('local vending GLB fits its existing collider and renders as one opaque body',async()=>{
 const bytes=await readFile(new URL('../assets/models/props/vending-machine.glb',import.meta.url));
 const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const mesh=prepareVendingModel(gltf.scene),b=mesh.geometry.boundingBox;
 assert.ok(b.max.x-b.min.x<=1.30001);assert.ok(b.max.z-b.min.z<=1.00001);
 assert.ok(Math.abs(b.min.y)<.00001);assert.ok(b.max.y<=2.25001&&b.max.y>2);
 assert.equal(mesh.geometry.groups.length,0);assert.equal(mesh.material.transparent,false);
 assert.equal(mesh.geometry.attributes.color.count,mesh.geometry.attributes.position.count);
});
test('vending remains usable with a visible fallback when model loading fails',()=>{
 installDOM();const group=createVendingMachine();assert.equal(group.children.length,3);
 assert.ok(group.children.every(child=>child.isMesh));
});
