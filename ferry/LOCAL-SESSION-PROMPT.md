# Prompt for a local session on the Mac

Paste everything between the two lines into a new local Claude Code session started in the folder of the
`nj22az.github.io` repository (or in an empty folder: it says what to do then).

---

You are taking over work on the Chisum, the ferry at `/ferry/` of my website (repository `nj22az/nj22az.github.io`), from a
cloud session. Everything it did is pushed to GitHub. Get it, check that it builds here, then carry on. Work locally; I am
on my Mac and can look at the result on a real screen, which the cloud session could not.

**1. Get the work.**
- If this folder is not a clone of `https://github.com/nj22az/nj22az.github.io`, clone it and work in the clone.
- `git fetch origin` and check out the branch `claude/festive-rubin-fo8mmp` (create it tracking `origin/claude/festive-rubin-fo8mmp`
  if it is not here). If there are local changes or the local branch has commits the remote does not, stop and tell me
  what they are before doing anything: do not discard or overwrite them.
- Do not touch `main` and do not publish. I publish with the words "Publish now", nothing else counts.

**2. Read before anything else**, in this order: `HANDOVER.md` (the first two notes: the handover to this session, and
the one under it), `CLAUDE.md` and `AGENTS.md` (their rules hold: read the handover first, update it before you finish),
`ferry/PLAN.md`, and the yard's four standards in `ferry/yard/standards/` (JSY-STD-401 stairs, 402 nothing hangs in the
air, 403 no z-fighting, 404 detail). `ferry/README.md` says how she is built and checked.

**3. Make sure it works here.** You need Blender 4.0 or later callable as `blender` (on a Mac it may be
`/Applications/Blender.app/Contents/MacOS/Blender`: put it on the path or tell me), Python 3 with `numpy` and `Pillow`,
and Node with Playwright and its Chromium. Tell me plainly what is missing instead of working round it. Then:
- `ferry/blender/make.sh /tmp/chisum.npz /tmp/chisum.blend` must end with "built: every check passed".
- Serve the repository root on port 8765 (`python3 -m http.server 8765`) and run the six page checks **one at a time**:
  `node ferry/checks/bridge.cjs`, then `doors`, `stairs`, `travel`, `zoom`, `offline`. Report each result as it is.
- Open `http://localhost:8765/ferry/` in a real browser, walk aboard to the bridge deck, and tell me what you see, or ask
  me to look.

**4. Then continue, in this order** (the handover gives the detail and my own words for each):
1. **Make the bridge look real.** My verdict on the last step was "It still looks like Lego create a realistic bridge".
   `ferry/look.js` (surfaces and contact shade) is wired in but was chosen blind: tune it on this Mac's real graphics
   card first. Then a real bridge's colours and materials, light inside the wheelhouse, real shapes for the console,
   chairs, deckhead and window frames. Use Meshy for what is sculpted, starting with the products in the cooler; spend
   its credits freely. Use the highest quality you can; there are no triangle budgets.
2. The coffee jug fills and empties: "a transparent coffe can we can animate with coffee".
3. Every lever, knob, switch and handle on the bridge works.
4. Every cabinet opens; the electric cabinets have their real insides; the wiring is accurate and drawn in CAD with parts
   lists; the installation is functional; an X-ray view shows the wiring. Her mains are 690/440/230 V.
5. The car deck's ventilation (designed in the handover, not built) and the car deck drawn in CAD.

Only the Chisum. Johansson World and Sakura World are paused; what is learned here is used there later.

**5. How to work.**
- Show me pictures from the real page often, and say honestly what was and was not checked. I judge the looks.
- Every change goes through the gate before it is called done: `make.sh`, then the page checks one at a time.
- Commit to `claude/festive-rubin-fo8mmp` as you go. You can work without a connection; when there is one, push the
  branch (Meshy and pushing are the only things that need the network).
- Before you stop, update `HANDOVER.md` with what changed, what was checked, what is left.

Start with steps 1 to 3 and tell me where things stand.

---
