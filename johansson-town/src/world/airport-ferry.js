import * as THREE from '../../vendor/three.module.js';
import {AIRPORT_ISLAND,AIRPORT_JETTY} from './airport-island.js';
import {AIRPORT_LANDING,AIRPORT_LANDING_HEIGHT,airportWorld} from './airport-ground.js';
import {SEA_LEVEL} from './ocean.js';
import {GANGWAY_Z,FERRY_HULL,FERRY_DECKS} from './ferry-model.js';
import {BERTH_X,BERTH_Z,TOWN_UNBERTHING,TOWN_BERTHING,HARBOUR_MOUTH,passage,roundedTrack} from './ferry-paths.js';

/**
 * Shared passenger and car crossing on the town ferry, the Minato Maru (ferry-ship.js).
 * `duration` is the crossing in town minutes (briefs/ferry-audit.md §7.1: 4 out, 10 at sea, 4 in);
 * `ride` is how long the game shows it in seconds, a time-lapse of those minutes, until crossings
 * are sailed in real time.
 */
export const AIRPORT_FERRY=Object.freeze({length:FERRY_HULL.length,beam:FERRY_HULL.beam,deck:FERRY_DECKS.car.y,duration:18,ride:18});
/** At Kitano-jima she lies bow to the jetty's west face, 1.9 m off it, with her ramp down on it. */
const AIRPORT_BERTH_U=AIRPORT_JETTY.minX-1.9-FERRY_HULL.length/2;
export const AIRPORT_FERRY_PORTS=Object.freeze({
 town:Object.freeze({title:'Minato–Kitano-jima shared ferry',landing:Object.freeze([-3.2,BERTH_Z+GANGWAY_Z-.7]),height:.098,berth:Object.freeze([BERTH_X,BERTH_Z]),yaw:0}),
 airport:Object.freeze({title:'Kitano-jima shared ferry pier',landing:AIRPORT_LANDING,height:AIRPORT_LANDING_HEIGHT,berth:Object.freeze(airportWorld(AIRPORT_BERTH_U,31)),yaw:AIRPORT_ISLAND.yaw+Math.PI/2}),
});
const BERTH_YAW=(AIRPORT_ISLAND.yaw+Math.PI/2)*180/Math.PI;
/** On Kitano-jima's leading line, `d` metres short of her berth there: she comes in along it, bow first. */
const onLeadingLine=d=>airportWorld(AIRPORT_BERTH_U-d,31);
/**
 * The sea between: out of Minato round the breakwater's west end, south of it, and east along
 * Kitano-jima's leading line to the jetty. Each corner is a steady turn (ferry-paths.js
 * roundedTrack), wide enough that at her sea speed she turns less than a degree a second, and the
 * first one keeps her two metres and more off the breakwater's end.
 */
const SEA_CORNERS=Object.freeze([HARBOUR_MOUTH,[-42,-124]]),SEA_RADII=Object.freeze([16,25,40]);
/** To Kitano-jima: off the Minato berth as on any departure, the sea, and bow in to the jetty. */
const outbound=(()=>{
 const harbour=TOWN_UNBERTHING.keys,swingEnd=harbour.at(-1);
 const track=roundedTrack([[swingEnd[0],swingEnd[1]],...SEA_CORNERS,onLeadingLine(55),onLeadingLine(30)],SEA_RADII);
 // The harbour's last turn, round the breakwater's end, is hers on slow ahead; the sea begins as she steadies out of it.
 const keys=[...harbour,...track.slice(1,-1),[...onLeadingLine(30),BERTH_YAW],[...onLeadingLine(12),BERTH_YAW],[...AIRPORT_FERRY_PORTS.airport.berth,BERTH_YAW]];
 const clear=harbour.length-1+track.turns[1].from+1,line=keys.length-3;
 return passage(keys,[
  {to:TOWN_UNBERTHING.astern,minutes:1,kind:'astern',signal:['prolonged','astern']},
  {to:harbour.length-1,minutes:2,kind:'swing'},
  {to:clear,minutes:1.25,kind:'manoeuvring'},
  {to:line,minutes:9.75,kind:'sea',signal:'prolonged'},
  {to:keys.length-2,minutes:2,kind:'approach'},
  {to:keys.length-1,minutes:2,kind:'berthing'},
 ]);
})();
/** To Minato: astern off the jetty, a swing on the thruster, the sea, and in to the Minato berth as on any arrival. */
const inbound=(()=>{
 const arrival=TOWN_BERTHING.keys,first=arrival[0];
 const track=roundedTrack([onLeadingLine(26),onLeadingLine(55),...[...SEA_CORNERS].reverse(),[first[0],first[1]]],[...SEA_RADII].reverse());
 const head=[[...AIRPORT_FERRY_PORTS.airport.berth,BERTH_YAW],[...onLeadingLine(16),BERTH_YAW],[...onLeadingLine(26),BERTH_YAW+180]];
 const keys=[...head,...track.slice(1,-1),...arrival];
 // Out along the leading line to its first turn; at sea until she is into the turn round the breakwater's end.
 const out=head.length-1+track.turns[0].from,inside=head.length-1+track.turns.at(-1).from;
 return passage(keys,[
  {to:1,minutes:1,kind:'astern',signal:['prolonged','astern']},
  {to:2,minutes:2,kind:'swing'},
  {to:out,minutes:1.5,kind:'manoeuvring'},
  {to:inside,minutes:9.5,kind:'sea'},
  {to:keys.length-3,minutes:2,kind:'approach',signal:'prolonged'},
  {to:keys.length-1,minutes:2,kind:'berthing'},
 ]);
})();
/** Each way's passage (ferry-paths.js), for the game, its sounds and the tests. */
export const AIRPORT_PASSAGES=Object.freeze({airport:outbound,town:inbound});

/**
 * Where she is a share `progress` (0–1) of the way through a crossing: the passage played at
 * that share of its time, so her speed and rate of turn are the ship's own, only faster.
 */
export function airportFerryPose(destination,progress){
 if(!['town','airport'].includes(destination))throw new RangeError('Unknown airport ferry destination');
 const t=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0)),plan=AIRPORT_PASSAGES[destination],p=plan.pose(t*plan.duration);
 return {x:p.x,y:SEA_LEVEL+FERRY_HULL.origin,z:p.z,yaw:p.yaw,deckY:SEA_LEVEL+FERRY_HULL.origin+AIRPORT_FERRY.deck,progress:t,speed:p.speed,turn:p.turn,kind:p.kind,exposure:p.exposure,seconds:t*plan.duration};
}

/** A boarding anchor on the public pier, clear of its bollards and winch. */
export function registerAirportFerryPier({parent,register=()=>{},onBoard=()=>{}}){
 const p=AIRPORT_FERRY_PORTS.town,a=new THREE.Object3D();a.name='Shared ferry boarding point';a.position.set(p.landing[0],p.height+1,p.landing[1]);parent.add(a);
 register(a,'Board the Minato–Kitano-jima ferry',onBoard);
 return a;
}
