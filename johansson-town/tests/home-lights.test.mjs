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
 // Thuan home and up at nine in the evening: her house is lit; out, or asleep, it is dark.
 people=[person('Thuan',{indoors:'home'}),person('Thao',{},{start:960,retire:1620})];
 lights.update(3*day+H(21));assert.equal(homeLightLevel(slot('kitahama-1')),1);
 people=[person('Thuan',{}),person('Thao',{})];
 lights.update(3*day+H(21,5));assert.equal(homeLightLevel(slot('kitahama-1')),0,'nobody home, the light is off');
 people=[person('Thuan',{indoors:'home',sleeping:true})];
 lights.update(3*day+H(23,50));assert.equal(homeLightLevel(slot('kitahama-1')),0,'asleep, the light is off');
 // Thao comes in from the izakaya at three and is up for a while; Thuan is asleep.
 assert.ok(residentUpAtHome(person('Thao',{indoors:'home'},{start:960,retire:1620}),H(2,30)));
 assert.ok(!residentUpAtHome(person('Thao',{indoors:'home'},{start:960,retire:1620}),H(5)));
 // The grandparents are in bed by half past eight; Mr Iha is up past eleven.
 lights.update(4*day+H(22));
 assert.equal(homeLightLevel(slot('kitahama-6')),0);assert.equal(homeLightLevel(slot('kitahama-11')),1);
 // The house to let and the empty flat never light.
 assert.equal(homeLightLevel(slot('kitahama-5')),0);assert.equal(homeLightLevel(slot('flat-4')),0);
 // The flats are lit one by one.
 assert.equal(homeLightLevel(slot('flat-1')),1);assert.equal(homeLightLevel(slot('flat-3')),0,'Mr Fujita is in his shed');
});

test('the ferry deckhand is away every other week, and the nurse is called out some nights',()=>{
 const uezu=HOME_ROUTINES['kitahama-8'];
 assert.notEqual(routineLit(uezu,0*day+H(21)),routineLit(uezu,7*day+H(21)));
 const chinen=HOME_ROUTINES['kitahama-7'];
 assert.equal(routineLit(chinen,1*day+H(2,20)),true);assert.equal(routineLit(chinen,2*day+H(2,20)),false);
});
