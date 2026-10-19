import {PRODUCTS} from './products-data.js';
/**
 * Why every line in Sakura Shōten is on the floor, who it is for, and why it stands where it
 * does. Nothing in the shop is random: Thuan stocks for the people who actually come in, and
 * lays the floor out the way a 1997 konbini does (docs/SAKURA-SHOP-PLAN.md): the drinks at the
 * back as the magnet, fresh food in the open chiller, one category to a gondola, children's
 * sweets low, the heavy and the everyday nearest the till, impulse at the counter.
 *
 *   zone     where it lives: drinks (the cold cabinet), fresh (the open chiller), pantry,
 *            sweets and daily (the three gondolas), counter (the steamer by the till)
 *   for      the residents who buy it, by name
 *   why      what they want it for
 *   placed   why it stands where it does
 *
 * Tests hold this to the real shelves (sakura-layout.js) and the real cast; the storyteller
 * can use it to know who would plausibly be holding what, and where.
 */
export const ZONES=Object.freeze({
 drinks:'The cold cabinet on the back wall. Drinks are the shop’s magnet: everyone walks the length of the floor to reach them and passes everything else on the way.',
 fresh:'The open chiller on the west wall. Made today, gone tomorrow; open decks so a lunch can be taken without opening a door.',
 pantry:'The west gondola, beside the chiller: the cupboard at home, for people who cook.',
 sweets:'The middle gondola, on the door’s own line, so it is the first aisle you look down: crisps at a grown-up’s eye, children’s sweets low.',
 daily:'The east gondola, nearest the till: what runs out at home, heavy things low, small dear things where Thuan can see them.',
 counter:'On the counter by the register: hot, quick, and bought on impulse while paying.',
});

/**
 * Each line's reason to be on the floor, from data/studio/products.json (`purpose` there: Johansson Studio edits it,
 * and its checks hold every line to a real resident, a reason and a place). In the order Thuan walks the floor: the
 * cold cabinet (tea and water nearest the door side, beer nearest the till), the open chiller, the pantry, the sweets,
 * the daily goods nearest the till, and the counter.
 */
export const MERCHANDISING=Object.freeze(Object.fromEntries(PRODUCTS.map(p=>[p.id,{zone:p.purpose.zone,for:[...p.purpose.for],why:p.purpose.why,placed:p.purpose.placed}])));
/** Which shelf fittings each zone is (sakura-layout.js SAKURA_SHELVES): the test reads them. */
export const ZONE_OF_SHELF=Object.freeze({fridge:'drinks',chiller:'fresh',west:'pantry',middle:'sweets',east:'daily',steamer:'counter'});
/** Who in town would buy this line. */
export const buyersOf=id=>MERCHANDISING[id]?.for||[];
/** What a resident would plausibly pick up in Sakura. */
export const linesFor=name=>Object.entries(MERCHANDISING).filter(([,m])=>m.for.includes(name)).map(([id])=>id);

/**
 * Who supplies whom. Three wholesalers keep the town's businesses going, each in its own trade:
 *
 *   sakura        Sakura Shōten, Thuan's outright (docs/CAST-CONSOLIDATION.md §3), from its depot in the Quay
 *                 Warehouse (Sakura Trading): the everyday goods — drinks, food, washing, paper goods, batteries —
 *                 and, since Mrs Kinjō retired (§6, addendum 3), the town's flowers and decorations: the season's
 *                 window dressing, festival trimmings, lanterns and wreaths, for the shops, the bar, the bath, the
 *                 school and the town hall. Those are `decor` lines on an account, named goods rather than shelf
 *                 stock: they come in with the depot's deliveries, not off the gondolas.
 *   higa-saketen  Higa Liquor in Nishi-machi: all the alcohol. Sakura's beer comes from the Higas,
 *                 and so do Minato's bottle keep and tap, Sato Ramen's bottles and the Coral Bay
 *                 Bar's ice boxes on Kitano-jima.
 *   frontrow      Front-Row Books & Stationery: paper, ledgers, pens and envelopes for the town's
 *                 offices, the school and the police box.
 *
 * Only places that are open trade (src/people/cast.js PLACES): the Fumoto co-op has closed, so Sakura and the Higas
 * no longer send it a Wednesday crate; the Rainflower pavilion sells nothing and supplies nobody.
 *
 * An account is what one business orders from one supplier: owner (who places the order, or
 * contact when it is a post rather than anyone in the cast),
 * lines (what), why (what it is for) and delivery (when and how it arrives). Lines are
 * SHOP_STOCK ids for Sakura; the other suppliers' goods, and Sakura's decorations, are named in their own lists.
 */
export const SUPPLIERS=Object.freeze({
 sakura:{name:'Sakura Shōten (Sakura Trading)',owner:'Thuan',depot:'warehouse',goods:'Everyday goods: drinks, food, washing, paper goods, batteries; and the town’s flowers and decorations.',
  decor:['seasonal window decorations','Tanabata bamboo and paper strips','New Year kadomatsu and shimenawa','paper lanterns and festival bunting','wreaths and table flowers','bouquets, from the buckets by the door']},
 'higa-saketen':{name:'Higa Liquor',owner:'Grandmother Higa',goods:'Beer, awamori, sake and shōchū.',
  stock:['Umineko lager, crates and kegs','awamori, from the 180 ml bottles to the clay kame','sake for warming','shōchū for the mixes']},
 frontrow:{name:'Front-Row Books & Stationery',owner:'Nhung',goods:'Office supplies and stationery.',
  stock:['A4 copy paper by the ream','account ledgers and receipt books','ballpoint pens by the box','envelopes, long and square','cellophane tape and glue']},
});

export const ACCOUNTS=Object.freeze({
 sakura:{
  izakaya:{name:'Minato Izakaya',owner:'Thao',lines:['soy','water','orange','tissues','detergent','battery'],decor:['paper lanterns','a vase of flowers for the counter'],
   why:'Soy for the grill, water for chasers, mandarin juice for the shōchū mixes, table tissues, cloth washing, and batteries for the karaoke microphone. Fresh lanterns when the old ones fade, and one stem on the counter that Thao pretends not to care about.',
   delivery:'Two crates on the trolley at three, before the noren goes up; Thao signs for it. Flowers on Mondays; lanterns when the typhoon has had the last ones.'},
  ramen:{name:'Sato Ramen',owner:'Mrs Sato',lines:['soy','tea','detergent'],
   why:'Soy to top up the tare, tea for the counter, and powder for the towels.',
   delivery:'At half past ten, while the stock comes up to the boil.'},
  onsen:{name:'Umi-no-yu',owner:'Miss Higa',lines:['milk','soda','soap','detergent'],decor:['seasonal flowers for the bandai'],
   why:'Bottled milk and ramune for the fridge by the bandai — the after-bath drink — soap for the washing stools, and powder for the towels. A small vase on the bandai, changed with the season, the first thing a bather sees.',
   delivery:'Mornings before the bath opens; the milk crate is the heaviest thing Thuan carries all week. The flowers every other Saturday.'},
  frontrow:{name:'Front-Row Books & Stationery',owner:'Nhung',lines:['tea','biscuit','battery'],
   why:'Tea and biscuits for the reading corner, batteries for the press-room radio.',
   delivery:'Thursdays, when the evening paper is set and there is a quiet hour.'},
  form3d:{name:'Chin & Tetsuo Repairs',owner:'Chin',lines:['battery','coffee','rice'],
   why:'Batteries by the box for testing radios, canned coffee for the bench, and a lunch order of rice balls.',
   delivery:'Lunch at noon on the bicycle; batteries when Tetsuo remembers to ask.'},
  office:{name:'Johansson Harbour Office',owner:'Johansson',lines:['battery','coffee','tea','water'],
   why:'Batteries for the quay lamps, and drinks for the crews.',
   delivery:'With the first ferry, on the harbour cart.'},
  koban:{name:'Minato Police Station',owner:'Officer Mori',lines:['water','rice','battery'],
   why:'Water and a rice ball for the night patrol, batteries for the torch.',
   delivery:'Officer Mori collects it himself, at closing, and calls it a patrol.'},
  'mayor-office':{name:'the mayor’s office',owner:'Johansson',lines:['tea','crackers','tissues'],decor:['ceremony wreaths','festival bunting','a garland for the Merry Moose'],
   why:'Tea and rice crackers for visitors, and tissues for difficult meetings. Wreaths and bunting for openings, prize days and the town’s festivals, and the moose is dressed for every one of them.',
   delivery:'Mondays, carried up the Community Hall stairs; the wreaths the morning of each ceremony.'},
  'coral-bay-bar':{name:'the Coral Bay Bar on Kitano-jima',contact:'the beach bar keeper',lines:['orange','water'],
   why:'Mandarin and shikuwasa juice for the children and the drivers, and water for anyone who fell asleep under a parasol.',
   delivery:'On the morning car ferry, in the Sakura Trading crate that goes over with the Higa ice boxes.'},
  'community-kitchen':{name:'the community kitchen',owner:'Mrs Nakamura',lines:['curry','soy','tuna','rice'],
   why:'The Saturday curry for the whole street, and onigiri for the volunteers.',
   delivery:'Friday evening, so the pot can start early.'},
  school:{name:'the island school',contact:'the head teacher',lines:['milk','tissues'],decor:['sports day bunting','graduation flowers'],
   why:'School milk, and tissues every hay-fever season. Bunting for sports day in the autumn and flowers for the graduation in March.',
   delivery:'First thing on Mondays, by the school gate; the bunting and the flowers the day before, with the children helping to carry.'},
  clinic:{name:'the clinic',contact:'the clinic nurse',lines:['tissues','soap','water','peaches'],
   why:'Tissues and soap for the waiting room, water for patients, and tinned peaches for anyone kept in overnight.',
   delivery:'Whenever the clinic telephones; it is never urgent and always is.'},
 },
 'higa-saketen':{
  market:{name:'Sakura Shōten',owner:'Thuan',lines:['Umineko lager, cases of cans'],
   why:'The beer column in Sakura’s cold cabinet, nearest the till.',
   delivery:'Saturday mornings: the Higas’ van, and Grandmother Higa counting the cases off herself.'},
  izakaya:{name:'Minato Izakaya',owner:'Thao',lines:['Umineko lager, kegs and bottles','awamori for the bottle keep','sake for warming','shōchū for the mixes'],
   why:'Everything behind Minato’s bar: the tap, the keep shelf, the tokkuri and the highballs.',
   delivery:'Kegs on Tuesdays and Fridays at two, rolled down the side passage before the noren goes up.'},
  ramen:{name:'Sato Ramen',owner:'Mrs Sato',lines:['Umineko lager, large bottles'],
   why:'A bottle with the gyōza, for the lunch crowd who are not going back to work.',
   delivery:'With the Minato order, one crate left at the back door.'},
  'coral-bay-bar':{name:'the Coral Bay Bar on Kitano-jima',contact:'the beach bar keeper',lines:['Umineko lager, bottles on ice'],
   why:'Cold beer for the day-trippers on Coral Bay, the reason half the morning ferry carries towels.',
   delivery:'Ice boxes on the morning car ferry; the empties come back on the evening sailing.'},
  'fujita-shed':{name:'Mr Fujita’s shed on the pier',contact:'Mr Fujita',lines:['Umineko lager, large bottles'],
   why:'Twenty-four to forty-nine large bottles a day, three small glasses a bottle, poured from the armchair in front of the television.',
   delivery:'Six every morning at the pier root: the day’s crates down, yesterday’s empties up off his floor. Returnable bottles, counted by Grandmother Higa.'},
 },
 frontrow:{
  office:{name:'Johansson Harbour Office',owner:'Johansson',lines:['log books for tides and freight','A4 copy paper','carbon receipt books'],
   why:'The harbour’s records: tide tables, freight manifests and receipts for the ferry.',
   delivery:'Reiko drops it off on her way to the evening press.'},
  'mayor-office':{name:'the mayor’s office',owner:'Johansson',lines:['A4 copy paper','envelopes','account ledgers','cellophane tape'],
   why:'Minutes, letters to the main island, the town accounts and the notice board.',
   delivery:'With the Monday paper round.'},
  school:{name:'the island school',contact:'the head teacher',lines:['exercise books','pencils','glue'],
   why:'A new term’s exercise books, and the glue that is always running out.',
   delivery:'The week before term, in boxes the children carry in.'},
  koban:{name:'Minato Police Station',owner:'Officer Mori',lines:['the incident book','ballpoint pens'],
   why:'The incident book has to be the right kind, and pens disappear from a police station.',
   delivery:'Officer Mori collects it himself.'},
  market:{name:'Sakura Shōten',owner:'Thuan',lines:['receipt rolls','account ledgers','price-gun labels'],
   why:'The till’s receipt rolls, Sakura’s own trade ledgers, and labels for the price gun.',
   delivery:'Whenever Thuan visits her sister.'},
 },
});
/** Sakura's trade accounts (the business site id → its order). */
export const TRADE_ACCOUNTS=ACCOUNTS.sakura;
/** What a business buys from Sakura. */
export const accountOf=site=>TRADE_ACCOUNTS[site]||null;
/** Which businesses buy this Sakura line, by site id. */
export const tradeBuyersOf=id=>Object.entries(TRADE_ACCOUNTS).filter(([,a])=>a.lines.includes(id)).map(([site])=>site);
/** Which businesses take their flowers and decorations from Sakura (the florist's old round). */
export const decorBuyers=()=>Object.entries(TRADE_ACCOUNTS).filter(([,a])=>a.decor?.length).map(([site])=>site);
/** Who supplies a business with what: [{supplier, lines, why, delivery}]. */
export const suppliersOf=site=>Object.entries(ACCOUNTS).filter(([,accounts])=>accounts[site]).map(([supplier,accounts])=>({supplier,...accounts[site]}));
/** Where Sakura's own stock comes from when it is not Thuan's to buy in: beer from the Higas (each product's supplier). */
export const SOURCED_FROM=Object.freeze(Object.fromEntries(PRODUCTS.filter(p=>p.supplier!=='sakura').map(p=>[p.id,p.supplier])));
