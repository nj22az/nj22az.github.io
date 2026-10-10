/**
 * The Minato Maru's crew (src/world/ferry-ship.js; docs/FERRY-AUDIT.md §6): who they are, why
 * each of them has the job, and what each one does at every part of a call. The ship's safe
 * manning for a 95-ton smooth-water ferry is four: a master and a chief engineer with their
 * licences (海技士), an oiler and a deck hand. Three of the four are islanders already in the
 * town; the chief engineer is new, and lives aboard.
 *
 * Stories and the game ask the same questions of this file: who is on duty today (crewOnDuty),
 * what someone is doing during a phase (crewDoing), and who does a scenario's job (crewFor).
 */

/** The posts, in the order of the ship's articles. `station` is where each post's work is. */
export const FERRY_CREW=Object.freeze([
 Object.freeze({post:'master',title:'Master',jp:'senchō',name:'Bus driver',known:'the bus driver',
  licence:'Fifth-grade deck officer (go-kyū kaigishi, navigation), enough for a ship of her size in smooth water',
  why:'He drove the Harbour Line bus for twelve years, until the line became the ferry. He sat his deck licence on the cargo boats out of Naha, came home as her mate and has been her master since 1994. The town still calls him the bus driver, and he still keeps the Harbour Line’s timetable.',
  lives:'His flat in town; he is aboard by 07:15 and ashore after the last call'}),
 Object.freeze({post:'chief',title:'Chief engineer',jp:'kikanchō',name:'Mr Nakandakari',new:true,age:61,
  licence:'Fifth-grade engineer officer (go-kyū kaigishi, engine)',
  why:'Twenty years in the engine rooms of the island cargo boats out of Naha. Mr Shimabukuro at the power house sailed with him and sent for him when the ferry’s old chief retired: two diesels on the island, he said, deserve two people who can hear them.',
  lives:'Aboard, in the chief engineer’s cabin forward of the engine room; he goes to Naha one weekend a month to see his daughter',
  trait:'Unhurried, exact, cooks the Friday curry'}),
 Object.freeze({post:'oiler',title:'Oiler',jp:'kikan’in',name:'Mr Higa Jr',
  why:'The Nishi-machi Higas’ eldest. He served his time at Mr Ōshiro’s boatyard on sabani and outboards, and went to the ferry for the diesels. His grandfather drove the harbour bus for thirty years; his grandmother knows the ferry by its whistle and says so when he is late.',
  lives:'Kitahama Heights, flat 2'}),
 Object.freeze({post:'deck',title:'Deck hand and bosun',jp:'kōhan’in',name:'Ms Uezu',
  why:'The one deck hand: lines, the ramp, the cars and their lashings, the gangway and the tickets aboard. Ferry work runs in her family; she does a week on and a week off, and on her week on she lives aboard.',
  lives:'8 Kitahama; aboard, in the crew cabin, on her week on'}),
]);
/** On Ms Uezu's week off, Kōji from the fish auction takes the deck. */
export const FERRY_RELIEF=Object.freeze({deck:Object.freeze({name:'Kōji',why:'He crews on the Ōshiro boat and knows lines and weather; on Ms Uezu’s week off he is the ferry’s relief deck hand, and the auction sorts itself without him, slowly.'})});

/** The people ashore who belong to every call. */
export const FERRY_SHORE=Object.freeze([
 Object.freeze({post:'tickets',title:'Ticket clerk',name:'Ms Ganaha',where:'The ticket window in the Port Building’s waiting hall',does:'Sells the tickets, answers the telephone, writes the passenger count on the slip the deck hand collects'}),
 Object.freeze({post:'linesman',title:'Linesman at Minato',name:'Mr Fujita',where:'The quay by the bow bollards',does:'Takes the bow line ashore and puts its eye over the bollard, and casts it off again; for a can of coffee from the master and the news'}),
 Object.freeze({post:'port',title:'Harbour master',name:'Harbour master',where:'The Harbour Office',does:'Gives the berth, keeps the port radio, and signs the passenger list'}),
]);

/**
 * What each post does in each phase of a call (the phases of ferry.js, plus the night).
 * where: a place on board (ferry-ship.js FERRY_DECKS) or ashore.
 */
export const FERRY_WATCH=Object.freeze({
 arriving:Object.freeze({
  master:['port-wing','Brings her alongside from the port wing, where he can see the pier, on the wing throttles and the thruster'],
  chief:['engine-room','At the engine-room controls, both generators on the board for the thruster'],
  oiler:['stern','Aft at the capstan with the stern lines'],
  deck:['bow','Forward with the bow line ready for Mr Fujita, then lowers the ramp on the hydraulic pack'],
  linesman:['quay','Takes the bow line and drops its eye over the bollard'],
 }),
 waiting:Object.freeze({
  master:['wheelhouse','Writes the log and the passenger count, and watches the cars from the wheelhouse window'],
  chief:['engine-room','Engines idling, one generator stopped; checks the bilges and the oil'],
  oiler:['gangway','At the gangway: tickets and a hand for anyone with bags'],
  deck:['car-deck','Waves the cars aboard, backing them in, and lashes them at the wheels'],
  tickets:['waiting-hall','Sells the last tickets and telephones the count to the wheelhouse'],
 }),
 reversing:Object.freeze({
  master:['port-wing','Astern on both engines, the thruster holding the bow off the quay'],
  chief:['engine-room','Watches the loads on the board: the thruster is the biggest thing she has'],
  oiler:['stern','Heaves the stern line in on the capstan'],
  deck:['bow','Ramp up and pinned, then the bow line in when Mr Fujita casts it off'],
  linesman:['quay','Casts off the bow line'],
 }),
 swinging:Object.freeze({
  master:['wheelhouse','Swings her on the thruster and the screws, back in the wheelhouse'],
  chief:['engine-room','Second generator off once the thruster is stopped'],
  oiler:['stern','Coils the stern lines down and closes the fairleads'],
  deck:['car-deck','Checks every lashing before she meets the swell'],
 }),
 leaving:Object.freeze({
  master:['wheelhouse','At the wheel, then the autopilot outside the breakwater; radar on, VHF on channel 16'],
  chief:['engine-room','Brings both engines to full away and writes the readings'],
  oiler:['steering-gear','Rounds: steering gear, shafts and stern tubes, the bilges'],
  deck:['saloon','In the saloon with the passengers: the safety notice, life jackets, and the window seats'],
 }),
 crossing:Object.freeze({
  master:['wheelhouse','On the bridge: radar, the chart, the fishing boats'],
  chief:['engine-room','The engine-room watch: temperatures, pressures, the generator’s load'],
  oiler:['engine-room','Rounds every quarter hour; sounds the tanks'],
  deck:['car-deck','Walks the car deck and the open deck, then the bow ready for the berth'],
 }),
 night:Object.freeze({
  chief:['mess','Aboard on shore power; cooks, reads, walks round the engine room before bed'],
  deck:['cabin','Aboard on her week on: the crew cabin'],
 }),
});

const DAY=1440;
/** Which week of the rota a town minute falls in (0 = Ms Uezu's week on). */
export const rotaWeek=minutes=>Math.floor(Math.floor(minutes/DAY)/7)%2;
/** Who works the deck that week. */
export const deckHandFor=minutes=>rotaWeek(minutes)===0?'Ms Uezu':FERRY_RELIEF.deck.name;
/** The person in a post on the day of `minutes` (the shore posts too). */
export function crewFor(post,minutes=0){
 if(post==='deck')return deckHandFor(minutes);
 return FERRY_CREW.find(c=>c.post===post)?.name||FERRY_SHORE.find(s=>s.post===post)?.name||null;
}
/** The crew aboard on the day of `minutes`. */
export const crewOnDuty=(minutes=0)=>FERRY_CREW.map(c=>({post:c.post,title:c.title,jp:c.jp,name:crewFor(c.post,minutes)}));
/** What everyone is doing in a phase: [{post, name, where, doing}]. */
export function crewDoing(phase,minutes=0){
 const watch=FERRY_WATCH[phase];if(!watch)throw new RangeError('Unknown ferry phase '+phase);
 return Object.entries(watch).map(([post,[where,doing]])=>({post,name:crewFor(post,minutes),where,doing}));
}
/** Everyone the ferry needs, crew, relief and shore, with what they do (for nameplates and the guide). */
export const FERRY_PEOPLE=Object.freeze([...FERRY_CREW.map(c=>c.name),FERRY_RELIEF.deck.name,...FERRY_SHORE.map(s=>s.name)]);
