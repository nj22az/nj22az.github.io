// Short: a test lead left in the A jack while measuring voltage.
import { COL, B, compileShort, heading, text, line, roundRect, prog, stamp, bolt } from '../engine.mjs';

/** Multimeter with three jacks. sel: which jack the red lead is in. */
function meter(ctx, t, { sel = 'V', display = '230.4 V', flash = 0 } = {}) {
  const x = B.x + 80, y = B.y + 120;
  roundRect(ctx, x, y, 360, 560, 30, COL.gold, COL.ink, 6);
  roundRect(ctx, x + 40, y + 40, 280, 130, 12, '#a8e6c0', COL.ink, 5);
  text(ctx, display, x + 300, y + 106, { size: 58, weight: 700, align: 'right', color: flash > 0 ? COL.red : COL.ink });
  ctx.save(); ctx.beginPath(); ctx.arc(x + 180, y + 290, 70, 0, 2 * Math.PI); ctx.fillStyle = '#3a4652'; ctx.fill(); ctx.restore();
  const J = { A: [x + 70, y + 480], COM: [x + 180, y + 480], V: [x + 290, y + 480] };
  Object.entries(J).forEach(([n, [jx, jy]]) => {
    ctx.save(); ctx.beginPath(); ctx.arc(jx, jy, 30, 0, 2 * Math.PI); ctx.fillStyle = n === sel ? COL.red : n === 'COM' ? '#141c26' : '#5b6770'; ctx.fill(); ctx.restore();
    text(ctx, n, jx, jy - 54, { size: 30, weight: 700, align: 'center' });
  });
  // sladdar till uttaget
  const [rx, ry] = J[sel], [cx, cy] = J.COM, sx = B.x + 700;
  line(ctx, rx, ry, sx - 30, B.y + 380, COL.red, 8); line(ctx, cx, cy, sx + 30, B.y + 380, '#141c26', 8);
  roundRect(ctx, sx - 110, B.y + 240, 220, 220, 30, '#f3f6f9', COL.ink, 5);
  text(ctx, '230 V', sx, B.y + 290, { size: 40, weight: 700, align: 'center' });
  bolt(ctx, sx, B.y + 380, 2.2, flash);
  return J;
}

export default compileShort({
  id: 'amp-jack', cover: 1.5,
  kicker: 'THE MULTIMETER',
  hook: 'Your lead is in the A jack. You measure 230 V. What happens?',
  title: 'Never measure voltage with your lead in the A jack',
  desc: 'The A input has almost no resistance. Across a voltage source it becomes a short circuit through your meter. Check the jacks before every measurement.',
  tags: ['multimeter', 'electrical safety', 'electrician tips', 'arc flash', 'CAT rating', 'marine'],
  beats: [
    {
      dur: 9,
      draw(ctx, t) { heading(ctx, 'Right: red lead in V'); meter(ctx, t, { display: '230.4 V' }); },
      say: [[0.2, 4.2, 'For voltage: red lead in V, black in COM.'],
        [4.4, 8.9, 'The V input has high resistance. Almost no current flows.']],
    },
    {
      dur: 14, point: true,
      draw(ctx, t) {
        heading(ctx, 'Wrong: red lead left in A');
        const f = t > 5.2 ? 0.6 + 0.4 * Math.sin(t * 30) : 0;
        meter(ctx, t, { sel: 'A', display: t > 5.2 ? '- - -' : '0.00 A', flash: f });
        text(ctx, 'A jack ≈ 0.01 Ω', B.x + 480, B.y + 580, { size: 44, weight: 700, color: COL.red, alpha: prog(t, 0.4, 1) });
        text(ctx, 'I = V / R', B.x + 480, B.y + 660, { size: 48, weight: 700, alpha: prog(t, 5.2, 5.8) });
      },
      say: [[0.2, 5, 'The A jack is a shunt with almost no resistance.'],
        [5.2, 13.9, 'Across 230 V that is a short circuit through the meter. It can cause an arc flash.']],
    },
    {
      dur: 14,
      draw(ctx, t) {
        heading(ctx, 'Before every measurement');
        const items = ['Check function and jacks', 'A jack: only in series', 'Connect with power off', 'Correct CAT rating'];
        items.forEach((s, i) => text(ctx, `${i + 1}.  ${s}`, B.x + 60, B.y + 180 + i * 120, { size: 52, weight: 700, color: i === 1 ? COL.red : COL.ink, alpha: prog(t, 0.3 + i * 1.6, 0.9 + i * 1.6) }));
      },
      say: [[0.2, 6.6, 'Check function and jacks before every measurement.'],
        [6.8, 13.9, 'Current only in series, connected with power off, with the right CAT rating.']],
    },
    {
      dur: 5, point: true,
      draw(ctx, t) { stamp(ctx, 'CHECK THE JACKS', B.x + B.w / 2, B.y + B.h / 2, prog(t, 0.1, 0.6), COL.red); },
      say: [[0.2, 4.9, 'A two-second check. Every time.']],
    },
  ],
});
