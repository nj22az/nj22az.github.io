// One household is one room and one save destination. Roommates retain individual schedules.
export const HOUSEHOLDS=Object.freeze([
 {id:'yuri-home',entry:'one',number:'1',residents:['Yuri','Nao']},
 {id:'resident-home-aya',entry:'two',number:'2',residents:['Aya','Reiko']},
 {id:'resident-home-kenji',entry:'three',number:'3',residents:['Kenji','Tetsuo']},
 {id:'resident-home-mrs-sato',entry:'four',number:'4A',residents:['Mrs Sato']},
 {id:'resident-home-officer-mori',entry:'four',number:'4B',residents:['Officer Mori']},
 {id:'resident-home-harbour-master',entry:'five',number:'5A',residents:['Harbour master']},
 {id:'resident-home-bus-driver',entry:'five',number:'5B',residents:['Bus driver']},
].map(h=>Object.freeze({...h,residents:Object.freeze(h.residents),address:h.number+' Main Street',title:h.residents.join(' & ')+'’s home'})));
export const HOME_ALIASES=Object.freeze({'resident-home-nao':'yuri-home','resident-home-reiko':'resident-home-aya','resident-home-tetsuo':'resident-home-kenji'});
export const canonicalHomeId=id=>HOME_ALIASES[id]||id;
export const householdFor=name=>HOUSEHOLDS.find(h=>h.residents.includes(name));
export const householdAt=site=>HOUSEHOLDS.find(h=>h.id===canonicalHomeId(site?.id))||householdFor(site?.homeOwner);
export const householdNames=site=>site?.homeOwners||householdAt(site)?.residents||(site?.homeOwner?[site.homeOwner]:[]);
