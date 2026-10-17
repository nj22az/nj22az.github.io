# Combat design and Tekken source study

## What was inspected

Public source from [omarma/tekken3-expanded](https://github.com/omarma/tekken3-expanded), main at `fc835dc9bd30cc6dd207067b1e269f47f70f6170`, inspected 2026-10-17:

- [`src/tekken3_ttt1_combat.c`](https://github.com/omarma/tekken3-expanded/blob/fc835dc9bd30cc6dd207067b1e269f47f70f6170/src/tekken3_ttt1_combat.c): move records and graphs, conditional transitions, recovery aliases, hit reactions, contact groups, counter tables, guard state and pushback. Its guest-move adapter describes 56-byte records, first/last active-frame bytes at offsets 45/46, and per-limb historical samples for swept collision. It also ends transition blending before an active window, or disables blending when entering that window late, so the striking foot reaches its intended position.
- [`src/tekken3_ttt1_motion.c`](https://github.com/omarma/tekken3-expanded/blob/fc835dc9bd30cc6dd207067b1e269f47f70f6170/src/tekken3_ttt1_motion.c): conversion of arcade pose channels into local joint matrices, including transition poses. Animation data and combat move logic are separate but must agree on the contact frame.
- [`tools/ttt1/combat_semantics.py`](https://github.com/omarma/tekken3-expanded/blob/fc835dc9bd30cc6dd207067b1e269f47f70f6170/tools/ttt1/combat_semantics.py): frame events, attack properties and their interpretation during conversion.

This is a study of the publicly visible conversion/adapter code, not a complete reverse engineering of the original Tekken 3 executable. The project imports game data from the user's discs/ROMs; those data were not supplied or analysed. No Tekken code, models, animations, move data or sound assets are included in this game.

## Practical conclusions

A recognisable martial art needs coordinated choices: stance, footwork, strike trajectory, distance, weight shift, recovery and permitted combinations. Changing attack speed or a character's label alone is insufficient. The inspected implementation reinforces three useful engineering rules:

1. Represent each move with explicit startup, active and recovery intervals, reactions and legal follow-ups.
2. Keep the animation's contact pose aligned with the active interval. Do not blend a strike away from its target during that interval.
3. Follow the striking limb between frames when testing collision. A fast foot can pass through a target between discrete samples.

Our move definitions and implementation are original. The numerical values below are game-balancing choices, not Tekken frame data or measurements of real fighters. Style assignments are proposed character directions rather than established Johansson World biography.

## Current character directions

| Fighter | Direction | Movement and tactics | Implemented techniques |
|---|---|---|---|
| Thao | Kickboxing | Higher hand position, mobile pressure, faster punches, hip turn on roundhouse | Lead jab, rear cross, roundhouse |
| Thuan | Okinawan karate inspired | Lower, more settled stance, measured entry, longer straight kick, timed deflection and counter | Lead straight, reverse punch, front kick |

Punch once with X/J; press again in the confirmed contact window for the rear-hand follow-up. Y/K kicks. Hold A/L to guard; Thuan's first four simulation ticks of guard can deflect a frontal attack, giving a temporary counter bonus. Ordinary sustained guard does not repeatedly deflect. This window is an accessible game mechanic, not a claim that karate defence works automatically.

| Fighter / move | First active tick | Last active tick | Total duration | Damage | Centre-distance reach |
|---|---:|---:|---:|---:|---:|
| Thao lead jab | 5 | 8 | 20 | 7 | 0.69 m |
| Thao rear cross | 7 | 10 | 27 | 11 | 0.77 m |
| Thao roundhouse | 15 | 20 | 40 | 16 | 0.89 m |
| Thuan lead straight | 9 | 12 | 28 | 10 | 0.74 m |
| Thuan reverse punch | 9 | 12 | 31 | 13 | 0.79 m |
| Thuan front kick | 18 | 22 | 44 | 19 | 0.98 m |

At 60 simulation ticks/second, move age starts at zero on input. Durations exclude shared hit stop. A hit against an attacking opponent adds 3 damage; a successful timed deflection grants a 40-tick opportunity for a 4-damage counter bonus. Inputs buffer for six ticks. A punch may branch only after contact, during a defined seven-tick follow-up window. The AI uses different preferred distances and decision cadences for each fighter.

## Present limits

Collision currently uses horizontal centre distance and a facing cone, not the rendered fist or foot. Dodging has an explicit invulnerability window. There are no high/mid/low attack levels, crouching guard, throws, launchers or full move lists. The knee chamber, hip turn, punch extension and recovery are procedural first passes; they are not motion capture or a validated biomechanics simulation.

The next fidelity work is skeletal swept capsules and body hurt volumes, high/mid/low defence, planted support feet, stronger kick retraction and blended recovery. These should be tested together so visual contact agrees with registered hits. The fixed 60 Hz simulation is already independent of rendering; 60 fps on RG CubeXX still requires measurement on the physical device.
