/**
 * The ferry viewer: the Christina, turned, taken apart deck by deck and cut open.
 *
 * She is the lead ship of a new design. For now her drawing is the Minato Maru's, the ferry of Johansson Town, renamed:
 * the model is not made here but exported from the game's own source (nj22az/johansson-town,
 * tools/ferry-viewer-export.mjs) into data/ferry.bin.gz and data/ferry-atlas.webp; this page only reads and shows it.
 * The file format (JMF1), and what this page changes in the look of what it reads, are described in README.md.
 *
 * The look is this page's own: daylight, one sun with shadows, a sky to reflect. The game's cartoon look does not bind it.
 */
import * as THREE from 'three';
import { OrbitControls } from '/motor-90l/vendor/OrbitControls.js';

const $ = (s, el = document) => el.querySelector(s);
const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };
const view = $('#view'), statusLine = $('#status'), panel = $('#panel'), toggle = $('#panel-toggle'), bar = $('#bar'), readout = $('#what');
const narrow = matchMedia('(max-width: 900px)');
const still = matchMedia('(prefers-reduced-motion: reduce)');

/** What can be shown. One document today; a second (the main engine, part by part) is planned. */
const DOCS = [{ id: 'ship', name: 'Ship', file: './data/ferry.bin.gz' }];
/** The order the decks are listed in: as she stands, top to bottom. */
const TOP_DOWN = ['top', 'bridge', 'passenger', 'car', 'machinery', 'hull'];

// ---------- reading the file ----------
async function loadDocument(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`The ferry's file could not be fetched (${res.status}).`);
  let bytes = new Uint8Array(await res.arrayBuffer());
  // The file is kept gzipped. A server may already have unpacked it on the way, so look before unpacking.
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    if (typeof DecompressionStream !== 'function') throw new Error('This browser cannot unpack the ferry (it has no DecompressionStream). A current Safari, Chrome, Edge or Firefox can.');
    bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  }
  if (String.fromCharCode(...bytes.subarray(0, 4)) !== 'JMF1') throw new Error("The ferry's file is not in the format this page reads.");
  const length = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true);
  const header = JSON.parse(new TextDecoder().decode(bytes.subarray(8, 8 + length)));
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

function materialOf(m, atlas) {
  const common = {
    vertexColors: true, side: m.side === 'double' ? THREE.DoubleSide : THREE.FrontSide,
    transparent: m.transparent, opacity: m.opacity, depthWrite: m.depthWrite, alphaTest: m.alphaTest, map: m.textured ? atlas : null,
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
    // Window glass, seen from outside by day: dark, and it shows the sky.
    mat = lit(GLASS);
    mat.userData.glass = true;
  } else mat = lit();
  mat.userData.side = mat.side;
  return mat;
}
const GLASS = { opacity: 0.62, metalness: 0.55, roughness: 0.06 };

// ---------- renderer, scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.localClippingEnabled = true;
// Shadows are drawn again only when something that casts them moves: turning the camera costs nothing.
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;
view.appendChild(renderer.domElement);

const scene = new THREE.Scene();

/** From the ship toward the sun: over her starboard side, the side she is first seen from, and a little ahead of the beam.
 *  Across her rather than along her, so that with the decks lifted apart each one still has its near half in the sun. */
const SUN_DIR = new THREE.Vector3(-0.6, 0.72, 0.36).normalize();

/** The sky she reflects and is filled by: a clear day made here, blue overhead, pale at the horizon, a glow toward the sun
 *  (the sun itself is the lamp below, so it is not painted twice), warm grey underfoot. No picture is fetched for it. */
function daylight() {
  const sky = new THREE.Scene();
  const paint = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: { sun: { value: SUN_DIR } },
    vertexShader: 'varying vec3 d; void main() { d = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `varying vec3 d; uniform vec3 sun;
      void main() {
        vec3 n = normalize(d);
        vec3 zenith = vec3(0.30, 0.52, 0.95), horizon = vec3(0.86, 0.92, 1.0), ground = vec3(0.36, 0.34, 0.31);
        vec3 c = n.y > 0.0 ? mix(horizon, zenith, pow(n.y, 0.55)) : mix(horizon * 0.8, ground, pow(min(-n.y * 4.0, 1.0), 0.6));
        c += vec3(1.0, 0.93, 0.82) * pow(max(dot(n, sun), 0.0), 12.0) * 0.6;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), paint);
  sky.add(dome);
  const pmrem = new THREE.PMREMGenerator(renderer), env = pmrem.fromScene(sky, 0.02).texture;
  pmrem.dispose(); paint.dispose(); dome.geometry.dispose();
  return env;
}
scene.environment = daylight();
scene.environmentIntensity = 1;

const sun = new THREE.DirectionalLight(0xfff1dc, 3);
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
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2.5;
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
const state = { explode: 0, cut: 0, selected: null };
const root = new THREE.Group();
scene.add(root);

/** The cut: a plane along her length. What is to starboard of it is taken away, the side she is first seen from. */
const cutPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
let cutSpan = [-4.6, 3.6];

function build(doc, atlas) {
  const { header } = doc, viewDef = header.views[0];
  materials = header.materials.map(m => materialOf(m, atlas));
  cutSpan = [header.bounds.min[0] - 0.05, header.bounds.max[0] - 1.0];
  floor.position.y = header.bounds.min[1] - 0.02;
  decks = viewDef.groups.map(g => {
    const node = new THREE.Group(); node.name = g.id;
    const box = new THREE.Box3();
    for (const rec of g.meshes) {
      const mesh = new THREE.Mesh(geometryOf(rec, doc), materials[rec.material]);
      // Glass and painted markings are drawn after the solid things they lie on, and throw no shadow of their own.
      const clear = header.materials[rec.material].transparent;
      if (clear) mesh.renderOrder = 1;
      mesh.castShadow = !clear; mesh.receiveShadow = true;
      node.add(mesh); box.union(mesh.geometry.boundingBox);
    }
    root.add(node);
    return { id: g.id, name: g.name, level: g.level, lift: new THREE.Vector3(...g.explode), node, box, spaces: g.spaces };
  });
  fitSun();
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
function fitSun() {
  const box = shownBox();
  if (box.isEmpty()) return;
  box.min.y = Math.min(box.min.y, floor.position.y);
  const c = box.getCenter(new THREE.Vector3());
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  const take = p => {
    const x = p.dot(SX), y = p.dot(SY), z = p.dot(SUN_DIR);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); z0 = Math.min(z0, z); z1 = Math.max(z1, z);
  };
  for (let i = 0; i < 8; i++) {
    SP.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
    const fall = (SP.y - floor.position.y) / SUN_DIR.y;
    take(SP.sub(c));
    // Where this corner's shadow reaches the ground: further from the sun, on the same ray.
    take(SP.addScaledVector(SUN_DIR, -fall));
  }
  const far = 150, margin = 1, lens = sun.shadow.camera;
  sun.position.copy(c).addScaledVector(SUN_DIR, far);
  sun.target.position.copy(c);
  lens.left = x0 - margin; lens.right = x1 + margin; lens.bottom = y0 - margin; lens.top = y1 + margin;
  lens.near = far - z1 - margin; lens.far = far - z0 + margin;
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

let explodeMove = null;
function placeDecks(t) {
  state.explode = t;
  for (const d of decks) d.node.position.copy(d.lift).multiplyScalar(t);
  // Lifted apart, each deck stands in the shadow of the one above: the shadows are let up, so the rooms can still be read.
  sun.shadow.intensity = 1 - SHADE_LET_UP * t;
  fitSun();
}
const SHADE_LET_UP = 0.4;
function setExplode(t, { animate = false } = {}) {
  t = THREE.MathUtils.clamp(t, 0, 1);
  $('#explode').value = String(Math.round(t * 100));
  if (animate && !still.matches) { explodeMove = { from: state.explode, to: t, t0: performance.now(), ms: 520 }; return; }
  explodeMove = null;
  keepFraming(() => placeDecks(t));
}

function setCut(t) {
  t = THREE.MathUtils.clamp(t, 0, 1);
  const was = state.cut > 0, is = t > 0;
  state.cut = t;
  $('#cut').value = String(Math.round(t * 100));
  cutPlane.constant = -(cutSpan[0] + (cutSpan[1] - cutSpan[0]) * t);
  if (was !== is) for (const m of materials) {
    // Cut open, the insides of plates are seen: draw both faces while the cut is on. What is cut away throws no shadow.
    // A picture (her name, a sign, a dial) is paint on one face: it keeps that face, or it would read mirrored from behind.
    m.clippingPlanes = is ? [cutPlane] : null;
    m.clipShadows = is;
    m.side = is && !m.map ? THREE.DoubleSide : m.userData.side;
    m.needsUpdate = true;
  }
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
  for (const n of panel.querySelectorAll('.note')) n.remove();
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
    if (state.explode < 0.6) { explodeMove = null; placeDecks(1); $('#explode').value = '100'; }
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
  if (!hit) { select(null); return; }
  const deck = decks.find(d => d.node === hit.object.parent);
  const p = hit.point.clone().sub(deck.node.position);
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

let down = null;
renderer.domElement.addEventListener('pointerdown', e => { move = null; down = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!down || down.id !== e.pointerId) return;
  const tap = Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6 && performance.now() - down.t < 500;
  down = null;
  if (tap) identify(e.clientX, e.clientY);
});
renderer.domElement.addEventListener('pointercancel', () => { down = null; });
renderer.domElement.addEventListener('wheel', () => { move = null; }, { passive: true });

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
  list.append(el('p', { className: 'source' }, ship.drawnFrom
    ? `${ship.name}, ${ship.length} m long. A first look: she is a new ship in the making, and for now her drawing is the ${ship.drawnFrom}'s, from ${from}, so some notes still speak of that ship's crew and route. Her own build, section by section from the working drawings, comes next.`
    : `${ship.name}, ${ship.length} m long. Drawn from ${from}.`));
}

function setPanel(open) {
  keepFraming(() => {
    panel.classList.toggle('closed', !open);
    toggle.setAttribute('aria-expanded', String(open));
    measure(); applyLens();
  });
}
toggle.addEventListener('click', () => setPanel(panel.classList.contains('closed')));

$('#explode').addEventListener('input', e => setExplode(Number(e.target.value) / 100));
$('#cut').addEventListener('input', e => setCut(Number(e.target.value) / 100));
$('#home').addEventListener('click', () => home());

// ---------- size and frames ----------
function resize() {
  const W = view.clientWidth, H = view.clientHeight;
  if (!W || !H) return;
  renderer.setSize(W, H, false);
  if (decks.length) keepFraming(() => { measure(); applyLens(); });
  else { measure(); applyLens(); }
  redraw();
}
new ResizeObserver(resize).observe(view);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', tintMark);

const ease = t => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
function frame(now) {
  requestAnimationFrame(frame);
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
  if (controls.update() || dirty) { renderer.render(scene, camera); dirty = false; }
}

// ---------- start ----------
async function start() {
  const doc = await loadDocument(DOCS[0].file);
  const atlas = await new THREE.TextureLoader().loadAsync('./data/' + doc.header.atlas.file);
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.anisotropy = renderer.capabilities.getMaxAnisotropy();
  build(doc, atlas);
  buildPanel(doc.header);
  tintMark();
  // On a phone the panel is a sheet over the lower half: she is shown whole first, the list a tap away.
  panel.classList.toggle('closed', narrow.matches);
  toggle.setAttribute('aria-expanded', String(!narrow.matches));
  document.body.classList.add('ready');
  renderer.setSize(view.clientWidth, view.clientHeight, false);
  measure(); applyLens();
  home(0);
  requestAnimationFrame(frame);
  // For checks and pictures: the same moves the controls make.
  window.__ferry = {
    setExplode, setCut, home, select, showDeck: (id, on) => showDeck(decks.find(d => d.id === id), on), setPanel, identify,
    look: { renderer, scene, sun, floor, camera, controls, get materials() { return materials; }, fitSun, redraw },
    get state() { return { ...state, decks: decks.map(d => ({ id: d.id, shown: d.node.visible, spaces: d.spaces.length })), moving: !!(move || explodeMove) }; },
  };
}
start().catch(err => {
  console.error(err);
  statusLine.textContent = err && err.message ? err.message : 'The ferry could not be shown.';
});
