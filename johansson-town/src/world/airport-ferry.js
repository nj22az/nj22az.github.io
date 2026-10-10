import * as THREE from '../../vendor/three.module.js';
import {AIRPORT_ISLAND,AIRPORT_JETTY} from './airport-island.js';
import {AIRPORT_LANDING,AIRPORT_LANDING_HEIGHT,airportWorld} from './airport-ground.js';
import {SEA_LEVEL} from './ocean.js';
import {FERRY_SHIP,FERRY_DECKS} from './ferry-ship.js';
import {GANGWAY_Z} from './ferry-model.js';
import {BERTH_X,BERTH_Z,TOWN_ARRIVAL_KEYS,TOWN_DEPARTURE_KEYS,keyedPath} from './ferry-paths.js';

/** Shared passenger and car crossing on the town ferry, the Minato Maru (ferry-ship.js). */
export const AIRPORT_FERRY=Object.freeze({length:FERRY_SHIP.length,beam:FERRY_SHIP.beam,deck:FERRY_DECKS.car.y,duration:18});
/** At Kitano-jima she lies bow to the jetty's west face, 1.9 m off it, with her ramp down on the jetty. */
const AIRPORT_BERTH_U=AIRPORT_JETTY.minX-1.9-FERRY_SHIP.length/2;
export const AIRPORT_FERRY_PORTS=Object.freeze({
 town:Object.freeze({title:'Minato–Kitano-jima shared ferry',landing:Object.freeze([-3.2,BERTH_Z+GANGWAY_Z-.7]),height:.098,berth:Object.freeze([BERTH_X,BERTH_Z]),yaw:0}),
 airport:Object.freeze({title:'Kitano-jima shared ferry pier',landing:AIRPORT_LANDING,height:AIRPORT_LANDING_HEIGHT,berth:Object.freeze(airportWorld(AIRPORT_BERTH_U,31)),yaw:AIRPORT_ISLAND.yaw+Math.PI/2}),
});
const deg=r=>r*180/Math.PI,BERTH_YAW=deg(AIRPORT_ISLAND.yaw+Math.PI/2);
// The open-water part of the crossing: round the harbour breakwater's west end, then outside
// the reclaimed foundation. The old straight line crossed the wall and finished on dry land.
const SEA=[[-44,-79,null],[-54,-97,null],[-42,-130,null],[48,-130,null]];
/** To Kitano-jima: off the Minato berth as on any departure, across, and bow in to the jetty. */
const TO_AIRPORT=keyedPath([...TOWN_DEPARTURE_KEYS.slice(0,6),...SEA,[...airportWorld(AIRPORT_BERTH_U-30,31),BERTH_YAW],[...airportWorld(AIRPORT_BERTH_U-12,31),BERTH_YAW],[...AIRPORT_FERRY_PORTS.airport.berth,BERTH_YAW]]);
/** To Minato: astern off the jetty, swing, across, and in to the Minato berth as on any arrival. */
const TO_TOWN=keyedPath([[...AIRPORT_FERRY_PORTS.airport.berth,BERTH_YAW],[...airportWorld(AIRPORT_BERTH_U-16,31),BERTH_YAW],[...airportWorld(AIRPORT_BERTH_U-24,24),-129],...[...SEA].reverse(),...TOWN_ARRIVAL_KEYS.slice(4)]);

/** A bounded physical crossing pose, shared by the game and movement regressions. */
export function airportFerryPose(destination,progress){
 if(!['town','airport'].includes(destination))throw new RangeError('Unknown airport ferry destination');
 const t=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0)),k=t*t*(3-2*t);
 const p=(destination==='airport'?TO_AIRPORT:TO_TOWN).pose(k);
 return {x:p.x,y:SEA_LEVEL+.12,z:p.z,yaw:p.yaw,deckY:SEA_LEVEL+.12+AIRPORT_FERRY.deck,progress:t};
}

/** A boarding anchor on the public pier, clear of its bollards and winch. */
export function registerAirportFerryPier({parent,register=()=>{},onBoard=()=>{}}){
 const p=AIRPORT_FERRY_PORTS.town,a=new THREE.Object3D();a.name='Shared ferry boarding point';a.position.set(p.landing[0],p.height+1,p.landing[1]);parent.add(a);
 register(a,'Board the Minato–Kitano-jima ferry',onBoard);
 return a;
}
