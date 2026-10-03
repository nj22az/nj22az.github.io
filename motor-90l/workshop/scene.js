// The Dock Electrical Workshop bench: room, isolator, the motor (IM B3 on the bench), Tetsuo's instruments.
// World units are metres; the motor itself is built in millimetres and scaled.
import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { buildMotor, TERMINALS, BOX, BOX_INSIDE, X } from '../motor.js';

// Johansson Town people are drawn big-headed (Tetsuo's head is ~0.47 m across), so the town sizes props up to
// read next to them. The motor and the bench kit follow: K × true size.
export const K = 1.7;
export const BENCH_Y = 0.5;
export const MOTOR_POS = new THREE.Vector3(0, BENCH_Y + 0.09 * K, -0.2);
export const WALL_Z = -1.25;
export const ISOLATOR = new THREE.Vector3(-0.95, 0.95, WALL_Z + 0.06);

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0, ...o });

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

// A small LCD that can be rewritten: set('0 V').
export function makeDisplay(w = 0.05, h = 0.025, { bg = '#b9c7a8', fg = '#16210f' } = {}) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
  let last = null;
  mesh.userData.set = (text = '') => {
    if (text === last) return; last = text;
    g.fillStyle = bg; g.fillRect(0, 0, 256, 128);
    g.fillStyle = fg; g.textAlign = 'right'; g.textBaseline = 'middle';
    const big = String(text).length <= 7;
    g.font = `700 ${big ? 64 : 42}px "Courier New", monospace`;
    g.fillText(text, 240, 68);
    tex.needsUpdate = true;
  };
  mesh.userData.set('');
  return mesh;
}

function room(scene) {
  const floorTex = canvasTex(512, 512, (g) => {
    g.fillStyle = '#a7a59e'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4000; i++) { const v = 150 + Math.random() * 40; g.fillStyle = `rgba(${v},${v - 2},${v - 8},0.25)`; g.fillRect(Math.random() * 512, Math.random() * 512, 2, 2); }
    g.strokeStyle = 'rgba(80,80,76,0.35)'; g.lineWidth = 2; g.strokeRect(0, 0, 512, 512);
  });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(4, 4);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), mat(0xffffff, { map: floorTex, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wallM = mat(0x8fb3c4, { roughness: 0.95 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), wallM); back.position.set(0, 1.5, WALL_Z); back.receiveShadow = true; scene.add(back);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), wallM); side.rotation.y = Math.PI / 2; side.position.set(-1.9, 1.5, 0); side.receiveShadow = true; scene.add(side);
  const dado = new THREE.Mesh(new THREE.BoxGeometry(6, 0.9, 0.01), mat(0x5d8196)); dado.position.set(0, 0.45, WALL_Z + 0.006); scene.add(dado);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.2), new THREE.MeshBasicMaterial({ map: canvasTex(1100, 200, (g) => {
    g.fillStyle = '#1f4f8a'; g.fillRect(0, 0, 1100, 200); g.fillStyle = '#fff'; g.font = '700 70px Arial'; g.fillText('DOCK ELECTRICAL WORKSHOP', 40, 100);
    g.font = '500 38px Arial'; g.fillText('ELECTRICAL · INSTRUMENTS · REPAIRS', 40, 160);
  }) }));
  sign.position.set(0.35, 1.85, WALL_Z + 0.01); scene.add(sign);
  // pegboard with outlines of the tool kit
  const peg = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.55), mat(0xc9a877, { map: canvasTex(360, 220, (g) => {
    g.fillStyle = '#c9a877'; g.fillRect(0, 0, 360, 220); g.fillStyle = 'rgba(60,40,20,0.5)';
    for (let x = 10; x < 360; x += 20) for (let y = 10; y < 220; y += 20) { g.beginPath(); g.arc(x, y, 2, 0, 7); g.fill(); }
    g.strokeStyle = '#2b2b2b'; g.lineWidth = 6;
    [[40, 30, 40, 180], [90, 30, 90, 150], [140, 40, 170, 170], [220, 30, 220, 120], [280, 60, 330, 60]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); });
  }) }));
  peg.position.set(0.35, 1.3, WALL_Z + 0.01); scene.add(peg);
}

function bench(scene) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.5), mat(0x9a7652, { roughness: 0.6 }));
  top.position.set(0, BENCH_Y - 0.02, -0.15); top.castShadow = top.receiveShadow = true; g.add(top);
  const mat2 = mat(0x3d5566, { metalness: 0.4, roughness: 0.5 });
  for (const x of [-0.7, 0.7]) for (const z of [-0.36, 0.06]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, BENCH_Y - 0.04, 0.05), mat2);
    leg.position.set(x, (BENCH_Y - 0.04) / 2, z); leg.castShadow = true; g.add(leg);
  }
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.02, 0.44), mat2); shelf.position.set(0, 0.14, -0.15); g.add(shelf);
  const mat3 = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.006, 0.42), mat(0x2f3a33, { roughness: 0.95 }));
  mat3.position.set(0.05, BENCH_Y + 0.003, -0.17); mat3.receiveShadow = true; g.add(mat3);
  scene.add(g);
}

function isolator(scene) {
  const g = new THREE.Group();
  g.position.copy(ISOLATOR).setZ(WALL_Z);
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.09), mat(0x9aa0a4, { metalness: 0.2 }));
  box.position.set(0, 0, 0.045); box.castShadow = true; g.add(box);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.004), mat(0xf2c500)); plate.position.set(0, 0.02, 0.091); g.add(plate);
  const handle = new THREE.Group(); handle.position.set(0, 0.02, 0.095); g.add(handle);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.02, 24), mat(0xc4231c)); knob.rotation.x = Math.PI / 2; handle.add(knob);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.022), mat(0xc4231c)); bar.position.z = 0.012; handle.add(bar);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.03), new THREE.MeshBasicMaterial({ map: canvasTex(300, 90, (c) => {
    c.fillStyle = '#fff'; c.fillRect(0, 0, 300, 90); c.fillStyle = '#111'; c.font = '700 34px Arial'; c.fillText('0 OFF    I ON', 14, 40); c.font = '500 24px Arial'; c.fillText('BILGE PUMP P-12', 14, 78);
  }) }));
  label.position.set(0, -0.06, 0.0905); g.add(label);
  // starter below: start / stop buttons
  const st = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.08), mat(0x9aa0a4, { metalness: 0.2 })); st.position.set(0, -0.2, 0.04); st.castShadow = true; g.add(st);
  const go = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 20), mat(0x2b8a3e)); go.rotation.x = Math.PI / 2; go.position.set(-0.025, -0.2, 0.085); g.add(go);
  const stop = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 20), mat(0xc4231c)); stop.rotation.x = Math.PI / 2; stop.position.set(0.025, -0.2, 0.085); g.add(stop);
  // padlock and tag, hung on the hasp when locked off
  const lock = new THREE.Group(); lock.position.set(0.05, -0.035, 0.1); g.add(lock);
  const lb = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.03, 0.012), mat(0xd23b2a, { roughness: 0.4 })); lock.add(lb);
  const sh = new THREE.Mesh(new THREE.TorusGeometry(0.009, 0.0025, 8, 16, Math.PI), mat(0xc0c4c8, { metalness: 1, roughness: 0.3 })); sh.position.y = 0.015; lock.add(sh);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.08), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: canvasTex(200, 320, (c) => {
    c.fillStyle = '#fff'; c.fillRect(0, 0, 200, 320); c.fillStyle = '#c4231c'; c.fillRect(0, 0, 200, 90);
    c.fillStyle = '#fff'; c.font = '700 40px Arial'; c.fillText('DANGER', 22, 60);
    c.fillStyle = '#111'; c.font = '700 26px Arial'; ['DO NOT', 'OPERATE', '', 'Locked by:', 'TETSUO'].forEach((t, i) => c.fillText(t, 16, 130 + i * 36));
  }) }));
  tag.position.set(0.0, -0.06, 0.004); lock.add(tag);
  lock.scale.setScalar(0.0001);
  scene.add(g);
  return { group: g, handle, lock, start: go };
}

function lead(color) {
  const m = new THREE.Mesh(new THREE.BufferGeometry(), mat(color, { roughness: 0.6 }));
  m.castShadow = true;
  m.userData.update = (a, b, sag = 0.08) => {
    const mid = a.clone().add(b).multiplyScalar(0.5); mid.y -= sag;
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, mid, b]), 24, 0.0022, 5, false);
    m.geometry.dispose(); m.geometry = g;
  };
  return m;
}

function probe(color, len = 0.11) {
  // handle along −y (the hand's forearm direction), steel tip at the end
  const g = new THREE.Group();
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.008, len * 0.75, 12), mat(color, { roughness: 0.5 })); h.position.y = -len * 0.35; g.add(h);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0015, len * 0.25, 8), mat(0xd0d4d8, { metalness: 1, roughness: 0.2 })); tip.position.y = -len * 0.85; g.add(tip);
  const end = new THREE.Object3D(); end.position.y = -len; g.add(end);
  const back = new THREE.Object3D(); back.position.y = 0.01; g.add(back);
  g.userData = { tip: end, back };
  return g;
}

function tools(scene) {
  const T = {};
  // two-pole voltage tester: display handle (right hand) and second probe (left hand)
  const testerR = probe(0xf2c500, 0.15);
  const disp = makeDisplay(0.024, 0.014); disp.position.set(0, -0.04, 0.0085); testerR.add(disp);
  const testerL = probe(0x222222, 0.12);
  T.tester = { R: testerR, L: testerL, display: disp, lead: lead(0x222222) };
  scene.add(T.tester.lead);
  // proving unit
  const pu = new THREE.Group(); pu.position.set(0.6, BENCH_Y, -0.02); pu.scale.setScalar(1.3);
  const pub = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, 0.05), mat(0xe8e3d4)); pub.position.y = 0.015; pub.castShadow = true; pu.add(pub);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.004, 12, 8), new THREE.MeshBasicMaterial({ color: 0x334433 })); led.position.set(0.02, 0.031, 0.0); pu.add(led);
  scene.add(pu);
  T.proving = { group: pu, led, pads: [new THREE.Vector3(0.578, BENCH_Y + 0.042, -0.02), new THREE.Vector3(0.617, BENCH_Y + 0.042, -0.02)] };
  // tester resting on the bench when not in hand
  const rest = new THREE.Group(); rest.position.set(0.66, BENCH_Y + 0.008, -0.2); rest.rotation.set(0, 0.3, Math.PI / 2);
  rest.add(probe(0xf2c500, 0.15)); const r2 = probe(0x222222, 0.12); r2.position.z = 0.03; rest.add(r2); scene.add(rest);
  T.tester.rest = rest;
  // installation tester (low-ohm and 500 V insulation)
  const it = new THREE.Group(); it.position.set(-0.58, BENCH_Y, -0.06); it.rotation.y = 0.35; it.scale.setScalar(1.3);
  const itb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.13), mat(0xe2b80f, { roughness: 0.5 })); itb.position.y = 0.03; itb.castShadow = true; it.add(itb);
  const itd = makeDisplay(0.09, 0.04); itd.rotation.x = -Math.PI / 2 + 0.25; itd.position.set(0, 0.062, -0.015); it.add(itd);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 24), mat(0x222222)); dial.position.set(0.05, 0.064, 0.035); it.add(dial);
  const jacks = [new THREE.Object3D(), new THREE.Object3D()]; jacks[0].position.set(-0.07, 0.06, 0.05); jacks[1].position.set(-0.04, 0.06, 0.05); it.add(...jacks);
  scene.add(it);
  T.meter = { group: it, display: itd, jacks, R: probe(0xc4231c), L: probe(0x222222), leadR: lead(0xc4231c), leadL: lead(0x222222) };
  scene.add(T.meter.leadR, T.meter.leadL);
  // 8 mm socket on a small ratchet
  const wrench = new THREE.Group();
  const wh = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.12, 0.008), mat(0x8c9196, { metalness: 0.9, roughness: 0.3 })); wh.position.y = -0.04; wrench.add(wh);
  const ws = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.025, 6), mat(0xc9ccd0, { metalness: 1, roughness: 0.2 })); ws.position.set(0, -0.105, 0.01); ws.rotation.x = Math.PI / 2; wrench.add(ws);
  T.wrench = wrench;
  const wrest = wrench.clone(); wrest.position.set(0.42, BENCH_Y + 0.006, -0.36); wrest.rotation.set(0, 0.6, Math.PI / 2); scene.add(wrest);
  T.wrench.rest = wrest;
  // brush
  const brush = new THREE.Group();
  const bh = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.12, 10), mat(0x9a5b2e)); bh.position.y = -0.04; brush.add(bh);
  const bb = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.012), mat(0x2b2621)); bb.position.y = -0.12; brush.add(bb);
  T.brush = brush;
  const brest = brush.clone(); brest.position.set(-0.4, BENCH_Y + 0.01, 0.02); brest.rotation.set(0, -0.4, Math.PI / 2); scene.add(brest);
  T.brush.rest = brest;
  // clamp meter
  const clamp = new THREE.Group();
  const cb = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.025), mat(0xe2b80f)); cb.position.y = -0.03; clamp.add(cb);
  const jaw = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.007, 8, 24), mat(0x222222)); jaw.position.y = -0.12; clamp.add(jaw);
  const cd = makeDisplay(0.036, 0.02); cd.position.set(0, -0.01, 0.0131); clamp.add(cd);
  const jawEnd = new THREE.Object3D(); jawEnd.position.y = -0.12; clamp.add(jawEnd);
  clamp.userData.tip = jawEnd;
  T.clamp = { held: clamp, display: cd };
  const crest = clamp.clone(); crest.position.set(0.66, BENCH_Y + 0.013, 0.04); crest.rotation.set(Math.PI / 2, 0, 0.5); scene.add(crest);
  T.clamp.rest = crest;
  return T;
}

// Dial test indicator on a magnetic base, reading the shaft tip.
function dti(scene, motorRoot) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.04), mat(0x2b2f33, { metalness: 0.5 })); base.position.y = 0.02; base.castShadow = true; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.12, 10), mat(0xc0c4c8, { metalness: 1, roughness: 0.3 })); post.position.y = 0.1; g.add(post);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.09, 10), mat(0xc0c4c8, { metalness: 1, roughness: 0.3 })); arm.rotation.x = Math.PI / 2; arm.position.set(0, 0.15, -0.045); g.add(arm);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 32), mat(0xf4f4f0)); face.rotation.x = Math.PI / 2; face.position.set(0, 0.15, -0.09); g.add(face);
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.0015, 0.018, 0.001), new THREE.MeshBasicMaterial({ color: 0xc4231c }));
  needle.geometry.translate(0, 0.008, 0);
  const pivot = new THREE.Group(); pivot.position.set(0, 0.15, -0.0835); pivot.add(needle); g.add(pivot);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.03, 8), mat(0xc0c4c8, { metalness: 1 })); stem.position.set(0, 0.125, -0.09); g.add(stem);
  // stands in front of the motor, its stem resting on the top of the shaft extension
  const tip = motorRoot.localToWorld(new THREE.Vector3(X.shaftTip + 10, 12, 0));
  // base behind the shaft (Tetsuo's side), dial facing the front
  g.scale.setScalar(K);
  g.position.set(tip.x, tip.y - 0.11 * K, tip.z - 0.09 * K);
  g.rotation.y = Math.PI;
  scene.add(g);
  g.visible = false;
  return { group: g, needle: pivot };
}

function dust(motorRoot) {
  const fins = [], grille = [];
  let s = 11;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 1400; i++) {
    const a = (25 + rnd() * 130) * Math.PI / 180, r = 84 + rnd() * 8;
    fins.push(new THREE.Vector3(-80 + rnd() * 160, r * Math.sin(a), -r * Math.cos(a)));
  }
  for (let i = 0; i < 700; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 84;
    grille.push(new THREE.Vector3(X.cowlTo + 0.6, r * Math.sin(a), -r * Math.cos(a)));
  }
  fins.sort((p, q) => p.x - q.x);
  grille.sort((p, q) => p.length() - q.length());
  const make = (pts, size, color) => {
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const p = new THREE.Points(g, new THREE.PointsMaterial({ color, size, sizeAttenuation: true, transparent: true, opacity: 0.85 }));
    p.userData.n = pts.length;
    motorRoot.add(p);
    return p;
  };
  return { fins: make(fins, 0.005, 0xb3a68f), grille: make(grille, 0.0055, 0x9c907a) };
}

// Four poles of the rotating field, drawn as N/S arcs at the DE end of the stator bore.
function fieldRing(motorRoot) {
  const g = new THREE.Group();
  g.position.set(-X.core - 3, 0, 0);
  for (let i = 0; i < 4; i++) {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(46.5, 1.6, 8, 32, Math.PI / 2 * 0.8), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x2f6fd6 : 0xd6402f }));
    arc.rotation.set(0, Math.PI / 2, i * Math.PI / 2 + 0.16);
    g.add(arc);
  }
  g.visible = false;
  motorRoot.add(g);
  return g;
}

export function buildWorkshop(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdfe8ec);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.6;
  const key = new THREE.DirectionalLight(0xfff6ea, 2.2);
  key.position.set(1.2, 2.6, 1.4); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -1.6, right: 1.6, top: 1.6, bottom: -1.2, near: 0.5, far: 6 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.01;
  scene.add(key, new THREE.HemisphereLight(0xf2f6fa, 0x8a8478, 0.9));
  const lamp = new THREE.PointLight(0xfff1d6, 1.2, 3, 2); lamp.position.set(0, 1.6, 0.2); scene.add(lamp);

  room(scene);
  bench(scene);
  const iso = isolator(scene);
  const motor = buildMotor();
  motor.root.scale.setScalar(0.001 * K);
  motor.root.position.copy(MOTOR_POS);
  for (const p of motor.parts.values()) {
    p.base = p.group.position.clone();
    if (p.mount) p.group.visible = p.mount.includes('B3');
  }
  scene.add(motor.root);
  const T = tools(scene);
  T.dti = dti(scene, motor.root);
  const D = dust(motor.root);
  const field = fieldRing(motor.root);

  // supply cable: gland → off the front of the bench → along the floor → up the wall into the starter
  const gland = motor.root.localToWorld(new THREE.Vector3(BOX.x - 18, 116, 83));
  const cablePts = [gland, gland.clone().add(new THREE.Vector3(0.05, 0.0, 0.05)), new THREE.Vector3(gland.x + 0.17, gland.y - 0.12, gland.z + 0.02),
    new THREE.Vector3(0.24, BENCH_Y + 0.012, -0.0), new THREE.Vector3(0.05, BENCH_Y + 0.012, 0.06), new THREE.Vector3(-0.35, BENCH_Y + 0.012, 0.07),
    new THREE.Vector3(-0.5, BENCH_Y - 0.03, 0.12), new THREE.Vector3(-0.72, 0.3, 0.1), new THREE.Vector3(-0.8, 0.02, -0.6),
    new THREE.Vector3(-0.95, 0.02, WALL_Z + 0.03), new THREE.Vector3(-0.95, 0.65, WALL_Z + 0.03), new THREE.Vector3(-0.95, ISOLATOR.y - 0.27, WALL_Z + 0.03)];
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 140, 0.007, 10, false), mat(0x202326, { roughness: 0.5 }));
  cable.castShadow = true; scene.add(cable);

  // section planes through the motor axis, removing the top-front quarter
  const planes = [new THREE.Plane(new THREE.Vector3(0, -1, 0), MOTOR_POS.y), new THREE.Plane(new THREE.Vector3(0, 0, -1), MOTOR_POS.z)];
  const cutMats = [], caps = [];
  for (const p of motor.parts.values()) {
    if (!p.cut) continue;
    const meshes = [];
    p.group.traverse(o => { if (o.isMesh) meshes.push(o); });
    for (const o of meshes) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => { m.clipIntersection = true; cutMats.push(m); });
      if (o.geometry.type === 'PlaneGeometry' || mats[0].side === THREE.DoubleSide) continue;
      const src = mats[mats.length > 1 ? 1 : 0];
      const cap = new THREE.Mesh(o.geometry, new THREE.MeshBasicMaterial({ color: src.color ? src.color.clone().multiplyScalar(0.62) : 0x5d6770, side: THREE.BackSide, clippingPlanes: planes, clipIntersection: true }));
      cap.visible = false; o.add(cap); caps.push(cap);
    }
  }
  const setCut = on => {
    cutMats.forEach(m => { m.clippingPlanes = on ? planes : null; m.needsUpdate = true; });
    caps.forEach(c => { c.visible = on; });
  };

  // named points on the motor and the bench that hands, eyes and cameras go to
  const L = (x, y, z) => motor.root.localToWorld(new THREE.Vector3(x, y, z));
  const top = BOX_INSIDE.boardTop;
  const points = {
    isolator: ISOLATOR.clone().add(new THREE.Vector3(0.03, 0.02, 0.03)),
    hasp: ISOLATOR.clone().add(new THREE.Vector3(0.05, -0.03, 0.04)),
    start: ISOLATOR.clone().add(new THREE.Vector3(-0.025, -0.2, 0.04)),
    cores: new THREE.Vector3(-0.95, ISOLATOR.y - 0.3, WALL_Z + 0.06),
    proveA: T.proving.pads[0], proveB: T.proving.pads[1],
    nameplate: L(-12, 0, 86), box: L(BOX.x, 120, 0), lid: L(BOX.x, 150, 0),
    lidScrewA: L(BOX.x - 38, 147, -38), lidScrewB: L(BOX.x + 38, 147, -38), lidScrewC: L(BOX.x + 38, 147, 38), lidScrewD: L(BOX.x - 38, 147, 38),
    links: L(BOX.x + 3, top + 8, 0),
    PE: L(BOX_INSIDE.earth[0], BOX_INSIDE.floor + 12, BOX_INSIDE.earth[1]),
    TP1: L(BOX_INSIDE.tp[0][0], top + 1, BOX_INSIDE.tp[0][1]), TP2: L(BOX_INSIDE.tp[1][0], top + 1, BOX_INSIDE.tp[1][1]),
    shaftTip: L(X.shaftTip + 4, 0, 0), shaftTop: L(X.shaftTip + 15, 13, 0), key: L((X.keyFrom + X.keyTo) / 2, 16, 0),
    finsA: L(-60, 92, -20), finsB: L(60, 92, -20), grille: L(X.cowlTo + 4, 30, -10), grilleB: L(X.cowlTo + 4, -30, 10),
    gland: L(BOX.x - 18, 116, 75), cable: cablePts[3].clone(),
    foot: L(-X.feet, -80, -70), meter: T.meter.group.position.clone().add(new THREE.Vector3(0.05, 0.07, 0.03)),
    dti: T.dti.group.position.clone().add(new THREE.Vector3(0, 0.15, 0)),
  };
  for (const [n, [x, z]] of Object.entries(TERMINALS)) points[n] = L(x, top + 13, z);

  return { scene, motor, iso, tools: T, dust: D, field, setCut, points, cablePts };
}
