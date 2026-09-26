// Short: first and second earth fault in a ship’s IT system.
import { COL, B, compileShort, heading, text, line, roundRect, prog, stamp, bolt } from '../engine.mjs';

const LY = [B.y + 150, B.y + 200, B.y + 250], PC = [COL.blue, COL.orange, COL.green], HULL = B.y + 600;
const C1 = B.x + 360, C2 = B.x + 680;
function net(ctx, t, { f1 = 0, f2 = 0, trip = 0 } = {}) {
  roundRect(ctx, B.x + 40, LY[0] - 40, 130, 150, 12, '#eef2f5', COL.ink, 4);
  text(ctx, 'G', B.x + 105, LY[0] + 10, { size: 48, weight: 700, align: 'center' });
  text(ctx, '440 V', B.x + 105, LY[0] + 70, { size: 28, weight: 700, align: 'center', color: COL.muted });
  ['L1', 'L2', 'L3'].forEach((n, k) => { line(ctx, B.x + 170, LY[k], B.x + B.w - 90, LY[k], PC[k], 7); text(ctx, n, B.x + B.w - 80, LY[k], { size: 30, weight: 700, color: PC[k] }); });
  ctx.fillStyle = '#8c99a6'; ctx.fillRect(B.x + 20, HULL, B.w - 40, 60);
  text(ctx, 'hull', B.x + B.w - 50, HULL + 30, { size: 30, weight: 700, color: '#fff', align: 'right' });
  // isolationsvakt
  const larm = f1 > 0.5;
  line(ctx, B.x + 105, LY[0] + 110, B.x + 105, B.y + 390, COL.muted, 4);
  roundRect(ctx, B.x + 30, B.y + 390, 150, 100, 10, larm ? '#fde2e2' : '#e6f3ec', larm ? COL.red : COL.green, 4);
  text(ctx, 'insulation', B.x + 105, B.y + 415, { size: 22, weight: 700, align: 'center' });
  text(ctx, 'monitor', B.x + 105, B.y + 440, { size: 22, weight: 700, align: 'center' });
  text(ctx, larm ? 'ALARM' : 'OK', B.x + 105, B.y + 470, { size: 30, weight: 700, align: 'center', color: larm ? COL.red : COL.green });
  line(ctx, B.x + 105, B.y + 490, B.x + 105, HULL, COL.muted, 4);
  [[C1, 0, f1, 'fan'], [C2, 1, f2, 'pump']].forEach(([x, ph, f, name], k) => {
    const off = k === 1 && trip > 0.5;
    line(ctx, x, LY[ph], x, B.y + 400, off ? '#b9c5cd' : PC[ph], 6);
    roundRect(ctx, x - 80, B.y + 400, 160, 110, 10, '#f3f6f9', COL.ink, 4);
    text(ctx, name, x, B.y + 470, { size: 30, weight: 700, align: 'center', color: COL.muted });
    line(ctx, x + 50, B.y + 510, x + 50, HULL, COL.green, 5);
    bolt(ctx, x + 60, B.y + 440, 1.2, f);
    if (off) text(ctx, 'tripped!', x, B.y + 360, { size: 36, weight: 700, align: 'center', color: COL.red });
  });
}

export default compileShort({
  id: 'insulation-alarm', cover: 1.5,
  kicker: 'IT SYSTEM ON BOARD',
  hook: 'The insulation alarm is on but everything works. Ignore it?',
  title: 'Insulation alarm on a ship: why you can’t wait',
  desc: 'Most ships run 440 V as an IT (isolated) system. The first earth fault only raises an alarm, but a second one on another phase is a short circuit.',
  tags: ['IT system', 'earth fault', 'insulation monitor', 'ship electrical', 'ETO', 'marine engineer'],
  beats: [
    {
      dur: 9,
      draw(ctx, t) { heading(ctx, 'No phase is connected to the hull'); net(ctx, t); },
      say: [[0.2, 4.4, 'On most ships, the 440 V network is an IT system.'],
        [4.6, 8.9, 'No phase is connected to the hull.']],
    },
    {
      dur: 13,
      draw(ctx, t) { heading(ctx, 'First earth fault'); net(ctx, t, { f1: prog(t, 0.4, 0.8) }); },
      say: [[0.2, 5.8, 'The fan gets an earth fault on L1. Nothing trips. Just an alarm.'],
        [6, 12.9, 'But now L2 and L3 sit at 440 V to the hull.']],
    },
    {
      dur: 12, point: true,
      draw(ctx, t) {
        heading(ctx, 'Second earth fault');
        net(ctx, t, { f1: 1, f2: prog(t, 0.4, 0.8), trip: prog(t, 5.8, 6) });
        stamp(ctx, 'SHORT CIRCUIT', B.x + B.w / 2, B.y + 320, prog(t, 1.5, 2), COL.red);
      },
      say: [[0.2, 5.6, 'A second earth fault, on another phase, is a short circuit.'],
        [5.8, 11.9, 'A breaker trips. Maybe on the steering gear.']],
    },
    {
      dur: 6, point: true,
      draw(ctx, t) { stamp(ctx, 'ALARM = FIND IT', B.x + B.w / 2, B.y + B.h / 2, prog(t, 0.1, 0.6), COL.orange); },
      say: [[0.2, 5.9, 'So no. The alarm means: find the fault. Now.']],
    },
  ],
});
