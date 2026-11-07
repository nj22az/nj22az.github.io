import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { buildMotor, PHASE_COLORS, X } from './motor.js';
import { PART_INFO, STEPS, AUDIT } from './info.js';
import { TOOLS, STEPS as SERVICE, WORKSHOP_AUDIT, movesAfter } from './service.js';
import { summary, RATING, IEC, CORE } from './calc.mjs';

const $ = (s, el = document) => el.querySelector(s);
const view = $('#view');
const S = summary();

// ---------- renderer, scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.localClippingEnabled = true;
view.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.85;

const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 30);
const EXPLODED = { pos: new THREE.Vector3(-0.12, 0.62, 1.42), target: new THREE.Vector3(0.09, 0.03, 0) };
const HOME = { pos: new THREE.Vector3(-0.50, 0.30, 0.74), target: new THREE.Vector3(0.0, 0.0, 0) };
camera.position.copy(HOME.pos);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(HOME.target);
controls.enableDamping = true;
controls.minDistance = 0.12;
controls.maxDistance = 3;
controls.maxPolarAngle = Math.PI * 0.94;

const key = new THREE.DirectionalLight(0xffffff, 1.7);
key.position.set(-0.6, 1.1, 0.7);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -0.55, right: 0.55, top: 0.4, bottom: -0.4, near: 0.1, far: 3 });
key.shadow.bias = -0.0003;
key.shadow.normalBias = 0.0015;
key.shadow.radius = 4;
scene.add(key, new THREE.HemisphereLight(0xf4f7fb, 0x8a8f94, 0.35));
const rim = new THREE.DirectionalLight(0xdfe9ff, 0.6);
rim.position.set(0.8, 0.4, -0.9);
scene.add(rim);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: 0.2 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ---------- the motor ----------
const { root, parts } = buildMotor();
root.scale.setScalar(0.001);
scene.add(root);

const clipPlanes = [new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)];
const caps = [];
const COPPER = new THREE.Color(0xc0692e);

for (const p of parts.values()) {
  p.base = p.group.position.clone();
  p.off = new THREE.Vector3();
  p.goal = new THREE.Vector3();
  p.materials = [];
  const meshes = [];
  p.group.traverse(o => { if (o.isMesh) meshes.push(o); });
  meshes.forEach(o => {
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach(m => { m.clipIntersection = true; p.materials.push(m); });
    if (p.cut && o.geometry.type !== 'PlaneGeometry' && mats[0].side !== THREE.DoubleSide) {
      // section cap: back faces seen through the cut, drawn flat like a CAD section
      const src = mats[mats.length > 1 ? 1 : 0];
      const c = src.color ? src.color.clone().multiplyScalar(0.62) : new THREE.Color(0x5d6770);
      const cap = new THREE.Mesh(o.geometry, new THREE.MeshBasicMaterial({ color: c, side: THREE.BackSide, clippingPlanes: clipPlanes, clipIntersection: true }));
      cap.userData.cap = true;
      cap.visible = false;
      o.add(cap);
      caps.push(cap);
    }
  });
}

// ---------- state ----------
const state = {
  explode: 0, explodeTarget: 0, step: STEPS.length - 1, cut: false, run: false, phases: false,
  delta: false, mount: 'B35', dims: false, selected: null, hover: null, spin: 0,
  apart: false, proc: null, stepParts: [],
};
const groundFor = { B3: -IEC.H, B5: -IEC.P / 2 - 0.5, B35: -IEC.H - 12 };

function applyVisibility() {
  for (const p of parts.values()) {
    const mountOk = !p.mount || p.mount.includes(state.mount);
    p.group.visible = mountOk && p.step <= state.step;
  }
  const L = parts.get('links'), B = parts.get('tboard');
  L.linkY.visible = !state.delta; L.linkD.visible = state.delta;
  B.labels.Y.visible = !state.delta; B.labels.D.visible = state.delta;
  ground.position.y = groundFor[state.mount] * 0.001;
  updateDims();
}

function applyCut() {
  for (const p of parts.values()) {
    if (!p.cut) continue;
    for (const m of p.materials) { m.clippingPlanes = state.cut ? clipPlanes : null; m.needsUpdate = true; }
  }
  caps.forEach(c => { c.visible = state.cut; });
}

function applyPhases() {
  const w = parts.get('winding');
  for (const m of w.phaseMeshes) {
    m.material.color.set(state.phases ? PHASE_COLORS[m.userData.phase] : COPPER);
    m.material.metalness = state.phases ? 0.2 : 0.95;
    if (state.phases && m.userData.phase === 'V') m.material.color.set(0x3a3a3a);
  }
}

// ---------- highlight & picking ----------
const HL = new THREE.Color(0x0e8c84);
function setEmissive(id, amount) {
  const p = parts.get(id);
  if (!p) return;
  p.materials.forEach(m => { if (m.emissive) { m.emissive.copy(HL); m.emissiveIntensity = amount; } });
}
function refreshHighlights() {
  for (const id of parts.keys()) setEmissive(id, 0);
  for (const id of state.stepParts) setEmissive(id, 0.3);
  if (state.hover && state.hover !== state.selected) setEmissive(state.hover, 0.22);
  if (state.selected) setEmissive(state.selected, 0.45);
}

const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function visibleChain(o) { for (; o; o = o.parent) if (!o.visible) return false; return true; }
function pick(ev) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  for (const hit of ray.intersectObject(root, true)) {
    const o = hit.object;
    if (o.userData.cap || !visibleChain(o)) continue;
    const id = o.userData.part;
    if (!id) continue;
    if (state.cut && parts.get(id).cut) {
      const local = root.worldToLocal(hit.point.clone());
      if (local.y > 0 && local.z > 0) continue;
    }
    return id;
  }
  return null;
}

const tip = $('#tip');
let downAt = null;
renderer.domElement.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  const id = pick(e);
  if (id !== state.hover) { state.hover = id; refreshHighlights(); }
  renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
  if (id) {
    tip.textContent = parts.get(id).label;
    tip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 12}px)`;
    tip.hidden = false;
  } else tip.hidden = true;
});
renderer.domElement.addEventListener('pointerleave', () => { tip.hidden = true; state.hover = null; refreshHighlights(); });
renderer.domElement.addEventListener('pointerup', e => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return;
  select(pick(e), false);
});

// ---------- camera moves ----------
let tween = null;
function flyTo(target, pos, ms = 700) {
  tween = { t0: performance.now(), ms, fromT: controls.target.clone(), fromP: camera.position.clone(), toT: target, toP: pos };
}
function focusPart(id) {
  const p = parts.get(id);
  if (!p || !p.group.visible) return;
  const box = new THREE.Box3().setFromObject(p.group);
  if (box.isEmpty()) return;
  const c = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length();
  const dir = camera.position.clone().sub(controls.target).normalize();
  flyTo(c, c.clone().add(dir.multiplyScalar(Math.max(size * 2.4, 0.16))));
}

// ---------- dimensions ----------
const dimGroup = new THREE.Group();
dimGroup.visible = false;
root.add(dimGroup);
const dimLabels = [];
const dimMat = new THREE.LineBasicMaterial({ color: 0x0b6e66, depthTest: false, transparent: true });
const axisMat = new THREE.LineDashedMaterial({ color: 0x0b6e66, dashSize: 6, gapSize: 4, depthTest: false, transparent: true, opacity: 0.7 });
function dim(a, b, text, mount) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const d = B.clone().sub(A).normalize();
  const n = Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const t = 3.5;
  const pts = [A, B,
    A.clone().addScaledVector(n, -t), A.clone().addScaledVector(n, t),
    B.clone().addScaledVector(n, -t), B.clone().addScaledVector(n, t)];
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  const line = new THREE.LineSegments(g, dimMat);
  line.renderOrder = 10;
  line.userData.mount = mount;
  dimGroup.add(line);
  const el = document.createElement('div');
  el.className = 'dim';
  el.textContent = text;
  $('#dims').appendChild(el);
  dimLabels.push({ el, at: A.clone().add(B).multiplyScalar(0.5), line, mount });
}
(() => {
  const axis = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-190, 0, 0), new THREE.Vector3(195, 0, 0)]), axisMat);
  axis.computeLineDistances();
  axis.renderOrder = 10;
  dimGroup.add(axis);
  const FEET = ['B3', 'B35'], FL = ['B5', 'B35'];
  dim([-X.feet, -IEC.H, 112], [-X.feet, 0, 112], 'H 90', FEET);
  dim([X.shoulder, -IEC.H - 3, 100], [-X.feet, -IEC.H - 3, 100], 'C 56', FEET);
  dim([-X.feet, -IEC.H - 3, IEC.A / 2], [X.feet, -IEC.H - 3, IEC.A / 2], 'B 125', FEET);
  dim([X.feet + 22, -IEC.H, -IEC.A / 2], [X.feet + 22, -IEC.H, IEC.A / 2], 'A 140', FEET);
  dim([X.shaftTip, 32, 0], [X.shoulder, 32, 0], 'E 50', null);
  dim([X.shaftTip - 12, -IEC.D / 2, 0], [X.shaftTip - 12, IEC.D / 2, 0], 'Ø24 k6', null);
  dim([X.shoulder - 8, -IEC.N / 2, 0], [X.shoulder - 8, IEC.N / 2, 0], 'N Ø130 j6', FL);
  dim([X.shoulder + 6, -IEC.P / 2, -4], [X.shoulder + 6, IEC.P / 2, -4], 'P Ø200', FL);
  const m = IEC.M / 2 / Math.SQRT2;
  dim([X.shoulder - 2, -m, m], [X.shoulder - 2, m, -m], 'M 165', FL);
})();
function updateDims() {
  const on = state.dims && !state.apart && state.step === STEPS.length - 1;
  dimGroup.visible = on;
  for (const d of dimLabels) {
    const ok = on && (!d.mount || d.mount.includes(state.mount));
    d.line.visible = !d.mount || d.mount.includes(state.mount);
    d.el.hidden = !ok;
  }
}
const tmpV = new THREE.Vector3();
function placeDimLabels() {
  if (!dimGroup.visible) return;
  const w = view.clientWidth, h = view.clientHeight;
  for (const d of dimLabels) {
    if (d.el.hidden) continue;
    tmpV.copy(d.at).applyMatrix4(root.matrixWorld).project(camera);
    d.el.style.transform = `translate(${(tmpV.x + 1) / 2 * w}px, ${(1 - tmpV.y) / 2 * h}px) translate(-50%, -50%)`;
  }
}

// ---------- panel ----------
const fmt = (v, d = 2) => Number(v).toFixed(d);
const sevLabel = { critical: 'Critical', major: 'Major', minor: 'Minor', ok: 'Checked' };
const order = [...parts.values()].sort((a, b) => a.step - b.step);

function partsList() {
  const ul = $('#part-list');
  ul.innerHTML = '';
  for (const p of order) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.part = p.id;
    const n = AUDIT.filter(a => a[4] === p.id && a[0] !== 'ok').length;
    b.innerHTML = `<span class="step">${p.step}</span><span>${p.label}</span>${n ? `<span class="flag" title="${n} audit note(s)">${n}</span>` : ''}`;
    b.addEventListener('click', () => select(p.id, true));
    b.addEventListener('mouseenter', () => { state.hover = p.id; refreshHighlights(); });
    b.addEventListener('mouseleave', () => { state.hover = null; refreshHighlights(); });
    li.appendChild(b);
    ul.appendChild(li);
  }
}

function card(id) {
  const box = $('#card');
  if (!id) { box.hidden = true; return; }
  const p = parts.get(id), info = PART_INFO[id] || {};
  const notes = AUDIT.filter(a => a[4] === id);
  box.hidden = false;
  box.innerHTML = `
    <div class="card-head"><h3>${p.label}</h3><button type="button" class="x" aria-label="Close">×</button></div>
    ${p.group.visible ? '' : '<p class="muted">Hidden in the current build step or mounting.</p>'}
    <p>${info.what || ''}</p>
    ${info.spec ? `<p class="spec">${info.spec}</p>` : ''}
    ${info.service ? `<p class="svc"><strong>Service</strong> ${info.service}</p>` : ''}
    ${notes.map(a => `<p class="note sev-${a[0]}"><span class="chip">${sevLabel[a[0]]} · ${a[1]}</span> <strong>${a[2]}.</strong> ${a[3]}</p>`).join('')}`;
  $('.x', box).addEventListener('click', () => select(null));
}

function select(id, fly = false) {
  state.selected = id;
  refreshHighlights();
  card(id);
  document.querySelectorAll('#part-list button').forEach(b => b.classList.toggle('on', b.dataset.part === id));
  if (id) {
    showTab('parts');
    if (narrow.matches) setPanel(true);
    if (fly) focusPart(id);
  }
}

function specs() {
  const rows = [
    ['Output', '1.5 kW, S1 continuous'],
    ['Speed', `${RATING.n} min⁻¹ (sync. 1500, slip ${fmt(S.s * 100, 1)} %)`],
    ['Torque', `${fmt(S.T, 1)} Nm`],
    ['Voltage', '230 V Δ / 400 V Y, 50 Hz'],
    ['Current', `${fmt(S.Idelta, 1)} A Δ / ${fmt(S.Istar, 1)} A Y`],
    ['cos φ / η', `${RATING.pf} / ${fmt(RATING.eta * 100, 1)} % (IE3)`],
    ['Enclosure', 'TEFC IC411, IP66, class F (rise B)'],
    ['Stator', `${CORE.slots} slots, Ø150/Ø90 × 110, M400-50A`],
    ['Winding', `double-layer lap, q = 3, pitch 1–8, ≈ ${Math.round(S.winding.turnsPerCoil)} turns/coil`],
    ['Rotor', `${CORE.rotorSlots} bars, die-cast Al, skew 10°, gap ${CORE.airgap} mm`],
    ['Bearings', 'DE 6205-2RS/C3 (locating), NDE 6204-2RS/C3 + wave spring'],
    ['Shaft', 'Ø24 k6 × 50, key 8 × 7 × 40, M8 centre'],
    ['Flange', 'FF165: P 200, N 130 j6, M 165, 4 × Ø12, T 3.5'],
    ['Feet', 'H 90, A 140, B 125, C 56, K Ø10'],
    ['Tests', `hi-pot ${S.hipot} V AC 1 min, IR ≥ 100 MΩ @ 500 V DC, G2.5 balance`],
  ];
  $('#spec-table').innerHTML = rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('');
}

function audit() {
  const count = s => AUDIT.filter(a => a[0] === s).length;
  $('#audit-sum').innerHTML = ['critical', 'major', 'minor', 'ok'].map(s => `<span class="chip sev-${s}">${count(s)} ${sevLabel[s].toLowerCase()}</span>`).join(' ');
  const ol = $('#audit-list');
  ol.innerHTML = '';
  for (const a of AUDIT) {
    const li = document.createElement('li');
    li.className = 'sev-' + a[0];
    li.innerHTML = `<span class="chip">${sevLabel[a[0]]} · ${a[1]}</span><strong>${a[2]}</strong><p>${a[3]}</p>`;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'link';
    b.textContent = 'Show ' + parts.get(a[4]).label.toLowerCase();
    b.addEventListener('click', () => {
      const p = parts.get(a[4]);
      if (p.mount && !p.mount.includes(state.mount)) setMount(p.mount[p.mount.length - 1]);
      if (p.step > state.step) setStep(STEPS.length - 1);
      select(a[4], true);
    });
    li.appendChild(b);
    ol.appendChild(li);
  }
}

function showTab(name) {
  document.querySelectorAll('[role=tab]').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
  document.querySelectorAll('[role=tabpanel]').forEach(p => { p.hidden = p.id !== 'tab-' + name; });
}
document.querySelectorAll('[role=tab]').forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));

// ---------- workshop ----------
function flyExploded() {
  const t = EXPLODED.target.clone(), pos = EXPLODED.pos.clone();
  if (view.clientWidth / view.clientHeight < 0.8) { t.x = 0.02; pos.sub(t).multiplyScalar(1.5).add(t); }
  flyTo(t, pos, 900);
}

const toolById = Object.fromEntries(TOOLS.map(t => [t.id, t]));
const flagsFor = key => WORKSHOP_AUDIT.filter(a => a[4] === key);
const totalMin = list => list.reduce((n, s) => n + s.min, 0);

function workshopStep() {
  const box = $('#ws-step');
  const pr = state.proc;
  document.querySelectorAll('[data-wsmode]').forEach(b => b.setAttribute('aria-pressed', String(!!pr && b.dataset.wsmode === pr.mode)));
  if (!pr) {
    box.innerHTML = `<p>Choose <strong>Strip down</strong> to take the motor apart in ${SERVICE.length - 1} steps after preparation (≈ ${totalMin(SERVICE)} min), or <strong>Rebuild</strong> to put it back together (≈ ${totalMin(SERVICE.map(s => s.re))} min). The model moves each part as you go.</p>`;
    $('#ws-prev').disabled = $('#ws-next').disabled = true;
    $('#ws-count').textContent = '';
    return;
  }
  const n = SERVICE.length, d = pr.mode === 'dis' ? pr.i : n - 1 - pr.i;
  const st = SERVICE[d], body = pr.mode === 'dis' ? st : st.re;
  const notes = flagsFor('step:' + d);
  // strip-down keeps the workshop's numbering: 0 is preparation, 1–8 the steps
  const num = pr.mode === 'dis' ? pr.i : pr.i + 1;
  $('#ws-count').textContent = pr.mode === 'dis' ? `${num} / ${n - 1}` : `${num} / ${n}`;
  $('#ws-prev').disabled = pr.i === 0;
  $('#ws-next').disabled = pr.i === n - 1;
  const chips = body.tools.map(id => {
    const t = toolById[id];
    const flag = flagsFor(id).some(a => a[0] !== 'ok');
    return `<button type="button" class="tool${flag ? ' flagged' : ''}" data-tool="${id}" title="${t.use}">${t.name}</button>`;
  }).join('');
  box.innerHTML = `
    <h3>${pr.mode === 'dis' ? 'Strip down' : 'Rebuild'} ${num}. ${body.title} <span class="muted">· ${body.min} min</span></h3>
    <div class="tools">${chips}</div>
    <ol class="work">${body.work.map(w => `<li>${w}</li>`).join('')}</ol>
    <p class="check"><strong>Check</strong> ${body.check}</p>
    ${pr.mode === 'dis' ? notes.map(a => `<p class="note sev-${a[0]}"><span class="chip">${sevLabel[a[0]]} · ${a[1]}</span> <strong>${a[2]}.</strong> ${a[3]}</p>`).join('') : ''}`;
  box.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => {
    const li = document.getElementById('tool-' + b.dataset.tool);
    li.scrollIntoView({ behavior: 'smooth', block: 'center' });
    li.classList.remove('flash'); void li.offsetWidth; li.classList.add('flash');
  }));
}

function applyWorkshop() {
  const pr = state.proc, n = SERVICE.length;
  const d = pr.mode === 'dis' ? pr.i : n - 1 - pr.i;
  const moves = pr.mode === 'dis' ? movesAfter(d) : movesAfter(d - 1);
  for (const p of parts.values()) p.goal.set(...(moves[p.id] || [0, 0, 0]));
  state.stepParts = Object.keys(SERVICE[d].moves).filter(id => parts.get(id).group.visible);
  refreshHighlights();
  workshopStep();
}

function enterWorkshop(mode) {
  if (state.step !== STEPS.length - 1) setStep(STEPS.length - 1);
  state.explodeTarget = 0;
  $('#explode').value = 0;
  if (state.cut) { state.cut = false; $('#cut').setAttribute('aria-pressed', 'false'); applyCut(); }
  const first = !state.proc;
  state.proc = { mode, i: 0 };
  applyWorkshop();
  if (first) flyExploded();
}

function leaveWorkshop() {
  state.proc = null;
  state.stepParts = [];
  refreshHighlights();
  workshopStep();
}

function toolKit() {
  const groups = [...new Set(TOOLS.map(t => t.group))];
  $('#tool-list').innerHTML = groups.map(g => `<h4>${g}</h4><ul>${TOOLS.filter(t => t.group === g).map(t => {
    const fl = flagsFor(t.id).filter(a => a[0] !== 'ok');
    return `<li id="tool-${t.id}"><strong>${t.name}</strong>${t.size ? ` <span class="muted">${t.size}</span>` : ''}${t.added ? ' <span class="chip sev-ok">added</span>' : ''}
      <div>${t.use}</div>${fl.map(a => `<div class="note sev-${a[0]}"><span class="chip">${sevLabel[a[0]]}</span> ${a[3]}</div>`).join('')}</li>`;
  }).join('')}</ul>`).join('');
  const count = sv => WORKSHOP_AUDIT.filter(a => a[0] === sv).length;
  $('#ws-audit').innerHTML = ['major', 'minor', 'ok'].map(sv => `<span class="chip sev-${sv}">${count(sv)} ${sevLabel[sv].toLowerCase()}</span>`).join(' ');
}

document.querySelectorAll('[data-wsmode]').forEach(b => b.addEventListener('click', () => enterWorkshop(b.dataset.wsmode)));
$('#ws-prev').addEventListener('click', () => { if (state.proc && state.proc.i > 0) { state.proc.i--; applyWorkshop(); } });
$('#ws-next').addEventListener('click', () => { if (state.proc && state.proc.i < SERVICE.length - 1) { state.proc.i++; applyWorkshop(); } });
$('#ws-reset').addEventListener('click', () => {
  leaveWorkshop();
  for (const p of parts.values()) p.goal.set(0, 0, 0);
  flyTo(HOME.target.clone(), HOME.pos.clone(), 900);
});

// ---------- controls ----------
function setStep(s) {
  state.step = s;
  $('#step').value = s;
  const st = STEPS[s];
  $('#step-out').innerHTML = `${s}/8<span class="long"> · ${st.title}</span>`;
  $('#caption').innerHTML = s === STEPS.length - 1 ? '' : `<strong>Step ${s}: ${st.title}.</strong> ${st.text}`;
  $('#caption').hidden = s === STEPS.length - 1;
  applyVisibility();
}
function setMount(m) {
  state.mount = m;
  document.querySelectorAll('[data-mount]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mount === m)));
  applyVisibility();
}
function setDelta(d) {
  state.delta = d;
  document.querySelectorAll('[data-conn]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.conn === 'D') === d)));
  applyVisibility();
}
const toggle = (sel, key, after) => {
  const b = $(sel);
  b.addEventListener('click', () => {
    state[key] = !state[key];
    b.setAttribute('aria-pressed', String(state[key]));
    after && after();
  });
};

$('#explode').addEventListener('input', e => {
  const was = state.explodeTarget;
  state.explodeTarget = +e.target.value / 100;
  if (state.proc) leaveWorkshop();
  for (const p of parts.values()) p.goal.copy(p.explode).multiplyScalar(state.explodeTarget);
  // frame the whole spread once when it opens, and come home when it closes
  if (was <= 0.25 && state.explodeTarget > 0.25) flyExploded();
  if (was > 0 && state.explodeTarget === 0) flyTo(HOME.target.clone(), HOME.pos.clone(), 900);
});
$('#step').addEventListener('input', e => setStep(+e.target.value));
document.querySelectorAll('[data-mount]').forEach(b => b.addEventListener('click', () => setMount(b.dataset.mount)));
document.querySelectorAll('[data-conn]').forEach(b => b.addEventListener('click', () => setDelta(b.dataset.conn === 'D')));
toggle('#cut', 'cut', applyCut);
toggle('#run', 'run');
toggle('#phases', 'phases', applyPhases);
toggle('#dimsbtn', 'dims', updateDims);
$('#home').addEventListener('click', () => flyTo(HOME.target.clone(), HOME.pos.clone()));
$('#glb').addEventListener('click', exportGLB);
const narrow = matchMedia('(max-width: 900px)');
function setPanel(open) {
  $('#panel').classList.toggle('closed', !open);
  $('#panel-toggle').setAttribute('aria-expanded', String(open));
}
$('#panel-toggle').addEventListener('click', () => setPanel($('#panel').classList.contains('closed')));
if (narrow.matches) setPanel(false);

async function exportGLB() {
  const btn = $('#glb');
  btn.disabled = true;
  btn.textContent = 'Exporting…';
  try {
    const { GLTFExporter } = await import('./vendor/GLTFExporter.js');
    dimGroup.visible = false;
    const wasCut = state.cut;
    if (wasCut) { state.cut = false; applyCut(); }
    const glb = await new GLTFExporter().parseAsync(root, { binary: true, onlyVisible: true });
    if (wasCut) { state.cut = true; applyCut(); }
    updateDims();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }));
    a.download = `iec-90l-4-1.5kw-${state.mount.toLowerCase()}.glb`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  } catch (err) {
    console.error(err);
    alert('Export failed: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Download .glb';
  }
}

// ---------- loop ----------
function resize() {
  const w = view.clientWidth, h = view.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 0.8 ? 46 : 30;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(view);
resize();

const ease = t => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  let moving = false, apart = false;
  for (const p of parts.values()) {
    if (p.off.distanceToSquared(p.goal) > 1e-4) {
      p.off.lerp(p.goal, Math.min(1, dt * 5));
      if (p.off.distanceToSquared(p.goal) < 0.01) p.off.copy(p.goal);
      p.group.position.copy(p.base).add(p.off);
      moving = true;
    }
    if (p.off.lengthSq() > 0.25) apart = true;
  }
  if (apart !== state.apart || moving) { state.apart = apart; updateDims(); }
  if (state.run) state.spin += dt * Math.PI; // 0.5 rev/s: 1440 min⁻¹ slowed 48 ×
  for (const p of parts.values()) if (p.spins) p.group.rotation.x = state.apart ? 0 : state.spin;
  if (tween) {
    const t = Math.min(1, (now - tween.t0) / tween.ms), k = ease(t);
    controls.target.lerpVectors(tween.fromT, tween.toT, k);
    camera.position.lerpVectors(tween.fromP, tween.toP, k);
    if (t >= 1) tween = null;
  }
  controls.update();
  renderer.render(scene, camera);
  placeDimLabels();
  requestAnimationFrame(frame);
}

partsList();
toolKit();
workshopStep();
specs();
audit();
setStep(STEPS.length - 1);
setMount('B35');
setDelta(false);
showTab('parts');
requestAnimationFrame(frame);
window.__motor = { enterWorkshop, applyWorkshop, camera, controls, flyTo, parts, state, setStep, setMount, setDelta, select, exportGLB, root, applyCut, applyPhases, updateDims };
document.body.classList.add('ready');
