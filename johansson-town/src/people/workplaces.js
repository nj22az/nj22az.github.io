import {businessId} from '../world/businesses.js';
export const WORK_SITES=Object.freeze({Aya:'frontrow',Kenji:'form3d',Tetsuo:'form3d',Reiko:'frontrow','Harbour master':'office'});
/** Workplaces only the island builds: Sato Ramen for Mrs Sato, the police box for Officer Mori. */
const ISLAND_WORK_SITES=Object.freeze({'Mrs Sato':'ramen','Officer Mori':'koban'});
export function assignWorkplaces(world,sites){
 for(const person of world.people){const id=businessId(ISLAND_WORK_SITES[person.profile.name]||WORK_SITES[person.profile.name]),site=[...sites,...(world.landmarks||[])].find(s=>s.id===id);if(!site?.door)continue;
  person.profile={...person.profile,work:[site.door[0],site.door[2]],workSite:id};
 }
}
