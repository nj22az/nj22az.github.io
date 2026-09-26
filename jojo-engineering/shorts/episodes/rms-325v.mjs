// Short: why √2? Peak and RMS voltage.
import { COL, B, compileShort, rows, heading, plot, axes, line, text, prog, roundRect, stamp } from '../engine.mjs';

const P = { x0: B.x + 80, y0: B.y + 150, w: B.w - 150, h: 470 };

export default compileShort({
  id: 'rms-325v', cover: 1.5,
  kicker: 'AC VOLTAGE',
  hook: 'Your socket peaks at 325 V. Why does it say 230 V?',
  title: '230 V isn’t the peak – it’s 325 V #shorts',
  desc: 'Why a 230 V socket actually swings up to 325 V, and why 440 V on board peaks at 622 V. RMS value explained in 45 seconds.',
  tags: ['electrical', 'AC', 'RMS', 'marine electrician', 'ETO', 'electrician'],
  beats: [
    {
      dur: 8,
      draw(ctx, t) {
        heading(ctx, 'Voltage in the socket');
        axes(ctx, P);
        plot(ctx, (x) => 325 * Math.sin(x), { ...P, a: 0, b: 4 * Math.PI, ymax: 380, upto: prog(t, 0.2, 4), color: COL.blue, width: 8 });
        const a = prog(t, 4.2, 5);
        if (a > 0) {
          const y = P.y0 + P.h / 2 - (325 / 380) * (P.h / 2);
          line(ctx, P.x0, y, P.x0 + P.w, y, COL.red, 4, [14, 10]);
          text(ctx, 'V_{peak} = 325 V', P.x0 + P.w, y - 34, { size: 52, weight: 700, color: COL.red, align: 'right', alpha: a });
        }
      },
      say: [[0.2, 4.1, 'The voltage swings all the time.'],
        [4.2, 7.9, 'The peak is actually 325 V.']],
    },
    {
      dur: 11, point: true,
      draw(ctx, t) {
        heading(ctx, 'Heat follows u²');
        const Q = { ...P, y0: P.y0 + 20, h: 440 };
        line(ctx, Q.x0, Q.y0 + Q.h, Q.x0 + Q.w, Q.y0 + Q.h, '#9fb2c1', 3);
        plot(ctx, (x) => 2 * Math.sin(x) ** 2 - 1, { ...Q, a: 0, b: 4 * Math.PI, ymax: 1, upto: prog(t, 0.2, 3.5), color: COL.orange, width: 8 });
        const a = prog(t, 5.5, 6.3);
        if (a > 0) {
          const my = Q.y0 + Q.h / 2;
          line(ctx, Q.x0, my, Q.x0 + Q.w, my, COL.ink, 5, [16, 10]);
          roundRect(ctx, Q.x0 + Q.w - 330, my - 92, 330, 70, 12, 'rgba(255,255,255,.94)');
          text(ctx, 'mean = V_{peak}²/2', Q.x0 + Q.w - 12, my - 56, { size: 50, weight: 700, align: 'right', alpha: a });
        }
      },
      say: [[0.2, 5.3, 'A heater warms with u², and u² is never negative.'],
        [5.5, 10.9, 'Its average is exactly half the peak squared.']],
    },
    {
      dur: 12,
      draw(ctx, t) {
        heading(ctx, 'Same heat as DC');
        rows(ctx, t, [[0.3, 'V_{RMS}² = V_{peak}²/2'], [3.6, 'V_{RMS} = V_{peak}/√2', COL.blue], [6.6, '325 V / 1.414', COL.ink, 58], [8.2, '≈ 230 V', COL.green, 96]], { y: B.y + 190, gap: 140 });
      },
      say: [[0.2, 3.4, 'DC with the same heat is the RMS value.'],
        [3.6, 6.4, 'Square root of a half: divide by √2.'],
        [6.6, 11.9, '325 V divided by 1.414 is 230 V. The RMS value!']],
    },
    {
      dur: 13,
      draw(ctx, t) {
        heading(ctx, 'On board');
        rows(ctx, t, [[0.3, '440 V RMS', COL.ink, 56], [1.6, 'V_{peak} = 440 · 1.414', COL.ink, 56], [2.6, '≈ 622 V', COL.red, 96]], { y: B.y + 190, gap: 140 });
        text(ctx, 'Insulation must handle the peak', B.x + 60, B.y + 640, { size: 44, weight: 700, color: COL.orange, alpha: prog(t, 6.6, 7.2) });
      },
      say: [[0.2, 6.4, 'On board, 440 V peaks at 622 V.'],
        [6.6, 12.9, 'Insulation is stressed by the peak and by transients.']],
    },
    {
      dur: 5, point: true,
      draw(ctx, t) { stamp(ctx, 'V_{RMS} = V_{peak}/√2', B.x + B.w / 2, B.y + B.h / 2, prog(t, 0.1, 0.6), COL.blue); },
      say: [[0.2, 4.9, 'So next time you see 230 V, think 325.']],
    },
  ],
});
