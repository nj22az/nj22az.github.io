"""
Builds the Chisum in Blender, section by section, and writes what the viewer needs.

    blender -b -P ferry/blender/build.py -- [--blend chisum.blend] [--part chisum-hull.npz]

Section 1 (10 November 2026): the hull. Her lines (lines.py), her shell, structure, appendages and marks (hull_*.py).
Each collection in the file is one of the viewer's parts that lift apart (`hull`, `machinery`, `car`); export_jmf.py writes
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


def looking_outward():
    """
    A solid whose faces look inward is drawn inside-out: the page shows its far inner wall and it reads as glass (the
    steering rams did, 10 November). The yard's round bar is tried in every direction, and each object made only of
    closed solids must enclose a positive volume by its faces' winding. Stops the build if one does not.
    """
    import bmesh

    def volume(mesh):
        bm = bmesh.new()
        bm.from_mesh(mesh)
        v = bm.calc_volume(signed=True)
        bm.free()
        return v

    wrong = []
    trial = shipyard.collection('trial')
    for k, axis in enumerate(((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1), (0.3, -0.8, 0.5))):
        part = shipyard.Part(f'trial bar {k}', 'Machinery paint')
        part.tube((0, 0, 0), axis, 0.1, 0.06)
        ob = part.build(trial)
        if volume(ob.data) <= 0:
            wrong.append(f'a round bar along {axis}')
        bpy.data.objects.remove(ob)
    bpy.data.collections.remove(trial)
    for name in ('Tail shafts', 'Rudder stock, port', 'Rudder stock, starboard', 'Rudder anodes, port', 'Intermediate shafts',
                 'Steering gear, bright steel', 'Rudder stock head, port', 'Ram cylinder, port', 'Ram rod, starboard', 'Tie bar',
                 'Fresh-water tanks, pipes', 'Chain lockers', 'Zinc anodes', 'Compass deck, slab', 'Compass deck, rails',
                 'Compass deck, mast and fittings', 'Compass deck, mast, steel fittings', 'Compass deck, dark fittings',
                 'Compass deck, antennas', 'Compass deck, antenna mounts', 'Compass deck, vent heads', 'Compass deck, vent fittings',
                 'Compass deck, searchlight and floodlights', 'Compass deck, light mounts', 'Compass deck, binnacle',
                 'Wheelhouse, plating', 'Wheelhouse, linings', 'Wheelhouse, window frames', 'Wheelhouse, deck covering', 'Wheelhouse, console',
                 'Wheelhouse, instruments', 'Wheelhouse, plastics', 'Wheelhouse, steel', 'Wheelhouse, brass', 'Wheelhouse, wood', 'Wheelhouse, upholstery',
                 'Wheelhouse, lamps and lenses', 'Wheelhouse, painted fittings', 'Wheelhouse, wing plating', 'Wheelhouse, wing door, port',
                 'Wheelhouse, wing door, starboard', 'Wheelhouse, wing door hardware, port', 'Wheelhouse, wing door hardware, starboard',
                 'Wheelhouse, corridor door', 'Wheelhouse, corridor door hardware', 'Wheelhouse deckhead, linings', 'Wheelhouse deckhead, console',
                 'Wheelhouse deckhead, instruments', 'Wheelhouse deckhead, steel', 'Wheelhouse deckhead, lamps and lenses', 'Wheelhouse deckhead, plastics',
                 'Wheelhouse deckhead, painted fittings', 'Wheelhouse deckhead, brass', 'Wheelhouse deckhead, wood',
                 'Compass deck, bridge fittings', 'Compass deck, bridge fittings, dark',
                 'Compass deck, bridge fittings, lenses', 'Compass deck, bridge fittings, steel'):
        ob = bpy.data.objects.get(name)
        if ob is None:
            wrong.append(name + ' (not built)')
        elif volume(ob.data) <= 0:
            wrong.append(name)
    print('solids looking outward: ' + ('all' if not wrong else 'NOT ' + '; '.join(wrong)))
    if wrong:
        raise SystemExit('solids drawn inside-out: ' + '; '.join(wrong))


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    opt = dict(zip(argv[::2], argv[1::2]))
    t0 = time.time()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    ship = shipyard.collection('Chisum')
    # A part goes to the viewer's part of the same name: her hull, or what the hull's build gives to the machinery
    # spaces and to the car deck (part.group).
    parts_of = {gid: shipyard.collection(gid, ship) for gid in ('hull', 'machinery', 'car', 'passenger', 'bridge', 'top')}
    report, inputs, movers, ways = {}, [], [], []
    for name in ('hull_shell', 'hull_structure', 'hull_appendages', 'hull_fittings', 'hull_markings', 'compass_deck', 'wheelhouse', 'stairs', 'bridge_deck', 'livery', 'vending', 'eg_room'):
        try:
            mod = importlib.import_module(name)
        except ModuleNotFoundError as e:
            if e.name != name:
                raise
            print('not built yet:', name)
            continue
        made = mod.build()
        if hasattr(mod, 'ways'):
            ways += mod.ways()
        if hasattr(mod, 'motion'):
            more_inputs, more_movers = mod.motion()
            inputs += more_inputs
            movers += more_movers
        for part in made:
            if part.build(parts_of[getattr(part, 'group', 'hull')]):
                report[part.name] = sum(max(1, len(f) - 2) for f in part.f)
        print(f'{name}: {len(made)} parts, {time.time() - t0:.1f} s')
    behind_the_plating()
    looking_outward()
    named = {ob['mover'] for ob in bpy.data.objects if 'mover' in ob}
    defined = {m['id'] for m in movers}
    if named != defined:
        raise SystemExit(f'moving parts and their motions do not agree: parts name {sorted(named - defined)} without a motion, '
                         f'motions {sorted(defined - named)} move nothing')
    print(f'moving parts: {len(named)} motions, each with its parts')
    total = sum(report.values())
    for k, v in report.items():
        print(f'  {v:7d}  {k}')
    print(f'  {total:7d}  triangles')
    if '--part' in opt:
        import export_jmf
        export_jmf.write(opt['--part'], tuple(parts_of), inputs, movers, ways, shipyard.COMPONENTS)
    if '--blend' in opt:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opt['--blend']), compress=True)
        print('saved', opt['--blend'])


main()
