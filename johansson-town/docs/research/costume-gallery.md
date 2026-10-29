# The costume gallery (COSTUME-DB-01): a reference for the wardrobe

The owner, 29 October 2026: "https://ai-costume-gallery.pages.dev/ Bring the suitable outfits to Johansson world".

## What it is

<https://ai-costume-gallery.pages.dev/>, 衣装集 COSTUME-DB-01 ("画像参照用衣装集", a costume collection for image
reference), by ギア. 1,407 pictures of outfits on their own, with no person in them, each 2:3 and each with an id and
a line of keywords (`SPR-0008`: "green ribbon shirt dress beige tights sandals mini bag gold"). Eight categories, counted
on 29 October 2026: spring `SPR` 215, summer `SUM` 254, autumn `AUT` 244, winter `WIN` 253, lingerie `LNG` 199, party
`PTY` 48, swimwear `SWM` 54, "sexy" `SXY` 140. Every picture was generated from text (t2i); none is a photograph of a real
product.

## Its terms, and what they mean for us

The gallery's own notes (注意点), in English:

- Free to use, including commercial use, editing and use as a reference in making a work.
- **The image data itself (at full size or processed) may not be redistributed, reposted or resold.**
- No credit is needed (credit is optional). The images' metadata has been removed. No warranty.
- The outfits are fictional and made with AI; they are not photographs of real products. They were checked for
  likeness to existing brands before publication, without a guarantee that no one's rights are infringed; users check and
  decide for themselves.
- **Not to be used to depict real people or minors**, or for anything against public order and morals.

So:

1. **No picture of the gallery is in this repository, the game, Johansson Studio, the guide or the website.** The
   thumbnails were looked at in a scratch folder of the working session and deleted with it. What we keep is text: the
   ids and their keywords, below.
2. The gallery is a **reference**, as New Yokosuka is (`new-yokosuka.md`): study, never copy. Each look is rebuilt from
   World's own garments (`src/avatars/recipe.js` PARTS, painted by `garment.js`, built by `build.js`) in the island
   palette (`briefs/character-style.md` §6), and gets an islander who wears it and a reason (CLAUDE.md, "Nothing is
   random").
3. **Every set made from it is written for the island's grown-ups.** No child's look is taken from the gallery. (The
   maker lets anyone wear anything, as it always has: `outfits.js outfitAllowedFor`.)
4. Credit is not required; the source is still named here, in `RESOURCE_SOURCES.md` and beside the sets
   (`outfits.js`, `reference`).

## What is suitable, and what is not

Minato Machi is a small Okinawan port town in the 1990s, sun-washed and subtropical, and a family game. The gallery is
contemporary Japanese and Korean womenswear, so most of it is left out:

| Category | Kept | Why |
| --- | --- | --- |
| Lingerie (199), "sexy" (140) | none | Not for a family town. |
| Swimwear (54) | none | Mostly bikinis. World's beach and bath swimwear is its own modest system (one-piece costumes, the skirted one for the older generation, trunks: `build.js`, the swim tests). |
| Party (48) | 4 | Mostly satin bodycon gowns with heels and gloves. The soft chiffon midi dresses became the celebration dress. |
| Autumn (244), winter (253) | 5 | Mostly fur, wool coats, tall boots and sheer tights for a mainland winter. The island's winter is January's north wind: knitted layers only. |
| Spring (215), summer (254) | 37 | The everyday looks: shirt dresses, long tiered and denim skirts, linen trousers and sun hats, gingham, denim jackets and shirts, knitted vests over shirts, hoodies and wide jeans. |

Across every category we leave out sheer tights and stockings, lace legwear, corsets, crop tops and bandeaus, and mini
skirts with over-the-knee socks: they are not the island's 1990s everyday dress.

## What the gallery needed that World did not have

Two pieces, both appended (no saved look or share code moves) and never dealt by the dice:

- **The tiered skirt** (`tieredskirt`, `src/avatars/tiered-skirt.js`): the gallery's most worn long skirt (spring and
  summer, many times). A smooth yoke and two gathered tiers on the long skirt's line, each tier a hem's step fuller than
  the seam it hangs from.
- **Gingham** (the print `gingham`, `garment.js`): the summer gingham of its blouses and sundresses. On a top only: a print
  on a skirt is coloured per vertex and comes out jagged (the plaid), so a gingham dress is a gingham bodice over a plain
  skirt.

Everything else is World's existing garments: a shirt or blouse over a long skirt of the same cloth reads as one dress;
the jacket in indigo is a denim jacket; the shirt in indigo a denim shirt.

## The sets, and the looks they were studied from

Thirteen sets in `src/avatars/outfits.js` (after `vy-monochrome`), 35 colourways, from 46 looks. A colourway is one look
where the looks differ only in colour; every colour is from the island palette, not the gallery's.

| Set | Who wears it | Gallery looks (id: keywords) |
| --- | --- | --- |
| `tiered-sunday` | Miss Higa, Sunday morning | SPR-0100: beige knit ivory skirt white sneakers bag necklace · SPR-0117: green knit beige skirt pumps mini ribbon bag choker · SUM-0218: white ivory midi skirt black sneakers silver choker leather bag |
| `cherry-bench` | Ms Ganaha, February | SPR-0023: pink floral midi dress denim jacket white socks sandals mini · SPR-0095: ivory ribbon chiffon camisole blue pleated midi skirt denim jacket · SPR-0116: pink frill knit skirt denim jacket sandals bag necklace · SPR-0053: blouse cream pleated midi skirt denim jacket sandals mini ribbon |
| `shirt-dress` | Ms Uezu, Nhung | SPR-0008: green ribbon shirt dress beige tights sandals mini bag gold · SPR-0016: green ribbon shirt dress beige tights sandals mini bag gold · SUM-0164: blue shirt dress black sandals leather tote sunglasses · SUM-0253: khaki shirt dress black sandals leather tote sunglasses |
| `linen-trousers` | the summer visitors, Ms Uezu | SUM-0096: mint pants sandals bag necklace · SUM-0074: blue mint pants sandals bag necklace · SUM-0108: navy pants sandals mini bag hat · SUM-0155: pants white sneakers mini bag gold necklace |
| `laundry-round` | Ms Ganaha, mornings | SUM-0183: grey shirt denim maxi skirt black sandals bag silver necklace · SUM-0193: white knit denim midi skirt black sandals mini bag silver · SUM-0254: white shirt black denim maxi skirt sandals bag silver necklace |
| `late-bowl` | Ren, after half past ten | SPR-0199: grey hoodie denim jeans black sneakers bag · SPR-0206: khaki hoodie black denim jeans white sneakers bag · WIN-0194: red black shirt jacket grey hoodie pants sneakers bag |
| `pier-watch` | Kai, between calls | SUM-0209: white shirt khaki pants black sneakers bag silver necklace · SUM-0177: white shirt brown satin pants black sandals leather bag silver · SPR-0162: khaki shirt jacket white black pants sneakers corduroy bag |
| `gingham-holidays` | Miss Higa, summer holidays | SUM-0038: navy dress lace socks sandals tote necklace · SUM-0057: dress shirt white socks sneakers bag sunglasses · SUM-0086: blue dress lace socks sandals bag sunglasses · SUM-0125: navy orange denim mini skirt white socks sandals bag sunglasses |
| `haarii-day` | the crowd at the Haarii races | SUM-0160: dress shirt lace socks sandals ribbon bag gold necklace · SUM-0156: black dress shirt white socks sandals bag hat · SUM-0149: orange dress lace socks sandals tote hat · SUM-0079: orange dress lace socks sandals ribbon bag necklace |
| `january-classroom` | Miss Higa, January | SPR-0221: grey knit white shirt navy pleated midi skirt black loafers · SPR-0207: brown knit blue shirt black pleated midi skirt loafers white · SPR-0177: knit vest white shirt beige brown suede loafers mini bag · AUT-0212: grey knit vest blue shirt brown loafers white socks black |
| `verandah-january` | Grandmother Higa, January | WIN-0187: ivory knit grey wool black boots mini bag muffler · WIN-0196: red cardigan ivory grey ribbon belt leather bag black loafers · WIN-0165: green knit black skirt brown sneakers bag |
| `trading-round` | Kōji, weeks ashore | SPR-0246: blue denim white cream black sneakers bag · SPR-0252: white shirt jeans black sandals bag silver choker · SUM-0236: blue shirt beige shorts black socks tights loafers mini bag |
| `celebration-dress` | wedding and sixtieth-birthday guests | PTY-0026: chiffon midi dress ribbon heels · PTY-0034: chiffon midi dress ribbon heels · PTY-0013: beige chiffon midi dress ribbon heels · PTY-0045: ivory chiffon midi dress ribbon heels |

`tests/wardrobe-gallery.test.mjs` holds each set to this table: every id it names is listed here.

## Adding more from the gallery

1. Pick a look from spring or summer (or the knitted layers of autumn and winter) that a grown-up islander would wear in
   the 1990s, and say who and why from what the town already knows (`guide/residents.json`, `src/people/roster.js`).
2. Build it from World's parts in the island palette; add a colourway rather than a new set when only the colours differ.
   A garment World lacks is a new part, appended to its slot, with its catalogue entry (`wardrobe-catalogue.js`).
3. Put the gallery ids in the set's `reference` and add them to the table above.
4. Look at it: `tools/wardrobe-sheet.html?body=Ms%20Ganaha&sets=<ids>` (front; `&back=1`, `&pose=walk`, `&turn=1.57`),
   served from `johansson-town/` (`python3 -m http.server`). Then run `tests/wardrobe-gallery.test.mjs`,
   `tests/avatar-wardrobe-sets.test.mjs` and the seat tests.
