# Character assets

The active 21 named residents load `neighbours/resident-00.glb` through `resident-20.glb`. They are individually fitted Blender/MPFB characters made from the MakeHuman CC0 anatomical base and system assets: skin photographs, everyday clothes, shoes, eyes, brows and hair. Ages, builds, face targets, clothes and hair vary by resident. Seven original in-place actions cover idle, walking, running, greeting, sitting, eating and drinking.

Exact sources, the pinned authoring revision, original asset-pack hash, file hashes and changes are recorded in `neighbours/manifest.json` and the per-resident `.source.json` receipts. Full CC0 terms and original rights holders are included in `realistic/LICENSE-MAKEHUMAN-CC0.md` and `realistic/provenance.json`. MPFB is an authoring dependency; its add-on code is not distributed with the game. Reproduction: `../../docs/NEIGHBOURS-AND-STREET.md`.

Yuri continues to use the owner's supplied `realistic/yuri-playful.glb`, with the existing original idle and greeting layered onto the supplied walking/running rig. This supplied asset is not represented as CC0. Her provenance remains in the parent asset ledger and `realistic/` receipts.

The loader retains the local MakeHuman Yui and Quaternius suit fallback. If optional visual assets cannot load, the procedural rig, collision and interaction anchor remain usable. The five archived Quaternius bases are CC0 under the exact creator notices in `residents/PROVENANCE.md`. The former segmented cast in `living/` and its source files are retained for rollback and are no longer the active residents.

The three older `character-*.glb` files are an unused Kenney Mini Characters archive: [creator page](https://kenney.nl/assets/mini-characters), CC0 1.0, included `LICENSE-KENNEY.txt`.
