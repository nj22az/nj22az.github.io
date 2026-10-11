# Johansson Studio and Claude (the `johansson-studio` tools)

Claude can now look at the town's characters, change how they look, and add Studio characters of its own. It does
this through the `johansson-studio` tools, which use the same data and drawing code as Johansson Studio on the iPad.

## For the creator

Ask in plain words:
- "Show me Mr Fujita."
- "Give him a captain's hat and grey hair, because he skippered the old ferry."
- "Make a new character, Aya, Thao's cousin from Naha."

Every change works like this:
1. Claude first shows what the change would do (a dry run) and draws a portrait of it.
2. Only when you say yes does Claude write the change to Studio's data. That is `johansson-town/data/studio/looks.json`, plus a log of every change and the reason for it.
3. World changes only when you say **"update World"**. Claude then checks everything, commits, pushes, and waits for
   the live workflow. A change is live only after that workflow succeeds.

Some rules hold for every change:
- A look changes how somebody looks, not who they are. Their walk and their voice stay the same.
- A look cannot change a resident's age, because age comes from their profile in World.
- A resident of World is never deleted. Their Studio look can be taken away, and World then draws them as before.
- New characters live only in Studio for now. To live in World, a character also needs a home, a routine and a
  personality. That is still open for you to decide.
- Products and labels (the Umineko beer can) arrive in the next stages. The tools already refuse real brand names
  such as Orion. World still uses "Orion" in nine places, listed in `johansson-town/data/studio/brand-rules.json`, and
  these wait for you to choose a made-up name.

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

| Tool | What it does |
|---|---|
| `character_list` | Lists people by `group` (`cast`, `neighbour`, `townsfolk`, `studio`) or by `query`. |
| `character_get` | Returns the recipe World draws, the Studio look if there is one, where the look comes from, and the read-only profile. With `options:true` it also lists every field a look can set and its choices. |
| `character_update` | Changes some fields with `set`, by path, for example `{"outfit.hat":"captain"}`, and needs a `note` of at least four words. It is a dry run unless you pass `dryRun:false`. It returns the new recipe, the diff, any clamped numbers and any problems. |
| `character_create` | Adds a Studio-only character, either `from` someone or from the default, with a `card` giving `{role, why}`. |
| `character_reset` | Takes a resident's Studio look away. |
| `character_delete` | Deletes Studio characters only. |
| `render_portrait` | Draws a PNG in headless Studio at the iPad's viewport, by `name` or `recipe`. You can set `view`, `expression`, `pose`, `framing` and `size` (at most 1024). The PNG is also saved in `output/studio-mcp/portraits/`, which git ignores. |
| `validate` | Checks the looks, the brand rules, or a change file. The known Orion uses come back as warnings. |
| `publish_check` | Reports whether everything is ready to publish: the generated module, the data, the Studio tests, `runtime/`, the guide portraits, main merged, and uncommitted files. It never commits or pushes. |

**How a change is made.** Each write builds one change file. The same file comes from the iPad and from the page's
agent API in stage 4:

```
{"format":"johansson-studio-change","version":1,"id":"2026-10-12T09-14Z-fujita","made":"…","by":"ipad|claude","note":"why, in words",
 "base":{"looks":"<sha256>"},"ops":[{"op":"look.set","name":"Mr Fujita","set":{"outfit.hat":"captain"},"was":{"outfit.hat":"none"}}]}
```

- **How `was` works.** If a field still holds `was`, the step applies. If it already holds the new value, nothing
  happens. Anything else is a conflict: the conflict is reported field by field and nothing is written.
- **Limits.** A change file can be at most 8 MB, with at most 50 steps and 12 pictures.
- **Applying from a file.** Pass a change file, for example one from the iPad's share sheet, to
  `node johansson-town/tools/studio/apply.mjs change.json`. Add `--write` to apply it; without it the run is dry.
- **What a write touches.** A write changes only `data/studio/looks.json` and the generated
  `src/avatars/looks-data.js`, and it appends to `data/studio/log.json`.
- **Safety checks.** Every write goes through the allowlist, realpath and symlink checks in `tools/studio/repo.mjs`.
  Nothing writes `.mcp.json`, settings, workflows, code or git.
- **Pictures (labels, from stage 2).** A picture must really be a PNG, JPEG or WebP of at most 2 MB, with the sha256 the
  change file gives. It is redrawn as WebP in Chromium (`page.mjs` `reencodeWebp`), so only its pixels are kept and
  no EXIF or GPS location from the iPad reaches the repository. Until then any picture in a change is refused.

**How World reads it.**
- `cast.js` `recipeFor(name)` works in this order:
  1. the device's own wardrobe;
  2. the published look over `baseRecipe(name)`;
  3. `baseRecipe(name)` alone, which is the drawing from before Studio looks existed.
- While `looks.json` is empty, every recipe is byte-identical to before.
- Test that `looks-data.js` matches the data with `node johansson-town/tools/studio/build-data.mjs --check`. CI does
  this in `tests/studio-data.test.mjs`.
- After a look changes, re-render the guide portraits with `node johansson-town/tools/render-resident-guide.mjs`.
  `publish_check` reports when they are stale.

**When the creator says "update World":**
1. Run `publish_check`.
2. Commit only Studio's files.
3. Run `git fetch origin main` and merge main into `claude/sjoskolan-youtube-strategy-gofi3o`.
4. Push the branch.
5. Check the live workflow with `gh api repos/nj22az/nj22az.github.io/actions/workflows/johansson-town-live.yml/runs?per_page=3`.

Never call a change live before that run has succeeded.

**Tests.**

| Test | Where it runs |
|---|---|
| `tests/looks-data.test.mjs`, `tests/studio-apply.test.mjs`, `tests/studio-data.test.mjs`, `tests/studio-mcp.test.mjs` | `npm test` and CI |
| `npm run studio:smoke` | Not CI, because it needs a real MCP client and Chromium |
| `node avatar-creator/tests/studio-agent.browser.mjs` | Not CI. It covers the agent page and the resident pickers at iPad size (1024×1366) and phone size (390×844) |

**If the MCP server does not connect.** `initialize` itself answers in well under a second (the smoke test asserts
less than 2 s). A 30 s `CONNECT_TIMEOUT` comes from the host while a session starts or resumes, so use `cli.mjs`.
Whether to raise the host's MCP timeout is the creator's decision, and no repository file changes it.
