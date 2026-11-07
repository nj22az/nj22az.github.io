/*
 * Polivoks filter simulator: circuit model and synthesiser voice.
 *
 * The filter is a component-level model of the Eurorack Polivoks filter by clarionut
 * (github.com/clarionut/Polivoks_filter, schematic at commit 9c155cf). Every resistor
 * below carries its reference designator from that schematic. Nothing is copied from the
 * project: the schematic was read, the netlist was recomputed from the KiCad file, and the
 * behaviour of each stage was derived from it (see ../README.md for the derivation).
 *
 * One file serves three hosts: the AudioWorklet (registers the processor), the page
 * (imports DEFAULTS, makeUnit and the maps for readouts) and the Node tests.
 */

const Base = typeof AudioWorkletProcessor === 'function' ? AudioWorkletProcessor : class {};

export const KQ = 8.617333262e-5; // Boltzmann constant over electron charge, V/K
const TREF = 298.15; // 25 °C, where the nominal parts are specified
const EG_SI = 1.11; // silicon band gap, eV

/* Nominal parts, by reference designator (Schematic.pdf / Polivoks filter.kicad_sch). */
export const PARTS = {
  R1: 100e3, R2: 180e3, R3: 100e3, R4: 47e3, R5: 100e3, R6: 47e3, R7: 100e3, R8: 3e3,
  R9: 47e3, R10: 47e3, R11: 1e3, R12: 110e3, R13: 47e3, R14: 1e3, R15: 110e3,
  R16: 62e3, R17: 75e3, R18: 100e3, R19: 100e3, R21: 68e3, R22: 68e3, R24: 68e3, R25: 68e3,
  R26: 240e3, R27: 100e3, R28: 100e3,
  RV1: 100e3, RV2: 100e3, RV3: 100e3, RV4: 100e3, RV5: 50e3,
  C11: 10e-6, C12: 10e-6,
};

/* How far a built unit may stray from nominal. "ideal" keeps the circuit's own character
 * (exponential converter, slew-limited integrators, rails, over-tracking, the op-amps' own
 * noise) but removes every part tolerance, drift, ripple, wear and excess hiss. */
export const GRADES = {
  ideal: { res: 0, pot: 0, semi: 0, hiss: 1, drift: 0, vco: 0 }, // intrinsic 776 noise stays: it is physics
  modern: { res: 0.01, pot: 0.2, semi: 1, hiss: 1, drift: 1, vco: 1 },
  vintage: { res: 0.05, pot: 0.2, semi: 1.6, hiss: 2.5, drift: 1.8, vco: 2 },
};

export const OPEN = { frq: 1, att: 2, lvl: 4, res: 8, mix: 16 };
const POTS = ['frq', 'att', 'lvl', 'res', 'mix'];
const POT_PARAM = { 'flt.frq': 0, 'flt.cv1': 1, 'flt.lvl': 2, 'flt.res': 3, 'flt.mix': 4 };

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* One built module: every part value and every semiconductor spread, from a serial number. */
export function makeUnit(seed = 1982, grade = 'modern') {
  const name = GRADES[grade] ? grade : 'modern';
  const G = GRADES[name];
  const rnd = mulberry32(seed >>> 0 || 1);
  const gauss = () => Math.sqrt(-2 * Math.log(Math.max(rnd(), 1e-12))) * Math.cos(2 * Math.PI * rnd());
  const bound = (v, a) => Math.max(-a, Math.min(a, v));
  const tol = (t) => 1 + bound((gauss() * t) / 2.5, t); // a part inside its tolerance band
  const sd = (s, k = G.semi) => bound(gauss(), 3) * s * k; // a spread, bounded at three sigma
  const R = {};
  for (const k of Object.keys(PARTS)) {
    const t = k.startsWith('RV') ? G.pot : k.startsWith('C') ? (G.res ? 0.2 : 0) : G.res;
    R[k] = PARTS[k] * tol(t);
  }
  const chip = () => ({
    m: Math.exp(sd(0.06)), // Iset to input-stage tail current
    cc: 30e-12 * Math.exp(sd(0.05)), // internal compensation capacitor
    vos: sd(1.5e-3), // input offset voltage
    vk: Math.exp(sd(0.04)), // input-stage linear range around 4·Vt
    isd: Math.exp(sd(0.15)), // Iset-pin diode, sets the current split at low currents
    p2: 2.5 * Math.exp(sd(0.12)), // second pole, in units of the unity-gain frequency
    vpos: 10.7 + sd(0.15), vneg: -(11.0 + sd(0.15)), // output swing on ±12 V
    a0: 2e5 * Math.exp(sd(0.3)), // open-loop gain
  });
  const vco = () => ({
    cents: sd(6, G.vco), scale: sd(0.003, G.vco), tempco: sd(0.5, G.vco),
    reset: G.vco ? 2e-6 * Math.exp(sd(0.2, 1)) : 0, curve: G.vco ? 0.035 + sd(0.01, 1) : 0,
    asym: sd(0.012, G.vco), drift: 1.2 * G.drift,
  });
  const end = () => (G.pot ? [0.003 + Math.abs(sd(0.002, 1)), 0.003 + Math.abs(sd(0.002, 1))] : [0, 0]);
  return {
    seed: seed >>> 0, grade: name, R,
    q1: { Is: 6.73e-15 * Math.exp(sd(0.35)), beta: 180 * Math.exp(sd(0.25)) }, // 2N3904
    u2: chip(), u3: chip(), // the two MC1776 integrators
    tl: { vsat: 10.5 + sd(0.12) }, // TL072/TL074 swing on ±12 V
    potEnd: POTS.map(end),
    vreg: 12 * (1 + sd(0.002)),
    warmRise: G.drift ? 3 + sd(0.6, 1) : 0, warmTau: 480,
    hiss: G.hiss, drift: G.drift,
    vco: [vco(), vco()],
    eg: [tol(G.res ? 0.1 : 0), tol(G.res ? 0.1 : 0)],
    vcaBleed: G.vco ? 5e-4 * Math.exp(sd(0.3, 1)) : 0,
    vcaFeed: G.vco ? 2e-3 * Math.exp(sd(0.3, 1)) : 0,
  };
}

/* ---------- small helpers ---------- */

const TAU = 2 * Math.PI;
function clip(v, a) { return v > a ? a : v < -a ? -a : v; }
/* Op-amp output near its rail: linear to 92 % of the swing, then a short knee. */
export function sat(v, vs) {
  const a = v < 0 ? -v : v, k = 0.92 * vs;
  if (a <= k) return v;
  const s = k + (vs - k) * Math.tanh((a - k) / (vs - k));
  return v < 0 ? -s : s;
}
function tanhc(z) { return z > -1e-4 && z < 1e-4 ? 1 - (z * z) / 3 : Math.tanh(z) / z; }
/* Wiper position with the track's end resistance. */
function potPos(x, end) { return end[0] + (1 - end[0] - end[1]) * Math.max(0, Math.min(1, x)); }
function blep(t, dt) {
  if (t < dt) { t /= dt; return t + t - t * t - 1; }
  if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
  return 0;
}

/* Fast Gaussian noise (Irwin-Hall of four uniforms), its own xorshift state. */
class Noise {
  constructor(seed = 22222) { this.s = seed | 0 || 1; }
  u() { let s = this.s; s ^= s << 13; s ^= s >>> 17; s ^= s << 5; this.s = s; return s / 2147483648; }
  g() { return (this.u() + this.u() + this.u() + this.u()) * 0.8660254; }
}

/* Kaiser-windowed half-band FIR, length 2M+1 with M odd: every other tap is zero. */
export function halfband(M, beta) {
  const i0 = (x) => { let s = 1, t = 1; for (let k = 1; k < 40; k++) { t *= (x / (2 * k)) ** 2; s += t; } return s; };
  const L = 2 * M + 1, h = new Float64Array(L), den = i0(beta);
  let sum = 0;
  for (let k = 0; k < L; k++) {
    const n = k - M;
    const sinc = n === 0 ? 0.5 : n % 2 === 0 ? 0 : Math.sin((Math.PI * n) / 2) / (Math.PI * n);
    h[k] = sinc * (i0(beta * Math.sqrt(Math.max(0, 1 - (n / M) ** 2))) / den);
    sum += h[k];
  }
  for (let k = 0; k < L; k++) h[k] /= sum;
  return h;
}

/* Decimate by two: push two samples, get one. */
export class Decimator2 {
  constructor(M, beta) {
    const h = halfband(M, beta);
    this.L = h.length; this.M = M;
    this.c = []; this.i = [];
    for (let k = 0; k < this.L; k++) if (h[k] !== 0) { this.c.push(h[k]); this.i.push(k); }
    this.c = Float64Array.from(this.c); this.i = Int32Array.from(this.i);
    this.buf = new Float64Array(2 * this.L); this.w = 0;
  }
  push(v) { this.w = this.w === 0 ? this.L - 1 : this.w - 1; this.buf[this.w] = v; this.buf[this.w + this.L] = v; }
  run(a, b) {
    this.push(a); this.push(b);
    const buf = this.buf, w = this.w, c = this.c, idx = this.i;
    let y = 0;
    for (let j = 0; j < c.length; j++) y += c[j] * buf[w + idx[j]];
    return y;
  }
}

/* Interpolate by two: one sample in, two out (this.a then this.b). */
export class Interpolator2 {
  constructor(M, beta) {
    const h = halfband(M, beta);
    this.even = []; for (let k = 0; k < h.length; k += 2) this.even.push(2 * h[k]);
    this.even = Float64Array.from(this.even);
    this.n = this.even.length; this.mid = (M - 1) / 2;
    this.buf = new Float64Array(2 * this.n); this.w = 0; this.a = 0; this.b = 0;
  }
  run(x) {
    this.w = this.w === 0 ? this.n - 1 : this.w - 1;
    this.buf[this.w] = x; this.buf[this.w + this.n] = x;
    let y = 0;
    for (let j = 0; j < this.n; j++) y += this.even[j] * this.buf[this.w + j];
    this.a = y; this.b = this.buf[this.w + this.mid];
  }
}

/* ---------- the filter ---------- */

export class PolivoksFilter {
  constructor(fsOS, unit, seed = 777) {
    this.fs = fsOS; this.h = 1 / fsOS;
    this.noise = new Noise(seed);
    this.setUnit(unit || makeUnit(1982, 'ideal'));
    this.reset();
  }

  setUnit(u) {
    const R = u.R;
    this.u = u;
    this.beta3 = R.R14 / (R.R13 + R.R14); // R13/R14 into U3+
    this.Glp = 1 / R.R10; this.G11 = 1 / R.R11; // R10 from LP, R11 to ground at U2−
    this.gBP = R.R18 / R.R16; this.gLP = R.R19 / R.R17; // U4B, U4A output buffers
    this.hpBP = Math.exp(-this.h / (R.R16 * R.C11)); this.hpLP = Math.exp(-this.h / (R.R17 * R.C12));
    this.mixInv = R.R28 / R.R27;
    this.vs = u.tl.vsat;
  }

  reset() {
    this.x = 0; this.y = 0; this.s1 = 0; this.s2 = 0; this.T2 = 1; this.T3 = 1;
    this.hx = 0; this.px = 0; this.hy = 0; this.py = 0;
    this.bpo = 0; this.lpo = 0; this.mixo = 0;
    this.vbe = 0.4; this.d = 0; this.w2 = -1; this.w3 = -1; this.dw2 = 0; this.dw3 = 0;
    this.clipped = false;
  }

  /*
   * Control path, from the panel to the two Iset pins. c = { frq, att, lvl, res, mix (pot
   * fractions), open (OPEN bitmask: wipers lifted), cv1, cv2 (V), vplus (V), tempC, hiss,
   * steps (oversampled steps until the next call, for interpolation) }.
   */
  control(c) {
    const u = this.u, R = u.R, q1 = u.q1;
    const Tk = c.tempC + 273.15, Vt = KQ * Tk;
    this.Vt = Vt;
    // U1A (TL072) attenuverter on CV1: out = (1 + R5/R1)·wiper − (R5/R1)·CV1.
    const wiper = c.open & OPEN.att ? 0 : potPos(c.att, u.potEnd[1]) * c.cv1;
    const u1a = sat((1 + R.R5 / R.R1) * wiper - (R.R5 / R.R1) * c.cv1, this.vs);
    // Currents into U1B's virtual earth: FRQ pot (RV1 from +12 V) via R2, CV2 via R3, U1A via R6, +12 V via R7.
    let ifrq = 0;
    if (!(c.open & OPEN.frq)) {
      const xf = potPos(c.frq, u.potEnd[0]);
      ifrq = (xf * c.vplus) / (R.R2 + R.RV1 * xf * (1 - xf));
    }
    const iin = ifrq + c.cv2 / R.R3 + u1a / R.R6 + c.vplus / R.R7;
    // Q1 (2N3904) is U1B's feedback with R8 across its base-emitter: iin = Vbe/R8 + Ic/β.
    // No temperature compensation: Is and Vt both move with the case temperature.
    const Is = q1.Is * Math.pow(Tk / TREF, 3) * Math.exp((EG_SI / KQ) * (1 / TREF - 1 / Tk));
    let v;
    if (iin <= 0) v = iin * R.R8;
    else {
      v = Math.min(iin * R.R8, 0.9); // an upper bound: Newton then converges from above
      for (let k = 0; k < 4; k++) {
        const e = Math.exp(v / Vt);
        v -= (v / R.R8 + (Is * (e - 1)) / q1.beta - iin) / (1 / R.R8 + (Is * e) / (q1.beta * Vt));
      }
    }
    const ic0 = Math.max(0, Is * (Math.exp(v / Vt) - 1));
    // Collector compliance: R12, R15 (110k each) from the Iset pins (≈ V+ − 0.6 V) to the collector.
    const icMax = Math.max(1e-9, (c.vplus - 0.7 + v) * (1 / R.R12 + 1 / R.R15));
    const r4 = (ic0 / icMax) ** 4;
    const ic = ic0 / Math.sqrt(Math.sqrt(1 + r4));
    // The current divides between the two Iset diodes: by their mismatch at low current,
    // by R12/R15 at high current.  2Vt·atanh(d) + Ic·(Rm·d + Rd) = Vt·ln(Is2/Is3).
    const lnr = Math.log(u.u2.isd / u.u3.isd), Rm = 0.5 * (R.R12 + R.R15), Rd = 0.5 * (R.R12 - R.R15);
    let d = this.d;
    for (let k = 0; k < 4; k++) {
      const g = 2 * Vt * Math.atanh(d) + ic * (Rm * d + Rd) - Vt * lnr;
      d -= g / ((2 * Vt) / (1 - d * d) + ic * Rm);
      d = d > 0.999 ? 0.999 : d < -0.999 ? -0.999 : d;
    }
    const i2 = 0.5 * ic * (1 + d) + 2e-11, i3 = 0.5 * ic * (1 - d) + 2e-11;
    this.vbe = v; this.d = d; this.ic = ic; this.i2 = i2; this.i3 = i3; this.iin = iin;
    // Each MC1776 runs open loop as an integrator: slew rate SR = m·Iset/Cc, the input pair's
    // tanh has its knee at Vk ≈ 4·Vt, so the small-signal integrator gain is w = SR/Vk.
    const vk2 = 4 * Vt * u.u2.vk, vk3 = 4 * Vt * u.u3.vk;
    const w2 = (u.u2.m * i2) / u.u2.cc / vk2, w3 = (u.u3.m * i3) / u.u3.cc / vk3;
    this.vk2 = vk2; this.vk3 = vk3;
    const steps = c.steps || 1;
    if (this.w2 < 0) { this.w2 = w2; this.w3 = w3; }
    this.dw2 = (w2 - this.w2) / steps; this.dw3 = (w3 - this.w3) / steps;
    this.lam2 = w2 / u.u2.a0; this.lam3 = w3 / u.u3.a0; // finite open-loop gain: a slight leak
    // U2's inverting input: R4 (AUDIO, via RV3), R9 (RESONANCE wiper of RV4 on BP), R10 (LP), R11 to ground.
    let Gin = 0, xin = 0, Gr = 0, xr = 0;
    if (!(c.open & OPEN.lvl)) { xin = potPos(c.lvl, u.potEnd[2]); Gin = 1 / (R.R4 + R.RV3 * xin * (1 - xin)); }
    if (!(c.open & OPEN.res)) { xr = potPos(1 - c.res, u.potEnd[3]); Gr = 1 / (R.R9 + R.RV4 * xr * (1 - xr)); }
    const Gsum = Gin + Gr + this.Glp + this.G11;
    // The op-amps' second pole (p2·ωu) lags the loop; at the cutoff that is negative damping
    // of b·(1/p2₂ + 1/p2₃), which is why the filter breaks into oscillation near full resonance.
    const kpar = this.beta3 * (w3 / (w2 * u.u2.p2) + 1 / u.u3.p2);
    this.ain = (Gin * xin) / Gsum;
    this.arr = (Gr * xr - kpar * this.Glp) / Gsum;
    this.alp = this.Glp / Gsum;
    this.kpar = kpar; this.knet = this.arr / this.alp;
    // Input-referred hiss of each 776 rises as its bias falls (∝ 1/√Iset).
    const bw = Math.sqrt(0.5 * this.fs);
    this.n2 = c.hiss * 20e-9 * Math.sqrt(15e-6 / Math.max(i2, 5e-10)) * bw;
    this.n3 = c.hiss * 20e-9 * Math.sqrt(15e-6 / Math.max(i3, 5e-10)) * bw;
    // Small-signal cutoff and Q, for the readout and the trapezoidal prewarp.
    const a = w2 * this.alp, b = w3 * this.beta3, w0 = Math.sqrt(a * b);
    this.w0 = w0;
    this.q = this.knet > 0 ? Math.sqrt(b / a) / this.knet : Infinity;
    const th = Math.min(w0 * this.h * 0.5, 1.3);
    this.warp = th > 1e-6 ? Math.tan(th) / th : 1;
    // RV5 shunts MIX1 (BP side) or MIX2 (LP side) to ground; R24/R25 into U4C (R26), U4D inverts.
    let k1, k2;
    if (c.open & OPEN.mix) {
      k1 = (1 / R.R21) / (1 / R.R21 + 1 / R.R24); k2 = (1 / R.R22) / (1 / R.R22 + 1 / R.R25);
    } else {
      const xm = potPos(c.mix, u.potEnd[4]);
      const ga = xm > 1e-9 ? 1 / (R.RV5 * xm) : 1e12, gb = xm < 1 - 1e-9 ? 1 / (R.RV5 * (1 - xm)) : 1e12;
      k1 = (1 / R.R21) / (1 / R.R21 + 1 / R.R24 + ga); k2 = (1 / R.R22) / (1 / R.R22 + 1 / R.R25 + gb);
    }
    this.mk1 = (k1 / R.R24) * R.R26; this.mk2 = (k2 / R.R25) * R.R26;
  }

  /* One oversampled step with va volts at AUDIO IN. */
  tick(va) {
    const w2 = (this.w2 += this.dw2), w3 = (this.w3 += this.dw3);
    const g = 0.5 * this.h * this.warp;
    const c2 = this.u.u2.vos - this.ain * va + (this.n2 ? this.n2 * this.noise.g() : 0);
    const c3 = this.u.u3.vos + (this.n3 ? this.n3 * this.noise.g() : 0);
    const l2 = g * this.lam2, l3 = g * this.lam3, arr = this.arr, alp = this.alp, b3 = this.beta3;
    let T2 = this.T2, T3 = this.T3, x = 0, y = 0;
    // Trapezoidal (zero-delay) solve of both integrators, the tanh linearised and refined once.
    for (let it = 0; it < 2; it++) {
      const A = g * w2 * T2, B = g * w3 * T3;
      const a11 = 1 + A * arr + l2, a12 = A * alp, a21 = -B * b3, a22 = 1 + l3;
      const r1 = this.s1 + A * c2, r2 = this.s2 + B * c3;
      const det = a11 * a22 - a12 * a21;
      x = (r1 * a22 - a12 * r2) / det;
      y = (a11 * r2 - a21 * r1) / det;
      T2 = tanhc((c2 - arr * x - alp * y) / this.vk2);
      T3 = tanhc((b3 * x + c3) / this.vk3);
    }
    this.T2 = T2; this.T3 = T3;
    // The integrators cannot pass their output swing: they sit on the rail until the input turns.
    const u2 = this.u.u2, u3 = this.u.u3;
    if (x > u2.vpos) { x = u2.vpos; this.s1 = x; } else if (x < u2.vneg) { x = u2.vneg; this.s1 = x; } else this.s1 = 2 * x - this.s1;
    if (y > u3.vpos) { y = u3.vpos; this.s2 = y; } else if (y < u3.vneg) { y = u3.vneg; this.s2 = y; } else this.s2 = 2 * y - this.s2;
    this.x = x; this.y = y;
    // C11/R16 and C12/R17 couple to the inverting buffers U4B (×1.61) and U4A (×1.33).
    this.hx = this.hpBP * (this.hx + x - this.px); this.px = x;
    this.hy = this.hpLP * (this.hy + y - this.py); this.py = y;
    const vs = this.vs, bpRaw = -this.gBP * this.hx, lpRaw = -this.gLP * this.hy;
    if (bpRaw > vs || bpRaw < -vs || lpRaw > vs || lpRaw < -vs) this.clipped = true;
    const bp = sat(bpRaw, vs), lp = sat(lpRaw, vs);
    this.bpo = bp; this.lpo = lp;
    this.mixo = sat(-this.mixInv * sat(-(this.mk1 * bp + this.mk2 * lp), vs), vs);
  }
}

/* ---------- the rest of the synthesiser (our own design around the module) ---------- */

export const DEFAULTS = {
  'vco1.oct': 0, 'vco1.wave': 'saw', 'vco1.pw': 0.35,
  'vco2.oct': 0, 'vco2.wave': 'square', 'vco2.pw': 0.35, 'vco2.detune': 0.53,
  'mix.vco1': 0.8, 'mix.vco2': 0.55, 'mix.noise': 0,
  'flt.frq': 0.62, 'flt.cv1': 0.6, 'flt.lvl': 0.5, 'flt.res': 0.6, 'flt.mix': 0, 'flt.out': 'lp',
  'eg1.a': 0.12, 'eg1.d': 0.48, 'eg1.s': 0.25, 'eg1.r': 0.45,
  'eg2.a': 0.06, 'eg2.d': 0.5, 'eg2.s': 0.75, 'eg2.r': 0.42,
  'lfo.rate': 0.45, 'lfo.wave': 'tri', 'lfo.pitch': 0, 'lfo.filter': 0, 'lfo.pw': 0,
  'glob.glide': 0, 'glob.track': 0.5, 'glob.volume': 0.7, 'glob.mode': 'mono', 'glob.legato': 'off',
  'vca.mode': 'env', 'src': 'synth', 'probe': 'out', 'kbd.bend': 0, 'song.tempo': 0.5,
  'imp.grade': 'modern', 'imp.seed': 1982, 'imp.ambient': 22, 'imp.warmup': 'on',
  'imp.ripple': 0.15, 'imp.mains': 50, 'imp.hiss': 0.25, 'imp.wear': 0.3,
};

/* Knob laws shared by the processor and the page readouts. */
export const MAP = {
  time: (x) => 0.001 * Math.pow(10, 4 * x), // 1 ms … 10 s
  lfoRate: (x) => 0.05 * Math.pow(600, x), // 0.05 … 30 Hz
  glide: (x) => (x < 0.01 ? 0 : 0.003 * Math.pow(700, x)), // 0 … 2.1 s
  detune: (x) => (x - 0.5) * 200, // cents
  lfoPitch: (x) => 12 * x * x, // semitones
  lfoFilter: (x) => 2 * x * x, // volts into CV2
  track: (x) => 1.2 * x, // volts per octave into CV2
  ripple: (x) => 0.1 * x * x, // volts on the +12 V rail
  hiss: (x) => 4 * x, // multiple of the datasheet-like hiss
  oct: (v) => Number(v) || 0,
  pw: (x) => 0.05 + 0.45 * x,
  songTempo: (x) => Math.pow(2, 2 * (Number(x) - 0.5)), // ×0.5 … ×2, centre ×1
};

/* Exponential-converter sensitivity of the module: one octave per Vt·ln2/R8 of input current. */
export function voltsPerOctave(R, tempC = 25) { return (KQ * (tempC + 273.15) * Math.LN2 / R.R8) * R.R3; }

const WAVE = { tri: 0, saw: 1, square: 2, pulse: 3 };
const LFOW = { tri: 0, square: 1, saw: 2, sh: 3 };
const CTL = 4; // control rate = fs / 4

class Vco {
  constructor(ph) { this.ph = ph; this.dt = 0; this.lp = 0; this.hp = 0; this.hx = 0; this.drift = 0; this.pitch = 0; this.target = 0; }
  tick(wave, pw, curve, lpA, hpA) {
    let ph = this.ph + this.dt;
    if (ph >= 1) ph -= 1;
    this.ph = ph;
    const dt = this.dt;
    let v;
    if (wave === 0) v = 1 - 4 * Math.abs(ph - 0.5);
    else if (wave === 1) v = 2 * (ph + curve * ph * (1 - ph)) - 1 - blep(ph, dt);
    else {
      v = ph < pw ? 1 : -1;
      v += blep(ph, dt);
      let t2 = ph - pw; if (t2 < 0) t2 += 1;
      v -= blep(t2, dt);
    }
    this.lp += lpA * (v - this.lp); // finite rise time
    this.hp = hpA * (this.hp + this.lp - this.hx); this.hx = this.lp; // output coupling
    return this.hp;
  }
}

class Envelope {
  constructor() { this.v = 0; this.stage = 0; }
  on(retrigger) { if (retrigger || this.stage === 0) this.stage = 1; }
  off() { this.stage = 0; }
  tick(ca, cd, cr, s) {
    if (this.stage === 1) { this.v += (1.3 - this.v) * ca; if (this.v >= 1) { this.v = 1; this.stage = 2; } }
    else if (this.stage === 2) this.v += (s - this.v) * cd;
    else this.v -= this.v * cr;
    return this.v;
  }
}

export class PolivoksSynth {
  constructor(fs, os = 4, params = {}) {
    this.fs = fs;
    this.p = { ...DEFAULTS, ...params };
    this.os = os === 2 ? 2 : 4;
    this.fsOS = fs * this.os;
    this.noise = new Noise(91);
    // At power-on both timing capacitors start discharged, so the two ramps start in step. (Started half a period
    // apart, two unison saws cancel every odd harmonic and a held note sounds an octave up until they drift.)
    this.vco = [new Vco(0.13), new Vco(0.13)];
    this.eg = [new Envelope(), new Envelope()];
    this.notes = [];
    this.lfo = { ph: 0, v: 0, sh: 0, out: 0 };
    this.pots = POTS.map((k, i) => this.potTarget(i));
    this.openT = [0, 0, 0, 0, 0];
    this.t = 0; this.wander = 0; this.tempC = 25; this.vplus = 12;
    this.ctlCount = 0;
    this.dcx = 0; this.dcy = 0; this.nlp = 0;
    this.peakBP = 0; this.peakLP = 0; this.clip = false;
    this.seq = null; this.songHeld = new Set(); this.songEnded = null;
    this.buildUnit();
    this.filter = new PolivoksFilter(this.fsOS, this.unit);
    this.buildRate();
    this.coef();
  }

  potTarget(i) { return Number(this.p[['flt.frq', 'flt.cv1', 'flt.lvl', 'flt.res', 'flt.mix'][i]]); }
  buildUnit() { this.unit = makeUnit(Number(this.p['imp.seed']) || 1, this.p['imp.grade']); this.ideal = this.unit.grade === 'ideal'; }

  buildRate() {
    // 192k → 96k needs little; 96k → 48k carries the steep transition (pass 21 kHz, stop 26.6 kHz).
    this.decA = [new Decimator2(11, 7.5), new Decimator2(11, 7.5)];
    this.decB = [new Decimator2(47, 8), new Decimator2(47, 8)];
    this.upA = new Interpolator2(11, 7.5); this.upB = new Interpolator2(47, 8);
    this.sb = new Float64Array(4); this.pb = new Float64Array(4); this.up = new Float64Array(4);
    const fo = this.fsOS;
    this.vcoLP = 1 - Math.exp((-TAU * 40000) / fo);
    this.vcoHP = Math.exp((-TAU * 3) / fo);
    this.noiseLP = 1 - Math.exp((-TAU * 15000) / fo);
    this.dcA = Math.exp((-TAU * 8) / this.fs);
  }

  /* Coefficients that only change with parameters. */
  coef() {
    const p = this.p, fc = this.fs / CTL, fs = this.fs, e = this.unit.eg;
    const k = (tau) => 1 - Math.exp(-1 / Math.max(tau * fs, 1));
    this.egc = [1, 2].map((n, i) => ({
      a: k((MAP.time(p[`eg${n}.a`]) * e[i]) / 1.466), d: k((MAP.time(p[`eg${n}.d`]) * e[i]) / 4.6),
      r: k((MAP.time(p[`eg${n}.r`]) * e[i]) / 4.6), s: Number(p[`eg${n}.s`]),
    }));
    const gt = MAP.glide(p['glob.glide']);
    this.glideC = gt > 0 ? 1 - Math.exp(-1 / (gt * fc)) : 1;
    this.potC = 1 - Math.exp(-1 / (0.006 * fc));
    this.wave = [WAVE[p['vco1.wave']] ?? 1, WAVE[p['vco2.wave']] ?? 2];
    this.lfoW = LFOW[p['lfo.wave']] ?? 0;
    this.lfoInc = MAP.lfoRate(p['lfo.rate']) / fs;
  }

  message(m) {
    if (!m) return;
    if (m.t === 'p') this.set(m.k, m.v);
    else if (m.t === 'params') for (const k of Object.keys(m.v)) this.set(k, m.v[k]);
    else if (m.t === 'on') this.noteOn(m.n);
    else if (m.t === 'off') this.noteOff(m.n);
    else if (m.t === 'panic') { this.seq = null; this.songHeld.clear(); this.notes = []; this.eg[0].off(); this.eg[1].off(); }
    else if (m.t === 'power') { this.t = 0; this.wander = 0; this.filter.reset(); }
    else if (m.t === 'song') this.songStart(m);
    else if (m.t === 'songStop') this.songStop();
  }

  /* A song: events [beat, 1 on / 0 off, note] sorted by beat (offs first), a tempo map
   * [[beat, bpm], …] and a length in beats. It runs at the control rate, sample-exact
   * within 4 samples, and shares the voice with the keyboard. */
  songStart(m) {
    this.songStop();
    const tempo = (m.tempo && m.tempo.length ? m.tempo : [[0, 120]]).slice().sort((a, b) => a[0] - b[0]);
    this.seq = { id: m.id, ev: m.events, i: 0, beat: 0, len: m.length, tempo, ti: 0 };
  }
  songStop() {
    for (const n of this.songHeld) this.noteOff(n);
    this.songHeld.clear();
    if (this.seq) this.songEnded = this.seq.id;
    this.seq = null;
  }
  songTick(dtc) {
    const s = this.seq;
    while (s.ti + 1 < s.tempo.length && s.tempo[s.ti + 1][0] <= s.beat) s.ti++;
    s.beat += (dtc * s.tempo[s.ti][1] * MAP.songTempo(this.p['song.tempo'])) / 60;
    while (s.i < s.ev.length && s.ev[s.i][0] <= s.beat) {
      const [, on, n] = s.ev[s.i++];
      if (on) { this.songHeld.add(n); this.noteOn(n); } else if (this.songHeld.delete(n)) this.noteOff(n);
    }
    if (s.i >= s.ev.length && s.beat >= s.len) this.songStop();
  }

  set(k, v) {
    if (!(k in DEFAULTS)) return;
    const old = this.p[k];
    this.p[k] = v;
    if (k in POT_PARAM) this.crackle(POT_PARAM[k], Math.abs(Number(v) - Number(old)));
    if (k === 'imp.grade' || k === 'imp.seed') { this.buildUnit(); this.filter.setUnit(this.unit); }
    this.coef();
  }

  /* A worn track: a turning wiper may lift off for a moment. */
  crackle(i, delta) {
    if (this.ideal) return;
    const wear = Number(this.p['imp.wear']);
    if (wear <= 0) return;
    if (this.noise.u() * 0.5 + 0.5 < wear * Math.min(1, delta * 25)) {
      const ms = 0.2 + 2.8 * (this.noise.u() * 0.5 + 0.5);
      this.openT[i] = Math.ceil((ms * 1e-3 * this.fs) / CTL);
    }
  }

  noteOn(n) { const wasHeld = this.notes.length > 0; this.notes = this.notes.filter((x) => x !== n); this.notes.push(n); this.assign(true, wasHeld); }
  noteOff(n) { this.notes = this.notes.filter((x) => x !== n); this.assign(false, true); }
  assign(isNew, wasHeld) {
    if (!this.notes.length) { this.eg[0].off(); this.eg[1].off(); return; }
    let a, b;
    if (this.p['glob.mode'] === 'duo') { a = Math.min(...this.notes); b = Math.max(...this.notes); }
    else a = b = this.notes[this.notes.length - 1];
    this.vco[0].target = (a - 48) / 12; this.vco[1].target = (b - 48) / 12; // octaves from C3
    if (!wasHeld && this.glideC === 1) { this.vco[0].pitch = this.vco[0].target; this.vco[1].pitch = this.vco[1].target; }
    if (isNew && (!wasHeld || this.p['glob.legato'] !== 'on')) { this.eg[0].on(true); this.eg[1].on(true); }
  }

  /* Control-rate work: temperature, supply, pots, pitches, and the filter's control path. */
  ctl() {
    const p = this.p, u = this.unit, dtc = CTL / this.fs;
    this.t += dtc;
    if (this.seq) this.songTick(dtc);
    if (this.ideal) { this.tempC = 25; this.vplus = 12; }
    else {
      this.wander += -this.wander * (dtc / 30) + 0.05 * Math.sqrt((2 * dtc) / 30) * this.noise.g();
      const rise = p['imp.warmup'] === 'on' ? u.warmRise * (1 - Math.exp(-this.t / u.warmTau)) : 0;
      this.tempC = Number(p['imp.ambient']) + rise + this.wander;
      // Rectifier ripple at twice the mains frequency rides on the +12 V rail.
      const fr = 2 * Number(p['imp.mains']) * this.t, ph = fr - Math.floor(fr);
      const rip = ph < 0.15 ? -1 + ph / 0.075 : 1 - (2 * (ph - 0.15)) / 0.85;
      this.vplus = u.vreg + MAP.ripple(p['imp.ripple']) * rip;
    }
    let open = 0;
    for (let i = 0; i < 5; i++) {
      this.pots[i] += (this.potTarget(i) - this.pots[i]) * this.potC;
      if (this.openT[i] > 0) { this.openT[i]--; open |= 1 << i; }
    }
    // Pitches (octaves from C3), with glide, LFO vibrato, and each VCO's own errors.
    const lfo = this.lfo.out, vib = (MAP.lfoPitch(p['lfo.pitch']) / 12) * lfo;
    for (let i = 0; i < 2; i++) {
      const v = this.vco[i], vu = u.vco[i];
      v.pitch += (v.target - v.pitch) * this.glideC;
      if (vu.drift) v.drift += -v.drift * (dtc / 6) + vu.drift * Math.sqrt((2 * dtc) / 6) * this.noise.g();
      const det = i === 1 ? MAP.detune(p['vco2.detune']) : 0;
      const oct = v.pitch * (1 + vu.scale) + MAP.oct(p[`vco${i + 1}.oct`]) + vib + Number(p['kbd.bend']) / 12 + (det + vu.cents + vu.tempco * (this.tempC - 25) + v.drift) / 1200;
      let f = 130.8128 * Math.pow(2, oct);
      f = f / (1 + f * vu.reset); // finite reset time flattens the top
      v.dt = Math.min(f / this.fsOS, 0.45);
    }
    const track = MAP.track(p['glob.track']) * this.vco[0].pitch;
    this.filter.control({
      frq: this.pots[0], att: this.pots[1], lvl: this.pots[2], res: this.pots[3], mix: this.pots[4], open,
      cv1: 5 * this.eg[0].v, cv2: track + MAP.lfoFilter(p['lfo.filter']) * lfo,
      vplus: this.vplus, tempC: this.tempC, hiss: this.ideal ? 1 : u.hiss * MAP.hiss(p['imp.hiss']),
      steps: CTL * this.os,
    });
  }

  render(n, L, R, P, line) {
    const p = this.p, f = this.filter, os = this.os, u = this.unit;
    const [va1, vb1] = this.vco, w1 = this.wave[0], w2 = this.wave[1];
    const g1 = 5 * Number(p['mix.vco1']), g2 = 5 * Number(p['mix.vco2']), gn = 4 * Number(p['mix.noise']);
    const useLine = p['src'] === 'line' && line;
    const out = p['flt.out'], probe = p['probe'];
    const vol = Number(p['glob.volume']) ** 2, open = p['vca.mode'] === 'open';
    const e1 = this.egc[0], e2 = this.egc[1];
    const pwBase1 = MAP.pw(p['vco1.pw']), pwBase2 = MAP.pw(p['vco2.pw']), pwm = 0.45 * Number(p['lfo.pw']);
    const c1 = u.vco[0].curve, c2 = u.vco[1].curve;
    const lfoS = 1 - Math.exp((-TAU * 300) / this.fs);
    for (let i = 0; i < n; i++) {
      if (--this.ctlCount <= 0) { this.ctl(); this.ctlCount = CTL; }
      // LFO and envelopes at the audio rate.
      const L0 = this.lfo;
      L0.ph += this.lfoInc;
      if (L0.ph >= 1) { L0.ph -= 1; L0.sh = this.noise.u(); }
      const lv = this.lfoW === 0 ? 1 - 4 * Math.abs(L0.ph - 0.5) : this.lfoW === 1 ? (L0.ph < 0.5 ? 1 : -1) : this.lfoW === 2 ? 2 * L0.ph - 1 : L0.sh;
      L0.out += (lv - L0.out) * lfoS;
      this.eg[0].tick(e1.a, e1.d, e1.r, e1.s);
      const env = this.eg[1].tick(e2.a, e2.d, e2.r, e2.s);
      const pw1 = w1 === 2 ? 0.5 + u.vco[0].asym : Math.min(0.98, Math.max(0.02, pwBase1 + pwm * L0.out));
      const pw2 = w2 === 2 ? 0.5 + u.vco[1].asym : Math.min(0.98, Math.max(0.02, pwBase2 + pwm * L0.out));
      if (useLine) {
        const x = 5 * line[i];
        if (os === 4) { this.upB.run(x); const a = this.upB.a, b = this.upB.b; this.upA.run(a); this.up[0] = this.upA.a; this.up[1] = this.upA.b; this.upA.run(b); this.up[2] = this.upA.a; this.up[3] = this.upA.b; }
        else { this.upB.run(x); this.up[0] = this.upB.a; this.up[1] = this.upB.b; }
      }
      for (let k = 0; k < os; k++) {
        let va;
        if (useLine) va = this.up[k];
        else {
          const s1 = va1.tick(w1, pw1, c1, this.vcoLP, this.vcoHP);
          const s2 = vb1.tick(w2, pw2, c2, this.vcoLP, this.vcoHP);
          let nz = 0;
          if (gn > 0) { this.nlp += this.noiseLP * (this.noise.g() - this.nlp); nz = gn * this.nlp; }
          va = sat(g1 * s1 + g2 * s2 + nz, 10.5); // our mixer, an op-amp summer on ±12 V
        }
        f.tick(va);
        this.sb[k] = out === 'bp' ? f.bpo : out === 'mix' ? f.mixo : f.lpo;
        this.pb[k] = probe === 'bp' ? f.bpo : probe === 'mix' ? f.mixo : probe === 'in' ? va : f.lpo;
        const ab = f.bpo < 0 ? -f.bpo : f.bpo, al = f.lpo < 0 ? -f.lpo : f.lpo;
        if (ab > this.peakBP) this.peakBP = ab;
        if (al > this.peakLP) this.peakLP = al;
      }
      let s, pr;
      if (os === 4) {
        s = this.decB[0].run(this.decA[0].run(this.sb[0], this.sb[1]), this.decA[0].run(this.sb[2], this.sb[3]));
        pr = probe === 'out' ? 0 : this.decB[1].run(this.decA[1].run(this.pb[0], this.pb[1]), this.decA[1].run(this.pb[2], this.pb[3]));
      } else {
        s = this.decB[0].run(this.sb[0], this.sb[1]);
        pr = probe === 'out' ? 0 : this.decB[1].run(this.pb[0], this.pb[1]);
      }
      // VCA: EG2 or held open, with a little bleed and control feedthrough when not ideal.
      const g = open ? 1 : env;
      let y = s * g + u.vcaBleed * s + u.vcaFeed * 5 * env;
      this.dcy = this.dcA * (this.dcy + y - this.dcx); this.dcx = y; // output coupling
      y = sat(0.12 * this.dcy * vol, 1); // 1.0 full scale ≈ 8.3 V at full volume
      L[i] = y;
      if (R) R[i] = y;
      if (P) P[i] = probe === 'out' ? y : 0.1 * pr;
    }
    if (f.clipped) { this.clip = true; f.clipped = false; }
  }

  telemetry() {
    const f = this.filter;
    const msg = {
      t: 'tele', fc: f.w0 / TAU, q: f.q, i2: f.i2, i3: f.i3, vbe: f.vbe, temp: this.tempC, vplus: this.vplus,
      osc: f.knet <= 0, clip: this.clip, bp: this.peakBP, lp: this.peakLP, run: this.t,
      vpo: voltsPerOctave(this.unit.R, this.tempC), notes: this.notes.slice(),
      song: this.seq ? { id: this.seq.id, beat: this.seq.beat, len: this.seq.len } : null, ended: this.songEnded,
    };
    this.clip = false; this.peakBP = 0; this.peakLP = 0; this.songEnded = null;
    return msg;
  }
}

if (typeof registerProcessor === 'function') {
  class PolivoksProcessor extends Base {
    constructor(options) {
      super();
      const o = (options && options.processorOptions) || {};
      this.synth = new PolivoksSynth(sampleRate, o.os || 4, o.params || {});
      this.port.onmessage = (e) => this.synth.message(e.data);
      this.tele = 0;
    }
    process(inputs, outputs) {
      const o = outputs[0];
      if (!o || !o[0]) return true;
      const P = outputs[1] && outputs[1][0] ? outputs[1][0] : null;
      const line = inputs[0] && inputs[0][0] ? inputs[0][0] : null;
      this.synth.render(o[0].length, o[0], o[1] || null, P, line);
      this.tele += o[0].length;
      if (this.tele >= 2400) { this.tele = 0; this.port.postMessage(this.synth.telemetry()); }
      return true;
    }
  }
  registerProcessor('polivoks', PolivoksProcessor);
}
