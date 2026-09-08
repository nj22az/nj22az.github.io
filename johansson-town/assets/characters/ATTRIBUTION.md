# Character assets

The active optional visual layer loads five local CC0 Quaternius models from `residents/`. Exact creator downloads, original filenames, licences, modifications and hashes are recorded in `residents/PROVENANCE.md` and `residents/optimization-report.json`.

Each model contains one skinned mesh and six compatible embedded animations. `src/people/models.js` clones skeletons per resident and selects motion from measured movement. Generic low-poly adult bases remain an interim step; they are not bespoke Japanese or age-specific identities. Missing/timed-out files keep the local procedural rig, its collision and interaction label.

No remote MakeHuman model is loaded. The previous document's claims about such a live pipeline were inaccurate and are superseded by this ledger.

The three older `character-*.glb` files are an unused Kenney Mini Characters archive: [creator page](https://kenney.nl/assets/mini-characters), CC0 1.0, included `LICENSE-KENNEY.txt`.
