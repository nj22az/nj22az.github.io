import test from 'node:test';
import assert from 'node:assert/strict';
import {residentPlan,thuanWeekendAway} from '../src/people/social.js';
import {RESIDENTS} from '../src/people/residents.js';
import {sakuraClerkAt,isWeekend} from '../src/commerce/sakura-rota.js';
import {NEIGHBOURS} from '../src/people/neighbours.js';
import {KITANO_HAMLET,hamletGate} from '../src/world/kitano-hamlet-layout.js';
import {airportWorld} from '../src/world/airport-ground.js';
import {townCalendarAt} from '../src/town-clock.js';

// Day 0 is Wednesday 1 January 1997 (town-clock.js): Friday is day 2, Saturday 3, Sunday 4, Monday 5.
const at=(day,minute)=>day*1440+minute,profile=name=>RESIDENTS.find(p=>p.name===name);
assert.equal(townCalendarAt(at(2,0)).weekday,5);

test('Thuan spends the weekend at home on Kitano-jima: the Friday 22:00 boat out, the Monday 08:30 boat back',()=>{
 const thuan=profile('Thuan');
 assert.equal(residentPlan(thuan,at(2,1150)).place,'market','Friday afternoon she is at her counter');
 assert.match(residentPlan(thuan,at(2,1300)).activity,/ferry, home to Kitano-jima/);
 for(const [day,minute] of [[2,1330],[3,600],[3,1200],[4,120],[4,1380],[5,300]]){
  const plan=residentPlan(thuan,at(day,minute));
  assert.equal(plan.place,'away',`day ${day} ${minute}`);assert.match(plan.activity,/Kitano-jima with her husband, Johansson/);
 }
 assert.match(residentPlan(thuan,at(5,520)).activity,/arriving on the ferry from Kitano-jima/);
 assert.equal(residentPlan(thuan,at(5,600)).place,'market','Monday she is back at Sakura');
 assert.ok(!thuanWeekendAway(at(1,1400))&&!thuanWeekendAway(at(2,1319)),'Weekdays and Friday before the boat are in town');
 assert.equal(residentPlan(thuan,at(1,1400)).place,'home','On a weekday night she sleeps at 1 Kitahama');
});

test('Sakura’s rota: Thuan on weekdays, Nhung at the weekend, Chin every night, Grandmother Sakurai at dawn',()=>{
 assert.equal(sakuraClerkAt(at(1,600)),'Thuan');assert.equal(sakuraClerkAt(at(3,600)),'Nhung');assert.equal(sakuraClerkAt(at(4,1229)),'Nhung');
 for(const day of [1,3,5]){assert.equal(sakuraClerkAt(at(day,1230)),'Chin');assert.equal(sakuraClerkAt(at(day,180)),'Chin');assert.equal(sakuraClerkAt(at(day,420)),'Grandmother Sakurai');}
 assert.ok(isWeekend(at(3,0))&&isWeekend(at(4,1439))&&!isWeekend(at(5,0)));
 for(let m=0;m<1440;m+=5)assert.equal(residentPlan(profile('Nhung'),at(3,m)).place==='bookshop',false,'Front Row is closed on Saturday: '+m);
 assert.equal(residentPlan(profile('Nhung'),at(3,700)).place,'market','Nhung minds Sakura on Saturday');
 assert.equal(residentPlan(profile('Chin'),at(1,1300)).place,'market');assert.equal(residentPlan(profile('Chin'),at(1,600)).place,'home','Chin sleeps after the night shift');
});

test('Tetsuo commutes from Kitano-jima by ferry and is never left in town overnight',()=>{
 const tetsuo=profile('Tetsuo');
 assert.equal(residentPlan(tetsuo,at(1,520)).place,'bus');assert.equal(residentPlan(tetsuo,at(1,600)).place,'work');
 assert.equal(residentPlan(tetsuo,at(1,720)).place,'ramen');assert.equal(residentPlan(tetsuo,at(1,1000)).place,'work');
 for(const m of [0,120,240,1330,1420]){const plan=residentPlan(tetsuo,at(1,m));assert.equal(plan.place,'away',''+m);assert.match(plan.activity,/Kitano-jima/);}
});

test('Jun’s off-duty home is his own house in Kitano hamlet',()=>{
 const jun=NEIGHBOURS.find(n=>n.name==='Jun'),plot=KITANO_HAMLET.plots.find(p=>p.id==='kitano-2'),gate=airportWorld(...hamletGate(plot).door);
 assert.deepEqual(jun.home,gate);
 for(const phase of jun.routine.filter(p=>p.home)){assert.deepEqual(phase.at,gate);assert.match(phase.role,/at home in Kitano hamlet/);}
 assert.ok(jun.routine.some(p=>!p.home),'He still works at the terminal');
});
