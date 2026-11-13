"""Jack's cloak: a piece of cloth of its own, hung from his shoulders and simulated.

The owner, 13 November 2026: "Can't you redraw Jack and rig his cloak too". The first Jack's cloak was part of his
body's mesh and skinned to his arms and legs, so it stretched with every gesture and passed through his legs. This
Jack has no cloak of his own (Meshy, a second sculpt); the cloak is made here.

It is a sheet of points (15 round the shoulders, 13 down) joined by threads that keep their length: along the
cloth, across it, on its diagonals, and over two points so that it does not fold like paper. Each step every point
falls, keeps most of the speed it had, is pulled back to its threads' lengths, and is pushed out of Jack: out of
his trunk, his thighs and shins, his arms and his head (round-ended rods between his joints) and off the street.
The top row is held to his shoulders. So the cloak hangs, swings out when he turns, lies over a raised arm and
settles after him, and cannot pass through his legs.

It is baked, not played: `bake()` walks a shot from a second before its start, taking Jack's joints 24 times a
second and stepping the cloth 96 times a second between them, and keeps the cloth of every picture. `apply()`
then lays the mesh from what was kept, so a frame rendered alone is the frame rendered in sequence.
"""
import math
import numpy as np
import bpy
from mathutils import Vector

NC, NR = 15, 13                    # points round the shoulders, points down the cloth
LENGTH = 1.20                      # metres from shoulder to hem, for a Jack 1.9 m tall
SPREAD = math.radians(118)         # the cloak comes this far round to the front on each side
HZ, SUB = 24, 4                    # joints sampled 24 times a second; four steps of cloth between samples
GRAVITY = np.array([0.0, 0.0, -9.81])
DRAG = 0.982                       # the part of its speed a point keeps each step (the air)
ITER = 10


class Cloak:
    def __init__(self, actor, collection, outside, lining):
        self.a = actor; s = actor.height / 1.9; self.s = s
        self.n = NC * NR
        # the cloak at rest, in a frame of its own: x to Jack's left, y behind him, z up, origin between his shoulders
        rest = np.zeros((NR, NC, 3))
        for j in range(NR):
            v = j / (NR - 1)
            rx, ry = (0.215 + 0.30 * v) * s, (0.165 + 0.27 * v) * s
            for i in range(NC):
                ang = -SPREAD + 2 * SPREAD * i / (NC - 1)
                # the cloth is cut fuller than the circle it hangs on: every other point stands out, more towards the
                # hem, so that it falls in folds and not as a cone of card
                full = 1.0 + 0.16 * v * (1 if i % 2 == 0 else -1)
                rest[j, i] = (rx * full * math.sin(ang), ry * full * math.cos(ang), -LENGTH * s * v * 0.96)
        self.rest = rest.reshape(-1, 3)
        idx = lambda j, i: j * NC + i
        pairs = []
        for j in range(NR):
            for i in range(NC):
                if i + 1 < NC: pairs.append((idx(j, i), idx(j, i + 1)))
                if j + 1 < NR: pairs.append((idx(j, i), idx(j + 1, i)))
                if i + 1 < NC and j + 1 < NR: pairs.append((idx(j, i), idx(j + 1, i + 1))); pairs.append((idx(j, i + 1), idx(j + 1, i)))
                if i + 2 < NC: pairs.append((idx(j, i), idx(j, i + 2)))
                if j + 2 < NR: pairs.append((idx(j, i), idx(j + 2, i)))
        self.pi = np.array([p[0] for p in pairs]); self.pj = np.array([p[1] for p in pairs])
        self.len = np.linalg.norm(self.rest[self.pi] - self.rest[self.pj], axis=1)
        self.count = np.zeros(self.n); np.add.at(self.count, self.pi, 1); np.add.at(self.count, self.pj, 1)
        self.frames = {}                                              # shot name -> (first second, positions of every sample)

        me = bpy.data.meshes.new('jack-cloak')
        faces = [(idx(j, i), idx(j, i + 1), idx(j + 1, i + 1), idx(j + 1, i)) for j in range(NR - 1) for i in range(NC - 1)]
        me.from_pydata([tuple(p) for p in self.rest], [], faces); me.update()
        for p in me.polygons: p.use_smooth = True
        ob = bpy.data.objects.new('jack-cloak', me); collection.objects.link(ob)
        me.materials.append(outside); me.materials.append(lining)
        sub = ob.modifiers.new('smooth', 'SUBSURF'); sub.levels = 2; sub.render_levels = 2
        sol = ob.modifiers.new('thick', 'SOLIDIFY'); sol.thickness = 0.014 * s; sol.offset = 1.0; sol.material_offset = 1; sol.use_rim = True
        self.ob = ob; ob.hide_render = True

    # ---- what the cloth hangs from and what it may not enter, from Jack's joints as they stand now
    def _joints(self):
        a = self.a; w = lambda n: np.array(a.world(n))
        ls, rs, neck, head, top, chest, hips = w('LeftArm'), w('RightArm'), w('neck'), w('Head'), w('head_end'), w('Spine02'), w('Hips')
        r = ls - rs; r /= np.linalg.norm(r)
        u = neck - chest; u /= np.linalg.norm(u)
        b = np.cross(u, r); b /= np.linalg.norm(b)                    # behind him
        u = np.cross(r, b)
        c = (ls + rs) / 2 + u * 0.035 * self.s
        s = self.s
        pins = c + self.rest[:NC, 0:1] * r + self.rest[:NC, 1:2] * b + self.rest[:NC, 2:3] * u
        rods = [(hips, neck, 0.185 * s), (neck, head, 0.11 * s), (head, top, 0.135 * s),
                (w('LeftUpLeg'), w('LeftLeg'), 0.115 * s), (w('LeftLeg'), w('LeftFoot'), 0.085 * s),
                (w('RightUpLeg'), w('RightLeg'), 0.115 * s), (w('RightLeg'), w('RightFoot'), 0.085 * s),
                (ls, w('LeftForeArm'), 0.085 * s), (w('LeftForeArm'), w('LeftHand'), 0.07 * s),
                (rs, w('RightForeArm'), 0.085 * s), (w('RightForeArm'), w('RightHand'), 0.07 * s)]
        frame = (c, r, b, u)
        return pins, rods, frame

    def _step(self, pos, prev, pins, rods, dt):
        vel = (pos - prev) * DRAG
        prev[:] = pos; pos += vel + GRAVITY * dt * dt
        for _ in range(ITER):
            pos[:NC] = pins
            d = pos[self.pj] - pos[self.pi]; ln = np.linalg.norm(d, axis=1); ln[ln < 1e-9] = 1e-9
            corr = (0.5 * (ln - self.len) / ln)[:, None] * d
            acc = np.zeros_like(pos); np.add.at(acc, self.pi, corr); np.add.at(acc, self.pj, -corr)
            pos += acc / np.maximum(self.count, 1)[:, None] * 1.6
            for p0, p1, rad in rods:                                  # out of each round-ended rod of his body
                ax = p1 - p0; L2 = float(ax @ ax) or 1e-9
                tt = np.clip(((pos - p0) @ ax) / L2, 0.0, 1.0)
                near = p0 + tt[:, None] * ax; off = pos - near; dist = np.linalg.norm(off, axis=1)
                inside = dist < rad
                if inside.any():
                    dd = np.maximum(dist[inside], 1e-6)
                    pos[inside] = near[inside] + off[inside] / dd[:, None] * rad
            np.maximum(pos[:, 2], 0.025, out=pos[:, 2])                # the street
        pos[:NC] = pins

    def bake(self, name, pose_at, t0, t1, preroll=1.0):
        """Simulate the shot: pose_at(t) puts Jack where he is at second t."""
        if name in self.frames: return
        ts = [t0 - preroll + k / HZ for k in range(int(round((t1 - t0 + preroll) * HZ)) + 2)]
        samples = []
        for t in ts:
            pose_at(t); samples.append(self._joints() if self.a.on else None)
        first = next((s for s in samples if s is not None), None)
        if first is None: self.frames[name] = None; return
        pins, rods, (c, r, b, u) = first
        pos = c + self.rest[:, 0:1] * r + self.rest[:, 1:2] * b + self.rest[:, 2:3] * u
        prev = pos.copy(); out = []; dt = 1.0 / (HZ * SUB); last = first
        for k, s in enumerate(samples):
            if s is None: s = last                                    # he is out of the picture: the cloth waits where it was
            for q in range(SUB):
                f = (q + 1) / SUB
                pn = last[0] * (1 - f) + s[0] * f
                rd = [(a0 * (1 - f) + b0 * f, a1 * (1 - f) + b1 * f, rad) for (a0, a1, rad), (b0, b1, _) in zip(last[1], s[1])]
                self._step(pos, prev, pn, rd, dt)
            last = s; out.append(pos.copy())
        self.frames[name] = (ts[0], np.array(out))

    def apply(self, name, t):
        got = self.frames.get(name)
        self.ob.hide_render = got is None or not self.a.on
        if got is None or not self.a.on: return None
        ts0, arr = got; x = (t - ts0) * HZ; k = int(max(0, min(len(arr) - 2, math.floor(x)))); f = max(0.0, min(1.0, x - k))
        p = arr[k] * (1 - f) + arr[k + 1] * f
        self.ob.data.vertices.foreach_set('co', p.ravel()); self.ob.data.update()
        return p
