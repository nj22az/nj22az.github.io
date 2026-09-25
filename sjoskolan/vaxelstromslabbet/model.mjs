// Växelströmslabbet · beräkningsmodell (ideala komponenter, stationär sinus)
const TAU = 2 * Math.PI;
const RAD = 180 / Math.PI;

export const SHAPES = {
  sinus: { label: 'Sinus', rmsFactor: 1 / Math.SQRT2 },
  fyrkant: { label: 'Symmetrisk fyrkant', rmsFactor: 1 },
  triangel: { label: 'Triangel', rmsFactor: 1 / Math.sqrt(3) },
};

/** Normaliserad kurvform, fas i radianer. Returnerar värde i [-1, 1]. */
export function shapeValue(shape, angle) {
  const a = ((angle % TAU) + TAU) % TAU;
  if (shape === 'fyrkant') return a < Math.PI ? 1 : -1;
  if (shape === 'triangel') {
    const x = a / TAU; // 0..1
    if (x < 0.25) return 4 * x;
    if (x < 0.75) return 2 - 4 * x;
    return 4 * x - 4;
  }
  return Math.sin(a);
}

/** Värden för en symmetrisk vågform utan DC-komponent. urms i V, f i Hz. */
export function waveform({ urms, f, shape = 'sinus' }) {
  const factor = SHAPES[shape]?.rmsFactor ?? SHAPES.sinus.rmsFactor;
  const peak = urms / factor;
  return { peak, pp: 2 * peak, rms: urms, mean: 0, T: 1 / f, f, omega: TAU * f, factor };
}

/** Momentanvärde vid tiden t (s). delay förskjuter kurvan åt höger (s). */
export function instant({ urms, f, shape = 'sinus' }, t, delay = 0) {
  const { peak } = waveform({ urms, f, shape });
  return peak * shapeValue(shape, TAU * f * (t - delay));
}

/** Fasvinkel i grader för en tidsförskjutning dt (s), ger värde i (-180, 180]. */
export function phaseFromDelay(dt, f) {
  let phi = 360 * dt * f;
  phi = ((phi % 360) + 360) % 360;
  if (phi > 180) phi -= 360;
  return phi;
}

export function reactances({ f, L = 0, C = 0 }) {
  const XL = L > 0 ? TAU * f * L : 0;
  const XC = C > 0 ? 1 / (TAU * f * C) : 0;
  return { XL, XC };
}

export function resonance(L, C) {
  return L > 0 && C > 0 ? 1 / (TAU * Math.sqrt(L * C)) : null;
}

/**
 * Seriekrets med ideal källa U (RMS). kind: 'R', 'RL', 'RC' eller 'RLC'.
 * Strömmen är referens (0°). Positiv fasvinkel: spänningen leder strömmen (induktivt).
 */
export function seriesCircuit({ kind = 'RL', U, f, R, L, C }) {
  const useL = kind.includes('L');
  const useC = kind.includes('C');
  const { XL, XC } = reactances({ f, L: useL ? L : 0, C: useC ? C : 0 });
  const X = XL - XC;
  const Z = Math.hypot(R, X);
  const I = Z > 0 ? U / Z : Infinity;
  const phi = Math.atan2(X, R) * RAD;
  const P = I * I * R;
  const Q = I * I * X;
  const S = U * I;
  return {
    XL, XC, X, Z, I, phi,
    UR: I * R, UL: I * XL, UC: I * XC,
    P, Q, S, PF: S > 0 ? P / S : 1,
    f0: useL && useC ? resonance(L, C) : null,
    character: Math.abs(X) < 1e-9 ? 'resistiv' : X > 0 ? 'induktiv' : 'kapacitiv',
  };
}

/**
 * Enfaslast med aktiv effekt P (W), effektfaktor pf och karaktär.
 * Qc (var) är kapacitiv kompensering. Rcable är slingresistansen i matningen (Ω).
 */
export function loadPower({ U, P, pf, character = 'induktiv', Qc = 0, Rcable = 0 }) {
  const phi = Math.acos(Math.min(1, Math.max(0, pf)));
  const sign = character === 'kapacitiv' ? -1 : 1;
  const Q = sign * P * Math.tan(phi);
  const S = P / pf;
  const I = S / U;
  const Q2 = Q - Qc;
  const S2 = Math.hypot(P, Q2);
  const I2 = S2 / U;
  return {
    phi: sign * phi * RAD, Q, S, I, loss: I * I * Rcable,
    after: {
      Q: Q2, S: S2, I: I2, PF: S2 > 0 ? P / S2 : 1,
      phi: Math.atan2(Q2, P) * RAD, loss: I2 * I2 * Rcable,
    },
    QcFull: Q,
  };
}

/** Momentan effekt för sinus: u = û sin(ωt), i = î sin(ωt − φ). */
export function instantPower({ U, I, f, phiDeg }, t) {
  const w = TAU * f;
  const phi = phiDeg / RAD;
  const u = U * Math.SQRT2 * Math.sin(w * t);
  const i = I * Math.SQRT2 * Math.sin(w * t - phi);
  return { u, i, p: u * i };
}

/** Svensk formatering med rimligt antal värdesiffror. */
export function fmt(value, digits = 3) {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  if (!Number.isFinite(value)) return '∞';
  const abs = Math.abs(value);
  let decimals;
  if (abs === 0) decimals = 0;
  else decimals = Math.max(0, Math.min(4, digits - 1 - Math.floor(Math.log10(abs))));
  const v = Number(value.toFixed(decimals));
  return v.toLocaleString('sv-SE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Tolka elevens svar: tillåt komma, mellanslag och minustecken. */
export function parseAnswer(text) {
  if (typeof text !== 'string') return NaN;
  const cleaned = text.trim().replace(/\s| | /g, '').replace(/[−–]/g, '-').replace(',', '.');
  if (!/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(cleaned)) return NaN;
  return Number(cleaned);
}

export function isClose(answer, expected, { rel = 0.02, abs = 0 } = {}) {
  if (!Number.isFinite(answer)) return false;
  return Math.abs(answer - expected) <= Math.max(abs, Math.abs(expected) * rel);
}
