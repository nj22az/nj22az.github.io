// Metres, shared by the street builders, residents and visitor map. Buildings
// keep their original scale; whole addresses move into three compact blocks.
export const TOWN_GRID=Object.freeze({north:31,south:-38,quay:-44,west:-36,east:38});
export const SHOP_ADDRESSES=Object.freeze({
 office:{side:-1,z:14},frontrow:{side:1,z:14},
 form3d:{side:-1,z:-8},stepwise:{side:1,z:-8},
 market:{side:-1,z:-28},career:{side:1,z:-28},
});
export const TEA_HOUSE=Object.freeze({x:28,z:25,door:[28,0,30]});
export const TOWN_DESTINATIONS=Object.freeze({
 bus:[-14,30],bathhouse:[-28,28],school:[40,24],shrine:[32,47],
 workshop:[-4,-5.5],books:[4,17],pier:[-1.6,-62],
});
export function applyShopAddresses(sites){
 for(const site of sites){const address=SHOP_ADDRESSES[site.id];if(address)Object.assign(site,address);}
}
