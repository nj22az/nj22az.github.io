import test from 'node:test';
import assert from 'node:assert/strict';
import {createSession,KEY} from './session.mjs';
const storage=()=>{const data=new Map();return {data,getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};
test('all nine steps, autorange, save/resume and independent course keys',()=>{
 const db=storage();db.setItem('sjoskolan-multimeter-v1','weekly');db.setItem('johansson-town-avatar','town');
 const s=createSession(db),set=(key,value)=>assert.equal(s.change(key,value),'');
 set('mode','dc');set('red','Ref+');set('black','Ref−');assert.equal(s.check(),true);s.next();
 set('link',false);set('red','A');set('black','B');assert.equal(s.check(),true);s.next();
 set('mode','ohm');assert.equal(s.reading().text,'961,8');assert.equal(s.check(),true);s.next();
 set('red','B');set('black','N');assert.equal(s.check(),true);s.next();
 set('mode','dc');set('link',true);set('red','P');set('black','N');set('power',true);assert.equal(s.check(),true);s.next();
 set('red','A');set('black','B');assert.equal(s.check(),true);s.next();set('red','B');set('black','N');assert.equal(s.check(),true);s.next();
 assert.match(s.change('jack','ma'),/Bryt/);set('power',false);set('link',false);set('mode','current');set('jack','ma');set('red','P');set('black','A');set('power',true);assert.equal(s.check(),true);s.next();
 set('power',false);set('jack','v');set('link',true);set('mode','dc');set('red','Ref+');set('black','Ref−');assert.equal(s.check(),true);assert.equal(s.progress.done,true);
 assert.equal(s.progress.records.length,9);assert.deepEqual(createSession(db).progress,s.progress);
 assert.equal(db.getItem('sjoskolan-multimeter-v1'),'weekly');assert.equal(db.getItem('johansson-town-avatar'),'town');
 s.restart();assert.equal(s.progress.records.length,9);assert.equal(s.progress.done,false);
});
test('blocked/malformed storage, rejected values and protection reset',()=>{
 const bad={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};const s=createSession(bad);assert.equal(s.storageOK,false);
 assert.ok(s.change('rig',99));assert.ok(s.change('red','unsafe'));assert.ok(s.change('mode','invalid'));
 s.change('mode','current');s.change('jack','ma');s.change('red','Ref+');s.change('black','Ref−');assert.ok(s.state.trip);assert.ok(s.resetProtection());s.change('red',null);s.change('black',null);assert.equal(s.resetProtection(),'');
 const db=storage();db.setItem(KEY,'{"stage":999,"records":[null]}');assert.equal(createSession(db).progress.stage,8);
});
