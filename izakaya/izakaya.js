// Minato izakaya, the night of the toast: the studio's Blender scene (jojo 3d/cast/web_izakaya.py) with its light
// worked out in Cycles and painted into every surface, so the page only shows it. The jugs' glass and beer are drawn
// live (their look depends on where one stands). Walk the floor a visitor could walk; look round by dragging.
import * as THREE from 'three';
import {GLTFLoader} from '/johansson-town/vendor/GLTFLoader.js';
import {DRACOLoader} from './vendor/DRACOLoader.js';

const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: 'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;   // (the textures already hold the still's look: AgX, as Blender saved them)
const scene = new THREE.Scene();
scene.background = new THREE.Color('#141821');
const camera = new THREE.PerspectiveCamera(40, 1, 0.03, 80);
camera.rotation.order = 'YXZ';

// Blender (x, y, z) to three.js (x, z, -y), as the glTF exporter turns them
const fromBlender = ([x, y, z]) => new THREE.Vector3(x, z, -y);

const info = await fetch('walk.json').then(r => r.json());
const walkBits = Uint8Array.from(atob(info.walk), c => c.charCodeAt(0));
const [nx, ny] = info.size;
// can one stand at Blender (x, y)? (the grid from the studio: the floor less what stands on it, a body's width kept)
function walkable(x, y) {
  const i = Math.floor((x - info.origin[0]) / info.cell), j = Math.floor((y - info.origin[1]) / info.cell);
  if (i < 0 || j < 0 || i >= nx || j >= ny) return false;
  const k = j * nx + i;
  return (walkBits[k >> 3] >> (7 - (k & 7))) & 1;
}

// the opening view: the still's camera, its lens across the screen's width (or a wide enough view on a tall phone)
const start = {pos: fromBlender(info.start.pos), look: fromBlender(info.start.look)};
const hfov = 2 * Math.atan(18 / info.start.lens);
let yaw = 0, pitch = 0;
function toStart() {
  camera.position.copy(start.pos);
  const d = start.look.clone().sub(start.pos).normalize();
  yaw = Math.atan2(-d.x, -d.z);
  pitch = Math.asin(d.y);
  dirty = true;
}
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const v = 2 * Math.atan(Math.tan(hfov / 2) / camera.aspect);
  camera.fov = THREE.MathUtils.radToDeg(Math.min(v, THREE.MathUtils.degToRad(64)));
  camera.updateProjectionMatrix();
  dirty = true;
}
let dirty = true;
addEventListener('resize', resize);
resize();
toStart();

// ---- loading -------------------------------------------------------------------------------------------------------
const manager = new THREE.LoadingManager();
// a phone's textures half the size (a quarter of the memory): on a touch screen, unless ?full (?half on any screen)
const half = params.has('half') || (!params.has('full') && matchMedia('(pointer: coarse)').matches);
if (half) manager.setURLModifier(url => url.replace('/tex/', '/tex-half/'));
manager.onProgress = (url, done, total) => { $('#bar').style.width = `${Math.round(100 * done / total)}%`; };
const draco = new DRACOLoader(manager);
draco.setDecoderPath('./vendor/draco/');
draco.setDecoderConfig({type: 'wasm'});
const loader = new GLTFLoader(manager);
loader.setDRACOLoader(draco);
const aniso = renderer.capabilities.getMaxAnisotropy();
const [room, live] = await Promise.all([loader.loadAsync('scene.gltf'), loader.loadAsync('live.gltf')]);
let triangles = 0;
room.scene.traverse(o => {
  if (!o.isMesh) return;
  const map = o.material.map;
  if (map) { map.anisotropy = aniso; map.colorSpace = THREE.SRGBColorSpace; }
  // (the marks laid on the room, cracks, scuffs, rings, drawn over it: see-through where their alpha says)
  const mark = o.material.transparent;
  o.material = new THREE.MeshBasicMaterial({map, color: map ? 0xffffff : o.material.color, transparent: mark,
    depthWrite: !mark, polygonOffset: mark, polygonOffsetFactor: -2, polygonOffsetUnits: -2});
  triangles += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
});
scene.add(room.scene);

// the glass and the beer, lit by the room itself (a cube photographed once where the three sit)
const cube = new THREE.WebGLCubeRenderTarget(256, {type: THREE.HalfFloatType});
const cubeCam = new THREE.CubeCamera(0.05, 40, cube);
cubeCam.position.copy(fromBlender([-1.9, 0.6, 1.05]));
scene.add(cubeCam);
cubeCam.update(renderer, scene);
const glass = new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.05, metalness: 0, envMap: cube.texture,
  envMapIntensity: 1.4, transparent: true, opacity: 0.22, depthWrite: false});
const beer = new THREE.MeshStandardMaterial({color: 0xe7a43c, emissive: 0xa2621a, emissiveIntensity: 0.6, roughness: 0.12,
  metalness: 0, envMap: cube.texture, envMapIntensity: 0.8, transparent: true, opacity: 0.9});
live.scene.traverse(o => {
  if (!o.isMesh) return;
  const isBeer = /beer/i.test(o.name) || /beer/i.test(o.parent?.name || '');
  o.material = isBeer ? beer : glass;
  o.renderOrder = isBeer ? 1 : 2;
  triangles += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
});
scene.add(live.scene);
$('#loading').classList.add('done');
dirty = true;

// ---- moving round ------------------------------------------------------------------------------------------------
const touchy = matchMedia('(pointer: coarse)').matches;
const hint = $('#hint');
hint.textContent = touchy ? 'Left thumb to walk · drag to look round' : 'Drag to look round · W A S D or the arrow keys to walk';
let hintTimer = setTimeout(() => hint.classList.add('gone'), 7000);
$('#reset').addEventListener('click', toStart);

const keys = new Set();
addEventListener('keydown', e => {
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    keys.add(e.code);
    e.preventDefault();
  }
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => keys.clear());

const LOOK = 0.0042;
const pointers = new Map();
let stick = null;   // {id, x, y, dx, dy}
const stickEl = $('#stick');
canvas.addEventListener('pointerdown', e => {
  canvas.setPointerCapture(e.pointerId);
  if (e.pointerType === 'touch' && e.clientX < innerWidth * 0.45 && !stick) {
    stick = {id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0};
    stickEl.style.left = `${e.clientX}px`;
    stickEl.style.top = `${e.clientY}px`;
    stickEl.classList.add('on');
  } else pointers.set(e.pointerId, {x: e.clientX, y: e.clientY});
});
canvas.addEventListener('pointermove', e => {
  if (stick && e.pointerId === stick.id) {
    const r = 50, dx = e.clientX - stick.x, dy = e.clientY - stick.y, l = Math.hypot(dx, dy), k = l > r ? r / l : 1;
    stick.dx = dx * k / r;
    stick.dy = dy * k / r;
    stickEl.firstElementChild.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
    return;
  }
  const p = pointers.get(e.pointerId);
  if (!p) return;
  yaw -= (e.clientX - p.x) * LOOK;
  pitch = THREE.MathUtils.clamp(pitch - (e.clientY - p.y) * LOOK, -1.2, 1.2);
  p.x = e.clientX;
  p.y = e.clientY;
  dirty = true;
});
const up = e => {
  if (stick && e.pointerId === stick.id) {
    stick = null;
    stickEl.classList.remove('on');
    stickEl.firstElementChild.style.transform = '';
  }
  pointers.delete(e.pointerId);
};
canvas.addEventListener('pointerup', up);
canvas.addEventListener('pointercancel', up);

const SPEED = 1.3;   // m/s
function step(dt) {
  let f = 0, s = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) f += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) f -= 1;
  if (keys.has('KeyD')) s += 1;
  if (keys.has('KeyA')) s -= 1;
  if (keys.has('ArrowLeft')) { yaw += 1.6 * dt; dirty = true; }
  if (keys.has('ArrowRight')) { yaw -= 1.6 * dt; dirty = true; }
  if (stick) { f -= stick.dy; s += stick.dx; }
  const l = Math.hypot(f, s);
  if (l < 0.05) return;
  if (l > 1) { f /= l; s /= l; }
  clearTimeout(hintTimer);
  hint.classList.add('gone');
  // forward and right along the floor (three.js), then the move tried in Blender's floor coordinates (x, -z)
  const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
  const dx = (fx * f - fz * s) * SPEED * dt, dz = (fz * f + fx * s) * SPEED * dt;
  const p = camera.position;
  const bx = p.x, by = -p.z;
  if (walkable(bx + dx, by - dz)) { p.x += dx; p.z += dz; }
  else if (walkable(bx + dx, by)) p.x += dx;            // (along a wall or the counter, not stopped dead by it)
  else if (walkable(bx, by - dz)) p.z += dz;
  dirty = true;
}

let last = performance.now();
renderer.setAnimationLoop(now => {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  step(dt);
  if (!dirty) return;
  camera.rotation.set(pitch, yaw, 0);
  renderer.render(scene, camera);
  dirty = false;
});

// for the studio's checks (a scripted walk in a headless browser): ?audit
if (params.has('audit')) {
  window.__IZAKAYA__ = {
    get pose() { const p = camera.position; return {x: p.x, y: -p.z, z: p.y, yaw, pitch}; },
    look(y, p) { yaw = y; pitch = p; dirty = true; },
    place(x, y) { if (!walkable(x, y)) return false; camera.position.x = x; camera.position.z = -y; dirty = true; return true; },
    walkable,
    toStart,
    render() { camera.rotation.set(pitch, yaw, 0); renderer.render(scene, camera); },
    stats() { return {triangles: Math.round(triangles), calls: renderer.info.render.calls, textures: renderer.info.memory.textures,
      geometries: renderer.info.memory.geometries, half}; },
  };
}
