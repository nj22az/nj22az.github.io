const shifts={
 // She finishes at eight and there is a bus at nine. If she goes for a beer at
 // Minato first she stays for the ten o'clock instead, which is the last one that
 // gets her home; in the rain she does not bother and takes the nine.
 Thuan:{arrival:510,start:540,finish:1200,departure:1260,lateDeparture:1320},
 Aya:{arrival:510,start:540,finish:1110,departure:1170},
 Kenji:{arrival:510,start:540,finish:1140,departure:1200},
 'Mrs Sato':{arrival:510,start:540,finish:1260,departure:1320},
 Reiko:{arrival:870,start:900,finish:1470,departure:1530},
 Tetsuo:{arrival:990,start:1020,finish:1440,departure:1500},
 Nao:{arrival:900,start:960,finish:1620,departure:1680},
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
 * It used to be a loop on a stopwatch: twenty-six seconds at the stop, a minute's
 * round trip, all day and all night whether or not anybody wanted it. A branch line
 * to a harbour of four hundred people does not run every minute; it runs when the
 * shifts change, and the rest of the day it is somewhere else.
 *
 * Every arrival and departure in the shift table above has a service here, which is
 * what stops anyone being left standing at the terminus — there is a test for it. The
 * midday one carries nobody and is here because a timetable with a six-hour hole in
 * the middle of the day reads as a mistake rather than as a quiet line.
 */
export const HARBOUR_LINE=Object.freeze([
  60,  //  01:00  Tetsuo off nights
  90,  //  01:30  Reiko after him
 240,  //  04:00  Nao, after the izakaya closes
 420,  //  07:00  Officer Mori comes off patrol
 510,  //  08:30  the shop workers arrive
 720,  //  12:00  midday
 870,  //  14:30  Reiko
 900,  //  15:00  Nao
 990,  //  16:30  Tetsuo
1140,  //  19:00  Officer Mori for the night shift
1170,  //  19:30  Aya home
1200,  //  20:00  Kenji home
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
