const shifts={
 // Day staff share the evening service; night staff return on the morning bus.
 // Work hours stay unchanged. Departure identifies the service's arrival time.
 Thuan:{arrival:510,start:540,finish:1200,departure:1320},
 Aya:{arrival:510,start:540,finish:1110,departure:1320},
 Kenji:{arrival:510,start:540,finish:1140,departure:1320},
 'Mrs Sato':{arrival:510,start:540,finish:1260,departure:1320},
 Reiko:{arrival:870,start:900,finish:1470,departure:1950},
 Tetsuo:{arrival:870,start:1020,finish:1440,departure:1950},
 // Nao takes the morning service so her Konbini errand and park walk happen before
 // Minato opens. Her return service is the next morning after the night shift.
 Nao:{arrival:510,start:960,finish:1620,departure:1950},
 'Officer Mori':{arrival:870,start:1200,finish:1800,departure:1950},
 'Harbour master':{permanent:true},
 'Bus driver':{permanent:true},
};
export const COMMUTER_SHIFTS=Object.freeze(Object.fromEntries(Object.entries(shifts).map(([name,shift])=>[name,Object.freeze(shift)])));
const minuteOfDay=m=>((m%1440)+1440)%1440;
export const shiftFor=profile=>COMMUTER_SHIFTS[typeof profile==='string'?profile:profile?.name]||null;
function elapsed(profile,minutes){const shift=shiftFor(profile);return shift&&!shift.permanent?minuteOfDay(minutes-shift.arrival):null;}

/**
 * The bus somebody actually goes home on.
 *
 * A shift with a lateDeparture has two: the one straight after work, and a later one
 * for the evening they stay out. Rain is what decides it, because rain is what keeps
 * everybody in this town indoors.
 */
export function departureFor(profile,rain=false){
 const shift=shiftFor(profile);
 if(!shift||shift.permanent)return null;
 return !rain&&Number.isFinite(shift.lateDeparture)?shift.lateDeparture:shift.departure;
}

/**
 * The Harbour Line timetable, in minutes past midnight.
 *
 * Three daily calls: morning, afternoon and evening. Residents share services.
 * These are arrival times; the bus waits BUS_DWELL minutes before returning.
 * The bus model, commuters and stop notice all use this schedule.
 */
export const HARBOUR_LINE=Object.freeze([
 510,  //  08:30  day staff arrive; night staff go home
 870,  //  14:30  late-shift staff arrive
1320,  //  22:00  day staff go home
]);

/** How long the bus stands at the terminus with its doors open, in town minutes. */
export const BUS_DWELL=15;

/** Minutes until the next service, and which one it is. */
export function nextService(minutes){
 const m=minuteOfDay(minutes);
 for(const service of HARBOUR_LINE)if(service>=m)return {service,wait:service-m};
 return {service:HARBOUR_LINE[0],wait:1440-m+HARBOUR_LINE[0]};
}
export function serviceTime(minutes){
 const m=minuteOfDay(minutes);
 return String(Math.floor(m/60)).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0');
}
/** The stop notice reads the same clock and schedule as the bus. */
export function harbourTimetable(minutes){
 const m=minuteOfDay(minutes),current=HARBOUR_LINE.find(s=>m>=s&&m<s+BUS_DWELL);
 const due=nextService(minutes);
 const status=current===undefined
  ?'Next arrival: '+serviceTime(due.service)+(due.wait===0?' · due now':' · in '+Math.ceil(due.wait)+' town minutes')
  :'Scheduled stop: '+serviceTime(current)+'–'+serviceTime(current+BUS_DWELL);
 return 'Harbour Line · Three services daily (town time)\nArrival → Departure\n'
  +HARBOUR_LINE.map(s=>serviceTime(s)+' → '+serviceTime(s+BUS_DWELL)).join('\n')
  +'\n\nThe bus waits '+BUS_DWELL+' town minutes at each stop.\n'+status;
}
export function shiftActive(profile,minutes){
 const shift=shiftFor(profile),e=elapsed(profile,minutes);
 return !!shift&&(shift.permanent||e>=shift.start-shift.arrival&&e<shift.finish-shift.arrival);
}
export function commuterPhase(profile,minutes,rain=false){
 const shift=shiftFor(profile),e=elapsed(profile,minutes);
 if(!shift)return 'town';
 if(shift.permanent)return 'permanent';
 const finish=shift.finish-shift.arrival,departure=departureFor(profile,rain)-shift.arrival;
 if(e<30)return 'arriving';
 if(e>=departure)return 'away';
 if(e>=finish)return 'departing';
 return 'town';
}
