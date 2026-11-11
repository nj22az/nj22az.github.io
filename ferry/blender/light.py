"""
The light of every place aboard, worked out by tracing rays through her as built.

The owner, 11 November 2026: "It still looks like Lego create a realistic bridge"; "you have no budget on the 3d model, focus on
photorealism and reality". What makes a drawn room look like a toy is that every face in it is lit alike. In a real room the
light comes in at the windows and from the lamps, falls off into the corners, and is thrown back by the deck and the walls in
their own colours. This tool works that out once, when she is built, for every place aboard at a time:

  - a grid of points is laid through the whole ship, one every `cell` metres;
  - from each point rays are sent out all round. A ray that gets out sees the sky; a ray that meets a lamp sees the lamp; a
    ray that meets a surface sees what that surface throws back: the sun on it, if the sun reaches it, and the light the
    grid itself has found there, which is worked round and round (`bounces`) until the rooms have filled;
  - what each point receives from each side is kept, small, in `data/light.bin.gz`. The page lights every surface from it
    (look.js): the sun itself and its sharp shadows stay the page's own.

Glass lets rays through. Nothing here depends on how she is divided into rooms: it is her steel that makes the shade.

    python3 ferry/blender/light.py --part /tmp/chisum.npz            (it starts Blender itself for the ray tracing)

The tracing is done by Blender's own ray caster (mathutils.bvhtree) in several Blender processes at once; the bounces and the
file are plain numpy. A sheet of pictures of the result can be written with --look DIR, to be looked at before it is believed.
"""
import argparse, gzip, json, math, os, shutil, struct, subprocess, sys, tempfile, time
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'data', 'light.bin.gz')

# ---- The day she stands in. The page's sky and sun (app.js, look.js) are drawn from the same figures: change them together.
SUN_DIR = np.array([-0.6, 0.72, 0.36]) / math.sqrt(0.6 ** 2 + 0.72 ** 2 + 0.36 ** 2)   # from her toward the sun
SUN_E = 9.0 * np.array([1.0, 0.94, 0.84])       # what the sun gives a surface that faces it squarely
ZENITH = np.array([0.16, 0.34, 0.80])           # the sky's radiance overhead
HORIZON = np.array([0.66, 0.78, 0.95])          # and at the horizon
BELOW = np.array([0.20, 0.24, 0.27])            # looking down past her: the sea, or the slip
GLOW = np.array([1.0, 0.9, 0.75]) * 0.5         # the brightening of the sky toward the sun
LAMP = 14.0                                     # a lit lamp's radiance, for each unit of its material's emissive intensity
SCREEN = 0.45                                   # a lit screen's
FLOOR = 0.10                                    # no place is left blacker than this (what the eye still makes out)
SCALE = 8.0                                     # the largest light the file can say
FAR = 400.0
AXES = np.array([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], float)


def sky(d):
    """What a ray that gets out sees, looking along d."""
    y = d[1]
    if y >= 0:
        t = y ** 0.5
        c = HORIZON * (1 - t) + ZENITH * t
    else:
        t = min(-y * 4.0, 1.0) ** 0.6
        c = HORIZON * 0.8 * (1 - t) + BELOW * t
    return c + GLOW * max(float(d @ SUN_DIR), 0.0) ** 10.0


def directions(k):
    """k directions spread evenly over the sphere, and what each adds to the light arriving from each of the six sides."""
    i = np.arange(k) + 0.5
    y = 1 - 2 * i / k
    r = np.sqrt(1 - y * y)
    phi = i * math.pi * (3 - math.sqrt(5))
    d = np.stack([r * np.cos(phi), y, r * np.sin(phi)], 1)
    w = np.maximum(d @ AXES.T, 0.0) * (4 * math.pi / k)
    return d, w


def srgb(c):
    return (np.asarray(c, float) / 255.0) ** 2.2


def load(part):
    """Her triangles as the rays meet them: corners, what each throws back, what each gives out, and whether it has two faces."""
    z = np.load(part)
    meta = json.loads(z['meta'].tobytes())
    tri, alb, emi, two = [], [], [], []
    for m in meta['meshes']:
        look = m['look']
        if look.get('transparent') and look.get('opacity', 1) < 1:
            continue                                        # glass: light goes through
        p = z[m['key'] + '|pos'].reshape(-1, 3, 3).astype(np.float64)
        c = srgb(z[m['key'] + '|col'].reshape(-1, 3, 3)).mean(1)
        n = len(p)
        e = np.zeros((n, 3))
        hexa = look.get('emissive')
        if hexa and hexa != '#000000':
            rgb = srgb([int(hexa[i:i + 2], 16) for i in (1, 3, 5)])
            e[:] = rgb * LAMP * float(look.get('emissiveIntensity', 1))
        elif look.get('shading') == 'basic' and look.get('textured'):
            e[:] = SCREEN                                   # a screen that is lit
        if look.get('textured'):
            c = np.full((n, 3), 0.22)                       # a picture's own colours are on the sheet: taken as a mid grey
        tri.append(p); alb.append(np.clip(c, 0.02, 0.92)); emi.append(e)
        two.append(np.full(n, look.get('side') == 'double'))
    return np.concatenate(tri), np.concatenate(alb), np.concatenate(emi), np.concatenate(two)


def grid_of(tri, cell):
    lo = np.floor(tri.reshape(-1, 3).min(0) / cell - 1.0) * cell
    hi = np.ceil(tri.reshape(-1, 3).max(0) / cell + 1.0) * cell
    n = np.rint((hi - lo) / cell).astype(int)
    return lo, n


# =====================================================================================================================
# In Blender: the rays of one share of the grid
# =====================================================================================================================
def trace(a):
    from array import array
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree
    tri, alb, emi, two = load(a.part)
    lo, n = grid_of(tri, a.cell)
    nx, ny, nz = (int(v) for v in n)
    t0 = time.time()
    tree = BVHTree.FromPolygons(tri.reshape(-1, 3).tolist(), [(3 * i, 3 * i + 1, 3 * i + 2) for i in range(len(tri))], all_triangles=True)
    lit = array('b', (emi.sum(1) > 0).astype(np.int8).tolist())
    twof = array('b', two.astype(np.int8).tolist())
    ar, ag, ab = (array('f', alb[:, i].tolist()) for i in range(3))
    er, eg, eb = (array('f', emi[:, i].tolist()) for i in range(3))
    D, _ = directions(a.rays)
    K = a.rays
    dirs = [Vector(d) for d in D]
    skies = [tuple(sky(d)) for d in D]
    sun = Vector(SUN_DIR)
    sr, sg, sb = (float(v) / math.pi for v in SUN_E)
    cell, x0, y0, z0 = a.cell, float(lo[0]), float(lo[1]), float(lo[2])
    inv = 1.0 / cell
    layers = [iz for iz in range(nz) if iz % a.of == a.share]
    P = len(layers) * nx * ny
    L0 = np.zeros((P, K, 3), np.float32)          # what each ray sees before anything is thrown back twice
    AL = np.zeros((P, K, 3), np.uint8)            # what the surface it met throws back (0 where it met none, or a lamp)
    NJ = np.full((P, K), -1, np.int32)            # the grid point by that surface
    NN = np.zeros((P, K, 3), np.int8)             # and the way the surface faces
    back = np.zeros(P, np.float32)                # how much of what this point sees is the inside of a solid
    ray = tree.ray_cast
    p = 0
    for iz in layers:
        for iy in range(ny):
            for ix in range(nx):
                o = Vector((x0 + (ix + 0.5) * cell, y0 + (iy + 0.5) * cell, z0 + (iz + 0.5) * cell))
                l0 = L0[p]; al = AL[p]; nj = NJ[p]; nn = NN[p]
                behind = 0
                for k in range(K):
                    d = dirs[k]
                    loc, nrm, idx, dist = ray(o, d, FAR)
                    if idx is None:
                        l0[k] = skies[k]
                        continue
                    if lit[idx]:
                        l0[k] = (er[idx], eg[idx], eb[idx])
                        continue
                    if nrm.dot(d) > 0:
                        nrm = -nrm
                        if not twof[idx]:
                            behind += 1
                    r, g, b = ar[idx], ag[idx], ab[idx]
                    q = loc + nrm * 0.004
                    facing = nrm.dot(sun)
                    if facing > 0 and ray(q, sun, FAR)[2] is None:
                        l0[k] = (r * sr * facing, g * sg * facing, b * sb * facing)
                    q = loc + nrm * (0.75 * cell)
                    jx, jy, jz = int((q.x - x0) * inv), int((q.y - y0) * inv), int((q.z - z0) * inv)
                    if 0 <= jx < nx and 0 <= jy < ny and 0 <= jz < nz:
                        nj[k] = jx + nx * (jy + ny * jz)
                        al[k] = (int(r * 255), int(g * 255), int(b * 255))
                        nn[k] = (int(nrm.x * 127), int(nrm.y * 127), int(nrm.z * 127))
                back[p] = behind / K
                p += 1
    np.savez(os.path.join(a.tmp, f'share{a.share}.npz'), L0=L0, AL=AL, NJ=NJ, NN=NN, back=back, layers=np.array(layers))
    print(f'share {a.share} of {a.of}: {P} points, {P * K} rays, {time.time() - t0:.0f} s')


# =====================================================================================================================
# Without Blender: the shares put together, the light thrown back and back again, the file
# =====================================================================================================================
def main(a):
    t0 = time.time()
    tri, alb, emi, two = load(a.part)
    lo, n = grid_of(tri, a.cell)
    nx, ny, nz = (int(v) for v in n)
    N = nx * ny * nz
    K = a.rays
    D, W = directions(K)
    blender = shutil.which('blender')
    if not blender:
        raise SystemExit('blender is not on the path')
    tmp = tempfile.mkdtemp(prefix='chisum-light-')
    jobs = max(1, min(a.jobs, nz))
    procs = [subprocess.Popen([blender, '-b', '--factory-startup', '-P', os.path.abspath(__file__), '--', '--part', a.part, '--cell', str(a.cell),
                               '--rays', str(K), '--share', str(i), '--of', str(jobs), '--tmp', tmp], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
             for i in range(jobs)]
    for i, pr in enumerate(procs):
        out = pr.communicate()[0]
        if pr.returncode or not os.path.exists(os.path.join(tmp, f'share{i}.npz')):
            raise SystemExit(f'the rays of share {i} were not traced:\n' + out[-1500:])
    # each share holds every `jobs`th layer along her length: put them in their places
    L0 = np.zeros((N, K, 3), np.float32); AL = np.zeros((N, K, 3), np.uint8); NJ = np.full((N, K), -1, np.int32); NN = np.zeros((N, K, 3), np.int8)
    back = np.zeros(N, np.float32)
    for i in range(jobs):
        s = np.load(os.path.join(tmp, f'share{i}.npz'))
        layers = s['layers']
        at = (layers[:, None] * nx * ny + np.arange(nx * ny)[None, :]).ravel()
        L0[at] = s['L0']; AL[at] = s['AL']; NJ[at] = s['NJ']; NN[at] = s['NN']; back[at] = s['back']
    shutil.rmtree(tmp, ignore_errors=True)
    traced = time.time() - t0
    Wf = W.astype(np.float32)
    first = np.einsum('pkc,ka->pac', L0, Wf)                 # the light from each of six sides, before any is thrown back
    field = first.copy()
    step = 4096
    for b in range(a.bounces):
        new = first.copy()
        for s in range(0, N, step):
            j = NJ[s:s + step]                               # (p, K)
            hit = j >= 0
            if not hit.any():
                continue
            nrm = NN[s:s + step].astype(np.float32) / 127.0
            f = field[np.where(hit, j, 0)]                   # (p, K, 6, 3): the light at the surface each ray met
            w2 = nrm * nrm
            pick = lambda axis: np.where((nrm[..., axis] > 0)[..., None], f[:, :, 2 * axis], f[:, :, 2 * axis + 1]) * w2[..., axis, None]
            e = pick(0) + pick(1) + pick(2)                  # what falls on that surface, by the way it faces
            lb = AL[s:s + step].astype(np.float32) / 255.0 * e / math.pi * hit[..., None]
            new[s:s + step] += np.einsum('pkc,ka->pac', lb, Wf)
        field = new
    # a point inside a solid sees only the solid: it is given what its neighbours in the open have, so it darkens nothing beside it
    buried = (back > 0.5).reshape(nz, ny, nx)
    cube = field.reshape(nz, ny, nx, 6, 3)
    for _ in range(4):
        if not buried.any():
            break
        total = np.zeros_like(cube); count = np.zeros(buried.shape, np.float32)
        ok = ~buried
        for axis in (0, 1, 2):
            for sh in (1, -1):
                src = np.roll(cube * ok[..., None, None], sh, axis); okr = np.roll(ok, sh, axis).astype(np.float32)
                edge = [slice(None)] * 3; edge[axis] = 0 if sh == 1 else -1
                src[tuple(edge)] = 0; okr[tuple(edge)] = 0
                total += src; count += okr
        fill = buried & (count > 0)
        cube[fill] = total[fill] / count[fill][:, None, None]
        buried = buried & ~fill
    field = cube.reshape(N, 6, 3)
    # kept as: the light a place gets taken all round, and the side it mostly comes from
    c0 = field.mean(1)
    lum = lambda v: v @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    lift = np.maximum(FLOOR - lum(c0), 0.0)
    c0 = c0 + lift[:, None]
    l6 = lum(field)
    c1 = np.stack([(l6[:, 0] - l6[:, 1]) / 2, (l6[:, 2] - l6[:, 3]) / 2, (l6[:, 4] - l6[:, 5]) / 2], 1)
    v = np.clip(c1 / np.maximum(lum(c0), 1e-4)[:, None], -1.0, 1.0)
    A = np.zeros((N, 4), np.uint8); B = np.zeros((N, 4), np.uint8)
    A[:, :3] = np.clip(np.rint(255.0 * np.sqrt(np.clip(c0 / SCALE, 0, 1))), 0, 255)
    A[:, 3] = np.clip(np.rint(255.0 * (NJ < 0).mean(1)), 0, 255)          # how much of what it sees is open (for the page's own use)
    B[:, :3] = np.clip(np.rint((v * 0.5 + 0.5) * 255.0), 0, 255)
    B[:, 3] = 255
    head = dict(format='JLV1', grid=[nx, ny, nz], min=[float(x) for x in lo], cell=a.cell, scale=SCALE, floor=FLOOR,
                sun=dict(dir=[float(x) for x in SUN_DIR], light=[float(x) for x in SUN_E]),
                sky=dict(zenith=ZENITH.tolist(), horizon=HORIZON.tolist(), below=BELOW.tolist(), glow=GLOW.tolist()),
                open=float(math.pi * lum(np.array([sky(d) for d in D], np.float32) * (D[:, 1:2] > 0)).mean() * 2 * 0.5),
                rays=K, bounces=a.bounces, encoding='A: rgb = sqrt(light / scale), a = share of rays that met no surface; B: xyz = (side * 0.5 + 0.5)')
    text = json.dumps(head, separators=(',', ':')).encode()
    text += b' ' * (-len(text) % 4)
    raw = b'JLV1' + struct.pack('<I', len(text)) + text + A.tobytes() + B.tobytes()
    with open(a.out, 'wb') as fh:
        with gzip.GzipFile(fileobj=fh, mode='wb', mtime=0, compresslevel=9) as z:
            z.write(raw)
    inside = (A[:, 3] < 40)
    print(f'{a.out}: {os.path.getsize(a.out)} bytes; {nx} x {ny} x {nz} points every {a.cell} m, {K} rays each, {a.bounces} bounces; '
          f'traced in {traced:.0f} s, {time.time() - t0:.0f} s in all')
    print(f'  open deck (a point that sees little steel): {lum(c0[A[:, 3] > 200]).mean():.2f}; enclosed points: {int(inside.sum())}, their light '
          f'{np.percentile(lum(c0[inside]), 10):.2f} to {np.percentile(lum(c0[inside]), 90):.2f} (10th to 90th in a hundred), {int((lift[inside] > 0).sum())} lifted to the floor')
    if a.look:
        pictures(a.look, c0.reshape(nz, ny, nx, 3), lo, a.cell)


def pictures(folder, c0, lo, cell):
    """Slices through the light, to be looked at: level cuts at each deck's eye height, and one along her centreline."""
    from PIL import Image
    os.makedirs(folder, exist_ok=True)
    tone = lambda v: np.clip(255 * (1 - np.exp(-v * 0.9)) ** (1 / 2.2), 0, 255).astype(np.uint8)
    nz, ny, nx, _ = c0.shape
    for name, y in (('car-deck', 2.1 + 1.6), ('passenger-deck', 6.5 + 1.6), ('bridge-deck', 9.3 + 1.6), ('tank-top', -0.7 + 1.6)):
        iy = int((y - lo[1]) / cell)
        if 0 <= iy < ny:
            im = Image.fromarray(tone(c0[:, iy, ::-1, :]).transpose(1, 0, 2)).resize((nz * 8, nx * 8), Image.NEAREST)
            im.save(os.path.join(folder, f'light-{name}.png'))
    ix = int((0.6 - lo[0]) / cell)
    Image.fromarray(tone(c0[:, ::-1, ix, :]).transpose(1, 0, 2)).resize((nz * 8, ny * 8), Image.NEAREST).save(os.path.join(folder, 'light-centreline.png'))


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument('--part', required=True)
    ap.add_argument('--out', default=OUT)
    ap.add_argument('--cell', type=float, default=0.4)
    ap.add_argument('--rays', type=int, default=96)
    ap.add_argument('--bounces', type=int, default=4)
    ap.add_argument('--jobs', type=int, default=max(1, (os.cpu_count() or 4) - 2))
    ap.add_argument('--look')
    ap.add_argument('--share', type=int)
    ap.add_argument('--of', type=int)
    ap.add_argument('--tmp')
    a = ap.parse_args(argv)
    if a.share is not None:
        trace(a)
    else:
        main(a)
