// One household is one room and one save destination. Roommates retain individual schedules.
export const HOUSEHOLDS=Object.freeze([
 // Thuan, Thao and Chin, Thao's husband (batch 7b): Thuan's weekday room; her home is Johansson's on Kitano-jima.
 {id:'yuri-home',entry:'one',number:'1',residents:['Thuan','Thao','Chin']},
 {id:'resident-home-aya',entry:'two',number:'2',residents:['Nhung','Reiko']},
 // 2 Front-Row Yard (resident-home-kenji) is to let: Chin lives with Thao, Tetsuo on Kitano-jima (kitano-residents.js).
 {id:'resident-home-mrs-sato',entry:'four',number:'4A',residents:['Mrs Sato']},
 {id:'resident-home-officer-mori',entry:'four',number:'4B',residents:['Officer Mori']},
 {id:'resident-home-harbour-master',entry:'five',number:'5A',residents:['Harbour master']},
 {id:'resident-home-bus-driver',entry:'five',number:'5B',residents:['Bus driver']},
].map(h=>Object.freeze({...h,residents:Object.freeze(h.residents),address:h.number+' Main Street',title:(h.residents.length>2?h.residents.slice(0,-1).join(', ')+' & '+h.residents.at(-1):h.residents.join(' & '))+'’s home'})));
export const HOME_ALIASES=Object.freeze({'resident-home-nao':'yuri-home','resident-home-reiko':'resident-home-aya','resident-home-tetsuo':'resident-home-kenji'});
export const canonicalHomeId=id=>HOME_ALIASES[id]||id;
export const householdFor=name=>HOUSEHOLDS.find(h=>h.residents.includes(name));
export const householdAt=site=>HOUSEHOLDS.find(h=>h.id===canonicalHomeId(site?.id))||householdFor(site?.homeOwner);
export const householdNames=site=>site?.homeOwners||householdAt(site)?.residents||(site?.homeOwner?[site.homeOwner]:[]);
