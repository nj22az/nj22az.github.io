# Johansson Studio and Claude (the `johansson-studio` tools)

Claude can look at the town's characters, change how they look, and add Studio characters of its own. It does this
through the `johansson-studio` tools, which use the same data and drawing code as Johansson Studio on the iPad.

## For the creator

Ask in plain words:
- "Show me Mr Fujita."
- "Give him a captain's hat and grey hair, because he skippered the old ferry."
- "Make a new character, Sora, Thao's cousin from Naha."

Every change works like this:
1. Claude first shows what the change would do (a dry run) and draws a portrait of it.
2. When you say yes, Claude adds the change to Studio's draft. The draft is on Claude's computer, outside git: Claude's
   tools and portraits show it, but World and Studio on your iPad do not yet, and nobody else's work can publish it.
3. When you say **"update World"**, Claude publishes the draft into World's data, redraws the resident guide's
   portraits, rebuilds the game, checks everything, commits, pushes, and waits for the live workflow. A change is live
   only after that workflow succeeds. Then World and Studio on the iPad both show it.

A draft is kept only as long as Claude's session: say "update World" to keep what you said yes to. Until then you can
also ask Claude to take a change out of the draft again.

Some rules hold for every change:
- A look changes how somebody looks, not who they are. Their walk and their voice stay the same.
- A look cannot change the life stage World draws a resident at (child, teen, adult, elder), because their walk and
  voice belong to that stage. Grandmother Higa, for one, is drawn as an adult; making her an elder is a change to
  World's own drawing of her (`cast.js`), not a look.
- A resident of World is never deleted. Their Studio look can be taken away, and World then draws them as before.
- A new character gets a name of their own: not a resident's name, and not a name World used to have (Aya was Nhung's
  old name, and old saves still read it as hers). They also get a walk and a voice of their own, made from their name,
  never those of the person they were drawn from.
- New characters live only in Studio for now: once published, they are in Studio's Template picker and in Build
  scene's "Studio characters". To live in World, a character also needs a home, a routine and a personality. That is
  still open for you to decide.
- A look for Johansson reaches the comics, the guide and the photo studio, and the player too, unless you have made
  your own player in World's maker on that device: your player stays yours.
- If you restyled a resident in World's own maker on this iPad, your restyle keeps winning on this iPad, in World and
  in Studio (they share the iPad's saved looks). World's maker has no button yet to go back to the published look;
  that is an open item. Other devices show the published look.
- Real brand names are refused: already now in a new character's name and role (an "Orion beer promoter" is refused),
  and from stage 2 in every product and label field. World still uses "Orion" in nine places, listed in
  `johansson-town/data/studio/brand-rules.json`; these wait for you to choose a made-up name.
- Products and labels (the Umineko beer can) arrive in the next stages.

## For Claude

**Tools.** The MCP server is `johansson-studio` in `.mcp.json`. It runs as `node johansson-town/tools/studio/server.mjs`.

If the host times out the connection, run the same tools from the command line. Start the command from the
repository root:

```
node johansson-town/tools/studio/cli.mjs                         # list the tools
node johansson-town/tools/studio/cli.mjs character_get '{"name":"Mr Fujita","options":true}'
node johansson-town/tools/studio/cli.mjs character_update '{"name":"Mr Fujita","set":{"outfit.hat":"captain"},"note":"He skippered the old ferry."}'
node johansson-town/tools/studio/cli.mjs render_portrait '{"name":"Mr Fujita","view":"quarter"}'   # prints the PNG's path
```

The command line and the MCP server (one per Claude session) write under the same lock, so they never overwrite each
other's changes.

| Tool | What it does |
|---|---|
| `character_list` | Lists people by `group` (`cast`, `neighbour`, `townsfolk`, `studio`) or by `query` (accents and capitals may be left out). Says who has a Studio look and what is still only in the draft (`unpublished`). |
| `character_get` | Returns the recipe as Studio draws them now (the draft included), their Studio look (`set`, and in `notes` why each field changed), the published look, where the look comes from, and the read-only profile. With `options:true` it also lists every field a look can set and its choices. |
| `character_update` | Changes some fields with `set`, by path, for example `{"outfit.hat":"captain"}`, and needs a `note` of at least four words. It is a dry run unless you pass `dryRun:false`, which adds the change to the draft. It returns the new recipe, the diff, any clamped numbers and any problems. |
| `character_create` | Adds a Studio-only character, drawn `from` someone or from the default, with a `card` giving `{role, why}`. |
| `character_reset` | Takes a resident's Studio look away. |
| `character_delete` | Deletes Studio characters only. |
| `render_portrait` | Draws a PNG in headless Studio at the iPad's viewport, by `name` (the draft included) or `recipe`. You can set `view`, `expression`, `pose`, `framing` and `size` (at most 1024); an unknown pose or expression is refused with the list of choices. The PNG is also saved in `output/studio-mcp/portraits/`, which git ignores. |
| `validate` | Checks the published looks, the draft, the brand rules, or a change file. The known Orion uses come back as warnings. |
| `publish_draft` | Only when the creator says "update World": writes the draft into World's data. A dry run lists the drafted changes and who they change. |
| `discard_draft` | Takes drafted changes out, by `ids` or `all`. |
| `publish_check` | Reports whether everything is ready to publish: the generated modules, the data, the draft, the Studio tests, `runtime/`, the guide portraits, main merged, and the files to commit. It never commits or pushes. |

**How a change is made.** Each write builds one change file. The same file comes from the iPad and from the page's
agent API in stage 4:

```
{"format":"johansson-studio-change","version":1,"id":"2026-10-12T09-14-05Z-mr-fujita-look-3f9a2c","made":"…","by":"ipad|claude",
 "note":"why, in words","base":{"looks":"<sha256>"},"ops":[{"op":"look.set","name":"Mr Fujita","set":{"outfit.hat":"captain"},"was":{"outfit.hat":"none"}}]}
```

- **How `was` works.** If a field still holds `was`, the step applies. If it already holds the new value, nothing
  happens. Anything else is a conflict: the conflict is reported field by field and nothing is written.
- **Ids.** The tools make an id from the time, who it is about and a fingerprint of the steps, and take the next free
  one (`-2`, `-3` …) if it is used. A change file that reuses an id is refused when applied; a dry run only warns.
- **Limits.** A change file can be at most 8 MB, with at most 50 steps and 12 pictures.
- **Applying from a file.** Pass a change file, for example one from the iPad's share sheet, to
  `node johansson-town/tools/studio/apply.mjs change.json`. Add `--write` to add it to the draft; without it the run
  is dry.
- **What a write touches.** `dryRun:false` writes only the draft, `data/studio/draft/pending.json`, which git
  ignores. Only `publish_draft` writes World's data: `data/studio/looks.json`, the generated
  `src/avatars/looks-data.js` (each resident's published fields) and `src/studio/characters-data.js` (Studio's
  characters), and it appends to `data/studio/log.json` (each change with the steps that undo it) and empties the
  draft. Each step writes all its files at once: every file goes to a temporary file first and is renamed into place
  only when all of them are on disk.
- **Safety checks.** Every write goes through the allowlist, realpath and symlink checks in `tools/studio/repo.mjs`,
  and every read, check and write happens under one lock (`data/studio/.lock`, git-ignored) shared by every process
  on this checkout. A lock left by a process that has ended is taken over. Nothing writes `.mcp.json`, settings,
  workflows, code or git.
- **Pictures (labels, from stage 2).** A picture must really be a PNG, JPEG or WebP of at most 2 MB, with the sha256 the
  change file gives, and its header must say it is at most 8192 pixels a side and 40 million pixels in all (read before
  anything decodes it). It is redrawn as WebP in Chromium (`page.mjs` `reencodeWebp`), so only its pixels are kept and
  no EXIF or GPS location from the iPad reaches the repository. Until then any picture in a change is refused.

**How World reads it.**
- `cast.js` `recipeFor(name)` works in this order:
  1. the device's own wardrobe (a restyle in World's maker on that device);
  2. the published look over `baseRecipe(name)`;
  3. `baseRecipe(name)` alone, which is the drawing from before Studio looks existed.
- With no published looks, every recipe is byte-identical to before, the player's default included
  (`actors.js` `playerRecipe` falls back to `recipeFor('Johansson')`).
- Harbour visitor is a starting template in the maker, not a resident: it takes no look.
- Test that the modules match the data with `node johansson-town/tools/studio/build-data.mjs --check`. CI does this in
  `tests/studio-data.test.mjs`.
- `looks-data.js` holds only the fields, so a new Studio character or a note never makes the resident guide's portraits
  stale; a changed resident look does.

**When the creator says "update World":**
1. Run `publish_draft` as a dry run, show the creator what it publishes, then run it with `dryRun:false`.
2. If it wrote `src/avatars/looks-data.js`, redraw the guide portraits:
   `node johansson-town/tools/render-resident-guide.mjs`.
3. Rebuild the game: `(cd johansson-town && npm run build:runtime)`. Do this only when the rest of `johansson-town/src`
   is committed, because the build bakes in every source file.
4. Run `publish_check`. Everything must pass except `uncommitted`, which lists the files to commit.
5. Commit Studio's files together with `johansson-town/guide/`, `resident-guide.js`, `runtime/`, `index.html`,
   `creator/index.html` and `sw.js`, as `uncommitted` lists them. Add those paths by name; never `git add -A`.
6. Run `git fetch origin main` and merge main into `claude/sjoskolan-youtube-strategy-gofi3o`.
7. Push the branch, and check the live workflow with
   `gh api repos/nj22az/nj22az.github.io/actions/workflows/johansson-town-live.yml/runs?per_page=3`.

Never call a change live before that run has succeeded.

**Tests.**

| Test | Where it runs |
|---|---|
| `tests/looks-data.test.mjs`, `tests/studio-apply.test.mjs` (including eight writers in eight processes at once), `tests/studio-data.test.mjs`, `tests/studio-mcp.test.mjs` | `npm test` and CI |
| `npm run studio:smoke` | Not CI, because it needs a real MCP client and Chromium |
| `node avatar-creator/tests/studio-agent.browser.mjs` | Not CI. It covers the agent page and both pickers (with a Studio character served from a seeded module) at iPad size (1024×1366) and phone size (390×844) |

`tests/studio-mcp.test.mjs` refuses to run outside `node --test`: outside it the server ignores
`JOHANSSON_STUDIO_ROOT` and would change the real data.

**If the MCP server does not connect.** `initialize` itself answers in well under a second (the smoke test asserts
less than 2 s). A 30 s `CONNECT_TIMEOUT` comes from the host while a session starts or resumes, so use `cli.mjs`.
Whether to raise the host's MCP timeout is the creator's decision, and no repository file changes it.
