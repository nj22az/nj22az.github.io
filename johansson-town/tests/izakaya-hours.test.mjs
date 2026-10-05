import test from 'node:test';
import assert from 'node:assert/strict';
import {izakayaJob,closedGreeting,CLEANING_POSES} from '../src/people/izakaya-hours.js';
import {residentPlan,izakayaOpen} from '../src/people/social.js';
import {PROFILES} from '../src/people/profiles.js';
import {SHARED_DINING_COLLIDERS} from '../src/world/interiors/shared-dining-layout.js';

const profile=name=>PROFILES.find(p=>p.name===name);
test('Minato always has somebody in it, and while it is closed they are cleaning or asleep',()=>{
 for(let m=0;m<1440;m+=10){
  const inside=['Barfly','Thao'].filter(n=>residentPlan(profile(n),m).place==='izakaya');
  assert.ok(inside.length>0,'Somebody is in Minato at '+m);
  if(izakayaOpen(m))continue;
  const barfly=residentPlan(profile('Barfly'),m);
  const job=izakayaJob('Barfly',m);
  assert.ok(job||barfly.barflySleeping,'The Barfly is cleaning or asleep while closed, at '+m);
  if(job)assert.ok(CLEANING_POSES.includes(job.pose),job.pose+' is a cleaning pose');
 }
});
test('Thao stays an hour after last orders to wipe the counter, then goes home to sleep',()=>{
 assert.equal(residentPlan(profile('Thao'),200).place,'izakaya');
 assert.match(residentPlan(profile('Thao'),200).activity,/wiping the counter/);
 assert.notEqual(residentPlan(profile('Thao'),300).place,'izakaya');
});
test('every cleaning station is on open floor, clear of the furniture',()=>{
 const hit=([x,,z])=>SHARED_DINING_COLLIDERS.some(c=>Math.abs(x-c.x)<c.w/2+.3&&Math.abs(z-c.z)<c.d/2+.3);
 for(let m=0;m<1440;m++)for(const n of ['Barfly','Thao']){const job=izakayaJob(n,m);if(job)assert.equal(hit(job.at),false,n+' at '+job.at+' ('+job.activity+')');}
});
test('the line at the door says who is there',()=>{
 assert.match(closedGreeting(200),/Thao and the Barfly/);assert.match(closedGreeting(400),/asleep/);assert.match(closedGreeting(700),/cleaning/);
});
