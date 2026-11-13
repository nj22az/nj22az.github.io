# Jack the Ripper (a killer is loose): the music video

An animated music video for the owner's song, begun 12 November 2026 on the branch `claude/sharp-dijkstra-ebs7m7`.
This file is also the film's handover: **read *State* first.**

## The brief, in the owner's words, in the order said

1. "Make an animated music video of my song, use meshy for assets, and blender to spruce it up go for Disney quality, moulin rouge style music video"
2. "Use Remotion"
3. "You need to fully rig the characters"
4. "The moulin rouge doesn't have to be there, isn't it better with an east end pub or other London landmarks?"
5. "In the chorus, I want Jack the Ripper to dance like the skeletons in the skeleton dance in a misty fog, and we shouldn't see his face, it should be covered by the fog even if his face is animated and there"
6. "The mill text looks Russian make the stage look like east end"
7. "He shouldn't be four, he is just one"
8. "Animate the logo as introduction to the music video before it starts" (the Johansson Animation Studios mark)

What follows from them: the film is an East End music hall playing a Whitechapel street. One Jack. His face is
never seen: a bank of mist rides in front of it in every picture (Blender) and the edit lays more over it (Remotion).
Nothing violent is drawn: the blade is a glint of light, the blood is red light and falling petals.

## How it is made

| Step | Tool | Where |
|---|---|---|
| Characters, set pieces, skeletons, clips | Meshy (text to 3D, remesh, rigging, animation library) | not in the repository (see *Assets*) |
| The set: stage, curtain, street, fog, lights, the lettered pub sign | Blender 4.2, `blender/stage.py` | builds `stage.blend` |
| The cast and every clip in one library | `blender/cast.py` | builds `cast.blend` |
| The photography: every shot posed by the song's seconds | `blender/film.py` | writes plates, cast frames, `manifest.json` |
| The edit: studio card, cuts, moves, fog, rain, petals, lettering, the song | Remotion 4, `remotion/` | renders the MP4 |

One clock runs through all of it: the song's seconds. `film.py`'s `pose(shot, t)` alone decides a picture, so any
frame renders the same alone or in sequence. `blender/beats.json` holds the song's beats (librosa: about 92 a minute);
the dance and the cuts are on them. The lyric times are the ones embedded in the owner's file.

Each shot is two layers: a still plate of the set (1280 x 720) and the cast on transparent film, 12 pictures a second
(animated on twos), cropped to where they stand. The edit runs at 24.

**The cast** (Meshy sculpt, textured, remeshed to about 92,000 triangles, 24-bone body skeleton each):
Jack, the singer, the can-can dancer (used four times), the constable. The skeletons have no fingers and no face
bones: nobody's mouth moves, and the singer does not lip-sync. Clips from Meshy's library are raw material; Jack's
chorus dance (`skeleton_dance` in `film.py`) is built by hand on the rig: bow-legged bounce, see-saw forearms,
side-shuffle, knock-knees, a leaping turn, in the manner of the loose-limbed graveyard dancing of 1929 cartoons, without
copying any film's drawings.

## To build it again

```bash
# Meshy models: <assets>/{house,lamp,pub,clocktower,dome}.glb and <rigs>/<who>_{rigged,walking,running,aNN}.glb
blender -b -P blender/stage.py -- --assets <assets> --out stage.blend
blender -b -P blender/cast.py  -- --rigs <rigs> --out cast.blend
blender -b stage.blend -P blender/film.py -- --cast cast.blend --out <film> --pass bg
blender -b stage.blend -P blender/film.py -- --cast cast.blend --out <film> --pass fg      # resumable
python3 blender/shadows.py <film>            # keeps only the cast's own shadows (fgc_*.png), needs numpy and scipy
cd remotion && npm install && ln -s <film> public/film && node prepare.mjs && npm run render
```

`--pass preview --every 30` gives quick whole pictures of every shot for checking the staging.
`remotion/public/song.mp3` is the owner's song (not committed: it is the owner's recording).

## Assets and rights

- **The film will be published and sold** (the owner, 13 November 2026: "this video will be published and sold, I hold
  the rights to the music too"). Every ingredient must therefore be clear for commercial use; the check of each
  against its vendor's own terms was begun the same day and its results belong in this section.
- **The song and the studio mark** are the owner's own.
- **Meshy plan**: the owner is on Meshy's Professional plan ("it says I can use it commercially").
- The fog, wisp and grain pictures (`remotion/public/`) and the scream (`remotion/scream.py`) are made by code in this
  folder; no third-party picture or recording is in the film. No AI lip-sync or voice model has touched it.
- **Meshy** made the models under the owner's Meshy account, through Meshy's API (144 tasks: 11 models, rigs,
  26 clips). The GLB files (61, 2.7 GB) are **not in the repository** and **not in the Meshy workspace** either: API
  output never appears there and Meshy deletes it three days after it is made. The only copies are in the cloud
  session's scratch folder (`meshy/`), which does not last: they must be copied to the owner's own storage.
- **The whole rights record is [RIGHTS.md](RIGHTS.md)**: each ingredient checked against its vendor's own terms on
  13 November 2026, what must be kept, and one point to know about another company's trade marks on a cartoon sailor (Johansson, the studio's sailor, is the owner's own character).
- **Fonts**: Pirata One, IM Fell English and its small capitals, Limelight (SIL Open Font License, through
  `@fontsource`); DejaVu Serif Bold on the pub sign.
- **Remotion** is free for individuals and small teams; a company of more than three people needs its licence.
- The pub's name, The Black Lantern, is invented. The clock tower and the dome are generic London silhouettes.

## State

*13 November 2026, about 05:00 UTC: the second cut is being rendered; the first cut (above brief, items 1 to 8) was
delivered at 01:40 and is superseded.* After seeing the first cut the owner asked, in this order:

9. "rig the face of one of the ladies, so she can be synced to the voice, she is the one singing"; "the fog should be
   uniform, now it looks painted"; "tighten up the animation? use Disney quality control"
10. "make normal people walking through white chapel, jack the rippers dance need to be funny and absurd but
    elegantly animated"; "I want it to feel like a professional animation"
11. "we should see the singer from dramatic angles, she is the star, Jack the Ripper and London is the backdrop";
    "The singer let's call her Polly ... zoom in on the face etc and body, and lightning from the stage"
12. "The characters except the singer needs to rigged too, and some of them should dance together with Jack the
    rippers skeleton dance"
13. "Make a story board so I can see the direction ... before you make it" (made; the owner: "I think it looks better
    already", then "Proceed"); "Audit yourself you will decide when it's acceptable"
14. "Animation needs to fit what she is singing, footsteps echo on the cobble stone, then it should zoom in one lone
    feet walking naturally"; of Jack's walk: "make it look more dramatic in the opening now he sort of floats"
15. "The lipstick looks wrong, simplify"

What was built for it (all in `blender/`):
- `face_rig.py`: Polly's face on Meshy's closed surface: jaw (`open`), `wide`, `pucker`, a mouth interior decal, eyelids.
  **Run it once on a fresh `cast.blend`**; `lipsync.py` turns the sung words (`words.json`, found by a speech model on
  the recording) into `lipsync.json`, which `film.py` plays on her face.
- `film.py` rewritten round Polly: 26 shots, each line of the song pictured by what it says; a hand-posed stance and
  gestures for her (`polly`); Jack's dance pose to pose (`F_RATTLE`, `F_SNEAK`, `F_PIROUETTE`, `F_SOFTSHOE`, `F_CANCAN`,
  `F_SHIMMY`), which any character can dance; his walk in the opening a heavy stalk with a heel on every beat
  (`stalk`); three townsfolk from Meshy (flower seller, clerk, dock worker); shade under every foot; the fog banks
  gone, the plates hazed by distance in the compositor; the set throws no shadow in the cast's pass, so
  `shadows.py` is no longer needed.
- `--pass qc` measures every shot without rendering (sliding feet, feet under the street, joints that jump, crowding).
  Its last run: walking feet hold (0.1 to 0.6 m/s against 4 to 13 before); what it still names is running (feet in
  the air), the soft-shoe slide and the pirouette (meant), and kicks (fast by nature).
- The storyboard the owner approved: <https://claude.ai/artifact/2bmW1wgoUjfSk3ekPuqppG> (private to the owner).

*Since then (13 November, to about 10:45 UTC).* The second cut was delivered at 08:00. The owner: "This is really
awesome I only see some physics errors and problems with them bleeding into the props"; then "Can't you redraw
Jack and rig his cloak too".
- **Props.** `--pass qc` now also tries every joint of every actor against every solid piece of the set, every
  picture: 64 cases in the second cut. The street was widened in `stage.py` (the pub, the side house and the back
  terrace moved out of the playing area) and every lane in `film.py` laid at least 0.6 m clear of the lamps and
  the sign: 0 cases now, and no two actors in one place. The set built this way is `stage2.blend`.
- **Polly's mouth** opens half as far again when she sings (`sing`).
- **A second Jack** from Meshy with no cloak on his body (`rig2/` in the scratch folder; `cast2.blend`), and
  `cloak.py`: his cloak as cloth of its own, simulated against his body and baked once a shot. Tried on the feet
  shot and three others as pictures; **no cut with it exists yet**.
- The third cut's frames and plates (1,463 and 28) are rendered; it was being assembled when this was written.
- The cloud machine restarted twice in the day; the scratch folder survived both times. Background jobs there are
  stopped after two hours: every long render here is resumable.
Meshy balance about 1,760 credits.

*Since then (13 November, to about 13:30 UTC).* The third cut (widened street, no prop collisions) and the fourth
(the second Jack with his cloth cloak) were delivered. The owner on the fourth: "This is near perfect, can the London
fog be a bit more prevalent and cover some of the bleeding into buildings? And ... could we add a scream? I think when
she sings about the scream swallowed by the night"; "Polly needs to pop, right, even if the fog is heavier"; "the scene
where polly raises her arm up to the moon looks like her body deforms ... her bustier expands with her arm raise";
"the animated Logo intro can you improve it ... make it look like one of those old Credits Screens in old Disney
Cartoons"; "make my Logo a SVG, and move around the text a bit"; of the scream: "no that is perfect"; and of the
fourth cut's fog: "its much better ... the fog is awesome now you dont have to put a fog dot on his face"; "we are
never supposed to see Jacks face, the normal fog should cover it always even though we see its a person"; "no the hat
too, its like Polly pops, but Jack doesnt pop, he is only there and we cant really see who he is".
- **Fog** (`remotion/src/Film.tsx`): thicker between the set and the cast where street meets house fronts; a front fog
  with a clear pocket that follows Polly, and a soft light behind her (`StarHalo`, `FrontFog`).
- **The scream** at 27.7 s: `remotion/scream.py` makes `public/scream.wav` (synthesised; no recording used).
- **Polly's bodice** (`blender/fix_weights.py`, `cast3.blend`): Meshy had skinned part of her chest to her upper arms.
  Arm weights now hold only close to the arm bone; the rest goes to the spine. The same for the dancer.
- **Jack in the fog** (`film.py`, `in_fog`): the bank that stood in front of his head is gone (`--veil on` brings it
  back). His own surface and his cloak's are taken part of the way to the fog's colour, his head and hat most of the
  way, his face all the way. In the edit a level layer of fog lies at his head's height in his solo shots (`FogLayer`);
  the edit's own dot (`FaceMist`) is removed.
- **The studio card** (`remotion/src/Intro.tsx`, six seconds): a 1930s title card in manner (sunburst, ruled frame,
  medallion, the parts of the mark coming on one by one, projector weave, flicker, dust, iris). No studio's card copied.
- **The logo as vectors**: `remotion/logo_trace.py` (potrace, part by part) and `logo_build.py` write
  `remotion/public/logo.svg`, `assets/images/johansson-animation-studios.svg` and `remotion/src/Logo.tsx`. The owner's
  corrections: "© Nils Johansson" to the bottom right with the sign after the name; ink-stamp roughness (an SVG
  filter); the outer ring made concentric with the inner ("make the circle around fit the logo better"); and the hand
  on the anchor with three fingers and a thumb. Two redrawn hands were refused ("why the ugly redraw, cant you just
  remove one of the lines for the finger"); what stands is his own drawing with the lowest dividing line taken out
  and the other two moved down to even the fingers. The owner: "the hand looks good now".
- `films/NEXT-VIDEO-PROMPT.md`: a prompt for a local session on the owner's Mac to start the next film.
- **Polly's bodice, again** (`blender/fix_bodice.py`, `cast4.blend`). The owner, of the first half of the fifth cut
  sent as a preview: "this is the only problem now, it doesnt seem as it was fixed" (the bodice's side still went up
  into her armpit on the moon reach). Measured: her collar-bone joints held up to 0.95 of the weight of 9,000 points
  of her chest, and the arm joint up to 0.75 of the bodice's side by the shoulder. The corset is now found by its
  paint (8,047 dark points of her trunk) and follows the spine only; skin beside it is eased over 4.5 cm. Tried on
  the moon frame, old against new; the owner: "oh much better proceed". Run after `fix_weights.py`:
  `blender -b cast3.blend -P fix_bodice.py -- --out cast4.blend singer`. Not done for the dancers.
- **The fifth cut is rendering** (all Jack and Polly frames again, Polly's with `cast4.blend`, and Jack in the fog, into the
  scratch folder's `film5/`; then `--pass tracks`, `node prepare.mjs`, Remotion). Not yet delivered or reviewed.
- Not asked of the owner yet answered: whether the film may be published anywhere. Song, renders and Meshy files are
  still outside the repository.

*Since then (13 November, to about 16:15 UTC).* The owner: "this video will be published and sold"; "how is the
lipsync ? is it correct?"; "Do Google drive and make another character we can use later that doesn't go in the film a
Chinese girl and maybe more wapping scenes and London scenes Big Ben", "Use Meshy", with a photograph of the girl:
"make her look like she fits in the doll world you made with Meshy"; "Backup the current 4th cut to google drive too and
the 5th when it's released".
- **Rights**: [RIGHTS.md](RIGHTS.md).
- **The review of the fourth cut and the lip-sync audit**: [REVIEW.md](REVIEW.md). 95 confirmed faults; the lip-sync
  is "partly" right. The edit and set faults are being fixed for the fifth cut (`remotion/src/Film.tsx`,
  `blender/stage.py`: committed as work in progress, not yet verified); the animation faults and the rebuilt lip-sync
  (`blender/lipsync.py`, in progress) are for a sixth cut.
- **The fifth cut's cast frames** render from a frozen copy of the scripts as they were at commit `71c9745`
  (`blender_v5/` in the scratch folder) with `cast4.blend`, so that work on the sixth cut does not change it midway.
- **Drive**: the owner's Drive folder "Johansson Animation Studios - Jack the Ripper - source files" receives the
  fourth cut, `cast4.blend`, `stage2.blend` and every Meshy model, rig and clip, cut into pieces under 10 MB (the
  connector's limit) with a read-me and `join.sh`. Upload in progress when this was written.
- **For later films** (not in this one): a doll-world character of a young Chinese woman of Limehouse with two long
  braids, made from a written description (the photograph was not sent to any service), and set pieces: Big Ben, a
  Wapping warehouse, Wapping Old Stairs, a riverside tavern, a Thames barge, a jetty, a railway arch, a hansom cab.
  In the scratch folder's `later/`; being generated when this was written.

*Since then (13 November, about 18:05 UTC).* **The fifth cut is delivered** (`remotion/out/jack-the-ripper-v5-720p.mp4`,
138.5 s): cast frames from `cast4.blend` with Jack in the fog (frozen scripts, `stage2.blend`), the 28 new plates from
`stage3.blend`, the edit fixes. Reviewed on a contact sheet of stills only, not in motion. Its lip-sync is the OLD timing.
- **For the sixth cut**: the rebuilt mouth timing (`lipsync.py`, `words.json`, `lipsync.json`; checked against the
  recording, never rendered); the head lift in `sing()`; every animation fault in [REVIEW.md](REVIEW.md); the face rig
  (round O, F and V, teeth, eyelids); crops too tight in `region()`; the follow-spot beam card. The set to use is
  `stage3.blend` (scratch folder `v5fix/set/`), built by the present `stage.py`.
- **Later-film pieces** (scratch `later/`): the girl is `limehouse_girl2/` (rigged, walk and run; the first try
  `limehouse_girl/` is a child-proportioned miss). Of eight set pieces only the jetty and the tavern are usable; the
  prompts ran past Meshy's 600-character limit. 320 credits spent; balance 1,443.
