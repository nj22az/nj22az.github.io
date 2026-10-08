import {TOWN_DESTINATIONS} from '../world/town-grid.js';
/** Short, staggered errands. No visits after closing or while someone is travelling away. */
export const BOOKSHOP_VISITS=Object.freeze({Thao:[635,660],Tetsuo:[755,780],Chin:[910,935],'Harbour master':[1025,1050]});
export function bookshopVisitPlan(profile,minutes,base,state={}){
 const window=BOOKSHOP_VISITS[profile.name],m=((minutes%1440)+1440)%1440;
 if(state?.bookshop?.completed?.some(v=>v.key===Math.floor(minutes/1440)+':'+profile.name))return base;
 if(!window||m<window[0]||m>=window[1]||!['work','home','park','stroll'].includes(base.place))return base;
 return {place:'bookshop',target:TOWN_DESTINATIONS.books,activity:'browsing at Front-Row Books'};
}
