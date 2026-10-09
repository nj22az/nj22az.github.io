import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {buildOnsenInterior} from '../src/world/interiors/onsen.js';
import {ONSEN_CIRCUITS,ONSEN_BOARD,AT_REST,BREAKER_CURVE,tripSeconds,switchOn,switchOff,isRunning,isWorking,isLive,isOn,
 runningLoads,runningOn,assess,advance,settle,reset,resetAll,stageScenario,ONSEN_SCENARIOS} from '../src/world/interiors/onsen-electrics.js';
import {LOBBY_CHANNELS,pinLobbyChannel,lobbyChannelPin} from '../src/world/interiors/onsen-lobby.js';
import {ONSEN_SIGNS} from '../src/world/interiors/onsen-signs.js';
import {buildParkOnsen} from '../src/world/park-onsen.js';

const build=()=>{const room=new THREE.Group(),hits=[],actions=[];const layout=buildOnsenInterior({room,reg:(o,label,fn)=>hits.push({o,label,fn}),action:(...a)=>actions.push(a),exit(){}});room.updateMatrixWorld(true);return {room,hits,actions,layout};};
const BUSY=['dryer-1','dryer-2','dryer-3','massage-chair'];
const circuit=(a,id)=>a.circuits.find(c=>c.id===id);

test('at rest the fixed loads run and the dryers and chair wait for somebody',()=>{
 stageScenario('rest');
 for(const c of ONSEN_CIRCUITS)for(const l of c.loads){
  assert.ok(l.atRest==='on'||l.atRest==='off',l.id+' says how it stands at rest');
  assert.ok(typeof l.by==='string'&&l.by.length>5,l.id+' says who switches it');
 }
 assert.deepEqual(BUSY.map(isRunning),[false,false,false,false]);
 assert.ok(AT_REST.includes('changing-pendant')&&AT_REST.includes('television')&&AT_REST.includes('circulation-pump'));
 const a=assess();assert.equal(circuit(a,'changing-sockets').amps,0);
 assert.ok(Math.abs(a.main.amps-8.91)<1e-9,'the house idles at 8.91 A: '+a.main.amps);
 assert.deepEqual(advance(3600),[],'nothing trips at rest, however long');
});

test('three dryers and the chair: 38 A trips the 20 A branch, the main sees 47 A and holds, the lights stay on',()=>{
 stageScenario('rest');
 for(const id of BUSY)assert.equal(switchOn(id),true,id);
 assert.equal(switchOn('dryer-1'),false,'already on');
 const a=assess(),sockets=circuit(a,'changing-sockets');
 assert.equal(sockets.demand,38);assert.equal(sockets.amps,38);assert.equal(sockets.rating,20);assert.ok(sockets.over);
 assert.equal(Math.round(a.main.amps),47,'the main sees the whole house');assert.equal(a.main.rating,60);assert.ok(!a.main.over);
 assert.equal(a.main.tripIn,Infinity,'the main never trips at 47 A');
 // A thermal breaker: it roars for a while first (inside JIS: under two minutes at 190 %).
 const t=sockets.tripIn;assert.ok(t>5&&t<120,'trips in '+t.toFixed(1)+' s');
 assert.deepEqual(advance(t*.5),[]);assert.equal(isLive('changing-sockets'),true,'still up halfway');
 assert.deepEqual(advance(t*.6),['changing-sockets'],'CLICK');
 assert.equal(isOn('changing-sockets'),false);assert.equal(isOn('main'),true,'the main holds');
 for(const id of BUSY){assert.equal(isRunning(id),true,id+' still switched on');assert.equal(isWorking(id),false,id+' dead');}
 for(const id of ['changing-pendant','bath-lamp-west','bath-lamp-east','lobby-lamp','andon','television','milk-cooler','circulation-pump'])assert.equal(isWorking(id),true,id+' unaffected');
 assert.ok(Math.abs(assess().main.amps-8.91)<1e-9,'after the trip the main carries the rest of the house');
 // Reset with everything still switched on, and it goes again (page 4: "Who switched on last?!").
 reset('changing-sockets');assert.equal(isLive('changing-sockets'),true);
 assert.deepEqual(settle(),['changing-sockets']);
 // Switch one dryer off and the branch holds: 26 A is still too much, two dryers off is fine.
 reset('changing-sockets');switchOff('dryer-3');assert.equal(circuit(assess(),'changing-sockets').amps,26);assert.deepEqual(settle(),['changing-sockets'],'26 A on 20 A still trips, just later');
 reset('changing-sockets');switchOff('dryer-1');assert.equal(circuit(assess(),'changing-sockets').amps,14);assert.deepEqual(advance(7200),[],'one dryer and the chair hold all evening');
 stageScenario('rest');
});

test('the trip curve stays inside the JIS limits and never trips within the rating',()=>{
 assert.equal(tripSeconds(20,20),Infinity);assert.equal(tripSeconds(14,20),Infinity);
 assert.ok(tripSeconds(25,20)<=3600,'125 %: within 60 minutes');assert.ok(tripSeconds(40,20)<=120,'200 %: within 2 minutes');
 assert.equal(tripSeconds(200,20),0,'magnetic trip at ten times');
 let last=Infinity;for(let r=1.06;r<10;r+=.01){const t=tripSeconds(r*20,20);assert.ok(t<=last+1e-9,'more current never takes longer at '+r.toFixed(2));last=t;}
 assert.ok(BREAKER_CURVE.length>3);
});

test('the board, lamps and screen follow switches as well as breakers',()=>{
 stageScenario('rest');resetAll();const {room,layout}=build();
 const lamp=room.getObjectByName('Changing-room pendant lamp'),light=room.getObjectByName('Changing-room light');
 const lever=room.getObjectByName('Breaker lever changing-sockets'),screen=room.getObjectByName('Lobby CRT').children.find(o=>o.isMesh&&o.geometry?.type==='PlaneGeometry');
 const up=lever.rotation.x,lit=light.intensity;
 // Switching the pendant off at the wall puts it out without touching the breaker.
 switchOff('changing-pendant');assert.equal(light.intensity,0);assert.equal(lamp.material.emissiveIntensity,0);assert.equal(isLive('changing-lights'),true);
 switchOn('changing-pendant');assert.equal(light.intensity,lit);
 // The busy evening, ticked in the room: the lever drops by itself and the reset prompt appears.
 for(const id of BUSY)switchOn(id);
 let seconds=0;while(isLive('changing-sockets')&&seconds<200){layout.tick(.5,20*60);seconds+=.5;}
 assert.equal(isLive('changing-sockets'),false,'tripped in the room after '+seconds+' s');assert.ok(seconds>5,'not at once');
 assert.ok(lever.rotation.x>Math.PI/2&&up<Math.PI/2,'lever down');assert.equal(screen.visible,true,'the game stays on');assert.equal(light.intensity,lit,'the lights stay on');
 // Isolate first: the main off and the screen goes black (the dead glass shows).
 stageScenario('isolated');assert.equal(screen.visible,false);assert.ok(room.getObjectByName('Lobby CRT glass'),'a dark glass behind the picture');
 assert.equal(room.getObjectByName('Lobby light').intensity,0);
 stageScenario('rest');layout.dispose();
});

test('the film stages the story by name, and the TV can be pinned to the night game',()=>{
 for(const [name,s] of Object.entries(ONSEN_SCENARIOS)){assert.ok(s.en.length>30,name+' explains itself');for(const id of s.on)assert.ok(ONSEN_CIRCUITS.some(c=>c.loads.some(l=>l.id===id)),id);}
 let a=stageScenario('rush');
 assert.deepEqual(runningOn('changing-sockets'),BUSY);assert.equal(isLive('changing-sockets'),true,'the moment before the click');
 assert.equal(Math.round(a.main.amps),47);assert.deepEqual(advance(600),[],'held for the camera');
 a=stageScenario('busy');
 assert.equal(circuit(a,'changing-sockets').live,false);assert.equal(isOn('main'),true);assert.equal(isWorking('changing-pendant'),true);
 assert.equal(isWorking('television'),true);assert.equal(lobbyChannelPin(),'night-game','3e: the game stays on');
 assert.ok(ONSEN_SCENARIOS.busy.panels.includes('3e')&&ONSEN_SCENARIOS.rush.panels.includes('2a'));
 a=stageScenario('isolated');assert.equal(isWorking('television'),false);assert.equal(a.main.amps,0);
 stageScenario('quiet');assert.equal(circuit(assess(),'changing-sockets').amps,14);assert.deepEqual(advance(3600),[]);
 assert.throws(()=>stageScenario('typhoon'),/No such Umi-no-yu scenario/);
 stageScenario('rest');assert.equal(lobbyChannelPin(),null);assert.deepEqual(runningLoads(),AT_REST);
 // Pinned, the channel knob leaves it alone; unpinned it turns again.
 const {hits,actions,layout}=build(),knob=hits.find(h=>h.label==='Change the channel');
 pinLobbyChannel('night-game');knob.fn();assert.match(actions.at(-1)[1],/night game/i);assert.equal(layout.tv.channel,'night-game');
 assert.throws(()=>pinLobbyChannel('cartoons'),/No such channel/);
 pinLobbyChannel(null);knob.fn();assert.match(actions.at(-1)[1],/Channel 2/);
 assert.equal(LOBBY_CHANNELS[0].id,'night-game');
 layout.dispose();
});

test('the signs say it in proper Japanese, and the room paints what the data says',async()=>{
 const jp=/^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー・ ¥0-9℃\-]+$/u;
 const S=ONSEN_SIGNS;
 assert.equal(S.milk.jp,'牛乳');assert.equal(S.milk.price,'各 ¥100');assert.equal(S.noren.jp,'ゆ');assert.equal(S.kanban.jp,'海の湯');
 assert.equal(S.tv.nightGame.inning,'7回裏');assert.deepEqual(S.tv.nightGame.score,{away:2,home:3});
 for(const text of [S.milk.jp,S.milk.price,S.noren.jp,S.kanban.jp,S.notice.jp,S.bathBoard.jp,...S.fee.lines,...S.dailyBath,S.poster.title,S.poster.line,S.tv.nightGame.inning,S.tv.weather.title,S.tv.weather.forecast])
  assert.match(text,jp,`"${text}" is Japanese, not a translation`);
 assert.equal(S.dailyBath.length,7);
 for(const [k,v] of Object.entries(S))if(v.where)assert.ok(v.why.length>20,k+' says why');
 // Record every word painted on a canvas while the room and the front of the bathhouse are built.
 const painted=[];const ctx=new Proxy({fillText:t=>painted.push(String(t)),measureText:s=>({width:s.length*17}),createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),fillRect(){}},{get:(o,k)=>o[k]||(()=>{})});
 const saved=globalThis.document;globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx,style:{}})};
 try{
  stageScenario('busy');const {layout}=build();layout.tick(1,20*60);
  const world={group:new THREE.Group(),colliders:[]};buildParkOnsen(world,{});
  for(const word of ['牛','乳','各 ¥100','ゆ','♨ 海の湯','海の湯','本日の湯','南の島 湯めぐり','港の湯・海の湯・森の湯','大人 ¥300','タオル ¥100・牛乳 ¥100','7回裏','沖','鹿'])assert.ok(painted.includes(word),'paints '+word);
  for(const wrong of ['Cow Breasts','Yu','Sea Bath','7Back of the inning  3 - 2',"Today's hot water",'Adult ¥300'])assert.ok(!painted.includes(wrong),'no longer paints '+wrong);
  layout.dispose();
 }finally{globalThis.document=saved;stageScenario('rest');}
});
