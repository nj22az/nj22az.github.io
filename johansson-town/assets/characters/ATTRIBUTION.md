# Character assets and provenance

## Active high-detail cast

Johansson Town now preloads realistic rigged MakeHuman / MPFB 2 characters published by the open `kunalkushwaha/vsim` project. The source project states that these exported humans, their MakeHuman system-asset skin/clothing textures and the generated character output are CC0 / public-domain material.

Runtime source files used by `characters-aaa.js`:

- `human.glb` — realistic female MakeHuman body, skin texture, rig and `walk` / `run` / `idle` / `wave` clips.
- `man.glb` — broader adult male MakeHuman body with the same animation library.
- `speaker.glb` — alternate MakeHuman human with the same animation library plus a `mouthOpen` morph target.
- `suited.glb` — realistic adult man with fitted, skin-weighted casual-suit and shoe geometry from the MakeHuman CC0 asset pack, plus the same animation library.

Source repository: https://github.com/kunalkushwaha/vsim
Source credits: https://github.com/kunalkushwaha/vsim/blob/main/packages/assets/library/CREDITS.md
Source library: https://github.com/kunalkushwaha/vsim/tree/main/packages/assets/library
MakeHuman / MPFB: https://www.makehumancommunity.org/
MakeHuman system assets: https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html
MakeHuman graphical assets / generated outputs: CC0 1.0 Universal.

Johansson Town adds its own per-character scale, hair, caps and accessories. The five live identities remain deliberately different: the player, Aiko, Kenji, Mrs Sato and the harbour master use separate height/build/accessory profiles. The high-detail files are loaded during the opening screen before gameplay so there is no deliberate mid-game model swap. If a high-detail network source cannot be retrieved, the game falls back to the local procedural human rigs rather than failing to start.

The current remote preload is an engineering compromise imposed by the available binary repository-transfer path. A future optimisation pass should vendor licence-verified GLBs locally and create age-/ethnicity-/wardrobe-specific MakeHuman exports for each resident.

## Local procedural fallback

`characters.js` remains the deterministic offline fallback. It provides individually proportioned local Three.js humans and is retained deliberately for network or asset-load failure.

## Legacy Kenney archive

The older Kenney Mini Characters are retained only as a legacy CC0 archive and are not used by the normal high-detail runtime.

Legacy source: https://kenney.nl/assets/mini-characters
Legacy license: CC0 1.0 Universal — https://creativecommons.org/publicdomain/zero/1.0/
Creator: Kenney.

Archived models: character-male-a, character-female-e, character-female-f. The original pack licence remains included as `LICENSE-KENNEY.txt`.
