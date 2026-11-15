#!/usr/bin/env python3
"""The homepage's paintings, all drawn by Pocket Camera's own engine (camera/looks-gl.js via
tools/render-camera-looks.mjs), so the page's Looks are the camera's. Run from the repository root with
nj22az/johansson-town cloned as johansson-town/ (the Looks are World's shaders).

    python3 tools/office-painting/build.py film <frames-dir>   # after capture-street.mjs
    python3 tools/office-painting/build.py scenes

film:   the street's painted stills (its first frame, in every Look: what the page shows before the film runs, and what
        it keeps with reduced motion) and the film itself, street-1280 and street-800 (.mp4 H.264, .webm VP9), unpainted: the page paints
        it as it plays. The film opens with Sakura Shōten's shutter going up at nine; after that it loops from LOOP_AT,
        and its last CROSSFADE frames are mixed into the frames just before LOOP_AT, so the jump back is not seen.
        The loop point goes to street.json, which office-painting-live.js reads.
scenes: the section scenes, SCENES below, cut to a 1600×560 band and painted in every Look.
"""
import json, shutil, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets/office-painting"
LOOKS = ["print", "watercolour", "sketchbook", "manga", "cyanotype"]  # and "natural": the picture as it is
WIDTHS = [1600, 800]
FPS = 12
LOOP_AT = 114        # frame 114 (9.5 s): the shutter is up and the shop is open
CROSSFADE = 18       # 1.5 s
# The section scenes: source, and the height of the band's centre in it (0 top, 1 foot).
SCENES = {
    # Over the town to the pier at nine in the morning (capture-street.mjs --pos 22,14,-30 --at -4,0,-62).
    "island": ("tools/office-painting/sources/island.webp", .52),
    # The harbour from the water: the clock tower, a fishing boat and the quay (--pos 12,8,-70 --at 0,1,-42).
    "harbour": ("tools/office-painting/sources/harbour.webp", .52),
    "garden": ("assets/images/nils-lake-hero.jpg", .56),
}
BAND = (1600, 560)


def paint(picture, name, lines):
    """Every Look of one picture, as {look: Image}."""
    with tempfile.TemporaryDirectory() as tmp:
        photo = Path(tmp) / f"{name}.png"
        picture.save(photo)
        subprocess.run(["node", "tools/render-camera-looks.mjs", "--looks", ",".join(LOOKS), "--lines", str(lines),
                        "--out", tmp, str(photo)], cwd=ROOT, check=True)
        painted = {look: Image.open(Path(tmp) / f"{name}--{look}.png").convert("RGB") for look in LOOKS}
    return {"natural": picture, **painted}


def save(pictures, name):
    for look, picture in pictures.items():
        for width in WIDTHS:
            height = round(picture.height * width / picture.width)
            picture.resize((width, height), Image.LANCZOS).save(OUT / f"{name}-{look}-{width}.webp", quality=78, method=6)


def film(frames_dir):
    frames = sorted(Path(frames_dir).glob("frame-*.png"))
    n = len(frames)
    if n < LOOP_AT + 2 * CROSSFADE:
        sys.exit(f"{n} frames: too few for a loop from frame {LOOP_AT}")
    first = Image.open(frames[0]).convert("RGB")
    save(paint(first, "street", first.height), "street")
    loop = n - LOOP_AT
    with tempfile.TemporaryDirectory() as tmp:
        for j in range(n):
            out = Path(tmp) / f"o-{j:04d}.png"
            k = j - LOOP_AT
            if k >= loop - CROSSFADE:
                # The tail becomes the frames just before the loop point, so the jump back to it is not seen.
                t = (k - (loop - CROSSFADE) + 1) / (CROSSFADE + 1)
                a = Image.open(frames[j]).convert("RGB")
                b = Image.open(frames[LOOP_AT + k - loop]).convert("RGB")
                Image.blend(a, b, t).save(out)
            else:
                shutil.copyfile(frames[j], out)
        for width in (1280, 800):
            height = round(first.height * width / first.width) // 2 * 2
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(Path(tmp) / "o-%04d.png"),
                            "-vf", f"scale={width}:{height}:flags=lanczos", "-c:v", "libx264", "-preset", "veryslow",
                            "-crf", "25" if width > 1000 else "27", "-pix_fmt", "yuv420p", "-profile:v", "high", "-g", str(2 * FPS),
                            "-force_key_frames", f"{LOOP_AT / FPS:.4f}", "-movflags", "+faststart", "-an",
                            str(OUT / f"street-{width}.mp4")], cwd=ROOT, check=True)
            # VP9 for browsers without H.264 (open-source Chromium, and so the page's own browser checks).
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(Path(tmp) / "o-%04d.png"),
                            "-vf", f"scale={width}:{height}:flags=lanczos", "-c:v", "libvpx-vp9", "-b:v", "0",
                            "-crf", "36" if width > 1000 else "38", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
                            "-g", str(2 * FPS), "-force_key_frames", f"{LOOP_AT / FPS:.4f}", "-pix_fmt", "yuv420p", "-an",
                            str(OUT / f"street-{width}.webm")], cwd=ROOT, check=True)
    (OUT / "street.json").write_text(json.dumps({"fps": FPS, "frames": n, "loopAt": LOOP_AT / FPS,
                                                 "duration": n / FPS, "crossfade": CROSSFADE / FPS}, indent=1) + "\n")


def scenes():
    for name, (source, centre) in SCENES.items():
        picture = Image.open(ROOT / source).convert("RGB")
        w, h = picture.size
        band_h = round(w * BAND[1] / BAND[0])
        top = min(max(0, round(h * centre - band_h / 2)), h - band_h)
        band = picture.crop((0, top, w, top + band_h)).resize(BAND, Image.LANCZOS)
        save(paint(band, name, BAND[1]), name)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    if len(sys.argv) > 2 and sys.argv[1] == "film":
        film(sys.argv[2])
    elif len(sys.argv) > 1 and sys.argv[1] == "scenes":
        scenes()
    else:
        sys.exit(__doc__)
