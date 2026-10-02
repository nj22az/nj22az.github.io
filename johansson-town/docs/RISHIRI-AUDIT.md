# Rishiri Island — reference audit for the port

October 2026. Rishiri (利尻島) is the model for the bigger port and, in time, the island
as a whole: a round volcanic island with one mountain, a ring road, a ferry port that takes
passengers, cars and trucks, fishing harbours and an airport. This note sets out what the
real island is like, how today's town compares, and what to build.

## The real island

| | Rishiri | Source |
|---|---|---|
| Shape | Almost round, built around one extinct volcano | [1], [2] |
| Size | About **63 km** round the coast | [1] |
| Mountain | **Mt Rishiri, 1,721 m** ("Rishiri Fuji"), seen from everywhere on the island | [1], [3] |
| People | Just over **5,000** | [1] |
| Towns | **Oshidomari** (north, the largest town and transport hub, by the airport) and **Kutsugata** (west) | [1], [4] |
| Ferry | Wakkanai ↔ Oshidomari, **100 minutes**, 2 sailings a day in winter and 3 in other seasons. **Vehicles are carried**; a car costs about ¥20,000 each way today. The ships take about 500 people | [4], [5], [6] |
| Ferry operator | Today Heart Land Ferry; earlier Higashi Nihonkai Ferry, and before that Wakkanai Rirei Unyu | [6] |
| Second port | **Kutsugata**, rebuilt to take cruise ships; a summer sightseeing bus leaves from it | [7] |
| Airport | Near Oshidomari, one runway (07/25). It opened in 1962 with a **600 m** runway; the **1,800 m** runway for jets came in 1999 | [8] |
| Roads | A road round the whole coast (about 55 km by bike) and a **~25 km cycling road** through forest and along the shore, away from cars | [9] |
| Work | Fishing and tourism. **Rishiri kombu** (kelp) and **sea urchin** (uni) are the island's names | [1], [9] |
| Summer | June–August: kombu laid out to dry along the shore everywhere, and it must be dry before sunset | [9], [10] |
| Winter | Cold, windy and snowy: January averages −3.7 °C, about −7 °C December–February; strong seasonal winds November–February | [9] |
| Sights | Cape Peshi by Oshidomari port (10–20 minutes' walk up, views of the town and mountain), Himenuma and Otatomari ponds, Cape Kutsugata, Senhoshi, and the "16 views of Mt Rishiri" stamp rally (sheets at the Oshidomari ferry terminal) | [7], [9] |

**For a 1997 town:** the airport still had its short 600 m runway (the jet runway came in
1999), so in 1997 small propeller planes flew. The ferry company was not yet Heart Land Ferry.

## Today's town against Rishiri

| Rishiri | Johansson Town today | Gap |
|---|---|---|
| One big mountain behind the town | Flat peninsula, no mountain | The biggest visual difference. A mountain backdrop (a large, simple cone in the haze) would do most of the work |
| Ferry port with terminal, car ramp and lanes for cars and trucks | Small ferry (15 m) at the outer pier's west flank; a bow ramp; two cars off and two on per call (`ferry.js`, `ferry-vehicles.js`) | A real terminal building, a linkspan (car ramp) on the quay, marshalling lanes, trucks, a bigger ship |
| Fishing harbour separate from the ferry berth | Fishing, the auction shed and the ferry share one quay | Split them: ferry berth outside, fishing boats inside |
| Kombu drying on the shore, uni boats | Okinawan market goods, palm trees | Kombu drying racks and stones on the beach, small fishing boats |
| Airport on the island itself | Kitano-jima, a separate island out to the east (`airport-island.js`), not reachable | Fits your plan: grow the land out towards it, or link it by the ferry |
| Ring road and cycling road | A main road, a short coast road, a bicycle | A coast road that will one day go round |
| Cold north: snow, wind, kombu summer | Okinawa, 1997: sanshin, shisa, gōya, awamori | **Conflict, see below** |

## The decision this needs: Okinawa or the north?

The town is written as Okinawa. That shows in the residents' names and voices, the
Ryukyu-scale jingle, palm trees, shisa, the konbini stock, and most of the trade-quest goods
and stories (Obon lanterns would stay, gōya and kōrēgusu would not). Rishiri is the far
north of Hokkaido, with snow, kombu and sea urchin. There are three ways to go:

1. **Okinawa, with a Rishiri-style port.** Keep everything that exists and borrow only the port:
   the terminal, car ferry, fishing harbour, the ring road and the airport link. The cheapest
   option, but no mountain and no kombu.
2. **Move north and make it Rishiri.** Mountain, kombu, snow in winter, northern food and
   fishing. A large rework of art, stock, dialogue and quest content. The warm, relaxed look
   would change completely.
3. **A made-up island that borrows from both:** a mountain island with Rishiri's port and roads,
   in a milder climate. This keeps the residents and the town and adds the mountain and kombu.
   It needs a light pass over things that are too Okinawan (palms, some goods).

## What to build for the port (any of the three)

Build in steps, so the town keeps working at each one:

1. **Land.** Extend the quay west and out to sea onto reclaimed ground, past today's apron west
   of the warehouse (`QUAY_SOUTH = -50`, `quay` road in `layout.js`). This is also the ground
   towards the airport island.
2. **Ferry terminal.** A two-storey terminal with a ticket hall and waiting room, a timetable
   board, a car check-in booth, and a stamp-rally desk like Oshidomari's.
3. **Linkspan and lanes.** A car ramp at the new berth and painted marshalling lanes
   (cars, trucks, foot passengers), with the existing `ferry-vehicles.js` route moved to it and
   trucks added.
4. **A bigger ferry.** The current 15 m boat becomes the inter-island launch; the car ferry is a
   larger ship with a stern door.
5. **The electrical workshop on the quay.** A port workshop, as a real port has, between the
   terminal and the fishing harbour. Inside: a motor bench, a generator, a pump with a butterfly
   valve, a switchboard. Every machine is built from the **shared equipment library** (below), so
   the same models appear in Sjöskolan's study material.
6. **Fishing harbour.** Inside the breakwater: small boats, the auction shed, nets and, if the
   setting allows, kombu drying.

## Shared equipment library (applies whatever the setting)

Every machine in the town should come from one library that study material can also use:
butterfly valves, electric motors, engines, generators, pumps, switchboards. Each model is
built in code from named parts, so it can be shown whole, cut away or exploded, with labels,
in the town, in a Sjöskolan lesson, or as a still image for a document. Johansson
demonstrating on a 3D model in a theory lesson uses the same models.

## Sources

1. [Rishiri Island Hokkaido — Japan Experience](https://www.japan-experience.com/all-about-japan/sapporo/attractions-excursions/rishiri-island-hokkaido)
2. [The Circular Rishiri Island — ANA Japan Travel Planner](https://www.ana.co.jp/en/us/japan-travel-planner/hokkaido/0000018.html)
3. [Mt. Rishiri — Japan National Tourism Organization](https://www.japan.travel/en/spot/1880/)
4. [How to get to and around Rishiri and Rebun — japan-guide.com](https://www.japan-guide.com/e/e6878.html)
5. [Oshidomari Ferry Terminal — Japan Cheapo](https://japancheapo.com/place/oshidomari-ferry-terminal/)
6. [Heart Land Ferry Rishiri/Rebun — Tripadvisor](https://www.tripadvisor.com/Attraction_Review-g298155-d8565691-Reviews-Heart_Land_Ferry_Rishiri_Rebun-Wakkanai_Hokkaido.html)
7. [Kutsugata Port Tourist Information — MLIT (PDF)](https://www.mlit.go.jp/kankocho/cruise/detail/009/documents/kanko.pdf)
8. [Rishiri Airport — Wikipedia](https://en.wikipedia.org/wiki/Rishiri_Airport)
9. [Rishiri Island: Sea Urchins, Cycling and Volcano Hikes — Japan Cheapo](https://japancheapo.com/entertainment/rishiri-island/)
10. [Despite population decline, Rishiri Island's kombu harvest goes on — The Japan Times](https://www.japantimes.co.jp/life/2026/09/13/food-drink/kombu-rishiri-island-hokkaido-harvest-future/)

Facts come from search-result summaries of these pages; several of the pages themselves could
not be opened from the build environment, so check the numbers before using them in teaching.
