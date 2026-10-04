/** The future airport city, in Kitano-jima's local frame. Public space stays clear of the runway. */
export const AIRPORT_DISTRICT=Object.freeze({minX:-54,maxX:178,minZ:20,maxZ:132});
export const AIRPORT_TERMINALS=Object.freeze([
 {id:'a',title:'Terminal A · Island Flights',x:-12,z:47},
 {id:'b',title:'Terminal B · Domestic Connections',x:65,z:47},
 {id:'c',title:'Terminal C · Future International',x:135,z:99,construction:true},
]);
// Three shops a traveller needs, spaced along the promenade. Books, post and souvenirs
// that duplicated the town's shops went: the town has its own bookshop and post office.
export const AIRPORT_SHOPS=Object.freeze([
 {title:'Departure Coffee',x:9,z:75,item:'Departure coffee',price:100},
 {title:'Noodle Kitchen',x:51,z:75,item:'Airport noodle lunch',price:280},
 {title:'Island Crafts',x:93,z:75,item:'Woven island souvenir',price:400},
]);
export function airportConstructionAt(x,z,r=0){return x>104-r&&x<173+r&&z>87-r&&z<127+r;}
