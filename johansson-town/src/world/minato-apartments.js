/**
 * Johansson Heights Minato (ヨハンソンハイツ港町): the port town's apartment block, on the plot Rainflower Lane leaves.
 *
 * The creator (2026-10-13): "Remove rain flower lane, I want the citizens at the port town live in apartments for now.
 * I want a cad drawing for the apartment complex so you know what to build, it should be a realistic apartment complex
 * with plumbing and sewage and electrical wiring each apartment should be big like a hotel room for now and they should
 * look like hotel rooms with a desk". Asked after: the lane's shops go on the ground floor, everyone in Minato moves in,
 * and each flat has a small kitchenette.
 *
 * This module is the building's data: every drawing in docs/minato-apartments/ is generated from it
 * (node tools/apartment-drawings.mjs) and the game's build will read it. Distances in metres, heights above the
 * ground floor's finished floor (GL +0.10). Building frame: x east from the outer edge of the open corridor, z north
 * from the south face. World = (APARTMENTS.origin.x + x, APARTMENTS.origin.z + z).
 *
 * A 1991 reinforced-concrete "mansion" as Johansson Construction would have built it in an Okinawan port town: a
 * column-and-beam frame (seven storeys is past what bearing walls may carry), an open corridor on the west, balconies
 * to the sea on the east, water from a ground-floor tank by booster pumps, soil and waste to a combined treatment
 * tank (johkasou, 合併処理浄化槽: the town has no public sewer), and power at 6,600 volts from the town's feeder to a
 * transformer room the utility rents in the building (借室電気室), with a meter and a board for every flat.
 */

const r2=v=>Math.round(v*100)/100;
const freeze=o=>Object.freeze(o);

export const APARTMENTS=freeze({
 id:'minato-apartments',
 name:'Johansson Heights Minato',jp:'ヨハンソンハイツ港町',
 builder:'Johansson Construction (Naha works)',builderJp:'ヨハンソン建設',
 built:1991,structure:'Reinforced concrete, moment frame (columns and beams); RC slabs; party walls RC 180',
 storeys:7,
 /** The plot Rainflower Lane leaves (shopping-lane-plan.js SHOPPING_LANE): x −4.5…11.1, z 30…53.6. */
 site:freeze({minX:-4.5,maxX:11.1,minZ:30,maxZ:53.6,
  south:'the bus station plaza at the head of Main Street (bus-station.js, z up to 29)',
  west:'Aoba Garden (garden-layout.js GARDEN, x ≤ −5.4)',
  north:'the Kitahama walk (z 53.6 → 66)',
  east:'the east lawn side'}),
 origin:freeze({x:-1.4,z:31.0}),
 /** Ground floor finished floor above the town datum; the lane's sunken −0.40 is regraded to the datum. */
 groundFloor:0.1,
});

// ------------------------------------------------------------------ grid and levels
/** Grid lines: across (x) A corridor edge, B corridor wall, C balcony wall, D balcony edge; along (z) 1…7, one bay apart. */
export const BAY=3.6;
export const GRID=freeze({
 x:freeze({A:0,B:1.2,C:8.35,D:9.55}),
 z:freeze(Object.fromEntries([0,1,2,3,4,5,6].map(i=>[String(i+1),r2(i*BAY)]))),
});
export const WALLS=freeze({party:0.18,front:0.15,back:0.15,core:0.2,corridorParapet:0.12});
export const COLUMN=0.6;
/** Columns on B and C every second bay (spans of 7.2 m), and the core's corners. */
export const COLUMNS=freeze([
 ...[0,2,4,6].flatMap(i=>[[GRID.x.B,i*BAY],[GRID.x.C,i*BAY]]),
 [-2.8+COLUMN/2,7.4+COLUMN/2],[-2.8+COLUMN/2,14.8-COLUMN/2],
].map(([x,z])=>freeze({x,z})));

/** Storey heights: the shops' ground floor is taller; flats 2.9 m floor to floor. */
export const LEVELS=freeze([
 {id:'1F',floor:0,height:3.6,use:'shops, entrance, services'},
 ...[2,3,4,5,6,7].map(n=>({id:n+'F',floor:r2(3.6+(n-2)*2.9),height:2.9,use:'flats '+n+'01–'+n+'06'})),
 {id:'R',floor:r2(3.6+6*2.9),height:0,use:'roof: lift machine room, stair penthouse, aerials, lightning rod'},
].map(freeze));
export const ROOF=freeze({level:LEVELS.at(-1).floor,parapet:1.1,machineRoom:freeze({x0:-2.8,x1:0,z0:7.4,z1:10.2,height:2.8}),
 penthouse:freeze({x0:-2.8,x1:0,z0:10.2,z1:14.8,height:2.6}),lightningRod:freeze({x:-1.4,z:8.8,height:2.0}),
 drains:freeze([freeze({x:7.6,z:0.6}),freeze({x:7.6,z:21.0})]),
 note:'Asphalt membrane over 50 mm insulation, laid to falls of 1/50 to two drains; aluminium coping. A lightning rod on the machine room: the building is over 20 m (Building Standards Act art. 33).'});
/** The floor build-up in a flat: slab 200, raised floor 150 (pipes run beneath it), ceiling 2.40 under a 150 void. */
export const FLAT_SECTION=freeze({slab:0.2,raisedFloor:0.15,ceilingVoid:0.15,ceiling:2.4,genkanStep:0.15});

// ------------------------------------------------------------------ the core
export const CORE=freeze({
 x0:-2.8,x1:0,z0:7.4,z1:14.8,
 lift:freeze({x0:-2.65,x1:-0.85,z0:7.55,z1:9.3,door:0.8,car:'9 persons, 600 kg, 60 m/min, rope traction, machine room on the roof',maker:'Johansson Lifts JL-600',stops:7}),
 stair:freeze({x0:-2.65,x1:-0.15,z0:9.5,z1:14.65,flight:1.2,well:0.1,rise:0.18,tread:0.25,
  note:'Dog-leg stair, two flights of 1.20 m. Flats: 16 risers of 0.181 m, treads 0.25 m; ground floor 20 risers of 0.18 m. A building over 200 m² a floor needs stairs of 1.20 m, risers of 0.20 m and treads of 0.24 m at most and least (Building Standards Act Order art. 23).'}),
 lobbyDoor:freeze({z:9.0,note:'lift opens east onto the corridor'}),stairDoor:freeze({z:12.0,note:'fire door to the corridor, self-closing'}),
 groundExit:freeze({z:14.8,note:'the stair’s second way out, north to the walk'}),
});
/** Walking distance from the farthest flat door to the stair (limit 50 m for a fire-resisting building with flats). */
export const ESCAPE=freeze({
 limit:50,
 balconyHatches:'An escape hatch (避難ハッチ) with a folding ladder in the balcony of flats x05 on 3F–7F, staggered so no hatch is over another’s ladder; flats x06 on 2F land on the ground.',
 partitions:'Breakable balcony partitions (隔て板, calcium silicate board 6 mm) between every pair of balconies, marked 非常の際はここを破って隣戸へ避難できます.',
 dryRiser:'Connecting water pipe (連結送水管) 100A in the stair: the building has seven storeys above ground (Fire Service Act Order art. 29). Twin inlet at the ground floor’s south face, outlets on every floor from 3F.',
 alarm:'Automatic fire alarm: a heat detector in every flat and shop, smoke detectors in the stair and lift machine room; panel in the caretaker’s office (over 500 m², Fire Service Act Order art. 21).',
 extinguishers:'A 10-type ABC extinguisher in the corridor at the stair on every floor, and one in each shop.',
 lights:'Emergency lights and exit signs in the stair, corridors and entrance hall, battery-backed.',
});

// ------------------------------------------------------------------ the flat
/**
 * One flat, drawn as flat x01: `u` across the bay from the inner face of the party wall on the pipe-shaft side, `v`
 * east from the inner face of the corridor wall. Clear 3.42 × 7.00 m (23.9 m²) and a 1.13 m balcony. Odd flats have
 * the pipe shaft on their north wall, even ones (mirrored) on their south wall, so two flats share each shaft.
 */
export const FLAT=freeze({
 width:r2(BAY-WALLS.party),depth:7.0,balcony:r2(GRID.x.D-GRID.x.C-WALLS.back/2),
 /** The pipe shaft (PS/MB): half of a 1.0 m shaft on the party wall, its door on the corridor. */
 shaft:freeze({u0:0,u1:0.41,v0:0,v1:0.5,label:'PS / MB',holds:'water riser 40A and the flat’s meter 20, soil stack 100A, vent, the flat’s electricity meter'}),
 door:freeze({u0:1.75,u1:2.6,label:'Steel entrance door 850, opens out, door scope, chain, dial lock'}),
 genkan:freeze({u0:1.55,u1:3.42,v0:0,v1:1.1,label:'Genkan (玄関): tiled at slab level, step up 150 to the raised floor'}),
 fixtures:freeze([
  {id:'unit-bath',u0:0,u1:1.45,v0:0.55,v1:2.4,label:'Unit bath 1418 (WC, basin, bath with shower)',wet:true},
  {id:'washer',u0:0,u1:0.7,v0:2.45,v1:3.1,label:'Washing machine pan 640, with tap',wet:true},
  {id:'water-heater',u0:0,u1:0.7,v0:3.1,v1:3.75,label:'Water heater cupboard: 150 L electric storage, 2.0 kW, night rate'},
  {id:'shoe-cabinet',u0:3.0,u1:3.42,v0:0.25,v1:1.1,label:'Shoe cabinet'},
  {id:'kitchenette',u0:2.82,u1:3.42,v0:1.2,v1:3.0,label:'Kitchenette 1800: under-counter fridge, sink, 2-ring IH hob, hood, wall cupboard',wet:true},
  {id:'wardrobe',u0:2.82,u1:3.42,v0:3.05,v1:3.75,label:'Wardrobe 700'},
 ].map(freeze)),
 /** The room: like a hotel room, with its desk. Type A has a double bed, type B two singles. */
 furniture:freeze({
  A:freeze([
   {id:'bed',u0:0,u1:1.95,v0:4.1,v1:5.5,label:'Double bed 1400 × 1950, headboard on the wall'},
   {id:'bedside',u0:0,u1:0.45,v0:5.55,v1:6.0,label:'Bedside table and lamp'},
   {id:'desk',u0:2.92,u1:3.42,v0:3.9,v1:5.1,label:'Desk 1200 × 500 with chair, desk lamp and mirror'},
   {id:'desk-chair',u0:2.35,u1:2.85,v0:4.25,v1:4.75,label:'Desk chair'},
   {id:'tv-console',u0:2.97,u1:3.42,v0:5.25,v1:6.35,label:'Low console: TV, luggage rack, minibar shelf'},
   {id:'armchair',u0:2.35,u1:3.1,v0:6.4,v1:6.95,label:'Armchair by the window'},
   {id:'side-table',u0:1.7,u1:2.25,v0:6.42,v1:6.95,label:'Round side table'},
  ].map(freeze)),
  B:freeze([
   {id:'bed-1',u0:0,u1:1.95,v0:3.85,v1:4.75,label:'Single bed 900 × 1950'},
   {id:'bedside',u0:0,u1:0.45,v0:4.8,v1:5.2,label:'Shared bedside table and lamp'},
   {id:'bed-2',u0:0,u1:1.95,v0:5.25,v1:6.15,label:'Single bed 900 × 1950'},
   {id:'desk',u0:2.92,u1:3.42,v0:3.9,v1:5.1,label:'Desk 1200 × 500 with chair, desk lamp and mirror'},
   {id:'desk-chair',u0:2.35,u1:2.85,v0:4.25,v1:4.75,label:'Desk chair'},
   {id:'tv-console',u0:2.97,u1:3.42,v0:5.25,v1:6.35,label:'Low console: TV, luggage rack, minibar shelf'},
   {id:'armchair',u0:2.35,u1:3.1,v0:6.4,v1:6.95,label:'Armchair by the window'},
  ].map(freeze)),
 }),
 window:freeze({u0:0.45,u1:2.95,label:'Aluminium sliding window to the balcony, 2.5 × 2.0 m, with net curtain and blackout curtain'}),
 balconyItems:freeze([
  {id:'ac-outdoor',u0:0.15,u1:0.95,v0:7.2,v1:7.5,label:'Air conditioner outdoor unit'},
  {id:'drain',u0:3.1,u1:3.3,v0:7.9,v1:8.1,label:'Balcony drain 75A to the rainwater pipe'},
 ].map(freeze)),
 connectingDoor:freeze({v0:6.17,v1:6.97,label:'Connecting door 800 in the shaft-side party wall by the window, clear of the beds (a pair of flats for a family of three): opening cut in the RC wall at build, a fire-rated leaf each side'}),
});
/**
 * The flat's pipes, in flat coordinates, run under the 150 mm raised floor (never under the genkan, which is at slab
 * level): cold from the shaft's meter, hot from the heater cupboard, and the waste falling 1/50 back to the stack.
 */
export const FLAT_PIPES=freeze({
 cold:freeze({size:'20A → 13A',runs:freeze([
  [[0.2,0.25],[0.2,0.6]],                         // meter → unit bath (WC cistern, basin, bath mixer)
  [[0.2,0.6],[0.85,0.6],[0.85,2.45],[0.35,2.45]], // → washing machine tap
  [[0.85,2.45],[0.85,3.3],[0.5,3.3]],             // → water heater inlet
  [[0.85,2.45],[2.7,2.45],[2.7,2.1],[3.0,2.1]],   // → kitchenette sink
 ].map(freeze))}),
 hot:freeze({size:'15A',runs:freeze([
  [[0.5,3.45],[1.0,3.45],[1.0,1.4],[0.9,1.4]],    // heater → unit bath mixer
  [[1.0,2.55],[2.75,2.55],[2.75,2.2],[3.0,2.2]],  // → kitchenette sink mixer
 ].map(freeze))}),
 waste:freeze({size:'50A / 40A, 1/50; WC 75A',runs:freeze([
  [[0.7,1.5],[0.3,1.5],[0.3,0.3]],                // unit bath (WC 75A, bath and basin 50A) → stack
  [[0.35,2.8],[0.1,2.8],[0.1,1.6]],               // washer pan 50A → into the bath's run
  [[3.1,2.0],[3.1,2.65],[0.6,2.65],[0.6,1.8]],    // kitchenette sink 40A → the bath's run
 ].map(freeze))}),
 relief:'The heater’s relief valve to the washing machine pan’s trap through an air break.',
});
/** The flat's electrical points (flat coordinates; h is the height above the raised floor). */
export const FLAT_ELECTRIC=freeze([
 {kind:'board',u:3.21,v:0.7,h:1.9,label:'Flat board (limiter, ELCB, 7 + 1 circuits)'},
 {kind:'intercom',u:1.5,v:1.25,h:1.4,label:'Intercom handset (autolock)'},
 {kind:'switch',u:1.55,v:1.2,h:1.2,label:'Switches: genkan, hall, room'},
 {kind:'light',u:2.3,v:0.55,circuit:1,label:'Genkan downlight'},
 {kind:'light',u:1.8,v:2.0,circuit:1,label:'Hall downlight'},
 {kind:'light',u:1.7,v:5.2,circuit:1,label:'Room ceiling light'},
 {kind:'light',u:3.1,v:2.1,circuit:1,label:'Kitchenette light under the cupboard'},
 {kind:'light',u:1.7,v:7.6,circuit:1,label:'Balcony light'},
 {kind:'light',u:0.7,v:1.5,circuit:6,label:'Unit bath light and fan'},
 {kind:'socket',u:3.42,v:4.5,circuit:2,label:'Desk: double socket, phone and data'},
 {kind:'socket',u:0,v:5.75,circuit:2,label:'Bedside double socket'},
 {kind:'socket',u:3.42,v:5.8,circuit:2,label:'TV: double socket and aerial outlet'},
 {kind:'socket',u:3.42,v:1.4,circuit:3,label:'Fridge socket'},
 {kind:'socket',u:3.42,v:2.4,circuit:3,label:'Counter double socket'},
 {kind:'outlet',u:3.42,v:2.75,circuit:4,label:'IH hob 200 V outlet'},
 {kind:'outlet',u:0,v:6.4,h:2.1,circuit:5,label:'Air conditioner outlet, high'},
 {kind:'socket',u:0.7,v:2.95,h:1.1,circuit:7,label:'Washing machine socket (earthed)'},
 {kind:'socket',u:1.45,v:1.0,circuit:6,label:'WC seat socket in the unit bath (earthed)'},
 {kind:'outlet',u:0.7,v:3.45,circuit:'night',label:'Water heater 200 V (night rate)'},
 {kind:'detector',u:1.7,v:4.3,label:'Heat detector'},
].map(freeze));
/** The walk from the farthest flat door along the corridor to the stair door (Building Standards Act Order art. 120: 50 m). */
export const ESCAPE_DISTANCE=(()=>{const doors=[1,2,3,4,5,6].map(bay=>{const r=flatRect({bay},{u0:FLAT.door.u0,u1:FLAT.door.u1,v0:0,v1:0});return (r.z0+r.z1)/2;});
 return r2(Math.max(...doors.map(z=>Math.abs(z-CORE.stairDoor.z)))+GRID.x.B/2);})();
export const FLAT_AREA=freeze({inside:r2(FLAT.width*FLAT.depth),balcony:r2(FLAT.width*FLAT.balcony)});

/** A flat's rectangle {u0,u1,v0,v1} in building coordinates {x0,x1,z0,z1}. */
export function flatRect(flat,r){
 const x0=GRID.x.B+WALLS.front/2+r.v0,x1=GRID.x.B+WALLS.front/2+r.v1;
 const zBay=(flat.bay-1)*BAY,north=flat.bay%2===1; // odd flats have their shaft on the north wall
 if(north){const zw=zBay+BAY-WALLS.party/2;return {x0,x1,z0:r2(zw-r.u1),z1:r2(zw-r.u0)};}
 const zw=zBay+WALLS.party/2;return {x0,x1,z0:r2(zw+r.u0),z1:r2(zw+r.u1)};
}

// ------------------------------------------------------------------ who lives where
/**
 * Every household of Minato (people/island-households.js), and the barfly, in their flats. Not moved: Kitano-jima
 * (Johansson; Grandmother Chinen), the Fumoto farmers (they live at their fields) and the Minato Maru’s chief engineer
 * (he lives aboard). Thuan keeps a weekday room as she had at 1 Kitahama. The oldest and the families with small
 * children are low down, near the ground; the two families of three have a connecting pair. Flat 706 is to let.
 */
const H=(flat,from,members,type='A',pair=null)=>freeze({flat,from,members:freeze(members),type,pair});
export const ALLOCATION=freeze([
 H('201','miyagi',['Mrs Miyagi','Miyagi Daiki'],'B'),
 H('202','kitahama-9',['Grandmother Gushiken']),
 H('203','kitahama-6',['Grandfather Taira','Grandmother Taira']),
 H('204','nakasone',['Mr Nakasone','Nakasone Taku'],'B'),
 H('205','kamiya',['Mrs Kamiya']),
 H('206','kitahama-10',['Mr Tamashiro','Mrs Tamashiro']),
 H('301','higa',['Grandmother Higa'],'A','302'),
 H('302','higa',['Mrs Higa','Higa Kenta'],'B','301'),
 H('303','kinjo',['Uncle Kinjō'],'A','304'),
 H('304','kinjo',['Mrs Kinjō','Kinjo Yui'],'B','303'),
 H('305','kitahama-12',['Mrs Kohagura']),
 H('306','kitahama-2',['Mrs Sato']),
 H('401','kitahama-1',['Thuan']),
 H('402','kitahama-1',['Thao','Chin']),
 H('403','market',['Grandmother Sakurai']),
 H('404','oshiro',['Mr Ōshiro','Oshiro Sakura'],'B'),
 H('405','tamaki',['Mr Tamaki','Tamaki Miyu'],'B'),
 H('406','nakamura',['Mrs Nakamura','Nakamura Mai'],'B'),
 H('501','arakaki',['Mr Arakaki','Arakaki Ryo'],'B'),
 H('502','yonamine',['Mrs Yonamine','Yonamine-sensei'],'B'),
 H('503','shimabukuro',['Mr Shimabukuro']),
 H('504','resident-home-aya',['Nhung','Reiko'],'B'),
 H('505','resident-home-kenji',['Tetsuo']),
 H('506','kitahama-7',['Mr Chinen','Mrs Chinen']),
 H('601','kitahama-3',['Kōji']),
 H('602','kitahama-4',['Postman Tōma']),
 H('603','kitahama-8',['Ms Uezu']),
 H('604','kitahama-11',['Mr Iha']),
 H('605','kitahama-flats',['Ms Ganaha']),
 H('606','kitahama-flats',['Mr Higa Jr']),
 H('701','kitahama-flats',['Mr Fujita']),
 H('702','office',['Harbour master']),
 H('703','koban',['Officer Mori']),
 H('704','clinic',['Dr Kakazu']),
 H('705','izakaya',['Barfly']),
 H('706',null,[]),
]);
/** Homes in Minato that empty when everyone has moved in (their buildings are for the build batch to decide). */
export const LEFT_HOMES=freeze(['miyagi','kitahama-9','kitahama-6','nakasone','kamiya','kitahama-10','higa','kinjo','kitahama-12','kitahama-2','kitahama-1','market','oshiro','tamaki','nakamura','arakaki','yonamine','shimabukuro','resident-home-aya','resident-home-kenji','kitahama-7','kitahama-3','kitahama-4','kitahama-8','kitahama-11','kitahama-flats','office','koban','clinic','izakaya']);

/** The 36 flats: number, floor, bay, type and household. */
export const FLATS=freeze(LEVELS.slice(1,7).flatMap((level,i)=>[1,2,3,4,5,6].map(bay=>{
 const number=(i+2)+'0'+bay,household=ALLOCATION.find(a=>a.flat===number)||null;
 return freeze({number,level:level.id,floor:level.floor,bay,type:household?.type||'A',household,toLet:!household?.members.length,
  shaftWall:bay%2===1?'north':'south',hatch:bay===5&&i>0,connectsTo:household?.pair||null});
})));
export const RESIDENTS=freeze(FLATS.flatMap(f=>f.household?.members.map(name=>freeze({name,flat:f.number}))||[]));

// ------------------------------------------------------------------ the ground floor
/** Rooms on 1F (x0…x1, z0…z1 in the building frame). The walkway under the corridor is open south of the hall. */
export const GROUND=freeze([
 {id:'blue-coral',name:'Blue Coral Ice Cream',jp:'ブルーコーラル',x0:1.2,x1:8.35,z0:0,z1:3.6,use:'shop: ice cream; freezer counter, two chest freezers, a sink with a grease trap',door:'south and west'},
 {id:'rainflower-florist',name:'Rainflower Florist',jp:'レインフラワー花店',x0:1.2,x1:8.35,z0:3.6,z1:7.2,use:'shop: flowers, and the town’s supplier of decorations; a flower cooler, a sink, display on the walkway',door:'west'},
 {id:'entrance-hall',name:'Entrance hall',jp:'エントランス',x0:0,x1:4.8,z0:7.2,z1:11.1,use:'autolock door and intercom panel, 38 mailboxes, delivery lockers, notice board',door:'south (from the walkway)'},
 {id:'inner-lobby',name:'Lift lobby',jp:'エレベーターホール',x0:0,x1:1.2,z0:11.1,z1:14.8,use:'lift and stair, inside the autolock',door:'—'},
 {id:'office',name:'Caretaker’s office',jp:'管理人室',x0:4.8,x1:8.35,z0:7.2,z1:11.1,use:'window to the hall; fire alarm panel, intercom master, lift monitor; caretaker 9:00–17:00',door:'hall'},
 {id:'lv-room',name:'Electrical room',jp:'電気室',x0:1.2,x1:4.6,z0:11.1,z1:14.4,use:'the building’s low-voltage boards; no water pipe passes through it (stack SS2 drops in a chase on the hall’s side of its wall)',door:'lift lobby'},
 {id:'transformer-room',name:'Utility transformer room',jp:'借室電気室',x0:4.6,x1:8.35,z0:11.1,z1:14.4,use:'the utility’s 6,600 V switchgear and transformers, let to it; its own door from outside, open to the utility at all hours',door:'east (from outside)'},
 {id:'pump-room',name:'Pump room',jp:'ポンプ室',x0:1.2,x1:8.35,z0:14.4,z1:18.0,use:'receiving tank, booster pump set, water meter; floor drain and the tank overflow to the storm drain through an air break',door:'east'},
 {id:'bike-store',name:'Bicycle store',jp:'駐輪場',x0:1.2,x1:4.6,z0:18.0,z1:21.6,use:'racks for 24 bicycles',door:'north'},
 {id:'refuse',name:'Refuse store',jp:'ゴミ置場',x0:4.6,x1:8.35,z0:18.0,z1:21.6,use:'burnable, non-burnable, cans and bottles; a tap and a floor drain',door:'north and east'},
].map(freeze));
export const WALKWAY=freeze({x0:0,x1:1.2,z0:0,z1:7.2,label:'Covered walkway under the 2F corridor (pilotis), open to the street'});

// ------------------------------------------------------------------ water
/**
 * Cold water: the town's main under the plaza → meter 50 → receiving tank → booster set (two pumps, duty and standby,
 * alternating, each able to carry the peak) → one riser in each of the three pipe shafts → a 20 mm meter and stop
 * valve for each flat. The flats heat their own water. Sizing after SHASE-S 206: a day's use, the peak hour and the
 * instantaneous peak.
 */
const PEOPLE=RESIDENTS.length;
const DAILY=r2(PEOPLE*0.25+2*0.5); // m³/day: 250 L a person, 500 L a shop
export const WATER=freeze({
 people:PEOPLE,perPerson:250,shops:2,perShop:500,daily:DAILY,
 hours:10,peakHourFactor:2,instantFactor:4,
 peakHour:r2(DAILY/10*2),                  // m³/h
 instantPeak:Math.round(DAILY/10*4/60*1000), // L/min
 receivingTank:freeze({x0:2.0,x1:5.0,z0:15.2,z1:17.2,height:1.5,plinth:0.6,effective:r2(3.0*2.0*1.2),nominal:r2(3.0*2.0*1.5),
  material:'FRP panel tank, two compartments so one can be cleaned while the other serves',
  clearance:'0.6 m round the sides and under, 1.0 m over (inspection on all six faces)'}),
 booster:freeze({x0:5.6,x1:7.6,z0:15.2,z1:16.6,pumps:2,duty:'duty and standby, alternating each start; either carries the peak',
  maker:'Johansson Pumps JBP-2',motor:1.5,discharge:0.35,pressureTank:'diaphragm tank 20 L'}),
 risers:freeze([3.6,10.8,18.0].map((z,i)=>freeze({id:'WR'+(i+1),z,size:'40A',serves:12}))),
 main:'50A',flatBranch:'20A',meter:'20 mm',pipe:'PVC-lined steel (SGP-VA) in the risers, PE-coated copper in the flats under the raised floor',
});
/** Pressures at the highest and lowest outlets, from the pump's set pressure (MPa; 1 m of water = 0.0098 MPa). */
const TOP_OUTLET=r2(LEVELS[6].floor+FLAT_SECTION.raisedFloor+2.0),LOW_OUTLET=r2(LEVELS[1].floor+FLAT_SECTION.raisedFloor+0.6);
export const WATER_PRESSURE=freeze({
 topOutlet:TOP_OUTLET,lowOutlet:LOW_OUTLET,friction:0.05,minimum:0.07,maximum:0.40,
 top:r2(WATER.booster.discharge-TOP_OUTLET*0.0098-0.05),
 low:r2(WATER.booster.discharge-LOW_OUTLET*0.0098),
 pumpPower:r2(1000*9.81*(WATER.instantPeak/60000)*(WATER.booster.discharge/0.0098)/0.55/1000),
});

// ------------------------------------------------------------------ drainage
/**
 * Soil and waste together (合流式) down the three stacks, each with its own vent carried up through the roof. At the
 * ground floor each stack turns under the slab into the building drain, which runs east and south to the treatment
 * tank in the east yard. Rain is separate: the roof and the balconies go to the street's storm drain. The shops'
 * sinks join the building drain at the ground floor, Blue Coral's through a grease trap.
 */
const DFU=freeze({'WC':4,'basin':1,'bath':2,'kitchen sink':2,'washing machine':3});
const FLAT_DFU=Object.values(DFU).reduce((a,b)=>a+b,0);
export const DRAINAGE=freeze({
 fixtureUnits:DFU,perFlat:FLAT_DFU,
 stacks:freeze([3.6,10.8,18.0].map((z,i)=>freeze({id:'SS'+(i+1),z,x:GRID.x.B+0.25,size:'100A',vent:'100A, through the roof',flats:12,units:12*FLAT_DFU,limit:500}))),
 buildingDrain:freeze({size:'125A',fall:'1/100',material:'PVC (VU) in the ground, cleaning eyes at every bend'}),
 shops:'Each shop’s sink 50A to the building drain at 1F; Blue Coral’s through a 20 L grease trap under its counter.',
 johkasou:freeze({kind:'combined treatment tank (合併処理浄化槽), contact aeration, FRP, buried',
  x0:10.0,x1:12.0,z0:2.0,z1:9.0,depth:2.6,blower:'twin blowers in a box beside it, on the building’s supply',
  outfall:'treated water to the storm drain under the plaza (BOD 20 mg/L or less)'}),
 rain:freeze({roof:'two 100A rainwater pipes at the north and south ends',balconies:'75A rainwater pipe at every second party wall, collecting the balcony drains',outfall:'the street storm drain'}),
});
/** JIS A 3302: flats n = 0.05 × floor area; shops n = 0.075 × floor area (persons served). */
const FLAT_FLOOR_AREA=r2(6*((GRID.x.D-GRID.x.A)*6*BAY+(CORE.x1-CORE.x0)*(CORE.z1-CORE.z0)));
const SHOP_AREA=r2(2*(GROUND[0].x1-GROUND[0].x0)*BAY);
export const JOHKASOU_SIZE=freeze({flatArea:FLAT_FLOOR_AREA,shopArea:SHOP_AREA,
 persons:Math.ceil(0.05*FLAT_FLOOR_AREA+0.075*SHOP_AREA),chosen:Math.ceil((0.05*FLAT_FLOOR_AREA+0.075*SHOP_AREA)/5)*5});

// ------------------------------------------------------------------ electricity
/**
 * 6,600 V from the town's feeder pole at the plaza (town-power.js: the connector pole at x 5.2, z 28) by buried
 * cable to the utility's room: two transformers, one single-phase 210/105 V for the flats and the common lighting, one
 * three-phase 210 V for the lift, the pumps and the shops' freezers. The building's boards are next door. Each flat:
 * a 30 A single-phase three-wire supply, its own meter in the shaft, and a separate night-rate meter for the water
 * heater; inside the door a board with the utility's 30 A limiter, a 30 mA earth-leakage breaker and seven circuits.
 */
export const FLAT_BOARD=freeze({
 location:'above the shoe cabinet in the genkan',supply:'1φ3W 210/105 V, 30 A (6 kVA)',main:'30 A limiter (the utility’s) + 2P 30 A ELCB 30 mA',
 circuits:freeze([
  {n:1,name:'Lighting: room, genkan, balcony',volts:105,breaker:20,cable:'VVF 1.6-2C'},
  {n:2,name:'Sockets: room and desk',volts:105,breaker:20,cable:'VVF 2.0-2C'},
  {n:3,name:'Sockets: kitchenette and fridge',volts:105,breaker:20,cable:'VVF 2.0-2C'},
  {n:4,name:'IH hob, 2 rings (2.9 kW)',volts:210,breaker:20,cable:'VVF 2.0-3C (E)'},
  {n:5,name:'Air conditioner (2.2 kW)',volts:105,breaker:20,cable:'VVF 2.0-3C (E)'},
  {n:6,name:'Unit bath: light, fan, WC seat socket',volts:105,breaker:20,cable:'VVF 2.0-3C (E)'},
  {n:7,name:'Washing machine socket (earthed)',volts:105,breaker:20,cable:'VVF 2.0-3C (E)'},
 ].map(freeze)),
 night:freeze({name:'Water heater 150 L, 2.0 kW, 23:00–07:00',volts:210,breaker:20,cable:'VVF 2.0-3C (E)',meter:'night-rate meter with time switch in the shaft'}),
});
/** The water heater: 150 L from 20 °C to 85 °C in the night's seven hours. */
export const HEATER=freeze({litres:150,from:20,to:85,kw:2.0,hours:7,
 needs:r2(150*4.186*(85-20)/3600/0.95),gives:r2(2.0*7)});
const FLAT_KVA=6,DEMAND=0.45; // demand factor for 36 dwellings (assumed: see findings)
const COMMON=freeze([
 {name:'Lift JL-600 (VVVF, 7.5 kW)',kva:10,phase:3},
 {name:'Booster pump (one running, 1.5 kW)',kva:2,phase:3},
 {name:'Blue Coral: freezers and counter',kva:8,phase:3},
 {name:'Rainflower Florist: flower cooler, lights',kva:5,phase:3},
 {name:'Common lighting, emergency lighting, signs',kva:3,phase:1},
 {name:'Fire alarm, intercom, autolock, TV amplifiers',kva:1,phase:1},
 {name:'Treatment tank blowers (2 × 0.1 kW)',kva:0.3,phase:1},
].map(freeze));
const DAY_FLATS=r2(FLATS.length*FLAT_KVA*DEMAND),NIGHT_HEAT=r2(FLATS.length*HEATER.kw);
const ONE_PHASE_COMMON=COMMON.filter(c=>c.phase===1).reduce((a,c)=>a+c.kva,0),THREE_PHASE=COMMON.filter(c=>c.phase===3).reduce((a,c)=>a+c.kva,0);
export const ELECTRICAL=freeze({
 hv:freeze({volts:6600,from:'the town feeder’s plaza pole (x 5.2, z 28)',cable:'CVT 38 mm², buried in a 100 mm duct',length:18}),
 transformers:freeze([
  freeze({id:'T1',kva:150,kind:'1φ 6,600/210-105 V',feeds:'flats, night heaters, common lighting'}),
  freeze({id:'T2',kva:50,kind:'3φ 6,600/210 V',feeds:'lift, pumps, shops'}),
 ]),
 flatKva:FLAT_KVA,demandFactor:DEMAND,common:COMMON,
 dayOnePhase:r2(DAY_FLATS+ONE_PHASE_COMMON),
 nightOnePhase:r2(NIGHT_HEAT+0.3*DAY_FLATS+ONE_PHASE_COMMON),
 threePhase:r2(THREE_PHASE),
 risers:freeze([3.6,10.8,18.0].map((z,i)=>{const kva=12*FLAT_KVA*0.6,amps=Math.round(kva*1000/210),heat=Math.round(12*HEATER.kw*1000/210);
  return freeze({id:'ER'+(i+1),z,flats:12,kva:r2(kva),amps,breaker:250,cable:'CV 150 mm² 3C',night:freeze({amps:heat,breaker:150,cable:'CV 60 mm² 3C'}),
   drop:r2(17.8*40*amps/(1000*150))});})),
 earthing:'Class A earth for the transformer room’s frames, class B for the transformers’ neutrals, class D for the flats’ sockets and the lift; lightning rod earth separate.',
});

// ------------------------------------------------------------------ what is not designed yet
/** Open points, as a yard would list them: what this issue does not settle. */
export const FINDINGS=freeze([
 {id:'AF1',open:true,text:'Town water main: assumed a 75 mm main under the plaza with 0.15 MPa or more. The town’s water today is a well rota and Mr Chinen’s water lorry; the town needs a main (or the building a larger tank filled by the lorry) before this can be built.'},
 {id:'AF2',open:true,text:'Demand factor 0.45 for 36 flats is assumed; check it against the Interior Wiring Code’s table for dwellings before the transformers are ordered.'},
 {id:'AF3',open:true,text:'Treatment tank sized by JIS A 3302 as recalled (flats 0.05 × floor area, shops 0.075 × floor area); confirm the edition’s figures and the outfall permit.'},
 {id:'AF4',open:true,text:'Structure: columns 600 × 600 and spans of 7.2 m are a first sizing; beams, slabs and the foundation (piles in reclaimed ground near the shore?) need a structural design and a soil survey.'},
 {id:'AF5',open:true,text:'Seven storeys (22 m) is twice the height of anything else in Minato: it is the town’s landmark, seen from the ferry. The creator to confirm the height; six flats a floor on this plot cannot house everyone in fewer floors.'},
 {id:'AF6',open:true,text:'The lane’s ground is sunk 0.40 m; the plot is regraded to the town datum and the building stands at GL +0.10. Aoba Garden’s residential walk crosses the plot today and must be rerouted round it.'},
 {id:'AF7',open:true,text:'Entrance doors open outward onto a 1.2 m corridor; set each in a 0.4 m alcove beside its shaft so an open leaf does not block the corridor (detail to draw).'},
 {id:'AF8',open:false,text:'Every flat stands over another (no transfer of stacks): the three stacks drop straight to 1F and turn under the slab; the electrical room has no water pipe over it.'},
].map(freeze));
