import {ALLEY_BOOKS,ALLEY_WORKSHOP} from './business-layout.js';
import {westShopDoor} from './west-shops.js';
import {consolidateBusinesses} from './businesses.js';
import {BUS_STATION} from './bus-station.js';
import {PARK} from './park-layout.js';
export const TOWN_GRID=Object.freeze({north:BUS_STATION.maxZ,south:-38,quay:-44,west:-16,east:PARK.x+PARK.half});
export const SHOP_ADDRESSES=Object.freeze({
 market:{side:-1,z:-28.5},
});
// Street door and the last outdoor step through the opening. Keep profile.work
// off this doorway so the player entrance stays clear while staff are inside.
export const MARKET_DOOR=Object.freeze([SHOP_ADDRESSES.market.side*5.5,SHOP_ADDRESSES.market.z]);
export const MARKET_THRESHOLD=Object.freeze([SHOP_ADDRESSES.market.side*6.3,SHOP_ADDRESSES.market.z]);
export const TEA_HOUSE=Object.freeze({x:8.4,z:13.4,door:[8.4,0,18.4]});
export const TOWN_DESTINATIONS=Object.freeze({
 bus:[...BUS_STATION.queue],busArrival:[...BUS_STATION.arrival],busDriver:[...BUS_STATION.driver],
 // Read rather than stored: which layout is running is not settled when this module
 // is first read, and on the peninsula these two shops stand on the west pavement
 // instead of in the night-market alley. Kenji and Tetsuo worked at the alley's door
 // for as long as it was stored -- out on the boardwalk, nowhere near their shop.
 get workshop(){return westShopDoor('form3d')||[ALLEY_WORKSHOP.door[0],ALLEY_WORKSHOP.door[2]];},
 get books(){return westShopDoor('frontrow')||[ALLEY_BOOKS.door[0],ALLEY_BOOKS.door[2]];},
 pier:[-1.6,-62],
});
export function applyShopAddresses(sites){
 consolidateBusinesses(sites);
 for(const site of sites){const address=SHOP_ADDRESSES[site.id];if(address)Object.assign(site,address);}
}
