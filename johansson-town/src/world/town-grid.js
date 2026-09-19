import {ALLEY_BOOKS,ALLEY_WORKSHOP} from './business-layout.js';
import {consolidateBusinesses} from './businesses.js';
import {BUS_STATION} from './bus-station.js';
import {PARK} from './park-layout.js';
import {peninsulaActive} from './town-mode.js';
import {BOOKSHOP_WORKSHOP_PLOT} from './bookshop-workshop-layout.js';
import {MAIN_ROAD} from './main-road.js';
export const TOWN_GRID=Object.freeze({north:BUS_STATION.maxZ,south:-38,quay:-44,west:-16,east:PARK.x+PARK.half});
export const SHOP_ADDRESSES=Object.freeze({
 market:{side:-1,z:-28.5},
});
export const TEA_HOUSE=Object.freeze({x:8.4,z:13.4,door:[8.4,0,18.4]});
export const TOWN_DESTINATIONS=Object.freeze({
 bus:[...BUS_STATION.queue],busArrival:[...BUS_STATION.arrival],busDriver:[...BUS_STATION.driver],
 workshop:[ALLEY_WORKSHOP.door[0],ALLEY_WORKSHOP.door[2]],books:[ALLEY_BOOKS.door[0],ALLEY_BOOKS.door[2]],pier:[-1.6,-62],
});
export function applyShopAddresses(sites){
 consolidateBusinesses(sites);
 for(const site of sites){const address=SHOP_ADDRESSES[site.id];if(address)Object.assign(site,address);}
 // Profiles, Kenji's escort and the cat retain these live destination arrays.
 const books=peninsulaActive()?[MAIN_ROAD.pavementWest+.65,BOOKSHOP_WORKSHOP_PLOT.z]:[ALLEY_BOOKS.door[0],ALLEY_BOOKS.door[2]];
 const workshop=peninsulaActive()?books:[ALLEY_WORKSHOP.door[0],ALLEY_WORKSHOP.door[2]];
 TOWN_DESTINATIONS.books.splice(0,2,...books);TOWN_DESTINATIONS.workshop.splice(0,2,...workshop);
}
