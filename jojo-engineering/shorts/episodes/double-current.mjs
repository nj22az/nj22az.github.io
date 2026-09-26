// Short: double the current, four times the heat (P = I² · R).
import { COL, B, compileShort, heading, text, line, roundRect, prog, stamp, clamp } from '../engine.mjs';

/** Cable carrying current I; its colour gets hotter with the loss. */
function cable(ctx, t, I, y = B.y + 250) {
  const heat = clamp((I * I * 0.1) / 90);
  const c = `rgb(${Math.round(60 + 180 * heat)},${Math.round(80 - 30 * heat)},${Math.round(110 - 80 * heat)})`;
  roundRect(ctx, B.x + 60, y - 22, B.w - 120, 44, 22, c, COL.ink, 4);
  for (let k = 0; k < 6; k++) { const x = B.x + 80 + ((k * 150 + t * 40 * I / 10) % (B.w - 160)); text(ctx, '→', x, y - 60, { size: 40, color: COL.blue }); }
  text(ctx, `I = ${I} A`, B.x + 60, y + 70, { size: 48, weight: 700, color: COL.blue });
  text(ctx, 'R = 0.1 Ω', B.x + B.w - 60, y + 70, { size: 44, weight: 700, color: COL.muted, align: 'right' });
}
/** Bars: the loss at 10, 20 and 30 A */
function bars(ctx, t, upto) {
  const base = B.y + 660, x0 = B.x + 150, bw = 170;
  line(ctx, B.x + 80, base, B.x + B.w - 60, base, COL.ink, 4);
  [[10, 10], [20, 40], [30, 90]].forEach(([I, P], i) => {
    const a = prog(t, upto[i], upto[i] + 0.8); if (a <= 0) return;
    const h = (P / 90) * 300 * a, x = x0 + i * 250;
    roundRect(ctx, x, base - h, bw, h, 8, i === 2 ? COL.red : i === 1 ? COL.orange : COL.blue);
    text(ctx, `${P} W`, x + bw / 2, base - h - 34, { size: 46, weight: 700, align: 'center', alpha: a });
    text(ctx, `${I} A`, x + bw / 2, base + 36, { size: 40, weight: 700, align: 'center', color: COL.muted, alpha: a });
  });
}

export default compileShort({
  id: 'double-current', cover: 1.5,
  kicker: 'POWER AND HEAT',
  hook: 'Double the current. How much hotter does the cable get?',
  title: 'Double the current = four times the heat',
  desc: 'Cable loss is P = I² · R. That is why double the current means four times the heat, and why electricians hunt for hot terminals with a thermal camera.',
  tags: ['electrical', 'power loss', 'ohms law', 'thermal imaging', 'electrician', 'marine'],
  beats: [
    {
      dur: 9,
      draw(ctx, t) {
        heading(ctx, 'Every cable has some resistance');
        cable(ctx, t, 10);
        text(ctx, 'P = I² · R', B.x + 60, B.y + 480, { size: 72, weight: 700, alpha: prog(t, 3.8, 4.4) });
        text(ctx, '10² · 0.1 = 10 W', B.x + 60, B.y + 600, { size: 56, weight: 700, color: COL.blue, alpha: prog(t, 6, 6.6) });
      },
      say: [[0.2, 3.6, 'Every cable has a little resistance. Here 0.1 Ω.'],
        [3.8, 8.9, 'The loss is P = I² · R. 10 A gives 10 W of heat.']],
    },
    {
      dur: 11, point: (t) => t > 5,
      draw(ctx, t) {
        heading(ctx, 'Same cable, more current');
        cable(ctx, t, t < 5 ? 10 : 20, B.y + 200);
        bars(ctx, t, [0.3, 5, 99]);
        stamp(ctx, '×4', B.x + B.w - 170, B.y + 420, prog(t, 7, 7.5));
      },
      say: [[0.2, 4.8, 'If we double the current, is it twice as hot?'],
        [5, 10.9, 'No! 20 A gives 40 W. Four times as much.']],
    },
    {
      dur: 8,
      draw(ctx, t) {
        heading(ctx, 'Current squared');
        cable(ctx, t, 30, B.y + 200);
        bars(ctx, t, [-1, -1, 0.3]);
        stamp(ctx, '×9', B.x + B.w - 170, B.y + 420, prog(t, 3, 3.5));
      },
      say: [[0.2, 7.9, 'Three times the current: nine times the heat. 90 W.']],
    },
    {
      dur: 13,
      draw(ctx, t) {
        heading(ctx, 'On board: loose terminals');
        // terminal block with three terminals, the middle one glowing
        for (let i = 0; i < 3; i++) {
          const x = B.x + 150 + i * 250, hot = i === 1;
          roundRect(ctx, x, B.y + 200, 160, 220, 12, '#e8edf1', COL.ink, 4);
          roundRect(ctx, x + 50, B.y + 240, 60, 60, 30, hot ? `rgba(230,70,30,${0.4 + 0.3 * Math.sin(t * 6)})` : '#b9c5cd', COL.ink, 4);
          line(ctx, x + 80, B.y + 420, x + 80, B.y + 520, COL.ink, 10);
        }
        text(ctx, 'higher R → hot right here', B.x + B.w / 2, B.y + 580, { size: 44, weight: 700, color: COL.red, align: 'center', alpha: prog(t, 0.5, 1) });
        text(ctx, 'IR camera: under load, covers on', B.x + B.w / 2, B.y + 660, { size: 40, weight: 700, color: COL.muted, align: 'center', alpha: prog(t, 6.2, 6.8) });
      },
      say: [[0.2, 6, 'A loose terminal has more resistance. That is where it heats up.'],
        [6.2, 12.9, 'So we scan panels with a thermal camera, under load, covers on.']],
    },
    {
      dur: 5, point: true,
      draw(ctx, t) { stamp(ctx, 'P = I² · R', B.x + B.w / 2, B.y + B.h / 2, prog(t, 0.1, 0.6), COL.blue); },
      say: [[0.2, 4.9, 'Double the current? Four times the heat.']],
    },
  ],
});
