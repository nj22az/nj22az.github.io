# Character assets

The active 21 named residents use five locally packed **VRoid Studio beta CC0 sample models** by **pixiv Inc. / VRoid Project**: Vivi, HairSample_Male, Sakurada Fumiriya, Victoria Rubin and Sendagaya Shino. The runtime files and 512–1024px texture atlases are in `vroid/`. Each resident has a distinct wardrobe/hair palette, their existing height, independent animation, and optional round spectacles. Original VRoid face meshes retain blinking, smiling and mouth morphs. Seven original clips cover idle, walking, running, greeting, sitting, eating and drinking.

The creator's model-specific licence pages, pinned public mirror revision, original SHA-256 hashes and shipped file receipts are in `vroid/manifest.json`. These are the older samples explicitly released under [CC0](https://vroid.pixiv.help/hc/en-us/articles/4402614652569), not a blanket licence claim for every VRoid model. Reproduction and validation: `../../docs/VROID-CAST.md`.

The previous individually fitted MakeHuman/MPFB cast in `neighbours/` is an inactive archive. Its source notices, licences and authoring receipts are preserved there and in `realistic/`.

Yuri continues to use the owner's supplied `realistic/yuri-playful.glb`, with the existing original idle and greeting layered onto the supplied walking/running rig. This supplied asset is not represented as CC0. Her provenance remains in the parent asset ledger and `realistic/` receipts.

The loader retains the local MakeHuman Yui and Quaternius suit fallback. If optional visual assets cannot load, the procedural rig, collision and interaction anchor remain usable. The five archived Quaternius bases are CC0 under the exact creator notices in `residents/PROVENANCE.md`. The former segmented cast in `living/` and its source files are retained for rollback and are no longer the active residents.

The three older `character-*.glb` files are an unused Kenney Mini Characters archive: [creator page](https://kenney.nl/assets/mini-characters), CC0 1.0, included `LICENSE-KENNEY.txt`.
