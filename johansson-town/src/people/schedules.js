import {TOWN_DESTINATIONS} from '../world/town-grid.js';
import {RAMEN_DOOR,IZAKAYA_DOOR} from './social.js';
import {homeRoutine} from './home-life.js';
import {FULL_TOWN} from '../world/full-town-state.js';
import {residentPlan,NIGHT_PATROL} from './social.js';
import {VOICE_LINES} from './voice-lines.js';
import {createNavigation} from './navmesh.js?snappy=1';
import {groundHeight} from '../world/layout.js?snappy=1';
import {PROFILES} from './profiles.js';
import {RESIDENTS,THUAN_PROFILE,residentHomeDescription} from './residents.js';
import {BUS_STATION} from '../world/bus-station.js';
import {thuanHasCommutePriority,yieldAsideTarget,commuteCrowdRadii,residentCommitted} from './thuan-commute-yield.js';
import {STAFF_BENCH} from '../world/staff-bench.js';
import {MARKET_THRESHOLD} from '../world/town-grid.js';
import {createStaffBenchRoutine} from './staff-bench-routine.js';
import {commuterPhase} from './commuter-schedule.js';
import * as THREE from '../../vendor/three.module.js';
import {alignedStep,forwardOnly,travelError,travelYaw} from './facing.js';
export const DIALOGUE={
 Thuan:[['hello','いらっしゃいませ。\nWelcome to Sakura Shōten. Take your time; the kettle has only just boiled.'],['pink','このリボン、お気に入りなんです。\nThis ribbon is my favourite. My aunt says the shop is easier to find when I stand outside.'],['work','午後の品出しが終わりました。\nThe afternoon shelves are ready. Cold tea is in the cooler; postcards are beside the biscuits.'],['harbour','港までお散歩ですか。\nWalking to the harbour? The light turns the water pink just before supper.'],['catalogue','取り寄せの帳面はこちらです。\nThe mail-order book is on the counter. I keep those orders separate from the daily till.']],
 Aya:[['books','The Swedish engineer keeps leaving historical novels here as if they were spare parts.'],['shelf','Six books. The shelf has requested a structural assessment.'],['century','Which century did you like? The seventeenth leaks through the shutters.','book'],['job','So he does have a real job. I assumed he only wrote about captains.','cv'],['cat','Tama has not read them. He reviews the binding by sleeping on it.'],['rain','Please leave the rain outside. The histories have enough disasters.'],['chair','The window chair is free. Twenty seconds of peace is an excellent bargain.'],['water','The harbour office tray is towards the water. Documents, not treasure.']],
 Kenji:[['delivery','The morning round is parcels for half the arcade, and every one of them is heavier than it looks.'],['folio','Harbour office tray, unless the wind took it. Look for the blue tape.'],['game','One perfect Star Port run and I will show you the workshop. No charge for directions.'],['book','I delivered those books. My back now has a historical perspective.','book'],['part','A keychain without keys. Sensible. Nothing to lose yet.','keychain'],['map','Our repair bench is inside Front-Row Books & Workshop, north of Minato.'],['weather','Rain is just the harbour making a delivery inland.'],['model','Don’t drop it. We’re inside.']],
 'Mrs Sato':[['stock','I sell many useful things. You seem determined to pick up paper.'],['shifts','The ramen counter keeps its own timetable. I arrive before the lunch rush and stay until the last bowl.'],['bligh','A captain is easier to judge from a dry chair.','bligh'],['fish','That fish is not becoming fresher while we discuss it.'],['food','Umeboshi rice ball. Eighty yen. Twenty seconds of renewed purpose.'],['book','Six books? He should charge by the kilogram.'],['weather','The noren is not an umbrella. Visitors continue to test this.'],['home','Leave things where you found them. A town runs on this small miracle.']],
 'Harbour master':[['obvious','Did you check the obvious thing twice? Good. Now check the connector.'],['folio','It is a document, not a relic. Put it back in the tray.'],['pattern','I still prefer a wooden pattern and a sharp pencil.','keychain'],['bligh','Read the Bligh paper? Command is not the same thing as shouting.','bligh'],['commission','Commissioning: prove it works before everyone goes home.'],['diagnostics','A useful fault report begins with what happened. Not what you hoped happened.'],['tide','The tide has not read the work order. Allow for this.'],['radio','Harbour Service, 82.1. Clear instructions. Mostly clear reception.']],
 'Bus driver':[['time','The timetable is optimistic. I admire that in paper.'],['stop','This is the Harbour Line. The bus is the part currently missing.'],['book','Those Swedish books need their own ticket.','book'],['cv','Two bases? I have two stops. It is not quite the same.','cv'],['rain','A wet timetable is still wrong.'],['route','Station that way. Harbour the other way. I keep it simple.']],
 'Cold-storage kid':[['ice','Ice. Twenty yen. Briefly solid.'],['books','The Swedish books weigh more than the fish.'],['paper','The Bligh paper is dry. That is already a good voyage.','bligh'],['key','That blank could label the freezer key. We have lost the label twice.','keychain'],['shift','Night shift. The fish keep very unsociable hours.'],['home','Go home before you smell like your work.']]
};
for(const archived of PROFILES){
 const p=RESIDENTS.find(p=>p.name===archived.name)||archived;
 const personal=[['hello',p.hello],['friends',p.gossip],['discovery',p.clue],['home',residentHomeDescription(p.name)||'I live at '+p.homeAddress+'.']];
 DIALOGUE[p.name]=[...personal,...(DIALOGUE[p.name]||[])];
}
// Kenji's own voice: friendly 1980s American slang, still grounded in his job.
DIALOGUE.Kenji=[
 ['hello','Yo, bro! How’s it going? Just keeping this old workshop running.'],
 ['delivery','Parcels for the whole arcade, bro. Half of them are books. My back keeps a list.'],
 ['folio','Yo, bro, try the harbour office tray. Blue tape on the folder. Can’t miss it.'],
 ['game','One clean Star Port run? That’s totally rad. Then I’ll show you the workshop.'],
 ['book','Dude, I hauled those books over here. My back’s still talking about it.','book'],
 ['part','Check it out, bro. A keychain blank, ready for your own design.','keychain'],
 ['map','Workshop’s that way, dude. I’ll walk you over if you’ve earned the tour.'],
 ['weather','Bummer. Rain again. Good day to fix something indoors, huh?'],
 ['model','Easy, bro. That prototype took all afternoon.'],
 ['friends','Tetsuo’s got the electronics covered. Me? I handle the parts that need a proper wrench.'],
 ['discovery','Hey, bro, ask the harbour master about that waterlogged folder.'],
 ['home',residentHomeDescription('Kenji')+' After supper I put the tools away and kick back.']
];
DIALOGUE.Thuan.push(['home',residentHomeDescription('Thuan')+' The plants by the shop stay here overnight.']);
// Apply the recorded clips last: a later rewrite of a resident's lines must not
// leave a published subtitle disagreeing with the audio it plays.
for(const clip of VOICE_LINES){const row=DIALOGUE[clip.resident]?.find(row=>row[0]===clip.topic);if(row){row[1]=clip.ja+'\n'+clip.en;row[3]=clip.id;}}
export function createCastAI({world,player,state,paused,collides,getObserverPosition=()=>player.position,activities=null}){
 // Keep scheduled targets off the forest bus road and painted coyote-tunnel mouth.
 // WalkFix owns how they walk there; we only refuse the arch as a stand/queue point.
 //
 // The bus's own door is the exception, and it is applied after this: the bus stands
 // at the arch now and is boarded there, so the one thing north of the platform that
 // anybody is allowed to walk to is the bus itself. Nobody is spawned there, and
 // nobody is sent there when there is no bus in it.
 const clearOfTunnelMouth=target=>{
  if(!target||!Number.isFinite(target[0])||!Number.isFinite(target[1]))return target;
  if(target[1]<=BUS_STATION.maxZ-0.35)return target;
  return [...BUS_STATION.platform];
 };
 const patrol=FULL_TOWN.active?FULL_TOWN.patrol:NIGHT_PATROL;
 const navigation=createNavigation(collides),routes=new Map(),destinations=new Map(),initialised=new Set(),patrols=new Map();let clockMinutes=1002;
 // Both published layouts run on the Harbour Line, so both are commuter layouts. Only
 // the archived residential street is not.
 const COMMUTER_LAYOUTS=['shopping-district','peninsula'];
 const commuterMode=()=>COMMUTER_LAYOUTS.includes(world.townMode)||COMMUTER_LAYOUTS.includes(state()?.townMode);
 for(const person of world.people)person.g.userData.scheduled=true;
 const thuan=world.people.find(p=>p.profile?.name==='Thuan');
 const staffBreak=thuan&&world.staffBench?createStaffBenchRoutine({entity:thuan.g,seat:world.staffBench.seat,isOccupied:()=>{
  const p=getObserverPosition();return p&&Math.hypot(p.x-STAFF_BENCH.seat[0],p.z-STAFF_BENCH.seat[1])<.9;
 }}):null;
 const thuanCommutePriority=()=>thuanHasCommutePriority(thuan?.g,thuan?commuterPhase(thuan.profile,clockMinutes):null);
 const yieldAsideForThuan=person=>{
  if(person===thuan||!thuanCommutePriority())return null;
  const tg=thuan.g,g=person.g;
  // Buying soda, eating, serving, sitting and other authored activities win right
  // of way. Thuan sees the resident as a solid obstacle and finds another line.
  if(residentCommitted(g))return null;
  if(g.userData.indoors||g.userData.inMarket||g.userData.inIzakaya||g.userData.inRamen||g.userData.inHome)return null;
  const point=yieldAsideTarget([g.position.x,g.position.z],[tg.position.x,tg.position.z],tg.rotation.y,
   (x,z)=>collides(x,z,.32),(x,z)=>Math.abs(groundHeight(x,z)-g.position.y)<.45);
  return point?clearOfTunnelMouth(point):null;
 };
 const indoorDoor=(profile,place)=>place==='home'?profile.home:place==='market'?MARKET_THRESHOLD:place==='ramen'?RAMEN_DOOR:place==='izakaya'?IZAKAYA_DOOR:place==='bus'?BUS_STATION.queue:place==='work'&&profile.workSite?profile.work:null;
 function destination(person,target,tag){
  const key=person.g.userData.name+'/'+tag+'/'+target.join(',');if(destinations.has(key))return destinations.get(key);
  for(let radius=0;radius<=10;radius+=.85)for(let i=0;i<(radius?24:1);i++){
   const a=i/24*Math.PI*2,point=[target[0]+Math.cos(a)*radius,target[1]+Math.sin(a)*radius];
   if(collides(...point,.32)||[...destinations.values()].some(p=>Math.hypot(point[0]-p[0],point[1]-p[1])<.85))continue;
   destinations.set(key,point);return point;
  }return target;
 }
 function faceStep(g,dx,dz,dt,turnRate=2.6){
  const heading=travelYaw(dx,dz),delta=travelError(g.rotation.y,dx,dz);
  g.rotation.y+=THREE.MathUtils.clamp(delta,-turnRate*dt,turnRate*dt);
  return forwardOnly(g.rotation.y,dx,dz);
 }
 function move(person,target,dt,tag,pace=0){const g=person.g,arrival=person===thuan&&tag==='nap'?STAFF_BENCH.approachRadius:.7;if(Math.hypot(g.position.x-target[0],g.position.z-target[1])<arrival)return;
  // Somebody standing inside a collider can never leave it. Every step out of one is
  // still in one, so the walker refuses all of them -- and the route it would have
  // followed comes back empty anyway, because the path starts in an obstacle. Getting
  // up off the staff bench did exactly this, and she played out the rest of her day
  // from inside the bench. So before anything else: if the ground underfoot is already
  // blocked, walk whichever way has the most room, which can only be out.
  if(collides(g.position.x,g.position.z,.3)){
   // The nearest direction with room to stand in, searched outwards. A probe close in
   // is no use: clearing a bench means getting a body's width past it, so half a metre
   // of looking finds nothing and decides there is nowhere to go.
   let escape=null;
   for(const reach of [.35,.7,1.05,1.4,1.75]){
    for(let i=0;i<8;i++){
     const angle=i*Math.PI/4,px=g.position.x+Math.sin(angle)*reach,pz=g.position.z+Math.cos(angle)*reach;
     if(collides(px,pz,.3)||Math.abs(groundHeight(px,pz)-g.position.y)>.4)continue;
     escape=angle;break;
    }
    if(escape!==null)break;
   }
   if(escape!==null){
    const escapeDx=Math.sin(escape),escapeDz=Math.cos(escape);
    const escapeHeading=Math.atan2(-escapeDx,-escapeDz);
    const escapeAngle=Math.atan2(Math.sin(escapeHeading-g.rotation.y),Math.cos(escapeHeading-g.rotation.y));
    if(!faceStep(g,escapeDx,escapeDz,dt))return;
    // The step itself is not collision-checked, because every step from in here fails
    // that check -- that is the whole problem. Worst case it crosses something thin on
    // the way out, which beats standing in a bench until the end of the day.
    const out=Math.min(.4,dt*(person===thuan?.9:2.4)*alignedStep(escapeAngle));
    if(out<=0)return;
    const x=g.position.x+escapeDx*out,z=g.position.z+escapeDz*out;
    g.position.set(x,groundHeight(x,z),z);routes.delete(g);
   }
   return;
  }
  let route=routes.get(g);if(!route||route.tag!==tag){route={tag,points:navigation.path(g.position,{x:target[0],z:target[1]}),at:0,stalled:0,checkpoint:g.position.clone()};routes.set(g,route);}
  route.stalled+=dt;
  if(g.position.distanceTo(route.checkpoint)>1){route.stalled=0;route.checkpoint.copy(g.position);}
  if(route.stalled>3){
   const obstacles=world.people.filter(p=>p.g!==g&&!p.g.userData.indoors&&!p.g.userData.inIzakaya&&!p.g.userData.inMarket&&!p.g.userData.inRamen&&!p.g.userData.inHome).map(p=>p.g.position.clone());
   const detour=createNavigation((x,z,r)=>collides(x,z,r)||obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<r+.34));
   const points=detour.path(g.position,{x:target[0],z:target[1]});
   if(points.length){route.points=points;route.at=0;}route.stalled=0;route.checkpoint.copy(g.position);
  }
  const goal=route.points[route.at];if(!goal)return;const dx=goal[0]-g.position.x,dz=goal[1]-g.position.z,d=Math.hypot(dx,dz);if(d<Math.min(.16,arrival)){route.at++;return;}
  // A leg may ask for its own pace: an afternoon by the sea is not an errand.
  // Forward-only turns cost a little travel time at every corner. Thuan recovers it
  // on the straight instead of stealing it by sliding while still turned aside.
  const paceLimit=pace||(person===thuan?1.4:person.profile?.age>65?.75:1.25);
  const speed=person===thuan?Math.min(paceLimit,(route.speed||0)+dt*1.8):paceLimit;
  const step=Math.min(d,dt*speed),nx=g.position.x+dx/d*step,nz=g.position.z+dz/d*step;
  const clearOfPeople=(x,z)=>world.people.every(p=>{
   if(p.g===g||p.g.userData.indoors||p.g.userData.inIzakaya||p.g.userData.inMarket||p.g.userData.inRamen||p.g.userData.inHome||p.g.userData.inWorkplace)return true;
   const old=Math.hypot(p.g.position.x-g.position.x,p.g.position.z-g.position.z),next=Math.hypot(p.g.position.x-x,p.g.position.z-z);
   // Thuan commute priority: others treat her as a wide impassable; she may ease past them
   // while they yield (sidestep below). Does not change faceStep / alignedStep.
   if(thuanCommutePriority()){
    if(person===thuan&&p===thuan)return true;
    const radius=commuteCrowdRadii(person===thuan,p===thuan,residentCommitted(p.g));
    if(p===thuan||person===thuan)return next>=radius||(old<radius&&next>old+.00001);
   }
   return next>=.61||(old<.61&&next>old+.00001);
  });
  // Near the Konbini door, lateral sidesteps into the frontage collider read as a
  // glide/moonwalk through the opening. Prefer forward/axis probes only.
  const atMarketDoor=tag==='market'&&d<2.8;
  const candidates=atMarketDoor?[[nx,nz],[nx,g.position.z],[g.position.x,nz]]:[[nx,nz],[nx,g.position.z],[g.position.x,nz],[g.position.x-dz/d*step,g.position.z+dx/d*step],[g.position.x+dz/d*step,g.position.z-dx/d*step]];
  const beforeX=g.position.x,beforeZ=g.position.z;
  for(const [x,z] of candidates){
   if(Math.hypot(x-beforeX,z-beforeZ)<.000001)continue;
   if(!clearOfPeople(x,z)||collides(x,z,.3)||Math.abs(groundHeight(x,z)-g.position.y)>step*.65+.025)continue;
   // Face the actual clear step, including a detour, before advancing. Turning after
   // translation lets the walk clip carry them backwards or sideways around corners.
   const stepDx=x-beforeX,stepDz=z-beforeZ;
   const stepHeading=travelYaw(stepDx,stepDz);
   const stepAngle=travelError(g.rotation.y,stepDx,stepDz);
   if(!faceStep(g,stepDx,stepDz,dt)){
    // A deliberate turn is progress, not a blockage. Replanning mid-turn can choose
    // a grid point behind them and make them turn back and forth without leaving it.
    route.speed=0;route.stalled=0;route.checkpoint.copy(g.position);return;
   }
   // faceStep may have completed the last fraction of the turn this frame. Measure
   // alignment again after it, so translation always agrees with the rendered body.
   const travel=alignedStep(travelError(g.rotation.y,stepDx,stepDz));
   if(travel<=0){route.speed=0;route.stalled=0;route.checkpoint.copy(g.position);return;}
   const ax=beforeX+stepDx*travel,az=beforeZ+stepDz*travel;
   if(travel<1&&(!clearOfPeople(ax,az)||collides(ax,az,.3))){
    route.speed=0;route.stalled=0;route.checkpoint.copy(g.position);return;
   }
   g.position.set(ax,groundHeight(ax,az),az);route.speed=speed;break;
  }
  const movedX=g.position.x-beforeX,movedZ=g.position.z-beforeZ;
  // Facing during outdoor schedule walks is owned by faceStep above.
  if(Math.hypot(movedX,movedZ)<.0001)route.speed=0;
 }

 /** True while the Harbour Line is standing at the terminus with its doors to you. */
 const atTheStop=()=>{const run=world.bus;return !run||['waiting','turning'].includes(run.phase);};
 /**
  * Somebody who has been waiting has got on once the bus they were waiting for has
  * pulled away. Without the memory they would blink out the moment their shift ended
  * whenever the service happened to be up the road, which is the thing this replaces.
  */
 const seenAtStop=new WeakSet(),aboard=new WeakSet();
 // Queue places are handed out in the order people arrive at the stop and given back
 // when they board, so the queue does not grow a gap where somebody used to stand.
 const queued=new Map();
 const queueNumber=g=>{
  const taken=new Set(queued.values());
  let place=0;while(taken.has(place))place++;
  queued.set(g,place);return place;
 };
 function boarded(g){
  const run=world.bus;
  if(!run)return true;                                   // No service modelled: as before.
  // Somebody who has walked through the door is on it. Without this the hold put them
  // straight back on the pavement the frame after they got on, because the bus was
  // still standing there and "still standing there" used to mean "still boarding".
  if(aboard.has(g))return true;
  if(atTheStop()){seenAtStop.add(g);return false;}        // It is here; you are still getting on.
  return seenAtStop.has(g);                               // It has gone, and you were here for it.
 }
 /** The kerb beside the bus's own door, so people step off it rather than out of it. */
 // You get off where you would have got on: the door, at the front of the bus, on the
 // flank away from the carriageway. It used to be worked out as an offset from the bus
 // and pointed at the shelter, which stopped being behind the bus when the bus stopped
 // coming down to the shelter.
 const alightingPoint=()=>world.bus?.door||BUS_STATION.arrival;
 return {update(dt,minutes,rain){if(paused())return;clockMinutes=minutes;const minute=((minutes%1440)+1440)%1440,transit=commuterMode(),day=Math.floor(minutes/1440);
  const outside=[];
  for(const p of world.people){const v=p.profile;if(!v)continue;const g=p.g;
   if(g.userData.playerControlled){outside.push(p);continue;}
   if(p===thuan&&staffBreak?.active){
    staffBreak.update(dt,residentPlan(v,minutes,rain,state(),transit).place==='nap');
    routes.delete(g);outside.push(p);continue;
   }
   if(g.userData.inWorkplace||g.userData.inIzakaya||g.userData.inMarket||g.userData.inRamen||g.userData.inHome)continue;
   const phase=transit?commuterPhase(v,minutes,rain):'legacy';
   // They leave on the bus, not by ceasing to exist at the kerb. While the service is
   // somewhere up the road they wait in the queue, and they only go once there has
   // been a bus standing there for them to go in.
   // Somebody who was already away when the game loaded is away.
   //
   // The hold below exists so that nobody blinks out at the kerb while you are
   // watching them, and there is nothing to preserve for a person you have never seen.
   // Held from the first frame, they spawn on the plan's target instead -- which for
   // 'away' is the far end of the bus road -- and stand in a clump at the mouth of the
   // tunnel until the next service, which is now as much as two and a half hours.
   if(transit&&phase==='away'&&!initialised.has(g))seenAtStop.add(g);
   const holdForBus=transit&&phase==='away'&&!boarded(g);
   if(transit&&phase==='away'&&!holdForBus){g.visible=false;delete g.userData.indoors;delete g.userData.usingTownObject;g.userData.place='away';g.userData.activity='away from the shopping district';g.userData.commuterAwayDay=day;routes.delete(g);continue;}
   // Coming back is the same in reverse: nobody is put down on the platform until the
   // bus they would have been on is at it.
   if(transit&&phase==='arriving'&&(!g.visible||g.userData.commuterAwayDay===day)){
    if(!atTheStop())continue;
    const step=alightingPoint();
    g.position.set(step[0],groundHeight(step[0],step[1]),step[1]);g.visible=true;
    aboard.delete(g);delete g.userData.commuterAwayDay;routes.delete(g);
   }
   const scheduled=residentPlan(v,minutes,rain,state(),transit),plan=activities?.plan(p,scheduled,minutes,rain,dt)||scheduled;let target=clearOfTunnelMouth(plan.target),tag=plan.place;
   g.userData.place=plan.place;g.userData.activity=plan.activity;delete g.userData.justArrived;
   // Still on the platform: the plan has written them off as away, so put them back in
   // the queue rather than sending them walking up the bus road on foot.
   if(holdForBus){g.visible=true;target=BUS_STATION.queue;tag='bus';g.userData.place='bus';g.userData.activity='waiting for the Harbour Line';}
   // The bus stands at the arch, not at the shelter, so that is where it is boarded --
   // and they set off for it as soon as they are going, rather than waiting on the
   // platform for it to show and then having twelve metres of road to cover in the
   // time it stands there. They wait at the door instead, which is where you wait for
   // a bus that only stops in one place.
   if(transit&&tag==='bus'&&world.bus&&phase!=='arriving'){
    // Each of them gets their own place in the queue: the same door for everybody put
    // the whole evening shift in one another's coats on the kerb.
    if(!Number.isFinite(g.userData.busQueue))g.userData.busQueue=queueNumber(g);
    target=world.bus.queueSpot(g.userData.busQueue);
   }
   if(tag==='patrol'){
    let index=patrols.get(g)||0;
    if(Math.hypot(g.position.x-patrol[index][0],g.position.z-patrol[index][1])<.85)index=(index+1)%patrol.length;
    patrols.set(g,index);target=patrol[index];tag='patrol-'+index;
   }
   if(v.name==='Kenji'&&state().kenjiEscort==='walking'){
    target=FULL_TOWN.active?FULL_TOWN.escort:TOWN_DESTINATIONS.workshop;tag='escort';g.userData.activity='showing the workshop';
    if(Math.hypot(g.position.x-target[0],g.position.z-target[1])<1)state().kenjiEscort='done';
   }
   // Venue thresholds must not be displaced by generic crowd spacing.
   if(!(tag==='work'&&v.workSite)&&!['home','izakaya','ramen','market','bus','station','nap'].includes(tag)&&!tag.startsWith('patrol')&&!tag.startsWith('town-activity'))target=destination(p,target,tag);
   if(!initialised.has(g)){
    initialised.add(g);
    const remembered=state().residentLocations?.[v.name],valid=remembered&&Array.isArray(remembered.position)&&remembered.position.length===2&&remembered.position.every(Number.isFinite)&&Math.abs(remembered.position[0])<300&&Math.abs(remembered.position[1])<300;
    // Indoor saves name a place, whose threshold may have moved since saving.
    // If its schedule has changed, the resident leaves that door and walks onward.
    const rememberedDoor=transit&&remembered?.indoors==='home'?null:indoorDoor(v,remembered?.indoors),savedWalk=valid&&!transit&&!collides(...remembered.position,.32);
    const spawn=rememberedDoor||(savedWalk?clearOfTunnelMouth(remembered.position):transit&&phase==='arriving'?BUS_STATION.arrival:clearOfTunnelMouth(target));
    delete g.userData.indoors;
    if(rememberedDoor)g.userData.indoors=remembered.indoors;
    else if(!savedWalk&&indoorDoor(v,tag))g.userData.indoors=tag;
    // Everybody restored from the same saved waypoint used to arrive in one another's
    // coats, and the crowd rule cannot separate bodies that start in the same place:
    // it only lets a step through when it increases the gap, and three people walking
    // the same way keep the gap at nothing. So they are set down a pace apart.
    const place=Number.isFinite(g.userData.busQueue)?g.userData.busQueue:0;
    const settle=place?[spawn[0]-(place%2)*.72,spawn[1]-Math.floor(place/2)*.95]:spawn;
    g.position.set(settle[0],groundHeight(...settle),settle[1]);
   }
   if(g.userData.indoors&&g.userData.indoors!==tag){delete g.userData.indoors;routes.delete(g);}
   if(p===thuan&&tag==='nap'&&staffBreak?.update(dt,true)){routes.delete(g);outside.push(p);continue;}
   const indoor=['home','izakaya','ramen','market'].includes(tag)||tag==='work'&&v.workSite;
   const arrived=()=>Math.hypot(g.position.x-target[0],g.position.z-target[1])<.85;
   const yieldTarget=p!==thuan?yieldAsideForThuan(p):null;
   if(yieldTarget){
    // Idle chats must not pin someone in Thuan's morning path.
    delete g.userData.chatHold;delete g.userData.chat;
    g.userData.activity='making way for Thuan';
    move(p,yieldTarget,dt,'yield-thuan');
   }else if(!g.userData.indoors&&!g.userData.usingTownObject&&!g.userData.chatHold&&!(g.userData.facePlayerUntil>performance.now())&&!(tag==='escort'&&g.position.distanceTo(player.position)>6))move(p,target,dt,tag,plan.pace);
   // A passenger caught halfway through the step when the bus goes is put back on
   // their feet, rather than left holding a hand on a door that is not there.
   if(g.userData.boarding&&!(transit&&tag==='bus'&&world.bus?.boarding)){
    delete g.userData.boarding;delete g.userData.usingTownObject;
   }
   // Getting on, rather than ceasing to exist at the kerb. The last two metres are
   // walked by hand because the inside of a bus is inside the bus's own collider and
   // the walker will not take a step into one.
   //
   // Either still inside their departing window, or past it and held at the door for
   // the bus they are plainly waiting for. Asking only for 'departing' meant the one
   // person whose departure time had come and gone -- which is everybody, by the time
   // the bus they are catching is standing there -- never got on it.
   if(transit&&tag==='bus'&&(phase==='departing'||holdForBus)&&world.bus?.boarding&&(g.userData.boarding||arrived())){
    const [insideX,insideZ]=world.bus.doorway;
    g.userData.boarding=true;g.userData.usingTownObject=true;
    g.userData.activity='getting on the Harbour Line';
    const dx=insideX-g.position.x,dz=insideZ-g.position.z,reach=Math.hypot(dx,dz);
    if(reach>.3){
     const step=Math.min(reach,dt*1.1);
     g.position.x+=dx/reach*step;g.position.z+=dz/reach*step;
     g.rotation.y=Math.atan2(-dx,-dz);
     outside.push(p);continue;
    }
    world.busStation?.board(v.name,minutes);aboard.add(g);
    queued.delete(g);delete g.userData.busQueue;
    delete g.userData.boarding;delete g.userData.usingTownObject;
    g.userData.commuterAwayDay=day;g.userData.place='away';g.userData.activity='left by bus';
    g.visible=false;routes.delete(g);continue;
   }
   if(indoor&&(g.userData.indoors===tag||arrived())){
    if(!g.userData.indoors)g.userData.justArrived=true;
    g.userData.indoors=tag;g.visible=false;routes.delete(g);
    g.userData.activity=tag==='home'?homeRoutine(v,minutes).activity+' at home':plan.activity;
   }else outside.push(p);
   const home=world.homes?.get(v.name);if(home)home.occupied=g.userData.indoors==='home';
  }
  // Ten distinct low-poly residents remain present; camera rank cannot hide a neighbour.
  outside.forEach(p=>{if(!(transit&&p.g.userData.commuterAwayDay===day))p.g.visible=true;});world.updateHomes?.(minutes);
  if(world.cat){const s=state();const spots=FULL_TOWN.active?FULL_TOWN.catTargets:[TOWN_DESTINATIONS.books,[-4,-18],TOWN_DESTINATIONS.pier];let target=spots[minute<600?0:minute<1080?1:2];if(s.quest===3)target=spots[0];else if(s.quest===1)target=spots[1];if(s.quest===2||s.inventory.includes('Sea bream'))target=[player.position.x+.8,player.position.z+.8];move({g:world.cat},target,dt,'cat-'+Math.round(target[0]/3)+'-'+Math.round(target[1]/3));}
 },snapshot(){return Object.fromEntries(world.people.map(p=>{const g=p.g,inside=g.userData.indoors,phase=commuterMode()?commuterPhase(p.profile,clockMinutes):'legacy',target=phase==='away'?BUS_STATION.exit:indoorDoor(p.profile,inside);return [p.profile.name,{position:target?[...target]:[g.position.x,g.position.z],indoors:target&&phase!=='away'?inside:null,place:phase==='away'?'away':g.userData.place}];}));},pose(){}};
}
