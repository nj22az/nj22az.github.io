// The cast consolidation's save migration (src/save.js migrateCast; docs/CAST-CONSOLIDATION.md §11, §13): old names
// to the live identity, retiring homes to a retained public place, versioned, and the same after a second load.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {migrateCast,migrateThuan,migrateHousing,castKey,CAST_REVISION,readSave,writeSave,SAVE_KEY} from '../src/save.js';
import {RETIRED_HOMES,RETIRED,CORE,identityOf} from '../src/people/roster.js';
import {CAST_NAMES,liveNameFor} from '../src/people/cast.js';

installDOM();globalThis.self=globalThis;
function store(){
 const m=new Map();
 return {m,get length(){return m.size;},key:i=>[...m.keys()][i]??null,getItem:k=>m.has(k)?m.get(k):null,removeItem:k=>m.delete(k),setItem(k,v){m.set(k,String(v));}};
}
const clone=o=>JSON.parse(JSON.stringify(o));

test('the migration is versioned and idempotent: a second pass changes nothing, and the revision is stamped once',()=>{
 const saved={friendship:{'Nakamura Mai':{points:4},'Mr Fujita':{points:2},Thuan:{points:9}},notes:['Met Nakamura Mai.'],homeTarget:'home-kitahama-4',yen:500,inventory:['tea']};
 migrateCast(saved);assert.equal(saved.castRevision,CAST_REVISION);
 const once=JSON.stringify(saved);migrateCast(saved);assert.equal(JSON.stringify(saved),once);
 assert.deepEqual(saved.friendship,{'Mr Fujita':{points:2},Thuan:{points:9},Mai:{points:4}});assert.deepEqual(saved.notes,['Met Mai.']);
 assert.equal(saved.yen,500);assert.deepEqual(saved.inventory,['tea']);
 assert.equal(migrateCast({castRevision:7}).castRevision,7,'a newer revision is never lowered');
 assert.equal(migrateCast(null),null);
});

test('old names move to the live identity; a record already under the live name wins; strangers are left alone',()=>{
 assert.equal(castKey('Yonamine-sensei'),'Miss Higa');assert.equal(castKey('Mrs Higa'),'Miss Higa');assert.equal(castKey('Nakamura Mai'),'Mai');assert.equal(castKey('Kenji'),'Chin');
 assert.equal(castKey('mac'),'Mac');assert.equal(castKey('Mr Nakandakari'),'Mac');assert.equal(castKey('jack'),'Harbour master');assert.equal(castKey('fuji'),'Mr Fujita');
 // The live names are the current ones, so nothing that walks today moves.
 for(const name of CAST_NAMES)assert.equal(castKey(name),name,name);
 for(const p of RETIRED)assert.equal(castKey(p.name),p.name,p.name+' still has a body');
 for(const p of CORE)assert.equal(castKey(p.id),liveNameFor(p.id),p.id+' resolves to the body walking today');
 // Phase 2 gave the supporting crew bodies, so their old job-role names move to them.
 assert.equal(castKey('Chief officer'),'Ryo');assert.equal(castKey('Kitano line hand'),'Kai');
 // A display name that is not live yet may be somebody else's record (the old townsfolk Emi): untouched.
 for(const name of ['Fuji','Jack','Emi','Ryo','Kai','Harbour visitor','Hana','Kinjo Yui'])assert.equal(castKey(name),name,name);
 const saved={friendship:{'Yonamine-sensei':{points:1},'Miss Higa':{points:8}},treats:{'Nakamura Mai':2},greeted:{'Mrs Higa':3},impressions:{Kenji:'kind'},
  relationships:{'Nakamura Mai|Vy':{totals:{chat:1}},'Mrs Higa|Yonamine-sensei':{totals:{}},'Thao|Yonamine-sensei':{totals:{}}},
  bookshop:{completed:{'3:Nakamura Mai':true}},errand:{from:'Nakamura Mai',kind:'fetch'},residentLife:{'Nakamura Mai':{day:1,yen:100,activities:['Nakamura Mai is at Blue Coral.']}},
  sakura:{journal:[{buyer:'Nakamura Mai',yen:120}]},documentArchive:[{author:'Yonamine-sensei',title:'Marks'}]};
 migrateCast(saved);
 assert.deepEqual(saved.friendship,{'Miss Higa':{points:8}},'the live record wins over the old one');
 assert.deepEqual(saved.treats,{Mai:2});assert.deepEqual(saved.greeted,{'Miss Higa':3});assert.deepEqual(saved.impressions,{Chin:'kind'});
 assert.deepEqual(Object.keys(saved.relationships).sort(),['Mai|Vy','Miss Higa|Thao'],'a pair of one person collapses and goes');
 assert.deepEqual(saved.bookshop.completed,{'3:Mai':true});assert.equal(saved.errand.from,'Mai');
 assert.deepEqual(saved.residentLife,{Mai:{day:1,yen:100,activities:['Mai is at Blue Coral.']}});
 assert.equal(saved.sakura.journal[0].buyer,'Mai');assert.equal(saved.documentArchive[0].author,'Miss Higa');
});

test('the player’s surname stays in prose: Johansson Harbour Office is not renamed with him',()=>{
 const saved={notes:['A folio at the Johansson Harbour Office.','Johansson fixed the kettle.'],friendship:{Johansson:{points:1}}};
 migrateCast(saved);assert.deepEqual(saved.notes,['A folio at the Johansson Harbour Office.','Johansson fixed the kettle.']);assert.ok(saved.friendship.Johansson);
});

test('a save pointing into a home that goes loads at a retained public place, in both states, and the mapping is stable',async()=>{
 const {createBusinesses}=await import('../src/world/businesses.js');
 const {createTown}=await import('../src/world/town.js');
 const sites=createBusinesses(),world=createTown({scene:new THREE.Scene(),sites,mobile:true,shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
 const places=new Map([...sites,...(world.landmarks||[])].map(s=>[s.id,s]));
 for(const target of new Set(Object.values(RETIRED_HOMES))){const site=places.get(target);assert.ok(site&&!site.isResidence,target+' is a retained public place in the built town');}
 // The houses themselves still stand today (phase 4 removes them): the migration maps them regardless. The Heights'
 // Flats 1 and 2 went with its upper storey in phase 3, so they are no home at all any more.
 for(const id of ['home-kitahama-4','home-kitahama-5','home-kitahama-6','home-kinjo','home-oshiro','resident-home-aya','home-shimabukuro']){const site=places.get(id);assert.ok(site&&(site.isResidence||site.homeOwner||site.homeId),id+' is a home today');}
 for(const id of ['home-kitahama-flat-1','home-kitahama-flat-2'])assert.equal(places.get(id),undefined,id+' is gone with the upper storey');
 const cases={'home-kitahama-4':'mayor-office','kitahama-5':'mayor-office','home-kitahama-6':'mayor-office','kinjo':'mayor-office','home-oshiro':'mayor-office','resident-home-aya':'mayor-office',
  'home-kitano-3':'mayor-office','kitano-3':'mayor-office','home-kitahama-flat-1':'mayor-office','kitahama-flat-2':'mayor-office','home-shimabukuro':'ferry-terminal','post-office':'ferry-terminal',
  'rainflower-florist':'market','florist':'market','home-izakaya':'izakaya','home-kitahama-7':'mayor-office','home-market':'mayor-office'};
 for(const [from,to] of Object.entries(cases)){
  const saved=migrateCast(migrateHousing({homeTarget:from,lastHome:from,navigationTarget:from,yen:3}));
  assert.equal(saved.homeTarget,to,from);assert.equal(saved.lastHome,to,from);assert.equal(saved.navigationTarget,to,from);
  const again=clone(saved);migrateCast(migrateHousing(again));assert.deepEqual(again,saved,from+' twice');
 }
 // Homes that stay are untouched: the family house, the flats that stay, the houseboat, the island.
 for(const id of ['resident-home-thuan','home-kitahama-flat-3','home-kitahama-flat-4','fujita-houseboat','mayor-home','home-higa','koban','office'])assert.equal(migrateCast({homeTarget:id}).homeTarget,id,id);
});

test('Nhung’s own home fields follow her to 3 Kitahama; her position and everybody else’s records stay',()=>{
 const saved={residentLocations:{Nhung:{position:[-20,1],indoors:'home',home:'resident-home-aya'},Reiko:{position:[-20,1],indoors:'home',home:'resident-home-aya'},Thao:{position:[2,2]}},
  residentLife:{Nhung:{day:2,yen:50,homeId:'resident-home-aya',sleepingPlace:'home-kitahama-3'}}};
 migrateCast(saved);
 assert.deepEqual(saved.residentLocations.Nhung,{position:[-20,1],indoors:'home',home:'kitahama-3'});
 assert.deepEqual(saved.residentLife.Nhung,{day:2,yen:50,homeId:'kitahama-3',sleepingPlace:'home-kitahama-3'});
 assert.equal(saved.residentLocations.Reiko.home,'resident-home-aya','Reiko is not Nhung; phase 4 retires her record');
 assert.deepEqual(saved.residentLocations.Thao,{position:[2,2]});
});

test('loading through readSave runs the whole chain once and reads the same after it is saved again',()=>{
 const s=store(),old={yen:800,inventory:['Canned coffee'],friendship:{Yui:{points:5},Aya:{points:2},'Mrs Higa':{points:1},'Nakamura Mai':{points:3}},notes:['Met Yui at Sakura.'],
  residentLocations:{Yuri:{position:[0,0]},'Grandmother Sakurai':{position:[1,1]}},homeTarget:'home-kitahama-4',visited:['market','home-kitahama-7'],'johansson-house':{doors:{a:true}}};
 s.setItem(SAVE_KEY,JSON.stringify(old));
 const read=readSave(s);
 assert.equal(read.castRevision,CAST_REVISION);assert.equal(read.housingRevision,1);
 assert.deepEqual(read.friendship,{Thuan:{points:5},Nhung:{points:2},'Miss Higa':{points:1},Mai:{points:3}},'the save-era names read as the sisters, once');
 assert.deepEqual(read.notes,['Met Thuan at Sakura.']);assert.deepEqual(read.residentLocations,{Thuan:{position:[0,0]}});
 assert.equal(read.homeTarget,'mayor-office');assert.deepEqual(read.visited,['market','mayor-office']);
 assert.equal(read.yen,800);assert.deepEqual(read.inventory,['Canned coffee']);assert.deepEqual(read['johansson-house'],{doors:{a:true}});
 writeSave(s,SAVE_KEY,JSON.stringify(read));const again=readSave(s);assert.deepEqual(again,read,'a migrated save reads back unchanged');
 // From castRevision 1 on, a record under Yui is the teacher's, not Thuan's.
 const later={castRevision:CAST_REVISION,friendship:{Yui:{points:6},Thuan:{points:1}}};
 assert.deepEqual(migrateThuan(clone(later)).friendship,later.friendship);
 s.setItem(SAVE_KEY,JSON.stringify(later));assert.deepEqual(readSave(s).friendship,{Yui:{points:6},Thuan:{points:1}});
});
