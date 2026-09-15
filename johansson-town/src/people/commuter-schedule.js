const shifts={
 Thuan:{arrival:510,start:540,finish:1200,departure:1260},
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
export function shiftActive(profile,minutes){
 const shift=shiftFor(profile),e=elapsed(profile,minutes);
 return !!shift&&(shift.permanent||e>=shift.start-shift.arrival&&e<shift.finish-shift.arrival);
}
export function commuterPhase(profile,minutes){
 const shift=shiftFor(profile),e=elapsed(profile,minutes);
 if(!shift)return 'town';
 if(shift.permanent)return 'permanent';
 const finish=shift.finish-shift.arrival,departure=shift.departure-shift.arrival;
 if(e<30)return 'arriving';
 if(e>=departure)return 'away';
 if(e>=finish)return 'departing';
 return 'town';
}
