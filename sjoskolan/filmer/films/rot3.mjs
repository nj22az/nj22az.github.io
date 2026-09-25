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
  text(ctx, 'N', O[0], O[1] + 36, { size: 26, color: COL.muted, align: 'center' });
}

function arc(ctx, c, r, a0, a1, alpha) {
  if (alpha <= 0) return; ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = COL.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(c[0], c[1], r, a0, a1); ctx.stroke(); ctx.restore();
}

export default compile({
  id: 'varfor-rot-3', title: 'Varför √3?', sub: 'Fasspänning och huvudspänning i trefas', week: 'Vecka 41', deck: 'v41_01 Trefassystemets grunder',
  scenes: [
    {
      dur: 8,
      draw(ctx, t) { titleCard(ctx, t, 'Varför √3?', 'Fasspänning och linjespänning', 'Vecka 41'); },
      say: [[0.8, 7.8, 'Måns', 'Ombord mäter vi 440 V mellan två faser. Varför är det √3 gånger fasspänningen?']],
    },
    {
      dur: 14,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Tre spänningar, förskjutna 120°');
        const P = { x0: B.x + 60, y0: B.y + 90, w: B.w - 110, h: 380 };
        axes(ctx, P);
        for (let k = 0; k < 3; k++) plot(ctx, (x) => Math.sin(x - k * 2 * Math.PI / 3), { ...P, a: 0, b: 4 * Math.PI, ymax: 1.2, upto: prog(t, 0.8 + k * 1.5, 4.5 + k * 1.5), color: PH[k], width: 5 });
        [0, 1, 2].forEach((k) => text(ctx, `L${k + 1}`, P.x0 + P.w - 120 + k * 44, P.y0 + 10, { size: 28, weight: 700, color: PH[k], alpha: prog(t, 0.8 + k * 1.5, 1.8 + k * 1.5) }));
      },
      say: [[0.8, 7.8, 'Sigge', 'Generatorn har tre lindningar. De ger tre spänningar, 120° isär i tiden.'],
        [8.0, 13.8, 'Måns', 'Tre vågor samtidigt! Hur räknar man med det?']],
    },
    {
      dur: 15,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Visare: en pil per fas');
        star(ctx, t - 0.8);
        text(ctx, 'Uꜰ = 254 V', O[0] + 20, O[1] - 120, { size: 32, weight: 700, color: COL.blue, alpha: prog(t, 5, 6) });
        text(ctx, 'Varje pil är en fasspänning,', B.x + 540, B.y + 170, { size: 28, weight: 400, alpha: prog(t, 2, 3) });
        text(ctx, 'från N ut till fasen.', B.x + 540, B.y + 210, { size: 28, weight: 400, alpha: prog(t, 2, 3) });
        text(ctx, 'Alla är lika långa', B.x + 540, B.y + 280, { size: 28, weight: 400, alpha: prog(t, 6.5, 7.5) });
        text(ctx, 'och ligger 120° isär.', B.x + 540, B.y + 320, { size: 28, weight: 400, alpha: prog(t, 6.5, 7.5) });
      },
      say: [[0.8, 8.3, 'Sigge', 'Varje fasspänning ritas som en pil från neutralpunkten N. Ombord är den ungefär 254 V.'],
        [8.5, 14.8, 'Måns', 'Men mellan två faser, då? Mellan pilspetsarna?']],
    },
    {
      dur: 27,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Linjespänningen mellan L1 och L2');
        star(ctx, 9);
        const A = tip(0), Bp = tip(1); const M = [(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2];
        const g = prog(t, 0.8, 2);
        line(ctx, A[0], A[1], A[0] + (Bp[0] - A[0]) * g, A[1] + (Bp[1] - A[1]) * g, COL.red, 6);
        text(ctx, 'Uᴸ = ?', M[0] + 26, M[1] - 28, { size: 32, weight: 700, color: COL.red, alpha: prog(t, 1.5, 2.3) });
        text(ctx, 'linjespänning = huvudspänning', B.x + 520, B.y + 110, { size: 26, weight: 400, color: COL.muted, alpha: prog(t, 3, 4) });
        // 120° vid N, mellan L1 (uppåt) och L2 (330°)
        const a120 = prog(t, 8, 9);
        arc(ctx, O, 46, -Math.PI / 2, Math.PI / 6, a120);
        text(ctx, '120°', O[0] + 52, O[1] + 4, { size: 23, weight: 700, alpha: a120 });
        // mittlinjen står vinkelrätt mot Uᴸ
        const h = prog(t, 13.5, 14.7);
        if (h > 0) line(ctx, O[0], O[1], O[0] + (M[0] - O[0]) * h, O[1] + (M[1] - O[1]) * h, COL.ink, 3, [10, 8]);
        const ar = prog(t, 15.5, 16.3);
        if (ar > 0) {
          const L = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]); const u = [(Bp[0] - A[0]) / L, (Bp[1] - A[1]) / L];
          const D = Math.hypot(O[0] - M[0], O[1] - M[1]); const n = [(O[0] - M[0]) / D, (O[1] - M[1]) / D]; const q = 16;
          ctx.save(); ctx.globalAlpha = ar; ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.beginPath();
          ctx.moveTo(M[0] - u[0] * q, M[1] - u[1] * q); ctx.lineTo(M[0] - u[0] * q + n[0] * q, M[1] - u[1] * q + n[1] * q); ctx.lineTo(M[0] + n[0] * q, M[1] + n[1] * q); ctx.stroke(); ctx.restore();
          const toB = Math.atan2(Bp[1] - A[1], Bp[0] - A[0]);
          arc(ctx, A, 64, toB, Math.PI / 2, ar);
          text(ctx, '30°', A[0] + 92 * Math.cos((toB + Math.PI / 2) / 2), A[1] + 92 * Math.sin((toB + Math.PI / 2) / 2), { size: 26, weight: 700, align: 'center', alpha: ar });
        }
        text(ctx, 'halva Uᴸ = Uꜰ · cos 30°', B.x + 520, B.y + 380, { size: 30, weight: 700, alpha: prog(t, 21.5, 22.3) });
        text(ctx, '= Uꜰ · √3/2', B.x + 632, B.y + 425, { size: 30, weight: 700, alpha: prog(t, 23.5, 24.3) });
      },
      say: [[0.8, 7.8, 'Sigge', 'Linjespänningen, även kallad huvudspänning, är avståndet mellan två pilspetsar.'],
        [8.0, 13.3, 'Sigge', 'Vinkeln mellan pilarna vid N är 120°.'],
        [13.5, 21.3, 'Sigge', 'Dra en linje från N till mitten av Uᴸ. Den bildar en rät vinkel, och vid spetsen blir det 30°.'],
        [21.5, 26.8, 'Sigge', 'Halva Uᴸ är då Uꜰ · cos 30°, alltså Uꜰ · √3/2.']],
    },
    {
      dur: 17,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Två halvor');
        const x = B.x + 70;
        [[0.8, 'Uᴸ = 2 · Uꜰ · √3/2', COL.ink], [5.5, 'Uᴸ = √3 · Uꜰ', COL.blue], [10.5, '254 V · 1,732 ≈ 440 V', COL.ink]]
          .forEach(([at, s, c], i) => text(ctx, s, x, B.y + 150 + i * 105, { size: 54, weight: 700, color: c, alpha: prog(t, at, at + 0.8) }));
        text(ctx, 'Omvänt: Uꜰ = Uᴸ/√3', x, B.y + 450, { size: 32, weight: 400, color: COL.muted, alpha: prog(t, 13.5, 14.3) });
      },
      say: [[0.8, 5.3, 'Måns', 'Två halvor … då blir det 2 · √3/2!'],
        [5.5, 10.3, 'Sigge', 'Tvåorna tar ut varandra: Uᴸ = √3 · Uꜰ.'],
        [10.5, 16.8, 'Sigge', '254 V · 1,732 ≈ 440 V. Åt andra hållet delar man med √3.']],
    },
    {
      dur: 27, cast: (t) => ({ wave: t > 24 }),
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Ombord');
        const items = [['440 V mellan faserna, 254 V i varje lindning', COL.ink], ['IT-nät: oftast ingen neutralledare', COL.ink], ['Första jordfelet: normalt larm, inte utlösning', COL.ink], ['Jordfel på en fas: de andra får 440 V mot skrovet', COL.orange], ['Ett andra jordfel blir kortslutning: leta upp felet', COL.orange]];
        const at = [0.8, 3, 7.5, 13.5, 18.5];
        items.forEach(([s, c], i) => text(ctx, `${i + 1}.  ${s}`, B.x + 40, B.y + 125 + i * 74, { size: 30, weight: c === COL.orange ? 700 : 600, color: c, alpha: prog(t, at[i], at[i] + 0.7) }));
      },
      say: [[0.8, 7.3, 'Sigge', 'Ombord är 440 V-nätet oftast ett IT-nät utan neutralledare.'],
        [7.5, 13.3, 'Sigge', 'Första jordfelet ger normalt bara larm från isolationsvakten.'],
        [13.5, 18.3, 'Måns', 'Och de andra faserna får 440 V mot skrovet!'],
        [18.5, 23.8, 'Sigge', 'Ett andra jordfel blir en kortslutning. Leta upp felet direkt.'],
        [24.0, 26.8, 'Sigge', 'Vi ses i nästa film!']],
    },
  ],
});
