import {ferryDepartureText,migrateFerryJourney} from '../people/ferry-timetable.js';
import {crewRoute} from '../people/ferry-crew-walk.js';
import {FERRY_DECKS,FERRY_RAMP,GANGWAY_Z,GANGWAY_LENGTH} from '../world/ferry-model.js';
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
export function createIslandPlay({world,player,camera,activities,isAboard=()=>false,getMinutes,getRain,passTime,place,enterNaha,leaveNaha,register=()=>{},face=()=>{},veil=run=>run()}){
 let ride=null,observedVoyage=0,walking=null,warningId=null,warningOpen=false;const a=activities,state=a.state,s=islandState(state);s.journey=migrateFerryJourney(s.journey);
 const thuan=world.people.find(p=>p.profile?.name==='Thuan'||p.g.userData.name==='Thuan')?.g;if(thuan)thuan.userData.alternativeOutfit=['nozomi','sailor'].includes(state.thuanOutfit)?state.thuanOutfit:'clothes';
 const ferryRun=world.ferry||(world.ferry=createFerryRun({parent:world.group,colliders:world.colliders})),boat=ferryRun.ferry;ferryRun.enableTimetable(getMinutes(),{onWarning:departureWarning,onClosing:clearAccess});
 registerAirportFerryPier({parent:world.group,register,onBoard:()=>ferry(false)});
 buildQuickCrossings({parent:world.group,colliders:world.colliders,register,onUse:location=>quickCrossing(location)});
 const aircraft=buildPlane();aircraft.name='Boarded commuter aircraft';aircraft.userData.dynamicProp=true;aircraft.visible=false;world.group.add(aircraft);
 const result=(title,r,back)=>{a.save();if(!r.ok){a.menu(title,r.message,[['Back',back]]);return false;}return true;};
 // Passengers ride on the open upper deck, not among the cars (ferry-ship.js FERRY_DECKS.passenger).
 function standOnFerry(){boat.updateWorldMatrix(true,false);player.position.copy(new THREE.Vector3(...(boat.userData.passengerDeck||[1.3,boat.userData.deckY??1.01,.2])).applyMatrix4(boat.matrixWorld));}
 /** Requests buy a place on the next sailing; they never start, recall or hold the ship. */
 function crossing(location){
  a.close();
  const origin=location==='airport'?'town':'airport';
  if(ferryRun.berth!==origin||!ferryRun.canLoad){
   a.menu('Next Harbour Line sailing',ferryDepartureText(getMinutes(),origin),[['Keep exploring',a.close]]);return;
  }
  if(!isAboard())standOnFerry();
  a.save();
 }
 function departureWarning(trip){
  if(!isAboard()||warningId===trip.id)return;warningId=trip.id;warningOpen=true;
  a.menu('Departure warning','The Minato Maru sails at '+stamp(trip.departure)+' for '+(trip.destination==='airport'?'Kitano-jima':'Minato')+'. Go ashore now, or remain aboard and walk the decks during the crossing.',[
   ['Go ashore',goAshore],['Stay aboard',()=>{warningOpen=false;a.close();a.save();}],
  ]);
 }
 function goAshore(){
  warningOpen=false;a.close();if(!ferryRun.accessOpen)return;
  boat.updateWorldMatrix(true,false);const start=boat.worldToLocal(player.position.clone()),town=ferryRun.berth==='town';
  const end=town?[3.4,FERRY_DECKS.car.y,GANGWAY_Z]:[0,FERRY_DECKS.car.y,16.6];
  const route=crewRoute(start.toArray(),end,{obstacles:ferryRun.vehicleObstacles?.()||[]});
  if(!route.ok){a.menu('Go ashore','Please move to the passenger stair before going ashore.',[['Keep walking',a.close]]);return;}
  const points=route.path.map(p=>({ship:true,pos:p.pos}));
  if(town){points.push({ship:true,pos:[boat.userData.gangway.position.x,FERRY_DECKS.car.y,GANGWAY_Z]});const foot=boat.userData.gangway.localToWorld(new THREE.Vector3(GANGWAY_LENGTH,.03,0));points.push({pos:foot.toArray()});}
  else{const [x,z]=airportWorld(-54,31);points.push({pos:[x,AIRPORT_FERRY_PORTS.airport.height,z]});}
  const port=AIRPORT_FERRY_PORTS[ferryRun.berth];points.push({pos:[port.landing[0],port.height,port.landing[1]]});
  walking={points,index:0};
 }
 /** Resolve only people on closing access, to the nearer safe end. Vehicles retain their own securing/transfer controller. */
 function clearAccess(){
  if(warningOpen){warningOpen=false;a.close();}
  boat.updateWorldMatrix(true,false);const port=AIRPORT_FERRY_PORTS[ferryRun.berth],gangway=boat.userData.gangway;
  const people=[player,...world.people.map(p=>p.g)];
  for(const person of people){
   if(person!==player&&(!person.visible||person.userData.aboardFerry))continue;
   const worldAt=person.getWorldPosition(new THREE.Vector3()),p=boat.worldToLocal(worldAt.clone());
   if(Math.abs(p.y-FERRY_DECKS.car.y)>1.3)continue;
   const g=gangway.worldToLocal(worldAt.clone()),onGangway=ferryRun.gangwayOut>=.99&&Math.abs(g.y-.03)<.4&&g.x>-.1&&g.x<GANGWAY_LENGTH+.35&&Math.abs(g.z)<.72;
   const onRamp=Math.abs(p.x)<2.35&&p.z>16.7&&p.z<24;
   if(!onGangway&&!onRamp)continue;
   const ashore=onGangway?g.x>GANGWAY_LENGTH/2:p.z>20;
   const shore=onRamp?boat.userData.flap.localToWorld(new THREE.Vector3(0,.05,FERRY_RAMP.flap+.6)):new THREE.Vector3(port.landing[0],port.height,port.landing[1]);
   const target=ashore?shore:boat.localToWorld(new THREE.Vector3(...(onGangway?[3.4,FERRY_DECKS.car.y,GANGWAY_Z]:[0,FERRY_DECKS.car.y,16.4])));
   if(person===player){walking=null;player.position.copy(target);if(ashore)s.journey.location=ferryRun.berth;}
   else{person.position.copy(person.parent?person.parent.worldToLocal(target):target);person.userData.walking=false;}
  }
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
 function ferry(home=false){
  const origin=home?'airport':'town',j=s.journey;
  a.menu(home?'Kitano-jima → Minato':'Minato → Kitano-jima','The Minato Maru · '+AIRPORT_FERRY.duration+'-minute crossing.\n'+ferryDepartureText(getMinutes(),origin)+'\nPassengers ride the upper deck; cars go on the car deck below.\nYou can walk the decks throughout the crossing.\nThe separate quick crossing remains on request.',[
   ...(isAboard()&&ferryRun.accessOpen?[['Go ashore',goAshore]]:[]),
   [(home||j.roundTrip||!FERRY_FARE)?'Board the next sailing':'Buy return ticket · ¥'+FERRY_FARE,()=>{
    if(!home&&!j.roundTrip&&!result('Harbour Line',buyFerry(state,getMinutes()),()=>ferry(home)))return;
    crossing(home?'town':'airport');
   }],['Stay here',a.close]]);
 }
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
  const op=ferryRun.operation;
  if(op&&op.stage!=='alongside'&&isAboard()&&!ride)ride={kind:'ferry',location:op.destination,operationId:op.id,afoot:true};
  if(ride?.kind==='ferry'&&!isAboard()){ride=null;}
  for(const event of ferryRun.completedVoyages||[]){
   if(event.sequence<=observedVoyage)continue;observedVoyage=event.sequence;
   if(ride?.operationId===event.id){ride=null;if(isAboard()){ferryArrival(state,event.destination,getMinutes());a.save();}}
  }
 }
 function tick(dt){
  world.airportIsland?.setDepartures(flightTimes(state));world.islandLandscape?.update(state,getMinutes());world.traditionalGarden?.update(getMinutes()*60);world.shoppingLane?.update(getRain());
  observeVoyages();
  const trip=ferryRun.scheduledDeparture;
  if(trip?.destination==='airport'&&getMinutes()>=trip.departure-20)void world.kitano?.prepare();
  if(trip&&ferryRun.departing&&warningId!==trip.id)departureWarning(trip);
  if(walking){
   const waypoint=walking.points[walking.index],goal=new THREE.Vector3(...waypoint.pos);if(waypoint.ship)boat.localToWorld(goal);
   const delta=goal.clone().sub(player.position),distance=delta.length(),step=Math.max(0,dt)*1.35;
   if(distance<=step){player.position.copy(goal);if(++walking.index>=walking.points.length){walking=null;s.journey.location=ferryRun.berth;a.save();}}
   else {face(delta.x,delta.z);player.position.addScaledVector(delta,step/distance);}
  }
  if(!ride||ride.kind==='quick')return;
  if(ride.kind==='ferry')return;
  if(ride.kind!=='flight')return;
  ride.elapsed+=Math.max(0,dt);const t=Math.min(1,ride.elapsed/ride.duration),u=t*t*(3-2*t);
  const x=ride.from[0]+(ride.to[0]-ride.from[0])*u,z=ride.from[1]+(ride.to[1]-ride.from[1])*u,y=2+(ride.location==='naha'?u*u:(1-u)*(1-u))*22;
  aircraft.position.set(x,y,z);aircraft.rotation.y=AIRPORT_ISLAND.yaw;player.position.set(x,y+.7,z);camera.position.set(x-9,y+6,z+13);camera.lookAt(x,y+1,z);
  if(t>=1){const destination=ride.location;ride=null;aircraft.visible=false;passTime(45);flightArrival(state,destination,getMinutes());place(...AIRPORT_COUNTER);a.save();if(destination==='naha')enterNaha();}
 }
 return {action,boat,get phase(){return ride?.kind||null;},get active(){return !!ride;},
  get walkingAshore(){return !!walking;},
  get cinematic(){return !!walking||!!ride&&!ride.afoot;},tick,
  returnFlight(){a.close();s.journey.location='airport';leaveNaha();fly('airport');},
  recover(){if(s.journey.location==='airport'){place(...AIRPORT_LANDING,AIRPORT_FERRY_PORTS.airport.height);}else if(s.journey.location==='naha')enterNaha();},
  snapshot(){return {location:s.journey.location,cinematic:!!ride&&!ride.afoot,timetable:ferryRun.scheduledDeparture,departing:ferryRun.departing,walkingAshore:!!walking,automaticFerry:ferryRun.automaticCrossing?{destination:ferryRun.destination,progress:ferryRun.crossingProgress}:null,crossing:ride?{destination:ride.location,progress:ride.kind==='flight'?ride.elapsed/ride.duration:ferryRun.crossingProgress??0}:null,ticket:s.journey.ticket,checked:s.journey.checked,projects:s.projects,treasury:s.treasury};}
 };
}
