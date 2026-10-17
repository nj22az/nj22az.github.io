import {FERRY_MANNING} from '../world/ferry-ship.js';

/** The eight posts of the game's manning plan. Job titles are crew roles, not new village households. */
const people={
 master:{name:'Bus driver',known:'the bus driver',
  why:'He drove the Harbour Line bus for twelve years, until the line became the ferry. He learned his deck work on the cargo boats out of Naha and still keeps the Harbour Line’s timetable.',
  lives:'His flat in town; aboard during the ferry’s working day'},
 mate:{name:'Chief officer',jobRole:true,
  why:'The chief officer keeps the lookout, supervises access and operates the ramp controls. A separate officer can check the berth while the master remains at the conning position.',
  lives:'The chief officer’s cabin aboard'},
 chief:{name:'Mr Nakandakari',new:true,age:61,
  why:'Twenty years in the engine rooms of the island cargo boats out of Naha. Mr Shimabukuro at the power house sailed with him and sent for him when the ferry’s old chief retired.',
  lives:'Aboard, in the chief engineer’s cabin; he visits his daughter in Naha',trait:'Unhurried, exact, cooks the Friday curry'},
 oiler:{name:'Mr Higa Jr',
  why:'The Nishi-machi Higas’ eldest. He served his time at Mr Ōshiro’s boatyard on sabani and outboards, then joined the ferry to tend her diesels alongside the chief engineer.',
  lives:'Kitahama Heights, flat 1'},
 bosun:{name:'Ms Uezu',
  why:'The bosun supervises the deck work, the aft mooring lines and vehicle securing. Ferry work runs in her family; she does a week on and a week off, with Kōji covering her relief week.',
  lives:'8 Kitahama; aboard in the crew cabin on her week on'},
 deck:{name:'Deck hand',jobRole:true,
  why:'The deck hand works the forward mooring station and passenger gangway, then makes passenger-deck rounds. Keeping this post separate leaves the bosun free to work aft.',
  lives:'The deckhand’s cabin aboard'},
 purser:{name:'Purser',jobRole:true,
  why:'The purser counts the passengers, checks that drivers leave the vehicle deck and answers questions in the lobby. The passenger count goes to the bridge before departure.',
  lives:'The crew accommodation aboard'},
 cook:{name:'Cook-steward',jobRole:true,
  why:'The cook-steward prepares the crew’s meals and attends to refreshments. Before departure the galley equipment and loose stores are secured for the crossing.',
  lives:'The crew accommodation aboard'},
};
export const FERRY_CREW=Object.freeze(FERRY_MANNING.map(({post,title,jp,licence})=>Object.freeze({post,title,jp,...people[post],licence:'Game manning plan: '+licence})));
const relief=Object.freeze({name:'Kōji',why:'He knows the island boats, lines and weather, and covers Ms Uezu’s relief week as bosun.'});
/** The old deck rota lookup remains an alias; the signed-on post is correctly called bosun. */
export const FERRY_RELIEF=Object.freeze({bosun:relief,deck:relief});
export const FERRY_SHORE=Object.freeze([
 Object.freeze({post:'tickets',title:'Ticket clerk',name:'Ms Ganaha',where:'The Port Building’s waiting hall',does:'Sells tickets and gives the passenger count to the purser'}),
 Object.freeze({post:'linesman',title:'Linesman at Minato',name:'Mr Fujita',where:'The working pier and ferry bitts',does:'Walks from his shed to handle each shore line, then returns to his chair'}),
 Object.freeze({post:'electrician',title:'Electrician (under contract)',name:'Tetsuo',where:'The electrical workshop aboard, alongside at Minato',does:'Maintains the ferry’s electrical equipment while she is in port'}),
 Object.freeze({post:'port',title:'Harbour master',name:'Harbour master',where:'The Harbour Office',does:'Gives the berth and keeps the port radio'}),
 Object.freeze({post:'airport-linesman',title:'Kitano line hand',name:'Kitano line hand',jobRole:true,where:'Kitano-jima ferry pier',does:'Handles the shore eyes at the Kitano berth'}),
]);

const waiting={
 master:['wheelhouse','Keeps the log and watches the berth from the wheelhouse'],
 mate:['port-wing','Checks traffic and the landing before supervising the ramp'],
 chief:['engine-room','Checks the plant and switchboard before accepting a departure order'],
 oiler:['engine-room','Checks the machinery, bilges and lubricating oil'],
 bosun:['car-deck','Supervises vehicle parking and wheel securing'],
 deck:['gangway','Supervises the gangway and gives passengers a hand with their bags'],
 purser:['purser','Checks tickets, the passenger count and the passenger exits'],
 cook:['mess','Prepares meals and secures the galley’s loose equipment'],
 tickets:['waiting-hall','Sells tickets and sends the count to the purser aboard'],
};
const manoeuvring={...waiting,
 master:['wheelhouse','Cons the ship alongside and gives the mooring orders'],
 mate:['port-wing','Reports distance off the berth and keeps a lookout'],
 bosun:['stern','Works the after mooring lines with the shore line hand'],
 deck:['bow','Works the forward mooring lines from the forecastle'],
 linesman:['quay','Walks to each bitt and handles the shore end of the line'],
};
const crossing={...waiting,
 master:['wheelhouse','Keeps the navigation watch and watches for fishing boats'],
 mate:['port-wing','Keeps a lookout and checks the bridge instruments'],
 oiler:['steering-gear','Makes the machinery rounds and checks temperatures and pressures'],
 bosun:['car-deck','Checks the secured vehicles and keeps the vehicle deck clear'],
 deck:['saloon','Checks passenger exits and helps passengers in the saloon'],
 purser:['purser','Attends the passengers from the lobby'],
 cook:['kiosk','Attends to refreshments and checks the galley'],
};
/** Default watches. Live operation tasks take precedence and are reached by walking. */
export const FERRY_WATCH=Object.freeze(Object.fromEntries(Object.entries({
 waiting,arriving:manoeuvring,reversing:manoeuvring,swinging:manoeuvring,leaving:crossing,crossing,
 night:{chief:['mess','Aboard on shore power, checking the machinery before bed'],bosun:['cabin','Resting in the crew cabin during the working week']},
}).map(([key,value])=>[key,Object.freeze(value)])));
const DAY=1440;
export const rotaWeek=minutes=>((Math.floor(Math.floor(minutes/DAY)/7)%2)+2)%2;
export const bosunFor=minutes=>rotaWeek(minutes)===0?'Ms Uezu':FERRY_RELIEF.bosun.name;
/** Legacy rota API, retained for existing stories and saved references. */
export const deckHandFor=bosunFor;
export function crewFor(post,minutes=0){
 if(post==='bosun')return bosunFor(minutes);
 return FERRY_CREW.find(c=>c.post===post)?.name||FERRY_SHORE.find(s=>s.post===post)?.name||null;
}
export const crewOnDuty=(minutes=0)=>FERRY_CREW.map(c=>({post:c.post,title:c.title,jp:c.jp,name:crewFor(c.post,minutes),jobRole:!!c.jobRole}));
export function crewDoing(phase,minutes=0){
 const watch=FERRY_WATCH[phase];if(!watch)throw new RangeError('Unknown ferry phase '+phase);
 return Object.entries(watch).map(([post,[where,doing]])=>({post,name:crewFor(post,minutes),where,doing}));
}
/** Named residents only: job-role crew have no invented entry in the village household registry. */
export const FERRY_PEOPLE=Object.freeze([...FERRY_CREW.filter(c=>!c.jobRole).map(c=>c.name),relief.name,...FERRY_SHORE.filter(s=>!s.jobRole).map(s=>s.name)]);
