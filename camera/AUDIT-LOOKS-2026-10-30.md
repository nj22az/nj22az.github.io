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
| Natural | an iPhone photographer | 8 | A sharper resize of a tall photo into the frame || Open (the engine samples a tall photo through its mipmap; a Lanczos-quality resize needs the prepare pass) |
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
