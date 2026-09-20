var Lf = 1.62,
  Rf = `/thuans-storage/models/thuan.glb`,
  zf = 1.25,
  Bf = 3.3,
  Vf = new Id(),
  Hf = null;
function Uf() {
  return ((Hf ||= Vf.loadAsync(Rf)), Hf);
}
function Wf() {
  return Uf();
}
function Gf(e, t) {
  let n = t.map((e) => e.toLowerCase());
  return e.find((e) => n.includes(e.name.toLowerCase()));
}
function Kf(e) {
  if (!e) return { x: 0, z: 0 };
  let t = e.tracks.find(
    (e) => e.name.endsWith(`Hips.position`) || e.name === `Hips.position`,
  );
  return t ? { x: t.values[0] ?? 0, z: t.values[2] ?? 0 } : { x: 0, z: 0 };
}
function qf(e, t) {
  for (let n of e.tracks) {
    if (!n.name.endsWith(`Hips.position`) && n.name !== `Hips.position`)
      continue;
    let e = n.values;
    for (let n = 0; n < e.length; n += 3) ((e[n] = t.x), (e[n + 2] = t.z));
  }
}
function Jf(e, t, n = 2.4) {
  let r = e.clone();
  ((r.name = t), (r.duration = n));
  for (let e of r.tracks) {
    let t = e.getValueSize(),
      r = e.values.slice(0, t);
    e.times = new Float32Array([0, n]);
    let i = new Float32Array(t * 2);
    (i.set(r, 0), i.set(r, t), (e.values = i));
  }
  return r;
}
function Yf(e) {
  e.traverse((e) => {
    if (!(e instanceof q)) return;
    let t = Array.isArray(e.material) ? e.material : [e.material];
    for (let e of t)
      (e instanceof oo || e instanceof so) &&
        (e.emissive.setHex(0),
        (e.emissiveIntensity = 0),
        (e.roughness = un.clamp(e.roughness * 0.92, 0.32, 0.78)),
        (e.metalness = Math.min(e.metalness, 0.12)),
        (e.envMapIntensity = 0.55),
        e.map && (e.map.anisotropy = 8),
        (e.needsUpdate = !0));
    ((e.castShadow = !1),
      (e.receiveShadow = !0),
      e instanceof Zi && ((e.frustumCulled = !1), (e.bindMode = te)));
  });
}
function Xf(e, t = 0.55) {
  return new oo({ color: e, roughness: t, metalness: 0.04 });
}
function Zf() {
  let e = new ur();
  e.name = `thuan-standin`;
  let t = Xf(Ad.skin, 0.48),
    n = Xf(Ad.hair, 0.62),
    r = Xf(Ad.rose, 0.52),
    i = Xf(Ad.roseDeep, 0.55),
    a = Xf(2761247, 0.4),
    o = new ur();
  ((o.name = `standin-hips`), (o.position.y = 0.92), e.add(o));
  let s = new q(new Ua(0.16, 0.38, 5, 10), r);
  ((s.position.y = 0.18), o.add(s));
  let c = new q(new Ka(0.24, 0.42, 10, 1, !0), i);
  ((c.position.y = -0.22), (c.rotation.x = Math.PI), o.add(c));
  let l = new ur();
  ((l.name = `standin-head`), (l.position.y = 0.52));
  let u = new q(new Ya(0.155, 12, 10), t),
    d = new q(new Ya(0.16, 12, 10), n);
  (d.position.set(0, 0.06, -0.02), d.scale.set(1.05, 0.85, 1.1));
  let f = new q(new Ya(0.12, 10, 8), n);
  (f.position.set(0, 0.08, 0.08),
    f.scale.set(1.15, 0.45, 0.7),
    l.add(u, d, f),
    o.add(l));
  let p = (e) => {
      let n = new q(new Ua(0.045, 0.34, 4, 8), t);
      return (
        n.position.set(e, 0.16, 0),
        (n.name = e > 0 ? `standin-arm-r` : `standin-arm-l`),
        o.add(n),
        n
      );
    },
    m = (n) => {
      let r = new ur(),
        i = new q(new Ua(0.055, 0.38, 4, 8), t);
      i.position.y = -0.28;
      let o = new q(new Ua(0.05, 0.08, 4, 8), a);
      return (
        (o.position.y = -0.54),
        r.position.set(n, 0.92, 0),
        (r.name = n > 0 ? `standin-leg-r` : `standin-leg-l`),
        r.add(i, o),
        e.add(r),
        r
      );
    };
  return (p(-0.2), p(0.2), m(-0.08), m(0.08), e);
}
function Qf(e, t, n, r) {
  let i = e.getObjectByName(`standin-hips`),
    a = e.getObjectByName(`standin-head`),
    o = e.getObjectByName(`standin-arm-l`),
    s = e.getObjectByName(`standin-arm-r`),
    leftLeg = e.getObjectByName(`standin-leg-l`),
    rightLeg = e.getObjectByName(`standin-leg-r`),
    c =
      t > 0.25
        ? Math.sin(n * 8.5) * Math.min(0.55, t * 0.18)
        : Math.sin(n * 2.2) * 0.04;
  (leftLeg && (leftLeg.rotation.x = t > 0.25 ? -c : 0),
    rightLeg && (rightLeg.rotation.x = t > 0.25 ? c : 0),
    i &&
    (i.position.y =
      0.92 +
      Math.abs(Math.sin(n * (t > 0.25 ? 8.5 : 2.2))) *
        (t > 0.25 ? 0.03 : 0.012)),
    a && (a.rotation.z = c * 0.12),
    o &&
      ((o.rotation.x = r && t < 0.28 ? Math.sin(n * 5) * 0.7 - 0.2 : c),
      (o.rotation.z = 0.12)),
    s && ((s.rotation.x = r && t < 0.28 ? 0.15 : -c), (s.rotation.z = -0.12)));
}
function $f(e) {
  let t = new ur();
  t.name = `Thuan`;
  let n = new us(16774120, 0.28, 3.4, 1.8);
  (n.position.set(0.18, 1.48, 0.42), t.add(n));
  let r = new q(
    new Wa(0.28, 18),
    new Oi({ color: 1708560, transparent: !0, opacity: 0.22, depthWrite: !1 }),
  );
  ((r.rotation.x = -Math.PI / 2), (r.position.y = 0.02), t.add(r));
  let i = Zf();
  t.add(i);
  let a = null,
    o = new Map(),
    s = ``,
    c = !0,
    l = !1,
    u = !1,
    d = !1,
    f = Math.PI,
    p = Math.PI,
    m = 0,
    pickupTime = 0,
    headBone = null,
    forearmBone = null,
    h = (e, t = 0.24) => {
      if (!a || s === e) return;
      let n = o.get(e);
      if (!n) return;
      let r = o.get(s);
      ((n.enabled = !0),
        // Fading multiplies the action weight. A zero base weight makes
        // every subsequent walking/running clip invisible.
        n.reset().stopFading().setEffectiveWeight(1).setEffectiveTimeScale(1).play(),
        r && r !== n
          ? r.crossFadeTo(n, t, !1)
          : n.setEffectiveWeight(1).fadeIn(t),
        (s = e));
    },
    g = (e, t = !1) => {
      ((p = e), t && (f = e));
    },
    _ = (e) => {
      if (l && o.has(`celebrate`)) {
        h(`celebrate`, 0.28);
        return;
      }
      if (c && e < 0.28 && o.has(`wave`)) {
        h(`wave`, 0.22);
        return;
      }
      e > 3.45 && o.has(`run`)
        ? h(`run`, 0.18)
        : e > 0.22 && o.has(`walk`)
          ? h(`walk`, 0.2)
          : h(`idle`, 0.28);
      let t = o.get(s);
      t &&
        (s === `walk`
          ? t.setEffectiveTimeScale(un.clamp(e / zf, 0.78, 1.45))
          : s === `run`
            ? t.setEffectiveTimeScale(un.clamp(e / Bf, 0.82, 1.28))
            : t.setEffectiveTimeScale(s === `idle` ? 0.45 : 1));
    },
    v = (e, n, r, o) => {
      ((m += e),
        (f = Sd(f, p, 1 - Math.exp(-(n > 0.4 ? 9 : 6.5) * e))),
        (t.rotation.y = f + Math.PI),
        i.visible && Qf(i, n, m, c),
        a && u && (_(n), a.update(e)));
      pickupTime = Math.max(0, pickupTime - e);
      if (headBone && !c && !l) {
        const nod = pickupTime > 0 ? Math.sin((1 - pickupTime / 0.85) * Math.PI) * 0.18 : 0;
        headBone.rotateX(nod);
        if (n < 0.2) headBone.rotateY(Math.sin(m * 0.55) * 0.045);
      }
      if (forearmBone && pickupTime > 0 && n < 0.25) forearmBone.rotateX(-Math.sin(pickupTime / 0.85 * Math.PI) * 0.28);
    },
    y = (e, n) => {
      let r = Pd(e);
      (Yf(r), r.updateMatrixWorld(!0));
      let s = new Pr().setFromObject(r),
        c = s.max.y - s.min.y;
      (c > 1e-4 && r.scale.setScalar(Lf / c), r.updateMatrixWorld(!0));
      let l = new Pr().setFromObject(r);
      ((r.position.y -= l.min.y),
        (r.rotation.y = 0),
        t.add(r),
        (i.visible = !1));
      headBone = r.getObjectByName(`Head`);
      forearmBone = r.getObjectByName(`RightForeArm`);
      let d = n.map((e) => e.clone()),
        f = Gf(d, [`restpose`, `Idle_Neutral`, `Idle`, `T-Pose`, `TPose`]),
        p = Gf(d, [`Walking`, `Walk`, `Casual_Walk`]),
        m = Gf(d, [`Running`, `Run`]),
        g = Gf(d, [`Big_Wave_Hello`, `Wave`]),
        _ = Gf(d, [`Big_Heart_Gesture`]),
        v = Kf(f ?? p ?? d[0]);
      for (let e of d) qf(e, v);
      let y = Gf(d, [`Catching_Breath`]) ?? f ?? (p ? Jf(p, `Idle_Hold`, 2.6) : d[0]);
      a = new Ls(r);
      let b = (e, t, n) => {
        if (!t || !a) return;
        let r = a.clipAction(t);
        (r.setLoop(n, n === 2200 ? 1 : 1 / 0),
          (r.clampWhenFinished = n === ot),
          r.setEffectiveWeight(0),
          o.set(e, r));
      };
      (b(`idle`, y, st),
        b(`walk`, p, st),
        b(`run`, m, st),
        b(`wave`, g, st),
        b(`celebrate`, _, st),
        h(`wave`, 0.01),
        a.update(0),
        (u = !0));
    },
    b = (t) => {
      if (!d) {
        if (t)
          try {
            y(t.scene, t.animations ?? []);
          } catch (e) {
            (console.warn(`Thuan model failed to mount, keeping stand-in`, e),
              (i.visible = !0),
              (u = !0));
          }
        else ((i.visible = !0), (u = !0));
        e?.onReady?.();
      }
    };
  return (
    e?.gltf
      ? b(e.gltf)
      : Uf().then(
          (e) => b(e),
          (e) => {
            (console.warn(`Thuan model failed to load, keeping stand-in`, e),
              b(null));
          },
        ),
    {
      group: t,
      get ready() {
        return u;
      },
      update: v,
      setHeading: g,
      getHeading: () => f,
      getAnimationState: () => ({name:s,weight:o.get(s)?.getEffectiveWeight() ?? 0,time:o.get(s)?.time ?? 0}),
      setWave: (e) => {
        c = e;
      },
      setCelebrate: (e) => {
        l = e;
      },
      playPickup: () => { pickupTime = 0.85; },
      setVisible: (e) => {
        t.visible = e;
      },
      dispose: () => {
        ((d = !0),
          a?.stopAllAction(),
          (a = null),
          t.traverse((e) => {
            if (e instanceof q) {
              e.geometry.dispose();
              let t = e.material;
              Array.isArray(t) ? t.forEach((e) => e.dispose()) : t.dispose();
            }
            e instanceof qo && e.dispose();
          }));
      },
    }
  );
}
