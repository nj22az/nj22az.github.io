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
      dur: 7,
      draw(ctx, t) { titleCard(ctx, t, 'Varför √2?', 'Toppvärde och effektivvärde', 'Vecka 40'); },
      say: [[0.8, 6.8, 'Måns', 'Det står 230 V på skylten, men toppen är 325 V. Varför?']],
    },
    {
      dur: 13,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Spänningen i ett 230 V-uttag');
        axes(ctx, P);
        text(ctx, 'u', P.x0 - 30, P.y0 + 6, { size: 28, color: COL.muted, weight: 400 });
        text(ctx, 't', P.x0 + P.w + 10, P.y0 + P.h / 2, { size: 28, color: COL.muted, weight: 400 });
        plot(ctx, (x) => TOP * Math.sin(x), { ...P, a: 0, b: 4 * Math.PI, ymax: 380, upto: prog(t, 0.8, 5.5), color: COL.blue });
        const a = prog(t, 7, 8);
        if (a > 0) {
          const y = P.y0 + P.h / 2 - (TOP / 380) * (P.h / 2);
          ctx.save(); ctx.globalAlpha = a;
          line(ctx, P.x0, y, P.x0 + P.w, y, COL.ink, 2, [8, 7]);
          text(ctx, 'û = 325 V', P.x0 + P.w - 4, y - 22, { size: 30, align: 'right', weight: 700 });
          ctx.restore();
        }
        text(ctx, '50 Hz i land, 60 Hz ombord', P.x0 + 10, P.y0 + P.h - 6, { size: 24, color: COL.muted, weight: 400, alpha: prog(t, 2.5, 3.5) });
      },
      say: [[0.8, 6.8, 'Sigge', 'Spänningen svänger: 50 gånger i sekunden i land, 60 gånger ombord.'],
        [7.0, 12.8, 'Måns', 'Toppen är 325 V! Varför står det 230 V då?']],
    },
    {
      dur: 17,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Värmen följer u² och är aldrig negativ');
        const Q = { ...P, y0: P.y0 + 30, h: 330 };
        line(ctx, Q.x0, Q.y0 + Q.h, Q.x0 + Q.w, Q.y0 + Q.h, '#9fb2c1', 2); line(ctx, Q.x0, Q.y0 - 20, Q.x0, Q.y0 + Q.h, '#9fb2c1', 2);
        text(ctx, 'u²', Q.x0 - 12, Q.y0 - 44, { size: 28, color: COL.muted, weight: 400 });
        text(ctx, '0', Q.x0 - 26, Q.y0 + Q.h, { size: 24, color: COL.muted, weight: 400 });
        // u² ritas som 2·sin² − 1 på skalan −1…1, så att 0 hamnar exakt på underkanten
        plot(ctx, (x) => 2 * Math.sin(x) ** 2 - 1, { ...Q, a: 0, b: 4 * Math.PI, ymax: 1, upto: prog(t, 0.8, 5), color: COL.orange, fill: 'rgba(200,100,30,.14)' });
        text(ctx, 'û²', Q.x0 - 46, Q.y0 + 4, { size: 26, alpha: prog(t, 3, 4) });
        line(ctx, Q.x0 - 6, Q.y0, Q.x0, Q.y0, '#9fb2c1', 2);
        const a = prog(t, 8.5, 9.5);
        if (a > 0) {
          const my = Q.y0 + Q.h / 2;
          ctx.save(); ctx.globalAlpha = a;
          line(ctx, Q.x0, my, Q.x0 + Q.w, my, COL.ink, 3, [10, 8]);
          roundRect(ctx, Q.x0 + Q.w - 250, my - 64, 250, 46, 10, 'rgba(255,255,255,.92)');
          text(ctx, 'medel = û²/2', Q.x0 + Q.w - 10, my - 40, { size: 30, weight: 700, align: 'right' });
          ctx.restore();
        }
      },
      say: [[0.8, 8.3, 'Sigge', 'Ett element värms lika mycket oavsett strömriktning. Effekten beror på u², och u² är aldrig negativ.'],
        [8.5, 16.8, 'Sigge', 'Kurvan u² svänger mellan 0 och û². Medelvärdet blir precis hälften: û²/2.']],
    },
    {
      dur: 18,
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Samma värme som likspänningen U');
        const x = B.x + 70; const rows = [[0.8, 'U² = û²/2', COL.ink], [5.2, 'U = û/√2', COL.blue], [10.5, 'U = 325 V / 1,414 ≈ 230 V', COL.ink]];
        rows.forEach(([at, s, c], i) => text(ctx, s, x, B.y + 150 + i * 100, { size: 52, weight: 700, color: c, alpha: prog(t, at, at + 0.8) }));
        text(ctx, 'U kallas effektivvärde eller RMS-värde.', x, B.y + 440, { size: 30, color: COL.muted, weight: 400, alpha: prog(t, 13, 13.8) });
      },
      say: [[0.8, 5.0, 'Sigge', 'Likspänningen U med samma värme har U² = û²/2.'],
        [5.2, 10.3, 'Måns', 'Roten ur en halv … då delar man med √2!'],
        [10.5, 17.8, 'Sigge', '325 V delat med 1,414 blir ungefär 230 V. Det är effektivvärdet på skylten.']],
    },
    {
      dur: 22, cast: (t) => ({ wave: t > 18.5 }),
      draw(ctx, t) {
        stage(ctx, t); heading(ctx, 'Kom ihåg');
        const items = [['û är toppvärdet, U är effektivvärdet', COL.ink], ['U = û/√2 ≈ 0,707 · û', COL.ink], ['True RMS visar rätt U även vid förvrängd kurva', COL.ink], ['440 V ombord har toppen û ≈ 622 V', COL.orange], ['Isolationen påverkas av toppvärdet och transienter', COL.orange]];
        const at = [0.6, 1.4, 1.8, 7.5, 12.5];
        items.forEach(([s, c], i) => text(ctx, `${i + 1}.  ${s}`, B.x + 50, B.y + 125 + i * 74, { size: 33, weight: c === COL.orange ? 700 : 600, color: c, alpha: prog(t, at[i], at[i] + 0.7) }));
      },
      say: [[0.8, 7.3, 'Sigge', 'Formeln gäller ren sinus. Efter frekvensomriktare behövs en true RMS-multimeter.'],
        [7.5, 12.3, 'Måns', 'Och 440 V ombord har toppen 622 V!'],
        [12.5, 18.3, 'Sigge', 'Isolationen påverkas av toppen och av transienter, inte bara av 230 V.'],
        [18.5, 21.8, 'Sigge', 'Vi ses i nästa film!']],
    },
  ],
});
