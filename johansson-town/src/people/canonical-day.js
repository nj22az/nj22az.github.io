import {townCalendarAt} from '../town-clock.js';
import {rotaWeek} from './ferry-crew.js';
import {flatAccessRoute} from '../world/kitahama-layout.js';
import {activeHomeForResident} from './island-households.js';
import {CAST,castMember} from './cast.js';
import {activeResidentHome,residentHome} from './home-directory.js';
import {SCHOOL} from '../world/school-layout.js';
import {TOWN_DESTINATIONS} from '../world/town-grid.js';
import {IZAKAYA_DOOR} from '../world/dining-layout.js';
import {MARKET_THRESHOLD} from '../world/town-grid.js';

const HOME_TARGETS=new Map();
const activeTarget=name=>{if(!HOME_TARGETS.has(name))HOME_TARGETS.set(name,activeResidentHome(name)?.target);return HOME_TARGETS.get(name);};
const minute=t=>{const [h,m]=t.split(':').map(Number);return h*60+m;};
const points={izakaya:IZAKAYA_DOOR,sakura:MARKET_THRESHOLD,market:MARKET_THRESHOLD,warehouse:[-9.7,-41.4],
 school:[SCHOOL.genkan.x,SCHOOL.building.minZ-1.4],park:[12,-26],onsen:[17,-19],
 port:[8,-38],ferry:[8,-38],office:[8,-38],koban:[0,28],
 'sato-ramen':[-6,-14],books:TOWN_DESTINATIONS.books,workshop:TOWN_DESTINATIONS.workshop,
 florist:[18.5,16.5],zenzai:[5.1,-12.4],'blue-coral':[5.1,-12.4],
 'fish-auction':[25,-39.6],'ice-plant':[31,-41],boatyard:[-31.8,-45],sea:[-31.8,-45],
 'higa-liquor':[4.8,8.4],clinic:[34.1,35.1],'cargo-yard':[17,-40],'post-office':[4.8,-4.1],
 'power-station':[SCHOOL.powerHouse.door[0]+.6,SCHOOL.powerHouse.door[1]-.9],quay:[20,-40],
 'main-street':[1,0],seawall:[-36.7,-20]};
export function canonicalDestination(name,place){
 const p=castMember(name),home=activeTarget(name);
 if(place===p?.home||p?.alsoAt.includes(place))return home?[home.x,home.z]:null;
 if(points[place])return [...points[place]];
 const host=CAST.find(p=>p.home===place),h=host?residentHome(host.name):null;if(h?.target)return [h.target.x,h.target.z];
 return null;
}
/** Shared by the street neighbour and the same actor borrowed into its private room. */
const DAYS=new Map(CAST.map(p=>[p.name,p.day.map(([time,place,activity])=>({from:minute(time),place,activity})).sort((a,b)=>a.from-b.from)]));
export function canonicalDay(name,minutes,rain=false){
 const p=castMember(name);if(!p)return null;
 const m=((minutes%1440)+1440)%1440,phases=DAYS.get(p.name);
 const phase=phases.filter(s=>s.from<=m).at(-1)||phases.at(-1),isHome=(phase.place===p.home||p.alsoAt.includes(phase.place))&&!/sweeping|the garden|at her gate/.test(phase.activity)&&(p.home!==p.work||/home|breakfast|asleep|sleep/.test(phase.activity));
 const homePlan=activity=>{const h=activeTarget(name);return {place:'home',target:[h.x,h.z],activity,rain:!!rain};};
 const weekday=townCalendarAt(minutes).weekday,weekend=weekday===0||weekday===6;
 if(name==='Ms Uezu'&&rotaWeek(minutes)===1&&phase.place==='ferry')return homePlan('off watch at her shore home');
 if(name==='Kōji'&&rotaWeek(minutes)===1&&m>=360&&m<1140)return {place:'ferry',target:[...points.ferry],activity:'relief bosun’s working week'};
 if(weekend&&phase.place==='school'){
  if(name==='Miss Higa')return {place:'onsen',target:[...points.onsen],activity:'weekend bandai duty'};
  return rain?homePlan('a rainy school-free day at home'):{place:'park',target:[...points.park],activity:'weekend in Harbour Park'};
 }
 if(rain&&['park','quay'].includes(phase.place))return homePlan('sheltering at home until the rain clears');
 // Younger pupils walk to the real school gate. Their classroom owns them after arrival.
 const target=isHome?canonicalDestination(name,p.home):points[phase.place]?[...points[phase.place]]:canonicalDestination(name,phase.place);
 return {place:isHome?'home':phase.place==='sakura'?'market':phase.place,target,activity:phase.activity,school:phase.place==='school',rain:!!rain};
}

/** One continuous outdoor path, using the measured upper-flat connector in either direction. */
export function canonicalStreetRoute(navigation,name,from,target){
 const access=flatAccessRoute(activeHomeForResident(name)?.home),home=access?.at(-1),near=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<.5;
 if(!access)return navigation.path(from,{x:target[0],z:target[1]});
 const here=[from.x,from.z],foot=access[0],leaving=near(here,home),entering=near(target,home);
 const a=leaving?foot:here,b=entering?foot:target,path=navigation.path({x:a[0],z:a[1]},{x:b[0],z:b[1]});
 if(!path.length)return [];
 return [...(leaving?[...access].reverse():[]),...path,...(entering?access:[])];
}
