# VRoid town cast

The realistic resident faces did not fit the owner's desired cute anime style.
The 21 named town residents now use actual VRoid Studio sample geometry: large
illustrated eyes, clean facial features, varied hair and softer clothing colours.
Five bases share geometry and textures; every entity keeps its own skeleton,
materials, height, blinking phase and existing identity. The mapping lives in
`src/people/vroid.js`. Names, friendships, dialogue, schedules, supper visits and
v4 saved relationships still refer to the original profiles.

The supplied Yuri model and its own animations remain connected. The office,
ramen restaurant, Minato exterior/interior, first-person controls and travel
progression are independent of this character change.

## Sources and reproduction

Only the older samples explicitly released by pixiv under CC0 are used. This
does not assert that all VRoid Studio or VRoid Hub models have the same licence.
The model-specific creator pages, pinned public mirror URLs and original SHA-256
hashes are in `assets/characters/vroid/manifest.json` and the asset attribution
ledger. No authoring VRM, external asset URL or account is needed during play.

Download the five `sourceURL` entries in that manifest into an authoring folder,
keeping their original filenames. From the game directory, with NumPy and Pillow:

```sh
python tools/pack-vroid.py --sources /absolute/path/to/original-vrms
npm test
npm run build
blender -b -t 4 -P tools/blender/review-vroid.py -- /absolute/path/to/review-output
```

The packer verifies each original file against its pinned hash and embedded CC0
metadata. It preserves humanoid bindings and vertex weights, merges source hair
strips into atlas draws, retains three face morphs, and removes unused authoring
textures and metadata. Its 512–1024px atlases have padded borders. Runtime
materials use the exported illustrated colours without specular skin highlights.
Per-resident hair and wardrobe materials share the underlying textures.

Seven original clips cover idle, walk, run, wave, sit, eat and drink. The leg solver
plants the actual deformed soles; exported stride measurements control playback
speed at each resident's height. Seated skirt roots hold the waist attachment and
drape the front panels over the lap. Fitted dark shorts sit beneath the skirts.
The cup follows the right hand and stays
upright. Glasses use the visible iris centres, rather than the eye rotation pivots
inside the head. Blinking and gentle smiles run independently of body animation.

VRoid 0.x faces -Z. An export root turns it to +Z; the existing game model wrapper
turns it back to the town's -Z actor convention. Conversation facing and walking
therefore continue to use the same entity transforms.

## Validation and budget

The manifest records five bases and twenty atlas images, totalling approximately
12 MB. Each base has four or five skinned draws and 24,858–39,548 triangles.
Spectacles add one draw for selected residents. The five bases are downloaded
once and reused across all 21 actors; no 21-copy character download is required.

The automated checks load the real GLBs and texture paths, verify file hashes,
blended skin weights, face morphs, every clip's deformed bounds and planted soles.
They attach the entire named cast through the production loader and exercise
movement, greetings, blinking, independent materials/skeletons and drinking. The
existing game suite also covers interiors, social visits, Yuri's supplied rig,
first-person controls, saves and quest progression. CPU renders inspect the shipped
atlases and geometry in standing, walking, greeting and seated poses. These are
asset renders; browser rendering and device frame rates are not measured here.

The former MakeHuman cast in `assets/characters/neighbours/` and older prototypes
are archived for rollback and are not preloaded as active town residents.

## Scene-lighting trial and surface contact

Aya and Kenji now use matte Lambert materials at runtime. Their illustrated
atlases, palette, alpha cutouts, skinning and face morphs are retained; the
existing sun, hemisphere and room lights and AgX exposure now affect them.
Other neighbours retain the unlit baseline for comparison. This adds no character
draws or textures, but the lit shader and its shadow reception still need device
measurement. The source GLBs remain unchanged.

The outer pier renderer and ground-height query share the same deck height;
residents also start at the correct terrain elevation before their first step.
The ramen exterior closes the supplied left door leaf, including its window and
sign, by transforming isolated copies of its geometry. The interior source,
entrance interaction and exit route are preserved.

Validation: 56 tests and the production build pass, including real character
loading, retained cutouts and expressions, pier height, closed-door ray hits and
interior isolation. Browser appearance, shader execution and device frame times
remain unverified: the review browser could not create a WebGL context because
its graphics renderer was disabled. Compare the lighting trial in daylight,
evening and Minato before expanding it to the rest of the cast.

The follow-up glitch pass resets stale walking and greeting actions after
visibility changes or instant relocation, and suspends mixers beneath hidden
parents. Conversation framing uses the animated VRoid eye anchors or Yuri's
head/crown rather than one fixed height, so seated speakers are framed correctly.
Regression checks reproduce the previous hidden-parent animation fault and
cover reappearance, relocation, interrupted greetings and standing/seated focus.
All 56 tests and the build pass; the browser/device limitation above still applies.
