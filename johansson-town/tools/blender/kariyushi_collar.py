"""
Johansson's kariyushi collar, modelled in Blender.

Run headless (Blender 4.2+ or the `bpy` wheel):
    python3 tools/blender/kariyushi_collar.py [--render out_dir]

The collar is draped over the avatar's own torso: the lathe profile and the measurements
below are the ones build.js gives Johansson (torsoProfile, measure()). It is an open camp
collar, the collar a real kariyushi has:
  * a stand that rises behind the neck and rolls over into the fall,
  * the fall lying on the shoulders,
  * reverses that fold back down the front to an open V, ending at the first button.
The flat panel is given thickness (Solidify) and rounded (Subdivision Surface), applied,
and written to src/avatars/collar-mesh.js in body-relative units: x / torso width,
(y - neckY) / torso length, z / torso depth. build.js scales it to each body, so the same
collar fits everyone who wears a kariyushi.

Coordinates here are three.js ones (x right, y up, z forward). In Blender they are laid in
as (x, -z, y) so the model stands upright in the viewport.
"""
import json, math, os, sys
import bpy, bmesh
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Johansson, from measure(): metres.
W, D, T = 0.46179, 0.27751, 0.58218
HIP_Y, NECK_Y = 0.51627, 1.09846
NECK_R = 0.05923 * 1.2               # the neck tube
# The top of torsoProfile (t >= .66 is the same for every build).
PROFILE = [(1.0, .66), (.985, .74), (.95, .80), (.88, .87), (.76, .93), (.58, .98), (.38, 1.01), (.19, 1.03), (0.0, 1.04)]


def r_at(t):
    for (r0, y0), (r1, y1) in zip(PROFILE, PROFILE[1:]):
        if t <= y1:
            return r0 + (r1 - r0) * ((t - y0) / ((y1 - y0) or 1))
    return PROFILE[-1][0]


def t_for_radius(rho):
    """The height on the shoulder dome at which the lathe has normalised radius rho."""
    rho = max(0.0, min(1.0, rho))
    for (r0, y0), (r1, y1) in zip(PROFILE, PROFILE[1:]):
        if r1 <= rho <= r0:
            return y0 + (y1 - y0) * ((r0 - rho) / ((r0 - r1) or 1))
    return PROFILE[0][1]


def on_dome(x, z, lift):
    """Drop a plan point onto the shoulders: the lathe surface below it, plus lift."""
    rho = math.hypot(x / (W / 2), z / (D / 2))
    y = HIP_Y + T * t_for_radius(rho)
    return Vector((x, y + lift, z))


def on_chest(x, y, lift):
    """Push a point in front view onto the chest: the lathe surface in front of it, plus lift."""
    t = (y - HIP_Y) / T
    r = r_at(t)
    z = (D / 2) * math.sqrt(max(0.0, r * r - (x / (W / 2)) ** 2))
    # Lift along the surface normal (roughly the plan normal of the ellipse).
    nx, nz = x / (W / 2) ** 2, z / (D / 2) ** 2
    n = math.hypot(nx, nz) or 1
    return Vector((x + lift * nx / n, y, z + lift * nz / n))


def smooth(a, b, u):
    u = max(0.0, min(1.0, u))
    return a + (b - a) * (u * u * (3 - 2 * u))


# ---------------------------------------------------------------------------------------
# The panel. Each station across the collar has three points:
#   foot  - where the stand meets the body (hidden inside the neckline),
#   roll  - the fold, the collar's highest, softest edge,
#   edge  - the outer edge, lying on the shoulders or the chest.
# Stations run from the V point up the right reverse, round the back of the neck and down
# the left reverse to the V point again.
# ---------------------------------------------------------------------------------------
V_Y = NECK_Y - 0.205 * T             # the V closes on the first button
TIP = (0.150, NECK_Y - 0.083 * T)    # the collar point, out on the chest
RING = NECK_R + 0.011                # the stand, just clear of the neck


def surface(phi, t, lift=0.0):
    """A point on the torso lathe at angle phi (0 = front) and height t, lifted along its normal."""
    r = r_at(t)
    p = Vector((math.sin(phi) * r * W / 2, HIP_Y + T * t, math.cos(phi) * r * D / 2))
    if lift:
        e = 1e-3
        dphi = Vector((math.cos(phi) * r * W / 2, 0, -math.sin(phi) * r * D / 2))
        r2 = r_at(t - e)
        dt = (Vector((math.sin(phi) * r2 * W / 2, HIP_Y + T * (t - e), math.cos(phi) * r2 * D / 2)) - p)
        n = dphi.cross(dt).normalized()
        if n.dot(Vector((p.x, 0, p.z))) < 0 and n.y < 0:
            n = -n
        p = p + n * lift
    return p


def walk_down(phi, t0, length):
    """The height reached walking `length` metres down the torso from t0 at angle phi."""
    t, acc, step = t0, 0.0, 0.002
    prev = surface(phi, t)
    while acc < length and t > 0.5:
        t -= step
        cur = surface(phi, t)
        acc += (cur - prev).length
        prev = cur
    return t


def neck_t(phi, ring):
    """Where the shoulder dome meets a ring of plan radius `ring` round the neck."""
    x, z = ring * math.sin(phi), ring * math.cos(phi)
    return t_for_radius(math.hypot(x / (W / 2), z / (D / 2)))


def neck_station(psi):
    """psi: angle round the body from the front (radians), for the stand and fall."""
    s, c = math.sin(psi), math.cos(psi)
    back = smooth(0.0, 1.0, (psi - math.radians(60)) / math.radians(120))
    roll_y = NECK_Y + smooth(0.010, 0.034, back)          # the stand rises behind the neck
    roll = Vector((RING * 1.05 * s, roll_y, RING * c))
    t_foot = neck_t(psi, RING)
    foot = surface(psi, t_foot, -0.006)
    fall = smooth(0.070, 0.080, back)                     # how far the collar falls
    edge = surface(psi, walk_down(psi, t_foot, fall), 0.010)
    return foot, roll, edge


def lapel_station(u):
    """u: 0 where the reverse leaves the neck, 1 at the V point."""
    f0, r0, e0 = neck_station(math.radians(52))
    vx, vy = 0.0, V_Y
    # The fold runs down from the side of the neck to the V, bowing out a little.
    rx = (1 - u) * r0.x + u * vx + 0.010 * math.sin(math.pi * u)
    ry = (1 - u) * r0.y + u * vy
    roll = on_chest(rx, ry, smooth(0.026, 0.013, u))
    # The outer edge runs from the collar point down to the V.
    ex = (1 - u) ** 1.15 * TIP[0] + (1 - (1 - u) ** 1.15) * vx
    ey = (1 - u) * TIP[1] + u * vy
    edge = on_chest(ex, ey, smooth(0.012, 0.010, u))
    foot = on_chest(rx * 0.92, ry - 0.004, -0.004)
    return foot, roll, edge


def stations(n_neck=12, n_lapel=7):
    out = []
    for i in range(n_lapel, 0, -1):                       # right V up to the neck
        out.append(lapel_station(i / n_lapel))
    for i in range(n_neck + 1):                           # round the back
        psi = math.radians(52) + (math.radians(180) - math.radians(52)) * i / n_neck
        out.append(neck_station(psi))
    half = out[:]
    mirrored = [tuple(Vector((-p.x, p.y, p.z)) for p in st) for st in reversed(half[:-1])]
    return half + mirrored


def to_blender(p):
    return (p.x, -p.z, p.y)


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    st = stations()
    bm = bmesh.new()
    grid = [[bm.verts.new(to_blender(p)) for p in s] for s in st]
    for a, b in zip(grid, grid[1:]):
        for j in range(len(a) - 1):
            bm.faces.new((a[j], b[j], b[j + 1], a[j + 1]))
    mesh = bpy.data.meshes.new('KariyushiCollar')
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new('KariyushiCollar', mesh)
    bpy.context.scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    # Cloth thickness, then a soft roll: the fold reads as a round edge, not a blade.
    solid = obj.modifiers.new('Cloth', 'SOLIDIFY')
    solid.thickness = 0.011
    solid.offset = 1.0
    solid.use_even_offset = True
    subd = obj.modifiers.new('Soft', 'SUBSURF')
    subd.levels = 1
    subd.render_levels = 1
    bpy.ops.object.modifier_apply(modifier='Cloth')
    bpy.ops.object.modifier_apply(modifier='Soft')
    for poly in mesh.polygons:
        poly.use_smooth = True
    return obj


def export(obj, path):
    mesh = obj.data
    mesh.calc_loop_triangles()
    pos = []
    for v in mesh.vertices:
        x, y, z = v.co.x, v.co.z, -v.co.y                 # back to three.js
        pos += [round(x / W, 4), round((y - NECK_Y) / T, 4), round(z / D, 4)]
    idx = [i for tri in mesh.loop_triangles for i in tri.vertices]
    js = (
        "// Generated by tools/blender/kariyushi_collar.py -- do not edit by hand.\n"
        "// The kariyushi's open camp collar, modelled in Blender: positions are body-relative\n"
        "// (x / torso width, (y - neckY) / torso length, z / torso depth); build.js scales them.\n"
        f"export const COLLAR_MESH=Object.freeze({{positions:{json.dumps(pos, separators=(',', ':'))},\n"
        f" indices:{json.dumps(idx, separators=(',', ':'))}}});\n"
    )
    with open(path, 'w') as f:
        f.write(js)
    print('collar', len(mesh.vertices), 'verts', len(idx) // 3, 'tris ->', path)


def render(obj, out_dir):
    """A turntable of the collar on a stand-in for Johansson's torso, neck and head."""
    scene = bpy.context.scene
    shirt = bpy.data.materials.new('Shirt')
    shirt.diffuse_color = (0.21, 0.43, 0.70, 1)
    shirt.use_nodes = True
    shirt.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.21, 0.43, 0.70, 1)
    shirt.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.8
    skin = bpy.data.materials.new('Skin')
    skin.use_nodes = True
    skin.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.72, 0.34, 0.20, 1)
    obj.data.materials.append(shirt)
    # The torso: the same lathe as build.js (with Johansson's waist and hips below).
    prof = [(0, -.1), (.86 * .9, -.08), (.9, .05), (.9, .15), (.98, .3), (.98, .5)] + PROFILE
    bm = bmesh.new()
    rings = []
    for r, t in prof:
        ring = []
        for i in range(48):
            a = 2 * math.pi * i / 48
            ring.append(bm.verts.new(to_blender(Vector((math.sin(a) * r * W / 2, HIP_Y + T * t, math.cos(a) * r * D / 2)))))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for i in range(48):
            bm.faces.new((a[i], a[(i + 1) % 48], b[(i + 1) % 48], b[i]))
    me = bpy.data.meshes.new('Torso')
    bm.to_mesh(me)
    bm.free()
    torso = bpy.data.objects.new('Torso', me)
    for p in me.polygons:
        p.use_smooth = True
    me.materials.append(shirt)
    scene.collection.objects.link(torso)
    # The V of skin under the open collar.
    bpy.ops.mesh.primitive_cylinder_add(radius=NECK_R, depth=0.1, location=(0, 0, NECK_Y + 0.03))
    bpy.context.object.data.materials.append(skin)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.2, location=(0, 0, NECK_Y + 0.25))
    bpy.ops.object.shade_smooth()
    bpy.context.object.data.materials.append(skin)
    v = bpy.data.meshes.new('V')
    bm = bmesh.new()
    pts = [on_chest(-0.062, NECK_Y - 0.005, 0.002), on_chest(0.062, NECK_Y - 0.005, 0.002), on_chest(0, V_Y, 0.002)]
    bm.faces.new([bm.verts.new(to_blender(p)) for p in pts])
    bm.to_mesh(v)
    bm.free()
    vo = bpy.data.objects.new('V', v)
    v.materials.append(skin)
    scene.collection.objects.link(vo)
    # Light, camera, world.
    world = bpy.data.worlds.new('W')
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.80, 0.90, 0.93, 1)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.8
    scene.world = world
    sun = bpy.data.objects.new('Sun', bpy.data.lights.new('Sun', 'SUN'))
    sun.data.energy = 3.5
    sun.rotation_euler = (math.radians(50), math.radians(10), math.radians(30))
    scene.collection.objects.link(sun)
    cam = bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam'))
    cam.data.lens = 70
    scene.collection.objects.link(cam)
    scene.camera = cam
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 24
    scene.cycles.device = 'CPU'
    scene.render.resolution_x, scene.render.resolution_y = 520, 520
    os.makedirs(out_dir, exist_ok=True)
    target = Vector((0, 0, NECK_Y - 0.06))
    for name, ang, el in (('front', 0, 8), ('three-quarter', 40, 14), ('side', 90, 10), ('back', 180, 14)):
        a, e = math.radians(ang), math.radians(el)
        dist = 1.05
        cam.location = target + Vector((math.sin(a) * math.cos(e) * dist, -math.cos(a) * math.cos(e) * dist, math.sin(e) * dist))
        cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
        scene.render.filepath = os.path.join(out_dir, f'collar-{name}.png')
        bpy.ops.render.render(write_still=True)


if __name__ == '__main__':
    obj = build()
    export(obj, os.path.join(ROOT, 'src', 'avatars', 'collar-mesh.js'))
    if '--render' in sys.argv:
        render(obj, sys.argv[sys.argv.index('--render') + 1])
