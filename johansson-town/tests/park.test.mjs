import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {preloadPark,buildPark} from '../src/world/park.js?snappy=1';
import {PARK,PARK_BENCH,parkHeight} from '../src/world/park-layout.js';
import {installDOM} from './fixtures.mjs';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {prepareParkScenery} from '../src/world/park-scenery.js';
import {circleHitsRect} from '../physics.js';
test('supplied park is static, compact and matches its bench and walkable ground',async()=>{
 installDOM();const originalFetch=fetch;globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:256,height:256,close(){}});
 globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
 try{assert.equal(await preloadPark(),true);const world={group:new THREE.Group(),colliders:[]};buildPark(world,{register(){},onAction(){},shadows:false});world.group.updateMatrixWorld(true);
  const park=world.park.group;let meshes=0;park.traverse(o=>{if(o.isMesh){meshes++;assert.ok(!o.isSkinnedMesh);assert.ok(!/Sky|LampLight/.test(o.material.name));}});assert.equal(meshes,14);
  const ground=[];park.traverse(o=>{if(o.isMesh&&/mtParkGround0/.test(o.material.name))ground.push(o);});
  for(const [x,z] of [[2.06,0],[.7,0],[-8,-14],[-6,-7]].map(([x,z])=>[PARK.x+x*PARK.scale,PARK.z+z*PARK.scale])){const hits=new THREE.Raycaster(new THREE.Vector3(x,20,z),new THREE.Vector3(0,-1,0)).intersectObjects(ground,false);assert.ok(hits.length);assert.ok(Math.abs(hits[0].point.y-parkHeight(x,z))<.07,'Geometry and foot height agree');}
  const wood=[];park.traverse(o=>{if(o.isMesh&&/BenchWood/.test(o.material.name))wood.push(o);});const hits=new THREE.Raycaster(new THREE.Vector3(PARK_BENCH.position[0],10,PARK_BENCH.position[2]),new THREE.Vector3(0,-1,0)).intersectObjects(wood,false);assert.ok(hits.length);assert.ok(Math.abs(hits[0].point.y+.75-PARK_BENCH.eyeY)<.07,'Camera sits above the real seat');
  const eye=new THREE.Vector3(PARK_BENCH.position[0],PARK_BENCH.eyeY,PARK_BENCH.position[2]),direction=new THREE.Vector3(0,2,-44).sub(eye).normalize();assert.equal(new THREE.Raycaster(eye,direction,.1,25).intersectObject(park,true).length,0,'Bench view towards the port is unobstructed');
 }finally{globalThis.fetch=originalFetch;}
});

test('the reworked park has no pale bush ring round the hill, and keeps its tree, bench and ground',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:256,height:256,close(){}});
 const bytes=await readFile(new URL('../assets/models/park/park-spring.glb',import.meta.url));
 const source=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;
 // The nine bushes were one merged clump whose leaf rendered as grey boulders ringing
 // the mound; tools/blender/rework-park.py takes it out of the model itself.
 assert.equal(source.getObjectByName('mtParkBush00t_mat'),undefined,'The bush clump is still in the park model');
 const adapted=prepareParkScenery(source);
 assert.equal(adapted.getObjectByName('mtParkTreePlane00t_mat'),undefined,'The detached blossom card is still there');
 for(const name of ['mtParkGround00t_mat','mtParkBenchWood00t_mat','mtParkBenchIron00t_mat'])assert.ok(adapted.getObjectByName(name),name+' is missing');
 let tree=false;adapted.traverse(o=>{if(o.isMesh&&/Leaf|Tree/.test(o.material?.name||''))tree=true;});assert.ok(tree,'The cherry tree is missing');
 const world={group:new THREE.Group(),colliders:[]};buildPark(world,{register(){},onAction(){},shadows:false});
 const x=PARK.x-10.374*PARK.scale,z=PARK.z+.4*PARK.scale;assert.equal(world.colliders.some(c=>circleHitsRect(x,z,.32,c)),false,'The western approach has a ghost collider');
});
