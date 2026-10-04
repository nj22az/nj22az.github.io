# Johansson Town: MCP world walkthrough, 4 October 2026

The town has usable, detailed places, but the finish is not yet uniform. Sakura,
Front-Row Books, the warehouse and parts of the bathhouse establish a much higher
standard than the plain household furniture and some civic rooms. The next art pass
should bring the weaker places up to that standard, with readable silhouettes,
consistent materials, useful cameras and visible evidence of each resident's life.

This is an audit of the playable local build. The coverage and final validation
sections are being completed as the remaining walking sessions finish. Changes have
not been published.

## How the walkthrough was conducted

The clients connect to the shipped local server through the official MCP SDK. They
start at normal opening scenes, use keyboard movement, camera dragging, actual doors,
visible interaction buttons and ordinary purchases. They save tool inputs, observed
state and screenshots. The tours do not use the fixture's teleport, room-entry or
save-writing functions. Separate regression fixtures are identified as fixtures.

Navigation inspection reads the game's standing collision and floor rules. Proposed
routes are then walked with the real controls. Clear grid cells alone are not treated
as proof that a player can reach somewhere. Doors change the coordinate frame, so a
route stops at an actual room transition.

The town is paused between explicit test steps to make observations repeatable.
Screenshots render the normal game pipeline. This makes repeatable movement and
interaction checks possible; it does not prove long sessions on every physical GPU,
all weather states or every possible save.

## Improvements needed for a uniformly polished world

| Priority | Observed problem | Improvement and acceptance check |
| --- | --- | --- |
| High | Thuan's apartment has large blank walls, a plain blue window, a box cabinet and a simple yellow bed. Other homes repeat the same partitions, cushions and table arrangement. | Give each home a readable identity before any inspection text opens: one distinctive furnishing, one active work/hobby area and a few large, well-made daily objects. At the doorway, the occupant's life should be recognizable from the room. |
| High | Third-person views in compact apartments and the repair workshop are obstructed by Johansson's head or the structure. | Use a consistent interior camera with collision handling and character fading near the lens. Walk every wall, chair and doorway in both camera modes; no head or beam should obscure the primary action. |
| High | The classroom noticeboard visibly superimposes several large headings. Sakura's rack, newspaper and till lettering also had overlapping lines. | Use one typesetting system for signs, labels and papers: bounded line layout, consistent margins, separate title/subtitle baselines and natural letter proportions. Check actual pixels at desktop and phone sizes, including oblique views. Sakura's three overlaps have been repaired; the classroom remains a recorded finish defect. |
| High | The bathhouse pool rocks show distracting fine triangular linework at their edges. The Sakura awning/lintel has persistent diagonal speckling. | Review outlines, material depth separation and shadows on these exact surfaces. The Sakura repeat screenshots were identical, so the evidence establishes speckling, not flicker or a proven cause. Remove distracting internal triangle lines while keeping clean object silhouettes. |
| High | Materials, modelling detail and lighting vary sharply between furnished shop assets and basic room geometry. | Establish one shared prop/material kit: consistent edge treatment, outlines, wood/tile scale, roughness and room lighting. Keep the toy-like style while making furniture recognizably usable. Compare adjoining rooms and districts side by side at noon and at night. |
| Medium | The police-box interior displays the imported asset's “ForestHouse” identity. | Replace asset branding and unrelated signs with Minato Police Box information, local notices and a consistent police-office palette. |
| Medium | Community Kitchen and Mayor's Office read as broad flat walls and simple counters/panels compared with the shops. | Add functional task areas: food preparation, utensils and bookings in the kitchen; harbour paperwork, personal photographs and a coherent visitor/desk arrangement in the office. Objects need appropriate scale, contact with surfaces and clear walking space. |
| Medium | The shrine and lanterns use plain block geometry beside the more finished bathhouse. Blue Coral's compact signs squeeze the lettering. | Give garden objects the same silhouette and surface finish as the bathhouse. Redesign small signs for their available space instead of compressing words horizontally. |
| Medium | Personal household detail is often easier to learn from text than to see in the room. | Make everyday traces visible and intentional: shoes at the entrance, a used tea setting, work left in progress, family photographs and suitable storage. Avoid filling the room with tiny indistinct cubes. Keep routes to beds, tables, cupboards and doors clear. |

Examples from the actual walking sessions:

- [Classroom noticeboard and furnishings](../../output/mcp-interior-remaining-tour/school-walk-2.png).
- [Thuan and Nao's apartment](../../output/mcp-interior-final-tour/resident-home-thuan-walk-2.png).
- [Bathhouse pool and rock edges](../../output/mcp-interior-final-tour/onsen-walk-2.png).
- [Civic rooms and bathhouse comparison](../../output/mcp-interior-review-1.png).
- [Repeated family-home layouts](../../output/mcp-interior-review-2.png).

## Household art direction

These are proposed visual upgrades, not claims that new routines have already been
implemented. A small number of distinctive, finished objects will help more than
many low-detail props.

| Home | Identity to make visible |
| --- | --- |
| Aya and Reiko | Aya's reading/printing work and Reiko's newspaper materials, with separate bedside belongings. |
| Kenji and Tetsuo | An orderly repair bench, current radio project and separate instrument/pattern storage. |
| Thuan and Nao | Shop accounts and a packed work bag for Thuan; an evening-service detail for Nao; shared living space with individual ownership. |
| Mrs Sato | Recipe notes, an actual meal-preparation area and a personal tea/rest corner. |
| Kōji | Recognizable everyday tools and a cared-for personal work area. |
| Postman Tōma | Sorted mail, a delivery bag and a clear entrance routine. |
| Grandfather and Grandmother Taira | Two distinct places to sit, family photographs and useful household storage. |
| Mr and Mrs Chinen | Individual daily belongings and a visible shared task area. |
| Ms Uezu | A distinctive personal work/hobby arrangement and textiles. |
| Grandmother Gushiken | Family history, tea and objects at a comfortable reach and scale. |
| Mr and Mrs Tamashiro | A clearly occupied couple's home, with separate belongings and an active household task. |
| Mr Iha | A recognizable work or hobby station instead of the same generic arrangement. |
| Mrs Kohagura | Distinctive plants/textiles/personal storage tied to existing character descriptions. |
| Mayor | Harbour photographs, paperwork, a visitor area and the saved keepsake/customization choices presented coherently. |
| House to let | A deliberately prepared rental: clean, usable basics and a clear vacancy identity. |

Confirm occupation details against the authored character descriptions before adding
new objects. The goal is ordinary credibility inspired by Shenmue, readable stylized
objects and people inspired by Tomodachi Life, and personal, earned choices inspired
by Animal Crossing.

## Defects repaired during the audit

- **Garden bridge and pond loop:** the old east end of the bridge ended against the
  footbath. The whole crossing, rails and rock opening moved 1.7 metres north;
  the adjoining loop now bypasses the bath and porch posts. Regression checks walk
  the actual player body across both directions and verify the rendered floor.
- **Sakura magazine-rack customer:** old saved customer positions could place a
  browser inside the real magazine rack. Restored positions are checked against
  the actual shop geometry and occupancy. Customers must reach the real shelf
  before collecting goods and complete one payment before leaving.
- **Sakura inventory restoration:** the current stock catalogue remains authoritative
  while saved picked goods retain their claims. A saved pickup with an occupied
  shelf must walk to the shelf rather than remove stock at the entrance.
- **Sakura lettering:** category/subtitle, newspaper masthead/edition and till
  title/subtitle now have separate bounded positions.
- **MCP observation parity:** hidden old prompts and retired destination names no
  longer describe the current scene. The avatar editor and item viewer report their
  real movement lock; normal close buttons return to the room. Explicit test steps
  also advance the same hand-animation timers as normal gameplay.

The earlier work also relocated Rainflower into the town–garden–residential connection,
removed the airport bridge and retired decorative road vehicles, and made the
passenger/occasional-car ferry use one shared hull with real resident drivers.
Those changes are tested separately from the visual recommendations above.

## Coverage and evidence

Final coverage is being reconciled from the actual MCP logs. A room is counted as
visited only after a real entry; its exit status is recorded separately. Exterior
shop menus are not counted as additional rooms. The disabled cave/headland is not
present in the current playable world.

The audit uses separate legitimate starts for daytime interiors, evening service,
public coastal routes and transport. It is a set of recorded walking sessions, not
a claim of one uninterrupted journey through all locations.

## Validation

Final compiled-browser checks, source tests and screenshot comparison are pending
while the last walking sessions finish. The final report will distinguish confirmed
world defects, intentional obstacles, test-route errors and unverified cases.

See [AI-GAME-TESTING.md](AI-GAME-TESTING.md) for the installed local MCP server and its
bounded controls, and [the earlier audit](TOWN-AUDIT-2026-10-03.md) for prior household,
quest, customization and graphics repairs.
