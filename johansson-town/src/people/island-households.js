/**
 * Everybody on the island, where they live and what they do.
 *
 * The town's people come from several places in the code: the walking residents
 * (residents.js), the neighbours who keep to their spot (neighbours.js), the bandai at
 * the onsen, and the class and their teacher at the town hall (classroom.js). This is
 * the one list that says, for each of them, which door is theirs and why they are here,
 * so that nobody in the town is just standing about (docs/AMPLIFY-AUDIT.md, §12).
 *
 * `home` is a building that exists on the island: a plot id in okinawa/layout.js
 * (Nishi-machi, the east-back houses, the shop-houses, Kitahama), a site id (the yard
 * houses, the koban, the harbour office), or 'town-hall'. Shop-house families live above
 * the shop. Nobody lives off the island; the ferry brings visitors and freight.
 */
export const ISLAND_HOUSEHOLDS=Object.freeze([
 // The town hall and the harbour.
 {home:'town-hall',address:'Town hall, east wing',members:[['Johansson','mayor of Minato-chō; lives over the shop, as he says, beside the community centre and the power house']]},
 {home:'office',address:'Harbour office (the bed behind the screen)',members:[['Harbour master','runs the harbour office and the moorings']]},
 {home:'clinic',address:'The doctor’s flat behind the town hall clinic',members:[['Dr Kakazu','the island doctor: posted from Naha for two years, surgery at the town hall clinic, on call at night']]},
 // The town ferry: her chief engineer lives aboard (people/ferry-crew.js).
 {home:'ferry',address:'Aboard the Minato Maru (the chief engineer’s cabin)',members:[['Mr Nakandakari','chief engineer of the Minato Maru; came from the Naha cargo boats']]},
 {home:'koban',address:'Minato police box',members:[['Officer Mori','the island’s police officer: desk from four, night patrol']]},
 // The Front-Row yard.
 {home:'resident-home-aya',address:'1 Front-Row Yard',members:[['Nhung','bookshop assistant'],['Reiko','edits the evening paper']]},
 {home:'resident-home-kenji',address:'2 Front-Row Yard',members:[['Chin','repairman at the workshop'],['Tetsuo','radio repairer']]},
 // Kitahama, the new lane on the north-east land.
 {home:'market',address:'The flat over Sakura Shōten',members:[['Grandmother Sakurai','owns Sakura Shōten, which her parents opened in 1963; does the books on Sundays and minds the shop when Thuan is at the auction']]},
 {home:'kitahama-1',address:'1 Kitahama',members:[['Thuan','keeps Sakura Shōten for the Sakurai family'],['Thao','runs Minato Izakaya']]},
 {home:'kitahama-2',address:'2 Kitahama',members:[['Mrs Sato','cooks at Sato Ramen; buys fish at the morning auction']]},
 {home:'kitahama-3',address:'3 Kitahama',members:[['Kōji','sorts the catch at the fish auction; crews on the Ōshiro boat; the ferry’s relief deck hand on Ms Uezu’s week off']]},
 {home:'kitahama-4',address:'4 Kitahama',members:[['Postman Tōma','runs the post office and the round: collections 10:30 and 16:30']]},
 {home:'kitahama-5',address:'5 Kitahama',members:[],toLet:true},
 // The residential quarter west of the cross lane (docs/RESIDENTIAL-PLAN.md).
 {home:'kitahama-6',address:'6 Kitahama',members:[['Grandfather Taira','retired cane farmer; leads the Kitahama cane cut every January'],['Grandmother Taira','weaves bashōfu cloth on the verandah loom']]},
 {home:'kitahama-7',address:'7 Kitahama',members:[['Mr Chinen','drives the island water lorry'],['Mrs Chinen','nurse at the town hall clinic']]},
 {home:'kitahama-8',address:'8 Kitahama',members:[['Ms Uezu','deck hand and bosun on the Minato Maru, a week on (living aboard) and a week off']]},
 {home:'kitahama-9',address:'9 Kitahama',members:[['Grandmother Gushiken','teaches the sanshin on her verandah on Saturday mornings']]},
 {home:'kitahama-10',address:'10 Kitahama',members:[['Mr Tamashiro','retired; grows goya and papaya over the wall'],['Mrs Tamashiro','retired; runs the lane’s rubbish rota and the notice board']]},
 {home:'kitahama-11',address:'11 Kitahama',members:[['Mr Iha','electrician at the power station; mends the lane lights']]},
 {home:'kitahama-12',address:'12 Kitahama',members:[['Mrs Kohagura','cuts hair in her front room, Tuesday to Saturday']]},
 {home:'kitahama-flats',address:'Kitahama Heights, Fukugi Lane',members:[['Ms Ganaha','sells the Minato Maru’s tickets at the Port Terminal window (flat 1)'],['Mr Higa Jr','the Nishi-machi Higas’ eldest; oiler on the Minato Maru, after his time at Mr Ōshiro’s boatyard (flat 2)'],['Mr Fujita','retired fisherman (flat 3); found most days in his shed on the pier, and takes the ferry’s bow line at every call']]},
 // Nishi-machi, inside the seawall.
 {home:'higa',address:'Higa house, Nishi-machi',members:[['Grandmother Higa','retired; keeps the verandah and knows every ferry by its horn'],['Mrs Higa','the bandai at Umi-no-yu'],["Higa Kenta","pupil, Years 5–6"]]},
 {home:'kinjo',address:'Kinjō house, Nishi-machi',members:[['Uncle Kinjō','retired fisherman; fishes off the seawall'],['Mrs Kinjō','runs the florist on Rainflower Lane and keeps the family accounts'],["Kinjo Yui","pupil, Years 5–6"]]},
 {home:'oshiro',address:'Ōshiro house, Nishi-machi',members:[['Mr Ōshiro','fisherman; builds and mends sabani'],["Oshiro Sakura","pupil, Years 5–6"]]},
 // Behind the east row.
 {home:'nakasone',address:'Nakasone house, east back',members:[['Mr Nakasone','retired; gateball and the sanshin'],["Nakasone Taku","pupil, Years 5–6"]]},
 {home:'miyagi',address:'Miyagi house, east back',members:[['Mrs Miyagi','the oldest on the island; keeps the utaki'],["Miyagi Daiki","pupil, Years 5–6 (her great-grandson)"]]},
 {home:'tamaki',address:'Tamaki house, east back',members:[['Mr Tamaki','runs the ice plant on the east quay'],["Tamaki Miyu","pupil, Years 5–6"]]},
 {home:'kamiya',address:'Kamiya house, east back',members:[['Mrs Kamiya','retired post-office clerk; gateball every afternoon']]},
 // Above the shops.
 {home:'nakamura',address:"Above Nakamura Zenzai",members:[['Mrs Nakamura','makes shaved ice and zenzai'],["Nakamura Mai","pupil, Years 5–6"]]},
 {home:'shimabukuro',address:'Above the post office',members:[['Mr Shimabukuro','runs the power station at the town hall']]},
 {home:'arakaki',address:"Above Aragaki Confectionery Store",members:[['Mr Arakaki','gateball referee; fries the sata andagi at dawn'],["Arakaki Ryo","pupil, Years 5–6"]]},
 {home:'yonamine',address:"Above Yonamine Fresh Fish Store",members:[['Mrs Yonamine','sells fish from the morning boats'],['Yonamine-sensei',"teaches the Years 5–6 at the town hall"]]},
].map(h=>Object.freeze({...h,members:Object.freeze(h.members.map(([name,purpose])=>Object.freeze({name,purpose})))})));

export const householdAtHome=id=>ISLAND_HOUSEHOLDS.find(h=>h.home===id)||null;
/** A nameplate's "who lives here" line. */
export function residentsLine(id){
 const h=householdAtHome(id);if(!h)return '';
 if(h.toLet)return 'Nobody lives here yet. The board on the gate says to ask at the town hall.';
 return 'Lives here: '+h.members.map(m=>m.name+' ('+m.purpose+')').join('; ')+'.';
}
