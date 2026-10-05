import {izakayaOpen,inTimeRange} from '../people/social.js';
import {satoRamenOpen} from './sato-ramen-layout.js';

/**
 * Where you are when the game starts. Not anywhere at random -- nobody wants to begin in
 * a toilet -- but one of a handful of good moments in the town, chosen for the hour:
 * a beer at Minato when it is open, lunch at Sato Ramen, the end of the pier, the park bench, the seawall,
 * stepping off the ferry onto the pier, or the cedar bench across from Sakura.
 *
 * Each opening names what game.js has to do (sit on a seat by its label, stand at a
 * point facing a way, or go inside and sit), and what the first caption says.
 */
export const OPENINGS=Object.freeze([
 {id:'sakura-bench',weight:3,hours:[0,1440],seat:'Sit and look at Sakura',caption:'Stand — Sakura is across the street.'},
 {id:'izakaya',weight:3,open:izakayaOpen,room:'izakaya',seat:'Sit at the counter',drink:'draft',caption:'Minato · a cold beer in front of you, and Thao behind the counter.'},
 {id:'ramen',weight:3,open:satoRamenOpen,room:'ramen',seat:'Sit at the ramen counter',meal:'shoyu',caption:'Sato Ramen · a bowl of shoyu ramen steaming in front of you, and Mrs Sato at the pots.'},
 {id:'pier',weight:2,hours:[300,1320],stand:[-2.5,-60.5],facing:-1.03,caption:'The end of the pier · the lighthouse, and the open sea.'},
 {id:'park-bench',weight:2,hours:[360,1260],dry:true,seat:'Sit and watch the town and harbour',caption:'Harbour Park · the rooftops and the port below.'},
 {id:'seawall',weight:1,hours:[330,1170],dry:true,stand:[32.1,-4],facing:-Math.PI/2,caption:'The seawall · the tide on the sand below.'},
 // Just off the ferry, at the gangway's foot on the outer pier, facing the town.
 {id:'ferry',weight:2,hours:[450,1350],stand:[-3.2,-56.2],facing:Math.PI,caption:'Off the ferry · the quay, and Main Street beyond it.'},
]);

const LAST_KEY='johansson-town-opening';

/**
 * The opening for this start: one that fits the hour and the weather, never the same as
 * last time if there is another, picked by weight. `force` (the ?spawn= parameter)
 * chooses one by name.
 */
export function chooseOpening({minutes,rain=false,force=null,random=Math.random,storage=globalThis.localStorage}={}){
 // The island has no bus stop any more; the old name finds the ferry.
 const name=force==='bus-stop'?'ferry':force;
 const byName=name&&OPENINGS.find(o=>o.id===name);if(byName)return byName;
 const fits=OPENINGS.filter(o=>(o.open?o.open(minutes):inTimeRange(minutes,...o.hours))&&!(rain&&o.dry));
 let last=null;try{last=storage?.getItem(LAST_KEY);}catch{}
 const pool=fits.length>1?fits.filter(o=>o.id!==last):fits;
 const total=pool.reduce((n,o)=>n+o.weight,0);let roll=random()*total,choice=pool[0]||OPENINGS[0];
 for(const o of pool){if((roll-=o.weight)<0){choice=o;break;}}
 try{storage?.setItem(LAST_KEY,choice.id);}catch{}
 return choice;
}
