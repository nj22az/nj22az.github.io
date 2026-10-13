import {izakayaOpen,inTimeRange} from '../people/social.js';
import {satoRamenOpen} from './sato-ramen-layout.js';
import {CARGO_CALLS} from './cargo-shipping.js';

/**
 * Where you are when the game starts: always at the docks, looking at something new (the creator, 2026-10-13: "Change
 * the spawn point so Johansson always spawns at the docks, looking at something new"). The docks openings (`docks`) are
 * the harbour's own sights, each when it is there to be seen: the Minato Maru alongside, the cargo boat unloading, the
 * fish auction's catch, Mr Fujita's houseboat, a fishing boat on the quay, the ferry's landing sign with Kitano-jima across
 * the strait, the end of the pier and the gangway's foot. Each start shows one not yet seen, until all have been.
 * The town's other good moments (a beer at Minato, lunch at Sato Ramen, the benches, the seawall) are kept for the
 * ?spawn= parameter and the tools that name them.
 *
 * Each opening names what game.js has to do (sit on a seat by its label, stand at a
 * point facing a way, or go inside and sit), and what the first caption says.
 */
export const OPENINGS=Object.freeze([
 {id:'sakura-bench',weight:3,hours:[0,1440],seat:'Sit and look at Sakura',caption:'Sakura is across the street.'},
 {id:'izakaya',weight:3,open:izakayaOpen,room:'izakaya',seat:'Sit at the counter',drink:'draft',caption:'Minato · a cold beer in front of you, and Thao behind the counter.'},
 {id:'ramen',weight:3,open:satoRamenOpen,room:'ramen',seat:'Sit at the ramen counter',meal:'shoyu',caption:'Sato Ramen · a bowl of shoyu ramen steaming in front of you, and Mrs Sato at the pots.'},
 // At the pier's end (z -88 since 2026-10), among the anglers' things, facing the breakwater's east light.
 {id:'pier',docks:true,weight:2,hours:[300,1320],stand:[-.4,-86.4],facing:-.94,caption:'The end of the pier · the lighthouse, and the open sea.'},
 {id:'park-bench',weight:2,hours:[360,1260],dry:true,seat:'Sit and watch the town and harbour',caption:'Harbour Park · the rooftops and the port below.'},
 {id:'seawall',weight:1,hours:[330,1170],dry:true,stand:[32.1,-4],facing:-Math.PI/2,caption:'The seawall · the tide on the sand below.'},
 // Just off the ferry, at the gangway's foot on the outer pier (her port door, z −72.7 since the bigger ship), facing the town.
 {id:'ferry',docks:true,weight:2,hours:[450,1350],stand:[-3,-73.9],facing:Math.PI,caption:'Off the ferry · the quay, and Main Street beyond it.'},
 // On the outer pier abreast of her bridge, looking across at the Minato Maru alongside (ferry.js: she lies at x −8.64).
 {id:'minato-maru',docks:true,weight:2,hours:[0,1440],when:c=>c.ferryAlongside,stand:[1.2,-66],facing:Math.PI/2,caption:'The outer pier · the Minato Maru alongside, bound for Kitano-jima.'},
 // On the pier's east side while the island cargo boat is alongside (cargo-shipping.js CARGO_CALLS), watching her unload.
 {id:'cargo-boat',docks:true,weight:2,open:m=>{const h=((m%1440)+1440)%1440;return CARGO_CALLS.some(c=>h>=c.alongside&&h<c.departure);},stand:[1.8,-59],facing:-Math.PI/2,caption:'The outer pier · the island cargo boat unloading.'},
 // At the open west side of the fish auction shed on the east quay (okinawa/layout.js EAST_QUAY), looking along the day's
 // catch in its crates to the price board at the far end.
 {id:'fish-auction',docks:true,weight:2,hours:[0,1440],stand:[20.4,-44.4],facing:-Math.PI/2,caption:'The fish auction shed · today’s catch in its crates.'},
 // On the shed pier, looking at Mr Fujita's houseboat, the Shiosai.
 {id:'houseboat',docks:true,weight:2,hours:[0,1440],stand:[-36.8,-53.2],facing:.86,caption:'The shed pier · Mr Fujita’s houseboat, the Shiosai.'},
 // At the quay's edge past the port building, looking down at the fishing boat alongside (minato-berth.js QUAY_FISHING_BOAT).
 {id:'fishing-boat',docks:true,weight:2,hours:[0,1440],stand:[16.8,-49.3],facing:0,caption:'The quay · a fishing boat alongside.'},
 // Beside the ferry's landing sign (ferry-quick-crossing.js), looking out across the strait to Kitano-jima.
 {id:'landing-sign',docks:true,weight:2,hours:[0,1440],stand:[-2.6,-70.4],facing:-.89,caption:'The ferry landing · Kitano-jima across the strait.'},
]);
const SEEN_KEY='johansson-town-openings-seen';

const LAST_KEY='johansson-town-opening';

/**
 * The opening for this start: a docks opening that fits the hour, the weather and what is at the docks now
 * (`context.ferryAlongside`), one not yet seen this round (the round starts again once every one that fits has been
 * seen), never the same as last time if there is another, picked by weight. `force` (the ?spawn= parameter) chooses any
 * opening by name.
 */
export function chooseOpening({minutes,rain=false,force=null,random=Math.random,storage=globalThis.localStorage,context={}}={}){
 // The island has no bus stop any more; the old name finds the ferry.
 const name=force==='bus-stop'?'ferry':force;
 const byName=name&&OPENINGS.find(o=>o.id===name);if(byName)return byName;
 const fits=OPENINGS.filter(o=>o.docks&&(o.open?o.open(minutes):inTimeRange(minutes,...o.hours))&&!(rain&&o.dry)&&(!o.when||o.when(context)));
 let last=null,seen=[];try{last=storage?.getItem(LAST_KEY);seen=JSON.parse(storage?.getItem(SEEN_KEY)||'[]');}catch{}
 if(!Array.isArray(seen))seen=[];
 let fresh=fits.filter(o=>!seen.includes(o.id));if(!fresh.length){seen=[];fresh=fits;}
 const pool=fresh.length>1?fresh.filter(o=>o.id!==last):fresh;
 const total=pool.reduce((n,o)=>n+o.weight,0);let roll=random()*total,choice=pool[0]||OPENINGS.find(o=>o.id==='landing-sign');
 for(const o of pool){if((roll-=o.weight)<0){choice=o;break;}}
 try{storage?.setItem(LAST_KEY,choice.id);storage?.setItem(SEEN_KEY,JSON.stringify([...seen,choice.id]));}catch{}
 return choice;
}
