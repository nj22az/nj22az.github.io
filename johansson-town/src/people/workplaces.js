export const WORK_SITES=Object.freeze({Aya:'frontrow',Kenji:'form3d',Tetsuo:'electronics',Reiko:'journal','Harbour master':'career','Bus driver':'bus-hut'});
export function assignWorkplaces(world,sites){
 for(const person of world.people){const id=WORK_SITES[person.profile.name],site=sites.find(s=>s.id===id);if(!site?.door)continue;
  person.profile={...person.profile,work:[site.door[0],site.door[2]],workSite:id};
 }
}
