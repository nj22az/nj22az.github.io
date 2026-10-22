import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {townCalendarAt} from '../src/town-clock.js';
import {rotaWeek} from '../src/people/ferry-crew.js';
import {ACCOUNTS} from '../src/commerce/merchandising.js';
import {higaLiquorState,higaLiquorKeeper,higaShutterDown,higaDoorsShut,higaRusuCard,higaRoundAt,higaRoundToday,higaDropsOn,
 higaDeliveryBook,HIGA_ROUND,HIGA_FRONT,HIGA_KUSU,YUNTAKU,yuntakuSeatAt,kojiAshore} from '../src/commerce/higa-liquor.js';
import {LAUNDRY_KEEPER,LAUNDRY_VISITS,LAUNDRY_MACHINES,LAUNDRY_NOTICES,laundryVisitsOn,laundryMachinesAt,visitTimeline,
 playerWashStage,freeMachine,laundryNotices} from '../src/commerce/coin-laundry.js';
import {canonicalDay} from '../src/people/canonical-day.js';
import {CAST,PLACES,castMember} from '../src/people/cast.js';
import {STAND_SEQUENCES} from '../src/people/stand-sequences.js';
import {HIGA_COUNTER_STAND,LAUNDRY_STANDS,LAUNDRY_SEATS} from '../src/people/shop-days.js';
import {sitOnStand,standUpFromStand,seatedOn} from '../src/people/stand-seat.js';
import {residentHome} from '../src/people/home-directory.js';
import {seatEdge} from './seat-edge.mjs';

/**
 * Higa Liquor and the coin laundry (the owner, 21 October 2026; AGENTS.md): who keeps them and when, the 留守 card, the
 * delivery round on Kōji's weeks ashore, the bench of an evening, the laundry's washing days, the machines turning on the
 * clock and the noticeboard's story hooks. Every number here is the data's, so the world and the stories read the same.
 */
installDOM();
const DAY=1440;
/** The first town day from day 10000 with this town weekday (and, if asked, Kōji ashore or aboard). */
function dayWith(weekday,ashore=null){
 for(let d=10000;d<10100;d++){const m=d*DAY+720;if(townCalendarAt(m).weekday===weekday&&(ashore===null||kojiAshore(m)===ashore))return d*DAY;}
 throw new Error('no such day');
}
const at=(day,h,m=0)=>day+h*60+m;

test('the hours: open 9–12 and 17–20, the 留守 card between, the shutter at night, every day',()=>{
 const tue=dayWith(2);
 for(const [h,m,state] of [[8,59,'shut'],[9,0,'open'],[11,59,'open'],[12,0,'away'],[14,0,'away'],[16,59,'away'],[17,0,'open'],[18,30,'open'],[20,0,'shut'],[22,0,'shut']])
  assert.equal(higaLiquorState(at(tue,h,m)),state,`${h}:${m}`);
 assert.equal(higaShutterDown(at(tue,22)),1,'the shutter is down at night');assert.equal(higaShutterDown(at(tue,14)),0,'and up while she is at the bath');
 assert.equal(higaDoorsShut(at(tue,14)),1,'the doors are shut between the openings');assert.equal(higaDoorsShut(at(tue,10)),0);assert.equal(higaDoorsShut(at(tue,18,30)),0);
 assert.equal(higaRusuCard(at(tue,14)),true,'the card hangs on the door at two');
 for(const h of [10,18,22])assert.equal(higaRusuCard(at(tue,h)),false,'and only then ('+h+')');
 // The doors shut a little after noon, once she has walked out through them, and the shutter rolls in a few seconds.
 assert.equal(higaDoorsShut(at(tue,12,0)),0,'still open as she steps out');const rolling=at(tue,20,0)+HIGA_FRONT.after+HIGA_FRONT.roll/2;assert.ok(higaShutterDown(rolling)>0&&higaShutterDown(rolling)<1,'the shutter is rolling, not popping');
});

test('Grandmother Higa keeps the counter, Yui on Saturdays; the canonical day puts them behind it',()=>{
 const wed=dayWith(3),sat=dayWith(6);
 assert.equal(higaLiquorKeeper(at(wed,10)),'Grandmother Higa');assert.equal(higaLiquorKeeper(at(wed,18)),'Grandmother Higa');
 assert.equal(higaLiquorKeeper(at(sat,10)),'Miss Higa');assert.equal(higaLiquorKeeper(at(sat,18)),'Miss Higa');
 assert.equal(higaLiquorKeeper(at(wed,14)),null);
 for(const [name,day,h,place] of [['Grandmother Higa',wed,10,'higa-liquor'],['Grandmother Higa',wed,14,'onsen'],['Grandmother Higa',wed,18,'higa-liquor'],['Grandmother Higa',wed,21,'home'],
  ['Miss Higa',sat,10,'higa-liquor'],['Miss Higa',sat,18,'higa-liquor'],['Miss Higa',sat,21,'onsen'],['Grandmother Higa',sat,10,'home'],['Grandmother Higa',sat,18,'onsen']]){
  const plan=canonicalDay(name,at(day,h));assert.equal(plan.place,place,`${name} at ${h} on ${townCalendarAt(day).weekday}`);
  if(place==='higa-liquor'){assert.deepEqual(plan.target,[...HIGA_COUNTER_STAND.at]);assert.equal(plan.stand.pose,'CounterIdle');}
 }
 assert.deepEqual(PLACES['higa-liquor'].keepers,['Grandmother Higa','Miss Higa']);
});

test('the round is Kōji’s on his weeks ashore only, between the ice plant and his sleep, to the shop’s own accounts',()=>{
 const tueAshore=dayWith(2,true),tueAboard=dayWith(2,false),satAshore=dayWith(6,true),wedAshore=dayWith(3,true);
 assert.equal(higaRoundToday(at(tueAshore,10)),true);assert.equal(higaRoundToday(at(tueAboard,10)),false,'never on his weeks aboard');
 assert.equal(higaRoundToday(at(wedAshore,10)),false,'and only on the days with a drop');
 assert.deepEqual(higaDropsOn(at(satAshore,10)).map(s=>s.account),['market']);
 assert.deepEqual(higaDropsOn(at(tueAshore,10)).map(s=>s.account),['izakaya','ramen','coral-bay-bar']);
 for(const s of HIGA_ROUND.stops)assert.ok(ACCOUNTS['higa-saketen'][s.account],s.account+' is one of the shop’s accounts');
 assert.deepEqual([...new Set(HIGA_ROUND.stops.map(s=>s.account))].sort(),['coral-bay-bar','izakaya','market','ramen'],'the four customers the owner named');
 // His day around it: the auction and the ice plant before, home to sleep at noon after.
 assert.equal(canonicalDay('Kōji',at(tueAshore,10,45)).place,'higa-round');
 assert.equal(canonicalDay('Kōji',at(tueAshore,9,30)).place,'ice-plant');
 assert.notEqual(canonicalDay('Kōji',at(tueAshore,12,30)).place,'higa-round');
 assert.ok(HIGA_ROUND.start>=9*60&&HIGA_ROUND.end<=12*60);
 // On his weeks aboard the ship has him, round or no round.
 assert.equal(canonicalDay('Kōji',at(tueAboard,10,45)).place,'ferry');
 for(let m=HIGA_ROUND.start;m<HIGA_ROUND.end;m+=5){const leg=higaRoundAt(at(tueAshore,0)+m);assert.ok(leg&&(leg.place||leg.point),'a leg at '+m);}
 const book=higaDeliveryBook(at(tueAshore,10));
 for(const a of Object.values(ACCOUNTS['higa-saketen']))assert.ok(book.includes(a.name),'the book names '+a.name);
 assert.match(book,/Kōji’s truck/);assert.match(higaDeliveryBook(at(tueAboard,10)),/customers collect/);
 assert.ok(!/[぀-ヿ一-龯]/.test(book),'the book the player reads is English');
});

test('the family kusu is never sold, and is a story hook',()=>{
 assert.ok(HIGA_KUSU.neverSold&&HIGA_KUSU.hooks.length>=2);
 assert.ok(castMember('Miss Higa')&&HIGA_KUSU.laidDown===1997-castMember('Miss Higa').age,'laid down the year Yui was born');
});

test('the bench: Tetsuo and Mac by their own days in the evening opening, Mr Fujita’s crate empty while he is on watch',()=>{
 const wed=dayWith(3);
 assert.ok(yuntakuSeatAt('Tetsuo',at(wed,18,45)));assert.ok(yuntakuSeatAt('Mac',at(wed,19,45)));
 assert.equal(yuntakuSeatAt('Mac',at(wed,19)),null,'Mac is still aboard at seven');assert.equal(yuntakuSeatAt('Tetsuo',at(wed,20,5)),null,'everyone goes when the shop shuts');
 assert.equal(yuntakuSeatAt('Mr Fujita',at(wed,19,45)),null);
 const fuji=canonicalDay('Mr Fujita',at(wed,19,45));assert.notEqual(fuji?.place,'higa-bench','sober on the bridge until 22:20');
 const mac=canonicalDay('Mac',at(wed,19,45));assert.equal(mac.place,'higa-bench');assert.equal(mac.stand.seat.height,YUNTAKU.seats.mac.height);assert.equal(mac.stand.held,'beer');
 assert.equal(canonicalDay('Mac',at(wed,20,15)).place,'izakaya','his one beer is still Minato’s');
 for(const p of CAST.filter(p=>['Tetsuo','Mac'].includes(p.name)))assert.ok(p.day.some(r=>r[1]==='higa-bench'),p.name+'’s day says so');
});

test('a seat: they sit back onto it from the point in front, and stand up onto that point again',()=>{
 const g=new THREE.Group();g.position.set(...[YUNTAKU.seats.mac.stand[0],0,YUNTAKU.seats.mac.stand[1]]);
 const stand={yaw:0,pose:'Drink',held:'beer',seat:{key:'higa-mac',at:YUNTAKU.seats.mac.at,height:.31}};
 sitOnStand(g,stand);assert.equal(g.position.x,YUNTAKU.seats.mac.at[0]);assert.equal(g.userData.seatHeight,.31);assert.equal(g.userData.heldItem,'beer');assert.ok(seatedOn(g,stand));
 sitOnStand(g,stand);assert.equal(g.position.x,YUNTAKU.seats.mac.at[0],'sitting twice does not move them');
 standUpFromStand(g);assert.equal(g.position.x,YUNTAKU.seats.mac.stand[0]);assert.equal(g.userData.seatHeight,undefined);assert.equal(seatedOn(g,stand),false);
});

test('the laundry’s keeper is Ms Ganaha, the nearest with a free morning, on a stand round before the mailbag',()=>{
 assert.equal(LAUNDRY_KEEPER.name,'Ms Ganaha');assert.deepEqual(PLACES['coin-laundry'].keepers,['Ms Ganaha']);
 const door=[-8,20.7],dist=n=>{const t=residentHome(n).target;return Math.hypot(t.x-door[0],t.z-door[1]);};
 const nearer=CAST.filter(p=>!p.supporting&&p.name!=='Ms Ganaha'&&residentHome(p.name)?.target&&dist(p.name)<dist('Ms Ganaha')-.01).map(p=>p.name);
 assert.deepEqual(nearer,['Officer Mori'],'only the policeman lives nearer, and he may not keep a business');
 const day=dayWith(4),plan=canonicalDay('Ms Ganaha',at(day,8,30));
 assert.equal(plan.place,'coin-laundry');assert.equal(plan.stand.sequence,'laundry-round');
 assert.equal(canonicalDay('Ms Ganaha',at(day,9,45)).place,'port','the mailbag at half past nine');
 assert.ok(STAND_SEQUENCES['laundry-round'].points.length>=3);
});

test('washing days come from the residents’ own days and the ship’s rota, and no two visits share a machine at once',()=>{
 const sun=dayWith(0),wed=dayWith(3);
 assert.ok(laundryVisitsOn(at(sun,12)).some(v=>v.name==='Thao'));assert.ok(laundryVisitsOn(at(wed,12)).some(v=>v.name==='Dr Kakazu'));
 // Ms Uezu: the first day of her week ashore, when Kōji takes her place aboard.
 for(let d=10000;d<10042;d++){const m=d*DAY+600,on=laundryVisitsOn(m).some(v=>v.name==='Ms Uezu');assert.equal(on,rotaWeek(m)===1&&d%7===0);}
 for(const v of LAUNDRY_VISITS){const t=visitTimeline(v);assert.ok(t.wash[0]>=v.from&&t.fold[0]<=v.to&&t.wash[1]<=t.dry[0],v.name+'’s washing fits the visit');}
 for(let d=10000;d<10042;d++)for(let m=0;m<DAY;m+=5){
  const busy=new Map();
  for(const v of laundryVisitsOn(d*DAY+m)){if(m<v.from||m>=v.to)continue;for(const id of [...v.washers,v.dryer]){assert.ok(!busy.has(id),`${id} is ${busy.get(id)}’s and ${v.name}’s at ${m}`);busy.set(id,v.name);}}
 }
 // Each visitor is free then by their own day: Thao is up (she sleeps until noon), Dr Kakazu is back from supper.
 assert.equal(canonicalDay('Dr Kakazu',at(wed,21,40)).place,'coin-laundry');
 assert.equal(canonicalDay('Dr Kakazu',at(wed,21,40)).stand.seat.key,LAUNDRY_SEATS[0].key,'on the bench while it washes');
});

test('the machines turn on the clock: a resident’s washer, then their dryer, and the player’s own wash',()=>{
 const wed=dayWith(3),v=LAUNDRY_VISITS.find(v=>v.name==='Dr Kakazu'),t=visitTimeline(v);
 const state=(m,id)=>laundryMachinesAt(wed+m).find(s=>s.id===id);
 assert.equal(state(t.wash[0]+1,'W3').running,'wash');assert.equal(state(t.dry[0]+1,'D2').running,'dry');assert.equal(state(t.dry[0]+1,'W3').running,null);
 assert.equal(state(t.wash[0]-30,'W3').running,null,'nothing turns before anyone comes');
 const start=wed+600,id=freeMachine('washer',start);assert.ok(id&&id!=='W4','a 7 kg washer is offered first');
 const wash={machine:id,start};
 assert.equal(playerWashStage(wash,start+10).stage,'washing');assert.equal(laundryMachinesAt(start+10,wash).find(s=>s.id===id).running,'wash');
 assert.equal(playerWashStage(wash,start+31).stage,'washed');
 const dryer=freeMachine('dryer',start+31,wash),dried={...wash,dryer,dryStart:start+31};
 assert.equal(playerWashStage(dried,start+40).stage,'drying');assert.equal(playerWashStage(dried,start+62).stage,'dried');
 assert.equal(laundryMachinesAt(start+40,dried).find(s=>s.id===dryer).running,'dry');
 assert.equal(freeMachine('washer',start+10,wash)===id,false,'your washer is not offered to you again');
 for(const m of LAUNDRY_MACHINES)assert.ok(m.cost>0&&m.minutes>0);
});

test('the noticeboard: real story hooks, the week’s calendar and the weather',()=>{
 for(const n of LAUNDRY_NOTICES){assert.ok(n.jp&&n.title&&n.text&&n.by,n.id);assert.ok(n.hook,n.id+' is a story hook');assert.ok(!/[぀-ヿ一-龯]/.test(n.title+n.text),n.id+': the player reads English');}
 for(const kind of ['missing','found','lessons'])assert.ok(LAUNDRY_NOTICES.some(n=>n.kind===kind),kind);
 for(const n of LAUNDRY_NOTICES)assert.ok(n.by==='the town calendar'||castMember(n.by),n.by+' posted it and lives here');
 const sat=dayWith(6),board=laundryNotices(at(sat,10));
 assert.ok(board.some(n=>n.id==='event-fish-auction'),'Sunday’s fish auction is on the board on Saturday');
 assert.ok(!board.some(n=>n.id==='event-nhung-day-off'),'nobody pins up somebody’s day off');
});

test('every new day row and stand point of the cast is reachable data',()=>{
 for(const p of CAST)for(const [,place] of p.day)if(['higa-bench','coin-laundry','higa-liquor'].includes(place))assert.ok(canonicalDay(p.name,0)!==undefined);
 for(const s of Object.values(LAUNDRY_STANDS))assert.ok(s.at.every(Number.isFinite));
});

// The buildings, as the town builds them: the hours move the doors, the card and the shutter, the machines turn, and every
// place the data stands somebody is clear of every solid, every seat on something.
const {createTown}=await import('../src/world/town.js');
const {createIslandBusinesses}=await import('../src/world/businesses.js');
const {circleHitsRect,standingHitsRect}=await import('../physics.js');
const {HIGA_KEEPER_AT}=await import('../src/world/okinawa/higa-liquor-dressing.js');
const {laundryPoint,LAUNDRY_ROUND_POINTS}=await import('../src/world/okinawa/coin-laundry-dressing.js');
globalThis.self=globalThis;
const scene=new THREE.Scene();
const world=createTown({scene,sites:createIslandBusinesses(),mobile:true,shadows:false,kitano:'distant',register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
const solidAt=(x,z,r=.3)=>world.colliders.filter(c=>c&&(c.minY??0)<1.5&&circleHitsRect(x,z,r,c));

test('the people modules’ numbers are the buildings’ (shop-days.js, stand-sequences.js)',()=>{
 const near=(a,b)=>assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-9,a+' versus '+b);
 near(HIGA_COUNTER_STAND.at,HIGA_KEEPER_AT);
 near(LAUNDRY_STANDS.W1.at,laundryPoint(-1.0,1.4));near(LAUNDRY_SEATS[0].stand,laundryPoint(-.8,-.55));
 const round=STAND_SEQUENCES['laundry-round'].points.map(p=>[p.x,p.z]);
 for(const p of Object.values(LAUNDRY_ROUND_POINTS).slice(0,4))assert.ok(round.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<1e-9),'the round stops at '+p);
});

test('every place somebody stands is clear of every solid, and every seat is on something',()=>{
 const stands=[['the counter',HIGA_COUNTER_STAND.at],['Kōji loading',HIGA_ROUND.load.at],['the crate yard',HIGA_ROUND.empties.point],
  ...Object.entries(YUNTAKU.seats).map(([k,s])=>['bench '+k,s.stand]),...Object.entries(LAUNDRY_STANDS).map(([k,s])=>['laundry '+k,s.at]),
  ...LAUNDRY_SEATS.map(s=>['laundry bench',s.stand])];
 for(const [what,[x,z]] of stands)assert.deepEqual(solidAt(x,z).map(c=>c.id),[],what+' is clear');
 for(const [k,s] of Object.entries(YUNTAKU.seats))assert.ok(solidAt(...s.at,.05).some(c=>/higa-bench|higa-crate-stool/.test(c.id)),k+' sits on the bench or a crate');
 for(const s of LAUNDRY_SEATS)assert.ok(solidAt(...s.at,.05).some(c=>c.id==='laundry-bench'),'on the laundry bench');
});

test('the bench’s front edge is where its slats end: the sitters’ shins hang in front of it, not through the top',()=>{
 // (seat-slots.js `front`, measured on the drawn bench as tests/seat-edge.mjs measures the rooms' seats; 1 cm, as there)
 let seat=null;world.group.traverse(o=>{if(o.userData.seat?.id==='higa-yuntaku-bench')seat=o.userData.seat;});
 assert.ok(seat,'the player’s end of the bench is a seat');
 for(const [k,s] of [['player',seat],['tetsuo',{...seat,position:[YUNTAKU.seats.tetsuo.at[0],0,YUNTAKU.seats.tetsuo.at[1]],front:YUNTAKU.seats.tetsuo.front}]]){
  const edge=seatEdge(world.group,s);assert.ok(edge,k+': the bench is drawn under the mark');
  assert.ok(Math.abs(edge.front-s.front)<=.01,`${k}: says ${s.front}, the slats end at ${edge.front.toFixed(3)}`);
  assert.ok(Math.abs(edge.front-YUNTAKU.seats[k].front)<=.01,k+': YUNTAKU says the same');
 }
});

test('the hours move the front: open doors by day, the card and shut doors at two, the shutter at night',()=>{
 const {higa,coinLaundry}=world.quarters,wed=dayWith(3),doorway=[5.9,8.4];
 const blocked=()=>world.colliders.some(c=>(c.id==='higa-doors'||c.id==='higa-shutter')&&standingHitsRect(doorway[0]+.25,doorway[1],.28,0,c));
 higa.update(at(wed,10));assert.equal(higa.card.visible,false);assert.equal(blocked(),false,'in through the doors at ten');
 higa.update(at(wed,14));assert.equal(higa.card.visible,true,'the 留守 card at two');assert.equal(blocked(),true,'the doors are shut');assert.equal(higa.shutter.visible,false);
 higa.update(at(wed,18,30));assert.equal(blocked(),false);assert.ok(higa.lights.emissiveIntensity>0,'the tubes are on in the evening opening');
 higa.update(at(wed,22));assert.equal(higa.shutter.visible,true,'the shutter is down');assert.equal(higa.lights.emissiveIntensity,0,'and the lights are off');
 // The laundry: the doctor's washing goes round on Wednesday night, the drum turning and his basket on the machine.
 coinLaundry.update(at(wed,21,30));const w3=coinLaundry.machines.find(m=>m.id==='W3');assert.equal(w3.load.visible,true);assert.equal(w3.basket.visible,true);
 const a=w3.load.rotation.x;coinLaundry.update(at(wed,21,30)+.02);assert.notEqual(w3.load.rotation.x,a,'the drum turns');
 coinLaundry.update(at(wed,22));assert.ok(coinLaundry.glass.opacity>.3,'the glass is misted at night');
 coinLaundry.update(at(wed,11));assert.ok(coinLaundry.machines.every(m=>!m.load.visible),'nothing turns on a quiet morning');
});
