/**
 * The ferry viewer: the Chisum, turned, taken apart deck by deck, cut open, and walked through on foot.
 *
 * She is the 68 m ship of her general arrangement (blender/ga.py), built in Blender (blender/): her hull, every deck and
 * every room's walls in bare steel, her navigation bridge and what else is fitted so far. Everything in the file is her
 * own. blender/assemble.py puts it into data/ferry.bin.gz beside her sheet of pictures (data/chisum-atlas.webp) and her
 * register (data/systems.json); this page only reads and shows them.
 * The file format (JMF1), and what this page changes in the look of what it reads, are described in README.md.
 *
 * The look is this page's own: daylight, one sun with shadows, a sky to reflect. The game's cartoon look does not bind it.
 */
import * as THREE from 'three';
import { OrbitControls } from '/motor-90l/vendor/OrbitControls.js';
import { createSystems } from './systems.js';
import { surface as surfaceOf, createLook, createSky, createSea, light, day } from './look.js';

const $ = (s, el = document) => el.querySelector(s);
const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };
const view = $('#view'), statusLine = $('#status'), panel = $('#panel'), toggle = $('#panel-toggle'), bar = $('#bar'), readout = $('#what'), card = $('#card');
/** Her systems (systems.js): the component register, shown in the panel's second list and on the model. Null until read. */
let systems = null;
const narrow = matchMedia('(max-width: 900px)');
const still = matchMedia('(prefers-reduced-motion: reduce)');

/** What can be shown. One document today; a second (the main engine, part by part) is planned. */
const DOCS = [{ id: 'ship', name: 'Ship', file: './data/ferry.bin.gz' }];
/** The order the decks are listed in: as she stands, top to bottom. */
const TOP_DOWN = ['top', 'bridge', 'passenger', 'car', 'machinery', 'hull'];

// ---------- reading the file ----------
/** One of her files, unpacked: four letters that say what it is, the length of a header, the header, then its block. */
async function fetchPacked(url, magic) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`The ferry's file could not be fetched (${res.status}).`);
  let bytes = new Uint8Array(await res.arrayBuffer());
  // The file is kept gzipped. A server may already have unpacked it on the way, so look before unpacking.
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    if (typeof DecompressionStream !== 'function') throw new Error('This browser cannot unpack the ferry (it has no DecompressionStream). A current Safari, Chrome, Edge or Firefox can.');
    bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  }
  if (String.fromCharCode(...bytes.subarray(0, 4)) !== magic) throw new Error("The ferry's file is not in the format this page reads.");
  const length = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true);
  const header = JSON.parse(new TextDecoder().decode(bytes.subarray(8, 8 + length)));
  return { bytes, header, length };
}
async function loadDocument(url) {
  const { bytes, header, length } = await fetchPacked(url, 'JMF1');
  // Typed views need their start aligned; copy once if the browser handed back an offset buffer.
  const buffer = bytes.byteOffset % 4 === 0 ? bytes.buffer : bytes.slice().buffer;
  return { header, buffer, base: (bytes.byteOffset % 4 === 0 ? bytes.byteOffset : 0) + 8 + length };
}

/** sRGB byte → linear float: the file keeps colours as they look, the renderer works in linear light. */
const LINEAR = Float32Array.from({ length: 256 }, (_, i) => { const c = i / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });

function geometryOf(rec, doc) {
  const { buffer, base, header: { bounds } } = doc, n = rec.vertices;
  const q = new Uint16Array(buffer, base + rec.pos, n * 3), pos = new Float32Array(n * 3);
  for (let a = 0; a < 3; a++) { const lo = bounds.min[a], k = (bounds.max[a] - lo) / 65535; for (let i = a; i < pos.length; i += 3) pos[i] = lo + q[i] * k; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(new Int8Array(buffer, base + rec.nor, n * 3), 3, true));
  const c8 = new Uint8Array(buffer, base + rec.col, n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < col.length; i++) col[i] = LINEAR[c8[i]];
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  if (rec.uv !== undefined) g.setAttribute('uv', new THREE.BufferAttribute(new Uint16Array(buffer, base + rec.uv, n * 2), 2, true));
  g.setIndex(new THREE.BufferAttribute(rec.wide ? new Uint32Array(buffer, base + rec.idx, rec.triangles * 3) : new Uint16Array(buffer, base + rec.idx, rec.triangles * 3), 1));
  g.computeBoundingBox(); g.computeBoundingSphere();
  return g;
}

function materialOf(m, atlases) {
  const common = {
    vertexColors: true, side: m.side === 'double' ? THREE.DoubleSide : THREE.FrontSide,
    transparent: m.transparent, opacity: m.opacity, depthWrite: m.depthWrite, alphaTest: m.alphaTest, map: m.textured ? atlases[m.atlas || 0] : null,
  };
  // Plates, dials and markings lie on a surface: the game draws them a hair in front of it, and so does this page.
  if (m.offset) Object.assign(common, { polygonOffset: true, polygonOffsetFactor: m.offset[0], polygonOffsetUnits: m.offset[1] });
  const lit = more => new THREE.MeshStandardMaterial({ ...common, metalness: m.metalness, roughness: m.roughness, emissive: new THREE.Color(m.emissive), emissiveIntensity: m.emissiveIntensity, ...more });
  let mat;
  if (m.shading === 'basic') {
    // The game draws three kinds of thing without light. Here she stands in daylight, so only what shines by itself stays so:
    // a picture that is not see-through is a screen; lamps (dark when off) and painted markings take the sun and the shade.
    if (m.textured && !m.transparent) mat = new THREE.MeshBasicMaterial(common);
    else mat = new THREE.MeshStandardMaterial({ ...common, metalness: 0, roughness: m.textured ? 0.58 : 0.3 });
  } else if (m.transparent && m.opacity < 1) {
    // Window glass, seen from outside by day: dark, and it shows the sky. What the file marks clear (a display window, a
    // bottle, a smoked flap) is as clear as it says.
    mat = lit(m.clear ? {} : GLASS);
    mat.userData.glass = true;
  } else mat = lit();
  mat.userData.side = mat.side;
  // What it is made of: paint, deck coating, wood, metal each get their own grain and sheen (look.js).
  surfaceOf(mat, m.surface);
  return mat;
}
const GLASS = { opacity: 0.62, metalness: 0.55, roughness: 0.06 };

// ---------- renderer, scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.localClippingEnabled = true;
// Shadows are drawn again only when something that casts them moves: turning the camera costs nothing.
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;
view.appendChild(renderer.domElement);

const scene = new THREE.Scene();
/**
 * Where there is no graphics card to draw with (the page's own checks draw in software; so do some old machines), or when
 * the address asks for it (?lite), she is drawn the light way: no glare, a sky without clouds, a plainer sea that stands
 * still. The light of each place, the sun and the shade where things meet stay.
 */
const drawnBy = (() => { const gl = renderer.getContext(), x = gl.getExtension('WEBGL_debug_renderer_info'); return x ? String(gl.getParameter(x.UNMASKED_RENDERER_WEBGL)) : ''; })();
const lite = /swiftshader|llvmpipe|software/i.test(drawnBy) || new URLSearchParams(location.search).has('lite');

/** From the ship toward the sun: over her starboard side, the side she is first seen from, and a little ahead of the beam.
 *  Across her rather than along her, so that with the decks lifted apart each one still has its near half in the sun.
 *  The day is look.js's (and blender/light.py's, which traced her light under the same sun). */
const SUN_DIR = day.sun;

/** The sky: seen behind her when she is afloat or walked, and mirrored by every polished surface always. */
const sky = createSky({ lite });
sky.dome.visible = false;
scene.add(sky.dome);
scene.environment = sky.env(renderer);
scene.environmentIntensity = 1;

const sun = new THREE.DirectionalLight(0xffffff, 1);
/** The sun's colour and strength are the day's: set again when her light file has been read. */
function lightSun() { const c = day.sunLight, m = Math.max(c.r, c.g, c.b); sun.color.setRGB(c.r / m, c.g / m, c.b / m); sun.intensity = m; }
lightSun();
sun.castShadow = true;
sun.shadow.mapSize.setScalar(Math.min(narrow.matches ? 2048 : 4096, renderer.capabilities.maxTextureSize));
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.04;
scene.add(sun, sun.target);

/** The ground she stands on is not drawn: only her shadow on it, over the page's own backdrop. Set at her keel in build(). */
const floor = new THREE.Mesh(new THREE.CircleGeometry(140, 72), new THREE.ShadowMaterial({ opacity: 0.3 }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const FOV = 30, TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
const camera = new THREE.PerspectiveCamera(FOV, 1, 0.4, 700);
// A frame is drawn with the shade where things meet (look.js). Glass is left out of that: what stands behind a pane is
// shaded as if the pane were not there.
const drawing = createLook(renderer, scene, camera, { lite, hidden: o => !!(o.userData.backdrop || (o.material && (o.material.transparent || (o.material.userData && o.material.userData.glass)))) });
const draw = () => drawing.render();
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
// Zooming goes toward what is under the pointer (or between the fingers), and may come close enough to read a plate.
controls.zoomToCursor = true;
controls.zoomSpeed = 1.2;
controls.minDistance = 0.6;
controls.maxDistance = 300;
controls.maxPolarAngle = Math.PI * 0.98;

/** She is first seen from her starboard bow quarter, a little above: bow to the right. */
const HOME_DIR = new THREE.Vector3(-0.78, 0.42, 0.62).normalize();
/** Looking into a room needs a steeper eye, or the deck lifted above it hides it. */
const ROOM_ELEVATION = THREE.MathUtils.degToRad(56);

let dirty = true;
const redraw = () => { dirty = true; };

// ---------- the ship ----------
/** @type {{id:string,name:string,level:string,lift:THREE.Vector3,node:THREE.Group,box:THREE.Box3,spaces:any[],row?:HTMLElement}[]} */
let decks = [];
let materials = [];
/** The parts that move (the file's `movers`), each a group inside its deck, and what works them (the file's `inputs`). */
let movers = [];
const inputs = new Map();
const state = { explode: 0, cut: 0, selected: null, afloat: true };
const root = new THREE.Group();
scene.add(root);

/** The cut: a plane along her length. What is to starboard of it is taken away, the side she is first seen from. */
const cutPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
let cutSpan = [-4.6, 3.6];

/**
 * The sea and the sky (look.js). She floats when she is walked, and when she is looked at whole from outside with the Afloat
 * key lit; lifted apart, cut open or put in dock she stands on the slip as before, so that her bottom can be seen.
 */
let sea = null, walk = null;
const afloat = () => !!sea && (!!walk || (state.afloat && state.explode === 0 && state.cut === 0));
function showSea() {
  if (!sea) return;
  const on = afloat();
  sea.mesh.visible = sea.shadow.visible = sky.dome.visible = on;
  floor.visible = !on;
  camera.far = on ? 9000 : 700;
  camera.updateProjectionMatrix();
  // afloat one cannot get under the water to look at her
  controls.maxPolarAngle = on ? Math.PI / 2 - 0.015 : Math.PI * 0.98;
  const key = document.querySelector('#fn-afloat');
  if (key) key.setAttribute('aria-pressed', String(state.afloat));
  fitSun();
}
let stairList = [];
function build(doc, atlases) {
  const { header } = doc, viewDef = header.views[0];
  stairList = header.stairs || [];
  materials = header.materials.map(m => materialOf(m, atlases));
  cutSpan = [header.bounds.min[0] - 0.05, header.bounds.max[0] - 1.0];
  floor.position.y = header.bounds.min[1] - 0.02;
  // The sea, with her own outline cut out of it.
  sea = createSea(header.ship.waterline, { lite });
  scene.add(sea.mesh, sea.shadow);
  showSea();
  const motions = new Map((header.movers || []).map(m => [m.id, m]));
  movers = [];
  decks = viewDef.groups.map(g => {
    const node = new THREE.Group(); node.name = g.id;
    const box = new THREE.Box3();
    const moving = new Map();
    for (const rec of g.meshes) {
      const mesh = new THREE.Mesh(geometryOf(rec, doc), materials[rec.material]);
      // Glass and painted markings are drawn after the solid things they lie on, and throw no shadow of their own.
      const clear = header.materials[rec.material].transparent;
      if (clear) mesh.renderOrder = 1;
      mesh.castShadow = !clear; mesh.receiveShadow = true;
      // A mesh that names a motion goes into that motion's own group within the deck, and is moved as one piece with
      // the other meshes of the motion (a rudder's blade, stock and anodes; a tiller and the head of its stock).
      let home = node;
      const motion = rec.mover && motions.get(rec.mover);
      if (motion) {
        home = moving.get(motion.id);
        if (!home) {
          home = new THREE.Group(); home.name = motion.id; home.matrixAutoUpdate = false;
          node.add(home); moving.set(motion.id, home); movers.push({ def: motion, node: home });
        }
      }
      home.add(mesh); box.union(mesh.geometry.boundingBox);
    }
    root.add(node);
    return { id: g.id, name: g.name, level: g.level, lift: new THREE.Vector3(...g.explode), node, box, spaces: g.spaces };
  });
  fitSun();
}

// ---------- parts that move ----------
const AXIS = new THREE.Vector3(), PIVOT = new THREE.Vector3(), ARM = new THREE.Vector3(), ARM2 = new THREE.Vector3(), CROSS = new THREE.Vector3();
const TURN = new THREE.Matrix4(), SHIFT = new THREE.Matrix4();
/** The matrix that turns things by `angle` about the line through `pivot` along AXIS. */
function turnAbout(out, pivot, angle) {
  out.makeTranslation(pivot.x, pivot.y, pivot.z).multiply(TURN.makeRotationAxis(AXIS, angle)).multiply(SHIFT.makeTranslation(-pivot.x, -pivot.y, -pivot.z));
  return out;
}
/**
 * Put every moving part where its input says. The kinds of motion are the file's (README: `movers`). The shadows are
 * drawn again with it, unless told to wait (a door on its way: they are drawn once it has come to rest).
 */
function moveParts(shadows = true) {
  for (const { def, node } of movers) {
    const input = inputs.get(def.input);
    const angle = THREE.MathUtils.degToRad(input ? input.value : 0) * (def.ratio ?? 1);
    AXIS.fromArray(def.axis).normalize();
    PIVOT.fromArray(def.pivot);
    if (def.kind === 'turn') turnAbout(node.matrix, PIVOT, angle);
    else if (def.kind === 'slide') {
      // The part runs along the axis, as far as the input says (a sliding door: its input is in centimetres).
      const run = (input ? input.value : 0) * (def.ratio ?? 1);
      node.matrix.makeTranslation(AXIS.x * run, AXIS.y * run, AXIS.z * run);
    }
    else if (def.kind === 'carry') {
      // The part keeps its heading and goes with a point that turns about the pivot.
      ARM.fromArray(def.point).sub(PIVOT);
      ARM2.copy(ARM).applyAxisAngle(AXIS, angle).sub(ARM);
      node.matrix.makeTranslation(ARM2.x, ARM2.y, ARM2.z);
    } else if (def.kind === 'aim') {
      // The part swings about its anchor to keep pointing at a pin that turns about the pivot; a rod also runs out or
      // in along that line by as much as the distance from anchor to pin has changed.
      const anchor = Q.fromArray(def.anchor);
      ARM.fromArray(def.pin).sub(PIVOT).applyAxisAngle(AXIS, angle).add(PIVOT).sub(anchor);   // anchor → pin, now
      ARM2.fromArray(def.pin).sub(anchor);                                                    // anchor → pin, at rest
      ARM.addScaledVector(AXIS, -ARM.dot(AXIS)); ARM2.addScaledVector(AXIS, -ARM2.dot(AXIS));
      const swing = Math.atan2(CROSS.crossVectors(ARM2, ARM).dot(AXIS), ARM2.dot(ARM));
      turnAbout(node.matrix, anchor, swing);
      if (def.extend) {
        const run = ARM.length() - ARM2.length();
        ARM.normalize();
        node.matrix.premultiply(SHIFT.makeTranslation(ARM.x * run, ARM.y * run, ARM.z * run));
      }
    } else node.matrix.identity();
    node.matrixWorldNeedsUpdate = true;
  }
  // A part that rides on another moving part (`on`: a flap in a door) goes with it, after its own motion.
  for (const { def, node } of movers) {
    const carrier = def.on && movers.find(m => m.def.id === def.on);
    if (carrier) node.matrix.premultiply(carrier.node.matrix);
  }
  if (shadows) renderer.shadowMap.needsUpdate = true;
  redraw();
}
/** How a setting is said: "Rudder 20° to port", "Rudder amidships". */
const said = (def, v) => v === 0 ? `${def.name} ${def.rest || 'at rest'}` : `${def.name} ${Math.abs(v)}${def.unit || ''} ${v < 0 ? def.below : def.above}`;
/** Put a worked thing somewhere at once (the checks, and whoever asked for less motion). Its keys and window follow. */
function setInput(id, value) {
  const it = inputs.get(id);
  if (!it || it.def.auto) return;
  it.value = THREE.MathUtils.clamp(value, it.def.min, it.def.max);
  if (it.keys) { it.order = it.value; it.held = !(it.value === it.def.min || it.stops.some(st => st.v === it.value)); showInput(it); }
  readout.textContent = said(it.def, it.value);
  moveParts();
}
const cap = text => text ? text[0].toUpperCase() + text.slice(1) : '';
/**
 * The rail and the desk (index.html says what each is for). `showFn` puts one function's keys on the desk: by its icon, where a
 * second press puts them away again, or because the part itself was tapped on the model (`toggle` false: they stay).
 */
const desk = $('#desk'), rail = $('#rail');
let openFn = null;
function showFn(id, toggle = true) {
  openFn = toggle && id === openFn ? null : id;
  for (const g of desk.children) g.hidden = g.dataset.fn !== openFn;
  for (const b of rail.querySelectorAll('[data-open]')) b.setAttribute('aria-expanded', String(b.dataset.open === openFn));
  placeCard();
}
rail.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) showFn(b.dataset.open); });
/** An icon is filled while its function is away from rest: the decks lifted, she cut open, the rudder over, the ramp down. */
const lamp = (id, on) => { const b = rail.querySelector(`[data-open="${id}"]`); if (b) b.toggleAttribute('data-on', on); };
/** What stands for a thing that is worked, on the rail and on its keys. One it does not know gets a lever. */
const ICON = { rudder: 'helm', 'stern-ramp': 'ramp' };
/** The keys of the thing a tapped part belongs to, if it has any: tap the ramp, or the wheel, and its keys are there. */
function keysFor(object) {
  for (let n = object && object.parent; n; n = n.parent) {
    const mover = movers.find(m => m.node === n), it = mover && inputs.get(mover.def.input);
    if (it && it.keys) { if (openFn !== it.def.id) showFn(it.def.id, false); return it; }
  }
  return null;
}
/** How to move: said when asked for, and for a few seconds on going aboard. */
const help = $('#help'), helpBtn = $('#fn-help');
let helpTimer = 0;
function showHelp(on, ms = 0) {
  clearTimeout(helpTimer);
  help.hidden = !on;
  helpBtn.setAttribute('aria-expanded', String(on));
  if (on && ms) helpTimer = setTimeout(() => showHelp(false), ms);
}
helpBtn.addEventListener('click', () => showHelp(help.hidden));
/** Afloat, or in dock: on the sea under the sky, or on the slip with her bottom to be seen. */
$('#fn-afloat').addEventListener('click', () => { state.afloat = !state.afloat; showSea(); readout.textContent = state.afloat ? 'Afloat' : 'In dock'; });
/**
 * The desk. What the file says is worked and is neither a door nor a lever has three keys and a window:
 * a thing that goes both ways from its rest (the rudder) has a key each way, a notch a press, and one for its rest;
 * a thing that goes one way (the ramp) has a key to bring it back, one to stop it, and one to run it on to its next stop.
 * A key gives an order; the part follows at its own pace (`rate`, in its unit a second). The key whose order stands is lit.
 */
function showInput(it) {
  const d = it.def, v = Math.round(it.value), names = it.names;
  const stop = it.stops.find(st => st.say && Math.abs(st.v - it.value) < 0.5);
  it.val.textContent = v === 0 ? cap(d.rest || 'at rest') : stop ? cap(stop.say) : d.min < 0 ? `${names[v < 0 ? 0 : 2]} ${Math.abs(v)}${d.unit || ''}` : `${v}${d.unit || ''}`;
  const lit = d.min < 0 ? (it.order < 0 ? 0 : it.order > 0 ? 2 : 1) : (it.held ? 1 : it.order === d.min ? 0 : 2);
  it.keys.forEach((k, i) => k.setAttribute('aria-pressed', String(i === lit)));
  lamp(d.id, v !== 0 || it.order !== 0);
}
function orderInput(id, to, held = false) {
  const it = inputs.get(id);
  if (!it || !it.keys) return;
  it.order = THREE.MathUtils.clamp(to, it.def.min, it.def.max);
  it.held = held;
  readout.textContent = said(it.def, Math.round(it.order));
  if (still.matches && it.value !== it.order) { it.value = it.order; moveParts(); }
  showInput(it);
}
function workOrders(dt) {
  let moved = false, under = false;
  for (const it of inputs.values()) {
    if (!it.keys || it.value === it.order) continue;
    const step = it.rate * dt;
    it.value = it.order > it.value ? Math.min(it.order, it.value + step) : Math.max(it.order, it.value - step);
    showInput(it);
    moved = true;
    if (it.value !== it.order) under = true;
  }
  if (moved) moveParts(!under);
}
/**
 * What the file says is worked by coming near (`auto`: her watertight doors): open to a walker within `reach` of `at`,
 * shut again behind; from outside, as a tap left it. It swings in 0.8 s.
 */
function workAuto(dt) {
  let moved = false, under = false;
  for (const it of inputs.values()) {
    const def = it.def;
    if (!def.auto) continue;
    // `auto: "tap"` (a machine's service door, its coin return) is worked by a tap only, on foot too: nobody opens it by passing.
    const byTap = def.auto === 'tap';
    const near = !byTap && walk && Math.hypot(walk.pos.x - def.at[0], walk.pos.z - def.at[2]) < def.reach && Math.abs(walk.pos.y - def.at[1]) < (def.height ?? 1.5);
    const want = (walk && !byTap ? near : it.open) ? def.max : def.min;
    if (it.value === want) continue;
    const step = (def.max - def.min) / 0.8 * dt;
    it.value = want > it.value ? Math.min(want, it.value + step) : Math.max(want, it.value - step);
    moved = true;
    if (it.value !== want) under = true;
  }
  if (moved) moveParts(!under);
}
/**
 * What the file says is worked a notch at a time (`steps`: her control levers): a tap moves it to the next position, up
 * to the end of its travel and back again, and says what the position means. It travels there in a third of a second.
 */
function stepInput(id) {
  const it = inputs.get(id);
  if (!it || !it.def.steps) return null;
  const n = it.def.steps.length;
  if (it.at + it.way < 0 || it.at + it.way >= n) it.way = -it.way;
  it.at += it.way;
  it.want = it.def.steps[it.at].v;
  readout.textContent = `${it.def.name}: ${it.def.steps[it.at].say}`;
  return it.def.steps[it.at];
}
function workSteps(dt) {
  let moved = false, under = false;
  for (const it of inputs.values()) {
    if (!it.def.steps || it.value === it.want) continue;
    const step = (it.def.max - it.def.min) / 1.2 * dt;
    it.value = it.want > it.value ? Math.min(it.want, it.value + step) : Math.max(it.want, it.value - step);
    moved = true;
    if (it.value !== it.want) under = true;
  }
  if (moved) moveParts(!under);
}
/** The control a tap has reached: the moving part itself, or the fitting of the register it belongs to. */
function controlAt(object, fittingId) {
  for (let n = object && object.parent; n; n = n.parent) {
    const mover = movers.find(m => m.node === n), it = mover && inputs.get(mover.def.input);
    if (it && it.def.steps) return it.def.id;
  }
  if (fittingId) for (const it of inputs.values()) if (it.def.steps && it.def.fitting === fittingId) return it.def.id;
  return null;
}
/** Keys on the desk for each thing the file says can be worked (showInput). */
function buildInputs(header) {
  for (const def of header.inputs || []) {
    // A door has no keys on the desk: it opens to whoever comes near on foot, and to a tap from outside (workAuto, identify).
    if (def.auto) {
      inputs.set(def.id, { def, value: def.min, open: false });
      if (def.normal) { const axis = Math.abs(def.normal[0]) > Math.abs(def.normal[2]) ? 0 : 2; passages.push({ axis, u: def.at[axis === 0 ? 2 : 0], at: def.at[axis], y: def.at[1] }); }
      continue;
    }
    // A lever has none either: a tap moves it a notch (stepInput), and it travels there in a moment (workSteps).
    if (def.steps) {
      const home = def.steps[def.home ?? 0].v;
      inputs.set(def.id, { def, value: home, want: home, at: def.home ?? 0, way: 1 });
      continue;
    }
    const two = def.min < 0, notch = def.notch || 5;
    const names = def.keys || (two ? [cap(def.below), cap(def.rest), cap(def.above)] : [cap(def.rest), 'Stop', cap(def.above)]);
    const keys = names.map((name, i) => {
      const k = el('button', { type: 'button', className: 'key ik', textContent: name, title: name });
      k.style.setProperty('--i', `var(--i-${(two ? ['left', 'mid', 'right'] : ['raise', 'stop', 'lower'])[i]})`);
      return k;
    });
    const val = el('span', { className: 'val' });
    const grp = el('div', { className: two ? 'grp wide' : 'grp', hidden: true }, el('span', { className: 'lbl' }, def.name), el('div', { className: 'keys' }, ...keys), val);
    grp.dataset.fn = def.id;
    const icon = el('button', { type: 'button', className: 'ico', textContent: def.name, title: def.name });
    icon.dataset.open = def.id;
    icon.setAttribute('aria-expanded', 'false');
    icon.style.setProperty('--i', `var(--i-${ICON[def.id] || 'lever'})`);
    $('#worked').append(icon);
    grp.setAttribute('role', 'group');
    grp.setAttribute('aria-label', `${def.name}: ${def.below} or ${def.above}, up to ${def.max}${def.unit || ''}`);
    // its stops, lowest first: where a run ends by itself (the ramp level with the quay, then at its lowest)
    const stops = (def.stops || [def.max]).map(st => typeof st === 'number' ? { v: st } : st).sort((a, b) => a.v - b.v);
    const it = { def, value: 0, order: 0, held: false, keys, val, names, stops, rate: def.rate || (def.max - def.min) / 8 };
    inputs.set(def.id, it);
    keys[0].addEventListener('click', () => orderInput(def.id, two ? it.order - notch : def.min));
    keys[1].addEventListener('click', () => two ? orderInput(def.id, 0) : orderInput(def.id, it.value, it.value !== def.min && !stops.some(st => st.v === it.value)));
    keys[2].addEventListener('click', () => orderInput(def.id, two ? it.order + notch : (stops.find(st => st.v > it.value + 1e-6) || stops[stops.length - 1]).v));
    desk.append(grp);
    showInput(it);
  }
  moveParts();
}

/** The box of everything shown, where it stands now. */
function shownBox(t = state.explode) {
  const out = new THREE.Box3();
  for (const d of decks) if (d.node.visible) out.union(d.box.clone().translate(d.lift.clone().multiplyScalar(t)));
  if (out.isEmpty()) for (const d of decks) out.union(d.box.clone().translate(d.lift.clone().multiplyScalar(t)));
  return out;
}

// ---------- framing: the model is fitted to the part of the screen the panel and bar leave free ----------
const free = { cx: 0, cy: 0, w: 1, h: 1, W: 1, H: 1 };
function measure() {
  const W = view.clientWidth, H = view.clientHeight;
  const title = $('header.title').getBoundingClientRect(), b = bar.getBoundingClientRect();
  const top = Math.min(title.bottom + 8, H * 0.4), bottom = Math.max(b.top - 8, top + 80);
  const right = narrow.matches ? W - 16 : W - 16 - panel.offsetWidth - 16;
  Object.assign(free, { cx: (16 + right) / 2, cy: (top + bottom) / 2, w: Math.max(right - 16, 80), h: bottom - top, W, H });
}
function applyLens() {
  camera.aspect = free.W / free.H;
  // The lens looks at the middle of the free part, not of the whole screen.
  camera.setViewOffset(free.W, free.H, free.W / 2 - free.cx, free.H / 2 - free.cy, free.W, free.H);
  camera.updateProjectionMatrix();
}
const X = new THREE.Vector3(), Y = new THREE.Vector3(), Q = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
/** How far back the eye must stand, looking along -dir at the box's middle, for the whole box to fit the free part. */
function fitDistance(box, dir) {
  const c = box.getCenter(new THREE.Vector3());
  X.crossVectors(UP, dir).normalize(); Y.crossVectors(dir, X);
  const th = TAN * free.w / free.H, tv = TAN * free.h / free.H;
  let d = 0;
  for (let i = 0; i < 8; i++) {
    Q.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).sub(c);
    d = Math.max(d, Math.abs(Q.dot(X)) / th + Q.dot(dir), Math.abs(Q.dot(Y)) / tv + Q.dot(dir));
  }
  return d * 1.06;
}
const eyeDir = () => camera.position.clone().sub(controls.target).normalize();

// ---------- the sun follows what is shown ----------
const SX = new THREE.Vector3().crossVectors(UP, SUN_DIR).normalize(), SY = new THREE.Vector3().crossVectors(SUN_DIR, SX), SP = new THREE.Vector3();
/** The sun's shadow is drawn on one picture: fit that picture to what is shown and to where its shadow falls on the ground,
 *  so none of it is spent on empty air, and have it drawn again. Called whenever what casts a shadow has moved. */
const sunAt = new THREE.Vector3();
function fitSun() {
  // On foot the shadows are drawn finely round the walker (a patch of sun through a window has a sharp edge); from outside,
  // over all of her that is shown and the ground her shadow falls on.
  const ground = afloat() ? 0 : floor.position.y;
  let box;
  if (walk) { box = new THREE.Box3().setFromCenterAndSize(walk.pos, SP.set(30, 14, 30)); sunAt.copy(walk.pos); }
  else { box = shownBox(); if (box.isEmpty()) return; box.min.y = Math.min(box.min.y, ground); }
  const c = box.getCenter(new THREE.Vector3());
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  const take = p => {
    const x = p.dot(SX), y = p.dot(SY), z = p.dot(SUN_DIR);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); z0 = Math.min(z0, z); z1 = Math.max(z1, z);
  };
  for (let i = 0; i < 8; i++) {
    SP.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
    const fall = (SP.y - ground) / SUN_DIR.y;
    take(SP.sub(c));
    // Where this corner's shadow reaches the ground: further from the sun, on the same ray.
    if (!walk) take(SP.addScaledVector(SUN_DIR, -fall));
  }
  // On foot what stands between the walker's surroundings and the sun still shades them: the lens begins well sunward.
  const far = 150, margin = 1, lens = sun.shadow.camera, sunward = walk ? 60 : 0;
  sun.position.copy(c).addScaledVector(SUN_DIR, far);
  sun.target.position.copy(c);
  lens.left = x0 - margin; lens.right = x1 + margin; lens.bottom = y0 - margin; lens.top = y1 + margin;
  lens.near = far - z1 - margin - sunward; lens.far = far - z0 + margin;
  lens.updateProjectionMatrix();
  renderer.shadowMap.needsUpdate = true;
  redraw();
}

// ---------- movement ----------
let move = null;
function flyTo(target, dir, distance, ms = 380) {
  const to = { target: target.clone(), pos: target.clone().addScaledVector(dir, distance) };
  if (still.matches || ms === 0) { controls.target.copy(to.target); camera.position.copy(to.pos); move = null; redraw(); return; }
  move = { from: { target: controls.target.clone(), pos: camera.position.clone() }, to, t0: performance.now(), ms };
}
function frameBox(box, dir = eyeDir(), ms) { flyTo(box.getCenter(new THREE.Vector3()), dir, THREE.MathUtils.clamp(fitDistance(box, dir), controls.minDistance, controls.maxDistance), ms); }
const home = ms => frameBox(shownBox(), HOME_DIR, ms);

/** Change what is shown or how much room it has, and keep the eye's angle and its closeness to the model. */
function keepFraming(change) {
  if (move) { controls.target.copy(move.to.target); camera.position.copy(move.to.pos); move = null; }
  const dir = eyeDir(), b0 = shownBox(), f0 = fitDistance(b0, dir), c0 = b0.getCenter(new THREE.Vector3());
  change();
  const b1 = shownBox(), f1 = fitDistance(b1, dir), c1 = b1.getCenter(new THREE.Vector3());
  const back = camera.position.clone().sub(controls.target).multiplyScalar(f1 / f0);
  controls.target.add(c1).sub(c0);
  camera.position.copy(controls.target).add(back);
  redraw();
}

/** The desk's keys for the decks and the cut: the key whose setting stands is lit; the cut's window says how far. */
function showKeys(box, percent) { for (const k of box.querySelectorAll('.key[data-v]')) k.setAttribute('aria-pressed', String(Math.abs(Number(k.dataset.v) - percent) < 0.5)); }
const showExplode = t => { showKeys($('#explode'), t * 100); lamp('decks', t > 0); };
const showCut = t => { showKeys($('#cut'), t * 100); $('#cut-val').textContent = `${Math.round(t * 100)} %`; lamp('cut', t > 0); };
let explodeMove = null;
function placeDecks(t) {
  const was = afloat();
  state.explode = t;
  for (const d of decks) d.node.position.copy(d.lift).multiplyScalar(t);
  // Lifted apart, each deck stands in the shadow of the one above: the shadows are let up, so the rooms can still be read.
  sun.shadow.intensity = 1 - SHADE_LET_UP * t;
  if (was !== afloat()) showSea(); else fitSun();
}
const SHADE_LET_UP = 0.4;
function setExplode(t, { animate = false } = {}) {
  t = THREE.MathUtils.clamp(t, 0, 1);
  showExplode(t);
  if (animate && !still.matches) { explodeMove = { from: state.explode, to: t, t0: performance.now(), ms: 520 }; return; }
  explodeMove = null;
  keepFraming(() => placeDecks(t));
}

function setCut(t) {
  t = THREE.MathUtils.clamp(t, 0, 1);
  const was = state.cut > 0, is = t > 0, floated = afloat();
  state.cut = t;
  if (floated !== afloat()) showSea();
  showCut(t);
  cutPlane.constant = -(cutSpan[0] + (cutSpan[1] - cutSpan[0]) * t);
  if (was !== is) for (const m of materials) {
    // Cut open, the insides of plates are seen: draw both faces while the cut is on. What is cut away throws no shadow.
    // A picture (a sign, a dial) and a mark laid on the plating (her name, the draught marks: drawn a hair in front of
    // it) are paint on one face: they keep that face, or they would read mirrored from behind.
    const paint = m.map || (m.polygonOffset && m.polygonOffsetFactor < 0);
    m.clippingPlanes = is ? [cutPlane] : null;
    m.clipShadows = is;
    m.side = is && !paint ? THREE.DoubleSide : m.userData.side;
    m.needsUpdate = true;
  }
  // The shade where things meet is worked out from what is drawn: what is cut away is cut away there too.
  if (was !== is) { const nm = drawing.shade.normalMaterial; nm.clippingPlanes = is ? [cutPlane] : null; nm.side = is ? THREE.DoubleSide : THREE.FrontSide; nm.needsUpdate = true; }
  renderer.shadowMap.needsUpdate = true;
  redraw();
}
/** Where the cut stands, in metres to port of the centreline; nothing is cut at -Infinity. */
const cutAt = () => state.cut > 0 ? -cutPlane.constant : -Infinity;

// ---------- naming a room ----------
const accent = () => new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0b6e66');
const mark = new THREE.Group(); mark.visible = false;
const markEdges = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ depthTest: false, transparent: true, toneMapped: false }));
const markFill = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.14, depthTest: false, depthWrite: false, toneMapped: false }));
markEdges.renderOrder = 11; markFill.renderOrder = 10;
mark.add(markFill, markEdges);
function tintMark() { const c = accent(); markEdges.material.color.copy(c); markFill.material.color.copy(c); redraw(); }

const spaceBox = sp => new THREE.Box3(new THREE.Vector3(...sp.min), new THREE.Vector3(...sp.max));
function select(deckId, spaceId, { frame = false } = {}) {
  const deck = decks.find(d => d.id === deckId), sp = deck && deck.spaces.find(s => s.id === spaceId);
  for (const b of panel.querySelectorAll('.room.on')) { b.classList.remove('on'); b.setAttribute('aria-expanded', 'false'); }
  for (const n of panel.querySelectorAll('#decks .note')) n.remove();
  if (sp && systems) systems.hideCard();
  if (!sp || (state.selected && state.selected.deck === deckId && state.selected.space === spaceId && frame)) {
    state.selected = null; mark.visible = false; readout.textContent = ''; redraw(); return;
  }
  state.selected = { deck: deckId, space: spaceId };
  const box = spaceBox(sp), size = box.getSize(new THREE.Vector3());
  markEdges.geometry.dispose();
  markEdges.geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(size.x, size.y, size.z));
  markFill.scale.copy(size);
  mark.position.copy(box.getCenter(new THREE.Vector3()));
  deck.node.add(mark); mark.visible = true;
  readout.textContent = `${deck.name} · ${sp.name}`;

  const btn = panel.querySelector(`.room[data-deck="${deckId}"][data-space="${CSS.escape(spaceId)}"]`);
  if (btn) {
    btn.classList.add('on'); btn.setAttribute('aria-expanded', 'true');
    const note = el('div', { className: 'note' });
    if (sp.text) note.append(el('p', {}, sp.text));
    if (sp.why) note.append(el('p', { className: 'muted' }, sp.why));
    if (note.childNodes.length) btn.after(note);
    btn.closest('details').open = true;
    if (!frame) btn.scrollIntoView({ block: 'nearest', behavior: still.matches ? 'auto' : 'smooth' });
  }
  if (frame) {
    if (!deck.node.visible) showDeck(deck, true);
    // A room is under the decks above it: lift them clear first, then look down into it.
    if (state.explode < 0.6) { explodeMove = null; placeDecks(1); showExplode(1); }
    const dir = eyeDir(), flat = Math.hypot(dir.x, dir.z) || 1, e = Math.max(Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1)), ROOM_ELEVATION);
    dir.set(dir.x / flat * Math.cos(e), Math.sin(e), dir.z / flat * Math.cos(e));
    const shown = box.clone().translate(deck.node.position).expandByScalar(1.2);
    frameBox(shown, dir, 520);
  }
  redraw();
}

function showDeck(deck, on) {
  deck.node.visible = on;
  deck.row.classList.toggle('off', !on);
  deck.row.querySelector('input').checked = on;
  if (!on && state.selected && state.selected.deck === deck.id) select(null);
  fitSun();
}

const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function identify(clientX, clientY) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set((clientX - r.left) / r.width * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const c = cutAt();
  const hit = ray.intersectObjects(decks.filter(d => d.node.visible).map(d => d.node), true)
    .find(h => h.object.isMesh && h.object.parent !== mark && h.point.x >= c && !h.object.material.userData.glass);
  if (!hit) { select(null); systems && !systems.state.shown && systems.clear(); systems && systems.hideCard(); return; }
  // A door answers a tap: it opens, or shuts again.
  for (let n = hit.object.parent; n; n = n.parent) {
    const mover = movers.find(m => m.node === n), it = mover && inputs.get(mover.def.input);
    if (it && it.def.auto) { it.open = !it.open; select(null); readout.textContent = `${it.def.name}: ${it.open ? it.def.above || 'open' : it.def.rest || 'shut'}`; return; }
  }
  keysFor(hit.object);
  // The deck the thing belongs to: its parent, or its parent's parent when it is a moving part.
  let within = hit.object.parent;
  while (within && !decks.some(d => d.node === within)) within = within.parent;
  const deck = decks.find(d => d.node === within);
  const p = hit.point.clone().sub(deck.node.position);
  // A fitting of the register answers before the room it stands in: the card says what it is.
  const fitting = systems && systems.pick(deck.id, p);
  // A lever answers a tap by moving a notch; its card is shown with it.
  const control = controlAt(hit.object, fitting && fitting.id);
  if (fitting) { select(null); systems.showComponent(fitting.id, { fly: false, keep: !!systems.state.shown }); if (control) stepInput(control); return; }
  if (control) { stepInput(control); return; }
  if (systems) { systems.hideCard(); if (!systems.state.shown) systems.clear(); }
  // The smallest room of this deck that holds the point: a cabin wins over the deck house it stands in.
  let best = null, bestSize = Infinity;
  for (const sp of deck.spaces) {
    const b = spaceBox(sp).expandByScalar(0.15);
    if (!b.containsPoint(p)) continue;
    const s = b.getSize(Q), v = s.x * s.y * s.z;
    if (v < bestSize) { best = sp; bestSize = v; }
  }
  if (best) select(deck.id, best.id);
  else { select(null); readout.textContent = deck.name; }
}

/** Look closer at what is under a point of the screen: it becomes the middle she turns about, from under half as far. */
function focusAt(clientX, clientY) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set((clientX - r.left) / r.width * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const c = cutAt();
  const hit = ray.intersectObjects(decks.filter(d => d.node.visible).map(d => d.node), true)
    .find(h => h.object.isMesh && h.object.parent !== mark && h.point.x >= c && !h.object.material.userData.glass);
  if (!hit) return;
  flyTo(hit.point, eyeDir(), Math.max(camera.position.distanceTo(hit.point) * 0.45, 1.2), 420);
}

let down = null, lastTap = null;
/** On foot a tap or a click on a fitting says what it is (a drag looks round). */
let walkDown = null;
function nameOnFoot(clientX, clientY) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set((clientX - r.left) / r.width * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(decks.map(d => d.node), true).find(h => h.object.isMesh && h.object.visible && !h.object.material.userData.glass && !h.object.userData.own && h.object.material.depthTest !== false);
  // What is worked by a tap answers one from within reach: it opens, or shuts again.
  if (hit && hit.distance < 3) for (let n = hit.object.parent; n; n = n.parent) {
    const mover = movers.find(m => m.node === n), it = mover && inputs.get(mover.def.input);
    if (it && it.def.auto === 'tap') { it.open = !it.open; readout.textContent = `${it.def.name}: ${it.open ? it.def.above || 'open' : it.def.rest || 'shut'}`; return; }
  }
  if (hit && hit.distance < 8) keysFor(hit.object);
  if (!systems) return;
  let within = hit && hit.object.parent;
  while (within && !decks.some(d => d.node === within)) within = within.parent;
  const deck = hit && hit.distance < 8 && decks.find(d => d.node === within);
  const fitting = deck && systems.pick(deck.id, hit.point.clone().sub(deck.node.position));
  const control = deck && controlAt(hit.object, fitting && fitting.id);
  if (fitting) systems.showComponent(fitting.id, { fly: false, keep: !!systems.state.shown });
  else if (systems.state.shown) systems.hideCard(); else systems.clear();
  if (control) stepInput(control);
}
// On foot: one finger (or the mouse) on the model looks round, and a tap names what it is on; two fingers zoom, by how far
// apart they have come since the second went down. When one of the two lifts, the other goes on looking from where it is.
const fingers = new Map();
let pinch = null;
const spread = () => { const [a, b] = [...fingers.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
renderer.domElement.addEventListener('pointerdown', e => {
  if (walk) {
    fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (fingers.size === 2) { pinch = { spread: spread(), zoom: walkZoom }; walk.look = null; walkDown = null; return; }
    if (fingers.size > 2) return;
    walkDown = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; lookStart(e); return;
  }
  move = null; down = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
});
renderer.domElement.addEventListener('pointermove', e => {
  if (!walk) return;
  const f = fingers.get(e.pointerId);
  if (f) { f.x = e.clientX; f.y = e.clientY; }
  if (pinch) { if (fingers.size >= 2 && pinch.spread > 8) setWalkZoom(pinch.zoom * spread() / pinch.spread); return; }
  lookMove(e);
});
function fingerUp(e) {
  fingers.delete(e.pointerId);
  if (!pinch) return false;
  if (fingers.size < 2) {
    pinch = null;
    const [id, at] = [...fingers][0] || [];
    if (walk && id !== undefined) walk.look = { id, x: at.x, y: at.y };
  }
  return true;                                                     // a finger of a pinch names nothing as it lifts
}
renderer.domElement.addEventListener('wheel', e => {
  if (!walk) return;
  e.preventDefault();
  const turned = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
  zoomWalk(Math.exp(-turned * (e.ctrlKey ? 0.01 : 0.0015)));       // a pinch on a trackpad comes as the wheel with Ctrl
}, { passive: false });
for (const type of ['gesturestart', 'gesturechange', 'gestureend']) renderer.domElement.addEventListener(type, e => e.preventDefault());
renderer.domElement.addEventListener('pointerup', e => {
  if (walk) {
    if (fingerUp(e)) return;
    lookEnd(e);
    const d = walkDown; walkDown = null;
    if (d && d.id === e.pointerId && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6 && performance.now() - d.t < 450) nameOnFoot(e.clientX, e.clientY);
    return;
  }
  if (!down || down.id !== e.pointerId) return;
  const now = performance.now();
  const tap = Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6 && now - down.t < 500;
  down = null;
  if (!tap) return;
  // A second tap on the same spot looks closer; the first names the room.
  if (lastTap && now - lastTap.t < 380 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 28) { lastTap = null; focusAt(e.clientX, e.clientY); return; }
  lastTap = { x: e.clientX, y: e.clientY, t: now };
  identify(e.clientX, e.clientY);
});
renderer.domElement.addEventListener('pointercancel', e => { down = null; if (walk && !fingerUp(e)) lookEnd(e); });
renderer.domElement.addEventListener('wheel', () => { move = null; }, { passive: true });

// ---------- looking at her from a named side ----------
const VIEWS = {
  home: HOME_DIR,
  starboard: new THREE.Vector3(-1, 0.12, 0), port: new THREE.Vector3(1, 0.12, 0),
  ahead: new THREE.Vector3(0, 0.1, 1), astern: new THREE.Vector3(0, 0.1, -1),
  // From straight above and below the eye stands a hair to starboard, so that her bow lies to the right as elsewhere.
  above: new THREE.Vector3(-0.02, 1, 0), below: new THREE.Vector3(-0.02, -1, 0),
};
function lookFrom(name) {
  const dir = VIEWS[name];
  if (dir) frameBox(shownBox(), dir.clone().normalize(), 520);
}
$('#views').addEventListener('change', e => { lookFrom(e.target.value); e.target.value = ''; });

/** Turn, tip or zoom the outside view from the keyboard. */
const SPH = new THREE.Spherical();
function nudgeView(turn, tip, zoom) {
  move = null;
  SPH.setFromVector3(Q.copy(camera.position).sub(controls.target));
  SPH.theta += turn; SPH.phi = THREE.MathUtils.clamp(SPH.phi + tip, 0.02, controls.maxPolarAngle);
  SPH.radius = THREE.MathUtils.clamp(SPH.radius * zoom, controls.minDistance, controls.maxDistance);
  camera.position.setFromSpherical(SPH).add(controls.target);
  redraw();
}

// ---------- walking aboard ----------
/**
 * She can be gone through on foot. The feet stand on whatever is drawn under them that faces up (decks, floor plates,
 * the treads of stairs): a step of up to STEP is taken, up or down, and no more (a seat is not climbed), so stairs
 * carry one from deck to deck and a deck's edge holds one back; a gap of up to GAP in the floor is stepped across (open
 * stairs leave one between the top tread and the landing). What stands on a deck stops the walker too (furniture,
 * machinery, rails, the bulwark): anything whose top lies between OVER and the top of the head, within BODY of the
 * feet (OVER is two treads of a stair, which a body on a stair has beside its feet). Walls stop it as well: bulkheads,
 * linings, glass, whatever stands upright within BODY of the walker between knee and eye (wallClear). A door lets one
 * through: the other ship's doors are leaves that do not open, so one goes through the leaf and the wall it hangs in
 * (findDoors); her own watertight doors swing open for whoever comes near (workAuto). A room with no door drawn is
 * entered by choosing it in the panel. Her ladders are climbed at a button (the file's `ways`: climb); the other ship's
 * are not, and the deck above and the deck below are also a key (or a button) away. Under a deckhead lower than the
 * walker, and through a low doorway, the eye comes down (one stoops); under less than CROUCH one does not go.
 */
const EYE = 1.6, HEAD = 1.7, CROUCH = 1.1, DUCK = 1.25, BODY = 0.18, STEP = 0.3, OVER = 0.42, GAP = 0.15, PACE = 1.5, RUN = 3.8, LOOK = 0.0036, STRIDE = 0.02;
const RING = [[0, 0], ...Array.from({ length: 8 }, (_, k) => [Math.cos(k * Math.PI / 4) * BODY, Math.sin(k * Math.PI / 4) * BODY])];
/**
 * Every triangle of what stands still that faces up (a floor) or down (a deckhead), by 0.5 m squares of the plan, so
 * what is under or over a point is found at once.
 */
const CELL = 0.5;
const surface = () => ({ tris: [], deck: [], map: new Map() });
const floors = surface(), heads = surface(), walls = surface();
/** Where a door of the drawing hangs: there one may go through the wall it hangs in (findDoors). */
let doorways = [];
/** Every way through a wall, the drawing's doors and her own: which way it lies (0 across x, 2 across z), its middle along the wall, where the wall stands, its floor. */
let passages = [];
function indexFloors() {
  const p = new Float64Array(9);
  const keep = (S, di) => {
    const n = S.tris.length / 9;
    for (let k = 0; k < 9; k++) S.tris.push(p[k]);
    S.deck.push(di);
    const x0 = Math.floor(Math.min(p[0], p[3], p[6]) / CELL), x1 = Math.floor(Math.max(p[0], p[3], p[6]) / CELL);
    const z0 = Math.floor(Math.min(p[2], p[5], p[8]) / CELL), z1 = Math.floor(Math.max(p[2], p[5], p[8]) / CELL);
    for (let cx = x0; cx <= x1; cx++) for (let cz = z0; cz <= z1; cz++) {
      const key = cx * 4096 + cz;
      let list = S.map.get(key);
      if (!list) S.map.set(key, list = []);
      list.push(n);
    }
  };
  const steep = [], steepDeck = [];
  decks.forEach((d, di) => {
    for (const o of d.node.children) {
      if (!o.isMesh) continue;                                    // moving parts (groups) neither carry nor stop the walker
      const glass = o.material.transparent;                       // glass is not stood on, but it is a wall
      // A plate drawn as one surface seen from both sides (a floor plate, a flat) is a floor from above and a deckhead
      // from below, whichever way it is wound.
      const both = o.material.userData.side === THREE.DoubleSide;
      const pos = o.geometry.attributes.position.array, ix = o.geometry.index.array;
      for (let i = 0; i < ix.length; i += 3) {
        for (let k = 0; k < 3; k++) { const j = ix[i + k] * 3; p[k * 3] = pos[j]; p[k * 3 + 1] = pos[j + 1]; p[k * 3 + 2] = pos[j + 2]; }
        const ux = p[3] - p[0], uy = p[4] - p[1], uz = p[5] - p[2], vx = p[6] - p[0], vy = p[7] - p[1], vz = p[8] - p[2];
        const ny = uz * vx - ux * vz, len = Math.hypot(uy * vz - uz * vy, ny, ux * vy - uy * vx);
        if (len < 1e-9) continue;
        if (Math.abs(ny) / len < 0.6) { for (let k = 0; k < 9; k++) steep.push(p[k]); steepDeck.push(di); continue; }
        if (glass) continue;
        if (ny > 0 || both) keep(floors, di);
        if (ny < 0 || both) keep(heads, di);
      }
    }
  });
  // What stands upright is a wall, but for the doors' own leaves and frames.
  doorways = findDoors(steep);
  passages = doorways.map(d => ({ axis: d.axis, u: (d.u0 + d.u1) / 2, at: (d.p0 + d.p1) / 2, y: d.y0 }));
  for (let i = 0, n = 0; i < steep.length; i += 9, n++) {
    for (let k = 0; k < 9; k++) p[k] = steep[i + k];
    if (!partOfDoor(p)) keep(walls, steepDeck[n]);
  }
  for (const S of [floors, heads, walls]) { S.tris = Float32Array.from(S.tris); S.deck = Uint8Array.from(S.deck); }
}
/**
 * The doors of the drawing, found by their shape: a leaf is a thin upright slab, 0.5 to 1.05 m wide and 1.6 to 2.12 m
 * high, its two faces 1 to 6 cm apart, lying fore and aft or athwartships. (A wall panel is taller, wider or thicker; a
 * locker is deeper.) None of them opens, and most of them hang on a wall that has no opening behind them: so a door is
 * where the walker may go through the wall it hangs in (wallClear).
 */
function findDoors(t) {
  const seen = new Map();
  for (let i = 0; i < t.length; i += 9) {
    const x0 = Math.min(t[i], t[i + 3], t[i + 6]), x1 = Math.max(t[i], t[i + 3], t[i + 6]);
    const y0 = Math.min(t[i + 1], t[i + 4], t[i + 7]), y1 = Math.max(t[i + 1], t[i + 4], t[i + 7]);
    const z0 = Math.min(t[i + 2], t[i + 5], t[i + 8]), z1 = Math.max(t[i + 2], t[i + 5], t[i + 8]);
    if (y1 - y0 < 1.6 || y1 - y0 > 2.12) continue;
    const dx = x1 - x0, dz = z1 - z0;
    let axis, at, u0, u1;
    if (dx < 0.02 && dz >= 0.5 && dz <= 1.05) { axis = 0; at = (x0 + x1) / 2; u0 = z0; u1 = z1; }
    else if (dz < 0.02 && dx >= 0.5 && dx <= 1.05) { axis = 2; at = (z0 + z1) / 2; u0 = x0; u1 = x1; }
    else continue;
    const key = [axis, Math.round(u0 * 500), Math.round(u1 * 500), Math.round(y0 * 500), Math.round(y1 * 500)].join('|');
    let rec = seen.get(key);
    if (!rec) seen.set(key, rec = { axis, u0, u1, y0, y1, at: new Set() });
    rec.at.add(Math.round(at * 1000));
  }
  const out = [];
  for (const r of seen.values()) {
    const at = [...r.at].sort((a, b) => a - b);
    for (let k = 1; k < at.length; k++) if (at[k] - at[k - 1] >= 10 && at[k] - at[k - 1] <= 60) out.push({ axis: r.axis, p0: at[k - 1] / 1000, p1: at[k] / 1000, u0: r.u0, u1: r.u1, y0: r.y0, y1: r.y1 });
  }
  return out;
}
/** Whether a triangle (nine numbers) is part of a door: its leaf, its frame, its handle, a sign on it. */
function partOfDoor(p) {
  const x0 = Math.min(p[0], p[3], p[6]), x1 = Math.max(p[0], p[3], p[6]), y0 = Math.min(p[1], p[4], p[7]), y1 = Math.max(p[1], p[4], p[7]);
  const z0 = Math.min(p[2], p[5], p[8]), z1 = Math.max(p[2], p[5], p[8]);
  for (const d of doorways) {
    const a0 = d.axis === 0 ? x0 : z0, a1 = d.axis === 0 ? x1 : z1, u0 = d.axis === 0 ? z0 : x0, u1 = d.axis === 0 ? z1 : x1;
    if (a0 >= d.p0 - 0.15 && a1 <= d.p1 + 0.15 && u0 >= d.u0 - 0.15 && u1 <= d.u1 + 0.15 && y0 >= d.y0 - 0.1 && y1 <= d.y1 + 0.3) return true;
  }
  return false;
}
/**
 * How high a body standing at (x, z) on a floor at y is clear of what stands upright: the lowest of SLICES (heights
 * over the feet, up to `top`) at which a wall comes within BODY of its middle; Infinity when none does. Each wall
 * triangle is cut at the height and the line it leaves in the plan is measured to. Standing in a doorway, the wall the
 * door hangs in does not count.
 */
const SLICES = [0.5, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6];
function wallClear(x, z, y, top = EYE) {
  let door = null;
  for (const d of doorways) {
    const u = d.axis === 0 ? z : x, at = d.axis === 0 ? x : z;
    if (u > d.u0 + 0.1 && u < d.u1 - 0.1 && at > d.p0 - 0.55 && at < d.p1 + 0.55 && y > d.y0 - 0.4 && y < d.y0 + 0.3) { door = d; break; }
  }
  const t = walls.tris, R = BODY, R2 = R * R;
  let clear = Infinity;
  for (let cx = Math.floor((x - R) / CELL), cx1 = Math.floor((x + R) / CELL); cx <= cx1; cx++) for (let cz = Math.floor((z - R) / CELL), cz1 = Math.floor((z + R) / CELL); cz <= cz1; cz++) {
    const list = walls.map.get(cx * 4096 + cz);
    if (!list) continue;
    for (const n of list) {
      if (!decks[walls.deck[n]].node.visible) continue;
      const i = n * 9, ax = t[i], ay = t[i + 1], az = t[i + 2], bx = t[i + 3], by = t[i + 4], bz = t[i + 5], qx = t[i + 6], qy = t[i + 7], qz = t[i + 8];
      const lo = Math.min(ay, by, qy) - y, hi = Math.max(ay, by, qy) - y;
      if (hi < SLICES[0] || lo > top || lo >= clear) continue;
      if (Math.min(ax, bx, qx) > x + R || Math.max(ax, bx, qx) < x - R || Math.min(az, bz, qz) > z + R || Math.max(az, bz, qz) < z - R) continue;
      if (door) {
        const nx = (by - ay) * (qz - az) - (bz - az) * (qy - ay), nz = (bx - ax) * (qy - ay) - (by - ay) * (qx - ax);
        const axis = Math.abs(nx) > Math.abs(nz) ? 0 : 2, at = axis === 0 ? (ax + bx + qx) / 3 : (az + bz + qz) / 3;
        if (axis === door.axis && at > door.p0 - 0.3 && at < door.p1 + 0.3) continue;
      }
      for (const sl of SLICES) {
        if (sl >= clear || sl > top) break;
        if (sl < lo || sl > hi) continue;
        // Where the triangle's edges cross that height: two points, the ends of its line in the plan.
        const h = y + sl;
        let count = 0, px = 0, pz = 0, rx = 0, rz = 0;
        for (let e = 0; e < 3; e++) {
          const a = i + e * 3, b = i + ((e + 1) % 3) * 3, ya = t[a + 1] - h, yb = t[b + 1] - h;
          if ((ya <= 0) === (yb <= 0)) continue;
          const f = ya / (ya - yb), ex = t[a] + (t[b] - t[a]) * f, ez = t[a + 2] + (t[b + 2] - t[a + 2]) * f;
          if (count++ === 0) { px = ex; pz = ez; } else { rx = ex; rz = ez; }
        }
        if (count < 2) continue;
        const sx = rx - px, sz = rz - pz, len2 = sx * sx + sz * sz;
        const f = len2 > 1e-12 ? Math.max(0, Math.min(1, ((x - px) * sx + (z - pz) * sz) / len2)) : 0;
        const ddx = px + sx * f - x, ddz = pz + sz * f - z;
        if (ddx * ddx + ddz * ddz < R2) { clear = sl; break; }
      }
    }
  }
  return clear;
}
/** The surface of S over or under (x, z) between `bottom` and `top`: the highest there, or with `lowest` the lowest; null when there is none. */
function levelAt(S, x, z, top, bottom, lowest) {
  const list = S.map.get(Math.floor(x / CELL) * 4096 + Math.floor(z / CELL));
  if (!list) return null;
  const t = S.tris;
  let best = null;
  for (const n of list) {
    if (!decks[S.deck[n]].node.visible) continue;
    const i = n * 9, ax = t[i], ay = t[i + 1], az = t[i + 2], bx = t[i + 3], by = t[i + 4], bz = t[i + 5], cx = t[i + 6], cy = t[i + 7], cz = t[i + 8];
    const det = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
    if (Math.abs(det) < 1e-12) continue;
    const u = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / det, v = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / det, w = 1 - u - v;
    if (u < -1e-4 || v < -1e-4 || w < -1e-4) continue;
    const y = u * ay + v * by + w * cy;
    if (y <= top && y >= bottom && (best === null || (lowest ? y < best : y > best))) best = y;
  }
  return best;
}
/** The highest floor under (x, z) that is no higher than `top` and no lower than `bottom`; null when there is none. */
const floorAt = (x, z, top, bottom) => levelAt(floors, x, z, top, bottom, false);
/** The headroom over a floor at y under (x, z): up to the lowest deckhead, beam or pipe over it; Infinity under the sky. */
function headroom(x, z, y) {
  const over = levelAt(heads, x, z, y + 4, y + OVER, true);
  return over === null ? Infinity : over - y;
}
/**
 * The floor a body stands on at (x, z), coming from the level `from`: what is under its middle within a step. A slot
 * narrower than the body (the seam between two floor plates) is stood across, not in: where the floor is higher on
 * both sides of the middle, or there is floor on both sides and none under the middle, the lower of the two sides is
 * the footing. Null where there is nothing to stand on.
 */
function footing(x, z, from) {
  let y = floorAt(x, z, from + STEP, from - STEP);
  for (let k = 1; k <= 4; k++) {
    const a = floorAt(x + RING[k][0], z + RING[k][1], from + STEP, from - STEP);
    if (a === null || (y !== null && a <= y)) continue;
    const b = floorAt(x - RING[k][0], z - RING[k][1], from + STEP, from - STEP);
    if (b !== null && (y === null || b > y)) y = Math.min(a, b);
  }
  return y;
}
/**
 * Whether a body can stand at (x, z) on a floor at y: nothing drawn has its top there between a step and the head,
 * there is CROUCH of headroom over its middle, and no wall comes within BODY of it lower than DUCK (under less than the
 * full height one stoops, under a deckhead and through a low doorway alike: see placeEye).
 */
function roomFor(x, z, y) {
  for (const [dx, dz] of RING) {
    const top = floorAt(x + dx, z + dz, y + HEAD, y + OVER + 0.01);
    if (top === null) continue;
    // What stands there stops one, but not what only hangs there high enough to stoop under (the head of a doorway).
    const under = levelAt(heads, x + dx, z + dz, top, y + OVER, true);
    if (under === null || under - y < DUCK) return false;
  }
  const head = headroom(x, z, y);
  return head >= CROUCH && wallClear(x, z, y, Math.min(EYE, head - 0.05)) > DUCK;
}
/** Whether one can walk `far` metres from there, some way: a spot hemmed in on every side is no place to begin a walk. */
function canLeave(x, z, y, far) {
  for (const [dx, dz] of RING.slice(1)) {
    let px = x, pz = z, level = y, gone = 0;
    while (gone < far - 1e-9) {
      px += dx / BODY * 0.15; pz += dz / BODY * 0.15;
      const f = footing(px, pz, level);
      if (f === null || !roomFor(px, pz, f)) break;
      level = f; gone += 0.15;
    }
    if (gone >= far - 1e-9) return true;
  }
  return false;
}
/** Somewhere to stand near (x, z) at about the level y, with `far` metres to walk: the point itself, else the nearest of a search outward. */
function standNear(x, z, y, reach, far, within) {
  for (let ring = 0; ring < 14; ring++) for (let k = 0; k < Math.max(1, ring * 8); k++) {
    const a = k / Math.max(1, ring * 8) * Math.PI * 2, px = x + Math.cos(a) * ring * 0.25, pz = z + Math.sin(a) * ring * 0.25;
    if (within && (px < within.min[0] || px > within.max[0] || pz < within.min[2] || pz > within.max[2])) continue;
    const under = floorAt(px, pz, y + reach, y - reach), f = under === null ? null : footing(px, pz, under);
    if (f !== null && roomFor(px, pz, f) && canLeave(px, pz, f, far)) return new THREE.Vector3(px, f, pz);
  }
  return null;
}
/** The room the point is in: the smallest box of any deck's spaces that holds it. */
function roomAt(point) {
  let best = null, size = Infinity;
  for (const d of decks) for (const sp of d.spaces) {
    const b = spaceBox(sp).expandByScalar(0.1);
    if (!b.containsPoint(point)) continue;
    const v = b.getSize(Q); const vol = v.x * v.y * v.z;
    if (vol < size) { best = { deck: d, space: sp }; size = vol; }
  }
  return best;
}

/**
 * The ladders (the file's `ways`): each joins two places to stand, `a` below and `b` above, and is climbed on `line`.
 * The walker does not climb rung by rung: standing at one end, the Ladder button (or F) carries it to the other, down
 * to the line, along it and off, at a climber's pace. Each end is set on the nearest spot where there is room to stand.
 */
let ways = [];
function buildWays(header) {
  ways = (header.ways || []).map(def => {
    const end = p => standNear(p[0], p[2], p[1], 0.3, 0.3) || new THREE.Vector3(p[0], p[1], p[2]);
    return { def, a: end(def.a), b: end(def.b), line: def.line };
  });
}
/** The ladder whose end the walker stands at, and which end: within 0.75 m of it and on its level. */
function wayHere() {
  for (const way of ways) for (const from of ['a', 'b']) {
    const p = way[from];
    if (Math.hypot(walk.pos.x - p.x, walk.pos.z - p.z) < 0.75 && Math.abs(walk.floor - p.y) < 0.45) return { way, from };
  }
  return null;
}
function climb() {
  if (!walk || walk.climb) return;
  const here = wayHere();
  if (!here) return;
  const { way, from } = here, to = way[from === 'a' ? 'b' : 'a'];
  // Over to the ladder, along it, and off at the other end: 1.2 m/s on the level, 0.75 m/s on the rungs.
  const pts = [walk.pos.clone().setY(walk.floor), new THREE.Vector3(way.line[0], walk.floor, way.line[1]), new THREE.Vector3(way.line[0], to.y, way.line[1]), to.clone()];
  const legs = [pts[0].distanceTo(pts[1]) / 1.2, pts[1].distanceTo(pts[2]) / 0.75, pts[2].distanceTo(pts[3]) / 1.2];
  walk.climb = { pts, legs, t: 0 };
  held.clear();
}
/** One frame on a ladder. */
function stepClimb(dt) {
  const w = walk, c = w.climb;
  c.t += dt;
  let t = c.t, leg = 0;
  while (leg < 2 && t > c.legs[leg]) t -= c.legs[leg++];
  const k = Math.min(1, c.legs[leg] > 1e-6 ? t / c.legs[leg] : 1);
  w.pos.lerpVectors(c.pts[leg], c.pts[leg + 1], k);
  w.floor = w.pos.y;
  if (leg === 2 && k >= 1) { w.climb = null; w.eye = eyeFor(w); }
  placeEye();
}
const climbBtn = $('#climb');
/** Show the Ladder button where there is one to take, named for where it leads. */
function showWay() {
  const here = !walk || walk.climb ? null : wayHere();
  const text = here ? (here.from === 'a' ? here.way.def.up : here.way.def.down) : '';
  if (climbBtn.hidden !== !here) climbBtn.hidden = !here;
  if (here && climbBtn.textContent !== text) climbBtn.textContent = climbBtn.title = text;
}
climbBtn.addEventListener('click', climb);

/** While walking: where the feet are, which way the head is turned, what is held down, and the outside view to go back to. */
/* walk is declared with the sea, above */
const held = new Set();
const stick = { x: 0, y: 0, id: null };
const walkBtn = $('#walk'), stickEl = $('#stick');
/** The level one stands on at each deck that can be walked: the floor most of its rooms share. */
function deckLevels() {
  const out = [];
  for (const d of decks) {
    if (!d.spaces.length || d.id === 'hull') continue;
    const count = new Map();
    for (const sp of d.spaces) count.set(sp.min[1], (count.get(sp.min[1]) || 0) + 1);
    out.push({ deck: d, y: [...count].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0] });
  }
  return out.sort((a, b) => a.y - b.y);
}
/**
 * Somewhere to stand in a room: near its middle, clear of what stands there. First on its own floor with room to walk,
 * then on whatever can be stood on there (a stair's treads, a flat laid over the frames), then with less room.
 */
function standIn(sp) {
  // A space that is not entered (the stowed ramp, a funnel's casing) names the place beside it where a walk begins.
  if (sp.stand) { const spot = standNear(sp.stand[0], sp.stand[2], sp.stand[1], 0.35, 0.9); if (spot) return spot; }
  const cx = (sp.min[0] + sp.max[0]) / 2, cz = (sp.min[2] + sp.max[2]) / 2, y = sp.min[1];
  return standNear(cx, cz, y, 0.35, 0.9, sp) || standNear(cx, cz, y + 0.1, 0.9, 0.9, sp)
    || standNear(cx, cz, y, 0.35, 0.3, sp) || standNear(cx, cz, y + 0.1, 0.9, 0.3, sp);
}
function enterWalk() {
  if (walk || !decks.length) return;
  // On foot she is whole: every deck shown and in its place, and nothing cut away.
  for (const d of decks) if (!d.node.visible) showDeck(d, true);
  explodeMove = null; move = null;
  if (state.explode) placeDecks(0);
  if (state.cut) setCut(0);
  showExplode(0); showCut(0);
  // Begin in the room that is chosen, else at the after end of the vehicle lanes, looking forward along the car deck.
  const chosen = state.selected && decks.find(d => d.id === state.selected.deck)?.spaces.find(sp => sp.id === state.selected.space);
  const car = decks.find(d => d.id === 'car'), lanes = car && car.spaces.find(sp => sp.id === 'car-deck');
  const start = (chosen && standIn(chosen)) || (lanes && standNear(0, lanes.min[2] + 1.5, lanes.min[1], 0.35, 0.9, lanes))
    || (car && car.spaces.map(standIn).find(Boolean)) || new THREE.Vector3(0, 2.1, 0);
  select(null);
  fillTravel();
  walk = {
    pos: start, floor: start.y, eye: EYE, yaw: Math.PI, pitch: 0, look: null, said: 0, room: null, climb: null,
    saved: { pos: camera.position.clone(), target: controls.target.clone(), fov: camera.fov, near: camera.near, panel: !panel.classList.contains('closed') },
  };
  controls.enabled = false;
  showSea();
  document.body.classList.add('walking');
  walkBtn.textContent = walkBtn.title = 'Leave'; walkBtn.setAttribute('aria-pressed', 'true');
  showFn(null, false); showHelp(true, 9000);
  camera.clearViewOffset(); camera.fov = WALK_LENS; camera.near = 0.07;
  setWalkZoom(walkZoom, true);
  walk.eye = eyeFor(walk);
  resizeWalk();
  placeEye();
  sayWhere();
}
function leaveWalk() {
  if (!walk) return;
  const s = walk.saved;
  walk = null; showWay(); held.clear(); stick.x = stick.y = 0; stick.id = null; stickEl.firstElementChild.style.transform = '';
  fingers.clear(); pinch = null; clearTimeout(zoomSaid);
  document.body.classList.remove('walking');
  walkBtn.textContent = walkBtn.title = 'Walk aboard'; walkBtn.setAttribute('aria-pressed', 'false');
  showFn(null, false); showHelp(false);
  camera.fov = s.fov; camera.near = s.near; camera.up.set(0, 1, 0);
  camera.position.copy(s.pos); controls.target.copy(s.target); controls.enabled = true;
  showSea();
  readout.textContent = '';
  measure(); applyLens(); controls.update(); redraw();
}
function resizeWalk() { camera.aspect = view.clientWidth / view.clientHeight; camera.updateProjectionMatrix(); }
/**
 * Looking closer and wider on foot (the owner, 11 November 2026: "I want to be able to zoom out and in on the walk
 * aboard"): two fingers pinched or spread, the wheel, or + and -; 0 is the normal view again. It is the lens that changes,
 * not where one stands: zoom 1 is the 68° one walks with, and it goes from about half (a wide lens, which a phone held
 * upright wants: at 68° it sees only 35° across) to nearly five times (to read a label across a room). Near 1 it settles
 * on 1. What was set is kept for the next walk.
 */
const WALK_LENS = 68, LENS_WIDE = 104, LENS_LONG = 16;
const halfTan = deg => Math.tan(THREE.MathUtils.degToRad(deg / 2));
const ZOOM_MIN = halfTan(WALK_LENS) / halfTan(LENS_WIDE), ZOOM_MAX = halfTan(WALK_LENS) / halfTan(LENS_LONG);
let walkZoom = 1, zoomSaid = 0;
const zoomShown = () => Math.abs(walkZoom - 1) < 0.06 ? 1 : walkZoom;
function setWalkZoom(zoom, quiet = false) {
  walkZoom = THREE.MathUtils.clamp(zoom, ZOOM_MIN, ZOOM_MAX);
  if (!walk) return;
  const z = zoomShown();
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(halfTan(WALK_LENS) / z));
  camera.updateProjectionMatrix();
  if (!quiet) {
    readout.textContent = z === 1 ? 'Zoom: normal' : `Zoom: ${z.toFixed(1)} ×`;
    clearTimeout(zoomSaid);
    zoomSaid = setTimeout(() => { if (walk) readout.textContent = walk.room || ''; }, 1400);
  }
  redraw();
}
const zoomWalk = factor => setWalkZoom(walkZoom * factor);
function placeEye() {
  camera.position.set(walk.pos.x, walk.pos.y + walk.eye, walk.pos.z);
  camera.rotation.set(walk.pitch, walk.yaw, 0, 'YXZ');
  redraw();
}
/**
 * How high the eye is carried at the feet's place: its own height, less under a low deckhead (0.12 m is kept over it)
 * and less where the head of a doorway is in the way (0.2 m under the lowest height at which the wall is met).
 */
function eyeFor(w) {
  const head = headroom(w.pos.x, w.pos.z, w.floor);
  // Never lower than a stoop: walking keeps the body where there is DUCK of room, so less is only met where one was put.
  return Math.max(CROUCH - 0.2, Math.min(EYE, head - 0.12, wallClear(w.pos.x, w.pos.z, w.floor, Math.min(EYE, head - 0.05)) - 0.2));
}
/** One frame on foot: turn, step, find the floor. */
function stepWalk(dt) {
  const w = walk;
  if (w.climb) { stepClimb(dt); showWay(); return; }
  let ahead = (held.has('KeyW') || held.has('ArrowUp') ? 1 : 0) - (held.has('KeyS') || held.has('ArrowDown') ? 1 : 0);
  let aside = (held.has('KeyD') ? 1 : 0) - (held.has('KeyA') ? 1 : 0);
  let speed = held.has('ShiftLeft') || held.has('ShiftRight') ? RUN : PACE;
  // The thumb-stick gives the way and the speed: a walk up to 0.7 of its reach, quickening to a run at its edge.
  const push = Math.hypot(stick.x, stick.y);
  if (push > 0.05) {
    ahead = -stick.y; aside = stick.x;
    speed = push < 0.7 ? PACE * push / 0.7 : PACE + (RUN - PACE) * Math.min(1, (push - 0.7) / 0.3);
  }
  const turn = (held.has('ArrowLeft') ? 1 : 0) - (held.has('ArrowRight') ? 1 : 0);
  let changed = false;
  if (turn) { w.yaw += turn * 1.7 * dt; changed = true; }
  const len = Math.hypot(ahead, aside);
  if (len > 1e-3) {
    ahead /= len; aside /= len;
    // The head looks along -z when yaw is 0: forward on the deck and to the right of it.
    const fx = -Math.sin(w.yaw), fz = -Math.cos(w.yaw), rx = Math.cos(w.yaw), rz = -Math.sin(w.yaw);
    // The way is gone in short strides, each finding its floor, so a stair is climbed tread by tread and a rail is
    // never stepped over, however fast one goes and however seldom the picture is drawn.
    const way = speed * dt, strides = Math.max(1, Math.ceil(way / STRIDE)), pace = way / strides;
    const dx = (fx * ahead + rx * aside) * pace, dz = (fz * ahead + rz * aside) * pace;
    for (let i = 0; i < strides; i++) {
      // The whole stride if there is floor and room to take it; else along one side of it, so an edge is slid along.
      let gone = false;
      for (const [sx, sz] of [[dx, dz], [dx, 0], [0, dz]]) {
        if (Math.abs(sx) + Math.abs(sz) < 1e-9) continue;
        // Where there is nothing to stand on, the foot reaches a little further: the first floor found within GAP decides.
        const reach = Math.hypot(sx, sz);
        for (let d = reach; d <= Math.max(reach, GAP); d = d < STRIDE ? STRIDE : d + STRIDE) {
          const x = w.pos.x + sx / reach * d, z = w.pos.z + sz / reach * d, y = footing(x, z, w.floor);
          if (y === null) continue;
          if (roomFor(x, z, y)) { w.pos.x = x; w.pos.z = z; w.floor = y; changed = gone = true; }
          break;
        }
        if (gone) break;
      }
      if (gone) continue;
      // Stopped by the wall beside a doorway one was making for, one is drawn to its middle: a stride along the wall.
      let drawn = false;
      for (const d of passages) {
        const across = d.axis === 0 ? w.pos.x : w.pos.z, along = d.axis === 0 ? w.pos.z : w.pos.x, going = d.axis === 0 ? dx : dz;
        const off = d.u - along;
        if ((d.at - across) * going <= 0 || Math.abs(d.at - across) > 0.9 || Math.abs(off) < 0.01 || Math.abs(off) > 0.55 || Math.abs(d.y - w.floor) > 0.6) continue;
        const side = Math.sign(off) * Math.min(Math.abs(off), pace), x = w.pos.x + (d.axis === 0 ? 0 : side), z = w.pos.z + (d.axis === 0 ? side : 0), y = footing(x, z, w.floor);
        if (y !== null && roomFor(x, z, y)) { w.pos.x = x; w.pos.z = z; w.floor = y; changed = drawn = true; }
        break;
      }
      if (!drawn) break;
    }
  }
  if (Math.abs(w.floor - w.pos.y) > 1e-4) { w.pos.y += (w.floor - w.pos.y) * Math.min(1, dt * 14); changed = true; }
  const eye = eyeFor(w);
  if (Math.abs(eye - w.eye) > 1e-4) { w.eye += (eye - w.eye) * Math.min(1, dt * 10); changed = true; }
  if (changed) placeEye();
  // Say where one is, a few times a second.
  const now = performance.now();
  if (now - w.said > 250) { w.said = now; sayWhere(); }
  showWay();
}
const WAIST = new THREE.Vector3();
/** Name the room one stands in, when it is another than the last one named (so a rudder order stays read until then). */
function sayWhere() {
  const at = roomAt(WAIST.set(walk.pos.x, walk.pos.y + 0.4, walk.pos.z)) || roomAt(camera.position);
  let text = at ? `${at.deck.name} · ${at.space.name}` : '';
  // Outside every room, the deck one stands on is named.
  if (!at) for (const l of deckLevels()) if (walk.pos.y >= l.y - 0.6) text = l.deck.name;
  if (text !== walk.room) { walk.room = text; readout.textContent = text; }
}
/** Go to the deck above (+1) or below (-1), over the same spot if there is floor there, else into one of its rooms. */
function hopDeck(by) {
  if (!walk || walk.climb) return;
  const levels = deckLevels();
  let here = 0;
  levels.forEach((l, i) => { if (walk.pos.y >= l.y - 0.6) here = i; });
  const to = levels[THREE.MathUtils.clamp(here + by, 0, levels.length - 1)];
  if (!to || to === levels[here]) return;
  const spot = standNear(walk.pos.x, walk.pos.z, to.y, 0.5, 0.9) || to.deck.spaces.map(standIn).find(Boolean);
  if (!spot) return;
  walk.pos.copy(spot); walk.floor = spot.y; walk.eye = eyeFor(walk);
  placeEye();
  sayWhere();
}
// Looking round: drag anywhere on the model.
function lookStart(e) {
  if (walk.look !== null) return;
  walk.look = { id: e.pointerId, x: e.clientX, y: e.clientY };
  try { renderer.domElement.setPointerCapture?.(e.pointerId); } catch { /* a pointer that cannot be captured still looks round */ }
}
function lookMove(e) {
  const l = walk.look;
  if (!l || l.id !== e.pointerId) return;
  const k = LOOK / Math.max(1, zoomShown());                       // looking closer, the same drag turns one less
  walk.yaw -= (e.clientX - l.x) * k; walk.pitch = THREE.MathUtils.clamp(walk.pitch - (e.clientY - l.y) * k, -1.45, 1.45);
  l.x = e.clientX; l.y = e.clientY;
  placeEye();
}
function lookEnd(e) { if (walk && walk.look && walk.look.id === e.pointerId) walk.look = null; }
// The thumb-stick: where the thumb is from the ring's middle is how fast and which way.
function stickAt(e) {
  const r = stickEl.getBoundingClientRect(), half = r.width / 2;
  let x = (e.clientX - r.left - half) / half, y = (e.clientY - r.top - half) / half;
  const len = Math.hypot(x, y);
  if (len > 1) { x /= len; y /= len; }
  stick.x = x; stick.y = y;
  stickEl.firstElementChild.style.transform = `translate(${x * half * 0.6}px, ${y * half * 0.6}px)`;
}
stickEl.addEventListener('pointerdown', e => { stick.id = e.pointerId; stickEl.setPointerCapture(e.pointerId); stickAt(e); e.preventDefault(); });
stickEl.addEventListener('pointermove', e => { if (stick.id === e.pointerId) stickAt(e); });
for (const type of ['pointerup', 'pointercancel']) stickEl.addEventListener(type, e => {
  if (stick.id !== e.pointerId) return;
  stick.id = null; stick.x = stick.y = 0; stickEl.firstElementChild.style.transform = '';
});
walkBtn.addEventListener('click', () => walk ? leaveWalk() : enterWalk());
/**
 * Quick travel on foot (the owner, 11 November 2026: "In the free walk add quick travel to the decks", and: "I want to
 * explore every deck and every room"). The list in the bar names every deck and, under it, every room of it. A deck puts
 * one on it nearest to where one stands; a room puts one in it. The keys 1 to 5 are the decks, from the lowest up.
 */
const travel = $('#travel');
function fillTravel() {
  while (travel.children.length > 1) travel.lastChild.remove();
  for (const level of deckLevels().reverse()) {
    const group = document.createElement('optgroup');
    group.label = level.deck.name;
    group.append(new Option(`${level.deck.name}, nearest place`, `deck:${level.deck.id}`));
    for (const sp of level.deck.spaces) group.append(new Option(sp.name, `room:${level.deck.id}:${sp.id}`));
    travel.append(group);
  }
}
function travelTo(value) {
  if (!walk || walk.climb || !value) return false;
  const [kind, deckId, roomId] = value.split(':');
  const level = deckLevels().find(l => l.deck.id === deckId);
  if (!level) return false;
  const room = kind === 'room' ? level.deck.spaces.find(sp => sp.id === roomId) : null;
  const spot = kind === 'room' ? room && standIn(room)
    : standNear(walk.pos.x, walk.pos.z, level.y, 0.5, 0.9) || level.deck.spaces.map(standIn).find(Boolean);
  if (!spot) { readout.textContent = `There is nowhere to stand in ${room ? room.name : level.deck.name} yet.`; return false; }
  walk.pos.copy(spot); walk.floor = spot.y; walk.eye = eyeFor(walk);
  placeEye();
  sayWhere();
  return true;
}
travel.addEventListener('change', () => { travelTo(travel.value); travel.value = ''; travel.blur(); });
$('#deck-up').addEventListener('click', () => hopDeck(1));
$('#deck-down').addEventListener('click', () => hopDeck(-1));

// ---------- the keyboard ----------
const typing = e => /^(INPUT|SELECT|TEXTAREA|BUTTON|SUMMARY|A)$/.test(e.target.tagName);
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (walk) {
    if (e.code === 'Escape') { leaveWalk(); return; }
    if (e.code === 'KeyE' || e.code === 'PageUp') { hopDeck(1); e.preventDefault(); return; }
    if (e.code === 'KeyQ' || e.code === 'PageDown') { hopDeck(-1); e.preventDefault(); return; }
    if (e.code === 'KeyF') { climb(); e.preventDefault(); return; }
    if (!typing(e) && (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd')) { zoomWalk(1.25); e.preventDefault(); return; }
    if (!typing(e) && (e.key === '-' || e.code === 'NumpadSubtract')) { zoomWalk(0.8); e.preventDefault(); return; }
    if (!typing(e) && (e.code === 'Digit0' || e.code === 'Numpad0')) { setWalkZoom(1); e.preventDefault(); return; }
    if (/^Digit[1-9]$/.test(e.code) && !typing(e)) { const level = deckLevels()[+e.code.slice(5) - 1]; if (level) travelTo(`deck:${level.deck.id}`); e.preventDefault(); return; }
    if (/^(Key[WASD]|Arrow(Up|Down|Left|Right)|Shift(Left|Right))$/.test(e.code)) { held.add(e.code); if (/^Arrow/.test(e.code)) e.preventDefault(); }
    return;
  }
  if (typing(e) || !decks.length) return;
  const step = Math.PI / 24;
  if (e.code === 'ArrowLeft') nudgeView(-step, 0, 1);
  else if (e.code === 'ArrowRight') nudgeView(step, 0, 1);
  else if (e.code === 'ArrowUp') nudgeView(0, -step, 1);
  else if (e.code === 'ArrowDown') nudgeView(0, step, 1);
  else if (e.key === '+' || e.key === '=') nudgeView(0, 0, 0.85);
  else if (e.key === '-' || e.key === '_') nudgeView(0, 0, 1 / 0.85);
  else if (e.code === 'Home') home();
  else return;
  e.preventDefault();
});
addEventListener('keyup', e => held.delete(e.code));
addEventListener('blur', () => held.clear());

// ---------- the panel ----------
function buildPanel(header) {
  const list = $('#decks');
  list.replaceChildren();
  for (const id of TOP_DOWN) {
    const deck = decks.find(d => d.id === id);
    if (!deck) continue;
    const check = el('input', { type: 'checkbox', checked: true });
    check.setAttribute('aria-label', `Show the ${deck.name.toLowerCase()}`);
    check.addEventListener('change', () => showDeck(deck, check.checked));
    const name = el('button', { type: 'button', className: 'pick deck-name' }, deck.name);
    name.addEventListener('click', () => {
      if (!deck.node.visible) showDeck(deck, true);
      frameBox(deck.box.clone().translate(deck.node.position), eyeDir(), 520);
    });
    const rooms = el('ul');
    for (const sp of deck.spaces) {
      const b = el('button', { type: 'button', className: 'pick room' }, sp.name);
      b.dataset.deck = deck.id; b.dataset.space = sp.id;
      b.setAttribute('aria-expanded', 'false');
      b.addEventListener('click', () => select(deck.id, sp.id, { frame: true }));
      rooms.append(el('li', {}, b));
    }
    deck.row = el('div', { className: 'deck' },
      el('div', { className: 'deck-row' }, check, name),
      el('p', { className: 'level muted' }, deck.level),
      el('details', {}, el('summary', {}, deck.spaces.length === 1 ? '1 space' : `${deck.spaces.length} spaces`), rooms));
    list.append(deck.row);
  }
  const s = header.source, ship = header.ship;
  const from = `the Johansson Town source at commit ${s.commit}${s.uncommitted ? ' with later changes' : ''}`;
  // What is her own so far (ship.built, written by blender/assemble.py), and what is still drawn from the other ship.
  const built = ship.built || [], own = built.map(b => b.section.toLowerCase());
  const said = own.length > 1 ? `${own.slice(0, -1).join(', ')} and ${own[own.length - 1]} are` : `${own[0]} is`;
  // What each section is, from the file (`what`): the hull from her lines, the compass deck and its mast, and so on.
  const what = built.map(b => b.what).filter(Boolean).join('; ');
  // The file says what she is and how far she is built (ship.note, written by blender/assemble.py).
  if (ship.note) { list.append(el('p', { className: 'source' }, ship.note)); return; }
  list.append(el('p', { className: 'source' }, !ship.drawnFrom
    ? `${ship.name}, ${ship.length} m long. Drawn from ${from}.`
    : own.length
      ? `${ship.name}, ${ship.length} m long, a new ship in the making. Her ${said} her own, built in Blender: ${what || 'drawn from her lines'}. The rest is for now the ${ship.drawnFrom}'s drawing, from ${from}, so some notes still speak of that ship's crew and route. It is rebuilt section by section.`
      : `${ship.name}, ${ship.length} m long. A first look: she is a new ship in the making, and for now her drawing is the ${ship.drawnFrom}'s, from ${from}, so some notes still speak of that ship's crew and route. Her own build, section by section from the working drawings, comes next.`));
}

function setPanel(open) {
  keepFraming(() => {
    panel.classList.toggle('closed', !open);
    toggle.setAttribute('aria-expanded', String(open));
    measure(); applyLens();
  });
}
toggle.addEventListener('click', () => setPanel(panel.classList.contains('closed')));

$('#explode').addEventListener('click', e => { const k = e.target.closest('.key'); if (k && !walk) setExplode(Number(k.dataset.v) / 100, { animate: true }); });
$('#cut').addEventListener('click', e => { const k = e.target.closest('.key'); if (k) setCut(k.dataset.by ? state.cut + Number(k.dataset.by) / 100 : Number(k.dataset.v) / 100); });
$('#home').addEventListener('click', () => home());

// ---------- size and frames ----------
function resize() {
  const W = view.clientWidth, H = view.clientHeight;
  if (!W || !H) return;
  renderer.setSize(W, H, false);
  drawing.setSize(W, H);
  if (walk) { resizeWalk(); redraw(); return; }
  if (decks.length) keepFraming(() => { measure(); applyLens(); });
  else { measure(); applyLens(); }
  redraw();
}
new ResizeObserver(resize).observe(view);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { tintMark(); systems && systems.tint(); });

// ---------- the panel's two lists, and the card ----------
const tabs = [...document.querySelectorAll('.tabs [role=tab]')];
function showTab(id) {
  for (const t of tabs) {
    const on = t.getAttribute('aria-controls') === id;
    t.setAttribute('aria-selected', String(on));
    $('#' + t.getAttribute('aria-controls')).hidden = !on;
  }
}
for (const t of tabs) t.addEventListener('click', () => showTab(t.getAttribute('aria-controls')));
/** The card stands just over the bar, wherever the bar is; on a narrow screen it has the model to itself, so the list is put away. */
function placeCard() {
  if (card.hidden) return;
  if (narrow.matches && !walk && !panel.classList.contains('closed')) setPanel(false);
  card.style.bottom = `${Math.round(innerHeight - bar.getBoundingClientRect().top + 8)}px`;
}
addEventListener('resize', placeCard);
panel.addEventListener('transitionend', placeCard);

const ease = t => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
let lastFrame = 0;
let seaDrawn = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - lastFrame) / 1000 || 0, 0.25);
  lastFrame = now;
  workAuto(dt);
  workSteps(dt);
  workOrders(dt);
  // The sea and the clouds move, thirty times a second at most (not at all for whoever asked for less motion).
  if (afloat() && !lite && !still.matches && !document.hidden && now - seaDrawn > 33) { day.time.value = now / 1000; seaDrawn = now; dirty = true; }
  // The eye opens in a room and closes on deck.
  if (drawing.expose(dt, camera.position)) dirty = true;
  if (walk) {
    stepWalk(dt);
    if (walk && walk.pos.distanceToSquared(sunAt) > 16) fitSun();
    if (dirty) { draw(); dirty = false; }
    return;
  }
  // Close to, the lens must see nearer: the near plane follows the distance to what she turns about.
  const near = THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * 0.03, 0.05, 0.4);
  if (Math.abs(near - camera.near) > camera.near * 0.2) { camera.near = near; camera.updateProjectionMatrix(); dirty = true; }
  if (explodeMove) {
    const k = Math.min((now - explodeMove.t0) / explodeMove.ms, 1), t = explodeMove.from + (explodeMove.to - explodeMove.from) * ease(k);
    if (k >= 1) explodeMove = null;
    keepFraming(() => placeDecks(t));
  }
  if (move) {
    const k = Math.min((now - move.t0) / move.ms, 1), e = ease(k);
    controls.target.lerpVectors(move.from.target, move.to.target, e);
    camera.position.lerpVectors(move.from.pos, move.to.pos, e);
    if (k >= 1) move = null;
    dirty = true;
  }
  if (controls.update() || dirty) { draw(); dirty = false; }
}

// ---------- start ----------
async function start() {
  const doc = await loadDocument(DOCS[0].file);
  // Her sheet of pictures (the file may name more than one): her screens, dials, panel faces and signs.
  const atlases = await Promise.all((doc.header.atlases || [doc.header.atlas]).map(async a => {
    const t = await new THREE.TextureLoader().loadAsync('./data/' + a.file);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }));
  // The light of every place aboard (blender/light.py). Without it she is lit as she was, evenly, by the sky.
  try {
    const lit = await fetchPacked('./data/light.bin.gz', 'JLV1');
    light.set(lit.header, lit.bytes.subarray(8 + lit.length));
    lightSun();
    scene.environment = sky.env(renderer);
  } catch (err) { console.warn('Her light could not be read: she is lit evenly.', err); }
  build(doc, atlases);
  indexFloors();
  buildWays(doc.header);
  buildPanel(doc.header);
  buildInputs(doc.header);
  // Her systems, when the file names its register: the panel's second list and the card.
  if (doc.header.systems) {
    try {
      const res = await fetch('./data/' + doc.header.systems.file);
      if (!res.ok) throw new Error(String(res.status));
      systems = createSystems({
        data: await res.json(), decks: () => decks, list: $('#systems'), card, readout, flyTo, eyeDir, redraw, accent,
        walking: () => !!walk, onChange: () => requestAnimationFrame(placeCard),
      });
    } catch (err) { console.error(err); $('#systems').append(el('p', { className: 'lede muted' }, 'Her systems could not be read.')); }
  } else $('#tab-systems').hidden = true;
  tintMark();
  // On a phone the panel is a sheet over the lower half: she is shown whole first, the list a tap away.
  panel.classList.toggle('closed', narrow.matches);
  toggle.setAttribute('aria-expanded', String(!narrow.matches));
  document.body.classList.add('ready');
  renderer.setSize(view.clientWidth, view.clientHeight, false);
  drawing.setSize(view.clientWidth, view.clientHeight);
  measure(); applyLens();
  home(0);
  requestAnimationFrame(frame);
  // For checks and pictures: the same moves the controls make.
  window.__ferry = {
    setExplode, setCut, setInput, home, select, showDeck: (id, on) => showDeck(decks.find(d => d.id === id), on), setPanel, identify,
    lookFrom, focusAt, enterWalk, leaveWalk, hopDeck, floorAt, showTab, nameOnFoot, get systems() { return systems; },
    zoomWalk, setWalkZoom, get walkZoom() { return zoomShown(); }, zoomLimits: [ZOOM_MIN, ZOOM_MAX],
    /** For checks: the room the walker stands in, named now (the readout is written as the walk goes). */
    whereOnFoot: () => { if (!walk) return ''; sayWhere(); return walk.room; },
    /** For checks: put the walker somewhere, or hold a key down. */
    walkTo: (x, z, yaw = Math.PI, pitch = 0, level = walk && walk.floor) => { if (!walk) return null; const under = floorAt(x, z, level + 0.6, level - 3); if (under === null) return null; const y = footing(x, z, under); walk.pos.set(x, y, z); walk.floor = y; walk.eye = eyeFor(walk); walk.yaw = yaw; walk.pitch = pitch; placeEye(); return y; },
    hold: (code, on = true) => { on ? held.add(code) : held.delete(code); },
    /** For checks: the walk of so many seconds, gone at once (60 pictures a second), whatever this machine can draw. */
    walkFor: seconds => { for (let t = 0; walk && t < seconds - 1e-9; t += 1 / 60) stepWalk(1 / 60); },
    roomFor, headroom, wallClear, workAuto, footing, climb, travelTo,
    /** For checks: what quick travel offers, as the list in the bar has it. */
    get travels() { return [...travel.querySelectorAll('option')].filter(o => o.value).map(o => ({ value: o.value, name: o.textContent })); },
    get ways() { return ways.map(w => ({ id: w.def.id, a: w.a.toArray(), b: w.b.toArray() })); },
    /** For checks: leave a door open or shut, as a tap would. */
    work: (id, open) => { const it = inputs.get(id); if (it && it.def.auto) it.open = open; },
    /** For checks: her stairs, as the file says them (README: `stairs`). */
    get stairs() { return stairList; },
    /** For checks: her particulars, as the file says them (half her length turns metres from the transom into z). */
    ship: doc.header.ship,
    step: id => stepInput(id),
    control: id => { const it = inputs.get(id); return it && { value: it.value, want: it.want, at: it.at, steps: it.def.steps, fitting: it.def.fitting }; },
    movers: () => movers.map(m => ({ id: m.def.id, input: m.def.input, matrix: m.node.matrix.toArray() })),
    get spaces() { return decks.flatMap(d => d.spaces.map(sp => ({ deck: d.id, id: sp.id, name: sp.name, min: sp.min, max: sp.max, stand: sp.stand || null }))); },
    look: { renderer, scene, sun, floor, camera, controls, get materials() { return materials; }, fitSun, redraw },
    get state() { return { ...state, walk: walk && { x: walk.pos.x, y: walk.pos.y, z: walk.pos.z, eye: walk.eye, yaw: walk.yaw, pitch: walk.pitch, room: readout.textContent, climbing: !!walk.climb, ladder: climbBtn.hidden ? null : climbBtn.textContent }, floors: floors.tris.length / 9, heads: heads.tris.length / 9, walls: walls.tris.length / 9, doorways: doorways.length, inputs: Object.fromEntries([...inputs].map(([id, it]) => [id, it.value])), decks: decks.map(d => ({ id: d.id, shown: d.node.visible, spaces: d.spaces.length })), moving: !!(move || explodeMove) }; },
  };
}
start().catch(err => {
  console.error(err);
  statusLine.textContent = err && err.message ? err.message : 'The ferry could not be shown.';
});
