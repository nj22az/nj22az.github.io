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
