// Renderar en modell till en PNG och projicerar ankarpunkterna till bildkoordinater (för etiketter).
// rendera.html?m=generator&v=0&w=1600&h=1000
import { THREE, scen, generator, stjarnkoppling, plint, transformator } from './modeller.mjs';
const q = new URLSearchParams(location.search);
const w = +q.get('w') || 1600, h = +q.get('h') || 1000;
const modell = { generator: () => generator({ vinkel: +q.get('v') || 0 }), stjarna: stjarnkoppling, plintY: () => plint({ lage: 'Y' }), plintD: () => plint({ lage: 'D' }), plint: () => plint({ lage: 'inga' }), transformator }[q.get('m')]();
const s = scen('#ffffff'); s.add(modell.grupp);
const k = modell.kamera, cam = new THREE.PerspectiveCamera(k.fov, w / h, 0.1, 100); cam.position.copy(k.pos); cam.lookAt(k.mal);
const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); r.setSize(w, h); r.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(r.domElement); r.render(s, cam);
const ankare = {};
for (const [n, p] of Object.entries(modell.ankare)) { const v = p.clone().project(cam); ankare[n] = [Math.round((v.x + 1) / 2 * w), Math.round((1 - v.y) / 2 * h)]; }
window.RESULTAT = { bild: r.domElement.toDataURL('image/png'), ankare };
