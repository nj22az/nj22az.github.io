# Looks review evidence, 30 October 2026

Review branch `codex/pocket-camera-looks`, based on `claude/friendly-darwin-a4e3re` at `1ed9a7ef`.
Implementation `f59b2e10`; no publication to main. The original before/after sheets pair **round four | Codex's first pass**.

- [Portraits, phone size](portraits-before-after.jpg): three portraits, six Looks.
- [Scenes, phone size](scenes-before-after.jpg): café, garden and night, seven Looks.
- [Unscaled face details](face-detail-before-after.jpg): the restaurant and braids crops, six Looks. The fixed common
  crop shows different facial areas on the two photos; the audit's individually placed crops were also inspected.
- [Machine-readable evidence](evidence.json): input hashes, review crops, renderer and large-output measurements.

The complete review used six photos at 1080 output lines, 240-line phone sheets and 300 × 300 unscaled crops from
each photo, plus LIGHT-build comparisons. These selected sheets illustrate the work; they are not a physical-device
test. Scores and remaining faults are in [the standing audit](../../AUDIT-LOOKS-2026-10-30.md).

Reproduce from the repository root (the photos remain outside the repository):

```sh
python3 tools/camera-test-photos.py /tmp/bench/in
node tools/render-camera-looks.mjs --person --looks crayon,manga,lines,stamp,print,oil,tilt --out /tmp/bench/after /tmp/bench/in/*.jpg
# Add --light for a phone build. A live viewfinder does not use a person mask; --person models a still-photo editor.
python3 tools/camera-look-sheet.py --out /tmp/bench/review.jpg --looks crayon,manga,lines,stamp,print,oil,tilt --photos portrait-restaurant,portrait-braids,portrait-hat,cafe,garden,night /tmp/bench/before /tmp/bench/after
```

Photo credits and changes:

- Restaurant: Vladislav Anchuk, [Pexels 29747506](https://www.pexels.com/photo/29747506/), Pexels licence.
- Braids: Ozan Çulha, [Pexels 28890349](https://www.pexels.com/photo/28890349/), Pexels licence.
- Hat: Yulia Rozanova, [Pexels 3024599](https://www.pexels.com/photo/3024599/), Pexels licence.
- Café and garden: Nils Johansson, the existing repository photographs.
- Night: Martin Falbisoner, [Dotonbori, Osaka, at night, November 2016](https://commons.wikimedia.org/wiki/File:Dotonbori,_Osaka,_at_night,_November_2016.jpg),
  [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The night panels are cropped, resized and altered by
  the named shaders, and remain under that licence. Other panels retain their own source licences.

Mask research, exact asset sizes/hashes, Apache licence and phone limitations:
[person-mask dependency note](../../vendor/person-mask/README.md).

## Owner-list extension

Final runtime `c67237c4`, [draft PR #405](https://github.com/nj22az/nj22az.github.io/pull/405). The same six sources and
crop coordinates were used. Ten changed/new Looks × six were rendered full and LIGHT; VGA and Anime were rerendered
on all six after refinement. Phone sheets and unscaled crops were inspected for each. One Codex reviewer used the
README personas; this is not endorsement by the named artists or an independent human panel.

- [Film Looks](new-film-looks.jpg): Natural, Colour film, Disposable, Warm slide, Soft negative and Instant; all six.
- [Digital and painted Looks](new-digital-looks.jpg): 1-bit Mac, VGA adventure, Anime background, Glitch and Oil; all six.
- [Oil before/after](oil-before-after.jpg): the preceding camera Oil versus the eight-sector camera body; all six.
- [Final UI log](camera.browser.txt): 56/56, all 42 Looks drawn.
- [Functional shader/pipeline log](photo-pipeline.browser.txt) and [real local mask log](person-mask.browser.txt).
- [First-pass UI log](camera.browser-round5.txt): the earlier 34-Look runtime.
- [Initial extension UI failure](camera.browser-first-extension-run.txt): Memory fit failed under concurrent large-image
  load; the final full run passed unchanged bounds. The cause is unknown, not claimed fixed.

Software large-output checks also completed for Oil, Anime and Glitch at 3000×4000. Inputs were enlarged bench
photographs, not native 12 MP captures. Nothing here measures iPhone frame rate, memory or Safari compatibility.
