"""A corset does not stretch: keep Polly's bodice on her ribs.

    blender -b cast3.blend -P fix_bodice.py -- --out cast4.blend singer

The owner, 13 November 2026, of the shot where she reaches for the moon, after `fix_weights.py` had been run: "this
is the only problem now, it doesnt seem as it was fixed" (the side of the bodice went up into her armpit with the
arm). Measured on Meshy's skinning: the collar-bone joints held up to 0.95 of the weight of some 9,000 points of
her chest, down to 15 cm below the shoulder, and the upper-arm joint still held up to 0.75 of the bodice's side
beside the shoulder joint, which `fix_weights.py` (a rule of distance from the arm) could not tell from the arm.

This rule knows what is cloth. The model has one painted surface, so the corset is found by its paint: the dark
points joined to the middle of her front, between waist and shoulder. Those points lose all weight to the collar
bones and arms: what they had goes to the spine joints in the proportion each point already had. Skin beside the
corset is eased the same way over 4.5 cm measured from point to neighbouring point over the surface, so skin and cloth do not part on a line: at
the corset's edge it follows the ribs, 4.5 cm away it follows the arm as before.
"""
import bpy, sys, heapq
import numpy as np
from mathutils import kdtree

argv = sys.argv[sys.argv.index('--') + 1:]
out = argv[argv.index('--out') + 1] if '--out' in argv else None
names = [a for i, a in enumerate(argv) if a != '--out' and (i == 0 or argv[i - 1] != '--out')]
LIMBS = ('LeftShoulder', 'LeftArm', 'LeftForeArm', 'RightShoulder', 'RightArm', 'RightForeArm')
SPINE = ('Spine', 'Spine01', 'Spine02', 'Hips')
REACH = 0.045                                    # metres of skin beside the corset that are eased, for a figure 1.7 m tall


def sstep(u):
    u = max(0.0, min(1.0, u)); return u * u * (3 - 2 * u)


for who in names:
    arm = bpy.data.objects[who]; ob = bpy.data.objects[who + '-mesh']; me = ob.data
    bpy.context.view_layer.update()
    MW = ob.matrix_world; n = len(me.vertices)
    co = np.array([MW @ v.co for v in me.vertices]); s = co[:, 2].max() / 1.7
    J = lambda b: np.array(arm.matrix_world @ arm.data.bones[b].head_local)
    # the paint at every point
    img = next(nd.image for nd in ob.material_slots[0].material.node_tree.nodes if nd.type == 'TEX_IMAGE' and nd.image and nd.image.name.startswith('texture_0') and 'metallic' not in nd.image.name)
    W, H = img.size; px = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)
    uv = np.zeros((n, 2)); seen = np.zeros(n, bool); uvl = me.uv_layers[0].data
    for l in me.loops:
        if not seen[l.vertex_index]: uv[l.vertex_index] = uvl[l.index].uv; seen[l.vertex_index] = True
    col = px[np.clip((uv[:, 1] % 1.0 * H).astype(int), 0, H - 1), np.clip((uv[:, 0] % 1.0 * W).astype(int), 0, W - 1), :3]
    lum = col @ np.array([0.2126, 0.7152, 0.0722])
    waist, shoulder = J('Spine02')[2] - 0.06 * s, J('LeftArm')[2] + 0.02 * s
    box = (np.abs(co[:, 0]) < 0.17 * s) & (co[:, 2] > waist) & (co[:, 2] < shoulder)
    dark = box & (lum < 0.4)
    # which points are beside which: by nearness (within LINK), not by the mesh's own edges, because Meshy's surface
    # is cut into separate patches along the seams of its paint and the edges stop there
    near = np.nonzero((np.abs(co[:, 0]) < 0.3 * s) & (co[:, 2] > waist - 0.05 * s) & (co[:, 2] < shoulder + 0.1 * s))[0]
    tree = kdtree.KDTree(len(near))
    for k, i in enumerate(near): tree.insert(co[i], int(i))
    tree.balance(); LINK = 0.011 * s
    nb = {int(i): [(j, d) for (_, j, d) in tree.find_range(co[i], LINK) if j != i] for i in near}
    # the corset: dark points joined to the middle of her front
    front = dark & (np.abs(co[:, 0]) < 0.03 * s) & (np.abs(co[:, 2] - J('Spine01')[2]) < 0.04 * s) & (co[:, 1] < J('Spine01')[1])
    seed = int(np.nonzero(front)[0][np.argmin(co[front, 1])])
    cloth = np.zeros(n, bool); cloth[seed] = True; stack = [seed]
    while stack:
        a = stack.pop()
        for b, _ in nb.get(a, ()):
            if dark[b] and not cloth[b]: cloth[b] = True; stack.append(b)
    # and the few dark points of her trunk that the joining missed (hidden folds by the armpit, where points lie
    # further apart): left out, each one follows the arm and drags a spike of cloth out with it. Her gloves are dark
    # too, and hang beside her in the rest pose, but never nearer her middle than 14 cm.
    cloth |= dark & (np.abs(co[:, 0]) < 0.135 * s)
    # distance along the surface from the corset
    dist = np.full(n, np.inf); dist[cloth] = 0.0; heap = [(0.0, int(i)) for i in np.nonzero(cloth)[0]]; heapq.heapify(heap)
    while heap:
        d, a = heapq.heappop(heap)
        if d > dist[a] or d > REACH * s: continue
        for b, w in nb.get(a, ()):
            if d + w < dist[b]: dist[b] = d + w; heapq.heappush(heap, (d + w, b))
    trim = (~cloth) & box & (dist < 0.012 * s)          # the brooch and the pale piping: cloth too
    cloth |= trim; dist[trim] = 0.0
    gi = {g.name: g.index for g in ob.vertex_groups}; limb = {gi[b] for b in LIMBS if b in gi}; spine = [b for b in SPINE if b in gi]
    mids = {'Spine': J('neck')[2], 'Spine01': J('Spine')[2], 'Spine02': J('Spine01')[2], 'Hips': J('Spine02')[2]}
    moved = 0; total = 0.0
    for i in np.nonzero(dist < REACH * s)[0]:
        v = me.vertices[int(i)]; keep = sstep(dist[i] / (REACH * s))
        take = 0.0; have = {}
        for ge in v.groups:
            if ge.group in limb and ge.weight > 0.0: take += ge.weight * (1 - keep); ge.weight *= keep
            else: have[ge.group] = ge.weight
        if take <= 1e-5: continue
        sp = {b: have.get(gi[b], 0.0) for b in spine}; tot = sum(sp.values())
        if tot < 1e-4:                                   # no spine weight of its own: the spine joint at its height
            b = min(spine, key=lambda q: abs(mids[q] - co[i, 2])); sp = {b: 1.0}; tot = 1.0
        for b, w in sp.items():
            if w > 0.0: ob.vertex_groups[b].add([int(i)], take * w / tot, 'ADD')
        moved += 1; total += take
    np.save(bpy.path.abspath('//') + who + '_corset.npy', np.hstack([co, col, cloth[:, None], np.where(np.isfinite(dist), dist, 9)[:, None]]))
    print(f'{who}: corset {int(cloth.sum())} points; {moved} points eased off collar bones and arms ({total:.1f} of weight to the spine)')
if out: bpy.ops.wm.save_as_mainfile(filepath=out)
else: bpy.ops.wm.save_mainfile()
