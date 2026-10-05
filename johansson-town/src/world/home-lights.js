import {KITAHAMA,KITAHAMA_RESIDENT_HOMES} from './kitahama-layout.js';
import {registerHomeLight,setHomeLight,clearHomeLights} from '../render/window-interior.js';

/**
 * The lights in Kitahama's windows follow the people who live behind them
 * (docs/RESIDENTIAL-PLAN.md: "a home's lights follow its residents").
 *
 * - Thuan and Thao's house and Mrs Sato's follow the walking residents themselves: lit
 *   when one of them is in and up, dark when they are out or asleep.
 * - The other households keep a routine of their own: the grandparents are in bed by
 *   nine, the auction hand is up at half past four, the nurse's light comes on for a
 *   night call now and then, the ferry deckhand's house is dark every other week.
 * - Kitahama Heights is four flats, each its own light.
 *
 * Lights only show after dark (the window shader mixes them in by its night glow), so the
 * routines can be simple: when somebody is up at home, the light is on.
 */
const H=(h,m=0)=>h*60+m;
/** Ambient households: [wake, bed] in minutes of the day; `away(day)` empties the house. */
export const HOME_ROUTINES=Object.freeze({
 'kitahama-3':{wake:H(4,30),bed:H(21,30)},
 'kitahama-4':{wake:H(6),bed:H(22,30)},
 'kitahama-5':{empty:true},
 'kitahama-6':{wake:H(5,30),bed:H(20,30)},
 'kitahama-7':{wake:H(6),bed:H(23),nightCall:day=>day%4===1},
 'kitahama-8':{wake:H(6,30),bed:H(23,30),away:day=>Math.floor(day/7)%2===0},
 'kitahama-9':{wake:H(5,45),bed:H(21)},
 'kitahama-10':{wake:H(5,30),bed:H(21,30)},
 'kitahama-11':{wake:H(6,30),bed:H(23,30)},
 'kitahama-12':{wake:H(7),bed:H(23)},
 'flat-1':{wake:H(6),bed:H(23)},
 'flat-2':{wake:H(6,30),bed:H(24,30)},
 // Mr Fujita sleeps in his shed more often than not; he comes back to wash at dawn.
 'flat-3':{wake:H(5,30),bed:H(6,15)},
 'flat-4':{empty:true},
});

const between=(m,a,b)=>{a=((a%1440)+1440)%1440;b=((b%1440)+1440)%1440;return a<=b?m>=a&&m<b:m>=a||m<b;};

/** Whether an ambient household's light is on at an absolute town minute. */
export function routineLit(routine,minutes){
 if(!routine||routine.empty)return false;
 const day=Math.floor(minutes/1440),m=((minutes%1440)+1440)%1440;
 if(routine.away?.(day))return false;
 if(routine.nightCall?.(day)&&between(m,H(2),H(2,40)))return true;
 return between(m,routine.wake,routine.bed);
}

/** Whether a walking resident is at home and up (their profile's hours say when they sleep). */
export function residentUpAtHome(person,minutes){
 const u=person?.g?.userData;if(!u)return false;
 if(u.indoors!=='home'&&!u.inHome)return false;
 if(u.sleeping)return false;
 const p=person.profile||{},m=((minutes%1440)+1440)%1440;
 if(!Number.isFinite(p.retire)||!Number.isFinite(p.start))return true;
 return between(m,p.start-75,p.retire);
}

/** The flats' boxes, matching okinawa/kitahama-quarter.js buildFlats. */
function flatBoxes(){
 const A=KITAHAMA.apartment,y=KITAHAMA.y,x0=A.minX+.5,x1=A.maxX-1.9,z0=A.minZ+1,z1=A.maxZ-1,mid=(z0+z1)/2,S=2.8;
 return [['flat-1',y,z0,mid],['flat-2',y,mid,z1],['flat-3',y+S,z0,mid],['flat-4',y+S,mid,z1]].map(([id,lo,a,b])=>[id,[x0-1.2,lo,a],[x1+.2,lo+S-.01,b]]);
}

export function createHomeLights({people=()=>[]}={}){
 // One town at a time: a rebuilt town takes the table over.
 clearHomeLights();
 const homes=[];
 for(const p of KITAHAMA.plots){
  const slot=registerHomeLight([p.minX,KITAHAMA.y,p.minZ],[p.maxX,KITAHAMA.y+8,p.maxZ]);
  homes.push({id:p.id,slot,residents:KITAHAMA_RESIDENT_HOMES[p.id]||null,routine:HOME_ROUTINES[p.id]||null});
 }
 for(const [id,lo,hi] of flatBoxes())homes.push({id,slot:registerHomeLight(lo,hi),residents:null,routine:HOME_ROUTINES[id]});
 const state=new Map();
 return {
  homes,
  /** Sets every home's light for this town minute. Cheap: a dozen lookups. */
  update(minutes){
   const list=people();
   for(const h of homes){
    const lit=h.residents?h.residents.some(name=>residentUpAtHome(list.find(p=>p.profile?.name===name),minutes)):routineLit(h.routine,minutes);
    if(state.get(h.id)!==lit){state.set(h.id,lit);setHomeLight(h.slot,lit?1:0);}
   }
  },
  /** Which homes are lit now, for tests and the town book. */
  lit(){return homes.filter(h=>state.get(h.id)).map(h=>h.id);},
 };
}
