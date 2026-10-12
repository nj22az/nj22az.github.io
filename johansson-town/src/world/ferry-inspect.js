import {FERRY_SHIP,FERRY_HEIGHTS,FERRY_MACHINERY,FERRY_ELECTRICS} from './ferry-ship.js';
import {FERRY_ENGINE_ROOM} from './ferry-interior.js';
import {JOHANSSON_MARINE} from './johansson-marine.js';

/**
 * What you can look at aboard the Minato Maru, and what it tells you (ferry batch 6c): each a point in her frame
 * (ferry-model.js), the prompt, the title and the words. The numbers are her own (ferry-ship.js), so a story about
 * a blackout or a fouled screw has the same ship under it that you walked through.
 */
const HALF=FERRY_SHIP.length/2,Z=zy=>zy-HALF,Y=yk=>yk-FERRY_SHIP.draft;
const CAR=Y(FERRY_HEIGHTS.carDeck),PASS=Y(FERRY_HEIGHTS.passengerDeck),BRIDGE=Y(FERRY_HEIGHTS.bridgeDeck),FP=FERRY_ENGINE_ROOM.floor;
const M=FERRY_MACHINERY,E=FERRY_ELECTRICS;
const at=(id,pos,label,title,text)=>Object.freeze({id,pos:Object.freeze(pos),label,title,text});

export const FERRY_INSPECT=Object.freeze([
 at('bicycles',[2.1,CAR+1.0,Z(3.3)],'Look at the bicycle rack','Bicycle rack',
  'Two islanders’ bicycles, lashed in the rack: a bicycle rides free, and on Kitano-jima it is the way from the pier to the village. The baggage shelf opposite is for the shopping, and the orange lockers over it hold the lifejackets for this deck.'),
 at('fire-doors',[0,CAR+1.2,Z(12.0)],'Read the safety plan','Safety plan',
  'The lower lobby’s plan: the two sliding fire doors onto the lanes close by themselves on the alarm; the ways up are the stairs either side, the way below the engine room’s door under its red sign, and aft the crew’s door to the mooring station. Drivers wait here; nobody stays on the car deck at sea.'),
 at('crew-door',[0,BRIDGE+1.3,Z(5.7)],'Crew door: the corridor and the wheelhouse','Crew only',
  'The crew’s door from the bridge deck’s aft platform (up either ladder from the open deck). Their corridor runs forward between the cabins, the mess and the galley to the wheelhouse. The wheelhouse can also be reached from the walkways: a ladder at each walkway’s forward end climbs to the bridge wing and its door.'),
 at('main-engine',[1.55,FP+1.3,Z(10.8)],'Look at the port main engine','Main engine, port: Johansson Marine '+JOHANSSON_MARINE.catalogue.main.model,
  `A Johansson Marine ${JOHANSSON_MARINE.catalogue.main.model}, one of two: ${M.mains.cylinders} cylinders in line, ${M.mains.bore} mm bore and ${M.mains.stroke} mm stroke, ${M.mains.kW} kW (${M.mains.ps} PS) at ${M.mains.rpm} rpm, turbocharged. ${M.mains.start}. ${M.mains.driven}. It burns ${M.mains.fuel}.`),
 at('gearbox',[1.55,FP+1.1,Z(9.2)],'Look at the port gearbox','Johansson Marine '+JOHANSSON_MARINE.catalogue.gear.model+' reverse-reduction gear',
  `A Johansson Marine ${JOHANSSON_MARINE.catalogue.gear.model}: ${M.gears.kind}. ${M.gears.ratio} : 1, so the screw turns at ${M.propellers.rpm} rpm. ${M.propellers.why}. The shaft runs aft through the bulkhead to a ${Math.round(M.propellers.diameter*100)/100} m, ${M.propellers.blades}-bladed ${M.propellers.material.toLowerCase()} screw.`),
 at('generator',[-1.4,FP+1.2,Z(12.6)],'Look at No.2 generator','Generator No.2: Johansson Marine '+JOHANSSON_MARINE.catalogue.genset.model,
  `A Johansson Marine ${JOHANSSON_MARINE.catalogue.genset.model} set: ${E.generators.kVA} kVA (${E.generators.kW} kW at ${E.generators.pf} power factor), ${E.generators.volts} V three-phase ${E.hz} Hz at ${E.generators.rpm} rpm, ${E.generators.amps} A. Its breaker trips on ${E.generators.trips}. One carries her at sea; both are on the board in narrow water, because the ${M.bowThruster.kW} kW bow thruster ${M.bowThruster.interlock.toLowerCase()}.`),
 at('switchboard',[-3.0,FP+1.3,Z(8.95)],'Read the main switchboard','Main switchboard',
  `${E.boards.MSB}. The system is ${E.distribution}. Lighting is ${E.lighting} V through ${E.transformers.lighting.count} × ${E.transformers.lighting.kVA} kVA transformers. ${E.preferenceTrip.why}.`),
 at('booth-desk',[-3.2,FP+1.0,Z(10.1)],'Read the engine-room log','Engine-room log',
  `Each watch the chief writes the hours, the temperatures and pressures off the engines’ gauge boards, the fuel used (${M.fuelPerCrossing} L a crossing, ${M.fuelPerDay} L a day) and the tanks’ soundings. The telephone on the wall rings straight through to the wheelhouse.`),
 at('pumps',[-3.4,FP+.9,Z(11.8)],'Look at the pumps','Pumps',
  `Two ${M.fireMain.pumpKW} kW fire and general-service pumps (${M.fireMain.pumpM3h} m³/h at ${M.fireMain.pressure} MPa), the ${M.bilge.pumpKW} kW bilge pump (${M.bilge.pumpM3h} m³/h), the sanitary pump and the hydrophore set (${M.freshWater.hydrophoreKW} kW, a ${M.freshWater.pressureTank} L pressure tank). ${M.bilge.why}.`),
 at('air',[2.5,FP+1.0,Z(9.2)],'Look at the starting-air bottles','Starting air',
  `The compressor fills two 150 L bottles to ${M.mains.start.match(/[\d.]+ MPa/)?.[0]||'3 MPa'}, air for the main engines’ and the generators’ starters; the compressor runs again when the pressure falls.`),
 at('service-tank',[-3.1,FP+1.2,Z(13.3)],'Look at the fuel service tank','Fuel service tank',
  `A day’s fuel, settled and purified, for the engines and generators: A-heavy oil from the double-bottom tanks (${M.tanks.fuelStorage.join(' + ')} m³). The quick-closing valve under it can be shut from the CO₂ room if there is a fire down here.`),
 at('purifier',[3.3,FP+1.0,Z(12.0)],'Look at the fuel purifier','Fuel purifier',
  `A centrifuge that spins the water and sludge out of the fuel on its way to the service tank. The sludge goes to its ${M.tanks.sludge} m³ tank and ashore.`),
 at('emergency-generator',[1.9,BRIDGE+1.1,Z(7.6)],'Look at the emergency generator','Emergency generator',
  `${E.emergency.kVA} kVA, on its own board. If the main board goes dead it starts by itself and is on load within ${E.emergency.onLoadWithin} s, for steering pump No.2, the emergency lighting, the radios and the emergency fire pump. ${E.emergency.why}. Its day tank holds ${E.emergency.dayTank} L, ${E.emergency.hours} hours.`),
 at('co2',[-2.0,BRIDGE+1.1,Z(8.3)],'Look at the CO₂ bottles','Fixed CO₂',
  `${M.co2.bottles} bottles of ${M.co2.kg} kg for the engine room: ${M.co2.why}. The release cabinet opens only with its key, and the alarm sounds below first so everyone gets out.`),
 at('wheel',[0,BRIDGE+1.2,Z(21.7)],'Take the wheel','Steering stand',
  `The wheel, the non-follow-up lever and the autopilot. Each rudder (${M.rudders.area} m²) turns ${M.rudders.angle}° either way: ${M.steering.hardOver}. Of her two steering pumps, ${M.steering.emergency.replace(/^No\.2/,'No.2')}.`),
 at('radar',[-.9,BRIDGE+1.3,Z(22.6)],'Look at the radar','Radar and console',
  `The radar under its hood, the engine levers and the thruster lever at the centre (the same on both wing consoles, where the master berths her), the VHF, the echo sounder and the GPS. No electronic chart: the paper chart is on the table aft.`),
 at('chart',[-2.3,BRIDGE+1.1,Z(19.9)],'Look at the chart table','Chart table',
  `The chart of the strait between Minato and Kitano-jima, the course pencilled in, the tide table and the log book. The fire-detection panel (${M.fireDetection.heads} heads in ${M.fireDetection.zones} zones) is on the bulkhead beside it.`),
 at('purser',[-2.5,PASS+1.3,Z(9.0)],'Look in at the purser’s window','Purser’s window',
  'Ticket rack, cash box, the punch, the microphone for the announcements, the first-aid kit and lost property. The return fare is ¥400.'),
 at('mess',[1.85,BRIDGE+1.1,Z(15.6)],'Look at the mess table','Mess room',
  'A table for six. The duty board says who is on watch and who has the galley; the muster list says where everyone goes if the alarm rings.'),
 at('galley',[-2.0,BRIDGE+1.1,Z(14.6)],'Look at the galley','Galley',
  'A three-plate range under its hood, the rice cooker, the fridge-freezer, the sink and the provision locker. The kiosk’s hot water comes from here too.'),
]);

/**
 * The way below (the creator, 2026-10-12: "I want to be able to go down in the engine room"): at the casing door a
 * prompt takes you down the ladder to the floor plates, and at its foot one brings you back up to the car deck. The
 * ladder can still be walked. `to` is where you stand after, in her frame, `yaw` the way you face (π looks forward).
 */
export const FERRY_LADDER=Object.freeze({
 down:Object.freeze({at:Object.freeze([2.7,CAR+1.3,Z(6.85)]),label:'Go down to the engine room',to:Object.freeze([3.575,FP,Z(8.9)]),yaw:Math.PI,
  note:'Down the ladder to the floor plates. Ear defenders on: two diesels run here.'}),
 up:Object.freeze({at:Object.freeze([3.575,FP+1.2,Z(9.1)]),label:'Climb up to the car deck',to:Object.freeze([2.9,CAR,Z(6.8)]),yaw:Math.PI/2,
  note:'Up the ladder and out through the casing door. Ear defenders off.'}),
});
