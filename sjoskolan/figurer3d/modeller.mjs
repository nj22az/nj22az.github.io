// Gemensamma 3D-modeller för kursens figurer (three.js): generatorn, stjärnkopplingen med kabel, motorns plint och
// trefastransformatorn. Varje modell returnerar { grupp, ankare, kamera, uppdatera? }.
// ankare: namngivna punkter i 3D som renderaren projicerar till bildkoordinater, så att etiketterna kan sättas med
// kursens typsnitt efteråt (tools/rendera.py). Färgerna följer kursens figurer: L1 blå, L2 orange, L3 grön.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const FARG = { L1: '#064f91', L2: '#c8641e', L3: '#0e7c5a', N: '#8d9aa5', ink: '#163248' };
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.1, ...o });
const M = {
  stator: mat('#b4c0ca', { metalness: 0.2, roughness: 0.5 }), karna: mat('#6b7780', { metalness: 0.2, roughness: 0.6 }),
  koppar: mat('#c07a3e', { metalness: 0.3, roughness: 0.45 }), axel: mat('#c9d1d7', { metalness: 0.35, roughness: 0.35 }),
  nord: mat('#c0392b'), syd: mat('#dfe5ea'), plast: mat('#eef1f4'), massing: mat('#d8b24f', { metalness: 0.3, roughness: 0.4 }),
  mork: mat('#2b3640'), bleck: mat('#e0bb52', { metalness: 0.3, roughness: 0.35 }),
  L1: mat(FARG.L1), L2: mat(FARG.L2), L3: mat(FARG.L3), N: mat('#9aa6b0'),
};
const box = (w, h, d, m, r = 0.04) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 4, h / 4, d / 4)), m);
const cyl = (r, h, m, s = 32) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, s), m);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function tub(pts, r, m) { return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(24, pts.length * 12), r, 10), m); }

/** Spole som lindade varv runt en kärna, längs y-axeln. */
function spole(m, r = 0.28, h = 0.55, varv = 7) {
  const g = new THREE.Group();
  for (let i = 0; i < varv; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.045, 10, 36), m); t.rotation.x = Math.PI / 2; t.position.y = -h / 2 + (i + 0.5) * (h / varv); g.add(t); }
  return g;
}

/**
 * Generatorn sedd framifrån: statorn med tre spolar 120° isär och rotorn (en magnet) i mitten.
 * vinkel: rotorns läge i grader (0 = nordpolen mot spolen för L1, som sitter överst).
 */
export function generator({ vinkel = 0 } = {}) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.32, 24, 96), M.stator); g.add(ring);
  const ankare = {};
  ['L1', 'L2', 'L3'].forEach((fas, k) => {
    const a = Math.PI / 2 - (k * 2 * Math.PI) / 3;                              // L1 överst, L2 och L3 medurs 120° isär
    const pol = box(0.46, 0.9, 0.5, M.stator, 0.05); pol.position.set(Math.cos(a) * 1.45, Math.sin(a) * 1.45, 0); pol.rotation.z = a - Math.PI / 2; g.add(pol);
    const s = spole(M[fas], 0.36, 0.62, 6); s.position.copy(pol.position); s.rotation.z = a - Math.PI / 2; g.add(s);
    ankare[fas] = V(Math.cos(a) * 2.75, Math.sin(a) * 2.75, 0.2);
  });
  const rotor = new THREE.Group(); g.add(rotor);
  const n = box(0.5, 0.95, 0.55, M.nord, 0.08); n.position.y = 0.48; rotor.add(n);
  const s = box(0.5, 0.95, 0.55, M.syd, 0.08); s.position.y = -0.48; rotor.add(s);
  const ax = cyl(0.13, 1.2, M.axel); ax.rotation.x = Math.PI / 2; rotor.add(ax);
  const uppdatera = (grader) => { rotor.rotation.z = -THREE.MathUtils.degToRad(grader); };
  uppdatera(vinkel);
  ankare.N_pol = V(0, 0.55, 0.45); ankare.rotor = V(0, -1.0, 0.4);
  ankare.mitt = V(0, 0, 0); ankare.kant_L1 = V(0, 1.45, 0); ankare.kant_L2 = V(Math.cos(-Math.PI / 6) * 1.45, Math.sin(-Math.PI / 6) * 1.45, 0);
  return { grupp: g, ankare, uppdatera, rotor, kamera: { pos: V(0.5, 1.0, 10.2), mal: V(0, 0, 0), fov: 34 } };
}

/** Generatorns tre lindningar i Y. Stjärnpunkten blir N. L1, L2, L3 och N går ut i en kabel. */
export function stjarnkoppling() {
  const g = new THREE.Group();
  const ankare = {};
  const stjarna = V(-3.2, 0, 0);
  const ut = { L1: V(-1.6, 1.2, 0), L2: V(-1.6, 0.4, 0), L3: V(-1.6, -0.4, 0), N: V(-1.6, -1.2, 0) };
  const dot = (p, m, r = 0.1) => { const d = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), m); d.position.copy(p); g.add(d); };
  ['L1', 'L2', 'L3'].forEach((fas, k) => {
    const a = Math.PI / 2 + (k * 2 * Math.PI) / 3 + Math.PI / 6;
    const yttre = V(stjarna.x + Math.cos(a) * 1.35, Math.sin(a) * 1.35, 0);
    const mitt = stjarna.clone().lerp(yttre, 0.55);
    const s = spole(M[fas], 0.2, 0.55, 5); s.position.copy(mitt); s.rotation.z = a - Math.PI / 2; g.add(s);
    const kr = cyl(0.12, 0.7, M.karna, 16); kr.position.copy(mitt); kr.rotation.z = a - Math.PI / 2; g.add(kr);
    g.add(tub([stjarna, mitt], 0.035, M.koppar)); g.add(tub([yttre, mitt], 0.035, M.koppar));
    g.add(tub([yttre, V(yttre.x + 0.5, (yttre.y + ut[fas].y) / 2, 0.15), ut[fas]], 0.05, M[fas]));
    dot(yttre, M.koppar, 0.07);
  });
  g.add(tub([stjarna, V(-2.6, -1.0, 0.15), ut.N], 0.05, M.N)); dot(stjarna, M.mork, 0.12);
  ankare.stjarna = stjarna.clone().add(V(0, -0.1, 0.2));
  // Kabeln: fyra ledare som går parallellt åt höger, med mantel en bit.
  const slut = 3.4;
  for (const [fas, p] of Object.entries(ut)) {
    g.add(tub([p, V(p.x + 1.2, p.y * 0.35, 0), V(1.6, p.y * 0.35, 0), V(slut, p.y * 0.9, 0)], 0.06, M[fas]));
    dot(V(slut, p.y * 0.9, 0), M.massing, 0.11);
    ankare[fas] = V(slut + 0.2, p.y * 0.9, 0);
  }
  const mantel = cyl(0.5, 1.6, mat('#3a4750', { roughness: 0.8 }), 32); mantel.rotation.z = Math.PI / 2; mantel.position.set(0.4, 0, 0); g.add(mantel);
  ankare.kabel = V(0.4, 0.55, 0.3);
  const stommen = box(3.6, 3.4, 0.3, mat('#dfe5ea'), 0.1); stommen.position.set(-3.1, 0, -0.35); g.add(stommen);
  ankare.generator = V(-3.1, 1.9, 0);
  return { grupp: g, ankare, kamera: { pos: V(-0.1, 0.5, 8.0), mal: V(0, 0, 0), fov: 34 } };
}

const PLINT_POS = { W2: [-0.5, -0.32], U2: [0, -0.32], V2: [0.5, -0.32], U1: [-0.5, 0.32], V1: [0, 0.32], W1: [0.5, 0.32] };
/** Motorns plint med sex bultar. läge: 'Y' (bleck längs övre raden), 'D' (tre lodräta bleck) eller 'inga'. */
export function plint({ lage = 'Y' } = {}) {
  const g = new THREE.Group();
  const platta = box(1.7, 0.12, 1.25, M.plast, 0.05); g.add(platta);
  const ankare = {};
  const lind = [['U1', 'U2', 'L1'], ['V1', 'V2', 'L2'], ['W1', 'W2', 'L3']];
  for (const [a, b, f] of lind) {                                                      // lindningarna under plattan, streckade som i 2D
    const [xa, za] = PLINT_POS[a], [xb, zb] = PLINT_POS[b];
    const n = 9;
    for (let i = 0; i < n; i += 2) {
      const t0 = i / n, t1 = (i + 1) / n;
      const p0 = V(xa + (xb - xa) * t0, 0.065, za + (zb - za) * t0), p1 = V(xa + (xb - xa) * t1, 0.065, za + (zb - za) * t1);
      const seg = tub([p0, p1], 0.018, M[f]); g.add(seg);
    }
  }
  for (const [t, [x, z]] of Object.entries(PLINT_POS)) {
    const b = cyl(0.075, 0.2, M.massing, 18); b.position.set(x, 0.16, z); g.add(b);
    const m = cyl(0.11, 0.06, M.axel, 6); m.position.set(x, lage === 'inga' ? 0.2 : 0.26, z); g.add(m);
    ankare[t] = V(x, 0.2, z + (z < 0 ? -0.28 : 0.3));
  }
  const bleck = lage === 'Y' ? [['W2', 'U2'], ['U2', 'V2']] : lage === 'D' ? [['U1', 'W2'], ['V1', 'U2'], ['W1', 'V2']] : [];
  for (const [a, b] of bleck) {
    const [xa, za] = PLINT_POS[a], [xb, zb] = PLINT_POS[b];
    const len = Math.hypot(xb - xa, zb - za) + 0.22;
    const m = box(len, 0.035, 0.14, M.bleck, 0.01); m.position.set((xa + xb) / 2, 0.23, (za + zb) / 2); m.rotation.y = -Math.atan2(zb - za, xb - xa); g.add(m);
  }
  for (const [t, [x, z]] of Object.entries(PLINT_POS)) { const k = cyl(0.03, 0.4, M.koppar, 8); k.position.set(x, -0.25, z); g.add(k); }
  return { grupp: g, ankare, kamera: { pos: V(0, 3.4, 2.3), mal: V(0, 0, 0.05), fov: 30 } };
}

/** Trefastransformator med tre ben. Varje ben har en inre sekundärlindning och en yttre primärlindning (uppskuren). */
export function transformator() {
  const g = new THREE.Group();
  const ankare = {};
  const ben = [-1.8, 0, 1.8], H = 2.6, B = 0.55;
  for (const x of ben) { const k = box(B, H, B, M.karna, 0.02); k.position.set(x, 0, 0); g.add(k); }
  for (const y of [H / 2 + B / 2 - 0.02, -H / 2 - B / 2 + 0.02]) { const k = box(3.6 + B, B, B, M.karna, 0.02); k.position.set(0, y, 0); g.add(k); }
  for (let i = -6; i <= 6; i++) { const l = box(3.6 + B + 0.01, 0.006, B + 0.01, mat('#47525b'), 0.001); l.position.set(0, H / 2 + B / 2 - 0.02 + i * 0.04, 0); g.add(l); }
  ['L1', 'L2', 'L3'].forEach((fas, k) => {
    const x = ben[k];
    const inre = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, H * 0.82, 40, 1, false), M.koppar); inre.position.set(x, 0, 0); g.add(inre);
    const yttre = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, H * 0.88, 48, 1, true, Math.PI * 0.4, Math.PI * 1.35), mat(FARG[fas], { side: THREE.DoubleSide })); yttre.position.set(x, 0, 0); g.add(yttre);
    for (const y of [-H * 0.44, H * 0.44]) { const r = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.78, 48, 1, Math.PI * 0.4 + Math.PI / 2, Math.PI * 1.35), mat(FARG[fas], { side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.set(x, y, 0); g.add(r); }
    ankare[`prim_${fas}`] = V(x + 0.55, H * 0.46, 0.55);
    ankare[`sek_${fas}`] = V(x + 0.25, -H * 0.2, 0.52);
    ankare[`ben_${fas}`] = V(x, -H / 2 - B - 0.1, 0.3);
  });
  ankare.karna = V(0.9, H / 2 + B, 0.3);
  return { grupp: g, ankare, kamera: { pos: V(2.2, 1.6, 7.8), mal: V(0, 0, 0), fov: 36 } };
}

/** Ljus och scen gemensamt för figurerna. */
export function scen(bakgrund = '#ffffff') {
  const s = new THREE.Scene(); s.background = new THREE.Color(bakgrund);
  s.add(new THREE.HemisphereLight('#ffffff', '#b7c4cf', 1.7));
  const d = new THREE.DirectionalLight('#ffffff', 2.0); d.position.set(4, 8, 7); s.add(d);
  const d2 = new THREE.DirectionalLight('#ffffff', 0.6); d2.position.set(-6, 2, 4); s.add(d2);
  return s;
}
export { THREE };
