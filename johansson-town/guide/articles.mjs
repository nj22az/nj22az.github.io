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
  headline:'The mayor who reads the island like a wiring diagram',
  standfirst:'He crosses from Kitano-jima on the morning boat, runs Minato-chō from the town hall and still finds time for a broken radio. Our correspondent spent a day trying to keep up.',
  body:[
   'Johansson is the mayor of Minato-chō, and he keeps two notebooks. One is for the town hall: the assembly minutes, the budget, the ferry timetable and the list of roofs to check before typhoon season. The other is for everything else, and it is fuller. He walks the long way to the workshop on purpose, he says, because the short way never teaches you anything.',
   'His day starts on Kitano-jima, at breakfast with Thuan in the house at the end of the hamlet lane, and the morning crossing on the Minato Maru gets him to his office by half past eight. Lunch is at Sato Ramen. The crossing home is at half past six, and Grandmother Chinen at the end of the lane watches him come up it.',
   'It was a dead radio that first brought him to Chin and Tetsuo’s bench, and the habit stuck. On a quiet afternoon you will still find him there, testing something nobody asked him to fix. He is stubborn about what the town must not lose: the bookshop, the bathhouse, the working boats, the corner shop where his wife knows when a long day calls for tea instead of another question.',
  ],
  quote:'A town is a machine that runs on people remembering each other. You keep the small parts oiled.',
  photos:[shot('Think','thinking','sky','film','Plans for a quay that still has room for the boats.'),shot('Laugh','laugh','sunset','warm','Weekends on Kitano-jima.',{with:'Thuan'})],
 },
 Thuan:{
  headline:'Sakura’s shopkeeper knows what you need before you ask',
  standfirst:'From a notebook of supplier names to the island’s best-run shelves: Thuan built Sakura Shōten one delivery at a time.',
  body:[
   'Thuan came from Vietnam after her two elder sisters, with a notebook and a plan, and wrote every supplier’s name in it the first year. Now she can tell the harbour cart from the bakery van by the sound of its wheels. The shelves are tea, rice, soap and batteries, but the regulars come for the advice, and for the onigiri she sets aside before the lunch crowd arrives.',
   'Her name is on nearly every line of the staff roster in the back room. At the bottom, in her own hand, she has appointed an assistant manager: the potted palm. In the corner by the delivery door stands a figurine of her, a present from the mayor’s office. She says it is too much. She dusts it every morning before the rice comes in.',
   'She is the youngest of three sisters. Nhung, the eldest, sells books across Main Street; Thao, the middle one, runs Minato, and the two of them share a house where Thao’s evenings end as Thuan’s mornings begin; they trade leftovers, gossip and instructions to sleep. After closing she walks, visits Mrs Kinjō for flowers, and chooses a good meal with the seriousness of a buyer at auction. Johansson has become a regular companion at those dinners. The plans for Sakura’s future are hers, and she will build them at her own pace.',
  ],
  quote:'People think a shop sells things. A shop remembers people.',
  photos:[shot('HandsOnHips','smile','peach','warm','Behind the till: “Oldest stock at the front.”'),shot('Peace','happy','hearts','vivid','After closing, with Thao, who has just woken up.',{with:'Thao'})],
 },
 Thao:{
  headline:'Minato never closes — it just changes who is holding the mop',
  standfirst:'Thao’s izakaya opens at four. The pink telephone, the bottle keep and the karaoke all answer to her.',
  body:[
   'At four o’clock Thao hangs the noren and the evening begins: lanterns, the pink ¥10 telephone by the door, a laserdisc karaoke that takes its time finding the disc. Regulars keep their own bottles on the shelf behind the counter, each with a tag in Thao’s careful hand. Keep one yourself and she will warn you that being a regular is worse for you than it sounds.',
   'Chin has won the last-Friday karaoke contest three times running. The police notice by the door asks drivers not to drink; Officer Mori put it up himself and then sat under it with a beer. He walked home. Thao tells this story more often than Mori would like.',
   'At three in the morning the cushions are stacked and Thao wipes the counter down while the Barfly mops. She goes home to the house she shares with Thuan, the youngest of the three sisters, sleeps until noon, buys the two of them Blue Coral cones on the lane when Nhung is not looking, and is back at her station by three to prep. The amber corner by the window is kept for unhurried conversations. She will not turn it into a hurried table, however full the room.',
  ],
  quote:'The spare chair is for whoever arrives last. Somebody always does.',
  photos:[shot('Laugh','laugh','sunset','warm','Last orders, which at Minato is a suggestion.'),shot('Clap','happy','night','vivid','Karaoke night. Chin is already queueing.',{with:'Chin'})],
 },
 Barfly:{
  headline:'The regular who lives at the end of the counter',
  standfirst:'He has a stool, a tab and a broom. We asked the Barfly how a man ends up working off his drinks one sweep at a time.',
  body:[
   'Nobody at Minato uses his name; the Barfly prefers it that way. He sits on the stool at the kitchen end of the counter, the one with the best view of the lanterns, and he knows when a hook is loose before anyone looks up. Last buses come and go without disturbing the arrangement.',
   'When Minato shuts at three he stacks the cushions. From four until ten he sleeps on that same stool, and somebody always puts a jacket over him. Then he works off his tab: sweeping until noon, washing and polishing the glasses until two, mopping, and wiping the tables down for the evening while Thao preps.',
   'He says the tab is nearly paid. Thao says the same thing, in a different tone. Both of them seem quite happy with the arrangement, which has outlasted several menus and one karaoke machine.',
  ],
  quote:'A bar is only as clean as its most loyal customer.',
  photos:[shot('Idle','sleep','night','mono','Four in the morning, asleep on his feet. Somebody will find him a jacket.'),shot('Shrug','content','cream','sepia','On the tab: “Nearly paid.”')],
 },
 'Mrs Sato':{
  headline:'Lunch at Sato Ramen is three hours long and sixty years deep',
  standfirst:'Mrs Sato buys her fish at dawn, feeds the harbour at noon and washes every bowl herself. Her autograph boards tell the rest.',
  body:[
   'Her morning starts at the harbour, choosing fish for the stock while the auction is still shouting. By half past ten she is at the pots in her own kitchen, which she shares with nobody. Lunch runs from eleven to two, and the ticket machine sells your bowl if it is in the mood; when it is not, she takes the money over the counter. Miso ramen with butter and corn is the autumn bowl, ¥500.',
   'On the wall hang three autograph boards: a television presenter who came for the Hārī, the 1996 Seagulls squad, and Kayoko Shima, who sang at the harbour hall, ate two bowls and left a tip folded into a crane. At noon Mrs Sato carries two bowls in the aluminium okamochi to the harbour office, very fast and very level. She delivers to the harbour only. Anywhere else, she says, they can walk.',
   'After two she washes up and wipes down until three, then takes the first quiet cup of the day. In the evenings she and Thao fight for the same crowd, ramen against the izakaya; they fall out, and make up over a delivery. Dr Kakazu eats here at half past twelve and is not allowed to pay. On Wednesdays the shop is shut so she can make the week’s stock. She notices who has eaten and who has only said so.',
  ],
  quote:'Sit down. You can tell me how your morning went after you have eaten.',
  photos:[shot('Bow','smile','cream','warm','Eleven o’clock: the stools come down.'),shot('HandsOnHips','content','peach','film','Wednesday. Stock day. Do not knock.')],
 },
 Nhung:{
  headline:'The bookseller who marks the funny parts',
  standfirst:'Front-Row Books has a window seat, a cat who refuses aprons, and Nhung’s paper slips in every other volume.',
  body:[
   'Nhung’s recommendations come on little slips of paper tucked between the pages. Pocket poetry, island histories and practical sea guides fill the shelves, and the second-hand paperbacks come with her pencil marks in the margins wherever something made her laugh.',
   'The eldest of three sisters, she still checks that Thao has eaten and that Thuan has slept. Supper is with her husband Kōji, who comes from the fish auction, and their son Riku, who comes from wherever the boats are. She shares the front-row house with Reiko, so a bookshop day often continues as an argument about the evening paper. Tama the shop cat has refused, on principle and permanently, to wear the tiny apron she once made him. Johansson gets the unusual technical books first; she saves them under the counter.',
   'Her ambition is a whole shelf of books by island residents. So far it holds a tide table, a cookbook from the Community Hall and a book of poems she will not say she wrote.',
  ],
  quote:'Every book in here has been read at least once on that window seat. Some of them twice.',
  photos:[shot('Coy','shy','mint','film','The window seat, reserved.'),shot('Point','happy','cream','warm','“That one. Trust me.”',{with:'Reiko'})],
 },
 Chin:{
  headline:'Chin’s workbench: where repairs become experiments',
  standfirst:'The dock workshop fixes everything from winches to rice cookers. It also wins karaoke contests.',
  body:[
   'Chin lines up his tools before he touches anything new, and then he improves it. Ask him to mend a radio and it may come back with a better aerial, a louder speaker and a screw left over, which Tetsuo will find and hold up in silence.',
   'He and Tetsuo have shared the workshop since school, and their argument about volume has no closing time. Johansson stops by on quiet afternoons; the harbour office’s equipment is in their hands more often than the harbour master admits.',
   'On the last Friday of every month he becomes another person entirely: Minato’s karaoke champion, three titles in a row. The prize is a bottle on Thao’s keep shelf with his name on it. He has not opened any of them. Thao, his wife of twelve years, keeps them dusted, and their daughter Vy keeps count.',
   'On Sunday mornings he fishes off the seawall at dawn with Mr Shimabukuro. They agree on the bait and on nothing else, least of all who caught the bigger one.',
  ],
  quote:'A good repair should look like nobody touched it.',
  photos:[shot('Tada','happy','sky','vivid','Fixed. Probably better.'),shot('Cheer','laugh','night','warm','Karaoke champion, third year running.')],
 },
 Tetsuo:{
  headline:'Tetsuo listens to radios the way other people listen to friends',
  standfirst:'The workshop’s radio man treats static as conversation and keeps receivers singing long after their owners give up.',
  body:[
   'Tetsuo turns a tuning knob as though the radio might answer back, and on a good day it does. Old valve sets, ship receivers, the counter radio at Minato: he handles them gently, and he will not be rushed.',
   'Chin has repaired Tetsuo’s own radio twice. Tetsuo keeps finding extra screws. Their disagreement about volume began at the workbench when they were at school together, and it has never been settled. After lunch he crosses to the Minato Maru, where he is the ferry’s electrician under contract, and Mr Nakandakari watches him near the switchboard like a hawk.',
   'At six he goes to Umi-no-yu to tend the boiler and the pumps, and stays to close up. He takes his time over the gauges. Grandmother Higa sends him in past the bandai; he does not complain. A clear broadcast after a difficult repair is, he says, the best sound on the island, though the boiler running sweet comes close.',
  ],
  quote:'Static is just a station that has not said its name yet.',
  photos:[shot('Think','thinking','cream','sepia','Tuning in to something only he can hear.'),shot('Shrug','grumpy','mint','film','“He left another screw.”',{with:'Chin'})],
 },
 Reiko:{
  headline:'The editor whose best source never has anything to report',
  standfirst:'Reiko prints the evening paper from a desk in the bookshop. Officer Mori supplies the news, when there is some.',
  body:[
   'Reiko taps her pencil twice before she asks the real question. The evening paper is set at a desk at the back of Front-Row Books, where the press shares the room with Nhung’s poetry and the smell of ink stays in the shelves.',
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
   'A working harbour teaches patience with tides and with people. When equipment misbehaves he sends for the dock workshop; when a visitor is lost he points them to the right door. The freight book is his as well: every crate on the cargo quay gets a line, and every line gets his initials. He likes watching the morning cargo come in, and he likes it more when it arrives on time.',
  ],
  quote:'The sea is always on time. It is the boats you have to wait for.',
  photos:[shot('Point','neutral','sky','film','Next ferry: on the board, and on time.'),shot('Idle','content','cream','sepia','Noon. The okamochi is on its way.')],
 },
 'Bus driver':{
  headline:'The bus driver who became the master of the Minato Maru',
  standfirst:'He drove the Harbour Line bus for twelve years, until the line became a ferry. The town still calls him the bus driver, and he still keeps the old timetable.',
  body:[
   'When the Harbour Line became the ferry he did not want to give up the route. He sat his deck licence on the cargo boats out of Naha, came home as her mate, and has been master of the Minato Maru since 1994. He is aboard by a quarter past seven and ashore after the last call.',
   'He brings her alongside from the port wing, where he can see the pier, with Ms Uezu forward on the bow line and Mr Fujita on the quay to take it. Mr Nakandakari, the chief engineer, says he runs her engines too hard. He says the timetable runs them. Ms Ganaha at the ticket window has to explain any late departure, and makes sure he hears about it.',
   'He still notices who is carrying groceries, who has missed lunch and who just wants a little company on the crossing, and he knows the regulars by the way they wave from the quay. At seven he takes the day’s log to the harbour master, an old friend, and they read it over the harbour clock.',
   'Grandmother Higa’s husband drove the island bus for thirty years. She can still tell the ferry is late by its whistle. He considers that the highest standard in his profession, and keeps time accordingly.',
  ],
  quote:'People tell a bus driver how their story begins. On a ferry you have twenty minutes to hear how it ends.',
  photos:[shot('Wave','smile','sunset','warm','The last crossing of the day.'),shot('Bow','happy','cream','film','Mind the step. Mind the ramp.')],
 },
 'Grandmother Chinen':{
  headline:'The old Chinen house has lost three tiles in forty years',
  standfirst:'Tetsuo’s mother keeps the red-tile house at the end of Kitano hamlet, sweeps her lane at half past six and knows every boat by its whistle.',
  body:[
   'She was married into the Chinen house in 1958 and has outlived the roof twice. The typhoon of 1987 took the Shiromas’ roof next door and three of her tiles, which she still counts a win. Every morning at half past six she sweeps the lane in front of her gate, whatever the weather.',
   'Her son Tetsuo mends radios in Minato and comes over on the boat when he can. That is not often enough, she says, and he eats like he is still fifteen. She keeps a pot on for him anyway, and asks him nothing at all about the bath at Umi-no-yu.',
   'Her neighbours are the mayor and his wife, at the end of the lane. Thuan brings the shop’s day-old bread on Saturdays and goes home with a bag of goya, which Grandmother Chinen calls a fair trade. She watches the mayor come up the lane each evening from her gate, and has views on his hours.',
   'At three in the afternoon she stands at the gate for the breeze. The garden takes the rest of the day.',
  ],
  quote:'Three tiles in forty years. The house knows what it is doing.',
  photos:[shot('Wave','happy','garden','warm','At her gate, for the breeze.'),shot('Laugh','content','sky','film','A pot on for her son, who eats like he is still fifteen.',{with:'Tetsuo'})],
 },
 'Miss Higa':{
  headline:'By day the blackboard, by night the bandai',
  standfirst:'Miss Higa teaches the island school until half past three. From five she takes your coins at Umi-no-yu, and she still notices who has not done their homework.',
  body:[
   'The island school is one room and one small mixed class, and Miss Higa teaches all of it. Vy asks the most questions. Riku talks, and is moved to the front row every week. Mai keeps the class rabbit, which is the best-behaved pupil and knows it. Miss Higa is twenty-nine, marks until five, and then walks down to the bath.',
   'The bandai is a raised seat by the door of Umi-no-yu, the island’s bathhouse. From up there you can see over the counter, which is the point of a bandai. Three hundred yen, swimwear in the bath, please: it is a family bath. In the evenings and at weekends she keeps it, with the marking on her knee and the crossword under the marking.',
   'The bath is her grandmother’s, and so is the opinion that Miss Higa should be married by now. Grandmother Higa says it at breakfast and again over supper. Her elder brother, the ferry’s oiler, says nothing at all and grins, which is worse.',
   'After hours Tetsuo comes to tend the boiler and the pumps. He fixes things; she does the till and pretends not to watch. He takes longer over the pressure gauge than any gauge needs. Neither of them has said a word about it, and the whole of Nishi-machi is waiting.',
  ],
  quote:'Wash first. Then soak. Then tell me why the homework is late.',
  photos:[shot('Think','content','mint','sepia','At the bandai, marking between customers.'),shot('Coy','shy','peach','warm','The boiler is fixed. She was not watching.',{with:'Tetsuo'})],
 },
 'Grandmother Higa':{
  headline:'Grandmother Higa has a seat for you and an opinion about your onions',
  standfirst:'She owns the bath and the liquor shop, and she knows the ferry by its whistle. From her verandah in Nishi-machi she keeps an eye on the rest.',
  body:[
   'Sit a moment, she says, and you will. Grandmother Higa offers a seat, an observation about Sakura, and practical advice on preparing a house for typhoon season, in that order. She keeps the counter at Higa Liquor in the morning and the bandai at Umi-no-yu in the afternoon. Every bottle on the island, at Sakura, Minato or Sato Ramen, came through her door first.',
   'Her granddaughter teaches the island school and keeps the bandai in the evenings. Grandmother Higa would like her married, and says so. She has noticed that Tetsuo, who keeps her boiler running for a bath and his supper, takes his time over the pumps. She sends him through the front way, past the bandai, on purpose.',
   'Grandmother Sakurai bathes an hour before her. They have been rivals since primary school, and neither has ever let the other win a thing: not a bazaar, not a sports day, not a single argument about the price of rice. Mr Fujita soaks his back every morning and tells her the water is never hot enough. She tells Dr Kakazu the same about his advice on her blood pressure.',
   'When the Minato Maru is late she hears it in the whistle, and her grandson, who oils the ferry’s engines, hears about it at supper.',
  ],
  quote:'You are the one who talks to the girl at Sakura every day. Good. Somebody should.',
  photos:[shot('Wave','smile','cream','sepia','Sit a moment. The verandah, Nishi-machi.'),shot('Point','thinking','mint','film','That is not a shallot.')],
 },
 'Mr Ōshiro':{
  headline:'A sabani from 1968 and the man who will not sell it',
  standfirst:'Mr Ōshiro built his boat from Yakushima cedar. He still scrapes and tars her by hand, and he still goes out before the auction.',
  body:[
   'The cedar came from Yakushima before you could not get it any more. He built her in 1968 and will tell you, if you ask, the difference between a repair and a replacement. Most mornings he takes her out with Kōji, his crewman, and they are in before the auction calls. In the afternoons Kōji comes back to the yard to help with the tar.',
   'Kōji recommends fibreglass. He has recommended it every season. Mr Ōshiro sees no reason to replace something that has carried him this far, and says so while Kōji bails.',
   'Fourth place in the 1979 sabani race remains, in his view, a perfectly respectable subject for conversation. Mr Fujita, who also raced that year, brings it up whenever they meet, and never mentions where he came himself.',
   'His yard on the water is a place to stand and watch patient hands. Mr Higa Jr served his time here on sabani and outboards before he went to the ferry, and still comes back to borrow a clamp.',
  ],
  quote:'You do not own a boat like this. You look after her for the next one.',
  photos:[shot('Crouch','content','sky','film','Scraping the hull, as every spring.'),shot('HandsOnHips','happy','sunset','warm','Back before the auction, with his crew.',{with:'Kōji'})],
 },
 'Mrs Kinjō':{
  headline:'Rainflower Florist wraps every bouquet in brown paper',
  standfirst:'Mrs Kinjō sells island-grown stems from half past eight, dresses the town for every festival, and keeps a careful eye on her neighbour’s doorway.',
  body:[
   'Buckets of fresh stems, leafy pots and hand-made wreaths fill the open front of the flower shop on Rainflower Lane. The morning stems come in at half past eight; by the afternoon she is out on deliveries. Thuan comes after closing, and the bouquets for Sakura’s counter are chosen with care on both sides.',
   'She is the town’s decorator as well as its florist. The bunting at the harbour, the paper lanterns at Minato and the flowers on Thao’s counter all come from her back room. Thao says the lanterns cost more than the sake. Mrs Kinjō says that is because the lanterns last.',
   'She shares the walkway with Mrs Nakamura’s zenzai counter. They eat lunch at each other’s counters and argue about whose customers block whose doorway, usually in the same conversation. On Sundays she takes tea with Grandmother Sakurai, an old friend, and they agree about almost everything except Grandmother Higa.',
   'She wraps everything in plain brown paper, because the flowers should be the bright part.',
  ],
  quote:'The flowers are the bright part. Everything else should get out of their way. Including that queue.',
  photos:[shot('Heart','happy','hearts','vivid','Fresh stems, Rainflower Lane.'),shot('Coy','smile','peach','warm','A bouquet for Sakura’s counter.',{with:'Thuan'})],
 },
 'Mrs Nakamura':{
  headline:'Zenzai since 1972, and the shaving machine still sounds like a tractor',
  standfirst:'Mrs Nakamura has the beans on at six, the ice-cream counter open at three and the community kitchen’s andagi in the fryer whenever the town needs feeding.',
  body:[
   'Kintoki beans, cooked since six. The ice comes from the plant on the quay, and the old shaving machine roars like a tractor; she trusts its work completely. There has been zenzai on this corner since 1972, and she has no plans to stop.',
   'At three she crosses to Blue Coral and opens the ice-cream counter for the school crowd. Her daughter Mai arrives at half past with Vy, her best friend, and the pink guava scoop is already set aside. Mrs Nakamura is bringing Mai up on her own, and does it the way she does everything, early and without fuss.',
   'She also runs the community kitchen. When there is a festival, a funeral or a typhoon, the andagi come from her fryer, by the hundred. Mrs Kinjō, next door, eats lunch at her counter and complains about the queue in front of the flower buckets. Mrs Nakamura gives her a second bowl and does not move the queue.',
  ],
  quote:'Zenzai is not fast food. Sit down.',
  photos:[shot('Bow','smile','polka','vivid','Welcome! Zenzai?'),shot('Laugh','laugh','peach','warm','Half past three: two ice creams, one of them guava.',{with:'Mai'})],
 },
 'Mr Shimabukuro':{
  headline:'Two diesels, one running, one resting: the man who keeps the lights on',
  standfirst:'Mr Shimabukuro minds the power house. Every light on the island comes through his engine room.',
  body:[
   'Hear that? Two diesels, one running, one resting. Mr Shimabukuro listens to the generators the way a doctor listens to a chest, and he hears a fault before the meters show it.',
   'The second set is to be overhauled before typhoon season; the town assembly minutes say so, and so does he, at length.',
   'Postman Tōma brings his parcels to the power house door. They are usually spare parts. Tetsuo comes over when the switchboard needs a second pair of hands, and they talk about the island’s load as other men talk about the weather.',
   'On Sunday mornings he fishes off the seawall with Chin at dawn. Who caught the bigger one is a question that has run for years.',
  ],
  quote:'You only notice electricity when it stops. I would like you never to notice it.',
  photos:[shot('Think','thinking','cream','mono','Listening to the engines.'),shot('Point','neutral','sky','film','One running, one resting.')],
 },
 'Kōji':{
  headline:'The case for tuna-head soup',
  standfirst:'Kōji is up at half past four for the auction and asleep by noon. In between he sorts the catch, loads the ice and would like you to take the tuna head. It is free.',
  body:[
   'Before the auction he crews Mr Ōshiro’s sabani, and hears again why she will never be fibreglass. By half past four he is on the auction floor sorting the catch. What the buyers leave goes to Mrs Sato for her stock pot or to the freezer, and Kōji has it sorted before most of the street is awake.',
   'At nine he moves to the ice plant and loads the boats for the next night. At noon he goes home to sleep. On Ms Uezu’s week off he works the Minato Maru’s deck as her relief, and he says the ramp is the only thing on the island heavier than a tuna.',
   'He is married to Nhung, who sells books and says he smells of fish. He says she smells of books. Their son Riku wants to come out on the boat. He may, Kōji says, when he can swim to the buoy.',
   'He likes practical food. He would especially like you to try tuna-head soup.',
  ],
  quote:'You want a tuna head? Free. Great soup.',
  photos:[shot('Peace','happy','sky','vivid','After the auction.'),shot('Laugh','laugh','sunset','warm','Supper at home. Still offering the tuna head.',{with:'Nhung'})],
 },
 'Postman Tōma':{
  headline:'Two collections a day, and the postbox is never wrong',
  standfirst:'Postman Tōma walks his round at 10:30 and 16:30, and meets the evening boat for the mailbag. He does not read postcards. The pictures are very nice.',
  body:[
   'The plate on the postbox says 10:30 and 16:30, and Tōma trusts it even on the days he doubts himself. Letters for the Ōshiros, a parcel for Mr Shimabukuro at the power station, a postcard for Sakura from somebody in Hanoi.',
   'Letters give him a different map of the island, made of names and remembered doorways. Shopkeepers give him news between parcels, and Reiko gets most of it back by teatime. Officer Mori has asked him, more than once, not to lean his bicycle on the koban’s line.',
   'At five he takes the evening mailbag at the Port Terminal. Ms Ganaha sells the tickets there. He lingers at her window longer than any mailbag needs; she is busy, and says so, and has not yet asked him to leave.',
   'He does not read postcards. He will admit that some of the pictures are very nice.',
  ],
  quote:'The post box is never wrong. I am sometimes wrong.',
  photos:[shot('Wave','happy','sky','film','On his round.'),shot('Coy','shy','peach','warm','The evening mailbag, and a long wait at the ticket window.',{with:'Ms Ganaha'})],
 },
 Riku:{
  headline:'Which crate is yours? Ask Riku.',
  standfirst:'He walks the cargo circuit from the morning supply boat to the evening fish dispatch.',
  body:[
   'Rice for Sakura, fuses for the workshop: the containers on the western quay look anonymous until Riku tells you what is inside.',
   'He works around the hoist, keeps the pedestrian passage clear and watches the horizon for the next supply ship.',
   'The harbour master keeps the freight book; Riku keeps the crates moving. Between them, very little goes missing.',
  ],
  quote:'Every crate on this quay belongs to somebody’s day.',
  photos:[shot('Point','neutral','sky','film','The morning supply boat.'),shot('HandsOnHips','happy','cream','warm','Cargo for Sakura, signed into the freight book.',{with:'Harbour master'})],
 },
 Vy:{
  headline:'Ice cream before homework: the rule Vy made and keeps',
  standfirst:'The school bus leaves at twenty past seven. By mid-afternoon Vy is back, satchel full of kanji, and heading straight for the Blue Coral counter.',
  body:[
   'Vy is in her second year of high school and wears the sailor uniform like a reasonable compromise. She takes the twenty-past-seven bus across the bridge and knows every driver by the way they brake. Her verdict on the island’s one bus driver is that he is “gentle, but late on purpose”.',
   'Her first stop on the way home is Blue Coral on Rainflower Lane, where the lady at the counter keeps the pink guava scoop aside for her. The lady says this is good customer service. Vy says it is a contract. Then she spreads her homework across a park bench and does the hard half first, or says she will.',
   'When she is thinking she counts the pleats in her skirt. When she is not, she is watching the jan-ken-pon games in the park and keeping score for the three sisters, who all claim to be winning. She would like to be a ferry captain, or a translator, or both on alternate days.',
  ],
  quote:'Homework is easier with guava. That is not an opinion, it is research.',
  photos:[shot('Peace','happy','mint','vivid','After school, guava in hand.'),shot('Think','thinking','cream','film','The hard half first. Probably.')],
 },
};
