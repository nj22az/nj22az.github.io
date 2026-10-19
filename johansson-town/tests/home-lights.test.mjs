import test from 'node:test';
import assert from 'node:assert/strict';
import {createHomeLights,routineLit,residentUpAtHome,HOME_ROUTINES} from '../src/world/home-lights.js';
import {homeLightLevel} from '../src/render/window-interior.js';

const H=(h,m=0)=>h*60+m,day=1440;
const person=(name,flags,profile={})=>({profile:{name,start:540,retire:1410,...profile},g:{userData:flags}});

test('Kitahama’s windows follow the people who live there',()=>{
 let people=[];
 const lights=createHomeLights({people:()=>people});
 const slot=id=>lights.homes.find(h=>h.id===id).slot;
 // Chin home and up at nine in the evening: 1 Kitahama is lit; everybody out, or asleep, it is dark. Thuan lives on
 // Kitano-jima (phase 3): her being in somebody's house lights nothing here.
 people=[person('Chin',{indoors:'home'},{start:365,retire:1340}),person('Thao',{},{start:960,retire:1620})];
 lights.update(3*day+H(21));assert.equal(homeLightLevel(slot('kitahama-1')),1);
 people=[person('Chin',{}),person('Thao',{}),person('Thuan',{indoors:'home'})];
 lights.update(3*day+H(21,5));assert.equal(homeLightLevel(slot('kitahama-1')),0,'nobody home, the light is off');
 people=[person('Chin',{indoors:'home',sleeping:true})];
 lights.update(3*day+H(23,50));assert.equal(homeLightLevel(slot('kitahama-1')),0,'asleep, the light is off');
 // Thao comes in from the izakaya at three and is up for a while; Thuan is asleep.
 assert.ok(residentUpAtHome(person('Thao',{indoors:'home'},{start:960,retire:1620}),H(2,30)));
 assert.ok(!residentUpAtHome(person('Thao',{indoors:'home'},{start:960,retire:1620}),H(5)));
 // The grandparents are in bed by half past eight; Mr Iha is up past eleven.
 lights.update(4*day+H(22));
 assert.equal(homeLightLevel(slot('kitahama-6')),0);assert.ok(!lights.homes.some(h=>h.id==='kitahama-11'));
 // Chinen's house is in bed by nine; Ms Ganaha's is lit until she is home from the last boat's window.
 assert.equal(homeLightLevel(slot('kitahama-5')),0);assert.equal(homeLightLevel(slot('kitahama-flat-4')),1);
 // The Heights' two houses are lit one by one: Mac has turned in for the generators.
 assert.equal(homeLightLevel(slot('kitahama-flat-3')),0,'Mac has retired for the night');assert.ok(!lights.homes.some(h=>/^flat-|kitahama-flat-[12]$/.test(h.id)),'no flat of the old block has a light');
 lights.update(4*day+H(20));assert.equal(homeLightLevel(slot('kitahama-5')),1,'Chinen’s occupied home lights in the evening');assert.equal(homeLightLevel(slot('kitahama-flat-3')),1,'Mac’s house is lit at eight');
 // 3 Kitahama: Kōji and Riku's routine lights it while Nhung is still at the bookshop, and Nhung lights it herself after their bedtime.
 people=[person('Nhung',{})];lights.update(4*day+H(19));assert.equal(homeLightLevel(slot('kitahama-3')),1,'the household’s routine lights 3 Kitahama');
 people=[person('Nhung',{indoors:'home'},{start:540,retire:1320})];lights.update(4*day+H(21,45));assert.equal(homeLightLevel(slot('kitahama-3')),1,'Nhung up at home lights it after Kōji’s bedtime');
 people=[person('Nhung',{})];lights.update(4*day+H(21,45));assert.equal(homeLightLevel(slot('kitahama-3')),0);
});

test('the ferry deckhand is away every other week, and the nurse is called out some nights',()=>{
 const uezu=HOME_ROUTINES['kitahama-8'];
 assert.notEqual(routineLit(uezu,0*day+H(21)),routineLit(uezu,7*day+H(21)));
 const chinen=HOME_ROUTINES['kitahama-7'];
 assert.equal(routineLit(chinen,1*day+H(2,20)),true);assert.equal(routineLit(chinen,2*day+H(2,20)),false);
});
