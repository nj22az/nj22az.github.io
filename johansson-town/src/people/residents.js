import {DINING} from '../world/dining-layout.js';
import {residentialHome} from '../world/residential-layout.js';
import {PROFILES} from './profiles.js';
// Yuri shares the compact residential lanes and outdoor schedule.
export const YURI_PROFILE={...residentialHome('Yuri'),"name":"Yuri","age":25,"role":"Sakura shopkeeper","height":1.64,"work":[-4,-25.5],"evening":[DINING.izakayaX,18],"homeAddress":"22 Willow Alley","start":540,"close":1200,"retire":1410,"supperStart":null,"supperEnd":null};
export const ACTIVE_RESIDENT_NAMES=Object.freeze(['Aya','Kenji','Mrs Sato','Harbour master','Reiko','Tetsuo','Officer Mori','Bus driver','Nao','Yuri']);
// Existing identities and saved routines use the supplied street’s shared entrances.
export const RESIDENTS=ACTIVE_RESIDENT_NAMES.map(name=>{
 const source=name==='Yuri'?YURI_PROFILE:PROFILES.find(p=>p.name===name);
 const diningPoint=point=>point&&point[0]===24&&point[1]>=18&&point[1]<=25?[DINING.izakayaX,point[1]]:point;
 return {...source,work:diningPoint(source.work),evening:diningPoint(source.evening),...residentialHome(name)};
});
// The peninsula scene uses the same active roster, without the bus driver.
export const STREET_CAST_NAMES=Object.freeze(['Yuri','Nao','Mrs Sato','Kenji','Aya','Harbour master','Reiko','Tetsuo','Officer Mori']);
export const STREET_CAST=RESIDENTS.filter(p=>STREET_CAST_NAMES.includes(p.name));
