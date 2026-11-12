# JS3-304-M1 · The stern ramp's hydraulic power pack HPU-R: what it is and how it is worked

Johansson Shipyard · operating instruction · revision 0 · 12 November 2026 · newbuilding No. 1, the Chisum

The owner, 12 November 2026, standing in the hydraulic pump room on the page: "Make a drawing for the hydraulic pack I don't
know what I'm looking at and how it's connected and what each pipe does etc , make an instruction for it as well".

The drawing is [JS3-304 sheet 4](../drawings/JS3-304-4-hydraulic-power-pack.svg): the room from above, every part numbered,
every pipe named. **The numbers in brackets here are that sheet's.** The diagram of the circuit is
[sheet 2](../drawings/JS3-304-2-stern-ramp-hydraulics.svg); the wiring is [sheet 3](../drawings/JS3-304-3-stern-ramp-electrical.svg).
Everything here is read from the numbers the model is built from (`ferry/blender/stern_place.py`) and from her register
(`ferry/systems/stern.py`). It is a simulation's instruction: not a maker's manual, not class-approved.

## 1. What it is for

One job: to open and shut the stern door, which is the stern ramp. The ramp is a steel leaf of about 55 t on six hinges at
the sill. Two hydraulic cylinders raise and lower it; ten hydraulic cleats and two safety latches hold it shut at sea. The
power pack makes the oil pressure for all of it. It is worked from the **control stand CS-R beside the stern door**, not from
this room: this room is where one comes to look at the oil level, to read the gauges, to switch the power on at the starter
panel, and to work the ramp by hand when there is no power.

## 2. Where it is and how to find one's way in the room

The hydraulic pump room is on the main deck, port side, 7 to 13 m from the stern. Its door is in the inboard wall, from the
vehicle deck. Coming in, turn right (forward). You stand in **the way**, 0.69 m wide:

- **On your left, toward the ship's side: the power pack.** A tank as high as a table (1) with three motors standing on
  its lid. The two large ones are the main pumps (2, 3); the small one nearest the door is the cleat pump (4). The grey
  block on the lid's edge beside the way is the pressure block (6): the dark bowl on it is the pressure filter (7), the red
  cap is the relief valve (8), and the dial that looks into the way is the system gauge (9). The black radiator on the
  tank's after end, the first thing you pass, is the oil cooler (10). The lever low on the tank's side is the hand pump (13).
- **On your right, on the inboard wall: the valve stand** (14). Three black valves, each with a lever: the ramp valve (15), the cleat
  valve (16) and a spare (17). On its top stand two dials (18) and seven lines.
- **Ahead, at the end of the way: the starter panel RSP** (19), a grey cabinet with two leaves.
- **Overhead:** the cable tray (20) over the power pack, and two pipes that cross the way at head height from the valve
  stand to the tank. Mind your head: the lower is 2.10 m over the deck.

## 3. What each pipe does

All the oil lines are painted the same orange. Each is known by where it lies.

| Line | Where it lies | From and to | What it does |
|---|---|---|---|
| **P** pressure | across the way, the lower of the two, 2.10 m | pressure block (6) to the valve stand (14) | The pumps' oil at up to 210 bar, on its way to the valves |
| **T** return | across the way, the upper, 2.19 m | valve stand (14) back to the tank (1) | The oil coming back. No pressure to speak of |
| **A** ramp, raise | lowest of the five on the wall, 2.30 m | valve stand to the rod side of both cylinders | Oil here pulls the cylinders in and **raises** the ramp. While the ramp is down it carries the leaf's weight |
| **B** ramp, lower | second, 2.37 m | valve stand to the piston side of both cylinders | Oil here pushes the cylinders out and **lowers** the ramp |
| **C** cleats, lock | third, thinner, 2.44 m | valve stand to the ten cleats | Oil here shoots the eight bolts and closes the two hooks: **locked** |
| **D** cleats, let go | fourth, thinner, 2.50 m | valve stand to the ten cleats and the two safety latches | Oil here draws the bolts, opens the hooks and lifts the latches: **free** |
| **E** conduit | top of the five, grey, 2.59 m | starter panel (19) to the control stand | Not oil: the control stand's cables |

A, B, C, D and E go aft along the inboard wall, through the after mooring station, up and across over the stern door's head.
The last half metre to each cylinder, cleat and latch is a hose, because those move.

**How the oil goes round.** Tank (1) → a main pump (2 or 3) → its non-return valve (5) → pressure block (6), through the
filter (7), past the relief valve (8) and the gauge (9) → line P → valve stand (14) → line A or B to the cylinders, or C or D
to the cleats → back through line T → cooler (10) → return filter (11) → tank.

## 4. The oil, and how much of it

The owner, 12 November 2026: "Also specify the oil and the level of oil etc , it needs to be fully functional". These are the
yard's choices for a deck system that stands in an unheated room and must work in the cold (`stern_place.FLUID`, `TANK`); they
are not a maker's figures.

| | |
|---|---|
| **Oil** | **ISO VG 46**: mineral hydraulic oil of high viscosity index, type HVLP (DIN 51524 part 3; ISO 11158 class HV). Viscosity index 140 or more; pour point -33 °C or lower. One oil for the whole system; never mixed with another kind |
| **How clean** | ISO 4406 18/16/13 or cleaner; water under 0.1 %. Filled through the filler's strainer (12), never poured in from an open drum |
| **How much** | The tank holds about 1,460 litres to its lid (0.88 m deep inside, 16.6 litres to the centimetre). It is filled to **1,260 litres** with the ramp raised and locked. With the two cylinders and the lines full she takes about **1,650 litres** in all |
| **Temperature** | Works at 30 to 55 °C in the tank. The cooler's fan starts at 45 °C and stops at 40 °C. **OIL TEMP alarm at 70 °C.** Under 0 °C: run one pump for ten minutes with the levers in the middle before the ramp is worked |
| **Pressures** | Main relief valve 210 bar; the cleats' relief valve 160 bar; the load-holding valves on the cylinders 250 bar. A running pump holds about 195 bar. Line A carries up to 198 bar while the leaf is lifted |

**The level glass** is on the tank's inboard side. The level is highest with the ramp raised, because the cylinders' rods are
then in; lowering the ramp takes the rods' own volume of oil out of the tank, 140 litres, and the
level falls 9 cm. That is as it should be, and it comes back when the ramp is raised.

| Mark | Over the tank's bottom | In the tank | Means |
|---|---|---|---|
| **FILL** | 0.76 m | 1,260 l | Fill to here with the ramp raised and locked. Not higher: the oil needs room to come back and to swell as it warms |
| **RAMP DOWN** | 0.67 m | 1,120 l | Where it stands with the ramp level on the quay |
| **LOW** | 0.60 m | 990 l | The level switch: **OIL LEVEL** lights at the control stand and the group alarm is given. Oil has been lost: find where |
| **STOP** | 0.48 m | 790 l | Under this the pumps are not to be run: they would draw air. The suction strainers are 0.10 m over the bottom |

## 5. Before it is worked

1. **Oil level:** in the level glass on the tank's inboard side: at FILL with the ramp raised (section 4). Low level lights
   OIL LEVEL at the control stand and stops nothing by itself: find the leak before topping up.
2. **Look under the pack:** the drip tray should be dry. Look along the hoses at the cylinders and cleats when at the stern.
3. **Gauge cocks open:** the red tee handle under each of the three gauges (9, 18). They are shut only to change a gauge.
4. **Power:** the isolator Q0 on the starter panel (19) to ON. The control stand's POWER ON lamp lights.
5. **At the stern:** nobody on the ramp or under it; the quay clear; the pins that hold the safety latches at sea taken out.

## 6. To open the stern door (from the control stand CS-R)

This is the plate engraved on the stand, with what is seen at each step.

| Step | Do | What you see |
|---|---|---|
| 1 | **Start a pump:** press PUMP 1 START (or PUMP 2; both for full speed) | PUMP RUNNING lights. The SYSTEM needle climbs to about 195 bar; so does gauge (9) in the pump room |
| 2 | **Cleats lever to OPEN**, and let it go: it springs back | The two safety latches lift, the eight bolts are drawn and the two hooks open. The leaf does not move |
| 3 | **Wait for CLEATS OPEN** | CLEATS LOCKED goes out, CLEATS OPEN (amber) lights. RAMP CLOSED stays lit: the leaf is still home |
| 4 | **Ramp lever to LOWER** | RAMP CLOSED goes out; the beacon on the stand is lit for as long as the ramp is neither locked nor landed. The RAMP LINE A needle rises as the leaf's weight comes on: about 68 bar at 30°, 189 bar with the ramp level. The end flaps fold out on the way down. Put the lever to its middle to stop anywhere |

The ramp lies level at 90°. It can go 4° further for a quay that lies lower. On the page it takes about a minute to level;
a real ramp of this size takes two to four.

## 7. To shut it

| Step | Do | What you see |
|---|---|---|
| 5 | **Ramp lever to RAISE** | The ramp comes up; the flaps fold back. With both pumps it is raised from its lowest in about a minute and a half |
| 6 | **Wait for RAMP CLOSED** | RAMP CLOSED (green) lights when the leaf lies against its seal. The beacon is still lit: the door is shut, not locked |
| 7 | **Cleats lever to LOCK** | The bolts shoot, the hooks close, the safety latches drop behind their strikers by their own weight. CLEATS LOCKED lights, the beacon goes out |
| 8 | **Stop the pumps** | PUMP RUNNING goes out; SYSTEM falls to 0 |

At sea: put the pin through each safety latch, and report "stern door closed and locked" to the bridge, whose door and ramp
panel shows the same from the same switches.

## 8. What the stand will not let you do, and why

- **No lever does anything until a pump runs.** No pressure, no movement.
- **The ramp is not lowered while the cleats are locked.** It would be pulling against its own bolts.
- **The cleats are not locked until the ramp is home.** A bolt shot with no keeper before it holds nothing.
- **The emergency stop** (the red mushroom on the yellow ring) trips both pumps and holds the ramp where it is. A pump cannot
  be started until it is released.

## 9. What holds the ramp if something fails

- **A hose bursts, or the pumps stop with the ramp part way:** a load-holding valve is bolted to each cylinder. It shuts by
  itself, and the ramp stays where it is.
- **The pressure goes too high:** the relief valve (8) opens at 210 bar and lets the oil back into the tank.
- **The ramp is shut and all the oil is lost:** the two safety latches hold it. They are held by their own weight, not by
  oil or power: "There needs to be a latch for the ramp too, so it doesnt become dangerous" (the owner).

## 10. With no power

- **From the valve stand (14):** each valve has a lever. With a pump running the ramp and the cleats can be worked there by
  hand if the control stand's circuit has failed.
- **With no electricity at all:** the hand pump (13). About 20 cm³ a stroke: enough to work the cleats in a few minutes; the
  ramp, through the change-over cock, slowly.

## 11. Lamps and alarms

| Lamp at the control stand | Means | Do |
|---|---|---|
| OIL LEVEL (red) | The tank's level switch: the oil is low | Stop; find where it went; top up through the filler (12) |
| OIL TEMP (red) | The oil is too hot | Let the cooler's fan run; rest the pumps; is the cooler (10) blocked? |
| Filter clogged (lamp on the starter panel; group alarm) | The pressure filter (7) or the return filter (11) is full | Change the element |
| A pump tripped (group alarm in the control room) | Its breaker or overload has opened | At the starter panel (19): find why before resetting |

Any of the four gives one group alarm, "stern ramp power pack", to the engine control room.

## 12. Looking after it

A yard's usual routine for a pack of this kind, not a maker's schedule.

- **Every time it is used:** the level glass; the drip tray; a look at the hoses at the stern.
- **Weekly:** the three gauges read 0 with the pumps stopped; the filters' indicators; the cooler's matrix clear of dust.
- **Monthly:** grease the six hinges and the cleats' bolts; work the hand pump a few strokes; try the emergency stop.
- **Yearly, or by the oil's hours:** a sample of the oil; the pressure filter's and the return filter's elements.

## 13. What works on the page today, and what does not

**Works:** the pumps' START and STOP buttons, the two levers and the emergency stop at the control stand, with the refusals
of section 8; the eight lamps except the two oil lamps; the two pressure indicators at the stand and gauges (9) and (18, line
A) in the pump room; the beacon; the starter panel's two leaves, which open on its insides; the ramp, its flaps, its latches
and its ten cleats, in their order.

**Drawn, and not worked:** the valve stand's own levers; the hand pump; the gauge cocks; the stand's key switch, lamp test and
horn; the two oil lamps (nothing aboard makes the oil low or hot yet). **The level glass has no marks yet and its level does not
move with the ramp; the oil's temperature is not kept; the cooler's fan does not turn.** Making the pack work in full, to this
instruction, is the next piece of work on it.

**Not yet as the diagram has it** (sheet 4 says the same): the return line T is drawn coming down onto the pressure block
beside P, where the diagram takes it through the cooler and the return filter; the cleat pump is drawn delivering into the
same block, where the diagram gives it a line and a relief valve of its own (160 bar); the lines carry no markers aboard.

**Not designed:** the scantlings of the leaf, its pins and brackets; the quays and the tide she is to lie at.
