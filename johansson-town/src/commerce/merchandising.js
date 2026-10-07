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

export const MERCHANDISING=Object.freeze({
 // The cold cabinet: tea and water nearest the door side, beer at the end nearest the till.
 tea:{zone:'drinks',for:['Grandmother Higa','Mrs Miyagi','Thuan'],why:'The everyday bottle: with lunch, on a hot walk, on the verandah.',placed:'First column, eye level: the drink most people come in for is the first one they see.'},
 coffee:{zone:'drinks',for:['Mr Toguchi','Harbour master','Bus driver','Postman Tōma'],why:'A sweet canned coffee before a dawn shift or between rounds.',placed:'Under the tea, where a working hand reaches without looking.'},
 water:{zone:'drinks',for:['Riku','Haru','Officer Mori'],why:'Spring water for runs, patrols and long afternoons on the quay.',placed:'Second column, eye level: the second most asked-for drink.'},
 orange:{zone:'drinks',for:['Mina','Jun','Mrs Nakamura'],why:'Mandarin juice for a child’s lunch, or a breakfast in a hurry.',placed:'Low in the juice column, at a child’s reach.'},
 cola:{zone:'drinks',for:['Kōji','Riku','Emi Kado'],why:'A cold cola after school or a shift.',placed:'Eye level in the third column: the impulse drink.'},
 soda:{zone:'drinks',for:['Vy','Mina','Jun'],why:'Ramune with the marble: the summer drink children ask for by name.',placed:'Low under the cola, where children look.'},
 milk:{zone:'drinks',for:['Mrs Higa','Mrs Yonamine','Thao'],why:'For the morning tea, the children, and the bathhouse fridge when it runs out.',placed:'Top of the last column: for people who knew what they came for.'},
 beer:{zone:'drinks',for:['Barfly','Tetsuo','Uncle Kinjō','Johansson'],why:'Umineko lager for the evening at home, the boat, or the walk to Minato.',placed:'The column nearest the till: beer is the last thing picked up, and Thuan sees who buys it.'},
 // The open chiller: rice balls at eye level, the bento under them; sandwiches over bread; pudding over yoghurt.
 rice:{zone:'fresh',for:['Thuan','Chin','Postman Tōma','Officer Mori'],why:'The lunch eaten standing up: plum onigiri, made this afternoon.',placed:'Eye level in the chiller: the shop’s best seller where nobody has to look for it.'},
 bento:{zone:'fresh',for:['Mr Shimabukuro','Tetsuo','Mr Tamaki'],why:'A proper lunch for people who cannot leave their work: the power house, the workshop, the office.',placed:'Under the rice balls: the dearer lunch beside the cheap one.'},
 sandwich:{zone:'fresh',for:['Johansson','Reiko','Emi Kado'],why:'Egg sandwiches eaten at a desk or on the ferry.',placed:'Middle bay, eye level, over the bread it is made from.'},
 bread:{zone:'fresh',for:['Mrs Nakamura','Mrs Yonamine','Mrs Kinjō'],why:'Milk bread for tomorrow’s breakfast.',placed:'Under the sandwiches: the household buy below the snack.'},
 pudding:{zone:'fresh',for:['Vy','Nhung','Grandmother Higa'],why:'A small treat: after homework, after a long shelf, after the bath.',placed:'Top deck of the last bay: the treat at eye level, where it is hard to walk past.'},
 yogurt:{zone:'fresh',for:['Mrs Miyagi','Haru','Mrs Higa'],why:'Plain yoghurt for a light breakfast and a careful stomach.',placed:'Under the pudding, for the people with good intentions.'},
 // Pantry: noodles, soup and curry on one face; soy sauce and the tins on the other.
 noodles:{zone:'pantry',for:['Kōji','Barfly','Riku'],why:'Cup noodles for a late night or a typhoon day indoors.',placed:'Pantry, front face: quick food first.'},
 soup:{zone:'pantry',for:['Mrs Kinjō','Mr Ōshiro','Thao'],why:'Miso sachets for one bowl when cooking a pot is too much.',placed:'Beside the noodles: the other thing you add hot water to.'},
 curry:{zone:'pantry',for:['Mrs Nakamura','Mrs Yonamine','Mrs Sato'],why:'Curry roux for a family dinner; Mrs Sato swears it is not for the shop.',placed:'Pantry, front face, low: a heavy box for a cook who comes back every week.'},
 soy:{zone:'pantry',for:['Mrs Sato','Thao','Mrs Miyagi'],why:'Soy sauce for a kitchen that ran out mid-service.',placed:'Pantry, back face: the staple, found by people who already know where it is.'},
 tuna:{zone:'pantry',for:['Uncle Kinjō','Mr Tamaki','Haru'],why:'Tinned tuna for onigiri at home and for the cat that is not officially fed.',placed:'Back face, with the other tins.'},
 peaches:{zone:'pantry',for:['Grandmother Higa','Mrs Higa'],why:'Tinned peaches for visiting someone who is ill, as one does.',placed:'Back face, high: an occasional buy, not in the way.'},
 // Sweets: crisps and crackers at a grown-up's eye, chocolate and sweets low for children.
 chips:{zone:'sweets',for:['Barfly','Kōji','Jun'],why:'Salted crisps with a beer or a baseball game on the radio.',placed:'Front face at a grown-up’s eye, seen on the way back from the beer.'},
 crackers:{zone:'sweets',for:['Grandmother Higa','Mr Ōshiro','Mrs Kinjō'],why:'Soy rice crackers with tea, for visitors.',placed:'Front face, the low boards: a big bag for visitors, easy to lift down, under the crisps.'},
 biscuit:{zone:'sweets',for:['Nhung','Reiko','Thuan'],why:'Butter biscuits for a reading afternoon or a night at the press.',placed:'Front face, top: the gift-sized packet where it can be seen.'},
 chocolate:{zone:'sweets',for:['Vy','Mina','Jun'],why:'Milk chocolate after school.',placed:'Back face, low: at a child’s eye, below a parent’s.'},
 candy:{zone:'sweets',for:['Mina','Jun','Vy'],why:'Fruit sweets, the ten-yen kind of treat.',placed:'The lowest shelf of the back face, where small hands find it first.'},
 // Daily goods, nearest the till: washing and paper, the bathroom; batteries and stationery.
 detergent:{zone:'daily',for:['Mrs Yonamine','Mrs Nakamura','Mrs Higa'],why:'Laundry powder: the bathhouse towels and a family’s week.',placed:'Bottom of the front face: the heaviest thing in the shop, low and near the door out.'},
 soap:{zone:'daily',for:['Mrs Higa','Mrs Miyagi','Thuan'],why:'Sakura soap for the bath and the shop’s own washroom.',placed:'Above the detergent: washing beside washing.'},
 tissues:{zone:'daily',for:['Mrs Kinjō','Reiko','Officer Mori'],why:'Tissues for hay fever, a cold, or a sad film.',placed:'Front face, next bay: bulky and light, at hand height.'},
 toothpaste:{zone:'daily',for:['Haru','Emi Kado','Johansson'],why:'Mint toothpaste, the thing you notice has run out at night.',placed:'Above the tissues, with the bathroom.'},
 battery:{zone:'daily',for:['Chin','Tetsuo','Harbour master'],why:'Dry cells for radios, torches and the harbour lamp.',placed:'Back face, nearest the till: small, dear and easy to pocket, so Thuan can see them.'},
 notebook:{zone:'daily',for:['Johansson','Reiko','Vy'],why:'Pocket notebooks for tide times, articles and homework.',placed:'Beside the batteries: stationery with the small things.'},
 postcard:{zone:'daily',for:['Johansson','Emi Kado','Nhung'],why:'Harbour postcards for visitors and for letters to the main island.',placed:'Back face, by the till, beside the stamps Thuan sells.'},
 // The counter.
 bun:{zone:'counter',for:['Officer Mori','Bus driver','Kōji','Vy'],why:'A steamed pork bun to eat walking out of the door.',placed:'In the steamer on the counter: smelt while paying, bought on impulse.'},
});
/** Which shelf fittings each zone is (sakura-layout.js SAKURA_SHELVES): the test reads them. */
export const ZONE_OF_SHELF=Object.freeze({fridge:'drinks',chiller:'fresh',west:'pantry',middle:'sweets',east:'daily',steamer:'counter'});
/** Who in town would buy this line. */
export const buyersOf=id=>MERCHANDISING[id]?.for||[];
/** What a resident would plausibly pick up in Sakura. */
export const linesFor=name=>Object.entries(MERCHANDISING).filter(([,m])=>m.for.includes(name)).map(([id])=>id);

/**
 * Who supplies whom. Three wholesalers keep the town's businesses going, each in its own trade:
 *
 *   sakura        Sakura Shōten, from its depot in the Quay Warehouse (Sakura Trading): the
 *                 everyday goods — drinks, food, washing, paper goods, batteries.
 *   higa-saketen  Higa Liquor in Nishi-machi: all the alcohol. Sakura's beer comes from the Higas,
 *                 and so do Minato's bottle keep and tap and Sato Ramen's bottles.
 *   frontrow      Front-Row Books & Stationery: paper, ledgers, pens and envelopes for the town's
 *                 offices, the school and the police box.
 *
 *   rainflower-florist  Rainflower Florist on the lane: decorations — the season's window dressing,
 *                 festival trimmings, lanterns and wreaths — for the shops, the bar and the town hall.
 *
 * An account is what one business orders from one supplier: owner (who places the order, or
 * contact when it is a post rather than anyone in the cast),
 * lines (what), why (what it is for) and delivery (when and how it arrives). Lines are
 * SHOP_STOCK ids for Sakura; the other suppliers' goods are named in their own lists.
 */
export const SUPPLIERS=Object.freeze({
 sakura:{name:'Sakura Shōten (Sakura Trading)',owner:'Thuan',depot:'warehouse',goods:'Everyday goods: drinks, food, washing, paper goods, batteries.'},
 'higa-saketen':{name:'Higa Liquor',owner:'Grandmother Higa',goods:'Beer, awamori, sake and shōchū.',
  stock:['Umineko lager, crates and kegs','awamori, from the 180 ml bottles to the clay kame','sake for warming','shōchū for the mixes']},
 'rainflower-florist':{name:'Rainflower Florist',owner:'Mrs Kinjō',goods:'Flowers and decorations: the season’s window dressing, festival trimmings, wreaths.',
  stock:['seasonal window decorations','Tanabata bamboo and paper strips','New Year kadomatsu and shimenawa','paper lanterns and festival bunting','wreaths and table flowers']},
 frontrow:{name:'Front-Row Books & Stationery',owner:'Nhung',goods:'Office supplies and stationery.',
  stock:['A4 copy paper by the ream','account ledgers and receipt books','ballpoint pens by the box','envelopes, long and square','cellophane tape and glue']},
});

export const ACCOUNTS=Object.freeze({
 sakura:{
  izakaya:{name:'Minato Izakaya',owner:'Thao',lines:['soy','water','orange','tissues','detergent','battery'],
   why:'Soy for the grill, water for chasers, mandarin juice for the shōchū mixes, table tissues, cloth washing, and batteries for the karaoke microphone.',
   delivery:'Two crates on the trolley at three, before the noren goes up; Thao signs for it.'},
  ramen:{name:'Sato Ramen',owner:'Mrs Sato',lines:['soy','tea','detergent'],
   why:'Soy to top up the tare, tea for the counter, and powder for the towels.',
   delivery:'At half past ten, while the stock comes up to the boil.'},
  onsen:{name:'Umi-no-yu',owner:'Mrs Higa',lines:['milk','soda','soap','detergent'],
   why:'Bottled milk and ramune for the fridge by the bandai — the after-bath drink — soap for the washing stools, and powder for the towels.',
   delivery:'Mornings before the bath opens; the milk crate is the heaviest thing Thuan carries all week.'},
  frontrow:{name:'Front-Row Books & Stationery',owner:'Nhung',lines:['tea','biscuit','battery'],
   why:'Tea and biscuits for the reading corner, batteries for the press-room radio.',
   delivery:'Thursdays, when the evening paper is set and there is a quiet hour.'},
  form3d:{name:'Chin & Tetsuo Repairs',owner:'Chin',lines:['battery','coffee','rice'],
   why:'Batteries by the box for testing radios, canned coffee for the bench, and a lunch order of rice balls.',
   delivery:'Lunch at noon on the bicycle; batteries when Tetsuo remembers to ask.'},
  office:{name:'Johansson Harbour Office',owner:'Johansson',lines:['battery','coffee','tea','water'],
   why:'Batteries for the quay lamps, and drinks for the crews.',
   delivery:'With the first ferry, on the harbour cart.'},
  koban:{name:'Minato Police Box',owner:'Officer Mori',lines:['water','rice','battery'],
   why:'Water and a rice ball for the night patrol, batteries for the torch.',
   delivery:'Officer Mori collects it himself, at closing, and calls it a patrol.'},
  'mayor-office':{name:'the mayor’s office',owner:'Johansson',lines:['tea','crackers','tissues'],
   why:'Tea and rice crackers for visitors, and tissues for difficult meetings.',
   delivery:'Mondays, carried up the Community Hall stairs.'},
  'community-kitchen':{name:'the community kitchen',owner:'Mrs Nakamura',lines:['curry','soy','tuna','rice'],
   why:'The Saturday curry for the whole street, and onigiri for the volunteers.',
   delivery:'Friday evening, so the pot can start early.'},
  school:{name:'the island school',contact:'the head teacher',lines:['milk','tissues'],
   why:'School milk, and tissues every hay-fever season.',
   delivery:'First thing on Mondays, by the school gate.'},
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
  'fujita-shed':{name:'Mr Fujita’s shed on the pier',contact:'Mr Fujita',lines:['Umineko lager, large bottles'],
   why:'Twenty-four to forty-nine large bottles a day, three small glasses a bottle, poured from the armchair in front of the television.',
   delivery:'Six every morning at the pier root: the day’s crates down, yesterday’s empties up off his floor. Returnable bottles, counted by Grandmother Higa.'},
 },
 'rainflower-florist':{
  market:{name:'Sakura Shōten',owner:'Thuan',lines:['seasonal window decorations','Tanabata bamboo','New Year shimenawa'],
   why:'Sakura’s windows follow the town calendar: the season’s dressing goes up the week before every festival.',
   delivery:'The Sunday before each festival, after closing; Mrs Kinjō dresses the window herself.'},
  izakaya:{name:'Minato Izakaya',owner:'Thao',lines:['paper lanterns','a vase of flowers for the counter'],
   why:'Fresh lanterns when the old ones fade, and one stem on the counter that Thao pretends not to care about.',
   delivery:'Flowers on Mondays; lanterns when the typhoon has had the last ones.'},
  'mayor-office':{name:'the mayor’s office',owner:'Johansson',lines:['ceremony wreaths','festival bunting','a garland for the Merry Moose'],
   why:'Openings, prize days and the town’s festivals, and the moose is dressed for every one of them.',
   delivery:'The morning of each ceremony, carried up the Community Hall stairs.'},
  onsen:{name:'Umi-no-yu',owner:'Mrs Higa',lines:['seasonal flowers for the bandai'],
   why:'A small vase on the bandai, changed with the season, the first thing a bather sees.',
   delivery:'Every other Saturday, before the bath opens.'},
  school:{name:'the island school',contact:'the head teacher',lines:['sports day bunting','graduation flowers'],
   why:'Sports day in the autumn and the graduation in March.',
   delivery:'The day before, with the children helping to carry.'},
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
  koban:{name:'Minato Police Box',owner:'Officer Mori',lines:['the incident book','ballpoint pens'],
   why:'The incident book has to be the right kind, and pens disappear from a police box.',
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
/** Who supplies a business with what: [{supplier, lines, why, delivery}]. */
export const suppliersOf=site=>Object.entries(ACCOUNTS).filter(([,accounts])=>accounts[site]).map(([supplier,accounts])=>({supplier,...accounts[site]}));
/** Where Sakura's own stock comes from when it is not Thuan's to buy in: beer from the Higas. */
export const SOURCED_FROM=Object.freeze({beer:'higa-saketen'});
