// Tetsuo from Johansson Town, rigged for bench work: walk, lean, look, and two-bone IK so his hands
// land on real points of the motor (studs, shaft, isolator). The avatar is the town's own build.js.
import * as THREE from 'three';
import { buildAvatar } from '/johansson-town/src/avatars/build.js';
import { recipeFor } from '/johansson-town/src/avatars/cast.js';

const V = () => new THREE.Vector3();
const _q = new THREE.Quaternion(), _a = V(), _b = V(), _c = V(), _d = V();

export function createTetsuo() {
  const av = buildAvatar(recipeFor('Tetsuo'), { shadows: true });
  const holder = new THREE.Group();
  holder.name = 'Tetsuo';
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
  let opacity = 1;
  function setOpacity(o) {
    if (Math.abs(o - opacity) < 0.005) return;
    opacity = o;
    for (const mesh of own) for (const mt of [].concat(mesh.material)) {
      mt.transparent = o < 0.99; mt.opacity = o; mt.depthWrite = o >= 0.99;
    }
  }
  const head = av.face.head;
  head.geometry.computeBoundingSphere();
  const _s = new THREE.Sphere();
  // blocking: 0 (clear) … 1 (the line of sight runs through his head or chest)
  function blocking(from, to) {
    _s.copy(head.geometry.boundingSphere).applyMatrix4(head.matrixWorld);
    const line = new THREE.Line3(from, to), p = V();
    let worst = 0;
    for (const [c, r] of [[_s.center, _s.radius * 1.05], [B.chest.getWorldPosition(V()), m.width * 0.6]]) {
      line.closestPointToPoint(c, true, p);
      if (p.distanceTo(from) < 0.05 || p.distanceTo(to) < 0.02) continue;
      worst = Math.max(worst, THREE.MathUtils.clamp(1.4 - p.distanceTo(c) / r, 0, 1));
    }
    return worst;
  }
  return { holder, avatar: av, measure: m, hold, apply, setOpacity, blocking };
}
