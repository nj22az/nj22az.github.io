import {townCalendarAt} from '../town-clock.js';
import {higaLiquorKeeper,higaRoundAt,yuntakuSeatAt,HIGA_LIQUOR_HOURS} from '../commerce/higa-liquor.js';
import {laundryVisitAt} from '../commerce/coin-laundry.js';

/**
 * Where the shops of 21 October 2026 put the residents (the owner's decision: no new people; commerce/higa-liquor.js,
 * commerce/coin-laundry.js): behind Higa Liquor's counter, on its round, on its bench of an evening, and at the coin
 * laundry's machines on their washing day. A pure function of the clock, read by the canonical day (canonical-day.js)
 * and the walking residents' planner (social.js residentPlan) before their ordinary rows, so the street, the stories and
 * the tests ask the same question.
 *
 * The world positions are the shops' own (higa-liquor-dressing.js HIGA_KEEPER_AT, coin-laundry-dressing.js
 * LAUNDRY_PLACES and LAUNDRY_BENCH), written here as numbers so the people modules do not load the buildings;
 * tests/shop-days.test.mjs holds the two the same.
 */
const minute=m=>((m%1440)+1440)%1440;
/** Behind Higa Liquor's counter, facing the door (the street, world -x). */
export const HIGA_COUNTER_STAND=Object.freeze({at:Object.freeze([10.85,8.5]),yaw:Math.PI/2});
/** The coin laundry's frame: world = (x0 + local z, z0 - local x). */
const laundry=(x,z)=>Object.freeze([-11.9+z,20.7-x]);
/** In front of each machine, where a customer loads and unloads it, and the way they face (world). */
export const LAUNDRY_STANDS=Object.freeze({
 W1:Object.freeze({at:laundry(-1.0,1.4),yaw:Math.PI}),W2:Object.freeze({at:laundry(-1.0,.65),yaw:Math.PI}),
 W3:Object.freeze({at:laundry(-1.0,-.1),yaw:Math.PI}),W4:Object.freeze({at:laundry(-1.0,-.68),yaw:Math.PI}),
 D1:Object.freeze({at:laundry(.95,-.4),yaw:0}),D2:Object.freeze({at:laundry(.95,.5),yaw:0}),
 table:Object.freeze({at:laundry(1.45,2.0),yaw:-Math.PI/2}),
});
/** The bench's two places: [sit, stand] in the world, facing the machines (world +x). Visitors take them in this order. */
export const LAUNDRY_SEATS=Object.freeze([
 // (the bench's front edge, local z -1.04, is .16 ahead of the marks: `front`, seat-slots.js)
 Object.freeze({key:'laundry-bench-0',at:laundry(-.8,-1.2),stand:laundry(-.8,-.55),height:.42,yaw:-Math.PI/2,front:.16}),
 Object.freeze({key:'laundry-bench-1',at:laundry(.2,-1.2),stand:laundry(.2,-.55),height:.42,yaw:-Math.PI/2,front:.16}),
]);
const SEAT_OF=Object.freeze({'Ms Uezu':0,Nhung:0,Thao:1});
const isSaturday=minutes=>townCalendarAt(minutes).weekday===6;

/**
 * The shop plan for a resident at this minute, or null when no shop has them. `pointFor(place)` turns a canonical place
 * into a world target for Kōji's drops (canonical-day.js points). Plans carry a `stand` ({yaw, pose, seat?, held?}) the
 * walkers stand or sit on (schedules.js standOnPoint, neighbours.js standAtPoint).
 */
export function shopDayPlan(name,minutes,{pointFor=()=>null}={}){
 if(!name)return null;
 const m=minute(minutes);
 // Higa Liquor's counter: whoever the hours give it (Grandmother Higa; Yui on a Saturday).
 if(higaLiquorKeeper(minutes)===name)return {place:'higa-liquor',target:[...HIGA_COUNTER_STAND.at],activity:name==='Miss Higa'?'minding the counter at Higa Liquor for her grandmother':'keeping the counter at Higa Liquor',
  stand:Object.freeze({yaw:HIGA_COUNTER_STAND.yaw,pose:'CounterIdle',why:'behind the counter, facing the door'})};
 if(isSaturday(minutes)){
  // Yui has the shop on Saturdays: her grandmother keeps the morning for the garden and the verandah and stays on at the
  // bandai until eight; Yui has lunch at home between the openings and takes the bandai from eight.
  if(name==='Grandmother Higa'&&m>=HIGA_LIQUOR_HOURS.morning[0]&&m<HIGA_LIQUOR_HOURS.morning[1])return {place:'home',home:true,activity:'the verandah: Yui has the shop on Saturdays'};
  if(name==='Grandmother Higa'&&m>=HIGA_LIQUOR_HOURS.evening[0]&&m<HIGA_LIQUOR_HOURS.evening[1])return {place:'onsen',activity:'staying on at the bandai while Yui keeps the shop'};
  if(name==='Miss Higa'&&m>=HIGA_LIQUOR_HOURS.morning[1]&&m<780)return {place:'home',home:true,activity:'lunch at home between the shop and the bath'};
 }
 // Kōji's round, on his weeks ashore.
 if(name==='Kōji'){const leg=higaRoundAt(minutes);if(leg){const target=leg.point?[...leg.point]:pointFor(leg.place);if(target)return {place:'higa-round',target,activity:leg.activity};}}
 // The yuntaku bench in the shop's evening opening.
 const seat=yuntakuSeatAt(name,minutes);
 if(seat)return {place:'higa-bench',target:[...seat.stand],activity:'a bottle on the bench outside Higa Liquor',
  stand:Object.freeze({yaw:seat.yaw,pose:'Drink',held:'beer',seat:Object.freeze({key:'higa-'+seat.id,at:seat.at,height:seat.height,front:seat.front}),why:seat.why})};
 // Washing day at the coin laundry.
 const visit=laundryVisitAt(name,minutes);
 if(visit){
  if(visit.stage==='waiting'){const s=LAUNDRY_SEATS[SEAT_OF[name]??0];
   return {place:'coin-laundry',target:[...s.stand],activity:'waiting for the washing on the coin laundry bench, a manga open',
    stand:Object.freeze({yaw:s.yaw,pose:'Read',held:'paper',seat:Object.freeze({key:s.key,at:s.at,height:s.height,front:s.front}),why:visit.why})};}
  const t=visit.timeline,stage=visit.stage==='folding'?'table':m<t.wash[0]?visit.washers[0]:visit.dryer,S=LAUNDRY_STANDS[stage];
  return {place:'coin-laundry',target:[...S.at],activity:visit.stage==='folding'?'folding the washing at the coin laundry':'loading the machines at the coin laundry',
   stand:Object.freeze({yaw:S.yaw,pose:'Interact',why:visit.why})};
 }
 return null;
}
