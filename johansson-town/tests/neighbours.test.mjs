import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {installDOM} from './fixtures.mjs';
import {preloadStreetPlants,buildStreetPlants} from '../src/world/street-plants.js';
import {createMaterials} from '../src/render/materials.js?snappy=1';
import {createHarbourInstances} from '../src/render/harbour-instances.js';

test('all VRoid bases load locally, preserve expressions and blended skinning, and plant their soles in every clip',async()=>{
 installDOM();const originalFetch=globalThis.fetch,originalBitmap=globalThis.createImageBitmap,originalSelf=globalThis.self;
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
 try{
  const manifest=JSON.parse(await readFile(new URL('../assets/characters/vroid/manifest.json',import.meta.url),'utf8'));
  assert.equal(manifest.bases.length,5);assert.ok(manifest.modelBytes+manifest.textureBytes<13_000_000);
  for(const [name,texture] of Object.entries(manifest.textures)){
   const bytes=await readFile(new URL('../assets/characters/vroid/textures/'+name,import.meta.url));
   assert.equal(createHash('sha256').update(bytes).digest('hex'),texture.sha256);assert.ok(Math.max(...texture.dimensions)<=1024);
  }
  for(const entry of manifest.bases){
   const bytes=await readFile(new URL('../assets/characters/vroid/'+entry.base+'.glb',import.meta.url));
   assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256);
   const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'https://nj22az.github.io/johansson-town/assets/characters/vroid/');
   const meshes=[];gltf.scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
   assert.ok(meshes.length>=4&&meshes.length<=5,entry.base);assert.ok(entry.triangles<40_000);
   let blended=0;for(const mesh of meshes){assert.ok(mesh.isSkinnedMesh);const weights=mesh.geometry.attributes.skinWeight;
    for(let i=0;i<weights.count;i++){const sum=weights.getX(i)+weights.getY(i)+weights.getZ(i)+weights.getW(i);assert.ok(Math.abs(sum-1)<.002);if(weights.getY(i)>.02)blended++;}
    if(mesh.material.map)assert.ok(mesh.material.map.image);assert.equal(mesh.material.transparent,false,'Hair uses alpha testing');
   }
   assert.ok(blended>100,entry.base+' needs blended joints');
   const face=meshes.find(m=>m.morphTargetDictionary?.Blink!==undefined);assert.ok(face,'Blinkable anime face');
   for(const name of ['Blink','Smile','MouthOpen']){const i=face.morphTargetDictionary[name];assert.ok(Number.isInteger(i));assert.ok(face.geometry.morphAttributes.position[i].array.some(v=>Math.abs(v)>.001));}
   assert.equal(meshes.filter(m=>m.material.isMeshBasicMaterial).length,meshes.length,'Preserve illustrated unlit materials');
   const mixer=new THREE.AnimationMixer(gltf.scene);let standing=0;
   for(const name of ['Idle_Neutral','Walk','Run','Wave','Sit','Eat','Drink']){
    const clip=gltf.animations.find(c=>c.name===name);assert.ok(clip,entry.base+' '+name);mixer.stopAllAction();mixer.clipAction(clip).play();
    for(let sample=0;sample<=12;sample++){
     mixer.setTime(clip.duration*sample/12);gltf.scene.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(gltf.scene,true);
     assert.ok([...b.min.toArray(),...b.max.toArray()].every(Number.isFinite));
     assert.ok(b.min.y>-.025&&b.min.y<.035,entry.base+' sole '+name+' '+b.min.y);
     assert.ok(b.max.y<2.2&&b.max.x-b.min.x<1.7,entry.base+' bounded '+name);
     if(name==='Idle_Neutral')standing=b.max.y;
     if(name==='Sit')assert.ok(b.max.y<standing-.2,entry.base+' must sit on the stool');
    }
   }
  }
 }finally{globalThis.fetch=originalFetch;globalThis.createImageBitmap=originalBitmap;globalThis.self=originalSelf;}
});

test('the selected OS3A plant loads its real geometry and batches nearby placements',async()=>{
 installDOM();const previous={fetch:globalThis.fetch,bitmap:globalThis.createImageBitmap,self:globalThis.self};
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:512,height:512,close(){}});
 globalThis.fetch=async url=>String(url).startsWith('blob:')?previous.fetch(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
 try{
  assert.equal(await preloadStreetPlants(),true);const parent=new THREE.Group();
  const result=buildStreetPlants(parent,[{x:1,z:2,height:1.1},{x:3,z:3,height:1.2},{x:40,z:2,height:1.0}],{shadows:true});
  assert.equal(result.count,3);assert.equal(result.draws,4);
  for(const mesh of parent.children){assert.ok(mesh.isInstancedMesh);assert.ok(mesh.boundingSphere.radius>0);assert.equal(mesh.material.transparent,false);}
  const bounds=new THREE.Box3().setFromObject(parent);assert.ok(Math.abs(bounds.min.y)<.001);assert.ok(bounds.max.y>=1.19&&bounds.max.y<=1.21);
 }finally{globalThis.fetch=previous.fetch;globalThis.createImageBitmap=previous.bitmap;globalThis.self=previous.self;}
});

test('world texture scale survives colour batching without changing authored UVs',()=>{
 installDOM();const material=createMaterials().worldMaterial('concrete',0xaabbcc,2),geometry=new THREE.BoxGeometry();
 const uv=geometry.attributes.uv.array.slice();const [mesh]=createHarbourInstances([{geo:geometry,mat:material,matrices:[new THREE.Matrix4().makeScale(8,6,10)]}]);
 const shader={uniforms:{},vertexShader:THREE.ShaderLib.standard.vertexShader};mesh.material.onBeforeCompile(shader);
 assert.equal(shader.uniforms.townTileMetres.value,2);assert.match(shader.vertexShader,/instanceMatrix\*townPosition/);
 assert.match(shader.vertexShader,/vBumpMapUv=/);assert.deepEqual(geometry.attributes.uv.array,uv);
});
