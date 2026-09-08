import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('repaired Yuri has one skeleton, deduplicated compatible clips and local textures',async()=>{
 const b=await readFile(new URL('../assets/characters/realistic/yuri-playful.glb',import.meta.url));
 assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(8),b.length);
 const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());
 assert.equal(g.skins.length,1);assert.equal(g.skins[0].joints.length,28);
 assert.deepEqual(g.animations.map(a=>a.name).sort(),['Idle_Neutral','Run','Walk']);
 assert.equal(g.images.length,3);for(const image of g.images){assert.equal(image.uri,undefined);assert.ok(Number.isInteger(image.bufferView));}
 for(const buffer of g.buffers)assert.equal(buffer.uri,undefined);
 const tris=g.meshes.flatMap(m=>m.primitives).reduce((sum,p)=>sum+g.accessors[p.indices].count/3,0);assert.ok(tris>4352&&tris<30000);
 for(const node of g.nodes.filter(n=>n.mesh!==undefined))assert.ok(Number.isInteger(node.skin));
});
