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

- **The song and the studio mark** are the owner's own.
- **Meshy** made the models under the owner's Meshy account (11 models, 4 rigs, 26 clips; the balance went from 2,353
  to about 1,900 credits). The GLB files are large and are **not in the repository**: they are in the owner's Meshy
  workspace (project `jack-mv`, 12 November 2026) and can be downloaded again from there.
- **Fonts**: Pirata One, IM Fell English (SIL Open Font License, through `@fontsource`); DejaVu Serif on the pub sign.
- **Remotion** is free for individuals and small teams; a company of more than three people needs its licence.
- The pub's name, The Black Lantern, is invented. The clock tower and the dome are generic London silhouettes.

## State

*13 November 2026, 01:40 UTC: the first complete cut exists.* 2 min 15 s (the studio card 4.75 s, then the song),
1280 x 720, 24 pictures a second, H.264 with AAC; 3,233 pictures encoded. It was delivered to the owner from the cloud
session as a file; **the film and the song are not in the repository** (the site is public: the owner decides).
Photographed: 21 plates and 1,296 cast frames, none failed; `blender/shadows.py` run on all of them.

*Checked:* a contact sheet of the whole film (40 pictures), four full pictures, and a strip of 24 consecutive pictures
of the chorus dance, looked at; one Jack throughout, his face under mist in every picture seen; the lyric lettering on
its lines; sound measured on the encoded file at -14.6 LUFS integrated. *Not checked:* the film was not watched
moving (the session can only look at stills); feet against the street over whole shots; true peak.

*Known limits, said to the owner:* 720p and the cast on twos (a four-core machine without a graphics card);
nobody's mouth moves (Meshy's skeletons have no face bones); the contact shadows are faint after the clean-up;
clips from Meshy's library are used as they came in the verses.

*Not yet answered by the owner:* whether the film may be committed or published anywhere.
