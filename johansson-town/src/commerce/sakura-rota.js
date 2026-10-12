import {townCalendarAt} from '../town-clock.js';
/**
 * Sakura Shōten is open 24 hours, every day (the creator, 2026-10-12: "Sakura is always open, it should change to 24-7
 * and have Chin work the night shift"; docs/KITANO-JIMA.md §3). The rota: Thuan keeps the day shift on weekdays, Nhung
 * covers it at the weekend while Thuan is home on Kitano-jima, Chin (Thao's husband) works every night, and Grandmother
 * Sakurai, who owns the shop and lives above it, takes the till between the night shift and the day shift.
 */
const minute=m=>((m%1440)+1440)%1440;
export const SAKURA_DAY_SHIFT=Object.freeze([540,1200]);
export const SAKURA_NIGHT_SHIFT=Object.freeze([1200,360]);
export const isWeekend=minutes=>{const w=townCalendarAt(minutes).weekday;return w===0||w===6;};
export const sakuraNightShift=minutes=>{const m=minute(minutes);return m>=SAKURA_NIGHT_SHIFT[0]||m<SAKURA_NIGHT_SHIFT[1];};
export const sakuraDayShift=minutes=>{const m=minute(minutes);return m>=SAKURA_DAY_SHIFT[0]&&m<SAKURA_DAY_SHIFT[1];};
/** Who is at the counter at this minute. */
export function sakuraClerkAt(minutes){
 if(sakuraDayShift(minutes))return isWeekend(minutes)?'Nhung':'Thuan';
 if(sakuraNightShift(minutes))return 'Chin';
 return 'Grandmother Sakurai';
}
/** The walking residents who take a shift at Sakura. */
export const SAKURA_STAFF=Object.freeze(['Thuan','Nhung','Chin']);
/** Whether this resident is on their Sakura shift at this minute. */
export const onSakuraShift=(name,minutes)=>sakuraClerkAt(minutes)===name;
