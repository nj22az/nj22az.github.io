# Repository split: Johansson World, Johansson Studio and Sjöskolan

**Final plan, revised 11 October 2026 after two reviews.** Sources:
- the four maps in this folder (`map-world.md`, `map-studio.md`, `map-sjoskolan.md`, `map-mainsite.md`);
- the three candidate plans, called "safe", "clean" and "history" below;
- two reviews of the previous version: 30 findings, all checked against the files. Appendix A lists each one, where it is fixed, and the six proposed sub-fixes that were not taken, with reasons;
- read-only checks made today:
  - the local work branch is at 814fb9da, 11 commits ahead of and 22 behind origin's 28a58be7, with 69 uncommitted paths;
  - `origin/main` is at 1ef6b7db;
  - also checked: the live site, the session list, the 180 remote branches, the open pull requests and the Actions history.

Nothing was changed. Line numbers are today's. In-flight work moves some of them, so each edit also names the text to look for.

---

## The creator's steps (plain words)

Claude does everything else, checks each step before the next, and tells you when a sitting is due. This is about 1½ hours in all, spread over two weeks.

**Now (about 15 minutes)**
1. Answer the questions in §4 in one reply ("defaults are fine", or name the changes). Two matter most:
   - Do you open World or Studio from an iPad Home Screen icon?
   - What are `nj22az/JT`, `nj22az/book` and `nj22az/v41`?
2. Paste the hand-over message (§8) into each Claude session on Claude's list, and tell Codex. Claude cannot message those sessions itself.

**Sitting 1 (about 20 minutes, before Claude's rehearsal)**
3. Make three empty public repositories at https://github.com/new:
   - owner `nj22az`;
   - names `johansson-world`, `johansson-studio` and `sjoskolan`;
   - "Public";
   - leave README, .gitignore and licence **unticked** (a README would block Claude's first push).

   Make `sjoskolan` outside lesson hours.
4. Let Claude reach them: https://github.com/settings/installations → Claude → Configure → Repository access → add the three.
5. Switch Pages on for World and Studio only. In https://github.com/nj22az/johansson-world/settings/pages and https://github.com/nj22az/johansson-studio/settings/pages, set Build and deployment → Source to **GitHub Actions**. Nothing appears until Claude publishes. Do not do this for `sjoskolan` yet.
6. Add the teacher password as a secret: https://github.com/nj22az/sjoskolan/settings/secrets/actions → New repository secret → name `LARARLOSEN`.
7. Only if you use Home Screen icons: Claude sends two test links.
   1. On the iPad in Safari, add each test page to the Home Screen.
   2. Open each icon and tap "Go to the next page".
   3. Tell Claude what the next page shows, and whether it opened inside the icon or in a Safari sheet. This takes about 5 minutes.
8. Pick T0: a 3-hour window in which nobody needs a World or Studio update. The default is the first evening after Claude's rehearsal is green.

**At T0 (nothing, unless Claude asks)**
9. If Claude cannot switch off the old publishing itself, go to https://github.com/nj22az/nj22az.github.io/actions/workflows/johansson-town-live.yml → "…" → Disable workflow.
10. From T0, do not use Town Studio's "Publish to World" on the Mac until Claude says jojo is updated and you have done step 16.

**Sitting 2 (about 20 minutes, the day World and Studio first go live at their new addresses)**
11. Back up first, where you usually play (in Safari or in your icon), and keep the files in Files:
    - World: players menu → "Export save file";
    - Studio: Edit character → "Download design", then Build scene → "Download project".
12. Check the new addresses and tell Claude anything odd:
    - https://nj22az.github.io/johansson-world/: Continue shows your game; visit the stockroom and the motor bench.
    - https://nj22az.github.io/johansson-studio/: your character and scene are there; build a scene and export a picture.
13. The unpublish test, when Claude asks, with Claude watching (about 5 minutes):
    1. Open https://github.com/nj22az/johansson-studio/settings/pages and choose "Unpublish site".
    2. Claude checks the address and republishes Studio.
    3. If needed, rename the repository and back, as Claude asks.

    This tells us how to undo Sjöskolan's move in an emergency.
14. Only if you use icons: open the test icon once more after Claude's change, and say what it shows.
15. Say "switch". Claude switches the old addresses within 48 hours of the new ones going live. Until then, nobody changes how saves, characters or scenes are stored.

**When Claude says jojo is updated (about 5 minutes, around sitting 2)**
16. On the Mac, in the folder that holds `jojo`, run `git clone https://github.com/nj22az/johansson-world` so that Town Studio finds World. Point Codex at the new repositories.

**After the switch (about 5 minutes)**
17. Open World and Studio the way you always do (icon or bookmark). You should land on the new addresses with your saves.
18. Optional: in Shopify, change the book's link to https://nj22az.github.io/sjoskolan/elteknik/. Or let Claude do it with your OK.

**The Sjöskolan hour (about 15 minutes; default Saturday 17 October, evening)**
19. When Claude says the publish run is waiting, go to https://github.com/nj22az/sjoskolan/settings/pages and set Source to **GitHub Actions**.
20. Unlock one teacher page with the password, and say whether it opens.

**Only in an emergency**
21. If GitHub Actions stops running (as on 7–8 October), go to https://github.com/nj22az/sjoskolan/settings/pages and set Source to "Deploy from a branch", branch `site`, folder `/ (root)`, then Save. Switch back to "GitHub Actions" when Claude says.

---

## 0. The plan on one page

| Repository | Address | Contents |
|---|---|---|
| `nj22az/johansson-world` (new) | `/johansson-world/` | Today's `johansson-town/` at the repo root, plus `thuans-storage/` and `motor-90l/`, because their code imports World |
| `nj22az/johansson-studio` (new) | `/johansson-studio/` | Today's `avatar-creator/` at the root. When it publishes, it adds a pinned copy of World under `world/` |
| `nj22az/sjoskolan` (new) | `/sjoskolan/` (unchanged), `/sjoskolan/elteknik/`, `/sjoskolan/ellab/` | `sjoskolan/` kept as a subfolder, with `elteknik/` and `ellab/` beside it |
| `nj22az/nj22az.github.io` (stays) | `/` | Portfolio, blog, shop and Form 3D Studio, plus a forwarding page for every old address |

**Saved data survives without migration.** Every site stays on `https://nj22az.github.io`, and these keys are localStorage for the whole origin:
- World: `johansson-town-*` and `johansson-town:storage-*`;
- Studio: `nj-avatar-studio-v1`, `nj-studio-scene-v1` and `nj-studio-snap`;
- Sjöskolan: `sj-*` and `sjoskolan-*`.

No key depends on the path, and none is renamed. There are two exceptions:
- **A Home Screen icon keeps its own storage.** Steps 1.6 and 3.11 test it, and §6.7 handles it.
- **Old and new code briefly serve at the same time.** From step 3.6 until the switch, the old addresses still serve the code frozen at T0. Rule 12 freezes stored formats until then.

| Phase | What happens | Visible change | Undo |
|---|---|---|---|
| 0. Prepare | The runbook is made durable; every writer is listed and told; Sjöskolan's simulators get their own three.js; probes and iPad test pages go on main; tool fixes that work in both layouts land on the work branch | None | Revert |
| 1. Creator, sitting 1 | Repositories, access, Pages for World and Studio, the teacher secret, the iPad scope test | None | – |
| 2. Rehearse | World and Studio are copied onto `rehearsal` branches; every change is made and tested there; the kill switch is rehearsed | None | Copy again |
| 3. T0 (about 2–3 hours, then sitting 2) | Writers stop; one integrator merges; the old publishing is switched off; exact copies are made; the rehearsed changes are applied; World and Studio are published at their new addresses; jojo is repointed | New addresses appear; the old ones are untouched | Abort rule (step 3.10); unpublish or revert |
| 4. Switch (within 48 hours of Studio going live) | One main-site commit: forwarding pages, the kill switch, the 404 map, links | Old addresses forward | `git revert`, about 5 min |
| 5. Clean-up (14 days later) | Port check, then remove the frozen old files | None | Revert |
| 6. Sjöskolan (a lesson-free hour) | Copy, then days of CI; go live; the book and EL-LABB forward; main's copy is removed a week later | `/sjoskolan/` is served by the new repo at the same URLs | `site` branch, unpublish or rename; revert |
| 7. Tidy up | Documents, pull requests, an issue, stale workflows | None | – |

**The freeze on World and Studio** lasts from T0 until World is live at its new address. The target is 2 hours, with an abort at 4 hours (step 3.10). The rehearsal (Phase 2) is what keeps it short.

---

## 1. How the three candidates were judged

| Criterion | "safe" | "clean" | "history" |
|---|---|---|---|
| Live site and saves | Best order of work: new before old, frozen old files for 14 days, an iPad test, a Pages probe, tree-hash proofs | Good, but deletes the old folders at the switch with no grace period | Good read-back markers; but Studio imports World live from another site |
| Independence of the repos | Studio pins World and follows World's main on a timer | Strongest: Studio follows the *published* World, only after its own tests pass; dependencies run one way | Weakest: Studio loads World's raw `src/` across sites |
| Disk room in sessions | Snapshot copy | Snapshot copy | Filtered history: more to fetch |
| Creator's work | 4 repositories (one a throwaway probe), 3+ sittings | 3 repositories, export and import on the iPad | 3 repositories, 2 sittings |

**Backbone: "safe"**, which brings the phases, new-before-old, proved exact copies, frozen files, the iPad test and an undo for every step.

**Grafted from "clean":**
- Studio follows the published World, only after its tests pass, and opens an issue when it cannot.
- No module import crosses a repository boundary.
- Contract lists in each CLAUDE.md.
- The Studio MCP moves to Studio as a follow-up.
- Storage's and Motor's paths are made relative.
- World's worker skips Storage and Motor.
- The book's stylesheet is copied into the blog.

**Grafted from "history":**
- Studio's own address doubles as the Pages probe.
- Pages is switched on early.
- `version.json` and `publicerad.json` are read back to prove a deploy.
- The jojo variable scheme.

**Left out:**
- The filtered-history import, which needs more machinery and could carry old accidental secrets; it stays an option in §12.
- Live cross-site imports.
- A throwaway probe repository.
- A permanent redirect worker.

**Found in the first round of checks:**
1. **Storage loads its own files by absolute path** (`/thuans-storage/assets/…`, `/thuans-storage/vendor/three-r186/…`, `/thuans-storage/models/thuan.glb`). They must be made relative, and the bundle rebuilt (step 2.3).
2. **World's `npm test` needs Studio today.**
   - `tests/studio-mcp.test.mjs` serves `../avatar-creator`.
   - `tools/studio/tools.mjs:158` imports `../../../avatar-creator/scene-catalogue.mjs`.
   - `tools/studio/repo.mjs` takes the site root as its root.

   Fixed in steps 0.5 and 2.4.
3. **World's tests check git-ignore paths** of the Studio MCP, so World's `.gitignore` must carry them.
4. **World's `sw.js` would cache Storage and Motor** once they live under `/johansson-world/`, so it must skip them.
5. **Deploy jobs can wait until Pages is switched on**, so no run needs restarting.
6. **Live browser checks can run from a session.** Playwright goes through the proxy (`/root/.ccr/README.md`). Only Chromium is installed here; WebKit runs in Actions.
7. **World can already save to a file** ("Export save file" and "Import save file" in the players menu).
8. **The book needs only its metadata changed.** `elteknik/index.html` and `unlock.js` use relative `files/…` paths.
9. **The price script `/assets/js/shopify-book-price.js` stays on main**, as a contract.
10. **Sjöskolan's `week40.py` needs one exception** for the main-site icon (step 0.3).

---

## 2. Rules for every step

1. **New before old.** A new address is live and checked before any old address forwards to it.
2. **One reversible step at a time.** Each step has a check and an undo (§9).
3. **Exact copies first.** Each new repository starts with one import commit, proved identical to the source folders by git object ids. Changes follow as small commits.
4. **Tests gate every publish.** A red run publishes nothing, and the last good site stays up.
5. **Never rename these:**
   - a storage key;
   - the save game id `johansson-town`;
   - the `from=johansson-town` token;
   - the MCP name `johansson-town-audit`.
6. **Old files are frozen, not deleted, for 14 days after the switch.** Forwarding pages, the kill switch and the book's cover and sample chapter stay forever.
7. **Never merge the work branch `claude/sjoskolan-youtube-strategy-gofi3o` into main.** Carry branch-only changes over explicitly.
8. **Reserved names on main.** Main never holds a `johansson-world/` folder. It holds a `johansson-studio/` folder only for the probe files, until the switch. After step 6.7 it holds no `sjoskolan/` folder.
9. **No module import crosses a repository boundary at runtime.** What links the sites afterwards is:
   - links;
   - two iframes (`/stepbuddy/` and `/form-3d-studio/` in World's workshop);
   - the contract files (§3.4).
10. **Batches.** Never change the moving folders' code and the main site's forwarding pages in the same commit.
11. **One integrator, in a fresh worktree.** At T0 only Claude's split session merges and publishes.
    - It works in a fresh sparse worktree or a fresh session, never in a checkout other agents use.
    - Unfinished work goes to pushed `wip/…` branches, never only into a working tree.
12. **Format freeze from T0 until the switch is live.** No change in either new repository may add, remove or rename anything that a save, a character or a scene stores. That covers:
    - versions and recipe fields;
    - the ids in `PARTS`, `AGES` and `HEAD_FORMS`;
    - poses, faces, scene locations and storage keys.

    The reason: the old addresses still run T0's code, which resets what it does not know when it saves again. `avatar-creator/scene-model.mjs:17` empties a scene of any other version, and `src/avatars/recipe.js` `pick()` resets unknown ids. `tests/format-freeze.test.mjs` (§6.15) enforces the freeze, and it is deleted in step 4.5.
13. **A new repository opens to other writers only after its first green publish**, announced by Claude in main's CLAUDE.md and in `STATE.md`: World after step 3.6, Studio after step 3.7. Until then, other writers keep their work local, or as pull requests on the old repository.
14. **State is written down.** Every step appends one line to `STATE.md` on the branch `split/runbook` of the old repository:
    - the date and the step;
    - the commits;
    - probe results and decisions.

    A new session reads `STATE.md` first. Never write a secret in it.

---

## 3. What goes where

### 3.1 nj22az/johansson-world
- **Contents.** The repo root is `johansson-town/` exactly as at T0 (about 1,960 files, 238 MB), with `thuans-storage/` (14.8 MB) and `motor-90l/` (1 MB) as subfolders.
- **Added in commits A to D:**
  - `CLAUDE.md` (§10), and `AGENTS.md` pointing to it (Codex reads `AGENTS.md`);
  - `LICENSE.md` (a copy of the site's, with the World paragraphs using local links) and `THIRD_PARTY_NOTICES.md` (the World sections);
  - `.mcp.json`: `johansson-town-audit` → `tools/mcp/server.mjs`, and `johansson-studio` → `tools/studio/server.mjs` until the Studio MCP moves (§12);
  - `.claude/agents/{set-designer,street-designer,gag-writer}.md`, taken from the branch with the `johansson-town/` prefix removed;
  - `.gitignore` additions: `/_site/`, `/output/studio-mcp/`, `/data/studio/draft/`, `/data/studio/.lock` and `.DS_Store`;
  - `docs/history/README.md` (§3.5) and `docs/history/progress.md` (the site's `progress.md`);
  - `tools/site/assemble.sh`, `tools/site/smoke.mjs`, `tools/format-snapshot.mjs` and `.github/workflows/pages.yml`;
  - `tests/format-freeze.test.mjs` and `tests/format-freeze.json`, both until step 4.5.
- **Published (`_site`, about 108 MB).** Every tracked file, except:
  - `docs/` (but `docs/SPECTOR-LICENSE.txt` is kept);
  - `art/`, `tests/`, `output/`, `briefs/` and `scripts/`;
  - `tools/` (but `tools/vendor/` is kept, because `src/avatars/export.js` imports it);
  - `thuans-storage/tests/` and `thuans-storage/scripts/`;
  - `*.test.mjs`, and the repository and dev files.

  `version.json` is added. Runtime code names `docs/`, `tests/` and `briefs/` only in comments.

### 3.2 nj22az/johansson-studio
- **Contents.** The repo root is `avatar-creator/` as at T0 (about 30 files, 0.6 MB).
- **Added:**
  - `CLAUDE.md`, `AGENTS.md` and `LICENSE.md`;
  - `.gitignore`: `/world`, `/_site/`, `node_modules/`, `/output/` and `.DS_Store`;
  - `package.json` and its lock:
    - `"type": "module"`. Without it, Node treats Studio's own `.js` and the copied World's `.js` as untyped: it warns and parses each file twice, and Node before 22.7 fails. This was reproduced in `skeptic/typeless/`.
    - dev dependencies `playwright@1.61.0` and `pngjs@7.0.0`;
    - scripts `world`, `test`, `browser` and `smoke`;
  - `world.lock.json` and `tools/get-world.sh`;
  - `tools/site/{assemble.sh,smoke.mjs}`;
  - `.github/workflows/{pages.yml,follow-world.yml}`;
  - `docs/history/README.md`;
  - `tests/format-freeze.test.mjs`, until step 4.5.
- **World is never committed.** `world/` is assembled from `world.lock.json` whenever Studio is tested or published (§6.5).
- **Published (about 90 MB).** Studio's own runtime files, plus `world/` (the lock's paths without `tests/`, and without `tools/` except `tools/vendor/`), plus `version.json`.

### 3.3 nj22az/sjoskolan
- **Contents.** `sjoskolan/` is kept unchanged as a subfolder (2,230 files, 316.5 MB), with `elteknik/` (8.2 MB) and `ellab/` beside it.
  - About 25 tools and tests assume that the repo root contains `sjoskolan/`. That includes the week-locked tests, the Playwright configs (`--directory ../..`) and `bok.py`, which writes `REPO/elteknik/files`. Keeping the subfolder means they work unedited.
  - `elteknik/` and `ellab/` stay outside `innehall.py`'s `oversattning.js` check.
- **Added:**
  - `CLAUDE.md` (today's Swedish rules verbatim, plus the layout and publishing), `README.md`, `LICENSE.md` and `THIRD_PARTY_NOTICES.md` (the Sjöskolan sections);
  - `.gitignore`:
    - the site's lines for `sjoskolan/innehall/build/`, `.skyddat/`, `bok/.bok/`, `__pycache__/` and the draft lab's `node_modules`;
    - `node_modules/`, `/_site/` and `.DS_Store`.

    Without these lines, decrypted teaching material could be committed.
  - `docs/history/README.md`;
  - `.github/workflows/sjoskolan.yml` and `multimeter-browser.yml`, as on main after step 0.3, with `workflow_call:` added, the `paths:` filters dropped and `branches-ignore: [site]`;
  - `tools/bygg-site.sh`, `tools/site-branch.sh` and `tools/sitecheck.py`;
  - `pages.yml`, but only in the go-live commit (step 6.4).
- **Secret:** `LARARLOSEN`.
- **Published (about 325 MB):** exactly today's files (`sjoskolan/*` at the site root, plus `elteknik/` and `ellab/`), plus `publicerad.json`. The same tree is mirrored to the branch `site` after every publish (§6.6).

### 3.4 nj22az/nj22az.github.io afterwards
- **Keeps:** the portal, `blog/`, `shop/`, `form-3d-studio/`, `engineering-blog/`, `the-front-row-seat/`, `assets/` and `.nojekyll`. `functions/` and `wrangler.toml` (a dormant Cloudflare setup) are untouched.
- **Forwarding pages, kept forever:**
  - `johansson-town/index.html`, `johansson-town/creator/index.html` and `johansson-town/sw.js` (the kill switch);
  - `avatar-creator/index.html` and `thuans-storage/index.html`;
  - `motor-90l/index.html` and `motor-90l/workshop/index.html`;
  - `mizuhama-1988/index.html`;
  - `elteknik/index.html` and `ellab/index.html`;
  - `404.html`.
- **Contract files, kept forever:**

  | File | Used by |
  |---|---|
  | `assets/images/apple-touch-icon.png` | About 120 Sjöskolan pages (some week-locked or encrypted), the book, EL-LABB and Motor 90L |
  | `assets/images/favicon.svg` | Studio |
  | `assets/js/shopify-book-price.js` | The book, the portal and the blog |
  | `form-3d-studio/` | World's workshop iframe |
  | `elteknik/files/omslag.jpg` and `elteknik/files/provkapitel.pdf` | Old shared links and cached social previews |

  `/#projects` (Studio's close button) and `/blog/elteknik/…` must keep working.
- **Also kept:**
  - `AGENTS.md` (new at T0), pointing Codex to CLAUDE.md;
  - the branch `split/runbook` (the runbook and `STATE.md`), kept as the archive;
  - `.github/workflows/site-guard.yml`, which checks every item above (§6.10).

### 3.5 History
- **Each new repository starts with one import commit** whose tree is proved identical to the source folders. Its message names the source commit and where the earlier commits are.
- **The real history of World and Studio is on the work branch, not on main.**
  - Since 8 October, main's World history is the bot's copy commits ("Johansson World and Studio live: … from claude/sjoskolan-youtube-strategy-gofi3o").
  - Today the branch has 120 commits that main cannot reach.
  - The repository has no tags yet.

  So step 3.3 sets these tags, all pushed at T0:

  | Tag | Points at |
  |---|---|
  | `split/world-studio` | `MAIN_SHA`: main at T0, what the new repositories copy |
  | `split/world-studio-branch` | `BRANCH_SHA`: the merged work-branch head that the last live run copied. World's and Studio's own commits are here |
  | `split/side/<branch>` | Each side branch whose work was neither merged nor ported |

  At step 6.4, `split/sjoskolan` follows.
- **The old repository is the archive.** It is never rewritten, deleted or made private. These references keep resolving:
  - `KALLREV 8cabde3` in the exercise records;
  - jojo's `281a36bd`;
  - `sjoskolan/simulatorer/snapshot.json`;
  - PR #153 and the Actions run links.
- **`docs/history/README.md`** in World says where the history is: `https://github.com/nj22az/nj22az.github.io/commits/split/world-studio-branch/johansson-town`. Studio's and Sjöskolan's link to their own folders in the same way. It also says how to read the history without cloning:

  ```
  gh api 'repos/nj22az/nj22az.github.io/commits?sha=split/world-studio-branch&path=johansson-town/src/world/ferry.js'
  ```

---

## 4. Decisions, with defaults

The creator answers these in one reply ("defaults are fine", or names the changes).

| # | Question | Default | Why |
|---|---|---|---|
| D1 | Where do Thuan's Storage and Motor 90L go? | Into World, at `/johansson-world/thuans-storage/` and `/johansson-world/motor-90l/`. The old addresses forward | Storage is entered only from World, imports World's `src/dungeon/pretend.js` and shares World's save keys. Motor's workshop imports World's avatar builder and three.js, and World's tests hash `motor.js` and `calc.mjs` |
| D2 | Where does the book page go? | `/sjoskolan/elteknik/`. `/elteknik/` forwards forever; the cover and sample chapter stay at their old addresses too | `bok.py` writes the book files into `elteknik/files`. Shopify, printed matter and shared posts point at `/elteknik/` |
| D3 | Where does EL-LABB go? | `/sjoskolan/ellab/`. `/ellab/` forwards | All teaching material in one repository |
| D4 | How does Studio get World's code? | A pinned copy, which follows the published World after Studio's tests pass | Studio uses 273 World modules and about 41 asset files. Live imports would make World's raw `src/` a public interface and break Studio on any refactor |
| D5 | What history do the new repositories get? | One proved copy each. The history stays in the old repository, tagged (§3.5) | Small repositories for small disks, and old references stay valid |
| D6 | When does Sjöskolan move? | Saturday 17 October, evening (or after the exam) | It must be a lesson-free hour |
| D7 | Do you open World, or Studio, from an iPad Home Screen icon? | Unknown: run both scope tests in step 1.6 | World's icon has a manifest and a service worker; Studio's has neither. They may keep storage differently |
| D8 | What are `nj22az/JT`, `nj22az/book` and `nj22az/v41`? | Unrelated, and untouched. Today: `JT` is public JavaScript, created and last updated on 28 September, has no Pages site, and is attached to six of today's sessions. `book` ("Electro Technology") and `v41` are private, were last updated seconds after they were created on 28 September, and have no Pages site | If `JT` was meant to be World's repository, stop and re-plan before creating `johansson-world`. If `book` holds the book's source, it stays separate from `sjoskolan` |
| D9 | Which `gag-writer` agent wins? | World gets the site's copy; jojo keeps its own | They differ; reconcile them later |
| D10 | Pull requests and issues | Close the 17 stale World pull requests with a pointer. PR #160 (12 hairstyles, open, its base already merged as #159) merges before T0 if the creator approves it, or is ported to `johansson-world` after the switch, but not during the format freeze, because it adds hair ids. Transfer issue #132 to `johansson-studio`. #157 and #158 are merged or closed before Phase 6 | Folders that have left main cannot take those pull requests |
| D11 | When is T0? | The first evening after the rehearsal is green; a 3-hour window | Nobody may need a World or Studio update in that window |

---

## 5. Runbook

Each step says who does it, what is done, how it is checked and how it is undone. "Creator step N" refers to the list at the top.

### Phase 0. Prepare (Claude; nothing visible changes)

**0.0 Make the runbook durable.**
- **Do:** create the branch `split/runbook` from `main` in the old repository; it is never merged. It holds:
  - `RUNBOOK.md` (this plan);
  - `STATE.md` (rule 14), starting with the §4 answers.

  Publish the plan as a private page for the creator.
- **Check:** `gh api 'repos/nj22az/nj22az.github.io/contents/STATE.md?ref=split/runbook'` answers.
- **Undo:** delete the branch.

**0.1 List every writer, mechanically, and tell them** (§8).
- **Do:** build the list from four sources.
  - **Sessions.** `list_sessions` gives every session with `nj22az.github.io` among its sources, updated in the last 7 days. The Cowork session `01RHuRSJ3Hg545ZoiFQegudV` is added by hand.
  - **Branches.** List the branches pushed in the last 7 days, and compare each with the work branch (`gh api 'repos/nj22az/nj22az.github.io/compare/claude/sjoskolan-youtube-strategy-gofi3o...<branch>'`).
  - **This container.** Its task list and its subagents.
  - **Direct writers to main.**
    - Commits authored as `nj22az`: 27 since 10 October, for example `99a8baee` to `be4aa13d` on Studio, with no pull request.
    - Town Studio's "Publish to World": jojo's `town-studio/townstudio/town.py:15` has `BRANCH = 'main'`.

  The creator pastes the §8 message into each session (creator step 2). Claude cannot do this from here: `ListAgents` shows only this container's two subagents, and cloud sessions cannot reply.
- **Check:** silence, not replies. At T0 minus 1 hour:
  - no push to `main` or the work branch for 60 minutes, except Claude's;
  - every listed session is idle (`get_session`).

  A session still running at T0 is interrupted (`interrupt_session`) only with the creator's OK.
- **Repeat** at step 3.1. Record the list in `STATE.md`.

**0.2 Branch hygiene.**
- **Do:** delete `johansson-world/` on the work branch. Its `index.html` sends `/johansson-world/` to `/johansson-town/`, and it has never been on main.
  - Branches based on the work branch still carry it (`claude/catalogue-loader`, `claude/animal-crossing-lessons`, `claude/resident-belongings`, …). Record them in `STATE.md` as "never merge into main".
  - From T0, the site guard turns a main run red if `johansson-world/` appears (§6.10).
- **Check:** `git ls-tree origin/<branch> johansson-world` and `git ls-tree origin/main johansson-world` are both empty.
- **Undo:** restore the file.

**0.3 Sjöskolan prepares on main.** One commit, by the usual Sjöskolan route, with a line in `ANDRINGSLOGG.md`.
- **Do:**
  1. Copy World's `vendor/three.module.js` (r170, sha256 `89074684…`), `vendor/BufferGeometryUtils.js` (`3de83209…`) and `vendor/LICENSE-THREE.txt` into `sjoskolan/simulatorer/vendor/`. `BufferGeometryUtils.js` imports `./three.module.js`, so the page keeps a single Three.
  2. Repoint the 8 lines that import `johansson-town/vendor/`:
     - `scene.mjs:1` and `erik-visar.mjs:4` → `./vendor/…`;
     - `character/build.js:1-2`, `character/cel.js:1`, `vaxelstrom/scen.mjs:3`, `vaxelstrom/manus.mjs:5` and `vaxelstrom/session.test.mjs:7` → `../vendor/…`.
  3. In `simulatorer/snapshot.json`, note that Three now lives in `simulatorer/vendor/`.
  4. In `sjoskolan/verktyg/qa/week40.py` (not week-locked), make `check()` skip the paths in `MAIN_SITE = {'/assets/images/apple-touch-icon.png'}`.
  5. Bring the branch-only Sjöskolan changes onto main:
     - `workflow_dispatch` in `sjoskolan.yml`;
     - the 30-minute cached `multimeter-browser.yml`;
     - the two `ANDRINGSLOGG.md` entries dated 2026-10-08.
- **Check:**
  - `grep -rn "johansson-town/" sjoskolan --include=*.js --include=*.mjs --include=*.html` finds only comments and documentation.
  - `npm ci && npm test` passes in `sjoskolan/simulatorer`.
  - `sjoskolan.yml` is green on main.
  - Station A and Station B load, with no request outside `/sjoskolan/` except the icon.
- **Undo:** `git revert`.

**0.4 Probes and iPad test pages on main** (temporary; one commit; §6.12).
- **Do:** add these files:
  - `johansson-studio/user-only.txt`, containing `user site`;
  - `scope-test/a/` (built like World): a manifest, and copies of World's `pwa.js` and `sw.js` with the cache prefix `scope-test-`;
  - `scope-test/b/`;
  - `scope-test/c/` (built like Studio, with no manifest);
  - `scope-test/d/`.
- **Check:** each answers 200 after the main build.
- **Undo:** delete the files. The switch commit removes them anyway.

**0.5 Tool fixes that work in both layouts (batch P).** These land on the work branch before T0 and go live by the normal run, so less happens inside the freeze. Each item is its own commit. The Studio MCP part is done with task #41's owner, who is editing those files now.

1. **Studio MCP paths** (`tools/studio/`).
   - **`repo.mjs`:**
     - Add `WORLD_ROOT`, two folders up from `tools/studio/`. That is World's root in either layout.
     - Every `PATHS` entry and the `LABEL` pattern (line 41) drop the `johansson-town/` prefix.
     - World's prefix inside its git repository comes from `git rev-parse --show-prefix`: `johansson-town/` today, empty after the move.
   - **`tools.mjs`:**
     - `codeFile()` reads from `WORLD_ROOT` (lines 28, 40, 225).
     - `town` is `WORLD_ROOT` (line 241). It is used for `runtime/source.json`, `guide/portraits.json` and the test cwd.
     - `PUBLISHED` (line 236) loses its prefix. It is matched against `git status --porcelain` paths with World's prefix removed (porcelain paths are always relative to the repository root).
     - Studio's own status is a second `git status`, run in Studio's folder: `$STUDIO_DIR`, else `../johansson-studio`, else `../avatar-creator` (line 271).
     - A missing `guide/residents.json` is an error, not `[]` (line 40).
   - **Hint strings** name commands that run from World's root: `node tools/studio/build-data.mjs`, `npm run build:runtime` and `node tools/render-resident-guide.mjs`. They are at:
     - `tools.mjs` lines 176, 192, 245, 261, 265 and 275;
     - `build-data.mjs:71`;
     - the usage text in `apply.mjs` and `cli.mjs`;
     - `tests/studio-data.test.mjs:19`.
   - **Temporary roots:** `smoke.mjs:83-85` and `tests/studio-mcp.test.mjs:26` build them in World's own layout.
   - **New test:** in a temporary git repository, change `data/studio/looks.json` without committing it; `publish_check` must report "uncommitted" as not ok. Today that check would always pass after the move.
   - **Check:**
     - `grep -rn "johansson-town/" tools/studio tests/studio-*.mjs` finds only key names;
     - `npm test` and `npm run studio:smoke` pass in today's layout.
2. **The two tools that serve the folder above World.** `tools/render-feed-backdrops.mjs` (lines 22, 37) and `tools/ferry-look.mjs` (lines 14, 27) start their own server on `resolve(root,'..')` and open `/johansson-town/`. In a clone named `johansson-world` they would get 404s, and the feed backdrops and `views.json`, which Studio's locations and the storyteller's comics use, could no longer be rendered.
   - **Do:** serve World's own root at both `/johansson-town/` and `/johansson-world/`, keeping `--source`. No other tool serves the folder above.
   - **Check:** `node tools/render-feed-backdrops.mjs harbour` and one ferry view both work; then `git restore` the outputs.
3. **The local servers.**
   - `tools/serve-audit.py` also answers `/johansson-world/` from World's root, and keeps `/johansson-town/`.
   - In `tools/mcp/static-server.mjs`, `mounts` may also be `[urlPrefix, directory]` pairs; the old list form still works.
4. **Two one-off scripts.**
   - In `scripts/build-workshop-models.mjs:4`, the static import of `../../form-3d-studio/src/open-models.mjs` becomes a dynamic `import()` of `$FORM3D_DIR`, default `../../form-3d-studio`.
   - In `scripts/build-building-audit.mjs:33`, the `git show <rev>:johansson-town/docs/…` path uses the prefix from `git rev-parse --show-prefix`. Its error message says that revisions before the split are in `nj22az.github.io@split/world-studio-branch`.
5. **Generated headers.**
   - `tools/studio/build-data.mjs:29-30,42-43` write `avatar-creator/docs/STUDIO-MCP.md` into `src/avatars/looks-data.js` and `src/studio/characters-data.js`. Change the text to "Johansson Studio's docs/STUDIO-MCP.md".
   - Run `build-data.mjs`, then `npm run build:runtime`. Both files are in `src/`, which the runtime hash covers, and CI rejects hand edits.
- **Undo:** revert each commit.

**0.6 Teacher-page scan** (recommended).
- **Do:** on a throwaway branch `split-scan` of the old repository, which already has `LARARLOSEN`, run a one-off workflow that:
  - unlocks each locked teacher page into `$RUNNER_TEMP`, sending `las.mjs`'s output to `/dev/null`, with no `set -x`;
  - prints only `page: address` pairs for addresses beginning with `/johansson-town/`, `/avatar-creator/`, `/thuans-storage/`, `/motor-90l/`, `/elteknik/` or `/ellab/`, plus a count per prefix;
  - never prints page text.

  This repository's CI already unlocks teacher pages in its tests with the same secret, so the scan adds no new exposure beyond those addresses. Delete the branch afterwards.
- **Check:** each hit either gets a forwarding page or a file kept forever, or is fixed in the teacher page (unlock → edit → lock) before Phase 5 or 6.
- **Undo:** delete the branch.

### Phase 1. The creator's sitting 1 (creator steps 3–8)

1.1 Decisions (§4). 1.2 Repositories. 1.3 Access. 1.4 Pages on for World and Studio. 1.5 Secret. 1.6 iPad scope tests a→b and c→d, if D7 is yes or unknown (§6.12). 1.7 T0.

Claude then:
1. **Attaches the repositories** with `add_repo` (owner `nj22az`, access `push`) for each of the three. `add_repo` attaches a new repository to a running session.
2. **Checks that `/sjoskolan/` is still the main site's.** `curl -sI https://nj22az.github.io/sjoskolan/` must give 200 with the last main build's `last-modified`. If it gives 404, the creator renames the new repository to `sjoskolan-ny` at once; it is renamed back in step 6.4.
3. **Runs probe P1:** polls `/johansson-studio/user-only.txt` for 10 minutes after Studio's Pages is switched on (§6.12).
4. **Records in `STATE.md`** the scope-test results, which choose a forwarding variant for World (a→b) and for Studio (c→d), §6.7.

### Phase 2. Rehearse (Claude; nothing visible changes)

**2.1 Rehearsal copies.**
- **Do:** push a bootstrap commit to each new repository's `main`. It holds only `.github/import.json` and `.github/workflows/import.yml` (§6.1), with `"target": "rehearsal"` and `source_sha` set to the current `origin/main`. The job writes the proved copy to the branch `rehearsal`; `main` keeps only the bootstrap commit. Do this for World (`"layout": "world"`) and for Studio (`"layout": "studio"`).
- **Check:** the job's own proof is green. Independently, `gh api repos/nj22az/johansson-world/git/trees/rehearsal` lists the same object ids as `git ls-tree <source>:johansson-town` plus the two subtrees.
- **Undo:** copy again; the rehearsal branch is rebuilt at will.

**2.2 World commit A, on `rehearsal`: set up the repository.**
- Remove the import files.
- Add the §3.1 files, the pages workflow (§6.4), the assemble and smoke scripts (§6.2, §6.3) and the format-freeze test (§6.15).
- In `README.md`, `WHERE-TO-EDIT.md` and `briefs/NEXT.md` (line 4 on), state the new address and the publishing rule: push to `main` here; tests run, then it publishes.

**2.3 World commit B: Thuan's Storage and Motor 90L live inside World.**

| File | Change |
|---|---|
| `thuans-storage/index.html` | The script `/thuans-storage/assets/storage-….js` and the stylesheet `/thuans-storage/assets/ghpages-….css` become `./assets/…`. The import map becomes `{"imports":{"../vendor/three.module.js":"./vendor/three-r186/three.module.js"}}`; that key resolves to `/johansson-world/vendor/three.module.js`, which is what `src/dungeon/pretend.js` imports. The canonical and `og:url` (lines 15 and 22) become `https://nj22az.github.io/johansson-world/thuans-storage/`, and `og:image` (line 23) becomes `…/johansson-world/thuans-storage/og.jpg` |
| `thuans-storage/src/game.js` | `import('/johansson-town/src/dungeon/pretend.js')` becomes `import('../../src/dungeon/pretend.js')`, which from `thuans-storage/assets/storage-*.js` resolves to `/johansson-world/src/dungeon/pretend.js` |
| `thuans-storage/src/character.js` | `` `/thuans-storage/models/thuan.glb` `` becomes `` `./models/thuan.glb` `` |
| `thuans-storage/src/ui.js` | `location.href = '/johansson-town/'` becomes `'../'`. The keys `johansson-town:storage-*` and the `from=johansson-town` token stay, because World's `src/commerce/shop-stock.js` reads them |
| `thuans-storage/scripts/build-runtime.mjs` | Its two `/thuans-storage/assets/` patterns become `./assets/`. Then run it; it writes a new hashed bundle and updates the script line in `index.html` (it does not touch the canonical lines) |
| `thuans-storage/tests/playability.test.mjs` | `../../johansson-town/src/dungeon/costumes.js` becomes `../../src/dungeon/costumes.js` |
| `tests/storage-boss.browser.mjs` | It reads files from World's root (`new URL('../', import.meta.url)`) and maps `/johansson-world/<path>` to `<root>/<path>`. It opens `http://town.test/johansson-world/?audit` and waits for `**/johansson-world/` after Storage returns (lines 2, 7, 20, 30, 34). It is the only end-to-end test of the storage-won hand-off |
| `motor-90l/workshop/erik.js` | `'/johansson-town/src/avatars/build.js'` becomes `'../../src/avatars/build.js'` |
| `motor-90l/workshop/index.html` | The import map becomes `{"imports":{"three":"../../vendor/three.module.js"}}`, the URL `build.js` loads. The canonical (line 9) becomes `…/johansson-world/motor-90l/workshop/` |
| `motor-90l/index.html` | The canonical (line 9) becomes `…/johansson-world/motor-90l/` |
| `tests/motor-bench.test.mjs` | `new URL('../../'+file,…)` becomes `'../'+file` |
| `tools/pack-motor-90l.mjs` | `../../motor-90l/` becomes `../motor-90l/`; fix the `assets/ATTRIBUTION.md` link |

- **Check:** `grep -rn -E "/(thuans-storage|johansson-town|motor-90l)/" thuans-storage motor-90l tests/storage-boss.browser.mjs --include=*.html --include=*.js --include=*.mjs` finds only comments, the `from=` token and key names.

**2.4 World commit C: World at its own address.**
- **`sw.js`:** `PREFIX='johansson-world-'`, and the fetch handler returns early for `thuans-storage/` and `motor-90l/` (§6.8). It does not yet delete old `johansson-town-*` caches; that waits for Phase 5.
- **`index.html`:** `class="stockroom-card" href="/thuans-storage/"` becomes `href="thuans-storage/"`. The Studio button (`id="openStudio" href="/avatar-creator/"`, line 88) **stays** until Studio is live (commit D, step 3.8); otherwise it would lead to a 404 between steps 3.6 and 3.7.
- **`activities.js`:** the two strings `'/thuans-storage/?from=johansson-town&mode=…&day='` (lines 1010-1011) become `'thuans-storage/?from=…'`.
- **`src/workshop/motor-bench.js`:** `MOTOR_LINKS` becomes `{stripDown:'motor-90l/',routine:'motor-90l/workshop/'}`; change the matching assertion in `tests/motor-bench.test.mjs`.
- **Studio MCP, the parts that depend on the layout** (the path parts landed in step 0.5):
  - `tools/studio/tools.mjs:158` imports `scene-catalogue.mjs` from Studio's folder, by a dynamic import with a clear message if it is missing.
  - `tools/studio/page.mjs` serves Studio at `/johansson-studio/` and this World at `/johansson-studio/world/` (prefix pairs), and opens `/johansson-studio/?agent`.
  - In `tests/studio-mcp.test.mjs`, the part that needs Studio skips with a clear message when Studio is absent. Its mounts and traversal checks (lines 147-152) use the new prefix pairs.
  - In `tests/studio-apply.test.mjs`, replace `.github/workflows/johansson-town-live.yml` with another path the MCP must never write.
- **`.mcp.json`** (§3.1).
- **Last:** `npm run build:runtime`, which stamps `sw.js` and rebuilds `runtime/`. Commit `runtime/`.
- **Acceptance:**
  - `npm test` passes **with no Studio present**;
  - `npm run studio:smoke` passes with a sibling Studio clone;
  - in a clone named `johansson-world`, `node tools/render-feed-backdrops.mjs harbour` works (then `git restore`).

**2.5 Studio commits A and B, on Studio's `rehearsal`.**
- **Commit A:** set up the repository (§3.2). `world.lock.json`'s `commit` is World's rehearsal head.
- **Commit B: Studio runs on its own copy of World.**
  - **`index.html` head** as in §6.5. The base becomes `/johansson-studio/world/`; Studio's own files stay absolute (`/johansson-studio/…?v=…`); World's stylesheets and icon become relative to the base; the canonical becomes `https://nj22az.github.io/johansson-studio/`.
  - **Imports:** run `sed -i 's#\.\./johansson-town/#./world/#g' studio.js studio-api.js scene*.js scene*.mjs`. This covers static and dynamic imports and the `new URL(…, import.meta.url)` fetch of `views.json`.
  - **By hand:** the location thumbnails (`` img.src=`../johansson-town/assets/images/feed/${id}.webp` ``, near `scene.js:79`) resolve against the page's `<base>`, so they become `` `assets/images/feed/${id}.webp` `` without `world/`. The rule: module specifiers and `import.meta.url` URLs get `./world/…`; URLs the page resolves (`img.src`, `link href`, plain fetch strings) are relative to the base.
  - **Unit tests:** run `sed -i 's#\.\./\.\./johansson-town/#../world/#g' tests/*.test.mjs`. Rewrite `../../johansson-town/` before `../johansson-town/`, never the other way round.
  - **`tests/studio-agent.browser.mjs`:**
    - Playwright comes from Studio's own `node_modules` (line 12);
    - `serveGame` from `../world/tools/mcp/static-server.mjs`, with the pair `['/johansson-studio/', <Studio root>]`, so `world/` is served inside it (lines 13, 21);
    - imports from `../world/src/…` and `../world/tools/studio/build-data.mjs` (lines 14-16);
    - the route becomes `**/johansson-studio/world/src/studio/characters-data.js*` (line 28);
    - the in-page `import('/johansson-studio/world/src/avatars/cast.js')` (lines 36, 72).
  - **`tests/studio.browser.mjs`:** `/avatar-creator/` becomes `/johansson-studio/` (lines 34, 194, 270), and the in-page cast path changes as above (line 255).
  - **Docs:** `docs/COMIC-MAKER.md`, `docs/SCENE-WORKSPACE.md` and `docs/STUDIO-MCP.md` get the new addresses. `WHERE-TO-EDIT.md` is rewritten for the new repository.
- **Check:**
  - `npm ci --ignore-scripts && npm run world && node --test tests/*.test.mjs && npm run browser && bash tools/site/assemble.sh <scratch>/_site && node tools/site/smoke.mjs <scratch>/_site --chromium-only`;
  - `grep -rn -E "johansson-town|avatar-creator" *.js *.mjs index.html tests/` finds only comments and key names.

**2.6 Rehearsal checks.**
- CI is green on both rehearsal branches. The test jobs run, including the Chromium and WebKit smoke on the assembled sites; deploy runs only from `main`.
- The kill-switch rehearsal (§6.14) runs in Chromium in a session, and in WebKit in a temporary workflow on World's `rehearsal` branch.
- Measure how long each step takes, so that T0's 2-hour target is realistic.

**2.7 Refresh, the day before T0.**
- **Do:** copy again from the current `origin/main`, then `git cherry-pick -x` A, B and C (and Studio's A and B) onto it. Fix conflicts now, not at T0.
- **Check:** CI is green again.

### Phase 3. T0: freeze, copy, publish

The target is World live at `/johansson-world/` within 2 hours of step 3.3, and Studio within 3. Abort at 4 (step 3.10).

**3.1 Cut-off.**
- Re-run the 0.1 inventory.
- Every writer stops:
  - finished work is pushed to the work branch (the island session may push to `main`);
  - unfinished work is pushed to `wip/<task>`. In this container's shared checkout, whatever is still uncommitted goes into one commit on `wip/t0-leftovers` (`git add -A`, owners named in the message);
  - nothing stays only in a working tree.
- Town Studio's Publish (creator step 10) and Codex's pushes stop.
- Each side branch is merged, kept for porting after T0 (tagged in step 3.3), or recorded as abandoned, as the creator decides.

**3.2 Integrate (one integrator, rule 11).**
- **Workspace:** a fresh worktree, never the shared checkout. Use `git worktree add --no-checkout`, then a sparse checkout of the root files and the four folders (about 270 MB). Or use a fresh session.
- **Merge:**
  - the local work (today 11 commits on `814fb9da`);
  - origin's branch (22 commits);
  - `origin/main`;
  - the approved side branches (for example PR #160 if D10 says so).
- **Banners:** add a line at the top of `johansson-town/README.md`, `johansson-town/WHERE-TO-EDIT.md` and `avatar-creator/WHERE-TO-EDIT.md`: "Frozen at T0 (<time> UTC): moving to nj22az/johansson-world (…/johansson-studio). Do not edit here; see CLAUDE.md." The banners are part of T0's content, because an edit inside these folders after `MAIN_SHA` would show up as drift.
- **Notice:** add a note to the branch's CLAUDE.md that this branch is now an archive.
- **Build:** `npm run build:runtime`, `npm test`, Studio's tests and the Storage and Motor tests. Then push the branch.
- **Wait** until `johansson-town-live.yml` succeeds: `gh api 'repos/nj22az/nj22az.github.io/actions/workflows/johansson-town-live.yml/runs?per_page=3'`.

**3.3 Freeze points.**
- `MAIN_SHA` is main's head after that run; `BRANCH_SHA` is the branch head it copied.
- **Check:**
  - `git rev-parse $MAIN_SHA:johansson-town` equals `git rev-parse $BRANCH_SHA:johansson-town`, and the same for `avatar-creator`;
  - `git diff --quiet $MAIN_SHA $BRANCH_SHA -- thuans-storage motor-90l` passes.
- **Switch off the old publishing:** `gh api -X PUT repos/nj22az/nj22az.github.io/actions/workflows/johansson-town-live.yml/disable`, or creator step 9. **Disable only; do not delete the file.** The abort rule needs it, and step 4.5 deletes it.
- **Tags:** `split/world-studio` = `MAIN_SHA`, `split/world-studio-branch` = `BRANCH_SHA`, and `split/side/<name>` for each side branch kept for porting. Push the tags.
- **Record** everything in `STATE.md`.

**3.4 Main commit "World and Studio are frozen"** (root files only, so the drift check stays clean).
- `CLAUDE.md`: a notice at the top. It says that World and Studio are frozen here since T0; that they are being published at `nj22az/johansson-world` and `nj22az/johansson-studio`; and that writers should wait for "open" in this notice before working there.
- `AGENTS.md` (new): the same notice, for Codex.
- `.github/workflows/site-guard.yml`, with these lists (§6.10):
  - `reserved.txt`: `johansson-world`;
  - `moved.txt`: the four folders;
  - `keep.txt`: empty.
- **Check:** the guard's first run is green.
- **Undo:** revert.

**3.5 Final copies.**
- **Do:** on each new repository's `main`, push `.github/import.json` with `source_sha` = `MAIN_SHA`, `"target": "main"`, and `history` pointing at `…/commits/split/world-studio-branch/johansson-town` (for Studio: `/avatar-creator`).
- **Check:** the job's proof, and the independent tree comparison of step 2.1.

**3.6 Publish World.**
- **Workspace:** at least 1.5 GB free (`df`), or a fresh session (§11).
- **Do:**
  1. `git clone --depth=1` World, and fetch `rehearsal`.
  2. Cherry-pick A, B and C. In a conflict over a generated line (runtime file names in `index.html`, `sw.js`'s `VERSION`), keep the new repository's side.
  3. Write the format snapshot, **before** porting anything, so that it describes exactly what the old addresses serve: `node tools/format-snapshot.mjs > tests/format-freeze.json`. A, B and C change no stored id.
  4. Port anything committed after `MAIN_SHA` (§6.11). A port that adds or renames a stored id fails the format-freeze test, and waits until after the switch.
  5. Run `npm ci --ignore-scripts`, `npm run build:runtime`, `npm test`, the Storage and Motor tests and `node tests/storage-boss.browser.mjs`, then assemble and the Chromium smoke test.
  6. Push. `pages.yml` tests, runs the WebKit smoke, deploys, and reads `version.json` back.
- **Check:**
  - The run is green, and `/johansson-world/version.json` shows HEAD.
  - **Parity:** `git diff --stat <import commit>..HEAD` lists only the files of A to C (with the T0 snapshot), plus the ported files listed in `STATE.md`.
  - **Every published file** is live with the right size. List them with `bash tools/site/assemble.sh --list`, then `curl -sI https://nj22az.github.io/johansson-world/<path>`, 8 in parallel. Each must answer 200, and the ETag's second part (`"<time hex>-<size hex>"`) must equal the file's size.
  - **Live browser smoke** from the session: `node tools/site/smoke.mjs --base https://nj22az.github.io --chromium-only`. It fails on any request to `/johansson-town/`, `/thuans-storage/` or `/motor-90l/`. The WebKit smoke ran in the publishing run.
  - `/johansson-town/` still serves the old game, with its `last-modified` unchanged.
- **Then:** World is **open** (rule 13). Update main's CLAUDE.md notice and `STATE.md`.
- **Undo:** run the workflow again on a good commit, or revert. Nobody depends on the new address yet.

**3.7 Publish Studio.**
- **Do:** clone Studio and cherry-pick A and B. Set `world.lock.json`'s `commit` to the `sha` in `/johansson-world/version.json`. Write Studio's format snapshot. Run the local checks of step 2.5, then push.
- **Check:**
  - `/johansson-studio/version.json` shows HEAD and the pinned World;
  - the live smoke opens Studio, enters Build scene and picks all 12 locations, with no page error and no request outside `/johansson-studio/` except fonts and `/assets/images/favicon.svg`;
  - every file answers 200 with the right size.
- **Probes P2 and P3** (§6.12):
  - P2 notes whether `/johansson-studio/version.json` and `/johansson-studio/user-only.txt` answer.
  - P3 is a main commit that adds `johansson-studio/index.html`, a probe page on main. After that main build, and again after the next unrelated main build, `/johansson-studio/` must show **Studio**.
  - If the probe page shows at either check, the main site (or the last build) wins. Delete `johansson-studio/` from main at once; Studio appears after that build. Sjöskolan then defaults to variant B (step 6.5).
- **Then:** Studio is **open** (rule 13).
- **Undo:** as for World. Reverting the lock commit restores the previous World.

**3.8 World commit D.** `id="openStudio" href="/avatar-creator/"` becomes `/johansson-studio/`. Publish, then check that the title-screen button opens Studio.

**3.9 Repoint jojo** (one jojo commit, §6.13), so that jojo's tools find the new World before the switch.
- **Check:**
  - `town-studio` tests pass;
  - `remotion/tools/sync-town.sh` runs against a sibling World clone;
  - one capture tool opens `/johansson-world/?audit`.

  Then tell the creator that jojo is updated. Once the Mac has its World clone (creator step 16), Town Studio's Publish works again, and it now pushes to World's `main`.
- **Undo:** revert.

**3.10 Abort rule.**
- **World:** if World is not live with green checks 4 hours after the old publishing was switched off (step 3.3):
  1. Enable `johansson-town-live.yml` again (`…/enable`, or the creator clicks Enable).
  2. Revert the step 3.4 commit on main.
  3. Tell the writers to carry on in the old repository.
  4. Record why in `STATE.md`.

  The new repositories stay unannounced. The next attempt starts again at step 2.7.
- **Studio:** if Studio fails after World is live, fix it forward. Studio is 0.6 MB, and its old address keeps serving the T0 copy meanwhile.

**3.11 Creator sitting 2** (creator steps 11–15), the same day as step 3.7 if possible.
1. **Backups:** World's save file, Studio's design and project.
2. **The iPad checks** of the new addresses.
3. **Probe P4**, required whenever P3 showed that the project wins (§6.12).
   1. The creator unpublishes Studio.
   2. Claude polls `/johansson-studio/` for 10 minutes. If the main probe page appears, Unpublish releases a path, and Sjöskolan's emergency undo is Unpublish.
   3. If it does not appear, test the rename: the creator renames `johansson-studio` to `johansson-studio-paused`, Claude checks that the probe page appears, and the creator renames it back.
   4. Either way, Claude republishes Studio (a dispatch of `pages.yml`, or an empty commit) and checks `version.json`. Record the minutes in `STATE.md`. If Studio does not come back, the creator selects Source: GitHub Actions again.
4. **iPad dress rehearsal** of the forwarding and the kill switch, if icons are used (§6.12). Claude swaps `scope-test/a/` to the kill switch and the forwarding page; the creator opens the a icon and reports.
5. **"switch".**

Until the switch: the format freeze holds (rule 12), and nobody plays the old and the new World at the same time.

### Phase 4. Switch the old addresses (within 48 hours of step 3.7; one main-site commit)

**4.1 Checks before.**
1. Steps 3.6 and 3.7 passed, and the creator said "switch".
2. The forwarding variants are decided from 1.6 and 3.11: plain, or the icon branch, separately for World and Studio (§6.7).
3. **Drift:** `git diff --stat $MAIN_SHA origin/main -- johansson-town avatar-creator thuans-storage motor-90l` is empty. If not, port first (§6.11).
4. The teacher-page scan (step 0.6) is clean, or its hits are handled.
5. The kill-switch rehearsal (§6.14) passed.
6. A session browser profile is prepared with the live old worker registered: open `/johansson-town/` once with a persistent profile.

**4.2 The commit "World and Studio moved to their own repositories"** (on main's own files, never the branch's).
- **Forwarding pages (§6.7):**
  - `johansson-town/index.html` and `johansson-town/creator/index.html` → the World forwarding page;
  - `johansson-town/sw.js` → the kill switch (§6.8);
  - `avatar-creator/index.html` → `/johansson-studio/`;
  - `thuans-storage/index.html` → `/johansson-world/thuans-storage/`;
  - `motor-90l/index.html` and `motor-90l/workshop/index.html` → `/johansson-world/motor-90l/…`;
  - `mizuhama-1988/index.html` → `/johansson-world/` (one hop, not two).
- **`404.html`** is new, with the prefix map (§6.9).
- **Links:**
  - `config.js`: the "Johansson World" card's `url` becomes `/johansson-world/`, and the "Johansson Studio" card's becomes `/johansson-studio/`. Do not carry over the branch's duplicate card.
  - `sitemap.xml`: list the new addresses.
  - `blog/the-torn-poster/index.html:82`: the link becomes `/johansson-world/`.
- **Removed:**
  - `johansson-studio/` (both probe files) and `scope-test/`;
  - main's `.mcp.json`, which only starts World's audit server.
- **`CLAUDE.md`:** the freeze notice and the "Johansson Town" section are replaced by "Where things live", a short "Words" summary, the contracts and the reserved names (§10). `AGENTS.md` points to it.
- **Site guard lists:** `reserved.txt` adds `johansson-studio`; `keep.txt` gets the forwarding pages and contract files.
- **Everything else in the four folders stays, frozen**, so that open old tabs keep loading their files.

**4.3 Checks after.** Wait for "pages build and deployment" to succeed, plus up to 10 minutes of CDN cache.
- **curl:** each old address answers 200 with `<meta name="moved-to" …>`.
- **Live browser:** these forward, keeping query and hash:

  | Old | New |
  |---|---|
  | `/johansson-town/?avatar=T#h` | `/johansson-world/?avatar=T#h` |
  | `/johansson-town/creator/?r=C` | `/johansson-world/creator/?r=C` |
  | `/avatar-creator/?r=C` | `/johansson-studio/?r=C` |
  | `/thuans-storage/?from=johansson-town&mode=play&day=3` | `/johansson-world/thuans-storage/?…` |
  | `/motor-90l/workshop/` | `/johansson-world/motor-90l/workshop/` |
  | `/mizuhama-1988/` | `/johansson-world/` |

- **The old-worker profile:** after one visit, nothing is registered for `/johansson-town/`, no `johansson-town-*` cache remains, and localStorage is unchanged.
- **An old game tab opened before the switch** keeps running (no forced navigation). It shows "Town updated · save & reopen", which saves and lands on `/johansson-world/`.
- **Probe P3, once more:** `/johansson-studio/` still shows Studio after this build.
- The portal cards and the sitemap point to the new addresses. Station A and Station B still load. The site guard is green.
- The creator opens the usual icon or bookmark (creator step 17).

**4.4 Undo.** `git revert <switch commit>` and push. After one main build (about 3 minutes, plus cache), the old pages and worker are back. Saves are untouched.

**4.5 After the switch has held for a day.**
- **World and Studio:** one commit each, "The format freeze ends", which deletes `tests/format-freeze.*`, the snapshot tool and the CLAUDE.md line.
- **The work branch:** delete `johansson-town-live.yml` there, with an "archived" note.
- **Schedule Phase 5** with `send_later` (+14 days) into the split session. If that session is gone, use `create_trigger` with a standalone prompt that names `split/runbook`.

### Phase 5. Clean-up, 14 days after the switch

- **Port check first:** `git diff --stat <switch commit> origin/main -- johansson-town avatar-creator thuans-storage motor-90l` lists only files in `keep.txt`. The guard cannot block a direct push, so port anything else (§6.11) before deleting.
- **Main commit:**
  - delete everything in the four folders except the forwarding pages;
  - delete `progress.md`, which is already in World's `docs/history/`;
  - turn the World paragraphs of `LICENSE.md` and the World sections of `THIRD_PARTY_NOTICES.md` into links.
- **World commit:** `sw.js`'s activate step also deletes leftover `johansson-town-*` caches. Then run `npm run build:runtime` (`sw.js` is in the runtime hash, so `tests/runtime-package.test.mjs` fails without it) and commit `runtime/`.
- **Check:**
  - `/johansson-town/guide/x` reaches `/johansson-world/guide/x` through `404.html`;
  - the guard is green;
  - the simulators load;
  - a fresh browser shows no `johansson-town-*` cache after visiting World.
- **Undo:** revert either commit.

### Phase 6. Sjöskolan, the book and EL-LABB

**6.1 Before anything.**
- PRs #157 and #158 are merged or closed (D10).
- The Sjöskolan sessions are told (§8; today `01E6DNWu8trXB9zSZC1cgTtp`, "Course and courseplan alignment").

**6.2 Copy (any day before the window).**
- **Do:** run the import job with `"layout":"sjoskolan"`, `"target":"main"` and `source_sha` set to the current `origin/main`, which includes step 0.3. Record it as `SJO_SHA`.
- **Check:** the job's proof. Nothing is published yet.

**6.3 Set up the repository.**
- **Do:**
  - Remove the import files.
  - Add the files of §3.3. `sjoskolan.yml` gets `workflow_call:`, and its push trigger stays on all branches except `site` until the go-live commit.
  - In `elteknik/index.html`, lines 8, 10, 14, 39 and 40 (canonical, `og:url`, `og:image` and JSON-LD) become `https://nj22az.github.io/sjoskolan/elteknik/…`.
  - In `sjoskolan/multimeterfilm/index.html:18`, the source link becomes `https://github.com/nj22az/sjoskolan/tree/main/sjoskolan/multimeterfilm`.
  - In `sjoskolan/kallor.html`, the licence links point to the new repository's files.
  - Add a line to `ANDRINGSLOGG.md`.
- **Check:**
  - `sjoskolan.yml` is green, **with the `LARARLOSEN` steps run, not skipped**;
  - `multimeter-browser.yml` is green;
  - `bash tools/bygg-site.sh _site && python3 tools/sitecheck.py _site` is clean, after recording a baseline of links already broken today;
  - the Playwright suites pass against `_site` served at `/sjoskolan/`;
  - `bash tools/site-branch.sh` prints a commit.
- Keep the repository green for a few days.

**6.4 The window** (D6, a lesson-free hour).
1. **Announce** a one-hour freeze on Sjöskolan edits.
2. **Re-sync:** run `git diff --full-index --binary $SJO_SHA origin/main -- sjoskolan elteknik ellab | git -C ../sjoskolan apply --3way`. For `ANDRINGSLOGG.md`, keep both lines.
   - Tag `split/sjoskolan` on main.
   - Prove that `git diff origin/main:sjoskolan <new>:sjoskolan` shows only the files changed on purpose in step 6.3.
3. **Rename back:** if the repository was renamed to `sjoskolan-ny`, the creator renames it back now.
4. **Go-live commit:** add `pages.yml` (§6.6, with its `spegel` job), and set `sjoskolan.yml`'s push trigger to `branches-ignore: [main, site]`.
5. **Switch Pages on:** when the run reaches "Wait until Pages is switched on", the creator switches Pages on (creator step 19). Then the run deploys, reads `/sjoskolan/publicerad.json` back, and pushes the `site` mirror.
6. **Schedule** step 6.7 (`send_later`, +7 days).

**6.5 Checks, and the variant.**
- **The project serves:** `/sjoskolan/publicerad.json` names `nj22az/sjoskolan` and the commit.
- **The project wins for a file both sides have:** `/sjoskolan/kallor.html` carries the new repository's licence links. It exists on main too, unchanged there.
- **Every published file** answers 200 with the right size: about 2,240 `HEAD` requests.
- **Live smoke** from the session:
  - the course start page;
  - weeks 41 to 43;
  - the five labs;
  - Station A and Station B;
  - `gemensamt/Formelsamling.html` (printed QR codes);
  - `larare/resultat.html#r=…` (the result-code QR);
  - `/sjoskolan/elteknik/` (price, sample chapter);
  - `/sjoskolan/ellab/`.
- **The creator** unlocks one teacher page (creator step 20).
- **The `site` branch** exists, and its tree equals the published files.
- **Variant B:** if `publicerad.json` does not answer, or `kallor.html` is still main's version, or P3 showed that the main site wins, then in the same window delete, in **one** main commit:
  - `sjoskolan/`;
  - `.github/workflows/sjoskolan.yml` and `multimeter-browser.yml` (otherwise their path triggers run on main and fail);
  - the Sjöskolan lines in `.gitignore`.

  The project appears after that build; until then the old copy serves. Undo by reverting that commit.
- **Re-check** both markers after the next main build (step 6.6 is one). If they flip, use variant B.

**6.6 Main commit "The book and EL-LABB moved with Sjöskolan"** (once step 6.5 holds).
- **Book:** `elteknik/index.html` becomes a forwarding page to `/sjoskolan/elteknik/`. `elteknik/files/omslag.jpg` and `provkapitel.pdf` stay forever; the rest of `elteknik/` stays frozen until step 6.7.
- **EL-LABB:** `ellab/index.html` becomes a forwarding page to `/sjoskolan/ellab/`.
- **404 map:** `404.html` adds `/elteknik/` and `/ellab/`.
- **Portal:** `config.js` lines 72 and 75 become `/sjoskolan/elteknik/` and `/sjoskolan/elteknik/files/omslag.jpg`; `sitemap.xml:5` the same.
- **Blog:** in `blog/index.html`, the cover image and the book link become the new addresses. In the six `blog/elteknik/…/index.html` pages:
  - copy `elteknik/styles.css` to `blog/elteknik/book.css`, and point the pages at it;
  - `/elteknik/` links become `/sjoskolan/elteknik/`;
  - the cover becomes `/sjoskolan/elteknik/files/omslag.jpg`;
  - the sample download becomes `/sjoskolan/elteknik/files/provkapitel.pdf`. A `download` link cannot follow a forwarding page, so it must point at the file;
  - update the comment in `article.css`.
- **Site guard:** `keep.txt` adds the new forwarding pages and frozen files; `moved.txt` adds `sjoskolan`, `elteknik` and `ellab`.
- **Check:** `/elteknik/` and `/ellab/` forward, the blog series is styled and shows its cover, and the sample chapter downloads.
- **Undo:** revert.

**6.7 After one teaching week**, and after at least one later main build in which `/sjoskolan/publicerad.json` and the new `kallor.html` are still served:
- **Port check first:** `git diff --stat <go-live main commit> origin/main -- sjoskolan elteknik ellab` lists only step 6.6's files. Port anything else.
- **Delete from main:**
  - `sjoskolan/`;
  - `.github/workflows/sjoskolan.yml` and `multimeter-browser.yml`;
  - the Sjöskolan lines in `.gitignore`;
  - the rest of `elteknik/` (keep the forwarding page and the two frozen files);
  - `ellab/README.md`.
- **Update:** CLAUDE.md's Sjöskolan section becomes a pointer; the Sjöskolan sections of `LICENSE.md` and `THIRD_PARTY_NOTICES.md` become links; `sjoskolan` joins `reserved.txt`.
- **Check:** `/sjoskolan/` is still served by the project, and the guard is green.
- **Undo:** revert, then use step 6.9 if needed.

**6.8 The Shopify link.** The book's description links `https://nj22az.github.io/elteknik/`. The creator changes it (creator step 18), or Claude does it with the Shopify connector after an OK. The forwarding page covers it until then.

**6.9 Sjöskolan's emergency undo, in order.**
1. **A content problem:** fix forward, or run `pages.yml` on an older commit.
2. **Actions does not run** (as in the billing stop of 7–8 October, when every workflow job failed to start but "pages build and deployment" kept succeeding):
   - The creator sets Source to "Deploy from a branch: `site` / (root)" (creator step 21). The last good site is served by the classic build.
   - For a fix, Claude commits to `main`, runs `tools/site-branch.sh` in a session (git objects only, no Actions) and pushes `site`.
   - When Actions works again, the creator switches back to GitHub Actions, and Claude runs `pages.yml`.
3. **A Pages-level problem before step 6.7:**
   - In variant A, Unpublish if P4 showed it releases the path; otherwise rename the repository to `sjoskolan-paused` (tested in step 3.11). Main's copy serves `/sjoskolan/` again within minutes, plus cache.
   - In variant B, revert main's deletion. The main site wins, so its copy serves again after one build.
4. **After step 6.7:** revert the deletion on main first, then point 3.

### Phase 7. Tidy up

- **Stale workflows:** disable the 7 workflows registered from other branches, with the API, or the creator clicks Disable.

  | Workflow | Id |
  |---|---|
  | `build-minato-barfly-asset` | 365757578 |
  | `build-town-publication` | 359769734 |
  | `equipment` | 373099992 |
  | `johansson-town` | 354239866 |
  | `jojo-shorts` | 367849285 |
  | `town-mcp-smoke` | 375061040 |
  | `town-window-review` | 359729840 |

- **Pull requests (D10):** close the stale World pull requests with a pointer: #155, #152, #128, #127, #125, #124, #119, #111, #103, #101, #100, #97, #68, #67, #66, #53 and #50. PR #160 is merged before T0 or ported after the freeze.
- **Issue #132:** transfer it to `johansson-studio` (GraphQL `transferIssue`, or the creator's "Transfer issue").
- **Codex** opens its pull requests on the new repositories (creator step 16).
- **The work branch** stays as a read-only archive, tagged at T0. `split/runbook` stays.
- **Documents:** the CLAUDE.md files (§10), session setup (§11) and the follow-ups (§12).

---

## 6. Workflows, scripts and pages (sketches; Claude completes and tests them)

`actions/checkout@v6` and `actions/setup-node@v6` are already used in this repository. For `upload-pages-artifact`, `deploy-pages` and `cache`, Claude first checks the newest major release (`gh api repos/actions/deploy-pages/releases/latest --jq .tag_name`); the sketches say `@v4`.

### 6.1 Import job (the first commit of each empty repository)

```yaml
# .github/workflows/import.yml: pushed together with .github/import.json and nothing else
#   {"source_sha": "<40-hex commit of nj22az/nj22az.github.io>", "layout": "world" | "studio" | "sjoskolan",
#    "target": "rehearsal" | "main", "history": "<optional: where the earlier commits are>"}
name: Import from nj22az.github.io
on: { push: { branches: [main], paths: ['.github/import.json'] }, workflow_dispatch: {} }
permissions: { contents: write }
jobs:
  import:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v6
      - name: One commit whose files are exactly the source folders, proved by object ids
        run: |
          set -euo pipefail
          j() { jq -r "$1" .github/import.json; }
          SRC=$(j .source_sha); LAYOUT=$(j .layout); TARGET=$(j '.target // "main"'); HIST=$(j '.history // empty')
          [[ $SRC =~ ^[0-9a-f]{40}$ && $TARGET =~ ^(main|rehearsal)$ ]]
          git fetch -q --no-tags --depth=1 https://github.com/nj22az/nj22az.github.io "$SRC"
          sub() { printf '040000 tree %s\t%s\n' "$(git rev-parse "$SRC:$1")" "$1"; }
          case "$LAYOUT" in
            world)     { git ls-tree "$SRC:johansson-town"; sub thuans-storage; sub motor-90l; } ;;
            studio)    git ls-tree "$SRC:avatar-creator" ;;
            sjoskolan) { sub sjoskolan; sub elteknik; sub ellab; } ;;
            *) echo "::error::unknown layout $LAYOUT"; exit 1 ;;
          esac > copied
          if cut -f2 copied | sort | uniq -d | grep -q . || cut -f2 copied | grep -qx '.github'; then
            echo '::error::a copied name clashes'; exit 1; fi
          tree=$(cat copied <(git ls-tree HEAD .github) | git mktree)
          commit=$(git -c user.name='github-actions[bot]' -c user.email='41898613+github-actions[bot]@users.noreply.github.com' \
            commit-tree "$tree" -p HEAD -m "Import $LAYOUT from nj22az/nj22az.github.io@$SRC" \
            -m "An exact copy of the live folders at that commit.${HIST:+ Earlier history: $HIST}")
          diff <(sort copied) <(git ls-tree "$commit" | grep -v $'\t.github$' | sort)   # same ids = same bytes
          echo "files: $(git ls-tree -r "$commit" | grep -vc $'\t.github/')"
          if [ "$TARGET" = main ]; then git push origin "$commit:refs/heads/main"
          else git push -f origin "$commit:refs/heads/rehearsal"; fi           # the rehearsal is rebuilt at will
```

- `.github/` is unchanged from the parent commit, so `GITHUB_TOKEN` may push the result, and that push starts no other workflow.
- The largest file in any tree is 36.8 MB, under GitHub's 100 MB limit. No LFS is involved.
- **The bootstrap must be the repository's first commit.** That is why creator step 3 leaves the README unticked. If a README was made anyway, Claude commits the bootstrap on top of it; the import tree drops it.
- **Fallback, if Actions is unavailable:** run the same `ls-tree`, `mktree` and `commit-tree` lines in a session after `git fetch --depth=1` (about 0.8 GB free), then push through the git proxy.

### 6.2 World: `tools/site/assemble.sh`

```bash
#!/usr/bin/env bash
# tools/site/assemble.sh [out | --list]: the published site = every tracked file except the work folders.
# A denylist, so a new runtime file is never left out; tools/site/smoke.mjs fails if a page needs something removed.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
drop='^(\.github/|\.claude/|\.mcp\.json$|\.gitignore$|CLAUDE\.md$|AGENTS\.md$|package(-lock)?\.json$|vite\.config\.js$|docs/|art/|tests/|output/|briefs/|scripts/|tools/|thuans-storage/(tests|scripts)/)|\.test\.mjs$'
keep='^(tools/vendor/|docs/SPECTOR-LICENSE\.txt$)'
files() { { git ls-files | grep -E -v "$drop"; git ls-files | grep -E "$keep"; } | sort -u; }
if [ "${1-}" = --list ]; then files; exit 0; fi
out=${1:-_site}; rm -rf "$out"; mkdir -p "$out"
files | tr '\n' '\0' | xargs -0 cp --parents -t "$out"
printf '{"repo":"%s","sha":"%s","run":"%s"}\n' "${GITHUB_REPOSITORY:-local}" "$(git rev-parse HEAD)" "${GITHUB_RUN_ID:-}" > "$out/version.json"
```

The Pages artifact drops hidden files. The only one is `runtime/.vite/manifest.json`, which only the build script and a test read.

### 6.3 `tools/site/smoke.mjs` (World and Studio)

- **Usage:** `node tools/site/smoke.mjs <dir>` serves `<dir>` locally at the site's own path (`/johansson-world/` or `/johansson-studio/`) and answers 404 for anything else. `--base https://nj22az.github.io` tests the live site instead.
- **Browsers:** Chromium and WebKit through Playwright 1.61.0. `--chromium-only` is for sessions, which have no WebKit; the WebKit leg runs in Actions.
- **World:**
  - the title page;
  - the game (`?audit`, waiting for `window.__JOHANSSON_RUNNING__` and `__JOHANSSON_AUDIT__`, as `tools/mcp/session.mjs` does);
  - the creator (`creator/`);
  - Thuan's Storage, opened the way `activities.js` opens it, until `src/dungeon/pretend.js` and `models/thuan.glb` have loaded;
  - Motor 90L's two pages, until `src/avatars/build.js` has loaded.
- **Studio:** open `/johansson-studio/`, choose "Use in scene", pick every location, and wait until the picture is not busy. `scratchpad/split/studio-runtime-trace.mjs` is the template.
- **It fails on:**
  - a page error;
  - a failed request, or a status of 400 or more, under the site's own path;
  - any same-origin request outside it that is not a contract (`/stepbuddy/`, `/form-3d-studio/`, `/assets/images/apple-touch-icon.png`, `/assets/images/favicon.svg` and the other site's own address).

### 6.4 World: `.github/workflows/pages.yml`

```yaml
name: Test and publish Johansson World
on: { push: { branches-ignore: [site] }, pull_request: {}, workflow_dispatch: {} }   # tests on every branch (the rehearsal too); deploys from main
permissions: { contents: read }
concurrency: { group: 'pages-${{ github.ref }}', cancel-in-progress: false }
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 40
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: '24', package-manager-cache: false }
      - run: npm ci --ignore-scripts --no-audit --no-fund
      - name: The decorator is off on the live site
        run: node --test tests/live-features.test.mjs
      - name: Game tests (fresh runtime build, portraits, Studio data files, the format freeze until the switch)
        run: npm test
      - name: Thuan's Storage and Motor 90L
        run: node --test thuans-storage/tests/*.test.mjs motor-90l/*.test.mjs
      - run: bash tools/site/assemble.sh _site
      - uses: actions/cache@v4
        with: { path: ~/.cache/ms-playwright, key: "pw-${{ hashFiles('package-lock.json') }}" }
      - run: npx playwright install --with-deps chromium webkit
      - name: Smoke test of the published files (Chromium and WebKit)
        run: node tools/site/smoke.mjs _site
      - name: Storage's hand-off, end to end
        run: node tests/storage-boss.browser.mjs
      - if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v4
        with: { path: _site }
  deploy:
    if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    timeout-minutes: 40
    permissions: { pages: write, id-token: write }
    environment: { name: github-pages, url: '${{ steps.d.outputs.page_url }}' }
    steps:
      - name: Wait until Pages is switched on (Settings → Pages → Source: GitHub Actions)
        env: { GH_TOKEN: '${{ github.token }}' }
        run: |
          for i in $(seq 180); do
            code=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $GH_TOKEN" "https://api.github.com/repos/$GITHUB_REPOSITORY/pages")
            [ "$code" = 200 ] && exit 0
            [ "$code" = 404 ] || { echo "Pages API answered $code; trying the deploy"; exit 0; }
            sleep 10
          done; echo '::error::Pages is still switched off'; exit 1
      - id: d
        uses: actions/deploy-pages@v4
      - name: Live only when the site itself reports this commit
        run: |
          for i in $(seq 60); do
            curl -fsS "https://nj22az.github.io/johansson-world/version.json?n=$i" | grep -q "$GITHUB_SHA" && exit 0; sleep 5
          done; echo "::error::deployed, but version.json does not show $GITHUB_SHA yet"; exit 1
  studio-on-this-world:   # advisory: tells World's author early when Studio's next World update will need a Studio change
    runs-on: ubuntu-latest
    continue-on-error: true
    timeout-minutes: 25
    steps:
      - uses: actions/checkout@v6
        with: { path: johansson-world }
      - uses: actions/checkout@v6
        with: { repository: nj22az/johansson-studio, path: johansson-studio }
      - uses: actions/setup-node@v6
        with: { node-version: '24', package-manager-cache: false }
      - run: |
          ln -s ../johansson-world johansson-studio/world
          (cd johansson-studio && npm ci --ignore-scripts --no-audit --no-fund && node --test tests/*.test.mjs)
          (cd johansson-world && npm ci --ignore-scripts --no-audit --no-fund && STUDIO_DIR=../johansson-studio node --test tests/studio-*.test.mjs)
```

**Optional:** World can get the same `site` mirror as Sjöskolan (§6.6), so that it can publish during an Actions outage. The tree is built from `git ls-tree -r HEAD`, filtered like `assemble.sh`, into a temporary index (`git update-index --index-info` accepts `ls-tree` lines). It is added only if the creator wants it.

### 6.5 Studio: the pin, `get-world`, the page, `pages.yml` and `follow-world.yml`

`world.lock.json`:

```json
{
  "repo": "nj22az/johansson-world",
  "commit": "<40-hex: a commit on World's main that World has published>",
  "paths": ["/package.json", "/src/", "/vendor/", "/assets/", "/creator/", "/data/", "/tools/vendor/", "/*.js", "/*.css",
            "/LICENSE*", "/THIRD_PARTY_NOTICES.md", "/RESOURCE_SOURCES.md", "/tests/fixtures.mjs",
            "/tools/mcp/static-server.mjs", "/tools/studio/"]
}
```

- The patterns cover whole folders, because the code Studio reaches can stream assets that the runtime trace did not request.
- `/package.json` gives `world/` World's own `"type": "module"`.
- The last two entries serve Studio's browser tests only (`studio-agent.browser.mjs` uses World's static server and `build-data.mjs`, which imports `repo.mjs` and `src/studio/sha256.js`). They are never published.

```sh
#!/bin/sh
# tools/get-world.sh: puts the World Studio runs on in ./world (git-ignored)
#   (no argument)  the commit in world.lock.json, only its paths (about 90 MB)
#   <commit>       another World commit, to try it before pinning
#   --link [dir]   ./world becomes a link to a World clone (default ../johansson-world), to work on both at once
set -eu
cd "$(dirname "$0")/.."
if [ "${1-}" = --link ]; then rm -rf world; ln -s "${2:-../johansson-world}" world; exit 0; fi
sha=${1:-$(node -p "require('./world.lock.json').commit")}
rm -rf world && git init -q world
git -C world remote add origin https://github.com/nj22az/johansson-world     # a named remote: a partial fetch needs one
node -p "require('./world.lock.json').paths.join('\n')" | git -C world sparse-checkout set --no-cone --stdin
git -C world fetch -q --depth=1 --filter=blob:none origin "$sha"
git -C world checkout -q FETCH_HEAD
```

Studio's `index.html` head:

```html
<base href="/johansson-studio/world/">  <!-- World's assetURL() and document.baseURI resolve inside the pinned copy -->
<link rel="canonical" href="https://nj22az.github.io/johansson-studio/">
<link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">   <!-- main-site contract -->
<link rel="apple-touch-icon" href="assets/icons/town-192.png">               <!-- through the base -->
<link rel="stylesheet" href="creator/creator.css"><link rel="stylesheet" href="line-ui.css">
<link rel="stylesheet" href="/johansson-studio/studio.css?v=…"><link rel="stylesheet" href="/johansson-studio/scene.css?v=…">
<script type="module" src="/johansson-studio/studio.js?v=…"></script>
```

**`tools/site/assemble.sh` (Studio):**
- Copy Studio's tracked files, except `.github/`, `.claude/`, `tests/`, `docs/`, `tools/`, the package files, `world.lock.json`, `CLAUDE.md`, `AGENTS.md` and `WHERE-TO-EDIT.md`.
- Then copy `world/` with `rsync -aL --exclude .git --exclude '/tests/' --exclude '/package.json' --include '/tools/' --include '/tools/vendor/***' --exclude '/tools/**' world/ "$out/world/"`.
- Write `version.json` as `{repo, sha, world}`.
- It refuses to run if `world/` is missing.

**`pages.yml` (Studio)** has the same shape as World's, without the advisory job. Its test job:
1. Reads `commit` and `paths` from `world.lock.json`.
2. On `main` only, checks that the pin is on World's main: `GET /repos/nj22az/johansson-world/compare/<commit>...main` must answer `ahead` or `identical`. The rehearsal branch and pull requests may pin anything.
3. Checks out World with `actions/checkout@v6`, using `repository: nj22az/johansson-world`, `ref: <commit>`, `path: world`, `sparse-checkout: <paths>` and `sparse-checkout-cone-mode: false`.
4. Runs `npm ci`, the unit tests, the browser tests, assemble, the Chromium and WebKit smoke (Build scene, every location), then uploads.

The deploy job waits for Pages and reads `/johansson-studio/version.json` back.

```yaml
# .github/workflows/follow-world.yml: Studio follows the World that is live, but only when Studio's tests pass on it
name: Follow World
on: { schedule: [{ cron: '17 * * * *' }], workflow_dispatch: {} }   # hourly; ends in seconds when World has not changed
permissions: { contents: write, actions: write, issues: write }
concurrency: { group: follow-world, cancel-in-progress: false }
jobs:
  follow:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v6
      - id: live
        run: |
          live=$(curl -fsS "https://nj22az.github.io/johansson-world/version.json?t=$(date +%s)" | jq -r .sha)
          [[ $live =~ ^[0-9a-f]{40}$ ]]
          echo "commit=$live" >> "$GITHUB_OUTPUT"
          { [ "$live" = "$(jq -r .commit world.lock.json)" ] && echo changed=false || echo changed=true; } >> "$GITHUB_OUTPUT"
          { echo 'paths<<EOF'; jq -r '.paths[]' world.lock.json; echo EOF; } >> "$GITHUB_OUTPUT"
      - if: steps.live.outputs.changed == 'true'
        uses: actions/checkout@v6
        with: { repository: nj22az/johansson-world, ref: '${{ steps.live.outputs.commit }}', path: world,
                sparse-checkout: '${{ steps.live.outputs.paths }}', sparse-checkout-cone-mode: false }
      - if: steps.live.outputs.changed == 'true'
        uses: actions/setup-node@v6
        with: { node-version: '24', package-manager-cache: false }
      - if: steps.live.outputs.changed == 'true'
        name: Studio's tests and smoke test on the World that is live now
        run: |
          npm ci --ignore-scripts --no-audit --no-fund && node --test tests/*.test.mjs
          bash tools/site/assemble.sh _site && npx playwright install --with-deps chromium && node tools/site/smoke.mjs _site --chromium-only
      - if: steps.live.outputs.changed == 'true'
        name: Pin it, then publish (a push made with GITHUB_TOKEN starts no workflow; a dispatch does)
        env: { LIVE: '${{ steps.live.outputs.commit }}', GH_TOKEN: '${{ github.token }}' }
        run: |
          jq --arg c "$LIVE" '.commit=$c' world.lock.json > lock.tmp && mv lock.tmp world.lock.json
          git -c user.name='github-actions[bot]' -c user.email='41898613+github-actions[bot]@users.noreply.github.com' \
            commit -qm "Follow World ${LIVE::8}" world.lock.json
          for i in 1 2 3; do git push -q origin HEAD:main && break; sleep $((i*5)); git pull -q --rebase origin main; done
          gh workflow run pages.yml --ref main
      - if: failure() && steps.live.outputs.changed == 'true'
        env: { GH_TOKEN: '${{ github.token }}', LIVE: '${{ steps.live.outputs.commit }}' }
        run: |
          t="World ${LIVE::8} needs a Studio change"
          [ "$(gh issue list --state open --search "\"$t\" in:title" --json number --jq length)" = 0 ] &&
            gh issue create --title "$t" --body "Studio stays on its pinned World until this is fixed. Run: $GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID" || true
```

- **A change that needs both World and Studio:** push World first and wait for its publish. Then make one Studio commit holding the Studio change, `npm run world -- <new sha>` and the new lock.
- **Scheduled workflows** stop after 60 days without repository activity. The "Follow World" commits count as activity; if the schedule is ever disabled, run it once by hand.

### 6.6 Sjöskolan: `pages.yml`, `bygg-site.sh`, `site-branch.sh` and `sitecheck.py`

```yaml
# .github/workflows/pages.yml (sjoskolan): added in the go-live commit (step 6.4)
name: Publicera Sjöskolan
on:
  push: { branches: [main] }
  workflow_dispatch:
    inputs:
      utan_kontroller: { description: 'Nödläge: publicera utan kontroller', type: boolean, default: false }
permissions: { contents: read }
concurrency: { group: pages, cancel-in-progress: false }
jobs:
  kontroller:
    if: ${{ !inputs.utan_kontroller }}
    uses: ./.github/workflows/sjoskolan.yml       # sjoskolan.yml has "workflow_call:" in its "on:"
    secrets: inherit                               # LARARLOSEN
  bygg:
    needs: kontroller
    if: ${{ !cancelled() && (needs.kontroller.result == 'success' || (needs.kontroller.result == 'skipped' && inputs.utan_kontroller)) }}
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v6
      - run: bash tools/bygg-site.sh _site
      - run: python3 tools/sitecheck.py _site
      - uses: actions/upload-pages-artifact@v4
        with: { path: _site }
  publicera:
    needs: bygg
    if: ${{ !cancelled() && needs.bygg.result == 'success' }}
    runs-on: ubuntu-latest
    timeout-minutes: 40
    permissions: { pages: write, id-token: write }
    environment: { name: github-pages, url: '${{ steps.d.outputs.page_url }}' }
    steps:
      # 1. "Wait until Pages is switched on": the same step as World's (§6.4)
      # 2. actions/deploy-pages (id: d)
      # 3. read https://nj22az.github.io/sjoskolan/publicerad.json until it shows $GITHUB_SHA
  spegel:   # the published site on the branch "site": how /sjoskolan/ is published when Actions cannot run (step 6.9)
    needs: publicera
    if: ${{ !cancelled() && needs.publicera.result == 'success' }}
    runs-on: ubuntu-latest
    permissions: { contents: write }
    steps:
      - uses: actions/checkout@v6
      - run: git push -f origin "$(bash tools/site-branch.sh):refs/heads/site"
```

```bash
#!/usr/bin/env bash
# tools/bygg-site.sh [_site]: webbplatsen = samma filer som /sjoskolan/ serverar i dag, plus boken och EL-LABB.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
out=${1:-_site}; rm -rf "$out"; mkdir -p "$out"
git archive HEAD sjoskolan | tar -x --strip-components=1 -C "$out"   # sjoskolan/X -> /sjoskolan/X
git archive HEAD elteknik ellab | tar -x -C "$out"                      # -> /sjoskolan/elteknik/, /sjoskolan/ellab/
printf '{"repo":"%s","commit":"%s","byggd":"%s"}\n' "${GITHUB_REPOSITORY:-lokal}" "$(git rev-parse HEAD)" "$(date -u +%FT%TZ)" > "$out/publicerad.json"
```

```bash
#!/usr/bin/env bash
# tools/site-branch.sh: prints a commit whose files are exactly the published site, built from git objects only
# (no checkout, no disk; a blobless clone is enough): sjoskolan/* at the root, elteknik/, ellab/, publicerad.json, .nojekyll.
# pages.yml pushes it to the branch "site" after every publish; Claude runs it in a session when Actions cannot.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
sha=$(git rev-parse HEAD)
pub=$(printf '{"repo":"nj22az/sjoskolan","commit":"%s","byggd":"%s","via":"site"}\n' "$sha" "$(date -u +%FT%TZ)" | git hash-object -w --stdin)
nojekyll=$(git hash-object -w --stdin </dev/null)
tree=$({ git ls-tree "$sha:sjoskolan"; git ls-tree "$sha" elteknik ellab
         printf '100644 blob %s\tpublicerad.json\n100644 blob %s\t.nojekyll\n' "$pub" "$nojekyll"; } | git mktree)
git -c user.name='github-actions[bot]' -c user.email='41898613+github-actions[bot]@users.noreply.github.com' \
  commit-tree "$tree" -m "The published site of nj22az/sjoskolan@$sha"
```

- No root name collides (checked: `sjoskolan/` has no `elteknik`, `ellab`, `publicerad.json`, `404.html` or dotfiles).
- The `site` push sends only trees, two small blobs and a commit, because the remote already holds every file.
- `sjoskolan.yml` and `multimeter-browser.yml` ignore the `site` branch.

**`tools/sitecheck.py`** reads every `href` and `src` in the published HTML. Each same-site URL must meet one of these:
- it resolves inside `_site` (`/sjoskolan/X` maps to `_site/X`);
- it is on `tools/huvudsajten.txt` (`/`, `/assets/images/apple-touch-icon.png`, `/assets/js/shopify-book-price.js`, `/blog/…`);
- it is on `tools/kanda-fel.txt`, the links already broken at import. That list may only shrink.

### 6.7 Forwarding pages (main site)

**Plain forwarding page:** the same file with its own target, for:

| File | Target |
|---|---|
| `avatar-creator/index.html` | `/johansson-studio/` |
| `thuans-storage/index.html` | `/johansson-world/thuans-storage/` |
| `motor-90l/index.html` | `/johansson-world/motor-90l/` |
| `motor-90l/workshop/index.html` | `/johansson-world/motor-90l/workshop/` |
| `mizuhama-1988/index.html` | `/johansson-world/` |
| `elteknik/index.html` (Phase 6) | `/sjoskolan/elteknik/` |
| `ellab/index.html` (Phase 6) | `/sjoskolan/ellab/` |

```html
<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<meta name="moved-to" content="/johansson-studio/"><title>Johansson Studio has moved</title>
<link rel="canonical" href="https://nj22az.github.io/johansson-studio/">
<script>location.replace('/johansson-studio/' + location.search + location.hash);</script>
<noscript><meta http-equiv="refresh" content="0;url=/johansson-studio/"></noscript>
</head><body><p>Johansson Studio has moved to <a href="/johansson-studio/">nj22az.github.io/johansson-studio</a>.</p></body></html>
```

If the c→d test (Studio's kind of icon) lost storage, `avatar-creator/index.html` gets the same icon branch as World's page below, instead of the one-line `location.replace`.

**World forwarding page:** one file, used as both `johansson-town/index.html` and `johansson-town/creator/index.html`.
- It returns 200, and keeps the path, query and hash.
- It removes the old worker and its caches, and leaves saved games alone.
- In a Home Screen icon it can stay in place and show the new World in a frame, so that the icon keeps its own saves.

```html
<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<meta name="moved-to" content="/johansson-world/"><title>Johansson World has moved</title>
<link rel="canonical" href="https://nj22az.github.io/johansson-world/">
<noscript><meta http-equiv="refresh" content="0;url=/johansson-world/"></noscript>
<style>iframe{position:fixed;inset:0;width:100%;height:100%;border:0}</style>
</head><body><p>Johansson World has moved to <a href="/johansson-world/">nj22az.github.io/johansson-world</a>. Your saved game comes along.</p>
<script>
(function () {
  var FRAME_IN_ICON = false;   // true only if the iPad tests (steps 1.6 and 3.11) lost saves outside the icon's scope
  var to = '/johansson-world/' + location.pathname.replace(/^\/johansson-town\/?/, '').replace(/index\.html$/, '') + location.search + location.hash;
  var icon = navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  var done = false;
  function go() {
    if (done) return; done = true;
    if (!(FRAME_IN_ICON && icon)) { location.replace(to); return; }
    var f = document.createElement('iframe');   // the icon stays inside its own scope, so it keeps its own saves
    f.src = to; f.allow = 'fullscreen; autoplay; gamepad'; f.setAttribute('allowfullscreen', '');
    document.body.replaceChildren(f);
  }
  setTimeout(go, 1500);
  var jobs = [];
  if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) jobs.push(navigator.serviceWorker.getRegistrations().then(function (rs) {
    return Promise.all(rs.filter(function (r) { return new URL(r.scope).pathname.indexOf('/johansson-town/') === 0; }).map(function (r) { return r.unregister(); }));
  }));
  if (window.caches) jobs.push(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('johansson-town-') === 0; }).map(function (k) { return caches.delete(k); }));
  }));
  Promise.all(jobs).then(go, go);
})();
</script></body></html>
```

With the icon branch on, the old icon needs a connection to start, because the old worker and its cache are gone. The creator can move to a new icon whenever they like (export, then import).

### 6.8 Workers

**The kill switch, `johansson-town/sw.js` on main.** A 404 would not remove a service worker. The kill switch **never moves a window**:
- Browsers check a worker for updates when a page in its scope is visited, and World's `pwa.js` also calls `reg.update()` on load, on focus and when back online, with `updateViaCache:'none'`. So the first launch of an old Home Screen icon after the switch installs the kill switch.
- If the kill switch navigated, it would carry the icon's window out of its scope, which the icon branch (§6.7) exists to prevent.
- It would also cut short a game in progress, bypassing World's own "Town updated · save & reopen" button (`pwa.js:9`).

```js
// Johansson World moved to /johansson-world/. This replaces the old game's offline worker: it deletes the old caches
// (johansson-town-*) and removes itself. It never moves a window: an open game keeps running and offers its own
// "Town updated · save & reopen", and the forwarding page decides where a visit goes. Saved games are not touched.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const name of await caches.keys()) if (name.startsWith('johansson-town-')) await caches.delete(name);
  await self.registration.unregister();
})()));
```

**World's own `sw.js` (step 2.4).** Change the prefix, and add one line at the top of the fetch handler, after the existing same-scope test:

```js
const PREFIX='johansson-world-';
// …in the fetch handler:
if(/^(thuans-storage|motor-90l)\//.test(url.href.slice(SCOPE.length)))return;   // their own pages: never cached, never replaced by the title page
```

### 6.9 `404.html` (main site root; none exists today)

```html
<script>
(function () {   // pages that moved to their own repositories; page visits only
  var moved = [['/johansson-town/', '/johansson-world/'], ['/avatar-creator/', '/johansson-studio/'],
               ['/thuans-storage/', '/johansson-world/thuans-storage/'], ['/motor-90l/', '/johansson-world/motor-90l/']];
  // Phase 6 adds ['/elteknik/', '/sjoskolan/elteknik/'] and ['/ellab/', '/sjoskolan/ellab/']
  var p = location.pathname;
  for (var i = 0; i < moved.length; i++) { var from = moved[i][0];
    if (p === from.slice(0, -1) || p.indexOf(from) === 0) { location.replace(moved[i][1] + p.slice(from.length) + location.search + location.hash); return; } }
})();
</script>
```

- After the script comes a plain "Page not found" page, in the site's colours (light and dark), with a link to the front page.
- No target is also a source, so the map cannot loop.
- It helps page visits only. Modules, images and downloads cannot follow it, which is why old files stay frozen for 14 days.

### 6.10 Site guard on the main site

```yaml
# .github/workflows/site-guard.yml: lists in .github/site-guard/{reserved,keep,moved}.txt
name: Site guard
on: { push: { branches: [main] }, pull_request: {} }
permissions: { contents: read }
jobs:
  guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with: { filter: 'blob:none', sparse-checkout: .github, fetch-depth: 2 }
      - env: { BEFORE: '${{ github.event.before || github.event.pull_request.base.sha }}' }
        run: |
          set +e; bad=0; L=.github/site-guard
          while read -r d; do [ -n "$d" ] && git cat-file -e "HEAD:$d" 2>/dev/null && { echo "::error::$d/ is its own repository; never a folder here"; bad=1; }; done < $L/reserved.txt
          while read -r f; do [ -n "$f" ] && ! git cat-file -e "HEAD:$f" 2>/dev/null && { echo "::error::$f is a forwarding page or a file other sites use; keep it"; bad=1; }; done < $L/keep.txt
          git cat-file -e "$BEFORE^{commit}" 2>/dev/null || git fetch -q --depth=1 --filter=blob:none origin "$BEFORE" || true
          if git cat-file -e "$BEFORE^{commit}" 2>/dev/null; then
            edits=$(git diff --name-only --diff-filter=AMR "$BEFORE" HEAD -- $(cat $L/moved.txt) | grep -v -x -F -f $L/keep.txt || true)
            [ -n "$edits" ] && { echo "::error::edited in a moved folder (edit it in its own repository; see CLAUDE.md):"; echo "$edits"; bad=1; }
          fi
          exit $bad
```

The lists grow in stages:

| When | `reserved.txt` | `moved.txt` | `keep.txt` |
|---|---|---|---|
| T0 (step 3.4) | `johansson-world` | `johansson-town`, `avatar-creator`, `thuans-storage`, `motor-90l` | empty |
| Switch (step 4.2) | adds `johansson-studio` | – | the forwarding pages and contract files of §3.4 |
| Step 6.6 | – | adds `sjoskolan`, `elteknik`, `ellab` | adds the new forwarding pages and the two frozen book files |
| Step 6.7 | adds `sjoskolan` | – | – |

Deletions are allowed, so the clean-up commits pass. The guard cannot block a direct push. It turns the run red and names the file, and the drift and port checks (steps 4.1, 5, 6.7) catch the rest.

### 6.11 Porting late work

The base is `$MAIN_SHA` for commits on main, `$BRANCH_SHA` for the work branch, and the fork point for a side branch. Fetch the newer commits shallowly first (`git fetch --depth=50 origin <tip>`).

```bash
# 1. Commits, World. runtime/ and sw.js are generated: never ported, rebuilt afterwards.
git format-patch --full-index --binary --stdout $BASE..<tip> -- johansson-town ':!johansson-town/runtime' ':!johansson-town/sw.js' \
  | git -C ../johansson-world am -p2 --3way
git format-patch --full-index --binary --stdout $BASE..<tip> -- thuans-storage motor-90l | git -C ../johansson-world am --3way
# 2. Commits, Studio: apply them as they are. The import commit holds the old text, so --3way merges around commit B's
#    rewrite; then re-run the step 2.5 rewrite on the files they touched, and resolve what it reports.
git format-patch --full-index --binary --stdout $BASE..<tip> -- avatar-creator | git -C ../johansson-studio am -p2 --3way
# 3. Uncommitted work in an old clone (untracked files included):
git add -N johansson-town && git diff --full-index --binary -- johansson-town ':!johansson-town/runtime' ':!johansson-town/sw.js' \
  | git -C ../johansson-world apply -p2 --3way
# 4. Sjöskolan re-sync in the window (paths unchanged; in ANDRINGSLOGG.md keep both lines):
git diff --full-index --binary $SJO_SHA origin/main -- sjoskolan elteknik ellab | git -C ../sjoskolan apply --3way
```

- **After any World port:** keep the new repository's side of generated lines (runtime file names in `index.html`), then run `npm run build:runtime` and `npm test`, and commit `runtime/`.
- **Merge commits are skipped by `format-patch`.** So check the result file by file: for each file the port touched, `git rev-parse <tip>:johansson-town/<file>` in the old repository equals `git rev-parse HEAD:<file>` in World. The exception is the files that commits A to D changed.

### 6.12 Probes and the iPad scope tests (temporary, on main)

**Probes on Studio's address:**

| Probe | When | Question | Reading |
|---|---|---|---|
| P1 | After creator step 5 | Does switching Pages on (no deploy yet) take `/johansson-studio/`? | `user-only.txt` keeps answering for 10 minutes = no. Information only; deploy jobs wait for Pages either way |
| P2 | After Studio's first deploy (step 3.7) | Does the project serve, and does main fill the gaps? | `version.json` 200 = the project serves. `user-only.txt` 200 = mixing, 404 = the project takes the whole path |
| P3 | Step 3.7: a main commit adds `johansson-studio/index.html` ("Main-site probe: if you see this, the main site wins"); checked after that build, after one more unrelated main build, and again after the switch build (step 4.3) | For a file both sides have, which wins, and does a later main build take the path back? | `/johansson-studio/` shows Studio every time = the project wins (Sjöskolan variant A). The probe page at any check = the main site or the last build wins: delete `johansson-studio/` from main at once; Sjöskolan defaults to variant B |
| P4 | Sitting 2 (step 3.11); required whenever P3 showed that the project wins (variant A) | Does "Unpublish site" release the path? If not, does a rename? | The main probe page appears within 10 minutes = yes. Record the minutes; this is Sjöskolan's emergency undo in variant A (step 6.9). In variant B the undo is reverting main's deletion instead, because the main site wins, so P4 is not needed |

**The iPad scope tests** (step 1.6, when D7 is yes or unknown):
- **`scope-test/a/`, built like World:**
  - `manifest.webmanifest` (`{"name":"Scope test","start_url":"./","scope":"./","display":"standalone"}`);
  - World's head lines for the icon;
  - copies of World's `pwa.js` and `sw.js` with the cache prefix `scope-test-`, so it has the real worker and its update checks.

  It writes `localStorage['scope-test-a']` = the time, shows the time and `navigator.standalone`, and has a link "Go to the next page" (`/scope-test/b/`, outside its scope) and a button "Open the next page in a frame".
- **`scope-test/b/`** shows `localStorage['scope-test-a'] || 'empty'`, its own URL and `navigator.standalone`.
- **`scope-test/c/`, built like Studio:** Studio's head lines, with **no** manifest (only `apple-mobile-web-app-title` and an icon). It writes `localStorage['scope-test-c']`, with a link to `/scope-test/d/`.
- **`scope-test/d/`** shows `localStorage['scope-test-c'] || 'empty'`.
- **How to read the result:**
  - If the next page shows the first page's time inside the icon's window, a plain forwarding page keeps that kind of icon's saves.
  - If it shows "empty", or opens a Safari sheet, use the icon branch (§6.7): for World if a→b failed, for Studio if c→d failed.

**The iPad dress rehearsal** (step 3.11, if icons are used):
1. One main commit replaces `scope-test/a/sw.js` with the kill switch (prefix `scope-test-`), and `scope-test/a/index.html` with the World forwarding page, its two addresses changed to `/scope-test/a/` → `/scope-test/b/` and its icon branch set from the a→b result.
2. The creator opens the a icon, which updates its worker on launch, as World's does.
3. Expected: the window stays inside the icon (no Safari sheet), and b (redirected or framed) shows a's time.

### 6.13 jojo (one commit, step 3.9)

The rule: each tool reads one variable per repository (`WORLD_DIR`, `STUDIO_DIR`, `SJOSKOLAN_DIR`). If it is not set, the tool uses the sibling clone (`../johansson-world`), then `~/johansson-world`. The old names `TOWN`, `TOWN_SITE` and `JOJO_MATERIAL` keep working, with a note.

| File(s) | Change |
|---|---|
| `remotion/tools/sync-town.sh:4,7` | `TOWN="${TOWN:-${WORLD_DIR:-$HERE/../../johansson-world}}"`. Paths inside `src/` are unchanged |
| `remotion/tools/room-colliders.mjs:5,11`, `town-studio/modeller/tools/keep-clear.mjs:5,17` | The same default |
| `remotion/tools/capture-{room,office,workshop}.mjs` | Serve the parent folder and open `/johansson-world/?audit…`; in-page `/johansson-world/vendor/three.module.js`. The `johansson-town-clock` key is unchanged |
| `town-studio/townstudio/town.py:14-31` | `TOWN_FOLDER=''`. Find World by `$WORLD_DIR`, `../johansson-world` or `~/johansson-world`. Pushing World's `main` publishes after its tests. The Mac needs the clone (creator step 16) |
| `town-studio/townstudio/assets.py` | `CATALOG='assets/catalog'`; `--world` replaces `--site`; `tests/test_assets.py` follows |
| `server.py`, `headless.py`, `mcp_server.py`, `app.py`, `build_page.py` | `TOWN_SITE` becomes `WORLD_DIR`. Serve World at `/johansson-world/`, with `/johansson-town/` as an alias |
| `town-studio/modeller/{build,export,look}.js` | `/johansson-town/…` becomes `/johansson-world/…` |
| `art/pencil/pose.mjs:1,6` | Playwright from `$WORLD_DIR/node_modules`; `/johansson-world/tools/pamphlet-pose.html` |
| `quality/story_engine.py:47` | `ROOT.parent/'johansson-world'`, without the `johansson-town/` prefix |
| `studio/material.py:24`, `studio/studio.py:1036` | `SJOSKOLAN_DIR`, then `../sjoskolan/sjoskolan`, then the old `../nj22az.github.io/sjoskolan` until step 6.7 |
| `remotion/mcp/server.mjs:24,135` and its README | Rename the MCP server to `johansson-shorts`, so it no longer clashes with Studio's `johansson-studio` |
| `CLAUDE.md:9-25`, `content/COMIC-MAKER.md`, `town-studio/progress.md`, `.claude/agents`, `.claude/skills/{comic-layout,film-director}` | New names and paths. Provenance notes such as `nj22az.github.io@281a36bd` stay as they are; `town-studio/evidence/*.mjs` are historical records |

### 6.14 Kill-switch rehearsal (step 2.6; nothing published)

**Setup:**
1. A tiny local server serves a scratch folder at `/`.
2. Put `MAIN_SHA`'s `johansson-town/sw.js`, `pwa.js` and `manifest.webmanifest` there, with a minimal `index.html` that loads `pwa.js` and writes a test save, all at `/johansson-town/`.
3. Open it with a persistent profile, and wait until the worker controls the page and `johansson-town-*` caches exist.
4. Snapshot localStorage.
5. Replace the files with the forwarding page and the kill switch.

**Expectations:**
- **A fresh visit** to `/johansson-town/?avatar=X#h` lands on `/johansson-world/?avatar=X#h`. `getRegistrations()` has nothing for `/johansson-town/`, no `johansson-town-*` cache remains, and localStorage is unchanged.
- **A page already open during the swap** is not navigated, and keeps working. After a focus event it shows "Town updated · save & reopen"; clicking it saves and lands on `/johansson-world/`.
- **An icon, simulated** (`FRAME_IN_ICON = true`, with an init script setting `navigator.standalone = true`): the top URL stays at `/johansson-town/`, the frame shows `/johansson-world/?avatar=X#h`, and the frame reads the test save.

**Browsers:** Chromium in a session. WebKit in a temporary workflow on World's `rehearsal` branch (`npx playwright install --with-deps webkit`), deleted before T0. The real WebKit acceptance test is the iPad (step 3.11).

### 6.15 The format-freeze test (World and Studio; T0 until step 4.5)

- **`tools/format-snapshot.mjs` (World)** prints, as JSON:
  - the stored id lists: `PARTS` and `AGES` (`src/avatars/recipe.js`), `HEAD_FORMS` (`src/avatars/head-profile.js`), and the pose and face names Studio offers (from `src/avatars/animate.js`, `face.js` and `moves.js`);
  - the storage keys (`SAVE_KEY` and `PLAYERS_KEY` in `src/save.js`).
- **`tests/format-freeze.test.mjs`** compares that output with `tests/format-freeze.json`, which is written at T0 (step 3.6).
- **Studio's copy** compares `SCENE_KEY`, `emptyScene().version`, `LOCATIONS` and `KNOWN_POSES`/`KNOWN_EXPRESSIONS` (`scene-model.mjs`, `scene-catalogue.mjs`) with its own snapshot.
- **Any added, removed or renamed id fails the test**, and so the publish (rule 12).
- **Changes to a save's or a scene's structure** that no list shows are covered by the CLAUDE.md rule and by Claude's review of each push in the overlap.

---

## 7. Every old address

| Old address | Kept working by | Goes to |
|---|---|---|
| `/johansson-town/` (`?avatar=`, `?audit`, `#…`) | World forwarding page (200) plus the kill switch | `/johansson-world/` plus query and hash (or framed, in an icon, §6.7) |
| `/johansson-town/creator/?r=CODE` | World forwarding page | `/johansson-world/creator/?r=CODE` |
| Other `/johansson-town/…` pages and files | Frozen files for 14 days, then the `404.html` map for page visits | `/johansson-world/…` |
| `/johansson-town/sw.js` | The kill switch, forever | – |
| `/avatar-creator/?r=CODE`, Studio's icon or bookmark | Forwarding page (with the icon branch if c→d failed); deep paths frozen, then the 404 map | `/johansson-studio/` plus query and hash |
| `/thuans-storage/?from=johansson-town&mode=…&day=…` | Forwarding page (the query is kept, so the night's checkpoint keys still match) | `/johansson-world/thuans-storage/…` |
| `/motor-90l/`, `/motor-90l/workshop/` | Forwarding pages | `/johansson-world/motor-90l/…` |
| `/mizuhama-1988/` | Its existing redirect, repointed | `/johansson-world/` |
| `/sjoskolan/…`, including `gemensamt/Formelsamling.html` (printed QR) and `larare/resultat*.html#r=` (result QR) | The same paths, served by the new repository; main's copy remains the fallback for a week | Unchanged |
| `/elteknik/` (Shopify, printed matter, shares) | Forwarding page, forever | `/sjoskolan/elteknik/` |
| `/elteknik/files/omslag.jpg`, `/elteknik/files/provkapitel.pdf` | Frozen copies, forever | – |
| Other `/elteknik/…` | Frozen until step 6.7, then the 404 map | `/sjoskolan/elteknik/…` |
| `/ellab/` | Forwarding page | `/sjoskolan/ellab/` |

---

## 8. Other writers and in-flight work

The list is rebuilt mechanically at step 0.1 and again at step 3.1. This is today's (11 October, about 09:00 UTC):

| Who | Today | Message |
|---|---|---|
| `session_01G8DAjj6ZCrp3XDhjgmTSXQ` "Island city plan redesign" | Idle since 07:11. It pushes World straight to main, which made publish run 38115920783 fail | Hand-over; it may push to main before the cut-off |
| `session_01SkiPY39K3gDyeDM4v9Fzhc` "Johansson World entry points" | Running | Hand-over, plus: "The split replaces the `johansson-world/` redirect. Title-screen work goes to `johansson-world` once it opens; the portal cards change in the switch commit" |
| `session_01D1tg1djq4ptad7e4BsYje6` "Johansson studio reverse engineering" | Idle since 08:52 (it was fixing Thao's visibility) | Hand-over |
| `session_01AMSbrHVBP6WUGLHVeTe7cH` "Ghidra reverse engineering analysis" | Running (restoring GLB part names) | Hand-over |
| `session_01M3FTXU8R1hkhaHFDtFxYBb` "Johansson graphics engine assets" | Idle since 07:24 | Hand-over |
| `session_015QvftH8zaZX1LxfNX8pcGK` "Ferry audit and NPC staffing" | Idle since 23:37 on 10 October | Hand-over |
| `session_01XfgD2EXg37nRXvWX5dwBii` "Johansson animated logo" | Idle. Branch `claude/johansson-animated-logo` (6 commits, main-site files only) | "Unaffected; merge as usual" |
| `session_01E6DNWu8trXB9zSZC1cgTtp` "Course and courseplan alignment" | Running (Sjöskolan) | Sjöskolan message |
| `session_01RHuRSJ3Hg545ZoiFQegudV` (Cowork on the MacBook) | – | The new names and addresses |
| Codex (as `nj22az`: direct commits to main, and `codex/*` pull requests) | 27 commits authored as `nj22az` since 10 October | Codex message |
| Town Studio on the Mac (jojo, `BRANCH='main'`) | Publishes World to main | Creator step 10, then step 3.9 |
| This container: tasks #30, #31, #34, #35, #39, #40 and #41, and two subagents | 69 uncommitted paths; the local branch is 11 ahead of and 22 behind origin | Land work before T0; the integrator merges (step 3.2); #41's owner does batch P's Studio MCP part (step 0.5) |
| Side branches: `claude/mario-artist-coloring` (2), `claude/animal-crossing-lessons` (3), `claude/catalogue-loader` (2, task #31), `feat/japanese-hair-library` (2, PR #160) | World work not on the work branch | Merged before T0, ported after (tagged `split/side/<name>`), or recorded as abandoned; the creator decides |

**Confirmation** is silence (step 0.1), not replies.

**Hand-over message** (World and Studio sessions):
> Repo split. At T0 (<date, time> UTC), World and Studio stop being edited in nj22az/nj22az.github.io.
>
> **Before T0:**
> - Push finished work to `claude/sjoskolan-youtube-strategy-gofi3o` (or to main, if that is where you work).
> - Push unfinished work to a branch `wip/<your task>`.
> - Leave nothing only in your working tree.
>
> **From T0:**
> - Push nothing there for World or Studio.
> - Wait until main's CLAUDE.md says that nj22az/johansson-world (or johansson-studio) is **open**, then start a new session on that repository. Paths there have no `johansson-town/` prefix; publishing is a push to its main, live when `pages.yml` succeeds.
> - Until the switch, change nothing about how saves, characters or scenes are stored (no new or renamed ids or versions).
>
> The runbook is `RUNBOOK.md` and `STATE.md` on the branch `split/runbook`.

**Sjöskolan message:**
> Unaffected until the Sjöskolan hour (default Saturday 17 October, evening). Before then, merge or close #157 and #158. During that hour, push nothing. Afterwards the course lives in nj22az/sjoskolan, in the same `sjoskolan/` folder and at the same addresses.

**Codex message:**
> From T0, no World or Studio changes in nj22az.github.io. After Claude's word, open them on nj22az/johansson-world or nj22az/johansson-studio.

---

## 9. Undo table

| Step | Live change | Proof | Undo | Time |
|---|---|---|---|---|
| 0.3 simulators' own three.js, week40 fix | Identical bytes from a new path | CI, simulator tests, pages open | `git revert` | about 5 min |
| 0.4 probes and test pages | Small new files | curl | Delete | about 5 min |
| 0.5 batch P | Tooling only | Tests, one render | Revert each | about 5 min |
| 2.x rehearsal | None | CI on `rehearsal` | Copy again | – |
| 3.3 old publishing switched off | None (old copies freeze) | Workflow disabled | Enable (abort rule, step 3.10) | 2 min |
| 3.4 freeze notice and guard | Text and a check | Guard green | Revert | about 5 min |
| 3.5, 6.2 imports | None | Object ids | Copy again | – |
| 3.6, 3.7 World and Studio live | New addresses only | Smoke tests, files, `version.json`, iPad | Republish a good commit, revert, or unpublish | 1–5 min |
| 3.7 probe P3 | A probe page on main | curl | Removed at the switch | – |
| 3.9 jojo | None | Tools run | Revert | – |
| 4.2 switch commit | Old addresses forward; old worker removed | Redirect matrix, worker profile, open-tab check, creator | `git revert` | about 5 min plus cache |
| 5 clean-up | Deep old files reach the 404 map | Port check, map matrix, guard | `git revert` | about 5 min |
| 6.4 Sjöskolan live | `/sjoskolan/` served by the project | Markers, every file, smoke, teacher page, `site` | `site` branch, Unpublish or rename (step 6.9) | 2–10 min |
| 6.5 variant B | Main's copy removed early | Markers | Revert that commit | about 5 min |
| 6.6 `/elteknik/`, `/ellab/` forward; blog links | Forwarding | Matrix, blog check | `git revert` | about 5 min |
| 6.7 main's Sjöskolan copy deleted | None (it is shadowed) | Port check, markers still served | Revert, then step 6.9 | about 10 min |

---

## 10. CLAUDE.md in each repository

**johansson-world**
- **Words.** From the branch's "Words: World and Studio", with the creator's quotes and dates:
  - World is this repository, at `/johansson-world/`. The port town on screen is Minato Machi; "Johansson Town" is the code's old name, which lives on in save keys.
  - Studio is `nj22az/johansson-studio`, "Mario Maker for Johansson World". It pins this repository; World never imports Studio.
  - Assets are built in Studio and assembled here. jojo holds the offline tools.
- **Publishing.**
  - Push to `main`. `pages.yml` tests, then publishes the runtime files only.
  - A change is live only when the run succeeds and `version.json` shows it: `gh api 'repos/nj22az/johansson-world/actions/workflows/pages.yml/runs?per_page=3'`.
  - Run `npm run build:runtime` after editing anything the runtime hash covers (`src/`, `scripts/`, root `*.js`, including `sw.js`). Run `node tools/studio/build-data.mjs` before it when `data/studio/` changed; never hand-edit the generated files.
  - If the advisory "studio-on-this-world" job is red, open the matching Studio change.
- **Until the switch** (delete this in step 4.5): the format freeze (rule 12), enforced by `tests/format-freeze.test.mjs`.
- **Never change:**
  - storage keys, the game id and `from=johansson-town`;
  - the addresses `/johansson-world/`, `creator/?r=`, `?avatar=`, `thuans-storage/`, `motor-90l/(workshop/)` and `version.json`;
  - the cache prefix `johansson-world-`;
  - the contracts `/stepbuddy/`, `/form-3d-studio/` and the main-site icon.
- **Rules.** The full "Johansson Town" rules, verbatim, with paths relative to the repository: storytelling first; no glitches; nothing random; small batches checked in the live game; no shortcuts; plan a change before making it; the town's trade.
- **Tools.**
  - The MCP servers `johansson-town-audit`, and `johansson-studio` until it moves.
  - The local mount `/johansson-world/`, with the alias `/johansson-town/` until §12.
  - Sibling clones in one folder.
  - `FORM3D_DIR` for `scripts/build-workshop-models.mjs`.
  - Thuan's Storage and Motor 90L live here.
- **History:** `nj22az.github.io@split/world-studio-branch` (`docs/history/README.md`).

**johansson-studio**
- The same Words section.
- How Studio gets World: `npm run world`, or `npm run world -- --link` with a sibling clone. The base is `/johansson-studio/world/`; Studio's own URLs stay absolute.
- The coupled-change recipe: World first, then the Studio commit with the new lock. "Follow World" and its issues.
- The format freeze until the switch (delete it in step 4.5). Publishing.
- The creator works on an iPad in Safari (1024×1366).
- Never rename `nj-avatar-studio-v1`, `nj-studio-scene-v1` or `nj-studio-snap`, and never break `?r=` links. `/avatar-creator/` forwards here.

**sjoskolan**
- The site's Sjöskolan rules, verbatim in Swedish: read `ANDRINGSLOGG` first, Övningsinnehåll, Notation and Översättning.
- Layout: `sjoskolan/`, `elteknik/` and `ellab/` at the root. Do not flatten it.
- Publishing:
  - `pages.yml`, gated by `sjoskolan.yml`;
  - `publicerad.json`;
  - the emergency input `utan_kontroller`;
  - the `site` mirror and its emergency use (step 6.9).
- Addresses that never change: `Formelsamling.html`, `larare/resultat*.html#r=`, `/sjoskolan/elteknik/` and `files/provkapitel.pdf`.
- Contracts: the main-site icon and the price script.
- No password is ever written in the repository.

**nj22az.github.io**
- The portfolio sections stay.
- **Where things live:**

  | What | Repository |
  |---|---|
  | World, Thuan's Storage, Motor 90L | `johansson-world` |
  | Studio | `johansson-studio` |
  | Sjöskolan, the book, EL-LABB | `sjoskolan` |
  | StepBuddy | `stepbuddy` |
  | Films and comics | `jojo` |
  | `elteknik-och-ellara` (its own Pages site at `/elteknik-och-ellara/`, untouched) | `elteknik-och-ellara` |

- A five-line Words summary, so that "World" and "Studio" still make sense here.
- The forwarding pages and contract files: never delete them. The reserved names.
- "Edit World, Studio and Sjöskolan only in their own repositories." `AGENTS.md` points to this file.

**jojo:** where each repository lives (sibling clones, `*_DIR` variables). "The site repo" no longer holds World, Studio or Sjöskolan.

---

## 11. Future sessions and disk

- **Read `STATE.md` on `split/runbook` first**, until Phase 7 is done.
- **One product per session, every repository cloned under its own name in `/home/user`.** `python3 -m http.server -d /home/user` then reproduces `/johansson-world/` and `/johansson-studio/` as they are live. `add_repo` can attach another repository to a running session.
- **Big copies always run in GitHub Actions.**
- **Sessions here have Chromium only.** WebKit runs in Actions; the iPad is the real Safari test.
- **Leave out what you don't need.** jojo is 3.7 GB, and the old site's history is 1.6 GB.

| Work | Start the session on | Also attach | Clone options | First command |
|---|---|---|---|---|
| World (game, island, residents) | `nj22az/johansson-world` | jojo only for films and comics | `clone_depth: 1`, `blob_limit_kb: 2048` if disk is tight (about 0.5 GB full) | `npm ci --ignore-scripts` |
| Studio | `nj22az/johansson-studio` | `johansson-world` (push) for changes that need both, and for MCP work | Defaults (under 1 MB) | `npm ci --ignore-scripts && npm run world` (about 90 MB), or `--link` |
| Sjöskolan, the book | `nj22az/sjoskolan` | – | `clone_depth: 1`, `blob_limit_kb: 2048`; `sparse_checkout_paths` for one week | – |
| Portfolio, blog, shop | `nj22az/nj22az.github.io` | – | `clone_depth: 1` | – |
| Films, comics | `nj22az/jojo` | `johansson-world` (read) | `sparse_checkout_paths` for the part needed | – |

- Each repository may carry a SessionStart hook (the session-start-hook skill) that runs its first command. Studio's hook fetches the pinned World.
- A session pushes only to repositories attached with `add_repo` (`access: push`).

---

## 12. After the split (planned follow-ups, each its own batch)

1. **Move the Studio MCP's tools to Studio.**
   - `tools/studio/{server,tools,cli,smoke,page,apply,repo}.mjs` move to Studio's `tools/mcp/`, and `src/studio/{ops,rules,change}.js` to Studio's `lib/studio/`.
   - The MCP then writes World's data only in a World clone (`WORLD_DIR`), never in `./world`.
   - World keeps its data, the generated modules, `src/studio/sha256.js`, `tools/studio/build-data.mjs` (`--check`) and the data tests.
   - The lock's `/tools/studio/` and `/tools/mcp/static-server.mjs` entries go.
   - Decided with task #41's owner.
2. **Build World's `runtime/` in CI instead of committing it.** It changed in 344 commits in 17 days, so this is the biggest saver of repository size. CI must keep the previous build's chunks for pages that still hold an old `index.html`. Plan it first.
3. **Rename the local tool URLs** `/johansson-town/` to `/johansson-world/` in the roughly 40 tools, and drop the alias.
4. **Trim Sjöskolan's published site** (`innehall/`, `verktyg/`, tests), once the switch has held.
5. **Give Studio its own icon and manifest**, with the scope-test results in mind.
6. **Optional:** a text-only history branch, built in Actions with `git filter-repo`, for `git log` and `git blame`.
7. **Optional, later:** a versioned World kit that Studio imports, so that the iPad does not download World's assets twice.
8. **Tidy-up:** World's fake test URLs and its `package.json` name (`johansson-town`) can be renamed in any later batch.

---

## 13. Still open

- **Pages precedence** between a user-site folder and a project site is not documented.
  - Probes P1 to P4 answer it on Studio's address before Sjöskolan moves.
  - Step 6.5 checks it again with Sjöskolan's own files (`publicerad.json`, `kallor.html`) and falls back to variant B.
- **iOS Home Screen storage**, for icons with and without a manifest, is tested (steps 1.6 and 3.11), not assumed.
- **Actions outages** are covered for Sjöskolan by the `site` branch (and for World if the creator wants it). Studio keeps serving its last deploy.
- **Whether a project site without its own 404 page falls back** to the main site's `404.html` is unverified. Either way is harmless.
- **The full book (`BOKLOSEN`).** Does it print `nj22az.github.io/elteknik` or `/johansson-town/` URLs? If so, those forwarding pages are permanent, as planned. The creator can check a locally unlocked copy.
- **The dormant Cloudflare setup** (`wrangler.toml`, `pages_build_output_dir = '.'`) is unaffected; if it were ever connected, it would publish the whole main tree.
- **Whether the proxy allows** the workflow disable and enable, dispatch and issue-transfer calls is unknown. Each has a click-in-the-UI fallback; deploys never depend on them.

---

## Appendix A. The two reviews: what changed, and what was not taken

Every finding was checked against the files, the live site, the session list, the branches and the Actions history before it was accepted. No finding was wrong in substance. Six proposed sub-fixes were replaced by a better one; they are listed after the table.

| # | Finding | Checked | Fixed in |
|---|---|---|---|
| R1.1 | `render-feed-backdrops.mjs` and `ferry-look.mjs` serve the folder above World and hard-code `/johansson-town/` | Yes (`site=resolve(root,'..')`; no other tool does this; `render-resident-*` serve World's own root) | Step 0.5 item 2, with a render as acceptance; step 2.4 acceptance |
| R1.2 | Studio MCP paths beyond `PATHS`; `publish_check`'s "uncommitted" would always pass | Yes (`tools.mjs` 28, 40, 225, 236, 241, 271; `repo.mjs:41`; `smoke.mjs:83-85`) | Step 0.5 item 1, with a new test |
| R1.3 / R2.7 | The kill switch navigates windows, defeating the icon variant | Yes (`pwa.js` updates on load and focus with `updateViaCache:'none'`) | §6.8 (never navigates); §6.14; the iPad dress rehearsal (step 3.11) |
| R1.4 | Studio's icon has no manifest; no Studio backup | Yes (`avatar-creator/index.html:4-25`) | Scope test c→d (step 0.4, §6.12); Studio's icon branch (§6.7); backups (creator step 11) |
| R1.5 | Studio's two browser tests and World's `storage-boss` break | Yes | Steps 2.3 and 2.5; lock paths (§6.5); CI (§6.4) |
| R1.6 | World's Studio button 404s between steps 3.6 and 3.7 | Yes (`index.html:88`) | Commit C keeps it; commit D (step 3.8) |
| R1.7 | Storage and Motor canonical and `og:` URLs | Yes (`thuans-storage/index.html:15,22,23`; Motor line 9) | Step 2.3 table |
| R1.8 | Hashed sources edited without a rebuild | Yes (`runtime-source.mjs` hashes `sw.js` with `VERSION` normalised) | Step 0.5 item 5; Phase 5 World commit; §10 |
| R1.9 | `build-workshop-models.mjs` and `build-building-audit.mjs` assume the site layout | Yes (line 4; line 33) | Step 0.5 item 4 |
| R1.10 | Studio's sparse World has no `"type": "module"` | Yes (reproduced: `MODULE_TYPELESS_PACKAGE_JSON`; Studio's tests also import Studio's own `.js`) | §3.2 `package.json`; `/package.json` in the lock |
| R1.11 | Variant B leaves the Sjöskolan workflows on main | Yes (push path triggers) | Step 6.5 (one commit) |
| R1.12 | `.DS_Store` missing | Yes | §3.1–3.3 |
| R2.1 | Writers' list incomplete; acknowledgements cannot work | Yes. Six more sessions, including one Sjöskolan session started at 08:50; four World side branches; 27 direct `nj22az` commits; Town Studio's `BRANCH='main'`; no cloud session reachable | Step 0.1 (mechanical list, silence as the check); §8 |
| R2.2 | The freeze notice reaches only the branch; the guard comes late | Yes (main's CLAUDE.md has no World, Studio or work-branch guidance) | Step 3.2 banners (inside T0's content); step 3.4 (CLAUDE.md, `AGENTS.md`, guard at T0); step 0.2 |
| R2.3 | T0 in a shared, diverged checkout | Yes (11 ahead and 22 behind, 69 uncommitted paths, two extra worktrees; the last merge needed repair 8ebecf2c) | Rule 11; steps 3.1–3.3 |
| R2.4 | Porting recipes drop or reject work | Yes | §6.11 rewritten (`format-patch`/`am --3way`, generated files excluded, `add -N`, `apply --3way`, file-by-file check) |
| R2.5 | The real history is on the branch; only main is tagged | Yes (120 branch-only commits; no tags exist) | Step 3.3 tags; §3.5; the import message |
| R2.6 | Old and new code share saves during the overlap | Yes (`scene-model.mjs:17`, `recipe.js` `pick`) | Rule 12; §6.15; the 48-hour limit; backups |
| R2.8 | P2 and P3 cannot decide precedence | Yes (P3 ran after the probe was deleted) | The new P3 (a file on both sides, a later build); the window's own markers (step 6.5) |
| R2.9 | Publishing depends only on Actions | Yes (7–8 October: workflows failed, "pages build and deployment" succeeded; `ANDRINGSLOGG.md:606`) | The `site` branch (§6.6, step 6.9, creator step 21); optional for World |
| R2.10 | The freeze is unbounded; the workflow file was deleted at T0 | Yes (7 live publishes overnight) | Phase 2 rehearsal; 2-hour target; abort rule (step 3.10); disable only |
| R2.11 | The runbook lives only in the scratchpad | Yes | Step 0.0 (`split/runbook`, `STATE.md`); reminders (steps 4.5 and 6.4) |
| R2.12 | Writers invited into World before the parity proof | Yes | Rule 13; parity in step 3.6 |
| R2.13 | The creator's checklist is missing | Yes ("the creator's list" did not exist) | "The creator's steps" at the top, with URLs and times |
| R2.14 | No port check before deletions; no reminder | Yes | Phase 5 and step 6.7 port checks; scheduled reminders |
| R2.15 | PR #160, issue #132, `JT`/`book`/`v41` | Yes (#160 open on a merged base; #132 open) | D8, D10, Phase 7 |
| R2.16 | The emergency rename is untested; P4 optional | Yes | P4 required whenever variant A applies; rename tested if Unpublish does not release the path (step 3.11). In variant B the undo is reverting main's deletion (step 6.9) |
| R2.17 | The teacher scan decrypts in a public repository's Actions | Yes (CI already unlocks with the same secret) | Step 0.6 output rule |
| R2.18 | No WebKit here; disk varies | Yes (`/opt/pw-browsers` has Chromium only; free space 0.6–4.7 GB) | WebKit in Actions; the iPad as WebKit acceptance; a sparse worktree |

**Not taken as proposed, and why:**
1. **"Claude creates the three repositories through the GitHub connector" (R2.13).**
   - The connector is limited to this session's repositories: reading `nj22az/JT` through it was refused today, and the session proxy refuses repository creation (403).
   - Creation stays with the creator, about a minute each.
2. **"Switch Sjöskolan's Pages on in sitting 2, and drop the `sjoskolan-ny` contingency" (R2.13).**
   - P1 is measured on another repository, and a 404 on `/sjoskolan/` during lessons is the costliest failure in the plan.
   - The deploy job waits for Pages, so the click costs one minute inside the lesson-free hour.
   - The contingency costs nothing unless the curl check after creation fails.
3. **"Switch Studio's old address as soon as step 3.6 passes" (R2.6).**
   - Studio's old address switches with World's, within 48 hours, after the creator's iPad check and the result for icons without a manifest (c→d).
   - Rule 12 removes the data risk meanwhile.
4. **"Save leftovers with `git stash create`" (R2.3).**
   - `git stash create` leaves untracked files out, and the shared checkout has 18 untracked paths today.
   - Leftovers go to pushed `wip/…` branches with `git add -A` instead.
5. **"A `site` mirror for every new repository" (R2.9).**
   - For Studio it would copy World's 90 MB into Studio's repository on every World update, while Studio keeps serving its last deploy during an outage anyway.
   - So Sjöskolan gets the mirror, World can have it, and Studio does not.
6. **"New repositories need new sessions" (detail of R2.11).**
   - `add_repo` attaches a new repository to a running session (the GitHub access documentation, read today).
   - The durability point stands, and is fixed by step 0.0.
