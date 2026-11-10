# Minato Maru: the ferry work, kept here for the week (from 9 November 2026)

The owner, 9 November 2026: *"Work on nj22az.github.io for now make a temp folder there , I want to focus on getting
the ferry ready"*, after *"Work on the cloud and online for now and we bring it back local in the weekend"*.

**What this folder is.** The ferry is part of Johansson Town, which lives in its own repository
(`nj22az/johansson-town`). The cloud session doing this work can read that repository but cannot push to it. So the
work is kept here, online, until it is brought back into the Town at the weekend.

- **Temporary.** It lives on branch `claude/festive-rubin-fo8mmp` of this repository only. Do not merge it into this
  repository's `main`: it is Town work, and it would add 18 MB to the Office.
- **Delete it** once the work is in the Town.

## What is in it

| Path | What |
|---|---|
| `town/` | Every file the work changes or adds in the Town, at the Town's own paths |
| `BASE` | The Town commit the work is built on (`main` on 9 November) |
| `COMMITS` | The Town commits the files come from |
| `DELETED` | Town files the work removes (one path a line) |
| `save.sh` | Town checkout → this folder |
| `bring-back.sh` | This folder → a branch in the Town |

## The Christina (from 9 November 2026)

The owner, 9 November 2026: *"I want a ferry viewer on my website"*, *"I think you should call this ship the Christina ,
it's not the same as Minato Maru"*, *"We can rebuild Minato maru later from what we learn from building this ship"*,
*"Don't replace the ferry in Johansson world yet"*.

- The viewer is on the Office's `main` and live: <https://nj22az.github.io/ferry/> (page, format, known limits and
  checks: [`/ferry/README.md`](../../ferry/README.md)). She is also one of the projects on the homepage.
- Its data is written by two Town tools kept here: `town/tools/ferry-viewer-export.mjs` and
  `town/tools/ferry-viewer-export.page.js` (Town commit `f0b2973`). They change nothing under the Town's `src/`: the
  Christina's name is painted by the export alone, and the ferry in the live Johansson World is untouched.
- **Her own build has begun: her hull is her own since 10 November** (the owner: "Proceed"). It is built in Blender by
  the Office's own tools (`/ferry/blender/`, not Town files: nothing of it is in this folder), over the Rev C lines, so
  the Minato Maru's decks still sit on her; the rest of her is still drawn from the Minato Maru's model. The sections
  that follow: the exterior above the hull, the car deck, the engine room, the bridge, the accommodation. The Minato
  Maru is rebuilt later from what she teaches; until the owner says so, nothing here replaces her.
- **Found while fitting the Minato Maru's machinery spaces into her shell, and to be put right in the Town at the
  weekend** (it is so in the game too, and it is not in the Rev C issue list, whose audit does not test rooms against
  the hull): the engine room's ladder trunk comes down through the hull's bottom under the port counter (by up to
  1.03 m at 6.4 m from the transom), and the after corners of the engine room's tank top and side walls stand up to
  0.3 m out through the bilge at 8.5 m, where the hull has begun to rise. The viewer's data moves those points inside
  her plating (`/ferry/blender/assemble.py`, `fit_inside`); the Town's `src/` is not changed.
- **A third, found while running her shafts:** the Minato Maru's propeller shafts are drawn only outside the hull
  (`ferry-model.js`, from 7.5 m to the screws at x ±1.6), on a line 0.36 m below the gearboxes' output flanges
  (x ±1.55, 1.5 m above the keel) and 5 cm outboard of them, and nothing joins the two: the engines drive nothing. The
  Christina's run straight from the flanges to the screws at 6° (`/ferry/blender/spec.py`).
- **Four more, found on foot** (10 November 2026, when the viewer learned to walk; all in the Town's drawing, none in
  the Rev C list):
  - The lobby's floor covering on the passenger deck is one slab from side to side (x -4.02 to 4.02, 6.04 to 9.46 m
    from the transom, 6.503 to 6.508 m up) and lies over both stairwells from the car deck; the deck plating under it
    is cut correctly. From the lobby the stairs cannot be seen, and one climbs up through the floor. The viewer's
    data cuts the covering back to the wells (`/ferry/blender/assemble.py`, `OPENINGS`).
  - The car deck is drawn from above only: there is nothing under its plating over the steering-gear room, the
    fresh-water tanks, the shaft space, the void, the thruster room and the fore peak, so from those spaces one looks
    up through it. The Christina's hull build gives it an underside there (`/ferry/blender/hull_structure.py`).
  - The crew stair from the saloon to the wheelhouse has 1.55 m of headroom over its fourth tread, under the edge of
    the opening in the deckhead (the opening begins 5 cm aft of that tread). The bar across its top is drawn closed.
  - The two outside stairs to the bridge wings leave 6 cm between the top tread (ending 19.42 m from the transom) and
    the landing (beginning 19.48 m).
- The viewer's files (`/ferry/`, the homepage card) go to `main` on their own: they are committed apart from this
  folder and cherry-picked onto a branch made from `main`. To build her data again no Town checkout is needed:
  `/ferry/blender/assemble.py` works from the viewer's own file. A new export from the Town (`town/tools/`) is needed
  only when the Minato Maru's part of her changes; give it to `assemble.py --base`.

To read the work on GitHub, start at:
- `town/docs/minato-maru/rev-c/README.md`: the working drawings, Rev C, sheets JS-127-C1 to C8
- `town/docs/minato-maru/rev-c/ISSUES.md`: the issue list the sheets mark
- `town/briefs/HANDOFF-FERRY-CAD-REV-C-2026-11-09.md`: the handover, with what is fixed and what is left

## Bringing it back at the weekend

From a clone of this repository, with this branch checked out, and a clone of the Town beside it:

```sh
sh temp/minato-maru/bring-back.sh /path/to/johansson-town
```

It makes the branch `claude/minato-maru` in the Town, starting at `BASE`, and commits the files of `town/` on it. Then,
in the Town:

```sh
npm run build:runtime                          # the game runs from runtime/, which is not kept here
node --test tests/runtime-package.test.mjs
node tools/ci-guard.mjs
```

Merge the branch into the Town's `main` when the guard is green and the ferry has been looked at in a browser.

- **The built game is not here.** `runtime/` is 56 MB built from `src/`, so only the source is kept. Until
  `npm run build:runtime` has run in the Town, the fixes are in the source but not in the game.
- **The branch starts at `BASE`, not at today's `main`.** Merging it is an ordinary merge: nothing changed on the
  Town's `main` since is overwritten.

## Continuing in a cloud session

1. Clone the Town (read access is enough) and check out `BASE`.
2. Run `sh temp/minato-maru/bring-back.sh /path/to/johansson-town` to get the work as a branch.
3. Work and commit in the Town clone: the tools and tests run there.
4. Run `sh temp/minato-maru/save.sh /path/to/johansson-town`, then commit and push this repository's branch.

## Checked

- 9 November: after the export's deckhead rule was committed in the Town (`f0b2973`: the deckhead over the machinery
  spaces goes to the car deck, so the machinery rooms open from above), `save.sh` saved 50 files; the two tools here
  are byte-identical (`cmp`) to the ones that wrote the `ferry/data/` now on `main`, whose header names `f0b2973`.
- 9 November: `bring-back.sh` into a fresh worktree of the Town at `BASE` gave a tree identical to the Town branch it
  was saved from (`git diff` empty).
