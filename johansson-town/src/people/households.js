import {householdAtHome,householdTitle} from './island-households.js';

// The walking residents' playable rooms. Historical street-entry keys survive only for archived layouts.
const ROOMS=[
 {home:'kitahama-1',entry:'one',number:'1'},
 {home:'resident-home-aya',entry:'two',number:'1'},
 // Nhung's, with Kōji and Riku (phase 3 of docs/CAST-CONSOLIDATION.md); the archived street entry is her old one.
 {home:'kitahama-3',entry:'two',number:'3'},
 {home:'resident-home-kenji',entry:'three',number:'2'},
 {home:'kitahama-2',entry:'four',number:'2'},
 {home:'koban',entry:'four'},
 {home:'office',entry:'five'},
 {home:'kitahama-6',entry:'five',number:'6'},
];
export const HOUSEHOLDS=Object.freeze(ROOMS.map(room=>{
 const h=householdAtHome(room.home);
 return Object.freeze({...room,id:h.entranceSiteId,homeId:h.home,residents:h.residents,address:h.address,title:householdTitle(h)});
}));
/** Existing saves and old room links resolve to the same surviving entrance. */
export const HOME_ALIASES=Object.freeze({
 'home-kitano-3':'home-kitahama-5',
 'home-market':'home-kitahama-flat-2','home-ferry':'home-kitahama-flat-3',
 ...Object.fromEntries(['kitahama-7','kitahama-9','kitahama-10','kitahama-11','kitahama-12','nakasone','miyagi','arakaki','yonamine'].flatMap(id=>[[id,'mayor-office'],['home-'+id,'mayor-office']])),
 'yuri-home':'resident-home-thuan','resident-home-nao':'resident-home-thuan',
 'resident-home-thao':'resident-home-thuan','resident-home-chin':'resident-home-thuan',
 'resident-home-reiko':'resident-home-aya','resident-home-tetsuo':'resident-home-kenji',
 'resident-home-officer-mori':'koban','resident-home-harbour-master':'office',
 'resident-home-bus-driver':'home-kitahama-6',
});
export const canonicalHomeId=id=>HOME_ALIASES[id]||id;
export const householdFor=name=>HOUSEHOLDS.find(h=>h.residents.includes(name));
export const householdAt=site=>HOUSEHOLDS.find(h=>h.id===canonicalHomeId(site?.id)||h.homeId===site?.plot)||householdFor(site?.homeOwner);
export const householdNames=site=>site?.homeOwners||site?.residents||householdAt(site)?.residents||(site?.homeOwner?[site.homeOwner]:[]);
