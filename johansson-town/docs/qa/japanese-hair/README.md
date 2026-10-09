# Japanese salon-inspired shared hair

Adds twelve original Blender-authored styles to the 22 existing hairstyles (34 total):
natural mash, two-block, flowing centre part, comma fringe, spiky short, layered
wolf, mini bob, airy fringe bob, outward-curl bob, face-framing layers, hime cut
and long loose waves. All are available on every body and character. Thuan retains her original hair and face. Nhung wears a straw hat. The blonde
visitor is named Ruta, is Lithuanian (user-provided), and now has face-framing
layers and doe eyes. Her original shared visitor links still resolve.

`tools/blender/build-japanese-hair.py` produces editable collections in
`art/avatars/japanese-hair-library.blend` and exports the actual rounded mesh
parts to `src/avatars/japanese-hair-mesh.js`. The shared builder fits and mirrors
head parts, recolours the hair and tucks it beneath hats. Hanging lengths use
the existing spring skeleton. Hair remains merged into the avatar body mesh.

The catalogue uses current Japanese salon references as shape guidance; it is
not a popularity ranking or a claim about 1997. No salon photos or third-party
meshes are included. Reference pages:

- https://ash-hair.com/haircatalog/mens/26766/ — natural mash / centre part / clipped sides
- https://ash-hair.com/haircatalog/mens/22004/ — two-block natural mash
- https://takahatafudou.ash-hair.com/posts/59011286 — mash-wolf and textured movement
- https://seya.ash-hair.com/posts/54315172/ — spiky short
- https://www.afloat.co.jp/hair_catalogtag/see-through-bangs/ — light fringes
- https://www.afloat.co.jp/hair_catalog/hairstyle/detail/57991/ — outward curl and layered bob
- https://www.afloat.co.jp/hair_catalogtag/レイヤーカット/ — layered lengths
- https://prtimes.jp/main/html/rd/p/000000100.000055092.html — AFLOAT's hime face framing

Developer gallery: `tools/japanese-hair-preview.html`, with `?turn=-0.65` or
`?turn=3.14159` for side and rear comparison. Gallery uses real avatar meshes;
the named cast faces and clothing remain unchanged in saved recipes.

Validation: 26 scoped avatar/wardrobe/creator checks, three additional identity, mesh and
shared-fitting checks, and three runtime packaging checks. Browser acceptance
selects all twelve new styles, checks desktop and phone layout, and saves and
reloads the airy-fringe bob without changing the blonde visitor's colour or
outfit. See `results.json` for completed browser evidence. Full town suite not run.

Character screenshots: `thuan-creator.png`, `nhung-creator.png` and
`ruta-creator.png`, captured from the actual creator. Ruta remains an editable
preset rather than a newly scheduled town NPC.
