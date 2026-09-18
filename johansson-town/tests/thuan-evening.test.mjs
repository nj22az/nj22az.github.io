import {test} from 'node:test';
import assert from 'node:assert/strict';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {izakayaPlot,IZAKAYA_DOOR} from '../src/world/dining-layout.js';
import {residentPlan,thuanAtMinato,izakayaOpen,THUAN_BUS_MARGIN} from '../src/people/social.js';
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
