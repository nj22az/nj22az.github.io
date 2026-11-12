# Two ships: how we proceed

Johansson Shipyard · the plan of 11 November 2026 · for the owner's word before any of it is acted on

The owner, 11 November 2026, after the 68 m Chisum went live:

- "I'm thinking the Minato Maru can be simplified , this is an additional ship"
- "So let's see what can be removed from Minato Maru and what can be cross used"
- "Minato Maru only needs a crew of two an engineer and a skipper"
- "Chisums is a real ship"; "make a plan on how to proceed here"

## 1. The two ships

| | Minato Maru | Chisum |
|---|---|---|
| What she is | Johansson World's town ferry: a cartoon ship that sails, is boarded and makes stories | The real ship: designed and built as a yard builds one, with drawings, a register and class |
| Size | 34.5 m | 68.4 m |
| Crew | **Two: a skipper and an engineer** | Twelve, as her general arrangement has cabins for |
| Where she lives | The Town's repository (`nj22az/johansson-town`) | This repository, `/ferry/` |
| The test for anything aboard | Does a story or the play need it? | Would a yard draw it, and can it be checked? |

**The rule that follows: engineering is done once, aboard the Chisum.** What the Minato Maru has of it is carried over
first and removed after, never the other way round.

## 2. The order

| | Phase | Where | Changes the game? | Waits for |
|---|---|---|---|---|
| A | The Chisum's first weights and stability | here | no | nothing: can start now |
| B | The Chisum's machinery, inheriting the Minato Maru's | here | no | nothing: can start now |
| C | Minato Maru: what nobody would miss (level 1) | Town | no | the owner's word, and a way to push to the Town |
| D | Minato Maru: a crew of two | Town | **yes** | the owner's answers 1 and 2 below |
| E | Minato Maru: the engineering dressing off (level 2) | Town | a little | phase B done, so nothing is lost |
| F | The Chisum, section by section, to a finished ship | here | no | the owner's answers on her drawing |
| G | The Chisum in Johansson World | both | yes | the owner's answer 4 |

A and B come first because they cost the game nothing, need nobody's decision, and B is what makes E safe.

## 3. The Chisum: a real ship

**A. First weights and stability (yard documents JS1-104, JS1-106, JS1-107).** She has lines and a general arrangement and
nothing calculated beyond her volume. Before more is built on her: her hydrostatics from `lines.py`, her steel weight
from the model's own plating, allowances for machinery and outfit, and a first check of her stability. The Minato Maru's
screening (`ferry-engineering-hydrostatics.js`) gives the method. This is what answers whether her beam stands, and it
is cheap to learn now and dear to learn later.

**B. Machinery (JS6-601 to 604, JS7-701 to 706, JS8-851, JS8-852).** Her engine rooms are bare and her gearbox flanges are
waiting. Built to the three yard standards, and inheriting from the Minato Maru:

| From the Minato Maru | Becomes aboard the Chisum |
|---|---|
| The plant: every machine with a state, and the chief's rules | The machinery section of her register (`ferry/systems/`) |
| The load list and its five conditions (sea, arrival, loading, night, blackout) | Her load balance, sized for three 320 kW generators |
| Piping system by system, KKS tags | Her fuel, lubricating oil, cooling, air and bilge diagrams |
| The feeder and cable rules | Her one-line diagram; her register already sizes circuits by them |
| The Blender engine room's machines | The start of her engines, gears, generators and pumps; the engines "on the pattern of the Scania DSI 11" |

With it the owner's two rooms below: the engine control room, and the engine department's day room and toilet.

**F. Then, in this order, each a section that ends at the same gate:**

| | Section | Why here |
|---|---|---|
| 1 | Car deck: lane marks, lashing, drainage; the bow visor cut and the inner door working as the stern ramp does; the ramps' power unit, securing and seal | It is what she is for, and it settles the stern door's width |
| 2 | Accommodation: cabins with wet units, mess, galley | It brings back the 36 register components that went with the first Chisum's bridge deck |
| 3 | Saloon, kiosk, toilets | The passengers' ship |
| 4 | Safety: life-saving appliances, fire control plan, escape | Reads every room, so it follows them. The Minato Maru's safety-plan pen draws it |
| 5 | Mooring and anchoring | Deck machinery last |
| 6 | Class: each section submitted and answered; then survey and a sea trial programme | As the bridge was (PA-001) |

**The gate, every time:** `ferry/blender/make.sh` passes whole; the six page checks pass one at a time; class has read
the section and its comments are answered or listed as open; the records say what was and was not checked. Then it is
published on the owner's word.

## 4. The Minato Maru: a simple ship

**C. Level 1.** The drawings, the CAD tools, the evidence, two unused modules, the old viewer export: about 23 MB and
3,200 lines, with nothing seen or played changing. The list is in `temp/minato-maru/SIMPLIFY.md` (work branch). The five
repairs still open on her Rev C list fall away with the drawings they came from.

**D. A crew of two.** Today she has eight posts, each held by a named person with a station, a cabin and a day. This is
the part that changes the town, so it is set out step by step:

1. **Who the two are** (answer 1). The yard's proposal: the skipper is Fujita, who is her master today. The engineer is
   Johansson, with Mac relieving him whenever he is ashore, as now: the owner's decision of 21 October stands, that she
   sails to her timetable and never waits for him.
2. **The six who sign off** (answer 2): Ryo the chief officer, Chin the motorman, Ms Uezu the bosun with Kōji her relief,
   Ren the deck hand, Aya the purser, Jun the cook-steward. They are people of the cast with homes and friendships;
   nobody is deleted by this plan. The proposal: they are the Chisum's crew, standing by her while she is built, as a
   crew stands by a newbuilding. Chin keeps his repair work ashore, which he already has.
3. **What must not break.** Kōji's weeks ashore drive the trade round, the fish market, the laundry, the kissa and the
   quay breaks (they all read the bosun's rota). The rota stays his when the post goes.
4. **Who does the work of eight.** The engineer takes the motorman's steps of the departure work and the ramp; the
   skipper takes the count of passengers; the shore hands, Jack at Minato and Kai at Kitano-jima, keep the lines, as
   now. The cook-steward's kiosk becomes the drinks machine, which the Chisum already carries.
5. **Her rooms.** Two cabins, a small mess. The other crew cabins and the galley for eight go or become stores; the
   saloon, the car deck, the bridge and the engine room stay.
6. **In the code:** the manning plan and the roster's ship posts from eight to two; the crew's stations and day; the
   departure sequence; vehicle securing; the tests of all of them; the Town's own records of the cast; and a step in
   the save's migration for the four who live aboard.

**E. Level 2.** Her yard-grade pipes, cables and tags, the Blender engine room, the posted safety plan, the bridge's small
machinery: off, once phase B has carried them over. Her plant keeps a short machine list of its own, so the engineer
still has an engine to stop and a blackout to mend.

## 5. Where the work is done

- **Here** (the Chisum): a cloud session can build, check and push. Publishing waits for the owner's "Publish now".
- **The Town** (the Minato Maru): a cloud session can read it and cannot push. Either the owner grants a session push
  access, or the work is carried in `temp/minato-maru/` and brought back locally, as that folder's README describes.
- The Minato Maru's engineering stays in the Town's history whatever is removed.

## 6. For the owner to decide

| | Question | The yard's recommendation |
|---|---|---|
| 1 | Who are the skipper and the engineer? | Fujita; Johansson, with Mac when he is ashore |
| 2 | What becomes of the other six? | The Chisum's crew, standing by her building; nobody leaves the cast |
| 3 | Level 2 as well as level 1? | Yes, after phase B |
| 4 | Does the Chisum enter Johansson World, and where does a 68 m ship lie? | Later, after her car deck: her outside as a simple shape, at a berth of her own |
| 5 | Is the Rev C work dropped rather than brought back? | Yes, but for the small fixes named in `SIMPLIFY.md` |
| 6 | The eight questions on her general arrangement (JS1-102), and the stern door's width | Phase A answers the beam; the rest are the owner's |

## 7. What is not done without the owner's word

Nobody's place in the town is changed, nothing is deleted in either repository, and nothing is published. Phases A and B
change only the Chisum's own files on the work branch.
