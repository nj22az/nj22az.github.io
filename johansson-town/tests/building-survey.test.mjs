import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildOnsenInterior,ONSEN_ROOM} from '../src/world/interiors/onsen.js';
import {buildKobanInterior} from '../src/world/interiors/koban.js';
import {surveyInterior,khaakaPlan} from '../scripts/building-survey.mjs';
import {SATO_ROOM} from '../src/world/sato-ramen-layout.js';
const build=fn=>{installDOM();const room=new T.Group(),cols=[];const layout=fn({room,reg(){},action(){},exit(){},collider:(x,z,w,d)=>cols.push({x,z,w,d})});return {room,layout:{...layout,colliders:[...cols,...(layout.colliders||[])]}};};
test('reproduces first-floor entrance-strip failure, then covers the complete onsen',()=>{
 const {room,layout}=build(buildOnsenInterior);room.updateMatrixWorld(true);
 const meshes=[];room.traverse(o=>{if(o.isMesh&&o.name==='Umi-no-yu floor')meshes.push(o);});
 const hit=new T.Raycaster(new T.Vector3(0,.1,4.2),new T.Vector3(0,-1,0)).intersectObjects(meshes,false)[0];
 assert.equal(hit.object.name,'Umi-no-yu floor');const size=new T.Box3().setFromObject(hit.object).getSize(new T.Vector3());
 assert.ok(Math.abs(size.x-10)<1e-6&&Math.abs(size.z-1.4)<1e-6);
 const s=surveyInterior(room,layout);assert.equal(s.w,9.7);assert.equal(s.h,13.65);assert.equal(s.domainArea,132.405);
 assert.equal(s.floorMeshes.filter(n=>n==='Umi-no-yu floor').length,5);assert.ok(s.floorMeshes.includes('Rock bath paving'));
 assert.ok(s.floorArea>105&&s.floorArea<120,'holes remain excluded');
 for(const name of ['Locker','Indoor bath water','Rock bath water'])assert.ok(s.features.includes(name));
 assert.ok(s.features.some(n=>/Karan spout|Wash stool/i.test(n)),'washing area retained');
 assert.ok(!s.floorMeshes.includes('Indoor bath floor'),'lowered bath is not datum floor');
 const p=khaakaPlan('Umi-no-yu',s);assert.ok(p.objects.every(o=>o.type!=='polygon'||o.closed&&o.points.length>=3));
 assert.deepEqual(s.bounds,ONSEN_ROOM.bounds);
});
test('koban includes office and tatami floors, not just the entry slab',()=>{
 const {room,layout}=build(buildKobanInterior),s=surveyInterior(room,layout);
 assert.equal(s.w,6.6);assert.equal(s.h,6);assert.ok(s.floorMeshes.includes('Police box office floor'));assert.ok(s.floorMeshes.includes('Tatami room floor')); assert.ok(s.features.includes('Toilet'));assert.equal(s.floorArea,39.6);
});
test('shared dining polygon excludes the missing corner and treats both doors alike',()=>{
 const s=surveyInterior(new T.Group(),SATO_ROOM);assert.equal(s.domainArea,202.26);assert.equal(s.w,17.4);assert.equal(s.h,12.4);assert.equal(s.floorArea,null);
 assert.ok(s.domainArea<s.w*s.h,'polygon is not its bounding rectangle');
 const rows=JSON.parse(readFileSync(new URL('../docs/building-plans/analysis.json',import.meta.url)));
 for(const id of ['ramen','izakaya']){const row=rows.find(r=>r.id===id);assert.equal(row.m2,s.domainArea);assert.deepEqual(row.measurement.floorPolygon,SATO_ROOM.floorPolygon);}
});
test('survey ignores a distant sea backdrop and honours nested floor transforms',()=>{
 const room=new T.Group(),g=new T.Group();g.position.x=1;room.add(g);
 const floor=new T.Mesh(new T.PlaneGeometry(2,4),new T.MeshBasicMaterial());floor.name='Floor';floor.rotation.x=-Math.PI/2;g.add(floor);
 const sea=new T.Mesh(new T.PlaneGeometry(90,30),new T.MeshBasicMaterial());sea.name='Sea view';sea.position.z=-45;room.add(sea);
 const s=surveyInterior(room,{bounds:{minX:0,maxX:2,minZ:-2,maxZ:2}});assert.equal(s.domainArea,8);assert.equal(s.floorArea,8);assert.equal(s.floorMeshes.length,1);
 assert.throws(()=>surveyInterior(room,{}),/explicit runtime/);
});
