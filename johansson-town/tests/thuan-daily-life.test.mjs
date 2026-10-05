import test from 'node:test';
import assert from 'node:assert/strict';
import {residentPlan} from '../src/people/social.js';
import {RESIDENTS} from '../src/people/residents.js';
import {homeRoutine} from '../src/people/home-life.js';
import {residentPersonality} from '../src/people/resident-personalities.js';
import {satoRamenOpen} from '../src/world/sato-ramen-layout.js';
const thuan=RESIDENTS.find(p=>p.name==='Thuan');
test('Thuan wakes, eats, gets ready, walks to work and takes a noodle lunch',()=>{
 for(const [m,routine] of [[440,'sleep'],[450,'wake'],[470,'breakfast'],[495,'prepare']]){
  assert.equal(homeRoutine(thuan,m).id,routine);
  assert.equal(residentPlan(thuan,m).place,'home');
 }
 assert.match(residentPlan(thuan,510).activity,/walking to work/);
 assert.equal(residentPlan(thuan,540).place,'market');
 assert.equal(residentPlan(thuan,780).place,'ramen');
 assert.ok(satoRamenOpen(780));
 assert.equal(residentPlan(thuan,830).place,'market');
 assert.equal(residentPersonality('Thuan').drink,'tea','her ordinary daytime drink stays tea');
});
test('saved clock keeps beer evenings stable over reload, rain and consecutive days',()=>{
 for(let day=0;day<4;day++){
  const m=day*1440+1260;
  assert.equal(residentPlan(thuan,m,false,{}).place,day%2===0?'izakaya':'home');
  assert.deepEqual(residentPlan(thuan,m,false,JSON.parse(JSON.stringify({}))),residentPlan(thuan,m,false,{}));
  assert.equal(residentPlan(thuan,m,true,{}).place,'home');
 }
});

test('Thuan serves waiting customers before leaving for lunch',()=>{
 const state={residentLife:{Reiko:{day:0,shopping:{started:779,finished:false}}}};
 assert.equal(residentPlan(thuan,780,false,state).place,'market');
 state.residentLife.Reiko.shopping.finished=true;
 assert.equal(residentPlan(thuan,782,false,state).place,'ramen');
});
