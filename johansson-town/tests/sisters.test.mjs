import test from 'node:test';
import assert from 'node:assert/strict';
import {residentPlan,sistersAtPlay,sistersPlayDay,SAKURA_FREEZER,thuanAtMinato} from '../src/people/social.js';
import {RESIDENTS} from '../src/people/residents.js';
import {PROFILES} from '../src/people/profiles.js';
import {recipeFor} from '../src/avatars/cast.js';
import {NEIGHBOUR_TALK} from '../src/people/neighbours.js';
import {migrateThuan} from '../src/save.js';

const who=name=>RESIDENTS.find(p=>p.name===name);
const age=name=>PROFILES.find(p=>p.name===name)?.age;

// Since 22 October 2026 (the owner) Nhung is the island doctor in the clinic doctor's look, round half-rim glasses included.
test('Nhung, Thao and Thuan are sisters, eldest to youngest, and Nhung wears the doctor’s half-rim glasses',()=>{
 assert.ok(age('Nhung')>age('Thao'));assert.equal(age('Thao'),34);   // Thao is 34, so that Vy can be 11 (docs/CAST-PLAN.md)
 assert.equal(recipeFor('Nhung').glasses.style,'half');
 assert.equal(recipeFor('Thao').outfit.top,'tee');assert.equal(recipeFor('Chin').outfit.hat,'cap');
});

// The game is in Thuan's afternoon break (14:40), which is afternoon surgery on a weekday: the doctor stays with her
// patients, so the sisters play only on a day the clinic is shut then, and none of Thuan's days in town is.
test('on a play day Nhung and Thuan play jan-ken-pon facing each other in the park, but never in surgery hours',async()=>{
 const {clinicOpenAt}=await import('../src/people/clinic-hours.js');
 for(let d=0;d<14;d++){const m=d*1440+890;if(clinicOpenAt(m))assert.equal(sistersAtPlay(who('Thuan'),m),null,'surgery on day '+d);}
 const day=[0,1].find(d=>sistersPlayDay(d*1440));if(day===undefined)return;const m=day*1440+890;
 for(const name of ['Thuan','Nhung']){
  const plan=residentPlan(who(name),m,false,{},true);
  assert.equal(plan.place,'park');assert.match(plan.activity,/jan-ken-pon/);assert.equal(plan.play,name==='Thuan'?'Nhung':'Thuan');
 }
 assert.equal(sistersAtPlay(who('Thuan'),m,true),null,'rain calls the game off');
 assert.equal(sistersAtPlay(who('Thuan'),day+1440+890),null,'not every day');
});

test('after surgery: Thuan at the counter, supper at home, ice cream at the freezer, Minato on her nights',()=>{
 const night=[0,1,2].find(d=>thuanAtMinato(who('Thuan'),d*1440+1250))*1440;
 const nhung=m=>residentPlan(who('Nhung'),night+m,false,{},true),thuan=m=>residentPlan(who('Thuan'),night+m,false,{},true);
 assert.equal(nhung(1050).place,'market');assert.match(nhung(1050).activity,/Thuan/);assert.equal(nhung(1140).place,'home');
 assert.deepEqual(nhung(1205).target,SAKURA_FREEZER[1]);assert.deepEqual(thuan(1205).target,SAKURA_FREEZER[0]);
 assert.equal(nhung(1230).place,'izakaya');assert.equal(thuan(1230).place,'izakaya');
 // On a night Thuan goes home, Nhung prints the paper at Front-Row instead.
 assert.equal(residentPlan(who('Nhung'),night+1440+1230,false,{},true).place,'paper');
});

test('Vy is a teen in her sailor uniform with a school-day routine',()=>{
 const vy=recipeFor('Vy');assert.equal(vy.age,'teen');assert.equal(vy.outfit.top,'sailor');assert.equal(vy.outfit.bottom,'pleatedskirt');
 assert.ok(NEIGHBOUR_TALK.Vy.routine.some(r=>/ice cream/.test(r.role)));
});

test('saves from before the renames keep their people',()=>{
 const s=migrateThuan({friendship:{Aya:{points:5}},residentLocations:{Kenji:{place:'work'},Nao:{place:'izakaya'}},notes:['Bought Aya a drink.']});
 assert.deepEqual(Object.keys(s.friendship),['Nhung']);assert.deepEqual(Object.keys(s.residentLocations).sort(),['Chin','Thao']);
 assert.deepEqual(s.notes,['Bought Nhung a drink.']);
});
