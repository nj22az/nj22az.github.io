// The Johansson PF-82 in 3D: the CAD model (cad/pf-82/build.py → 3d/pf82.glb) in three.js. Its knobs, selectors,
// jacks, keys, power rocker and lamp follow the real state and can be played. three.js r170 and its loader are
// the copies vendored for Johansson World, loaded from this site only when the view comes into sight.
import * as THREE from '/johansson-town/vendor/three.module.js';
import { GLTFLoader } from '/johansson-town/vendor/GLTFLoader.js';
import { mergeGeometries } from '/johansson-town/vendor/BufferGeometryUtils.js';

const V3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const OPTION_TEXT = {
  'vco1.oct': ["32'", "16'", "8'", "4'", "2'"], 'vco2.oct': ["32'", "16'", "8'", "4'", "2'"],
  'vco1.wave': ['TRI', 'SAW', 'SQR', 'PUL'], 'vco2.wave': ['TRI', 'SAW', 'SQR', 'PUL'], 'lfo.wave': ['TRI', 'SQR', 'SAW', 'S/H'],
  src: ['SYNTH', 'LINE'], 'vca.mode': ['ENV', 'OPEN'], 'glob.mode': ['MONO', 'DUO'], 'glob.legato': ['OFF', 'ON'],
};
const SPREAD = { 2: 35, 4: 60, 5: 70 }; // ± degrees over which a selector's positions spread
const optionAngle = (i, n) => (n === 1 ? 0 : -SPREAD[n] + (2 * SPREAD[n] * i) / (n - 1));

export async function createView3D(o) {
  const { stage, base = '.', getState, labelFor, moduleLabel, onParam, onNote, onPower, onHover } = o;
  const [layout, gltf] = await Promise.all([
    fetch(`${base}/3d/pf82-layout.json`).then((r) => r.json()),
    new GLTFLoader().loadAsync(`${base}/3d/pf82.glb`),
  ]);
  let lang = o.lang || 'en', keyBase = o.keyBase ?? 36, powered = !!o.powered;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  stage.replaceChildren(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', 'The Johansson PF-82 in 3D: drag to look around, drag a knob to turn it, click a selector, a jack or a key');
  renderer.domElement.tabIndex = -1;

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xfff6ea, 0x2a2b2d, 1.25));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.3); keyLight.position.set(-0.6, 1.2, 0.9); scene.add(keyLight);
  const rim = new THREE.DirectionalLight(0xbfd4ff, 0.9); rim.position.set(0.8, 0.6, -1.0); scene.add(rim);

  // Materials by part: the CAD carries colours; finish (roughness, metal) is given here.
  const mats = new Map();
  const finish = (name) => (/^jack_/.test(name) ? { metalness: 0.85, roughness: 0.35 } : /^key_\d/.test(name) ? { metalness: 0, roughness: 0.38 }
    : /^panel$/.test(name) ? { metalness: 0.35, roughness: 0.55 } : /^cheek/.test(name) ? { metalness: 0, roughness: 0.5 } : { metalness: 0.05, roughness: 0.62 });
  const material = (src, name) => {
    const f = finish(name), id = `${src.color.getHexString()}|${f.metalness}|${f.roughness}`;
    if (!mats.has(id)) mats.set(id, new THREE.MeshStandardMaterial({ color: src.color.clone(), ...f }));
    return mats.get(id);
  };

  // Merge the CAD's many face-meshes: one mesh per material for each moving part, and for the case.
  gltf.scene.updateMatrixWorld(true);
  // A moving part is one of the layout's named nodes; its meshes carry longer names (c_flt_frq_skirt_1), so match exactly.
  const OWNERS = new Set([...layout.controls.map((c) => c.node), ...layout.keys.nodes, 'power', 'led']);
  const ownerOf = (obj) => { for (let x = obj; x; x = x.parent) if (OWNERS.has(x.name)) return x.name; return 'static'; };
  const owners = new Map();
  gltf.scene.traverse((m) => {
    if (!m.isMesh) return;
    const owner = ownerOf(m), part = owner === 'static' ? [m.name, m.parent?.name].find((x) => /^(panel|cheek)/.test(x || '')) || m.name : owner;
    const g = m.geometry.clone().applyMatrix4(m.matrixWorld);
    g.deleteAttribute('uv');
    if (!g.attributes.normal) g.computeVertexNormals();
    const mat = material(m.material, owner === 'static' ? part : owner.replace(/^c_.*$/, 'control'));
    if (!owners.has(owner)) owners.set(owner, new Map());
    const byMat = owners.get(owner);
    if (!byMat.has(mat)) byMat.set(mat, []);
    byMat.get(mat).push(g);
  });
  const groups = new Map();
  for (const [owner, byMat] of owners) {
    const g = new THREE.Group(); g.name = owner;
    for (const [mat, list] of byMat) {
      const anyFlat = list.some((x) => !x.index);
      const merged = mergeGeometries(anyFlat ? list.map((x) => (x.index ? x.toNonIndexed() : x)) : list, false);
      const mesh = new THREE.Mesh(merged, mat); mesh.userData.owner = owner; g.add(mesh);
    }
    groups.set(owner, g);
  }
  const root = new THREE.Group(); scene.add(root);

  const P = layout.panel, O = V3(P.origin), U = V3(P.u).normalize(), Vv = V3(P.v).normalize(), N = V3(P.n).normalize();
  const basis = new THREE.Matrix4().makeBasis(U, Vv, N), qPanel = new THREE.Quaternion().setFromRotationMatrix(basis);
  const pick = [], controls = new Map(), keys = [];
  // A moving part sits in a pivot on its own axis: knobs and selectors turn about the panel normal.
  for (const [owner, g] of groups) {
    const c = layout.controls.find((x) => x.node === owner);
    if (c && c.kind !== 'jack') {
      const pivot = new THREE.Group();
      pivot.position.copy(V3(c.center)); pivot.quaternion.copy(qPanel);
      pivot.updateMatrixWorld(true);
      g.applyMatrix4(pivot.matrixWorld.clone().invert());
      pivot.add(g); root.add(pivot);
      controls.set(c.param, { ...c, pivot });
      g.traverse((m) => m.isMesh && pick.push(m));
    } else {
      root.add(g);
      if (c) { controls.set(`jack:${c.node}`, { ...c, group: g }); g.traverse((m) => m.isMesh && pick.push(m)); }
      if (/^key_\d/.test(owner)) { keys[Number(owner.slice(4))] = g; g.traverse((m) => m.isMesh && pick.push(m)); }
      if (owner === 'power') g.traverse((m) => m.isMesh && pick.push(m));
    }
  }
  const led = groups.get('led');
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x4a3412, emissive: 0x000000, roughness: 0.4 });
  led?.traverse((m) => { if (m.isMesh) m.material = ledMat; });
  const glow = new THREE.PointLight(0xf2a93b, 0, 0.25); glow.position.copy(O).addScaledVector(U, 0.548).addScaledVector(Vv, 0.207).addScaledVector(N, 0.02); root.add(glow);

  // The legend: printed onto the panel from the layout, in the page's words and language.
  const PXMM = 5.12, cw = Math.round(P.width_mm * PXMM), ch = Math.round(P.height_mm * PXMM);
  const canvas = document.createElement('canvas'); canvas.width = cw; canvas.height = ch;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const legend = new THREE.Mesh(new THREE.PlaneGeometry(P.width_mm / 1000, P.height_mm / 1000),
    new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.85, metalness: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  legend.quaternion.copy(qPanel);
  legend.position.copy(O).addScaledVector(U, P.width_mm / 2000).addScaledVector(Vv, P.height_mm / 2000).addScaledVector(N, 0.0002);
  root.add(legend);
  const font = (size, weight = 500) => `${weight} ${size * PXMM}px "IBM Plex Sans Condensed", "Arial Narrow", Arial, sans-serif`;
  const X = (u) => u * PXMM, Y = (v) => (P.height_mm - v) * PXMM;
  function drawLegend() {
    const g = canvas.getContext('2d'), st = getState();
    g.clearRect(0, 0, cw, ch);
    g.fillStyle = '#eeebe4'; g.strokeStyle = '#eeebe4'; g.textBaseline = 'middle';
    g.font = font(9, 700); g.letterSpacing = `${2.2 * PXMM}px`; g.fillText('JOHANSSON', X(6), Y(207));
    const w = g.measureText('JOHANSSON').width;
    g.fillStyle = '#f2a93b'; g.letterSpacing = `${0.6 * PXMM}px`; g.fillText('PF-82', X(6) + w + X(4), Y(207));
    g.fillStyle = '#8f8c85'; g.font = font(3.6, 500); g.letterSpacing = `${0.9 * PXMM}px`;
    g.fillText(lang === 'ru' ? 'СИНТЕЗАТОР С ФИЛЬТРОМ ПОЛИВОКС' : 'POLIVOKS FILTER SYNTHESISER', X(6) + w + X(36), Y(207));
    g.textAlign = 'right'; g.fillText(lang === 'ru' ? 'СЕТЬ' : 'POWER', X(541), Y(207)); g.textAlign = 'left';
    g.letterSpacing = '0px';
    for (const m of layout.modules) {
      const [u0, v0, u1, v1] = m.rect;
      g.lineWidth = (m.main ? 0.5 : 0.35) * PXMM; g.strokeStyle = m.main ? 'rgba(238,235,228,0.85)' : 'rgba(238,235,228,0.34)';
      g.beginPath(); g.roundRect(X(u0), Y(v1), X(u1 - u0), X(v1 - v0), 2.4 * PXMM); g.stroke();
      g.fillStyle = '#8f8c85'; g.font = font(4.2, 600); g.fillText(m.num, X(u0 + 3.5), Y(v1 - 5));
      g.fillStyle = '#eeebe4'; g.letterSpacing = `${0.5 * PXMM}px`; g.fillText(moduleLabel(m.id, lang) || m.title, X(u0 + 9.5), Y(v1 - 5)); g.letterSpacing = '0px';
    }
    g.textAlign = 'center';
    for (const c of layout.controls) {
      const cx = X(c.u), cy = Y(c.v);
      g.fillStyle = '#eeebe4'; g.font = font(c.big ? 4 : 3.6, 600);
      const label = c.kind === 'jack' ? c.label : labelFor(c.param, lang) || c.param;
      if (c.kind === 'jack') {
        g.fillText(label, cx, Y(c.v - 9));
        if (c.value && st['flt.out'] === c.value) { g.fillStyle = '#f2a93b'; g.fillText('→ VCA', cx, Y(c.v - 13.5)); g.beginPath(); g.lineWidth = 0.7 * PXMM; g.strokeStyle = '#f2a93b'; g.arc(cx, cy, 7.4 * PXMM, 0, 2 * Math.PI); g.stroke(); }
        continue;
      }
      g.fillText(label, cx, Y(c.v - c.r - 9)); // below: a selector's positions fill the space above it
      g.strokeStyle = '#8f8c85'; g.lineWidth = 0.32 * PXMM;
      if (c.kind === 'knob') {
        for (let i = 0; i <= 10; i++) {
          const a = ((-135 + 27 * i) * Math.PI) / 180, r1 = c.r + 3.2, r2 = c.r + (i % 5 === 0 ? 5.6 : 4.6);
          g.beginPath(); g.moveTo(cx + X(r1) * Math.sin(a), cy - X(r1) * Math.cos(a)); g.lineTo(cx + X(r2) * Math.sin(a), cy - X(r2) * Math.cos(a)); g.stroke();
        }
      } else {
        const names = OPTION_TEXT[c.param] || c.options.map(String);
        g.font = font(2.9, 500);
        c.options.forEach((opt, i) => {
          const a = (optionAngle(i, c.options.length) * Math.PI) / 180, r = 19.5, on = String(st[c.param]) === String(opt);
          g.fillStyle = on ? '#f2a93b' : '#a19e97';
          g.fillText(names[i], cx + X(r) * Math.sin(a), cy - X(r) * Math.cos(a));
        });
      }
    }
    g.textAlign = 'left';
    tex.needsUpdate = true;
  }

  // Shadow on the table: a soft dark ellipse under the case.
  const sh = document.createElement('canvas'); sh.width = sh.height = 128;
  const sg = sh.getContext('2d'), grad = sg.createRadialGradient(64, 64, 8, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)'); grad.addColorStop(1, 'rgba(0,0,0,0)'); sg.fillStyle = grad; sg.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.62), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -0.0095, -0.2); root.add(shadow);

  // Camera: a turntable round the middle of the case.
  const camera = new THREE.PerspectiveCamera(30, 2, 0.02, 10);
  // Frame the whole instrument: its bounding sphere fits the narrower field of view.
  const body = new THREE.Box3();
  for (const g of groups.values()) body.expandByObject(g);
  const sphere = body.getBoundingSphere(new THREE.Sphere()); // the instrument, not its shadow on the table
  const target = sphere.center.clone();
  const home = { yaw: 0, pitch: 0.82, dist: 1.4 };
  const view = { ...home };
  function fit() {
    const w = stage.clientWidth || 800, hgt = stage.clientHeight || 400;
    renderer.setSize(w, hgt, false); camera.aspect = w / hgt; camera.updateProjectionMatrix();
    const v = (camera.fov * Math.PI) / 360, hfov = Math.atan(Math.tan(v) * camera.aspect);
    home.dist = (sphere.radius * 0.8) / Math.sin(Math.min(v, hfov));
  }
  function place() {
    const cp = Math.cos(view.pitch);
    camera.position.set(target.x + view.dist * cp * Math.sin(view.yaw), target.y + view.dist * Math.sin(view.pitch), target.z + view.dist * cp * Math.cos(view.yaw));
    camera.lookAt(target);
  }

  let dirty = true, raf = 0;
  const anim = new Map(); // key index -> current depth (m)
  const keyDown = new Set();
  function frame() {
    raf = 0;
    let moving = false;
    for (let i = 0; i < keys.length; i++) {
      const want = keyDown.has(i) ? 0.004 : 0, now = anim.get(i) || 0, next = now + (want - now) * 0.45;
      if (Math.abs(next - want) > 1e-5) moving = true;
      const d = Math.abs(next - want) > 1e-5 ? next : want;
      if (d !== now) { anim.set(i, d); keys[i].position.set(0, -d, 0); }
    }
    if (dirty || moving) { place(); renderer.render(scene, camera); dirty = false; }
    if (moving) request();
  }
  const request = () => { dirty = true; if (!raf) raf = requestAnimationFrame(frame); };

  function syncParam(k) {
    const c = controls.get(k), st = getState();
    if (c) {
      let deg;
      if (c.kind === 'knob') deg = (Number(st[k]) - 0.5) * 270;
      else deg = optionAngle(Math.max(0, c.options.findIndex((x) => String(x) === String(st[k]))), c.options.length);
      c.pivot.quaternion.copy(qPanel).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (-deg * Math.PI) / 180));
    }
    if (k === 'flt.out' || (c && c.kind === 'selector')) drawLegend();
    request();
  }
  function syncAll() { for (const k of controls.keys()) if (!k.startsWith('jack:')) syncParam(k); drawLegend(); request(); }
  function power(on) {
    powered = on;
    ledMat.emissive.set(on ? 0xf2a93b : 0x000000); ledMat.emissiveIntensity = on ? 2.4 : 0; ledMat.color.set(on ? 0xf2a93b : 0x4a3412);
    glow.intensity = on ? 0.06 : 0;
    request();
  }
  function key(n, down) { const i = n - keyBase; if (i < 0 || i >= keys.length) return; if (down) keyDown.add(i); else keyDown.delete(i); request(); }

  // Pointer: turn a knob, step a selector, patch a jack, play a key, switch the power, or look around.
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const hit = (e) => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects(pick, false)[0];
    if (!h) return null;
    const owner = h.object.userData.owner;
    if (/^key_\d/.test(owner)) return { type: 'key', n: keyBase + Number(owner.slice(4)) };
    if (owner === 'power') return { type: 'power' };
    if (owner.startsWith('jack_')) { const c = controls.get(`jack:${owner}`); return c?.value ? { type: 'jack', value: c.value } : { type: 'jack-in' }; }
    const c = [...controls.values()].find((x) => x.node === owner);
    return c ? { type: c.kind, c } : null;
  };
  const el = renderer.domElement;
  let drag = null, hoverRaf = 0;
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const h = hit(e);
    el.setPointerCapture(e.pointerId);
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, h, moved: 0, start: h?.c ? Number(getState()[h.c.param]) : 0, view: { ...view } };
    if (h?.type === 'key') onNote(h.n, true, `3d${e.pointerId}`);
    e.preventDefault();
  });
  el.addEventListener('pointermove', (e) => {
    if (drag && e.pointerId === drag.id) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
      const h = drag.h;
      if (h?.type === 'knob') onParam(h.c.param, Math.min(1, Math.max(0, drag.start + ((dx - dy) / 240) * (e.shiftKey ? 0.1 : 1))));
      else if (h?.type === 'key') { const now = hit(e); if (now?.type === 'key' && now.n !== h.n) { drag.h = now; onNote(now.n, true, `3d${e.pointerId}`); } }
      else if (!h || h.type === 'jack-in') {
        view.yaw = Math.max(-1.25, Math.min(1.25, drag.view.yaw - dx * 0.006));
        view.pitch = Math.max(0.12, Math.min(1.35, drag.view.pitch + dy * 0.005));
        request();
      }
      return;
    }
    if (!hoverRaf) hoverRaf = requestAnimationFrame(() => {
      hoverRaf = 0;
      const h = hit(e);
      el.style.cursor = !h || h.type === 'jack-in' ? 'grab' : h.type === 'knob' ? 'ns-resize' : 'pointer';
      if (h?.c) onHover(h.c.param); else if (h?.type === 'jack') onHover('flt.out'); else if (h?.type === 'key') onHover('keys3d'); else if (h?.type === 'power') onHover('power');
    });
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const h = drag.h, click = drag.moved < 6;
    if (h?.type === 'key') onNote(h.n, false, `3d${e.pointerId}`);
    if (click && h?.type === 'selector') { const opts = h.c.options, i = opts.findIndex((x) => String(x) === String(getState()[h.c.param])); onParam(h.c.param, opts[(i + (e.shiftKey ? opts.length - 1 : 1)) % opts.length]); }
    if (click && h?.type === 'jack') onParam('flt.out', h.value);
    if (click && h?.type === 'power') onPower();
    drag = null;
  };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  // Zoom toward the point under the pointer: pinch (touch or trackpad) or Ctrl/⌘ + scroll; plain scrolling still scrolls the page.
  const panelPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(N, O);
  function zoom(factor, clientX, clientY) {
    const before = view.dist, next = Math.max(0.28, Math.min(home.dist * 1.6, before * factor));
    const r = el.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    place(); ray.setFromCamera(ndc, camera);
    const p = ray.ray.intersectPlane(panelPlane, new THREE.Vector3());
    if (p && next < before) target.lerp(p, 1 - next / before);
    if (next >= home.dist) target.lerp(sphere.center, Math.min(1, (next - before) / Math.max(1e-6, home.dist * 1.6 - before)));
    view.dist = next; request();
  }
  el.addEventListener('wheel', (e) => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); zoom(Math.exp(e.deltaY * 0.004), e.clientX, e.clientY); }, { passive: false });
  const touches = new Map();
  let pinch = 0;
  el.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') touches.set(e.pointerId, e); if (touches.size === 2) { const [a, c] = [...touches.values()]; pinch = Math.hypot(a.clientX - c.clientX, a.clientY - c.clientY); drag = null; } });
  el.addEventListener('pointermove', (e) => {
    if (!touches.has(e.pointerId)) return;
    touches.set(e.pointerId, e);
    if (touches.size === 2 && pinch) { const [a, c] = [...touches.values()], d = Math.hypot(a.clientX - c.clientX, a.clientY - c.clientY); zoom(pinch / d, (a.clientX + c.clientX) / 2, (a.clientY + c.clientY) / 2); pinch = d; }
  });
  const lift = (e) => { touches.delete(e.pointerId); if (touches.size < 2) pinch = 0; };
  el.addEventListener('pointerup', lift); el.addEventListener('pointercancel', lift);
  el.addEventListener('dblclick', () => { Object.assign(view, home); target.copy(sphere.center); request(); });
  el.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stage.dataset.lost = 'true'; });

  const ro = new ResizeObserver(() => { fit(); request(); });
  ro.observe(stage);
  fit(); Object.assign(view, home); syncAll(); power(powered);
  if (document.fonts?.ready) document.fonts.ready.then(() => { drawLegend(); request(); });

  /* Where a control (by parameter or node) or a key (by MIDI note) is on screen, in client pixels. */
  function project(what) {
    const c = typeof what === 'number' ? null : controls.get(what) || [...controls.values()].find((x) => x.node === what);
    let p;
    if (c) p = V3(c.center).addScaledVector(N, c.kind === 'jack' ? 0.003 : 0.012);
    else if (typeof what === 'number' && keys[what - keyBase]) { const bb = new THREE.Box3().setFromObject(keys[what - keyBase]); p = bb.getCenter(new THREE.Vector3()); p.y = bb.max.y; p.z = bb.min.z + (bb.max.z - bb.min.z) * 0.8; }
    else if (what === 'power') p = V3(layout.power.center).addScaledVector(N, 0.006);
    if (!p) return null;
    place(); p.project(camera);
    const r = renderer.domElement.getBoundingClientRect();
    return { x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height };
  }

  return {
    syncParam, syncAll, key, power, project,
    setLang(l) { lang = l; drawLegend(); request(); },
    setKeyBase(b) { for (const i of [...keyDown]) key(keyBase + i, false); keyBase = b; request(); },
    stats: () => ({ drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, controls: controls.size, keys: keys.length }),
    dispose() { ro.disconnect(); cancelAnimationFrame(raf); renderer.dispose(); },
  };
}
