import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {createPropFactory} from '../prop-factory.js';
import {BUILD_CATALOGUE,catalogueEntry} from '../src/build/catalogue.js';
import {createPlacements,footprint,footprintsOverlap,placementProblems,readPlacementsFile,PLACEMENTS_FILE} from '../src/build/placements.js';
import {townBoundsBlocked,circleHitsRect} from '../physics.js';
import {installDOM} from './fixtures.mjs';

installDOM();

const factory=createPropFactory({shadows:false});
function town({colliders=[],doors=[],walkable=()=>true}={}){
 const group=new THREE.Group(),list=[...colliders];
 return {group,colliders:list,builder:createPlacements({group,colliders:list,factory,walkable,doors})};
}

test('every catalogue piece has a name, a reason to exist and a real prop behind it',()=>{
 assert.ok(BUILD_CATALOGUE.length>=8);
 for(const e of BUILD_CATALOGUE){
  assert.ok(e.name&&e.purpose.length>30,e.id+' says who it is for and why');
  const made=factory[e.make](0,0,0);
  assert.ok(made.object instanceof THREE.Object3D&&made.collider.w>0&&made.collider.d>0,e.id+' builds a prop with a footprint');
 }
});

test('footprints turn with the prop, the same way the walking test does',()=>{
 const box={x:2,z:3,w:2,d:.5,yaw:Math.PI/2},corners=footprint(box);
 for(const [x,z] of corners)assert.ok(Math.abs(Math.abs(x-2)-.25)<1e-9&&Math.abs(Math.abs(z-3)-1)<1e-9);
 // A point the turned footprint covers is also inside it for circleHitsRect, which people and the camera use.
 assert.equal(circleHitsRect(2,3.9,0,box),true);assert.equal(circleHitsRect(2.9,3,0,box),false);
 assert.equal(footprintsOverlap(box,{x:2,z:3.9,w:.2,d:.2}),true);
 assert.equal(footprintsOverlap(box,{x:2,z:4.2,w:.2,d:.2}),false);
 assert.equal(footprintsOverlap(box,{x:2.6,z:3,w:.2,d:.2}),false);
});

test('a placement must be on walkable ground, clear, out of doorways, and say why it is there',()=>{
 const size={w:1.95,d:.78},world={colliders:[{x:10,z:0,w:2,d:2}],doors:[[0,10]],walkable:(x,z)=>Math.abs(x)<20&&Math.abs(z)<20};
 assert.deepEqual(placementProblems({kind:'bench',x:0,z:0,yaw:0,note:'For people waiting for the bus.'},size,world),[]);
 const sayWhy=placementProblems({kind:'bench',x:0,z:0,yaw:0,note:' '},size,world);
 assert.equal(sayWhy.length,1);assert.match(sayWhy[0],/why/);
 assert.match(placementProblems({kind:'bench',x:19.5,z:0,yaw:0,note:'x'},size,world)[0],/ground people walk on/);
 assert.match(placementProblems({kind:'bench',x:9.5,z:0,yaw:0,note:'x'},size,world)[0],/overlaps/);
 assert.match(placementProblems({kind:'bench',x:0,z:10.6,yaw:0,note:'x'},size,world)[0],/doorway/);
 assert.match(placementProblems({kind:'spaceship',x:0,z:0,note:'x'},size,world)[0],/catalogue/);
 // Overhead things (an awning starting at 2.3 m) do not stop a bench underneath.
 assert.deepEqual(placementProblems({kind:'bench',x:0,z:0,yaw:0,note:'x'},size,{...world,colliders:[{x:0,z:0,w:2,d:1,minY:2.3}]}),[]);
});

test('a piece stands on the ground there, and never across a kerb',()=>{
 const kerb=(x,z)=>x>5?.15:.02,t=town();t.builder=createPlacements({group:t.group,colliders:t.colliders,factory,walkable:()=>true,heightAt:kerb});
 assert.match(t.builder.check({kind:'bench',x:5,z:0,note:'x'})[0],/kerb/);
 const r=t.builder.place({kind:'bench',x:8,z:0,note:'On the raised pavement'});
 assert.equal(r.ok,true);
 const c=t.colliders.find(c=>c.placementId===r.id);
 assert.ok(Math.abs(c.minY-.15)<.02,'its feet are on the pavement, at '+c.minY);
 assert.equal(t.group.children[0].position.y,.15);
});

test('placing adds the prop and a turned collider people bump into; removing takes both away',()=>{
 const t=town(),r=t.builder.place({kind:'bench',x:1,z:2,yaw:Math.PI/2,note:'A seat by the quay for anglers.'});
 assert.equal(r.ok,true);
 const c=t.colliders.find(c=>c.placementId===r.id);
 assert.ok(c&&c.yaw===Math.PI/2&&c.height>.8&&c.minY<=.01,'collider carries the yaw and the real height');
 assert.equal(t.group.children.length,1);
 assert.equal(circleHitsRect(1,2.9,.3,c),true,'a person walking into the turned bench is stopped');
 assert.equal(t.builder.place({kind:'postbox',x:1,z:2.5,note:'Post'}).ok,false,'nothing can be placed inside it');
 assert.equal(t.builder.remove(r.id),true);
 assert.equal(t.colliders.length,0);assert.equal(t.group.children.length,0);
});

test('moving checks the new spot, ignoring the piece itself, and leaves it where it was when refused',()=>{
 const t=town({colliders:[{x:6,z:0,w:1,d:1}]}),{id}=t.builder.place({kind:'postbox',x:0,z:0,note:'Letters'});
 assert.equal(t.builder.move(id,{x:.3}).ok,true,'a small nudge overlaps only itself');
 const refused=t.builder.move(id,{x:6});
 assert.equal(refused.ok,false);assert.match(refused.problems[0],/overlaps/);
 assert.deepEqual(t.builder.list().map(p=>[p.id,p.x]),[[id,.3]]);
});

test('the placements file round-trips; a bad entry is not built into a wall, and saving keeps it for fixing',()=>{
 const t=town({colliders:[{x:5,z:5,w:2,d:2}]});
 t.builder.place({kind:'bench',x:0,z:0,yaw:.5,note:'Bus stop seat'});
 const again=town({colliders:[{x:5,z:5,w:2,d:2}]});
 const list=readPlacementsFile(t.builder.file());
 const skipped=again.builder.load([...list,{id:'p9',kind:'bench',x:5,z:5,yaw:0,note:'In the wall'}]);
 assert.deepEqual(again.builder.list().map(p=>p.kind),['bench']);
 assert.equal(skipped.length,1);assert.equal(skipped[0].id,'p9');
 assert.deepEqual(again.builder.held().map(p=>p.id),['p9']);
 assert.equal(again.builder.place({kind:'postbox',x:-4,z:0,note:'Letters'}).id,'p10','new ids continue after the loaded ones');
 assert.deepEqual(readPlacementsFile(again.builder.file()).map(p=>p.id),['p1','p9','p10'],'saving never drops the held one');
 assert.equal(again.builder.move('p9',{x:-8}).ok,true,'moving it to a clear spot builds it');
 assert.deepEqual(again.builder.held(),[]);
 assert.throws(()=>readPlacementsFile('{"version":2,"placements":[]}'));
 assert.throws(()=>readPlacementsFile({version:1,placements:[{id:'a'},{id:'a'}]}));
});

test('things that come and go (parked cars, the ferry) never decide a placement; their bays are kept clear instead',()=>{
 const world={colliders:[{x:0,z:0,w:2,d:4.5,moving:true}],doors:[[6,0,4.8]],walkable:()=>true};
 assert.deepEqual(placementProblems({kind:'postbox',x:0,z:0,note:'x'},{w:.74,d:.58},world),[]);
 assert.match(placementProblems({kind:'postbox',x:5,z:0,note:'x'},{w:.74,d:.58},world)[0],/doorway/);
});

test('a broken number in the file is kept as written, never saved as 0',()=>{
 const t=town(),list=readPlacementsFile({version:1,placements:[{id:'p1',kind:'bench',x:'abc',z:2,yaw:0,note:'?'}]});
 assert.equal(t.builder.load(list).length,1);
 assert.equal(readPlacementsFile(t.builder.file()).length,1);
 assert.equal(JSON.parse(t.builder.file()).placements[0].x,'abc');
});

test('the published placements file is valid, and every placement in it stands on the real town ground',()=>{
 const list=readPlacementsFile(readFileSync(new URL('../'+PLACEMENTS_FILE,import.meta.url),'utf8'));
 for(const p of list){
  const c=factory[catalogueEntry(p.kind).make](0,0,0).collider;
  for(const [x,z] of [[p.x,p.z],...footprint({x:p.x,z:p.z,w:c.w,d:c.d,yaw:p.yaw})])assert.equal(townBoundsBlocked(x,z,0),false,p.id+' is on walkable ground');
  assert.ok(p.note.trim(),p.id+' says why it is there');
 }
});
