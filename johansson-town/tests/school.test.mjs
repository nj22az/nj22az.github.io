import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {installDOM} from './fixtures.mjs';
import {SCHOOL,schoolAt,schoolColliders,FUKUGI} from '../src/world/school-layout.js';
import {schoolPhase,menuForWeekday,KYUSHOKU_MENUS,buildClassroom,CLASSROOM} from '../src/world/interiors/classroom.js';
import {CHIME_TIMES,CHIME_NOTES} from '../src/audio/school-chime.js';
import {createActivities} from '../activities.js?snappy=1';

test('the school model is one small campus: a handful of draws, and stains drawn as decals',async()=>{
 installDOM();
 const bytes=await readFile(new URL('../assets/models/school/minato-school.glb',import.meta.url));
 assert.ok(bytes.length<3_200_000,'School model budget');
 const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 let draws=0,triangles=0,stains=0;
 gltf.scene.traverse(o=>{if(!o.isMesh)return;draws++;triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;if(/stain/i.test(o.material.name))stains++;assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));});
 assert.ok(draws<=6,'School draws');assert.ok(triangles<45000,'School triangles');assert.equal(stains,1,'Stains are their own decal surface');
 const box=new THREE.Box3().setFromObject(gltf.scene);
 assert.ok(box.min.x>SCHOOL.minX-2&&box.max.x<SCHOOL.maxX+8,'The campus stays on its ground');
});

test('the grounds are walkable through the gate, and the block, the columns and the trees are solid',()=>{
 assert.ok(schoolAt(SCHOOL.gate.x,SCHOOL.gate.z+.5),'The gate does not lead anywhere');
 assert.ok(schoolAt(30,33),'The field is not walkable');
 const solid=schoolColliders();
 const hit=(x,z)=>solid.some(c=>Math.abs(x-c.x)<c.w/2&&Math.abs(z-c.z)<c.d/2);
 assert.ok(hit(27,44),'You walk into the classroom block');
 assert.ok(!hit(SCHOOL.gate.x,SCHOOL.gate.z+.2),'The gateway is blocked');
 assert.ok(!hit(SCHOOL.genkan.x,SCHOOL.building.minZ-.9),'The entrance is blocked');
 assert.ok(!hit(30,33),'Something stands in the middle of the field');
 for(const [x,z] of FUKUGI)assert.ok(schoolAt(x,z)||x<SCHOOL.minX+1,'A windbreak tree stands off the grounds');
});

test('the school day runs by the clock: rows, lunch in han, sōji, club, and nothing at weekends',()=>{
 const at=(h,m,wd=3)=>schoolPhase(h*60+m,wd);
 assert.equal(at(7,0),'closed');assert.equal(at(8,0),'morning');assert.equal(at(10,0),'lesson');
 assert.equal(at(12,20),'serving');assert.equal(at(12,35),'lunch');assert.equal(at(13,0),'cleaning');
 assert.equal(at(14,0),'lesson-pm');assert.equal(at(15,45),'club');assert.equal(at(17,0),'after');assert.equal(at(19,0),'closed');
 assert.equal(at(12,35,0),'weekend');assert.equal(at(12,35,6),'weekend');
 assert.equal(KYUSHOKU_MENUS.length,5);
 for(let wd=1;wd<=5;wd++){const m=menuForWeekday(wd);assert.ok(m.jp.includes('牛乳'),'No milk on day '+wd);}
 assert.equal(menuForWeekday(5).staple,'soba','Friday is Okinawa soba');
 assert.deepEqual(CHIME_TIMES,[505,720,740,930,1020]);assert.equal(CHIME_NOTES.length,16);
});

test('the classroom rearranges its desks for lunch and puts a tray on every one',()=>{
 installDOM();
 const room=new THREE.Group(),reg=(o,label,fn)=>{o.userData.hit={label,fn,inside:true};};
 const cal=()=>({weekday:3,date:new Date(2026,8,23)});
 const layout=buildClassroom({room,reg,action(){},exit(){},calendar:cal});
 const settle=m=>{for(let i=0;i<120;i++)layout.tick(.25,m,i*.25);};
 settle(600);assert.equal(layout.phase,'lesson');
 const rows=layout.units.slice(0,12).map(u=>u.unit.position.clone());
 assert.ok(layout.units.slice(0,12).every(u=>Math.abs(u.unit.rotation.y)<.05),'In lessons every desk faces the board');
 settle(760);assert.equal(layout.phase,'lunch');
 assert.ok(layout.units.slice(0,12).some(u=>Math.abs(Math.abs(u.unit.rotation.y)-Math.PI)<.05),'At lunch the desks are turned to face each other');
 assert.ok(layout.units.slice(0,12).every(u=>u.tray.visible&&u.tray.children.length>5),'Somebody has no lunch');
 assert.ok(layout.units.slice(0,12).some((u,i)=>u.unit.position.distanceTo(rows[i])>.3),'The desks never moved');
 // Every pupil at lunch is sitting at their own desk.
 const seated=layout.kids.map(k=>k.duty?k.smockSeated:k.seated);
 assert.ok(seated.every(f=>f.visible),'A pupil is missing from lunch');
 for(const c of layout.colliders)assert.ok([c.x,c.z,c.w,c.d].every(Number.isFinite));
 const b=CLASSROOM.bounds;assert.ok(b.minX<CLASSROOM.spawn[0]&&CLASSROOM.spawn[0]<b.maxX&&b.minZ<CLASSROOM.spawn[2]&&CLASSROOM.spawn[2]<b.maxZ);
});

test('a visitor eats kyūshoku at lunch only, and pays into the pantry jar to cook',()=>{
 const dom=installDOM();let minutes=12*60+35;
 const acts=createActivities({say(){},onWeather(){},onTime:v=>{if(typeof v==='number')minutes+=v;},getMinutes:()=>minutes,getSocialContext:()=>({})});
 acts.action('kyushoku','lesson',menuForWeekday(1));
 assert.match(document.querySelector('#activityBody').firstChild.textContent,/12:20/);
 const yen=acts.state.yen;acts.action('kyushoku','lunch',menuForWeekday(1));dom.button('Take a tray · いただきます');
 assert.equal(acts.state.yen,yen,'Kyūshoku charged the guest');assert.ok(acts.state.notes.some(n=>n.includes('ゴーヤーチャンプルー')));
 acts.action('school-pantry','club');dom.button('Make sata andagi · ¥100 in the jar');
 assert.equal(acts.state.yen,yen-100);assert.ok(acts.state.inventory.includes('Sata andagi'));
 acts.action('school-pantry','lesson');assert.equal(dom.actions?.().length??1,1);
});
