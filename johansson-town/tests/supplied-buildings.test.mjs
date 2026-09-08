import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {installDOM} from './fixtures.mjs';

test('supplied buildings load with portable maps and bounded geometry',async()=>{
 installDOM();const originalFetch=globalThis.fetch,originalBitmap=globalThis.createImageBitmap,originalSelf=globalThis.self;
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
 try{
  for(const path of ['izakaya/minato-supplied-exterior.glb','tea-house/tea-house-exterior.glb']){
   const bytes=await readFile(new URL('../assets/models/'+path,import.meta.url));assert.ok(bytes.length<6_000_000);
   const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
   let triangles=0,meshes=0;scene.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;assert.ok(o.material.map);assert.ok(o.material.normalMap);assert.equal(o.material.side,THREE.FrontSide);}});
   assert.equal(meshes,1);assert.ok(triangles<=60010);assert.ok(triangles>50000);
   const bounds=new THREE.Box3().setFromObject(scene),size=bounds.getSize(new THREE.Vector3());assert.ok(Math.abs(bounds.min.y+.08)<.02);assert.ok(size.y>4&&size.y<5.5);assert.ok(size.x<8&&size.z<8.5);
  }
  const {preloadTeaHouse,buildTeaHouse}=await import('../src/world/tea-house.js');assert.equal(await preloadTeaHouse(),true);
  const world={group:new THREE.Group(),colliders:[]},sites=[],actions=[];
  buildTeaHouse(world,{sites,register:(o,label,fn)=>actions.push({o,label,fn}),enter:site=>assert.equal(site.id,'tea-house')});
  assert.equal(sites[0].id,'tea-house');actions[0].fn();assert.deepEqual(actions[0].o.position.toArray(),[46,1,62]);
  assert.ok(!world.colliders.some(c=>Math.abs(c.x-46)<c.w/2+.3&&Math.abs(c.z-62)<c.d/2+.3),'Entrance is clear');
 }finally{globalThis.fetch=originalFetch;globalThis.createImageBitmap=originalBitmap;globalThis.self=originalSelf;}
});
