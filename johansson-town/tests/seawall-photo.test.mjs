import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import * as THREE from '../vendor/three.module.js';
process.env.JOHANSSON_SEAWALL_PHOTO='1';
const {installDOM}=await import('./fixtures.mjs');installDOM();globalThis.self=globalThis;
const {createTown}=await import('../src/world/town.js');
const {createBusinesses}=await import('../src/world/businesses.js');
const {townBoundsBlocked,standingHitsRect}=await import('../physics.js');
const {createNavigation}=await import('../src/people/navmesh.js');
const {groundHeight}=await import('../src/world/layout.js');
const {SEAWALL_PHOTO,seawallPhotoAt,seawallRetainedRuns}=await import('../src/world/seawall-photo-plan.js');
const {quarterPlans,quarterTopAt}=await import('../src/world/ground-plan-quarters.js');
const {breakwaterPlacements}=await import('../src/world/breakwaters.js');
const design=JSON.parse(readFileSync(new URL('../docs/seawall-photo/design.json',import.meta.url)));
const prompts=[];const world=createTown({scene:new THREE.Scene(),sites:createBusinesses(),mobile:true,shadows:false,register:(o,label,fn)=>prompts.push({o,label,fn}),enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});world.group.updateMatrixWorld(true);
const blocked=(x,z,r=.3)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>standingHitsRect(x,z,r,groundHeight(x,z),c));
test('ordinary game retains full wall and water boundary',()=>{
 const result=execFileSync(process.execPath,['--input-type=module','-e',"import {SEAWALL_PHOTO_ENABLED,seawallRetainedRuns,seawallPhotoAt} from './src/world/seawall-photo-plan.js';console.log(JSON.stringify([SEAWALL_PHOTO_ENABLED,seawallRetainedRuns(-49.5,29.7),seawallPhotoAt(-50,-1)]))"],{cwd:new URL('..',import.meta.url),env:{...process.env,JOHANSSON_SEAWALL_PHOTO:'0'},encoding:'utf8'});assert.deepEqual(JSON.parse(result),[false,[[-49.5,29.7]],false]);
});
test('runtime and camera follow corrected editable CAD, one standard deck',()=>{
 for(const k of ['minX','maxX','minZ','maxZ','top'])assert.equal(SEAWALL_PHOTO.pier[k],design.pier[k],k);
 assert.deepEqual(SEAWALL_PHOTO.photo.photoPreset.camera,design.photo.camera);assert.deepEqual(SEAWALL_PHOTO.photo.photoPreset.subject,design.photo.subject);
 assert.equal(quarterPlans().find(p=>p.id==='nishi-machi').layers.filter(l=>l.name==='Nishi lookout pier deck').length,1);
});
test('actual world pedestrian routes and photo positions are clear, with guard rails at edges',()=>{
 for(let x=-38.5;x>=-54.9;x-=.1){assert.equal(blocked(x,-12.0),false,`pier route ${x}`);assert.ok(Math.abs((x<=-39.2?groundHeight(x,-12.0):quarterTopAt(x,-12.0))-.04)<.001,`floor ${x}`);}
 for(let z=-14;z<=0;z+=.1)assert.equal(blocked(-37.1,z),false,`promenade ${z}`);
 for(const p of [design.photo.subject,design.photo.camera])assert.equal(blocked(p[0],p[2]),false,'photo position');
 for(const [x,z] of [[-55.49,-12.0],[-47,-10.8],[-39.55,-6.6]])assert.equal(blocked(x,z),true,'guard rail');
 assert.ok(createNavigation(blocked,{step:.5}).path({x:-37.1,z:-6.65},{x:-54.5,z:-12}).length>4,'click-to-walk route reaches pier');
 assert.equal(seawallPhotoAt(-56,-12.0),false);assert.ok(world.seawallPhoto.triangles<8000);
});
test('old wall is cut; garden retained; whole armour envelopes removed',()=>{
 assert.deepEqual(seawallRetainedRuns(-49.5,29.7),[[-49.5,-13.2],[-10.8,-10.3],[-4.3,29.7]]);assert.equal(world.colliders.filter(c=>c.id==='seawall').length,3);
 assert.ok(world.colliders.some(c=>c.id==='lot-wall-west'&&c.x> -35),'garden wall retained');
 for(const [x,,z] of breakwaterPlacements())assert.ok(!(x< -39&&x> -44&&z> -14.7&&z< -2.8),'armour clear');assert.ok(prompts.some(p=>p.label==='Take a seawall portrait'));
});
test('evaluated Blender meshes have finite unit normals, and ground comes from standard deck only',()=>{
 let tris=0;world.seawallPhoto.group.traverse(o=>{if(!o.isMesh)return;tris+=o.geometry.attributes.position.count/3;const p=o.geometry.attributes.position,n=o.geometry.attributes.normal;
 for(let i=0;i<p.count;i++){assert.ok(Number.isFinite(p.getX(i)+p.getY(i)+p.getZ(i)));assert.ok(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<.02,`normal ${i}`);}assert.equal(o.userData.walkSurface,false);});assert.equal(tris,world.seawallPhoto.triangles);
 assert.equal(design.pier.bentX.length,8);assert.equal(design.pier.pileZ.length,2);assert.ok(Math.abs(design.pier.bentX.at(-1)-design.pier.minX-.2)<1e-6);
});

test('new pier, rail bay and retained shore have no exposed coplanar overlaps',async()=>{
 const {coplanarOverlaps}=await import('../tools/z-fighting.mjs');
 const findings=coplanarOverlaps(world.group,{regions:[{minX:-56,maxX:-34,minZ:-15,maxZ:-2}],tolerance:.002,minArea:.01});
 assert.deepEqual(findings.filter(f=>f.area>=.02).map(f=>({a:f.a,b:f.b,area:f.area,at:f.at})),[]);
});
