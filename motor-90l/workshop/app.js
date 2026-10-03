import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { buildWorkshop } from './scene.js';
import { createTetsuo } from './tetsuo.js';
import { CHAPTERS, SHOTS, START } from './routine.js';
import { PHASE_COLORS } from '../motor.js';

const $ = s => document.querySelector(s);
const view = $('#view');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.localClippingEnabled = true;
view.appendChild(renderer.domElement);

const W = buildWorkshop(renderer);
const { scene, motor, iso, tools: T, dust, field, points } = W;
const tetsuo = createTetsuo();
scene.add(tetsuo.holder);

const camera = new THREE.PerspectiveCamera(38, 1, 0.02, 30);
camera.position.set(...SHOTS.wide[0]);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(...SHOTS.wide[1]);
controls.enableDamping = true;
controls.minDistance = 0.15;
controls.maxDistance = 5;
let follow = true;
controls.addEventListener('start', () => { follow = false; $('#follow').hidden = false; });
$('#follow').addEventListener('click', () => { follow = true; $('#follow').hidden = true; });

// ---------- timeline ----------
const beats = [];
let T0 = 0;
CHAPTERS.forEach((ch, ci) => {
  ch.start = T0;
  ch.beats.forEach((b, bi) => { beats.push({ ...b, ci, bi, t0: T0 }); T0 += b.d; });
  ch.end = T0;
});
const TOTAL = T0;

const NUMERIC = ['iso', 'lock', 'lid', 'links', 'linksOff', 'shaft', 'fins', 'grille'];
function stateAt(t) {
  const s = { ...START };
  for (const b of beats) {
    if (b.t0 > t) break;
    // instrument readings belong to their chapter
    if (b.bi === 0) Object.assign(s, { tester: '', meter: '', clamp: '', led: 0 });
    if (b.now) Object.assign(s, b.now);
    if (b.set) {
      const p = Math.min(1, (t - b.t0) / b.d), e = ease(p);
      for (const [k, v] of Object.entries(b.set)) s[k] = NUMERIC.includes(k) ? s[k] + (v - s[k]) * e : v;
    }
  }
  return s;
}
const ease = p => p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
const smooth = p => p * p * (3 - 2 * p);
const beatAt = t => { let i = 0; while (i < beats.length - 1 && beats[i + 1].t0 <= t) i++; return i; };

// the pose a beat asks for, with hand targets resolved to points
const camPoint = new THREE.Vector3();
function target(spec, p) {
  if (!spec) return null;
  if (spec === 'cam') return camPoint.clone();
  if (typeof spec === 'string') return points[spec].clone();
  if (spec.sweep) {
    const [a, b] = spec.sweep.map(n => points[n]);
    return a.clone().lerp(b, 0.5 - 0.5 * Math.cos(2 * Math.PI * spec.n * p));
  }
  return null;
}
function poseOf(i) {
  // walking beats keep the previous hands down; positions carry over
  let k = i;
  while (k > 0 && !beats[k].pose) k--;
  return beats[k].pose;
}

const holdState = { R: null, L: null };
function toolsAt(i) {
  let k = i;
  while (k > 0 && !beats[k].tool) k--;
  return beats[k].tool || {};
}
const TOOL_OBJ = { tester: T.tester.R, testerL: T.tester.L, wrench: T.wrench, brush: T.brush, clamp: T.clamp.held, meterR: T.meter.R, meterL: T.meter.L };

let walkPhase = 0;
function poseAt(t, dt) {
  const i = beatAt(t), b = beats[i], P = poseOf(i), Q = i > 0 ? poseOf(i - 1) : P;
  const local = Math.min(1, (t - b.t0) / b.d);
  const walking = !!P.walk;
  const blendT = walking ? b.d : Math.min(0.9, b.d * 0.5);
  const w = smooth(Math.min(1, (t - b.t0) / blendT));
  const pose = {};
  const [x0, z0] = Q.at, [x1, z1] = P.at;
  if (walking) {
    const e = ease(local);
    pose.x = x0 + (x1 - x0) * e; pose.z = z0 + (z1 - z0) * e;
    const dir = Math.atan2(x1 - x0, z1 - z0);
    const turnIn = smooth(Math.min(1, local / 0.15)), turnOut = smooth(Math.max(0, (local - 0.8) / 0.2));
    pose.face = lerpAngle(lerpAngle(Q.face, dir, turnIn), P.face, turnOut);
    pose.walk = Math.sin(Math.PI * Math.min(1, local * 1.15)) ** 0.5;
    walkPhase += dt * 9 * pose.walk;
    pose.phase = walkPhase;
  } else {
    pose.x = x0 + (x1 - x0) * w; pose.z = z0 + (z1 - z0) * w;
    pose.face = lerpAngle(Q.face ?? 0, P.face ?? 0, w);
    // a short side-step along the bench still gets a few steps
    const step = Math.hypot(x1 - x0, z1 - z0) > 0.05 && w < 1;
    pose.walk = step ? Math.sin(Math.PI * w) ** 0.5 : 0;
    if (step) walkPhase += dt * 9;
    pose.phase = walkPhase;
  }
  pose.lean = (Q.lean || 0) + ((P.lean || 0) - (Q.lean || 0)) * w;
  for (const s of ['R', 'L']) pose[s] = { from: target(Q[s], 1), to: target(P[s], local), w };
  const la = target(Q.look, 1), lb = target(P.look, local);
  pose.look = la && lb ? la.lerp(lb, w) : lb || la;
  pose.mood = P.mood || 'neutral';
  // talking while the line is fresh
  pose.talking = !!b.say && (t - b.t0) < Math.min(b.d - 0.3, b.say.length * 0.055);
  return pose;
}
const lerpAngle = (a, b, w) => a + (((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * w;

// ---------- applying the world state ----------
const spinIds = ['rotor', 'shaft', 'key', 'fan', 'circlip', 'bearingDE', 'bearingNDE'];
const COPPER = new THREE.Color(0xc0692e);
let cutOn = false, phasesOn = false, runSpin = 0, readKey = null;
function applyState(s, dt) {
  iso.handle.rotation.z = -s.iso * Math.PI / 2;
  iso.lock.scale.setScalar(Math.max(0.0001, s.lock));
  iso.start.material.emissive?.setHex(s.run ? 0x1a6d2a : 0x000000);
  // lid: up, over, down onto the bench
  const lid = motor.parts.get('lid').group, lp = s.lid;
  lid.position.set(250 * smooth(Math.max(0, (lp - 0.3) / 0.7)), 110 * Math.sin(Math.min(1, lp / 0.5) * Math.PI / 2) - 340 * smooth(Math.max(0, (lp - 0.5) / 0.5)), 30 * lp);
  // links: Y set rises as Δ set lowers; 'off' lifts both clear onto the bench mat
  const L = motor.parts.get('links');
  const off = s.linksOff;
  L.linkY.position.y = 45 * s.links; L.linkY.visible = s.links < 0.98;
  L.linkD.position.y = 45 * (1 - s.links); L.linkD.visible = s.links > 0.02;
  L.group.position.set(-260 * smooth(off), 60 * Math.sin(off * Math.PI) - 190 * smooth(off), 80 * smooth(off));
  // the shaft: turned by hand (timeline) or running
  if (s.run) runSpin += dt * Math.PI * (s.field ? 0.9 : 1);
  const ang = -s.shaft * Math.PI * 2 - runSpin;
  for (const id of spinIds) motor.parts.get(id).group.rotation.x = ang;
  field.visible = !!s.field;
  if (s.field) field.rotation.x -= dt * Math.PI;
  // dust
  for (const [k, pts] of [['fins', dust.fins], ['grille', dust.grille]]) {
    const n = pts.userData.n, gone = Math.round(n * (1 - s[k]));
    pts.geometry.setDrawRange(gone, n - gone);
  }
  if (!!s.cut !== cutOn) { cutOn = !!s.cut; W.setCut(cutOn); }
  if (!!s.phases !== phasesOn) {
    phasesOn = !!s.phases;
    for (const m of motor.parts.get('winding').phaseMeshes) {
      m.material.color.set(phasesOn ? (m.userData.phase === 'V' ? 0x3a3a3a : PHASE_COLORS[m.userData.phase]) : COPPER);
      m.material.metalness = phasesOn ? 0.2 : 0.95;
    }
  }
  T.dti.group.visible = !!s.dti;
  T.dti.needle.rotation.z = Math.sin(s.shaft * Math.PI * 2) * 0.5;
  T.proving.led.material.color.setHex(s.led ? 0x39d353 : 0x334433);
  T.tester.display.userData.set(s.tester);
  T.meter.display.userData.set(s.meter);
  T.clamp.display.userData.set(s.clamp);
  // the same reading, large on screen
  const r = s.clamp ? ['Clamp meter', s.clamp] : s.meter ? ['Installation tester', s.meter] : s.tester ? ['Voltage tester', s.tester] : null;
  const key = r ? r.join('|') : '';
  if (key !== readKey) {
    readKey = key;
    $('#readout').hidden = !r;
    if (r) { $('#ro-name').textContent = r[0]; $('#ro-val').textContent = r[1]; }
  }
}

function applyTools(i) {
  const want = toolsAt(i);
  for (const side of ['R', 'L']) {
    const obj = want[side] ? TOOL_OBJ[want[side]] : null;
    if (holdState[side] !== obj) { tetsuo.hold(side, obj); holdState[side] = obj; }
  }
  const held = new Set(Object.values(holdState));
  T.tester.rest.visible = !held.has(T.tester.R);
  T.wrench.rest.visible = !held.has(T.wrench);
  T.brush.rest.visible = !held.has(T.brush);
  T.clamp.rest.visible = !held.has(T.clamp.held);
}

const _p = new THREE.Vector3(), _q = new THREE.Vector3();
function updateLeads() {
  const t = T.tester, both = holdState.R === t.R && holdState.L === t.L;
  t.lead.visible = both;
  if (both) t.lead.userData.update(t.R.userData.back.getWorldPosition(_p).clone(), t.L.userData.back.getWorldPosition(_q).clone(), 0.12);
  const m = T.meter;
  for (const [side, probe, ld, jack] of [['R', m.R, m.leadR, m.jacks[0]], ['L', m.L, m.leadL, m.jacks[1]]]) {
    const on = holdState[side] === probe;
    ld.visible = on;
    if (on) ld.userData.update(jack.getWorldPosition(_p).clone(), probe.userData.back.getWorldPosition(_q).clone(), 0.1);
  }
}

// ---------- labels on the terminals being touched ----------
const TAGGED = new Set(['U1', 'V1', 'W1', 'U2', 'V2', 'W2', 'PE', 'TP1', 'TP2']);
const tagEls = [0, 1].map(() => { const el = document.createElement('div'); el.className = 'tag'; el.hidden = true; $('#tags').appendChild(el); return el; });
const _t = new THREE.Vector3();
function placeTags(i) {
  const P = beats[i].pose || {};
  const names = [P.R, P.L].filter(n => typeof n === 'string' && TAGGED.has(n));
  tagEls.forEach((el, k) => {
    const n = names[k];
    el.hidden = !n;
    if (!n) return;
    _t.copy(points[n]).add(new THREE.Vector3(0, 0.07, 0.02)).project(camera);
    el.textContent = n;
    el.style.transform = `translate(${(_t.x + 1) / 2 * view.clientWidth}px, ${(1 - _t.y) / 2 * view.clientHeight}px) translate(-50%, -100%)`;
  });
}

// ---------- camera director ----------
const camGoal = { pos: new THREE.Vector3(...SHOTS.wide[0]), at: new THREE.Vector3(...SHOTS.wide[1]) };
function shotAt(i) {
  let k = i;
  while (k > 0 && !beats[k].cam) k--;
  const [p, a] = SHOTS[beats[k].cam || 'wide'];
  const pos = new THREE.Vector3(...p), at = new THREE.Vector3(...a);
  // pull back on tall narrow screens
  const aspect = view.clientWidth / view.clientHeight;
  if (aspect < 0.9) pos.sub(at).multiplyScalar(1 + (0.9 - aspect) * 3).add(at);
  return { pos, at };
}

// ---------- UI ----------
let time = 0, playing = false, speed = 1, lastChapter = -1, lastSay = null;
function chapterAt(t) { return CHAPTERS.findIndex(c => t >= c.start && t < c.end); }
function buildChapters() {
  $('#chapters').innerHTML = CHAPTERS.map((c, i) => `<li><button type="button" data-ch="${i}"><span class="n">${i + 1}</span><span class="t">${c.title}</span><span class="bar"><i></i></span></button></li>`).join('');
  document.querySelectorAll('[data-ch]').forEach(b => b.addEventListener('click', () => { seek(CHAPTERS[+b.dataset.ch].start + 0.01); setPlaying(true); }));
}
function uiTick() {
  const ci = Math.max(0, chapterAt(Math.min(time, TOTAL - 0.001)));
  document.querySelectorAll('[data-ch]').forEach((b, i) => {
    const c = CHAPTERS[i], p = Math.max(0, Math.min(1, (time - c.start) / (c.end - c.start)));
    b.classList.toggle('on', i === ci);
    b.querySelector('i').style.width = (p * 100).toFixed(1) + '%';
  });
  if (ci !== lastChapter) {
    lastChapter = ci;
    $('#learn-title').textContent = `${ci + 1}. ${CHAPTERS[ci].title}`;
    $('#learn').innerHTML = CHAPTERS[ci].learn;
  }
  // caption: the latest line in this chapter
  const i = beatAt(time);
  let k = i, say = null;
  while (k >= 0 && beats[k].ci === ci) { if (beats[k].say) { say = beats[k].say; break; } k--; }
  if (say !== lastSay) {
    lastSay = say;
    $('#say').textContent = say || '';
    $('#bubble').hidden = !say;
  }
  $('#scrub').value = (time / TOTAL * 1000).toFixed(0);
  $('#clock').textContent = `${fmtT(time)} / ${fmtT(TOTAL)}`;
}
const fmtT = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function setPlaying(p) {
  playing = p;
  if (time >= TOTAL - 0.01 && p) time = 0;
  $('#play').textContent = p ? 'Pause' : 'Play';
  $('#play').setAttribute('aria-pressed', String(p));
}
let snapCam = true;
function seek(t) { time = Math.max(0, Math.min(TOTAL, t)); walkPhase = 0; snapCam = true; }
$('#play').addEventListener('click', () => setPlaying(!playing));
$('#restart').addEventListener('click', () => { seek(0); setPlaying(true); });
$('#scrub').addEventListener('input', e => seek(+e.target.value / 1000 * TOTAL));
$('#speed').addEventListener('click', () => {
  speed = speed === 1 ? 0.5 : speed === 0.5 ? 2 : 1;
  $('#speed').textContent = speed + '×';
});
$('#prev').addEventListener('click', () => { const c = chapterAt(time); seek(CHAPTERS[Math.max(0, (time - CHAPTERS[Math.max(0, c)].start > 2 ? c : c - 1))].start + 0.01); });
$('#next').addEventListener('click', () => { const c = chapterAt(time); if (c < CHAPTERS.length - 1) seek(CHAPTERS[c + 1].start + 0.01); });
addEventListener('keydown', e => {
  if (e.target.closest('input,button') && e.key !== ' ') return;
  if (e.key === ' ') { e.preventDefault(); setPlaying(!playing); }
  if (e.key === 'ArrowRight') $('#next').click();
  if (e.key === 'ArrowLeft') $('#prev').click();
});

// ---------- loop ----------
function resize() {
  const w = view.clientWidth, h = view.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(view);
resize();

let last = performance.now(), ghost = 1;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (playing) {
    time += dt * speed;
    if (time >= TOTAL) { time = TOTAL; setPlaying(false); }
  }
  const t = Math.min(time, TOTAL - 1e-3);
  const i = beatAt(t);
  camPoint.copy(camera.position);
  applyState(stateAt(t), playing ? dt * speed : 0);
  applyTools(i);
  tetsuo.apply(poseAt(t, playing ? dt * speed : 0), dt);
  updateLeads();
  if (follow) {
    const g = shotAt(i);
    const k = snapCam ? 1 : 1 - Math.exp(-dt * 2.2);
    snapCam = false;
    camGoal.pos.lerp(g.pos, k); camGoal.at.lerp(g.at, k);
    camera.position.copy(camGoal.pos);
    controls.target.copy(camGoal.at);
  }
  controls.update();
  // ghost Tetsuo while he hides what he is working on
  const block = tetsuo.blocking(camera.position, controls.target);
  ghost += ((block > 0.3 ? 0.28 : 1) - ghost) * Math.min(1, dt * 6);
  tetsuo.setOpacity(ghost);
  renderer.render(scene, camera);
  placeTags(i);
  uiTick();
  requestAnimationFrame(frame);
}

buildChapters();
requestAnimationFrame(frame);
window.__ws = { seek, setPlaying, get time() { return time; }, TOTAL, CHAPTERS, beats, camera, controls, tetsuo, setFollow(v) { follow = v; } };
document.body.classList.add('ready');
