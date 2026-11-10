"""
Builds the Christina in Blender, section by section, and writes what the viewer needs.

    blender -b -P ferry/blender/build.py -- [--blend christina.blend] [--part christina-hull.npz]

Section 1 (10 November 2026): the hull. Her lines (lines.py), her shell, structure, appendages and marks (hull_*.py).
Each collection in the file is one of the viewer's parts that lift apart (`hull`, `machinery`); export_jmf.py writes
them for assemble.py, which puts them into ferry/data/ferry.bin.gz.
"""
import sys, os, time, importlib
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bpy
import lines as L
import shipyard


def behind_the_plating():
    """
    The plating has two faces 12 mm apart, each cut into its own triangles. Where she twists (the counter, the forefoot)
    two sets of triangles do not lie parallel, and the inner face can come out through the outer one. From the middle
    and the corners of every triangle of the inner face, look outward square to it: the outer plating must be there,
    not behind. Stops the build if it is not.
    """
    from mathutils.bvhtree import BVHTree
    from mathutils import Vector
    outer_names = ('Shell plating, bottom', 'Shell plating, topsides')
    verts, polys = [], []
    for name in outer_names:
        me = bpy.data.objects[name].data
        base = len(verts)
        verts += [v.co.copy() for v in me.vertices]
        me.calc_loop_triangles()
        polys += [tuple(base + i for i in t.vertices) for t in me.loop_triangles]
    tree = BVHTree.FromPolygons(verts, polys)
    inner = bpy.data.objects['Shell plating, inner face'].data
    inner.calc_loop_triangles()
    nearest, out, tested, where = 1.0, 0, 0, []
    # Blender's X is her length. The end plates lie flat against the transom and the bow plate and are not tested.
    for t in inner.loop_triangles:
        co = [inner.vertices[i].co for i in t.vertices]
        if all(abs(abs(c.x) - L.HALF) < 0.03 for c in co):
            continue
        mid = (co[0] + co[1] + co[2]) / 3
        for p in (mid, (co[0] + mid) / 2, (co[1] + mid) / 2, (co[2] + mid) / 2):
            # The inner face looks inward, so outward is against its normal.
            hit = tree.ray_cast(p + t.normal * 0.002, -t.normal, 0.2)
            tested += 1
            if hit[0] is None:
                # The mouth of the thruster tunnel is open: nothing to find there.
                if (p - Vector((L.Z(29.0), p.y, -0.95))).length < 0.6:
                    continue
                out += 1
                where.append(f'{L.yard(p.x):.2f} m from the transom, {abs(p.y):.2f} m off the centreline, {L.above_keel(p.z):.2f} m above the keel')
            elif hit[3] < nearest:
                nearest, at = hit[3], p.copy()
    print(f'inner face of the plating: {tested} points, the plating never nearer than {nearest * 1000:.1f} mm '
          f'({L.yard(at.x):.2f} m from the transom, {abs(at.y):.2f} m off the centreline, {L.above_keel(at.z):.2f} m above the keel), {out} outside it')
    if out or nearest < 0.003:
        raise SystemExit('the inner face of the plating comes through the outer plating: ' + '; '.join(sorted(set(where))[:12]))
    # Her structure the same way: every corner of every frame, floor, girder, bulkhead and stringer is behind the
    # plating as it is drawn (the plating is flat between its own points; the structure follows her lines).
    proud, least, least_at = [], 1.0, ''
    for name in ('Frames', 'Floors', 'Double-bottom girders', 'Watertight bulkheads', 'Fore-peak stringers'):
        me = bpy.data.objects[name].data
        for v in me.vertices:
            if v.co.z > L.CAR - 0.05:
                continue
            near, normal, _, dist = tree.find_nearest(v.co)
            if near is None or dist > 0.1:
                continue
            behind = -(v.co - near).dot(normal)          # the plating's faces look outward
            if behind < least:
                least, least_at = behind, f'{name}, {L.yard(v.co.x):.2f} m from the transom, {abs(v.co.y):.2f} m off the centreline, {L.above_keel(v.co.z):.2f} m above the keel'

            if behind < 0.004:
                proud.append(f'{name}: {L.yard(v.co.x):.2f} m from the transom, {abs(v.co.y):.2f} m off the centreline, '
                             f'{L.above_keel(v.co.z):.2f} m above the keel, {behind * 1000:.1f} mm')
    print(f'structure behind the plating: never nearer than {least * 1000:.1f} mm ({least_at}), {len(proud)} corners through it')
    if proud:
        raise SystemExit('structure comes through the plating: ' + '; '.join(proud[:10]))


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    opt = dict(zip(argv[::2], argv[1::2]))
    t0 = time.time()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    ship = shipyard.collection('Christina')
    hull = shipyard.collection('hull', ship)
    machinery = shipyard.collection('machinery', ship)
    report = {}
    for name in ('hull_shell', 'hull_structure', 'hull_appendages', 'hull_markings'):
        try:
            mod = importlib.import_module(name)
        except ModuleNotFoundError as e:
            if e.name != name:
                raise
            print('not built yet:', name)
            continue
        made = mod.build()
        for part in made:
            target = machinery if getattr(part, 'group', 'hull') == 'machinery' else hull
            if part.build(target):
                report[part.name] = sum(max(1, len(f) - 2) for f in part.f)
        print(f'{name}: {len(made)} parts, {time.time() - t0:.1f} s')
    behind_the_plating()
    total = sum(report.values())
    for k, v in report.items():
        print(f'  {v:7d}  {k}')
    print(f'  {total:7d}  triangles')
    if '--part' in opt:
        import export_jmf
        export_jmf.write(opt['--part'], ('hull', 'machinery'))
    if '--blend' in opt:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opt['--blend']), compress=True)
        print('saved', opt['--blend'])


main()
