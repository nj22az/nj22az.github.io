const shifts={
 // She finishes at eight and there is a bus at nine. If she goes for a beer at
 // Minato first she stays for the ten o'clock instead, which is the last one that
 // gets her home; in the rain she does not bother and takes the nine.
 Thuan:{arrival:510,start:540,finish:1200,departure:1260,lateDeparture:1320},
 Aya:{arrival:510,start:540,finish:1110,departure:1200},
 Kenji:{arrival:510,start:540,finish:1140,departure:1200},
 'Mrs Sato':{arrival:510,start:540,finish:1260,departure:1320},
 Reiko:{arrival:870,start:900,finish:1470,departure:1530},
 Tetsuo:{arrival:990,start:1020,finish:1440,departure:1530},
 Nao:{arrival:870,start:960,finish:1620,departure:1680},
 'Officer Mori':{arrival:1140,start:1200,finish:1800,departure:1860},
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
 * Eleven daily calls, at least an hour apart. Residents share a service where
 * possible: Aya with Kenji, Nao with Reiko, and Tetsuo with Reiko after midnight.
 * These are arrival times; the bus normally departs BUS_DWELL minutes later.
 * The bus model, commuters and stop notice all use this schedule.
 */
export const HARBOUR_LINE=Object.freeze([
  90,  //  01:30  Reiko and Tetsuo off nights
 240,  //  04:00  Nao, after the izakaya closes
 420,  //  07:00  Officer Mori comes off patrol
 510,  //  08:30  the shop workers arrive
 720,  //  12:00  midday
 870,  //  14:30  Reiko and Nao
 990,  //  16:30  Tetsuo
1140,  //  19:00  Officer Mori for the night shift
1200,  //  20:00  Aya and Kenji home
1260,  //  21:00  Thuan home, unless she is at Minato
1320,  //  22:00  Mrs Sato, and Thuan when she is
]);

/** How long the bus stands at the terminus with its doors open, in town minutes. */
export const BUS_DWELL=4;

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
 return 'Harbour Line · Daily arrivals (town time)\n'+HARBOUR_LINE.map(serviceTime).join(' · ')
  +'\n\nFour-minute stop; brief hold for boarding passengers.\n'+status;
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
