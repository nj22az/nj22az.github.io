import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {buildWarehouse,placeWarehouse,WAREHOUSE,WAREHOUSE_PLACE} from '../src/world/warehouse.js';
import {createTown} from '../src/world/harbour.js?snappy=1';
import {drawTownMap} from '../src/world/map.js?snappy=1';
import {routeAt} from '../src/world/layout.js?snappy=1';
import {circleHitsRect,sweepFraction} from '../physics.js?snappy=1';
import {installDOM} from './fixtures.mjs';
import {createBusinesses} from '../src/world/businesses.js';
import {HARBOUR_OFFICE} from '../src/world/business-layout.js';
const folder=new URL('../assets/models/warehouse/',import.meta.url);
async function load(){
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 const b=await readFile(new URL('old-warehouse.glb',folder));
 return (await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;
}
test('supplied warehouse is compact, textured, grounded and faces the street',async()=>{
 const bytes=await readFile(new URL('old-warehouse.glb',folder)),manifest=JSON.parse(await readFile(new URL('manifest.json',folder)));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);
 assert.ok(bytes.length<manifest.sourceBytes*.3);
 const placed=placeWarehouse(await load()),bounds=new THREE.Box3().setFromObject(placed);let draws=0,triangles=0;
 placed.traverse(o=>{if(!o.isMesh)return;draws++;triangles+=o.geometry.index.count/3;assert.ok(o.material.map,o.name);assert.ok(o.matrixWorld.elements.every(Number.isFinite));});
 assert.equal(draws,12);assert.equal(triangles,4822);
 assert.ok(Math.abs(bounds.min.y-WAREHOUSE.groundY)<1e-6);
 assert.ok(bounds.min.x>-17&&bounds.max.x<-7.5,'Fits between western lane and main street');
 assert.ok(bounds.min.z>-48.2&&bounds.max.z<-36.4,'Roof fits the quay plot');
 const forward=new THREE.Vector3(0,0,-1).transformDirection(placed.matrixWorld);assert.ok(forward.x>.999,'Loading awning faces the street');
});
test('warehouse and consolidated office share a reachable quay',async()=>{
 installDOM();const registered=[];
 const world=createTown({scene:new THREE.Scene(),sites:createBusinesses(),mobile:true,register:(o,label,fn)=>registered.push({o,label,fn}),onAction(){}});
 const blocked=(x,z)=>!routeAt(x,z,.32)||world.colliders.some(c=>circleHitsRect(x,z,.32,c));
 assert.equal(world.colliders.some(c=>c.x===13.7&&c.w===6.4),false,'The harbour office replaces the eastern cold store');
 assert.ok(world.group.getObjectByName('Consolidated harbour office'));assert.ok(world.colliders.some(c=>c.x===HARBOUR_OFFICE.x&&c.w===HARBOUR_OFFICE.width));
 assert.equal(world.colliders.some(c=>c.x===-13.7&&c.w===6.4),false,'Old western shed collider removed');
 const [x,,z]=WAREHOUSE_PLACE.exitPosition;
 const path=[[0,-46],[0,z],[x,z]];
 for(let i=1;i<path.length;i++)assert.equal(sweepFraction({x:path[i-1][0],z:path[i-1][1]},{x:path[i][0],z:path[i][1]},blocked),1,'Walk from main street to warehouse');
 for(let z=-48;z<=-49;z+=.2)assert.equal(world.colliders.some(c=>circleHitsRect(-18,z,.32,c)),false,'No collision intrudes into the western approach');
 assert.ok(world.colliders.some(c=>circleHitsRect(WAREHOUSE.x,WAREHOUSE.z,.32,c)),'Warehouse walls block movement');
 assert.ok(registered.find(a=>a.label==='Enter Harbour Warehouse'));
 assert.ok(world.group.getObjectByName('warehouse-street-door'));
 assert.ok(world.group.getObjectByName('warehouse-entrance'));
 const before=JSON.stringify(world.colliders);let requests=0;
 await Promise.all([world.warehouse.load(()=>{requests++;return load();}),world.warehouse.load(()=>{throw Error('Duplicate load');})]);
 assert.equal(requests,1);assert.equal(world.warehouse.status,'ready');assert.equal(JSON.stringify(world.colliders),before);
 assert.equal(world.group.getObjectByName('Warehouse loading fallback'),undefined);
 assert.ok(world.group.getObjectByName('Old Warehouse supplied exterior'));
 assert.ok(world.group.getObjectByName('warehouse-street-door'),'Person door remains after the supplied exterior loads');
});
test('failed loading retains a named, solid warehouse; visitor map names the landmark',async()=>{
 installDOM();const world={group:new THREE.Group(),colliders:[]};const state=buildWarehouse(world);const original=console.warn;
 try{console.warn=()=>{};assert.equal(await state.load(()=>Promise.reject(Error('offline'))),false);}finally{console.warn=original;}
 assert.equal(state.status,'fallback');assert.ok(world.group.getObjectByName('Warehouse loading fallback'));
 assert.ok(world.colliders.some(c=>circleHitsRect(WAREHOUSE.x,WAREHOUSE.z,.32,c)));
 const labels=[],ctx=document.createElement('canvas').getContext('2d');ctx.fillText=t=>labels.push(t);
 drawTownMap(ctx,680,640,{landmarks:[WAREHOUSE_PLACE]});
 assert.ok(labels.some(t=>t.includes('Harbour Warehouse')));
});
