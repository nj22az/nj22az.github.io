import test from 'node:test';
import assert from 'node:assert/strict';
import {RESIDENTS} from '../src/people/residents.js';
import {afterWorkPlan,residentPlan} from '../src/people/social.js';
import {COMMUTER_SHIFTS} from '../src/people/commuter-schedule.js';

const profile=name=>RESIDENTS.find(person=>person.name===name);

test('commuters live in town after work instead of immediately clumping at the bus',()=>{
 // Mrs Sato closes with only the scheduled walk-to-bus hour remaining; unlike the
 // others, she has no idle layover to replace.
 const names=['Aya','Kenji','Reiko','Tetsuo','Nao','Officer Mori'];
 const activities=[];
 const firstStops=names.map(name=>{
  const minutes=COMMUTER_SHIFTS[name].finish+10;
  const plan=residentPlan(profile(name),minutes,false,{townMode:'peninsula'},true);
  assert.notEqual(plan.place,'bus',name+' went straight to the bus');
  assert.ok(plan.activity.length>12,name+' has no personal activity');
  activities.push(plan.activity);
  return plan.target.join(',');
 });
 assert.equal(new Set(activities).size,names.length,'residents share generic after-work behaviour');
 assert.ok(new Set(firstStops).size>=3,'personal routines still collapse onto one destination');
});

test('Nao closes the izakaya, feeds the harbour cats and rests before her bus',()=>{
 const nao=profile('Nao'),finish=COMMUTER_SHIFTS.Nao.finish;
 assert.match(afterWorkPlan(nao,finish+10).activity,/clearing tables/);
 assert.match(afterWorkPlan(nao,finish+90).activity,/harbour cats/);
 assert.match(afterWorkPlan(nao,finish+210).activity,/resting her feet/);
});

test('every commuter leaves personal time in time to walk to the Harbour Line',()=>{
 for(const name of ['Aya','Kenji','Mrs Sato','Reiko','Tetsuo','Nao','Officer Mori']){
  const shift=COMMUTER_SHIFTS[name];
  const plan=residentPlan(profile(name),shift.departure-55,false,{townMode:'peninsula'},true);
  assert.equal(plan.place,'bus',name+' does not head for the bus before departure');
 }
});

test('rain sends residents straight to sheltered bus travel',()=>{
 const aya=profile('Aya'),minutes=COMMUTER_SHIFTS.Aya.finish+10;
 assert.equal(afterWorkPlan(aya,minutes,true),null);
 assert.equal(residentPlan(aya,minutes,true,{townMode:'peninsula'},true).place,'bus');
});
