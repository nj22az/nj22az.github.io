// Generatorn i 3D: samma modell som kursens figurer (figurer3d/modeller.mjs). Byggs till scen.js.
import { THREE, scen, generator } from '../figurer3d/modeller.mjs';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function mount(el) {
  const r = new THREE.WebGLRenderer({ antialias: true }); r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); r.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(r.domElement);
  r.domElement.setAttribute('role', 'img');
  r.domElement.setAttribute('aria-label', 'Generatorn i 3D: statorn med tre spolar 120° isär och rotorn i mitten. Rotorns vinkel styrs med reglaget.');
  const s = scen('#edf3f7'); const m = generator(); s.add(m.grupp);
  const cam = new THREE.PerspectiveCamera(34, 1, 0.1, 100); cam.position.copy(m.kamera.pos);
  const ctl = new OrbitControls(cam, r.domElement); ctl.target.copy(m.kamera.mal); ctl.enableDamping = true; ctl.minDistance = 5; ctl.maxDistance = 20;
  const rita = () => r.render(s, cam);
  ctl.addEventListener('change', rita);
  const size = () => { const w = el.clientWidth || 400, h = el.clientHeight || 400; r.setSize(w, h, false); r.domElement.style.width = '100%'; r.domElement.style.height = '100%'; cam.aspect = w / h; cam.updateProjectionMatrix(); rita(); };
  new ResizeObserver(size).observe(el); size();
  (function loop() { requestAnimationFrame(loop); if (ctl.update()) rita(); })();
  return { satt(grader) { m.uppdatera(grader); rita(); } };
}
