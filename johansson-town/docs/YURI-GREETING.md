# Yuri greeting review

## Behaviour

Yuri raises her right forearm, gives two small wrist waves and a gentle head tilt,
then returns to her authored idle over 1.6 seconds. The greeting uses the current
Meshy skeleton. The GLB, skin weights, textures and supplied locomotion are unchanged.

She welcomes the player once per shop visit when within three metres and looking
towards the counter. This happens before opening a dialogue panel. Opening a new
conversation also requests the greeting and faces Yuri towards the player; topic
changes do not request another wave, and an active greeting cannot be extended by
repeated requests. Other residents retain their existing gesture timing.

## Verification

- `npm test`: 29 passing tests, including sampled hand movement, planted feet,
  bounded head motion, neutral endpoints, unchanged source clips and rig pose,
  single-shot playback, repeated requests, conversation topics and counter approach.
- CPU geometry inspection used the actual skinned runtime mesh and texture at idle
  and mid-greeting. This is a pose review, not an in-game WebGL rendering check.
- The supervised preview started, but the browser failed to create a WebGL context
  (`GL_VENDOR = Disabled`, `GL_RENDERER = Disabled`). In-game visual QA remains open.

## Remaining visual acceptance check

1. Enter Sakura Shōten during opening hours, approach the counter and look at Yuri.
   Confirm a single visible welcome above the counter before opening dialogue.
2. Watch the complete greeting at normal conversation distance: check the elbow,
   sleeve, hand and head from the front and either side for intersections or snaps.
3. Open dialogue quickly during the welcome, select several topics, then close it.
   Confirm no repeated waving, frozen raised arm or jump back to idle.
4. Leave and re-enter the shop; confirm the welcome is available again. Check on
   desktop and iPad with the existing camera and touch controls.

Facial morph targets, blinking, smiles and facial animation are not added by this
change. Visual acceptance should not be inferred from the automated tests alone.
