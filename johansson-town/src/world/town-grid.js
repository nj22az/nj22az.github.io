import {ALLEY_BOOKS,ALLEY_WORKSHOP} from './business-layout.js';
import {consolidateBusinesses} from './businesses.js';
export const TOWN_GRID=Object.freeze({north:31,south:-38,quay:-44,west:-36,east:38});
export const SHOP_ADDRESSES=Object.freeze({
 market:{side:-1,z:-28},
});
export const TEA_HOUSE=Object.freeze({x:28,z:25,door:[28,0,30]});
export const TOWN_DESTINATIONS=Object.freeze({
 bus:[-14,30],bathhouse:[-28,28],school:[40,24],shrine:[32,47],
 workshop:[ALLEY_WORKSHOP.door[0],ALLEY_WORKSHOP.door[2]],books:[ALLEY_BOOKS.door[0],ALLEY_BOOKS.door[2]],pier:[-1.6,-62],
});
export function applyShopAddresses(sites){
 consolidateBusinesses(sites);
 for(const site of sites){const address=SHOP_ADDRESSES[site.id];if(address)Object.assign(site,address);}
}
