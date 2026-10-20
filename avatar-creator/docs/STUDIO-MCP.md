# Johansson Studio and Claude (the `johansson-studio` tools)

Start with `studio_workflow_info` for tool routing, file exchange and the creator approval boundary.
The consolidated workflow, audit and roadmap are in [STUDIO-WORKFLOW.md](STUDIO-WORKFLOW.md).

**New: static GLB preparation and snapping.** `model_inspect`, `model_prepare` and `model_snap` share the UI's
**Make model → Import GLB** workshop. See [MODEL-WORKSHOP.md](MODEL-WORKSHOP.md) for setup, examples, surface checks,
supported inputs and the next World-editor batches. A prepared GLB is a copy, not a published town update.

**New: editable room drafts.** `room_create/open/get/edit/import_model/export/check/render` share the **Edit room**
document and commands. See [ROOM-PROJECTS.md](ROOM-PROJECTS.md) for portable file exchange, revisions and remaining
World integration. The animation integration reuses the existing `jojo/remotion` engine: [REMOTION-PLAN.md](REMOTION-PLAN.md). `scene_export_film` exports a clean World plate and staging; `film_pipeline_info` describes that engine. World assets/purpose and static support tools are documented in [WORLD-LIBRARY.md](WORLD-LIBRARY.md).

Claude can look at the town's characters, change how they look, and add Studio characters of its own. It can also open
Sakura Shōten's products, change their labels, words, prices, purpose and shelf, add flavours and new lines, and retire a
line. It does this through the `johansson-studio` tools, which use the same data and drawing code as Johansson Studio on
the iPad.

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

### Products and their labels (Sakura Shōten)

Ask in plain words:
- "Open the Umineko beer can." Claude draws it the way World does: the front, the back, all four sides, the can on its
  shelf with its Dry and Black flavours beside it, or the label unrolled flat.
- "Give the beer an autumn label: a navy band and the word Autumn in a flash." Claude designs the label, bakes it into a
  picture and shows you the picture before anything is kept.
- "Use this photo as the label." Send the picture; say which words are printed on it.
- "Add a lemon flavour of the beer." "Add peppermints by the batteries, for the bus driver and the harbour master."
- "Make the beer ¥240." "Say the milk is for the bathhouse too."
- "Delete the beer."

Every change goes the same way as a look: a dry run with a picture, your yes (into Studio's draft), and only on
**"update World"** into World. Then the shelf, the price tag, the can you pick up and its flavours all show it.

What to know about labels:
- The labels on Sakura's shelves today are **paintings**. A painted word cannot be changed letter by letter. A label can
  either be **redrawn** in the drawn style from the brand's own colours, emblem, words and illustration, or **keep the
  painting and have layers added on top** (a band, a flash, words, a shape, an emblem, an illustration, a picture).
  Which way a label goes is your choice each time (decision 2).
- A label is baked into a picture when you say yes, and World shows exactly that picture on every device, whatever
  fonts it has. The flavours on the shelf follow the new label by themselves (Dry and Black are the beer's own label,
  turned in colour, with their names on a ribbon).
- A new flavour costs nothing on the floor: it shares its line's shelf. A new line needs a place: it shares a shelf
  with a line beside it, or takes the place of a line it replaces. Only **four more lines** fit in the shelf's label
  sheet; after that it must grow, which is a change to World's code, not a Studio change.

The rules every product change keeps:
- **Nothing is random.** Every line says who in town buys it (real residents, by name), why they want it, and why it
  stands where it does, each in at least four words.
- **No real brands**, in any name, line, flash, flavour, label word or word printed on a picture ("Orion lager",
  "オリオン" are refused).
- Prices are whole yen from ¥10 to ¥5000. All alcohol comes from Higa Liquor.
- Every shelf stays full and no shelf is booked twice; a line stands at most two deep in the cold cabinet and the
  chiller, three on a gondola board.
- A product's id and the name old saves keep in the bag never change. **Renaming a product is not switched on yet**,
  because World still finds a bag's things by their names (an open item).
- **"Delete" means retire**: the line leaves the shelf, its shelf goes to the line beside it, and old saves still know
  what is in their bags. A retire is refused, with every place listed, while World's code still names the line. The
  beer is named in its stories (Mr Fujita's routine, gift likes, the drunk walk, Higa's trade lines and more), so
  retiring it waits for your choices about those stories (decision 4).

### Assets: "Make model" (the creator, 2026-10-14)

Studio's **Make model** workspace holds every asset of World: the catalogue's (the massage chair, the trucker cap and
its display copy) and the props World builds in its own code (the prop registry, `johansson-town/src/studio/prop-registry.js`).
Open one to turn it round in World's look, see its checks, and save it in one tap: a GLB for World, an STL for a 3D
printer, a transparent PNG, or its asset card. **New from a shape: Lathe** makes a new one (a lantern, an andon, a vase,
a can, a bucket, a tub). An iPad cannot change World by itself, so a made asset whose checks all pass is sent with
**Send to World's draft**: it saves a package file (`<id>.v<n>.studio-asset.json`). Give that file to Claude:
1. Claude checks it again and keeps it in Studio's draft (`asset_draft`), outside git.
2. When you say **"update World"**, Claude copies it into World's catalogue (`asset_publish`), and World can place it.

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
| `product_list` | Lists Sakura's products by `zone` or `query`: brand and line, price, where it stands in words, its label (`painted`, `fresh` or `designed`), its flavours, whether a change is still only in the draft, and how many more products and flavours fit in the label atlas. |
| `product_get` | One product by id or name: the whole record, where it stands, its cells, what is published, the fields a change may set, the known findings, and its references: code as `file:line`, tests, trade accounts, and drawings its label does not reach (the backroom crates, the stockroom bottle, the posters). |
| `product_update` | Changes fields by path (`price`, `brand.ink`, `purpose.why`, `shelf`, `label` …). A designed `label` is baked in headless Studio and returned as a picture; changing a brand colour bakes a designed label again. Dry run unless `dryRun:false`. |
| `product_label_picture` | Makes a label from a picture (base64): cut to 2:1 (the centre, or `crop`), redrawn so only its pixels are kept, and baked. `words` lists every word printed on it, for the real-brand check. |
| `product_add` | `as:"flavour"` adds a flavour `{name, hue}` to a line. `as:"product"` adds a line (`from` a product to start from), placed with `place.mode` `share` (a line's shelf), `replace` (retires that line) or `free`. Its label is its own design, or redrawn from its brand and baked. |
| `product_retire` | Retires a line, giving its shelf to `shelfTo` (the other line in its cold-cabinet column, or a line in its gondola bay). Refused, with every reference, while World's code, tests or trade accounts name it. |
| `render_product` | A PNG of a product by `id` (draft included) or a `draft` record: `front`, `back`, `turn`, `shelf`, `flat` or `cell`. Saved under `output/studio-mcp/products/`. |
| `asset_list` | World's catalogue (published), Studio's drafted assets (made in Studio, not in World yet), and the prop registry. |
| `asset_export` | An asset's files exactly as "Make model" saves them on the iPad, drawn by Studio's own code in headless Studio: `key` `catalogue:<id>`, `registry:<id>`, or `lathe` with a design's `params` and `card`. Writes `<id>.v<n>.glb`, `.stl`, `.png` and `.asset.json` into `output/studio-mcp/assets/` (git ignores it) and returns the checks and the STL's watertight report. |
| `asset_draft` | Keeps a package from "Send to World's draft" (`file` or `package`) in `data/studio/draft/assets/<id>/`: refused unless every check ran and passed, its files are the ones it names (sha256), its GLB has the asset's node at the origin, its id is free in World and its version is new. Dry run unless `dryRun:false`. |
| `asset_publish` | Only on "update World": copies a drafted asset into `assets/catalog/<id>/`, lists it in `index.json` and compiles `src/catalog/catalog-data.js`, as the desktop Studio's publish does (`townstudio/assets.py`). Dry run unless `dryRun:false`. |

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

**Products: how World reads them.**
- Sakura's products live in `johansson-town/data/studio/products.json` (format `johansson-products`, version 1):
  `products` in the order Thuan walks the floor, `prints` (printed matter in the label atlas that is not stock: the
  delivery carton, the shop's mark, the magazines, the paper) and `retired`. `tools/studio/build-data.mjs` makes
  `src/commerce/products-data.js` from it (`PRODUCTS`, `PRODUCT_BY_ID`, `PRINTS`, `RETIRED`, `FINGERPRINT`); CI refuses
  a copy that does not match (`tests/products-data.test.mjs`).
- The modules World always read are views over it, with every export's name, shape and order kept: `brands.js`,
  `catalogue.js` (the catalogue is in the order of the price tags), `packaging-art.js` (`PACKS`, `INGREDIENTS`,
  `backPanel`), `flavours.js`, `merchandising.js` (`MERCHANDISING`, `SOURCED_FROM`; the trade `ACCOUNTS` stay in code),
  `shop-stock.js`, `vending-catalogue.js` (`DRINKABLE`, `canColour`), `shop-product.js` (a pack is built from
  `pack.shape` and `pack.size`), `item-viewer.js` (`ROUND` and `TOP_PRINTED` from the shape) and `sakura-layout.js`
  (each line's `shelf`: a cold-cabinet column and shelves, a chiller bay and deck, a gondola bay and order, the steamer).
- One record (abbreviated): `{"id":"beer","inventoryName":"Umineko lager","shop":"sakura","name":"Umineko lager",
  "jp":"Beer","price":220,"text":"…","bagColour":"#c9ab59","brand":{name, jp, line, paper, ink, accent, symbol},
  "pack":{shape, size, net, flash, tag, art, back:{ingredients, unit, recycle, food}},"label":{"source":"painted",
  "sheet":0,"cell":10},"cells":{"brand":10,"price":49,"flavours":[{"name":"Dry","hue":-30,"cell":27},…]},
  "purpose":{zone, for, why, placed},"shelf":{"fitting":"fridge","column":3,"levels":[2,3,4]},"capacity":24,
  "supplier":"higa-saketen","drink":{"alcohol":true,"container":"can","handColour":"#2d6b9a"}}`. `pack.declared`
  keeps a shape or size the old `PACKS` listed that the shelf never built (orange, sandwich, pudding, chocolate, soap,
  notebook, postcard), until the creator decides.
- **Every product has its own cells** in the shelf's label atlas (`store-advertising.js`, 4 × 20 cells a half): its label
  and its price tag in the left half, each flavour in the right half. Adding or retiring a product never moves another
  one's cells. The left half's first 32 cells lie under the two painted sheets and are never given to a new line.
- **A label** is `{"source":"painted","sheet","cell"}` (a cell of `assets/graphics/konbini/packaging-*.webp`),
  `{"source":"fresh"}` (bento, sandwich, pudding: `fresh-labels.js`), or `{"source":"designed","spec",
  "image":"labels/beer.r1.webp","sha256","bakedOn":"Chromium"|"iPad Safari"}`. `getLabelMaterial` still lays each
  painted sheet in whole, then lays every designed label's picture over its own cell (256 × 128), then paints the
  flavours from the cells, so the flavours follow a new label by themselves. The close-up (`buildPack`) shows the
  1024 × 512 picture. World never draws a design itself; `src/commerce/label-art.js` `drawLabel` is the one renderer,
  used to bake and to preview.
- **A label design** (`src/studio/label-spec.js`): `{"v":1,"base":"paper"|"painted","layers":[…]}`, at most 24 layers,
  coordinates from 0 to 1 across the wrap (x 0.5 is the middle of the front; on a can the front is about x 0.3–0.7).
  Layers: `band {y,h,colour}`, `stripe {x,w,colour}`, `shape {shape: circle|ring|roundel|diamond|rounded, x,y,w,h,colour,
  line?, angle?}`, `symbol {symbol, x,y,size,colour}`, `text {text, font: gothic|maru|mincho, x,y,size,colour, weight?,
  align?, outline?, maxWidth?}`, `art {art, x,y,size}` (the packs' illustrations) and `picture {file, x,y,w,h, words}`.
  A colour is `paper`, `ink`, `accent` or `#rrggbb`; any layer may have `opacity`. `brandSpec(product)` is "Redraw from
  brand".
- **Applying a product change** checks the step, refuses a retire (or a replace) while `tools/studio/references.mjs`
  finds the line named in World's code, tests or trade accounts, redraws its pictures as WebP in Chromium and gives
  each the next free `labels/<id>.r<n>.webp` (or `<id>-picture.r<n>.webp`), checks every `was`, and checks the whole
  products file afterwards (`rules.js` `validateProducts`). The draft holds the pictures until `publish_draft` writes
  them with `products.json` and `products-data.js`.
- **Checking a product change by eye.** `tools/studio/baselines.mjs` fingerprints the atlas, the cold cabinet, the beer
  column and the can picked up (front and back) in Chromium (`--save <name>`, then `--compare <name>`).
  `tools/studio/cabinet-walk.mjs <label> --source` walks into Sakura through the `johansson-town-audit` server (its
  `start_session` takes `source:true` to run the game from `src/` before `runtime/` is rebuilt), stops at the cold
  cabinet and picks up a can. `tests/products-move.test.mjs` holds every legacy export to the fixture taken before the
  move (`tests/fixtures/products-legacy.json`, from `tools/studio/products-snapshot.mjs`).

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
| `tests/studio-assets.test.mjs` (the asset tools on a copy of the catalogue), `tests/asset-modeller.test.mjs`, `tests/lathe-maker.test.mjs`, `tests/looks-data.test.mjs`, `tests/studio-apply.test.mjs` (including eight writers in eight processes at once, and every product refusal), `tests/studio-data.test.mjs`, `tests/studio-mcp.test.mjs` (every tool), `tests/products-data.test.mjs`, `tests/products-move.test.mjs`, `tests/label-spec.test.mjs` | `npm test` and CI |
| `npm run studio:smoke` | Not CI, because it needs a real MCP client and Chromium. It renders every product view, bakes a designed label for the beer on a throwaway copy, publishes it, and checks that World's atlas differs only in the beer's cell and its flavours' cells |
| `node johansson-town/tools/studio/baselines.mjs --compare <name>` and `cabinet-walk.mjs` | Not CI: pixel baselines and a live walk, for every batch that moves or changes products |
| `node avatar-creator/tests/model.browser.mjs` | Not CI. Make model at iPad and phone size by taps: the library, every export re-opened (GLB, STL, PNG, card), the Lathe maker's presets, a dragged profile point, a lantern's files and its package |
| `node avatar-creator/tests/studio-agent.browser.mjs` | Not CI. It covers the agent page and both pickers (with a Studio character served from a seeded module) at iPad size (1024×1366) and phone size (390×844) |

`tests/studio-mcp.test.mjs` refuses to run outside `node --test`: outside it the server ignores
`JOHANSSON_STUDIO_ROOT` and would change the real data.

**If the MCP server does not connect.** `initialize` itself answers in well under a second (the smoke test asserts
less than 2 s). A 30 s `CONNECT_TIMEOUT` comes from the host while a session starts or resumes, so use `cli.mjs`.
Whether to raise the host's MCP timeout is the creator's decision, and no repository file changes it.

## Decisions and findings for the creator (products)

**Decisions**
1. A painted wordmark cannot be edited letter by letter: a label is redrawn in the drawn style, or keeps the painting
   with layers on top (decision 2 of the plan). Is that acceptable?
2. "Delete the beer" means retire, and its story references (Mr Fujita's routine, gift likes, the drunk walk, the trade
   lines) need your choice first (decision 4).
3. The 350 ml can is 94 × 135 mm in World; a real one is 66 × 122 mm. Is that game scale on purpose (decision 6)?

**Findings** (each fix is its own visible batch; none is made yet)
- The can in the hand is blue (`drink.handColour` `#2d6b9a`) while the can on the shelf is gold.
- The posters advertise GOLDEN MILK TEA, NIGHT SHIFT and STICK BITES, which are not the shelf's NAGI, PORT 88 and
  KOMOREBI (`store-advertising.js` `POSTER_SPECS`).
- Who supplies alcohol contradicts itself: `economy/goods.js` and `economy/town-economy.js` have Sakura supplying Higa,
  while `merchandising.js`, CLAUDE.md and the products data have Higa supplying Sakura.
- A real brand, Orion, is still used in World (`data/studio/brand-rules.json` `knownIssues` lists every place).
- The beer's and the coffee's backs say "Nutrition (per bottle)" on a can (`pack.back.unit`).
- The old `PACKS` listed a few shapes and sizes the shelf never built (`pack.declared`: orange as a carton, the sandwich
  as a box, the pudding as a plain cup, the chocolate, notebook and postcard as flat packs, and the soap smaller).
- Renaming a product waits for World to find the bag's things by product id instead of by name.

## Editable classroom comics (20 October 2026)

`scene_classroom_example` returns Vy's four-panel acceptance scene. `scene_render({scene,name})` draws a snapshot with the actual Build scene workspace and reports its normalized data, head framing and hand-contact target errors. `comic_render({scenes,name,layout})` captures one to four scenes and exports the PNG plus a portable `.studio.json` project containing per-panel snapshots. Rendering writes previews only and never publishes World. See [CLASSROOM-COMIC.md](CLASSROOM-COMIC.md) for controls, schema additions, validation and limits.

Native workshop authoring: `world_room_open`, `world_room_check`, `world_room_publish`, `world_room_rollback`.
See [WORKSHOP-ROUNDTRIP.md](WORKSHOP-ROUNDTRIP.md) for the revision-checked World round trip, imported props and intentional
floating. Publishing updates local World data; runtime build, review and git deployment remain explicit steps.
