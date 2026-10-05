/**
 * The resident bible as magazine articles: one feature per person you can meet, written as the
 * island's own monthly would print it in autumn 1997, and illustrated by a photo shoot in the
 * game's photo studio (tools/render-resident-shoot.mjs renders `photos` into
 * assets/images/residents/shoot/). Merged into guide/residents.json by tools/apply-articles.mjs.
 *
 * Photos: pose and expression from src/photo/layout.js, backdrop and film from src/photo/sets.js,
 * `with` another resident in the same frame.
 */
const shot=(pose,expression,backdrop,film,caption,extra={})=>({pose,expression,backdrop,film,caption,...extra});

export const ARTICLES={
 Johansson:{
  headline:'The man who reads the island like a wiring diagram',
  standfirst:'He came for a broken harbour radio and stayed to run the office upstairs from the ferry hall. Our correspondent spent a day trying to keep up.',
  body:[
   'Johansson keeps two notebooks. One is for the Harbour Office: tide tables, freight, the service record of every winch on the quay. The other is for everything else, and it is fuller. He walks the long way to the workshop on purpose, he says, because the short way never teaches you anything.',
   'It was a dead radio that first brought him to Kenji and Tetsuo’s bench, and the habit stuck. On a quiet afternoon you will still find him there, testing something nobody asked him to fix. Upstairs at the Community Hall his desk was the headmaster’s once; the chair still squeaks, and a good-luck moose watches the accounts from its plinth by the wall.',
   'He is excited about the airport and stubborn about everything it must not replace: the bookshop, the bathhouse, the working boats, the corner shop where Thuan knows when a long day calls for tea instead of another question. Most evenings end with a late supper at Minato. He insists this is research.',
  ],
  quote:'A town is a machine that runs on people remembering each other. You keep the small parts oiled.',
  photos:[shot('Think','thinking','sky','film','Plans for a quay that still has room for the boats.'),shot('Laugh','laugh','sunset','warm','Supper at Minato, “for research”.',{with:'Thuan'})],
 },
 Thuan:{
  headline:'Sakura’s shopkeeper knows what you need before you ask',
  standfirst:'From a notebook of supplier names to the island’s best-run shelves: Thuan built Sakura Shōten one delivery at a time.',
  body:[
   'Thuan came from Vietnam with a notebook and a plan, and wrote every supplier’s name in it the first year. Now she can tell the harbour cart from the bakery van by the sound of its wheels. The shelves are tea, rice, soap and batteries, but the regulars come for the advice, and for the onigiri she sets aside before the lunch crowd arrives.',
   'Her name is on nearly every line of the staff roster in the back room. At the bottom, in her own hand, she has appointed an assistant manager: the potted palm. In the corner by the delivery door stands a figurine of her, a present from the mayor’s office. She says it is too much. She dusts it every morning before the rice comes in.',
   'She shares a house with Nao, whose evenings end as her mornings begin; they trade leftovers, gossip and instructions to sleep. After closing she walks, visits Mrs Kinjō for flowers, and chooses a good meal with the seriousness of a buyer at auction. Johansson has become a regular companion at those dinners. The plans for Sakura’s future are hers, and she will build them at her own pace.',
  ],
  quote:'People think a shop sells things. A shop remembers people.',
  photos:[shot('HandsOnHips','smile','peach','warm','Behind the till: “Oldest stock at the front.”'),shot('Peace','happy','hearts','vivid','After closing, with Nao, who has just woken up.',{with:'Nao'})],
 },
 Nao:{
  headline:'Minato never closes — it just changes who is holding the mop',
  standfirst:'Nao’s izakaya opens at four. The pink telephone, the bottle keep and the karaoke all answer to her.',
  body:[
   'At four o’clock Nao hangs the noren and the evening begins: lanterns, the pink ¥10 telephone by the door, a laserdisc karaoke that takes its time finding the disc. Regulars keep their own bottles on the shelf behind the counter, each with a tag in Nao’s careful hand. Keep one yourself and she will warn you that being a regular is worse for you than it sounds.',
   'Kenji has won the last-Friday karaoke contest three times running. The police notice by the door asks drivers not to drink; Officer Mori put it up himself and then sat under it with a beer. He walked home. Nao tells this story more often than Mori would like.',
   'At three in the morning the cushions are stacked and Nao wipes the counter down while the Barfly mops. She goes home to the house she shares with Thuan, sleeps until noon, and is back at her station by three to prep. The amber corner by the window is kept for unhurried conversations. She will not turn it into a hurried table, however full the room.',
  ],
  quote:'The spare chair is for whoever arrives last. Somebody always does.',
  photos:[shot('Laugh','laugh','sunset','warm','Last orders, which at Minato is a suggestion.'),shot('Clap','happy','night','vivid','Karaoke night. Kenji is already queueing.',{with:'Kenji'})],
 },
 Barfly:{
  headline:'The regular who lives at the end of the counter',
  standfirst:'He has a stool, a tab and a broom. We asked the Barfly how a man ends up working off his drinks one sweep at a time.',
  body:[
   'Nobody at Minato uses his name; the Barfly prefers it that way. He sits on the stool at the kitchen end of the counter, the one with the best view of the lanterns, and he knows when a hook is loose before anyone looks up. Last buses come and go without disturbing the arrangement.',
   'When Minato shuts at three he stacks the cushions. From four until ten he sleeps on that same stool, and somebody always puts a jacket over him. Then he works off his tab: sweeping until noon, washing and polishing the glasses until two, mopping, and wiping the tables down for the evening while Nao preps.',
   'He says the tab is nearly paid. Nao says the same thing, in a different tone. Both of them seem quite happy with the arrangement, which has outlasted several menus and one karaoke machine.',
  ],
  quote:'A bar is only as clean as its most loyal customer.',
  photos:[shot('Idle','sleep','night','mono','Four in the morning, asleep on his feet. Somebody will find him a jacket.'),shot('Shrug','content','cream','sepia','On the tab: “Nearly paid.”')],
 },
 'Mrs Sato':{
  headline:'Lunch at Sato Ramen is three hours long and sixty years deep',
  standfirst:'Mrs Sato buys her fish at dawn, feeds the harbour at noon and washes every bowl herself. Her autograph boards tell the rest.',
  body:[
   'Her morning starts at the harbour, choosing fish for the stock while the auction is still shouting. By half past ten she is at the pots in the kitchen she shares with Nao. Lunch runs from eleven to two, and the ticket machine sells your bowl if it is in the mood; when it is not, she takes the money over the counter. Miso ramen with butter and corn is the autumn bowl, ¥500.',
   'On the wall hang three autograph boards: a television presenter who came for the Hārī, the 1996 Seagulls squad, and Kayoko Shima, who sang at the harbour hall, ate two bowls and left a tip folded into a crane. At noon Mrs Sato carries two bowls in the aluminium okamochi to the harbour office, very fast and very level. She delivers to the harbour only. Anywhere else, she says, they can walk.',
   'After two she washes up and wipes down until three, then takes the first quiet cup of the day with Nao. On Wednesdays the shop is shut so she can make the week’s stock. She notices who has eaten and who has only said so.',
  ],
  quote:'Sit down. You can tell me how your morning went after you have eaten.',
  photos:[shot('Bow','smile','cream','warm','Eleven o’clock: the stools come down.'),shot('HandsOnHips','content','peach','film','Wednesday. Stock day. Do not knock.')],
 },
 Aya:{
  headline:'The bookseller who marks the funny parts',
  standfirst:'Front-Row Books has a window seat, a cat who refuses aprons, and Aya’s paper slips in every other volume.',
  body:[
   'Aya’s recommendations come on little slips of paper tucked between the pages. Pocket poetry, island histories and practical sea guides fill the shelves, and the second-hand paperbacks come with her pencil marks in the margins wherever something made her laugh.',
   'She shares a home with Reiko, so a bookshop day often continues as an argument about the evening paper. Tama the shop cat has refused, on principle and permanently, to wear the tiny apron she once made him. Johansson gets the unusual technical books first; she saves them under the counter.',
   'Her ambition is a whole shelf of books by island residents. So far it holds a tide table, a cookbook from the Community Hall and a book of poems she will not say she wrote.',
  ],
  quote:'Every book in here has been read at least once on that window seat. Some of them twice.',
  photos:[shot('Coy','shy','mint','film','The window seat, reserved.'),shot('Point','happy','cream','warm','“That one. Trust me.”',{with:'Reiko'})],
 },
 Kenji:{
  headline:'Kenji’s workbench: where repairs become experiments',
  standfirst:'The dock workshop fixes everything from winches to rice cookers. It also wins karaoke contests.',
  body:[
   'Kenji lines up his tools before he touches anything new, and then he improves it. Ask him to mend a radio and it may come back with a better aerial, a louder speaker and a screw left over, which Tetsuo will find and hold up in silence.',
   'The two of them share the workshop and the house, which means their argument about volume has no closing time. Johansson stops by on quiet afternoons; the harbour office’s equipment is in their hands more often than the harbour master admits.',
   'On the last Friday of every month he becomes another person entirely: Minato’s karaoke champion, three titles in a row. The prize is a bottle on Nao’s keep shelf with his name on it. He has not opened any of them.',
  ],
  quote:'A good repair should look like nobody touched it.',
  photos:[shot('Tada','happy','sky','vivid','Fixed. Probably better.'),shot('Cheer','laugh','night','warm','Karaoke champion, third year running.')],
 },
 Tetsuo:{
  headline:'Tetsuo listens to radios the way other people listen to friends',
  standfirst:'The workshop’s radio man treats static as conversation and keeps receivers singing long after their owners give up.',
  body:[
   'Tetsuo turns a tuning knob as though the radio might answer back, and on a good day it does. Old valve sets, ship receivers, the counter radio at Minato: he handles them gently, and he will not be rushed.',
   'Kenji has repaired Tetsuo’s own radio twice. Tetsuo keeps finding extra screws. Their disagreements about volume began at the workbench and followed them home, where they now share a house and an opinion that the other one is too loud.',
   'In the evenings he sometimes brings a set down to Minato and plays the counter radio for Nao: weather bulletins, enka, the baseball. A clear broadcast after a difficult repair is, he says, the best sound on the island.',
  ],
  quote:'Static is just a station that has not said its name yet.',
  photos:[shot('Think','thinking','cream','sepia','Tuning in to something only he can hear.'),shot('Shrug','grumpy','mint','film','“He left another screw.”',{with:'Kenji'})],
 },
 Reiko:{
  headline:'The editor whose best source never has anything to report',
  standfirst:'Reiko prints the evening paper from a desk in the bookshop. Officer Mori supplies the news, when there is some.',
  body:[
   'Reiko taps her pencil twice before she asks the real question. The evening paper is set at a desk at the back of Front-Row Books, where the press shares the room with Aya’s poetry and the smell of ink stays in the shelves.',
   'Officer Mori writes beautiful incident reports. Unfortunately, nothing ever happens. He once gave her three pages in reply to a request for a statement; she printed the part about his lunch. They remain good friends, mostly because he keeps reading the paper.',
   'She wants to print a town paper people keep rather than throw away. The ferry timetable, the tide table and the typhoon map are her most clipped pages, and she is quietly proud of every one of them.',
  ],
  quote:'Nothing happened today is also news. It just needs a better headline.',
  photos:[shot('Point','thinking','cream','mono','Deadline in an hour.'),shot('Laugh','laugh','polka','vivid','The incident report, page three: lunch.',{with:'Officer Mori'})],
 },
 'Officer Mori':{
  headline:'Night patrol with the island’s most thorough policeman',
  standfirst:'Officer Mori walks Main Street after dark, writes everything down and still cannot get the cat to respect him.',
  body:[
   'Mori takes the ordinary safety of the streets seriously. His night patrol is slow and exact: Main Street, the seawall, the lanes behind the shops, a look in on an elderly neighbour on the way back to the kōban. He wants the streets to feel safe without feeling watched.',
   'His reports are three pages long and supply Reiko’s evening paper with more detail than incident. The cat outside Sakura declines to acknowledge his authority, a long-running difficulty he records conscientiously.',
   'The drink-driving notice at Minato is his. He put it up himself and then, off duty, sat under it with a beer. He walked home. He would like that to be in the paper too, as an example.',
  ],
  quote:'Nothing happened tonight. I wrote it down so we will know.',
  photos:[shot('Bow','neutral','night','film','Off on patrol at ten.'),shot('Wave','smile','sky','warm','Morning, after the night shift.')],
 },
 'Harbour master':{
  headline:'The harbour master trusts the tide board more than the radio',
  standfirst:'Cargo, ferries, a changing forecast and a lunch delivered by okamochi: a day at the harbour office.',
  body:[
   'He checks the tide board before the radio forecast and his knees before either. The harbour office desk holds the manifests, the passenger lists and the timetable that the duty clerk reads aloud whenever anyone rings from Minato’s pink telephone.',
   'At noon Mrs Sato arrives with two bowls in her aluminium delivery box. She delivers to the harbour only, which he takes as a professional courtesy and the harbour staff take as a perk of the job.',
   'A working harbour teaches patience with tides and with people. When equipment misbehaves he sends for the dock workshop; when a visitor is lost he points them to the right door. He likes watching the morning cargo come in, and he likes it more when it arrives on time.',
  ],
  quote:'The sea is always on time. It is the boats you have to wait for.',
  photos:[shot('Point','neutral','sky','film','Next ferry: on the board, and on time.'),shot('Idle','content','cream','sepia','Noon. The okamochi is on its way.')],
 },
 'Bus driver':{
  headline:'Every story on the Harbour Line starts at the last stop',
  standfirst:'The bus driver collects opening sentences from his passengers and waits at the terminus for the endings.',
  body:[
   'His route connects work, shopping and the last journey home. He notices who is carrying groceries, who has missed lunch and who just wants a little company at the terminus, and he recognises the regulars by the way they wave at the stop.',
   'The airport has brought new faces to remember. He welcomes them without changing his affection for the old stops, the coastal loop in the evening light most of all.',
   'Grandmother Higa can still hear a bus coming before it clears the tunnel; her husband drove this route for thirty years. The driver considers that the highest standard in his profession, and drives accordingly.',
  ],
  quote:'People tell a bus driver how their story begins. If you wait at the terminus long enough, you hear how it ends.',
  photos:[shot('Wave','smile','sunset','warm','The last coastal loop.'),shot('Bow','happy','cream','film','Mind the step.')],
 },
 'Mrs Higa':{
  headline:'Thirty years on the bandai at Umi-no-yu',
  standfirst:'Mrs Higa takes your coins without looking up from her crossword, and she has never once missed who came in.',
  body:[
   'The bandai is a raised seat by the door of Umi-no-yu, the island’s bathhouse, and Mrs Higa has kept it for thirty years. From up there she can see over the counter, which is the point of a bandai. Three hundred yen, swimwear in the bath, please: it is a family bath.',
   'She reads, does the crossword and sits very still, and she knows everyone’s bath time better than their families do. The rock bath is best after dark, she will tell you, if you ask, and you should.',
   'Her mother-in-law, Grandmother Higa, keeps the family verandah in Nishi-machi and the family opinions everywhere else. Between them, the Higa women have the island’s comings and goings well covered.',
  ],
  quote:'Wash first. Then soak. Then tell me the news.',
  photos:[shot('Think','content','mint','sepia','At the bandai, one clue from finishing.'),shot('Wave','smile','peach','warm','Three hundred yen, please.')],
 },
 'Grandmother Higa':{
  headline:'Grandmother Higa has a seat for you and an opinion about your onions',
  standfirst:'Her house stood before the war. From its verandah she hears the bus before it leaves the tunnel.',
  body:[
   'Sit a moment, she says, and you will. Grandmother Higa offers a seat, an observation about Sakura, and practical advice on preparing a house for typhoon season, in that order.',
   'Her husband drove the bus for thirty years. She approves of the way Thuan counts change carefully at Sakura, and she will occasionally allow a visitor to correct her about the name of an onion.',
   'Her daughter-in-law keeps the bandai at Umi-no-yu. The verandah remains Grandmother Higa’s own, a place where island time slows down enough for anyone to catch up.',
  ],
  quote:'You are the one who talks to the girl at Sakura every day. Good. Somebody should.',
  photos:[shot('Wave','smile','cream','sepia','Sit a moment. The verandah, Nishi-machi.'),shot('Point','thinking','mint','film','That is not a shallot.')],
 },
 'Mr Ōshiro':{
  headline:'A sabani from 1968 and the man who will not sell it',
  standfirst:'Mr Ōshiro built his boat from Yakushima cedar. He still scrapes and tars her by hand.',
  body:[
   'The cedar came from Yakushima before you could not get it any more. He built her in 1968 and will tell you, if you ask, the difference between a repair and a replacement.',
   'Fourth place in the 1979 race remains a perfectly respectable subject for conversation. His son recommends fibreglass. Mr Ōshiro sees no reason to replace something that has carried him this far.',
   'His yard is a place to stand and watch patient hands. The airport has changed the horizon; it has not changed the tar.',
  ],
  quote:'You do not own a boat like this. You look after her for the next one.',
  photos:[shot('Crouch','content','sky','film','Scraping the hull, as every spring.'),shot('HandsOnHips','happy','sunset','warm','Fourth place, 1979.')],
 },
 'Uncle Kinjō':{
  headline:'The tide is wrong, says Uncle Kinjō. The tide is always wrong.',
  standfirst:'He fishes from the seawall twice a day, guards his bait from the net-shed cat and waits for gurukun.',
  body:[
   'Uncle Kinjō fishes from five until ten, and again in the late afternoon. The fish are not biting; the tide is wrong; the cat has designs on the bait. He stays anyway.',
   'His son runs the quay ice plant, which Kinjō considers proof of sound family judgement. His joke that ice never goes off has yet to receive its due appreciation.',
   'Mrs Kinjō’s rice is always ready before he thinks the fishing should stop. Visitors heading to the seawall are often entrusted with that message.',
  ],
  quote:'Shh. No, it is fine. They are not biting anyway.',
  photos:[shot('Shrug','grumpy','sky','film','The tide, wrong again.'),shot('Laugh','laugh','sunset','warm','The ice joke, one more time.')],
 },
 'Mrs Kinjō':{
  headline:'Rainflower Florist wraps every bouquet in brown paper and a message',
  standfirst:'Mrs Kinjō sells island-grown stems from nine to six, and sends her husband home for supper by anyone walking to the seawall.',
  body:[
   'Buckets of fresh stems, leafy pots and hand-made wreaths fill the open front of the flower shop on Rainflower Lane. Thuan comes after closing; the bouquets for Sakura’s counter are chosen with care on both sides.',
   'Her husband’s fishing timetable rarely agrees with supper. A visitor heading to the seawall may leave with a bouquet and the familiar message that the rice is already waiting.',
   'She wraps everything in plain brown paper, because the flowers should be the bright part.',
  ],
  quote:'Tell him the rice is ready. He will say five more minutes. Tell him again.',
  photos:[shot('Heart','happy','hearts','vivid','Fresh stems, Rainflower Lane.'),shot('Coy','smile','peach','warm','A bouquet for Sakura’s counter.',{with:'Thuan'})],
 },
 'Mrs Nakamura':{
  headline:'Zenzai since 1972, and the shaving machine still sounds like a tractor',
  standfirst:'Mrs Nakamura cooks her beans from six in the morning and shaves the ice only when you order.',
  body:[
   'Kintoki beans, cooked since six. The ice comes from the plant on the quay, and the old shaving machine roars like a tractor; she trusts its work completely.',
   'She has served this corner since 1972. The gateball players come after their matches, and Thuan’s Sunday visit has become another small fixture in the week.',
   'She notices children growing up, shopkeepers taking their breaks and visitors learning to wait for something good.',
  ],
  quote:'Zenzai is not fast food. Sit down.',
  photos:[shot('Bow','smile','polka','vivid','Welcome! Zenzai?'),shot('Laugh','laugh','peach','warm','The machine is loud. The beans are worth it.')],
 },
 'Mr Shimabukuro':{
  headline:'Two diesels, one running, one resting: the man who keeps the lights on',
  standfirst:'Mr Shimabukuro minds the power house. Every light on the island comes through his engine room.',
  body:[
   'Hear that? Two diesels, one running, one resting. Mr Shimabukuro listens to the generators the way a doctor listens to a chest, and he hears a fault before the meters show it.',
   'The second set is to be overhauled before typhoon season; the town assembly minutes say so, and so does he, at length.',
   'Postman Tōma brings his parcels to the power house door. They are usually spare parts.',
  ],
  quote:'You only notice electricity when it stops. I would like you never to notice it.',
  photos:[shot('Think','thinking','cream','mono','Listening to the engines.'),shot('Point','neutral','sky','film','One running, one resting.')],
 },
 'Mrs Yonamine':{
  headline:'Try the parrotfish before you judge it',
  standfirst:'The fish counter opens after the six o’clock auction. By the afternoon it is sold, or claimed by the cat.',
  body:[
   'Irabu-chā, fresh this morning: the blue one, parrotfish, as sashimi with vinegar miso. Mrs Yonamine recommends it to everyone who looks doubtful, and she is usually right.',
   'Kōji brings what the auction leaves; Mr Tamaki’s ice keeps the counter cold. She champions mozuku with the authority of family experience.',
   'She judges the day by what has landed rather than by any printed menu.',
  ],
  quote:'The sea decides the menu. I just write the prices.',
  photos:[shot('Point','happy','sky','vivid','Parrotfish. Try it.'),shot('HandsOnHips','content','cream','film','Sold out by three.',{with:'Kōji'})],
 },
 'Mrs Miyagi':{
  headline:'Every morning at the utaki',
  standfirst:'Mrs Miyagi brings rice, salt and incense to the sacred grove, as she has since she was a girl.',
  body:[
   'She does not turn round straight away. When she does, she smiles as if she had been expecting you.',
   'For Mrs Miyagi the important offering is returning, rather than giving. When the walk becomes too much, her granddaughter will take it up.',
   'The grove keeps a different pace from the shopping street. She is happy for visitors to explore it quietly.',
  ],
  quote:'You come back. That is the whole of it.',
  photos:[shot('Bow','content','mint','sepia','Morning at the utaki.'),shot('Idle','smile','cream','film','Rice, salt and incense.')],
 },
 'Mr Tamaki':{
  headline:'Forty tonnes of ice on a summer day',
  standfirst:'The quay ice plant runs on Mr Tamaki, a wet floor and his father’s favourite joke.',
  body:[
   'Block, crushed, flake. Summer demand can reach forty tonnes a day, and every order is specific. Mind your feet: the floor is wet everywhere, even in August. Especially in August.',
   'He runs the plant while his father, Uncle Kinjō, fishes from the seawall and repeats that ice never goes off.',
   'Ice is easy to overlook until a delivery is late. His work keeps the catch fresh between the boats, the counter and the outgoing freight.',
  ],
  quote:'Ice is just time, frozen. I sell people a little more of it.',
  photos:[shot('HeelKick','happy','sky','vivid','Loading the morning ice.'),shot('Shrug','content','mint','film','Yes, Father. It never goes off.')],
 },
 'Kōji':{
  headline:'The case for tuna-head soup',
  standfirst:'Kōji sorts the catch after the auction. He would like you to take the tuna head. It is free.',
  body:[
   'Auction is done, bro. What is left goes to Mrs Yonamine’s counter or to the freezer, and Kōji sorts it before most of the street is awake.',
   'He has watched a skipper fall asleep at the wheel after a full night’s fishing, and it gave him a clear picture of the work behind every landing.',
   'He likes practical food. He would especially like you to try tuna-head soup.',
  ],
  quote:'You want a tuna head? Free. Great soup.',
  photos:[shot('Peace','happy','sky','vivid','After the auction.'),shot('Laugh','laugh','sunset','warm','Still offering the tuna head.')],
 },
 'Postman Tōma':{
  headline:'Two collections a day, and the postbox is never wrong',
  standfirst:'Postman Tōma walks his round at 10:30 and 16:30. He does not read postcards. The pictures are very nice.',
  body:[
   'The plate on the postbox says 10:30 and 16:30, and Tōma trusts it even on the days he doubts himself. Letters for the Nakasones, a parcel for Mr Shimabukuro at the power house, a postcard for Sakura from somebody in Hanoi.',
   'Letters give him a different map of the island, made of names and remembered doorways. Shopkeepers give him news between parcels.',
   'He does not read postcards. He will admit that some of the pictures are very nice.',
  ],
  quote:'The post box is never wrong. I am sometimes wrong.',
  photos:[shot('Wave','happy','sky','film','On his round.'),shot('Coy','shy','peach','warm','A postcard from Hanoi. He did not read it.')],
 },
 Riku:{
  headline:'Which crate is yours? Ask Riku.',
  standfirst:'He walks the cargo circuit from the morning supply boat to the evening fish dispatch.',
  body:[
   'Rice for Sakura, fuses for the workshop: the containers on the western quay look anonymous until Riku tells you what is inside.',
   'He works around the hoist, keeps the pedestrian passage clear and watches the horizon for the next supply ship.',
   'Emi Kado keeps the paperwork; Riku keeps the crates moving. Between them, very little goes missing.',
  ],
  quote:'Every crate on this quay belongs to somebody’s day.',
  photos:[shot('Point','neutral','sky','film','The morning supply boat.'),shot('HandsOnHips','happy','cream','warm','Cargo for Sakura.',{with:'Emi Kado'})],
 },
 'Emi Kado':{
  headline:'Every parcel gets a line in the freight book',
  standfirst:'Emi Kado records what comes and goes on the quay, and stays to see the late passenger boat home.',
  body:[
   'Every shipment has a paper trail, and Emi keeps it legible. The Community Hall holds a filed copy of her freight notices for a year.',
   'A delivery is checked against a manifest, a correction is initialled, and the dispatch copy waits in the drawer for the question that always comes later.',
   'She treats paperwork as a way to help people trust what reached the island.',
  ],
  quote:'If it is not in the book, it did not arrive.',
  photos:[shot('Think','thinking','cream','mono','The manifest checks out.'),shot('Wave','smile','sunset','warm','Waiting for the late boat.')],
 },
 Haru:{
  headline:'Hoshizaki’s fisherman lands the catch before breakfast',
  standfirst:'Haru grew up above the village pier. The boats and the weather still set his working day.',
  body:[
   'Haru lands the morning catch, collects his lunch from Mina’s store and spends the afternoon mending nets.',
   'The airport carries some of his parcels now, but the weather still decides whether there is anything to send.',
   'What leaves the village as a parcel began as somebody’s early morning. He would like you to remember that.',
  ],
  quote:'The sea gives. You mend the nets anyway.',
  photos:[shot('Crouch','content','sky','film','Mending nets after lunch.'),shot('Laugh','laugh','mint','vivid','Mina remembered his lunch.',{with:'Mina'})],
 },
 Mina:{
  headline:'The store where Hoshizaki meets',
  standfirst:'Mina keeps tea, rice crackers and postcards ready, and hears the village news before it becomes a notice.',
  body:[
   'Her family store opens early and closes before supper. Tea and rice crackers bring the fishing families back; postcards interest the occasional visitor.',
   'She is helping to prepare the guesthouse, without letting the village stop being itself.',
   'She hears about damaged nets, arriving guests and family errands before anyone writes them down.',
  ],
  quote:'Visitors are welcome. They should come at our pace.',
  photos:[shot('Bow','smile','peach','warm','Opening up.'),shot('Heart','happy','hearts','vivid','Postcards, three for a hundred.')],
 },
 Jun:{
  headline:'Kitano-jima’s airport clerk checks the sky first',
  standfirst:'Jun checks commuter tickets, cabin bags and the weather before every boarding.',
  body:[
   'Jun lives beside the terminal and takes lunch on the passenger walkway, watching the windsock.',
   'Maintenance records go through the dock workshop and the Community Hall; Jun knows a flight depends on people far beyond the boarding counter.',
   'The terminals are growing. The job, Jun says, is still about answering one passenger’s question properly.',
  ],
  quote:'A flight is on time when everybody on the ground was.',
  photos:[shot('Point','neutral','sky','film','Boarding in ten minutes.'),shot('Wave','happy','sunset','warm','The last commuter flight.')],
 },
};
