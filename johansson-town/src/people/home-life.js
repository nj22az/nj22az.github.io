import {householdFor,householdAt,householdNames} from './households.js';
import {YURI_APARTMENT_ROUTINES} from '../world/interiors/yuri-apartment-layout.js';
// Repeatable household routines use the saved town clock, including night workers.
const minute=m=>((m%1440)+1440)%1440;
export function sleepHours(profile){
 if(profile.name==='Officer Mori')return {sleep:420,wake:900};
 if(profile.name==='Nao')return {sleep:240,wake:720};
 return {sleep:minute(profile.retire+20),wake:minute(profile.start-90)};
}
export function homeRoutine(profile,minutes){
 const {sleep,wake}=sleepHours(profile),m=minute(minutes),sinceWake=minute(m-wake);
 if(minute(m-sleep)<minute(wake-sleep))return {id:'sleep',activity:'sleeping',pose:'Sleep'};
 if(sinceWake<15)return {id:'wake',activity:'waking up and stretching',pose:'Wake'};
 if(sinceWake<40)return {id:'breakfast',activity:'having breakfast',pose:'Eat',item:'rice'};
 if(sinceWake<60)return {id:'prepare',activity:'getting ready for the day',pose:'Read',item:'paper'};
 if(minute(sleep-m)<20)return {id:'bedtime',activity:'settling down for bed',pose:'Sit'};
 const leisure=[{id:'read',activity:'reading',pose:'Read',item:'paper'},{id:'tea',activity:'having tea',pose:'Drink',item:'tea'},{id:'plan',activity:'planning tomorrow’s errands',pose:'Read',item:'paper'}];
 return leisure[(Math.floor(m/30)+profile.name.length)%leisure.length];
}
export const homeSiteId=name=>householdFor(name)?.id||'resident-home-'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
export const homeOwner=site=>householdNames(site)[0]||null;

export const HOME_LAYOUT={bounds:{minX:-3,maxX:3,minZ:-3,maxZ:3},spawn:[1.5,0,2],exit:[1.5,1.1,2.9],
 bed:[-1.75,.58,.65],bedside:[-.5,0,-.3],table:[1.1,0,-1.2],door:[1.5,0,2.45],
 cover:{position:[-1.75,.64,.05],width:1.10,length:1.30,axis:'z'}};
export const SHARED_HOME_LAYOUT={bounds:{minX:-3.5,maxX:3.5,minZ:-3.4,maxZ:3.4},spawn:[0,0,2.6],exit:[0,1.1,3.3],door:[0,0,2.8]};
export function homeLayoutFor(name){
 if(YURI_APARTMENT_ROUTINES[name])return YURI_APARTMENT_ROUTINES[name];
 const household=householdFor(name);if(!household||household.residents.length===1)return HOME_LAYOUT;
 const side=household.residents.indexOf(name)===0?-1:1,x=side*2.1;
 return {...SHARED_HOME_LAYOUT,bed:[x,.58,-.3],bedside:[side*.95,0,-.4],table:[side*.72,0,2.15],
  cover:{position:[x,.64,-.9],width:1.1,length:1.3,axis:'z'}};
}
export const YURI_HOME_LAYOUT=YURI_APARTMENT_ROUTINES.Yuri;
