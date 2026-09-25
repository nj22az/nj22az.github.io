// Film: Varför √3? Fasspänning och linjespänning i trefas (v41_01)
import { COL, BOARD as B, stage, titleCard, text, line, arrow, plot, axes, prog, compile } from '../engine.mjs';

const PH = [COL.blue, COL.orange, COL.green];
const heading = (ctx, s) => text(ctx, s, B.x + 34, B.y + 46, { size: 32, weight: 700 });
// Visardiagrammets origo och skala: L1 uppåt (90°), L2 vid 330°, L3 vid 210° (positiv fasföljd)
const O = [B.x + 300, B.y + 300]; const R = 190; const ANG = [90, 330, 210];
const tip = (k, r = R) => [O[0] + r * Math.cos(ANG[k] * Math.PI / 180), O[1] - r * Math.sin(ANG[k] * Math.PI / 180)];

function star(ctx, t, { grow = 1, labels = true } = {}) {
  for (let k = 0; k < 3; k++) {
    const g = prog(t, k * 0.5, k * 0.5 + 1) * grow; if (g <= 0) continue;
    const p = tip(k, R * g); arrow(ctx, O[0], O[1], p[0], p[1], PH[k], 6, 22);
    if (labels) { const q = tip(k, R + 30); text(ctx, `L${k + 1}`, q[0], q[1], { size: 30, weight: 700, color: PH[k], align: 'center', alpha: g }); }
  }
  text(ctx, 'N', O[0] - 34, O[1] + 18, { size: 26, color: COL.muted });
}

export default compile({
  id: 'varfor-rot-3', title: 'Varför √3?', sub: 'Fasspänning och linjespänning i trefas', week: 'Vecka 41', deck: 'v41_01 Trefassystemets grunder',
  scenes: [
    {
      dur: 6, cast: (t) => ({ wave: t < 3 }),
      draw(ctx, t) { titleCard(ctx, t, 'Varför √3?', 'Fasspänning och linjespänning', 'Vecka 41'); },
      say: [[0.5, 5.8, 'Sigge', 'Ombord mäter vi 440 V mellan två faser. Varför är det √3 gånger fasspänningen?']],
    },
    {
      dur: 11,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Tre spänningar, förskjutna 120°');
        const P = { x0: B.x + 60, y0: B.y + 90, w: B.w - 110, h: 380 };
        axes(ctx, P);
        for (let k = 0; k < 3; k++) plot(ctx, (x) => Math.sin(x - k * 2 * Math.PI / 3), { ...P, a: 0, b: 4 * Math.PI, ymax: 1.2, upto: prog(t, 0.4 + k * 1.2, 4 + k * 1.2), color: PH[k], width: 5 });
        [['L1', 0], ['L2', 1], ['L3', 2]].forEach(([s, k]) => text(ctx, s, P.x0 + P.w - 120 + k * 44, P.y0 + 10, { size: 28, weight: 700, color: PH[k], alpha: prog(t, 0.4 + k * 1.2, 1.4 + k * 1.2) }));
      },
      say: [[0.3, 5.6, 'Sigge', 'Generatorn har tre lindningar. De ger tre spänningar som ligger 120° isär i tiden.'],
        [5.8, 10.8, 'Måns', 'Tre vågor samtidigt! Hur ska man räkna med det?']],
    },
    {
      dur: 11,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Visare: en pil per fas');
        star(ctx, t);
        const a = prog(t, 3.5, 4.5);
        text(ctx, 'Uꜰ = 254 V', O[0] + 20, O[1] - 120, { size: 32, weight: 700, color: COL.blue, alpha: a });
        text(ctx, 'Varje pil är en fasspänning,', B.x + 540, B.y + 170, { size: 28, weight: 400, alpha: prog(t, 5, 6) });
        text(ctx, 'från N ut till fasen.', B.x + 540, B.y + 210, { size: 28, weight: 400, alpha: prog(t, 5, 6) });
        text(ctx, 'Alla är lika långa', B.x + 540, B.y + 280, { size: 28, weight: 400, alpha: prog(t, 6.5, 7.5) });
        text(ctx, 'och ligger 120° isär.', B.x + 540, B.y + 320, { size: 28, weight: 400, alpha: prog(t, 6.5, 7.5) });
      },
      say: [[0.3, 5.3, 'Sigge', 'Vi ritar varje fasspänning som en pil från neutralpunkten N. Ombord är den ungefär 254 V.'],
        [5.6, 10.8, 'Måns', 'Men mellan två faser, då? Mellan pilspetsarna?']],
    },
    {
      dur: 15,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Linjespänningen mellan L1 och L2');
        star(ctx, 9, { labels: true });
        const A = tip(0), Bp = tip(1); const M = [(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2];
        const g = prog(t, 0.4, 1.6);
        line(ctx, A[0], A[1], A[0] + (Bp[0] - A[0]) * g, A[1] + (Bp[1] - A[1]) * g, COL.red, 6);
        text(ctx, 'Uᴸ = ?', M[0] + 26, M[1] - 28, { size: 32, weight: 700, color: COL.red, alpha: prog(t, 1.2, 2) });
        // mittlinje från N till mitten av Uᴸ
        const h = prog(t, 5.2, 6.4);
        if (h > 0) line(ctx, O[0], O[1], O[0] + (M[0] - O[0]) * h, O[1] + (M[1] - O[1]) * h, COL.ink, 3, [10, 8]);
        text(ctx, '120°', O[0] + 18, O[1] - 66, { size: 26, weight: 700, alpha: prog(t, 3, 4) });
        text(ctx, '30°', A[0] + 14, A[1] + 70, { size: 26, weight: 700, alpha: prog(t, 6.5, 7.3) });
        text(ctx, 'halva Uᴸ = Uꜰ · cos 30°', B.x + 520, B.y + 380, { size: 30, weight: 700, alpha: prog(t, 9, 10) });
        text(ctx, '= Uꜰ · √3/2', B.x + 632, B.y + 425, { size: 30, weight: 700, alpha: prog(t, 11, 12) });
      },
      say: [[0.3, 4.8, 'Sigge', 'Linjespänningen är avståndet mellan två pilspetsar. Vinkeln mellan pilarna vid N är 120°.'],
        [5.0, 8.8, 'Sigge', 'Dra en linje från N rakt ner till mitten. Då blir vinkeln vid spetsen 30°.'],
        [9.0, 14.8, 'Sigge', 'Halva linjespänningen är Uꜰ · cos 30°. Och cos 30° är precis √3/2.']],
    },
    {
      dur: 13,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Två halvor');
        const x = B.x + 70;
        [[0.4, 'Uᴸ = 2 · Uꜰ · √3/2', COL.ink], [3.5, 'Uᴸ = √3 · Uꜰ', COL.blue], [7.5, '254 V · 1,732 ≈ 440 V', COL.ink]]
          .forEach(([at, s, c], i) => text(ctx, s, x, B.y + 150 + i * 105, { size: 54, weight: 700, color: c, alpha: prog(t, at, at + 0.8) }));
        text(ctx, 'Omvänt: Uꜰ = Uᴸ/√3', x, B.y + 450, { size: 32, weight: 400, color: COL.muted, alpha: prog(t, 10, 10.8) });
      },
      say: [[0.3, 3.3, 'Måns', 'Två halvor … då blir det 2 gånger √3/2!'],
        [3.5, 7.3, 'Sigge', 'Ja. Tvåorna tar ut varandra och kvar blir Uᴸ = √3 · Uꜰ.'],
        [7.5, 12.8, 'Sigge', '254 V gånger 1,732 blir 440 V. Och åt andra hållet delar man med √3.']],
    },
    {
      dur: 12, cast: (t) => ({ wave: t > 8.5 }),
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Ombord');
        const items = [['440 V mellan faserna, 254 V i varje lindning', COL.ink], ['Nätet har oftast ingen neutralledare (IT-nät)', COL.ink], ['Vid ett jordfel kan en fas ha 440 V mot skrovet', COL.orange], ['Mät med instrument för CAT III 1 000 V', COL.orange]];
        items.forEach(([s, c], i) => text(ctx, `${i + 1}.  ${s}`, B.x + 50, B.y + 140 + i * 80, { size: 33, weight: i > 1 ? 700 : 600, color: c, alpha: prog(t, 0.4 + i * 1.3, 1.1 + i * 1.3) }));
      },
      say: [[0.3, 4.6, 'Sigge', 'Ombord har 440 V-nätet oftast ingen neutralledare. Det är ett isolerat IT-nät.'],
        [4.8, 8.4, 'Måns', 'Så vid ett jordfel kan en fas ha hela 440 V mot skrovet!'],
        [8.6, 11.8, 'Sigge', 'Därför mäter vi med rätt instrument. Vi ses!']],
    },
  ],
});
