/**
 * Everybody on the island, where they live and what they do: the households, built from the cast (cast.js), which
 * is the one list of people (docs/CAST-PLAN.md). This file keeps the homes and their addresses.
 *
 * `home` is a building that exists on the island: a plot id in okinawa/layout.js (Nishi-machi, the east-back houses,
 * the shop-houses, Kitahama), a site id (the yard houses, the koban, the harbour office), or the ferry. Shop-house
 * families live above the shop. A home nobody in the cast lives in is to let. Nobody lives off the island; the ferry
 * brings visitors and freight.
 */
import {CAST} from './cast.js';
const HOMES=Object.freeze([
 ['kitano-1','Kitano hamlet, Kitano-jima'],
 ['kitano-3','Kitano hamlet, Kitano-jima'],
 ['office','Harbour office (the bed behind the screen)'],
 ['clinic','The doctor’s flat behind the town hall clinic'],
 ['ferry','Aboard the Minato Maru (the chief engineer’s cabin)'],
 ['koban','Minato police box'],
 ['resident-home-aya','1 Front-Row Yard'],
 ['resident-home-kenji','2 Front-Row Yard'],
 ['market','The flat over Sakura Shōten'],
 ['kitahama-1','1 Kitahama'],
 ['kitahama-2','2 Kitahama'],
 ['kitahama-3','3 Kitahama'],
 ['kitahama-4','4 Kitahama'],
 ['kitahama-5','5 Kitahama'],
 ['kitahama-6','6 Kitahama'],
 ['kitahama-7','7 Kitahama'],
 ['kitahama-8','8 Kitahama'],
 ['kitahama-9','9 Kitahama'],
 ['kitahama-10','10 Kitahama'],
 ['kitahama-11','11 Kitahama'],
 ['kitahama-12','12 Kitahama'],
 ['kitahama-flats','Kitahama Heights, Fukugi Lane'],
 ['fumoto-1','1 Fumoto'],
 ['fumoto-2','2 Fumoto'],
 ['fumoto-3','3 Fumoto'],
 ['fumoto-4','4 Fumoto'],
 ['higa','Higa house, Nishi-machi'],
 ['kinjo','Kinjō house, Nishi-machi'],
 ['oshiro','Ōshiro house, Nishi-machi'],
 ['nakasone','Nakasone house, east back'],
 ['miyagi','Miyagi house, east back'],
 ['tamaki','Tamaki house, east back'],
 ['kamiya','Kamiya house, east back'],
 ['nakamura',"Above Nakamura Zenzai"],
 ['shimabukuro','Above the post office'],
 ['arakaki',"Above Aragaki Confectionery Store"],
 ['yonamine',"Above Yonamine Fresh Fish Store"],
]);
export const ISLAND_HOMES=Object.freeze(HOMES.map(([home,address])=>Object.freeze({home,address})));
export const ISLAND_HOUSEHOLDS=Object.freeze(ISLAND_HOMES.map(({home,address})=>{
 const members=CAST.filter(p=>p.home===home||p.alsoAt.includes(home)).map(p=>Object.freeze({name:p.name,purpose:p.purpose}));
 return Object.freeze({home,address,members:Object.freeze(members),...(members.length?{}:{toLet:true})});
}));

export const householdAtHome=id=>ISLAND_HOUSEHOLDS.find(h=>h.home===id)||null;
/** A nameplate's "who lives here" line. */
export function residentsLine(id){
 const h=householdAtHome(id);if(!h)return '';
 if(h.toLet)return 'Nobody lives here yet. The board on the gate says to ask at the town hall.';
 return 'Lives here: '+h.members.map(m=>m.name+' ('+m.purpose+')').join('; ')+'.';
}
