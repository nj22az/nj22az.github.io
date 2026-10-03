/** The future airport city, in Kitano-jima's local frame. Public space stays clear of the runway. */
export const AIRPORT_DISTRICT=Object.freeze({minX:-54,maxX:178,minZ:20,maxZ:132});
export const AIRPORT_TERMINALS=Object.freeze([
 {id:'a',title:'Terminal A · Island Flights',x:-12,z:47},
 {id:'b',title:'Terminal B · Domestic Connections',x:65,z:47},
 {id:'c',title:'Terminal C · Future International',x:135,z:99,construction:true},
]);
export const AIRPORT_SHOPS=Object.freeze([
 {title:'Island Books',x:-33,z:75,item:'Airport island paperback',price:350},
 {title:'Blue Strait Tea',x:-12,z:75,item:'Blue Strait tea',price:120},
 {title:'Noodle Kitchen',x:9,z:75,item:'Airport noodle lunch',price:280},
 {title:'Seaside Postcards',x:30,z:75,item:'Kitano-jima postcard set',price:100},
 {title:'Travel Essentials',x:51,z:75,item:'Travel notebook',price:180},
 {title:'Island Crafts',x:72,z:75,item:'Woven island souvenir',price:400},
 {title:'Music & Cassettes',x:93,z:75,item:'Island radio cassette',price:300},
 {title:'Departure Coffee',x:114,z:75,item:'Departure coffee',price:100},
]);
export function airportConstructionAt(x,z,r=0){return x>104-r&&x<173+r&&z>87-r&&z<127+r;}
