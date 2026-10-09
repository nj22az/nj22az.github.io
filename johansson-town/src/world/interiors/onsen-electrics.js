import * as THREE from '../../../vendor/three.module.js';
import {pinLobbyChannel,lobbyChannelPin,LOBBY_CHANNELS} from './onsen-lobby.js';

/** The massage chair's seat front (room x, metres): the seat runs from here back to its backrest at 4.725. */
export const MASSAGE_CHAIR=Object.freeze({front:4.2});

/**
 * Umi-no-yu's electrics: the 分電盤 (distribution board) on the changing-room side of the
 * bandai wall, the circuits it feeds, and the things on them.
 *
 * Okinawa is 100 V, and every branch here is a 20 A breaker on 1.6 mm cable, so a branch
 * carries at most 2 000 W. On a busy evening three people dry their hair at once
 * (3 x 1 200 W) while somebody has ten minutes in the massage chair (200 W): 3 800 W on
 * the changing-room sockets, 38 A on a 20 A breaker, and it trips. The rest of the house
 * stays lit, because the main breaker (60 A) only sees the whole building's 47 A.
 *
 * Everything here is data first (ONSEN_CIRCUITS): what each circuit feeds, how much it
 * draws, which lamps and screens go dark without it, and why it is wired the way it is,
 * so stories and tests can ask the same questions the room answers.
 *
 * Loads are switched on and off (switchOn / switchOff): `atRest` is how each one stands
 * when nobody touches it (the lamps, the fridge and the pump run; the dryers and the chair
 * wait for a bather or a coin). A breaker is a thermal switch, so an overloaded branch
 * does not open at once: it warms for as long as its trip curve says (BREAKER_CURVE) and
 * then lets go, which is why everything roars for a while before the CLICK. The film stages
 * the moments it needs by name (ONSEN_SCENARIOS, stageScenario).
 *
 * Room frame as in onsen.js: street door at +z, sea at -z, metres, floor at y = 0.
 */
export const ONSEN_VOLTS=100;

/** The board: on the changing-room face of the wall between the lobby and the changing room. */
export const ONSEN_BOARD=Object.freeze({
 x:-3.6,y:1.1,wallZ:1.54,w:.52,h:.62,d:.14,
 facing:'-z',doorOpen:165,
 where:'On the changing-room face of the bandai wall, just round the noren from the bandai: Mrs Higa can reach it in four steps without leaving the building. It hangs low, the main lever at shoulder height and the rest below it, so anyone in the house can throw a lever in the dark without a step stool. It is clear of the lockers’ end, where nobody leans, and the door stays open in the evening so the levers can be read from the vanity.',
 main:Object.freeze({id:'main',jp:'主幹',en:'Main breaker',amps:60,
  why:'The whole bathhouse is one 60 A supply at 100 V: 6 000 W before the main opens. It protects the service cable from the pole.'}),
 elcb:Object.freeze({id:'elcb',jp:'漏電遮断器',en:'Earth-leakage breaker',amps:60,milliamps:30,
  why:'Opens the whole board if 30 mA leaks to earth: through wet tiles, a cracked dryer, a person. In a building full of water this is the most important switch on the board.'}),
});

const plain=(o)=>Object.freeze(o);
/**
 * Every branch circuit. `loads` are the things actually on it: their watts, the purpose
 * that put them there, and what in the room depends on them (`meshes` glow, `lights` are
 * the point lights, `screens` and `hides` are switched off). `normal` is the load on a
 * quiet evening; the busy evening is every load at once.
 */
export const ONSEN_CIRCUITS=Object.freeze([
 plain({id:'changing-sockets',no:1,jp:'脱衣所コンセント',en:'Changing-room sockets',amps:20,volts:ONSEN_VOLTS,
  why:'The sockets under the vanity mirrors, where people dry their hair after the bath. When the massage chair arrived in 2003 its socket was run as a spur off the left mirror’s socket, in white surface raceway round the changing room and over the noren (ONSEN_RACEWAY), rather than from the board, so the chair shares the dryers’ breaker.',
  normal:['dryer-2','massage-chair'],
  loads:Object.freeze([
   plain({id:'dryer-1',en:'Hair dryer 1, cream, at the left mirror',watts:1200,atRest:'off',by:'a bather at the left mirror',meshes:['Hair dryer 1','Hair dryer 1 pilot'],socket:'Vanity socket 1',
    shows:plain({lamp:'Hair dryer 1 pilot',air:'Hair dryer 1 air',hum:'Hair dryer 1'}),
    purpose:'The oldest dryer, kept at the end mirror by the lockers for regulars who dry their hair before they dress.'}),
   plain({id:'dryer-2',en:'Hair dryer 2, blue, at the middle mirror',watts:1200,atRest:'off',by:'a bather at the middle mirror',meshes:['Hair dryer 2','Hair dryer 2 pilot'],socket:'Vanity socket 2',
    shows:plain({lamp:'Hair dryer 2 pilot',air:'Hair dryer 2 air',hum:'Hair dryer 2'}),
    purpose:'The one most people use: the middle mirror has the best light from the pendant.'}),
   plain({id:'dryer-3',en:'Hair dryer 3, coral, at the right mirror',watts:1200,atRest:'off',by:'a bather at the right mirror',meshes:['Hair dryer 3','Hair dryer 3 pilot'],socket:'Vanity socket 3',
    shows:plain({lamp:'Hair dryer 3 pilot',air:'Hair dryer 3 air',hum:'Hair dryer 3'}),
    purpose:'Added for the evening rush, when families come in after the ferry and three people want the mirror at once.'}),
   plain({id:'massage-chair',en:'Massage chair',watts:200,atRest:'off',by:'a ¥100 coin: ten minutes',meshes:['Massage chair seat','Massage chair lamp'],socket:'Massage chair socket',raceway:'Massage chair raceway',
    shows:plain({lamp:'Massage chair lamp',motion:'Massage chair rollers'}),
    purpose:'Ten minutes for ¥100 in the lobby after the bath; the coins pay for itself and the coffee-milk habit.'}),
  ])}),
 plain({id:'changing-lights',no:2,jp:'脱衣所照明',en:'Changing-room lights',amps:20,volts:ONSEN_VOLTS,
  why:'The changing room’s lamp on a circuit of its own, so a tripped socket never leaves people undressing in the dark.',
  normal:['changing-pendant'],
  loads:Object.freeze([
   plain({id:'changing-pendant',en:'Changing-room pendant lamp',watts:40,atRest:'on',by:'Mrs Higa at opening time',meshes:['Changing-room pendant lamp'],lights:['Changing-room light'],
    fixture:plain({kind:'pendant',at:[1.5,2.7,.2],light:[1.5,2.5,.3]}),
    purpose:'Hangs from the middle beam over the bench and the mirrors, the brightest place to find your locker key.'}),
  ])}),
 plain({id:'bath-lights',no:3,jp:'浴室照明',en:'Bath lights',amps:20,volts:ONSEN_VOLTS,
  why:'Sealed damp-proof lamps over the washing places and the indoor bath, on their own breaker so a fault in the wet room is found on its own.',
  normal:['bath-lamp-west','bath-lamp-east'],
  loads:Object.freeze([
   plain({id:'bath-lamp-west',en:'Bath-hall lamp over the washing places',watts:60,atRest:'on',by:'Mrs Higa at opening time',meshes:['Bath hall lamp west'],lights:['Bath hall light west'],
    fixture:plain({kind:'sealed',at:[-1.5,2.8,-2.8],light:[-1.5,2.5,-2.8]}),
    purpose:'Lights the taps and mirrors where people wash before they get in.'}),
   plain({id:'bath-lamp-east',en:'Bath-hall lamp over the indoor bath',watts:60,atRest:'on',by:'Mrs Higa at opening time',meshes:['Bath hall lamp east'],lights:['Bath hall light east'],
    fixture:plain({kind:'sealed',at:[2.8,2.8,-2.9],light:[2.8,2.5,-2.9]}),
    purpose:'Lights the indoor bath so you can see the step down into the water.'}),
  ])}),
 plain({id:'lobby',no:4,jp:'玄関・番台',en:'Lobby and bandai',amps:20,volts:ONSEN_VOLTS,
  why:'The front of the house: the lobby lamp, the andon on the bandai, the television, and the changing-room fan, whose socket is back to back with the television’s through the same wall.',
  normal:['lobby-lamp','andon','television','fan'],
  loads:Object.freeze([
   plain({id:'lobby-lamp',en:'Lobby ceiling lamp',watts:40,atRest:'on',by:'Mrs Higa at opening time',meshes:['Lobby ceiling lamp'],lights:['Lobby light'],
    fixture:plain({kind:'flush',at:[-2,2.8,3],light:[-2,2.5,3]}),
    purpose:'Over the genkan and the bandai, so Mrs Higa can see the coins and you can see your shoes.'}),
   plain({id:'andon',en:'Andon on the bandai',watts:25,atRest:'on',by:'Mrs Higa at opening time',meshes:['Andon'],
    purpose:'The paper lamp Grandmother Higa put on the bandai in the seventies; it says the bath is open from the street.'}),
   plain({id:'television',en:'Lobby television',watts:80,atRest:'on',by:'Mrs Higa, for the night game',screens:['Lobby CRT'],
    purpose:'The night game for people cooling down on the tatami.'}),
   plain({id:'fan',en:'Changing-room fan',watts:30,atRest:'on',by:'Mrs Higa at opening time',socket:'Fan socket',
    purpose:'Cools people coming out of the bath at 42 degrees; it turns its head so everyone on the bench gets some.'}),
  ])}),
 plain({id:'fridge',no:5,jp:'冷蔵庫',en:'Milk fridge',amps:20,volts:ONSEN_VOLTS,
  why:'A dedicated circuit so nobody’s hair dryer can ever switch the milk off overnight.',
  normal:['milk-cooler'],
  loads:Object.freeze([
   plain({id:'milk-cooler',en:'Coffee-milk cooler',watts:150,atRest:'on',by:'its own thermostat, day and night',meshes:['Milk cooler light'],
    purpose:'Keeps the white, coffee and fruit milk at 5 degrees for drinking standing up, hand on hip.'}),
  ])}),
 plain({id:'pump',no:6,jp:'ポンプ',en:'Bath pump',amps:20,volts:ONSEN_VOLTS,
  why:'A motor on its own breaker: it never trips with anything else, so the bath water keeps turning over through the filter.',
  normal:['circulation-pump'],
  loads:Object.freeze([
   plain({id:'circulation-pump',en:'Bath circulation pump',watts:400,atRest:'on',by:'the time switch in the boiler room',hides:['Spout water'],
    purpose:'Pushes the indoor bath through the filter and the heater and back out of the stone spout at 42 degrees.'}),
  ])}),
]);

const ALL_LOADS=ONSEN_CIRCUITS.flatMap(c=>c.loads);
const LOAD_BY_ID=new Map(ALL_LOADS.map(l=>[l.id,l]));
const knownLoad=id=>{if(!LOAD_BY_ID.has(id))throw new Error('No such load at Umi-no-yu: '+id);return id;};

/**
 * The board has eight ways. Six were wired when the bath was rewired in 1987; the last two
 * in the lower row were left blank for later (予備), behind white blanking covers, the way
 * a careful electrician leaves room on a board. In 2003 nobody used them (ONSEN_RACEWAY).
 */
export const ONSEN_SPARE_WAYS=Object.freeze([
 plain({way:7,id:'vanity-2',jp:'予備',en:'Spare',cover:'Spare way cover 7'}),
 plain({way:8,id:'vanity-3',jp:'予備',en:'Spare',cover:'Spare way cover 8'}),
].map(w=>plain({...w,why:'Left blank in 1987 behind a white blanking cover, so a new circuit can be added later without a new board.'})));

/**
 * The massage chair's spur: white PVC surface raceway (モール), added in 2003. It leaves the
 * left mirror's socket, climbs the vanity wall beside the lockers' end, runs round the
 * changing room at picture-rail height (west wall, then the bandai wall over the board and
 * over the noren), goes through the wall at the east end and comes down the lobby's east
 * wall to a surface socket box beside the chair. `path` is its centre line, room metres;
 * `face` is the wall each run is screwed to (the direction the raceway's back faces).
 */
export const ONSEN_RACEWAY=Object.freeze({
 id:'chair-spur',name:'Massage chair raceway',jp:'モール',en:'White PVC surface raceway',year:2003,
 from:'Vanity socket 1',to:'Massage chair socket',circuit:'changing-sockets',
 w:.035,d:.016,height:2.45,colour:0xfbfbf7,
 why:'When the massage chair came in 2003 there was no electrician on the island that week, so a handyman ran its socket off the nearest outlet on the dryers’ cable instead of opening the board: raceway screwed to the walls at picture-rail height, all the way round the changing room and through the wall to the chair. It works on a quiet evening (14 A) and puts the chair on the dryers’ 20 A breaker on a busy one, while two spare ways sat empty a metre away.',
 period:'Surface raceway is how Japanese houses and shops were extended without opening the walls from the 1980s on: white PVC, 25 mm, snap-on covers, moulded corner pieces and an end cap where it goes through a wall.',
 runs:Object.freeze([
  // Points on the wall face it is screwed to; `face` is that wall's outward normal.
  plain({side:'changing',wall:'vanity wall',face:'+z',path:Object.freeze([[-4.185,.88,-1.14],[-4.49,.88,-1.14],[-4.49,2.45,-1.14],[-4.94,2.45,-1.14]])}),
  plain({side:'changing',wall:'west wall, over the lockers',face:'+x',path:Object.freeze([[-4.94,2.45,-1.14],[-4.94,2.45,1.54]])}),
  plain({side:'changing',wall:'bandai wall, over the board and the noren',face:'-z',path:Object.freeze([[-4.94,2.45,1.54],[4.82,2.45,1.54]]),end:'wall'}),
  plain({side:'lobby',wall:'lobby side of the bandai wall',face:'+z',path:Object.freeze([[4.82,2.45,1.66],[4.94,2.45,1.66]]),start:'wall'}),
  plain({side:'lobby',wall:'east lobby wall, over the milk cooler',face:'-x',path:Object.freeze([[4.94,2.45,1.66],[4.94,2.45,2.9],[4.94,1.16,2.9]])}),
 ]),
 box:plain({at:[4.94,1.1,2.9],w:.075,h:.12,d:.035,why:'A surface socket box at the raceway’s end, above the wainscot rail so the raceway never has to cross it.'}),
});

/**
 * The fix (page 7): two new 20 A breakers in the spare ways, the middle and right mirrors'
 * sockets each moved to one of them. The left mirror's socket and the chair's 2003 spur
 * stay on circuit 1: 14 A at most. The new cables go up into the ceiling void and down
 * inside the vanity wall, so nothing new shows but the breakers and their labels, written
 * by hand on masking tape from Nhung's roll.
 */
export const ONSEN_FIX=Object.freeze({
 by:'Tetsuo, the island’s electrician',panels:Object.freeze(['7b','7c']),
 en:'Each mirror gets a circuit of its own.',
 route:'New 1.6 mm cable from each new breaker up into the ceiling void and down inside the vanity wall to its mirror’s socket: nothing on the walls, nothing to snag a towel.',
 tape:plain({en:'One roll of cream masking tape, written on in black marker',roll:'Nhung’s',
  why:'Every way on a board is labelled, or the next person to open it guesses. A printed label is for the next inspection; tonight it is tape and a marker, which is what an electrician carries.'}),
 circuits:Object.freeze([
  plain({id:'vanity-2',no:7,way:7,jp:'中鏡ドライヤー',en:'Middle mirror dryer',amps:20,volts:ONSEN_VOLTS,moves:Object.freeze(['dryer-2']),
   tape:plain({jp:'中鏡 ドライヤー',en:'middle mirror dryer'}),
   why:'The middle mirror’s socket on a cable of its own: one 1 200 W dryer is 12 A on a 20 A breaker, whatever the others do.'}),
  plain({id:'vanity-3',no:8,way:8,jp:'右鏡ドライヤー',en:'Right mirror dryer',amps:20,volts:ONSEN_VOLTS,moves:Object.freeze(['dryer-3']),
   tape:plain({jp:'右鏡 ドライヤー',en:'right mirror dryer'}),
   why:'The right mirror’s socket on a cable of its own, for the evening rush after the ferry.'}),
 ]),
});
const MOVED=new Map(ONSEN_FIX.circuits.flatMap(c=>c.moves.map(id=>[id,c.id])));
/** How the board is wired: as built (with the 2003 spur), or rewired after the fix. Each is a full circuit list. */
export const ONSEN_WIRING=Object.freeze({
 'as-built':ONSEN_CIRCUITS,
 rewired:Object.freeze([
  ...ONSEN_CIRCUITS.map(c=>c.id!=='changing-sockets'?c:plain({...c,loads:Object.freeze(c.loads.filter(l=>!MOVED.has(l.id))),normal:Object.freeze(['dryer-1','massage-chair']),
   why:'After the fix: the left mirror’s socket and the chair’s 2003 spur. One dryer and the chair: 14 A on 20.'})),
  ...ONSEN_FIX.circuits.map(f=>plain({id:f.id,no:f.no,jp:f.jp,en:f.en,amps:f.amps,volts:f.volts,why:f.why,fitted:'fix',normal:f.moves,loads:Object.freeze(f.moves.map(id=>LOAD_BY_ID.get(id)))})),
 ]),
});
const FIX_IDS=ONSEN_FIX.circuits.map(c=>c.id);
let wiring='as-built',taped=false;
const circuitsNow=()=>ONSEN_WIRING[wiring];
const byId=id=>circuitsNow().find(c=>c.id===id);
const ALL_SWITCHES=['main','elcb',...ONSEN_CIRCUITS.map(c=>c.id),...FIX_IDS];
/** Is a breaker fitted in that way right now (the spare ways only after the fix)? */
export const isFitted=id=>id==='main'||id==='elcb'||!!byId(id);
const known=id=>{
 if(!ALL_SWITCHES.includes(id))throw new Error('No such breaker on the Umi-no-yu board: '+id);
 if(!isFitted(id))throw new Error('Nothing fitted in that way of the Umi-no-yu board yet (a spare): '+id);
 return id;};
/** The board's wiring right now: 'as-built' or 'rewired', whether the tape labels are on, and its circuits. */
export const boardWiring=()=>({wiring,taped,circuits:circuitsNow()});

/** Watts on a circuit: every load, or only the ones named in `running`. */
export function wattsOf(circuitId,running=null){
 const c=byId(circuitId);if(!c)throw new Error('No such circuit: '+circuitId);
 return c.loads.filter(l=>!running||running.includes(l.id)).reduce((s,l)=>s+l.watts,0);
}
/** Amps on a circuit at 100 V (every load at once unless `running` says otherwise). */
export const loadOf=(circuitId,running=null)=>wattsOf(circuitId,running)/ONSEN_VOLTS;
/** Would that load trip the circuit's breaker? */
export const overloaded=(circuitId,running=null)=>loadOf(circuitId,running)>byId(circuitId).amps;
/** The circuit a load is on, as the board is wired now. */
export const circuitOf=loadId=>wiring==='rewired'&&MOVED.has(loadId)?MOVED.get(loadId):ONSEN_CIRCUITS.find(c=>c.loads.some(l=>l.id===loadId))?.id;

/**
 * How long a breaker carries an overload before its thermal element opens it, in seconds,
 * by multiple of its rating. An illustrative curve for a 1990s Japanese branch breaker,
 * inside the JIS limits for 30 A and under (it must open within 60 minutes at 125 % and
 * within 2 minutes at 200 %); from ten times its rating the magnetic trip opens it at once.
 * Between the points the time is read on a log-log line. At or under 105 % it never trips.
 */
export const BREAKER_CURVE=Object.freeze([[1.05,7200],[1.25,1200],[1.5,240],[2,30],[3,8],[5,3],[10,0]].map(p=>Object.freeze(p)));
/** Seconds a breaker carries `amps` before it trips (Infinity: never). */
export function tripSeconds(amps,rating){
 const r=amps/rating,C=BREAKER_CURVE;if(!(r>C[0][0]))return Infinity;if(r>=C.at(-1)[0])return 0;
 const i=C.findIndex(p=>p[0]>=r),[r0,t0]=C[i-1],[r1,t1]=C[i],k=Math.log(r/r0)/Math.log(r1/r0);
 return t1===0?t0*(1-k):Math.exp(Math.log(t0)+k*(Math.log(t1)-Math.log(t0)));
}
/** The loads that run when nobody touches anything. */
export const AT_REST=Object.freeze(ALL_LOADS.filter(l=>l.atRest==='on').map(l=>l.id));

// The board's state lives as long as the page: leave and come back and the lever is still down.
const on=new Map(ALL_SWITCHES.map(id=>[id,true]));
// Which loads are switched on (whether or not their breaker lets the power through), and
// how far each breaker's thermal element has got towards opening (0 cold, 1 open).
const running=new Set(AT_REST);
const heat=new Map(ALL_SWITCHES.map(id=>[id,0]));
let held=false;
const listeners=new Set();
const changed=()=>{for(const fn of listeners)fn();};
const switchesNow=()=>['main','elcb',...circuitsNow().map(c=>c.id)];
/** Is that breaker itself on (its own lever up)? */
export const isOn=id=>on.get(known(id));
/** Is there power on that circuit: its own lever, the earth-leakage breaker and the main all on. */
export function isLive(id){known(id);if(!on.get('main'))return false;if(id==='main')return true;if(!on.get('elcb'))return false;return on.get(id);}
export const isPowered=loadId=>isLive(circuitOf(knownLoad(loadId)));
/** Is that load switched on (its own switch, whatever the breaker is doing)? */
export const isRunning=loadId=>running.has(knownLoad(loadId));
/** Switched on and powered: the lamp is lit, the dryer blows, the chair kneads. */
export const isWorking=loadId=>isRunning(loadId)&&isPowered(loadId);
/** Every load switched on, in board order. */
export const runningLoads=()=>ALL_LOADS.filter(l=>running.has(l.id)).map(l=>l.id);
/** The ids of the loads switched on on that circuit. */
export const runningOn=circuitId=>{const c=byId(circuitId);if(!c)throw new Error('No such circuit: '+circuitId);return c.loads.filter(l=>running.has(l.id)).map(l=>l.id);};

/**
 * What the board carries right now: each branch's current from the loads switched on
 * (drawn only while the branch is live), whether it is over its rating and how many
 * seconds it has left; and the main, which sees every live branch added up.
 */
export function assess(){
 const circuits=circuitsNow().map(c=>{const on=runningOn(c.id),demand=loadOf(c.id,on),live=isLive(c.id),amps=live?demand:0,limit=tripSeconds(amps,c.amps);
  return {id:c.id,running:on,demand,amps,rating:c.amps,live,over:amps>c.amps,tripIn:Number.isFinite(limit)?Math.max(0,limit*(1-heat.get(c.id))):Infinity};});
 const amps=circuits.reduce((s,c)=>s+c.amps,0),limit=tripSeconds(amps,ONSEN_BOARD.main.amps);
 return {volts:ONSEN_VOLTS,wiring,circuits,main:{amps,rating:ONSEN_BOARD.main.amps,live:isLive('main'),over:amps>ONSEN_BOARD.main.amps,
  tripIn:Number.isFinite(limit)?Math.max(0,limit*(1-heat.get('main'))):Infinity}};
}
/**
 * Let `seconds` pass on the board: an overloaded live breaker warms towards its trip time
 * and opens when it gets there; one that is back within its rating cools off over a minute.
 * Returns the ids of the breakers that tripped.
 */
export function advance(seconds){
 if(held||!(seconds>0))return [];
 const tripped=[],a=assess();
 for(const x of [...a.circuits,{...a.main,id:'main'}]){
  if(!x.live){heat.set(x.id,0);continue;}
  const limit=tripSeconds(x.amps,x.rating);
  if(!Number.isFinite(limit)){heat.set(x.id,Math.max(0,heat.get(x.id)-seconds/60));continue;}
  const h=limit===0?1:heat.get(x.id)+seconds/limit;heat.set(x.id,Math.min(1,h));
  if(h>=1)tripped.push(x.id);
 }
 if(tripped.length){for(const id of tripped){on.set(id,false);heat.set(id,0);}changed();}
 return tripped;
}
/** Run the clock until nothing more will trip: what the room settles into if left alone. */
export function settle(){const all=[];for(let i=0;i<ALL_SWITCHES.length;i++){const a=assess(),next=Math.min(...a.circuits.map(c=>c.tripIn),a.main.tripIn);if(!Number.isFinite(next))break;all.push(...advance(next+1e-6));}return all;}
/** Switch a load on. It draws at once; an overload trips its breaker in the curve's time (advance). */
export function switchOn(loadId){knownLoad(loadId);held=false;if(running.has(loadId))return false;running.add(loadId);changed();return true;}
export function switchOff(loadId){knownLoad(loadId);held=false;if(!running.delete(loadId))return false;changed();return true;}
export function trip(id){known(id);held=false;if(!on.get(id))return false;on.set(id,false);heat.set(id,0);changed();return true;}
export function reset(id){known(id);held=false;if(on.get(id))return false;on.set(id,true);changed();return true;}
export function resetAll(){let any=false;for(const id of switchesNow())if(!on.get(id)){on.set(id,true);any=true;}if(any)changed();}

/**
 * The moments the film and the stories stage, by name. `on` are the loads switched on
 * besides the ones at rest, `down` the levers pulled down by hand, `settle` lets the
 * breakers do what they would, `hold` keeps the moment (no breaker warms until something
 * is switched), and `tv` is the channel the lobby set is pinned to. `wiring` is the board
 * as built (the default) or rewired after the fix, and `tape` puts the hand-written labels on.
 */
const BUSY=Object.freeze(['dryer-1','dryer-2','dryer-3','massage-chair']);
export const ONSEN_SCENARIOS=Object.freeze({
 rest:Object.freeze({on:[],down:[],tv:null,
  en:'Nobody at the mirrors and the chair free: the lamps, the andon, the television, the fan, the milk cooler and the pump.'}),
 quiet:Object.freeze({on:['dryer-2','massage-chair'],down:[],tv:'night-game',
  en:'A quiet evening: one dryer and the chair, 14 A on the changing-room sockets, well inside 20 A.'}),
 rush:Object.freeze({on:BUSY,down:[],hold:true,tv:'night-game',panels:Object.freeze(['2a','2b','2c','2d','4d']),
  en:'The ferry is in: three dryers and the massage chair at once, 38 A on a 20 A branch, the lever still up for the half minute before it lets go. The main sees 47 A.'}),
 busy:Object.freeze({on:BUSY,down:[],settle:true,tv:'night-game',panels:Object.freeze(['3a','3b','3c','3d','3e','4a','4b','4c','4e','5e','6a','6b','6c','6d']),
  en:'The same four loads, after the click: the changing-room sockets are down, the dryers and the chair dead with their switches still on; the lamps, the television and the main hold.'}),
 isolated:Object.freeze({on:[],down:['main','changing-sockets'],tv:'night-game',panels:Object.freeze(['7a']),
  en:'Isolate first: the main off before anybody touches the board. The whole house is dark and the television black.'}),
 fitting:Object.freeze({on:[],down:['main','vanity-2','vanity-3'],wiring:'rewired',tape:false,tv:'night-game',panels:Object.freeze(['7b']),
  en:'Still isolated, the blanking covers out of the spare ways and two new 20 A breakers clipped in, their levers down and no labels yet: the moment Nhung offers the tape.'}),
 fixed:Object.freeze({on:BUSY,down:[],wiring:'rewired',tape:true,settle:true,tv:'night-game',panels:Object.freeze(['7c','8a','8b','8c']),
  en:'After the fix, everything at once: the left mirror and the chair on circuit 1 (14 A), the middle and right mirrors on the new circuits 7 and 8 (12 A each), the main at 47 A. Nothing trips.'}),
});
/** Set the room to a named moment (ONSEN_SCENARIOS). Returns what the board then carries. */
export function stageScenario(name){
 const s=ONSEN_SCENARIOS[name];if(!s)throw new Error('No such Umi-no-yu scenario: '+name);
 wiring=s.wiring||'as-built';taped=!!s.tape;
 running.clear();for(const id of [...AT_REST,...s.on])running.add(knownLoad(id));
 for(const id of s.down)known(id);
 for(const id of ALL_SWITCHES){on.set(id,!s.down.includes(id));heat.set(id,0);}
 held=false;if(s.settle)settle();held=!!s.hold;
 pinLobbyChannel(s.tv);changed();return assess();
}

/** A canvas texture, or null where there is no page to draw it on (the room tests). */
function paint(w,h,draw){
 if(typeof document==='undefined'||!document.createElement)return null;
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext?.('2d');if(!ctx||!ctx.fillRect)return null;
 draw(ctx,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
const GOTHIC='"Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",sans-serif';
/** Write a line no wider than `max`, shrinking the type until it fits. */
function line(ctx,text,x,y,max,size,weight='bold'){
 let s=size;do{ctx.font=`${weight} ${s}px ${GOTHIC}`;}while(ctx.measureText(text).width>max&&--s>8);
 ctx.fillText(text,x,y);
}
const printed=(tex,color,extra={})=>new THREE.MeshStandardMaterial(tex?{map:tex,roughness:.6,polygonOffset:true,polygonOffsetFactor:-1,...extra}:{color,roughness:.6,...extra});

// Where each breaker sits on the board's front plate (board-local metres, origin at the
// middle of the plate, +x to your right as you face it). Eight ways, four to a row; the
// last two of the lower row are the spares (ONSEN_SPARE_WAYS).
const PLATE={w:.496,h:.596};
const COL=[-.18,-.06,.06,.18],ROW=[.01,-.162];
const LAYOUT=Object.freeze({
 main:{x:-.115,y:.19,w:.1,h:.11,lever:.05},
 elcb:{x:.115,y:.19,w:.1,h:.11,lever:.05},
 'changing-sockets':{x:COL[0],y:ROW[0]},'changing-lights':{x:COL[1],y:ROW[0]},'bath-lights':{x:COL[2],y:ROW[0]},lobby:{x:COL[3],y:ROW[0]},
 fridge:{x:COL[0],y:ROW[1]},pump:{x:COL[1],y:ROW[1]},'vanity-2':{x:COL[2],y:ROW[1]},'vanity-3':{x:COL[3],y:ROW[1]},
});
// Each label sits just under its breaker: half the breaker's height and half the label's below it.
const LABEL_H=.062,LABEL_W=.112,labelY=L=>L.y-(L.h||.09)/2-LABEL_H/2-.01;
/** A small integer hash in [0, 1): the same hand every time, never a dice roll. */
const hash=(i,s=0)=>{let h=(i*374761393+s*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;};

function plateTexture(){
 return paint(1024,1230,(ctx,W,H)=>{
  const px=x=>(x+PLATE.w/2)/PLATE.w*W,py=y=>(PLATE.h/2-y)/PLATE.h*H,m=W/PLATE.w;
  ctx.fillStyle='#d6d8d2';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#9da19a';ctx.lineWidth=6;ctx.strokeRect(10,10,W-20,H-20);
  ctx.fillStyle='#3a3f3c';ctx.textAlign='center';ctx.textBaseline='middle';
  line(ctx,'分電盤  DISTRIBUTION BOARD  ·  100 V',W/2,py(.272),W-80,34);
  const cell=(id,jp,en,rating)=>{const L=LAYOUT[id],cx=px(L.x),cy=py(labelY(L)),cw=LABEL_W*m,ch=LABEL_H*m;
   ctx.fillStyle='#f7f3e6';ctx.fillRect(cx-cw/2,cy-ch/2,cw,ch);ctx.strokeStyle='#7d817a';ctx.lineWidth=3;ctx.strokeRect(cx-cw/2,cy-ch/2,cw,ch);
   ctx.fillStyle='#1d2422';line(ctx,jp,cx,cy-ch*.29,cw-12,34);
   ctx.fillStyle='#38403d';line(ctx,en,cx,cy+ch*.06,cw-12,24,'600');
   ctx.fillStyle='#8a2f22';line(ctx,rating,cx,cy+ch*.33,cw-12,24);};
  const B=ONSEN_BOARD;
  cell('main',B.main.jp,B.main.en,`${B.main.amps}A`);
  cell('elcb',B.elcb.jp,'Earth leakage',`${B.elcb.milliamps}mA · ${B.elcb.amps}A`);
  for(const c of ONSEN_CIRCUITS)cell(c.id,c.jp,c.en,`${c.no} · ${c.amps}A  ${c.volts}V`);
  for(const w of ONSEN_SPARE_WAYS)cell(w.id,w.jp,w.en,String(w.way));
 });
}
function directoryTexture(){
 return paint(512,640,(ctx,W,H)=>{
  ctx.fillStyle='#f4efdf';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#5c5a50';ctx.lineWidth=6;ctx.strokeRect(8,8,W-16,H-16);
  ctx.fillStyle='#1d2422';ctx.textAlign='center';ctx.textBaseline='middle';
  line(ctx,'回路表',W/2,54,W-60,46);line(ctx,'CIRCUIT LIST · UMI-NO-YU',W/2,96,W-60,24,'600');
  ctx.textAlign='left';
  const rows=[...ONSEN_CIRCUITS.map(c=>[c.no,c.jp,c.en,`${c.amps}A`]),...ONSEN_SPARE_WAYS.map(w=>[w.way,w.jp,w.en,'—'])];
  rows.forEach(([no,jp,en,amps],i)=>{const y=DIRECTORY.y0+i*DIRECTORY.step;ctx.fillStyle='#1d2422';line(ctx,`${no}  ${jp}`,40,y,W-150,28);ctx.fillStyle='#4a504c';line(ctx,en,76,y+23,W-150,18,'600');
   ctx.textAlign='right';ctx.fillStyle='#8a2f22';line(ctx,amps,W-40,y,90,26);ctx.textAlign='left';});
  ctx.textAlign='center';ctx.fillStyle='#5c5a50';line(ctx,'点検 1997.4  ·  Inspected April 1997',W/2,H-40,W-60,22,'600');
 });
}
// The circuit list's rows (canvas pixels on a 512 x 640 card): the tape for ways 7 and 8 goes over the last two.
const DIRECTORY={y0:150,step:54,w:512,h:640};
/**
 * A strip of cream masking tape with a line written on it in black marker: each character
 * a little off the line and turned, by a fixed hash, so it reads as a hand and never changes.
 */
function tapeTexture(lines,seed,{w=512,h=176}={}){
 return paint(w,h,(ctx,W,H)=>{
  ctx.clearRect?.(0,0,W,H);
  // Torn ends: a zigzag down each short edge.
  ctx.beginPath();ctx.moveTo(14,6);for(let y=6,i=0;y<=H-6;y+=H/9,i++)ctx.lineTo(4+hash(i,seed)*16,y);ctx.lineTo(14,H-6);
  ctx.lineTo(W-14,H-6);for(let y=H-6,i=0;y>=6;y-=H/9,i++)ctx.lineTo(W-4-hash(i,seed+7)*16,y);ctx.lineTo(W-14,6);ctx.closePath();
  ctx.fillStyle='#ead9a4';ctx.fill();ctx.save();ctx.clip?.();
  ctx.fillStyle='rgba(150,120,60,.08)';for(let i=0;i<220;i++)ctx.fillRect(hash(i,seed+3)*W,hash(i,seed+4)*H,2+hash(i,seed+5)*10,1);
  ctx.restore();
  ctx.fillStyle='#1b1a18';ctx.textBaseline='middle';
  lines.forEach(([text,size,y],li)=>{
   ctx.font=`bold ${size}px "Hiragino Maru Gothic ProN","M PLUS Rounded 1c","Yu Gothic","Noto Sans CJK JP",sans-serif`;
   const chars=[...text],widths=chars.map(c=>ctx.measureText(c).width*1.04),total=widths.reduce((a,b)=>a+b,0),scale=Math.min(1,(W-60)/total);
   let x=W/2-total*scale/2;
   chars.forEach((c,i)=>{const k=hash(i+li*40,seed+11);ctx.save();ctx.translate(x+widths[i]*scale/2,H*y+(k-.5)*size*.12);ctx.rotate((hash(i+li*40,seed+13)-.5)*.14);ctx.scale(scale,scale);ctx.textAlign='center';ctx.fillText(c,0,0);ctx.restore();x+=widths[i]*scale;});
  });
 });
}
function sticker(text,sub,{w=256,h=96,bg='#f6f4ee',fg='#1d2422'}={}){
 return paint(w,h,(ctx,W,H)=>{ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);ctx.strokeStyle='#8a8f88';ctx.lineWidth=4;ctx.strokeRect(3,3,W-6,H-6);
  ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';line(ctx,text,W/2,sub?H*.38:H/2,W-20,sub?46:56);if(sub){ctx.fillStyle='#5a605c';line(ctx,sub,W/2,H*.76,W-20,22,'600');}});
}

/**
 * Builds the board, the lamp fixtures, the dryers and their sockets, and wires the room
 * to the circuit state. `lamps` are onsen.js's point lights; each fixture claims the one
 * that hangs at it.
 */
export function buildOnsenElectrics({room,rect,anchor,action,lamps=[],sun=null,sunAtNoon=1.6,hall={front:1.6,changing:-1.2}}){
 const group=new THREE.Group();group.name='Umi-no-yu electrics';room.add(group);
 const steel=new THREE.MeshStandardMaterial({color:0x9aa09c,roughness:.45,metalness:.55});
 const darkPlastic=new THREE.MeshStandardMaterial({color:0x2f3331,roughness:.55});
 const whitePlastic=new THREE.MeshStandardMaterial({color:0xeeece4,roughness:.45});
 const greyPlastic=new THREE.MeshStandardMaterial({color:0xc9cbc4,roughness:.5});
 const cordMat=new THREE.MeshStandardMaterial({color:0x2a2a2a,roughness:.7});
 const add=(geometry,material,x,y,z,name,parent=group)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.name=name;m.castShadow=m.receiveShadow=true;m.userData.staticProp=true;parent.add(m);return m;};

 // ---- The board: a grey steel box with the door swung right open.
 const B=ONSEN_BOARD,board=new THREE.Group();board.name='Breaker board';board.position.set(B.x,B.y,B.wallZ);board.rotation.y=Math.PI;group.add(board);
 add(new THREE.BoxGeometry(B.w,B.h,.01),steel,0,0,.005,'Breaker board back',board);
 for(const s of [-1,1]){add(new THREE.BoxGeometry(.012,B.h,B.d),steel,s*(B.w/2-.006),0,B.d/2,'Breaker board side',board);add(new THREE.BoxGeometry(B.w,.012,B.d),steel,0,s*(B.h/2-.006),B.d/2,'Breaker board side',board);}
 const plateTex=plateTexture(),plateMat=printed(plateTex,0xd6d8d2,{polygonOffset:false});
 const plate=add(new THREE.BoxGeometry(PLATE.w,PLATE.h,.006),[steel,steel,steel,steel,plateMat,steel],0,0,.09,'Breaker board plate',board);
 const face=.093,levers=new Map(),fitted=new Map();// fitted: the spare ways' new breakers, shown only once fitted
 const newWhite=new THREE.MeshStandardMaterial({color:0xf8f8f3,roughness:.4});// a new breaker is whiter than ones that have hung there since 1987
 for(const id of ALL_SWITCHES){
  const L=LAYOUT[id],big=id==='main'||id==='elcb',w=L.w||.05,h=L.h||.09,depth=big?.03:.025,isNew=FIX_IDS.includes(id);
  const holder=isNew?new THREE.Group():board;if(isNew){holder.name='New breaker '+id;board.add(holder);fitted.set(id,holder);}
  add(new THREE.BoxGeometry(w,h,depth),isNew?newWhite:big&&id==='elcb'?greyPlastic:whitePlastic,L.x,L.y,face+depth/2,'Breaker '+id,holder);
  const pivot=new THREE.Group();pivot.position.set(L.x,L.y,face+depth+.007);pivot.name='Breaker lever '+id;pivot.userData.breaker=id;holder.add(pivot);
  const lever=new THREE.Mesh(new THREE.BoxGeometry(L.lever||.016,.034,.014).translate(0,.017,0),id==='main'?darkPlastic:new THREE.MeshStandardMaterial({color:id==='elcb'?0x2f3331:0x3a3f3c,roughness:.5}));
  lever.name='Breaker lever';lever.castShadow=true;pivot.add(lever);levers.set(id,pivot);
  if(id==='elcb')add(new THREE.CylinderGeometry(.009,.009,.008,12).rotateX(Math.PI/2),new THREE.MeshStandardMaterial({color:0xe2b93b,roughness:.5}),L.x+.034,L.y-.03,face+depth+.004,'Earth-leakage test button',board);
 }
 // The spare ways as built: a white blanking cover in each opening, flush with the plate.
 const covers=new Map(),coverMat=new THREE.MeshStandardMaterial({color:0xe4e2da,roughness:.55});
 for(const w of ONSEN_SPARE_WAYS){const L=LAYOUT[w.id];const c=add(new THREE.BoxGeometry(.05,.09,.004),coverMat,L.x,L.y,face+.002,w.cover,board);c.castShadow=false;covers.set(w.id,c);}
 // After the fix: the new ways labelled by hand on masking tape, stuck over the printed 予備.
 const tapes=[];
 for(const f of ONSEN_FIX.circuits){const L=LAYOUT[f.id],seed=f.no*31;
  const t=add(new THREE.PlaneGeometry(LABEL_W*.98,LABEL_H*.92),new THREE.MeshStandardMaterial(Object.assign({roughness:.85,alphaTest:.5},(()=>{const tex=tapeTexture([[`${f.no}  ${f.tape.jp}`,58,.4],[`${f.tape.en} · ${f.amps}A`,34,.76]],seed);return tex?{map:tex}:{color:0xead9a4};})())),
   L.x,labelY(L)+.001,face+.0012,'Tape label '+f.id,board);
  t.rotation.z=(hash(f.no,5)-.5)*.06;t.castShadow=false;t.userData.tape=f.id;tapes.push(t);}
 // The door, hinged on its left, swung back so its circuit list faces the room.
 const hinge=new THREE.Group();hinge.position.set(-B.w/2,0,B.d);hinge.rotation.y=-B.doorOpen*Math.PI/180;hinge.name='Breaker board door';board.add(hinge);
 add(new THREE.BoxGeometry(B.w,B.h,.012),steel,B.w/2,0,-.006,'Breaker board door panel',hinge);
 const card=add(new THREE.PlaneGeometry(.36,.45),printed(directoryTexture(),0xf4efdf),B.w/2,.02,-.0125,'Circuit list',hinge);card.rotation.y=Math.PI;card.castShadow=false;
 // ...and the same two ways written in on the circuit list, on one strip over its last two rows.
 {const D=DIRECTORY,rowY=py=>.45*(.5-py/D.h),y=(rowY(D.y0+6*D.step)+rowY(D.y0+7*D.step+23))/2,h=Math.abs(rowY(D.y0+6*D.step-24)-rowY(D.y0+7*D.step+40));
  const t=add(new THREE.PlaneGeometry(.33,h),new THREE.MeshStandardMaterial(Object.assign({roughness:.85,alphaTest:.5},(()=>{const tex=tapeTexture(ONSEN_FIX.circuits.map((f,i)=>[`${f.no}  ${f.tape.jp}  ${f.amps}A`,44,.3+i*.42]),97,{w:512,h:220});return tex?{map:tex}:{color:0xead9a4};})())),
   0,y,.0009,'Tape label circuit list',card);t.rotation.z=.012;t.castShadow=false;tapes.push(t);}
 // It hangs on the wall: no floor footprint, but you cannot walk through the open door.
 rect(B.x+.2,B.wallZ-.12,1.05,.24,B.y+B.h/2);
 const toWorld=(x,y,z)=>{board.updateMatrix();return new THREE.Vector3(x,y,z).applyMatrix4(board.matrix);};

 // ---- Lamp fixtures, each over the point light onsen.js already hangs there.
 const glow=new Map();// mesh name -> [{material,on}]
 const lightByName=new Map();
 const near=(at)=>lamps.find(l=>l.position.distanceTo(new THREE.Vector3(...at))<.4);
 for(const c of ONSEN_CIRCUITS)for(const l of c.loads){
  if(!l.fixture)continue;const f=l.fixture,[x,y,z]=f.at,name=l.meshes[0];
  const lit=new THREE.MeshStandardMaterial({color:0xf3eee2,emissive:0xfff0d2,emissiveIntensity:1.1,roughness:.6});
  if(f.kind==='pendant'){
   add(new THREE.CylinderGeometry(.004,.004,.1,6),cordMat,x,y-.05,z,'Pendant cord');
   add(new THREE.CylinderGeometry(.06,.17,.12,24,1,true),new THREE.MeshStandardMaterial({color:0xf2ede0,roughness:.7,side:THREE.DoubleSide}),x,y-.16,z,'Pendant shade');
   add(new THREE.SphereGeometry(.045,16,10),lit,x,y-.17,z,name);
  }else{
   const r=f.kind==='sealed'?.16:.2;
   add(new THREE.CylinderGeometry(r,r,.03,28),f.kind==='sealed'?steel:whitePlastic,x,y-.015,z,name+' base');
   add(new THREE.CylinderGeometry(r-.03,r-.02,.045,28),lit,x,y-.0525,z,name);
  }
  const light=near(f.light);if(light){light.name=l.lights[0];lightByName.set(l.lights[0],{light,on:light.intensity});}
 }
 // ---- The dryers: three different makes at the three mirrors, each on its own socket.
 const vanity={top:.81,wall:-1.14,mirrors:[-3.9,-2.95,-2]};
 const socket=(x,y,z,ry,name)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;g.name=name;group.add(g);
  add(new THREE.BoxGeometry(.07,.11,.012),whitePlastic,0,0,.006,name+' plate',g);
  add(new THREE.BoxGeometry(.035,.04,.022),greyPlastic,0,0,.023,name+' plug',g);return g;};
 // A cord through its points with the corners rounded by quadratic curves, which never
 // leave the hull of their points: it cannot dip through the floor or the counter.
 const cord=(points,name)=>{const v=points.map(p=>new THREE.Vector3(...p)),mid=(a,b)=>a.clone().add(b).multiplyScalar(.5),path=new THREE.CurvePath();
  path.add(new THREE.LineCurve3(v[0],mid(v[0],v[1])));
  for(let i=1;i<v.length-1;i++)path.add(new THREE.QuadraticBezierCurve3(mid(v[i-1],v[i]),v[i],mid(v[i],v[i+1])));
  path.add(new THREE.LineCurve3(mid(v.at(-2),v.at(-1)),v.at(-1)));
  const tube=new THREE.Mesh(new THREE.TubeGeometry(path,48,.004,6),cordMat);tube.name=name;tube.castShadow=true;group.add(tube);return tube;};
 const DRYERS=[{color:0xe9e3d3,len:.17,nozzle:.055},{color:0x8fbcd4,len:.18,nozzle:.075},{color:0xe39a8c,len:.16,nozzle:.05}];
 const rating=sticker('1200W  100V','HAIR DRYER');
 // What a running dryer shows: its pilot lamp lit, a faint hum on the counter, and air
 // out of the nozzle (three soft streaks that slide out and fade, the way a comic draws a
 // draught). Off, the lamp is dark red glass and nothing moves.
 const airMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false});
 const dryers=[];
 DRYERS.forEach((d,i)=>{
  const id='dryer-'+(i+1),mx=vanity.mirrors[i],x=mx+.12,z=-.86,sx=mx-.25,body=new THREE.MeshStandardMaterial({color:d.color,roughness:.35});
  const g=new THREE.Group();g.position.set(x,vanity.top,z);g.name='Hair dryer '+(i+1);group.add(g);
  const m=add(new THREE.CylinderGeometry(.045,.045,d.len,20).rotateZ(Math.PI/2),body,0,.045,0,'Hair dryer '+(i+1),g);
  add(new THREE.CylinderGeometry(.04,.04,.004,20).rotateZ(Math.PI/2),darkPlastic,-d.len/2-.002,.045,0,'Hair dryer grille',g);
  add(new THREE.CylinderGeometry(.026,.036,d.nozzle,16).rotateZ(Math.PI/2),body,d.len/2+d.nozzle/2,.045,0,'Hair dryer nozzle',g);
  add(new THREE.BoxGeometry(.034,.03,.13),body,-.01,.015,-.09,'Hair dryer handle',g);
  const s=add(new THREE.PlaneGeometry(.075,.028),printed(rating,0xf6f4ee),-.005,.045,.0462,'Hair dryer rating sticker',g);s.castShadow=false;
  // The pilot lamp: a small lens set into the housing on the side you face, by the grille end.
  const lens=add(new THREE.SphereGeometry(.0075,12,8),new THREE.MeshStandardMaterial({color:0x6a2018,emissive:0xff5a2a,emissiveIntensity:1.8,roughness:.3}),-d.len/2+.022,.063,.039,'Hair dryer '+(i+1)+' pilot',g);lens.castShadow=false;
  const air=new THREE.Group();air.name='Hair dryer '+(i+1)+' air';air.position.set(d.len/2+d.nozzle,.045,0);air.visible=false;g.add(air);
  const streaks=[[0,.012,0],[1,-.01,.012],[2,-.004,-.014]].map(([k,y,zz])=>{const st=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.05,6).rotateZ(Math.PI/2),airMat.clone());st.name='Hair dryer air streak';st.position.set(.03,y,zz);st.userData.k=k;st.castShadow=false;air.add(st);return st;});
  m.userData.load=id;
  dryers.push({id,group:g,air,streaks,spin:0,phase:hash(i+1,17)*Math.PI*2,hz:8+hash(i+1,19)*3});
  socket(sx,.88,vanity.wall,0,'Vanity socket '+(i+1));
  const hx=x-.01;
  // Each cord is named for its dryer, so a film can hide one dryer and its cord and keep the others.
  cord([[hx,.825,-1.016],[hx,.815,-1.04],[(hx+sx)/2,.814,-1.07],[sx,.815,-1.095],[sx,.83,-1.112],[sx,.862,-1.117]],'Hair dryer '+(i+1)+' cord');
 });
 // ---- The massage chair's 2003 spur (ONSEN_RACEWAY): white raceway round the changing
 // room and over the noren, through the wall, down to a surface socket box by the chair.
 const RW=ONSEN_RACEWAY,rwMat=new THREE.MeshStandardMaterial({color:RW.colour,roughness:.32});
 const raceway=new THREE.Group();raceway.name=RW.name;raceway.userData.raceway=RW.id;group.add(raceway);
 const AX={x:0,y:1,z:2},axisOf=f=>f[1],signOf=f=>f[0]==='+'?1:-1;
 const boxFrom=(min,max,name)=>{const size=[0,1,2].map(i=>max[i]-min[i]),c=[0,1,2].map(i=>(min[i]+max[i])/2);const b=add(new THREE.BoxGeometry(...size),rwMat,...c,name,raceway);b.castShadow=false;return b;};
 // One straight run between two centre-line points, its back on the wall face.
 const extent=(p,q,face)=>{const n=AX[axisOf(face)],sg=signOf(face),min=[0,0,0],max=[0,0,0];
  for(let i=0;i<3;i++){const lo=Math.min(p[i],q[i]),hi=Math.max(p[i],q[i]);
   if(i===n){min[i]=Math.min(p[i],p[i]+sg*RW.d);max[i]=Math.max(p[i],p[i]+sg*RW.d);}else if(hi-lo>1e-6){min[i]=lo;max[i]=hi;}else{min[i]=p[i]-RW.w/2;max[i]=p[i]+RW.w/2;}}
  return {min,max,face,wall:p[n],n};};
 const runs=[];
 for(const r of RW.runs){const segs=[];for(let i=0;i<r.path.length-1;i++){const e=extent(r.path[i],r.path[i+1],r.face);segs.push(e);boxFrom(e.min,e.max,'Raceway run');}runs.push({...r,segs});}
 // Moulded fittings over every joint: a little bigger than the duct, never behind a wall.
 const fitting=(parts,walls,name)=>{const P=.0025,min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(const e of parts)for(let i=0;i<3;i++){min[i]=Math.min(min[i],e.min[i]);max[i]=Math.max(max[i],e.max[i]);}
  for(let i=0;i<3;i++){min[i]-=P;max[i]+=P;}
  for(const w of walls){if(w.sign>0)min[w.n]=Math.max(min[w.n],w.at);else max[w.n]=Math.min(max[w.n],w.at);}
  return boxFrom(min,max,name);};
 const endOf=(e,atEnd,len=.02)=>{const min=[...e.min],max=[...e.max];for(let i=0;i<3;i++){if(i===e.n||max[i]-min[i]<=RW.w+1e-6)continue;if(atEnd===(e.dir[i]>0))min[i]=max[i]-len;else max[i]=min[i]+len;}return {min,max};};
 const wallOf=e=>({n:e.n,at:e.wall,sign:signOf(e.face)});
 runs.forEach(r=>r.segs.forEach((e,i)=>{const p=r.path[i],q=r.path[i+1];e.dir=[0,1,2].map(k=>Math.sign(q[k]-p[k]));}));
 runs.forEach((r,ri)=>{
  r.segs.forEach((e,i)=>{if(i>0)fitting([endOf(r.segs[i-1],true),endOf(e,false)],[wallOf(e)],'Raceway elbow');});
  const next=runs[ri+1];
  if(next&&!r.end){const a=r.segs.at(-1),b=next.segs[0];fitting([endOf(a,true),endOf(b,false)],[wallOf(a),wallOf(b)],'Raceway corner');}
  if(r.end==='wall')fitting([endOf(r.segs.at(-1),true)],[wallOf(r.segs.at(-1))],'Raceway end cap');
  if(r.start==='wall')fitting([endOf(r.segs[0],false)],[wallOf(r.segs[0])],'Raceway end cap');
 });
 // The surface socket box at the raceway's end, above the wainscot rail, facing the chair.
 {const X=RW.box,g=new THREE.Group();g.position.set(...X.at);g.rotation.y=-Math.PI/2;g.name='Massage chair socket';group.add(g);
  add(new THREE.BoxGeometry(X.w,X.h,X.d),rwMat,0,0,X.d/2,'Massage chair socket box',g);
  add(new THREE.BoxGeometry(.05,.07,.004),whitePlastic,0,-.01,X.d+.002,'Massage chair socket plate',g);
  add(new THREE.BoxGeometry(.035,.04,.022),greyPlastic,0,-.01,X.d+.004+.011,'Massage chair socket plug',g);}
 // The plug hangs its cord down the wall, in front of the wainscot rail, and across the floor to the chair.
 cord([[4.6,.012,3.146],[4.72,.004,3.02],[4.84,.004,2.93],[4.872,.03,2.905],[4.877,.3,2.9],[4.879,.9,2.9],[4.882,1.03,2.9],[4.884,1.075,2.9]],'Massage chair cord');
 const chairPlate=add(new THREE.PlaneGeometry(.11,.05),printed(sticker('200W  100V','MASSAGE CHAIR'),0xf6f4ee),MASSAGE_CHAIR.front-.003,.3,3.75,'Massage chair rating plate');chairPlate.rotation.y=-Math.PI/2;chairPlate.castShadow=false;
 // The coin timer on the front of the chair's right arm: ¥100 for ten minutes, and the red
 // 運転中 lamp that says it is running.
 const timer=new THREE.Group();timer.name='Massage chair coin timer';timer.position.set(MASSAGE_CHAIR.front+.035,.6,3.17);group.add(timer);
 add(new THREE.BoxGeometry(.03,.1,.08),new THREE.MeshStandardMaterial({color:0xd9d3c4,roughness:.5}),0,0,0,'Massage chair coin box',timer);
 const chairLamp=add(new THREE.SphereGeometry(.009,12,8),new THREE.MeshStandardMaterial({color:0x6a2018,emissive:0xff4a2a,emissiveIntensity:2,roughness:.3}),-.015,.028,0,'Massage chair lamp',timer);chairLamp.castShadow=false;
 const coin=add(new THREE.PlaneGeometry(.066,.036),printed(sticker('100円 10分','¥100 · 10 MIN'),0xf6f4ee),-.0155,-.016,0,'Massage chair timer label',timer);coin.rotation.y=-Math.PI/2;coin.castShadow=false;
 // The kneading rollers behind the backrest's cover: two soft lumps that knead and travel
 // up and down the back while it runs, and stop where they are when the power goes.
 // Measured in the room's own frame from the backrest onsen.js built (its parent is the room).
 const back=room.getObjectByName('Massage chair back'),backBox=back?.geometry?.parameters?new THREE.Box3().setFromCenterAndSize(back.position.clone(),new THREE.Vector3(back.geometry.parameters.width,back.geometry.parameters.height,back.geometry.parameters.depth)):null;
 const rollers=new THREE.Group();rollers.name='Massage chair rollers';group.add(rollers);
 const lumps=backBox?[-1,1].map(sd=>{const l=add(new THREE.SphereGeometry(.05,16,10),back.material,backBox.min.x,0,0,'Massage chair roller',rollers);l.scale.set(.28,1,.8);l.userData.side=sd;l.castShadow=false;return l;}):[];
 const chair={time:0,id:'massage-chair'};
 const placeRollers=()=>{if(!backBox)return;const t=chair.time,cz=(backBox.min.z+backBox.max.z)/2,y=.86+.24*Math.sin(t*2*Math.PI/9);
  for(const l of lumps){const k=Math.sin(t*2*Math.PI*.7+(l.userData.side>0?Math.PI:0));l.position.set(backBox.min.x,y+.015*k,cz+l.userData.side*(.095+.012*k));l.scale.x=.24+.06*(k+1)/2;}};
 placeRollers();
 // The fan's socket, back to back with the television's on the lobby side of the wall.
 socket(3.62,.3,B.wallZ,Math.PI,'Fan socket');
 cord([[3.85,.004,1.222],[3.8,.004,1.33],[3.66,.004,1.47],[3.625,.03,1.505],[3.62,.15,1.515],[3.62,.28,1.517]],'Fan cord');

 // ---- What each circuit switches. Found once, by name, among what the room built.
 for(const c of ONSEN_CIRCUITS)for(const l of c.loads)for(const name of l.meshes||[]){
  if(glow.has(name))continue;const list=[];
  room.traverse(o=>{if(o.isMesh&&o.name===name&&o.material?.emissive)list.push({material:o.material,on:o.material.emissiveIntensity});});
  if(list.some(e=>e.on>0))glow.set(name,list.filter(e=>e.on>0));
 }
 const screens=new Map(),hidden=new Map();
 for(const c of ONSEN_CIRCUITS)for(const l of c.loads){
  for(const name of l.screens||[]){const tv=room.getObjectByName(name);const glass=tv?.children.find(o=>o.isMesh&&o.geometry?.type==='PlaneGeometry');if(glass)screens.set(name,glass);}
  for(const name of l.hides||[]){const o=room.getObjectByName(name);if(o)hidden.set(name,o);}
 }
 // The hemisphere is the light the lamps bounce round the house (and, by day, what comes
 // in through the shoji and the glass). A room is lit mostly by its own lamps, so the fill
 // follows the share of lamp watts still lit, counted mostly in the room you are looking
 // from: a dark changing room looks dark from inside it, while the lobby stays bright.
 // The weight eases over SPILL metres either side of a doorway, so walking through it
 // never pops.
 let hemi=null;room.traverse(o=>{if(o.isHemisphereLight&&!hemi)hemi=o;});
 const zones={lobby:[hall.front,Infinity],changing:[hall.changing,hall.front],bath:[-Infinity,hall.changing]};
 const zoneOf=z=>Object.keys(zones).find(k=>z>=zones[k][0]&&z<zones[k][1]);
 const SPILL=.6,AWAY=.15;
 const hemiOn=hemi?.intensity??0,lampLoads=ONSEN_CIRCUITS.flatMap(c=>c.loads.filter(l=>l.fixture).map(l=>({id:l.id,c:c.id,w:l.watts,zone:zones[zoneOf(l.fixture.at[2])]})));
 // A lamp switched off at its own switch leaves the house its usual floor of fill (the
 // other rooms' lamps through the doorways, the street through the glass). A lamp whose
 // breaker is off, or the main, takes that with it: with the whole house isolated, only the
 // daylight (or the dusk) through the shoji and the door glass is left, dark enough that a
 // torch would read. Set from the breaker listeners, so it changes in the same frame as the
 // levers, and comes back exactly when the power does.
 const FLOOR={off:.3,dead:.03,day:.5};
 let day=0,viewZ=null,townFill=1;
 const fill=()=>{if(!hemi)return;let lit=0,dead=0,all=0;
  for(const l of lampLoads){const d=viewZ===null?0:Math.max(l.zone[0]-viewZ,viewZ-l.zone[1],0),k=AWAY+(1-AWAY)*Math.max(0,1-d/SPILL),w=l.w*k;all+=w;if(!isLive(l.c))dead+=w;else if(running.has(l.id))lit+=w;}
  const off=all-lit-dead,dark=FLOOR.dead+FLOOR.day*day;
  hemi.intensity=hemiOn*(lit+off*(FLOOR.off+FLOOR.day*day)+dead*dark)/all;
  // The town's own indoor fill (sky, bounce, sun: game.js) stands for the same house light, so a
  // dead house lets in only the daylight's share of it too; with the lamps on it is untouched.
  townFill=(lit+off+dead*dark)/all;
  // The room's own sun (onsen.js) is the daylight in the house as well as on the rock bath: the same share of it.
  if(sun)sun.intensity=sunAtNoon*day*townFill;};
 // Where the picture is taken from: the plate is always drawn, so it hears every frame's camera.
 plate.frustumCulled=false;
 plate.onBeforeRender=(renderer,scene,camera)=>{if(!camera.isPerspectiveCamera)return;const p=new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);const z=room.worldToLocal(p).z;if(viewZ===null||Math.abs(z-viewZ)>.005){viewZ=z;fill();}};
 const LEVER={on:.6,off:Math.PI-.6};
 const resetAnchors=new Map();
 function apply(){
  for(const [id,pivot] of levers)pivot.rotation.x=on.get(id)?LEVER.on:LEVER.off;
  for(const [id,g] of fitted)g.visible=isFitted(id);
  for(const [id,c] of covers)c.visible=!isFitted(id);
  for(const t of tapes)t.visible=taped&&wiring==='rewired';
  for(const l of ALL_LOADS){const live=running.has(l.id)&&isPowered(l.id);
   for(const name of l.meshes||[])for(const e of glow.get(name)||[])e.material.emissiveIntensity=live?e.on:0;
   for(const name of l.lights||[]){const e=lightByName.get(name);if(e)e.light.intensity=live?e.on:0;}
   for(const name of l.screens||[]){const s=screens.get(name);if(s)s.visible=live;}
   for(const name of l.hides||[]){const o=hidden.get(name);if(o)o.visible=live;}
  }
  for(const [id,o] of resetAnchors)o.visible=isFitted(id)&&!on.get(id);
  fill();
 }

 // ---- Interactions.
 const lower=s=>s.charAt(0).toLowerCase()+s.slice(1);
 const nameOf=id=>id==='main'?'main breaker':id==='elcb'?'earth-leakage breaker':lower((byId(id)||ONSEN_WIRING.rewired.find(c=>c.id===id)).en);
 const front=toWorld(0,0,B.d+.25);
 anchor([front.x,front.y,front.z],'Look at the breaker board',()=>{
  const down=switchesNow().filter(id=>!on.get(id)).map(id=>'the '+nameOf(id));
  const list=circuitsNow().map(c=>`${c.no}, ${lower(c.en)}`).join('; ');
  const ways=wiring==='rewired'
   ?`Below, eight ${ONSEN_CIRCUITS[0].amps} A breakers, one for each circuit: ${list}. The last two are new and whiter than the rest, in the ways that were spare, labelled by hand on masking tape. `
   :`Below, six ${ONSEN_CIRCUITS[0].amps} A breakers, one for each circuit: ${list}; and two spare ways (予備) at the end of the lower row, blank behind white covers. `;
  action('inspect','Breaker board · Distribution board',
   'Grandmother Higa’s breaker board, grey steel, the door left open in the evening so the levers can be read from the vanity. It hangs at shoulder height, so anyone can reach the main lever without a stool. Lever up is on. '+
   `At the top, the ${B.main.amps} A main breaker: the whole bath can draw ${B.main.amps*ONSEN_VOLTS} watts at ${ONSEN_VOLTS} volts before it goes. Beside it the earth-leakage breaker, which switches everything off in a blink if ${B.elcb.milliamps} thousandths of an amp leak away to earth, through wet tiles or through a person. In a building full of water it is the most important switch here. `+
   ways+
   `A breaker protects the cable, not the hair dryer. The cable in the wall is good for ${ONSEN_CIRCUITS[0].amps} A, so the breaker opens at ${ONSEN_CIRCUITS[0].amps} A. Fit a bigger one and the cable becomes the fuse, warming up inside the wall where nobody can see it. So when the sockets trip you never fit a bigger breaker: you spread the load out.`+
   (down.length?` Right now ${down.join(' and ')} ${down.length>1?'are':'is'} down.`:''));
 });
 for(const id of ALL_SWITCHES){
  const L=LAYOUT[id],p=toWorld(L.x,L.y,face+.05),name=nameOf(id);
  const o=anchor([p.x,p.y,p.z],'Reset the '+name,()=>{
   if(!isFitted(id)||!reset(id))return;
   const c=byId(id),again=c&&overloaded(id);
   action('inspect','Breaker · Reset',c
    ?`You push the ${name} lever all the way down until it clicks, then up to on. `+(again?`Everything on it at once draws ${wattsOf(id)} watts: ${loadOf(id)} amps on a ${c.amps} amp breaker. Use the dryers one or two at a time, or it will go again.`:'The power comes back.')
    :`You push the ${name} lever down until it clicks, then up to on. The whole board comes back.`);
  });
  o.visible=isFitted(id)&&!on.get(id);resetAnchors.set(id,o);
 }
 anchor([vanity.mirrors[1]+.12,1.05,-.8],'Use a hair dryer',()=>action('inspect','Hair dryer · 1200 W',isPowered('dryer-2')
  ?(circuitOf('dryer-2')==='changing-sockets'
   ?'Warm air and a noise like a small aeroplane. The sticker on the side says 1200 W, 100 V: twelve amps on its own. One dryer is fine on a 20 A circuit; three at once, with the massage chair going in the lobby, is thirty-eight.'
   :'Warm air and a noise like a small aeroplane. 1200 W, 100 V: twelve amps, on a 20 A circuit of its own now, number 7 on the tape. Whatever the other mirrors do, this one holds.')
  :`Nothing. The socket under the mirror is dead: the ${nameOf(circuitOf('dryer-2'))} breaker has tripped. The board is on the wall by the lockers.`));

 listeners.add(apply);apply();
 // ---- What the running loads show, frame by frame. Dryers spin up and down over a
 // fraction of a second (so the air fades rather than vanishing); the chair's rollers
 // move only while it has power and stop where they are. Phases come from a hash of the
 // load, never a dice roll, so the same moment always looks the same.
 let clock=0,chairMoving=false;
 const animate=dt=>{
  clock+=dt;
  for(const D of dryers){const target=isWorking(D.id)?1:0,rate=target>D.spin?1/.35:1/.8;
   D.spin=target>D.spin?Math.min(target,D.spin+dt*rate):Math.max(target,D.spin-dt*rate);
   D.group.rotation.y=D.spin*.008*Math.sin(clock*2*Math.PI*D.hz+D.phase);
   D.air.visible=D.spin>.01;
   if(D.air.visible)for(const st of D.streaks){const u=(clock*1.8+st.userData.k/3+D.phase)%1;st.position.x=.02+u*.11;st.material.opacity=.7*D.spin*Math.sin(Math.PI*u);}
  }
  chairMoving=isWorking(chair.id)&&dt>0;if(chairMoving){chair.time+=dt;placeRollers();}
 };
 const appearance=loadId=>{const l=LOAD_BY_ID.get(knownLoad(loadId)),sh=l.shows||{},out={id:loadId,working:isWorking(loadId)};
  if(sh.lamp){const m=room.getObjectByName(sh.lamp);out.lamp=!!m&&m.material.emissiveIntensity>0;}
  if(sh.air){const a=room.getObjectByName(sh.air);out.air=!!a&&a.visible;}
  if(sh.motion)out.moving=chairMoving;
  return out;};
 const api={trip,reset,isLive,isOn,isFitted,loadOf,wattsOf,overloaded,resetAll,circuits:ONSEN_CIRCUITS,board:ONSEN_BOARD,
  switchOn,switchOff,isRunning,isWorking,runningLoads,assess,advance,settle,stage:stageScenario,scenarios:ONSEN_SCENARIOS,
  wiring:boardWiring,circuitOf,spareWays:ONSEN_SPARE_WAYS,fix:ONSEN_FIX,raceway:ONSEN_RACEWAY,appearance,
  tv:{pin:pinLobbyChannel,get pinned(){return lobbyChannelPin();},channels:LOBBY_CHANNELS},
  /** The share of the town's indoor fill that reaches the house now (1 with its lamps on; the daylight's share when they are dead). */
  townFill:()=>townFill};
 const audit=typeof window!=='undefined'?window.__JOHANSSON_AUDIT__:null;
 if(audit)audit.onsenPower=api;
 /** Daylight (0 night, 1 noon) from onsen.js's tick: by day the windows light a dark house. `dt` warms an overloaded breaker and moves what is running. */
 const tick=(d,dt=0)=>{advance(dt);animate(dt);if(d!==day){day=d;fill();}};
 return {...api,group,levers,tick,dispose(){listeners.delete(apply);if(audit&&audit.onsenPower===api)delete audit.onsenPower;}};
}
