import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {buildSeaCave,placeSeaCave} from '../src/world/sea-cave.js';
import {circleHitsRect,townBoundsBlocked,sweepFraction} from '../physics.js?snappy=1';
import {ROUTES,LANDINGS} from '../src/world/layout.js?snappy=1';
import {installDOM} from './fixtures.mjs';
const make=()=>{installDOM();const world={group:new THREE.Group(),colliders:[]};buildSeaCave(world,{register(){}});return world;};
async function source(){globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:2048,height:2048,close(){}});const b=await readFile(new URL('../assets/models/sea-cave/umanose.glb',import.meta.url));return (await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;}
test('actual supplied scan is local, finite, textured and behind all northern approaches',async()=>{
 const model=await source(),placed=placeSeaCave(model),box=new THREE.Box3().setFromObject(placed);let draws=0,tris=0;
 placed.traverse(o=>{if(!o.isMesh)return;draws++;tris+=o.geometry.index.count/3;assert.ok(o.material.map);assert.equal(o.material.isMeshStandardMaterial,true);assert.ok(o.matrixWorld.elements.every(Number.isFinite));for(const a of Object.values(o.geometry.attributes))assert.ok(a.array.every(Number.isFinite));});
 assert.equal(draws,2);assert.ok(tris<200000);assert.ok(Math.abs(box.min.z-59)<1e-4);assert.ok(box.max.x<25);assert.ok(Math.abs(box.min.y+.65)<1e-4);
 for(const route of ROUTES)for(const [x,z] of route.points)assert.equal(box.containsPoint(new THREE.Vector3(x,0,z)),false,route.id);
 for(const landing of LANDINGS)assert.ok(box.max.x<landing.x-landing.w/2);
});
test('barrier stops walking and swept running before, after and without a model load',async()=>{
 const world=make(),blocked=(x,z)=>townBoundsBlocked(x,z,.32)||world.colliders.some(c=>circleHitsRect(x,z,.32,c));
 for(let x=-6.5;x<=6.5;x+=.5){assert.equal(blocked(x,56),false);assert.equal(blocked(x,58.4),true);assert.ok(sweepFraction({x,z:56},{x,z:64},blocked)<.3);}
 const before=JSON.stringify(world.colliders);let count=0;const state=world.seaCave;
 await Promise.all([state.load(async()=>{count++;return source();}),state.load(()=>{throw Error('duplicate load');})]);
 assert.equal(count,1);assert.equal(state.loaded,true);assert.equal(JSON.stringify(world.colliders),before);assert.equal(world.group.getObjectByName('Sea cave loading fallback'),undefined);
 const failed=make(),old=console.warn;try{console.warn=()=>{};assert.equal(await failed.seaCave.load(()=>Promise.reject(Error('network unavailable'))),false);}finally{console.warn=old;}
 assert.equal(failed.seaCave.status,'fallback');assert.ok(failed.group.getObjectByName('Sea cave loading fallback'));assert.ok(failed.colliders.some(c=>circleHitsRect(0,58.4,.32,c)));
});
