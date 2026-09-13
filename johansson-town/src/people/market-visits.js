import {PROFILES} from './profiles.js';
export const RAMEN_VISITS=Object.freeze({
 Kenji:[555,660], 'Harbour master':[615,720], 'Mrs Sato':[675,780],
 Nao:[780,840], Tetsuo:[795,900], Aya:[855,960],
 Reiko:[915,1020], 'Bus driver':[975,1080], 'Officer Mori':[1140,1255],
});
// A small, repeatable daily shuffle. Loading a save or opening the shop does not
// reroll customers. Long gaps leave Thuan time for the player and her counter.
const CUSTOMERS=['Mrs Sato','Aya','Kenji','Tetsuo','Reiko','Harbour master','Bus driver'];
const cache=new Map();
export function marketVisitsForDay(minutes){
 const day=Math.floor(minutes/1440);if(cache.has(day))return cache.get(day);
 let seed=(Math.imul(day+17,2654435761)^0x5a4b2f19)>>>0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const names=[...CUSTOMERS];for(let i=names.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[names[i],names[j]]=[names[j],names[i]];}
 const windows=Array.from({length:5},(_,i)=>{const start=550+i*120+Math.floor(random()*24);return [start,start+90];});
 const overlap=(a,b)=>a[0]<b[1]&&a[1]>b[0];
 function choose(index,remaining,visits){
  if(index===windows.length)return visits;
  for(const name of remaining){const profile=PROFILES.find(p=>p.name===name),ramen=RAMEN_VISITS[name];
   if(ramen&&overlap(windows[index],ramen)||profile&&overlap(windows[index],[profile.supperStart,profile.supperEnd]))continue;
   const found=choose(index+1,remaining.filter(n=>n!==name),{...visits,[name]:Object.freeze(windows[index])});if(found)return found;
  }return null;
 }
 const visits=choose(0,names,{})||{};
 const result=Object.freeze(visits);cache.set(day,result);if(cache.size>3)cache.delete(cache.keys().next().value);return result;
}
