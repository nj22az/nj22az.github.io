// Växelströmslabbet · avläsningar och förutsägelseuppgifter
import { waveform, instant, phaseFromDelay, seriesCircuit, loadPower, meterReadings } from './model.mjs';

export const DEFAULTS = {
  // Samma grundexempel som genomgångar och guidad labb.
  sinus: { shape: 'sinus', urms: 12, f: 50, t: 5, showB: false, dt: 3, window: 'auto' },
  impedans: { kind: 'RL', U: 12, f: 50, R: 40, L: 95.5, C: 150 },
  effekt: { U: 230, f: 50, P: 1150, pf: 1, character: 'induktiv', Qc: 0, Rcable: 0.2 },
};

/** Alla avläsningar för en flik. Tider i ms, L i mH, C i µF i tillståndet. */
export function readouts(tab, s) {
  if (tab === 'sinus') {
    const w = waveform({ urms: s.urms, f: s.f, shape: s.shape });
    const t = s.t / 1000;
    return {
      peak: w.peak, pp: w.pp, rms: w.rms, mean: 0, T: w.T * 1000, f: s.f,
      trms: meterReadings(s).trueRms, avg: meterReadings(s).avgResp,
      ut: instant(s, t),
      phi: s.showB ? phaseFromDelay(s.dt / 1000, s.f) : null,
    };
  }
  if (tab === 'impedans') {
    return seriesCircuit({ kind: s.kind, U: s.U, f: s.f, R: s.R, L: s.L / 1000, C: s.C / 1e6 });
  }
  const r = loadPower(s);
  return {
    S: r.S, Q: r.Q, I: r.I, phi: r.phi, loss: r.loss,
    Q2: r.after.Q, S2: r.after.S, I2: r.after.I, PF2: r.after.PF, loss2: r.after.loss,
    character2: r.after.character, QcFull: r.QcFull,
  };
}

// Talen skiljer sig från presentationernas övningar, så att inlämningsuppgifterna förblir elevens egna.
// Uppgifterna genereras ur innehållsdatabasen (innehall/ovningar). Redigera aldrig uppgifter.gen.mjs.
import { UPPGIFTER } from './uppgifter.gen.mjs';
export const CHALLENGES = UPPGIFTER;

export function expected(challenge) {
  const v = readouts(challenge.tab, challenge.setup)[challenge.ask.key];
  return challenge.ask.absolute ? Math.abs(v) : v;
}

