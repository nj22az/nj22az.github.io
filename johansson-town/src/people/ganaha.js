import {HARBOUR_LINE,BUS_DWELL,CROSSING_MINUTES,nextService,serviceTime} from './commuter-schedule.js';
import {FERRY_FARE} from '../island/services.js';

/**
 * Ms Ganaha, the ticket clerk at the Minato Port Terminal's middle window (people/ferry-crew.js FERRY_SHORE), and the
 * island's guide (the creator, 2026-10-12: "Ms Ganaha", for the character who can speak about the islands; plan:
 * the studio's town-studio/island-guide/plan.md). Everybody going to the islands passes her window, so she is the
 * one who knows: she sells the tickets, keeps the timetable, answers the ferry desk's telephone and hands out the
 * strait map. Whatever she says comes from the town's own data, so she cannot contradict the world.
 *
 * Her hours, 12:00 to 22:15: the 14:30 and 22:00 commuter boats and every crossing on request in between, and the
 * evening telephone (izakaya-play.js: she picks up on the fourth ring). Before noon the oiler sells the tickets
 * at the gangway (FERRY_WATCH: the oiler, at the gangway while she waits), so the morning boat needs no clerk.
 */
export const GANAHA=Object.freeze({name:'Ms Ganaha',from:12*60,until:22*60+15,
 window:'Airport ferry',lives:'Kitahama Heights, flat 1'});

const minuteOfDay=m=>((m%1440)+1440)%1440;
export const ganahaAtWindow=minutes=>{const m=minuteOfDay(minutes);return m>=GANAHA.from&&m<GANAHA.until;};

/** Her answer to "When is the next boat?", from the timetable the terminal itself posts (commuter-schedule.js). */
export function nextBoatLine(minutes){
 const m=minuteOfDay(minutes),alongside=HARBOUR_LINE.find(s=>m>=s&&m<s+BUS_DWELL);
 // The fare the window actually charges (island/services.js): none for now, so she says so.
 const fare=FERRY_FARE?`a return is ¥${FERRY_FARE}`:'there is no fare this season';
 if(alongside!==undefined)return `The commuter boat is alongside now, until ${serviceTime(alongside+BUS_DWELL)}. If you are going across (${fare}), get your ticket and go straight down the outer pier.`;
 const due=nextService(minutes),wait=Math.ceil(due.wait);
 const when=wait<=60?`in ${wait} minute${wait===1?'':'s'}`:`at ${serviceTime(due.service)}`;
 return `The boat goes on request, love: ${fare}, and she sails when the cars are aboard. It is ${CROSSING_MINUTES} minutes across to Kitano-jima. The commuter boat is due ${when}.`;
}

/** What she says first, by the hour. */
export function ganahaGreeting(minutes){
 const m=minuteOfDay(minutes),h=m/60;
 return h<13?'Afternoon window’s open, love. Where are you off to?':h<18?'Port Terminal. Where are you off to?':m<22*60?'Evening, love. The last commuter boat’s in at ten. Where are you off to?':'The last boat’s alongside, love. Where are you off to?';
}
