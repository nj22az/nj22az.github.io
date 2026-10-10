/**
 * The Minato Maru (みなと丸), Minato-chō's town ferry to Kitano-jima: what she is, how she is
 * laid out, what drives her and what her switchboard feeds (docs/FERRY-AUDIT.md).
 *
 * A small roll-on car-and-passenger ferry (小型カーフェリー) of 1991, of the kind a Japanese island
 * town ran on a short, sheltered crossing: 22 m long, about 95 gross tons, inspected by the
 * government (JG) for smooth-water service (平水区域), with two diesels on two shafts, a bow ramp
 * and a deckhouse aft. She carries sixty passengers and three cars (or one 4-tonne truck and a
 * kei truck), which is what the island needs: the creator's "two, maybe three cars".
 *
 * Everything is data first, so the hull (ferry.js), the crew's routines (people/ferry-crew.js),
 * stories and tests read the same ship. Ship frame, metres: +z is forward (the bow ramp's
 * hinge is at +LOA/2), +x is the port side, y is up from the waterline.
 */
export const FERRY_SHIP=Object.freeze({
 name:'Minato Maru',jp:'Minato-maru',built:1991,
 owner:'Minato-chō (the town ferry, a chōei ferī)',registry:'Minato',
 inspection:'JG: smooth-water service (heisui kuiki), passenger ship certificate renewed every five years, interim survey yearly',
 type:'Roll-on car-and-passenger ferry, single-ended (bow ramp only): cars drive on forwards and reverse off, or reverse on and drive off',
 grossTons:95,
 length:22,lengthBP:19.6,beam:6.4,depth:2.48,draft:1.35,
 /** The car deck above the waterline: depth less draft. */
 freeboard:1.13,
 /** The model's origin is this far above the waterline (where the old hull sat, so the ramp meets the quay where it did). */
 origin:.12,
 passengers:60,vehicles:3,crew:4,
 speed:Object.freeze({service:10.5,trial:11.8,manoeuvring:3}),
});

/** Where things are on board, along the ship (z) and up (y). */
export const FERRY_DECKS=Object.freeze({
 /** The car deck: from the ramp hinge aft to the deckhouse front. */
 car:Object.freeze({y:FERRY_SHIP.freeboard-FERRY_SHIP.origin,fore:11,aft:-1.2,
  /** Two lanes of 2.6 m (a kei car is 1.48 m wide, a 4-tonne truck 2.2 m), each side of the centreline. */
  lanes:Object.freeze([1.4,-1.4]),laneWidth:2.6,
  /** The three car places: two in the starboard lane, one in the port lane, nose to the ramp. */
  slots:Object.freeze([Object.freeze([-1.4,7.4]),Object.freeze([-1.4,2.6]),Object.freeze([1.4,6.2])]),
  /** An open car deck: it breathes through its open top and needs no exhaust fans. */
  open:true,
  /** Walkways each side, inside the bulwark: 0.5 m clear, for the crew and the lashings. */
  walkway:.5,bulwark:1.05}),
 /** The deckhouse aft on the car deck: the passenger saloon, its toilets and vending corner, the purser's window. */
 saloon:Object.freeze({fore:-1.2,aft:-9.6,width:5.6,height:2.25}),
 /** The mooring deck at the stern, behind the saloon: the capstan and two pairs of bitts. */
 stern:Object.freeze({fore:-9.6,aft:-11}),
 /** The upper (passenger) deck on the saloon roof: open deck and benches aft, the wheelhouse forward. */
 upper:Object.freeze({y:FERRY_SHIP.freeboard-FERRY_SHIP.origin+2.35,fore:-1.2,aft:-9.6}),
 wheelhouse:Object.freeze({fore:-1.3,aft:-4.1,width:3.6,height:2.05}),
 /** Below the car deck, aft to forward (frames at 0.5 m spacing are not drawn; these are the bulkheads). */
 below:Object.freeze([
  Object.freeze({id:'steering-gear',fore:-8.6,aft:-11,what:'Steering gear room: two hydraulic rams on a common tiller, two electric pumps and the hand pump for emergency steering'}),
  Object.freeze({id:'engine-room',fore:-1.6,aft:-8.6,what:'Engine room: the two main engines and gears, the two generators, the main switchboard, pumps, purifier-less fuel system (A-type heavy oil settled in the service tank)'}),
  Object.freeze({id:'tanks',fore:1.4,aft:-1.6,what:'Fuel oil tanks port and starboard, the fresh-water tank between them'}),
  Object.freeze({id:'crew',fore:7.6,aft:1.4,what:'Crew quarters: the mess with its galley, the master’s cabin, the crew cabin (two berths), a shower and toilet, the changing room by the engine-room door'}),
  Object.freeze({id:'fore-peak',fore:11,aft:7.6,what:'Fore peak ballast tank and the chain locker under the windlass'}),
 ]),
 /** Where a passenger rides a crossing: the open upper deck aft, at the stern rail between the benches, behind the funnel. */
 passenger:Object.freeze([0,FERRY_SHIP.freeboard-FERRY_SHIP.origin+2.35,-9.05]),
});

/** What drives her. Real numbers for a ship of her size and year. */
export const FERRY_MACHINERY=Object.freeze({
 mains:Object.freeze({count:2,kind:'Four-stroke high-speed marine diesel, six in line, turbocharged',kW:257,rpm:1800,
  start:'24 V electric starter, from its own battery bank',
  driven:'Each engine drives its own sea-water pump, jacket-water pump and lubricating-oil pump: they run when the engine runs, with or without electricity',
  fuel:'A-type heavy oil (A-jūyu), about 0.22 kg per kWh'}),
 gears:Object.freeze({kind:'Reverse-reduction gearbox with hydraulic clutches',ratio:2.47}),
 propellers:Object.freeze({count:2,blades:4,diameter:1.05,pitch:'fixed',turning:'outward (starboard screw right-handed)'}),
 rudders:Object.freeze({count:2,kind:'Spade rudders behind each screw, ±35°'}),
 bowThruster:Object.freeze({kW:30,kind:'Electric tunnel thruster forward of the crew quarters; starts only with both generators on the board'}),
 steering:Object.freeze({kind:'Electro-hydraulic, two rams, two pumps (one running at sea, both in harbour)',emergency:'Hand pump in the steering-gear room, steered by the compass repeater and the bridge telephone'}),
 generators:Object.freeze({count:2,kVA:60,kW:48,volts:445,hz:60,phases:3,rpm:1800}),
 emergency:Object.freeze({volts:24,banks:Object.freeze([Object.freeze({id:'start',ah:200,feeds:'Main-engine and generator starters'}),Object.freeze({id:'emergency',ah:200,feeds:'Emergency lighting, navigation lights, VHF, the alarms and the steering-gear alarm'})])}),
 shore:Object.freeze({volts:200,phases:3,hz:60,kVA:30,how:'From the quay pillar at Minato, through a 30 kVA 200/445 V transformer aboard, interlocked with the generator breakers'}),
 tanks:Object.freeze({fuel:8,service:.5,freshWater:3,sewage:1,forePeak:4}),
});

/**
 * Her electrical system. The main switchboard is in the engine room: 445 V, three phase, 60 Hz,
 * insulated (IT: no neutral earthed), with an insulation monitor and earth lamps. Two 15 kVA
 * 445/105 V transformers (one in use, one spare) feed the 105 V lighting board; the 24 V DC board
 * is the emergency source. Non-essential loads hang off a preferential-trip relay (優先遮断), so one
 * overloaded generator drops the air conditioning and the galley before it drops the ship.
 *
 * `duty` is the share of the rated power a load draws in each condition (how often it runs, times
 * how hard), the way a load balance (電力調査表) for a ship of this size is written.
 */
export const FERRY_CONDITIONS=Object.freeze(['atSea','manoeuvring','loading','night']);
const load=(id,name,kW,volts,essential,duty,why)=>Object.freeze({id,name,kW,volts,essential,duty:Object.freeze(duty),why});
export const FERRY_LOADS=Object.freeze([
 load('steer-1','Steering pump No.1',3.7,445,true,{atSea:1,manoeuvring:1,loading:0,night:0},'One pump at sea; the rule asks for both in harbour'),
 load('steer-2','Steering pump No.2',3.7,445,true,{atSea:0,manoeuvring:1,loading:0,night:0},'The second pump, run for every arrival and departure'),
 load('thruster','Bow thruster',30,445,true,{atSea:0,manoeuvring:.8,loading:0,night:0},'Pushes the bow off and on the berth'),
 load('fire-pump','Fire and general-service pump',7.5,445,true,{atSea:0,manoeuvring:0,loading:0,night:0},'Stands by on the fire main; the deck wash on Sundays'),
 load('bilge','Bilge pump',2.2,445,true,{atSea:.1,manoeuvring:0,loading:.1,night:.1},'Pumped on the oiler’s rounds'),
 load('er-fans','Engine-room supply fans (two)',7.4,445,true,{atSea:1,manoeuvring:1,loading:.5,night:0},'The diesels breathe engine-room air'),
 load('ramp','Ramp hydraulic power pack',11,445,true,{atSea:0,manoeuvring:0,loading:.5,night:0},'Raises and lowers the bow ramp and drives its locking pins'),
 load('capstan','Stern capstan',5.5,445,true,{atSea:0,manoeuvring:.4,loading:0,night:0},'Heaves the stern lines in'),
 load('windlass','Anchor windlass',5.5,445,true,{atSea:0,manoeuvring:0,loading:0,night:0},'The anchor is for emergencies here; it is tried once a week'),
 load('fw-pump','Fresh-water hydrophore pump',1.5,445,true,{atSea:.3,manoeuvring:.3,loading:.3,night:.3},'Keeps pressure on the taps and the toilets'),
 load('sewage','Sewage pump',1.1,445,true,{atSea:.1,manoeuvring:0,loading:0,night:.1},'Empties the holding tank ashore at Minato'),
 load('air','Air compressor (whistle and service air)',2.2,445,true,{atSea:.1,manoeuvring:.2,loading:.1,night:0},'Charges the air bottle for the whistle'),
 load('nav','Wheelhouse electronics (radar, VHF, GPS, echo sounder)',.8,105,true,{atSea:1,manoeuvring:1,loading:.3,night:.1},'The radar is on whenever she moves'),
 load('charger','24 V battery charger',1.5,105,true,{atSea:.5,manoeuvring:.5,loading:.5,night:.5},'Keeps both banks full'),
 load('lighting','Lighting (105 V)',3.5,105,true,{atSea:.8,manoeuvring:.8,loading:.8,night:.5},'Saloon, car deck, engine room and the deck floods'),
 load('ac','Saloon and crew air conditioning',15,445,false,{atSea:1,manoeuvring:1,loading:1,night:0},'Okinawa in summer; first to go when a generator is overloaded'),
 load('galley','Galley range',4,445,false,{atSea:.2,manoeuvring:0,loading:.3,night:.5},'The crew cook their own lunch and supper in the mess'),
 load('heater','Water heater',3,445,false,{atSea:.3,manoeuvring:.3,loading:.3,night:.3},'The shower and the galley sink'),
 load('fridge','Galley refrigerator',.3,105,false,{atSea:1,manoeuvring:1,loading:1,night:1},'Runs all night on shore power'),
 load('rice','Rice cooker',1.3,105,false,{atSea:.2,manoeuvring:0,loading:.2,night:.2},'On before the first sailing'),
 load('vending','Vending machines (two)',.9,105,false,{atSea:1,manoeuvring:1,loading:1,night:1},'Canned coffee and tea in the saloon'),
]);

/** What the switchboard has to supply in a condition, in kW (optionally essential loads only). */
export function ferryDemand(condition,{essentialOnly=false}={}){
 if(!FERRY_CONDITIONS.includes(condition))throw new RangeError('Unknown ferry condition '+condition);
 return FERRY_LOADS.filter(l=>!essentialOnly||l.essential).reduce((sum,l)=>sum+l.kW*l.duty[condition],0);
}
/** How each condition is supplied: generators on the board, or the shore. */
export const FERRY_SUPPLY=Object.freeze({atSea:{generators:1},manoeuvring:{generators:2},loading:{generators:1},night:{shore:true}});
export function ferrySupplyKW(condition){const s=FERRY_SUPPLY[condition],M=FERRY_MACHINERY;return s.shore?M.shore.kVA*.8:s.generators*M.generators.kW;}
/** The heaviest consumer interlock: the bow thruster will not start on one generator. */
export const thrusterMayStart=generatorsOnline=>generatorsOnline>=2;
/** The preferential trip: what is left on the board when a generator is overloaded. */
export function afterPreferentialTrip(condition){return ferryDemand(condition,{essentialOnly:true});}

/** The 24 V emergency loads, in watts, and how long the emergency bank holds them. */
export const FERRY_EMERGENCY_LOADS=Object.freeze([
 Object.freeze({id:'em-lighting',name:'Emergency lighting (saloon, stairs, engine room, muster station)',W:240}),
 Object.freeze({id:'nav-lights',name:'Navigation lights (masthead, sidelights, stern light)',W:120}),
 Object.freeze({id:'vhf',name:'VHF radiotelephone (transmitting a third of the time)',W:60}),
 Object.freeze({id:'alarms',name:'General alarm, fire detection panel, steering-gear alarm',W:40}),
]);
export function emergencyHours(){
 const W=FERRY_EMERGENCY_LOADS.reduce((s,l)=>s+l.W,0),bank=FERRY_MACHINERY.emergency.banks.find(b=>b.id==='emergency');
 // A lead-acid bank gives about 70 % of its rated amp-hours at this discharge, down to 21 V.
 return bank.ah*.7/(W/FERRY_MACHINERY.emergency.volts);
}

/**
 * Lifesaving and fire appliances on board (the safety plan in the saloon shows the same).
 * Smooth-water service: rigid life floats rather than a rescue boat.
 */
export const FERRY_SAFETY=Object.freeze({
 lifeJackets:Object.freeze({adult:66,child:6,where:'Lockers under the saloon seats and on the upper deck, marked for life jackets in Japanese and English'}),
 lifeFloats:Object.freeze({count:2,persons:35,where:'On the upper deck, one each side, on float-free cradles'}),
 lifebuoys:Object.freeze({count:4,withLight:2,where:'Upper-deck rails and the stern mooring deck'}),
 extinguishers:Object.freeze({count:8,where:'Saloon, wheelhouse, galley, engine room (two), car deck (two), steering gear'}),
 fixed:'Fixed CO₂ smothering for the engine room, released from a locked cabinet by the wheelhouse door after the room is cleared',
 muster:'The saloon, by the safety plan; the master announces from the wheelhouse',
});

/**
 * What goes wrong at sea, and what the crew does (stories use these; people/ferry-crew.js says who).
 * Each step is a real action with the place on board it happens.
 */
export const FERRY_SCENARIOS=Object.freeze([
 Object.freeze({id:'blackout',title:'Blackout halfway across',cause:'The running generator’s fuel filter chokes on a bad batch of A-type heavy oil; it slows, the frequency falls and its breaker opens',
  steps:Object.freeze([
   ['master','wheelhouse','The radar and the lights go dark; the emergency lights come on from the 24 V bank. The main engines keep running: their pumps are on the engines.'],
   ['master','wheelhouse','The rudder will not answer the wheel: both steering pumps were on the dead board. Engines to slow ahead, steer with the two throttles.'],
   ['oiler','steering-gear','Runs aft to the steering-gear room and steers by the hand pump, with the bridge on the telephone.'],
   ['chief','engine-room','Starts No.2 generator by hand, closes its breaker, then puts back the loads one by one: steering first, the air conditioning last.'],
   ['chief','engine-room','Changes No.1’s fuel filter and drains the service tank’s water. The bad oil goes back to the depot.'],
  ])}),
 Object.freeze({id:'fouled-propeller',title:'A net round the port screw',cause:'A drifting fishing net wraps the port propeller off the breakwater; the port engine labours and is stopped',
  steps:Object.freeze([
   ['chief','engine-room','Feels the port shaft shudder, sees the exhaust go black and stops the port engine.'],
   ['master','wheelhouse','Brings her in on the starboard engine and the bow thruster, both generators on the board.'],
   ['deck','car-deck','Doubles the lines at the berth: on one screw she cannot hold herself alongside.'],
   ['master','quay','Telephones the harbour master for a diver; Mr Ōshiro knows the net by its floats.'],
  ])}),
 Object.freeze({id:'ramp',title:'The ramp will not come down',cause:'A hose on the ramp power pack bursts at Kitano-jima with a lorry waiting',
  steps:Object.freeze([
   ['deck','car-deck','Stops the pack, closes the isolating valves and puts sand on the oil.'],
   ['chief','car-deck','Fits the spare hose from the engine-room stores.'],
   ['deck','car-deck','Lowers the ramp on the hand pump, two hundred strokes, while the lorry driver counts.'],
  ])}),
 Object.freeze({id:'shore-power',title:'The shore power and the rice cooker',cause:'At night alongside the 30 kVA shore supply carries the ship; the water heater, the galley range and the rice cooker together trip the quay pillar',
  steps:Object.freeze([
   ['chief','engine-room','Finds the ship dark but the 24 V lights on, and the quay pillar’s breaker down.'],
   ['chief','quay','Resets the pillar and tapes a note to the rice cooker: not with the range.'],
  ])}),
]);
