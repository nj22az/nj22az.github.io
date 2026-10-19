import {namesOf} from './roster.js';
/**
 * The cast: everybody who lives on the island, in one list (docs/CAST-PLAN.md).
 *
 * The creator (2026-10-13): "everyone who exists on the island needs a reason to be there", and (2026-10-14)
 * "consolidate and remove unused characters instead make every character have a purpose ... shops that have only a
 * still character is not purposeful". So a person is here only if all four hold, and tests/cast.test.mjs checks them:
 *   1. a home that stands in the world (`home`, a registry id in island-households.js);
 *   2. a purpose the town needs (`purpose`, at `work`); children go to school;
 *   3. a day that takes them through the town (`day`: home, work, a meal or leisure, home);
 *   4. at least three people they love, like, tease or can't stand (RELATIONSHIPS), one of them with some tension.
 *
 * `was` names the figures in the world that become this person (Mrs Higa and Yonamine-sensei become Miss Higa).
 * `alsoAt` is a second home: only duty berths aboard now (Johansson's cabin, Mac's berth), since Thuan's weekday room
 * was dropped (phase 3, addendum 4). Ages are numbers; Johansson, the player, has none.
 * The registry (island-households.js) builds its households from this list; the rest of the code moves over batch by
 * batch (the plan's section 6), and the test names who is still to follow.
 *
 * The consolidation (docs/CAST-CONSOLIDATION.md, roster.js) is switching this list over phase by phase. Phase 2 (the
 * ship): the five supporting crew are people here, with the ship's cabins and Kai's rented house as their homes
 * (`supporting`, so the registry counts them as quarters, not households); Mr Fujita is the master, Chin the
 * motorman, Mac the relief engineer; the Bus driver and Mr Higa Jr keep their bodies and houses until phase 4 but hold
 * no post. Phase 3 (the households): Nhung lives at 3 Kitahama with Kōji and Riku; Thuan lives on Kitano-jima only and
 * commutes by the ferry; Kitahama Heights is two ground-floor houses, Mac's and Ms Ganaha's; Thuan owns Sakura
 * outright, which now keeps shop hours; Sakura supplies the flowers and the Port Terminal the post. Grandmother
 * Sakurai, Mr Higa Jr, Mrs Kinjō and Postman Tōma keep their bodies until phase 4 with no shop, counter or flat of
 * their own. The short display names (Fuji, Jack, Nao, Koji) wait for phase 5's directory and story sweep.
 */
const person=(name,o)=>Object.freeze({name,sex:o.sex,age:o.age??null,home:o.home,alsoAt:Object.freeze(o.alsoAt||[]),
 purpose:o.purpose,work:o.work,family:o.family||null,was:Object.freeze(o.was||[]),supporting:!!o.supporting,day:Object.freeze(o.day.map(s=>Object.freeze(s)))});

export const CAST=Object.freeze([
 // Johansson's family, on Kitano-jima.
 person('Johansson',{sex:'m',home:'kitano-1',alsoAt:['ferry-chief-cabin'],work:'ferry',family:'Johansson',purpose:'chief engineer of the Minato Maru; shares his primary tropical home with Thuan and keeps his duty cabin aboard',
  day:[['06:30','kitano-1','breakfast with Thuan'],['07:40','ferry','the morning crossing'],['08:30','ferry','the engine room'],['12:00','sato-ramen','lunch'],['13:00','ferry','machinery rounds'],['18:30','ferry','the crossing home'],['19:30','kitano-1','supper and home']]}),
  // Thuan owns and runs Sakura outright (docs/CAST-CONSOLIDATION.md §3) and lives with Johansson on Kitano-jima only
 // (addendum 4): the 08:30 boat in, the shop from nine, the 22:00 boat home (commuter-schedule.js HARBOUR_LINE); Nhung
 // keeps the counter at the weekend while she stays on the island (commerce/sakura-rota.js).
 person('Thuan',{sex:'f',age:25,home:'kitano-1',work:'sakura',family:'Johansson',purpose:'owns and runs Sakura Shōten: purchasing, accounts, stock, the shop and the supply trade; Johansson’s wife, home on Kitano-jima by the last boat',
  day:[['06:30','kitano-1','breakfast with Johansson'],['08:30','ferry','the morning boat to Minato'],['09:00','sakura','opening Sakura Shōten'],['13:00','park','lunch in the park with her sisters'],['14:00','sakura','the afternoon till'],['20:00','izakaya','supper at her sister’s'],['22:00','ferry','the last boat home'],['22:30','kitano-1','home to Kitano-jima']]}),
 person('Grandmother Chinen',{sex:'f',age:76,home:'kitahama-5',work:'kitahama-5',family:'Chinen',purpose:'Tetsuo’s mother; keeps the ground-access Chinen home and garden at 5 Kitahama',
  day:[['06:30','kitahama-5','sweeping the entrance'],['09:00','kitahama-5','the garden'],['15:00','kitahama-5','at her gate'],['18:30','kitahama-5','home']]}),
 // Thao's family, at 1 Kitahama.
 person('Thao',{sex:'f',age:34,home:'kitahama-1',work:'izakaya',family:'Nguyen',purpose:'runs Minato Izakaya; the middle sister',
  day:[['07:00','kitahama-1','breakfast and Vy off to school'],['10:00','market','buying for the izakaya'],['13:00','park','lunch with her sisters'],['16:00','izakaya','opening the izakaya'],['23:30','kitahama-1','home']]}),
 // Chin is the Minato Maru's motorman (the oiler post; roster.js SHIP_POSTS), aboard through the ship's day
 // (ferry-crew.js FERRY_WORKING_DAY: all hands signed on 06:05–22:20, meals in the mess, rest alongside between
 // sailings); the workshop is his between watches and ashore, Tetsuo's bench while she sails. No Sakura duties.
 person('Chin',{sex:'m',age:36,home:'kitahama-1',work:'ferry',family:'Nguyen',purpose:'motorman of the Minato Maru; mechanical repairman at the Chin & Tetsuo workshop between watches; Thao’s husband and Vy’s father',
  day:[['05:30','kitahama-1','breakfast'],['06:05','ferry','signing on: the generators with the chief'],['12:00','ferry','lunch in the mess, alongside'],['13:00','ferry','machinery rounds and the afternoon sailings'],['22:20','workshop','an hour at the bench with Tetsuo, when a job waits'],['23:00','izakaya','a late supper at Thao’s counter'],['23:30','kitahama-1','home']]}),
 person('Vy',{sex:'f',age:11,home:'kitahama-1',work:'school',family:'Nguyen',purpose:'Thao and Chin’s daughter; a pupil at the island school',
  day:[['07:00','kitahama-1','breakfast'],['08:15','school','school'],['15:30','blue-coral','an ice cream with Mai'],['16:20','park','homework in the park'],['18:30','kitahama-1','home']]}),
 // Nhung lives at 3 Kitahama with Kōji and Riku (docs/CAST-CONSOLIDATION.md §7, phase 3): her room with Reiko at
 // 1 Front-Row Yard is history, their friendship is not.
 person('Nhung',{sex:'f',age:37,home:'kitahama-3',work:'books',family:'Nguyen',purpose:'runs Front-Row Books; the eldest sister; Sakura’s weekend clerk; Kōji’s wife and Riku’s mother',
  day:[['07:00','kitahama-3','breakfast with Kōji and Riku'],['09:30','books','opening Front-Row Books'],['13:00','park','lunch with her sisters'],['14:00','books','the bookshop'],['18:30','kitahama-3','supper with Kōji and Riku'],['21:30','kitahama-3','home']]}),
 person('Kōji',{sex:'m',age:38,home:'kitahama-3',work:'fish-auction',family:'Nguyen',purpose:'sorts the catch at the fish auction and the ice plant; crews Mr Ōshiro’s boat; the ferry’s relief deck hand on Ms Uezu’s week off',
  day:[['04:30','fish-auction','the morning auction'],['09:00','ice-plant','ice for the boats'],['12:00','kitahama-3','home to sleep'],['16:00','boatyard','Mr Ōshiro’s boat'],['18:30','kitahama-3','supper with Nhung and Riku']]}),
 person('Riku',{sex:'m',age:9,home:'kitahama-3',work:'school',family:'Nguyen',purpose:'Nhung and Kōji’s son; a pupil at the island school; Vy’s cousin',
  day:[['07:00','kitahama-3','breakfast'],['08:15','school','school'],['15:30','quay','watching the boats come in'],['17:00','park','football in the park'],['18:30','kitahama-3','home']]}),
 // The Higas, in Nishi-machi.
 person('Miss Higa',{sex:'f',age:29,home:'higa',work:'school',family:'Higa',was:['Mrs Higa','Yonamine-sensei'],purpose:'teaches the island school; keeps the bandai at Umi-no-yu in the evenings and at weekends',
  day:[['07:00','higa','breakfast with her grandmother'],['08:00','school','teaching'],['15:30','school','marking'],['17:00','onsen','the bandai at Umi-no-yu'],['22:00','higa','home']]}),
 person('Grandmother Higa',{sex:'f',age:78,home:'higa',work:'higa-liquor',family:'Higa',purpose:'owns Umi-no-yu and Higa Liquor; keeps the liquor counter in the morning and the bandai in the afternoon',
  day:[['07:00','higa','the verandah'],['09:00','higa-liquor','the liquor counter'],['12:00','higa','lunch'],['13:00','onsen','the bandai at Umi-no-yu'],['17:00','higa','home to the verandah']]}),
 // The Front-Row yard.
 person('Tetsuo',{sex:'m',age:40,home:'resident-home-kenji',work:'workshop',family:'Chinen',purpose:'radio repairer at the Chin & Tetsuo workshop; the ferry’s electrician under contract; tends the onsen’s boiler and pumps',
  day:[['07:30','resident-home-kenji','breakfast'],['09:00','workshop','the radio bench'],['13:00','ferry','the ferry’s workshop while she lies alongside'],['18:00','onsen','the boiler and the pumps, and closing up'],['22:30','resident-home-kenji','home']]}),
 person('Reiko',{sex:'f',age:36,home:'resident-home-aya',work:'books',family:'Tamura',purpose:'edits and prints the evening paper at the back of Front-Row Books',
  day:[['08:00','resident-home-aya','breakfast'],['09:30','books','the printing bench'],['12:00','koban','asking Officer Mori for a story'],['14:00','books','setting the evening paper'],['19:00','izakaya','supper'],['22:00','resident-home-aya','home']]}),
 // The town's people.
 person('Mrs Sato',{sex:'f',age:68,home:'kitahama-2',work:'sato-ramen',family:'Sato',purpose:'cooks at Sato Ramen; buys fish at the morning auction; the izakaya’s rival for the evening crowd',
  day:[['05:30','fish-auction','the morning auction'],['07:00','sato-ramen','the stock pot'],['11:00','sato-ramen','lunch service'],['21:00','kitahama-2','home']]}),
 person('Officer Mori',{sex:'m',age:45,home:'koban',work:'koban',family:'Mori',purpose:'the island’s police officer: the desk at the koban from four, the night patrol',
  day:[['09:00','koban','asleep after the night patrol'],['13:00','sato-ramen','lunch'],['16:00','koban','the desk'],['21:00','main-street','the night patrol'],['02:00','koban','home behind the koban']]}),
 person('Harbour master',{sex:'m',age:58,home:'office',work:'office',family:'Kaneshiro',purpose:'runs the harbour office, the moorings, the cargo yard and the freight book',
  day:[['06:00','office','the morning boats'],['12:00','sato-ramen','ramen, every day'],['13:00','cargo-yard','the cargo yard'],['18:00','office','the evening boat'],['21:00','office','home behind the screen']]}),
 person('Barfly',{sex:'m',age:43,home:'izakaya',work:'izakaya',family:'Iha',purpose:'Minato’s resident regular; helps Thao clean and prepare the izakaya in return for his room and board',
  day:[['04:00','izakaya','asleep in his private room'],['10:00','izakaya','cleaning and setting up with Thao'],['16:00','izakaya','his stool at Minato']]}),
 // Retired (docs/CAST-CONSOLIDATION.md §6): the shop her parents opened in 1963 is Thuan's outright, and Flat 2 went
 // with the Heights' upper storey (addendum 6). She keeps her body until phase 4, with no shift and no home standing:
 // her home id is the retired flat, which the registry resolves to the roster's fallback (people/home-directory.js).
 person('Grandmother Sakurai',{sex:'f',age:74,home:'kitahama-flat-2',work:'onsen',family:'Sakurai',purpose:'sold Sakura Shōten to Thuan, who owns it outright; her bath at Umi-no-yu an hour before Grandmother Higa’s, and Sunday tea with Mrs Kinjō',
  day:[['06:00','kitahama-flat-2','breakfast'],['09:00','park','the bench in Harbour Park'],['12:00','sato-ramen','lunch'],['15:00','onsen','her bath, an hour before Grandmother Higa’s'],['17:00','kitahama-flat-2','home']]}),
 // The post and parcel counter is Ms Ganaha's window at the Port Terminal now (docs/CAST-CONSOLIDATION.md §8, phase 3);
 // the old post office counter is shut. He keeps the round, from the terminal, until phase 4 retires him.
 person('Postman Tōma',{sex:'m',age:38,home:'kitahama-4',work:'port',family:'Tōma',purpose:'carries the post on the morning and afternoon rounds, from the mailbag at the Port Terminal: collections at 10:30 and 16:30',
  day:[['08:00','port','sorting the mailbag at the terminal'],['09:00','main-street','the morning round'],['13:00','sato-ramen','lunch'],['14:00','main-street','the afternoon round'],['17:00','port','the evening boat’s mailbag'],['18:30','kitahama-4','home']]}),
 person('Dr Kakazu',{sex:'m',age:34,home:'clinic',work:'clinic',family:'Kakazu',purpose:'the island doctor, posted from Naha for two years: surgery at the town hall clinic, on call at night',
  day:[['07:30','clinic','breakfast'],['09:00','clinic','morning surgery'],['12:30','sato-ramen','lunch, which Mrs Sato won’t let him pay for'],['14:00','clinic','house calls'],['19:00','izakaya','supper'],['21:00','clinic','home, on call']]}),
 person('Mr Ōshiro',{sex:'m',age:71,home:'oshiro',work:'boatyard',family:'Ōshiro',purpose:'fisherman; builds and mends sabani at the boatyard; Kōji’s skipper',
  day:[['05:00','sea','fishing with Kōji'],['09:00','boatyard','the sabani'],['12:00','oshiro','lunch and a nap'],['14:00','boatyard','the sabani'],['17:00','oshiro','home']]}),
 // Retiring (docs/CAST-CONSOLIDATION.md §6, addendum 3): her flowers and decorations are Sakura's trade now
 // (commerce/merchandising.js) and the pavilion sells nothing; she keeps her body until phase 4 takes both.
 person('Mrs Kinjō',{sex:'f',age:52,home:'kinjo',work:'florist',family:'Kinjō',purpose:'kept Rainflower Florist until Sakura took over the town’s flowers and decorations; tidies the old pavilion by the park while it stands',
  day:[['07:00','kinjo','breakfast'],['08:30','florist','the morning stems'],['12:00','zenzai','lunch at the counter next door'],['13:00','florist','bouquets and deliveries'],['18:00','kinjo','home']]}),
 person('Mrs Nakamura',{sex:'f',age:40,home:'nakamura',work:'zenzai',family:'Nakamura',purpose:'keeps Nakamura Zenzai and the Blue Coral ice-cream counter; runs the community kitchen; Mai’s mother',
  day:[['06:00','zenzai','the beans on'],['10:00','zenzai','shaved ice and zenzai'],['15:00','blue-coral','the ice-cream counter, for the school crowd'],['19:00','nakamura','home with Mai']]}),
 person('Mai',{sex:'f',age:10,home:'nakamura',work:'school',family:'Nakamura',was:['Nakamura Mai'],purpose:'Mrs Nakamura’s daughter; a pupil at the island school; Vy’s best friend',
  day:[['07:00','nakamura','breakfast'],['08:15','school','school'],['15:30','blue-coral','an ice cream with Vy'],['16:20','park','homework in the park'],['18:30','nakamura','home']]}),
 // The ferry and the port.
 // Retired from the bridge (docs/CAST-CONSOLIDATION.md §6: Fujita is the master); he keeps his body and his house until
 // phase 4 retires him, with no post and no shift: his stories at the office and the izakaya.
 person('Bus driver',{sex:'m',age:49,home:'kitahama-6',work:'kitahama-6',family:'Taira',purpose:'the Minato Maru’s former master (he drove the island bus before the ferry), retired from the bridge; his stories at the harbour office and the izakaya',
  day:[['06:30','kitahama-6','breakfast'],['09:00','park','the bench in Harbour Park'],['12:00','sato-ramen','lunch'],['14:00','kitahama-6','an afternoon at home'],['18:00','office','the day’s log over the harbour clock, out of habit'],['19:30','izakaya','supper and a story'],['21:00','kitahama-6','home']]}),
 // Mac Turner (docs/CAST-CONSOLIDATION.md §4): the relief engineer, renamed from Mr Nakandakari in phase 2 with his new
 // biography; an American who came with the diesels in the seventies and stayed. Kitahama Heights A (the logical id
 // kitahama-flat-3 kept for his saves, addendum 6) and a duty berth aboard.
 person('Mac',{sex:'m',age:61,home:'kitahama-flat-3',alsoAt:['ferry-engineer-duty-berth'],work:'ferry',family:'Turner',was:['Mr Nakandakari'],purpose:'relief engineer of the Minato Maru, an American who came to the island with the Caterpillar diesels in the seventies and stayed; takes the chief’s watch whenever Johansson is ashore; lives in Kitahama Heights A and keeps a duty berth aboard',
  day:[['05:30','ferry','the engine room'],['12:00','ferry','lunch in the mess'],['13:00','ferry','the engine room'],['19:30','izakaya','one beer at Minato'],['21:00','kitahama-flat-3','home']]}),
 // The oiler post went to Chin (docs/CAST-CONSOLIDATION.md §6); he keeps his body until phase 4 retires him, with no
 // post and no shift, back at the boatyard where he served his time. Flat 1 went with the Heights' upper storey
 // (addendum 6): his home id is the retired flat, resolved to the roster's fallback (people/home-directory.js).
 person('Mr Higa Jr',{sex:'m',age:32,home:'kitahama-flat-1',work:'boatyard',family:'Higa',purpose:'back at Mr Ōshiro’s boatyard, where he served his time, since the ferry’s motorman post went to Chin; Miss Higa’s elder brother',
  day:[['07:00','kitahama-flat-1','breakfast'],['08:30','boatyard','the sabani and the outboards'],['12:00','sato-ramen','lunch'],['13:00','boatyard','the boatyard'],['19:00','higa','supper at his grandmother’s'],['21:00','kitahama-flat-1','home']]}),
 person('Ms Uezu',{sex:'f',age:44,home:'kitahama-8',work:'ferry',family:'Uezu',purpose:'bosun of the Minato Maru, a week on (living aboard) and a week off',
  day:[['06:00','ferry','the deck and the ramp'],['12:00','ferry','lunch in the mess'],['13:00','ferry','the deck and the ramp'],['19:00','sato-ramen','supper'],['20:30','kitahama-8','home (in her week off)']]}),
 // The port clerk (docs/CAST-CONSOLIDATION.md §4, §8): tickets, parcels and the postal counter at one window, from noon
 // to the last boat (people/ganaha.js GANAHA); the mailbag and the parcel shelf before it opens. Kitahama Heights B.
 person('Ms Ganaha',{sex:'f',age:27,home:'kitahama-flat-4',work:'port',family:'Ganaha',purpose:'port clerk at the Port Terminal: the Minato Maru’s tickets, parcels and the post, at one window',
  day:[['07:00','kitahama-flat-4','breakfast'],['09:30','port','the mailbag off the morning boat: parcels on the shelf, letters in the pigeonholes'],['11:15','sato-ramen','an early lunch before the window opens'],['12:00','port','the window: tickets, parcels and post, and the ferry desk telephone'],['22:30','kitahama-flat-4','home']]}),
 person('Mr Fujita',{sex:'m',age:63,home:'fujita-houseboat',work:'port',family:'Fujita',purpose:'the port’s linesman: takes the Minato Maru’s lines at every call; a retired fisherman with a bad back',
  day:[['06:00','port','the first call'],['10:00','onsen','a soak for his back'],['12:00','sato-ramen','lunch'],['13:00','port','the afternoon calls'],['19:00','fujita-shed','television in his pier shed'],['23:30','fujita-houseboat','home aboard Shiosai']]}),
 person('Mr Shimabukuro',{sex:'m',age:55,home:'shimabukuro',work:'power-station',family:'Shimabukuro',purpose:'runs the power station and keeps the island lit; Chin’s fishing partner',
  day:[['05:30','seawall','fishing with Chin (Sundays)'],['07:00','power-station','the generators'],['12:00','shimabukuro','lunch upstairs'],['13:00','power-station','the switchboard'],['19:00','shimabukuro','home']]}),
 // The supporting crew (roster.js SUPPORTING; docs/CAST-CONSOLIDATION.md §5): the four who live aboard, in the cabins of
 // the ship's general arrangement (island-households.js binds them), and the Kitano line hand in the Shiroma house across
 // the lane from his pier. Their bodies are the ferry's (ferry-crew-aboard.js, ferry-shore-crew.js), not the street's;
 // their days are the ship's working day (ferry-crew.js FERRY_WORKING_DAY), with meals in the mess and an evening ashore.
 person('Ryo',{sex:'m',age:41,home:'ferry-officer-cabin',work:'ferry',family:'Ryo',was:['Chief officer'],supporting:true,purpose:'chief officer of the Minato Maru: the lookout, the ramp and the access; from Itoman, six years on the Kerama ferries before her',
  day:[['05:40','ferry-officer-cabin','up in his cabin'],['06:05','ferry','the bridge: the log, the weather and the berth'],['12:30','ferry','lunch in the mess'],['13:00','ferry','the afternoon sailings from the port wing'],['22:20','ferry','the last log entry with the master'],['22:40','ferry-officer-cabin','his cabin']]}),
 person('Ren',{sex:'m',age:23,home:'ferry-crew-cabin',work:'ferry',family:'Ren',was:['Deck hand'],supporting:true,purpose:'deck hand of the Minato Maru: the forward mooring station, the gangway and the passenger-deck rounds; from Nago, his first ship',
  day:[['05:40','ferry-crew-cabin','up in the deckhand’s cabin'],['06:00','ferry','the forward station and the gangway'],['12:00','ferry','lunch in the mess'],['13:00','ferry','the gangway and the saloon rounds'],['22:30','izakaya','a late bowl at Minato'],['23:30','ferry-crew-cabin','his bunk']]}),
 person('Aya',{sex:'f',age:31,home:'ferry-crew-cabin',work:'ferry',family:'Aya',was:['Purser'],supporting:true,purpose:'the sailing purser of the Minato Maru: the passenger count, the drivers off the vehicle deck and the lobby; came from the Kume line for the short crossings',
  day:[['05:50','ferry-crew-cabin','up in the crew cabin'],['06:10','ferry','the purser’s window and the first count'],['12:30','ferry','lunch in the mess'],['13:00','ferry','the lobby and the afternoon counts'],['22:20','ferry','the day’s takings and the passenger book'],['22:40','ferry-crew-cabin','her bunk']]}),
 person('Jun',{sex:'m',age:52,home:'ferry-crew-cabin',work:'ferry',family:'Jun',was:['Cook-steward'],supporting:true,purpose:'cook-steward of the Minato Maru: the crew’s meals from the three-plate range, the kiosk and the galley secured for every crossing; twenty years in the galleys of the cargo boats out of Naha',
  day:[['05:00','ferry-crew-cabin','up before the generators'],['05:20','ferry','the galley: the crew’s breakfast'],['11:00','ferry','lunch for eight, two sittings'],['15:00','ferry','a smoke on the open deck between sailings'],['21:30','ferry','the galley wiped down and the kiosk counted'],['22:40','ferry-crew-cabin','his bunk']]}),
 person('Kai',{sex:'m',age:47,home:'kitano-2',work:'kitano-pier',family:'Kai',was:['Kitano line hand'],supporting:true,purpose:'the Kitano shore line hand: the shore end of every line at the Kitano berth; rents the Shiroma house across the lane from the pier',
  day:[['06:00','kitano-2','breakfast'],['06:20','kitano-pier','standing by for her lines'],['12:00','kitano-2','lunch at home between calls'],['12:40','kitano-pier','the afternoon calls'],['22:30','kitano-2','home']]}),
]);

export const CAST_NAMES=Object.freeze(CAST.map(p=>p.name));
/**
 * A member by the name this list uses, by a name they had before (`was`), or by any name or id the consolidated roster
 * (roster.js) gives them: castMember('Fuji') is Mr Fujita until the phase that renames him here, so stories, saves and
 * looks written under either name find the one body. Nobody the roster knows but this list does not (the supporting
 * crew before phase 2, the retired after phase 4) is null.
 */
export const castMember=name=>CAST.find(p=>p.name===name||p.was.includes(name))||rosterMember(name);
function rosterMember(name){
 const names=namesOf(name);
 return names.length?CAST.find(p=>names.includes(p.name)||p.was.some(w=>names.includes(w)))||null:null;
}
/** The name the live cast uses today for a person known by any of their names, or null while they have no body. */
export const liveNameFor=name=>castMember(name)?.name??null;

/**
 * Who loves, teases and quarrels with whom (docs/CAST-PLAN.md section 4). A pair has a kind, and `tension` when there
 * is something between them that stories can use; `story` is the line a story can quote.
 */
const pair=(a,b,kind,story,tension=null)=>Object.freeze({a,b,kind,story,tension});
export const RELATIONSHIPS=Object.freeze([
 pair('Johansson','Thuan','married','Weekends on Kitano-jima.','His engine-room watches against her shop hours.'),
 pair('Johansson','Tetsuo','friends at the bench','It was a dead radio that first brought him to the workshop.'),
 pair('Johansson','Thao','brother- and sister-in-law','Supper at Minato most evenings.','She says he works too late, and keeps his plate warm anyway.'),
 pair('Thao','Chin','married','Twelve years; they laugh at the counter at closing time.','They bicker about the ship’s hours.'),
 pair('Nhung','Kōji','married','The morning auction against the bookshop’s opening.','He smells of fish; she smells of books.'),
 pair('Thuan','Thao','sisters','Rock-paper-scissors in the park.','Borrowed clothes that never come back.'),
 pair('Thuan','Nhung','sisters','Lunch in the park, all three.','The eldest who knows best.'),
 pair('Thao','Nhung','sisters','Nhung says Thao is stubborn; Thao says she is right.','Who is stubborn and who is right.'),
 pair('Thao','Vy','mother and daughter','Breakfast and the school run.','Homework against ice cream.'),
 pair('Chin','Vy','father and daughter','He mends whatever she breaks.'),
 pair('Nhung','Riku','mother and son','Bedtime stories from the bookshop.'),
 pair('Kōji','Riku','father and son','Riku wants to go out on the boat.','Riku is not allowed on the boat until he can swim to the buoy.'),
 pair('Vy','Riku','cousins and classmates','The only two in the class with the same grandmother.','A rivalry at school.'),
 pair('Vy','Mai','best friends','Blue Coral after school.'),
 pair('Riku','Mai','classmates','Football in the park.','Mai always takes Vy’s side.'),
 pair('Miss Higa','Tetsuo','a slow spark','At the onsen after hours: he fixes the boiler, she pretends not to watch.','Neither will say it.'),
 pair('Miss Higa','Grandmother Higa','granddaughter and grandmother','The Higa house and the bath.','Grandmother wants her married.'),
 pair('Miss Higa','Vy','teacher and pupil','Vy asks the most questions.'),
 pair('Miss Higa','Riku','teacher and pupil','Riku talks in class.','He is moved to the front row every week.'),
 pair('Miss Higa','Mai','teacher and pupil','Mai keeps the class rabbit.'),
 pair('Grandmother Higa','Grandmother Sakurai','rivals since primary school','Every town event is a contest.','Neither has ever let the other win.'),
 pair('Grandmother Higa','Tetsuo','employer','He keeps her boiler running for a bath and supper.','She pushes her granddaughter at him.'),
 pair('Grandmother Chinen','Tetsuo','mother and son','He comes over on the boat when he can.','Not often enough, and he eats like he is still fifteen.'),
 pair('Grandmother Chinen','Thuan','neighbours','Thuan brings her the shop’s day-old bread on Saturdays.'),
 pair('Grandmother Chinen','Johansson','neighbours','The chief engineer who visits with Thuan.'),
 pair('Reiko','Officer Mori','a prickly spark','She wants his stories.','He wants her to stop printing them.'),
 pair('Reiko','Nhung','best friends','The books and the paper share a counter.'),
 pair('Mrs Sato','Harbour master','old flames','Widow and widower; he eats her ramen every day and never says why.','The thing they never say.'),
 pair('Thao','Mrs Sato','rivals','The evening crowd: izakaya against ramen.','They fall out, then make up over a delivery.'),
 pair('Barfly','Mrs Sato','a hopeless crush','He orders the ramen he can’t afford.','She does not notice, or pretends not to.'),
 pair('Barfly','Thao','her most loyal regular','His stool at Minato.','His tab.'),
 pair('Barfly','Officer Mori','the late hours','Mori stops at Minato on the night patrol.','Mori counts his beers.'),
 pair('Grandmother Sakurai','Thuan','the shop’s old owner','She sold Thuan the shop, and the books balanced to the yen on the day.','She still rearranges the window when she passes.'),
 pair('Mrs Kinjō','Mrs Nakamura','neighbouring shops','Lunch at each other’s counters.','Whose customers block whose doorway.'),
 pair('Mrs Kinjō','Thao','her old supplier','The izakaya’s flowers and lanterns, which come from Sakura now.'),
 pair('Mrs Kinjō','Grandmother Sakurai','old friends','Sunday tea.'),
 pair('Mrs Nakamura','Mai','mother and daughter','The beans on at six.'),
 pair('Chin','Tetsuo','partners','The workshop, since school; Tetsuo keeps the bench while Chin is aboard.','The odd quarrel over a botched job.'),
 pair('Chin','Mr Shimabukuro','fishing partners','Off the seawall at dawn on Sundays.','Who caught the bigger one.'),
 pair('Kōji','Mr Ōshiro','crew and skipper','Out on the sabani before the auction.','Ōshiro won’t buy a fibreglass boat.'),
 pair('Kōji','Ms Uezu','deck hands','He relieves her every other week.'),
 pair('Bus driver','Harbour master','old friends','The day’s log over the harbour clock.'),
 pair('Bus driver','Mac','old shipmates','The Minato Maru, when the driver had her bridge.','Mac says he ran her engines too hard.'),
 pair('Bus driver','Ms Uezu','master and bosun','The ramp and the lines.'),
 pair('Mac','Tetsuo','relief engineer and contract electrician','The ship’s switchboard.','Mac guards his switchboard.'),
 pair('Mac','Ms Uezu','engine room and deck','The ferry’s two halves.','Deck against engine room, every day.'),
 pair('Mr Higa Jr','Grandmother Higa','grandson and grandmother','Supper at the Higa house.','She knows the ferry by its whistle and says so when he is late.'),
 pair('Mr Higa Jr','Miss Higa','brother and sister','He fixes her bicycle; she checks his letters.','He teases her about Tetsuo.'),
 pair('Mr Higa Jr','Mac','his old relief engineer','Mac was teaching him for his licence before the post went to Chin.','Mac’s engine room was never clean enough.'),
 pair('Mr Higa Jr','Mr Ōshiro','his old master at the boatyard','He served his time on sabani and outboards.'),
 pair('Ms Ganaha','Bus driver','tickets and the bridge','The day’s passengers.','Late departures, and who explains them.'),
 pair('Ms Ganaha','Mr Fujita','the port','The ticket window and the lines.'),
 pair('Ms Ganaha','Postman Tōma','a spark','The evening mailbag at the terminal.','He lingers; she is busy.'),
 pair('Mr Fujita','Grandmother Higa','an onsen regular','A soak for his back every morning.','He says the bath is never hot enough.'),
 pair('Mr Fujita','Mr Ōshiro','old fishermen','The 1979 sabani race.','Ōshiro came fourth, and Fujita reminds him.'),
 pair('Mr Fujita','Dr Kakazu','patient and doctor','His back.','He will not rest it.'),
 pair('Dr Kakazu','Mrs Sato','the outsider everyone feeds','Lunch he is not allowed to pay for.'),
 pair('Dr Kakazu','Grandmother Higa','doctor and patient','Her blood pressure.','She ignores his advice.'),
 pair('Postman Tōma','Reiko','gossip','Everyone’s letters and news.'),
 pair('Postman Tōma','Officer Mori','the street','His bicycle on the koban’s line.','Mori has asked him not to park there.'),
 pair('Mr Shimabukuro','Tetsuo','the island’s electricians','The town’s power.'),
 pair('Mr Shimabukuro','Postman Tōma','the parcels','Spare parts at the power-house door, every week.'),
 pair('Harbour master','Mr Fujita','harbour master and linesman','Every call of the Minato Maru.'),
 pair('Mrs Nakamura','Vy','her daughter’s best friend','The pink guava scoop kept aside.'),
 // The supporting crew (phase 2): the ship's two departments and the shore ends of her lines.
 pair('Ryo','Mr Fujita','master and chief officer','The log and the lookout, every call.','Fujita cons every berthing himself; Ryo wants the afternoon ones.'),
 pair('Ryo','Ms Uezu','bridge and deck','The ramp orders from the port wing.','Who counts the cars.'),
 pair('Ryo','Harbour master','the berth on the radio','Distance off and the berth, every call.'),
 pair('Ren','Ms Uezu','deck hand and bosun','Forward and aft.','She checks his coils.'),
 pair('Ren','Kōji','the forward station on Kōji’s weeks','Kōji ties a fisherman’s knot and Ren unties it.'),
 pair('Ren','Aya','the gangway and the count','The last passenger, counted twice.','Whose count is right.'),
 pair('Aya','Ms Ganaha','the ticket window and the purser’s window','The passenger count by radio before every departure.','A count that does not match.'),
 pair('Aya','Jun','the lobby and the kiosk','Cup noodles and the hot-water dispenser.'),
 pair('Jun','Mrs Sato','two cooks','Her stock recipe, which he says is his.','Whose stock it is.'),
 pair('Jun','Mr Fujita','the master’s tea','Tea on the bridge at every call.'),
 pair('Jun','Chin','the mess','The motorman’s second helping.'),
 pair('Kai','Ms Uezu','the Kitano lines','Her stern line and his bitt.','The after spring, which he says she pays out too fast.'),
 pair('Kai','Ren','the shore eye and the heaving line','Forward lines at Kitano.'),
 pair('Kai','Thuan','neighbours in Kitano hamlet','The Shiroma house across the lane from hers.'),
]);

/** Everyone who is in a pair with `name`, and the pair. */
export const relationshipsOf=name=>RELATIONSHIPS.filter(r=>r.a===name||r.b===name).map(r=>({with:r.a===name?r.b:r.a,...r}));

/**
 * The places that are open, and who keeps each (the creator: a place with only a still figure has no purpose; a
 * place nobody keeps is closed, merged or removed). `closed` places stand, shut, until the plan's batch 5 decides.
 */
export const PLACES=Object.freeze({
 sakura:{name:'Sakura Shōten',keepers:['Thuan','Nhung']},
 izakaya:{name:'Minato Izakaya',keepers:['Thao','Chin','Barfly']},
 'sato-ramen':{name:'Sato Ramen',keepers:['Mrs Sato']},
 books:{name:'Front-Row Books & Stationery',keepers:['Nhung','Reiko']},
 workshop:{name:'Chin & Tetsuo Repairs',keepers:['Chin','Tetsuo']},
 office:{name:'Harbour Office, the cargo yard and the freight book',keepers:['Harbour master']},
 koban:{name:'Minato Koban',keepers:['Officer Mori']},
 // The counter moved to the Port Terminal (phase 3); the shop-house stands until phase 4 removes it.
 'post-office':{name:'Post office',closed:'the post and parcel counter is Ms Ganaha’s window at the Port Terminal now; the old shop-house is shut'},
 clinic:{name:'Town hall clinic',keepers:['Dr Kakazu']},
 'town-hall':{name:'Town hall',keepers:['Dr Kakazu']},
 school:{name:'The island school',keepers:['Miss Higa']},
 onsen:{name:'Umi-no-yu',keepers:['Grandmother Higa','Miss Higa','Tetsuo']},
 'higa-liquor':{name:'Higa Liquor',keepers:['Grandmother Higa']},
 florist:{name:'Rainflower Florist',closed:'Mrs Kinjō has retired; Sakura supplies the town’s flowers and decorations, and the pavilion sells nothing'},
 zenzai:{name:'Nakamura Zenzai and the community kitchen',keepers:['Mrs Nakamura']},
 'blue-coral':{name:'Blue Coral',keepers:['Mrs Nakamura']},
 'power-station':{name:'Power station',keepers:['Mr Shimabukuro']},
 boatyard:{name:'Boatyard',keepers:['Mr Ōshiro','Mr Higa Jr']},
 'fish-auction':{name:'Fish auction and the ice plant',keepers:['Kōji']},
 ferry:{name:'Minato Maru',keepers:['Johansson','Mr Fujita','Mac','Chin','Ms Uezu','Kōji','Tetsuo','Ryo','Ren','Aya','Jun']},
 // Tōma works his round from the terminal's mailbag until phase 4 retires him.
 port:{name:'Port Terminal',keepers:['Ms Ganaha','Mr Fujita','Postman Tōma']},
 'kitano-pier':{name:'Kitano-jima ferry pier',keepers:['Kai']},
 warehouse:{name:'Quay Warehouse and the Sakura depot',keepers:['Harbour master','Thuan']},
 // Nobody keeps these any more (docs/CAST-PLAN.md section 3, who goes).
 'yonamine-fish':{name:'Yonamine Fresh Fish',closed:'Mrs Yonamine has gone; the morning catch is sold at the auction'},
 'aragaki-sweets':{name:'Aragaki Confectionery',closed:'Mr Arakaki has gone'},
 'hoshizaki-store':{name:'Hoshizaki village store',closed:'Mina has gone'},
 'fumoto-co-op':{name:'Fumoto co-op',closed:'Fumoto stays as fields'},
});
