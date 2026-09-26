// Short: Kirchhoff’s current and voltage laws.
import { COL, B, compileShort, heading, text, line, arrow, roundRect, rows, prog, stamp } from '../engine.mjs';

export default compileShort({
  id: 'kirchhoff', cover: 1.5,
  kicker: 'KIRCHHOFF’S LAWS',
  hook: '6.4 A in, 2.6 A out one branch. How much in the other?',
  title: 'Kirchhoff’s laws in under a minute',
  desc: 'Current law: what flows into a node flows out. Voltage law: around any loop the sum is zero.',
  tags: ['kirchhoff', 'circuit analysis', 'electrical engineering', 'KCL', 'KVL', 'electrician'],
  beats: [
    {
      dur: 12,
      draw(ctx, t) {
        heading(ctx, 'Current law');
        const nx = B.x + 420, ny = B.y + 380;
        arrow(ctx, B.x + 80, ny, nx - 20, ny, COL.blue, 10, 34);
        text(ctx, '6.4 A', B.x + 110, ny - 50, { size: 52, weight: 700, color: COL.blue });
        arrow(ctx, nx + 20, ny - 10, B.x + 820, B.y + 200, COL.orange, 10, 34);
        text(ctx, '2.6 A', B.x + 700, B.y + 170, { size: 52, weight: 700, color: COL.orange });
        arrow(ctx, nx + 20, ny + 10, B.x + 820, B.y + 560, COL.red, 10, 34);
        text(ctx, t > 6 ? '3.8 A' : '?', B.x + 720, B.y + 610, { size: 60, weight: 700, color: COL.red });
        ctx.save(); ctx.beginPath(); ctx.arc(nx, ny, 22, 0, 2 * Math.PI); ctx.fillStyle = COL.ink; ctx.fill(); ctx.restore();
        text(ctx, 'in = out', B.x + 80, B.y + 680, { size: 50, weight: 700, alpha: prog(t, 3.2, 3.8) });
      },
      say: [[0.2, 3, 'A node can’t store current.'],
        [3.2, 5.8, 'What goes in, comes out.'],
        [6, 11.9, '6.4 minus 2.6: 3.8 A in the other branch.']],
    },
    {
      dur: 13, point: true,
      draw(ctx, t) {
        heading(ctx, 'Voltage law');
        const x0 = B.x + 140, y0 = B.y + 170, w = 640, h = 440;
        ctx.save(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 7; ctx.strokeRect(x0, y0, w, h); ctx.restore();
        roundRect(ctx, x0 - 50, y0 + 150, 100, 140, 10, '#fff', COL.ink, 6); text(ctx, '48 V', x0, y0 + 220, { size: 38, weight: 700, align: 'center' });
        roundRect(ctx, x0 + 240, y0 - 40, 160, 80, 10, '#fff', COL.ink, 6); text(ctx, 'R1', x0 + 320, y0, { size: 38, weight: 700, align: 'center' });
        roundRect(ctx, x0 + w - 50, y0 + 150, 100, 140, 10, '#fff', COL.ink, 6); text(ctx, 'R2', x0 + w, y0 + 220, { size: 38, weight: 700, align: 'center' });
        text(ctx, '20 V', x0 + 320, y0 - 80, { size: 46, weight: 700, color: COL.orange, align: 'center', alpha: prog(t, 0.5, 1) });
        text(ctx, t > 7 ? '28 V' : '?', x0 + w - 90, y0 + 220, { size: 52, weight: 700, color: COL.red, align: 'right' });
        ctx.save(); ctx.globalAlpha = prog(t, 3.5, 4.2); ctx.strokeStyle = COL.blue; ctx.lineWidth = 5; ctx.setLineDash([12, 10]);
        ctx.beginPath(); ctx.arc(x0 + w / 2, y0 + h / 2, 110, -1.2, 4.6); ctx.stroke(); ctx.restore();
      },
      say: [[0.2, 3.3, 'The source gives 48 V. R1 drops 20 V.'],
        [3.5, 6.8, 'Around the loop, the sum is zero.'],
        [7, 12.9, '48 minus 20: 28 V across R2.']],
    },
    {
      dur: 11,
      draw(ctx, t) {
        heading(ctx, 'On board');
        rows(ctx, t, [[0.3, 'Branch currents must add up', COL.ink, 48], [3, 'Voltage drops must add up', COL.ink, 48], [6, 'They don’t add up?', COL.red, 56], [7, 'The fault is in there', COL.red, 56]], { y: B.y + 170, gap: 130 });
      },
      say: [[0.2, 5.8, 'When fault-finding, your readings must add up the same way.'],
        [6, 10.9, 'If they don’t, you’ve found where the fault is.']],
    },
    {
      dur: 5, point: true,
      draw(ctx, t) { stamp(ctx, 'in = out · ΣV = 0', B.x + B.w / 2, B.y + B.h / 2, prog(t, 0.1, 0.6), COL.blue); },
      say: [[0.2, 4.9, 'In equals out. Around the loop is zero.']],
    },
  ],
});
