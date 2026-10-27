import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {townCalendarAt} from '../src/town-clock.js';
import {rotaWeek} from '../src/people/ferry-crew.js';
import {ACCOUNTS} from '../src/commerce/merchandising.js';
import * as higaLiquor from '../src/commerce/higa-liquor.js';
import {HIGA_NOTICE,HIGA_KUSU,YUNTAKU,yuntakuSeatAt} from '../src/commerce/higa-liquor.js';
import {TRADE_ROUND,roundAt,roundToday,roundDropsOn,roundDeliveryBook,kojiAshore} from '../src/commerce/trade-round.js';
import {SAKURA_BOTTLES} from '../src/commerce/konbini.js';
import {FERRY_TIMETABLE,timetableBerth} from '../src/world/ferry-timetable.js';
import {LAUNDRY_KEEPER,LAUNDRY_VISITS,LAUNDRY_MACHINES,LAUNDRY_NOTICES,laundryVisitsOn,laundryMachinesAt,visitTimeline,
 playerWashStage,freeMachine,laundryNotices} from '../src/commerce/coin-laundry.js';
import {canonicalDay,canonicalDestination} from '../src/people/canonical-day.js';
import {RESIDENTS} from '../src/people/residents.js';
import {residentPlan} from '../src/people/social.js';
import {CAST,PLACES,castMember} from '../src/people/cast.js';
import {STAND_SEQUENCES} from '../src/people/stand-sequences.js';
import {LAUNDRY_STANDS,LAUNDRY_SEATS} from '../src/people/shop-days.js';
import {sitOnStand,standUpFromStand,seatedOn} from '../src/people/stand-seat.js';
import {residentHome} from '../src/people/home-directory.js';
import {seatEdge} from './seat-edge.mjs';

/**
 * Higa Liquor and the coin laundry (the owner, 21 October 2026; AGENTS.md): the laundry's keeper, its washing days, the
 * machines turning on the clock and the noticeboard's story hooks, and the bench of an evening. Higa Liquor is shut for
 * good since 22 October 2026 (the owner: Sakura sells and supplies all the alcohol, Kōji's round is Sakura Trading's, the
 * building stands shut with a notice on it): its notice, the round and the shut front are checked here too. Every number
 * here is the data's, so the world and the stories read the same.
 */
installDOM();
const DAY=1440;
/** The first town day from day 10000 with this town weekday (and, if asked, Kōji ashore or aboard). */
function dayWith(weekday,ashore=null){
 for(let d=10000;d<10100;d++){const m=d*DAY+720;if(townCalendarAt(m).weekday===weekday&&(ashore===null||kojiAshore(m)===ashore))return d*DAY;}
 throw new Error('no such day');
}
const at=(day,h,m=0)=>day+h*60+m;

test('Higa Liquor is shut for good: no hours and no card, a closing notice that sends the regulars to Sakura',()=>{
 for(const gone of ['higaLiquorState','higaLiquorOpen','higaLiquorKeeper','higaShutterDown','higaDoorsShut','higaRusuCard','HIGA_LIQUOR_HOURS','HIGA_RUSU_CARD','HIGA_COUNTER','HIGA_ROUND'])
  assert.equal(higaLiquor[gone],undefined,gone+' went with the shop');
 assert.equal(HIGA_NOTICE.jp,'閉店のお知らせ');assert.ok(HIGA_NOTICE.jpLines.some(l=>/さくら商店/.test(l)),'the paper on the shutter points to Sakura');
 assert.match(HIGA_NOTICE.en,/Sakura Shōten/);assert.ok(!/[぀-ヿ一-龯]/.test(HIGA_NOTICE.en),'the player reads English');
 assert.equal(HIGA_NOTICE.who,'Grandmother Higa');
 // What the counter sold, Sakura sells at its till, at the Higas' prices.
 assert.deepEqual(SAKURA_BOTTLES.map(b=>[b.id,b.cost]),[['awamori-mini',600],['umineko-large',330],['sake-cup',220]]);
});

// Higa Liquor stays shut (22 October 2026). Since 27 October Grandmother Higa also keeps Johansson Mart's till in Kitahama on
// weekday evenings and Saturdays, when Sakura is shut and Miss Higa has the bandai (world/okinawa/kitahama-shop.js).
test('nobody keeps the shut liquor shop: Grandmother Higa keeps the bath and Johansson Mart’s till, and Yui no counter on Saturdays',()=>{
 const wed=dayWith(3),sat=dayWith(6),sun=dayWith(0);
 for(const [name,day,h,place] of [['Grandmother Higa',wed,10,'onsen'],['Grandmother Higa',wed,14,'onsen'],['Grandmother Higa',wed,18,'kitahama-shop'],['Grandmother Higa',wed,21,'home'],
  ['Grandmother Higa',sat,10,'kitahama-shop'],['Grandmother Higa',sat,18,'kitahama-shop'],['Grandmother Higa',sun,18,'home'],['Miss Higa',sat,10,'onsen'],['Miss Higa',sat,18,'onsen']])
  assert.equal(canonicalDay(name,at(day,h)).place,place,`${name} at ${h} on ${townCalendarAt(day).weekday}`);
 for(let d=10000;d<10007;d++)for(const p of CAST)for(let m=0;m<DAY;m+=30)assert.notEqual(canonicalDay(p.name,d*DAY+m)?.place,'higa-liquor',p.name+' is never behind the shut counter');
 for(const p of CAST)assert.ok(!p.day.some(r=>r[1]==='higa-liquor'),p.name+'’s day has no counter');
 assert.ok(PLACES['higa-liquor'].closed&&!PLACES['higa-liquor'].keepers,'the place is closed, and keeps nobody');
 assert.equal(castMember('Grandmother Higa').work,'onsen');
});

test('the round is Sakura Trading’s, Kōji’s on his weeks ashore only, between the ice plant and his sleep',()=>{
 const tueAshore=dayWith(2,true),tueAboard=dayWith(2,false),friAshore=dayWith(5,true),satAshore=dayWith(6,true),wedAshore=dayWith(3,true);
 assert.equal(roundToday(at(tueAshore,10)),true);assert.equal(roundToday(at(tueAboard,10)),false,'never on his weeks aboard');
 assert.equal(roundToday(at(wedAshore,10)),false,'and only on the days with a drop');assert.equal(roundToday(at(satAshore,10)),false,'no round on Saturday');
 // The bars and Mr Fujita's shed (the Higas' six o'clock van has gone); Sakura is not a drop: its beer is in the depot.
 for(const day of [tueAshore,friAshore])assert.deepEqual(roundDropsOn(at(day,10)).map(s=>s.account),['izakaya','ramen','coral-bay-bar','fujita-shed']);
 for(const s of TRADE_ROUND.stops)assert.ok(ACCOUNTS.sakura[s.account]?.alcohol?.length,s.account+' takes its drink on its Sakura account');
 assert.ok(!TRADE_ROUND.stops.some(s=>s.account==='market'),'Sakura is not a drop');
 // The Coral Bay Bar's ice boxes wait at the Port Terminal for the next boat out of Minato, which the account names; the
 // ferry is at Kitano-jima when the round passes.
 const coral=TRADE_ROUND.stops.find(s=>s.account==='coral-bay-bar'),drop=Number(coral.at.slice(0,2))*60+Number(coral.at.slice(3));
 const next=FERRY_TIMETABLE.filter(s=>s.from==='town'&&s.departs>drop).sort((a,b)=>a.departs-b.departs)[0];
 assert.equal(coral.place,'port');assert.equal(timetableBerth(drop),'airport','the ferry is across the water at the drop');
 assert.ok(ACCOUNTS.sakura['coral-bay-bar'].delivery.includes(`${String(next.departs/60|0).padStart(2,'0')}:${String(next.departs%60).padStart(2,'0')} boat`),'the account names the boat the ice boxes take');
 assert.equal(TRADE_ROUND.driver,'Kōji');assert.equal(TRADE_ROUND.pay,1500);assert.equal(TRADE_ROUND.load.place,'warehouse');
 // His day around it: the auction and the ice plant before, the depot, the drops, the empties, home to sleep at noon.
 assert.equal(canonicalDay('Kōji',at(tueAshore,10,35)).place,'trade-round');assert.deepEqual(canonicalDay('Kōji',at(tueAshore,10,35)).target,[...TRADE_ROUND.load.at],'loading at the depot');
 assert.equal(canonicalDay('Kōji',at(tueAshore,10,45)).place,'trade-round');
 assert.equal(canonicalDay('Kōji',at(tueAshore,9,30)).place,'ice-plant');
 assert.notEqual(canonicalDay('Kōji',at(tueAshore,12,30)).place,'trade-round');
 assert.ok(TRADE_ROUND.start>=9*60&&TRADE_ROUND.end<=12*60);
 // On his weeks aboard the ship has him, round or no round.
 assert.equal(canonicalDay('Kōji',at(tueAboard,10,45)).place,'ferry');
 for(let m=TRADE_ROUND.start;m<TRADE_ROUND.end;m+=5){const leg=roundAt(at(tueAshore,0)+m);assert.ok(leg&&(leg.place||leg.point),'a leg at '+m);}
 const book=roundDeliveryBook(at(tueAshore,10));
 assert.match(book,/^Sakura Shōten \(Sakura Trading\) · drink round/);
 for(const s of TRADE_ROUND.stops)assert.ok(book.includes(ACCOUNTS.sakura[s.account].name),'the book names '+ACCOUNTS.sakura[s.account].name);
 assert.match(book,/Kōji’s truck/);assert.match(roundDeliveryBook(at(tueAboard,10)),/customers collect/);
 assert.ok(!/[぀-ヿ一-龯]/.test(book),'the book the player reads is English');
});

test('the family kusu is never sold, and is a story hook',()=>{
 assert.ok(HIGA_KUSU.neverSold&&HIGA_KUSU.hooks.length>=2);
 assert.ok(castMember('Miss Higa')&&HIGA_KUSU.laidDown===1997-castMember('Miss Higa').age,'laid down the year Yui was born');
});

test('the bench: Tetsuo and Mac by their own days in the evening opening, Mr Fujita’s crate empty while he is on watch',()=>{
 const wed=dayWith(3);
 assert.ok(yuntakuSeatAt('Tetsuo',at(wed,18,45)));assert.ok(yuntakuSeatAt('Mac',at(wed,19,45)));
 assert.equal(yuntakuSeatAt('Mac',at(wed,19)),null,'Mac is still aboard at seven');assert.equal(yuntakuSeatAt('Tetsuo',at(wed,20,5)),null,'everyone goes at eight');
 // The bench no longer keeps the shop's hours: Saturday's sitters are there too.
 assert.ok(yuntakuSeatAt('Tetsuo',at(dayWith(6),18,45)));
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
 assert.ok(laundryVisitsOn(at(sun,12)).some(v=>v.name==='Thao'));assert.ok(laundryVisitsOn(at(wed,12)).some(v=>v.name==='Nhung'));
 // Ms Uezu: the first day of her week ashore, when Kōji takes her place aboard.
 for(let d=10000;d<10042;d++){const m=d*DAY+600,on=laundryVisitsOn(m).some(v=>v.name==='Ms Uezu');assert.equal(on,rotaWeek(m)===1&&d%7===0);}
 for(const v of LAUNDRY_VISITS){const t=visitTimeline(v);assert.ok(t.wash[0]>=v.from&&t.fold[0]<=v.to&&t.wash[1]<=t.dry[0],v.name+'’s washing fits the visit');}
 for(let d=10000;d<10042;d++)for(let m=0;m<DAY;m+=5){
  const busy=new Map();
  for(const v of laundryVisitsOn(d*DAY+m)){if(m<v.from||m>=v.to)continue;for(const id of [...v.washers,v.dryer]){assert.ok(!busy.has(id),`${id} is ${busy.get(id)}’s and ${v.name}’s at ${m}`);busy.set(id,v.name);}}
 }
 // Each visitor is free then by their own day: Thao is up (she sleeps until noon), Nhung, the doctor since 22 October 2026,
 // has set the paper's page (Dr Kakazu's evening, with the clinic's towels, is hers).
 const nhung=RESIDENTS.find(p=>p.name==='Nhung'),plan=residentPlan(nhung,at(wed,21,40),false,{});
 assert.equal(plan.place,'coin-laundry');assert.equal(plan.stand.seat.key,LAUNDRY_SEATS[0].key,'on the bench while it washes');
});

test('the machines turn on the clock: a resident’s washer, then their dryer, and the player’s own wash',()=>{
 const wed=dayWith(3),v=LAUNDRY_VISITS.find(v=>v.name==='Nhung'),t=visitTimeline(v);
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
const {HIGA_LETTERING,HIGA_FRAME}=await import('../src/world/okinawa/higa-liquor-dressing.js');
const {laundryPoint,LAUNDRY_ROUND_POINTS}=await import('../src/world/okinawa/coin-laundry-dressing.js');
globalThis.self=globalThis;
const scene=new THREE.Scene();
const world=createTown({scene,sites:createIslandBusinesses(),mobile:true,shadows:false,kitano:'distant',register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
const solidAt=(x,z,r=.3)=>world.colliders.filter(c=>c&&(c.minY??0)<1.5&&circleHitsRect(x,z,r,c));

test('the people modules’ numbers are the buildings’ (shop-days.js, stand-sequences.js)',()=>{
 const near=(a,b)=>assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-9,a+' versus '+b);
 near(TRADE_ROUND.load.at,canonicalDestination('Kōji','warehouse'));
 near(LAUNDRY_STANDS.W1.at,laundryPoint(-1.0,1.4));near(LAUNDRY_SEATS[0].stand,laundryPoint(-.8,-.55));
 const round=STAND_SEQUENCES['laundry-round'].points.map(p=>[p.x,p.z]);
 for(const p of Object.values(LAUNDRY_ROUND_POINTS).slice(0,4))assert.ok(round.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<1e-9),'the round stops at '+p);
});

test('every place somebody stands is clear of every solid, and every seat is on something',()=>{
 const stands=[['Kōji loading at the depot',TRADE_ROUND.load.at],['the crate yard',TRADE_ROUND.empties.point],
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

test('the shut front at every hour: the shutter down, the doors shut, the lights off, the notice on the shutter',()=>{
 const {higa,coinLaundry}=world.quarters,wed=dayWith(3),doorway=[5.9,8.4];
 const blocked=()=>world.colliders.some(c=>(c.id==='higa-doors'||c.id==='higa-shutter')&&standingHitsRect(doorway[0]+.25,doorway[1],.28,0,c));
 assert.equal(higa.update,undefined,'nothing on the front follows the clock');assert.equal(higa.card,undefined,'no 留守 card');
 for(const [h,m] of [[10,0],[14,0],[18,30],[22,0]]){
  for(const hourly of world.hourly)hourly(at(wed,h,m));
  assert.equal(blocked(),true,`nobody walks in at ${h}:${m}`);assert.equal(higa.shutter.visible,true,'the shutter is down');assert.equal(higa.lights.emissiveIntensity,0,'and the lights are off');
 }
 // The notice is taped to the shutter's face, in front of the steel and not through it.
 const notice=HIGA_LETTERING.notice,face=HIGA_FRAME.D-.15+.01;
 assert.ok(notice.at[2]>face&&notice.at[2]-face<.01,'the notice sits on the shutter');
 assert.ok(Math.abs(notice.at[0])+notice.w/2<HIGA_FRAME.open&&notice.at[1]-notice.h/2>.08,'within the shutter');
 // The laundry: the doctor's washing goes round on Wednesday night, the drum turning and his basket on the machine.
 coinLaundry.update(at(wed,21,30));const w3=coinLaundry.machines.find(m=>m.id==='W3');assert.equal(w3.load.visible,true);assert.equal(w3.basket.visible,true);
 const a=w3.load.rotation.x;coinLaundry.update(at(wed,21,30)+.02);assert.notEqual(w3.load.rotation.x,a,'the drum turns');
 coinLaundry.update(at(wed,22));assert.ok(coinLaundry.glass.opacity>.3,'the glass is misted at night');
 coinLaundry.update(at(wed,11));assert.ok(coinLaundry.machines.every(m=>!m.load.visible),'nothing turns on a quiet morning');
});
