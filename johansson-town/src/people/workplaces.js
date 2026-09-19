import {businessId} from '../world/businesses.js';
import {peninsulaActive} from '../world/town-mode.js';
export const WORK_SITES=Object.freeze({Aya:'frontrow',Kenji:'form3d',Tetsuo:'form3d',Reiko:'frontrow','Harbour master':'office'});
export function assignWorkplaces(world,sites){
 for(const person of world.people){const id=businessId(peninsulaActive()&&person.profile.name==='Mrs Sato'?'warehouse':WORK_SITES[person.profile.name]),site=[...sites,...(world.landmarks||[])].find(s=>s.id===id);if(!site?.door)continue;
  person.profile={...person.profile,work:[site.door[0],site.door[2]],workSite:id};
 }
}
