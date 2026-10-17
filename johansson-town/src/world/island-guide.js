import {flightTimes,islandState,stamp} from '../island/services.js';

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
 *   says       her answer: a sentence, or a function of what the town has funded (placeSays: the flights and the
 *              coastal bus change when their projects are done, island/services.js)
 *   checks     [file, text] pairs: the text must be in that file
 */
const listed=times=>times.slice(0,-1).join(', ')+' and '+times.at(-1);

export const ISLAND_PLACES=Object.freeze([
 // Kitano-jima: the airport island, across the strait.
 {id:'coral-bay',name:'Coral Bay',island:'kitano',kind:'beach',
  says:'Five minutes down through the palms from the airport, love. White sand and two benches. Plenty of people take the morning boat just for that. Swimming only between the palms, the notice says, and mind the last ferry: it goes after the evening flight.',
  checks:[['src/world/airport-district.js','Swimming between the palms only'],['src/world/airport-district.js','Last ferry to Minato leaves after the evening flight'],['src/world/airport-district.js','Coral Bay, five minutes down through the palms'],['src/world/airport-district.js','Plenty of people come over on the morning ferry just for this']]},
 {id:'coral-bay-bar',name:'Coral Bay Bar',island:'kitano',kind:'shop',
  says:'The little bar on the sand at Coral Bay: a cold bottle of Umineko lager for ¥300, or shikuwasa juice for ¥150. Higa Liquor sends the beer over on our boat.',
  checks:[['src/world/airport-district.js','Umineko lager, cold bottle'],['src/world/airport-district.js','shikuwasa']]},
 {id:'turtle-cove',name:'Turtle Cove',island:'kitano',kind:'beach',
  says:'Over the hill past Hinata, round the east side. Green turtles come in on the rising tide to graze, they say. I have never had the patience to wait for one; you bring a book.',
  checks:[['src/world/airport-district.js','Green turtles come in on the rising tide to graze']]},
 {id:'hinata-lookout',name:'Hinata lookout',island:'kitano',kind:'view',
  says:'Up the trail from the airport to the top of Hinata. You can count the town from there: the harbour office, the red roofs, the green dome of Mount Aoba. Go at the end of the afternoon.',
  checks:[['src/world/airport-district.js','you can count the town'],['src/world/airport-district.js','Hinata lookout']]},
 {id:'airport',name:'Kitano-jima airport',island:'kitano',kind:'travel',
  says:({flights})=>`The commuter plane to Naha goes at ${listed(flights)}. A same-day return is ¥800, at the counter by the departures board; check-in closes ten minutes before. If it rains hard they stop the planes, and your ticket keeps.`,
  checks:[['src/island/services.js','Flights are suspended in heavy rain'],['src/world/island-landscape.js','Airport tickets and check-in'],['src/island/services.js','state.yen<800'],['src/island/services.js','closes ten minutes before departure.']]},
 {id:'kiosks',name:'The airport kiosks',island:'kitano',kind:'shop',
  says:'Three kiosks on the plaza: Departure Coffee for a ¥100 coffee, the Noodle Kitchen for a ¥280 lunch, and Island Crafts, with woven souvenirs at ¥400.',
  checks:[['src/world/airport-district-plan.js',"Departure Coffee',item:'Departure coffee',price:100"],['src/world/airport-district-plan.js',"Noodle Kitchen',item:'Airport noodle lunch',price:280"],['src/world/airport-district-plan.js',"Island Crafts',item:'Woven island souvenir',price:400"]]},
 {id:'kitano-hamlet',name:'Kitano hamlet',island:'kitano',kind:'village',
  says:'Your own lane, Mayor, up from the landing: you know your house better than I do. Across from it the Shiroma house is empty and to let, and the town hall has the key. Grandmother Chinen is next to it; she sweeps the lane at half past six and sits at her gate from three.',
  checks:[['src/world/kitano-hamlet.js','Enquire at the town hall'],['src/world/kitano-hamlet.js','Go home'],['src/people/neighbours.js',"name:'Grandmother Chinen'"],['src/people/neighbours.js','from:H(6,30)'],['src/people/neighbours.js','from:H(15)']]},

 // Johansson Island, beyond Main Street.
 {id:'umi-no-yu',name:'Umi-no-yu',island:'johansson',kind:'bath',
  says:'The sea-water bath in Harbour Park, opposite Sakura. Follow the broad paving across the open park to its door. Ten in the morning till ten at night, ¥300 for adults and ¥150 for children. The footbath is free and never closes. Grandmother Higa owns it and keeps the counter in the afternoon; her granddaughter, Miss Higa, has it in the evenings.',
  checks:[['src/world/island-plan.js','The park opposite Sakura: Umi-no-yu'],['src/world/park.js','Follow the broad paving to the bathhouse'],['src/world/park-onsen.js','Bath 10:00–22:00, adults ¥300, children ¥150'],['src/world/park-onsen.js','The footbath is free and never closes'],['src/people/cast.js','owns Umi-no-yu and Higa Liquor'],['src/people/cast.js','keeps the bandai at Umi-no-yu in the evenings']]},
 {id:'aoba',name:'Mount Aoba and the utaki',island:'johansson',kind:'shrine',
  says:'Take the mountain trail as far as Aoba Radio, and the path goes round from there to the top. The utaki up there has no building: the stones, the banyans and the sky are the shrine. Somebody leaves incense burning there before dawn, so be quiet if you are early.',
  checks:[['src/world/island-landscape.js','There is no building: the stones, the banyans and the sky are the shrine'],['src/world/island-landscape.js','A thread of incense is still burning: somebody came up before dawn']]},
 {id:'aoba-radio',name:'Aoba Radio',island:'johansson',kind:'view',
  says:'Aoba Radio, 76.4 FM, on the mountain trail. Go up the stairs to the roof: on clear evenings you can see the lights of Kitano-jima.',
  checks:[['src/world/aoba-radio.js','Aoba Radio, 76.4 FM'],['src/world/aoba-radio.js','On clear evenings the lights of Kitano-jima show']]},
 {id:'fumoto',name:'Fumoto',island:'johansson',kind:'village',
  says:'The farming hamlet at the foot of Mount Aoba. Nobody lives there now: the cane fields are still there, the four houses are to let, and the co-op store is shut. Bring what you need from town.',
  checks:[['src/people/cast.js',"closed:'Fumoto stays as fields'"],['src/world/okinawa/fumoto.js','Nobody lives here now; the fields are still here and the houses are to let'],['src/world/okinawa/fumoto.js','Try the co-op store’s door']]},
 {id:'hoshizaki',name:'Hoshizaki',island:'johansson',kind:'village',
  says:({bus})=>`The fishing village on the far shore. The village store is shut now, so bring your own tea. They talk about a guesthouse there, but it is only a sign so far. ${bus?'The coastal bus runs out there now, from the Harbour Line stop, and there is no fare.':'And there is no village bus yet: you walk.'}`,
  checks:[['src/island/play.js','opens when the town completes its visitor programme'],['src/island/play.js','awaits the town development programme'],['src/island/play.js','Town-funded service; no fare.'],['src/world/island-landscape.js','Hoshizaki General Store · closed']]},
 {id:'west-cape',name:'West Cape lighthouse',island:'johansson',kind:'walk',
  says:'The lighthouse at West Cape, on the western coast road. The keeper checks the lamp at dusk, the log says. It is a fine walk at the end of the day.',
  checks:[['src/world/island-landscape.js','The keeper checks the lamp at dusk']]},
 {id:'oshiro-stand',name:'The Ōshiro honesty stand',island:'johansson',kind:'shop',
  says:'On the coast loop by the Ōshiro farm: gōya at two for ¥100, put your coins in the tin. Nobody watches it. Nobody needs to.',
  checks:[['src/world/island-landscape.js','two for ¥100']]},
]);

export const islandPlaces=island=>ISLAND_PLACES.filter(p=>p.island===island);
/** Her answer for a place, with what the town has funded (state: the player's saved state, or {} for none). */
export function placeSays(place,state={}){
 if(typeof place.says!=='function')return place.says;
 return place.says({flights:flightTimes(state).map(stamp),bus:islandState(state).projects.includes('bus')});
}
export const islandPlace=id=>ISLAND_PLACES.find(p=>p.id===id)||null;
