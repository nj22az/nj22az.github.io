// Film: Radianer och grader. Varför räknaren ska stå i RAD för u(t) = û · sin(2π · f · t) (v40_01)
import { COL, BOARD as B, stage, titleCard, text, line, arrow, plot, axes, prog, compile, roundRect } from '../engine.mjs';

const heading = (ctx, s) => text(ctx, s, B.x + 34, B.y + 46, { size: 32, weight: 700 });
const nf = (v, d = 2) => v.toFixed(d).replace('.', ',');

/** Hjul med radien r i punkten (cx, cy). Bågen från 0 till vinkeln a (radianer) ritas orange. */
function hjul(ctx, cx, cy, r, a, { etiketter = true } = {}) {
  ctx.save(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
  if (a > 0) { ctx.save(); ctx.strokeStyle = COL.orange; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, -a, true); ctx.stroke(); ctx.restore(); }
  line(ctx, cx, cy, cx + r, cy, COL.blue, 3);
  line(ctx, cx, cy, cx + r * Math.cos(a), cy - r * Math.sin(a), COL.blue, 3);
  ctx.save(); ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
  if (etiketter) {
    text(ctx, '0°', cx + r + 14, cy, { size: 22, color: COL.muted, weight: 400 });
    text(ctx, '90°', cx, cy - r - 20, { size: 22, color: COL.muted, weight: 400, align: 'center' });
    text(ctx, '180°', cx - r - 14, cy, { size: 22, color: COL.muted, weight: 400, align: 'right' });
    text(ctx, '270°', cx, cy + r + 22, { size: 22, color: COL.muted, weight: 400, align: 'center' });
  }
}

/** Räknarens fönster med läge och resultat */
function raknare(ctx, x, y, lage, uttryck, svar, ratt, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  roundRect(ctx, x, y, 360, 170, 18, '#2b3a47');
  roundRect(ctx, x + 18, y + 18, 324, 110, 10, '#dfe8d8');
  text(ctx, lage, x + 32, y + 40, { size: 20, color: '#2b3a47', weight: 700 });
  text(ctx, uttryck, x + 32, y + 72, { size: 26, color: '#2b3a47', weight: 400 });
  text(ctx, svar, x + 326, y + 106, { size: 34, color: '#2b3a47', weight: 700, align: 'right' });
  text(ctx, ratt ? 'Rätt' : 'Fel läge', x + 180, y + 150, { size: 24, weight: 700, color: ratt ? '#8fe0b0' : '#ff9a9a', align: 'center' });
  ctx.restore();
}

export default compile({
  id: 'radianer', title: 'Radianer och grader', sub: 'Varför räknaren ska stå i RAD för växelström', week: 'Vecka 40', deck: 'v40_01 Sinusformad växelspänning',
  scenes: [
    {
      dur: 8,
      draw(ctx, t) { titleCard(ctx, t, 'Radianer och grader', 'Varför räknaren ska stå i RAD', 'Vecka 40'); },
      say: [[0.8, 7.8, 'Måns', 'Formeln är rätt, men räknaren ger fel svar. Hur kan det bli så?']],
    },
    {
      dur: 16,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'En vinkel kan mätas på två sätt');
        const a = 2 * Math.PI * prog(t, 1, 6);
        hjul(ctx, B.x + 250, B.y + 290, 150, a);
        text(ctx, `${Math.round(a * 180 / Math.PI)}°`, B.x + 250, B.y + 290 + 40, { size: 34, weight: 700, color: COL.orange, align: 'center', alpha: prog(t, 1, 1.5) });
        text(ctx, 'Grader: ett varv = 360°', B.x + 470, B.y + 200, { size: 34, weight: 700, alpha: prog(t, 6, 7) });
        text(ctx, 'Radianer: ett varv = 2π', B.x + 470, B.y + 280, { size: 34, weight: 700, color: COL.blue, alpha: prog(t, 10, 11) });
        text(ctx, 'som meter och fot för en längd', B.x + 470, B.y + 340, { size: 26, color: COL.muted, weight: 400, alpha: prog(t, 12, 13) });
      },
      say: [[0.6, 7.8, 'Sigge', 'En vinkel kan mätas i grader. Ett helt varv är 360°.'],
        [8.0, 15.8, 'Sigge', 'Den kan också mätas i radianer, som längd i meter eller fot.']],
    },
    {
      dur: 24,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Radianer: sträckan som kanten rullar');
        // hjulet rullar längs en linje; sträckan = vinkeln i radianer (r = 1)
        const r = 60, s = 70, y0 = B.y + 330, x0 = B.x + 80; // 1 radie = 70 px på linjen
        const a = 2 * Math.PI * prog(t, 1, 12);
        line(ctx, x0, y0 + r, x0 + 2 * Math.PI * s + 40, y0 + r, '#9fb2c1', 3);
        ctx.save(); ctx.strokeStyle = COL.orange; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0 + r); ctx.lineTo(x0 + a * s, y0 + r); ctx.stroke(); ctx.restore();
        for (let k = 1; k <= 6; k++) if (a >= k) { line(ctx, x0 + k * s, y0 + r - 8, x0 + k * s, y0 + r + 8, COL.ink, 2); text(ctx, String(k), x0 + k * s, y0 + r + 30, { size: 22, align: 'center', weight: 400 }); }
        const cx = x0 + a * s;
        ctx.save(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, y0, r, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
        line(ctx, cx, y0, cx + r * Math.sin(-a), y0 + r * Math.cos(-a), COL.blue, 3);
        text(ctx, 'r = 1', x0 - 10, y0 - r - 20, { size: 24, color: COL.blue, weight: 700, alpha: prog(t, 0.5, 1.5) });
        text(ctx, `rullat: ${nf(a, 2)}`, B.x + 560, B.y + 130, { size: 34, weight: 700, color: COL.orange });
        text(ctx, 'Ett varv = 2π ≈ 6,28', B.x + 560, B.y + 190, { size: 34, weight: 700, alpha: prog(t, 12, 13) });
        text(ctx, '1 radian ≈ 57°', B.x + 560, B.y + 250, { size: 34, weight: 700, color: COL.blue, alpha: prog(t, 17, 18) });
      },
      say: [[0.6, 6.3, 'Sigge', 'Rulla ett hjul med radien 1. Titta på sträckan kanten rullar.'],
        [6.5, 12.3, 'Sigge', 'Den sträckan är vinkeln i radianer.'],
        [12.5, 17.3, 'Sigge', 'Ett helt varv blir 2π, ungefär 6,28.'],
        [17.5, 23.8, 'Måns', 'Då är 1 radian ungefär 57°!']],
    },
    {
      dur: 14,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Samma vinklar i grader och radianer');
        const rader = [['ett varv', '360°', '2π ≈ 6,28'], ['ett halvt varv', '180°', 'π ≈ 3,14'], ['ett kvarts varv', '90°', 'π/2 ≈ 1,57']];
        text(ctx, 'Grader', B.x + 420, B.y + 120, { size: 28, color: COL.muted, align: 'center' });
        text(ctx, 'Radianer', B.x + 660, B.y + 120, { size: 28, color: COL.muted, align: 'center' });
        rader.forEach(([n, g, r], i) => {
          const al = prog(t, 0.6 + i * 1.8, 1.4 + i * 1.8), y = B.y + 190 + i * 90;
          text(ctx, n, B.x + 70, y, { size: 32, alpha: al });
          text(ctx, g, B.x + 420, y, { size: 38, weight: 700, align: 'center', alpha: al });
          text(ctx, r, B.x + 660, y, { size: 38, weight: 700, color: COL.blue, align: 'center', alpha: al });
        });
      },
      say: [[0.6, 7.3, 'Sigge', 'Ett halvt varv är 180° eller π. Ett kvarts varv är 90° eller π/2.'],
        [7.5, 13.8, 'Måns', 'Samma vinkel, bara olika tal.']],
    },
    {
      dur: 24,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Generatorn vrids 2π · f · t');
        const f = 60, T = 1000 / f, ms = 2 * T * prog(t, 1, 14), a = 2 * Math.PI * f * ms / 1000;
        hjul(ctx, B.x + 170, B.y + 280, 110, a % (2 * Math.PI), { etiketter: false });
        const P = { x0: B.x + 340, y0: B.y + 170, w: 480, h: 220 };
        axes(ctx, P);
        plot(ctx, (x) => Math.sin(2 * Math.PI * f * x / 1000), { ...P, a: 0, b: 2 * T, ymax: 1.2, upto: ms / (2 * T), color: COL.blue });
        text(ctx, 'u(t) = û · sin(2π · f · t)', B.x + 340, B.y + 120, { size: 30, weight: 700 });
        text(ctx, `vinkel: ${nf(a, 2)} rad`, B.x + 90, B.y + 440, { size: 28, weight: 700, color: COL.orange });
        text(ctx, '60 Hz, t = 2,0 ms:  2π · 60 · 0,002 ≈ 0,754 rad', B.x + 340, B.y + 440, { size: 26, weight: 700, alpha: prog(t, 16, 17) });
      },
      say: [[0.6, 7.3, 'Sigge', 'Generatorn vrids ett varv per period. Ett varv är 2π radianer.'],
        [7.5, 15.3, 'Sigge', 'Efter tiden t har den vridits 2π · f · t. Vinkeln blir i radianer.'],
        [15.5, 23.8, 'Måns', 'Då ska räknaren stå i RAD när jag räknar u(t)!']],
    },
    {
      dur: 20,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Fel läge ger fel svar utan varning');
        raknare(ctx, B.x + 50, B.y + 130, 'DEG', 'sin(π/2)', '0,027', false, prog(t, 0.6, 1.4));
        raknare(ctx, B.x + 460, B.y + 130, 'RAD', 'sin(π/2)', '1', true, prog(t, 8, 8.8));
        text(ctx, 'I DEG läses π/2 ≈ 1,57 som 1,57 grader.', B.x + 50, B.y + 360, { size: 28, weight: 700, color: COL.red, alpha: prog(t, 3, 4) });
        text(ctx, 'Snabbkoll: sin(90) = 1 betyder DEG.', B.x + 50, B.y + 430, { size: 28, weight: 700, alpha: prog(t, 13, 14) });
      },
      say: [[0.6, 7.8, 'Sigge', 'I DEG läses π/2 som 1,57 grader. Svaret blir nästan noll.'],
        [8.0, 12.8, 'Sigge', 'I RAD blir sin(π/2) exakt 1.'],
        [13.0, 19.8, 'Måns', 'Och sin(90) = 1 betyder att räknaren står i DEG.']],
    },
    {
      dur: 22, cast: (t) => ({ wave: t > 18 }),
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Kom ihåg');
        const items = [['Ett varv = 360° = 2π rad. 1 rad ≈ 57°.', COL.ink], ['π eller 2π · f · t i vinkeln: RAD', COL.blue], ['Fasvinkel i grader, arctan(X/R): DEG', COL.orange], ['Snabbkoll: sin(90) = 1 betyder DEG', COL.ink]];
        const at = [0.6, 4.5, 9.5, 14];
        items.forEach(([s, c], i) => text(ctx, `${i + 1}.  ${s}`, B.x + 50, B.y + 140 + i * 80, { size: 33, weight: 700, color: c, alpha: prog(t, at[i], at[i] + 0.7) }));
      },
      say: [[0.6, 9.3, 'Sigge', 'π eller 2π · f · t i vinkeln betyder RAD på räknaren.'],
        [9.5, 13.8, 'Sigge', 'Fasvinklar i grader räknas i DEG.'],
        [14.0, 17.8, 'Måns', 'Och jag testar med sin(90)!'],
        [18.0, 21.8, 'Sigge', 'Vi ses i nästa film!']],
    },
  ],
});
