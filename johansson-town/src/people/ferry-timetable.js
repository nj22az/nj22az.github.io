import {HARBOUR_LINE,BUS_DWELL,CROSSING_MINUTES,serviceTime} from './commuter-schedule.js';

/** HARBOUR_LINE records arrivals at Minato. Every departure is derived, never another list of times. */
export const FERRY_TIMETABLE=Object.freeze(HARBOUR_LINE.flatMap(arrival=>[
 Object.freeze({origin:'airport',destination:'town',departure:arrival-CROSSING_MINUTES,arrival}),
 Object.freeze({origin:'town',destination:'airport',departure:arrival+BUS_DWELL,arrival:arrival+BUS_DWELL+CROSSING_MINUTES}),
]).sort((a,b)=>a.departure-b.departure));
export const FERRY_WARNING_MINUTES=2;
export const FERRY_PREPARE_MINUTES=20;
export function nextFerryDeparture(minutes,origin=null){
 const day=Math.floor(minutes/1440);
 for(let d=day;d<=day+1;d++)for(const trip of FERRY_TIMETABLE){
  const departure=d*1440+trip.departure;
  if(departure>=minutes&&(!origin||trip.origin===origin))return {...trip,departure,arrival:d*1440+trip.arrival,id:d+':'+trip.departure};
 }
}
export function ferryDepartureText(minutes,origin='town'){
 const next=nextFerryDeparture(minutes,origin);
 return 'Next sailing from '+(origin==='town'?'Minato':'Kitano-jima')+': '+serviceTime(next.departure)+' · '+Math.ceil(next.departure-minutes)+' town minutes. The ship keeps her timetable.';
}
/** Old crossings saved only the last safe shore, not the moving hull or a vehicle mid-ramp. Keep that recovery contract. */
export function migrateFerryJourney(journey){
 const j=journey||{};
 return {location:['town','airport','naha'].includes(j.location)?j.location:'town',roundTrip:j.roundTrip===true,ticket:Number.isFinite(j.ticket)?j.ticket:null,checked:j.checked===true,timetableRevision:1};
}
