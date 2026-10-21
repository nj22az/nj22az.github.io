import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {harbourTimetable,HARBOUR_LINE,serviceTime} from '../src/people/commuter-schedule.js';
import {PORT_TIMETABLE_POSTER} from '../src/world/port-building.js';
import {NEIGHBOURS} from '../src/people/neighbours.js';

const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('every timetable describes fixed Harbour Line departures with a separate quick crossing',()=>{
 const office=harbourTimetable(480);assert.match(office,/Fixed Harbour Line/);assert.match(office,/Minato Maru/);
 for(const t of HARBOUR_LINE)assert.ok(office.includes(serviceTime(t)));
 assert.ok(PORT_TIMETABLE_POSTER.some(l=>/Fixed Harbour Line/.test(l)));
 assert.doesNotMatch(PORT_TIMETABLE_POSTER.join(' '),/on request/i);
 const menu=source('src/island/play.js');assert.match(menu,/Passengers ride the upper deck/);
 assert.doesNotMatch(source('src/world/interiors/port-hall.js'),/'KITANO-JIMA','On request'/);
 assert.doesNotMatch(source('src/people/izakaya-play.js'),/goes on request/);
});

test('Vy lives on Minato and school absence is scheduled without a fictitious ferry commute',()=>{
 const vy=NEIGHBOURS.find(n=>n.name==='Vy');assert.ok(vy);
 for(const role of [vy.role,...vy.routine.map(r=>r.role)])assert.doesNotMatch(role,/\b(bus|ferry)\b/,'Vy: '+role);
 assert.ok(vy.routine.some(r=>r.away&&r.role==='at school'));
 assert.ok(vy.routine.some(r=>r.home&&/1 Kitahama/.test(r.role)));
});

test('Okinawa runs at 60 hertz: the power house’s needles and the ferry’s shore supply agree',async()=>{
 assert.doesNotMatch(source('src/world/school.js'),/50 cycles/);assert.match(source('src/world/school.js'),/60 cycles/);
 const {FERRY_ELECTRICS}=await import('../src/world/ferry-ship.js');
 for(const part of [FERRY_ELECTRICS,FERRY_ELECTRICS.generators,FERRY_ELECTRICS.emergency,FERRY_ELECTRICS.shore])assert.equal(part.hz,60);
});
