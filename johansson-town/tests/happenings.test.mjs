import test from 'node:test';
import assert from 'node:assert/strict';
import {realTownMinutes,townDate,okinawaSeason,timeBand,townDay} from '../src/town-clock.js';
import {HAPPENINGS,happeningsOn,happeningPlan,happeningLine} from '../src/people/happenings.js';
import {residentPlan} from '../src/people/social.js';
import {RESIDENTS} from '../src/people/residents.js';

/** Town minutes for a month, day and time; the town reads any year's date as 1997's. */
const on=(month,day,h=12,m=0)=>realTownMinutes(new Date(2026,month-1,day,h,m));
const who=name=>RESIDENTS.find(p=>p.name===name);

test('the calendar: 1997 dates and weekdays, Okinawa’s seasons, the parts of the day',()=>{
 const sunday=on(10,5,15);
 assert.deepEqual(townDate(sunday),{month:10,day:5,weekday:0,key:'10-05'},'5 October 1997 was a Sunday');
 assert.equal(townDay(on(10,6))-townDay(on(10,5)),1);
 assert.equal(okinawaSeason(on(5,20)),'rainy');assert.equal(okinawaSeason(on(8,1)),'summer');assert.equal(okinawaSeason(on(1,10)),'winter');
 assert.deepEqual([6,12,17,20,23].map(h=>timeBand(on(10,5,h))),['morning','midday','afternoon','evening','night']);
});

test('every happening is well formed and names only people who exist',()=>{
 const ids=new Set();
 for(const h of HAPPENINGS){
  assert.ok(!ids.has(h.id),h.id+' twice');ids.add(h.id);
  assert.ok(h.title&&h.on&&Array.isArray(h.hours),h.id);
  for(const name of [...Object.keys(h.cast||{}),...Object.keys(h.lines||{})])assert.ok(who(name),h.id+': '+name+' is not a resident');
  for(const [name,spot] of Object.entries(h.cast||{})){const s=typeof spot==='function'?spot(who(name)):spot;assert.ok(Array.isArray(s.target)&&s.target.every(Number.isFinite),h.id+' '+name);}
 }
});

test('the Sunday fish auction puts Mrs Sato and the harbour master on the quay, rain or not',()=>{
 const m=on(10,5,9,20);
 assert.ok(happeningsOn(m).some(h=>h.id==='fish-auction'));
 for(const name of ['Mrs Sato','Harbour master']){
  const plan=residentPlan(who(name),m,false,{});assert.equal(plan.happening,'fish-auction');assert.match(plan.activity,/auction/);
  assert.equal(residentPlan(who(name),m,true,{}).happening,'fish-auction','the auction is under the roof');
 }
 assert.equal(happeningPlan(who('Mrs Sato'),on(10,6,9,20)),null,'Monday is not auction day');
});

test('the last night of Obon brings the street out for the eisa, unless it rains',()=>{
 const m=on(8,17,19,50);
 for(const name of ['Thao','Nhung','Chin'])assert.equal(residentPlan(who(name),m,false,{}).happening,'eisa');
 assert.notEqual(residentPlan(who('Chin'),m,true,{}).happening,'eisa');
 assert.equal(happeningPlan(who('Chin'),on(8,17,23)),null,'only while the drums are out');
});

test('people mention the day all day, once per day each',()=>{
 const line=happeningLine('Thao',on(8,17,9));
 assert.ok(line&&/Obon/.test(line.text));
 assert.notEqual(line.key,happeningLine('Thao',on(8,17,9)+1440*365)?.key,'a different day, a fresh mention');
 assert.equal(happeningLine('Thao',on(8,20,9)),null);
});
