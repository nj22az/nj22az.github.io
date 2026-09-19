import {test} from 'node:test';
import assert from 'node:assert/strict';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {izakayaPlot,IZAKAYA_DOOR} from '../src/world/dining-layout.js';
import {residentPlan,thuanAtMinato,izakayaOpen,THUAN_BUS_MARGIN,thuanAfternoon,THUAN_WALK_START,THUAN_WALK_END} from '../src/people/social.js';
import {departureFor} from '../src/people/commuter-schedule.js';
import {STAFF_BENCH} from '../src/world/staff-bench.js';
import {PARK_BENCH} from '../src/world/park-layout.js';
import {EAST_LAWN} from '../src/world/east-lawn.js';
import {COMMUTER_SHIFTS} from '../src/people/commuter-schedule.js';
import {RESIDENTS} from '../src/people/residents.js';
import {BUS_STATION} from '../src/world/bus-station.js';

const THUAN=RESIDENTS.find(p=>p.name==='Thuan');
const shift=COMMUTER_SHIFTS.Thuan;
/** The commuter plan, which is the one the peninsula runs. */
const plan=minutes=>residentPlan(THUAN,minutes,false,{},true);

test('Thuan has a beer at Minato between closing the shop and the last bus',()=>{
 configureTownMode(TOWN_MODES.PENINSULA);izakayaPlot();
 try{
  // On shift she is behind her own counter.
  assert.equal(plan(shift.finish-60).place,'market');

  // The shop shuts and she goes two doors up the pavement.
  const after=plan(shift.finish+5);
  assert.equal(after.place,'izakaya');
  assert.deepEqual(after.target,IZAKAYA_DOOR,'She is sent somewhere other than the izakaya door');
  assert.match(after.activity,/beer/i);
  assert.ok(izakayaOpen(shift.finish+5),'Minato is shut when she gets there');

  // The beer is what moves her onto the ten o'clock: she measures her evening against
  // the bus she is actually going home on, not the one she is skipping.
  const last=departureFor(THUAN,false);
  assert.ok(last>shift.departure,'A beer buys her no more time than going straight home');
  assert.equal(plan(shift.departure).place,'izakaya','She left for the nine after all');
  assert.equal(plan(last-THUAN_BUS_MARGIN-1).place,'izakaya');
  const leaving=plan(last-THUAN_BUS_MARGIN);
  assert.equal(leaving.place,'bus');
  assert.deepEqual(leaving.target,BUS_STATION.queue);
  assert.equal(plan(last-1).place,'bus','She is still drinking when her bus goes');
  // and in the rain she takes the earlier one instead.
  assert.equal(departureFor(THUAN,true),shift.departure);

  // Rain sends her straight to the stop.
  assert.equal(residentPlan(THUAN,shift.finish+5,true,{},true).place,'bus');
  assert.equal(thuanAtMinato(THUAN,shift.finish+5,true),false);
 }finally{configureTownMode(TOWN_MODES.LEGACY);izakayaPlot();}
});

test('the beer is a commuter habit, not something bolted onto every layout',()=>{
 configureTownMode(TOWN_MODES.LEGACY);izakayaPlot();
 // The archived street has its own evening for her (alternate-day supper with Nao),
 // and it is reached through the legacy plan rather than this one.
 const legacy=residentPlan(THUAN,shift.finish+5,false,{},false);
 assert.notEqual(legacy.place,'bus','The legacy street has no commuter bus to catch');
 // Somebody without a shift is not given one.
 assert.equal(thuanAtMinato({name:'Harbour master'},shift.finish+5,false),false);
});


test('Thuan has an afternoon: the park bench, the sea wall, and back to the shop',()=>{
 configureTownMode(TOWN_MODES.PENINSULA);izakayaPlot();
 try{
  // On shift either side of it she is behind her own counter.
  assert.equal(plan(THUAN_WALK_START-5).place,'market');
  assert.equal(plan(THUAN_WALK_END+5).place,'market');

  const legs=[];
  for(let m=THUAN_WALK_START;m<THUAN_WALK_END;m++){
   const leg=thuanAfternoon(THUAN,m,false);
   assert.ok(leg,'She is back in the shop at '+m);
   if(legs.at(-1)?.activity!==leg.activity)legs.push(leg);
   assert.equal(plan(m).activity,leg.activity,'The plan disagrees with the walk at '+m);
  }
  // Round the back for a sleep first, then the park and the sea wall.
  assert.equal(legs.length,5,'The break is not five legs');
  assert.match(legs[0].activity,/back/i);
  assert.match(legs[1].activity,/asleep/i);
  assert.match(legs[2].activity,/park/i);
  assert.match(legs.at(-1).activity,/sea wall/i);
  // The pace has to survive into the plan, or the break is walked at the town's
  // errand speed and the unhurried cycle her model carries never plays at all.
  for(const m of [THUAN_WALK_START+2,THUAN_WALK_START+50,THUAN_WALK_END-3]){
   const walking=plan(m);
   assert.ok(walking.pace>0&&walking.pace<1,'The break is planned at '+walking.pace+' m/s');
  }
  assert.equal(plan(THUAN_WALK_START-5).pace,undefined,'A working shift is not a stroll');

  // The nap happens on the bench behind the shop, not in the middle of the yard.
  const nap=legs.filter(leg=>leg.place==='nap');
  assert.equal(nap.length,2,'The nap is not its own place');
  for(const leg of nap)assert.deepEqual([...leg.target],[...STAFF_BENCH.stand],'She naps somewhere other than the bench');

  // She goes to the park bench itself, not to the middle of the lawn.
  assert.deepEqual(legs[2].target,[PARK_BENCH.stand[0],PARK_BENCH.stand[2]]);
  // Only the legs where she has arrived somewhere let the activity system stop her,
  // or she sits down on the first bench she passes and never reaches the park. The
  // nap is its own place because it has its own bench and its own pose.
  assert.deepEqual(legs.map(l=>l.place),['nap','nap','park','stroll','stroll']);
  // Everything after the nap happens out on the east green, inside it rather than out
  // over the water, and the last leg of all ends at the sea wall.
  for(const leg of legs.slice(2)){
   const [x,z]=leg.target;
   assert.ok(x>EAST_LAWN.minX&&x<EAST_LAWN.maxX,'Off the lawn at x='+x);
   assert.ok(z>EAST_LAWN.minZ&&z<EAST_LAWN.maxZ,'Off the lawn at z='+z);
  }
  assert.ok(legs.at(-1).target[0]>EAST_LAWN.maxX-6,'The sea wall leg is nowhere near the sea wall');

  // Rain keeps her in, and nobody else gets her walk.
  assert.equal(thuanAfternoon(THUAN,THUAN_WALK_START+10,true),null);
  assert.equal(residentPlan(THUAN,THUAN_WALK_START+10,true,{},true).place,'market');
  assert.equal(thuanAfternoon({name:'Aya'},THUAN_WALK_START+10,false),null);
 }finally{configureTownMode(TOWN_MODES.LEGACY);izakayaPlot();}
});

test('the whole day runs shop, walk, shop, beer, bus without a gap',()=>{
 configureTownMode(TOWN_MODES.PENINSULA);izakayaPlot();
 try{
  const seen=[];
  // Out to the ten o'clock, which is the bus a beer at Minato puts her on.
  for(let m=510;m<1350;m+=5){const p=plan(m);if(seen.at(-1)?.place!==p.place)seen.push({m,place:p.place});}
  const order=seen.map(s=>s.place);
  // Arrives on the bus, opens up, takes her walk, comes back, has a beer, catches it.
  assert.deepEqual(order,['bus','market','nap','park','stroll','market','izakaya','bus','away']);
  // and every one of those is somewhere she can actually stand.
  for(const {m} of seen){const p=plan(m);assert.ok(Array.isArray(p.target)&&p.target.length===2,'No target at '+m);}
 }finally{configureTownMode(TOWN_MODES.LEGACY);izakayaPlot();}
});


test('every caller gets the same routine, however it asks',()=>{
 // The bug this guards: the shop's own "should she still be here?" check calls
 // residentPlan without naming a mode. It used to be handed the archived street's
 // routine while the schedule was handed the commuter one, so the two disagreed all
 // afternoon and the shop won — she stood at her counter through her own walk.
 configureTownMode(TOWN_MODES.PENINSULA);izakayaPlot();
 try{
  const asked=residentPlan(THUAN,THUAN_WALK_START+20,false,{},true);
  const unasked=residentPlan(THUAN,THUAN_WALK_START+20,false,{});
  assert.equal(unasked.place,asked.place,'The layout answers differently depending on who asks');
  assert.notEqual(unasked.place,'market','The shop would keep her through her own walk');
  // The same holds for the evening, which is the other thing the shop could swallow.
  assert.equal(residentPlan(THUAN,shift.finish+10,false,{}).place,'izakaya');
 }finally{configureTownMode(TOWN_MODES.LEGACY);izakayaPlot();}
 // and the archived street still gets the archived routine when nobody names a mode.
 assert.notEqual(residentPlan(THUAN,THUAN_WALK_START+20,false,{}).place,'park');
});
