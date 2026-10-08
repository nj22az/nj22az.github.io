/** Thuan’s own long-sleeved island sailor set. */
export const THUAN_SAILOR_OUTFIT=Object.freeze({top:'sailorlong',topColour:'#283760',bottom:'pleatedskirt',bottomColour:'#283760',footwear:'boots',shoes:'#30292b',accent:'#c64951',pattern:'none',hat:'none'});
/** Photo-inspired clothing, shared independently of the character's appearance. */
export const HARBOUR_POLO_OUTFIT=Object.freeze({top:'contrastpolo',topColour:'#202d50',accent:'#f2eee5',bottom:'pleatedskirt',bottomColour:'#d9cfba',footwear:'shoes',shoes:'#eee9df',pattern:'none',hat:'none'});
/** Original island wardrobe sets; faces, body proportions, hair and hats stay independent. */
export const ISLAND_OUTFITS=Object.freeze([
 {name:'Harbour polo and cream pleats',outfit:HARBOUR_POLO_OUTFIT},
 {name:'Harbour academy sailor',outfit:THUAN_SAILOR_OUTFIT},
 {name:'Minato police uniform',outfit:{top:'police',topColour:'#273858',bottom:'trousers',bottomColour:'#273858',footwear:'shoes',shoes:'#25262d',accent:'#c7ad64',pattern:'none',hat:'police',hatColour:'#273858'}},
 {name:'Cape café bow blouse',outfit:{top:'blouse',topColour:'#f2dfc5',bottom:'pleatedskirt',bottomColour:'#667d86',footwear:'shoes',shoes:'#543e34',accent:'#94525c',pattern:'none'}},
 {name:'Harbour Sunday jacket',outfit:{top:'jacket',topColour:'#486874',bottom:'trousers',bottomColour:'#3f4951',footwear:'shoes',shoes:'#4e3931',accent:'#f1e7cf',pattern:'none'}},
 {name:'Rainflower knitted layers',outfit:{top:'cardigan',topColour:'#718b68',bottom:'longskirt',bottomColour:'#956c59',footwear:'boots',shoes:'#554237',accent:'#f1dfbb',pattern:'none'}},
 {name:'Harbour day shift',outfit:{top:'overalls',topColour:'#f4f1ea',bottom:'widepants',bottomColour:'#476a79',footwear:'boots',shoes:'#473b2f',accent:'#dabb55',pattern:'none'}},
 {name:'Sea-school sailor',outfit:{top:'sailor',topColour:'#f4f1ea',bottom:'pleatedskirt',bottomColour:'#27304d',footwear:'shoes',shoes:'#2b2b2b',accent:'#2f5f9e',pattern:'none'}},
 {name:'Wildflower Sunday',outfit:{top:'sundress',topColour:'#e98aa6',bottom:'longskirt',bottomColour:'#e98aa6',footwear:'sandals',shoes:'#8a5a2e',accent:'#f4f1ea',pattern:'flowers'}},
 {name:'Raincloud rambler',outfit:{top:'hoodie',topColour:'#7fb0d8',bottom:'cropped',bottomColour:'#6d7478',footwear:'sneakers',shoes:'#f4f1ea',accent:'#f4d23c',pattern:'none'}},
 {name:'Bookshop afternoon',outfit:{top:'cardigan',topColour:'#9a6a42',bottom:'culottes',bottomColour:'#c8b48a',footwear:'shoes',shoes:'#473b2f',accent:'#e0c078',pattern:'none'}},
 {name:'Island festival coat',outfit:{top:'festival',topColour:'#2f5f9e',bottom:'shorts',bottomColour:'#27304d',footwear:'sandals',shoes:'#c8b48a',accent:'#f4f1ea',pattern:'none'}},
 {name:'Cloud café uniform',outfit:{top:'blouse',topColour:'#b2a2ce',bottom:'pleatedskirt',bottomColour:'#58687b',footwear:'shoes',shoes:'#f4f1ea',accent:'#f4f1ea',pattern:'none'}},
]);

/** Town-made festival costumes. Headwear is chosen separately so the face stays visible. */
export const ISLAND_COSTUMES=Object.freeze([
 {name:'Aoba lighthouse keeper',outfit:{top:'lighthouse',topColour:'#f4f1ea',bottom:'trousers',bottomColour:'#f4f1ea',footwear:'boots',shoes:'#d8342c',accent:'#d8342c',pattern:'none'}},
 {name:'Harbour lantern sprite',outfit:{top:'lantern',topColour:'#e8742a',bottom:'cropped',bottomColour:'#27304d',footwear:'sandals',shoes:'#9a6a42',accent:'#f4d23c',pattern:'none'}},
 {name:'Reef ribbon explorer',outfit:{top:'reef',topColour:'#3fa0c8',bottom:'trousers',bottomColour:'#3fa0c8',footwear:'boots',shoes:'#2f5f9e',accent:'#e98aa6',pattern:'none'}},
]);

export const DRESS_BOTTOMS=Object.freeze(['skirt','longskirt','pleatedskirt']);
export function outfitAllowedFor(name,outfit){return name!=='Johansson'||(outfit.top!=='sundress'&&!DRESS_BOTTOMS.includes(outfit.bottom));}
export function appropriateOutfit(name,outfit){return name==='Johansson'?{...outfit,top:outfit.top==='sundress'?'kariyushi':outfit.top,bottom:DRESS_BOTTOMS.includes(outfit.bottom)?'trousers':outfit.bottom}:{...outfit};}
