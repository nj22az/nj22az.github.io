import {izakayaJob} from './izakaya-hours.js';
import {gardenPoint} from '../world/garden-layout.js';
import {bookshopVisitPlan} from './bookshop-visits.js';
import {marketVisitsForDay,RAMEN_VISITS,marketVisitPurpose} from './market-visits.js';
export {marketVisitsForDay,RAMEN_VISITS} from './market-visits.js';
import {IZAKAYA_DOOR} from '../world/dining-layout.js';
import {SHOP_CROSSING_Z} from '../world/main-road.js';
import {MARKET_THRESHOLD} from '../world/town-grid.js';
import {STAFF_BENCH} from '../world/staff-bench.js';
import {PROFILES} from './profiles.js';
import {ACTIVE_RESIDENT_NAMES,RESIDENTS,HOME_OWNERS} from './residents.js';
import {homeRoutine} from './home-life.js';
import {happeningPlan} from './happenings.js';
const HOME_RESIDENT_NAMES=new Set(HOME_OWNERS.map(p=>p.name));
import {closingStockPending,closingPreparationPending} from '../commerce/shop-stock.js';
import {transitStop,awayPlace} from '../world/transit.js';
import {ONSEN,ONSEN_DOOR} from '../world/onsen-layout.js';
import {PARK_BENCH} from '../world/park-layout.js';
import {commuterPhase,shiftActive,shiftFor,departureFor,livesInYard,livesAtWork,livesInKitahama,SATO_SHIFT} from './commuter-schedule.js';
import {SATO_LUNCH,SATO_RAMEN,satoRamenOpen} from '../world/sato-ramen-layout.js';
// The live array, not a copy: the izakaya does not stand in the same place in every
// layout, and a copy taken at import time would point at the old plot forever.
export {IZAKAYA_DOOR};
export {RAMEN_DOOR} from '../world/dining-layout.js';
import {RAMEN_DOOR} from '../world/dining-layout.js';
export const THUAN_HOME_DOOR=[...RESIDENTS.find(p=>p.name==='Thuan').home];
export const minuteOfDay=m=>((m%1440)+1440)%1440;
export const inTimeRange=(m,start,end)=>start!=null&&end!=null&&minuteOfDay(m-start)<end-start;
export const izakayaOpen=m=>inTimeRange(m,960,1620);
export const NIGHT_PATROL=[[0,28],[0,SHOP_CROSSING_Z],[0,-16],[0,-36],[0,-44],[0,-36],[0,-16],[0,SHOP_CROSSING_Z],[10,SHOP_CROSSING_Z],[0,SHOP_CROSSING_Z]];
// A repeatable visit on alternate town days, with time to lock up and walk over.
// Keep the unwrapped saved clock so revisiting or reloading never rerolls her.
export function thuanVisitsIzakaya(minutes){
 const minute=((minutes%1440)+1440)%1440,day=Math.floor(minutes/1440);
 return day%2===0&&minute>=1200&&minute<1290;
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
/** Two places to stand outside Sakura's window, where the sisters wait for Thuan to lock up (world/okinawa/old-town.js). */
export const SAKURA_FREEZER=Object.freeze([Object.freeze([-6.2,-21.0]),Object.freeze([-6.2,-21.9])]);
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
 {until:906,place:'park',target:PARK_STAND,activity:'walking up to the park',pace:STROLLING},
 {until:912,place:'stroll',target:PARK_STAND,activity:'sitting in the park',pace:STROLLING},
 {until:916,place:'stroll',target:[31.6,1.5],activity:'walking the sea wall',pace:STROLLING},
 // Start home while the break is still active. Waiting until the schedule flipped
 // back to "work" left only ten seconds to cross the town, which encouraged route
 // shortcuts and made the old loose facing gate look acceptable.
 {until:THUAN_WALK_END,place:'market',target:MARKET_THRESHOLD,activity:'walking back to Sakura',pace:1.4},
].map(Object.freeze));
/**
 * The three sisters: Nhung (the eldest, at the bookshop), Thao (Minato) and Thuan (the
 * youngest, at Sakura). On the dry days Thuan is not at Minato in the evening, Nhung takes her break when Thuan does, and
 * the two of them play jan-ken-pon in the park instead of Thuan's nap and walk; `play`
 * names the partner, and the schedule (schedules.js) faces them off and plays.
 */
export const SISTERS_PLAY=Object.freeze({start:880,end:914,thuan:[PARK_STAND[0]+.75,PARK_STAND[1]+.2],nhung:[PARK_STAND[0]-.75,PARK_STAND[1]+.2]});
export const sistersPlayDay=minutes=>Math.floor(minutes/1440)%2===1;
export function sistersAtPlay(profile,minutes,rain=false){
 if(rain||!sistersPlayDay(minutes)||!['Thuan','Nhung'].includes(profile?.name))return null;
 const m=minuteOfDay(minutes);if(m<SISTERS_PLAY.start||m>=SISTERS_PLAY.end)return null;
 const thuan=profile.name==='Thuan';
 return {place:'park',target:thuan?SISTERS_PLAY.thuan:SISTERS_PLAY.nhung,play:thuan?'Nhung':'Thuan',activity:'playing jan-ken-pon with '+(thuan?'her big sister Nhung':'her little sister Thuan')+' in the park'};
}
/** The leg of the walk she is on, or null when she is not on it. */
export function thuanAfternoon(profile,minutes,rain=false){
 if(rain||profile?.name!=='Thuan')return null;
 const m=minuteOfDay(minutes);
 if(m<THUAN_WALK_START||m>=THUAN_WALK_END)return null;
 // On a play day the nap and the sea wall give way to a game with Nhung.
 if(sistersPlayDay(minutes)&&m<SISTERS_PLAY.end)return m<SISTERS_PLAY.start?THUAN_WALK[0]:sistersAtPlay(profile,minutes,rain);
 return THUAN_WALK.find(leg=>m<leg.until)||null;
}

// Thao has a real pre-shift day rather than materialising behind Minato's counter.
// The generous legs account for the town's actual street distances and the time she
// spends turning at corners. Two park targets make this a walk around the grounds,
// rather than every resident being sent to the same bench coordinate.
export const NAO_DAY=Object.freeze([
 {until:815,place:'market',target:MARKET_THRESHOLD,activity:'buying Ramune soda at Sakura'},
 {until:850,place:'park',target:[PARK_STAND[0]-1.4,PARK_STAND[1]+1.2],activity:'walking around the west side of the park',pace:.78},
 {until:905,place:'stroll',target:[31.6,1.5],activity:'walking around the park to the sea wall',pace:.78},
 {until:935,place:'park',target:[PARK_STAND[0]+1.1,PARK_STAND[1]-.8],activity:'finishing her park circuit',pace:.78},
 {until:960,place:'izakaya',target:IZAKAYA_DOOR,activity:'tidying Minato before opening'},
].map(Object.freeze));
export function naoBeforeShift(profile,minutes,rain=false){
 if(profile?.name!=='Thao')return null;
 const shift=shiftFor(profile),m=minuteOfDay(minutes);
 if(!shift||m<shift.arrival+30||m>=shift.start)return null;
 if(rain)return {place:'izakaya',target:IZAKAYA_DOOR,activity:'tidying Minato before opening'};
 return NAO_DAY.find(leg=>m<leg.until)||null;
}

/** Alternate dry evenings at Minato, keyed to the saved town day.
 * Thuan now walks home; the ferry margin remains for invited onsen visits. */
export const THUAN_BUS_MARGIN=55;
export function thuanAtMinato(profile,minutes,rain=false){
 if(profile?.name!=='Thuan'||rain)return false;
 return izakayaOpen(minutes)&&thuanVisitsIzakaya(minutes);
}

/**
 * Thuan's evening at Umi-no-yu, when she has been asked. `state.onsenDate` is the day
 * index (minutes / 1440) she said yes for; she goes straight from locking up, and still
 * leaves in time for her bus.
 */
export function thuanAtOnsen(profile,minutes,rain=false,state=null,commuter=true){
 if(profile?.name!=='Thuan'||!Number.isFinite(state?.onsenDate)||Math.floor(minutes/1440)!==state.onsenDate)return false;
 const m=minuteOfDay(minutes);
 if(!inTimeRange(m,ONSEN.opens,ONSEN.closes))return false;
 if(commuter){const shift=shiftFor(profile);return !!shift&&!shift.permanent&&inTimeRange(m,shift.finish,departureFor(profile,rain)-THUAN_BUS_MARGIN);}
 return inTimeRange(m,profile.close,Math.min(profile.close+80,ONSEN.closes));
}
/** The evening she would be at the bath if asked now: tonight, or tomorrow once tonight has gone. */
export function onsenInvitationDay(profile,minutes,rain=false,state=null){
 const commuter=true;
 const day=Math.floor(minutes/1440),m=minuteOfDay(minutes),shift=shiftFor(profile);
 const end=commuter&&shift&&!shift.permanent?departureFor(profile,rain)-THUAN_BUS_MARGIN:Math.min((profile?.close??1200)+80,ONSEN.closes);
 return m<end?day:day+1;
}

// A commuter does not spend the whole gap between clocking off and the next bus at
// the terminus. These are small, personal after-work lives: errands, food, a bench,
// the harbour and a closing walk. The last leg is deliberately omitted so every
// resident still returns to the normal bus plan with ample boarding time.
const AFTER_WORK=Object.freeze({
 // The eldest sister's evening is her sisters': Thuan at Sakura's counter, a Blue Coral cone
 // from the lane, eaten outside while Thuan locks up, then, on Thuan's Minato nights, Minato,
 // where Thao is behind the bar (afterWorkPlan).
 Nhung:Object.freeze([
  {until:60,place:'market',target:MARKET_THRESHOLD,activity:'visiting her little sister Thuan at the Sakura counter'},
  {until:90,place:'stroll',target:SAKURA_FREEZER[1],activity:'waiting outside Sakura with two Blue Coral cones from the lane, for Thuan to lock up'},
  {until:105,place:'stroll',target:SAKURA_FREEZER[1],activity:'sharing Blue Coral cones with Thuan outside Sakura'},
  {until:180,place:'izakaya',target:IZAKAYA_DOOR,activity:'at Minato with her sisters Thao and Thuan',withThuan:true},
 ]),
 Chin:Object.freeze([
  {until:55,place:'market',target:MARKET_THRESHOLD,activity:'buying a cold soda after work'},
  {until:130,place:'stroll',target:[3.5,-47],activity:'looking over the harbour machinery'},
  {until:165,place:'park',target:[PARK_STAND[0]+.8,PARK_STAND[1]-.6],activity:'taking a breather in the park'},
 ]),
 'Mrs Sato':Object.freeze([
  {until:75,place:'izakaya',target:IZAKAYA_DOOR,activity:'having tea with Thao after the lunch shift'},
  {until:135,place:'stroll',target:[11,-40],activity:'choosing fish at the harbour'},
 ]),
 Reiko:Object.freeze([
  {until:120,place:'izakaya',target:IZAKAYA_DOOR,activity:'eating supper after the press shift'},
  {until:250,place:'park',target:[PARK_STAND[0]-.7,PARK_STAND[1]-.9],activity:'sketching the park for tomorrow’s paper'},
  {until:400,place:'stroll',target:[18,-45],activity:'watching the harbour lights'},
 ]),
 Tetsuo:Object.freeze([
  {until:105,place:'izakaya',target:IZAKAYA_DOOR,activity:'playing the counter radio for Thao'},
  {until:235,place:'stroll',target:[6,-48],activity:'checking the harbour radio signal'},
  {until:390,place:'park',target:[PARK_STAND[0]+1.1,PARK_STAND[1]+.5],activity:'listening to a pocket radio in the park'},
 ]),
 Thao:Object.freeze([
  {until:60,place:'izakaya',target:IZAKAYA_DOOR,activity:'clearing tables and closing Minato'},
  {until:165,place:'stroll',target:[14,-42],activity:'taking kitchen scraps to the harbour cats'},
  {until:270,place:'park',target:[PARK_STAND[0]+.2,PARK_STAND[1]+1.1],activity:'resting her feet in the park'},
 ]),
 'Officer Mori':Object.freeze([
  {until:55,place:'stroll',target:[0,-44],activity:'making a final harbour round'},
  {until:95,place:'park',target:[PARK_STAND[0]-1.2,PARK_STAND[1]-.2],activity:'writing the night report on a park bench'},
 ]),
});

export function afterWorkPlan(profile,minutes,rain=false){
 if(rain)return null;
 const shift=shiftFor(profile),routine=AFTER_WORK[profile?.name];
 if(!shift||shift.permanent||!routine)return null;
 const elapsed=minuteOfDay(minutes-shift.finish);
 // Keep the final hour clear for the walk to the bus. This also makes the routine
 // safe if a shift or service changes without every personal stop being retimed.
 const available=departureFor(profile,false)-shift.finish-60;
 if(elapsed<0||elapsed>=available)return null;
 const stop=routine.find(stop=>elapsed<Math.min(stop.until,available))||null;
 // Nhung goes on to Minato only on the nights Thuan does.
 if(stop?.withThuan&&!thuanVisitsIzakaya(minutes))return null;
 return stop;
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
 return PROFILES.filter(p=>ACTIVE_RESIDENT_NAMES.includes(p.name)&&p.name!=='Thao'&&inTimeRange(minute,p.supperStart,p.supperEnd)).slice(0,IZAKAYA_SEATS.length);
}
export function visitsMarket(profile,minutes,state=null){
 const visit=marketVisitsForDay(minutes)[profile.name],account=state?.residentLife?.[profile.name],meal=account?.day===Math.floor(minutes/1440)?(marketVisitPurpose(profile.name,minutes,state||{})==='goods'?(account.shopping||account.meals?.market):account.meals?.market):null;
 if(meal?.finished)return false;
 const ordering=Number.isFinite(meal?.started)&&minutes>=meal.started&&minutes<meal.started+160&&minuteOfDay(minutes)<1200;
 return ACTIVE_RESIDENT_NAMES.includes(profile.name)&&!!visit&&(inTimeRange(minutes,...visit)||ordering);
}
export const ramenOpen=m=>inTimeRange(m,540,1260);
export function visitsRamen(profile,minutes){
 return profile?.name!=='Thuan'&&!!satoLunch(profile,minutes);
}
/**
 * The Front-Row staff at home in the yard: to work for their shift, a Sakura errand or
 * an evening stop when one is due, and otherwise home — where they eat, read and, at
 * night, sleep in their own beds for anybody who opens the door to see.
 */
/** Reiko and Tetsuo start in the afternoon; on a dry morning they take an hour on the park bench. */
const MORNING_PARK=Object.freeze({Reiko:Object.freeze([660,720]),Tetsuo:Object.freeze([750,810])});
/** Lunch at Sato Ramen, next door to the shop, for those who have a slot (sato-ramen-layout.js). */
function satoLunch(profile,minutes){
 const slot=SATO_LUNCH[profile.name];
 return slot&&satoRamenOpen(minutes)&&inTimeRange(minutes,...slot)?{place:'ramen',target:RAMEN_DOOR,activity:'lunch at Sato Ramen'}:null;
}
/** Yard residents whose evening runs longer than the usual two hours. */
const YARD_EVENING=Object.freeze({Nhung:180});
function yardResidentPlan(profile,minutes,rain=false,state=null){
 const lunch=satoLunch(profile,minutes);if(lunch)return lunch;
 const play=sistersAtPlay(profile,minutes,rain);if(play)return play;
 if(shiftActive(profile,minutes))return {place:'work',target:profile.work,activity:profile.role};
 if(visitsMarket(profile,minutes,state))return {place:'market',target:MARKET_THRESHOLD,activity:'a shopping errand at Sakura'};
 const morning=MORNING_PARK[profile.name];
 // Aimed beside the bench, not at its step: with somebody already on it, they wait off to one side.
 if(!rain&&morning&&inTimeRange(minutes,...morning))return {place:'park',target:[PARK_STAND[0]+1.4,PARK_STAND[1]+.9],activity:'sitting in the park'};
 // Their evening stops were timed against the last bus; living next door, they take
 // at most a couple of hours after work before heading home to bed.
 const shift=shiftFor(profile),evening=shift&&minuteOfDay(minutes-shift.finish)<(YARD_EVENING[profile.name]||120)?afterWorkPlan(profile,minutes,rain):null;
 if(evening)return evening;
 return {place:'home',target:profile.home,activity:rain?'sheltering at home':'at home in the yard'};
}
/**
 * The two who live at their work. The harbour master keeps the office from half past
 * six until five, walks the quay in the early evening and turns in behind the screen
 * in the office by half past nine. Officer Mori sleeps through the morning in the
 * tatami room behind the police box, keeps the front desk from four, takes supper at
 * Sakura and walks the night patrol from ten until six.
 */
export const HARBOUR_MASTER_DAY=Object.freeze({start:390,finish:1020,turnIn:1230});
export const MORI_DAY=Object.freeze({desk:960,patrol:1320,patrolEnd:360});
function workplaceResidentPlan(profile,minutes,rain=false,state=null){
 const m=minuteOfDay(minutes),home={place:'home',target:profile.home};
 if(profile.name==='Harbour master'){
  const day=HARBOUR_MASTER_DAY;
  const lunch=satoLunch(profile,minutes);if(lunch)return lunch;
  if(visitsMarket(profile,minutes,state))return {place:'market',target:MARKET_THRESHOLD,activity:'buying lunch at Sakura'};
  if(inTimeRange(m,day.start,day.finish))return {place:'work',target:profile.work,activity:'on duty at the harbour office'};
  if(!rain&&inTimeRange(m,day.finish,day.finish+75))return {place:'stroll',target:[0,-44],activity:'walking the quay to check the moorings'};
  if(!rain&&inTimeRange(m,day.finish+75,day.turnIn-60))return {place:'park',target:[PARK_STAND[0]+.8,PARK_STAND[1]-.9],activity:'watching the evening from the park'};
  return {...home,activity:inTimeRange(m,day.turnIn-60,day.start+1440)?'in his bed nook at the office':'at home in the office'};
 }
 const day=MORI_DAY;
 if(inTimeRange(m,day.patrol,day.patrolEnd+1440))return {place:'patrol',target:NIGHT_PATROL[0],activity:'night patrol'};
 if(visitsMarket(profile,minutes,state))return {place:'market',target:MARKET_THRESHOLD,activity:'supper from Sakura before the night patrol'};
 if(inTimeRange(m,day.desk,day.patrol))return {place:'work',target:profile.work,activity:'at the front desk of the police box'};
 return {...home,activity:'resting in the room behind the police box'};
}
/**
 * On the island the commute is by ferry, and what people are doing says so. One place
 * for it, rather than two copies of every line.
 */
export const ferryWords=text=>typeof text!=='string'?text:text
 .replace(/the night shift bus/g,'the night ferry').replace(/the last bus/g,'the last ferry')
 .replace(/(on|for|to) the Harbour Line/g,'$1 the ferry').replace(/next Harbour Line departure/g,'next ferry')
 .replace(/running the Harbour Line/g,'working the ferry').replace(/left by bus/g,'left on the ferry');
function commuterPlan(...args){
 const scheduled=kitahamaPlan(args[0],commuterPlanOn(...args));
 const plan=bookshopVisitPlan(args[0],args[1],scheduled,args[3]);
 if(plan&&plan.activity)return {...plan,activity:ferryWords(plan.activity)};
 return plan;
}
/** Where the timetable said 'ferry', somebody who lives in Kitahama goes home instead. */
function kitahamaPlan(profile,plan){
 if(!plan||!livesInKitahama(profile))return plan;
 const home={place:'home',target:profile.home};
 if(plan.place==='away')return {...home,activity:'at home in Kitahama'};
 if(plan.place==='bus')return {...home,activity:'walking home to Kitahama'};
 return plan.activity?{...plan,activity:plan.activity.replace(/ before the last (bus|ferry)/,' before walking home').replace(/the Harbour Line/g,'home')}:plan;
}
function commuterPlanOn(profile,minutes,rain=false,state=null){
 // After last orders Thao stays an hour to wipe down and lock up (izakaya-hours.js).
 if(profile.name==='Thao'){const job=izakayaJob('Thao',minutes);if(job)return {place:'izakaya',target:IZAKAYA_DOOR,activity:job.activity};}
 if(livesAtWork(profile))return workplaceResidentPlan(profile,minutes,rain,state);
 if(livesInYard(profile))return yardResidentPlan(profile,minutes,rain,state);
 const phase=commuterPhase(profile,minutes,rain),bus=(activity='waiting for the Harbour Line')=>({place:'bus',target:transitStop().queue,activity});
 // exit is the platform (clear of the tunnel mouth) — never roadEndZ/arch.
 if(phase==='away')return {place:'away',target:transitStop().exit,activity:awayPlace()};
 if(phase==='arriving')return {place:'bus',target:transitStop().arrival,activity:'arriving on the Harbour Line'};
 // Thuan's own hour between locking up and the last bus. It has to be read before the
 // generic departing rule, which sends everybody straight to the queue — which is why
 // she has been walking past Minato's door every evening for the whole of her shift.
 if(profile.name==='Thuan'&&phase==='departing'){
  if(state?.sakura&&closingStockPending(state,minutes))return {place:'market',target:MARKET_THRESHOLD,activity:'restocking after closing'};
  if(state?.sakura&&closingPreparationPending(state,minutes))return {place:'market',target:MARKET_THRESHOLD,activity:'checking closing stock'};
  if(thuanAtOnsen(profile,minutes,rain,state))return {place:'onsen',target:ONSEN_DOOR,activity:'a soak at Umi-no-yu before the last bus'};
  // Nhung has been waiting outside with a Blue Coral cone for her.
  const finish=shiftFor(profile)?.finish??profile.close??1200;
  if(!rain&&inTimeRange(minuteOfDay(minutes),finish,finish+15))return {place:'stroll',target:SAKURA_FREEZER[0],activity:'an ice cream with her big sister Nhung outside Sakura'};
  if(thuanAtMinato(profile,minutes,rain))return {place:'izakaya',target:IZAKAYA_DOOR,activity:'a beer with her sisters Thao and Nhung after closing Sakura'};
  return {place:'home',target:profile.home,activity:'walking home after closing Sakura'};
 }
 if(phase==='departing'){
  const afterWork=afterWorkPlan(profile,minutes,rain);
  if(afterWork)return afterWork;
  return bus('walking to the Harbour Line for departure');
 }
 // Mrs Sato on the island: fish at the harbour first, then her own kitchen.
 if((profile.name==='Mrs Sato')&&phase==='town'){
  if(shiftActive(profile,minutes))return {place:'ramen',target:RAMEN_DOOR,activity:minuteOfDay(minutes)>=SATO_RAMEN.close?'washing up after the lunch shift':'cooking the lunch ramen at Sato Ramen'};
  if(minuteOfDay(minutes-SATO_SHIFT.arrival)<SATO_SHIFT.start-SATO_SHIFT.arrival)return {place:'stroll',target:[3.2,-44],activity:'buying fish for the stock at the harbour'};
 }
 if(profile.name==='Bus driver')return {place:'station',target:transitStop().driver,activity:'running the Harbour Line'};
 if(profile.name==='Harbour master')return {place:'work',target:profile.work,activity:'on duty at the harbour office'};
 if(profile.name==='Officer Mori')return shiftActive(profile,minutes)?{place:'patrol',target:(NIGHT_PATROL)[0],activity:'night patrol'}:bus('waiting for the night shift bus');
 if(profile.name==='Thao'){
  const morning=naoBeforeShift(profile,minutes,rain);
  if(morning)return morning;
  return shiftActive(profile,minutes)?{place:'izakaya',target:IZAKAYA_DOOR,activity:'serving guests and tidying Minato'}:bus('travelling to the next shift');
 }
 if(visitsMarket(profile,minutes,state))return {place:'market',target:MARKET_THRESHOLD,activity:'a shopping errand at Sakura'};
 if(visitsRamen(profile,minutes))return {place:'ramen',target:RAMEN_DOOR,activity:'a bowl of noodles at Sato Ramen'};
 if(profile.name==='Mrs Sato'&&shiftActive(profile,minutes))return profile.workSite==='warehouse'?{place:'work',target:profile.work,activity:'checking the quay stores'}:{place:'ramen',target:RAMEN_DOOR,activity:'serving the Sato Ramen counter'};
 if(profile.name==='Thuan'){
  if(state?.sakura&&closingStockPending(state,minutes))return {place:'market',target:MARKET_THRESHOLD,activity:'restocking after closing'};
  if(state?.sakura&&closingPreparationPending(state,minutes))return {place:'market',target:MARKET_THRESHOLD,activity:'checking closing stock'};
  // Finish serving customers already in the shop before taking her lunch break.
  const waiting=Object.values(state?.residentLife||{}).some(account=>account.day===Math.floor(minutes/1440)&&account.shopping&&!account.shopping.finished&&Number.isFinite(account.shopping.started)&&minutes>=account.shopping.started&&minutes<account.shopping.started+160);
  const lunch=satoLunch(profile,minutes);if(lunch&&!waiting)return lunch;
  // Her afternoon walk, read before the shift so that being on shift does not simply
  // put her back behind her own counter for the whole of it.
  const walk=thuanAfternoon(profile,minutes,rain);
  // Carry the leg's pace through. Dropping it here is what kept her break at the
  // town's errand speed of 1.25 m/s, which is above the handover between her walk and
  // her stroll -- so the unhurried cycle her model carries was never once played.
  if(walk)return {place:walk.place,target:walk.target,activity:walk.activity,pace:walk.pace,...(walk.play?{play:walk.play}:{})};
  if(shiftActive(profile,minutes))return {place:'market',target:MARKET_THRESHOLD,activity:profile.role};
  return bus('leaving Sakura for the last bus');
 }
 if(shiftActive(profile,minutes))return {place:'work',target:profile.work,activity:profile.role};
 return bus('waiting for the next Harbour Line departure');
}
/** Every caller shares one daily plan, including sleep in the residents' actual homes. */
export function residentPlan(profile,minutes,rain=false,state=null){
 // Minato's regular never joins the Harbour Line or leaves the room. He sleeps on
 // his usual stool from 03:00 until 10:00 and drinks at the counter the rest of day.
 if(profile?.name==='Barfly'){
  // Closed hours he cleans to pay off his tab (izakaya-hours.js), and sleeps 04:00-10:00.
  const minute=minuteOfDay(minutes),sleeping=minute>=240&&minute<600,job=izakayaJob('Barfly',minutes);
  return {place:'izakaya',target:IZAKAYA_DOOR,activity:job?job.activity:sleeping?'asleep on his Minato stool':'having another beer at Minato',barflySleeping:sleeping};
 }
 // These homes remain playable after the island expansion. A night worker must
 // finish sleeping and breakfast before a generic shopping or ferry rule sends
 // them outside. The Minato closing shift finishes exactly at Thao's 04:00 bedtime.
 if(HOME_RESIDENT_NAMES.has(profile?.name)){
  const routine=homeRoutine(profile,minutes);
  if(['sleep','wake','breakfast','prepare'].includes(routine.id))return {place:'home',target:profile.home,activity:routine.activity+' at home'};
 }
 // Today's happening, if it names them (happenings.js): the fish auction, the eisa. Read
 // after sleep and breakfast, so nobody is got out of bed for one.
 const happening=happeningPlan(profile,minutes,rain);
 if(happening)return happening;
 // Local residents leave early enough to be seen walking from home to work.
 // Sleep/breakfast above and night shifts retain priority.
 const shift=shiftFor(profile),m=minuteOfDay(minutes);
 if(HOME_RESIDENT_NAMES.has(profile?.name)&&shift&&!shift.permanent&&inTimeRange(m,shift.start-30,shift.start)){
  const place=profile.name==='Thuan'?'market':profile.name==='Thao'?'izakaya':'work';
  const target=place==='market'?MARKET_THRESHOLD:place==='izakaya'?IZAKAYA_DOOR:place==='ramen'?RAMEN_DOOR:profile.work;
  return {place,target,activity:'walking to work before opening'};
 }
 const plan=commuterPlan(profile,minutes,rain,state);
 // The two gardens have regular visitors; work and bad-weather routines stay intact.
 // Thuan is not among them: her afternoon break is its own walk (THUAN_WALK), Minato
 // Park's bench and the sea wall, ten minutes from the counter. Aoba Garden is 170 m
 // away, and redirecting her there left the plan and the walk in two places at once.
 if((!rain)&&['Reiko','Tetsuo'].includes(profile.name)&&['park','stroll'].includes(plan.place)&&Math.hypot(plan.target[0]-PARK_STAND[0],plan.target[1]-PARK_STAND[1])<3){
  return {...plan,place:'park',target:gardenPoint(profile.name==='Reiko'?-42:-26,profile.name==='Reiko'?144.9:143.9),activity:plan.activity+' at Aoba Garden'};
 }
 return plan;
}
export const GOSSIP=[
 {id:'yuri-evening',a:'Thuan',b:'Thao',line:'Thuan: I told the assistant manager I would be on the last ferry.\nThao: The plant?\nThuan: He looked very disappointed. I watered him twice.',clue:'Thuan leaves Sakura for the Harbour Line after closing. Check the terminal timetable for her evening service.'},
 {id:'apron',a:'Nhung',b:'Reiko',line:'Nhung: Tama needs his own column.\nReiko: What would he write?\nNhung: Strong opinions about the window chair.',clue:'Nhung and Reiko share Books & Press and commute in for their shifts.'},
 {id:'radio',a:'Chin',b:'Tetsuo',line:'Chin: Hey, bro, I fixed the crackling.\nTetsuo: That was the music.\nChin: Totally improved it, then, dude.',clue:'Find the street radio and try the other stations.'},
 {id:'fish',a:'Harbour master',b:'Bus driver',line:'Bus driver: I arrived exactly on time.\nHarbour master: Which timetable?\nBus driver: The one I am writing now.',clue:'The harbour master keeps the office records; the bus driver works at the northern terminal.'},
 {id:'special',a:'Thao',b:'Mrs Sato',line:'Mrs Sato: Is that a proper supper?\nThao: You taught me the portions.\nMrs Sato: Good. Then there will be seconds.',clue:'Try Thao’s supper special at the counter.'}
];
export function gossipAt(minutes,names){return GOSSIP.filter(g=>names.includes(g.a)&&names.includes(g.b))[Math.floor(minutes/7)%Math.max(1,GOSSIP.filter(g=>names.includes(g.a)&&names.includes(g.b)).length)]||{id:'welcome',line:'Thao: Pull up a chair. Nobody leaves this table a stranger.\nA gull outside offers a surprisingly firm objection.',clue:'Neighbours arrive after their shifts. Visit again later for different conversations.'};}
