import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildResidentHome} from '../src/world/interiors/resident-home.js';
import {YARD_HOMES} from '../src/world/yard-homes-layout.js';
import {createRoomWalk} from '../src/people/room-walk.js';

// The shared houses are drawn to the house you see (docs/BUILDING-AUDIT.md, B4): the yard
// staff houses are the size of their walls, Thuan and Thao live in a Kitahama house like
// their neighbours', and everyone who lives there can walk from the door to their place
// at the table and to their futon, and back.
const homes=[
 {site:{id:'resident-home-aya',title:'Nhung & Reiko’s home',homeOwner:'Nhung',homeOwners:['Nhung','Reiko']},names:['Nhung','Reiko']},
 {site:{id:'resident-home-kenji',title:'Chin & Tetsuo’s home',homeOwner:'Chin',homeOwners:['Chin','Tetsuo']},names:['Chin','Tetsuo']},
 {site:{id:'resident-home-thuan',title:'Thuan & Thao’s home',homeOwner:'Thuan',homeOwners:['Thuan','Thao'],plot:'kitahama-1',houseKind:'red-tile'},names:['Thuan','Thao']},
 {site:{id:'resident-home-thuan',title:'Thuan & Thao’s home',homeOwner:'Thuan',homeOwners:['Thuan','Thao'],plot:'kitahama-1',houseKind:'concrete'},names:['Thuan','Thao']},
];
for(const {site,names} of homes){
 test(`${site.title} (${site.houseKind||'yard'}): a real plan, and its people walk to the table and to bed`,()=>{
  installDOM();
  const room=new THREE.Group(),cols=[];
  const box=(size,pos,c,parent)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshBasicMaterial());m.position.set(...pos);(parent||room).add(m);return m;};
  const layout=buildResidentHome({site,profile:{name:site.homeOwner,role:'r'},room,box,reg(){},action(){},exit(){},collider:(x,z,w,d)=>cols.push({x,z,w,d})});
  const names_=new Set();room.traverse(o=>{if(o.name)names_.add(o.name.split(' (')[0]);});
  for(const n of ['Toilet','Kitchen counter'])assert.ok(names_.has(n),site.id+' has no '+n);
  if(YARD_HOMES[site.id]){
   const spec=YARD_HOMES[site.id],B=layout.bounds;
   assert.ok(B.maxX-B.minX<=spec.w&&B.maxZ-B.minZ<=spec.d,'the room fits inside the walls you see');
   assert.ok(names_.has('Genkan tiles'),'no genkan');
  }
  const B=layout.bounds,blocked=(x,z,r)=>x<B.minX+r||x>B.maxX-r||z<B.minZ+r||z>B.maxZ-r||cols.some(c=>Math.abs(c.x-x)<c.w/2+r&&Math.abs(c.z-z)<c.d/2+r);
  for(const name of names){
   const L=layout.homeLayouts?.[name];assert.ok(L,name+' has a place in the house');
   const person={g:new THREE.Object3D(),profile:{name,age:30}};person.g.position.set(...L.door);
   const walk=createRoomWalk(blocked);
   for(const [label,target] of [['table',L.tableStand??L.table],['bed',L.bedside],['door',L.door]]){
    let done=false;for(let i=0;i<1200&&!done;i++)done=walk.move(person,target,1/20);
    assert.ok(done,`${name} cannot walk to the ${label} in ${site.title} (stopped at ${person.g.position.x.toFixed(2)}, ${person.g.position.z.toFixed(2)})`);
   }
   assert.ok(Math.abs(L.bed[0]-L.bedside[0])<.2&&Math.abs(L.bed[2]-L.bedside[2])<.5,name+' lies down on their own futon');
  }
 });
}

test('the kōban has its WC, and Officer Mori still walks to his table and his futon',async()=>{
 installDOM();
 const {buildKobanInterior,KOBAN_HOME_LAYOUT:L}=await import('../src/world/interiors/koban.js');
 const room=new THREE.Group(),cols=[];
 const r=buildKobanInterior({room,reg(){},action(){},exit(){},collider:(x,z,w,d)=>cols.push({x,z,w,d})});
 const names=new Set();room.traverse(o=>{if(o.name)names.add(o.name);});
 const B=r.bounds,blocked=(x,z,rr)=>x<B.minX+rr||x>B.maxX-rr||z<B.minZ+rr||z>B.maxZ-rr||cols.some(c=>Math.abs(c.x-x)<c.w/2+rr&&Math.abs(c.z-z)<c.d/2+rr);
 const person={g:new THREE.Object3D(),profile:{name:'Officer Mori',age:40}};person.g.position.set(...L.door);
 const walk=createRoomWalk(blocked);
 for(const [label,target] of [['table',L.table],['futon',L.bedside],['door',L.door]]){
  let done=false;for(let i=0;i<1600&&!done;i++)done=walk.move(person,target,1/20);
  assert.ok(done,`Officer Mori cannot walk to the ${label}`);
 }
});

test('the harbour office has the harbour master’s WC, and he still walks to his tea table and his futon',async()=>{
 installDOM();
 const {buildOfficeWorkplace,OFFICE_HOME_LAYOUT:L}=await import('../src/world/interiors/office-workplace.js');
 const {SUPPLIED_ROOM_LAYOUTS}=await import('../src/world/supplied-rooms.js');
 const room=new THREE.Group(),cols=[...SUPPLIED_ROOM_LAYOUTS.office.colliders];
 buildOfficeWorkplace({room,reg(){},action(){},collider:(x,z,w,d)=>cols.push({x,z,w,d})});
 const names=new Set();room.traverse(o=>{if(o.name)names.add(o.name);});assert.ok(names.has('Toilet'),'the office has no WC');
 const B=L.bounds,blocked=(x,z,rr)=>x<B.minX+rr||x>B.maxX-rr||z<B.minZ+rr||z>B.maxZ-rr||cols.some(c=>Math.abs(c.x-x)<c.w/2+rr&&Math.abs(c.z-z)<c.d/2+rr);
 const person={g:new THREE.Object3D(),profile:{name:'Harbour master',age:60}};person.g.position.set(...L.door);
 const walk=createRoomWalk(blocked);
 for(const [label,target] of [['tea table',L.table],['futon',L.bedside],['WC',[-1.85,0,2.0]],['door',L.door]]){
  let done=false;for(let i=0;i<1600&&!done;i++)done=walk.move(person,target,1/20);
  assert.ok(done,`the harbour master cannot walk to the ${label}`);
 }
});
