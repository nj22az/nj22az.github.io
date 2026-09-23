import test from 'node:test';
import assert from 'node:assert/strict';
import {realTownMinutes,townCalendar,clockCatchUp,townClockLine} from '../src/town-clock.js';
import {readPlayers,addPlayer,switchPlayer,renamePlayer,readSave,slotKey,SAVE_KEY,DEFAULT_PLAYER} from '../src/save.js';
import {installDOM} from './fixtures.mjs';

test('the town clock is the device clock, on today’s date in 1997',()=>{
 const now=new Date(2026,8,23,14,7,30);
 const m=realTownMinutes(now);
 assert.equal(Math.floor(((m%1440)+1440)%1440),14*60+7,'The hour and minute are not the local ones');
 assert.equal(Math.floor(realTownMinutes(new Date(2026,8,24,0,0,1))/1440)-Math.floor(m/1440),1,'The day does not turn over at local midnight');
 const cal=townCalendar(now);
 assert.equal(cal.date.getFullYear(),1997);assert.equal(cal.date.getMonth(),8);assert.equal(cal.date.getDate(),23);
 assert.equal(cal.weekday,new Date(1997,8,23).getDay(),'The weekday is not 1997’s');
 assert.equal(townCalendar(new Date(2028,1,29)).date.getDate(),28,'29 February has nowhere to go in 1997');
 assert.match(townClockLine(now),/^14:07 · .*1997$/);
});

test('coming back fast-forwards up to a day; older or old-format saves open at now',()=>{
 const now=new Date(2026,8,23,12,0),real=realTownMinutes(now);
 assert.deepEqual(clockCatchUp(real-90,now),{start:real-90,fastForward:90});
 assert.deepEqual(clockCatchUp(real-3000,now),{start:real,fastForward:0});
 assert.deepEqual(clockCatchUp(1002,now),{start:real,fastForward:0},'A save from the old fast clock');
 assert.deepEqual(clockCatchUp(undefined,now),{start:real,fastForward:0});
 assert.deepEqual(clockCatchUp(real-2,now),{start:real,fastForward:0},'Two minutes is not worth replaying');
});

test('local players each keep their own save; the first keeps the original slot',()=>{
 const store=new Map(),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
 store.set(SAVE_KEY,JSON.stringify({yen:500,visited:[]}));
 assert.equal(readPlayers(storage).active,DEFAULT_PLAYER.id);
 assert.equal(readSave(storage).yen,500,'Existing progress is not the first player’s');
 const id=addPlayer(storage,'Nils <b>');
 assert.equal(readPlayers(storage).active,id);assert.equal(readPlayers(storage).players.find(p=>p.id===id).name,'Nils b');
 assert.equal(readSave(storage),null,'A new player starts with somebody else’s progress');
 store.set(slotKey(id),JSON.stringify({yen:42,visited:[]}));assert.equal(readSave(storage).yen,42);
 assert.ok(renamePlayer(storage,'Nils'));assert.equal(readPlayers(storage).players.find(p=>p.id===id).name,'Nils');
 assert.ok(switchPlayer(storage,DEFAULT_PLAYER.id));assert.equal(readSave(storage).yen,500);
 assert.equal(switchPlayer(storage,'nobody'),false);
});

test('activities save into the active player’s slot and offer the player menu',async()=>{
 const dom=installDOM();
 const {createActivities}=await import('../activities.js?players=1');
 addPlayer(localStorage,'Aya');
 const acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>1002,getSocialContext:()=>({})});
 acts.state.yen=777;acts.save();
 const slot=slotKey(readPlayers(localStorage).active);
 assert.notEqual(slot,SAVE_KEY);assert.equal(JSON.parse(localStorage.getItem(slot)).yen,777);
 acts.players();assert.ok(dom.has('Save now'));assert.ok(dom.labels().some(l=>l.startsWith('Switch to Visitor')));
 assert.ok(dom.has('Export save file')&&dom.has('Import save file')&&dom.has('New player'));
});
