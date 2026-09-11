import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {installDOM} from './fixtures.mjs';
import {createHash} from 'node:crypto';
import {circleHitsRect,townBoundsBlocked,sweepFraction} from '../physics.js?snappy=1';

test('supplied buildings load with portable maps and bounded geometry',async()=>{
 installDOM();const originalFetch=globalThis.fetch,originalBitmap=globalThis.createImageBitmap,originalSelf=globalThis.self;
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
 try{
  for(const path of ['tea-house/tea-house-exterior.glb']){
   const bytes=await readFile(new URL('../assets/models/'+path,import.meta.url));assert.ok(bytes.length<6_000_000);
   const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
   let triangles=0,meshes=0;scene.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;assert.ok(o.material.map);assert.ok(o.material.normalMap);assert.equal(o.material.side,THREE.FrontSide);}});
   assert.equal(meshes,1);assert.ok(triangles<=60010);assert.ok(triangles>50000);
   const bounds=new THREE.Box3().setFromObject(scene),size=bounds.getSize(new THREE.Vector3());assert.ok(Math.abs(bounds.min.y+.08)<.02);assert.ok(size.y>4&&size.y<5.5);assert.ok(size.x<8&&size.z<8.5);
  }
  const manifest=JSON.parse(await readFile(new URL('../assets/models/izakaya/benmaher-manifest.json',import.meta.url),'utf8'));
  const bytes=await readFile(new URL('../assets/models/izakaya/minato-benmaher-exterior.glb',import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);
  assert.ok(bytes.length<3_500_000,'Web texture budget');
  const model=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;
  let triangles=0,draws=0,cutouts=0;
  model.traverse(o=>{if(!o.isMesh)return;draws++;triangles+=o.geometry.index.count/3;
   assert.ok(o.material.map&&o.material.normalMap&&o.material.roughnessMap&&o.material.metalnessMap&&o.material.aoMap&&o.material.emissiveMap,'All PBR channels retained');
   assert.equal(o.material.transparent,false,'No sorted whole-building transparency');
   if(o.material.alphaTest){cutouts++;assert.equal(o.material.map.channel,1,'Cropped cutout uses its own UVs');assert.equal(o.material.side,THREE.DoubleSide);}else assert.equal(o.material.side,THREE.FrontSide);
  });
  assert.equal(triangles,2446,'All building triangles retained; presentation floor removed');assert.equal(draws,3);assert.equal(cutouts,2);
  const bounds=new THREE.Box3().setFromObject(model);assert.ok(Math.abs(bounds.min.y)<.001);assert.ok(bounds.max.y>9&&bounds.max.y<9.1);
  const door=manifest.parts.find(p=>p.name==='Door Window__0');assert.ok(Math.abs((door.min[0]+door.max[0])/2)<.001,'Door centred on the existing entrance');assert.ok(Math.abs((door.min[2]+door.max[2])/2-4.05)<.001);
  const {preloadIzakaya,buildIzakaya}=await import('../src/world/izakaya.js?snappy=1');assert.deepEqual(await preloadIzakaya(),{ready:2,total:2});
  const minato={group:new THREE.Group(),colliders:[]},minatoSites=[],entrances=[];
  buildIzakaya(minato,{sites:minatoSites,register:(o,label,fn)=>entrances.push({o,label,fn}),enter:site=>assert.equal(site.id,'izakaya')});
  assert.equal(entrances.length,1);entrances[0].fn();
  assert.deepEqual(minatoSites[0].door,[18,0,20]);
  const blocked=(x,z)=>townBoundsBlocked(x,z,.28)||minato.colliders.some(c=>circleHitsRect(x,z,.28,c));
  assert.equal(sweepFraction({x:24,z:18},{x:24,z:20},blocked),1,'Lane reaches the new door');
  assert.equal(blocked(24,19.4),false,'Returning to the street is clear');
  assert.equal(blocked(24,21),true,'The closed door and step cannot be walked through');
  minato.group.updateMatrixWorld(true);
  const transformedDoor=new THREE.Vector3(0,1.66,4.05).applyMatrix4(minato.group.children[0].matrixWorld);
  assert.ok(transformedDoor.distanceTo(entrances[0].o.position)<1.1,'Prompt aligned with the supplied door');
  const {preloadTeaHouse,buildTeaHouse}=await import('../src/world/tea-house.js?snappy=1');assert.equal(await preloadTeaHouse(),true);
  const world={group:new THREE.Group(),colliders:[]},sites=[],actions=[];
  buildTeaHouse(world,{sites,register:(o,label,fn)=>actions.push({o,label,fn}),enter:site=>assert.equal(site.id,'tea-house')});
  assert.equal(sites[0].id,'tea-house');actions[0].fn();assert.deepEqual(actions[0].o.position.toArray(),[28,1,48]);
  assert.ok(!world.colliders.some(c=>Math.abs(c.x-28)<c.w/2+.3&&Math.abs(c.z-48)<c.d/2+.3),'Entrance is clear');
  const homeManifest=JSON.parse(await readFile(new URL('../assets/models/yuri-home/exterior-manifest.json',import.meta.url),'utf8'));
  const homeBytes=await readFile(new URL('../assets/models/yuri-home/yuri-home-exterior.glb',import.meta.url));
  assert.equal(createHash('sha256').update(homeBytes).digest('hex'),homeManifest.sha256);
  assert.ok(homeBytes.length<2_000_000,'Yuri house web texture budget');
  assert.equal(homeManifest.triangles,1996);assert.equal(homeManifest.draws,1);
  const {preloadYuriHome,buildYuriHome,YURI_HOME_DOOR_LOCAL}=await import('../src/world/yuri-home.js');
  assert.equal(await preloadYuriHome(),true);
  const canal={group:new THREE.Group(),colliders:[]},homeSites=[],homeDoors=[];
  const home=buildYuriHome(canal,{sites:homeSites,register:(o,label,fn)=>homeDoors.push({o,label,fn}),enter:site=>assert.equal(site.id,'yuri-home')});
  assert.equal(homeSites[0].id,'yuri-home');homeDoors[0].fn();
  assert.ok(canal.group.getObjectByName('Yuri canal house'));
  assert.ok(Math.abs(home.door[0]-(-5.11))<.15,'Packed door sits on the canal entrance');
  assert.ok(Math.abs(home.door[2]-11.53)<.15);
  assert.ok(YURI_HOME_DOOR_LOCAL[2]>3,'Door is on the +Z facade before town yaw');
 }finally{globalThis.fetch=originalFetch;globalThis.createImageBitmap=originalBitmap;globalThis.self=originalSelf;}
});
