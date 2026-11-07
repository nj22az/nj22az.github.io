// 3D-modeller för vecka 42 (elsäkerhet): beröringsspänning, ljusbåge, riskområde och närområde, frånskiljning med
// lås, märkning och spänningsprovning, samt jordning och kortslutning. Samma form som modeller.mjs:
// varje modell returnerar { grupp, ankare, kamera }. Etiketterna sätts efteråt med kursens typsnitt.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { FARG } from './modeller.mjs';

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.1, ...o });
const M = {
  stal: mat('#8d9aa5', { metalness: 0.45, roughness: 0.45 }), motor: mat('#3d6f94', { metalness: 0.3, roughness: 0.45 }),
  mork: mat('#23313d'), plast: mat('#e9edf0'), gra: mat('#b8c2ca', { metalness: 0.35, roughness: 0.4 }),
  koppar: mat('#c07a3e', { metalness: 0.45, roughness: 0.35 }), hud: mat('#d9b59a'), klader: mat('#2f5d86'),
  byxor: mat('#34404c'), skor: mat('#1e252c'), kabel: mat('#3b4550'), gul: mat('#f2c230'), rod: mat('#c0392b'),
  pe: mat('#3f9a46'), vit: mat('#f6f7f8'),
  L1: mat(FARG.L1), L2: mat(FARG.L2), L3: mat(FARG.L3),
};
const box = (w, h, d, m, r = 0.04) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 4, h / 4, d / 4)), m);
const cyl = (r, h, m, s = 32) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, s), m);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const tub = (pts, r, m, sluten = false) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, sluten, 'centripetal'), Math.max(32, pts.length * 16), r, 10, sluten), m);
function lagg(g, o, x, y, z) { o.position.set(x, y, z); g.add(o); return o; }

/** Stav mellan två punkter (arm, ben). */
function stav(a, b, r, m) {
  const d = b.clone().sub(a), l = d.length();
  const s = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, l - 2 * r), 6, 14), m);
  s.position.copy(a).add(b).multiplyScalar(0.5); s.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return s;
}

/** En enkel person som står på y = 0 med fötterna vid (x, z). hand: punkt som höger hand ska nå (eller null). */
function person(g, x, z, { hand = null, vand = 0 } = {}) {
  const p = new THREE.Group(); p.position.set(x, 0, z); p.rotation.y = vand; g.add(p);
  const H = 1.75, hoft = V(0, 0.9, 0), axel = V(0, 1.45, 0);
  for (const s of [-1, 1]) {
    p.add(stav(V(s * 0.1, 0.08, 0), V(s * 0.1, 0.9, 0), 0.075, M.byxor));
    lagg(p, box(0.14, 0.08, 0.28, M.skor, 0.03), s * 0.1, 0.04, 0.06);
  }
  p.add(stav(hoft, axel, 0.19, M.klader));
  lagg(p, new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 18), M.hud), 0, H - 0.1, 0);
  // Vänster arm längs sidan. Höger arm mot handens mål (i gruppens koordinater).
  p.add(stav(V(-0.24, 1.42, 0), V(-0.3, 0.95, 0.02), 0.055, M.klader));
  let handPunkt = V(0.3, 0.95, 0.02);
  if (hand) { p.updateMatrixWorld(true); handPunkt = p.worldToLocal(hand.clone()); }
  const armbage = V(0.24, 1.42, 0).lerp(handPunkt, 0.5).add(V(0, -0.05, 0));
  p.add(stav(V(0.24, 1.42, 0), armbage, 0.055, M.klader)); p.add(stav(armbage, handPunkt, 0.05, M.hud));
  return p;
}

/** Ett glödande ljussken (sprite) för ljusbågen. */
function glod(storlek, farg = '255,236,170') {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, `rgba(${farg},1)`); gr.addColorStop(0.25, `rgba(${farg},0.75)`); gr.addColorStop(1, `rgba(${farg},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); s.scale.set(storlek, storlek, 1); return s;
}

/** Text på en platta (skylt, märkning). rader: [[text, storlek, färg]]. */
function skylt(b, h, rader, bak = '#ffffff', ram = null) {
  const c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * h / b); const x = c.getContext('2d');
  x.fillStyle = bak; x.fillRect(0, 0, c.width, c.height);
  if (ram) { x.strokeStyle = ram; x.lineWidth = 18; x.strokeRect(9, 9, c.width - 18, c.height - 18); }
  x.textAlign = 'center'; let y = 0; const tot = rader.reduce((a, r) => a + r[1] * 1.25, 0); y = (c.height - tot) / 2;
  for (const [t, s, f] of rader) { y += s * 1.05; x.font = `700 ${s}px Arial`; x.fillStyle = f; x.fillText(t, c.width / 2, y); y += s * 0.2; }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(b, h), new THREE.MeshBasicMaterial({ map: tex }));
}

/**
 * Beröringsspänning ombord: en pumpmotor på stålkrovet. Fasledaren har fått kontakt med höljet (isolationsfel) och
 * skyddsledaren (PE) är bruten. En person rör höljet med handen (punkt A) och står på däck (punkt B).
 */
export function beroring() {
  const g = new THREE.Group(), ankare = {};
  lagg(g, box(7.2, 0.2, 4.2, M.stal, 0.02), 0, -0.1, 0);
  for (let i = -3; i <= 3; i++) lagg(g, box(0.03, 0.012, 4.1, mat('#7b8792', { metalness: 0.4 })), i * 1.0, 0.006, 0);   // svetsfogar
  // Pumpmotorn
  // Motorn står på gummidämpare (vanligt ombord): höljet har ingen kontakt med däck genom fötterna, bara via PE.
  const DH = 0.14, m = new THREE.Group(); m.position.set(-1.3, DH, 0); g.add(m);
  const CY = 0.78;
  for (const x of [-0.5, 0.5]) for (const z of [-0.4, 0.4]) lagg(g, cyl(0.12, DH, M.mork, 20), -1.3 + x, DH / 2, z);
  const kropp = cyl(0.55, 1.7, M.motor, 40); kropp.rotation.z = Math.PI / 2; kropp.position.y = CY; m.add(kropp);
  for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; const f = box(1.55, 0.04, 0.1, M.motor, 0.01); f.position.set(0, CY + Math.sin(a) * 0.58, Math.cos(a) * 0.58); f.rotation.x = -a; m.add(f); }
  const kapa = cyl(0.5, 0.45, M.mork, 40); kapa.rotation.z = Math.PI / 2; kapa.position.set(-1.05, CY, 0); m.add(kapa);
  for (const x of [-0.5, 0.5]) lagg(m, box(0.4, 0.2, 1.1, M.motor), x, 0.1, 0);
  lagg(m, box(0.6, 0.35, 0.55, M.motor), 0.1, CY + 0.7, 0);                                              // kopplingslåda
  const pump = cyl(0.42, 0.55, M.gra, 32); pump.rotation.z = Math.PI / 2; pump.position.set(1.15, CY, 0); m.add(pump);
  // Matningskabeln kommer från vänster in i kopplingslådan: fasledaren (brun) och PE (grön/gul).
  g.add(tub([V(-3.6, 0.07, 0.3), V(-2.9, 0.08, 0.3), V(-2.1, 0.9, 0.25), V(-1.5, 1.72, 0.15), V(-1.2, 1.72, 0.1)], 0.07, M.kabel));
  // Isolationsfelet: fasledaren ligger an mot höljets insida. Visas som en glödande punkt på höljet.
  const fel = lagg(g, new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), mat('#ff8a1e', { emissive: '#ff6a00', emissiveIntensity: 1.2 })), -1.05, DH + CY + 0.52, 0.28);
  const f2 = glod(0.7, '255,150,40'); f2.position.copy(fel.position); g.add(f2);
  // Skyddsledaren från höljet till jordskenan på skottet, med ett avbrott.
  // Skyddsledaren (grön/gul) från motorns jordskruv till en jordbult i däck, med ett synligt avbrott.
  const skena = lagg(g, cyl(0.09, 0.12, M.gra, 16), -2.7, 0.06, 1.2);
  lagg(g, box(0.1, 0.1, 0.1, M.gra, 0.02), -1.95, DH + 0.25, 0.56);
  g.add(tub([V(-1.95, DH + 0.25, 0.62), V(-2.05, 0.1, 0.8), V(-2.2, 0.06, 0.95)], 0.035, M.pe));
  g.add(tub([V(-2.42, 0.06, 1.08), V(-2.6, 0.08, 1.16), V(-2.7, 0.13, 1.2)], 0.035, M.pe));
  // Personen rör höljet med höger hand och står på däck.
  const A = V(-0.72, DH + CY + 0.35, 0.47);
  person(g, 0.55, 0.9, { hand: A, vand: -0.5 });
  ankare.A = A; ankare.B = V(0.55, 0.02, 0.95); ankare.fel = fel.position.clone(); ankare.PE = V(-2.31, 0.08, 1.02);
  ankare.skena = skena.position.clone(); ankare.dack = V(2.4, 0, 1.5); ankare.hoje = V(-1.3, DH + CY - 0.2, 0.6); ankare.dampare = V(-0.8, DH / 2, 0.52);
  return { grupp: g, ankare, kamera: { pos: V(1.1, 2.3, 4.7), mal: V(-1.1, 0.75, 0.3), fov: 34 } };
}

/** Ljusbåge i ett öppet ställverksfack: bågen mellan två skenor, med sken, tryckvåg och splitter. */
export function ljusbage() {
  const g = new THREE.Group(), ankare = {};
  const B = 3.2, H = 2.6, D = 1.1;
  lagg(g, box(B, H, 0.08, mat('#cfd6dc', { metalness: 0.2 })), 0, H / 2, -D / 2);                   // bakplåt
  for (const s of [-1, 1]) lagg(g, box(0.08, H, D, mat('#bcc5cc', { metalness: 0.2 })), s * B / 2, H / 2, 0);
  lagg(g, box(B, 0.08, D, mat('#bcc5cc', { metalness: 0.2 })), 0, H, 0);
  lagg(g, box(B, 0.08, D, mat('#bcc5cc', { metalness: 0.2 })), 0, 0, 0);
  const Y = { L1: 2.0, L2: 1.55, L3: 1.1 };
  for (const [f, y] of Object.entries(Y)) {
    lagg(g, box(B - 0.3, 0.14, 0.05, M.koppar, 0.01), 0, y, -0.2);
    for (const x of [-1.2, 1.2]) lagg(g, box(0.12, 0.22, 0.12, M.mork, 0.02), x, y, -0.33);             // isolatorer
    lagg(g, box(0.18, 0.1, 0.06, M[f], 0.01), -1.35, y, -0.16);                                          // fasmärkning
    ankare[f] = V(-1.35, y, -0.12);
  }
  // Bågen mellan L1 och L2: ett taggigt, glödande spår och ett starkt sken.
  const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(V(0.15 + Math.sin(i * 2.3) * 0.07, Y.L1 - 0.07 - t * (Y.L1 - Y.L2 - 0.14), -0.12 + Math.cos(i * 1.7) * 0.05)); }
  g.add(tub(pts, 0.035, new THREE.MeshBasicMaterial({ color: '#fff4c2' })));
  const mitt = V(0.15, (Y.L1 + Y.L2) / 2, -0.1);
  const s1 = glod(1.1, '255,236,170'); s1.position.copy(mitt); g.add(s1);
  const s2 = glod(0.35, '255,255,255'); s2.position.copy(mitt); g.add(s2);
  const ljus = new THREE.PointLight('#fff1c4', 6, 4, 1.8); ljus.position.copy(mitt).add(V(0, 0, 0.3)); g.add(ljus);
  // Tryckvågen: ett tunt skal runt bågen. Splitter: glödande droppar ut från bågen.
  const skal = new THREE.Mesh(new THREE.SphereGeometry(1.0, 40, 24), new THREE.MeshBasicMaterial({ color: '#f39c3d', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }));
  skal.position.copy(mitt);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.012, 8, 80), new THREE.MeshBasicMaterial({ color: '#e07b24' })); ring.position.copy(mitt); g.add(ring);
  const dm = mat('#ffb347', { emissive: '#ff7a00', emissiveIntensity: 1.3 });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.3, r = 0.55 + (i % 4) * 0.22, d = V(Math.cos(a), Math.sin(a) * 0.8, 0.5 + (i % 3) * 0.25).normalize();
    const p = mitt.clone().addScaledVector(d, r);
    g.add(tub([p.clone().addScaledVector(d, -0.18), p], 0.012, dm));
    lagg(g, new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), dm), p.x, p.y, p.z);
  }
  ankare.bage = mitt.clone(); ankare.skal = mitt.clone().add(V(-0.72, 0.7, 0)); ankare.splitter = mitt.clone().add(V(0.95, -0.45, 0.4));
  ankare.sken = mitt.clone().add(V(0.35, 0.35, 0.2)); ankare.vagg = V(-1.5, 0.4, 0.2);
  return { grupp: g, ankare, kamera: { pos: V(2.3, 2.1, 6.4), mal: V(0.1, 1.45, 0), fov: 36 } };
}

/**
 * Riskområde och närområde runt en spänningssatt del. Zonerna är skal i rymden: de gäller åt alla håll, också bakåt och
 * uppåt. En fjärdedel är bortskuren så att det inre syns. Avstånden (DL, DV) beror på spänningen och står i standarden.
 */
export function zoner() {
  const g = new THREE.Group(), ankare = {};
  lagg(g, box(9, 0.1, 6, mat('#dfe5ea')), 0, -0.05, 0);
  const C = V(0, 1.6, 0);
  lagg(g, box(0.9, 0.16, 0.16, M.koppar, 0.02), C.x, C.y, C.z);
  for (const x of [-0.5, 0.5]) lagg(g, box(0.14, 0.3, 0.14, M.mork, 0.02), x, C.y, C.z - 0.15);
  lagg(g, cyl(0.04, C.y - 0.15, M.gra), 0, (C.y - 0.15) / 2, -0.15);
  const skal = (r, farg, op) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 40, Math.PI * 0.5, Math.PI * 1.5), new THREE.MeshStandardMaterial({ color: farg, transparent: true, opacity: op, roughness: 0.9, side: THREE.DoubleSide, depthWrite: false }));
    m.position.copy(C); g.add(m);
    const kant = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 6, 120), new THREE.MeshBasicMaterial({ color: farg })); kant.position.copy(C); kant.rotation.x = Math.PI / 2; g.add(kant);
    return m;
  };
  skal(0.75, '#d9772b', 0.42);
  skal(1.55, '#f0b37a', 0.2);
  person(g, 2.7, 0.9, { vand: -1.2 });
  ankare.del = C.clone(); ankare.risk = C.clone().add(V(0.4, -0.45, 0.45)); ankare.nara = C.clone().add(V(0.95, -0.9, 0.9));
  ankare.utanfor = V(2.7, 1.9, 0.9); ankare.bak = C.clone().add(V(-0.9, 0.9, -0.6));
  return { grupp: g, ankare, kamera: { pos: V(4.6, 3.6, 6.6), mal: V(0.4, 1.2, 0), fov: 36 } };
}

/**
 * Frånskilj, lås, märk och kontrollera spänningslöshet: en frånskiljare i läge 0 med hänglås och skylt, och en
 * tvåpolig spänningsprovare mot de utgående plintarna.
 */
export function lasmark() {
  const g = new THREE.Group(), ankare = {};
  lagg(g, box(5.6, 3.6, 0.1, mat('#d5dce1', { metalness: 0.15 })), 0, 1.8, -0.3);                        // vägg
  // Frånskiljaren
  lagg(g, box(1.3, 1.5, 0.45, mat('#e8ecef')), -1.3, 2.3, -0.02);
  const platta = skylt(0.9, 0.9, [['', 40, '#163248']], '#f2c230'); platta.position.set(-1.3, 2.35, 0.215); g.add(platta);
  const noll = skylt(0.16, 0.16, [['0', 110, '#163248']], '#f2c230'); noll.position.set(-1.67, 2.52, 0.22); g.add(noll);
  const ett = skylt(0.16, 0.16, [['I', 110, '#163248']], '#f2c230'); ett.position.set(-1.3, 2.7, 0.22); g.add(ett);
  const vred = new THREE.Group(); vred.position.set(-1.3, 2.35, 0.26); g.add(vred);
  lagg(vred, cyl(0.16, 0.1, M.rod), 0, 0, 0).rotation.x = Math.PI / 2;
  lagg(vred, box(0.4, 0.16, 0.12, M.rod, 0.04), -0.2, 0, 0.06);                                        // handtaget pekar mot 0
  // Hänglåset genom låsöglan under vredet, och skylten.
  lagg(g, box(0.08, 0.18, 0.06, M.gra), -1.3, 1.98, 0.3);
  const bygel = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 10, 24, Math.PI), M.gra); bygel.position.set(-1.3, 1.86, 0.34); g.add(bygel);
  lagg(g, box(0.26, 0.3, 0.12, mat('#d23c2e'), 0.04), -1.3, 1.66, 0.34);
  g.add(tub([V(-1.26, 1.52, 0.36), V(-1.18, 1.4, 0.38), V(-1.1, 1.3, 0.38)], 0.008, M.mork));
  const tag = skylt(0.62, 0.86, [['ARBETE', 44, '#ffffff'], ['PÅGÅR', 44, '#ffffff'], ['Får ej', 30, '#ffffff'], ['manövreras', 30, '#ffffff'], ['Namn · tel', 26, '#ffffff'], ['Datum', 26, '#ffffff']], '#c0392b', '#ffffff');
  tag.position.set(-1.0, 0.86, 0.39); tag.rotation.set(0, -0.2, 0.08); g.add(tag);
  // Utgående plintar (locket av) och provaren.
  lagg(g, box(1.95, 0.9, 0.35, mat('#e8ecef')), 1.38, 1.25, -0.08);
  const PL = { L1: -0.45, L2: 0, L3: 0.45, PE: 0.9 };
  for (const [f, x] of Object.entries(PL)) { lagg(g, box(0.22, 0.34, 0.14, M.mork, 0.02), 1.15 + x, 1.3, 0.14); lagg(g, cyl(0.05, 0.08, M.koppar), 1.15 + x, 1.38, 0.23).rotation.x = Math.PI / 2; lagg(g, box(0.16, 0.06, 0.02, f === 'PE' ? M.pe : M[f], 0.01), 1.15 + x, 1.12, 0.22); ankare[f] = V(1.15 + x, 1.38, 0.27); }
  g.add(tub([V(0.4, 3.6, -0.2), V(0.5, 3.0, -0.15), V(1.15, 1.7, -0.1)], 0.05, M.kabel));
  // Tvåpolig spänningsprovare: huvuddel med display och en handdel, spetsarna på L1 och L2.
  const prov = new THREE.Group(); prov.position.set(1.35, 0.35, 0.95); prov.rotation.set(-0.5, -0.25, 0.15); g.add(prov);
  lagg(prov, box(0.32, 0.72, 0.16, M.gul, 0.06), 0, 0, 0);
  lagg(prov, box(0.22, 0.26, 0.02, mat('#1d2b36')), 0, 0.14, 0.085);
  g.add(tub([V(1.15 - 0.45, 1.38, 0.3), V(0.85, 1.05, 0.6), V(1.2, 0.72, 0.9)], 0.03, M.rod));
  g.add(tub([V(1.15, 1.38, 0.3), V(1.3, 1.05, 0.62), V(1.4, 0.72, 0.92)], 0.03, M.mork));
  for (const x of [-0.45, 0]) lagg(g, cyl(0.02, 0.18, M.gra), 1.15 + x, 1.38, 0.34).rotation.x = Math.PI / 2;
  ankare.vred = V(-1.0, 2.35, 0.34); ankare.las = V(-1.3, 1.66, 0.4); ankare.tag = V(-0.8, 0.8, 0.42); ankare.provare = V(1.35, 0.45, 1.05);
  ankare.plint = V(1.6, 1.3, 0.25);
  return { grupp: g, ankare, kamera: { pos: V(1.2, 2.2, 6.8), mal: V(0.05, 1.55, 0), fov: 36 } };
}

/**
 * Jordning och kortslutning: tre skenor efter en frånskiljare med synligt brytställe. Vid arbetsstället sitter ett
 * jordnings- och kortslutningsdon: tre klämmor, förbundna med varandra och med jordskenan.
 */
export function jordning() {
  const g = new THREE.Group(), ankare = {};
  lagg(g, box(7.4, 3.0, 0.1, mat('#d5dce1', { metalness: 0.15 })), 0.3, 1.5, -0.6);
  const Y = { L1: 2.35, L2: 1.85, L3: 1.35 };
  for (const [f, y] of Object.entries(Y)) {
    // Frånskiljaren: en fast kontakt till vänster och en uppfälld kniv (öppen).
    lagg(g, box(0.9, 0.12, 0.06, M.koppar, 0.01), -2.95, y, -0.3);
    lagg(g, box(0.16, 0.26, 0.2, M.mork, 0.02), -2.45, y, -0.35);
    const kniv = lagg(g, box(0.75, 0.07, 0.05, M.koppar, 0.01), -1.95, y + 0.2, -0.3); kniv.rotation.z = 0.62;
    lagg(g, box(0.16, 0.26, 0.2, M.mork, 0.02), -1.55, y, -0.35);
    lagg(g, box(3.9, 0.12, 0.06, M.koppar, 0.01), 0.45, y, -0.3);                                         // skenan till arbetsstället
    lagg(g, box(0.18, 0.08, 0.04, M[f], 0.01), -1.2, y, -0.25);
    for (const x of [-0.6, 1.6]) lagg(g, box(0.14, 0.22, 0.14, M.mork, 0.02), x, y, -0.42);
    ankare[f] = V(-1.2, y, -0.2);
  }
  // Jordskenan och donet: klämmor på varje fas, förbundna med kopparlina, och jordledaren till jordskenan.
  lagg(g, box(1.6, 0.14, 0.1, M.pe, 0.02), 1.3, 0.45, -0.45);
  for (let i = 0; i < 6; i++) lagg(g, box(0.07, 0.14, 0.02, mat('#e6c737'), 0.005), 0.65 + i * 0.26, 0.45, -0.39);   // grön/gul märkning
  const X = 1.1, lina = mat('#b8743e', { metalness: 0.4, roughness: 0.4 });
  const klammor = [];
  for (const y of Object.values(Y)) {
    lagg(g, box(0.18, 0.24, 0.16, M.gul, 0.03), X, y, -0.18);
    lagg(g, cyl(0.03, 0.12, M.gra), X, y + 0.17, -0.18);                                                // skruvspindel
    klammor.push(V(X + 0.05, y - 0.1, -0.08));
  }
  g.add(tub([klammor[0], V(X + 0.35, (Y.L1 + Y.L2) / 2, 0.1), klammor[1]], 0.035, lina));
  g.add(tub([klammor[1], V(X + 0.35, (Y.L2 + Y.L3) / 2, 0.1), klammor[2]], 0.035, lina));
  g.add(tub([klammor[2], V(X + 0.3, 0.95, 0.15), V(X + 0.6, 0.6, 0.05), V(1.75, 0.47, -0.35)], 0.04, lina));
  lagg(g, box(0.14, 0.18, 0.14, M.gul, 0.03), 1.75, 0.52, -0.33);
  // Arbetsstället: markerat område till höger.
  const ram = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.3, 1.6, 0.05)), new THREE.LineDashedMaterial({ color: '#064f91', dashSize: 0.1, gapSize: 0.07 }));
  ram.computeLineDistances(); ram.position.set(2.25, 1.85, -0.25); g.add(ram);
  ankare.kniv = V(-1.95, Y.L1 + 0.45, -0.25); ankare.don = V(X + 0.1, Y.L1 + 0.25, -0.1); ankare.jordledare = V(X + 0.55, 0.68, 0.1);
  ankare.jordskena = V(0.8, 0.45, -0.38); ankare.arbete = V(2.9, 2.65, -0.25);
  return { grupp: g, ankare, kamera: { pos: V(1.0, 2.2, 7.4), mal: V(0.1, 1.55, 0), fov: 36 } };
}
