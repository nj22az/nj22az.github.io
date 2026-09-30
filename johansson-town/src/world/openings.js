import {izakayaOpen,inTimeRange} from '../people/social.js';

/**
 * Where you are when the game starts. Not anywhere at random -- nobody wants to begin in
 * a toilet -- but one of a handful of good moments in the town, chosen for the hour:
 * a beer at Minato when it is open, the end of the pier, the park bench, the seawall,
 * stepping off the Harbour Line, or the cedar bench across from Sakura.
 *
 * Each opening names what game.js has to do (sit on a seat by its label, stand at a
 * point facing a way, or go inside and sit), and what the first caption says.
 */
export const OPENINGS=Object.freeze([
 {id:'sakura-bench',weight:3,hours:[0,1440],seat:'Sit and look at Sakura',caption:'Stand — Sakura is across the street.'},
 {id:'izakaya',weight:3,open:izakayaOpen,room:'izakaya',seat:'Sit at the table',drink:'draft',caption:'Minato · a cold beer on the table, and Nao behind the counter.'},
 {id:'pier',weight:2,hours:[300,1320],stand:[-2.5,-60.5],facing:-1.03,caption:'The end of the pier · the lighthouse, and the open sea.'},
 {id:'park-bench',weight:2,hours:[360,1260],dry:true,seat:'Sit and watch the town and harbour',caption:'Harbour Park · the rooftops and the port below.'},
 {id:'seawall',weight:1,hours:[330,1170],dry:true,stand:[32.1,-4],facing:-Math.PI/2,caption:'The seawall · the tide on the sand below.'},
 {id:'bus-stop',weight:1,hours:[450,1350],stand:'bus-platform',facing:0,caption:'Off the Harbour Line · Main Street is straight ahead.'},
]);

const LAST_KEY='johansson-town-opening';

/**
 * The opening for this start: one that fits the hour and the weather, never the same as
 * last time if there is another, picked by weight. `force` (the ?spawn= parameter)
 * chooses one by name.
 */
export function chooseOpening({minutes,rain=false,force=null,random=Math.random,storage=globalThis.localStorage}={}){
 const byName=force&&OPENINGS.find(o=>o.id===force);if(byName)return byName;
 const fits=OPENINGS.filter(o=>(o.open?o.open(minutes):inTimeRange(minutes,...o.hours))&&!(rain&&o.dry));
 let last=null;try{last=storage?.getItem(LAST_KEY);}catch{}
 const pool=fits.length>1?fits.filter(o=>o.id!==last):fits;
 const total=pool.reduce((n,o)=>n+o.weight,0);let roll=random()*total,choice=pool[0]||OPENINGS[0];
 for(const o of pool){if((roll-=o.weight)<0){choice=o;break;}}
 try{storage?.setItem(LAST_KEY,choice.id);}catch{}
 return choice;
}
