import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {applyStreetClearance} from '../src/world/street-clearance.js';
import {FULL_TOWN,CITY_SECTIONS,sourceHeight} from '../src/world/full-town-state.js';
import {drawTownMap} from '../src/world/map.js';
const folder=new URL('../assets/models/full-town/',import.meta.url);
const bytes=await readFile(new URL('overworld.glb',folder));
const navigation=JSON.parse(await readFile(new URL('navigation.json',folder)));
const manifest=JSON.parse(await readFile(new URL('street-clearance.json',folder)));
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
const load=()=>new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');

test('Clearance removes whole props from rendering and physics while retaining source assets',async()=>{
 const {scene}=await load(),before=scene.children.reduce((sum,m)=>sum+m.geometry.index.count/3,0);
 assert.equal(bytes.length,manifest.sourceBytes);assert.equal(before,96308);
 const cleaned=applyStreetClearance(scene,navigation,manifest);
 assert.equal(cleaned.removedColliders,40);assert.equal(cleaned.colliders.length,178);assert.equal(cleaned.removedTriangles,2332);
 assert.equal(scene.children.reduce((sum,m)=>sum+m.geometry.index.count/3,0),before-cleaned.removedTriangles);
 assert.equal(navigation.colliders.length,218,'Navigation source is immutable');
 for(const c of navigation.colliders)if(c.height>=2||Math.max(c.w,c.d)>=2)assert.ok(cleaned.colliders.includes(c),'Building walls and structure retained');
 for(const d of navigation.doors){const x=(d.min[0]+d.max[0])/2,z=(d.min[2]+d.max[2])/2;assert.ok(cleaned.colliders.some(c=>Math.abs(c.x-x)<.06&&Math.abs(c.z-z)<.06),'Original door retained: '+d.name);}
 for(const i of manifest.removedColliders)assert.ok(!cleaned.colliders.includes(navigation.colliders[i]),'No removed-prop collider survives');
});

test('Mismatched clearance manifests fail atomically without altering any geometry',async()=>{
 const {scene}=await load(),indices=scene.children.map(m=>m.geometry.index);
 const broken=structuredClone(manifest);broken.meshes.at(-1).name='wrong-source';
 assert.throws(()=>applyStreetClearance(scene,navigation,broken),/mismatch/);
 scene.children.forEach((m,i)=>assert.equal(m.geometry.index,indices[i]));
 const badRange=structuredClone(manifest);badRange.meshes[0].remove=[[999999,10]];
 assert.throws(()=>applyStreetClearance(scene,navigation,badRange),/Invalid/);
 scene.children.forEach((m,i)=>assert.equal(m.geometry.index,indices[i]));
});

test('Repeated ground uses translated source heights and preserves both canal voids',()=>{
 FULL_TOWN.grid=navigation.grid;
 for(const [x,z] of [[-18,0],[-5,-1],[0,0],[10,1],[17,0],[-5,-5]])assert.equal(sourceHeight(x,z),sourceHeight(x+CITY_SECTIONS[1].x,z));
 assert.equal(sourceHeight(0,-6),null);assert.equal(sourceHeight(44,-6),null);
 assert.notEqual(sourceHeight(44,0),null);assert.equal(sourceHeight(21,0),null,'Gap is filled by the explicit city-link, not stretched source geometry');
});

test('Visitor map draws the ground in both city sections',()=>{
 FULL_TOWN.active=true;FULL_TOWN.grid=navigation.grid;
 const ground=[],ctx=new Proxy({fillStyle:'',fillRect(x,y,w,h){if(this.fillStyle==='#a8997a')ground.push([x,y,w,h]);}},{get:(o,key)=>key in o?o[key]:(()=>{})});
 drawTownMap(ctx,680,640);
 const count=navigation.grid.heights.filter(h=>h!==null).length;
 assert.equal(ground.length,count*2);
 const scale=Math.min(660/(FULL_TOWN.bounds.maxX-FULL_TOWN.bounds.minX),620/(FULL_TOWN.bounds.maxZ-FULL_TOWN.bounds.minZ));
 assert.ok(Math.abs(ground[count][0]-ground[0][0]-44*scale)<1e-6,'Map repeat matches world translation');
 FULL_TOWN.active=false;
});
