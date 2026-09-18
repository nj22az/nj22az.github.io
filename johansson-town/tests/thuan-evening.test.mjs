import {test} from 'node:test';
import assert from 'node:assert/strict';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {izakayaPlot,IZAKAYA_DOOR} from '../src/world/dining-layout.js';
import {residentPlan,thuanAtMinato,izakayaOpen,THUAN_BUS_MARGIN,thuanAfternoon,THUAN_WALK_START,THUAN_WALK_END} from '../src/people/social.js';
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

  // She leaves herself time to walk up, and she does not miss the bus.
  assert.equal(plan(shift.departure-THUAN_BUS_MARGIN-1).place,'izakaya');
  const leaving=plan(shift.departure-THUAN_BUS_MARGIN);
  assert.equal(leaving.place,'bus');
  assert.deepEqual(leaving.target,BUS_STATION.queue);
  assert.equal(plan(shift.departure-1).place,'bus','She is still drinking when her bus goes');

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
  assert.equal(legs.length,4,'The walk is not four legs');
  assert.match(legs[0].activity,/park/i);
  assert.match(legs[3].activity,/sea wall/i);

  // She goes to the park bench itself, not to the middle of the lawn.
  assert.deepEqual(legs[0].target,[PARK_BENCH.stand[0],PARK_BENCH.stand[2]]);
  // Only the legs where she has arrived somewhere let the activity system stop her,
  // or she sits down on the first bench she passes and never reaches the park.
  assert.deepEqual(legs.map(l=>l.place),['park','stroll','park','stroll']);
  // and the sea wall legs are on the lawn, inside it, not out over the water.
  for(const leg of legs.slice(2)){
   const [x,z]=leg.target;
   assert.ok(x>EAST_LAWN.minX&&x<EAST_LAWN.maxX,'Off the lawn at x='+x);
   assert.ok(z>EAST_LAWN.minZ&&z<EAST_LAWN.maxZ,'Off the lawn at z='+z);
   assert.ok(x>EAST_LAWN.maxX-6,'The sea wall leg is nowhere near the sea wall');
  }

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
  for(let m=510;m<1290;m+=5){const p=plan(m);if(seen.at(-1)?.place!==p.place)seen.push({m,place:p.place});}
  const order=seen.map(s=>s.place);
  // Arrives on the bus, opens up, takes her walk, comes back, has a beer, catches it.
  assert.deepEqual(order,['bus','market','park','stroll','park','stroll','market','izakaya','bus','away']);
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
