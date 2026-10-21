# Harbour Park's keepers at work

Photos from World run from source on 21 October 2026, phone size (390×844), sunny weekday, Chromium with the
software renderer (swiftshader). Not checked on an iPhone, a GPU browser or a Steam Deck.

| Photo | Who | When | Where |
|---|---|---|---|
| `nakamura-bed.png` | Mrs Nakamura | 09:20–10:00, before she opens at ten | the entrance bed by the gate |
| `higa-getto.png` | Grandmother Higa | 08:35–09:00, before the liquor counter | the gettō screen on the bath's south fence |
| `higa-koi.png` | Grandmother Higa | 12:45–13:00, on her way to the bandai | the koi pond's north edge |
| `thuan-border.png` | Thuan | 15:04–15:09 on her afternoon walk (not on jan-ken-pon days) | the park side of the Main Street border |

In each photo the resident reached the stand point and played the Interact pose (`report` lines in the session log).
The data: `src/people/stand-sequences.js` (higa-getto, higa-koi, nakamura-bed), `src/people/social.js` THUAN_BORDER,
`src/world/harbour-park-garden.js` (`visit`); the test is `tests/park-keepers.test.mjs`.
