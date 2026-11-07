# Johansson World: installed-game interface audit

18 October 2026. Steam Deck/Linux is the first delivery and test platform; the interface is intended to carry into macOS, iPad and iPhone ports. The browser edition keeps its current UI. Shared night-sound fixes are a separate change.

## Findings and decisions

| Observed problem | Consequence | Implemented direction |
| --- | --- | --- |
| Cream/green cards and long, equal-weight menu rows | Resembles a settings website; weak game identity | White and indigo organiser, coral selection, sky/lilac/peach icon panels |
| Many words before the player can choose | Slow scanning on a handheld | Six large Island icons with short labels; one focused explanation below |
| People displayed as a text directory | Playable residents feel anonymous | Existing code-rendered resident portraits, names, addresses and explicit active state |
| Run on L1, jump on R1, drink on X | Frequent movement actions occupy unusual controls | New island preset: R2 run, L2 look closely, X jump, Y bag, A interact, B back, R3 centre view |
| Calling the Deck control “Start” | The physical button is hard to find | Menu/View symbols, a controller diagram, first-entry guide and visible pause control |
| Every controller uses Xbox letters | Incorrect prompts on PlayStation/Nintendo pads | Detect reported family, offer persistent override, position diamonds for unknown face buttons |
| Clamped action captions and hidden alternatives | Player cannot tell what pressing a button does | Full wrapping primary action, icon, mapped button; D-pad left/right cycles nearby actions |
| Unstructured focus order | D-pad jumps unpredictably in grids | Spatial navigation, remembered focus, scroll into view, fixed L1/R1 section switching |
| Generic repeated hints obscure the scene | Exploration feels like a debug build | Quiet HUD, contextual prompts; learning information lives in the guide |
| Pause can close the conversation underneath | Returning loses context | Pause owns Menu and retains the underlying dialogue |

Existing explicit button mappings are preserved. “Use island controls” applies the new preset deliberately. Gameplay mappings and stable menu shoulder/quick-save controls are distinct. Confirm/back prompts follow remapping. Nintendo labels follow standard Gamepad *positions*: bottom B, right A, left Y, top X; the game does not silently invert the player's confirm/back locations. Steam Input can expose a virtual Xbox device, so hardware behind it cannot always be inferred; the override is available for that case. Unknown/non-standard devices still need assignment if their driver reports nonstandard physical indices.

## Reference research

These are design observations and deductions, not claims that one title represents all Japanese or anime fans. No Nintendo, SEGA or Apple artwork is shipped in the Linux UI.

- **Animal Crossing.** Nintendo's [New Horizons NookPhone introduction](https://www.nintendo.com/nl-nl/Nieuws/2019/juni/Ontdek-wat-het-eilandleven-voor-je-in-petto-heeft-in-Animal-Crossing-New-Horizons--1588039.html) presents discrete tools as apps. Its [New Leaf control sheet](https://csassets.nintendo.com/noaext/image/private/t_KA_PDF/3DS_Animal_Crossing_New_Leaf_en?_a=DATC1RAAZAA0) provides a compact control reference. Applied here: recognisable object icons, grouped tools and a compact learning surface. We avoid copying the leaf branding or turning the whole game green.
- **Tomodachi Life.** Nintendo's [original electronic manual](https://csassets.nintendo.com/noaext/image/private/t_KA_PDF/manual-3DS-tomodachi-life-en?_a=DATAg1AAZAA0), sections 10–11, shows location icons, residents and thought bubbles as the main navigation language. Nintendo's [Living the Dream overview](https://www.nintendo.com/au/games/nintendo-switch/tomodachi-life-living-the-dream/) foregrounds personalities and shared households. Applied here: portrait-led resident selection and homes as meaningful destinations, rather than a table of records.
- **Shenmue.** SEGA's [original manual, preserved by Digital Press](https://www.digitpress.com/library/manuals/dreamcast/shenmue.pdf), printed pages 10–11 and 14–21, connects a quiet daily-life HUD, a notebook and contextual icon selection. Applied here: keep the town visible, show the action that will happen, and put references in the town book. We keep modern two-stick navigation and do not copy the old movement scheme.
- **Nintendo-style usability.** The shared pattern in the manuals is a small set of controls, clear confirmation/cancellation and visible destinations. This is a usability direction, not a recreation of Nintendo system menus.
- **Anime/cel direction.** This is the project's art direction rather than one researched product: bold silhouettes, a limited colour palette, outlined icon shapes, character presence and restrained selection motion. Existing Johansson Studio-derived portraits remain the source of character identity; no new photorealistic or glossy toy artwork is introduced.

## Icons and future Apple ports

`steam-deck/ui/icons.mjs` is a semantic icon catalogue. Each original SVG carries `data-icon` and an SF Symbol name in `data-sf-symbol`. A future native Apple presentation layer can render that semantic symbol using the platform system API; the current Linux build renders the repo's original SVGs. The same actions and layouts can therefore carry over without embedding Apple font/glyph files. This is an integration contract, not a claim that an Apple app or renderer exists yet.

Apple's [SF Symbols overview](https://developer.apple.com/sf-symbols/) and [Xcode/Apple SDK licence §2.11](https://www.apple.com/legal/sla/docs/xcode.pdf) restrict system-provided imagery to the relevant Apple platforms. Restricted product symbols still need individual review when implementing Apple shells. SF Pro is a font; SF Symbols is the icon library. The Linux game keeps its existing system-font stack.

Touch-first presentation and Apple controller APIs will need platform validation in those future ports. This pass does not claim that a Steam Deck mock or browser controller simulation proves iOS support.

## Acceptance

- Actual installed game starts, moves, looks, jumps and interacts; not just a UI mock.
- Menu, guide, People, settings, save and confirmed quit work with controller and keyboard.
- Steam Deck, Xbox, PlayStation, Nintendo and unknown-controller prompts update on hot-plug; manual overrides persist and respect remaps.
- Unknown-controller face prompts show all four positions and highlight exactly the required one; screen readers receive its position name.
- Primary action text and confirmation glyph remain fully visible at 1280×800, 1280×720, 960×540 and 800×600. Menus scroll internally, without clipping the footer.
- Resident portrait images load locally; selection uses the same resident's real in-world recipe and home.
- Existing saves and remaps remain readable. Web UI and course routes are unaffected.
- Reduced-motion preference suppresses selection movement. Icons supplement concise labels and accessible names.
- Physical Steam Deck/controller testing remains pending; no Steam Deck Verified claim.
