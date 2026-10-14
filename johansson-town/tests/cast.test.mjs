// The cast (src/people/cast.js; docs/CAST-PLAN.md): everyone on the island has a home, a purpose, a day and people.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CAST,CAST_NAMES,RELATIONSHIPS,PLACES,relationshipsOf,castMember} from '../src/people/cast.js';
import {ISLAND_HOUSEHOLDS,ISLAND_HOMES} from '../src/people/island-households.js';
import {NEIGHBOURS} from '../src/people/neighbours.js';
import {WORLD_CAST,ACTIVE_RESIDENT_NAMES} from '../src/people/residents.js';
import {FERRY_PEOPLE} from '../src/people/ferry-crew.js';
import {PUPIL_NAMES} from '../src/world/interiors/classroom.js';

// Who the world still shows that the plan's batch 2 replaces: the classroom's eight pupils become Vy, Riku and Mai.
const BATCH_2=new Set(PUPIL_NAMES.filter(n=>!castMember(n)));
const hhmm=t=>{const [h,m]=t.split(':').map(Number);return h*60+m;};

test('everyone has a home that stands, a purpose and a place they work',()=>{
 assert.equal(new Set(CAST_NAMES).size,CAST.length,'one entry each');
 const homes=new Set(ISLAND_HOMES.map(h=>h.home));
 for(const p of CAST){
  assert.ok(homes.has(p.home),p.name+' lives at '+p.home+', a home on the island');
  for(const h of p.alsoAt)assert.ok(homes.has(h),p.name+'’s second home '+h);
  assert.ok(p.purpose?.length>20,p.name+' has a purpose');
  assert.ok(p.work,p.name+' has a place to be');
  assert.ok(p.name==='Johansson'||Number.isInteger(p.age),p.name+' has an age');
  assert.match(p.sex,/^[mf]$/);
 }
 // Children go to school.
 for(const p of CAST.filter(p=>p.age!=null&&p.age<16))assert.equal(p.work,'school',p.name+' goes to school');
});

test('everyone has a day that takes them out and brings them home',()=>{
 for(const p of CAST){
  assert.ok(p.day.length>=3,p.name+' has at least three stops');
  for(const [t,where,doing] of p.day){assert.match(t,/^\d\d:\d\d$/);assert.ok(where&&doing,p.name+' at '+t);}
  const homes=new Set([p.home,...p.alsoAt]);
  assert.ok(p.day.some(([,where])=>!homes.has(where)),p.name+' leaves home');
  assert.ok(homes.has(p.day.at(-1)[1])||p.home==='ferry'||p.home===p.work,p.name+' ends the day at home');
  assert.ok(p.day.some(([,where])=>where===p.work),p.name+' goes to '+p.work);
  // The stops are in the order of the day (one may run past midnight).
  const mins=p.day.map(([t])=>hhmm(t));let wraps=0;for(let i=1;i<mins.length;i++)if(mins[i]<mins[i-1])wraps++;
  assert.ok(wraps<=1,p.name+'’s day runs in order');
 }
});

test('everyone has at least three people, and something unsettled with one of them',()=>{
 for(const r of RELATIONSHIPS){
  assert.ok(CAST_NAMES.includes(r.a)&&CAST_NAMES.includes(r.b),r.a+' and '+r.b+' are both in the cast');
  assert.notEqual(r.a,r.b);assert.ok(r.kind&&r.story,r.a+' and '+r.b+' have a kind and a story');
 }
 const keys=RELATIONSHIPS.map(r=>[r.a,r.b].sort().join('|'));assert.equal(new Set(keys).size,keys.length,'each pair once');
 for(const name of CAST_NAMES){
  const mine=relationshipsOf(name);
  assert.ok(mine.length>=3,name+' has '+mine.length+' relationships');
  assert.ok(mine.some(r=>r.tension),name+' has some tension with somebody');
 }
 // The three sisters and their families (the creator, 2026-10-13).
 const kind=(a,b)=>RELATIONSHIPS.find(r=>(r.a===a&&r.b===b)||(r.a===b&&r.b===a))?.kind;
 assert.equal(kind('Johansson','Thuan'),'married');assert.equal(kind('Thao','Chin'),'married');assert.equal(kind('Nhung','Kōji'),'married');
 assert.equal(kind('Thao','Vy'),'mother and daughter');assert.equal(kind('Miss Higa','Vy'),'teacher and pupil');
});

test('every open place has keepers in the cast; a place nobody keeps is closed',()=>{
 for(const [id,place] of Object.entries(PLACES)){
  if(place.closed){assert.ok(!place.keepers,id+' is closed');continue;}
  assert.ok(place.keepers?.length,id+' has a keeper');
  for(const k of place.keepers)assert.ok(CAST_NAMES.includes(k),k+' keeps '+id);
 }
 for(const p of CAST)assert.ok(PLACES[p.work]||p.work===p.home||['kitano-3'].includes(p.work),p.name+' works at a place in PLACES');
});

test('nobody in the world is outside the cast',()=>{
 const figures=new Set([...WORLD_CAST.map(p=>p.name),...ACTIVE_RESIDENT_NAMES,...NEIGHBOURS.map(n=>n.name),...FERRY_PEOPLE,
  ...ISLAND_HOUSEHOLDS.flatMap(h=>h.members.map(m=>m.name)),...PUPIL_NAMES]);
 for(const name of figures)assert.ok(castMember(name)||BATCH_2.has(name),name+' is in the cast');
 assert.ok(BATCH_2.size<=7,'only the old pupils wait for batch 2');
});

test('the registry is built from the cast: one home each, and an empty home is to let',()=>{
 for(const h of ISLAND_HOUSEHOLDS){
  assert.equal(Boolean(h.toLet),h.members.length===0,h.home);
  for(const m of h.members){const p=castMember(m.name);assert.ok(p.home===h.home||p.alsoAt.includes(h.home));}
 }
 for(const p of CAST)assert.ok(ISLAND_HOUSEHOLDS.find(h=>h.home===p.home).members.some(m=>m.name===p.name),p.name+' is on the nameplate');
});

test('the guide shows only the cast',async()=>{
 const guide=JSON.parse(await readFile(new URL('../guide/residents.json',import.meta.url),'utf8'));
 for(const r of guide)assert.ok(castMember(r.name),r.name+' in the guide is in the cast');
});
