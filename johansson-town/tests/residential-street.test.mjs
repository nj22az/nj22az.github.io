import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js';
import {createBusinesses} from '../src/world/businesses.js';
import {preloadResidentialStreet} from '../src/world/residential-street.js';
import {RESIDENTIAL_ENTRIES} from '../src/world/residential-layout.js';
import {MAIN_STREET_SECTIONS} from '../src/world/main-street-sections.js';
import {frontageShader} from '../src/render/frontage-material.js';
const nativeFetch=globalThis.fetch;
function fetchAssets(requests=[]){globalThis.fetch=async url=>{url=url.url||url;if(String(url).startsWith('blob:'))return nativeFetch(url);const path=new URL(url).pathname.split('/assets/')[1];requests.push(path);return new Response(await readFile(new URL('../assets/'+path,import.meta.url)));};}
function make(){
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:2048,height:2048,close(){}});
 const sites=createBusinesses(),actions=[],entered=[];
 const world=createTown({scene:new THREE.Scene(),sites,mobile:true,register:(o,label,fn)=>actions.push({o,label,fn}),onAction:(kind,title,flats)=>{if(kind==='visit-home')flats[1].enter();},enter:s=>entered.push(s)});
 return {world,sites,actions,entered};
}
test('frontage keeps source attribution, native UV repeats and a bounded mobile budget',async()=>{
 const folder=new URL('../assets/models/main-street/',import.meta.url),manifest=JSON.parse(await readFile(new URL('manifest.json',folder)));let bytes=0,triangles=0,draws=0;
 assert.match(manifest.source.author,/Pasha/);assert.equal(manifest.sourceBytes,72942356);assert.equal(manifest.scale,.022);assert.equal(manifest.atlasCount,2);
 for(const section of MAIN_STREET_SECTIONS){
  const raw=await readFile(new URL(section.file,folder)),doc=JSON.parse(raw.subarray(20,20+raw.readUInt32LE(12)));bytes+=raw.length;assert.equal(raw.length,section.bytes);
  assert.ok(doc.buffers.every(b=>!b.uri));assert.equal(doc.images,undefined);
  for(const mesh of doc.meshes)for(const primitive of mesh.primitives){draws++;triangles+=doc.accessors[primitive.indices].count/3;for(const attr of ['TEXCOORD_0','TEXCOORD_1','TEXCOORD_2'])assert.ok(Number.isInteger(primitive.attributes[attr]));}
 }
 assert.equal(draws,6);assert.ok(triangles<90000);assert.ok(bytes<8500000);assert.equal(Object.keys(RESIDENTIAL_ENTRIES).length,5);
 const shader={vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader};frontageShader(shader);
 assert.match(shader.fragmentShader,/fract\(vMapUv\)/);assert.match(shader.fragmentShader,/textureGrad/);assert.match(shader.vertexShader,/vFrontageAtlas=vec4\(uv1,uv2\)/);
});
test('failed frontage loads can recover without reloading the town',async()=>{
 make();const loader=await import('../src/world/residential-street.js?retry-test');globalThis.fetch=async()=>new Response('',{status:503});
 try{assert.equal(await loader.preloadResidentialStreet(),false);fetchAssets();assert.equal(await loader.preloadResidentialStreet(),true);}finally{globalThis.fetch=nativeFetch;}
});
