// Harbour Park's keepers walk to what they keep (the park rework the owner approved on 21 October 2026): every bed and
// the koi pond records its keeper and when they see to it (world/harbour-park-garden.js), and that resident's day takes
// them there at that time, to stand points beside it (people/stand-sequences.js; Thuan on her afternoon walk, social.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import {installDOM} from './fixtures.mjs';

installDOM();globalThis.self=globalThis;
const {HARBOUR_PARK_BEDS,HARBOUR_POND_KEEPER}=await import('../src/world/harbour-park-garden.js');
const {HARBOUR_POND}=await import('../src/world/harbour-park-plan.js');
const {identityOf}=await import('../src/people/roster.js');
const {CAST}=await import('../src/people/cast.js');
const {STAND_SEQUENCES}=await import('../src/people/stand-points.js');
const {canonicalDay}=await import('../src/people/canonical-day.js');
const {residentPlan,THUAN_BORDER,sistersPlayDay}=await import('../src/people/social.js');
const {RESIDENTS}=await import('../src/people/residents.js');
const {townCalendarAt}=await import('../src/town-clock.js');

const hm=t=>{const [h,m]=t.split(':').map(Number);return h*60+m;};
const near=(b,[x,z])=>Math.hypot(Math.max(b.minX-x,0,x-b.maxX),Math.max(b.minZ-z,0,z-b.maxZ));
// A weekday (Grandmother Higa's Saturday morning is the verandah: shop-days.js) on which Thuan walks, not plays.
const weekday=(play)=>{let d=20003;while([0,6].includes(townCalendarAt(d*1440).weekday)||sistersPlayDay(d*1440)!==play)d++;return d*1440;};

test('every bed and the pond names a visit, and the keeper’s day has that row at that time',()=>{
 for(const kept of [...HARBOUR_PARK_BEDS,HARBOUR_POND_KEEPER]){
  const id=kept.id||'pond',name=identityOf(kept.keeper).avatar,v=kept.visit;
  assert.ok(v&&/^\d\d:\d\d$/.test(v.at),id+' says when its keeper comes');
  assert.ok((kept.tends||kept.feeds).includes(v.at),id+': the visit is the time the record gives');
  if(v.walk){assert.equal(name,'Thuan',id+': only Thuan’s visit is a leg of a walk');continue;}
  const row=CAST.find(p=>p.name===name).day.find(r=>r[0]===v.at);
  assert.ok(row&&row[3]?.stand===v.stand,id+': '+name+'’s day goes to '+v.stand+' at '+v.at);
  assert.equal(STAND_SEQUENCES[v.stand].who,name,id+': the stand sequence is '+name+'’s');
 }
});

test('at the visit, the keeper is planned to stand beside what they keep, facing it, at work',()=>{
 const day=weekday(false),P=HARBOUR_POND,pond={minX:P.x-P.rx,maxX:P.x+P.rx,minZ:P.z-P.rz,maxZ:P.z+P.rz};
 for(const kept of [...HARBOUR_PARK_BEDS,HARBOUR_POND_KEEPER]){
  const name=identityOf(kept.keeper).avatar,v=kept.visit,bounds=kept.bounds||pond;
  for(const after of [1,4]){
   const minutes=day+hm(v.at)+after;
   const plan=v.walk?residentPlan(RESIDENTS.find(p=>p.name===name),minutes):canonicalDay(name,minutes);
   assert.ok(plan?.stand,(kept.id||'pond')+': '+name+' has a stand at '+v.at+'+'+after);
   assert.equal(plan.stand.pose,'Interact',(kept.id||'pond')+': at work, not idling');
   if(!v.walk)assert.equal(plan.stand.sequence,v.stand);
   assert.ok(near(bounds,plan.target)<1.6,(kept.id||'pond')+': within reach, '+near(bounds,plan.target).toFixed(2)+' m');
  }
 }
});

test('Thuan stops at the border on her walk days and plays with Nhung on the others; it rains, she does neither',()=>{
 const thuan=RESIDENTS.find(p=>p.name==='Thuan');
 const walk=residentPlan(thuan,weekday(false)+hm('15:05'));
 assert.deepEqual(walk.target,[...THUAN_BORDER.at]);assert.match(walk.activity,/border/);
 const play=residentPlan(thuan,weekday(true)+hm('15:05'));
 assert.equal(play.play,'Nhung');
 const wet=residentPlan(thuan,weekday(false)+hm('15:05'),true);
 assert.ok(!/border/.test(wet.activity||''),'no gardening in the rain');
});
