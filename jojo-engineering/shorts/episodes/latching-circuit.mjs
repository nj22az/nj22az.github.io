// Short: the latching (hold-in) circuit.
import { COL, B, compileShort, heading, text, line, roundRect, prog, stamp } from '../engine.mjs';

// Control circuit: L at the top, N at the bottom, S0 (NC) → S1 (NO) with K1 in parallel → coil K1
const XL = B.x + 180, TOP = B.y + 150, BOT = B.y + 660;
function schema(ctx, t, { start = false, k1 = false, stop = false }) {
  const on = COL.orange, off = COL.ink, live = k1 || start;
  const c = (x) => (x ? on : off);
  text(ctx, 'L', XL - 60, TOP, { size: 40, weight: 700 }); text(ctx, 'N', XL - 60, BOT, { size: 40, weight: 700 });
  line(ctx, XL, TOP, XL, TOP + 70, c(live && !stop), 7);
  // S0 STOPP (NC)
  line(ctx, XL, TOP + 70, stop ? XL + 40 : XL + 8, TOP + 130, c(live && !stop), 7);
  text(ctx, 'S0 STOP (NC)', XL + 60, TOP + 100, { size: 34, weight: 700, color: COL.red });
  line(ctx, XL, TOP + 130, XL, TOP + 200, c(live && !stop), 7);
  // S1 START (NO) with auxiliary contact K1 in parallel
  const y1 = TOP + 200, y2 = TOP + 330, XR = XL + 360;
  line(ctx, XL, y1, XR, y1, c(live && !stop), 7);
  line(ctx, XL, y1, XL, y1 + 30, c(start && !stop), 7); line(ctx, XL, y2 - 30, XL, y2, c(start && !stop), 7);
  line(ctx, XL, y1 + 30, start ? XL : XL + 40, y2 - 30, c(start && !stop), 7);
  text(ctx, 'S1 START (NO)', XL + 60, y1 + 70, { size: 32, weight: 700, color: COL.green });
  line(ctx, XR, y1, XR, y1 + 30, c(k1 && !stop), 7); line(ctx, XR, y2 - 30, XR, y2, c(k1 && !stop), 7);
  line(ctx, XR, y1 + 30, k1 ? XR : XR + 40, y2 - 30, c(k1 && !stop), 7);
  text(ctx, 'K1', XR + 60, y1 + 70, { size: 36, weight: 700, color: COL.blue });
  line(ctx, XL, y2, XR, y2, c(live && !stop), 7); line(ctx, XL + 180, y2, XL + 180, y2 + 60, c(live && !stop), 7);
  // spolen K1
  roundRect(ctx, XL + 120, y2 + 60, 120, 90, 8, k1 ? '#ffe7cf' : '#fff', COL.ink, 6);
  text(ctx, 'K1', XL + 180, y2 + 105, { size: 40, weight: 700, align: 'center' });
  line(ctx, XL + 180, y2 + 150, XL + 180, BOT, c(live && !stop), 7);
  // motorn
  ctx.save(); ctx.beginPath(); ctx.arc(B.x + 800, B.y + 560, 80, 0, 2 * Math.PI); ctx.fillStyle = '#eef2f5'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = COL.ink; ctx.stroke(); ctx.restore();
  text(ctx, 'M', B.x + 800, B.y + 545, { size: 50, weight: 700, align: 'center' });
  ctx.save(); ctx.translate(B.x + 800, B.y + 560); ctx.rotate(k1 && !stop ? t * 8 : 0); ctx.fillStyle = COL.blue; ctx.fillRect(-6, 38, 12, 30); ctx.restore();
  text(ctx, k1 && !stop ? 'RUNS' : 'STOPPED', B.x + 800, B.y + 680, { size: 36, weight: 700, align: 'center', color: k1 && !stop ? COL.green : COL.muted });
}

export default compileShort({
  id: 'latching-circuit', cover: 1.5,
  kicker: 'MOTOR CONTROL',
  hook: 'You let go of START. Why does the motor keep running?',
  title: 'The latching circuit: why the motor keeps running',
  desc: 'S1 START (NO), S0 STOP (NC) and contactor K1 with an auxiliary contact across START. K1 holds itself in until STOP breaks the circuit.',
  tags: ['latching circuit', 'contactor', 'motor control', 'wiring diagram', 'electrician', 'marine'],
  beats: [
    {
      dur: 9, point: true,
      draw(ctx, t) { heading(ctx, 'Press START'); schema(ctx, t, { start: t > 1, k1: t > 1.6 }); },
      say: [[0.2, 4.4, 'I press START. Current reaches the coil and K1 pulls in.'],
        [4.6, 8.9, 'K1 also closes an auxiliary contact, across START.']],
    },
    {
      dur: 10,
      draw(ctx, t) { heading(ctx, 'Release START'); schema(ctx, t, { start: false, k1: true }); },
      say: [[0.2, 4.4, 'Now I let go of START.'],
        [4.6, 9.9, 'Current flows through the auxiliary contact. K1 holds itself in.']],
    },
    {
      dur: 11,
      draw(ctx, t) { heading(ctx, 'Press STOP'); schema(ctx, t, { k1: t < 1.2, stop: t > 0.8 && t < 5 }); },
      say: [[0.2, 5, 'STOP breaks the circuit. K1 drops out and the contact opens.'],
        [5.2, 10.9, 'The motor stays off until someone presses START again.']],
    },
    {
      dur: 7, point: true,
      draw(ctx, t) { stamp(ctx, 'K1 HOLDS', B.x + B.w / 2, B.y + B.h / 2, prog(t, 0.1, 0.6), COL.blue); },
      say: [[0.2, 6.9, 'START closes, STOP breaks, K1 holds itself.']],
    },
  ],
});
