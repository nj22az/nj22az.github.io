import {townCalendarAt} from '../town-clock.js';
/**
 * Sakura Shōten is open 24 hours, every day (the creator, 2026-10-12: "Sakura is always open, it should change to 24-7";
 * docs/KITANO-JIMA.md §3). The rota: Thuan keeps the day shift on weekdays, Nhung covers it at the weekend while Thuan
 * is home on Kitano-jima, and Grandmother Sakurai, who owns the shop today and lives in Flat 2, Kitahama Heights, keeps
 * the night counter until the day shift. Chin has no shift here any more: he is the ferry's motorman (the owner's
 * ruling of 19 October 2026, docs/CAST-CONSOLIDATION.md §3: "Chin has NO Sakura clerk, till, stock-cover or
 * relief-shopkeeper duties"), aboard through the ship's day. The night counter is provisional: phase 3 of the
 * consolidation gives Sakura Thuan's ownership and its opening hours, and phase 4 retires Grandmother Sakurai.
 */
const minute=m=>((m%1440)+1440)%1440;
// The day clerk hands over at 20:30: the last half hour is her end-of-day restock (shop-stock.js closingDay, from 20:00)
// with the night clerk already in the shop.
export const SAKURA_DAY_SHIFT=Object.freeze([540,1230]);
export const SAKURA_NIGHT_SHIFT=Object.freeze([1230,360]);
export const isWeekend=minutes=>{const w=townCalendarAt(minutes).weekday;return w===0||w===6;};
export const sakuraNightShift=minutes=>{const m=minute(minutes);return m>=SAKURA_NIGHT_SHIFT[0]||m<SAKURA_NIGHT_SHIFT[1];};
export const sakuraDayShift=minutes=>{const m=minute(minutes);return m>=SAKURA_DAY_SHIFT[0]&&m<SAKURA_DAY_SHIFT[1];};
/** Who is at the counter at this minute. */
export function sakuraClerkAt(minutes){
 if(sakuraDayShift(minutes))return isWeekend(minutes)?'Nhung':'Thuan';
 return 'Grandmother Sakurai';
}
/** The walking residents who take a shift at Sakura. Never Chin (above). */
export const SAKURA_STAFF=Object.freeze(['Thuan','Nhung','Grandmother Sakurai']);
/** Whether this resident is on their Sakura shift at this minute. */
export const onSakuraShift=(name,minutes)=>sakuraClerkAt(minutes)===name;
