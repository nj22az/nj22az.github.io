"""Dock Walk: the sailor strides along the quay, whistling. One seamless 30 s loop at 60 frames a second.

He is the owner's Meshy model, rigged by Meshy and inked in Blender (blender/meshy_walk.py renders the
frames into build/sailor3d/ first). The docks, the notes and the sound are made here.

    python3 tools/film.py                      # dock-walk.mp4, dock-walk-poster.png, walk-cycle.png
    python3 tools/film.py --still 120 out.png  # one frame

Deterministic: frame n is a pure function of n (render_at), whatever was drawn before. Everything moves
on one clock, `f`, counted in 24ths of a second so the musical timings stay whole numbers.
"""
import math
import subprocess
import sys
from multiprocessing import Pool
from pathlib import Path
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import json

import docks
import tune

ROOT = Path(__file__).resolve().parent.parent
FPS = 60
SECONDS = tune.TOTAL / 24                           # 30
N = round(FPS * SECONDS)                            # 1800 frames
CYCLE_SECONDS = 1.5                                 # two steps, one to the beat
CYCLE = round(FPS * CYCLE_SECONDS)                  # 90 frames to two steps
CYCLE_F = 24 * CYCLE_SECONDS                        # 36, the same in 24ths
BEAT_F = CYCLE_F / 2                                # one step, one beat
SAILOR_DIR = ROOT / 'build' / 'sailor3d'            # inked frames of him from blender/meshy_walk.py
SAILOR_LOOP = 360                                   # one phrase of the tune
CELL_GROUND = (500, 670)                            # where the ground under him is in those frames
PX_PER_BU, CAMERA_YAW = 200.0, math.radians(46)     # as blender/common.py
SAILOR_X = 880
NOTE_LIFE = 48
LOOP_TRAVEL = docks.NEAR_W                          # the quay goes round exactly once in the film
BACKDROP = ROOT / 'build' / 'harbour-backdrop.png'  # Johansson World's harbour from blender/harbour.py
BACKDROP_DY = 160                                   # its waterline (row 640) sits just behind the quay's rail
SPEED = (('far', docks.FAR_W, docks.FAR_W / LOOP_TRAVEL), ('mid', docks.MID_W, docks.MID_W / LOOP_TRAVEL),
         ('world', docks.MID_W, docks.MID_W / LOOP_TRAVEL), ('near', docks.NEAR_W, 1.0))

_cache = {}


def layers():
    if not _cache:
        def world():
            b = Image.open(BACKDROP).convert('RGBA')
            assert b.width == docks.MID_W, 'the backdrop must be as wide as the water layer'
            t = Image.new('RGBA', (b.width, docks.H), (0, 0, 0, 0))
            t.paste(b, (0, BACKDROP_DY))
            return t
        for name, fn, w in (('far', docks.far, docks.FAR_W), ('mid', docks.mid, docks.MID_W), ('world', world, docks.MID_W),
                            ('near', docks.near, docks.NEAR_W), ('props', docks.props, docks.NEAR_W)):
            t = fn()
            wide = Image.new('RGBA', (w + docks.W + 2, docks.H), (0, 0, 0, 0))
            wide.paste(t, (0, 0)); wide.paste(t.crop((0, 0, docks.W + 2, docks.H)), (w, 0))
            _cache[name] = wide
        beat = round(FPS * CYCLE_SECONDS / 2)
        _cache['sun'] = [docks.sun(0.5 + 0.5 * math.cos(2 * math.pi * i / beat)) for i in range(beat)]
        meta = [json.loads(p.read_text()) for p in sorted(SAILOR_DIR.glob('meta.*.json'))]
        _cache['stride'] = meta[0]['stride']
        _cache['mouths'] = {int(k): v for m in meta for k, v in m['mouths'].items()}
        # the quay moves under him exactly as far as his boots push it back
        measured = meta[0]['stride'] * math.cos(CAMERA_YAW) * PX_PER_BU / CYCLE_F
        _cache['px_per_f'] = LOOP_TRAVEL / tune.TOTAL      # exactly one turn of the quay in the film
        assert abs(_cache['px_per_f'] / measured - 1) < 0.01, 'the quay no longer matches his stride'
        _cache['notes'] = {k: docks.note(k) for k in ('one', 'two')}
        sh = Image.new('RGBA', (720, 60), (0, 0, 0, 0))
        ImageDraw.Draw(sh).ellipse([0, 0, 719, 59], fill=(0, 0, 0, 255))
        _cache['shadow'] = sh
    return _cache


def scrolled(img, x, dy=0.0, height=docks.H, ky=1.0, foot=0.0):
    """A window of a wide layer starting at the fractional pixel x (so slow layers glide, not step)."""
    return img.transform((docks.W, height), Image.AFFINE, (1, 0, x, 0, 1 / ky, foot - foot / ky - dy), resample=Image.BILINEAR)


def render_at(n):
    L = layers()
    n %= N
    f = n * 24.0 / FPS
    travel = f * L['px_per_f']
    out = Image.new('RGBA', (docks.W, docks.H), (255, 255, 255, 255))
    s = L['sun'][n % len(L['sun'])]
    out.alpha_composite(s, (docks.SUN[0] - s.width // 2, docks.SUN[1] - s.height // 2))
    for name, w, speed in SPEED:
        x = (travel * speed) % w
        dy = 0.0
        out.alpha_composite(scrolled(L[name], x, dy))
        if name == 'near':
            # everything standing on the quay gives a little on each beat and springs back
            b = (f % BEAT_F) / BEAT_F
            k = 1 - 0.02 * math.exp(-b * 5.0) * math.cos(2 * math.pi * b * 1.5)
            foot = docks.PROP_BASE + 14
            out.alpha_composite(scrolled(L['props'], x, height=foot, ky=k, foot=foot))
    ph = (n % CYCLE) / CYCLE
    sw = 1 + 0.10 * math.cos(4 * math.pi * ph)            # the shadow widens as the feet part
    sh = L['shadow'].resize((round(360 * sw), 30), Image.LANCZOS)
    out.alpha_composite(sh, (SAILOR_X - sh.width // 2, docks.GROUND - 13))
    ox, oy = SAILOR_X - CELL_GROUND[0], docks.GROUND - CELL_GROUND[1]
    out.alpha_composite(Image.open(SAILOR_DIR / f'{n % SAILOR_LOOP:04d}.png').convert('RGBA'), (ox, oy))
    # the whistled notes drift up and astern from his lips
    for k, (start, ln, _) in enumerate(tune.notes()):
        age = (f - start) % tune.TOTAL
        if age >= NOTE_LIFE:
            continue
        m = L['mouths'][round(start * FPS / 24) % SAILOR_LOOP]
        x0 = ox + m[0] + 30
        y0 = oy + m[1] - 8
        up = 1 - (1 - age / NOTE_LIFE) ** 2.5             # quick off the lips, then floating
        x = x0 + 56 * min(1.0, age / 10) - 7.0 * max(0.0, age - 14) + 22 * math.sin(age / 7.0 + k) * (age / NOTE_LIFE)
        y = y0 - 350 * up - 12 * math.sin(age / 9.0 + 2 * k)
        size = min(1.0, 0.35 + age / 7) * min(1.0, (NOTE_LIFE - age) / 9)
        im = L['notes']['two' if k % 3 == 1 else 'one'].rotate(14 * math.sin(age / 6.0 + k * 1.7), resample=Image.BICUBIC)
        w = max(2, round(110 * size))
        if -w < x < docks.W + w and y > w:
            out.alpha_composite(im.resize((w, w), Image.LANCZOS), (max(0, round(x - w / 2)), round(y - w / 2)))
    return out.convert('RGB')                     # black ink on pure white, like the drawings


def _bytes(n):
    return render_at(n).tobytes()


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--still':
        render_at(int(sys.argv[2])).save(sys.argv[3]); sys.exit()
    import tempfile
    import wave
    out = ROOT / 'dock-walk.mp4'
    wav = Path(tempfile.mkdtemp()) / 'dock-walk.wav'
    with wave.open(str(wav), 'wb') as wf:
        wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(tune.SR)
        wf.writeframes(tune.render(tune.TOTAL, tune.QUAVER_FRAMES * 2).tobytes())
    layers()                                       # drawn once here, shared by the workers
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{docks.W}x{docks.H}',
                           '-r', str(FPS), '-i', '-', '-i', str(wav), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
                           '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
                           '-c:a', 'aac', '-b:a', '192k', '-frames:v', str(N), '-movflags', '+faststart', str(out)],
                          stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for b in pool.imap(_bytes, range(N), chunksize=6):
            ff.stdin.write(b)
    ff.stdin.close(); ff.wait()
    render_at(45).save(ROOT / 'dock-walk-poster.png', optimize=True)
    fr = [Image.open(SAILOR_DIR / f'{i * 5:04d}.png').convert('RGBA') for i in range(18)]      # one cycle
    w, h = fr[0].size
    sheet = Image.new('RGBA', (w // 2 * 9, h // 2 * 2), (0, 0, 0, 0))
    for i, im in enumerate(fr):
        sheet.paste(im.resize((w // 2, h // 2), Image.LANCZOS), ((i % 9) * (w // 2), (i // 9) * (h // 2)))
    sheet.save(ROOT / 'walk-cycle.png', optimize=True)
    print(out, N, 'frames')
