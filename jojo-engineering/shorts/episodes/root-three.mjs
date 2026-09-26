// Short: why 440 V and not 254 V? √3 in three-phase.
import { COL, B, compileShort, heading, text, line, arrow, rows, prog, stamp } from '../engine.mjs';

const N = [B.x + B.w / 2, B.y + 390], R = 230;
const PH = [[-90, 'L1', COL.blue], [30, 'L2', COL.orange], [150, 'L3', COL.green]];
const tip = (deg) => [N[0] + R * Math.cos((deg * Math.PI) / 180), N[1] + R * Math.sin((deg * Math.PI) / 180)];
function phasors(ctx, a = 1) {
  PH.forEach(([deg, n, c], i) => {
    const k = Math.min(1, Math.max(0, a * 3 - i)); if (k <= 0) return;
    const [x, y] = tip(deg); arrow(ctx, N[0], N[1], N[0] + (x - N[0]) * k, N[1] + (y - N[1]) * k, c, 9, 30);
    const [lx, ly] = [N[0] + (R + 50) * Math.cos((deg * Math.PI) / 180), N[1] + (R + 50) * Math.sin((deg * Math.PI) / 180)];
    text(ctx, n, lx, ly, { size: 44, weight: 700, color: c, align: 'center', alpha: k });
  });
  text(ctx, 'N', N[0] - 60, N[1] + 40, { size: 40, weight: 700, color: COL.muted });
}

export default compileShort({
  id: 'root-three', cover: 1.5,
  kicker: 'THREE-PHASE',
  hook: 'Each phase is 254 V. Why do you measure 440 V?',
  title: 'Why 440 V and not 254 V? The square root of 3',
  desc: 'Three phase voltages, 120° apart. Between two phases the voltage is √3 times larger: 254 V × 1.732 ≈ 440 V.',
  tags: ['three phase', 'electrical', 'line voltage', 'phase voltage', 'marine electrician', 'ship'],
  beats: [
    {
      dur: 10,
      draw(ctx, t) {
        heading(ctx, 'Three windings, 120° apart');
        phasors(ctx, prog(t, 0.2, 3.5));
        text(ctx, 'V_{ph} = 254 V', B.x + 60, B.y + 680, { size: 52, weight: 700, color: COL.blue, alpha: prog(t, 5, 5.6) });
      },
      say: [[0.2, 4.8, 'The generator has three windings, 120° apart.'],
        [5, 9.9, 'Each phase voltage, V_{ph}, is 254 V.']],
    },
    {
      dur: 13, point: true,
      draw(ctx, t) {
        heading(ctx, 'Between two phases');
        phasors(ctx, 1);
        const [x1, y1] = tip(-90), [x2, y2] = tip(30);
        const a = prog(t, 0.3, 1.2);
        line(ctx, x1, y1, x1 + (x2 - x1) * a, y1 + (y2 - y1) * a, COL.red, 7);
        text(ctx, 'V_{L} = ?', (x1 + x2) / 2 + 40, (y1 + y2) / 2 - 30, { size: 52, weight: 700, color: COL.red, alpha: prog(t, 1, 1.6) });
        const b = prog(t, 6.5, 7.3);
        if (b > 0) {
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          line(ctx, N[0], N[1], mx, my, COL.muted, 4, [10, 8]);
          text(ctx, '30°', x1 + 18, y1 + 90, { size: 40, weight: 700, color: COL.ink, alpha: b });
          text(ctx, 'half V_{L} = V_{ph} · cos 30°', B.x + 60, B.y + 690, { size: 44, weight: 700, alpha: b });
        }
      },
      say: [[0.2, 6.3, 'Between two phases you measure the distance between the arrow tips.'],
        [6.5, 12.9, 'Half of it is V_{ph} · cos 30°, which is V_{ph} · √3/2.']],
    },
    {
      dur: 12,
      draw(ctx, t) {
        heading(ctx, 'The whole distance');
        rows(ctx, t, [[0.3, 'V_{L} = 2 · V_{ph} · √3/2', COL.ink, 58], [3.3, 'V_{L} = √3 · V_{ph}', COL.blue, 72], [6.6, '254 V · 1.732', COL.ink, 58], [8, '≈ 440 V', COL.green, 96]], { y: B.y + 180, gap: 140 });
      },
      say: [[0.2, 3.1, 'Two halves: the twos cancel out.'],
        [3.3, 6.4, 'V_{L} = √3 · V_{ph}.'],
        [6.6, 11.9, '254 V times 1.732 is 440 V.']],
    },
    {
      dur: 6, point: true,
      draw(ctx, t) { stamp(ctx, '√3 ≈ 1.732', B.x + B.w / 2, B.y + B.h / 2, prog(t, 0.1, 0.6), COL.blue); },
      say: [[0.2, 5.9, 'That is why 440 V, and why √3 is in every three-phase formula.']],
    },
  ],
});
