import {test} from 'node:test';
import assert from 'node:assert/strict';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {izakayaPlot,IZAKAYA_DOOR} from '../src/world/dining-layout.js';
import {residentPlan,thuanAtMinato,izakayaOpen,THUAN_BUS_MARGIN,thuanAfternoon,THUAN_WALK_START,THUAN_WALK_END} from '../src/people/social.js';
import {departureFor} from '../src/people/commuter-schedule.js';
import {installDOM} from './fixtures.mjs';
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

  // The single evening service leaves time for Minato and the walk to the stop.
  const last=departureFor(THUAN,false);
  assert.equal(last,1320,'She uses the shared evening service');
  assert.equal(plan(1260).place,'izakaya','There is no extra nine o’clock bus');
  assert.equal(plan(last-THUAN_BUS_MARGIN-1).place,'izakaya');
  const leaving=plan(last-THUAN_BUS_MARGIN);
  assert.equal(leaving.place,'bus');
  assert.deepEqual(leaving.target,BUS_STATION.queue);
  assert.equal(plan(last-1).place,'bus','She is still drinking when her bus goes');
  // Rain changes her evening activity, not the bus schedule.
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
  // The pace has to survive into the plan, or the leisurely legs are walked at the
  // town's errand speed and the unhurried cycle her model carries never plays at all.
  // The legs whose point is getting somewhere keep the ordinary pace: see the walk to
  // the bench, which is twenty-seven metres out and round.
  const strolling=legs.filter(leg=>leg.place==='stroll'||leg.place==='park');
  assert.ok(strolling.length,'No leisurely legs at all');
  for(const leg of strolling)assert.ok(leg.pace>0&&leg.pace<1,leg.activity+' is planned at '+leg.pace+' m/s');
  assert.equal(plan(THUAN_WALK_END-3).pace,strolling.at(-1).pace,'The pace is dropped on the way to the plan');
  for(const leg of legs.filter(l=>l.place==='nap'))assert.equal(leg.pace,undefined,leg.activity+' dawdles on the way there');
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
  // Out to the shared ten o'clock service.
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

test('her break allows enough time to walk to the places it sends her',async()=>{
 installDOM();globalThis.self=globalThis;
 configureTownMode(TOWN_MODES.PENINSULA);izakayaPlot();
 try{
  const THREE=await import('../vendor/three.module.js');
  const {createTown}=await import('../src/world/town.js');
  const {createBusinesses}=await import('../src/world/businesses.js');
  const {createNavigation}=await import('../src/people/navmesh.js');
  const {routeAt}=await import('../src/world/layout.js?break-pace');
  const {circleHitsRect}=await import('../physics.js');
  const sites=createBusinesses().filter(s=>['market','frontrow'].includes(s.id));
  const world=createTown({scene:new THREE.Scene(),sites,townMode:'peninsula',mobile:false,
   shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
  const nav=createNavigation((x,z,r=.32)=>!routeAt(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c)));

  // The clock runs at a minute a second and this town is twenty-seven metres wide at
  // the back, so a leg's length in minutes has to cover its walk in metres at its own
  // pace. Setting the first leg of her break to a stroll is what sent her round the
  // back at 0.72 m/s with twelve minutes to do a thirty-seven minute walk: she reached
  // the bench after her own nap had ended, and never slept at all.
  const market=sites.find(s=>s.id==='market');
  let from={x:market.door[0],z:market.door[2]};
  let clock=THUAN_WALK_START;
  const short=[];
  for(let m=THUAN_WALK_START;m<THUAN_WALK_END;m++){
   const leg=thuanAfternoon(THUAN,m,false);
   if(!leg||leg.until<=clock)continue;
   const to={x:leg.target[0],z:leg.target[1]};
   const path=nav.path(from,to);
   let metres=0;
   for(let i=1;i<path.length;i++)metres+=Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]);
   const pace=leg.pace||1.25,needs=metres/pace,has=leg.until-clock;
   // Only the legs whose point is arriving somewhere: a stroll that ends where it was
   // going to end anyway is allowed to run out of minutes on the way.
   if(leg.place==='nap'&&needs>has)short.push(leg.activity+': '+has+' min for a '+needs.toFixed(0)+' min walk');
   from=to;clock=leg.until;
  }
  assert.deepEqual(short,[],'A leg of her break is shorter than the walk it asks for');
 }finally{configureTownMode(TOWN_MODES.LEGACY);izakayaPlot();}
});
