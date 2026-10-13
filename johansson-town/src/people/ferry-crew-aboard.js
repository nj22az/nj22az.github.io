import * as THREE from '../../vendor/three.module.js';
import {FERRY_SHIP,FERRY_HEIGHTS,FERRY_DAY} from '../world/ferry-ship.js';
import {FERRY_ENGINE_ROOM} from '../world/ferry-interior.js';
import {FERRY_CREW,FERRY_WATCH,crewFor} from './ferry-crew.js';
import {wearEarDefenders} from '../avatars/ear-defenders.js';
/** The places below the car deck, where the engines are: whoever stands there wears ear defenders. */
export const BELOW_DECK_PLACES=Object.freeze(['engine-room','steering-gear']);

/**
 * The Minato Maru's crew at their posts (Kitano-jima batch 7c; docs/KITANO-JIMA.md §4): one body per post, a child of
 * her group so it rides with her, standing where FERRY_WATCH puts that post in her phase, facing its work. The master is
 * the bus driver (ferry-crew.js): his body in town is hidden while he is aboard. At night only the chief (who lives
 * aboard) and, on her week on, the deck hand are there. Each has a prompt with a line about what they are doing.
 */
const HALF=FERRY_SHIP.length/2,Z=zy=>zy-HALF,Y=yk=>yk-FERRY_SHIP.draft;
const CAR=Y(FERRY_HEIGHTS.carDeck),PASS=Y(FERRY_HEIGHTS.passengerDeck),BRIDGE=Y(FERRY_HEIGHTS.bridgeDeck),FP=FERRY_ENGINE_ROOM.floor;
/** Where each place of FERRY_WATCH is on her (her frame) and which way the work faces (yaw π looks forward). */
export const CREW_POSTS=Object.freeze({
 wheelhouse:{pos:[.45,BRIDGE,Z(20.7)],yaw:Math.PI},
 'port-wing':{pos:[3.55,BRIDGE,Z(20.6)],yaw:Math.PI},
 'engine-room':{pos:[-3.1,FP,Z(10.4)],yaw:Math.PI/2},   // at the console's forward end, facing the panel (6r-2: the switchboard's front is the player's to work; the chief stood in the booth door)
 'steering-gear':{pos:[0,FP,Z(9.6)],yaw:0},
 stern:{pos:[1.2,CAR,Z(1.6)],yaw:0},
 bow:{pos:[0,CAR,Z(31.5)],yaw:Math.PI},
 gangway:{pos:[3.4,CAR,Z(12.6)],yaw:Math.PI},
 'car-deck':{pos:[0,CAR,Z(18.5)],yaw:Math.PI},
 saloon:{pos:[0,PASS,Z(17.0)],yaw:Math.PI},
 mess:{pos:[0,BRIDGE,Z(15.2)],yaw:Math.PI/2},
 cabin:{pos:[0,BRIDGE,Z(10.2)],yaw:Math.PI/2},
});
/** Where a post stands when two share a place: the oiler on the floor plates by the engines, not in the chief's booth. */
const POST_SPOTS=Object.freeze({oiler:Object.freeze({'engine-room':{pos:[0,FP,Z(12.2)],yaw:-Math.PI/2}})});
const PHASES=new Set(Object.keys(FERRY_WATCH));
/** Her phase for the watch table: the run's own, or the night outside her service. */
export function watchPhase(run,minutes){
 const m=((minutes%1440)+1440)%1440;
 if(m<FERRY_DAY.generators||m>=FERRY_DAY.shorePower)return 'night';
 const p=run.phase;return PHASES.has(p)?p:(p==='away'?'crossing':'waiting');
}
/** Who stands where in a phase: [{post, name, where, doing, pos, yaw}] for the posts that are aboard. */
export function crewPlaces(phase,minutes=0){
 const watch=FERRY_WATCH[phase]||{};
 return FERRY_CREW.map(c=>{const w=watch[c.post];if(!w)return null;const at=POST_SPOTS[c.post]?.[w[0]]||CREW_POSTS[w[0]];if(!at)return null;return {post:c.post,title:c.title,name:crewFor(c.post,minutes),where:w[0],doing:w[1],pos:at.pos,yaw:at.yaw};}).filter(Boolean);
}
export function createFerryCrewAboard({run,characters,register,onAction,townBody=()=>null}){
 const ferry=run.ferry,bodies=new Map();let phase=null,day=-1;
 const body=name=>{
  if(bodies.has(name))return bodies.get(name);
  const g=new THREE.Group();g.name='Crew: '+name;g.userData.name=name;g.userData.ferryCrew=true;g.userData.hit=null;ferry.add(g);
  const actor=characters?.attach(g,name)||null;
  const a=new THREE.Object3D();a.name='Crew prompt: '+name;a.position.set(0,1.2,0);a.userData.sameLevel=true;g.add(a);
  const b={g,prompt:a,name,text:'',actor,earDefenders:false};bodies.set(name,b);
  register?.(a,'Talk to '+name,()=>onAction?.('inspect',name,b.text));
  return b;
 };
 const crew=FERRY_CREW.reduce((m,c)=>(m[c.post]=c,m),{});
 function place(minutes){
  const p=watchPhase(run,minutes),d=Math.floor(minutes/1440);
  if(p===phase&&d===day)return;phase=p;day=d;
  const aboard=new Set();
  for(const c of crewPlaces(p,minutes)){
   const b=body(c.name);aboard.add(c.name);
   b.g.visible=true;b.g.position.set(...c.pos);b.g.rotation.y=c.yaw;
   b.earDefenders=BELOW_DECK_PLACES.includes(c.where);if(b.actor?.avatar)wearEarDefenders(b.actor.avatar,b.earDefenders);
   b.text=`${c.name}, ${c.title.toLowerCase()} of the Minato Maru: ${c.doing}.${b.earDefenders?' Ear defenders on: nobody goes below without them.':''} ${crew[c.post].why}`;
  }
  for(const [name,b] of bodies)if(!aboard.has(name))b.g.visible=false;
  // The master's body in town is the bus driver's: hidden while he is aboard.
  const town=townBody('Bus driver');if(town){const masterAboard=aboard.has('Bus driver');town.userData.aboardFerry=masterAboard;if(masterAboard)town.visible=false;}
 }
 return {place,update(dt,minutes){place(minutes);const town=townBody('Bus driver');if(town?.userData.aboardFerry)town.visible=false;},get phase(){return phase;},bodies,
  snapshot(){return [...bodies.values()].filter(b=>b.g.visible).map(b=>({name:b.name,pos:b.g.position.toArray(),earDefenders:b.earDefenders}));}};
}
