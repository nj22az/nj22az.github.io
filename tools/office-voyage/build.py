#!/usr/bin/env python3
"""The voyage's pictures for the page: each PNG from render-plates.mjs as WebP at 1920 and 960 wide.
    python3 tools/office-voyage/build.py <dir-of-pngs>"""
import sys
from pathlib import Path
from PIL import Image, ImageOps

OUT = Path(__file__).resolve().parents[2] / "assets/office-voyage"
OUT.mkdir(parents=True, exist_ok=True)
# Under her bow the picture is mirrored, so the bulb stands at the right, clear of the words (there is no lettering on
# her below the waterline to read backwards).
MIRRORED = {"bulb"}
for png in sorted(Path(sys.argv[1]).glob("*.png")):
    picture = Image.open(png).convert("RGB")
    if png.stem in MIRRORED:
        picture = ImageOps.mirror(picture)
    for width in (1920, 960):
        picture.resize((width, round(picture.height * width / picture.width)), Image.LANCZOS).save(
            OUT / f"{png.stem}-{width}.webp", quality=80 if width > 1000 else 76, method=6)
    print(png.stem)
