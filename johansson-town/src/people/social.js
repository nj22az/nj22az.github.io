import {marketVisitsForDay,RAMEN_VISITS,marketVisitPurpose} from './market-visits.js';
export {marketVisitsForDay,RAMEN_VISITS} from './market-visits.js';
import {DINING,IZAKAYA_DOOR} from '../world/dining-layout.js';
import {SHOP_CROSSING_Z} from '../world/main-road.js';
import {MARKET_THRESHOLD} from '../world/town-grid.js';
import {STAFF_BENCH} from '../world/staff-bench.js';
import {FULL_TOWN} from '../world/full-town-state.js';
import {PROFILES} from './profiles.js';
import {ACTIVE_RESIDENT_NAMES,RESIDENTS} from './residents.js';
import {closingStockPending,closingPreparationPending} from '../commerce/shop-stock.js';
import {BUS_STATION} from '../world/bus-station.js';
import {PARK_BENCH} from '../world/park-layout.js';
import {commuterPhase,shiftActive,shiftFor,departureFor} from './commuter-schedule.js';
import {shoppingDistrictActive,peninsulaActive} from '../world/town-mode.js';
// The live array, not a copy: the izakaya does not stand in the same place in every
// layout, and a copy taken at import time would point at the old plot forever.
export {IZAKAYA_DOOR};
export const RAMEN_DOOR=[...DINING.ramenDoor];
export const THUAN_HOME_DOOR=[...RESIDENTS.find(p=>p.name==='Thuan').home];
export const minuteOfDay=m=>((m%1440)+1440)%1440;
export const inTimeRange=(m,start,end)=>start!=null&&end!=null&&minuteOfDay(m-start)<end-start;
export const izakayaOpen=m=>inTimeRange(m,960,1620);
export const NIGHT_PATROL=[[0,28],[0,SHOP_CROSSING_Z],[0,-16],[0,-36],[0,-44],[0,-36],[0,-16],[0,SHOP_CROSSING_Z],[10,SHOP_CROSSING_Z],[0,SHOP_CROSSING_Z]];
// A repeatable visit on alternate town days, with time to lock up and walk over.
// Keep the unwrapped saved clock so revisiting or reloading never rerolls her.
export function thuanVisitsIzakaya(minutes){
 const minute=((minutes%1440)+1440)%1440,day=Math.floor(minutes/1440);
 return day%2===0&&minute>=1220&&minute<1290;
}
/**
 * Thuan's afternoon walk.
 *
 * The shop is hers and the middle of the afternoon is the quiet of it, so she puts the
 * blind down and goes out: over the road to the park, a sit on the bench above the
 * rooftops, then down the east lawn to the sea wall and along it before she walks back.
 * Every place on it is somewhere the town already had. What is new is that she goes.
 *
 * The legs are timed rather than triggered because the walking is the point and it
 * takes as long as it takes: she covers 1.25 m/s and a town minute is a second, so the
 * loop is about a hundred metres of walking and needs the ninety minutes it is given.
 *
 * Two of the legs are 'stroll' and two are 'park'. Only the first is a place the town
 * activity system will act on, and that is deliberate: on a stroll she stops at
 * whatever is nearby and uses it, which is how she ends up sitting on the park bench
 * without being told to, and also how she would end up sitting on the bench outside
 * her own shop thirty seconds after setting off. So the legs that are meant to be a
 * walk are a walk, and the legs where she has arrived somewhere worth stopping are
 * the ones that let her stop.
 */
export const THUAN_WALK_START=840,THUAN_WALK_END=930;
const PARK_STAND=[PARK_BENCH.stand[0],PARK_BENCH.stand[2]];
/**
 * The afternoon off, and the one pace in the town that is not the pace of an errand.
 *
 * pace is metres per second. At 1.25 everybody in this town crosses it at the same
 * brisk clip whatever they are doing, which is why an hour spent by the sea looked
 * like an hour spent late for something. At 0.72 she is under the handover between
 * her walk and her stroll, so the unhurried cycle her model has always carried is the
 * one that plays: see sourceGait in gait.js and the Stroll alias.
 */
const STROLLING=.72;
const BENCH_STAND=[STAFF_BENCH.stand[0],STAFF_BENCH.stand[1]];
const THUAN_WALK=Object.freeze([
 // Round the back first. The yard behind the shop is out of sight of the pavement,
 // which is the whole point of it: she has run the counter alone since nine.
 //
 // This leg keeps the town's ordinary walking pace, and it is twenty-six minutes long
 // for a twenty-two minute walk. The only door is on the street, so getting to the
 // yard is twenty-seven metres out and round -- and the clock runs at a minute a
 // second, so at a stroll that is thirty-seven minutes and she arrived after her own
 // nap had finished. She dawdles once she is somewhere, not on the way to it.
 {until:866,place:'nap',target:BENCH_STAND,activity:'going round the back for her break'},
 {until:896,place:'nap',target:BENCH_STAND,activity:'asleep on the bench behind the shop'},
 {until:912,place:'park',target:PARK_STAND,activity:'walking up to the park',pace:STROLLING},
 {until:922,place:'stroll',target:PARK_STAND,activity:'sitting in the park',pace:STROLLING},
 {until:THUAN_WALK_END,place:'stroll',target:[31.6,1.5],activity:'walking the sea wall',pace:STROLLING},
].map(Object.freeze));
/** The leg of the walk she is on, or null when she is not on it. */
export function thuanAfternoon(profile,minutes,rain=false){
 if(rain||profile?.name!=='Thuan')return null;
 const m=minuteOfDay(minutes);
 if(m<THUAN_WALK_START||m>=THUAN_WALK_END)return null;
 return THUAN_WALK.find(leg=>m<leg.until)||null;
}

/**
 * Whether Thuan is at the izakaya rather than the bus queue, on a commuter day.
 *
 * She has an hour between closing Sakura and the last Harbour Line service. She spends
 * three quarters of it two doors up the pavement and the rest walking to the stop.
 * Rain sends her straight to the bus; so does a night the izakaya is shut.
 */
export const THUAN_BUS_MARGIN=15;
export function thuanAtMinato(profile,minutes,rain=false){
 const shift=shiftFor(profile);
 if(rain||!shift||shift.permanent)return false;
 const m=minuteOfDay(minutes);
 // Against the bus she is actually going home on: staying for a beer is what moves
 // her off the nine o'clock and onto the ten, so measuring her evening against the
 // nine would send her to the queue at a quarter to, halfway down her drink.
 return izakayaOpen(m)&&inTimeRange(m,shift.finish,departureFor(profile,rain)-THUAN_BUS_MARGIN);
}
export function thuanEveningPlace(minutes){
 const m=minuteOfDay(minutes);
 if(m<1200||m>=1370)return 'home';
 if(m<1260)return Math.floor(minutes/1440)%2===0?'stroll':'ramen';
 return m<1340?'evening':'stroll';
}
export const IZAKAYA_SEATS=[[-3.8,-1.42],[-2.3,-1.42],[-.8,-1.42],[.7,-1.42],[2.2,-1.42],[-4.1,1.12],[-2.9,1.12],[2,3.08]];
export function supperGuests(minutes){
 const minute=((minutes%1440)+1440)%1440;
 if(!izakayaOpen(minutes))return [];
 return PROFILES.filter(p=>ACTIVE_RESIDENT_NAMES.includes(p.name)&&p.name!=='Nao'&&inTimeRange(minute,p.supperStart,p.supperEnd)).slice(0,IZAKAYA_SEATS.length);
}
// Overlapping, repeatable visits by the active cast. At most two seated diners;
// Thuan retains her separate after-work stop and her standing/greeting animation.
export const MARKET_VISITS=marketVisitsForDay(0);
export function visitsMarket(profile,minutes,state=null){
 const visit=marketVisitsForDay(minutes)[profile.name],account=state?.residentLife?.[profile.name],meal=account?.day===Math.floor(minutes/1440)?(marketVisitPurpose(profile.name,minutes,state||{})==='goods'?(account.shopping||account.meals?.market):account.meals?.market):null;
 if(meal?.finished)return false;
 const ordering=Number.isFinite(meal?.started)&&minutes>=meal.started&&minutes<meal.started+160&&minuteOfDay(minutes)<1200;
 return ACTIVE_RESIDENT_NAMES.includes(profile.name)&&!!visit&&(inTimeRange(minutes,...visit)||ordering);
}
export const ramenOpen=m=>inTimeRange(m,540,1260);
export function visitsRamen(profile,minutes){
 if(peninsulaActive())return false; // This layout has no ramen building to enter.
 const visit=RAMEN_VISITS[profile.name];
 return ACTIVE_RESIDENT_NAMES.includes(profile.name)&&ramenOpen(minutes)&&!!visit&&inTimeRange(minutes,...visit);
}
function legacyResidentPlan(profile,minutes,rain=false,state=null){
 const m=minuteOfDay(minutes);
 if(visitsMarket(profile,minutes,state))return {place:'market',target:MARKET_THRESHOLD,activity:'a snack at Sakura'};
 if(visitsRamen(profile,minutes))return {place:'ramen',target:RAMEN_DOOR,activity:'a bowl of ramen at Inakaya'};
 if(profile.name==='Officer Mori')return inTimeRange(m,1320,1800)?{place:'patrol',target:(FULL_TOWN.active?FULL_TOWN.patrol:NIGHT_PATROL)[0],activity:'night patrol'}:{place:'home',target:profile.home,activity:'resting after the night patrol'};
 if(profile.name==='Nao')return izakayaOpen(m)?{place:'izakaya',target:IZAKAYA_DOOR,activity:'welcoming guests'}:{place:'home',target:profile.home,activity:'going home after closing'};
 if(profile.name==='Thuan'){
  if(state?.sakura&&closingStockPending(state,minutes))return {place:'market',target:MARKET_THRESHOLD,activity:'restocking after closing'};
  if(state?.sakura&&closingPreparationPending(state,minutes))return {place:'market',target:MARKET_THRESHOLD,activity:'checking closing stock'};
  if(inTimeRange(m,profile.start-30,profile.close))return {place:'market',target:MARKET_THRESHOLD,activity:profile.role};
  if(rain||!inTimeRange(m,profile.close,profile.retire))return {place:'home',target:profile.home,activity:rain?'sheltering at home':'going home'};
  if(thuanVisitsIzakaya(minutes))return {place:'izakaya',target:IZAKAYA_DOOR,activity:'supper with Nao'};
  const slot=thuanEveningPlace(minutes);
  if(slot==='home')return {place:'home',target:profile.home,activity:'settling in at home'};
  if(slot==='izakaya')return {place:'izakaya',target:IZAKAYA_DOOR,activity:'a drink after work'};
  if(slot==='ramen')return {place:'ramen',target:RAMEN_DOOR,activity:'a late bowl of ramen'};
  if(slot==='stroll')return {place:'stroll',target:profile.home,activity:'lingering near home'};
  return {place:'evening',target:profile.evening,activity:'walking Main Street'};
 }
 if(supperGuests(minutes).some(p=>p.name===profile.name))return {place:'izakaya',target:IZAKAYA_DOOR,activity:'supper with the neighbours'};
 if(inTimeRange(m,profile.start-30,profile.close))return {place:'work',target:profile.work,activity:profile.role};
 if(rain||!inTimeRange(m,profile.close,profile.retire))return {place:'home',target:profile.home,activity:rain?'sheltering at home':'going home'};
 return {place:'evening',target:profile.evening,activity:'taking an evening stroll'};
}
function commuterPlan(profile,minutes,rain=false,state=null){
 const phase=commuterPhase(profile,minutes,rain),bus=(activity='waiting for the Harbour Line')=>({place:'bus',target:BUS_STATION.queue,activity});
 // exit is the platform (clear of the painted tunnel mouth) — never roadEndZ/arch.
 if(phase==='away')return {place:'away',target:BUS_STATION.exit,activity:'away from the shopping district'};
 if(phase==='arriving')return {place:'bus',target:BUS_STATION.arrival,activity:'arriving on the Harbour Line'};
 // Thuan's own hour between locking up and the last bus. It has to be read before the
 // generic departing rule, which sends everybody straight to the queue — which is why
 // she has been walking past Minato's door every evening for the whole of her shift.
 if(profile.name==='Thuan'&&phase==='departing'){
  if(state?.sakura&&closingStockPending(state,minutes))return {place:'market',target:MARKET_THRESHOLD,activity:'restocking after closing'};
  if(state?.sakura&&closingPreparationPending(state,minutes))return {place:'market',target:MARKET_THRESHOLD,activity:'checking closing stock'};
  if(thuanAtMinato(profile,minutes,rain))return {place:'izakaya',target:IZAKAYA_DOOR,activity:'a beer at Minato before the last bus'};
 }
 if(phase==='departing')return bus('walking to the Harbour Line for departure');
 if(profile.name==='Bus driver')return {place:'station',target:BUS_STATION.driver,activity:'running the Harbour Line'};
 if(profile.name==='Harbour master')return {place:'work',target:profile.work,activity:'on duty at the harbour office'};
 if(profile.name==='Officer Mori')return shiftActive(profile,minutes)?{place:'patrol',target:(FULL_TOWN.active?FULL_TOWN.patrol:NIGHT_PATROL)[0],activity:'night patrol'}:bus('waiting for the night shift bus');
 if(profile.name==='Nao')return shiftActive(profile,minutes)?{place:'izakaya',target:IZAKAYA_DOOR,activity:'running Minato Izakaya'}:bus('travelling to the next shift');
 if(visitsMarket(profile,minutes,state))return {place:'market',target:MARKET_THRESHOLD,activity:'a shopping errand at Sakura'};
 if(visitsRamen(profile,minutes))return {place:'ramen',target:RAMEN_DOOR,activity:'a bowl of ramen at Inakaya'};
 if(profile.name==='Mrs Sato'&&shiftActive(profile,minutes))return profile.workSite==='warehouse'?{place:'work',target:profile.work,activity:'checking the quay stores'}:{place:'ramen',target:RAMEN_DOOR,activity:'serving the Sato Ramen counter'};
 if(profile.name==='Thuan'){
  if(state?.sakura&&closingStockPending(state,minutes))return {place:'market',target:MARKET_THRESHOLD,activity:'restocking after closing'};
  if(state?.sakura&&closingPreparationPending(state,minutes))return {place:'market',target:MARKET_THRESHOLD,activity:'checking closing stock'};
  // Her afternoon walk, read before the shift so that being on shift does not simply
  // put her back behind her own counter for the whole of it.
  const walk=thuanAfternoon(profile,minutes,rain);
  // Carry the leg's pace through. Dropping it here is what kept her break at the
  // town's errand speed of 1.25 m/s, which is above the handover between her walk and
  // her stroll -- so the unhurried cycle her model carries was never once played.
  if(walk)return {place:walk.place,target:walk.target,activity:walk.activity,pace:walk.pace};
  if(shiftActive(profile,minutes))return {place:'market',target:MARKET_THRESHOLD,activity:profile.role};
  return bus('leaving Sakura for the last bus');
 }
 if(shiftActive(profile,minutes))return {place:'work',target:profile.work,activity:profile.role};
 return bus('waiting for the next Harbour Line departure');
}
/**
 * Where somebody should be, on whichever layout the town is running.
 *
 * Every caller has to get the same answer to this or the town argues with itself. The
 * shop's own "should she still be here?" check asked without a mode, so it was handed
 * the archived street's routine, while the schedule asked with one and was handed the
 * commuter routine. They disagreed for the whole of every afternoon, and it was
 * invisible because when they disagree about a room the room simply wins: Thuan stood
 * at her counter through a walk the schedule thought she was taking.
 *
 * So the layout answers when the caller does not name one, and only an explicit false
 * forces the archived routine. The peninsula counts as a commuter layout for the same
 * reason the shopping district does — the bus is how people arrive and leave.
 */
export function residentPlan(profile,minutes,rain=false,state=null,mode=null){
 const commuter=mode===false?false
  :mode!=null&&mode!==''?true
  :state?.townMode==='shopping-district'||state?.townMode==='peninsula'||shoppingDistrictActive();
 return commuter?commuterPlan(profile,minutes,rain,state):legacyResidentPlan(profile,minutes,rain,state);
}
export const GOSSIP=[
 {id:'yuri-evening',a:'Thuan',b:'Nao',line:'Thuan: I told the assistant manager I would be on the last bus.\nNao: The plant?\nThuan: He looked very disappointed. I watered him twice.',clue:'Thuan leaves Sakura for the Harbour Line after closing. Check the terminal timetable for her evening service.'},
 {id:'apron',a:'Aya',b:'Reiko',line:'Aya: Tama needs his own column.\nReiko: What would he write?\nAya: Strong opinions about the window chair.',clue:'Aya and Reiko share Books & Press and commute in for their shifts.'},
 {id:'radio',a:'Kenji',b:'Tetsuo',line:'Kenji: Hey, bro, I fixed the crackling.\nTetsuo: That was the music.\nKenji: Totally improved it, then, dude.',clue:'Find the street radio and try the other stations.'},
 {id:'fish',a:'Harbour master',b:'Bus driver',line:'Bus driver: I arrived exactly on time.\nHarbour master: Which timetable?\nBus driver: The one I am writing now.',clue:'The harbour master keeps the office records; the bus driver works at the northern terminal.'},
 {id:'special',a:'Nao',b:'Mrs Sato',line:'Mrs Sato: Is that a proper supper?\nNao: You taught me the portions.\nMrs Sato: Good. Then there will be seconds.',clue:'Try Nao’s supper special at the counter.'}
];
export function gossipAt(minutes,names){return GOSSIP.filter(g=>names.includes(g.a)&&names.includes(g.b))[Math.floor(minutes/7)%Math.max(1,GOSSIP.filter(g=>names.includes(g.a)&&names.includes(g.b)).length)]||{id:'welcome',line:'Nao: Pull up a chair. Nobody leaves this table a stranger.\nA gull outside offers a surprisingly firm objection.',clue:'Neighbours arrive after their shifts. Visit again later for different conversations.'};}