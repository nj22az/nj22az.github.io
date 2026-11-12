"""
Blender → what the viewer reads. Each collection named after one of the viewer's parts (`hull`, `machinery`, …) is
written as that part: every mesh object in it, as it stands in the file (modifiers applied), with its own normals and
the colours of its `Col` attribute. Objects made or changed by hand in Blender are written the same way as built ones.

The result is a part file (.npz): triangles in the ship's axes, grouped by part, material and mover (an object's custom
property `mover` names the motion it takes part in), with each material's look and the motions themselves.
assemble.py puts it into ferry/data/ferry.bin.gz.
"""
import json
import bpy
import numpy as np


def _triangles(ob, dg):
    ev = ob.evaluated_get(dg)
    me = ev.to_mesh()
    me.calc_loop_triangles()
    if hasattr(me, 'calc_normals_split'):
        me.calc_normals_split()
    nv, nl, nt = len(me.vertices), len(me.loops), len(me.loop_triangles)
    co = np.empty(nv * 3, np.float32)
    me.vertices.foreach_get('co', co)
    lv = np.empty(nl, np.int32)
    me.loops.foreach_get('vertex_index', lv)
    ln = np.empty(nl * 3, np.float32)
    if hasattr(me, 'corner_normals') and not hasattr(me, 'calc_normals_split'):
        me.corner_normals.foreach_get('vector', ln)
    else:
        me.loops.foreach_get('normal', ln)
    tl = np.empty(nt * 3, np.int32)
    me.loop_triangles.foreach_get('loops', tl)
    attr = me.color_attributes.get('Col')
    if attr is None or attr.domain != 'CORNER':
        raise RuntimeError(f'{ob.name}: no per-corner colour attribute "Col"')
    c = np.empty(nl * 4, np.float32)
    attr.data.foreach_get('color_srgb' if attr.data_type == 'BYTE_COLOR' else 'color', c)
    uv = None
    if me.uv_layers.active is not None:
        uv = np.empty(nl * 2, np.float32)
        me.uv_layers.active.data.foreach_get('uv', uv)
        uv = uv.reshape(-1, 2)[tl]
    M = np.array(ob.matrix_world, dtype=np.float64)
    pos = co.reshape(-1, 3) @ M[:3, :3].T + M[:3, 3]
    nor = ln.reshape(-1, 3) @ np.linalg.inv(M[:3, :3])
    nor /= np.maximum(np.linalg.norm(nor, axis=1, keepdims=True), 1e-12)
    ev.to_mesh_clear()
    # Blender (X forward, Y port, Z up) → ship (x port, y up, z forward).
    order = [1, 2, 0]
    return pos[lv[tl]][:, order], nor[tl][:, order], c.reshape(-1, 4)[tl][:, :3], uv


def write(path, groups, inputs=(), movers=(), ways=(), components=None, runs=(), doorways=()):
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    arrays, meshes = {}, []
    for gid in groups:
        coll = bpy.data.collections.get(gid)
        if coll is None:
            continue
        by_look = {}
        for ob in sorted(coll.all_objects, key=lambda o: o.name):
            if ob.type != 'MESH' or not ob.data.polygons:
                continue
            mat = ob.material_slots[0].material
            if 'jmf' not in mat:
                raise RuntimeError(f'{ob.name}: its material "{mat.name}" has no look for the viewer (custom property jmf)')
            mover = ob.get('mover') or ''
            rec = by_look.setdefault((mat.name, mover), dict(look=mat['jmf'].to_dict(), pos=[], nor=[], col=[], uv=[], objects=[]))
            p, n, c, uv = _triangles(ob, dg)
            textured = bool(rec['look'].get('textured'))
            if textured and uv is None:
                raise RuntimeError(f'{ob.name}: its material "{mat.name}" carries pictures, and the object has none (no UV layer)')
            rec['pos'].append(p)
            rec['nor'].append(n)
            rec['col'].append(c)
            if textured:
                rec['uv'].append(uv)
            rec['objects'].append(dict(name=ob.name, triangles=len(p) // 3))
        for (name, mover), rec in by_look.items():
            key = f'{gid}|{name}|{mover}'
            arrays[key + '|pos'] = np.concatenate(rec['pos']).astype(np.float32)
            arrays[key + '|nor'] = np.concatenate(rec['nor']).astype(np.float32)
            arrays[key + '|col'] = np.clip(np.rint(np.concatenate(rec['col']) * 255), 0, 255).astype(np.uint8)
            if rec['uv']:
                arrays[key + '|uv'] = np.concatenate(rec['uv']).astype(np.float32)
            look = rec['look']
            look['offset'] = list(look.get('offset') or [])
            meshes.append(dict(key=key, group=gid, material=name, mover=mover, look=look, objects=rec['objects'],
                               triangles=len(arrays[key + '|pos']) // 3))
    meta = dict(generator='ferry/blender/build.py', blender=bpy.app.version_string, meshes=meshes,
                inputs=list(inputs), movers=list(movers), ways=list(ways), runs=list(runs), doorways=list(doorways),
                # where each component of the register is: its box in the ship's axes, and the viewer's part it is drawn in
                components={k: dict(box=[list(map(float, v[0])), list(map(float, v[1]))], part=v[2]) for k, v in sorted((components or {}).items())})
    np.savez_compressed(path, meta=np.frombuffer(json.dumps(meta).encode(), dtype=np.uint8), **arrays)
    print(f'wrote {path}: {sum(m["triangles"] for m in meshes)} triangles in {len(meshes)} meshes')
