# Halloween stickers

The Pocket Camera's Halloween sheet (`../halloween.json`, kind `season`, under the Season tab): the things of the
children's Halloween walk on Sakura Street, 1997 (`johansson-town/src/world/halloween.js`), modelled and rendered in
Blender in World's chunky-toy look and colours, so the town and the camera show the same things.

| Sticker | What it is | Who it is for |
|---|---|---|
| `pumpkin-lantern` | World's paper pumpkin lantern: six orange paper lobes, a dark cap, a green stem, the face cut and lit from inside | the lanterns strung along Sakura Shōten's frontage for the walk |
| `jack-o-lantern` | World's plastic jack-o'-lantern: closed, seven ribs, the stem on top, its carved face glowing | the ones ringed round Sakura's drinks machine and on the crates |
| `obake` | World's plush obake: round head, flared body, scalloped hem, little arms, bead eyes, pink cheeks, a small smile | the plush ghost peeking from the top of the machine |
| `witch-hat` | the costume witch hat: black felt cone, purple band, wide brim | a child dressed as a witch (a hat: placed on the face) |
| `cat-ears` | a black cat-ear headband: felt ears with pink insides on a thin black band (new) | a child on the walk (a hat) |
| `pumpkin-cap` | the pumpkin suit's stem cap: a fluted green stem, a leaf and a curl of tendril | Tetsuo and the children in pumpkin suits (a hat) |
| `paper-bat` | a bat cut from black card, creased down the middle, white dot eyes | hung between the lanterns; World's catalogue `halloween-paper-bat`, the same builder |
| `sweets` | twist-wrapped boiled sweets in orange, grape purple, melon green and white, tipped out in a mound | what the children collect; World's catalogue `halloween-sweets`, the same builder and the same places |

The three hats are rendered front-on, as on a person facing the camera at eye level at arm's length, and carry `hat`:
`crown` is where the top centre of the wearer's head lands (fractions of the sticker's width and height) and `width`
the wearer's head width, temple to temple, as a fraction of the sticker's width (more than 1 when the head is wider
than the sticker, as under the small pumpkin stem). Both are measured in the render from the town's adult head, not
guessed.

Rebuild (Python with Blender as a module, `pip install bpy`, and Pillow, NumPy and SciPy):

```bash
python3 tools/blender/render-halloween-stickers.py            # all eight: render, cut, write these files
python3 tools/blender/render-halloween-stickers.py --only obake --work /tmp/halloween   # one, then cut all
python3 tools/blender/render-halloween-stickers.py --finish-only --work /tmp/halloween  # cut again from the renders
```

The bat and the sweets come from World's builders
(`johansson-town/assets/catalog/halloween-{paper-bat,sweets}/source/build-halloween-*.py`); the sweets sticker reads the
mound's places from that builder's `build-report.json`, so rebuild the sweets there first if they change. Renders are
Cycles with a Freestyle ink line, so a rebuild is close to, not byte-identical with, these files: commit what it makes.
