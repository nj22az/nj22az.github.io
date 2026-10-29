import {THUAN_SAILOR_OUTFIT,HARBOUR_POLO_OUTFIT} from './outfit-constants.js';
// The outfits residents' own looks and the engine are built from live in outfit-constants.js (in the portrait hash).
export {THUAN_SAILOR_OUTFIT,HARBOUR_POLO_OUTFIT,AFTERBATH,houseDressColour} from './outfit-constants.js';
/**
 * Original island wardrobe sets; faces, body proportions and hair stay independent. A set is put on over what someone
 * wears (wardrobe-catalogue.js putOnSet), so a field it leaves out stays as it was, except the hat that came with the set
 * being taken off: it comes off with that set (no kitchen kerchief on a Sunday dress), while a hat of one's own stays.
 * Every set has a purpose (CLAUDE.md: "Nothing is random"): `who` on the island wears it and `why`; `category` files it in
 * the maker's Outfits tab, `label` is the short name under its picture (wardrobe-catalogue.js), `tags` are the places and
 * occasions a search finds it by, and `colourways` are its real colour variants (the first is the one in `outfit`). Ids
 * are appended, never renamed.
 */
export const ISLAND_OUTFITS=Object.freeze([
 {id:'harbour-polo',name:'Harbour polo and cream pleats',label:'Harbour polo',category:'Everyday',tags:['ferry','harbour','polo','pleats'],
  who:'the harbour visitor off the ferry; Thuan on her days off',why:'A navy polo with a cream collar over cream pleats: smart on the ferry deck, cool on the quay.',outfit:HARBOUR_POLO_OUTFIT},
 {id:'academy-sailor',name:'Harbour academy sailor',label:'Academy sailor',category:'Everyday',tags:['sailor','navy','Thuan’s wardrobe'],
  who:'Thuan, from her own wardrobe',why:'Her navy sailor set with long sleeves, a red necktie and ankle boots, for the cooler days.',outfit:THUAN_SAILOR_OUTFIT},
 {id:'police-uniform',name:'Minato police uniform',label:'Police uniform',category:'Work',tags:['police','officer','patrol','uniform'],
  who:'Officer Mori, at the desk from four and on night patrol',why:'The island police officer’s 1994-pattern uniform: the navy jacket over a white shirt and tie, the peaked cap, the duty belt and black shoes, so anyone can find him (police-data.js).',
  outfit:{top:'police',topColour:'#2c416d',bottom:'trousers',bottomColour:'#2c416d',footwear:'shoes',shoes:'#1c1c24',accent:'#a8893f',pattern:'none',hat:'police',hatColour:'#2c416d',belt:'duty',beltColour:'#16171b'}},
 {id:'cape-cafe-blouse',name:'Cape café bow blouse',label:'Bow blouse',category:'Everyday',tags:['occasion','wedding','parents’ day','school'],
  who:'Miss Higa on parents’ day and at a wedding',why:'A cream blouse with a bow at the collar over soft pleats: dressed up for the day, and still cool.',outfit:{top:'blouse',topColour:'#f2dfc5',bottom:'pleatedskirt',bottomColour:'#667d86',footwear:'shoes',shoes:'#543e34',accent:'#94525c',pattern:'none'}},
 {id:'sunday-jacket',name:'Harbour Sunday jacket',label:'Sunday jacket',category:'Everyday',tags:['Sunday','ferry','main island','radio parts'],
  who:'Tetsuo on the Sunday ferry to the main island, for radio parts',why:'A light jacket for the ferry saloon’s air-conditioning and a day in town.',outfit:{top:'jacket',topColour:'#486874',bottom:'trousers',bottomColour:'#3f4951',footwear:'shoes',shoes:'#4e3931',accent:'#f1e7cf',pattern:'none'}},
 {id:'knitted-layers',name:'Rainflower knitted layers',label:'Knitted layers',category:'Everyday',tags:['Rainflower Lane','florist','January','winter','cardigan'],
  who:'Thuan at Sakura’s flower buckets on January mornings (the set the Rainflower florist wore before she retired)',why:'January’s north wind is cold on the lane: a cardigan over a long skirt, and boots for the wet floor by the buckets.',outfit:{top:'cardigan',topColour:'#718b68',bottom:'longskirt',bottomColour:'#956c59',footwear:'boots',shoes:'#554237',accent:'#f1dfbb',pattern:'none'}},
 {id:'harbour-day-shift',name:'Harbour day shift',label:'Harbour day shift',category:'Work',tags:['cargo yard','quay','overalls','crates','catch'],
  who:'Kōji sorting the catch at the auction; Chin on a quay repair',why:'Overalls and boots for the quay, where the crates are heavy and the concrete is always wet.',outfit:{top:'overalls',topColour:'#f4f1ea',bottom:'widepants',bottomColour:'#476a79',footwear:'boots',shoes:'#473b2f',accent:'#dabb55',pattern:'none'}},
 {id:'sea-school-sailor',name:'Sea-school sailor',label:'Sea-school sailor',category:'School & sport',tags:['school','high school','uniform','ferry'],
  who:'Vy and Hana, on the ferry to the high school',why:'The high school’s summer sailor uniform.',outfit:{top:'sailor',topColour:'#f4f1ea',bottom:'pleatedskirt',bottomColour:'#27304d',footwear:'shoes',shoes:'#2b2b2b',accent:'#2f5f9e',pattern:'none'}},
 {id:'wildflower-sunday',name:'Wildflower Sunday',label:'Wildflower Sunday',category:'Everyday',tags:['Sunday','summer','dress','beach','Kitahama'],
  who:'Mai, on her way to Kitahama to see Vy',why:'The coolest thing to wear on a hot Sunday, with sandals for the walk to Kitahama.',outfit:{top:'sundress',topColour:'#e98aa6',bottom:'longskirt',bottomColour:'#e98aa6',footwear:'sandals',shoes:'#8a5a2e',accent:'#f4f1ea',pattern:'flowers'}},
 {id:'raincloud-rambler',name:'Raincloud rambler',label:'Raincloud rambler',category:'Everyday',tags:['rain','rainy season','tsuyu','hood','June'],
  who:'Kenta and the Cold-storage kid on rainy-season mornings',why:'A hood up for the showers of May and June, and hems clear of the puddles.',outfit:{top:'hoodie',topColour:'#7fb0d8',bottom:'cropped',bottomColour:'#6d7478',footwear:'sneakers',shoes:'#f4f1ea',accent:'#f4d23c',pattern:'none'}},
 {id:'bookshop-afternoon',name:'Bookshop afternoon',label:'Bookshop afternoon',category:'Work',tags:['Front-Row Books','bookshop','stationery','shop'],
  who:'Nhung at Front-Row Books & Stationery, before she became the island doctor (her clinic look is her own now)',why:'A cardigan for the air-conditioned shop, culottes for the ladder to the top shelves.',outfit:{top:'cardigan',topColour:'#9a6a42',bottom:'culottes',bottomColour:'#c8b48a',footwear:'shoes',shoes:'#473b2f',accent:'#e0c078',pattern:'none'}},
 {id:'festival-coat',name:'Island festival coat',label:'Festival coat',category:'Festival',tags:['happi','eisa','tug-of-war','Obon','andagi','steward'],
  who:'the stewards at the eisa night, the tug-of-war and the andagi stall',why:'A happi coat shows who is helping to run the festival.',outfit:{top:'festival',topColour:'#2f5f9e',bottom:'shorts',bottomColour:'#27304d',footwear:'sandals',shoes:'#c8b48a',accent:'#f4f1ea',pattern:'none'}},
 {id:'cloud-cafe-uniform',name:'Cloud café uniform',label:'Café uniform',category:'Work',tags:['Blue Coral','ice cream','Rainflower Lane','counter'],
  who:'Mrs Nakamura at Blue Coral, the island’s only ice-cream shop',why:'A lilac blouse and slate pleats behind the counter, white shoes for the shop floor.',outfit:{top:'blouse',topColour:'#b2a2ce',bottom:'pleatedskirt',bottomColour:'#58687b',footwear:'shoes',shoes:'#f4f1ea',accent:'#f4f1ea',pattern:'none'}},
 // Batch 1 of the Minato Machi wardrobe plan (2026-10-11): eight sets made only from parts that already exist, every
 // colour from the island palette (character-style.md §6).
 {id:'shop-counter-smock',name:'Shop counter smock',label:'Shop counter smock',category:'Work',tags:['Sakura Shōten','shop','konbini','shaved ice','kakigōri','zenzai','counter'],
  who:'Thuan at Sakura Shōten’s till; Mrs Nakamura at her shaved-ice stall',why:'The sleeved smock keeps syrup and dust off everyday clothes.',
  outfit:{top:'smock',topColour:'#f4f1ea',bottom:'widepants',bottomColour:'#6e4a33',footwear:'sandals',shoes:'#6e4a33',hat:'kerchief',hatColour:'#2f4f7f',accent:'#2f4f7f',pattern:'none'}},
 // Boots for now: the set moves to the market gumboots when they are made (the plan's batch 5).
 {id:'morning-boats',name:'Morning boats',label:'Morning boats',category:'Work',tags:['fish auction','auction','quay','dawn','boats','fishing','sabani'],
  who:'Kōji at the auction and on his sabani, and Masaru',why:'Boots and a cap for the hosed-down quay at dawn.',
  outfit:{top:'tee',topColour:'#8cc4b4',bottom:'trousers',bottomColour:'#2f4f7f',footwear:'boots',shoes:'#f4f1ea',hat:'cap',hatColour:'#2f4f7f',accent:'#e8b83e',pattern:'none'}},
 // Our own plain uniform: no postal mark.
 {id:'post-round',name:'Post round',label:'Post round',category:'Work',tags:['post office','post','mail','letters','round','uniform'],
  who:'the terminal’s mailbag round (Ms Ganaha’s counter has the post now; the set the postman wore before he retired) and Naoko',why:'A light summer uniform for a round on foot.',
  outfit:{top:'polo',topColour:'#8fbfe0',bottom:'trousers',bottomColour:'#27304d',footwear:'shoes',shoes:'#2b2b2b',hat:'cap',hatColour:'#27304d',accent:'#f4f1ea',pattern:'none'}},
 // The kitchen smock, not the apron: the apron tears in every move until it is rebuilt (character-style.md section 8,
 // batch 5). The kerchief is the red of the shop's noren (minato-facade.js); the accent only ties back long hair.
 {id:'ramen-kitchen',name:'Ramen kitchen',label:'Ramen kitchen',category:'Work',tags:['Sato Ramen','ramen','kitchen','cook','stove','noodles','noren','smock'],
  who:'Mrs Sato at Sato Ramen',why:'Hair covered and a white kitchen smock at the stove; the kerchief is the red of the shop’s noren.',
  outfit:{top:'smock',topColour:'#f4f1ea',bottom:'trousers',bottomColour:'#2b2b2b',footwear:'shoes',shoes:'#2b2b2b',hat:'kerchief',hatColour:'#c8473a',accent:'#c8473a',pattern:'none'}},
 // Boots for now, like Morning boats: gumboots in the plan's batch 5.
 {id:'cold-store',name:'Cold store in August',label:'Cold store',category:'Work',tags:['ice plant','ice','cold room','east quay','August','beanie'],
  who:'Kōji and the Cold-storage kid',why:'The ice plant’s cold room is far below freezing, so they are the only two islanders in a beanie in August.',
  outfit:{top:'hoodie',topColour:'#6d7478',bottom:'trousers',bottomColour:'#27304d',footwear:'boots',shoes:'#f4f1ea',hat:'beanie',hatColour:'#27304d',accent:'#8cc4b4',pattern:'none'}},
 {id:'gateball-afternoon',name:'Gateball afternoon',label:'Gateball afternoon',category:'School & sport',tags:['gateball','court','seawall','elders','afternoon','sport'],
  who:'the island’s elders on the seawall court',why:'A white polo and a wide straw hat for two hours in the afternoon sun on the open court; soft soles for the sand.',
  outfit:{top:'polo',topColour:'#f4f1ea',bottom:'trousers',bottomColour:'#c9b68c',footwear:'sneakers',shoes:'#f4f1ea',hat:'straw',hatColour:'#e3d4b0',accent:'#c8473a',pattern:'none'}},
 // The three crews of the Haarii races (9 June 1997), one colourway each; the headband is white for all of them.
 {id:'haarii-crew',name:'Haarii crew',label:'Haarii crew',category:'Festival',tags:['haarii','boat race','festival','sabani','rowing','June','Minato','Kitahama','Nishi-machi'],
  who:'Kōji, Daichi and Kenta rowing for Minato on 9 June (the crew is proposed)',why:'Bare feet on the sabani, a headband for the sweat.',
  outfit:{top:'tee',topColour:'#c8473a',bottom:'shorts',bottomColour:'#27304d',footwear:'barefoot',hat:'headband',hatColour:'#f4f1ea',pattern:'none'},
  colourways:[{name:'Minato',colours:{topColour:'#c8473a',bottomColour:'#27304d'}},{name:'Kitahama',colours:{topColour:'#4f7a4f',bottomColour:'#e3d4b0'}},{name:'Nishi-machi',colours:{topColour:'#3a9cb8',bottomColour:'#f4f1ea'}}]},
 {id:'walk-to-school',name:'Walk to school',label:'Walk to school',category:'School & sport',tags:['school','pupils','children','Years 5–6','yellow hat','walk'],
  who:'the pupils of Miss Higa’s Years 5–6 class',why:'The yellow hat lets drivers see small children.',
  outfit:{top:'tee',topColour:'#f4f1ea',bottom:'shorts',bottomColour:'#27304d',footwear:'sneakers',shoes:'#f4f1ea',hat:'bucket',hatColour:'#e8b83e',pattern:'none'}},
 // Batch 2 of the wardrobe plan: sets the new painted tops make possible.
 {id:'ticket-window',name:'Ticket window',label:'Ticket window',category:'Work',tags:['port terminal','tickets','ferry','Minato Maru','uniform','vest','waiting hall'],
  who:'Ms Ganaha at the Port Terminal’s ticket window',why:'The terminal’s terracotta vest over a white shirt, so the passengers in the waiting hall know whom to ask.',
  outfit:{top:'vest',topColour:'#b4583c',accent:'#f4f1ea',bottom:'skirt',bottomColour:'#27304d',footwear:'shoes',shoes:'#2b2b2b',pattern:'none'}},
 {id:'harbour-summer',name:'Harbour master’s summer',label:'Harbour summer',category:'Work',tags:['harbour master','harbour office','ferry','berth','summer','captain','shirt'],
  who:'the harbour master, from June to September',why:'Too hot for his jacket on the quay: a sky-blue shirt with a pen for the berth log, and the white cap the ferry looks for.',
  outfit:{top:'shirt',topColour:'#8fbfe0',accent:'#2f4f7f',bottom:'trousers',bottomColour:'#27304d',footwear:'shoes',shoes:'#2b2b2b',hat:'captain',hatColour:'#f4f1ea',pattern:'none'}},
 // Cute everyday wear (the creator, 2026-10-14: "characters need to … have cute clothes"): the raglan tee, the pinafore,
 // the hair clip and striped trousers, every colour from the island palette.
 {id:'saturday-ice-cream',name:'Saturday ice cream',label:'Saturday ice cream',category:'Everyday',tags:['Blue Coral','ice cream','Rainflower Lane','Saturday','weekend','raglan','pleats','hair clip'],
  who:'Vy and Mai on a Saturday, walking to Blue Coral',why:'A raglan tee and swinging pleats for the walk down Rainflower Lane, pink sneakers, and a clip to keep the fringe off the ice cream.',
  outfit:{top:'raglan',topColour:'#f4f1ea',accent:'#d9668a',bottom:'pleatedskirt',bottomColour:'#27304d',bottomPattern:'none',footwear:'sneakers',shoes:'#f2b8c6',hat:'hairclip',hatColour:'#f2b8c6',pattern:'none'}},
 {id:'market-stripes',name:'Market-morning stripes',label:'Market stripes',category:'Everyday',tags:['market','morning','izakaya','wide trousers','stripes','tee'],
  who:'Thao buying for the izakaya at the morning market',why:'Loose striped trousers and a lagoon tee: cool for the market at ten, and she can sit on a crate to haggle.',
  outfit:{top:'tee',topColour:'#3a9cb8',accent:'#f4f1ea',bottom:'widepants',bottomColour:'#4f7a4f',bottomPattern:'stripes',footwear:'sneakers',shoes:'#f4f1ea',pattern:'none'}},
 {id:'sunday-pinafore',name:'Sunday pinafore',label:'Sunday pinafore',category:'Everyday',tags:['Sunday','dress','pinafore','school trip','shrine'],
  who:'Mai on Sundays; Miss Higa on school trips',why:'A pinafore dress over a white tee: smart enough for the shrine, tough enough for the playground.',
  outfit:{top:'pinafore',topColour:'#f4f1ea',accent:'#e8b83e',bottom:'skirt',bottomColour:'#2f4f7f',bottomPattern:'none',footwear:'shoes',shoes:'#6e4a33',pattern:'none'}},
 {id:'vy-monochrome',name:'Vy monochrome layers',label:'Vy monochrome',category:'Everyday',tags:['Vy','stripes','vest','panel skirt'],who:'Vy off school',why:'A striped long-sleeve tee, layered charcoal vest, soft panel skirt and white sneakers.',outfit:{top:'stripedvest',topColour:'#24252b',accent:'#f4f1ea',bottom:'skirt',skirtCut:'panel',skirtLength:.5,skirtFlare:.5,bottomColour:'#24252b',footwear:'sneakers',shoes:'#f4f1ea',pattern:'none',bottomPattern:'none'}},
 // The costume gallery's batch (2026-10-29, docs/research/costume-gallery.md): the owner asked for "the suitable outfits"
 // of COSTUME-DB-01 (ai-costume-gallery.pages.dev). Each set is the island's own version of the gallery looks it was
 // studied from (`reference`, the gallery's ids; one colourway per look where they differ only in colour), made from
 // World's parts in the island palette. Nothing of the gallery is shipped: its images may not be redistributed. Its terms
 // also ask that it not be used to depict minors, so every set made from it is written for the island's grown-ups.
 {id:'tiered-sunday',name:'Tiered Sunday',label:'Tiered Sunday',category:'Everyday',tags:['Sunday','tiered skirt','long skirt','tee','Harbour Park','summer'],
  who:'Miss Higa on a Sunday morning in Harbour Park',why:'A cotton tee and a long skirt in tiers that lifts in the sea wind, with sneakers for the park paths and the seawall.',
  reference:['SPR-0100','SPR-0117','SUM-0218'],
  outfit:{top:'tee',topColour:'#e3d4b0',bottom:'tieredskirt',bottomColour:'#f4f1ea',bottomPattern:'none',footwear:'sneakers',shoes:'#f4f1ea',pattern:'none'},
  colourways:[{name:'Sand & white',colours:{topColour:'#e3d4b0',bottomColour:'#f4f1ea'}},{name:'White & sand',colours:{topColour:'#f4f1ea',bottomColour:'#e3d4b0'}},{name:'Mint & sand',colours:{topColour:'#b8dcc8',bottomColour:'#e3d4b0'}}]},
 {id:'cherry-bench',name:'Under the harbour cherry',label:'Cherry bench',category:'Everyday',tags:['cherry','Harbour Park','February','January','winter','denim jacket','tiered skirt'],
  who:'Ms Ganaha on the bench under the harbour cherry before her window opens, in February',
  why:'The harbour cherry flowers from late January through February, in the island’s winter: a denim jacket against the north wind over a long tiered skirt.',
  reference:['SPR-0023','SPR-0095','SPR-0116','SPR-0053'],
  outfit:{top:'jacket',topColour:'#2f4f7f',accent:'#f4f1ea',bottom:'tieredskirt',bottomColour:'#d9668a',bottomPattern:'none',footwear:'sneakers',shoes:'#f4f1ea',pattern:'none'},
  colourways:[{name:'Denim & blossom',colours:{bottomColour:'#d9668a'}},{name:'Denim & sky',colours:{bottomColour:'#8fbfe0'}},{name:'Denim & white',colours:{bottomColour:'#f4f1ea'}}]},
 // A shirt and a long skirt of one cloth read as one dress buttoned from the collar (the gallery's shirt dresses).
 {id:'shirt-dress',name:'Shirt dress',label:'Shirt dress',category:'Everyday',tags:['dress','shirt dress','collar','buttons','Sato Ramen','Saturday','week ashore'],
  who:'Ms Uezu on her week ashore, at seven for supper at Sato Ramen; Nhung once the clinic shuts on Saturday at noon',
  why:'One cloth buttoned from the collar to the hem, short sleeves for the heat: as tidy at a counter as on the walk home.',
  reference:['SPR-0008','SPR-0016','SUM-0164','SUM-0253'],
  outfit:{top:'shirt',topColour:'#4f7a4f',accent:'#f4f1ea',bottom:'longskirt',bottomColour:'#4f7a4f',bottomPattern:'none',footwear:'sandals',shoes:'#6e4a33',pattern:'none'},
  colourways:[{name:'Fukugi green',colours:{topColour:'#4f7a4f',bottomColour:'#4f7a4f'}},{name:'Sky',colours:{topColour:'#8fbfe0',bottomColour:'#8fbfe0'}},{name:'Bashō beige',colours:{topColour:'#c9b68c',bottomColour:'#c9b68c'}}]},
 {id:'linen-trousers',name:'Linen trousers and a sun hat',label:'Linen trousers',category:'Everyday',tags:['summer','August','beach','Kitahama','straw hat','wide trousers','blouse','visitor'],
  who:'the summer visitors off the ferry, on the beach path to Kitahama; Ms Uezu on her week ashore',
  why:'Loose linen trousers let the air in, a puffed cotton blouse stays cool, and a wide straw hat keeps the noon sun off the beach path.',
  reference:['SUM-0096','SUM-0074','SUM-0108','SUM-0155'],
  outfit:{top:'blouse',topColour:'#e8836a',accent:'#f4f1ea',bottom:'widepants',bottomColour:'#b8dcc8',bottomPattern:'none',footwear:'sandals',shoes:'#e3d4b0',hat:'straw',hatColour:'#e3d4b0',pattern:'none'},
  colourways:[{name:'Coral & mint',colours:{topColour:'#e8836a',bottomColour:'#b8dcc8'}},{name:'Sky & mint',colours:{topColour:'#8fbfe0',bottomColour:'#b8dcc8'}},{name:'Navy & coral',colours:{topColour:'#27304d',bottomColour:'#e8836a'}}]},
 {id:'laundry-round',name:'Laundry round denim',label:'Laundry round',category:'Everyday',tags:['coin laundry','morning','denim skirt','long skirt','tee','Port Terminal'],
  who:'Ms Ganaha on the coin laundry’s morning round, before the mailbag comes off the boat',
  why:'A tee and a long denim skirt that do not mind the laundry’s heat or its wet floor; sandals that come off at the door.',
  reference:['SUM-0183','SUM-0193','SUM-0254'],
  outfit:{top:'tee',topColour:'#6d7478',bottom:'longskirt',bottomColour:'#2f4f7f',bottomPattern:'none',footwear:'sandals',shoes:'#2b2b2b',pattern:'none'},
  colourways:[{name:'Grey & denim',colours:{topColour:'#6d7478',bottomColour:'#2f4f7f'}},{name:'White & denim',colours:{topColour:'#f4f1ea',bottomColour:'#2f4f7f'}},{name:'White & charcoal',colours:{topColour:'#f4f1ea',bottomColour:'#2b2b2b'}}]},
 {id:'late-bowl',name:'Late bowl at Minato',label:'Late bowl',category:'Everyday',tags:['hoodie','wide jeans','cap','evening','Minato Izakaya','deck hand','signed off'],
  who:'Ren, signed off at half past ten, on the walk up to Minato for a late bowl',
  why:'The sea wind is cool after dark: a hooded sweater over wide jeans, and a cap pulled on out of the deck’s habit.',
  reference:['SPR-0199','SPR-0206','WIN-0194'],
  // The cap is dark, in the cloth's own colours: a pale cap shows the hair cut flat under it at the back
  // (briefs/character-style.md section 9, batch 4, "hair eased in under a hat").
  outfit:{top:'hoodie',topColour:'#6d7478',accent:'#f4f1ea',bottom:'widepants',bottomColour:'#2f4f7f',bottomPattern:'none',footwear:'sneakers',shoes:'#f4f1ea',hat:'cap',hatColour:'#2f4f7f',pattern:'none'},
  colourways:[{name:'Grey & denim',colours:{topColour:'#6d7478',bottomColour:'#2f4f7f',hatColour:'#2f4f7f'}},{name:'Navy & sand',colours:{topColour:'#27304d',bottomColour:'#e3d4b0',hatColour:'#27304d'}}]},
 {id:'pier-watch',name:'Between calls at the pier',label:'Pier watch',category:'Everyday',tags:['Kitano-jima','pier','line hand','cap','tee','between calls','lunch'],
  who:'Kai between calls at the Kitano pier, twenty-five metres from his own front door',
  why:'A cap against the glare off the water and loose cotton trousers he can kneel on the pier in; lunch at home, and back before the next call.',
  reference:['SUM-0209','SUM-0177','SPR-0162'],
  outfit:{top:'tee',topColour:'#f4f1ea',bottom:'trousers',bottomColour:'#c9b68c',bottomPattern:'none',footwear:'sneakers',shoes:'#2b2b2b',hat:'cap',hatColour:'#2b2b2b',pattern:'none'},
  colourways:[{name:'White & khaki',colours:{topColour:'#f4f1ea',bottomColour:'#c9b68c'}},{name:'Lagoon & sand',colours:{topColour:'#3a9cb8',bottomColour:'#e3d4b0'}}]},
 // Gingham (garment.js) is a print on the top: the skirt stays plain, as a gingham blouse is worn.
 {id:'gingham-holidays',name:'Gingham holidays',label:'Gingham holidays',category:'Everyday',tags:['gingham','checks','summer holidays','blouse','school','teacher'],
  who:'Miss Higa in the school’s summer holidays',why:'Gingham is summer cotton: it is cool, it hides a drip of shaved ice, and it is dry on the line by noon.',
  reference:['SUM-0038','SUM-0057','SUM-0086','SUM-0125'],
  outfit:{top:'blouse',topColour:'#2f4f7f',accent:'#f4f1ea',pattern:'gingham',bottom:'skirt',bottomColour:'#f4f1ea',bottomPattern:'none',footwear:'sandals',shoes:'#6e4a33'},
  colourways:[{name:'Indigo & white',colours:{topColour:'#2f4f7f',bottomColour:'#f4f1ea'}},{name:'Red & white',colours:{topColour:'#c8473a',bottomColour:'#f4f1ea'}},{name:'Lagoon & navy',colours:{topColour:'#3a9cb8',bottomColour:'#27304d'}}]},
 {id:'haarii-day',name:'Haarii day on the quay',label:'Haarii day',category:'Festival',tags:['haarii','boat race','June','quay','gingham','sundress','tiered skirt','straw hat'],
  who:'the crowd on the quay for the Haarii races in June: Miss Higa, Ms Ganaha and Mrs Nakamura',
  why:'The hottest day of June on the open quay: a sundress with a gingham bodice over a long tiered skirt, and a straw hat wide enough to share.',
  reference:['SUM-0160','SUM-0156','SUM-0149','SUM-0079'],
  outfit:{top:'sundress',topColour:'#e8836a',pattern:'gingham',bottom:'tieredskirt',bottomColour:'#e8836a',bottomPattern:'none',footwear:'sandals',shoes:'#e3d4b0',hat:'straw',hatColour:'#e3d4b0'},
  colourways:[{name:'Coral',colours:{topColour:'#e8836a',bottomColour:'#e8836a'}},{name:'Charcoal',colours:{topColour:'#2b2b2b',bottomColour:'#2b2b2b'}},{name:'Lagoon',colours:{topColour:'#3a9cb8',bottomColour:'#3a9cb8'}}]},
 {id:'january-classroom',name:'January classroom',label:'January classroom',category:'Work',tags:['school','teacher','January','winter','knitted vest','shirt','long skirt','north wind'],
  who:'Miss Higa in the classroom in January, when the north wind finds the window frames',
  why:'A knitted vest over a white shirt and a long skirt: warm enough for January in the one-room school, and the chalk brushes off.',
  reference:['SPR-0221','SPR-0207','SPR-0177','AUT-0212'],
  outfit:{top:'knitvest',topColour:'#6d7478',accent:'#f4f1ea',bottom:'longskirt',bottomColour:'#27304d',bottomPattern:'none',footwear:'shoes',shoes:'#2b2b2b',pattern:'none'},
  colourways:[{name:'Grey & navy',colours:{topColour:'#6d7478',accent:'#f4f1ea',bottomColour:'#27304d'}},{name:'Beige & brown',colours:{topColour:'#c9b68c',accent:'#8fbfe0',bottomColour:'#6e4a33'}}]},
 {id:'verandah-january',name:'Verandah in January',label:'Verandah January',category:'Everyday',tags:['cardigan','January','winter','north wind','verandah','Nishi-machi','wide trousers','elders'],
  who:'Grandmother Higa on her Nishi-machi verandah on January evenings',
  why:'A thick cardigan and loose trousers for the north wind on the verandah, where she keeps an eye on the street.',
  reference:['WIN-0187','WIN-0196','WIN-0165'],
  outfit:{top:'cardigan',topColour:'#f4f1ea',accent:'#c9b68c',bottom:'widepants',bottomColour:'#6d7478',bottomPattern:'none',footwear:'shoes',shoes:'#6e4a33',pattern:'none'},
  colourways:[{name:'Cream & grey',colours:{topColour:'#f4f1ea',bottomColour:'#6d7478'}},{name:'Red & grey',colours:{topColour:'#c8473a',bottomColour:'#6d7478'}},{name:'Green & charcoal',colours:{topColour:'#4f7a4f',bottomColour:'#2b2b2b'}}]},
 {id:'trading-round',name:'Trading round',label:'Trading round',category:'Work',tags:['Sakura Trading','kei truck','round','delivery','denim shirt','wide trousers','week ashore'],
  who:'Kōji on his weeks ashore, on Sakura Trading’s round in the kei truck',
  why:'A denim shirt and loose trousers for climbing in and out of the kei truck at every stop, and sneakers that grip the wet quay.',
  reference:['SPR-0246','SPR-0252','SUM-0236'],
  outfit:{top:'shirt',topColour:'#2f4f7f',accent:'#f4f1ea',bottom:'widepants',bottomColour:'#e3d4b0',bottomPattern:'none',footwear:'sneakers',shoes:'#f4f1ea',pattern:'none'},
  colourways:[{name:'Denim & sand',colours:{topColour:'#2f4f7f',bottomColour:'#e3d4b0'}},{name:'White & denim',colours:{topColour:'#f4f1ea',bottomColour:'#2f4f7f'}}]},
 {id:'celebration-dress',name:'Celebration dress',label:'Celebration dress',category:'Everyday',tags:['occasion','wedding','sixtieth birthday','dress','best'],
  who:'the guests at a wedding or a sixtieth birthday',why:'The island’s best for a wedding or a sixtieth birthday: a dress to the shin in one soft colour, and the good shoes.',
  reference:['PTY-0026','PTY-0034','PTY-0013','PTY-0045'],
  outfit:{top:'blouse',topColour:'#4f7a4f',accent:'#f4f1ea',bottom:'longskirt',bottomColour:'#4f7a4f',bottomPattern:'none',footwear:'shoes',shoes:'#2b2b2b',pattern:'none'},
  colourways:[{name:'Fukugi green',colours:{topColour:'#4f7a4f',bottomColour:'#4f7a4f'}},{name:'Coral',colours:{topColour:'#e8836a',bottomColour:'#e8836a'}},{name:'Sand',colours:{topColour:'#e3d4b0',bottomColour:'#e3d4b0'}}]},
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

export {DRESS_BOTTOMS} from './recipe.js';
/** Every character uses the same wardrobe; identity never filters shared parts. */
export function outfitAllowedFor(_name,_outfit){return true;}
export function appropriateOutfit(_name,outfit){return {...outfit};}
