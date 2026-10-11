/** Thuan’s own long-sleeved island sailor set. */
export const THUAN_SAILOR_OUTFIT=Object.freeze({top:'sailorlong',topColour:'#283760',bottom:'pleatedskirt',bottomColour:'#283760',footwear:'boots',shoes:'#30292b',accent:'#c64951',pattern:'none',hat:'none'});
/** Photo-inspired clothing, shared independently of the character's appearance. */
export const HARBOUR_POLO_OUTFIT=Object.freeze({top:'contrastpolo',topColour:'#202d50',accent:'#f2eee5',bottom:'pleatedskirt',bottomColour:'#d9cfba',footwear:'shoes',shoes:'#eee9df',pattern:'none',hat:'none'});
/**
 * Original island wardrobe sets; faces, body proportions, hair and hats stay independent. A set is put on over what someone
 * wears ({...outfit,...set.outfit}), so a field it leaves out stays as it was. Every set has a purpose (CLAUDE.md: "Nothing
 * is random"): `who` on the island wears it and `why`; `category` files it in the maker's Outfits tab, `label` is the
 * short name under its picture (wardrobe-catalogue.js), `tags` are the places and occasions a search finds it by, and
 * `colourways` are its real colour variants (the first is the one in `outfit`). Ids are appended, never renamed.
 */
export const ISLAND_OUTFITS=Object.freeze([
 {id:'harbour-polo',name:'Harbour polo and cream pleats',label:'Harbour polo',category:'Everyday',tags:['ferry','harbour','polo','pleats'],
  who:'the harbour visitor off the ferry; Thuan on her days off',why:'A navy polo with a cream collar over cream pleats: smart on the ferry deck, cool on the quay.',outfit:HARBOUR_POLO_OUTFIT},
 {id:'academy-sailor',name:'Harbour academy sailor',label:'Academy sailor',category:'Everyday',tags:['sailor','navy','Thuan’s wardrobe'],
  who:'Thuan, from her own wardrobe',why:'Her navy sailor set with long sleeves, a red necktie and ankle boots, for the cooler days.',outfit:THUAN_SAILOR_OUTFIT},
 {id:'police-uniform',name:'Minato police uniform',label:'Police uniform',category:'Work',tags:['police','officer','patrol','uniform'],
  who:'Officer Mori, at the desk from four and on night patrol',why:'The island police officer’s navy uniform and cap, so anyone can find him.',outfit:{top:'police',topColour:'#273858',bottom:'trousers',bottomColour:'#273858',footwear:'shoes',shoes:'#25262d',accent:'#c7ad64',pattern:'none',hat:'police',hatColour:'#273858'}},
 {id:'cape-cafe-blouse',name:'Cape café bow blouse',label:'Bow blouse',category:'Everyday',tags:['occasion','wedding','parents’ day','school'],
  who:'Yonamine-sensei on parents’ day; Mrs Higa at a wedding',why:'A cream blouse with a bow at the collar over soft pleats: dressed up for the day, and still cool.',outfit:{top:'blouse',topColour:'#f2dfc5',bottom:'pleatedskirt',bottomColour:'#667d86',footwear:'shoes',shoes:'#543e34',accent:'#94525c',pattern:'none'}},
 {id:'sunday-jacket',name:'Harbour Sunday jacket',label:'Sunday jacket',category:'Everyday',tags:['Sunday','ferry','main island','radio parts'],
  who:'Tetsuo on the Sunday ferry to the main island, for radio parts',why:'A light jacket for the ferry saloon’s air-conditioning and a day in town.',outfit:{top:'jacket',topColour:'#486874',bottom:'trousers',bottomColour:'#3f4951',footwear:'shoes',shoes:'#4e3931',accent:'#f1e7cf',pattern:'none'}},
 {id:'knitted-layers',name:'Rainflower knitted layers',label:'Knitted layers',category:'Everyday',tags:['Rainflower Lane','florist','January','winter','cardigan'],
  who:'Mrs Kinjō opening Rainflower Florist on January mornings',why:'January’s north wind is cold on the lane: a cardigan over a long skirt, and boots for the florist’s wet floor.',outfit:{top:'cardigan',topColour:'#718b68',bottom:'longskirt',bottomColour:'#956c59',footwear:'boots',shoes:'#554237',accent:'#f1dfbb',pattern:'none'}},
 {id:'harbour-day-shift',name:'Harbour day shift',label:'Harbour day shift',category:'Work',tags:['cargo yard','quay','overalls','crates','catch'],
  who:'Riku checking the cargo yard; Haru sorting the village catch',why:'Overalls and boots for the quay, where the crates are heavy and the concrete is always wet.',outfit:{top:'overalls',topColour:'#f4f1ea',bottom:'widepants',bottomColour:'#476a79',footwear:'boots',shoes:'#473b2f',accent:'#dabb55',pattern:'none'}},
 {id:'sea-school-sailor',name:'Sea-school sailor',label:'Sea-school sailor',category:'School & sport',tags:['school','high school','uniform','ferry'],
  who:'Vy and Hana, on the ferry to the high school',why:'The high school’s summer sailor uniform.',outfit:{top:'sailor',topColour:'#f4f1ea',bottom:'pleatedskirt',bottomColour:'#27304d',footwear:'shoes',shoes:'#2b2b2b',accent:'#2f5f9e',pattern:'none'}},
 {id:'wildflower-sunday',name:'Wildflower Sunday',label:'Wildflower Sunday',category:'Everyday',tags:['Sunday','summer','dress','beach','Kitahama'],
  who:'Emi, in a sundress she sewed herself',why:'The coolest thing to wear on a hot Sunday, with sandals for the walk to Kitahama.',outfit:{top:'sundress',topColour:'#e98aa6',bottom:'longskirt',bottomColour:'#e98aa6',footwear:'sandals',shoes:'#8a5a2e',accent:'#f4f1ea',pattern:'flowers'}},
 {id:'raincloud-rambler',name:'Raincloud rambler',label:'Raincloud rambler',category:'Everyday',tags:['rain','rainy season','tsuyu','hood','June'],
  who:'Kenta and the Cold-storage kid on rainy-season mornings',why:'A hood up for the showers of May and June, and hems clear of the puddles.',outfit:{top:'hoodie',topColour:'#7fb0d8',bottom:'cropped',bottomColour:'#6d7478',footwear:'sneakers',shoes:'#f4f1ea',accent:'#f4d23c',pattern:'none'}},
 {id:'bookshop-afternoon',name:'Bookshop afternoon',label:'Bookshop afternoon',category:'Work',tags:['Front-Row Books','bookshop','stationery','shop'],
  who:'Nhung at Front-Row Books & Stationery',why:'A cardigan for the air-conditioned shop, culottes for the ladder to the top shelves.',outfit:{top:'cardigan',topColour:'#9a6a42',bottom:'culottes',bottomColour:'#c8b48a',footwear:'shoes',shoes:'#473b2f',accent:'#e0c078',pattern:'none'}},
 {id:'festival-coat',name:'Island festival coat',label:'Festival coat',category:'Festival',tags:['happi','eisa','tug-of-war','Obon','andagi','steward'],
  who:'the stewards at the eisa night and the tug-of-war; Mr Arakaki at the andagi stall',why:'A happi coat shows who is helping to run the festival.',outfit:{top:'festival',topColour:'#2f5f9e',bottom:'shorts',bottomColour:'#27304d',footwear:'sandals',shoes:'#c8b48a',accent:'#f4f1ea',pattern:'none'}},
 {id:'cloud-cafe-uniform',name:'Cloud café uniform',label:'Café uniform',category:'Work',tags:['Blue Coral','ice cream','Rainflower Lane','counter'],
  who:'the attendant at Blue Coral, the island’s only ice-cream shop',why:'A lilac blouse and slate pleats behind the counter, white shoes for the shop floor.',outfit:{top:'blouse',topColour:'#b2a2ce',bottom:'pleatedskirt',bottomColour:'#58687b',footwear:'shoes',shoes:'#f4f1ea',accent:'#f4f1ea',pattern:'none'}},
 // Batch 1 of the Minato Machi wardrobe plan (2026-10-11): eight sets made only from parts that already exist, every
 // colour from the island palette (character-style.md §6).
 {id:'shop-counter-smock',name:'Shop counter smock',label:'Shop counter smock',category:'Work',tags:['Sakura Shōten','shop','konbini','shaved ice','kakigōri','zenzai','counter'],
  who:'Grandmother Sakurai minding Sakura Shōten; Mrs Nakamura at her shaved-ice stall',why:'The sleeved smock keeps syrup and dust off everyday clothes.',
  outfit:{top:'smock',topColour:'#f4f1ea',bottom:'widepants',bottomColour:'#6e4a33',footwear:'sandals',shoes:'#6e4a33',hat:'kerchief',hatColour:'#2f4f7f',accent:'#2f4f7f',pattern:'none'}},
 // Boots for now: the set moves to the market gumboots when they are made (the plan's batch 5).
 {id:'morning-boats',name:'Morning boats',label:'Morning boats',category:'Work',tags:['fish auction','auction','quay','dawn','boats','fishing','sabani'],
  who:'Kōji at the auction, Mr Ōshiro and Masaru',why:'Boots and a cap for the hosed-down quay at dawn.',
  outfit:{top:'tee',topColour:'#8cc4b4',bottom:'trousers',bottomColour:'#2f4f7f',footwear:'boots',shoes:'#f4f1ea',hat:'cap',hatColour:'#27304d',accent:'#e8b83e',pattern:'none'}},
 // Our own plain uniform: no postal mark.
 {id:'post-round',name:'Post round',label:'Post round',category:'Work',tags:['post office','post','mail','letters','round','uniform'],
  who:'Postman Tōma (collections at 10:30 and 16:30) and Naoko',why:'A light summer uniform for a round on foot.',
  outfit:{top:'polo',topColour:'#8fbfe0',bottom:'trousers',bottomColour:'#27304d',footwear:'shoes',shoes:'#2b2b2b',hat:'cap',hatColour:'#27304d',accent:'#f4f1ea',pattern:'none'}},
 {id:'ramen-kitchen',name:'Ramen kitchen',label:'Ramen kitchen',category:'Work',tags:['Sato Ramen','ramen','kitchen','cook','stove','noodles'],
  who:'Mrs Sato at Sato Ramen',why:'Hair covered and a white apron at the stove.',
  outfit:{top:'apron',topColour:'#f4f1ea',bottom:'trousers',bottomColour:'#2b2b2b',footwear:'shoes',shoes:'#2b2b2b',hat:'kerchief',hatColour:'#2f4f7f',accent:'#c8473a',pattern:'none'}},
 // Boots for now, like Morning boats: gumboots in the plan's batch 5.
 {id:'cold-store',name:'Cold store in August',label:'Cold store',category:'Work',tags:['ice plant','ice','cold room','east quay','August','beanie'],
  who:'Mr Tamaki and the Cold-storage kid',why:'The ice plant’s cold room is far below freezing, so they are the only two islanders in a beanie in August.',
  outfit:{top:'hoodie',topColour:'#6d7478',bottom:'trousers',bottomColour:'#27304d',footwear:'boots',shoes:'#f4f1ea',hat:'beanie',hatColour:'#27304d',accent:'#8cc4b4',pattern:'none'}},
 {id:'gateball-afternoon',name:'Gateball afternoon',label:'Gateball afternoon',category:'School & sport',tags:['gateball','court','seawall','elders','afternoon','sport'],
  who:'Mr Nakasone and Mrs Kamiya; Mr Arakaki referees',why:'Every afternoon on the court by the seawall.',
  outfit:{top:'polo',topColour:'#f4f1ea',bottom:'trousers',bottomColour:'#c9b68c',footwear:'sneakers',shoes:'#f4f1ea',hat:'straw',hatColour:'#e3d4b0',accent:'#c8473a',pattern:'none'}},
 // The three crews of the Haarii races (9 June 1997), one colourway each; the headband is white for all of them.
 {id:'haarii-crew',name:'Haarii crew',label:'Haarii crew',category:'Festival',tags:['haarii','boat race','sabani','rowing','June','Minato','Kitahama','Nishi-machi'],
  who:'Kōji, Daichi and Kenta rowing for Minato on 9 June (the crew is proposed)',why:'Bare feet on the sabani, a headband for the sweat.',
  outfit:{top:'tee',topColour:'#c8473a',bottom:'shorts',bottomColour:'#27304d',footwear:'barefoot',hat:'headband',hatColour:'#f4f1ea',pattern:'none'},
  colourways:[{name:'Minato',colours:{topColour:'#c8473a',bottomColour:'#27304d'}},{name:'Kitahama',colours:{topColour:'#4f7a4f',bottomColour:'#e3d4b0'}},{name:'Nishi-machi',colours:{topColour:'#3a9cb8',bottomColour:'#f4f1ea'}}]},
 {id:'walk-to-school',name:'Walk to school',label:'Walk to school',category:'School & sport',tags:['school','pupils','children','Years 5–6','yellow hat','walk'],
  who:'the pupils of Yonamine-sensei’s Years 5–6 class',why:'The yellow hat lets drivers see small children.',
  outfit:{top:'tee',topColour:'#f4f1ea',bottom:'shorts',bottomColour:'#27304d',footwear:'sneakers',shoes:'#f4f1ea',hat:'bucket',hatColour:'#e8b83e',pattern:'none'}},
]);

/** Town-made costumes for the Port Festival parade. Headwear is chosen separately so the face stays visible. */
export const ISLAND_COSTUMES=Object.freeze([
 {id:'lighthouse-keeper',name:'Aoba lighthouse keeper',label:'Lighthouse keeper',category:'Costume',tags:['costume','parade','Port Festival','children','lighthouse'],
  who:'children in the Port Festival parade (proposed)',why:'The white lighthouse on the breakwater head with its red lamp: the harbour’s landmark.',outfit:{top:'lighthouse',topColour:'#f4f1ea',bottom:'trousers',bottomColour:'#f4f1ea',footwear:'boots',shoes:'#d8342c',accent:'#d8342c',pattern:'none'}},
 {id:'lantern-sprite',name:'Harbour lantern sprite',label:'Lantern sprite',category:'Costume',tags:['costume','parade','Port Festival','children','Obon','lantern'],
  who:'children in the Port Festival parade (proposed)',why:'The lanterns hung along the quay on the last night of Obon.',outfit:{top:'lantern',topColour:'#e8742a',bottom:'cropped',bottomColour:'#27304d',footwear:'sandals',shoes:'#9a6a42',accent:'#f4d23c',pattern:'none'}},
 {id:'reef-explorer',name:'Reef ribbon explorer',label:'Reef explorer',category:'Costume',tags:['costume','parade','Port Festival','children','reef','Kitahama'],
  who:'children in the Port Festival parade (proposed)',why:'The coral reef off Kitahama, in ribbons, so nobody forgets it is there.',outfit:{top:'reef',topColour:'#3fa0c8',bottom:'trousers',bottomColour:'#3fa0c8',footwear:'boots',shoes:'#2f5f9e',accent:'#e98aa6',pattern:'none'}},
]);

export const DRESS_BOTTOMS=Object.freeze(['skirt','longskirt','pleatedskirt']);
/** Every character uses the same wardrobe; identity never filters shared parts. */
export function outfitAllowedFor(_name,_outfit){return true;}
export function appropriateOutfit(_name,outfit){return {...outfit};}

/**
 * After the bath (build.js wear('afterbath')): what a town bath's regulars wore in its shared lobby in the 1980s and 90s,
 * cooling off with a coffee milk, in the massage chair or in front of the night game. Grown-ups only: children keep their
 * clothes, as they do behind the noren (wearsBathTowel). Bare feet: the shoes are in the getabako at the genkan.
 * - men: a white cotton running vest (ランニングシャツ), long light-beige cotton drawers to below the knee (ステテコ), and
 *   one of the bath's tenugui round the neck, both ends on the chest (Umi-no-yu sells them at the bandai, printed with
 *   the navy band its towels carry, so they come back);
 * - women: her own house dress (アッパッパ), loose, short-sleeved, to the knee, in a pastel of what she likes to wear
 *   (houseDressColour), and the bath's towel wound into a turban over the hair while it dries.
 */
export const AFTERBATH=Object.freeze({
 men:Object.freeze({top:'running',topColour:'#f7f4ec',bottom:'suteteko',bottomColour:'#e4d8bd',footwear:'barefoot',hat:'none',pattern:'none'}),
 women:Object.freeze({top:'housedress',bottom:'housedress',footwear:'barefoot',hat:'none',pattern:'none'}),
});
const mixHex=(a,b,f)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-f)+parseInt(b.slice(i,i+2),16)*f).toString(16).padStart(2,'0')).join('');
/** Near-white tops (a white tee) give no colour of her own: then the accent she wears with it does. */
const pale=hex=>[1,3,5].every(i=>parseInt(hex.slice(i,i+2),16)>215);
/**
 * Her house dress: a pastel of the top she usually wears (Thuan's yellow, Nhung's sage, Mrs Higa's green), or of its
 * accent when that top is white (Thao's tee, with her blue shorts and ties), washed out as a much-laundered cotton is.
 */
export function houseDressColour(recipe){
 const o=recipe.outfit,base=pale(o.topColour)?o.accent:o.topColour,cloth='#fbf8f1';
 // At least 55% of the way to the cloth's white, further for a dark top (Thuan's navy), so it always reads as a pastel.
 const mean=hex=>[1,3,5].reduce((sum,i)=>sum+parseInt(hex.slice(i,i+2),16),0)/3;
 const wash=Math.min(.85,Math.max(.55,(190-mean(base))/(mean(cloth)-mean(base))));
 return mixHex(base,cloth,wash);
}

