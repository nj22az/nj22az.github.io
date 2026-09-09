"""Build the town's five CC0 VRoid bases (Python, NumPy, Pillow).

python tools/pack-vroid.py --sources /path/to/original/vrms
Original VRMs are authoring inputs, never fetched by the running game. Their exact
hashes and the creator's licence pages are recorded in the generated manifest.
Geometry, humanoid bindings and three facial expressions survive conversion;
texture atlases collapse 60–131 source draws to four or five draws per resident.
"""
from pathlib import Path
from io import BytesIO
import argparse, copy, hashlib, json, math, struct
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/characters/vroid'
REV = 'e16eb187100149a315ad92c3c9968f1d5baa6c7d'
FAQ = 'https://vroid.pixiv.help/hc/en-us/articles/'
SOURCES = {
    'vroid-bob': ('Vivi', 'eaf902e041a7a810f1423599ae75682f61184ab6ef0206da9a8ed9caa8ec3a9d', '360014900273'),
    'vroid-casual': ('HairSample_Male', '7aeca142dabbc26ba0f5b9c998c8f3cb6df341287d67788427ac837223785a3f', '4402614652569'),
    'vroid-vest': ('Sakurada_Fumiriya', 'd8fb05f33e377df028cb6b9d58c441ce68326c41fa23f6c735d40c65ae3dc710', '360014788554'),
    'vroid-ponytail': ('Victoria_Rubin', 'b1372131bdbf233f46320146d565f342a7e4f6f4b8f2aefb301f1a283ec07e1e', '360014900233'),
    'vroid-long': ('Sendagaya_Shino', '1e177c1a7b14f783a9c48395831db8616260d3bddd4154cb2784b779adca49b5', '360013482714'),
}
DTYPES = {5120: np.dtype('i1'), 5121: np.dtype('u1'), 5122: np.dtype('<i2'),
          5123: np.dtype('<u2'), 5125: np.dtype('<u4'), 5126: np.dtype('<f4')}
COLS = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def matrix(q):
    x, y, z, w = q
    return np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
                     [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
                     [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]], dtype=float)


def quaternion(m):
    # Eigenvector method handles the 180-degree rotations of a T-pose reliably.
    q = np.array([m[0, 0]-m[1, 1]-m[2, 2], m[1, 1]-m[0, 0]-m[2, 2],
                  m[2, 2]-m[0, 0]-m[1, 1], m.trace()])
    k = np.diag(q)
    for a, b, value in [(0, 1, m[0, 1]+m[1, 0]), (0, 2, m[0, 2]+m[2, 0]),
                        (1, 2, m[1, 2]+m[2, 1]), (0, 3, m[2, 1]-m[1, 2]),
                        (1, 3, m[0, 2]-m[2, 0]), (2, 3, m[1, 0]-m[0, 1])]:
        k[a, b] = k[b, a] = value
    q = np.linalg.eigh(k)[1][:, -1]
    return q if q[3] >= 0 else -q


def rotation_between(a, b):
    a = a / np.linalg.norm(a); b = b / np.linalg.norm(b)
    dot = np.clip(np.dot(a, b), -1, 1)
    if dot < -.99999:
        axis = np.cross(a, [0, 1, 0] if abs(a[1]) < .9 else [1, 0, 0])
        return matrix([*(axis / np.linalg.norm(axis)), 0])
    q = np.r_[np.cross(a, b), 1+dot]
    return matrix(q / np.linalg.norm(q))


class Asset:
    def __init__(self, path):
        self.raw = path.read_bytes()
        length = struct.unpack_from('<I', self.raw, 12)[0]
        self.d = json.loads(self.raw[20:20+length]); self.bin = self.raw[28+length:]

    def array(self, index):
        a = self.d['accessors'][index]
        if 'bufferView' not in a:
            data = np.zeros((a['count'], COLS[a['type']]), dtype=DTYPES[a['componentType']])
        else:
            v = self.d['bufferViews'][a['bufferView']]; dtype = DTYPES[a['componentType']]
            data = np.ndarray((a['count'], COLS[a['type']]), dtype=dtype, buffer=self.bin,
                offset=v.get('byteOffset', 0)+a.get('byteOffset', 0),
                strides=(v.get('byteStride', dtype.itemsize*COLS[a['type']]), dtype.itemsize)).copy()
        if 'sparse' in a:
            s = a['sparse']; iv = self.d['bufferViews'][s['indices']['bufferView']]
            vv = self.d['bufferViews'][s['values']['bufferView']]
            ids = np.frombuffer(self.bin, dtype=DTYPES[s['indices']['componentType']], count=s['count'],
                offset=iv.get('byteOffset', 0)+s['indices'].get('byteOffset', 0))
            values = np.frombuffer(self.bin, dtype=DTYPES[a['componentType']], count=s['count']*COLS[a['type']],
                offset=vv.get('byteOffset', 0)+s['values'].get('byteOffset', 0)).reshape(-1, COLS[a['type']])
            data[ids] = values
        return data

    def texture(self, material, category):
        m = self.d['materials'][material]; pbr = m['pbrMetallicRoughness']
        image = self.d['images'][self.d['textures'][pbr['baseColorTexture']['index']]['source']]
        view = self.d['bufferViews'][image['bufferView']]
        im = Image.open(BytesIO(self.bin[view.get('byteOffset', 0):view.get('byteOffset', 0)+view['byteLength']])).convert('RGBA')
        limit = 504 if category in ['wardrobe', 'body'] or '_Face_00_SKIN' in m['name'] else 248
        im.thumbnail((limit, limit), Image.Resampling.LANCZOS)
        pixels = np.asarray(im).astype(float)/255
        rgb = pixels[:, :, :3]
        if category in ['hair', 'wardrobe']:
            # A neutral albedo lets instances keep distinct, restrained palettes.
            gray = rgb @ np.array([.2126, .7152, .0722])
            rgb = np.repeat(gray[:, :, None], 3, axis=2)
            rgb = (.38 + .62*rgb) if category == 'hair' else (.22 + .78*rgb)
        else:
            factor = np.array(pbr.get('baseColorFactor', [1, 1, 1, 1]))[:3]
            linear = np.where(rgb <= .04045, rgb/12.92, ((rgb+.055)/1.055)**2.4)*factor
            rgb = np.where(linear <= .0031308, linear*12.92, 1.055*np.maximum(linear, 0)**(1/2.4)-.055)
        pixels[:, :, :3] = rgb
        if m.get('alphaMode', 'OPAQUE') == 'OPAQUE': pixels[:, :, 3] = 1
        return Image.fromarray(np.rint(np.clip(pixels, 0, 1)*255).astype('uint8'))


class Writer:
    def __init__(self): self.binary = bytearray(); self.views = []; self.accessors = []; self.cache = {}

    def add(self, data, kind='VEC3', component=5126, bounds=False):
        data = np.ascontiguousarray(data, dtype=DTYPES[component]).reshape(-1, COLS[kind]); raw = data.tobytes()
        key = (component, kind, hashlib.sha256(raw).hexdigest())
        if key in self.cache: return self.cache[key]
        self.binary.extend(b'\0'*(-len(self.binary) % 4)); start = len(self.binary); self.binary.extend(raw)
        self.views.append({'buffer': 0, 'byteOffset': start, 'byteLength': len(raw)})
        a = {'bufferView': len(self.views)-1, 'componentType': component, 'count': len(data), 'type': kind}
        if bounds: a.update(min=data.min(axis=0).tolist(), max=data.max(axis=0).tolist())
        result = len(self.accessors); self.accessors.append(a); self.cache[key] = result
        return result

    def save(self, d, path):
        d['accessors'] = self.accessors; d['bufferViews'] = self.views; d['buffers'] = [{'byteLength': len(self.binary)}]
        header = json.dumps(d, separators=(',', ':')).encode(); header += b' '*(-len(header) % 4)
        self.binary.extend(b'\0'*(-len(self.binary) % 4))
        raw = struct.pack('<III', 0x46546c67, 2, 28+len(header)+len(self.binary))
        raw += struct.pack('<II', len(header), 0x4e4f534a)+header+struct.pack('<II', len(self.binary), 0x004e4942)+self.binary
        path.write_bytes(raw)
        return {'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()}


def atlas(asset, ids, category, base):
    tiles = [(i, asset.texture(i, category)) for i in ids]
    tiles.sort(key=lambda x: (-x[1].height, -x[1].width, x[0]))
    # Shelf pack with duplicated four-pixel borders to avoid dark mip seams.
    for size in [512, 1024, 2048]:
        x = y = row = 0; locations = {}; ok = True
        for i, im in tiles:
            w, h = im.width+8, im.height+8
            if x+w > size: x = 0; y += row; row = 0
            if y+h > size or w > size: ok = False; break
            locations[i] = (x+4, y+4, im.width, im.height)
            x += w; row = max(row, h)
        if ok: break
    if not ok: raise ValueError('Atlas exceeds budget')
    canvas = Image.new('RGBA', (size, size))
    for i, im in tiles:
        x, y, w, h = locations[i]
        padded = np.pad(np.asarray(im), ((4, 4), (4, 4), (0, 0)), mode='edge')
        canvas.paste(Image.fromarray(padded), (x-4, y-4))
    stream = BytesIO(); canvas.save(stream, format='PNG', optimize=True); raw = stream.getvalue()
    filename = base+'-'+category+'.png'; (OUT/'textures'/filename).write_bytes(raw)
    receipt = {'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest(), 'dimensions': [size, size]}
    return locations, size, filename, receipt


def animate(asset, writer, d):
    nodes = copy.deepcopy(asset.d['nodes']); count = len(nodes)
    parents = [-1]*count
    for i, n in enumerate(nodes):
        for child in n.get('children', []): parents[child] = i
    order = []
    def visit(i):
        order.append(i)
        for c in nodes[i].get('children', []): visit(c)
    for i in range(count):
        if parents[i] < 0: visit(i)
    rest_t = np.array([n.get('translation', [0, 0, 0]) for n in nodes], dtype=float)
    rest_r = np.array([matrix(n.get('rotation', [0, 0, 0, 1])) for n in nodes])
    scales = np.array([n.get('scale', [1, 1, 1]) for n in nodes]); translations = rest_t.copy(); rotations = rest_r.copy()
    world = np.zeros((count, 4, 4))
    def update():
        for i in order:
            m = np.eye(4); m[:3, :3] = rotations[i]*scales[i]; m[:3, 3] = translations[i]
            world[i] = world[parents[i]] @ m if parents[i] >= 0 else m
    update(); rest_world = world.copy()
    bones = {h['bone']: h['node'] for h in asset.d['extensions']['VRM']['humanoid']['humanBones']}
    hips = bones['hips']; height = max(asset.array(p['attributes']['POSITION'])[:, 1].max() for m in asset.d['meshes'] for p in m['primitives'])
    factor = float(height)/1.7
    skirt_nodes = [i for i, n in enumerate(nodes) if n.get('name', '').endswith(('SkirtFront0', 'SkirtBack0', 'SkirtSide0', 'SkirtFront', 'SkirtBack', 'SkirtSide'))]
    skirt_hems = [i for i, n in enumerate(nodes) if n.get('name', '').endswith('SkirtFront2')]
    translated = {hips, *skirt_nodes}
    used = {hips, bones['head'], *skirt_nodes, *skirt_hems}
    def aim(name, child, direction):
        i, c = bones[name], bones[child]
        desired = rotation_between(rest_world[c, :3, 3]-rest_world[i, :3, 3], np.array(direction)) @ rest_world[i, :3, :3]
        rotations[i] = np.linalg.inv(world[parents[i], :3, :3]) @ desired
        used.add(i); update()
    def leg(side, forward, lift):
        upper, lower, foot = [bones[side+k] for k in ['UpperLeg', 'LowerLeg', 'Foot']]
        hip = world[upper, :3, 3].copy(); target = rest_world[foot, :3, 3]+[0, lift, forward]
        v = target-hip; distance = np.linalg.norm(v); direction = v/distance
        l1 = np.linalg.norm(rest_world[lower, :3, 3]-rest_world[upper, :3, 3]); l2 = np.linalg.norm(rest_world[foot, :3, 3]-rest_world[lower, :3, 3])
        distance = min(distance, l1+l2-.0005)
        along = (l1*l1-l2*l2+distance*distance)/(2*distance)
        bend = np.array([0, 0, -1.]); bend -= direction*np.dot(bend, direction); bend /= np.linalg.norm(bend)
        knee = hip+direction*along+bend*math.sqrt(max(0, l1*l1-along*along))
        aim(side+'UpperLeg', side+'LowerLeg', knee-hip)
        aim(side+'LowerLeg', side+'Foot', target-world[lower, :3, 3])
        rotations[foot] = np.linalg.inv(world[parents[foot], :3, :3]) @ rest_world[foot, :3, :3]; used.add(foot); update()
    # Evaluate the actual bound sole vertices, including masked body geometry,
    # to keep both the rendered shoes and the engine's bounds on the floor.
    soles = []
    for n in asset.d['nodes']:
        if 'mesh' not in n or 'skin' not in n: continue
        skin = asset.d['skins'][n['skin']]; inv = asset.array(skin['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1)
        seen = set()
        for p in asset.d['meshes'][n['mesh']]['primitives']:
            key = p['attributes']['POSITION']
            if key in seen: continue
            seen.add(key); a = p['attributes']; pos = asset.array(key); selected = pos[:, 1] < .2*factor
            if not selected.any(): continue
            joints = asset.array(a['JOINTS_0'])[selected]; weights = asset.array(a['WEIGHTS_0'])[selected]
            soles.append((np.c_[pos[selected], np.ones(selected.sum())], np.array(skin['joints'])[joints], weights, inv[joints]))
    def floor():
        minimum = 1e9
        for pos, joints, weights, inv in soles:
            m = world[joints] @ inv
            p = np.einsum('vkij,vj->vki', m, pos)
            minimum = min(minimum, (p[:, :, 1]*weights).sum(axis=1).min())
        return minimum
    clips = [('Idle_Neutral', 4., 24), ('Walk', 1., 32), ('Run', .75, 32), ('Wave', 2., 48), ('Sit', 4., 24), ('Eat', 4., 32), ('Drink', 4., 32)]
    for clip, duration, frames in clips:
        samples = []; seated = clip in ['Sit', 'Eat', 'Drink']; moving = clip in ['Walk', 'Run']
        for frame in range(frames+1):
            t = frame/frames; phase = t*math.tau; translations[:] = rest_t; rotations[:] = rest_r
            translations[hips, 1] -= (.38 if seated else .035 if moving else .01)*factor
            if moving: translations[hips, 1] += .006*math.cos(phase*2)*factor
            update()
            for side, offset, sign in [('left', 0, -1), ('right', .5, 1)]:
                u = (t+offset) % 1; forward, lift = (-.30*factor, .003) if seated else (0, .003)
                stride = (.48 if clip == 'Walk' else .72)*factor
                if moving:
                    if u < .6: forward = -stride/2+stride*u/.6
                    else:
                        swing = (u-.6)/.4
                        forward = stride/2-stride*swing*swing*(3-2*swing)
                        lift += (.07 if clip == 'Walk' else .11)*factor*math.sin(math.pi*swing)
                leg(side, forward, lift)
                swing = math.sin(phase+offset*math.tau)*(.20 if clip == 'Walk' else .30 if clip == 'Run' else .01)
                aim(side+'UpperArm', side+'LowerArm', [sign*.17, -1, swing-.03 if not seated else -.32])
                aim(side+'LowerArm', side+'Hand', [sign*.035, -1, swing-.12 if not seated else -.6])
                # Keep the palm aligned with the forearm, with a relaxed wrist.
                hand = bones[side+'Hand']; rotations[hand] = rest_r[hand]; used.add(hand)
            if clip == 'Wave':
                e = math.sin(math.pi*t)**2
                aim('rightUpperArm', 'rightLowerArm', [.17+.4*e, -1+.8*e, -.04-.2*e])
                aim('rightLowerArm', 'rightHand', [.035+math.sin(phase*2)*.10*e, -1+2.3*e, -.12-.35*e])
            if clip in ['Eat', 'Drink']:
                e = .5-.5*math.cos(phase)
                aim('rightUpperArm', 'rightLowerArm', [.15, -.65, -.4])
                aim('rightLowerArm', 'rightHand', [-.22, -.3+.95*e, -.42])
            # VRoid's front skirt roots inherit the thigh's rotation. In a
            # seated pose that rolls their waist attachment upwards and opens
            # the lap. Keep those attachments at the waist, then fold the cloth
            # forward over the thighs; rear panels hang behind the stool.
            hip_delta = world[hips, :3, 3]-rest_world[hips, :3, 3]
            for i in skirt_nodes:
                name = nodes[i]['name']; front = 'Front' in name; side = 'Side' in name
                if seated:
                    target = rest_world[i, :3, 3]+hip_delta+[0, .075*factor if front else 0, 0]
                    if front: target[1] = max(target[1], world[hips, 1, 3]+.10*factor)
                    translations[i] = (np.linalg.inv(world[parents[i]]) @ np.r_[target, 1])[:3]
                    angle = (1.4 if skirt_hems else .9) if front else .2 if side else 0
                    desired = matrix([math.sin(angle/2), 0, 0, math.cos(angle/2)])
                    rotations[i] = np.linalg.inv(world[parents[i], :3, :3]) @ desired
                elif side:
                    angle = .02*math.sin(phase)
                    rotations[i] = matrix([math.sin(angle/2), 0, 0, math.cos(angle/2)])
                update()
            if seated:
                for i in skirt_hems:
                    # A second cloth segment drops the hem over the knee,
                    # rather than leaving a rigid horizontal panel on the lap.
                    rotations[i] = np.linalg.inv(world[parents[i], :3, :3]); update()
            angle = math.sin(phase)*.012
            rotations[bones['head']] = matrix([math.sin(angle/2), 0, 0, math.cos(angle/2)])
            update(); translations[hips, 1] -= floor(); update()
            samples.append((translations.copy(), rotations.copy()))
        animation = {'name': clip, 'samplers': [], 'channels': []}
        times = np.linspace(0, duration, frames+1)
        for node in sorted(used):
            for path in ['rotation', 'translation'] if node in translated else ['rotation']:
                values = np.array([quaternion(s[1][node]) if path == 'rotation' else s[0][node] for s in samples])
                if path == 'rotation':
                    for i in range(1, len(values)):
                        if np.dot(values[i-1], values[i]) < 0: values[i] *= -1
                constant = np.all(np.abs(values-values[0]) < 1e-6); take = [0, -1] if constant else np.arange(len(times))
                si = len(animation['samplers'])
                animation['samplers'].append({'input': writer.add(times[take], 'SCALAR', bounds=True), 'output': writer.add(values[take], 'VEC4' if path == 'rotation' else 'VEC3'), 'interpolation': 'LINEAR'})
                animation['channels'].append({'sampler': si, 'target': {'node': node, 'path': path}})
        d.setdefault('animations', []).append(animation)
    iris = []
    for p in asset.d['meshes'][0]['primitives']:
        if 'EyeIris' in asset.d['materials'][p['material']]['name']:
            iris.append(asset.array(p['attributes']['POSITION'])[np.unique(asset.array(p['indices']))])
    iris = np.concatenate(iris); head_inverse = np.linalg.inv(rest_world[bones['head']])
    anchors = []
    for sign in [-1, 1]:
        centre = iris[iris[:, 0]*sign > 0].mean(axis=0)
        anchors.append((head_inverse @ np.r_[centre, 1])[:3].tolist())
    return {'walkSpeed': .48*factor/.6, 'runSpeed': .72*factor/.6/.75, 'eyeCentres': anchors}


def build(base, source_dir):
    source, expected, licence = SOURCES[base]; path = source_dir/(source+'.vrm'); asset = Asset(path)
    digest = hashlib.sha256(asset.raw).hexdigest()
    if expected and digest != expected: raise ValueError('Source receipt differs: '+source)
    if asset.d['extensions']['VRM']['meta']['licenseName'] != 'CC0': raise ValueError('Expected an explicitly CC0 VRoid sample')
    d = {k: copy.deepcopy(asset.d[k]) for k in ['nodes', 'scenes', 'scene', 'skins']}
    d.update(asset={'version': '2.0', 'generator': 'Johansson Town VRoid packer'}, meshes=[], materials=[], images=[], textures=[], samplers=[{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 33071, 'wrapT': 33071}], extensionsUsed=['KHR_materials_unlit'])
    # Preserve geometry and rig data; discard VRM spring/first-person metadata,
    # authoring thumbnails, unused textures and unsupported MToon shader fields.
    for n in d['nodes']: n.pop('extensions', None)
    writer = Writer(); textures = {}; material_ids = {}; layouts = {}
    female = base in ['vroid-bob', 'vroid-ponytail', 'vroid-long']
    hips_node = next(h['node'] for h in asset.d['extensions']['VRM']['humanoid']['humanBones'] if h['bone'] == 'hips')
    hip_y = asset.d['nodes'][hips_node]['translation'][1]
    def category(m, mesh):
        name = asset.d['materials'][m]['name']
        return 'face' if mesh == 0 else 'hair' if 'HAIR' in name else 'wardrobe' if ('Tops' in name or 'Bottoms' in name) else 'body'
    categories = {}
    for mi, mesh in enumerate(asset.d['meshes']):
        for p in mesh['primitives']: categories.setdefault(category(p['material'], mi), set()).add(p['material'])
    for cat, ids in categories.items():
        locations, size, filename, receipt = atlas(asset, sorted(ids), cat, base); layouts[cat] = (locations, size)
        textures[filename] = receipt; ti = len(d['textures']); d['textures'].append({'source': ti, 'sampler': 0}); d['images'].append({'uri': 'textures/'+filename})
        material_ids[cat] = len(d['materials'])
        d['materials'].append({'name': 'VRoid '+cat, 'pbrMetallicRoughness': {'baseColorTexture': {'index': ti}, 'metallicFactor': 0, 'roughnessFactor': 1}, 'alphaMode': 'MASK', 'alphaCutoff': .18, 'doubleSided': True, 'extensions': {'KHR_materials_unlit': {}}, 'extras': {'townPalette': cat}})
    groups = asset.d['extensions']['VRM']['blendShapeMaster']['blendShapeGroups']
    morphs = [(label, next(g for g in groups if g['presetName'] == preset)['binds'][0]) for label, preset in [('Blink', 'blink'), ('Smile', 'fun'), ('MouthOpen', 'a')]]
    triangles = 0
    for mi, mesh in enumerate(asset.d['meshes']):
        result = {'name': ['Face', 'Body', 'Hair'][mi], 'primitives': []}
        if mi == 0: result.update(weights=[0, 0, 0], extras={'targetNames': [x[0] for x in morphs]})
        by_category = {}
        for p in mesh['primitives']: by_category.setdefault(category(p['material'], mi), []).append(p)
        for cat, primitives in by_category.items():
            attributes = {k: [] for k in ['POSITION', 'NORMAL', 'TEXCOORD_0', 'JOINTS_0', 'WEIGHTS_0']}; targets = [[], [], []]; indices = []; offset = 0
            shorts_colours = []
            # Merge source strips sharing a material before copying attributes.
            by_material = {}
            for p in primitives: by_material.setdefault(p['material'], []).append(p)
            for mat, parts in by_material.items():
                p = parts[0]
                # VRoid exports shared attribute streams for each mesh.
                if any(x['attributes'] != p['attributes'] for x in parts): raise ValueError('Unexpected VRoid attribute layout')
                old_indices = np.concatenate([asset.array(x['indices']).ravel() for x in parts]); unique, remap = np.unique(old_indices, return_inverse=True)
                arrays = {k: asset.array(p['attributes'][k])[unique] for k in attributes}
                uv = arrays['TEXCOORD_0'].copy(); locations, size = layouts[cat]; x, y, w, h = locations[mat]
                # Preserve VRoid's exported glTF texture orientation.
                uv[:, 0] = (x+np.clip(uv[:, 0], 0, 1)*w)/size; uv[:, 1] = (y+np.clip(uv[:, 1], 0, 1)*h)/size
                arrays['TEXCOORD_0'] = uv
                weights = arrays['WEIGHTS_0']; weights /= np.maximum(weights.sum(axis=1, keepdims=True), 1e-8)
                for k in attributes: attributes[k].append(arrays[k])
                if female and cat == 'body':
                    colours = np.ones_like(arrays['POSITION'])
                    if '_SKIN' in asset.d['materials'][mat]['name']:
                        y = arrays['POSITION'][:, 1]
                        covered = (y > hip_y-.21) & (y < hip_y+.04)
                        colours[covered] = [.09, .085, .10]
                    shorts_colours.append(colours)
                if mi == 0:
                    for j, (_, bind) in enumerate(morphs): targets[j].append(asset.array(p['targets'][bind['index']]['POSITION'])[unique])
                indices.append(remap+offset); offset += len(unique)
            attributes = {k: np.concatenate(v) for k, v in attributes.items()}
            if shorts_colours: attributes['COLOR_0'] = np.concatenate(shorts_colours)
            out = {'attributes': {k: writer.add(v, 'VEC2' if k == 'TEXCOORD_0' else 'VEC4' if k in ['JOINTS_0', 'WEIGHTS_0'] else 'VEC3', 5123 if k == 'JOINTS_0' else 5126, k == 'POSITION') for k, v in attributes.items()}, 'indices': writer.add(np.concatenate(indices), 'SCALAR', 5123 if offset < 65536 else 5125), 'material': material_ids[cat]}
            if mi == 0: out['targets'] = [{'POSITION': writer.add(np.concatenate(v), bounds=True)} for v in targets]
            triangles += sum(len(v) for v in indices)//3; result['primitives'].append(out)
        d['meshes'].append(result)
    for skin in d['skins']: skin['inverseBindMatrices'] = writer.add(asset.array(skin['inverseBindMatrices']), 'MAT4')
    motion = animate(asset, writer, d)
    # Game actors face local -Z after their model wrapper's 180-degree turn.
    # Standardise VRoid 0.x's -Z source to +Z here, without altering bind poses.
    roots = d['scenes'][d['scene']]['nodes']; facing = len(d['nodes']); d['nodes'].append({'name': 'TownFacing', 'rotation': [0, 1, 0, 0], 'children': roots}); d['scenes'][d['scene']]['nodes'] = [facing]
    d['extras'] = {'source': source, 'license': 'CC0-1.0', 'expressions': ['Blink', 'Smile', 'MouthOpen'], **motion}
    receipt = writer.save(d, OUT/(base+'.glb'))
    return {'base': base, 'source': source, 'sourceSHA256': digest, 'sourceURL': 'https://raw.githubusercontent.com/madjin/vrm-samples/'+REV+'/vroid/beta/'+source+'.vrm', 'creatorLicense': FAQ+licence, 'triangles': triangles, 'draws': sum(len(m['primitives']) for m in d['meshes']), **receipt, **motion}, textures


def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--sources', type=Path, required=True); parser.add_argument('--base', choices=SOURCES)
    args = parser.parse_args(); (OUT/'textures').mkdir(parents=True, exist_ok=True)
    manifest = {'creator': 'pixiv Inc. / VRoid Project', 'license': 'CC0-1.0', 'mirrorRevision': REV, 'bases': [], 'textures': {}, 'changes': ['Four or five local texture-atlas draws per base', 'Shared geometry across the 21 named residents', 'Per-resident wardrobe and hair palettes', 'Dark fitted shorts beneath skirts and seated cloth fitting', 'Blink, smile and mouth morph targets', 'Seven original, grounded humanoid animation clips', 'VRoid 0.x facing converted to the town convention']}
    for base in [args.base] if args.base else SOURCES:
        receipt, textures = build(base, args.sources); manifest['bases'].append(receipt); manifest['textures'].update(textures)
        print(base, receipt['bytes'], receipt['triangles'], receipt['draws'], flush=True)
    manifest['modelBytes'] = sum(x['bytes'] for x in manifest['bases']); manifest['textureBytes'] = sum(x['bytes'] for x in manifest['textures'].values())
    (OUT/'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
    print('TOTAL', manifest['modelBytes'], manifest['textureBytes'], flush=True)


if __name__ == '__main__': main()
