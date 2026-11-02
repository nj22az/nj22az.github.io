import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {installDOM} from './fixtures.mjs';
import {buildFerryModel} from '../src/world/ferry-model.js';
import {FERRY_INTERIOR} from '../src/world/ferry-interior.js';
import {FERRY_ELECTRICS} from '../src/world/ferry-ship.js';
import {BRIDGE_LANTERN_PLAN as PLAN} from '../src/world/ferry-bridge-lantern-plan.js';
installDOM();
const file=new URL('../assets/models/ferry-bridge/bridge-lantern-v1.glb',import.meta.url);
const load=async()=>{const bytes=await readFile(file);return new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');};

test('healthy native Blender asset has three bounded meshes and a complete separate return',async()=>{
 const {scene}=await load(),meshes=[];scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
 assert.equal(meshes.length,3);let triangles=0;for(const m of meshes){assert.equal(m.userData.healthy,true);triangles+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3;}
 assert.ok(triangles<20000);assert.ok((await readFile(file)).byteLength<800000);
 const bounds=new THREE.Box3().setFromObject(scene);assert.ok(bounds.min.x>1&&bounds.max.x<4.3);assert.ok(bounds.min.y>.49&&bounds.max.y<1.5);assert.ok(bounds.min.z>-1.3&&bounds.max.z<0);
 const meta=JSON.parse(await readFile(new URL('../art/ferry-bridge-lantern/scene.json',import.meta.url),'utf8'));
 assert.ok(meta.sourceComponents.some(n=>n==='F1_intact_fuse_element'));assert.ok(!meta.sourceComponents.some(n=>/poor_contact|selected_contact/.test(n)));
 for(const label of Object.values(meta.labels)){assert.ok(label.up[1]>.999,'native text is upright');assert.ok(label.normal[2]<-.999,'native text faces the operator');}
 assert.deepEqual(PLAN.wires.sourceToFuse[0],[2.8352,1.17,-.3092]);assert.deepEqual(PLAN.wires.returnToSource.at(-1),[2.7176,1.17,-.3092]);
 const next=new Map(PLAN.connections);let at='B1.P';for(let i=0;i<7;i++)at=next.get(at);assert.equal(at,'B1.N');assert.equal(PLAN.connections.length,7);
 assert.equal(PLAN.independentSourceV,12);assert.equal(PLAN.shipDCV,FERRY_ELECTRICS.batteries.volts);assert.equal(PLAN.shipDCV,24);
 // Both wires stay forward of the open wing door; nothing crosses its opening.
 for(const wire of Object.values(PLAN.wires))for(const p of wire)assert.ok(p[2]>-1.3);
});

test('actual ferry retains all navigation lights and existing floor/collision layout',()=>{
 const f=buildFerryModel(),state=f.userData.bridgeEquipment.practiceCircuit;
 assert.equal(state.pending,null,'no added startup request');assert.equal(state.loaded,false);assert.ok(state.group.parent===f.userData.bridgeEquipment.group);
 for(const [name,color] of [['Masthead light',0xfff6d8],['Port sidelight',0xff3a2a],['Starboard sidelight',0x2aff70],['Stern light',0xfff6d8]])assert.equal(f.getObjectByName(name).userData.on,color);
 assert.equal(FERRY_INTERIOR.boxes.some(o=>o.name==='independent 12 V practice cabinet'),false);assert.match(PLAN.placement,/Existing wheelhouse console/);
});

test('real GLB replaces fallback once, while failed loading preserves visible equipment',async()=>{
 const oldFetch=globalThis.fetch;let requests=0;
 try{
  const bytes=await readFile(file);globalThis.fetch=async()=>{requests++;return new Response(bytes,{headers:{'content-type':'model/gltf-binary'}});};
  const state=buildFerryModel().userData.bridgeEquipment.practiceCircuit;
  const one=state.ensure(),two=state.ensure();assert.equal(one,two);assert.equal(await one,true);assert.equal(requests,1);assert.equal(state.loaded,true);assert.equal(state.group.children.length,1);assert.equal(state.meshes,3);
  globalThis.fetch=async()=>{throw Error('offline test');};const failed=buildFerryModel().userData.bridgeEquipment.practiceCircuit;assert.equal(await failed.ensure(),false);assert.equal(failed.loaded,false);assert.ok(failed.group.getObjectByName('Healthy practice equipment fallback'));assert.match(failed.error,/offline/);
 }finally{globalThis.fetch=oldFetch;}
});
