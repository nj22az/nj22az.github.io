import * as THREE from 'three';
import { buildDockWorkshop, buildTetsuoBench, DOCK_WORKSHOP_PLOT as plot } from './assets/tetsuo-geometry.js';
import { buildQuay } from './quay.js';

const positions = {
  quayside: { eye: [-34.2, 1.88, -27.1], aim: [-26.9, 1.46, -42.2], fov: 38 },
  door: { eye: [-27.5, 1.74, -34.5], aim: [-25.15, 1.49, -40.25], fov: 48 },
  workbench: { eye: [-1.17, 1.91, .1], aim: [1.55, 1.02, -2.94], fov: 45 },
};

function box(parent, name, size, position, colour) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({ color: colour, roughness: .82 }));
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function canvasTexture(width, height, paint) {
  const canvas = Object.assign(document.createElement('canvas'), { width, height });
  paint(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function weatheredSurface() {
  const texture = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#a8ada1';
    ctx.fillRect(0, 0, w, h);
    let seed = 79;
    const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 4800; i++) {
      ctx.fillStyle = i % 2 ? '#55665812' : '#f8eed21b';
      ctx.fillRect(random() * w, random() * h, 1 + random() * 7, 1 + random() * 2);
    }
    for (let i = 0; i < 23; i++) {
      const x = random() * w;
      const y = random() * h;
      const stain = ctx.createRadialGradient(x, y, 0, x, y, 18 + random() * 60);
      stain.addColorStop(0, '#4b514627');
      stain.addColorStop(1, '#4b514600');
      ctx.fillStyle = stain;
      ctx.fillRect(0, 0, w, h);
    }
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function sign(parent, size, position, angle, paint) {
  const map = canvasTexture(720, 320, paint);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(...size), new THREE.MeshStandardMaterial({ map, roughness: .84 }));
  plate.position.set(...position);
  plate.rotation.y = angle;
  parent.add(plate);
}

function addFrontage(group) {
  const { x, z, width, depth } = plot;
  const front = z + depth / 2;
  const left = x - width / 2;
  const shell = group.getObjectByName('Corrugated workshop shed');
  const texture = weatheredSurface();
  shell.material = new THREE.MeshStandardMaterial({ color: 0xe0e6d8, map: texture, roughness: .89 });
  shell.castShadow = true;
  group.getObjectByName('Low industrial roof').castShadow = true;
  for (let i = 0; i < 24; i++) {
    box(group, 'Folded side cladding seam', [.045, 2.98, .027], [left - .024, 1.62, z - depth / 2 + .17 + i * .307], 0x81918a);
  }
  box(group, 'Canopy fascia', [2.03, .18, .105], [x, 2.46, front + 1.026], 0x415f56);
  box(group, 'Door sill', [1.2, .08, .32], [x, .041, front + .24], 0x82857b);
  box(group, 'Door kick plate', [1.02, .22, .028], [x, .26, front + .129], 0x79918b);
  box(group, 'Door pull', [.046, .32, .057], [x + .39, 1.06, front + .171], 0xc6c2a6);
  for (const offset of [-.57, .57]) {
    box(group, 'Painted jamb', [.062, 2.28, .093], [x + offset, 1.17, front + .153], 0x859d89);
  }
  box(group, 'Meter conduit', [.054, 1.3, .065], [x - 2.71, .64, front + .21], 0x64756b);
  for (const offset of [.72, 3.57]) {
    box(group, 'Roller-door guide', [.10, 2.55, .14], [x + offset, 1.31, front + .128], 0x435a50);
  }
  const lantern = box(group, 'Entrance bulkhead lamp', [.21, .14, .11], [x + .8, 2.26, front + .175], 0xe1bc7a);
  lantern.material.emissive.setHex(0xf8bd69);
  lantern.material.emissiveIntensity = .4;
  box(group, 'Wall-mounted window surround', [.13, 1.03, 1.8], [left - .043, 1.84, z + .49], 0x465f56);
  for (const step of [-.56, 0, .56]) {
    const glass = box(group, 'Translucent wired glass', [.031, .83, .51], [left - .125, 1.84, z + .49 + step], 0x879e8a);
    glass.material.roughness = .34;
  }
  sign(group, [1.16, .51], [left - .075, 2.78, z + 1.65], -Math.PI / 2, (ctx, w, h) => {
    ctx.fillStyle = '#42635b'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#bfcc9f'; ctx.lineWidth = 6; ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.textAlign = 'center'; ctx.fillStyle = '#eff0d1';
    ctx.font = '700 85px sans-serif'; ctx.fillText('WEST QUAY', w / 2, 150);
    ctx.font = '46px sans-serif'; ctx.fillText('MINATO', w / 2, 232);
  });
  sign(group, [.55, .25], [x - .93, 1.51, front + .08], 0, (ctx, w, h) => {
    ctx.fillStyle = '#dedfc3'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#314d45'; ctx.textAlign = 'center';
    ctx.font = '700 80px sans-serif'; ctx.fillText('ENTRANCE', w / 2, 190);
  });
}

function exterior() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#c4d4cc');
  scene.fog = new THREE.FogExp2('#c4d4cc', .016);
  scene.add(new THREE.HemisphereLight(0xf5f5e9, 0x6d8076, 2.05));
  const sun = new THREE.DirectionalLight(0xffefd1, 2.1);
  sun.position.set(-38, 16, -28);
  sun.target.position.set(-25, 0, -41);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 15, bottom: -15, near: .5, far: 52 });
  sun.shadow.normalBias = .045;
  sun.shadow.bias = -.00015;
  scene.add(sun, sun.target);
  buildQuay(scene);
  const { group } = buildDockWorkshop({ parent: scene, site: { id: 'dock-workshop' }, colliders: [] });
  addFrontage(group);
  return scene;
}

function interior(onAction) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#777e6b');
  const room = new THREE.Group();
  scene.add(room);
  const floor = box(room, 'Workshop concrete floor', [8.4, .12, 7], [0, -.06, 0], 0x8f9280);
  const concrete = weatheredSurface();
  concrete.repeat.set(2.4, 2);
  floor.material.map = concrete;
  box(room, 'Workshop back wall', [8.64, 2.75, .14], [0, 1.375, -3.57], 0xb9bca7);
  box(room, 'Workshop east wall', [.14, 2.75, 7], [4.27, 1.375, 0], 0xa7b39e);
  box(room, 'Workshop west wall', [.14, 2.75, 7], [-4.27, 1.375, 0], 0x9eac99);
  box(room, 'Workshop ceiling', [8.54, .12, 7], [0, 2.81, 0], 0xc3c6b6);
  box(room, 'Back wall skirting', [8.4, .15, .044], [0, .075, -3.475], 0x56675e);
  box(room, 'East wall skirting', [.044, .15, 7], [4.176, .075, 0], 0x56675e);
  for (const x of [-3.9, -1.8, .3, 2.4]) {
    box(room, 'Ceiling support', [.065, .10, 7], [x, 2.69, 0], 0x909986);
  }
  const bench = buildTetsuoBench({
    room,
    collider: () => {},
    reg: (object, label, fn) => { object.userData.hit = { label, fn }; },
    action: onAction,
  });
  scene.add(new THREE.HemisphereLight(0xf1f5e3, 0x5c6551, 2.25));
  const key = new THREE.DirectionalLight(0xffefcc, 1.45);
  key.position.set(-3, 4, 2);
  scene.add(key);
  const practical = new THREE.PointLight(0xf9e2a2, 3.2, 3, 2);
  practical.position.set(2.3, 1.68, -2.67);
  scene.add(practical);
  return { scene, bench, practical };
}

export function createWorkshop(stage, { initial, onAction, onLoss }) {
  const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.55));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  const outside = exterior();
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const camera = new THREE.PerspectiveCamera(45, 1, .1, 160);
  const target = new THREE.Vector3();
  const frame = stage.parentElement;
  let inside;
  let active;
  let baseFov;
  let transition;
  let pendingCut;
  let request = 0;
  let previous = 0;
  let visible = true;
  let lost = false;

  function pose(view) {
    const { eye, aim, fov } = positions[view];
    return { eye: new THREE.Vector3(...eye), aim: new THREE.Vector3(...aim), fov };
  }

  function apply({ eye, aim, fov }) {
    camera.position.copy(eye);
    target.copy(aim);
    camera.lookAt(target);
    baseFov = fov;
    camera.fov = Math.min(72, fov * Math.max(1, Math.sqrt(1.34 / camera.aspect)));
    camera.updateProjectionMatrix();
  }

  function render() {
    renderer.render(active === 'workbench' ? inside.scene : outside, camera);
  }

  function schedule() {
    if (!request && visible && !lost) request = requestAnimationFrame(animate);
  }

  function animate(now) {
    request = 0;
    const delta = previous ? Math.min(.08, (now - previous) / 1000) : 0;
    previous = now;
    if (transition) {
      const progress = Math.min(1, (now - transition.start) / 740);
      const mix = progress * progress * (3 - 2 * progress);
      const { from, to } = transition;
      apply({
        eye: from.eye.clone().lerp(to.eye, mix),
        aim: from.aim.clone().lerp(to.aim, mix),
        fov: THREE.MathUtils.lerp(from.fov, to.fov, mix),
      });
      if (progress === 1) transition = null;
    }
    if (active === 'workbench' && !motion.matches) inside.bench.tick(delta);
    render();
    if (transition || (active === 'workbench' && !motion.matches)) schedule();
    else previous = 0;
  }

  function jump(view) {
    if (view === 'workbench') inside ??= interior(onAction);
    active = view;
    apply(pose(view));
    render();
    schedule();
  }

  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height || lost) return;
    camera.aspect = width / height;
    renderer.setSize(width, height, false);
    if (active) {
      apply({ eye: camera.position, aim: target, fov: baseFov });
      render();
    }
  }

  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
    else if (request) {
      cancelAnimationFrame(request);
      request = 0;
      previous = 0;
    }
  });
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    lost = true;
    clearTimeout(pendingCut);
    if (request) cancelAnimationFrame(request);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    frame.classList.remove('is-cut');
    renderer.domElement.remove();
    onLoss();
  }, { once: true });
  stage.append(renderer.domElement);
  resize();
  jump(initial);
  resizeObserver.observe(stage);
  intersectionObserver.observe(stage);

  return {
    show(view) {
      if (lost) return;
      clearTimeout(pendingCut);
      frame.classList.remove('is-cut');
      transition = null;
      if (view === active) {
        jump(view);
      } else if (motion.matches) {
        jump(view);
      } else if (view === 'workbench' || active === 'workbench') {
        if (view === 'workbench') inside ??= interior(onAction);
        frame.classList.add('is-cut');
        pendingCut = setTimeout(() => {
          jump(view);
          frame.classList.remove('is-cut');
        }, 170);
      } else {
        transition = { from: { eye: camera.position.clone(), aim: target.clone(), fov: baseFov }, to: pose(view), start: performance.now() };
        active = view;
        schedule();
      }
    },
    operate(id) {
      if (!inside || lost) return;
      const { lamp, drawer } = inside.bench.operate(id);
      inside.practical.intensity = lamp ? 3.2 : 0;
      if (motion.matches) inside.bench.set({ drawer });
      schedule();
    },
  };
}
