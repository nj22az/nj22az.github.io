import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {harbourTimetable,HARBOUR_LINE,serviceTime} from '../src/people/commuter-schedule.js';
import {PORT_TIMETABLE_POSTER} from '../src/world/port-building.js';
import {NEIGHBOURS} from '../src/people/neighbours.js';

const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('every timetable in town tells the same service: on request, with the commuter boats at the Harbour Line’s times',()=>{
 const office=harbourTimetable(8*60);
 assert.match(office,/on request/i);assert.match(office,/Minato Maru/);
 for(const s of HARBOUR_LINE)assert.ok(office.includes(serviceTime(s)),'the harbour office reads '+serviceTime(s));
 assert.doesNotMatch(office,/Three sailings daily/,'no fixed three-sailing timetable the ferry does not keep');
 assert.ok(PORT_TIMETABLE_POSTER.some(l=>/on request/i.test(l)),'the poster under the canopy says on request');
 const times=PORT_TIMETABLE_POSTER.join(' ');for(const s of HARBOUR_LINE){const [h,m]=serviceTime(s).split(':');assert.ok(times.includes(Number(h)+':'+m),'the poster lists '+serviceTime(s));}
 // The board in the hall, the boarding menu and the ticket clerk on the telephone.
 assert.match(source('src/world/interiors/port-hall.js'),/'KITANO-JIMA','On request'/);
 const menu=source('src/island/play.js');assert.match(menu,/on request/);assert.match(menu,/Passengers ride the upper deck/);assert.doesNotMatch(menu,/share the open deck/);
 assert.match(source('src/people/izakaya-play.js'),/goes on request/);
});

test('nobody waits for a bus that does not run: Vy waits for the ferry',()=>{
 const vy=NEIGHBOURS.find(n=>n.name==='Vy');assert.ok(vy);
 for(const role of [vy.role,...vy.routine.map(r=>r.role)])assert.doesNotMatch(role,/\bbus\b/,'Vy: '+role);
 assert.ok(vy.routine.some(r=>/ferry to school/.test(r.role))&&vy.routine.some(r=>/ferry home/.test(r.role)));
});

test('Okinawa runs at 60 hertz: the power house’s needles and the ferry’s shore supply agree',async()=>{
 assert.doesNotMatch(source('src/world/school.js'),/50 cycles/);assert.match(source('src/world/school.js'),/60 cycles/);
 const {FERRY_ELECTRICS}=await import('../src/world/ferry-ship.js');
 for(const part of [FERRY_ELECTRICS,FERRY_ELECTRICS.generators,FERRY_ELECTRICS.emergency,FERRY_ELECTRICS.shore])assert.equal(part.hz,60);
});
