import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Blender resident has embedded textures, bounded geometry and portable animation',async()=>{
 const bytes=await readFile(new URL('../assets/characters/realistic/kenji.glb',import.meta.url));
 assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(8),bytes.length);
 assert.ok(bytes.length<7_000_000,'Keep first resident within the 7 MB budget');
 const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 for(const buffer of gltf.buffers)assert.equal(buffer.uri,undefined,'No external buffers');
 assert.equal(gltf.images.length,8);
 for(const image of gltf.images){assert.equal(image.uri,undefined);assert.ok(Number.isInteger(image.bufferView));assert.ok(['image/png','image/jpeg'].includes(image.mimeType));}
 const triangles=gltf.meshes.flatMap(m=>m.primitives).reduce((n,p)=>n+gltf.accessors[p.indices].count/3,0);
 assert.ok(triangles>12000&&triangles<25000);
 assert.equal(gltf.nodes.filter(n=>n.skin!==undefined).length,6);
 assert.deepEqual(gltf.animations.map(a=>a.name).sort(),['Idle','Idle_Neutral','Interact','Run','Walk','Wave']);
 assert.ok(gltf.materials.every(m=>m.pbrMetallicRoughness?.baseColorTexture),'All visible parts keep authored textures');
});

test('Yui accessories remain bound to the animated skeleton',async()=>{
 const bytes=await readFile(new URL('../assets/characters/realistic/yui.glb',import.meta.url));
 const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 for(const node of gltf.nodes.filter(n=>n.mesh!==undefined))assert.ok(Number.isInteger(node.skin),'Unbound visible part: '+node.name);
 assert.ok(bytes.length<7_000_000);for(const image of gltf.images)assert.ok(Number.isInteger(image.bufferView));
});
