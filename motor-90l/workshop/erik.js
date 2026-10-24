// Erik, rigged for bench work: walk, lean, look, and two-bone IK so his hands land on real points of
// the motor (studs, shaft, isolator). He is built with Johansson Town's own avatar code, so he can move
// into the town's cast (src/avatars/cast.js) as he is.
import * as THREE from 'three';
import { buildAvatar } from '/johansson-town/src/avatars/build.js';

/**
 * Erik: an old Swedish sailor, forty years in engine rooms, who settled on the island and now runs
 * the electrical bench at the dock workshop. Fair, weathered, white beard, skipper's cap.
 */
export const ERIK_RECIPE = Object.freeze({
  v: 1, name: 'Erik', age: 'elder',
  body: { height: 0.62, build: 0.62, silhouette: 'masculine', skin: '#f0cdb4' },
  head: { size: 0.5, shape: 0.55, form: 'soft-square', jaw: 0.6, cheeks: 0.5 },
  hair: { style: 'crop', colour: '#e9e6e0' },
  eyes: { style: 'gentle', colour: '#4c7aa6', size: 0.45 },
  brows: { style: 'bushy', colour: '#e4e0d8', size: 0.6 },
  nose: { style: 'wide', size: 0.55 },
  mouth: { style: 'smile', colour: '#b8544a', size: 0.45 },
  facial: { style: 'beard', colour: '#ece9e3' },
  blush: 0.45, wrinkles: 0.75,
  outfit: { top: 'jacket', topColour: '#24324f', bottom: 'trousers', bottomColour: '#3b3d42', footwear: 'boots', shoes: '#2b2420',
    hat: 'captain', hatColour: '#1d2840', accent: '#f4f1ea' },
});

const V = () => new THREE.Vector3();
const _q = new THREE.Quaternion(), _a = V(), _b = V(), _c = V(), _d = V();

export function createErik() {
  const av = buildAvatar(ERIK_RECIPE, { shadows: true });
  const holder = new THREE.Group();
  holder.name = 'Erik';
  holder.add(av.root);
  const B = av.bones, m = av.measure;
  const props = { R: new THREE.Group(), L: new THREE.Group() };
  for (const s of ['R', 'L']) { props[s].position.set(0, -m.hand * 0.9, 0); B['hand' + s].add(props[s]); }
  const held = { R: null, L: null };

  function hold(side, obj) {
    if (held[side] === obj) return;
    if (held[side]) props[side].remove(held[side]);
    held[side] = obj || null;
    if (obj) props[side].add(obj);
    av.setOpenHands(!!(held.R || held.L) ? false : true);
  }

  // Where a hand hangs when it has nothing to do, in world space.
  function restPoint(side, out) {
    B['shoulder' + side].getWorldPosition(out);
    const down = _a.set(0, -1, 0).multiplyScalar((m.upper + m.fore) * 0.97);
    const fwd = _b.set(0, 0, 1).applyQuaternion(holder.quaternion).multiplyScalar(0.04);
    return out.add(down).add(fwd);
  }

  function solveArm(side, target) {
    const sh = B['shoulder' + side], el = B['elbow' + side], ha = B['hand' + side];
    const L1 = el.position.length(), L2 = ha.position.length();
    const S = sh.getWorldPosition(V());
    const T = target.clone();
    // the hand's tip touches the target: aim the wrist a hand's length short of it
    const toT = _a.copy(T).sub(S);
    const dist = toT.length();
    T.addScaledVector(toT.normalize(), -m.hand * 1.2);
    const d = THREE.MathUtils.clamp(T.distanceTo(S), Math.abs(L1 - L2) + 1e-3, (L1 + L2) * 0.999);
    const u = _b.copy(T).sub(S).normalize();
    // elbows drop down and outward, like someone working at a bench
    const outward = Math.sign(sh.position.x) || 1;
    const pole = _c.set(outward * 0.7, -1, -0.25).applyQuaternion(av.root.getWorldQuaternion(_q));
    pole.addScaledVector(u, -pole.dot(u)).normalize();
    const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const E = S.clone().addScaledVector(u, a).addScaledVector(pole, h);
    const W = S.clone().addScaledVector(u, d);
    // shoulder: rest direction to the elbow → S→E, in the shoulder's parent frame
    const qp = sh.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
    sh.quaternion.setFromUnitVectors(el.position.clone().normalize(), _d.copy(E).sub(S).normalize().applyQuaternion(qp));
    sh.updateMatrixWorld(true);
    const qs = sh.getWorldQuaternion(new THREE.Quaternion()).invert();
    el.quaternion.setFromUnitVectors(ha.position.clone().normalize(), _d.copy(W).sub(E).normalize().applyQuaternion(qs));
    el.updateMatrixWorld(true);
    return dist;
  }

  let talkClock = 0;
  /**
   * pose: { x, z, face (rad, 0 = facing +z), lean (0–1), walk (0–1 weight), phase (rad),
   *         R, L (world Vector3 or null), look (world Vector3 or null), talking (bool), mood }
   */
  function apply(pose, dt) {
    holder.position.set(pose.x, 0, pose.z);
    holder.rotation.y = pose.face + Math.PI;
    for (const b of Object.values(B)) if (b.name !== 'root') b.quaternion.identity();
    const w = pose.walk || 0, ph = pose.phase || 0;
    B.thighL.rotation.x = -Math.sin(ph) * 0.45 * w;
    B.thighR.rotation.x = Math.sin(ph) * 0.45 * w;
    B.kneeL.rotation.x = Math.max(0, Math.sin(ph)) * 0.7 * w;
    B.kneeR.rotation.x = Math.max(0, -Math.sin(ph)) * 0.7 * w;
    B.root.position.y = (B.root.userData.y0 ??= B.root.position.y) + Math.abs(Math.cos(ph)) * 0.012 * w;
    B.spine.rotation.x = pose.lean * 0.55;
    B.chest.rotation.x = pose.lean * 0.3;
    B.spine.rotation.y = pose.twist || 0;
    holder.updateMatrixWorld(true);
    for (const s of ['R', 'L']) {
      // a hand target is a point, null (hang), or a blend {from, to, w} between two of those
      const spec = pose[s];
      let t;
      if (spec && spec.isVector3) t = spec.clone();
      else if (spec && 'w' in spec) {
        const a = spec.from ? spec.from.clone() : restPoint(s, V()), b = spec.to ? spec.to.clone() : restPoint(s, V());
        t = a.lerp(b, spec.w);
      } else t = restPoint(s, V());
      if (!spec && w > 0) t.add(_a.set(0, 0, (s === 'R' ? 1 : -1) * Math.sin(ph) * 0.06 * w).applyQuaternion(holder.quaternion));
      solveArm(s, t);
    }
    if (pose.look) {
      const p = av.root.worldToLocal(pose.look.clone()).sub(_a.set(0, m.headCentre, 0));
      const yaw = THREE.MathUtils.clamp(Math.atan2(p.x, p.z), -1.1, 1.1);
      const pitch = THREE.MathUtils.clamp(Math.atan2(-p.y, Math.hypot(p.x, p.z)) - pose.lean * 0.6, -0.6, 0.7);
      B.neck.rotation.set(pitch * 0.35, yaw * 0.35, 0);
      B.head.rotation.set(pitch * 0.65, yaw * 0.65, 0);
    }
    talkClock += dt;
    av.paintFace({ expression: pose.mood || 'neutral', talk: pose.talking && Math.sin(talkClock * 22) > 0 ? 1 : 0, blink: (talkClock % 3.7) < 0.12 ? 1 : 0 });
  }

  // Fade when he stands between the camera and the work (his head is wider than the terminal box).
  const own = [];
  holder.traverse(o => { if (o.isMesh) own.push(o); });
  // A see-through toon body shows the inside of its own head, so a ghosted Erik is a flat pale silhouette instead.
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0xdfe8ee, transparent: true, opacity: 0.3, depthWrite: false });
  const originals = new Map(own.map(mesh => [mesh, mesh.material]));
  let opacity = 1;
  function setOpacity(o) {
    if (Math.abs(o - opacity) < 0.005) return;
    opacity = o;
    const ghosted = o < 0.97;
    ghostMat.opacity = 0.12 + 0.5 * o;
    for (const mesh of own) {
      if (mesh.userData.outline) { mesh.visible = !ghosted; continue; }
      mesh.material = ghosted ? ghostMat : originals.get(mesh);
    }
  }
  const head = av.face.head;
  head.geometry.computeBoundingSphere();
  const _s = new THREE.Sphere();
  // blocking: 0 (clear) … 1 — does his head (with the cap) or chest cover the point the camera looks at,
  // seen from the camera, and is it nearer than that point?
  function blocking(camera, to) {
    _s.copy(head.geometry.boundingSphere).applyMatrix4(head.matrixWorld);
    const toDist = camera.position.distanceTo(to);
    const tp = to.clone().project(camera);
    let worst = 0;
    for (const [c, r] of [[_s.center.clone(), _s.radius * 1.45], [B.chest.getWorldPosition(V()), m.width * 0.6]]) {
      const d = camera.position.distanceTo(c);
      if (d > toDist - 0.02) continue;
      const cp = c.clone().project(camera);
      // projected radius in NDC (vertical), corrected for aspect horizontally
      const rN = r / (d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      const dx = (tp.x - cp.x) * camera.aspect, dy = tp.y - cp.y;
      worst = Math.max(worst, THREE.MathUtils.clamp(1.3 - Math.hypot(dx, dy) / rN, 0, 1));
    }
    return worst;
  }
  return { holder, avatar: av, measure: m, hold, apply, setOpacity, blocking };
}
