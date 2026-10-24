// Design checks for the IEC 90L-4, 1.5 kW pump motor. Pure functions, no DOM.
// The audit tab in the page and calc.test.mjs both read these numbers, so the
// report never quotes a value that the code has not worked out.

export const RATING = Object.freeze({
  P: 1500,        // W, S1
  U_star: 400,    // V line, Y
  U_delta: 230,   // V line, Δ
  f: 50,          // Hz
  poles: 4,
  n: 1440,        // min⁻¹ at full load
  eta: 0.835,
  pf: 0.79,
});

// Stator and rotor as specified (mm).
export const CORE = Object.freeze({
  slots: 36, rotorSlots: 28, OD: 150, bore: 90, stack: 110, airgap: 0.35,
  coilPitchSlots: 7, // coil 1 → 8
  turnsPerCoilSpec: 38, layers: 2, strands: 2, wire: 0.71, wireGrade2OD: 0.772,
  BgTarget: 0.75,
});

// IEC 60072-1 / EN 50347 values used by the model and the checks.
export const IEC = Object.freeze({
  H: 90, A: 140, B: 125, C: 56, K: 10,           // feet, 90L
  D: 24, E: 50, F: 8, GD: 7, GA: 27, DS: 'M8',    // shaft
  P: 200, N: 130, M: 165, S: 12, T: 3.5, LA: 12,  // FF165
});

const TAU = 2 * Math.PI;

export const lineCurrent = (P, U, eta, pf) => P / (Math.sqrt(3) * U * eta * pf);
export const torque = (P, n) => P / (TAU * n / 60);
export const syncSpeed = (f, poles) => 120 * f / poles;
export const slip = (ns, n) => (ns - n) / ns;

export function slotsPerPolePerPhase(S, poles, m = 3) {
  return S / (poles * m);
}

// Winding factors for harmonic ν: distribution kd, pitch kp, total kw.
export function windingFactors(S, poles, pitchSlots, nu = 1, m = 3) {
  const q = S / (poles * m);
  const alpha = Math.PI * poles / S;            // slot angle, electrical rad
  const polePitch = S / poles;
  const kd = Math.sin(nu * q * alpha / 2) / (q * Math.sin(nu * alpha / 2));
  const kp = Math.sin(nu * (pitchSlots / polePitch) * Math.PI / 2);
  return { kd, kp, kw: kd * kp };
}

// Flux per pole for a sinusoidal air-gap density.
export function fluxPerPole(Bg, boreMm, stackMm, poles) {
  const tau = Math.PI * boreMm / 1000 / poles;
  return (2 / Math.PI) * Bg * tau * (stackMm / 1000);
}

// Series turns per phase needed for back-EMF E (V, phase) at flux Φ.
export const seriesTurns = (E, f, kw, phi) => E / (4.44 * f * kw * phi);

export function windingCheck(core = CORE, rating = RATING) {
  const { kw } = windingFactors(core.slots, rating.poles, core.coilPitchSlots);
  const Uph = rating.U_star / Math.sqrt(3);
  const E = 0.93 * Uph; // back-EMF ≈ 93 % of terminal voltage at this size
  const phi = fluxPerPole(core.BgTarget, core.bore, core.stack, rating.poles);
  const Nph = seriesTurns(E, rating.f, kw, phi);
  const coilsPerPhase = core.slots * core.layers / 2 / 3; // double layer: one coil per slot
  const turnsPerCoil = Nph / coilsPerPhase;
  const NphSpec = coilsPerPhase * core.turnsPerCoilSpec;
  const BgWithSpec = core.BgTarget * Nph / NphSpec;
  return { kw, Uph, E, phi, Nph, coilsPerPhase, turnsPerCoil, NphSpec, BgWithSpec };
}

// Slot of the modelled punching (see motor.js stator()): semi-closed, round bottom.
export const SLOT = Object.freeze({ rOpen: 45, rNeck: 46.8, rBottomCentre: 59.5, halfOpen: 1.3, halfNeck: 2.2, halfTop: 3.6, liner: 0.25 });

export function slotArea(s = SLOT) {
  const h = s.rBottomCentre - s.rNeck;
  const trap = h * (s.halfNeck + s.halfTop);
  const round = Math.PI * s.halfTop ** 2 / 2;
  return trap + round;
}

// Copper and wire-envelope fill for a given number of conductors per slot.
export function slotFill(conductorsPerSlot, strands, bareDia, insDia, gross = slotArea()) {
  const wires = conductorsPerSlot * strands;
  const copper = wires * Math.PI * bareDia ** 2 / 4;
  const envelope = wires * Math.PI * insDia ** 2 / 4;
  return { wires, copper, envelope, gross, copperFill: copper / gross, envelopeFill: envelope / gross };
}

// IEC 60034-1 cl. 9.2: 1000 V + 2·U_N, at least 1500 V.
export const hipot = Un => Math.max(1500, 1000 + 2 * Un);

// ISO 286 IT14 for 30 < size ≤ 50 mm is 0.62 mm, so JS14 is ±0.31.
export const IT14_30_50 = 0.62;

// IEC 60072-1: shaft radial runout, D > 18 … 30 mm (normal / reduced class).
export const RUNOUT_18_30 = { normal: 0.040, reduced: 0.021 };

// IEC 60034-30-1, 4-pole 50 Hz, 1.5 kW.
export const IE_LIMITS_1500_4P = { IE2: 81.3, IE3: 82.8, IE4: 85.3 };

// IEC 60034-14, 56 ≤ H ≤ 132, rms vibration velocity (mm/s).
export const VIB_GRADES = { A: 1.6, B: 0.7 };

// Esson output coefficient C = S / (D² L n_s), kVA·s/m³ → kJ/m³.
export function essonC(rating = RATING, core = CORE) {
  const S = rating.P / (rating.eta * rating.pf);
  const ns = syncSpeed(rating.f, rating.poles) / 60;
  return S / ((core.bore / 1000) ** 2 * (core.stack / 1000) * ns) / 1000;
}

// Radial clearance change of an aluminium frame on a steel core when both heat up.
// Positive = interference lost (mm).
export function shrinkLoss(dia, frameRiseK, coreRiseK, aAl = 23e-6, aFe = 12e-6) {
  return dia * (aAl * frameRiseK - aFe * coreRiseK);
}

// Peak flux densities in the modelled yoke and narrowest tooth (T), stacking factor 0.95.
export function ironCheck(core = CORE, s = SLOT, poles = RATING.poles) {
  const phi = fluxPerPole(core.BgTarget, core.bore, core.stack, poles);
  const yoke = core.OD / 2 - (s.rBottomCentre + s.halfTop);
  const Byoke = phi / 2 / (yoke / 1000 * core.stack / 1000 * 0.95);
  const r = s.rNeck + 3; // a little above the neck, where the tooth is narrowest
  const halfSlot = s.halfNeck + (s.halfTop - s.halfNeck) * (r - s.rNeck) / (s.rBottomCentre - s.rNeck);
  const tooth = TAU * r / core.slots - 2 * halfSlot;
  const Btooth = core.BgTarget * (Math.PI * core.bore / core.slots) / (tooth * 0.95);
  return { yoke, Byoke, tooth, Btooth };
}

// Phase resistance of the corrected winding (25 turns/coil, 12 coils in series, Ø1.00 mm) at temperature T (°C).
// Mean turn: two slot sides of the 110 mm stack plus two end turns spanning 7 of 36 slots at r ≈ 54 mm.
export function phaseResistance(T = 20, core = CORE) {
  const chord = 2 * 54 * Math.sin(Math.PI * core.coilPitchSlots / core.slots);
  const meanTurn = 2 * (core.stack + 10) + 2 * 1.35 * chord;     // mm
  const turns = 25 * 12, area = Math.PI * 1.0 ** 2 / 4;           // mm²
  const R20 = 0.0172 * turns * meanTurn / 1000 / area;            // Ω, copper 0.0172 Ω·mm²/m
  return R20 * (235 + T) / (235 + 20);
}

export function summary() {
  const ns = syncSpeed(RATING.f, RATING.poles);
  return {
    Istar: lineCurrent(RATING.P, RATING.U_star, RATING.eta, RATING.pf),
    Idelta: lineCurrent(RATING.P, RATING.U_delta, RATING.eta, RATING.pf),
    T: torque(RATING.P, RATING.n),
    ns, s: slip(ns, RATING.n),
    q: slotsPerPolePerPhase(CORE.slots, RATING.poles),
    w1: windingFactors(CORE.slots, RATING.poles, CORE.coilPitchSlots, 1),
    w5: windingFactors(CORE.slots, RATING.poles, CORE.coilPitchSlots, 5),
    w7: windingFactors(CORE.slots, RATING.poles, CORE.coilPitchSlots, 7),
    winding: windingCheck(),
    fillSpec: slotFill(2 * CORE.turnsPerCoilSpec, CORE.strands, CORE.wire, CORE.wireGrade2OD),
    fillFix: slotFill(2 * 25, 1, 1.0, 1.07),
    hipot: hipot(RATING.U_star),
    esson: essonC(),
    flangeBelowFeet: IEC.P / 2 - IEC.H,
    shrinkLoss: shrinkLoss(CORE.OD, 60, 80),
    iron: ironCheck(),
    R20: phaseResistance(20),
    J: lineCurrent(RATING.P, RATING.U_star, RATING.eta, RATING.pf) / (CORE.strands * Math.PI * CORE.wire ** 2 / 4),
  };
}
