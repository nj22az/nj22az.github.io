/**
 * The town keeps real time.
 *
 * It used to run a town minute to every real second, so a day went by in twenty-four
 * minutes. Now the clock is the one on your wall: the same hour and minute, today's date
 * -- in 1997, because that is when the town is. The day number the schedules count in
 * is the local day since 1970, so midnight turns over when yours does.
 */
export const TOWN_YEAR=1997;

/** Absolute town minutes for a real moment: local minutes since 1 January 1970. */
export function realTownMinutes(now=new Date()){
 return (now.getTime()-now.getTimezoneOffset()*60000)/60000;
}

/** The town's calendar for a real moment: today's month and day, in 1997. */
export function townCalendar(now=new Date()){
 const month=now.getMonth(),day=month===1&&now.getDate()===29?28:now.getDate();
 const date=new Date(TOWN_YEAR,month,day,now.getHours(),now.getMinutes(),now.getSeconds());
 return {date,weekday:date.getDay(),real:now};
}

/** '14:07 · Saturday 20 September 1997' */
export function townClockLine(now=new Date()){
 const {date}=townCalendar(now);
 const hm=String(date.getHours()).padStart(2,'0')+':'+String(date.getMinutes()).padStart(2,'0');
 return hm+' · '+date.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
}

/**
 * How to get from a saved clock to now. Up to a day behind, the town is fast-forwarded
 * through the gap so people are where they would be; further than that (or a save from
 * the old fast clock) it simply opens at the present.
 */
export function clockCatchUp(savedMinutes,now=new Date(),maxMinutes=1440){
 const real=realTownMinutes(now);
 if(!Number.isFinite(savedMinutes))return {start:real,fastForward:0};
 const gap=real-savedMinutes;
 // A few minutes is nothing worth replaying: people are where they were.
 if(gap<=5||gap>maxMinutes)return {start:real,fastForward:0};
 return {start:savedMinutes,fastForward:gap};
}

/** The town date for an absolute town minute, so a fast clock turns the days over too. */
export function townCalendarAt(minutes){
 const day=Math.floor(minutes/1440),d=new Date(day*86400000);   // local days since 1970, read as UTC
 const month=d.getUTCMonth(),date=month===1&&d.getUTCDate()===29?28:d.getUTCDate();
 const m=((minutes%1440)+1440)%1440;
 const town=new Date(TOWN_YEAR,month,date,Math.floor(m/60),Math.floor(m%60));
 return {date:town,weekday:town.getDay()};
}
export function townClockLineAt(minutes){
 const {date}=townCalendarAt(minutes);
 return String(date.getHours()).padStart(2,'0')+':'+String(date.getMinutes()).padStart(2,'0')+' · '+date.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
}

/**
 * How the clock is set: 'real' follows the device; 'saved' carries on from where this
 * player left off; or a start time ('06:00' ...). The last two can run fast.
 */
export const CLOCK_KEY='johansson-town-clock';
export const CLOCK_SPEEDS=Object.freeze([1,2,4]);
const validStart=start=>start==='real'||start==='saved'||(/^([01]\d|2[0-3]):[0-5]\d$/.test(start??''));
export function readClockSetting(storage){
 let s=null;try{s=JSON.parse(storage?.getItem?.(CLOCK_KEY));}catch{}
 const start=validStart(s?.start)?s.start:'real';
 const speed=start!=='real'&&CLOCK_SPEEDS.includes(s?.speed)?s.speed:1;
 return {start,speed};
}
export function writeClockSetting(storage,setting){
 const start=validStart(setting?.start)?setting.start:'real';
 const speed=start!=='real'&&CLOCK_SPEEDS.includes(setting?.speed)?setting.speed:1;
 try{storage.setItem(CLOCK_KEY,JSON.stringify({start,speed}));}catch{}
 return {start,speed};
}
/** The town minute a new session opens at, for a setting and this player's saved clock. */
export function startingMinutes(setting,savedMinutes,now=new Date()){
 const real=realTownMinutes(now),today=Math.floor(real/1440)*1440;
 if(setting.start==='real')return real;
 if(setting.start==='saved'){
  if(!Number.isFinite(savedMinutes))return real;
  // A save from the old fast clock counted from zero: keep its time of day, on today.
  return savedMinutes>1e6?savedMinutes:today+((savedMinutes%1440)+1440)%1440;
 }
 const [h,m]=setting.start.split(':').map(Number);
 return today+h*60+m;
}
/**
 * A running clock: real time, or a town time that runs at `speed` town minutes a real
 * minute from an anchor. Moving it (a new time, a new speed, time skipped) re-anchors.
 */
export function createClock(setting,startMinutes,now=()=>Date.now()){
 let mode=setting.start==='real'?'real':'set',speed=mode==='real'?1:setting.speed,anchorTown=startMinutes,anchorReal=now(),ahead=0;
 return {
  get mode(){return mode;},get speed(){return speed;},
  /** In real time, how far events have moved the town on past your own clock. */
  get ahead(){return ahead;},set ahead(value){ahead=Number.isFinite(value)?Math.max(0,Math.min(7*1440,value)):0;},
  target(){return mode==='real'?realTownMinutes(new Date(now()))+ahead:anchorTown+(now()-anchorReal)/60000*speed;},
  set(minutes,newSpeed=speed){mode='set';speed=CLOCK_SPEEDS.includes(newSpeed)?newSpeed:1;anchorTown=minutes;anchorReal=now();},
  /** Time spent on something -- a rest, a meal, a bath -- moves the town on, in either mode. */
  pass(minutes){if(!(minutes>0))return;if(mode==='real')this.ahead=ahead+minutes;else{anchorTown+=minutes;}},
  real(){mode='real';speed=1;},
 };
}

/**
 * The calendar axis everything dated keys off (people/happenings.js, and later the diary,
 * the soundscape and the town book): which day it is, the 1997 date, the island's season
 * and the part of the day. One helper, so they all turn over together.
 */
export const townDay=minutes=>Math.floor(minutes/1440);
/** {month 1–12, day, weekday 0 (Sunday)–6, key 'MM-DD'} for an absolute town minute. */
export function townDate(minutes){
 const {date,weekday}=townCalendarAt(minutes),month=date.getMonth()+1,day=date.getDate();
 return {month,day,weekday,key:String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0')};
}
/**
 * Okinawa's year: a short mild winter, spring, the rainy season (tsuyu, from about the
 * tenth of May to the end of June, ending around Irei no Hi), the long summer and autumn.
 */
export function okinawaSeason(minutes){
 const {key}=townDate(minutes);
 if(key>='12-01'||key<'03-01')return 'winter';
 if(key<'05-10')return 'spring';
 if(key<'06-23')return 'rainy';
 if(key<'10-01')return 'summer';
 return 'autumn';
}
/** The part of the day: night, morning (05–10), midday (10–15), afternoon (15–19), evening (19–22). */
export function timeBand(minutes){
 const h=(((minutes%1440)+1440)%1440)/60;
 return h<5?'night':h<10?'morning':h<15?'midday':h<19?'afternoon':h<22?'evening':'night';
}
