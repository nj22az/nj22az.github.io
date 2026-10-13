import {FLIGHT_TIMES,stamp} from '../island/services.js';

/**
 * The island guide's records (the studio's town-studio/island-guide/plan.md, batch 2): one entry for each place a
 * visitor can go on Kitano-jima and on Johansson Island beyond Minato's main street, as Ms Ganaha tells it at the Port
 * Terminal window (people/ganaha.js).
 *
 * She only says what the world holds. Each record's `says` is her answer, and `checks` names the lines in the game's
 * own files that make it true: tests/island-guide.test.mjs fails if any of them changes, so she can never describe a
 * place the town no longer has. Places that are planned but not built (live turtles, the coastal bus, the Hoshizaki
 * guesthouse, the summer flight, a lighthouse keeper) are never promised: where she mentions them, she says they are
 * not there yet.
 *
 *   id, name   the place
 *   island     'kitano' (Kitano-jima) or 'johansson' (Johansson Island)
 *   kind       what it is for: 'beach', 'view', 'shrine', 'shop', 'village', 'travel', 'bath', 'walk'
 *   says       her answer
 *   checks     [file, text] pairs: the text must be in that file
 */
const flights=FLIGHT_TIMES.map(stamp);
const listed=times=>times.slice(0,-1).join(', ')+' and '+times.at(-1);

export const ISLAND_PLACES=Object.freeze([
 // Kitano-jima: the airport island, across the strait.
 {id:'coral-bay',name:'Coral Bay',island:'kitano',kind:'beach',
  says:'Five minutes down through the palms from the airport, love. White sand and two benches. Plenty of people take the morning boat just for that. You swim between the palms only, and mind the last ferry: it goes after the evening flight.',
  checks:[['src/world/airport-district.js','Swimming between the palms only'],['src/world/airport-district.js','Last ferry to Minato leaves after the evening flight'],['src/world/airport-district.js','Coral Bay, five minutes down through the palms'],['src/world/airport-district.js','Plenty of people come over on the morning ferry just for this']]},
 {id:'coral-bay-bar',name:'Coral Bay Bar',island:'kitano',kind:'shop',
  says:'The little bar on the sand at Coral Bay: a cold bottle of Umineko lager for ¥300, or shikuwasa juice for ¥150. Higa Liquor sends the beer over on our boat.',
  checks:[['src/world/airport-district.js','Umineko lager, cold bottle'],['src/world/airport-district.js','shikuwasa']]},
 {id:'turtle-cove',name:'Turtle Cove',island:'kitano',kind:'beach',
  says:'Round the east side. Green turtles come in on the rising tide to graze, they say. I have never had the patience to wait for one; you bring a book.',
  checks:[['src/world/airport-district.js','Green turtles come in on the rising tide to graze']]},
 {id:'hinata-lookout',name:'Hinata lookout',island:'kitano',kind:'view',
  says:'Up the trail from the airport to the top of Hinata. You can count the town from there: the harbour office, the red roofs, the green dome of Mount Aoba. Go at the end of the afternoon.',
  checks:[['src/world/airport-district.js','you can count the town'],['src/world/airport-district.js','Hinata lookout']]},
 {id:'airport',name:'Kitano-jima airport',island:'kitano',kind:'travel',
  says:`The commuter plane to Naha goes at ${listed(flights)}. A same-day return is ¥800; Jun checks you in, and check-in closes ten minutes before. If it rains hard they stop the planes, and your ticket keeps.`,
  checks:[['src/island/services.js','Flights are suspended in heavy rain'],['src/people/neighbours.js','checking commuter tickets'],['src/island/services.js','state.yen<800'],['src/island/services.js','closes ten minutes before departure.']]},
 {id:'kiosks',name:'The airport kiosks',island:'kitano',kind:'shop',
  says:'Three kiosks on the plaza: Departure Coffee for a ¥100 coffee, the Noodle Kitchen for a ¥280 lunch, and Island Crafts, with woven souvenirs at ¥400.',
  checks:[['src/world/airport-district-plan.js',"Departure Coffee',item:'Departure coffee',price:100"],['src/world/airport-district-plan.js',"Noodle Kitchen',item:'Airport noodle lunch',price:280"],['src/world/airport-district-plan.js',"Island Crafts',item:'Woven island souvenir',price:400"]]},
 {id:'kitano-hamlet',name:'Kitano hamlet',island:'kitano',kind:'village',
  says:'Three houses on a lane up from the landing. The mayor lives in the first. Grandmother Chinen has the third; she sweeps the lane at half past six and sits at her gate from three. The middle one is to let: ask at the town hall.',
  checks:[['src/world/kitano-hamlet.js','Enquire at the town hall'],['src/people/neighbours.js',"name:'Grandmother Chinen'"],['src/people/neighbours.js','from:H(6,30)'],['src/people/neighbours.js','from:H(15)']]},

 // Johansson Island, beyond Main Street.
 {id:'umi-no-yu',name:'Umi-no-yu',island:'johansson',kind:'bath',
  says:'The sea-water bath. Ten in the morning till ten at night, ¥300 for adults and ¥150 for children. The footbath is free and never closes. Mrs Higa keeps the counter, and has for thirty years.',
  checks:[['src/world/park-onsen.js','Bath 10:00–22:00, adults ¥300, children ¥150'],['src/world/park-onsen.js','The footbath is free and never closes'],['src/avatars/cast.js','has kept the bandai at Umi-no-yu for thirty years']]},
 {id:'aoba',name:'Mount Aoba and the utaki',island:'johansson',kind:'shrine',
  says:'Take the mountain trail up past Aoba Radio, and the path goes round to the top. The utaki up there has no building: the stones, the banyans and the sky are the shrine. Be quiet, love; somebody is usually praying.',
  checks:[['src/world/island-landscape.js','There is no building: the stones, the banyans and the sky are the shrine']]},
 {id:'aoba-radio',name:'Aoba Radio',island:'johansson',kind:'view',
  says:'Aoba Radio, 76.4 FM, on the mountain trail. Go up the stairs to the roof: on clear evenings you can see the lights of Kitano-jima.',
  checks:[['src/world/aoba-radio.js','Aoba Radio, 76.4 FM'],['src/world/aoba-radio.js','On clear evenings the lights of Kitano-jima show']]},
 {id:'fumoto',name:'Fumoto',island:'johansson',kind:'village',
  says:'The farming hamlet at the foot of Mount Aoba. Grandmother Tokashiki keeps the co-op store, the Ishimines make the tofu at dawn, and in the evening old Mr Zukeran plays the sanshin under the gajumaru.',
  checks:[['src/people/neighbours.js','keeping the Fumoto co-op store'],['src/people/neighbours.js','sanshin under the gajumaru'],['src/world/okinawa/fumoto.js','the island tofu the Ishimines make at dawn']]},
 {id:'hoshizaki',name:'Hoshizaki',island:'johansson',kind:'village',
  says:'The fishing village on the far shore. Mina keeps the store, and her island tea is ¥100. They talk about a guesthouse there, but it is only a sign so far. And there is no village bus yet: you walk.',
  checks:[['src/island/play.js','opens when the town completes its visitor programme'],['src/island/play.js','awaits the town development programme'],['src/people/neighbours.js','keeping the village store']]},
 {id:'west-cape',name:'West Cape lighthouse',island:'johansson',kind:'walk',
  says:'The lighthouse at West Cape, at the end of the coast. There is no keeper living there now; somebody checks the lamp at dusk.',
  checks:[['src/world/island-landscape.js','The keeper checks the lamp at dusk']]},
 {id:'oshiro-stand',name:'The Ōshiro honesty stand',island:'johansson',kind:'shop',
  says:'On the coast loop by the Ōshiro farm: gōya at two for ¥100, put your coins in the tin. Nobody watches it. Nobody needs to.',
  checks:[['src/world/island-landscape.js','two for ¥100']]},
]);

export const islandPlaces=island=>ISLAND_PLACES.filter(p=>p.island===island);
export const islandPlace=id=>ISLAND_PLACES.find(p=>p.id===id)||null;
