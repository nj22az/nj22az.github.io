# Current interior inventory — 18 October 2026

This inventory follows active building registrations and the runtime room builders, not screenshots or a claim of visual completion. All 24 occupied primary households have interior geometry: 23 in Minato and Johansson/Thuan's primary home on Kitano-jima. An individual interior and a shared residential layout are distinguished below. Resident routines must not depend on a bespoke bedroom being finished.

## Individual home interiors

| Home | Residents | Builder / arrangement |
| --- | --- | --- |
| Kitano family house | Johansson and Thuan | `johansson-house-interior.js`; primary home |
| 1 Kitahama | Thao, Chin, Vy; Thuan's weekday room | `vy-room.js`; family rooms and separate sleeping places |
| 1 Front-Row Yard | Nhung and Reiko | `yard-home.js`; shared yard home |
| 2 Front-Row Yard | Tetsuo | `tetsuo-flat.js`; individual flat |
| 2 Kitahama | Mrs Sato | `tatami-home.js`; individual tatami home |
| Police box residence | Officer Mori | `koban.js`; residence behind the workplace |
| Harbour office residence | Harbour master | `office-workplace.js`; sleeping nook behind the screen |
| Shiosai houseboat | Mr Fujita | `fujita-houseboat.js`; directly walkable cabin with sofa/blanket |

## Homes using shared furnished residential layouts

These are enterable and furnished, with sleeping and dining positions. They are not exterior-only buildings, but they still share a layout system rather than each having an individually designed interior.

| Home | Residents | Interior |
| --- | --- | --- |
| 3 Kitahama | Kōji and Riku | Family-home layout |
| 4 Kitahama | Postman Tōma | Family-home layout |
| 5 Kitahama | Grandmother Chinen | Family-home layout |
| 6 Kitahama | Ferry master, still named Bus driver | Family-home layout |
| 8 Kitahama | Ms Uezu | Family-home layout |
| Kitahama Heights, Flat 1 | Mr Higa Jr | Family-home layout |
| Kitahama Heights, Flat 2 | Grandmother Sakurai | Family-home layout |
| Kitahama Heights, Flat 3 | Mr Nakandakari | Family-home layout; upper approach |
| Kitahama Heights, Flat 4 | Ms Ganaha | Family-home layout; upper approach |
| Higa house | Miss Higa and Grandmother Higa | Family-home layout |
| Kinjō house | Mrs Kinjō | Family-home layout |
| Ōshiro house | Mr Ōshiro | Family-home layout |
| Above Nakamura Zenzai | Mrs Nakamura and Mai | Upper-home layout with private stair |
| Above the post office | Mr Shimabukuro | Upper-home layout with private stair |
| Doctor's flat | Dr Kakazu | Family-home layout, separate from the clinic |
| Private Izakaya residence | Barfly | Family-home layout, separate from the public bar |

The vacant `home-kitano-2` on the separate tropical island also has a standard interior. It is not an occupied Minato household. Retired Minato dwellings are not counted as live homes.

## Public and working interiors

| Building | Existing interior |
| --- | --- |
| Sakura Shōten | Shop floor, till, back room and restroom |
| Sakura upper floor | Main office and kitchenette; latest main adds the internal stair connection |
| Minato Izakaya | Public bar and dining room |
| Sato Ramen | Ramen dining/service room |
| Front-Row Books | Bookshop, reading and printing areas |
| Dock Electrical & Repair Workshop | Repair and instrument benches, workshop equipment |
| Umi-no-yu | Lobby, changing/washing/bathing areas and service fittings |
| Harbour office | Working office plus its residential nook |
| Minato Police Box | Police room plus residence |
| Town Hall Classroom | Classroom |
| Community Kitchen | Kitchen and dining facilities |
| Mayor's Office | Civic office; its title does not make Johansson the mayor |
| Minato Clinic | Medical workplace, separate from Dr Kakazu's home |
| Port Terminal | Passenger waiting/ticket hall |
| Harbour Warehouse | Warehouse and Sakura supply/depot space |
| Minato Maru | Walkable machinery, passenger and crew spaces, including duty cabins and berths |

Naha arrivals and the city restaurant also have separate travel-scene interiors.

## Open frontage or exterior facilities

| Location | Current distinction |
| --- | --- |
| Rainflower Florist | Open pavilion/counter with furnishings; no separate enclosed room |
| Nakamura Zenzai / Blue Coral | Open public counter; the residence upstairs is separately enterable |
| Post office | Street counter/mailboxes; the residential room above is separate |
| Higa Liquor | Storefront/counter; no dedicated public room in the entry dispatcher |
| Power station | Exterior equipment/site; no dedicated room in the entry dispatcher |
| Fish auction / ice plant / boatyard | Working scenery and interactions; no dedicated entered room in the current dispatcher |
| Kitano airport | Runway/airport scenery; Naha arrivals is a different travel scene |

Sources: `src/game.js` (`roomShell`, `addRoomProps`), `src/world/businesses.js`, live town landmark registrations, `src/people/island-households.js`, `src/world/interiors/`, `src/world/ferry-interior.js`. Physical access, visual appearance and resident use still require acceptance checks; a room builder alone does not establish those.
