/**
 * Everybody on the island, where they live and what they do.
 *
 * The town's people come from several places in the code: the walking residents
 * (residents.js), the neighbours who keep to their spot (neighbours.js), the bandai at
 * the onsen, and the class and their teacher at the town hall (classroom.js). This is
 * the one list that says, for each of them, which door is theirs and why they are here,
 * so that nobody in the town is just standing about (docs/AMPLIFY-AUDIT.md, §12).
 *
 * `home` is a building that exists on the peninsula: a plot id in okinawa/layout.js
 * (Nishi-machi, the east-back houses, the shop-houses, Kitahama), a site id (the yard
 * houses, the koban, the harbour office), or 'town-hall'. Shop-house families live above
 * the shop. Nobody lives off the island; the ferry brings visitors and freight.
 */
export const ISLAND_HOUSEHOLDS=Object.freeze([
 // The town hall and the harbour.
 {home:'town-hall',address:'Town hall, east wing',members:[['Johansson','mayor of Minato-chō; lives over the shop, as he says, beside the community centre and the power house']]},
 {home:'office',address:'Harbour office (the bed behind the screen)',members:[['Harbour master','runs the harbour office and the moorings']]},
 {home:'koban',address:'Minato police box',members:[['Officer Mori','the island’s police officer: desk from four, night patrol']]},
 // The Front-Row yard.
 {home:'resident-home-aya',address:'1 Front-Row Yard',members:[['Aya','bookshop assistant'],['Reiko','edits the evening paper']]},
 {home:'resident-home-kenji',address:'2 Front-Row Yard',members:[['Kenji','repairman at the workshop'],['Tetsuo','radio repairer']]},
 // Kitahama, the new lane on the north-east land.
 {home:'kitahama-1',address:'1 Kitahama',members:[['Thuan','keeps Sakura Shōten'],['Nao','runs Minato Izakaya']]},
 {home:'kitahama-2',address:'2 Kitahama',members:[['Mrs Sato','cooks at Sato Ramen; buys fish at the morning auction']]},
 {home:'kitahama-3',address:'3 Kitahama',members:[['Kōji','sorts the catch at the fish auction; crews on the Ōshiro boat']]},
 {home:'kitahama-4',address:'4 Kitahama',members:[['Postman Tōma','runs the post office and the round: collections 10:30 and 16:30']]},
 {home:'kitahama-5',address:'5 Kitahama',members:[],toLet:true},
 // Nishi-machi, inside the seawall.
 {home:'higa',address:'Higa house, Nishi-machi',members:[['Grandmother Higa','retired; keeps the verandah and knows every ferry by its horn'],['Mrs Higa','the bandai at Umi-no-yu'],['比嘉 けんた','pupil, 5・6年']]},
 {home:'kinjo',address:'Kinjō house, Nishi-machi',members:[['Uncle Kinjō','retired fisherman; fishes off the seawall'],['Mrs Kinjō','keeps house and the family accounts'],['金城 ゆい','pupil, 5・6年']]},
 {home:'oshiro',address:'Ōshiro house, Nishi-machi',members:[['Mr Ōshiro','fisherman; builds and mends sabani'],['大城 さくら','pupil, 5・6年']]},
 // Behind the east row.
 {home:'nakasone',address:'Nakasone house, east back',members:[['Mr Nakasone','retired; gateball and the sanshin'],['仲宗根 たく','pupil, 5・6年']]},
 {home:'miyagi',address:'Miyagi house, east back',members:[['Mrs Miyagi','the oldest on the island; keeps the utaki'],['宮城 だいき','pupil, 5・6年 (her great-grandson)']]},
 {home:'tamaki',address:'Tamaki house, east back',members:[['Mr Tamaki','runs the ice plant on the east quay'],['玉城 みゆ','pupil, 5・6年']]},
 {home:'kamiya',address:'Kamiya house, east back',members:[['Mrs Kamiya','retired post-office clerk; gateball every afternoon']]},
 // Above the shops.
 {home:'nakamura',address:'Above 仲村ぜんざい',members:[['Mrs Nakamura','makes shaved ice and zenzai'],['仲村 まい','pupil, 5・6年']]},
 {home:'shimabukuro',address:'Above the post office',members:[['Mr Shimabukuro','runs the power station at the town hall']]},
 {home:'arakaki',address:'Above 新垣菓子店',members:[['Mr Arakaki','gateball referee; fries the sata andagi at dawn'],['新垣 りょう','pupil, 5・6年']]},
 {home:'yonamine',address:'Above 与那嶺鮮魚店',members:[['Mrs Yonamine','sells fish from the morning boats'],['Yonamine-sensei','teaches the 5・6年 at the town hall']]},
].map(h=>Object.freeze({...h,members:Object.freeze(h.members.map(([name,purpose])=>Object.freeze({name,purpose})))})));

/** Where somebody lives, or null. */
export const homeOf=name=>ISLAND_HOUSEHOLDS.find(h=>h.members.some(m=>m.name===name))||null;
/** What somebody does. */
export const purposeOf=name=>homeOf(name)?.members.find(m=>m.name===name)?.purpose||null;
/** The household at a home id. */
export const householdAtHome=id=>ISLAND_HOUSEHOLDS.find(h=>h.home===id)||null;
/** A nameplate's "who lives here" line. */
export function residentsLine(id){
 const h=householdAtHome(id);if(!h)return '';
 if(h.toLet)return 'Nobody lives here yet. The board on the gate says to ask at the town hall.';
 return 'Lives here: '+h.members.map(m=>m.name+' ('+m.purpose+')').join('; ')+'.';
}
