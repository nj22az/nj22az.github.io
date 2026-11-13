# Prompt for the next music video (for a local Claude on the owner's Mac)

Written 13 November 2026 by the cloud session that made *Jack the Ripper (a killer is loose)*, at the owner's
request ("make a prompt to give my local Claude on my Mac, to start the next video"). Paste everything under the
line into a new session started in this repository, with the song attached.

---

You are making an animated music video for the song I attach, for Johansson Animation Studios. A first film was
made this way on 12 to 13 November 2026 and its whole pipeline is in this repository under
`films/jack-the-ripper/`. Read `films/jack-the-ripper/README.md` first (my notes in my own words, and what was built
for each), then `blender/film.py`, `blender/cloak.py`, `blender/face_rig.py`, `blender/lipsync.py`, `blender/stage.py`
and `remotion/src/Film.tsx`. Reuse that pipeline; start the new film in its own folder `films/<song-name>/` by copying
it, not by editing the Jack the Ripper film. Read `ANIMATION_DIRECTION.md` and follow the handover rules in `AGENTS.md`.

## The tools, and what each is for

- **Meshy** (the `meshy-3d-generation` skill): characters, set pieces, skeletons and stock clips. Sign in once with
  the device flow and keep going.
- **Blender**: the set, face rigs, the photography of every shot, cloth.
- **Remotion**: the edit: studio card, cuts and zooms, haze, rain, lettering, sound.
- A speech model (`faster-whisper`, `small.en`) to get each sung word's start and end from the recording.

## Before anything is built, in this order

1. **Read the song.** Pull the embedded lyrics and their times if the file has them; run the speech model for
   word times; find the beats (librosa). Tell me the lyrics, the sections with their times and the theme as you
   read it, and wait for me to correct you.
2. **Ask me who the star is.** In the first film I had to say it late ("she is the star, Jack the Ripper and
   London is the backdrop"). Ask at the start: who do we watch, who sings, what is backdrop.
3. **Make a storyboard and show me before any long render**: one or two quick frames for every line of the song,
   with the lyric, what we see and the camera. Each picture should show what its line says. Wait for "proceed".
4. Then build, measure, render, and show me a cut. Expect several rounds of notes.

## What I asked for last time, so do it from the start

- The singer's face is rigged and lip-synced to the sung words; the mouth is simple and reads clearly; a singer's
  mouth opens wider than a speaker's.
- The star is shot from dramatic angles (low, close, high crane, extreme close-up) with real stage light: key,
  a cool edge light from behind, footlights.
- Every picture fits the words being sung.
- Fog is one even haze by distance, never painted clouds; more of it where figures meet buildings.
- Ordinary people walk through the place. Some join the main dance.
- Dance is funny, absurd and elegantly animated: pose to pose, each pose on the beat, hands and head arriving late.
- A villain's face can be hidden; say so if the song wants it.
- Animate my studio logo as the opening card (`films/jack-the-ripper/remotion/public/logo.png`, `Intro.tsx`).
- Sound that the words name (a scream on "scream") is worth adding.
- I say "Disney quality" and "professional". Audit yourself and decide when it is acceptable; tell me plainly
  where it falls short.

## What went wrong, and the rule each fault left behind

1. **Meshy's rigs are body only** (24 bones, no face, no fingers). Build the face in Blender: see `face_rig.py`
   (jaw, wide, pucker as shape keys on the painted head; a dark oval mouth interior let down like a blind; eyelids).
   Run it once on a fresh cast file: removing a mesh's Basis shape key while others remain bends the face for good.
2. **Meshy refuses to rig a sculpt over 380,000 triangles.** Remesh to about 90,000 first.
3. **Meshy takes only a few queued jobs at once.** Submit animations one after another, not twenty in parallel.
4. **Generated lettering is gibberish.** Ask for blank signboards and letter them in Blender.
5. **Do not generate a character with a cloak, cape or long skirt fused to the body.** It is skinned to the limbs,
   stretches and passes through the legs. Generate the body bare of it and make the cloth separately: `cloak.py`
   is a small cloth simulation (points, threads, round-ended rods for the body) baked once per shot.
6. **Stock clips lie in close-up.** Meshy's "idle" looks away over its shoulder. For anyone the camera is close
   on, pose a stance by hand and add gestures (`polly()` in `film.py`). Most stock loops do not close: lead the
   end of a loop back into its first pose.
7. **Walk at the clip's own measured speed** (`Actor.speed`), or feet slide. Put heavy steps on the beat (`stalk`).
8. **Measure before rendering.** `film.py --pass qc` walks every shot without rendering and reports sliding feet,
   feet under the floor, joints that jump, actors in each other, and **every joint against every prop**. The first
   film had 64 cases of people walking through walls and lamps that I saw before the maker did. Lay the street
   wide, print where the walls are, and get the count to zero before the long render.
9. **Shadows:** a shadow catcher also records the shade the set already throws, which lays a dark square under
   every figure. In the cast's pass let the set hide the cast but throw no shadow, and give each foot a soft patch
   of shade so nobody floats.
10. **Cards are not volumes.** A fog card or a light-beam card that passes near the lens is a grey slab across the
    picture. Haze the plate from its depth in the compositor; do not draw a beam that passes within a few metres
    of the camera.
11. **Check every camera against the set's edges** (sky plane, masking) with a preview frame.

## How the first film was photographed, and what to change on the Mac

The cloud machine had four processor cores and no graphics card, so it rendered each shot as two layers (a still
plate of the set, and the cast alone on transparent film, cropped to where they stand), at 720p with most shots at
12 pictures a second, and Remotion laid them together. A frame took 4 to 15 seconds and a cut took hours.

On the Mac (Apple silicon, Blender on the path) **try the simple way first**: render whole frames, the camera free
to move inside the shot, at 1920 x 1080 and 24 pictures a second, with Cycles on the Metal device or EEVEE. Time
one frame of the heaviest shot and work out the whole film's render time before choosing. Keep the two-layer
method only if whole frames are too slow. Either way keep these: one clock (the song's seconds); `pose(shot, t)`
alone decides a picture, so any frame renders the same alone or in sequence; every long render is resumable;
simulations are baked once per shot.

Look at moving pictures, not only stills: on the Mac you can open the draft. The cloud session could only inspect
contact sheets, and I caught faults in motion that it could not see.

## Housekeeping

- Work on a branch; commit sources as you go; never publish to `main` without my word.
- My song, the rendered film and Meshy's model files stay out of the repository unless I say otherwise (the site
  is public). Keep the Meshy files somewhere durable on the Mac and write down where.
- Keep the film's own `README.md` as its handover: my requests in my words, what was built, what was checked and
  how, what is not done.
- Tell me what each Meshy and other paid step costs as you go.

Start by reading the song and telling me what you hear in it.
