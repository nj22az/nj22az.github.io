"""Minato izakaya, the room. Blender 4.2+, metres, Principled glTF materials.
Run: blender -b --python tools/blender/build-minato-interior.py -- --root .
 or: python -c "import bpy" available -> python tools/blender/build-minato-interior.py -- --root .

A small harbour izakaya as it would have stood in 1997, fitted into the room the game
already walks: the counter, its five stools, the two shared tables, Nao's place at the
kitchen end and every collider and prompt in izakaya.js keep the coordinates they had.
What changes is everything round them.

 - The walls are a room rather than a box: cedar wainscot to the dado, earth plaster
   above, posts, a picture rail, beams and a slatted ceiling, and lattice windows with
   the paper lit from behind.
 - The counter is a working counter. A guest ledge at elbow height, a raised serving
   shelf behind it with the glass fish case, and a steel work top on Nao's side with
   the charcoal grill under its hood, the oden pot, the sink and the beer tap.
 - Things a bar of that year actually had on it: soy and shichimi, ashtrays, paper
   chopstick sleeves, rolled oshibori, a till, a beckoning cat, a kamidana up in the
   corner, the back bar of sake and kept bottles, crates of empties by the door.
 - The east side is a raised tatami koagari with low tables and cushions, shoes left on
   the stone at its step.

Menu strips and signs are drawn at runtime (izakaya.js) so the lettering stays sharp.
Input coordinates are Three.js (x, y, z); Blender takes (x, -z, y).
"""
import bpy, math, sys, argparse, json, random
from pathlib import Path

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
p = argparse.ArgumentParser(); p.add_argument('--root', required=True); a = p.parse_args(args)
root = Path(a.root).resolve()
out = root / 'assets/models/izakaya'; out.mkdir(parents=True, exist_ok=True)
art = root / 'art/izakaya'; art.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
rng = random.Random(1997)

materials = {}
def lin(hexstr):
    return tuple((int(hexstr[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4))
def mat(name, color, rough=.7, metal=0., glow=0., alpha=1.):
    m = bpy.data.materials.new(name); m.use_nodes = True
    bs = m.node_tree.nodes['Principled BSDF']
    bs.inputs['Base Color'].default_value = (*lin(color), 1)
    bs.inputs['Roughness'].default_value = rough
    bs.inputs['Metallic'].default_value = metal
    if glow:
        bs.inputs['Emission Color'].default_value = (*lin(color), 1)
        bs.inputs['Emission Strength'].default_value = glow
    if alpha < 1:
        bs.inputs['Alpha'].default_value = alpha
        for attr, value in (('blend_method', 'BLEND'), ('surface_render_method', 'BLENDED')):
            try: setattr(m, attr, value)
            except Exception: pass
    materials[name] = m
    return m

M = dict(
    smoke=mat('Smoked cedar', '3f2a1c', .78),
    floorA=mat('Cedar floor', '76502f', .74),
    floorB=mat('Cedar floor, darker board', '65432a', .76),
    honey=mat('Honey cedar', 'a06c42', .52),
    table=mat('Table cedar', '6e4a2f', .5),
    hood=mat('Hood steel', '7a8082', .45, .55),
    wainscot=mat('Wainscot boards', '553a26', .72),
    plaster=mat('Earth plaster', 'c9a878', .92),
    steel=mat('Brushed steel', 'aeb3b3', .34, .75),
    darksteel=mat('Blackened steel', '3b3f40', .5, .6),
    glass=mat('Display glass', 'd8ecef', .05, 0, 0, .22),
    ice=mat('Crushed ice', 'eef4f3', .35),
    salmon=mat('Salmon', 'ea8a5c', .4), tuna=mat('Tuna', '9e2c35', .4),
    whitefish=mat('White fish', 'efe3d2', .4), shrimp=mat('Sweet shrimp', 'e97a54', .4),
    ember=mat('Binchotan embers', 'ff6a1f', .9, 0, 3.0),
    glaze=mat('Tare glaze', '7c3f1b', .38),
    vinyl=mat('Red vinyl', 'a5322b', .45),
    tatami=mat('Tatami', 'b7ae6c', .85), heri=mat('Tatami edging', '28332f', .8),
    zabuton=mat('Zabuton indigo', '2d4868', .8),
    lacquer=mat('Black lacquer', '1d1917', .3),
    lantern=mat('Red lantern paper', 'c8402e', .7, 0, .9),
    bulb=mat('Warm bulb', 'ffd28a', .4, 0, 4.0),
    enamel=mat('Green enamel', '35574a', .35),
    green=mat('Bottle green', '2c5c43', .22), brown=mat('Bottle brown', '5a3016', .22),
    clear=mat('Clear bottle', 'b9c9c2', .15),
    label=mat('Paper label', 'efe3c6', .8), red=mat('Red label', 'b3382c', .6),
    porcelain=mat('Porcelain', 'f1ece0', .3), blue=mat('Arita blue', '2f5872', .3),
    shoji=mat('Lit shoji paper', 'f6e7c6', .9, 0, .55),
    daikon=mat('Daikon', 'e3d3a6', .5), egg=mat('Oden egg', 'b98a4a', .45),
    konnyaku=mat('Konnyaku', '67615b', .5), broth=mat('Dashi', 'a8732f', .2),
    beer=mat('Lager', 'd3962a', .15), foam=mat('Beer head', 'f8f2e2', .6),
    crateY=mat('Yellow beer crate', 'd9aa33', .6), crateR=mat('Red beer crate', 'a9322b', .6),
    straw=mat('Barrel straw', 'c2ab76', .9), rope=mat('Straw rope', '6b5436', .9),
    noren=mat('Indigo noren', '28395a', .8),
    stone=mat('Step stone', '85817a', .9),
    edamame=mat('Edamame', '7d9b45', .6),
    cream=mat('Till cream', 'e6dcc4', .5),
    sakaki=mat('Sakaki leaves', '3d6a37', .7),
)

def loc(v): return (v[0], -v[2], v[1])
def cube(name, size, at, m, rot=0., bevel=0.):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc(at))
    o = bpy.context.object; o.name = name
    o.scale = (size[0], size[2], size[1]); o.rotation_euler.z = rot
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(m)
    if bevel:
        b = o.modifiers.new('Worked edges', 'BEVEL'); b.width = min(bevel, min(size) / 3); b.segments = 1
        bpy.ops.object.modifier_apply(modifier=b.name)
    return o
def cyl(name, r, h, at, m, verts=12, axis='y', rot=0.):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=loc(at))
    o = bpy.context.object; o.name = name
    if axis == 'x': o.rotation_euler.y = math.pi / 2
    elif axis == 'z': o.rotation_euler.x = math.pi / 2
    o.rotation_euler.z += rot
    o.data.materials.append(m)
    for f in o.data.polygons: f.use_smooth = verts > 8
    return o
def cone(name, r1, r2, h, at, m, verts=12):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=h, location=loc(at))
    o = bpy.context.object; o.name = name; o.data.materials.append(m)
    for f in o.data.polygons: f.use_smooth = True
    return o
def ball(name, scale, at, m, seg=10, rings=6):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=1, location=loc(at))
    o = bpy.context.object; o.name = name; o.scale = (scale[0], scale[2], scale[1]); o.data.materials.append(m)
    for f in o.data.polygons: f.use_smooth = True
    return o
def ring(name, R, r, at, m):
    bpy.ops.mesh.primitive_torus_add(major_segments=20, minor_segments=4, major_radius=R, minor_radius=r, location=loc(at))
    o = bpy.context.object; o.name = name; o.data.materials.append(m); return o

# --------------------------------------------------------------------------- floor
cube('Diorama base', (13, .3, 13), (0, -.16, 0), M['smoke'])
x = -6.4; i = 0
while x < 6.39:
    w = min(.32, 6.4 - x)
    cube('Floorboard', (w - .006, .04, 12.8), (x + w / 2, .02, 0), M['floorA'] if i % 2 else M['floorB'])
    x += w; i += 1

# --------------------------------------------------------------------------- walls
cube('Back wall', (12.8, 3.8, .2), (0, 1.9, -6.4), M['plaster'])
cube('Left cutaway wall', (.2, 2.8, 13), (-6.4, 1.4, 0), M['plaster'])
cube('Right cutaway rim', (.2, .65, 13), (6.4, .325, 0), M['wainscot'])

def wainscot_run(axis, fixed, a0, a1, skip=()):
    """Vertical cedar boards to the dado along one wall, with a cap rail."""
    length = a1 - a0; mid = (a0 + a1) / 2
    if axis == 'x':
        cube('Wainscot panel', (length, .95, .03), (mid, .515, fixed), M['wainscot'])
        cube('Dado rail', (length, .06, .07), (mid, 1.0, fixed + (.02 if fixed < 0 else -.02)), M['smoke'])
    else:
        cube('Wainscot panel', (.03, .95, length), (fixed, .515, mid), M['wainscot'])
        cube('Dado rail', (.07, .06, length), (fixed + (.02 if fixed < 0 else -.02), 1.0, mid), M['smoke'])
    n = int(length / .42)
    for k in range(1, n):
        t = a0 + k * length / n
        if any(s0 < t < s1 for s0, s1 in skip): continue
        if axis == 'x': cube('Board batten', (.035, .93, .025), (t, .5, fixed + (.02 if fixed < 0 else -.02)), M['smoke'])
        else: cube('Board batten', (.025, .93, .035), (fixed + (.02 if fixed < 0 else -.02), .5, t), M['smoke'])

wainscot_run('x', -6.285, -6.3, 6.3, skip=((4.8, 5.9),))   # the back-room doorway interrupts it
wainscot_run('z', -6.285, -6.3, 6.3)
wainscot_run('z', 6.285, -6.3, 6.3)
wainscot_run('x', 6.285, -6.3, -1.85)
wainscot_run('x', 6.285, 1.85, 6.3)

for xx in (-6.22, -3.2, 0, 3.2):
    cube('Wall post', (.16, 3.8, .14), (xx, 1.9, -6.22), M['smoke'])
for zz in (-6.2, -3.4, -.6, 1.8, 4.3, 6.2):
    cube('Wall post', (.14, 3.8, .16), (-6.22, 1.9, zz), M['smoke'])
for zz in (-6.2, -2.9, -.6, 1.8, 4.3, 6.2):
    cube('Wall post', (.14, 3.8, .16), (6.22, 1.9, zz), M['smoke'])
for xx in (-6.2, -1.9, 1.9, 5.4):   # clear of the street window
    cube('Wall post', (.16, 3.8, .14), (xx, 1.9, 6.22), M['smoke'])
# Picture rail above the posters, and a head rail under the beams.
for y in (2.85, 3.66):
    cube('Wall rail', (12.6, .09, .07), (0, y, -6.24), M['smoke'])
    cube('Wall rail', (.07, .09, 12.6), (-6.24, y, 0), M['smoke'])
    cube('Wall rail', (.07, .09, 12.6), (6.24, y, 0), M['smoke'])
    cube('Wall rail', (4.45, .09, .07), (-4.07, y, 6.24), M['smoke'])
    cube('Wall rail', (4.45, .09, .07), (4.07, y, 6.24), M['smoke'])

# --------------------------------------------------------------------------- ceiling
for zz in (-4.8, -1.6, 1.6, 4.8):
    cube('Ceiling beam', (12.8, .24, .2), (0, 3.62, zz), M['smoke'], bevel=.02)
for xx in (-3.2, 3.2):
    cube('Ceiling purlin', (.18, .16, 12.8), (xx, 3.5, 0), M['smoke'])
for k in range(26):
    cube('Ceiling slat', (12.8, .02, .08), (0, 3.77, -6.25 + k * .5), M['floorB'])

# --------------------------------------------------------------------------- windows
def shoji(name, centre, width, height, axis):
    """A lattice window: frame, kumiko grid and paper lit from behind."""
    cx, cy, cz = centre
    if axis == 'x':   # in a wall running along x
        cube(name + ' paper', (width, height, .01), (cx, cy, cz), M['shoji'])
        for dx in (-width / 2, width / 2): cube(name + ' frame', (.06, height + .1, .05), (cx + dx, cy, cz), M['honey'])
        for dy in (-height / 2, height / 2): cube(name + ' frame', (width + .1, .06, .05), (cx, cy + dy, cz), M['honey'])
        for k in range(1, 6): cube(name + ' kumiko', (.018, height, .03), (cx - width / 2 + k * width / 6, cy, cz), M['honey'])
        for k in range(1, 4): cube(name + ' kumiko', (width, .018, .03), (cx, cy - height / 2 + k * height / 4, cz), M['honey'])
    else:
        cube(name + ' paper', (.01, height, width), (cx, cy, cz), M['shoji'])
        for dz in (-width / 2, width / 2): cube(name + ' frame', (.05, height + .1, .06), (cx, cy, cz + dz), M['honey'])
        for dy in (-height / 2, height / 2): cube(name + ' frame', (.05, .06, width + .1), (cx, cy + dy, cz), M['honey'])
        for k in range(1, 6): cube(name + ' kumiko', (.03, height, .018), (cx, cy, cz - width / 2 + k * width / 6), M['honey'])
        for k in range(1, 4): cube(name + ' kumiko', (.03, .018, width), (cx, cy - height / 2 + k * height / 4, cz), M['honey'])

shoji('Street window', (-3.9, 1.72, 6.27), 2.2, 1.1, 'x')
shoji('Koagari window', (6.27, 1.72, 1.8), 2.4, 1.0, 'z')

# --------------------------------------------------------------------------- counter
cube('Counter carcass', (8.3, .95, .75), (-.8, .475, -2.55), M['smoke'])
for k in range(42):
    cube('Counter front slat', (.1, .86, .03), (-4.9 + k * .197, .52, -2.155), M['wainscot'])
cube('Counter kick', (8.3, .09, .05), (-.8, .045, -2.14), M['smoke'])
cube('Guest ledge', (8.4, .07, .55), (-.8, 1.075, -2.2), M['honey'], bevel=.02)
for k in range(9): cube('Serving shelf bracket', (.06, .14, .18), (-4.8 + k * 1.0, 1.16, -2.6), M['smoke'])
cube('Serving shelf', (8.3, .06, .26), (-.8, 1.25, -2.6), M['honey'], bevel=.015)
cube('Work top cabinet', (8.3, .88, .58), (-.8, .44, -3.06), M['steel'])
cube('Work top', (8.35, .035, .62), (-.8, .9, -3.06), M['steel'])
for k in range(7): cube('Cabinet door seam', (.01, .7, .005), (-4.3 + k * 1.2, .44, -3.353), M['darksteel'])

# Neta case: fish on ice behind glass, on the serving shelf.
cube('Neta case glass', (2.6, .24, .24), (-2.4, 1.4, -2.6), M['glass'])
cube('Neta case rim', (2.64, .02, .26), (-2.4, 1.53, -2.6), M['steel'])
for dx in (-1.31, 1.31): cube('Neta case end', (.02, .25, .25), (-2.4 + dx, 1.405, -2.6), M['steel'])
cube('Neta case ice', (2.54, .03, .2), (-2.4, 1.295, -2.6), M['ice'])
fish = [M['salmon'], M['tuna'], M['whitefish'], M['shrimp']]
for k in range(10):
    cube('Fish on ice', (.2, .05, .12), (-3.55 + k * .255, 1.335, -2.6), fish[k % 4], rot=.25 * (-1) ** k)

# Place settings, condiments and ashtrays along the ledge. The props the venue hands
# out stand at x ± .15 in front of each stool, so these keep to either side of that.
STOOLS = (-3.8, -2.3, -.8, .7, 2.2)
for sx in STOOLS:
    cube('Chopstick sleeve', (.03, .008, .23), (sx - .34, 1.115, -2.08), M['porcelain'])
    cube('Sleeve band', (.032, .009, .04), (sx - .34, 1.116, -2.14), M['red'])
    cyl('Rolled oshibori', .022, .17, (sx + .35, 1.13, -2.1), M['porcelain'], 8, axis='z')
    cube('Oshibori tray', (.08, .01, .2), (sx + .35, 1.113, -2.1), M['honey'])
for cx in (-3.05, -.05, 1.45):
    cyl('Soy cruet', .026, .09, (cx - .06, 1.155, -2.35), M['porcelain'], 10)
    cyl('Soy cruet cap', .02, .025, (cx - .06, 1.212, -2.35), M['red'], 10)
    cyl('Shichimi tin', .018, .07, (cx + .02, 1.145, -2.36), M['brown'], 10)
    cube('Toothpick box', (.04, .06, .04), (cx + .08, 1.14, -2.35), M['honey'])
    cyl('Glass ashtray', .06, .025, (cx + .02, 1.123, -2.02), M['clear'], 12)

# Till and the beckoning cat at the kitchen end.
cube('Till', (.32, .16, .28), (3.0, 1.19, -2.28), M['cream'], bevel=.02)
cube('Till keys', (.26, .01, .12), (3.0, 1.275, -2.24), M['smoke'], rot=0)
cube('Till display', (.14, .06, .02), (3.0, 1.3, -2.4), M['darksteel'])
cyl('Maneki-neko base', .06, .025, (2.72, 1.29, -2.6), M['red'], 12)
ball('Maneki-neko body', (.065, .085, .055), (2.72, 1.37, -2.6), M['porcelain'])
ball('Maneki-neko head', (.058, .052, .05), (2.72, 1.49, -2.6), M['porcelain'])
for dx in (-.035, .035): cone('Maneki-neko ear', .018, 0, .035, (2.72 + dx, 1.54, -2.6), M['porcelain'], 4)
ball('Maneki-neko paw', (.022, .03, .022), (2.78, 1.52, -2.57), M['porcelain'], 8, 5)
cube('Maneki-neko collar', (.09, .012, .06), (2.72, 1.44, -2.6), M['red'])

# --------------------------------------------------------------------------- kitchen side
# Charcoal grill under its hood, where the guests can watch the skewers.
cube('Grill body', (1.3, .2, .34), (1.7, 1.02, -3.02), M['darksteel'])
cube('Grill embers', (1.2, .03, .26), (1.7, 1.125, -3.02), M['ember'])
for k in range(12):
    cube('Skewer', (.012, .012, .36), (1.15 + k * .1, 1.16, -3.02), M['honey'])
    for j in range(4): cube('Yakitori', (.034, .03, .036), (1.15 + k * .1, 1.175, -3.12 + j * .06), M['glaze'])
cube('Grill hood', (1.5, .26, .62), (1.7, 2.4, -3.12), M['hood'], bevel=.02)
cube('Hood duct', (.36, 1.1, .36), (1.7, 3.08, -3.3), M['hood'])

# Oden: a square pot of dashi with its dividers and what is simmering in it.
cube('Oden pot', (.62, .16, .38), (-4.2, .99, -3.05), M['steel'])
cube('Oden dashi', (.58, .01, .34), (-4.2, 1.07, -3.05), M['broth'])
for dx in (-.1, .1): cube('Oden divider', (.008, .03, .34), (-4.2 + dx, 1.07, -3.05), M['steel'])
for k in range(3): cyl('Oden daikon', .045, .04, (-4.4 + k * .07, 1.08, -3.12 + (k % 2) * .1), M['daikon'], 10)
for k in range(3): ball('Oden egg', (.03, .026, .03), (-4.2, 1.08, -3.14 + k * .08), M['egg'], 8, 5)
for k in range(3): cube('Oden konnyaku', (.06, .02, .05), (-4.0, 1.08, -3.14 + k * .08), M['konnyaku'], rot=.4 * k)

# Sink and tap, beer tap and glasses.
cube('Sink basin', (.46, .012, .36), (2.85, .915, -3.06), M['darksteel'])
cyl('Sink tap', .012, .26, (2.85, 1.05, -3.3), M['steel'], 8)
cube('Tap spout', (.02, .02, .14), (2.85, 1.17, -3.24), M['steel'])
cyl('Beer tower', .045, .34, (-.3, 1.09, -2.95), M['steel'], 12)
cube('Beer spout', (.03, .03, .12), (-.3, 1.2, -2.86), M['steel'])
cyl('Beer tap handle', .016, .12, (-.3, 1.3, -2.9), M['lacquer'], 8)
for k in range(4):
    cyl('Beer glass', .036, .13, (-.05 + k * .085, .985, -3.0), M['clear'], 10)

# Back bar: cupboard, shelves of isshobin, shochu and kept whisky with name tags.
cube('Back bar cupboard', (7.1, .88, .55), (-1, .44, -5.95), M['wainscot'])
cube('Back bar top', (7.2, .04, .6), (-1, .9, -5.95), M['honey'])
for k in range(8): cube('Cupboard door seam', (.012, .74, .005), (-4.4 + k * .9, .44, -5.672), M['smoke'])
cyl('Rice cooker', .15, .22, (-3.6, 1.03, -5.95), M['porcelain'], 14)
cyl('Rice cooker lid', .14, .04, (-3.6, 1.16, -5.95), M['steel'], 14)
for k in range(5): cube('Stacked plates', (.26, .012, .26), (-2.7, .93 + k * .014, -5.95), M['blue'])
for y in (1.3, 1.75, 2.2):
    cube('Bottle shelf', (7.0, .045, .32), (-1, y, -6.08), M['smoke'])
    for k in range(8): cube('Shelf bracket', (.04, .1, .28), (-4.4 + k * .97, y - .07, -6.1), M['smoke'])
def bottle(x, y, z, kind):
    if kind == 'isshobin':
        body, neck, h, r = rng.choice([M['green'], M['brown']]), None, .3, .05
    elif kind == 'shochu':
        body, h, r = M['clear'], .22, .042
    else:
        body, h, r = M['brown'], .2, .045
    cyl('Bottle', r, h, (x, y + h / 2, z), body, 8)
    cone('Bottle shoulder', r, r * .45, .05, (x, y + h + .025, z), body, 8)
    cyl('Bottle neck', r * .42, .07, (x, y + h + .085, z), body, 8)
    cube('Bottle label', (r * 1.5, h * .5, .004), (x, y + h * .45, z + r + .001), M['label'] if rng.random() > .3 else M['red'])
    if kind == 'keep':   # a customer's kept bottle, with a card on the neck
        cube('Keep tag', (.05, .03, .004), (x, y + h + .06, z + r * .5), M['label'])
for y in (1.3, 1.75, 2.2):
    for k in range(20):
        kind = ('isshobin', 'shochu', 'keep')[(k + int(y * 10)) % 3] if y > 1.4 else ('keep', 'shochu')[k % 2]
        bottle(-4.3 + k * .345 + rng.uniform(-.02, .02), y + .02, -6.08, kind)

# The prep bench in the corner, and a stock pot on the ring.
cube('Prep bench', (2.2, .9, 1.0), (4.65, .45, -4.7), M['steel'])
cube('Prep bench top', (2.25, .035, 1.05), (4.65, .92, -4.7), M['steel'])
for dx in (-.45, .45): ring('Gas ring', .12, .012, (4.65 + dx, .95, -4.7), M['darksteel'])
cyl('Stock pot', .2, .3, (4.2, 1.1, -4.7), M['steel'], 16)
cube('Chopping board', (.45, .03, .3), (5.25, .95, -4.6), M['honey'])

# Doorway to the back room, with its noren.
cube('Back room opening', (1.1, 2.0, .02), (5.35, 1.0, -6.27), M['lacquer'])
for dx in (-.6, .6): cube('Doorway post', (.1, 2.1, .12), (5.35 + dx, 1.05, -6.24), M['smoke'])
cube('Doorway lintel', (1.3, .1, .12), (5.35, 2.08, -6.24), M['smoke'])
for k in range(3): cube('Noren panel', (.34, .8, .01), (4.99 + k * .36, 1.62, -6.2), M['noren'])

# Kamidana up in the corner, and the radio on its shelf.
cube('Kamidana shelf', (.9, .04, .3), (-5.6, 3.15, -6.13), M['honey'])
cube('Kamidana shrine', (.34, .28, .16), (-5.6, 3.31, -6.14), M['honey'])
cube('Kamidana roof', (.44, .05, .24), (-5.6, 3.47, -6.12), M['smoke'])
for dx in (-.32, .32):
    cyl('Sakaki vase', .025, .08, (-5.6 + dx, 3.21, -6.1), M['porcelain'], 8)
    ball('Sakaki', (.05, .09, .04), (-5.6 + dx, 3.32, -6.1), M['sakaki'], 8, 5)
cyl('Shimenawa', .015, .95, (-5.6, 3.55, -6.05), M['straw'], 6, axis='x')
cube('Radio shelf', (1.1, .04, .42), (4.5, 1.88, -6.07), M['honey'])
cube('Radio cabinet', (1.0, .56, .38), (4.5, 2.18, -6.04), M['honey'], bevel=.03)
cube('Radio cloth', (.55, .36, .01), (4.35, 2.18, -5.845), M['straw'])
for dx in (.28, .4): cyl('Radio dial', .035, .03, (4.5 + dx, 2.18, -5.84), M['cream'], 12, axis='z')

# Beer crates of empties and the drinks fridge behind the counter's west end.
def crate(x, y, z, m):
    cube('Beer crate', (.46, .3, .34), (x, y + .15, z), m, bevel=.015)
    for i in range(4):
        for j in range(3): cyl('Bottle top', .028, .06, (x - .165 + i * .11, y + .31, z - .1 + j * .1), M['brown'], 8)
crate(-5.7, 0, -4.7, M['crateY']); crate(-5.7, .3, -4.7, M['crateY']); crate(-5.7, 0, -4.3, M['crateR'])
cube('Drinks fridge', (.78, 1.85, .62), (-5.75, .925, -5.85), M['steel'], bevel=.02)
cube('Fridge handle', (.03, .5, .03), (-5.42, 1.15, -5.52), M['darksteel'])

# --------------------------------------------------------------------------- stools
for sx in STOOLS:
    z = -1.42
    cyl('Stool cushion', .19, .07, (sx, .675, z), M['vinyl'], 16)
    cyl('Stool seat', .2, .03, (sx, .625, z), M['smoke'], 16)
    for dx, dz in ((-.12, -.12), (-.12, .12), (.12, -.12), (.12, .12)):
        cube('Stool leg', (.035, .61, .035), (sx + dx, .305, z + dz), M['smoke'])
    for dx, dz, w, d in ((0, -.12, .24, .02), (0, .12, .24, .02), (-.12, 0, .02, .24), (.12, 0, .02, .24)):
        cube('Stool rung', (w, .02, d), (sx + dx, .22, z + dz), M['smoke'])

# --------------------------------------------------------------------------- tables
for tx, tz in ((-3.5, 2.2), (2.6, 2.0)):
    cube('Table top', (2.5, .06, 1.35), (tx, .915, tz), M['table'], bevel=.02)
    cube('Table apron', (2.3, .08, 1.15), (tx, .85, tz), M['smoke'])
    for dx in (-1.1, 1.1):
        for dz in (-.55, .55): cube('Table leg', (.08, .82, .08), (tx + dx, .41, tz + dz), M['smoke'])
    for dz in (-1.08, 1.08):
        cube('Bench cushion', (2.5, .06, .42), (tx, .53, tz + dz), M['vinyl'], bevel=.02)
        cube('Bench board', (2.5, .04, .42), (tx, .48, tz + dz), M['smoke'])
        for dx in (-1.1, 1.1): cube('Bench support', (.08, .46, .36), (tx + dx, .23, tz + dz), M['smoke'])
    # What is on the table between friends.
    cube('Condiment tray', (.3, .02, .14), (tx, .955, tz), M['honey'])
    cyl('Soy cruet', .026, .09, (tx - .06, 1.01, tz), M['porcelain'], 10)
    cyl('Shichimi tin', .018, .07, (tx + .05, 1.0, tz), M['brown'], 10)
    cyl('Glass ashtray', .06, .025, (tx + .55, .96, tz + .3), M['clear'], 12)
    cube('Menu stand', (.14, .2, .02), (tx - .4, 1.045, tz - .05), M['label'])
    cyl('Big beer bottle', .038, .23, (tx - .7, 1.06, tz - .25), M['brown'], 10)
    cyl('Big beer neck', .016, .09, (tx - .7, 1.22, tz - .25), M['brown'], 8)
    cube('Beer label', (.05, .07, .004), (tx - .7, 1.07, tz - .21), M['label'])
    for dx, dz in ((-.95, .15), (-.35, -.35)):
        cyl('Beer in glass', .033, .11, (tx + dx, 1.0, tz + dz), M['beer'], 10)
        cyl('Beer head', .034, .02, (tx + dx, 1.065, tz + dz), M['foam'], 10)
    cyl('Edamame bowl', .08, .045, (tx + .35, .968, tz - .25), M['blue'], 12)
    for k in range(7): cube('Edamame pod', (.05, .015, .02), (tx + .35 + math.cos(k) * .04, .995, tz - .25 + math.sin(k) * .04), M['edamame'], rot=k)
    cube('Yakitori plate', (.3, .015, .11), (tx + .8, .955, tz - .3), M['blue'])
    for k in range(3):
        cube('Skewer', (.26, .01, .01), (tx + .8, .97, tz - .34 + k * .04), M['honey'])
        for j in range(4): cube('Yakitori', (.035, .028, .03), (tx + .72 + j * .05, .98, tz - .34 + k * .04), M['glaze'])

# --------------------------------------------------------------------------- koagari
KX, KZ, KL = 5.3, 1.8, 5.4     # centre x, centre z, length along the wall
cube('Koagari platform', (2.0, .38, KL), (KX, .19, KZ), M['wainscot'])
cube('Koagari edge beam', (.1, .09, KL), (4.33, .345, KZ), M['honey'], bevel=.015)
for row in range(3):
    for col, mx in enumerate((4.82, 5.78)):
        mz = KZ - KL / 2 + .9 + row * 1.8
        cube('Tatami', (.94, .03, 1.78), (mx, .395, mz), M['tatami'])
        for dx in (-.455, .455): cube('Tatami edge', (.03, .032, 1.78), (mx + dx, .397, mz), M['heri'])
for tz in (.5, 3.1):
    cube('Low table', (.75, .05, 1.2), (KX, .745, tz), M['table'], bevel=.015)
    for dx in (-.3, .3):
        for dz in (-.5, .5): cube('Low table leg', (.06, .3, .06), (KX + dx, .56, tz + dz), M['smoke'])
    for dx in (-.58, .58):
        for dz in (-.3, .3): cube('Zabuton', (.5, .07, .52), (KX + dx, .445, tz + dz), M['zabuton'], bevel=.025)
    cyl('Tokkuri', .035, .11, (KX - .1, .83, tz - .2), M['porcelain'], 10)
    cyl('Tokkuri neck', .014, .05, (KX - .1, .905, tz - .2), M['porcelain'], 8)
    for dz in (-.05, .1): cyl('Ochoko', .022, .03, (KX + .05, .785, tz + dz), M['blue'], 10)
    cube('Sashimi plate', (.3, .015, .18), (KX, .78, tz + .35), M['porcelain'])
    for k in range(5): cube('Sashimi', (.05, .02, .12), (KX - .1 + k * .05, .795, tz + .35), fish[k % 3], rot=.2)
    cyl('Glass ashtray', .06, .025, (KX + .2, .783, tz - .4), M['clear'], 12)
cube('Kutsunugi stone', (.55, .12, .4), (4.02, .06, 1.8), M['stone'], bevel=.04)
for dz, shade in ((1.62, M['lacquer']), (1.95, M['brown'])):
    for dx in (-.07, .07): cube('Left shoes', (.1, .07, .26), (4.02 + dx, .155, dz), shade, bevel=.02)

# --------------------------------------------------------------------------- the room's edges
# Sake barrels by the west wall, and crates of empties by the door.
for bz in (-.75, .05):
    cyl('Komodaru', .3, .56, (-5.88, .3, bz), M['straw'], 16)
    for y in (.1, .5): ring('Barrel rope', .305, .02, (-5.88, y, bz), M['rope'])
    cube('Barrel label', (.02, .26, .3), (-5.57, .32, bz), M['red'])
crate(-5.6, 0, 5.75, M['crateR']); crate(-5.6, .3, 5.75, M['crateR']); crate(-5.1, 0, 5.75, M['crateY'])
cyl('Umbrella stand', .13, .5, (-2.35, .25, 5.95), M['blue'], 14)
for k, tilt in enumerate((.12, -.1)):
    o = cyl('Umbrella', .03, .95, (-2.35 + tilt * .5, .6, 5.95 + k * .04), M['lacquer'], 8)
    o.rotation_euler.y = tilt
for k in range(4): cyl('Coat peg', .018, .09, (-6.22, 1.78, 4.8 + k * .35), M['honey'], 8, axis='x')

# --------------------------------------------------------------------------- lights
def akachochin(x, y, z):
    ball('Red paper lantern', (.2, .3, .2), (x, y, z), M['lantern'], 14, 8)
    for dy in (-.28, .28): cyl('Lantern cap', .11, .04, (x, y + dy, z), M['lacquer'], 12)
    for dy in (-.14, 0, .14): ring('Lantern rib', .2 * math.sqrt(1 - (dy / .31) ** 2), .006, (x, y + dy, z), M['lacquer'])
    cyl('Lantern cord', .008, 3.62 - (y + .3), (x, (3.62 + y + .3) / 2, z), M['lacquer'], 6)
for lx in (-4.0, -.8, 2.4): akachochin(lx, 2.9, -2.35)
def pendant(x, y, z):
    cone('Enamel shade', .24, .05, .16, (x, y, z), M['enamel'], 16)
    ball('Bulb', (.05, .06, .05), (x, y - .09, z), M['bulb'], 10, 6)
    cyl('Pendant cord', .007, 3.7 - y, (x, (3.7 + y) / 2, z), M['lacquer'], 6)
for px, py, pz in ((-3.5, 2.3, 2.2), (2.6, 2.3, 2.0), (KX, 2.15, .5), (KX, 2.15, 3.1)):
    pendant(px, py, pz)

cube('Entry mat', (2.1, .02, .9), (0, .05, 5.5), M['vinyl'])

# --------------------------------------------------------------------------- export
# The game allows the room ten draws. Every finish above keeps its colour, but as a
# vertex colour on one of a handful of shared surfaces -- matte, glossy, metal, glass,
# and the three that give light -- so the whole room is seven meshes.
def surface(name, rough, metal=0., vertex=True, glow=None, glow_strength=0., alpha=1.):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nodes = m.node_tree.nodes; bs = nodes['Principled BSDF']
    bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = metal
    if vertex:
        attr = nodes.new('ShaderNodeVertexColor'); attr.layer_name = 'Col'
        m.node_tree.links.new(attr.outputs['Color'], bs.inputs['Base Color'])
    if glow:
        bs.inputs['Base Color'].default_value = (*lin(glow), 1)
        bs.inputs['Emission Color'].default_value = (*lin(glow), 1); bs.inputs['Emission Strength'].default_value = glow_strength
    if alpha < 1:
        bs.inputs['Base Color'].default_value = (*lin('d8ecef'), 1); bs.inputs['Alpha'].default_value = alpha
        for attr_name, value in (('blend_method', 'BLEND'), ('surface_render_method', 'BLENDED')):
            try: setattr(m, attr_name, value)
            except Exception: pass
    return m
SURFACES = {
    'matte': surface('Minato matte', .78), 'gloss': surface('Minato glossy', .32),
    'metal': surface('Minato steel', .38, .7), 'glass': surface('Minato glass', .05, vertex=False, alpha=.22),
    'lantern': surface('Minato lantern paper', .7, vertex=False, glow='c8402e', glow_strength=.9),
    'warm': surface('Minato lamplight', .8, vertex=False, glow='f6e2b8', glow_strength=1.2),
    'ember': surface('Minato embers', .9, vertex=False, glow='ff6a1f', glow_strength=3.0),
}
def surface_for(m):
    if m == M['glass']: return 'glass'
    if m == M['lantern']: return 'lantern'
    if m in (M['shoji'], M['bulb']): return 'warm'
    if m == M['ember']: return 'ember'
    bs = m.node_tree.nodes['Principled BSDF']
    if bs.inputs['Metallic'].default_value > .3: return 'metal'
    return 'gloss' if bs.inputs['Roughness'].default_value < .5 else 'matte'

def merge_export(name):
    for o in [o for o in bpy.context.scene.objects if o.type == 'MESH']:
        m = o.data.materials[0]; colour = m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value
        layer = o.data.color_attributes.new(name='Col', type='BYTE_COLOR', domain='CORNER')
        for item in layer.data: item.color = (colour[0], colour[1], colour[2], 1)
        o.data.materials[0] = SURFACES[surface_for(m)]
    for key, m in SURFACES.items():
        chosen = [o for o in bpy.context.scene.objects if o.type == 'MESH' and o.data.materials[0] == m]
        if not chosen: continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in chosen: o.select_set(True)
        bpy.context.view_layer.objects.active = chosen[0]
        bpy.ops.object.join(); bpy.context.object.name = name + ' / ' + m.name
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(art / (name + '.blend')), compress=True)
    options = dict(filepath=str(out / (name + '.glb')), export_format='GLB', export_yup=True, export_animations=False, export_apply=True)
    try: bpy.ops.export_scene.gltf(**options, export_vertex_color='MATERIAL')
    except TypeError: bpy.ops.export_scene.gltf(**options)
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    return {'meshes': len(meshes), 'triangles': sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes),
            'bytes': (out / (name + '.glb')).stat().st_size}

report = merge_export('minato-interior')
path = art / 'export-report.json'
data = json.loads(path.read_text()) if path.exists() else {}
data['minato-interior'] = report
path.write_text(json.dumps(data, indent=2))
print('minato-interior', report)
