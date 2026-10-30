# Pocket Camera Looks, audited by their own users — 30 October 2026

The owner: "Yes proceed but you need audit yourself imagine you are a professional designer and you would pay a lot of
money for this app", then "Identify who is the user for each shader, audit as this user. Manga is Rumiko Takahashi and
Akira Toriyama for instance". Four independent reviewers, each in the persona of a Look's users (the table in
[README.md](README.md#who-each-look-is-for)), judged every Look on six photos (two portraits at night, an elderly woman
in a conical hat, a café, a shady garden, a night street in Osaka), at phone size, 1:1 and 2x. Scores are theirs, out of
10, on the renders of commit `8aaa2171d`. This is the standing backlog: the status column is kept up to date. Statuses below are after the same day's two rounds of rework
(see the camera handover); a "Partly" or "Open" row is the next work, and a fix is judged again by its own judge.

## Drawn

| Look | Judge | Score | What they demanded | Status |
|---|---|---|---|---|
| Manga | Takahashi, Toriyama | 4 | Close the face with one contour; teeth one white shape; black clothes and hair solid black with highlight cuts; one tone per surface, no salt-and-pepper granite or static garden || Partly: blacks solid, masses one tone, contours both sides, anti-aliased screens; teeth one shape where they are bright (round two). Hair highlight cuts not done |
| Pencil manga | the same, in pencil; Inoue | 3 | Deep shadows as broken graphite strokes, not grey smudges; the darkest values the densest strokes; same face faults || Partly: shadows are three layers of strokes along the form; teeth as Manga (round two) |
| Line drawing | Moebius | 3 | Long strokes following the form, only in shadow, light left as paper; no hatching rain on lit walls; a few deliberate wrinkle lines || Partly: strokes follow the form, shadows only; teeth as Manga (round two). Wrinkle economy not done |
| Sketchbook | an Urban Sketcher | 4 | Darks in Payne's grey or indigo, not slate or cobalt; no hatching on lit skin; leave paper at the margins and the highlights unpainted || Fixed (round two): Payne's grey darks, shading in shadows only, the wash stops short of a ragged paper margin where the pencil trails off |
| Pencil crayon | a picture-book illustrator | 2 | Strokes that curve with the form, not a straight lattice; saturated layered colour, darks from complementaries || Rebuilt (round two): grain streaked along the hand, paper showing, no lattice; darks burnished |
| Adventure Ink | Toriyama's colour pages | 3 | A confident ink contour on every silhouette; a base colour and one hard shadow; teeth one shape || Rebuilt (round two): cel colour (a base, one hard shadow, a highlight) from an edge-keeping material colour, fine ink contour, teeth one shape |
| Cartoon | a TV anime colour designer | 3 | A base and one shadow per material; thick outlines; no jagged tone edges; no photo texture || Rebuilt (round two): a base and one shadow per material, thick brush-pen outline, no photo texture |
| Comic dots | 1960s comic printers; Lichtenstein | 1 | Stop brightening (it doubled the light and erased faces); a working cyan plate; solid black; a black keyline; anti-aliased dots || Rebuilt: no exposure, fixed-step tints, solids, keyline, anti-aliased dots |

## Painted and print

| Look | Judge | Score | What they demanded | Status |
|---|---|---|---|---|
| Watercolour | Beatrix Potter; an urban watercolourist | 3 | No outline round every patch; darks as transparent indigo or sepia glazes, not grey mud; paper left white || Rebuilt: no outlines, glazed darks, paper white, granulation |
| Oil painting | Edward Hopper | 4 | No clipping to black and white (a night is deep green-blue); no white specks or halos; strokes on canvas || Partly (World lines replaced): coloured darks, no clipping, fewer specks, brushwork everywhere. Canvas strokes still faint |
| Heavy brush | Van Gogh | 3 | Distinct directional dabs following the form; no black blotches at mouth corners; lifted, complementary colour || Rebuilt: distinct dabs along the form, no mouth blots, lifted colour, Prussian-blue line |
| Woodblock | Hokusai, Hiroshige, Hasui | 4 | A graded sky (bokashi) at night and by day; fewer, cleaner blocks; a fine key-block line on the face || Partly: graded sky (bokashi) by day and night, bigger blocks, key line. Some grey patches on skin remain |
| Risograph | a zine maker | 4 | Darks as the two inks overprinted, not mid coral; a grainy stochastic screen, not a round-dot grid; colours separated by hue || Rebuilt as a family of five (overprinted darks, grain screen, separation by ink) |
| Rubber stamp | eki-stamp designers | 5 | Much less ink (a carved line drawing with a few solid masses); wear as starved ink on the light side, not round holes; teeth one shape || Partly: less ink, starved grain instead of holes, carved lines, no mouth blots. Still heavy on busy dark scenes |
| Blueprint | Anna Atkins | 7 | Paper white clear, not fogged; a brush-coated border and paper fibre || Fixed (round two): a brush-coated border with a bare-paper margin, uneven coat, paper fibre, the paper clear and warm |

## Photo

| Look | Judge | Score | What they demanded | Status |
|---|---|---|---|---|
| Natural | an iPhone photographer | 8 | A sharper resize of a tall photo into the frame || Fixed (round two): a photo made smaller is supersampled from the mipmap level twice the picture's size and lightly sharpened (Lanczos-like); detail on the night street 11.2 → 14.3 against Lanczos's 15.1; at 1:1 unchanged |
| Black & white | Daidō Moriyama | 5 | Real grain, clumped and strongest in the mid-greys; a softer toe (36% pure black); halation round lights || Rebuilt: grain, softer toe, halation |
| Sepia | a Meiji studio photographer | 5 | Blue-sensitive grey conversion; chocolate blacks with separation, not a red-brown slab; soft edges and fall-off || Rebuilt (round two): blue-sensitive grey, chocolate blacks with separation, soft edges and fall-off, faded album border |
| Instant film | Wim Wenders | 6 | No light leak (integral film is sealed): uneven development at the bottom edge instead; no grain; teal-black shadows || Rebuilt (round two): soft, no grain, dye mottle, teal-black shadows, the developer uneven at the bottom edge, no light leak |
| Miniature | Olivo Barbieri | 4 | The plane of focus on the subject, not fixed mid-frame; no saturation burn; smooth round defocus || Partly: no saturation burn; round two puts the sharp band on an upright photo's upper third (the face). Tap to place it, and a smoother blur, still open |
| Night vision | a night wildlife cameraman | 4 | Automatic brightness, not a hard clip at mid-grey; halos round lights; scintillation and honeycomb, not scanlines; yellow-green phosphor || Rebuilt: automatic brightness, halos, scintillation, honeycomb, P43 yellow-green |

## Games and 80s

| Look | Judge | Score | What they demanded | Status |
|---|---|---|---|---|
| Pocket | the Game Boy Camera's team | 7 | 112 rows (the camera's 128×112), so the big pixels show; ease the top of the curve on faces || Fixed: 112 rows, an easier curve on faces |
| Colour hand-held | Game Boy Color artists | 4 | Eight shared four-colour ramps, not a palette per tile; little or no dither; bright tiles keep their full colour || Rebuilt: eight shared ramps by hue and strength, flat colour, checker only at shade boundaries |
| Red visor | Virtual Boy | 5 | Mostly black (no exposure to middle grey); the gap between LED rows actually drawn, as horizontal lines || Fixed: darkened, row gaps drawn |
| 8-bit | Famicom artists | 4 | One sub-palette per 16×16 block (three colours of one hue column plus black); hue-first matching, no grey sludge; night in black || Rebuilt: one sub-palette per 16×16 block from a hue column, black backdrop |
| 16-bit | Super Famicom artists | 6 | Fuller ramps (purple, magenta, blue, neutral grey); no teal specks in skin || Rebuilt (round two): nine five-step material ramps in 15-bit colour, light dither, not exposed |
| 32-bit | PlayStation artists | 3 | 5-bit colour (it kept 4); affine texture warp on a coarse snapped mesh; coarser texels || Fixed (round two): a 4×3 mesh tilted enough that the affine kinks show, fitted to the screen |
| 64-bit | Nintendo 64 texture artists | 3 | Much smaller, quantised textures so the three-point smear shows; fog only in the distance, never over blacks || Fixed: 48-texel 15-bit texture under the three-point filter; fog only in the distance |
| Old TV | a Shōwa family | 5 | Brighter (a set glows); a smooth rounded screen edge, not a staircase; composite softness and glow || Rebuilt (round two): bright, rounded smooth screen edge, composite softness, scanlines widening in the light, bloom |
| VHS camcorder | a parent at sports day | 4 | Colour trailing to the right, not the left; rare white dropout streaks, not star dots; one clear head-switch hook at the foot || Fixed: colour trails right, rare white dropout streaks, one hook at the foot |

## Round two re-audit and round three (30 October 2026)

A second reviewer judged all 34 Looks fresh after round two, in the same personas, with the round-one scores beside
them. Scores (round one → round two): manga 4→4, pencilManga 3→3, lines 3→3, sketchbook 4→5, crayon 2→3, adventureInk
3→3, flat 3→3, halftone 1→4, watercolour 3→4, oil 4→5, brushOil 3→3, print 4→4, stamp 5→5, cyanotype 7→7, riso 4→4
(the four new Risos 3–5), pocket 7→7, colourHandheld 4→3, redVisor 5→4, eightBit 4→3, snes 6→6, thirtyTwoBit 3→3,
sixtyFourBit 3→3, crt 5→5, camcorder 4→4, none 8→8, mono 5→6, sepia 5→5, instant 6→6, tilt 4→4, nightVision 4→5.
Its ranked fixes, and what round three did with each:

| # | Their fix | Round three |
|---|---|---|
| 1 | Zipper teeth in every line Look | `inked()` leaves out any mark that is itself light (its darkest neighbour above about 0.45), as well as the bright-teeth rule; Manga, Line drawing, Pencil manga and Adventure Ink draw one white smile on both portraits. Cartoon's colour fill still darkens the gaps |
| 2 | Smooth before inking (specks on faces) | Partly: Cartoon and Adventure Ink ink only clearer lines (higher thresholds). A despeckle pass is not done |
| 3 | Silhouette contours | Not done beyond the existing colour contour |
| 4 | Attribute clash on faces | 8-bit: four sub-palettes for the screen (warm, green, blue, grey) plus black, 13 colours at most. Colour hand-held: a warm tile is skin unless strongly red. No clash crosses a face in the test photos |
| 5 | Riso grain and tone | Interleaved-gradient grain on 2 px cells instead of white noise; a drum prints at least a light tint where it prints, so faces are not blown out |
| 6 | Separate the twin Looks | Cartoon: two values, thick line on silhouettes only. Adventure Ink: airbrushed shading, a thin pen line. Line drawing: black pen, one direction of hatching. Pencil manga: graphite grey with a smudged tone under the strokes |
| 7 | Never reframe; no stair-steps | 32-bit: the photographer's framing kept; the kinks come from a 6×4 mesh whose corners wobble and snap to whole pixels. 64-bit: the three-point filter worked out per pixel (no steps), 64 texels tall |
| 8 | Focus on the subject | Miniature: upright 0.66, wide 0.54 (no tap yet). Instant: sharp in the middle, soft only towards the edges |
| 9 | Signal bandwidth | Old TV: softer along the line and a wider bloom. VHS: softer luma, colour smeared wider to the right, a torn head-switch band at the foot (the date stamp is the camera's own Date setting) |
| 10 | Paint direction | Heavy brush: near-black painted Prussian blue, so a night sky carries strokes. Watercolour: the lights left as paper |

Also from its table: Stamp's solids are solid (starved ink only at the light-pressure side, coarse); Black & white's
curve harder and its grain visible on a phone; Sepia's faded edge a soft rounded print, not a bevel; Blueprint's brush
marks run along each edge; Night vision's tube is round on upright photos too; Red visor is exposed and then set low,
so faces read as dim red; 16-bit's dither is light enough that skin is flat; Pocket's edge enhancement is stronger.
Round three has not been re-judged by a reviewer yet. Round three is published (`main` `3a54aa6cf`).

Round four, on the reviewer's remaining items: specks (fix 2) — strokes, not specks, in every line Look (a continuity
test), and the cel Looks paint over thin dark marks before colouring; Cartoon's outline found at twice the scale (its
smile one shape, a few bold wrinkles instead of a scatter); focus on the subject (fix 8) — a tap places Miniature's band.
Silhouette contours (fix 3) were tried as a wider colour edge thinned to its crest and left out: no visible gain on the
test portraits for about thirty more samples a pixel. A subject mask is the way to outline a person against a
background of their own colour and light.

## Codex re-judgement of rounds three and four (30 October 2026)

One Codex reviewer, making a separate pass in each README persona; these are **not independent human reviews** or
claims that the named artists reviewed the app. Round three is `3a54aa6cf`; round four is `507dad865` (the shader
bytes at handover `1ed9a7ef`). All six test photos were fetched successfully with `camera-test-photos.py`, rendered
1080 lines tall in the full build, and inspected at 240-line phone-sheet size and in unscaled 300 × 300 detail crops.
The changed seven Looks were rendered again from round three; the other 27 share exactly the same shader and
prepare-pass bytes between the rounds, so their round-four renders serve both. Miniature's default render is
unchanged; its extra point is for the now user-placeable band, not better optical defocus. Software Chromium 133 /
SwiftShader is the renderer; this does not verify phone speed, the LIGHT builds or a 12 MP save.

Detail crops (x0,y0,x1,y1): restaurant `240,210,540,510`; braids `300,300,600,600`; hat `600,200,900,500`;
café `350,400,650,700`; garden `600,400,900,700`; night `450,350,750,650`. A score assesses the medium and all six
subjects together; it is not an image-similarity score. Earlier scores remain above for comparison.

| Look | Round 3 | Round 4 | Persona's remaining objection |
|---|---:|---:|---|
| Manga | 5 | 5 | Takahashi/Toriyama: smile clearer, good black clothes; face silhouette disappears into light background; garden still busy; no hair highlight cuts |
| Pencil manga | 4 | 4 | Inoue/mangaka's pencils: graphite distinct from pen, but the face disappears and darks do not have enough graphite weight |
| Line drawing | 4 | 4 | Moebius: café structure reads; disconnected face, too many little garden marks and directional hatching still changes abruptly |
| Sketchbook | 6 | 6 | Urban Sketcher: margin and wash work; too many mechanical marks in the elderly face and foliage |
| Pencil crayon | 3 | 3 | Picture-book illustrator: crosshatched mesh and pale scratch grain still dominate; colour too grey, especially garden; teeth individually overdrawn |
| Adventure Ink | 4 | 5 | Toriyama colour pages: cleaner cheeks, but still a treated photograph rather than clearly chosen cel planes; weak person silhouettes |
| Cartoon | 3 | 4 | TV anime colourist: round four clears some tooth gaps; skin still orange and elderly wrinkles/pores too heavily inked; lost silhouette |
| Comic dots | 5 | 5 | Comic printer: four plates now read; elderly face and foliage too noisy, keyline sometimes broken |
| Watercolour | 5 | 5 | Potter/watercolourist: white paper and coloured glazes; wash rims too mechanically repeat the photographic tonal islands |
| Oil painting | 6 | 6 | Hopper: convincing quieter masses and coloured night; canvas still very faint, facial planes sometimes soft blocks |
| Heavy brush | 4 | 4 | Van Gogh: visible directional dabs, but a fine repeated bristle carpet; orange skin and too little variation of stroke scale |
| Woodblock | 4 | 4 | Hasui/Hiroshige: bokashi works; grey/cream islands on cheeks, broken keyline, too much foliage detail |
| Rubber stamp | 4 | 4 | Eki-stamp designer: busy garden becomes ink thicket; teeth are carved separately; station-stamp economy not reached |
| Blueprint | 7 | 7 | Atkins/engineer: coherent coat and paper margin; photographic rather than contact-print silhouettes |
| Natural | 8 | 8 | iPhone photographer: framing and detail retained; real-device colour handling unverified |
| Black & white | 7 | 7 | Moriyama: useful strong darks and mid-tone grain; still rather tidy at phone size |
| Sepia | 5 | 5 | Meiji studio: all six veiled in brown, deepest values need more separation |
| Instant film | 7 | 7 | Wenders: restrained fade, readable portrait; bottom developer edge still rather regular |
| Miniature | 5 | 6 | Barbieri: tap now chooses the plane, but coarse blur and wide sharp band weaken the model illusion |
| Night vision | 6 | 6 | Wildlife cameraman: tube and amplification work; bright halo at tube rim competes with subject |
| Pocket | 7 | 7 | Game Boy Camera team: four greens and readable coarse faces; ordered texture is strong on garden |
| Colour hand-held | 4 | 4 | GBC pixel artist: useful shared ramps; cafe tiles clash and elderly skin drops to grey/brown |
| Red visor | 5 | 5 | Virtual Boy artist: LED gaps and blacks work; face lacks the intentional shape economy of console art |
| 8-bit | 4 | 4 | Famicom artist: colour budget works, but dominant orange and noisy facial shadow boundaries |
| 16-bit | 6 | 6 | Super Famicom artist: richer material ramps, good café; green/orange foliage and skin texture too photographic |
| 32-bit | 4 | 4 | PS1 artist: framing preserved, coarse texels and warp visible; a photograph on a mesh cannot imply all scene geometry |
| 64-bit | 4 | 4 | N64 texture artist: smooth three-point smear visible; reads as low resolution photo more than authored texture |
| Old TV | 6 | 6 | Shōwa family: glowing and softer; bright face can still bloom too much |
| VHS camcorder | 5 | 5 | Sports-day parent: colour trails and foot tear; still too clean/uniform over most of the field |
| Risograph | 6 | 6 | Zine maker: inks overprint correctly; screen is fine and photographic at phone size |
| Riso pink & blue | 6 | 6 | Zine maker: attractive violet overprint; middle skin values lack a more deliberate separation |
| Riso red & navy | 6 | 6 | Zine maker: useful dark ink and warm lights; still fine photographic screen |
| Riso black & pink | 5 | 5 | Zine maker: recognisable duotone; pink dominates busy scenes, dark masses not decisive enough |
| Riso three-colour | 6 | 6 | Zine maker: fuller colour without third black; busiest and most expensive of the separations |

Next work, in score order after the person-mask investigation: **Crayon (3)**; **Cartoon, Pencil manga, Line drawing,
Heavy brush, Woodblock, Stamp (4)**. The console rows above have faults too, but the standing Open/Partly drawing and
print backlog takes precedence. No row is closed solely because code changed.
