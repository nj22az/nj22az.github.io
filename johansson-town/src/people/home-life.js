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
 return profile.name.length%2?{id:'read',activity:'reading at home',pose:'Read',item:'paper'}:{id:'tea',activity:'having tea at home',pose:'Drink',item:'tea'};
}
export const homeSiteId=name=>name==='Yuri'?'yuri-home':'resident-home-'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
export const homeOwner=site=>site?.homeOwner||(site?.id==='yuri-home'?'Yuri':null);

export const HOME_LAYOUT={bounds:{minX:-3,maxX:3,minZ:-3,maxZ:3},spawn:[1.5,0,2],exit:[1.5,1.1,2.9],
 bed:[-1.75,.48,.65],bedside:[-.5,0,-.3],table:[1.1,0,-1.2],door:[1.5,0,2.45]};
// Supplied bedroom: sleep lengthwise on the existing bed, feet towards its open side.
export const YURI_HOME_LAYOUT={bed:[-.63,.69,.8],bedside:[-.05,0,.8],table:[-.1,0,-1.45],door:[1.5,0,2.04],bedAxis:'x'};
