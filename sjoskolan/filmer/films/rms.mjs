// Film: Varför √2? Effektivvärde för sinusspänning (v40_01)
import { COL, BOARD as B, stage, titleCard, text, line, plot, axes, prog, compile, roundRect } from '../engine.mjs';

const TOP = 325; // toppvärde för 230 V
const heading = (ctx, s) => text(ctx, s, B.x + 34, B.y + 46, { size: 32, weight: 700 });
// Plottytan på tavlan
const P = { x0: B.x + 90, y0: B.y + 96, w: B.w - 150, h: 360 };

export default compile({
  id: 'varfor-rot-2', title: 'Varför √2?', sub: 'Toppvärde och effektivvärde för växelspänning', week: 'Vecka 40', deck: 'v40_01 Sinusformad växelspänning',
  scenes: [
    {
      dur: 6, cast: (t) => ({ wave: t < 3 }),
      draw(ctx, t) { titleCard(ctx, t, 'Varför √2?', 'Toppvärde och effektivvärde', 'Vecka 40'); },
      say: [[0.5, 5.8, 'Sigge', 'Hej! Jag är matrosen Sigge, och det här är måsen Måns. I dag: varför 230 V har en topp på 325 V.']],
    },
    {
      dur: 11,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Spänningen i ett 230 V-uttag');
        axes(ctx, P);
        text(ctx, 'u', P.x0 - 30, P.y0 + 6, { size: 28, color: COL.muted, weight: 400 });
        text(ctx, 't', P.x0 + P.w + 10, P.y0 + P.h / 2, { size: 28, color: COL.muted, weight: 400 });
        const up = prog(t, 0.6, 5);
        plot(ctx, (x) => TOP * Math.sin(x), { ...P, a: 0, b: 4 * Math.PI, ymax: 380, upto: up, color: COL.blue });
        const a = prog(t, 5.5, 6.5);
        if (a > 0) {
          const y = P.y0 + P.h / 2 - (TOP / 380) * (P.h / 2);
          ctx.save(); ctx.globalAlpha = a;
          line(ctx, P.x0, y, P.x0 + P.w, y, COL.ink, 2, [8, 7]);
          text(ctx, 'Û = 325 V', P.x0 + P.w - 4, y - 22, { size: 30, align: 'right', weight: 700 });
          ctx.restore();
        }
        text(ctx, '50 perioder per sekund', P.x0 + 10, P.y0 + P.h - 6, { size: 24, color: COL.muted, weight: 400, alpha: prog(t, 2, 3) });
      },
      say: [[0.3, 5.3, 'Sigge', 'Spänningen i ett 230 V-uttag svänger fram och tillbaka, 50 gånger i sekunden.'],
        [5.5, 10.8, 'Måns', 'Men toppen är ju 325 V! Varför står det 230 V då?']],
    },
    {
      dur: 13,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Värmen följer u² och är alltid positiv');
        const Q = { ...P, y0: P.y0 + 10, h: 340 };
        line(ctx, Q.x0, Q.y0 + Q.h, Q.x0 + Q.w, Q.y0 + Q.h, '#9fb2c1', 2); line(ctx, Q.x0, Q.y0, Q.x0, Q.y0 + Q.h, '#9fb2c1', 2);
        text(ctx, 'u²', Q.x0 - 36, Q.y0 + 6, { size: 28, color: COL.muted, weight: 400 });
        text(ctx, '0', Q.x0 - 26, Q.y0 + Q.h, { size: 24, color: COL.muted, weight: 400 });
        // u² ritas som 2·sin² − 1 på skalan −1…1, så att 0 hamnar vid underkanten
        plot(ctx, (x) => 2 * Math.sin(x) ** 2 - 1, { ...Q, a: 0, b: 4 * Math.PI, ymax: 1.08, upto: prog(t, 0.5, 4.5), color: COL.orange, fill: 'rgba(200,100,30,.14)' });
        const topY = Q.y0 + Q.h / 2 - (1 / 1.08) * (Q.h / 2);
        text(ctx, 'Û²', Q.x0 + 8, topY - 20, { size: 26, alpha: prog(t, 3, 4) });
        const a = prog(t, 6.5, 7.5);
        if (a > 0) {
          const my = Q.y0 + Q.h / 2;
          ctx.save(); ctx.globalAlpha = a;
          line(ctx, Q.x0, my, Q.x0 + Q.w, my, COL.ink, 3, [10, 8]);
          roundRect(ctx, Q.x0 + Q.w - 250, my - 64, 250, 46, 10, 'rgba(255,255,255,.92)');
          text(ctx, 'medel = Û²/2', Q.x0 + Q.w - 10, my - 40, { size: 30, weight: 700, align: 'right' });
          ctx.restore();
        }
      },
      say: [[0.3, 6.2, 'Sigge', 'Ett värmeelement blir lika varmt åt båda hållen. Värmen beror på u², och u² är aldrig negativ.'],
        [6.5, 12.8, 'Sigge', 'Kurvan u² svänger mellan 0 och Û². Medelvärdet blir precis hälften: Û²/2.']],
    },
    {
      dur: 14,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Samma värme som likspänningen U');
        const x = B.x + 70; const rows = [
          [0.4, 'U² = Û²/2', COL.ink],
          [3.2, 'U = Û/√2', COL.blue],
          [7.0, 'U = 325 V / 1,414 ≈ 230 V', COL.ink],
        ];
        rows.forEach(([at, s, c], i) => text(ctx, s, x, B.y + 150 + i * 100, { size: 52, weight: 700, color: c, alpha: prog(t, at, at + 0.8) }));
        text(ctx, 'U kallas effektivvärde eller RMS-värde.', x, B.y + 440, { size: 30, color: COL.muted, weight: 400, alpha: prog(t, 9.5, 10.3) });
      },
      say: [[0.3, 3.0, 'Sigge', 'Likspänningen U som ger samma värme har U² = Û²/2.'],
        [3.2, 6.8, 'Måns', 'Roten ur en halv … då delar man med √2!'],
        [7.0, 13.8, 'Sigge', 'Precis. 325 V delat med 1,414 blir ungefär 230 V. Det är effektivvärdet som står på skylten.']],
    },
    {
      dur: 12, cast: (t) => ({ wave: t > 8.5 }),
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Kom ihåg');
        const items = ['Û är toppvärdet, U är effektivvärdet', 'U = Û/√2 ≈ 0,707 · Û', 'En true RMS-multimeter visar U', 'Isolationen ska tåla toppvärdet Û'];
        items.forEach((s, i) => text(ctx, `${i + 1}.  ${s}`, B.x + 60, B.y + 140 + i * 80, { size: 36, weight: i === 3 ? 700 : 600, color: i === 3 ? COL.orange : COL.ink, alpha: prog(t, 0.4 + i * 1.2, 1.1 + i * 1.2) }));
      },
      say: [[0.3, 4.8, 'Sigge', 'Formeln gäller för ren sinus. En true RMS-multimeter visar effektivvärdet.'],
        [5.0, 8.4, 'Måns', 'Och isolationen ska klara toppen, inte bara 230 V!'],
        [8.6, 11.8, 'Sigge', 'Bra, Måns. Vi ses i nästa film!']],
    },
  ],
});
