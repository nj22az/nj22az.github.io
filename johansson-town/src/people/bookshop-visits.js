import {isWeekend} from '../commerce/sakura-rota.js';
import {TOWN_DESTINATIONS} from '../world/town-grid.js';
/**
 * Short, staggered errands. No visits after closing or while someone is travelling away. Chin's afternoon visit went to
 * Mrs Sato with the consolidation (docs/CAST-CONSOLIDATION.md §9): Chin is the ferry's motorman, aboard until the shore
 * power, and Mrs Sato is on her way home to Kitahama from the washing-up by half past three (Officer Mori, the other
 * one ashore then, is in his morning routine until the station desk at four).
 */
export const BOOKSHOP_VISITS=Object.freeze({Thao:[635,660],Tetsuo:[755,780],'Mrs Sato':[935,960],'Harbour master':[1025,1050]});
export function bookshopVisitPlan(profile,minutes,base,state={}){
 const window=BOOKSHOP_VISITS[profile.name],m=((minutes%1440)+1440)%1440;
 if(state?.bookshop?.completed?.some(v=>v.key===Math.floor(minutes/1440)+':'+profile.name))return base;
 // Front Row is closed at the weekend (Nhung is at Sakura; batch 7b).
 if(!window||isWeekend(minutes)||m<window[0]||m>=window[1]||!['work','home','park','stroll'].includes(base.place))return base;
 return {place:'bookshop',target:TOWN_DESTINATIONS.books,activity:'browsing at Front-Row Books'};
}
