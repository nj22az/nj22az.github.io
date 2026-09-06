# Johansson Town — Harbour Edition

An original, explorable 1988 Japanese harbour neighbourhood. Retains all eight existing project destinations and their interiors.

## Play

- Desktop: click the scene for mouse look; WASD/arrows move, Shift jogs, E interacts, Q opens the directory, B opens the notebook, V changes camera, N changes time. Escape releases the mouse or closes a panel.
- Touch: left side moves, right side looks; use INTERACT and the bottom controls. iPhone full-screen standalone mode uses Share → Add to Home Screen.
- Talk to Aiko to start the Tama errand. Fish at the harbour, sell catches to the harbour master, play Star Port, buy drinks, order ramen, use the phone, or visit the shrine.
- The notebook, money, items, visited shops and quest progress save on the current device. Clearing browser data removes this save.
- The bus stop is a readable timetable; buses and interiors beyond the eight project buildings are not simulated.

## Assets and rendering

Three local CC0 Kenney Mini Characters (779 KB total) replace the player and four residents. Each carries 32 original animation clips. The game uses idle, walk, sprint and conversational acknowledgement. Palette images are embedded. Characters stream in after startup, with simple fallback figures if a model fails.

Four local 1K CC0 Poly Haven diffuse textures (2.43 MB total) provide road, plaster, timber and roofing surfaces. Original buildings and scenery use instanced geometry. Mobile caps pixel ratio at 1, targets 30 fps and disables shadow maps. Desktop uses soft shadows. Day/evening/night, rain, four camera views and a live minimap are available.

No external asset host is required at runtime. The Three.js r169 module and matching GLTFLoader/SkeletonUtils helpers are served from this repository.

Credits and original licences: `assets/ATTRIBUTION.md`, `assets/characters/ATTRIBUTION.md`, `assets/characters/LICENSE-KENNEY.txt`, `vendor/LICENSE-THREE.txt`. Source manifests retain original download details; the four textures have been renamed locally to asphalt.jpg, plaster.jpg, timber.jpg and roof.jpg.

## Validation

JavaScript syntax and local asset/import paths checked. Node smoke checks exercised purchases, insufficient funds, quest progression and one-time reward, fish sales, timed fishing, three-round arcade payout, save restoration, unique visits, all eight interiors, world updates and collision bounds. Shipped GLTFLoader parsed all three actual GLBs; skeleton clones and walk clips produced finite transforms. Browser rendering, visual appearance and physical iPhone performance have not been play-tested in this revision.
