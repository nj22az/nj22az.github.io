import {buildPlane,AIRPORT_ISLAND} from '../world/airport-island.js';
import {airportWorld} from '../world/airport-ground.js';
import {AIRPORT_FERRY,AIRPORT_FERRY_PORTS,registerAirportFerryPier} from '../world/airport-ferry.js';
import {createFerryRun} from '../world/ferry.js';
import {buildQuickCrossings,QUICK_CROSSING} from '../world/ferry-quick-crossing.js';
import * as THREE from '../../vendor/three.module.js';
import {AIRPORT_LANDING,AIRPORT_HEIGHT,AIRPORT_COUNTER} from '../world/airport-ground.js';
import {islandState,buyFerry,FERRY_FARE,ferryArrival,buyFlight,checkIn,boardFlight,flightArrival,finishRepair,completeProject,DEVELOPMENT_PROJECTS,projectReady,stamp,flightTimes} from './services.js';
export const NAHA_ARRIVALS={id:'naha-airport-arrivals',title:'Naha Commuter Arrivals',jp:'Naha Commuter Arrivals',sub:'RETURN CONNECTION · KITANO-JIMA',x:AIRPORT_COUNTER[0],z:AIRPORT_COUNTER[1],exitPosition:[AIRPORT_COUNTER[0],AIRPORT_HEIGHT,AIRPORT_COUNTER[1]],entryFacing:0,line:'A small domestic arrivals room. Your return ticket takes you back to Kitano-jima.'};
/** Ticketing and physical ferry crossing. Mid-crossing saves retain the last safe shore. */
export function createIslandPlay({world,player,camera,activities,holdFerry=()=>false,getMinutes,getRain,passTime,place,enterNaha,leaveNaha,register=()=>{},veil=run=>run()}){
 let ride=null,observedVoyage=0;const a=activities,state=a.state,s=islandState(state);
 const thuan=world.people.find(p=>p.profile?.name==='Thuan'||p.g.userData.name==='Thuan')?.g;if(thuan)thuan.userData.alternativeOutfit=['nozomi','sailor'].includes(state.thuanOutfit)?state.thuanOutfit:'clothes';
 const ferryRun=world.ferry||(world.ferry=createFerryRun({parent:world.group,colliders:world.colliders})),boat=ferryRun.ferry;ferryRun.parkAt(s.journey.location==='airport'?'airport':'town');
 registerAirportFerryPier({parent:world.group,register,onBoard:()=>ferry(false)});
 buildQuickCrossings({parent:world.group,colliders:world.colliders,register,onUse:location=>quickCrossing(location)});
 const aircraft=buildPlane();aircraft.name='Boarded commuter aircraft';aircraft.userData.dynamicProp=true;aircraft.visible=false;world.group.add(aircraft);
 const result=(title,r,back)=>{a.save();if(!r.ok){a.menu(title,r.message,[['Back',back]]);return false;}return true;};
 // Passengers ride on the open upper deck, not among the cars (ferry-ship.js FERRY_DECKS.passenger).
 function standOnFerry(){boat.updateWorldMatrix(true,false);player.position.copy(new THREE.Vector3(...(boat.userData.passengerDeck||[1.3,boat.userData.deckY??1.01,.2])).applyMatrix4(boat.matrixWorld));}
 function automaticFerry(dt){
  if(ferryRun.operation&&ferryRun.operation.stage!=='alongside')return;
  if(ride||ferryRun.phase!=='waiting')return;
  // Nobody sails off with a visitor walking her decks: a vehicle's crossing waits until he is ashore (game.js deckUnder).
  if(holdFerry())return;
  const job=world.traffic?.pendingVehicleJourney?.();if(!job)return;
  if(!AIRPORT_FERRY_PORTS[job.origin]||!AIRPORT_FERRY_PORTS[job.destination])return;
  const destination=job.origin===ferryRun.berth?job.destination:job.origin;
  if(destination===ferryRun.berth)return;
  ferryRun.beginCrossing(destination,{automatic:true});
 }
 /**
  * A crossing. Aboard already (on her decks, holdFerry), he sails on his own feet: her floors stay under him, the
  * crossing follows the same actual-time machinery, crew and sailing sequence as a vehicle voyage.
  * He can walk aboard throughout departure and passage. From the pier he boards the passenger deck first.
  */
 function crossing(location){
  if(ride)return;const origin=location==='airport'?'town':'airport';a.close();
  // Kitano-jima is built while she takes him there (world/kitano-on-demand.js), a step at a time.
  if(location==='airport')void world.kitano?.prepare();
  const aboard=holdFerry();
  const waiting=AIRPORT_FERRY_PORTS[origin];if(!aboard)place(...waiting.landing,waiting.height);
  if(ferryRun.operation&&ferryRun.operation.stage!=='alongside'){
   ride=aboard&&ferryRun.destination===location?{kind:'ferry',location,operationId:ferryRun.operation.id,afoot:true}:{kind:'awaiting-boat',requestedDestination:location,location:ferryRun.destination,afoot:true};a.save();return;
  }
  const pickup=ferryRun.berth!==origin,destination=pickup?origin:location;
  ride={kind:'loading',pickup,location:destination,nextDestination:pickup?location:null,elapsed:0,afoot:true,alreadyAboard:aboard};a.save();
 }
 /**
  * The quick crossing (the creator, 2026-10-13: "Include a quick travel point at the docks to travel to the island and
  * back"; "quick crossing should be free it's only Johansson who can do it, npcs need to go by ferry"): his own way across
  * from the landing sign at either end (ferry-quick-crossing.js) to the one at the other. No fare and no wait, and the
  * Minato Maru, her cars and her passengers are left as they are: the residents still go by ferry.
  */
 function quickCrossing(location){
  if(ride)return;const q=QUICK_CROSSING[location];
  ride={kind:'quick',location,elapsed:0,duration:1};
  // Behind the veil Kitano-jima is finished before he is put there (world/kitano-on-demand.js).
  void veil(()=>{
   const arrive=()=>{ride=null;s.journey.location=location;a.save();place(...q.stand,q.ground,q.facing);};
   return location==='airport'&&world.kitano&&!world.kitano.loaded?world.kitano.prepare().then(arrive):arrive();
  });
 }
 function fly(location){a.close();const ground=airportWorld(0,-4),air=airportWorld(95,-4);ride={kind:'flight',from:location==='naha'?ground:air,to:location==='naha'?air:ground,location,elapsed:0,duration:12};aircraft.visible=true;a.save();}
 function ferry(home=false){const j=s.journey;a.menu(home?'Kitano-jima → Minato':'Minato → Kitano-jima','The Minato Maru · '+AIRPORT_FERRY.duration+'-minute crossing to Kitano-jima, on request.\nPassengers ride the upper deck; cars go on the car deck below.\nThe crew prepare the ship before sailing; you can walk the decks throughout.\n'+(FERRY_FARE?'Return fare ¥'+FERRY_FARE+'. The return journey remains valid until used.':'No fare while the game is being built: passengers sail free.')+'\nMs Ganaha keeps the ticket window from noon to 22:15; before noon the deck hand sells tickets at the gangway on the outer pier.',[[(home||j.roundTrip||!FERRY_FARE)?(holdFerry()?'Request departure':'Board the local ferry'):'Buy return ticket · ¥'+FERRY_FARE,()=>{if(!home&&!j.roundTrip){if(!result('Airport ferry',buyFerry(state,getMinutes()),()=>ferry(home)))return;if(FERRY_FARE){ferry(home);return;}}crossing(home?'town':'airport');}],['Stay here',a.close]]);}
 function counter(){const j=s.journey,now=getMinutes(),times=flightTimes(state).map(stamp).join(' · ');const buttons=[];if(j.ticket===null)buttons.push(['Buy Naha return ticket · ¥800',()=>{if(result('Commuter flight',buyFlight(state,getMinutes(),getRain()),counter))counter();}]);else if(!j.checked)buttons.push(['Check in with one cabin bag',()=>{if(result('Check-in',checkIn(state,getMinutes(),getRain()),counter))counter();}]);else buttons.push(['Board the Naha commuter flight',()=>{const r=boardFlight(state,getMinutes(),getRain());if(r.wait){a.menu('Waiting for the commuter flight',r.message,[['Wait until departure',()=>{passTime(r.wait);counter();}],['Keep exploring',a.close]]);return;}if(!result('Boarding',r,counter))return;fly('naha');}]);buttons.push(['Back to the passenger walkway',a.close]);a.menu('Kitano-jima Airport','Island commuter service · 1997 · Terminal district expanding\nDepartures: '+times+'\nCheck-in closes ten minutes before departure.\n'+(getRain()?'Heavy rain: flights suspended; tickets remain valid.':'Weather permitting, twin-prop aircraft serve Naha.')+(j.ticket!==null?'\nYour flight: '+stamp(j.ticket)+(j.checked?' · checked in':' · check-in required'):''),buttons);}
 function projects(){const buttons=DEVELOPMENT_PROJECTS.filter(p=>!s.projects.includes(p.id)).map(p=>[p.title+' · ¥'+p.budget,()=>{const r=completeProject(state,p.id,getMinutes());if(result('Island development',r,projects))projects();}]);buttons.push(['Back to town',a.close]);a.menu('Island development programme','Town treasury: ¥'+s.treasury+'\nCompleted: '+(s.projects.join(', ')||'none')+'\n\n'+DEVELOPMENT_PROJECTS.map(p=>p.title+'\n'+p.text+'\n'+(s.projects.includes(p.id)?'Completed':projectReady(state,p)?'Service requirement met':'Needed: '+({repair:'complete the airport radio service at the docks',flight:'complete an outbound commuter flight',visits:'make two airport ferry visits'}[p.requires]))).join('\n\n')+'\n\nEvery completed project files its decision, works order, completion, invoice, payment and ledger posting at the Community Hall.',buttons);}
 function action(kind,title,data){if(ride&&!ride.afoot)return true;if(ride&&['airport-ferry','airport-return','airport-counter'].includes(kind))return true;if(kind==='airport-shop'){const items=data.items||[[data.item,data.price]];a.menu(title,data.line||'A kiosk on the airport plaza, beside check-in, for travellers waiting for their flight.',[...items.map(([item,price])=>['Buy '+item+' · ¥'+price,()=>{if(!a.spend(price))return;state.inventory.push(item);a.save();a.close();}]),['Keep exploring',a.close]]);return true;}if(kind==='airport-ferry'){ferry();return true;}if(kind==='airport-return'){ferry(true);return true;}if(kind==='airport-counter'){counter();return true;}if(kind==='island-projects'){projects();return true;}if(kind==='island-repair'){a.menu('Airport ground-service radio','Tetsuo supervises a service test: isolate the supply, inspect the cable, check the reference signal and record the result.',[[s.repair?'Review completed test':'Complete the supervised service test',()=>{finishRepair(state,getMinutes());a.save();passTime(15);a.menu('Airport radio service complete','The work order, test sheet and maintenance posting are filed in the Community Hall. The radio can return to service.',[['Back to the docks',a.close]]);}],['Leave it for now',a.close]]);return true;}if(kind==='island-shop'){a.menu('Hoshizaki General Store','Rice crackers, island tea and postcards. The fishing families collect their daily supplies here.',[['Buy island tea · ¥100',()=>{if(!a.spend(100))return;state.inventory.push('Hoshizaki island tea');a.save();a.close();}],['Ask about the village',()=>a.menu('Hoshizaki','Fishing boats land their catch each morning. The family guesthouse opens when the town completes its visitor programme.',[['Thank you',a.close]])],['Keep walking',a.close]]);return true;}if(kind==='island-bus'){a.menu('Coastal Harbour Line',s.projects.includes('bus')?'The local coastal service returns to Minato. Town-funded service; no fare.':'The village bus service awaits the town development programme.',s.projects.includes('bus')?[['Ride back to Minato',()=>{a.close();passTime(30);place(0,30);}],['Keep walking',a.close]]:[['Keep walking',a.close]]);return true;}return false;}
 /** Closing access is a physical check, not a blanket ban on walking anywhere aboard. */
 ferryRun.setAccessGuard?.(()=>{
  if(world.traffic?.loadingVehicles||ferryRun.loadingVehicles)return 'A vehicle is still on the loading route.';
  boat.updateWorldMatrix(true,false);const p=boat.worldToLocal(player.position.clone());
  const y=boat.userData.deckY??1.1;
  if(Math.abs(p.y-y)<1.2&&Math.abs(p.x)<2.5&&p.z>16.7&&p.z<24)return 'Please clear the bow ramp before it is raised.';
  if(Math.abs(p.y-y)<1.2&&p.x>3.8&&p.x<6.5&&p.z>-4.1&&p.z<-2.3)return 'Please clear the passenger gangway before it is stowed.';
  return true;
 });
 function observeVoyages(){
  for(const event of ferryRun.completedVoyages||[]){
   if(event.sequence<=observedVoyage)continue;observedVoyage=event.sequence;
   if(!ride||ride.operationId!==event.id)continue;
   // Only Johansson's accepted journey accounts for the advertised time. A background
   // vehicle voyage must never jump the visitor's clock while they are elsewhere in town.
   const passed=Math.max(0,getMinutes()-event.startedMinute);if(passed<AIRPORT_FERRY.duration)passTime(AIRPORT_FERRY.duration-passed);
   const finished=ride;ride=null;
   if(finished.kind==='pickup'){crossing(finished.nextDestination);continue;}
   const port=AIRPORT_FERRY_PORTS[event.destination],nearLanding=Math.hypot(player.position.x-port.landing[0],player.position.z-port.landing[1])<24;
   if(finished.kind==='ferry'&&(holdFerry()||nearLanding)){ferryArrival(state,event.destination,getMinutes());a.save();}
  }
 }
 function tick(dt){
  world.airportIsland?.setDepartures(flightTimes(state));world.islandLandscape?.update(state,getMinutes());world.traditionalGarden?.update(getMinutes()*60);world.shoppingLane?.update(getRain());
  observeVoyages();automaticFerry(dt);
  if(!ride||ride.kind==='quick')return;
  if(ride.kind==='awaiting-boat'){
   if(ferryRun.operation&&ferryRun.operation.stage!=='alongside')return;
   const destination=ride.requestedDestination;ride=null;crossing(destination);return;
  }
  if(ride.kind==='loading'){
   if(!ferryRun.beginCrossing(ride.location,{automatic:!!ride.pickup}))return;
   ride.operationId=ferryRun.operation.id;ride.kind=ride.pickup?'pickup':'ferry';
   if(!ride.pickup&&!ride.alreadyAboard)standOnFerry();return;
  }
  if(ride.kind==='pickup'||ride.kind==='ferry')return;
  if(ride.kind!=='flight')return;
  ride.elapsed+=Math.max(0,dt);const t=Math.min(1,ride.elapsed/ride.duration),u=t*t*(3-2*t);
  const x=ride.from[0]+(ride.to[0]-ride.from[0])*u,z=ride.from[1]+(ride.to[1]-ride.from[1])*u,y=2+(ride.location==='naha'?u*u:(1-u)*(1-u))*22;
  aircraft.position.set(x,y,z);aircraft.rotation.y=AIRPORT_ISLAND.yaw;player.position.set(x,y+.7,z);camera.position.set(x-9,y+6,z+13);camera.lookAt(x,y+1,z);
  if(t>=1){const destination=ride.location;ride=null;aircraft.visible=false;passTime(45);flightArrival(state,destination,getMinutes());place(...AIRPORT_COUNTER);a.save();if(destination==='naha')enterNaha();}
 }
 return {action,boat,get phase(){return ride?.kind||null;},get active(){return !!ride;},
  get cinematic(){return !!ride&&!ride.afoot;},tick,
  returnFlight(){a.close();s.journey.location='airport';leaveNaha();fly('airport');},
  recover(){if(s.journey.location==='airport'){ferryRun.parkAt('airport');place(...AIRPORT_LANDING,AIRPORT_FERRY_PORTS.airport.height);}else if(s.journey.location==='naha')enterNaha();},
  snapshot(){return {location:s.journey.location,cinematic:!!ride&&!ride.afoot,automaticFerry:ferryRun.automaticCrossing?{destination:ferryRun.destination,progress:ferryRun.crossingProgress}:null,crossing:ride?{destination:ride.location,progress:ride.kind==='flight'?ride.elapsed/ride.duration:ferryRun.crossingProgress??0}:null,ticket:s.journey.ticket,checked:s.journey.checked,projects:s.projects,treasury:s.treasury};}
 };
}
