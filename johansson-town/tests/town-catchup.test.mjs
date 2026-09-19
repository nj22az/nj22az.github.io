import test from 'node:test';
import assert from 'node:assert/strict';
import {createTownCatchup,pendingTownAbsence} from '../src/people/town-absence.js';
import {createActivities} from '../activities.js';
import {installDOM} from './fixtures.mjs';
import {SAVE_KEY} from '../src/save.js';

test('a full day yields between bounded batches without losing simulation time',()=>{
 let total=0,batches=0;const steps=[];
 const job=createTownCatchup({advance:dt=>{total+=dt;steps.push(dt);},now:()=>0});
 job.add(1440);assert.equal(total,0,'Queuing must not block startup');
 while(job.pending){assert.ok(job.tick()<=40);batches++;}
 assert.ok(batches>=180);assert.ok(Math.abs(total-1440)<1e-6);assert.ok(steps.every(dt=>dt>0&&dt<=.2));
});
test('expensive simulation yields at the time budget and resumes the exact remainder',()=>{
 let clock=0,total=0,saved;const job=createTownCatchup({now:()=>clock,advance:(dt,pending)=>{clock+=3;total+=dt;saved={savedAt:1000,pendingTownMinutes:pending};}});
 job.add(10);assert.equal(job.tick(),2);assert.ok(Math.abs(total-.4)<1e-6);
 assert.equal(pendingTownAbsence(saved,3000),job.pending+2);
 job.add(2);while(job.pending)job.tick();assert.ok(Math.abs(total-12)<1e-6);
});
test('corrupt saves and repeated long absences remain bounded',()=>{
 assert.equal(pendingTownAbsence({savedAt:1000,pendingTownMinutes:Infinity},2000),1);
 assert.equal(pendingTownAbsence({savedAt:1000,pendingTownMinutes:-10},2000),1);
 assert.equal(pendingTownAbsence({savedAt:1000,pendingTownMinutes:1440},2000),1440);
 const job=createTownCatchup({advance(){}});job.add(NaN);job.add(-1);assert.equal(job.pending,0);job.add(3000);assert.equal(job.pending,1440);
});

test('an interrupted batch survives the actual save and reload path',()=>{
 const dom=installDOM({[SAVE_KEY]:JSON.stringify({minutes:600,savedAt:Date.now(),pendingTownMinutes:27.5})});
 let minutes=600;const options={say(){},onWeather(){},onTime(){},getMinutes:()=>minutes};
 const first=createActivities(options),initial=first.takeAbsence();assert.ok(initial>=27.5&&initial<28.5);
 const job=createTownCatchup({now:()=>0,maxSteps:5,advance:(dt,pending)=>{minutes+=dt;first.state.pendingTownMinutes=pending;}});
 job.add(initial);job.tick();first.save();assert.ok(Math.abs(JSON.parse(dom.storage.get(SAVE_KEY)).pendingTownMinutes-(initial-1))<1e-6);
 const resumed=createActivities(options),remaining=resumed.takeAbsence();assert.ok(remaining>=initial-1&&remaining<initial);assert.equal(resumed.takeAbsence(),0);
});
