# Detail by place: the ship drawn in full where one is, and lightly elsewhere

Johansson Shipyard · design record · revision 0 · 12 November 2026 · newbuilding No. 1, the Chisum · **a proposal: nothing of
it is built**

The owner, 12 November 2026, standing at the stern door on a tablet: "I see your quality reverting , we don't have any budget
on the meshes , we need as high fidelity quality as possible and textures , I think each deck doesn't need to load the whole
ship ? So for instance when you are at the bridge the interior is the focus on high fidelity , can the 3d viewer you made be
programmed to be selective depending on where we are ? Dynamically I don't want to adjust settings manually".

The answer is yes. This is how.

## 1. What she is today

- **One file**, `ferry/data/ferry.bin.gz`: about 22 MB, 3.3 million triangles in some 650 meshes, in eight parts by deck. The
  page fetches all of it, keeps all of it in memory and draws all of it, wherever one stands. The traced light is a second
  file of 5.8 MB.
- **One grid for every corner.** Each corner is kept in 65,535 steps across the whole ship: 1.9 mm along her length. Lettering
  on a fore-and-aft face lost its uprights by it; since 12 November small parts may be built `fine`, in a box of their own
  (README, *The file format*). That is a patch on one grid for a whole ship.
- **No pictures of surfaces.** Paint, deck coating and steel are colours with a computed grain (`look.js`); the only pictures
  are the signs and screens on her one sheet.
- So every triangle added on the bridge is paid for by whoever stands at the stern door, and the other way round. That is a
  budget, whatever the standard says (JSY-STD-404, rule 1: "There is no triangle budget").

## 2. What is proposed

**The ship is kept by place.** One light file of her as she is seen from outside and from afar, and one file for the fit-out
of each of her spaces. The page fetches and draws a space in full when one is in it or near it, and lets it go again
afterwards, by itself.

| | What | In it |
|---|---|---|
| **The shell** | `ferry.bin.gz`, as now, smaller | Her hull, decks, bulkheads, casings, stairs, doors and ramp: the steel one walks on and between, and everything seen from outside. It is always there, so one can walk anywhere at once and nothing is ever missing underfoot |
| **A space's fit-out** | `spaces/<id>.bin.gz`, one for each of the 133 spaces of the general arrangement that has any | Everything that stands in that space and is not her steel: consoles, instruments, lettering, machinery, pipes, cables, furniture, lamps. With a box of its own for its corners: a room 10 m long is kept to 0.15 mm, so `fine` is no longer needed there |
| **The list** | in the shell's header | For each space: its box, its file, its size, and which spaces it opens onto (her doorways are in the file already) |
| **Pictures of surfaces** | `textures/<name>.webp`, shared by the whole ship | Small pictures that repeat (painted steel, deck coating, non-slip plate, wood, rubber, insulation), each with its relief and its gloss. A space names the ones it needs |

**How a part finds its space.** The builders do not change. `assemble.py` puts each part into the space whose box it stands
in (the boxes are `ga.py`'s, which the page already lists); what stands in none, or is her steel, stays in the shell. A part
may name its space where the box would guess wrong.

## 3. What the page does, by itself

- **From outside** (the first view, the cut, the exploded decks): the shell only. Nothing of any interior is fetched until one
  goes aboard.
- **On foot:** the space one stands in is fetched first and drawn as soon as it has come; then the spaces it opens onto, nearest
  first; then nothing more. A space further than two doorways away is let go when memory is wanted, oldest first.
- **Drawn:** the shell, the space one is in, and the spaces seen through its open doors and windows. Not the rest, even if it
  is in memory.
- **Sharpness follows the device, not a setting.** The page measures how long a picture takes. If it is too long it first draws
  fewer points of the screen, then drops the far spaces; it never thins the space one stands in. When there is time to spare
  it goes back up. The *On this device* button stays, to say what it chose and why.
- **Nothing is waited for.** The floor and the walls are the shell's, so one walks on at once; the fit-out of the next room
  arrives while one crosses the doorway.

## 4. What it buys, in her own numbers

The bridge deck's part is 557,000 of her 3.3 million triangles; the hull's part 273,000. A tablet on the bridge would draw the
shell and the bridge, not the other 2.5 million. **How large the shell itself comes out is not known until the split is made**
(her decks' steel and their fit-out are not counted apart today); as a first estimate, a half to a third of what is drawn now.
So the bridge can be drawn two or three times as finely before the tablet pays what it pays today, and the stern door, the pump
room and the switchboard room each likewise, without any of them paying for the others.

## 5. What it costs, said plainly

- **The file's format changes** (a list of spaces; a file a space), and with it `assemble.py`, `check.py`, the page's loader,
  the offline store (which keeps one file today) and the watermark's reader. Her mark goes into every file.
- **Every page check walks her**, and would have to wait for a space's fit-out before it looks at it. The checks get one new
  call for that, and one new check: that every space's file is fetched when one enters and let go later.
- **Seams.** The shell is kept on the ship's grid and a space on its own: what stands on a deck must be let into it or stand
  clear of it by more than the deck can be out of place (as fine work is now).
- **What moves across spaces** (a door, the ramp) stays in the shell.
- **Pictures of surfaces are new work**: each has to be made, and looked at on the tablet.
- It is several days' work, in this order, each step leaving her whole: (1) the files by space and the loader, with nothing
  looking different; (2) fetching and letting go by place; (3) sharpness by measured time; (4) pictures of surfaces; (5) each
  space drawn again to the standard, one at a time, starting where the owner is looking.

## 6. Open, for the owner

- **Which space first.** The stern door and its ramp, where this was said? The bridge?
- **How much may be kept on the tablet for use without a connection**: all of her (as now, and larger), or the spaces one has
  been in.
