"""Dock Walk: the sailor strolls along the quay. One seamless loop.

    python3 tools/film.py            # writes dock-walk.mp4, dock-walk-poster.png, walk-cycle.png
    python3 tools/film.py --still 0 out.png

Deterministic: frame n is a pure function of n (render_at), whatever was drawn before.
"""
import math
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import docks
import sailor
import tune

ROOT = Path(__file__).resolve().parent.parent
FPS = 24
CYCLES = 20
N = sailor.FRAMES * CYCLES                         # 720 frames, 30 s
PX_PER_FRAME = sailor.STRIDE * sailor.OUT_SCALE / sailor.FRAMES
SAILOR_X = 880
BOB_FRAMES = 90                                    # the moored boats rise and fall every 3.75 s

NOTE_LIFE = 48

_cache = {}


def walk_frame(i, mouth, eye):
    key = (i, mouth, eye)
    w = layers()['walk']
    if key not in w:
        face = 'head' if (mouth, eye) == ('grin', 'open') else f'head_{mouth}_{eye}'
        w[key] = sailor.frame(i, face=face)
    return w[key]


def layers():
    if not _cache:
        _cache['sky'] = docks.sky()
        for name, fn, w in (('far', docks.far, docks.FAR_W), ('mid', docks.mid, docks.MID_W), ('near', docks.near, docks.NEAR_W)):
            t = fn()
            wide = Image.new('RGBA', (w + docks.W, docks.H), (0, 0, 0, 0))
            wide.paste(t, (0, 0)); wide.paste(t.crop((0, 0, docks.W, docks.H)), (w, 0))
            _cache[name] = wide
        _cache['walk'] = {}
        _cache['notes'] = {k: docks.note(k) for k in ('one', 'two')}
        sh = Image.new('RGBA', (640, 60), (0, 0, 0, 0))
        ImageDraw.Draw(sh).ellipse([0, 0, 639, 59], fill=(0, 0, 0, 255))
        _cache['shadow'] = sh.resize((320, 30), Image.LANCZOS)
    return _cache


def render_at(n):
    L = layers()
    n %= N
    travel = n * PX_PER_FRAME
    f = Image.new('RGBA', (docks.W, docks.H), (255, 255, 255, 255))
    f.alpha_composite(L['sky'])
    for name, w, speed in (('far', docks.FAR_W, 0.25), ('mid', docks.MID_W, 0.5), ('near', docks.NEAR_W, 1.0)):
        x = int(round(travel * speed)) % w
        dy = round(4 * math.sin(2 * math.pi * n / BOB_FRAMES)) if name == 'mid' else 0
        f.alpha_composite(L[name].crop((x, 0, x + docks.W, docks.H)), (0, dy)) if dy >= 0 else \
            f.alpha_composite(L[name].crop((x, -dy, x + docks.W, docks.H)), (0, 0))
    ph = (n % sailor.FRAMES) / sailor.FRAMES
    sw = 1 + 0.06 * math.cos(4 * math.pi * ph)        # the shadow widens as the feet part
    sh = L['shadow'].resize((round(320 * sw), 30), Image.LANCZOS)
    f.alpha_composite(sh, (SAILOR_X - sh.width // 2, docks.GROUND - 13))
    cell = walk_frame(n % sailor.FRAMES, *tune.face_at(n))
    ox = -sailor.CELL[0] * sailor.OUT_SCALE
    oy = -sailor.CELL[1] * sailor.OUT_SCALE
    f.alpha_composite(cell, (SAILOR_X - ox, docks.GROUND - oy))
    # the whistled notes drift up and astern from his lips
    for k, (start, ln, _) in enumerate(tune.notes()):
        age = (n - start) % N
        if age >= NOTE_LIFE:
            continue
        m = sailor.mouth_point(start)
        x0 = SAILOR_X + m[0] * sailor.OUT_SCALE + 26
        y0 = docks.GROUND + m[1] * sailor.OUT_SCALE - 8
        up = 1 - (1 - age / NOTE_LIFE) ** 2.5                  # quick off the lips, then floating
        x = x0 + 56 * min(1.0, age / 10) - 7.0 * max(0, age - 14) + 22 * math.sin(age / 7.0 + k) * (age / NOTE_LIFE)
        y = y0 - 350 * up - 12 * math.sin(age / 9.0 + 2 * k)
        size = min(1.0, 0.35 + age / 7) * min(1.0, (NOTE_LIFE - age) / 9)
        im = L['notes']['two' if k % 3 == 1 else 'one']
        im = im.rotate(14 * math.sin(age / 6.0 + k * 1.7), resample=Image.BICUBIC)
        w = max(2, round(110 * size))
        im = im.resize((w, w), Image.LANCZOS)
        f.alpha_composite(im, (round(x - w / 2), round(y - w / 2))) if -w < x < docks.W and y > w else None
    return f.convert('RGB')


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--still':
        render_at(int(sys.argv[2])).save(sys.argv[3]); sys.exit()
    import wave
    out = ROOT / 'dock-walk.mp4'
    import tempfile
    wav = Path(tempfile.mkdtemp()) / 'dock-walk.wav'
    with wave.open(str(wav), 'wb') as wf:
        wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(tune.SR)
        wf.writeframes(tune.render(N, sailor.FRAMES // 2).tobytes())
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{docks.W}x{docks.H}',
                           '-r', str(FPS), '-i', '-', '-i', str(wav), '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
                           '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
                           '-c:a', 'aac', '-b:a', '192k', '-frames:v', str(N), '-movflags', '+faststart', str(out)],
                          stdin=subprocess.PIPE)
    for n in range(N):
        ff.stdin.write(render_at(n).tobytes())
    ff.stdin.close(); ff.wait()
    render_at(18).save(ROOT / 'dock-walk-poster.png', optimize=True)
    fr = [walk_frame(i, 'grin', 'open') for i in range(sailor.FRAMES)]
    w, h = fr[0].size
    sheet = Image.new('RGBA', (w // 2 * 9, h // 2 * 4), (0, 0, 0, 0))
    for i, im in enumerate(fr):
        sheet.paste(im.resize((w // 2, h // 2), Image.LANCZOS), ((i % 9) * (w // 2), (i // 9) * (h // 2)))
    sheet.save(ROOT / 'walk-cycle.png', optimize=True)
    print(out, N, 'frames')
