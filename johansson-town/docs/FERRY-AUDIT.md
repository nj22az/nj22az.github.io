# The Minato–Kitano-jima ferry: audit and plan

The creator, 2026-10-10: *"audit it as marine ship construction engineer in Japan in the 1990's — now it looks like a
floating toy, it needs to be a realistic functional ship with loading decks, passenger waiting spaces, a realistic
functional engine room … and have a crew (some of our NPCs can be the crew …)"*; *"there are only two maybe 3 cars that
need to go on the ferry"*; *"the whole ship need to be modelled, we will have a dry dock later"*; and the rule that
came with it: *"don't take or make shortcuts when making the world"* (CLAUDE.md).

The audit is written as a 1990s Japanese ship-construction surveyor would write it for a small island car ferry
(小型カーフェリー) inspected by the government (JG) for smooth-water service (平水区域).

## 1. Findings on the old ferry (ferry.js before this change)

| # | Finding | Severity |
|---|---|---|
| 1 | 15 m × 4.4 m with a 0.7 m draft: the size of a harbour launch. Its one "lane" was 1.1 m between the lines, narrower than a kei car (1.48 m); the deck held one car. | Major |
| 2 | Hull an extruded prism: vertical sides to a flat bottom, no sheer, no flare, no bilge, no keel. Seen from a dry dock it would be a box. | Major |
| 3 | Nothing under the water: no screws, shafts, rudders, skeg, thruster, bilge keels, anodes or sea chests. A ferry with nothing to drive or steer it. | Major |
| 4 | No draft marks, no load line mark, no name or port of registry. Every Japanese ship carries all three. | Major |
| 5 | The bow ramp a plate with two painted "chains": no hinge, no hydraulic rams, no side girders or toe. | Major |
| 6 | No mooring fittings at all (bitts, fairleads, windlass, anchor, capstan): moored by nothing. | Major |
| 7 | No navigation lights (masthead, sidelights, stern light), no radar, no whistle, no searchlight, no antennas: it could not legally sail at night. | Major |
| 8 | Lifesaving: two rings. No life floats, life-jacket lockers, muster signs, extinguishers. | Major |
| 9 | No crew anywhere; ramp and gangway moved by themselves. | Major |
| 10 | No engine room, switchboard, generators, steering gear or tanks: nothing for stories about breakdowns. | Major |
| 11 | Passengers rode the car deck among the cars (forbidden on Japanese ferries during the passage). | Minor |
| 12 | The code called the side against the pier "starboard"; she lies port side to the pier. | Minor |
| 13 | Cars boarding at Minato did a U-turn of 1.1 m radius on the spot (no car turns that tightly). | Minor (a shortcut) |

## 2. The ship: the Minato Maru (みなと丸), 1991

Data: `src/world/ferry-ship.js`. Model: `src/world/ferry-model.js`.

**Why this size.** Three cars (or a 4-tonne truck and a kei truck) in two lanes need a beam of about 6.4 m; two cars
nose to tail plus the ramp and the deckhouse need about 22 m. That is a 95-ton ferry, the smallest that carries a
deckhouse, a wheelhouse and a proper engine room, and it fits Minato harbour as it is: she berths port side to the
outer pier with her ramp on the quay, and swings in the basin with a metre to spare off the breakwater. The harbour
did not need to grow.

| | |
|---|---|
| Length overall / between perpendiculars | 22.0 m / 19.6 m |
| Beam / depth / draft / freeboard | 6.4 m / 2.48 m / 1.35 m / 1.13 m |
| Gross tonnage | 95 |
| Passengers / cars / crew | 60 / 3 / 4 |
| Speed | 10.5 kn service, 11.8 kn trial |
| Owner | Minato-chō (the town ferry, 町営フェリー); registered at Minato |

**General arrangement (fore to aft).** Car deck with the hydraulic bow ramp, two 2.6 m lanes, lashing points,
scuppers, inner bulwark stiffeners, a hydrant and extinguisher, and ladders up the deckhouse front. The deckhouse:
the passenger saloon with side and front doors and the muster and life-jacket signs. The stern mooring deck: capstan,
two pairs of bitts, closed fairleads, the flagstaff and two lifebuoys. The upper deck on the saloon roof: open deck
with benches, two rigid life floats, life-jacket lockers, lifebuoys, the funnel (both exhausts in one casing) and
the engine-room vents; the wheelhouse forward, its open wings with dodgers and wing consoles; the mast with masthead
light, radar scanner, whistle, VHF whips, GPS and searchlight; sidelights in their screens, red to port.
Below the car deck (data now, modelled in batch 3): steering-gear room, engine room, fuel and fresh-water tanks, crew
quarters (mess and galley, master's cabin, crew cabin, shower, changing room), fore peak and chain locker.

**Hull and underwater body.** Lofted from sections every 0.5 m: parallel midbody, a spoon forefoot under the ramp,
a counter rising over the screws, flare forward, a 0.6 m bilge. Keel bar and skeg; two shafts in stern-tube bosses
on A-brackets; two four-bladed bronze screws (1.05 m) that turn under way; two spade rudders with anodes; the
bow-thruster tunnel and its grilles; bilge keels; sea-chest gratings; antifouling, black boot-top, company teal
topsides and white bulwarks; rubbing strake; draft marks fore and aft, the JG load line amidships, the name forward
and name and port on the transom; the starboard anchor in its pocket.

**Machinery.** Two 257 kW high-speed diesels at 1 800 rpm through 2.47:1 reverse-reduction gears; engine-driven
sea-water, jacket-water and lube-oil pumps; 24 V electric start. A 30 kW bow thruster. Electro-hydraulic steering,
two pumps, hand pump for emergency steering. Fuel: A-type heavy oil (A重油).

**Electrics.** Two 60 kVA (48 kW) 445 V 60 Hz generators; IT main switchboard with insulation monitor; 445/105 V
lighting transformers; 24 V emergency bank; 30 kVA shore supply through a 200/445 V transformer at Minato. The load
balance (`FERRY_LOADS`, tested): at sea 36 kW on one set (75 %), manoeuvring 66 kW on two (69 %), loading 35 kW on
one, night 8 kW on shore power. The bow thruster will not start on one generator; a preferential trip sheds the air
conditioning, galley and water heater. The emergency bank holds the emergency lighting, navigation lights, VHF and
alarms for about 7 hours.

**Scenarios for stories** (`FERRY_SCENARIOS`, each step a post and a place on board): blackout halfway across (bad fuel,
steering by hand pump), a net round the port screw, the ramp hose bursting at Kitano-jima, the shore power and the
rice cooker.

## 3. The crew (src/people/ferry-crew.js)

Safe manning for her size is four. Three are islanders who were already in the town; one is new.

| Post | Who | Why them |
|---|---|---|
| Master (船長) | **the Bus driver** | He drove the Harbour Line bus; when the line became the ferry he took his deck licence and went with it. Master since 1994. The town still calls him the bus driver (saves and looks keep the name). |
| Chief engineer (機関長) | **Mr Nakandakari** (new, 61) | Twenty years in the Naha cargo boats' engine rooms; Mr Shimabukuro of the power house sailed with him and sent for him. Lives aboard in the chief's cabin. |
| Oiler (機関員) | **Mr Higa Jr** | Grandmother Higa's grandson (his grandfather drove the harbour bus for thirty years). Served his time at Mr Ōshiro's boatyard. |
| Deck hand and bosun (甲板員) | **Ms Uezu**, week on / week off | Already "deckhand on the ferry, a week on and a week off"; lives aboard on her week on. |
| Relief deck hand | **Kōji** | Crews on the Ōshiro boat; takes the deck on Ms Uezu's week off. |
| Ticket clerk (ashore) | **Ms Ganaha** | Already sells the tickets at the Port Terminal window. |
| Linesman at Minato | **Mr Fujita** | Lives in his shed on the pier; takes the bow line at every call for a can of coffee. |
| Port | **Harbour master** | Gives the berth, keeps the port radio. |

Each post has a station and a job in every phase of a call (`FERRY_WATCH`: arriving, waiting, reversing, swinging,
leaving, crossing, night). `crewFor`, `crewDoing` and `crewOnDuty` answer who and what for stories and the game.
The island households (`island-households.js`) and the resident guide (the master's role) say the same.

## 4. What changed around her (the impact list, and how each was checked)

- **Berth:** centre (−7.45, −61.5), port side 0.15 m off the pier, bow 0.5 m off the quay wall; the ramp lands where
  it did. Hull collider follows. *Checked:* `tests/ferry.test.mjs` (every hull point, not just the centre).
- **Harbour paths:** keyed paths (`ferry-paths.js`) with the bow's heading set apart from the track: astern off the
  berth, swing on the thruster, ahead round the breakwater; the reverse to come in. *Checked:* a metre off the
  breakwater, 0.1 m+ off both piers, never over the quay, no spinning.
- **Kitano-jima crossing:** the same departure, the sea route, then bow in to the jetty 1.9 m off; leaving it, astern
  16 m before swinging. *Checked:* `tests/airport-ferry.test.mjs` with the real hull outline.
- **Gangway, queue and landing:** the gangway now runs from the deckhouse's port door to the pier end (z −63.4); the
  queue and the arrival point moved south of the crate stack. *Checked:* `tests/airport-dock-access.test.mjs`.
- **Cars:** ride in car place 1 (starboard lane forward). Boarding at Minato is now a three-point turn: down, left onto
  the open quay, back round a 3 m arc onto her centreline and straight back down the ramp. *Checked:*
  `tests/kitano-link.test.mjs` (the full car body against every solid), `tests/airport-ferry.test.mjs`.
- **Quay:** the net-drying rack moved north to the warehouse frontage line, clear of the cars' arc; its rope coil now
  lies by the bollard her bow line goes to. *Checked:* `tests/port-access.test.mjs` (frontage clear).
- **Passengers:** ride the open upper deck aft, between the benches. *Checked:* clear of funnel, benches and vents.
- **Films and comics:** `remotion/tools/impact.py` finds no view of the berth in any episode. The storyteller's
  harbour and pier backdrops were photographed again, and a new place, *the Minato Maru* (`ferry`), was added with its
  own backdrops. *Checked:* `tests/feed-storyteller.test.mjs`.
- **Looked at in the game:** `tools/ferry-look.mjs` photographs her from the quay, the pier, broadside, astern, above,
  the bow and ramp (down and up), the car deck, the waterline (draft marks, load line) and lifted out of the water as a
  dry dock would see her (the reviewed set: `docs/qa/ferry/`). Faults those photographs found and fixed: the car deck and inner bulwarks drawn facing
  down (see-through), the transom's paint smeared and then half missing, the bow name half inside the plating, the
  draft marks inside the curved bow, the wheelhouse wings floating at half height.

## 5. Open: what is not built yet (in this order)

1. **Interiors** (batch 3): the saloon (carpet area to sit and lie on, seats, purser's window, toilets, vending corner,
   safety plan), the wheelhouse inside (wheel and autopilot, radar, magnetic compass, the throttles and telegraph,
   VHF, chart table, echo sounder, the navigation-lights panel), the crew quarters below (mess and galley, cabins,
   shower, changing room), entered from the ship like any building.
2. **Machinery modelled** (batch 4): engine room and steering-gear room in 3D (mains, gears, generators, main
   switchboard and 24 V board, pumps, tanks, CO₂ cabinet), and the switchboard as a live state (generators on and off,
   the preferential trip, the thruster interlock, shore power) that the scenarios drive.
3. **Crew in the world** (characters batch, never with ground or lighting): looks for Mr Nakandakari, Ms Uezu,
   Mr Higa Jr; the crew at their stations through each phase; Mr Fujita taking the line; guide entries and
   portraits so the storyteller can cast them; backdrops on board.
4. **Behaviour:** real mooring lines that run from the bitts to the bollards and slacken and tighten; the ramp lowered
   by the bosun, not by itself; the whistle; the wake and the engine sound; three cars at once (traffic loads one at
   a time today).
5. **The quay end:** a linkspan (可動橋) at Minato that follows the tide, as a real ferry port has, instead of the ramp
   landing straight on the quay edge.
6. **Kitano-jima:** cars there still do a half turn of 1.5 m radius on the plaza before backing aboard (the same
   shortcut Minato had); give it a real three-point turn too.
7. **Dry dock** (later, the creator): the underwater body is modelled for it now.
