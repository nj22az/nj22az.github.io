// Short: why a generator is rated in kVA – power factor.
import { COL, B, compileShort, heading, text, line, rows, prog, stamp } from '../engine.mjs';

/** Power triangle: P horizontal, Q vertical, S the hypotenuse. */
function triangle(ctx, t, a = 1) {
  const x0 = B.x + 130, y0 = B.y + 560, k = 1.1, P = 500 * k, Q = 375 * k;
  const p = prog(t, 0.3, 1), q = prog(t, a, a + 0.7), s = prog(t, a + 1.2, a + 1.9);
  line(ctx, x0, y0, x0 + P * p, y0, COL.blue, 10); text(ctx, 'P = 500 kW', x0 + P / 2, y0 + 50, { size: 44, weight: 700, color: COL.blue, align: 'center', alpha: p });
  if (q > 0) { line(ctx, x0 + P, y0, x0 + P, y0 - Q * q, COL.orange, 10); text(ctx, 'Q = 375 kvar', x0 + P + 20, y0 - Q / 2, { size: 40, weight: 700, color: COL.orange, alpha: q }); }
  if (s > 0) { line(ctx, x0, y0, x0 + P * s, y0 - Q * s, COL.red, 10); text(ctx, 'S = 625 kVA', x0 + 40, y0 - Q / 2 - 60, { size: 48, weight: 700, color: COL.red, alpha: s }); }
  text(ctx, 'φ', x0 + 110, y0 - 30, { size: 40, weight: 700, alpha: s });
}

export default compileShort({
  id: 'kva-vs-kw', cover: 1.5,
  kicker: 'POWER FACTOR',
  hook: 'The load is 500 kW. Why is the 625 kVA generator full?',
  title: 'Why generators are rated in kVA, not kW',
  desc: 'Current heats the windings whether it does useful work or not. At a power factor of 0.8, 500 kW needs a full 625 kVA.',
  tags: ['power factor', 'kVA vs kW', 'generator', 'apparent power', 'marine engineer', 'ETO'],
  beats: [
    {
      dur: 12,
      draw(ctx, t) { heading(ctx, 'The power triangle'); triangle(ctx, t, 3.4); },
      say: [[0.2, 3.2, 'The load does 500 kW of useful work: P.'],
        [3.4, 7, 'Motors also need reactive power, Q.'],
        [7.2, 11.9, 'Together they make apparent power S: 625 kVA.']],
    },
    {
      dur: 12, point: true,
      draw(ctx, t) {
        heading(ctx, 'Current still heats');
        rows(ctx, t, [[0.3, 'S = P / cos φ', COL.blue, 76], [3, '500 kW / 0.8', COL.ink, 60], [4.2, '= 625 kVA', COL.red, 80]], { y: B.y + 200, gap: 150 });
      },
      say: [[0.2, 5.8, 'Generator current follows S, not P. The power factor is 0.8.'],
        [6, 11.9, 'Current heats the windings. That is why generators are rated in kVA.']],
    },
    {
      dur: 11,
      draw(ctx, t) {
        heading(ctx, 'On board');
        rows(ctx, t, [[0.3, 'Watch both kW and kVA', COL.ink, 54], [3.4, 'Low power factor → more current', COL.orange, 54], [6.4, 'Start the next generator in time', COL.green, 54]], { y: B.y + 190, gap: 150 });
      },
      say: [[0.2, 6.2, 'In the control room: watch kW and kVA. A low power factor means more current.'],
        [6.4, 10.9, 'Then you may need the next generator sooner.']],
    },
    {
      dur: 5, point: true,
      draw(ctx, t) { stamp(ctx, 'S = P / cos φ', B.x + B.w / 2, B.y + B.h / 2, prog(t, 0.1, 0.6), COL.blue); },
      say: [[0.2, 4.9, 'kW does the work. kVA heats the generator.']],
    },
  ],
});
