// Short: the same coil at 50 and 60 Hz – inductive reactance.
import { COL, B, compileShort, heading, text, line, roundRect, rows, prog, stamp } from '../engine.mjs';

function bars(ctx, t, show) {
  const base = B.y + 620;
  line(ctx, B.x + 80, base, B.x + B.w - 80, base, COL.ink, 4);
  [['50 Hz', 1, COL.blue], ['60 Hz', 1.2, COL.orange]].forEach(([n, k, c], i) => {
    const a = prog(t, show[i], show[i] + 0.8); if (a <= 0) return;
    const h = 300 * k * a, x = B.x + 220 + i * 340;
    roundRect(ctx, x, base - h, 180, h, 10, c);
    text(ctx, n, x + 90, base + 40, { size: 44, weight: 700, align: 'center' });
    text(ctx, i ? '1.2 · X_{L}' : 'X_{L}', x + 90, base - h - 36, { size: 46, weight: 700, align: 'center', alpha: a });
  });
}

export default compileShort({
  id: 'fifty-sixty-hz', cover: 1.5,
  kicker: 'THE INDUCTOR',
  hook: 'Same coil. 60 Hz instead of 50. What happens?',
  title: '50 or 60 Hz? Why the coil cares',
  desc: 'Inductive reactance X_L = 2π · f · L grows with frequency. The same coil has 20 % more X_L at 60 Hz than at 50 Hz. Check the rating plate.',
  tags: ['inductive reactance', 'inductor', 'AC circuits', '60 Hz', 'marine electrical', 'electrician'],
  beats: [
    {
      dur: 10,
      draw(ctx, t) {
        heading(ctx, 'A coil opposes AC');
        rows(ctx, t, [[0.3, 'X_{L} = 2π · f · L', COL.blue, 76]], { y: B.y + 200 });
        text(ctx, 'higher f → higher X_{L}', B.x + 60, B.y + 380, { size: 52, weight: 700, alpha: prog(t, 4.6, 5.2) });
      },
      say: [[0.2, 4.4, 'A coil opposes AC with its reactance, X_{L}.'],
        [4.6, 9.9, 'X_{L} grows with the frequency f.']],
    },
    {
      dur: 12, point: true,
      draw(ctx, t) { heading(ctx, 'Same coil'); bars(ctx, t, [0.3, 3.5]); },
      say: [[0.2, 3.3, 'At 50 Hz the coil has a certain X_{L}.'],
        [3.5, 7.4, 'At 60 Hz it is 20 % larger.'],
        [7.6, 11.9, 'The same voltage then drives about 17 % less current.']],
    },
    {
      dur: 12,
      draw(ctx, t) {
        heading(ctx, 'On board');
        rows(ctx, t, [[0.3, 'Shore: often 50 Hz', COL.ink, 56], [1.5, 'Ship: often 60 Hz', COL.ink, 56], [6.2, 'Check the rating plate', COL.red, 60]], { y: B.y + 190, gap: 140 });
      },
      say: [[0.2, 6, 'Shore power is often 50 Hz. Ships often run 60 Hz.'],
        [6.2, 11.9, 'Coils, motors and transformers are built for one frequency. Check the plate.']],
    },
    {
      dur: 5, point: true,
      draw(ctx, t) { stamp(ctx, 'X_{L} = 2π · f · L', B.x + B.w / 2, B.y + B.h / 2, prog(t, 0.1, 0.6), COL.blue); },
      say: [[0.2, 4.9, 'Frequency matters. Every time.']],
    },
  ],
});
