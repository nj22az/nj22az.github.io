import {townDate} from '../town-clock.js';

/**
 * Residents' birthdays, as 'MM-DD'. Only real ones go here: the creator sets them.
 *
 * Every resident's maker profile carries a birthday field, but none has been chosen yet
 * (they all show the maker's starting value, 1 July), so the town knows no birthdays and
 * claims none. When the creator gives a resident a birthday, write it here, for example
 * `Nhung:'03-14'`. From then on, on that day of the town's 1997:
 *   - they greet Johansson with their birthday line (people/greetings.js),
 *   - the evening before, the news says it is their birthday tomorrow (feed/evening-news.js),
 *   - and the day's moments, so the diary and the news, record it (activities.js).
 * Thuan is the town's own character: her birthday is the creator's to choose as well.
 */
export const BIRTHDAYS=Object.freeze({
});

const VALID=/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
/** Whether today (a town minute) is `name`'s birthday. False for anyone without a real one. */
export function birthdayOn(name,minutes,table=BIRTHDAYS){
 const date=table[name];return typeof date==='string'&&VALID.test(date)&&townDate(minutes).key===date;
}
/** The residents whose birthday is on this town day. */
export function birthdaysOn(minutes,table=BIRTHDAYS){
 return Object.keys(table).filter(name=>birthdayOn(name,minutes,table));
}
