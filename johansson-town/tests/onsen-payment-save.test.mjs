import test from 'node:test';
import assert from 'node:assert/strict';
import {installDOM} from './fixtures.mjs';
import {SAVE_KEY} from '../src/save.js';

test('paid bath admission survives reload for the same day and expires next day',async()=>{
 const day=20719;let minutes=day*1440+1200;
 installDOM({[SAVE_KEY]:JSON.stringify({yen:900,onsenPaidDay:day})});
 const {createActivities}=await import('../activities.js?onsen-payment-reload');
 const a=createActivities({say(){},onTime(){},onWeather(){},getMinutes:()=>minutes});
 assert.equal(a.onsenPaid(),true,'a paid admission must survive a reload');
 assert.equal(a.state.yen,900);
 minutes+=1440;assert.equal(a.onsenPaid(),false,'yesterday’s admission must expire');
});

test('invalid bath admission days cannot count as payment',async()=>{
 for(const [i,paid] of [-1,20719.5,'20719',null].entries()){
  installDOM({[SAVE_KEY]:JSON.stringify({yen:900,onsenPaidDay:paid})});
  const {createActivities}=await import('../activities.js?onsen-invalid='+i);
  const a=createActivities({say(){},onTime(){},onWeather(){},getMinutes:()=>20719*1440+1200});
  assert.equal(a.onsenPaid(),false);assert.equal(a.state.onsenPaidDay,undefined);
 }
});
