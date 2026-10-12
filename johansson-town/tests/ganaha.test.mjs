// Ms Ganaha at the Port Terminal's ticket window, the island's guide (src/people/ganaha.js, the studio's
// town-studio/island-guide/plan.md), batch 1: her look, her hours, her place behind the glass, and the next boat.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
installDOM();globalThis.self=globalThis;
const {GANAHA,ganahaAtWindow,nextBoatLine,ganahaGreeting}=await import('../src/people/ganaha.js');
const {CROSSING_MINUTES,HARBOUR_LINE}=await import('../src/people/commuter-schedule.js');
const {AIRPORT_FERRY}=await import('../src/world/airport-ferry.js');
const {FERRY_FARE}=await import('../src/island/services.js');
const {recipeFor,CREW_LOOKS}=await import('../src/avatars/cast.js');
const {buildPortHall}=await import('../src/world/interiors/port-hall.js');
const {FURNITURE_HEIGHTS}=await import('../src/world/furniture-standards.js');
const {createActivities}=await import('../activities.js');

test('she keeps the window from noon to 22:15, and says the timetable the terminal posts', () => {
 assert.deepEqual([11*60+59,12*60,22*60+14,22*60+15,3*60].map(ganahaAtWindow),[false,true,true,false,false]);
 assert.equal(CROSSING_MINUTES,AIRPORT_FERRY.duration,'the posted crossing is the ship\'s own');
 const noon=nextBoatLine(12*60);
 assert.match(noon,new RegExp(`${CROSSING_MINUTES} minutes across`));assert.match(noon,/due at 14:30/);
 assert.match(noon,FERRY_FARE?new RegExp('¥'+FERRY_FARE):/no fare this season/);
 assert.match(nextBoatLine(HARBOUR_LINE[1]+5),/alongside now, until 14:45/);
 assert.match(nextBoatLine(21*60+20),/due in 40 minutes/);
 for(const t of [12*60,15*60,20*60])assert.match(ganahaGreeting(t),/Where are you off to\?/);
});

test('she is drawn, in the terminal\'s vest', () => {
 const r=recipeFor(GANAHA.name);
 assert.ok(CREW_LOOKS[GANAHA.name]);assert.equal(r.outfit.top,'vest');assert.equal(r.outfit.topColour,'#b4583c');assert.equal(r.body.silhouette,'feminine');
});

test('her half of the counter is open for her knees, and she is there only in her hours', () => {
 const spots=[],room=new THREE.Group();
 const layout=buildPortHall({room,reg:(o,label)=>spots.push({o,label}),action(){},collider(){}});
 room.updateMatrixWorld(true);
 const box=n=>new THREE.Box3().setFromObject(room.getObjectByName(n));
 const counter=box('Ticket counter'),seat=box('Clerk chair seat'),screen=box('Counter screen'),top=box('Ticket counter top');
 assert.ok(seat.max.z<screen.min.z,'her chair is behind the glass');
 // Seated, her knees reach about 0.45 m forward of the seat's centre, under the counter top, short of its body.
 const knees=(seat.min.z+seat.max.z)/2+.45;
 assert.ok(knees<counter.min.z,`knees at ${knees.toFixed(2)} clear the counter body at ${counter.min.z.toFixed(2)}`);
 assert.ok(top.min.z<knees,'and are under the top');
 assert.ok(Math.abs(seat.max.y-FURNITURE_HEIGHTS.seat)<.01,'an ordinary chair at seat height');
 assert.ok(box('Clerk chair back').min.z>-3.5,'her chair\'s back clears the wall');
 const talk=spots.find(s=>s.label==='Talk to Ms Ganaha');assert.ok(talk);
 layout.tick(0,9*60);assert.equal(layout.clerk.visible,false);assert.equal(talk.o.visible,false);assert.equal(room.getObjectByName('Window closed plate').visible,true);
 layout.tick(0,13*60);assert.equal(layout.clerk.visible,true);assert.equal(talk.o.visible,true);assert.equal(room.getObjectByName('Window closed plate').visible,false);
});

test('talking to her: the next boat, and a ticket from her window', () => {
 const dom=installDOM({});let minutes=13*60,bought=0;
 const acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>minutes});
 acts.action('ganaha',GANAHA.name,{buy:()=>bought++});
 assert.deepEqual(dom.labels(),['When is the next boat?','A return to Kitano-jima, please','Goodbye']);
 dom.button('When is the next boat?');
 assert.match(document.querySelector('#activityBody').children[0].textContent,/due at 14:30/);
 dom.button('A return to Kitano-jima, please');assert.equal(bought,1);
});
