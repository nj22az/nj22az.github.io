// Trefaslabbet · avläsningar och förutsägelseuppgifter
import { neutralCurrent, starLoads, symmetricLoad, phaseFromLine, motorConnection, windingRatio } from './model.mjs';

export const PLATES = { ingen: null, '230/400': [230, 400], '400/690': [400, 690], '440/760': [440, 760] };

// Startvärden som inte sammanfaller med presentationernas övningar eller exempel
export const DEFAULTS = {
  visare: { UL: 400, f: 50, I1: 12, I2: 9, I3: 6, phi: 0 },
  neutral: { UL: 400, R1: 46, R2: 23, R3: 92, on1: true, on2: true, on3: true, neutral: true },
  ydelta: { UL: 440, Z: 22, pf: 0.85, conn: 'Δ', plate: '440/760' },
};

export function readouts(tab, s) {
  if (tab === 'visare') {
    const n = neutralCurrent([{ I: s.I1, phi: s.phi }, { I: s.I2, phi: s.phi }, { I: s.I3, phi: s.phi }]);
    return { UL: s.UL, UF: phaseFromLine(s.UL), dt: 1000 / s.f / 3, IN: n.IN, INangle: n.angle, phasors: n.phasors };
  }
  if (tab === 'neutral') {
    const R = [s.R1, s.R2, s.R3].map((r, k) => (s[`on${k + 1}`] === false ? Infinity : r));
    const r = starLoads({ UL: s.UL, R, neutral: s.neutral });
    return { UF: r.UF, U1: r.Uabs[0], U2: r.Uabs[1], U3: r.Uabs[2], I1: r.Iabs[0], I2: r.Iabs[1], I3: r.Iabs[2], IN: r.IN, shift: r.shift, P: r.P, raw: r };
  }
  const r = symmetricLoad({ UL: s.UL, Z: s.Z, pf: s.pf, conn: s.conn });
  if (!PLATES[s.plate]) return { ...r, PkW: r.P / 1000, right: null, ratio: null };
  const [Ulow, Uhigh] = PLATES[s.plate];
  const right = motorConnection({ Ulow, Uhigh, UL: s.UL });
  return { ...r, PkW: r.P / 1000, right, ratio: windingRatio({ Ulow, UL: s.UL, conn: s.conn }) };
}

// Uppgifterna genereras ur innehållsdatabasen (innehall/ovningar). Redigera aldrig uppgifter.gen.mjs.
import { UPPGIFTER } from './uppgifter.gen.mjs';
export const CHALLENGES = UPPGIFTER;

export function expected(c) {
  const v = readouts(c.tab, c.setup)[c.ask.key];
  return c.ask.absolute ? Math.abs(v) : v;
}
