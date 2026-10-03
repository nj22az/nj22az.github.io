// IEC 90L-4, 1.5 kW TEFC induction motor, built part by part in millimetres.
// Axis along x, drive end (DE) toward −x, shaft centre at the origin, feet at y = −H.
// Every dimension comes from calc.mjs (IEC 60072-1 / FF165) or the design notes in AUDIT.md.
import * as THREE from 'three';
import { mergeGeometries } from './vendor/BufferGeometryUtils.js';
import { IEC, CORE, SLOT } from './calc.mjs';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

// ---------- axial layout (mm) ----------
export const X = Object.freeze({
  shaftTip: -168.5, shoulder: -118.5,            // E = 50 from the shoulder
  keyFrom: -163.5, keyTo: -123.5,                // 8×7×40 key
  sealFrom: -118.5, sealTo: -111,                // 25×42×7 lip seal
  bDEfrom: -111, bDEto: -96,                     // 6205: 25×52×15
  frame: 85, core: 55,
  bNDEfrom: 88, bNDEto: 102,                     // 6204: 20×47×14
  fanFrom: 106, fanTo: 129, cowlFrom: 86, cowlTo: 174.4, shaftEnd: 134,
  feet: 62.5,                                    // ±B/2; shoulder → first foot = C = 56
});
export const BOX = Object.freeze({ x: 35, y0: 86, half: 46, top: 140 });

// ---------- textures ----------
function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function noiseTexture(size = 256, lo = 110, hi = 160, seed = 7) {
  const [c, g] = canvas(size, size);
  const img = g.createImageData(size, size);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < size * size; i++) {
    const v = lo + (hi - lo) * rnd();
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  // soften into a cast-skin orange peel
  g.globalAlpha = 0.5;
  g.filter = 'blur(1.5px)';
  g.drawImage(c, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Lamination stripes along the texture v axis: two 0.5 mm sheets per unit.
function laminationTexture() {
  const [c, g] = canvas(8, 64);
  for (let y = 0; y < 64; y++) {
    const inSheet = (y % 32) < 29;
    const v = inSheet ? 150 + ((y * 37) % 11) : 70;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(0, y, 8, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Skim-cut rotor surface: lamination lines plus the 28 skewed aluminium bars under the bridges.
function rotorSurfaceTexture() {
  const W = 1024, H = 1024;
  const [c, g] = canvas(W, H);
  g.fillStyle = '#9aa1a8'; g.fillRect(0, 0, W, H);
  const skew = W / CORE.slots; // one stator slot pitch across the stack
  g.strokeStyle = 'rgba(214,220,226,0.55)';
  g.lineWidth = W / CORE.rotorSlots * 0.28;
  for (let i = 0; i < CORE.rotorSlots; i++) {
    const u = (i + 0.5) * W / CORE.rotorSlots;
    for (const off of [-W, 0, W]) {
      g.beginPath(); g.moveTo(u + off, 0); g.lineTo(u + off + skew, H); g.stroke();
    }
  }
  const sheets = CORE.stack / 0.5;
  for (let i = 0; i < sheets; i++) {
    const y = i * H / sheets;
    g.fillStyle = 'rgba(40,46,52,0.35)';
    g.fillRect(0, y, W, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function nameplateTexture() {
  const [c, g] = canvas(1080, 560);
  g.fillStyle = '#d9dcdf'; g.fillRect(0, 0, 1080, 560);
  g.strokeStyle = '#2b2f33'; g.lineWidth = 6; g.strokeRect(14, 14, 1052, 532);
  g.fillStyle = '#1d2226';
  g.font = '700 46px Arial, Helvetica, sans-serif';
  g.fillText('JOHANSSON MOTOR WORKS', 40, 76);
  g.font = '600 26px Arial, Helvetica, sans-serif';
  g.fillText('IEC/EN 60034-1', 820, 74);
  g.fillRect(36, 96, 1008, 3);
  g.font = '500 30px "Courier New", monospace';
  const rows = [
    ['3~ Mot.  JM 90L-4', 'No. 0001/2026'],
    ['IM B35   IP66   IC411', 'Th.Cl. F (ΔT B)'],
    ['Δ 230 V  5.7 A', 'Y 400 V  3.3 A'],
    ['1.5 kW  S1   50 Hz', '1440 min⁻¹'],
    ['cos φ 0.79', 'IE3  83.5 %'],
    ['DE 6205-2RS/C3', 'NDE 6204-2RS/C3'],
    ['PTC 150 °C  3× series', 'T.amb −20…+45 °C'],
    ['18 kg', 'Made in Johansson Town'],
  ];
  rows.forEach(([a, b], i) => {
    g.fillText(a, 40, 146 + i * 54);
    g.fillText(b, 600, 146 + i * 54);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function warningTexture() {
  const [c, g] = canvas(256, 230);
  g.clearRect(0, 0, 256, 230);
  g.beginPath(); g.moveTo(128, 8); g.lineTo(248, 220); g.lineTo(8, 220); g.closePath();
  g.fillStyle = '#f2c500'; g.fill();
  g.lineWidth = 14; g.strokeStyle = '#141414'; g.lineJoin = 'round'; g.stroke();
  g.fillStyle = '#141414';
  g.beginPath();
  g.moveTo(140, 62); g.lineTo(104, 140); g.lineTo(130, 140); g.lineTo(114, 196);
  g.lineTo(156, 116); g.lineTo(130, 116); g.lineTo(148, 62); g.closePath(); g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function boardLabelTexture(delta) {
  const [c, g] = canvas(512, 330);
  g.fillStyle = '#efe9dc'; g.fillRect(0, 0, 512, 330);
  g.fillStyle = '#7a1f12';
  g.font = '700 44px Arial, Helvetica, sans-serif';
  g.textAlign = 'center';
  // rows across z (−22, 0, +22 mm) → u; row 1 near DE, row 2 toward NDE
  const us = [110, 256, 402];
  ['U1', 'V1', 'W1'].forEach((t, i) => g.fillText(t, us[i], 300));
  ['W2', 'U2', 'V2'].forEach((t, i) => g.fillText(t, us[i], 64));
  g.font = '600 26px Arial, Helvetica, sans-serif';
  g.fillStyle = '#3a3a3a';
  g.fillText(delta ? 'Δ 230 V' : 'Y 400 V', 256, 180);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function earthTexture() {
  const [c, g] = canvas(128, 128);
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? '#1f8a3c' : '#f2d21b';
    g.save(); g.translate(64, 64); g.rotate(Math.PI / 4);
    g.fillRect(-100 + i * 25, -100, 25, 200); g.restore();
  }
  g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 34, 0, TAU); g.fill();
  g.strokeStyle = '#111'; g.lineWidth = 7;
  g.beginPath(); g.moveTo(64, 36); g.lineTo(64, 66); g.stroke();
  [[40, 66, 48], [48, 78, 32], [56, 90, 16]].forEach(([x, y, w]) => {
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.stroke();
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- materials ----------
const TEX = {};
function textures() {
  if (TEX.cast) return TEX;
  TEX.cast = noiseTexture();
  TEX.lam = laminationTexture();
  TEX.rotor = rotorSurfaceTexture();
  return TEX;
}

const PHASE = { U: 0x7a4a26, V: 0x262626, W: 0x8e9296 }; // IEC 60445: brown, black, grey

export function makeMaterial(kind) {
  const t = textures();
  const P = (o) => new THREE.MeshPhysicalMaterial(o);
  switch (kind) {
    case 'paint': { // cast aluminium, powder coated
      const m = P({ color: 0x80868b, metalness: 0.25, roughness: 0.52, clearcoat: 0.35, clearcoatRoughness: 0.45 });
      m.bumpMap = t.cast.clone(); m.bumpMap.needsUpdate = true; m.bumpMap.repeat.set(1 / 28, 1 / 28); m.bumpScale = 0.35;
      return m;
    }
    case 'paintLathe': {
      const m = P({ color: 0x80868b, metalness: 0.25, roughness: 0.52, clearcoat: 0.35, clearcoatRoughness: 0.45 });
      m.bumpMap = t.cast.clone(); m.bumpMap.needsUpdate = true; m.bumpMap.repeat.set(14, 3); m.bumpScale = 0.35;
      return m;
    }
    case 'sheet': return P({ color: 0x858b90, metalness: 0.3, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3, side: THREE.DoubleSide });
    case 'machined': return P({ color: 0xb7bcc1, metalness: 0.9, roughness: 0.32 });
    case 'laminationSide': {
      const m = P({ color: 0x8f99a3, metalness: 0.75, roughness: 0.38 });
      m.map = t.lam; m.bumpMap = t.lam; m.bumpScale = 0.6;
      return m;
    }
    case 'laminationFace': return P({ color: 0x7d8790, metalness: 0.8, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2 });
    case 'rotorSurface': return P({ map: t.rotor, metalness: 0.8, roughness: 0.3 });
    case 'aluminium': return P({ color: 0xc3c8cc, metalness: 0.95, roughness: 0.42 });
    case 'shaft': return P({ color: 0xd2d6da, metalness: 1, roughness: 0.18 });
    case 'keySteel': return P({ color: 0x9fa4a8, metalness: 0.9, roughness: 0.35 });
    case 'copper': return P({ color: 0xc0692e, metalness: 0.95, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.12 });
    case 'bearing': return P({ color: 0xd9dde1, metalness: 1, roughness: 0.12 });
    case 'fkm': return P({ color: 0x5b2a17, metalness: 0, roughness: 0.75 });
    case 'rubber': return P({ color: 0x151515, metalness: 0, roughness: 0.85 });
    case 'pp': return P({ color: 0xe9e6dd, metalness: 0, roughness: 0.55, sheen: 0.2 });
    case 'brass': return P({ color: 0xc9a14a, metalness: 1, roughness: 0.3 });
    case 'nickel': return P({ color: 0xd6d9db, metalness: 1, roughness: 0.22 });
    case 'zinc': return P({ color: 0xb9bdc0, metalness: 0.95, roughness: 0.35 });
    case 'porcelain': return P({ color: 0xefe9dc, metalness: 0, roughness: 0.25, clearcoat: 0.8 });
    case 'nmn': return P({ color: 0xf1ede2, metalness: 0, roughness: 0.8 });
    case 'g11': return P({ color: 0xc9b780, metalness: 0, roughness: 0.6 });
    case 'cord': return P({ color: 0xf4f1e8, metalness: 0, roughness: 0.9 });
    case 'ptc': return P({ color: 0x2f6fb5, metalness: 0, roughness: 0.5 });
    case 'leadU': return P({ color: PHASE.U, roughness: 0.6 });
    case 'leadV': return P({ color: PHASE.V, roughness: 0.6 });
    case 'leadW': return P({ color: PHASE.W, roughness: 0.6 });
    case 'white': return P({ color: 0xf2f2ee, roughness: 0.6 });
    case 'dark': return P({ color: 0x2b2e31, metalness: 0.3, roughness: 0.6 });
    case 'steelPad': return P({ color: 0x5f666c, metalness: 0.7, roughness: 0.5 });
    default: throw new Error('unknown material ' + kind);
  }
}

// ---------- geometry helpers ----------
const V2 = (x, y) => new THREE.Vector2(x, y);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// Point at radius r, angle θ around the x axis (θ = 0 → −z, θ = 90° → +y), matching extrudeX shapes.
const polar = (x, r, th) => V3(x, r * Math.sin(th), -r * Math.cos(th));

// Solid of revolution about x from a closed [x, r] outline (any winding).
function lathe(outline, segs = 96) {
  let area = 0;
  for (let i = 0; i < outline.length; i++) {
    const [x1, r1] = outline[i], [x2, r2] = outline[(i + 1) % outline.length];
    area += r1 * x2 - r2 * x1;
  }
  const pts = (area < 0 ? [...outline].reverse() : outline).map(([x, r]) => V2(Math.max(r, 0), x));
  pts.push(pts[0].clone());
  const g = new THREE.LatheGeometry(pts, segs);
  g.rotateZ(-Math.PI / 2);
  return g;
}

// Open [x, r] profile (sheet metal); use with a double-sided material.
function latheOpen(profile, segs = 96) {
  const g = new THREE.LatheGeometry(profile.map(([x, r]) => V2(r, x)), segs);
  g.rotateZ(-Math.PI / 2);
  return g;
}

// Shape in (u, v) = (−z, y) extruded along x from x0 to x1.
function extrudeX(shape, x0, x1, curveSegments = 24) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false, curveSegments });
  g.rotateY(Math.PI / 2);
  g.translate(x0, 0, 0);
  return g;
}

// Shape in (u, v) = (x, −z) extruded along y from y0 to y1.
function extrudeY(shape, y0, y1, curveSegments = 12) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false, curveSegments });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0, 0);
  return g;
}

function roundedRect(w, h, r, cx = 0, cy = 0, path = new THREE.Shape()) {
  const x = cx - w / 2, y = cy - h / 2;
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y); path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + h - r); path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  path.lineTo(x + r, y + h); path.quadraticCurveTo(x, y + h, x, y + h - r);
  path.lineTo(x, y + r); path.quadraticCurveTo(x, y, x + r, y);
  return path;
}

function circlePath(cx, cy, r, PathType = THREE.Path) {
  const p = new PathType();
  p.absarc(cx, cy, r, 0, TAU, false);
  return p;
}

// Box radial at angle θ: length lx along x centred on cx, spanning r0..r1 radially, width w.
function radialBox(cx, lx, r0, r1, w, th) {
  const g = new THREE.BoxGeometry(lx, r1 - r0, w);
  g.translate(cx, (r0 + r1) / 2, 0);
  g.rotateX(th - Math.PI / 2);
  return g;
}

// Cylinder along x.
function cylX(r, x0, x1, segs = 32, r2 = r) {
  const g = new THREE.CylinderGeometry(r2, r, x1 - x0, segs);
  g.rotateZ(-Math.PI / 2);
  g.translate((x0 + x1) / 2, 0, 0);
  return g;
}
function cylY(r, y0, y1, segs = 32) {
  const g = new THREE.CylinderGeometry(r, r, y1 - y0, segs);
  g.translate(0, (y0 + y1) / 2, 0);
  return g;
}
function cylZ(r, z0, z1, segs = 32) {
  const g = new THREE.CylinderGeometry(r, r, z1 - z0, segs);
  g.rotateX(Math.PI / 2);
  g.translate(0, 0, (z0 + z1) / 2);
  return g;
}

function merge(list) {
  const flat = list.map(g => {
    const n = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k);
    n.clearGroups();
    return n;
  });
  return mergeGeometries(flat, false);
}

// Hex bolt head with washer, axis along +dir from point p.
function hexBolt(across = 10, height = 4, washer = true) {
  const r = across / Math.sqrt(3);
  const parts = [];
  const head = new THREE.CylinderGeometry(r, r, height, 6);
  head.translate(0, height / 2 + (washer ? 1 : 0), 0);
  parts.push(head);
  if (washer) { const w = new THREE.CylinderGeometry(r * 1.15, r * 1.15, 1, 24); w.translate(0, 0.5, 0); parts.push(w); }
  return merge(parts);
}

// Place a geometry built along +y so +y points along `dir` at `pos`.
function orient(g, pos, dir) {
  const q = new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), dir.clone().normalize());
  g.applyMatrix4(new THREE.Matrix4().compose(pos, q, V3(1, 1, 1)));
  return g;
}

// ---------- the frame ----------
const FRAME_R = 80, FRAME_BORE = CORE.OD / 2;
const BOSS_R = 89, BOSS_ANGLES = [45, 135, 225, 315];

function finTip(a) {
  // rounded-square envelope of the fin tips (superellipse), as on cast IEC frames
  const n = 2.6, A = 88;
  return A / Math.pow(Math.abs(Math.cos(a)) ** n + Math.abs(Math.sin(a)) ** n, 1 / n);
}

function frameSection() {
  const feats = [];
  for (let k = 0; k < 48; k++) {
    const deg = 3.75 + 7.5 * k;
    const near = (c, w) => Math.abs(((deg - c + 540) % 360) - 180) < w;
    if (near(90, 34) || near(270, 36) || near(180, 20)) continue;
    const a = deg * DEG, d = V2(Math.cos(a), Math.sin(a)), p = V2(-Math.sin(a), Math.cos(a));
    const tr = 1.9, tt = 1.1, rt = finTip(a);
    const rb = Math.sqrt(FRAME_R ** 2 - tr ** 2) - 0.2;
    const at = (r, s) => d.clone().multiplyScalar(r).add(p.clone().multiplyScalar(s));
    feats.push({ a, pts: [at(rb, -tr), at(rt - 0.6, -tt), at(rt, -tt * 0.5), at(rt, tt * 0.5), at(rt - 0.6, tt), at(rb, tr)] });
  }
  // flat pad on top for the terminal box, and the rating-plate pad on the +z side
  const yTop = Math.sqrt(FRAME_R ** 2 - 40 ** 2);
  feats.push({ a: 90 * DEG, pts: [V2(40, yTop), V2(40, BOX.y0), V2(-40, BOX.y0), V2(-40, yTop)] });
  const xPl = Math.sqrt(FRAME_R ** 2 - 24 ** 2);
  feats.push({ a: 180 * DEG, pts: [V2(-xPl, 24), V2(-86, 24), V2(-86, -24), V2(-xPl, -24)] });
  feats.sort((p, q) => p.a - q.a);

  const ang = v => (Math.atan2(v.y, v.x) + TAU) % TAU;
  const shape = new THREE.Shape();
  const out = [];
  feats.forEach((f, i) => {
    out.push(...f.pts);
    const next = feats[(i + 1) % feats.length];
    let a0 = ang(f.pts[f.pts.length - 1]), a1 = ang(next.pts[0]);
    if (a1 < a0) a1 += TAU;
    const steps = Math.max(1, Math.ceil((a1 - a0) / (2 * DEG)));
    for (let s = 1; s < steps; s++) {
      const t = a0 + (a1 - a0) * s / steps;
      out.push(V2(FRAME_R * Math.cos(t), FRAME_R * Math.sin(t)));
    }
  });
  shape.setFromPoints(out);
  shape.holes.push(circlePath(0, 0, FRAME_BORE));
  return shape;
}

// Cast lugs at both frame ends for the end-shield screws (M6, at 45°).
function frameLugs() {
  const out = [];
  for (const sg of [-1, 1]) for (const deg of BOSS_ANGLES) {
    const a = deg * DEG, u = BOSS_R * Math.cos(a), v = BOSS_R * Math.sin(a);
    const x0 = sg * (X.frame - 16), x1 = sg * X.frame;
    const c = cylX(6.5, Math.min(x0, x1), Math.max(x0, x1), 24); c.translate(0, v, -u); out.push(c);
    out.push(radialBox((x0 + x1) / 2, 16, 76, BOSS_R, 11, Math.atan2(v, u)));
    // tapered run-out of the lug into the fins
    const t = sg > 0 ? cylX(3, x0 - 10, x0, 24, 6.5) : cylX(6.5, x0, x0 + 10, 24, 3);
    t.translate(0, v, -u); out.push(t);
  }
  return merge(out);
}

function feetGeometry() {
  const parts = [];
  for (const xc of [-X.feet, X.feet]) {
    const plate = roundedRect(36, 175, 3, xc, 0);
    for (const z of [-IEC.A / 2, IEC.A / 2]) plate.holes.push(circlePath(xc, z, IEC.K / 2));
    parts.push(extrudeY(plate, -IEC.H, -IEC.H + 12));
    for (const s of [1, -1]) {
      const g = new THREE.Shape([V2(s * 40, -78), V2(s * 87.5, -78), V2(s * 87.5, -73), V2(s * 48, -63.6)].map(v => v));
      parts.push(extrudeX(g, xc - 16, xc + 16));
    }
    parts.push(extrudeX(new THREE.Shape([V2(-41, -78), V2(41, -78), V2(41, -68), V2(-41, -68)]), xc - 18, xc + 18));
  }
  return merge(parts);
}

// ---------- stator core and winding ----------
function coreSection() {
  const shape = circlePath(0, 0, FRAME_BORE, THREE.Shape);
  const S = SLOT, pts = [];
  const local = (rho, tau, th) => V2(rho * Math.cos(th) - tau * Math.sin(th), rho * Math.sin(th) + tau * Math.cos(th));
  for (let s = 0; s < CORE.slots; s++) {
    const th = s * TAU / CORE.slots;
    const prevTh = th - TAU / CORE.slots;
    // tooth tip arc from the previous slot opening to this one
    const a0 = prevTh + Math.asin(S.halfOpen / S.rOpen), a1 = th - Math.asin(S.halfOpen / S.rOpen);
    for (let i = 1; i < 4; i++) {
      const t = a0 + (a1 - a0) * i / 4;
      pts.push(V2(S.rOpen * Math.cos(t), S.rOpen * Math.sin(t)));
    }
    const side = sg => [[S.rOpen, sg * S.halfOpen], [46.2, sg * S.halfOpen], [S.rNeck, sg * S.halfNeck], [S.rBottomCentre, sg * S.halfTop]];
    side(-1).forEach(([r, t]) => pts.push(local(r, t, th)));
    for (let b = -80; b <= 80; b += 20) {
      const bb = b * DEG;
      pts.push(local(S.rBottomCentre + S.halfTop * Math.cos(bb), S.halfTop * Math.sin(bb), th));
    }
    side(1).reverse().forEach(([r, t]) => pts.push(local(r, t, th)));
  }
  const hole = new THREE.Path(); hole.setFromPoints(pts);
  shape.holes.push(hole);
  return shape;
}

// Double-layer lap winding, 36 slots, 4 poles, q = 3, coil pitch 1–8.
const BELTS = ['U', 'U', 'U', 'W', 'W', 'W', 'V', 'V', 'V', 'U', 'U', 'U', 'W', 'W', 'W', 'V', 'V', 'V'];
export const slotPhase = s => BELTS[s % 18];

function endWinding(sgn) {
  const byPhase = { U: [], V: [], W: [] };
  const pitch = CORE.coilPitchSlots, step = TAU / CORE.slots;
  for (let s = 0; s < CORE.slots; s++) {
    const t1 = s * step, t2 = (s + pitch) * step, d = t2 - t1;
    const rT = 50.2, rB = 57.6; // top (bore side) and bottom layer of the slot
    const pts = [
      [50, rT, 0], [57.5, rT, 0], [62, rT + 2.2, 0.16], [68, 57, 0.36], [71.5, 60.5, 0.5],
      [68, 62.2, 0.64], [62, 60.8, 0.84], [57.5, rB, 1], [50, rB, 1],
    ].map(([x, r, f]) => polar(sgn * x, r, t1 + d * f));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    byPhase[slotPhase(s)].push(new THREE.TubeGeometry(curve, 40, 3.1, 8, false));
  }
  return byPhase;
}

function slotContents() {
  const cond = [], wedge = [], liner = [];
  for (let s = 0; s < CORE.slots; s++) {
    const th = s * TAU / CORE.slots;
    cond.push(radialBox(0, 2 * CORE.stack / 2 + 4, 47.6, 61.6, 4.3, th));
    wedge.push(radialBox(0, CORE.stack + 6, 46.4, 47.4, 4.3, th));
    for (const sg of [-1, 1]) liner.push(radialBox(sg * (X.core + 2), 4, 46.9, 61.9, 5.0, th));
  }
  return { cond: merge(cond), wedge: merge(wedge), liner: merge(liner) };
}

// ---------- rotor and shaft ----------
function shaftGeometry() {
  const main = lathe([
    [X.keyTo, 0], [X.keyTo, 12], [X.shoulder, 12], [X.shoulder, 12.5], [X.bDEto, 12.5], [X.bDEto, 15.5],
    [-66, 15.5], [-66, 17], [66, 17], [66, 13], [X.bNDEfrom, 13], [X.bNDEfrom, 10], [X.bNDEto, 10], [X.bNDEto, 9],
    [130, 9], [130, 8.2], [131.2, 8.2], [131.2, 9], [133.3, 9], [X.shaftEnd, 8.2], [X.shaftEnd, 0],
  ], 64);
  const tip = lathe([[X.shaftTip, 0], [X.shaftTip, 11], [X.shaftTip + 1, 12], [X.keyFrom, 12], [X.keyFrom, 0]], 64);
  // keyed section: Ø24 with an 8 mm wide, 4 mm deep keyway at the top
  const a0 = Math.atan2(Math.sqrt(144 - 16), -4), a1 = Math.atan2(Math.sqrt(144 - 16), 4) + TAU;
  const ks = new THREE.Shape();
  ks.moveTo(-4, Math.sqrt(144 - 16));
  ks.absarc(0, 0, 12, a0, a1, false);
  ks.lineTo(4, 8); ks.lineTo(-4, 8); ks.closePath();
  const keyed = extrudeX(ks, X.keyFrom, X.keyTo, 48);
  return merge([main, tip, keyed]);
}

function keyGeometry() {
  // DIN 6885 form A, 8 × 7 × 40, round ends; sits 4 mm deep, top at GA − D/2 = 15 mm
  const s = new THREE.Shape();
  const L = X.keyTo - X.keyFrom, cx = (X.keyFrom + X.keyTo) / 2;
  s.absarc(cx - L / 2 + 4, 0, 4, Math.PI / 2, Math.PI * 1.5, false);
  s.absarc(cx + L / 2 - 4, 0, 4, -Math.PI / 2, Math.PI / 2, false);
  s.closePath();
  return extrudeY(s, 8, IEC.GA - IEC.D / 2, 16);
}

function rotorParts() {
  const rOut = CORE.bore / 2 - CORE.airgap; // 44.65 mm
  const stack = new THREE.CylinderGeometry(rOut, rOut, CORE.stack, 128, 1, false);
  stack.rotateZ(-Math.PI / 2);
  const rings = [], fins = [];
  for (const sg of [-1, 1]) {
    rings.push(lathe([[sg * X.core, 30], [sg * X.core, 43.6], [sg * (X.core + 7), 43.6], [sg * (X.core + 8), 42.6], [sg * (X.core + 8), 30]], 96));
    for (let i = 0; i < 9; i++) fins.push(radialBox(sg * (X.core + 11.5), 7, 31, 42.5, 2.4, i * TAU / 9 + (sg > 0 ? 0.2 : 0)));
  }
  // balancing: two drillings in the NDE ring (ISO 1940 G2.5)
  const drill = [cylX(1.6, X.core + 7.5, X.core + 8.2, 16), cylX(1.6, X.core + 7.5, X.core + 8.2, 16)];
  drill[0].translate(0, 36, 6); drill[1].translate(0, 34, -12);
  return { stack, cage: merge([...rings, ...fins]), drill: merge(drill) };
}

// ---------- bearings ----------
function bearing({ d, D, B, Z, dw }, xc) {
  const ri = d / 2, ro = D / 2, pitch = (ri + ro) / 2;
  const land = dw * 0.36;
  const groove = (rBase, sgn) => {
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const a = -Math.PI / 2 + Math.PI * i / 8;
      pts.push([xc + Math.sin(a) * dw * 0.42, rBase + sgn * Math.cos(a) * dw * 0.14]);
    }
    return pts;
  };
  const inner = lathe([
    [xc - B / 2 + 0.6, ri], [xc + B / 2 - 0.6, ri], [xc + B / 2, ri + 0.6], [xc + B / 2, pitch - land - 0.5], [xc + B / 2 - 0.5, pitch - land],
    ...groove(pitch - land, -1).reverse(), [xc - B / 2 + 0.5, pitch - land], [xc - B / 2, pitch - land - 0.5], [xc - B / 2, ri + 0.6],
  ], 64);
  const outer = lathe([
    [xc - B / 2 + 0.6, ro], [xc - B / 2, ro - 0.6], [xc - B / 2, pitch + land + 0.5], [xc - B / 2 + 0.5, pitch + land],
    ...groove(pitch + land, 1), [xc + B / 2 - 0.5, pitch + land], [xc + B / 2, pitch + land + 0.5], [xc + B / 2, ro - 0.6], [xc + B / 2 - 0.6, ro],
  ], 64);
  const balls = [];
  for (let i = 0; i < Z; i++) {
    const g = new THREE.SphereGeometry(dw / 2, 16, 12);
    const p = polar(xc, pitch, i * TAU / Z);
    g.translate(p.x, p.y, p.z);
    balls.push(g);
  }
  const cage = lathe([[xc - dw * 0.25, pitch - 0.6], [xc + dw * 0.25, pitch - 0.6], [xc + dw * 0.25, pitch + 0.6], [xc - dw * 0.25, pitch + 0.6]], 64);
  const seals = [];
  for (const sg of [-1, 1]) {
    const xf = xc + sg * (B / 2 - 0.8);
    seals.push(lathe([[xf - 0.6, pitch - land + 0.2], [xf + 0.6, pitch - land + 0.2], [xf + 0.6, pitch + land + 0.6], [xf - 0.6, pitch + land + 0.6]], 64));
  }
  return { rings: merge([inner, outer]), balls: merge([...balls, cage]), seals: merge(seals) };
}

// ---------- end shields ----------
function shieldLugs(sgn, xFace) {
  const lugs = [], bolts = [];
  for (const deg of BOSS_ANGLES) {
    const a = deg * DEG;
    const u = BOSS_R * Math.cos(a), v = BOSS_R * Math.sin(a);
    const lug = cylX(6.5, Math.min(sgn * X.frame, xFace), Math.max(sgn * X.frame, xFace), 24);
    lug.translate(0, v, -u);
    lugs.push(lug, radialBox((sgn * X.frame + xFace) / 2, Math.abs(xFace - sgn * X.frame), 74, BOSS_R, 9, Math.atan2(v, u)));
    bolts.push(orient(hexBolt(10, 4), V3(xFace, v, -u), V3(sgn, 0, 0)));
  }
  return { lugs: merge(lugs), bolts: merge(bolts) };
}

function shieldNDE() {
  const body = lathe([
    [78, 72], [78, 74.8], [X.frame, 74.8], [X.frame, 80], [92, 80], [92, 70], [95, 50], [95, 31], [105.5, 31],
    [105.5, 11], [103.5, 11], [103.5, 23.5], [X.bNDEfrom, 23.5], [X.bNDEfrom, 28], [86, 48], [86, 72],
  ], 96);
  const ribs = [];
  for (let i = 0; i < 6; i++) ribs.push(radialBox(94, 4, 32, 70, 3, (i + 0.5) * TAU / 6));
  const cowlLugs = [];
  for (const deg of [90, 210, 330]) cowlLugs.push(radialBox(91, 6, 76, 96.4, 10, deg * DEG));
  const { lugs, bolts } = shieldLugs(1, 92);
  return { body: merge([body, ...ribs, lugs, ...cowlLugs]), bolts };
}

function shieldDE_B3() {
  const body = lathe([
    [-78, 72], [-78, 74.8], [-X.frame, 74.8], [-X.frame, 80], [-92, 80], [-92, 70], [-95, 50], [-95, 32], [X.shoulder, 32],
    [X.shoulder, 21], [X.sealTo, 21], [X.sealTo, 26], [X.bDEto, 26], [-90, 40], [-86, 48], [-86, 72],
  ], 96);
  const ribs = [];
  for (let i = 0; i < 6; i++) ribs.push(radialBox(-94.5, 5, 32, 72, 3.5, (i + 0.5) * TAU / 6));
  const { lugs, bolts } = shieldLugs(-1, -92);
  return { body: merge([body, ...ribs, lugs]), bolts };
}

function flangeDE_B5() {
  const face = X.shoulder; // assumed: mounting face in the shoulder plane (see AUDIT.md)
  const plate = circlePath(0, 0, IEC.P / 2, THREE.Shape);
  for (let i = 0; i < 4; i++) {
    const a = (45 + 90 * i) * DEG;
    plate.holes.push(circlePath(IEC.M / 2 * Math.cos(a), IEC.M / 2 * Math.sin(a), IEC.S / 2));
  }
  plate.holes.push(circlePath(0, 0, 50));
  const flange = extrudeX(plate, face, face + IEC.LA, 64);
  const spigot = lathe([[face - IEC.T, 50], [face - IEC.T, IEC.N / 2 - 0.5], [face - IEC.T + 0.5, IEC.N / 2], [face, IEC.N / 2], [face, 50]], 128);
  const body = lathe([
    [-78, 72], [-78, 74.8], [-X.frame, 74.8], [-X.frame, 80], [-90, 80], [face + IEC.LA, 93], [face + IEC.LA, 50],
    [-110, 34], [X.shoulder, 32], [X.shoulder, 21], [X.sealTo, 21], [X.sealTo, 26], [X.bDEto, 26], [-90, 40], [-86, 48], [-86, 72],
  ], 96);
  const ribs = [];
  for (let i = 0; i < 4; i++) ribs.push(radialBox(-98, 14, 80, 96, 4, i * TAU / 4));
  const { lugs, bolts } = shieldLugs(-1, -92);
  return { body: merge([flange, spigot, body, ...ribs, lugs]), bolts };
}

function lipSeal() {
  const x0 = X.shoulder + 0.5, x1 = X.sealTo;
  const lip = lathe([[x0, 12.5], [x0 + 2, 12.5], [x1, 15], [x1, 20.4], [x0, 20.4]], 64);
  const can = lathe([[x0 - 0.3, 20.4], [x1, 20.4], [x1, 21], [x0 - 0.3, 21]], 64);
  return { lip, can };
}

function waveSpring() {
  const pts = [];
  for (let i = 0; i <= 180; i++) {
    const a = i * TAU / 180;
    pts.push(polar(X.bNDEto + 0.75 + 0.55 * Math.sin(3 * a), 21.2, a));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 180, 0.55, 6, true);
}

// ---------- fan, cowl ----------
function fanGeometry() {
  const hub = lathe([[X.fanFrom, 9], [X.fanTo, 9], [X.fanTo, 14], [X.fanFrom + 4, 16.5], [X.fanFrom, 16.5]], 48);
  const disc = lathe([[110, 16], [110, 89], [112, 89], [112, 16]], 96);
  const blades = [];
  for (let i = 0; i < 10; i++) blades.push(radialBox(119.5, 15, 15, 88.5, 2.4, i * TAU / 10));
  return merge([hub, disc, ...blades]);
}

function cowlGeometry() {
  const R = 97.2, rc = 13.2, xe = X.cowlTo - 0.4;
  const prof = [[X.cowlFrom, R], [xe - rc, R]];
  for (let i = 1; i <= 10; i++) {
    const a = i / 10 * Math.PI / 2;
    prof.push([xe - rc + rc * Math.sin(a), R - rc + rc * Math.cos(a)]);
  }
  prof.push([xe, 86]);
  const shell = latheOpen(prof, 128);
  const bead = new THREE.TorusGeometry(R, 1.1, 8, 128);
  bead.rotateY(Math.PI / 2); bead.translate(X.cowlFrom, 0, 0);
  const grille = circlePath(0, 0, 88.5, THREE.Shape);
  for (let r = 19; r <= 82; r += 7) {
    const n = Math.floor(TAU * r / 8);
    for (let i = 0; i < n; i++) {
      const a = (i + (r % 2) * 0.5) * TAU / n;
      grille.holes.push(circlePath(r * Math.cos(a), r * Math.sin(a), 2.4));
    }
  }
  const grid = extrudeX(grille, xe - 0.9, xe, 8);
  const screws = [];
  for (const deg of [90, 210, 330]) {
    const a = deg * DEG, dir = polar(0, 1, a);
    screws.push(orient(hexBolt(8, 3, true), polar(91, R, a), dir));
  }
  return { shell: merge([shell, bead]), grid, screws: merge(screws) };
}

// ---------- terminal box ----------
const STUD_X = [BOX.x - 9, BOX.x + 15], STUD_Z = [-22, 0, 22];
export const TERMINALS = {
  U1: [STUD_X[0], STUD_Z[0]], V1: [STUD_X[0], STUD_Z[1]], W1: [STUD_X[0], STUD_Z[2]],
  W2: [STUD_X[1], STUD_Z[0]], U2: [STUD_X[1], STUD_Z[1]], V2: [STUD_X[1], STUD_Z[2]],
};
const FLOOR = BOX.y0 + 7, BOARD_TOP = FLOOR + 10;

function terminalBox() {
  const h = BOX.half * 2;
  const base = extrudeY(roundedRect(84, 84, 6, BOX.x, 0), BOX.y0, BOX.y0 + 4);
  const wall = roundedRect(h, h, 8, BOX.x, 0);
  wall.holes.push(roundedRect(h - 6, h - 6, 5, BOX.x, 0, new THREE.Path()));
  const walls = extrudeY(wall, BOX.y0 + 4, BOX.top);
  const floor = extrudeY(roundedRect(h - 5, h - 5, 5, BOX.x, 0), BOX.y0 + 4, FLOOR);
  // bosses for the two cable entries on the +z wall
  const bosses = [cylZ(12.5, BOX.half - 1, BOX.half + 2.5, 32), cylZ(12.5, BOX.half - 1, BOX.half + 2.5, 32)];
  bosses[0].translate(BOX.x - 18, 116, 0); bosses[1].translate(BOX.x + 18, 116, 0);
  const gasket = extrudeY(roundedRect(h - 1, h - 1, 7.5, BOX.x, 0), BOX.y0 - 0.6, BOX.y0);
  return { box: merge([base, walls, floor, ...bosses]), gasket };
}

function boxLid() {
  const lid = extrudeY(roundedRect(BOX.half * 2 + 2, BOX.half * 2 + 2, 9, BOX.x, 0), BOX.top + 0.8, BOX.top + 5.5);
  const crown = extrudeY(roundedRect(BOX.half * 2 - 14, BOX.half * 2 - 14, 6, BOX.x, 0), BOX.top + 5.5, BOX.top + 6.5);
  const seal = extrudeY(roundedRect(BOX.half * 2 - 1, BOX.half * 2 - 1, 7.5, BOX.x, 0), BOX.top, BOX.top + 0.8);
  const screws = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const g = new THREE.CylinderGeometry(3.4, 3.4, 2.4, 24);
    g.translate(BOX.x + sx * 38, BOX.top + 6.7, sz * 38);
    screws.push(g);
    const slot = new THREE.BoxGeometry(5, 0.6, 0.9);
    slot.translate(BOX.x + sx * 38, BOX.top + 7.95, sz * 38);
    screws.push(slot);
  }
  return { lid: merge([lid, crown]), seal, screws: merge(screws) };
}

function boardParts() {
  const board = new THREE.BoxGeometry(40, 10, 70);
  board.translate(BOX.x + 3, FLOOR + 5, 0);
  const studs = [], nuts = [];
  for (const [x, z] of Object.values(TERMINALS)) {
    const s = cylY(2.5, FLOOR + 2, BOARD_TOP + 13, 16); s.translate(x, 0, z); studs.push(s);
    for (const [y0, hgt] of [[BOARD_TOP + 3, 4], [BOARD_TOP + 8.2, 4]]) {
      const n = new THREE.CylinderGeometry(4.62, 4.62, hgt, 6); n.translate(x, y0 + hgt / 2, z); nuts.push(n);
    }
  }
  return { board, studs: merge(studs), nuts: merge(nuts) };
}

function linkGeometry(delta) {
  const links = [];
  const add = (x0, z0, x1, z1, y) => {
    const len = Math.hypot(x1 - x0, z1 - z0) + 9;
    const g = new THREE.BoxGeometry(len, 1.6, 8);
    g.rotateY(-Math.atan2(z1 - z0, x1 - x0));
    g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
    links.push(g);
  };
  const T = TERMINALS, y = BOARD_TOP + 2.2;
  if (delta) {
    add(...T.U1, ...T.W2, y); add(...T.V1, ...T.U2, y); add(...T.W1, ...T.V2, y);
  } else {
    add(...T.W2, ...T.U2, y); add(...T.U2, ...T.V2, y + 1.6);
  }
  return merge(links);
}

function leadGeometry() {
  // six winding leads up from the NDE end winding, through the frame, to the studs
  const out = { U: [], V: [], W: [] };
  const route = { U1: 'U', U2: 'U', V1: 'V', V2: 'V', W1: 'W', W2: 'W' };
  Object.entries(TERMINALS).forEach(([name, [x, z]], i) => {
    const z0 = (i - 2.5) * 5;
    const row1 = x < BOX.x, edge = row1 ? BOX.x - 21 : BOX.x + 27; // up the board edge nearest the stud row
    const pts = [V3(64 + (i % 3) * 3, 58, z0), V3(66, 76, z0 * 0.9), V3(edge + (row1 ? 6 : -6), FLOOR - 2, z),
      V3(edge, FLOOR + 3, z), V3(edge, BOARD_TOP + 2.5, z), V3(edge + (row1 ? 3 : -3), BOARD_TOP + 1.5, z),
      V3(x + (row1 ? -4.5 : 4.5), BOARD_TOP + 1.2, z)];
    out[route[name]].push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 48, 1.45, 8, false));
    const lug = new THREE.TorusGeometry(3.2, 0.7, 6, 20); lug.rotateX(Math.PI / 2); lug.translate(x, BOARD_TOP + 1.2, z);
    out[route[name]].push(lug);
  });
  return { U: merge(out.U), V: merge(out.V), W: merge(out.W) };
}

function ptcParts() {
  // three thermistors in the NDE end-winding crown, in series to TP1/TP2 in the box
  const beads = [], wires = [], tails = [];
  const ths = [90, 210, 330].map(d => d * DEG);
  ths.forEach(th => {
    const b = new THREE.CapsuleGeometry(1.5, 4, 4, 10); b.rotateZ(Math.PI / 2);
    const p = polar(70.5, 63, th); b.translate(p.x, p.y, p.z); beads.push(b);
  });
  for (let i = 0; i < 3; i++) {
    const a = ths[i], b = ths[(i + 1) % 3] + (i === 2 ? TAU : 0);
    const pts = [];
    for (let k = 0; k <= 16; k++) pts.push(polar(71 + Math.sin(k / 16 * Math.PI) * 1.5, 64.6, a + (b - a) * k / 16));
    if (i < 2) wires.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.5, 5, false));
  }
  const tp = [V3(BOX.x + 30, BOARD_TOP - 1, -30), V3(BOX.x + 30, BOARD_TOP - 1, -24)];
  for (const [i, th] of [[0, ths[0]], [1, ths[2]]]) {
    const s = polar(70.5, 63, th);
    const pts = [s, polar(72, 66, th + (i ? 0.25 : -0.05)), V3(70, 78, -22 + i * 4), V3(BOX.x + 28, FLOOR + 3, -28 + i * 3), tp[i]];
    tails.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.55, 5, false));
  }
  const blockG = new THREE.BoxGeometry(10, 9, 16); blockG.translate(BOX.x + 30, FLOOR + 4.5, -27);
  const screws = tp.map(p => { const g = cylY(1.6, BOARD_TOP - 1.5, BOARD_TOP + 0.5, 12); g.translate(p.x, 0, p.z); return g; });
  return { beads: merge(beads), wires: merge(wires), tails: merge(tails), block: merge([blockG]), screws: merge(screws) };
}

function earthParts() {
  const p = V3(BOX.x - 30, FLOOR, 30);
  const stud = cylY(2.5, FLOOR, FLOOR + 12, 16); stud.translate(p.x, 0, p.z);
  const nut = new THREE.CylinderGeometry(4.62, 4.62, 4, 6); nut.translate(p.x, FLOOR + 6, p.z);
  const clamp = new THREE.BoxGeometry(12, 1.5, 12); clamp.translate(p.x, FLOOR + 3.5, p.z);
  // external earth on the frame pad, NDE side
  const ext = hexBolt(10, 4); ext.translate(-28, BOX.y0, 28);
  return { metal: merge([stud, nut, clamp, ext]), label: p };
}

function glandGeometry() {
  const x = BOX.x - 18, y = 116, z0 = BOX.half + 2.5;
  const parts = [];
  const hex = new THREE.CylinderGeometry(13.86, 13.86, 6, 6); hex.rotateX(Math.PI / 2); hex.translate(x, y, z0 + 3); parts.push(hex);
  const dome = lathe([[0, 0], [0, 11], [4, 11.5], [12, 9.5], [16, 6], [16, 0]], 32);
  dome.rotateY(-Math.PI / 2); dome.translate(x, y, z0 + 6); parts.push(dome);
  const plug = new THREE.CylinderGeometry(12, 12, 4, 6); plug.rotateX(Math.PI / 2); plug.translate(BOX.x + 18, y, z0 + 2); parts.push(plug);
  // short cut cable end, so the gland reads as fitted without hiding the frame
  const cab = cylZ(5, z0 + 18, z0 + 34, 20);
  cab.translate(x, y, 0);
  const core = cylZ(4.2, z0 + 34, z0 + 34.6, 20); core.translate(x, y, 0);
  return { gland: merge(parts), cable: merge([cab, core]) };
}

function decalPlane(w, h, map, transparent = false) {
  const m = new THREE.MeshPhysicalMaterial({ map, transparent, roughness: 0.4, metalness: transparent ? 0 : 0.4, polygonOffset: true, polygonOffsetFactor: -2 });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
}

// ---------- assembly ----------
// Each part: id, label, step in the build order, explode offset (mm), meshes.
export function buildMotor() {
  const root = new THREE.Group();
  root.name = 'IEC-90L-4-1.5kW-motor';
  const parts = new Map();

  const part = (id, label, step, explode, meshes, extra = {}) => {
    const g = new THREE.Group();
    g.name = id;
    meshes.forEach(m => { m.userData.part = id; m.castShadow = true; m.receiveShadow = true; g.add(m); });
    root.add(g);
    parts.set(id, { id, label, step, explode: V3(...explode), group: g, meshes, ...extra });
    return g;
  };
  const mesh = (geo, mat, name) => {
    const m = new THREE.Mesh(geo, typeof mat === 'string' ? makeMaterial(mat) : mat);
    if (name) m.name = name;
    return m;
  };

  // frame + feet
  part('frame', 'Stator frame', 1, [0, 0, 0], [mesh(merge([extrudeX(frameSection(), -X.frame, X.frame, 32), frameLugs()]), 'paint', 'frame')], { cut: true });
  part('feet', 'Feet (IM B3)', 1, [0, 0, 0], [mesh(feetGeometry(), 'paint', 'feet')], { cut: true, mount: ['B3', 'B35'] });
  const pads = [];
  for (const xc of [-X.feet, X.feet]) { const g = new THREE.BoxGeometry(44, 12, 190); g.translate(xc, -IEC.H - 6, 0); pads.push(g); }
  part('pads', 'Base pads (B35 only)', 1, [0, 0, 0], [mesh(merge(pads), 'steelPad')], { mount: ['B35'] });

  // stator core
  const coreGeo = extrudeX(coreSection(), -X.core, X.core, 8);
  const coreMesh = mesh(coreGeo, [makeMaterial('laminationFace'), makeMaterial('laminationSide')], 'stator-core');
  part('core', 'Stator core', 1, [0, 0, 0], [coreMesh], { cut: true });

  // insulation and winding
  const sc = slotContents();
  part('slotins', 'Slot liners & wedges', 2, [0, 0, 0], [mesh(sc.liner, 'nmn', 'slot-liners'), mesh(sc.wedge, 'g11', 'slot-wedges')], { cut: true });
  const ends = [endWinding(-1), endWinding(1)];
  const phaseMeshes = ['U', 'V', 'W'].map(ph => {
    const m = mesh(merge([...ends[0][ph], ...ends[1][ph]]), 'copper', 'winding-' + ph);
    m.userData.phase = ph;
    return m;
  });
  const slotCu = mesh(sc.cond, 'copper', 'slot-conductors');
  part('winding', 'Stator winding', 2, [0, 0, 0], [...phaseMeshes, slotCu], { cut: true, phaseMeshes });
  const ptc = ptcParts();
  part('ptc', 'PTC thermistors', 2, [0, 0, 0], [mesh(ptc.beads, 'ptc', 'ptc'), mesh(ptc.wires, 'white', 'ptc-wires')], { cut: true });

  // rotor, shaft, key
  const rp = rotorParts();
  const rotorStack = mesh(rp.stack, [makeMaterial('rotorSurface'), makeMaterial('laminationFace'), makeMaterial('laminationFace')], 'rotor-stack');
  part('rotor', 'Rotor (squirrel cage)', 4, [-230, 0, 0], [rotorStack, mesh(rp.cage, 'aluminium', 'cage'), mesh(rp.drill, 'dark')], { spins: true });
  const centreHole = new THREE.CircleGeometry(4, 24); centreHole.rotateY(-Math.PI / 2); centreHole.translate(X.shaftTip - 0.05, 0, 0);
  part('shaft', 'Shaft', 4, [-230, 0, 0], [mesh(shaftGeometry(), 'shaft', 'shaft'), mesh(centreHole, 'dark', 'M8-centre')], { spins: true });
  part('key', 'Feather key 8×7×40', 4, [-230, 34, 0], [mesh(keyGeometry(), 'keySteel', 'key')], { spins: true });

  // bearings, seal, wave spring
  const bDE = bearing({ d: 25, D: 52, B: 15, Z: 9, dw: 7.94 }, (X.bDEfrom + X.bDEto) / 2);
  const bNDE = bearing({ d: 20, D: 47, B: 14, Z: 8, dw: 7.94 }, (X.bNDEfrom + X.bNDEto) / 2);
  part('bearingDE', 'DE bearing 6205-2RS/C3', 5, [-270, 0, 0], [mesh(bDE.rings, 'bearing'), mesh(bDE.balls, 'bearing'), mesh(bDE.seals, 'fkm')], { cut: true, spins: true });
  part('bearingNDE', 'NDE bearing 6204-2RS/C3', 5, [-190, 0, 0], [mesh(bNDE.rings, 'bearing'), mesh(bNDE.balls, 'bearing'), mesh(bNDE.seals, 'fkm')], { cut: true, spins: true });
  part('wave', 'Wave spring washer', 5, [70, 0, 0], [mesh(waveSpring(), 'machined', 'wave-spring')], { cut: true });
  const ls = lipSeal();
  part('seal', 'DE shaft seal 25×42×7', 6, [-345, 0, 0], [mesh(ls.lip, 'fkm', 'lip'), mesh(ls.can, 'machined', 'seal-case')], { cut: true });

  // end shields
  const de3 = shieldDE_B3();
  part('shieldDE', 'DE end shield (B3)', 6, [-330, 0, 0], [mesh(de3.body, 'paintLathe', 'de-shield')], { cut: true, mount: ['B3'] });
  const de5 = flangeDE_B5();
  part('flangeDE', 'DE flange FF165 (B5)', 6, [-330, 0, 0], [mesh(de5.body, 'paintLathe', 'de-flange')], { cut: true, mount: ['B5', 'B35'] });
  part('boltsDE', 'DE shield screws', 6, [-390, 0, 0], [mesh(de3.bolts, 'zinc', 'de-bolts')]);
  const nde = shieldNDE();
  part('shieldNDE', 'NDE end shield', 6, [110, 0, 0], [mesh(nde.body, 'paintLathe', 'nde-shield')], { cut: true });
  part('boltsNDE', 'NDE shield screws', 6, [150, 0, 0], [mesh(nde.bolts, 'zinc', 'nde-bolts')]);

  // fan, circlip, cowl
  part('fan', 'Cooling fan', 7, [190, 0, 0], [mesh(fanGeometry(), 'pp', 'fan')], { spins: true });
  const clip = new THREE.TorusGeometry(10.4, 0.75, 6, 40, TAU * 0.86); clip.rotateY(Math.PI / 2); clip.translate(130.6, 0, 0);
  part('circlip', 'Circlip DIN 471 – 18', 7, [225, 0, 0], [mesh(clip, 'dark', 'circlip')], { spins: true });
  const cw = cowlGeometry();
  part('cowl', 'Fan cowl', 7, [300, 0, 0], [mesh(cw.shell, 'sheet', 'cowl'), mesh(cw.grid, 'sheet', 'grille'), mesh(cw.screws, 'zinc', 'cowl-screws')], { cut: true });

  // terminal box and its contents
  const tb = terminalBox();
  part('tbox', 'Terminal box', 8, [0, 0, 0], [mesh(tb.box, 'paint', 'terminal-box'), mesh(tb.gasket, 'rubber', 'box-gasket')], { cut: true });
  const bp = boardParts();
  // board marking: canvas columns run along +z (U V W), canvas top toward the NDE row (W2 U2 V2)
  const boardLabel = delta => {
    const m = decalPlane(70, 40, boardLabelTexture(delta));
    m.geometry.applyMatrix4(new THREE.Matrix4().makeBasis(V3(0, 0, 1), V3(1, 0, 0), V3(0, 1, 0)));
    m.position.set(BOX.x + 3, BOARD_TOP + 0.05, 0);
    return m;
  };
  const labelY = boardLabel(false), labelD = boardLabel(true);
  part('tboard', 'Terminal board', 8, [0, 60, 0], [mesh(bp.board, 'porcelain', 'board'), mesh(bp.studs, 'brass', 'studs'), mesh(bp.nuts, 'brass', 'nuts'), labelY, labelD], { labels: { Y: labelY, D: labelD } });
  const linkY = mesh(linkGeometry(false), 'brass', 'links-Y');
  const linkD = mesh(linkGeometry(true), 'brass', 'links-delta');
  part('links', 'Links (Y / Δ)', 8, [0, 75, 0], [linkY, linkD], { linkY, linkD });
  const ld = leadGeometry();
  const leadMeshes = ['U', 'V', 'W'].map(ph => { const m = mesh(ld[ph], 'lead' + ph, 'leads-' + ph); m.userData.phase = ph; return m; });
  part('leads', 'Winding leads', 8, [0, 0, 0], [...leadMeshes, mesh(ptc.tails, 'white', 'ptc-leads')], { cut: true });
  part('tpblock', 'PTC terminals TP1–TP2', 8, [0, 60, 0], [mesh(ptc.block, 'dark', 'tp-block'), mesh(ptc.screws, 'nickel', 'tp-screws')]);
  const ea = earthParts();
  const eLabel = decalPlane(10, 10, earthTexture());
  eLabel.rotation.x = -Math.PI / 2; eLabel.position.set(ea.label.x + 9, FLOOR + 0.1, ea.label.z);
  part('earth', 'Earth terminals (PE)', 8, [0, 60, 0], [mesh(ea.metal, 'nickel', 'earth'), eLabel]);
  const gl = glandGeometry();
  part('gland', 'Cable gland M20', 8, [0, 0, 60], [mesh(gl.gland, 'nickel', 'gland'), mesh(gl.cable, 'rubber', 'cable')]);
  const lid = boxLid();
  const warn = decalPlane(34, 30.5, warningTexture(), true);
  warn.rotation.x = -Math.PI / 2; warn.position.set(BOX.x, BOX.top + 6.55, 2);
  part('lid', 'Terminal box lid', 8, [0, 110, 0], [mesh(lid.lid, 'paint', 'lid'), mesh(lid.seal, 'rubber', 'lid-seal'), mesh(lid.screws, 'zinc', 'lid-screws'), warn]);

  // rating plate on the +z pad
  const plate = decalPlane(84, 43.5, nameplateTexture());
  plate.material.metalness = 0.6; plate.material.roughness = 0.35;
  plate.position.set(-12, 0, 86.15);
  const rivets = [];
  for (const sx of [-39, 39]) for (const sy of [-18.5, 18.5]) { const g = cylZ(1.6, 86, 86.9, 12); g.translate(-12 + sx, sy, 0); rivets.push(g); }
  part('nameplate', 'Rating plate', 8, [0, 0, 0], [plate, mesh(merge(rivets), 'machined', 'rivets')]);

  return { root, parts, rotorMeshes: phaseMeshes };
}

export const PHASE_COLORS = PHASE;
