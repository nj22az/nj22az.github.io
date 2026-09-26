// Short: test – measure – test, proving dead before touching.
import { COL, B, compileShort, heading, text, line, roundRect, prog, stamp } from '../engine.mjs';

/** Voltage tester against a source. shows: the tester indicates voltage. */
function tester(ctx, t, { label, shows, step, a = 1 }) {
  const x = B.x + 120, y = B.y + 170;
  roundRect(ctx, x, y, 200, 420, 26, COL.gold, COL.ink, 6);
  roundRect(ctx, x + 30, y + 40, 140, 110, 10, shows ? '#ffe0a3' : '#cfd8df', COL.ink, 4);
  text(ctx, shows ? '230 V' : '0 V', x + 100, y + 96, { size: 44, weight: 700, align: 'center', color: shows ? COL.red : COL.ink });
  for (let i = 0; i < 4; i++) roundRect(ctx, x + 60, y + 190 + i * 50, 80, 30, 8, shows && i < 3 ? COL.red : '#9aa7b2');
  line(ctx, x + 60, y + 420, x + 40, y + 520, COL.red, 7); line(ctx, x + 140, y + 420, x + 160, y + 520, '#141c26', 7);
  roundRect(ctx, B.x + 460, B.y + 200, 420, 300, 20, '#f3f6f9', COL.ink, 5);
  text(ctx, label, B.x + 670, B.y + 350, { size: 46, weight: 700, align: 'center', alpha: a });
  text(ctx, step, B.x + 670, B.y + 600, { size: 60, weight: 700, align: 'center', color: COL.blue, alpha: a });
}

export default compileShort({
  id: 'test-before-touch', cover: 1.5,
  kicker: 'ELECTRICAL SAFETY',
  hook: 'Your tester shows 0 V. Is it safe to touch?',
  title: '0 V on your tester doesn’t mean dead',
  desc: 'Test – measure – test. Prove your tester on a known source before and after, or you can’t tell whether 0 V means dead or a broken tester.',
  tags: ['electrical safety', 'live dead live', 'voltage tester', 'lockout tagout', 'electrician', 'marine'],
  beats: [
    {
      dur: 8,
      draw(ctx, t) { heading(ctx, 'The tester shows 0 V'); tester(ctx, t, { label: 'work point', shows: false, step: '?' }); },
      say: [[0.2, 7.9, '0 V can mean dead. Or a broken tester.']],
    },
    {
      dur: 8,
      draw(ctx, t) { heading(ctx, '1'); tester(ctx, t, { label: 'known source', shows: t > 0.8, step: 'TEST' }); },
      say: [[0.2, 7.9, 'Step 1: test the tester on a known source. It shows voltage.']],
    },
    {
      dur: 9, point: true,
      draw(ctx, t) { heading(ctx, '2'); tester(ctx, t, { label: 'work point', shows: false, step: 'MEASURE' }); },
      say: [[0.2, 8.9, 'Step 2: measure at the work point, between all conductors and to earth.']],
    },
    {
      dur: 9,
      draw(ctx, t) { heading(ctx, '3'); tester(ctx, t, { label: 'known source', shows: t > 0.8, step: 'TEST' }); },
      say: [[0.2, 8.9, 'Step 3: test again on the known source. The tester still works.']],
    },
    {
      dur: 7, point: true,
      draw(ctx, t) { stamp(ctx, 'TEST · MEASURE · TEST', B.x + B.w / 2, B.y + B.h / 2, prog(t, 0.1, 0.6), COL.green); },
      say: [[0.2, 6.9, 'Only then do you know that 0 V means dead.']],
    },
  ],
});
