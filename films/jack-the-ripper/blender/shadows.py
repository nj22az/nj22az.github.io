"""Keep only the cast's own shadows in the cast pass.

    python3 shadows.py <film dir>        writes fgc_####.png beside every fg_####.png (skips those already written)

The street is a shadow catcher in the cast's pass, and the set stands there as holdouts, so the catcher also records
the shade the houses already throw in the plate: laid over the plate it darkens a whole square of street. A catcher
pixel is black with partial alpha; the shade common to the picture's street is taken as the base and removed, and
only what is darker than it (the shadow under a foot, behind a skirt) is kept, softened.
"""
import sys, os, glob, subprocess
import numpy as np
from scipy import ndimage


def load(p):
    w, h = map(int, subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', p]).decode().strip().split(','))
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', p, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'])
    return np.frombuffer(raw, np.uint8).reshape(h, w, 4).copy()


def blur(a, r):
    k = 2 * r + 1
    c = np.cumsum(np.pad(a, ((0, 0), (r + 1, r)), mode='edge'), axis=1); a = (c[:, k:] - c[:, :-k]) / k
    c = np.cumsum(np.pad(a, ((r + 1, r), (0, 0)), mode='edge'), axis=0); return (c[k:, :] - c[:-k, :]) / k


def clean(src, dst):
    im = load(src); a = im[..., 3].astype(np.float32); dark = im[..., :3].max(axis=2) < 14
    floor = dark & (a > 8) & (a < 250)
    if floor.sum() > 200:
        base = np.percentile(a[floor], 70)
        keep = np.clip((a - base - 28) / max(1.0, 255 - base - 28), 0, 1)
        soft = blur(np.where(floor, keep, 0).astype(np.float32), 3)
        a = np.where(floor, np.minimum(soft, keep + 0.15) * 190, a)
    # the far edge of the street shows as a thin black line right across the crop: a black, opaque run less than
    # nine pixels high belongs to nobody in the cast and is taken out
    op = (a >= 250) & dark; r = 4; k = 2 * r + 1
    c = np.cumsum(np.pad(op.astype(np.int32), ((r + 1, r), (0, 0))), axis=0); full = (c[k:, :] - c[:-k, :]) == k
    c = np.cumsum(np.pad(full.astype(np.int32), ((r + 1, r), (0, 0))), axis=0); opened = (c[k:, :] - c[:-k, :]) > 0
    a = np.where(op & ~opened, 0, a)
    # what is left of the street's black can still stand as an island of its own: an opaque piece with no colour
    # anywhere in it (every member of the cast has skin, cloth or brass) is not one of them
    lab, n = ndimage.label(a >= 250)
    if n:
        colour = (im[..., :3].max(axis=2) >= 45) & (a >= 250)
        has = ndimage.sum(colour, lab, index=np.arange(1, n + 1))
        gone = np.concatenate(([False], has < 60))[lab]
        a = np.where(gone, 0, a)
    im[..., 3] = np.clip(a, 0, 255).astype(np.uint8)
    h, w = im.shape[:2]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{w}x{h}', '-i', '-', '-frames:v', '1', '-update', '1', dst], input=im.tobytes(), check=True)


n = bad = 0
for src in sorted(glob.glob(os.path.join(sys.argv[1], '*', 'fg_*.png'))):
    dst = src.replace('fg_', 'fgc_')
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src): continue
    try: clean(src, dst); n += 1
    except Exception as e: bad += 1; print('BAD', src, str(e)[:80])
print('cleaned', n, 'unreadable', bad)
