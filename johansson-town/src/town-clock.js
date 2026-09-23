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
