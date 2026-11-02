import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {OBJECT_MODELS,modelFor,objectVisual,validVisuals} from '../object-library.mjs';
const root=new URL('../',import.meta.url);
test('Blender catalogue exports are complete, bounded and lightweight',()=>{
 const source=JSON.parse(readFileSync(new URL('blender/catalogue.json',root))),review=JSON.parse(readFileSync(new URL('blender/geometry-review.json',root)));
 assert.equal(OBJECT_MODELS.length,source.length);assert.equal(new Set(OBJECT_MODELS.map(m=>m.id)).size,source.length);
 assert.equal(readFileSync(new URL('blender/equipment-library.blend',root)).subarray(0,4).toString('hex'),'28b52ffd');
 for(const m of OBJECT_MODELS){
  const s=source.find(s=>s.id===m.id),g=review.find(g=>g.id===m.id);assert.ok(s&&g);assert.ok(g.parts>0);
  assert.ok(g.boundsMetres.every((n,i)=>n>0&&n<=s.envelopeMm[i]/1000+.001));assert.ok(Math.max(...g.boundsMetres.map((n,i)=>n/(s.envelopeMm[i]/1000)))>.75);
  const image=new URL(m.image,root);assert.ok(statSync(image).size<100_000);assert.equal(readFileSync(image).subarray(8,12).toString(),'WEBP');
  const glb=readFileSync(new URL(m.model,root));assert.equal(glb.subarray(0,4).toString(),'glTF');assert.equal(glb.readUInt32LE(8),glb.length);assert.ok(glb.length<1_000_000);
  const data=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)).toString());assert.ok(data.meshes.length>0);assert.ok(data.nodes.length>0);
  assert.ok(!Object.keys(m).some(k=>/pressure|fluid|category|interval|className|volume/i.test(k)));
 }
});
test('visuals are explicit for real inventory and demo defaults can be cleared',()=>{assert.equal(modelFor({name:'Pump',type:'Pump'}),undefined);assert.equal(modelFor({id:'demo-pump',demo:true}).id,'pump');assert.equal(modelFor({id:'demo-pump',demo:true,visualModelId:''}),undefined);assert.equal(modelFor({id:'demo-pump',demo:false}),undefined);assert.equal(objectVisual({visualModelId:'removed-custom-model'}),'');});
test('future model IDs survive backups while arbitrary image URLs cannot enter the visual field',()=>{assert.equal(validVisuals({assets:[{visualModelId:'custom-filter-unit'}]}),true);assert.equal(validVisuals({assets:[{}]}),true);assert.equal(validVisuals({assets:[{visualModelId:'https://example.test/photo.png'}]}),false);assert.equal(validVisuals({assets:[null]}),false);});
