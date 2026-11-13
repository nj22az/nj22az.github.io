#!/usr/bin/env python3
"""The homepage painting: the street outside Sakura Shōten, repainted by Pocket Camera's own Looks.

Run from the repository root, with nj22az/johansson-town cloned as johansson-town/ (the Looks are World's shaders):
    python3 tools/office-painting/build.py
It draws assets/world/sakura-current.webp through camera/looks-gl.js (tools/render-camera-looks.mjs) and writes
assets/office-painting/street-<look>-<width>.webp. The Looks and their order are LOOKS below; the page's buttons are
in index.html and must name the same files.
"""
import subprocess, tempfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/world/sakura-current.webp"
OUT = ROOT / "assets/office-painting"
LOOKS = ["watercolour", "print", "sketchbook", "manga", "cyanotype"]  # plus "natural", the picture as the game drew it
WIDTHS = [1600, 800]

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGB")
    with tempfile.TemporaryDirectory() as tmp:
        photo = Path(tmp) / "street.jpg"
        source.save(photo, quality=96)
        subprocess.run(["node", "tools/render-camera-looks.mjs", "--looks", ",".join(LOOKS), "--lines", str(source.height),
                        "--out", tmp, str(photo)], cwd=ROOT, check=True)
        pictures = {"natural": source, **{look: Image.open(Path(tmp) / f"street--{look}.png").convert("RGB") for look in LOOKS}}
        for look, picture in pictures.items():
            for width in WIDTHS:
                height = round(picture.height * width / picture.width)
                picture.resize((width, height), Image.LANCZOS).save(OUT / f"street-{look}-{width}.webp", quality=80, method=6)

if __name__ == "__main__":
    main()
