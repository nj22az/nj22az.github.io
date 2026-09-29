// Motorlabbets 3D-bänk (three.js): motorn med öppen kopplingslåda och plint, startaren med locket av och
// tångstationen med DC-aggregat och labbsladd. Scenen visar bara; mätvärdena räknas i model.mjs och kommer via set().
// Byggs till scen.js med tools/build.mjs. Klick på plintar, kontakter och knappar skickas till onPick.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const BLA = '#064f91', INK = '#163248';

export function mount(el, { onPick }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'Tredimensionell labbänk med motorn, startaren och tångstationen. Alla val görs också med knapparna bredvid.');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#edf3f7');
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.49; controls.minDistance = 3; controls.maxDistance = 40;

  scene.add(new THREE.HemisphereLight('#ffffff', '#b7c4cf', 1.6));
  const sol = new THREE.DirectionalLight('#ffffff', 2.2); sol.position.set(6, 14, 9); sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048); Object.assign(sol.shadow.camera, { left: -14, right: 14, top: 10, bottom: -10 });
  scene.add(sol);

  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, metalness: 0.1, ...o });
  const M = {
    bord: mat('#c9b99a', { roughness: 0.9 }), motor: mat('#3d6f94', { metalness: 0.35, roughness: 0.45 }), mork: mat('#23313d'),
    metall: mat('#b8c2ca', { metalness: 0.8, roughness: 0.3 }), massing: mat('#c8a24a', { metalness: 0.8, roughness: 0.3 }),
    plast: mat('#e8edf0'), gra: mat('#8d9aa5'), rod: mat('#c0392b'), svart: mat('#1b1f23'), gron: mat('#2e8b57'),
    bleck: mat('#d9b44a', { metalness: 0.85, roughness: 0.25 }), vald: mat('#ffd43d', { emissive: '#7a5a00', emissiveIntensity: 0.6 }),
  };
  const box = (w, h, d, m, r = 0.04) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 4, h / 4, d / 4)), m);
  const cyl = (r, h, m, s = 24) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, s), m);
  const skugga = (o) => o.traverse((x) => { if (x.isMesh) { x.castShadow = true; x.receiveShadow = true; } });
  function etikett(text, w = 0.5, h = 0.22, { farg = INK, bak = '#ffffff', size = 90 } = {}) {
    const c = document.createElement('canvas'); c.width = 256; c.height = Math.round(256 * h / w);
    const g = c.getContext('2d'); g.fillStyle = bak; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = farg; g.font = `700 ${size * c.height / 115}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, c.width / 2, c.height / 2 + 2);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: bak === 'transparent' }));
  }
  function skarm(w, h) {
    const c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * h / w);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t }));
    mesh.visa = (rad1, rad2 = '') => {
      const g = c.getContext('2d'); g.fillStyle = '#c9d7c1'; g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = '#10200f'; g.textAlign = 'right'; g.textBaseline = 'middle';
      g.font = `700 ${c.height * 0.5}px "Courier New", monospace`; g.fillText(rad1, c.width - 24, c.height * 0.45);
      g.font = `700 ${c.height * 0.2}px Arial`; g.textAlign = 'left'; g.fillText(rad2, 20, c.height * 0.85);
      t.needsUpdate = true;
    };
    return mesh;
  }
  const valbara = [];
  const valbar = (o, data) => { o.userData.val = data; valbara.push(o); return o; };

  // Bänken
  const bord = box(22, 0.4, 7.5, M.bord, 0.08); bord.position.set(0, -0.2, 0); scene.add(bord);

  // ---------- Motorn (station M) ----------
  const motor = new THREE.Group(); motor.position.set(-6.2, 0, -0.3); scene.add(motor);
  const L = 3.0, R = 1.05, CY = 1.35;
  const stomme = cyl(R, L, M.motor, 40); stomme.rotation.z = Math.PI / 2; stomme.position.y = CY; motor.add(stomme);
  for (let k = 0; k < 16; k++) {                                                  // kylflänsar
    const a = (k / 16) * Math.PI * 2; if (Math.abs(Math.sin(a) - 1) < 0.2) continue;
    const f = box(L - 0.2, 0.05, 0.16, M.motor, 0.01); f.position.set(0, CY + Math.sin(a) * (R + 0.06), Math.cos(a) * (R + 0.06)); f.rotation.x = -a; motor.add(f);
  }
  for (const x of [-L / 2 - 0.08, L / 2 + 0.08]) { const s = cyl(R * 0.93, 0.18, M.gra, 40); s.rotation.z = Math.PI / 2; s.position.set(x, CY, 0); motor.add(s); }   // lagersköldar
  const kapa = cyl(R * 0.95, 0.85, M.mork, 40); kapa.rotation.z = Math.PI / 2; kapa.position.set(-L / 2 - 0.6, CY, 0); motor.add(kapa);                              // fläktkåpa
  for (let k = 0; k < 7; k++) { const s = box(0.02, 1.5, 0.05, M.gra, 0.005); s.position.set(-L / 2 - 1.03, CY, -0.6 + k * 0.2); motor.add(s); }
  const axel = cyl(0.14, 0.9, M.metall); axel.rotation.z = Math.PI / 2; axel.position.set(L / 2 + 0.6, CY, 0); motor.add(axel);
  const kil = box(0.5, 0.06, 0.06, M.metall, 0.01); kil.position.set(L / 2 + 0.72, CY + 0.15, 0); motor.add(kil);
  for (const x of [-0.95, 0.95]) { const fot = box(0.7, 0.3, 2.0, M.motor); fot.position.set(x, 0.15, 0); motor.add(fot); }
  const lada = new THREE.Group(); lada.position.set(0.1, CY + R - 0.02, 0); motor.add(lada);                      // kopplingslåda, öppen
  const botten = box(1.5, 0.12, 1.3, M.motor); lada.add(botten);
  for (const [w, d, x, z] of [[1.5, 0.08, 0, 0.61], [1.5, 0.08, 0, -0.61], [0.08, 1.3, 0.71, 0], [0.08, 1.3, -0.71, 0]]) { const v = box(w, 0.42, d, M.motor, 0.02); v.position.set(x, 0.24, z); lada.add(v); }
  const lock = box(1.5, 0.08, 1.3, M.motor); lock.position.set(1.9, 0.05, 1.7); lock.rotation.set(0, 0.5, 0); motor.add(lock);
  const platta = box(1.15, 0.08, 0.8, M.plast, 0.02); platta.position.set(0, 0.1, 0); lada.add(platta);
  // Plintens bultar: övre rad W2 U2 V2 (bakre), undre rad U1 V1 W1 (främre). Samma ordning som i kursens figurer.
  const POS = {}, DX = 0.36, ZT = -0.2, ZU = 0.2;
  ['W2', 'U2', 'V2'].forEach((t, i) => (POS[t] = new THREE.Vector3(-DX + i * DX, 0.2, ZT)));
  ['U1', 'V1', 'W1'].forEach((t, i) => (POS[t] = new THREE.Vector3(-DX + i * DX, 0.2, ZU)));
  const bultar = {};
  for (const [t, p] of Object.entries(POS)) {
    const b = valbar(cyl(0.07, 0.16, M.massing, 16), { typ: 'plint', id: t }); b.position.copy(p); lada.add(b); bultar[t] = b;
    const m = cyl(0.1, 0.05, M.metall, 6); m.position.set(p.x, 0.27, p.z); lada.add(m);
    const e = etikett(t, 0.26, 0.13); e.rotation.x = -Math.PI / 2; e.position.set(p.x, 0.141, p.z + (p.z < 0 ? -0.2 : 0.2)); lada.add(e);
  }
  const pe = valbar(cyl(0.07, 0.16, M.gron, 16), { typ: 'plint', id: 'PE' }); pe.position.set(0.55, 0.2, 0.42); lada.add(pe);
  const peE = etikett('PE', 0.2, 0.12); peE.rotation.x = -Math.PI / 2; peE.position.set(0.55, 0.141, 0.26); lada.add(peE);
  const bleckMesh = {};
  for (const x of ['W2-U2', 'U2-V2', 'U1-W2', 'V1-U2', 'W1-V2']) {
    const [a, b] = x.split('-'), pa = POS[a], pb = POS[b];
    const len = pa.distanceTo(pb) + 0.2;
    const m = box(len, 0.03, 0.12, M.bleck, 0.01);
    m.position.set((pa.x + pb.x) / 2, 0.3, (pa.z + pb.z) / 2); m.rotation.y = -Math.atan2(pb.z - pa.z, pb.x - pa.x);
    m.visible = false; lada.add(m); bleckMesh[x] = m;
  }
  // Märkskylt på stommens framsida
  const skylt = (() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 300; const g = c.getContext('2d');
    g.fillStyle = '#e9edf0'; g.fillRect(0, 0, 512, 300); g.strokeStyle = '#555'; g.lineWidth = 6; g.strokeRect(6, 6, 500, 288);
    g.fillStyle = '#111'; g.font = '700 34px Arial'; g.fillText('3~ Motor   IEC 60034', 24, 52);
    g.font = '30px Arial';
    ['1,1 kW    cos φ 0,79    1410 r/min', 'Δ/Y  230/400 V    4,5/2,6 A', '50 Hz    IP55    Isol.kl. F', 'Övningsobjekt – ansluts aldrig'].forEach((r, i) => g.fillText(r, 24, 108 + i * 52));
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.64), new THREE.MeshBasicMaterial({ map: t }));
  })();
  skylt.position.set(-0.35, CY + 0.05, R + 0.2); motor.add(skylt);

  // Multimetern vid motorn
  function multimeter(x, z, rot = 0) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
    const kropp = box(0.9, 0.22, 1.5, M.gron, 0.08); kropp.position.y = 0.11; g.add(kropp);
    const front = box(0.78, 0.04, 1.36, M.svart, 0.05); front.position.y = 0.24; g.add(front);
    const s = skarm(0.66, 0.36); s.rotation.x = -Math.PI / 2; s.position.set(0, 0.265, -0.4); g.add(s);
    const vred = cyl(0.2, 0.08, M.gra, 24); vred.position.set(0, 0.28, 0.12); g.add(vred);
    for (const [xx, m] of [[-0.22, M.rod], [0.22, M.svart]]) { const j = cyl(0.05, 0.06, m, 16); j.position.set(xx, 0.28, 0.55); g.add(j); }
    const typ = etikett('Ω  200 Ω', 0.5, 0.12, { bak: '#1b1f23', farg: '#ffffff' }); typ.rotation.x = -Math.PI / 2; typ.position.set(0, 0.265, 0.36); g.add(typ);
    scene.add(g); return { g, s, jack: [new THREE.Vector3(-0.22, 0.3, 0.55), new THREE.Vector3(0.22, 0.3, 0.55)] };
  }
  const mmM = multimeter(-3.6, 2.4, -0.3);
  // ---------- Startaren (station S) ----------
  const start = new THREE.Group(); start.position.set(1.0, 0, -1.2); scene.add(start);
  const bak = box(3.0, 3.4, 0.12, M.plast); bak.position.set(0, 1.9, 0); start.add(bak);
  for (const [w, h, x, y] of [[0.1, 3.4, -1.5, 1.9], [0.1, 3.4, 1.5, 1.9], [3.0, 0.1, 0, 3.6], [3.0, 0.1, 0, 0.2]]) { const v = box(w, h, 0.5, M.plast, 0.02); v.position.set(x, y, 0.25); start.add(v); }
  const kontaktor = box(1.4, 1.2, 0.8, M.gra, 0.06); kontaktor.position.set(-0.3, 2.45, 0.45); start.add(kontaktor);
  const relae = box(1.4, 0.75, 0.7, M.mork, 0.06); relae.position.set(-0.3, 1.05, 0.4); start.add(relae);
  const kEt = etikett('K1', 0.4, 0.2); kEt.position.set(-0.3, 2.55, 0.86); start.add(kEt);
  const fEt = etikett('F2', 0.4, 0.2, { bak: '#23313d', farg: '#fff' }); fEt.position.set(-0.7, 1.05, 0.76); start.add(fEt);
  const test = valbar(cyl(0.11, 0.1, M.rod, 20), { typ: 'knapp', id: 'test' }); test.rotation.x = Math.PI / 2; test.position.set(0.05, 1.15, 0.8); start.add(test);
  const tEt = etikett('TEST', 0.34, 0.12); tEt.position.set(0.05, 0.9, 0.76); start.add(tEt);
  const aterst = valbar(cyl(0.11, 0.1, M.svart, 20), { typ: 'knapp', id: 'reset' }); aterst.rotation.x = Math.PI / 2; aterst.position.set(0.38, 1.15, 0.8); start.add(aterst);
  const rEt = etikett('RESET', 0.36, 0.12); rEt.position.set(0.38, 0.9, 0.76); start.add(rEt);
  const ratt = cyl(0.14, 0.08, M.plast, 20); ratt.rotation.x = Math.PI / 2; ratt.position.set(-0.3, 1.15, 0.78); start.add(ratt);
  const SPOS = {
    A1: [-0.85, 3.15], A2: [-0.85, 1.9], 1: [-0.55, 3.15], 3: [-0.3, 3.15], 5: [-0.05, 3.15], 13: [0.25, 3.15],
    2: [-0.55, 1.78], 4: [-0.3, 1.78], 6: [-0.05, 1.78], 14: [0.25, 1.9], 95: [0.75, 1.3], 96: [0.75, 0.7], 97: [1.1, 1.3], 98: [1.1, 0.7],
  };
  const skruvar = {};
  for (const [t, [x, y]] of Object.entries(SPOS)) {
    const s = valbar(cyl(0.07, 0.12, M.metall, 12), { typ: 'start', id: String(t) }); s.rotation.x = Math.PI / 2; s.position.set(x, y, 0.88); start.add(s); skruvar[t] = s;
    const e = etikett(String(t), 0.22, 0.11); e.position.set(x, y + 0.16, 0.86); start.add(e);
  }
  const mmS = multimeter(3.2, 1.8, 0.35);
  // ---------- Tångstationen (station T) ----------
  const tst = new THREE.Group(); tst.position.set(7.2, 0, -0.8); scene.add(tst);
  const agg = box(2.2, 1.3, 1.6, M.plast, 0.08); agg.position.set(0, 0.65, 0); tst.add(agg);
  const aggS = skarm(1.2, 0.42); aggS.position.set(-0.2, 0.95, 0.81); tst.add(aggS);
  const utg = valbar(cyl(0.12, 0.1, M.gron, 20), { typ: 'knapp', id: 'utgang' }); utg.rotation.x = Math.PI / 2; utg.position.set(0.75, 0.95, 0.83); tst.add(utg);
  const uEt = etikett('UTGÅNG', 0.44, 0.12); uEt.position.set(0.75, 0.72, 0.81); tst.add(uEt);
  const plus = cyl(0.07, 0.1, M.rod, 16), minus = cyl(0.07, 0.1, M.svart, 16);
  plus.rotation.x = minus.rotation.x = Math.PI / 2; plus.position.set(-0.5, 0.35, 0.83); minus.position.set(0.1, 0.35, 0.83); tst.add(plus, minus);
  const tangG = new THREE.Group(); tst.add(tangG);
  const tKropp = box(0.55, 1.5, 0.3, M.rod, 0.08); tKropp.position.set(0, 0, 0); tangG.add(tKropp);
  const tKaft = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.08, 12, 40), M.svart); tKaft.position.set(0, 1.1, 0); tangG.add(tKaft);
  const tS = skarm(0.44, 0.3); tS.position.set(0, 0.35, 0.16); tangG.add(tS);
  tangG.position.set(0, 1.0, 2.2);
  let sladd = null;
  function sladdForm(lage) {
    if (sladd) { tst.remove(sladd); sladd.geometry.dispose(); }
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const a = V(-0.5, 0.35, 0.9), b = V(0.1, 0.35, 0.9), in1 = V(-0.3, 1.2, 1.2), ut = [V(0.3, 1.2, 3.4), V(0.8, 0.1, 2.6)];
    const P = {
      ute: [a, V(-0.9, 0.1, 1.8), V(0.9, 0.1, 1.9), b],
      en: [a, in1, V(0, 2.1, 1.6), V(0, 2.1, 2.8), ...ut, b],
      tva: [a, in1, V(-0.04, 2.1, 1.6), V(-0.04, 2.1, 2.9), V(0, 2.95, 3.05), V(0, 3.1, 2.2), V(0, 2.95, 1.35), V(0.05, 2.1, 1.5), V(0.05, 2.1, 2.9), ...ut, b],
      harnal: [a, in1, V(-0.1, 2.1, 1.6), V(-0.1, 2.1, 3.0), V(0, 2.1, 3.3), V(0.1, 2.1, 3.0), V(0.1, 2.1, 1.6), V(0.45, 1.2, 1.2), b],
    }[lage] || [a, b];
    sladd = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P, false, 'centripetal'), 200, 0.035, 8), M.rod);
    sladd.castShadow = true; tst.add(sladd);
  }
  // Mätsladdar från multimetrarna
  const ledningar = [];
  function mtsladd(mm, farg, till) {
    const j = mm.g.localToWorld(mm.jack[farg === 'rod' ? 0 : 1].clone());
    const slut = till ?? j.clone().add(new THREE.Vector3(farg === 'rod' ? -0.3 : 0.3, 0.02, 0.6));
    const mitt = j.clone().lerp(slut, 0.5); mitt.y = Math.max(j.y, slut.y) + 0.8;
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([j, mitt, slut]), 40, 0.025, 8), farg === 'rod' ? M.rod : M.svart);
    scene.add(m); ledningar.push(m);
    const spets = cyl(0.03, 0.25, farg === 'rod' ? M.rod : M.svart, 12); spets.position.copy(slut).add(new THREE.Vector3(0, 0.12, 0)); scene.add(spets); ledningar.push(spets);
  }
  const varld = (o) => o.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.1, 0));

  skugga(scene);
  const VYER = {
    M: { mal: new THREE.Vector3(-6.0, 2.4, -0.1), pos: new THREE.Vector3(-5.3, 6.4, 3.9) },
    S: { mal: new THREE.Vector3(1.0, 2.0, -0.6), pos: new THREE.Vector3(1.6, 3.2, 6.4) },
    T: { mal: new THREE.Vector3(7.2, 1.6, 1.2), pos: new THREE.Vector3(10.2, 3.9, 7.2) },
    alla: { mal: new THREE.Vector3(0.5, 1.2, 0), pos: new THREE.Vector3(0, 9, 15) },
  };
  function vy(namn) { const v = VYER[namn] || VYER.alla; controls.target.copy(v.mal); camera.position.copy(v.pos); controls.update(); rita(); }

  const ray = new THREE.Raycaster(), mus = new THREE.Vector2(); let ner = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { ner = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!ner || Math.hypot(e.clientX - ner[0], e.clientY - ner[1]) > 6) return;
    const r = renderer.domElement.getBoundingClientRect();
    mus.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mus, camera);
    const hit = ray.intersectObjects(valbara, false)[0];
    if (hit) onPick(hit.object.userData.val);
  });

  let rafId = 0;
  function rita() { renderer.render(scene, camera); }
  function loop() { rafId = requestAnimationFrame(loop); if (controls.update()) rita(); }
  controls.addEventListener('change', rita);
  function storlek() {
    const w = el.clientWidth || 600, h = el.clientHeight || 420;
    renderer.setSize(w, h, false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
    camera.aspect = w / h; camera.updateProjectionMatrix(); rita();
  }
  const ro = new ResizeObserver(storlek); ro.observe(el);
  storlek(); vy('M'); loop();

  let senaste = {};
  function set(s) {
    for (const [x, m] of Object.entries(bleckMesh)) {
      m.visible = s.bleck.includes(x);
      const los = s.losa.includes(x);
      m.position.y = los ? 0.36 : 0.3; m.rotation.z = los ? 0.12 : 0;
    }
    for (const [t, b] of Object.entries(bultar)) b.material = [s.prob.rod, s.prob.svart].includes(t) ? M.vald : M.massing;
    pe.material = [s.prob.rod, s.prob.svart].includes('PE') ? M.vald : M.gron;
    for (const [t, b] of Object.entries(skruvar)) b.material = [s.sprob.rod, s.sprob.svart].includes(String(t)) ? M.vald : M.metall;
    for (const m of ledningar) { scene.remove(m); m.geometry.dispose(); } ledningar.length = 0;
    const pt = (t) => (t === 'PE' ? varld(pe) : bultar[t] ? varld(bultar[t]) : null);
    mtsladd(mmM, 'rod', s.prob.rod ? pt(s.prob.rod) : null); mtsladd(mmM, 'svart', s.prob.svart ? pt(s.prob.svart) : null);
    const spt = (t) => (skruvar[t] ? skruvar[t].getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0, 0.1)) : null);
    mtsladd(mmS, 'rod', s.sprob.rod ? spt(s.sprob.rod) : null); mtsladd(mmS, 'svart', s.sprob.svart ? spt(s.sprob.svart) : null);
    mmM.s.visa(s.visningM, 'Ω'); mmS.s.visa(s.visningS, 'Ω');
    test.position.z = s.utlost ? 0.72 : 0.8;
    if (senaste.tlage !== s.tang.lage) sladdForm(s.tang.lage);
    aggS.visa(s.tang.pa ? '2,00 A' : '0,00 A', s.tang.pa ? 'CC  2 V' : 'AV');
    utg.material = s.tang.pa ? M.gron : M.gra;
    tS.visa(s.tang.visning, 'DC A');
    senaste = { tlage: s.tang.lage };
    if (s.station && s.station !== senaste.station) { /* vyn byts bara på begäran */ }
    rita();
  }
  return {
    set, vy,
    stang() { cancelAnimationFrame(rafId); ro.disconnect(); controls.dispose(); renderer.dispose(); },
  };
}
