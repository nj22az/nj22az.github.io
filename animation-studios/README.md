# Johansson Animation Studios: Dock Walk

`/animation-studios/`: the sailor from the studio seal strolls along a quay, whistling. One seamless 30-second loop,
1920 × 1080, 24 frames a second, black ink on white, with an original whistled tune, his footsteps and the water.

The owner's brief (11 November 2026), in order: "draw this character in pixels exactly this character and art style
and make an animation of him walking at the docks"; "increase resolution so it looks more hand drawn"; "Raise even
more"; "It needs to look like my drawings"; "He should stroll normally"; "Animate him his face and arms , whistling
walking on a repeating dock"; "Improve the animation , think fleisher and Disney early cartoons"; "Now it looks like he is
jumping he should walk with a stride"; "his neck needs to attach to the body and the air should be white too"; "you
have many images of Johansson , you can use it to see how he looks in many images". So this is no longer pixel art: it
is the owner's own ink line at full HD.

**Standing rules from those words:** he walks with a long, level stride and never hops (a double-bounce walk was tried
and rejected); his head is always joined to his body by a neck; the air is pure white, with no film tint, vignette or
flicker; and the other drawings of him on the sheets are the reference for how he looks.

## How it is made

| File | What it does |
|---|---|
| `art/reference/character-sheet-actions.png` | The owner's character sheet. The puppet is cut from its walk pose (second row, third drawing). |
| `tools/cut_parts.py` | Cuts head, torso, sleeve, forearm with fist, raised arm and both boots out of that drawing (`art/parts/`), and makes the whistling and blinking faces by redrawing only the mouth and the eye on the same head. |
| `tools/sailor.py` | The walk: 36 frames, two steps of 132 sheet pixels (the sheet's own walk drawing steps 147). Boots are pinned to the quay while they are down (no sliding). The arm bends at the elbow under the sleeve's hem, and the forearm follows the sleeve late. The trouser legs, seat and neck are the only parts drawn by the program, as rubber hoses in the sheet's line weight. |
| `tools/docks.py` | The docks: sky, bay (headland, steamer, lighthouse), harbour (fishing boat, piles and gull, rowing boat, buoy) and quay (bollards, crates, lamps, barrels, rope, the seal's anchor and propeller, lifebuoy, fish boxes). The things on the quay are their own layer and spring a little on each beat; the sun has a face and pumps its rays. |
| `tools/tune.py` | The tune (written for this film), a tuba on the beat and a banjo off it, the timing of his lips, and the procedural sound. |
| `tools/film.py` | Puts it together. `render_at(n)` gives frame n whatever was drawn before. |

```bash
python3 animation-studios/tools/cut_parts.py     # only after changing a cut
python3 animation-studios/tools/film.py          # dock-walk.mp4, dock-walk-poster.png, walk-cycle.png (about 1 minute)
python3 animation-studios/tools/film.py --still 120 /tmp/frame.png
```

Needs Python 3 with Pillow and NumPy, and `ffmpeg`.

## Checked on 11 November 2026

- Frame 720 is identical to frame 0 (`render_at`), so the loop has no seam; the step from frame 719 to 0 is the same
  size as from 0 to 1.
- 720 video frames, 30.000 s, H.264 with AAC; sound measured on the encoded file: -13.7 LUFS integrated, peak -3.1 dBFS.
- Looked at: the 36-frame cycle sheet, twelve consecutive film frames through a heel strike, and six frames across the loop.

## Not checked, and known limits

- **Nobody has listened to the sound or watched it move**: it was made in a session that can only look at still frames.
  The tune, the balance of whistle, steps and water, and the feel of the walk need the owner's eye and ear.
- Both arms are the one hanging-arm drawing, in two pieces. The raised-fist arm is cut (`arm_far`) but not used.
- Only the walk drawing of the action sheet is used as artwork. The other poses and sheets were read for his
  proportions and stride but nothing is cut from them yet.
- The boot changes from the flat drawing to the toe-up drawing for the two frames round each heel strike.
- The page is not in the site navigation or the sitemap. It was opened in Chromium at 1280 and 390 px wide: the film plays, nothing overflows, no script errors. Not tried on a real phone.
